(function() {
  var TextEditor, buildTextEditor;

  TextEditor = null;

  buildTextEditor = function(params) {
    if (atom.workspace.buildTextEditor != null) {
      return atom.workspace.buildTextEditor(params);
    } else {
      if (TextEditor == null) {
        TextEditor = require('atom').TextEditor;
      }
      return new TextEditor(params);
    }
  };

  describe("React grammar", function() {
    var grammar;
    grammar = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage("language-javascript");
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage("react");
      });
      afterEach(function() {
        atom.packages.deactivatePackages();
        return atom.packages.unloadPackages();
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName("source.js.jsx");
      });
    });
    it("parses the grammar", function() {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe("source.js.jsx");
    });
    describe("strings", function() {
      return it("tokenizes single-line strings", function() {
        var delim, delimsByScope, scope, tokens, _results;
        delimsByScope = {
          "string.quoted.double.js": '"',
          "string.quoted.single.js": "'"
        };
        _results = [];
        for (scope in delimsByScope) {
          delim = delimsByScope[scope];
          tokens = grammar.tokenizeLine(delim + "x" + delim).tokens;
          expect(tokens[0].value).toEqual(delim);
          expect(tokens[0].scopes).toEqual(["source.js.jsx", scope, "punctuation.definition.string.begin.js"]);
          expect(tokens[1].value).toEqual("x");
          expect(tokens[1].scopes).toEqual(["source.js.jsx", scope]);
          expect(tokens[2].value).toEqual(delim);
          _results.push(expect(tokens[2].scopes).toEqual(["source.js.jsx", scope, "punctuation.definition.string.end.js"]));
        }
        return _results;
      });
    });
    describe("keywords", function() {
      return it("tokenizes with as a keyword", function() {
        var tokens;
        tokens = grammar.tokenizeLine('with').tokens;
        return expect(tokens[0]).toEqual({
          value: 'with',
          scopes: ['source.js.jsx', 'keyword.control.js']
        });
      });
    });
    describe("regular expressions", function() {
      it("tokenizes regular expressions", function() {
        var tokens;
        tokens = grammar.tokenizeLine('/test/').tokens;
        expect(tokens[0]).toEqual({
          value: '/',
          scopes: ['source.js.jsx', 'string.regexp.js', 'punctuation.definition.string.begin.js']
        });
        expect(tokens[1]).toEqual({
          value: 'test',
          scopes: ['source.js.jsx', 'string.regexp.js']
        });
        expect(tokens[2]).toEqual({
          value: '/',
          scopes: ['source.js.jsx', 'string.regexp.js', 'punctuation.definition.string.end.js']
        });
        tokens = grammar.tokenizeLine('foo + /test/').tokens;
        expect(tokens[0]).toEqual({
          value: 'foo ',
          scopes: ['source.js.jsx']
        });
        expect(tokens[1]).toEqual({
          value: '+',
          scopes: ['source.js.jsx', 'keyword.operator.js']
        });
        expect(tokens[2]).toEqual({
          value: ' ',
          scopes: ['source.js.jsx', 'string.regexp.js']
        });
        expect(tokens[3]).toEqual({
          value: '/',
          scopes: ['source.js.jsx', 'string.regexp.js', 'punctuation.definition.string.begin.js']
        });
        expect(tokens[4]).toEqual({
          value: 'test',
          scopes: ['source.js.jsx', 'string.regexp.js']
        });
        return expect(tokens[5]).toEqual({
          value: '/',
          scopes: ['source.js.jsx', 'string.regexp.js', 'punctuation.definition.string.end.js']
        });
      });
      return it("tokenizes regular expressions inside arrays", function() {
        var tokens;
        tokens = grammar.tokenizeLine('[/test/]').tokens;
        expect(tokens[0]).toEqual({
          value: '[',
          scopes: ['source.js.jsx', 'meta.brace.square.js']
        });
        expect(tokens[1]).toEqual({
          value: '/',
          scopes: ['source.js.jsx', 'string.regexp.js', 'punctuation.definition.string.begin.js']
        });
        expect(tokens[2]).toEqual({
          value: 'test',
          scopes: ['source.js.jsx', 'string.regexp.js']
        });
        expect(tokens[3]).toEqual({
          value: '/',
          scopes: ['source.js.jsx', 'string.regexp.js', 'punctuation.definition.string.end.js']
        });
        expect(tokens[4]).toEqual({
          value: ']',
          scopes: ['source.js.jsx', 'meta.brace.square.js']
        });
        tokens = grammar.tokenizeLine('[1, /test/]').tokens;
        expect(tokens[0]).toEqual({
          value: '[',
          scopes: ['source.js.jsx', 'meta.brace.square.js']
        });
        expect(tokens[1]).toEqual({
          value: '1',
          scopes: ['source.js.jsx', 'constant.numeric.decimal.js']
        });
        expect(tokens[2]).toEqual({
          value: ',',
          scopes: ['source.js.jsx', 'meta.delimiter.object.comma.js']
        });
        expect(tokens[3]).toEqual({
          value: ' ',
          scopes: ['source.js.jsx', 'string.regexp.js']
        });
        expect(tokens[4]).toEqual({
          value: '/',
          scopes: ['source.js.jsx', 'string.regexp.js', 'punctuation.definition.string.begin.js']
        });
        expect(tokens[5]).toEqual({
          value: 'test',
          scopes: ['source.js.jsx', 'string.regexp.js']
        });
        expect(tokens[6]).toEqual({
          value: '/',
          scopes: ['source.js.jsx', 'string.regexp.js', 'punctuation.definition.string.end.js']
        });
        expect(tokens[7]).toEqual({
          value: ']',
          scopes: ['source.js.jsx', 'meta.brace.square.js']
        });
        tokens = grammar.tokenizeLine('0x1D306').tokens;
        expect(tokens[0]).toEqual({
          value: '0x1D306',
          scopes: ['source.js.jsx', 'constant.numeric.hex.js']
        });
        tokens = grammar.tokenizeLine('0X1D306').tokens;
        expect(tokens[0]).toEqual({
          value: '0X1D306',
          scopes: ['source.js.jsx', 'constant.numeric.hex.js']
        });
        tokens = grammar.tokenizeLine('0b011101110111010001100110').tokens;
        expect(tokens[0]).toEqual({
          value: '0b011101110111010001100110',
          scopes: ['source.js.jsx', 'constant.numeric.binary.js']
        });
        tokens = grammar.tokenizeLine('0B011101110111010001100110').tokens;
        expect(tokens[0]).toEqual({
          value: '0B011101110111010001100110',
          scopes: ['source.js.jsx', 'constant.numeric.binary.js']
        });
        tokens = grammar.tokenizeLine('0o1411').tokens;
        expect(tokens[0]).toEqual({
          value: '0o1411',
          scopes: ['source.js.jsx', 'constant.numeric.octal.js']
        });
        tokens = grammar.tokenizeLine('0O1411').tokens;
        return expect(tokens[0]).toEqual({
          value: '0O1411',
          scopes: ['source.js.jsx', 'constant.numeric.octal.js']
        });
      });
    });
    describe("operators", function() {
      it("tokenizes void correctly", function() {
        var tokens;
        tokens = grammar.tokenizeLine('void').tokens;
        return expect(tokens[0]).toEqual({
          value: 'void',
          scopes: ['source.js.jsx', 'keyword.operator.void.js']
        });
      });
      return it("tokenizes the / arithmetic operator when separated by newlines", function() {
        var lines;
        lines = grammar.tokenizeLines("1\n/ 2");
        expect(lines[0][0]).toEqual({
          value: '1',
          scopes: ['source.js.jsx', 'constant.numeric.decimal.js']
        });
        expect(lines[1][0]).toEqual({
          value: '/',
          scopes: ['source.js.jsx', 'keyword.operator.js']
        });
        expect(lines[1][1]).toEqual({
          value: ' ',
          scopes: ['source.js.jsx']
        });
        return expect(lines[1][2]).toEqual({
          value: '2',
          scopes: ['source.js.jsx', 'constant.numeric.decimal.js']
        });
      });
    });
    describe("ES6 string templates", function() {
      return it("tokenizes them as strings", function() {
        var tokens;
        tokens = grammar.tokenizeLine('`hey ${name}`').tokens;
        expect(tokens[0]).toEqual({
          value: '`',
          scopes: ['source.js.jsx', 'string.quoted.template.js', 'punctuation.definition.string.begin.js']
        });
        expect(tokens[1]).toEqual({
          value: 'hey ',
          scopes: ['source.js.jsx', 'string.quoted.template.js']
        });
        expect(tokens[2]).toEqual({
          value: '${',
          scopes: ['source.js.jsx', 'string.quoted.template.js', 'source.js.embedded.source', 'punctuation.section.embedded.js']
        });
        expect(tokens[3]).toEqual({
          value: 'name',
          scopes: ['source.js.jsx', 'string.quoted.template.js', 'source.js.embedded.source']
        });
        expect(tokens[4]).toEqual({
          value: '}',
          scopes: ['source.js.jsx', 'string.quoted.template.js', 'source.js.embedded.source', 'punctuation.section.embedded.js']
        });
        return expect(tokens[5]).toEqual({
          value: '`',
          scopes: ['source.js.jsx', 'string.quoted.template.js', 'punctuation.definition.string.end.js']
        });
      });
    });
    describe("default: in a switch statement", function() {
      return it("tokenizes it as a keyword", function() {
        var tokens;
        tokens = grammar.tokenizeLine('default: ').tokens;
        return expect(tokens[0]).toEqual({
          value: 'default',
          scopes: ['source.js.jsx', 'keyword.control.js']
        });
      });
    });
    it("tokenizes comments in function params", function() {
      var tokens;
      tokens = grammar.tokenizeLine('foo: function (/**Bar*/bar){').tokens;
      expect(tokens[5]).toEqual({
        value: '(',
        scopes: ['source.js.jsx', 'meta.function.json.js', 'meta.parameters.js', 'punctuation.definition.parameters.begin.bracket.round.js']
      });
      expect(tokens[6]).toEqual({
        value: '/**',
        scopes: ['source.js.jsx', 'meta.function.json.js', 'meta.parameters.js', 'comment.block.documentation.js', 'punctuation.definition.comment.js']
      });
      expect(tokens[7]).toEqual({
        value: 'Bar',
        scopes: ['source.js.jsx', 'meta.function.json.js', 'meta.parameters.js', 'comment.block.documentation.js']
      });
      expect(tokens[8]).toEqual({
        value: '*/',
        scopes: ['source.js.jsx', 'meta.function.json.js', 'meta.parameters.js', 'comment.block.documentation.js', 'punctuation.definition.comment.js']
      });
      return expect(tokens[9]).toEqual({
        value: 'bar',
        scopes: ['source.js.jsx', 'meta.function.json.js', 'meta.parameters.js', 'variable.parameter.function.js']
      });
    });
    it("tokenizes /* */ comments", function() {
      var tokens;
      tokens = grammar.tokenizeLine('/**/').tokens;
      expect(tokens[0]).toEqual({
        value: '/*',
        scopes: ['source.js.jsx', 'comment.block.js', 'punctuation.definition.comment.js']
      });
      expect(tokens[1]).toEqual({
        value: '*/',
        scopes: ['source.js.jsx', 'comment.block.js', 'punctuation.definition.comment.js']
      });
      tokens = grammar.tokenizeLine('/* foo */').tokens;
      expect(tokens[0]).toEqual({
        value: '/*',
        scopes: ['source.js.jsx', 'comment.block.js', 'punctuation.definition.comment.js']
      });
      expect(tokens[1]).toEqual({
        value: ' foo ',
        scopes: ['source.js.jsx', 'comment.block.js']
      });
      return expect(tokens[2]).toEqual({
        value: '*/',
        scopes: ['source.js.jsx', 'comment.block.js', 'punctuation.definition.comment.js']
      });
    });
    it("tokenizes /** */ comments", function() {
      var tokens;
      tokens = grammar.tokenizeLine('/***/').tokens;
      expect(tokens[0]).toEqual({
        value: '/**',
        scopes: ['source.js.jsx', 'comment.block.documentation.js', 'punctuation.definition.comment.js']
      });
      expect(tokens[1]).toEqual({
        value: '*/',
        scopes: ['source.js.jsx', 'comment.block.documentation.js', 'punctuation.definition.comment.js']
      });
      tokens = grammar.tokenizeLine('/** foo */').tokens;
      expect(tokens[0]).toEqual({
        value: '/**',
        scopes: ['source.js.jsx', 'comment.block.documentation.js', 'punctuation.definition.comment.js']
      });
      expect(tokens[1]).toEqual({
        value: ' foo ',
        scopes: ['source.js.jsx', 'comment.block.documentation.js']
      });
      return expect(tokens[2]).toEqual({
        value: '*/',
        scopes: ['source.js.jsx', 'comment.block.documentation.js', 'punctuation.definition.comment.js']
      });
    });
    it("tokenizes jsx tags", function() {
      var tokens;
      tokens = grammar.tokenizeLine('<tag></tag>').tokens;
      expect(tokens[0]).toEqual({
        value: '<',
        scopes: ["source.js.jsx", "tag.open.js", "punctuation.definition.tag.begin.js"]
      });
      expect(tokens[1]).toEqual({
        value: 'tag',
        scopes: ["source.js.jsx", "tag.open.js", "entity.name.tag.js"]
      });
      expect(tokens[2]).toEqual({
        value: '>',
        scopes: ["source.js.jsx", "tag.open.js", "punctuation.definition.tag.end.js"]
      });
      expect(tokens[3]).toEqual({
        value: '</',
        scopes: ["source.js.jsx", "tag.closed.js", "punctuation.definition.tag.begin.js"]
      });
      expect(tokens[4]).toEqual({
        value: 'tag',
        scopes: ["source.js.jsx", "tag.closed.js", "entity.name.tag.js"]
      });
      return expect(tokens[5]).toEqual({
        value: '>',
        scopes: ["source.js.jsx", "tag.closed.js", "punctuation.definition.tag.end.js"]
      });
    });
    it("tokenizes jsx inside parenthesis", function() {
      var tokens;
      tokens = grammar.tokenizeLine('return (<tag></tag>)').tokens;
      expect(tokens[3]).toEqual({
        value: '<',
        scopes: ["source.js.jsx", "tag.open.js", "punctuation.definition.tag.begin.js"]
      });
      expect(tokens[4]).toEqual({
        value: 'tag',
        scopes: ["source.js.jsx", "tag.open.js", "entity.name.tag.js"]
      });
      expect(tokens[5]).toEqual({
        value: '>',
        scopes: ["source.js.jsx", "tag.open.js", "punctuation.definition.tag.end.js"]
      });
      expect(tokens[6]).toEqual({
        value: '</',
        scopes: ["source.js.jsx", "tag.closed.js", "punctuation.definition.tag.begin.js"]
      });
      expect(tokens[7]).toEqual({
        value: 'tag',
        scopes: ["source.js.jsx", "tag.closed.js", "entity.name.tag.js"]
      });
      return expect(tokens[8]).toEqual({
        value: '>',
        scopes: ["source.js.jsx", "tag.closed.js", "punctuation.definition.tag.end.js"]
      });
    });
    it("tokenizes jsx inside function body", function() {
      var tokens;
      tokens = grammar.tokenizeLine('function () { return (<tag></tag>) }').tokens;
      expect(tokens[10]).toEqual({
        value: '<',
        scopes: ["source.js.jsx", "tag.open.js", "punctuation.definition.tag.begin.js"]
      });
      expect(tokens[11]).toEqual({
        value: 'tag',
        scopes: ["source.js.jsx", "tag.open.js", "entity.name.tag.js"]
      });
      expect(tokens[12]).toEqual({
        value: '>',
        scopes: ["source.js.jsx", "tag.open.js", "punctuation.definition.tag.end.js"]
      });
      expect(tokens[13]).toEqual({
        value: '</',
        scopes: ["source.js.jsx", "tag.closed.js", "punctuation.definition.tag.begin.js"]
      });
      expect(tokens[14]).toEqual({
        value: 'tag',
        scopes: ["source.js.jsx", "tag.closed.js", "entity.name.tag.js"]
      });
      return expect(tokens[15]).toEqual({
        value: '>',
        scopes: ["source.js.jsx", "tag.closed.js", "punctuation.definition.tag.end.js"]
      });
    });
    it("tokenizes jsx inside function body in an object", function() {
      var tokens;
      tokens = grammar.tokenizeLine('{foo:function () { return (<tag></tag>) }}').tokens;
      expect(tokens[13]).toEqual({
        value: '<',
        scopes: ["source.js.jsx", "tag.open.js", "punctuation.definition.tag.begin.js"]
      });
      expect(tokens[14]).toEqual({
        value: 'tag',
        scopes: ["source.js.jsx", "tag.open.js", "entity.name.tag.js"]
      });
      expect(tokens[15]).toEqual({
        value: '>',
        scopes: ["source.js.jsx", "tag.open.js", "punctuation.definition.tag.end.js"]
      });
      expect(tokens[16]).toEqual({
        value: '</',
        scopes: ["source.js.jsx", "tag.closed.js", "punctuation.definition.tag.begin.js"]
      });
      expect(tokens[17]).toEqual({
        value: 'tag',
        scopes: ["source.js.jsx", "tag.closed.js", "entity.name.tag.js"]
      });
      return expect(tokens[18]).toEqual({
        value: '>',
        scopes: ["source.js.jsx", "tag.closed.js", "punctuation.definition.tag.end.js"]
      });
    });
    it("tokenizes jsx inside function call", function() {
      var tokens;
      tokens = grammar.tokenizeLine('foo(<tag></tag>)').tokens;
      expect(tokens[2]).toEqual({
        value: '<',
        scopes: ["source.js.jsx", "meta.function-call.js", "tag.open.js", "punctuation.definition.tag.begin.js"]
      });
      expect(tokens[3]).toEqual({
        value: 'tag',
        scopes: ["source.js.jsx", "meta.function-call.js", "tag.open.js", "entity.name.tag.js"]
      });
      expect(tokens[4]).toEqual({
        value: '>',
        scopes: ["source.js.jsx", "meta.function-call.js", "tag.open.js", "punctuation.definition.tag.end.js"]
      });
      expect(tokens[5]).toEqual({
        value: '</',
        scopes: ["source.js.jsx", "meta.function-call.js", "tag.closed.js", "punctuation.definition.tag.begin.js"]
      });
      expect(tokens[6]).toEqual({
        value: 'tag',
        scopes: ["source.js.jsx", "meta.function-call.js", "tag.closed.js", "entity.name.tag.js"]
      });
      return expect(tokens[7]).toEqual({
        value: '>',
        scopes: ["source.js.jsx", "meta.function-call.js", "tag.closed.js", "punctuation.definition.tag.end.js"]
      });
    });
    it("tokenizes jsx inside method call", function() {
      var tokens;
      tokens = grammar.tokenizeLine('bar.foo(<tag></tag>)').tokens;
      expect(tokens[4]).toEqual({
        value: '<',
        scopes: ["source.js.jsx", "meta.method-call.js", "tag.open.js", "punctuation.definition.tag.begin.js"]
      });
      expect(tokens[5]).toEqual({
        value: 'tag',
        scopes: ["source.js.jsx", "meta.method-call.js", "tag.open.js", "entity.name.tag.js"]
      });
      expect(tokens[6]).toEqual({
        value: '>',
        scopes: ["source.js.jsx", "meta.method-call.js", "tag.open.js", "punctuation.definition.tag.end.js"]
      });
      expect(tokens[7]).toEqual({
        value: '</',
        scopes: ["source.js.jsx", "meta.method-call.js", "tag.closed.js", "punctuation.definition.tag.begin.js"]
      });
      expect(tokens[8]).toEqual({
        value: 'tag',
        scopes: ["source.js.jsx", "meta.method-call.js", "tag.closed.js", "entity.name.tag.js"]
      });
      return expect(tokens[9]).toEqual({
        value: '>',
        scopes: ["source.js.jsx", "meta.method-call.js", "tag.closed.js", "punctuation.definition.tag.end.js"]
      });
    });
    it("tokenizes ' as string inside jsx", function() {
      var tokens;
      tokens = grammar.tokenizeLine('<tag>fo\'o</tag>').tokens;
      expect(tokens[0]).toEqual({
        value: '<',
        scopes: ["source.js.jsx", "tag.open.js", "punctuation.definition.tag.begin.js"]
      });
      expect(tokens[1]).toEqual({
        value: 'tag',
        scopes: ["source.js.jsx", "tag.open.js", "entity.name.tag.js"]
      });
      expect(tokens[2]).toEqual({
        value: '>',
        scopes: ["source.js.jsx", "tag.open.js", "punctuation.definition.tag.end.js"]
      });
      expect(tokens[3]).toEqual({
        value: 'fo\'o',
        scopes: ["source.js.jsx", "meta.other.pcdata.js"]
      });
      expect(tokens[4]).toEqual({
        value: '</',
        scopes: ["source.js.jsx", "tag.closed.js", "punctuation.definition.tag.begin.js"]
      });
      expect(tokens[5]).toEqual({
        value: 'tag',
        scopes: ["source.js.jsx", "tag.closed.js", "entity.name.tag.js"]
      });
      return expect(tokens[6]).toEqual({
        value: '>',
        scopes: ["source.js.jsx", "tag.closed.js", "punctuation.definition.tag.end.js"]
      });
    });
    return describe("indentation", function() {
      var editor, expectPreservedIndentation;
      editor = null;
      beforeEach(function() {
        editor = buildTextEditor();
        return editor.setGrammar(grammar);
      });
      expectPreservedIndentation = function(text) {
        editor.setText(text);
        editor.autoIndentBufferRows(0, text.split("\n").length - 1);
        return expect(editor.getText()).toBe(text);
      };
      it("indents allman-style curly braces", function() {
        return expectPreservedIndentation("if (true)\n{\n  for (;;)\n  {\n    while (true)\n    {\n      x();\n    }\n  }\n}\n\nelse\n{\n  do\n  {\n    y();\n  } while (true);\n}");
      });
      return it("indents non-allman-style curly braces", function() {
        return expectPreservedIndentation("if (true) {\n  for (;;) {\n    while (true) {\n      x();\n    }\n  }\n} else {\n  do {\n    y();\n  } while (true);\n}");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcmVhY3Qvc3BlYy9yZWFjdC1ncmFtbWFyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJCQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLElBQWIsQ0FBQTs7QUFBQSxFQUNBLGVBQUEsR0FBa0IsU0FBQyxNQUFELEdBQUE7QUFDaEIsSUFBQSxJQUFHLHNDQUFIO2FBQ0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFmLENBQStCLE1BQS9CLEVBREY7S0FBQSxNQUFBOztRQUdFLGFBQWMsT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDO09BQTlCO2FBQ0ksSUFBQSxVQUFBLENBQVcsTUFBWCxFQUpOO0tBRGdCO0VBQUEsQ0FEbEIsQ0FBQTs7QUFBQSxFQVFBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixRQUFBLE9BQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxJQUFWLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHFCQUE5QixFQURjO01BQUEsQ0FBaEIsQ0FBQSxDQUFBO0FBQUEsTUFHQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixPQUE5QixFQURjO01BQUEsQ0FBaEIsQ0FIQSxDQUFBO0FBQUEsTUFNQSxTQUFBLENBQVUsU0FBQSxHQUFBO0FBQ1IsUUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFkLENBQUEsQ0FBQSxDQUFBO2VBQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFkLENBQUEsRUFGUTtNQUFBLENBQVYsQ0FOQSxD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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/react/spec/react-grammar-spec.coffee
