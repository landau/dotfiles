
/*
Requires [dfmt](https://github.com/Hackerpilot/dfmt)
 */

(function() {
  "use strict";
  var Beautifier, Dfmt,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Dfmt = (function(superClass) {
    extend(Dfmt, superClass);

    function Dfmt() {
      return Dfmt.__super__.constructor.apply(this, arguments);
    }

    Dfmt.prototype.name = "dfmt";

    Dfmt.prototype.link = "https://github.com/Hackerpilot/dfmt";

    Dfmt.prototype.isPreInstalled = false;

    Dfmt.prototype.options = {
      D: false
    };

    Dfmt.prototype.beautify = function(text, language, options) {
      return this.run("dfmt", [this.tempFile("input", text)]);
    };

    return Dfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvZGZtdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFHQTtBQUhBLE1BQUEsZ0JBQUE7SUFBQTs7O0VBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O21CQUNyQixJQUFBLEdBQU07O21CQUNOLElBQUEsR0FBTTs7bUJBQ04sY0FBQSxHQUFnQjs7bUJBRWhCLE9BQUEsR0FBUztNQUNQLENBQUEsRUFBRyxLQURJOzs7bUJBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUwsRUFBYSxDQUNYLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQURXLENBQWI7SUFEUTs7OztLQVR3QjtBQU5wQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgW2RmbXRdKGh0dHBzOi8vZ2l0aHViLmNvbS9IYWNrZXJwaWxvdC9kZm10KVxuIyMjXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRGZtdCBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJkZm10XCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vSGFja2VycGlsb3QvZGZtdFwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6IHtcbiAgICBEOiBmYWxzZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAcnVuKFwiZGZtdFwiLCBbXG4gICAgICBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KVxuICAgICAgXSlcbiJdfQ==
