var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _path = require('path');

var Path = _interopRequireWildcard(_path);

var _srcWorkerHelpers = require('../src/worker-helpers');

var Helpers = _interopRequireWildcard(_srcWorkerHelpers);

'use babel';

var getFixturesPath = function getFixturesPath(path) {
  return Path.join(__dirname, 'fixtures', path);
};

var globalNodePath = process.platform === 'win32' ? Path.join(getFixturesPath('global-eslint'), 'lib') : getFixturesPath('global-eslint');

describe('Worker Helpers', function () {
  describe('findESLintDirectory', function () {
    it('returns an object with path and type keys', function () {
      var modulesDir = Path.join(getFixturesPath('local-eslint'), 'node_modules');
      var foundEslint = Helpers.findESLintDirectory(modulesDir, {});
      expect(typeof foundEslint === 'object').toBe(true);
      expect(foundEslint.path).toBeDefined();
      expect(foundEslint.type).toBeDefined();
    });

    it('finds a local eslint when useGlobalEslint is false', function () {
      var modulesDir = Path.join(getFixturesPath('local-eslint'), 'node_modules');
      var foundEslint = Helpers.findESLintDirectory(modulesDir, { useGlobalEslint: false });
      var expectedEslintPath = Path.join(getFixturesPath('local-eslint'), 'node_modules', 'eslint');
      expect(foundEslint.path).toEqual(expectedEslintPath);
      expect(foundEslint.type).toEqual('local project');
    });

    it('does not find a local eslint when useGlobalEslint is true', function () {
      var modulesDir = Path.join(getFixturesPath('local-eslint'), 'node_modules');
      var config = { useGlobalEslint: true, globalNodePath: globalNodePath };
      var foundEslint = Helpers.findESLintDirectory(modulesDir, config);
      var expectedEslintPath = Path.join(getFixturesPath('local-eslint'), 'node_modules', 'eslint');
      expect(foundEslint.path).not.toEqual(expectedEslintPath);
      expect(foundEslint.type).not.toEqual('local project');
    });

    it('finds a global eslint when useGlobalEslint is true and a valid globalNodePath is provided', function () {
      var modulesDir = Path.join(getFixturesPath('local-eslint'), 'node_modules');
      var config = { useGlobalEslint: true, globalNodePath: globalNodePath };
      var foundEslint = Helpers.findESLintDirectory(modulesDir, config);
      var expectedEslintPath = process.platform === 'win32' ? Path.join(globalNodePath, 'node_modules', 'eslint') : Path.join(globalNodePath, 'lib', 'node_modules', 'eslint');
      expect(foundEslint.path).toEqual(expectedEslintPath);
      expect(foundEslint.type).toEqual('global');
    });

    it('falls back to the packaged eslint when no local eslint is found', function () {
      var modulesDir = 'not/a/real/path';
      var config = { useGlobalEslint: false };
      var foundEslint = Helpers.findESLintDirectory(modulesDir, config);
      var expectedBundledPath = Path.join(__dirname, '..', 'node_modules', 'eslint');
      expect(foundEslint.path).toEqual(expectedBundledPath);
      expect(foundEslint.type).toEqual('bundled fallback');
    });
  });

  describe('getESLintInstance && getESLintFromDirectory', function () {
    it('tries to find an indirect local eslint using an absolute path', function () {
      var path = Path.join(getFixturesPath('indirect-local-eslint'), 'testing', 'eslint', 'node_modules');
      var eslint = Helpers.getESLintInstance('', {
        useGlobalEslint: false,
        advancedLocalNodeModules: path
      });
      expect(eslint).toBe('located');
    });

    it('tries to find an indirect local eslint using a relative path', function () {
      var path = Path.join(getFixturesPath('indirect-local-eslint'), 'testing', 'eslint', 'node_modules');

      var _atom$project$relativizePath = atom.project.relativizePath(path);

      var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 2);

      var projectPath = _atom$project$relativizePath2[0];
      var relativePath = _atom$project$relativizePath2[1];

      var eslint = Helpers.getESLintInstance('', {
        useGlobalEslint: false,
        advancedLocalNodeModules: relativePath
      }, projectPath);

      expect(eslint).toBe('located');
    });

    it('tries to find a local eslint', function () {
      var eslint = Helpers.getESLintInstance(getFixturesPath('local-eslint'), {});
      expect(eslint).toBe('located');
    });

    it('cries if local eslint is not found', function () {
      expect(function () {
        Helpers.getESLintInstance(getFixturesPath('files', {}));
      }).toThrow();
    });

    it('tries to find a global eslint if config is specified', function () {
      var eslint = Helpers.getESLintInstance(getFixturesPath('local-eslint'), {
        useGlobalEslint: true,
        globalNodePath: globalNodePath
      });
      expect(eslint).toBe('located');
    });

    it('cries if global eslint is not found', function () {
      expect(function () {
        Helpers.getESLintInstance(getFixturesPath('local-eslint'), {
          useGlobalEslint: true,
          globalNodePath: getFixturesPath('files')
        });
      }).toThrow();
    });

    it('tries to find a local eslint with nested node_modules', function () {
      var fileDir = Path.join(getFixturesPath('local-eslint'), 'lib', 'foo.js');
      var eslint = Helpers.getESLintInstance(fileDir, {});
      expect(eslint).toBe('located');
    });
  });

  describe('getConfigPath', function () {
    it('finds .eslintrc', function () {
      var fileDir = getFixturesPath(Path.join('configs', 'no-ext'));
      var expectedPath = Path.join(fileDir, '.eslintrc');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });

    it('finds .eslintrc.yaml', function () {
      var fileDir = getFixturesPath(Path.join('configs', 'yaml'));
      var expectedPath = Path.join(fileDir, '.eslintrc.yaml');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });

    it('finds .eslintrc.yml', function () {
      var fileDir = getFixturesPath(Path.join('configs', 'yml'));
      var expectedPath = Path.join(fileDir, '.eslintrc.yml');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });

    it('finds .eslintrc.js', function () {
      var fileDir = getFixturesPath(Path.join('configs', 'js'));
      var expectedPath = Path.join(fileDir, '.eslintrc.js');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });

    it('finds .eslintrc.json', function () {
      var fileDir = getFixturesPath(Path.join('configs', 'json'));
      var expectedPath = Path.join(fileDir, '.eslintrc.json');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });

    it('finds package.json with an eslintConfig property', function () {
      var fileDir = getFixturesPath(Path.join('configs', 'package-json'));
      var expectedPath = Path.join(fileDir, 'package.json');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });

    it('ignores package.json with no eslintConfig property', function () {
      var fileDir = getFixturesPath(Path.join('configs', 'package-json', 'nested'));
      var expectedPath = getFixturesPath(Path.join('configs', 'package-json', 'package.json'));
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });
  });

  describe('getRelativePath', function () {
    it('return path relative of ignore file if found', function () {
      var fixtureDir = getFixturesPath('eslintignore');
      var fixtureFile = Path.join(fixtureDir, 'ignored.js');
      var relativePath = Helpers.getRelativePath(fixtureDir, fixtureFile, {});
      var expectedPath = Path.relative(Path.join(__dirname, '..'), fixtureFile);
      expect(relativePath).toBe(expectedPath);
    });

    it('does not return path relative to ignore file if config overrides it', function () {
      var fixtureDir = getFixturesPath('eslintignore');
      var fixtureFile = Path.join(fixtureDir, 'ignored.js');
      var relativePath = Helpers.getRelativePath(fixtureDir, fixtureFile, { disableEslintIgnore: true });
      expect(relativePath).toBe('ignored.js');
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3BlYy93b3JrZXItaGVscGVycy1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBRXNCLE1BQU07O0lBQWhCLElBQUk7O2dDQUNTLHVCQUF1Qjs7SUFBcEMsT0FBTzs7QUFIbkIsV0FBVyxDQUFBOztBQUtYLElBQU0sZUFBZSxHQUFHLFNBQWxCLGVBQWUsQ0FBRyxJQUFJO1NBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQztDQUFBLENBQUE7O0FBR3RFLElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEtBQUssT0FBTyxHQUNqRCxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsRUFBRSxLQUFLLENBQUMsR0FDbEQsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFBOztBQUVsQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsWUFBTTtBQUMvQixVQUFRLENBQUMscUJBQXFCLEVBQUUsWUFBTTtBQUNwQyxNQUFFLENBQUMsMkNBQTJDLEVBQUUsWUFBTTtBQUNwRCxVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQTtBQUM3RSxVQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQy9ELFlBQU0sQ0FBQyxPQUFPLFdBQVcsS0FBSyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDbEQsWUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUN0QyxZQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO0tBQ3ZDLENBQUMsQ0FBQTs7QUFFRixNQUFFLENB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TTtBQUM5RSxVQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDbEQsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUE7QUFDdkQsVUFBTSxZQUFZLEdBQ2hCLE9BQU8sQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7QUFDakYsWUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtLQUN4QyxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcGVjL3dvcmtlci1oZWxwZXJzLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgKiBhcyBQYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgKiBhcyBIZWxwZXJzIGZyb20gJy4uL3NyYy93b3JrZXItaGVscGVycydcblxuY29uc3QgZ2V0Rml4dHVyZXNQYXRoID0gcGF0aCA9PiBQYXRoLmpvaW4oX19kaXJuYW1lLCAnZml4dHVyZXMnLCBwYXRoKVxuXG5cbmNvbnN0IGdsb2JhbE5vZGVQYXRoID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyA/XG4gIFBhdGguam9pbihnZXRGaXh0dXJlc1BhdGgoJ2dsb2JhbC1lc2xpbnQnKSwgJ2xpYicpIDpcbiAgZ2V0Rml4dHVyZXNQYXRoKCdnbG9iYWwtZXNsaW50JylcblxuZGVzY3JpYmUoJ1dvcmtlciBIZWxwZXJzJywgKCkgPT4ge1xuICBkZXNjcmliZSgnZmluZEVTTGludERpcmVjdG9yeScsICgpID0+IHtcbiAgICBpdCgncmV0dXJucyBhbiBvYmplY3Qgd2l0aCBwYXRoIGFuZCB0eXBlIGtleXMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBtb2R1bGVzRGlyID0gUGF0aC5qb2luKGdldEZpeHR1cmVzUGF0aCgnbG9jYWwtZXNsaW50JyksICdub2RlX21vZHVsZXMnKVxuICAgICAgY29uc3QgZm91bmRFc2xpbnQgPSBIZWxwZXJzLmZpbmRFU0xpbnREaXJlY3RvcnkobW9kdWxlc0Rpciwge30pXG4gICAgICBleHBlY3QodHlwZW9mIGZvdW5kRXNsaW50ID09PSAnb2JqZWN0JykudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGZvdW5kRXNsaW50LnBhdGgpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChmb3VuZEVzbGludC50eXBlKS50b0JlRGVmaW5lZCgpXG4gICAgfSlcblxuICAgIGl0KCdmaW5kcyBhIGxvY2FsIGVzbGludCB3aGVuIHVzZUdsb2JhbEVzbGludCBpcyBmYWxzZScsICgpID0+IHtcbiAgICAgIGNvbnN0IG1vZHVsZXNEaXIgPSBQYXRoLmpvaW4oZ2V0Rml4dHVyZXNQYXRoKCdsb2NhbC1lc2xpbnQnKSwgJ25vZGVfbW9kdWxlcycpXG4gICAgICBjb25zdCBmb3VuZEVzbGludCA9IEhlbHBlcnMuZmluZEVTTGludERpcmVjdG9yeShtb2R1bGVzRGlyLCB7IHVzZUdsb2JhbEVzbGludDogZmFsc2UgfSlcbiAgICAgIGNvbnN0IGV4cGVjdGVkRXNsaW50UGF0aCA9IFBhdGguam9pbihnZXRGaXh0dXJlc1BhdGgoJ2xvY2FsLWVzbGludCcpLCAnbm9kZV9tb2R1bGVzJywgJ2VzbGludCcpXG4gICAgICBleHBlY3QoZm91bmRFc2xpbnQucGF0aCkudG9FcXVhbChleHBlY3RlZEVzbGludFBhdGgpXG4gICAgICBleHBlY3QoZm91bmRFc2xpbnQudHlwZSkudG9FcXVhbCgnbG9jYWwgcHJvamVjdCcpXG4gICAgfSlcblxuICAgIGl0KCdkb2VzIG5vdCBmaW5kIGEgbG9jYWwgZXNsaW50IHdoZW4gdXNlR2xvYmFsRXNsaW50IGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICBjb25zdCBtb2R1bGVzRGlyID0gUGF0aC5qb2luKGdldEZpeHR1cmVzUGF0aCgnbG9jYWwtZXNsaW50JyksICdub2RlX21vZHVsZXMnKVxuICAgICAgY29uc3QgY29uZmlnID0geyB1c2VHbG9iYWxFc2xpbnQ6IHRydWUsIGdsb2JhbE5vZGVQYXRoIH1cbiAgICAgIGNvbnN0IGZvdW5kRXNsaW50ID0gSGVscGVycy5maW5kRVNMaW50RGlyZWN0b3J5KG1vZHVsZXNEaXIsIGNvbmZpZylcbiAgICAgIGNvbnN0IGV4cGVjdGVkRXNsaW50UGF0aCA9IFBhdGguam9pbihnZXRGaXh0dXJlc1BhdGgoJ2xvY2FsLWVzbGludCcpLCAnbm9kZV9tb2R1bGVzJywgJ2VzbGludCcpXG4gICAgICBleHBlY3QoZm91bmRFc2xpbnQucGF0aCkubm90LnRvRXF1YWwoZXhwZWN0ZWRFc2xpbnRQYXRoKVxuICAgICAgZXhwZWN0KGZvdW5kRXNsaW50LnR5cGUpLm5vdC50b0VxdWFsKCdsb2NhbCBwcm9qZWN0JylcbiAgICB9KVxuXG4gICAgaXQoJ2ZpbmRzIGEgZ2xvYmFsIGVzbGludCB3aGVuIHVzZUdsb2JhbEVzbGludCBpcyB0cnVlIGFuZCBhIHZhbGlkIGdsb2JhbE5vZGVQYXRoIGlzIHByb3ZpZGVkJywgKCkgPT4ge1xuICAgICAgY29uc3QgbW9kdWxlc0RpciA9IFBhdGguam9pbihnZXRGaXh0dXJlc1BhdGgoJ2xvY2FsLWVzbGludCcpLCAnbm9kZV9tb2R1bGVzJylcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHsgdXNlR2xvYmFsRXNsaW50OiB0cnVlLCBnbG9iYWxOb2RlUGF0aCB9XG4gICAgICBjb25zdCBmb3VuZEVzbGludCA9IEhlbHBlcnMuZmluZEVTTGludERpcmVjdG9yeShtb2R1bGVzRGlyLCBjb25maWcpXG4gICAgICBjb25zdCBleHBlY3RlZEVzbGludFBhdGggPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInXG4gICAgICAgID8gUGF0aC5qb2luKGdsb2JhbE5vZGVQYXRoLCAnbm9kZV9tb2R1bGVzJywgJ2VzbGludCcpXG4gICAgICAgIDogUGF0aC5qb2luKGdsb2JhbE5vZGVQYXRoLCAnbGliJywgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKVxuICAgICAgZXhwZWN0KGZvdW5kRXNsaW50LnBhdGgpLnRvRXF1YWwoZXhwZWN0ZWRFc2xpbnRQYXRoKVxuICAgICAgZXhwZWN0KGZvdW5kRXNsaW50LnR5cGUpLnRvRXF1YWwoJ2dsb2JhbCcpXG4gICAgfSlcblxuICAgIGl0KCdmYWxscyBiYWNrIHRvIHRoZSBwYWNrYWdlZCBlc2xpbnQgd2hlbiBubyBsb2NhbCBlc2xpbnQgaXMgZm91bmQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBtb2R1bGVzRGlyID0gJ25vdC9hL3JlYWwvcGF0aCdcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHsgdXNlR2xvYmFsRXNsaW50OiBmYWxzZSB9XG4gICAgICBjb25zdCBmb3VuZEVzbGludCA9IEhlbHBlcnMuZmluZEVTTGludERpcmVjdG9yeShtb2R1bGVzRGlyLCBjb25maWcpXG4gICAgICBjb25zdCBleHBlY3RlZEJ1bmRsZWRQYXRoID0gUGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKVxuICAgICAgZXhwZWN0KGZvdW5kRXNsaW50LnBhdGgpLnRvRXF1YWwoZXhwZWN0ZWRCdW5kbGVkUGF0aClcbiAgICAgIGV4cGVjdChmb3VuZEVzbGludC50eXBlKS50b0VxdWFsKCdidW5kbGVkIGZhbGxiYWNrJylcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdnZXRFU0xpbnRJbnN0YW5jZSAmJiBnZXRFU0xpbnRGcm9tRGlyZWN0b3J5JywgKCkgPT4ge1xuICAgIGl0KCd0cmllcyB0byBmaW5kIGFuIGluZGlyZWN0IGxvY2FsIGVzbGludCB1c2luZyBhbiBhYnNvbHV0ZSBwYXRoJywgKCkgPT4ge1xuICAgICAgY29uc3QgcGF0aCA9IFBhdGguam9pbihcbiAgICAgICAgZ2V0Rml4dHVyZXNQYXRoKCdpbmRpcmVjdC1sb2NhbC1lc2xpbnQnKSwgJ3Rlc3RpbmcnLCAnZXNsaW50JywgJ25vZGVfbW9kdWxlcycpXG4gICAgICBjb25zdCBlc2xpbnQgPSBIZWxwZXJzLmdldEVTTGludEluc3RhbmNlKCcnLCB7XG4gICAgICAgIHVzZUdsb2JhbEVzbGludDogZmFsc2UsXG4gICAgICAgIGFkdmFuY2VkTG9jYWxOb2RlTW9kdWxlczogcGF0aFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChlc2xpbnQpLnRvQmUoJ2xvY2F0ZWQnKVxuICAgIH0pXG5cbiAgICBpdCgndHJpZXMgdG8gZmluZCBhbiBpbmRpcmVjdCBsb2NhbCBlc2xpbnQgdXNpbmcgYSByZWxhdGl2ZSBwYXRoJywgKCkgPT4ge1xuICAgICAgY29uc3QgcGF0aCA9IFBhdGguam9pbihcbiAgICAgICAgZ2V0Rml4dHVyZXNQYXRoKCdpbmRpcmVjdC1sb2NhbC1lc2xpbnQnKSwgJ3Rlc3RpbmcnLCAnZXNsaW50JywgJ25vZGVfbW9kdWxlcycpXG4gICAgICBjb25zdCBbcHJvamVjdFBhdGgsIHJlbGF0aXZlUGF0aF0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgocGF0aClcblxuICAgICAgY29uc3QgZXNsaW50ID0gSGVscGVycy5nZXRFU0xpbnRJbnN0YW5jZSgnJywge1xuICAgICAgICB1c2VHbG9iYWxFc2xpbnQ6IGZhbHNlLFxuICAgICAgICBhZHZhbmNlZExvY2FsTm9kZU1vZHVsZXM6IHJlbGF0aXZlUGF0aFxuICAgICAgfSwgcHJvamVjdFBhdGgpXG5cbiAgICAgIGV4cGVjdChlc2xpbnQpLnRvQmUoJ2xvY2F0ZWQnKVxuICAgIH0pXG5cbiAgICBpdCgndHJpZXMgdG8gZmluZCBhIGxvY2FsIGVzbGludCcsICgpID0+IHtcbiAgICAgIGNvbnN0IGVzbGludCA9IEhlbHBlcnMuZ2V0RVNMaW50SW5zdGFuY2UoZ2V0Rml4dHVyZXNQYXRoKCdsb2NhbC1lc2xpbnQnKSwge30pXG4gICAgICBleHBlY3QoZXNsaW50KS50b0JlKCdsb2NhdGVkJylcbiAgICB9KVxuXG4gICAgaXQoJ2NyaWVzIGlmIGxvY2FsIGVzbGludCBpcyBub3QgZm91bmQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICBIZWxwZXJzLmdldEVTTGludEluc3RhbmNlKGdldEZpeHR1cmVzUGF0aCgnZmlsZXMnLCB7fSkpXG4gICAgICB9KS50b1Rocm93KClcbiAgICB9KVxuXG4gICAgaXQoJ3RyaWVzIHRvIGZpbmQgYSBnbG9iYWwgZXNsaW50IGlmIGNvbmZpZyBpcyBzcGVjaWZpZWQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBlc2xpbnQgPSBIZWxwZXJzLmdldEVTTGludEluc3RhbmNlKGdldEZpeHR1cmVzUGF0aCgnbG9jYWwtZXNsaW50JyksIHtcbiAgICAgICAgdXNlR2xvYmFsRXNsaW50OiB0cnVlLFxuICAgICAgICBnbG9iYWxOb2RlUGF0aFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChlc2xpbnQpLnRvQmUoJ2xvY2F0ZWQnKVxuICAgIH0pXG5cbiAgICBpdCgnY3JpZXMgaWYgZ2xvYmFsIGVzbGludCBpcyBub3QgZm91bmQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICBIZWxwZXJzLmdldEVTTGludEluc3RhbmNlKGdldEZpeHR1cmVzUGF0aCgnbG9jYWwtZXNsaW50JyksIHtcbiAgICAgICAgICB1c2VHbG9iYWxFc2xpbnQ6IHRydWUsXG4gICAgICAgICAgZ2xvYmFsTm9kZVBhdGg6IGdldEZpeHR1cmVzUGF0aCgnZmlsZXMnKVxuICAgICAgICB9KVxuICAgICAgfSkudG9UaHJvdygpXG4gICAgfSlcblxuICAgIGl0KCd0cmllcyB0byBmaW5kIGEgbG9jYWwgZXNsaW50IHdpdGggbmVzdGVkIG5vZGVfbW9kdWxlcycsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVEaXIgPSBQYXRoLmpvaW4oZ2V0Rml4dHVyZXNQYXRoKCdsb2NhbC1lc2xpbnQnKSwgJ2xpYicsICdmb28uanMnKVxuICAgICAgY29uc3QgZXNsaW50ID0gSGVscGVycy5nZXRFU0xpbnRJbnN0YW5jZShmaWxlRGlyLCB7fSlcbiAgICAgIGV4cGVjdChlc2xpbnQpLnRvQmUoJ2xvY2F0ZWQnKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2dldENvbmZpZ1BhdGgnLCAoKSA9PiB7XG4gICAgaXQoJ2ZpbmRzIC5lc2xpbnRyYycsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVEaXIgPSBnZXRGaXh0dXJlc1BhdGgoUGF0aC5qb2luKCdjb25maWdzJywgJ25vLWV4dCcpKVxuICAgICAgY29uc3QgZXhwZWN0ZWRQYXRoID0gUGF0aC5qb2luKGZpbGVEaXIsICcuZXNsaW50cmMnKVxuICAgICAgZXhwZWN0KEhlbHBlcnMuZ2V0Q29uZmlnUGF0aChmaWxlRGlyKSkudG9CZShleHBlY3RlZFBhdGgpXG4gICAgfSlcblxuICAgIGl0KCdmaW5kcyAuZXNsaW50cmMueWFtbCcsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVEaXIgPSBnZXRGaXh0dXJlc1BhdGgoUGF0aC5qb2luKCdjb25maWdzJywgJ3lhbWwnKSlcbiAgICAgIGNvbnN0IGV4cGVjdGVkUGF0aCA9IFBhdGguam9pbihmaWxlRGlyLCAnLmVzbGludHJjLnlhbWwnKVxuICAgICAgZXhwZWN0KEhlbHBlcnMuZ2V0Q29uZmlnUGF0aChmaWxlRGlyKSkudG9CZShleHBlY3RlZFBhdGgpXG4gICAgfSlcblxuICAgIGl0KCdmaW5kcyAuZXNsaW50cmMueW1sJywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZURpciA9IGdldEZpeHR1cmVzUGF0aChQYXRoLmpvaW4oJ2NvbmZpZ3MnLCAneW1sJykpXG4gICAgICBjb25zdCBleHBlY3RlZFBhdGggPSBQYXRoLmpvaW4oZmlsZURpciwgJy5lc2xpbnRyYy55bWwnKVxuICAgICAgZXhwZWN0KEhlbHBlcnMuZ2V0Q29uZmlnUGF0aChmaWxlRGlyKSkudG9CZShleHBlY3RlZFBhdGgpXG4gICAgfSlcblxuICAgIGl0KCdmaW5kcyAuZXNsaW50cmMuanMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICdqcycpKVxuICAgICAgY29uc3QgZXhwZWN0ZWRQYXRoID0gUGF0aC5qb2luKGZpbGVEaXIsICcuZXNsaW50cmMuanMnKVxuICAgICAgZXhwZWN0KEhlbHBlcnMuZ2V0Q29uZmlnUGF0aChmaWxlRGlyKSkudG9CZShleHBlY3RlZFBhdGgpXG4gICAgfSlcblxuICAgIGl0KCdmaW5kcyAuZXNsaW50cmMuanNvbicsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVEaXIgPSBnZXRGaXh0dXJlc1BhdGgoUGF0aC5qb2luKCdjb25maWdzJywgJ2pzb24nKSlcbiAgICAgIGNvbnN0IGV4cGVjdGVkUGF0aCA9IFBhdGguam9pbihmaWxlRGlyLCAnLmVzbGludHJjLmpzb24nKVxuICAgICAgZXhwZWN0KEhlbHBlcnMuZ2V0Q29uZmlnUGF0aChmaWxlRGlyKSkudG9CZShleHBlY3RlZFBhdGgpXG4gICAgfSlcblxuICAgIGl0KCdmaW5kcyBwYWNrYWdlLmpzb24gd2l0aCBhbiBlc2xpbnRDb25maWcgcHJvcGVydHknLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICdwYWNrYWdlLWpzb24nKSlcbiAgICAgIGNvbnN0IGV4cGVjdGVkUGF0aCA9IFBhdGguam9pbihmaWxlRGlyLCAncGFja2FnZS5qc29uJylcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG5cbiAgICBpdCgnaWdub3JlcyBwYWNrYWdlLmpzb24gd2l0aCBubyBlc2xpbnRDb25maWcgcHJvcGVydHknLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICdwYWNrYWdlLWpzb24nLCAnbmVzdGVkJykpXG4gICAgICBjb25zdCBleHBlY3RlZFBhdGggPSBnZXRGaXh0dXJlc1BhdGgoUGF0aC5qb2luKCdjb25maWdzJywgJ3BhY2thZ2UtanNvbicsICdwYWNrYWdlLmpzb24nKSlcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2dldFJlbGF0aXZlUGF0aCcsICgpID0+IHtcbiAgICBpdCgncmV0dXJuIHBhdGggcmVsYXRpdmUgb2YgaWdub3JlIGZpbGUgaWYgZm91bmQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaXh0dXJlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKCdlc2xpbnRpZ25vcmUnKVxuICAgICAgY29uc3QgZml4dHVyZUZpbGUgPSBQYXRoLmpvaW4oZml4dHVyZURpciwgJ2lnbm9yZWQuanMnKVxuICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gSGVscGVycy5nZXRSZWxhdGl2ZVBhdGgoZml4dHVyZURpciwgZml4dHVyZUZpbGUsIHt9KVxuICAgICAgY29uc3QgZXhwZWN0ZWRQYXRoID0gUGF0aC5yZWxhdGl2ZShQYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nKSwgZml4dHVyZUZpbGUpXG4gICAgICBleHBlY3QocmVsYXRpdmVQYXRoKS50b0JlKGV4cGVjdGVkUGF0aClcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgbm90IHJldHVybiBwYXRoIHJlbGF0aXZlIHRvIGlnbm9yZSBmaWxlIGlmIGNvbmZpZyBvdmVycmlkZXMgaXQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaXh0dXJlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKCdlc2xpbnRpZ25vcmUnKVxuICAgICAgY29uc3QgZml4dHVyZUZpbGUgPSBQYXRoLmpvaW4oZml4dHVyZURpciwgJ2lnbm9yZWQuanMnKVxuICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID1cbiAgICAgICAgSGVscGVycy5nZXRSZWxhdGl2ZVBhdGgoZml4dHVyZURpciwgZml4dHVyZUZpbGUsIHsgZGlzYWJsZUVzbGludElnbm9yZTogdHJ1ZSB9KVxuICAgICAgZXhwZWN0KHJlbGF0aXZlUGF0aCkudG9CZSgnaWdub3JlZC5qcycpXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=