(function() {
  "use strict";
  var Beautifier, VueBeautifier, _, prettydiff,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  prettydiff = require("prettydiff");

  _ = require('lodash');

  module.exports = VueBeautifier = (function(superClass) {
    extend(VueBeautifier, superClass);

    function VueBeautifier() {
      return VueBeautifier.__super__.constructor.apply(this, arguments);
    }

    VueBeautifier.prototype.name = "Vue Beautifier";

    VueBeautifier.prototype.link = "https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/vue-beautifier.coffee";

    VueBeautifier.prototype.options = {
      Vue: true
    };

    VueBeautifier.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var regexp;
        regexp = /(<(template|script|style)[^>]*>)((\s|\S)*?)<\/\2>/gi;
        return resolve(text.replace(regexp, function(match, begin, type, text) {
          var lang, ref;
          lang = (ref = /lang\s*=\s*['"](\w+)["']/.exec(begin)) != null ? ref[1] : void 0;
          switch (type) {
            case "template":
              switch (lang) {
                case "pug":
                case "jade":
                  return match.replace(text, "\n" + require("pug-beautify")(text, options) + "\n");
                case void 0:
                  return match.replace(text, "\n" + require("js-beautify").html(text, options) + "\n");
                default:
                  return match;
              }
              break;
            case "script":
              return match.replace(text, "\n" + require("js-beautify")(text, options) + "\n");
            case "style":
              switch (lang) {
                case "sass":
                case "scss":
                  options = _.merge(options, {
                    source: text,
                    lang: "scss",
                    mode: "beautify"
                  });
                  return match.replace(text, prettydiff.api(options)[0]);
                case "less":
                  options = _.merge(options, {
                    source: text,
                    lang: "less",
                    mode: "beautify"
                  });
                  return match.replace(text, prettydiff.api(options)[0]);
                case void 0:
                  return match.replace(text, "\n" + require("js-beautify").css(text, options) + "\n");
                default:
                  return match;
              }
          }
        }));
      });
    };

    return VueBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvdnVlLWJlYXV0aWZpZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHdDQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFDYixVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVI7O0VBQ2IsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUVKLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OzRCQUNyQixJQUFBLEdBQU07OzRCQUNOLElBQUEsR0FBTTs7NEJBRU4sT0FBQSxHQUNFO01BQUEsR0FBQSxFQUFLLElBQUw7Ozs0QkFFRixRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDbEIsWUFBQTtRQUFBLE1BQUEsR0FBUztlQUVULE9BQUEsQ0FBUSxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQWIsRUFBcUIsU0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLElBQWYsRUFBcUIsSUFBckI7QUFDM0IsY0FBQTtVQUFBLElBQUEsK0RBQStDLENBQUEsQ0FBQTtBQUUvQyxrQkFBTyxJQUFQO0FBQUEsaUJBQ08sVUFEUDtBQUVJLHNCQUFPLElBQVA7QUFBQSxxQkFDTyxLQURQO0FBQUEscUJBQ2MsTUFEZDt5QkFFSSxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsRUFBb0IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxjQUFSLENBQUEsQ0FBd0IsSUFBeEIsRUFBOEIsT0FBOUIsQ0FBUCxHQUFnRCxJQUFwRTtBQUZKLHFCQUdPLE1BSFA7eUJBSUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkLEVBQW9CLElBQUEsR0FBTyxPQUFBLENBQVEsYUFBUixDQUFzQixDQUFDLElBQXZCLENBQTRCLElBQTVCLEVBQWtDLE9BQWxDLENBQVAsR0FBb0QsSUFBeEU7QUFKSjt5QkFNSTtBQU5KO0FBREc7QUFEUCxpQkFTTyxRQVRQO3FCQVVJLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxFQUFvQixJQUFBLEdBQU8sT0FBQSxDQUFRLGFBQVIsQ0FBQSxDQUF1QixJQUF2QixFQUE2QixPQUE3QixDQUFQLEdBQStDLElBQW5FO0FBVkosaUJBV08sT0FYUDtBQVlJLHNCQUFPLElBQVA7QUFBQSxxQkFDTyxNQURQO0FBQUEscUJBQ2UsTUFEZjtrQkFFSSxPQUFBLEdBQVUsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxPQUFSLEVBQ1I7b0JBQUEsTUFBQSxFQUFRLElBQVI7b0JBQ0EsSUFBQSxFQUFNLE1BRE47b0JBRUEsSUFBQSxFQUFNLFVBRk47bUJBRFE7eUJBSVYsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkLEVBQW9CLFVBQVUsQ0FBQyxHQUFYLENBQWUsT0FBZixDQUF3QixDQUFBLENBQUEsQ0FBNUM7QUFOSixxQkFPTyxNQVBQO2tCQVFJLE9BQUEsR0FBVSxDQUFDLENBQUMsS0FBRixDQUFRLE9BQVIsRUFDVjtvQkFBQSxNQUFBLEVBQVEsSUFBUjtvQkFDQSxJQUFBLEVBQU0sTUFETjtvQkFFQSxJQUFBLEVBQU0sVUFGTjttQkFEVTt5QkFJVixLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsRUFBb0IsVUFBVSxDQUFDLEdBQVgsQ0FBZSxPQUFmLENBQXdCLENBQUEsQ0FBQSxDQUE1QztBQVpKLHFCQWFPLE1BYlA7eUJBY0ksS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkLEVBQW9CLElBQUEsR0FBTyxPQUFBLENBQVEsYUFBUixDQUFzQixDQUFDLEdBQXZCLENBQTJCLElBQTNCLEVBQWlDLE9BQWpDLENBQVAsR0FBbUQsSUFBdkU7QUFkSjt5QkFnQkk7QUFoQko7QUFaSjtRQUgyQixDQUFyQixDQUFSO01BSGtCLENBQVQ7SUFESDs7OztLQVBpQztBQUw3QyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcbnByZXR0eWRpZmYgPSByZXF1aXJlKFwicHJldHR5ZGlmZlwiKVxuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVnVlQmVhdXRpZmllciBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJWdWUgQmVhdXRpZmllclwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0dsYXZpbjAwMS9hdG9tLWJlYXV0aWZ5L2Jsb2IvbWFzdGVyL3NyYy9iZWF1dGlmaWVycy92dWUtYmVhdXRpZmllci5jb2ZmZWVcIlxuXG4gIG9wdGlvbnM6XG4gICAgVnVlOiB0cnVlXG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICByZWdleHAgPSAvKDwodGVtcGxhdGV8c2NyaXB0fHN0eWxlKVtePl0qPikoKFxcc3xcXFMpKj8pPFxcL1xcMj4vZ2lcblxuICAgICAgcmVzb2x2ZSh0ZXh0LnJlcGxhY2UocmVnZXhwLCAobWF0Y2gsIGJlZ2luLCB0eXBlLCB0ZXh0KSAtPlxuICAgICAgICBsYW5nID0gL2xhbmdcXHMqPVxccypbJ1wiXShcXHcrKVtcIiddLy5leGVjKGJlZ2luKT9bMV1cblxuICAgICAgICBzd2l0Y2ggdHlwZVxuICAgICAgICAgIHdoZW4gXCJ0ZW1wbGF0ZVwiXG4gICAgICAgICAgICBzd2l0Y2ggbGFuZ1xuICAgICAgICAgICAgICB3aGVuIFwicHVnXCIsIFwiamFkZVwiXG4gICAgICAgICAgICAgICAgbWF0Y2gucmVwbGFjZSh0ZXh0LCBcIlxcblwiICsgcmVxdWlyZShcInB1Zy1iZWF1dGlmeVwiKSh0ZXh0LCBvcHRpb25zKSArIFwiXFxuXCIpXG4gICAgICAgICAgICAgIHdoZW4gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgbWF0Y2gucmVwbGFjZSh0ZXh0LCBcIlxcblwiICsgcmVxdWlyZShcImpzLWJlYXV0aWZ5XCIpLmh0bWwodGV4dCwgb3B0aW9ucykgKyBcIlxcblwiKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbWF0Y2hcbiAgICAgICAgICB3aGVuIFwic2NyaXB0XCJcbiAgICAgICAgICAgIG1hdGNoLnJlcGxhY2UodGV4dCwgXCJcXG5cIiArIHJlcXVpcmUoXCJqcy1iZWF1dGlmeVwiKSh0ZXh0LCBvcHRpb25zKSArIFwiXFxuXCIpXG4gICAgICAgICAgd2hlbiBcInN0eWxlXCJcbiAgICAgICAgICAgIHN3aXRjaCBsYW5nXG4gICAgICAgICAgICAgIHdoZW4gXCJzYXNzXCIsIFwic2Nzc1wiXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IF8ubWVyZ2Ugb3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGV4dFxuICAgICAgICAgICAgICAgICAgbGFuZzogXCJzY3NzXCJcbiAgICAgICAgICAgICAgICAgIG1vZGU6IFwiYmVhdXRpZnlcIlxuICAgICAgICAgICAgICAgIG1hdGNoLnJlcGxhY2UodGV4dCwgcHJldHR5ZGlmZi5hcGkob3B0aW9ucylbMF0pXG4gICAgICAgICAgICAgIHdoZW4gXCJsZXNzXCJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gXy5tZXJnZSBvcHRpb25zLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogdGV4dFxuICAgICAgICAgICAgICAgIGxhbmc6IFwibGVzc1wiXG4gICAgICAgICAgICAgICAgbW9kZTogXCJiZWF1dGlmeVwiXG4gICAgICAgICAgICAgICAgbWF0Y2gucmVwbGFjZSh0ZXh0LCBwcmV0dHlkaWZmLmFwaShvcHRpb25zKVswXSlcbiAgICAgICAgICAgICAgd2hlbiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICBtYXRjaC5yZXBsYWNlKHRleHQsIFwiXFxuXCIgKyByZXF1aXJlKFwianMtYmVhdXRpZnlcIikuY3NzKHRleHQsIG9wdGlvbnMpICsgXCJcXG5cIilcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1hdGNoXG4gICAgICApKVxuICAgIClcbiJdfQ==
