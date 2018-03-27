(function() {
  module.exports = {
    name: "Lua",
    namespace: "lua",

    /*
    Supported Grammars
     */
    grammars: ["Lua"],

    /*
    Supported extensions
     */
    extensions: ['lua', 'ttslua'],
    defaultBeautifier: "Lua beautifier",
    options: {
      end_of_line: {
        type: 'string',
        "default": "System Default",
        "enum": ["CRLF", "LF", "System Default"],
        description: "Override EOL from line-ending-selector"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL2x1YS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUVmLElBQUEsRUFBTSxLQUZTO0lBR2YsU0FBQSxFQUFXLEtBSEk7O0FBS2Y7OztJQUdBLFFBQUEsRUFBVSxDQUNSLEtBRFEsQ0FSSzs7QUFZZjs7O0lBR0EsVUFBQSxFQUFZLENBQ1YsS0FEVSxFQUVWLFFBRlUsQ0FmRztJQW9CZixpQkFBQSxFQUFtQixnQkFwQko7SUFzQmYsT0FBQSxFQUNFO01BQUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLGdCQURUO1FBRUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUSxJQUFSLEVBQWEsZ0JBQWIsQ0FGTjtRQUdBLFdBQUEsRUFBYSx3Q0FIYjtPQURGO0tBdkJhOztBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6IFwiTHVhXCJcbiAgbmFtZXNwYWNlOiBcImx1YVwiXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xuICAjIyNcbiAgZ3JhbW1hcnM6IFtcbiAgICBcIkx1YVwiXG4gIF1cblxuICAjIyNcbiAgU3VwcG9ydGVkIGV4dGVuc2lvbnNcbiAgIyMjXG4gIGV4dGVuc2lvbnM6IFtcbiAgICAnbHVhJ1xuICAgICd0dHNsdWEnXG4gIF1cblxuICBkZWZhdWx0QmVhdXRpZmllcjogXCJMdWEgYmVhdXRpZmllclwiXG5cbiAgb3B0aW9uczpcbiAgICBlbmRfb2ZfbGluZTpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIlN5c3RlbSBEZWZhdWx0XCJcbiAgICAgIGVudW06IFtcIkNSTEZcIixcIkxGXCIsXCJTeXN0ZW0gRGVmYXVsdFwiXVxuICAgICAgZGVzY3JpcHRpb246IFwiT3ZlcnJpZGUgRU9MIGZyb20gbGluZS1lbmRpbmctc2VsZWN0b3JcIlxufVxuIl19
