Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getNodePrefixPath = getNodePrefixPath;
exports.findESLintDirectory = findESLintDirectory;
exports.getESLintFromDirectory = getESLintFromDirectory;
exports.refreshModulesPath = refreshModulesPath;
exports.getESLintInstance = getESLintInstance;
exports.getConfigPath = getConfigPath;
exports.getRelativePath = getRelativePath;
exports.getCLIEngineOptions = getCLIEngineOptions;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _resolveEnv = require('resolve-env');

var _resolveEnv2 = _interopRequireDefault(_resolveEnv);

var _atomLinter = require('atom-linter');

var _consistentPath = require('consistent-path');

var _consistentPath2 = _interopRequireDefault(_consistentPath);

'use babel';

var Cache = {
  ESLINT_LOCAL_PATH: _path2['default'].normalize(_path2['default'].join(__dirname, '..', 'node_modules', 'eslint')),
  NODE_PREFIX_PATH: null,
  LAST_MODULES_PATH: null
};

function getNodePrefixPath() {
  if (Cache.NODE_PREFIX_PATH === null) {
    var npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    try {
      Cache.NODE_PREFIX_PATH = _child_process2['default'].spawnSync(npmCommand, ['get', 'prefix'], {
        env: Object.assign(Object.assign({}, process.env), { PATH: (0, _consistentPath2['default'])() })
      }).output[1].toString().trim();
    } catch (e) {
      var errMsg = 'Unable to execute `npm get prefix`. Please make sure ' + 'Atom is getting $PATH correctly.';
      throw new Error(errMsg);
    }
  }
  return Cache.NODE_PREFIX_PATH;
}

function isDirectory(dirPath) {
  var isDir = undefined;
  try {
    isDir = _fs2['default'].statSync(dirPath).isDirectory();
  } catch (e) {
    isDir = false;
  }
  return isDir;
}

function findESLintDirectory(modulesDir, config, projectPath) {
  var eslintDir = null;
  var locationType = null;
  if (config.useGlobalEslint) {
    locationType = 'global';
    var prefixPath = config.globalNodePath || getNodePrefixPath();
    // NPM on Windows and Yarn on all platforms
    eslintDir = _path2['default'].join(prefixPath, 'node_modules', 'eslint');
    if (!isDirectory(eslintDir)) {
      // NPM on platforms other than Windows
      eslintDir = _path2['default'].join(prefixPath, 'lib', 'node_modules', 'eslint');
    }
  } else if (!config.advancedLocalNodeModules) {
    locationType = 'local project';
    eslintDir = _path2['default'].join(modulesDir || '', 'eslint');
  } else if (_path2['default'].isAbsolute(config.advancedLocalNodeModules)) {
    locationType = 'advanced specified';
    eslintDir = _path2['default'].join(config.advancedLocalNodeModules || '', 'eslint');
  } else {
    locationType = 'advanced specified';
    eslintDir = _path2['default'].join(projectPath || '', config.advancedLocalNodeModules, 'eslint');
  }
  if (isDirectory(eslintDir)) {
    return {
      path: eslintDir,
      type: locationType
    };
  } else if (config.useGlobalEslint) {
    throw new Error('ESLint not found, please ensure the global Node path is set correctly.');
  }
  return {
    path: Cache.ESLINT_LOCAL_PATH,
    type: 'bundled fallback'
  };
}

function getESLintFromDirectory(modulesDir, config, projectPath) {
  var _findESLintDirectory = findESLintDirectory(modulesDir, config, projectPath);

  var ESLintDirectory = _findESLintDirectory.path;

  try {
    // eslint-disable-next-line import/no-dynamic-require
    return require(ESLintDirectory);
  } catch (e) {
    if (config.useGlobalEslint && e.code === 'MODULE_NOT_FOUND') {
      throw new Error('ESLint not found, try restarting Atom to clear caches.');
    }
    // eslint-disable-next-line import/no-dynamic-require
    return require(Cache.ESLINT_LOCAL_PATH);
  }
}

function refreshModulesPath(modulesDir) {
  if (Cache.LAST_MODULES_PATH !== modulesDir) {
    Cache.LAST_MODULES_PATH = modulesDir;
    process.env.NODE_PATH = modulesDir || '';
    // eslint-disable-next-line no-underscore-dangle
    require('module').Module._initPaths();
  }
}

function getESLintInstance(fileDir, config, projectPath) {
  var modulesDir = _path2['default'].dirname((0, _atomLinter.findCached)(fileDir, 'node_modules/eslint') || '');
  refreshModulesPath(modulesDir);
  return getESLintFromDirectory(modulesDir, config, projectPath);
}

function getConfigPath(_x) {
  var _again = true;

  _function: while (_again) {
    var fileDir = _x;
    _again = false;

    var configFile = (0, _atomLinter.findCached)(fileDir, ['.eslintrc.js', '.eslintrc.yaml', '.eslintrc.yml', '.eslintrc.json', '.eslintrc', 'package.json']);
    if (configFile) {
      if (_path2['default'].basename(configFile) === 'package.json') {
        // eslint-disable-next-line import/no-dynamic-require
        if (require(configFile).eslintConfig) {
          return configFile;
        }
        // If we are here, we found a package.json without an eslint config
        // in a dir without any other eslint config files
        // (because 'package.json' is last in the call to findCached)
        // So, keep looking from the parent directory
        _x = _path2['default'].resolve(_path2['default'].dirname(configFile), '..');
        _again = true;
        configFile = undefined;
        continue _function;
      }
      return configFile;
    }
    return null;
  }
}

function getRelativePath(fileDir, filePath, config, projectPath) {
  var ignoreFile = config.disableEslintIgnore ? null : (0, _atomLinter.findCached)(fileDir, '.eslintignore');

  // If we can find an .eslintignore file, we can set cwd there
  // (because they are expected to be at the project root)
  if (ignoreFile) {
    var ignoreDir = _path2['default'].dirname(ignoreFile);
    process.chdir(ignoreDir);
    return _path2['default'].relative(ignoreDir, filePath);
  }
  // Otherwise, we'll set the cwd to the atom project root as long as that exists
  if (projectPath) {
    process.chdir(projectPath);
    return _path2['default'].relative(projectPath, filePath);
  }
  // If all else fails, use the file location itself
  process.chdir(fileDir);
  return _path2['default'].basename(filePath);
}

function getCLIEngineOptions(type, config, rules, filePath, fileDir, givenConfigPath) {
  var cliEngineConfig = {
    rules: rules,
    ignore: !config.disableEslintIgnore,
    warnIgnored: false,
    fix: type === 'fix'
  };

  var ignoreFile = config.disableEslintIgnore ? null : (0, _atomLinter.findCached)(fileDir, '.eslintignore');
  if (ignoreFile) {
    cliEngineConfig.ignorePath = ignoreFile;
  }

  if (config.eslintRulesDir) {
    var rulesDir = (0, _resolveEnv2['default'])(config.eslintRulesDir);
    if (!_path2['default'].isAbsolute(rulesDir)) {
      rulesDir = (0, _atomLinter.findCached)(fileDir, rulesDir);
    }
    if (rulesDir) {
      cliEngineConfig.rulePaths = [rulesDir];
    }
  }

  if (givenConfigPath === null && config.eslintrcPath) {
    // If we didn't find a configuration use the fallback from the settings
    cliEngineConfig.configFile = (0, _resolveEnv2['default'])(config.eslintrcPath);
  }

  return cliEngineConfig;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL3dvcmtlci1oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQUVpQixNQUFNOzs7O2tCQUNSLElBQUk7Ozs7NkJBQ00sZUFBZTs7OzswQkFDakIsYUFBYTs7OzswQkFDVCxhQUFhOzs4QkFDcEIsaUJBQWlCOzs7O0FBUHJDLFdBQVcsQ0FBQTs7QUFTWCxJQUFNLEtBQUssR0FBRztBQUNaLG1CQUFpQixFQUFFLGtCQUFLLFNBQVMsQ0FBQyxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdkYsa0JBQWdCLEVBQUUsSUFBSTtBQUN0QixtQkFBaUIsRUFBRSxJQUFJO0NBQ3hCLENBQUE7O0FBRU0sU0FBUyxpQkFBaUIsR0FBRztBQUNsQyxNQUFJLEtBQUssQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7QUFDbkMsUUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLEdBQUcsU0FBUyxHQUFHLEtBQUssQ0FBQTtBQUNuRSxRQUFJO0FBQ0YsV0FBSyxDQUFDLGdCQUFnQixHQUNwQiwyQkFBYSxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxFQUFFO0FBQ3BELFdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxrQ0FBUyxFQUFFLENBQUM7T0FDeEUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtLQUNqQyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsVUFBTSxNQUFNLEdBQUcsdURBQXVELEdBQ3BFLGtDQUFrQyxDQUFB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R0FDeEM7O0FBRUQsTUFBSSxNQUFNLENBQUMsY0FBYyxFQUFFO0FBQ3pCLFFBQUksUUFBUSxHQUFHLDZCQUFXLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUNoRCxRQUFJLENBQUMsa0JBQUssVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQzlCLGNBQVEsR0FBRyw0QkFBVyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDekM7QUFDRCxRQUFJLFFBQVEsRUFBRTtBQUNaLHFCQUFlLENBQUMsU0FBUyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDdkM7R0FDRjs7QUFFRCxNQUFJLGVBQWUsS0FBSyxJQUFJLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRTs7QUFFbkQsbUJBQWUsQ0FBQyxVQUFVLEdBQUcsNkJBQVcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFBO0dBQzdEOztBQUVELFNBQU8sZUFBZSxDQUFBO0NBQ3ZCIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL3dvcmtlci1oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IFBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBDaGlsZFByb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2VzcydcbmltcG9ydCByZXNvbHZlRW52IGZyb20gJ3Jlc29sdmUtZW52J1xuaW1wb3J0IHsgZmluZENhY2hlZCB9IGZyb20gJ2F0b20tbGludGVyJ1xuaW1wb3J0IGdldFBhdGggZnJvbSAnY29uc2lzdGVudC1wYXRoJ1xuXG5jb25zdCBDYWNoZSA9IHtcbiAgRVNMSU5UX0xPQ0FMX1BBVEg6IFBhdGgubm9ybWFsaXplKFBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICdub2RlX21vZHVsZXMnLCAnZXNsaW50JykpLFxuICBOT0RFX1BSRUZJWF9QQVRIOiBudWxsLFxuICBMQVNUX01PRFVMRVNfUEFUSDogbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm9kZVByZWZpeFBhdGgoKSB7XG4gIGlmIChDYWNoZS5OT0RFX1BSRUZJWF9QQVRIID09PSBudWxsKSB7XG4gICAgY29uc3QgbnBtQ29tbWFuZCA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgPyAnbnBtLmNtZCcgOiAnbnBtJ1xuICAgIHRyeSB7XG4gICAgICBDYWNoZS5OT0RFX1BSRUZJWF9QQVRIID1cbiAgICAgICAgQ2hpbGRQcm9jZXNzLnNwYXduU3luYyhucG1Db21tYW5kLCBbJ2dldCcsICdwcmVmaXgnXSwge1xuICAgICAgICAgIGVudjogT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBwcm9jZXNzLmVudiksIHsgUEFUSDogZ2V0UGF0aCgpIH0pXG4gICAgICAgIH0pLm91dHB1dFsxXS50b1N0cmluZygpLnRyaW0oKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnN0IGVyck1zZyA9ICdVbmFibGUgdG8gZXhlY3V0ZSBgbnBtIGdldCBwcmVmaXhgLiBQbGVhc2UgbWFrZSBzdXJlICcgK1xuICAgICAgICAnQXRvbSBpcyBnZXR0aW5nICRQQVRIIGNvcnJlY3RseS4nXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKVxuICAgIH1cbiAgfVxuICByZXR1cm4gQ2FjaGUuTk9ERV9QUkVGSVhfUEFUSFxufVxuXG5mdW5jdGlvbiBpc0RpcmVjdG9yeShkaXJQYXRoKSB7XG4gIGxldCBpc0RpclxuICB0cnkge1xuICAgIGlzRGlyID0gZnMuc3RhdFN5bmMoZGlyUGF0aCkuaXNEaXJlY3RvcnkoKVxuICB9IGNhdGNoIChlKSB7XG4gICAgaXNEaXIgPSBmYWxzZVxuICB9XG4gIHJldHVybiBpc0RpclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZEVTTGludERpcmVjdG9yeShtb2R1bGVzRGlyLCBjb25maWcsIHByb2plY3RQYXRoKSB7XG4gIGxldCBlc2xpbnREaXIgPSBudWxsXG4gIGxldCBsb2NhdGlvblR5cGUgPSBudWxsXG4gIGlmIChjb25maWcudXNlR2xvYmFsRXNsaW50KSB7XG4gICAgbG9jYXRpb25UeXBlID0gJ2dsb2JhbCdcbiAgICBjb25zdCBwcmVmaXhQYXRoID0gY29uZmlnLmdsb2JhbE5vZGVQYXRoIHx8IGdldE5vZGVQcmVmaXhQYXRoKClcbiAgICAvLyBOUE0gb24gV2luZG93cyBhbmQgWWFybiBvbiBhbGwgcGxhdGZvcm1zXG4gICAgZXNsaW50RGlyID0gUGF0aC5qb2luKHByZWZpeFBhdGgsICdub2RlX21vZHVsZXMnLCAnZXNsaW50JylcbiAgICBpZiAoIWlzRGlyZWN0b3J5KGVzbGludERpcikpIHtcbiAgICAgIC8vIE5QTSBvbiBwbGF0Zm9ybXMgb3RoZXIgdGhhbiBXaW5kb3dzXG4gICAgICBlc2xpbnREaXIgPSBQYXRoLmpvaW4ocHJlZml4UGF0aCwgJ2xpYicsICdub2RlX21vZHVsZXMnLCAnZXNsaW50JylcbiAgICB9XG4gIH0gZWxzZSBpZiAoIWNvbmZpZy5hZHZhbmNlZExvY2FsTm9kZU1vZHVsZXMpIHtcbiAgICBsb2NhdGlvblR5cGUgPSAnbG9jYWwgcHJvamVjdCdcbiAgICBlc2xpbnREaXIgPSBQYXRoLmpvaW4obW9kdWxlc0RpciB8fCAnJywgJ2VzbGludCcpXG4gIH0gZWxzZSBpZiAoUGF0aC5pc0Fic29sdXRlKGNvbmZpZy5hZHZhbmNlZExvY2FsTm9kZU1vZHVsZXMpKSB7XG4gICAgbG9jYXRpb25UeXBlID0gJ2FkdmFuY2VkIHNwZWNpZmllZCdcbiAgICBlc2xpbnREaXIgPSBQYXRoLmpvaW4oY29uZmlnLmFkdmFuY2VkTG9jYWxOb2RlTW9kdWxlcyB8fCAnJywgJ2VzbGludCcpXG4gIH0gZWxzZSB7XG4gICAgbG9jYXRpb25UeXBlID0gJ2FkdmFuY2VkIHNwZWNpZmllZCdcbiAgICBlc2xpbnREaXIgPSBQYXRoLmpvaW4ocHJvamVjdFBhdGggfHwgJycsIGNvbmZpZy5hZHZhbmNlZExvY2FsTm9kZU1vZHVsZXMsICdlc2xpbnQnKVxuICB9XG4gIGlmIChpc0RpcmVjdG9yeShlc2xpbnREaXIpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhdGg6IGVzbGludERpcixcbiAgICAgIHR5cGU6IGxvY2F0aW9uVHlwZSxcbiAgICB9XG4gIH0gZWxzZSBpZiAoY29uZmlnLnVzZUdsb2JhbEVzbGludCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRVNMaW50IG5vdCBmb3VuZCwgcGxlYXNlIGVuc3VyZSB0aGUgZ2xvYmFsIE5vZGUgcGF0aCBpcyBzZXQgY29ycmVjdGx5LicpXG4gIH1cbiAgcmV0dXJuIHtcbiAgICBwYXRoOiBDYWNoZS5FU0xJTlRfTE9DQUxfUEFUSCxcbiAgICB0eXBlOiAnYnVuZGxlZCBmYWxsYmFjaycsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVTTGludEZyb21EaXJlY3RvcnkobW9kdWxlc0RpciwgY29uZmlnLCBwcm9qZWN0UGF0aCkge1xuICBjb25zdCB7IHBhdGg6IEVTTGludERpcmVjdG9yeSB9ID0gZmluZEVTTGludERpcmVjdG9yeShtb2R1bGVzRGlyLCBjb25maWcsIHByb2plY3RQYXRoKVxuICB0cnkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZHluYW1pYy1yZXF1aXJlXG4gICAgcmV0dXJuIHJlcXVpcmUoRVNMaW50RGlyZWN0b3J5KVxuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGNvbmZpZy51c2VHbG9iYWxFc2xpbnQgJiYgZS5jb2RlID09PSAnTU9EVUxFX05PVF9GT1VORCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRVNMaW50IG5vdCBmb3VuZCwgdHJ5IHJlc3RhcnRpbmcgQXRvbSB0byBjbGVhciBjYWNoZXMuJylcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmVcbiAgICByZXR1cm4gcmVxdWlyZShDYWNoZS5FU0xJTlRfTE9DQUxfUEFUSClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVmcmVzaE1vZHVsZXNQYXRoKG1vZHVsZXNEaXIpIHtcbiAgaWYgKENhY2hlLkxBU1RfTU9EVUxFU19QQVRIICE9PSBtb2R1bGVzRGlyKSB7XG4gICAgQ2FjaGUuTEFTVF9NT0RVTEVTX1BBVEggPSBtb2R1bGVzRGlyXG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9QQVRIID0gbW9kdWxlc0RpciB8fCAnJ1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlcnNjb3JlLWRhbmdsZVxuICAgIHJlcXVpcmUoJ21vZHVsZScpLk1vZHVsZS5faW5pdFBhdGhzKClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RVNMaW50SW5zdGFuY2UoZmlsZURpciwgY29uZmlnLCBwcm9qZWN0UGF0aCkge1xuICBjb25zdCBtb2R1bGVzRGlyID0gUGF0aC5kaXJuYW1lKGZpbmRDYWNoZWQoZmlsZURpciwgJ25vZGVfbW9kdWxlcy9lc2xpbnQnKSB8fCAnJylcbiAgcmVmcmVzaE1vZHVsZXNQYXRoKG1vZHVsZXNEaXIpXG4gIHJldHVybiBnZXRFU0xpbnRGcm9tRGlyZWN0b3J5KG1vZHVsZXNEaXIsIGNvbmZpZywgcHJvamVjdFBhdGgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWdQYXRoKGZpbGVEaXIpIHtcbiAgY29uc3QgY29uZmlnRmlsZSA9XG4gICAgZmluZENhY2hlZChmaWxlRGlyLCBbXG4gICAgICAnLmVzbGludHJjLmpzJywgJy5lc2xpbnRyYy55YW1sJywgJy5lc2xpbnRyYy55bWwnLCAnLmVzbGludHJjLmpzb24nLCAnLmVzbGludHJjJywgJ3BhY2thZ2UuanNvbidcbiAgICBdKVxuICBpZiAoY29uZmlnRmlsZSkge1xuICAgIGlmIChQYXRoLmJhc2VuYW1lKGNvbmZpZ0ZpbGUpID09PSAncGFja2FnZS5qc29uJykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmVcbiAgICAgIGlmIChyZXF1aXJlKGNvbmZpZ0ZpbGUpLmVzbGludENvbmZpZykge1xuICAgICAgICByZXR1cm4gY29uZmlnRmlsZVxuICAgICAgfVxuICAgICAgLy8gSWYgd2UgYXJlIGhlcmUsIHdlIGZvdW5kIGEgcGFja2FnZS5qc29uIHdpdGhvdXQgYW4gZXNsaW50IGNvbmZpZ1xuICAgICAgLy8gaW4gYSBkaXIgd2l0aG91dCBhbnkgb3RoZXIgZXNsaW50IGNvbmZpZyBmaWxlc1xuICAgICAgLy8gKGJlY2F1c2UgJ3BhY2thZ2UuanNvbicgaXMgbGFzdCBpbiB0aGUgY2FsbCB0byBmaW5kQ2FjaGVkKVxuICAgICAgLy8gU28sIGtlZXAgbG9va2luZyBmcm9tIHRoZSBwYXJlbnQgZGlyZWN0b3J5XG4gICAgICByZXR1cm4gZ2V0Q29uZmlnUGF0aChQYXRoLnJlc29sdmUoUGF0aC5kaXJuYW1lKGNvbmZpZ0ZpbGUpLCAnLi4nKSlcbiAgICB9XG4gICAgcmV0dXJuIGNvbmZpZ0ZpbGVcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVsYXRpdmVQYXRoKGZpbGVEaXIsIGZpbGVQYXRoLCBjb25maWcsIHByb2plY3RQYXRoKSB7XG4gIGNvbnN0IGlnbm9yZUZpbGUgPSBjb25maWcuZGlzYWJsZUVzbGludElnbm9yZSA/IG51bGwgOiBmaW5kQ2FjaGVkKGZpbGVEaXIsICcuZXNsaW50aWdub3JlJylcblxuICAvLyBJZiB3ZSBjYW4gZmluZCBhbiAuZXNsaW50aWdub3JlIGZpbGUsIHdlIGNhbiBzZXQgY3dkIHRoZXJlXG4gIC8vIChiZWNhdXNlIHRoZXkgYXJlIGV4cGVjdGVkIHRvIGJlIGF0IHRoZSBwcm9qZWN0IHJvb3QpXG4gIGlmIChpZ25vcmVGaWxlKSB7XG4gICAgY29uc3QgaWdub3JlRGlyID0gUGF0aC5kaXJuYW1lKGlnbm9yZUZpbGUpXG4gICAgcHJvY2Vzcy5jaGRpcihpZ25vcmVEaXIpXG4gICAgcmV0dXJuIFBhdGgucmVsYXRpdmUoaWdub3JlRGlyLCBmaWxlUGF0aClcbiAgfVxuICAvLyBPdGhlcndpc2UsIHdlJ2xsIHNldCB0aGUgY3dkIHRvIHRoZSBhdG9tIHByb2plY3Qgcm9vdCBhcyBsb25nIGFzIHRoYXQgZXhpc3RzXG4gIGlmIChwcm9qZWN0UGF0aCkge1xuICAgIHByb2Nlc3MuY2hkaXIocHJvamVjdFBhdGgpXG4gICAgcmV0dXJuIFBhdGgucmVsYXRpdmUocHJvamVjdFBhdGgsIGZpbGVQYXRoKVxuICB9XG4gIC8vIElmIGFsbCBlbHNlIGZhaWxzLCB1c2UgdGhlIGZpbGUgbG9jYXRpb24gaXRzZWxmXG4gIHByb2Nlc3MuY2hkaXIoZmlsZURpcilcbiAgcmV0dXJuIFBhdGguYmFzZW5hbWUoZmlsZVBhdGgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDTElFbmdpbmVPcHRpb25zKHR5cGUsIGNvbmZpZywgcnVsZXMsIGZpbGVQYXRoLCBmaWxlRGlyLCBnaXZlbkNvbmZpZ1BhdGgpIHtcbiAgY29uc3QgY2xpRW5naW5lQ29uZmlnID0ge1xuICAgIHJ1bGVzLFxuICAgIGlnbm9yZTogIWNvbmZpZy5kaXNhYmxlRXNsaW50SWdub3JlLFxuICAgIHdhcm5JZ25vcmVkOiBmYWxzZSxcbiAgICBmaXg6IHR5cGUgPT09ICdmaXgnXG4gIH1cblxuICBjb25zdCBpZ25vcmVGaWxlID0gY29uZmlnLmRpc2FibGVFc2xpbnRJZ25vcmUgPyBudWxsIDogZmluZENhY2hlZChmaWxlRGlyLCAnLmVzbGludGlnbm9yZScpXG4gIGlmIChpZ25vcmVGaWxlKSB7XG4gICAgY2xpRW5naW5lQ29uZmlnLmlnbm9yZVBhdGggPSBpZ25vcmVGaWxlXG4gIH1cblxuICBpZiAoY29uZmlnLmVzbGludFJ1bGVzRGlyKSB7XG4gICAgbGV0IHJ1bGVzRGlyID0gcmVzb2x2ZUVudihjb25maWcuZXNsaW50UnVsZXNEaXIpXG4gICAgaWYgKCFQYXRoLmlzQWJzb2x1dGUocnVsZXNEaXIpKSB7XG4gICAgICBydWxlc0RpciA9IGZpbmRDYWNoZWQoZmlsZURpciwgcnVsZXNEaXIpXG4gICAgfVxuICAgIGlmIChydWxlc0Rpcikge1xuICAgICAgY2xpRW5naW5lQ29uZmlnLnJ1bGVQYXRocyA9IFtydWxlc0Rpcl1cbiAgICB9XG4gIH1cblxuICBpZiAoZ2l2ZW5Db25maWdQYXRoID09PSBudWxsICYmIGNvbmZpZy5lc2xpbnRyY1BhdGgpIHtcbiAgICAvLyBJZiB3ZSBkaWRuJ3QgZmluZCBhIGNvbmZpZ3VyYXRpb24gdXNlIHRoZSBmYWxsYmFjayBmcm9tIHRoZSBzZXR0aW5nc1xuICAgIGNsaUVuZ2luZUNvbmZpZy5jb25maWdGaWxlID0gcmVzb2x2ZUVudihjb25maWcuZXNsaW50cmNQYXRoKVxuICB9XG5cbiAgcmV0dXJuIGNsaUVuZ2luZUNvbmZpZ1xufVxuIl19