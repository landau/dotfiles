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
      return new this.Promise((function(_this) {
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
            var _ref;
            if (options.path == null) {
              options.path = env.PATH;
            }
            if (_this.isWindows) {
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
      var help, ignoreReturnCode, _ref;
      _ref = _arg != null ? _arg : {}, ignoreReturnCode = _ref.ignoreReturnCode, help = _ref.help;
      args = _.flatten(args);
      return Promise.all([executable, Promise.all(args)]).then((function(_this) {
        return function(_arg1) {
          var args, exeName;
          exeName = _arg1[0], args = _arg1[1];
          _this.debug('exeName, args:', exeName, args);
          return new Promise(function(resolve, reject) {
            args = _.without(args, void 0);
            args = _.without(args, null);
            return Promise.all([_this.getShellEnvironment(), _this.which(exeName)]).then(function(_arg2) {
              var cmd, env, exe, exePath, options;
              env = _arg2[0], exePath = _arg2[1];
              _this.debug('exePath, env:', exePath, env);
              exe = exePath != null ? exePath : exeName;
              options = {
                env: env
              };
              return cmd = _this.spawn(exe, args, options).then(function(_arg3) {
                var err, returnCode, stderr, stdout, windowsProgramNotFoundMsg;
                returnCode = _arg3.returnCode, stdout = _arg3.stdout, stderr = _arg3.stderr;
                _this.verbose('spawn result', returnCode, stdout, stderr);
                if (!ignoreReturnCode && returnCode !== 0) {
                  err = new Error(stderr);
                  windowsProgramNotFoundMsg = "is not recognized as an internal or external command";
                  _this.verbose(stderr, windowsProgramNotFoundMsg);
                  if (_this.isWindows && returnCode === 1 && stderr.indexOf(windowsProgramNotFoundMsg) !== -1) {
                    err = _this.commandNotFoundError(exeName, help);
                  }
                  return reject(err);
                } else {
                  return resolve(stdout);
                }
              })["catch"](function(err) {
                _this.debug('error', err);
                if (err.code === 'ENOENT' || err.errno === 'ENOENT') {
                  return reject(_this.commandNotFoundError(exeName, help));
                } else {
                  return reject(err);
                }
              });
            });
          });
        };
      })(this));
    };


    /*
    Spawn
     */

    Beautifier.prototype.spawn = function(exe, args, options) {
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
          cmd.on('exit', function(returnCode) {
            _this.debug('spawn done', returnCode, stderr, stdout);
            return resolve({
              returnCode: returnCode,
              stdout: stdout,
              stderr: stderr
            });
          });
          return cmd.on('error', function(err) {
            _this.debug('error', err);
            return reject(err);
          });
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
