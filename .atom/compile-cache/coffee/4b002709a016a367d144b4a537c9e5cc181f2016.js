(function() {
  var Beautifier, Promise, fs, path, readFile, spawn, temp, which, _;

  Promise = require('bluebird');

  _ = require('lodash');

  fs = require('fs');

  temp = require('temp').track();

  readFile = Promise.promisify(fs.readFile);

  which = require('which');

  spawn = require('child_process').spawn;

  path = require('path');

  module.exports = Beautifier = (function() {

    /*
    Promise
     */
    Beautifier.prototype.Promise = Promise;


    /*
    Name of Beautifier
     */

    Beautifier.prototype.name = 'Beautifier';


    /*
    Supported Options
    
    Enable options for supported languages.
    - <string:language>:<boolean:all_options_enabled>
    - <string:language>:<string:option_key>:<boolean:enabled>
    - <string:language>:<string:option_key>:<string:rename>
    - <string:language>:<string:option_key>:<function:transform>
    - <string:language>:<string:option_key>:<array:mapper>
     */

    Beautifier.prototype.options = {};


    /*
    Supported languages by this Beautifier
    
    Extracted from the keys of the `options` field.
     */

    Beautifier.prototype.languages = null;


    /*
    Beautify text
    
    Override this method in subclasses
     */

    Beautifier.prototype.beautify = null;


    /*
    Show deprecation warning to user.
     */

    Beautifier.prototype.deprecate = function(warning) {
      var _ref;
      return (_ref = atom.notifications) != null ? _ref.addWarning(warning) : void 0;
    };


    /*
    Create temporary file
     */

    Beautifier.prototype.tempFile = function(name, contents, ext) {
      if (name == null) {
        name = "atom-beautify-temp";
      }
      if (contents == null) {
        contents = "";
      }
      if (ext == null) {
        ext = "";
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return temp.open({
            prefix: name,
            suffix: ext
          }, function(err, info) {
            _this.debug('tempFile', name, err, info);
            if (err) {
              return reject(err);
            }
            return fs.write(info.fd, contents, function(err) {
              if (err) {
                return reject(err);
              }
              return fs.close(info.fd, function(err) {
                if (err) {
                  return reject(err);
                }
                return resolve(info.path);
              });
            });
          });
        };
      })(this));
    };


    /*
    Read file
     */

    Beautifier.prototype.readFile = function(filePath) {
      return Promise.resolve(filePath).then(function(filePath) {
        return readFile(filePath, "utf8");
      });
    };


    /*
    Find file
     */

    Beautifier.prototype.findFile = function(startDir, fileNames) {
      var currentDir, fileName, filePath, _i, _len;
      if (!arguments.length) {
        throw new Error("Specify file names to find.");
      }
      if (!(fileNames instanceof Array)) {
        fileNames = [fileNames];
      }
      startDir = startDir.split(path.sep);
      while (startDir.length) {
        currentDir = startDir.join(path.sep);
        for (_i = 0, _len = fileNames.length; _i < _len; _i++) {
          fileName = fileNames[_i];
          filePath = path.join(currentDir, fileName);
          try {
            fs.accessSync(filePath, fs.R_OK);
            return filePath;
          } catch (_error) {}
        }
        startDir.pop();
      }
      return null;
    };


    /*
    If platform is Windows
     */

    Beautifier.prototype.isWindows = (function() {
      return new RegExp('^win').test(process.platform);
    })();


    /*
    Get Shell Environment variables
    
    Special thank you to @ioquatix
    See https://github.com/ioquatix/script-runner/blob/v1.5.0/lib/script-runner.coffee#L45-L63
     */

    Beautifier.prototype._envCache = null;

    Beautifier.prototype._envCacheDate = null;

    Beautifier.prototype._envCacheExpiry = 10000;

    Beautifier.prototype.getShellEnvironment = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var buffer, child;
          if ((_this._envCache != null) && (_this._envCacheDate != null)) {
            if ((new Date() - _this._envCacheDate) < _this._envCacheExpiry) {
              return resolve(_this._envCache);
            }
          }
          if (_this.isWindows) {
            return resolve(process.env);
          } else {
            child = spawn(process.env.SHELL, ['-ilc', 'env'], {
              detached: true,
              stdio: ['ignore', 'pipe', process.stderr]
            });
            buffer = '';
            child.stdout.on('data', function(data) {
              return buffer += data;
            });
            return child.on('close', function(code, signal) {
              var definition, environment, key, value, _i, _len, _ref, _ref1;
              if (code !== 0) {
                return reject(new Error("Could not get Shell Environment. Exit code: " + code + ", Signal: " + signal));
              }
              environment = {};
              _ref = buffer.split('\n');
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                definition = _ref[_i];
                _ref1 = definition.split('=', 2), key = _ref1[0], value = _ref1[1];
                if (key !== '') {
                  environment[key] = value;
                }
              }
              _this._envCache = environment;
              _this._envCacheDate = new Date();
              return resolve(environment);
            });
          }
        };
      })(this));
    };


    /*
    Like the unix which utility.
    
    Finds the first instance of a specified executable in the PATH environment variable.
    Does not cache the results,
    so hash -r is not needed when the PATH changes.
    See https://github.com/isaacs/node-which
     */

    Beautifier.prototype.which = function(exe, options) {
      if (options == null) {
        options = {};
      }
      return this.getShellEnvironment().then((function(_this) {
        return function(env) {
          return new Promise(function(resolve, reject) {
            var i, _ref;
            if (options.path == null) {
              options.path = env.PATH;
            }
            if (_this.isWindows) {
              if (!options.path) {
                for (i in env) {
                  if (i.toLowerCase() === "path") {
                    options.path = env[i];
                    break;
                  }
                }
              }
              if (options.pathExt == null) {
                options.pathExt = "" + ((_ref = process.env.PATHEXT) != null ? _ref : '.EXE') + ";";
              }
            }
            return which(exe, options, function(err, path) {
              if (err) {
                resolve(exe);
              }
              return resolve(path);
            });
          });
        };
      })(this));
    };


    /*
    Add help to error.description
    
    Note: error.description is not officially used in JavaScript,
    however it is used internally for Atom Beautify when displaying errors.
     */

    Beautifier.prototype.commandNotFoundError = function(exe, help) {
      var docsLink, er, helpStr, issueSearchLink, message;
      message = "Could not find '" + exe + "'. The program may not be installed.";
      er = new Error(message);
      er.code = 'CommandNotFound';
      er.errno = er.code;
      er.syscall = 'beautifier::run';
      er.file = exe;
      if (help != null) {
        if (typeof help === "object") {
          helpStr = "See " + help.link + " for program installation instructions.\n";
          if (help.pathOption) {
            helpStr += "You can configure Atom Beautify with the absolute path to '" + (help.program || exe) + "' by setting '" + help.pathOption + "' in the Atom Beautify package settings.\n";
          }
          if (help.additional) {
            helpStr += help.additional;
          }
          issueSearchLink = "https://github.com/Glavin001/atom-beautify/search?q=" + exe + "&type=Issues";
          docsLink = "https://github.com/Glavin001/atom-beautify/tree/master/docs";
          helpStr += "Your program is properly installed if running '" + (this.isWindows ? 'where.exe' : 'which') + " " + exe + "' in your " + (this.isWindows ? 'CMD prompt' : 'Terminal') + " returns an absolute path to the executable. If this does not work then you have not installed the program correctly and so Atom Beautify will not find the program. Atom Beautify requires that the program be found in your PATH environment variable. \nNote that this is not an Atom Beautify issue if beautification does not work and the above command also does not work: this is expected behaviour, since you have not properly installed your program. Please properly setup the program and search through existing Atom Beautify issues before creating a new issue. See " + issueSearchLink + " for related Issues and " + docsLink + " for documentation. If you are still unable to resolve this issue on your own then please create a new issue and ask for help.\n";
          er.description = helpStr;
        } else {
          er.description = help;
        }
      }
      return er;
    };


    /*
    Run command-line interface command
     */

    Beautifier.prototype.run = function(executable, args, _arg) {
      var cwd, help, ignoreReturnCode, onStdin, _ref;
      _ref = _arg != null ? _arg : {}, cwd = _ref.cwd, ignoreReturnCode = _ref.ignoreReturnCode, help = _ref.help, onStdin = _ref.onStdin;
      args = _.flatten(args);
      return Promise.all([executable, Promise.all(args)]).then((function(_this) {
        return function(_arg1) {
          var args, exeName;
          exeName = _arg1[0], args = _arg1[1];
          _this.debug('exeName, args:', exeName, args);
          return Promise.all([exeName, args, _this.getShellEnvironment(), _this.which(exeName)]);
        };
      })(this)).then((function(_this) {
        return function(_arg1) {
          var args, env, exe, exeName, exePath, options;
          exeName = _arg1[0], args = _arg1[1], env = _arg1[2], exePath = _arg1[3];
          _this.debug('exePath, env:', exePath, env);
          _this.debug('args', args);
          exe = exePath != null ? exePath : exeName;
          options = {
            cwd: cwd,
            env: env
          };
          return _this.spawn(exe, args, options, onStdin).then(function(_arg2) {
            var returnCode, stderr, stdout, windowsProgramNotFoundMsg;
            returnCode = _arg2.returnCode, stdout = _arg2.stdout, stderr = _arg2.stderr;
            _this.verbose('spawn result', returnCode, stdout, stderr);
            if (!ignoreReturnCode && returnCode !== 0) {
              windowsProgramNotFoundMsg = "is not recognized as an internal or external command";
              _this.verbose(stderr, windowsProgramNotFoundMsg);
              if (_this.isWindows && returnCode === 1 && stderr.indexOf(windowsProgramNotFoundMsg) !== -1) {
                throw _this.commandNotFoundError(exeName, help);
              } else {
                throw new Error(stderr);
              }
            } else {
              return stdout;
            }
          })["catch"](function(err) {
            _this.debug('error', err);
            if (err.code === 'ENOENT' || err.errno === 'ENOENT') {
              throw _this.commandNotFoundError(exeName, help);
            } else {
              throw err;
            }
          });
        };
      })(this));
    };


    /*
    Spawn
     */

    Beautifier.prototype.spawn = function(exe, args, options, onStdin) {
      args = _.without(args, void 0);
      args = _.without(args, null);
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var cmd, stderr, stdout;
          _this.debug('spawn', exe, args);
          cmd = spawn(exe, args, options);
          stdout = "";
          stderr = "";
          cmd.stdout.on('data', function(data) {
            return stdout += data;
          });
          cmd.stderr.on('data', function(data) {
            return stderr += data;
          });
          cmd.on('close', function(returnCode) {
            _this.debug('spawn done', returnCode, stderr, stdout);
            return resolve({
              returnCode: returnCode,
              stdout: stdout,
              stderr: stderr
            });
          });
          cmd.on('error', function(err) {
            _this.debug('error', err);
            return reject(err);
          });
          if (onStdin) {
            return onStdin(cmd.stdin);
          }
        };
      })(this));
    };


    /*
    Logger instance
     */

    Beautifier.prototype.logger = null;


    /*
    Initialize and configure Logger
     */

    Beautifier.prototype.setupLogger = function() {
      var key, method, _ref;
      this.logger = require('../logger')(__filename);
      _ref = this.logger;
      for (key in _ref) {
        method = _ref[key];
        this[key] = method;
      }
      return this.verbose("" + this.name + " beautifier logger has been initialized.");
    };


    /*
    Constructor to setup beautifer
     */

    function Beautifier() {
      var globalOptions, lang, options, _ref;
      this.setupLogger();
      if (this.options._ != null) {
        globalOptions = this.options._;
        delete this.options._;
        if (typeof globalOptions === "object") {
          _ref = this.options;
          for (lang in _ref) {
            options = _ref[lang];
            if (typeof options === "boolean") {
              if (options === true) {
                this.options[lang] = globalOptions;
              }
            } else if (typeof options === "object") {
              this.options[lang] = _.merge(globalOptions, options);
            } else {
              this.warn(("Unsupported options type " + (typeof options) + " for language " + lang + ": ") + options);
            }
          }
        }
      }
      this.verbose("Options for " + this.name + ":", this.options);
      this.languages = _.keys(this.options);
    }

    return Beautifier;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvYmVhdXRpZmllci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOERBQUE7O0FBQUEsRUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVIsQ0FBVixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBREosQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLEtBQWhCLENBQUEsQ0FIUCxDQUFBOztBQUFBLEVBSUEsUUFBQSxHQUFXLE9BQU8sQ0FBQyxTQUFSLENBQWtCLEVBQUUsQ0FBQyxRQUFyQixDQUpYLENBQUE7O0FBQUEsRUFLQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVIsQ0FMUixDQUFBOztBQUFBLEVBTUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxlQUFSLENBQXdCLENBQUMsS0FOakMsQ0FBQTs7QUFBQSxFQU9BLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQVBQLENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUVyQjtBQUFBOztPQUFBO0FBQUEseUJBR0EsT0FBQSxHQUFTLE9BSFQsQ0FBQTs7QUFLQTtBQUFBOztPQUxBOztBQUFBLHlCQVFBLElBQUEsR0FBTSxZQVJOLENBQUE7O0FBVUE7QUFBQTs7Ozs7Ozs7O09BVkE7O0FBQUEseUJBb0JBLE9BQUEsR0FBUyxFQXBCVCxDQUFBOztBQXNCQTtBQUFBOzs7O09BdEJBOztBQUFBLHlCQTJCQSxTQUFBLEdBQVcsSUEzQlgsQ0FBQTs7QUE2QkE7QUFBQTs7OztPQTdC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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/beautifiers/beautifier.coffee
