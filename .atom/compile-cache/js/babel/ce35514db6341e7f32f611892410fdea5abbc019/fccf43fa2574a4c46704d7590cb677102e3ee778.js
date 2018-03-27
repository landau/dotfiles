Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/* global atom */

var _graphqlGetSchema = require('../graphql/getSchema');

var _graphqlGetSchema2 = _interopRequireDefault(_graphqlGetSchema);

var _graphql = require('graphql');

var _graphqlGetQueriesInFile = require('../graphql/getQueriesInFile');

var _graphqlGetQueriesInFile2 = _interopRequireDefault(_graphqlGetQueriesInFile);

var _getRange = require('./getRange');

var _getRange2 = _interopRequireDefault(_getRange);

var _graphqlCleanQuery = require('../graphql/cleanQuery');

var _graphqlCleanQuery2 = _interopRequireDefault(_graphqlCleanQuery);

'use babel';
var Linter = (function () {
  function Linter() {
    _classCallCheck(this, Linter);

    this.name = 'GraphQL';
    this.grammarScopes = ['source.js.jsx', 'source.js', 'source.graphql'];
    this.scope = 'file';
    this.lintOnFly = true;
  }

  _createClass(Linter, [{
    key: 'getErrorsForContent',
    value: function getErrorsForContent(editor, schema, content, fileContent) {
      try {
        var cleanedQuery = (0, _graphqlCleanQuery2['default'])(content);
        var ast = (0, _graphql.parse)(cleanedQuery);
        var errors = schema ? (0, _graphql.validate)(schema, ast) : [];
        return errors.filter(function (error) {
          if (atom.config.get('graphql-autocomplete.disableErrors.fragmentIsNeverUsed') && /Fragment "[A-z]+" is never used\./g.test(error.message)) return false;
          if (atom.config.get('graphql-autocomplete.disableErrors.unknownFragment') && /Unknown fragment "[A-z]+"./g.test(error.message)) return false;
          return true;
        }).map(function (error) {
          var location = error.locations[0];
          var node = error.nodes[0];
          var range = (0, _getRange2['default'])({ content: content, fileContent: fileContent, location: location, node: node });
          return {
            type: 'Error',
            text: error.message,
            range: range,
            filePath: editor.getPath()
          };
        });
      } catch (error) {
        var _location = error.locations[0];
        var range = (0, _getRange2['default'])({ content: content, fileContent: fileContent, location: _location });
        return [{
          type: 'Error',
          text: error.message,
          range: range,
          filePath: editor.getPath()
        }];
      }
    }
  }, {
    key: 'lint',
    value: _asyncToGenerator(function* (editor) {
      try {
        var errors = [];
        var fileContent = editor.buffer.getText();
        var queries = (0, _graphqlGetQueriesInFile2['default'])(fileContent, editor);
        if (queries.length === 0) return [];
        var schema = yield (0, _graphqlGetSchema2['default'])();
        for (var query of queries) {
          var queryErrors = this.getErrorsForContent(editor, schema, query, fileContent);
          for (var error of queryErrors) {
            errors.push(error);
          }
        }
        return errors;
      } catch (error) {
        console.log('LinterError', error);
        return [];
      }
    })
  }]);

  return Linter;
})();

exports['default'] = Linter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2dyYXBocWwtYXV0b2NvbXBsZXRlL2xpYi9MaW50ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Z0NBR3NCLHNCQUFzQjs7Ozt1QkFDZCxTQUFTOzt1Q0FDViw2QkFBNkI7Ozs7d0JBQ3JDLFlBQVk7Ozs7aUNBQ1YsdUJBQXVCOzs7O0FBUDlDLFdBQVcsQ0FBQTtJQVNVLE1BQU07V0FBTixNQUFNOzBCQUFOLE1BQU07O1NBQ3pCLElBQUksR0FBRyxTQUFTO1NBQ2hCLGFBQWEsR0FBRyxDQUFDLGVBQWUsRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLENBQUM7U0FDaEUsS0FBSyxHQUFHLE1BQU07U0FDZCxTQUFTLEdBQUcsSUFBSTs7O2VBSkcsTUFBTTs7V0FNTiw2QkFBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUU7QUFDeEQsVUFBSTtBQUNGLFlBQU0sWUFBWSxHQUFHLG9DQUFXLE9BQU8sQ0FBQyxDQUFBO0FBQ3hDLFlBQU0sR0FBRyxHQUFHLG9CQUFNLFlBQVksQ0FBQyxDQUFBO0FBQy9CLFlBQU0sTUFBTSxHQUFHLE1BQU0sR0FBRyx1QkFBUyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBQ2xELGVBQU8sTUFBTSxDQUNWLE1BQU0sQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUNmLGNBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsd0RBQXdELENBQUMsSUFDekUsb0NBQW9DLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFFeEQsT0FBTyxLQUFLLENBQUE7QUFDZCxjQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9EQUFvRCxDQUFDLElBQ3JFLDZCQUE2QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBRWpELE9BQU8sS0FBSyxDQUFBO0FBQ2QsaUJBQU8sSUFBSSxDQUFBO1NBQ1osQ0FBQyxDQUNELEdBQUcsQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUNaLGNBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDbkMsY0FBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUMzQixjQUFNLEtBQUssR0FBRywyQkFBUyxFQUFDLE9BQU8sRUFBUCxPQUFPLEVBQUUsV0FBVyxFQUFYLFdBQVcsRUFBRSxRQUFRLEVBQVIsUUFBUSxFQUFFLElBQUksRUFBSixJQUFJLEVBQUMsQ0FBQyxDQUFBO0FBQzlELGlCQUFPO0FBQ0wsZ0JBQUksRUFBRSxPQUFPO0FBQ2IsZ0JBQUksRUFBRSxLQUFLLENBQUMsT0FBTztBQUNuQixpQkFBSyxFQUFMLEtBQUs7QUFDTCxvQkFBUSxFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUU7V0FDM0IsQ0FBQTtTQUNGLENBQUMsQ0FBQTtPQUNMLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDZCxZQUFNLFNBQVEsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ25DLFlBQU0sS0FBSyxHQUFHLDJCQUFTLEVBQUMsT0FBTyxFQUFQLE9BQU8sRUFBRSxXQUFXLEVBQVgsV0FBVyxFQUFFLFFBQVEsRUFBUixTQUFRLEVBQUMsQ0FBQyxDQUFBO0FBQ3hELGVBQU8sQ0FDTDtBQUNFLGNBQUksRUFBRSxPQUFPO0FBQ2IsY0FBSSxFQUFFLEtBQUssQ0FBQyxPQUFPO0FBQ25CLGVBQUssRUFBTCxLQUFLO0FBQ0wsa0JBQVEsRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFO1NBQzNCLENBQ0YsQ0FBQTtPQUNGO0tBQ0Y7Ozs2QkFFUyxXQUFDLE1BQU0sRUFBRTtBQUNqQixVQUFJO0FBQ0YsWUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFBO0FBQ2YsWUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUMzQyxZQUFNLE9BQU8sR0FBRywwQ0FBaUIsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBQ3JELFlBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUE7QUFDbkMsWUFBTSxNQUFNLEdBQUcsTUFBTSxvQ0FBVyxDQUFBO0FBQ2hDLGFBQUssSUFBTSxLQUFLLElBQUksT0FBTyxFQUFFO0FBQzNCLGNBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQTtBQUNoRixlQUFLLElBQU0sS0FBSyxJQUFJLFdBQVcsRUFBRTtBQUMvQixrQkFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtXQUNuQjtTQUNGO0FBQ0QsZUFBTyxNQUFNLENBQUE7T0FDZCxDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsZUFBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFDakMsZUFBTyxFQUFFLENBQUE7T0FDVjtLQUNGOzs7U0FwRWtCLE1BQU07OztxQkFBTixNQUFNIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2dyYXBocWwtYXV0b2NvbXBsZXRlL2xpYi9MaW50ZXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG4vKiBnbG9iYWwgYXRvbSAqL1xuaW1wb3J0IGdldFNjaGVtYSBmcm9tICcuLi9ncmFwaHFsL2dldFNjaGVtYSdcbmltcG9ydCB7cGFyc2UsIHZhbGlkYXRlfSBmcm9tICdncmFwaHFsJ1xuaW1wb3J0IGdldFF1ZXJpZXNJbkZpbGUgZnJvbSAnLi4vZ3JhcGhxbC9nZXRRdWVyaWVzSW5GaWxlJ1xuaW1wb3J0IGdldFJhbmdlIGZyb20gJy4vZ2V0UmFuZ2UnXG5pbXBvcnQgY2xlYW5RdWVyeSBmcm9tICcuLi9ncmFwaHFsL2NsZWFuUXVlcnknXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpbnRlciB7XG4gIG5hbWUgPSAnR3JhcGhRTCdcbiAgZ3JhbW1hclNjb3BlcyA9IFsnc291cmNlLmpzLmpzeCcsICdzb3VyY2UuanMnLCAnc291cmNlLmdyYXBocWwnXVxuICBzY29wZSA9ICdmaWxlJ1xuICBsaW50T25GbHkgPSB0cnVlXG5cbiAgZ2V0RXJyb3JzRm9yQ29udGVudChlZGl0b3IsIHNjaGVtYSwgY29udGVudCwgZmlsZUNvbnRlbnQpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgY2xlYW5lZFF1ZXJ5ID0gY2xlYW5RdWVyeShjb250ZW50KVxuICAgICAgY29uc3QgYXN0ID0gcGFyc2UoY2xlYW5lZFF1ZXJ5KVxuICAgICAgY29uc3QgZXJyb3JzID0gc2NoZW1hID8gdmFsaWRhdGUoc2NoZW1hLCBhc3QpIDogW11cbiAgICAgIHJldHVybiBlcnJvcnNcbiAgICAgICAgLmZpbHRlcihlcnJvciA9PiB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgYXRvbS5jb25maWcuZ2V0KCdncmFwaHFsLWF1dG9jb21wbGV0ZS5kaXNhYmxlRXJyb3JzLmZyYWdtZW50SXNOZXZlclVzZWQnKSAmJlxuICAgICAgICAgICAgL0ZyYWdtZW50IFwiW0Etel0rXCIgaXMgbmV2ZXIgdXNlZFxcLi9nLnRlc3QoZXJyb3IubWVzc2FnZSlcbiAgICAgICAgICApXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5nZXQoJ2dyYXBocWwtYXV0b2NvbXBsZXRlLmRpc2FibGVFcnJvcnMudW5rbm93bkZyYWdtZW50JykgJiZcbiAgICAgICAgICAgIC9Vbmtub3duIGZyYWdtZW50IFwiW0Etel0rXCIuL2cudGVzdChlcnJvci5tZXNzYWdlKVxuICAgICAgICAgIClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH0pXG4gICAgICAgIC5tYXAoZXJyb3IgPT4ge1xuICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gZXJyb3IubG9jYXRpb25zWzBdXG4gICAgICAgICAgY29uc3Qgbm9kZSA9IGVycm9yLm5vZGVzWzBdXG4gICAgICAgICAgY29uc3QgcmFuZ2UgPSBnZXRSYW5nZSh7Y29udGVudCwgZmlsZUNvbnRlbnQsIGxvY2F0aW9uLCBub2RlfSlcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgICAgIHRleHQ6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICByYW5nZSxcbiAgICAgICAgICAgIGZpbGVQYXRoOiBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBsb2NhdGlvbiA9IGVycm9yLmxvY2F0aW9uc1swXVxuICAgICAgY29uc3QgcmFuZ2UgPSBnZXRSYW5nZSh7Y29udGVudCwgZmlsZUNvbnRlbnQsIGxvY2F0aW9ufSlcbiAgICAgIHJldHVybiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICAgIHRleHQ6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgcmFuZ2UsXG4gICAgICAgICAgZmlsZVBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGxpbnQoZWRpdG9yKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBlcnJvcnMgPSBbXVxuICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSBlZGl0b3IuYnVmZmVyLmdldFRleHQoKVxuICAgICAgY29uc3QgcXVlcmllcyA9IGdldFF1ZXJpZXNJbkZpbGUoZmlsZUNvbnRlbnQsIGVkaXRvcilcbiAgICAgIGlmIChxdWVyaWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gICAgICBjb25zdCBzY2hlbWEgPSBhd2FpdCBnZXRTY2hlbWEoKVxuICAgICAgZm9yIChjb25zdCBxdWVyeSBvZiBxdWVyaWVzKSB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5RXJyb3JzID0gdGhpcy5nZXRFcnJvcnNGb3JDb250ZW50KGVkaXRvciwgc2NoZW1hLCBxdWVyeSwgZmlsZUNvbnRlbnQpXG4gICAgICAgIGZvciAoY29uc3QgZXJyb3Igb2YgcXVlcnlFcnJvcnMpIHtcbiAgICAgICAgICBlcnJvcnMucHVzaChlcnJvcilcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGVycm9yc1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmxvZygnTGludGVyRXJyb3InLCBlcnJvcilcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgfVxufVxuIl19