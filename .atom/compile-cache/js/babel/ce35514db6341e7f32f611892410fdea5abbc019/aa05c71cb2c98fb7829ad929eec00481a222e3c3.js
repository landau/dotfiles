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
      throw new Error('Unable to execute `npm get prefix`. Please make sure Atom is getting $PATH correctly.');
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
    eslintDir = _path2['default'].join(projectPath, config.advancedLocalNodeModules, 'eslint');
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
    require('module').Module._initPaths();
  }
}

function getESLintInstance(fileDir, config, projectPath) {
  var modulesDir = _path2['default'].dirname((0, _atomLinter.findCached)(fileDir, 'node_modules/eslint') || '');
  refreshModulesPath(modulesDir);
  return getESLintFromDirectory(modulesDir, config, projectPath || '');
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

function getRelativePath(fileDir, filePath, config) {
  var ignoreFile = config.disableEslintIgnore ? null : (0, _atomLinter.findCached)(fileDir, '.eslintignore');

  if (ignoreFile) {
    var ignoreDir = _path2['default'].dirname(ignoreFile);
    process.chdir(ignoreDir);
    return _path2['default'].relative(ignoreDir, filePath);
  }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL3dvcmtlci1oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQUVpQixNQUFNOzs7O2tCQUNSLElBQUk7Ozs7NkJBQ00sZUFBZTs7OzswQkFDakIsYUFBYTs7OzswQkFDVCxhQUFhOzs4QkFDcEIsaUJBQWlCOzs7O0FBUHJDLFdBQVcsQ0FBQTs7QUFTWCxJQUFNLEtBQUssR0FBRztBQUNaLG1CQUFpQixFQUFFLGtCQUFLLFNBQVMsQ0FBQyxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdkYsa0JBQWdCLEVBQUUsSUFBSTtBQUN0QixtQkFBaUIsRUFBRSxJQUFJO0NBQ3hCLENBQUE7O0FBRU0sU0FBUyxpQkFBaUIsR0FBRztBQUNsQyxNQUFJLEtBQUssQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7QUFDbkMsUUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLEdBQUcsU0FBUyxHQUFHLEtBQUssQ0FBQTtBQUNuRSxRQUFJO0FBQ0YsV0FBSyxDQUFDLGdCQUFnQixHQUNwQiwyQkFBYSxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxFQUFFO0FBQ3BELFdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxrQ0FBUyxFQUFFLENBQUM7T0FDeEUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtLQUNqQyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsWUFBTSxJQUFJLEtBQUssQ0FDYix1RkFBdUYsQ0FDeEYsQ0FBQTtL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LENBQUE7S0FDekM7QUFDRCxRQUFJLFFBQVEsRUFBRTtBQUNaLHFCQUFlLENBQUMsU0FBUyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDdkM7R0FDRjs7QUFFRCxNQUFJLGVBQWUsS0FBSyxJQUFJLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRTs7QUFFbkQsbUJBQWUsQ0FBQyxVQUFVLEdBQUcsNkJBQVcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFBO0dBQzdEOztBQUVELFNBQU8sZUFBZSxDQUFBO0NBQ3ZCIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL3dvcmtlci1oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IFBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBDaGlsZFByb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2VzcydcbmltcG9ydCByZXNvbHZlRW52IGZyb20gJ3Jlc29sdmUtZW52J1xuaW1wb3J0IHsgZmluZENhY2hlZCB9IGZyb20gJ2F0b20tbGludGVyJ1xuaW1wb3J0IGdldFBhdGggZnJvbSAnY29uc2lzdGVudC1wYXRoJ1xuXG5jb25zdCBDYWNoZSA9IHtcbiAgRVNMSU5UX0xPQ0FMX1BBVEg6IFBhdGgubm9ybWFsaXplKFBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICdub2RlX21vZHVsZXMnLCAnZXNsaW50JykpLFxuICBOT0RFX1BSRUZJWF9QQVRIOiBudWxsLFxuICBMQVNUX01PRFVMRVNfUEFUSDogbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm9kZVByZWZpeFBhdGgoKSB7XG4gIGlmIChDYWNoZS5OT0RFX1BSRUZJWF9QQVRIID09PSBudWxsKSB7XG4gICAgY29uc3QgbnBtQ29tbWFuZCA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgPyAnbnBtLmNtZCcgOiAnbnBtJ1xuICAgIHRyeSB7XG4gICAgICBDYWNoZS5OT0RFX1BSRUZJWF9QQVRIID1cbiAgICAgICAgQ2hpbGRQcm9jZXNzLnNwYXduU3luYyhucG1Db21tYW5kLCBbJ2dldCcsICdwcmVmaXgnXSwge1xuICAgICAgICAgIGVudjogT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBwcm9jZXNzLmVudiksIHsgUEFUSDogZ2V0UGF0aCgpIH0pXG4gICAgICAgIH0pLm91dHB1dFsxXS50b1N0cmluZygpLnRyaW0oKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1VuYWJsZSB0byBleGVjdXRlIGBucG0gZ2V0IHByZWZpeGAuIFBsZWFzZSBtYWtlIHN1cmUgQXRvbSBpcyBnZXR0aW5nICRQQVRIIGNvcnJlY3RseS4nXG4gICAgICApXG4gICAgfVxuICB9XG4gIHJldHVybiBDYWNoZS5OT0RFX1BSRUZJWF9QQVRIXG59XG5cbmZ1bmN0aW9uIGlzRGlyZWN0b3J5KGRpclBhdGgpIHtcbiAgbGV0IGlzRGlyXG4gIHRyeSB7XG4gICAgaXNEaXIgPSBmcy5zdGF0U3luYyhkaXJQYXRoKS5pc0RpcmVjdG9yeSgpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpc0RpciA9IGZhbHNlXG4gIH1cbiAgcmV0dXJuIGlzRGlyXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kRVNMaW50RGlyZWN0b3J5KG1vZHVsZXNEaXIsIGNvbmZpZywgcHJvamVjdFBhdGgpIHtcbiAgbGV0IGVzbGludERpciA9IG51bGxcbiAgbGV0IGxvY2F0aW9uVHlwZSA9IG51bGxcbiAgaWYgKGNvbmZpZy51c2VHbG9iYWxFc2xpbnQpIHtcbiAgICBsb2NhdGlvblR5cGUgPSAnZ2xvYmFsJ1xuICAgIGNvbnN0IHByZWZpeFBhdGggPSBjb25maWcuZ2xvYmFsTm9kZVBhdGggfHwgZ2V0Tm9kZVByZWZpeFBhdGgoKVxuICAgIC8vIE5QTSBvbiBXaW5kb3dzIGFuZCBZYXJuIG9uIGFsbCBwbGF0Zm9ybXNcbiAgICBlc2xpbnREaXIgPSBQYXRoLmpvaW4ocHJlZml4UGF0aCwgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKVxuICAgIGlmICghaXNEaXJlY3RvcnkoZXNsaW50RGlyKSkge1xuICAgICAgLy8gTlBNIG9uIHBsYXRmb3JtcyBvdGhlciB0aGFuIFdpbmRvd3NcbiAgICAgIGVzbGludERpciA9IFBhdGguam9pbihwcmVmaXhQYXRoLCAnbGliJywgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKVxuICAgIH1cbiAgfSBlbHNlIGlmICghY29uZmlnLmFkdmFuY2VkTG9jYWxOb2RlTW9kdWxlcykge1xuICAgIGxvY2F0aW9uVHlwZSA9ICdsb2NhbCBwcm9qZWN0J1xuICAgIGVzbGludERpciA9IFBhdGguam9pbihtb2R1bGVzRGlyIHx8ICcnLCAnZXNsaW50JylcbiAgfSBlbHNlIGlmIChQYXRoLmlzQWJzb2x1dGUoY29uZmlnLmFkdmFuY2VkTG9jYWxOb2RlTW9kdWxlcykpIHtcbiAgICBsb2NhdGlvblR5cGUgPSAnYWR2YW5jZWQgc3BlY2lmaWVkJ1xuICAgIGVzbGludERpciA9IFBhdGguam9pbihjb25maWcuYWR2YW5jZWRMb2NhbE5vZGVNb2R1bGVzIHx8ICcnLCAnZXNsaW50JylcbiAgfSBlbHNlIHtcbiAgICBsb2NhdGlvblR5cGUgPSAnYWR2YW5jZWQgc3BlY2lmaWVkJ1xuICAgIGVzbGludERpciA9IFBhdGguam9pbihwcm9qZWN0UGF0aCwgY29uZmlnLmFkdmFuY2VkTG9jYWxOb2RlTW9kdWxlcywgJ2VzbGludCcpXG4gIH1cbiAgaWYgKGlzRGlyZWN0b3J5KGVzbGludERpcikpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGF0aDogZXNsaW50RGlyLFxuICAgICAgdHlwZTogbG9jYXRpb25UeXBlLFxuICAgIH1cbiAgfSBlbHNlIGlmIChjb25maWcudXNlR2xvYmFsRXNsaW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFU0xpbnQgbm90IGZvdW5kLCBwbGVhc2UgZW5zdXJlIHRoZSBnbG9iYWwgTm9kZSBwYXRoIGlzIHNldCBjb3JyZWN0bHkuJylcbiAgfVxuICByZXR1cm4ge1xuICAgIHBhdGg6IENhY2hlLkVTTElOVF9MT0NBTF9QQVRILFxuICAgIHR5cGU6ICdidW5kbGVkIGZhbGxiYWNrJyxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RVNMaW50RnJvbURpcmVjdG9yeShtb2R1bGVzRGlyLCBjb25maWcsIHByb2plY3RQYXRoKSB7XG4gIGNvbnN0IHsgcGF0aDogRVNMaW50RGlyZWN0b3J5IH0gPSBmaW5kRVNMaW50RGlyZWN0b3J5KG1vZHVsZXNEaXIsIGNvbmZpZywgcHJvamVjdFBhdGgpXG4gIHRyeSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmVcbiAgICByZXR1cm4gcmVxdWlyZShFU0xpbnREaXJlY3RvcnkpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoY29uZmlnLnVzZUdsb2JhbEVzbGludCAmJiBlLmNvZGUgPT09ICdNT0RVTEVfTk9UX0ZPVU5EJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFU0xpbnQgbm90IGZvdW5kLCB0cnkgcmVzdGFydGluZyBBdG9tIHRvIGNsZWFyIGNhY2hlcy4nKVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWR5bmFtaWMtcmVxdWlyZVxuICAgIHJldHVybiByZXF1aXJlKENhY2hlLkVTTElOVF9MT0NBTF9QQVRIKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWZyZXNoTW9kdWxlc1BhdGgobW9kdWxlc0Rpcikge1xuICBpZiAoQ2FjaGUuTEFTVF9NT0RVTEVTX1BBVEggIT09IG1vZHVsZXNEaXIpIHtcbiAgICBDYWNoZS5MQVNUX01PRFVMRVNfUEFUSCA9IG1vZHVsZXNEaXJcbiAgICBwcm9jZXNzLmVudi5OT0RFX1BBVEggPSBtb2R1bGVzRGlyIHx8ICcnXG4gICAgcmVxdWlyZSgnbW9kdWxlJykuTW9kdWxlLl9pbml0UGF0aHMoKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFU0xpbnRJbnN0YW5jZShmaWxlRGlyLCBjb25maWcsIHByb2plY3RQYXRoKSB7XG4gIGNvbnN0IG1vZHVsZXNEaXIgPSBQYXRoLmRpcm5hbWUoZmluZENhY2hlZChmaWxlRGlyLCAnbm9kZV9tb2R1bGVzL2VzbGludCcpIHx8ICcnKVxuICByZWZyZXNoTW9kdWxlc1BhdGgobW9kdWxlc0RpcilcbiAgcmV0dXJuIGdldEVTTGludEZyb21EaXJlY3RvcnkobW9kdWxlc0RpciwgY29uZmlnLCBwcm9qZWN0UGF0aCB8fCAnJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZ1BhdGgoZmlsZURpcikge1xuICBjb25zdCBjb25maWdGaWxlID1cbiAgICBmaW5kQ2FjaGVkKGZpbGVEaXIsIFtcbiAgICAgICcuZXNsaW50cmMuanMnLCAnLmVzbGludHJjLnlhbWwnLCAnLmVzbGludHJjLnltbCcsICcuZXNsaW50cmMuanNvbicsICcuZXNsaW50cmMnLCAncGFja2FnZS5qc29uJ1xuICAgIF0pXG4gIGlmIChjb25maWdGaWxlKSB7XG4gICAgaWYgKFBhdGguYmFzZW5hbWUoY29uZmlnRmlsZSkgPT09ICdwYWNrYWdlLmpzb24nKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWR5bmFtaWMtcmVxdWlyZVxuICAgICAgaWYgKHJlcXVpcmUoY29uZmlnRmlsZSkuZXNsaW50Q29uZmlnKSB7XG4gICAgICAgIHJldHVybiBjb25maWdGaWxlXG4gICAgICB9XG4gICAgICAvLyBJZiB3ZSBhcmUgaGVyZSwgd2UgZm91bmQgYSBwYWNrYWdlLmpzb24gd2l0aG91dCBhbiBlc2xpbnQgY29uZmlnXG4gICAgICAvLyBpbiBhIGRpciB3aXRob3V0IGFueSBvdGhlciBlc2xpbnQgY29uZmlnIGZpbGVzXG4gICAgICAvLyAoYmVjYXVzZSAncGFja2FnZS5qc29uJyBpcyBsYXN0IGluIHRoZSBjYWxsIHRvIGZpbmRDYWNoZWQpXG4gICAgICAvLyBTbywga2VlcCBsb29raW5nIGZyb20gdGhlIHBhcmVudCBkaXJlY3RvcnlcbiAgICAgIHJldHVybiBnZXRDb25maWdQYXRoKFBhdGgucmVzb2x2ZShQYXRoLmRpcm5hbWUoY29uZmlnRmlsZSksICcuLicpKVxuICAgIH1cbiAgICByZXR1cm4gY29uZmlnRmlsZVxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZWxhdGl2ZVBhdGgoZmlsZURpciwgZmlsZVBhdGgsIGNvbmZpZykge1xuICBjb25zdCBpZ25vcmVGaWxlID0gY29uZmlnLmRpc2FibGVFc2xpbnRJZ25vcmUgPyBudWxsIDogZmluZENhY2hlZChmaWxlRGlyLCAnLmVzbGludGlnbm9yZScpXG5cbiAgaWYgKGlnbm9yZUZpbGUpIHtcbiAgICBjb25zdCBpZ25vcmVEaXIgPSBQYXRoLmRpcm5hbWUoaWdub3JlRmlsZSlcbiAgICBwcm9jZXNzLmNoZGlyKGlnbm9yZURpcilcbiAgICByZXR1cm4gUGF0aC5yZWxhdGl2ZShpZ25vcmVEaXIsIGZpbGVQYXRoKVxuICB9XG4gIHByb2Nlc3MuY2hkaXIoZmlsZURpcilcbiAgcmV0dXJuIFBhdGguYmFzZW5hbWUoZmlsZVBhdGgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDTElFbmdpbmVPcHRpb25zKHR5cGUsIGNvbmZpZywgcnVsZXMsIGZpbGVQYXRoLCBmaWxlRGlyLCBnaXZlbkNvbmZpZ1BhdGgpIHtcbiAgY29uc3QgY2xpRW5naW5lQ29uZmlnID0ge1xuICAgIHJ1bGVzLFxuICAgIGlnbm9yZTogIWNvbmZpZy5kaXNhYmxlRXNsaW50SWdub3JlLFxuICAgIHdhcm5JZ25vcmVkOiBmYWxzZSxcbiAgICBmaXg6IHR5cGUgPT09ICdmaXgnXG4gIH1cblxuICBjb25zdCBpZ25vcmVGaWxlID0gY29uZmlnLmRpc2FibGVFc2xpbnRJZ25vcmUgPyBudWxsIDogZmluZENhY2hlZChmaWxlRGlyLCAnLmVzbGludGlnbm9yZScpXG4gIGlmIChpZ25vcmVGaWxlKSB7XG4gICAgY2xpRW5naW5lQ29uZmlnLmlnbm9yZVBhdGggPSBpZ25vcmVGaWxlXG4gIH1cblxuICBpZiAoY29uZmlnLmVzbGludFJ1bGVzRGlyKSB7XG4gICAgbGV0IHJ1bGVzRGlyID0gcmVzb2x2ZUVudihjb25maWcuZXNsaW50UnVsZXNEaXIpXG4gICAgaWYgKCFQYXRoLmlzQWJzb2x1dGUocnVsZXNEaXIpKSB7XG4gICAgICBydWxlc0RpciA9IGZpbmRDYWNoZWQoZmlsZURpciwgcnVsZXNEaXIpXG4gICAgfVxuICAgIGlmIChydWxlc0Rpcikge1xuICAgICAgY2xpRW5naW5lQ29uZmlnLnJ1bGVQYXRocyA9IFtydWxlc0Rpcl1cbiAgICB9XG4gIH1cblxuICBpZiAoZ2l2ZW5Db25maWdQYXRoID09PSBudWxsICYmIGNvbmZpZy5lc2xpbnRyY1BhdGgpIHtcbiAgICAvLyBJZiB3ZSBkaWRuJ3QgZmluZCBhIGNvbmZpZ3VyYXRpb24gdXNlIHRoZSBmYWxsYmFjayBmcm9tIHRoZSBzZXR0aW5nc1xuICAgIGNsaUVuZ2luZUNvbmZpZy5jb25maWdGaWxlID0gcmVzb2x2ZUVudihjb25maWcuZXNsaW50cmNQYXRoKVxuICB9XG5cbiAgcmV0dXJuIGNsaUVuZ2luZUNvbmZpZ1xufVxuIl19