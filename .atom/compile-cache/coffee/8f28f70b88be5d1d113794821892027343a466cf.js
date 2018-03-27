(function() {
  var AtomReact, CompositeDisposable, Disposable, autoCompleteTagCloseRegex, autoCompleteTagStartRegex, contentCheckRegex, decreaseIndentForNextLinePattern, defaultDetectReactFilePattern, jsxComplexAttributePattern, jsxTagStartPattern, ref;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  contentCheckRegex = null;

  defaultDetectReactFilePattern = '/((require\\([\'"]react(?:(-native|\\/addons))?[\'"]\\)))|(import\\s+[\\w{},\\s]+\\s+from\\s+[\'"]react(?:(-native|\\/addons))?[\'"])/';

  autoCompleteTagStartRegex = /(<)([a-zA-Z0-9\.:$_]+)/g;

  autoCompleteTagCloseRegex = /(<\/)([^>]+)(>)/g;

  jsxTagStartPattern = '(?x)((^|=|return)\\s*<([^!/?](?!.+?(</.+?>))))';

  jsxComplexAttributePattern = '(?x)\\{ [^}"\']* $|\\( [^)"\']* $';

  decreaseIndentForNextLinePattern = '(?x) />\\s*(,|;)?\\s*$ | ^(?!\\s*\\?)\\s*\\S+.*</[-_\\.A-Za-z0-9]+>$';

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
      skipUndoStackForAutoCloseInsertion: {
        type: 'boolean',
        "default": true,
        description: 'When enabled, auto insert/remove closing tag mutation is skipped from normal undo/redo operation'
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
        decreaseNextLineIndentRegex = this.cacheRegex(atom.config.get('react.decreaseIndentForNextLinePattern') || decreaseIndentForNextLinePattern);
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
        decreaseNextLineIndentRegex = this.cacheRegex(atom.config.get('react.decreaseIndentForNextLinePattern') || decreaseIndentForNextLinePattern);
        increaseIndentRegex = this.increaseIndentRegexForScopeDescriptor(scopeDescriptor);
        decreaseIndentRegex = this.decreaseIndentRegexForScopeDescriptor(scopeDescriptor);
        tagStartRegex = this.cacheRegex(atom.config.get('react.jsxTagStartPattern') || jsxTagStartPattern);
        complexAttributeRegex = this.cacheRegex(atom.config.get('react.jsxComplexAttributePattern') || jsxComplexAttributePattern);
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
      var ref1, ref2;
      if ((ref1 = this.patchEditorLangModeSuggestedIndentForBufferRow(editor)) != null) {
        ref1.jsxPatch = true;
      }
      return (ref2 = this.patchEditorLangModeAutoDecreaseIndentForBufferRow(editor)) != null ? ref2.jsxPatch = true : void 0;
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
      var ref1;
      return (editor != null) && ((ref1 = editor.getGrammar().scopeName) === "source.js.jsx" || ref1 === "source.coffee.jsx");
    };

    AtomReact.prototype.autoSetGrammar = function(editor) {
      var extName, jsxGrammar, path;
      if (this.isReactEnabledForEditor(editor)) {
        return;
      }
      path = require('path');
      extName = path.extname(editor.getPath() || '');
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
          var i, jsxOutput, len, range, results, selection, selectionText;
          results = [];
          for (i = 0, len = selections.length; i < len; i++) {
            selection = selections[i];
            try {
              selectionText = selection.getText();
              jsxOutput = converter.convert(selectionText);
              try {
                jsxformat.setOptions({});
                jsxOutput = jsxformat.format(jsxOutput);
              } catch (error) {}
              selection.insertText(jsxOutput);
              range = selection.getBufferRange();
              results.push(editor.autoIndentBufferRows(range.start.row, range.end.row));
            } catch (error) {}
          }
          return results;
        };
      })(this));
    };

    AtomReact.prototype.onReformat = function() {
      var _, editor, jsxformat, selections;
      jsxformat = require('jsxformat');
      _ = require('lodash');
      editor = atom.workspace.getActiveTextEditor();
      if (!this.isReactEnabledForEditor(editor)) {
        return;
      }
      selections = editor.getSelections();
      return editor.transact((function(_this) {
        return function() {
          var bufEnd, bufStart, err, firstChangedLine, i, lastChangedLine, len, newLineCount, original, originalLineCount, range, result, results, selection, serializedRange;
          results = [];
          for (i = 0, len = selections.length; i < len; i++) {
            selection = selections[i];
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
              results.push(editor.setCursorBufferPosition(bufStart));
            } catch (error) {
              err = error;
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
                results.push(editor.setCursorBufferPosition([firstChangedLine, range[0][1]]));
              } catch (error) {}
            }
          }
          return results;
        };
      })(this));
    };

    AtomReact.prototype.autoCloseTag = function(eventObj, editor) {
      var fullLine, lastLine, lastLineSpaces, line, lines, match, options, ref1, ref2, rest, row, serializedEndPoint, tagName, token, tokenizedLine;
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
        tokenizedLine = (ref1 = editor.tokenizedBuffer) != null ? ref1.tokenizedLineForRow(eventObj.newRange.end.row) : void 0;
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
          if (atom.config.get('react.skipUndoStackForAutoCloseInsertion')) {
            options = {
              undo: 'skip'
            };
          } else {
            options = {};
          }
          editor.insertText('</' + tagName + '>', options);
          return editor.setCursorBufferPosition(eventObj.newRange.end);
        }
      } else if ((eventObj != null ? eventObj.oldText : void 0) === '>' && (eventObj != null ? eventObj.newText : void 0) === '') {
        lines = editor.buffer.getLines();
        row = eventObj.newRange.end.row;
        fullLine = lines[row];
        tokenizedLine = (ref2 = editor.tokenizedBuffer) != null ? ref2.tokenizedLineForRow(eventObj.newRange.end.row) : void 0;
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
            if (atom.config.get('react.skipUndoStackForAutoCloseInsertion')) {
              options = {
                undo: 'skip'
              };
            } else {
              options = {};
            }
            serializedEndPoint = [eventObj.newRange.end.row, eventObj.newRange.end.column];
            return editor.setTextInBufferRange([serializedEndPoint, [serializedEndPoint[0], serializedEndPoint[1] + tagName.length + 3]], '', options);
          }
        }
      } else if ((eventObj != null) && eventObj.newText.match(/\r?\n/)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcmVhY3QvbGliL2F0b20tcmVhY3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsTUFBUixDQUFwQyxFQUFDLDZDQUFELEVBQXNCOztFQUV0QixpQkFBQSxHQUFvQjs7RUFDcEIsNkJBQUEsR0FBZ0M7O0VBQ2hDLHlCQUFBLEdBQTRCOztFQUM1Qix5QkFBQSxHQUE0Qjs7RUFFNUIsa0JBQUEsR0FBcUI7O0VBQ3JCLDBCQUFBLEdBQTZCOztFQUM3QixnQ0FBQSxHQUFtQzs7RUFJN0I7d0JBQ0osTUFBQSxHQUNFO01BQUEsNEJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLDhFQUZiO09BREY7TUFJQSxnQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsNkJBRmI7T0FMRjtNQVFBLGtDQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSxrR0FGYjtPQVRGO01BWUEsc0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyw2QkFEVDtPQWJGO01BZUEsa0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxrQkFEVDtPQWhCRjtNQWtCQSwwQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLDBCQURUO09BbkJGO01BcUJBLGdDQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNB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QUFvQjtNQUR5RCxDQUFwRDtNQUczQixrQkFBQSxHQUFxQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLG9CQUFwQyxFQUEwRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLFVBQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExRDtNQUNyQixtQkFBQSxHQUFzQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLG1CQUFwQyxFQUF5RCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLFdBQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6RDtNQUN0Qix1QkFBQSxHQUEwQixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFvQixJQUFwQixDQUFsQztNQUUxQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsd0JBQWpCO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLGtCQUFqQjtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixtQkFBakI7YUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsdUJBQWpCO0lBaEJROzs7Ozs7RUFtQlosTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE5VmpCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuY29udGVudENoZWNrUmVnZXggPSBudWxsXG5kZWZhdWx0RGV0ZWN0UmVhY3RGaWxlUGF0dGVybiA9ICcvKChyZXF1aXJlXFxcXChbXFwnXCJdcmVhY3QoPzooLW5hdGl2ZXxcXFxcL2FkZG9ucykpP1tcXCdcIl1cXFxcKSkpfChpbXBvcnRcXFxccytbXFxcXHd7fSxcXFxcc10rXFxcXHMrZnJvbVxcXFxzK1tcXCdcIl1yZWFjdCg/OigtbmF0aXZlfFxcXFwvYWRkb25zKSk/W1xcJ1wiXSkvJ1xuYXV0b0NvbXBsZXRlVGFnU3RhcnRSZWdleCA9IC8oPCkoW2EtekEtWjAtOVxcLjokX10rKS9nXG5hdXRvQ29tcGxldGVUYWdDbG9zZVJlZ2V4ID0gLyg8XFwvKShbXj5dKykoPikvZ1xuXG5qc3hUYWdTdGFydFBhdHRlcm4gPSAnKD94KSgoXnw9fHJldHVybilcXFxccyo8KFteIS8/XSg/IS4rPyg8Ly4rPz4pKSkpJ1xuanN4Q29tcGxleEF0dHJpYnV0ZVBhdHRlcm4gPSAnKD94KVxcXFx7IFtefVwiXFwnXSogJHxcXFxcKCBbXilcIlxcJ10qICQnXG5kZWNyZWFzZUluZGVudEZvck5leHRMaW5lUGF0dGVybiA9ICcoP3gpXG4vPlxcXFxzKigsfDspP1xcXFxzKiRcbnwgXig/IVxcXFxzKlxcXFw/KVxcXFxzKlxcXFxTKy4qPC9bLV9cXFxcLkEtWmEtejAtOV0rPiQnXG5cbmNsYXNzIEF0b21SZWFjdFxuICBjb25maWc6XG4gICAgZW5hYmxlZEZvckFsbEphdmFzY3JpcHRGaWxlczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiAnRW5hYmxlIGdyYW1tYXIsIHNuaXBwZXRzIGFuZCBvdGhlciBmZWF0dXJlcyBhdXRvbWF0aWNhbGx5IGZvciBhbGwgLmpzIGZpbGVzLidcbiAgICBkaXNhYmxlQXV0b0Nsb3NlOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246ICdEaXNhYmxlZCB0YWcgYXV0b2NvbXBsZXRpb24nXG4gICAgc2tpcFVuZG9TdGFja0ZvckF1dG9DbG9zZUluc2VydGlvbjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246ICdXaGVuIGVuYWJsZWQsIGF1dG8gaW5zZXJ0L3JlbW92ZSBjbG9zaW5nIHRhZyBtdXRhdGlvbiBpcyBza2lwcGVkIGZyb20gbm9ybWFsIHVuZG8vcmVkbyBvcGVyYXRpb24nXG4gICAgZGV0ZWN0UmVhY3RGaWxlUGF0dGVybjpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBkZWZhdWx0RGV0ZWN0UmVhY3RGaWxlUGF0dGVyblxuICAgIGpzeFRhZ1N0YXJ0UGF0dGVybjpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBqc3hUYWdTdGFydFBhdHRlcm5cbiAgICBqc3hDb21wbGV4QXR0cmlidXRlUGF0dGVybjpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBqc3hDb21wbGV4QXR0cmlidXRlUGF0dGVyblxuICAgIGRlY3JlYXNlSW5kZW50Rm9yTmV4dExpbmVQYXR0ZXJuOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IGRlY3JlYXNlSW5kZW50Rm9yTmV4dExpbmVQYXR0ZXJuXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gIHBhdGNoRWRpdG9yTGFuZ01vZGVBdXRvRGVjcmVhc2VJbmRlbnRGb3JCdWZmZXJSb3c6IChlZGl0b3IpIC0+XG4gICAgc2VsZiA9IHRoaXNcbiAgICBmbiA9IGVkaXRvci5sYW5ndWFnZU1vZGUuYXV0b0RlY3JlYXNlSW5kZW50Rm9yQnVmZmVyUm93XG4gICAgcmV0dXJuIGlmIGZuLmpzeFBhdGNoXG5cbiAgICBlZGl0b3IubGFuZ3VhZ2VNb2RlLmF1dG9EZWNyZWFzZUluZGVudEZvckJ1ZmZlclJvdyA9IChidWZmZXJSb3csIG9wdGlvbnMpIC0+XG4gICAgICByZXR1cm4gZm4uY2FsbChlZGl0b3IubGFuZ3VhZ2VNb2RlLCBidWZmZXJSb3csIG9wdGlvbnMpIHVubGVzcyBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSA9PSBcInNvdXJjZS5qcy5qc3hcIlxuXG4gICAgICBzY29wZURlc2NyaXB0b3IgPSBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFtidWZmZXJSb3csIDBdKVxuICAgICAgZGVjcmVhc2VOZXh0TGluZUluZGVudFJlZ2V4ID0gQGNhY2hlUmVnZXgoYXRvbS5jb25maWcuZ2V0KCdyZWFjdC5kZWNyZWFzZUluZGVudEZvck5leHRMaW5lUGF0dGVybicpIHx8wqBkZWNyZWFzZUluZGVudEZvck5leHRMaW5lUGF0dGVybilcbiAgICAgIGRlY3JlYXNlSW5kZW50UmVnZXggPSBAZGVjcmVhc2VJbmRlbnRSZWdleEZvclNjb3BlRGVzY3JpcHRvcihzY29wZURlc2NyaXB0b3IpXG4gICAgICBpbmNyZWFzZUluZGVudFJlZ2V4ID0gQGluY3JlYXNlSW5kZW50UmVnZXhGb3JTY29wZURlc2NyaXB0b3Ioc2NvcGVEZXNjcmlwdG9yKVxuXG4gICAgICBwcmVjZWRpbmdSb3cgPSBAYnVmZmVyLnByZXZpb3VzTm9uQmxhbmtSb3coYnVmZmVyUm93KVxuXG4gICAgICByZXR1cm4gaWYgcHJlY2VkaW5nUm93IDwgMFxuXG4gICAgICBwcmVjZWRpbmdMaW5lID0gQGJ1ZmZlci5saW5lRm9yUm93KHByZWNlZGluZ1JvdylcbiAgICAgIGxpbmUgPSBAYnVmZmVyLmxpbmVGb3JSb3coYnVmZmVyUm93KVxuXG4gICAgICBpZiBwcmVjZWRpbmdMaW5lIGFuZCBkZWNyZWFzZU5leHRMaW5lSW5kZW50UmVnZXgudGVzdFN5bmMocHJlY2VkaW5nTGluZSkgYW5kXG4gICAgICAgICBub3QgKGluY3JlYXNlSW5kZW50UmVnZXggYW5kIGluY3JlYXNlSW5kZW50UmVnZXgudGVzdFN5bmMocHJlY2VkaW5nTGluZSkpIGFuZFxuICAgICAgICAgbm90IEBlZGl0b3IuaXNCdWZmZXJSb3dDb21tZW50ZWQocHJlY2VkaW5nUm93KVxuICAgICAgICBjdXJyZW50SW5kZW50TGV2ZWwgPSBAZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHByZWNlZGluZ1JvdylcbiAgICAgICAgY3VycmVudEluZGVudExldmVsIC09IDEgaWYgZGVjcmVhc2VJbmRlbnRSZWdleCBhbmQgZGVjcmVhc2VJbmRlbnRSZWdleC50ZXN0U3luYyhsaW5lKVxuICAgICAgICBkZXNpcmVkSW5kZW50TGV2ZWwgPSBjdXJyZW50SW5kZW50TGV2ZWwgLSAxXG4gICAgICAgIGlmIGRlc2lyZWRJbmRlbnRMZXZlbCA+PSAwIGFuZCBkZXNpcmVkSW5kZW50TGV2ZWwgPCBjdXJyZW50SW5kZW50TGV2ZWxcbiAgICAgICAgICBAZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KGJ1ZmZlclJvdywgZGVzaXJlZEluZGVudExldmVsKVxuICAgICAgZWxzZSBpZiBub3QgQGVkaXRvci5pc0J1ZmZlclJvd0NvbW1lbnRlZChidWZmZXJSb3cpXG4gICAgICAgIGZuLmNhbGwoZWRpdG9yLmxhbmd1YWdlTW9kZSwgYnVmZmVyUm93LCBvcHRpb25zKVxuXG4gIHBhdGNoRWRpdG9yTGFuZ01vZGVTdWdnZXN0ZWRJbmRlbnRGb3JCdWZmZXJSb3c6IChlZGl0b3IpIC0+XG4gICAgc2VsZiA9IHRoaXNcbiAgICBmbiA9IGVkaXRvci5sYW5ndWFnZU1vZGUuc3VnZ2VzdGVkSW5kZW50Rm9yQnVmZmVyUm93XG4gICAgcmV0dXJuIGlmIGZuLmpzeFBhdGNoXG5cbiAgICBlZGl0b3IubGFuZ3VhZ2VNb2RlLnN1Z2dlc3RlZEluZGVudEZvckJ1ZmZlclJvdyA9IChidWZmZXJSb3csIG9wdGlvbnMpIC0+XG4gICAgICBpbmRlbnQgPSBmbi5jYWxsKGVkaXRvci5sYW5ndWFnZU1vZGUsIGJ1ZmZlclJvdywgb3B0aW9ucylcbiAgICAgIHJldHVybiBpbmRlbnQgdW5sZXNzIGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lID09IFwic291cmNlLmpzLmpzeFwiIGFuZCBidWZmZXJSb3cgPiAxXG5cbiAgICAgIHNjb3BlRGVzY3JpcHRvciA9IEBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oW2J1ZmZlclJvdywgMF0pXG5cbiAgICAgIGRlY3JlYXNlTmV4dExpbmVJbmRlbnRSZWdleCA9IEBjYWNoZVJlZ2V4KGF0b20uY29uZmlnLmdldCgncmVhY3QuZGVjcmVhc2VJbmRlbnRGb3JOZXh0TGluZVBhdHRlcm4nKSB8fMKgZGVjcmVhc2VJbmRlbnRGb3JOZXh0TGluZVBhdHRlcm4pXG4gICAgICBpbmNyZWFzZUluZGVudFJlZ2V4ID0gQGluY3JlYXNlSW5kZW50UmVnZXhGb3JTY29wZURlc2NyaXB0b3Ioc2NvcGVEZXNjcmlwdG9yKVxuXG4gICAgICBkZWNyZWFzZUluZGVudFJlZ2V4ID0gQGRlY3JlYXNlSW5kZW50UmVnZXhGb3JTY29wZURlc2NyaXB0b3Ioc2NvcGVEZXNjcmlwdG9yKVxuICAgICAgdGFnU3RhcnRSZWdleCA9IEBjYWNoZVJlZ2V4KGF0b20uY29uZmlnLmdldCgncmVhY3QuanN4VGFnU3RhcnRQYXR0ZXJuJykgfHzCoGpzeFRhZ1N0YXJ0UGF0dGVybilcbiAgICAgIGNvbXBsZXhBdHRyaWJ1dGVSZWdleCA9IEBjYWNoZVJlZ2V4KGF0b20uY29uZmlnLmdldCgncmVhY3QuanN4Q29tcGxleEF0dHJpYnV0ZVBhdHRlcm4nKSB8fMKganN4Q29tcGxleEF0dHJpYnV0ZVBhdHRlcm4pXG5cbiAgICAgIHByZWNlZGluZ1JvdyA9IEBidWZmZXIucHJldmlvdXNOb25CbGFua1JvdyhidWZmZXJSb3cpXG5cbiAgICAgIHJldHVybiBpbmRlbnQgaWYgcHJlY2VkaW5nUm93IDwgMFxuXG4gICAgICBwcmVjZWRpbmdMaW5lID0gQGJ1ZmZlci5saW5lRm9yUm93KHByZWNlZGluZ1JvdylcblxuICAgICAgcmV0dXJuIGluZGVudCBpZiBub3QgcHJlY2VkaW5nTGluZT9cblxuICAgICAgaWYgQGVkaXRvci5pc0J1ZmZlclJvd0NvbW1lbnRlZChidWZmZXJSb3cpIGFuZCBAZWRpdG9yLmlzQnVmZmVyUm93Q29tbWVudGVkKHByZWNlZGluZ1JvdylcbiAgICAgICAgcmV0dXJuIEBlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocHJlY2VkaW5nUm93KVxuXG4gICAgICB0YWdTdGFydFRlc3QgPSB0YWdTdGFydFJlZ2V4LnRlc3RTeW5jKHByZWNlZGluZ0xpbmUpXG4gICAgICBkZWNyZWFzZUluZGVudFRlc3QgPSBkZWNyZWFzZUluZGVudFJlZ2V4LnRlc3RTeW5jKHByZWNlZGluZ0xpbmUpXG5cbiAgICAgIGluZGVudCArPSAxIGlmIHRhZ1N0YXJ0VGVzdCBhbmQgY29tcGxleEF0dHJpYnV0ZVJlZ2V4LnRlc3RTeW5jKHByZWNlZGluZ0xpbmUpIGFuZCBub3QgQGVkaXRvci5pc0J1ZmZlclJvd0NvbW1lbnRlZChwcmVjZWRpbmdSb3cpXG4gICAgICBpbmRlbnQgLT0gMSBpZiBwcmVjZWRpbmdMaW5lIGFuZCBub3QgZGVjcmVhc2VJbmRlbnRUZXN0IGFuZCBkZWNyZWFzZU5leHRMaW5lSW5kZW50UmVnZXgudGVzdFN5bmMocHJlY2VkaW5nTGluZSkgYW5kIG5vdCBAZWRpdG9yLmlzQnVmZmVyUm93Q29tbWVudGVkKHByZWNlZGluZ1JvdylcblxuICAgICAgcmV0dXJuIE1hdGgubWF4KGluZGVudCwgMClcblxuICBwYXRjaEVkaXRvckxhbmdNb2RlOiAoZWRpdG9yKSAtPlxuICAgIEBwYXRjaEVkaXRvckxhbmdNb2RlU3VnZ2VzdGVkSW5kZW50Rm9yQnVmZmVyUm93KGVkaXRvcik/LmpzeFBhdGNoID0gdHJ1ZVxuICAgIEBwYXRjaEVkaXRvckxhbmdNb2RlQXV0b0RlY3JlYXNlSW5kZW50Rm9yQnVmZmVyUm93KGVkaXRvcik/LmpzeFBhdGNoID0gdHJ1ZVxuXG4gIGlzUmVhY3Q6ICh0ZXh0KSAtPlxuICAgIHJldHVybiB0cnVlIGlmIGF0b20uY29uZmlnLmdldCgncmVhY3QuZW5hYmxlZEZvckFsbEphdmFzY3JpcHRGaWxlcycpXG5cblxuICAgIGlmIG5vdCBjb250ZW50Q2hlY2tSZWdleD9cbiAgICAgIG1hdGNoID0gKGF0b20uY29uZmlnLmdldCgncmVhY3QuZGV0ZWN0UmVhY3RGaWxlUGF0dGVybicpIHx8IGRlZmF1bHREZXRlY3RSZWFjdEZpbGVQYXR0ZXJuKS5tYXRjaChuZXcgUmVnRXhwKCdeLyguKj8pLyhbZ2lteV0qKSQnKSk7XG4gICAgICBjb250ZW50Q2hlY2tSZWdleCA9IG5ldyBSZWdFeHAobWF0Y2hbMV0sIG1hdGNoWzJdKVxuICAgIHJldHVybiB0ZXh0Lm1hdGNoKGNvbnRlbnRDaGVja1JlZ2V4KT9cblxuICBpc1JlYWN0RW5hYmxlZEZvckVkaXRvcjogKGVkaXRvcikgLT5cbiAgICByZXR1cm4gZWRpdG9yPyAmJiBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSBpbiBbXCJzb3VyY2UuanMuanN4XCIsIFwic291cmNlLmNvZmZlZS5qc3hcIl1cblxuICBhdXRvU2V0R3JhbW1hcjogKGVkaXRvcikgLT5cbiAgICByZXR1cm4gaWYgQGlzUmVhY3RFbmFibGVkRm9yRWRpdG9yIGVkaXRvclxuXG4gICAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbiAgICAjIENoZWNrIGlmIGZpbGUgZXh0ZW5zaW9uIGlzIC5qc3ggb3IgdGhlIGZpbGUgcmVxdWlyZXMgUmVhY3RcbiAgICBleHROYW1lID0gcGF0aC5leHRuYW1lKGVkaXRvci5nZXRQYXRoKCkgb3IgJycpXG4gICAgaWYgZXh0TmFtZSBpcyBcIi5qc3hcIiBvciAoKGV4dE5hbWUgaXMgXCIuanNcIiBvciBleHROYW1lIGlzIFwiLmVzNlwiKSBhbmQgQGlzUmVhY3QoZWRpdG9yLmdldFRleHQoKSkpXG4gICAgICBqc3hHcmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyc0J5U2NvcGVOYW1lW1wic291cmNlLmpzLmpzeFwiXVxuICAgICAgZWRpdG9yLnNldEdyYW1tYXIganN4R3JhbW1hciBpZiBqc3hHcmFtbWFyXG5cbiAgb25IVE1MVG9KU1g6IC0+XG4gICAganN4Zm9ybWF0ID0gcmVxdWlyZSAnanN4Zm9ybWF0J1xuICAgIEhUTUx0b0pTWCA9IHJlcXVpcmUgJy4vaHRtbHRvanN4J1xuICAgIGNvbnZlcnRlciA9IG5ldyBIVE1MdG9KU1goY3JlYXRlQ2xhc3M6IGZhbHNlKVxuXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgICByZXR1cm4gaWYgbm90IEBpc1JlYWN0RW5hYmxlZEZvckVkaXRvciBlZGl0b3JcblxuICAgIHNlbGVjdGlvbnMgPSBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG5cbiAgICBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1xuICAgICAgICB0cnlcbiAgICAgICAgICBzZWxlY3Rpb25UZXh0ID0gc2VsZWN0aW9uLmdldFRleHQoKVxuICAgICAgICAgIGpzeE91dHB1dCA9IGNvbnZlcnRlci5jb252ZXJ0KHNlbGVjdGlvblRleHQpXG5cbiAgICAgICAgICB0cnlcbiAgICAgICAgICAgIGpzeGZvcm1hdC5zZXRPcHRpb25zKHt9KTtcbiAgICAgICAgICAgIGpzeE91dHB1dCA9IGpzeGZvcm1hdC5mb3JtYXQoanN4T3V0cHV0KVxuXG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoanN4T3V0cHV0KTtcbiAgICAgICAgICByYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpO1xuICAgICAgICAgIGVkaXRvci5hdXRvSW5kZW50QnVmZmVyUm93cyhyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3cpXG5cbiAgb25SZWZvcm1hdDogLT5cbiAgICBqc3hmb3JtYXQgPSByZXF1aXJlICdqc3hmb3JtYXQnXG4gICAgXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gICAgcmV0dXJuIGlmIG5vdCBAaXNSZWFjdEVuYWJsZWRGb3JFZGl0b3IgZWRpdG9yXG5cbiAgICBzZWxlY3Rpb25zID0gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgIGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBzZWxlY3Rpb25zXG4gICAgICAgIHRyeVxuICAgICAgICAgIHJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCk7XG4gICAgICAgICAgc2VyaWFsaXplZFJhbmdlID0gcmFuZ2Uuc2VyaWFsaXplKClcbiAgICAgICAgICBidWZTdGFydCA9IHNlcmlhbGl6ZWRSYW5nZVswXVxuICAgICAgICAgIGJ1ZkVuZCA9IHNlcmlhbGl6ZWRSYW5nZVsxXVxuXG4gICAgICAgICAganN4Zm9ybWF0LnNldE9wdGlvbnMoe30pO1xuICAgICAgICAgIHJlc3VsdCA9IGpzeGZvcm1hdC5mb3JtYXQoc2VsZWN0aW9uLmdldFRleHQoKSlcblxuICAgICAgICAgIG9yaWdpbmFsTGluZUNvdW50ID0gZWRpdG9yLmdldExpbmVDb3VudCgpXG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQocmVzdWx0KVxuICAgICAgICAgIG5ld0xpbmVDb3VudCA9IGVkaXRvci5nZXRMaW5lQ291bnQoKVxuXG4gICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRCdWZmZXJSb3dzKGJ1ZlN0YXJ0WzBdLCBidWZFbmRbMF0gKyAobmV3TGluZUNvdW50IC0gb3JpZ2luYWxMaW5lQ291bnQpKVxuICAgICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihidWZTdGFydClcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgIyBQYXJzaW5nL2Zvcm1hdHRpbmcgdGhlIHNlbGVjdGlvbiBmYWlsZWQgbGV0cyB0cnkgdG8gcGFyc2UgdGhlIHdob2xlIGZpbGUgYnV0IGZvcm1hdCB0aGUgc2VsZWN0aW9uIG9ubHlcbiAgICAgICAgICByYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnNlcmlhbGl6ZSgpXG4gICAgICAgICAgIyBlc3ByaW1hIGFzdCBsaW5lIGNvdW50IHN0YXJ0cyBmb3IgMVxuICAgICAgICAgIHJhbmdlWzBdWzBdKytcbiAgICAgICAgICByYW5nZVsxXVswXSsrXG5cbiAgICAgICAgICBqc3hmb3JtYXQuc2V0T3B0aW9ucyh7cmFuZ2U6IHJhbmdlfSk7XG5cbiAgICAgICAgICAjIFRPRE86IHVzZSBmb2xkXG4gICAgICAgICAgb3JpZ2luYWwgPSBlZGl0b3IuZ2V0VGV4dCgpO1xuXG4gICAgICAgICAgdHJ5XG4gICAgICAgICAgICByZXN1bHQgPSBqc3hmb3JtYXQuZm9ybWF0KG9yaWdpbmFsKVxuICAgICAgICAgICAgc2VsZWN0aW9uLmNsZWFyKClcblxuICAgICAgICAgICAgb3JpZ2luYWxMaW5lQ291bnQgPSBlZGl0b3IuZ2V0TGluZUNvdW50KClcbiAgICAgICAgICAgIGVkaXRvci5zZXRUZXh0KHJlc3VsdClcbiAgICAgICAgICAgIG5ld0xpbmVDb3VudCA9IGVkaXRvci5nZXRMaW5lQ291bnQoKVxuXG4gICAgICAgICAgICBmaXJzdENoYW5nZWRMaW5lID0gcmFuZ2VbMF1bMF0gLSAxXG4gICAgICAgICAgICBsYXN0Q2hhbmdlZExpbmUgPSByYW5nZVsxXVswXSAtIDEgKyAobmV3TGluZUNvdW50IC0gb3JpZ2luYWxMaW5lQ291bnQpXG5cbiAgICAgICAgICAgIGVkaXRvci5hdXRvSW5kZW50QnVmZmVyUm93cyhmaXJzdENoYW5nZWRMaW5lLCBsYXN0Q2hhbmdlZExpbmUpXG5cbiAgICAgICAgICAgICMgcmV0dXJuIGJhY2tcbiAgICAgICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbZmlyc3RDaGFuZ2VkTGluZSwgcmFuZ2VbMF1bMV1dKVxuXG4gIGF1dG9DbG9zZVRhZzogKGV2ZW50T2JqLCBlZGl0b3IpIC0+XG4gICAgcmV0dXJuIGlmIGF0b20uY29uZmlnLmdldCgncmVhY3QuZGlzYWJsZUF1dG9DbG9zZScpXG5cbiAgICByZXR1cm4gaWYgbm90IEBpc1JlYWN0RW5hYmxlZEZvckVkaXRvcihlZGl0b3IpIG9yIGVkaXRvciAhPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICAgIGlmIGV2ZW50T2JqPy5uZXdUZXh0IGlzICc+JyBhbmQgIWV2ZW50T2JqLm9sZFRleHRcbiAgICAgICMgYXV0byBjbG9zaW5nIG11bHRpcGxlIGN1cnNvcnMgaXMgYSBsaXR0bGUgYml0IHRyaWNreSBzbyBsZXRzIGRpc2FibGUgaXQgZm9yIG5vd1xuICAgICAgcmV0dXJuIGlmIGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKS5sZW5ndGggPiAxO1xuXG4gICAgICB0b2tlbml6ZWRMaW5lID0gZWRpdG9yLnRva2VuaXplZEJ1ZmZlcj8udG9rZW5pemVkTGluZUZvclJvdyhldmVudE9iai5uZXdSYW5nZS5lbmQucm93KVxuICAgICAgcmV0dXJuIGlmIG5vdCB0b2tlbml6ZWRMaW5lP1xuXG4gICAgICB0b2tlbiA9IHRva2VuaXplZExpbmUudG9rZW5BdEJ1ZmZlckNvbHVtbihldmVudE9iai5uZXdSYW5nZS5lbmQuY29sdW1uIC0gMSlcblxuICAgICAgaWYgbm90IHRva2VuPyBvciB0b2tlbi5zY29wZXMuaW5kZXhPZigndGFnLm9wZW4uanMnKSA9PSAtMSBvciB0b2tlbi5zY29wZXMuaW5kZXhPZigncHVuY3R1YXRpb24uZGVmaW5pdGlvbi50YWcuZW5kLmpzJykgPT0gLTFcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGxpbmVzID0gZWRpdG9yLmJ1ZmZlci5nZXRMaW5lcygpXG4gICAgICByb3cgPSBldmVudE9iai5uZXdSYW5nZS5lbmQucm93XG4gICAgICBsaW5lID0gbGluZXNbcm93XVxuICAgICAgbGluZSA9IGxpbmUuc3Vic3RyIDAsIGV2ZW50T2JqLm5ld1JhbmdlLmVuZC5jb2x1bW5cblxuICAgICAgIyBUYWcgaXMgc2VsZiBjbG9zaW5nXG4gICAgICByZXR1cm4gaWYgbGluZS5zdWJzdHIobGluZS5sZW5ndGggLSAyLCAxKSBpcyAnLydcblxuICAgICAgdGFnTmFtZSA9IG51bGxcblxuICAgICAgd2hpbGUgbGluZT8gYW5kIG5vdCB0YWdOYW1lP1xuICAgICAgICBtYXRjaCA9IGxpbmUubWF0Y2ggYXV0b0NvbXBsZXRlVGFnU3RhcnRSZWdleFxuICAgICAgICBpZiBtYXRjaD8gJiYgbWF0Y2gubGVuZ3RoID4gMFxuICAgICAgICAgIHRhZ05hbWUgPSBtYXRjaC5wb3AoKS5zdWJzdHIoMSlcbiAgICAgICAgcm93LS1cbiAgICAgICAgbGluZSA9IGxpbmVzW3Jvd11cblxuICAgICAgaWYgdGFnTmFtZT9cbiAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdyZWFjdC5za2lwVW5kb1N0YWNrRm9yQXV0b0Nsb3NlSW5zZXJ0aW9uJylcbiAgICAgICAgICBvcHRpb25zID0ge3VuZG86ICdza2lwJ31cbiAgICAgICAgZWxzZVxuICAgICAgICAgIG9wdGlvbnMgPSB7fVxuICAgICAgICAgIFxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnPC8nICsgdGFnTmFtZSArICc+Jywgb3B0aW9ucylcbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKGV2ZW50T2JqLm5ld1JhbmdlLmVuZClcblxuICAgIGVsc2UgaWYgZXZlbnRPYmo/Lm9sZFRleHQgaXMgJz4nIGFuZCBldmVudE9iaj8ubmV3VGV4dCBpcyAnJ1xuXG4gICAgICBsaW5lcyA9IGVkaXRvci5idWZmZXIuZ2V0TGluZXMoKVxuICAgICAgcm93ID0gZXZlbnRPYmoubmV3UmFuZ2UuZW5kLnJvd1xuICAgICAgZnVsbExpbmUgPSBsaW5lc1tyb3ddXG5cbiAgICAgIHRva2VuaXplZExpbmUgPSBlZGl0b3IudG9rZW5pemVkQnVmZmVyPy50b2tlbml6ZWRMaW5lRm9yUm93KGV2ZW50T2JqLm5ld1JhbmdlLmVuZC5yb3cpXG4gICAgICByZXR1cm4gaWYgbm90IHRva2VuaXplZExpbmU/XG5cbiAgICAgIHRva2VuID0gdG9rZW5pemVkTGluZS50b2tlbkF0QnVmZmVyQ29sdW1uKGV2ZW50T2JqLm5ld1JhbmdlLmVuZC5jb2x1bW4gLSAxKVxuICAgICAgaWYgbm90IHRva2VuPyBvciB0b2tlbi5zY29wZXMuaW5kZXhPZigndGFnLm9wZW4uanMnKSA9PSAtMVxuICAgICAgICByZXR1cm5cbiAgICAgIGxpbmUgPSBmdWxsTGluZS5zdWJzdHIgMCwgZXZlbnRPYmoubmV3UmFuZ2UuZW5kLmNvbHVtblxuXG4gICAgICAjIFRhZyBpcyBzZWxmIGNsb3NpbmdcbiAgICAgIHJldHVybiBpZiBsaW5lLnN1YnN0cihsaW5lLmxlbmd0aCAtIDEsIDEpIGlzICcvJ1xuXG4gICAgICB0YWdOYW1lID0gbnVsbFxuXG4gICAgICB3aGlsZSBsaW5lPyBhbmQgbm90IHRhZ05hbWU/XG4gICAgICAgIG1hdGNoID0gbGluZS5tYXRjaCBhdXRvQ29tcGxldGVUYWdTdGFydFJlZ2V4XG4gICAgICAgIGlmIG1hdGNoPyAmJiBtYXRjaC5sZW5ndGggPiAwXG4gICAgICAgICAgdGFnTmFtZSA9IG1hdGNoLnBvcCgpLnN1YnN0cigxKVxuICAgICAgICByb3ctLVxuICAgICAgICBsaW5lID0gbGluZXNbcm93XVxuXG4gICAgICBpZiB0YWdOYW1lP1xuICAgICAgICByZXN0ID0gZnVsbExpbmUuc3Vic3RyKGV2ZW50T2JqLm5ld1JhbmdlLmVuZC5jb2x1bW4pXG4gICAgICAgIGlmIHJlc3QuaW5kZXhPZignPC8nICsgdGFnTmFtZSArICc+JykgPT0gMFxuICAgICAgICAgICMgcmVzdCBpcyBjbG9zaW5nIHRhZ1xuICAgICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgncmVhY3Quc2tpcFVuZG9TdGFja0ZvckF1dG9DbG9zZUluc2VydGlvbicpXG4gICAgICAgICAgICBvcHRpb25zID0ge3VuZG86ICdza2lwJ31cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcHRpb25zID0ge31cbiAgICAgICAgICBzZXJpYWxpemVkRW5kUG9pbnQgPSBbZXZlbnRPYmoubmV3UmFuZ2UuZW5kLnJvdywgZXZlbnRPYmoubmV3UmFuZ2UuZW5kLmNvbHVtbl07XG4gICAgICAgICAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICBzZXJpYWxpemVkRW5kUG9pbnQsXG4gICAgICAgICAgICAgIFtzZXJpYWxpemVkRW5kUG9pbnRbMF0sIHNlcmlhbGl6ZWRFbmRQb2ludFsxXSArIHRhZ05hbWUubGVuZ3RoICsgM11cbiAgICAgICAgICAgIF1cbiAgICAgICAgICAsICcnLCBvcHRpb25zKVxuXG4gICAgZWxzZSBpZiBldmVudE9iaj8gYW5kIGV2ZW50T2JqLm5ld1RleHQubWF0Y2ggL1xccj9cXG4vXG4gICAgICBsaW5lcyA9IGVkaXRvci5idWZmZXIuZ2V0TGluZXMoKVxuICAgICAgcm93ID0gZXZlbnRPYmoubmV3UmFuZ2UuZW5kLnJvd1xuICAgICAgbGFzdExpbmUgPSBsaW5lc1tyb3cgLSAxXVxuICAgICAgZnVsbExpbmUgPSBsaW5lc1tyb3ddXG5cbiAgICAgIGlmIC8+JC8udGVzdChsYXN0TGluZSkgYW5kIGZ1bGxMaW5lLnNlYXJjaChhdXRvQ29tcGxldGVUYWdDbG9zZVJlZ2V4KSA9PSAwXG4gICAgICAgIHdoaWxlIGxhc3RMaW5lP1xuICAgICAgICAgIG1hdGNoID0gbGFzdExpbmUubWF0Y2ggYXV0b0NvbXBsZXRlVGFnU3RhcnRSZWdleFxuICAgICAgICAgIGlmIG1hdGNoPyAmJiBtYXRjaC5sZW5ndGggPiAwXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIHJvdy0tXG4gICAgICAgICAgbGFzdExpbmUgPSBsaW5lc1tyb3ddXG5cbiAgICAgICAgbGFzdExpbmVTcGFjZXMgPSBsYXN0TGluZS5tYXRjaCgvXlxccyovKVxuICAgICAgICBsYXN0TGluZVNwYWNlcyA9IGlmIGxhc3RMaW5lU3BhY2VzPyB0aGVuIGxhc3RMaW5lU3BhY2VzWzBdIGVsc2UgJydcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ1xcbicgKyBsYXN0TGluZVNwYWNlcylcbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKGV2ZW50T2JqLm5ld1JhbmdlLmVuZClcblxuICBwcm9jZXNzRWRpdG9yOiAoZWRpdG9yKSAtPlxuICAgIEBwYXRjaEVkaXRvckxhbmdNb2RlKGVkaXRvcilcbiAgICBAYXV0b1NldEdyYW1tYXIoZWRpdG9yKVxuICAgIGRpc3Bvc2FibGVCdWZmZXJFdmVudCA9IGVkaXRvci5idWZmZXIub25EaWRDaGFuZ2UgKGUpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBAYXV0b0Nsb3NlVGFnIGUsIGVkaXRvclxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBlZGl0b3Iub25EaWREZXN0cm95ID0+IGRpc3Bvc2FibGVCdWZmZXJFdmVudC5kaXNwb3NlKClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQoZGlzcG9zYWJsZUJ1ZmZlckV2ZW50KTtcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgYWN0aXZhdGU6IC0+XG5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG5cbiAgICAjIEJpbmQgZXZlbnRzXG4gICAgZGlzcG9zYWJsZUNvbmZpZ0xpc3RlbmVyID0gYXRvbS5jb25maWcub2JzZXJ2ZSAncmVhY3QuZGV0ZWN0UmVhY3RGaWxlUGF0dGVybicsIChuZXdWYWx1ZSkgLT5cbiAgICAgIGNvbnRlbnRDaGVja1JlZ2V4ID0gbnVsbFxuXG4gICAgZGlzcG9zYWJsZVJlZm9ybWF0ID0gYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3JlYWN0OnJlZm9ybWF0LUpTWCcsID0+IEBvblJlZm9ybWF0KClcbiAgICBkaXNwb3NhYmxlSFRNTFRPSlNYID0gYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3JlYWN0OkhUTUwtdG8tSlNYJywgPT4gQG9uSFRNTFRvSlNYKClcbiAgICBkaXNwb3NhYmxlUHJvY2Vzc0VkaXRvciA9IGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyBAcHJvY2Vzc0VkaXRvci5iaW5kKHRoaXMpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGRpc3Bvc2FibGVDb25maWdMaXN0ZW5lclxuICAgIEBkaXNwb3NhYmxlcy5hZGQgZGlzcG9zYWJsZVJlZm9ybWF0XG4gICAgQGRpc3Bvc2FibGVzLmFkZCBkaXNwb3NhYmxlSFRNTFRPSlNYXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBkaXNwb3NhYmxlUHJvY2Vzc0VkaXRvclxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXRvbVJlYWN0XG4iXX0=
