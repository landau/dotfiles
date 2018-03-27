Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _linterHandlebarsProvider = require('./linter-handlebars-provider');

var _linterHandlebarsProvider2 = _interopRequireDefault(_linterHandlebarsProvider);

var _atomPackageDeps = require('atom-package-deps');

'use babel';

exports['default'] = {

  activate: function activate() {
    if (!atom.inSpecMode()) {
      (0, _atomPackageDeps.install)('linter-handlebars');
    }
  },

  provideLinter: function provideLinter() {
    return _linterHandlebarsProvider2['default'];
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1oYW5kbGViYXJzL2xpYi9pbml0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozt3Q0FFcUMsOEJBQThCOzs7OytCQUMzQyxtQkFBbUI7O0FBSDNDLFdBQVcsQ0FBQTs7cUJBS0k7O0FBRWIsVUFBUSxFQUFDLG9CQUFHO0FBQ1YsUUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtBQUN0QixvQ0FBUSxtQkFBbUIsQ0FBQyxDQUFBO0tBQzdCO0dBQ0Y7O0FBRUQsZUFBYSxFQUFFOztHQUE4QjtDQUM5QyIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9saW50ZXItaGFuZGxlYmFycy9saWIvaW5pdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBMaW50ZXJIYW5kbGViYXJzUHJvdmlkZXIgZnJvbSAnLi9saW50ZXItaGFuZGxlYmFycy1wcm92aWRlcidcbmltcG9ydCB7IGluc3RhbGwgfSBmcm9tICdhdG9tLXBhY2thZ2UtZGVwcydcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIGFjdGl2YXRlICgpIHtcbiAgICBpZiAoIWF0b20uaW5TcGVjTW9kZSgpKSB7XG4gICAgICBpbnN0YWxsKCdsaW50ZXItaGFuZGxlYmFycycpXG4gICAgfVxuICB9LFxuXG4gIHByb3ZpZGVMaW50ZXI6ICgpID0+IExpbnRlckhhbmRsZWJhcnNQcm92aWRlclxufVxuIl19