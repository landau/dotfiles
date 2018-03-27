
/*
Language Support and default options.
 */

(function() {
  "use strict";
  var Languages, extend, _;

  _ = require('lodash');

  extend = null;

  module.exports = Languages = (function() {
    Languages.prototype.languageNames = ["apex", "arduino", "c-sharp", "c", "coffeescript", "coldfusion", "cpp", "css", "csv", "d", "ejs", "elm", "erb", "erlang", "gherkin", "go", "fortran", "handlebars", "haskell", "html", "jade", "java", "javascript", "json", "jsx", "latex", "less", "markdown", 'marko', "mustache", "objective-c", "pawn", "perl", "php", "puppet", "python", "riotjs", "ruby", "rust", "sass", "scss", "spacebars", "sql", "svg", "swig", "tss", "twig", "typescript", "vala", "visualforce", "xml", "xtemplate"];


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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFHQSxZQUhBLENBQUE7QUFBQSxNQUFBLG9CQUFBOztBQUFBLEVBS0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBTEosQ0FBQTs7QUFBQSxFQU1BLE1BQUEsR0FBUyxJQU5ULENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUlyQix3QkFBQSxhQUFBLEdBQWUsQ0FDYixNQURhLEVBRWIsU0FGYSxFQUdiLFNBSGEsRUFJYixHQUphLEVBS2IsY0FMYSxFQU1iLFlBTmEsRUFPYixLQVBhLEVBUWIsS0FSYSxFQVNiLEtBVGEsRUFVYixHQVZhLEVBV2IsS0FYYSxFQVliLEtBWmEsRUFhYixLQWJhLEVBY2IsUUFkYSxFQWViLFNBZmEsRUFnQmIsSUFoQmEsRUFpQmIsU0FqQmEsRUFrQmIsWUFsQmEsRUFtQmIsU0FuQmEsRUFvQmIsTUFwQmEsRUFxQmIsTUFyQmEsRUFzQmIsTUF0QmEsRUF1QmIsWUF2QmEsRUF3QmIsTUF4QmEsRUF5QmIsS0F6QmEsRUEwQmIsT0ExQmEsRUEyQmIsTUEzQmEsRUE0QmIsVUE1QmEsRUE2QmIsT0E3QmEsRUE4QmIsVUE5QmEsRUErQmIsYUEvQmEsRUFnQ2IsTUFoQ2EsRUFpQ2IsTUFqQ2EsRUFrQ2IsS0FsQ2EsRUFtQ2IsUUFuQ2EsRUFvQ2IsUUFwQ2EsRUFxQ2IsUUFyQ2EsRUFzQ2IsTUF0Q2EsRUF1Q2IsTUF2Q2EsRUF3Q2IsTUF4Q2EsRUF5Q2IsTUF6Q2EsRUEwQ2IsV0ExQ2EsRUEyQ2IsS0EzQ2EsRUE0Q2IsS0E1Q2EsRUE2Q2IsTUE3Q2EsRUE4Q2IsS0E5Q2EsRUErQ2IsTUEvQ2EsRUFnRGIsWUFoRGEsRUFpRGIsTUFqRGEsRUFrRGIsYUFsRGEsRUFtRGIsS0FuRGEsRUFvRGIsV0FwRGEsQ0FBZixDQUFBOztBQXVEQTtBQUFBOztPQXZEQTs7QUFBQSx3QkEwREEsU0FBQSxHQUFXLElBMURYLENBQUE7O0FBNERBO0FBQUE7O09BNURBOztBQUFBLHdCQStEQSxVQUFBLEdBQVksSUEvRFosQ0FBQTs7QUFpRUE7QUFBQTs7T0FqRUE7O0FBb0VhLElBQUEsbUJBQUEsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFDLENBQUMsR0FBRixDQUFNLElBQUMsQ0FBQSxhQUFQLEVBQXNCLFNBQUMsSUFBRCxHQUFBO2VBQ2pDLE9BQUEsQ0FBUyxJQUFBLEdBQUksSUFBYixFQURpQztNQUFBLENBQXRCLENBQWIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxDQUFDLENBQUMsR0FBRixDQUFNLElBQUMsQ0FBQSxTQUFQLEVBQWtCLFNBQUMsUUFBRCxHQUFBO2VBQWMsUUFBUSxDQUFDLFVBQXZCO01BQUEsQ0FBbEIsQ0FIZCxDQURXO0lBQUEsQ0FwRWI7O0FBMEVBO0FBQUE7O09BMUVBOztBQUFBLHdCQTZFQSxZQUFBLEdBQWMsU0FBQyxJQUFELEdBQUE7QUFFWixVQUFBLG1DQUFBO0FBQUEsTUFGYyxZQUFBLE1BQU0saUJBQUEsV0FBVyxlQUFBLFNBQVMsaUJBQUEsU0FFeEMsQ0FBQTthQUFBLENBQUMsQ0FBQyxLQUFGLENBQ0UsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxPQUFGLENBQVUsUUFBUSxDQUFDLElBQW5CLEVBQXlCLElBQXpCLEVBQWQ7TUFBQSxDQUFyQixDQURGLEVBRUUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxPQUFGLENBQVUsUUFBUSxDQUFDLFNBQW5CLEVBQThCLFNBQTlCLEVBQWQ7TUFBQSxDQUFyQixDQUZGLEVBR0UsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxRQUFGLENBQVcsUUFBUSxDQUFDLFFBQXBCLEVBQThCLE9BQTlCLEVBQWQ7TUFBQSxDQUFyQixDQUhGLEVBSUUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxRQUFGLENBQVcsUUFBUSxDQUFDLFVBQXBCLEVBQWdDLFNBQWhDLEVBQWQ7TUFBQSxDQUFyQixDQUpGLEVBRlk7SUFBQSxDQTdFZCxDQUFBOztxQkFBQTs7TUFiRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/languages/index.coffee
