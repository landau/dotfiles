Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _getSnippets = require('./getSnippets');

var _getSnippets2 = _interopRequireDefault(_getSnippets);

var _graphqlIsType = require('../graphql/isType');

var _graphqlGetQueriesInFile = require('../graphql/getQueriesInFile');

var _graphqlGetQueriesInFile2 = _interopRequireDefault(_graphqlGetQueriesInFile);

var _graphqlGetSchema = require('../graphql/getSchema');

var _graphqlGetSchema2 = _interopRequireDefault(_graphqlGetSchema);

'use babel';

var Snippets = (function () {
  function Snippets() {
    _classCallCheck(this, Snippets);

    this.selector = '.source.js, .source.graphql';
    this.inclusionPriority = 100;
    this.suggestionPriority = 2;
  }

  _createClass(Snippets, [{
    key: 'getSuggestions',
    value: _asyncToGenerator(function* (_ref) {
      var editor = _ref.editor;
      var bufferPosition = _ref.bufferPosition;
      var scopeDescriptor = _ref.scopeDescriptor;
      var prefix = _ref.prefix;

      var fileContent = editor.buffer.getText();
      var lines = fileContent.split('\n');
      var lineText = lines[bufferPosition.row];
      var file = editor.buffer.file;

      if (!(0, _graphqlIsType.isJS)(fileContent, editor) && !(0, _graphqlIsType.isGQL)(fileContent, editor)) return [];

      try {
        var queries = (0, _graphqlGetQueriesInFile2['default'])(fileContent, editor);
        if (queries.length === 0) return [];
        var schema = yield (0, _graphqlGetSchema2['default'])();
        for (var query of queries) {
          var snippets = yield (0, _getSnippets2['default'])({
            schema: schema,
            query: query,
            file: file,
            lineText: lineText,
            editor: editor,
            bufferPosition: bufferPosition,
            scopeDescriptor: scopeDescriptor,
            prefix: prefix,
            fileContent: fileContent
          });
          if (snippets.length) {
            return snippets;
          }
        }
        return null;
      } catch (error) {
        console.log('Orionsoft snippets error', error);
      }
      return null;
    })
  }]);

  return Snippets;
})();

exports['default'] = Snippets;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2dyYXBocWwtYXV0b2NvbXBsZXRlL2xpYi9TbmlwcGV0cy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7MkJBQ3dCLGVBQWU7Ozs7NkJBQ2IsbUJBQW1COzt1Q0FDaEIsNkJBQTZCOzs7O2dDQUNwQyxzQkFBc0I7Ozs7QUFKNUMsV0FBVyxDQUFBOztJQU1VLFFBQVE7V0FBUixRQUFROzBCQUFSLFFBQVE7O1NBQzNCLFFBQVEsR0FBRyw2QkFBNkI7U0FDeEMsaUJBQWlCLEdBQUcsR0FBRztTQUN2QixrQkFBa0IsR0FBRyxDQUFDOzs7ZUFISCxRQUFROzs2QkFLUCxXQUFDLElBQWlELEVBQUU7VUFBbEQsTUFBTSxHQUFQLElBQWlELENBQWhELE1BQU07VUFBRSxjQUFjLEdBQXZCLElBQWlELENBQXhDLGNBQWM7VUFBRSxlQUFlLEdBQXhDLElBQWlELENBQXhCLGVBQWU7VUFBRSxNQUFNLEdBQWhELElBQWlELENBQVAsTUFBTTs7QUFDbkUsVUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUMzQyxVQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3JDLFVBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDMUMsVUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUE7O0FBRS9CLFVBQUksQ0FBQyx5QkFBSyxXQUFXLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQywwQkFBTSxXQUFXLEVBQUUsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUE7O0FBRXhFLFVBQUk7QUFDRixZQUFNLE9BQU8sR0FBRywwQ0FBaUIsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBQ3JELFlBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUE7QUFDbkMsWUFBTSxNQUFNLEdBQUcsTUFBTSxvQ0FBVyxDQUFBO0FBQ2hDLGFBQUssSUFBTSxLQUFLLElBQUksT0FBTyxFQUFFO0FBQzNCLGNBQU0sUUFBUSxHQUFHLE1BQU0sOEJBQVk7QUFDakMsa0JBQU0sRUFBTixNQUFNO0FBQ04saUJBQUssRUFBTCxLQUFLO0FBQ0wsZ0JBQUksRUFBSixJQUFJO0FBQ0osb0JBQVEsRUFBUixRQUFRO0FBQ1Isa0JBQU0sRUFBTixNQUFNO0FBQ04sMEJBQWMsRUFBZCxjQUFjO0FBQ2QsMkJBQWUsRUFBZixlQUFlO0FBQ2Ysa0JBQU0sRUFBTixNQUFNO0FBQ04sdUJBQVcsRUFBWCxXQUFXO1dBQ1osQ0FBQyxDQUFBO0FBQ0YsY0FBSSxRQUFRLENBQUMsTUFBTSxFQUFFO0FBQ25CLG1CQUFPLFFBQVEsQ0FBQTtXQUNoQjtTQUNGO0FBQ0QsZUFBTyxJQUFJLENBQUE7T0FDWixDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsZUFBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxLQUFLLENBQUMsQ0FBQTtPQUMvQztBQUNELGFBQU8sSUFBSSxDQUFBO0tBQ1o7OztTQXRDa0IsUUFBUTs7O3FCQUFSLFFBQVEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvZ3JhcGhxbC1hdXRvY29tcGxldGUvbGliL1NuaXBwZXRzL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbmltcG9ydCBnZXRTbmlwcGV0cyBmcm9tICcuL2dldFNuaXBwZXRzJ1xuaW1wb3J0IHtpc0pTLCBpc0dRTH0gZnJvbSAnLi4vZ3JhcGhxbC9pc1R5cGUnXG5pbXBvcnQgZ2V0UXVlcmllc0luRmlsZSBmcm9tICcuLi9ncmFwaHFsL2dldFF1ZXJpZXNJbkZpbGUnXG5pbXBvcnQgZ2V0U2NoZW1hIGZyb20gJy4uL2dyYXBocWwvZ2V0U2NoZW1hJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTbmlwcGV0cyB7XG4gIHNlbGVjdG9yID0gJy5zb3VyY2UuanMsIC5zb3VyY2UuZ3JhcGhxbCdcbiAgaW5jbHVzaW9uUHJpb3JpdHkgPSAxMDBcbiAgc3VnZ2VzdGlvblByaW9yaXR5ID0gMlxuXG4gIGFzeW5jIGdldFN1Z2dlc3Rpb25zKHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBzY29wZURlc2NyaXB0b3IsIHByZWZpeH0pIHtcbiAgICBjb25zdCBmaWxlQ29udGVudCA9IGVkaXRvci5idWZmZXIuZ2V0VGV4dCgpXG4gICAgY29uc3QgbGluZXMgPSBmaWxlQ29udGVudC5zcGxpdCgnXFxuJylcbiAgICBjb25zdCBsaW5lVGV4dCA9IGxpbmVzW2J1ZmZlclBvc2l0aW9uLnJvd11cbiAgICBjb25zdCBmaWxlID0gZWRpdG9yLmJ1ZmZlci5maWxlXG5cbiAgICBpZiAoIWlzSlMoZmlsZUNvbnRlbnQsIGVkaXRvcikgJiYgIWlzR1FMKGZpbGVDb250ZW50LCBlZGl0b3IpKSByZXR1cm4gW11cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBxdWVyaWVzID0gZ2V0UXVlcmllc0luRmlsZShmaWxlQ29udGVudCwgZWRpdG9yKVxuICAgICAgaWYgKHF1ZXJpZXMubGVuZ3RoID09PSAwKSByZXR1cm4gW11cbiAgICAgIGNvbnN0IHNjaGVtYSA9IGF3YWl0IGdldFNjaGVtYSgpXG4gICAgICBmb3IgKGNvbnN0IHF1ZXJ5IG9mIHF1ZXJpZXMpIHtcbiAgICAgICAgY29uc3Qgc25pcHBldHMgPSBhd2FpdCBnZXRTbmlwcGV0cyh7XG4gICAgICAgICAgc2NoZW1hLFxuICAgICAgICAgIHF1ZXJ5LFxuICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgbGluZVRleHQsXG4gICAgICAgICAgZWRpdG9yLFxuICAgICAgICAgIGJ1ZmZlclBvc2l0aW9uLFxuICAgICAgICAgIHNjb3BlRGVzY3JpcHRvcixcbiAgICAgICAgICBwcmVmaXgsXG4gICAgICAgICAgZmlsZUNvbnRlbnRcbiAgICAgICAgfSlcbiAgICAgICAgaWYgKHNuaXBwZXRzLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiBzbmlwcGV0c1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmxvZygnT3Jpb25zb2Z0IHNuaXBwZXRzIGVycm9yJywgZXJyb3IpXG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH1cbn1cbiJdfQ==