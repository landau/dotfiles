(function() {
  module.exports = {
    name: "HTML",
    namespace: "html",
    scope: ['text.html'],

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
        "default": null,
        minimum: 0,
        description: "Indentation size/length"
      },
      indent_char: {
        type: 'string',
        "default": null,
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
        "default": null,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL2h0bWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sTUFGUztJQUdmLFNBQUEsRUFBVyxNQUhJO0lBSWYsS0FBQSxFQUFPLENBQUMsV0FBRCxDQUpROztBQU1mOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixNQURRLENBVEs7O0FBYWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLE1BRFUsQ0FoQkc7SUFvQmYsT0FBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLG9DQUZiO09BREY7TUFJQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLE9BQUEsRUFBUyxDQUZUO1FBR0EsV0FBQSxFQUFhLHlCQUhiO09BTEY7TUFTQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSx1QkFGYjtPQVZGO01BYUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFVBRFQ7UUFFQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsVUFBRCxFQUFhLFFBQWIsRUFBdUIsWUFBdkIsRUFBcUMsTUFBckMsQ0FGTjtRQUdBLFdBQUEsRUFBYSxtQ0FIYjtPQWRGO01Ba0JBLGNBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxRQURUO1FBRUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxD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LCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiBcIkhUTUxcIlxuICBuYW1lc3BhY2U6IFwiaHRtbFwiXG4gIHNjb3BlOiBbJ3RleHQuaHRtbCddXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xuICAjIyNcbiAgZ3JhbW1hcnM6IFtcbiAgICBcIkhUTUxcIlxuICBdXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXG4gICMjI1xuICBleHRlbnNpb25zOiBbXG4gICAgXCJodG1sXCJcbiAgXVxuXG4gIG9wdGlvbnM6XG4gICAgaW5kZW50X2lubmVyX2h0bWw6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnQgPGhlYWQ+IGFuZCA8Ym9keT4gc2VjdGlvbnMuXCJcbiAgICBpbmRlbnRfc2l6ZTpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgbWluaW11bTogMFxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gc2l6ZS9sZW5ndGhcIlxuICAgIGluZGVudF9jaGFyOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIGNoYXJhY3RlclwiXG4gICAgYnJhY2Vfc3R5bGU6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJjb2xsYXBzZVwiXG4gICAgICBlbnVtOiBbXCJjb2xsYXBzZVwiLCBcImV4cGFuZFwiLCBcImVuZC1leHBhbmRcIiwgXCJub25lXCJdXG4gICAgICBkZXNjcmlwdGlvbjogXCJbY29sbGFwc2V8ZXhwYW5kfGVuZC1leHBhbmR8bm9uZV1cIlxuICAgIGluZGVudF9zY3JpcHRzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwibm9ybWFsXCJcbiAgICAgIGVudW06IFtcImtlZXBcIiwgXCJzZXBhcmF0ZVwiLCBcIm5vcm1hbFwiXVxuICAgICAgZGVzY3JpcHRpb246IFwiW2tlZXB8c2VwYXJhdGV8bm9ybWFsXVwiXG4gICAgd3JhcF9saW5lX2xlbmd0aDpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogMjUwXG4gICAgICBkZXNjcmlwdGlvbjogXCJNYXhpbXVtIGNoYXJhY3RlcnMgcGVyIGxpbmUgKDAgZGlzYWJsZXMpXCJcbiAgICB3cmFwX2F0dHJpYnV0ZXM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJhdXRvXCJcbiAgICAgIGVudW06IFtcImF1dG9cIiwgXCJmb3JjZVwiLCBcImZvcmNlLWFsaWduZWRcIiwgXCJmb3JjZS1leHBhbmQtbXVsdGlsaW5lXCJdXG4gICAgICBkZXNjcmlwdGlvbjogXCJXcmFwIGF0dHJpYnV0ZXMgdG8gbmV3IGxpbmVzIFthdXRvfGZvcmNlfGZvcmNlLWFsaWduZWR8Zm9yY2UtZXhwYW5kLW11bHRpbGluZV1cIlxuICAgIHdyYXBfYXR0cmlidXRlc19pbmRlbnRfc2l6ZTpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgbWluaW11bTogMFxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50IHdyYXBwZWQgYXR0cmlidXRlcyB0byBhZnRlciBOIGNoYXJhY3RlcnNcIlxuICAgIHByZXNlcnZlX25ld2xpbmVzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogXCJQcmVzZXJ2ZSBsaW5lLWJyZWFrc1wiXG4gICAgbWF4X3ByZXNlcnZlX25ld2xpbmVzOlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAxMFxuICAgICAgZGVzY3JpcHRpb246IFwiTnVtYmVyIG9mIGxpbmUtYnJlYWtzIHRvIGJlIHByZXNlcnZlZCBpbiBvbmUgY2h1bmtcIlxuICAgIHVuZm9ybWF0dGVkOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogW1xuICAgICAgICAgICAgJ2EnLCAnYWJicicsICdhcmVhJywgJ2F1ZGlvJywgJ2InLCAnYmRpJywgJ2JkbycsICdicicsICdidXR0b24nLCAnY2FudmFzJywgJ2NpdGUnLFxuICAgICAgICAgICAgJ2NvZGUnLCAnZGF0YScsICdkYXRhbGlzdCcsICdkZWwnLCAnZGZuJywgJ2VtJywgJ2VtYmVkJywgJ2knLCAnaWZyYW1lJywgJ2ltZycsXG4gICAgICAgICAgICAnaW5wdXQnLCAnaW5zJywgJ2tiZCcsICdrZXlnZW4nLCAnbGFiZWwnLCAnbWFwJywgJ21hcmsnLCAnbWF0aCcsICdtZXRlcicsICdub3NjcmlwdCcsXG4gICAgICAgICAgICAnb2JqZWN0JywgJ291dHB1dCcsICdwcm9ncmVzcycsICdxJywgJ3J1YnknLCAncycsICdzYW1wJywgJ3NlbGVjdCcsICdzbWFsbCcsXG4gICAgICAgICAgICAnc3BhbicsICdzdHJvbmcnLCAnc3ViJywgJ3N1cCcsICdzdmcnLCAndGVtcGxhdGUnLCAndGV4dGFyZWEnLCAndGltZScsICd1JywgJ3ZhcicsXG4gICAgICAgICAgICAndmlkZW8nLCAnd2JyJywgJ3RleHQnLFxuICAgICAgICAgICAgJ2Fjcm9ueW0nLCAnYWRkcmVzcycsICdiaWcnLCAnZHQnLCAnaW5zJywgJ3NtYWxsJywgJ3N0cmlrZScsICd0dCcsXG4gICAgICAgICAgICAncHJlJyxcbiAgICAgICAgICAgICdoMScsICdoMicsICdoMycsICdoNCcsICdoNScsICdoNidcbiAgICAgICAgXVxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZXNjcmlwdGlvbjogXCJMaXN0IG9mIHRhZ3MgKGRlZmF1bHRzIHRvIGlubGluZSkgdGhhdCBzaG91bGQgbm90IGJlIHJlZm9ybWF0dGVkXCJcbiAgICBlbmRfd2l0aF9uZXdsaW5lOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiRW5kIG91dHB1dCB3aXRoIG5ld2xpbmVcIlxuICAgIGV4dHJhX2xpbmVyczpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFsnaGVhZCcsICdib2R5JywgJy9odG1sJ11cbiAgICAgIGl0ZW1zOlxuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVzY3JpcHRpb246IFwiTGlzdCBvZiB0YWdzIChkZWZhdWx0cyB0byBbaGVhZCxib2R5LC9odG1sXSB0aGF0IHNob3VsZCBoYXZlIGFuIGV4dHJhIG5ld2xpbmUgYmVmb3JlIHRoZW0uXCJcblxufVxuIl19
