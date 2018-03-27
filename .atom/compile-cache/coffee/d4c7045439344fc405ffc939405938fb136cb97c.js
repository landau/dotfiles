(function() {
  module.exports = {
    name: "PHP",
    namespace: "php",

    /*
    Supported Grammars
     */
    grammars: ["PHP"],

    /*
    Supported extensions
     */
    extensions: ["php", "module", "inc"],
    defaultBeautifier: "PHP-CS-Fixer",
    options: {
      cs_fixer_path: {
        title: "PHP-CS-Fixer Path",
        type: 'string',
        "default": "",
        description: "Absolute path to the `php-cs-fixer` CLI executable"
      },
      cs_fixer_version: {
        title: "PHP-CS-Fixer Version",
        type: 'integer',
        "default": 2,
        "enum": [1, 2]
      },
      fixers: {
        type: 'string',
        "default": "",
        description: "Add fixer(s). i.e. linefeed,-short_tag,indentation (PHP-CS-Fixer 1 only)"
      },
      level: {
        type: 'string',
        "default": "",
        description: "By default, all PSR-2 fixers and some additional ones are run. (PHP-CS-Fixer 1 only)"
      },
      rules: {
        type: 'string',
        "default": "",
        description: "Add rule(s). i.e. line_ending,-full_opening_tag,@PSR2 (PHP-CS-Fixer 2 only)"
      },
      allow_risky: {
        title: "Allow risky rules",
        type: 'string',
        "default": "no",
        "enum": ["no", "yes"],
        description: "allow risky rules to be applied (PHP-CS-Fixer 2 only)"
      },
      phpcbf_path: {
        title: "PHPCBF Path",
        type: 'string',
        "default": "",
        description: "Path to the `phpcbf` CLI executable"
      },
      phpcbf_version: {
        title: "PHPCBF Version",
        type: 'integer',
        "default": 2,
        "enum": [1, 2, 3]
      },
      standard: {
        title: "PHPCBF Standard",
        type: 'string',
        "default": "PEAR",
        description: "Standard name Squiz, PSR2, PSR1, PHPCS, PEAR, Zend, MySource... or path to CS rules. Will use local `phpcs.xml`, `phpcs.xml.dist`, `phpcs.ruleset.xml` or `ruleset.xml` if found in the project root."
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL3BocC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUVmLElBQUEsRUFBTSxLQUZTO0lBR2YsU0FBQSxFQUFXLEtBSEk7O0FBS2Y7OztJQUdBLFFBQUEsRUFBVSxDQUNSLEtBRFEsQ0FSSzs7QUFZZjs7O0lBR0EsVUFBQSxFQUFZLENBQ1YsS0FEVSxFQUVWLFFBRlUsRUFHVixLQUhVLENBZkc7SUFxQmYsaUJBQUEsRUFBbUIsY0FyQko7SUF1QmYsT0FBQSxFQUNFO01BQUEsYUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLG1CQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRlQ7UUFHQSxXQUFBLEVBQWEsb0RBSGI7T0FERjtNQUtBLGdCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sc0JBQVA7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FGVDtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxDQUFELEVBQUksQ0FBSixDQUhOO09BTkY7TUFVQSxNQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLFdBQUEsRUFBYSwwRUFGYjtPQVhGO01BY0EsS0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7UUFFQSxXQUFBLEVBQWEsc0ZBRmI7T0FmRjtNQWtCQSxLQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLFdBQUEsRUFBYSw2RUFGYjtPQW5CRjtNQXNCQSxXQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sbUJBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFGVDtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxJQUFELEVBQU8sS0FBUCxDQUhOO1FBSUEsV0FBQSxFQUFhLHVEQUpiO09BdkJGO01BNEJBLFdBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxhQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRlQ7UUFHQSxXQUFBLEVBQWEscUNBSGI7T0E3QkY7TUFpQ0EsY0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGdCQUFQO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBRlQ7UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBSE47T0FsQ0Y7TUFzQ0EsUUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGlCQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BRlQ7UUFHQSxXQUFBLEVBQWEsdU1BSGI7T0F2Q0Y7S0F4QmE7O0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogXCJQSFBcIlxuICBuYW1lc3BhY2U6IFwicGhwXCJcblxuICAjIyNcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXG4gICMjI1xuICBncmFtbWFyczogW1xuICAgIFwiUEhQXCJcbiAgXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xuICAjIyNcbiAgZXh0ZW5zaW9uczogW1xuICAgIFwicGhwXCJcbiAgICBcIm1vZHVsZVwiXG4gICAgXCJpbmNcIlxuICBdXG5cbiAgZGVmYXVsdEJlYXV0aWZpZXI6IFwiUEhQLUNTLUZpeGVyXCJcblxuICBvcHRpb25zOlxuICAgIGNzX2ZpeGVyX3BhdGg6XG4gICAgICB0aXRsZTogXCJQSFAtQ1MtRml4ZXIgUGF0aFwiXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJcIlxuICAgICAgZGVzY3JpcHRpb246IFwiQWJzb2x1dGUgcGF0aCB0byB0aGUgYHBocC1jcy1maXhlcmAgQ0xJIGV4ZWN1dGFibGVcIlxuICAgIGNzX2ZpeGVyX3ZlcnNpb246XG4gICAgICB0aXRsZTogXCJQSFAtQ1MtRml4ZXIgVmVyc2lvblwiXG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDJcbiAgICAgIGVudW06IFsxLCAyXVxuICAgIGZpeGVyczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIlwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJBZGQgZml4ZXIocykuIGkuZS4gbGluZWZlZWQsLXNob3J0X3RhZyxpbmRlbnRhdGlvbiAoUEhQLUNTLUZpeGVyIDEgb25seSlcIlxuICAgIGxldmVsOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkJ5IGRlZmF1bHQsIGFsbCBQU1ItMiBmaXhlcnMgYW5kIHNvbWUgYWRkaXRpb25hbCBvbmVzIGFyZSBydW4uIChQSFAtQ1MtRml4ZXIgMSBvbmx5KVwiXG4gICAgcnVsZXM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJcIlxuICAgICAgZGVzY3JpcHRpb246IFwiQWRkIHJ1bGUocykuIGkuZS4gbGluZV9lbmRpbmcsLWZ1bGxfb3BlbmluZ190YWcsQFBTUjIgKFBIUC1DUy1GaXhlciAyIG9ubHkpXCJcbiAgICBhbGxvd19yaXNreTpcbiAgICAgIHRpdGxlOiBcIkFsbG93IHJpc2t5IHJ1bGVzXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIm5vXCJcbiAgICAgIGVudW06IFtcIm5vXCIsIFwieWVzXCJdXG4gICAgICBkZXNjcmlwdGlvbjogXCJhbGxvdyByaXNreSBydWxlcyB0byBiZSBhcHBsaWVkIChQSFAtQ1MtRml4ZXIgMiBvbmx5KVwiXG4gICAgcGhwY2JmX3BhdGg6XG4gICAgICB0aXRsZTogXCJQSFBDQkYgUGF0aFwiXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJcIlxuICAgICAgZGVzY3JpcHRpb246IFwiUGF0aCB0byB0aGUgYHBocGNiZmAgQ0xJIGV4ZWN1dGFibGVcIixcbiAgICBwaHBjYmZfdmVyc2lvbjpcbiAgICAgIHRpdGxlOiBcIlBIUENCRiBWZXJzaW9uXCJcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogMlxuICAgICAgZW51bTogWzEsIDIsIDNdXG4gICAgc3RhbmRhcmQ6XG4gICAgICB0aXRsZTogXCJQSFBDQkYgU3RhbmRhcmRcIlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiUEVBUlwiLFxuICAgICAgZGVzY3JpcHRpb246IFwiU3RhbmRhcmQgbmFtZSBTcXVpeiwgUFNSMiwgUFNSMSwgUEhQQ1MsIFBFQVIsIFplbmQsIE15U291cmNlLi4uIG9yIHBhdGggdG8gQ1MgcnVsZXMuIFdpbGwgdXNlIGxvY2FsIGBwaHBjcy54bWxgLCBgcGhwY3MueG1sLmRpc3RgLCBgcGhwY3MucnVsZXNldC54bWxgIG9yIGBydWxlc2V0LnhtbGAgaWYgZm91bmQgaW4gdGhlIHByb2plY3Qgcm9vdC5cIlxuXG59XG4iXX0=
