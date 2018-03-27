
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
      PHP: true
    };

    PHPCSFixer.prototype.beautify = function(text, language, options, context) {
      var configFile, phpCsFixerOptions, runOptions;
      this.debug('php-cs-fixer', options);
      configFile = (context != null) && (context.filePath != null) ? this.findFile(path.dirname(context.filePath), '.php_cs') : void 0;
      phpCsFixerOptions = ["fix", options.rules ? "--rules=" + options.rules : void 0, configFile ? "--config=" + configFile : void 0, "--using-cache=no"];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcGhwLWNzLWZpeGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSw0QkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3lCQUVyQixJQUFBLEdBQU07O3lCQUNOLElBQUEsR0FBTTs7eUJBQ04sY0FBQSxHQUFnQjs7eUJBRWhCLE9BQUEsR0FDRTtNQUFBLEdBQUEsRUFBSyxJQUFMOzs7eUJBRUYsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsRUFBMEIsT0FBMUI7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxjQUFQLEVBQXVCLE9BQXZCO01BRUEsVUFBQSxHQUFnQixpQkFBQSxJQUFhLDBCQUFoQixHQUF1QyxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBTyxDQUFDLFFBQXJCLENBQVYsRUFBMEMsU0FBMUMsQ0FBdkMsR0FBQTtNQUNiLGlCQUFBLEdBQW9CLENBQ2xCLEtBRGtCLEVBRVksT0FBTyxDQUFDLEtBQXRDLEdBQUEsVUFBQSxHQUFXLE9BQU8sQ0FBQyxLQUFuQixHQUFBLE1BRmtCLEVBR1UsVUFBNUIsR0FBQSxXQUFBLEdBQVksVUFBWixHQUFBLE1BSGtCLEVBSWxCLGtCQUprQjtNQU1wQixVQUFBLEdBQWE7UUFDWCxnQkFBQSxFQUFrQixJQURQO1FBRVgsSUFBQSxFQUFNO1VBQ0osSUFBQSxFQUFNLDhDQURGO1NBRks7O2FBUWIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsQ0FDc0IsT0FBTyxDQUFDLGFBQXpDLEdBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxPQUFPLENBQUMsYUFBZixDQUFBLEdBQUEsTUFEVyxFQUVYLElBQUMsQ0FBQSxLQUFELENBQU8sY0FBUCxDQUZXLENBQWIsQ0FHRSxDQUFDLElBSEgsQ0FHUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtBQUNOLGNBQUE7VUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLG9CQUFQLEVBQTZCLEtBQTdCO1VBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSO1VBRUosY0FBQSxHQUFpQixDQUFDLENBQUMsSUFBRixDQUFPLEtBQVAsRUFBYyxTQUFDLENBQUQ7bUJBQU8sQ0FBQSxJQUFNLElBQUksQ0FBQyxVQUFMLENBQWdCLENBQWhCO1VBQWIsQ0FBZDtVQUNqQixLQUFDLENBQUEsT0FBRCxDQUFTLGdCQUFULEVBQTJCLGNBQTNCO1VBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTyxnQkFBUCxFQUF5QixjQUF6QixFQUF5QyxLQUF6QztVQUdBLElBQUcsc0JBQUg7WUFFRSxRQUFBLEdBQVcsS0FBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCO1lBRVgsSUFBRyxLQUFDLENBQUEsU0FBSjtxQkFDRSxLQUFDLENBQUEsR0FBRCxDQUFLLEtBQUwsRUFBWSxDQUFDLGNBQUQsRUFBaUIsaUJBQWpCLEVBQW9DLFFBQXBDLENBQVosRUFBMkQsVUFBM0QsQ0FDRSxDQUFDLElBREgsQ0FDUSxTQUFBO3VCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtjQURJLENBRFIsRUFERjthQUFBLE1BQUE7cUJBTUUsS0FBQyxDQUFBLEdBQUQsQ0FBSyxjQUFMLEVBQXFCLENBQUMsaUJBQUQsRUFBb0IsUUFBcEIsQ0FBckIsRUFBb0QsVUFBcEQsQ0FDRSxDQUFDLElBREgsQ0FDUSxTQUFBO3VCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtjQURJLENBRFIsRUFORjthQUpGO1dBQUEsTUFBQTtZQWVFLEtBQUMsQ0FBQSxPQUFELENBQVMseUJBQVQ7bUJBRUEsS0FBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEtBQUMsQ0FBQSxvQkFBRCxDQUNkLGNBRGMsRUFFZDtjQUNFLElBQUEsRUFBTSw4Q0FEUjtjQUVFLE9BQUEsRUFBUyxtQkFGWDtjQUdFLFVBQUEsRUFBWSxxQkFIZDthQUZjLENBQWhCLEVBakJGOztRQVRNO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhSO0lBbEJROzs7O0tBVDhCO0FBUjFDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQSFBDU0ZpeGVyIGV4dGVuZHMgQmVhdXRpZmllclxuXG4gIG5hbWU6ICdQSFAtQ1MtRml4ZXInXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOlxuICAgIFBIUDogdHJ1ZVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMsIGNvbnRleHQpIC0+XG4gICAgQGRlYnVnKCdwaHAtY3MtZml4ZXInLCBvcHRpb25zKVxuXG4gICAgY29uZmlnRmlsZSA9IGlmIGNvbnRleHQ/IGFuZCBjb250ZXh0LmZpbGVQYXRoPyB0aGVuIEBmaW5kRmlsZShwYXRoLmRpcm5hbWUoY29udGV4dC5maWxlUGF0aCksICcucGhwX2NzJylcbiAgICBwaHBDc0ZpeGVyT3B0aW9ucyA9IFtcbiAgICAgIFwiZml4XCJcbiAgICAgIFwiLS1ydWxlcz0je29wdGlvbnMucnVsZXN9XCIgaWYgb3B0aW9ucy5ydWxlc1xuICAgICAgXCItLWNvbmZpZz0je2NvbmZpZ0ZpbGV9XCIgaWYgY29uZmlnRmlsZVxuICAgICAgXCItLXVzaW5nLWNhY2hlPW5vXCJcbiAgICBdXG4gICAgcnVuT3B0aW9ucyA9IHtcbiAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgIGhlbHA6IHtcbiAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXG4gICAgICB9XG4gICAgfVxuXG4gICAgIyBGaW5kIHBocC1jcy1maXhlci5waGFyIHNjcmlwdFxuICAgIEBQcm9taXNlLmFsbChbXG4gICAgICBAd2hpY2gob3B0aW9ucy5jc19maXhlcl9wYXRoKSBpZiBvcHRpb25zLmNzX2ZpeGVyX3BhdGhcbiAgICAgIEB3aGljaCgncGhwLWNzLWZpeGVyJylcbiAgICBdKS50aGVuKChwYXRocykgPT5cbiAgICAgIEBkZWJ1ZygncGhwLWNzLWZpeGVyIHBhdGhzJywgcGF0aHMpXG4gICAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgICAgIyBHZXQgZmlyc3QgdmFsaWQsIGFic29sdXRlIHBhdGhcbiAgICAgIHBocENTRml4ZXJQYXRoID0gXy5maW5kKHBhdGhzLCAocCkgLT4gcCBhbmQgcGF0aC5pc0Fic29sdXRlKHApIClcbiAgICAgIEB2ZXJib3NlKCdwaHBDU0ZpeGVyUGF0aCcsIHBocENTRml4ZXJQYXRoKVxuICAgICAgQGRlYnVnKCdwaHBDU0ZpeGVyUGF0aCcsIHBocENTRml4ZXJQYXRoLCBwYXRocylcblxuICAgICAgIyBDaGVjayBpZiBQSFAtQ1MtRml4ZXIgcGF0aCB3YXMgZm91bmRcbiAgICAgIGlmIHBocENTRml4ZXJQYXRoP1xuICAgICAgICAjIEZvdW5kIFBIUC1DUy1GaXhlciBwYXRoXG4gICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0KVxuXG4gICAgICAgIGlmIEBpc1dpbmRvd3NcbiAgICAgICAgICBAcnVuKFwicGhwXCIsIFtwaHBDU0ZpeGVyUGF0aCwgcGhwQ3NGaXhlck9wdGlvbnMsIHRlbXBGaWxlXSwgcnVuT3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBydW4ocGhwQ1NGaXhlclBhdGgsIFtwaHBDc0ZpeGVyT3B0aW9ucywgdGVtcEZpbGVdLCBydW5PcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICAgICAgKVxuICAgICAgZWxzZVxuICAgICAgICBAdmVyYm9zZSgncGhwLWNzLWZpeGVyIG5vdCBmb3VuZCEnKVxuICAgICAgICAjIENvdWxkIG5vdCBmaW5kIFBIUC1DUy1GaXhlciBwYXRoXG4gICAgICAgIEBQcm9taXNlLnJlamVjdChAY29tbWFuZE5vdEZvdW5kRXJyb3IoXG4gICAgICAgICAgJ3BocC1jcy1maXhlcidcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXCJcbiAgICAgICAgICAgIHByb2dyYW06IFwicGhwLWNzLWZpeGVyLnBoYXJcIlxuICAgICAgICAgICAgcGF0aE9wdGlvbjogXCJQSFAgLSBDUyBGaXhlciBQYXRoXCJcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgKVxuIl19
