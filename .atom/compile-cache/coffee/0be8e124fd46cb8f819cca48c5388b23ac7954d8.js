
/*
Language Support and default options.
 */

(function() {
  "use strict";
  var Languages, extend, _;

  _ = require('lodash');

  extend = null;

  module.exports = Languages = (function() {
    Languages.prototype.languageNames = ["apex", "arduino", "c-sharp", "c", "coffeescript", "coldfusion", "cpp", "crystal", "css", "csv", "d", "ejs", "elm", "erb", "erlang", "gherkin", "go", "fortran", "handlebars", "haskell", "html", "jade", "java", "javascript", "json", "jsx", "latex", "less", "lua", "markdown", 'marko', "mustache", "objective-c", "ocaml", "pawn", "perl", "php", "puppet", "python", "riotjs", "ruby", "rust", "sass", "scss", "spacebars", "sql", "svg", "swig", "tss", "twig", "typescript", "vala", "vue", "visualforce", "xml", "xtemplate"];


    /*
    Languages
     */

    Languages.prototype.languages = null;


    /*
    Namespaces
     */

    Languages.prototype.namespaces = null;


    /*
    Constructor
     */

    function Languages() {
      this.languages = _.map(this.languageNames, function(name) {
        return require("./" + name);
      });
      this.namespaces = _.map(this.languages, function(language) {
        return language.namespace;
      });
    }


    /*
    Get language for grammar and extension
     */

    Languages.prototype.getLanguages = function(_arg) {
      var extension, grammar, name, namespace;
      name = _arg.name, namespace = _arg.namespace, grammar = _arg.grammar, extension = _arg.extension;
      return _.union(_.filter(this.languages, function(language) {
        return _.isEqual(language.name, name);
      }), _.filter(this.languages, function(language) {
        return _.isEqual(language.namespace, namespace);
      }), _.filter(this.languages, function(language) {
        return _.includes(language.grammars, grammar);
      }), _.filter(this.languages, function(language) {
        return _.includes(language.extensions, extension);
      }));
    };

    return Languages;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFHQSxZQUhBLENBQUE7QUFBQSxNQUFBLG9CQUFBOztBQUFBLEVBS0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBTEosQ0FBQTs7QUFBQSxFQU1BLE1BQUEsR0FBUyxJQU5ULENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUlyQix3QkFBQSxhQUFBLEdBQWUsQ0FDYixNQURhLEVBRWIsU0FGYSxFQUdiLFNBSGEsRUFJYixHQUphLEVBS2IsY0FMYSxFQU1iLFlBTmEsRUFPYixLQVBhLEVBUWIsU0FSYSxFQVNiLEtBVGEsRUFVYixLQVZhLEVBV2IsR0FYYSxFQVliLEtBWmEsRUFhYixLQWJhLEVBY2IsS0FkYSxFQWViLFFBZmEsRUFnQmIsU0FoQmEsRUFpQmIsSUFqQmEsRUFrQmIsU0FsQmEsRUFtQmIsWUFuQmEsRUFvQmIsU0FwQmEsRUFxQmIsTUFyQmEsRUFzQmIsTUF0QmEsRUF1QmIsTUF2QmEsRUF3QmIsWUF4QmEsRUF5QmIsTUF6QmEsRUEwQmIsS0ExQmEsRUEyQmIsT0EzQmEsRUE0QmIsTUE1QmEsRUE2QmIsS0E3QmEsRUE4QmIsVUE5QmEsRUErQmIsT0EvQmEsRUFnQ2IsVUFoQ2EsRUFpQ2IsYUFqQ2EsRUFrQ2IsT0FsQ2EsRUFtQ2IsTUFuQ2EsRUFvQ2IsTUFwQ2EsRUFxQ2IsS0FyQ2EsRUFzQ2IsUUF0Q2EsRUF1Q2IsUUF2Q2EsRUF3Q2IsUUF4Q2EsRUF5Q2IsTUF6Q2EsRUEwQ2IsTUExQ2EsRUEyQ2IsTUEzQ2EsRUE0Q2IsTUE1Q2EsRUE2Q2IsV0E3Q2EsRUE4Q2IsS0E5Q2EsRUErQ2IsS0EvQ2EsRUFnRGIsTUFoRGEsRUFpRGIsS0FqRGEsRUFrRGIsTUFsRGEsRUFtRGIsWUFuRGEsRUFvRGIsTUFwRGEsRUFxRGIsS0FyRGEsRUFzRGIsYUF0RGEsRUF1RGIsS0F2RGEsRUF3RGIsV0F4RGEsQ0FBZixDQUFBOztBQTJEQTtBQUFBOztPQTNEQTs7QUFBQSx3QkE4REEsU0FBQSxHQUFXLElBOURYLENBQUE7O0FBZ0VBO0FBQUE7O09BaEVBOztBQUFBLHdCQW1FQSxVQUFBLEdBQVksSUFuRVosQ0FBQTs7QUFxRUE7QUFBQTs7T0FyRUE7O0FBd0VhLElBQUEsbUJBQUEsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFDLENBQUMsR0FBRixDQUFNLElBQUMsQ0FBQSxhQUFQLEVBQXNCLFNBQUMsSUFBRCxHQUFBO2VBQ2pDLE9BQUEsQ0FBUyxJQUFBLEdBQUksSUFBYixFQURpQztNQUFBLENBQXRCLENBQWIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxDQUFDLENBQUMsR0FBRixDQUFNLElBQUMsQ0FBQSxTQUFQLEVBQWtCLFNBQUMsUUFBRCxHQUFBO2VBQWMsUUFBUSxDQUFDLFVBQXZCO01BQUEsQ0FBbEIsQ0FIZCxDQURXO0lBQUEsQ0F4RWI7O0FBOEVBO0FBQUE7O09BOUVBOztBQUFBLHdCQWlGQSxZQUFBLEdBQWMsU0FBQyxJQUFELEdBQUE7QUFFWixVQUFBLG1DQUFBO0FBQUEsTUFGYyxZQUFBLE1BQU0saUJBQUEsV0FBVyxlQUFBLFNBQVMsaUJBQUEsU0FFeEMsQ0FBQTthQUFBLENBQUMsQ0FBQyxLQUFGLENBQ0UsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxPQUFGLENBQVUsUUFBUSxDQUFDLElBQW5CLEVBQXlCLElBQXpCLEVBQWQ7TUFBQSxDQUFyQixDQURGLEVBRUUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxPQUFGLENBQVUsUUFBUSxDQUFDLFNBQW5CLEVBQThCLFNBQTlCLEVBQWQ7TUFBQSxDQUFyQixDQUZGLEVBR0UsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxRQUFGLENBQVcsUUFBUSxDQUFDLFFBQXBCLEVBQThCLE9BQTlCLEVBQWQ7TUFBQSxDQUFyQixDQUhGLEVBSUUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxRQUFGLENBQVcsUUFBUSxDQUFDLFVBQXBCLEVBQWdDLFNBQWhDLEVBQWQ7TUFBQSxDQUFyQixDQUpGLEVBRlk7SUFBQSxDQWpGZCxDQUFBOztxQkFBQTs7TUFiRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/languages/index.coffee
