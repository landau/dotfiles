function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _testHelper = require('./test-helper');

var _libLinterHandlebarsProvider = require('../lib/linter-handlebars-provider');

var _libLinterHandlebarsProvider2 = _interopRequireDefault(_libLinterHandlebarsProvider);

'use babel';

describe('Lint handlebars', function () {
  beforeEach(function () {
    (0, _testHelper.resetConfig)();
    atom.workspace.destroyActivePaneItem();
    return waitsForPromise(function () {
      return atom.packages.activatePackage('linter-handlebars');
    });
  });

  describe('checks a file with a missing open block', function () {
    it('retuns one error', function () {
      waitsForPromise(function () {
        return atom.workspace.open(_path2['default'].join(__dirname, 'files', 'error-missing-open.hbs')).then(function (editor) {
          return _libLinterHandlebarsProvider2['default'].lint(editor);
        }).then(function (messages) {
          expect(messages.length).toEqual(1);
          expect(messages[0].text).toEqual("Expecting 'EOF', got 'OPEN_ENDBLOCK'");
          expect(messages[0].range).toEqual([[2, 0], [2, 7]]);
        });
      });
    });

    it('retuns one error (CRFL)', function () {
      waitsForPromise(function () {
        return atom.workspace.open(_path2['default'].join(__dirname, 'files', 'error-missing-open-crfl.hbs')).then(function (editor) {
          return _libLinterHandlebarsProvider2['default'].lint(editor);
        }).then(function (messages) {
          expect(messages.length).toEqual(1);
          expect(messages[0].text).toEqual("Expecting 'EOF', got 'OPEN_ENDBLOCK'");
          expect(messages[0].range).toEqual([[2, 0], [2, 7]]);
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1oYW5kbGViYXJzL3NwZWMvbGludGVyLWhhbmRsZWJhcnMtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztvQkFFaUIsTUFBTTs7OzswQkFDSyxlQUFlOzsyQ0FDTixtQ0FBbUM7Ozs7QUFKeEUsV0FBVyxDQUFBOztBQU1YLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxZQUFNO0FBQ2hDLFlBQVUsQ0FBQyxZQUFNO0FBQ2Ysa0NBQWEsQ0FBQTtBQUNiLFFBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQTtBQUN0QyxXQUFPLGVBQWUsQ0FBQyxZQUFNO0FBQzNCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtLQUMxRCxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7O0FBRUYsVUFBUSxDQUFDLHlDQUF5QyxFQUFFLFlBQU07QUFDeEQsTUFBRSxDQUFDLGtCQUFrQixFQUFFLFlBQU07QUFDM0IscUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGVBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUNoRixJQUFJLENBQUMsVUFBQyxNQUFNO2lCQUFLLHlDQUF5QixJQUFJLENBQUMsTUFBTSxDQUFDO1NBQUEsQ0FBQyxDQUN2RCxJQUFJLENBQUMsVUFBQyxRQUFRLEVBQUs7QUFDbEIsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2xDLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFBO0FBQ3hFLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUNwRCxDQUFDLENBQUE7T0FDTCxDQUFDLENBQUE7S0FDSCxDQUFDLENBQUE7O0FBRUYsTUFBRSxDQUFDLHlCQUF5QixFQUFFLFlBQU07QUFDbEMscUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGVBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsNkJBQTZCLENBQUMsQ0FBQyxDQUNyRixJQUFJLENBQUMsVUFBQyxNQUFNO2lCQUFLLHlDQUF5QixJQUFJLENBQUMsTUFBTSxDQUFDO1NBQUEsQ0FBQyxDQUN2RCxJQUFJLENBQUMsVUFBQyxRQUFRLEVBQUs7QUFDbEIsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2xDLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFBO0FBQ3hFLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUNwRCxDQUFDLENBQUE7T0FDTCxDQUFDLENBQUE7S0FDSCxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyLWhhbmRsZWJhcnMvc3BlYy9saW50ZXItaGFuZGxlYmFycy1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IHJlc2V0Q29uZmlnIH0gZnJvbSAnLi90ZXN0LWhlbHBlcidcbmltcG9ydCBMaW50ZXJIYW5kbGViYXJzUHJvdmlkZXIgZnJvbSAnLi4vbGliL2xpbnRlci1oYW5kbGViYXJzLXByb3ZpZGVyJ1xuXG5kZXNjcmliZSgnTGludCBoYW5kbGViYXJzJywgKCkgPT4ge1xuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICByZXNldENvbmZpZygpXG4gICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmVJdGVtKClcbiAgICByZXR1cm4gd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGludGVyLWhhbmRsZWJhcnMnKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2NoZWNrcyBhIGZpbGUgd2l0aCBhIG1pc3Npbmcgb3BlbiBibG9jaycsICgpID0+IHtcbiAgICBpdCgncmV0dW5zIG9uZSBlcnJvcicsICgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGguam9pbihfX2Rpcm5hbWUsICdmaWxlcycsICdlcnJvci1taXNzaW5nLW9wZW4uaGJzJykpXG4gICAgICAgICAgLnRoZW4oKGVkaXRvcikgPT4gTGludGVySGFuZGxlYmFyc1Byb3ZpZGVyLmxpbnQoZWRpdG9yKSlcbiAgICAgICAgICAudGhlbigobWVzc2FnZXMpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS50ZXh0KS50b0VxdWFsKFwiRXhwZWN0aW5nICdFT0YnLCBnb3QgJ09QRU5fRU5EQkxPQ0snXCIpXG4gICAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0ucmFuZ2UpLnRvRXF1YWwoW1syLCAwXSwgWzIsIDddXSlcbiAgICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3JldHVucyBvbmUgZXJyb3IgKENSRkwpJywgKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpbGVzJywgJ2Vycm9yLW1pc3Npbmctb3Blbi1jcmZsLmhicycpKVxuICAgICAgICAgIC50aGVuKChlZGl0b3IpID0+IExpbnRlckhhbmRsZWJhcnNQcm92aWRlci5saW50KGVkaXRvcikpXG4gICAgICAgICAgLnRoZW4oKG1lc3NhZ2VzKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0udGV4dCkudG9FcXVhbChcIkV4cGVjdGluZyAnRU9GJywgZ290ICdPUEVOX0VOREJMT0NLJ1wiKVxuICAgICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnJhbmdlKS50b0VxdWFsKFtbMiwgMF0sIFsyLCA3XV0pXG4gICAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=