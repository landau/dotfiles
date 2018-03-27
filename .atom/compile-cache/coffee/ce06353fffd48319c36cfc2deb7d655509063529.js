(function() {
  var Beautifiers, Handlebars, _, beautifier, beautifierName, beautifierNames, beautifierOptions, beautifiers, beautifiersMap, beautifyLanguageCommands, context, exampleConfig, fs, i, keywords, languageNames, languageOptions, languagesMap, len, linkifyTitle, lo, optionDef, optionGroup, optionGroupTemplate, optionGroupTemplatePath, optionName, optionTemplate, optionTemplatePath, optionsPath, optionsTemplate, optionsTemplatePath, packageOptions, path, pkg, readmePath, readmeResult, readmeTemplate, readmeTemplatePath, ref, ref1, result, sortKeysBy, sortSettings, template;

  Handlebars = require('handlebars');

  Beautifiers = require("../src/beautifiers");

  fs = require('fs');

  _ = require('lodash');

  path = require('path');

  pkg = require('../package.json');

  console.log('Generating options...');

  beautifier = new Beautifiers();

  languageOptions = beautifier.options;

  packageOptions = require('../src/config.coffee');

  beautifiersMap = _.keyBy(beautifier.beautifiers, 'name');

  languagesMap = _.keyBy(beautifier.languages.languages, 'name');

  beautifierOptions = {};

  for (lo in languageOptions) {
    optionGroup = languageOptions[lo];
    ref = optionGroup.properties;
    for (optionName in ref) {
      optionDef = ref[optionName];
      beautifiers = (ref1 = optionDef.beautifiers) != null ? ref1 : [];
      for (i = 0, len = beautifiers.length; i < len; i++) {
        beautifierName = beautifiers[i];
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
    rows = _.map(languageOptions, function(val, k) {
      var defaultBeautifier, extensions, grammars, name;
      name = val.title;
      defaultBeautifier = _.get(val, "properties.default_beautifier.default");
      beautifiers = _.map(val.beautifiers, function(b) {
        var isDefault, r;
        beautifier = beautifiersMap[b];
        isDefault = b === defaultBeautifier;
        if (beautifier.link) {
          r = "[`" + b + "`](" + beautifier.link + ")";
        } else {
          r = "`" + b + "`";
        }
        if (isDefault) {
          r += " (Default)";
        }
        return r;
      });
      grammars = _.map(val.grammars, function(b) {
        return "`" + b + "`";
      });
      extensions = _.map(val.extensions, function(b) {
        return "`." + b + "`";
      });
      return "| " + name + " | " + (grammars.join(', ')) + " |" + (extensions.join(', ')) + " | " + (beautifiers.join(', ')) + " |";
    });
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
    | Beautifier | Is Pre-Installed? | Installation Instructions |
    | --- | ---- |
    | Pretty Diff | :white_check_mark: | N/A |
    | AutoPEP8 | :x: | LINK |
     */
    var results, rows;
    rows = _.map(beautifiers, function(beautifier, k) {
      var installationInstructions, isPreInstalled, link, name;
      name = beautifier.name;
      isPreInstalled = beautifier.isPreInstalled;
      link = beautifier.link;
      installationInstructions = isPreInstalled ? "Nothing!" : "Go to " + link + " and follow the instructions.";
      return "| " + name + " | " + (isPreInstalled ? ':white_check_mark:' : ':x:') + " | " + installationInstructions + " |";
    });
    results = "| Beautifier | Is Pre-Installed? | Installation Instructions |\n| --- | --- | --- |\n" + (rows.join('\n'));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9kb2NzL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQTtBQUFBLE1BQUE7O0VBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSOztFQUNiLFdBQUEsR0FBYyxPQUFBLENBQVEsb0JBQVI7O0VBQ2QsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsR0FBQSxHQUFNLE9BQUEsQ0FBUSxpQkFBUjs7RUFFTixPQUFPLENBQUMsR0FBUixDQUFZLHVCQUFaOztFQUNBLFVBQUEsR0FBaUIsSUFBQSxXQUFBLENBQUE7O0VBQ2pCLGVBQUEsR0FBa0IsVUFBVSxDQUFDOztFQUM3QixjQUFBLEdBQWlCLE9BQUEsQ0FBUSxzQkFBUjs7RUFFakIsY0FBQSxHQUFpQixDQUFDLENBQUMsS0FBRixDQUFRLFVBQVUsQ0FBQyxXQUFuQixFQUFnQyxNQUFoQzs7RUFDakIsWUFBQSxHQUFlLENBQUMsQ0FBQyxLQUFGLENBQVEsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUE3QixFQUF3QyxNQUF4Qzs7RUFDZixpQkFBQSxHQUFvQjs7QUFDcEIsT0FBQSxxQkFBQTs7QUFDRTtBQUFBLFNBQUEsaUJBQUE7O01BQ0UsV0FBQSxtREFBc0M7QUFDdEMsV0FBQSw2Q0FBQTs7O1VBQ0UsaUJBQWtCLENBQUEsY0FBQSxJQUFtQjs7UUFDckMsaUJBQWtCLENBQUEsY0FBQSxDQUFnQixDQUFBLFVBQUEsQ0FBbEMsR0FBZ0Q7QUFGbEQ7QUFGRjtBQURGOztFQU9BLE9BQU8sQ0FBQyxHQUFSLENBQVksNkJBQVo7O0VBQ0Esa0JBQUEsR0FBcUIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLHVCQUF4Qjs7RUFDckIsVUFBQSxH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ZVxuXG4jIERlcGVuZGVuY2llc1xuSGFuZGxlYmFycyA9IHJlcXVpcmUoJ2hhbmRsZWJhcnMnKVxuQmVhdXRpZmllcnMgPSByZXF1aXJlKFwiLi4vc3JjL2JlYXV0aWZpZXJzXCIpXG5mcyA9IHJlcXVpcmUoJ2ZzJylcbl8gPSByZXF1aXJlKCdsb2Rhc2gnKVxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxucGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJylcblxuY29uc29sZS5sb2coJ0dlbmVyYXRpbmcgb3B0aW9ucy4uLicpXG5iZWF1dGlmaWVyID0gbmV3IEJlYXV0aWZpZXJzKClcbmxhbmd1YWdlT3B0aW9ucyA9IGJlYXV0aWZpZXIub3B0aW9uc1xucGFja2FnZU9wdGlvbnMgPSByZXF1aXJlKCcuLi9zcmMvY29uZmlnLmNvZmZlZScpXG4jIEJ1aWxkIG9wdGlvbnMgYnkgQmVhdXRpZmllclxuYmVhdXRpZmllcnNNYXAgPSBfLmtleUJ5KGJlYXV0aWZpZXIuYmVhdXRpZmllcnMsICduYW1lJylcbmxhbmd1YWdlc01hcCA9IF8ua2V5QnkoYmVhdXRpZmllci5sYW5ndWFnZXMubGFuZ3VhZ2VzLCAnbmFtZScpXG5iZWF1dGlmaWVyT3B0aW9ucyA9IHt9XG5mb3IgbG8sIG9wdGlvbkdyb3VwIG9mIGxhbmd1YWdlT3B0aW9uc1xuICBmb3Igb3B0aW9uTmFtZSwgb3B0aW9uRGVmIG9mIG9wdGlvbkdyb3VwLnByb3BlcnRpZXNcbiAgICBiZWF1dGlmaWVycyA9IG9wdGlvbkRlZi5iZWF1dGlmaWVycyA/IFtdXG4gICAgZm9yIGJlYXV0aWZpZXJOYW1lIGluIGJlYXV0aWZpZXJzXG4gICAgICBiZWF1dGlmaWVyT3B0aW9uc1tiZWF1dGlmaWVyTmFtZV0gPz0ge31cbiAgICAgIGJlYXV0aWZpZXJPcHRpb25zW2JlYXV0aWZpZXJOYW1lXVtvcHRpb25OYW1lXSA9IG9wdGlvbkRlZlxuXG5jb25zb2xlLmxvZygnTG9hZGluZyBvcHRpb25zIHRlbXBsYXRlLi4uJylcbnJlYWRtZVRlbXBsYXRlUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9SRUFETUUtdGVtcGxhdGUubWQnKVxucmVhZG1lUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9SRUFETUUubWQnKVxub3B0aW9uc1RlbXBsYXRlUGF0aCA9IF9fZGlybmFtZSArICcvb3B0aW9ucy10ZW1wbGF0ZS5tZCdcbm9wdGlvblRlbXBsYXRlUGF0aCA9IF9fZGlybmFtZSArICcvb3B0aW9uLXRlbXBsYXRlLm1kJ1xub3B0aW9uR3JvdXBUZW1wbGF0ZVBhdGggPSBfX2Rpcm5hbWUgKyAnL29wdGlvbi1ncm91cC10ZW1wbGF0ZS5tZCdcbm9wdGlvbnNQYXRoID0gX19kaXJuYW1lICsgJy9vcHRpb25zLm1kJ1xuXG5vcHRpb25zVGVtcGxhdGUgPSBmcy5yZWFkRmlsZVN5bmMob3B0aW9uc1RlbXBsYXRlUGF0aCkudG9TdHJpbmcoKVxub3B0aW9uR3JvdXBUZW1wbGF0ZSA9IGZzLnJlYWRGaWxlU3luYyhvcHRpb25Hcm91cFRlbXBsYXRlUGF0aCkudG9TdHJpbmcoKVxub3B0aW9uVGVtcGxhdGUgPSBmcy5yZWFkRmlsZVN5bmMob3B0aW9uVGVtcGxhdGVQYXRoKS50b1N0cmluZygpXG5yZWFkbWVUZW1wbGF0ZSA9IGZzLnJlYWRGaWxlU3luYyhyZWFkbWVUZW1wbGF0ZVBhdGgpLnRvU3RyaW5nKClcblxuY29uc29sZS5sb2coJ0J1aWxkaW5nIGRvY3VtZW50YXRpb24gZnJvbSB0ZW1wbGF0ZSBhbmQgb3B0aW9ucy4uLicpXG5IYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCgnb3B0aW9uJywgb3B0aW9uVGVtcGxhdGUpXG5IYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCgnb3B0aW9uLWdyb3VwJywgb3B0aW9uR3JvdXBUZW1wbGF0ZSlcbnRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKG9wdGlvbnNUZW1wbGF0ZSlcbnJlYWRtZVRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKHJlYWRtZVRlbXBsYXRlKVxuXG5saW5raWZ5VGl0bGUgPSAodGl0bGUpIC0+XG4gIHRpdGxlID0gdGl0bGUudG9Mb3dlckNhc2UoKVxuICBwID0gdGl0bGUuc3BsaXQoL1tcXHMsKyM7LFxcLz86QCY9KyRdKy8pICMgc3BsaXQgaW50byBwYXJ0c1xuICBzZXAgPSBcIi1cIlxuICBwLmpvaW4oc2VwKVxuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdsaW5raWZ5JywgKHRpdGxlLCBvcHRpb25zKSAtPlxuICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyhcbiAgICBcIlsje29wdGlvbnMuZm4odGhpcyl9XShcXCMje2xpbmtpZnlUaXRsZSh0aXRsZSl9KVwiXG4gIClcbilcblxuZXhhbXBsZUNvbmZpZyA9IChvcHRpb24pIC0+XG4gICMgY29uc29sZS5sb2cob3B0aW9uKVxuICB0ID0gb3B0aW9uLnR5cGVcbiAgZCA9IHN3aXRjaFxuICAgIHdoZW4gb3B0aW9uLmRlZmF1bHQ/IHRoZW4gb3B0aW9uLmRlZmF1bHRcbiAgICB3aGVuIHQgaXMgXCJzdHJpbmdcIiB0aGVuIFwiXCJcbiAgICB3aGVuIHQgaXMgXCJpbnRlZ2VyXCIgdGhlbiAwXG4gICAgd2hlbiB0IGlzIFwiYm9vbGVhblwiIHRoZW4gZmFsc2VcbiAgICBlbHNlIG51bGxcblxuICBqc29uID0ge31cbiAgbmFtZXNwYWNlID0gb3B0aW9uLmxhbmd1YWdlLm5hbWVzcGFjZVxuICBrID0gb3B0aW9uLmtleVxuICBjID0ge31cbiAgY1trXSA9IGRcbiAganNvbltuYW1lc3BhY2VdID0gY1xuICByZXR1cm4gXCJcIlwiYGBganNvblxuICAje0pTT04uc3RyaW5naWZ5KGpzb24sIHVuZGVmaW5lZCwgNCl9XG4gIGBgYFwiXCJcIlxuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdleGFtcGxlLWNvbmZpZycsIChrZXksIG9wdGlvbiwgb3B0aW9ucykgLT5cbiAgcmVzdWx0cyA9IGV4YW1wbGVDb25maWcoa2V5LCBvcHRpb24pXG4gICMgY29uc29sZS5sb2cocmVzdWx0cylcbiAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcocmVzdWx0cylcbilcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbGFuZ3VhZ2UtYmVhdXRpZmllcnMtc3VwcG9ydCcsIChsYW5ndWFnZU9wdGlvbnMsIG9wdGlvbnMpIC0+XG5cbiAgcm93cyA9IF8ubWFwKGxhbmd1YWdlT3B0aW9ucywgKHZhbCwgaykgLT5cbiAgICBuYW1lID0gdmFsLnRpdGxlXG4gICAgZGVmYXVsdEJlYXV0aWZpZXIgPSBfLmdldCh2YWwsIFwicHJvcGVydGllcy5kZWZhdWx0X2JlYXV0aWZpZXIuZGVmYXVsdFwiKVxuICAgIGJlYXV0aWZpZXJzID0gXy5tYXAodmFsLmJlYXV0aWZpZXJzLCAoYikgLT5cbiAgICAgIGJlYXV0aWZpZXIgPSBiZWF1dGlmaWVyc01hcFtiXVxuICAgICAgaXNEZWZhdWx0ID0gYiBpcyBkZWZhdWx0QmVhdXRpZmllclxuICAgICAgaWYgYmVhdXRpZmllci5saW5rXG4gICAgICAgIHIgPSBcIltgI3tifWBdKCN7YmVhdXRpZmllci5saW5rfSlcIlxuICAgICAgZWxzZVxuICAgICAgICByID0gXCJgI3tifWBcIlxuICAgICAgaWYgaXNEZWZhdWx0XG4gICAgICAgIHIgKz0gXCIgKERlZmF1bHQpXCJcbiAgICAgIHJldHVybiByXG4gICAgKVxuICAgIGdyYW1tYXJzID0gXy5tYXAodmFsLmdyYW1tYXJzLCAoYikgLT4gXCJgI3tifWBcIilcbiAgICBleHRlbnNpb25zID0gXy5tYXAodmFsLmV4dGVuc2lvbnMsIChiKSAtPiBcImAuI3tifWBcIilcblxuICAgIHJldHVybiBcInwgI3tuYW1lfSB8ICN7Z3JhbW1hcnMuam9pbignLCAnKX0gfCN7ZXh0ZW5zaW9ucy5qb2luKCcsICcpfSB8ICN7YmVhdXRpZmllcnMuam9pbignLCAnKX0gfFwiXG4gIClcbiAgcmVzdWx0cyA9IFwiXCJcIlxuICB8IExhbmd1YWdlIHwgR3JhbW1hcnMgfCBGaWxlIEV4dGVuc2lvbnMgfCBTdXBwb3J0ZWQgQmVhdXRpZmllcnMgfFxuICB8IC0tLSB8IC0tLSB8IC0tLSB8IC0tLS0gfFxuICAje3Jvd3Muam9pbignXFxuJyl9XG4gIFwiXCJcIlxuICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyhyZXN1bHRzKVxuKVxuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdsYW5ndWFnZS1vcHRpb25zLXN1cHBvcnQnLCAobGFuZ3VhZ2VPcHRpb25zLCBvcHRpb25zKSAtPlxuXG4gICMjI1xuICB8IE9wdGlvbiB8IFByZXR0eURpZmYgfCBKUy1CZWF1dGlmeSB8XG4gIHwgLS0tIHwgLS0tIHwgLS0tIHxcbiAgfCBgYnJhY2Vfc3R5bGVgIHwgPyB8ID8gfFxuICB8IGBicmVha19jaGFpbmVkX21ldGhvZHNgIHwgPyB8ID8gfFxuICB8IGBlbmRfd2l0aF9jb21tYWAgfCA/IHwgPyB8XG4gIHwgYGVuZF93aXRoX25ld2xpbmVgIHwgPyB8ID8gfFxuICB8IGBldmFsX2NvZGVgIHwgPyB8ID8gfFxuICB8IGBpbmRlbnRfc2l6ZWAgfCA6d2hpdGVfY2hlY2tfbWFyazogfCA6d2hpdGVfY2hlY2tfbWFyazogfFxuICB8IGBpbmRlbnRfY2hhcmAgfCA6d2hpdGVfY2hlY2tfbWFyazogfCA6d2hpdGVfY2hlY2tfbWFyazogfFxuICAjIyNcblxuICByb3dzID0gW11cbiAgYmVhdXRpZmllcnMgPSBsYW5ndWFnZU9wdGlvbnMuYmVhdXRpZmllcnMuc29ydCgpXG4gIGhlYWRlcnMgPSBbJ09wdGlvbiddLmNvbmNhdChiZWF1dGlmaWVycylcbiAgcm93cy5wdXNoKGhlYWRlcnMpXG4gIHJvd3MucHVzaChfLm1hcChoZWFkZXJzLCAoKSAtPiAnLS0tJykpXG4gICMgY29uc29sZS5sb2cobGFuZ3VhZ2VPcHRpb25zKVxuICBfLmVhY2goT2JqZWN0LmtleXMobGFuZ3VhZ2VPcHRpb25zLnByb3BlcnRpZXMpLCAob3ApIC0+XG4gICAgZmllbGQgPSBsYW5ndWFnZU9wdGlvbnMucHJvcGVydGllc1tvcF1cbiAgICBzdXBwb3J0ID0gXy5tYXAoYmVhdXRpZmllcnMsIChiKSAtPlxuICAgICAgaWYgKF8uaW5jbHVkZXMoZmllbGQuYmVhdXRpZmllcnMsIGIpIG9yIF8uaW5jbHVkZXMoW1wiZGlzYWJsZWRcIiwgXCJkZWZhdWx0X2JlYXV0aWZpZXJcIiwgXCJiZWF1dGlmeV9vbl9zYXZlXCJdLCBvcCkpXG4gICAgICAgIHJldHVybiAnOndoaXRlX2NoZWNrX21hcms6J1xuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gJzp4OidcbiAgICApXG4gICAgcm93cy5wdXNoKFtcImAje29wfWBcIl0uY29uY2F0KHN1cHBvcnQpKVxuICApXG5cbiAgcmVzdWx0cyA9IF8ubWFwKHJvd3MsIChyKSAtPiBcInwgI3tyLmpvaW4oJyB8ICcpfSB8XCIpLmpvaW4oJ1xcbicpXG4gIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKHJlc3VsdHMpXG4pXG5cblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYmVhdXRpZmllcnMtaW5mbycsIChiZWF1dGlmaWVycywgb3B0aW9ucykgLT5cblxuICAjIyNcbiAgfCBCZWF1dGlmaWVyIHwgSXMgUHJlLUluc3RhbGxlZD8gfCBJbnN0YWxsYXRpb24gSW5zdHJ1Y3Rpb25zIHxcbiAgfCAtLS0gfCAtLS0tIHxcbiAgfCBQcmV0dHkgRGlmZiB8IDp3aGl0ZV9jaGVja19tYXJrOiB8IE4vQSB8XG4gIHwgQXV0b1BFUDggfCA6eDogfCBMSU5LIHxcbiAgIyMjXG5cbiAgcm93cyA9IF8ubWFwKGJlYXV0aWZpZXJzLCAoYmVhdXRpZmllciwgaykgLT5cbiAgICBuYW1lID0gYmVhdXRpZmllci5uYW1lXG4gICAgaXNQcmVJbnN0YWxsZWQgPSBiZWF1dGlmaWVyLmlzUHJlSW5zdGFsbGVkXG4gICAgbGluayA9IGJlYXV0aWZpZXIubGlua1xuICAgIGluc3RhbGxhdGlvbkluc3RydWN0aW9ucyA9IGlmIGlzUHJlSW5zdGFsbGVkIHRoZW4gXCJOb3RoaW5nIVwiIGVsc2UgXCJHbyB0byAje2xpbmt9IGFuZCBmb2xsb3cgdGhlIGluc3RydWN0aW9ucy5cIlxuICAgIHJldHVybiBcInwgI3tuYW1lfSB8ICN7aWYgaXNQcmVJbnN0YWxsZWQgdGhlbiAnOndoaXRlX2NoZWNrX21hcms6JyBlbHNlICc6eDonfSB8ICN7aW5zdGFsbGF0aW9uSW5zdHJ1Y3Rpb25zfSB8XCJcbiAgKVxuICByZXN1bHRzID0gXCJcIlwiXG4gIHwgQmVhdXRpZmllciB8IElzIFByZS1JbnN0YWxsZWQ/IHwgSW5zdGFsbGF0aW9uIEluc3RydWN0aW9ucyB8XG4gIHwgLS0tIHwgLS0tIHwgLS0tIHxcbiAgI3tyb3dzLmpvaW4oJ1xcbicpfVxuICBcIlwiXCJcbiAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcocmVzdWx0cylcbilcblxuc29ydEtleXNCeSA9IChvYmosIGNvbXBhcmF0b3IpIC0+XG4gIGtleXMgPSBfLnNvcnRCeShfLmtleXMob2JqKSwgKGtleSkgLT5cbiAgICByZXR1cm4gaWYgY29tcGFyYXRvciB0aGVuIGNvbXBhcmF0b3Iob2JqW2tleV0sIGtleSkgZWxzZSBrZXlcbiAgKVxuICByZXR1cm4gXy56aXBPYmplY3Qoa2V5cywgXy5tYXAoa2V5cywgKGtleSkgLT5cbiAgICByZXR1cm4gb2JqW2tleV1cbiAgKSlcblxuc29ydFNldHRpbmdzID0gKHNldHRpbmdzKSAtPlxuICAjIFRPRE86IFByb2Nlc3Mgb2JqZWN0IHR5cGUgb3B0aW9uc1xuICByID0gXy5tYXBWYWx1ZXMoc2V0dGluZ3MsIChvcCkgLT5cbiAgICBpZiBvcC50eXBlIGlzIFwib2JqZWN0XCIgYW5kIG9wLnByb3BlcnRpZXNcbiAgICAgIG9wLnByb3BlcnRpZXMgPSBzb3J0U2V0dGluZ3Mob3AucHJvcGVydGllcylcbiAgICByZXR1cm4gb3BcbiAgKVxuICAjIFByb2Nlc3MgdGhlc2Ugc2V0dGluZ3NcbiAgciA9IHNvcnRLZXlzQnkoc29ydEtleXNCeShyKSwgKG9wKSAtPiBvcC5vcmRlcilcbiAgIyByID0gXy5jaGFpbihyKS5zb3J0QnkoKG9wKSAtPiBvcC5rZXkpLnNvcnRCeSgob3ApIC0+IHNldHRpbmdzW29wLmtleV0/Lm9yZGVyKS52YWx1ZSgpXG4gICMgY29uc29sZS5sb2coJ3NvcnQnLCBzZXR0aW5ncywgcilcbiAgcmV0dXJuIHJcblxuY29udGV4dCA9IHtcbiAgcGFja2FnZTogcGtnLFxuICBwYWNrYWdlT3B0aW9uczogc29ydFNldHRpbmdzKHBhY2thZ2VPcHRpb25zKVxuICBsYW5ndWFnZU9wdGlvbnM6IHNvcnRTZXR0aW5ncyhsYW5ndWFnZU9wdGlvbnMpXG4gIGJlYXV0aWZpZXJPcHRpb25zOiBzb3J0U2V0dGluZ3MoYmVhdXRpZmllck9wdGlvbnMpXG4gIGJlYXV0aWZpZXJzOiBfLnNvcnRCeShiZWF1dGlmaWVyLmJlYXV0aWZpZXJzLCAoYmVhdXRpZmllcikgLT4gYmVhdXRpZmllci5uYW1lLnRvTG93ZXJDYXNlKCkpXG59XG5yZXN1bHQgPSB0ZW1wbGF0ZShjb250ZXh0KVxucmVhZG1lUmVzdWx0ID0gcmVhZG1lVGVtcGxhdGUoY29udGV4dClcblxuY29uc29sZS5sb2coJ1dyaXRpbmcgZG9jdW1lbnRhdGlvbiB0byBmaWxlLi4uJylcbmZzLndyaXRlRmlsZVN5bmMob3B0aW9uc1BhdGgsIHJlc3VsdClcbmZzLndyaXRlRmlsZVN5bmMocmVhZG1lUGF0aCwgcmVhZG1lUmVzdWx0KVxuIyBmcy53cml0ZUZpbGVTeW5jKF9fZGlybmFtZSsnL2NvbnRleHQuanNvbicsIEpTT04uc3RyaW5naWZ5KGNvbnRleHQsIHVuZGVmaW5lZCwgMikpXG5cbmNvbnNvbGUubG9nKCdVcGRhdGluZyBwYWNrYWdlLmpzb24nKVxuIyBBZGQgTGFuZ3VhZ2Uga2V5d29yZHNcbmxhbmd1YWdlTmFtZXMgPSBfLm1hcChPYmplY3Qua2V5cyhsYW5ndWFnZXNNYXApLCAoYSktPmEudG9Mb3dlckNhc2UoKSlcblxuIyBBZGQgQmVhdXRpZmllciBrZXl3b3Jkc1xuYmVhdXRpZmllck5hbWVzID0gXy5tYXAoT2JqZWN0LmtleXMoYmVhdXRpZmllcnNNYXApLCAoYSktPmEudG9Mb3dlckNhc2UoKSlcbmtleXdvcmRzID0gXy51bmlvbihwa2cua2V5d29yZHMsIGxhbmd1YWdlTmFtZXMsIGJlYXV0aWZpZXJOYW1lcylcbnBrZy5rZXl3b3JkcyA9IGtleXdvcmRzXG5cbiMgQWRkIExhbmd1YWdlLXNwZWNpZmljIGJlYXV0aWZ5IGNvbW1hbmRzXG5iZWF1dGlmeUxhbmd1YWdlQ29tbWFuZHMgPSBfLm1hcChsYW5ndWFnZU5hbWVzLCAobGFuZ3VhZ2VOYW1lKSAtPiBcImF0b20tYmVhdXRpZnk6YmVhdXRpZnktbGFuZ3VhZ2UtI3tsYW5ndWFnZU5hbWV9XCIpXG5wa2cuYWN0aXZhdGlvbkNvbW1hbmRzW1wiYXRvbS13b3Jrc3BhY2VcIl0gPSBfLnVuaW9uKHBrZy5hY3RpdmF0aW9uQ29tbWFuZHNbXCJhdG9tLXdvcmtzcGFjZVwiXSwgYmVhdXRpZnlMYW5ndWFnZUNvbW1hbmRzKVxuXG5mcy53cml0ZUZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsJy4uL3BhY2thZ2UuanNvbicpLCBKU09OLnN0cmluZ2lmeShwa2csIHVuZGVmaW5lZCwgMikpXG5cbmNvbnNvbGUubG9nKCdEb25lLicpXG4iXX0=
