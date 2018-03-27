(function() {
  module.exports = {
    name: "Python",
    namespace: "python",
    scope: ['source.python'],

    /*
    Supported Grammars
     */
    grammars: ["Python"],

    /*
    Supported extensions
     */
    extensions: ["py"],
    options: {
      max_line_length: {
        type: 'integer',
        "default": 79,
        description: "set maximum allowed line length"
      },
      indent_size: {
        type: 'integer',
        "default": null,
        minimum: 0,
        description: "Indentation size/length"
      },
      ignore: {
        type: 'array',
        "default": ["E24"],
        items: {
          type: 'string'
        },
        description: "do not fix these errors/warnings"
      },
      formater: {
        type: 'string',
        "default": 'autopep8',
        "enum": ['autopep8', 'yapf'],
        description: "formatter used by pybeautifier"
      },
      style_config: {
        type: 'string',
        "default": 'pep8',
        description: "formatting style used by yapf"
      },
      sort_imports: {
        type: 'boolean',
        "default": false,
        description: "sort imports (requires isort installed)"
      },
      multi_line_output: {
        type: 'string',
        "default": 'Hanging Grid Grouped',
        "enum": ['Grid', 'Vertical', 'Hanging Indent', 'Vertical Hanging Indent', 'Hanging Grid', 'Hanging Grid Grouped', 'NOQA'],
        description: "defines how from imports wrap (requires isort installed)"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL3B5dGhvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUVmLElBQUEsRUFBTSxRQUZTO0lBR2YsU0FBQSxFQUFXLFFBSEk7SUFJZixLQUFBLEVBQU8sQ0FBQyxlQUFELENBSlE7O0FBTWY7OztJQUdBLFFBQUEsRUFBVSxDQUNSLFFBRFEsQ0FUSzs7QUFhZjs7O0lBR0EsVUFBQSxFQUFZLENBQ1YsSUFEVSxDQWhCRztJQW9CZixPQUFBLEVBQ0U7TUFBQSxlQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLFdBQUEsRUFBYSxpQ0FGYjtPQURGO01BSUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxPQUFBLEVBQVMsQ0FGVDtRQUdBLFdBQUEsRUFBYSx5QkFIYjtPQUxGO01BU0EsTUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLE9BQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBQUMsS0FBRCxDQURUO1FBRUEsS0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLFFBQU47U0FIRjtRQUlBLFdBQUEsRUFBYSxrQ0FKYjtPQVZGO01BZUEsUUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFVBRFQ7UUFFQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsVUFBRCxFQUFhLE1BQWIsQ0FGTjtRQUdBLFdBQUEsRUFBYSxnQ0FIYjtPQWhCRjtNQW9CQSxZQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFEVDtRQUVBLFdBQUEsRUFBYSwrQkFGYjtPQXJCRjtNQXdCQSxZQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSx5Q0FGYjtPQXpCRjtNQTRCQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLHNCQURUO1FBRUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUNKLE1BREksRUFFSixVQUZJLEVBR0osZ0JBSEksRUFJSix5QkFKSSxFQUtKLGNBTEksRUFNSixzQkFOSSxFQU9KLE1BUEksQ0FGTjtRQVdBLFdBQUEsRUFBYSwwREFYYjtPQTdCRjtLQXJCYTs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiBcIlB5dGhvblwiXG4gIG5hbWVzcGFjZTogXCJweXRob25cIlxuICBzY29wZTogWydzb3VyY2UucHl0aG9uJ11cblxuICAjIyNcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXG4gICMjI1xuICBncmFtbWFyczogW1xuICAgIFwiUHl0aG9uXCJcbiAgXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xuICAjIyNcbiAgZXh0ZW5zaW9uczogW1xuICAgIFwicHlcIlxuICBdXG5cbiAgb3B0aW9uczpcbiAgICBtYXhfbGluZV9sZW5ndGg6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDc5XG4gICAgICBkZXNjcmlwdGlvbjogXCJzZXQgbWF4aW11bSBhbGxvd2VkIGxpbmUgbGVuZ3RoXCJcbiAgICBpbmRlbnRfc2l6ZTpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgbWluaW11bTogMFxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gc2l6ZS9sZW5ndGhcIlxuICAgIGlnbm9yZTpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFtcIkUyNFwiXVxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZXNjcmlwdGlvbjogXCJkbyBub3QgZml4IHRoZXNlIGVycm9ycy93YXJuaW5nc1wiXG4gICAgZm9ybWF0ZXI6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ2F1dG9wZXA4J1xuICAgICAgZW51bTogWydhdXRvcGVwOCcsICd5YXBmJ11cbiAgICAgIGRlc2NyaXB0aW9uOiBcImZvcm1hdHRlciB1c2VkIGJ5IHB5YmVhdXRpZmllclwiXG4gICAgc3R5bGVfY29uZmlnOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdwZXA4J1xuICAgICAgZGVzY3JpcHRpb246IFwiZm9ybWF0dGluZyBzdHlsZSB1c2VkIGJ5IHlhcGZcIlxuICAgIHNvcnRfaW1wb3J0czpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcInNvcnQgaW1wb3J0cyAocmVxdWlyZXMgaXNvcnQgaW5zdGFsbGVkKVwiXG4gICAgbXVsdGlfbGluZV9vdXRwdXQ6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ0hhbmdpbmcgR3JpZCBHcm91cGVkJ1xuICAgICAgZW51bTogW1xuICAgICAgICAnR3JpZCdcbiAgICAgICAgJ1ZlcnRpY2FsJ1xuICAgICAgICAnSGFuZ2luZyBJbmRlbnQnXG4gICAgICAgICdWZXJ0aWNhbCBIYW5naW5nIEluZGVudCdcbiAgICAgICAgJ0hhbmdpbmcgR3JpZCdcbiAgICAgICAgJ0hhbmdpbmcgR3JpZCBHcm91cGVkJ1xuICAgICAgICAnTk9RQSdcbiAgICAgIF1cbiAgICAgIGRlc2NyaXB0aW9uOiBcImRlZmluZXMgaG93IGZyb20gaW1wb3J0cyB3cmFwIChyZXF1aXJlcyBpc29ydCBpbnN0YWxsZWQpXCJcbn1cbiJdfQ==
