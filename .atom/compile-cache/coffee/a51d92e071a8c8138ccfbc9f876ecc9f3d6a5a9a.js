(function() {
  var Beautifier, Beautifiers, Executable, Languages, Promise, _, beautifiers, fs, isWindows, path, temp;

  Beautifiers = require("../src/beautifiers");

  Executable = require("../src/beautifiers/executable");

  beautifiers = new Beautifiers();

  Beautifier = require("../src/beautifiers/beautifier");

  Languages = require('../src/languages/');

  _ = require('lodash');

  fs = require('fs');

  path = require('path');

  Promise = require("bluebird");

  temp = require('temp');

  temp.track();

  isWindows = process.platform === 'win32' || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';

  describe("Atom-Beautify", function() {
    beforeEach(function() {
      return waitsForPromise(function() {
        var activationPromise, pack;
        activationPromise = atom.packages.activatePackage('atom-beautify');
        pack = atom.packages.getLoadedPackage("atom-beautify");
        pack.activateNow();
        atom.config.set('atom-beautify.general.loggerLevel', 'info');
        return activationPromise;
      });
    });
    afterEach(function() {
      return temp.cleanupSync();
    });
    describe("Beautifiers", function() {
      var beautifier;
      beautifier = null;
      beforeEach(function() {
        return beautifier = new Beautifier();
      });
      return describe("Beautifier::run", function() {
        it("should error when beautifier's program not found", function() {
          expect(beautifier).not.toBe(null);
          expect(beautifier instanceof Beautifier).toBe(true);
          return waitsForPromise({
            shouldReject: true
          }, function() {
            var cb, p;
            p = beautifier.run("program", []);
            expect(p).not.toBe(null);
            expect(p instanceof beautifier.Promise).toBe(true);
            cb = function(v) {
              expect(v).not.toBe(null);
              expect(v instanceof Error).toBe(true);
              expect(v.code).toBe("CommandNotFound");
              expect(v.description).toBe(void 0, 'Error should not have a description.');
              return v;
            };
            p.then(cb, cb);
            return p;
          });
        });
        it("should error with help description when beautifier's program not found", function() {
          expect(beautifier).not.toBe(null);
          expect(beautifier instanceof Beautifier).toBe(true);
          return waitsForPromise({
            shouldReject: true
          }, function() {
            var cb, help, p;
            help = {
              link: "http://test.com",
              program: "test-program",
              pathOption: "Lang - Test Program Path"
            };
            p = beautifier.run("program", [], {
              help: help
            });
            expect(p).not.toBe(null);
            expect(p instanceof beautifier.Promise).toBe(true);
            cb = function(v) {
              expect(v).not.toBe(null);
              expect(v instanceof Error).toBe(true);
              expect(v.code).toBe("CommandNotFound");
              expect(v.description).not.toBe(null);
              expect(v.description.indexOf(help.link)).not.toBe(-1);
              expect(v.description.indexOf(help.program)).not.toBe(-1);
              expect(v.description.indexOf(help.pathOption)).not.toBe(-1, "Error should have a description.");
              return v;
            };
            p.then(cb, cb);
            return p;
          });
        });
        it("should error with Windows-specific help description when beautifier's program not found", function() {
          expect(beautifier).not.toBe(null);
          expect(beautifier instanceof Beautifier).toBe(true);
          return waitsForPromise({
            shouldReject: true
          }, function() {
            var cb, help, p, terminal, whichCmd;
            help = {
              link: "http://test.com",
              program: "test-program",
              pathOption: "Lang - Test Program Path"
            };
            Executable.isWindows = function() {
              return true;
            };
            terminal = 'CMD prompt';
            whichCmd = "where.exe";
            p = beautifier.run("program", [], {
              help: help
            });
            expect(p).not.toBe(null);
            expect(p instanceof beautifier.Promise).toBe(true);
            cb = function(v) {
              console.log("error", v, v.description);
              expect(v).not.toBe(null);
              expect(v instanceof Error).toBe(true);
              expect(v.code).toBe("CommandNotFound");
              expect(v.description).not.toBe(null);
              expect(v.description.indexOf(help.link)).not.toBe(-1);
              expect(v.description.indexOf(help.program)).not.toBe(-1);
              expect(v.description.indexOf(help.pathOption)).not.toBe(-1, "Error should have a description.");
              expect(v.description.indexOf(terminal)).not.toBe(-1, "Error should have a description including '" + terminal + "' in message.");
              expect(v.description.indexOf(whichCmd)).not.toBe(-1, "Error should have a description including '" + whichCmd + "' in message.");
              return v;
            };
            p.then(cb, cb);
            return p;
          });
        });
        if (!isWindows) {
          return it("should error with Mac/Linux-specific help description when beautifier's program not found", function() {
            expect(beautifier).not.toBe(null);
            expect(beautifier instanceof Beautifier).toBe(true);
            return waitsForPromise({
              shouldReject: true
            }, function() {
              var cb, help, p, terminal, whichCmd;
              help = {
                link: "http://test.com",
                program: "test-program",
                pathOption: "Lang - Test Program Path"
              };
              Executable.isWindows = function() {
                return false;
              };
              terminal = "Terminal";
              whichCmd = "which";
              p = beautifier.run("program", [], {
                help: help
              });
              expect(p).not.toBe(null);
              expect(p instanceof beautifier.Promise).toBe(true);
              cb = function(v) {
                expect(v).not.toBe(null);
                expect(v instanceof Error).toBe(true);
                expect(v.code).toBe("CommandNotFound");
                expect(v.description).not.toBe(null);
                expect(v.description.indexOf(help.link)).not.toBe(-1);
                expect(v.description.indexOf(help.program)).not.toBe(-1);
                expect(v.description.indexOf(terminal)).not.toBe(-1, "Error should have a description including '" + terminal + "' in message.");
                expect(v.description.indexOf(whichCmd)).not.toBe(-1, "Error should have a description including '" + whichCmd + "' in message.");
                return v;
              };
              p.then(cb, cb);
              return p;
            });
          });
        }
      });
    });
    return describe("Options", function() {
      var beautifier, beautifyEditor, editor, workspaceElement;
      editor = null;
      beautifier = null;
      workspaceElement = atom.views.getView(atom.workspace);
      beforeEach(function() {
        beautifier = new Beautifiers();
        return waitsForPromise(function() {
          return atom.workspace.open().then(function(e) {
            editor = e;
            return expect(editor.getText()).toEqual("");
          });
        });
      });
      describe("Migrate Settings", function() {
        var migrateSettings;
        migrateSettings = function(beforeKey, afterKey, val) {
          atom.config.set("atom-beautify." + beforeKey, val);
          atom.commands.dispatch(workspaceElement, "atom-beautify:migrate-settings");
          expect(_.has(atom.config.get('atom-beautify'), beforeKey)).toBe(false);
          return expect(atom.config.get("atom-beautify." + afterKey)).toBe(val);
        };
        it("should migrate js_indent_size to js.indent_size", function() {
          migrateSettings("js_indent_size", "js.indent_size", 1);
          return migrateSettings("js_indent_size", "js.indent_size", 10);
        });
        it("should migrate analytics to general.analytics", function() {
          migrateSettings("analytics", "general.analytics", true);
          return migrateSettings("analytics", "general.analytics", false);
        });
        it("should migrate _analyticsUserId to general._analyticsUserId", function() {
          migrateSettings("_analyticsUserId", "general._analyticsUserId", "userid");
          return migrateSettings("_analyticsUserId", "general._analyticsUserId", "userid2");
        });
        it("should migrate language_js_disabled to js.disabled", function() {
          migrateSettings("language_js_disabled", "js.disabled", false);
          return migrateSettings("language_js_disabled", "js.disabled", true);
        });
        it("should migrate language_js_default_beautifier to js.default_beautifier", function() {
          migrateSettings("language_js_default_beautifier", "js.default_beautifier", "Pretty Diff");
          return migrateSettings("language_js_default_beautifier", "js.default_beautifier", "JS Beautify");
        });
        return it("should migrate language_js_beautify_on_save to js.beautify_on_save", function() {
          migrateSettings("language_js_beautify_on_save", "js.beautify_on_save", true);
          return migrateSettings("language_js_beautify_on_save", "js.beautify_on_save", false);
        });
      });
      beautifyEditor = function(callback) {
        var beforeText, delay, isComplete;
        isComplete = false;
        beforeText = null;
        delay = 500;
        runs(function() {
          beforeText = editor.getText();
          atom.commands.dispatch(workspaceElement, "atom-beautify:beautify-editor");
          return setTimeout(function() {
            return isComplete = true;
          }, delay);
        });
        waitsFor(function() {
          return isComplete;
        });
        return runs(function() {
          var afterText;
          afterText = editor.getText();
          expect(typeof beforeText).toBe('string');
          expect(typeof afterText).toBe('string');
          return callback(beforeText, afterText);
        });
      };
      return describe("JavaScript", function() {
        beforeEach(function() {
          waitsForPromise(function() {
            var packName;
            packName = 'language-javascript';
            return atom.packages.activatePackage(packName);
          });
          return runs(function() {
            var code, grammar;
            code = "var hello='world';function(){console.log('hello '+hello)}";
            editor.setText(code);
            grammar = atom.grammars.selectGrammar('source.js');
            expect(grammar.name).toBe('JavaScript');
            editor.setGrammar(grammar);
            expect(editor.getGrammar().name).toBe('JavaScript');
            return jasmine.unspy(window, 'setTimeout');
          });
        });
        describe(".jsbeautifyrc", function() {
          return it("should look at directories above file", function() {
            var cb, isDone;
            isDone = false;
            cb = function(err) {
              isDone = true;
              return expect(err).toBe(void 0);
            };
            runs(function() {
              var err;
              try {
                return temp.mkdir('dir1', function(err, dirPath) {
                  var myData, myData1, rcPath;
                  if (err) {
                    return cb(err);
                  }
                  rcPath = path.join(dirPath, '.jsbeautifyrc');
                  myData1 = {
                    indent_size: 1,
                    indent_char: '\t'
                  };
                  myData = JSON.stringify(myData1);
                  return fs.writeFile(rcPath, myData, function(err) {
                    if (err) {
                      return cb(err);
                    }
                    dirPath = path.join(dirPath, 'dir2');
                    return fs.mkdir(dirPath, function(err) {
                      var myData2;
                      if (err) {
                        return cb(err);
                      }
                      rcPath = path.join(dirPath, '.jsbeautifyrc');
                      myData2 = {
                        indent_size: 2,
                        indent_char: ' '
                      };
                      myData = JSON.stringify(myData2);
                      return fs.writeFile(rcPath, myData, function(err) {
                        if (err) {
                          return cb(err);
                        }
                        return Promise.all(beautifier.getOptionsForPath(rcPath, null)).then(function(allOptions) {
                          var config1, config2, configOptions, editorConfigOptions, editorOptions, homeOptions, projectOptions, ref;
                          editorOptions = allOptions[0], configOptions = allOptions[1], homeOptions = allOptions[2], editorConfigOptions = allOptions[3];
                          projectOptions = allOptions.slice(4);
                          ref = projectOptions.slice(-2), config1 = ref[0], config2 = ref[1];
                          expect(_.get(config1, '_default.indent_size')).toBe(myData1.indent_size);
                          expect(_.get(config2, '_default.indent_size')).toBe(myData2.indent_size);
                          expect(_.get(config1, '_default.indent_char')).toBe(myData1.indent_char);
                          expect(_.get(config2, '_default.indent_char')).toBe(myData2.indent_char);
                          return cb();
                        });
                      });
                    });
                  });
                });
              } catch (error) {
                err = error;
                return cb(err);
              }
            });
            return waitsFor(function() {
              return isDone;
            });
          });
        });
        return describe("Package settings", function() {
          var getOptions;
          getOptions = function(callback) {
            var options;
            options = null;
            waitsForPromise(function() {
              var allOptions;
              allOptions = beautifier.getOptionsForPath(null, null);
              return Promise.all(allOptions).then(function(allOptions) {
                return options = allOptions;
              });
            });
            return runs(function() {
              return callback(options);
            });
          };
          it("should change indent_size to 1", function() {
            atom.config.set('atom-beautify.js.indent_size', 1);
            return getOptions(function(allOptions) {
              var configOptions;
              expect(typeof allOptions).toBe('object');
              configOptions = allOptions[1];
              expect(typeof configOptions).toBe('object');
              expect(configOptions.js.indent_size).toBe(1);
              return beautifyEditor(function(beforeText, afterText) {
                return expect(afterText).toBe("var hello = 'world';\n\nfunction() {\n console.log('hello ' + hello)\n}");
              });
            });
          });
          return it("should change indent_size to 10", function() {
            atom.config.set('atom-beautify.js.indent_size', 10);
            return getOptions(function(allOptions) {
              var configOptions;
              expect(typeof allOptions).toBe('object');
              configOptions = allOptions[1];
              expect(typeof configOptions).toBe('object');
              expect(configOptions.js.indent_size).toBe(10);
              return beautifyEditor(function(beforeText, afterText) {
                return expect(afterText).toBe("var hello = 'world';\n\nfunction() {\n          console.log('hello ' + hello)\n}");
              });
            });
          });
        });
      });
    });
  });

  describe("Languages", function() {
    var languages;
    languages = null;
    beforeEach(function() {
      return languages = new Languages();
    });
    return describe("Languages::namespace", function() {
      return it("should verify that multiple languages do not share the same namespace", function() {
        var namespaceGroups, namespaceOverlap, namespacePairs;
        namespaceGroups = _.groupBy(languages.languages, "namespace");
        namespacePairs = _.toPairs(namespaceGroups);
        namespaceOverlap = _.filter(namespacePairs, function(arg) {
          var group, namespace;
          namespace = arg[0], group = arg[1];
          return group.length > 1;
        });
        return expect(namespaceOverlap.length).toBe(0, "Language namespaces are overlapping.\nNamespaces are unique: only one language for each namespace.\n" + _.map(namespaceOverlap, function(arg) {
          var group, namespace;
          namespace = arg[0], group = arg[1];
          return "- '" + namespace + "': Check languages " + (_.map(group, 'name').join(', ')) + " for using namespace '" + namespace + "'.";
        }).join('\n'));
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcGVjL2F0b20tYmVhdXRpZnktc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsb0JBQVI7O0VBQ2QsVUFBQSxHQUFhLE9BQUEsQ0FBUSwrQkFBUjs7RUFDYixXQUFBLEdBQWtCLElBQUEsV0FBQSxDQUFBOztFQUNsQixVQUFBLEdBQWEsT0FBQSxDQUFRLCtCQUFSOztFQUNiLFNBQUEsR0FBWSxPQUFBLENBQVEsbUJBQVI7O0VBQ1osQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUNKLEVBQUEsR0FBTyxPQUFBLENBQVEsSUFBUjs7RUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztFQUNWLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxJQUFJLENBQUMsS0FBTCxDQUFBOztFQVFBLFNBQUEsR0FBWSxPQUFPLENBQUMsUUFBUixLQUFvQixPQUFwQixJQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBWixLQUFzQixRQURaLElBRVYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFaLEtBQXNCOztFQUV4QixRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBO0lBRXhCLFVBQUEsQ0FBVyxTQUFBO2FBR1QsZUFBQSxDQUFnQixTQUFBO0FBQ2QsWUFBQTtRQUFBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixlQUE5QjtRQUVwQixJQUFBLEdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixlQUEvQjtRQUNQLElBQUksQ0FBQyxXQUFMLENBQUE7UUFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUNBQWhCLEVBQXFELE1BQXJE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QSxHQUVBLENBQUMsQ0FBQyxHQUFGLENBQU0sZ0JBQU4sRUFBd0IsU0FBQyxHQUFEO0FBQXdCLGNBQUE7VUFBdEIsb0JBQVc7aUJBQVcsS0FBQSxHQUFNLFNBQU4sR0FBZ0IscUJBQWhCLEdBQW9DLENBQUMsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxLQUFOLEVBQWEsTUFBYixDQUFvQixDQUFDLElBQXJCLENBQTBCLElBQTFCLENBQUQsQ0FBcEMsR0FBcUUsd0JBQXJFLEdBQTZGLFNBQTdGLEdBQXVHO1FBQS9ILENBQXhCLENBQTJKLENBQUMsSUFBNUosQ0FBaUssSUFBakssQ0FIRjtNQU4wRSxDQUE1RTtJQUYrQixDQUFqQztFQVBvQixDQUF0QjtBQXpaQSIsInNvdXJjZXNDb250ZW50IjpbIkJlYXV0aWZpZXJzID0gcmVxdWlyZSBcIi4uL3NyYy9iZWF1dGlmaWVyc1wiXG5FeGVjdXRhYmxlID0gcmVxdWlyZSBcIi4uL3NyYy9iZWF1dGlmaWVycy9leGVjdXRhYmxlXCJcbmJlYXV0aWZpZXJzID0gbmV3IEJlYXV0aWZpZXJzKClcbkJlYXV0aWZpZXIgPSByZXF1aXJlIFwiLi4vc3JjL2JlYXV0aWZpZXJzL2JlYXV0aWZpZXJcIlxuTGFuZ3VhZ2VzID0gcmVxdWlyZSgnLi4vc3JjL2xhbmd1YWdlcy8nKVxuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5mcyAgID0gcmVxdWlyZSgnZnMnKVxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuUHJvbWlzZSA9IHJlcXVpcmUoXCJibHVlYmlyZFwiKVxudGVtcCA9IHJlcXVpcmUoJ3RlbXAnKVxudGVtcC50cmFjaygpXG5cbiMgVXNlIHRoZSBjb21tYW5kIGB3aW5kb3c6cnVuLXBhY2thZ2Utc3BlY3NgIChjbWQtYWx0LWN0cmwtcCkgdG8gcnVuIHNwZWNzLlxuI1xuIyBUbyBydW4gYSBzcGVjaWZpYyBgaXRgIG9yIGBkZXNjcmliZWAgYmxvY2sgYWRkIGFuIGBmYCB0byB0aGUgZnJvbnQgKGUuZy4gYGZpdGBcbiMgb3IgYGZkZXNjcmliZWApLiBSZW1vdmUgdGhlIGBmYCB0byB1bmZvY3VzIHRoZSBibG9jay5cblxuIyBDaGVjayBpZiBXaW5kb3dzXG5pc1dpbmRvd3MgPSBwcm9jZXNzLnBsYXRmb3JtIGlzICd3aW4zMicgb3JcbiAgcHJvY2Vzcy5lbnYuT1NUWVBFIGlzICdjeWd3aW4nIG9yXG4gIHByb2Nlc3MuZW52Lk9TVFlQRSBpcyAnbXN5cydcblxuZGVzY3JpYmUgXCJBdG9tLUJlYXV0aWZ5XCIsIC0+XG5cbiAgYmVmb3JlRWFjaCAtPlxuXG4gICAgIyBBY3RpdmF0ZSBwYWNrYWdlXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBhY3RpdmF0aW9uUHJvbWlzZSA9IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdG9tLWJlYXV0aWZ5JylcbiAgICAgICMgRm9yY2UgYWN0aXZhdGUgcGFja2FnZVxuICAgICAgcGFjayA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZShcImF0b20tYmVhdXRpZnlcIilcbiAgICAgIHBhY2suYWN0aXZhdGVOb3coKVxuICAgICAgIyBDaGFuZ2UgbG9nZ2VyIGxldmVsXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F0b20tYmVhdXRpZnkuZ2VuZXJhbC5sb2dnZXJMZXZlbCcsICdpbmZvJylcbiAgICAgICMgUmV0dXJuIHByb21pc2VcbiAgICAgIHJldHVybiBhY3RpdmF0aW9uUHJvbWlzZVxuXG4gIGFmdGVyRWFjaCAtPlxuICAgIHRlbXAuY2xlYW51cFN5bmMoKVxuXG4gIGRlc2NyaWJlIFwiQmVhdXRpZmllcnNcIiwgLT5cblxuICAgIGJlYXV0aWZpZXIgPSBudWxsXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBiZWF1dGlmaWVyID0gbmV3IEJlYXV0aWZpZXIoKVxuXG4gICAgZGVzY3JpYmUgXCJCZWF1dGlmaWVyOjpydW5cIiwgLT5cblxuICAgICAgaXQgXCJzaG91bGQgZXJyb3Igd2hlbiBiZWF1dGlmaWVyJ3MgcHJvZ3JhbSBub3QgZm91bmRcIiwgLT5cbiAgICAgICAgZXhwZWN0KGJlYXV0aWZpZXIpLm5vdC50b0JlKG51bGwpXG4gICAgICAgIGV4cGVjdChiZWF1dGlmaWVyIGluc3RhbmNlb2YgQmVhdXRpZmllcikudG9CZSh0cnVlKVxuXG4gICAgICAgICMgd2FpdHNGb3JSdW5zID0gKGZuLCBtZXNzYWdlLCB0aW1lb3V0KSAtPlxuICAgICAgICAjICAgICBpc0NvbXBsZXRlZCA9IGZhbHNlXG4gICAgICAgICMgICAgIGNvbXBsZXRlZCA9IC0+XG4gICAgICAgICMgICAgICAgICBjb25zb2xlLmxvZygnY29tcGxldGVkJylcbiAgICAgICAgIyAgICAgICAgIGlzQ29tcGxldGVkID0gdHJ1ZVxuICAgICAgICAjICAgICBydW5zIC0+XG4gICAgICAgICMgICAgICAgICBjb25zb2xlLmxvZygncnVucycpXG4gICAgICAgICMgICAgICAgICBmbihjb21wbGV0ZWQpXG4gICAgICAgICMgICAgIHdhaXRzRm9yKC0+XG4gICAgICAgICMgICAgICAgICBjb25zb2xlLmxvZygnd2FpdHNGb3InLCBpc0NvbXBsZXRlZClcbiAgICAgICAgIyAgICAgICAgIGlzQ29tcGxldGVkXG4gICAgICAgICMgICAgICwgbWVzc2FnZSwgdGltZW91dClcbiAgICAgICAgI1xuICAgICAgICAjIHdhaXRzRm9yUnVucygoY2IpIC0+XG4gICAgICAgICMgICAgIGNvbnNvbGUubG9nKCd3YWl0c0ZvclJ1bnMnLCBjYilcbiAgICAgICAgIyAgICAgc2V0VGltZW91dChjYiwgMjAwMClcbiAgICAgICAgIyAsIFwiV2FpdGluZyBmb3IgYmVhdXRpZmljYXRpb24gdG8gY29tcGxldGVcIiwgNTAwMClcblxuICAgICAgICB3YWl0c0ZvclByb21pc2Ugc2hvdWxkUmVqZWN0OiB0cnVlLCAtPlxuICAgICAgICAgIHAgPSBiZWF1dGlmaWVyLnJ1bihcInByb2dyYW1cIiwgW10pXG4gICAgICAgICAgZXhwZWN0KHApLm5vdC50b0JlKG51bGwpXG4gICAgICAgICAgZXhwZWN0KHAgaW5zdGFuY2VvZiBiZWF1dGlmaWVyLlByb21pc2UpLnRvQmUodHJ1ZSlcbiAgICAgICAgICBjYiA9ICh2KSAtPlxuICAgICAgICAgICAgIyBjb25zb2xlLmxvZyh2KVxuICAgICAgICAgICAgZXhwZWN0KHYpLm5vdC50b0JlKG51bGwpXG4gICAgICAgICAgICBleHBlY3QodiBpbnN0YW5jZW9mIEVycm9yKS50b0JlKHRydWUpXG4gICAgICAgICAgICBleHBlY3Qodi5jb2RlKS50b0JlKFwiQ29tbWFuZE5vdEZvdW5kXCIpXG4gICAgICAgICAgICBleHBlY3Qodi5kZXNjcmlwdGlvbikudG9CZSh1bmRlZmluZWQsIFxcXG4gICAgICAgICAgICAgICdFcnJvciBzaG91bGQgbm90IGhhdmUgYSBkZXNjcmlwdGlvbi4nKVxuICAgICAgICAgICAgcmV0dXJuIHZcbiAgICAgICAgICBwLnRoZW4oY2IsIGNiKVxuICAgICAgICAgIHJldHVybiBwXG5cbiAgICAgIGl0IFwic2hvdWxkIGVycm9yIHdpdGggaGVscCBkZXNjcmlwdGlvbiBcXFxuICAgICAgICAgICAgICAgIHdoZW4gYmVhdXRpZmllcidzIHByb2dyYW0gbm90IGZvdW5kXCIsIC0+XG4gICAgICAgIGV4cGVjdChiZWF1dGlmaWVyKS5ub3QudG9CZShudWxsKVxuICAgICAgICBleHBlY3QoYmVhdXRpZmllciBpbnN0YW5jZW9mIEJlYXV0aWZpZXIpLnRvQmUodHJ1ZSlcblxuICAgICAgICB3YWl0c0ZvclByb21pc2Ugc2hvdWxkUmVqZWN0OiB0cnVlLCAtPlxuICAgICAgICAgIGhlbHAgPSB7XG4gICAgICAgICAgICBsaW5rOiBcImh0dHA6Ly90ZXN0LmNvbVwiXG4gICAgICAgICAgICBwcm9ncmFtOiBcInRlc3QtcHJvZ3JhbVwiXG4gICAgICAgICAgICBwYXRoT3B0aW9uOiBcIkxhbmcgLSBUZXN0IFByb2dyYW0gUGF0aFwiXG4gICAgICAgICAgfVxuICAgICAgICAgIHAgPSBiZWF1dGlmaWVyLnJ1bihcInByb2dyYW1cIiwgW10sIGhlbHA6IGhlbHApXG4gICAgICAgICAgZXhwZWN0KHApLm5vdC50b0JlKG51bGwpXG4gICAgICAgICAgZXhwZWN0KHAgaW5zdGFuY2VvZiBiZWF1dGlmaWVyLlByb21pc2UpLnRvQmUodHJ1ZSlcbiAgICAgICAgICBjYiA9ICh2KSAtPlxuICAgICAgICAgICAgIyBjb25zb2xlLmxvZyh2KVxuICAgICAgICAgICAgZXhwZWN0KHYpLm5vdC50b0JlKG51bGwpXG4gICAgICAgICAgICBleHBlY3QodiBpbnN0YW5jZW9mIEVycm9yKS50b0JlKHRydWUpXG4gICAgICAgICAgICBleHBlY3Qodi5jb2RlKS50b0JlKFwiQ29tbWFuZE5vdEZvdW5kXCIpXG4gICAgICAgICAgICBleHBlY3Qodi5kZXNjcmlwdGlvbikubm90LnRvQmUobnVsbClcbiAgICAgICAgICAgIGV4cGVjdCh2LmRlc2NyaXB0aW9uLmluZGV4T2YoaGVscC5saW5rKSkubm90LnRvQmUoLTEpXG4gICAgICAgICAgICBleHBlY3Qodi5kZXNjcmlwdGlvbi5pbmRleE9mKGhlbHAucHJvZ3JhbSkpLm5vdC50b0JlKC0xKVxuICAgICAgICAgICAgZXhwZWN0KHYuZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgLmluZGV4T2YoaGVscC5wYXRoT3B0aW9uKSkubm90LnRvQmUoLTEsIFxcXG4gICAgICAgICAgICAgIFwiRXJyb3Igc2hvdWxkIGhhdmUgYSBkZXNjcmlwdGlvbi5cIilcbiAgICAgICAgICAgIHJldHVybiB2XG4gICAgICAgICAgcC50aGVuKGNiLCBjYilcbiAgICAgICAgICByZXR1cm4gcFxuXG4gICAgICBpdCBcInNob3VsZCBlcnJvciB3aXRoIFdpbmRvd3Mtc3BlY2lmaWMgaGVscCBkZXNjcmlwdGlvbiBcXFxuICAgICAgICAgICAgICAgIHdoZW4gYmVhdXRpZmllcidzIHByb2dyYW0gbm90IGZvdW5kXCIsIC0+XG4gICAgICAgIGV4cGVjdChiZWF1dGlmaWVyKS5ub3QudG9CZShudWxsKVxuICAgICAgICBleHBlY3QoYmVhdXRpZmllciBpbnN0YW5jZW9mIEJlYXV0aWZpZXIpLnRvQmUodHJ1ZSlcblxuICAgICAgICB3YWl0c0ZvclByb21pc2Ugc2hvdWxkUmVqZWN0OiB0cnVlLCAtPlxuICAgICAgICAgIGhlbHAgPSB7XG4gICAgICAgICAgICBsaW5rOiBcImh0dHA6Ly90ZXN0LmNvbVwiXG4gICAgICAgICAgICBwcm9ncmFtOiBcInRlc3QtcHJvZ3JhbVwiXG4gICAgICAgICAgICBwYXRoT3B0aW9uOiBcIkxhbmcgLSBUZXN0IFByb2dyYW0gUGF0aFwiXG4gICAgICAgICAgfVxuICAgICAgICAgICMgRm9yY2UgdG8gYmUgV2luZG93c1xuICAgICAgICAgIEV4ZWN1dGFibGUuaXNXaW5kb3dzID0gKCkgLT50cnVlXG4gICAgICAgICAgdGVybWluYWwgPSAnQ01EIHByb21wdCdcbiAgICAgICAgICB3aGljaENtZCA9IFwid2hlcmUuZXhlXCJcbiAgICAgICAgICAjIFByb2Nlc3NcbiAgICAgICAgICBwID0gYmVhdXRpZmllci5ydW4oXCJwcm9ncmFtXCIsIFtdLCBoZWxwOiBoZWxwKVxuICAgICAgICAgIGV4cGVjdChwKS5ub3QudG9CZShudWxsKVxuICAgICAgICAgIGV4cGVjdChwIGluc3RhbmNlb2YgYmVhdXRpZmllci5Qcm9taXNlKS50b0JlKHRydWUpXG4gICAgICAgICAgY2IgPSAodikgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3JcIiwgdiwgdi5kZXNjcmlwdGlvbilcbiAgICAgICAgICAgIGV4cGVjdCh2KS5ub3QudG9CZShudWxsKVxuICAgICAgICAgICAgZXhwZWN0KHYgaW5zdGFuY2VvZiBFcnJvcikudG9CZSh0cnVlKVxuICAgICAgICAgICAgZXhwZWN0KHYuY29kZSkudG9CZShcIkNvbW1hbmROb3RGb3VuZFwiKVxuICAgICAgICAgICAgZXhwZWN0KHYuZGVzY3JpcHRpb24pLm5vdC50b0JlKG51bGwpXG4gICAgICAgICAgICBleHBlY3Qodi5kZXNjcmlwdGlvbi5pbmRleE9mKGhlbHAubGluaykpLm5vdC50b0JlKC0xKVxuICAgICAgICAgICAgZXhwZWN0KHYuZGVzY3JpcHRpb24uaW5kZXhPZihoZWxwLnByb2dyYW0pKS5ub3QudG9CZSgtMSlcbiAgICAgICAgICAgIGV4cGVjdCh2LmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgIC5pbmRleE9mKGhlbHAucGF0aE9wdGlvbikpLm5vdC50b0JlKC0xLCBcXFxuICAgICAgICAgICAgICBcIkVycm9yIHNob3VsZCBoYXZlIGEgZGVzY3JpcHRpb24uXCIpXG4gICAgICAgICAgICBleHBlY3Qodi5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAuaW5kZXhPZih0ZXJtaW5hbCkpLm5vdC50b0JlKC0xLCBcXFxuICAgICAgICAgICAgICBcIkVycm9yIHNob3VsZCBoYXZlIGEgZGVzY3JpcHRpb24gaW5jbHVkaW5nIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyN7dGVybWluYWx9JyBpbiBtZXNzYWdlLlwiKVxuICAgICAgICAgICAgZXhwZWN0KHYuZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgLmluZGV4T2Yod2hpY2hDbWQpKS5ub3QudG9CZSgtMSwgXFxcbiAgICAgICAgICAgICAgXCJFcnJvciBzaG91bGQgaGF2ZSBhIGRlc2NyaXB0aW9uIGluY2x1ZGluZyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcje3doaWNoQ21kfScgaW4gbWVzc2FnZS5cIilcbiAgICAgICAgICAgIHJldHVybiB2XG4gICAgICAgICAgcC50aGVuKGNiLCBjYilcbiAgICAgICAgICByZXR1cm4gcFxuXG4gICAgICB1bmxlc3MgaXNXaW5kb3dzXG4gICAgICAgIGl0IFwic2hvdWxkIGVycm9yIHdpdGggTWFjL0xpbnV4LXNwZWNpZmljIGhlbHAgZGVzY3JpcHRpb24gXFxcbiAgICAgICAgICAgICAgICAgIHdoZW4gYmVhdXRpZmllcidzIHByb2dyYW0gbm90IGZvdW5kXCIsIC0+XG4gICAgICAgICAgZXhwZWN0KGJlYXV0aWZpZXIpLm5vdC50b0JlKG51bGwpXG4gICAgICAgICAgZXhwZWN0KGJlYXV0aWZpZXIgaW5zdGFuY2VvZiBCZWF1dGlmaWVyKS50b0JlKHRydWUpXG5cbiAgICAgICAgICB3YWl0c0ZvclByb21pc2Ugc2hvdWxkUmVqZWN0OiB0cnVlLCAtPlxuICAgICAgICAgICAgaGVscCA9IHtcbiAgICAgICAgICAgICAgbGluazogXCJodHRwOi8vdGVzdC5jb21cIlxuICAgICAgICAgICAgICBwcm9ncmFtOiBcInRlc3QtcHJvZ3JhbVwiXG4gICAgICAgICAgICAgIHBhdGhPcHRpb246IFwiTGFuZyAtIFRlc3QgUHJvZ3JhbSBQYXRoXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICMgRm9yY2UgdG8gYmUgTWFjL0xpbnV4IChub3QgV2luZG93cylcbiAgICAgICAgICAgIEV4ZWN1dGFibGUuaXNXaW5kb3dzID0gKCkgLT5mYWxzZVxuICAgICAgICAgICAgdGVybWluYWwgPSBcIlRlcm1pbmFsXCJcbiAgICAgICAgICAgIHdoaWNoQ21kID0gXCJ3aGljaFwiXG4gICAgICAgICAgICAjIFByb2Nlc3NcbiAgICAgICAgICAgIHAgPSBiZWF1dGlmaWVyLnJ1bihcInByb2dyYW1cIiwgW10sIGhlbHA6IGhlbHApXG4gICAgICAgICAgICBleHBlY3QocCkubm90LnRvQmUobnVsbClcbiAgICAgICAgICAgIGV4cGVjdChwIGluc3RhbmNlb2YgYmVhdXRpZmllci5Qcm9taXNlKS50b0JlKHRydWUpXG4gICAgICAgICAgICBjYiA9ICh2KSAtPlxuICAgICAgICAgICAgICAjIGNvbnNvbGUubG9nKHYpXG4gICAgICAgICAgICAgIGV4cGVjdCh2KS5ub3QudG9CZShudWxsKVxuICAgICAgICAgICAgICBleHBlY3QodiBpbnN0YW5jZW9mIEVycm9yKS50b0JlKHRydWUpXG4gICAgICAgICAgICAgIGV4cGVjdCh2LmNvZGUpLnRvQmUoXCJDb21tYW5kTm90Rm91bmRcIilcbiAgICAgICAgICAgICAgZXhwZWN0KHYuZGVzY3JpcHRpb24pLm5vdC50b0JlKG51bGwpXG4gICAgICAgICAgICAgIGV4cGVjdCh2LmRlc2NyaXB0aW9uLmluZGV4T2YoaGVscC5saW5rKSkubm90LnRvQmUoLTEpXG4gICAgICAgICAgICAgIGV4cGVjdCh2LmRlc2NyaXB0aW9uLmluZGV4T2YoaGVscC5wcm9ncmFtKSkubm90LnRvQmUoLTEpXG4gICAgICAgICAgICAgIGV4cGVjdCh2LmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgLmluZGV4T2YodGVybWluYWwpKS5ub3QudG9CZSgtMSwgXFxcbiAgICAgICAgICAgICAgICBcIkVycm9yIHNob3VsZCBoYXZlIGEgZGVzY3JpcHRpb24gaW5jbHVkaW5nIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3t0ZXJtaW5hbH0nIGluIG1lc3NhZ2UuXCIpXG4gICAgICAgICAgICAgIGV4cGVjdCh2LmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgLmluZGV4T2Yod2hpY2hDbWQpKS5ub3QudG9CZSgtMSwgXFxcbiAgICAgICAgICAgICAgICBcIkVycm9yIHNob3VsZCBoYXZlIGEgZGVzY3JpcHRpb24gaW5jbHVkaW5nIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3t3aGljaENtZH0nIGluIG1lc3NhZ2UuXCIpXG4gICAgICAgICAgICAgIHJldHVybiB2XG4gICAgICAgICAgICBwLnRoZW4oY2IsIGNiKVxuICAgICAgICAgICAgcmV0dXJuIHBcblxuICBkZXNjcmliZSBcIk9wdGlvbnNcIiwgLT5cblxuICAgIGVkaXRvciA9IG51bGxcbiAgICBiZWF1dGlmaWVyID0gbnVsbFxuICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYmVhdXRpZmllciA9IG5ldyBCZWF1dGlmaWVycygpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4gKGUpIC0+XG4gICAgICAgICAgZWRpdG9yID0gZVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKFwiXCIpXG5cbiAgICBkZXNjcmliZSBcIk1pZ3JhdGUgU2V0dGluZ3NcIiwgLT5cblxuICAgICAgbWlncmF0ZVNldHRpbmdzID0gKGJlZm9yZUtleSwgYWZ0ZXJLZXksIHZhbCkgLT5cbiAgICAgICAgIyBzZXQgb2xkIG9wdGlvbnNcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KFwiYXRvbS1iZWF1dGlmeS4je2JlZm9yZUtleX1cIiwgdmFsKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsIFwiYXRvbS1iZWF1dGlmeTptaWdyYXRlLXNldHRpbmdzXCJcbiAgICAgICAgIyBDaGVjayByZXN1bHRpbmcgY29uZmlnXG4gICAgICAgIGV4cGVjdChfLmhhcyhhdG9tLmNvbmZpZy5nZXQoJ2F0b20tYmVhdXRpZnknKSwgYmVmb3JlS2V5KSkudG9CZShmYWxzZSlcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldChcImF0b20tYmVhdXRpZnkuI3thZnRlcktleX1cIikpLnRvQmUodmFsKVxuXG4gICAgICBpdCBcInNob3VsZCBtaWdyYXRlIGpzX2luZGVudF9zaXplIHRvIGpzLmluZGVudF9zaXplXCIsIC0+XG4gICAgICAgIG1pZ3JhdGVTZXR0aW5ncyhcImpzX2luZGVudF9zaXplXCIsXCJqcy5pbmRlbnRfc2l6ZVwiLCAxKVxuICAgICAgICBtaWdyYXRlU2V0dGluZ3MoXCJqc19pbmRlbnRfc2l6ZVwiLFwianMuaW5kZW50X3NpemVcIiwgMTApXG5cbiAgICAgIGl0IFwic2hvdWxkIG1pZ3JhdGUgYW5hbHl0aWNzIHRvIGdlbmVyYWwuYW5hbHl0aWNzXCIsIC0+XG4gICAgICAgIG1pZ3JhdGVTZXR0aW5ncyhcImFuYWx5dGljc1wiLFwiZ2VuZXJhbC5hbmFseXRpY3NcIiwgdHJ1ZSlcbiAgICAgICAgbWlncmF0ZVNldHRpbmdzKFwiYW5hbHl0aWNzXCIsXCJnZW5lcmFsLmFuYWx5dGljc1wiLCBmYWxzZSlcblxuICAgICAgaXQgXCJzaG91bGQgbWlncmF0ZSBfYW5hbHl0aWNzVXNlcklkIHRvIGdlbmVyYWwuX2FuYWx5dGljc1VzZXJJZFwiLCAtPlxuICAgICAgICBtaWdyYXRlU2V0dGluZ3MoXCJfYW5hbHl0aWNzVXNlcklkXCIsXCJnZW5lcmFsLl9hbmFseXRpY3NVc2VySWRcIiwgXCJ1c2VyaWRcIilcbiAgICAgICAgbWlncmF0ZVNldHRpbmdzKFwiX2FuYWx5dGljc1VzZXJJZFwiLFwiZ2VuZXJhbC5fYW5hbHl0aWNzVXNlcklkXCIsIFwidXNlcmlkMlwiKVxuXG4gICAgICBpdCBcInNob3VsZCBtaWdyYXRlIGxhbmd1YWdlX2pzX2Rpc2FibGVkIHRvIGpzLmRpc2FibGVkXCIsIC0+XG4gICAgICAgIG1pZ3JhdGVTZXR0aW5ncyhcImxhbmd1YWdlX2pzX2Rpc2FibGVkXCIsXCJqcy5kaXNhYmxlZFwiLCBmYWxzZSlcbiAgICAgICAgbWlncmF0ZVNldHRpbmdzKFwibGFuZ3VhZ2VfanNfZGlzYWJsZWRcIixcImpzLmRpc2FibGVkXCIsIHRydWUpXG5cbiAgICAgIGl0IFwic2hvdWxkIG1pZ3JhdGUgbGFuZ3VhZ2VfanNfZGVmYXVsdF9iZWF1dGlmaWVyIHRvIGpzLmRlZmF1bHRfYmVhdXRpZmllclwiLCAtPlxuICAgICAgICBtaWdyYXRlU2V0dGluZ3MoXCJsYW5ndWFnZV9qc19kZWZhdWx0X2JlYXV0aWZpZXJcIixcImpzLmRlZmF1bHRfYmVhdXRpZmllclwiLCBcIlByZXR0eSBEaWZmXCIpXG4gICAgICAgIG1pZ3JhdGVTZXR0aW5ncyhcImxhbmd1YWdlX2pzX2RlZmF1bHRfYmVhdXRpZmllclwiLFwianMuZGVmYXVsdF9iZWF1dGlmaWVyXCIsIFwiSlMgQmVhdXRpZnlcIilcblxuICAgICAgaXQgXCJzaG91bGQgbWlncmF0ZSBsYW5ndWFnZV9qc19iZWF1dGlmeV9vbl9zYXZlIHRvIGpzLmJlYXV0aWZ5X29uX3NhdmVcIiwgLT5cbiAgICAgICAgbWlncmF0ZVNldHRpbmdzKFwibGFuZ3VhZ2VfanNfYmVhdXRpZnlfb25fc2F2ZVwiLFwianMuYmVhdXRpZnlfb25fc2F2ZVwiLCB0cnVlKVxuICAgICAgICBtaWdyYXRlU2V0dGluZ3MoXCJsYW5ndWFnZV9qc19iZWF1dGlmeV9vbl9zYXZlXCIsXCJqcy5iZWF1dGlmeV9vbl9zYXZlXCIsIGZhbHNlKVxuXG4gICAgYmVhdXRpZnlFZGl0b3IgPSAoY2FsbGJhY2spIC0+XG4gICAgICBpc0NvbXBsZXRlID0gZmFsc2VcbiAgICAgIGJlZm9yZVRleHQgPSBudWxsXG4gICAgICBkZWxheSA9IDUwMFxuICAgICAgcnVucyAtPlxuICAgICAgICBiZWZvcmVUZXh0ID0gZWRpdG9yLmdldFRleHQoKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsIFwiYXRvbS1iZWF1dGlmeTpiZWF1dGlmeS1lZGl0b3JcIlxuICAgICAgICBzZXRUaW1lb3V0KC0+XG4gICAgICAgICAgaXNDb21wbGV0ZSA9IHRydWVcbiAgICAgICAgLCBkZWxheSlcbiAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgIGlzQ29tcGxldGVcblxuICAgICAgcnVucyAtPlxuICAgICAgICBhZnRlclRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgICAgIGV4cGVjdCh0eXBlb2YgYmVmb3JlVGV4dCkudG9CZSgnc3RyaW5nJylcbiAgICAgICAgZXhwZWN0KHR5cGVvZiBhZnRlclRleHQpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgIHJldHVybiBjYWxsYmFjayhiZWZvcmVUZXh0LCBhZnRlclRleHQpXG5cbiAgICBkZXNjcmliZSBcIkphdmFTY3JpcHRcIiwgLT5cblxuICAgICAgYmVmb3JlRWFjaCAtPlxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIHBhY2tOYW1lID0gJ2xhbmd1YWdlLWphdmFzY3JpcHQnXG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UocGFja05hbWUpXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgICMgU2V0dXAgRWRpdG9yXG4gICAgICAgICAgY29kZSA9IFwidmFyIGhlbGxvPSd3b3JsZCc7ZnVuY3Rpb24oKXtjb25zb2xlLmxvZygnaGVsbG8gJytoZWxsbyl9XCJcbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dChjb2RlKVxuICAgICAgICAgICMgY29uc29sZS5sb2coYXRvbS5ncmFtbWFycy5ncmFtbWFyc0J5U2NvcGVOYW1lKVxuICAgICAgICAgIGdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLnNlbGVjdEdyYW1tYXIoJ3NvdXJjZS5qcycpXG4gICAgICAgICAgZXhwZWN0KGdyYW1tYXIubmFtZSkudG9CZSgnSmF2YVNjcmlwdCcpXG4gICAgICAgICAgZWRpdG9yLnNldEdyYW1tYXIoZ3JhbW1hcilcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldEdyYW1tYXIoKS5uYW1lKS50b0JlKCdKYXZhU2NyaXB0JylcblxuICAgICAgICAgICMgU2VlIGh0dHBzOi8vZGlzY3Vzcy5hdG9tLmlvL3Qvc29sdmVkLXNldHRpbWVvdXQtbm90LXdvcmtpbmctZmlyaW5nLWluLXNwZWNzLXRlc3RzLzExNDI3LzE3XG4gICAgICAgICAgamFzbWluZS51bnNweSh3aW5kb3csICdzZXRUaW1lb3V0JylcblxuICAgICAgIyBhZnRlckVhY2ggLT5cbiAgICAgICMgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlcygpXG4gICAgICAjICAgYXRvbS5wYWNrYWdlcy51bmxvYWRQYWNrYWdlcygpXG5cbiAgICAgIGRlc2NyaWJlIFwiLmpzYmVhdXRpZnlyY1wiLCAtPlxuXG4gICAgICAgIGl0IFwic2hvdWxkIGxvb2sgYXQgZGlyZWN0b3JpZXMgYWJvdmUgZmlsZVwiLCAtPlxuICAgICAgICAgIGlzRG9uZSA9IGZhbHNlXG4gICAgICAgICAgY2IgPSAoZXJyKSAtPlxuICAgICAgICAgICAgaXNEb25lID0gdHJ1ZVxuICAgICAgICAgICAgZXhwZWN0KGVycikudG9CZSh1bmRlZmluZWQpXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICMgY29uc29sZS5sb2coJ3J1bnMnKVxuICAgICAgICAgICAgICAjIE1ha2UgdG9wIGRpcmVjdG9yeVxuICAgICAgICAgICAgICB0ZW1wLm1rZGlyKCdkaXIxJywgKGVyciwgZGlyUGF0aCkgLT5cbiAgICAgICAgICAgICAgICAjIGNvbnNvbGUubG9nKGFyZ3VtZW50cylcbiAgICAgICAgICAgICAgICByZXR1cm4gY2IoZXJyKSBpZiBlcnJcbiAgICAgICAgICAgICAgICAjIEFkZCAuanNiZWF1dGlmeXJjIGZpbGVcbiAgICAgICAgICAgICAgICByY1BhdGggPSBwYXRoLmpvaW4oZGlyUGF0aCwgJy5qc2JlYXV0aWZ5cmMnKVxuICAgICAgICAgICAgICAgIG15RGF0YTEgPSB7XG4gICAgICAgICAgICAgICAgICBpbmRlbnRfc2l6ZTogMSxcbiAgICAgICAgICAgICAgICAgIGluZGVudF9jaGFyOiAnXFx0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBteURhdGEgPSBKU09OLnN0cmluZ2lmeShteURhdGExKVxuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZShyY1BhdGgsIG15RGF0YSwgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICMgY29uc29sZS5sb2coYXJndW1lbnRzKVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKGVycikgaWYgZXJyXG4gICAgICAgICAgICAgICAgICAjIE1ha2UgbmV4dCBkaXJlY3RvcnlcbiAgICAgICAgICAgICAgICAgIGRpclBhdGggPSBwYXRoLmpvaW4oZGlyUGF0aCwgJ2RpcjInKVxuICAgICAgICAgICAgICAgICAgZnMubWtkaXIoZGlyUGF0aCwgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgIyBjb25zb2xlLmxvZyhhcmd1bWVudHMpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYihlcnIpIGlmIGVyclxuICAgICAgICAgICAgICAgICAgICAjIEFkZCAuanNiZWF1dGlmeXJjIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgcmNQYXRoID0gcGF0aC5qb2luKGRpclBhdGgsICcuanNiZWF1dGlmeXJjJylcbiAgICAgICAgICAgICAgICAgICAgbXlEYXRhMiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICBpbmRlbnRfc2l6ZTogMixcbiAgICAgICAgICAgICAgICAgICAgICBpbmRlbnRfY2hhcjogJyAnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbXlEYXRhID0gSlNPTi5zdHJpbmdpZnkobXlEYXRhMilcbiAgICAgICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlKHJjUGF0aCwgbXlEYXRhLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICMgY29uc29sZS5sb2coYXJndW1lbnRzKVxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYihlcnIpIGlmIGVyclxuICAgICAgICAgICAgICAgICAgICAgIFByb21pc2UuYWxsKGJlYXV0aWZpZXIuZ2V0T3B0aW9uc0ZvclBhdGgocmNQYXRoLCBudWxsKSlcbiAgICAgICAgICAgICAgICAgICAgICAudGhlbigoYWxsT3B0aW9ucykgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgY29uc29sZS5sb2coJ2FsbE9wdGlvbnMnLCBhbGxPcHRpb25zKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEV4dHJhY3Qgb3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRvck9wdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWdPcHRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9tZU9wdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0b3JDb25maWdPcHRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICBdID0gYWxsT3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdE9wdGlvbnMgPSBhbGxPcHRpb25zWzQuLl1cblxuICAgICAgICAgICAgICAgICAgICAgICAgIyBDaGVjayB0aGF0IHdlIGV4dHJhY3RlZCAuanNiZWF1dGlmeXJjIGZpbGVzXG4gICAgICAgICAgICAgICAgICAgICAgICBbY29uZmlnMSwgY29uZmlnMl0gPSBwcm9qZWN0T3B0aW9uc1stMi4uXVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBlY3QoXy5nZXQoY29uZmlnMSwnX2RlZmF1bHQuaW5kZW50X3NpemUnKSkudG9CZShteURhdGExLmluZGVudF9zaXplKVxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0KF8uZ2V0KGNvbmZpZzIsJ19kZWZhdWx0LmluZGVudF9zaXplJykpLnRvQmUobXlEYXRhMi5pbmRlbnRfc2l6ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdChfLmdldChjb25maWcxLCdfZGVmYXVsdC5pbmRlbnRfY2hhcicpKS50b0JlKG15RGF0YTEuaW5kZW50X2NoYXIpXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBlY3QoXy5nZXQoY29uZmlnMiwnX2RlZmF1bHQuaW5kZW50X2NoYXInKSkudG9CZShteURhdGEyLmluZGVudF9jaGFyKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgY2IoZXJyKVxuICAgICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgICBpc0RvbmVcblxuXG4gICAgICBkZXNjcmliZSBcIlBhY2thZ2Ugc2V0dGluZ3NcIiwgLT5cblxuICAgICAgICBnZXRPcHRpb25zID0gKGNhbGxiYWNrKSAtPlxuICAgICAgICAgIG9wdGlvbnMgPSBudWxsXG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgICAjIGNvbnNvbGUubG9nKCdiZWF1dGlmaWVyJywgYmVhdXRpZmllci5nZXRPcHRpb25zRm9yUGF0aCwgYmVhdXRpZmllcilcbiAgICAgICAgICAgIGFsbE9wdGlvbnMgPSBiZWF1dGlmaWVyLmdldE9wdGlvbnNGb3JQYXRoKG51bGwsIG51bGwpXG4gICAgICAgICAgICAjIFJlc29sdmUgb3B0aW9ucyB3aXRoIHByb21pc2VzXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoYWxsT3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChhbGxPcHRpb25zKSAtPlxuICAgICAgICAgICAgICBvcHRpb25zID0gYWxsT3B0aW9uc1xuICAgICAgICAgICAgKVxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGNhbGxiYWNrKG9wdGlvbnMpXG5cbiAgICAgICAgaXQgXCJzaG91bGQgY2hhbmdlIGluZGVudF9zaXplIHRvIDFcIiwgLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F0b20tYmVhdXRpZnkuanMuaW5kZW50X3NpemUnLCAxKVxuXG4gICAgICAgICAgZ2V0T3B0aW9ucyAoYWxsT3B0aW9ucykgLT5cbiAgICAgICAgICAgIGV4cGVjdCh0eXBlb2YgYWxsT3B0aW9ucykudG9CZSgnb2JqZWN0JylcbiAgICAgICAgICAgIGNvbmZpZ09wdGlvbnMgPSBhbGxPcHRpb25zWzFdXG4gICAgICAgICAgICBleHBlY3QodHlwZW9mIGNvbmZpZ09wdGlvbnMpLnRvQmUoJ29iamVjdCcpXG4gICAgICAgICAgICBleHBlY3QoY29uZmlnT3B0aW9ucy5qcy5pbmRlbnRfc2l6ZSkudG9CZSgxKVxuXG4gICAgICAgICAgICBiZWF1dGlmeUVkaXRvciAoYmVmb3JlVGV4dCwgYWZ0ZXJUZXh0KSAtPlxuICAgICAgICAgICAgICAjIGNvbnNvbGUubG9nKGJlZm9yZVRleHQsIGFmdGVyVGV4dCwgZWRpdG9yKVxuICAgICAgICAgICAgICBleHBlY3QoYWZ0ZXJUZXh0KS50b0JlKFwiXCJcInZhciBoZWxsbyA9ICd3b3JsZCc7XG5cbiAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaGVsbG8gJyArIGhlbGxvKVxuICAgICAgICAgICAgICB9XCJcIlwiKVxuXG4gICAgICAgIGl0IFwic2hvdWxkIGNoYW5nZSBpbmRlbnRfc2l6ZSB0byAxMFwiLCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnYXRvbS1iZWF1dGlmeS5qcy5pbmRlbnRfc2l6ZScsIDEwKVxuXG4gICAgICAgICAgZ2V0T3B0aW9ucyAoYWxsT3B0aW9ucykgLT5cbiAgICAgICAgICAgIGV4cGVjdCh0eXBlb2YgYWxsT3B0aW9ucykudG9CZSgnb2JqZWN0JylcbiAgICAgICAgICAgIGNvbmZpZ09wdGlvbnMgPSBhbGxPcHRpb25zWzFdXG4gICAgICAgICAgICBleHBlY3QodHlwZW9mIGNvbmZpZ09wdGlvbnMpLnRvQmUoJ29iamVjdCcpXG4gICAgICAgICAgICBleHBlY3QoY29uZmlnT3B0aW9ucy5qcy5pbmRlbnRfc2l6ZSkudG9CZSgxMClcblxuICAgICAgICAgICAgYmVhdXRpZnlFZGl0b3IgKGJlZm9yZVRleHQsIGFmdGVyVGV4dCkgLT5cbiAgICAgICAgICAgICAgIyBjb25zb2xlLmxvZyhiZWZvcmVUZXh0LCBhZnRlclRleHQsIGVkaXRvcilcbiAgICAgICAgICAgICAgZXhwZWN0KGFmdGVyVGV4dCkudG9CZShcIlwiXCJ2YXIgaGVsbG8gPSAnd29ybGQnO1xuXG4gICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2hlbGxvICcgKyBoZWxsbylcbiAgICAgICAgICAgICAgfVwiXCJcIilcblxuXG5kZXNjcmliZSBcIkxhbmd1YWdlc1wiLCAtPlxuXG4gIGxhbmd1YWdlcyA9IG51bGxcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgbGFuZ3VhZ2VzID0gbmV3IExhbmd1YWdlcygpXG5cbiAgZGVzY3JpYmUgXCJMYW5ndWFnZXM6Om5hbWVzcGFjZVwiLCAtPlxuXG4gICAgaXQgXCJzaG91bGQgdmVyaWZ5IHRoYXQgbXVsdGlwbGUgbGFuZ3VhZ2VzIGRvIG5vdCBzaGFyZSB0aGUgc2FtZSBuYW1lc3BhY2VcIiwgLT5cblxuICAgICAgbmFtZXNwYWNlR3JvdXBzID0gXy5ncm91cEJ5KGxhbmd1YWdlcy5sYW5ndWFnZXMsIFwibmFtZXNwYWNlXCIpXG4gICAgICBuYW1lc3BhY2VQYWlycyA9IF8udG9QYWlycyhuYW1lc3BhY2VHcm91cHMpXG4gICAgICBuYW1lc3BhY2VPdmVybGFwID0gXy5maWx0ZXIobmFtZXNwYWNlUGFpcnMsIChbbmFtZXNwYWNlLCBncm91cF0pIC0+IGdyb3VwLmxlbmd0aCA+IDEpXG4gICAgICAjIGNvbnNvbGUubG9nKCduYW1lc3BhY2VzJywgbmFtZXNwYWNlR3JvdXBzLCBuYW1lc3BhY2VQYWlycywgbmFtZXNwYWNlT3ZlcmxhcClcbiAgICAgIGV4cGVjdChuYW1lc3BhY2VPdmVybGFwLmxlbmd0aCkudG9CZSgwLCBcXFxuICAgICAgICBcIkxhbmd1YWdlIG5hbWVzcGFjZXMgYXJlIG92ZXJsYXBwaW5nLlxcblxcXG4gICAgICAgIE5hbWVzcGFjZXMgYXJlIHVuaXF1ZTogb25seSBvbmUgbGFuZ3VhZ2UgZm9yIGVhY2ggbmFtZXNwYWNlLlxcblwiK1xuICAgICAgICBfLm1hcChuYW1lc3BhY2VPdmVybGFwLCAoW25hbWVzcGFjZSwgZ3JvdXBdKSAtPiBcIi0gJyN7bmFtZXNwYWNlfSc6IENoZWNrIGxhbmd1YWdlcyAje18ubWFwKGdyb3VwLCAnbmFtZScpLmpvaW4oJywgJyl9IGZvciB1c2luZyBuYW1lc3BhY2UgJyN7bmFtZXNwYWNlfScuXCIpLmpvaW4oJ1xcbicpXG4gICAgICAgIClcbiJdfQ==
