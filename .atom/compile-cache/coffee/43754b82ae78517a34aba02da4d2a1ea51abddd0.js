(function() {
  var Beautifiers, JsDiff, beautifier, fs, isWindows, path;

  Beautifiers = require("../src/beautifiers");

  beautifier = new Beautifiers();

  fs = require("fs");

  path = require("path");

  JsDiff = require('diff');

  isWindows = process.platform === 'win32' || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';

  describe("BeautifyLanguages", function() {
    var allLanguages, config, configs, dependentPackages, fn, i, j, lang, len, len1, optionsDir, results;
    optionsDir = path.resolve(__dirname, "../examples");
    allLanguages = ["c", "clojure", "coffee-script", "css", "d", "html", "java", "javascript", "json", "less", "mustache", "objective-c", "perl", "php", "python", "ruby", "sass", "sql", "svg", "xml", "csharp", "gfm", "marko", "go", "html-swig", "lua"];
    dependentPackages = ['autocomplete-plus'];
    fn = function(lang) {
      return dependentPackages.push("language-" + lang);
    };
    for (i = 0, len = allLanguages.length; i < len; i++) {
      lang = allLanguages[i];
      fn(lang);
    }
    beforeEach(function() {
      var fn1, j, len1, packageName;
      fn1 = function(packageName) {
        return waitsForPromise(function() {
          return atom.packages.activatePackage(packageName);
        });
      };
      for (j = 0, len1 = dependentPackages.length; j < len1; j++) {
        packageName = dependentPackages[j];
        fn1(packageName);
      }
      return waitsForPromise(function() {
        var activationPromise, pack;
        activationPromise = atom.packages.activatePackage('atom-beautify');
        pack = atom.packages.getLoadedPackage("atom-beautify");
        pack.activateNow();
        if (isWindows) {
          atom.config.set('atom-beautify._loggerLevel', 'verbose');
        }
        return activationPromise;
      });
    });

    /*
    Directory structure:
     - examples
       - config1
         - lang1
           - original
             - 1 - test.ext
           - expected
             - 1 - test.ext
         - lang2
       - config2
     */
    configs = fs.readdirSync(optionsDir);
    results = [];
    for (j = 0, len1 = configs.length; j < len1; j++) {
      config = configs[j];
      results.push((function(config) {
        var langsDir, optionStats;
        langsDir = path.resolve(optionsDir, config);
        optionStats = fs.lstatSync(langsDir);
        if (optionStats.isDirectory()) {
          return describe("when using configuration '" + config + "'", function() {
            var k, langNames, len2, results1;
            langNames = fs.readdirSync(langsDir);
            results1 = [];
            for (k = 0, len2 = langNames.length; k < len2; k++) {
              lang = langNames[k];
              if (isWindows && lang === 'ocaml') {
                continue;
              }
              results1.push((function(lang) {
                var expectedDir, langStats, originalDir, testsDir;
                testsDir = path.resolve(langsDir, lang);
                langStats = fs.lstatSync(testsDir);
                if (langStats.isDirectory()) {
                  originalDir = path.resolve(testsDir, "original");
                  if (!fs.existsSync(originalDir)) {
                    console.warn("Directory for test originals/inputs not found." + (" Making it at " + originalDir + "."));
                    fs.mkdirSync(originalDir);
                  }
                  expectedDir = path.resolve(testsDir, "expected");
                  if (!fs.existsSync(expectedDir)) {
                    console.warn("Directory for test expected/results not found." + ("Making it at " + expectedDir + "."));
                    fs.mkdirSync(expectedDir);
                  }
                  return describe("when beautifying language '" + lang + "'", function() {
                    var l, len3, results2, testFileName, testNames;
                    testNames = fs.readdirSync(originalDir);
                    results2 = [];
                    for (l = 0, len3 = testNames.length; l < len3; l++) {
                      testFileName = testNames[l];
                      results2.push((function(testFileName) {
                        var ext, testName;
                        ext = path.extname(testFileName);
                        testName = path.basename(testFileName, ext);
                        if (testFileName[0] === '_') {
                          return;
                        }
                        return it(testName + " " + testFileName, function() {
                          var allOptions, beautifyCompleted, completionFun, expectedContents, expectedTestPath, grammar, grammarName, language, originalContents, originalTestPath, ref, ref1;
                          originalTestPath = path.resolve(originalDir, testFileName);
                          expectedTestPath = path.resolve(expectedDir, testFileName);
                          originalContents = (ref = fs.readFileSync(originalTestPath)) != null ? ref.toString() : void 0;
                          if (!fs.existsSync(expectedTestPath)) {
                            throw new Error(("No matching expected test result found for '" + testName + "' ") + ("at '" + expectedTestPath + "'."));
                          }
                          expectedContents = (ref1 = fs.readFileSync(expectedTestPath)) != null ? ref1.toString() : void 0;
                          grammar = atom.grammars.selectGrammar(originalTestPath, originalContents);
                          grammarName = grammar.name;
                          allOptions = beautifier.getOptionsForPath(originalTestPath);
                          language = beautifier.getLanguage(grammarName, testFileName);
                          beautifyCompleted = false;
                          completionFun = function(text) {
                            var diff, e, fileName, newHeader, newStr, oldHeader, oldStr, opts, selectedBeautifier;
                            try {
                              expect(text instanceof Error).not.toEqual(true, text);
                              if (text instanceof Error) {
                                return beautifyCompleted = true;
                              }
                              expect(text).not.toEqual(null, "Language or Beautifier not found");
                              if (text === null) {
                                return beautifyCompleted = true;
                              }
                              expect(typeof text).toEqual("string", "Text: " + text);
                              if (typeof text !== "string") {
                                return beautifyCompleted = true;
                              }
                              text = text.replace(/(?:\r\n|\r|\n)/g, '⏎\n');
                              expectedContents = expectedContents.replace(/(?:\r\n|\r|\n)/g, '⏎\n');
                              text = text.replace(/(?:\t)/g, '↹');
                              expectedContents = expectedContents.replace(/(?:\t)/g, '↹');
                              text = text.replace(/(?:\ )/g, '␣');
                              expectedContents = expectedContents.replace(/(?:\ )/g, '␣');
                              if (text !== expectedContents) {
                                fileName = expectedTestPath;
                                oldStr = text;
                                newStr = expectedContents;
                                oldHeader = "beautified";
                                newHeader = "expected";
                                diff = JsDiff.createPatch(fileName, oldStr, newStr, oldHeader, newHeader);
                                opts = beautifier.getOptionsForLanguage(allOptions, language);
                                selectedBeautifier = beautifier.getBeautifierForLanguage(language);
                                if (selectedBeautifier != null) {
                                  opts = beautifier.transformOptions(selectedBeautifier, language.name, opts);
                                }
                                expect(text).toEqual(expectedContents, "Beautifier '" + (selectedBeautifier != null ? selectedBeautifier.name : void 0) + "' output does not match expected output:\n" + diff + "\n\nWith options:\n" + (JSON.stringify(opts, void 0, 4)));
                              }
                              return beautifyCompleted = true;
                            } catch (error) {
                              e = error;
                              console.error(e);
                              return beautifyCompleted = e;
                            }
                          };
                          runs(function() {
                            var e;
                            try {
                              return beautifier.beautify(originalContents, allOptions, grammarName, testFileName).then(completionFun)["catch"](completionFun);
                            } catch (error) {
                              e = error;
                              return beautifyCompleted = e;
                            }
                          });
                          return waitsFor(function() {
                            if (beautifyCompleted instanceof Error) {
                              throw beautifyCompleted;
                            } else {
                              return beautifyCompleted;
                            }
                          }, "Waiting for beautification to complete", 60000);
                        });
                      })(testFileName));
                    }
                    return results2;
                  });
                }
              })(lang));
            }
            return results1;
          });
        }
      })(config));
    }
    return results;
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcGVjL2JlYXV0aWZ5LWxhbmd1YWdlcy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxvQkFBUjs7RUFDZCxVQUFBLEdBQWlCLElBQUEsV0FBQSxDQUFBOztFQUNqQixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE1BQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7RUFRVCxTQUFBLEdBQVksT0FBTyxDQUFDLFFBQVIsS0FBb0IsT0FBcEIsSUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQVosS0FBc0IsUUFEWixJQUVWLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBWixLQUFzQjs7RUFFeEIsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUE7QUFFNUIsUUFBQTtJQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsYUFBeEI7SUFHYixZQUFBLEdBQWUsQ0FDYixHQURhLEVBQ1IsU0FEUSxFQUNHLGVBREgsRUFDb0IsS0FEcEIsRUFDMkIsR0FEM0IsRUFDZ0MsTUFEaEMsRUFFYixNQUZhLEVBRUwsWUFGSyxFQUVTLE1BRlQsRUFFaUIsTUFGakIsRUFHYixVQUhhLEVBR0QsYUFIQyxFQUdjLE1BSGQsRUFHc0IsS0FIdEIsRUFJYixRQUphLEVBSUgsTUFKRyxFQUlLLE1BSkwsRUFJYSxLQUpiLEVBSW9CLEtBSnBCLEVBS2IsS0FMYSxFQUtOLFFBTE0sRUFLSSxLQUxKLEVBS1csT0FMWCxFQU1iLElBTmEsRUFNUCxXQU5PLEVBTU0sS0FOTjtJQVNmLGlCQUFBLEdBQW9CLENBQ2xCLG1CQURrQjtTQU9mLFNBQUMsSUFBRDthQUNELGlCQUFpQixDQUFDLElBQWxC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QUEsQ0FBTyxJQUFQLENBQVksQ0FBQyxPQUFiLENBQXFCLGdCQUFyQixFQUNFLGNBQUEsR0FBYyw4QkFBQyxrQkFBa0IsQ0FBRSxhQUFyQixDQUFkLEdBQXdDLDRDQUF4QyxHQUNXLElBRFgsR0FDZ0IscUJBRGhCLEdBR0MsQ0FBQyxJQUFJLENBQUMsU0FBTCxDQUFlLElBQWYsRUFBcUIsTUFBckIsRUFBZ0MsQ0FBaEMsQ0FBRCxDQUpILEVBaEJGOztxQ0FzQkEsaUJBQUEsR0FBb0IsS0FqRHRCOzZCQUFBLGFBQUE7OEJBa0RNOzhCQUNKLE9BQU8sQ0FBQyxLQUFSLENBQWMsQ0FBZDtxQ0FDQSxpQkFBQSxHQUFvQixFQXBEdEI7OzBCQURjOzBCQXVEaEIsSUFBQSxDQUFLLFNBQUE7QUFDSCxnQ0FBQTtBQUFBO3FDQUNFLFVBQVUsQ0FBQyxRQUFYLENBQW9CLGdCQUFwQixFQUFzQyxVQUF0QyxFQUFrRCxXQUFsRCxFQUErRCxZQUEvRCxDQUNBLENBQUMsSUFERCxDQUNNLGFBRE4sQ0FFQSxFQUFDLEtBQUQsRUFGQSxDQUVPLGFBRlAsRUFERjs2QkFBQSxhQUFBOzhCQUlNO3FDQUNKLGlCQUFBLEdBQW9CLEVBTHRCOzswQkFERyxDQUFMO2lDQVFBLFFBQUEsQ0FBUyxTQUFBOzRCQUNQLElBQUcsaUJBQUEsWUFBNkIsS0FBaEM7QUFDRSxvQ0FBTSxrQkFEUjs2QkFBQSxNQUFBO0FBR0UscUNBQU8sa0JBSFQ7OzBCQURPLENBQVQsRUFLRSx3Q0FMRixFQUs0QyxLQUw1Qzt3QkEzRmdDLENBQWxDO3NCQVJDLENBQUEsQ0FBSCxDQUFJLFlBQUo7QUFERjs7a0JBSjhDLENBQWhELEVBZkY7O2NBTEMsQ0FBQSxDQUFILENBQUksSUFBSjtBQU5GOztVQUgrQyxDQUFqRCxFQUZGOztNQUxDLENBQUEsQ0FBSCxDQUFJLE1BQUo7QUFERjs7RUFuRTRCLENBQTlCO0FBaEJBIiwic291cmNlc0NvbnRlbnQiOlsiIyBCZWF1dGlmeSA9IHJlcXVpcmUgJy4uL3NyYy9iZWF1dGlmeSdcbkJlYXV0aWZpZXJzID0gcmVxdWlyZSBcIi4uL3NyYy9iZWF1dGlmaWVyc1wiXG5iZWF1dGlmaWVyID0gbmV3IEJlYXV0aWZpZXJzKClcbmZzID0gcmVxdWlyZSBcImZzXCJcbnBhdGggPSByZXF1aXJlIFwicGF0aFwiXG5Kc0RpZmYgPSByZXF1aXJlKCdkaWZmJylcblxuIyBVc2UgdGhlIGNvbW1hbmQgYHdpbmRvdzpydW4tcGFja2FnZS1zcGVjc2AgKGNtZC1hbHQtY3RybC1wKSB0byBydW4gc3BlY3MuXG4jXG4jIFRvIHJ1biBhIHNwZWNpZmljIGBpdGAgb3IgYGRlc2NyaWJlYCBibG9jayBhZGQgYW4gYGZgIHRvIHRoZSBmcm9udCAoZS5nLiBgZml0YFxuIyBvciBgZmRlc2NyaWJlYCkuIFJlbW92ZSB0aGUgYGZgIHRvIHVuZm9jdXMgdGhlIGJsb2NrLlxuXG4jIENoZWNrIGlmIFdpbmRvd3NcbmlzV2luZG93cyA9IHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJyBvclxuICBwcm9jZXNzLmVudi5PU1RZUEUgaXMgJ2N5Z3dpbicgb3JcbiAgcHJvY2Vzcy5lbnYuT1NUWVBFIGlzICdtc3lzJ1xuXG5kZXNjcmliZSBcIkJlYXV0aWZ5TGFuZ3VhZ2VzXCIsIC0+XG5cbiAgb3B0aW9uc0RpciA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vZXhhbXBsZXNcIilcblxuICAjIEFjdGl2YXRlIGFsbCBvZiB0aGUgbGFuZ3VhZ2VzXG4gIGFsbExhbmd1YWdlcyA9IFtcbiAgICBcImNcIiwgXCJjbG9qdXJlXCIsIFwiY29mZmVlLXNjcmlwdFwiLCBcImNzc1wiLCBcImRcIiwgXCJodG1sXCIsXG4gICAgXCJqYXZhXCIsIFwiamF2YXNjcmlwdFwiLCBcImpzb25cIiwgXCJsZXNzXCIsXG4gICAgXCJtdXN0YWNoZVwiLCBcIm9iamVjdGl2ZS1jXCIsIFwicGVybFwiLCBcInBocFwiLFxuICAgIFwicHl0aG9uXCIsIFwicnVieVwiLCBcInNhc3NcIiwgXCJzcWxcIiwgXCJzdmdcIixcbiAgICBcInhtbFwiLCBcImNzaGFycFwiLCBcImdmbVwiLCBcIm1hcmtvXCIsXG4gICAgXCJnb1wiLCBcImh0bWwtc3dpZ1wiLCBcImx1YVwiXG4gICAgXVxuICAjIEFsbCBBdG9tIHBhY2thZ2VzIHRoYXQgQXRvbSBCZWF1dGlmeSBpcyBkZXBlbmRlbnQgb25cbiAgZGVwZW5kZW50UGFja2FnZXMgPSBbXG4gICAgJ2F1dG9jb21wbGV0ZS1wbHVzJ1xuICAgICMgJ2xpbnRlcidcbiAgICAjICAgJ2F0b20tdHlwZXNjcmlwdCcgIyBpdCBsb2dzIHRvbyBtdWNoLi4uXG4gIF1cbiAgIyBBZGQgbGFuZ3VhZ2UgcGFja2FnZXMgdG8gZGVwZW5kZW50UGFja2FnZXNcbiAgZm9yIGxhbmcgaW4gYWxsTGFuZ3VhZ2VzXG4gICAgZG8gKGxhbmcpIC0+XG4gICAgICBkZXBlbmRlbnRQYWNrYWdlcy5wdXNoKFwibGFuZ3VhZ2UtI3tsYW5nfVwiKVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICAjIEluc3RhbGwgYWxsIG9mIHRoZSBsYW5ndWFnZXNcbiAgICBmb3IgcGFja2FnZU5hbWUgaW4gZGVwZW5kZW50UGFja2FnZXNcbiAgICAgIGRvIChwYWNrYWdlTmFtZSkgLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UocGFja2FnZU5hbWUpXG5cbiAgICAjIEFjdGl2YXRlIHBhY2thZ2VcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGFjdGl2YXRpb25Qcm9taXNlID0gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F0b20tYmVhdXRpZnknKVxuICAgICAgIyBGb3JjZSBhY3RpdmF0ZSBwYWNrYWdlXG4gICAgICBwYWNrID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKFwiYXRvbS1iZWF1dGlmeVwiKVxuICAgICAgcGFjay5hY3RpdmF0ZU5vdygpXG4gICAgICAjIE5lZWQgbW9yZSBkZWJ1Z2dpbmcgb24gV2luZG93c1xuICAgICAgaWYgaXNXaW5kb3dzXG4gICAgICAgICMgQ2hhbmdlIGxvZ2dlciBsZXZlbFxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F0b20tYmVhdXRpZnkuX2xvZ2dlckxldmVsJywgJ3ZlcmJvc2UnKVxuICAgICAgIyBSZXR1cm4gcHJvbWlzZVxuICAgICAgcmV0dXJuIGFjdGl2YXRpb25Qcm9taXNlXG5cbiAgICAjIFNldCBVbmNydXN0aWZ5IGNvbmZpZyBwYXRoXG4gICAgIyB1bmNydXN0aWZ5Q29uZmlnUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vZXhhbXBsZXMvbmVzdGVkLWpzYmVhdXRpZnlyYy91bmNydXN0aWZ5LmNmZ1wiKVxuICAgICMgdW5jcnVzdGlmeUxhbmdzID0gW1wiYXBleFwiLCBcImNcIiwgXCJjcHBcIiwgXCJvYmplY3RpdmVjXCIsIFwiY3NcIiwgXCJkXCIsIFwiamF2YVwiLCBcInBhd25cIiwgXCJ2YWxhXCJdXG4gICAgIyBmb3IgbGFuZyBpbiB1bmNydXN0aWZ5TGFuZ3NcbiAgICAjICAgICBkbyAobGFuZykgLT5cbiAgICAgICMgYXRvbS5jb25maWcuc2V0KFwiYXRvbS1iZWF1dGlmeS4je2xhbmd9X2NvbmZpZ1BhdGhcIiwgdW5jcnVzdGlmeUNvbmZpZ1BhdGgpXG4gICAgICAjIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoXCJhdG9tLWJlYXV0aWZ5LiN7bGFuZ31fY29uZmlnUGF0aFwiKSkudG9FcXVhbChcIlRFU1RcIilcblxuICAjIyNcbiAgRGlyZWN0b3J5IHN0cnVjdHVyZTpcbiAgIC0gZXhhbXBsZXNcbiAgICAgLSBjb25maWcxXG4gICAgICAgLSBsYW5nMVxuICAgICAgICAgLSBvcmlnaW5hbFxuICAgICAgICAgICAtIDEgLSB0ZXN0LmV4dFxuICAgICAgICAgLSBleHBlY3RlZFxuICAgICAgICAgICAtIDEgLSB0ZXN0LmV4dFxuICAgICAgIC0gbGFuZzJcbiAgICAgLSBjb25maWcyXG4gICMjI1xuXG4gICMgQWxsIENvbmZpZ3VyYXRpb25zXG4gIGNvbmZpZ3MgPSBmcy5yZWFkZGlyU3luYyhvcHRpb25zRGlyKVxuICBmb3IgY29uZmlnIGluIGNvbmZpZ3NcbiAgICBkbyAoY29uZmlnKSAtPlxuICAgICAgIyBHZW5lcmF0ZSB0aGUgcGF0aCB0byB3aGVyZSBhbGwgb2YgdGhlIGxhbmd1YWdlcyBhcmVcbiAgICAgIGxhbmdzRGlyID0gcGF0aC5yZXNvbHZlKG9wdGlvbnNEaXIsIGNvbmZpZylcbiAgICAgIG9wdGlvblN0YXRzID0gZnMubHN0YXRTeW5jKGxhbmdzRGlyKVxuICAgICAgIyBDb25maXJtIHRoYXQgdGhpcyBwYXRoIGlzIGEgZGlyZWN0b3J5XG4gICAgICBpZiBvcHRpb25TdGF0cy5pc0RpcmVjdG9yeSgpXG4gICAgICAgICMgQ3JlYXRlIHRlc3RpbmcgZ3JvdXAgZm9yIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgZGVzY3JpYmUgXCJ3aGVuIHVzaW5nIGNvbmZpZ3VyYXRpb24gJyN7Y29uZmlnfSdcIiwgLT5cbiAgICAgICAgICAjIEFsbCBMYW5ndWFnZXMgZm9yIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgICBsYW5nTmFtZXMgPSBmcy5yZWFkZGlyU3luYyhsYW5nc0RpcilcbiAgICAgICAgICBmb3IgbGFuZyBpbiBsYW5nTmFtZXNcblxuICAgICAgICAgICAgIyBGSVhNRTogU2tpcCB0ZXN0aW5nIG9jYW1sIGluIFdpbmRvd3NcbiAgICAgICAgICAgIGlmIGlzV2luZG93cyAmJiBsYW5nID09ICdvY2FtbCdcbiAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgZG8gKGxhbmcpIC0+XG4gICAgICAgICAgICAgICMgR2VuZXJhdGUgdGhlIHBhdGggdG8gd2hlcmUgYWwgb2YgdGhlIHRlc3RzIGFyZVxuICAgICAgICAgICAgICB0ZXN0c0RpciA9IHBhdGgucmVzb2x2ZShsYW5nc0RpciwgbGFuZylcbiAgICAgICAgICAgICAgbGFuZ1N0YXRzID0gZnMubHN0YXRTeW5jKHRlc3RzRGlyKVxuICAgICAgICAgICAgICAjIENvbmZpcm0gdGhhdCB0aGlzIHBhdGggaXMgYSBkaXJlY3RvcnlcbiAgICAgICAgICAgICAgaWYgbGFuZ1N0YXRzLmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICAjIE9yaWdpbmFsXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxEaXIgPSBwYXRoLnJlc29sdmUodGVzdHNEaXIsIFwib3JpZ2luYWxcIilcbiAgICAgICAgICAgICAgICBpZiBub3QgZnMuZXhpc3RzU3luYyhvcmlnaW5hbERpcilcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkRpcmVjdG9yeSBmb3IgdGVzdCBvcmlnaW5hbHMvaW5wdXRzIG5vdCBmb3VuZC5cIiArXG4gICAgICAgICAgICAgICAgICAgIFwiIE1ha2luZyBpdCBhdCAje29yaWdpbmFsRGlyfS5cIilcbiAgICAgICAgICAgICAgICAgIGZzLm1rZGlyU3luYyhvcmlnaW5hbERpcilcbiAgICAgICAgICAgICAgICAjIEV4cGVjdGVkXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWREaXIgPSBwYXRoLnJlc29sdmUodGVzdHNEaXIsIFwiZXhwZWN0ZWRcIilcbiAgICAgICAgICAgICAgICBpZiBub3QgZnMuZXhpc3RzU3luYyhleHBlY3RlZERpcilcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkRpcmVjdG9yeSBmb3IgdGVzdCBleHBlY3RlZC9yZXN1bHRzIG5vdCBmb3VuZC5cIiArXG4gICAgICAgICAgICAgICAgICAgIFwiTWFraW5nIGl0IGF0ICN7ZXhwZWN0ZWREaXJ9LlwiKVxuICAgICAgICAgICAgICAgICAgZnMubWtkaXJTeW5jKGV4cGVjdGVkRGlyKVxuXG4gICAgICAgICAgICAgICAgIyBMYW5ndWFnZSBncm91cCB0ZXN0c1xuICAgICAgICAgICAgICAgIGRlc2NyaWJlIFwid2hlbiBiZWF1dGlmeWluZyBsYW5ndWFnZSAnI3tsYW5nfSdcIiwgLT5cblxuICAgICAgICAgICAgICAgICAgIyBBbGwgdGVzdHMgZm9yIGxhbmd1YWdlXG4gICAgICAgICAgICAgICAgICB0ZXN0TmFtZXMgPSBmcy5yZWFkZGlyU3luYyhvcmlnaW5hbERpcilcbiAgICAgICAgICAgICAgICAgIGZvciB0ZXN0RmlsZU5hbWUgaW4gdGVzdE5hbWVzXG4gICAgICAgICAgICAgICAgICAgIGRvICh0ZXN0RmlsZU5hbWUpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgZXh0ID0gcGF0aC5leHRuYW1lKHRlc3RGaWxlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICB0ZXN0TmFtZSA9IHBhdGguYmFzZW5hbWUodGVzdEZpbGVOYW1lLCBleHQpXG4gICAgICAgICAgICAgICAgICAgICAgIyBJZiBwcmVmaXhlZCB3aXRoIHVuZGVyc2NvcmUgKF8pIHRoZW4gdGhpcyBpcyBhIGhpZGRlbiB0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgaWYgdGVzdEZpbGVOYW1lWzBdIGlzICdfJ1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBEbyBub3Qgc2hvdyB0aGlzIHRlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICMgQ29uZmlybSB0aGlzIGlzIGEgdGVzdFxuICAgICAgICAgICAgICAgICAgICAgIGl0IFwiI3t0ZXN0TmFtZX0gI3t0ZXN0RmlsZU5hbWV9XCIsIC0+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgR2VuZXJhdGUgcGF0aHMgdG8gdGVzdCBmaWxlc1xuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxUZXN0UGF0aCA9IHBhdGgucmVzb2x2ZShvcmlnaW5hbERpciwgdGVzdEZpbGVOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWRUZXN0UGF0aCA9IHBhdGgucmVzb2x2ZShleHBlY3RlZERpciwgdGVzdEZpbGVOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBHZXQgY29udGVudHMgb2Ygb3JpZ2luYWwgdGVzdCBmaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbENvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKG9yaWdpbmFsVGVzdFBhdGgpPy50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAjIENoZWNrIGlmIHRoZXJlIGlzIGEgbWF0Y2hpbmcgZXhwZWN0ZWQgdGVzdCByZXN1dFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm90IGZzLmV4aXN0c1N5bmMoZXhwZWN0ZWRUZXN0UGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gbWF0Y2hpbmcgZXhwZWN0ZWQgdGVzdCByZXN1bHQgZm91bmQgZm9yICcje3Rlc3ROYW1lfScgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXQgJyN7ZXhwZWN0ZWRUZXN0UGF0aH0nLlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAjIGVyciA9IGZzLndyaXRlRmlsZVN5bmMoZXhwZWN0ZWRUZXN0UGF0aCwgb3JpZ2luYWxDb250ZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIyB0aHJvdyBlcnIgaWYgZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEdldCBjb250ZW50cyBvZiBleHBlY3RlZCB0ZXN0IGZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkQ29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoZXhwZWN0ZWRUZXN0UGF0aCk/LnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICMgZXhwZWN0KGV4cGVjdGVkQ29udGVudHMpLm5vdC50b0VxdWFsIG9yaWdpbmFsQ29udGVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICMgZXhwZWN0KGF0b20uZ3JhbW1hcnMuZ2V0R3JhbW1hcnMoKSkudG9FcXVhbCBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuc2VsZWN0R3JhbW1hcihvcmlnaW5hbFRlc3RQYXRoLCBvcmlnaW5hbENvbnRlbnRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBleHBlY3QoZ3JhbW1hcikudG9FcXVhbChcInRlc3RcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyYW1tYXJOYW1lID0gZ3JhbW1hci5uYW1lXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgR2V0IHRoZSBvcHRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxPcHRpb25zID0gYmVhdXRpZmllci5nZXRPcHRpb25zRm9yUGF0aChvcmlnaW5hbFRlc3RQYXRoKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEdldCBsYW5ndWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFuZ3VhZ2UgPSBiZWF1dGlmaWVyLmdldExhbmd1YWdlKGdyYW1tYXJOYW1lLCB0ZXN0RmlsZU5hbWUpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJlYXV0aWZ5Q29tcGxldGVkID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRpb25GdW4gPSAodGV4dCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0KHRleHQgaW5zdGFuY2VvZiBFcnJvcikubm90LnRvRXF1YWwodHJ1ZSwgdGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmVhdXRpZnlDb21wbGV0ZWQgPSB0cnVlIGlmIHRleHQgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAjICAgbG9nZ2VyLnZlcmJvc2UoZXhwZWN0ZWRUZXN0UGF0aCwgdGV4dCkgaWYgZXh0IGlzIFwiLmxlc3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAjICAgaWYgdGV4dCBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICMgICAgIHJldHVybiBiZWF1dGlmeUNvbXBsZXRlZCA9IHRleHQgIyB0ZXh0ID09IEVycm9yXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3QodGV4dCkubm90LnRvRXF1YWwobnVsbCwgXCJMYW5ndWFnZSBvciBCZWF1dGlmaWVyIG5vdCBmb3VuZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBiZWF1dGlmeUNvbXBsZXRlZCA9IHRydWUgaWYgdGV4dCBpcyBudWxsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3QodHlwZW9mIHRleHQpLnRvRXF1YWwoXCJzdHJpbmdcIiwgXCJUZXh0OiAje3RleHR9XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJlYXV0aWZ5Q29tcGxldGVkID0gdHJ1ZSBpZiB0eXBlb2YgdGV4dCBpc250IFwic3RyaW5nXCJcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgUmVwbGFjZSBOZXdsaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyg/OlxcclxcbnxcXHJ8XFxuKS9nLCAn4o+OXFxuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZENvbnRlbnRzID0gZXhwZWN0ZWRDb250ZW50c1xcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKD86XFxyXFxufFxccnxcXG4pL2csICfij45cXG4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgUmVwbGFjZSB0YWJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvKD86XFx0KS9nLCAn4oa5JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZENvbnRlbnRzID0gZXhwZWN0ZWRDb250ZW50c1xcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKD86XFx0KS9nLCAn4oa5JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIFJlcGxhY2Ugc3BhY2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvKD86XFwgKS9nLCAn4pCjJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZENvbnRlbnRzID0gZXhwZWN0ZWRDb250ZW50c1xcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKD86XFwgKS9nLCAn4pCjJylcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgQ2hlY2sgZm9yIGJlYXV0aWZpY2F0aW9uIGVycm9yc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHRleHQgaXNudCBleHBlY3RlZENvbnRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIGNvbnNvbGUud2FybihhbGxPcHRpb25zLCB0ZXh0LCBleHBlY3RlZENvbnRlbnRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBleHBlY3RlZFRlc3RQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRTdHI9dGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RyPWV4cGVjdGVkQ29udGVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZEhlYWRlcj1cImJlYXV0aWZpZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3SGVhZGVyPVwiZXhwZWN0ZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IEpzRGlmZi5jcmVhdGVQYXRjaChmaWxlTmFtZSwgb2xkU3RyLCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTdHIsIG9sZEhlYWRlciwgbmV3SGVhZGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBHZXQgb3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0cyA9IGJlYXV0aWZpZXIuZ2V0T3B0aW9uc0Zvckxhbmd1YWdlKGFsbE9wdGlvbnMsIGxhbmd1YWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRCZWF1dGlmaWVyID0gYmVhdXRpZmllci5nZXRCZWF1dGlmaWVyRm9yTGFuZ3VhZ2UobGFuZ3VhZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBzZWxlY3RlZEJlYXV0aWZpZXI/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMgPSBiZWF1dGlmaWVyLnRyYW5zZm9ybU9wdGlvbnMoc2VsZWN0ZWRCZWF1dGlmaWVyLCBsYW5ndWFnZS5uYW1lLCBvcHRzKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIFNob3cgZXJyb3IgbWVzc2FnZSB3aXRoIGRlYnVnIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3QodGV4dCkudG9FcXVhbChleHBlY3RlZENvbnRlbnRzLCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkJlYXV0aWZpZXIgJyN7c2VsZWN0ZWRCZWF1dGlmaWVyPy5uYW1lfScgb3V0cHV0IGRvZXMgbm90IG1hdGNoIGV4cGVjdGVkIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDpcXG4je2RpZmZ9XFxuXFxuXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV2l0aCBvcHRpb25zOlxcblxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICN7SlNPTi5zdHJpbmdpZnkob3B0cywgdW5kZWZpbmVkLCA0KX1cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIEFsbCBkb25lIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlYXV0aWZ5Q29tcGxldGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlYXV0aWZ5Q29tcGxldGVkID0gZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlYXV0aWZpZXIuYmVhdXRpZnkob3JpZ2luYWxDb250ZW50cywgYWxsT3B0aW9ucywgZ3JhbW1hck5hbWUsIHRlc3RGaWxlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihjb21wbGV0aW9uRnVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChjb21wbGV0aW9uRnVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVhdXRpZnlDb21wbGV0ZWQgPSBlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdhaXRzRm9yKC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGJlYXV0aWZ5Q29tcGxldGVkIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBiZWF1dGlmeUNvbXBsZXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJlYXV0aWZ5Q29tcGxldGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAsIFwiV2FpdGluZyBmb3IgYmVhdXRpZmljYXRpb24gdG8gY29tcGxldGVcIiwgNjAwMDApXG4iXX0=
