
/*
Requires https://github.com/andialbrecht/sqlparse
 */

(function() {
  "use strict";
  var Beautifier, Sqlformat,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Sqlformat = (function(superClass) {
    extend(Sqlformat, superClass);

    function Sqlformat() {
      return Sqlformat.__super__.constructor.apply(this, arguments);
    }

    Sqlformat.prototype.name = "sqlformat";

    Sqlformat.prototype.link = "https://github.com/andialbrecht/sqlparse";

    Sqlformat.prototype.isPreInstalled = false;

    Sqlformat.prototype.options = {
      SQL: true
    };

    Sqlformat.prototype.beautify = function(text, language, options) {
      return this.run("sqlformat", [this.tempFile("input", text), "--reindent", options.indent_size != null ? "--indent_width=" + options.indent_size : void 0, (options.keywords != null) && options.keywords !== 'unchanged' ? "--keywords=" + options.keywords : void 0, (options.identifiers != null) && options.identifiers !== 'unchanged' ? "--identifiers=" + options.identifiers : void 0], {
        help: {
          link: "https://github.com/andialbrecht/sqlparse"
        }
      });
    };

    return Sqlformat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvc3FsZm9ybWF0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxxQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7d0JBQ3JCLElBQUEsR0FBTTs7d0JBQ04sSUFBQSxHQUFNOzt3QkFDTixjQUFBLEdBQWdCOzt3QkFFaEIsT0FBQSxHQUFTO01BQ1AsR0FBQSxFQUFLLElBREU7Ozt3QkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjthQUNSLElBQUMsQ0FBQSxHQUFELENBQUssV0FBTCxFQUFrQixDQUNoQixJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FEZ0IsRUFFaEIsWUFGZ0IsRUFHMkIsMkJBQTNDLEdBQUEsaUJBQUEsR0FBa0IsT0FBTyxDQUFDLFdBQTFCLEdBQUEsTUFIZ0IsRUFJcUIsMEJBQUEsSUFBcUIsT0FBTyxDQUFDLFFBQVIsS0FBb0IsV0FBOUUsR0FBQSxhQUFBLEdBQWMsT0FBTyxDQUFDLFFBQXRCLEdBQUEsTUFKZ0IsRUFLMkIsNkJBQUEsSUFBd0IsT0FBTyxDQUFDLFdBQVIsS0FBdUIsV0FBMUYsR0FBQSxnQkFBQSxHQUFpQixPQUFPLENBQUMsV0FBekIsR0FBQSxNQUxnQixDQUFsQixFQU1LO1FBQUEsSUFBQSxFQUFNO1VBQ1AsSUFBQSxFQUFNLDBDQURDO1NBQU47T0FOTDtJQURROzs7O0tBVDZCO0FBUHpDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vYW5kaWFsYnJlY2h0L3NxbHBhcnNlXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNxbGZvcm1hdCBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJzcWxmb3JtYXRcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9hbmRpYWxicmVjaHQvc3FscGFyc2VcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgU1FMOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBydW4oXCJzcWxmb3JtYXRcIiwgW1xuICAgICAgQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dClcbiAgICAgIFwiLS1yZWluZGVudFwiXG4gICAgICBcIi0taW5kZW50X3dpZHRoPSN7b3B0aW9ucy5pbmRlbnRfc2l6ZX1cIiBpZiBvcHRpb25zLmluZGVudF9zaXplP1xuICAgICAgXCItLWtleXdvcmRzPSN7b3B0aW9ucy5rZXl3b3Jkc31cIiBpZiAob3B0aW9ucy5rZXl3b3Jkcz8gJiYgb3B0aW9ucy5rZXl3b3JkcyAhPSAndW5jaGFuZ2VkJylcbiAgICAgIFwiLS1pZGVudGlmaWVycz0je29wdGlvbnMuaWRlbnRpZmllcnN9XCIgaWYgKG9wdGlvbnMuaWRlbnRpZmllcnM/ICYmIG9wdGlvbnMuaWRlbnRpZmllcnMgIT0gJ3VuY2hhbmdlZCcpXG4gICAgICBdLCBoZWxwOiB7XG4gICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2FuZGlhbGJyZWNodC9zcWxwYXJzZVwiXG4gICAgICB9KVxuIl19
