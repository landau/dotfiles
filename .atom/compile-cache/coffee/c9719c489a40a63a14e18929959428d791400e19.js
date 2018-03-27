(function() {
  var Base, _, excludeProperties, extractBetween, formatKeymaps, formatReport, genTableOfContent, generateIntrospectionReport, getAncestors, getCommandFromClass, getKeyBindingForCommand, inspectFunction, inspectInstance, inspectObject, packageName, ref, report, sortByAncesstor, util,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  util = require('util');

  _ = require('underscore-plus');

  Base = require('./base');

  ref = require('./utils'), getAncestors = ref.getAncestors, getKeyBindingForCommand = ref.getKeyBindingForCommand;

  packageName = 'vim-mode-plus';

  extractBetween = function(str, s1, s2) {
    return str.substring(str.indexOf(s1) + 1, str.lastIndexOf(s2));
  };

  inspectFunction = function(fn, name) {
    var args, argumentsSignature, defaultConstructor, fnArgs, fnBody, fnString, j, len, line, m, superAsIs, superBase, superSignature, superWithModify;
    superBase = _.escapeRegExp(fn.name + ".__super__." + name);
    superAsIs = superBase + _.escapeRegExp(".apply(this, arguments);");
    defaultConstructor = '^return ' + superAsIs;
    superWithModify = superBase + '\\.call\\((.*)\\)';
    fnString = fn.toString();
    fnBody = extractBetween(fnString, '{', '}').split("\n").map(function(e) {
      return e.trim();
    });
    fnArgs = fnString.split("\n")[0].match(/\((.*)\)/)[1].split(/,\s*/g);
    fnArgs = fnArgs.map(function(arg) {
      var iVarAssign;
      iVarAssign = '^' + _.escapeRegExp("this." + arg + " = " + arg + ";") + '$';
      if (_.detect(fnBody, function(line) {
        return line.match(iVarAssign);
      })) {
        return '@' + arg;
      } else {
        return arg;
      }
    });
    argumentsSignature = '(' + fnArgs.join(', ') + ')';
    superSignature = null;
    for (j = 0, len = fnBody.length; j < len; j++) {
      line = fnBody[j];
      if (name === 'constructor' && line.match(defaultConstructor)) {
        superSignature = 'default';
      } else if (line.match(superAsIs)) {
        superSignature = 'super';
      } else if (m = line.match(superWithModify)) {
        args = m[1].replace(/this,?\s*/, '');
        args = args.replace(/this\./g, '@');
        superSignature = "super(" + args + ")";
      }
      if (superSignature) {
        break;
      }
    }
    return {
      argumentsSignature: argumentsSignature,
      superSignature: superSignature
    };
  };

  excludeProperties = ['__super__'];

  inspectObject = function(obj, options, prototype) {
    var ancesstors, argumentsSignature, excludeList, isOverridden, prefix, prop, ref1, ref2, results, s, superSignature, value;
    if (options == null) {
      options = {};
    }
    if (prototype == null) {
      prototype = false;
    }
    excludeList = excludeProperties.concat((ref1 = options.excludeProperties) != null ? ref1 : []);
    if (options.depth == null) {
      options.depth = 1;
    }
    prefix = '@';
    if (prototype) {
      obj = obj.prototype;
      prefix = '::';
    }
    ancesstors = getAncestors(obj.constructor);
    ancesstors.shift();
    results = [];
    for (prop in obj) {
      if (!hasProp.call(obj, prop)) continue;
      value = obj[prop];
      if (!(indexOf.call(excludeList, prop) < 0)) {
        continue;
      }
      s = "- " + prefix + prop;
      if (value instanceof options.recursiveInspect) {
        s += ":\n" + (inspectInstance(value, options));
      } else if (_.isFunction(value)) {
        ref2 = inspectFunction(value, prop), argumentsSignature = ref2.argumentsSignature, superSignature = ref2.superSignature;
        if ((prop === 'constructor') && (superSignature === 'default')) {
          continue;
        }
        s += "`" + argumentsSignature + "`";
        if (superSignature != null) {
          s += ": `" + superSignature + "`";
        }
      } else {
        s += ": ```" + (util.inspect(value, options)) + "```";
      }
      isOverridden = _.detect(ancesstors, function(ancestor) {
        return ancestor.prototype.hasOwnProperty(prop);
      });
      if (isOverridden) {
        s += ": **Overridden**";
      }
      results.push(s);
    }
    if (!results.length) {
      return null;
    }
    return results.join('\n');
  };

  report = function(obj, options) {
    var name;
    if (options == null) {
      options = {};
    }
    name = obj.name;
    return {
      name: name,
      ancesstorsNames: _.pluck(getAncestors(obj), 'name'),
      command: getCommandFromClass(obj),
      instance: inspectObject(obj, options),
      prototype: inspectObject(obj, options, true)
    };
  };

  sortByAncesstor = function(list) {
    var compare, mapped;
    mapped = list.map(function(obj, i) {
      return {
        index: i,
        value: obj.ancesstorsNames.slice().reverse()
      };
    });
    compare = function(v1, v2) {
      var a, b;
      a = v1.value[0];
      b = v2.value[0];
      switch (false) {
        case !((a === void 0) && (b === void 0)):
          return 0;
        case a !== void 0:
          return -1;
        case b !== void 0:
          return 1;
        case !(a < b):
          return -1;
        case !(a > b):
          return 1;
        default:
          a = {
            index: v1.index,
            value: v1.value.slice(1)
          };
          b = {
            index: v2.index,
            value: v2.value.slice(1)
          };
          return compare(a, b);
      }
    };
    return mapped.sort(compare).map(function(e) {
      return list[e.index];
    });
  };

  genTableOfContent = function(obj) {
    var ancesstorsNames, indent, indentLevel, link, name, s;
    name = obj.name, ancesstorsNames = obj.ancesstorsNames;
    indentLevel = ancesstorsNames.length - 1;
    indent = _.multiplyString('  ', indentLevel);
    link = ancesstorsNames.slice(0, 2).join('--').toLowerCase();
    s = indent + "- [" + name + "](#" + link + ")";
    if (obj.virtual != null) {
      s += ' *Not exported*';
    }
    return s;
  };

  generateIntrospectionReport = function(klasses, options) {
    var ancesstors, body, command, content, date, header, instance, j, keymaps, klass, len, pack, prototype, result, results, s, toc, version;
    pack = atom.packages.getActivePackage(packageName);
    version = pack.metadata.version;
    results = (function() {
      var j, len, results1;
      results1 = [];
      for (j = 0, len = klasses.length; j < len; j++) {
        klass = klasses[j];
        results1.push(report(klass, options));
      }
      return results1;
    })();
    results = sortByAncesstor(results);
    toc = results.map(function(e) {
      return genTableOfContent(e);
    }).join('\n');
    body = [];
    for (j = 0, len = results.length; j < len; j++) {
      result = results[j];
      ancesstors = result.ancesstorsNames.slice(0, 2);
      header = "#" + (_.multiplyString('#', ancesstors.length)) + " " + (ancesstors.join(" < "));
      s = [];
      s.push(header);
      command = result.command, instance = result.instance, prototype = result.prototype;
      if (command != null) {
        s.push("- command: `" + command + "`");
        keymaps = getKeyBindingForCommand(command, {
          packageName: 'vim-mode-plus'
        });
        if (keymaps != null) {
          s.push(formatKeymaps(keymaps));
        }
      }
      if (instance != null) {
        s.push(instance);
      }
      if (prototype != null) {
        s.push(prototype);
      }
      body.push(s.join("\n"));
    }
    date = new Date().toISOString();
    content = [packageName + " version: " + version + "  \n*generated at " + date + "*", toc, body.join("\n\n")].join("\n\n");
    return atom.workspace.open().then(function(editor) {
      editor.setText(content);
      return editor.setGrammar(atom.grammars.grammarForScopeName('source.gfm'));
    });
  };

  formatKeymaps = function(keymaps) {
    var j, keymap, keystrokes, len, s, selector;
    s = [];
    s.push('  - keymaps');
    for (j = 0, len = keymaps.length; j < len; j++) {
      keymap = keymaps[j];
      keystrokes = keymap.keystrokes, selector = keymap.selector;
      keystrokes = keystrokes.replace(/(`|_)/g, '\\$1');
      s.push("    - `" + selector + "`: <kbd>" + keystrokes + "</kbd>");
    }
    return s.join("\n");
  };

  formatReport = function(report) {
    var ancesstorsNames, instance, prototype, s;
    instance = report.instance, prototype = report.prototype, ancesstorsNames = report.ancesstorsNames;
    s = [];
    s.push("# " + (ancesstorsNames.join(" < ")));
    if (instance != null) {
      s.push(instance);
    }
    if (prototype != null) {
      s.push(prototype);
    }
    return s.join("\n");
  };

  inspectInstance = function(obj, options) {
    var indent, ref1, rep;
    if (options == null) {
      options = {};
    }
    indent = _.multiplyString(' ', (ref1 = options.indent) != null ? ref1 : 0);
    rep = report(obj.constructor, options);
    return ["## " + obj + ": " + (rep.ancesstorsNames.slice(0, 2).join(" < ")), inspectObject(obj, options), formatReport(rep)].filter(function(e) {
      return e;
    }).join('\n').split('\n').map(function(e) {
      return indent + e;
    }).join('\n');
  };

  getCommandFromClass = function(klass) {
    if (klass.isCommand()) {
      return klass.getCommandName();
    } else {
      return null;
    }
  };

  module.exports = generateIntrospectionReport;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvaW50cm9zcGVjdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFSQUFBO0lBQUE7OztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxNQUEwQyxPQUFBLENBQVEsU0FBUixDQUExQyxFQUFDLCtCQUFELEVBQWU7O0VBRWYsV0FBQSxHQUFjOztFQUVkLGNBQUEsR0FBaUIsU0FBQyxHQUFELEVBQU0sRUFBTixFQUFVLEVBQVY7V0FDZixHQUFHLENBQUMsU0FBSixDQUFjLEdBQUcsQ0FBQyxPQUFKLENBQVksRUFBWixDQUFBLEdBQWdCLENBQTlCLEVBQWlDLEdBQUcsQ0FBQyxXQUFKLENBQWdCLEVBQWhCLENBQWpDO0VBRGU7O0VBR2pCLGVBQUEsR0FBa0IsU0FBQyxFQUFELEVBQUssSUFBTDtBQWFoQixRQUFBO0lBQUEsU0FBQSxHQUFZLENBQUMsQ0FBQyxZQUFGLENBQWtCLEVBQUUsQ0FBQyxJQUFKLEdBQVMsYUFBVCxHQUFzQixJQUF2QztJQUNaLFNBQUEsR0FBWSxTQUFBLEdBQVksQ0FBQyxDQUFDLFlBQUYsQ0FBZSwwQkFBZjtJQUN4QixrQkFBQSxHQUFxQixVQUFBLEdBQWE7SUFDbEMsZUFBQSxHQUFrQixTQUFBLEdBQVk7SUFFOUIsUUFBQSxHQUFXLEVBQUUsQ0FBQyxRQUFILENBQUE7SUFDWCxNQUFBLEdBQVMsY0FBQSxDQUFlLFFBQWYsRUFBeUIsR0FBekIsRUFBOEIsR0FBOUIsQ0FBa0MsQ0FBQyxLQUFuQyxDQUF5QyxJQUF6QyxDQUE4QyxDQUFDLEdBQS9DLENBQW1ELFNBQUMsQ0FBRDthQUFPLENBQUMsQ0FBQyxJQUFGLENBQUE7SUFBUCxDQUFuRDtJQUdULE1BQUEsR0FBUyxRQUFRLENBQUMsS0FBVCxDQUFlLElBQWYsQ0FBcUIsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUF4QixDQUE4QixVQUE5QixDQUEwQyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQTdDLENBQW1ELE9BQW5EO0lBSVQsTUFBQSxHQUFTLE1BQU0sQ0FBQyxHQUFQLENBQVcsU0FBQyxHQUFEO0FBQ2xCLFVBQUE7TUFBQSxVQUFBLEdBQWEsR0FBQSxHQUFNLENBQUMsQ0FBQyxZQUFGLENBQWUsT0FBQSxHQUFRLEdBQVIsR0FBWSxLQUFaLEdBQWlCLEdBQWpCLEdBQXFCLEdBQXBDLENBQU4sR0FBZ0Q7TUFDN0QsSUFBSSxDQUFDLENBQUMsTUFBRixDQUFTLE1BQVQsRUFBaUIsU0FBQyxJQUFEO2VBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxVQUFYO01BQVYsQ0FBakIsQ0FBSjtlQUNFLEdBQUEsR0FBTSxJQURSO09BQUEsTUFBQTtlQUdFLElBSEY7O0lBRmtCLENBQVg7SUFNVCxrQkFBQSxHQUFxQixHQUFBLEdBQU0sTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaLENBQU4sR0FBMEI7SUFFL0MsY0FBQSxHQUFpQjtBQUNqQixTQUFBLHdDQUFBOztNQUNFLElBQUcsSUFBQSxLQUFRLGFBQVIsSUFBMEIsSUFBSSxDQUFDLEtBQUwsQ0FBVyxrQkFBWCxDQUE3QjtRQUNFLGNBQUEsR0FBaUIsVUFEbkI7T0FBQSxNQUVLLElBQUcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxTQUFYLENBQUg7UUFDSCxjQUFBLEdBQWlCLFFBRGQ7T0FBQSxNQUVBLElBQUcsQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFMLENBQVcsZUFBWCxDQUFQO1FBQ0gsSUFBQSxHQUFPLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFMLENBQWEsV0FBYixFQUEwQixFQUExQjtRQUNQLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsR0FBeEI7UUFDUCxjQUFBLEdBQWlCLFFBQUEsR0FBUyxJQUFULEdBQWMsSUFINUI7O01BSUwsSUFBUyxjQUFUO0FBQUEsY0FBQTs7QUFURjtXQVdBO01BQUMsb0JBQUEsa0JBQUQ7TUFBcUIsZ0JBQUEsY0FBckI7O0VBOUNnQjs7RUFnRGxCLGlCQUFBLEdBQW9CLENBQUMsV0FBRDs7RUFFcEIsYUFBQSxHQUFnQixTQUFDLEdBQUQsRUFBTSxPQUFOLEVBQWtCLFNBQWxCO0FBQ2QsUUFBQTs7TUFEb0IsVUFBUTs7O01BQUksWUFBVTs7SUFDMUMsV0FBQSxHQUFjLGlCQUFpQixDQUFDLE1BQWxCLHFEQUFzRCxFQUF0RDs7TUFDZCxPQUFPLENBQUMsUUFBUzs7SUFDakIsTUFBQSxHQUFTO0lBQ1QsSUFBRyxTQUFIO01BQ0UsR0FBQSxHQUFNLEdBQUcsQ0FBQztNQUNWLE1BQUEsR0FBUyxLQUZYOztJQUdBLFVBQUEsR0FBYSxZQUFBLENBQWEsR0FBRyxDQUFDLFdBQWpCO0lBQ2IsVUFBVSxDQUFDLEtBQVgsQ0FBQTtJQUNBLE9BQUEsR0FBVTtBQUNWLFNBQUEsV0FBQTs7O1lBQWdDLGFBQVksV0FBWixFQUFBLElBQUE7OztNQUM5QixDQUFBLEdBQUksSUFBQSxHQUFLLE1BQUwsR0FBYztNQUNsQixJQUFHLEtBQUEsWUFBaUIsT0FBTyxDQUFDLGdCQUE1QjtRQUNFLENBQUEsSUFBSyxLQUFBLEdBQUssQ0FBQyxlQUFBLENBQWdCLEtBQWhCLEVBQXVCLE9BQXZCLENBQUQsRUFEWjtPQUFBLE1BRUssSUFBRyxDQUFDLENBQUMsVUFBRixDQUFhLEtBQWIsQ0FBSDtRQUNILE9BQXVDLGVBQUEsQ0FBZ0IsS0FBaEIsRUFBdUIsSUFBdkIsQ0FBdkMsRUFBQyw0Q0FBRCxFQUFxQjtRQUNyQixJQUFHLENBQUMsSUFBQSxLQUFRLGFBQVQsQ0FBQSxJQUE0QixDQUFDLGNBQUEsS0FBa0IsU0FBbkIsQ0FBL0I7QUFDRSxtQkFERjs7UUFFQSxDQUFBLElBQUssR0FBQSxHQUFJLGtCQUFKLEdBQXVCO1FBQzVCLElBQWdDLHNCQUFoQztVQUFBLENBQUEsSUFBSyxLQUFBLEdBQU0sY0FBTixHQUFxQixJQUExQjtTQUxHO09BQUEsTUFBQTtRQU9ILENBQUEsSUFBSyxPQUFBLEdBQU8sQ0FBQyxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsRUFBb0IsT0FBcEIsQ0FBRCxDQUFQLEdBQXFDLE1BUHZDOztNQVFMLFlBQUEsR0FBZSxDQUFDLENBQUMsTUFBRixDQUFTLFVBQVQsRUFBcUIsU0FBQyxRQUFEO2VBQWMsUUFBUSxDQUFBLFNBQUUsQ0FBQyxjQUFYLENBQTBCLElBQTFCO01BQWQsQ0FBckI7TUFDZixJQUEyQixZQUEzQjtRQUFBLENBQUEsSUFBSyxtQkFBTDs7TUFDQSxPQUFPLENBQUMsSUFBUixDQUFhLENBQWI7QUFkRjtJQWdCQSxJQUFBLENBQW1CLE9BQU8sQ0FBQyxNQUEzQjtBQUFBLGFBQU8sS0FBUDs7V0FDQSxPQUFPLENBQUMsSUFBUixDQUFhLElBQWI7RUEzQmM7O0VBNkJoQixNQUFBLEdBQVMsU0FBQyxHQUFELEVBQU0sT0FBTjtBQUNQLFFBQUE7O01BRGEsVUFBUTs7SUFDckIsSUFBQSxHQUFPLEdBQUcsQ0FBQztXQUNYO01BQ0UsSUFBQSxFQUFNLElBRFI7TUFFRSxlQUFBLEVBQWlCLENBQUMsQ0FBQyxLQUFGLENBQVEsWUFBQSxDQUFhLEdBQWIsQ0FBUixFQUEyQixNQUEzQixDQUZuQjtNQUdFLE9BQUEsRUFBUyxtQkFBQSxDQUFvQixHQUFwQixDQUhYO01BSUUsUUFBQSxFQUFVLGFBQUEsQ0FBYyxHQUFkLEVBQW1CLE9BQW5CLENBSlo7TUFLRSxTQUFBLEVBQVcsYUFBQSxDQUFjLEdBQWQsRUFBbUIsT0FBbkIsRUFBNEIsSUFBNUIsQ0FMYjs7RUFGTzs7RUFVVCxlQUFBLEdBQWtCLFNBQUMsSUFBRDtBQUNoQixRQUFBO0lBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsU0FBQyxHQUFELEVBQU0sQ0FBTjthQUNoQjtRQUFDLEtBQUEsRUFBTyxDQUFSO1FBQVcsS0FBQSxFQUFPLEdBQUcsQ0FBQyxlQUFlLENBQUMsS0FBcEIsQ0FBQSxDQUEyQixDQUFDLE9BQTVCLENBQUEsQ0FBbEI7O0lBRGdCLENBQVQ7SUFHVCxPQUFBLEdBQVUsU0FBQyxFQUFELEVBQUssRUFBTDtBQUNSLFVBQUE7TUFBQSxDQUFBLEdBQUksRUFBRSxDQUFDLEtBQU0sQ0FBQSxDQUFBO01BQ2IsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxLQUFNLENBQUEsQ0FBQTtBQUNiLGNBQUEsS0FBQTtBQUFBLGVBQ08sQ0FBQyxDQUFBLEtBQUssTUFBTixDQUFBLElBQXFCLENBQUMsQ0FBQSxLQUFLLE1BQU4sRUFENUI7aUJBQ21EO0FBRG5ELGFBRU8sQ0FBQSxLQUFLLE1BRlo7aUJBRTJCLENBQUM7QUFGNUIsYUFHTyxDQUFBLEtBQUssTUFIWjtpQkFHMkI7QUFIM0IsZUFJTyxDQUFBLEdBQUksRUFKWDtpQkFJa0IsQ0FBQztBQUpuQixlQUtPLENBQUEsR0FBSSxFQUxYO2lCQUtrQjtBQUxsQjtVQU9JLENBQUEsR0FBSTtZQUFBLEtBQUEsRUFBTyxFQUFFLENBQUMsS0FBVjtZQUFpQixLQUFBLEVBQU8sRUFBRSxDQUFDLEtBQU0sU0FBakM7O1VBQ0osQ0FBQSxHQUFJO1lBQUEsS0FBQSxFQUFPLEVBQUUsQ0FBQyxLQUFWO1lBQWlCLEtBQUEsRUFBTyxFQUFFLENBQUMsS0FBTSxTQUFqQzs7aUJBQ0osT0FBQSxDQUFRLENBQVIsRUFBVyxDQUFYO0FBVEo7SUFIUTtXQWNWLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixDQUFvQixDQUFDLEdBQXJCLENBQXlCLFNBQUMsQ0FBRDthQUFPLElBQUssQ0FBQSxDQUFDLENBQUMsS0FBRjtJQUFaLENBQXpCO0VBbEJnQjs7RUFvQmxCLGlCQUFBLEdBQW9CLFNBQUMsR0FBRDtBQUNsQixRQUFBO0lBQUMsZUFBRCxFQUFPO0lBQ1AsV0FBQSxHQUFjLGVBQWUsQ0FBQyxNQUFoQixHQUF5QjtJQUN2QyxNQUFBLEdBQVMsQ0FBQyxDQUFDLGNBQUYsQ0FBaUIsSUFBakIsRUFBdUIsV0FBdkI7SUFDVCxJQUFBLEdBQU8sZUFBZ0IsWUFBSyxDQUFDLElBQXRCLENBQTJCLElBQTNCLENBQWdDLENBQUMsV0FBakMsQ0FBQTtJQUNQLENBQUEsR0FBTyxNQUFELEdBQVEsS0FBUixHQUFhLElBQWIsR0FBa0IsS0FBbEIsR0FBdUIsSUFBdkIsR0FBNEI7SUFDbEMsSUFBMEIsbUJBQTFCO01BQUEsQ0FBQSxJQUFLLGtCQUFMOztXQUNBO0VBUGtCOztFQVNwQiwyQkFBQSxHQUE4QixTQUFDLE9BQUQsRUFBVSxPQUFWO0FBQzVCLFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixXQUEvQjtJQUNOLFVBQVcsSUFBSSxDQUFDO0lBRWpCLE9BQUE7O0FBQVc7V0FBQSx5Q0FBQTs7c0JBQUEsTUFBQSxDQUFPLEtBQVAsRUFBYyxPQUFkO0FBQUE7OztJQUNYLE9BQUEsR0FBVSxlQUFBLENBQWdCLE9BQWhCO0lBRVYsR0FBQSxHQUFNLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBQyxDQUFEO2FBQU8saUJBQUEsQ0FBa0IsQ0FBbEI7SUFBUCxDQUFaLENBQXdDLENBQUMsSUFBekMsQ0FBOEMsSUFBOUM7SUFDTixJQUFBLEdBQU87QUFDUCxTQUFBLHlDQUFBOztNQUNFLFVBQUEsR0FBYSxNQUFNLENBQUMsZUFBZ0I7TUFDcEMsTUFBQSxHQUFTLEdBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxjQUFGLENBQWlCLEdBQWpCLEVBQXNCLFVBQVUsQ0FBQyxNQUFqQyxDQUFELENBQUgsR0FBNkMsR0FBN0MsR0FBK0MsQ0FBQyxVQUFVLENBQUMsSUFBWCxDQUFnQixLQUFoQixDQUFEO01BQ3hELENBQUEsR0FBSTtNQUNKLENBQUMsQ0FBQyxJQUFGLENBQU8sTUFBUDtNQUNDLHdCQUFELEVBQVUsMEJBQVYsRUFBb0I7TUFDcEIsSUFBRyxlQUFIO1FBQ0UsQ0FBQyxDQUFDLElBQUYsQ0FBTyxjQUFBLEdBQWUsT0FBZixHQUF1QixHQUE5QjtRQUNBLE9BQUEsR0FBVSx1QkFBQSxDQUF3QixPQUF4QixFQUFpQztVQUFBLFdBQUEsRUFBYSxlQUFiO1NBQWpDO1FBQ1YsSUFBaUMsZUFBakM7VUFBQSxDQUFDLENBQUMsSUFBRixDQUFPLGFBQUEsQ0FBYyxPQUFkLENBQVAsRUFBQTtTQUhGOztNQUtBLElBQW1CLGdCQUFuQjtRQUFBLENBQUMsQ0FBQyxJQUFGLENBQU8sUUFBUCxFQUFBOztNQUNBLElBQW9CLGlCQUFwQjtRQUFBLENBQUMsQ0FBQyxJQUFGLENBQU8sU0FBUCxFQUFBOztNQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFQLENBQVY7QUFiRjtJQWVBLElBQUEsR0FBVyxJQUFBLElBQUEsQ0FBQSxDQUFNLENBQUMsV0FBUCxDQUFBO0lBQ1gsT0FBQSxHQUFVLENBQ0wsV0FBRCxHQUFhLFlBQWIsR0FBeUIsT0FBekIsR0FBaUMsb0JBQWpDLEdBQXFELElBQXJELEdBQTBELEdBRHBELEVBRVIsR0FGUSxFQUdSLElBQUksQ0FBQyxJQUFMLENBQVUsTUFBVixDQUhRLENBSVQsQ0FBQyxJQUpRLENBSUgsTUFKRztXQU1WLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsU0FBQyxNQUFEO01BQ3pCLE1BQU0sQ0FBQyxPQUFQLENBQWUsT0FBZjthQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0MsWUFBbEMsQ0FBbEI7SUFGeUIsQ0FBM0I7RUEvQjRCOztFQW1DOUIsYUFBQSxHQUFnQixTQUFDLE9BQUQ7QUFDZCxRQUFBO0lBQUEsQ0FBQSxHQUFJO0lBQ0osQ0FBQyxDQUFDLElBQUYsQ0FBTyxhQUFQO0FBQ0EsU0FBQSx5Q0FBQTs7TUFDRyw4QkFBRCxFQUFhO01BQ2IsVUFBQSxHQUFhLFVBQVUsQ0FBQyxPQUFYLENBQW1CLFFBQW5CLEVBQTZCLE1BQTdCO01BQ2IsQ0FBQyxDQUFDLElBQUYsQ0FBTyxTQUFBLEdBQVUsUUFBVixHQUFtQixVQUFuQixHQUE2QixVQUE3QixHQUF3QyxRQUEvQztBQUhGO1dBS0EsQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFQO0VBUmM7O0VBVWhCLFlBQUEsR0FBZSxTQUFDLE1BQUQ7QUFDYixRQUFBO0lBQUMsMEJBQUQsRUFBVyw0QkFBWCxFQUFzQjtJQUN0QixDQUFBLEdBQUk7SUFDSixDQUFDLENBQUMsSUFBRixDQUFPLElBQUEsR0FBSSxDQUFDLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixLQUFyQixDQUFELENBQVg7SUFDQSxJQUFtQixnQkFBbkI7TUFBQSxDQUFDLENBQUMsSUFBRixDQUFPLFFBQVAsRUFBQTs7SUFDQSxJQUFvQixpQkFBcEI7TUFBQSxDQUFDLENBQUMsSUFBRixDQUFPLFNBQVAsRUFBQTs7V0FDQSxDQUFDLENBQUMsSUFBRixDQUFPLElBQVA7RUFOYTs7RUFRZixlQUFBLEdBQWtCLFNBQUMsR0FBRCxFQUFNLE9BQU47QUFDaEIsUUFBQTs7TUFEc0IsVUFBUTs7SUFDOUIsTUFBQSxHQUFTLENBQUMsQ0FBQyxjQUFGLENBQWlCLEdBQWpCLDJDQUF1QyxDQUF2QztJQUNULEdBQUEsR0FBTSxNQUFBLENBQU8sR0FBRyxDQUFDLFdBQVgsRUFBd0IsT0FBeEI7V0FDTixDQUNFLEtBQUEsR0FBTSxHQUFOLEdBQVUsSUFBVixHQUFhLENBQUMsR0FBRyxDQUFDLGVBQWdCLFlBQUssQ0FBQyxJQUExQixDQUErQixLQUEvQixDQUFELENBRGYsRUFFRSxhQUFBLENBQWMsR0FBZCxFQUFtQixPQUFuQixDQUZGLEVBR0UsWUFBQSxDQUFhLEdBQWIsQ0FIRixDQUlDLENBQUMsTUFKRixDQUlTLFNBQUMsQ0FBRDthQUFPO0lBQVAsQ0FKVCxDQUtBLENBQUMsSUFMRCxDQUtNLElBTE4sQ0FLVyxDQUFDLEtBTFosQ0FLa0IsSUFMbEIsQ0FLdUIsQ0FBQyxHQUx4QixDQUs0QixTQUFDLENBQUQ7YUFBTyxNQUFBLEdBQVM7SUFBaEIsQ0FMNUIsQ0FLOEMsQ0FBQyxJQUwvQyxDQUtvRCxJQUxwRDtFQUhnQjs7RUFVbEIsbUJBQUEsR0FBc0IsU0FBQyxLQUFEO0lBQ3BCLElBQUcsS0FBSyxDQUFDLFNBQU4sQ0FBQSxDQUFIO2FBQTBCLEtBQUssQ0FBQyxjQUFOLENBQUEsRUFBMUI7S0FBQSxNQUFBO2FBQXNELEtBQXREOztFQURvQjs7RUFHdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFsTWpCIiwic291cmNlc0NvbnRlbnQiOlsidXRpbCA9IHJlcXVpcmUgJ3V0aWwnXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbntnZXRBbmNlc3RvcnMsIGdldEtleUJpbmRpbmdGb3JDb21tYW5kfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbnBhY2thZ2VOYW1lID0gJ3ZpbS1tb2RlLXBsdXMnXG5cbmV4dHJhY3RCZXR3ZWVuID0gKHN0ciwgczEsIHMyKSAtPlxuICBzdHIuc3Vic3RyaW5nKHN0ci5pbmRleE9mKHMxKSsxLCBzdHIubGFzdEluZGV4T2YoczIpKVxuXG5pbnNwZWN0RnVuY3Rpb24gPSAoZm4sIG5hbWUpIC0+XG4gICMgQ2FsbGluZyBzdXBlciBpbiB0aGUgb3ZlcnJpZGRlbiBjb25zdHJ1Y3RvcigpIGZ1bmN0aW9uLlxuICAjICBDYXNlLTE6IE5vIG92ZXJyaWRlLlxuICAjICBDb2ZmZWVTY3JpcHQgU291cmNlOiBOL0FcbiAgIyAgQ29tcGlsZWQgSmF2YVNjcmlwdDogcmV0dXJuIEMxLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAjXG4gICMgIENhc2UtMjogc3VwZXIgd2l0aG91dCBwYXJlbnRoZXNlcy5cbiAgIyAgQ29mZmVlU2NyaXB0IFNvdXJjZTogc3VwZXJcbiAgIyAgQ29tcGlsZWQgSmF2YVNjcmlwdDogQzEuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICNcbiAgIyAgQ2FzZS0zOiBzdXBlciB3aXRoIGV4cGxpY2l0IGFyZ3VtZW50LlxuICAjICBDb2ZmZWVTY3JpcHQgU291cmNlOiBzdXBlcihhMSlcbiAgIyAgQ29tcGlsZWQgSmF2YVNjcmlwdDogQzEuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgYTEpO1xuICBzdXBlckJhc2UgPSBfLmVzY2FwZVJlZ0V4cChcIiN7Zm4ubmFtZX0uX19zdXBlcl9fLiN7bmFtZX1cIilcbiAgc3VwZXJBc0lzID0gc3VwZXJCYXNlICsgXy5lc2NhcGVSZWdFeHAoXCIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcIikgIyBDYXNlLTJcbiAgZGVmYXVsdENvbnN0cnVjdG9yID0gJ15yZXR1cm4gJysgIHN1cGVyQXNJcyAjIENhc2UtMVxuICBzdXBlcldpdGhNb2RpZnkgPSBzdXBlckJhc2UgKyAnXFxcXC5jYWxsXFxcXCgoLiopXFxcXCknICMgQ2FzZS0zXG5cbiAgZm5TdHJpbmcgPSBmbi50b1N0cmluZygpXG4gIGZuQm9keSA9IGV4dHJhY3RCZXR3ZWVuKGZuU3RyaW5nLCAneycsICd9Jykuc3BsaXQoXCJcXG5cIikubWFwIChlKSAtPiBlLnRyaW0oKVxuXG4gICMgRXh0cmFjdCBhcmd1bWVudHMgZnJvbSBmblN0cmluZy4gZS5nLiBmdW5jdGlvbihhMSwgYTEpe30gLT4gWydhMScsICdhMiddLlxuICBmbkFyZ3MgPSBmblN0cmluZy5zcGxpdChcIlxcblwiKVswXS5tYXRjaCgvXFwoKC4qKVxcKS8pWzFdLnNwbGl0KC8sXFxzKi9nKVxuXG4gICMgUmVwbGFjZSBbJ2FyZzEnLCAnYXJnMiddIHRvIFsnQGFyZzEnLCAnQGFyZzInXS5cbiAgIyBPbmx5IHdoZW4gaW5zdGFuY2UgdmFyaWFibGUgYXNzaWdubWVudCBzdGF0ZW1lbnQgd2FzIGZvdW5kLlxuICBmbkFyZ3MgPSBmbkFyZ3MubWFwIChhcmcpIC0+XG4gICAgaVZhckFzc2lnbiA9ICdeJyArIF8uZXNjYXBlUmVnRXhwKFwidGhpcy4je2FyZ30gPSAje2FyZ307XCIpICsgJyQnXG4gICAgaWYgKF8uZGV0ZWN0KGZuQm9keSwgKGxpbmUpIC0+IGxpbmUubWF0Y2goaVZhckFzc2lnbikpKVxuICAgICAgJ0AnICsgYXJnXG4gICAgZWxzZVxuICAgICAgYXJnXG4gIGFyZ3VtZW50c1NpZ25hdHVyZSA9ICcoJyArIGZuQXJncy5qb2luKCcsICcpICsgJyknXG5cbiAgc3VwZXJTaWduYXR1cmUgPSBudWxsXG4gIGZvciBsaW5lIGluIGZuQm9keVxuICAgIGlmIG5hbWUgaXMgJ2NvbnN0cnVjdG9yJyBhbmQgbGluZS5tYXRjaChkZWZhdWx0Q29uc3RydWN0b3IpXG4gICAgICBzdXBlclNpZ25hdHVyZSA9ICdkZWZhdWx0J1xuICAgIGVsc2UgaWYgbGluZS5tYXRjaChzdXBlckFzSXMpXG4gICAgICBzdXBlclNpZ25hdHVyZSA9ICdzdXBlcidcbiAgICBlbHNlIGlmIG0gPSBsaW5lLm1hdGNoKHN1cGVyV2l0aE1vZGlmeSlcbiAgICAgIGFyZ3MgPSBtWzFdLnJlcGxhY2UoL3RoaXMsP1xccyovLCAnJykgIyBEZWxldGUgMXN0IGFyZyg9dGhpcykgb2YgYXBwbHkoKSBvciBjYWxsKClcbiAgICAgIGFyZ3MgPSBhcmdzLnJlcGxhY2UoL3RoaXNcXC4vZywgJ0AnKVxuICAgICAgc3VwZXJTaWduYXR1cmUgPSBcInN1cGVyKCN7YXJnc30pXCJcbiAgICBicmVhayBpZiBzdXBlclNpZ25hdHVyZVxuXG4gIHthcmd1bWVudHNTaWduYXR1cmUsIHN1cGVyU2lnbmF0dXJlfVxuXG5leGNsdWRlUHJvcGVydGllcyA9IFsnX19zdXBlcl9fJ11cblxuaW5zcGVjdE9iamVjdCA9IChvYmosIG9wdGlvbnM9e30sIHByb3RvdHlwZT1mYWxzZSkgLT5cbiAgZXhjbHVkZUxpc3QgPSBleGNsdWRlUHJvcGVydGllcy5jb25jYXQgKG9wdGlvbnMuZXhjbHVkZVByb3BlcnRpZXMgPyBbXSlcbiAgb3B0aW9ucy5kZXB0aCA/PSAxXG4gIHByZWZpeCA9ICdAJ1xuICBpZiBwcm90b3R5cGVcbiAgICBvYmogPSBvYmoucHJvdG90eXBlXG4gICAgcHJlZml4ID0gJzo6J1xuICBhbmNlc3N0b3JzID0gZ2V0QW5jZXN0b3JzKG9iai5jb25zdHJ1Y3RvcilcbiAgYW5jZXNzdG9ycy5zaGlmdCgpICMgZHJvcCBteXNlbGYuXG4gIHJlc3VsdHMgPSBbXVxuICBmb3Igb3duIHByb3AsIHZhbHVlIG9mIG9iaiB3aGVuIHByb3Agbm90IGluIGV4Y2x1ZGVMaXN0XG4gICAgcyA9IFwiLSAje3ByZWZpeH0je3Byb3B9XCJcbiAgICBpZiB2YWx1ZSBpbnN0YW5jZW9mIG9wdGlvbnMucmVjdXJzaXZlSW5zcGVjdFxuICAgICAgcyArPSBcIjpcXG4je2luc3BlY3RJbnN0YW5jZSh2YWx1ZSwgb3B0aW9ucyl9XCJcbiAgICBlbHNlIGlmIF8uaXNGdW5jdGlvbih2YWx1ZSlcbiAgICAgIHthcmd1bWVudHNTaWduYXR1cmUsIHN1cGVyU2lnbmF0dXJlfSA9IGluc3BlY3RGdW5jdGlvbih2YWx1ZSwgcHJvcClcbiAgICAgIGlmIChwcm9wIGlzICdjb25zdHJ1Y3RvcicpIGFuZCAoc3VwZXJTaWduYXR1cmUgaXMgJ2RlZmF1bHQnKVxuICAgICAgICBjb250aW51ZSAjIGhpZGUgZGVmYXVsdCBjb25zdHJ1Y3RvclxuICAgICAgcyArPSBcImAje2FyZ3VtZW50c1NpZ25hdHVyZX1gXCJcbiAgICAgIHMgKz0gXCI6IGAje3N1cGVyU2lnbmF0dXJlfWBcIiBpZiBzdXBlclNpZ25hdHVyZT9cbiAgICBlbHNlXG4gICAgICBzICs9IFwiOiBgYGAje3V0aWwuaW5zcGVjdCh2YWx1ZSwgb3B0aW9ucyl9YGBgXCJcbiAgICBpc092ZXJyaWRkZW4gPSBfLmRldGVjdChhbmNlc3N0b3JzLCAoYW5jZXN0b3IpIC0+IGFuY2VzdG9yOjouaGFzT3duUHJvcGVydHkocHJvcCkpXG4gICAgcyArPSBcIjogKipPdmVycmlkZGVuKipcIiBpZiBpc092ZXJyaWRkZW5cbiAgICByZXN1bHRzLnB1c2ggc1xuXG4gIHJldHVybiBudWxsIHVubGVzcyByZXN1bHRzLmxlbmd0aFxuICByZXN1bHRzLmpvaW4oJ1xcbicpXG5cbnJlcG9ydCA9IChvYmosIG9wdGlvbnM9e30pIC0+XG4gIG5hbWUgPSBvYmoubmFtZVxuICB7XG4gICAgbmFtZTogbmFtZVxuICAgIGFuY2Vzc3RvcnNOYW1lczogXy5wbHVjayhnZXRBbmNlc3RvcnMob2JqKSwgJ25hbWUnKVxuICAgIGNvbW1hbmQ6IGdldENvbW1hbmRGcm9tQ2xhc3Mob2JqKVxuICAgIGluc3RhbmNlOiBpbnNwZWN0T2JqZWN0KG9iaiwgb3B0aW9ucylcbiAgICBwcm90b3R5cGU6IGluc3BlY3RPYmplY3Qob2JqLCBvcHRpb25zLCB0cnVlKVxuICB9XG5cbnNvcnRCeUFuY2Vzc3RvciA9IChsaXN0KSAtPlxuICBtYXBwZWQgPSBsaXN0Lm1hcCAob2JqLCBpKSAtPlxuICAgIHtpbmRleDogaSwgdmFsdWU6IG9iai5hbmNlc3N0b3JzTmFtZXMuc2xpY2UoKS5yZXZlcnNlKCl9XG5cbiAgY29tcGFyZSA9ICh2MSwgdjIpIC0+XG4gICAgYSA9IHYxLnZhbHVlWzBdXG4gICAgYiA9IHYyLnZhbHVlWzBdXG4gICAgc3dpdGNoXG4gICAgICB3aGVuIChhIGlzIHVuZGVmaW5lZCkgYW5kIChiIGlzIHVuZGVmaW5lZCkgdGhlbiAgMFxuICAgICAgd2hlbiBhIGlzIHVuZGVmaW5lZCB0aGVuIC0xXG4gICAgICB3aGVuIGIgaXMgdW5kZWZpbmVkIHRoZW4gMVxuICAgICAgd2hlbiBhIDwgYiB0aGVuIC0xXG4gICAgICB3aGVuIGEgPiBiIHRoZW4gMVxuICAgICAgZWxzZVxuICAgICAgICBhID0gaW5kZXg6IHYxLmluZGV4LCB2YWx1ZTogdjEudmFsdWVbMS4uXVxuICAgICAgICBiID0gaW5kZXg6IHYyLmluZGV4LCB2YWx1ZTogdjIudmFsdWVbMS4uXVxuICAgICAgICBjb21wYXJlKGEsIGIpXG5cbiAgbWFwcGVkLnNvcnQoY29tcGFyZSkubWFwKChlKSAtPiBsaXN0W2UuaW5kZXhdKVxuXG5nZW5UYWJsZU9mQ29udGVudCA9IChvYmopIC0+XG4gIHtuYW1lLCBhbmNlc3N0b3JzTmFtZXN9ID0gb2JqXG4gIGluZGVudExldmVsID0gYW5jZXNzdG9yc05hbWVzLmxlbmd0aCAtIDFcbiAgaW5kZW50ID0gXy5tdWx0aXBseVN0cmluZygnICAnLCBpbmRlbnRMZXZlbClcbiAgbGluayA9IGFuY2Vzc3RvcnNOYW1lc1swLi4xXS5qb2luKCctLScpLnRvTG93ZXJDYXNlKClcbiAgcyA9IFwiI3tpbmRlbnR9LSBbI3tuYW1lfV0oIyN7bGlua30pXCJcbiAgcyArPSAnICpOb3QgZXhwb3J0ZWQqJyBpZiBvYmoudmlydHVhbD9cbiAgc1xuXG5nZW5lcmF0ZUludHJvc3BlY3Rpb25SZXBvcnQgPSAoa2xhc3Nlcywgb3B0aW9ucykgLT5cbiAgcGFjayA9IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZShwYWNrYWdlTmFtZSlcbiAge3ZlcnNpb259ID0gcGFjay5tZXRhZGF0YVxuXG4gIHJlc3VsdHMgPSAocmVwb3J0KGtsYXNzLCBvcHRpb25zKSBmb3Iga2xhc3MgaW4ga2xhc3NlcylcbiAgcmVzdWx0cyA9IHNvcnRCeUFuY2Vzc3RvcihyZXN1bHRzKVxuXG4gIHRvYyA9IHJlc3VsdHMubWFwKChlKSAtPiBnZW5UYWJsZU9mQ29udGVudChlKSkuam9pbignXFxuJylcbiAgYm9keSA9IFtdXG4gIGZvciByZXN1bHQgaW4gcmVzdWx0c1xuICAgIGFuY2Vzc3RvcnMgPSByZXN1bHQuYW5jZXNzdG9yc05hbWVzWzAuLjFdXG4gICAgaGVhZGVyID0gXCIjI3tfLm11bHRpcGx5U3RyaW5nKCcjJywgYW5jZXNzdG9ycy5sZW5ndGgpfSAje2FuY2Vzc3RvcnMuam9pbihcIiA8IFwiKX1cIlxuICAgIHMgPSBbXVxuICAgIHMucHVzaCBoZWFkZXJcbiAgICB7Y29tbWFuZCwgaW5zdGFuY2UsIHByb3RvdHlwZX0gPSByZXN1bHRcbiAgICBpZiBjb21tYW5kP1xuICAgICAgcy5wdXNoIFwiLSBjb21tYW5kOiBgI3tjb21tYW5kfWBcIlxuICAgICAga2V5bWFwcyA9IGdldEtleUJpbmRpbmdGb3JDb21tYW5kKGNvbW1hbmQsIHBhY2thZ2VOYW1lOiAndmltLW1vZGUtcGx1cycpXG4gICAgICBzLnB1c2ggZm9ybWF0S2V5bWFwcyhrZXltYXBzKSBpZiBrZXltYXBzP1xuXG4gICAgcy5wdXNoIGluc3RhbmNlIGlmIGluc3RhbmNlP1xuICAgIHMucHVzaCBwcm90b3R5cGUgaWYgcHJvdG90eXBlP1xuICAgIGJvZHkucHVzaCBzLmpvaW4oXCJcXG5cIilcblxuICBkYXRlID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIGNvbnRlbnQgPSBbXG4gICAgXCIje3BhY2thZ2VOYW1lfSB2ZXJzaW9uOiAje3ZlcnNpb259ICBcXG4qZ2VuZXJhdGVkIGF0ICN7ZGF0ZX0qXCJcbiAgICB0b2NcbiAgICBib2R5LmpvaW4oXCJcXG5cXG5cIilcbiAgXS5qb2luKFwiXFxuXFxuXCIpXG5cbiAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4gKGVkaXRvcikgLT5cbiAgICBlZGl0b3Iuc2V0VGV4dCBjb250ZW50XG4gICAgZWRpdG9yLnNldEdyYW1tYXIgYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKCdzb3VyY2UuZ2ZtJylcblxuZm9ybWF0S2V5bWFwcyA9IChrZXltYXBzKSAtPlxuICBzID0gW11cbiAgcy5wdXNoICcgIC0ga2V5bWFwcydcbiAgZm9yIGtleW1hcCBpbiBrZXltYXBzXG4gICAge2tleXN0cm9rZXMsIHNlbGVjdG9yfSA9IGtleW1hcFxuICAgIGtleXN0cm9rZXMgPSBrZXlzdHJva2VzLnJlcGxhY2UoLyhgfF8pL2csICdcXFxcJDEnKVxuICAgIHMucHVzaCBcIiAgICAtIGAje3NlbGVjdG9yfWA6IDxrYmQ+I3trZXlzdHJva2VzfTwva2JkPlwiXG5cbiAgcy5qb2luKFwiXFxuXCIpXG5cbmZvcm1hdFJlcG9ydCA9IChyZXBvcnQpIC0+XG4gIHtpbnN0YW5jZSwgcHJvdG90eXBlLCBhbmNlc3N0b3JzTmFtZXN9ID0gcmVwb3J0XG4gIHMgPSBbXVxuICBzLnB1c2ggXCIjICN7YW5jZXNzdG9yc05hbWVzLmpvaW4oXCIgPCBcIil9XCJcbiAgcy5wdXNoIGluc3RhbmNlIGlmIGluc3RhbmNlP1xuICBzLnB1c2ggcHJvdG90eXBlIGlmIHByb3RvdHlwZT9cbiAgcy5qb2luKFwiXFxuXCIpXG5cbmluc3BlY3RJbnN0YW5jZSA9IChvYmosIG9wdGlvbnM9e30pIC0+XG4gIGluZGVudCA9IF8ubXVsdGlwbHlTdHJpbmcoJyAnLCBvcHRpb25zLmluZGVudCA/IDApXG4gIHJlcCA9IHJlcG9ydChvYmouY29uc3RydWN0b3IsIG9wdGlvbnMpXG4gIFtcbiAgICBcIiMjICN7b2JqfTogI3tyZXAuYW5jZXNzdG9yc05hbWVzWzAuLjFdLmpvaW4oXCIgPCBcIil9XCJcbiAgICBpbnNwZWN0T2JqZWN0KG9iaiwgb3B0aW9ucylcbiAgICBmb3JtYXRSZXBvcnQocmVwKVxuICBdLmZpbHRlciAoZSkgLT4gZVxuICAuam9pbignXFxuJykuc3BsaXQoJ1xcbicpLm1hcCgoZSkgLT4gaW5kZW50ICsgZSkuam9pbignXFxuJylcblxuZ2V0Q29tbWFuZEZyb21DbGFzcyA9IChrbGFzcykgLT5cbiAgaWYga2xhc3MuaXNDb21tYW5kKCkgdGhlbiBrbGFzcy5nZXRDb21tYW5kTmFtZSgpIGVsc2UgbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbmVyYXRlSW50cm9zcGVjdGlvblJlcG9ydFxuIl19
