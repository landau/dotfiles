var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _path = require('path');

var Path = _interopRequireWildcard(_path);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _srcWorkerHelpers = require('../src/worker-helpers');

var Helpers = _interopRequireWildcard(_srcWorkerHelpers);

var _linterEslintSpec = require('./linter-eslint-spec');

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
    var pathPart = Path.join('testing', 'eslint', 'node_modules');

    it('tries to find an indirect local eslint using an absolute path', function () {
      var path = Path.join(getFixturesPath('indirect-local-eslint'), pathPart);
      var eslint = Helpers.getESLintInstance('', {
        useGlobalEslint: false,
        advancedLocalNodeModules: path
      });
      expect(eslint).toBe('located');
    });

    it('tries to find an indirect local eslint using a relative path', function () {
      var path = Path.join(getFixturesPath('indirect-local-eslint'), pathPart);

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

    it('returns the path relative to the project dir if provided when no ignore file is found', _asyncToGenerator(function* () {
      var fixtureFile = getFixturesPath(Path.join('files', 'good.js'));
      // Copy the file to a temporary folder
      var tempFixturePath = yield (0, _linterEslintSpec.copyFileToTempDir)(fixtureFile);
      var tempDir = Path.dirname(tempFixturePath);
      var filepath = Path.join(tempDir, 'good.js');
      var tempDirParent = Path.dirname(tempDir);

      var relativePath = Helpers.getRelativePath(tempDir, filepath, {}, tempDirParent);
      // Since the project is the parent of the temp dir, the relative path should be
      // the dir containing the file, plus the file. (e.g. asgln3/good.js)
      var expectedPath = Path.join(Path.basename(tempDir), 'good.js');
      expect(relativePath).toBe(expectedPath);
      // Remove the temporary directory
      _rimraf2['default'].sync(tempDir);
    }));

    it('returns just the file being linted if no ignore file is found and no project dir is provided', _asyncToGenerator(function* () {
      var fixtureFile = getFixturesPath(Path.join('files', 'good.js'));
      // Copy the file to a temporary folder
      var tempFixturePath = yield (0, _linterEslintSpec.copyFileToTempDir)(fixtureFile);
      var tempDir = Path.dirname(tempFixturePath);
      var filepath = Path.join(tempDir, 'good.js');

      var relativePath = Helpers.getRelativePath(tempDir, filepath, {}, null);
      expect(relativePath).toBe('good.js');

      // Remove the temporary directory
      _rimraf2['default'].sync(tempDir);
    }));
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3BlYy93b3JrZXItaGVscGVycy1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUVzQixNQUFNOztJQUFoQixJQUFJOztzQkFDRyxRQUFROzs7O2dDQUNGLHVCQUF1Qjs7SUFBcEMsT0FBTzs7Z0NBQ2Usc0JBQXNCOztBQUx4RCxXQUFXLENBQUE7O0FBT1gsSUFBTSxlQUFlLEdBQUcsU0FBbEIsZUFBZSxDQUFHLElBQUk7U0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDO0NBQUEsQ0FBQTs7QUFHdEUsSUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLEdBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUNsRCxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUE7O0FBRWxDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFNO0FBQy9CLFVBQVEsQ0FBQyxxQkFBcUIsRUFBRSxZQUFNO0FBQ3BDLE1BQUUsQ0FBQywyQ0FBMkMsRUFBRSxZQUFNO0FBQ3BELFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFBO0FBQzdFLFVBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDL0QsWUFBTSxDQUFDLE9BQU8sV0FBVyxLQUFLLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNsRCxZQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ3RDLFlBQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLENB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Q0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7O0FBRXZDLDBCQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtLQUNyQixFQUFDLENBQUE7O0FBRUYsTUFBRSxDQUFDLDhGQUE4RixvQkFBRSxhQUFZO0FBQzdHLFVBQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFBOztBQUVsRSxVQUFNLGVBQWUsR0FBRyxNQUFNLHlDQUFrQixXQUFXLENBQUMsQ0FBQTtBQUM1RCxVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQzdDLFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFBOztBQUU5QyxVQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ3pFLFlBQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7OztBQUdwQywwQkFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7S0FDckIsRUFBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3BlYy93b3JrZXItaGVscGVycy1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0ICogYXMgUGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHJpbXJhZiBmcm9tICdyaW1yYWYnXG5pbXBvcnQgKiBhcyBIZWxwZXJzIGZyb20gJy4uL3NyYy93b3JrZXItaGVscGVycydcbmltcG9ydCB7IGNvcHlGaWxlVG9UZW1wRGlyIH0gZnJvbSAnLi9saW50ZXItZXNsaW50LXNwZWMnXG5cbmNvbnN0IGdldEZpeHR1cmVzUGF0aCA9IHBhdGggPT4gUGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJywgcGF0aClcblxuXG5jb25zdCBnbG9iYWxOb2RlUGF0aCA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgP1xuICBQYXRoLmpvaW4oZ2V0Rml4dHVyZXNQYXRoKCdnbG9iYWwtZXNsaW50JyksICdsaWInKSA6XG4gIGdldEZpeHR1cmVzUGF0aCgnZ2xvYmFsLWVzbGludCcpXG5cbmRlc2NyaWJlKCdXb3JrZXIgSGVscGVycycsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2ZpbmRFU0xpbnREaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybnMgYW4gb2JqZWN0IHdpdGggcGF0aCBhbmQgdHlwZSBrZXlzJywgKCkgPT4ge1xuICAgICAgY29uc3QgbW9kdWxlc0RpciA9IFBhdGguam9pbihnZXRGaXh0dXJlc1BhdGgoJ2xvY2FsLWVzbGludCcpLCAnbm9kZV9tb2R1bGVzJylcbiAgICAgIGNvbnN0IGZvdW5kRXNsaW50ID0gSGVscGVycy5maW5kRVNMaW50RGlyZWN0b3J5KG1vZHVsZXNEaXIsIHt9KVxuICAgICAgZXhwZWN0KHR5cGVvZiBmb3VuZEVzbGludCA9PT0gJ29iamVjdCcpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChmb3VuZEVzbGludC5wYXRoKS50b0JlRGVmaW5lZCgpXG4gICAgICBleHBlY3QoZm91bmRFc2xpbnQudHlwZSkudG9CZURlZmluZWQoKVxuICAgIH0pXG5cbiAgICBpdCgnZmluZHMgYSBsb2NhbCBlc2xpbnQgd2hlbiB1c2VHbG9iYWxFc2xpbnQgaXMgZmFsc2UnLCAoKSA9PiB7XG4gICAgICBjb25zdCBtb2R1bGVzRGlyID0gUGF0aC5qb2luKGdldEZpeHR1cmVzUGF0aCgnbG9jYWwtZXNsaW50JyksICdub2RlX21vZHVsZXMnKVxuICAgICAgY29uc3QgZm91bmRFc2xpbnQgPSBIZWxwZXJzLmZpbmRFU0xpbnREaXJlY3RvcnkobW9kdWxlc0RpciwgeyB1c2VHbG9iYWxFc2xpbnQ6IGZhbHNlIH0pXG4gICAgICBjb25zdCBleHBlY3RlZEVzbGludFBhdGggPSBQYXRoLmpvaW4oZ2V0Rml4dHVyZXNQYXRoKCdsb2NhbC1lc2xpbnQnKSwgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKVxuICAgICAgZXhwZWN0KGZvdW5kRXNsaW50LnBhdGgpLnRvRXF1YWwoZXhwZWN0ZWRFc2xpbnRQYXRoKVxuICAgICAgZXhwZWN0KGZvdW5kRXNsaW50LnR5cGUpLnRvRXF1YWwoJ2xvY2FsIHByb2plY3QnKVxuICAgIH0pXG5cbiAgICBpdCgnZG9lcyBub3QgZmluZCBhIGxvY2FsIGVzbGludCB3aGVuIHVzZUdsb2JhbEVzbGludCBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgY29uc3QgbW9kdWxlc0RpciA9IFBhdGguam9pbihnZXRGaXh0dXJlc1BhdGgoJ2xvY2FsLWVzbGludCcpLCAnbm9kZV9tb2R1bGVzJylcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHsgdXNlR2xvYmFsRXNsaW50OiB0cnVlLCBnbG9iYWxOb2RlUGF0aCB9XG4gICAgICBjb25zdCBmb3VuZEVzbGludCA9IEhlbHBlcnMuZmluZEVTTGludERpcmVjdG9yeShtb2R1bGVzRGlyLCBjb25maWcpXG4gICAgICBjb25zdCBleHBlY3RlZEVzbGludFBhdGggPSBQYXRoLmpvaW4oZ2V0Rml4dHVyZXNQYXRoKCdsb2NhbC1lc2xpbnQnKSwgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKVxuICAgICAgZXhwZWN0KGZvdW5kRXNsaW50LnBhdGgpLm5vdC50b0VxdWFsKGV4cGVjdGVkRXNsaW50UGF0aClcbiAgICAgIGV4cGVjdChmb3VuZEVzbGludC50eXBlKS5ub3QudG9FcXVhbCgnbG9jYWwgcHJvamVjdCcpXG4gICAgfSlcblxuICAgIGl0KCdmaW5kcyBhIGdsb2JhbCBlc2xpbnQgd2hlbiB1c2VHbG9iYWxFc2xpbnQgaXMgdHJ1ZSBhbmQgYSB2YWxpZCBnbG9iYWxOb2RlUGF0aCBpcyBwcm92aWRlZCcsICgpID0+IHtcbiAgICAgIGNvbnN0IG1vZHVsZXNEaXIgPSBQYXRoLmpvaW4oZ2V0Rml4dHVyZXNQYXRoKCdsb2NhbC1lc2xpbnQnKSwgJ25vZGVfbW9kdWxlcycpXG4gICAgICBjb25zdCBjb25maWcgPSB7IHVzZUdsb2JhbEVzbGludDogdHJ1ZSwgZ2xvYmFsTm9kZVBhdGggfVxuICAgICAgY29uc3QgZm91bmRFc2xpbnQgPSBIZWxwZXJzLmZpbmRFU0xpbnREaXJlY3RvcnkobW9kdWxlc0RpciwgY29uZmlnKVxuICAgICAgY29uc3QgZXhwZWN0ZWRFc2xpbnRQYXRoID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJ1xuICAgICAgICA/IFBhdGguam9pbihnbG9iYWxOb2RlUGF0aCwgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKVxuICAgICAgICA6IFBhdGguam9pbihnbG9iYWxOb2RlUGF0aCwgJ2xpYicsICdub2RlX21vZHVsZXMnLCAnZXNsaW50JylcbiAgICAgIGV4cGVjdChmb3VuZEVzbGludC5wYXRoKS50b0VxdWFsKGV4cGVjdGVkRXNsaW50UGF0aClcbiAgICAgIGV4cGVjdChmb3VuZEVzbGludC50eXBlKS50b0VxdWFsKCdnbG9iYWwnKVxuICAgIH0pXG5cbiAgICBpdCgnZmFsbHMgYmFjayB0byB0aGUgcGFja2FnZWQgZXNsaW50IHdoZW4gbm8gbG9jYWwgZXNsaW50IGlzIGZvdW5kJywgKCkgPT4ge1xuICAgICAgY29uc3QgbW9kdWxlc0RpciA9ICdub3QvYS9yZWFsL3BhdGgnXG4gICAgICBjb25zdCBjb25maWcgPSB7IHVzZUdsb2JhbEVzbGludDogZmFsc2UgfVxuICAgICAgY29uc3QgZm91bmRFc2xpbnQgPSBIZWxwZXJzLmZpbmRFU0xpbnREaXJlY3RvcnkobW9kdWxlc0RpciwgY29uZmlnKVxuICAgICAgY29uc3QgZXhwZWN0ZWRCdW5kbGVkUGF0aCA9IFBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICdub2RlX21vZHVsZXMnLCAnZXNsaW50JylcbiAgICAgIGV4cGVjdChmb3VuZEVzbGludC5wYXRoKS50b0VxdWFsKGV4cGVjdGVkQnVuZGxlZFBhdGgpXG4gICAgICBleHBlY3QoZm91bmRFc2xpbnQudHlwZSkudG9FcXVhbCgnYnVuZGxlZCBmYWxsYmFjaycpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnZ2V0RVNMaW50SW5zdGFuY2UgJiYgZ2V0RVNMaW50RnJvbURpcmVjdG9yeScsICgpID0+IHtcbiAgICBjb25zdCBwYXRoUGFydCA9IFBhdGguam9pbigndGVzdGluZycsICdlc2xpbnQnLCAnbm9kZV9tb2R1bGVzJylcblxuICAgIGl0KCd0cmllcyB0byBmaW5kIGFuIGluZGlyZWN0IGxvY2FsIGVzbGludCB1c2luZyBhbiBhYnNvbHV0ZSBwYXRoJywgKCkgPT4ge1xuICAgICAgY29uc3QgcGF0aCA9IFBhdGguam9pbihnZXRGaXh0dXJlc1BhdGgoJ2luZGlyZWN0LWxvY2FsLWVzbGludCcpLCBwYXRoUGFydClcbiAgICAgIGNvbnN0IGVzbGludCA9IEhlbHBlcnMuZ2V0RVNMaW50SW5zdGFuY2UoJycsIHtcbiAgICAgICAgdXNlR2xvYmFsRXNsaW50OiBmYWxzZSxcbiAgICAgICAgYWR2YW5jZWRMb2NhbE5vZGVNb2R1bGVzOiBwYXRoXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGVzbGludCkudG9CZSgnbG9jYXRlZCcpXG4gICAgfSlcblxuICAgIGl0KCd0cmllcyB0byBmaW5kIGFuIGluZGlyZWN0IGxvY2FsIGVzbGludCB1c2luZyBhIHJlbGF0aXZlIHBhdGgnLCAoKSA9PiB7XG4gICAgICBjb25zdCBwYXRoID0gUGF0aC5qb2luKGdldEZpeHR1cmVzUGF0aCgnaW5kaXJlY3QtbG9jYWwtZXNsaW50JyksIHBhdGhQYXJ0KVxuICAgICAgY29uc3QgW3Byb2plY3RQYXRoLCByZWxhdGl2ZVBhdGhdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKHBhdGgpXG5cbiAgICAgIGNvbnN0IGVzbGludCA9IEhlbHBlcnMuZ2V0RVNMaW50SW5zdGFuY2UoJycsIHtcbiAgICAgICAgdXNlR2xvYmFsRXNsaW50OiBmYWxzZSxcbiAgICAgICAgYWR2YW5jZWRMb2NhbE5vZGVNb2R1bGVzOiByZWxhdGl2ZVBhdGhcbiAgICAgIH0sIHByb2plY3RQYXRoKVxuXG4gICAgICBleHBlY3QoZXNsaW50KS50b0JlKCdsb2NhdGVkJylcbiAgICB9KVxuXG4gICAgaXQoJ3RyaWVzIHRvIGZpbmQgYSBsb2NhbCBlc2xpbnQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBlc2xpbnQgPSBIZWxwZXJzLmdldEVTTGludEluc3RhbmNlKGdldEZpeHR1cmVzUGF0aCgnbG9jYWwtZXNsaW50JyksIHt9KVxuICAgICAgZXhwZWN0KGVzbGludCkudG9CZSgnbG9jYXRlZCcpXG4gICAgfSlcblxuICAgIGl0KCdjcmllcyBpZiBsb2NhbCBlc2xpbnQgaXMgbm90IGZvdW5kJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgSGVscGVycy5nZXRFU0xpbnRJbnN0YW5jZShnZXRGaXh0dXJlc1BhdGgoJ2ZpbGVzJywge30pKVxuICAgICAgfSkudG9UaHJvdygpXG4gICAgfSlcblxuICAgIGl0KCd0cmllcyB0byBmaW5kIGEgZ2xvYmFsIGVzbGludCBpZiBjb25maWcgaXMgc3BlY2lmaWVkJywgKCkgPT4ge1xuICAgICAgY29uc3QgZXNsaW50ID0gSGVscGVycy5nZXRFU0xpbnRJbnN0YW5jZShnZXRGaXh0dXJlc1BhdGgoJ2xvY2FsLWVzbGludCcpLCB7XG4gICAgICAgIHVzZUdsb2JhbEVzbGludDogdHJ1ZSxcbiAgICAgICAgZ2xvYmFsTm9kZVBhdGhcbiAgICAgIH0pXG4gICAgICBleHBlY3QoZXNsaW50KS50b0JlKCdsb2NhdGVkJylcbiAgICB9KVxuXG4gICAgaXQoJ2NyaWVzIGlmIGdsb2JhbCBlc2xpbnQgaXMgbm90IGZvdW5kJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgSGVscGVycy5nZXRFU0xpbnRJbnN0YW5jZShnZXRGaXh0dXJlc1BhdGgoJ2xvY2FsLWVzbGludCcpLCB7XG4gICAgICAgICAgdXNlR2xvYmFsRXNsaW50OiB0cnVlLFxuICAgICAgICAgIGdsb2JhbE5vZGVQYXRoOiBnZXRGaXh0dXJlc1BhdGgoJ2ZpbGVzJylcbiAgICAgICAgfSlcbiAgICAgIH0pLnRvVGhyb3coKVxuICAgIH0pXG5cbiAgICBpdCgndHJpZXMgdG8gZmluZCBhIGxvY2FsIGVzbGludCB3aXRoIG5lc3RlZCBub2RlX21vZHVsZXMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gUGF0aC5qb2luKGdldEZpeHR1cmVzUGF0aCgnbG9jYWwtZXNsaW50JyksICdsaWInLCAnZm9vLmpzJylcbiAgICAgIGNvbnN0IGVzbGludCA9IEhlbHBlcnMuZ2V0RVNMaW50SW5zdGFuY2UoZmlsZURpciwge30pXG4gICAgICBleHBlY3QoZXNsaW50KS50b0JlKCdsb2NhdGVkJylcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdnZXRDb25maWdQYXRoJywgKCkgPT4ge1xuICAgIGl0KCdmaW5kcyAuZXNsaW50cmMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICduby1leHQnKSlcbiAgICAgIGNvbnN0IGV4cGVjdGVkUGF0aCA9IFBhdGguam9pbihmaWxlRGlyLCAnLmVzbGludHJjJylcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG5cbiAgICBpdCgnZmluZHMgLmVzbGludHJjLnlhbWwnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICd5YW1sJykpXG4gICAgICBjb25zdCBleHBlY3RlZFBhdGggPSBQYXRoLmpvaW4oZmlsZURpciwgJy5lc2xpbnRyYy55YW1sJylcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG5cbiAgICBpdCgnZmluZHMgLmVzbGludHJjLnltbCcsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVEaXIgPSBnZXRGaXh0dXJlc1BhdGgoUGF0aC5qb2luKCdjb25maWdzJywgJ3ltbCcpKVxuICAgICAgY29uc3QgZXhwZWN0ZWRQYXRoID0gUGF0aC5qb2luKGZpbGVEaXIsICcuZXNsaW50cmMueW1sJylcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG5cbiAgICBpdCgnZmluZHMgLmVzbGludHJjLmpzJywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZURpciA9IGdldEZpeHR1cmVzUGF0aChQYXRoLmpvaW4oJ2NvbmZpZ3MnLCAnanMnKSlcbiAgICAgIGNvbnN0IGV4cGVjdGVkUGF0aCA9IFBhdGguam9pbihmaWxlRGlyLCAnLmVzbGludHJjLmpzJylcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG5cbiAgICBpdCgnZmluZHMgLmVzbGludHJjLmpzb24nLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICdqc29uJykpXG4gICAgICBjb25zdCBleHBlY3RlZFBhdGggPSBQYXRoLmpvaW4oZmlsZURpciwgJy5lc2xpbnRyYy5qc29uJylcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG5cbiAgICBpdCgnZmluZHMgcGFja2FnZS5qc29uIHdpdGggYW4gZXNsaW50Q29uZmlnIHByb3BlcnR5JywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZURpciA9IGdldEZpeHR1cmVzUGF0aChQYXRoLmpvaW4oJ2NvbmZpZ3MnLCAncGFja2FnZS1qc29uJykpXG4gICAgICBjb25zdCBleHBlY3RlZFBhdGggPSBQYXRoLmpvaW4oZmlsZURpciwgJ3BhY2thZ2UuanNvbicpXG4gICAgICBleHBlY3QoSGVscGVycy5nZXRDb25maWdQYXRoKGZpbGVEaXIpKS50b0JlKGV4cGVjdGVkUGF0aClcbiAgICB9KVxuXG4gICAgaXQoJ2lnbm9yZXMgcGFja2FnZS5qc29uIHdpdGggbm8gZXNsaW50Q29uZmlnIHByb3BlcnR5JywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZURpciA9IGdldEZpeHR1cmVzUGF0aChQYXRoLmpvaW4oJ2NvbmZpZ3MnLCAncGFja2FnZS1qc29uJywgJ25lc3RlZCcpKVxuICAgICAgY29uc3QgZXhwZWN0ZWRQYXRoID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICdwYWNrYWdlLWpzb24nLCAncGFja2FnZS5qc29uJykpXG4gICAgICBleHBlY3QoSGVscGVycy5nZXRDb25maWdQYXRoKGZpbGVEaXIpKS50b0JlKGV4cGVjdGVkUGF0aClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdnZXRSZWxhdGl2ZVBhdGgnLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybiBwYXRoIHJlbGF0aXZlIG9mIGlnbm9yZSBmaWxlIGlmIGZvdW5kJywgKCkgPT4ge1xuICAgICAgY29uc3QgZml4dHVyZURpciA9IGdldEZpeHR1cmVzUGF0aCgnZXNsaW50aWdub3JlJylcbiAgICAgIGNvbnN0IGZpeHR1cmVGaWxlID0gUGF0aC5qb2luKGZpeHR1cmVEaXIsICdpZ25vcmVkLmpzJylcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IEhlbHBlcnMuZ2V0UmVsYXRpdmVQYXRoKGZpeHR1cmVEaXIsIGZpeHR1cmVGaWxlLCB7fSlcbiAgICAgIGNvbnN0IGV4cGVjdGVkUGF0aCA9IFBhdGgucmVsYXRpdmUoUGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJyksIGZpeHR1cmVGaWxlKVxuICAgICAgZXhwZWN0KHJlbGF0aXZlUGF0aCkudG9CZShleHBlY3RlZFBhdGgpXG4gICAgfSlcblxuICAgIGl0KCdkb2VzIG5vdCByZXR1cm4gcGF0aCByZWxhdGl2ZSB0byBpZ25vcmUgZmlsZSBpZiBjb25maWcgb3ZlcnJpZGVzIGl0JywgKCkgPT4ge1xuICAgICAgY29uc3QgZml4dHVyZURpciA9IGdldEZpeHR1cmVzUGF0aCgnZXNsaW50aWdub3JlJylcbiAgICAgIGNvbnN0IGZpeHR1cmVGaWxlID0gUGF0aC5qb2luKGZpeHR1cmVEaXIsICdpZ25vcmVkLmpzJylcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9XG4gICAgICAgIEhlbHBlcnMuZ2V0UmVsYXRpdmVQYXRoKGZpeHR1cmVEaXIsIGZpeHR1cmVGaWxlLCB7IGRpc2FibGVFc2xpbnRJZ25vcmU6IHRydWUgfSlcbiAgICAgIGV4cGVjdChyZWxhdGl2ZVBhdGgpLnRvQmUoJ2lnbm9yZWQuanMnKVxuICAgIH0pXG5cbiAgICBpdCgncmV0dXJucyB0aGUgcGF0aCByZWxhdGl2ZSB0byB0aGUgcHJvamVjdCBkaXIgaWYgcHJvdmlkZWQgd2hlbiBubyBpZ25vcmUgZmlsZSBpcyBmb3VuZCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGZpeHR1cmVGaWxlID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignZmlsZXMnLCAnZ29vZC5qcycpKVxuICAgICAgLy8gQ29weSB0aGUgZmlsZSB0byBhIHRlbXBvcmFyeSBmb2xkZXJcbiAgICAgIGNvbnN0IHRlbXBGaXh0dXJlUGF0aCA9IGF3YWl0IGNvcHlGaWxlVG9UZW1wRGlyKGZpeHR1cmVGaWxlKVxuICAgICAgY29uc3QgdGVtcERpciA9IFBhdGguZGlybmFtZSh0ZW1wRml4dHVyZVBhdGgpXG4gICAgICBjb25zdCBmaWxlcGF0aCA9IFBhdGguam9pbih0ZW1wRGlyLCAnZ29vZC5qcycpXG4gICAgICBjb25zdCB0ZW1wRGlyUGFyZW50ID0gUGF0aC5kaXJuYW1lKHRlbXBEaXIpXG5cbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IEhlbHBlcnMuZ2V0UmVsYXRpdmVQYXRoKHRlbXBEaXIsIGZpbGVwYXRoLCB7fSwgdGVtcERpclBhcmVudClcbiAgICAgIC8vIFNpbmNlIHRoZSBwcm9qZWN0IGlzIHRoZSBwYXJlbnQgb2YgdGhlIHRlbXAgZGlyLCB0aGUgcmVsYXRpdmUgcGF0aCBzaG91bGQgYmVcbiAgICAgIC8vIHRoZSBkaXIgY29udGFpbmluZyB0aGUgZmlsZSwgcGx1cyB0aGUgZmlsZS4gKGUuZy4gYXNnbG4zL2dvb2QuanMpXG4gICAgICBjb25zdCBleHBlY3RlZFBhdGggPSBQYXRoLmpvaW4oUGF0aC5iYXNlbmFtZSh0ZW1wRGlyKSwgJ2dvb2QuanMnKVxuICAgICAgZXhwZWN0KHJlbGF0aXZlUGF0aCkudG9CZShleHBlY3RlZFBhdGgpXG4gICAgICAvLyBSZW1vdmUgdGhlIHRlbXBvcmFyeSBkaXJlY3RvcnlcbiAgICAgIHJpbXJhZi5zeW5jKHRlbXBEaXIpXG4gICAgfSlcblxuICAgIGl0KCdyZXR1cm5zIGp1c3QgdGhlIGZpbGUgYmVpbmcgbGludGVkIGlmIG5vIGlnbm9yZSBmaWxlIGlzIGZvdW5kIGFuZCBubyBwcm9qZWN0IGRpciBpcyBwcm92aWRlZCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGZpeHR1cmVGaWxlID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignZmlsZXMnLCAnZ29vZC5qcycpKVxuICAgICAgLy8gQ29weSB0aGUgZmlsZSB0byBhIHRlbXBvcmFyeSBmb2xkZXJcbiAgICAgIGNvbnN0IHRlbXBGaXh0dXJlUGF0aCA9IGF3YWl0IGNvcHlGaWxlVG9UZW1wRGlyKGZpeHR1cmVGaWxlKVxuICAgICAgY29uc3QgdGVtcERpciA9IFBhdGguZGlybmFtZSh0ZW1wRml4dHVyZVBhdGgpXG4gICAgICBjb25zdCBmaWxlcGF0aCA9IFBhdGguam9pbih0ZW1wRGlyLCAnZ29vZC5qcycpXG5cbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IEhlbHBlcnMuZ2V0UmVsYXRpdmVQYXRoKHRlbXBEaXIsIGZpbGVwYXRoLCB7fSwgbnVsbClcbiAgICAgIGV4cGVjdChyZWxhdGl2ZVBhdGgpLnRvQmUoJ2dvb2QuanMnKVxuXG4gICAgICAvLyBSZW1vdmUgdGhlIHRlbXBvcmFyeSBkaXJlY3RvcnlcbiAgICAgIHJpbXJhZi5zeW5jKHRlbXBEaXIpXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=