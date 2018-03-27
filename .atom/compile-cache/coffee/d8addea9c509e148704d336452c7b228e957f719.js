
/*
Requires [formatR](https://github.com/yihui/formatR)
 */

(function() {
  var Beautifier, R, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require("path");

  "use strict";

  Beautifier = require('../beautifier');

  module.exports = R = (function(superClass) {
    extend(R, superClass);

    function R() {
      return R.__super__.constructor.apply(this, arguments);
    }

    R.prototype.name = "formatR";

    R.prototype.link = "https://github.com/yihui/formatR";

    R.prototype.isPreInstalled = false;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvZm9ybWF0Ui9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7QUFBQSxNQUFBLG1CQUFBO0lBQUE7OztFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUDs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7Z0JBQ3JCLElBQUEsR0FBTTs7Z0JBQ04sSUFBQSxHQUFNOztnQkFDTixjQUFBLEdBQWdCOztnQkFFaEIsT0FBQSxHQUFTO01BQ1AsQ0FBQSxFQUFHLElBREk7OztnQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7TUFBQSxZQUFBLEdBQWUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLFdBQXhCO2FBQ2YsSUFBQyxDQUFBLEdBQUQsQ0FBSyxTQUFMLEVBQWdCLENBQ2QsWUFEYyxFQUVkLE9BQU8sQ0FBQyxXQUZNLEVBR2QsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBSGMsRUFJZCxHQUpjLEVBS2QsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBTGMsQ0FBaEI7SUFGUTs7OztLQVRxQjtBQVJqQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgW2Zvcm1hdFJdKGh0dHBzOi8vZ2l0aHViLmNvbS95aWh1aS9mb3JtYXRSKVxuIyMjXG5wYXRoID0gcmVxdWlyZShcInBhdGhcIilcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBSIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcImZvcm1hdFJcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS95aWh1aS9mb3JtYXRSXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFI6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgcl9iZWF1dGlmaWVyID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJmb3JtYXRSLnJcIilcbiAgICBAcnVuKFwiUnNjcmlwdFwiLCBbXG4gICAgICByX2JlYXV0aWZpZXIsXG4gICAgICBvcHRpb25zLmluZGVudF9zaXplLFxuICAgICAgQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dCksXG4gICAgICAnPicsXG4gICAgICBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KVxuICAgICAgXSlcbiJdfQ==
