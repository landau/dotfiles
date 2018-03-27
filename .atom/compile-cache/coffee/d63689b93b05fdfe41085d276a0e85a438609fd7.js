(function() {
  var defaultIndentChar, defaultIndentSize, defaultIndentWithTabs, scope, softTabs, tabLength, _ref, _ref1;

  scope = ['text.html'];

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
    name: "HTML",
    namespace: "html",

    /*
    Supported Grammars
     */
    grammars: ["HTML"],

    /*
    Supported extensions
     */
    extensions: ["html"],
    options: {
      indent_inner_html: {
        type: 'boolean',
        "default": false,
        description: "Indent <head> and <body> sections."
      },
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
      brace_style: {
        type: 'string',
        "default": "collapse",
        "enum": ["collapse", "expand", "end-expand", "none"],
        description: "[collapse|expand|end-expand|none]"
      },
      indent_scripts: {
        type: 'string',
        "default": "normal",
        "enum": ["keep", "separate", "normal"],
        description: "[keep|separate|normal]"
      },
      wrap_line_length: {
        type: 'integer',
        "default": 250,
        description: "Maximum characters per line (0 disables)"
      },
      wrap_attributes: {
        type: 'string',
        "default": "auto",
        "enum": ["auto", "force"],
        description: "Wrap attributes to new lines [auto|force]"
      },
      wrap_attributes_indent_size: {
        type: 'integer',
        "default": defaultIndentSize,
        minimum: 0,
        description: "Indent wrapped attributes to after N characters"
      },
      preserve_newlines: {
        type: 'boolean',
        "default": true,
        description: "Preserve line-breaks"
      },
      max_preserve_newlines: {
        type: 'integer',
        "default": 10,
        description: "Number of line-breaks to be preserved in one chunk"
      },
      unformatted: {
        type: 'array',
        "default": ['a', 'abbr', 'area', 'audio', 'b', 'bdi', 'bdo', 'br', 'button', 'canvas', 'cite', 'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark', 'math', 'meter', 'noscript', 'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'svg', 'template', 'textarea', 'time', 'u', 'var', 'video', 'wbr', 'text', 'acronym', 'address', 'big', 'dt', 'ins', 'small', 'strike', 'tt', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        items: {
          type: 'string'
        },
        description: "List of tags (defaults to inline) that should not be reformatted"
      },
      end_with_newline: {
        type: 'boolean',
        "default": false,
        description: "End output with newline"
      },
      extra_liners: {
        type: 'array',
        "default": ['head', 'body', '/html'],
        items: {
          type: 'string'
        },
        description: "List of tags (defaults to [head,body,/html] that should have an extra newline before them."
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL2h0bWwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLG9HQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLENBQUMsV0FBRCxDQUFSLENBQUE7O0FBQUEsRUFDQSxTQUFBOztnQ0FBaUUsQ0FEakUsQ0FBQTs7QUFBQSxFQUVBLFFBQUE7O2lDQUErRCxJQUYvRCxDQUFBOztBQUFBLEVBR0EsaUJBQUEsR0FBb0IsQ0FBSSxRQUFILEdBQWlCLFNBQWpCLEdBQWdDLENBQWpDLENBSHBCLENBQUE7O0FBQUEsRUFJQSxpQkFBQSxHQUFvQixDQUFJLFFBQUgsR0FBaUIsR0FBakIsR0FBMEIsSUFBM0IsQ0FKcEIsQ0FBQTs7QUFBQSxFQUtBLHFCQUFBLEdBQXdCLENBQUEsUUFMeEIsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFFZixJQUFBLEVBQU0sTUFGUztBQUFBLElBR2YsU0FBQSxFQUFXLE1BSEk7QUFLZjtBQUFBOztPQUxlO0FBQUEsSUFRZixRQUFBLEVBQVUsQ0FDUixNQURRLENBUks7QUFZZjtBQUFBOztPQVplO0FBQUEsSUFlZixVQUFBLEVBQVksQ0FDVixNQURVLENBZkc7QUFBQSxJQW1CZixPQUFBLEVBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLG9DQUZiO09BREY7QUFBQSxNQUlBLFdBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxpQkFEVDtBQUFBLFFBRUEsT0FBQSxFQUFTLENBRlQ7QUFB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/languages/html.coffee
