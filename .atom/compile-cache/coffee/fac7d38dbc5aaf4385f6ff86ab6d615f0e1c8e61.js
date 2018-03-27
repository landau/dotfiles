
/*
 */

(function() {
  var Beautifier, Lua, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require("path");

  "use strict";

  Beautifier = require('../beautifier');

  module.exports = Lua = (function(_super) {
    __extends(Lua, _super);

    function Lua() {
      return Lua.__super__.constructor.apply(this, arguments);
    }

    Lua.prototype.name = "lua";

    Lua.prototype.options = {
      Lua: true
    };

    Lua.prototype.beautify = function(text, language, options) {
      var lua_beautifier;
      lua_beautifier = path.resolve(__dirname, "beautifier.pl");
      return this.run("perl", [lua_beautifier, '<', this.tempFile("input", text)]);
    };

    return Lua;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvbHVhLWJlYXV0aWZpZXIvaW5kZXguY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTtHQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUEscUJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFJQSxZQUpBLENBQUE7O0FBQUEsRUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FMYixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsMEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLGtCQUFBLElBQUEsR0FBTSxLQUFOLENBQUE7O0FBQUEsa0JBRUEsT0FBQSxHQUFTO0FBQUEsTUFDUCxHQUFBLEVBQUssSUFERTtLQUZULENBQUE7O0FBQUEsa0JBTUEsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTtBQUNSLFVBQUEsY0FBQTtBQUFBLE1BQUEsY0FBQSxHQUFpQixJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsZUFBeEIsQ0FBakIsQ0FBQTthQUNBLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTCxFQUFhLENBQ1gsY0FEVyxFQUVYLEdBRlcsRUFHWCxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FIVyxDQUFiLEVBRlE7SUFBQSxDQU5WLENBQUE7O2VBQUE7O0tBRGlDLFdBUG5DLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/beautifiers/lua-beautifier/index.coffee
