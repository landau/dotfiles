(function() {
  "use strict";
  var BashBeautify, Beautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = BashBeautify = (function(superClass) {
    extend(BashBeautify, superClass);

    function BashBeautify() {
      return BashBeautify.__super__.constructor.apply(this, arguments);
    }

    BashBeautify.prototype.name = "beautysh";

    BashBeautify.prototype.link = "https://github.com/bemeurer/beautysh";

    BashBeautify.prototype.isPreInstalled = false;

    BashBeautify.prototype.options = {
      Bash: {
        indent_size: true
      }
    };

    BashBeautify.prototype.beautify = function(text, language, options) {
      var file;
      file = this.tempFile("input", text);
      return this.run('beautysh', ['-i', options.indent_size, '-f', file], {
        help: {
          link: "https://github.com/bemeurer/beautysh"
        }
      }).then((function(_this) {
        return function() {
          return _this.readFile(file);
        };
      })(this));
    };

    return BashBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvYmVhdXR5c2guY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OzsyQkFDckIsSUFBQSxHQUFNOzsyQkFDTixJQUFBLEdBQU07OzJCQUNOLGNBQUEsR0FBZ0I7OzJCQUVoQixPQUFBLEdBQVM7TUFDUCxJQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsSUFBYjtPQUZLOzs7MkJBS1QsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQjthQUNQLElBQUMsQ0FBQSxHQUFELENBQUssVUFBTCxFQUFpQixDQUFFLElBQUYsRUFBUSxPQUFPLENBQUMsV0FBaEIsRUFBNkIsSUFBN0IsRUFBbUMsSUFBbkMsQ0FBakIsRUFBNEQ7UUFBQSxJQUFBLEVBQU07VUFBRSxJQUFBLEVBQU0sc0NBQVI7U0FBTjtPQUE1RCxDQUNBLENBQUMsSUFERCxDQUNNLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsUUFBRCxDQUFVLElBQVY7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETjtJQUZROzs7O0tBVmdDO0FBSDVDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEJhc2hCZWF1dGlmeSBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJiZWF1dHlzaFwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2JlbWV1cmVyL2JlYXV0eXNoXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIEJhc2g6XG4gICAgICBpbmRlbnRfc2l6ZTogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBmaWxlID0gQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dClcbiAgICBAcnVuKCdiZWF1dHlzaCcsIFsgJy1pJywgb3B0aW9ucy5pbmRlbnRfc2l6ZSwgJy1mJywgZmlsZSBdLCBoZWxwOiB7IGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2JlbWV1cmVyL2JlYXV0eXNoXCIgfSlcbiAgICAudGhlbig9PiBAcmVhZEZpbGUgZmlsZSlcbiJdfQ==
