Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getLinter = getLinter;
exports.getMessage = getMessage;
exports.getMessageLegacy = getMessageLegacy;
exports.getFixturesPath = getFixturesPath;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _libHelpers = require('../lib/helpers');

function getLinter() {
  return {
    name: 'Some Linter',
    scope: 'project',
    lintsOnChange: false,
    grammarScopes: ['source.js'],
    lint: function lint() {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve([]);
        }, 50);
      });
    }
  };
}

function getMessage(filePathOrNormalized) {
  var message = { severity: 'error', excerpt: String(Math.random()), location: { file: __filename, position: [[0, 0], [0, 0]] } };
  if (typeof filePathOrNormalized === 'boolean' && filePathOrNormalized) {
    (0, _libHelpers.normalizeMessages)('Some Linter', [message]);
  } else if (typeof filePathOrNormalized === 'string') {
    message.location.file = filePathOrNormalized;
  }
  return message;
}

function getMessageLegacy() {
  var normalized = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

  var message = { type: 'Error', filePath: '/tmp/passwd', range: [[0, 1], [1, 0]], text: String(Math.random()) };
  if (normalized) {
    (0, _libHelpers.normalizeMessagesLegacy)('Some Linter', [message]);
  }
  return message;
}

function getFixturesPath(path) {
  return _path2['default'].join(__dirname, 'fixtures', path);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9zcGVjL2NvbW1vbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUVpQixNQUFNOzs7OzBCQUNvQyxnQkFBZ0I7O0FBRXBFLFNBQVMsU0FBUyxHQUFXO0FBQ2xDLFNBQU87QUFDTCxRQUFJLEVBQUUsYUFBYTtBQUNuQixTQUFLLEVBQUUsU0FBUztBQUNoQixpQkFBYSxFQUFFLEtBQUs7QUFDcEIsaUJBQWEsRUFBRSxDQUFDLFdBQVcsQ0FBQztBQUM1QixRQUFJLEVBQUEsZ0JBQUc7QUFDTCxhQUFPLElBQUksT0FBTyxDQUFDLFVBQVMsT0FBTyxFQUFFO0FBQ25DLGtCQUFVLENBQUMsWUFBVztBQUNwQixpQkFBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBQ1osRUFBRSxFQUFFLENBQUMsQ0FBQTtPQUNQLENBQUMsQ0FBQTtLQUNIO0dBQ0YsQ0FBQTtDQUNGOztBQUNNLFNBQVMsVUFBVSxDQUFDLG9CQUF5QyxFQUFVO0FBQzVFLE1BQU0sT0FBZSxHQUFHLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUE7QUFDekksTUFBSSxPQUFPLG9CQUFvQixLQUFLLFNBQVMsSUFBSSxvQkFBb0IsRUFBRTtBQUNyRSx1Q0FBa0IsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtHQUM1QyxNQUFNLElBQUksT0FBTyxvQkFBb0IsS0FBSyxRQUFRLEVBQUU7QUFDbkQsV0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsb0JBQW9CLENBQUE7R0FDN0M7QUFDRCxTQUFPLE9BQU8sQ0FBQTtDQUNmOztBQUNNLFNBQVMsZ0JBQWdCLEdBQXFDO01BQXBDLFVBQW1CLHlEQUFHLElBQUk7O0FBQ3pELE1BQU0sT0FBZSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFBO0FBQ3hILE1BQUksVUFBVSxFQUFFO0FBQ2QsNkNBQXdCLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7R0FDbEQ7QUFDRCxTQUFPLE9BQU8sQ0FBQTtDQUNmOztBQUNNLFNBQVMsZUFBZSxDQUFDLElBQVksRUFBVTtBQUNwRCxTQUFPLGtCQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFBO0NBQzlDIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9zcGVjL2NvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBQYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBub3JtYWxpemVNZXNzYWdlcywgbm9ybWFsaXplTWVzc2FnZXNMZWdhY3kgfSBmcm9tICcuLi9saWIvaGVscGVycydcblxuZXhwb3J0IGZ1bmN0aW9uIGdldExpbnRlcigpOiBPYmplY3Qge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdTb21lIExpbnRlcicsXG4gICAgc2NvcGU6ICdwcm9qZWN0JyxcbiAgICBsaW50c09uQ2hhbmdlOiBmYWxzZSxcbiAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5qcyddLFxuICAgIGxpbnQoKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJlc29sdmUoW10pXG4gICAgICAgIH0sIDUwKVxuICAgICAgfSlcbiAgICB9LFxuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0TWVzc2FnZShmaWxlUGF0aE9yTm9ybWFsaXplZDogPyhib29sZWFuIHwgc3RyaW5nKSk6IE9iamVjdCB7XG4gIGNvbnN0IG1lc3NhZ2U6IE9iamVjdCA9IHsgc2V2ZXJpdHk6ICdlcnJvcicsIGV4Y2VycHQ6IFN0cmluZyhNYXRoLnJhbmRvbSgpKSwgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFswLCAwXV0gfSB9XG4gIGlmICh0eXBlb2YgZmlsZVBhdGhPck5vcm1hbGl6ZWQgPT09ICdib29sZWFuJyAmJiBmaWxlUGF0aE9yTm9ybWFsaXplZCkge1xuICAgIG5vcm1hbGl6ZU1lc3NhZ2VzKCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgfSBlbHNlIGlmICh0eXBlb2YgZmlsZVBhdGhPck5vcm1hbGl6ZWQgPT09ICdzdHJpbmcnKSB7XG4gICAgbWVzc2FnZS5sb2NhdGlvbi5maWxlID0gZmlsZVBhdGhPck5vcm1hbGl6ZWRcbiAgfVxuICByZXR1cm4gbWVzc2FnZVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldE1lc3NhZ2VMZWdhY3kobm9ybWFsaXplZDogYm9vbGVhbiA9IHRydWUpOiBPYmplY3Qge1xuICBjb25zdCBtZXNzYWdlOiBPYmplY3QgPSB7IHR5cGU6ICdFcnJvcicsIGZpbGVQYXRoOiAnL3RtcC9wYXNzd2QnLCByYW5nZTogW1swLCAxXSwgWzEsIDBdXSwgdGV4dDogU3RyaW5nKE1hdGgucmFuZG9tKCkpIH1cbiAgaWYgKG5vcm1hbGl6ZWQpIHtcbiAgICBub3JtYWxpemVNZXNzYWdlc0xlZ2FjeSgnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gIH1cbiAgcmV0dXJuIG1lc3NhZ2Vcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaXh0dXJlc1BhdGgocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIFBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycsIHBhdGgpXG59XG4iXX0=