Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = greet;

var _templateObject = _taggedTemplateLiteral(['\n      Hi Linter user! 👋\n\n      Linter has been upgraded to v2.\n\n      Packages compatible with v1 will keep working on v2 for a long time.\n      If you are a package author, I encourage you to upgrade your package to the Linter v2 API.\n\n      You can read [the announcement post on my blog](http://steelbrain.me/2017/03/13/linter-v2-released.html).\n    '], ['\n      Hi Linter user! 👋\n\n      Linter has been upgraded to v2.\n\n      Packages compatible with v1 will keep working on v2 for a long time.\n      If you are a package author, I encourage you to upgrade your package to the Linter v2 API.\n\n      You can read [the announcement post on my blog](http://steelbrain.me/2017/03/13/linter-v2-released.html).\n    ']);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var _coolTrim = require('cool-trim');

var _coolTrim2 = _interopRequireDefault(_coolTrim);

function greet() {
  return atom.notifications.addInfo('Welcome to Linter v2', {
    dismissable: true,
    description: (0, _coolTrim2['default'])(_templateObject)
  });
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvZ3JlZXRlci9ncmVldC12Mi13ZWxjb21lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztxQkFJd0IsS0FBSzs7Ozs7Ozs7d0JBRlIsV0FBVzs7OztBQUVqQixTQUFTLEtBQUssR0FBRztBQUM5QixTQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFO0FBQ3hELGVBQVcsRUFBRSxJQUFJO0FBQ2pCLGVBQVcsNkNBU1Y7R0FDRixDQUFDLENBQUE7Q0FDSCIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2dyZWV0ZXIvZ3JlZXQtdjItd2VsY29tZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBjb29sVHJpbSBmcm9tICdjb29sLXRyaW0nXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdyZWV0KCkge1xuICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ1dlbGNvbWUgdG8gTGludGVyIHYyJywge1xuICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgIGRlc2NyaXB0aW9uOiBjb29sVHJpbWBcbiAgICAgIEhpIExpbnRlciB1c2VyISDwn5GLXG5cbiAgICAgIExpbnRlciBoYXMgYmVlbiB1cGdyYWRlZCB0byB2Mi5cblxuICAgICAgUGFja2FnZXMgY29tcGF0aWJsZSB3aXRoIHYxIHdpbGwga2VlcCB3b3JraW5nIG9uIHYyIGZvciBhIGxvbmcgdGltZS5cbiAgICAgIElmIHlvdSBhcmUgYSBwYWNrYWdlIGF1dGhvciwgSSBlbmNvdXJhZ2UgeW91IHRvIHVwZ3JhZGUgeW91ciBwYWNrYWdlIHRvIHRoZSBMaW50ZXIgdjIgQVBJLlxuXG4gICAgICBZb3UgY2FuIHJlYWQgW3RoZSBhbm5vdW5jZW1lbnQgcG9zdCBvbiBteSBibG9nXShodHRwOi8vc3RlZWxicmFpbi5tZS8yMDE3LzAzLzEzL2xpbnRlci12Mi1yZWxlYXNlZC5odG1sKS5cbiAgICBgLFxuICB9KVxufVxuIl19