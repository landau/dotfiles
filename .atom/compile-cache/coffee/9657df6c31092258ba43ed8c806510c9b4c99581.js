
/*
Requires [formatR](https://github.com/yihui/formatR)
 */

(function() {
  var Beautifier, R, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require("path");

  "use strict";

  Beautifier = require('../beautifier');

  module.exports = R = (function(_super) {
    __extends(R, _super);

    function R() {
      return R.__super__.constructor.apply(this, arguments);
    }

    R.prototype.name = "formatR";

    R.prototype.link = "https://github.com/yihui/formatR";

    R.prototype.options = {
      R: true
    };

    R.prototype.beautify = function(text, language, options) {
      var r_beautifier;
      r_beautifier = path.resolve(__dirname, "formatR.r");
      return this.run("Rscript", [r_beautifier, options.indent_size, this.tempFile("input", text), '>', this.tempFile("input", text)]);
    };

    return R;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvZm9ybWF0Ui9pbmRleC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBOztHQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUEsbUJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUhQLENBQUE7O0FBQUEsRUFLQSxZQUxBLENBQUE7O0FBQUEsRUFNQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FOYixDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsd0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLGdCQUFBLElBQUEsR0FBTSxTQUFOLENBQUE7O0FBQUEsZ0JBQ0EsSUFBQSxHQUFNLGtDQUROLENBQUE7O0FBQUEsZ0JBR0EsT0FBQSxHQUFTO0FBQUEsTUFDUCxDQUFBLEVBQUcsSUFESTtLQUhULENBQUE7O0FBQUEsZ0JBT0EsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTtBQUNSLFVBQUEsWUFBQTtBQUFBLE1BQUEsWUFBQSxHQUFlLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixXQUF4QixDQUFmLENBQUE7YUFDQSxJQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsRUFBZ0IsQ0FDZCxZQURjLEVBRWQsT0FBTyxDQUFDLFdBRk0sRUFHZCxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FIYyxFQUlkLEdBSmMsRUFLZCxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FMYyxDQUFoQixFQUZRO0lBQUEsQ0FQVixDQUFBOzthQUFBOztLQUQrQixXQVJqQyxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/beautifiers/formatR/index.coffee
