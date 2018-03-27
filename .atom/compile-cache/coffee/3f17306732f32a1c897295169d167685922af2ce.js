(function() {
  var ColorContext, ColorScanner, registry;

  ColorScanner = require('../lib/color-scanner');

  ColorContext = require('../lib/color-context');

  registry = require('../lib/color-expressions');

  describe('ColorScanner', function() {
    var editor, lastIndex, result, scanner, text, withScannerForString, withScannerForTextEditor, withTextEditor, _ref;
    _ref = [], scanner = _ref[0], editor = _ref[1], text = _ref[2], result = _ref[3], lastIndex = _ref[4];
    withScannerForString = function(string, block) {
      return describe("with '" + (string.replace(/#/g, '+')) + "'", function() {
        beforeEach(function() {
          var context;
          text = string;
          context = new ColorContext({
            registry: registry
          });
          return scanner = new ColorScanner({
            context: context
          });
        });
        afterEach(function() {
          return scanner = null;
        });
        return block();
      });
    };
    withTextEditor = function(fixture, block) {
      return describe("with " + fixture + " buffer", function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open(fixture);
          });
          return runs(function() {
            editor = atom.workspace.getActiveTextEditor();
            return text = editor.getText();
          });
        });
        afterEach(function() {
          return editor = null;
        });
        return block();
      });
    };
    withScannerForTextEditor = function(fixture, block) {
      return withTextEditor(fixture, function() {
        beforeEach(function() {
          var context;
          context = new ColorContext({
            registry: registry
          });
          return scanner = new ColorScanner({
            context: context
          });
        });
        afterEach(function() {
          return scanner = null;
        });
        return block();
      });
    };
    return describe('::search', function() {
      withScannerForTextEditor('html-entities.html', function() {
        beforeEach(function() {
          return result = scanner.search(text, 'html');
        });
        return it('returns nothing', function() {
          return expect(result).toBeUndefined();
        });
      });
      withScannerForTextEditor('css-color-with-prefix.less', function() {
        beforeEach(function() {
          return result = scanner.search(text, 'less');
        });
        return it('returns nothing', function() {
          return expect(result).toBeUndefined();
        });
      });
      withScannerForTextEditor('four-variables.styl', function() {
        beforeEach(function() {
          return result = scanner.search(text, 'styl');
        });
        it('returns the first buffer color match', function() {
          return expect(result).toBeDefined();
        });
        describe('the resulting buffer color', function() {
          it('has a text range', function() {
            return expect(result.range).toEqual([13, 17]);
          });
          it('has a color', function() {
            return expect(result.color).toBeColor('#ffffff');
          });
          it('stores the matched text', function() {
            return expect(result.match).toEqual('#fff');
          });
          it('stores the last index', function() {
            return expect(result.lastIndex).toEqual(17);
          });
          return it('stores match line', function() {
            return expect(result.line).toEqual(0);
          });
        });
        return describe('successive searches', function() {
          it('returns a buffer color for each match and then undefined', function() {
            var doSearch;
            doSearch = function() {
              return result = scanner.search(text, 'styl', result.lastIndex);
            };
            expect(doSearch()).toBeDefined();
            expect(doSearch()).toBeDefined();
            expect(doSearch()).toBeDefined();
            return expect(doSearch()).toBeUndefined();
          });
          return it('stores the line of successive matches', function() {
            var doSearch;
            doSearch = function() {
              return result = scanner.search(text, 'styl', result.lastIndex);
            };
            expect(doSearch().line).toEqual(2);
            expect(doSearch().line).toEqual(4);
            return expect(doSearch().line).toEqual(6);
          });
        });
      });
      withScannerForTextEditor('class-after-color.sass', function() {
        beforeEach(function() {
          return result = scanner.search(text, 'sass');
        });
        it('returns the first buffer color match', function() {
          return expect(result).toBeDefined();
        });
        return describe('the resulting buffer color', function() {
          it('has a text range', function() {
            return expect(result.range).toEqual([15, 20]);
          });
          return it('has a color', function() {
            return expect(result.color).toBeColor('#ffffff');
          });
        });
      });
      withScannerForTextEditor('project/styles/variables.styl', function() {
        beforeEach(function() {
          return result = scanner.search(text, 'styl');
        });
        it('returns the first buffer color match', function() {
          return expect(result).toBeDefined();
        });
        return describe('the resulting buffer color', function() {
          it('has a text range', function() {
            return expect(result.range).toEqual([18, 25]);
          });
          return it('has a color', function() {
            return expect(result.color).toBeColor('#BF616A');
          });
        });
      });
      withScannerForTextEditor('crlf.styl', function() {
        beforeEach(function() {
          return result = scanner.search(text, 'styl');
        });
        it('returns the first buffer color match', function() {
          return expect(result).toBeDefined();
        });
        describe('the resulting buffer color', function() {
          it('has a text range', function() {
            return expect(result.range).toEqual([7, 11]);
          });
          return it('has a color', function() {
            return expect(result.color).toBeColor('#ffffff');
          });
        });
        return it('finds the second color', function() {
          var doSearch;
          doSearch = function() {
            return result = scanner.search(text, 'styl', result.lastIndex);
          };
          doSearch();
          return expect(result.color).toBeDefined();
        });
      });
      withScannerForTextEditor('color-in-tag-content.html', function() {
        return it('finds both colors', function() {
          var doSearch;
          result = {
            lastIndex: 0
          };
          doSearch = function() {
            return result = scanner.search(text, 'css', result.lastIndex);
          };
          expect(doSearch()).toBeDefined();
          expect(doSearch()).toBeDefined();
          return expect(doSearch()).toBeUndefined();
        });
      });
      withScannerForString('#add-something {}, #acedbe-foo {}, #acedbeef-foo {}', function() {
        return it('does not find any matches', function() {
          var doSearch;
          result = {
            lastIndex: 0
          };
          doSearch = function() {
            return result = scanner.search(text, 'css', result.lastIndex);
          };
          return expect(doSearch()).toBeUndefined();
        });
      });
      return withScannerForString('#add_something {}, #acedbe_foo {}, #acedbeef_foo {}', function() {
        return it('does not find any matches', function() {
          var doSearch;
          result = {
            lastIndex: 0
          };
          doSearch = function() {
            return result = scanner.search(text, 'css', result.lastIndex);
          };
          return expect(doSearch()).toBeUndefined();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9jb2xvci1zY2FubmVyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9DQUFBOztBQUFBLEVBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxzQkFBUixDQUFmLENBQUE7O0FBQUEsRUFDQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsMEJBQVIsQ0FGWCxDQUFBOztBQUFBLEVBSUEsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLFFBQUEsOEdBQUE7QUFBQSxJQUFBLE9BQTZDLEVBQTdDLEVBQUMsaUJBQUQsRUFBVSxnQkFBVixFQUFrQixjQUFsQixFQUF3QixnQkFBeEIsRUFBZ0MsbUJBQWhDLENBQUE7QUFBQSxJQUVBLG9CQUFBLEdBQXVCLFNBQUMsTUFBRCxFQUFTLEtBQVQsR0FBQTthQUNyQixRQUFBLENBQVUsUUFBQSxHQUFPLENBQUMsTUFBTSxDQUFDLE9BQVAsQ0FBZSxJQUFmLEVBQXFCLEdBQXJCLENBQUQsQ0FBUCxHQUFrQyxHQUE1QyxFQUFnRCxTQUFBLEdBQUE7QUFDOUMsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsY0FBQSxPQUFBO0FBQUEsVUFBQSxJQUFBLEdBQU8sTUFBUCxDQUFBO0FBQUEsVUFDQSxPQUFBLEdBQWMsSUFBQSxZQUFBLENBQWE7QUFBQSxZQUFDLFVBQUEsUUFBRDtXQUFiLENBRGQsQ0FBQTtpQkFFQSxPQUFBLEdBQWMsSUFBQSxZQUFBLENBQWE7QUFBQSxZQUFDLFNBQUEsT0FBRDtXQUFiLEVBSEw7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBS0EsU0FBQSxDQUFVLFNBQUEs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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/spec/color-scanner-spec.coffee
