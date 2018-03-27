
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
        cs_fixer_config_file: true,
        allow_risky: true,
        level: true,
        fixers: true
      }
    };

    PHPCSFixer.prototype.beautify = function(text, language, options, context) {
      var configFiles, phpCsFixerOptions, runOptions, version;
      this.debug('php-cs-fixer', options);
      version = options.cs_fixer_version;
      configFiles = ['.php_cs', '.php_cs.dist'];
      if (!options.cs_fixer_config_file) {
        options.cs_fixer_config_file = (context != null) && (context.filePath != null) ? this.findFile(path.dirname(context.filePath), configFiles) : void 0;
      }
      if (!options.cs_fixer_config_file) {
        options.cs_fixer_config_file = this.findFile(atom.project.getPaths()[0], configFiles);
      }
      phpCsFixerOptions = ["fix", options.rules ? "--rules=" + options.rules : void 0, options.cs_fixer_config_file ? "--config=" + options.cs_fixer_config_file : void 0, options.allow_risky ? "--allow-risky=" + options.allow_risky : void 0, "--using-cache=no"];
      if (version === 1) {
        phpCsFixerOptions = ["fix", options.level ? "--level=" + options.level : void 0, options.fixers ? "--fixers=" + options.fixers : void 0, options.cs_fixer_config_file ? "--config-file=" + options.cs_fixer_config_file : void 0];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcGhwLWNzLWZpeGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSw0QkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3lCQUVyQixJQUFBLEdBQU07O3lCQUNOLElBQUEsR0FBTTs7eUJBQ04sY0FBQSxHQUFnQjs7eUJBRWhCLE9BQUEsR0FDRTtNQUFBLEdBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxJQUFQO1FBQ0EsYUFBQSxFQUFlLElBRGY7UUFFQSxnQkFBQSxFQUFrQixJQUZsQjtRQUdBLG9CQUFBLEVBQXNCLElBSHRCO1FBSUEsV0FBQSxFQUFhLElBSmI7UUFLQSxLQUFBLEVBQU8sSUFMUDtRQU1BLE1BQUEsRUFBUSxJQU5SO09BREY7Ozt5QkFTRixRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixFQUEwQixPQUExQjtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxDQUFPLGNBQVAsRUFBdUIsT0FBdkI7TUFDQSxPQUFBLEdBQVUsT0FBTyxDQUFDO01BQ2xCLFdBQUEsR0FBYyxDQUFDLFNBQUQsRUFBWSxjQUFaO01BR2QsSUFBRyxDQUFJLE9BQU8sQ0FBQyxvQkFBZjtRQUNFLE9BQU8sQ0FBQyxvQkFBUixHQUFrQyxpQkFBQSxJQUFhLDBCQUFoQixHQUF1QyxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBTyxDQUFDLFFBQXJCLENBQVYsRUFBMEMsV0FBMUMsQ0FBdkMsR0FBQSxPQURqQzs7TUFJQSxJQUFHLENBQUksT0FBTyxDQUFD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O01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhSO0lBbkNROzs7O0tBaEI4QjtBQVIxQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUEhQQ1NGaXhlciBleHRlbmRzIEJlYXV0aWZpZXJcblxuICBuYW1lOiAnUEhQLUNTLUZpeGVyJ1xuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczpcbiAgICBQSFA6XG4gICAgICBydWxlczogdHJ1ZVxuICAgICAgY3NfZml4ZXJfcGF0aDogdHJ1ZVxuICAgICAgY3NfZml4ZXJfdmVyc2lvbjogdHJ1ZVxuICAgICAgY3NfZml4ZXJfY29uZmlnX2ZpbGU6IHRydWVcbiAgICAgIGFsbG93X3Jpc2t5OiB0cnVlXG4gICAgICBsZXZlbDogdHJ1ZVxuICAgICAgZml4ZXJzOiB0cnVlXG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucywgY29udGV4dCkgLT5cbiAgICBAZGVidWcoJ3BocC1jcy1maXhlcicsIG9wdGlvbnMpXG4gICAgdmVyc2lvbiA9IG9wdGlvbnMuY3NfZml4ZXJfdmVyc2lvblxuICAgIGNvbmZpZ0ZpbGVzID0gWycucGhwX2NzJywgJy5waHBfY3MuZGlzdCddXG5cbiAgICAjIEZpbmQgYSBjb25maWcgZmlsZSBpbiB0aGUgd29ya2luZyBkaXJlY3RvcnkgaWYgYSBjdXN0b20gb25lIHdhcyBub3QgcHJvdmlkZWRcbiAgICBpZiBub3Qgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZVxuICAgICAgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZSA9IGlmIGNvbnRleHQ/IGFuZCBjb250ZXh0LmZpbGVQYXRoPyB0aGVuIEBmaW5kRmlsZShwYXRoLmRpcm5hbWUoY29udGV4dC5maWxlUGF0aCksIGNvbmZpZ0ZpbGVzKVxuXG4gICAgIyBUcnkgYWdhaW4gdG8gZmluZCBhIGNvbmZpZyBmaWxlIGluIHRoZSBwcm9qZWN0IHJvb3RcbiAgICBpZiBub3Qgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZVxuICAgICAgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZSA9IEBmaW5kRmlsZShhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXSwgY29uZmlnRmlsZXMpXG5cbiAgICBwaHBDc0ZpeGVyT3B0aW9ucyA9IFtcbiAgICAgIFwiZml4XCJcbiAgICAgIFwiLS1ydWxlcz0je29wdGlvbnMucnVsZXN9XCIgaWYgb3B0aW9ucy5ydWxlc1xuICAgICAgXCItLWNvbmZpZz0je29wdGlvbnMuY3NfZml4ZXJfY29uZmlnX2ZpbGV9XCIgaWYgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZVxuICAgICAgXCItLWFsbG93LXJpc2t5PSN7b3B0aW9ucy5hbGxvd19yaXNreX1cIiBpZiBvcHRpb25zLmFsbG93X3Jpc2t5XG4gICAgICBcIi0tdXNpbmctY2FjaGU9bm9cIlxuICAgIF1cbiAgICBpZiB2ZXJzaW9uIGlzIDFcbiAgICAgIHBocENzRml4ZXJPcHRpb25zID0gW1xuICAgICAgICBcImZpeFwiXG4gICAgICAgIFwiLS1sZXZlbD0je29wdGlvbnMubGV2ZWx9XCIgaWYgb3B0aW9ucy5sZXZlbFxuICAgICAgICBcIi0tZml4ZXJzPSN7b3B0aW9ucy5maXhlcnN9XCIgaWYgb3B0aW9ucy5maXhlcnNcbiAgICAgICAgXCItLWNvbmZpZy1maWxlPSN7b3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZX1cIiBpZiBvcHRpb25zLmNzX2ZpeGVyX2NvbmZpZ19maWxlXG4gICAgICBdXG4gICAgcnVuT3B0aW9ucyA9IHtcbiAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgIGhlbHA6IHtcbiAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXG4gICAgICB9XG4gICAgfVxuXG4gICAgIyBGaW5kIHBocC1jcy1maXhlci5waGFyIHNjcmlwdFxuICAgIEBQcm9taXNlLmFsbChbXG4gICAgICBAd2hpY2gob3B0aW9ucy5jc19maXhlcl9wYXRoKSBpZiBvcHRpb25zLmNzX2ZpeGVyX3BhdGhcbiAgICAgIEB3aGljaCgncGhwLWNzLWZpeGVyJylcbiAgICBdKS50aGVuKChwYXRocykgPT5cbiAgICAgIEBkZWJ1ZygncGhwLWNzLWZpeGVyIHBhdGhzJywgcGF0aHMpXG4gICAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgICAgIyBHZXQgZmlyc3QgdmFsaWQsIGFic29sdXRlIHBhdGhcbiAgICAgIHBocENTRml4ZXJQYXRoID0gXy5maW5kKHBhdGhzLCAocCkgLT4gcCBhbmQgcGF0aC5pc0Fic29sdXRlKHApIClcbiAgICAgIEB2ZXJib3NlKCdwaHBDU0ZpeGVyUGF0aCcsIHBocENTRml4ZXJQYXRoKVxuICAgICAgQGRlYnVnKCdwaHBDU0ZpeGVyUGF0aCcsIHBocENTRml4ZXJQYXRoLCBwYXRocylcblxuICAgICAgIyBDaGVjayBpZiBQSFAtQ1MtRml4ZXIgcGF0aCB3YXMgZm91bmRcbiAgICAgIGlmIHBocENTRml4ZXJQYXRoP1xuICAgICAgICAjIEZvdW5kIFBIUC1DUy1GaXhlciBwYXRoXG4gICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0KVxuXG4gICAgICAgIGlmIEBpc1dpbmRvd3NcbiAgICAgICAgICBAcnVuKFwicGhwXCIsIFtwaHBDU0ZpeGVyUGF0aCwgcGhwQ3NGaXhlck9wdGlvbnMsIHRlbXBGaWxlXSwgcnVuT3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBydW4ocGhwQ1NGaXhlclBhdGgsIFtwaHBDc0ZpeGVyT3B0aW9ucywgdGVtcEZpbGVdLCBydW5PcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICAgICAgKVxuICAgICAgZWxzZVxuICAgICAgICBAdmVyYm9zZSgncGhwLWNzLWZpeGVyIG5vdCBmb3VuZCEnKVxuICAgICAgICAjIENvdWxkIG5vdCBmaW5kIFBIUC1DUy1GaXhlciBwYXRoXG4gICAgICAgIEBQcm9taXNlLnJlamVjdChAY29tbWFuZE5vdEZvdW5kRXJyb3IoXG4gICAgICAgICAgJ3BocC1jcy1maXhlcidcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXCJcbiAgICAgICAgICAgIHByb2dyYW06IFwicGhwLWNzLWZpeGVyLnBoYXJcIlxuICAgICAgICAgICAgcGF0aE9wdGlvbjogXCJQSFAgLSBDUyBGaXhlciBQYXRoXCJcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgKVxuIl19
