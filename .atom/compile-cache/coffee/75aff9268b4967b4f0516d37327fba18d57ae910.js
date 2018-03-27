
/*
Requires https://github.com/jaspervdj/stylish-haskell
 */

(function() {
  "use strict";
  var Beautifier, StylishHaskell,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = StylishHaskell = (function(_super) {
    __extends(StylishHaskell, _super);

    function StylishHaskell() {
      return StylishHaskell.__super__.constructor.apply(this, arguments);
    }

    StylishHaskell.prototype.name = "stylish-haskell";

    StylishHaskell.prototype.link = "https://github.com/jaspervdj/stylish-haskell";

    StylishHaskell.prototype.options = {
      Haskell: true
    };

    StylishHaskell.prototype.beautify = function(text, language, options) {
      return this.run("stylish-haskell", [this.tempFile("input", text)], {
        help: {
          link: "https://github.com/jaspervdj/stylish-haskell"
        }
      });
    };

    return StylishHaskell;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvc3R5bGlzaC1oYXNrZWxsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFJQSxZQUpBLENBQUE7QUFBQSxNQUFBLDBCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FMYixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIscUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDZCQUFBLElBQUEsR0FBTSxpQkFBTixDQUFBOztBQUFBLDZCQUNBLElBQUEsR0FBTSw4Q0FETixDQUFBOztBQUFBLDZCQUdBLE9BQUEsR0FBUztBQUFBLE1BQ1AsT0FBQSxFQUFTLElBREY7S0FIVCxDQUFBOztBQUFBLDZCQU9BLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLGlCQUFMLEVBQXdCLENBQ3RCLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQURzQixDQUF4QixFQUVLO0FBQUEsUUFDRCxJQUFBLEVBQU07QUFBQSxVQUNKLElBQUEsRUFBTSw4Q0FERjtTQURMO09BRkwsRUFEUTtJQUFBLENBUFYsQ0FBQTs7MEJBQUE7O0tBRDRDLFdBUDlDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/beautifiers/stylish-haskell.coffee
