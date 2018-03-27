(function() {
  var BufferedProcess, CompositeDisposable, XRegExp, path, ref, writeGoodRe,
    slice = [].slice;

  path = require('path');

  XRegExp = require('xregexp').XRegExp;

  ref = require('atom'), BufferedProcess = ref.BufferedProcess, CompositeDisposable = ref.CompositeDisposable;

  writeGoodRe = '[^^]*(?<offset>\\^+)[^^]*\n(?<message>.+?) on line (?<line>\\d+) at column (?<col>\\d+)\n?';

  module.exports = {
    config: {
      writeGoodPath: {
        type: 'string',
        title: 'Path to the write-good executable. Defaults to a built-in write-good.',
        "default": path.join(__dirname, '..', 'node_modules', 'write-good', 'bin', 'write-good.js')
      },
      additionalArgs: {
        type: 'string',
        title: 'Additional arguments to pass to write-good.',
        "default": ''
      },
      nodePath: {
        type: 'string',
        title: 'Path to the node interpreter to use. Defaults to Atom\'s.',
        "default": path.join(atom.packages.getApmPath(), '..', 'node')
      },
      severityLevel: {
        type: 'string',
        title: 'Severity level',
        "default": 'Error',
        "enum": ['Error', 'Warning', 'Info']
      }
    },
    activate: function() {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('linter-write-good.writeGoodPath', (function(_this) {
        return function(writeGoodPath) {
          return _this.writeGoodPath = writeGoodPath;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-write-good.nodePath', (function(_this) {
        return function(nodePath) {
          return _this.nodePath = nodePath;
        };
      })(this)));
      return this.subscriptions.add(atom.config.observe('linter-write-good.additionalArgs', (function(_this) {
        return function(additionalArgs) {
          return _this.additionalArgs = additionalArgs ? additionalArgs.split(' ') : [];
        };
      })(this)));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    provideLinter: function() {
      var provider;
      return provider = {
        name: 'write-good',
        grammarScopes: ["source.gfm", "gfm.restructuredtext", "source.asciidoc", "text.md", "text.git-commit", "text.plain", "text.plain.null-grammar", "text.restructuredtext", "text.bibtex", "text.tex.latex", "text.tex.latex.beamer", "text.log.latex", "text.tex.latex.memoir", "text.tex"],
        scope: 'file',
        lintOnFly: true,
        lint: (function(_this) {
          return function(textEditor) {
            return new Promise(function(resolve, reject) {
              var filePath, output, process;
              filePath = textEditor.getPath();
              output = "";
              process = new BufferedProcess({
                command: _this.nodePath,
                args: [_this.writeGoodPath, filePath].concat(slice.call(_this.additionalArgs)),
                stdout: function(data) {
                  return output += data;
                },
                exit: function(code) {
                  var messages, regex;
                  messages = [];
                  regex = XRegExp(writeGoodRe, this.regexFlags);
                  XRegExp.forEach(output, regex, function(match, i) {
                    match.colStart = parseInt(match.col);
                    match.lineStart = parseInt(match.line) - 1;
                    match.colEnd = match.colStart + match.offset.length;
                    return messages.push({
                      type: atom.config.get('linter-write-good.severityLevel'),
                      text: match.message,
                      filePath: filePath,
                      range: [[match.lineStart, match.colStart], [match.lineStart, match.colEnd]]
                    });
                  });
                  return resolve(messages);
                }
              });
              return process.onWillThrowError(function(arg) {
                var error, handle;
                error = arg.error, handle = arg.handle;
                atom.notifications.addError("Failed to run " + this.nodePath + " " + this.writeGoodPath, {
                  detail: "" + error.message,
                  dismissable: true
                });
                handle();
                return resolve([]);
              });
            });
          };
        })(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyLXdyaXRlLWdvb2QvbGliL2luaXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxRUFBQTtJQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDTixVQUFXLE9BQUEsQ0FBUSxTQUFSOztFQUNaLE1BQXlDLE9BQUEsQ0FBUSxNQUFSLENBQXpDLEVBQUMscUNBQUQsRUFBa0I7O0VBRWxCLFdBQUEsR0FBYzs7RUFFZCxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsYUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxLQUFBLEVBQU8sdUVBRFA7UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixJQUFyQixFQUEyQixjQUEzQixFQUEyQyxZQUEzQyxFQUF5RCxLQUF6RCxFQUFnRSxlQUFoRSxDQUZUO09BREY7TUFJQSxjQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLEtBQUEsRUFBTyw2Q0FEUDtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFGVDtPQUxGO01BUUEsUUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxLQUFBLEVBQU8sMkRBRFA7UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFkLENBQUEsQ0FBVixFQUFzQyxJQUF0QyxFQUE0QyxNQUE1QyxDQUZUO09BVEY7TUFZQSxhQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLEtBQUEsRUFBTyxnQkFEUDtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FGVDtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxPQUFELEVB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QUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEIsQ0FBTjtzQkFDQSxJQUFBLEVBQU0sS0FBSyxDQUFDLE9BRFo7c0JBRUEsUUFBQSxFQUFVLFFBRlY7c0JBR0EsS0FBQSxFQUFPLENBQ0wsQ0FBQyxLQUFLLENBQUMsU0FBUCxFQUFrQixLQUFLLENBQUMsUUFBeEIsQ0FESyxFQUVMLENBQUMsS0FBSyxDQUFDLFNBQVAsRUFBa0IsS0FBSyxDQUFDLE1BQXhCLENBRkssQ0FIUDtxQkFERjtrQkFKNkIsQ0FBL0I7eUJBYUEsT0FBQSxDQUFRLFFBQVI7Z0JBakJJLENBUE47ZUFEWTtxQkEyQmQsT0FBTyxDQUFDLGdCQUFSLENBQXlCLFNBQUMsR0FBRDtBQUN2QixvQkFBQTtnQkFEeUIsbUJBQU07Z0JBQy9CLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsZ0JBQUEsR0FBaUIsSUFBQyxDQUFBLFFBQWxCLEdBQTJCLEdBQTNCLEdBQThCLElBQUMsQ0FBQSxhQUEzRCxFQUNFO2tCQUFBLE1BQUEsRUFBUSxFQUFBLEdBQUcsS0FBSyxDQUFDLE9BQWpCO2tCQUNBLFdBQUEsRUFBYSxJQURiO2lCQURGO2dCQUdBLE1BQUEsQ0FBQTt1QkFDQSxPQUFBLENBQVEsRUFBUjtjQUx1QixDQUF6QjtZQWhDaUIsQ0FBUjtVQURQO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQXZCTjs7SUFGVyxDQXhDZjs7QUFQRiIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xue1hSZWdFeHB9ID0gcmVxdWlyZSAneHJlZ2V4cCdcbntCdWZmZXJlZFByb2Nlc3MsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxud3JpdGVHb29kUmUgPSAnW15eXSooPzxvZmZzZXQ+XFxcXF4rKVteXl0qXFxuKD88bWVzc2FnZT4uKz8pIG9uIGxpbmUgKD88bGluZT5cXFxcZCspIGF0IGNvbHVtbiAoPzxjb2w+XFxcXGQrKVxcbj8nXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuICAgIHdyaXRlR29vZFBhdGg6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgdGl0bGU6ICdQYXRoIHRvIHRoZSB3cml0ZS1nb29kIGV4ZWN1dGFibGUuIERlZmF1bHRzIHRvIGEgYnVpbHQtaW4gd3JpdGUtZ29vZC4nXG4gICAgICBkZWZhdWx0OiBwYXRoLmpvaW4gX19kaXJuYW1lLCAnLi4nLCAnbm9kZV9tb2R1bGVzJywgJ3dyaXRlLWdvb2QnLCAnYmluJywgJ3dyaXRlLWdvb2QuanMnXG4gICAgYWRkaXRpb25hbEFyZ3M6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgdGl0bGU6ICdBZGRpdGlvbmFsIGFyZ3VtZW50cyB0byBwYXNzIHRvIHdyaXRlLWdvb2QuJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICBub2RlUGF0aDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB0aXRsZTogJ1BhdGggdG8gdGhlIG5vZGUgaW50ZXJwcmV0ZXIgdG8gdXNlLiBEZWZhdWx0cyB0byBBdG9tXFwncy4nXG4gICAgICBkZWZhdWx0OiBwYXRoLmpvaW4gYXRvbS5wYWNrYWdlcy5nZXRBcG1QYXRoKCksICcuLicsICdub2RlJ1xuICAgIHNldmVyaXR5TGV2ZWw6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgdGl0bGU6ICdTZXZlcml0eSBsZXZlbCdcbiAgICAgIGRlZmF1bHQ6ICdFcnJvcidcbiAgICAgIGVudW06IFsnRXJyb3InLCAnV2FybmluZycsICdJbmZvJ11cblxuICBhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbGludGVyLXdyaXRlLWdvb2Qud3JpdGVHb29kUGF0aCcsXG4gICAgICAod3JpdGVHb29kUGF0aCkgPT5cbiAgICAgICAgQHdyaXRlR29vZFBhdGggPSB3cml0ZUdvb2RQYXRoXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbGludGVyLXdyaXRlLWdvb2Qubm9kZVBhdGgnLFxuICAgICAgKG5vZGVQYXRoKSA9PlxuICAgICAgICBAbm9kZVBhdGggPSBub2RlUGF0aFxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2xpbnRlci13cml0ZS1nb29kLmFkZGl0aW9uYWxBcmdzJyxcbiAgICAgIChhZGRpdGlvbmFsQXJncykgPT5cbiAgICAgICAgQGFkZGl0aW9uYWxBcmdzID0gaWYgYWRkaXRpb25hbEFyZ3NcbiAgICAgICAgICBhZGRpdGlvbmFsQXJncy5zcGxpdCAnICdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFtdXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICBwcm92aWRlTGludGVyOiAtPlxuICAgIHByb3ZpZGVyID1cbiAgICAgIG5hbWU6ICd3cml0ZS1nb29kJyxcblxuICAgICAgZ3JhbW1hclNjb3BlczogW1xuICAgICAgICBcInNvdXJjZS5nZm1cIlxuICAgICAgICBcImdmbS5yZXN0cnVjdHVyZWR0ZXh0XCJcbiAgICAgICAgXCJzb3VyY2UuYXNjaWlkb2NcIlxuICAgICAgICBcInRleHQubWRcIlxuICAgICAgICBcInRleHQuZ2l0LWNvbW1pdFwiXG4gICAgICAgIFwidGV4dC5wbGFpblwiXG4gICAgICAgIFwidGV4dC5wbGFpbi5udWxsLWdyYW1tYXJcIlxuICAgICAgICBcInRleHQucmVzdHJ1Y3R1cmVkdGV4dFwiXG4gICAgICAgIFwidGV4dC5iaWJ0ZXhcIlxuICAgICAgICBcInRleHQudGV4LmxhdGV4XCJcbiAgICAgICAgXCJ0ZXh0LnRleC5sYXRleC5iZWFtZXJcIlxuICAgICAgICBcInRleHQubG9nLmxhdGV4XCJcbiAgICAgICAgXCJ0ZXh0LnRleC5sYXRleC5tZW1vaXJcIlxuICAgICAgICBcInRleHQudGV4XCJcbiAgICAgIF1cblxuICAgICAgc2NvcGU6ICdmaWxlJyAjIG9yICdwcm9qZWN0J1xuXG4gICAgICBsaW50T25GbHk6IHRydWUgIyBtdXN0IGJlIGZhbHNlIGZvciBzY29wZTogJ3Byb2plY3QnXG5cbiAgICAgIGxpbnQ6ICh0ZXh0RWRpdG9yKSA9PlxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICAgICBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpXG5cbiAgICAgICAgICBvdXRwdXQgPSBcIlwiXG5cbiAgICAgICAgICBwcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2Vzc1xuICAgICAgICAgICAgY29tbWFuZDogQG5vZGVQYXRoXG5cbiAgICAgICAgICAgIGFyZ3M6IFtAd3JpdGVHb29kUGF0aCwgZmlsZVBhdGgsIEBhZGRpdGlvbmFsQXJncy4uLl1cblxuICAgICAgICAgICAgc3Rkb3V0OiAoZGF0YSkgLT5cbiAgICAgICAgICAgICAgb3V0cHV0ICs9IGRhdGFcblxuICAgICAgICAgICAgZXhpdDogKGNvZGUpIC0+XG4gICAgICAgICAgICAgIG1lc3NhZ2VzID0gW11cbiAgICAgICAgICAgICAgcmVnZXggPSBYUmVnRXhwIHdyaXRlR29vZFJlLCBAcmVnZXhGbGFnc1xuXG4gICAgICAgICAgICAgIFhSZWdFeHAuZm9yRWFjaCBvdXRwdXQsIHJlZ2V4LCAobWF0Y2gsIGkpIC0+XG4gICAgICAgICAgICAgICAgbWF0Y2guY29sU3RhcnQgPSBwYXJzZUludChtYXRjaC5jb2wpXG4gICAgICAgICAgICAgICAgbWF0Y2gubGluZVN0YXJ0ID0gcGFyc2VJbnQobWF0Y2gubGluZSkgLSAxXG4gICAgICAgICAgICAgICAgbWF0Y2guY29sRW5kID0gbWF0Y2guY29sU3RhcnQgKyBtYXRjaC5vZmZzZXQubGVuZ3RoXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaFxuICAgICAgICAgICAgICAgICAgdHlwZTogYXRvbS5jb25maWcuZ2V0ICdsaW50ZXItd3JpdGUtZ29vZC5zZXZlcml0eUxldmVsJ1xuICAgICAgICAgICAgICAgICAgdGV4dDogbWF0Y2gubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICByYW5nZTogW1xuICAgICAgICAgICAgICAgICAgICBbbWF0Y2gubGluZVN0YXJ0LCBtYXRjaC5jb2xTdGFydF1cbiAgICAgICAgICAgICAgICAgICAgW21hdGNoLmxpbmVTdGFydCwgbWF0Y2guY29sRW5kXVxuICAgICAgICAgICAgICAgICAgXVxuXG4gICAgICAgICAgICAgIHJlc29sdmUgbWVzc2FnZXNcblxuICAgICAgICAgIHByb2Nlc3Mub25XaWxsVGhyb3dFcnJvciAoe2Vycm9yLGhhbmRsZX0pIC0+XG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJGYWlsZWQgdG8gcnVuICN7QG5vZGVQYXRofSAje0B3cml0ZUdvb2RQYXRofVwiLFxuICAgICAgICAgICAgICBkZXRhaWw6IFwiI3tlcnJvci5tZXNzYWdlfVwiXG4gICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICBoYW5kbGUoKVxuICAgICAgICAgICAgcmVzb2x2ZSBbXVxuIl19
