
/*
 */

(function() {
  var Beautifier, Lua, format, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require("path");

  "use strict";

  Beautifier = require('../beautifier');

  format = require('./beautifier');

  module.exports = Lua = (function(superClass) {
    extend(Lua, superClass);

    function Lua() {
      return Lua.__super__.constructor.apply(this, arguments);
    }

    Lua.prototype.name = "Lua beautifier";

    Lua.prototype.link = "https://www.perl.org/";

    Lua.prototype.isPreInstalled = false;

    Lua.prototype.options = {
      Lua: true
    };

    Lua.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var error;
        try {
          return resolve(format(text, options.indent_char.repeat(options.indent_size)));
        } catch (error1) {
          error = error1;
          return reject(error);
        }
      });
    };

    return Lua;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvbHVhLWJlYXV0aWZpZXIvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0FBQUE7QUFBQSxNQUFBLDZCQUFBO0lBQUE7OztFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUDs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBQ2IsTUFBQSxHQUFTLE9BQUEsQ0FBUSxjQUFSOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O2tCQUNyQixJQUFBLEdBQU07O2tCQUNOLElBQUEsR0FBTTs7a0JBQ04sY0FBQSxHQUFnQjs7a0JBRWhCLE9BQUEsR0FBUztNQUNQLEdBQUEsRUFBSyxJQURFOzs7a0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7YUFDSixJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNYLFlBQUE7QUFBQTtpQkFDRSxPQUFBLENBQVEsTUFBQSxDQUFPLElBQVAsRUFBYSxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQXBCLENBQTJCLE9BQU8sQ0FBQyxXQUFuQyxDQUFiLENBQVIsRUFERjtTQUFBLGNBQUE7VUFFTTtpQkFDSixNQUFBLENBQU8sS0FBUCxFQUhGOztNQURXLENBQVQ7SUFESTs7OztLQVR1QjtBQVJuQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIyMjXG5wYXRoID0gcmVxdWlyZShcInBhdGhcIilcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuLi9iZWF1dGlmaWVyJylcbmZvcm1hdCA9IHJlcXVpcmUgJy4vYmVhdXRpZmllcidcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBMdWEgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiTHVhIGJlYXV0aWZpZXJcIlxuICBsaW5rOiBcImh0dHBzOi8vd3d3LnBlcmwub3JnL1wiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6IHtcbiAgICBMdWE6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgbmV3IEBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICB0cnlcbiAgICAgICAgcmVzb2x2ZSBmb3JtYXQgdGV4dCwgb3B0aW9ucy5pbmRlbnRfY2hhci5yZXBlYXQgb3B0aW9ucy5pbmRlbnRfc2l6ZVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgcmVqZWN0IGVycm9yXG4iXX0=
