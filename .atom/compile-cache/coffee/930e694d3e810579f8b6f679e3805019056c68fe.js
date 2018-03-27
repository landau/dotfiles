(function() {
  var defaultIndentChar, defaultIndentSize, defaultIndentWithTabs, ref, ref1, scope, softTabs, tabLength;

  scope = ['text.html'];

  tabLength = (ref = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.tabLength', {
    scope: scope
  }) : void 0) != null ? ref : 4;

  softTabs = (ref1 = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.softTabs', {
    scope: scope
  }) : void 0) != null ? ref1 : true;

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
        "enum": ["auto", "force", "force-aligned", "force-expand-multiline"],
        description: "Wrap attributes to new lines [auto|force|force-aligned|force-expand-multiline]"
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL2h0bWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQTs7RUFBQSxLQUFBLEdBQVEsQ0FBQyxXQUFEOztFQUNSLFNBQUE7OytCQUFpRTs7RUFDakUsUUFBQTs7Z0NBQStEOztFQUMvRCxpQkFBQSxHQUFvQixDQUFJLFFBQUgsR0FBaUIsU0FBakIsR0FBZ0MsQ0FBakM7O0VBQ3BCLGlCQUFBLEdBQW9CLENBQUksUUFBSCxHQUFpQixHQUFqQixHQUEwQixJQUEzQjs7RUFDcEIscUJBQUEsR0FBd0IsQ0FBSTs7RUFFNUIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sTUFGUztJQUdmLFNBQUEsRUFBVyxNQUhJOztBQUtmOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixNQURRLENBUks7O0FBWWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLE1BRFUsQ0FmRztJQW1CZixPQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsb0NBRmI7T0FERjtNQUlBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxpQkFEVDtRQUVBLE9BQUEsRUFBUyxDQUZUO1FBR0EsV0FBQSxFQUFhLHlCQUhiO09BTEY7TUFTQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsaUJBRFQ7UUFFQSxXQUFBLEVBQWEsdUJBRmI7T0FWRjtNQWFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxVQURUO1FBRUEsQ0FBQSxJQUFB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O01BaUVBLFlBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxPQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLE9BQWpCLENBRFQ7UUFFQSxLQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sUUFBTjtTQUhGO1FBSUEsV0FBQSxFQUFhLDRGQUpiO09BbEVGO0tBcEJhOztBQVBqQiIsInNvdXJjZXNDb250ZW50IjpbIiMgR2V0IEF0b20gZGVmYXVsdHNcbnNjb3BlID0gWyd0ZXh0Lmh0bWwnXVxudGFiTGVuZ3RoID0gYXRvbT8uY29uZmlnLmdldCgnZWRpdG9yLnRhYkxlbmd0aCcsIHNjb3BlOiBzY29wZSkgPyA0XG5zb2Z0VGFicyA9IGF0b20/LmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0VGFicycsIHNjb3BlOiBzY29wZSkgPyB0cnVlXG5kZWZhdWx0SW5kZW50U2l6ZSA9IChpZiBzb2Z0VGFicyB0aGVuIHRhYkxlbmd0aCBlbHNlIDEpXG5kZWZhdWx0SW5kZW50Q2hhciA9IChpZiBzb2Z0VGFicyB0aGVuIFwiIFwiIGVsc2UgXCJcXHRcIilcbmRlZmF1bHRJbmRlbnRXaXRoVGFicyA9IG5vdCBzb2Z0VGFic1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiBcIkhUTUxcIlxuICBuYW1lc3BhY2U6IFwiaHRtbFwiXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xuICAjIyNcbiAgZ3JhbW1hcnM6IFtcbiAgICBcIkhUTUxcIlxuICBdXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXG4gICMjI1xuICBleHRlbnNpb25zOiBbXG4gICAgXCJodG1sXCJcbiAgXVxuXG4gIG9wdGlvbnM6XG4gICAgaW5kZW50X2lubmVyX2h0bWw6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnQgPGhlYWQ+IGFuZCA8Ym9keT4gc2VjdGlvbnMuXCJcbiAgICBpbmRlbnRfc2l6ZTpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogZGVmYXVsdEluZGVudFNpemVcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIHNpemUvbGVuZ3RoXCJcbiAgICBpbmRlbnRfY2hhcjpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBkZWZhdWx0SW5kZW50Q2hhclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gY2hhcmFjdGVyXCJcbiAgICBicmFjZV9zdHlsZTpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcImNvbGxhcHNlXCJcbiAgICAgIGVudW06IFtcImNvbGxhcHNlXCIsIFwiZXhwYW5kXCIsIFwiZW5kLWV4cGFuZFwiLCBcIm5vbmVcIl1cbiAgICAgIGRlc2NyaXB0aW9uOiBcIltjb2xsYXBzZXxleHBhbmR8ZW5kLWV4cGFuZHxub25lXVwiXG4gICAgaW5kZW50X3NjcmlwdHM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJub3JtYWxcIlxuICAgICAgZW51bTogW1wia2VlcFwiLCBcInNlcGFyYXRlXCIsIFwibm9ybWFsXCJdXG4gICAgICBkZXNjcmlwdGlvbjogXCJba2VlcHxzZXBhcmF0ZXxub3JtYWxdXCJcbiAgICB3cmFwX2xpbmVfbGVuZ3RoOlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAyNTBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIk1heGltdW0gY2hhcmFjdGVycyBwZXIgbGluZSAoMCBkaXNhYmxlcylcIlxuICAgIHdyYXBfYXR0cmlidXRlczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcImF1dG9cIlxuICAgICAgZW51bTogW1wiYXV0b1wiLCBcImZvcmNlXCIsIFwiZm9yY2UtYWxpZ25lZFwiLCBcImZvcmNlLWV4cGFuZC1tdWx0aWxpbmVcIl1cbiAgICAgIGRlc2NyaXB0aW9uOiBcIldyYXAgYXR0cmlidXRlcyB0byBuZXcgbGluZXMgW2F1dG98Zm9yY2V8Zm9yY2UtYWxpZ25lZHxmb3JjZS1leHBhbmQtbXVsdGlsaW5lXVwiXG4gICAgd3JhcF9hdHRyaWJ1dGVzX2luZGVudF9zaXplOlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiBkZWZhdWx0SW5kZW50U2l6ZVxuICAgICAgbWluaW11bTogMFxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50IHdyYXBwZWQgYXR0cmlidXRlcyB0byBhZnRlciBOIGNoYXJhY3RlcnNcIlxuICAgIHByZXNlcnZlX25ld2xpbmVzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogXCJQcmVzZXJ2ZSBsaW5lLWJyZWFrc1wiXG4gICAgbWF4X3ByZXNlcnZlX25ld2xpbmVzOlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAxMFxuICAgICAgZGVzY3JpcHRpb246IFwiTnVtYmVyIG9mIGxpbmUtYnJlYWtzIHRvIGJlIHByZXNlcnZlZCBpbiBvbmUgY2h1bmtcIlxuICAgIHVuZm9ybWF0dGVkOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogW1xuICAgICAgICAgICAgJ2EnLCAnYWJicicsICdhcmVhJywgJ2F1ZGlvJywgJ2InLCAnYmRpJywgJ2JkbycsICdicicsICdidXR0b24nLCAnY2FudmFzJywgJ2NpdGUnLFxuICAgICAgICAgICAgJ2NvZGUnLCAnZGF0YScsICdkYXRhbGlzdCcsICdkZWwnLCAnZGZuJywgJ2VtJywgJ2VtYmVkJywgJ2knLCAnaWZyYW1lJywgJ2ltZycsXG4gICAgICAgICAgICAnaW5wdXQnLCAnaW5zJywgJ2tiZCcsICdrZXlnZW4nLCAnbGFiZWwnLCAnbWFwJywgJ21hcmsnLCAnbWF0aCcsICdtZXRlcicsICdub3NjcmlwdCcsXG4gICAgICAgICAgICAnb2JqZWN0JywgJ291dHB1dCcsICdwcm9ncmVzcycsICdxJywgJ3J1YnknLCAncycsICdzYW1wJywgJ3NlbGVjdCcsICdzbWFsbCcsXG4gICAgICAgICAgICAnc3BhbicsICdzdHJvbmcnLCAnc3ViJywgJ3N1cCcsICdzdmcnLCAndGVtcGxhdGUnLCAndGV4dGFyZWEnLCAndGltZScsICd1JywgJ3ZhcicsXG4gICAgICAgICAgICAndmlkZW8nLCAnd2JyJywgJ3RleHQnLFxuICAgICAgICAgICAgJ2Fjcm9ueW0nLCAnYWRkcmVzcycsICdiaWcnLCAnZHQnLCAnaW5zJywgJ3NtYWxsJywgJ3N0cmlrZScsICd0dCcsXG4gICAgICAgICAgICAncHJlJyxcbiAgICAgICAgICAgICdoMScsICdoMicsICdoMycsICdoNCcsICdoNScsICdoNidcbiAgICAgICAgXVxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZXNjcmlwdGlvbjogXCJMaXN0IG9mIHRhZ3MgKGRlZmF1bHRzIHRvIGlubGluZSkgdGhhdCBzaG91bGQgbm90IGJlIHJlZm9ybWF0dGVkXCJcbiAgICBlbmRfd2l0aF9uZXdsaW5lOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiRW5kIG91dHB1dCB3aXRoIG5ld2xpbmVcIlxuICAgIGV4dHJhX2xpbmVyczpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFsnaGVhZCcsICdib2R5JywgJy9odG1sJ11cbiAgICAgIGl0ZW1zOlxuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVzY3JpcHRpb246IFwiTGlzdCBvZiB0YWdzIChkZWZhdWx0cyB0byBbaGVhZCxib2R5LC9odG1sXSB0aGF0IHNob3VsZCBoYXZlIGFuIGV4dHJhIG5ld2xpbmUgYmVmb3JlIHRoZW0uXCJcblxufVxuIl19
