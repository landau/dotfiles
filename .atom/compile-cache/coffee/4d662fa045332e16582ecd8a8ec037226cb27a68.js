
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

    PHPCSFixer.prototype.executables = [
      {
        name: "PHP",
        cmd: "php",
        homepage: "http://php.net/",
        installation: "http://php.net/manual/en/install.php",
        version: {
          parse: function(text) {
            return text.match(/PHP (\d+\.\d+\.\d+)/)[1];
          }
        }
      }, {
        name: "PHP-CS-Fixer",
        cmd: "php-cs-fixer",
        homepage: "https://github.com/FriendsOfPHP/PHP-CS-Fixer",
        installation: "https://github.com/FriendsOfPHP/PHP-CS-Fixer#installation",
        optional: true,
        version: {
          parse: function(text) {
            try {
              return text.match(/version (.*) by/)[1] + ".0";
            } catch (error) {
              return text.match(/PHP CS Fixer (\d+\.\d+\.\d+)/)[1];
            }
          }
        },
        docker: {
          image: "unibeautify/php-cs-fixer",
          workingDir: "/project"
        }
      }
    ];

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
      var configFiles, isVersion1, php, phpCsFixer, phpCsFixerOptions, runOptions;
      this.debug('php-cs-fixer', options);
      php = this.exe('php');
      phpCsFixer = this.exe('php-cs-fixer');
      configFiles = ['.php_cs', '.php_cs.dist'];
      if (!options.cs_fixer_config_file) {
        options.cs_fixer_config_file = (context != null) && (context.filePath != null) ? this.findFile(path.dirname(context.filePath), configFiles) : void 0;
      }
      if (!options.cs_fixer_config_file) {
        options.cs_fixer_config_file = this.findFile(atom.project.getPaths()[0], configFiles);
      }
      phpCsFixerOptions = ["fix", options.rules ? "--rules=" + options.rules : void 0, options.cs_fixer_config_file ? "--config=" + options.cs_fixer_config_file : void 0, options.allow_risky ? "--allow-risky=" + options.allow_risky : void 0, "--using-cache=no"];
      isVersion1 = (phpCsFixer.isInstalled && phpCsFixer.isVersion('1.x')) || (options.cs_fixer_version && phpCsFixer.versionSatisfies(options.cs_fixer_version + ".0.0", '1.x'));
      if (isVersion1) {
        phpCsFixerOptions = ["fix", options.level ? "--level=" + options.level : void 0, options.fixers ? "--fixers=" + options.fixers : void 0, options.cs_fixer_config_file ? "--config-file=" + options.cs_fixer_config_file : void 0];
      }
      runOptions = {
        ignoreReturnCode: true,
        help: {
          link: "https://github.com/FriendsOfPHP/PHP-CS-Fixer"
        }
      };
      if (options.cs_fixer_path) {
        this.deprecateOptionForExecutable("PHP-CS-Fixer", "PHP - PHP-CS-Fixer Path (cs_fixer_path)", "Path");
      }
      return this.Promise.all([options.cs_fixer_path ? this.which(options.cs_fixer_path) : void 0, phpCsFixer.path(), this.tempFile("temp", text, '.php')]).then((function(_this) {
        return function(arg) {
          var customPhpCsFixerPath, finalPhpCsFixerPath, isPhpScript, phpCsFixerPath, tempFile;
          customPhpCsFixerPath = arg[0], phpCsFixerPath = arg[1], tempFile = arg[2];
          finalPhpCsFixerPath = customPhpCsFixerPath && path.isAbsolute(customPhpCsFixerPath) ? customPhpCsFixerPath : phpCsFixerPath;
          _this.verbose('finalPhpCsFixerPath', finalPhpCsFixerPath, phpCsFixerPath, customPhpCsFixerPath);
          isPhpScript = (finalPhpCsFixerPath.indexOf(".phar") !== -1) || (finalPhpCsFixerPath.indexOf(".php") !== -1);
          _this.verbose('isPhpScript', isPhpScript);
          if (finalPhpCsFixerPath && isPhpScript) {
            return php.run([finalPhpCsFixerPath, phpCsFixerOptions, tempFile], runOptions).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return phpCsFixer.run([phpCsFixerOptions, tempFile], Object.assign({}, runOptions, {
              cmd: finalPhpCsFixerPath
            })).then(function() {
              return _this.readFile(tempFile);
            });
          }
        };
      })(this));
    };

    return PHPCSFixer;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcGhwLWNzLWZpeGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSw0QkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3lCQUVyQixJQUFBLEdBQU07O3lCQUNOLElBQUEsR0FBTTs7eUJBQ04sV0FBQSxHQUFhO01BQ1g7UUFDRSxJQUFBLEVBQU0sS0FEUjtRQUVFLEdBQUEsRUFBSyxLQUZQO1FBR0UsUUFBQSxFQUFVLGlCQUhaO1FBSUUsWUFBQSxFQUFjLHNDQUpoQjtRQUtFLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxxQkFBWCxDQUFrQyxDQUFBLENBQUE7VUFBNUMsQ0FEQTtTQUxYO09BRFcsRUFVWDtRQUNFLElBQUEsRUFBTSxjQURSO1FBRUUsR0FBQSxFQUFLLGNBRlA7UUFHRSxRQUFBLEVBQVUsOENBSFo7UUFJRSxZQUFBLEVBQWMsMkRBSmhCO1FBS0UsUUFBQSxFQUFVLElBTFo7UUFNRSxPQUFBLEVBQVM7VUFDUCxLQUFBLEVBQU8sU0FBQyxJQUFEO0FBQ0w7cUJBQ0UsSUFBSSxDQUFDLEtBQUwsQ0FBVyxpQkFBWCxDQUE4QixDQUFBLENBQUEsQ0FBOUIsR0FBbUMsS0FEckM7YUFBQSxhQUFBO3FCQUdFLElBQUksQ0FBQyxLQUFMLENBQVcsOEJBQVgsQ0FBMkMsQ0FBQSxDQUFBLEVBSDdDOztVQURLLENBREE7U0FOWDtRQWFFLE1BQUEsRUFBUTtVQUNOLEtBQUEsRUFBTywwQkFERDtVQUVOLFVBQUEsRUFBWSxVQUZOO1NBYlY7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ZHNPZlBIUC9QSFAtQ1MtRml4ZXJcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUEhQQ1NGaXhlciBleHRlbmRzIEJlYXV0aWZpZXJcblxuICBuYW1lOiAnUEhQLUNTLUZpeGVyJ1xuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXCJcbiAgZXhlY3V0YWJsZXM6IFtcbiAgICB7XG4gICAgICBuYW1lOiBcIlBIUFwiXG4gICAgICBjbWQ6IFwicGhwXCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHA6Ly9waHAubmV0L1wiXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2luc3RhbGwucGhwXCJcbiAgICAgIHZlcnNpb246IHtcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPiB0ZXh0Lm1hdGNoKC9QSFAgKFxcZCtcXC5cXGQrXFwuXFxkKykvKVsxXVxuICAgICAgfVxuICAgIH1cbiAgICB7XG4gICAgICBuYW1lOiBcIlBIUC1DUy1GaXhlclwiXG4gICAgICBjbWQ6IFwicGhwLWNzLWZpeGVyXCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXCJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlciNpbnN0YWxsYXRpb25cIlxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICAgIHZlcnNpb246IHtcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPlxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgdGV4dC5tYXRjaCgvdmVyc2lvbiAoLiopIGJ5LylbMV0gKyBcIi4wXCJcbiAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgdGV4dC5tYXRjaCgvUEhQIENTIEZpeGVyIChcXGQrXFwuXFxkK1xcLlxcZCspLylbMV1cbiAgICAgIH1cbiAgICAgIGRvY2tlcjoge1xuICAgICAgICBpbWFnZTogXCJ1bmliZWF1dGlmeS9waHAtY3MtZml4ZXJcIlxuICAgICAgICB3b3JraW5nRGlyOiBcIi9wcm9qZWN0XCJcbiAgICAgIH1cbiAgICB9XG4gIF1cblxuICBvcHRpb25zOlxuICAgIFBIUDpcbiAgICAgIHJ1bGVzOiB0cnVlXG4gICAgICBjc19maXhlcl9wYXRoOiB0cnVlXG4gICAgICBjc19maXhlcl92ZXJzaW9uOiB0cnVlXG4gICAgICBjc19maXhlcl9jb25maWdfZmlsZTogdHJ1ZVxuICAgICAgYWxsb3dfcmlza3k6IHRydWVcbiAgICAgIGxldmVsOiB0cnVlXG4gICAgICBmaXhlcnM6IHRydWVcblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zLCBjb250ZXh0KSAtPlxuICAgIEBkZWJ1ZygncGhwLWNzLWZpeGVyJywgb3B0aW9ucylcbiAgICBwaHAgPSBAZXhlKCdwaHAnKVxuICAgIHBocENzRml4ZXIgPSBAZXhlKCdwaHAtY3MtZml4ZXInKVxuICAgIGNvbmZpZ0ZpbGVzID0gWycucGhwX2NzJywgJy5waHBfY3MuZGlzdCddXG5cbiAgICAjIEZpbmQgYSBjb25maWcgZmlsZSBpbiB0aGUgd29ya2luZyBkaXJlY3RvcnkgaWYgYSBjdXN0b20gb25lIHdhcyBub3QgcHJvdmlkZWRcbiAgICBpZiBub3Qgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZVxuICAgICAgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZSA9IGlmIGNvbnRleHQ/IGFuZCBjb250ZXh0LmZpbGVQYXRoPyB0aGVuIEBmaW5kRmlsZShwYXRoLmRpcm5hbWUoY29udGV4dC5maWxlUGF0aCksIGNvbmZpZ0ZpbGVzKVxuXG4gICAgIyBUcnkgYWdhaW4gdG8gZmluZCBhIGNvbmZpZyBmaWxlIGluIHRoZSBwcm9qZWN0IHJvb3RcbiAgICBpZiBub3Qgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZVxuICAgICAgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZSA9IEBmaW5kRmlsZShhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXSwgY29uZmlnRmlsZXMpXG5cbiAgICBwaHBDc0ZpeGVyT3B0aW9ucyA9IFtcbiAgICAgIFwiZml4XCJcbiAgICAgIFwiLS1ydWxlcz0je29wdGlvbnMucnVsZXN9XCIgaWYgb3B0aW9ucy5ydWxlc1xuICAgICAgXCItLWNvbmZpZz0je29wdGlvbnMuY3NfZml4ZXJfY29uZmlnX2ZpbGV9XCIgaWYgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZVxuICAgICAgXCItLWFsbG93LXJpc2t5PSN7b3B0aW9ucy5hbGxvd19yaXNreX1cIiBpZiBvcHRpb25zLmFsbG93X3Jpc2t5XG4gICAgICBcIi0tdXNpbmctY2FjaGU9bm9cIlxuICAgIF1cblxuICAgIGlzVmVyc2lvbjEgPSAoKHBocENzRml4ZXIuaXNJbnN0YWxsZWQgYW5kIHBocENzRml4ZXIuaXNWZXJzaW9uKCcxLngnKSkgb3IgXFxcbiAgICAgIChvcHRpb25zLmNzX2ZpeGVyX3ZlcnNpb24gYW5kIHBocENzRml4ZXIudmVyc2lvblNhdGlzZmllcyhcIiN7b3B0aW9ucy5jc19maXhlcl92ZXJzaW9ufS4wLjBcIiwgJzEueCcpKSlcbiAgICBpZiBpc1ZlcnNpb24xXG4gICAgICBwaHBDc0ZpeGVyT3B0aW9ucyA9IFtcbiAgICAgICAgXCJmaXhcIlxuICAgICAgICBcIi0tbGV2ZWw9I3tvcHRpb25zLmxldmVsfVwiIGlmIG9wdGlvbnMubGV2ZWxcbiAgICAgICAgXCItLWZpeGVycz0je29wdGlvbnMuZml4ZXJzfVwiIGlmIG9wdGlvbnMuZml4ZXJzXG4gICAgICAgIFwiLS1jb25maWctZmlsZT0je29wdGlvbnMuY3NfZml4ZXJfY29uZmlnX2ZpbGV9XCIgaWYgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZVxuICAgICAgXVxuICAgIHJ1bk9wdGlvbnMgPSB7XG4gICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlXG4gICAgICBoZWxwOiB7XG4gICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcIlxuICAgICAgfVxuICAgIH1cblxuICAgICMgRmluZCBwaHAtY3MtZml4ZXIucGhhciBzY3JpcHRcbiAgICBpZiBvcHRpb25zLmNzX2ZpeGVyX3BhdGhcbiAgICAgIEBkZXByZWNhdGVPcHRpb25Gb3JFeGVjdXRhYmxlKFwiUEhQLUNTLUZpeGVyXCIsIFwiUEhQIC0gUEhQLUNTLUZpeGVyIFBhdGggKGNzX2ZpeGVyX3BhdGgpXCIsIFwiUGF0aFwiKVxuXG4gICAgQFByb21pc2UuYWxsKFtcbiAgICAgIEB3aGljaChvcHRpb25zLmNzX2ZpeGVyX3BhdGgpIGlmIG9wdGlvbnMuY3NfZml4ZXJfcGF0aFxuICAgICAgcGhwQ3NGaXhlci5wYXRoKClcbiAgICAgIEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dCwgJy5waHAnKVxuICAgIF0pLnRoZW4oKFtjdXN0b21QaHBDc0ZpeGVyUGF0aCwgcGhwQ3NGaXhlclBhdGgsIHRlbXBGaWxlXSkgPT5cbiAgICAgICMgR2V0IGZpcnN0IHZhbGlkLCBhYnNvbHV0ZSBwYXRoXG4gICAgICBmaW5hbFBocENzRml4ZXJQYXRoID0gaWYgY3VzdG9tUGhwQ3NGaXhlclBhdGggYW5kIHBhdGguaXNBYnNvbHV0ZShjdXN0b21QaHBDc0ZpeGVyUGF0aCkgdGhlbiBcXFxuICAgICAgICBjdXN0b21QaHBDc0ZpeGVyUGF0aCBlbHNlIHBocENzRml4ZXJQYXRoXG4gICAgICBAdmVyYm9zZSgnZmluYWxQaHBDc0ZpeGVyUGF0aCcsIGZpbmFsUGhwQ3NGaXhlclBhdGgsIHBocENzRml4ZXJQYXRoLCBjdXN0b21QaHBDc0ZpeGVyUGF0aClcblxuICAgICAgaXNQaHBTY3JpcHQgPSAoZmluYWxQaHBDc0ZpeGVyUGF0aC5pbmRleE9mKFwiLnBoYXJcIikgaXNudCAtMSkgb3IgKGZpbmFsUGhwQ3NGaXhlclBhdGguaW5kZXhPZihcIi5waHBcIikgaXNudCAtMSlcbiAgICAgIEB2ZXJib3NlKCdpc1BocFNjcmlwdCcsIGlzUGhwU2NyaXB0KVxuXG4gICAgICBpZiBmaW5hbFBocENzRml4ZXJQYXRoIGFuZCBpc1BocFNjcmlwdFxuICAgICAgICBwaHAucnVuKFtmaW5hbFBocENzRml4ZXJQYXRoLCBwaHBDc0ZpeGVyT3B0aW9ucywgdGVtcEZpbGVdLCBydW5PcHRpb25zKVxuICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgICAgKVxuICAgICAgZWxzZVxuICAgICAgICBwaHBDc0ZpeGVyLnJ1bihbcGhwQ3NGaXhlck9wdGlvbnMsIHRlbXBGaWxlXSxcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHt9LCBydW5PcHRpb25zLCB7IGNtZDogZmluYWxQaHBDc0ZpeGVyUGF0aCB9KVxuICAgICAgICApXG4gICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICApXG4gICAgKVxuIl19
