(function() {
  var CompositeDisposable, Point, PythonTools, Range, path, ref, regexPatternIn,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point, CompositeDisposable = ref.CompositeDisposable;

  path = require('path');

  regexPatternIn = function(pattern, list) {
    var item, j, len;
    for (j = 0, len = list.length; j < len; j++) {
      item = list[j];
      if (pattern.test(item)) {
        return true;
      }
    }
    return false;
  };

  PythonTools = {
    config: {
      smartBlockSelection: {
        type: 'boolean',
        description: 'Do not select whitespace outside logical string blocks',
        "default": true
      },
      pythonPath: {
        type: 'string',
        "default": '',
        title: 'Path to python directory',
        description: 'Optional. Set it if default values are not working for you or you want to use specific\npython version. For example: `/usr/local/Cellar/python/2.7.3/bin` or `E:\\Python2.7`'
      }
    },
    subscriptions: null,
    _issueReportLink: "https://github.com/michaelaquilina/python-tools/issues/new",
    activate: function(state) {
      var env, j, len, p, path_env, paths, pythonPath;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar="source python"]', {
        'python-tools:show-usages': (function(_this) {
          return function() {
            return _this.jediToolsRequest('usages');
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar="source python"]', {
        'python-tools:goto-definition': (function(_this) {
          return function() {
            return _this.jediToolsRequest('gotoDef');
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar="source python"]', {
        'python-tools:select-all-string': (function(_this) {
          return function() {
            return _this.selectAllString();
          };
        })(this)
      }));
      env = process.env;
      pythonPath = atom.config.get('python-tools.pythonPath');
      path_env = null;
      if (/^win/.test(process.platform)) {
        paths = ['C:\\Python2.7', 'C:\\Python27', 'C:\\Python3.4', 'C:\\Python34', 'C:\\Python3.5', 'C:\\Python35', 'C:\\Program Files (x86)\\Python 2.7', 'C:\\Program Files (x86)\\Python 3.4', 'C:\\Program Files (x86)\\Python 3.5', 'C:\\Program Files (x64)\\Python 2.7', 'C:\\Program Files (x64)\\Python 3.4', 'C:\\Program Files (x64)\\Python 3.5', 'C:\\Program Files\\Python 2.7', 'C:\\Program Files\\Python 3.4', 'C:\\Program Files\\Python 3.5'];
        path_env = env.Path || '';
      } else {
        paths = ['/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin'];
        path_env = env.PATH || '';
      }
      path_env = path_env.split(path.delimiter);
      if (pythonPath && indexOf.call(path_env, pythonPath) < 0) {
        path_env.unshift(pythonPath);
      }
      for (j = 0, len = paths.length; j < len; j++) {
        p = paths[j];
        if (indexOf.call(path_env, p) < 0) {
          path_env.push(p);
        }
      }
      env.PATH = path_env.join(path.delimiter);
      this.provider = require('child_process').spawn('python', [__dirname + '/tools.py'], {
        env: env
      });
      this.readline = require('readline').createInterface({
        input: this.provider.stdout,
        output: this.provider.stdin
      });
      this.provider.on('error', (function(_this) {
        return function(err) {
          if (err.code === 'ENOENT') {
            return atom.notifications.addWarning("python-tools was unable to find your machine's python executable.\n\nPlease try set the path in package settings and then restart atom.\n\nIf the issue persists please post an issue on\n" + _this._issueReportLink, {
              detail: err,
              dismissable: true
            });
          } else {
            return atom.notifications.addError("python-tools unexpected error.\n\nPlease consider posting an issue on\n" + _this._issueReportLink, {
              detail: err,
              dismissable: true
            });
          }
        };
      })(this));
      return this.provider.on('exit', (function(_this) {
        return function(code, signal) {
          if (signal !== 'SIGTERM') {
            return atom.notifications.addError("python-tools experienced an unexpected exit.\n\nPlease consider posting an issue on\n" + _this._issueReportLink, {
              detail: "exit with code " + code + ", signal " + signal,
              dismissable: true
            });
          }
        };
      })(this));
    },
    deactivate: function() {
      this.subscriptions.dispose();
      this.provider.kill();
      return this.readline.close();
    },
    selectAllString: function() {
      var block, bufferPosition, delim_index, delimiter, editor, end, end_index, i, j, line, ref1, ref2, scopeDescriptor, scopes, selections, start, start_index, trimmed;
      editor = atom.workspace.getActiveTextEditor();
      bufferPosition = editor.getCursorBufferPosition();
      line = editor.lineTextForBufferRow(bufferPosition.row);
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
      scopes = scopeDescriptor.getScopesArray();
      block = false;
      if (regexPatternIn(/string.quoted.single.single-line.*/, scopes)) {
        delimiter = '\'';
      } else if (regexPatternIn(/string.quoted.double.single-line.*/, scopes)) {
        delimiter = '"';
      } else if (regexPatternIn(/string.quoted.double.block.*/, scopes)) {
        delimiter = '"""';
        block = true;
      } else if (regexPatternIn(/string.quoted.single.block.*/, scopes)) {
        delimiter = '\'\'\'';
        block = true;
      } else {
        return;
      }
      if (!block) {
        start = end = bufferPosition.column;
        while (line[start] !== delimiter) {
          start = start - 1;
          if (start < 0) {
            return;
          }
        }
        while (line[end] !== delimiter) {
          end = end + 1;
          if (end === line.length) {
            return;
          }
        }
        return editor.setSelectedBufferRange(new Range(new Point(bufferPosition.row, start + 1), new Point(bufferPosition.row, end)));
      } else {
        start = end = bufferPosition.row;
        start_index = end_index = -1;
        delim_index = line.indexOf(delimiter);
        if (delim_index !== -1) {
          scopes = editor.scopeDescriptorForBufferPosition(new Point(start, delim_index));
          scopes = scopes.getScopesArray();
          if (regexPatternIn(/punctuation.definition.string.begin.*/, scopes)) {
            start_index = line.indexOf(delimiter);
            while (end_index === -1) {
              end = end + 1;
              line = editor.lineTextForBufferRow(end);
              end_index = line.indexOf(delimiter);
            }
          } else if (regexPatternIn(/punctuation.definition.string.end.*/, scopes)) {
            end_index = line.indexOf(delimiter);
            while (start_index === -1) {
              start = start - 1;
              line = editor.lineTextForBufferRow(start);
              start_index = line.indexOf(delimiter);
            }
          }
        } else {
          while (end_index === -1) {
            end = end + 1;
            line = editor.lineTextForBufferRow(end);
            end_index = line.indexOf(delimiter);
          }
          while (start_index === -1) {
            start = start - 1;
            line = editor.lineTextForBufferRow(start);
            start_index = line.indexOf(delimiter);
          }
        }
        if (atom.config.get('python-tools.smartBlockSelection')) {
          selections = [new Range(new Point(start, start_index + delimiter.length), new Point(start, editor.lineTextForBufferRow(start).length))];
          for (i = j = ref1 = start + 1, ref2 = end; j < ref2; i = j += 1) {
            line = editor.lineTextForBufferRow(i);
            trimmed = line.replace(/^\s+/, "");
            selections.push(new Range(new Point(i, line.length - trimmed.length), new Point(i, line.length)));
          }
          line = editor.lineTextForBufferRow(end);
          trimmed = line.replace(/^\s+/, "");
          selections.push(new Range(new Point(end, line.length - trimmed.length), new Point(end, end_index)));
          return editor.setSelectedBufferRanges(selections.filter(function(range) {
            return !range.isEmpty();
          }));
        } else {
          return editor.setSelectedBufferRange(new Range(new Point(start, start_index + delimiter.length), new Point(end, end_index)));
        }
      }
    },
    handleJediToolsResponse: function(response) {
      var column, editor, first_def, item, j, len, line, options, ref1, selections;
      if ('error' in response) {
        console.error(response['error']);
        atom.notifications.addError(response['error']);
        return;
      }
      if (response['definitions'].length > 0) {
        editor = atom.workspace.getActiveTextEditor();
        if (response['type'] === 'usages') {
          path = editor.getPath();
          selections = [];
          ref1 = response['definitions'];
          for (j = 0, len = ref1.length; j < len; j++) {
            item = ref1[j];
            if (item['path'] === path) {
              selections.push(new Range(new Point(item['line'] - 1, item['col']), new Point(item['line'] - 1, item['col'] + item['name'].length)));
            }
          }
          return editor.setSelectedBufferRanges(selections);
        } else if (response['type'] === 'gotoDef') {
          first_def = response['definitions'][0];
          line = first_def['line'];
          column = first_def['col'];
          if (line !== null && column !== null) {
            options = {
              initialLine: line,
              initialColumn: column,
              searchAllPanes: true
            };
            return atom.workspace.open(first_def['path'], options).then(function(editor) {
              return editor.scrollToCursorPosition();
            });
          }
        } else {
          return atom.notifications.addError("python-tools error. " + this._issueReportLink, {
            detail: JSON.stringify(response),
            dismissable: true
          });
        }
      } else {
        return atom.notifications.addInfo("python-tools could not find any results!");
      }
    },
    jediToolsRequest: function(type) {
      var bufferPosition, editor, grammar, handleJediToolsResponse, payload, readline;
      editor = atom.workspace.getActiveTextEditor();
      grammar = editor.getGrammar();
      bufferPosition = editor.getCursorBufferPosition();
      payload = {
        type: type,
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        col: bufferPosition.column,
        project_paths: atom.project.getPaths()
      };
      handleJediToolsResponse = this.handleJediToolsResponse;
      readline = this.readline;
      return new Promise(function(resolve, reject) {
        var response;
        return response = readline.question((JSON.stringify(payload)) + "\n", function(response) {
          handleJediToolsResponse(JSON.parse(response));
          return resolve();
        });
      });
    }
  };

  module.exports = PythonTools;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcHl0aG9uLXRvb2xzL2xpYi9weXRob24tdG9vbHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx5RUFBQTtJQUFBOztFQUFBLE1BQXNDLE9BQUEsQ0FBUSxNQUFSLENBQXRDLEVBQUMsaUJBQUQsRUFBUSxpQkFBUixFQUFlOztFQUNmLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFHUCxjQUFBLEdBQWlCLFNBQUMsT0FBRCxFQUFVLElBQVY7QUFDZixRQUFBO0FBQUEsU0FBQSxzQ0FBQTs7TUFDRSxJQUFHLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBYixDQUFIO0FBQ0UsZUFBTyxLQURUOztBQURGO0FBR0EsV0FBTztFQUpROztFQU9qQixXQUFBLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxtQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxXQUFBLEVBQWEsd0RBRGI7UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRlQ7T0FERjtNQUlBLFVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsS0FBQSxFQUFPLDBCQUZQO1FBR0EsV0FBQSxFQUFhLDhLQUhiO09BTEY7S0FERjtJQWNBLGFBQUEsRUFBZSxJQWRmO0lBZ0JBLGdCQUFBLEVBQWtCLDREQWhCbEI7SUFrQkEsUUFBQSxFQUFVLFNBQUMsS0FBRDtBQUVSLFVBQUE7TUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUNFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnREFBbEIsRUFDQTtRQUFBLDBCQUFBLEVBQTRCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFB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LGNBQWMsQ0FBQyxHQUhyQjtRQUlBLEdBQUEsRUFBSyxjQUFjLENBQUMsTUFKcEI7UUFLQSxhQUFBLEVBQWUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FMZjs7TUFRRix1QkFBQSxHQUEwQixJQUFDLENBQUE7TUFDM0IsUUFBQSxHQUFXLElBQUMsQ0FBQTtBQUVaLGFBQVcsSUFBQSxPQUFBLENBQVEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNqQixZQUFBO2VBQUEsUUFBQSxHQUFXLFFBQVEsQ0FBQyxRQUFULENBQW9CLENBQUMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxPQUFmLENBQUQsQ0FBQSxHQUF5QixJQUE3QyxFQUFrRCxTQUFDLFFBQUQ7VUFDM0QsdUJBQUEsQ0FBd0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYLENBQXhCO2lCQUNBLE9BQUEsQ0FBQTtRQUYyRCxDQUFsRDtNQURNLENBQVI7SUFsQkssQ0EvUWxCOzs7RUF1U0YsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFuVGpCIiwic291cmNlc0NvbnRlbnQiOlsie1JhbmdlLCBQb2ludCwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cblxucmVnZXhQYXR0ZXJuSW4gPSAocGF0dGVybiwgbGlzdCkgLT5cbiAgZm9yIGl0ZW0gaW4gbGlzdFxuICAgIGlmIHBhdHRlcm4udGVzdCBpdGVtXG4gICAgICByZXR1cm4gdHJ1ZVxuICByZXR1cm4gZmFsc2VcblxuXG5QeXRob25Ub29scyA9XG4gIGNvbmZpZzpcbiAgICBzbWFydEJsb2NrU2VsZWN0aW9uOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZXNjcmlwdGlvbjogJ0RvIG5vdCBzZWxlY3Qgd2hpdGVzcGFjZSBvdXRzaWRlIGxvZ2ljYWwgc3RyaW5nIGJsb2NrcydcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICBweXRob25QYXRoOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICB0aXRsZTogJ1BhdGggdG8gcHl0aG9uIGRpcmVjdG9yeSdcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydcbiAgICAgIE9wdGlvbmFsLiBTZXQgaXQgaWYgZGVmYXVsdCB2YWx1ZXMgYXJlIG5vdCB3b3JraW5nIGZvciB5b3Ugb3IgeW91IHdhbnQgdG8gdXNlIHNwZWNpZmljXG4gICAgICBweXRob24gdmVyc2lvbi4gRm9yIGV4YW1wbGU6IGAvdXNyL2xvY2FsL0NlbGxhci9weXRob24vMi43LjMvYmluYCBvciBgRTpcXFxcUHl0aG9uMi43YFxuICAgICAgJycnXG5cbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuXG4gIF9pc3N1ZVJlcG9ydExpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL21pY2hhZWxhcXVpbGluYS9weXRob24tdG9vbHMvaXNzdWVzL25ld1wiXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICAjIEV2ZW50cyBzdWJzY3JpYmVkIHRvIGluIGF0b20ncyBzeXN0ZW0gY2FuIGJlIGVhc2lseSBjbGVhbmVkIHVwIHdpdGggYSBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcj1cInNvdXJjZSBweXRob25cIl0nLFxuICAgICAgJ3B5dGhvbi10b29sczpzaG93LXVzYWdlcyc6ID0+IEBqZWRpVG9vbHNSZXF1ZXN0KCd1c2FnZXMnKVxuICAgIClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXI9XCJzb3VyY2UgcHl0aG9uXCJdJyxcbiAgICAgICdweXRob24tdG9vbHM6Z290by1kZWZpbml0aW9uJzogPT4gQGplZGlUb29sc1JlcXVlc3QoJ2dvdG9EZWYnKVxuICAgIClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXI9XCJzb3VyY2UgcHl0aG9uXCJdJyxcbiAgICAgICdweXRob24tdG9vbHM6c2VsZWN0LWFsbC1zdHJpbmcnOiA9PiBAc2VsZWN0QWxsU3RyaW5nKClcbiAgICApXG5cbiAgICBlbnYgPSBwcm9jZXNzLmVudlxuICAgIHB5dGhvblBhdGggPSBhdG9tLmNvbmZpZy5nZXQoJ3B5dGhvbi10b29scy5weXRob25QYXRoJylcbiAgICBwYXRoX2VudiA9IG51bGxcblxuICAgIGlmIC9ed2luLy50ZXN0IHByb2Nlc3MucGxhdGZvcm1cbiAgICAgIHBhdGhzID0gWydDOlxcXFxQeXRob24yLjcnLFxuICAgICAgICAgICAgICAgJ0M6XFxcXFB5dGhvbjI3JyxcbiAgICAgICAgICAgICAgICdDOlxcXFxQeXRob24zLjQnLFxuICAgICAgICAgICAgICAgJ0M6XFxcXFB5dGhvbjM0JyxcbiAgICAgICAgICAgICAgICdDOlxcXFxQeXRob24zLjUnLFxuICAgICAgICAgICAgICAgJ0M6XFxcXFB5dGhvbjM1JyxcbiAgICAgICAgICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4ODYpXFxcXFB5dGhvbiAyLjcnLFxuICAgICAgICAgICAgICAgJ0M6XFxcXFByb2dyYW0gRmlsZXMgKHg4NilcXFxcUHl0aG9uIDMuNCcsXG4gICAgICAgICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlcyAoeDg2KVxcXFxQeXRob24gMy41JyxcbiAgICAgICAgICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4NjQpXFxcXFB5dGhvbiAyLjcnLFxuICAgICAgICAgICAgICAgJ0M6XFxcXFByb2dyYW0gRmlsZXMgKHg2NClcXFxcUHl0aG9uIDMuNCcsXG4gICAgICAgICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlcyAoeDY0KVxcXFxQeXRob24gMy41JyxcbiAgICAgICAgICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzXFxcXFB5dGhvbiAyLjcnLFxuICAgICAgICAgICAgICAgJ0M6XFxcXFByb2dyYW0gRmlsZXNcXFxcUHl0aG9uIDMuNCcsXG4gICAgICAgICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlc1xcXFxQeXRob24gMy41J11cbiAgICAgIHBhdGhfZW52ID0gKGVudi5QYXRoIG9yICcnKVxuICAgIGVsc2VcbiAgICAgIHBhdGhzID0gWycvdXNyL2xvY2FsL2JpbicsICcvdXNyL2JpbicsICcvYmluJywgJy91c3Ivc2JpbicsICcvc2JpbiddXG4gICAgICBwYXRoX2VudiA9IChlbnYuUEFUSCBvciAnJylcblxuICAgIHBhdGhfZW52ID0gcGF0aF9lbnYuc3BsaXQocGF0aC5kZWxpbWl0ZXIpXG4gICAgcGF0aF9lbnYudW5zaGlmdCBweXRob25QYXRoIGlmIHB5dGhvblBhdGggYW5kIHB5dGhvblBhdGggbm90IGluIHBhdGhfZW52XG4gICAgZm9yIHAgaW4gcGF0aHNcbiAgICAgIGlmIHAgbm90IGluIHBhdGhfZW52XG4gICAgICAgIHBhdGhfZW52LnB1c2ggcFxuICAgIGVudi5QQVRIID0gcGF0aF9lbnYuam9pbiBwYXRoLmRlbGltaXRlclxuXG4gICAgQHByb3ZpZGVyID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLnNwYXduKFxuICAgICAgJ3B5dGhvbicsIFtfX2Rpcm5hbWUgKyAnL3Rvb2xzLnB5J10sIGVudjogZW52XG4gICAgKVxuXG4gICAgQHJlYWRsaW5lID0gcmVxdWlyZSgncmVhZGxpbmUnKS5jcmVhdGVJbnRlcmZhY2UoXG4gICAgICBpbnB1dDogQHByb3ZpZGVyLnN0ZG91dFxuICAgICAgb3V0cHV0OiBAcHJvdmlkZXIuc3RkaW5cbiAgICApXG5cbiAgICBAcHJvdmlkZXIub24gJ2Vycm9yJywgKGVycikgPT5cbiAgICAgIGlmIGVyci5jb2RlID09ICdFTk9FTlQnXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiXCJcIlxuICAgICAgICAgIHB5dGhvbi10b29scyB3YXMgdW5hYmxlIHRvIGZpbmQgeW91ciBtYWNoaW5lJ3MgcHl0aG9uIGV4ZWN1dGFibGUuXG5cbiAgICAgICAgICBQbGVhc2UgdHJ5IHNldCB0aGUgcGF0aCBpbiBwYWNrYWdlIHNldHRpbmdzIGFuZCB0aGVuIHJlc3RhcnQgYXRvbS5cblxuICAgICAgICAgIElmIHRoZSBpc3N1ZSBwZXJzaXN0cyBwbGVhc2UgcG9zdCBhbiBpc3N1ZSBvblxuICAgICAgICAgICN7QF9pc3N1ZVJlcG9ydExpbmt9XG4gICAgICAgICAgXCJcIlwiLCB7XG4gICAgICAgICAgICBkZXRhaWw6IGVycixcbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICBlbHNlXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcIlwiXCJcbiAgICAgICAgICBweXRob24tdG9vbHMgdW5leHBlY3RlZCBlcnJvci5cblxuICAgICAgICAgIFBsZWFzZSBjb25zaWRlciBwb3N0aW5nIGFuIGlzc3VlIG9uXG4gICAgICAgICAgI3tAX2lzc3VlUmVwb3J0TGlua31cbiAgICAgICAgICBcIlwiXCIsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiBlcnIsXG4gICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICBAcHJvdmlkZXIub24gJ2V4aXQnLCAoY29kZSwgc2lnbmFsKSA9PlxuICAgICAgaWYgc2lnbmFsICE9ICdTSUdURVJNJ1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgcHl0aG9uLXRvb2xzIGV4cGVyaWVuY2VkIGFuIHVuZXhwZWN0ZWQgZXhpdC5cblxuICAgICAgICAgIFBsZWFzZSBjb25zaWRlciBwb3N0aW5nIGFuIGlzc3VlIG9uXG4gICAgICAgICAgI3tAX2lzc3VlUmVwb3J0TGlua31cbiAgICAgICAgICBcIlwiXCIsIHtcbiAgICAgICAgICAgIGRldGFpbDogXCJleGl0IHdpdGggY29kZSAje2NvZGV9LCBzaWduYWwgI3tzaWduYWx9XCIsXG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQHByb3ZpZGVyLmtpbGwoKVxuICAgIEByZWFkbGluZS5jbG9zZSgpXG5cbiAgc2VsZWN0QWxsU3RyaW5nOiAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGJ1ZmZlclBvc2l0aW9uLnJvdylcblxuICAgIHNjb3BlRGVzY3JpcHRvciA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcbiAgICBzY29wZXMgPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKVxuXG4gICAgYmxvY2sgPSBmYWxzZVxuICAgIGlmIHJlZ2V4UGF0dGVybkluKC9zdHJpbmcucXVvdGVkLnNpbmdsZS5zaW5nbGUtbGluZS4qLywgc2NvcGVzKVxuICAgICAgZGVsaW1pdGVyID0gJ1xcJydcbiAgICBlbHNlIGlmIHJlZ2V4UGF0dGVybkluKC9zdHJpbmcucXVvdGVkLmRvdWJsZS5zaW5nbGUtbGluZS4qLywgc2NvcGVzKVxuICAgICAgZGVsaW1pdGVyID0gJ1wiJ1xuICAgIGVsc2UgaWYgcmVnZXhQYXR0ZXJuSW4oL3N0cmluZy5xdW90ZWQuZG91YmxlLmJsb2NrLiovLHNjb3BlcylcbiAgICAgIGRlbGltaXRlciA9ICdcIlwiXCInXG4gICAgICBibG9jayA9IHRydWVcbiAgICBlbHNlIGlmIHJlZ2V4UGF0dGVybkluKC9zdHJpbmcucXVvdGVkLnNpbmdsZS5ibG9jay4qLywgc2NvcGVzKVxuICAgICAgZGVsaW1pdGVyID0gJ1xcJ1xcJ1xcJydcbiAgICAgIGJsb2NrID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIHJldHVyblxuXG4gICAgaWYgbm90IGJsb2NrXG4gICAgICBzdGFydCA9IGVuZCA9IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuXG4gICAgICB3aGlsZSBsaW5lW3N0YXJ0XSAhPSBkZWxpbWl0ZXJcbiAgICAgICAgc3RhcnQgPSBzdGFydCAtIDFcbiAgICAgICAgaWYgc3RhcnQgPCAwXG4gICAgICAgICAgcmV0dXJuXG5cbiAgICAgIHdoaWxlIGxpbmVbZW5kXSAhPSBkZWxpbWl0ZXJcbiAgICAgICAgZW5kID0gZW5kICsgMVxuICAgICAgICBpZiBlbmQgPT0gbGluZS5sZW5ndGhcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UobmV3IFJhbmdlKFxuICAgICAgICBuZXcgUG9pbnQoYnVmZmVyUG9zaXRpb24ucm93LCBzdGFydCArIDEpLFxuICAgICAgICBuZXcgUG9pbnQoYnVmZmVyUG9zaXRpb24ucm93LCBlbmQpLFxuICAgICAgKSlcbiAgICBlbHNlXG4gICAgICBzdGFydCA9IGVuZCA9IGJ1ZmZlclBvc2l0aW9uLnJvd1xuICAgICAgc3RhcnRfaW5kZXggPSBlbmRfaW5kZXggPSAtMVxuXG4gICAgICAjIERldGVjdCBpZiB3ZSBhcmUgYXQgdGhlIGJvdW5kYXJpZXMgb2YgdGhlIGJsb2NrIHN0cmluZ1xuICAgICAgZGVsaW1faW5kZXggPSBsaW5lLmluZGV4T2YoZGVsaW1pdGVyKVxuXG4gICAgICBpZiBkZWxpbV9pbmRleCAhPSAtMVxuICAgICAgICBzY29wZXMgPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24obmV3IFBvaW50KHN0YXJ0LCBkZWxpbV9pbmRleCkpXG4gICAgICAgIHNjb3BlcyA9IHNjb3Blcy5nZXRTY29wZXNBcnJheSgpXG5cbiAgICAgICAgIyBXZSBhcmUgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYmxvY2tcbiAgICAgICAgaWYgcmVnZXhQYXR0ZXJuSW4oL3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmJlZ2luLiovLCBzY29wZXMpXG4gICAgICAgICAgc3RhcnRfaW5kZXggPSBsaW5lLmluZGV4T2YoZGVsaW1pdGVyKVxuICAgICAgICAgIHdoaWxlIGVuZF9pbmRleCA9PSAtMVxuICAgICAgICAgICAgZW5kID0gZW5kICsgMVxuICAgICAgICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhlbmQpXG4gICAgICAgICAgICBlbmRfaW5kZXggPSBsaW5lLmluZGV4T2YoZGVsaW1pdGVyKVxuXG4gICAgICAgICMgV2UgYXJlIHRoZSBlbmQgb2YgdGhlIGJsb2NrXG4gICAgICAgIGVsc2UgaWYgcmVnZXhQYXR0ZXJuSW4oL3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmVuZC4qLywgc2NvcGVzKVxuICAgICAgICAgIGVuZF9pbmRleCA9IGxpbmUuaW5kZXhPZihkZWxpbWl0ZXIpXG4gICAgICAgICAgd2hpbGUgc3RhcnRfaW5kZXggPT0gLTFcbiAgICAgICAgICAgIHN0YXJ0ID0gc3RhcnQgLSAxXG4gICAgICAgICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHN0YXJ0KVxuICAgICAgICAgICAgc3RhcnRfaW5kZXggPSBsaW5lLmluZGV4T2YoZGVsaW1pdGVyKVxuXG4gICAgICBlbHNlXG4gICAgICAgICMgV2UgYXJlIG5laXRoZXIgYXQgdGhlIGJlZ2lubmluZyBvciB0aGUgZW5kIG9mIHRoZSBibG9ja1xuICAgICAgICB3aGlsZSBlbmRfaW5kZXggPT0gLTFcbiAgICAgICAgICBlbmQgPSBlbmQgKyAxXG4gICAgICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhlbmQpXG4gICAgICAgICAgZW5kX2luZGV4ID0gbGluZS5pbmRleE9mKGRlbGltaXRlcilcbiAgICAgICAgd2hpbGUgc3RhcnRfaW5kZXggPT0gLTFcbiAgICAgICAgICBzdGFydCA9IHN0YXJ0IC0gMVxuICAgICAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coc3RhcnQpXG4gICAgICAgICAgc3RhcnRfaW5kZXggPSBsaW5lLmluZGV4T2YoZGVsaW1pdGVyKVxuXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3B5dGhvbi10b29scy5zbWFydEJsb2NrU2VsZWN0aW9uJylcbiAgICAgICAgIyBTbWFydCBibG9jayBzZWxlY3Rpb25zXG4gICAgICAgIHNlbGVjdGlvbnMgPSBbbmV3IFJhbmdlKFxuICAgICAgICAgIG5ldyBQb2ludChzdGFydCwgc3RhcnRfaW5kZXggKyBkZWxpbWl0ZXIubGVuZ3RoKSxcbiAgICAgICAgICBuZXcgUG9pbnQoc3RhcnQsIGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhzdGFydCkubGVuZ3RoKSxcbiAgICAgICAgKV1cblxuICAgICAgICBmb3IgaSBpbiBbc3RhcnQgKyAxIC4uLiBlbmRdIGJ5IDFcbiAgICAgICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGkpXG4gICAgICAgICAgdHJpbW1lZCA9IGxpbmUucmVwbGFjZSgvXlxccysvLCBcIlwiKSAgIyBsZWZ0IHRyaW1cbiAgICAgICAgICBzZWxlY3Rpb25zLnB1c2ggbmV3IFJhbmdlKFxuICAgICAgICAgICAgbmV3IFBvaW50KGksIGxpbmUubGVuZ3RoIC0gdHJpbW1lZC5sZW5ndGgpLFxuICAgICAgICAgICAgbmV3IFBvaW50KGksIGxpbmUubGVuZ3RoKSxcbiAgICAgICAgICApXG5cbiAgICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhlbmQpXG4gICAgICAgIHRyaW1tZWQgPSBsaW5lLnJlcGxhY2UoL15cXHMrLywgXCJcIikgICMgbGVmdCB0cmltXG5cbiAgICAgICAgc2VsZWN0aW9ucy5wdXNoIG5ldyBSYW5nZShcbiAgICAgICAgICBuZXcgUG9pbnQoZW5kLCBsaW5lLmxlbmd0aCAtIHRyaW1tZWQubGVuZ3RoKSxcbiAgICAgICAgICBuZXcgUG9pbnQoZW5kLCBlbmRfaW5kZXgpLFxuICAgICAgICApXG5cbiAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKHNlbGVjdGlvbnMuZmlsdGVyIChyYW5nZSkgLT4gbm90IHJhbmdlLmlzRW1wdHkoKSlcbiAgICAgIGVsc2VcbiAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UobmV3IFJhbmdlKFxuICAgICAgICAgIG5ldyBQb2ludChzdGFydCwgc3RhcnRfaW5kZXggKyBkZWxpbWl0ZXIubGVuZ3RoKSxcbiAgICAgICAgICBuZXcgUG9pbnQoZW5kLCBlbmRfaW5kZXgpLFxuICAgICAgICApKVxuXG4gIGhhbmRsZUplZGlUb29sc1Jlc3BvbnNlOiAocmVzcG9uc2UpIC0+XG4gICAgaWYgJ2Vycm9yJyBvZiByZXNwb25zZVxuICAgICAgY29uc29sZS5lcnJvciByZXNwb25zZVsnZXJyb3InXVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKHJlc3BvbnNlWydlcnJvciddKVxuICAgICAgcmV0dXJuXG5cbiAgICBpZiByZXNwb25zZVsnZGVmaW5pdGlvbnMnXS5sZW5ndGggPiAwXG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICAgICAgaWYgcmVzcG9uc2VbJ3R5cGUnXSA9PSAndXNhZ2VzJ1xuICAgICAgICBwYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICBzZWxlY3Rpb25zID0gW11cbiAgICAgICAgZm9yIGl0ZW0gaW4gcmVzcG9uc2VbJ2RlZmluaXRpb25zJ11cbiAgICAgICAgICBpZiBpdGVtWydwYXRoJ10gPT0gcGF0aFxuICAgICAgICAgICAgc2VsZWN0aW9ucy5wdXNoIG5ldyBSYW5nZShcbiAgICAgICAgICAgICAgbmV3IFBvaW50KGl0ZW1bJ2xpbmUnXSAtIDEsIGl0ZW1bJ2NvbCddKSxcbiAgICAgICAgICAgICAgbmV3IFBvaW50KGl0ZW1bJ2xpbmUnXSAtIDEsIGl0ZW1bJ2NvbCddICsgaXRlbVsnbmFtZSddLmxlbmd0aCksICAjIFVzZSBzdHJpbmcgbGVuZ3RoXG4gICAgICAgICAgICApXG5cbiAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKHNlbGVjdGlvbnMpXG5cbiAgICAgIGVsc2UgaWYgcmVzcG9uc2VbJ3R5cGUnXSA9PSAnZ290b0RlZidcbiAgICAgICAgZmlyc3RfZGVmID0gcmVzcG9uc2VbJ2RlZmluaXRpb25zJ11bMF1cblxuICAgICAgICBsaW5lID0gZmlyc3RfZGVmWydsaW5lJ11cbiAgICAgICAgY29sdW1uID0gZmlyc3RfZGVmWydjb2wnXVxuXG4gICAgICAgIGlmIGxpbmUgIT0gbnVsbCBhbmQgY29sdW1uICE9IG51bGxcbiAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgIGluaXRpYWxMaW5lOiBsaW5lXG4gICAgICAgICAgICBpbml0aWFsQ29sdW1uOiBjb2x1bW5cbiAgICAgICAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlXG5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpcnN0X2RlZlsncGF0aCddLCBvcHRpb25zKS50aGVuIChlZGl0b3IpIC0+XG4gICAgICAgICAgICBlZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbigpXG4gICAgICBlbHNlXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgICBcInB5dGhvbi10b29scyBlcnJvci4gI3tAX2lzc3VlUmVwb3J0TGlua31cIiwge1xuICAgICAgICAgICAgZGV0YWlsOiBKU09OLnN0cmluZ2lmeShyZXNwb25zZSksXG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIGVsc2VcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwicHl0aG9uLXRvb2xzIGNvdWxkIG5vdCBmaW5kIGFueSByZXN1bHRzIVwiKVxuXG4gIGplZGlUb29sc1JlcXVlc3Q6ICh0eXBlKSAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGdyYW1tYXIgPSBlZGl0b3IuZ2V0R3JhbW1hcigpXG5cbiAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBwYXlsb2FkID1cbiAgICAgIHR5cGU6IHR5cGVcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHNvdXJjZTogZWRpdG9yLmdldFRleHQoKVxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBjb2w6IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgICAgcHJvamVjdF9wYXRoczogYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcblxuICAgICMgVGhpcyBpcyBuZWVkZWQgZm9yIHRoZSBwcm9taXNlIHRvIHdvcmsgY29ycmVjdGx5XG4gICAgaGFuZGxlSmVkaVRvb2xzUmVzcG9uc2UgPSBAaGFuZGxlSmVkaVRvb2xzUmVzcG9uc2VcbiAgICByZWFkbGluZSA9IEByZWFkbGluZVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICByZXNwb25zZSA9IHJlYWRsaW5lLnF1ZXN0aW9uIFwiI3tKU09OLnN0cmluZ2lmeShwYXlsb2FkKX1cXG5cIiwgKHJlc3BvbnNlKSAtPlxuICAgICAgICBoYW5kbGVKZWRpVG9vbHNSZXNwb25zZShKU09OLnBhcnNlKHJlc3BvbnNlKSlcbiAgICAgICAgcmVzb2x2ZSgpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQeXRob25Ub29sc1xuIl19
