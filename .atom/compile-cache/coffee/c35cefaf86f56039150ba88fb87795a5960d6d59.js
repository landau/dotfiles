(function() {
  "use strict";
  var $, Beautifiers, CompositeDisposable, LoadingView, Promise, async, beautifier, beautify, beautifyDirectory, beautifyFile, beautifyFilePath, debug, defaultLanguageOptions, dir, fs, getCursors, getScrollTop, getUnsupportedOptions, handleSaveEvent, loadingView, logger, path, pkg, plugin, setCursors, setScrollTop, showError, strip, yaml, _;

  pkg = require('../package.json');

  plugin = module.exports;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  _ = require("lodash");

  Beautifiers = require("./beautifiers");

  beautifier = new Beautifiers();

  defaultLanguageOptions = beautifier.options;

  logger = require('./logger')(__filename);

  Promise = require('bluebird');

  fs = null;

  path = require("path");

  strip = null;

  yaml = null;

  async = null;

  dir = null;

  LoadingView = null;

  loadingView = null;

  $ = null;

  getScrollTop = function(editor) {
    var view;
    view = atom.views.getView(editor);
    return view.getScrollTop();
  };

  setScrollTop = function(editor, value) {
    var view;
    view = atom.views.getView(editor);
    return view.setScrollTop(value);
  };

  getCursors = function(editor) {
    var bufferPosition, cursor, cursors, posArray, _i, _len;
    cursors = editor.getCursors();
    posArray = [];
    for (_i = 0, _len = cursors.length; _i < _len; _i++) {
      cursor = cursors[_i];
      bufferPosition = cursor.getBufferPosition();
      posArray.push([bufferPosition.row, bufferPosition.column]);
    }
    return posArray;
  };

  setCursors = function(editor, posArray) {
    var bufferPosition, i, _i, _len;
    for (i = _i = 0, _len = posArray.length; _i < _len; i = ++_i) {
      bufferPosition = posArray[i];
      if (i === 0) {
        editor.setCursorBufferPosition(bufferPosition);
        continue;
      }
      editor.addCursorAtBufferPosition(bufferPosition);
    }
  };

  beautifier.on('beautify::start', function() {
    if (LoadingView == null) {
      LoadingView = require("./views/loading-view");
    }
    if (loadingView == null) {
      loadingView = new LoadingView();
    }
    return loadingView.show();
  });

  beautifier.on('beautify::end', function() {
    return loadingView != null ? loadingView.hide() : void 0;
  });

  showError = function(error) {
    var detail, stack, _ref;
    if (!atom.config.get("atom-beautify.general.muteAllErrors")) {
      stack = error.stack;
      detail = error.description || error.message;
      return (_ref = atom.notifications) != null ? _ref.addError(error.message, {
        stack: stack,
        detail: detail,
        dismissable: true
      }) : void 0;
    }
  };

  beautify = function(_arg) {
    var editor, onSave;
    editor = _arg.editor, onSave = _arg.onSave;
    return new Promise(function(resolve, reject) {
      var allOptions, beautifyCompleted, e, editedFilePath, forceEntireFile, grammarName, isSelection, oldText, text;
      plugin.checkUnsupportedOptions();
      if (path == null) {
        path = require("path");
      }
      forceEntireFile = onSave && atom.config.get("atom-beautify.general.beautifyEntireFileOnSave");
      beautifyCompleted = function(text) {
        var error, origScrollTop, posArray, selectedBufferRange;
        if (text == null) {

        } else if (text instanceof Error) {
          showError(text);
          return reject(text);
        } else if (typeof text === "string") {
          if (oldText !== text) {
            posArray = getCursors(editor);
            origScrollTop = getScrollTop(editor);
            if (!forceEntireFile && isSelection) {
              selectedBufferRange = editor.getSelectedBufferRange();
              editor.setTextInBufferRange(selectedBufferRange, text);
            } else {
              editor.setText(text);
            }
            setCursors(editor, posArray);
            setTimeout((function() {
              setScrollTop(editor, origScrollTop);
              return resolve(text);
            }), 0);
          }
        } else {
          error = new Error("Unsupported beautification result '" + text + "'.");
          showError(error);
          return reject(error);
        }
      };
      editor = editor != null ? editor : atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return showError(new Error("Active Editor not found. ", "Please select a Text Editor first to beautify."));
      }
      isSelection = !!editor.getSelectedText();
      editedFilePath = editor.getPath();
      allOptions = beautifier.getOptionsForPath(editedFilePath, editor);
      text = void 0;
      if (!forceEntireFile && isSelection) {
        text = editor.getSelectedText();
      } else {
        text = editor.getText();
      }
      oldText = text;
      grammarName = editor.getGrammar().name;
      try {
        beautifier.beautify(text, allOptions, grammarName, editedFilePath, {
          onSave: onSave
        }).then(beautifyCompleted)["catch"](beautifyCompleted);
      } catch (_error) {
        e = _error;
        showError(e);
      }
    });
  };

  beautifyFilePath = function(filePath, callback) {
    var $el, cb;
    logger.verbose('beautifyFilePath', filePath);
    if ($ == null) {
      $ = require("atom-space-pen-views").$;
    }
    $el = $(".icon-file-text[data-path=\"" + filePath + "\"]");
    $el.addClass('beautifying');
    cb = function(err, result) {
      logger.verbose('Cleanup beautifyFilePath', err, result);
      $el = $(".icon-file-text[data-path=\"" + filePath + "\"]");
      $el.removeClass('beautifying');
      return callback(err, result);
    };
    if (fs == null) {
      fs = require("fs");
    }
    logger.verbose('readFile', filePath);
    return fs.readFile(filePath, function(err, data) {
      var allOptions, completionFun, e, grammar, grammarName, input;
      logger.verbose('readFile completed', err, filePath);
      if (err) {
        return cb(err);
      }
      input = data != null ? data.toString() : void 0;
      grammar = atom.grammars.selectGrammar(filePath, input);
      grammarName = grammar.name;
      allOptions = beautifier.getOptionsForPath(filePath);
      logger.verbose('beautifyFilePath allOptions', allOptions);
      completionFun = function(output) {
        logger.verbose('beautifyFilePath completionFun', output);
        if (output instanceof Error) {
          return cb(output, null);
        } else if (typeof output === "string") {
          if (output.trim() === '') {
            logger.verbose('beautifyFilePath, output was empty string!');
            return cb(null, output);
          }
          return fs.writeFile(filePath, output, function(err) {
            if (err) {
              return cb(err);
            }
            return cb(null, output);
          });
        } else {
          return cb(new Error("Unknown beautification result " + output + "."), output);
        }
      };
      try {
        logger.verbose('beautify', input, allOptions, grammarName, filePath);
        return beautifier.beautify(input, allOptions, grammarName, filePath).then(completionFun)["catch"](completionFun);
      } catch (_error) {
        e = _error;
        return cb(e);
      }
    });
  };

  beautifyFile = function(_arg) {
    var filePath, target;
    target = _arg.target;
    filePath = target.dataset.path;
    if (!filePath) {
      return;
    }
    beautifyFilePath(filePath, function(err, result) {
      if (err) {
        return showError(err);
      }
    });
  };

  beautifyDirectory = function(_arg) {
    var $el, dirPath, target;
    target = _arg.target;
    dirPath = target.dataset.path;
    if (!dirPath) {
      return;
    }
    if ((typeof atom !== "undefined" && atom !== null ? atom.confirm({
      message: "This will beautify all of the files found recursively in this directory, '" + dirPath + "'. Do you want to continue?",
      buttons: ['Yes, continue!', 'No, cancel!']
    }) : void 0) !== 0) {
      return;
    }
    if ($ == null) {
      $ = require("atom-space-pen-views").$;
    }
    $el = $(".icon-file-directory[data-path=\"" + dirPath + "\"]");
    $el.addClass('beautifying');
    if (dir == null) {
      dir = require("node-dir");
    }
    if (async == null) {
      async = require("async");
    }
    dir.files(dirPath, function(err, files) {
      if (err) {
        return showError(err);
      }
      return async.each(files, function(filePath, callback) {
        return beautifyFilePath(filePath, function() {
          return callback();
        });
      }, function(err) {
        $el = $(".icon-file-directory[data-path=\"" + dirPath + "\"]");
        return $el.removeClass('beautifying');
      });
    });
  };

  debug = function() {
    var addHeader, addInfo, allOptions, beautifiers, codeBlockSyntax, debugInfo, editor, filePath, grammarName, headers, language, linkifyTitle, selectedBeautifier, text, tocEl, _ref;
    plugin.checkUnsupportedOptions();
    editor = atom.workspace.getActiveTextEditor();
    linkifyTitle = function(title) {
      var p, sep;
      title = title.toLowerCase();
      p = title.split(/[\s,+#;,\/?:@&=+$]+/);
      sep = "-";
      return p.join(sep);
    };
    if (editor == null) {
      return confirm("Active Editor not found.\n" + "Please select a Text Editor first to beautify.");
    }
    if (!confirm('Are you ready to debug Atom Beautify?\n\n' + 'Warning: This will change your current clipboard contents.')) {
      return;
    }
    debugInfo = "";
    headers = [];
    tocEl = "<TABLEOFCONTENTS/>";
    addInfo = function(key, val) {
      if (key != null) {
        return debugInfo += "**" + key + "**: " + val + "\n\n";
      } else {
        return debugInfo += "" + val + "\n\n";
      }
    };
    addHeader = function(level, title) {
      debugInfo += "" + (Array(level + 1).join('#')) + " " + title + "\n\n";
      return headers.push({
        level: level,
        title: title
      });
    };
    addHeader(1, "Atom Beautify - Debugging information");
    debugInfo += "The following debugging information was " + ("generated by `Atom Beautify` on `" + (new Date()) + "`.") + "\n\n---\n\n" + tocEl + "\n\n---\n\n";
    addInfo('Platform', process.platform);
    addHeader(2, "Versions");
    addInfo('Atom Version', atom.appVersion);
    addInfo('Atom Beautify Version', pkg.version);
    addHeader(2, "Original file to be beautified");
    filePath = editor.getPath();
    addInfo('Original File Path', "`" + filePath + "`");
    grammarName = editor.getGrammar().name;
    addInfo('Original File Grammar', grammarName);
    language = beautifier.getLanguage(grammarName, filePath);
    addInfo('Original File Language', language != null ? language.name : void 0);
    addInfo('Language namespace', language != null ? language.namespace : void 0);
    beautifiers = beautifier.getBeautifiers(language.name);
    addInfo('Supported Beautifiers', _.map(beautifiers, 'name').join(', '));
    selectedBeautifier = beautifier.getBeautifierForLanguage(language);
    addInfo('Selected Beautifier', selectedBeautifier.name);
    text = editor.getText();
    codeBlockSyntax = ((_ref = language != null ? language.name : void 0) != null ? _ref : grammarName).toLowerCase().split(' ')[0];
    addHeader(3, 'Original File Contents');
    addInfo(null, "\n```" + codeBlockSyntax + "\n" + text + "\n```");
    addHeader(3, 'Package Settings');
    addInfo(null, "The raw package settings options\n" + ("```json\n" + (JSON.stringify(atom.config.get('atom-beautify'), void 0, 4)) + "\n```"));
    addHeader(2, "Beautification options");
    allOptions = beautifier.getOptionsForPath(filePath, editor);
    return Promise.all(allOptions).then(function(allOptions) {
      var cb, configOptions, e, editorConfigOptions, editorOptions, finalOptions, homeOptions, logFilePathRegex, logs, preTransformedOptions, projectOptions, subscription;
      editorOptions = allOptions[0], configOptions = allOptions[1], homeOptions = allOptions[2], editorConfigOptions = allOptions[3];
      projectOptions = allOptions.slice(4);
      preTransformedOptions = beautifier.getOptionsForLanguage(allOptions, language);
      if (selectedBeautifier) {
        finalOptions = beautifier.transformOptions(selectedBeautifier, language.name, preTransformedOptions);
      }
      addInfo('Editor Options', "\n" + "Options from Atom Editor settings\n" + ("```json\n" + (JSON.stringify(editorOptions, void 0, 4)) + "\n```"));
      addInfo('Config Options', "\n" + "Options from Atom Beautify package settings\n" + ("```json\n" + (JSON.stringify(configOptions, void 0, 4)) + "\n```"));
      addInfo('Home Options', "\n" + ("Options from `" + (path.resolve(beautifier.getUserHome(), '.jsbeautifyrc')) + "`\n") + ("```json\n" + (JSON.stringify(homeOptions, void 0, 4)) + "\n```"));
      addInfo('EditorConfig Options', "\n" + "Options from [EditorConfig](http://editorconfig.org/) file\n" + ("```json\n" + (JSON.stringify(editorConfigOptions, void 0, 4)) + "\n```"));
      addInfo('Project Options', "\n" + ("Options from `.jsbeautifyrc` files starting from directory `" + (path.dirname(filePath)) + "` and going up to root\n") + ("```json\n" + (JSON.stringify(projectOptions, void 0, 4)) + "\n```"));
      addInfo('Pre-Transformed Options', "\n" + "Combined options before transforming them given a beautifier's specifications\n" + ("```json\n" + (JSON.stringify(preTransformedOptions, void 0, 4)) + "\n```"));
      if (selectedBeautifier) {
        addHeader(3, 'Final Options');
        addInfo(null, "Final combined and transformed options that are used\n" + ("```json\n" + (JSON.stringify(finalOptions, void 0, 4)) + "\n```"));
      }
      logs = "";
      logFilePathRegex = new RegExp('\\: \\[(.*)\\]');
      subscription = logger.onLogging(function(msg) {
        var sep;
        sep = path.sep;
        return logs += msg.replace(logFilePathRegex, function(a, b) {
          var i, p, s;
          s = b.split(sep);
          i = s.indexOf('atom-beautify');
          p = s.slice(i + 2).join(sep);
          return ': [' + p + ']';
        });
      });
      cb = function(result) {
        var JsDiff, bullet, diff, header, indent, indentNum, toc, _i, _len;
        subscription.dispose();
        addHeader(2, "Results");
        addInfo('Beautified File Contents', "\n```" + codeBlockSyntax + "\n" + result + "\n```");
        JsDiff = require('diff');
        diff = JsDiff.createPatch(filePath, text, result, "original", "beautified");
        addInfo('Original vs. Beautified Diff', "\n```" + codeBlockSyntax + "\n" + diff + "\n```");
        addHeader(3, "Logs");
        addInfo(null, "```\n" + logs + "\n```");
        toc = "## Table Of Contents\n";
        for (_i = 0, _len = headers.length; _i < _len; _i++) {
          header = headers[_i];

          /*
          - Heading 1
            - Heading 1.1
           */
          indent = "  ";
          bullet = "-";
          indentNum = header.level - 2;
          if (indentNum >= 0) {
            toc += "" + (Array(indentNum + 1).join(indent)) + bullet + " [" + header.title + "](\#" + (linkifyTitle(header.title)) + ")\n";
          }
        }
        debugInfo = debugInfo.replace(tocEl, toc);
        atom.clipboard.write(debugInfo);
        return confirm('Atom Beautify debugging information is now in your clipboard.\n' + 'You can now paste this into an Issue you are reporting here\n' + 'https://github.com/Glavin001/atom-beautify/issues/\n\n' + 'Please follow the contribution guidelines found at\n' + 'https://github.com/Glavin001/atom-beautify/blob/master/CONTRIBUTING.md\n\n' + 'Warning: Be sure to look over the debug info before you send it, ' + 'to ensure you are not sharing undesirable private information.');
      };
      try {
        return beautifier.beautify(text, allOptions, grammarName, filePath).then(cb)["catch"](cb);
      } catch (_error) {
        e = _error;
        return cb(e);
      }
    });
  };

  handleSaveEvent = function() {
    return atom.workspace.observeTextEditors(function(editor) {
      var beautifyOnSaveHandler, disposable, pendingPaths;
      pendingPaths = {};
      beautifyOnSaveHandler = function(_arg) {
        var beautifyOnSave, buffer, fileExtension, filePath, grammar, key, language, languages;
        filePath = _arg.path;
        logger.verbose('Should beautify on this save?');
        if (pendingPaths[filePath]) {
          logger.verbose("Editor with file path " + filePath + " already beautified!");
          return;
        }
        buffer = editor.getBuffer();
        if (path == null) {
          path = require('path');
        }
        grammar = editor.getGrammar().name;
        fileExtension = path.extname(filePath);
        fileExtension = fileExtension.substr(1);
        languages = beautifier.languages.getLanguages({
          grammar: grammar,
          extension: fileExtension
        });
        if (languages.length < 1) {
          return;
        }
        language = languages[0];
        key = "atom-beautify." + language.namespace + ".beautify_on_save";
        beautifyOnSave = atom.config.get(key);
        logger.verbose('save editor positions', key, beautifyOnSave);
        if (beautifyOnSave) {
          logger.verbose('Beautifying file', filePath);
          return beautify({
            editor: editor,
            onSave: true
          }).then(function() {
            logger.verbose('Done beautifying file', filePath);
            if (editor.isAlive() === true) {
              logger.verbose('Saving TextEditor...');
              pendingPaths[filePath] = true;
              editor.save();
              delete pendingPaths[filePath];
              return logger.verbose('Saved TextEditor.');
            }
          })["catch"](function(error) {
            return showError(error);
          });
        }
      };
      disposable = editor.onDidSave(function(_arg) {
        var filePath;
        filePath = _arg.path;
        return beautifyOnSaveHandler({
          path: filePath
        });
      });
      return plugin.subscriptions.add(disposable);
    });
  };

  getUnsupportedOptions = function() {
    var schema, settings, unsupportedOptions;
    settings = atom.config.get('atom-beautify');
    schema = atom.config.getSchema('atom-beautify');
    unsupportedOptions = _.filter(_.keys(settings), function(key) {
      return schema.properties[key] === void 0;
    });
    return unsupportedOptions;
  };

  plugin.checkUnsupportedOptions = function() {
    var unsupportedOptions;
    unsupportedOptions = getUnsupportedOptions();
    if (unsupportedOptions.length !== 0) {
      return atom.notifications.addWarning("Please run Atom command 'Atom-Beautify: Migrate Settings'.", {
        detail: "You can open the Atom command palette with `cmd-shift-p` (OSX) or `ctrl-shift-p` (Linux/Windows) in Atom. You have unsupported options: " + (unsupportedOptions.join(', ')),
        dismissable: true
      });
    }
  };

  plugin.migrateSettings = function() {
    var namespaces, rename, rex, unsupportedOptions;
    unsupportedOptions = getUnsupportedOptions();
    namespaces = beautifier.languages.namespaces;
    if (unsupportedOptions.length === 0) {
      return atom.notifications.addSuccess("No options to migrate.");
    } else {
      rex = new RegExp("(" + (namespaces.join('|')) + ")_(.*)");
      rename = _.toPairs(_.zipObject(unsupportedOptions, _.map(unsupportedOptions, function(key) {
        var m;
        m = key.match(rex);
        if (m === null) {
          return "general." + key;
        } else {
          return "" + m[1] + "." + m[2];
        }
      })));
      _.each(rename, function(_arg) {
        var key, newKey, val;
        key = _arg[0], newKey = _arg[1];
        val = atom.config.get("atom-beautify." + key);
        atom.config.set("atom-beautify." + newKey, val);
        return atom.config.set("atom-beautify." + key, void 0);
      });
      return atom.notifications.addSuccess("Successfully migrated options: " + (unsupportedOptions.join(', ')));
    }
  };

  plugin.config = _.merge(require('./config.coffee'), defaultLanguageOptions);

  plugin.activate = function() {
    this.subscriptions = new CompositeDisposable;
    this.subscriptions.add(handleSaveEvent());
    this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:beautify-editor", beautify));
    this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:help-debug-editor", debug));
    this.subscriptions.add(atom.commands.add(".tree-view .file .name", "atom-beautify:beautify-file", beautifyFile));
    this.subscriptions.add(atom.commands.add(".tree-view .directory .name", "atom-beautify:beautify-directory", beautifyDirectory));
    return this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:migrate-settings", plugin.migrateSettings));
  };

  plugin.deactivate = function() {
    return this.subscriptions.dispose();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZnkuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxFQUFBLFlBQUEsQ0FBQTtBQUFBLE1BQUEsZ1ZBQUE7O0FBQUEsRUFDQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGlCQUFSLENBRE4sQ0FBQTs7QUFBQSxFQUlBLE1BQUEsR0FBUyxNQUFNLENBQUMsT0FKaEIsQ0FBQTs7QUFBQSxFQUtDLHNCQUF1QixPQUFBLENBQVEsV0FBUixFQUF2QixtQkFMRCxDQUFBOztBQUFBLEVBTUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBTkosQ0FBQTs7QUFBQSxFQU9BLFdBQUEsR0FBYyxPQUFBLENBQVEsZUFBUixDQVBkLENBQUE7O0FBQUEsRUFRQSxVQUFBLEdBQWlCLElBQUEsV0FBQSxDQUFBLENBUmpCLENBQUE7O0FBQUEsRUFTQSxzQkFBQSxHQUF5QixVQUFVLENBQUMsT0FUcEMsQ0FBQTs7QUFBQSxFQVVBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUFBLENBQW9CLFVBQXBCLENBVlQsQ0FBQTs7QUFBQSxFQVdBLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUixDQVhWLENBQUE7O0FBQUEsRUFjQSxFQUFBLEdBQUssSUFkTCxDQUFBOztBQUFBLEVBZUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBZlAsQ0FBQTs7QUFBQSxFQWdCQSxLQUFBLEdBQVEsSUFoQlIsQ0FBQTs7QUFBQSxFQWlCQSxJQUFBLEdBQU8sSUFqQlAsQ0FBQTs7QUFBQSxFQWtCQSxLQUFBLEdBQVEsSUFsQlIsQ0FBQTs7QUFBQSxFQW1CQSxHQUFBLEdBQU0sSUFuQk4sQ0FBQTs7QUFBQSxFQW9CQSxXQUFBLEdBQWMsSUFwQmQsQ0FBQTs7QUFB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/beautify.coffee
