Object.defineProperty(exports, "__esModule", {
    value: true
});

var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _atom = require("atom");

// eslint-disable-line import/no-unresolved

var _pythonIndent = require("./python-indent");

var _pythonIndent2 = _interopRequireDefault(_pythonIndent);

"use babel";

exports["default"] = {
    config: {
        hangingIndentTabs: {
            type: "number",
            "default": 1,
            description: "Number of tabs used for _hanging_ indents",
            "enum": [1, 2]
        }
    },
    activate: function activate() {
        _this.pythonIndent = new _pythonIndent2["default"]();
        _this.subscriptions = new _atom.CompositeDisposable();
        _this.subscriptions.add(atom.commands.add("atom-text-editor", { "editor:newline": function editorNewline() {
                return _this.pythonIndent.properlyIndent();
            } }));
    }
};
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3B5dGhvbi1pbmRlbnQvbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBRW9DLE1BQU07Ozs7NEJBQ2pCLGlCQUFpQjs7OztBQUgxQyxXQUFXLENBQUM7O3FCQUtHO0FBQ1gsVUFBTSxFQUFFO0FBQ0oseUJBQWlCLEVBQUU7QUFDZixnQkFBSSxFQUFFLFFBQVE7QUFDZCx1QkFBUyxDQUFDO0FBQ1YsdUJBQVcsRUFBRSwyQ0FBMkM7QUFDeEQsb0JBQU0sQ0FDRixDQUFDLEVBQ0QsQ0FBQyxDQUNKO1NBQ0o7S0FDSjtBQUNELFlBQVEsRUFBRSxvQkFBTTtBQUNaLGNBQUssWUFBWSxHQUFHLCtCQUFrQixDQUFDO0FBQ3ZDLGNBQUssYUFBYSxHQUFHLCtCQUF5QixDQUFDO0FBQy9DLGNBQUssYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFDdkQsRUFBRSxnQkFBZ0IsRUFBRTt1QkFBTSxNQUFLLFlBQVksQ0FBQyxjQUFjLEVBQUU7YUFBQSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3hFO0NBQ0oiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcHl0aG9uLWluZGVudC9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCI7XG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tIFwiYXRvbVwiOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGltcG9ydC9uby11bnJlc29sdmVkXG5pbXBvcnQgUHl0aG9uSW5kZW50IGZyb20gXCIuL3B5dGhvbi1pbmRlbnRcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGNvbmZpZzoge1xuICAgICAgICBoYW5naW5nSW5kZW50VGFiczoge1xuICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgICAgIGRlZmF1bHQ6IDEsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJOdW1iZXIgb2YgdGFicyB1c2VkIGZvciBfaGFuZ2luZ18gaW5kZW50c1wiLFxuICAgICAgICAgICAgZW51bTogW1xuICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgMixcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICBhY3RpdmF0ZTogKCkgPT4ge1xuICAgICAgICB0aGlzLnB5dGhvbkluZGVudCA9IG5ldyBQeXRob25JbmRlbnQoKTtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcImF0b20tdGV4dC1lZGl0b3JcIixcbiAgICAgICAgICAgIHsgXCJlZGl0b3I6bmV3bGluZVwiOiAoKSA9PiB0aGlzLnB5dGhvbkluZGVudC5wcm9wZXJseUluZGVudCgpIH0pKTtcbiAgICB9LFxufTtcbiJdfQ==