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

    PrettyDiff.prototype.options = {
      _: {
        inchar: "indent_char",
        insize: "indent_size",
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
        ternaryline: "preserve_ternary_lines"
      },
      CSV: true,
      Coldfusion: true,
      ERB: true,
      EJS: true,
      HTML: true,
      Handlebars: true,
      XML: true,
      SVG: true,
      Spacebars: true,
      JSX: true,
      JavaScript: true,
      CSS: true,
      SCSS: true,
      Sass: true,
      JSON: true,
      TSS: true,
      Twig: true,
      LESS: true,
      Swig: true,
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
            case "Sass":
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcHJldHR5ZGlmZi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsWUFBQSxDQUFBO0FBQUEsTUFBQSxzQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ3JCLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx5QkFBQSxJQUFBLEdBQU0sYUFBTixDQUFBOztBQUFBLHlCQUNBLE9BQUEsR0FBUztBQUFBLE1BRVAsQ0FBQSxFQUNFO0FBQUEsUUFBQSxNQUFBLEVBQVEsYUFBUjtBQUFBLFFBQ0EsTUFBQSxFQUFRLGFBRFI7QUFBQSxRQUVBLE9BQUEsRUFBUyxTQUFDLE9BQUQsR0FBQTtpQkFDUCxPQUFBLElBQVcsTUFESjtRQUFBLENBRlQ7QUFBQSxRQUlBLFFBQUEsRUFBVTtVQUFDLG1CQUFELEVBQXNCLFNBQUMsaUJBQUQsR0FBQTtBQUM5QixZQUFBLElBQUksaUJBQUEsS0FBcUIsSUFBekI7cUJBQ0UsTUFERjthQUFBLE1BQUE7cUJBQ2EsT0FEYjthQUQ4QjtVQUFBLENBQXRCO1NBSlY7QUFBQSxRQVFBLGNBQUEsRUFBZ0IsdUJBUmhCO0FBQUEsUUFTQSxRQUFBLEVBQVU7VUFBQyxpQkFBRCxFQUFvQixTQUFDLGVBQUQsR0FBQTtBQUM1QixZQUFBLElBQUksZUFBQSxLQUFtQixLQUF2QjtxQkFDRSxXQURGO2FBQUEsTUFBQTtxQkFDa0IsU0FEbEI7YUFENEI7VUFBQSxDQUFwQjtTQVRWO0FBQUEsUUFhQSxLQUFBLEVBQU8sbUJBYlA7QUFBQSxRQWNBLFlBQUEsRUFBYyxnQkFk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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/beautifiers/prettydiff.coffee
