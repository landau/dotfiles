(function() {
  module.exports = {
    name: "SQL",
    namespace: "sql",
    scope: ['source.sql'],

    /*
    Supported Grammars
     */
    grammars: ["SQL (Rails)", "SQL"],

    /*
    Supported extensions
     */
    extensions: ["sql"],
    options: {
      indent_size: {
        type: 'integer',
        "default": null,
        minimum: 0,
        description: "Indentation size/length"
      },
      keywords: {
        type: 'string',
        "default": "upper",
        description: "Change case of keywords",
        "enum": ["unchanged", "lower", "upper", "capitalize"]
      },
      identifiers: {
        type: 'string',
        "default": "unchanged",
        description: "Change case of identifiers",
        "enum": ["unchanged", "lower", "upper", "capitalize"]
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL3NxbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUVmLElBQUEsRUFBTSxLQUZTO0lBR2YsU0FBQSxFQUFXLEtBSEk7SUFJZixLQUFBLEVBQU8sQ0FBQyxZQUFELENBSlE7O0FBTWY7OztJQUdBLFFBQUEsRUFBVSxDQUNSLGFBRFEsRUFFUixLQUZRLENBVEs7O0FBY2Y7OztJQUdBLFVBQUEsRUFBWSxDQUNWLEtBRFUsQ0FqQkc7SUFxQmYsT0FBQSxFQUVFO01BQUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxPQUFBLEVBQVMsQ0FGVDtRQUdBLFdBQUEsRUFBYSx5QkFIYjtPQURGO01BS0EsUUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE9BRFQ7UUFFQSxXQUFBLEVBQWEseUJBRmI7UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsV0FBRCxFQUFhLE9BQWIsRUFBcUIsT0FBckIsRUFBNkIsWUFBN0IsQ0FITjtPQU5GO01BVUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFdBRFQ7UUFFQSxXQUFBLEVBQWEsNEJBRmI7UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsV0FBRCxFQUFhLE9BQWIsRUFBcUIsT0FBckIsRUFBNkIsWUFBN0IsQ0FITjtPQVhGO0tBdkJhOztBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6IFwiU1FMXCJcbiAgbmFtZXNwYWNlOiBcInNxbFwiXG4gIHNjb3BlOiBbJ3NvdXJjZS5zcWwnXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgR3JhbW1hcnNcbiAgIyMjXG4gIGdyYW1tYXJzOiBbXG4gICAgXCJTUUwgKFJhaWxzKVwiXG4gICAgXCJTUUxcIlxuICBdXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXG4gICMjI1xuICBleHRlbnNpb25zOiBbXG4gICAgXCJzcWxcIlxuICBdXG5cbiAgb3B0aW9uczpcbiAgICAjIFNRTFxuICAgIGluZGVudF9zaXplOlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnRhdGlvbiBzaXplL2xlbmd0aFwiXG4gICAga2V5d29yZHM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJ1cHBlclwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJDaGFuZ2UgY2FzZSBvZiBrZXl3b3Jkc1wiXG4gICAgICBlbnVtOiBbXCJ1bmNoYW5nZWRcIixcImxvd2VyXCIsXCJ1cHBlclwiLFwiY2FwaXRhbGl6ZVwiXVxuICAgIGlkZW50aWZpZXJzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwidW5jaGFuZ2VkXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkNoYW5nZSBjYXNlIG9mIGlkZW50aWZpZXJzXCJcbiAgICAgIGVudW06IFtcInVuY2hhbmdlZFwiLFwibG93ZXJcIixcInVwcGVyXCIsXCJjYXBpdGFsaXplXCJdXG5cbn1cbiJdfQ==
