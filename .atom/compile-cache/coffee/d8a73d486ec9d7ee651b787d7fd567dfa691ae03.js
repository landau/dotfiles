(function() {
  "use strict";
  var Beautifier, SassConvert,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = SassConvert = (function(_super) {
    __extends(SassConvert, _super);

    function SassConvert() {
      return SassConvert.__super__.constructor.apply(this, arguments);
    }

    SassConvert.prototype.name = "SassConvert";

    SassConvert.prototype.link = "http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax";

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvc2Fzcy1jb252ZXJ0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxZQUFBLENBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FEYixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDBCQUFBLElBQUEsR0FBTSxhQUFOLENBQUE7O0FBQUEsMEJBQ0EsSUFBQSxHQUFNLG9FQUROLENBQUE7O0FBQUEsMEJBR0EsT0FBQSxHQUVFO0FBQUEsTUFBQSxHQUFBLEVBQUssS0FBTDtBQUFBLE1BQ0EsSUFBQSxFQUFNLEtBRE47QUFBQSxNQUVBLElBQUEsRUFBTSxLQUZOO0tBTEYsQ0FBQTs7QUFBQSwwQkFTQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixFQUEwQixPQUExQixHQUFBO0FBQ1IsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sUUFBUSxDQUFDLFdBQVQsQ0FBQSxDQUFQLENBQUE7YUFFQSxJQUFDLENBQUEsR0FBRCxDQUFLLGNBQUwsRUFBcUIsQ0FDbkIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBRG1CLEVBRW5CLFFBRm1CLEVBRVQsSUFGUyxFQUVILE1BRkcsRUFFSyxJQUZMLENBQXJCLEVBSFE7SUFBQSxDQVRWLENBQUE7O3VCQUFBOztLQUR5QyxXQUgzQyxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/beautifiers/sass-convert.coffee
