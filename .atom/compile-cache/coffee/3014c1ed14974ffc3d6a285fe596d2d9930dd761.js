(function() {
  module.exports = {
    name: "JavaScript",
    namespace: "js",
    scope: ['source.js'],

    /*
    Supported Grammars
     */
    grammars: ["JavaScript"],

    /*
    Supported extensions
     */
    extensions: ["js"],
    defaultBeautifier: "JS Beautify",

    /*
     */
    options: {
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
      indent_level: {
        type: 'integer',
        "default": 0,
        description: "Initial indentation level"
      },
      indent_with_tabs: {
        type: 'boolean',
        "default": null,
        description: "Indentation uses tabs, overrides `Indent Size` and `Indent Char`"
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
      space_in_paren: {
        type: 'boolean',
        "default": false,
        description: "Add padding spaces within paren, ie. f( a, b )"
      },
      jslint_happy: {
        type: 'boolean',
        "default": false,
        description: "Enable jslint-stricter mode"
      },
      space_after_anon_function: {
        type: 'boolean',
        "default": false,
        description: "Add a space before an anonymous function's parens, ie. function ()"
      },
      brace_style: {
        type: 'string',
        "default": "collapse",
        "enum": ["collapse", "collapse-preserve-inline", "expand", "end-expand", "none"],
        description: "[collapse|collapse-preserve-inline|expand|end-expand|none]"
      },
      break_chained_methods: {
        type: 'boolean',
        "default": false,
        description: "Break chained method calls across subsequent lines"
      },
      keep_array_indentation: {
        type: 'boolean',
        "default": false,
        description: "Preserve array indentation"
      },
      keep_function_indentation: {
        type: 'boolean',
        "default": false,
        description: ""
      },
      space_before_conditional: {
        type: 'boolean',
        "default": true,
        description: ""
      },
      eval_code: {
        type: 'boolean',
        "default": false,
        description: ""
      },
      unescape_strings: {
        type: 'boolean',
        "default": false,
        description: "Decode printable characters encoded in xNN notation"
      },
      wrap_line_length: {
        type: 'integer',
        "default": 0,
        description: "Wrap lines at next opportunity after N characters"
      },
      end_with_newline: {
        type: 'boolean',
        "default": false,
        description: "End output with newline"
      },
      end_with_comma: {
        type: 'boolean',
        "default": false,
        description: "If a terminating comma should be inserted into arrays, object literals, and destructured objects."
      },
      end_of_line: {
        type: 'string',
        "default": "System Default",
        "enum": ["CRLF", "LF", "System Default"],
        description: "Override EOL from line-ending-selector"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL2phdmFzY3JpcHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sWUFGUztJQUdmLFNBQUEsRUFBVyxJQUhJO0lBSWYsS0FBQSxFQUFPLENBQUMsV0FBRCxDQUpROztBQU1mOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixZQURRLENBVEs7O0FBYWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLElBRFUsQ0FoQkc7SUFvQmYsaUJBQUEsRUFBbUIsYUFwQko7O0FBc0JmOztJQUVBLE9BQUEsRUFFRTtNQUFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsT0FBQSxFQUFTLENBRlQ7UUFHQSxXQUFBLEVBQWEseUJBSGI7T0FERjtNQUtBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLHVCQUZiO09BTkY7TUFTQSxZQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FEVDtRQUVBLFdBQUEsRUFBYSwyQkFGYjtPQVZGO01BYUEsZ0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLGtFQUZiO09BZEY7TUFpQkEsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLHNCQUZiO09BbEJGO01BcUJBLHFCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLFdBQUEsRUFBYSxvREFGYjtPQXRCRjtNQXlCQSxjQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSxnREFGYjtPQTFCRjtNQTZCQSxZQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSw2QkFGYjtPQTlCRjtNQWlDQSx5QkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsb0VBRmI7T0FsQ0Y7TUFxQ0EsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFVBRFQ7UUFFQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsVUFBRCxFQUFhLDBCQUFiLEVBQXlDLFFBQXpDLEVBQW1ELFlBQW5ELEVBQWlFLE1BQWpFLENBRk47UUFHQSxXQUFBLEVBQWEsNERBSGI7T0F0Q0Y7TUEwQ0EscUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLG9EQUZiO09BM0NGO01BOENBLHNCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSw0QkFGYjtPQS9DRjtNQWtEQSx5QkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsRUFGYjtPQW5ERjtNQXNEQSx3QkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsRUFGYjtPQXZERjtNQTBEQSxTQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSxFQUZiO09BM0RGO01BOERBLGdCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSxxREFGYjtPQS9ERjtNQWtFQSxnQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBRFQ7UUFFQSxXQUFBLEVBQWEsbURBRmI7T0FuRUY7TUFzRUEsZ0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLHlCQUZiO09BdkVGO01BMEVBLGNBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLG1HQUZiO09BM0VGO01BK0VBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxnQkFEVDtRQUVBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVEsSUFBUixFQUFhLGdCQUFiLENBRk47UUFHQSxXQUFBLEVBQWEsd0NBSGI7T0FoRkY7S0ExQmE7O0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogXCJKYXZhU2NyaXB0XCJcbiAgbmFtZXNwYWNlOiBcImpzXCJcbiAgc2NvcGU6IFsnc291cmNlLmpzJ11cblxuICAjIyNcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXG4gICMjI1xuICBncmFtbWFyczogW1xuICAgIFwiSmF2YVNjcmlwdFwiXG4gIF1cblxuICAjIyNcbiAgU3VwcG9ydGVkIGV4dGVuc2lvbnNcbiAgIyMjXG4gIGV4dGVuc2lvbnM6IFtcbiAgICBcImpzXCJcbiAgXVxuXG4gIGRlZmF1bHRCZWF1dGlmaWVyOiBcIkpTIEJlYXV0aWZ5XCJcblxuICAjIyNcbiAgIyMjXG4gIG9wdGlvbnM6XG4gICAgIyBKYXZhU2NyaXB0XG4gICAgaW5kZW50X3NpemU6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIHNpemUvbGVuZ3RoXCJcbiAgICBpbmRlbnRfY2hhcjpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnRhdGlvbiBjaGFyYWN0ZXJcIlxuICAgIGluZGVudF9sZXZlbDpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogMFxuICAgICAgZGVzY3JpcHRpb246IFwiSW5pdGlhbCBpbmRlbnRhdGlvbiBsZXZlbFwiXG4gICAgaW5kZW50X3dpdGhfdGFiczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gdXNlcyB0YWJzLCBvdmVycmlkZXMgYEluZGVudCBTaXplYCBhbmQgYEluZGVudCBDaGFyYFwiXG4gICAgcHJlc2VydmVfbmV3bGluZXM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlByZXNlcnZlIGxpbmUtYnJlYWtzXCJcbiAgICBtYXhfcHJlc2VydmVfbmV3bGluZXM6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDEwXG4gICAgICBkZXNjcmlwdGlvbjogXCJOdW1iZXIgb2YgbGluZS1icmVha3MgdG8gYmUgcHJlc2VydmVkIGluIG9uZSBjaHVua1wiXG4gICAgc3BhY2VfaW5fcGFyZW46XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJBZGQgcGFkZGluZyBzcGFjZXMgd2l0aGluIHBhcmVuLCBpZS4gZiggYSwgYiApXCJcbiAgICBqc2xpbnRfaGFwcHk6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJFbmFibGUganNsaW50LXN0cmljdGVyIG1vZGVcIlxuICAgIHNwYWNlX2FmdGVyX2Fub25fZnVuY3Rpb246XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJBZGQgYSBzcGFjZSBiZWZvcmUgYW4gYW5vbnltb3VzIGZ1bmN0aW9uJ3MgcGFyZW5zLCBpZS4gZnVuY3Rpb24gKClcIlxuICAgIGJyYWNlX3N0eWxlOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiY29sbGFwc2VcIlxuICAgICAgZW51bTogW1wiY29sbGFwc2VcIiwgXCJjb2xsYXBzZS1wcmVzZXJ2ZS1pbmxpbmVcIiwgXCJleHBhbmRcIiwgXCJlbmQtZXhwYW5kXCIsIFwibm9uZVwiXVxuICAgICAgZGVzY3JpcHRpb246IFwiW2NvbGxhcHNlfGNvbGxhcHNlLXByZXNlcnZlLWlubGluZXxleHBhbmR8ZW5kLWV4cGFuZHxub25lXVwiXG4gICAgYnJlYWtfY2hhaW5lZF9tZXRob2RzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiQnJlYWsgY2hhaW5lZCBtZXRob2QgY2FsbHMgYWNyb3NzIHN1YnNlcXVlbnQgbGluZXNcIlxuICAgIGtlZXBfYXJyYXlfaW5kZW50YXRpb246XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJQcmVzZXJ2ZSBhcnJheSBpbmRlbnRhdGlvblwiXG4gICAga2VlcF9mdW5jdGlvbl9pbmRlbnRhdGlvbjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlwiXG4gICAgc3BhY2VfYmVmb3JlX2NvbmRpdGlvbmFsOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogXCJcIlxuICAgIGV2YWxfY29kZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlwiXG4gICAgdW5lc2NhcGVfc3RyaW5nczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRlY29kZSBwcmludGFibGUgY2hhcmFjdGVycyBlbmNvZGVkIGluIHhOTiBub3RhdGlvblwiXG4gICAgd3JhcF9saW5lX2xlbmd0aDpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogMFxuICAgICAgZGVzY3JpcHRpb246IFwiV3JhcCBsaW5lcyBhdCBuZXh0IG9wcG9ydHVuaXR5IGFmdGVyIE4gY2hhcmFjdGVyc1wiXG4gICAgZW5kX3dpdGhfbmV3bGluZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVuZCBvdXRwdXQgd2l0aCBuZXdsaW5lXCJcbiAgICBlbmRfd2l0aF9jb21tYTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIklmIGEgdGVybWluYXRpbmcgY29tbWEgc2hvdWxkIGJlIGluc2VydGVkIGludG8gXFxcbiAgICAgICAgICAgICAgICAgIGFycmF5cywgb2JqZWN0IGxpdGVyYWxzLCBhbmQgZGVzdHJ1Y3R1cmVkIG9iamVjdHMuXCJcbiAgICBlbmRfb2ZfbGluZTpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIlN5c3RlbSBEZWZhdWx0XCJcbiAgICAgIGVudW06IFtcIkNSTEZcIixcIkxGXCIsXCJTeXN0ZW0gRGVmYXVsdFwiXVxuICAgICAgZGVzY3JpcHRpb246IFwiT3ZlcnJpZGUgRU9MIGZyb20gbGluZS1lbmRpbmctc2VsZWN0b3JcIlxuXG59XG4iXX0=
