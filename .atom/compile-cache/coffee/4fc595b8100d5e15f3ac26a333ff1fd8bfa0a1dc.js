
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

    Lua.prototype.link = "https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/lua-beautifier/beautifier.coffee";

    Lua.prototype.options = {
      Lua: true
    };

    Lua.prototype.beautify = function(text, language, options) {
      options.eol = this.getDefaultLineEnding('\r\n', '\n', options.end_of_line);
      return new this.Promise(function(resolve, reject) {
        var error;
        try {
          return resolve(format(text, options.indent_char.repeat(options.indent_size), this.warn, options));
        } catch (error1) {
          error = error1;
          return reject(error);
        }
      });
    };

    return Lua;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvbHVhLWJlYXV0aWZpZXIvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0FBQUE7QUFBQSxNQUFBLDZCQUFBO0lBQUE7OztFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUDs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBQ2IsTUFBQSxHQUFTLE9BQUEsQ0FBUSxjQUFSOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O2tCQUNyQixJQUFBLEdBQU07O2tCQUNOLElBQUEsR0FBTTs7a0JBRU4sT0FBQSxHQUFTO01BQ1AsR0FBQSxFQUFLLElBREU7OztrQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtNQUNSLE9BQU8sQ0FBQyxHQUFSLEdBQWMsSUFBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCLEVBQTZCLElBQTdCLEVBQWtDLE9BQU8sQ0FBQyxXQUExQzthQUNWLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ1gsWUFBQTtBQUFBO2lCQUNFLE9BQUEsQ0FBUSxNQUFBLENBQU8sSUFBUCxFQUFhLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBcEIsQ0FBMkIsT0FBTyxDQUFDLFdBQW5DLENBQWIsRUFBOEQsSUFBQyxDQUFBLElBQS9ELEVBQXFFLE9BQXJFLENBQVIsRUFERjtTQUFBLGNBQUE7VUFFTTtpQkFDSixNQUFBLENBQU8sS0FBUCxFQUhGOztNQURXLENBQVQ7SUFGSTs7OztLQVJ1QjtBQVJuQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIyMjXG5wYXRoID0gcmVxdWlyZShcInBhdGhcIilcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuLi9iZWF1dGlmaWVyJylcbmZvcm1hdCA9IHJlcXVpcmUgJy4vYmVhdXRpZmllcidcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBMdWEgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiTHVhIGJlYXV0aWZpZXJcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9HbGF2aW4wMDEvYXRvbS1iZWF1dGlmeS9ibG9iL21hc3Rlci9zcmMvYmVhdXRpZmllcnMvbHVhLWJlYXV0aWZpZXIvYmVhdXRpZmllci5jb2ZmZWVcIlxuXG4gIG9wdGlvbnM6IHtcbiAgICBMdWE6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgb3B0aW9ucy5lb2wgPSBAZ2V0RGVmYXVsdExpbmVFbmRpbmcoJ1xcclxcbicsJ1xcbicsb3B0aW9ucy5lbmRfb2ZfbGluZSlcbiAgICBuZXcgQFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIHRyeVxuICAgICAgICByZXNvbHZlIGZvcm1hdCB0ZXh0LCBvcHRpb25zLmluZGVudF9jaGFyLnJlcGVhdChvcHRpb25zLmluZGVudF9zaXplKSwgQHdhcm4sIG9wdGlvbnNcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIHJlamVjdCBlcnJvclxuIl19
