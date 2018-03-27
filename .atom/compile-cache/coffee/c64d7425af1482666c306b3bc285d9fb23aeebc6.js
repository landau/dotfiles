(function() {
  "use strict";
  var Beautifier, Cljfmt, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  Beautifier = require('../beautifier');

  module.exports = Cljfmt = (function(_super) {
    __extends(Cljfmt, _super);

    function Cljfmt() {
      return Cljfmt.__super__.constructor.apply(this, arguments);
    }

    Cljfmt.prototype.name = "cljfmt";

    Cljfmt.prototype.link = "https://github.com/snoe/node-cljfmt";

    Cljfmt.prototype.options = {
      Clojure: false
    };

    Cljfmt.prototype.beautify = function(text, language, options) {
      var cljfmt, formatPath;
      formatPath = path.resolve(__dirname, "fmt.edn");
      cljfmt = path.resolve(__dirname, "..", "..", "..", "node_modules/.bin/cljfmt");
      return this.tempFile("input", text).then((function(_this) {
        return function(filePath) {
          return _this.run(cljfmt, [filePath, "--edn=" + formatPath]).then(function() {
            return _this.readFile(filePath);
          });
        };
      })(this));
    };

    return Cljfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvY2xqZm10L2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxZQUFBLENBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBRmIsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBRXJCLDZCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxxQkFBQSxJQUFBLEdBQU0sUUFBTixDQUFBOztBQUFBLHFCQUNBLElBQUEsR0FBTSxxQ0FETixDQUFBOztBQUFBLHFCQUdBLE9BQUEsR0FBUztBQUFBLE1BQ1AsT0FBQSxFQUFTLEtBREY7S0FIVCxDQUFBOztBQUFBLHFCQU9BLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEdBQUE7QUFDUixVQUFBLGtCQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLFNBQXhCLENBQWIsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixJQUF4QixFQUE4QixJQUE5QixFQUFvQyxJQUFwQyxFQUEwQywwQkFBMUMsQ0FEVCxDQUFBO2FBRUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsUUFBRCxHQUFBO2lCQUM1QixLQUFDLENBQUEsR0FBRCxDQUFLLE1BQUwsRUFBYSxDQUNYLFFBRFcsRUFFWCxRQUFBLEdBQVcsVUFGQSxDQUFiLENBR0UsQ0FBQyxJQUhILENBR1EsU0FBQSxHQUFBO21CQUNOLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQURNO1VBQUEsQ0FIUixFQUQ0QjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCLEVBSFE7SUFBQSxDQVBWLENBQUE7O2tCQUFBOztLQUZvQyxXQUp0QyxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/beautifiers/cljfmt/index.coffee
