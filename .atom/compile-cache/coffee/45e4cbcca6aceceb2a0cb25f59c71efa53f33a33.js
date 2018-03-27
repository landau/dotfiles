
/*
Requires https://github.com/jaspervdj/stylish-haskell
 */

(function() {
  "use strict";
  var Beautifier, Crystal,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Crystal = (function(superClass) {
    extend(Crystal, superClass);

    function Crystal() {
      return Crystal.__super__.constructor.apply(this, arguments);
    }

    Crystal.prototype.name = "Crystal";

    Crystal.prototype.link = "http://crystal-lang.org";

    Crystal.prototype.isPreInstalled = false;

    Crystal.prototype.options = {
      Crystal: false
    };

    Crystal.prototype.beautify = function(text, language, options) {
      var tempFile;
      if (this.isWindows) {
        return this.Promise.reject(this.commandNotFoundError('crystal', {
          link: "http://crystal-lang.org",
          program: "crystal"
        }));
      } else {
        return this.run("crystal", ['tool', 'format', tempFile = this.tempFile("temp", text)], {
          ignoreReturnCode: true
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return Crystal;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvY3J5c3RhbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsbUJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3NCQUNyQixJQUFBLEdBQU07O3NCQUNOLElBQUEsR0FBTTs7c0JBQ04sY0FBQSxHQUFnQjs7c0JBRWhCLE9BQUEsR0FBUztNQUNQLE9BQUEsRUFBUyxLQURGOzs7c0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFFUixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsU0FBSjtlQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixJQUFDLENBQUEsb0JBQUQsQ0FDZCxTQURjLEVBRWQ7VUFDQSxJQUFBLEVBQU0seUJBRE47VUFFQSxPQUFBLEVBQVMsU0FGVDtTQUZjLENBQWhCLEVBREY7T0FBQSxNQUFBO2VBU0UsSUFBQyxDQUFBLEdBQUQsQ0FBSyxTQUFMLEVBQWdCLENBQ2QsTUFEYyxFQUVkLFFBRmMsRUFHZCxRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLENBSEcsQ0FBaEIsRUFJSztVQUFDLGdCQUFBLEVBQWtCLElBQW5CO1NBSkwsQ0FLRSxDQUFDLElBTEgsQ0FLUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtVQURJO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUxSLEVBVEY7O0lBRlE7Ozs7S0FUMkI7QUFQdkMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNwZXJ2ZGovc3R5bGlzaC1oYXNrZWxsXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIENyeXN0YWwgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiQ3J5c3RhbFwiXG4gIGxpbms6IFwiaHR0cDovL2NyeXN0YWwtbGFuZy5vcmdcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgQ3J5c3RhbDogZmFsc2VcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgIyBTZWVtcyB0aGF0IENyeXN0YWwgZG9zZW4ndCBoYXZlIFdpbmRvd3Mgc3VwcG9ydCB5ZXQuXG4gICAgaWYgQGlzV2luZG93c1xuICAgICAgQFByb21pc2UucmVqZWN0KEBjb21tYW5kTm90Rm91bmRFcnJvcihcbiAgICAgICAgJ2NyeXN0YWwnXG4gICAgICAgIHtcbiAgICAgICAgbGluazogXCJodHRwOi8vY3J5c3RhbC1sYW5nLm9yZ1wiXG4gICAgICAgIHByb2dyYW06IFwiY3J5c3RhbFwiXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgZWxzZVxuICAgICAgQHJ1bihcImNyeXN0YWxcIiwgW1xuICAgICAgICAndG9vbCcsXG4gICAgICAgICdmb3JtYXQnLFxuICAgICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dClcbiAgICAgICAgXSwge2lnbm9yZVJldHVybkNvZGU6IHRydWV9KVxuICAgICAgICAudGhlbig9PlxuICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgKVxuIl19
