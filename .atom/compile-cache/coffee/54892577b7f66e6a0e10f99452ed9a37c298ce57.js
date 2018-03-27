
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
            return text.match(/PHP (.*) \(cli\)/)[1];
          }
        }
      }, {
        name: "PHP-CS-Fixer",
        cmd: "php-cs-fixer",
        homepage: "https://github.com/FriendsOfPHP/PHP-CS-Fixer",
        installation: "https://github.com/FriendsOfPHP/PHP-CS-Fixer#installation",
        version: {
          parse: function(text) {
            return text.match(/version (.*) by/)[1] + ".0";
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
      var configFiles, php, phpCsFixer, phpCsFixerOptions, runOptions, tempFile;
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
      if (phpCsFixer.isVersion('1.x')) {
        phpCsFixerOptions = ["fix", options.level ? "--level=" + options.level : void 0, options.fixers ? "--fixers=" + options.fixers : void 0, options.cs_fixer_config_file ? "--config-file=" + options.cs_fixer_config_file : void 0];
      }
      runOptions = {
        ignoreReturnCode: true,
        help: {
          link: "https://github.com/FriendsOfPHP/PHP-CS-Fixer"
        }
      };
      if (options.cs_fixer_path) {
        this.deprecate("The \"cs_fixer_path\" has been deprecated. Please switch to using the config with path \"Executables - PHP-CS-Fixer - Path\" in Atom-Beautify package settings now.");
      }
      return this.Promise.all([options.cs_fixer_path ? this.which(options.cs_fixer_path) : void 0, this.which('php-cs-fixer'), tempFile = this.tempFile("temp", text, '.php')]).then((function(_this) {
        return function(arg) {
          var _, customPath, paths, phpCSFixerPath, phpCsFixerPath;
          customPath = arg[0], phpCsFixerPath = arg[1];
          paths = [customPath, phpCsFixerPath];
          _this.debug('php-cs-fixer paths', paths);
          _ = require('lodash');
          phpCSFixerPath = _.find(paths, function(p) {
            return p && path.isAbsolute(p);
          });
          _this.verbose('phpCSFixerPath', phpCSFixerPath);
          _this.debug('phpCSFixerPath', phpCSFixerPath, paths);
          if (phpCSFixerPath != null) {
            if (_this.isWindows) {
              return php.run([phpCSFixerPath, phpCsFixerOptions, tempFile], runOptions).then(function() {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcGhwLWNzLWZpeGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSw0QkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3lCQUVyQixJQUFBLEdBQU07O3lCQUNOLElBQUEsR0FBTTs7eUJBQ04sV0FBQSxHQUFhO01BQ1g7UUFDRSxJQUFBLEVBQU0sS0FEUjtRQUVFLEdBQUEsRUFBSyxLQUZQO1FBR0UsUUFBQSxFQUFVLGlCQUhaO1FBSUUsWUFBQSxFQUFjLHNDQUpoQjtRQUtFLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxrQkFBWCxDQUErQixDQUFBLENBQUE7VUFBekMsQ0FEQTtTQUxYO09BRFcsRUFVWDtRQUNFLElBQUEsRUFBTSxjQURSO1FBRUUsR0FBQSxFQUFLLGNBRlA7UUFHRSxRQUFBLEVBQVUsOENBSFo7UUFJRSxZQUFBLEVBQWMsMkRBSmhCO1FBS0UsT0FBQSxFQUFTO1VBQ1AsS0FBQSxFQUFPLFNBQUMsSUFBRDttQkFBVSxJQUFJLENBQUMsS0FBTCxDQUFXLGlCQUFYLENBQThCLENBQUEsQ0FBQSxDQUE5QixHQUFtQztVQUE3QyxDQURBO1NBTFg7UUFRRSxNQUFBLEVBQVE7VUFDTixLQUFBLEVBQU8sMEJBREQ7VUFFTixVQUFBLEVBQVksVUFGTjtTQVJWO09BVlc7Ozt5QkF5QmIsT0FBQSxHQUNFO01BQUEsR0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLElBQVA7UUFDQSxhQUFBLEVBQWUsSUFEZjtRQUVBLGdCQUFBLEVBQWtC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YixDQUFkO1VBQ2pCLEtBQUMsQ0FBQSxPQUFELENBQVMsZ0JBQVQsRUFBMkIsY0FBM0I7VUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLGdCQUFQLEVBQXlCLGNBQXpCLEVBQXlDLEtBQXpDO1VBR0EsSUFBRyxzQkFBSDtZQUVFLElBQUcsS0FBQyxDQUFBLFNBQUo7cUJBQ0UsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLGNBQUQsRUFBaUIsaUJBQWpCLEVBQW9DLFFBQXBDLENBQVIsRUFBdUQsVUFBdkQsQ0FDRSxDQUFDLElBREgsQ0FDUSxTQUFBO3VCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtjQURJLENBRFIsRUFERjthQUFBLE1BQUE7cUJBTUUsS0FBQyxDQUFBLEdBQUQsQ0FBSyxjQUFMLEVBQXFCLENBQUMsaUJBQUQsRUFBb0IsUUFBcEIsQ0FBckIsRUFBb0QsVUFBcEQsQ0FDRSxDQUFDLElBREgsQ0FDUSxTQUFBO3VCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtjQURJLENBRFIsRUFORjthQUZGO1dBQUEsTUFBQTtZQWFFLEtBQUMsQ0FBQSxPQUFELENBQVMseUJBQVQ7bUJBRUEsS0FBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEtBQUMsQ0FBQSxvQkFBRCxDQUNkLGNBRGMsRUFFZDtjQUNFLElBQUEsRUFBTSw4Q0FEUjtjQUVFLE9BQUEsRUFBUyxtQkFGWDtjQUdFLFVBQUEsRUFBWSxxQkFIZDthQUZjLENBQWhCLEVBZkY7O1FBVk07TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSlI7SUF2Q1E7Ozs7S0F2QzhCO0FBUjFDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQSFBDU0ZpeGVyIGV4dGVuZHMgQmVhdXRpZmllclxuXG4gIG5hbWU6ICdQSFAtQ1MtRml4ZXInXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcIlxuICBleGVjdXRhYmxlczogW1xuICAgIHtcbiAgICAgIG5hbWU6IFwiUEhQXCJcbiAgICAgIGNtZDogXCJwaHBcIlxuICAgICAgaG9tZXBhZ2U6IFwiaHR0cDovL3BocC5uZXQvXCJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwOi8vcGhwLm5ldC9tYW51YWwvZW4vaW5zdGFsbC5waHBcIlxuICAgICAgdmVyc2lvbjoge1xuICAgICAgICBwYXJzZTogKHRleHQpIC0+IHRleHQubWF0Y2goL1BIUCAoLiopIFxcKGNsaVxcKS8pWzFdXG4gICAgICB9XG4gICAgfVxuICAgIHtcbiAgICAgIG5hbWU6IFwiUEhQLUNTLUZpeGVyXCJcbiAgICAgIGNtZDogXCJwaHAtY3MtZml4ZXJcIlxuICAgICAgaG9tZXBhZ2U6IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcIlxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyI2luc3RhbGxhdGlvblwiXG4gICAgICB2ZXJzaW9uOiB7XG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT4gdGV4dC5tYXRjaCgvdmVyc2lvbiAoLiopIGJ5LylbMV0gKyBcIi4wXCJcbiAgICAgIH1cbiAgICAgIGRvY2tlcjoge1xuICAgICAgICBpbWFnZTogXCJ1bmliZWF1dGlmeS9waHAtY3MtZml4ZXJcIlxuICAgICAgICB3b3JraW5nRGlyOiBcIi9wcm9qZWN0XCJcbiAgICAgIH1cbiAgICB9XG4gIF1cblxuICBvcHRpb25zOlxuICAgIFBIUDpcbiAgICAgIHJ1bGVzOiB0cnVlXG4gICAgICBjc19maXhlcl9wYXRoOiB0cnVlXG4gICAgICBjc19maXhlcl92ZXJzaW9uOiB0cnVlXG4gICAgICBjc19maXhlcl9jb25maWdfZmlsZTogdHJ1ZVxuICAgICAgYWxsb3dfcmlza3k6IHRydWVcbiAgICAgIGxldmVsOiB0cnVlXG4gICAgICBmaXhlcnM6IHRydWVcblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zLCBjb250ZXh0KSAtPlxuICAgIEBkZWJ1ZygncGhwLWNzLWZpeGVyJywgb3B0aW9ucylcbiAgICBwaHAgPSBAZXhlKCdwaHAnKVxuICAgIHBocENzRml4ZXIgPSBAZXhlKCdwaHAtY3MtZml4ZXInKVxuICAgIGNvbmZpZ0ZpbGVzID0gWycucGhwX2NzJywgJy5waHBfY3MuZGlzdCddXG5cbiAgICAjIEZpbmQgYSBjb25maWcgZmlsZSBpbiB0aGUgd29ya2luZyBkaXJlY3RvcnkgaWYgYSBjdXN0b20gb25lIHdhcyBub3QgcHJvdmlkZWRcbiAgICBpZiBub3Qgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZVxuICAgICAgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZSA9IGlmIGNvbnRleHQ/IGFuZCBjb250ZXh0LmZpbGVQYXRoPyB0aGVuIEBmaW5kRmlsZShwYXRoLmRpcm5hbWUoY29udGV4dC5maWxlUGF0aCksIGNvbmZpZ0ZpbGVzKVxuXG4gICAgIyBUcnkgYWdhaW4gdG8gZmluZCBhIGNvbmZpZyBmaWxlIGluIHRoZSBwcm9qZWN0IHJvb3RcbiAgICBpZiBub3Qgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZVxuICAgICAgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZSA9IEBmaW5kRmlsZShhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXSwgY29uZmlnRmlsZXMpXG5cbiAgICBwaHBDc0ZpeGVyT3B0aW9ucyA9IFtcbiAgICAgIFwiZml4XCJcbiAgICAgIFwiLS1ydWxlcz0je29wdGlvbnMucnVsZXN9XCIgaWYgb3B0aW9ucy5ydWxlc1xuICAgICAgXCItLWNvbmZpZz0je29wdGlvbnMuY3NfZml4ZXJfY29uZmlnX2ZpbGV9XCIgaWYgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZVxuICAgICAgXCItLWFsbG93LXJpc2t5PSN7b3B0aW9ucy5hbGxvd19yaXNreX1cIiBpZiBvcHRpb25zLmFsbG93X3Jpc2t5XG4gICAgICBcIi0tdXNpbmctY2FjaGU9bm9cIlxuICAgIF1cbiAgICBpZiBwaHBDc0ZpeGVyLmlzVmVyc2lvbignMS54JylcbiAgICAgIHBocENzRml4ZXJPcHRpb25zID0gW1xuICAgICAgICBcImZpeFwiXG4gICAgICAgIFwiLS1sZXZlbD0je29wdGlvbnMubGV2ZWx9XCIgaWYgb3B0aW9ucy5sZXZlbFxuICAgICAgICBcIi0tZml4ZXJzPSN7b3B0aW9ucy5maXhlcnN9XCIgaWYgb3B0aW9ucy5maXhlcnNcbiAgICAgICAgXCItLWNvbmZpZy1maWxlPSN7b3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZX1cIiBpZiBvcHRpb25zLmNzX2ZpeGVyX2NvbmZpZ19maWxlXG4gICAgICBdXG4gICAgcnVuT3B0aW9ucyA9IHtcbiAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgIGhlbHA6IHtcbiAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXG4gICAgICB9XG4gICAgfVxuXG4gICAgIyBGaW5kIHBocC1jcy1maXhlci5waGFyIHNjcmlwdFxuICAgIGlmIG9wdGlvbnMuY3NfZml4ZXJfcGF0aFxuICAgICAgQGRlcHJlY2F0ZShcIlRoZSBcXFwiY3NfZml4ZXJfcGF0aFxcXCIgaGFzIGJlZW4gZGVwcmVjYXRlZC4gUGxlYXNlIHN3aXRjaCB0byB1c2luZyB0aGUgY29uZmlnIHdpdGggcGF0aCBcXFwiRXhlY3V0YWJsZXMgLSBQSFAtQ1MtRml4ZXIgLSBQYXRoXFxcIiBpbiBBdG9tLUJlYXV0aWZ5IHBhY2thZ2Ugc2V0dGluZ3Mgbm93LlwiKVxuXG4gICAgQFByb21pc2UuYWxsKFtcbiAgICAgIEB3aGljaChvcHRpb25zLmNzX2ZpeGVyX3BhdGgpIGlmIG9wdGlvbnMuY3NfZml4ZXJfcGF0aFxuICAgICAgQHdoaWNoKCdwaHAtY3MtZml4ZXInKVxuICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQsICcucGhwJylcbiAgICBdKS50aGVuKChbY3VzdG9tUGF0aCwgcGhwQ3NGaXhlclBhdGhdKSA9PlxuICAgICAgcGF0aHMgPSBbY3VzdG9tUGF0aCwgcGhwQ3NGaXhlclBhdGhdXG4gICAgICBAZGVidWcoJ3BocC1jcy1maXhlciBwYXRocycsIHBhdGhzKVxuICAgICAgXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbiAgICAgICMgR2V0IGZpcnN0IHZhbGlkLCBhYnNvbHV0ZSBwYXRoXG4gICAgICBwaHBDU0ZpeGVyUGF0aCA9IF8uZmluZChwYXRocywgKHApIC0+IHAgYW5kIHBhdGguaXNBYnNvbHV0ZShwKSApXG4gICAgICBAdmVyYm9zZSgncGhwQ1NGaXhlclBhdGgnLCBwaHBDU0ZpeGVyUGF0aClcbiAgICAgIEBkZWJ1ZygncGhwQ1NGaXhlclBhdGgnLCBwaHBDU0ZpeGVyUGF0aCwgcGF0aHMpXG5cbiAgICAgICMgQ2hlY2sgaWYgUEhQLUNTLUZpeGVyIHBhdGggd2FzIGZvdW5kXG4gICAgICBpZiBwaHBDU0ZpeGVyUGF0aD9cbiAgICAgICAgIyBGb3VuZCBQSFAtQ1MtRml4ZXIgcGF0aFxuICAgICAgICBpZiBAaXNXaW5kb3dzXG4gICAgICAgICAgcGhwLnJ1bihbcGhwQ1NGaXhlclBhdGgsIHBocENzRml4ZXJPcHRpb25zLCB0ZW1wRmlsZV0sIHJ1bk9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbig9PlxuICAgICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAcnVuKHBocENTRml4ZXJQYXRoLCBbcGhwQ3NGaXhlck9wdGlvbnMsIHRlbXBGaWxlXSwgcnVuT3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICAgIClcbiAgICAgIGVsc2VcbiAgICAgICAgQHZlcmJvc2UoJ3BocC1jcy1maXhlciBub3QgZm91bmQhJylcbiAgICAgICAgIyBDb3VsZCBub3QgZmluZCBQSFAtQ1MtRml4ZXIgcGF0aFxuICAgICAgICBAUHJvbWlzZS5yZWplY3QoQGNvbW1hbmROb3RGb3VuZEVycm9yKFxuICAgICAgICAgICdwaHAtY3MtZml4ZXInXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXG4gICAgICAgICAgICBwcm9ncmFtOiBcInBocC1jcy1maXhlci5waGFyXCJcbiAgICAgICAgICAgIHBhdGhPcHRpb246IFwiUEhQIC0gQ1MgRml4ZXIgUGF0aFwiXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgIClcbiJdfQ==
