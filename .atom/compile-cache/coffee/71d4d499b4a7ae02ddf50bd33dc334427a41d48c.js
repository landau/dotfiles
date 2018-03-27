(function() {
  var Beautifiers, Handlebars, beautifier, beautifierName, beautifierOptions, beautifiers, beautifiersMap, bs, context, exampleConfig, fs, keywords, languageOptions, languagesMap, linkifyTitle, lo, ls, optionDef, optionGroup, optionGroupTemplate, optionGroupTemplatePath, optionName, optionTemplate, optionTemplatePath, optionsPath, optionsTemplate, optionsTemplatePath, packageOptions, path, pkg, readmePath, readmeResult, readmeTemplate, readmeTemplatePath, result, sortKeysBy, sortSettings, template, _, _i, _len, _ref, _ref1;

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
    _ref = optionGroup.properties;
    for (optionName in _ref) {
      optionDef = _ref[optionName];
      beautifiers = (_ref1 = optionDef.beautifiers) != null ? _ref1 : [];
      for (_i = 0, _len = beautifiers.length; _i < _len; _i++) {
        beautifierName = beautifiers[_i];
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

    /*
    | Language | Supported Beautifiers |
    | --- | ---- |
    | JavaScript | Js-Beautify, Pretty Diff |
     */
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
    beautifierOptions: sortSettings(beautifierOptions)
  };

  result = template(context);

  readmeResult = readmeTemplate(context);

  console.log('Writing documentation to file...');

  fs.writeFileSync(optionsPath, result);

  fs.writeFileSync(readmePath, readmeResult);

  console.log('Updating package.json');

  ls = _.map(Object.keys(languagesMap), function(a) {
    return a.toLowerCase();
  });

  bs = _.map(Object.keys(beautifiersMap), function(a) {
    return a.toLowerCase();
  });

  keywords = _.union(pkg.keywords, ls, bs);

  pkg.keywords = keywords;

  fs.writeFileSync(path.resolve(__dirname, '../package.json'), JSON.stringify(pkg, void 0, 2));

  console.log('Done.');

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9kb2NzL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUdBO0FBQUEsTUFBQSwwZ0JBQUE7O0FBQUEsRUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVIsQ0FBYixDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxvQkFBUixDQURkLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBR0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBSEosQ0FBQTs7QUFBQSxFQUlBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUpQLENBQUE7O0FBQUEsRUFLQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGlCQUFSLENBTE4sQ0FBQTs7QUFBQSxFQU9BLE9BQU8sQ0FBQyxHQUFSLENBQVksdUJBQVosQ0FQQSxDQUFBOztBQUFBLEVBUUEsVUFBQSxHQUFpQixJQUFBLFdBQUEsQ0FBQSxDQVJqQixDQUFBOztBQUFBLEVBU0EsZUFBQSxHQUFrQixVQUFVLENBQUMsT0FUN0IsQ0FBQTs7QUFBQSxFQVVBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLHNCQUFSLENBVmpCLENBQUE7O0FBQUEsRUFZQSxjQUFBLEdBQWlCLENBQUMsQ0FBQyxLQUFGLENBQVEsVUFBVSxDQUFDLFdBQW5CLEVBQWdDLE1BQWhDLENBWmpCLENBQUE7O0FBQUEsRUFhQSxZQUFBLEdBQWUsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQTdCLEVBQXdDLE1BQXhDLENBYmYsQ0FBQTs7QUFBQSxFQWNBLGlCQUFBLEdBQW9CLEVBZHBCLENBQUE7O0FBZUEsT0FBQSxxQkFBQTtzQ0FBQTtBQUNFO0FB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/docs/index.coffee
