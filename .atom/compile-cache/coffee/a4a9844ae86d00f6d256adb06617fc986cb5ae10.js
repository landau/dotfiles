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

    BashBeautify.prototype.executables = [
      {
        name: "beautysh",
        cmd: "beautysh",
        homepage: "https://github.com/bemeurer/beautysh",
        installation: "https://github.com/bemeurer/beautysh#installation",
        version: {
          args: ['--help'],
          parse: function(text) {
            return text.indexOf("usage: beautysh") !== -1 && "0.0.0";
          }
        },
        docker: {
          image: "unibeautify/beautysh"
        }
      }
    ];

    BashBeautify.prototype.options = {
      Bash: {
        indent_size: true
      }
    };

    BashBeautify.prototype.beautify = function(text, language, options) {
      var beautysh, file;
      beautysh = this.exe("beautysh");
      file = this.tempFile("input", text);
      return beautysh.run(['-i', options.indent_size, '-f', file]).then((function(_this) {
        return function() {
          return _this.readFile(file);
        };
      })(this));
    };

    return BashBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvYmVhdXR5c2guY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OzsyQkFDckIsSUFBQSxHQUFNOzsyQkFDTixJQUFBLEdBQU07OzJCQUNOLFdBQUEsR0FBYTtNQUNYO1FBQ0UsSUFBQSxFQUFNLFVBRFI7UUFFRSxHQUFBLEVBQUssVUFGUDtRQUdFLFFBQUEsRUFBVSxzQ0FIWjtRQUlFLFlBQUEsRUFBYyxtREFKaEI7UUFLRSxPQUFBLEVBQVM7VUFFUCxJQUFBLEVBQU0sQ0FBQyxRQUFELENBRkM7VUFHUCxLQUFBLEVBQU8sU0FBQyxJQUFEO21CQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsaUJBQWIsQ0FBQSxLQUFxQyxDQUFDLENBQXRDLElBQTRDO1VBQXRELENBSEE7U0FMWDtRQVVFLE1BQUEsRUFBUTtVQUNOLEtBQUEsRUFBTyxzQkFERDtTQVZWO09BRFc7OzsyQkFpQmIsT0FBQSxHQUFTO01BQ1AsSUFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLElBQWI7T0FGSzs7OzJCQUtULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTtNQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUw7TUFDWCxJQUFBLEdBQU8sSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CO2FBQ1AsUUFBUSxDQUFDLEdBQVQsQ0FBYSxDQUFFLElBQUYsRUFBUSxPQUFPLENBQUMsV0FBaEIsRUFBNkIsSUFBN0IsRUFBbUMsSUFBbkMsQ0FBYixDQUNFLENBQUMsSUFESCxDQUNRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsUUFBRCxDQUFVLElBQVY7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEUjtJQUhROzs7O0tBekJnQztBQUg1QyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBCYXNoQmVhdXRpZnkgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiYmVhdXR5c2hcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9iZW1ldXJlci9iZWF1dHlzaFwiXG4gIGV4ZWN1dGFibGVzOiBbXG4gICAge1xuICAgICAgbmFtZTogXCJiZWF1dHlzaFwiXG4gICAgICBjbWQ6IFwiYmVhdXR5c2hcIlxuICAgICAgaG9tZXBhZ2U6IFwiaHR0cHM6Ly9naXRodWIuY29tL2JlbWV1cmVyL2JlYXV0eXNoXCJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL2dpdGh1Yi5jb20vYmVtZXVyZXIvYmVhdXR5c2gjaW5zdGFsbGF0aW9uXCJcbiAgICAgIHZlcnNpb246IHtcbiAgICAgICAgIyBEb2VzIG5vdCBkaXNwbGF5IHZlcnNpb25cbiAgICAgICAgYXJnczogWyctLWhlbHAnXSxcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPiB0ZXh0LmluZGV4T2YoXCJ1c2FnZTogYmVhdXR5c2hcIikgaXNudCAtMSBhbmQgXCIwLjAuMFwiXG4gICAgICB9XG4gICAgICBkb2NrZXI6IHtcbiAgICAgICAgaW1hZ2U6IFwidW5pYmVhdXRpZnkvYmVhdXR5c2hcIlxuICAgICAgfVxuICAgIH1cbiAgXVxuXG4gIG9wdGlvbnM6IHtcbiAgICBCYXNoOlxuICAgICAgaW5kZW50X3NpemU6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgYmVhdXR5c2ggPSBAZXhlKFwiYmVhdXR5c2hcIilcbiAgICBmaWxlID0gQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dClcbiAgICBiZWF1dHlzaC5ydW4oWyAnLWknLCBvcHRpb25zLmluZGVudF9zaXplLCAnLWYnLCBmaWxlIF0pXG4gICAgICAudGhlbig9PiBAcmVhZEZpbGUgZmlsZSlcbiJdfQ==
