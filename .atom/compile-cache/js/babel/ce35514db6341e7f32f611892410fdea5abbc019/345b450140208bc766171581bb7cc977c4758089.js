function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-disable import/prefer-default-export */

var _userHome = require('user-home');

var _userHome2 = _interopRequireDefault(_userHome);

var _path = require('path');

/**
 * Check if a config is directly inside a user's home directory.
 * Such config files are used by ESLint as a fallback, only for situations
 * when there is no other config file between a file being linted and root.
 *
 * @param  {string}  configPath - The path of the config file being checked
 * @return {Boolean}              True if the file is directly in the current user's home
 */
'use babel';module.exports = function isConfigAtHomeRoot(configPath) {
  return (0, _path.dirname)(configPath) === _userHome2['default'];
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL2lzLWNvbmZpZy1hdC1ob21lLXJvb3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozt3QkFJcUIsV0FBVzs7OztvQkFDUixNQUFNOzs7Ozs7Ozs7O0FBTDlCLFdBQVcsQ0FBQSxBQWVYLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUU7QUFDdkQsU0FBUSxtQkFBUSxVQUFVLENBQUMsMEJBQWEsQ0FBQztDQUMxQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL2lzLWNvbmZpZy1hdC1ob21lLXJvb3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBpbXBvcnQvcHJlZmVyLWRlZmF1bHQtZXhwb3J0ICovXG5cbmltcG9ydCB1c2VySG9tZSBmcm9tICd1c2VyLWhvbWUnXG5pbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSAncGF0aCdcblxuLyoqXG4gKiBDaGVjayBpZiBhIGNvbmZpZyBpcyBkaXJlY3RseSBpbnNpZGUgYSB1c2VyJ3MgaG9tZSBkaXJlY3RvcnkuXG4gKiBTdWNoIGNvbmZpZyBmaWxlcyBhcmUgdXNlZCBieSBFU0xpbnQgYXMgYSBmYWxsYmFjaywgb25seSBmb3Igc2l0dWF0aW9uc1xuICogd2hlbiB0aGVyZSBpcyBubyBvdGhlciBjb25maWcgZmlsZSBiZXR3ZWVuIGEgZmlsZSBiZWluZyBsaW50ZWQgYW5kIHJvb3QuXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSAgY29uZmlnUGF0aCAtIFRoZSBwYXRoIG9mIHRoZSBjb25maWcgZmlsZSBiZWluZyBjaGVja2VkXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgICAgICAgVHJ1ZSBpZiB0aGUgZmlsZSBpcyBkaXJlY3RseSBpbiB0aGUgY3VycmVudCB1c2VyJ3MgaG9tZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ29uZmlnQXRIb21lUm9vdChjb25maWdQYXRoKSB7XG4gIHJldHVybiAoZGlybmFtZShjb25maWdQYXRoKSA9PT0gdXNlckhvbWUpXG59XG4iXX0=