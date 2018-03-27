(function() {
  var Beautifiers, JsDiff, beautifier, fs, isWindows, path;

  Beautifiers = require("../src/beautifiers");

  beautifier = new Beautifiers();

  fs = require("fs");

  path = require("path");

  JsDiff = require('diff');

  isWindows = process.platform === 'win32' || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';

  describe("BeautifyLanguages", function() {
    var allLanguages, config, configs, dependentPackages, lang, optionsDir, _fn, _i, _j, _len, _len1, _results;
    optionsDir = path.resolve(__dirname, "../examples");
    allLanguages = ["c", "coffee-script", "css", "d", "html", "java", "javascript", "json", "less", "mustache", "objective-c", "perl", "php", "python", "ruby", "sass", "sql", "svg", "xml", "csharp", "gfm", "marko", "go", "html-swig"];
    dependentPackages = ['autocomplete-plus'];
    _fn = function(lang) {
      return dependentPackages.push("language-" + lang);
    };
    for (_i = 0, _len = allLanguages.length; _i < _len; _i++) {
      lang = allLanguages[_i];
      _fn(lang);
    }
    beforeEach(function() {
      var packageName, _fn1, _j, _len1;
      _fn1 = function(packageName) {
        return waitsForPromise(function() {
          return atom.packages.activatePackage(packageName);
        });
      };
      for (_j = 0, _len1 = dependentPackages.length; _j < _len1; _j++) {
        packageName = dependentPackages[_j];
        _fn1(packageName);
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
    _results = [];
    for (_j = 0, _len1 = configs.length; _j < _len1; _j++) {
      config = configs[_j];
      _results.push((function(config) {
        var langsDir, optionStats;
        langsDir = path.resolve(optionsDir, config);
        optionStats = fs.lstatSync(langsDir);
        if (optionStats.isDirectory()) {
          return describe("when using configuration '" + config + "'", function() {
            var langNames, _k, _len2, _results1;
            langNames = fs.readdirSync(langsDir);
            _results1 = [];
            for (_k = 0, _len2 = langNames.length; _k < _len2; _k++) {
              lang = langNames[_k];
              _results1.push((function(lang) {
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
                    var testFileName, testNames, _l, _len3, _results2;
                    testNames = fs.readdirSync(originalDir);
                    _results2 = [];
                    for (_l = 0, _len3 = testNames.length; _l < _len3; _l++) {
                      testFileName = testNames[_l];
                      _results2.push((function(testFileName) {
                        var ext, testName;
                        ext = path.extname(testFileName);
                        testName = path.basename(testFileName, ext);
                        if (testFileName[0] === '_') {
                          return;
                        }
                        return it("" + testName + " " + testFileName, function() {
                          var allOptions, beautifyCompleted, completionFun, expectedContents, expectedTestPath, grammar, grammarName, language, originalContents, originalTestPath, _ref, _ref1;
                          originalTestPath = path.resolve(originalDir, testFileName);
                          expectedTestPath = path.resolve(expectedDir, testFileName);
                          originalContents = (_ref = fs.readFileSync(originalTestPath)) != null ? _ref.toString() : void 0;
                          if (!fs.existsSync(expectedTestPath)) {
                            throw new Error(("No matching expected test result found for '" + testName + "' ") + ("at '" + expectedTestPath + "'."));
                          }
                          expectedContents = (_ref1 = fs.readFileSync(expectedTestPath)) != null ? _ref1.toString() : void 0;
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
                            } catch (_error) {
                              e = _error;
                              console.error(e);
                              return beautifyCompleted = e;
                            }
                          };
                          runs(function() {
                            var e;
                            try {
                              return beautifier.beautify(originalContents, allOptions, grammarName, testFileName).then(completionFun)["catch"](completionFun);
                            } catch (_error) {
                              e = _error;
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
                    return _results2;
                  });
                }
              })(lang));
            }
            return _results1;
          });
        }
      })(config));
    }
    return _results;
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcGVjL2JlYXV0aWZ5LWxhbmd1YWdlcy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSxvREFBQTs7QUFBQSxFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsb0JBQVIsQ0FBZCxDQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFpQixJQUFBLFdBQUEsQ0FBQSxDQURqQixDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUhQLENBQUE7O0FBQUEsRUFJQSxNQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVIsQ0FKVCxDQUFBOztBQUFBLEVBWUEsU0FBQSxHQUFZLE9BQU8sQ0FBQyxRQUFSLEtBQW9CLE9BQXBCLElBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFaLEtBQXNCLFFBRFosSUFFVixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQVosS0FBc0IsTUFkeEIsQ0FBQTs7QUFBQSxFQWdCQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQSxHQUFBO0FBRTVCLFFBQUEsc0dBQUE7QUFBQSxJQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsYUFBeEIsQ0FBYixDQUFBO0FBQUEsSUFHQSxZQUFBLEdBQWUsQ0FDYixHQURhLEVBQ1IsZUFEUSxFQUNTLEtBRFQsRUFDZ0IsR0FEaEIsRUFDcUIsTUFEckIsRUFFYixNQUZhLEVBRUwsWUFGSyxFQUVTLE1BRlQsRUFFaUIsTUFGakIsRUFHYixVQUhhLEVBR0QsYUFIQyxFQUdjLE1BSGQsRUFHc0IsS0FIdEIsRUFJYixRQUphLEVBSUgsTUFKRyxFQUlLLE1BSkwsRUFJYSxLQUpiLEVBSW9CLEtBSnBCLEVBS2IsS0FMYSxFQUtOLFFBTE0sRUFLSSxLQUxKLEVBS1csT0FMWCxFQU1iLElBTmEsRUFNUCxXQU5PLENBSGYsQ0FBQTtBQUFBLElBWUEsaUJBQUEsR0FBb0IsQ0FDbEIsbUJBRGtCLENBWnBCLENBQUE7QUFrQkEsVUFDSyxTQUFDLElBQUQsR0FBQTthQUNELGlCQUFpQixDQUFDLElBQWxCLENBQXdCLFdBQUEsR0FBVyxJQUFuQyxFQURDO0lBQUEsQ0FETDtBQUFBLFNBQUEsbURBQUE7OEJBQUE7QUFDRSxVQUFJLEtBQUosQ0FERjtBQUFBLEtBbEJBO0FBQUEsSUFzQkEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUVULFVBQUEsNEJBQUE7QUFBQSxhQUNLLFNBQUMsV0FBRCxHQUFBO2VBQ0QsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFdBQTlCLEVBRGM7UUFBQSxDQUFoQixFQURDO01BQUEsQ0FETDtBQUFBLFdBQUEsMERBQUE7NENBQUE7QUFDRSxhQUFJLFlBQUosQ0FERjtBQUFBLE9BQUE7YUFNQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtBQUNkLFlBQUEsdUJBQUE7QUFBQSxRQUFBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixlQUE5QixDQUFwQixDQUFBO0FBQUEsUUFFQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixlQUEvQixDQUZQLENBQUE7QUFBQSxRQUdBLElBQUksQ0FBQyxXQUFMLENBQUEsQ0FIQSxDQUFBO0FBS0EsUUFBQSxJQUFHLFNBQUg7QUFFRSxVQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEIsRUFBOEMsU0FBOUMsQ0FBQSxDQUZGO1NBTEE7QUFTQSxlQUFPLGlCQUFQLENBVmM7TUFBQSxDQUFoQixFQVJTO0lBQUEsQ0FBWCxDQXRCQSxDQUFBO0FBa0RBO0FBQUE7Ozs7Ozs7Ozs7O09BbERBO0FBQUEsSUFnRUEsT0FBQSxHQUFVLEVBQUUsQ0FBQyxXQUFILENBQWUsVUFBZixDQWhFVixDQUFBO0FBaUVBO1NBQUEsZ0RBQUE7MkJBQUE7QUFDRSxvQkFBRyxDQUFBLFNBQUMsTUFBRCxHQUFBO0FBRUQsWUFBQSxxQkFBQTtBQUFBLFFBQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxPQUFMLENBQWEsVUFBYixFQUF5QixNQUF6QixDQUFYLENBQUE7QUFBQSxRQUNBLFdBQUEsR0FBYyxFQUFFLENBQUMsU0FBSCxDQUFhLFFBQWIsQ0FEZCxDQUFBO0FBR0EsUUFBQSxJQUFHLFdBQVcsQ0FBQyxXQUFaLENBQUEsQ0FBSDtpQkFFRSxRQUFBLENBQVUsNEJBQUEsR0FBNEIsTUFBNUIsR0FBbUMsR0FBN0MsRUFBaUQsU0FBQSxHQUFBO0FBRS9DLGdCQUFBLCtCQUFBO0FBQUEsWUFBQSxTQUFBLEdBQVksRUFBRSxDQUFDLFdBQUgsQ0FBZSxRQUFmLENBQVosQ0FBQTtBQUNBO2lCQUFBLGtEQUFBO21DQUFBO0FBQ0UsNkJBQUcsQ0FBQSxTQUFDLElBQUQsR0FBQTtBQUVELG9CQUFBLDZDQUFBO0FBQUEsZ0JBQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixFQUF1QixJQUF2QixDQUFYLENBQUE7QUFBQSxnQkFDQSxTQUFBLEdBQVksRUFBRSxDQUFDLFNBQUgsQ0FBYSxRQUFiLENBRFosQ0FBQTtBQUdBLGdCQUFBLElBQUcsU0FBUyxDQUFDLFdBQVYsQ0FBQSxDQUFIO0FBRUUsa0JBQUEsV0FBQSxHQUFjLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixFQUF1QixVQUF2QixDQUFkLENBQUE7QUFDQSxrQkFBQSxJQUFHLENBQUEsRUFBTSxDQUFDLFVBQUgsQ0FBYyxXQUFkLENBQVA7QUFDRSxvQkFBQSxPQUFPLENBQUMsSUFBUixDQUFhLGdEQUFBLEdBQ1gsQ0FBQyxnQkFBQSxHQUFnQixXQUFoQixHQUE0QixHQUE3QixDQURGLENBQUEsQ0FBQTtBQUFBLG9CQUVBLEVBQUUsQ0FBQyxTQUFILENBQWEsV0FBYixDQUZBLENBREY7bUJBREE7QUFBQSxrQkFNQSxXQUFBLEdBQWMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLEVBQXVCLFVBQXZCLENBTmQsQ0FBQTtBQU9BLGtCQUFBLElBQUcsQ0FBQSxFQUFNLENBQUMsVUFBSCxDQUFjLFdBQWQsQ0FBUDtBQUNFLG9CQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsZ0RBQUEsR0FDWCxDQUFDLGVBQUEsR0FBZSxXQUFmLEdBQTJCLEdBQTVCLENBREYsQ0FBQSxDQUFBO0FBQUEsb0JBRUEsRUFBRSxDQUFDLFNBQUgsQ0FBYSxXQUFiLENBRkEsQ0FERjttQkFQQTt5QkFhQSxRQUFBLENBQVUsNkJBQUEsR0FBNkIsSUFBN0IsR0FBa0MsR0FBNUMsRUFBZ0QsU0FBQSxHQUFBO0FBRzlDLHdCQUFBLDZDQUFBO0FBQUEsb0JBQUEsU0FBQSxHQUFZLEVBQUUsQ0FBQyxXQUFILENBQWUsV0FBZixDQUFaLENBQUE7QUFDQTt5QkFBQSxrREFBQTttREFBQTtBQUNFLHFDQUFHLENBQUEsU0FBQyxZQUFELEdBQUE7QUFDRCw0QkFBQSxhQUFBO0FBQUEsd0JBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxPQUFMLENBQWEsWUFBYixDQUFOLENBQUE7QUFBQSx3QkFDQSxRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxZQUFkLEVBQTRCLEdBQTVCLENBRFgsQ0FBQTtBQUdBLHdCQUFBLElBQUcsWUFBYSxDQUFBLENBQUEsQ0FBYixLQUFtQixHQUF0QjtBQUVFLGdDQUFBLENBRkY7eUJBSEE7K0JBT0EsRUFBQSxDQUFHLEVBQUEsR0FBRyxRQUFILEdBQVksR0FBWixHQUFlLFlBQWxCLEVBQWtDLFNBQUEsR0FBQTtBQUdoQyw4QkFBQSxpS0FBQTtBQUFBLDBCQUFBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxPQUFMLENBQWEsV0FBYixFQUEwQixZQUExQixDQUFuQixDQUFBO0FBQUEsMEJBQ0EsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxXQUFiLEVBQTBCLFlBQTFCLENBRG5CLENBQUE7QUFBQSwwQkFHQSxnQkFBQSw0REFBb0QsQ0FBRSxRQUFuQyxDQUFBLFVBSG5CLENBQUE7QUFLQSwwQkFBQSxJQUFHLENBQUEsRUFBTSxDQUFDLFVBQUgsQ0FBYyxnQkFBZCxDQUFQO0FBQ0Usa0NBQVUsSUFBQSxLQUFBLENBQU0sQ0FBQyw4Q0FBQSxHQUE4QyxRQUE5QyxHQUF1RCxJQUF4RCxDQUFBLEdBQ2QsQ0FBQyxNQUFBLEdBQU0sZ0JBQU4sR0FBdUIsSUFBeEIsQ0FEUSxDQUFWLENBREY7MkJBTEE7QUFBQSwwQkFXQSxnQkFBQSw4REFBb0QsQ0FBRSxRQUFuQyxDQUFBLFVBWG5CLENBQUE7QUFBQSwwQkFjQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFkLENBQTRCLGdCQUE1QixFQUE4QyxnQkFBOUMsQ0FkVixDQUFBO0FBQUEsMEJBZ0JBLFdBQUEsR0FBYyxPQUFPLENBQUMsSUFoQnRCLENBQUE7QUFBQSwwQkFtQkEsVUFBQSxHQUFhLFVBQVUsQ0FBQyxpQkFBWCxDQUE2QixnQkFBN0IsQ0FuQmIsQ0FBQTtBQUFBLDBCQXNCQSxRQUFBLEdBQVcsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsV0FBdkIsRUFBb0MsWUFBcEMsQ0F0QlgsQ0FBQTtBQUFBLDBCQXdCQSxpQkFBQSxHQUFvQixLQXhCcEIsQ0FBQTtBQUFBLDBCQXlCQSxhQUFBLEdBQWdCLFNBQUMsSUFBRCxHQUFBO0FBQ2QsZ0NBQUEsaUZBQUE7QUFBQTtBQUNFLDhCQUFBLE1BQUEsQ0FBTyxJQUFBLFlBQWdCLEtBQXZCLENBQTZCLENBQUMsR0FBRyxDQUFDLE9BQWxDLENBQTBDLElBQTFDLEVBQWdELElBQWhELENBQUEsQ0FBQTtBQUNBLDhCQUFBLElBQW1DLElBQUEsWUFBZ0IsS0FBbkQ7QUFBQSx1Q0FBTyxpQkFBQSxHQUFvQixJQUEzQixDQUFBOytCQURBO0FBQUEsOEJBTUEsTUFBQSxDQUFPLElBQVAsQ0FBWSxDQUFDLEdBQUcsQ0FBQyxPQUFqQixDQUF5QixJQUF6QixFQUErQixrQ0FBL0IsQ0FOQSxDQUFBO0FBT0EsOEJBQUEsSUFBbUMsSUFBQSxLQUFRLElBQTNDO0FBQUEsdUNBQU8saUJBQUEsR0FBb0IsSUFBM0IsQ0FBQTsrQkFQQTtBQUFBLDhCQVNBLE1BQUEsQ0FBTyxNQUFBLENBQUEsSUFBUCxDQUFtQixDQUFDLE9BQXBCLENBQTRCLFFBQTVCLEVBQXVDLFFBQUEsR0FBUSxJQUEvQyxDQVRBLENBQUE7QUFVQSw4QkFBQSxJQUFtQyxNQUFBLENBQUEsSUFBQSxLQUFpQixRQUFwRDtBQUFBLHVDQUFPLGlCQUFBLEdBQW9CLElBQTNCLENBQUE7K0JBVkE7QUFBQSw4QkFhQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxpQkFBYixFQUFnQyxLQUFoQyxDQWJQLENBQUE7QUFBQSw4QkFjQSxnQkFBQSxHQUFtQixnQkFDakIsQ0FBQyxPQURnQixDQUNSLGlCQURRLEVBQ1csS0FEWCxDQWRuQixDQUFBO0FBQUEsOEJBaUJBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsR0FBeEIsQ0FqQlAsQ0FBQTtBQUFBLDhCQWtCQSxnQkFBQSxHQUFtQixnQkFDakIsQ0FBQyxPQURnQixDQUNSLFNBRFEsRUFDRyxHQURILENBbEJuQixDQUFBO0FBQUEsOEJBcUJBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsR0FBeEIsQ0FyQlAsQ0FBQTtBQUFBLDhCQXNCQSxnQkFBQSxHQUFtQixnQkFDakIsQ0FBQyxPQURnQixDQUNSLFNBRFEsRUFDRyxHQURILENBdEJuQixDQUFBO0FBMEJBLDhCQUFBLElBQUcsSUFBQSxLQUFVLGdCQUFiO0FBRUUsZ0NBQUEsUUFBQSxHQUFXLGdCQUFYLENBQUE7QUFBQSxnQ0FDQSxNQUFBLEdBQU8sSUFEUCxDQUFBO0FBQUEsZ0NBRUEsTUFBQSxHQUFPLGdCQUZQLENBQUE7QUFBQSxnQ0FHQSxTQUFBLEdBQVUsWUFIVixDQUFBO0FBQUEsZ0NBSUEsU0FBQSxHQUFVLFVBSlYsQ0FBQTtBQUFBLGdDQUtBLElBQUEsR0FBTyxNQUFNLENBQUMsV0FBUCxDQUFtQixRQUFuQixFQUE2QixNQUE3QixFQUNMLE1BREssRUFDRyxTQURILEVBQ2MsU0FEZCxDQUxQLENBQUE7QUFBQSxnQ0FRQSxJQUFBLEdBQU8sVUFBVSxDQUFDLHFCQUFYLENBQWlDLFVBQWpDLEVBQTZDLFFBQTdDLENBUlAsQ0FBQTtBQUFBLGdDQVNBLGtCQUFBLEdBQXFCLFVBQVUsQ0FBQyx3QkFBWCxDQUFvQyxRQUFwQyxDQVRyQixDQUFBO0FBVUEsZ0NBQUEsSUFBRywwQkFBSDtBQUNFLGtDQUFBLElBQUEsR0FBTyxVQUFVLENBQUMsZ0JBQVgsQ0FBNEIsa0JBQTVCLEVBQWdELFFBQVEsQ0FBQyxJQUF6RCxFQUErRCxJQUEvRCxDQUFQLENBREY7aUNBVkE7QUFBQSxnQ0FjQSxNQUFBLENBQU8sSUFBUCxDQUFZLENBQUMsT0FBYixDQUFxQixnQkFBckIsRUFDRyxjQUFBLEdBQWEsOEJBQUMsa0JBQWtCLENBQUUsYUFBckIsQ0FBYixHQUF1Qyw0Q0FBdkMsR0FDVSxJQURWLEdBQ2UscUJBRGYsR0FHQSxDQUFDLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBZixFQUFxQixNQUFyQixFQUFnQyxDQUFoQyxDQUFELENBSkgsQ0FkQSxDQUZGOytCQTFCQTtxQ0FnREEsaUJBQUEsR0FBb0IsS0FqRHRCOzZCQUFBLGNBQUE7QUFtREUsOEJBREksVUFDSixDQUFBO0FBQUEsOEJBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxDQUFkLENBQUEsQ0FBQTtxQ0FDQSxpQkFBQSxHQUFvQixFQXBEdEI7NkJBRGM7MEJBQUEsQ0F6QmhCLENBQUE7QUFBQSwwQkFnRkEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILGdDQUFBLENBQUE7QUFBQTtxQ0FDRSxVQUFVLENBQUMsUUFBWCxDQUFvQixnQkFBcEIsRUFBc0MsVUFBdEMsRUFBa0QsV0FBbEQsRUFBK0QsWUFBL0QsQ0FDQSxDQUFDLElBREQsQ0FDTSxhQUROLENBRUEsQ0FBQyxPQUFELENBRkEsQ0FFTyxhQUZQLEVBREY7NkJBQUEsY0FBQTtBQUtFLDhCQURJLFVBQ0osQ0FBQTtxQ0FBQSxpQkFBQSxHQUFvQixFQUx0Qjs2QkFERzswQkFBQSxDQUFMLENBaEZBLENBQUE7aUNBd0ZBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7QUFDUCw0QkFBQSxJQUFHLGlCQUFBLFlBQTZCLEtBQWhDO0FBQ0Usb0NBQU0saUJBQU4sQ0FERjs2QkFBQSxNQUFBO0FBR0UscUNBQU8saUJBQVAsQ0FIRjs2QkFETzswQkFBQSxDQUFULEVBS0Usd0NBTEYsRUFLNEMsS0FMNUMsRUEzRmdDO3dCQUFBLENBQWxDLEVBUkM7c0JBQUEsQ0FBQSxDQUFILENBQUksWUFBSixFQUFBLENBREY7QUFBQTtxQ0FKOEM7a0JBQUEsQ0FBaEQsRUFmRjtpQkFMQztjQUFBLENBQUEsQ0FBSCxDQUFJLElBQUosRUFBQSxDQURGO0FBQUE7NkJBSCtDO1VBQUEsQ0FBakQsRUFGRjtTQUxDO01BQUEsQ0FBQSxDQUFILENBQUksTUFBSixFQUFBLENBREY7QUFBQTtvQkFuRTRCO0VBQUEsQ0FBOUIsQ0FoQkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/spec/beautify-languages-spec.coffee
