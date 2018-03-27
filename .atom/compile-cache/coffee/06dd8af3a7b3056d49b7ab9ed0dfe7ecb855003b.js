(function() {
  var defaultIndentChar, defaultIndentSize, defaultIndentWithTabs, scope, softTabs, tabLength, _ref, _ref1;

  scope = ['source.css'];

  tabLength = (_ref = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.tabLength', {
    scope: scope
  }) : void 0) != null ? _ref : 4;

  softTabs = (_ref1 = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.softTabs', {
    scope: scope
  }) : void 0) != null ? _ref1 : true;

  defaultIndentSize = (softTabs ? tabLength : 1);

  defaultIndentChar = (softTabs ? " " : "\t");

  defaultIndentWithTabs = !softTabs;

  module.exports = {
    name: "CSS",
    namespace: "css",

    /*
    Supported Grammars
     */
    grammars: ["CSS"],

    /*
    Supported extensions
     */
    extensions: ["css"],
    defaultBeautifier: "JS Beautify",
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
        minimum: 0,
        description: "Indentation character"
      },
      selector_separator_newline: {
        type: 'boolean',
        "default": false,
        description: "Add a newline between multiple selectors"
      },
      newline_between_rules: {
        type: 'boolean',
        "default": true,
        description: "Add a newline between CSS rules"
      },
      preserve_newlines: {
        type: 'boolean',
        "default": false,
        description: "Retain empty lines. " + "Consecutive empty lines will be converted to a single empty line."
      },
      wrap_line_length: {
        type: 'integer',
        "default": 0,
        description: "Maximum amount of characters per line (0 = disable)"
      },
      end_with_newline: {
        type: 'boolean',
        "default": false,
        description: "End output with newline"
      },
      indent_comments: {
        type: 'boolean',
        "default": true,
        description: "Determines whether comments should be indented."
      },
      force_indentation: {
        type: 'boolean',
        "default": false,
        description: "if indentation should be forcefully applied to markup even if it disruptively adds unintended whitespace to the documents rendered output"
      },
      convert_quotes: {
        type: 'string',
        "default": "none",
        description: "Convert the quote characters delimiting strings from either double or single quotes to the other.",
        "enum": ["none", "double", "single"]
      },
      align_assignments: {
        type: 'boolean',
        "default": false,
        description: "If lists of assignments or properties should be vertically aligned for faster and easier reading."
      },
      no_lead_zero: {
        type: 'boolean',
        "default": false,
        description: "If in CSS values leading 0s immediately preceeding a decimal should be removed or prevented."
      },
      configPath: {
        title: "comb custom config file",
        type: 'string',
        "default": "",
        description: "Path to custom CSScomb config file, used in absense of a `.csscomb.json` or `.csscomb.cson` at the root of your project."
      },
      predefinedConfig: {
        title: "comb predefined config",
        type: 'string',
        "default": "csscomb",
        description: "Used if neither a project or custom config file exists.",
        "enum": ["csscomb", "yandex", "zen"]
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL2Nzcy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsb0dBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsQ0FBQyxZQUFELENBQVIsQ0FBQTs7QUFBQSxFQUNBLFNBQUE7O2dDQUFpRSxDQURqRSxDQUFBOztBQUFBLEVBRUEsUUFBQTs7aUNBQStELElBRi9ELENBQUE7O0FBQUEsRUFHQSxpQkFBQSxHQUFvQixDQUFJLFFBQUgsR0FBaUIsU0FBakIsR0FBZ0MsQ0FBakMsQ0FIcEIsQ0FBQTs7QUFBQSxFQUlBLGlCQUFBLEdBQW9CLENBQUksUUFBSCxHQUFpQixHQUFqQixHQUEwQixJQUEzQixDQUpwQixDQUFBOztBQUFBLEVBS0EscUJBQUEsR0FBd0IsQ0FBQSxRQUx4QixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBQSxJQUVmLElBQUEsRUFBTSxLQUZTO0FBQUEsSUFHZixTQUFBLEVBQVcsS0FISTtBQUtmO0FBQUE7O09BTGU7QUFBQSxJQVFmLFFBQUEsRUFBVSxDQUNSLEtBRFEsQ0FSSztBQVlmO0FBQUE7O09BWmU7QUFBQSxJQWVmLFVBQUEsRUFBWSxDQUNWLEtBRFUsQ0FmRztBQUFBLElBbUJmLGlCQUFBLEVBQW1CLGFBbkJKO0FBQUEsSUFxQmYsT0FBQSxFQUVFO0FBQUEsTUFBQSxXQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsaUJBRFQ7QUFBQSxRQUVBLE9BQUEsRUFBUyxDQUZUO0FBQUEsUUFHQSxXQUFBLEVBQWEseUJBSGI7T0FERjtBQUFBLE1BS0EsV0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/languages/css.coffee
