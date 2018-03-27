
/*
Requires https://github.com/avh4/elm-format
 */

(function() {
  "use strict";
  var Beautifier, ElmFormat,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = ElmFormat = (function(superClass) {
    extend(ElmFormat, superClass);

    function ElmFormat() {
      return ElmFormat.__super__.constructor.apply(this, arguments);
    }

    ElmFormat.prototype.name = "elm-format";

    ElmFormat.prototype.link = "https://github.com/avh4/elm-format";

    ElmFormat.prototype.isPreInstalled = false;

    ElmFormat.prototype.options = {
      Elm: true
    };

    ElmFormat.prototype.beautify = function(text, language, options) {
      var tempfile;
      return tempfile = this.tempFile("input", text, ".elm").then((function(_this) {
        return function(name) {
          return _this.run("elm-format", ['--yes', name], {
            help: {
              link: 'https://github.com/avh4/elm-format#installation-'
            }
          }).then(function() {
            return _this.readFile(name);
          });
        };
      })(this));
    };

    return ElmFormat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvZWxtLWZvcm1hdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFHQTtBQUhBLE1BQUEscUJBQUE7SUFBQTs7O0VBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3dCQUNyQixJQUFBLEdBQU07O3dCQUNOLElBQUEsR0FBTTs7d0JBQ04sY0FBQSxHQUFnQjs7d0JBRWhCLE9BQUEsR0FBUztNQUNQLEdBQUEsRUFBSyxJQURFOzs7d0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO2FBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixFQUF5QixNQUF6QixDQUNYLENBQUMsSUFEVSxDQUNMLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO2lCQUNKLEtBQUMsQ0FBQSxHQUFELENBQUssWUFBTCxFQUFtQixDQUNqQixPQURpQixFQUVqQixJQUZpQixDQUFuQixFQUlFO1lBQUUsSUFBQSxFQUFNO2NBQUUsSUFBQSxFQUFNLGtEQUFSO2FBQVI7V0FKRixDQU1BLENBQUMsSUFORCxDQU1NLFNBQUE7bUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWO1VBREksQ0FOTjtRQURJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURLO0lBREg7Ozs7S0FUNkI7QUFOekMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9hdmg0L2VsbS1mb3JtYXRcbiMjI1xuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEVsbUZvcm1hdCBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJlbG0tZm9ybWF0XCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYXZoNC9lbG0tZm9ybWF0XCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIEVsbTogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICB0ZW1wZmlsZSA9IEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQsIFwiLmVsbVwiKVxuICAgIC50aGVuIChuYW1lKSA9PlxuICAgICAgQHJ1bihcImVsbS1mb3JtYXRcIiwgW1xuICAgICAgICAnLS15ZXMnLFxuICAgICAgICBuYW1lXG4gICAgICAgIF0sXG4gICAgICAgIHsgaGVscDogeyBsaW5rOiAnaHR0cHM6Ly9naXRodWIuY29tL2F2aDQvZWxtLWZvcm1hdCNpbnN0YWxsYXRpb24tJyB9IH1cbiAgICAgIClcbiAgICAgIC50aGVuICgpID0+XG4gICAgICAgIEByZWFkRmlsZShuYW1lKVxuIl19
