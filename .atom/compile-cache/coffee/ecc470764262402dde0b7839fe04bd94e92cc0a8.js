(function() {
  "use strict";
  var Beautifier, VueBeautifier, prettydiff, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  prettydiff = require("prettydiff");

  _ = require('lodash');

  module.exports = VueBeautifier = (function(_super) {
    __extends(VueBeautifier, _super);

    function VueBeautifier() {
      return VueBeautifier.__super__.constructor.apply(this, arguments);
    }

    VueBeautifier.prototype.name = "Vue Beautifier";

    VueBeautifier.prototype.options = {
      Vue: true
    };

    VueBeautifier.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var regexp;
        regexp = /(<(template|script|style)[^>]*>)((\s|\S)*?)<\/\2>/gi;
        return resolve(text.replace(regexp, function(match, begin, type, text) {
          var lang, _ref;
          lang = (_ref = /lang\s*=\s*['"](\w+)["']/.exec(begin)) != null ? _ref[1] : void 0;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvdnVlLWJlYXV0aWZpZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFlBQUEsQ0FBQTtBQUFBLE1BQUEsd0NBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUixDQURiLENBQUE7O0FBQUEsRUFFQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVIsQ0FGYixDQUFBOztBQUFBLEVBR0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBSEosQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ3JCLG9DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSw0QkFBQSxJQUFBLEdBQU0sZ0JBQU4sQ0FBQTs7QUFBQSw0QkFFQSxPQUFBLEdBQ0U7QUFBQSxNQUFBLEdBQUEsRUFBSyxJQUFMO0tBSEYsQ0FBQTs7QUFBQSw0QkFLQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixHQUFBO0FBQ1IsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ2xCLFlBQUEsTUFBQTtBQUFBLFFBQUEsTUFBQSxHQUFTLHFEQUFULENBQUE7ZUFFQSxPQUFBLENBQVEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxNQUFiLEVBQXFCLFNBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxJQUFmLEVBQXFCLElBQXJCLEdBQUE7QUFDM0IsY0FBQSxVQUFBO0FBQUEsVUFBQSxJQUFBLGlFQUErQyxDQUFBLENBQUEsVUFBL0MsQ0FBQTtBQUVBLGtCQUFPLElBQVA7QUFBQSxpQkFDTyxVQURQO0FBRUksc0JBQU8sSUFBUDtBQUFBLHFCQUNPLEtBRFA7QUFBQSxxQkFDYyxNQURkO3lCQUVJLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxFQUFvQixJQUFBLEdBQU8sT0FBQSxDQUFRLGNBQVIsQ0FBQSxDQUF3QixJQUF4QixFQUE4QixPQUE5QixDQUFQLEdBQWdELElBQXBFLEVBRko7QUFBQSxxQkFHTyxNQUhQO3lCQUlJLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxFQUFvQixJQUFBLEdBQU8sT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixJQUE1QixFQUFrQyxPQUFsQyxDQUFQLEdBQW9ELElBQXhFLEVBSko7QUFBQTt5QkFNSSxNQU5KO0FBQUEsZUFGSjtBQUNPO0FBRFAsaUJBU08sUUFUUDtxQkFVSSxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsRUFBb0IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxhQUFSLENBQUEsQ0FBdUIsSUFBdkIsRUFBNkIsT0FBN0IsQ0FBUCxHQUErQyxJQUFuRSxFQVZKO0FBQUEsaUJBV08sT0FYUDtBQVlJLHNCQUFPLElBQVA7QUFBQSxxQkFDTyxNQURQO0FBQUEscUJBQ2UsTUFEZjtBQUVJLGtCQUFBLE9BQUEsR0FBVSxDQUFDLENBQUMsS0FBRixDQUFRLE9BQVIsRUFDUjtBQUFBLG9CQUFBLE1BQUEsRUFBUSxJQUFSO0FBQUEsb0JBQ0EsSUFBQSxFQUFNLE1BRE47QUFBQSxvQkFFQSxJQUFBLEVBQU0sVUFGTjttQkFEUSxDQUFWLENBQUE7eUJBSUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkLEVBQW9CLFVBQVUsQ0FBQyxHQUFYLENBQWUsT0FBZixDQUF3QixDQUFBLENBQUEsQ0FBNUMsRUFOSjtBQUFBLHFCQU9PLE1BUFA7QUFRSSxrQkFBQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxPQUFSLEVBQ1Y7QUFBQSxvQkFBQSxNQUFBLEVBQVEsSUFBUjtBQUFBLG9CQUNBLElBQUEsRUFBTSxNQUROO0FBQUEsb0JBRUEsSUFBQSxFQUFNLFVBRk47bUJBRFUsQ0FBVixDQUFBO3lCQUlBLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxFQUFvQixVQUFVLENBQUMsR0FBWCxDQUFlLE9BQWYsQ0FBd0IsQ0FBQSxDQUFBLENBQTVDLEVBWko7QUFBQSxxQkFhTyxNQWJQO3lCQWNJLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxFQUFvQixJQUFBLEdBQU8sT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQyxHQUF2QixDQUEyQixJQUEzQixFQUFpQyxPQUFqQyxDQUFQLEdBQW1ELElBQXZFLEVBZEo7QUFBQTt5QkFnQkksTUFoQko7QUFBQSxlQVpKO0FBQUEsV0FIMkI7UUFBQSxDQUFyQixDQUFSLEVBSGtCO01BQUEsQ0FBVCxDQUFYLENBRFE7SUFBQSxDQUxWLENBQUE7O3lCQUFBOztLQUQyQyxXQUw3QyxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/beautifiers/vue-beautifier.coffee
