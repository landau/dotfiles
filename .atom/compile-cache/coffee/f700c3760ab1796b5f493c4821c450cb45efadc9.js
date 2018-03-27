(function() {
  var Base, BufferedProcess, CompositeDisposable, Developer, Disposable, Emitter, getEditorState, ref, settings;

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, BufferedProcess = ref.BufferedProcess, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  settings = require('./settings');

  getEditorState = null;

  Developer = (function() {
    var kinds, modifierKeyMap, selectorMap;

    function Developer() {}

    Developer.prototype.init = function(_getEditorState) {
      var commands, fn, name, subscriptions;
      getEditorState = _getEditorState;
      this.devEnvironmentByBuffer = new Map;
      this.reloadSubscriptionByBuffer = new Map;
      commands = {
        'toggle-debug': (function(_this) {
          return function() {
            return _this.toggleDebug();
          };
        })(this),
        'open-in-vim': (function(_this) {
          return function() {
            return _this.openInVim();
          };
        })(this),
        'generate-introspection-report': (function(_this) {
          return function() {
            return _this.generateIntrospectionReport();
          };
        })(this),
        'generate-command-summary-table': (function(_this) {
          return function() {
            return _this.generateCommandSummaryTable();
          };
        })(this),
        'write-command-table-on-disk': function() {
          return Base.writeCommandTableOnDisk();
        },
        'clear-debug-output': (function(_this) {
          return function() {
            return _this.clearDebugOutput();
          };
        })(this),
        'reload': (function(_this) {
          return function() {
            return _this.reload();
          };
        })(this),
        'reload-with-dependencies': (function(_this) {
          return function() {
            return _this.reload(true);
          };
        })(this),
        'report-total-marker-count': (function(_this) {
          return function() {
            return _this.getAllMarkerCount();
          };
        })(this),
        'report-total-and-per-editor-marker-count': (function(_this) {
          return function() {
            return _this.getAllMarkerCount(true);
          };
        })(this),
        'report-require-cache': (function(_this) {
          return function() {
            return _this.reportRequireCache({
              excludeNodModules: true
            });
          };
        })(this),
        'report-require-cache-all': (function(_this) {
          return function() {
            return _this.reportRequireCache({
              excludeNodModules: false
            });
          };
        })(this)
      };
      subscriptions = new CompositeDisposable;
      for (name in commands) {
        fn = commands[name];
        subscriptions.add(this.addCommand(name, fn));
      }
      return subscriptions;
    };

    Developer.prototype.reportRequireCache = function(arg) {
      var cachedPath, cachedPaths, excludeNodModules, focus, i, len, packPath, pathSeparator, results;
      focus = arg.focus, excludeNodModules = arg.excludeNodModules;
      pathSeparator = require('path').sep;
      packPath = atom.packages.getLoadedPackage("vim-mode-plus").path;
      cachedPaths = Object.keys(require.cache).filter(function(p) {
        return p.startsWith(packPath + pathSeparator);
      }).map(function(p) {
        return p.replace(packPath, '');
      });
      results = [];
      for (i = 0, len = cachedPaths.length; i < len; i++) {
        cachedPath = cachedPaths[i];
        if (excludeNodModules && cachedPath.search(/node_modules/) >= 0) {
          continue;
        }
        if (focus && cachedPath.search(RegExp("" + focus)) >= 0) {
          cachedPath = '*' + cachedPath;
        }
        results.push(console.log(cachedPath));
      }
      return results;
    };

    Developer.prototype.getAllMarkerCount = function(showEditorsReport) {
      var basename, editor, hlsearch, i, inspect, len, mark, mutation, occurrence, persistentSel, ref1, total, vimState;
      if (showEditorsReport == null) {
        showEditorsReport = false;
      }
      inspect = require('util').inspect;
      basename = require('path').basename;
      total = {
        mark: 0,
        hlsearch: 0,
        mutation: 0,
        occurrence: 0,
        persistentSel: 0
      };
      ref1 = atom.workspace.getTextEditors();
      for (i = 0, len = ref1.length; i < len; i++) {
        editor = ref1[i];
        vimState = getEditorState(editor);
        mark = vimState.mark.markerLayer.getMarkerCount();
        hlsearch = vimState.highlightSearch.markerLayer.getMarkerCount();
        mutation = vimState.mutationManager.markerLayer.getMarkerCount();
        occurrence = vimState.occurrenceManager.markerLayer.getMarkerCount();
        persistentSel = vimState.persistentSelection.markerLayer.getMarkerCount();
        if (showEditorsReport) {
          console.log(basename(editor.getPath()), inspect({
            mark: mark,
            hlsearch: hlsearch,
            mutation: mutation,
            occurrence: occurrence,
            persistentSel: persistentSel
          }));
        }
        total.mark += mark;
        total.hlsearch += hlsearch;
        total.mutation += mutation;
        total.occurrence += occurrence;
        total.persistentSel += persistentSel;
      }
      return console.log('total', inspect(total));
    };

    Developer.prototype.reload = function(reloadDependencies) {
      var activate, deactivate, invalidateRequireCacheForPackage, loadedPackages, packages, pathSeparator;
      pathSeparator = require('path').sep;
      packages = ['vim-mode-plus'];
      if (reloadDependencies) {
        packages.push.apply(packages, settings.get('devReloadPackages'));
      }
      invalidateRequireCacheForPackage = function(packPath) {
        return Object.keys(require.cache).filter(function(p) {
          return p.startsWith(packPath + pathSeparator);
        }).forEach(function(p) {
          return delete require.cache[p];
        });
      };
      deactivate = function(packName) {
        var packPath;
        console.log("- deactivating " + packName);
        packPath = atom.packages.getLoadedPackage(packName).path;
        atom.packages.deactivatePackage(packName);
        atom.packages.unloadPackage(packName);
        return invalidateRequireCacheForPackage(packPath);
      };
      activate = function(packName) {
        console.log("+ activating " + packName);
        atom.packages.loadPackage(packName);
        return atom.packages.activatePackage(packName);
      };
      loadedPackages = packages.filter(function(packName) {
        return atom.packages.getLoadedPackages(packName);
      });
      console.log("reload", loadedPackages);
      loadedPackages.map(deactivate);
      console.time('activate');
      loadedPackages.map(activate);
      return console.timeEnd('activate');
    };

    Developer.prototype.addCommand = function(name, fn) {
      return atom.commands.add('atom-text-editor', "vim-mode-plus:" + name, fn);
    };

    Developer.prototype.clearDebugOutput = function(name, fn) {
      var filePath, normalize, options;
      normalize = require('fs-plus').normalize;
      filePath = normalize(settings.get('debugOutputFilePath'));
      options = {
        searchAllPanes: true,
        activatePane: false
      };
      return atom.workspace.open(filePath, options).then(function(editor) {
        editor.setText('');
        return editor.save();
      });
    };

    Developer.prototype.toggleDebug = function() {
      settings.set('debug', !settings.get('debug'));
      return console.log(settings.scope + " debug:", settings.get('debug'));
    };

    modifierKeyMap = {
      "ctrl-cmd-": '\u2303\u2318',
      "cmd-": '\u2318',
      "ctrl-": '\u2303',
      alt: '\u2325',
      option: '\u2325',
      enter: '\u23ce',
      left: '\u2190',
      right: '\u2192',
      up: '\u2191',
      down: '\u2193',
      backspace: 'BS',
      space: 'SPC'
    };

    selectorMap = {
      "atom-text-editor.vim-mode-plus": '',
      ".normal-mode": 'n',
      ".insert-mode": 'i',
      ".replace": 'R',
      ".visual-mode": 'v',
      ".characterwise": 'C',
      ".blockwise": 'B',
      ".linewise": 'L',
      ".operator-pending-mode": 'o',
      ".with-count": '#',
      ".has-persistent-selection": '%'
    };

    Developer.prototype.getCommandSpecs = function() {
      var _, commandName, commands, compactKeystrokes, compactSelector, description, getAncestors, getKeyBindingForCommand, keymap, keymaps, kind, klass, name, ref1;
      _ = require('underscore-plus');
      compactSelector = function(selector) {
        var pattern;
        pattern = RegExp("(" + (_.keys(selectorMap).map(_.escapeRegExp).join('|')) + ")", "g");
        return selector.split(/,\s*/g).map(function(scope) {
          return scope.replace(/:not\((.*)\)/, '!$1').replace(pattern, function(s) {
            return selectorMap[s];
          });
        }).join(",");
      };
      compactKeystrokes = function(keystrokes) {
        var modifierKeyRegexp, specialChars, specialCharsRegexp;
        specialChars = '\\`*_{}[]()#+-.!';
        specialCharsRegexp = RegExp("" + (specialChars.split('').map(_.escapeRegExp).join('|')), "g");
        modifierKeyRegexp = RegExp("(" + (_.keys(modifierKeyMap).map(_.escapeRegExp).join('|')) + ")");
        return keystrokes.replace(modifierKeyRegexp, function(s) {
          return modifierKeyMap[s];
        }).replace(RegExp("(" + specialCharsRegexp + ")", "g"), "\\$1").replace(/\|/g, '&#124;').replace(/\s+/, '');
      };
      ref1 = this.vimstate.utils, getKeyBindingForCommand = ref1.getKeyBindingForCommand, getAncestors = ref1.getAncestors;
      commands = (function() {
        var ref2, ref3, results;
        ref2 = Base.getClassRegistry();
        results = [];
        for (name in ref2) {
          klass = ref2[name];
          if (!(klass.isCommand())) {
            continue;
          }
          kind = getAncestors(klass).map(function(k) {
            return k.name;
          }).slice(-2, -1)[0];
          commandName = klass.getCommandName();
          description = (ref3 = klass.getDesctiption()) != null ? ref3.replace(/\n/g, '<br/>') : void 0;
          keymap = null;
          if (keymaps = getKeyBindingForCommand(commandName, {
            packageName: "vim-mode-plus"
          })) {
            keymap = keymaps.map(function(arg) {
              var keystrokes, selector;
              keystrokes = arg.keystrokes, selector = arg.selector;
              return "`" + (compactSelector(selector)) + "` <code>" + (compactKeystrokes(keystrokes)) + "</code>";
            }).join("<br/>");
          }
          results.push({
            name: name,
            commandName: commandName,
            kind: kind,
            description: description,
            keymap: keymap
          });
        }
        return results;
      })();
      return commands;
    };

    Developer.prototype.generateCommandTableForMotion = function() {
      return require('./motion');
    };

    kinds = ["Operator", "Motion", "TextObject", "InsertMode", "MiscCommand", "Scroll"];

    Developer.prototype.generateSummaryTableForCommandSpecs = function(specs, arg) {
      var _, commandName, description, grouped, header, i, j, keymap, kind, len, len1, ref1, report, str;
      header = (arg != null ? arg : {}).header;
      _ = require('underscore-plus');
      grouped = _.groupBy(specs, 'kind');
      str = "";
      for (i = 0, len = kinds.length; i < len; i++) {
        kind = kinds[i];
        if (!(specs = grouped[kind])) {
          continue;
        }
        report = ["## " + kind, "", "| Keymap | Command | Description |", "|:-------|:--------|:------------|"];
        for (j = 0, len1 = specs.length; j < len1; j++) {
          ref1 = specs[j], keymap = ref1.keymap, commandName = ref1.commandName, description = ref1.description;
          commandName = commandName.replace(/vim-mode-plus:/, '');
          if (description == null) {
            description = "";
          }
          if (keymap == null) {
            keymap = "";
          }
          report.push("| " + keymap + " | `" + commandName + "` | " + description + " |");
        }
        str += report.join("\n") + "\n\n";
      }
      return atom.workspace.open().then(function(editor) {
        if (header != null) {
          editor.insertText(header + "\n");
        }
        return editor.insertText(str);
      });
    };

    Developer.prototype.generateCommandSummaryTable = function() {
      var header;
      header = "## Keymap selector abbreviations\n\nIn this document, following abbreviations are used for shortness.\n\n| Abbrev | Selector                     | Description                         |\n|:-------|:-----------------------------|:------------------------------------|\n| `!i`   | `:not(.insert-mode)`         | except insert-mode                  |\n| `i`    | `.insert-mode`               |                                     |\n| `o`    | `.operator-pending-mode`     |                                     |\n| `n`    | `.normal-mode`               |                                     |\n| `v`    | `.visual-mode`               |                                     |\n| `vB`   | `.visual-mode.blockwise`     |                                     |\n| `vL`   | `.visual-mode.linewise`      |                                     |\n| `vC`   | `.visual-mode.characterwise` |                                     |\n| `iR`   | `.insert-mode.replace`       |                                     |\n| `#`    | `.with-count`                | when count is specified             |\n| `%`    | `.has-persistent-selection` | when persistent-selection is exists |\n";
      return this.generateSummaryTableForCommandSpecs(this.getCommandSpecs(), {
        header: header
      });
    };

    Developer.prototype.openInVim = function() {
      var column, editor, ref1, row;
      editor = atom.workspace.getActiveTextEditor();
      ref1 = editor.getCursorBufferPosition(), row = ref1.row, column = ref1.column;
      return new BufferedProcess({
        command: "/Applications/MacVim.app/Contents/MacOS/Vim",
        args: ['-g', editor.getPath(), "+call cursor(" + (row + 1) + ", " + (column + 1) + ")"]
      });
    };

    Developer.prototype.generateIntrospectionReport = function() {
      var _, generateIntrospectionReport;
      _ = require('underscore-plus');
      generateIntrospectionReport = require('./introspection');
      return generateIntrospectionReport(_.values(Base.getClassRegistry()), {
        excludeProperties: ['run', 'getCommandNameWithoutPrefix', 'getClass', 'extend', 'getParent', 'getAncestors', 'isCommand', 'getClassRegistry', 'command', 'reset', 'getDesctiption', 'description', 'init', 'getCommandName', 'getCommandScope', 'registerCommand', 'delegatesProperties', 'subscriptions', 'commandPrefix', 'commandScope', 'delegatesMethods', 'delegatesProperty', 'delegatesMethod'],
        recursiveInspect: Base
      });
    };

    return Developer;

  })();

  module.exports = Developer;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvZGV2ZWxvcGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBOEQsT0FBQSxDQUFRLE1BQVIsQ0FBOUQsRUFBQyxxQkFBRCxFQUFVLDJCQUFWLEVBQXNCLHFDQUF0QixFQUF1Qzs7RUFFdkMsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxjQUFBLEdBQWlCOztFQUVYO0FBQ0osUUFBQTs7Ozt3QkFBQSxJQUFBLEdBQU0sU0FBQyxlQUFEO0FBQ0osVUFBQTtNQUFBLGNBQUEsR0FBaUI7TUFDakIsSUFBQyxDQUFBLHNCQUFELEdBQTBCLElBQUk7TUFDOUIsSUFBQyxDQUFBLDBCQUFELEdBQThCLElBQUk7TUFFbEMsUUFBQSxHQUNFO1FBQUEsY0FBQSxFQUFnQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxXQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEI7UUFDQSxhQUFBLEVBQWUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsU0FBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRGY7UUFFQSwrQkFBQSxFQUFpQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSwyQkFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRmpDO1FBR0EsZ0NBQUEsRUFBa0MsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsMkJBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhsQztRQUlBLDZCQUFBLEVBQStCLFNBQUE7aUJBQUcsSUFBSSxDQUFDLHVCQUFMLENBQUE7UUFBSCxDQUovQjtRQUtBLG9CQUFBLEVBQXNCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLGdCQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FMdEI7UUFNQSxRQUFBLEVBQVUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTlY7UUFPQSwwQkFBQSxFQUE0QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQVEsSUFBUjtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVA1QjtRQVFBLDJCQUFBLEVBQTZCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLGlCQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FSN0I7UUFTQSwwQ0FBQSxFQUE0QyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxpQkFBRCxDQUFtQixJQUFuQjtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVQ1QztRQVVBLHNCQUFBLEVBQXdCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLGtCQUFELENBQW9CO2NBQUEsaUJBQUEsRUFBbUIsSUFBbkI7YUFBcEI7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FWeEI7UUFXQSwwQkFBQSxFQUE0QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxrQkFBRCxDQUFvQjtjQUFBLGlCQUFBLEVBQW1CLEtBQW5CO2FBQXBCO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBWDVCOztNQWFGLGFBQUEsR0FBZ0IsSUFBSTtBQUNwQixXQUFBLGdCQUFBOztRQUNFLGFBQWEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxVQUFELENBQVksSUFBWixFQUFrQixFQUFsQixDQUFsQjtBQURGO2FBRUE7SUF0Qkk7O3dCQXdCTixrQkFBQSxHQUFvQixTQUFDLEdBQUQ7QUFDbEIsVUFBQTtNQURvQixtQkFBTztNQUMzQixhQUFBLEdBQWdCLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQztNQUNoQyxRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixlQUEvQixDQUErQyxDQUFDO01BQzNELFdBQUEsR0FBYyxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQU8sQ0FBQyxLQUFwQixDQUNaLENBQUMsTUFEVyxDQUNKLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxVQUFGLENBQWEsUUFBQSxHQUFXLGFBQXhCO01BQVAsQ0FESSxDQUVaLENBQUMsR0FGVyxDQUVQLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxPQUFGLENBQVUsUUFBVixFQUFvQixFQUFwQjtNQUFQLENBRk87QUFJZDtXQUFBLDZDQUFBOztRQUNFLElBQUcsaUJBQUEsSUFBc0IsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsY0FBbEIsQ0FBQSxJQUFxQyxDQUE5RDtBQUNFLG1CQURGOztRQUVBLElBQUcsS0FBQSxJQUFVLFVBQVUsQ0FBQyxNQUFYLENBQWtCLE1BQUEsQ0FBQSxFQUFBLEdBQUssS0FBTCxDQUFsQixDQUFBLElBQXFDLENBQWxEO1VBQ0UsVUFBQSxHQUFhLEdBQUEsR0FBTSxXQURyQjs7cUJBRUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFaO0FBTEY7O0lBUGtCOzt3QkFjcEIsaUJBQUEsR0FBbUIsU0FBQyxpQkFBRDtBQUNqQixVQUFBOztRQURrQixvQkFBa0I7O01BQ25DLFVBQVcsT0FBQSxDQUFRLE1BQVI7TUFDWixRQUFBLEdBQVcsT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDO01BQzNCLEtBQUEsR0FDRTtRQUFBLElBQUEsRUFBTSxDQUFOO1FBQ0EsUUFBQSxFQUFVLENBRFY7UUFFQSxRQUFBLEVBQVUsQ0FGVjtRQUdBLFVBQUEsRUFBWSxDQUhaO1FBSUEsYUFBQSxFQUFlLENBSmY7O0FBTUY7QUFBQSxXQUFBLHNDQUFBOztRQUNFLFFBQUEsR0FBVyxjQUFBLENBQWUsTUFBZjtRQUNYLElBQUEsR0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUExQixDQUFBO1FBQ1AsUUFBQSxHQUFXLFFBQVEsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLGNBQXJDLENBQUE7UUFDWCxRQUFBLEdBQVcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsY0FBckMsQ0FBQTtRQUNYLFVBQUEsR0FBYSxRQUFRLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLGNBQXZDLENBQUE7UUFDYixhQUFBLEdBQWdCLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsY0FBekMsQ0FBQTtRQUNoQixJQUFHLGlCQUFIO1VBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxRQUFBLENBQVMsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFULENBQVosRUFBd0MsT0FBQSxDQUFRO1lBQUMsTUFBQSxJQUFEO1lBQU8sVUFBQSxRQUFQO1lBQWlCLFVBQUEsUUFBakI7WUFBMkIsWUFBQSxVQUEzQjtZQUF1QyxlQUFBLGFBQXZDO1dBQVIsQ0FBeEMsRUFERjs7UUFHQSxLQUFLLENBQUMsSUFBTixJQUFjO1FBQ2QsS0FBSyxDQUFDLFFBQU4sSUFBa0I7UUFDbEIsS0FBSyxDQUFDLFFBQU4sSUFBa0I7UUFDbEIsS0FBSyxDQUFDLFVBQU4sSUFBb0I7UUFDcEIsS0FBSyxDQUFDLGFBQU4sSUFBdUI7QUFkekI7YUFnQkEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBQXFCLE9BQUEsQ0FBUSxLQUFSLENBQXJCO0lBMUJpQjs7d0JBNEJuQixNQUFBLEdBQVEsU0FBQyxrQkFBRDtBQUNOLFVBQUE7TUFBQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQztNQUVoQyxRQUFBLEdBQVcsQ0FBQyxlQUFEO01BQ1gsSUFBRyxrQkFBSDtRQUNFLFFBQVEsQ0FBQyxJQUFULGlCQUFjLFFBQVEsQ0FBQyxHQUFULENBQWEsbUJBQWIsQ0FBZCxFQURGOztNQUdBLGdDQUFBLEdBQW1DLFNBQUMsUUFBRDtlQUNqQyxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQU8sQ0FBQyxLQUFwQixDQUNFLENBQUMsTUFESCxDQUNVLFNBQUMsQ0FBRDtpQkFBTyxDQUFDLENBQUMsVUFBRixDQUFhLFFBQUEsR0FBVyxhQUF4QjtRQUFQLENBRFYsQ0FFRSxDQUFDLE9BRkgsQ0FFVyxTQUFDLENBQUQ7aUJBQU8sT0FBTyxPQUFPLENBQUMsS0FBTSxDQUFBLENBQUE7UUFBNUIsQ0FGWDtNQURpQztNQUtuQyxVQUFBLEdBQWEsU0FBQyxRQUFEO0FBQ1gsWUFBQTtRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksaUJBQUEsR0FBa0IsUUFBOUI7UUFDQSxRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixRQUEvQixDQUF3QyxDQUFDO1FBQ3BELElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWQsQ0FBZ0MsUUFBaEM7UUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWQsQ0FBNEIsUUFBNUI7ZUFDQSxnQ0FBQSxDQUFpQyxRQUFqQztNQUxXO01BT2IsUUFBQSxHQUFXLFNBQUMsUUFBRDtRQUNULE9BQU8sQ0FBQyxHQUFSLENBQVksZUFBQSxHQUFnQixRQUE1QjtRQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBZCxDQUEwQixRQUExQjtlQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixRQUE5QjtNQUhTO01BS1gsY0FBQSxHQUFpQixRQUFRLENBQUMsTUFBVCxDQUFnQixTQUFDLFFBQUQ7ZUFBYyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFkLENBQWdDLFFBQWhDO01BQWQsQ0FBaEI7TUFDakIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxRQUFaLEVBQXNCLGNBQXRCO01BQ0EsY0FBYyxDQUFDLEdBQWYsQ0FBbUIsVUFBbkI7TUFDQSxPQUFPLENBQUMsSUFBUixDQUFhLFVBQWI7TUFDQSxjQUFjLENBQUMsR0FBZixDQUFtQixRQUFuQjthQUNBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFVBQWhCO0lBN0JNOzt3QkErQlIsVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLEVBQVA7YUFDVixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isa0JBQWxCLEVBQXNDLGdCQUFBLEdBQWlCLElBQXZELEVBQStELEVBQS9EO0lBRFU7O3dCQUdaLGdCQUFBLEdBQWtCLFNBQUMsSUFBRCxFQUFPLEVBQVA7QUFDaEIsVUFBQTtNQUFDLFlBQWEsT0FBQSxDQUFRLFNBQVI7TUFDZCxRQUFBLEdBQVcsU0FBQSxDQUFVLFFBQVEsQ0FBQyxHQUFULENBQWEscUJBQWIsQ0FBVjtNQUNYLE9BQUEsR0FBVTtRQUFDLGNBQUEsRUFBZ0IsSUFBakI7UUFBdUIsWUFBQSxFQUFjLEtBQXJDOzthQUNWLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixRQUFwQixFQUE4QixPQUE5QixDQUFzQyxDQUFDLElBQXZDLENBQTRDLFNBQUMsTUFBRDtRQUMxQyxNQUFNLENBQUMsT0FBUCxDQUFlLEVBQWY7ZUFDQSxNQUFNLENBQUMsSUFBUCxDQUFBO01BRjBDLENBQTVDO0lBSmdCOzt3QkFRbEIsV0FBQSxHQUFhLFNBQUE7TUFDWCxRQUFRLENBQUMsR0FBVCxDQUFhLE9BQWIsRUFBc0IsQ0FBSSxRQUFRLENBQUMsR0FBVCxDQUFhLE9BQWIsQ0FBMUI7YUFDQSxPQUFPLENBQUMsR0FBUixDQUFlLFFBQVEsQ0FBQyxLQUFWLEdBQWdCLFNBQTlCLEVBQXdDLFFBQVEsQ0FBQyxHQUFULENBQWEsT0FBYixDQUF4QztJQUZXOztJQUtiLGNBQUEsR0FDRTtNQUFBLFdBQUEsRUFBYSxjQUFiO01BQ0EsTUFBQSxFQUFRLFFBRFI7TUFFQSxPQUFBLEVBQVMsUUFGVDtNQUdBLEdBQUEsRUFBSyxRQUhMO01BSUEsTUFBQSxFQUFRLFFBSlI7TUFLQSxLQUFBLEVBQU8sUUFMUDtNQU1BLElBQUEsRUFBTSxRQU5OO01BT0EsS0FBQSxFQUFPLFFBUFA7TUFRQSxFQUFBLEVBQUksUUFSSjtNQVNBLElBQUEsRUFBTSxRQVROO01BVUEsU0FBQSxFQUFXLElBVlg7TUFXQSxLQUFBLEVBQU8sS0FYUDs7O0lBYUYsV0FBQSxHQUNFO01BQUEsZ0NBQUEsRUFBa0MsRUFBbEM7TUFDQSxjQUFBLEVBQWdCLEdBRGhCO01BRUEsY0FBQSxFQUFnQixHQUZoQjtNQUdBLFVBQUEsRUFBWSxHQUhaO01BSUEsY0FBQSxFQUFnQixHQUpoQjtNQUtBLGdCQUFBLEVBQWtCLEdBTGxCO01BTUEsWUFBQSxFQUFjLEdBTmQ7TUFPQSxXQUFBLEVBQWEsR0FQYjtNQVFBLHdCQUFBLEVBQTBCLEdBUjFCO01BU0EsYUFBQSxFQUFlLEdBVGY7TUFVQSwyQkFBQSxFQUE2QixHQVY3Qjs7O3dCQVlGLGVBQUEsR0FBaUIsU0FBQTtBQUNmLFVBQUE7TUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSO01BRUosZUFBQSxHQUFrQixTQUFDLFFBQUQ7QUFDaEIsWUFBQTtRQUFBLE9BQUEsR0FBVSxNQUFBLENBQUEsR0FBQSxHQUFLLENBQUMsQ0FBQyxDQUFDLElBQUYsQ0FBTyxXQUFQLENBQW1CLENBQUMsR0FBcEIsQ0FBd0IsQ0FBQyxDQUFDLFlBQTFCLENBQXVDLENBQUMsSUFBeEMsQ0FBNkMsR0FBN0MsQ0FBRCxDQUFMLEdBQXdELEdBQXhELEVBQTRELEdBQTVEO2VBQ1YsUUFBUSxDQUFDLEtBQVQsQ0FBZSxPQUFmLENBQXVCLENBQUMsR0FBeEIsQ0FBNEIsU0FBQyxLQUFEO2lCQUMxQixLQUNFLENBQUMsT0FESCxDQUNXLGNBRFgsRUFDMkIsS0FEM0IsQ0FFRSxDQUFDLE9BRkgsQ0FFVyxPQUZYLEVBRW9CLFNBQUMsQ0FBRDttQkFBTyxXQUFZLENBQUEsQ0FBQTtVQUFuQixDQUZwQjtRQUQwQixDQUE1QixDQUlBLENBQUMsSUFKRCxDQUlNLEdBSk47TUFGZ0I7TUFRbEIsaUJBQUEsR0FBb0IsU0FBQyxVQUFEO0FBQ2xCLFlBQUE7UUFBQSxZQUFBLEdBQWU7UUFDZixrQkFBQSxHQUFxQixNQUFBLENBQUEsRUFBQSxHQUFJLENBQUMsWUFBWSxDQUFDLEtBQWIsQ0FBbUIsRUFBbkIsQ0FBc0IsQ0FBQyxHQUF2QixDQUEyQixDQUFDLENBQUMsWUFBN0IsQ0FBMEMsQ0FBQyxJQUEzQyxDQUFnRCxHQUFoRCxDQUFELENBQUosRUFBNkQsR0FBN0Q7UUFDckIsaUJBQUEsR0FBb0IsTUFBQSxDQUFBLEdBQUEsR0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFGLENBQU8sY0FBUCxDQUFzQixDQUFDLEdBQXZCLENBQTJCLENBQUMsQ0FBQyxZQUE3QixDQUEwQyxDQUFDLElBQTNDLENBQWdELEdBQWhELENBQUQsQ0FBTCxHQUEyRCxHQUEzRDtlQUNwQixVQUVFLENBQUMsT0FGSCxDQUVXLGlCQUZYLEVBRThCLFNBQUMsQ0FBRDtpQkFBTyxjQUFlLENBQUEsQ0FBQTtRQUF0QixDQUY5QixDQUdFLENBQUMsT0FISCxDQUdXLE1BQUEsQ0FBQSxHQUFBLEdBQU0sa0JBQU4sR0FBeUIsR0FBekIsRUFBNkIsR0FBN0IsQ0FIWCxFQUcyQyxNQUgzQyxDQUlFLENBQUMsT0FKSCxDQUlXLEtBSlgsRUFJa0IsUUFKbEIsQ0FLRSxDQUFDLE9BTEgsQ0FLVyxLQUxYLEVBS2tCLEVBTGxCO01BSmtCO01BV3BCLE9BQTBDLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBcEQsRUFBQyxzREFBRCxFQUEwQjtNQUMxQixRQUFBOztBQUNFO0FBQUE7YUFBQSxZQUFBOztnQkFBZ0QsS0FBSyxDQUFDLFNBQU4sQ0FBQTs7O1VBQzlDLElBQUEsR0FBTyxZQUFBLENBQWEsS0FBYixDQUFtQixDQUFDLEdBQXBCLENBQXdCLFNBQUMsQ0FBRDttQkFBTyxDQUFDLENBQUM7VUFBVCxDQUF4QixDQUF1QyxjQUFRLENBQUEsQ0FBQTtVQUN0RCxXQUFBLEdBQWMsS0FBSyxDQUFDLGNBQU4sQ0FBQTtVQUNkLFdBQUEsaURBQW9DLENBQUUsT0FBeEIsQ0FBZ0MsS0FBaEMsRUFBdUMsT0FBdkM7VUFFZCxNQUFBLEdBQVM7VUFDVCxJQUFHLE9BQUEsR0FBVSx1QkFBQSxDQUF3QixXQUF4QixFQUFxQztZQUFBLFdBQUEsRUFBYSxlQUFiO1dBQXJDLENBQWI7WUFDRSxNQUFBLEdBQVMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxTQUFDLEdBQUQ7QUFDbkIsa0JBQUE7Y0FEcUIsNkJBQVk7cUJBQ2pDLEdBQUEsR0FBRyxDQUFDLGVBQUEsQ0FBZ0IsUUFBaEIsQ0FBRCxDQUFILEdBQThCLFVBQTlCLEdBQXVDLENBQUMsaUJBQUEsQ0FBa0IsVUFBbEIsQ0FBRCxDQUF2QyxHQUFzRTtZQURuRCxDQUFaLENBRVQsQ0FBQyxJQUZRLENBRUgsT0FGRyxFQURYOzt1QkFLQTtZQUFDLE1BQUEsSUFBRDtZQUFPLGFBQUEsV0FBUDtZQUFvQixNQUFBLElBQXBCO1lBQTBCLGFBQUEsV0FBMUI7WUFBdUMsUUFBQSxNQUF2Qzs7QUFYRjs7O2FBYUY7SUFyQ2U7O3dCQXVDakIsNkJBQUEsR0FBK0IsU0FBQTthQUM3QixPQUFBLENBQVEsVUFBUjtJQUQ2Qjs7SUFJL0IsS0FBQSxHQUFRLENBQUMsVUFBRCxFQUFhLFFBQWIsRUFBdUIsWUFBdkIsRUFBcUMsWUFBckMsRUFBbUQsYUFBbkQsRUFBa0UsUUFBbEU7O3dCQUNSLG1DQUFBLEdBQXFDLFNBQUMsS0FBRCxFQUFRLEdBQVI7QUFDbkMsVUFBQTtNQUQ0Qyx3QkFBRCxNQUFTO01BQ3BELENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7TUFFSixPQUFBLEdBQVUsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFWLEVBQWlCLE1BQWpCO01BQ1YsR0FBQSxHQUFNO0FBQ04sV0FBQSx1Q0FBQTs7Y0FBdUIsS0FBQSxHQUFRLE9BQVEsQ0FBQSxJQUFBOzs7UUFFckMsTUFBQSxHQUFTLENBQ1AsS0FBQSxHQUFNLElBREMsRUFFUCxFQUZPLEVBR1Asb0NBSE8sRUFJUCxvQ0FKTztBQU1ULGFBQUEseUNBQUE7MkJBQUssc0JBQVEsZ0NBQWE7VUFDeEIsV0FBQSxHQUFjLFdBQVcsQ0FBQyxPQUFaLENBQW9CLGdCQUFwQixFQUFzQyxFQUF0Qzs7WUFDZCxjQUFlOzs7WUFDZixTQUFVOztVQUNWLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQSxHQUFLLE1BQUwsR0FBWSxNQUFaLEdBQWtCLFdBQWxCLEdBQThCLE1BQTlCLEdBQW9DLFdBQXBDLEdBQWdELElBQTVEO0FBSkY7UUFLQSxHQUFBLElBQU8sTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaLENBQUEsR0FBb0I7QUFiN0I7YUFlQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBQSxDQUFxQixDQUFDLElBQXRCLENBQTJCLFNBQUMsTUFBRDtRQUN6QixJQUFvQyxjQUFwQztVQUFBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLE1BQUEsR0FBUyxJQUEzQixFQUFBOztlQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEdBQWxCO01BRnlCLENBQTNCO0lBcEJtQzs7d0JBd0JyQywyQkFBQSxHQUE2QixTQUFBO0FBQzNCLFVBQUE7TUFBQSxNQUFBLEdBQVM7YUFvQlQsSUFBQyxDQUFBLG1DQUFELENBQXFDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBckMsRUFBeUQ7UUFBQyxRQUFBLE1BQUQ7T0FBekQ7SUFyQjJCOzt3QkF1QjdCLFNBQUEsR0FBVyxTQUFBO0FBQ1QsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7TUFDVCxPQUFnQixNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFoQixFQUFDLGNBQUQsRUFBTTthQUVGLElBQUEsZUFBQSxDQUNGO1FBQUEsT0FBQSxFQUFTLDZDQUFUO1FBQ0EsSUFBQSxFQUFNLENBQUMsSUFBRCxFQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBUCxFQUF5QixlQUFBLEdBQWUsQ0FBQyxHQUFBLEdBQUksQ0FBTCxDQUFmLEdBQXNCLElBQXRCLEdBQXlCLENBQUMsTUFBQSxHQUFPLENBQVIsQ0FBekIsR0FBbUMsR0FBNUQsQ0FETjtPQURFO0lBSks7O3dCQVFYLDJCQUFBLEdBQTZCLFNBQUE7QUFDM0IsVUFBQTtNQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7TUFDSiwyQkFBQSxHQUE4QixPQUFBLENBQVEsaUJBQVI7YUFFOUIsMkJBQUEsQ0FBNEIsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFJLENBQUMsZ0JBQUwsQ0FBQSxDQUFULENBQTVCLEVBQ0U7UUFBQSxpQkFBQSxFQUFtQixDQUNqQixLQURpQixFQUVqQiw2QkFGaUIsRUFHakIsVUFIaUIsRUFHTCxRQUhLLEVBR0ssV0FITCxFQUdrQixjQUhsQixFQUdrQyxXQUhsQyxFQUlqQixrQkFKaUIsRUFJRyxTQUpILEVBSWMsT0FKZCxFQUtqQixnQkFMaUIsRUFLQyxhQUxELEVBTWpCLE1BTmlCLEVBTVQsZ0JBTlMsRUFNUyxpQkFOVCxFQU00QixpQkFONUIsRUFPakIscUJBUGlCLEVBT00sZUFQTixFQU91QixlQVB2QixFQU93QyxjQVB4QyxFQVFqQixrQkFSaUIsRUFTakIsbUJBVGlCLEVBVWpCLGlCQVZpQixDQUFuQjtRQVlBLGdCQUFBLEVBQWtCLElBWmxCO09BREY7SUFKMkI7Ozs7OztFQW1CL0IsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF6UWpCIiwic291cmNlc0NvbnRlbnQiOlsie0VtaXR0ZXIsIERpc3Bvc2FibGUsIEJ1ZmZlcmVkUHJvY2VzcywgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuZ2V0RWRpdG9yU3RhdGUgPSBudWxsXG5cbmNsYXNzIERldmVsb3BlclxuICBpbml0OiAoX2dldEVkaXRvclN0YXRlKSAtPlxuICAgIGdldEVkaXRvclN0YXRlID0gX2dldEVkaXRvclN0YXRlXG4gICAgQGRldkVudmlyb25tZW50QnlCdWZmZXIgPSBuZXcgTWFwXG4gICAgQHJlbG9hZFN1YnNjcmlwdGlvbkJ5QnVmZmVyID0gbmV3IE1hcFxuXG4gICAgY29tbWFuZHMgPVxuICAgICAgJ3RvZ2dsZS1kZWJ1Zyc6ID0+IEB0b2dnbGVEZWJ1ZygpXG4gICAgICAnb3Blbi1pbi12aW0nOiA9PiBAb3BlbkluVmltKClcbiAgICAgICdnZW5lcmF0ZS1pbnRyb3NwZWN0aW9uLXJlcG9ydCc6ID0+IEBnZW5lcmF0ZUludHJvc3BlY3Rpb25SZXBvcnQoKVxuICAgICAgJ2dlbmVyYXRlLWNvbW1hbmQtc3VtbWFyeS10YWJsZSc6ID0+IEBnZW5lcmF0ZUNvbW1hbmRTdW1tYXJ5VGFibGUoKVxuICAgICAgJ3dyaXRlLWNvbW1hbmQtdGFibGUtb24tZGlzayc6IC0+IEJhc2Uud3JpdGVDb21tYW5kVGFibGVPbkRpc2soKVxuICAgICAgJ2NsZWFyLWRlYnVnLW91dHB1dCc6ID0+IEBjbGVhckRlYnVnT3V0cHV0KClcbiAgICAgICdyZWxvYWQnOiA9PiBAcmVsb2FkKClcbiAgICAgICdyZWxvYWQtd2l0aC1kZXBlbmRlbmNpZXMnOiA9PiBAcmVsb2FkKHRydWUpXG4gICAgICAncmVwb3J0LXRvdGFsLW1hcmtlci1jb3VudCc6ID0+IEBnZXRBbGxNYXJrZXJDb3VudCgpXG4gICAgICAncmVwb3J0LXRvdGFsLWFuZC1wZXItZWRpdG9yLW1hcmtlci1jb3VudCc6ID0+IEBnZXRBbGxNYXJrZXJDb3VudCh0cnVlKVxuICAgICAgJ3JlcG9ydC1yZXF1aXJlLWNhY2hlJzogPT4gQHJlcG9ydFJlcXVpcmVDYWNoZShleGNsdWRlTm9kTW9kdWxlczogdHJ1ZSlcbiAgICAgICdyZXBvcnQtcmVxdWlyZS1jYWNoZS1hbGwnOiA9PiBAcmVwb3J0UmVxdWlyZUNhY2hlKGV4Y2x1ZGVOb2RNb2R1bGVzOiBmYWxzZSlcblxuICAgIHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIGZvciBuYW1lLCBmbiBvZiBjb21tYW5kc1xuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQgQGFkZENvbW1hbmQobmFtZSwgZm4pXG4gICAgc3Vic2NyaXB0aW9uc1xuXG4gIHJlcG9ydFJlcXVpcmVDYWNoZTogKHtmb2N1cywgZXhjbHVkZU5vZE1vZHVsZXN9KSAtPlxuICAgIHBhdGhTZXBhcmF0b3IgPSByZXF1aXJlKCdwYXRoJykuc2VwXG4gICAgcGFja1BhdGggPSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoXCJ2aW0tbW9kZS1wbHVzXCIpLnBhdGhcbiAgICBjYWNoZWRQYXRocyA9IE9iamVjdC5rZXlzKHJlcXVpcmUuY2FjaGUpXG4gICAgICAuZmlsdGVyIChwKSAtPiBwLnN0YXJ0c1dpdGgocGFja1BhdGggKyBwYXRoU2VwYXJhdG9yKVxuICAgICAgLm1hcCAocCkgLT4gcC5yZXBsYWNlKHBhY2tQYXRoLCAnJylcblxuICAgIGZvciBjYWNoZWRQYXRoIGluIGNhY2hlZFBhdGhzXG4gICAgICBpZiBleGNsdWRlTm9kTW9kdWxlcyBhbmQgY2FjaGVkUGF0aC5zZWFyY2goL25vZGVfbW9kdWxlcy8pID49IDBcbiAgICAgICAgY29udGludWVcbiAgICAgIGlmIGZvY3VzIGFuZCBjYWNoZWRQYXRoLnNlYXJjaCgvLy8je2ZvY3VzfS8vLykgPj0gMFxuICAgICAgICBjYWNoZWRQYXRoID0gJyonICsgY2FjaGVkUGF0aFxuICAgICAgY29uc29sZS5sb2cgY2FjaGVkUGF0aFxuXG4gIGdldEFsbE1hcmtlckNvdW50OiAoc2hvd0VkaXRvcnNSZXBvcnQ9ZmFsc2UpIC0+XG4gICAge2luc3BlY3R9ID0gcmVxdWlyZSAndXRpbCdcbiAgICBiYXNlbmFtZSA9IHJlcXVpcmUoJ3BhdGgnKS5iYXNlbmFtZVxuICAgIHRvdGFsID1cbiAgICAgIG1hcms6IDBcbiAgICAgIGhsc2VhcmNoOiAwXG4gICAgICBtdXRhdGlvbjogMFxuICAgICAgb2NjdXJyZW5jZTogMFxuICAgICAgcGVyc2lzdGVudFNlbDogMFxuXG4gICAgZm9yIGVkaXRvciBpbiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpXG4gICAgICB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKGVkaXRvcilcbiAgICAgIG1hcmsgPSB2aW1TdGF0ZS5tYXJrLm1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcbiAgICAgIGhsc2VhcmNoID0gdmltU3RhdGUuaGlnaGxpZ2h0U2VhcmNoLm1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcbiAgICAgIG11dGF0aW9uID0gdmltU3RhdGUubXV0YXRpb25NYW5hZ2VyLm1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcbiAgICAgIG9jY3VycmVuY2UgPSB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5tYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpXG4gICAgICBwZXJzaXN0ZW50U2VsID0gdmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5tYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpXG4gICAgICBpZiBzaG93RWRpdG9yc1JlcG9ydFxuICAgICAgICBjb25zb2xlLmxvZyBiYXNlbmFtZShlZGl0b3IuZ2V0UGF0aCgpKSwgaW5zcGVjdCh7bWFyaywgaGxzZWFyY2gsIG11dGF0aW9uLCBvY2N1cnJlbmNlLCBwZXJzaXN0ZW50U2VsfSlcblxuICAgICAgdG90YWwubWFyayArPSBtYXJrXG4gICAgICB0b3RhbC5obHNlYXJjaCArPSBobHNlYXJjaFxuICAgICAgdG90YWwubXV0YXRpb24gKz0gbXV0YXRpb25cbiAgICAgIHRvdGFsLm9jY3VycmVuY2UgKz0gb2NjdXJyZW5jZVxuICAgICAgdG90YWwucGVyc2lzdGVudFNlbCArPSBwZXJzaXN0ZW50U2VsXG5cbiAgICBjb25zb2xlLmxvZyAndG90YWwnLCBpbnNwZWN0KHRvdGFsKVxuXG4gIHJlbG9hZDogKHJlbG9hZERlcGVuZGVuY2llcykgLT5cbiAgICBwYXRoU2VwYXJhdG9yID0gcmVxdWlyZSgncGF0aCcpLnNlcFxuXG4gICAgcGFja2FnZXMgPSBbJ3ZpbS1tb2RlLXBsdXMnXVxuICAgIGlmIHJlbG9hZERlcGVuZGVuY2llc1xuICAgICAgcGFja2FnZXMucHVzaChzZXR0aW5ncy5nZXQoJ2RldlJlbG9hZFBhY2thZ2VzJykuLi4pXG5cbiAgICBpbnZhbGlkYXRlUmVxdWlyZUNhY2hlRm9yUGFja2FnZSA9IChwYWNrUGF0aCkgLT5cbiAgICAgIE9iamVjdC5rZXlzKHJlcXVpcmUuY2FjaGUpXG4gICAgICAgIC5maWx0ZXIgKHApIC0+IHAuc3RhcnRzV2l0aChwYWNrUGF0aCArIHBhdGhTZXBhcmF0b3IpXG4gICAgICAgIC5mb3JFYWNoIChwKSAtPiBkZWxldGUgcmVxdWlyZS5jYWNoZVtwXVxuXG4gICAgZGVhY3RpdmF0ZSA9IChwYWNrTmFtZSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIFwiLSBkZWFjdGl2YXRpbmcgI3twYWNrTmFtZX1cIlxuICAgICAgcGFja1BhdGggPSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UocGFja05hbWUpLnBhdGhcbiAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UocGFja05hbWUpXG4gICAgICBhdG9tLnBhY2thZ2VzLnVubG9hZFBhY2thZ2UocGFja05hbWUpXG4gICAgICBpbnZhbGlkYXRlUmVxdWlyZUNhY2hlRm9yUGFja2FnZShwYWNrUGF0aClcblxuICAgIGFjdGl2YXRlID0gKHBhY2tOYW1lKSAtPlxuICAgICAgY29uc29sZS5sb2cgXCIrIGFjdGl2YXRpbmcgI3twYWNrTmFtZX1cIlxuICAgICAgYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZShwYWNrTmFtZSlcbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKHBhY2tOYW1lKVxuXG4gICAgbG9hZGVkUGFja2FnZXMgPSBwYWNrYWdlcy5maWx0ZXIgKHBhY2tOYW1lKSAtPiBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2VzKHBhY2tOYW1lKVxuICAgIGNvbnNvbGUubG9nIFwicmVsb2FkXCIsIGxvYWRlZFBhY2thZ2VzXG4gICAgbG9hZGVkUGFja2FnZXMubWFwKGRlYWN0aXZhdGUpXG4gICAgY29uc29sZS50aW1lKCdhY3RpdmF0ZScpXG4gICAgbG9hZGVkUGFja2FnZXMubWFwKGFjdGl2YXRlKVxuICAgIGNvbnNvbGUudGltZUVuZCgnYWN0aXZhdGUnKVxuXG4gIGFkZENvbW1hbmQ6IChuYW1lLCBmbikgLT5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIFwidmltLW1vZGUtcGx1czoje25hbWV9XCIsIGZuKVxuXG4gIGNsZWFyRGVidWdPdXRwdXQ6IChuYW1lLCBmbikgLT5cbiAgICB7bm9ybWFsaXplfSA9IHJlcXVpcmUoJ2ZzLXBsdXMnKVxuICAgIGZpbGVQYXRoID0gbm9ybWFsaXplKHNldHRpbmdzLmdldCgnZGVidWdPdXRwdXRGaWxlUGF0aCcpKVxuICAgIG9wdGlvbnMgPSB7c2VhcmNoQWxsUGFuZXM6IHRydWUsIGFjdGl2YXRlUGFuZTogZmFsc2V9XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCwgb3B0aW9ucykudGhlbiAoZWRpdG9yKSAtPlxuICAgICAgZWRpdG9yLnNldFRleHQoJycpXG4gICAgICBlZGl0b3Iuc2F2ZSgpXG5cbiAgdG9nZ2xlRGVidWc6IC0+XG4gICAgc2V0dGluZ3Muc2V0KCdkZWJ1ZycsIG5vdCBzZXR0aW5ncy5nZXQoJ2RlYnVnJykpXG4gICAgY29uc29sZS5sb2cgXCIje3NldHRpbmdzLnNjb3BlfSBkZWJ1ZzpcIiwgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpXG5cbiAgIyBCb3Jyb3dlZCBmcm9tIHVuZGVyc2NvcmUtcGx1c1xuICBtb2RpZmllcktleU1hcCA9XG4gICAgXCJjdHJsLWNtZC1cIjogJ1xcdTIzMDNcXHUyMzE4J1xuICAgIFwiY21kLVwiOiAnXFx1MjMxOCdcbiAgICBcImN0cmwtXCI6ICdcXHUyMzAzJ1xuICAgIGFsdDogJ1xcdTIzMjUnXG4gICAgb3B0aW9uOiAnXFx1MjMyNSdcbiAgICBlbnRlcjogJ1xcdTIzY2UnXG4gICAgbGVmdDogJ1xcdTIxOTAnXG4gICAgcmlnaHQ6ICdcXHUyMTkyJ1xuICAgIHVwOiAnXFx1MjE5MSdcbiAgICBkb3duOiAnXFx1MjE5MydcbiAgICBiYWNrc3BhY2U6ICdCUydcbiAgICBzcGFjZTogJ1NQQydcblxuICBzZWxlY3Rvck1hcCA9XG4gICAgXCJhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXNcIjogJydcbiAgICBcIi5ub3JtYWwtbW9kZVwiOiAnbidcbiAgICBcIi5pbnNlcnQtbW9kZVwiOiAnaSdcbiAgICBcIi5yZXBsYWNlXCI6ICdSJ1xuICAgIFwiLnZpc3VhbC1tb2RlXCI6ICd2J1xuICAgIFwiLmNoYXJhY3Rlcndpc2VcIjogJ0MnXG4gICAgXCIuYmxvY2t3aXNlXCI6ICdCJ1xuICAgIFwiLmxpbmV3aXNlXCI6ICdMJ1xuICAgIFwiLm9wZXJhdG9yLXBlbmRpbmctbW9kZVwiOiAnbydcbiAgICBcIi53aXRoLWNvdW50XCI6ICcjJ1xuICAgIFwiLmhhcy1wZXJzaXN0ZW50LXNlbGVjdGlvblwiOiAnJSdcblxuICBnZXRDb21tYW5kU3BlY3M6IC0+XG4gICAgXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuICAgIGNvbXBhY3RTZWxlY3RvciA9IChzZWxlY3RvcikgLT5cbiAgICAgIHBhdHRlcm4gPSAvLy8oI3tfLmtleXMoc2VsZWN0b3JNYXApLm1hcChfLmVzY2FwZVJlZ0V4cCkuam9pbignfCcpfSkvLy9nXG4gICAgICBzZWxlY3Rvci5zcGxpdCgvLFxccyovZykubWFwIChzY29wZSkgLT5cbiAgICAgICAgc2NvcGVcbiAgICAgICAgICAucmVwbGFjZSgvOm5vdFxcKCguKilcXCkvLCAnISQxJylcbiAgICAgICAgICAucmVwbGFjZShwYXR0ZXJuLCAocykgLT4gc2VsZWN0b3JNYXBbc10pXG4gICAgICAuam9pbihcIixcIilcblxuICAgIGNvbXBhY3RLZXlzdHJva2VzID0gKGtleXN0cm9rZXMpIC0+XG4gICAgICBzcGVjaWFsQ2hhcnMgPSAnXFxcXGAqX3t9W10oKSMrLS4hJ1xuICAgICAgc3BlY2lhbENoYXJzUmVnZXhwID0gLy8vI3tzcGVjaWFsQ2hhcnMuc3BsaXQoJycpLm1hcChfLmVzY2FwZVJlZ0V4cCkuam9pbignfCcpfS8vL2dcbiAgICAgIG1vZGlmaWVyS2V5UmVnZXhwID0gLy8vKCN7Xy5rZXlzKG1vZGlmaWVyS2V5TWFwKS5tYXAoXy5lc2NhcGVSZWdFeHApLmpvaW4oJ3wnKX0pLy8vXG4gICAgICBrZXlzdHJva2VzXG4gICAgICAgICMgLnJlcGxhY2UoLyhgfF8pL2csICdcXFxcJDEnKVxuICAgICAgICAucmVwbGFjZShtb2RpZmllcktleVJlZ2V4cCwgKHMpIC0+IG1vZGlmaWVyS2V5TWFwW3NdKVxuICAgICAgICAucmVwbGFjZSgvLy8oI3tzcGVjaWFsQ2hhcnNSZWdleHB9KS8vL2csIFwiXFxcXCQxXCIpXG4gICAgICAgIC5yZXBsYWNlKC9cXHwvZywgJyYjMTI0OycpXG4gICAgICAgIC5yZXBsYWNlKC9cXHMrLywgJycpXG5cbiAgICB7Z2V0S2V5QmluZGluZ0ZvckNvbW1hbmQsIGdldEFuY2VzdG9yc30gPSBAdmltc3RhdGUudXRpbHNcbiAgICBjb21tYW5kcyA9IChcbiAgICAgIGZvciBuYW1lLCBrbGFzcyBvZiBCYXNlLmdldENsYXNzUmVnaXN0cnkoKSB3aGVuIGtsYXNzLmlzQ29tbWFuZCgpXG4gICAgICAgIGtpbmQgPSBnZXRBbmNlc3RvcnMoa2xhc3MpLm1hcCgoaykgLT4gay5uYW1lKVstMi4uLTJdWzBdXG4gICAgICAgIGNvbW1hbmROYW1lID0ga2xhc3MuZ2V0Q29tbWFuZE5hbWUoKVxuICAgICAgICBkZXNjcmlwdGlvbiA9IGtsYXNzLmdldERlc2N0aXB0aW9uKCk/LnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKVxuXG4gICAgICAgIGtleW1hcCA9IG51bGxcbiAgICAgICAgaWYga2V5bWFwcyA9IGdldEtleUJpbmRpbmdGb3JDb21tYW5kKGNvbW1hbmROYW1lLCBwYWNrYWdlTmFtZTogXCJ2aW0tbW9kZS1wbHVzXCIpXG4gICAgICAgICAga2V5bWFwID0ga2V5bWFwcy5tYXAgKHtrZXlzdHJva2VzLCBzZWxlY3Rvcn0pIC0+XG4gICAgICAgICAgICBcImAje2NvbXBhY3RTZWxlY3RvcihzZWxlY3Rvcil9YCA8Y29kZT4je2NvbXBhY3RLZXlzdHJva2VzKGtleXN0cm9rZXMpfTwvY29kZT5cIlxuICAgICAgICAgIC5qb2luKFwiPGJyLz5cIilcblxuICAgICAgICB7bmFtZSwgY29tbWFuZE5hbWUsIGtpbmQsIGRlc2NyaXB0aW9uLCBrZXltYXB9XG4gICAgKVxuICAgIGNvbW1hbmRzXG5cbiAgZ2VuZXJhdGVDb21tYW5kVGFibGVGb3JNb3Rpb246IC0+XG4gICAgcmVxdWlyZSgnLi9tb3Rpb24nKVxuXG5cbiAga2luZHMgPSBbXCJPcGVyYXRvclwiLCBcIk1vdGlvblwiLCBcIlRleHRPYmplY3RcIiwgXCJJbnNlcnRNb2RlXCIsIFwiTWlzY0NvbW1hbmRcIiwgXCJTY3JvbGxcIl1cbiAgZ2VuZXJhdGVTdW1tYXJ5VGFibGVGb3JDb21tYW5kU3BlY3M6IChzcGVjcywge2hlYWRlcn09e30pIC0+XG4gICAgXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuICAgIGdyb3VwZWQgPSBfLmdyb3VwQnkoc3BlY3MsICdraW5kJylcbiAgICBzdHIgPSBcIlwiXG4gICAgZm9yIGtpbmQgaW4ga2luZHMgd2hlbiBzcGVjcyA9IGdyb3VwZWRba2luZF1cblxuICAgICAgcmVwb3J0ID0gW1xuICAgICAgICBcIiMjICN7a2luZH1cIlxuICAgICAgICBcIlwiXG4gICAgICAgIFwifCBLZXltYXAgfCBDb21tYW5kIHwgRGVzY3JpcHRpb24gfFwiXG4gICAgICAgIFwifDotLS0tLS0tfDotLS0tLS0tLXw6LS0tLS0tLS0tLS0tfFwiXG4gICAgICBdXG4gICAgICBmb3Ige2tleW1hcCwgY29tbWFuZE5hbWUsIGRlc2NyaXB0aW9ufSBpbiBzcGVjc1xuICAgICAgICBjb21tYW5kTmFtZSA9IGNvbW1hbmROYW1lLnJlcGxhY2UoL3ZpbS1tb2RlLXBsdXM6LywgJycpXG4gICAgICAgIGRlc2NyaXB0aW9uID89IFwiXCJcbiAgICAgICAga2V5bWFwID89IFwiXCJcbiAgICAgICAgcmVwb3J0LnB1c2ggXCJ8ICN7a2V5bWFwfSB8IGAje2NvbW1hbmROYW1lfWAgfCAje2Rlc2NyaXB0aW9ufSB8XCJcbiAgICAgIHN0ciArPSByZXBvcnQuam9pbihcIlxcblwiKSArIFwiXFxuXFxuXCJcblxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oKS50aGVuIChlZGl0b3IpIC0+XG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dChoZWFkZXIgKyBcIlxcblwiKSBpZiBoZWFkZXI/XG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dChzdHIpXG5cbiAgZ2VuZXJhdGVDb21tYW5kU3VtbWFyeVRhYmxlOiAtPlxuICAgIGhlYWRlciA9IFwiXCJcIlxuICAgICMjIEtleW1hcCBzZWxlY3RvciBhYmJyZXZpYXRpb25zXG5cbiAgICBJbiB0aGlzIGRvY3VtZW50LCBmb2xsb3dpbmcgYWJicmV2aWF0aW9ucyBhcmUgdXNlZCBmb3Igc2hvcnRuZXNzLlxuXG4gICAgfCBBYmJyZXYgfCBTZWxlY3RvciAgICAgICAgICAgICAgICAgICAgIHwgRGVzY3JpcHRpb24gICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIHw6LS0tLS0tLXw6LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18Oi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXxcbiAgICB8IGAhaWAgICB8IGA6bm90KC5pbnNlcnQtbW9kZSlgICAgICAgICAgfCBleGNlcHQgaW5zZXJ0LW1vZGUgICAgICAgICAgICAgICAgICB8XG4gICAgfCBgaWAgICAgfCBgLmluc2VydC1tb2RlYCAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIHwgYG9gICAgIHwgYC5vcGVyYXRvci1wZW5kaW5nLW1vZGVgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICB8IGBuYCAgICB8IGAubm9ybWFsLW1vZGVgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgfCBgdmAgICAgfCBgLnZpc3VhbC1tb2RlYCAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIHwgYHZCYCAgIHwgYC52aXN1YWwtbW9kZS5ibG9ja3dpc2VgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICB8IGB2TGAgICB8IGAudmlzdWFsLW1vZGUubGluZXdpc2VgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgfCBgdkNgICAgfCBgLnZpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2VgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIHwgYGlSYCAgIHwgYC5pbnNlcnQtbW9kZS5yZXBsYWNlYCAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICB8IGAjYCAgICB8IGAud2l0aC1jb3VudGAgICAgICAgICAgICAgICAgfCB3aGVuIGNvdW50IGlzIHNwZWNpZmllZCAgICAgICAgICAgICB8XG4gICAgfCBgJWAgICAgfCBgLmhhcy1wZXJzaXN0ZW50LXNlbGVjdGlvbmAgfCB3aGVuIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGlzIGV4aXN0cyB8XG5cbiAgICBcIlwiXCJcbiAgICBAZ2VuZXJhdGVTdW1tYXJ5VGFibGVGb3JDb21tYW5kU3BlY3MoQGdldENvbW1hbmRTcGVjcygpLCB7aGVhZGVyfSlcblxuICBvcGVuSW5WaW06IC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAge3JvdywgY29sdW1ufSA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgIyBlLmcuIC9BcHBsaWNhdGlvbnMvTWFjVmltLmFwcC9Db250ZW50cy9NYWNPUy9WaW0gLWcgL2V0Yy9ob3N0cyBcIitjYWxsIGN1cnNvcig0LCAzKVwiXG4gICAgbmV3IEJ1ZmZlcmVkUHJvY2Vzc1xuICAgICAgY29tbWFuZDogXCIvQXBwbGljYXRpb25zL01hY1ZpbS5hcHAvQ29udGVudHMvTWFjT1MvVmltXCJcbiAgICAgIGFyZ3M6IFsnLWcnLCBlZGl0b3IuZ2V0UGF0aCgpLCBcIitjYWxsIGN1cnNvcigje3JvdysxfSwgI3tjb2x1bW4rMX0pXCJdXG5cbiAgZ2VuZXJhdGVJbnRyb3NwZWN0aW9uUmVwb3J0OiAtPlxuICAgIF8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG4gICAgZ2VuZXJhdGVJbnRyb3NwZWN0aW9uUmVwb3J0ID0gcmVxdWlyZSAnLi9pbnRyb3NwZWN0aW9uJ1xuXG4gICAgZ2VuZXJhdGVJbnRyb3NwZWN0aW9uUmVwb3J0IF8udmFsdWVzKEJhc2UuZ2V0Q2xhc3NSZWdpc3RyeSgpKSxcbiAgICAgIGV4Y2x1ZGVQcm9wZXJ0aWVzOiBbXG4gICAgICAgICdydW4nXG4gICAgICAgICdnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgnXG4gICAgICAgICdnZXRDbGFzcycsICdleHRlbmQnLCAnZ2V0UGFyZW50JywgJ2dldEFuY2VzdG9ycycsICdpc0NvbW1hbmQnXG4gICAgICAgICdnZXRDbGFzc1JlZ2lzdHJ5JywgJ2NvbW1hbmQnLCAncmVzZXQnXG4gICAgICAgICdnZXREZXNjdGlwdGlvbicsICdkZXNjcmlwdGlvbidcbiAgICAgICAgJ2luaXQnLCAnZ2V0Q29tbWFuZE5hbWUnLCAnZ2V0Q29tbWFuZFNjb3BlJywgJ3JlZ2lzdGVyQ29tbWFuZCcsXG4gICAgICAgICdkZWxlZ2F0ZXNQcm9wZXJ0aWVzJywgJ3N1YnNjcmlwdGlvbnMnLCAnY29tbWFuZFByZWZpeCcsICdjb21tYW5kU2NvcGUnXG4gICAgICAgICdkZWxlZ2F0ZXNNZXRob2RzJyxcbiAgICAgICAgJ2RlbGVnYXRlc1Byb3BlcnR5JyxcbiAgICAgICAgJ2RlbGVnYXRlc01ldGhvZCcsXG4gICAgICBdXG4gICAgICByZWN1cnNpdmVJbnNwZWN0OiBCYXNlXG5cbm1vZHVsZS5leHBvcnRzID0gRGV2ZWxvcGVyXG4iXX0=
