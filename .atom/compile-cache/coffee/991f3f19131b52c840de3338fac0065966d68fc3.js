(function() {
  "use strict";
  var Beautifier, VueBeautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

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
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var _, prettydiff, regexp, results;
          prettydiff = require("prettydiff");
          _ = require('lodash');
          regexp = /(^<(template|script|style)[^>]*>)((\s|\S)*?)^<\/\2>/gim;
          results = text.replace(regexp, function(match, begin, type, text) {
            var beautifiedText, lang, ref, replaceText, result;
            lang = (ref = /lang\s*=\s*['"](\w+)["']/.exec(begin)) != null ? ref[1] : void 0;
            replaceText = text;
            text = text.trim();
            beautifiedText = ((function() {
              switch (type) {
                case "template":
                  switch (lang) {
                    case "pug":
                    case "jade":
                      return require("pug-beautify")(text, options);
                    case void 0:
                      return require("js-beautify").html(text, options);
                    default:
                      return void 0;
                  }
                  break;
                case "script":
                  return require("js-beautify")(text, options);
                case "style":
                  switch (lang) {
                    case "scss":
                      options = _.merge(options, {
                        source: text,
                        lang: "scss",
                        mode: "beautify"
                      });
                      return prettydiff.api(options)[0];
                    case "less":
                      options = _.merge(options, {
                        source: text,
                        lang: "less",
                        mode: "beautify"
                      });
                      return prettydiff.api(options)[0];
                    case void 0:
                      return require("js-beautify").css(text, options);
                    default:
                      return void 0;
                  }
              }
            })());
            result = beautifiedText ? match.replace(replaceText, "\n" + (beautifiedText.trim()) + "\n") : match;
            _this.verbose("Vue part", match, begin, type, text, lang, result);
            return result;
          });
          _this.verbose("Vue final results", results);
          return resolve(results);
        };
      })(this));
    };

    return VueBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvdnVlLWJlYXV0aWZpZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHlCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozs0QkFDckIsSUFBQSxHQUFNOzs0QkFDTixJQUFBLEdBQU07OzRCQUVOLE9BQUEsR0FDRTtNQUFBLEdBQUEsRUFBSyxJQUFMOzs7NEJBRUYsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixhQUFXLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDbEIsY0FBQTtVQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUjtVQUNiLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjtVQUNKLE1BQUEsR0FBUztVQUVULE9BQUEsR0FBVSxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQWIsRUFBcUIsU0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLElBQWYsRUFBcUIsSUFBckI7QUFDN0IsZ0JBQUE7WUFBQSxJQUFBLCtEQUErQyxDQUFBLENBQUE7WUFDL0MsV0FBQSxHQUFjO1lBQ2QsSUFBQSxHQUFPLElBQUksQ0FBQyxJQUFMLENBQUE7WUFDUCxjQUFBLEdBQWlCO0FBQUMsc0JBQU8sSUFBUDtBQUFBLHFCQUNYLFVBRFc7QUFFZCwwQkFBTyxJQUFQO0FBQUEseUJBQ08sS0FEUDtBQUFBLHlCQUNjLE1BRGQ7NkJBRUksT0FBQSxDQUFRLGNBQVIsQ0FBQSxDQUF3QixJQUF4QixFQUE4QixPQUE5QjtBQUZKLHlCQUdPLE1BSFA7NkJBSUksT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixJQUE1QixFQUFrQyxPQUFsQztBQUpKOzZCQU1JO0FBTko7QUFERztBQURXLHFCQVNYLFFBVFc7eUJBVWQsT0FBQSxDQUFRLGFBQVIsQ0FBQSxDQUF1QixJQUF2QixFQUE2QixPQUE3QjtBQVZjLHFCQVdYLE9BWFc7QUFZZCwwQkFBTyxJQUFQO0FBQUEseUJBQ08sTUFEUDtzQkFFSSxPQUFBLEdBQVUsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxPQUFSLEVBQ1I7d0JBQUEsTUFBQSxFQUFRLElBQVI7d0JBQ0EsSUFBQSxFQUFNLE1BRE47d0JBRUEsSUFBQSxFQUFNLFVBRk47dUJBRFE7NkJBS1YsVUFBVSxDQUFDLEdBQVgsQ0FBZSxPQUFmLENBQXdCLENBQUEsQ0FBQTtBQVA1Qix5QkFRTyxNQVJQO3NCQVNJLE9BQUEsR0FBVSxDQUFDLENBQUMsS0FBRixDQUFRLE9BQVIsRUFDUjt3QkFBQSxNQUFBLEVBQVEsSUFBUjt3QkFDQSxJQUFBLEVBQU0sTUFETjt3QkFFQSxJQUFBLEVBQU0sVUFGTjt1QkFEUTs2QkFLVixVQUFVLENBQUMsR0FBWCxDQUFlLE9BQWYsQ0FBd0IsQ0FBQSxDQUFBO0FBZDVCLHlCQWVPLE1BZlA7NkJBZ0JJLE9BQUEsQ0FBUSxhQUFSLENBQXNCLENBQUMsR0FBdkIsQ0FBMkIsSUFBM0IsRUFBaUMsT0FBakM7QUFoQko7NkJBa0JJO0FBbEJKO0FBWmM7Z0JBQUQ7WUFnQ2pCLE1BQUEsR0FBWSxjQUFILEdBQXVCLEtBQUssQ0FBQyxPQUFOLENBQWMsV0FBZCxFQUEyQixJQUFBLEdBQUksQ0FBQyxjQUFjLENBQUMsSUFBZixDQUFBLENBQUQsQ0FBSixHQUEyQixJQUF0RCxDQUF2QixHQUF1RjtZQUNoRyxLQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQsRUFBcUIsS0FBckIsRUFBNEIsS0FBNUIsRUFBbUMsSUFBbkMsRUFBeUMsSUFBekMsRUFBK0MsSUFBL0MsRUFBcUQsTUFBckQ7QUFDQSxtQkFBTztVQXRDc0IsQ0FBckI7VUF3Q1YsS0FBQyxDQUFBLE9BQUQsQ0FBUyxtQkFBVCxFQUE4QixPQUE5QjtpQkFDQSxPQUFBLENBQVEsT0FBUjtRQTlDa0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7SUFESDs7OztLQVBpQztBQUg3QyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBWdWVCZWF1dGlmaWVyIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlZ1ZSBCZWF1dGlmaWVyXCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vR2xhdmluMDAxL2F0b20tYmVhdXRpZnkvYmxvYi9tYXN0ZXIvc3JjL2JlYXV0aWZpZXJzL3Z1ZS1iZWF1dGlmaWVyLmNvZmZlZVwiXG5cbiAgb3B0aW9uczpcbiAgICBWdWU6IHRydWVcblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIHByZXR0eWRpZmYgPSByZXF1aXJlKFwicHJldHR5ZGlmZlwiKVxuICAgICAgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG4gICAgICByZWdleHAgPSAvKF48KHRlbXBsYXRlfHNjcmlwdHxzdHlsZSlbXj5dKj4pKChcXHN8XFxTKSo/KV48XFwvXFwyPi9naW1cblxuICAgICAgcmVzdWx0cyA9IHRleHQucmVwbGFjZShyZWdleHAsIChtYXRjaCwgYmVnaW4sIHR5cGUsIHRleHQpID0+XG4gICAgICAgIGxhbmcgPSAvbGFuZ1xccyo9XFxzKlsnXCJdKFxcdyspW1wiJ10vLmV4ZWMoYmVnaW4pP1sxXVxuICAgICAgICByZXBsYWNlVGV4dCA9IHRleHRcbiAgICAgICAgdGV4dCA9IHRleHQudHJpbSgpXG4gICAgICAgIGJlYXV0aWZpZWRUZXh0ID0gKHN3aXRjaCB0eXBlXG4gICAgICAgICAgd2hlbiBcInRlbXBsYXRlXCJcbiAgICAgICAgICAgIHN3aXRjaCBsYW5nXG4gICAgICAgICAgICAgIHdoZW4gXCJwdWdcIiwgXCJqYWRlXCJcbiAgICAgICAgICAgICAgICByZXF1aXJlKFwicHVnLWJlYXV0aWZ5XCIpKHRleHQsIG9wdGlvbnMpXG4gICAgICAgICAgICAgIHdoZW4gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgcmVxdWlyZShcImpzLWJlYXV0aWZ5XCIpLmh0bWwodGV4dCwgb3B0aW9ucylcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZFxuICAgICAgICAgIHdoZW4gXCJzY3JpcHRcIlxuICAgICAgICAgICAgcmVxdWlyZShcImpzLWJlYXV0aWZ5XCIpKHRleHQsIG9wdGlvbnMpXG4gICAgICAgICAgd2hlbiBcInN0eWxlXCJcbiAgICAgICAgICAgIHN3aXRjaCBsYW5nXG4gICAgICAgICAgICAgIHdoZW4gXCJzY3NzXCJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gXy5tZXJnZShvcHRpb25zLFxuICAgICAgICAgICAgICAgICAgc291cmNlOiB0ZXh0XG4gICAgICAgICAgICAgICAgICBsYW5nOiBcInNjc3NcIlxuICAgICAgICAgICAgICAgICAgbW9kZTogXCJiZWF1dGlmeVwiXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIHByZXR0eWRpZmYuYXBpKG9wdGlvbnMpWzBdXG4gICAgICAgICAgICAgIHdoZW4gXCJsZXNzXCJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gXy5tZXJnZShvcHRpb25zLFxuICAgICAgICAgICAgICAgICAgc291cmNlOiB0ZXh0XG4gICAgICAgICAgICAgICAgICBsYW5nOiBcImxlc3NcIlxuICAgICAgICAgICAgICAgICAgbW9kZTogXCJiZWF1dGlmeVwiXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIHByZXR0eWRpZmYuYXBpKG9wdGlvbnMpWzBdXG4gICAgICAgICAgICAgIHdoZW4gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgcmVxdWlyZShcImpzLWJlYXV0aWZ5XCIpLmNzcyh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkXG4gICAgICAgIClcbiAgICAgICAgcmVzdWx0ID0gaWYgYmVhdXRpZmllZFRleHQgdGhlbiBtYXRjaC5yZXBsYWNlKHJlcGxhY2VUZXh0LCBcIlxcbiN7YmVhdXRpZmllZFRleHQudHJpbSgpfVxcblwiKSBlbHNlIG1hdGNoXG4gICAgICAgIEB2ZXJib3NlKFwiVnVlIHBhcnRcIiwgbWF0Y2gsIGJlZ2luLCB0eXBlLCB0ZXh0LCBsYW5nLCByZXN1bHQpXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgIClcbiAgICAgIEB2ZXJib3NlKFwiVnVlIGZpbmFsIHJlc3VsdHNcIiwgcmVzdWx0cylcbiAgICAgIHJlc29sdmUocmVzdWx0cylcbiAgICApXG4iXX0=
