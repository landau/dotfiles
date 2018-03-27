(function() {
  module.exports = {
    name: "LaTeX",
    namespace: "latex",
    scope: ['source.tex'],

    /*
    Supported Grammars
     */
    grammars: ["BibTeX", "LaTeX", "TeX"],

    /*
    Supported extensions
     */
    extensions: ["bib", "tex", "sty", "cls", "dtx", "ins", "bbx", "cbx"],
    defaultBeautifier: "Latex Beautify",

    /*
     */
    options: {
      indent_char: {
        type: 'string',
        "default": null,
        description: "Indentation character"
      },
      indent_with_tabs: {
        type: 'boolean',
        "default": null,
        description: "Indentation uses tabs, overrides `Indent Size` and `Indent Char`"
      },
      indent_preamble: {
        type: 'boolean',
        "default": false,
        description: "Indent the preable"
      },
      always_look_for_split_braces: {
        type: 'boolean',
        "default": true,
        description: "If `latexindent` should look for commands that split braces across lines"
      },
      always_look_for_split_brackets: {
        type: 'boolean',
        "default": false,
        description: "If `latexindent` should look for commands that split brackets across lines"
      },
      remove_trailing_whitespace: {
        type: 'boolean',
        "default": false,
        description: "Remove trailing whitespace"
      },
      align_columns_in_environments: {
        type: 'array',
        "default": ["tabular", "matrix", "bmatrix", "pmatrix"],
        decription: "Aligns columns by the alignment tabs for environments specified"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL2xhdGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBRWYsSUFBQSxFQUFNLE9BRlM7SUFHZixTQUFBLEVBQVcsT0FISTtJQUlmLEtBQUEsRUFBTyxDQUFDLFlBQUQsQ0FKUTs7QUFNZjs7O0lBR0EsUUFBQSxFQUFVLENBQ1IsUUFEUSxFQUVSLE9BRlEsRUFHUixLQUhRLENBVEs7O0FBZWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLEtBRFUsRUFFVixLQUZVLEVBR1YsS0FIVSxFQUlWLEtBSlUsRUFLVixLQUxVLEVBTVYsS0FOVSxFQU9WLEtBUFUsRUFRVixLQVJVLENBbEJHO0lBNkJmLGlCQUFBLEVBQW1CLGdCQTdCSjs7QUErQmY7O0lBR0EsT0FBQSxFQUNFO01BQUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsdUJBRmI7T0FERjtNQUlBLGdCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSxrRUFGYjtPQUxGO01BUUEsZUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsb0JBRmI7T0FURjtNQVlBLDRCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSwwRUFGYjtPQWJGO01BZ0JBLDhCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSw0RUFGYjtPQWpCRjtNQW9CQSwwQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsNEJBRmI7T0FyQkY7TUF3QkEsNkJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxPQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUSxDQUFDLFNBQUQsRUFBWSxRQUFaLEVBQXNCLFNBQXRCLEVBQWlDLFNBQWpDLENBRFI7UUFFQSxVQUFBLEVBQVksaUVBRlo7T0F6QkY7S0FuQ2E7O0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogXCJMYVRlWFwiXG4gIG5hbWVzcGFjZTogXCJsYXRleFwiXG4gIHNjb3BlOiBbJ3NvdXJjZS50ZXgnXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgR3JhbW1hcnNcbiAgIyMjXG4gIGdyYW1tYXJzOiBbXG4gICAgXCJCaWJUZVhcIlxuICAgIFwiTGFUZVhcIlxuICAgIFwiVGVYXCJcbiAgXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xuICAjIyNcbiAgZXh0ZW5zaW9uczogW1xuICAgIFwiYmliXCJcbiAgICBcInRleFwiXG4gICAgXCJzdHlcIlxuICAgIFwiY2xzXCJcbiAgICBcImR0eFwiXG4gICAgXCJpbnNcIlxuICAgIFwiYmJ4XCJcbiAgICBcImNieFwiXG4gIF1cblxuICBkZWZhdWx0QmVhdXRpZmllcjogXCJMYXRleCBCZWF1dGlmeVwiXG5cbiAgIyMjXG5cbiAgIyMjXG4gIG9wdGlvbnM6XG4gICAgaW5kZW50X2NoYXI6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gY2hhcmFjdGVyXCJcbiAgICBpbmRlbnRfd2l0aF90YWJzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnRhdGlvbiB1c2VzIHRhYnMsIG92ZXJyaWRlcyBgSW5kZW50IFNpemVgIGFuZCBgSW5kZW50IENoYXJgXCJcbiAgICBpbmRlbnRfcHJlYW1ibGU6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnQgdGhlIHByZWFibGVcIlxuICAgIGFsd2F5c19sb29rX2Zvcl9zcGxpdF9icmFjZXM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIklmIGBsYXRleGluZGVudGAgc2hvdWxkIGxvb2sgZm9yIGNvbW1hbmRzIHRoYXQgc3BsaXQgYnJhY2VzIGFjcm9zcyBsaW5lc1wiXG4gICAgYWx3YXlzX2xvb2tfZm9yX3NwbGl0X2JyYWNrZXRzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiSWYgYGxhdGV4aW5kZW50YCBzaG91bGQgbG9vayBmb3IgY29tbWFuZHMgdGhhdCBzcGxpdCBicmFja2V0cyBhY3Jvc3MgbGluZXNcIlxuICAgIHJlbW92ZV90cmFpbGluZ193aGl0ZXNwYWNlOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiUmVtb3ZlIHRyYWlsaW5nIHdoaXRlc3BhY2VcIlxuICAgIGFsaWduX2NvbHVtbnNfaW5fZW52aXJvbm1lbnRzOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDpbXCJ0YWJ1bGFyXCIsIFwibWF0cml4XCIsIFwiYm1hdHJpeFwiLCBcInBtYXRyaXhcIl1cbiAgICAgIGRlY3JpcHRpb246IFwiQWxpZ25zIGNvbHVtbnMgYnkgdGhlIGFsaWdubWVudCB0YWJzIGZvciBlbnZpcm9ubWVudHMgc3BlY2lmaWVkXCJcbn1cbiJdfQ==
