(function() {
  var defaultIndentChar, defaultIndentSize, defaultIndentWithTabs, scope, softTabs, tabLength, _ref, _ref1;

  scope = ['text.marko'];

  tabLength = (_ref = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.tabLength', {
    scope: scope
  }) : void 0) != null ? _ref : 4;

  softTabs = (_ref1 = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.softTabs', {
    scope: scope
  }) : void 0) != null ? _ref1 : true;

  defaultIndentSize = (softTabs ? tabLength : 4);

  defaultIndentChar = (softTabs ? " " : "\t");

  defaultIndentWithTabs = !softTabs;

  module.exports = {
    name: "Marko",
    namespace: "marko",
    fallback: ['html'],

    /*
    Supported Grammars
     */
    grammars: ["Marko"],

    /*
    Supported extensions
     */
    extensions: ["marko"],
    options: {
      indent_size: {
        type: 'integer',
        "default": defaultIndentSize,
        minimum: 0,
        description: "Indentation size/length"
      },
      indent_char: {
        type: 'string',
        "default": defaultIndentChar,
        description: "Indentation character"
      },
      syntax: {
        type: 'string',
        "default": "html",
        "enum": ["html", "concise"],
        description: "[html|concise]"
      }
    },
    defaultBeautifier: "Marko Beautifier"
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL21hcmtvLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSxvR0FBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxDQUFDLFlBQUQsQ0FBUixDQUFBOztBQUFBLEVBQ0EsU0FBQTs7Z0NBQWlFLENBRGpFLENBQUE7O0FBQUEsRUFFQSxRQUFBOztpQ0FBK0QsSUFGL0QsQ0FBQTs7QUFBQSxFQUdBLGlCQUFBLEdBQW9CLENBQUksUUFBSCxHQUFpQixTQUFqQixHQUFnQyxDQUFqQyxDQUhwQixDQUFBOztBQUFBLEVBSUEsaUJBQUEsR0FBb0IsQ0FBSSxRQUFILEdBQWlCLEdBQWpCLEdBQTBCLElBQTNCLENBSnBCLENBQUE7O0FBQUEsRUFLQSxxQkFBQSxHQUF3QixDQUFBLFFBTHhCLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBRWYsSUFBQSxFQUFNLE9BRlM7QUFBQSxJQUdmLFNBQUEsRUFBVyxPQUhJO0FBQUEsSUFJZixRQUFBLEVBQVUsQ0FBQyxNQUFELENBSks7QUFNZjtBQUFBOztPQU5lO0FBQUEsSUFTZixRQUFBLEVBQVUsQ0FDUixPQURRLENBVEs7QUFhZjtBQUFBOztPQWJlO0FBQUEsSUFnQmYsVUFBQSxFQUFZLENBQ1YsT0FEVSxDQWhCRztBQUFBLElBb0JmLE9BQUEsRUFDRTtBQUFBLE1BQUEsV0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLGlCQURUO0FBQUEsUUFFQSxPQUFBLEVBQVMsQ0FGVDtBQUFBLFFBR0EsV0FBQSxFQUFhLHlCQUhiO09BREY7QUFBQSxNQUtBLFdBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxpQkFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLHVCQUZiO09BTkY7QUFBQSxNQVNBLE1BQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxNQURUO0FBQUEsUUFFQSxNQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsU0FBVCxDQUZOO0FBQUEsUUFHQSxXQUFBLEVBQWEsZ0JBSGI7T0FWRjtLQXJCYTtBQUFBLElBb0NmLGlCQUFBLEVBQW1CLGtCQXBDSjtHQVBqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/languages/marko.coffee
