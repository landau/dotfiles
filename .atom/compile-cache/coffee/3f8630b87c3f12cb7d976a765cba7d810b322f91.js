(function() {
  var Beautifiers, JsDiff, beautifier, fs, isWindows, path, unsupportedLangs;

  Beautifiers = require("../src/beautifiers");

  beautifier = new Beautifiers();

  fs = require("fs");

  path = require("path");

  JsDiff = require('diff');

  isWindows = process.platform === 'win32' || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';

  unsupportedLangs = {
    all: [],
    windows: ["ocaml", "r", "clojure", "apex", "bash", "csharp", "d", "elm", "java", "objectivec", "opencl"]
  };

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
        atom.config.set('atom-beautify.general.loggerLevel', 'info');
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
            var k, langNames, len2, results1, shouldSkipLang;
            langNames = fs.readdirSync(langsDir);
            results1 = [];
            for (k = 0, len2 = langNames.length; k < len2; k++) {
              lang = langNames[k];
              shouldSkipLang = false;
              if (unsupportedLangs.all.indexOf(lang) !== -1) {
                shouldSkipLang = true;
              }
              if (isWindows && unsupportedLangs.windows.indexOf(lang) !== -1) {
                console.warn("Tests for Windows do not support " + lang);
                shouldSkipLang = true;
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
                  return describe((shouldSkipLang ? '#' : '') + "when beautifying language '" + lang + "'", function() {
                    var l, len3, results2, testFileName, testNames;
                    testNames = fs.readdirSync(originalDir);
                    results2 = [];
                    for (l = 0, len3 = testNames.length; l < len3; l++) {
                      testFileName = testNames[l];
                      results2.push((function(testFileName) {
                        var ext, shouldSkip, testName;
                        ext = path.extname(testFileName);
                        testName = path.basename(testFileName, ext);
                        shouldSkip = false;
                        if (testFileName[0] === '_') {
                          shouldSkip = true;
                        }
                        return it("" + (shouldSkip ? '# ' : '') + testName + " " + testFileName, function() {
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
                              expect(text instanceof Error).not.toEqual(true, text.message || text.toString());
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcGVjL2JlYXV0aWZ5LWxhbmd1YWdlcy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxvQkFBUjs7RUFDZCxVQUFBLEdBQWlCLElBQUEsV0FBQSxDQUFBOztFQUNqQixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE1BQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7RUFRVCxTQUFBLEdBQVksT0FBTyxDQUFDLFFBQVIsS0FBb0IsT0FBcEIsSUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQVosS0FBc0IsUUFEWixJQUVWLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBWixLQUFzQjs7RUFFeEIsZ0JBQUEsR0FBbUI7SUFDakIsR0FBQSxFQUFLLEVBRFk7SUFHakIsT0FBQSxFQUFTLENBQ1AsT0FETyxFQUVQLEdBRk8sRUFHUCxTQUhPLEVBS1AsTUFMTyxFQU1QLE1BTk8sRUFPUCxRQVBPLEVBUVAsR0FSTyxFQVNQLEtBVE8sRUFVUCxNQVZPLEVBV1AsWUFYTyxFQVlQLFFBWk8sQ0FIUTs7O0VBbUJuQixRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQTtBQUU1QixRQUFBO0lBQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixhQUF4QjtJQUdiLFlBQUEsR0FBZSxDQUNiLEdBRGEsRUFDUixTQURRLEVBQ0csZUFESCxFQUNvQixLQURwQixFQUMyQixHQUQzQixFQUNnQyxNQURoQyxFQUViLE1BRmEsRUFFTCxZQUZLLEVBRVMsTUFGVCxFQUVpQixNQUZqQixFQUdiLFVBSGEsRUFHRCxhQUhDLEVBR2MsTUFIZCxFQUdzQixLQUh0QixFQUliLFFBSmEsRUFJSCxNQUpHLEVBSUssTUFKTCxFQUlhLEtBSmIsRUFJb0IsS0FKcEIsRUFLYixLQUxhLEVBS04sUUFMTSxFQUtJLEtBTEosRUFLVyxPQUxYLEVBTWIsSUFOYSxFQU1QLFdBTk8sRUFNTSxLQU5OO0lBU2YsaUJBQUEsR0FBb0IsQ0FDbEIsbUJBRGtCO1NBT2YsU0FBQyxJQUFEO2FBQ0QsaUJBQWlCLENBQUMsSUFBbEIsQ0FBdUIsV0FBQSxHQUFZLElBQW5DO0lBREM7QUFETCxTQUFBLDhDQUFBOztTQUNNO0FBRE47SUFJQSxVQUFBLENBQVcsU0FBQTtBQUVULFVBQUE7WUFDSyxTQUFDLFdBQUQ7ZUFDRCxlQUFBLENBQWdCLFNBQUE7aUJBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFdBQTlCO1FBRGMsQ0FBaEI7TUFEQztBQURMLFdBQUEscURBQUE7O1lBQ007QUFETjthQU1BLGVBQUEsQ0FBZ0IsU0FBQTtBQUNkLFlBQUE7UUFBQSxpQkFBQSxHQUFvQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsZUFBOUI7UUFFcEIsSUFBQSxHQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsZUFBL0I7UUFDUCxJQUFJLENBQUMsV0FBTCxDQUFBO1FBR0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1DQUFoQixFQUFxRCxNQUFyRDtBQUVBLGVBQU87TUFUTyxDQUFoQjtJQVJTLENBQVg7O0FBMkJBOzs7Ozs7Ozs7Ozs7SUFjQSxPQUFBLEdBQVUsRUFBRSxDQUFDLFdBQUgsQ0FBZSxVQUFmO0FBQ1Y7U0FBQSwyQ0FBQTs7bUJBQ0ssQ0FBQSxTQUFDLE1BQUQ7QUFFRCxZQUFBO1FBQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxPQUFMLENBQWEsVUFBYixFQUF5QixNQUF6QjtRQUNYLFdBQUEsR0FBYyxFQUFFLENBQUMsU0FBSCxDQUFhLFFBQWI7UUFFZCxJQUFHLFdBQVcsQ0FBQyxXQUFaLENBQUEsQ0FBSDtpQkFFRSxRQUFBLENBQVMsNEJBQUEsR0FBNkIsTUFBN0IsR0FBb0MsR0FBN0MsRUFBaUQsU0FBQTtBQUUvQyxnQkFBQTtZQUFBLFNBQUEsR0FBWSxFQUFFLENBQUMsV0FBSCxDQUFlLFFBQWY7QUFDWjtpQkFBQSw2Q0FBQTs7Y0FFRSxjQUFBLEdBQWlCO2NBQ2pCLElBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE9BQXJCLENBQTZCLElBQTdCLENBQUEsS0FBd0MsQ0FBQyxDQUE1QztnQkFDRSxjQUFBLEdBQWlCLEtBRG5COztjQUVBLElBQUcsU0FBQSxJQUFjLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxPQUF6QixDQUFpQyxJQUFqQyxDQUFBLEtBQTRDLENBQUMsQ0FBOUQ7Z0JBQ0UsT0FBTyxDQUFDLElBQVIsQ0FBYSxtQ0FBQSxHQUFvQyxJQUFqRDtnQkFDQSxjQUFBLEdBQWlCLEtBRm5COzs0QkFJRyxDQUFBLFNBQUMsSUFBRDtBQUVELG9CQUFBO2dCQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsT0FBTCxDQUFhLFFBQWIsRUFBdUIsSUFBdkI7Z0JBQ1gsU0FBQSxHQUFZLEVBQUUsQ0FBQyxTQUFILENBQWEsUUFBYjtnQkFFWixJQUFHLFNBQVMsQ0FBQyxXQUFWLENBQUEsQ0FBSDtrQkFFRSxXQUFBLEdBQWMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLEVBQXVCLFVBQXZCO2tCQUNkLElBQUcsQ0FBSSxFQUFFLENBQUMsVUFBSCxDQUFjLFdBQWQsQ0FBUDtvQkFDRSxPQUFPLENBQUMsSUFBUixDQUFhLGdEQUFBLEdBQ1gsQ0FBQSxnQkFBQSxHQUFpQixXQUFqQixHQUE2QixHQUE3QixDQURGO29CQUVBLEVBQUUsQ0FBQyxTQUFILENBQWEsV0FBYixFQUhGOztrQkFLQSxXQUFBLEdBQWMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLEVBQXVCLFVBQXZCO2tCQUNkLElBQUcsQ0FBSSxFQUFFLENBQUMsVUFBSCxDQUFjLFdBQWQsQ0FBUDtvQkFDRSxPQUFPLENBQUMsSUFBUixDQUFhLGdEQUFBLEdBQ1gsQ0FBQSxlQUFBLEdBQWdCLFdBQWhCLEdBQTRCLEdBQTVCLENBREY7b0JBRUEsRUFBRSxDQUFDLFNBQUgsQ0FBYSxXQUFiLEVBSEY7O3lCQU1BLFFBQUEsQ0FBVyxDQUFJLGNBQUgsR0FBdUIsR0FBdkIsR0FBZ0MsRUFBakMsQ0FBQSxHQUFvQyw2QkFBcEMsR0FBaUUsSUFBakUsR0FBc0UsR0FBakYsRUFBcUYsU0FBQTtBQUduRix3QkFBQTtvQkFBQSxTQUFBLEdBQVksRUFBRSxDQUFDLFdBQUgsQ0FBZSxXQUFmO0FBQ1o7eUJBQUEsNkNBQUE7O29DQUNLLENBQUEsU0FBQyxZQUFEO0FBQ0QsNEJBQUE7d0JBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxPQUFMLENBQWEsWUFBYjt3QkFDTixRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxZQUFkLEVBQTRCLEdBQTVCO3dCQUVYLFVBQUEsR0FBYTt3QkFDYixJQUFHLFlBQWEsQ0FBQSxDQUFBLENBQWIsS0FBbUIsR0FBdEI7MEJBRUUsVUFBQSxHQUFhLEtBRmY7OytCQUlBLEVBQUEsQ0FBRyxFQUFBLEdBQUUsQ0FBSSxVQUFILEdBQW1CLElBQW5CLEdBQTZCLEVBQTlCLENBQUYsR0FBcUMsUUFBckMsR0FBOEMsR0FBOUMsR0FBaUQsWUFBcEQsRUFBb0UsU0FBQTtBQUdsRSw4QkFBQTswQkFBQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsT0FBTCxDQUFhLFdBQWIsRUFBMEIsWUFBMUI7MEJBQ25CLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxPQUFMLENBQWEsV0FBYixFQUEwQixZQUExQjswQkFFbkIsZ0JBQUEsMERBQW9ELENBQUUsUUFBbkMsQ0FBQTswQkFFbkIsSUFBRyxDQUFJLEVBQUUsQ0FBQyxVQUFILENBQWMsZ0JBQWQsQ0FBUDtBQUNFLGtDQUFVLElBQUEsS0FBQSxDQUFNLENBQUEsOENBQUEsR0FBK0MsUUFBL0MsR0FBd0QsSUFBeEQsQ0FBQSxHQUNkLENBQUEsTUFBQSxHQUFPLGdCQUFQLEdBQXdCLElBQXhCLENBRFEsRUFEWjs7MEJBTUEsZ0JBQUEsNERBQW9ELENBQUUsUUFBbkMsQ0FBQTswQkFHbkIsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBZCxDQUE0QixnQkFBNUIsRUFBOEMsZ0JBQTlDOzBCQUVWLFdBQUEsR0FBYyxPQUFPLENBQUM7MEJBR3RCLFVBQUEsR0FBYSxVQUFVLENBQUMsaUJBQVgsQ0FBNkIsZ0JBQTdCOzBCQUdiLFFBQUEsR0FBVyxVQUFVLENBQUMsV0FBWCxDQUF1QixXQUF2QixFQUFvQyxZQUFwQzswQkFFWCxpQkFBQSxHQUFvQjswQkFDcEIsYUFBQSxHQUFnQixTQUFDLElBQUQ7QUFDZCxnQ0FBQTtBQUFBOzhCQUNFLE1BQUEsQ0FBTyxJQUFBLFlBQWdCLEtBQXZCLENBQTZCLENBQUMsR0FBRyxDQUFDLE9BQWxDLENBQTBDLElBQTFDLEVBQWdELElBQUksQ0FBQyxPQUFMLElBQWdCLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBaEU7OEJBQ0EsSUFBbUMsSUFBQSxZQUFnQixLQUFuRDtBQUFBLHVDQUFPLGlCQUFBLEdBQW9CLEtBQTNCOzs4QkFLQSxNQUFBLENBQU8sSUFBUCxDQUFZLENBQUMsR0FBRyxDQUFDLE9BQWpCLENBQXlCLElBQXpCLEVBQStCLGtDQUEvQjs4QkFDQSxJQUFtQyxJQUFBLEtBQVEsSUFBM0M7QUFBQSx1Q0FBTyxpQkFBQSxHQUFvQixLQUEzQjs7OEJBRUEsTUFBQSxDQUFPLE9BQU8sSUFBZCxDQUFtQixDQUFDLE9BQXBCLENBQTRCLFFBQTVCLEVBQXNDLFFBQUEsR0FBUyxJQUEvQzs4QkFDQSxJQUFtQyxPQUFPLElBQVAsS0FBaUIsUUFBcEQ7QUFBQSx1Q0FBTyxpQkFBQSxHQUFvQixLQUEzQjs7OEJBR0EsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsaUJBQWIsRUFBZ0MsS0FBaEM7OEJBQ1AsZ0JBQUEsR0FBbUIsZ0JBQ2pCLENBQUMsT0FEZ0IsQ0FDUixpQkFEUSxFQUNXLEtBRFg7OEJBR25CLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsR0FBeEI7OEJBQ1AsZ0JBQUEsR0FBbUIsZ0JBQ2pCLENBQUMsT0FEZ0IsQ0FDUixTQURRLEVBQ0csR0FESDs4QkFHbkIsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixHQUF4Qjs4QkFDUCxnQkFBQSxHQUFtQixnQkFDakIsQ0FBQyxPQURnQixDQUNSLFNBRFEsRUFDRyxHQURIOzhCQUluQixJQUFHLElBQUEsS0FBVSxnQkFBYjtnQ0FFRSxRQUFBLEdBQVc7Z0NBQ1gsTUFBQSxHQUFPO2dDQUNQLE1BQUEsR0FBTztnQ0FDUCxTQUFBLEdBQVU7Z0NBQ1YsU0FBQSxHQUFVO2dDQUNWLElBQUEsR0FBTyxNQUFNLENBQUMsV0FBUCxDQUFtQixRQUFuQixFQUE2QixNQUE3QixFQUNMLE1BREssRUFDRyxTQURILEVBQ2MsU0FEZDtnQ0FHUCxJQUFBLEdBQU8sVUFBVSxDQUFDLHFCQUFYLENBQWlDLFVBQWpDLEVBQTZDLFFBQTdDO2dDQUNQLGtCQUFBLEdBQXFCLFVBQVUsQ0FBQyx3QkFBWCxDQUFvQyxRQUFwQztnQ0FDckIsSUFBRywwQkFBSDtrQ0FDRSxJQUFBLEdBQU8sVUFBVSxDQUFDLGdCQUFYLENBQTRCLGtCQUE1QixFQUFnRCxRQUFRLENBQUMsSUFBekQsRUFBK0QsSUFBL0QsRUFEVDs7Z0NBSUEsTUFBQSxDQUFPLElBQVAsQ0FBWSxDQUFDLE9BQWIsQ0FBcUIsZ0JBQXJCLEVBQ0UsY0FBQSxHQUFjLDhCQUFDLGtCQUFrQixDQUFFLGFBQXJCLENBQWQsR0FBd0MsNENBQXhDLEdBQ1csSUFEWCxHQUNnQixxQkFEaEIsR0FHQyxDQUFDLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBZixFQUFxQixNQUFyQixFQUFnQyxDQUFoQyxDQUFELENBSkgsRUFoQkY7O3FDQXNCQSxpQkFBQSxHQUFvQixLQWpEdEI7NkJBQUEsYUFBQTs4QkFrRE07OEJBQ0osT0FBTyxDQUFDLEtBQVIsQ0FBYyxDQUFkO3FDQUNBLGlCQUFBLEdBQW9CLEVBcER0Qjs7MEJBRGM7MEJBdURoQixJQUFBLENBQUssU0FBQTtBQUNILGdDQUFBO0FBQUE7cUNBQ0UsVUFBVSxDQUFDLFFBQVgsQ0FBb0IsZ0JBQXBCLEVBQXNDLFVBQXRDLEVBQWtELFdBQWxELEVBQStELFlBQS9ELENBQ0EsQ0FBQyxJQURELENBQ00sYUFETixDQUVBLEVBQUMsS0FBRCxFQUZBLENBRU8sYUFGUCxFQURGOzZCQUFBLGFBQUE7OEJBSU07cUNBQ0osaUJBQUEsR0FBb0IsRUFMdEI7OzBCQURHLENBQUw7aUNBUUEsUUFBQSxDQUFTLFNBQUE7NEJBQ1AsSUFBRyxpQkFBQSxZQUE2QixLQUFoQztBQUNFLG9DQUFNLGtCQURSOzZCQUFBLE1BQUE7QUFHRSxxQ0FBTyxrQkFIVDs7MEJBRE8sQ0FBVCxFQUtFLHdDQUxGLEVBSzRDLEtBTDVDO3dCQTNGa0UsQ0FBcEU7c0JBVEMsQ0FBQSxDQUFILENBQUksWUFBSjtBQURGOztrQkFKbUYsQ0FBckYsRUFmRjs7Y0FMQyxDQUFBLENBQUgsQ0FBSSxJQUFKO0FBVEY7O1VBSCtDLENBQWpELEVBRkY7O01BTEMsQ0FBQSxDQUFILENBQUksTUFBSjtBQURGOztFQWxFNEIsQ0FBOUI7QUFuQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIjIEJlYXV0aWZ5ID0gcmVxdWlyZSAnLi4vc3JjL2JlYXV0aWZ5J1xuQmVhdXRpZmllcnMgPSByZXF1aXJlIFwiLi4vc3JjL2JlYXV0aWZpZXJzXCJcbmJlYXV0aWZpZXIgPSBuZXcgQmVhdXRpZmllcnMoKVxuZnMgPSByZXF1aXJlIFwiZnNcIlxucGF0aCA9IHJlcXVpcmUgXCJwYXRoXCJcbkpzRGlmZiA9IHJlcXVpcmUoJ2RpZmYnKVxuXG4jIFVzZSB0aGUgY29tbWFuZCBgd2luZG93OnJ1bi1wYWNrYWdlLXNwZWNzYCAoY21kLWFsdC1jdHJsLXApIHRvIHJ1biBzcGVjcy5cbiNcbiMgVG8gcnVuIGEgc3BlY2lmaWMgYGl0YCBvciBgZGVzY3JpYmVgIGJsb2NrIGFkZCBhbiBgZmAgdG8gdGhlIGZyb250IChlLmcuIGBmaXRgXG4jIG9yIGBmZGVzY3JpYmVgKS4gUmVtb3ZlIHRoZSBgZmAgdG8gdW5mb2N1cyB0aGUgYmxvY2suXG5cbiMgQ2hlY2sgaWYgV2luZG93c1xuaXNXaW5kb3dzID0gcHJvY2Vzcy5wbGF0Zm9ybSBpcyAnd2luMzInIG9yXG4gIHByb2Nlc3MuZW52Lk9TVFlQRSBpcyAnY3lnd2luJyBvclxuICBwcm9jZXNzLmVudi5PU1RZUEUgaXMgJ21zeXMnXG5cbnVuc3VwcG9ydGVkTGFuZ3MgPSB7XG4gIGFsbDogW1xuICBdXG4gIHdpbmRvd3M6IFtcbiAgICBcIm9jYW1sXCJcbiAgICBcInJcIlxuICAgIFwiY2xvanVyZVwiXG4gICAgIyBCcm9rZW5cbiAgICBcImFwZXhcIlxuICAgIFwiYmFzaFwiXG4gICAgXCJjc2hhcnBcIlxuICAgIFwiZFwiXG4gICAgXCJlbG1cIlxuICAgIFwiamF2YVwiXG4gICAgXCJvYmplY3RpdmVjXCJcbiAgICBcIm9wZW5jbFwiXG4gIF1cbn1cblxuZGVzY3JpYmUgXCJCZWF1dGlmeUxhbmd1YWdlc1wiLCAtPlxuXG4gIG9wdGlvbnNEaXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL2V4YW1wbGVzXCIpXG5cbiAgIyBBY3RpdmF0ZSBhbGwgb2YgdGhlIGxhbmd1YWdlc1xuICBhbGxMYW5ndWFnZXMgPSBbXG4gICAgXCJjXCIsIFwiY2xvanVyZVwiLCBcImNvZmZlZS1zY3JpcHRcIiwgXCJjc3NcIiwgXCJkXCIsIFwiaHRtbFwiLFxuICAgIFwiamF2YVwiLCBcImphdmFzY3JpcHRcIiwgXCJqc29uXCIsIFwibGVzc1wiLFxuICAgIFwibXVzdGFjaGVcIiwgXCJvYmplY3RpdmUtY1wiLCBcInBlcmxcIiwgXCJwaHBcIixcbiAgICBcInB5dGhvblwiLCBcInJ1YnlcIiwgXCJzYXNzXCIsIFwic3FsXCIsIFwic3ZnXCIsXG4gICAgXCJ4bWxcIiwgXCJjc2hhcnBcIiwgXCJnZm1cIiwgXCJtYXJrb1wiLFxuICAgIFwiZ29cIiwgXCJodG1sLXN3aWdcIiwgXCJsdWFcIlxuICAgIF1cbiAgIyBBbGwgQXRvbSBwYWNrYWdlcyB0aGF0IEF0b20gQmVhdXRpZnkgaXMgZGVwZW5kZW50IG9uXG4gIGRlcGVuZGVudFBhY2thZ2VzID0gW1xuICAgICdhdXRvY29tcGxldGUtcGx1cydcbiAgICAjICdsaW50ZXInXG4gICAgIyAgICdhdG9tLXR5cGVzY3JpcHQnICMgaXQgbG9ncyB0b28gbXVjaC4uLlxuICBdXG4gICMgQWRkIGxhbmd1YWdlIHBhY2thZ2VzIHRvIGRlcGVuZGVudFBhY2thZ2VzXG4gIGZvciBsYW5nIGluIGFsbExhbmd1YWdlc1xuICAgIGRvIChsYW5nKSAtPlxuICAgICAgZGVwZW5kZW50UGFja2FnZXMucHVzaChcImxhbmd1YWdlLSN7bGFuZ31cIilcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgIyBJbnN0YWxsIGFsbCBvZiB0aGUgbGFuZ3VhZ2VzXG4gICAgZm9yIHBhY2thZ2VOYW1lIGluIGRlcGVuZGVudFBhY2thZ2VzXG4gICAgICBkbyAocGFja2FnZU5hbWUpIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKHBhY2thZ2VOYW1lKVxuXG4gICAgIyBBY3RpdmF0ZSBwYWNrYWdlXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBhY3RpdmF0aW9uUHJvbWlzZSA9IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdG9tLWJlYXV0aWZ5JylcbiAgICAgICMgRm9yY2UgYWN0aXZhdGUgcGFja2FnZVxuICAgICAgcGFjayA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZShcImF0b20tYmVhdXRpZnlcIilcbiAgICAgIHBhY2suYWN0aXZhdGVOb3coKVxuICAgICAgIyBOZWVkIG1vcmUgZGVidWdnaW5nIG9uIFdpbmRvd3NcbiAgICAgICMgQ2hhbmdlIGxvZ2dlciBsZXZlbFxuICAgICAgYXRvbS5jb25maWcuc2V0KCdhdG9tLWJlYXV0aWZ5LmdlbmVyYWwubG9nZ2VyTGV2ZWwnLCAnaW5mbycpXG4gICAgICAjIFJldHVybiBwcm9taXNlXG4gICAgICByZXR1cm4gYWN0aXZhdGlvblByb21pc2VcblxuICAgICMgU2V0IFVuY3J1c3RpZnkgY29uZmlnIHBhdGhcbiAgICAjIHVuY3J1c3RpZnlDb25maWdQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9leGFtcGxlcy9uZXN0ZWQtanNiZWF1dGlmeXJjL3VuY3J1c3RpZnkuY2ZnXCIpXG4gICAgIyB1bmNydXN0aWZ5TGFuZ3MgPSBbXCJhcGV4XCIsIFwiY1wiLCBcImNwcFwiLCBcIm9iamVjdGl2ZWNcIiwgXCJjc1wiLCBcImRcIiwgXCJqYXZhXCIsIFwicGF3blwiLCBcInZhbGFcIl1cbiAgICAjIGZvciBsYW5nIGluIHVuY3J1c3RpZnlMYW5nc1xuICAgICMgICAgIGRvIChsYW5nKSAtPlxuICAgICAgIyBhdG9tLmNvbmZpZy5zZXQoXCJhdG9tLWJlYXV0aWZ5LiN7bGFuZ31fY29uZmlnUGF0aFwiLCB1bmNydXN0aWZ5Q29uZmlnUGF0aClcbiAgICAgICMgZXhwZWN0KGF0b20uY29uZmlnLmdldChcImF0b20tYmVhdXRpZnkuI3tsYW5nfV9jb25maWdQYXRoXCIpKS50b0VxdWFsKFwiVEVTVFwiKVxuXG4gICMjI1xuICBEaXJlY3Rvcnkgc3RydWN0dXJlOlxuICAgLSBleGFtcGxlc1xuICAgICAtIGNvbmZpZzFcbiAgICAgICAtIGxhbmcxXG4gICAgICAgICAtIG9yaWdpbmFsXG4gICAgICAgICAgIC0gMSAtIHRlc3QuZXh0XG4gICAgICAgICAtIGV4cGVjdGVkXG4gICAgICAgICAgIC0gMSAtIHRlc3QuZXh0XG4gICAgICAgLSBsYW5nMlxuICAgICAtIGNvbmZpZzJcbiAgIyMjXG5cbiAgIyBBbGwgQ29uZmlndXJhdGlvbnNcbiAgY29uZmlncyA9IGZzLnJlYWRkaXJTeW5jKG9wdGlvbnNEaXIpXG4gIGZvciBjb25maWcgaW4gY29uZmlnc1xuICAgIGRvIChjb25maWcpIC0+XG4gICAgICAjIEdlbmVyYXRlIHRoZSBwYXRoIHRvIHdoZXJlIGFsbCBvZiB0aGUgbGFuZ3VhZ2VzIGFyZVxuICAgICAgbGFuZ3NEaXIgPSBwYXRoLnJlc29sdmUob3B0aW9uc0RpciwgY29uZmlnKVxuICAgICAgb3B0aW9uU3RhdHMgPSBmcy5sc3RhdFN5bmMobGFuZ3NEaXIpXG4gICAgICAjIENvbmZpcm0gdGhhdCB0aGlzIHBhdGggaXMgYSBkaXJlY3RvcnlcbiAgICAgIGlmIG9wdGlvblN0YXRzLmlzRGlyZWN0b3J5KClcbiAgICAgICAgIyBDcmVhdGUgdGVzdGluZyBncm91cCBmb3IgY29uZmlndXJhdGlvblxuICAgICAgICBkZXNjcmliZSBcIndoZW4gdXNpbmcgY29uZmlndXJhdGlvbiAnI3tjb25maWd9J1wiLCAtPlxuICAgICAgICAgICMgQWxsIExhbmd1YWdlcyBmb3IgY29uZmlndXJhdGlvblxuICAgICAgICAgIGxhbmdOYW1lcyA9IGZzLnJlYWRkaXJTeW5jKGxhbmdzRGlyKVxuICAgICAgICAgIGZvciBsYW5nIGluIGxhbmdOYW1lc1xuXG4gICAgICAgICAgICBzaG91bGRTa2lwTGFuZyA9IGZhbHNlXG4gICAgICAgICAgICBpZiB1bnN1cHBvcnRlZExhbmdzLmFsbC5pbmRleE9mKGxhbmcpIGlzbnQgLTFcbiAgICAgICAgICAgICAgc2hvdWxkU2tpcExhbmcgPSB0cnVlXG4gICAgICAgICAgICBpZiBpc1dpbmRvd3MgYW5kIHVuc3VwcG9ydGVkTGFuZ3Mud2luZG93cy5pbmRleE9mKGxhbmcpIGlzbnQgLTFcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVGVzdHMgZm9yIFdpbmRvd3MgZG8gbm90IHN1cHBvcnQgI3tsYW5nfVwiKVxuICAgICAgICAgICAgICBzaG91bGRTa2lwTGFuZyA9IHRydWVcblxuICAgICAgICAgICAgZG8gKGxhbmcpIC0+XG4gICAgICAgICAgICAgICMgR2VuZXJhdGUgdGhlIHBhdGggdG8gd2hlcmUgYWwgb2YgdGhlIHRlc3RzIGFyZVxuICAgICAgICAgICAgICB0ZXN0c0RpciA9IHBhdGgucmVzb2x2ZShsYW5nc0RpciwgbGFuZylcbiAgICAgICAgICAgICAgbGFuZ1N0YXRzID0gZnMubHN0YXRTeW5jKHRlc3RzRGlyKVxuICAgICAgICAgICAgICAjIENvbmZpcm0gdGhhdCB0aGlzIHBhdGggaXMgYSBkaXJlY3RvcnlcbiAgICAgICAgICAgICAgaWYgbGFuZ1N0YXRzLmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICAjIE9yaWdpbmFsXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxEaXIgPSBwYXRoLnJlc29sdmUodGVzdHNEaXIsIFwib3JpZ2luYWxcIilcbiAgICAgICAgICAgICAgICBpZiBub3QgZnMuZXhpc3RzU3luYyhvcmlnaW5hbERpcilcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkRpcmVjdG9yeSBmb3IgdGVzdCBvcmlnaW5hbHMvaW5wdXRzIG5vdCBmb3VuZC5cIiArXG4gICAgICAgICAgICAgICAgICAgIFwiIE1ha2luZyBpdCBhdCAje29yaWdpbmFsRGlyfS5cIilcbiAgICAgICAgICAgICAgICAgIGZzLm1rZGlyU3luYyhvcmlnaW5hbERpcilcbiAgICAgICAgICAgICAgICAjIEV4cGVjdGVkXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWREaXIgPSBwYXRoLnJlc29sdmUodGVzdHNEaXIsIFwiZXhwZWN0ZWRcIilcbiAgICAgICAgICAgICAgICBpZiBub3QgZnMuZXhpc3RzU3luYyhleHBlY3RlZERpcilcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkRpcmVjdG9yeSBmb3IgdGVzdCBleHBlY3RlZC9yZXN1bHRzIG5vdCBmb3VuZC5cIiArXG4gICAgICAgICAgICAgICAgICAgIFwiTWFraW5nIGl0IGF0ICN7ZXhwZWN0ZWREaXJ9LlwiKVxuICAgICAgICAgICAgICAgICAgZnMubWtkaXJTeW5jKGV4cGVjdGVkRGlyKVxuXG4gICAgICAgICAgICAgICAgIyBMYW5ndWFnZSBncm91cCB0ZXN0c1xuICAgICAgICAgICAgICAgIGRlc2NyaWJlIFwiI3tpZiBzaG91bGRTa2lwTGFuZyB0aGVuICcjJyBlbHNlICcnfXdoZW4gYmVhdXRpZnlpbmcgbGFuZ3VhZ2UgJyN7bGFuZ30nXCIsIC0+XG5cbiAgICAgICAgICAgICAgICAgICMgQWxsIHRlc3RzIGZvciBsYW5ndWFnZVxuICAgICAgICAgICAgICAgICAgdGVzdE5hbWVzID0gZnMucmVhZGRpclN5bmMob3JpZ2luYWxEaXIpXG4gICAgICAgICAgICAgICAgICBmb3IgdGVzdEZpbGVOYW1lIGluIHRlc3ROYW1lc1xuICAgICAgICAgICAgICAgICAgICBkbyAodGVzdEZpbGVOYW1lKSAtPlxuICAgICAgICAgICAgICAgICAgICAgIGV4dCA9IHBhdGguZXh0bmFtZSh0ZXN0RmlsZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgdGVzdE5hbWUgPSBwYXRoLmJhc2VuYW1lKHRlc3RGaWxlTmFtZSwgZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICMgSWYgcHJlZml4ZWQgd2l0aCB1bmRlcnNjb3JlIChfKSB0aGVuIHRoaXMgaXMgYSBoaWRkZW4gdGVzdFxuICAgICAgICAgICAgICAgICAgICAgIHNob3VsZFNraXAgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgIGlmIHRlc3RGaWxlTmFtZVswXSBpcyAnXydcbiAgICAgICAgICAgICAgICAgICAgICAgICMgRG8gbm90IHNob3cgdGhpcyB0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG91bGRTa2lwID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICMgQ29uZmlybSB0aGlzIGlzIGEgdGVzdFxuICAgICAgICAgICAgICAgICAgICAgIGl0IFwiI3tpZiBzaG91bGRTa2lwIHRoZW4gJyMgJyBlbHNlICcnfSN7dGVzdE5hbWV9ICN7dGVzdEZpbGVOYW1lfVwiLCAtPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEdlbmVyYXRlIHBhdGhzIHRvIHRlc3QgZmlsZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsVGVzdFBhdGggPSBwYXRoLnJlc29sdmUob3JpZ2luYWxEaXIsIHRlc3RGaWxlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkVGVzdFBhdGggPSBwYXRoLnJlc29sdmUoZXhwZWN0ZWREaXIsIHRlc3RGaWxlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICMgR2V0IGNvbnRlbnRzIG9mIG9yaWdpbmFsIHRlc3QgZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxDb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyhvcmlnaW5hbFRlc3RQYXRoKT8udG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBDaGVjayBpZiB0aGVyZSBpcyBhIG1hdGNoaW5nIGV4cGVjdGVkIHRlc3QgcmVzdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBmcy5leGlzdHNTeW5jKGV4cGVjdGVkVGVzdFBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIG1hdGNoaW5nIGV4cGVjdGVkIHRlc3QgcmVzdWx0IGZvdW5kIGZvciAnI3t0ZXN0TmFtZX0nIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImF0ICcje2V4cGVjdGVkVGVzdFBhdGh9Jy5cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIyBlcnIgPSBmcy53cml0ZUZpbGVTeW5jKGV4cGVjdGVkVGVzdFBhdGgsIG9yaWdpbmFsQ29udGVudHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICMgdGhyb3cgZXJyIGlmIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgIyBHZXQgY29udGVudHMgb2YgZXhwZWN0ZWQgdGVzdCBmaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZENvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKGV4cGVjdGVkVGVzdFBhdGgpPy50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGV4cGVjdChleHBlY3RlZENvbnRlbnRzKS5ub3QudG9FcXVhbCBvcmlnaW5hbENvbnRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGV4cGVjdChhdG9tLmdyYW1tYXJzLmdldEdyYW1tYXJzKCkpLnRvRXF1YWwgW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLnNlbGVjdEdyYW1tYXIob3JpZ2luYWxUZXN0UGF0aCwgb3JpZ2luYWxDb250ZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgICMgZXhwZWN0KGdyYW1tYXIpLnRvRXF1YWwoXCJ0ZXN0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBncmFtbWFyTmFtZSA9IGdyYW1tYXIubmFtZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEdldCB0aGUgb3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsT3B0aW9ucyA9IGJlYXV0aWZpZXIuZ2V0T3B0aW9uc0ZvclBhdGgob3JpZ2luYWxUZXN0UGF0aClcblxuICAgICAgICAgICAgICAgICAgICAgICAgIyBHZXQgbGFuZ3VhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlID0gYmVhdXRpZmllci5nZXRMYW5ndWFnZShncmFtbWFyTmFtZSwgdGVzdEZpbGVOYW1lKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWF1dGlmeUNvbXBsZXRlZCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0aW9uRnVuID0gKHRleHQpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdCh0ZXh0IGluc3RhbmNlb2YgRXJyb3IpLm5vdC50b0VxdWFsKHRydWUsIHRleHQubWVzc2FnZSBvciB0ZXh0LnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJlYXV0aWZ5Q29tcGxldGVkID0gdHJ1ZSBpZiB0ZXh0IGluc3RhbmNlb2YgRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIyAgIGxvZ2dlci52ZXJib3NlKGV4cGVjdGVkVGVzdFBhdGgsIHRleHQpIGlmIGV4dCBpcyBcIi5sZXNzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIyAgIGlmIHRleHQgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAjICAgICByZXR1cm4gYmVhdXRpZnlDb21wbGV0ZWQgPSB0ZXh0ICMgdGV4dCA9PSBFcnJvclxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0KHRleHQpLm5vdC50b0VxdWFsKG51bGwsIFwiTGFuZ3VhZ2Ugb3IgQmVhdXRpZmllciBub3QgZm91bmRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmVhdXRpZnlDb21wbGV0ZWQgPSB0cnVlIGlmIHRleHQgaXMgbnVsbFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0KHR5cGVvZiB0ZXh0KS50b0VxdWFsKFwic3RyaW5nXCIsIFwiVGV4dDogI3t0ZXh0fVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBiZWF1dGlmeUNvbXBsZXRlZCA9IHRydWUgaWYgdHlwZW9mIHRleHQgaXNudCBcInN0cmluZ1wiXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIFJlcGxhY2UgTmV3bGluZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oPzpcXHJcXG58XFxyfFxcbikvZywgJ+KPjlxcbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWRDb250ZW50cyA9IGV4cGVjdGVkQ29udGVudHNcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyg/OlxcclxcbnxcXHJ8XFxuKS9nLCAn4o+OXFxuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIFJlcGxhY2UgdGFic1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyg/OlxcdCkvZywgJ+KGuScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWRDb250ZW50cyA9IGV4cGVjdGVkQ29udGVudHNcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyg/OlxcdCkvZywgJ+KGuScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBSZXBsYWNlIHNwYWNlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyg/OlxcICkvZywgJ+KQoycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWRDb250ZW50cyA9IGV4cGVjdGVkQ29udGVudHNcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyg/OlxcICkvZywgJ+KQoycpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIENoZWNrIGZvciBiZWF1dGlmaWNhdGlvbiBlcnJvcnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiB0ZXh0IGlzbnQgZXhwZWN0ZWRDb250ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBjb25zb2xlLndhcm4oYWxsT3B0aW9ucywgdGV4dCwgZXhwZWN0ZWRDb250ZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gZXhwZWN0ZWRUZXN0UGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkU3RyPXRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0cj1leHBlY3RlZENvbnRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRIZWFkZXI9XCJiZWF1dGlmaWVkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0hlYWRlcj1cImV4cGVjdGVkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBKc0RpZmYuY3JlYXRlUGF0Y2goZmlsZU5hbWUsIG9sZFN0ciwgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RyLCBvbGRIZWFkZXIsIG5ld0hlYWRlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgR2V0IG9wdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMgPSBiZWF1dGlmaWVyLmdldE9wdGlvbnNGb3JMYW5ndWFnZShhbGxPcHRpb25zLCBsYW5ndWFnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQmVhdXRpZmllciA9IGJlYXV0aWZpZXIuZ2V0QmVhdXRpZmllckZvckxhbmd1YWdlKGxhbmd1YWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgc2VsZWN0ZWRCZWF1dGlmaWVyP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRzID0gYmVhdXRpZmllci50cmFuc2Zvcm1PcHRpb25zKHNlbGVjdGVkQmVhdXRpZmllciwgbGFuZ3VhZ2UubmFtZSwgb3B0cylcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBTaG93IGVycm9yIG1lc3NhZ2Ugd2l0aCBkZWJ1ZyBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0KHRleHQpLnRvRXF1YWwoZXhwZWN0ZWRDb250ZW50cywgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJCZWF1dGlmaWVyICcje3NlbGVjdGVkQmVhdXRpZmllcj8ubmFtZX0nIG91dHB1dCBkb2VzIG5vdCBtYXRjaCBleHBlY3RlZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQ6XFxuI3tkaWZmfVxcblxcblxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdpdGggb3B0aW9uczpcXG5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAje0pTT04uc3RyaW5naWZ5KG9wdHMsIHVuZGVmaW5lZCwgNCl9XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBBbGwgZG9uZSFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWF1dGlmeUNvbXBsZXRlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWF1dGlmeUNvbXBsZXRlZCA9IGVcblxuICAgICAgICAgICAgICAgICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWF1dGlmaWVyLmJlYXV0aWZ5KG9yaWdpbmFsQ29udGVudHMsIGFsbE9wdGlvbnMsIGdyYW1tYXJOYW1lLCB0ZXN0RmlsZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oY29tcGxldGlvbkZ1bilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goY29tcGxldGlvbkZ1bilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlYXV0aWZ5Q29tcGxldGVkID0gZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB3YWl0c0ZvcigtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBiZWF1dGlmeUNvbXBsZXRlZCBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgYmVhdXRpZnlDb21wbGV0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBiZWF1dGlmeUNvbXBsZXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgLCBcIldhaXRpbmcgZm9yIGJlYXV0aWZpY2F0aW9uIHRvIGNvbXBsZXRlXCIsIDYwMDAwKVxuIl19
