Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/* global fetch */
/* global atom */

var _graphql = require('graphql');

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

var id = 1;
var addId = _underscore2['default'].debounce(function () {
  return id++;
}, 10 * 1000 /* 10 seconds */);
var getId = function getId() {
  addId();
  return id;
};

var buildClientFromIntrospection = function buildClientFromIntrospection(_ref) {
  var data = _ref.data;
  return (0, _graphql.buildClientSchema)(data);
};

var getConfig = function getConfig() {
  try {
    var projectPath = atom.project.getPaths()[0];
    var content = _fsPlus2['default'].readFileSync(projectPath + '/.graphqlrc').toString();
    return JSON.parse(content);
  } catch (error) {
    console.warn('Error reading graphql autocomplete config .graphqlrc', error);
    return {};
  }
};

var get = _asyncToGenerator(function* (_ref2) {
  var request = _ref2.request;

  var result = yield fetch(request.url, {
    method: 'post',
    headers: _extends({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }, request.headers),
    body: JSON.stringify({ query: _graphql.introspectionQuery }),
    credentials: 'include'
  });
  var introspection = yield result.json();
  return buildClientFromIntrospection(introspection);
});

var getFromFSPath = function getFromFSPath(filePath) {
  var projectPath = atom.project.getPaths()[0];
  var fqPath = _fsPlus2['default'].isAbsolute(filePath) ? filePath : _path2['default'].join(projectPath, filePath);

  if (!_fsPlus2['default'].existsSync(fqPath)) {
    console.warn('Error reading graphql introspection JSON from: ' + fqPath);
    return {};
  }

  try {
    var data = JSON.parse(_fsPlus2['default'].readFileSync(fqPath).toString());
    return buildClientFromIntrospection({ data: data });
  } catch (error) {
    console.warn('Error deserializing graphql introspection json from: ' + fqPath + ' ' + error.message);
    return {};
  }
};

var schema = null;
var lastId = null;

exports['default'] = _asyncToGenerator(function* () {
  var id = getId();
  var config = getConfig();
  if (config.file && config.file.path) return getFromFSPath(config.file.path);
  if (!config.request) return null;
  if (lastId === id && schema) return schema;
  lastId = id;
  try {
    schema = yield get(config);
    return schema;
  } catch (error) {
    throw new Error('Error GraphQL fetching schema', error.message);
  }
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2dyYXBocWwtYXV0b2NvbXBsZXRlL2xpYi9ncmFwaHFsL2dldFNjaGVtYS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O3VCQUlvRCxTQUFTOztzQkFDOUMsU0FBUzs7OzswQkFDVixZQUFZOzs7O29CQUNULE1BQU07Ozs7QUFQdkIsV0FBVyxDQUFBOztBQVNYLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUNWLElBQU0sS0FBSyxHQUFHLHdCQUFFLFFBQVEsQ0FBQztTQUFNLEVBQUUsRUFBRTtDQUFBLEVBQUUsRUFBRSxHQUFHLElBQUksa0JBQWtCLENBQUE7QUFDaEUsSUFBTSxLQUFLLEdBQUcsU0FBUixLQUFLLEdBQWM7QUFDdkIsT0FBSyxFQUFFLENBQUE7QUFDUCxTQUFPLEVBQUUsQ0FBQTtDQUNWLENBQUE7O0FBRUQsSUFBTSw0QkFBNEIsR0FBRyxTQUEvQiw0QkFBNEIsQ0FBSSxJQUFNO01BQUwsSUFBSSxHQUFMLElBQU0sQ0FBTCxJQUFJO1NBQU0sZ0NBQWtCLElBQUksQ0FBQztDQUFBLENBQUE7O0FBRXhFLElBQU0sU0FBUyxHQUFHLFNBQVosU0FBUyxHQUFjO0FBQzNCLE1BQUk7QUFDRixRQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzlDLFFBQU0sT0FBTyxHQUFHLG9CQUFHLFlBQVksQ0FBSSxXQUFXLGlCQUFjLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDdkUsV0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQzNCLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDZCxXQUFPLENBQUMsSUFBSSxDQUFDLHNEQUFzRCxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQzNFLFdBQU8sRUFBRSxDQUFBO0dBQ1Y7Q0FDRixDQUFBOztBQUVELElBQU0sR0FBRyxxQkFBRyxXQUFlLEtBQVMsRUFBRTtNQUFWLE9BQU8sR0FBUixLQUFTLENBQVIsT0FBTzs7QUFDakMsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUN0QyxVQUFNLEVBQUUsTUFBTTtBQUNkLFdBQU87QUFDTCxZQUFNLEVBQUUsa0JBQWtCO0FBQzFCLG9CQUFjLEVBQUUsa0JBQWtCO09BQy9CLE9BQU8sQ0FBQyxPQUFPLENBQ25CO0FBQ0QsUUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBQyxLQUFLLDZCQUFvQixFQUFDLENBQUM7QUFDakQsZUFBVyxFQUFFLFNBQVM7R0FDdkIsQ0FBQyxDQUFBO0FBQ0YsTUFBTSxhQUFhLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDekMsU0FBTyw0QkFBNEIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtDQUNuRCxDQUFBLENBQUE7O0FBRUQsSUFBTSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxDQUFHLFFBQVEsRUFBSTtBQUNoQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzlDLE1BQU0sTUFBTSxHQUFHLG9CQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxRQUFRLEdBQUcsa0JBQUssSUFBSSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQTs7QUFFcEYsTUFBSSxDQUFDLG9CQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMxQixXQUFPLENBQUMsSUFBSSxxREFBbUQsTUFBTSxDQUFHLENBQUE7QUFDeEUsV0FBTyxFQUFFLENBQUE7R0FDVjs7QUFFRCxNQUFJO0FBQ0YsUUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBRyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtBQUMzRCxXQUFPLDRCQUE0QixDQUFDLEVBQUMsSUFBSSxFQUFKLElBQUksRUFBQyxDQUFDLENBQUE7R0FDNUMsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUNkLFdBQU8sQ0FBQyxJQUFJLDJEQUF5RCxNQUFNLFNBQUksS0FBSyxDQUFDLE9BQU8sQ0FBRyxDQUFBO0FBQy9GLFdBQU8sRUFBRSxDQUFBO0dBQ1Y7Q0FDRixDQUFBOztBQUVELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQTtBQUNqQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUE7O3VDQUVGLGFBQWlCO0FBQzlCLE1BQU0sRUFBRSxHQUFHLEtBQUssRUFBRSxDQUFBO0FBQ2xCLE1BQU0sTUFBTSxHQUFHLFNBQVMsRUFBRSxDQUFBO0FBQzFCLE1BQUksTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzNFLE1BQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sSUFBSSxDQUFBO0FBQ2hDLE1BQUksTUFBTSxLQUFLLEVBQUUsSUFBSSxNQUFNLEVBQUUsT0FBTyxNQUFNLENBQUE7QUFDMUMsUUFBTSxHQUFHLEVBQUUsQ0FBQTtBQUNYLE1BQUk7QUFDRixVQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDMUIsV0FBTyxNQUFNLENBQUE7R0FDZCxDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsVUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7R0FDaEU7Q0FDRiIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9ncmFwaHFsLWF1dG9jb21wbGV0ZS9saWIvZ3JhcGhxbC9nZXRTY2hlbWEuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuLyogZ2xvYmFsIGZldGNoICovXG4vKiBnbG9iYWwgYXRvbSAqL1xuXG5pbXBvcnQge2J1aWxkQ2xpZW50U2NoZW1hLCBpbnRyb3NwZWN0aW9uUXVlcnl9IGZyb20gJ2dyYXBocWwnXG5pbXBvcnQgZnMgZnJvbSAnZnMtcGx1cydcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5sZXQgaWQgPSAxXG5jb25zdCBhZGRJZCA9IF8uZGVib3VuY2UoKCkgPT4gaWQrKywgMTAgKiAxMDAwIC8qIDEwIHNlY29uZHMgKi8pXG5jb25zdCBnZXRJZCA9IGZ1bmN0aW9uKCkge1xuICBhZGRJZCgpXG4gIHJldHVybiBpZFxufVxuXG5jb25zdCBidWlsZENsaWVudEZyb21JbnRyb3NwZWN0aW9uID0gKHtkYXRhfSkgPT4gYnVpbGRDbGllbnRTY2hlbWEoZGF0YSlcblxuY29uc3QgZ2V0Q29uZmlnID0gZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXVxuICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoYCR7cHJvamVjdFBhdGh9Ly5ncmFwaHFscmNgKS50b1N0cmluZygpXG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudClcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLndhcm4oJ0Vycm9yIHJlYWRpbmcgZ3JhcGhxbCBhdXRvY29tcGxldGUgY29uZmlnIC5ncmFwaHFscmMnLCBlcnJvcilcbiAgICByZXR1cm4ge31cbiAgfVxufVxuXG5jb25zdCBnZXQgPSBhc3luYyBmdW5jdGlvbih7cmVxdWVzdH0pIHtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZmV0Y2gocmVxdWVzdC51cmwsIHtcbiAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICBoZWFkZXJzOiB7XG4gICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAuLi5yZXF1ZXN0LmhlYWRlcnNcbiAgICB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtxdWVyeTogaW50cm9zcGVjdGlvblF1ZXJ5fSksXG4gICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJ1xuICB9KVxuICBjb25zdCBpbnRyb3NwZWN0aW9uID0gYXdhaXQgcmVzdWx0Lmpzb24oKVxuICByZXR1cm4gYnVpbGRDbGllbnRGcm9tSW50cm9zcGVjdGlvbihpbnRyb3NwZWN0aW9uKVxufVxuXG5jb25zdCBnZXRGcm9tRlNQYXRoID0gZmlsZVBhdGggPT4ge1xuICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gIGNvbnN0IGZxUGF0aCA9IGZzLmlzQWJzb2x1dGUoZmlsZVBhdGgpID8gZmlsZVBhdGggOiBwYXRoLmpvaW4ocHJvamVjdFBhdGgsIGZpbGVQYXRoKVxuXG4gIGlmICghZnMuZXhpc3RzU3luYyhmcVBhdGgpKSB7XG4gICAgY29uc29sZS53YXJuKGBFcnJvciByZWFkaW5nIGdyYXBocWwgaW50cm9zcGVjdGlvbiBKU09OIGZyb206ICR7ZnFQYXRofWApXG4gICAgcmV0dXJuIHt9XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhmcVBhdGgpLnRvU3RyaW5nKCkpXG4gICAgcmV0dXJuIGJ1aWxkQ2xpZW50RnJvbUludHJvc3BlY3Rpb24oe2RhdGF9KVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUud2FybihgRXJyb3IgZGVzZXJpYWxpemluZyBncmFwaHFsIGludHJvc3BlY3Rpb24ganNvbiBmcm9tOiAke2ZxUGF0aH0gJHtlcnJvci5tZXNzYWdlfWApXG4gICAgcmV0dXJuIHt9XG4gIH1cbn1cblxubGV0IHNjaGVtYSA9IG51bGxcbmxldCBsYXN0SWQgPSBudWxsXG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uKCkge1xuICBjb25zdCBpZCA9IGdldElkKClcbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKClcbiAgaWYgKGNvbmZpZy5maWxlICYmIGNvbmZpZy5maWxlLnBhdGgpIHJldHVybiBnZXRGcm9tRlNQYXRoKGNvbmZpZy5maWxlLnBhdGgpXG4gIGlmICghY29uZmlnLnJlcXVlc3QpIHJldHVybiBudWxsXG4gIGlmIChsYXN0SWQgPT09IGlkICYmIHNjaGVtYSkgcmV0dXJuIHNjaGVtYVxuICBsYXN0SWQgPSBpZFxuICB0cnkge1xuICAgIHNjaGVtYSA9IGF3YWl0IGdldChjb25maWcpXG4gICAgcmV0dXJuIHNjaGVtYVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcignRXJyb3IgR3JhcGhRTCBmZXRjaGluZyBzY2hlbWEnLCBlcnJvci5tZXNzYWdlKVxuICB9XG59XG4iXX0=