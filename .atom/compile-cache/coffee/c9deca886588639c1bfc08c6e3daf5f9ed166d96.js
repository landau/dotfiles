(function() {
  "use strict";
  var Beautifier, PrettyDiff,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = PrettyDiff = (function(_super) {
    __extends(PrettyDiff, _super);

    function PrettyDiff() {
      return PrettyDiff.__super__.constructor.apply(this, arguments);
    }

    PrettyDiff.prototype.name = "Pretty Diff";

    PrettyDiff.prototype.link = "https://github.com/prettydiff/prettydiff";

    PrettyDiff.prototype.options = {
      _: {
        inchar: [
          "indent_with_tabs", "indent_char", function(indent_with_tabs, indent_char) {
            if (indent_with_tabs === true) {
              return "\t";
            } else {
              return indent_char;
            }
          }
        ],
        insize: [
          "indent_with_tabs", "indent_size", function(indent_with_tabs, indent_size) {
            if (indent_with_tabs === true) {
              return 1;
            } else {
              return indent_size;
            }
          }
        ],
        objsort: function(objsort) {
          return objsort || false;
        },
        preserve: [
          'preserve_newlines', function(preserve_newlines) {
            if (preserve_newlines === true) {
              return "all";
            } else {
              return "none";
            }
          }
        ],
        cssinsertlines: "newline_between_rules",
        comments: [
          "indent_comments", function(indent_comments) {
            if (indent_comments === false) {
              return "noindent";
            } else {
              return "indent";
            }
          }
        ],
        force: "force_indentation",
        quoteConvert: "convert_quotes",
        vertical: [
          'align_assignments', function(align_assignments) {
            if (align_assignments === true) {
              return "all";
            } else {
              return "none";
            }
          }
        ],
        wrap: "wrap_line_length",
        space: "space_after_anon_function",
        noleadzero: "no_lead_zero",
        endcomma: "end_with_comma",
        methodchain: [
          'break_chained_methods', function(break_chained_methods) {
            if (break_chained_methods === true) {
              return false;
            } else {
              return true;
            }
          }
        ],
        ternaryline: "preserve_ternary_lines",
        bracepadding: "space_in_paren"
      },
      CSV: true,
      Coldfusion: true,
      ERB: true,
      EJS: true,
      HTML: true,
      Handlebars: true,
      Nunjucks: true,
      XML: true,
      SVG: true,
      Spacebars: true,
      JSX: true,
      JavaScript: true,
      CSS: true,
      SCSS: true,
      JSON: true,
      TSS: true,
      Twig: true,
      LESS: true,
      Swig: true,
      "UX Markup": true,
      Visualforce: true,
      "Riot.js": true,
      XTemplate: true
    };

    PrettyDiff.prototype.beautify = function(text, language, options) {
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var args, lang, output, prettydiff, result, _;
          prettydiff = require("prettydiff");
          _ = require('lodash');
          lang = "auto";
          switch (language) {
            case "CSV":
              lang = "csv";
              break;
            case "Coldfusion":
              lang = "html";
              break;
            case "EJS":
            case "Twig":
              lang = "ejs";
              break;
            case "ERB":
              lang = "html_ruby";
              break;
            case "Handlebars":
            case "Mustache":
            case "Spacebars":
            case "Swig":
            case "Riot.js":
            case "XTemplate":
              lang = "handlebars";
              break;
            case "SGML":
              lang = "markup";
              break;
            case "XML":
            case "Visualforce":
            case "SVG":
              lang = "xml";
              break;
            case "HTML":
            case "Nunjucks":
            case "UX Markup":
              lang = "html";
              break;
            case "JavaScript":
              lang = "javascript";
              break;
            case "JSON":
              lang = "json";
              break;
            case "JSX":
              lang = "jsx";
              break;
            case "JSTL":
              lang = "jsp";
              break;
            case "CSS":
              lang = "css";
              break;
            case "LESS":
              lang = "less";
              break;
            case "SCSS":
              lang = "scss";
              break;
            case "TSS":
              lang = "tss";
              break;
            default:
              lang = "auto";
          }
          args = {
            source: text,
            lang: lang,
            mode: "beautify"
          };
          _.merge(options, args);
          _this.verbose('prettydiff', options);
          output = prettydiff.api(options);
          result = output[0];
          return resolve(result);
        };
      })(this));
    };

    return PrettyDiff;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcHJldHR5ZGlmZi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsWUFBQSxDQUFBO0FBQUEsTUFBQSxzQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ3JCLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx5QkFBQSxJQUFBLEdBQU0sYUFBTixDQUFBOztBQUFBLHlCQUNBLElBQUEsR0FBTSwwQ0FETixDQUFBOztBQUFBLHlCQUVBLE9BQUEsR0FBUztBQUFBLE1BRVAsQ0FBQSxFQUNFO0FBQUEsUUFBQSxNQUFBLEVBQVE7VUFBQyxrQkFBRCxFQUFxQixhQUFyQixFQUFvQyxTQUFDLGdCQUFELEVBQW1CLFdBQW5CLEdBQUE7QUFDMUMsWUFBQSxJQUFJLGdCQUFBLEtBQW9CLElBQXhCO3FCQUNFLEtBREY7YUFBQSxNQUFBO3FCQUNZLFlBRFo7YUFEMEM7VUFBQSxDQUFwQztTQUFSO0FBQUEsUUFJQSxNQUFBLEVBQVE7VUFBQyxrQkFBRCxFQUFxQixhQUFyQixFQUFvQyxTQUFDLGdCQUFELEVBQW1CLFdBQW5CLEdBQUE7QUFDMUMsWUFBQSxJQUFJLGdCQUFBLEtBQW9CLElBQXhCO3FCQUNFLEVBREY7YUFBQSxNQUFBO3FCQUNTLFlBRFQ7YUFEMEM7VUFBQSxDQUFwQztTQUpSO0FBQUEsUUFRQSxPQUFBLEVBQVMsU0FBQyxPQUFELEdBQUE7aUJBQ1AsT0FBQSxJQUFXLE1BREo7UUFBQSxDQVJUO0FBQUEsUUFVQSxRQUFBLEVBQVU7VUFBQyxtQkFBRCxFQUFzQixTQUFDLGlCQUFELEdBQUE7QUFDOUIsWUFBQSxJQUFJLGlCQUFBLEtBQXFCLElBQXpCO3FCQUNFLE1BREY7YUFBQSxNQUFBO3FCQUNhLE9BRGI7YUFEOEI7VUFBQSxDQUF0QjtTQVZWO0FBQUEsUUFjQSxjQUFBLEVBQWdCLHVCQWRoQjtBQUFBLFFBZUEsUUFBQSxFQUFVO1VBQUMsaUJBQUQsRUFBb0IsU0FBQyxlQUFELEdBQUE7QUFDNUIsWUFBQSxJQUFJLGVBQUEsS0FBbUIsS0FBdkI7cUJBQ0UsV0FERjthQUFBLE1BQUE7cUJBQ2tCLFNBRGxCO2FBRDRCO1VBQUEsQ0FBcEI7U0FmVjtBQUFBLFFBbUJBLEtBQUEsRUFBTyxtQkFuQlA7QUFBQSxRQW9CQSxZQUFBLEVBQWMsZ0JBcEJkO0FBQUEsUUFxQkEsUUFBQSxFQUFVO1VBQUMsbUJBQUQsRUFBc0IsU0FBQyxpQkFBRCxHQUFBO0FBQzlCLFlBQUEsSUFBSSxpQkFBQSxLQUFxQixJQUF6QjtxQkFDRSxNQURGO2FBQUEsTUFBQTtxQkFDYSxPQURiO2FBRDhCO1VBQUEsQ0FBdEI7U0FyQlY7QUFBQSxRQXlCQSxJQUFBLEVBQU0sa0JBekJOO0FBQUEsUUEwQkEsS0FBQSxFQUFPLDJCQTFCUDtBQUFBLFFBMkJBLFVBQUEsRUFBWSxjQTNCWjtBQUFBLFFBNEJBLFFBQUEsRUFBVSxnQkE1QlY7QUFBQSxRQTZCQSxXQUFBLEVBQWE7VUFBQyx1QkFBRCxFQUEwQixTQUFDLHFCQUFELEdBQUE7QUFDckMsWUFBQSxJQUFJLHFCQUFBLEtBQXlCLElBQTdCO3FCQUNFLE1BREY7YUFBQSxNQUFBO3FCQUNhLEtBRGI7YUFEcUM7VUFBQSxDQUExQjtTQTdCYjtBQUFBLFFBaUNBLFdBQUEsRUFBYSx3QkFqQ2I7QUFBQSxRQWtDQSxZQUFBLEVBQWMsZ0JBbENkO09BSEs7QUFBQSxNQXVDUCxHQUFBLEVBQUssSUF2Q0U7QUFBQSxNQXdDUCxVQUFBLEVBQVksSUF4Q0w7QUFBQSxNQXlDUCxHQUFBLEVBQUssSUF6Q0U7QUFBQSxNQTBDUCxHQUFBLEVBQUssSUExQ0U7QUFBQSxNQTJDUCxJQUFBLEVBQU0sSUEzQ0M7QUFBQSxNQTRDUCxVQUFBLEVBQVksSUE1Q0w7QUFBQSxNQTZDUCxRQUFBLEVBQVUsSUE3Q0g7QUFBQSxNQThDUCxHQUFBLEVBQUssSUE5Q0U7QUFBQSxNQStDUCxHQUFBLEVBQUssSUEvQ0U7QUFBQSxNQWdEUCxTQUFBLEVBQVcsSUFoREo7QUFBQSxNQWlEUCxHQUFBLEVBQUssSUFqREU7QUFBQSxNQWtEUCxVQUFBLEVBQVksSUFsREw7QUFBQSxNQW1EUCxHQUFBLEVBQUssSUFuREU7QUFBQSxNQW9EUCxJQUFBLEVBQU0sSUFwREM7QUFBQSxNQXFEUCxJQUFBLEVBQU0sSUFyREM7QUFBQSxNQXNEUCxHQUFBLEVBQUssSUF0REU7QUFBQSxNQXVEUCxJQUFBLEVBQU0sSUF2REM7QUFBQSxNQXdEUCxJQUFBLEVBQU0sSUF4REM7QUFBQSxNQXlEUCxJQUFBLEVBQU0sSUF6REM7QUFBQSxNQTBEUCxXQUFBLEVBQWEsSUExRE47QUFBQSxNQTJEUCxXQUFBLEVBQWEsSUEzRE47QUFBQSxNQTREUCxTQUFBLEVBQVcsSUE1REo7QUFBQSxNQTZEUCxTQUFBLEVBQVcsSUE3REo7S0FGVCxDQUFBOztBQUFBLHlCQWtFQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixHQUFBO0FBRVIsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtBQUNsQixjQUFBLHlDQUFBO0FBQUEsVUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVIsQ0FBYixDQUFBO0FBQUEsVUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FESixDQUFBO0FBQUEsVUFJQSxJQUFBLEdBQU8sTUFKUCxDQUFBO0FBS0Esa0JBQU8sUUFBUDtBQUFBLGlCQUNPLEtBRFA7QUFFSSxjQUFBLElBQUEsR0FBTyxLQUFQLENBRko7QUFDTztBQURQLGlCQUdPLFlBSFA7QUFJSSxjQUFBLElBQUEsR0FBTyxNQUFQLENBSko7QUFHTztBQUhQLGlCQUtPLEtBTFA7QUFBQSxpQkFLYyxNQUxkO0FBTUksY0FBQSxJQUFBLEdBQU8sS0FBUCxDQU5KO0FBS2M7QUFMZCxpQkFPTyxLQVBQO0FBUUksY0FBQSxJQUFBLEdBQU8sV0FBUCxDQVJKO0FBT087QUFQUCxpQkFTTyxZQVRQO0FBQUEsaUJBU3FCLFVBVHJCO0FBQUEsaUJBU2lDLFdBVGpDO0FBQUEsaUJBUzhDLE1BVDlDO0FBQUEsaUJBU3NELFNBVHREO0FBQUEsaUJBU2lFLFdBVGpFO0FBVUksY0FBQSxJQUFBLEdBQU8sWUFBUCxDQVZKO0FBU2lFO0FBVGpFLGlCQVdPLE1BWFA7QUFZSSxjQUFBLElBQUEsR0FBTyxRQUFQLENBWko7QUFXTztBQVhQLGlCQWFPLEtBYlA7QUFBQSxpQkFhYyxhQWJkO0FBQUEsaUJBYTZCLEtBYjdCO0FBY0ksY0FBQSxJQUFBLEdBQU8sS0FBUCxDQWRKO0FBYTZCO0FBYjdCLGlCQWVPLE1BZlA7QUFBQSxpQkFlZSxVQWZmO0FBQUEsaUJBZTJCLFdBZjNCO0FBZ0JJLGNBQUEsSUFBQSxHQUFPLE1BQVAsQ0FoQko7QUFlMkI7QUFmM0IsaUJBaUJPLFlBakJQO0FBa0JJLGNBQUEsSUFBQSxHQUFPLFlBQVAsQ0FsQko7QUFpQk87QUFqQlAsaUJBbUJPLE1BbkJQO0FBb0JJLGNBQUEsSUFBQSxHQUFPLE1BQVAsQ0FwQko7QUFtQk87QUFuQlAsaUJBcUJPLEtBckJQO0FBc0JJLGNBQUEsSUFBQSxHQUFPLEtBQVAsQ0F0Qko7QUFxQk87QUFyQlAsaUJBdUJPLE1BdkJQO0FBd0JJLGNBQUEsSUFBQSxHQUFPLEtBQVAsQ0F4Qko7QUF1Qk87QUF2QlAsaUJBeUJPLEtBekJQO0FBMEJJLGNBQUEsSUFBQSxHQUFPLEtBQVAsQ0ExQko7QUF5Qk87QUF6QlAsaUJBMkJPLE1BM0JQO0FBNEJJLGNBQUEsSUFBQSxHQUFPLE1BQVAsQ0E1Qko7QUEyQk87QUEzQlAsaUJBNkJPLE1BN0JQO0FBOEJJLGNBQUEsSUFBQSxHQUFPLE1BQVAsQ0E5Qko7QUE2Qk87QUE3QlAsaUJBK0JPLEtBL0JQO0FBZ0NJLGNBQUEsSUFBQSxHQUFPLEtBQVAsQ0FoQ0o7QUErQk87QUEvQlA7QUFrQ0ksY0FBQSxJQUFBLEdBQU8sTUFBUCxDQWxDSjtBQUFBLFdBTEE7QUFBQSxVQTBDQSxJQUFBLEdBQ0U7QUFBQSxZQUFBLE1BQUEsRUFBUSxJQUFSO0FBQUEsWUFDQSxJQUFBLEVBQU0sSUFETjtBQUFBLFlBRUEsSUFBQSxFQUFNLFVBRk47V0EzQ0YsQ0FBQTtBQUFBLFVBZ0RBLENBQUMsQ0FBQyxLQUFGLENBQVEsT0FBUixFQUFpQixJQUFqQixDQWhEQSxDQUFBO0FBQUEsVUFtREEsS0FBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULEVBQXVCLE9BQXZCLENBbkRBLENBQUE7QUFBQSxVQW9EQSxNQUFBLEdBQVMsVUFBVSxDQUFDLEdBQVgsQ0FBZSxPQUFmLENBcERULENBQUE7QUFBQSxVQXFEQSxNQUFBLEdBQVMsTUFBTyxDQUFBLENBQUEsQ0FyRGhCLENBQUE7aUJBd0RBLE9BQUEsQ0FBUSxNQUFSLEVBekRrQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQsQ0FBWCxDQUZRO0lBQUEsQ0FsRVYsQ0FBQTs7c0JBQUE7O0tBRHdDLFdBSDFDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/beautifiers/prettydiff.coffee
