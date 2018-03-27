
/*
Requires https://github.com/FriendsOfPHP/PHP-CS-Fixer
 */

(function() {
  "use strict";
  var Beautifier, PHPCSFixer, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  module.exports = PHPCSFixer = (function(superClass) {
    extend(PHPCSFixer, superClass);

    function PHPCSFixer() {
      return PHPCSFixer.__super__.constructor.apply(this, arguments);
    }

    PHPCSFixer.prototype.name = 'PHP-CS-Fixer';

    PHPCSFixer.prototype.link = "https://github.com/FriendsOfPHP/PHP-CS-Fixer";

    PHPCSFixer.prototype.isPreInstalled = false;

    PHPCSFixer.prototype.options = {
      PHP: {
        rules: true,
        cs_fixer_path: true,
        cs_fixer_version: true,
        allow_risky: true,
        level: true,
        fixers: true
      }
    };

    PHPCSFixer.prototype.beautify = function(text, language, options, context) {
      var configFile, phpCsFixerOptions, runOptions, version;
      this.debug('php-cs-fixer', options);
      version = options.cs_fixer_version;
      configFile = (context != null) && (context.filePath != null) ? this.findFile(path.dirname(context.filePath), '.php_cs') : void 0;
      phpCsFixerOptions = ["fix", options.rules ? "--rules=" + options.rules : void 0, configFile ? "--config=" + configFile : void 0, options.allow_risky ? "--allow-risky=" + options.allow_risky : void 0, "--using-cache=no"];
      if (version === 1) {
        phpCsFixerOptions = ["fix", options.level ? "--level=" + options.level : void 0, options.fixers ? "--fixers=" + options.fixers : void 0, configFile ? "--config-file=" + configFile : void 0];
      }
      runOptions = {
        ignoreReturnCode: true,
        help: {
          link: "https://github.com/FriendsOfPHP/PHP-CS-Fixer"
        }
      };
      return this.Promise.all([options.cs_fixer_path ? this.which(options.cs_fixer_path) : void 0, this.which('php-cs-fixer')]).then((function(_this) {
        return function(paths) {
          var _, phpCSFixerPath, tempFile;
          _this.debug('php-cs-fixer paths', paths);
          _ = require('lodash');
          phpCSFixerPath = _.find(paths, function(p) {
            return p && path.isAbsolute(p);
          });
          _this.verbose('phpCSFixerPath', phpCSFixerPath);
          _this.debug('phpCSFixerPath', phpCSFixerPath, paths);
          if (phpCSFixerPath != null) {
            tempFile = _this.tempFile("temp", text);
            if (_this.isWindows) {
              return _this.run("php", [phpCSFixerPath, phpCsFixerOptions, tempFile], runOptions).then(function() {
                return _this.readFile(tempFile);
              });
            } else {
              return _this.run(phpCSFixerPath, [phpCsFixerOptions, tempFile], runOptions).then(function() {
                return _this.readFile(tempFile);
              });
            }
          } else {
            _this.verbose('php-cs-fixer not found!');
            return _this.Promise.reject(_this.commandNotFoundError('php-cs-fixer', {
              link: "https://github.com/FriendsOfPHP/PHP-CS-Fixer",
              program: "php-cs-fixer.phar",
              pathOption: "PHP - CS Fixer Path"
            }));
          }
        };
      })(this));
    };

    return PHPCSFixer;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcGhwLWNzLWZpeGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSw0QkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3lCQUVyQixJQUFBLEdBQU07O3lCQUNOLElBQUEsR0FBTTs7eUJBQ04sY0FBQSxHQUFnQjs7eUJBRWhCLE9BQUEsR0FDRTtNQUFBLEdBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxJQUFQO1FBQ0EsYUFBQSxFQUFlLElBRGY7UUFFQSxnQkFBQSxFQUFrQixJQUZsQjtRQUdBLFdBQUEsRUFBYSxJQUhiO1FBSUEsS0FBQSxFQUFPLElBSlA7UUFLQSxNQUFBLEVBQVEsSUFMUjtPQURGOzs7eUJBUUYsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsRUFBMEIsT0FBMUI7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxjQUFQLEVBQXVCLE9BQXZCO01BQ0EsT0FBQSxHQUFVLE9BQU8sQ0FBQztNQUVsQixVQUFBLEdBQWdCLGlCQUFBLElBQWEsMEJBQWhCLEdBQXVDLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxPQUFPLENBQUMsUUFBckIsQ0FBVixFQUEwQyxTQUExQyxDQUF2QyxHQUFBO01BQ2IsaUJBQUEsR0FBb0IsQ0FDbEIsS0FEa0IsRUFFWSxPQUFPLENBQUMsS0FBdEMsR0FBQSxVQUFBLEdBQVcsT0FBTyxDQUFDLEtBQW5CLEdBQUEsTUFGa0IsRUFHVSxVQUE1QixHQUFBLFdBQUEsR0FBWSxVQUFaLEdBQUEsTUFIa0IsRUFJd0IsT0FBTyxDQUFDLFdBQWxELEdBQUEsZ0JBQUEsR0FBaUIsT0FBTyxDQUFDLFdBQXpCLEdBQUEsTUFKa0IsRUFLbEIsa0JBTGtCO01BT3BCLElBQUcsT0FBQSxLQUFXLENBQWQ7UUFDRSxpQkFBQSxHQUFvQixDQUNsQixLQURrQixFQUVZLE9BQU8sQ0FBQyxLQUF0QyxHQUFBLFVBQUEsR0FBVyxPQUFPLENBQUMsS0FBbkIsR0FBQSxNQUZrQixFQUdjLE9BQU8sQ0FBQyxNQUF4QyxHQUFBLFdBQUEsR0FBWSxPQUFPLENBQUMsTUFBcEIsR0FBQSxNQUhrQixFQUllLFVBQWpDLEdBQUEsZ0JBQUEsR0FBaUIsVUFBakIsR0FBQSxNQUprQixFQUR0Qjs7TUFPQSxVQUFBLEdBQWE7UUFDWCxnQkFBQSxFQUFrQixJQURQO1FBRVgsSUFBQSxFQUFNO1VBQ0osSUFBQSxFQUFNLDhDQURGO1NBRks7O2FBUWIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsQ0FDc0IsT0FBTyxDQUFDLGFBQXpDLEdBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxPQUFPLENBQUMsYUFBZixDQUFBLEdBQUEsTUFEVyxFQUVYLElBQUMsQ0FBQSxLQUFELENBQU8sY0FBUCxDQUZXLENBQWIsQ0FHRSxDQUFDLElBSEgsQ0FHUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtBQUNOLGNBQUE7VUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLG9CQUFQLEVBQTZCLEtBQTdCO1VBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSO1VBRUosY0FBQSxHQUFpQixDQUFDLENBQUMsSUFBRixDQUFPLEtBQVAsRUFBYyxTQUFDLENBQUQ7bUJBQU8sQ0FBQSxJQUFNLElBQUksQ0FBQyxVQUFMLENBQWdCLENBQWhCO1VBQWIsQ0FBZDtVQUNqQixLQUFDLENBQUEsT0FBRCxDQUFTLGdCQUFULEVBQTJCLGNBQTNCO1VBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTyxnQkFBUCxFQUF5QixjQUF6QixFQUF5QyxLQUF6QztVQUdBLElBQUcsc0JBQUg7WUFFRSxRQUFBLEdBQVcsS0FBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCO1lBRVgsSUFBRyxLQUFDLENBQUEsU0FBSjtxQkFDRSxLQUFDLENBQUEsR0FBRCxDQUFLLEtBQUwsRUFBWSxDQUFDLGNBQUQsRUFBaUIsaUJBQWpCLEVBQW9DLFFBQXBDLENBQVosRUFBMkQsVUFBM0QsQ0FDRSxDQUFDLElBREgsQ0FDUSxTQUFBO3VCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtjQURJLENBRFIsRUFERjthQUFBLE1BQUE7cUJBTUUsS0FBQyxDQUFBLEdBQUQsQ0FBSyxjQUFMLEVBQXFCLENBQUMsaUJBQUQsRUFBb0IsUUFBcEIsQ0FBckIsRUFBb0QsVUFBcEQsQ0FDRSxDQUFDLElBREgsQ0FDUSxTQUFBO3VCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtjQURJLENBRFIsRUFORjthQUpGO1dBQUEsTUFBQTtZQWVFLEtBQUMsQ0FBQSxPQUFELENBQVMseUJBQVQ7bUJBRUEsS0FBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEtBQUMsQ0FBQSxvQkFBRCxDQUNkLGNBRGMsRUFFZDtjQUNFLElBQUEsRUFBTSw4Q0FEUjtjQUVFLE9BQUEsRUFBUyxtQkFGWDtjQUdFLFVBQUEsRUFBWSxxQkFIZDthQUZjLENBQWhCLEVBakJGOztRQVRNO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhSO0lBM0JROzs7O0tBZjhCO0FBUjFDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQSFBDU0ZpeGVyIGV4dGVuZHMgQmVhdXRpZmllclxuXG4gIG5hbWU6ICdQSFAtQ1MtRml4ZXInXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOlxuICAgIFBIUDpcbiAgICAgIHJ1bGVzOiB0cnVlXG4gICAgICBjc19maXhlcl9wYXRoOiB0cnVlXG4gICAgICBjc19maXhlcl92ZXJzaW9uOiB0cnVlXG4gICAgICBhbGxvd19yaXNreTogdHJ1ZVxuICAgICAgbGV2ZWw6IHRydWVcbiAgICAgIGZpeGVyczogdHJ1ZVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMsIGNvbnRleHQpIC0+XG4gICAgQGRlYnVnKCdwaHAtY3MtZml4ZXInLCBvcHRpb25zKVxuICAgIHZlcnNpb24gPSBvcHRpb25zLmNzX2ZpeGVyX3ZlcnNpb25cblxuICAgIGNvbmZpZ0ZpbGUgPSBpZiBjb250ZXh0PyBhbmQgY29udGV4dC5maWxlUGF0aD8gdGhlbiBAZmluZEZpbGUocGF0aC5kaXJuYW1lKGNvbnRleHQuZmlsZVBhdGgpLCAnLnBocF9jcycpXG4gICAgcGhwQ3NGaXhlck9wdGlvbnMgPSBbXG4gICAgICBcImZpeFwiXG4gICAgICBcIi0tcnVsZXM9I3tvcHRpb25zLnJ1bGVzfVwiIGlmIG9wdGlvbnMucnVsZXNcbiAgICAgIFwiLS1jb25maWc9I3tjb25maWdGaWxlfVwiIGlmIGNvbmZpZ0ZpbGVcbiAgICAgIFwiLS1hbGxvdy1yaXNreT0je29wdGlvbnMuYWxsb3dfcmlza3l9XCIgaWYgb3B0aW9ucy5hbGxvd19yaXNreVxuICAgICAgXCItLXVzaW5nLWNhY2hlPW5vXCJcbiAgICBdXG4gICAgaWYgdmVyc2lvbiBpcyAxXG4gICAgICBwaHBDc0ZpeGVyT3B0aW9ucyA9IFtcbiAgICAgICAgXCJmaXhcIlxuICAgICAgICBcIi0tbGV2ZWw9I3tvcHRpb25zLmxldmVsfVwiIGlmIG9wdGlvbnMubGV2ZWxcbiAgICAgICAgXCItLWZpeGVycz0je29wdGlvbnMuZml4ZXJzfVwiIGlmIG9wdGlvbnMuZml4ZXJzXG4gICAgICAgIFwiLS1jb25maWctZmlsZT0je2NvbmZpZ0ZpbGV9XCIgaWYgY29uZmlnRmlsZVxuICAgICAgXVxuICAgIHJ1bk9wdGlvbnMgPSB7XG4gICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlXG4gICAgICBoZWxwOiB7XG4gICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcIlxuICAgICAgfVxuICAgIH1cblxuICAgICMgRmluZCBwaHAtY3MtZml4ZXIucGhhciBzY3JpcHRcbiAgICBAUHJvbWlzZS5hbGwoW1xuICAgICAgQHdoaWNoKG9wdGlvbnMuY3NfZml4ZXJfcGF0aCkgaWYgb3B0aW9ucy5jc19maXhlcl9wYXRoXG4gICAgICBAd2hpY2goJ3BocC1jcy1maXhlcicpXG4gICAgXSkudGhlbigocGF0aHMpID0+XG4gICAgICBAZGVidWcoJ3BocC1jcy1maXhlciBwYXRocycsIHBhdGhzKVxuICAgICAgXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbiAgICAgICMgR2V0IGZpcnN0IHZhbGlkLCBhYnNvbHV0ZSBwYXRoXG4gICAgICBwaHBDU0ZpeGVyUGF0aCA9IF8uZmluZChwYXRocywgKHApIC0+IHAgYW5kIHBhdGguaXNBYnNvbHV0ZShwKSApXG4gICAgICBAdmVyYm9zZSgncGhwQ1NGaXhlclBhdGgnLCBwaHBDU0ZpeGVyUGF0aClcbiAgICAgIEBkZWJ1ZygncGhwQ1NGaXhlclBhdGgnLCBwaHBDU0ZpeGVyUGF0aCwgcGF0aHMpXG5cbiAgICAgICMgQ2hlY2sgaWYgUEhQLUNTLUZpeGVyIHBhdGggd2FzIGZvdW5kXG4gICAgICBpZiBwaHBDU0ZpeGVyUGF0aD9cbiAgICAgICAgIyBGb3VuZCBQSFAtQ1MtRml4ZXIgcGF0aFxuICAgICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dClcblxuICAgICAgICBpZiBAaXNXaW5kb3dzXG4gICAgICAgICAgQHJ1bihcInBocFwiLCBbcGhwQ1NGaXhlclBhdGgsIHBocENzRml4ZXJPcHRpb25zLCB0ZW1wRmlsZV0sIHJ1bk9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbig9PlxuICAgICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAcnVuKHBocENTRml4ZXJQYXRoLCBbcGhwQ3NGaXhlck9wdGlvbnMsIHRlbXBGaWxlXSwgcnVuT3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICAgIClcbiAgICAgIGVsc2VcbiAgICAgICAgQHZlcmJvc2UoJ3BocC1jcy1maXhlciBub3QgZm91bmQhJylcbiAgICAgICAgIyBDb3VsZCBub3QgZmluZCBQSFAtQ1MtRml4ZXIgcGF0aFxuICAgICAgICBAUHJvbWlzZS5yZWplY3QoQGNvbW1hbmROb3RGb3VuZEVycm9yKFxuICAgICAgICAgICdwaHAtY3MtZml4ZXInXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXG4gICAgICAgICAgICBwcm9ncmFtOiBcInBocC1jcy1maXhlci5waGFyXCJcbiAgICAgICAgICAgIHBhdGhPcHRpb246IFwiUEhQIC0gQ1MgRml4ZXIgUGF0aFwiXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgIClcbiJdfQ==
