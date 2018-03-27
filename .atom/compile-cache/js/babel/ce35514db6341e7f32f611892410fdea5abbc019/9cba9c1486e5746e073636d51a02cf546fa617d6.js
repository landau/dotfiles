function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libWorkerHelpers = require('../lib/worker-helpers');

var Helpers = _interopRequireWildcard(_libWorkerHelpers);

var _common = require('./common');

var _path = require('path');

var Path = _interopRequireWildcard(_path);

'use babel';

describe('Worker Helpers', function () {
  describe('getESLintInstance && getESLintFromDirectory', function () {
    it('tries to find a local eslint', function () {
      var eslint = Helpers.getESLintInstance((0, _common.getFixturesPath)('local-eslint'), {});
      expect(eslint).toBe('located');
    });
    it('cries if local eslint is not found', function () {
      expect(function () {
        Helpers.getESLintInstance((0, _common.getFixturesPath)('files', {}));
      }).toThrow();
    });

    it('tries to find a global eslint if config is specified', function () {
      var globalPath = '';
      if (process.platform === 'win32') {
        globalPath = (0, _common.getFixturesPath)(Path.join('global-eslint', 'lib'));
      } else {
        globalPath = (0, _common.getFixturesPath)('global-eslint');
      }
      var eslint = Helpers.getESLintInstance((0, _common.getFixturesPath)('local-eslint'), {
        useGlobalEslint: true,
        globalNodePath: globalPath
      });
      expect(eslint).toBe('located');
    });
    it('cries if global eslint is not found', function () {
      expect(function () {
        Helpers.getESLintInstance((0, _common.getFixturesPath)('local-eslint'), {
          useGlobalEslint: true,
          globalNodePath: (0, _common.getFixturesPath)('files')
        });
      }).toThrow();
    });

    it('tries to find a local eslint with nested node_modules', function () {
      var fileDir = Path.join((0, _common.getFixturesPath)('local-eslint'), 'lib', 'foo.js');
      var eslint = Helpers.getESLintInstance(fileDir, {});
      expect(eslint).toBe('located');
    });
  });

  describe('getConfigPath', function () {
    it('finds .eslintrc', function () {
      var fileDir = (0, _common.getFixturesPath)(Path.join('configs', 'no-ext'));
      var expectedPath = Path.join(fileDir, '.eslintrc');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });
    it('finds .eslintrc.yaml', function () {
      var fileDir = (0, _common.getFixturesPath)(Path.join('configs', 'yaml'));
      var expectedPath = Path.join(fileDir, '.eslintrc.yaml');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });
    it('finds .eslintrc.yml', function () {
      var fileDir = (0, _common.getFixturesPath)(Path.join('configs', 'yml'));
      var expectedPath = Path.join(fileDir, '.eslintrc.yml');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });
    it('finds .eslintrc.js', function () {
      var fileDir = (0, _common.getFixturesPath)(Path.join('configs', 'js'));
      var expectedPath = Path.join(fileDir, '.eslintrc.js');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });
    it('finds .eslintrc.json', function () {
      var fileDir = (0, _common.getFixturesPath)(Path.join('configs', 'json'));
      var expectedPath = Path.join(fileDir, '.eslintrc.json');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });
  });

  describe('getRelativePath', function () {
    it('return path relative of ignore file if found', function () {
      var fixtureDir = (0, _common.getFixturesPath)('eslintignore');
      var fixtureFile = Path.join(fixtureDir, 'ignored.js');
      var relativePath = Helpers.getRelativePath(fixtureDir, fixtureFile, {});
      var expectedPath = Path.relative(Path.join(__dirname, '..'), fixtureFile);
      expect(relativePath).toBe(expectedPath);
    });
    it('does not return path relative to ignore file if config overrides it', function () {
      var fixtureDir = (0, _common.getFixturesPath)('eslintignore');
      var fixtureFile = Path.join(fixtureDir, 'ignored.js');
      var relativePath = Helpers.getRelativePath(fixtureDir, fixtureFile, { disableEslintIgnore: true });
      expect(relativePath).toBe('ignored.js');
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3BlYy93b3JrZXItaGVscGVycy1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O2dDQUV5Qix1QkFBdUI7O0lBQXBDLE9BQU87O3NCQUNhLFVBQVU7O29CQUNwQixNQUFNOztJQUFoQixJQUFJOztBQUpoQixXQUFXLENBQUE7O0FBTVgsUUFBUSxDQUFDLGdCQUFnQixFQUFFLFlBQU07QUFDL0IsVUFBUSxDQUFDLDZDQUE2QyxFQUFFLFlBQU07QUFDNUQsTUFBRSxDQUFDLDhCQUE4QixFQUFFLFlBQU07QUFDdkMsVUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLDZCQUFnQixjQUFjLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUM3RSxZQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0tBQy9CLENBQUMsQ0FBQTtBQUNGLE1BQUUsQ0FBQyxvQ0FBb0MsRUFBRSxZQUFNO0FBQzdDLFlBQU0sQ0FBQyxZQUFNO0FBQ1gsZUFBTyxDQUFDLGlCQUFpQixDQUFDLDZCQUFnQixPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtPQUN4RCxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDYixDQUFDLENBQUE7O0FBRUYsTUFBRSxDQUFDLHNEQUFzRCxFQUFFLFlBQU07QUFDL0QsVUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFBO0FBQ25CLFVBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLEVBQUU7QUFDaEMsa0JBQVUsR0FBRyw2QkFBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtPQUNoRSxNQUFNO0FBQ0wsa0JBQVUsR0FBRyw2QkFBZ0IsZUFBZSxDQUFDLENBQUE7T0FDOUM7QUFDRCxVQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsaUJBQWlCLENB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QkFBbUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ2pGLFlBQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7S0FDeEMsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3BlYy93b3JrZXItaGVscGVycy1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0ICogYXMgSGVscGVycyBmcm9tICcuLi9saWIvd29ya2VyLWhlbHBlcnMnXG5pbXBvcnQgeyBnZXRGaXh0dXJlc1BhdGggfSBmcm9tICcuL2NvbW1vbidcbmltcG9ydCAqIGFzIFBhdGggZnJvbSAncGF0aCdcblxuZGVzY3JpYmUoJ1dvcmtlciBIZWxwZXJzJywgKCkgPT4ge1xuICBkZXNjcmliZSgnZ2V0RVNMaW50SW5zdGFuY2UgJiYgZ2V0RVNMaW50RnJvbURpcmVjdG9yeScsICgpID0+IHtcbiAgICBpdCgndHJpZXMgdG8gZmluZCBhIGxvY2FsIGVzbGludCcsICgpID0+IHtcbiAgICAgIGNvbnN0IGVzbGludCA9IEhlbHBlcnMuZ2V0RVNMaW50SW5zdGFuY2UoZ2V0Rml4dHVyZXNQYXRoKCdsb2NhbC1lc2xpbnQnKSwge30pXG4gICAgICBleHBlY3QoZXNsaW50KS50b0JlKCdsb2NhdGVkJylcbiAgICB9KVxuICAgIGl0KCdjcmllcyBpZiBsb2NhbCBlc2xpbnQgaXMgbm90IGZvdW5kJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgSGVscGVycy5nZXRFU0xpbnRJbnN0YW5jZShnZXRGaXh0dXJlc1BhdGgoJ2ZpbGVzJywge30pKVxuICAgICAgfSkudG9UaHJvdygpXG4gICAgfSlcblxuICAgIGl0KCd0cmllcyB0byBmaW5kIGEgZ2xvYmFsIGVzbGludCBpZiBjb25maWcgaXMgc3BlY2lmaWVkJywgKCkgPT4ge1xuICAgICAgbGV0IGdsb2JhbFBhdGggPSAnJ1xuICAgICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcbiAgICAgICAgZ2xvYmFsUGF0aCA9IGdldEZpeHR1cmVzUGF0aChQYXRoLmpvaW4oJ2dsb2JhbC1lc2xpbnQnLCAnbGliJykpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnbG9iYWxQYXRoID0gZ2V0Rml4dHVyZXNQYXRoKCdnbG9iYWwtZXNsaW50JylcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVzbGludCA9IEhlbHBlcnMuZ2V0RVNMaW50SW5zdGFuY2UoZ2V0Rml4dHVyZXNQYXRoKCdsb2NhbC1lc2xpbnQnKSwge1xuICAgICAgICB1c2VHbG9iYWxFc2xpbnQ6IHRydWUsXG4gICAgICAgIGdsb2JhbE5vZGVQYXRoOiBnbG9iYWxQYXRoXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGVzbGludCkudG9CZSgnbG9jYXRlZCcpXG4gICAgfSlcbiAgICBpdCgnY3JpZXMgaWYgZ2xvYmFsIGVzbGludCBpcyBub3QgZm91bmQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICBIZWxwZXJzLmdldEVTTGludEluc3RhbmNlKGdldEZpeHR1cmVzUGF0aCgnbG9jYWwtZXNsaW50JyksIHtcbiAgICAgICAgICB1c2VHbG9iYWxFc2xpbnQ6IHRydWUsXG4gICAgICAgICAgZ2xvYmFsTm9kZVBhdGg6IGdldEZpeHR1cmVzUGF0aCgnZmlsZXMnKVxuICAgICAgICB9KVxuICAgICAgfSkudG9UaHJvdygpXG4gICAgfSlcblxuICAgIGl0KCd0cmllcyB0byBmaW5kIGEgbG9jYWwgZXNsaW50IHdpdGggbmVzdGVkIG5vZGVfbW9kdWxlcycsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVEaXIgPSBQYXRoLmpvaW4oZ2V0Rml4dHVyZXNQYXRoKCdsb2NhbC1lc2xpbnQnKSwgJ2xpYicsICdmb28uanMnKVxuICAgICAgY29uc3QgZXNsaW50ID0gSGVscGVycy5nZXRFU0xpbnRJbnN0YW5jZShmaWxlRGlyLCB7fSlcbiAgICAgIGV4cGVjdChlc2xpbnQpLnRvQmUoJ2xvY2F0ZWQnKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2dldENvbmZpZ1BhdGgnLCAoKSA9PiB7XG4gICAgaXQoJ2ZpbmRzIC5lc2xpbnRyYycsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVEaXIgPSBnZXRGaXh0dXJlc1BhdGgoUGF0aC5qb2luKCdjb25maWdzJywgJ25vLWV4dCcpKVxuICAgICAgY29uc3QgZXhwZWN0ZWRQYXRoID0gUGF0aC5qb2luKGZpbGVEaXIsICcuZXNsaW50cmMnKVxuICAgICAgZXhwZWN0KEhlbHBlcnMuZ2V0Q29uZmlnUGF0aChmaWxlRGlyKSkudG9CZShleHBlY3RlZFBhdGgpXG4gICAgfSlcbiAgICBpdCgnZmluZHMgLmVzbGludHJjLnlhbWwnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICd5YW1sJykpXG4gICAgICBjb25zdCBleHBlY3RlZFBhdGggPSBQYXRoLmpvaW4oZmlsZURpciwgJy5lc2xpbnRyYy55YW1sJylcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG4gICAgaXQoJ2ZpbmRzIC5lc2xpbnRyYy55bWwnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICd5bWwnKSlcbiAgICAgIGNvbnN0IGV4cGVjdGVkUGF0aCA9IFBhdGguam9pbihmaWxlRGlyLCAnLmVzbGludHJjLnltbCcpXG4gICAgICBleHBlY3QoSGVscGVycy5nZXRDb25maWdQYXRoKGZpbGVEaXIpKS50b0JlKGV4cGVjdGVkUGF0aClcbiAgICB9KVxuICAgIGl0KCdmaW5kcyAuZXNsaW50cmMuanMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICdqcycpKVxuICAgICAgY29uc3QgZXhwZWN0ZWRQYXRoID0gUGF0aC5qb2luKGZpbGVEaXIsICcuZXNsaW50cmMuanMnKVxuICAgICAgZXhwZWN0KEhlbHBlcnMuZ2V0Q29uZmlnUGF0aChmaWxlRGlyKSkudG9CZShleHBlY3RlZFBhdGgpXG4gICAgfSlcbiAgICBpdCgnZmluZHMgLmVzbGludHJjLmpzb24nLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICdqc29uJykpXG4gICAgICBjb25zdCBleHBlY3RlZFBhdGggPSBQYXRoLmpvaW4oZmlsZURpciwgJy5lc2xpbnRyYy5qc29uJylcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2dldFJlbGF0aXZlUGF0aCcsICgpID0+IHtcbiAgICBpdCgncmV0dXJuIHBhdGggcmVsYXRpdmUgb2YgaWdub3JlIGZpbGUgaWYgZm91bmQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaXh0dXJlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKCdlc2xpbnRpZ25vcmUnKVxuICAgICAgY29uc3QgZml4dHVyZUZpbGUgPSBQYXRoLmpvaW4oZml4dHVyZURpciwgJ2lnbm9yZWQuanMnKVxuICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gSGVscGVycy5nZXRSZWxhdGl2ZVBhdGgoZml4dHVyZURpciwgZml4dHVyZUZpbGUsIHt9KVxuICAgICAgY29uc3QgZXhwZWN0ZWRQYXRoID0gUGF0aC5yZWxhdGl2ZShQYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nKSwgZml4dHVyZUZpbGUpXG4gICAgICBleHBlY3QocmVsYXRpdmVQYXRoKS50b0JlKGV4cGVjdGVkUGF0aClcbiAgICB9KVxuICAgIGl0KCdkb2VzIG5vdCByZXR1cm4gcGF0aCByZWxhdGl2ZSB0byBpZ25vcmUgZmlsZSBpZiBjb25maWcgb3ZlcnJpZGVzIGl0JywgKCkgPT4ge1xuICAgICAgY29uc3QgZml4dHVyZURpciA9IGdldEZpeHR1cmVzUGF0aCgnZXNsaW50aWdub3JlJylcbiAgICAgIGNvbnN0IGZpeHR1cmVGaWxlID0gUGF0aC5qb2luKGZpeHR1cmVEaXIsICdpZ25vcmVkLmpzJylcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9XG4gICAgICAgIEhlbHBlcnMuZ2V0UmVsYXRpdmVQYXRoKGZpeHR1cmVEaXIsIGZpeHR1cmVGaWxlLCB7IGRpc2FibGVFc2xpbnRJZ25vcmU6IHRydWUgfSlcbiAgICAgIGV4cGVjdChyZWxhdGl2ZVBhdGgpLnRvQmUoJ2lnbm9yZWQuanMnKVxuICAgIH0pXG4gIH0pXG59KVxuIl19
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/linter-eslint/spec/worker-helpers-spec.js
