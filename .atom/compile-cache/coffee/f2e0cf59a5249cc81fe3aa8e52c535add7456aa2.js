(function() {
  var Beautifiers, JsDiff, beautifier, fs, isWindows, path, shellEnv, unsupportedLangs;

  Beautifiers = require("../src/beautifiers");

  beautifier = new Beautifiers();

  fs = require("fs");

  path = require("path");

  JsDiff = require('diff');

  shellEnv = require('shell-env');

  process.env = shellEnv.sync();

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcGVjL2JlYXV0aWZ5LWxhbmd1YWdlcy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxvQkFBUjs7RUFDZCxVQUFBLEdBQWlCLElBQUEsV0FBQSxDQUFBOztFQUNqQixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE1BQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7RUFDVCxRQUFBLEdBQVcsT0FBQSxDQUFRLFdBQVI7O0VBR1gsT0FBTyxDQUFDLEdBQVIsR0FBYyxRQUFRLENBQUMsSUFBVCxDQUFBOztFQVFkLFNBQUEsR0FBWSxPQUFPLENBQUMsUUFBUixLQUFvQixPQUFwQixJQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBWixLQUFzQixRQURaLElBRVYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFaLEtBQXNCOztFQUV4QixnQkFBQSxHQUFtQjtJQUNqQixHQUFBLEVBQUssRUFEWTtJQUdqQixPQUFBLEVBQVMsQ0FDUCxPQURPLEVBRVAsR0FGTyxFQUdQLFNBSE8sRUFLUCxNQUxPLEVBTVAsTUFOTyxFQU9QLFFBUE8sRUFRUCxHQVJPLEVBU1AsS0FUTyxFQVVQLE1BVk8sRUFXUCxZQVhPLEVBWVAsUUFaTyxDQUhROzs7RUFtQm5CLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBO0FBRTVCLFFBQUE7SUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLGFBQXhCO0lBR2IsWUFBQSxHQUFlLENBQ2IsR0FEYSxFQUNSLFNBRFEsRUFDRyxlQURILEVBQ29CLEtBRHBCLEVBQzJCLEdBRDNCLEVBQ2dDLE1BRGhDLEVBRWIsTUFGYSxFQUVMLFlBRkssRUFF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R0FBb0IsRUFwRHRCOzswQkFEYzswQkF1RGhCLElBQUEsQ0FBSyxTQUFBO0FBQ0gsZ0NBQUE7QUFBQTtxQ0FDRSxVQUFVLENBQUMsUUFBWCxDQUFvQixnQkFBcEIsRUFBc0MsVUFBdEMsRUFBa0QsV0FBbEQsRUFBK0QsWUFBL0QsQ0FDQSxDQUFDLElBREQsQ0FDTSxhQUROLENBRUEsRUFBQyxLQUFELEVBRkEsQ0FFTyxhQUZQLEVBREY7NkJBQUEsYUFBQTs4QkFJTTtxQ0FDSixpQkFBQSxHQUFvQixFQUx0Qjs7MEJBREcsQ0FBTDtpQ0FRQSxRQUFBLENBQVMsU0FBQTs0QkFDUCxJQUFHLGlCQUFBLFlBQTZCLEtBQWhDO0FBQ0Usb0NBQU0sa0JBRFI7NkJBQUEsTUFBQTtBQUdFLHFDQUFPLGtCQUhUOzswQkFETyxDQUFULEVBS0Usd0NBTEYsRUFLNEMsS0FMNUM7d0JBM0ZrRSxDQUFwRTtzQkFUQyxDQUFBLENBQUgsQ0FBSSxZQUFKO0FBREY7O2tCQUptRixDQUFyRixFQWZGOztjQUxDLENBQUEsQ0FBSCxDQUFJLElBQUo7QUFURjs7VUFIK0MsQ0FBakQsRUFGRjs7TUFMQyxDQUFBLENBQUgsQ0FBSSxNQUFKO0FBREY7O0VBbEU0QixDQUE5QjtBQXZDQSIsInNvdXJjZXNDb250ZW50IjpbIiMgQmVhdXRpZnkgPSByZXF1aXJlICcuLi9zcmMvYmVhdXRpZnknXG5CZWF1dGlmaWVycyA9IHJlcXVpcmUgXCIuLi9zcmMvYmVhdXRpZmllcnNcIlxuYmVhdXRpZmllciA9IG5ldyBCZWF1dGlmaWVycygpXG5mcyA9IHJlcXVpcmUgXCJmc1wiXG5wYXRoID0gcmVxdWlyZSBcInBhdGhcIlxuSnNEaWZmID0gcmVxdWlyZSgnZGlmZicpXG5zaGVsbEVudiA9IHJlcXVpcmUoJ3NoZWxsLWVudicpXG5cbiMgRml4IGh0dHBzOi8vZGlzY3Vzcy5hdG9tLmlvL3Qvc3BlY3MtZG8tbm90LWxvYWQtc2hlbGwtZW52aXJvbm1lbnQtdmFyaWFibGVzLWFjdGl2YXRpb25ob29rcy1jb3JlLWxvYWRlZC1zaGVsbC1lbnZpcm9ubWVudC80NDE5OVxucHJvY2Vzcy5lbnYgPSBzaGVsbEVudi5zeW5jKClcblxuIyBVc2UgdGhlIGNvbW1hbmQgYHdpbmRvdzpydW4tcGFja2FnZS1zcGVjc2AgKGNtZC1hbHQtY3RybC1wKSB0byBydW4gc3BlY3MuXG4jXG4jIFRvIHJ1biBhIHNwZWNpZmljIGBpdGAgb3IgYGRlc2NyaWJlYCBibG9jayBhZGQgYW4gYGZgIHRvIHRoZSBmcm9udCAoZS5nLiBgZml0YFxuIyBvciBgZmRlc2NyaWJlYCkuIFJlbW92ZSB0aGUgYGZgIHRvIHVuZm9jdXMgdGhlIGJsb2NrLlxuXG4jIENoZWNrIGlmIFdpbmRvd3NcbmlzV2luZG93cyA9IHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJyBvclxuICBwcm9jZXNzLmVudi5PU1RZUEUgaXMgJ2N5Z3dpbicgb3JcbiAgcHJvY2Vzcy5lbnYuT1NUWVBFIGlzICdtc3lzJ1xuXG51bnN1cHBvcnRlZExhbmdzID0ge1xuICBhbGw6IFtcbiAgXVxuICB3aW5kb3dzOiBbXG4gICAgXCJvY2FtbFwiXG4gICAgXCJyXCJcbiAgICBcImNsb2p1cmVcIlxuICAgICMgQnJva2VuXG4gICAgXCJhcGV4XCJcbiAgICBcImJhc2hcIlxuICAgIFwiY3NoYXJwXCJcbiAgICBcImRcIlxuICAgIFwiZWxtXCJcbiAgICBcImphdmFcIlxuICAgIFwib2JqZWN0aXZlY1wiXG4gICAgXCJvcGVuY2xcIlxuICBdXG59XG5cbmRlc2NyaWJlIFwiQmVhdXRpZnlMYW5ndWFnZXNcIiwgLT5cblxuICBvcHRpb25zRGlyID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9leGFtcGxlc1wiKVxuXG4gICMgQWN0aXZhdGUgYWxsIG9mIHRoZSBsYW5ndWFnZXNcbiAgYWxsTGFuZ3VhZ2VzID0gW1xuICAgIFwiY1wiLCBcImNsb2p1cmVcIiwgXCJjb2ZmZWUtc2NyaXB0XCIsIFwiY3NzXCIsIFwiZFwiLCBcImh0bWxcIixcbiAgICBcImphdmFcIiwgXCJqYXZhc2NyaXB0XCIsIFwianNvblwiLCBcImxlc3NcIixcbiAgICBcIm11c3RhY2hlXCIsIFwib2JqZWN0aXZlLWNcIiwgXCJwZXJsXCIsIFwicGhwXCIsXG4gICAgXCJweXRob25cIiwgXCJydWJ5XCIsIFwic2Fzc1wiLCBcInNxbFwiLCBcInN2Z1wiLFxuICAgIFwieG1sXCIsIFwiY3NoYXJwXCIsIFwiZ2ZtXCIsIFwibWFya29cIixcbiAgICBcImdvXCIsIFwiaHRtbC1zd2lnXCIsIFwibHVhXCJcbiAgICBdXG4gICMgQWxsIEF0b20gcGFja2FnZXMgdGhhdCBBdG9tIEJlYXV0aWZ5IGlzIGRlcGVuZGVudCBvblxuICBkZXBlbmRlbnRQYWNrYWdlcyA9IFtcbiAgICAnYXV0b2NvbXBsZXRlLXBsdXMnXG4gICAgIyAnbGludGVyJ1xuICAgICMgICAnYXRvbS10eXBlc2NyaXB0JyAjIGl0IGxvZ3MgdG9vIG11Y2guLi5cbiAgXVxuICAjIEFkZCBsYW5ndWFnZSBwYWNrYWdlcyB0byBkZXBlbmRlbnRQYWNrYWdlc1xuICBmb3IgbGFuZyBpbiBhbGxMYW5ndWFnZXNcbiAgICBkbyAobGFuZykgLT5cbiAgICAgIGRlcGVuZGVudFBhY2thZ2VzLnB1c2goXCJsYW5ndWFnZS0je2xhbmd9XCIpXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgICMgSW5zdGFsbCBhbGwgb2YgdGhlIGxhbmd1YWdlc1xuICAgIGZvciBwYWNrYWdlTmFtZSBpbiBkZXBlbmRlbnRQYWNrYWdlc1xuICAgICAgZG8gKHBhY2thZ2VOYW1lKSAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrYWdlTmFtZSlcblxuICAgICMgQWN0aXZhdGUgcGFja2FnZVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYWN0aXZhdGlvblByb21pc2UgPSBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYXRvbS1iZWF1dGlmeScpXG4gICAgICAjIEZvcmNlIGFjdGl2YXRlIHBhY2thZ2VcbiAgICAgIHBhY2sgPSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoXCJhdG9tLWJlYXV0aWZ5XCIpXG4gICAgICBwYWNrLmFjdGl2YXRlTm93KClcbiAgICAgICMgTmVlZCBtb3JlIGRlYnVnZ2luZyBvbiBXaW5kb3dzXG4gICAgICAjIENoYW5nZSBsb2dnZXIgbGV2ZWxcbiAgICAgIGF0b20uY29uZmlnLnNldCgnYXRvbS1iZWF1dGlmeS5nZW5lcmFsLmxvZ2dlckxldmVsJywgJ2luZm8nKVxuICAgICAgIyBSZXR1cm4gcHJvbWlzZVxuICAgICAgcmV0dXJuIGFjdGl2YXRpb25Qcm9taXNlXG5cbiAgICAjIFNldCBVbmNydXN0aWZ5IGNvbmZpZyBwYXRoXG4gICAgIyB1bmNydXN0aWZ5Q29uZmlnUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vZXhhbXBsZXMvbmVzdGVkLWpzYmVhdXRpZnlyYy91bmNydXN0aWZ5LmNmZ1wiKVxuICAgICMgdW5jcnVzdGlmeUxhbmdzID0gW1wiYXBleFwiLCBcImNcIiwgXCJjcHBcIiwgXCJvYmplY3RpdmVjXCIsIFwiY3NcIiwgXCJkXCIsIFwiamF2YVwiLCBcInBhd25cIiwgXCJ2YWxhXCJdXG4gICAgIyBmb3IgbGFuZyBpbiB1bmNydXN0aWZ5TGFuZ3NcbiAgICAjICAgICBkbyAobGFuZykgLT5cbiAgICAgICMgYXRvbS5jb25maWcuc2V0KFwiYXRvbS1iZWF1dGlmeS4je2xhbmd9X2NvbmZpZ1BhdGhcIiwgdW5jcnVzdGlmeUNvbmZpZ1BhdGgpXG4gICAgICAjIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoXCJhdG9tLWJlYXV0aWZ5LiN7bGFuZ31fY29uZmlnUGF0aFwiKSkudG9FcXVhbChcIlRFU1RcIilcblxuICAjIyNcbiAgRGlyZWN0b3J5IHN0cnVjdHVyZTpcbiAgIC0gZXhhbXBsZXNcbiAgICAgLSBjb25maWcxXG4gICAgICAgLSBsYW5nMVxuICAgICAgICAgLSBvcmlnaW5hbFxuICAgICAgICAgICAtIDEgLSB0ZXN0LmV4dFxuICAgICAgICAgLSBleHBlY3RlZFxuICAgICAgICAgICAtIDEgLSB0ZXN0LmV4dFxuICAgICAgIC0gbGFuZzJcbiAgICAgLSBjb25maWcyXG4gICMjI1xuXG4gICMgQWxsIENvbmZpZ3VyYXRpb25zXG4gIGNvbmZpZ3MgPSBmcy5yZWFkZGlyU3luYyhvcHRpb25zRGlyKVxuICBmb3IgY29uZmlnIGluIGNvbmZpZ3NcbiAgICBkbyAoY29uZmlnKSAtPlxuICAgICAgIyBHZW5lcmF0ZSB0aGUgcGF0aCB0byB3aGVyZSBhbGwgb2YgdGhlIGxhbmd1YWdlcyBhcmVcbiAgICAgIGxhbmdzRGlyID0gcGF0aC5yZXNvbHZlKG9wdGlvbnNEaXIsIGNvbmZpZylcbiAgICAgIG9wdGlvblN0YXRzID0gZnMubHN0YXRTeW5jKGxhbmdzRGlyKVxuICAgICAgIyBDb25maXJtIHRoYXQgdGhpcyBwYXRoIGlzIGEgZGlyZWN0b3J5XG4gICAgICBpZiBvcHRpb25TdGF0cy5pc0RpcmVjdG9yeSgpXG4gICAgICAgICMgQ3JlYXRlIHRlc3RpbmcgZ3JvdXAgZm9yIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgZGVzY3JpYmUgXCJ3aGVuIHVzaW5nIGNvbmZpZ3VyYXRpb24gJyN7Y29uZmlnfSdcIiwgLT5cbiAgICAgICAgICAjIEFsbCBMYW5ndWFnZXMgZm9yIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgICBsYW5nTmFtZXMgPSBmcy5yZWFkZGlyU3luYyhsYW5nc0RpcilcbiAgICAgICAgICBmb3IgbGFuZyBpbiBsYW5nTmFtZXNcblxuICAgICAgICAgICAgc2hvdWxkU2tpcExhbmcgPSBmYWxzZVxuICAgICAgICAgICAgaWYgdW5zdXBwb3J0ZWRMYW5ncy5hbGwuaW5kZXhPZihsYW5nKSBpc250IC0xXG4gICAgICAgICAgICAgIHNob3VsZFNraXBMYW5nID0gdHJ1ZVxuICAgICAgICAgICAgaWYgaXNXaW5kb3dzIGFuZCB1bnN1cHBvcnRlZExhbmdzLndpbmRvd3MuaW5kZXhPZihsYW5nKSBpc250IC0xXG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlRlc3RzIGZvciBXaW5kb3dzIGRvIG5vdCBzdXBwb3J0ICN7bGFuZ31cIilcbiAgICAgICAgICAgICAgc2hvdWxkU2tpcExhbmcgPSB0cnVlXG5cbiAgICAgICAgICAgIGRvIChsYW5nKSAtPlxuICAgICAgICAgICAgICAjIEdlbmVyYXRlIHRoZSBwYXRoIHRvIHdoZXJlIGFsIG9mIHRoZSB0ZXN0cyBhcmVcbiAgICAgICAgICAgICAgdGVzdHNEaXIgPSBwYXRoLnJlc29sdmUobGFuZ3NEaXIsIGxhbmcpXG4gICAgICAgICAgICAgIGxhbmdTdGF0cyA9IGZzLmxzdGF0U3luYyh0ZXN0c0RpcilcbiAgICAgICAgICAgICAgIyBDb25maXJtIHRoYXQgdGhpcyBwYXRoIGlzIGEgZGlyZWN0b3J5XG4gICAgICAgICAgICAgIGlmIGxhbmdTdGF0cy5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICAgICAgIyBPcmlnaW5hbFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsRGlyID0gcGF0aC5yZXNvbHZlKHRlc3RzRGlyLCBcIm9yaWdpbmFsXCIpXG4gICAgICAgICAgICAgICAgaWYgbm90IGZzLmV4aXN0c1N5bmMob3JpZ2luYWxEaXIpXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJEaXJlY3RvcnkgZm9yIHRlc3Qgb3JpZ2luYWxzL2lucHV0cyBub3QgZm91bmQuXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIiBNYWtpbmcgaXQgYXQgI3tvcmlnaW5hbERpcn0uXCIpXG4gICAgICAgICAgICAgICAgICBmcy5ta2RpclN5bmMob3JpZ2luYWxEaXIpXG4gICAgICAgICAgICAgICAgIyBFeHBlY3RlZFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkRGlyID0gcGF0aC5yZXNvbHZlKHRlc3RzRGlyLCBcImV4cGVjdGVkXCIpXG4gICAgICAgICAgICAgICAgaWYgbm90IGZzLmV4aXN0c1N5bmMoZXhwZWN0ZWREaXIpXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJEaXJlY3RvcnkgZm9yIHRlc3QgZXhwZWN0ZWQvcmVzdWx0cyBub3QgZm91bmQuXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIk1ha2luZyBpdCBhdCAje2V4cGVjdGVkRGlyfS5cIilcbiAgICAgICAgICAgICAgICAgIGZzLm1rZGlyU3luYyhleHBlY3RlZERpcilcblxuICAgICAgICAgICAgICAgICMgTGFuZ3VhZ2UgZ3JvdXAgdGVzdHNcbiAgICAgICAgICAgICAgICBkZXNjcmliZSBcIiN7aWYgc2hvdWxkU2tpcExhbmcgdGhlbiAnIycgZWxzZSAnJ313aGVuIGJlYXV0aWZ5aW5nIGxhbmd1YWdlICcje2xhbmd9J1wiLCAtPlxuXG4gICAgICAgICAgICAgICAgICAjIEFsbCB0ZXN0cyBmb3IgbGFuZ3VhZ2VcbiAgICAgICAgICAgICAgICAgIHRlc3ROYW1lcyA9IGZzLnJlYWRkaXJTeW5jKG9yaWdpbmFsRGlyKVxuICAgICAgICAgICAgICAgICAgZm9yIHRlc3RGaWxlTmFtZSBpbiB0ZXN0TmFtZXNcbiAgICAgICAgICAgICAgICAgICAgZG8gKHRlc3RGaWxlTmFtZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICBleHQgPSBwYXRoLmV4dG5hbWUodGVzdEZpbGVOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgIHRlc3ROYW1lID0gcGF0aC5iYXNlbmFtZSh0ZXN0RmlsZU5hbWUsIGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAjIElmIHByZWZpeGVkIHdpdGggdW5kZXJzY29yZSAoXykgdGhlbiB0aGlzIGlzIGEgaGlkZGVuIHRlc3RcbiAgICAgICAgICAgICAgICAgICAgICBzaG91bGRTa2lwID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICBpZiB0ZXN0RmlsZU5hbWVbMF0gaXMgJ18nXG4gICAgICAgICAgICAgICAgICAgICAgICAjIERvIG5vdCBzaG93IHRoaXMgdGVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkU2tpcCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAjIENvbmZpcm0gdGhpcyBpcyBhIHRlc3RcbiAgICAgICAgICAgICAgICAgICAgICBpdCBcIiN7aWYgc2hvdWxkU2tpcCB0aGVuICcjICcgZWxzZSAnJ30je3Rlc3ROYW1lfSAje3Rlc3RGaWxlTmFtZX1cIiwgLT5cblxuICAgICAgICAgICAgICAgICAgICAgICAgIyBHZW5lcmF0ZSBwYXRocyB0byB0ZXN0IGZpbGVzXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFRlc3RQYXRoID0gcGF0aC5yZXNvbHZlKG9yaWdpbmFsRGlyLCB0ZXN0RmlsZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZFRlc3RQYXRoID0gcGF0aC5yZXNvbHZlKGV4cGVjdGVkRGlyLCB0ZXN0RmlsZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEdldCBjb250ZW50cyBvZiBvcmlnaW5hbCB0ZXN0IGZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsQ29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMob3JpZ2luYWxUZXN0UGF0aCk/LnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICMgQ2hlY2sgaWYgdGhlcmUgaXMgYSBtYXRjaGluZyBleHBlY3RlZCB0ZXN0IHJlc3V0XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgZnMuZXhpc3RzU3luYyhleHBlY3RlZFRlc3RQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBtYXRjaGluZyBleHBlY3RlZCB0ZXN0IHJlc3VsdCBmb3VuZCBmb3IgJyN7dGVzdE5hbWV9JyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhdCAnI3tleHBlY3RlZFRlc3RQYXRofScuXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICMgZXJyID0gZnMud3JpdGVGaWxlU3luYyhleHBlY3RlZFRlc3RQYXRoLCBvcmlnaW5hbENvbnRlbnRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAjIHRocm93IGVyciBpZiBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgICMgR2V0IGNvbnRlbnRzIG9mIGV4cGVjdGVkIHRlc3QgZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWRDb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyhleHBlY3RlZFRlc3RQYXRoKT8udG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBleHBlY3QoZXhwZWN0ZWRDb250ZW50cykubm90LnRvRXF1YWwgb3JpZ2luYWxDb250ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBleHBlY3QoYXRvbS5ncmFtbWFycy5nZXRHcmFtbWFycygpKS50b0VxdWFsIFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5zZWxlY3RHcmFtbWFyKG9yaWdpbmFsVGVzdFBhdGgsIG9yaWdpbmFsQ29udGVudHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGV4cGVjdChncmFtbWFyKS50b0VxdWFsKFwidGVzdFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JhbW1hck5hbWUgPSBncmFtbWFyLm5hbWVcblxuICAgICAgICAgICAgICAgICAgICAgICAgIyBHZXQgdGhlIG9wdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE9wdGlvbnMgPSBiZWF1dGlmaWVyLmdldE9wdGlvbnNGb3JQYXRoKG9yaWdpbmFsVGVzdFBhdGgpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgR2V0IGxhbmd1YWdlXG4gICAgICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZSA9IGJlYXV0aWZpZXIuZ2V0TGFuZ3VhZ2UoZ3JhbW1hck5hbWUsIHRlc3RGaWxlTmFtZSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgYmVhdXRpZnlDb21wbGV0ZWQgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGlvbkZ1biA9ICh0ZXh0KSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3QodGV4dCBpbnN0YW5jZW9mIEVycm9yKS5ub3QudG9FcXVhbCh0cnVlLCB0ZXh0Lm1lc3NhZ2Ugb3IgdGV4dC50b1N0cmluZygpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBiZWF1dGlmeUNvbXBsZXRlZCA9IHRydWUgaWYgdGV4dCBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICMgICBsb2dnZXIudmVyYm9zZShleHBlY3RlZFRlc3RQYXRoLCB0ZXh0KSBpZiBleHQgaXMgXCIubGVzc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICMgICBpZiB0ZXh0IGluc3RhbmNlb2YgRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIyAgICAgcmV0dXJuIGJlYXV0aWZ5Q29tcGxldGVkID0gdGV4dCAjIHRleHQgPT0gRXJyb3JcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdCh0ZXh0KS5ub3QudG9FcXVhbChudWxsLCBcIkxhbmd1YWdlIG9yIEJlYXV0aWZpZXIgbm90IGZvdW5kXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJlYXV0aWZ5Q29tcGxldGVkID0gdHJ1ZSBpZiB0ZXh0IGlzIG51bGxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdCh0eXBlb2YgdGV4dCkudG9FcXVhbChcInN0cmluZ1wiLCBcIlRleHQ6ICN7dGV4dH1cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmVhdXRpZnlDb21wbGV0ZWQgPSB0cnVlIGlmIHR5cGVvZiB0ZXh0IGlzbnQgXCJzdHJpbmdcIlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBSZXBsYWNlIE5ld2xpbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvKD86XFxyXFxufFxccnxcXG4pL2csICfij45cXG4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkQ29udGVudHMgPSBleHBlY3RlZENvbnRlbnRzXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oPzpcXHJcXG58XFxyfFxcbikvZywgJ+KPjlxcbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBSZXBsYWNlIHRhYnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oPzpcXHQpL2csICfihrknKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkQ29udGVudHMgPSBleHBlY3RlZENvbnRlbnRzXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oPzpcXHQpL2csICfihrknKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgUmVwbGFjZSBzcGFjZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oPzpcXCApL2csICfikKMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkQ29udGVudHMgPSBleHBlY3RlZENvbnRlbnRzXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oPzpcXCApL2csICfikKMnKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBDaGVjayBmb3IgYmVhdXRpZmljYXRpb24gZXJyb3JzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdGV4dCBpc250IGV4cGVjdGVkQ29udGVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgY29uc29sZS53YXJuKGFsbE9wdGlvbnMsIHRleHQsIGV4cGVjdGVkQ29udGVudHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IGV4cGVjdGVkVGVzdFBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZFN0cj10ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTdHI9ZXhwZWN0ZWRDb250ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkSGVhZGVyPVwiYmVhdXRpZmllZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdIZWFkZXI9XCJleHBlY3RlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gSnNEaWZmLmNyZWF0ZVBhdGNoKGZpbGVOYW1lLCBvbGRTdHIsIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0ciwgb2xkSGVhZGVyLCBuZXdIZWFkZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIEdldCBvcHRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRzID0gYmVhdXRpZmllci5nZXRPcHRpb25zRm9yTGFuZ3VhZ2UoYWxsT3B0aW9ucywgbGFuZ3VhZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEJlYXV0aWZpZXIgPSBiZWF1dGlmaWVyLmdldEJlYXV0aWZpZXJGb3JMYW5ndWFnZShsYW5ndWFnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHNlbGVjdGVkQmVhdXRpZmllcj9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0cyA9IGJlYXV0aWZpZXIudHJhbnNmb3JtT3B0aW9ucyhzZWxlY3RlZEJlYXV0aWZpZXIsIGxhbmd1YWdlLm5hbWUsIG9wdHMpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgU2hvdyBlcnJvciBtZXNzYWdlIHdpdGggZGVidWcgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdCh0ZXh0KS50b0VxdWFsKGV4cGVjdGVkQ29udGVudHMsIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQmVhdXRpZmllciAnI3tzZWxlY3RlZEJlYXV0aWZpZXI/Lm5hbWV9JyBvdXRwdXQgZG9lcyBub3QgbWF0Y2ggZXhwZWN0ZWQgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OlxcbiN7ZGlmZn1cXG5cXG5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXaXRoIG9wdGlvbnM6XFxuXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI3tKU09OLnN0cmluZ2lmeShvcHRzLCB1bmRlZmluZWQsIDQpfVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgQWxsIGRvbmUhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVhdXRpZnlDb21wbGV0ZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVhdXRpZnlDb21wbGV0ZWQgPSBlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVhdXRpZmllci5iZWF1dGlmeShvcmlnaW5hbENvbnRlbnRzLCBhbGxPcHRpb25zLCBncmFtbWFyTmFtZSwgdGVzdEZpbGVOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGNvbXBsZXRpb25GdW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGNvbXBsZXRpb25GdW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWF1dGlmeUNvbXBsZXRlZCA9IGVcblxuICAgICAgICAgICAgICAgICAgICAgICAgd2FpdHNGb3IoLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgYmVhdXRpZnlDb21wbGV0ZWQgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGJlYXV0aWZ5Q29tcGxldGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmVhdXRpZnlDb21wbGV0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICwgXCJXYWl0aW5nIGZvciBiZWF1dGlmaWNhdGlvbiB0byBjb21wbGV0ZVwiLCA2MDAwMClcbiJdfQ==
