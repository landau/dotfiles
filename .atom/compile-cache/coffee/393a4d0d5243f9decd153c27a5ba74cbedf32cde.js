(function() {
  "use strict";
  var Beautifier, JSBeautify,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = JSBeautify = (function(superClass) {
    extend(JSBeautify, superClass);

    function JSBeautify() {
      return JSBeautify.__super__.constructor.apply(this, arguments);
    }

    JSBeautify.prototype.name = "JS Beautify";

    JSBeautify.prototype.link = "https://github.com/beautify-web/js-beautify";

    JSBeautify.prototype.options = {
      HTML: true,
      XML: true,
      Handlebars: true,
      Mustache: true,
      JavaScript: true,
      EJS: true,
      JSX: true,
      JSON: true,
      CSS: {
        indent_size: true,
        indent_char: true,
        selector_separator_newline: true,
        newline_between_rules: true,
        preserve_newlines: true,
        wrap_line_length: true,
        end_with_newline: true
      }
    };

    JSBeautify.prototype.beautify = function(text, language, options) {
      this.verbose("JS Beautify language " + language);
      this.info("JS Beautify Options: " + (JSON.stringify(options, null, 4)));
      options.eol = this.getDefaultLineEnding('\r\n', '\n', options.end_of_line);
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var beautifyCSS, beautifyHTML, beautifyJS, err;
          try {
            switch (language) {
              case "JSON":
              case "JavaScript":
              case "JSX":
                beautifyJS = require("js-beautify");
                text = beautifyJS(text, options);
                return resolve(text);
              case "Handlebars":
              case "Mustache":
                options.indent_handlebars = true;
                beautifyHTML = require("js-beautify").html;
                text = beautifyHTML(text, options);
                return resolve(text);
              case "EJS":
              case "HTML (Liquid)":
              case "HTML":
              case "XML":
              case "Web Form/Control (C#)":
              case "Web Handler (C#)":
                beautifyHTML = require("js-beautify").html;
                text = beautifyHTML(text, options);
                _this.debug("Beautified HTML: " + text);
                return resolve(text);
              case "CSS":
                beautifyCSS = require("js-beautify").css;
                text = beautifyCSS(text, options);
                return resolve(text);
              default:
                return reject(new Error("Unknown language for JS Beautify: " + language));
            }
          } catch (error) {
            err = error;
            _this.error("JS Beautify error: " + err);
            return reject(err);
          }
        };
      })(this));
    };

    return JSBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvanMtYmVhdXRpZnkuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHNCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt5QkFDckIsSUFBQSxHQUFNOzt5QkFDTixJQUFBLEdBQU07O3lCQUVOLE9BQUEsR0FBUztNQUNQLElBQUEsRUFBTSxJQURDO01BRVAsR0FBQSxFQUFLLElBRkU7TUFHUCxVQUFBLEVBQVksSUFITDtNQUlQLFFBQUEsRUFBVSxJQUpIO01BS1AsVUFBQSxFQUFZLElBTEw7TUFNUCxHQUFBLEVBQUssSUFORTtNQU9QLEdBQUEsRUFBSyxJQVBFO01BUVAsSUFBQSxFQUFNLElBUkM7TUFTUCxHQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsSUFBYjtRQUNBLFdBQUEsRUFBYSxJQURiO1FBRUEsMEJBQUEsRUFBNEIsSUFGNUI7UUFHQSxxQkFBQSxFQUF1QixJQUh2QjtRQUlBLGlCQUFBLEVBQW1CLElBSm5CO1FBS0EsZ0JBQUEsRUFBa0IsSUFMbEI7UUFNQSxnQkFBQSxFQUFrQixJQU5sQjtPQVZLOzs7eUJBbUJULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO01BQ1IsSUFBQyxDQUFBLE9BQUQsQ0FBUyx1QkFBQSxHQUF3QixRQUFqQztNQUNBLElBQUMsQ0FBQSxJQUFELENBQU0sdUJBQUEsR0FBdUIsQ0FBQyxJQUFJLENBQUMsU0FBTCxDQUFlLE9BQWYsRUFBd0IsSUFBeEIsRUFBOEIsQ0FBOUIsQ0FBRCxDQUE3QjtNQUNBLE9BQU8sQ0FBQyxHQUFSLEdBQWMsSUFBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCLEVBQTZCLElBQTdCLEVBQWtDLE9BQU8sQ0FBQyxXQUExQztBQUNkLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixjQUFBO0FBQUE7QUFDRSxvQkFBTyxRQUFQO0FBQUEsbUJBQ08sTUFEUDtBQUFBLG1CQUNlLFlBRGY7QUFBQSxtQkFDNkIsS0FEN0I7Z0JBRUksVUFBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSO2dCQUNiLElBQUEsR0FBTyxVQUFBLENBQVcsSUFBWCxFQUFpQixPQUFqQjt1QkFDUCxPQUFBLENBQVEsSUFBUjtBQUpKLG1CQUtPLFlBTFA7QUFBQSxtQkFLcUIsVUFMckI7Z0JBT0ksT0FBTyxDQUFDLGlCQUFSLEdBQTRCO2dCQUU1QixZQUFBLEdBQWUsT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQztnQkFDdEMsSUFBQSxHQUFPLFlBQUEsQ0FBYSxJQUFiLEVBQW1CLE9BQW5CO3VCQUNQLE9BQUEsQ0FBUSxJQUFSO0FBWEosbUJBWU8sS0FaUDtBQUFBLG1CQVljLGVBWmQ7QUFBQSxtQkFZK0IsTUFaL0I7QUFBQSxtQkFZdUMsS0FadkM7QUFBQSxtQkFZOEMsdUJBWjlDO0FBQUEsbUJBWXVFLGtCQVp2RTtnQkFhSSxZQUFBLEdBQWUsT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQztnQkFDdEMsSUFBQSxHQUFPLFlBQUEsQ0FBYSxJQUFiLEVBQW1CLE9BQW5CO2dCQUNQLEtBQUMsQ0FBQSxLQUFELENBQU8sbUJBQUEsR0FBb0IsSUFBM0I7dUJBQ0EsT0FBQSxDQUFRLElBQVI7QUFoQkosbUJBaUJPLEtBakJQO2dCQWtCSSxXQUFBLEdBQWMsT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQztnQkFDckMsSUFBQSxHQUFPLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLE9BQWxCO3VCQUNQLE9BQUEsQ0FBUSxJQUFSO0FBcEJKO3VCQXNCSSxNQUFBLENBQVcsSUFBQSxLQUFBLENBQU0sb0NBQUEsR0FBcUMsUUFBM0MsQ0FBWDtBQXRCSixhQURGO1dBQUEsYUFBQTtZQXdCTTtZQUNKLEtBQUMsQ0FBQSxLQUFELENBQU8scUJBQUEsR0FBc0IsR0FBN0I7bUJBQ0EsTUFBQSxDQUFPLEdBQVAsRUExQkY7O1FBRGtCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO0lBSkg7Ozs7S0F2QjhCO0FBSDFDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEpTQmVhdXRpZnkgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiSlMgQmVhdXRpZnlcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9iZWF1dGlmeS13ZWIvanMtYmVhdXRpZnlcIlxuXG4gIG9wdGlvbnM6IHtcbiAgICBIVE1MOiB0cnVlXG4gICAgWE1MOiB0cnVlXG4gICAgSGFuZGxlYmFyczogdHJ1ZVxuICAgIE11c3RhY2hlOiB0cnVlXG4gICAgSmF2YVNjcmlwdDogdHJ1ZVxuICAgIEVKUzogdHJ1ZVxuICAgIEpTWDogdHJ1ZVxuICAgIEpTT046IHRydWVcbiAgICBDU1M6XG4gICAgICBpbmRlbnRfc2l6ZTogdHJ1ZVxuICAgICAgaW5kZW50X2NoYXI6IHRydWVcbiAgICAgIHNlbGVjdG9yX3NlcGFyYXRvcl9uZXdsaW5lOiB0cnVlXG4gICAgICBuZXdsaW5lX2JldHdlZW5fcnVsZXM6IHRydWVcbiAgICAgIHByZXNlcnZlX25ld2xpbmVzOiB0cnVlXG4gICAgICB3cmFwX2xpbmVfbGVuZ3RoOiB0cnVlXG4gICAgICBlbmRfd2l0aF9uZXdsaW5lOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEB2ZXJib3NlKFwiSlMgQmVhdXRpZnkgbGFuZ3VhZ2UgI3tsYW5ndWFnZX1cIilcbiAgICBAaW5mbyhcIkpTIEJlYXV0aWZ5IE9wdGlvbnM6ICN7SlNPTi5zdHJpbmdpZnkob3B0aW9ucywgbnVsbCwgNCl9XCIpXG4gICAgb3B0aW9ucy5lb2wgPSBAZ2V0RGVmYXVsdExpbmVFbmRpbmcoJ1xcclxcbicsJ1xcbicsb3B0aW9ucy5lbmRfb2ZfbGluZSlcbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICB0cnlcbiAgICAgICAgc3dpdGNoIGxhbmd1YWdlXG4gICAgICAgICAgd2hlbiBcIkpTT05cIiwgXCJKYXZhU2NyaXB0XCIsIFwiSlNYXCJcbiAgICAgICAgICAgIGJlYXV0aWZ5SlMgPSByZXF1aXJlKFwianMtYmVhdXRpZnlcIilcbiAgICAgICAgICAgIHRleHQgPSBiZWF1dGlmeUpTKHRleHQsIG9wdGlvbnMpXG4gICAgICAgICAgICByZXNvbHZlIHRleHRcbiAgICAgICAgICB3aGVuIFwiSGFuZGxlYmFyc1wiLCBcIk11c3RhY2hlXCJcbiAgICAgICAgICAgICMganNoaW50IGlnbm9yZTogc3RhcnRcbiAgICAgICAgICAgIG9wdGlvbnMuaW5kZW50X2hhbmRsZWJhcnMgPSB0cnVlICMgRm9yY2UganNiZWF1dGlmeSB0byBpbmRlbnRfaGFuZGxlYmFyc1xuICAgICAgICAgICAgIyBqc2hpbnQgaWdub3JlOiBlbmRcbiAgICAgICAgICAgIGJlYXV0aWZ5SFRNTCA9IHJlcXVpcmUoXCJqcy1iZWF1dGlmeVwiKS5odG1sXG4gICAgICAgICAgICB0ZXh0ID0gYmVhdXRpZnlIVE1MKHRleHQsIG9wdGlvbnMpXG4gICAgICAgICAgICByZXNvbHZlIHRleHRcbiAgICAgICAgICB3aGVuIFwiRUpTXCIsIFwiSFRNTCAoTGlxdWlkKVwiLCBcIkhUTUxcIiwgXCJYTUxcIiwgXCJXZWIgRm9ybS9Db250cm9sIChDIylcIiwgXCJXZWIgSGFuZGxlciAoQyMpXCJcbiAgICAgICAgICAgIGJlYXV0aWZ5SFRNTCA9IHJlcXVpcmUoXCJqcy1iZWF1dGlmeVwiKS5odG1sXG4gICAgICAgICAgICB0ZXh0ID0gYmVhdXRpZnlIVE1MKHRleHQsIG9wdGlvbnMpXG4gICAgICAgICAgICBAZGVidWcoXCJCZWF1dGlmaWVkIEhUTUw6ICN7dGV4dH1cIilcbiAgICAgICAgICAgIHJlc29sdmUgdGV4dFxuICAgICAgICAgIHdoZW4gXCJDU1NcIlxuICAgICAgICAgICAgYmVhdXRpZnlDU1MgPSByZXF1aXJlKFwianMtYmVhdXRpZnlcIikuY3NzXG4gICAgICAgICAgICB0ZXh0ID0gYmVhdXRpZnlDU1ModGV4dCwgb3B0aW9ucylcbiAgICAgICAgICAgIHJlc29sdmUgdGV4dFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJVbmtub3duIGxhbmd1YWdlIGZvciBKUyBCZWF1dGlmeTogXCIrbGFuZ3VhZ2UpKVxuICAgICAgY2F0Y2ggZXJyXG4gICAgICAgIEBlcnJvcihcIkpTIEJlYXV0aWZ5IGVycm9yOiAje2Vycn1cIilcbiAgICAgICAgcmVqZWN0KGVycilcblxuICAgIClcbiJdfQ==
