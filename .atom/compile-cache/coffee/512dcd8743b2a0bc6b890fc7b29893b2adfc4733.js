(function() {
  "use strict";
  var Beautifier, SassConvert,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = SassConvert = (function(superClass) {
    extend(SassConvert, superClass);

    function SassConvert() {
      return SassConvert.__super__.constructor.apply(this, arguments);
    }

    SassConvert.prototype.name = "SassConvert";

    SassConvert.prototype.link = "http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax";

    SassConvert.prototype.isPreInstalled = false;

    SassConvert.prototype.options = {
      CSS: false,
      Sass: false,
      SCSS: false
    };

    SassConvert.prototype.beautify = function(text, language, options, context) {
      var lang;
      lang = language.toLowerCase();
      return this.run("sass-convert", [this.tempFile("input", text), "--from", lang, "--to", lang]);
    };

    return SassConvert;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvc2Fzcy1jb252ZXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSx1QkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7MEJBQ3JCLElBQUEsR0FBTTs7MEJBQ04sSUFBQSxHQUFNOzswQkFDTixjQUFBLEdBQWdCOzswQkFFaEIsT0FBQSxHQUVFO01BQUEsR0FBQSxFQUFLLEtBQUw7TUFDQSxJQUFBLEVBQU0sS0FETjtNQUVBLElBQUEsRUFBTSxLQUZOOzs7MEJBSUYsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsRUFBMEIsT0FBMUI7QUFDUixVQUFBO01BQUEsSUFBQSxHQUFPLFFBQVEsQ0FBQyxXQUFULENBQUE7YUFFUCxJQUFDLENBQUEsR0FBRCxDQUFLLGNBQUwsRUFBcUIsQ0FDbkIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBRG1CLEVBRW5CLFFBRm1CLEVBRVQsSUFGUyxFQUVILE1BRkcsRUFFSyxJQUZMLENBQXJCO0lBSFE7Ozs7S0FYK0I7QUFIM0MiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU2Fzc0NvbnZlcnQgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiU2Fzc0NvbnZlcnRcIlxuICBsaW5rOiBcImh0dHA6Ly9zYXNzLWxhbmcuY29tL2RvY3VtZW50YXRpb24vZmlsZS5TQVNTX1JFRkVSRU5DRS5odG1sI3N5bnRheFwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6XG4gICAgIyBUT0RPOiBBZGQgc3VwcG9ydCBmb3Igb3B0aW9uc1xuICAgIENTUzogZmFsc2VcbiAgICBTYXNzOiBmYWxzZVxuICAgIFNDU1M6IGZhbHNlXG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucywgY29udGV4dCkgLT5cbiAgICBsYW5nID0gbGFuZ3VhZ2UudG9Mb3dlckNhc2UoKVxuXG4gICAgQHJ1bihcInNhc3MtY29udmVydFwiLCBbXG4gICAgICBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KSxcbiAgICAgIFwiLS1mcm9tXCIsIGxhbmcsIFwiLS10b1wiLCBsYW5nXG4gICAgXSlcbiJdfQ==
