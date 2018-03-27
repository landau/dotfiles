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

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

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

/**
 * Takes a path and translates `~` to the user's home directory, and replaces
 * all environment variables with their value.
 * @param  {string} path The path to remove "strangeness" from
 * @return {string}      The cleaned path
 */
var cleanPath = function cleanPath(path) {
  return path ? (0, _resolveEnv2['default'])(_fsPlus2['default'].normalize(path)) : '';
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
    isDir = _fsPlus2['default'].statSync(dirPath).isDirectory();
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
    var configGlobal = cleanPath(config.globalNodePath);
    var prefixPath = configGlobal || getNodePrefixPath();
    // NPM on Windows and Yarn on all platforms
    eslintDir = _path2['default'].join(prefixPath, 'node_modules', 'eslint');
    if (!isDirectory(eslintDir)) {
      // NPM on platforms other than Windows
      eslintDir = _path2['default'].join(prefixPath, 'lib', 'node_modules', 'eslint');
    }
  } else if (!config.advancedLocalNodeModules) {
    locationType = 'local project';
    eslintDir = _path2['default'].join(modulesDir || '', 'eslint');
  } else if (_path2['default'].isAbsolute(cleanPath(config.advancedLocalNodeModules))) {
    locationType = 'advanced specified';
    eslintDir = _path2['default'].join(cleanPath(config.advancedLocalNodeModules), 'eslint');
  } else {
    locationType = 'advanced specified';
    eslintDir = _path2['default'].join(projectPath || '', cleanPath(config.advancedLocalNodeModules), 'eslint');
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

  cliEngineConfig.rulePaths = config.eslintRulesDirs.map(function (path) {
    var rulesDir = cleanPath(path);
    if (!_path2['default'].isAbsolute(rulesDir)) {
      return (0, _atomLinter.findCached)(fileDir, rulesDir);
    }
    return rulesDir;
  }).filter(function (path) {
    return path;
  });

  if (givenConfigPath === null && config.eslintrcPath) {
    // If we didn't find a configuration use the fallback from the settings
    cliEngineConfig.configFile = cleanPath(config.eslintrcPath);
  }

  return cliEngineConfig;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL3dvcmtlci1oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQUVpQixNQUFNOzs7O3NCQUNSLFNBQVM7Ozs7NkJBQ0MsZUFBZTs7OzswQkFDakIsYUFBYTs7OzswQkFDVCxhQUFhOzs4QkFDcEIsaUJBQWlCOzs7O0FBUHJDLFdBQVcsQ0FBQTs7QUFTWCxJQUFNLEtBQUssR0FBRztBQUNaLG1CQUFpQixFQUFFLGtCQUFLLFNBQVMsQ0FBQyxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdkYsa0JBQWdCLEVBQUUsSUFBSTtBQUN0QixtQkFBaUIsRUFBRSxJQUFJO0NBQ3hCLENBQUE7Ozs7Ozs7O0FBUUQsSUFBTSxTQUFTLEdBQUcsU0FBWixTQUFTLENBQUcsSUFBSTtTQUFLLElBQUksR0FBRyw2QkFBVyxvQkFBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFO0NBQUMsQ0FBQTs7QUFFL0QsU0FBUyxpQkFBaUIsR0FBRztBQUNsQyxNQUFJLEtBQUssQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7QUFDbkMsUUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLEdBQUcsU0FBUyxHQUFHLEtBQUssQ0FBQTtBQUNuRSxRQUFJO0FBQ0YsV0FBSyxDQUFDLGdCQUFnQixHQUNwQiwyQkFBYSxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxFQUFFO0FBQ3BELFdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxrQ0FBUyxFQUFFLENBQUM7T0FDeEUsQ0FBQyxD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QkFBbUI7QUFDbkMsZUFBVyxFQUFFLEtBQUs7QUFDbEIsT0FBRyxFQUFFLElBQUksS0FBSyxLQUFLO0dBQ3BCLENBQUE7O0FBRUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixHQUFHLElBQUksR0FBRyw0QkFBVyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUE7QUFDM0YsTUFBSSxVQUFVLEVBQUU7QUFDZCxtQkFBZSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7R0FDeEM7O0FBRUQsaUJBQWUsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDL0QsUUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2hDLFFBQUksQ0FBQyxrQkFBSyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDOUIsYUFBTyw0QkFBVyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDckM7QUFDRCxXQUFPLFFBQVEsQ0FBQTtHQUNoQixDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSTtXQUFJLElBQUk7R0FBQSxDQUFDLENBQUE7O0FBRXZCLE1BQUksZUFBZSxLQUFLLElBQUksSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFOztBQUVuRCxtQkFBZSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFBO0dBQzVEOztBQUVELFNBQU8sZUFBZSxDQUFBO0NBQ3ZCIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL3dvcmtlci1oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IFBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBmcyBmcm9tICdmcy1wbHVzJ1xuaW1wb3J0IENoaWxkUHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0IHJlc29sdmVFbnYgZnJvbSAncmVzb2x2ZS1lbnYnXG5pbXBvcnQgeyBmaW5kQ2FjaGVkIH0gZnJvbSAnYXRvbS1saW50ZXInXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICdjb25zaXN0ZW50LXBhdGgnXG5cbmNvbnN0IENhY2hlID0ge1xuICBFU0xJTlRfTE9DQUxfUEFUSDogUGF0aC5ub3JtYWxpemUoUGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKSksXG4gIE5PREVfUFJFRklYX1BBVEg6IG51bGwsXG4gIExBU1RfTU9EVUxFU19QQVRIOiBudWxsXG59XG5cbi8qKlxuICogVGFrZXMgYSBwYXRoIGFuZCB0cmFuc2xhdGVzIGB+YCB0byB0aGUgdXNlcidzIGhvbWUgZGlyZWN0b3J5LCBhbmQgcmVwbGFjZXNcbiAqIGFsbCBlbnZpcm9ubWVudCB2YXJpYWJsZXMgd2l0aCB0aGVpciB2YWx1ZS5cbiAqIEBwYXJhbSAge3N0cmluZ30gcGF0aCBUaGUgcGF0aCB0byByZW1vdmUgXCJzdHJhbmdlbmVzc1wiIGZyb21cbiAqIEByZXR1cm4ge3N0cmluZ30gICAgICBUaGUgY2xlYW5lZCBwYXRoXG4gKi9cbmNvbnN0IGNsZWFuUGF0aCA9IHBhdGggPT4gKHBhdGggPyByZXNvbHZlRW52KGZzLm5vcm1hbGl6ZShwYXRoKSkgOiAnJylcblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vZGVQcmVmaXhQYXRoKCkge1xuICBpZiAoQ2FjaGUuTk9ERV9QUkVGSVhfUEFUSCA9PT0gbnVsbCkge1xuICAgIGNvbnN0IG5wbUNvbW1hbmQgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gJ25wbS5jbWQnIDogJ25wbSdcbiAgICB0cnkge1xuICAgICAgQ2FjaGUuTk9ERV9QUkVGSVhfUEFUSCA9XG4gICAgICAgIENoaWxkUHJvY2Vzcy5zcGF3blN5bmMobnBtQ29tbWFuZCwgWydnZXQnLCAncHJlZml4J10sIHtcbiAgICAgICAgICBlbnY6IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcHJvY2Vzcy5lbnYpLCB7IFBBVEg6IGdldFBhdGgoKSB9KVxuICAgICAgICB9KS5vdXRwdXRbMV0udG9TdHJpbmcoKS50cmltKClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zdCBlcnJNc2cgPSAnVW5hYmxlIHRvIGV4ZWN1dGUgYG5wbSBnZXQgcHJlZml4YC4gUGxlYXNlIG1ha2Ugc3VyZSAnICtcbiAgICAgICAgJ0F0b20gaXMgZ2V0dGluZyAkUEFUSCBjb3JyZWN0bHkuJ1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZylcbiAgICB9XG4gIH1cbiAgcmV0dXJuIENhY2hlLk5PREVfUFJFRklYX1BBVEhcbn1cblxuZnVuY3Rpb24gaXNEaXJlY3RvcnkoZGlyUGF0aCkge1xuICBsZXQgaXNEaXJcbiAgdHJ5IHtcbiAgICBpc0RpciA9IGZzLnN0YXRTeW5jKGRpclBhdGgpLmlzRGlyZWN0b3J5KClcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlzRGlyID0gZmFsc2VcbiAgfVxuICByZXR1cm4gaXNEaXJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRFU0xpbnREaXJlY3RvcnkobW9kdWxlc0RpciwgY29uZmlnLCBwcm9qZWN0UGF0aCkge1xuICBsZXQgZXNsaW50RGlyID0gbnVsbFxuICBsZXQgbG9jYXRpb25UeXBlID0gbnVsbFxuICBpZiAoY29uZmlnLnVzZUdsb2JhbEVzbGludCkge1xuICAgIGxvY2F0aW9uVHlwZSA9ICdnbG9iYWwnXG4gICAgY29uc3QgY29uZmlnR2xvYmFsID0gY2xlYW5QYXRoKGNvbmZpZy5nbG9iYWxOb2RlUGF0aClcbiAgICBjb25zdCBwcmVmaXhQYXRoID0gY29uZmlnR2xvYmFsIHx8IGdldE5vZGVQcmVmaXhQYXRoKClcbiAgICAvLyBOUE0gb24gV2luZG93cyBhbmQgWWFybiBvbiBhbGwgcGxhdGZvcm1zXG4gICAgZXNsaW50RGlyID0gUGF0aC5qb2luKHByZWZpeFBhdGgsICdub2RlX21vZHVsZXMnLCAnZXNsaW50JylcbiAgICBpZiAoIWlzRGlyZWN0b3J5KGVzbGludERpcikpIHtcbiAgICAgIC8vIE5QTSBvbiBwbGF0Zm9ybXMgb3RoZXIgdGhhbiBXaW5kb3dzXG4gICAgICBlc2xpbnREaXIgPSBQYXRoLmpvaW4ocHJlZml4UGF0aCwgJ2xpYicsICdub2RlX21vZHVsZXMnLCAnZXNsaW50JylcbiAgICB9XG4gIH0gZWxzZSBpZiAoIWNvbmZpZy5hZHZhbmNlZExvY2FsTm9kZU1vZHVsZXMpIHtcbiAgICBsb2NhdGlvblR5cGUgPSAnbG9jYWwgcHJvamVjdCdcbiAgICBlc2xpbnREaXIgPSBQYXRoLmpvaW4obW9kdWxlc0RpciB8fCAnJywgJ2VzbGludCcpXG4gIH0gZWxzZSBpZiAoUGF0aC5pc0Fic29sdXRlKGNsZWFuUGF0aChjb25maWcuYWR2YW5jZWRMb2NhbE5vZGVNb2R1bGVzKSkpIHtcbiAgICBsb2NhdGlvblR5cGUgPSAnYWR2YW5jZWQgc3BlY2lmaWVkJ1xuICAgIGVzbGludERpciA9IFBhdGguam9pbihjbGVhblBhdGgoY29uZmlnLmFkdmFuY2VkTG9jYWxOb2RlTW9kdWxlcyksICdlc2xpbnQnKVxuICB9IGVsc2Uge1xuICAgIGxvY2F0aW9uVHlwZSA9ICdhZHZhbmNlZCBzcGVjaWZpZWQnXG4gICAgZXNsaW50RGlyID0gUGF0aC5qb2luKHByb2plY3RQYXRoIHx8ICcnLCBjbGVhblBhdGgoY29uZmlnLmFkdmFuY2VkTG9jYWxOb2RlTW9kdWxlcyksICdlc2xpbnQnKVxuICB9XG4gIGlmIChpc0RpcmVjdG9yeShlc2xpbnREaXIpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhdGg6IGVzbGludERpcixcbiAgICAgIHR5cGU6IGxvY2F0aW9uVHlwZSxcbiAgICB9XG4gIH0gZWxzZSBpZiAoY29uZmlnLnVzZUdsb2JhbEVzbGludCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRVNMaW50IG5vdCBmb3VuZCwgcGxlYXNlIGVuc3VyZSB0aGUgZ2xvYmFsIE5vZGUgcGF0aCBpcyBzZXQgY29ycmVjdGx5LicpXG4gIH1cbiAgcmV0dXJuIHtcbiAgICBwYXRoOiBDYWNoZS5FU0xJTlRfTE9DQUxfUEFUSCxcbiAgICB0eXBlOiAnYnVuZGxlZCBmYWxsYmFjaycsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVTTGludEZyb21EaXJlY3RvcnkobW9kdWxlc0RpciwgY29uZmlnLCBwcm9qZWN0UGF0aCkge1xuICBjb25zdCB7IHBhdGg6IEVTTGludERpcmVjdG9yeSB9ID0gZmluZEVTTGludERpcmVjdG9yeShtb2R1bGVzRGlyLCBjb25maWcsIHByb2plY3RQYXRoKVxuICB0cnkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZHluYW1pYy1yZXF1aXJlXG4gICAgcmV0dXJuIHJlcXVpcmUoRVNMaW50RGlyZWN0b3J5KVxuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGNvbmZpZy51c2VHbG9iYWxFc2xpbnQgJiYgZS5jb2RlID09PSAnTU9EVUxFX05PVF9GT1VORCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRVNMaW50IG5vdCBmb3VuZCwgdHJ5IHJlc3RhcnRpbmcgQXRvbSB0byBjbGVhciBjYWNoZXMuJylcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmVcbiAgICByZXR1cm4gcmVxdWlyZShDYWNoZS5FU0xJTlRfTE9DQUxfUEFUSClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVmcmVzaE1vZHVsZXNQYXRoKG1vZHVsZXNEaXIpIHtcbiAgaWYgKENhY2hlLkxBU1RfTU9EVUxFU19QQVRIICE9PSBtb2R1bGVzRGlyKSB7XG4gICAgQ2FjaGUuTEFTVF9NT0RVTEVTX1BBVEggPSBtb2R1bGVzRGlyXG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9QQVRIID0gbW9kdWxlc0RpciB8fCAnJ1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlcnNjb3JlLWRhbmdsZVxuICAgIHJlcXVpcmUoJ21vZHVsZScpLk1vZHVsZS5faW5pdFBhdGhzKClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RVNMaW50SW5zdGFuY2UoZmlsZURpciwgY29uZmlnLCBwcm9qZWN0UGF0aCkge1xuICBjb25zdCBtb2R1bGVzRGlyID0gUGF0aC5kaXJuYW1lKGZpbmRDYWNoZWQoZmlsZURpciwgJ25vZGVfbW9kdWxlcy9lc2xpbnQnKSB8fCAnJylcbiAgcmVmcmVzaE1vZHVsZXNQYXRoKG1vZHVsZXNEaXIpXG4gIHJldHVybiBnZXRFU0xpbnRGcm9tRGlyZWN0b3J5KG1vZHVsZXNEaXIsIGNvbmZpZywgcHJvamVjdFBhdGgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWdQYXRoKGZpbGVEaXIpIHtcbiAgY29uc3QgY29uZmlnRmlsZSA9XG4gICAgZmluZENhY2hlZChmaWxlRGlyLCBbXG4gICAgICAnLmVzbGludHJjLmpzJywgJy5lc2xpbnRyYy55YW1sJywgJy5lc2xpbnRyYy55bWwnLCAnLmVzbGludHJjLmpzb24nLCAnLmVzbGludHJjJywgJ3BhY2thZ2UuanNvbidcbiAgICBdKVxuICBpZiAoY29uZmlnRmlsZSkge1xuICAgIGlmIChQYXRoLmJhc2VuYW1lKGNvbmZpZ0ZpbGUpID09PSAncGFja2FnZS5qc29uJykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmVcbiAgICAgIGlmIChyZXF1aXJlKGNvbmZpZ0ZpbGUpLmVzbGludENvbmZpZykge1xuICAgICAgICByZXR1cm4gY29uZmlnRmlsZVxuICAgICAgfVxuICAgICAgLy8gSWYgd2UgYXJlIGhlcmUsIHdlIGZvdW5kIGEgcGFja2FnZS5qc29uIHdpdGhvdXQgYW4gZXNsaW50IGNvbmZpZ1xuICAgICAgLy8gaW4gYSBkaXIgd2l0aG91dCBhbnkgb3RoZXIgZXNsaW50IGNvbmZpZyBmaWxlc1xuICAgICAgLy8gKGJlY2F1c2UgJ3BhY2thZ2UuanNvbicgaXMgbGFzdCBpbiB0aGUgY2FsbCB0byBmaW5kQ2FjaGVkKVxuICAgICAgLy8gU28sIGtlZXAgbG9va2luZyBmcm9tIHRoZSBwYXJlbnQgZGlyZWN0b3J5XG4gICAgICByZXR1cm4gZ2V0Q29uZmlnUGF0aChQYXRoLnJlc29sdmUoUGF0aC5kaXJuYW1lKGNvbmZpZ0ZpbGUpLCAnLi4nKSlcbiAgICB9XG4gICAgcmV0dXJuIGNvbmZpZ0ZpbGVcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVsYXRpdmVQYXRoKGZpbGVEaXIsIGZpbGVQYXRoLCBjb25maWcsIHByb2plY3RQYXRoKSB7XG4gIGNvbnN0IGlnbm9yZUZpbGUgPSBjb25maWcuZGlzYWJsZUVzbGludElnbm9yZSA/IG51bGwgOiBmaW5kQ2FjaGVkKGZpbGVEaXIsICcuZXNsaW50aWdub3JlJylcblxuICAvLyBJZiB3ZSBjYW4gZmluZCBhbiAuZXNsaW50aWdub3JlIGZpbGUsIHdlIGNhbiBzZXQgY3dkIHRoZXJlXG4gIC8vIChiZWNhdXNlIHRoZXkgYXJlIGV4cGVjdGVkIHRvIGJlIGF0IHRoZSBwcm9qZWN0IHJvb3QpXG4gIGlmIChpZ25vcmVGaWxlKSB7XG4gICAgY29uc3QgaWdub3JlRGlyID0gUGF0aC5kaXJuYW1lKGlnbm9yZUZpbGUpXG4gICAgcHJvY2Vzcy5jaGRpcihpZ25vcmVEaXIpXG4gICAgcmV0dXJuIFBhdGgucmVsYXRpdmUoaWdub3JlRGlyLCBmaWxlUGF0aClcbiAgfVxuICAvLyBPdGhlcndpc2UsIHdlJ2xsIHNldCB0aGUgY3dkIHRvIHRoZSBhdG9tIHByb2plY3Qgcm9vdCBhcyBsb25nIGFzIHRoYXQgZXhpc3RzXG4gIGlmIChwcm9qZWN0UGF0aCkge1xuICAgIHByb2Nlc3MuY2hkaXIocHJvamVjdFBhdGgpXG4gICAgcmV0dXJuIFBhdGgucmVsYXRpdmUocHJvamVjdFBhdGgsIGZpbGVQYXRoKVxuICB9XG4gIC8vIElmIGFsbCBlbHNlIGZhaWxzLCB1c2UgdGhlIGZpbGUgbG9jYXRpb24gaXRzZWxmXG4gIHByb2Nlc3MuY2hkaXIoZmlsZURpcilcbiAgcmV0dXJuIFBhdGguYmFzZW5hbWUoZmlsZVBhdGgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDTElFbmdpbmVPcHRpb25zKHR5cGUsIGNvbmZpZywgcnVsZXMsIGZpbGVQYXRoLCBmaWxlRGlyLCBnaXZlbkNvbmZpZ1BhdGgpIHtcbiAgY29uc3QgY2xpRW5naW5lQ29uZmlnID0ge1xuICAgIHJ1bGVzLFxuICAgIGlnbm9yZTogIWNvbmZpZy5kaXNhYmxlRXNsaW50SWdub3JlLFxuICAgIHdhcm5JZ25vcmVkOiBmYWxzZSxcbiAgICBmaXg6IHR5cGUgPT09ICdmaXgnXG4gIH1cblxuICBjb25zdCBpZ25vcmVGaWxlID0gY29uZmlnLmRpc2FibGVFc2xpbnRJZ25vcmUgPyBudWxsIDogZmluZENhY2hlZChmaWxlRGlyLCAnLmVzbGludGlnbm9yZScpXG4gIGlmIChpZ25vcmVGaWxlKSB7XG4gICAgY2xpRW5naW5lQ29uZmlnLmlnbm9yZVBhdGggPSBpZ25vcmVGaWxlXG4gIH1cblxuICBjbGlFbmdpbmVDb25maWcucnVsZVBhdGhzID0gY29uZmlnLmVzbGludFJ1bGVzRGlycy5tYXAoKHBhdGgpID0+IHtcbiAgICBjb25zdCBydWxlc0RpciA9IGNsZWFuUGF0aChwYXRoKVxuICAgIGlmICghUGF0aC5pc0Fic29sdXRlKHJ1bGVzRGlyKSkge1xuICAgICAgcmV0dXJuIGZpbmRDYWNoZWQoZmlsZURpciwgcnVsZXNEaXIpXG4gICAgfVxuICAgIHJldHVybiBydWxlc0RpclxuICB9KS5maWx0ZXIocGF0aCA9PiBwYXRoKVxuXG4gIGlmIChnaXZlbkNvbmZpZ1BhdGggPT09IG51bGwgJiYgY29uZmlnLmVzbGludHJjUGF0aCkge1xuICAgIC8vIElmIHdlIGRpZG4ndCBmaW5kIGEgY29uZmlndXJhdGlvbiB1c2UgdGhlIGZhbGxiYWNrIGZyb20gdGhlIHNldHRpbmdzXG4gICAgY2xpRW5naW5lQ29uZmlnLmNvbmZpZ0ZpbGUgPSBjbGVhblBhdGgoY29uZmlnLmVzbGludHJjUGF0aClcbiAgfVxuXG4gIHJldHVybiBjbGlFbmdpbmVDb25maWdcbn1cbiJdfQ==