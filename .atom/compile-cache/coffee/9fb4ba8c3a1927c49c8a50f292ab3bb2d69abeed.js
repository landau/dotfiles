(function() {
  "use strict";
  var Beautifier, NginxBeautify,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = NginxBeautify = (function(superClass) {
    extend(NginxBeautify, superClass);

    function NginxBeautify() {
      return NginxBeautify.__super__.constructor.apply(this, arguments);
    }

    NginxBeautify.prototype.name = "Nginx Beautify";

    NginxBeautify.prototype.link = "https://github.com/denysvitali/nginxbeautify";

    NginxBeautify.prototype.isPreInstalled = false;

    NginxBeautify.prototype.options = {
      Nginx: {
        spaces: [
          "indent_with_tabs", "indent_size", "indent_char", function(indent_with_tabs, indent_size, indent_char) {
            if (indent_with_tabs || indent_char === "\t") {
              return 0;
            } else {
              return indent_size;
            }
          }
        ],
        tabs: [
          "indent_with_tabs", "indent_size", "indent_char", function(indent_with_tabs, indent_size, indent_char) {
            if (indent_with_tabs || indent_char === "\t") {
              return indent_size;
            } else {
              return 0;
            }
          }
        ],
        dontJoinCurlyBracet: true
      }
    };

    NginxBeautify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var Beautify, error, instance;
        Beautify = require("nginxbeautify");
        instance = new Beautify(options);
        try {
          return resolve(instance.parse(text));
        } catch (error1) {
          error = error1;
          return reject(error);
        }
      });
    };

    return NginxBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvbmdpbngtYmVhdXRpZnkuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHlCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozs0QkFDckIsSUFBQSxHQUFNOzs0QkFDTixJQUFBLEdBQU07OzRCQUNOLGNBQUEsR0FBZ0I7OzRCQUVoQixPQUFBLEdBQVM7TUFDUCxLQUFBLEVBQU87UUFDTCxNQUFBLEVBQVE7VUFBQyxrQkFBRCxFQUFxQixhQUFyQixFQUFvQyxhQUFwQyxFQUFtRCxTQUFDLGdCQUFELEVBQW1CLFdBQW5CLEVBQWdDLFdBQWhDO1lBQ3pELElBQUcsZ0JBQUEsSUFBb0IsV0FBQSxLQUFlLElBQXRDO3FCQUNFLEVBREY7YUFBQSxNQUFBO3FCQUdFLFlBSEY7O1VBRHlELENBQW5EO1NBREg7UUFPTCxJQUFBLEVBQU07VUFBQyxrQkFBRCxFQUFxQixhQUFyQixFQUFvQyxhQUFwQyxFQUFtRCxTQUFDLGdCQUFELEVBQW1CLFdBQW5CLEVBQWdDLFdBQWhDO1lBQ3ZELElBQUcsZ0JBQUEsSUFBb0IsV0FBQSxLQUFlLElBQXRDO3FCQUNFLFlBREY7YUFBQSxNQUFBO3FCQUdFLEVBSEY7O1VBRHVELENBQW5EO1NBUEQ7UUFhTCxtQkFBQSxFQUFxQixJQWJoQjtPQURBOzs7NEJBa0JULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBRVIsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixZQUFBO1FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxlQUFSO1FBQ1gsUUFBQSxHQUFlLElBQUEsUUFBQSxDQUFTLE9BQVQ7QUFDZjtpQkFDRSxPQUFBLENBQVEsUUFBUSxDQUFDLEtBQVQsQ0FBZSxJQUFmLENBQVIsRUFERjtTQUFBLGNBQUE7VUFFTTtpQkFFSixNQUFBLENBQU8sS0FBUCxFQUpGOztNQUhrQixDQUFUO0lBRkg7Ozs7S0F2QmlDO0FBSDdDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIE5naW54QmVhdXRpZnkgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiTmdpbnggQmVhdXRpZnlcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9kZW55c3ZpdGFsaS9uZ2lueGJlYXV0aWZ5XCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIE5naW54OiB7XG4gICAgICBzcGFjZXM6IFtcImluZGVudF93aXRoX3RhYnNcIiwgXCJpbmRlbnRfc2l6ZVwiLCBcImluZGVudF9jaGFyXCIsIChpbmRlbnRfd2l0aF90YWJzLCBpbmRlbnRfc2l6ZSwgaW5kZW50X2NoYXIpIC0+XG4gICAgICAgIGlmIGluZGVudF93aXRoX3RhYnMgb3IgaW5kZW50X2NoYXIgaXMgXCJcXHRcIlxuICAgICAgICAgIDBcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGluZGVudF9zaXplXG4gICAgICBdXG4gICAgICB0YWJzOiBbXCJpbmRlbnRfd2l0aF90YWJzXCIsIFwiaW5kZW50X3NpemVcIiwgXCJpbmRlbnRfY2hhclwiLCAoaW5kZW50X3dpdGhfdGFicywgaW5kZW50X3NpemUsIGluZGVudF9jaGFyKSAtPlxuICAgICAgICBpZiBpbmRlbnRfd2l0aF90YWJzIG9yIGluZGVudF9jaGFyIGlzIFwiXFx0XCJcbiAgICAgICAgICBpbmRlbnRfc2l6ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgMFxuICAgICAgXVxuICAgICAgZG9udEpvaW5DdXJseUJyYWNldDogdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG5cbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICBCZWF1dGlmeSA9IHJlcXVpcmUoXCJuZ2lueGJlYXV0aWZ5XCIpXG4gICAgICBpbnN0YW5jZSA9IG5ldyBCZWF1dGlmeShvcHRpb25zKVxuICAgICAgdHJ5XG4gICAgICAgIHJlc29sdmUoaW5zdGFuY2UucGFyc2UodGV4dCkpXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICAjIEVycm9yIG9jY3VycmVkXG4gICAgICAgIHJlamVjdChlcnJvcilcbiAgICApXG4iXX0=
