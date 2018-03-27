(function() {
  var AtomReact, CompositeDisposable, Disposable, autoCompleteTagCloseRegex, autoCompleteTagStartRegex, contentCheckRegex, decreaseIndentForNextLinePattern, defaultDetectReactFilePattern, jsxComplexAttributePattern, jsxTagStartPattern, _ref;

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  contentCheckRegex = null;

  defaultDetectReactFilePattern = '/((require\\([\'"]react(?:(-native|\\/addons))?[\'"]\\)))|(import\\s+[\\w{},\\s]+\\s+from\\s+[\'"]react(?:(-native|\\/addons))?[\'"])/';

  autoCompleteTagStartRegex = /(<)([a-zA-Z0-9\.:$_]+)/g;

  autoCompleteTagCloseRegex = /(<\/)([^>]+)(>)/g;

  jsxTagStartPattern = '(?x)((^|=|return)\\s*<([^!/?](?!.+?(</.+?>))))';

  jsxComplexAttributePattern = '(?x)\\{ [^}"\']* $|\\( [^)"\']* $';

  decreaseIndentForNextLinePattern = '(?x) />\\s*(,|;)?\\s*$ | ^\\s*\\S+.*</[-_\\.A-Za-z0-9]+>$';

  AtomReact = (function() {
    AtomReact.prototype.config = {
      enabledForAllJavascriptFiles: {
        type: 'boolean',
        "default": false,
        description: 'Enable grammar, snippets and other features automatically for all .js files.'
      },
      disableAutoClose: {
        type: 'boolean',
        "default": false,
        description: 'Disabled tag autocompletion'
      },
      detectReactFilePattern: {
        type: 'string',
        "default": defaultDetectReactFilePattern
      },
      jsxTagStartPattern: {
        type: 'string',
        "default": jsxTagStartPattern
      },
      jsxComplexAttributePattern: {
        type: 'string',
        "default": jsxComplexAttributePattern
      },
      decreaseIndentForNextLinePattern: {
        type: 'string',
        "default": decreaseIndentForNextLinePattern
      }
    };

    function AtomReact() {}

    AtomReact.prototype.patchEditorLangModeAutoDecreaseIndentForBufferRow = function(editor) {
      var fn, self;
      self = this;
      fn = editor.languageMode.autoDecreaseIndentForBufferRow;
      if (fn.jsxPatch) {
        return;
      }
      return editor.languageMode.autoDecreaseIndentForBufferRow = function(bufferRow, options) {
        var currentIndentLevel, decreaseIndentRegex, decreaseNextLineIndentRegex, desiredIndentLevel, increaseIndentRegex, line, precedingLine, precedingRow, scopeDescriptor;
        if (editor.getGrammar().scopeName !== "source.js.jsx") {
          return fn.call(editor.languageMode, bufferRow, options);
        }
        scopeDescriptor = this.editor.scopeDescriptorForBufferPosition([bufferRow, 0]);
        decreaseNextLineIndentRegex = this.getRegexForProperty(scopeDescriptor, 'react.decreaseIndentForNextLinePattern');
        decreaseIndentRegex = this.decreaseIndentRegexForScopeDescriptor(scopeDescriptor);
        increaseIndentRegex = this.increaseIndentRegexForScopeDescriptor(scopeDescriptor);
        precedingRow = this.buffer.previousNonBlankRow(bufferRow);
        if (precedingRow < 0) {
          return;
        }
        precedingLine = this.buffer.lineForRow(precedingRow);
        line = this.buffer.lineForRow(bufferRow);
        if (precedingLine && decreaseNextLineIndentRegex.testSync(precedingLine) && !(increaseIndentRegex && increaseIndentRegex.testSync(precedingLine)) && !this.editor.isBufferRowCommented(precedingRow)) {
          currentIndentLevel = this.editor.indentationForBufferRow(precedingRow);
          if (decreaseIndentRegex && decreaseIndentRegex.testSync(line)) {
            currentIndentLevel -= 1;
          }
          desiredIndentLevel = currentIndentLevel - 1;
          if (desiredIndentLevel >= 0 && desiredIndentLevel < currentIndentLevel) {
            return this.editor.setIndentationForBufferRow(bufferRow, desiredIndentLevel);
          }
        } else if (!this.editor.isBufferRowCommented(bufferRow)) {
          return fn.call(editor.languageMode, bufferRow, options);
        }
      };
    };

    AtomReact.prototype.patchEditorLangModeSuggestedIndentForBufferRow = function(editor) {
      var fn, self;
      self = this;
      fn = editor.languageMode.suggestedIndentForBufferRow;
      if (fn.jsxPatch) {
        return;
      }
      return editor.languageMode.suggestedIndentForBufferRow = function(bufferRow, options) {
        var complexAttributeRegex, decreaseIndentRegex, decreaseIndentTest, decreaseNextLineIndentRegex, increaseIndentRegex, indent, precedingLine, precedingRow, scopeDescriptor, tagStartRegex, tagStartTest;
        indent = fn.call(editor.languageMode, bufferRow, options);
        if (!(editor.getGrammar().scopeName === "source.js.jsx" && bufferRow > 1)) {
          return indent;
        }
        scopeDescriptor = this.editor.scopeDescriptorForBufferPosition([bufferRow, 0]);
        decreaseNextLineIndentRegex = this.getRegexForProperty(scopeDescriptor, 'react.decreaseIndentForNextLinePattern');
        increaseIndentRegex = this.increaseIndentRegexForScopeDescriptor(scopeDescriptor);
        decreaseIndentRegex = this.decreaseIndentRegexForScopeDescriptor(scopeDescriptor);
        tagStartRegex = this.getRegexForProperty(scopeDescriptor, 'react.jsxTagStartPattern');
        complexAttributeRegex = this.getRegexForProperty(scopeDescriptor, 'react.jsxComplexAttributePattern');
        precedingRow = this.buffer.previousNonBlankRow(bufferRow);
        if (precedingRow < 0) {
          return indent;
        }
        precedingLine = this.buffer.lineForRow(precedingRow);
        if (precedingLine == null) {
          return indent;
        }
        if (this.editor.isBufferRowCommented(bufferRow) && this.editor.isBufferRowCommented(precedingRow)) {
          return this.editor.indentationForBufferRow(precedingRow);
        }
        tagStartTest = tagStartRegex.testSync(precedingLine);
        decreaseIndentTest = decreaseIndentRegex.testSync(precedingLine);
        if (tagStartTest && complexAttributeRegex.testSync(precedingLine) && !this.editor.isBufferRowCommented(precedingRow)) {
          indent += 1;
        }
        if (precedingLine && !decreaseIndentTest && decreaseNextLineIndentRegex.testSync(precedingLine) && !this.editor.isBufferRowCommented(precedingRow)) {
          indent -= 1;
        }
        return Math.max(indent, 0);
      };
    };

    AtomReact.prototype.patchEditorLangMode = function(editor) {
      var _ref1, _ref2;
      if ((_ref1 = this.patchEditorLangModeSuggestedIndentForBufferRow(editor)) != null) {
        _ref1.jsxPatch = true;
      }
      return (_ref2 = this.patchEditorLangModeAutoDecreaseIndentForBufferRow(editor)) != null ? _ref2.jsxPatch = true : void 0;
    };

    AtomReact.prototype.isReact = function(text) {
      var match;
      if (atom.config.get('react.enabledForAllJavascriptFiles')) {
        return true;
      }
      if (contentCheckRegex == null) {
        match = (atom.config.get('react.detectReactFilePattern') || defaultDetectReactFilePattern).match(new RegExp('^/(.*?)/([gimy]*)$'));
        contentCheckRegex = new RegExp(match[1], match[2]);
      }
      return text.match(contentCheckRegex) != null;
    };

    AtomReact.prototype.isReactEnabledForEditor = function(editor) {
      var _ref1;
      return (editor != null) && ((_ref1 = editor.getGrammar().scopeName) === "source.js.jsx" || _ref1 === "source.coffee.jsx");
    };

    AtomReact.prototype.autoSetGrammar = function(editor) {
      var extName, jsxGrammar, path;
      if (this.isReactEnabledForEditor(editor)) {
        return;
      }
      path = require('path');
      extName = path.extname(editor.getPath());
      if (extName === ".jsx" || ((extName === ".js" || extName === ".es6") && this.isReact(editor.getText()))) {
        jsxGrammar = atom.grammars.grammarsByScopeName["source.js.jsx"];
        if (jsxGrammar) {
          return editor.setGrammar(jsxGrammar);
        }
      }
    };

    AtomReact.prototype.onHTMLToJSX = function() {
      var HTMLtoJSX, converter, editor, jsxformat, selections;
      jsxformat = require('jsxformat');
      HTMLtoJSX = require('./htmltojsx');
      converter = new HTMLtoJSX({
        createClass: false
      });
      editor = atom.workspace.getActiveTextEditor();
      if (!this.isReactEnabledForEditor(editor)) {
        return;
      }
      selections = editor.getSelections();
      return editor.transact((function(_this) {
        return function() {
          var jsxOutput, range, selection, selectionText, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = selections.length; _i < _len; _i++) {
            selection = selections[_i];
            try {
              selectionText = selection.getText();
              jsxOutput = converter.convert(selectionText);
              try {
                jsxformat.setOptions({});
                jsxOutput = jsxformat.format(jsxOutput);
              } catch (_error) {}
              selection.insertText(jsxOutput);
              range = selection.getBufferRange();
              _results.push(editor.autoIndentBufferRows(range.start.row, range.end.row));
            } catch (_error) {}
          }
          return _results;
        };
      })(this));
    };

    AtomReact.prototype.onReformat = function() {
      var editor, jsxformat, selections, _;
      jsxformat = require('jsxformat');
      _ = require('lodash');
      editor = atom.workspace.getActiveTextEditor();
      if (!this.isReactEnabledForEditor(editor)) {
        return;
      }
      selections = editor.getSelections();
      return editor.transact((function(_this) {
        return function() {
          var bufEnd, bufStart, err, firstChangedLine, lastChangedLine, newLineCount, original, originalLineCount, range, result, selection, serializedRange, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = selections.length; _i < _len; _i++) {
            selection = selections[_i];
            try {
              range = selection.getBufferRange();
              serializedRange = range.serialize();
              bufStart = serializedRange[0];
              bufEnd = serializedRange[1];
              jsxformat.setOptions({});
              result = jsxformat.format(selection.getText());
              originalLineCount = editor.getLineCount();
              selection.insertText(result);
              newLineCount = editor.getLineCount();
              editor.autoIndentBufferRows(bufStart[0], bufEnd[0] + (newLineCount - originalLineCount));
              _results.push(editor.setCursorBufferPosition(bufStart));
            } catch (_error) {
              err = _error;
              range = selection.getBufferRange().serialize();
              range[0][0]++;
              range[1][0]++;
              jsxformat.setOptions({
                range: range
              });
              original = editor.getText();
              try {
                result = jsxformat.format(original);
                selection.clear();
                originalLineCount = editor.getLineCount();
                editor.setText(result);
                newLineCount = editor.getLineCount();
                firstChangedLine = range[0][0] - 1;
                lastChangedLine = range[1][0] - 1 + (newLineCount - originalLineCount);
                editor.autoIndentBufferRows(firstChangedLine, lastChangedLine);
                _results.push(editor.setCursorBufferPosition([firstChangedLine, range[0][1]]));
              } catch (_error) {}
            }
          }
          return _results;
        };
      })(this));
    };

    AtomReact.prototype.autoCloseTag = function(eventObj, editor) {
      var fullLine, lastLine, lastLineSpaces, line, lines, match, rest, row, serializedEndPoint, tagName, token, tokenizedLine, _ref1, _ref2;
      if (atom.config.get('react.disableAutoClose')) {
        return;
      }
      if (!this.isReactEnabledForEditor(editor) || editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      if ((eventObj != null ? eventObj.newText : void 0) === '>' && !eventObj.oldText) {
        if (editor.getCursorBufferPositions().length > 1) {
          return;
        }
        tokenizedLine = (_ref1 = editor.tokenizedBuffer) != null ? _ref1.tokenizedLineForRow(eventObj.newRange.end.row) : void 0;
        if (tokenizedLine == null) {
          return;
        }
        token = tokenizedLine.tokenAtBufferColumn(eventObj.newRange.end.column - 1);
        if ((token == null) || token.scopes.indexOf('tag.open.js') === -1 || token.scopes.indexOf('punctuation.definition.tag.end.js') === -1) {
          return;
        }
        lines = editor.buffer.getLines();
        row = eventObj.newRange.end.row;
        line = lines[row];
        line = line.substr(0, eventObj.newRange.end.column);
        if (line.substr(line.length - 2, 1) === '/') {
          return;
        }
        tagName = null;
        while ((line != null) && (tagName == null)) {
          match = line.match(autoCompleteTagStartRegex);
          if ((match != null) && match.length > 0) {
            tagName = match.pop().substr(1);
          }
          row--;
          line = lines[row];
        }
        if (tagName != null) {
          editor.insertText('</' + tagName + '>', {
            undo: 'skip'
          });
          return editor.setCursorBufferPosition(eventObj.newRange.end);
        }
      } else if ((eventObj != null ? eventObj.oldText : void 0) === '>' && (eventObj != null ? eventObj.newText : void 0) === '') {
        lines = editor.buffer.getLines();
        row = eventObj.newRange.end.row;
        fullLine = lines[row];
        tokenizedLine = (_ref2 = editor.tokenizedBuffer) != null ? _ref2.tokenizedLineForRow(eventObj.newRange.end.row) : void 0;
        if (tokenizedLine == null) {
          return;
        }
        token = tokenizedLine.tokenAtBufferColumn(eventObj.newRange.end.column - 1);
        if ((token == null) || token.scopes.indexOf('tag.open.js') === -1) {
          return;
        }
        line = fullLine.substr(0, eventObj.newRange.end.column);
        if (line.substr(line.length - 1, 1) === '/') {
          return;
        }
        tagName = null;
        while ((line != null) && (tagName == null)) {
          match = line.match(autoCompleteTagStartRegex);
          if ((match != null) && match.length > 0) {
            tagName = match.pop().substr(1);
          }
          row--;
          line = lines[row];
        }
        if (tagName != null) {
          rest = fullLine.substr(eventObj.newRange.end.column);
          if (rest.indexOf('</' + tagName + '>') === 0) {
            serializedEndPoint = [eventObj.newRange.end.row, eventObj.newRange.end.column];
            return editor.setTextInBufferRange([serializedEndPoint, [serializedEndPoint[0], serializedEndPoint[1] + tagName.length + 3]], '', {
              undo: 'skip'
            });
          }
        }
      } else if ((eventObj != null ? eventObj.newText : void 0) === '\n') {
        lines = editor.buffer.getLines();
        row = eventObj.newRange.end.row;
        lastLine = lines[row - 1];
        fullLine = lines[row];
        if (/>$/.test(lastLine) && fullLine.search(autoCompleteTagCloseRegex) === 0) {
          while (lastLine != null) {
            match = lastLine.match(autoCompleteTagStartRegex);
            if ((match != null) && match.length > 0) {
              break;
            }
            row--;
            lastLine = lines[row];
          }
          lastLineSpaces = lastLine.match(/^\s*/);
          lastLineSpaces = lastLineSpaces != null ? lastLineSpaces[0] : '';
          editor.insertText('\n' + lastLineSpaces);
          return editor.setCursorBufferPosition(eventObj.newRange.end);
        }
      }
    };

    AtomReact.prototype.processEditor = function(editor) {
      var disposableBufferEvent;
      this.patchEditorLangMode(editor);
      this.autoSetGrammar(editor);
      disposableBufferEvent = editor.buffer.onDidChange((function(_this) {
        return function(e) {
          return _this.autoCloseTag(e, editor);
        };
      })(this));
      this.disposables.add(editor.onDidDestroy((function(_this) {
        return function() {
          return disposableBufferEvent.dispose();
        };
      })(this)));
      return this.disposables.add(disposableBufferEvent);
    };

    AtomReact.prototype.deactivate = function() {
      return this.disposables.dispose();
    };

    AtomReact.prototype.activate = function() {
      var disposableConfigListener, disposableHTMLTOJSX, disposableProcessEditor, disposableReformat;
      this.disposables = new CompositeDisposable();
      jsxTagStartPattern = '(?x)((^|=|return)\\s*<([^!/?](?!.+?(</.+?>))))';
      jsxComplexAttributePattern = '(?x)\\{ [^}"\']* $|\\( [^)"\']* $';
      decreaseIndentForNextLinePattern = '(?x) />\\s*(,|;)?\\s*$ | ^\\s*\\S+.*</[-_\\.A-Za-z0-9]+>$';
      atom.config.set("react.jsxTagStartPattern", jsxTagStartPattern);
      atom.config.set("react.jsxComplexAttributePattern", jsxComplexAttributePattern);
      atom.config.set("react.decreaseIndentForNextLinePattern", decreaseIndentForNextLinePattern);
      disposableConfigListener = atom.config.observe('react.detectReactFilePattern', function(newValue) {
        return contentCheckRegex = null;
      });
      disposableReformat = atom.commands.add('atom-workspace', 'react:reformat-JSX', (function(_this) {
        return function() {
          return _this.onReformat();
        };
      })(this));
      disposableHTMLTOJSX = atom.commands.add('atom-workspace', 'react:HTML-to-JSX', (function(_this) {
        return function() {
          return _this.onHTMLToJSX();
        };
      })(this));
      disposableProcessEditor = atom.workspace.observeTextEditors(this.processEditor.bind(this));
      this.disposables.add(disposableConfigListener);
      this.disposables.add(disposableReformat);
      this.disposables.add(disposableHTMLTOJSX);
      return this.disposables.add(disposableProcessEditor);
    };

    return AtomReact;

  })();

  module.exports = AtomReact;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcmVhY3QvbGliL2F0b20tcmVhY3QuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBPQUFBOztBQUFBLEVBQUEsT0FBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQywyQkFBQSxtQkFBRCxFQUFzQixrQkFBQSxVQUF0QixDQUFBOztBQUFBLEVBRUEsaUJBQUEsR0FBb0IsSUFGcEIsQ0FBQTs7QUFBQSxFQUdBLDZCQUFBLEdBQWdDLHdJQUhoQyxDQUFBOztBQUFBLEVBSUEseUJBQUEsR0FBNEIseUJBSjVCLENBQUE7O0FBQUEsRUFLQSx5QkFBQSxHQUE0QixrQkFMNUIsQ0FBQTs7QUFBQSxFQU9BLGtCQUFBLEdBQXFCLGdEQVByQixDQUFBOztBQUFBLEVBUUEsMEJBQUEsR0FBNkIsbUNBUjdCLENBQUE7O0FBQUEsRUFTQSxnQ0FBQSxHQUFtQywyREFUbkMsQ0FBQTs7QUFBQSxFQWFNO0FBQ0osd0JBQUEsTUFBQSxHQUNFO0FBQUEsTUFBQSw0QkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSw4RUFGYjtPQURGO0FBQUEsTUFJQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSw2QkFGYjtPQUxGO0FBQUEsTUFRQSxzQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLDZCQURUO09BVEY7QUFBQSxNQVdBLGtCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsa0JB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/react/lib/atom-react.coffee
