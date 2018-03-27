(function() {
  var CompositeDisposable, Directory, _os, cpConfigFileName, fs, helpers, path, ref, voucher,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  ref = require('atom'), Directory = ref.Directory, CompositeDisposable = ref.CompositeDisposable;

  _os = null;

  path = null;

  helpers = null;

  voucher = null;

  fs = null;

  cpConfigFileName = '.classpath';

  module.exports = {
    activate: function(state) {
      this.state = state ? state || {} : void 0;
      this.patterns = {
        en: {
          detector: /^\d+ (error|warning)s?$/gm,
          pattern: /^(.*\.java):(\d+): (error|warning): (.+)/,
          translation: {
            'error': 'error',
            'warning': 'warning'
          }
        },
        zh: {
          detector: /^\d+ 个?(错误|警告)$/gm,
          pattern: /^(.*\.java):(\d+): (错误|警告): (.+)/,
          translation: {
            '错误': 'error',
            '警告': 'warning'
          }
        }
      };
      require('atom-package-deps').install('linter-javac');
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('linter-javac.javacExecutablePath', (function(_this) {
        return function(newValue) {
          return _this.javaExecutablePath = newValue.trim();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-javac.additionalClasspaths', (function(_this) {
        return function(newValue) {
          return _this.classpath = newValue.trim();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-javac.additionalJavacOptions', (function(_this) {
        return function(newValue) {
          var trimmedValue;
          trimmedValue = newValue.trim();
          if (trimmedValue) {
            return _this.additionalOptions = trimmedValue.split(/\s+/);
          } else {
            return _this.additionalOptions = [];
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-javac.classpathFilename', (function(_this) {
        return function(newValue) {
          return _this.classpathFilename = newValue.trim();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-javac.javacArgsFilename', (function(_this) {
        return function(newValue) {
          return _this.javacArgsFilename = newValue.trim();
        };
      })(this)));
      return this.subscriptions.add(atom.config.observe('linter-javac.verboseLogging', (function(_this) {
        return function(newValue) {
          return _this.verboseLogging = newValue === true;
        };
      })(this)));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    serialize: function() {
      return this.state;
    },
    provideLinter: function() {
      if (_os === null) {
        _os = require('os');
        path = require('path');
        helpers = require('atom-linter');
        voucher = require('voucher');
        fs = require('fs');
        if (this.verboseLogging) {
          this._log('requiring modules finished.');
        }
      }
      if (this.verboseLogging) {
        this._log('providing linter, examining javac-callability.');
      }
      return {
        grammarScopes: ['source.java'],
        scope: 'project',
        lintOnFly: false,
        lint: (function(_this) {
          return function(textEditor) {
            var cp, cpConfig, filePath, lstats, searchDir, wd;
            filePath = textEditor.getPath();
            wd = path.dirname(filePath);
            searchDir = _this.getProjectRootDir() || path.dirname(filePath);
            cp = '';
            if (_this.verboseLogging) {
              _this._log('starting to lint.');
            }
            cpConfig = _this.findClasspathConfig(wd);
            if (cpConfig != null) {
              wd = cpConfig.cfgDir;
              cp = cpConfig.cfgCp;
              searchDir = wd;
            }
            if (_this.classpath) {
              cp += path.delimiter + _this.classpath;
            }
            if (process.env.CLASSPATH) {
              cp += path.delimiter + process.env.CLASSPATH;
            }
            if (_this.verboseLogging) {
              _this._log('start searching java-files with "', searchDir, '" as search-directory.');
            }
            lstats = fs.lstatSync(searchDir);
            return atom.project.repositoryForDirectory(new Directory(searchDir, lstats.isSymbolicLink())).then(function(repo) {
              return _this.getFilesEndingWith(searchDir, '.java', repo != null ? repo.isPathIgnored.bind(repo) : void 0);
            }).then(function(files) {
              var arg, args, cliLimit, expectedCmdSize, j, len, sliceIndex;
              args = ['-Xlint:all'];
              if (cp) {
                args = args.concat(['-cp', cp]);
              }
              if (_this.additionalOptions.length > 0) {
                args = args.concat(_this.additionalOptions);
                if (_this.verboseLogging) {
                  _this._log('adding', _this.additionalOptions.length, 'additional javac-options.');
                }
              }
              if (_this.verboseLogging) {
                _this._log('collected the following arguments:', args.join(' '));
              }
              if (_this.javacArgsFilename) {
                args.push('@' + _this.javacArgsFilename);
                if (_this.verboseLogging) {
                  _this._log('adding', _this.javacArgsFilename, 'as argsfile.');
                }
              }
              args.push.apply(args, files);
              if (_this.verboseLogging) {
                _this._log('adding', files.length, 'files to the javac-arguments (from "', files[0], '" to "', files[files.length - 1], '").');
              }
              cliLimit = _os.platform() === 'win32' ? 7900 : 130000;
              expectedCmdSize = _this.javaExecutablePath.length;
              sliceIndex = 0;
              for (j = 0, len = args.length; j < len; j++) {
                arg = args[j];
                expectedCmdSize++;
                if ((typeof arg) === 'string') {
                  expectedCmdSize += arg.length;
                } else {
                  expectedCmdSize += arg.toString().length;
                }
                if (expectedCmdSize < cliLimit) {
                  sliceIndex++;
                }
              }
              if (sliceIndex < (args.length - 1)) {
                console.warn("linter-javac: The lint-command is presumed to break the limit of " + cliLimit + " characters on the " + (_os.platform()) + "-platform.\nDropping " + (args.length - sliceIndex) + " source files, as a result javac may not resolve all dependencies.");
                args = args.slice(0, sliceIndex);
                args.push(filePath);
              }
              if (_this.verboseLogging) {
                _this._log('calling javac with', args.length, 'arguments by invoking "', _this.javaExecutablePath, '". The approximated command length is', args.join(' ').length, 'characters long, the last argument is:', args[args.length - 1]);
              }
              return helpers.exec(_this.javaExecutablePath, args, {
                stream: 'stderr',
                cwd: wd,
                allowEmptyStderr: true
              }).then(function(val) {
                if (_this.verboseLogging) {
                  _this._log('parsing:\n', val);
                }
                return _this.parse(val, textEditor);
              });
            });
          };
        })(this)
      };
    },
    parse: function(javacOutput, textEditor) {
      var column, file, j, languageCode, lastIndex, len, line, lineNum, lines, match, mess, messages, ref1, type;
      languageCode = this._detectLanguageCode(javacOutput);
      messages = [];
      if (languageCode) {
        if (this.caretRegex == null) {
          this.caretRegex = /^( *)\^/;
        }
        lines = javacOutput.split(/\r?\n/);
        for (j = 0, len = lines.length; j < len; j++) {
          line = lines[j];
          match = line.match(this.patterns[languageCode].pattern);
          if (!!match) {
            ref1 = match.slice(1, 5), file = ref1[0], lineNum = ref1[1], type = ref1[2], mess = ref1[3];
            lineNum--;
            messages.push({
              type: this.patterns[languageCode].translation[type] || 'info',
              text: mess,
              filePath: file,
              range: [[lineNum, 0], [lineNum, 0]]
            });
          } else {
            match = line.match(this.caretRegex);
            if (messages.length > 0 && !!match) {
              column = match[1].length;
              lastIndex = messages.length - 1;
              messages[lastIndex].range[0][1] = column;
              messages[lastIndex].range[1][1] = column + 1;
            }
          }
        }
        if (this.verboseLogging) {
          this._log('returning', messages.length, 'linter-messages.');
        }
      }
      return messages;
    },
    getProjectRootDir: function() {
      var textEditor;
      textEditor = atom.workspace.getActiveTextEditor();
      if (!textEditor || !textEditor.getPath()) {
        if (!atom.project.getPaths().length) {
          return false;
        }
        return atom.project.getPaths()[0];
      }
      return atom.project.getPaths().sort(function(a, b) {
        return b.length - a.length;
      }).find(function(p) {
        var realpath;
        realpath = fs.realpathSync(p);
        return textEditor.getPath().substr(0, realpath.length) === realpath;
      });
    },
    getFilesEndingWith: function(startPath, endsWith, ignoreFn) {
      var folderFiles, foundFiles;
      foundFiles = [];
      folderFiles = [];
      return voucher(fs.readdir, startPath).then(function(files) {
        folderFiles = files;
        return Promise.all(files.map(function(f) {
          var filename;
          filename = path.join(startPath, f);
          return voucher(fs.lstat, filename);
        }));
      }).then((function(_this) {
        return function(fileStats) {
          var mapped;
          mapped = fileStats.map(function(stats, i) {
            var filename;
            filename = path.join(startPath, folderFiles[i]);
            if (typeof ignoreFn === "function" ? ignoreFn(filename) : void 0) {
              return void 0;
            } else if (stats.isDirectory()) {
              return _this.getFilesEndingWith(filename, endsWith, ignoreFn);
            } else if (filename.endsWith(endsWith)) {
              return [filename];
            }
          });
          return Promise.all(mapped.filter(Boolean));
        };
      })(this)).then(function(fileArrays) {
        return [].concat.apply([], fileArrays);
      });
    },
    findClasspathConfig: function(d) {
      var e, file, result;
      while (atom.project.contains(d) || (indexOf.call(atom.project.getPaths(), d) >= 0)) {
        try {
          file = path.join(d, this.classpathFilename);
          result = {
            cfgCp: fs.readFileSync(file, {
              encoding: 'utf-8'
            }),
            cfgDir: d
          };
          result.cfgCp = result.cfgCp.trim();
          return result;
        } catch (error) {
          e = error;
          d = path.dirname(d);
        }
      }
      return null;
    },
    _detectLanguageCode: function(javacOutput) {
      var language, pattern, ref1;
      if (this.verboseLogging) {
        this._log('detecting languages');
      }
      ref1 = this.patterns;
      for (language in ref1) {
        pattern = ref1[language];
        if (javacOutput.match(pattern.detector)) {
          if (this.verboseLogging) {
            this._log('detected the following language-code:', language);
          }
          return language;
        }
      }
      return false;
    },
    _log: function() {
      var javacPrefix, msgs;
      msgs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (msgs.length > 0) {
        javacPrefix = 'linter-javac: ';
        return console.log(javacPrefix + msgs.join(' '));
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyLWphdmFjL2xpYi9pbml0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsc0ZBQUE7SUFBQTs7O0VBQUEsTUFBbUMsT0FBQSxDQUFRLE1BQVIsQ0FBbkMsRUFBQyx5QkFBRCxFQUFZOztFQUVaLEdBQUEsR0FBTTs7RUFDTixJQUFBLEdBQU87O0VBQ1AsT0FBQSxHQUFVOztFQUNWLE9BQUEsR0FBVTs7RUFDVixFQUFBLEdBQUs7O0VBRUwsZ0JBQUEsR0FBbUI7O0VBRW5CLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BRVIsSUFBQyxDQUFBLEtBQUQsR0FBWSxLQUFILEdBQWMsS0FBQSxJQUFTLEVBQXZCLEdBQUE7TUFFVCxJQUFDLENBQUEsUUFBRCxHQUNFO1FBQUEsRUFBQSxFQUNFO1VBQUEsUUFBQSxFQUFVLDJCQUFWO1VBQ0EsT0FBQSxFQUFTLDBDQURUO1VBRUEsV0FBQSxFQUNFO1lBQUEsT0FBQSxFQUFTLE9BQVQ7WUFDQSxTQUFBLEVBQVcsU0FEWDtXQUhGO1NBREY7UUFNQSxFQUFBLEVBQ0U7VUFBQSxRQUFBLEVBQVUsbUJBQVY7VUFDQSxPQUFBLEVBQVMsa0NBRFQ7VUFFQSxXQUFBLEVBQ0U7WUFBQSxJQUFBLEVBQU0sT0FBTjtZQUNBLElBQUEsRUFBTSxTQUROO1dBSEY7U0FQRjs7TUFhRixPQUFBLENBQVEsbUJBQVIsQ0FBNEIsQ0FBQyxPQUE3QixDQUFxQyxjQUFyQztNQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLGtDQUFwQixFQUNFLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxRQUFEO2lCQUNFLEtBQUMsQ0FB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S0FBWixDQUFrQixPQUFPLENBQUMsUUFBMUIsQ0FBSDtVQUNFLElBQUcsSUFBQyxDQUFBLGNBQUo7WUFDRSxJQUFDLENBQUEsSUFBRCxDQUFNLHVDQUFOLEVBQStDLFFBQS9DLEVBREY7O0FBRUEsaUJBQU8sU0FIVDs7QUFERjtBQU1BLGFBQU87SUFUWSxDQTdSckI7SUF3U0EsSUFBQSxFQUFNLFNBQUE7QUFDSixVQUFBO01BREs7TUFDTCxJQUFJLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBbEI7UUFDRSxXQUFBLEdBQWM7ZUFDZCxPQUFPLENBQUMsR0FBUixDQUFZLFdBQUEsR0FBYyxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsQ0FBMUIsRUFGRjs7SUFESSxDQXhTTjs7QUFYRiIsInNvdXJjZXNDb250ZW50IjpbIntEaXJlY3RvcnksIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbiMgcmVxdWlyZSBzdGF0ZW1lbnRzIHdlcmUgbW92ZWQgaW50byB0aGUgcHJvdmlkZUxpbnRlci1mdW5jdGlvblxuX29zID0gbnVsbFxucGF0aCA9IG51bGxcbmhlbHBlcnMgPSBudWxsXG52b3VjaGVyID0gbnVsbFxuZnMgPSBudWxsXG5cbmNwQ29uZmlnRmlsZU5hbWUgPSAnLmNsYXNzcGF0aCdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgICMgc3RhdGUtb2JqZWN0IGFzIHByZXBhcmF0aW9uIGZvciB1c2VyLW5vdGlmaWNhdGlvbnNcbiAgICBAc3RhdGUgPSBpZiBzdGF0ZSB0aGVuIHN0YXRlIG9yIHt9XG4gICAgIyBsYW5ndWFnZS1wYXR0ZXJuc1xuICAgIEBwYXR0ZXJucyA9XG4gICAgICBlbjpcbiAgICAgICAgZGV0ZWN0b3I6IC9eXFxkKyAoZXJyb3J8d2FybmluZylzPyQvZ21cbiAgICAgICAgcGF0dGVybjogL14oLipcXC5qYXZhKTooXFxkKyk6IChlcnJvcnx3YXJuaW5nKTogKC4rKS9cbiAgICAgICAgdHJhbnNsYXRpb246XG4gICAgICAgICAgJ2Vycm9yJzogJ2Vycm9yJ1xuICAgICAgICAgICd3YXJuaW5nJzogJ3dhcm5pbmcnXG4gICAgICB6aDpcbiAgICAgICAgZGV0ZWN0b3I6IC9eXFxkKyDkuKo/KOmUmeivr3zorablkYopJC9nbVxuICAgICAgICBwYXR0ZXJuOiAvXiguKlxcLmphdmEpOihcXGQrKTogKOmUmeivr3zorablkYopOiAoLispL1xuICAgICAgICB0cmFuc2xhdGlvbjpcbiAgICAgICAgICAn6ZSZ6K+vJzogJ2Vycm9yJ1xuICAgICAgICAgICforablkYonOiAnd2FybmluZydcblxuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnbGludGVyLWphdmFjJylcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSAnbGludGVyLWphdmFjLmphdmFjRXhlY3V0YWJsZVBhdGgnLFxuICAgICAgICAobmV3VmFsdWUpID0+XG4gICAgICAgICAgQGphdmFFeGVjdXRhYmxlUGF0aCA9IG5ld1ZhbHVlLnRyaW0oKVxuICAgIClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICdsaW50ZXItamF2YWMuYWRkaXRpb25hbENsYXNzcGF0aHMnLFxuICAgICAgICAobmV3VmFsdWUpID0+XG4gICAgICAgICAgQGNsYXNzcGF0aCA9IG5ld1ZhbHVlLnRyaW0oKVxuICAgIClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICdsaW50ZXItamF2YWMuYWRkaXRpb25hbEphdmFjT3B0aW9ucycsXG4gICAgICAgIChuZXdWYWx1ZSkgPT5cbiAgICAgICAgICB0cmltbWVkVmFsdWUgPSBuZXdWYWx1ZS50cmltKClcbiAgICAgICAgICBpZiB0cmltbWVkVmFsdWVcbiAgICAgICAgICAgIEBhZGRpdGlvbmFsT3B0aW9ucyA9IHRyaW1tZWRWYWx1ZS5zcGxpdCgvXFxzKy8pXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGFkZGl0aW9uYWxPcHRpb25zID0gW11cbiAgICAgIClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICdsaW50ZXItamF2YWMuY2xhc3NwYXRoRmlsZW5hbWUnLFxuICAgICAgICAobmV3VmFsdWUpID0+XG4gICAgICAgICAgQGNsYXNzcGF0aEZpbGVuYW1lID0gbmV3VmFsdWUudHJpbSgpXG4gICAgKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUgJ2xpbnRlci1qYXZhYy5qYXZhY0FyZ3NGaWxlbmFtZScsXG4gICAgICAgIChuZXdWYWx1ZSkgPT5cbiAgICAgICAgICBAamF2YWNBcmdzRmlsZW5hbWUgPSBuZXdWYWx1ZS50cmltKClcbiAgICApXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSAnbGludGVyLWphdmFjLnZlcmJvc2VMb2dnaW5nJyxcbiAgICAgICAgKG5ld1ZhbHVlKSA9PlxuICAgICAgICAgIEB2ZXJib3NlTG9nZ2luZyA9IChuZXdWYWx1ZSA9PSB0cnVlKVxuICAgIClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIHNlcmlhbGl6ZTogLT5cbiAgICByZXR1cm4gQHN0YXRlXG5cbiAgcHJvdmlkZUxpbnRlcjogLT5cbiAgICAjIGRvaW5nIHJlcXVpcmVtZW50IGhlcmUgaXMgbG93ZXJpbmcgbG9hZC10aW1lXG4gICAgaWYgX29zID09IG51bGxcbiAgICAgIF9vcyA9IHJlcXVpcmUgJ29zJ1xuICAgICAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG4gICAgICBoZWxwZXJzID0gcmVxdWlyZSAnYXRvbS1saW50ZXInXG4gICAgICB2b3VjaGVyID0gcmVxdWlyZSAndm91Y2hlcidcbiAgICAgIGZzID0gcmVxdWlyZSAnZnMnXG4gICAgICBpZiBAdmVyYm9zZUxvZ2dpbmdcbiAgICAgICAgQF9sb2cgJ3JlcXVpcmluZyBtb2R1bGVzIGZpbmlzaGVkLidcblxuICAgIGlmIEB2ZXJib3NlTG9nZ2luZ1xuICAgICAgQF9sb2cgJ3Byb3ZpZGluZyBsaW50ZXIsIGV4YW1pbmluZyBqYXZhYy1jYWxsYWJpbGl0eS4nXG5cbiAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5qYXZhJ11cbiAgICBzY29wZTogJ3Byb2plY3QnXG4gICAgbGludE9uRmx5OiBmYWxzZSAgICAgICAjIE9ubHkgbGludCBvbiBzYXZlXG4gICAgbGludDogKHRleHRFZGl0b3IpID0+XG4gICAgICBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpXG4gICAgICB3ZCA9IHBhdGguZGlybmFtZSBmaWxlUGF0aFxuICAgICAgc2VhcmNoRGlyID0gQGdldFByb2plY3RSb290RGlyKCkgfHwgcGF0aC5kaXJuYW1lIGZpbGVQYXRoXG4gICAgICAjIENsYXNzcGF0aFxuICAgICAgY3AgPSAnJ1xuXG4gICAgICBpZiBAdmVyYm9zZUxvZ2dpbmdcbiAgICAgICAgQF9sb2cgJ3N0YXJ0aW5nIHRvIGxpbnQuJ1xuXG4gICAgICAjIEZpbmQgcHJvamVjdCBjb25maWcgZmlsZSBpZiBpdCBleGlzdHMuXG4gICAgICBjcENvbmZpZyA9IEBmaW5kQ2xhc3NwYXRoQ29uZmlnKHdkKVxuICAgICAgaWYgY3BDb25maWc/XG4gICAgICAgICMgVXNlIHRoZSBsb2NhdGlvbiBvZiB0aGUgY29uZmlnIGZpbGUgYXMgdGhlIHdvcmtpbmcgZGlyZWN0b3J5XG4gICAgICAgIHdkID0gY3BDb25maWcuY2ZnRGlyXG4gICAgICAgICMgVXNlIGNvbmZpZ3VyZWQgY2xhc3NwYXRoXG4gICAgICAgIGNwID0gY3BDb25maWcuY2ZnQ3BcbiAgICAgICAgIyBVc2UgY29uZmlnIGZpbGUgbG9jYXRpb24gdG8gaW1wb3J0IGNvcnJlY3QgZmlsZXNcbiAgICAgICAgc2VhcmNoRGlyID0gd2RcblxuICAgICAgIyBBZGQgZXh0cmEgY2xhc3NwYXRoIGlmIHByb3ZpZGVkXG4gICAgICBjcCArPSBwYXRoLmRlbGltaXRlciArIEBjbGFzc3BhdGggaWYgQGNsYXNzcGF0aFxuXG4gICAgICAjIEFkZCBlbnZpcm9ubWVudCB2YXJpYWJsZSBpZiBpdCBleGlzdHNcbiAgICAgIGNwICs9IHBhdGguZGVsaW1pdGVyICsgcHJvY2Vzcy5lbnYuQ0xBU1NQQVRIIGlmIHByb2Nlc3MuZW52LkNMQVNTUEFUSFxuXG4gICAgICBpZiBAdmVyYm9zZUxvZ2dpbmdcbiAgICAgICAgQF9sb2cgJ3N0YXJ0IHNlYXJjaGluZyBqYXZhLWZpbGVzIHdpdGggXCInLFxuICAgICAgICAgIHNlYXJjaERpcixcbiAgICAgICAgICAnXCIgYXMgc2VhcmNoLWRpcmVjdG9yeS4nXG5cbiAgICAgIGxzdGF0cyA9IGZzLmxzdGF0U3luYyBzZWFyY2hEaXJcblxuICAgICAgYXRvbS5wcm9qZWN0LnJlcG9zaXRvcnlGb3JEaXJlY3RvcnkoXG4gICAgICAgIG5ldyBEaXJlY3Rvcnkoc2VhcmNoRGlyLCBsc3RhdHMuaXNTeW1ib2xpY0xpbmsoKSlcbiAgICAgIClcbiAgICAgICAgLnRoZW4gKHJlcG8pID0+XG4gICAgICAgICAgQGdldEZpbGVzRW5kaW5nV2l0aCBzZWFyY2hEaXIsXG4gICAgICAgICAgICAnLmphdmEnLCByZXBvPy5pc1BhdGhJZ25vcmVkLmJpbmQocmVwbylcbiAgICAgICAgLnRoZW4gKGZpbGVzKSA9PlxuICAgICAgICAgICMgQXJndW1lbnRzIHRvIGphdmFjXG4gICAgICAgICAgYXJncyA9IFsnLVhsaW50OmFsbCddXG4gICAgICAgICAgYXJncyA9IGFyZ3MuY29uY2F0KFsnLWNwJywgY3BdKSBpZiBjcFxuXG4gICAgICAgICAgIyBhZGQgYWRkaXRpb25hbCBvcHRpb25zIHRvIHRoZSBhcmdzLWFycmF5XG4gICAgICAgICAgaWYgQGFkZGl0aW9uYWxPcHRpb25zLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdCBAYWRkaXRpb25hbE9wdGlvbnNcbiAgICAgICAgICAgIGlmIEB2ZXJib3NlTG9nZ2luZ1xuICAgICAgICAgICAgICBAX2xvZyAnYWRkaW5nJyxcbiAgICAgICAgICAgICAgICBAYWRkaXRpb25hbE9wdGlvbnMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICdhZGRpdGlvbmFsIGphdmFjLW9wdGlvbnMuJ1xuXG4gICAgICAgICAgaWYgQHZlcmJvc2VMb2dnaW5nXG4gICAgICAgICAgICBAX2xvZyAnY29sbGVjdGVkIHRoZSBmb2xsb3dpbmcgYXJndW1lbnRzOicsIGFyZ3Muam9pbignICcpXG5cbiAgICAgICAgICAjIGFkZCBqYXZhYyBhcmdzZmlsZSBpZiBmaWxlbmFtZSBoYXMgYmVlbiBjb25maWd1cmVkXG4gICAgICAgICAgaWYgQGphdmFjQXJnc0ZpbGVuYW1lXG4gICAgICAgICAgICBhcmdzLnB1c2goJ0AnICsgQGphdmFjQXJnc0ZpbGVuYW1lKVxuICAgICAgICAgICAgaWYgQHZlcmJvc2VMb2dnaW5nXG4gICAgICAgICAgICAgIEBfbG9nICdhZGRpbmcnLCBAamF2YWNBcmdzRmlsZW5hbWUsICdhcyBhcmdzZmlsZS4nXG5cbiAgICAgICAgICBhcmdzLnB1c2guYXBwbHkoYXJncywgZmlsZXMpXG4gICAgICAgICAgaWYgQHZlcmJvc2VMb2dnaW5nXG4gICAgICAgICAgICBAX2xvZyAnYWRkaW5nJyxcbiAgICAgICAgICAgICAgZmlsZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAnZmlsZXMgdG8gdGhlIGphdmFjLWFyZ3VtZW50cyAoZnJvbSBcIicsXG4gICAgICAgICAgICAgIGZpbGVzWzBdLFxuICAgICAgICAgICAgICAnXCIgdG8gXCInLFxuICAgICAgICAgICAgICBmaWxlc1tmaWxlcy5sZW5ndGggLSAxXVxuICAgICAgICAgICAgICAnXCIpLidcblxuICAgICAgICAgICMgVE9ETzogcmVtb3ZlIHRoaXMgcXVpY2sgZml4XG4gICAgICAgICAgIyBjb3VudCB0aGUgc2l6ZSBvZiBleHBlY3RlZCBleGVjdXRpb24tY29tbWFuZFxuICAgICAgICAgICMgc2VlIGlzc3VlICM1OCBmb3IgZnVydGhlciBkZXRhaWxzXG4gICAgICAgICAgY2xpTGltaXQgPSBpZiBfb3MucGxhdGZvcm0oKSA9PSAnd2luMzInIHRoZW4gNzkwMCBlbHNlIDEzMDAwMFxuICAgICAgICAgIGV4cGVjdGVkQ21kU2l6ZSA9IEBqYXZhRXhlY3V0YWJsZVBhdGgubGVuZ3RoXG4gICAgICAgICAgc2xpY2VJbmRleCA9IDBcbiAgICAgICAgICBmb3IgYXJnIGluIGFyZ3NcbiAgICAgICAgICAgIGV4cGVjdGVkQ21kU2l6ZSsrICMgYWRkIHByZXBlbmRpbmcgc3BhY2VcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXJnKSA9PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICBleHBlY3RlZENtZFNpemUgKz0gYXJnLmxlbmd0aFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBleHBlY3RlZENtZFNpemUgKz0gYXJnLnRvU3RyaW5nKCkubGVuZ3RoXG4gICAgICAgICAgICBpZiBleHBlY3RlZENtZFNpemUgPCBjbGlMaW1pdFxuICAgICAgICAgICAgICBzbGljZUluZGV4KytcblxuICAgICAgICAgIGlmIHNsaWNlSW5kZXggPCAoYXJncy5sZW5ndGggLSAxKVxuICAgICAgICAgICAgIyBjb2ZmZWVsaW50OiBkaXNhYmxlPW1heF9saW5lX2xlbmd0aFxuICAgICAgICAgICAgY29uc29sZS53YXJuIFwiXCJcIlxuICBsaW50ZXItamF2YWM6IFRoZSBsaW50LWNvbW1hbmQgaXMgcHJlc3VtZWQgdG8gYnJlYWsgdGhlIGxpbWl0IG9mICN7Y2xpTGltaXR9IGNoYXJhY3RlcnMgb24gdGhlICN7X29zLnBsYXRmb3JtKCl9LXBsYXRmb3JtLlxuICBEcm9wcGluZyAje2FyZ3MubGVuZ3RoIC0gc2xpY2VJbmRleH0gc291cmNlIGZpbGVzLCBhcyBhIHJlc3VsdCBqYXZhYyBtYXkgbm90IHJlc29sdmUgYWxsIGRlcGVuZGVuY2llcy5cbiAgXCJcIlwiXG4gICAgICAgICAgICAjIGNvZmZlZWxpbnQ6IGVuYWJsZT1tYXhfbGluZV9sZW5ndGhcbiAgICAgICAgICAgIGFyZ3MgPSBhcmdzLnNsaWNlKDAsIHNsaWNlSW5kZXgpICMgY3V0IGFyZ3MgZG93blxuICAgICAgICAgICAgYXJncy5wdXNoKGZpbGVQYXRoKSAjIGVuc3VyZSBhY3R1YWwgZmlsZSBpcyBwYXJ0XG5cblxuICAgICAgICAgIGlmIEB2ZXJib3NlTG9nZ2luZ1xuICAgICAgICAgICAgQF9sb2cgJ2NhbGxpbmcgamF2YWMgd2l0aCcsXG4gICAgICAgICAgICAgIGFyZ3MubGVuZ3RoLFxuICAgICAgICAgICAgICAnYXJndW1lbnRzIGJ5IGludm9raW5nIFwiJywgQGphdmFFeGVjdXRhYmxlUGF0aCxcbiAgICAgICAgICAgICAgJ1wiLiBUaGUgYXBwcm94aW1hdGVkIGNvbW1hbmQgbGVuZ3RoIGlzJyxcbiAgICAgICAgICAgICAgYXJncy5qb2luKCcgJykubGVuZ3RoLFxuICAgICAgICAgICAgICAnY2hhcmFjdGVycyBsb25nLCB0aGUgbGFzdCBhcmd1bWVudCBpczonLFxuICAgICAgICAgICAgICBhcmdzW2FyZ3MubGVuZ3RoIC0gMV1cblxuICAgICAgICAgICMgRXhlY3V0ZSBqYXZhY1xuICAgICAgICAgIGhlbHBlcnMuZXhlYyhAamF2YUV4ZWN1dGFibGVQYXRoLCBhcmdzLCB7XG4gICAgICAgICAgICBzdHJlYW06ICdzdGRlcnInLFxuICAgICAgICAgICAgY3dkOiB3ZCxcbiAgICAgICAgICAgIGFsbG93RW1wdHlTdGRlcnI6IHRydWVcbiAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4gKHZhbCkgPT5cbiAgICAgICAgICAgICAgaWYgQHZlcmJvc2VMb2dnaW5nXG4gICAgICAgICAgICAgICAgQF9sb2cgJ3BhcnNpbmc6XFxuJywgdmFsXG4gICAgICAgICAgICAgIEBwYXJzZSh2YWwsIHRleHRFZGl0b3IpXG5cbiAgcGFyc2U6IChqYXZhY091dHB1dCwgdGV4dEVkaXRvcikgLT5cbiAgICBsYW5ndWFnZUNvZGUgPSBAX2RldGVjdExhbmd1YWdlQ29kZSBqYXZhY091dHB1dFxuICAgIG1lc3NhZ2VzID0gW11cbiAgICBpZiBsYW5ndWFnZUNvZGVcbiAgICAgICMgVGhpcyByZWdleCBoZWxwcyB0byBlc3RpbWF0ZSB0aGUgY29sdW1uIG51bWJlciBiYXNlZCBvbiB0aGVcbiAgICAgICMgICBjYXJldCAoXikgbG9jYXRpb24uXG4gICAgICBAY2FyZXRSZWdleCA/PSAvXiggKilcXF4vXG4gICAgICAjIFNwbGl0IGludG8gbGluZXNcbiAgICAgIGxpbmVzID0gamF2YWNPdXRwdXQuc3BsaXQgL1xccj9cXG4vXG5cbiAgICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgIG1hdGNoID0gbGluZS5tYXRjaCBAcGF0dGVybnNbbGFuZ3VhZ2VDb2RlXS5wYXR0ZXJuXG4gICAgICAgIGlmICEhbWF0Y2hcbiAgICAgICAgICBbZmlsZSwgbGluZU51bSwgdHlwZSwgbWVzc10gPSBtYXRjaFsxLi40XVxuICAgICAgICAgIGxpbmVOdW0tLSAjIEZpeCByYW5nZS1iZWdpbm5pbmdcbiAgICAgICAgICBtZXNzYWdlcy5wdXNoXG4gICAgICAgICAgICB0eXBlOiBAcGF0dGVybnNbbGFuZ3VhZ2VDb2RlXS50cmFuc2xhdGlvblt0eXBlXSB8fCAnaW5mbydcbiAgICAgICAgICAgIHRleHQ6IG1lc3MgICAgICAgIyBUaGUgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgZmlsZVBhdGg6IGZpbGUgICAjIEZ1bGwgcGF0aCB0byBmaWxlXG4gICAgICAgICAgICByYW5nZTogW1tsaW5lTnVtLCAwXSwgW2xpbmVOdW0sIDBdXSAjIFNldCByYW5nZS1iZWdpbm5pbmdzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBtYXRjaCA9IGxpbmUubWF0Y2ggQGNhcmV0UmVnZXhcbiAgICAgICAgICBpZiBtZXNzYWdlcy5sZW5ndGggPiAwICYmICEhbWF0Y2hcbiAgICAgICAgICAgIGNvbHVtbiA9IG1hdGNoWzFdLmxlbmd0aFxuICAgICAgICAgICAgbGFzdEluZGV4ID0gbWVzc2FnZXMubGVuZ3RoIC0gMVxuICAgICAgICAgICAgbWVzc2FnZXNbbGFzdEluZGV4XS5yYW5nZVswXVsxXSA9IGNvbHVtblxuICAgICAgICAgICAgbWVzc2FnZXNbbGFzdEluZGV4XS5yYW5nZVsxXVsxXSA9IGNvbHVtbiArIDFcbiAgICAgIGlmIEB2ZXJib3NlTG9nZ2luZ1xuICAgICAgICBAX2xvZyAncmV0dXJuaW5nJywgbWVzc2FnZXMubGVuZ3RoLCAnbGludGVyLW1lc3NhZ2VzLidcblxuICAgIHJldHVybiBtZXNzYWdlc1xuXG4gIGdldFByb2plY3RSb290RGlyOiAtPlxuICAgIHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpZiAhdGV4dEVkaXRvciB8fCAhdGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICAgICMgZGVmYXVsdCB0byBidWlsZGluZyB0aGUgZmlyc3Qgb25lIGlmIG5vIGVkaXRvciBpcyBhY3RpdmVcbiAgICAgIGlmIG5vdCBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKS5sZW5ndGhcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgIHJldHVybiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXVxuXG4gICAgIyBvdGhlcndpc2UsIGJ1aWxkIHRoZSBvbmUgaW4gdGhlIHJvb3Qgb2YgdGhlIGFjdGl2ZSBlZGl0b3JcbiAgICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICAgIC5zb3J0KChhLCBiKSAtPiAoYi5sZW5ndGggLSBhLmxlbmd0aCkpXG4gICAgICAuZmluZCAocCkgLT5cbiAgICAgICAgcmVhbHBhdGggPSBmcy5yZWFscGF0aFN5bmMocClcbiAgICAgICAgIyBUT0RPOiBUaGUgZm9sbG93aW5nIGZhaWxzIGlmIHRoZXJlJ3MgYSBzeW1saW5rIGluIHRoZSBwYXRoXG4gICAgICAgIHJldHVybiB0ZXh0RWRpdG9yLmdldFBhdGgoKS5zdWJzdHIoMCwgcmVhbHBhdGgubGVuZ3RoKSA9PSByZWFscGF0aFxuXG4gIGdldEZpbGVzRW5kaW5nV2l0aDogKHN0YXJ0UGF0aCwgZW5kc1dpdGgsIGlnbm9yZUZuKSAtPlxuICAgIGZvdW5kRmlsZXMgPSBbXVxuICAgIGZvbGRlckZpbGVzID0gW11cbiAgICB2b3VjaGVyIGZzLnJlYWRkaXIsIHN0YXJ0UGF0aFxuICAgICAgLnRoZW4gKGZpbGVzKSAtPlxuICAgICAgICBmb2xkZXJGaWxlcyA9IGZpbGVzXG4gICAgICAgIFByb21pc2UuYWxsIGZpbGVzLm1hcCAoZikgLT5cbiAgICAgICAgICBmaWxlbmFtZSA9IHBhdGguam9pbiBzdGFydFBhdGgsIGZcbiAgICAgICAgICB2b3VjaGVyIGZzLmxzdGF0LCBmaWxlbmFtZVxuICAgICAgLnRoZW4gKGZpbGVTdGF0cykgPT5cbiAgICAgICAgbWFwcGVkID0gZmlsZVN0YXRzLm1hcCAoc3RhdHMsIGkpID0+XG4gICAgICAgICAgZmlsZW5hbWUgPSBwYXRoLmpvaW4gc3RhcnRQYXRoLCBmb2xkZXJGaWxlc1tpXVxuICAgICAgICAgIGlmIGlnbm9yZUZuPyhmaWxlbmFtZSlcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgICBlbHNlIGlmIHN0YXRzLmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgIHJldHVybiBAZ2V0RmlsZXNFbmRpbmdXaXRoIGZpbGVuYW1lLCBlbmRzV2l0aCwgaWdub3JlRm5cbiAgICAgICAgICBlbHNlIGlmIGZpbGVuYW1lLmVuZHNXaXRoKGVuZHNXaXRoKVxuICAgICAgICAgICAgcmV0dXJuIFsgZmlsZW5hbWUgXVxuXG4gICAgICAgIFByb21pc2UuYWxsKG1hcHBlZC5maWx0ZXIoQm9vbGVhbikpXG5cbiAgICAgIC50aGVuIChmaWxlQXJyYXlzKSAtPlxuICAgICAgICBbXS5jb25jYXQuYXBwbHkoW10sIGZpbGVBcnJheXMpXG5cbiAgZmluZENsYXNzcGF0aENvbmZpZzogKGQpIC0+XG4gICAgIyBTZWFyY2ggZm9yIHRoZSAuY2xhc3NwYXRoIGZpbGUgc3RhcnRpbmcgaW4gdGhlIGdpdmVuIGRpcmVjdG9yeVxuICAgICMgYW5kIHNlYXJjaGluZyBwYXJlbnQgZGlyZWN0b3JpZXMgdW50aWwgaXQgaXMgZm91bmQsIG9yIHdlIGdvIG91dHNpZGUgdGhlXG4gICAgIyBwcm9qZWN0IGJhc2UgZGlyZWN0b3J5LlxuICAgIHdoaWxlIGF0b20ucHJvamVjdC5jb250YWlucyhkKSBvciAoZCBpbiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKSlcbiAgICAgIHRyeVxuICAgICAgICBmaWxlID0gcGF0aC5qb2luIGQsIEBjbGFzc3BhdGhGaWxlbmFtZVxuICAgICAgICByZXN1bHQgPVxuICAgICAgICAgIGNmZ0NwOiBmcy5yZWFkRmlsZVN5bmMoZmlsZSwgeyBlbmNvZGluZzogJ3V0Zi04JyB9KVxuICAgICAgICAgIGNmZ0RpcjogZFxuICAgICAgICByZXN1bHQuY2ZnQ3AgPSByZXN1bHQuY2ZnQ3AudHJpbSgpXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgZCA9IHBhdGguZGlybmFtZShkKVxuXG4gICAgcmV0dXJuIG51bGxcblxuICBfZGV0ZWN0TGFuZ3VhZ2VDb2RlOiAoamF2YWNPdXRwdXQpIC0+XG4gICAgaWYgQHZlcmJvc2VMb2dnaW5nXG4gICAgICBAX2xvZyAnZGV0ZWN0aW5nIGxhbmd1YWdlcydcbiAgICBmb3IgbGFuZ3VhZ2UsIHBhdHRlcm4gb2YgQHBhdHRlcm5zXG4gICAgICBpZiBqYXZhY091dHB1dC5tYXRjaChwYXR0ZXJuLmRldGVjdG9yKVxuICAgICAgICBpZiBAdmVyYm9zZUxvZ2dpbmdcbiAgICAgICAgICBAX2xvZyAnZGV0ZWN0ZWQgdGhlIGZvbGxvd2luZyBsYW5ndWFnZS1jb2RlOicsIGxhbmd1YWdlXG4gICAgICAgIHJldHVybiBsYW5ndWFnZVxuXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgX2xvZzogKG1zZ3MuLi4pIC0+XG4gICAgaWYgKG1zZ3MubGVuZ3RoID4gMClcbiAgICAgIGphdmFjUHJlZml4ID0gJ2xpbnRlci1qYXZhYzogJ1xuICAgICAgY29uc29sZS5sb2cgamF2YWNQcmVmaXggKyBtc2dzLmpvaW4oJyAnKVxuIl19
