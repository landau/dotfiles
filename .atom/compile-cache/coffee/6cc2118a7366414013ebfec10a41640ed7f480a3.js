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
      fn = editor.autoDecreaseIndentForBufferRow;
      if (fn.jsxPatch) {
        return;
      }
      return editor.autoDecreaseIndentForBufferRow = function(bufferRow, options) {
        var currentIndentLevel, decreaseIndentRegex, decreaseNextLineIndentRegex, desiredIndentLevel, increaseIndentRegex, line, precedingLine, precedingRow, scopeDescriptor;
        if (editor.getGrammar().scopeName !== "source.js.jsx") {
          return fn.call(editor, bufferRow, options);
        }
        scopeDescriptor = this.scopeDescriptorForBufferPosition([bufferRow, 0]);
        decreaseNextLineIndentRegex = this.tokenizedBuffer.regexForPattern(atom.config.get('react.decreaseIndentForNextLinePattern') || decreaseIndentForNextLinePattern);
        decreaseIndentRegex = this.tokenizedBuffer.decreaseIndentRegexForScopeDescriptor(scopeDescriptor);
        increaseIndentRegex = this.tokenizedBuffer.increaseIndentRegexForScopeDescriptor(scopeDescriptor);
        precedingRow = this.tokenizedBuffer.buffer.previousNonBlankRow(bufferRow);
        if (precedingRow < 0) {
          return;
        }
        precedingLine = this.tokenizedBuffer.buffer.lineForRow(precedingRow);
        line = this.tokenizedBuffer.buffer.lineForRow(bufferRow);
        if (precedingLine && decreaseNextLineIndentRegex.testSync(precedingLine) && !(increaseIndentRegex && increaseIndentRegex.testSync(precedingLine)) && !this.isBufferRowCommented(precedingRow)) {
          currentIndentLevel = this.indentationForBufferRow(precedingRow);
          if (decreaseIndentRegex && decreaseIndentRegex.testSync(line)) {
            currentIndentLevel -= 1;
          }
          desiredIndentLevel = currentIndentLevel - 1;
          if (desiredIndentLevel >= 0 && desiredIndentLevel < currentIndentLevel) {
            return this.setIndentationForBufferRow(bufferRow, desiredIndentLevel);
          }
        } else if (!this.isBufferRowCommented(bufferRow)) {
          return fn.call(editor, bufferRow, options);
        }
      };
    };

    AtomReact.prototype.patchEditorLangModeSuggestedIndentForBufferRow = function(editor) {
      var fn, self;
      self = this;
      fn = editor.suggestedIndentForBufferRow;
      if (fn.jsxPatch) {
        return;
      }
      return editor.suggestedIndentForBufferRow = function(bufferRow, options) {
        var complexAttributeRegex, decreaseIndentRegex, decreaseIndentTest, decreaseNextLineIndentRegex, increaseIndentRegex, indent, precedingLine, precedingRow, scopeDescriptor, tagStartRegex, tagStartTest;
        indent = fn.call(editor, bufferRow, options);
        if (!(editor.getGrammar().scopeName === "source.js.jsx" && bufferRow > 1)) {
          return indent;
        }
        scopeDescriptor = this.scopeDescriptorForBufferPosition([bufferRow, 0]);
        decreaseNextLineIndentRegex = this.tokenizedBuffer.regexForPattern(atom.config.get('react.decreaseIndentForNextLinePattern') || decreaseIndentForNextLinePattern);
        increaseIndentRegex = this.tokenizedBuffer.increaseIndentRegexForScopeDescriptor(scopeDescriptor);
        decreaseIndentRegex = this.tokenizedBuffer.decreaseIndentRegexForScopeDescriptor(scopeDescriptor);
        tagStartRegex = this.tokenizedBuffer.regexForPattern(atom.config.get('react.jsxTagStartPattern') || jsxTagStartPattern);
        complexAttributeRegex = this.tokenizedBuffer.regexForPattern(atom.config.get('react.jsxComplexAttributePattern') || jsxComplexAttributePattern);
        precedingRow = this.tokenizedBuffer.buffer.previousNonBlankRow(bufferRow);
        if (precedingRow < 0) {
          return indent;
        }
        precedingLine = this.tokenizedBuffer.buffer.lineForRow(precedingRow);
        if (precedingLine == null) {
          return indent;
        }
        if (this.isBufferRowCommented(bufferRow) && this.isBufferRowCommented(precedingRow)) {
          return this.indentationForBufferRow(precedingRow);
        }
        tagStartTest = tagStartRegex.testSync(precedingLine);
        decreaseIndentTest = decreaseIndentRegex.testSync(precedingLine);
        if (tagStartTest && complexAttributeRegex.testSync(precedingLine) && !this.isBufferRowCommented(precedingRow)) {
          indent += 1;
        }
        if (precedingLine && !decreaseIndentTest && decreaseNextLineIndentRegex.testSync(precedingLine) && !this.isBufferRowCommented(precedingRow)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcmVhY3QvbGliL2F0b20tcmVhY3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsTUFBUixDQUFwQyxFQUFDLDZDQUFELEVBQXNCOztFQUV0QixpQkFBQSxHQUFvQjs7RUFDcEIsNkJBQUEsR0FBZ0M7O0VBQ2hDLHlCQUFBLEdBQTRCOztFQUM1Qix5QkFBQSxHQUE0Qjs7RUFFNUIsa0JBQUEsR0FBcUI7O0VBQ3JCLDBCQUFBLEdBQTZCOztFQUM3QixnQ0FBQSxHQUFtQzs7RUFJN0I7d0JBQ0osTUFBQSxHQUNFO01BQUEsNEJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLDhFQUZiO09BREY7TUFJQSxnQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsNkJBRmI7T0FMRjtNQVFBLGtDQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSxrR0FGYjtPQVRGO01BWUEsc0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyw2QkFEVDtPQWJGO01BZUEsa0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxrQkFEVDtPQWhCRjtNQWtCQSwwQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLDBCQURUO09BbkJGO01BcUJBLGdDQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNB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QUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0Msb0JBQXBDLEVBQTBELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsVUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFEO01BQ3JCLG1CQUFBLEdBQXNCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0MsbUJBQXBDLEVBQXlELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsV0FBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpEO01BQ3RCLHVCQUFBLEdBQTBCLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQW9CLElBQXBCLENBQWxDO01BRTFCLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQix3QkFBakI7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsa0JBQWpCO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLG1CQUFqQjthQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQix1QkFBakI7SUFoQlE7Ozs7OztFQW1CWixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQTlWakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5jb250ZW50Q2hlY2tSZWdleCA9IG51bGxcbmRlZmF1bHREZXRlY3RSZWFjdEZpbGVQYXR0ZXJuID0gJy8oKHJlcXVpcmVcXFxcKFtcXCdcIl1yZWFjdCg/OigtbmF0aXZlfFxcXFwvYWRkb25zKSk/W1xcJ1wiXVxcXFwpKSl8KGltcG9ydFxcXFxzK1tcXFxcd3t9LFxcXFxzXStcXFxccytmcm9tXFxcXHMrW1xcJ1wiXXJlYWN0KD86KC1uYXRpdmV8XFxcXC9hZGRvbnMpKT9bXFwnXCJdKS8nXG5hdXRvQ29tcGxldGVUYWdTdGFydFJlZ2V4ID0gLyg8KShbYS16QS1aMC05XFwuOiRfXSspL2dcbmF1dG9Db21wbGV0ZVRhZ0Nsb3NlUmVnZXggPSAvKDxcXC8pKFtePl0rKSg+KS9nXG5cbmpzeFRhZ1N0YXJ0UGF0dGVybiA9ICcoP3gpKChefD18cmV0dXJuKVxcXFxzKjwoW14hLz9dKD8hLis/KDwvLis/PikpKSknXG5qc3hDb21wbGV4QXR0cmlidXRlUGF0dGVybiA9ICcoP3gpXFxcXHsgW159XCJcXCddKiAkfFxcXFwoIFteKVwiXFwnXSogJCdcbmRlY3JlYXNlSW5kZW50Rm9yTmV4dExpbmVQYXR0ZXJuID0gJyg/eClcbi8+XFxcXHMqKCx8Oyk/XFxcXHMqJFxufCBeKD8hXFxcXHMqXFxcXD8pXFxcXHMqXFxcXFMrLio8L1stX1xcXFwuQS1aYS16MC05XSs+JCdcblxuY2xhc3MgQXRvbVJlYWN0XG4gIGNvbmZpZzpcbiAgICBlbmFibGVkRm9yQWxsSmF2YXNjcmlwdEZpbGVzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246ICdFbmFibGUgZ3JhbW1hciwgc25pcHBldHMgYW5kIG90aGVyIGZlYXR1cmVzIGF1dG9tYXRpY2FsbHkgZm9yIGFsbCAuanMgZmlsZXMuJ1xuICAgIGRpc2FibGVBdXRvQ2xvc2U6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogJ0Rpc2FibGVkIHRhZyBhdXRvY29tcGxldGlvbidcbiAgICBza2lwVW5kb1N0YWNrRm9yQXV0b0Nsb3NlSW5zZXJ0aW9uOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogJ1doZW4gZW5hYmxlZCwgYXV0byBpbnNlcnQvcmVtb3ZlIGNsb3NpbmcgdGFnIG11dGF0aW9uIGlzIHNraXBwZWQgZnJvbSBub3JtYWwgdW5kby9yZWRvIG9wZXJhdGlvbidcbiAgICBkZXRlY3RSZWFjdEZpbGVQYXR0ZXJuOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IGRlZmF1bHREZXRlY3RSZWFjdEZpbGVQYXR0ZXJuXG4gICAganN4VGFnU3RhcnRQYXR0ZXJuOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IGpzeFRhZ1N0YXJ0UGF0dGVyblxuICAgIGpzeENvbXBsZXhBdHRyaWJ1dGVQYXR0ZXJuOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IGpzeENvbXBsZXhBdHRyaWJ1dGVQYXR0ZXJuXG4gICAgZGVjcmVhc2VJbmRlbnRGb3JOZXh0TGluZVBhdHRlcm46XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogZGVjcmVhc2VJbmRlbnRGb3JOZXh0TGluZVBhdHRlcm5cblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgcGF0Y2hFZGl0b3JMYW5nTW9kZUF1dG9EZWNyZWFzZUluZGVudEZvckJ1ZmZlclJvdzogKGVkaXRvcikgLT5cbiAgICBzZWxmID0gdGhpc1xuICAgIGZuID0gZWRpdG9yLmF1dG9EZWNyZWFzZUluZGVudEZvckJ1ZmZlclJvd1xuICAgIHJldHVybiBpZiBmbi5qc3hQYXRjaFxuXG4gICAgZWRpdG9yLmF1dG9EZWNyZWFzZUluZGVudEZvckJ1ZmZlclJvdyA9IChidWZmZXJSb3csIG9wdGlvbnMpIC0+XG4gICAgICByZXR1cm4gZm4uY2FsbChlZGl0b3IsIGJ1ZmZlclJvdywgb3B0aW9ucykgdW5sZXNzIGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lID09IFwic291cmNlLmpzLmpzeFwiXG5cbiAgICAgIHNjb3BlRGVzY3JpcHRvciA9IEBzY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihbYnVmZmVyUm93LCAwXSlcbiAgICAgIGRlY3JlYXNlTmV4dExpbmVJbmRlbnRSZWdleCA9IEB0b2tlbml6ZWRCdWZmZXIucmVnZXhGb3JQYXR0ZXJuKGF0b20uY29uZmlnLmdldCgncmVhY3QuZGVjcmVhc2VJbmRlbnRGb3JOZXh0TGluZVBhdHRlcm4nKSB8fMKgZGVjcmVhc2VJbmRlbnRGb3JOZXh0TGluZVBhdHRlcm4pXG4gICAgICBkZWNyZWFzZUluZGVudFJlZ2V4ID0gQHRva2VuaXplZEJ1ZmZlci5kZWNyZWFzZUluZGVudFJlZ2V4Rm9yU2NvcGVEZXNjcmlwdG9yKHNjb3BlRGVzY3JpcHRvcilcbiAgICAgIGluY3JlYXNlSW5kZW50UmVnZXggPSBAdG9rZW5pemVkQnVmZmVyLmluY3JlYXNlSW5kZW50UmVnZXhGb3JTY29wZURlc2NyaXB0b3Ioc2NvcGVEZXNjcmlwdG9yKVxuXG4gICAgICBwcmVjZWRpbmdSb3cgPSBAdG9rZW5pemVkQnVmZmVyLmJ1ZmZlci5wcmV2aW91c05vbkJsYW5rUm93KGJ1ZmZlclJvdylcblxuICAgICAgcmV0dXJuIGlmIHByZWNlZGluZ1JvdyA8IDBcblxuICAgICAgcHJlY2VkaW5nTGluZSA9IEB0b2tlbml6ZWRCdWZmZXIuYnVmZmVyLmxpbmVGb3JSb3cocHJlY2VkaW5nUm93KVxuICAgICAgbGluZSA9IEB0b2tlbml6ZWRCdWZmZXIuYnVmZmVyLmxpbmVGb3JSb3coYnVmZmVyUm93KVxuXG4gICAgICBpZiBwcmVjZWRpbmdMaW5lIGFuZCBkZWNyZWFzZU5leHRMaW5lSW5kZW50UmVnZXgudGVzdFN5bmMocHJlY2VkaW5nTGluZSkgYW5kXG4gICAgICAgICBub3QgKGluY3JlYXNlSW5kZW50UmVnZXggYW5kIGluY3JlYXNlSW5kZW50UmVnZXgudGVzdFN5bmMocHJlY2VkaW5nTGluZSkpIGFuZFxuICAgICAgICAgbm90IEBpc0J1ZmZlclJvd0NvbW1lbnRlZChwcmVjZWRpbmdSb3cpXG4gICAgICAgIGN1cnJlbnRJbmRlbnRMZXZlbCA9IEBpbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhwcmVjZWRpbmdSb3cpXG4gICAgICAgIGN1cnJlbnRJbmRlbnRMZXZlbCAtPSAxIGlmIGRlY3JlYXNlSW5kZW50UmVnZXggYW5kIGRlY3JlYXNlSW5kZW50UmVnZXgudGVzdFN5bmMobGluZSlcbiAgICAgICAgZGVzaXJlZEluZGVudExldmVsID0gY3VycmVudEluZGVudExldmVsIC0gMVxuICAgICAgICBpZiBkZXNpcmVkSW5kZW50TGV2ZWwgPj0gMCBhbmQgZGVzaXJlZEluZGVudExldmVsIDwgY3VycmVudEluZGVudExldmVsXG4gICAgICAgICAgQHNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KGJ1ZmZlclJvdywgZGVzaXJlZEluZGVudExldmVsKVxuICAgICAgZWxzZSBpZiBub3QgQGlzQnVmZmVyUm93Q29tbWVudGVkKGJ1ZmZlclJvdylcbiAgICAgICAgZm4uY2FsbChlZGl0b3IsIGJ1ZmZlclJvdywgb3B0aW9ucylcblxuICBwYXRjaEVkaXRvckxhbmdNb2RlU3VnZ2VzdGVkSW5kZW50Rm9yQnVmZmVyUm93OiAoZWRpdG9yKSAtPlxuICAgIHNlbGYgPSB0aGlzXG4gICAgZm4gPSBlZGl0b3Iuc3VnZ2VzdGVkSW5kZW50Rm9yQnVmZmVyUm93XG4gICAgcmV0dXJuIGlmIGZuLmpzeFBhdGNoXG5cbiAgICBlZGl0b3Iuc3VnZ2VzdGVkSW5kZW50Rm9yQnVmZmVyUm93ID0gKGJ1ZmZlclJvdywgb3B0aW9ucykgLT5cbiAgICAgIGluZGVudCA9IGZuLmNhbGwoZWRpdG9yLCBidWZmZXJSb3csIG9wdGlvbnMpXG4gICAgICByZXR1cm4gaW5kZW50IHVubGVzcyBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSA9PSBcInNvdXJjZS5qcy5qc3hcIiBhbmQgYnVmZmVyUm93ID4gMVxuXG4gICAgICBzY29wZURlc2NyaXB0b3IgPSBAc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oW2J1ZmZlclJvdywgMF0pXG5cbiAgICAgIGRlY3JlYXNlTmV4dExpbmVJbmRlbnRSZWdleCA9IEB0b2tlbml6ZWRCdWZmZXIucmVnZXhGb3JQYXR0ZXJuKGF0b20uY29uZmlnLmdldCgncmVhY3QuZGVjcmVhc2VJbmRlbnRGb3JOZXh0TGluZVBhdHRlcm4nKSB8fMKgZGVjcmVhc2VJbmRlbnRGb3JOZXh0TGluZVBhdHRlcm4pXG4gICAgICBpbmNyZWFzZUluZGVudFJlZ2V4ID0gQHRva2VuaXplZEJ1ZmZlci5pbmNyZWFzZUluZGVudFJlZ2V4Rm9yU2NvcGVEZXNjcmlwdG9yKHNjb3BlRGVzY3JpcHRvcilcblxuICAgICAgZGVjcmVhc2VJbmRlbnRSZWdleCA9IEB0b2tlbml6ZWRCdWZmZXIuZGVjcmVhc2VJbmRlbnRSZWdleEZvclNjb3BlRGVzY3JpcHRvcihzY29wZURlc2NyaXB0b3IpXG4gICAgICB0YWdTdGFydFJlZ2V4ID0gQHRva2VuaXplZEJ1ZmZlci5yZWdleEZvclBhdHRlcm4oYXRvbS5jb25maWcuZ2V0KCdyZWFjdC5qc3hUYWdTdGFydFBhdHRlcm4nKSB8fMKganN4VGFnU3RhcnRQYXR0ZXJuKVxuICAgICAgY29tcGxleEF0dHJpYnV0ZVJlZ2V4ID0gQHRva2VuaXplZEJ1ZmZlci5yZWdleEZvclBhdHRlcm4oYXRvbS5jb25maWcuZ2V0KCdyZWFjdC5qc3hDb21wbGV4QXR0cmlidXRlUGF0dGVybicpIHx8wqBqc3hDb21wbGV4QXR0cmlidXRlUGF0dGVybilcblxuICAgICAgcHJlY2VkaW5nUm93ID0gQHRva2VuaXplZEJ1ZmZlci5idWZmZXIucHJldmlvdXNOb25CbGFua1JvdyhidWZmZXJSb3cpXG5cbiAgICAgIHJldHVybiBpbmRlbnQgaWYgcHJlY2VkaW5nUm93IDwgMFxuXG4gICAgICBwcmVjZWRpbmdMaW5lID0gQHRva2VuaXplZEJ1ZmZlci5idWZmZXIubGluZUZvclJvdyhwcmVjZWRpbmdSb3cpXG5cbiAgICAgIHJldHVybiBpbmRlbnQgaWYgbm90IHByZWNlZGluZ0xpbmU/XG5cbiAgICAgIGlmIEBpc0J1ZmZlclJvd0NvbW1lbnRlZChidWZmZXJSb3cpIGFuZCBAaXNCdWZmZXJSb3dDb21tZW50ZWQocHJlY2VkaW5nUm93KVxuICAgICAgICByZXR1cm4gQGluZGVudGF0aW9uRm9yQnVmZmVyUm93KHByZWNlZGluZ1JvdylcblxuICAgICAgdGFnU3RhcnRUZXN0ID0gdGFnU3RhcnRSZWdleC50ZXN0U3luYyhwcmVjZWRpbmdMaW5lKVxuICAgICAgZGVjcmVhc2VJbmRlbnRUZXN0ID0gZGVjcmVhc2VJbmRlbnRSZWdleC50ZXN0U3luYyhwcmVjZWRpbmdMaW5lKVxuXG4gICAgICBpbmRlbnQgKz0gMSBpZiB0YWdTdGFydFRlc3QgYW5kIGNvbXBsZXhBdHRyaWJ1dGVSZWdleC50ZXN0U3luYyhwcmVjZWRpbmdMaW5lKSBhbmQgbm90IEBpc0J1ZmZlclJvd0NvbW1lbnRlZChwcmVjZWRpbmdSb3cpXG4gICAgICBpbmRlbnQgLT0gMSBpZiBwcmVjZWRpbmdMaW5lIGFuZCBub3QgZGVjcmVhc2VJbmRlbnRUZXN0IGFuZCBkZWNyZWFzZU5leHRMaW5lSW5kZW50UmVnZXgudGVzdFN5bmMocHJlY2VkaW5nTGluZSkgYW5kIG5vdCBAaXNCdWZmZXJSb3dDb21tZW50ZWQocHJlY2VkaW5nUm93KVxuXG4gICAgICByZXR1cm4gTWF0aC5tYXgoaW5kZW50LCAwKVxuXG4gIHBhdGNoRWRpdG9yTGFuZ01vZGU6IChlZGl0b3IpIC0+XG4gICAgQHBhdGNoRWRpdG9yTGFuZ01vZGVTdWdnZXN0ZWRJbmRlbnRGb3JCdWZmZXJSb3coZWRpdG9yKT8uanN4UGF0Y2ggPSB0cnVlXG4gICAgQHBhdGNoRWRpdG9yTGFuZ01vZGVBdXRvRGVjcmVhc2VJbmRlbnRGb3JCdWZmZXJSb3coZWRpdG9yKT8uanN4UGF0Y2ggPSB0cnVlXG5cbiAgaXNSZWFjdDogKHRleHQpIC0+XG4gICAgcmV0dXJuIHRydWUgaWYgYXRvbS5jb25maWcuZ2V0KCdyZWFjdC5lbmFibGVkRm9yQWxsSmF2YXNjcmlwdEZpbGVzJylcblxuXG4gICAgaWYgbm90IGNvbnRlbnRDaGVja1JlZ2V4P1xuICAgICAgbWF0Y2ggPSAoYXRvbS5jb25maWcuZ2V0KCdyZWFjdC5kZXRlY3RSZWFjdEZpbGVQYXR0ZXJuJykgfHwgZGVmYXVsdERldGVjdFJlYWN0RmlsZVBhdHRlcm4pLm1hdGNoKG5ldyBSZWdFeHAoJ14vKC4qPykvKFtnaW15XSopJCcpKTtcbiAgICAgIGNvbnRlbnRDaGVja1JlZ2V4ID0gbmV3IFJlZ0V4cChtYXRjaFsxXSwgbWF0Y2hbMl0pXG4gICAgcmV0dXJuIHRleHQubWF0Y2goY29udGVudENoZWNrUmVnZXgpP1xuXG4gIGlzUmVhY3RFbmFibGVkRm9yRWRpdG9yOiAoZWRpdG9yKSAtPlxuICAgIHJldHVybiBlZGl0b3I/ICYmIGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lIGluIFtcInNvdXJjZS5qcy5qc3hcIiwgXCJzb3VyY2UuY29mZmVlLmpzeFwiXVxuXG4gIGF1dG9TZXRHcmFtbWFyOiAoZWRpdG9yKSAtPlxuICAgIHJldHVybiBpZiBAaXNSZWFjdEVuYWJsZWRGb3JFZGl0b3IgZWRpdG9yXG5cbiAgICBwYXRoID0gcmVxdWlyZSAncGF0aCdcblxuICAgICMgQ2hlY2sgaWYgZmlsZSBleHRlbnNpb24gaXMgLmpzeCBvciB0aGUgZmlsZSByZXF1aXJlcyBSZWFjdFxuICAgIGV4dE5hbWUgPSBwYXRoLmV4dG5hbWUoZWRpdG9yLmdldFBhdGgoKSBvciAnJylcbiAgICBpZiBleHROYW1lIGlzIFwiLmpzeFwiIG9yICgoZXh0TmFtZSBpcyBcIi5qc1wiIG9yIGV4dE5hbWUgaXMgXCIuZXM2XCIpIGFuZCBAaXNSZWFjdChlZGl0b3IuZ2V0VGV4dCgpKSlcbiAgICAgIGpzeEdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJzQnlTY29wZU5hbWVbXCJzb3VyY2UuanMuanN4XCJdXG4gICAgICBlZGl0b3Iuc2V0R3JhbW1hciBqc3hHcmFtbWFyIGlmIGpzeEdyYW1tYXJcblxuICBvbkhUTUxUb0pTWDogLT5cbiAgICBqc3hmb3JtYXQgPSByZXF1aXJlICdqc3hmb3JtYXQnXG4gICAgSFRNTHRvSlNYID0gcmVxdWlyZSAnLi9odG1sdG9qc3gnXG4gICAgY29udmVydGVyID0gbmV3IEhUTUx0b0pTWChjcmVhdGVDbGFzczogZmFsc2UpXG5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICAgIHJldHVybiBpZiBub3QgQGlzUmVhY3RFbmFibGVkRm9yRWRpdG9yIGVkaXRvclxuXG4gICAgc2VsZWN0aW9ucyA9IGVkaXRvci5nZXRTZWxlY3Rpb25zKClcblxuICAgIGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBzZWxlY3Rpb25zXG4gICAgICAgIHRyeVxuICAgICAgICAgIHNlbGVjdGlvblRleHQgPSBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gICAgICAgICAganN4T3V0cHV0ID0gY29udmVydGVyLmNvbnZlcnQoc2VsZWN0aW9uVGV4dClcblxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAganN4Zm9ybWF0LnNldE9wdGlvbnMoe30pO1xuICAgICAgICAgICAganN4T3V0cHV0ID0ganN4Zm9ybWF0LmZvcm1hdChqc3hPdXRwdXQpXG5cbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChqc3hPdXRwdXQpO1xuICAgICAgICAgIHJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCk7XG4gICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRCdWZmZXJSb3dzKHJhbmdlLnN0YXJ0LnJvdywgcmFuZ2UuZW5kLnJvdylcblxuICBvblJlZm9ybWF0OiAtPlxuICAgIGpzeGZvcm1hdCA9IHJlcXVpcmUgJ2pzeGZvcm1hdCdcbiAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgICByZXR1cm4gaWYgbm90IEBpc1JlYWN0RW5hYmxlZEZvckVkaXRvciBlZGl0b3JcblxuICAgIHNlbGVjdGlvbnMgPSBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBmb3Igc2VsZWN0aW9uIGluIHNlbGVjdGlvbnNcbiAgICAgICAgdHJ5XG4gICAgICAgICAgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKTtcbiAgICAgICAgICBzZXJpYWxpemVkUmFuZ2UgPSByYW5nZS5zZXJpYWxpemUoKVxuICAgICAgICAgIGJ1ZlN0YXJ0ID0gc2VyaWFsaXplZFJhbmdlWzBdXG4gICAgICAgICAgYnVmRW5kID0gc2VyaWFsaXplZFJhbmdlWzFdXG5cbiAgICAgICAgICBqc3hmb3JtYXQuc2V0T3B0aW9ucyh7fSk7XG4gICAgICAgICAgcmVzdWx0ID0ganN4Zm9ybWF0LmZvcm1hdChzZWxlY3Rpb24uZ2V0VGV4dCgpKVxuXG4gICAgICAgICAgb3JpZ2luYWxMaW5lQ291bnQgPSBlZGl0b3IuZ2V0TGluZUNvdW50KClcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChyZXN1bHQpXG4gICAgICAgICAgbmV3TGluZUNvdW50ID0gZWRpdG9yLmdldExpbmVDb3VudCgpXG5cbiAgICAgICAgICBlZGl0b3IuYXV0b0luZGVudEJ1ZmZlclJvd3MoYnVmU3RhcnRbMF0sIGJ1ZkVuZFswXSArIChuZXdMaW5lQ291bnQgLSBvcmlnaW5hbExpbmVDb3VudCkpXG4gICAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKGJ1ZlN0YXJ0KVxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAjIFBhcnNpbmcvZm9ybWF0dGluZyB0aGUgc2VsZWN0aW9uIGZhaWxlZCBsZXRzIHRyeSB0byBwYXJzZSB0aGUgd2hvbGUgZmlsZSBidXQgZm9ybWF0IHRoZSBzZWxlY3Rpb24gb25seVxuICAgICAgICAgIHJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc2VyaWFsaXplKClcbiAgICAgICAgICAjIGVzcHJpbWEgYXN0IGxpbmUgY291bnQgc3RhcnRzIGZvciAxXG4gICAgICAgICAgcmFuZ2VbMF1bMF0rK1xuICAgICAgICAgIHJhbmdlWzFdWzBdKytcblxuICAgICAgICAgIGpzeGZvcm1hdC5zZXRPcHRpb25zKHtyYW5nZTogcmFuZ2V9KTtcblxuICAgICAgICAgICMgVE9ETzogdXNlIGZvbGRcbiAgICAgICAgICBvcmlnaW5hbCA9IGVkaXRvci5nZXRUZXh0KCk7XG5cbiAgICAgICAgICB0cnlcbiAgICAgICAgICAgIHJlc3VsdCA9IGpzeGZvcm1hdC5mb3JtYXQob3JpZ2luYWwpXG4gICAgICAgICAgICBzZWxlY3Rpb24uY2xlYXIoKVxuXG4gICAgICAgICAgICBvcmlnaW5hbExpbmVDb3VudCA9IGVkaXRvci5nZXRMaW5lQ291bnQoKVxuICAgICAgICAgICAgZWRpdG9yLnNldFRleHQocmVzdWx0KVxuICAgICAgICAgICAgbmV3TGluZUNvdW50ID0gZWRpdG9yLmdldExpbmVDb3VudCgpXG5cbiAgICAgICAgICAgIGZpcnN0Q2hhbmdlZExpbmUgPSByYW5nZVswXVswXSAtIDFcbiAgICAgICAgICAgIGxhc3RDaGFuZ2VkTGluZSA9IHJhbmdlWzFdWzBdIC0gMSArIChuZXdMaW5lQ291bnQgLSBvcmlnaW5hbExpbmVDb3VudClcblxuICAgICAgICAgICAgZWRpdG9yLmF1dG9JbmRlbnRCdWZmZXJSb3dzKGZpcnN0Q2hhbmdlZExpbmUsIGxhc3RDaGFuZ2VkTGluZSlcblxuICAgICAgICAgICAgIyByZXR1cm4gYmFja1xuICAgICAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtmaXJzdENoYW5nZWRMaW5lLCByYW5nZVswXVsxXV0pXG5cbiAgYXV0b0Nsb3NlVGFnOiAoZXZlbnRPYmosIGVkaXRvcikgLT5cbiAgICByZXR1cm4gaWYgYXRvbS5jb25maWcuZ2V0KCdyZWFjdC5kaXNhYmxlQXV0b0Nsb3NlJylcblxuICAgIHJldHVybiBpZiBub3QgQGlzUmVhY3RFbmFibGVkRm9yRWRpdG9yKGVkaXRvcikgb3IgZWRpdG9yICE9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gICAgaWYgZXZlbnRPYmo/Lm5ld1RleHQgaXMgJz4nIGFuZCAhZXZlbnRPYmoub2xkVGV4dFxuICAgICAgIyBhdXRvIGNsb3NpbmcgbXVsdGlwbGUgY3Vyc29ycyBpcyBhIGxpdHRsZSBiaXQgdHJpY2t5IHNvIGxldHMgZGlzYWJsZSBpdCBmb3Igbm93XG4gICAgICByZXR1cm4gaWYgZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpLmxlbmd0aCA+IDE7XG5cbiAgICAgIHRva2VuaXplZExpbmUgPSBlZGl0b3IudG9rZW5pemVkQnVmZmVyPy50b2tlbml6ZWRMaW5lRm9yUm93KGV2ZW50T2JqLm5ld1JhbmdlLmVuZC5yb3cpXG4gICAgICByZXR1cm4gaWYgbm90IHRva2VuaXplZExpbmU/XG5cbiAgICAgIHRva2VuID0gdG9rZW5pemVkTGluZS50b2tlbkF0QnVmZmVyQ29sdW1uKGV2ZW50T2JqLm5ld1JhbmdlLmVuZC5jb2x1bW4gLSAxKVxuXG4gICAgICBpZiBub3QgdG9rZW4/IG9yIHRva2VuLnNjb3Blcy5pbmRleE9mKCd0YWcub3Blbi5qcycpID09IC0xIG9yIHRva2VuLnNjb3Blcy5pbmRleE9mKCdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnRhZy5lbmQuanMnKSA9PSAtMVxuICAgICAgICByZXR1cm5cblxuICAgICAgbGluZXMgPSBlZGl0b3IuYnVmZmVyLmdldExpbmVzKClcbiAgICAgIHJvdyA9IGV2ZW50T2JqLm5ld1JhbmdlLmVuZC5yb3dcbiAgICAgIGxpbmUgPSBsaW5lc1tyb3ddXG4gICAgICBsaW5lID0gbGluZS5zdWJzdHIgMCwgZXZlbnRPYmoubmV3UmFuZ2UuZW5kLmNvbHVtblxuXG4gICAgICAjIFRhZyBpcyBzZWxmIGNsb3NpbmdcbiAgICAgIHJldHVybiBpZiBsaW5lLnN1YnN0cihsaW5lLmxlbmd0aCAtIDIsIDEpIGlzICcvJ1xuXG4gICAgICB0YWdOYW1lID0gbnVsbFxuXG4gICAgICB3aGlsZSBsaW5lPyBhbmQgbm90IHRhZ05hbWU/XG4gICAgICAgIG1hdGNoID0gbGluZS5tYXRjaCBhdXRvQ29tcGxldGVUYWdTdGFydFJlZ2V4XG4gICAgICAgIGlmIG1hdGNoPyAmJiBtYXRjaC5sZW5ndGggPiAwXG4gICAgICAgICAgdGFnTmFtZSA9IG1hdGNoLnBvcCgpLnN1YnN0cigxKVxuICAgICAgICByb3ctLVxuICAgICAgICBsaW5lID0gbGluZXNbcm93XVxuXG4gICAgICBpZiB0YWdOYW1lP1xuICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3JlYWN0LnNraXBVbmRvU3RhY2tGb3JBdXRvQ2xvc2VJbnNlcnRpb24nKVxuICAgICAgICAgIG9wdGlvbnMgPSB7dW5kbzogJ3NraXAnfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgb3B0aW9ucyA9IHt9XG4gICAgICAgICAgXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCc8LycgKyB0YWdOYW1lICsgJz4nLCBvcHRpb25zKVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oZXZlbnRPYmoubmV3UmFuZ2UuZW5kKVxuXG4gICAgZWxzZSBpZiBldmVudE9iaj8ub2xkVGV4dCBpcyAnPicgYW5kIGV2ZW50T2JqPy5uZXdUZXh0IGlzICcnXG5cbiAgICAgIGxpbmVzID0gZWRpdG9yLmJ1ZmZlci5nZXRMaW5lcygpXG4gICAgICByb3cgPSBldmVudE9iai5uZXdSYW5nZS5lbmQucm93XG4gICAgICBmdWxsTGluZSA9IGxpbmVzW3Jvd11cblxuICAgICAgdG9rZW5pemVkTGluZSA9IGVkaXRvci50b2tlbml6ZWRCdWZmZXI/LnRva2VuaXplZExpbmVGb3JSb3coZXZlbnRPYmoubmV3UmFuZ2UuZW5kLnJvdylcbiAgICAgIHJldHVybiBpZiBub3QgdG9rZW5pemVkTGluZT9cblxuICAgICAgdG9rZW4gPSB0b2tlbml6ZWRMaW5lLnRva2VuQXRCdWZmZXJDb2x1bW4oZXZlbnRPYmoubmV3UmFuZ2UuZW5kLmNvbHVtbiAtIDEpXG4gICAgICBpZiBub3QgdG9rZW4/IG9yIHRva2VuLnNjb3Blcy5pbmRleE9mKCd0YWcub3Blbi5qcycpID09IC0xXG4gICAgICAgIHJldHVyblxuICAgICAgbGluZSA9IGZ1bGxMaW5lLnN1YnN0ciAwLCBldmVudE9iai5uZXdSYW5nZS5lbmQuY29sdW1uXG5cbiAgICAgICMgVGFnIGlzIHNlbGYgY2xvc2luZ1xuICAgICAgcmV0dXJuIGlmIGxpbmUuc3Vic3RyKGxpbmUubGVuZ3RoIC0gMSwgMSkgaXMgJy8nXG5cbiAgICAgIHRhZ05hbWUgPSBudWxsXG5cbiAgICAgIHdoaWxlIGxpbmU/IGFuZCBub3QgdGFnTmFtZT9cbiAgICAgICAgbWF0Y2ggPSBsaW5lLm1hdGNoIGF1dG9Db21wbGV0ZVRhZ1N0YXJ0UmVnZXhcbiAgICAgICAgaWYgbWF0Y2g/ICYmIG1hdGNoLmxlbmd0aCA+IDBcbiAgICAgICAgICB0YWdOYW1lID0gbWF0Y2gucG9wKCkuc3Vic3RyKDEpXG4gICAgICAgIHJvdy0tXG4gICAgICAgIGxpbmUgPSBsaW5lc1tyb3ddXG5cbiAgICAgIGlmIHRhZ05hbWU/XG4gICAgICAgIHJlc3QgPSBmdWxsTGluZS5zdWJzdHIoZXZlbnRPYmoubmV3UmFuZ2UuZW5kLmNvbHVtbilcbiAgICAgICAgaWYgcmVzdC5pbmRleE9mKCc8LycgKyB0YWdOYW1lICsgJz4nKSA9PSAwXG4gICAgICAgICAgIyByZXN0IGlzIGNsb3NpbmcgdGFnXG4gICAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdyZWFjdC5za2lwVW5kb1N0YWNrRm9yQXV0b0Nsb3NlSW5zZXJ0aW9uJylcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7dW5kbzogJ3NraXAnfVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fVxuICAgICAgICAgIHNlcmlhbGl6ZWRFbmRQb2ludCA9IFtldmVudE9iai5uZXdSYW5nZS5lbmQucm93LCBldmVudE9iai5uZXdSYW5nZS5lbmQuY29sdW1uXTtcbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIHNlcmlhbGl6ZWRFbmRQb2ludCxcbiAgICAgICAgICAgICAgW3NlcmlhbGl6ZWRFbmRQb2ludFswXSwgc2VyaWFsaXplZEVuZFBvaW50WzFdICsgdGFnTmFtZS5sZW5ndGggKyAzXVxuICAgICAgICAgICAgXVxuICAgICAgICAgICwgJycsIG9wdGlvbnMpXG5cbiAgICBlbHNlIGlmIGV2ZW50T2JqPyBhbmQgZXZlbnRPYmoubmV3VGV4dC5tYXRjaCAvXFxyP1xcbi9cbiAgICAgIGxpbmVzID0gZWRpdG9yLmJ1ZmZlci5nZXRMaW5lcygpXG4gICAgICByb3cgPSBldmVudE9iai5uZXdSYW5nZS5lbmQucm93XG4gICAgICBsYXN0TGluZSA9IGxpbmVzW3JvdyAtIDFdXG4gICAgICBmdWxsTGluZSA9IGxpbmVzW3Jvd11cblxuICAgICAgaWYgLz4kLy50ZXN0KGxhc3RMaW5lKSBhbmQgZnVsbExpbmUuc2VhcmNoKGF1dG9Db21wbGV0ZVRhZ0Nsb3NlUmVnZXgpID09IDBcbiAgICAgICAgd2hpbGUgbGFzdExpbmU/XG4gICAgICAgICAgbWF0Y2ggPSBsYXN0TGluZS5tYXRjaCBhdXRvQ29tcGxldGVUYWdTdGFydFJlZ2V4XG4gICAgICAgICAgaWYgbWF0Y2g/ICYmIG1hdGNoLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgcm93LS1cbiAgICAgICAgICBsYXN0TGluZSA9IGxpbmVzW3Jvd11cblxuICAgICAgICBsYXN0TGluZVNwYWNlcyA9IGxhc3RMaW5lLm1hdGNoKC9eXFxzKi8pXG4gICAgICAgIGxhc3RMaW5lU3BhY2VzID0gaWYgbGFzdExpbmVTcGFjZXM/IHRoZW4gbGFzdExpbmVTcGFjZXNbMF0gZWxzZSAnJ1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnXFxuJyArIGxhc3RMaW5lU3BhY2VzKVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oZXZlbnRPYmoubmV3UmFuZ2UuZW5kKVxuXG4gIHByb2Nlc3NFZGl0b3I6IChlZGl0b3IpIC0+XG4gICAgQHBhdGNoRWRpdG9yTGFuZ01vZGUoZWRpdG9yKVxuICAgIEBhdXRvU2V0R3JhbW1hcihlZGl0b3IpXG4gICAgZGlzcG9zYWJsZUJ1ZmZlckV2ZW50ID0gZWRpdG9yLmJ1ZmZlci5vbkRpZENoYW5nZSAoZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEBhdXRvQ2xvc2VUYWcgZSwgZWRpdG9yXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGVkaXRvci5vbkRpZERlc3Ryb3kgPT4gZGlzcG9zYWJsZUJ1ZmZlckV2ZW50LmRpc3Bvc2UoKVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZChkaXNwb3NhYmxlQnVmZmVyRXZlbnQpO1xuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICBhY3RpdmF0ZTogLT5cblxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cblxuICAgICMgQmluZCBldmVudHNcbiAgICBkaXNwb3NhYmxlQ29uZmlnTGlzdGVuZXIgPSBhdG9tLmNvbmZpZy5vYnNlcnZlICdyZWFjdC5kZXRlY3RSZWFjdEZpbGVQYXR0ZXJuJywgKG5ld1ZhbHVlKSAtPlxuICAgICAgY29udGVudENoZWNrUmVnZXggPSBudWxsXG5cbiAgICBkaXNwb3NhYmxlUmVmb3JtYXQgPSBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAncmVhY3Q6cmVmb3JtYXQtSlNYJywgPT4gQG9uUmVmb3JtYXQoKVxuICAgIGRpc3Bvc2FibGVIVE1MVE9KU1ggPSBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAncmVhY3Q6SFRNTC10by1KU1gnLCA9PiBAb25IVE1MVG9KU1goKVxuICAgIGRpc3Bvc2FibGVQcm9jZXNzRWRpdG9yID0gYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIEBwcm9jZXNzRWRpdG9yLmJpbmQodGhpcylcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgZGlzcG9zYWJsZUNvbmZpZ0xpc3RlbmVyXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBkaXNwb3NhYmxlUmVmb3JtYXRcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGRpc3Bvc2FibGVIVE1MVE9KU1hcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGRpc3Bvc2FibGVQcm9jZXNzRWRpdG9yXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBdG9tUmVhY3RcbiJdfQ==
