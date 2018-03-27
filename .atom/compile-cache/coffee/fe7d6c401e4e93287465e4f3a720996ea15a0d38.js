
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
      phpCsFixerOptions = ["fix", options.level ? "--level=" + options.level : void 0, options.fixers ? "--fixers=" + options.fixers : void 0, configFile ? "--config-file=" + configFile : void 0];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcGhwLWNzLWZpeGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSw0QkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3lCQUVyQixJQUFBLEdBQU07O3lCQUNOLElBQUEsR0FBTTs7eUJBQ04sY0FBQSxHQUFnQjs7eUJBRWhCLE9BQUEsR0FDRTtNQUFBLEdBQUEsRUFBSyxJQUFMOzs7eUJBRUYsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsRUFBMEIsT0FBMUI7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxjQUFQLEVBQXVCLE9BQXZCO01BRUEsVUFBQSxHQUFnQixpQkFBQSxJQUFhLDBCQUFoQixHQUF1QyxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBTyxDQUFDLFFBQXJCLENBQVYsRUFBMEMsU0FBMUMsQ0FBdkMsR0FBQTtNQUNiLGlCQUFBLEdBQW9CLENBQ2xCLEtBRGtCLEVBRVksT0FBTyxDQUFDLEtBQXRDLEdBQUEsVUFBQSxHQUFXLE9BQU8sQ0FBQyxLQUFuQixHQUFBLE1BRmtCLEVBR2MsT0FBTyxDQUFDLE1BQXhDLEdBQUEsV0FBQSxHQUFZLE9BQU8sQ0FBQyxNQUFwQixHQUFBLE1BSGtCLEVBSWUsVUFBakMsR0FBQSxnQkFBQSxHQUFpQixVQUFqQixHQUFBLE1BSmtCO01BTXBCLFVBQUEsR0FBYTtRQUNYLGdCQUFBLEVBQWtCLElBRFA7UUFFWCxJQUFBLEVBQU07VUFDSixJQUFBLEVBQU0sOENBREY7U0FGSzs7YUFRYixJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxDQUNzQixPQUFPLENBQUMsYUFBekMsR0FBQSxJQUFDLENBQUEsS0FBRCxDQUFPLE9BQU8sQ0FBQyxhQUFmLENBQUEsR0FBQSxNQURXLEVBRVgsSUFBQyxDQUFBLEtBQUQsQ0FBTyxjQUFQLENBRlcsQ0FBYixDQUdFLENBQUMsSUFISCxDQUdRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO0FBQ04sY0FBQTtVQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sb0JBQVAsRUFBNkIsS0FBN0I7VUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7VUFFSixjQUFBLEdBQWlCLENBQUMsQ0FBQyxJQUFGLENBQU8sS0FBUCxFQUFjLFNBQUMsQ0FBRDttQkFBTyxDQUFBLElBQU0sSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsQ0FBaEI7VUFBYixDQUFkO1VBQ2pCLEtBQUMsQ0FBQSxPQUFELENBQVMsZ0JBQVQsRUFBMkIsY0FBM0I7VUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLGdCQUFQLEVBQXlCLGNBQXpCLEVBQXlDLEtBQXpDO1VBR0EsSUFBRyxzQkFBSDtZQUVFLFFBQUEsR0FBVyxLQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEI7WUFFWCxJQUFHLEtBQUMsQ0FBQSxTQUFKO3FCQUNFLEtBQUMsQ0FBQSxHQUFELENBQUssS0FBTCxFQUFZLENBQUMsY0FBRCxFQUFpQixpQkFBakIsRUFBb0MsUUFBcEMsQ0FBWixFQUEyRCxVQUEzRCxDQUNFLENBQUMsSUFESCxDQUNRLFNBQUE7dUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO2NBREksQ0FEUixFQURGO2FBQUEsTUFBQTtxQkFNRSxLQUFDLENBQUEsR0FBRCxDQUFLLGNBQUwsRUFBcUIsQ0FBQyxpQkFBRCxFQUFvQixRQUFwQixDQUFyQixFQUFvRCxVQUFwRCxDQUNFLENBQUMsSUFESCxDQUNRLFNBQUE7dUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO2NBREksQ0FEUixFQU5GO2FBSkY7V0FBQSxNQUFBO1lBZUUsS0FBQyxDQUFBLE9BQUQsQ0FBUyx5QkFBVDttQkFFQSxLQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsS0FBQyxDQUFBLG9CQUFELENBQ2QsY0FEYyxFQUVkO2NBQ0UsSUFBQSxFQUFNLDhDQURSO2NBRUUsT0FBQSxFQUFTLG1CQUZYO2NBR0UsVUFBQSxFQUFZLHFCQUhkO2FBRmMsQ0FBaEIsRUFqQkY7O1FBVE07TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFI7SUFsQlE7Ozs7S0FUOEI7QUFSMUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBIUENTRml4ZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXG5cbiAgbmFtZTogJ1BIUC1DUy1GaXhlcidcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6XG4gICAgUEhQOiB0cnVlXG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucywgY29udGV4dCkgLT5cbiAgICBAZGVidWcoJ3BocC1jcy1maXhlcicsIG9wdGlvbnMpXG5cbiAgICBjb25maWdGaWxlID0gaWYgY29udGV4dD8gYW5kIGNvbnRleHQuZmlsZVBhdGg/IHRoZW4gQGZpbmRGaWxlKHBhdGguZGlybmFtZShjb250ZXh0LmZpbGVQYXRoKSwgJy5waHBfY3MnKVxuICAgIHBocENzRml4ZXJPcHRpb25zID0gW1xuICAgICAgXCJmaXhcIlxuICAgICAgXCItLWxldmVsPSN7b3B0aW9ucy5sZXZlbH1cIiBpZiBvcHRpb25zLmxldmVsXG4gICAgICBcIi0tZml4ZXJzPSN7b3B0aW9ucy5maXhlcnN9XCIgaWYgb3B0aW9ucy5maXhlcnNcbiAgICAgIFwiLS1jb25maWctZmlsZT0je2NvbmZpZ0ZpbGV9XCIgaWYgY29uZmlnRmlsZVxuICAgIF1cbiAgICBydW5PcHRpb25zID0ge1xuICAgICAgaWdub3JlUmV0dXJuQ29kZTogdHJ1ZVxuICAgICAgaGVscDoge1xuICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXCJcbiAgICAgIH1cbiAgICB9XG5cbiAgICAjIEZpbmQgcGhwLWNzLWZpeGVyLnBoYXIgc2NyaXB0XG4gICAgQFByb21pc2UuYWxsKFtcbiAgICAgIEB3aGljaChvcHRpb25zLmNzX2ZpeGVyX3BhdGgpIGlmIG9wdGlvbnMuY3NfZml4ZXJfcGF0aFxuICAgICAgQHdoaWNoKCdwaHAtY3MtZml4ZXInKVxuICAgIF0pLnRoZW4oKHBhdGhzKSA9PlxuICAgICAgQGRlYnVnKCdwaHAtY3MtZml4ZXIgcGF0aHMnLCBwYXRocylcbiAgICAgIF8gPSByZXF1aXJlICdsb2Rhc2gnXG4gICAgICAjIEdldCBmaXJzdCB2YWxpZCwgYWJzb2x1dGUgcGF0aFxuICAgICAgcGhwQ1NGaXhlclBhdGggPSBfLmZpbmQocGF0aHMsIChwKSAtPiBwIGFuZCBwYXRoLmlzQWJzb2x1dGUocCkgKVxuICAgICAgQHZlcmJvc2UoJ3BocENTRml4ZXJQYXRoJywgcGhwQ1NGaXhlclBhdGgpXG4gICAgICBAZGVidWcoJ3BocENTRml4ZXJQYXRoJywgcGhwQ1NGaXhlclBhdGgsIHBhdGhzKVxuXG4gICAgICAjIENoZWNrIGlmIFBIUC1DUy1GaXhlciBwYXRoIHdhcyBmb3VuZFxuICAgICAgaWYgcGhwQ1NGaXhlclBhdGg/XG4gICAgICAgICMgRm91bmQgUEhQLUNTLUZpeGVyIHBhdGhcbiAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG5cbiAgICAgICAgaWYgQGlzV2luZG93c1xuICAgICAgICAgIEBydW4oXCJwaHBcIiwgW3BocENTRml4ZXJQYXRoLCBwaHBDc0ZpeGVyT3B0aW9ucywgdGVtcEZpbGVdLCBydW5PcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHJ1bihwaHBDU0ZpeGVyUGF0aCwgW3BocENzRml4ZXJPcHRpb25zLCB0ZW1wRmlsZV0sIHJ1bk9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbig9PlxuICAgICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgICAgICApXG4gICAgICBlbHNlXG4gICAgICAgIEB2ZXJib3NlKCdwaHAtY3MtZml4ZXIgbm90IGZvdW5kIScpXG4gICAgICAgICMgQ291bGQgbm90IGZpbmQgUEhQLUNTLUZpeGVyIHBhdGhcbiAgICAgICAgQFByb21pc2UucmVqZWN0KEBjb21tYW5kTm90Rm91bmRFcnJvcihcbiAgICAgICAgICAncGhwLWNzLWZpeGVyJ1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcIlxuICAgICAgICAgICAgcHJvZ3JhbTogXCJwaHAtY3MtZml4ZXIucGhhclwiXG4gICAgICAgICAgICBwYXRoT3B0aW9uOiBcIlBIUCAtIENTIEZpeGVyIFBhdGhcIlxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICApXG4iXX0=
