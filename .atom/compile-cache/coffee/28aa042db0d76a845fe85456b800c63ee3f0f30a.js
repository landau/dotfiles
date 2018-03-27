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
    var GitHubApi, addHeader, addInfo, allOptions, beautifiers, codeBlockSyntax, debugInfo, editor, filePath, github, grammarName, headers, language, linkifyTitle, open, selectedBeautifier, text, tocEl, _ref;
    open = require("open");
    if (fs == null) {
      fs = require("fs");
    }
    GitHubApi = require("github");
    github = new GitHubApi();
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
    if (!confirm('Are you ready to debug Atom Beautify?\n\n' + 'Warning: This will create an anonymous Gist on GitHub (publically accessible and cannot be easily deleted) ' + 'containing the contents of your active Text Editor.\n' + 'Be sure to delete any private text from your active Text Editor before continuing ' + 'to ensure you are not sharing undesirable private information.')) {
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
        return github.gists.create({
          files: {
            "debug.md": {
              "content": debugInfo
            }
          },
          "public": true,
          description: "Atom-Beautify debugging information"
        }, function(err, res) {
          var body, gistUrl, issueTemplate;
          if (err) {
            return confirm("An error occurred when creating the Gist: " + err);
          } else {
            gistUrl = res.html_url;
            open(gistUrl);
            confirm(("Your Atom Beautify debugging information can be found in the public Gist:\n" + res.html_url + "\n\n") + 'Warning: Be sure to look over the debug info before you send it ' + 'to ensure you are not sharing undesirable private information.\n\n' + 'If you want to delete this anonymous Gist read\n' + 'https://help.github.com/articles/deleting-an-anonymous-gist/');
            if (!confirm("Would you like to create a new Issue on GitHub now?")) {
              return;
            }
            issueTemplate = fs.readFileSync(path.resolve(__dirname, "../ISSUE_TEMPLATE.md")).toString();
            body = issueTemplate.replace("<INSERT GIST HERE>", gistUrl);
            return open("https://github.com/Glavin001/atom-beautify/issues/new?body=" + (encodeURIComponent(body)));
          }
        });
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
