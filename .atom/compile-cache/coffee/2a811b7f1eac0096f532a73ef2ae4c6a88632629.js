
/*
Language Support and default options.
 */

(function() {
  "use strict";
  var Languages, extend, _;

  _ = require('lodash');

  extend = null;

  module.exports = Languages = (function() {
    Languages.prototype.languageNames = ["apex", "arduino", "c-sharp", "c", "clojure", "coffeescript", "coldfusion", "cpp", "crystal", "css", "csv", "d", "ejs", "elm", "erb", "erlang", "gherkin", "go", "fortran", "handlebars", "haskell", "html", "jade", "java", "javascript", "json", "jsx", "latex", "less", "lua", "markdown", 'marko', "mustache", "nunjucks", "objective-c", "ocaml", "pawn", "perl", "php", "puppet", "python", "r", "riotjs", "ruby", "rust", "sass", "scss", "spacebars", "sql", "svg", "swig", "tss", "twig", "typescript", "ux_markup", "vala", "vue", "visualforce", "xml", "xtemplate"];


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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFHQSxZQUhBLENBQUE7QUFBQSxNQUFBLG9CQUFBOztBQUFBLEVBS0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBTEosQ0FBQTs7QUFBQSxFQU1BLE1BQUEsR0FBUyxJQU5ULENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUlyQix3QkFBQSxhQUFBLEdBQWUsQ0FDYixNQURhLEVBRWIsU0FGYSxFQUdiLFNBSGEsRUFJYixHQUphLEVBS2IsU0FMYSxFQU1iLGNBTmEsRUFPYixZQVBhLEVBUWIsS0FSYSxFQVNiLFNBVGEsRUFVYixLQVZhLEVBV2IsS0FYYSxFQVliLEdBWmEsRUFhYixLQWJhLEVBY2IsS0FkYSxFQWViLEtBZmEsRUFnQmIsUUFoQmEsRUFpQmIsU0FqQmEsRUFrQmIsSUFsQmEsRUFtQmIsU0FuQmEsRUFvQmIsWUFwQmEsRUFxQmIsU0FyQmEsRUFzQmIsTUF0QmEsRUF1QmIsTUF2QmEsRUF3QmIsTUF4QmEsRUF5QmIsWUF6QmEsRUEwQmIsTUExQmEsRUEyQmIsS0EzQmEsRUE0QmIsT0E1QmEsRUE2QmIsTUE3QmEsRUE4QmIsS0E5QmEsRUErQmIsVUEvQmEsRUFnQ2IsT0FoQ2EsRUFpQ2IsVUFqQ2EsRUFrQ2IsVUFsQ2EsRUFtQ2IsYUFuQ2EsRUFvQ2IsT0FwQ2EsRUFxQ2IsTUFyQ2EsRUFzQ2IsTUF0Q2EsRUF1Q2IsS0F2Q2EsRUF3Q2IsUUF4Q2EsRUF5Q2IsUUF6Q2EsRUEwQ2IsR0ExQ2EsRUEyQ2IsUUEzQ2EsRUE0Q2IsTUE1Q2EsRUE2Q2IsTUE3Q2EsRUE4Q2IsTUE5Q2EsRUErQ2IsTUEvQ2EsRUFnRGIsV0FoRGEsRUFpRGIsS0FqRGEsRUFrRGIsS0FsRGEsRUFtRGIsTUFuRGEsRUFvRGIsS0FwRGEsRUFxRGIsTUFyRGEsRUFzRGIsWUF0RGEsRUF1RGIsV0F2RGEsRUF3RGIsTUF4RGEsRUF5RGIsS0F6RGEsRUEwRGIsYUExRGEsRUEyRGIsS0EzRGEsRUE0RGIsV0E1RGEsQ0FBZixDQUFBOztBQStEQTtBQUFBOztPQS9EQTs7QUFBQSx3QkFrRUEsU0FBQSxHQUFXLElBbEVYLENBQUE7O0FBb0VBO0FBQUE7O09BcEVBOztBQUFBLHdCQXVFQSxVQUFBLEdBQVksSUF2RVosQ0FBQTs7QUF5RUE7QUFBQTs7T0F6RUE7O0FBNEVhLElBQUEsbUJBQUEsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFDLENBQUMsR0FBRixDQUFNLElBQUMsQ0FBQSxhQUFQLEVBQXNCLFNBQUMsSUFBRCxHQUFBO2VBQ2pDLE9BQUEsQ0FBUyxJQUFBLEdBQUksSUFBYixFQURpQztNQUFBLENBQXRCLENBQWIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxDQUFDLENBQUMsR0FBRixDQUFNLElBQUMsQ0FBQSxTQUFQLEVBQWtCLFNBQUMsUUFBRCxHQUFBO2VBQWMsUUFBUSxDQUFDLFVBQXZCO01BQUEsQ0FBbEIsQ0FIZCxDQURXO0lBQUEsQ0E1RWI7O0FBa0ZBO0FBQUE7O09BbEZBOztBQUFBLHdCQXFGQSxZQUFBLEdBQWMsU0FBQyxJQUFELEdBQUE7QUFFWixVQUFBLG1DQUFBO0FBQUEsTUFGYyxZQUFBLE1BQU0saUJBQUEsV0FBVyxlQUFBLFNBQVMsaUJBQUEsU0FFeEMsQ0FBQTthQUFBLENBQUMsQ0FBQyxLQUFGLENBQ0UsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxPQUFGLENBQVUsUUFBUSxDQUFDLElBQW5CLEVBQXlCLElBQXpCLEVBQWQ7TUFBQSxDQUFyQixDQURGLEVBRUUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxPQUFGLENBQVUsUUFBUSxDQUFDLFNBQW5CLEVBQThCLFNBQTlCLEVBQWQ7TUFBQSxDQUFyQixDQUZGLEVBR0UsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxRQUFGLENBQVcsUUFBUSxDQUFDLFFBQXBCLEVBQThCLE9BQTlCLEVBQWQ7TUFBQSxDQUFyQixDQUhGLEVBSUUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxRQUFGLENBQVcsUUFBUSxDQUFDLFVBQXBCLEVBQWdDLFNBQWhDLEVBQWQ7TUFBQSxDQUFyQixDQUpGLEVBRlk7SUFBQSxDQXJGZCxDQUFBOztxQkFBQTs7TUFiRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/languages/index.coffee
