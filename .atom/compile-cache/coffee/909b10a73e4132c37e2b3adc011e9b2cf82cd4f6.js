(function() {
  var Executable, HybridExecutable, Promise, _, fs, os, parentConfigKey, path, semver, spawn, which,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Promise = require('bluebird');

  _ = require('lodash');

  which = require('which');

  spawn = require('child_process').spawn;

  path = require('path');

  semver = require('semver');

  os = require('os');

  fs = require('fs');

  parentConfigKey = "atom-beautify.executables";

  Executable = (function() {
    var isInstalled, version;

    Executable.prototype.name = null;

    Executable.prototype.cmd = null;

    Executable.prototype.key = null;

    Executable.prototype.homepage = null;

    Executable.prototype.installation = null;

    Executable.prototype.versionArgs = ['--version'];

    Executable.prototype.versionParse = function(text) {
      return semver.clean(text);
    };

    Executable.prototype.versionRunOptions = {};

    Executable.prototype.versionsSupported = '>= 0.0.0';

    Executable.prototype.required = true;

    function Executable(options) {
      var versionOptions;
      if (options.cmd == null) {
        throw new Error("The command (i.e. cmd property) is required for an Executable.");
      }
      this.name = options.name;
      this.cmd = options.cmd;
      this.key = this.cmd;
      this.homepage = options.homepage;
      this.installation = options.installation;
      this.required = !options.optional;
      if (options.version != null) {
        versionOptions = options.version;
        if (versionOptions.args) {
          this.versionArgs = versionOptions.args;
        }
        if (versionOptions.parse) {
          this.versionParse = versionOptions.parse;
        }
        if (versionOptions.runOptions) {
          this.versionRunOptions = versionOptions.runOptions;
        }
        if (versionOptions.supported) {
          this.versionsSupported = versionOptions.supported;
        }
      }
      this.setupLogger();
    }

    Executable.prototype.init = function() {
      return Promise.all([this.loadVersion()]).then((function(_this) {
        return function() {
          return _this.verbose("Done init of " + _this.name);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this;
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          if (!_this.required) {
            return _this;
          } else {
            return Promise.reject(error);
          }
        };
      })(this));
    };


    /*
    Logger instance
     */

    Executable.prototype.logger = null;


    /*
    Initialize and configure Logger
     */

    Executable.prototype.setupLogger = function() {
      var key, method, ref;
      this.logger = require('../logger')(this.name + " Executable");
      ref = this.logger;
      for (key in ref) {
        method = ref[key];
        this[key] = method;
      }
      return this.verbose(this.name + " executable logger has been initialized.");
    };

    isInstalled = null;

    version = null;

    Executable.prototype.loadVersion = function(force) {
      if (force == null) {
        force = false;
      }
      this.verbose("loadVersion", this.version, force);
      if (force || (this.version == null)) {
        this.verbose("Loading version without cache");
        return this.runVersion().then((function(_this) {
          return function(text) {
            return _this.saveVersion(text);
          };
        })(this));
      } else {
        this.verbose("Loading cached version");
        return Promise.resolve(this.version);
      }
    };

    Executable.prototype.runVersion = function() {
      return this.run(this.versionArgs, this.versionRunOptions).then((function(_this) {
        return function(version) {
          _this.info("Version text: " + version);
          return version;
        };
      })(this));
    };

    Executable.prototype.saveVersion = function(text) {
      return Promise.resolve().then((function(_this) {
        return function() {
          return _this.versionParse(text);
        };
      })(this)).then(function(version) {
        var valid;
        valid = Boolean(semver.valid(version));
        if (!valid) {
          throw new Error("Version is not valid: " + version);
        }
        return version;
      }).then((function(_this) {
        return function(version) {
          _this.isInstalled = true;
          return _this.version = version;
        };
      })(this)).then((function(_this) {
        return function(version) {
          _this.info(_this.cmd + " version: " + version);
          return version;
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          var help;
          _this.isInstalled = false;
          _this.error(error);
          help = {
            program: _this.cmd,
            link: _this.installation || _this.homepage,
            pathOption: "Executable - " + (_this.name || _this.cmd) + " - Path"
          };
          return Promise.reject(_this.commandNotFoundError(_this.name || _this.cmd, help));
        };
      })(this));
    };

    Executable.prototype.isSupported = function() {
      return this.isVersion(this.versionsSupported);
    };

    Executable.prototype.isVersion = function(range) {
      return this.versionSatisfies(this.version, range);
    };

    Executable.prototype.versionSatisfies = function(version, range) {
      return semver.satisfies(version, range);
    };

    Executable.prototype.getConfig = function() {
      return (typeof atom !== "undefined" && atom !== null ? atom.config.get(parentConfigKey + "." + this.key) : void 0) || {};
    };


    /*
    Run command-line interface command
     */

    Executable.prototype.run = function(args, options) {
      var cmd, cwd, exeName, help, ignoreReturnCode, onStdin, returnStderr, returnStdoutOrStderr;
      if (options == null) {
        options = {};
      }
      this.debug("Run: ", this.cmd, args, options);
      cmd = options.cmd, cwd = options.cwd, ignoreReturnCode = options.ignoreReturnCode, help = options.help, onStdin = options.onStdin, returnStderr = options.returnStderr, returnStdoutOrStderr = options.returnStdoutOrStderr;
      exeName = cmd || this.cmd;
      if (cwd == null) {
        cwd = os.tmpdir();
      }
      if (help == null) {
        help = {
          program: this.cmd,
          link: this.installation || this.homepage,
          pathOption: "Executable - " + (this.name || this.cmd) + " - Path"
        };
      }
      return Promise.all([this.shellEnv(), this.resolveArgs(args)]).then((function(_this) {
        return function(arg1) {
          var args, env, exePath;
          env = arg1[0], args = arg1[1];
          _this.debug('exeName, args:', exeName, args);
          exePath = _this.path(exeName);
          return Promise.all([exeName, args, env, exePath]);
        };
      })(this)).then((function(_this) {
        return function(arg1) {
          var args, env, exe, exeName, exePath, spawnOptions;
          exeName = arg1[0], args = arg1[1], env = arg1[2], exePath = arg1[3];
          _this.debug('exePath:', exePath);
          _this.debug('env:', env);
          _this.debug('PATH:', env.PATH);
          _this.debug('args', args);
          args = _this.relativizePaths(args);
          _this.debug('relativized args', args);
          exe = exePath != null ? exePath : exeName;
          spawnOptions = {
            cwd: cwd,
            env: env
          };
          _this.debug('spawnOptions', spawnOptions);
          return _this.spawn(exe, args, spawnOptions, onStdin).then(function(arg2) {
            var returnCode, stderr, stdout, windowsProgramNotFoundMsg;
            returnCode = arg2.returnCode, stdout = arg2.stdout, stderr = arg2.stderr;
            _this.verbose('spawn result, returnCode', returnCode);
            _this.verbose('spawn result, stdout', stdout);
            _this.verbose('spawn result, stderr', stderr);
            if (!ignoreReturnCode && returnCode !== 0) {
              windowsProgramNotFoundMsg = "is not recognized as an internal or external command";
              _this.verbose(stderr, windowsProgramNotFoundMsg);
              if (_this.isWindows() && returnCode === 1 && stderr.indexOf(windowsProgramNotFoundMsg) !== -1) {
                throw _this.commandNotFoundError(exeName, help);
              } else {
                throw new Error(stderr || stdout);
              }
            } else {
              if (returnStdoutOrStderr) {
                return stdout || stderr;
              } else if (returnStderr) {
                return stderr;
              } else {
                return stdout;
              }
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

    Executable.prototype.path = function(cmd) {
      var config, exeName;
      if (cmd == null) {
        cmd = this.cmd;
      }
      config = this.getConfig();
      if (config && config.path) {
        return Promise.resolve(config.path);
      } else {
        exeName = cmd;
        return this.which(exeName);
      }
    };

    Executable.prototype.resolveArgs = function(args) {
      args = _.flatten(args);
      return Promise.all(args);
    };

    Executable.prototype.relativizePaths = function(args) {
      var newArgs, tmpDir;
      tmpDir = os.tmpdir();
      newArgs = args.map(function(arg) {
        var isTmpFile;
        isTmpFile = typeof arg === 'string' && !arg.includes(':') && path.isAbsolute(arg) && path.dirname(arg).startsWith(tmpDir);
        if (isTmpFile) {
          return path.relative(tmpDir, arg);
        }
        return arg;
      });
      return newArgs;
    };


    /*
    Spawn
     */

    Executable.prototype.spawn = function(exe, args, options, onStdin) {
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
    Add help to error.description
    
    Note: error.description is not officially used in JavaScript,
    however it is used internally for Atom Beautify when displaying errors.
     */

    Executable.prototype.commandNotFoundError = function(exe, help) {
      if (exe == null) {
        exe = this.name || this.cmd;
      }
      return this.constructor.commandNotFoundError(exe, help);
    };

    Executable.commandNotFoundError = function(exe, help) {
      var docsLink, er, helpStr, message;
      message = "Could not find '" + exe + "'. The program may not be installed.";
      er = new Error(message);
      er.code = 'CommandNotFound';
      er.errno = er.code;
      er.syscall = 'beautifier::run';
      er.file = exe;
      if (help != null) {
        if (typeof help === "object") {
          docsLink = "https://github.com/Glavin001/atom-beautify#beautifiers";
          helpStr = "See " + exe + " installation instructions at " + docsLink + (help.link ? ' or go to ' + help.link : '') + "\n";
          if (help.pathOption) {
            helpStr += "You can configure Atom Beautify with the absolute path to '" + (help.program || exe) + "' by setting '" + help.pathOption + "' in the Atom Beautify package settings.\n";
          }
          helpStr += "Your program is properly installed if running '" + (this.isWindows() ? 'where.exe' : 'which') + " " + exe + "' in your " + (this.isWindows() ? 'CMD prompt' : 'Terminal') + " returns an absolute path to the executable.\n";
          if (help.additional) {
            helpStr += help.additional;
          }
          er.description = helpStr;
        } else {
          er.description = help;
        }
      }
      return er;
    };

    Executable._envCache = null;

    Executable.prototype.shellEnv = function() {
      var env;
      env = this.constructor.shellEnv();
      this.debug("env", env);
      return env;
    };

    Executable.shellEnv = function() {
      return Promise.resolve(process.env);
    };


    /*
    Like the unix which utility.
    
    Finds the first instance of a specified executable in the PATH environment variable.
    Does not cache the results,
    so hash -r is not needed when the PATH changes.
    See https://github.com/isaacs/node-which
     */

    Executable.prototype.which = function(exe, options) {
      return this.constructor.which(exe, options);
    };

    Executable._whichCache = {};

    Executable.which = function(exe, options) {
      if (options == null) {
        options = {};
      }
      if (this._whichCache[exe]) {
        return Promise.resolve(this._whichCache[exe]);
      }
      return this.shellEnv().then((function(_this) {
        return function(env) {
          return new Promise(function(resolve, reject) {
            var i, ref;
            if (options.path == null) {
              options.path = env.PATH;
            }
            if (_this.isWindows()) {
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
                return resolve(exe);
              }
              _this._whichCache[exe] = path;
              return resolve(path);
            });
          });
        };
      })(this));
    };


    /*
    If platform is Windows
     */

    Executable.prototype.isWindows = function() {
      return this.constructor.isWindows();
    };

    Executable.isWindows = function() {
      return new RegExp('^win').test(process.platform);
    };

    return Executable;

  })();

  HybridExecutable = (function(superClass) {
    extend(HybridExecutable, superClass);

    HybridExecutable.prototype.dockerOptions = {
      image: void 0,
      workingDir: "/workdir"
    };

    function HybridExecutable(options) {
      HybridExecutable.__super__.constructor.call(this, options);
      if (options.docker != null) {
        this.dockerOptions = Object.assign({}, this.dockerOptions, options.docker);
        this.docker = this.constructor.dockerExecutable();
      }
    }

    HybridExecutable.docker = void 0;

    HybridExecutable.dockerExecutable = function() {
      if (this.docker == null) {
        this.docker = new Executable({
          name: "Docker",
          cmd: "docker",
          homepage: "https://www.docker.com/",
          installation: "https://www.docker.com/get-docker",
          version: {
            parse: function(text) {
              return text.match(/version [0]*([1-9]\d*).[0]*([0-9]\d*).[0]*([0-9]\d*)/).slice(1).join('.');
            }
          }
        });
      }
      return this.docker;
    };

    HybridExecutable.prototype.installedWithDocker = false;

    HybridExecutable.prototype.init = function() {
      return HybridExecutable.__super__.init.call(this)["catch"]((function(_this) {
        return function(error) {
          if (_this.docker == null) {
            return Promise.reject(error);
          }
          return _this.docker.init().then(function() {
            return _this.runImage(_this.versionArgs, _this.versionRunOptions);
          }).then(function(text) {
            return _this.saveVersion(text);
          }).then(function() {
            return _this.installedWithDocker = true;
          }).then(function() {
            return _this;
          })["catch"](function(dockerError) {
            _this.debug(dockerError);
            return Promise.reject(error);
          });
        };
      })(this));
    };

    HybridExecutable.prototype.run = function(args, options) {
      if (options == null) {
        options = {};
      }
      if (this.installedWithDocker && this.docker && this.docker.isInstalled) {
        return this.runImage(args, options);
      }
      return HybridExecutable.__super__.run.call(this, args, options);
    };

    HybridExecutable.prototype.runImage = function(args, options) {
      this.debug("Run Docker executable: ", args, options);
      return this.resolveArgs(args).then((function(_this) {
        return function(args) {
          var cwd, image, newArgs, pwd, rootPath, tmpDir, workingDir;
          cwd = options.cwd;
          tmpDir = os.tmpdir();
          pwd = fs.realpathSync(cwd || tmpDir);
          image = _this.dockerOptions.image;
          workingDir = _this.dockerOptions.workingDir;
          rootPath = '/mountedRoot';
          newArgs = args.map(function(arg) {
            if (typeof arg === 'string' && !arg.includes(':') && path.isAbsolute(arg) && !path.dirname(arg).startsWith(tmpDir)) {
              return path.join(rootPath, arg);
            } else {
              return arg;
            }
          });
          return _this.docker.run(["run", "--volume", pwd + ":" + workingDir, "--volume", (path.resolve('/')) + ":" + rootPath, "--workdir", workingDir, image, newArgs], options);
        };
      })(this));
    };

    return HybridExecutable;

  })(Executable);

  module.exports = HybridExecutable;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvZXhlY3V0YWJsZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDZGQUFBO0lBQUE7OztFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7RUFDVixDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0VBQ0osS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztFQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsZUFBUixDQUF3QixDQUFDOztFQUNqQyxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsZUFBQSxHQUFrQjs7RUFHWjtBQUVKLFFBQUE7O3lCQUFBLElBQUEsR0FBTTs7eUJBQ04sR0FBQSxHQUFLOzt5QkFDTCxHQUFBLEdBQUs7O3lCQUNMLFFBQUEsR0FBVTs7eUJBQ1YsWUFBQSxHQUFjOzt5QkFDZCxXQUFBLEdBQWEsQ0FBQyxXQUFEOzt5QkFDYixZQUFBLEdBQWMsU0FBQyxJQUFEO2FBQVUsTUFBTSxDQUFDLEtBQVAsQ0FBYSxJQUFiO0lBQVY7O3lCQUNkLGlCQUFBLEdBQW1COzt5QkFDbkIsaUJBQUEsR0FBbUI7O3lCQUNuQixRQUFBLEdBQVU7O0lBRUcsb0JBQUMsT0FBRDtBQUVYLFVBQUE7TUFBQSxJQUFJLG1CQUFKO0FBQ0UsY0FBVSxJQUFBLEtBQUEsQ0FBTSxnRUFBTixFQURaOztNQUVBLElBQUMsQ0FBQSxJQUFELEdBQVEsT0FBTyxDQUFDO01BQ2hCLElBQUMsQ0FBQSxHQUFELEdBQU8sT0FBTyxDQUFDO01BQ2YsSUFBQyxDQUFBLEdBQUQsR0FBTyxJQUFDLENBQUE7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QUFkLElBQTJCLENBQUksR0FBRyxDQUFDLFFBQUosQ0FBYSxHQUFiLENBQS9CLElBQ0UsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FERixJQUMyQixDQUFJLElBQUksQ0FBQyxPQUFMLENBQWEsR0FBYixDQUFpQixDQUFDLFVBQWxCLENBQTZCLE1BQTdCLENBRG5DO3FCQUVPLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFvQixHQUFwQixFQUZQO2FBQUEsTUFBQTtxQkFFcUMsSUFGckM7O1VBRGlCLENBQVQ7aUJBTVYsS0FBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksQ0FDUixLQURRLEVBRVIsVUFGUSxFQUVPLEdBQUQsR0FBSyxHQUFMLEdBQVEsVUFGZCxFQUdSLFVBSFEsRUFHTSxDQUFDLElBQUksQ0FBQyxPQUFMLENBQWEsR0FBYixDQUFELENBQUEsR0FBbUIsR0FBbkIsR0FBc0IsUUFINUIsRUFJUixXQUpRLEVBSUssVUFKTCxFQUtSLEtBTFEsRUFNUixPQU5RLENBQVosRUFRRSxPQVJGO1FBZEk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFI7SUFGUTs7OztLQWhEbUI7O0VBOEUvQixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXJiakIiLCJzb3VyY2VzQ29udGVudCI6WyJQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKVxuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG53aGljaCA9IHJlcXVpcmUoJ3doaWNoJylcbnNwYXduID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLnNwYXduXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5zZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKVxub3MgPSByZXF1aXJlKCdvcycpXG5mcyA9IHJlcXVpcmUoJ2ZzJylcblxucGFyZW50Q29uZmlnS2V5ID0gXCJhdG9tLWJlYXV0aWZ5LmV4ZWN1dGFibGVzXCJcblxuXG5jbGFzcyBFeGVjdXRhYmxlXG5cbiAgbmFtZTogbnVsbFxuICBjbWQ6IG51bGxcbiAga2V5OiBudWxsXG4gIGhvbWVwYWdlOiBudWxsXG4gIGluc3RhbGxhdGlvbjogbnVsbFxuICB2ZXJzaW9uQXJnczogWyctLXZlcnNpb24nXVxuICB2ZXJzaW9uUGFyc2U6ICh0ZXh0KSAtPiBzZW12ZXIuY2xlYW4odGV4dClcbiAgdmVyc2lvblJ1bk9wdGlvbnM6IHt9XG4gIHZlcnNpb25zU3VwcG9ydGVkOiAnPj0gMC4wLjAnXG4gIHJlcXVpcmVkOiB0cnVlXG5cbiAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgICMgVmFsaWRhdGlvblxuICAgIGlmICFvcHRpb25zLmNtZD9cbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBjb21tYW5kIChpLmUuIGNtZCBwcm9wZXJ0eSkgaXMgcmVxdWlyZWQgZm9yIGFuIEV4ZWN1dGFibGUuXCIpXG4gICAgQG5hbWUgPSBvcHRpb25zLm5hbWVcbiAgICBAY21kID0gb3B0aW9ucy5jbWRcbiAgICBAa2V5ID0gQGNtZFxuICAgIEBob21lcGFnZSA9IG9wdGlvbnMuaG9tZXBhZ2VcbiAgICBAaW5zdGFsbGF0aW9uID0gb3B0aW9ucy5pbnN0YWxsYXRpb25cbiAgICBAcmVxdWlyZWQgPSBub3Qgb3B0aW9ucy5vcHRpb25hbFxuICAgIGlmIG9wdGlvbnMudmVyc2lvbj9cbiAgICAgIHZlcnNpb25PcHRpb25zID0gb3B0aW9ucy52ZXJzaW9uXG4gICAgICBAdmVyc2lvbkFyZ3MgPSB2ZXJzaW9uT3B0aW9ucy5hcmdzIGlmIHZlcnNpb25PcHRpb25zLmFyZ3NcbiAgICAgIEB2ZXJzaW9uUGFyc2UgPSB2ZXJzaW9uT3B0aW9ucy5wYXJzZSBpZiB2ZXJzaW9uT3B0aW9ucy5wYXJzZVxuICAgICAgQHZlcnNpb25SdW5PcHRpb25zID0gdmVyc2lvbk9wdGlvbnMucnVuT3B0aW9ucyBpZiB2ZXJzaW9uT3B0aW9ucy5ydW5PcHRpb25zXG4gICAgICBAdmVyc2lvbnNTdXBwb3J0ZWQgPSB2ZXJzaW9uT3B0aW9ucy5zdXBwb3J0ZWQgaWYgdmVyc2lvbk9wdGlvbnMuc3VwcG9ydGVkXG4gICAgQHNldHVwTG9nZ2VyKClcblxuICBpbml0OiAoKSAtPlxuICAgIFByb21pc2UuYWxsKFtcbiAgICAgIEBsb2FkVmVyc2lvbigpXG4gICAgXSlcbiAgICAgIC50aGVuKCgpID0+IEB2ZXJib3NlKFwiRG9uZSBpbml0IG9mICN7QG5hbWV9XCIpKVxuICAgICAgLnRoZW4oKCkgPT4gQClcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+XG4gICAgICAgIGlmIG5vdCBALnJlcXVpcmVkXG4gICAgICAgICAgQFxuICAgICAgICBlbHNlXG4gICAgICAgICAgUHJvbWlzZS5yZWplY3QoZXJyb3IpXG4gICAgICApXG5cbiAgIyMjXG4gIExvZ2dlciBpbnN0YW5jZVxuICAjIyNcbiAgbG9nZ2VyOiBudWxsXG4gICMjI1xuICBJbml0aWFsaXplIGFuZCBjb25maWd1cmUgTG9nZ2VyXG4gICMjI1xuICBzZXR1cExvZ2dlcjogLT5cbiAgICBAbG9nZ2VyID0gcmVxdWlyZSgnLi4vbG9nZ2VyJykoXCIje0BuYW1lfSBFeGVjdXRhYmxlXCIpXG4gICAgZm9yIGtleSwgbWV0aG9kIG9mIEBsb2dnZXJcbiAgICAgIEBba2V5XSA9IG1ldGhvZFxuICAgIEB2ZXJib3NlKFwiI3tAbmFtZX0gZXhlY3V0YWJsZSBsb2dnZXIgaGFzIGJlZW4gaW5pdGlhbGl6ZWQuXCIpXG5cbiAgaXNJbnN0YWxsZWQgPSBudWxsXG4gIHZlcnNpb24gPSBudWxsXG4gIGxvYWRWZXJzaW9uOiAoZm9yY2UgPSBmYWxzZSkgLT5cbiAgICBAdmVyYm9zZShcImxvYWRWZXJzaW9uXCIsIEB2ZXJzaW9uLCBmb3JjZSlcbiAgICBpZiBmb3JjZSBvciAhQHZlcnNpb24/XG4gICAgICBAdmVyYm9zZShcIkxvYWRpbmcgdmVyc2lvbiB3aXRob3V0IGNhY2hlXCIpXG4gICAgICBAcnVuVmVyc2lvbigpXG4gICAgICAgIC50aGVuKCh0ZXh0KSA9PiBAc2F2ZVZlcnNpb24odGV4dCkpXG4gICAgZWxzZVxuICAgICAgQHZlcmJvc2UoXCJMb2FkaW5nIGNhY2hlZCB2ZXJzaW9uXCIpXG4gICAgICBQcm9taXNlLnJlc29sdmUoQHZlcnNpb24pXG5cbiAgcnVuVmVyc2lvbjogKCkgLT5cbiAgICBAcnVuKEB2ZXJzaW9uQXJncywgQHZlcnNpb25SdW5PcHRpb25zKVxuICAgICAgLnRoZW4oKHZlcnNpb24pID0+XG4gICAgICAgIEBpbmZvKFwiVmVyc2lvbiB0ZXh0OiBcIiArIHZlcnNpb24pXG4gICAgICAgIHZlcnNpb25cbiAgICAgIClcblxuICBzYXZlVmVyc2lvbjogKHRleHQpIC0+XG4gICAgUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgIC50aGVuKCA9PiBAdmVyc2lvblBhcnNlKHRleHQpKVxuICAgICAgLnRoZW4oKHZlcnNpb24pIC0+XG4gICAgICAgIHZhbGlkID0gQm9vbGVhbihzZW12ZXIudmFsaWQodmVyc2lvbikpXG4gICAgICAgIGlmIG5vdCB2YWxpZFxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlZlcnNpb24gaXMgbm90IHZhbGlkOiBcIit2ZXJzaW9uKVxuICAgICAgICB2ZXJzaW9uXG4gICAgICApXG4gICAgICAudGhlbigodmVyc2lvbikgPT5cbiAgICAgICAgQGlzSW5zdGFsbGVkID0gdHJ1ZVxuICAgICAgICBAdmVyc2lvbiA9IHZlcnNpb25cbiAgICAgIClcbiAgICAgIC50aGVuKCh2ZXJzaW9uKSA9PlxuICAgICAgICBAaW5mbyhcIiN7QGNtZH0gdmVyc2lvbjogI3t2ZXJzaW9ufVwiKVxuICAgICAgICB2ZXJzaW9uXG4gICAgICApXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PlxuICAgICAgICBAaXNJbnN0YWxsZWQgPSBmYWxzZVxuICAgICAgICBAZXJyb3IoZXJyb3IpXG4gICAgICAgIGhlbHAgPSB7XG4gICAgICAgICAgcHJvZ3JhbTogQGNtZFxuICAgICAgICAgIGxpbms6IEBpbnN0YWxsYXRpb24gb3IgQGhvbWVwYWdlXG4gICAgICAgICAgcGF0aE9wdGlvbjogXCJFeGVjdXRhYmxlIC0gI3tAbmFtZSBvciBAY21kfSAtIFBhdGhcIlxuICAgICAgICB9XG4gICAgICAgIFByb21pc2UucmVqZWN0KEBjb21tYW5kTm90Rm91bmRFcnJvcihAbmFtZSBvciBAY21kLCBoZWxwKSlcbiAgICAgIClcblxuICBpc1N1cHBvcnRlZDogKCkgLT5cbiAgICBAaXNWZXJzaW9uKEB2ZXJzaW9uc1N1cHBvcnRlZClcblxuICBpc1ZlcnNpb246IChyYW5nZSkgLT5cbiAgICBAdmVyc2lvblNhdGlzZmllcyhAdmVyc2lvbiwgcmFuZ2UpXG5cbiAgdmVyc2lvblNhdGlzZmllczogKHZlcnNpb24sIHJhbmdlKSAtPlxuICAgIHNlbXZlci5zYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UpXG5cbiAgZ2V0Q29uZmlnOiAoKSAtPlxuICAgIGF0b20/LmNvbmZpZy5nZXQoXCIje3BhcmVudENvbmZpZ0tleX0uI3tAa2V5fVwiKSBvciB7fVxuXG4gICMjI1xuICBSdW4gY29tbWFuZC1saW5lIGludGVyZmFjZSBjb21tYW5kXG4gICMjI1xuICBydW46IChhcmdzLCBvcHRpb25zID0ge30pIC0+XG4gICAgQGRlYnVnKFwiUnVuOiBcIiwgQGNtZCwgYXJncywgb3B0aW9ucylcbiAgICB7IGNtZCwgY3dkLCBpZ25vcmVSZXR1cm5Db2RlLCBoZWxwLCBvblN0ZGluLCByZXR1cm5TdGRlcnIsIHJldHVyblN0ZG91dE9yU3RkZXJyIH0gPSBvcHRpb25zXG4gICAgZXhlTmFtZSA9IGNtZCBvciBAY21kXG4gICAgY3dkID89IG9zLnRtcGRpcigpXG4gICAgaGVscCA/PSB7XG4gICAgICBwcm9ncmFtOiBAY21kXG4gICAgICBsaW5rOiBAaW5zdGFsbGF0aW9uIG9yIEBob21lcGFnZVxuICAgICAgcGF0aE9wdGlvbjogXCJFeGVjdXRhYmxlIC0gI3tAbmFtZSBvciBAY21kfSAtIFBhdGhcIlxuICAgIH1cblxuICAgICMgUmVzb2x2ZSBleGVjdXRhYmxlIGFuZCBhbGwgYXJnc1xuICAgIFByb21pc2UuYWxsKFtAc2hlbGxFbnYoKSwgdGhpcy5yZXNvbHZlQXJncyhhcmdzKV0pXG4gICAgICAudGhlbigoW2VudiwgYXJnc10pID0+XG4gICAgICAgIEBkZWJ1ZygnZXhlTmFtZSwgYXJnczonLCBleGVOYW1lLCBhcmdzKVxuICAgICAgICAjIEdldCBQQVRIIGFuZCBvdGhlciBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgICAgICAgZXhlUGF0aCA9IEBwYXRoKGV4ZU5hbWUpXG4gICAgICAgIFByb21pc2UuYWxsKFtleGVOYW1lLCBhcmdzLCBlbnYsIGV4ZVBhdGhdKVxuICAgICAgKVxuICAgICAgLnRoZW4oKFtleGVOYW1lLCBhcmdzLCBlbnYsIGV4ZVBhdGhdKSA9PlxuICAgICAgICBAZGVidWcoJ2V4ZVBhdGg6JywgZXhlUGF0aClcbiAgICAgICAgQGRlYnVnKCdlbnY6JywgZW52KVxuICAgICAgICBAZGVidWcoJ1BBVEg6JywgZW52LlBBVEgpXG4gICAgICAgIEBkZWJ1ZygnYXJncycsIGFyZ3MpXG4gICAgICAgIGFyZ3MgPSB0aGlzLnJlbGF0aXZpemVQYXRocyhhcmdzKVxuICAgICAgICBAZGVidWcoJ3JlbGF0aXZpemVkIGFyZ3MnLCBhcmdzKVxuXG4gICAgICAgIGV4ZSA9IGV4ZVBhdGggPyBleGVOYW1lXG4gICAgICAgIHNwYXduT3B0aW9ucyA9IHtcbiAgICAgICAgICBjd2Q6IGN3ZFxuICAgICAgICAgIGVudjogZW52XG4gICAgICAgIH1cbiAgICAgICAgQGRlYnVnKCdzcGF3bk9wdGlvbnMnLCBzcGF3bk9wdGlvbnMpXG5cbiAgICAgICAgQHNwYXduKGV4ZSwgYXJncywgc3Bhd25PcHRpb25zLCBvblN0ZGluKVxuICAgICAgICAgIC50aGVuKCh7cmV0dXJuQ29kZSwgc3Rkb3V0LCBzdGRlcnJ9KSA9PlxuICAgICAgICAgICAgQHZlcmJvc2UoJ3NwYXduIHJlc3VsdCwgcmV0dXJuQ29kZScsIHJldHVybkNvZGUpXG4gICAgICAgICAgICBAdmVyYm9zZSgnc3Bhd24gcmVzdWx0LCBzdGRvdXQnLCBzdGRvdXQpXG4gICAgICAgICAgICBAdmVyYm9zZSgnc3Bhd24gcmVzdWx0LCBzdGRlcnInLCBzdGRlcnIpXG5cbiAgICAgICAgICAgICMgSWYgcmV0dXJuIGNvZGUgaXMgbm90IDAgdGhlbiBlcnJvciBvY2N1cmVkXG4gICAgICAgICAgICBpZiBub3QgaWdub3JlUmV0dXJuQ29kZSBhbmQgcmV0dXJuQ29kZSBpc250IDBcbiAgICAgICAgICAgICAgIyBvcGVyYWJsZSBwcm9ncmFtIG9yIGJhdGNoIGZpbGVcbiAgICAgICAgICAgICAgd2luZG93c1Byb2dyYW1Ob3RGb3VuZE1zZyA9IFwiaXMgbm90IHJlY29nbml6ZWQgYXMgYW4gaW50ZXJuYWwgb3IgZXh0ZXJuYWwgY29tbWFuZFwiXG5cbiAgICAgICAgICAgICAgQHZlcmJvc2Uoc3RkZXJyLCB3aW5kb3dzUHJvZ3JhbU5vdEZvdW5kTXNnKVxuXG4gICAgICAgICAgICAgIGlmIEBpc1dpbmRvd3MoKSBhbmQgcmV0dXJuQ29kZSBpcyAxIGFuZCBzdGRlcnIuaW5kZXhPZih3aW5kb3dzUHJvZ3JhbU5vdEZvdW5kTXNnKSBpc250IC0xXG4gICAgICAgICAgICAgICAgdGhyb3cgQGNvbW1hbmROb3RGb3VuZEVycm9yKGV4ZU5hbWUsIGhlbHApXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RkZXJyIG9yIHN0ZG91dClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgaWYgcmV0dXJuU3Rkb3V0T3JTdGRlcnJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3Rkb3V0IG9yIHN0ZGVyclxuICAgICAgICAgICAgICBlbHNlIGlmIHJldHVyblN0ZGVyclxuICAgICAgICAgICAgICAgIHN0ZGVyclxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3Rkb3V0XG4gICAgICAgICAgKVxuICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PlxuICAgICAgICAgICAgQGRlYnVnKCdlcnJvcicsIGVycilcblxuICAgICAgICAgICAgIyBDaGVjayBpZiBlcnJvciBpcyBFTk9FTlQgKGNvbW1hbmQgY291bGQgbm90IGJlIGZvdW5kKVxuICAgICAgICAgICAgaWYgZXJyLmNvZGUgaXMgJ0VOT0VOVCcgb3IgZXJyLmVycm5vIGlzICdFTk9FTlQnXG4gICAgICAgICAgICAgIHRocm93IEBjb21tYW5kTm90Rm91bmRFcnJvcihleGVOYW1lLCBoZWxwKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAjIGNvbnRpbnVlIGFzIG5vcm1hbCBlcnJvclxuICAgICAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgICAgICApXG4gICAgICApXG5cbiAgcGF0aDogKGNtZCA9IEBjbWQpIC0+XG4gICAgY29uZmlnID0gQGdldENvbmZpZygpXG4gICAgaWYgY29uZmlnIGFuZCBjb25maWcucGF0aFxuICAgICAgUHJvbWlzZS5yZXNvbHZlKGNvbmZpZy5wYXRoKVxuICAgIGVsc2VcbiAgICAgIGV4ZU5hbWUgPSBjbWRcbiAgICAgIEB3aGljaChleGVOYW1lKVxuXG4gIHJlc29sdmVBcmdzOiAoYXJncykgLT5cbiAgICBhcmdzID0gXy5mbGF0dGVuKGFyZ3MpXG4gICAgUHJvbWlzZS5hbGwoYXJncylcblxuICByZWxhdGl2aXplUGF0aHM6IChhcmdzKSAtPlxuICAgIHRtcERpciA9IG9zLnRtcGRpcigpXG4gICAgbmV3QXJncyA9IGFyZ3MubWFwKChhcmcpIC0+XG4gICAgICBpc1RtcEZpbGUgPSAodHlwZW9mIGFyZyBpcyAnc3RyaW5nJyBhbmQgbm90IGFyZy5pbmNsdWRlcygnOicpIGFuZCBcXFxuICAgICAgICBwYXRoLmlzQWJzb2x1dGUoYXJnKSBhbmQgcGF0aC5kaXJuYW1lKGFyZykuc3RhcnRzV2l0aCh0bXBEaXIpKVxuICAgICAgaWYgaXNUbXBGaWxlXG4gICAgICAgIHJldHVybiBwYXRoLnJlbGF0aXZlKHRtcERpciwgYXJnKVxuICAgICAgcmV0dXJuIGFyZ1xuICAgIClcbiAgICBuZXdBcmdzXG5cbiAgIyMjXG4gIFNwYXduXG4gICMjI1xuICBzcGF3bjogKGV4ZSwgYXJncywgb3B0aW9ucywgb25TdGRpbikgLT5cbiAgICAjIFJlbW92ZSB1bmRlZmluZWQvbnVsbCB2YWx1ZXNcbiAgICBhcmdzID0gXy53aXRob3V0KGFyZ3MsIHVuZGVmaW5lZClcbiAgICBhcmdzID0gXy53aXRob3V0KGFyZ3MsIG51bGwpXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIEBkZWJ1Zygnc3Bhd24nLCBleGUsIGFyZ3MpXG5cbiAgICAgIGNtZCA9IHNwYXduKGV4ZSwgYXJncywgb3B0aW9ucylcbiAgICAgIHN0ZG91dCA9IFwiXCJcbiAgICAgIHN0ZGVyciA9IFwiXCJcblxuICAgICAgY21kLnN0ZG91dC5vbignZGF0YScsIChkYXRhKSAtPlxuICAgICAgICBzdGRvdXQgKz0gZGF0YVxuICAgICAgKVxuICAgICAgY21kLnN0ZGVyci5vbignZGF0YScsIChkYXRhKSAtPlxuICAgICAgICBzdGRlcnIgKz0gZGF0YVxuICAgICAgKVxuICAgICAgY21kLm9uKCdjbG9zZScsIChyZXR1cm5Db2RlKSA9PlxuICAgICAgICBAZGVidWcoJ3NwYXduIGRvbmUnLCByZXR1cm5Db2RlLCBzdGRlcnIsIHN0ZG91dClcbiAgICAgICAgcmVzb2x2ZSh7cmV0dXJuQ29kZSwgc3Rkb3V0LCBzdGRlcnJ9KVxuICAgICAgKVxuICAgICAgY21kLm9uKCdlcnJvcicsIChlcnIpID0+XG4gICAgICAgIEBkZWJ1ZygnZXJyb3InLCBlcnIpXG4gICAgICAgIHJlamVjdChlcnIpXG4gICAgICApXG5cbiAgICAgIG9uU3RkaW4gY21kLnN0ZGluIGlmIG9uU3RkaW5cbiAgICApXG5cblxuICAjIyNcbiAgQWRkIGhlbHAgdG8gZXJyb3IuZGVzY3JpcHRpb25cblxuICBOb3RlOiBlcnJvci5kZXNjcmlwdGlvbiBpcyBub3Qgb2ZmaWNpYWxseSB1c2VkIGluIEphdmFTY3JpcHQsXG4gIGhvd2V2ZXIgaXQgaXMgdXNlZCBpbnRlcm5hbGx5IGZvciBBdG9tIEJlYXV0aWZ5IHdoZW4gZGlzcGxheWluZyBlcnJvcnMuXG4gICMjI1xuICBjb21tYW5kTm90Rm91bmRFcnJvcjogKGV4ZSwgaGVscCkgLT5cbiAgICBleGUgPz0gQG5hbWUgb3IgQGNtZFxuICAgIEBjb25zdHJ1Y3Rvci5jb21tYW5kTm90Rm91bmRFcnJvcihleGUsIGhlbHApXG5cbiAgQGNvbW1hbmROb3RGb3VuZEVycm9yOiAoZXhlLCBoZWxwKSAtPlxuICAgICMgQ3JlYXRlIG5ldyBpbXByb3ZlZCBlcnJvclxuICAgICMgbm90aWZ5IHVzZXIgdGhhdCBpdCBtYXkgbm90IGJlXG4gICAgIyBpbnN0YWxsZWQgb3IgaW4gcGF0aFxuICAgIG1lc3NhZ2UgPSBcIkNvdWxkIG5vdCBmaW5kICcje2V4ZX0nLiBcXFxuICAgICAgICAgICAgVGhlIHByb2dyYW0gbWF5IG5vdCBiZSBpbnN0YWxsZWQuXCJcbiAgICBlciA9IG5ldyBFcnJvcihtZXNzYWdlKVxuICAgIGVyLmNvZGUgPSAnQ29tbWFuZE5vdEZvdW5kJ1xuICAgIGVyLmVycm5vID0gZXIuY29kZVxuICAgIGVyLnN5c2NhbGwgPSAnYmVhdXRpZmllcjo6cnVuJ1xuICAgIGVyLmZpbGUgPSBleGVcbiAgICBpZiBoZWxwP1xuICAgICAgaWYgdHlwZW9mIGhlbHAgaXMgXCJvYmplY3RcIlxuICAgICAgICAjIEJhc2ljIG5vdGljZVxuICAgICAgICBkb2NzTGluayA9IFwiaHR0cHM6Ly9naXRodWIuY29tL0dsYXZpbjAwMS9hdG9tLWJlYXV0aWZ5I2JlYXV0aWZpZXJzXCJcbiAgICAgICAgaGVscFN0ciA9IFwiU2VlICN7ZXhlfSBpbnN0YWxsYXRpb24gaW5zdHJ1Y3Rpb25zIGF0ICN7ZG9jc0xpbmt9I3tpZiBoZWxwLmxpbmsgdGhlbiAoJyBvciBnbyB0byAnK2hlbHAubGluaykgZWxzZSAnJ31cXG5cIlxuICAgICAgICAjICMgSGVscCB0byBjb25maWd1cmUgQXRvbSBCZWF1dGlmeSBmb3IgcHJvZ3JhbSdzIHBhdGhcbiAgICAgICAgaGVscFN0ciArPSBcIllvdSBjYW4gY29uZmlndXJlIEF0b20gQmVhdXRpZnkgXFxcbiAgICAgICAgICAgICAgICAgICAgd2l0aCB0aGUgYWJzb2x1dGUgcGF0aCBcXFxuICAgICAgICAgICAgICAgICAgICB0byAnI3toZWxwLnByb2dyYW0gb3IgZXhlfScgYnkgc2V0dGluZyBcXFxuICAgICAgICAgICAgICAgICAgICAnI3toZWxwLnBhdGhPcHRpb259JyBpbiBcXFxuICAgICAgICAgICAgICAgICAgICB0aGUgQXRvbSBCZWF1dGlmeSBwYWNrYWdlIHNldHRpbmdzLlxcblwiIGlmIGhlbHAucGF0aE9wdGlvblxuICAgICAgICBoZWxwU3RyICs9IFwiWW91ciBwcm9ncmFtIGlzIHByb3Blcmx5IGluc3RhbGxlZCBpZiBydW5uaW5nIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyN7aWYgQGlzV2luZG93cygpIHRoZW4gJ3doZXJlLmV4ZScgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlICd3aGljaCd9ICN7ZXhlfScgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbiB5b3VyICN7aWYgQGlzV2luZG93cygpIHRoZW4gJ0NNRCBwcm9tcHQnIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSAnVGVybWluYWwnfSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybnMgYW4gYWJzb2x1dGUgcGF0aCB0byB0aGUgZXhlY3V0YWJsZS5cXG5cIlxuICAgICAgICAjICMgT3B0aW9uYWwsIGFkZGl0aW9uYWwgaGVscFxuICAgICAgICBoZWxwU3RyICs9IGhlbHAuYWRkaXRpb25hbCBpZiBoZWxwLmFkZGl0aW9uYWxcbiAgICAgICAgZXIuZGVzY3JpcHRpb24gPSBoZWxwU3RyXG4gICAgICBlbHNlICNpZiB0eXBlb2YgaGVscCBpcyBcInN0cmluZ1wiXG4gICAgICAgIGVyLmRlc2NyaXB0aW9uID0gaGVscFxuICAgIHJldHVybiBlclxuXG5cbiAgQF9lbnZDYWNoZSA9IG51bGxcbiAgc2hlbGxFbnY6ICgpIC0+XG4gICAgZW52ID0gQGNvbnN0cnVjdG9yLnNoZWxsRW52KClcbiAgICBAZGVidWcoXCJlbnZcIiwgZW52KVxuICAgIHJldHVybiBlbnZcbiAgQHNoZWxsRW52OiAoKSAtPlxuICAgIFByb21pc2UucmVzb2x2ZShwcm9jZXNzLmVudilcblxuICAjIyNcbiAgTGlrZSB0aGUgdW5peCB3aGljaCB1dGlsaXR5LlxuXG4gIEZpbmRzIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiBhIHNwZWNpZmllZCBleGVjdXRhYmxlIGluIHRoZSBQQVRIIGVudmlyb25tZW50IHZhcmlhYmxlLlxuICBEb2VzIG5vdCBjYWNoZSB0aGUgcmVzdWx0cyxcbiAgc28gaGFzaCAtciBpcyBub3QgbmVlZGVkIHdoZW4gdGhlIFBBVEggY2hhbmdlcy5cbiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9pc2FhY3Mvbm9kZS13aGljaFxuICAjIyNcbiAgd2hpY2g6IChleGUsIG9wdGlvbnMpIC0+XG4gICAgQC5jb25zdHJ1Y3Rvci53aGljaChleGUsIG9wdGlvbnMpXG4gIEBfd2hpY2hDYWNoZSA9IHt9XG4gIEB3aGljaDogKGV4ZSwgb3B0aW9ucyA9IHt9KSAtPlxuICAgIGlmIEBfd2hpY2hDYWNoZVtleGVdXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKEBfd2hpY2hDYWNoZVtleGVdKVxuICAgICMgR2V0IFBBVEggYW5kIG90aGVyIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICAgIEBzaGVsbEVudigpXG4gICAgICAudGhlbigoZW52KSA9PlxuICAgICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgICAgIG9wdGlvbnMucGF0aCA/PSBlbnYuUEFUSFxuICAgICAgICAgIGlmIEBpc1dpbmRvd3MoKVxuICAgICAgICAgICAgIyBFbnZpcm9ubWVudCB2YXJpYWJsZXMgYXJlIGNhc2UtaW5zZW5zaXRpdmUgaW4gd2luZG93c1xuICAgICAgICAgICAgIyBDaGVjayBlbnYgZm9yIGEgY2FzZS1pbnNlbnNpdGl2ZSAncGF0aCcgdmFyaWFibGVcbiAgICAgICAgICAgIGlmICFvcHRpb25zLnBhdGhcbiAgICAgICAgICAgICAgZm9yIGkgb2YgZW52XG4gICAgICAgICAgICAgICAgaWYgaS50b0xvd2VyQ2FzZSgpIGlzIFwicGF0aFwiXG4gICAgICAgICAgICAgICAgICBvcHRpb25zLnBhdGggPSBlbnZbaV1cbiAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgICMgVHJpY2sgbm9kZS13aGljaCBpbnRvIGluY2x1ZGluZyBmaWxlc1xuICAgICAgICAgICAgIyB3aXRoIG5vIGV4dGVuc2lvbiBhcyBleGVjdXRhYmxlcy5cbiAgICAgICAgICAgICMgUHV0IGVtcHR5IGV4dGVuc2lvbiBsYXN0IHRvIGFsbG93IGZvciBvdGhlciByZWFsIGV4dGVuc2lvbnMgZmlyc3RcbiAgICAgICAgICAgIG9wdGlvbnMucGF0aEV4dCA/PSBcIiN7cHJvY2Vzcy5lbnYuUEFUSEVYVCA/ICcuRVhFJ307XCJcbiAgICAgICAgICB3aGljaChleGUsIG9wdGlvbnMsIChlcnIsIHBhdGgpID0+XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShleGUpIGlmIGVyclxuICAgICAgICAgICAgQF93aGljaENhY2hlW2V4ZV0gPSBwYXRoXG4gICAgICAgICAgICByZXNvbHZlKHBhdGgpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG5cbiAgIyMjXG4gIElmIHBsYXRmb3JtIGlzIFdpbmRvd3NcbiAgIyMjXG4gIGlzV2luZG93czogKCkgLT4gQGNvbnN0cnVjdG9yLmlzV2luZG93cygpXG4gIEBpc1dpbmRvd3M6ICgpIC0+IG5ldyBSZWdFeHAoJ153aW4nKS50ZXN0KHByb2Nlc3MucGxhdGZvcm0pXG5cbmNsYXNzIEh5YnJpZEV4ZWN1dGFibGUgZXh0ZW5kcyBFeGVjdXRhYmxlXG5cbiAgZG9ja2VyT3B0aW9uczoge1xuICAgIGltYWdlOiB1bmRlZmluZWRcbiAgICB3b3JraW5nRGlyOiBcIi93b3JrZGlyXCJcbiAgfVxuXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICBzdXBlcihvcHRpb25zKVxuICAgIGlmIG9wdGlvbnMuZG9ja2VyP1xuICAgICAgQGRvY2tlck9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBAZG9ja2VyT3B0aW9ucywgb3B0aW9ucy5kb2NrZXIpXG4gICAgICBAZG9ja2VyID0gQGNvbnN0cnVjdG9yLmRvY2tlckV4ZWN1dGFibGUoKVxuXG4gIEBkb2NrZXI6IHVuZGVmaW5lZFxuICBAZG9ja2VyRXhlY3V0YWJsZTogKCkgLT5cbiAgICBpZiBub3QgQGRvY2tlcj9cbiAgICAgIEBkb2NrZXIgPSBuZXcgRXhlY3V0YWJsZSh7XG4gICAgICAgIG5hbWU6IFwiRG9ja2VyXCJcbiAgICAgICAgY21kOiBcImRvY2tlclwiXG4gICAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vd3d3LmRvY2tlci5jb20vXCJcbiAgICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHBzOi8vd3d3LmRvY2tlci5jb20vZ2V0LWRvY2tlclwiXG4gICAgICAgIHZlcnNpb246IHtcbiAgICAgICAgICBwYXJzZTogKHRleHQpIC0+IHRleHQubWF0Y2goL3ZlcnNpb24gWzBdKihbMS05XVxcZCopLlswXSooWzAtOV1cXGQqKS5bMF0qKFswLTldXFxkKikvKS5zbGljZSgxKS5qb2luKCcuJylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICByZXR1cm4gQGRvY2tlclxuXG4gIGluc3RhbGxlZFdpdGhEb2NrZXI6IGZhbHNlXG4gIGluaXQ6ICgpIC0+XG4gICAgc3VwZXIoKVxuICAgICAgLmNhdGNoKChlcnJvcikgPT5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKSBpZiBub3QgQGRvY2tlcj9cbiAgICAgICAgQGRvY2tlci5pbml0KClcbiAgICAgICAgICAudGhlbig9PiBAcnVuSW1hZ2UoQHZlcnNpb25BcmdzLCBAdmVyc2lvblJ1bk9wdGlvbnMpKVxuICAgICAgICAgIC50aGVuKCh0ZXh0KSA9PiBAc2F2ZVZlcnNpb24odGV4dCkpXG4gICAgICAgICAgLnRoZW4oKCkgPT4gQGluc3RhbGxlZFdpdGhEb2NrZXIgPSB0cnVlKVxuICAgICAgICAgIC50aGVuKD0+IEApXG4gICAgICAgICAgLmNhdGNoKChkb2NrZXJFcnJvcikgPT5cbiAgICAgICAgICAgIEBkZWJ1Zyhkb2NrZXJFcnJvcilcbiAgICAgICAgICAgIFByb21pc2UucmVqZWN0KGVycm9yKVxuICAgICAgICAgIClcbiAgICAgIClcblxuICBydW46IChhcmdzLCBvcHRpb25zID0ge30pIC0+XG4gICAgaWYgQGluc3RhbGxlZFdpdGhEb2NrZXIgYW5kIEBkb2NrZXIgYW5kIEBkb2NrZXIuaXNJbnN0YWxsZWRcbiAgICAgIHJldHVybiBAcnVuSW1hZ2UoYXJncywgb3B0aW9ucylcbiAgICBzdXBlcihhcmdzLCBvcHRpb25zKVxuXG4gIHJ1bkltYWdlOiAoYXJncywgb3B0aW9ucykgLT5cbiAgICBAZGVidWcoXCJSdW4gRG9ja2VyIGV4ZWN1dGFibGU6IFwiLCBhcmdzLCBvcHRpb25zKVxuICAgIHRoaXMucmVzb2x2ZUFyZ3MoYXJncylcbiAgICAgIC50aGVuKChhcmdzKSA9PlxuICAgICAgICB7IGN3ZCB9ID0gb3B0aW9uc1xuICAgICAgICB0bXBEaXIgPSBvcy50bXBkaXIoKVxuICAgICAgICBwd2QgPSBmcy5yZWFscGF0aFN5bmMoY3dkIG9yIHRtcERpcilcbiAgICAgICAgaW1hZ2UgPSBAZG9ja2VyT3B0aW9ucy5pbWFnZVxuICAgICAgICB3b3JraW5nRGlyID0gQGRvY2tlck9wdGlvbnMud29ya2luZ0RpclxuXG4gICAgICAgIHJvb3RQYXRoID0gJy9tb3VudGVkUm9vdCdcbiAgICAgICAgbmV3QXJncyA9IGFyZ3MubWFwKChhcmcpIC0+XG4gICAgICAgICAgaWYgKHR5cGVvZiBhcmcgaXMgJ3N0cmluZycgYW5kIG5vdCBhcmcuaW5jbHVkZXMoJzonKSBcXFxuICAgICAgICAgICAgYW5kIHBhdGguaXNBYnNvbHV0ZShhcmcpIGFuZCBub3QgcGF0aC5kaXJuYW1lKGFyZykuc3RhcnRzV2l0aCh0bXBEaXIpKVxuICAgICAgICAgICAgdGhlbiBwYXRoLmpvaW4ocm9vdFBhdGgsIGFyZykgZWxzZSBhcmdcbiAgICAgICAgKVxuXG4gICAgICAgIEBkb2NrZXIucnVuKFtcbiAgICAgICAgICAgIFwicnVuXCIsXG4gICAgICAgICAgICBcIi0tdm9sdW1lXCIsIFwiI3twd2R9OiN7d29ya2luZ0Rpcn1cIixcbiAgICAgICAgICAgIFwiLS12b2x1bWVcIiwgXCIje3BhdGgucmVzb2x2ZSgnLycpfToje3Jvb3RQYXRofVwiLFxuICAgICAgICAgICAgXCItLXdvcmtkaXJcIiwgd29ya2luZ0RpcixcbiAgICAgICAgICAgIGltYWdlLFxuICAgICAgICAgICAgbmV3QXJnc1xuICAgICAgICAgIF0sXG4gICAgICAgICAgb3B0aW9uc1xuICAgICAgICApXG4gICAgICApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBIeWJyaWRFeGVjdXRhYmxlXG4iXX0=
