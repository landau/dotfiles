(function() {
  var CompositeDisposable, Gruvbox, fs, path;

  fs = require('fs');

  path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  Gruvbox = (function() {
    function Gruvbox() {}

    Gruvbox.prototype.config = require('./gruvbox-settings').config;

    Gruvbox.prototype.activate = function() {
      this.disposables = new CompositeDisposable;
      this.packageName = require('../package.json').name;
      this.disposables.add(atom.config.observe("" + this.packageName + ".brightness", (function(_this) {
        return function() {
          return _this.enableConfigTheme();
        };
      })(this)));
      this.disposables.add(atom.config.observe("" + this.packageName + ".contrast", (function(_this) {
        return function() {
          return _this.enableConfigTheme();
        };
      })(this)));
      return this.disposables.add(atom.config.observe("" + this.packageName + ".variant", (function(_this) {
        return function() {
          return _this.enableConfigTheme();
        };
      })(this)));
    };

    Gruvbox.prototype.deactivate = function() {
      return this.disposables.dispose();
    };

    Gruvbox.prototype.enableConfigTheme = function() {
      var brightness, contrast, variant;
      brightness = atom.config.get("" + this.packageName + ".brightness");
      contrast = atom.config.get("" + this.packageName + ".contrast");
      variant = atom.config.get("" + this.packageName + ".variant");
      return this.enableTheme(brightness, contrast, variant);
    };

    Gruvbox.prototype.enableTheme = function(brightness, contrast, variant) {
      var activePackage, activePackages, _i, _len;
      if (!this.isPreviewConfirmed) {
        if (this.isActiveTheme(brightness, contrast, variant)) {
          return;
        }
      }
      try {
        fs.writeFileSync(this.getSyntaxVariablesPath(), this.getSyntaxVariablesContent(brightness, contrast, variant));
        activePackages = atom.packages.getActivePackages();
        if (activePackages.length === 0 || this.isPreview) {
          atom.packages.getLoadedPackage("" + this.packageName).reloadStylesheets();
        } else {
          for (_i = 0, _len = activePackages.length; _i < _len; _i++) {
            activePackage = activePackages[_i];
            activePackage.reloadStylesheets();
          }
        }
        this.activeBrightness = brightness;
        this.activeContrast = contrast;
        return this.activeVariant = variant;
      } catch (_error) {
        return this.enableDefaultTheme();
      }
    };

    Gruvbox.prototype.isActiveTheme = function(brightness, contrast, variant) {
      return brightness === this.activeBrightness && contrast === this.activeContrast && variant === this.activeVariant;
    };

    Gruvbox.prototype.getSyntaxVariablesPath = function() {
      return path.join(__dirname, "..", "styles", "syntax-variables.less");
    };

    Gruvbox.prototype.getSyntaxVariablesContent = function(brightness, contrast, variant) {
      return "@import 'schemes/" + (brightness.toLowerCase()) + "-" + (contrast.toLowerCase()) + "';\n@import 'schemes/" + (brightness.toLowerCase()) + "';\n@import 'colors';\n@import 'variants/" + (this.getNormalizedName(variant)) + "';";
    };

    Gruvbox.prototype.getNormalizedName = function(name) {
      return ("" + name).replace(/\ /g, '-').toLowerCase();
    };

    Gruvbox.prototype.enableDefaultTheme = function() {
      var brightness, contrast, variant;
      brightness = atom.config.get("" + this.packageName + ".brightness");
      contrast = atom.config.get("" + this.packageName + ".contrast");
      variant = atom.config.get("" + this.packageName + ".variant");
      return this.setThemeConfig(brightness, contrast, variant);
    };

    Gruvbox.prototype.setThemeConfig = function(brightness, contrast, variant) {
      atom.config.set("" + this.packageName + ".brightness", brightness);
      atom.config.set("" + this.packageName + ".contrast", contrast);
      return atom.config.set("" + this.packageName + ".variant", variant);
    };

    Gruvbox.prototype.isConfigTheme = function(brightness, contrast, variant) {
      var configBrightness, configContrast, configVariant;
      configBrightness = atom.config.get("" + this.packageName + ".brightness");
      configContrast = atom.config.get("" + this.packageName + ".contrast");
      configVariant = atom.config.get("" + this.packageName + ".variant");
      return brightness === configBrightness && contrast === configContrast && variant === configVariant;
    };

    return Gruvbox;

  })();

  module.exports = new Gruvbox;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvZ3J1dmJveC1wbHVzLXN5bnRheC9saWIvZ3J1dmJveC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFFQTtBQUFBLE1BQUEsc0NBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFGRCxDQUFBOztBQUFBLEVBSU07eUJBRUo7O0FBQUEsc0JBQUEsTUFBQSxHQUFRLE9BQUEsQ0FBUSxvQkFBUixDQUE2QixDQUFDLE1BQXRDLENBQUE7O0FBQUEsc0JBRUEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUVSLE1BQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUFBLENBQUEsbUJBQWYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FBMEIsQ0FBQyxJQUQxQyxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLEVBQUEsR0FBRyxJQUFDLENBQUEsV0FBSixHQUFnQixhQUFwQyxFQUFrRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsRCxDQUFqQixDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsRUFBQSxHQUFHLElB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/gruvbox-plus-syntax/lib/gruvbox.coffee
