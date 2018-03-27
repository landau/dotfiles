(function() {
  var Beautifiers, Handlebars, _, beautifier, beautifierName, beautifierNames, beautifierOptions, beautifiers, beautifiersMap, beautifyLanguageCommands, context, exampleConfig, executableOptions, fs, j, keywords, languageNames, languageOptions, languagesMap, len, linkifyTitle, lo, optionDef, optionGroup, optionGroupTemplate, optionGroupTemplatePath, optionName, optionTemplate, optionTemplatePath, optionsPath, optionsTemplate, optionsTemplatePath, packageOptions, path, pkg, readmePath, readmeResult, readmeTemplate, readmeTemplatePath, ref, ref1, result, sortKeysBy, sortSettings, template;

  Handlebars = require('handlebars');

  Beautifiers = require("../src/beautifiers");

  fs = require('fs');

  _ = require('lodash');

  path = require('path');

  pkg = require('../package.json');

  console.log('Generating options...');

  beautifier = new Beautifiers();

  languageOptions = beautifier.options;

  executableOptions = languageOptions.executables;

  delete languageOptions.executables;

  packageOptions = require('../src/config.coffee');

  packageOptions.executables = executableOptions;

  beautifiersMap = _.keyBy(beautifier.beautifiers, 'name');

  languagesMap = _.keyBy(beautifier.languages.languages, 'name');

  beautifierOptions = {};

  for (lo in languageOptions) {
    optionGroup = languageOptions[lo];
    ref = optionGroup.properties;
    for (optionName in ref) {
      optionDef = ref[optionName];
      beautifiers = (ref1 = optionDef.beautifiers) != null ? ref1 : [];
      for (j = 0, len = beautifiers.length; j < len; j++) {
        beautifierName = beautifiers[j];
        if (beautifierOptions[beautifierName] == null) {
          beautifierOptions[beautifierName] = {};
        }
        beautifierOptions[beautifierName][optionName] = optionDef;
      }
    }
  }

  console.log('Loading options template...');

  readmeTemplatePath = path.resolve(__dirname, '../README-template.md');

  readmePath = path.resolve(__dirname, '../README.md');

  optionsTemplatePath = __dirname + '/options-template.md';

  optionTemplatePath = __dirname + '/option-template.md';

  optionGroupTemplatePath = __dirname + '/option-group-template.md';

  optionsPath = __dirname + '/options.md';

  optionsTemplate = fs.readFileSync(optionsTemplatePath).toString();

  optionGroupTemplate = fs.readFileSync(optionGroupTemplatePath).toString();

  optionTemplate = fs.readFileSync(optionTemplatePath).toString();

  readmeTemplate = fs.readFileSync(readmeTemplatePath).toString();

  console.log('Building documentation from template and options...');

  Handlebars.registerPartial('option', optionTemplate);

  Handlebars.registerPartial('option-group', optionGroupTemplate);

  template = Handlebars.compile(optionsTemplate);

  readmeTemplate = Handlebars.compile(readmeTemplate);

  linkifyTitle = function(title) {
    var p, sep;
    title = title.toLowerCase();
    p = title.split(/[\s,+#;,\/?:@&=+$]+/);
    sep = "-";
    return p.join(sep);
  };

  Handlebars.registerHelper('linkify', function(title, options) {
    return new Handlebars.SafeString("[" + (options.fn(this)) + "](\#" + (linkifyTitle(title)) + ")");
  });

  exampleConfig = function(option) {
    var c, d, json, k, namespace, t;
    t = option.type;
    d = (function() {
      switch (false) {
        case option["default"] == null:
          return option["default"];
        case t !== "string":
          return "";
        case t !== "integer":
          return 0;
        case t !== "boolean":
          return false;
        default:
          return null;
      }
    })();
    json = {};
    namespace = option.language.namespace;
    k = option.key;
    c = {};
    c[k] = d;
    json[namespace] = c;
    return "```json\n" + (JSON.stringify(json, void 0, 4)) + "\n```";
  };

  Handlebars.registerHelper('example-config', function(key, option, options) {
    var results;
    results = exampleConfig(key, option);
    return new Handlebars.SafeString(results);
  });

  Handlebars.registerHelper('language-beautifiers-support', function(languageOptions, options) {
    var results, rows;
    rows = _.chain(languageOptions).filter(function(val, k) {
      return k !== "executables";
    }).map(function(val, k) {
      var defaultBeautifier, extensions, grammars, name;
      name = val.title;
      defaultBeautifier = _.get(val, "properties.default_beautifier.default");
      beautifiers = _.chain(val.beautifiers).sortBy().sortBy(function(b) {
        var isDefault;
        beautifier = beautifiersMap[b];
        isDefault = b === defaultBeautifier;
        return !isDefault;
      }).map(function(b) {
        var isDefault, r;
        beautifier = beautifiersMap[b];
        isDefault = b === defaultBeautifier;
        if (beautifier.link) {
          r = "[`" + b + "`](" + beautifier.link + ")";
        } else {
          r = "`" + b + "`";
        }
        if (isDefault) {
          r = "**" + r + "**";
        }
        return r;
      }).value();
      grammars = _.map(val.grammars, function(b) {
        return "`" + b + "`";
      });
      extensions = _.map(val.extensions, function(b) {
        return "`." + b + "`";
      });
      return "| " + name + " | " + (grammars.join(', ')) + " |" + (extensions.join(', ')) + " | " + (beautifiers.join(', ')) + " |";
    }).value();
    results = "| Language | Grammars | File Extensions | Supported Beautifiers |\n| --- | --- | --- | ---- |\n" + (rows.join('\n'));
    return new Handlebars.SafeString(results);
  });

  Handlebars.registerHelper('language-options-support', function(languageOptions, options) {

    /*
    | Option | PrettyDiff | JS-Beautify |
    | --- | --- | --- |
    | `brace_style` | ? | ? |
    | `break_chained_methods` | ? | ? |
    | `end_with_comma` | ? | ? |
    | `end_with_newline` | ? | ? |
    | `eval_code` | ? | ? |
    | `indent_size` | :white_check_mark: | :white_check_mark: |
    | `indent_char` | :white_check_mark: | :white_check_mark: |
     */
    var headers, results, rows;
    rows = [];
    beautifiers = languageOptions.beautifiers.sort();
    headers = ['Option'].concat(beautifiers);
    rows.push(headers);
    rows.push(_.map(headers, function() {
      return '---';
    }));
    _.each(Object.keys(languageOptions.properties), function(op) {
      var field, support;
      field = languageOptions.properties[op];
      support = _.map(beautifiers, function(b) {
        if (_.includes(field.beautifiers, b) || _.includes(["disabled", "default_beautifier", "beautify_on_save"], op)) {
          return ':white_check_mark:';
        } else {
          return ':x:';
        }
      });
      return rows.push(["`" + op + "`"].concat(support));
    });
    results = _.map(rows, function(r) {
      return "| " + (r.join(' | ')) + " |";
    }).join('\n');
    return new Handlebars.SafeString(results);
  });

  Handlebars.registerHelper('beautifiers-info', function(beautifiers, options) {

    /*
    | Beautifier | Preinstalled? | Installation Instructions |
    | --- | ---- |
    | Pretty Diff | :white_check_mark: | N/A |
    | AutoPEP8 | :x: | LINK |
     */
    var results, rows;
    rows = _.map(beautifiers, function(beautifier, k) {
      var dockerCell, dockerExecutables, executables, hasDockerExecutables, hasExecutables, installWithDocker, installationInstructions, isPreInstalled, link, name, preinstalledCell;
      name = beautifier.name;
      isPreInstalled = beautifier.isPreInstalled;
      if (typeof isPreInstalled === "function") {
        isPreInstalled = beautifier.isPreInstalled();
      }
      link = beautifier.link;
      executables = beautifier.executables || [];
      hasExecutables = executables.length > 0;
      dockerExecutables = executables.filter(function(exe) {
        return !!exe.docker;
      });
      hasDockerExecutables = dockerExecutables.length > 0;
      installWithDocker = dockerExecutables.map(function(d) {
        return "- " + d.docker.image;
      }).join('\n');
      preinstalledCell = (function() {
        if (isPreInstalled) {
          return ":white_check_mark:";
        } else {
          if (executables.length > 0) {
            return ":warning: " + executables.length + " executable" + (executables.length === 1 ? '' : 's');
          } else {
            return ":warning: Manual installation";
          }
        }
      })();
      dockerCell = (function() {
        if (isPreInstalled) {
          return ":ok_hand: Not necessary";
        } else {
          if (hasExecutables) {
            if (dockerExecutables.length === executables.length) {
              return ":white_check_mark: :100:% of executables";
            } else if (dockerExecutables.length > 0) {
              return ":warning: Only " + dockerExecutables.length + " of " + executables.length + " executables";
            } else {
              return ":x: No Docker support";
            }
          } else {
            return ":construction: Not an executable";
          }
        }
      })();
      installationInstructions = (function() {
        var executablesInstallation;
        if (isPreInstalled) {
          return ":smiley: Nothing!";
        } else {
          if (hasExecutables) {
            executablesInstallation = "";
            if (hasDockerExecutables) {
              executablesInstallation += ":whale: With [Docker](https://www.docker.com/):<br/>";
              dockerExecutables.forEach(function(e, i) {
                return executablesInstallation += (i + 1) + ". Install [" + (e.name || e.cmd) + " (`" + e.cmd + "`)](" + e.homepage + ") with `docker pull " + e.docker.image + "`<br/>";
              });
              executablesInstallation += "<br/>";
            }
            executablesInstallation += ":bookmark_tabs: Manually:<br/>";
            executables.forEach(function(e, i) {
              return executablesInstallation += (i + 1) + ". Install [" + (e.name || e.cmd) + " (`" + e.cmd + "`)](" + e.homepage + ") by following " + e.installation + "<br/>";
            });
            return executablesInstallation;
          } else {
            return ":page_facing_up: Go to " + link + " and follow the instructions.";
          }
        }
      })();
      return "| " + name + " | " + preinstalledCell + " | " + dockerCell + " | " + installationInstructions + " |";
    });
    results = "| Beautifier | Preinstalled | [:whale: Docker](https://www.docker.com/) | Installation |\n| --- | --- | --- |--- |\n" + (rows.join('\n'));
    return new Handlebars.SafeString(results);
  });

  sortKeysBy = function(obj, comparator) {
    var keys;
    keys = _.sortBy(_.keys(obj), function(key) {
      if (comparator) {
        return comparator(obj[key], key);
      } else {
        return key;
      }
    });
    return _.zipObject(keys, _.map(keys, function(key) {
      return obj[key];
    }));
  };

  sortSettings = function(settings) {
    var r;
    r = _.mapValues(settings, function(op) {
      if (op.type === "object" && op.properties) {
        op.properties = sortSettings(op.properties);
      }
      return op;
    });
    r = sortKeysBy(sortKeysBy(r), function(op) {
      return op.order;
    });
    return r;
  };

  context = {
    "package": pkg,
    packageOptions: sortSettings(packageOptions),
    languageOptions: sortSettings(languageOptions),
    beautifierOptions: sortSettings(beautifierOptions),
    beautifiers: _.sortBy(beautifier.beautifiers, function(beautifier) {
      return beautifier.name.toLowerCase();
    })
  };

  result = template(context);

  readmeResult = readmeTemplate(context);

  console.log('Writing documentation to file...');

  fs.writeFileSync(optionsPath, result);

  fs.writeFileSync(readmePath, readmeResult);

  console.log('Updating package.json');

  languageNames = _.map(Object.keys(languagesMap), function(a) {
    return a.toLowerCase();
  });

  beautifierNames = _.map(Object.keys(beautifiersMap), function(a) {
    return a.toLowerCase();
  });

  keywords = _.union(pkg.keywords, languageNames, beautifierNames);

  pkg.keywords = keywords;

  beautifyLanguageCommands = _.map(languageNames, function(languageName) {
    return "atom-beautify:beautify-language-" + languageName;
  });

  pkg.activationCommands["atom-workspace"] = _.union(pkg.activationCommands["atom-workspace"], beautifyLanguageCommands);

  fs.writeFileSync(path.resolve(__dirname, '../package.json'), JSON.stringify(pkg, void 0, 2));

  console.log('Done.');

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9kb2NzL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQTtBQUFBLE1BQUE7O0VBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSOztFQUNiLFdBQUEsR0FBYyxPQUFBLENBQVEsb0JBQVI7O0VBQ2QsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsR0FBQSxHQUFNLE9BQUEsQ0FBUSxpQkFBUjs7RUFFTixPQUFPLENBQUMsR0FBUixDQUFZLHVCQUFaOztFQUNBLFVBQUEsR0FBaUIsSUFBQSxXQUFBLENBQUE7O0VBQ2pCLGVBQUEsR0FBa0IsVUFBVSxDQUFDOztFQUM3QixpQkFBQSxHQUFvQixlQUFlLENBQUM7O0VBQ3BDLE9BQU8sZUFBZSxDQUFDOztFQUN2QixjQUFBLEdBQWlCLE9BQUEsQ0FBUSxzQkFBUjs7RUFDakIsY0FBYyxDQUFDLFdBQWYsR0FBNkI7O0VBRTdCLGNBQUEsR0FBaUIsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxVQUFVLENBQUMsV0FBbkIsRUFBZ0MsTUFBaEM7O0VBQ2pCLFlBQUEsR0FBZSxDQUFDLENBQUMsS0FBRixDQUFRLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBN0IsRUFBd0MsTUFBeEM7O0VBQ2YsaUJBQUEsR0FBb0I7O0FBQ3BCLE9BQUEscUJBQUE7O0FBQ0U7QUFBQSxTQUFBLGlCQUFBOztNQUNFLFdBQUEsbURBQXNDO0FBQ3RDLFdBQUEsNkNBQUE7OztVQUNFLGlCQUFrQixDQUFBLGNBQUEsSUFBbUI7O1FBQ3JDLGlCQUFrQixDQUFBLGNBQUEsQ0FBZ0IsQ0FBQSxVQUFBLENBQWxDLEdBQWdEO0FBRmxEO0FBRkY7QUFERjs7RUFPQSxPQUFPLENBQUMsR0FBUixDQUFZLDZCQUFaOztFQUNBLGtCQUFBLEdBQXFCLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3Qix1QkFBeEI7O0VBQ3JCLFVBQUEsR0FBYSxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsY0FBeEI7O0VBQ2IsbUJBQUEsR0FBc0IsU0FBQSxHQUFZOztFQUNsQyxrQkFBQSxHQUFxQixTQUFBLEdBQVk7O0VBQ2pDLHVCQUFBLEdBQTBCLFNBQUEsR0FBWTs7RUFDdEMsV0FBQSxHQUFjLFNBQUEsR0FBWTs7RUFFMUIsZUFBQSxHQUFrQixFQUFFLENBQUMsWUFBSCxDQUFnQixtQkFBaEIsQ0FBb0MsQ0FBQyxRQUFyQyxDQUFBOztFQUNsQixtQkFBQSxHQUFzQixFQUFFLENBQUMsWUFBSCxDQUFnQix1QkFBaEIsQ0FBd0MsQ0FBQyxRQUF6QyxDQUFBOztFQUN0QixjQUFBLEdBQWlCLEVBQUUsQ0FBQyxZQUFILENBQWdCLGtCQUFoQixDQUFtQyxDQUFDLFFBQXBDLENBQUE7O0VBQ2pCLGNBQUEsR0FBaUIsRUFBRSxDQUFDLFlBQUgsQ0FBZ0Isa0JBQWhCLENBQW1DLENBQUMsUUFBcEMsQ0FBQTs7RUFFakIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxxREFBWjs7RUFDQSxVQUFVLENBQUMsZUFBWCxDQUEyQixRQUEzQixFQUFxQyxjQUFyQzs7RUFDQSxVQUFVLENBQUMsZUFBWCxDQUEyQixjQUEzQixFQUEyQyxtQkFBM0M7O0VBQ0EsUUFBQSxHQUFXLFVBQVUsQ0FBQyxPQUFYLENBQW1CLGVBQW5COztFQUNYLGNBQUEsR0FBaUIsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsY0FBbkI7O0VBRWpCLFlBQUEsR0FBZSxTQUFDLEtBQUQ7QUFDYixRQUFBO0lBQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxXQUFOLENBQUE7SUFDUixDQUFBLEdBQUksS0FBSyxDQUFDLEtBQU4sQ0FBWSxxQkFBWjtJQUNKLEdBQUEsR0FBTTtXQUNOLENBQUMsQ0FBQyxJQUFGLENBQU8sR0FBUDtFQUphOztFQU1mLFVBQVUsQ0FBQyxjQUFYLENBQTBCLFNBQTFCLEVBQXFDLFNBQUMsS0FBRCxFQUFRLE9BQVI7QUFDbkMsV0FBVyxJQUFBLFVBQVUsQ0FBQyxVQUFYLENBQ1QsR0FBQSxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQVIsQ0FBVyxJQUFYLENBQUQsQ0FBSCxHQUFxQixNQUFyQixHQUEwQixDQUFDLFlBQUEsQ0FBYSxLQUFiLENBQUQsQ0FBMUIsR0FBK0MsR0FEdEM7RUFEd0IsQ0FBckM7O0VBTUEsYUFBQSxHQUFnQixTQUFDLE1BQUQ7QUFFZCxRQUFBO0lBQUEsQ0FBQSxHQUFJLE1BQU0sQ0FBQztJQUNYLENBQUE7QUFBSSxjQUFBLEtBQUE7QUFBQSxhQUNHLHlCQURIO2lCQUN3QixNQUFNLEVBQUMsT0FBRDtBQUQ5QixhQUVHLENBQUEsS0FBSyxRQUZSO2lCQUVzQjtBQUZ0QixhQUdHLENBQUEsS0FBSyxTQUhSO2lCQUd1QjtBQUh2QixhQUlHLENBQUEsS0FBSyxTQUpSO2lCQUl1QjtBQUp2QjtpQkFLRztBQUxIOztJQU9KLElBQUEsR0FBTztJQUNQLFNBQUEsR0FBWSxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQzVCLENBQUEsR0FBSSxNQUFNLENBQUM7SUFDWCxDQUFBLEdBQUk7SUFDSixDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU87SUFDUCxJQUFLLENBQUEsU0FBQSxDQUFMLEdBQWtCO0FBQ2xCLFdBQU8sV0FBQSxHQUNOLENBQUMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFmLEVBQXFCLE1BQXJCLEVBQWdDLENBQWhDLENBQUQsQ0FETSxHQUM4QjtFQWpCdkI7O0VBb0JoQixVQUFVLENBQUMsY0FBWCxDQUEwQixnQkFBMUIsRUFBNEMsU0FBQyxHQUFELEVBQU0sTUFBTixFQUFjLE9BQWQ7QUFDMUMsUUFBQTtJQUFBLE9BQUEsR0FBVSxhQUFBLENBQWMsR0FBZCxFQUFtQixNQUFuQjtBQUVWLFdBQVcsSUFBQSxVQUFVLENBQUMsVUFBWCxDQUFzQixPQUF0QjtFQUgrQixDQUE1Qzs7RUFNQSxVQUFVLENBQUMsY0FBWCxDQUEwQiw4QkFBMUIsRUFBMEQsU0FBQyxlQUFELEVBQWtCLE9BQWxCO0FBRXhELFFBQUE7SUFBQSxJQUFBLEdBQU8sQ0FBQyxDQUFDLEtBQUYsQ0FBUSxlQUFSLENBQ0wsQ0FBQyxNQURJLENBQ0csU0FBQyxHQUFELEVBQU0sQ0FBTjthQUFZLENBQUEsS0FBTztJQUFuQixDQURILENBRUwsQ0FBQyxHQUZJLENBRUEsU0FBQyxHQUFELEVBQU0sQ0FBTjtBQUNILFVBQUE7TUFBQSxJQUFBLEdBQU8sR0FBRyxDQUFDO01BQ1gsaUJBQUEsR0FBb0IsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxHQUFOLEVBQVcsdUNBQVg7TUFDcEIsV0FBQSxHQUFjLENBQUMsQ0FBQyxLQUFGLENBQVEsR0FBRyxDQUFDLFdBQVosQ0FDWixDQUFDLE1BRFcsQ0FBQSxDQUVaLENBQUMsTUFGVyxDQUVKLFNBQUMsQ0FBRDtBQUNOLFlBQUE7UUFBQSxVQUFBLEdBQWEsY0FBZSxDQUFBLENBQUE7UUFDNUIsU0FBQSxHQUFZLENBQUEsS0FBSztBQUNqQixlQUFPLENBQUM7TUFIRixDQUZJLENBT1osQ0FBQyxHQVBXLENBT1AsU0FBQyxDQUFEO0FBQ0gsWUFBQTtRQUFBLFVBQUEsR0FBYSxjQUFlLENBQUEsQ0FBQTtRQUM1QixTQUFBLEdBQVksQ0FBQSxLQUFLO1FBQ2pCLElBQUcsVUFBVSxDQUFDLElBQWQ7VUFDRSxDQUFBLEdBQUksSUFBQSxHQUFLLENBQUwsR0FBTyxLQUFQLEdBQVksVUFBVSxDQUFDLElBQXZCLEdBQTRCLElBRGxDO1NBQUEsTUFBQTtVQUdFLENBQUEsR0FBSSxHQUFBLEdBQUksQ0FBSixHQUFNLElBSFo7O1FBSUEsSUFBRyxTQUFIO1VBQ0UsQ0FBQSxHQUFJLElBQUEsR0FBSyxDQUFMLEdBQU8sS0FEYjs7QUFFQSxlQUFPO01BVEosQ0FQTyxDQWtCWixDQUFDLEtBbEJXLENBQUE7TUFtQmQsUUFBQSxHQUFXLENBQUMsQ0FBQyxHQUFGLENBQU0sR0FBRyxDQUFDLFFBQVYsRUFBb0IsU0FBQyxDQUFEO2VBQU8sR0FBQSxHQUFJLENBQUosR0FBTTtNQUFiLENBQXBCO01BQ1gsVUFBQSxHQUFhLENBQUMsQ0FBQyxHQUFGLENBQU0sR0FBRyxDQUFDLFVBQVYsRUFBc0IsU0FBQyxDQUFEO2VBQU8sSUFBQSxHQUFLLENBQUwsR0FBTztNQUFkLENBQXRCO0FBRWIsYUFBTyxJQUFBLEdBQUssSUFBTCxHQUFVLEtBQVYsR0FBYyxDQUFDLFFBQVEsQ0FBQyxJQUFULENBQWMsSUFBZCxDQUFELENBQWQsR0FBbUMsSUFBbkMsR0FBc0MsQ0FBQyxVQUFVLENBQUMsSUFBWCxDQUFnQixJQUFoQixDQUFELENBQXRDLEdBQTZELEtBQTdELEdBQWlFLENBQUMsV0FBVyxDQUFDLElBQVosQ0FBaUIsSUFBakIsQ0FBRCxDQUFqRSxHQUF5RjtJQXpCN0YsQ0FGQSxDQTZCTCxDQUFDLEtBN0JJLENBQUE7SUE4QlAsT0FBQSxHQUFVLGlHQUFBLEdBR1QsQ0FBQyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsQ0FBRDtBQUVELFdBQVcsSUFBQSxVQUFVLENBQUMsVUFBWCxDQUFzQixPQUF0QjtFQXJDNkMsQ0FBMUQ7O0VBd0NBLFVBQVUsQ0FBQyxjQUFYLENBQTBCLDBCQUExQixFQUFzRCxTQUFDLGVBQUQsRUFBa0IsT0FBbEI7O0FBRXBEOzs7Ozs7Ozs7OztBQUFBLFFBQUE7SUFZQSxJQUFBLEdBQU87SUFDUCxXQUFBLEdBQWMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxJQUE1QixDQUFBO0lBQ2QsT0FBQSxHQUFVLENBQUMsUUFBRCxDQUFVLENBQUMsTUFBWCxDQUFrQixXQUFsQjtJQUNWLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVjtJQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxPQUFOLEVBQWUsU0FBQTthQUFNO0lBQU4sQ0FBZixDQUFWO0lBRUEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxNQUFNLENBQUMsSUFBUCxDQUFZLGVBQWUsQ0FBQyxVQUE1QixDQUFQLEVBQWdELFNBQUMsRUFBRDtBQUM5QyxVQUFBO01BQUEsS0FBQSxHQUFRLGVBQWUsQ0FBQyxVQUFXLENBQUEsRUFBQTtNQUNuQyxPQUFBLEdBQVUsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxXQUFOLEVBQW1CLFNBQUMsQ0FBRDtRQUMzQixJQUFJLENBQUMsQ0FBQyxRQUFGLENBQVcsS0FBSyxDQUFDLFdBQWpCLEVBQThCLENBQTlCLENBQUEsSUFBb0MsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxDQUFDLFVBQUQsRUFBYSxvQkFBYixFQUFtQyxrQkFBbkMsQ0FBWCxFQUFtRSxFQUFuRSxDQUF4QztBQUNFLGlCQUFPLHFCQURUO1NBQUEsTUFBQTtBQUdFLGlCQUFPLE1BSFQ7O01BRDJCLENBQW5CO2FBTVYsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFDLEdBQUEsR0FBSSxFQUFKLEdBQU8sR0FBUixDQUFXLENBQUMsTUFBWixDQUFtQixPQUFuQixDQUFWO0lBUjhDLENBQWhEO0lBV0EsT0FBQSxHQUFVLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBTixFQUFZLFNBQUMsQ0FBRDthQUFPLElBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQyxJQUFGLENBQU8sS0FBUCxDQUFELENBQUosR0FBbUI7SUFBMUIsQ0FBWixDQUEwQyxDQUFDLElBQTNDLENBQWdELElBQWhEO0FBQ1YsV0FBVyxJQUFBLFVBQVUsQ0FBQyxVQUFYLENBQXNCLE9BQXRCO0VBaEN5QyxDQUF0RDs7RUFvQ0EsVUFBVSxDQUFDLGNBQVgsQ0FBMEIsa0JBQTFCLEVBQThDLFNBQUMsV0FBRCxFQUFjLE9BQWQ7O0FBRTVDOzs7Ozs7QUFBQSxRQUFBO0lBT0EsSUFBQSxHQUFPLENBQUMsQ0FBQyxHQUFGLENBQU0sV0FBTixFQUFtQixTQUFDLFVBQUQsRUFBYSxDQUFiO0FBQ3hCLFVBQUE7TUFBQSxJQUFBLEdBQU8sVUFBVSxDQUFDO01BQ2xCLGNBQUEsR0FBaUIsVUFBVSxDQUFDO01BQzVCLElBQUcsT0FBTyxjQUFQLEtBQXlCLFVBQTVCO1FBQ0UsY0FBQSxHQUFpQixVQUFVLENBQUMsY0FBWCxDQUFBLEVBRG5COztNQUVBLElBQUEsR0FBTyxVQUFVLENBQUM7TUFDbEIsV0FBQSxHQUFjLFVBQVUsQ0FBQyxXQUFYLElBQTBCO01BQ3hDLGNBQUEsR0FBaUIsV0FBVyxDQUFDLE1BQVosR0FBcUI7TUFDdEMsaUJBQUEsR0FBb0IsV0FBVyxDQUFDLE1BQVosQ0FBbUIsU0FBQyxHQUFEO2VBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztNQUFmLENBQW5CO01BQ3BCLG9CQUFBLEdBQXVCLGlCQUFpQixDQUFDLE1BQWxCLEdBQTJCO01BQ2xELGlCQUFBLEdBQW9CLGlCQUFpQixDQUFDLEdBQWxCLENBQXNCLFNBQUMsQ0FBRDtlQUFPLElBQUEsR0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO01BQXJCLENBQXRCLENBQW1ELENBQUMsSUFBcEQsQ0FBeUQsSUFBekQ7TUFFcEIsZ0JBQUEsR0FBc0IsQ0FBQyxTQUFBO1FBQ3JCLElBQUcsY0FBSDtpQkFDRSxxQkFERjtTQUFBLE1BQUE7VUFHRSxJQUFHLFdBQVcsQ0FBQyxNQUFaLEdBQXFCLENBQXhCO21CQUNFLFlBQUEsR0FBYSxXQUFXLENBQUMsTUFBekIsR0FBZ0MsYUFBaEMsR0FBNEMsQ0FBSSxXQUFXLENBQUMsTUFBWixLQUFzQixDQUF6QixHQUFnQyxFQUFoQyxHQUF3QyxHQUF6QyxFQUQ5QztXQUFBLE1BQUE7bUJBR0UsZ0NBSEY7V0FIRjs7TUFEcUIsQ0FBRCxDQUFILENBQUE7TUFTbkIsVUFBQSxHQUFnQixDQUFDLFNBQUE7UUFDZixJQUFHLGNBQUg7aUJBQ0UsMEJBREY7U0FBQSxNQUFBO1VBR0UsSUFBRyxjQUFIO1lBQ0UsSUFBRyxpQkFBaUIsQ0FBQyxNQUFsQixLQUE0QixXQUFXLENBQUMsTUFBM0M7cUJBQ0UsMkNBREY7YUFBQSxNQUVLLElBQUcsaUJBQWlCLENBQUMsTUFBbEIsR0FBMkIsQ0FBOUI7cUJBQ0gsaUJBQUEsR0FBa0IsaUJBQWlCLENBQUMsTUFBcEMsR0FBMkMsTUFBM0MsR0FBaUQsV0FBVyxDQUFDLE1BQTdELEdBQW9FLGVBRGpFO2FBQUEsTUFBQTtxQkFHSCx3QkFIRzthQUhQO1dBQUEsTUFBQTttQkFRRSxtQ0FSRjtXQUhGOztNQURlLENBQUQsQ0FBSCxDQUFBO01BY2Isd0JBQUEsR0FBOEIsQ0FBQyxTQUFBO0FBQzdCLFlBQUE7UUFBQSxJQUFHLGNBQUg7aUJBQ0Usb0JBREY7U0FBQSxNQUFBO1VBR0UsSUFBRyxjQUFIO1lBQ0UsdUJBQUEsR0FBMEI7WUFDMUIsSUFBRyxvQkFBSDtjQUNFLHVCQUFBLElBQTJCO2NBQzNCLGlCQUFpQixDQUFDLE9BQWxCLENBQTBCLFNBQUMsQ0FBRCxFQUFJLENBQUo7dUJBQ3hCLHVCQUFBLElBQTZCLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBQSxHQUFLLGFBQUwsR0FBaUIsQ0FBQyxDQUFDLENBQUMsSUFBRixJQUFVLENBQUMsQ0FBQyxHQUFiLENBQWpCLEdBQWtDLEtBQWxDLEdBQXVDLENBQUMsQ0FBQyxHQUF6QyxHQUE2QyxNQUE3QyxHQUFtRCxDQUFDLENBQUMsUUFBckQsR0FBOEQsc0JBQTlELEdBQW9GLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBN0YsR0FBbUc7Y0FEeEcsQ0FBMUI7Y0FHQSx1QkFBQSxJQUEyQixRQUw3Qjs7WUFNQSx1QkFBQSxJQUEyQjtZQUMzQixXQUFXLENBQUMsT0FBWixDQUFvQixTQUFDLENBQUQsRUFBSSxDQUFKO3FCQUNsQix1QkFBQSxJQUE2QixDQUFDLENBQUEsR0FBRSxDQUFILENBQUEsR0FBSyxhQUFMLEdBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUYsSUFBVSxDQUFDLENBQUMsR0FBYixDQUFqQixHQUFrQyxLQUFsQyxHQUF1QyxDQUFDLENBQUMsR0FBekMsR0FBNkMsTUFBN0MsR0FBbUQsQ0FBQyxDQUFDLFFBQXJELEdBQThELGlCQUE5RCxHQUErRSxDQUFDLENBQUMsWUFBakYsR0FBOEY7WUFEekcsQ0FBcEI7QUFHQSxtQkFBTyx3QkFaVDtXQUFBLE1BQUE7bUJBY0UseUJBQUEsR0FBMEIsSUFBMUIsR0FBK0IsZ0NBZGpDO1dBSEY7O01BRDZCLENBQUQsQ0FBSCxDQUFBO0FBb0IzQixhQUFPLElBQUEsR0FBSyxJQUFMLEdBQVUsS0FBVixHQUFlLGdCQUFmLEdBQWdDLEtBQWhDLEdBQXFDLFVBQXJDLEdBQWdELEtBQWhELEdBQXFELHdCQUFyRCxHQUE4RTtJQXZEN0QsQ0FBbkI7SUF5RFAsT0FBQSxHQUFVLHNIQUFBLEdBR1QsQ0FBQyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsQ0FBRDtBQUVELFdBQVcsSUFBQSxVQUFVLENBQUMsVUFBWCxDQUFzQixPQUF0QjtFQXZFaUMsQ0FBOUM7O0VBMEVBLFVBQUEsR0FBYSxTQUFDLEdBQUQsRUFBTSxVQUFOO0FBQ1gsUUFBQTtJQUFBLElBQUEsR0FBTyxDQUFDLENBQUMsTUFBRixDQUFTLENBQUMsQ0FBQyxJQUFGLENBQU8sR0FBUCxDQUFULEVBQXNCLFNBQUMsR0FBRDtNQUNwQixJQUFHLFVBQUg7ZUFBbUIsVUFBQSxDQUFXLEdBQUksQ0FBQSxHQUFBLENBQWYsRUFBcUIsR0FBckIsRUFBbkI7T0FBQSxNQUFBO2VBQWtELElBQWxEOztJQURvQixDQUF0QjtBQUdQLFdBQU8sQ0FBQyxDQUFDLFNBQUYsQ0FBWSxJQUFaLEVBQWtCLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBTixFQUFZLFNBQUMsR0FBRDtBQUNuQyxhQUFPLEdBQUksQ0FBQSxHQUFBO0lBRHdCLENBQVosQ0FBbEI7RUFKSTs7RUFRYixZQUFBLEdBQWUsU0FBQyxRQUFEO0FBRWIsUUFBQTtJQUFBLENBQUEsR0FBSSxDQUFDLENBQUMsU0FBRixDQUFZLFFBQVosRUFBc0IsU0FBQyxFQUFEO01BQ3hCLElBQUcsRUFBRSxDQUFDLElBQUgsS0FBVyxRQUFYLElBQXdCLEVBQUUsQ0FBQyxVQUE5QjtRQUNFLEVBQUUsQ0FBQyxVQUFILEdBQWdCLFlBQUEsQ0FBYSxFQUFFLENBQUMsVUFBaEIsRUFEbEI7O0FBRUEsYUFBTztJQUhpQixDQUF0QjtJQU1KLENBQUEsR0FBSSxVQUFBLENBQVcsVUFBQSxDQUFXLENBQVgsQ0FBWCxFQUEwQixTQUFDLEVBQUQ7YUFBUSxFQUFFLENBQUM7SUFBWCxDQUExQjtBQUdKLFdBQU87RUFYTTs7RUFhZixPQUFBLEdBQVU7SUFDUixDQUFBLE9BQUEsQ0FBQSxFQUFTLEdBREQ7SUFFUixjQUFBLEVBQWdCLFlBQUEsQ0FBYSxjQUFiLENBRlI7SUFHUixlQUFBLEVBQWlCLFlBQUEsQ0FBYSxlQUFiLENBSFQ7SUFJUixpQkFBQSxFQUFtQixZQUFBLENBQWEsaUJBQWIsQ0FKWDtJQUtSLFdBQUEsRUFBYSxDQUFDLENBQUMsTUFBRixDQUFTLFVBQVUsQ0FBQyxXQUFwQixFQUFpQyxTQUFDLFVBQUQ7YUFBZ0IsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFoQixDQUFBO0lBQWhCLENBQWpDLENBTEw7OztFQU9WLE1BQUEsR0FBUyxRQUFBLENBQVMsT0FBVDs7RUFDVCxZQUFBLEdBQWUsY0FBQSxDQUFlLE9BQWY7O0VBRWYsT0FBTyxDQUFDLEdBQVIsQ0FBWSxrQ0FBWjs7RUFDQSxFQUFFLENBQUMsYUFBSCxDQUFpQixXQUFqQixFQUE4QixNQUE5Qjs7RUFDQSxFQUFFLENBQUMsYUFBSCxDQUFpQixVQUFqQixFQUE2QixZQUE3Qjs7RUFHQSxPQUFPLENBQUMsR0FBUixDQUFZLHVCQUFaOztFQUVBLGFBQUEsR0FBZ0IsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxNQUFNLENBQUMsSUFBUCxDQUFZLFlBQVosQ0FBTixFQUFpQyxTQUFDLENBQUQ7V0FBSyxDQUFDLENBQUMsV0FBRixDQUFBO0VBQUwsQ0FBakM7O0VBR2hCLGVBQUEsR0FBa0IsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxNQUFNLENBQUMsSUFBUCxDQUFZLGNBQVosQ0FBTixFQUFtQyxTQUFDLENBQUQ7V0FBSyxDQUFDLENBQUMsV0FBRixDQUFBO0VBQUwsQ0FBbkM7O0VBQ2xCLFFBQUEsR0FBVyxDQUFDLENBQUMsS0FBRixDQUFRLEdBQUcsQ0FBQyxRQUFaLEVBQXNCLGFBQXRCLEVBQXFDLGVBQXJDOztFQUNYLEdBQUcsQ0FBQyxRQUFKLEdBQWU7O0VBR2Ysd0JBQUEsR0FBMkIsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxhQUFOLEVBQXFCLFNBQUMsWUFBRDtXQUFrQixrQ0FBQSxHQUFtQztFQUFyRCxDQUFyQjs7RUFDM0IsR0FBRyxDQUFDLGtCQUFtQixDQUFBLGdCQUFBLENBQXZCLEdBQTJDLENBQUMsQ0FBQyxLQUFGLENBQVEsR0FBRyxDQUFDLGtCQUFtQixDQUFBLGdCQUFBLENBQS9CLEVBQWtELHdCQUFsRDs7RUFFM0MsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXVCLGlCQUF2QixDQUFqQixFQUE0RCxJQUFJLENBQUMsU0FBTCxDQUFlLEdBQWYsRUFBb0IsTUFBcEIsRUFBK0IsQ0FBL0IsQ0FBNUQ7O0VBRUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaO0FBM1JBIiwic291cmNlc0NvbnRlbnQiOlsiXG4jIS91c3IvYmluL2VudiBjb2ZmZWVcblxuIyBEZXBlbmRlbmNpZXNcbkhhbmRsZWJhcnMgPSByZXF1aXJlKCdoYW5kbGViYXJzJylcbkJlYXV0aWZpZXJzID0gcmVxdWlyZShcIi4uL3NyYy9iZWF1dGlmaWVyc1wiKVxuZnMgPSByZXF1aXJlKCdmcycpXG5fID0gcmVxdWlyZSgnbG9kYXNoJylcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcbnBrZyA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpXG5cbmNvbnNvbGUubG9nKCdHZW5lcmF0aW5nIG9wdGlvbnMuLi4nKVxuYmVhdXRpZmllciA9IG5ldyBCZWF1dGlmaWVycygpXG5sYW5ndWFnZU9wdGlvbnMgPSBiZWF1dGlmaWVyLm9wdGlvbnNcbmV4ZWN1dGFibGVPcHRpb25zID0gbGFuZ3VhZ2VPcHRpb25zLmV4ZWN1dGFibGVzXG5kZWxldGUgbGFuZ3VhZ2VPcHRpb25zLmV4ZWN1dGFibGVzXG5wYWNrYWdlT3B0aW9ucyA9IHJlcXVpcmUoJy4uL3NyYy9jb25maWcuY29mZmVlJylcbnBhY2thZ2VPcHRpb25zLmV4ZWN1dGFibGVzID0gZXhlY3V0YWJsZU9wdGlvbnNcbiMgQnVpbGQgb3B0aW9ucyBieSBCZWF1dGlmaWVyXG5iZWF1dGlmaWVyc01hcCA9IF8ua2V5QnkoYmVhdXRpZmllci5iZWF1dGlmaWVycywgJ25hbWUnKVxubGFuZ3VhZ2VzTWFwID0gXy5rZXlCeShiZWF1dGlmaWVyLmxhbmd1YWdlcy5sYW5ndWFnZXMsICduYW1lJylcbmJlYXV0aWZpZXJPcHRpb25zID0ge31cbmZvciBsbywgb3B0aW9uR3JvdXAgb2YgbGFuZ3VhZ2VPcHRpb25zXG4gIGZvciBvcHRpb25OYW1lLCBvcHRpb25EZWYgb2Ygb3B0aW9uR3JvdXAucHJvcGVydGllc1xuICAgIGJlYXV0aWZpZXJzID0gb3B0aW9uRGVmLmJlYXV0aWZpZXJzID8gW11cbiAgICBmb3IgYmVhdXRpZmllck5hbWUgaW4gYmVhdXRpZmllcnNcbiAgICAgIGJlYXV0aWZpZXJPcHRpb25zW2JlYXV0aWZpZXJOYW1lXSA/PSB7fVxuICAgICAgYmVhdXRpZmllck9wdGlvbnNbYmVhdXRpZmllck5hbWVdW29wdGlvbk5hbWVdID0gb3B0aW9uRGVmXG5cbmNvbnNvbGUubG9nKCdMb2FkaW5nIG9wdGlvbnMgdGVtcGxhdGUuLi4nKVxucmVhZG1lVGVtcGxhdGVQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL1JFQURNRS10ZW1wbGF0ZS5tZCcpXG5yZWFkbWVQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL1JFQURNRS5tZCcpXG5vcHRpb25zVGVtcGxhdGVQYXRoID0gX19kaXJuYW1lICsgJy9vcHRpb25zLXRlbXBsYXRlLm1kJ1xub3B0aW9uVGVtcGxhdGVQYXRoID0gX19kaXJuYW1lICsgJy9vcHRpb24tdGVtcGxhdGUubWQnXG5vcHRpb25Hcm91cFRlbXBsYXRlUGF0aCA9IF9fZGlybmFtZSArICcvb3B0aW9uLWdyb3VwLXRlbXBsYXRlLm1kJ1xub3B0aW9uc1BhdGggPSBfX2Rpcm5hbWUgKyAnL29wdGlvbnMubWQnXG5cbm9wdGlvbnNUZW1wbGF0ZSA9IGZzLnJlYWRGaWxlU3luYyhvcHRpb25zVGVtcGxhdGVQYXRoKS50b1N0cmluZygpXG5vcHRpb25Hcm91cFRlbXBsYXRlID0gZnMucmVhZEZpbGVTeW5jKG9wdGlvbkdyb3VwVGVtcGxhdGVQYXRoKS50b1N0cmluZygpXG5vcHRpb25UZW1wbGF0ZSA9IGZzLnJlYWRGaWxlU3luYyhvcHRpb25UZW1wbGF0ZVBhdGgpLnRvU3RyaW5nKClcbnJlYWRtZVRlbXBsYXRlID0gZnMucmVhZEZpbGVTeW5jKHJlYWRtZVRlbXBsYXRlUGF0aCkudG9TdHJpbmcoKVxuXG5jb25zb2xlLmxvZygnQnVpbGRpbmcgZG9jdW1lbnRhdGlvbiBmcm9tIHRlbXBsYXRlIGFuZCBvcHRpb25zLi4uJylcbkhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsKCdvcHRpb24nLCBvcHRpb25UZW1wbGF0ZSlcbkhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsKCdvcHRpb24tZ3JvdXAnLCBvcHRpb25Hcm91cFRlbXBsYXRlKVxudGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUob3B0aW9uc1RlbXBsYXRlKVxucmVhZG1lVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUocmVhZG1lVGVtcGxhdGUpXG5cbmxpbmtpZnlUaXRsZSA9ICh0aXRsZSkgLT5cbiAgdGl0bGUgPSB0aXRsZS50b0xvd2VyQ2FzZSgpXG4gIHAgPSB0aXRsZS5zcGxpdCgvW1xccywrIzssXFwvPzpAJj0rJF0rLykgIyBzcGxpdCBpbnRvIHBhcnRzXG4gIHNlcCA9IFwiLVwiXG4gIHAuam9pbihzZXApXG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xpbmtpZnknLCAodGl0bGUsIG9wdGlvbnMpIC0+XG4gIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKFxuICAgIFwiWyN7b3B0aW9ucy5mbih0aGlzKX1dKFxcIyN7bGlua2lmeVRpdGxlKHRpdGxlKX0pXCJcbiAgKVxuKVxuXG5leGFtcGxlQ29uZmlnID0gKG9wdGlvbikgLT5cbiAgIyBjb25zb2xlLmxvZyhvcHRpb24pXG4gIHQgPSBvcHRpb24udHlwZVxuICBkID0gc3dpdGNoXG4gICAgd2hlbiBvcHRpb24uZGVmYXVsdD8gdGhlbiBvcHRpb24uZGVmYXVsdFxuICAgIHdoZW4gdCBpcyBcInN0cmluZ1wiIHRoZW4gXCJcIlxuICAgIHdoZW4gdCBpcyBcImludGVnZXJcIiB0aGVuIDBcbiAgICB3aGVuIHQgaXMgXCJib29sZWFuXCIgdGhlbiBmYWxzZVxuICAgIGVsc2UgbnVsbFxuXG4gIGpzb24gPSB7fVxuICBuYW1lc3BhY2UgPSBvcHRpb24ubGFuZ3VhZ2UubmFtZXNwYWNlXG4gIGsgPSBvcHRpb24ua2V5XG4gIGMgPSB7fVxuICBjW2tdID0gZFxuICBqc29uW25hbWVzcGFjZV0gPSBjXG4gIHJldHVybiBcIlwiXCJgYGBqc29uXG4gICN7SlNPTi5zdHJpbmdpZnkoanNvbiwgdW5kZWZpbmVkLCA0KX1cbiAgYGBgXCJcIlwiXG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2V4YW1wbGUtY29uZmlnJywgKGtleSwgb3B0aW9uLCBvcHRpb25zKSAtPlxuICByZXN1bHRzID0gZXhhbXBsZUNvbmZpZyhrZXksIG9wdGlvbilcbiAgIyBjb25zb2xlLmxvZyhyZXN1bHRzKVxuICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyhyZXN1bHRzKVxuKVxuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdsYW5ndWFnZS1iZWF1dGlmaWVycy1zdXBwb3J0JywgKGxhbmd1YWdlT3B0aW9ucywgb3B0aW9ucykgLT5cblxuICByb3dzID0gXy5jaGFpbihsYW5ndWFnZU9wdGlvbnMpXG4gICAgLmZpbHRlcigodmFsLCBrKSAtPiBrIGlzbnQgXCJleGVjdXRhYmxlc1wiKVxuICAgIC5tYXAoKHZhbCwgaykgLT5cbiAgICAgIG5hbWUgPSB2YWwudGl0bGVcbiAgICAgIGRlZmF1bHRCZWF1dGlmaWVyID0gXy5nZXQodmFsLCBcInByb3BlcnRpZXMuZGVmYXVsdF9iZWF1dGlmaWVyLmRlZmF1bHRcIilcbiAgICAgIGJlYXV0aWZpZXJzID0gXy5jaGFpbih2YWwuYmVhdXRpZmllcnMpXG4gICAgICAgIC5zb3J0QnkoKVxuICAgICAgICAuc29ydEJ5KChiKSAtPlxuICAgICAgICAgIGJlYXV0aWZpZXIgPSBiZWF1dGlmaWVyc01hcFtiXVxuICAgICAgICAgIGlzRGVmYXVsdCA9IGIgaXMgZGVmYXVsdEJlYXV0aWZpZXJcbiAgICAgICAgICByZXR1cm4gIWlzRGVmYXVsdFxuICAgICAgICApXG4gICAgICAgIC5tYXAoKGIpIC0+XG4gICAgICAgICAgYmVhdXRpZmllciA9IGJlYXV0aWZpZXJzTWFwW2JdXG4gICAgICAgICAgaXNEZWZhdWx0ID0gYiBpcyBkZWZhdWx0QmVhdXRpZmllclxuICAgICAgICAgIGlmIGJlYXV0aWZpZXIubGlua1xuICAgICAgICAgICAgciA9IFwiW2Aje2J9YF0oI3tiZWF1dGlmaWVyLmxpbmt9KVwiXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgciA9IFwiYCN7Yn1gXCJcbiAgICAgICAgICBpZiBpc0RlZmF1bHRcbiAgICAgICAgICAgIHIgPSBcIioqI3tyfSoqXCJcbiAgICAgICAgICByZXR1cm4gclxuICAgICAgICApXG4gICAgICAgIC52YWx1ZSgpXG4gICAgICBncmFtbWFycyA9IF8ubWFwKHZhbC5ncmFtbWFycywgKGIpIC0+IFwiYCN7Yn1gXCIpXG4gICAgICBleHRlbnNpb25zID0gXy5tYXAodmFsLmV4dGVuc2lvbnMsIChiKSAtPiBcImAuI3tifWBcIilcblxuICAgICAgcmV0dXJuIFwifCAje25hbWV9IHwgI3tncmFtbWFycy5qb2luKCcsICcpfSB8I3tleHRlbnNpb25zLmpvaW4oJywgJyl9IHwgI3tiZWF1dGlmaWVycy5qb2luKCcsICcpfSB8XCJcbiAgICApXG4gICAgLnZhbHVlKClcbiAgcmVzdWx0cyA9IFwiXCJcIlxuICB8IExhbmd1YWdlIHwgR3JhbW1hcnMgfCBGaWxlIEV4dGVuc2lvbnMgfCBTdXBwb3J0ZWQgQmVhdXRpZmllcnMgfFxuICB8IC0tLSB8IC0tLSB8IC0tLSB8IC0tLS0gfFxuICAje3Jvd3Muam9pbignXFxuJyl9XG4gIFwiXCJcIlxuICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyhyZXN1bHRzKVxuKVxuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdsYW5ndWFnZS1vcHRpb25zLXN1cHBvcnQnLCAobGFuZ3VhZ2VPcHRpb25zLCBvcHRpb25zKSAtPlxuXG4gICMjI1xuICB8IE9wdGlvbiB8IFByZXR0eURpZmYgfCBKUy1CZWF1dGlmeSB8XG4gIHwgLS0tIHwgLS0tIHwgLS0tIHxcbiAgfCBgYnJhY2Vfc3R5bGVgIHwgPyB8ID8gfFxuICB8IGBicmVha19jaGFpbmVkX21ldGhvZHNgIHwgPyB8ID8gfFxuICB8IGBlbmRfd2l0aF9jb21tYWAgfCA/IHwgPyB8XG4gIHwgYGVuZF93aXRoX25ld2xpbmVgIHwgPyB8ID8gfFxuICB8IGBldmFsX2NvZGVgIHwgPyB8ID8gfFxuICB8IGBpbmRlbnRfc2l6ZWAgfCA6d2hpdGVfY2hlY2tfbWFyazogfCA6d2hpdGVfY2hlY2tfbWFyazogfFxuICB8IGBpbmRlbnRfY2hhcmAgfCA6d2hpdGVfY2hlY2tfbWFyazogfCA6d2hpdGVfY2hlY2tfbWFyazogfFxuICAjIyNcblxuICByb3dzID0gW11cbiAgYmVhdXRpZmllcnMgPSBsYW5ndWFnZU9wdGlvbnMuYmVhdXRpZmllcnMuc29ydCgpXG4gIGhlYWRlcnMgPSBbJ09wdGlvbiddLmNvbmNhdChiZWF1dGlmaWVycylcbiAgcm93cy5wdXNoKGhlYWRlcnMpXG4gIHJvd3MucHVzaChfLm1hcChoZWFkZXJzLCAoKSAtPiAnLS0tJykpXG4gICMgY29uc29sZS5sb2cobGFuZ3VhZ2VPcHRpb25zKVxuICBfLmVhY2goT2JqZWN0LmtleXMobGFuZ3VhZ2VPcHRpb25zLnByb3BlcnRpZXMpLCAob3ApIC0+XG4gICAgZmllbGQgPSBsYW5ndWFnZU9wdGlvbnMucHJvcGVydGllc1tvcF1cbiAgICBzdXBwb3J0ID0gXy5tYXAoYmVhdXRpZmllcnMsIChiKSAtPlxuICAgICAgaWYgKF8uaW5jbHVkZXMoZmllbGQuYmVhdXRpZmllcnMsIGIpIG9yIF8uaW5jbHVkZXMoW1wiZGlzYWJsZWRcIiwgXCJkZWZhdWx0X2JlYXV0aWZpZXJcIiwgXCJiZWF1dGlmeV9vbl9zYXZlXCJdLCBvcCkpXG4gICAgICAgIHJldHVybiAnOndoaXRlX2NoZWNrX21hcms6J1xuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gJzp4OidcbiAgICApXG4gICAgcm93cy5wdXNoKFtcImAje29wfWBcIl0uY29uY2F0KHN1cHBvcnQpKVxuICApXG5cbiAgcmVzdWx0cyA9IF8ubWFwKHJvd3MsIChyKSAtPiBcInwgI3tyLmpvaW4oJyB8ICcpfSB8XCIpLmpvaW4oJ1xcbicpXG4gIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKHJlc3VsdHMpXG4pXG5cblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYmVhdXRpZmllcnMtaW5mbycsIChiZWF1dGlmaWVycywgb3B0aW9ucykgLT5cblxuICAjIyNcbiAgfCBCZWF1dGlmaWVyIHwgUHJlaW5zdGFsbGVkPyB8IEluc3RhbGxhdGlvbiBJbnN0cnVjdGlvbnMgfFxuICB8IC0tLSB8IC0tLS0gfFxuICB8IFByZXR0eSBEaWZmIHwgOndoaXRlX2NoZWNrX21hcms6IHwgTi9BIHxcbiAgfCBBdXRvUEVQOCB8IDp4OiB8IExJTksgfFxuICAjIyNcblxuICByb3dzID0gXy5tYXAoYmVhdXRpZmllcnMsIChiZWF1dGlmaWVyLCBrKSAtPlxuICAgIG5hbWUgPSBiZWF1dGlmaWVyLm5hbWVcbiAgICBpc1ByZUluc3RhbGxlZCA9IGJlYXV0aWZpZXIuaXNQcmVJbnN0YWxsZWRcbiAgICBpZiB0eXBlb2YgaXNQcmVJbnN0YWxsZWQgaXMgXCJmdW5jdGlvblwiXG4gICAgICBpc1ByZUluc3RhbGxlZCA9IGJlYXV0aWZpZXIuaXNQcmVJbnN0YWxsZWQoKVxuICAgIGxpbmsgPSBiZWF1dGlmaWVyLmxpbmtcbiAgICBleGVjdXRhYmxlcyA9IGJlYXV0aWZpZXIuZXhlY3V0YWJsZXMgb3IgW11cbiAgICBoYXNFeGVjdXRhYmxlcyA9IGV4ZWN1dGFibGVzLmxlbmd0aCA+IDBcbiAgICBkb2NrZXJFeGVjdXRhYmxlcyA9IGV4ZWN1dGFibGVzLmZpbHRlcigoZXhlKSAtPiAhIWV4ZS5kb2NrZXIpXG4gICAgaGFzRG9ja2VyRXhlY3V0YWJsZXMgPSBkb2NrZXJFeGVjdXRhYmxlcy5sZW5ndGggPiAwXG4gICAgaW5zdGFsbFdpdGhEb2NrZXIgPSBkb2NrZXJFeGVjdXRhYmxlcy5tYXAoKGQpIC0+IFwiLSAje2QuZG9ja2VyLmltYWdlfVwiKS5qb2luKCdcXG4nKVxuXG4gICAgcHJlaW5zdGFsbGVkQ2VsbCA9IGRvICgoKSAtPlxuICAgICAgaWYgaXNQcmVJbnN0YWxsZWRcbiAgICAgICAgXCI6d2hpdGVfY2hlY2tfbWFyazpcIlxuICAgICAgZWxzZVxuICAgICAgICBpZiBleGVjdXRhYmxlcy5sZW5ndGggPiAwXG4gICAgICAgICAgXCI6d2FybmluZzogI3tleGVjdXRhYmxlcy5sZW5ndGh9IGV4ZWN1dGFibGUje2lmIGV4ZWN1dGFibGVzLmxlbmd0aCBpcyAxIHRoZW4gJycgZWxzZSAncyd9XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFwiOndhcm5pbmc6IE1hbnVhbCBpbnN0YWxsYXRpb25cIlxuICAgIClcbiAgICBkb2NrZXJDZWxsID0gZG8gKCgpIC0+XG4gICAgICBpZiBpc1ByZUluc3RhbGxlZFxuICAgICAgICBcIjpva19oYW5kOiBOb3QgbmVjZXNzYXJ5XCJcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgaGFzRXhlY3V0YWJsZXNcbiAgICAgICAgICBpZiBkb2NrZXJFeGVjdXRhYmxlcy5sZW5ndGggaXMgZXhlY3V0YWJsZXMubGVuZ3RoXG4gICAgICAgICAgICBcIjp3aGl0ZV9jaGVja19tYXJrOiA6MTAwOiUgb2YgZXhlY3V0YWJsZXNcIlxuICAgICAgICAgIGVsc2UgaWYgZG9ja2VyRXhlY3V0YWJsZXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgXCI6d2FybmluZzogT25seSAje2RvY2tlckV4ZWN1dGFibGVzLmxlbmd0aH0gb2YgI3tleGVjdXRhYmxlcy5sZW5ndGh9IGV4ZWN1dGFibGVzXCJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBcIjp4OiBObyBEb2NrZXIgc3VwcG9ydFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBcIjpjb25zdHJ1Y3Rpb246IE5vdCBhbiBleGVjdXRhYmxlXCJcbiAgICApXG4gICAgaW5zdGFsbGF0aW9uSW5zdHJ1Y3Rpb25zID0gZG8gKCgpIC0+XG4gICAgICBpZiBpc1ByZUluc3RhbGxlZFxuICAgICAgICBcIjpzbWlsZXk6IE5vdGhpbmchXCJcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgaGFzRXhlY3V0YWJsZXNcbiAgICAgICAgICBleGVjdXRhYmxlc0luc3RhbGxhdGlvbiA9IFwiXCJcbiAgICAgICAgICBpZiBoYXNEb2NrZXJFeGVjdXRhYmxlc1xuICAgICAgICAgICAgZXhlY3V0YWJsZXNJbnN0YWxsYXRpb24gKz0gXCI6d2hhbGU6IFdpdGggW0RvY2tlcl0oaHR0cHM6Ly93d3cuZG9ja2VyLmNvbS8pOjxici8+XCJcbiAgICAgICAgICAgIGRvY2tlckV4ZWN1dGFibGVzLmZvckVhY2goKGUsIGkpIC0+XG4gICAgICAgICAgICAgIGV4ZWN1dGFibGVzSW5zdGFsbGF0aW9uICs9IFwiI3tpKzF9LiBJbnN0YWxsIFsje2UubmFtZSBvciBlLmNtZH0gKGAje2UuY21kfWApXSgje2UuaG9tZXBhZ2V9KSB3aXRoIGBkb2NrZXIgcHVsbCAje2UuZG9ja2VyLmltYWdlfWA8YnIvPlwiXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBleGVjdXRhYmxlc0luc3RhbGxhdGlvbiArPSBcIjxici8+XCJcbiAgICAgICAgICBleGVjdXRhYmxlc0luc3RhbGxhdGlvbiArPSBcIjpib29rbWFya190YWJzOiBNYW51YWxseTo8YnIvPlwiXG4gICAgICAgICAgZXhlY3V0YWJsZXMuZm9yRWFjaCgoZSwgaSkgLT5cbiAgICAgICAgICAgIGV4ZWN1dGFibGVzSW5zdGFsbGF0aW9uICs9IFwiI3tpKzF9LiBJbnN0YWxsIFsje2UubmFtZSBvciBlLmNtZH0gKGAje2UuY21kfWApXSgje2UuaG9tZXBhZ2V9KSBieSBmb2xsb3dpbmcgI3tlLmluc3RhbGxhdGlvbn08YnIvPlwiXG4gICAgICAgICAgKVxuICAgICAgICAgIHJldHVybiBleGVjdXRhYmxlc0luc3RhbGxhdGlvblxuICAgICAgICBlbHNlXG4gICAgICAgICAgXCI6cGFnZV9mYWNpbmdfdXA6IEdvIHRvICN7bGlua30gYW5kIGZvbGxvdyB0aGUgaW5zdHJ1Y3Rpb25zLlwiXG4gICAgKVxuICAgIHJldHVybiBcInwgI3tuYW1lfSB8ICN7cHJlaW5zdGFsbGVkQ2VsbH0gfCAje2RvY2tlckNlbGx9IHwgI3tpbnN0YWxsYXRpb25JbnN0cnVjdGlvbnN9IHxcIlxuICApXG4gIHJlc3VsdHMgPSBcIlwiXCJcbiAgfCBCZWF1dGlmaWVyIHwgUHJlaW5zdGFsbGVkIHwgWzp3aGFsZTogRG9ja2VyXShodHRwczovL3d3dy5kb2NrZXIuY29tLykgfCBJbnN0YWxsYXRpb24gfFxuICB8IC0tLSB8IC0tLSB8IC0tLSB8LS0tIHxcbiAgI3tyb3dzLmpvaW4oJ1xcbicpfVxuICBcIlwiXCJcbiAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcocmVzdWx0cylcbilcblxuc29ydEtleXNCeSA9IChvYmosIGNvbXBhcmF0b3IpIC0+XG4gIGtleXMgPSBfLnNvcnRCeShfLmtleXMob2JqKSwgKGtleSkgLT5cbiAgICByZXR1cm4gaWYgY29tcGFyYXRvciB0aGVuIGNvbXBhcmF0b3Iob2JqW2tleV0sIGtleSkgZWxzZSBrZXlcbiAgKVxuICByZXR1cm4gXy56aXBPYmplY3Qoa2V5cywgXy5tYXAoa2V5cywgKGtleSkgLT5cbiAgICByZXR1cm4gb2JqW2tleV1cbiAgKSlcblxuc29ydFNldHRpbmdzID0gKHNldHRpbmdzKSAtPlxuICAjIFRPRE86IFByb2Nlc3Mgb2JqZWN0IHR5cGUgb3B0aW9uc1xuICByID0gXy5tYXBWYWx1ZXMoc2V0dGluZ3MsIChvcCkgLT5cbiAgICBpZiBvcC50eXBlIGlzIFwib2JqZWN0XCIgYW5kIG9wLnByb3BlcnRpZXNcbiAgICAgIG9wLnByb3BlcnRpZXMgPSBzb3J0U2V0dGluZ3Mob3AucHJvcGVydGllcylcbiAgICByZXR1cm4gb3BcbiAgKVxuICAjIFByb2Nlc3MgdGhlc2Ugc2V0dGluZ3NcbiAgciA9IHNvcnRLZXlzQnkoc29ydEtleXNCeShyKSwgKG9wKSAtPiBvcC5vcmRlcilcbiAgIyByID0gXy5jaGFpbihyKS5zb3J0QnkoKG9wKSAtPiBvcC5rZXkpLnNvcnRCeSgob3ApIC0+IHNldHRpbmdzW29wLmtleV0/Lm9yZGVyKS52YWx1ZSgpXG4gICMgY29uc29sZS5sb2coJ3NvcnQnLCBzZXR0aW5ncywgcilcbiAgcmV0dXJuIHJcblxuY29udGV4dCA9IHtcbiAgcGFja2FnZTogcGtnLFxuICBwYWNrYWdlT3B0aW9uczogc29ydFNldHRpbmdzKHBhY2thZ2VPcHRpb25zKVxuICBsYW5ndWFnZU9wdGlvbnM6IHNvcnRTZXR0aW5ncyhsYW5ndWFnZU9wdGlvbnMpXG4gIGJlYXV0aWZpZXJPcHRpb25zOiBzb3J0U2V0dGluZ3MoYmVhdXRpZmllck9wdGlvbnMpXG4gIGJlYXV0aWZpZXJzOiBfLnNvcnRCeShiZWF1dGlmaWVyLmJlYXV0aWZpZXJzLCAoYmVhdXRpZmllcikgLT4gYmVhdXRpZmllci5uYW1lLnRvTG93ZXJDYXNlKCkpXG59XG5yZXN1bHQgPSB0ZW1wbGF0ZShjb250ZXh0KVxucmVhZG1lUmVzdWx0ID0gcmVhZG1lVGVtcGxhdGUoY29udGV4dClcblxuY29uc29sZS5sb2coJ1dyaXRpbmcgZG9jdW1lbnRhdGlvbiB0byBmaWxlLi4uJylcbmZzLndyaXRlRmlsZVN5bmMob3B0aW9uc1BhdGgsIHJlc3VsdClcbmZzLndyaXRlRmlsZVN5bmMocmVhZG1lUGF0aCwgcmVhZG1lUmVzdWx0KVxuIyBmcy53cml0ZUZpbGVTeW5jKF9fZGlybmFtZSsnL2NvbnRleHQuanNvbicsIEpTT04uc3RyaW5naWZ5KGNvbnRleHQsIHVuZGVmaW5lZCwgMikpXG5cbmNvbnNvbGUubG9nKCdVcGRhdGluZyBwYWNrYWdlLmpzb24nKVxuIyBBZGQgTGFuZ3VhZ2Uga2V5d29yZHNcbmxhbmd1YWdlTmFtZXMgPSBfLm1hcChPYmplY3Qua2V5cyhsYW5ndWFnZXNNYXApLCAoYSktPmEudG9Mb3dlckNhc2UoKSlcblxuIyBBZGQgQmVhdXRpZmllciBrZXl3b3Jkc1xuYmVhdXRpZmllck5hbWVzID0gXy5tYXAoT2JqZWN0LmtleXMoYmVhdXRpZmllcnNNYXApLCAoYSktPmEudG9Mb3dlckNhc2UoKSlcbmtleXdvcmRzID0gXy51bmlvbihwa2cua2V5d29yZHMsIGxhbmd1YWdlTmFtZXMsIGJlYXV0aWZpZXJOYW1lcylcbnBrZy5rZXl3b3JkcyA9IGtleXdvcmRzXG5cbiMgQWRkIExhbmd1YWdlLXNwZWNpZmljIGJlYXV0aWZ5IGNvbW1hbmRzXG5iZWF1dGlmeUxhbmd1YWdlQ29tbWFuZHMgPSBfLm1hcChsYW5ndWFnZU5hbWVzLCAobGFuZ3VhZ2VOYW1lKSAtPiBcImF0b20tYmVhdXRpZnk6YmVhdXRpZnktbGFuZ3VhZ2UtI3tsYW5ndWFnZU5hbWV9XCIpXG5wa2cuYWN0aXZhdGlvbkNvbW1hbmRzW1wiYXRvbS13b3Jrc3BhY2VcIl0gPSBfLnVuaW9uKHBrZy5hY3RpdmF0aW9uQ29tbWFuZHNbXCJhdG9tLXdvcmtzcGFjZVwiXSwgYmVhdXRpZnlMYW5ndWFnZUNvbW1hbmRzKVxuXG5mcy53cml0ZUZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsJy4uL3BhY2thZ2UuanNvbicpLCBKU09OLnN0cmluZ2lmeShwa2csIHVuZGVmaW5lZCwgMikpXG5cbmNvbnNvbGUubG9nKCdEb25lLicpXG4iXX0=
