(function() {
  var Beautifier, Promise, _, fs, path, readFile, spawn, temp, which;

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
    Is the beautifier a command-line interface beautifier?
     */

    Beautifier.prototype.isPreInstalled = true;


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
      var ref;
      return (ref = atom.notifications) != null ? ref.addWarning(warning) : void 0;
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
      var currentDir, fileName, filePath, j, len;
      if (!arguments.length) {
        throw new Error("Specify file names to find.");
      }
      if (!(fileNames instanceof Array)) {
        fileNames = [fileNames];
      }
      startDir = startDir.split(path.sep);
      while (startDir.length) {
        currentDir = startDir.join(path.sep);
        for (j = 0, len = fileNames.length; j < len; j++) {
          fileName = fileNames[j];
          filePath = path.join(currentDir, fileName);
          try {
            fs.accessSync(filePath, fs.R_OK);
            return filePath;
          } catch (error) {}
        }
        startDir.pop();
      }
      return null;
    };

    Beautifier.prototype.getDefaultLineEnding = function(crlf, lf, optionEol) {
      if (!optionEol || optionEol === 'System Default') {
        optionEol = atom.config.get('line-ending-selector.defaultLineEnding');
      }
      switch (optionEol) {
        case 'LF':
          return lf;
        case 'CRLF':
          return crlf;
        case 'OS Default':
          if (process.platform === 'win32') {
            return crlf;
          } else {
            return lf;
          }
        default:
          return lf;
      }
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
              var definition, environment, j, key, len, ref, ref1, value;
              if (code !== 0) {
                return reject(new Error("Could not get Shell Environment. Exit code: " + code + ", Signal: " + signal));
              }
              environment = {};
              ref = buffer.split('\n');
              for (j = 0, len = ref.length; j < len; j++) {
                definition = ref[j];
                ref1 = definition.split('=', 2), key = ref1[0], value = ref1[1];
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
            var i, ref;
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
                options.pathExt = ((ref = process.env.PATHEXT) != null ? ref : '.EXE') + ";";
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

    Beautifier.prototype.run = function(executable, args, arg) {
      var cwd, help, ignoreReturnCode, onStdin, ref;
      ref = arg != null ? arg : {}, cwd = ref.cwd, ignoreReturnCode = ref.ignoreReturnCode, help = ref.help, onStdin = ref.onStdin;
      args = _.flatten(args);
      return Promise.all([executable, Promise.all(args)]).then((function(_this) {
        return function(arg1) {
          var args, exeName;
          exeName = arg1[0], args = arg1[1];
          _this.debug('exeName, args:', exeName, args);
          return Promise.all([exeName, args, _this.getShellEnvironment(), _this.which(exeName)]);
        };
      })(this)).then((function(_this) {
        return function(arg1) {
          var args, env, exe, exeName, exePath, options;
          exeName = arg1[0], args = arg1[1], env = arg1[2], exePath = arg1[3];
          _this.debug('exePath, env:', exePath, env);
          _this.debug('args', args);
          exe = exePath != null ? exePath : exeName;
          options = {
            cwd: cwd,
            env: env
          };
          return _this.spawn(exe, args, options, onStdin).then(function(arg2) {
            var returnCode, stderr, stdout, windowsProgramNotFoundMsg;
            returnCode = arg2.returnCode, stdout = arg2.stdout, stderr = arg2.stderr;
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
      var key, method, ref;
      this.logger = require('../logger')(__filename);
      ref = this.logger;
      for (key in ref) {
        method = ref[key];
        this[key] = method;
      }
      return this.verbose(this.name + " beautifier logger has been initialized.");
    };


    /*
    Constructor to setup beautifer
     */

    function Beautifier() {
      var globalOptions, lang, options, ref;
      this.setupLogger();
      if (this.options._ != null) {
        globalOptions = this.options._;
        delete this.options._;
        if (typeof globalOptions === "object") {
          ref = this.options;
          for (lang in ref) {
            options = ref[lang];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvYmVhdXRpZmllci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7RUFDVixDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0VBQ0osRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFlLENBQUMsS0FBaEIsQ0FBQTs7RUFDUCxRQUFBLEdBQVcsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsRUFBRSxDQUFDLFFBQXJCOztFQUNYLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUjs7RUFDUixLQUFBLEdBQVEsT0FBQSxDQUFRLGVBQVIsQ0FBd0IsQ0FBQzs7RUFDakMsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOztBQUVyQjs7O3lCQUdBLE9BQUEsR0FBUzs7O0FBRVQ7Ozs7eUJBR0EsSUFBQSxHQUFNOzs7QUFFTjs7Ozs7Ozs7Ozs7eUJBVUEsT0FBQSxHQUFTOzs7QUFFVDs7Ozt5QkFHQSxjQUFBLEdBQWdCOzs7QUFFaEI7Ozs7Ozt5QkFLQSxTQUFBLEdBQVc7OztBQUVYOzs7Ozs7eUJBS0EsUUFBQSxHQUFVOzs7QUFFVjs7Ozt5QkFHQSxTQUFBLEdBQVcsU0FBQyxPQUFEO0FBQ1QsVUFBQTtxREFBa0IsQ0FBRSxVQUFwQixDQUErQixPQUEvQjtJQURTOzs7QUFHWDs7Ozt5QkFHQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQThCLFFBQTlCLEVBQTZDLEdBQTdDOztRQUFDLE9BQU87OztRQUFzQixXQUFXOzs7UUFBSSxNQUFNOztBQUMzRCxhQUFXLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBO2VBQUEs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QSxJQUFGLEdBQU8sMENBQWxCO0lBUFc7OztBQVNiOzs7O0lBR2Esb0JBQUE7QUFFWCxVQUFBO01BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBQTtNQUVBLElBQUcsc0JBQUg7UUFDRSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxPQUFPLENBQUM7UUFDekIsT0FBTyxJQUFDLENBQUEsT0FBTyxDQUFDO1FBRWhCLElBQUcsT0FBTyxhQUFQLEtBQXdCLFFBQTNCO0FBRUU7QUFBQSxlQUFBLFdBQUE7O1lBRUUsSUFBRyxPQUFPLE9BQVAsS0FBa0IsU0FBckI7Y0FDRSxJQUFHLE9BQUEsS0FBVyxJQUFkO2dCQUNFLElBQUMsQ0FBQSxPQUFRLENBQUEsSUFBQSxDQUFULEdBQWlCLGNBRG5CO2VBREY7YUFBQSxNQUdLLElBQUcsT0FBTyxPQUFQLEtBQWtCLFFBQXJCO2NBQ0gsSUFBQyxDQUFBLE9BQVEsQ0FBQSxJQUFBLENBQVQsR0FBaUIsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxhQUFSLEVBQXVCLE9BQXZCLEVBRGQ7YUFBQSxNQUFBO2NBR0gsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFBLDJCQUFBLEdBQTJCLENBQUMsT0FBTyxPQUFSLENBQTNCLEdBQTJDLGdCQUEzQyxHQUEyRCxJQUEzRCxHQUFnRSxJQUFoRSxDQUFBLEdBQXFFLE9BQTNFLEVBSEc7O0FBTFAsV0FGRjtTQUpGOztNQWVBLElBQUMsQ0FBQSxPQUFELENBQVMsY0FBQSxHQUFlLElBQUMsQ0FBQSxJQUFoQixHQUFxQixHQUE5QixFQUFrQyxJQUFDLENBQUEsT0FBbkM7TUFFQSxJQUFDLENBQUEsU0FBRCxHQUFhLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLE9BQVI7SUFyQkY7Ozs7O0FBcllmIiwic291cmNlc0NvbnRlbnQiOlsiUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJylcbl8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuZnMgPSByZXF1aXJlKCdmcycpXG50ZW1wID0gcmVxdWlyZSgndGVtcCcpLnRyYWNrKClcbnJlYWRGaWxlID0gUHJvbWlzZS5wcm9taXNpZnkoZnMucmVhZEZpbGUpXG53aGljaCA9IHJlcXVpcmUoJ3doaWNoJylcbnNwYXduID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLnNwYXduXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQmVhdXRpZmllclxuXG4gICMjI1xuICBQcm9taXNlXG4gICMjI1xuICBQcm9taXNlOiBQcm9taXNlXG5cbiAgIyMjXG4gIE5hbWUgb2YgQmVhdXRpZmllclxuICAjIyNcbiAgbmFtZTogJ0JlYXV0aWZpZXInXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBPcHRpb25zXG5cbiAgRW5hYmxlIG9wdGlvbnMgZm9yIHN1cHBvcnRlZCBsYW5ndWFnZXMuXG4gIC0gPHN0cmluZzpsYW5ndWFnZT46PGJvb2xlYW46YWxsX29wdGlvbnNfZW5hYmxlZD5cbiAgLSA8c3RyaW5nOmxhbmd1YWdlPjo8c3RyaW5nOm9wdGlvbl9rZXk+Ojxib29sZWFuOmVuYWJsZWQ+XG4gIC0gPHN0cmluZzpsYW5ndWFnZT46PHN0cmluZzpvcHRpb25fa2V5Pjo8c3RyaW5nOnJlbmFtZT5cbiAgLSA8c3RyaW5nOmxhbmd1YWdlPjo8c3RyaW5nOm9wdGlvbl9rZXk+OjxmdW5jdGlvbjp0cmFuc2Zvcm0+XG4gIC0gPHN0cmluZzpsYW5ndWFnZT46PHN0cmluZzpvcHRpb25fa2V5Pjo8YXJyYXk6bWFwcGVyPlxuICAjIyNcbiAgb3B0aW9uczoge31cblxuICAjIyNcbiAgSXMgdGhlIGJlYXV0aWZpZXIgYSBjb21tYW5kLWxpbmUgaW50ZXJmYWNlIGJlYXV0aWZpZXI/XG4gICMjI1xuICBpc1ByZUluc3RhbGxlZDogdHJ1ZVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgbGFuZ3VhZ2VzIGJ5IHRoaXMgQmVhdXRpZmllclxuXG4gIEV4dHJhY3RlZCBmcm9tIHRoZSBrZXlzIG9mIHRoZSBgb3B0aW9uc2AgZmllbGQuXG4gICMjI1xuICBsYW5ndWFnZXM6IG51bGxcblxuICAjIyNcbiAgQmVhdXRpZnkgdGV4dFxuXG4gIE92ZXJyaWRlIHRoaXMgbWV0aG9kIGluIHN1YmNsYXNzZXNcbiAgIyMjXG4gIGJlYXV0aWZ5OiBudWxsXG5cbiAgIyMjXG4gIFNob3cgZGVwcmVjYXRpb24gd2FybmluZyB0byB1c2VyLlxuICAjIyNcbiAgZGVwcmVjYXRlOiAod2FybmluZykgLT5cbiAgICBhdG9tLm5vdGlmaWNhdGlvbnM/LmFkZFdhcm5pbmcod2FybmluZylcblxuICAjIyNcbiAgQ3JlYXRlIHRlbXBvcmFyeSBmaWxlXG4gICMjI1xuICB0ZW1wRmlsZTogKG5hbWUgPSBcImF0b20tYmVhdXRpZnktdGVtcFwiLCBjb250ZW50cyA9IFwiXCIsIGV4dCA9IFwiXCIpIC0+XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICAjIGNyZWF0ZSB0ZW1wIGZpbGVcbiAgICAgIHRlbXAub3Blbih7cHJlZml4OiBuYW1lLCBzdWZmaXg6IGV4dH0sIChlcnIsIGluZm8pID0+XG4gICAgICAgIEBkZWJ1ZygndGVtcEZpbGUnLCBuYW1lLCBlcnIsIGluZm8pXG4gICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcbiAgICAgICAgZnMud3JpdGUoaW5mby5mZCwgY29udGVudHMsIChlcnIpIC0+XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxuICAgICAgICAgIGZzLmNsb3NlKGluZm8uZmQsIChlcnIpIC0+XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXG4gICAgICAgICAgICByZXNvbHZlKGluZm8ucGF0aClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICApXG5cbiAgIyMjXG4gIFJlYWQgZmlsZVxuICAjIyNcbiAgcmVhZEZpbGU6IChmaWxlUGF0aCkgLT5cbiAgICBQcm9taXNlLnJlc29sdmUoZmlsZVBhdGgpXG4gICAgLnRoZW4oKGZpbGVQYXRoKSAtPlxuICAgICAgcmV0dXJuIHJlYWRGaWxlKGZpbGVQYXRoLCBcInV0ZjhcIilcbiAgICApXG5cbiAgIyMjXG4gIEZpbmQgZmlsZVxuICAjIyNcbiAgZmluZEZpbGU6IChzdGFydERpciwgZmlsZU5hbWVzKSAtPlxuICAgIHRocm93IG5ldyBFcnJvciBcIlNwZWNpZnkgZmlsZSBuYW1lcyB0byBmaW5kLlwiIHVubGVzcyBhcmd1bWVudHMubGVuZ3RoXG4gICAgdW5sZXNzIGZpbGVOYW1lcyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICBmaWxlTmFtZXMgPSBbZmlsZU5hbWVzXVxuICAgIHN0YXJ0RGlyID0gc3RhcnREaXIuc3BsaXQocGF0aC5zZXApXG4gICAgd2hpbGUgc3RhcnREaXIubGVuZ3RoXG4gICAgICBjdXJyZW50RGlyID0gc3RhcnREaXIuam9pbihwYXRoLnNlcClcbiAgICAgIGZvciBmaWxlTmFtZSBpbiBmaWxlTmFtZXNcbiAgICAgICAgZmlsZVBhdGggPSBwYXRoLmpvaW4oY3VycmVudERpciwgZmlsZU5hbWUpXG4gICAgICAgIHRyeVxuICAgICAgICAgIGZzLmFjY2Vzc1N5bmMoZmlsZVBhdGgsIGZzLlJfT0spXG4gICAgICAgICAgcmV0dXJuIGZpbGVQYXRoXG4gICAgICBzdGFydERpci5wb3AoKVxuICAgIHJldHVybiBudWxsXG5cbiMgUmV0cmlldmVzIHRoZSBkZWZhdWx0IGxpbmUgZW5kaW5nIGJhc2VkIHVwb24gdGhlIEF0b20gY29uZmlndXJhdGlvblxuICAjICBgbGluZS1lbmRpbmctc2VsZWN0b3IuZGVmYXVsdExpbmVFbmRpbmdgLiBJZiB0aGUgQXRvbSBjb25maWd1cmF0aW9uXG4gICMgIGluZGljYXRlcyBcIk9TIERlZmF1bHRcIiwgdGhlIGBwcm9jZXNzLnBsYXRmb3JtYCBpcyBxdWVyaWVkLCByZXR1cm5pbmdcbiAgIyAgQ1JMRiBmb3IgV2luZG93cyBzeXN0ZW1zIGFuZCBMRiBmb3IgYWxsIG90aGVyIHN5c3RlbXMuXG4gICMgQ29kZSBtb2RpZmllZCBmcm9tIGF0b20vbGluZS1lbmRpbmctc2VsZWN0b3JcbiAgIyByZXR1cm5zOiBUaGUgY29ycmVjdCBsaW5lLWVuZGluZyBjaGFyYWN0ZXIgc2VxdWVuY2UgYmFzZWQgdXBvbiB0aGUgQXRvbVxuICAjICBjb25maWd1cmF0aW9uLCBvciBgbnVsbGAgaWYgdGhlIEF0b20gbGluZSBlbmRpbmcgY29uZmlndXJhdGlvbiB3YXMgbm90XG4gICMgIHJlY29nbml6ZWQuXG4gICMgc2VlOiBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9saW5lLWVuZGluZy1zZWxlY3Rvci9ibG9iL21hc3Rlci9saWIvbWFpbi5qc1xuICBnZXREZWZhdWx0TGluZUVuZGluZzogKGNybGYsbGYsb3B0aW9uRW9sKSAtPlxuICAgIGlmICghb3B0aW9uRW9sIHx8IG9wdGlvbkVvbCA9PSAnU3lzdGVtIERlZmF1bHQnKVxuICAgICAgb3B0aW9uRW9sID0gYXRvbS5jb25maWcuZ2V0KCdsaW5lLWVuZGluZy1zZWxlY3Rvci5kZWZhdWx0TGluZUVuZGluZycpXG4gICAgc3dpdGNoIG9wdGlvbkVvbFxuICAgICAgd2hlbiAnTEYnXG4gICAgICAgIHJldHVybiBsZlxuICAgICAgd2hlbiAnQ1JMRidcbiAgICAgICAgcmV0dXJuIGNybGZcbiAgICAgIHdoZW4gJ09TIERlZmF1bHQnXG4gICAgICAgIHJldHVybiBpZiBwcm9jZXNzLnBsYXRmb3JtIGlzICd3aW4zMicgdGhlbiBjcmxmIGVsc2UgbGZcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGxmXG5cbiAgIyMjXG4gIElmIHBsYXRmb3JtIGlzIFdpbmRvd3NcbiAgIyMjXG4gIGlzV2luZG93czogZG8gLT5cbiAgICByZXR1cm4gbmV3IFJlZ0V4cCgnXndpbicpLnRlc3QocHJvY2Vzcy5wbGF0Zm9ybSlcblxuICAjIyNcbiAgR2V0IFNoZWxsIEVudmlyb25tZW50IHZhcmlhYmxlc1xuXG4gIFNwZWNpYWwgdGhhbmsgeW91IHRvIEBpb3F1YXRpeFxuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2lvcXVhdGl4L3NjcmlwdC1ydW5uZXIvYmxvYi92MS41LjAvbGliL3NjcmlwdC1ydW5uZXIuY29mZmVlI0w0NS1MNjNcbiAgIyMjXG4gIF9lbnZDYWNoZTogbnVsbFxuICBfZW52Q2FjaGVEYXRlOiBudWxsXG4gIF9lbnZDYWNoZUV4cGlyeTogMTAwMDAgIyAxMCBzZWNvbmRzXG4gIGdldFNoZWxsRW52aXJvbm1lbnQ6IC0+XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICAjIENoZWNrIENhY2hlXG4gICAgICBpZiBAX2VudkNhY2hlPyBhbmQgQF9lbnZDYWNoZURhdGU/XG4gICAgICAgICMgQ2hlY2sgaWYgQ2FjaGUgaXMgb2xkXG4gICAgICAgIGlmIChuZXcgRGF0ZSgpIC0gQF9lbnZDYWNoZURhdGUpIDwgQF9lbnZDYWNoZUV4cGlyeVxuICAgICAgICAgICMgU3RpbGwgZnJlc2hcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShAX2VudkNhY2hlKVxuXG4gICAgICAjIENoZWNrIGlmIFdpbmRvd3NcbiAgICAgIGlmIEBpc1dpbmRvd3NcbiAgICAgICAgIyBXaW5kb3dzXG4gICAgICAgICMgVXNlIGRlZmF1bHRcbiAgICAgICAgcmVzb2x2ZShwcm9jZXNzLmVudilcbiAgICAgIGVsc2VcbiAgICAgICAgIyBNYWMgJiBMaW51eFxuICAgICAgICAjIEkgdHJpZWQgdXNpbmcgQ2hpbGRQcm9jZXNzLmV4ZWNGaWxlIGJ1dCB0aGVyZSBpcyBubyB3YXkgdG8gc2V0IGRldGFjaGVkIGFuZFxuICAgICAgICAjIHRoaXMgY2F1c2VzIHRoZSBjaGlsZCBzaGVsbCB0byBsb2NrIHVwLlxuICAgICAgICAjIFRoaXMgY29tbWFuZCBydW5zIGFuIGludGVyYWN0aXZlIGxvZ2luIHNoZWxsIGFuZFxuICAgICAgICAjIGV4ZWN1dGVzIHRoZSBleHBvcnQgY29tbWFuZCB0byBnZXQgYSBsaXN0IG9mIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbiAgICAgICAgIyBXZSB0aGVuIHVzZSB0aGVzZSB0byBydW4gdGhlIHNjcmlwdDpcbiAgICAgICAgY2hpbGQgPSBzcGF3biBwcm9jZXNzLmVudi5TSEVMTCwgWyctaWxjJywgJ2VudiddLFxuICAgICAgICAgICMgVGhpcyBpcyBlc3NlbnRpYWwgZm9yIGludGVyYWN0aXZlIHNoZWxscywgb3RoZXJ3aXNlIGl0IG5ldmVyIGZpbmlzaGVzOlxuICAgICAgICAgIGRldGFjaGVkOiB0cnVlLFxuICAgICAgICAgICMgV2UgZG9uJ3QgY2FyZSBhYm91dCBzdGRpbiwgc3RkZXJyIGNhbiBnbyBvdXQgdGhlIHVzdWFsIHdheTpcbiAgICAgICAgICBzdGRpbzogWydpZ25vcmUnLCAncGlwZScsIHByb2Nlc3Muc3RkZXJyXVxuICAgICAgICAjIFdlIGJ1ZmZlciBzdGRvdXQ6XG4gICAgICAgIGJ1ZmZlciA9ICcnXG4gICAgICAgIGNoaWxkLnN0ZG91dC5vbiAnZGF0YScsIChkYXRhKSAtPiBidWZmZXIgKz0gZGF0YVxuICAgICAgICAjIFdoZW4gdGhlIHByb2Nlc3MgZmluaXNoZXMsIGV4dHJhY3QgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcyBhbmQgcGFzcyB0aGVtIHRvIHRoZSBjYWxsYmFjazpcbiAgICAgICAgY2hpbGQub24gJ2Nsb3NlJywgKGNvZGUsIHNpZ25hbCkgPT5cbiAgICAgICAgICBpZiBjb2RlIGlzbnQgMFxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoXCJDb3VsZCBub3QgZ2V0IFNoZWxsIEVudmlyb25tZW50LiBFeGl0IGNvZGU6IFwiK2NvZGUrXCIsIFNpZ25hbDogXCIrc2lnbmFsKSlcbiAgICAgICAgICBlbnZpcm9ubWVudCA9IHt9XG4gICAgICAgICAgZm9yIGRlZmluaXRpb24gaW4gYnVmZmVyLnNwbGl0KCdcXG4nKVxuICAgICAgICAgICAgW2tleSwgdmFsdWVdID0gZGVmaW5pdGlvbi5zcGxpdCgnPScsIDIpXG4gICAgICAgICAgICBlbnZpcm9ubWVudFtrZXldID0gdmFsdWUgaWYga2V5ICE9ICcnXG4gICAgICAgICAgIyBDYWNoZSBFbnZpcm9ubWVudFxuICAgICAgICAgIEBfZW52Q2FjaGUgPSBlbnZpcm9ubWVudFxuICAgICAgICAgIEBfZW52Q2FjaGVEYXRlID0gbmV3IERhdGUoKVxuICAgICAgICAgIHJlc29sdmUoZW52aXJvbm1lbnQpXG4gICAgICApXG5cbiAgIyMjXG4gIExpa2UgdGhlIHVuaXggd2hpY2ggdXRpbGl0eS5cblxuICBGaW5kcyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgYSBzcGVjaWZpZWQgZXhlY3V0YWJsZSBpbiB0aGUgUEFUSCBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAgRG9lcyBub3QgY2FjaGUgdGhlIHJlc3VsdHMsXG4gIHNvIGhhc2ggLXIgaXMgbm90IG5lZWRlZCB3aGVuIHRoZSBQQVRIIGNoYW5nZXMuXG4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vaXNhYWNzL25vZGUtd2hpY2hcbiAgIyMjXG4gIHdoaWNoOiAoZXhlLCBvcHRpb25zID0ge30pIC0+XG4gICAgIyBHZXQgUEFUSCBhbmQgb3RoZXIgZW52aXJvbm1lbnQgdmFyaWFibGVzXG4gICAgQGdldFNoZWxsRW52aXJvbm1lbnQoKVxuICAgIC50aGVuKChlbnYpID0+XG4gICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgICBvcHRpb25zLnBhdGggPz0gZW52LlBBVEhcbiAgICAgICAgaWYgQGlzV2luZG93c1xuICAgICAgICAgICMgRW52aXJvbm1lbnQgdmFyaWFibGVzIGFyZSBjYXNlLWluc2Vuc2l0aXZlIGluIHdpbmRvd3NcbiAgICAgICAgICAjIENoZWNrIGVudiBmb3IgYSBjYXNlLWluc2Vuc2l0aXZlICdwYXRoJyB2YXJpYWJsZVxuICAgICAgICAgIGlmICFvcHRpb25zLnBhdGhcbiAgICAgICAgICAgIGZvciBpIG9mIGVudlxuICAgICAgICAgICAgICBpZiBpLnRvTG93ZXJDYXNlKCkgaXMgXCJwYXRoXCJcbiAgICAgICAgICAgICAgICBvcHRpb25zLnBhdGggPSBlbnZbaV1cbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgIyBUcmljayBub2RlLXdoaWNoIGludG8gaW5jbHVkaW5nIGZpbGVzXG4gICAgICAgICAgIyB3aXRoIG5vIGV4dGVuc2lvbiBhcyBleGVjdXRhYmxlcy5cbiAgICAgICAgICAjIFB1dCBlbXB0eSBleHRlbnNpb24gbGFzdCB0byBhbGxvdyBmb3Igb3RoZXIgcmVhbCBleHRlbnNpb25zIGZpcnN0XG4gICAgICAgICAgb3B0aW9ucy5wYXRoRXh0ID89IFwiI3twcm9jZXNzLmVudi5QQVRIRVhUID8gJy5FWEUnfTtcIlxuICAgICAgICB3aGljaChleGUsIG9wdGlvbnMsIChlcnIsIHBhdGgpIC0+XG4gICAgICAgICAgcmVzb2x2ZShleGUpIGlmIGVyclxuICAgICAgICAgIHJlc29sdmUocGF0aClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcblxuICAjIyNcbiAgQWRkIGhlbHAgdG8gZXJyb3IuZGVzY3JpcHRpb25cblxuICBOb3RlOiBlcnJvci5kZXNjcmlwdGlvbiBpcyBub3Qgb2ZmaWNpYWxseSB1c2VkIGluIEphdmFTY3JpcHQsXG4gIGhvd2V2ZXIgaXQgaXMgdXNlZCBpbnRlcm5hbGx5IGZvciBBdG9tIEJlYXV0aWZ5IHdoZW4gZGlzcGxheWluZyBlcnJvcnMuXG4gICMjI1xuICBjb21tYW5kTm90Rm91bmRFcnJvcjogKGV4ZSwgaGVscCkgLT5cbiAgICAjIENyZWF0ZSBuZXcgaW1wcm92ZWQgZXJyb3JcbiAgICAjIG5vdGlmeSB1c2VyIHRoYXQgaXQgbWF5IG5vdCBiZVxuICAgICMgaW5zdGFsbGVkIG9yIGluIHBhdGhcbiAgICBtZXNzYWdlID0gXCJDb3VsZCBub3QgZmluZCAnI3tleGV9Jy4gXFxcbiAgICAgICAgICAgIFRoZSBwcm9ncmFtIG1heSBub3QgYmUgaW5zdGFsbGVkLlwiXG4gICAgZXIgPSBuZXcgRXJyb3IobWVzc2FnZSlcbiAgICBlci5jb2RlID0gJ0NvbW1hbmROb3RGb3VuZCdcbiAgICBlci5lcnJubyA9IGVyLmNvZGVcbiAgICBlci5zeXNjYWxsID0gJ2JlYXV0aWZpZXI6OnJ1bidcbiAgICBlci5maWxlID0gZXhlXG4gICAgaWYgaGVscD9cbiAgICAgIGlmIHR5cGVvZiBoZWxwIGlzIFwib2JqZWN0XCJcbiAgICAgICAgIyBCYXNpYyBub3RpY2VcbiAgICAgICAgaGVscFN0ciA9IFwiU2VlICN7aGVscC5saW5rfSBmb3IgcHJvZ3JhbSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbGxhdGlvbiBpbnN0cnVjdGlvbnMuXFxuXCJcbiAgICAgICAgIyBIZWxwIHRvIGNvbmZpZ3VyZSBBdG9tIEJlYXV0aWZ5IGZvciBwcm9ncmFtJ3MgcGF0aFxuICAgICAgICBoZWxwU3RyICs9IFwiWW91IGNhbiBjb25maWd1cmUgQXRvbSBCZWF1dGlmeSBcXFxuICAgICAgICAgICAgICAgICAgICB3aXRoIHRoZSBhYnNvbHV0ZSBwYXRoIFxcXG4gICAgICAgICAgICAgICAgICAgIHRvICcje2hlbHAucHJvZ3JhbSBvciBleGV9JyBieSBzZXR0aW5nIFxcXG4gICAgICAgICAgICAgICAgICAgICcje2hlbHAucGF0aE9wdGlvbn0nIGluIFxcXG4gICAgICAgICAgICAgICAgICAgIHRoZSBBdG9tIEJlYXV0aWZ5IHBhY2thZ2Ugc2V0dGluZ3MuXFxuXCIgaWYgaGVscC5wYXRoT3B0aW9uXG4gICAgICAgICMgT3B0aW9uYWwsIGFkZGl0aW9uYWwgaGVscFxuICAgICAgICBoZWxwU3RyICs9IGhlbHAuYWRkaXRpb25hbCBpZiBoZWxwLmFkZGl0aW9uYWxcbiAgICAgICAgIyBDb21tb24gSGVscFxuICAgICAgICBpc3N1ZVNlYXJjaExpbmsgPVxuICAgICAgICAgIFwiaHR0cHM6Ly9naXRodWIuY29tL0dsYXZpbjAwMS9hdG9tLWJlYXV0aWZ5L1xcXG4gICAgICAgICAgICAgICAgICBzZWFyY2g/cT0je2V4ZX0mdHlwZT1Jc3N1ZXNcIlxuICAgICAgICBkb2NzTGluayA9IFwiaHR0cHM6Ly9naXRodWIuY29tL0dsYXZpbjAwMS9cXFxuICAgICAgICAgICAgICAgICAgYXRvbS1iZWF1dGlmeS90cmVlL21hc3Rlci9kb2NzXCJcbiAgICAgICAgaGVscFN0ciArPSBcIllvdXIgcHJvZ3JhbSBpcyBwcm9wZXJseSBpbnN0YWxsZWQgaWYgcnVubmluZyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcje2lmIEBpc1dpbmRvd3MgdGhlbiAnd2hlcmUuZXhlJyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgJ3doaWNoJ30gI3tleGV9JyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluIHlvdXIgI3tpZiBAaXNXaW5kb3dzIHRoZW4gJ0NNRCBwcm9tcHQnIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSAnVGVybWluYWwnfSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybnMgYW4gYWJzb2x1dGUgcGF0aCB0byB0aGUgZXhlY3V0YWJsZS4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBJZiB0aGlzIGRvZXMgbm90IHdvcmsgdGhlbiB5b3UgaGF2ZSBub3QgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YWxsZWQgdGhlIHByb2dyYW0gY29ycmVjdGx5IGFuZCBzbyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEF0b20gQmVhdXRpZnkgd2lsbCBub3QgZmluZCB0aGUgcHJvZ3JhbS4gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBdG9tIEJlYXV0aWZ5IHJlcXVpcmVzIHRoYXQgdGhlIHByb2dyYW0gYmUgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCBpbiB5b3VyIFBBVEggZW52aXJvbm1lbnQgdmFyaWFibGUuIFxcblxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZSB0aGF0IHRoaXMgaXMgbm90IGFuIEF0b20gQmVhdXRpZnkgaXNzdWUgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBiZWF1dGlmaWNhdGlvbiBkb2VzIG5vdCB3b3JrIGFuZCB0aGUgYWJvdmUgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kIGFsc28gZG9lcyBub3Qgd29yazogdGhpcyBpcyBleHBlY3RlZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlaGF2aW91ciwgc2luY2UgeW91IGhhdmUgbm90IHByb3Blcmx5IGluc3RhbGxlZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlvdXIgcHJvZ3JhbS4gUGxlYXNlIHByb3Blcmx5IHNldHVwIHRoZSBwcm9ncmFtIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5kIHNlYXJjaCB0aHJvdWdoIGV4aXN0aW5nIEF0b20gQmVhdXRpZnkgaXNzdWVzIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVmb3JlIGNyZWF0aW5nIGEgbmV3IGlzc3VlLiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNlZSAje2lzc3VlU2VhcmNoTGlua30gZm9yIHJlbGF0ZWQgSXNzdWVzIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICN7ZG9jc0xpbmt9IGZvciBkb2N1bWVudGF0aW9uLiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIElmIHlvdSBhcmUgc3RpbGwgdW5hYmxlIHRvIHJlc29sdmUgdGhpcyBpc3N1ZSBvbiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlvdXIgb3duIHRoZW4gcGxlYXNlIGNyZWF0ZSBhIG5ldyBpc3N1ZSBhbmQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc2sgZm9yIGhlbHAuXFxuXCJcbiAgICAgICAgZXIuZGVzY3JpcHRpb24gPSBoZWxwU3RyXG4gICAgICBlbHNlICNpZiB0eXBlb2YgaGVscCBpcyBcInN0cmluZ1wiXG4gICAgICAgIGVyLmRlc2NyaXB0aW9uID0gaGVscFxuICAgIHJldHVybiBlclxuXG4gICMjI1xuICBSdW4gY29tbWFuZC1saW5lIGludGVyZmFjZSBjb21tYW5kXG4gICMjI1xuICBydW46IChleGVjdXRhYmxlLCBhcmdzLCB7Y3dkLCBpZ25vcmVSZXR1cm5Db2RlLCBoZWxwLCBvblN0ZGlufSA9IHt9KSAtPlxuICAgICMgRmxhdHRlbiBhcmdzIGZpcnN0XG4gICAgYXJncyA9IF8uZmxhdHRlbihhcmdzKVxuXG4gICAgIyBSZXNvbHZlIGV4ZWN1dGFibGUgYW5kIGFsbCBhcmdzXG4gICAgUHJvbWlzZS5hbGwoW2V4ZWN1dGFibGUsIFByb21pc2UuYWxsKGFyZ3MpXSlcbiAgICAgIC50aGVuKChbZXhlTmFtZSwgYXJnc10pID0+XG4gICAgICAgIEBkZWJ1ZygnZXhlTmFtZSwgYXJnczonLCBleGVOYW1lLCBhcmdzKVxuXG4gICAgICAgICMgR2V0IFBBVEggYW5kIG90aGVyIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICAgICAgICBQcm9taXNlLmFsbChbZXhlTmFtZSwgYXJncywgQGdldFNoZWxsRW52aXJvbm1lbnQoKSwgQHdoaWNoKGV4ZU5hbWUpXSlcbiAgICAgIClcbiAgICAgIC50aGVuKChbZXhlTmFtZSwgYXJncywgZW52LCBleGVQYXRoXSkgPT5cbiAgICAgICAgQGRlYnVnKCdleGVQYXRoLCBlbnY6JywgZXhlUGF0aCwgZW52KVxuICAgICAgICBAZGVidWcoJ2FyZ3MnLCBhcmdzKVxuXG4gICAgICAgIGV4ZSA9IGV4ZVBhdGggPyBleGVOYW1lXG4gICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgY3dkOiBjd2RcbiAgICAgICAgICBlbnY6IGVudlxuICAgICAgICB9XG5cbiAgICAgICAgQHNwYXduKGV4ZSwgYXJncywgb3B0aW9ucywgb25TdGRpbilcbiAgICAgICAgICAudGhlbigoe3JldHVybkNvZGUsIHN0ZG91dCwgc3RkZXJyfSkgPT5cbiAgICAgICAgICAgIEB2ZXJib3NlKCdzcGF3biByZXN1bHQnLCByZXR1cm5Db2RlLCBzdGRvdXQsIHN0ZGVycilcblxuICAgICAgICAgICAgIyBJZiByZXR1cm4gY29kZSBpcyBub3QgMCB0aGVuIGVycm9yIG9jY3VyZWRcbiAgICAgICAgICAgIGlmIG5vdCBpZ25vcmVSZXR1cm5Db2RlIGFuZCByZXR1cm5Db2RlIGlzbnQgMFxuICAgICAgICAgICAgICAjIG9wZXJhYmxlIHByb2dyYW0gb3IgYmF0Y2ggZmlsZVxuICAgICAgICAgICAgICB3aW5kb3dzUHJvZ3JhbU5vdEZvdW5kTXNnID0gXCJpcyBub3QgcmVjb2duaXplZCBhcyBhbiBpbnRlcm5hbCBvciBleHRlcm5hbCBjb21tYW5kXCJcblxuICAgICAgICAgICAgICBAdmVyYm9zZShzdGRlcnIsIHdpbmRvd3NQcm9ncmFtTm90Rm91bmRNc2cpXG5cbiAgICAgICAgICAgICAgaWYgQGlzV2luZG93cyBhbmQgcmV0dXJuQ29kZSBpcyAxIGFuZCBzdGRlcnIuaW5kZXhPZih3aW5kb3dzUHJvZ3JhbU5vdEZvdW5kTXNnKSBpc250IC0xXG4gICAgICAgICAgICAgICAgdGhyb3cgQGNvbW1hbmROb3RGb3VuZEVycm9yKGV4ZU5hbWUsIGhlbHApXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RkZXJyKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBzdGRvdXRcbiAgICAgICAgICApXG4gICAgICAgICAgLmNhdGNoKChlcnIpID0+XG4gICAgICAgICAgICBAZGVidWcoJ2Vycm9yJywgZXJyKVxuXG4gICAgICAgICAgICAjIENoZWNrIGlmIGVycm9yIGlzIEVOT0VOVCAoY29tbWFuZCBjb3VsZCBub3QgYmUgZm91bmQpXG4gICAgICAgICAgICBpZiBlcnIuY29kZSBpcyAnRU5PRU5UJyBvciBlcnIuZXJybm8gaXMgJ0VOT0VOVCdcbiAgICAgICAgICAgICAgdGhyb3cgQGNvbW1hbmROb3RGb3VuZEVycm9yKGV4ZU5hbWUsIGhlbHApXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICMgY29udGludWUgYXMgbm9ybWFsIGVycm9yXG4gICAgICAgICAgICAgIHRocm93IGVyclxuICAgICAgICAgIClcbiAgICAgIClcblxuICAjIyNcbiAgU3Bhd25cbiAgIyMjXG4gIHNwYXduOiAoZXhlLCBhcmdzLCBvcHRpb25zLCBvblN0ZGluKSAtPlxuICAgICMgUmVtb3ZlIHVuZGVmaW5lZC9udWxsIHZhbHVlc1xuICAgIGFyZ3MgPSBfLndpdGhvdXQoYXJncywgdW5kZWZpbmVkKVxuICAgIGFyZ3MgPSBfLndpdGhvdXQoYXJncywgbnVsbClcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgQGRlYnVnKCdzcGF3bicsIGV4ZSwgYXJncylcblxuICAgICAgY21kID0gc3Bhd24oZXhlLCBhcmdzLCBvcHRpb25zKVxuICAgICAgc3Rkb3V0ID0gXCJcIlxuICAgICAgc3RkZXJyID0gXCJcIlxuXG4gICAgICBjbWQuc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpIC0+XG4gICAgICAgIHN0ZG91dCArPSBkYXRhXG4gICAgICApXG4gICAgICBjbWQuc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpIC0+XG4gICAgICAgIHN0ZGVyciArPSBkYXRhXG4gICAgICApXG4gICAgICBjbWQub24oJ2Nsb3NlJywgKHJldHVybkNvZGUpID0+XG4gICAgICAgIEBkZWJ1Zygnc3Bhd24gZG9uZScsIHJldHVybkNvZGUsIHN0ZGVyciwgc3Rkb3V0KVxuICAgICAgICByZXNvbHZlKHtyZXR1cm5Db2RlLCBzdGRvdXQsIHN0ZGVycn0pXG4gICAgICApXG4gICAgICBjbWQub24oJ2Vycm9yJywgKGVycikgPT5cbiAgICAgICAgQGRlYnVnKCdlcnJvcicsIGVycilcbiAgICAgICAgcmVqZWN0KGVycilcbiAgICAgIClcblxuICAgICAgb25TdGRpbiBjbWQuc3RkaW4gaWYgb25TdGRpblxuICAgIClcblxuICAjIyNcbiAgTG9nZ2VyIGluc3RhbmNlXG4gICMjI1xuICBsb2dnZXI6IG51bGxcbiAgIyMjXG4gIEluaXRpYWxpemUgYW5kIGNvbmZpZ3VyZSBMb2dnZXJcbiAgIyMjXG4gIHNldHVwTG9nZ2VyOiAtPlxuICAgIEBsb2dnZXIgPSByZXF1aXJlKCcuLi9sb2dnZXInKShfX2ZpbGVuYW1lKVxuICAgICMgQHZlcmJvc2UoQGxvZ2dlcilcbiAgICAjIE1lcmdlIGxvZ2dlciBtZXRob2RzIGludG8gYmVhdXRpZmllciBjbGFzc1xuICAgIGZvciBrZXksIG1ldGhvZCBvZiBAbG9nZ2VyXG4gICAgICAjIEB2ZXJib3NlKGtleSwgbWV0aG9kKVxuICAgICAgQFtrZXldID0gbWV0aG9kXG4gICAgQHZlcmJvc2UoXCIje0BuYW1lfSBiZWF1dGlmaWVyIGxvZ2dlciBoYXMgYmVlbiBpbml0aWFsaXplZC5cIilcblxuICAjIyNcbiAgQ29uc3RydWN0b3IgdG8gc2V0dXAgYmVhdXRpZmVyXG4gICMjI1xuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAjIFNldHVwIGxvZ2dlclxuICAgIEBzZXR1cExvZ2dlcigpXG4gICAgIyBIYW5kbGUgZ2xvYmFsIG9wdGlvbnNcbiAgICBpZiBAb3B0aW9ucy5fP1xuICAgICAgZ2xvYmFsT3B0aW9ucyA9IEBvcHRpb25zLl9cbiAgICAgIGRlbGV0ZSBAb3B0aW9ucy5fXG4gICAgICAjIE9ubHkgbWVyZ2UgaWYgZ2xvYmFsT3B0aW9ucyBpcyBhbiBvYmplY3RcbiAgICAgIGlmIHR5cGVvZiBnbG9iYWxPcHRpb25zIGlzIFwib2JqZWN0XCJcbiAgICAgICAgIyBJdGVyYXRlIG92ZXIgYWxsIHN1cHBvcnRlZCBsYW5ndWFnZXNcbiAgICAgICAgZm9yIGxhbmcsIG9wdGlvbnMgb2YgQG9wdGlvbnNcbiAgICAgICAgICAjXG4gICAgICAgICAgaWYgdHlwZW9mIG9wdGlvbnMgaXMgXCJib29sZWFuXCJcbiAgICAgICAgICAgIGlmIG9wdGlvbnMgaXMgdHJ1ZVxuICAgICAgICAgICAgICBAb3B0aW9uc1tsYW5nXSA9IGdsb2JhbE9wdGlvbnNcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZiBvcHRpb25zIGlzIFwib2JqZWN0XCJcbiAgICAgICAgICAgIEBvcHRpb25zW2xhbmddID0gXy5tZXJnZShnbG9iYWxPcHRpb25zLCBvcHRpb25zKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB3YXJuKFwiVW5zdXBwb3J0ZWQgb3B0aW9ucyB0eXBlICN7dHlwZW9mIG9wdGlvbnN9IGZvciBsYW5ndWFnZSAje2xhbmd9OiBcIisgb3B0aW9ucylcbiAgICBAdmVyYm9zZShcIk9wdGlvbnMgZm9yICN7QG5hbWV9OlwiLCBAb3B0aW9ucylcbiAgICAjIFNldCBzdXBwb3J0ZWQgbGFuZ3VhZ2VzXG4gICAgQGxhbmd1YWdlcyA9IF8ua2V5cyhAb3B0aW9ucylcbiJdfQ==
