(function() {
  describe('Coffee-React grammar', function() {
    var grammar;
    grammar = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-coffee-script');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('react');
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName('source.coffee.jsx');
      });
    });
    it('parses the grammar', function() {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe('source.coffee.jsx');
    });
    it('tokenizes CoffeeScript', function() {
      var tokens;
      tokens = grammar.tokenizeLine('foo = @bar').tokens;
      expect(tokens.length).toEqual(5);
      expect(tokens[0]).toEqual({
        value: 'foo',
        scopes: ['source.coffee.jsx', 'variable.assignment.coffee']
      });
      expect(tokens[1]).toEqual({
        value: ' ',
        scopes: ['source.coffee.jsx']
      });
      expect(tokens[2]).toEqual({
        value: '=',
        scopes: ['source.coffee.jsx', 'keyword.operator.coffee']
      });
      expect(tokens[3]).toEqual({
        value: ' ',
        scopes: ['source.coffee.jsx']
      });
      return expect(tokens[4]).toEqual({
        value: '@bar',
        scopes: ['source.coffee.jsx', 'variable.other.readwrite.instance.coffee']
      });
    });
    return describe('CJSX', function() {
      it('tokenizes CJSX', function() {
        var tokens;
        tokens = grammar.tokenizeLine('<div>hi</div>').tokens;
        expect(tokens.length).toEqual(7);
        expect(tokens[0]).toEqual({
          value: '<',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'punctuation.definition.tag.begin.html']
        });
        expect(tokens[1]).toEqual({
          value: 'div',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'entity.name.tag.other.html']
        });
        expect(tokens[2]).toEqual({
          value: '>',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'punctuation.definition.tag.end.html']
        });
        expect(tokens[3]).toEqual({
          value: 'hi',
          scopes: ['source.coffee.jsx']
        });
        expect(tokens[4]).toEqual({
          value: '<',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'punctuation.definition.tag.begin.html']
        });
        expect(tokens[5]).toEqual({
          value: '/div',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'entity.name.tag.other.html']
        });
        return expect(tokens[6]).toEqual({
          value: '>',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'punctuation.definition.tag.end.html']
        });
      });
      it('tokenizes props', function() {
        var tokens;
        tokens = grammar.tokenizeLine('<div className="span6"></div>').tokens;
        expect(tokens.length).toEqual(12);
        expect(tokens[2]).toEqual({
          value: ' ',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html']
        });
        expect(tokens[3]).toEqual({
          value: 'className',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'entity.other.attribute-name.html']
        });
        expect(tokens[4]).toEqual({
          value: '=',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html']
        });
        expect(tokens[5]).toEqual({
          value: '"',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'string.quoted.double.html', 'punctuation.definition.string.begin.html']
        });
        expect(tokens[6]).toEqual({
          value: 'span6',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'string.quoted.double.html']
        });
        return expect(tokens[7]).toEqual({
          value: '"',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'string.quoted.double.html', 'punctuation.definition.string.end.html']
        });
      });
      it('tokenizes props with digits', function() {
        var tokens;
        tokens = grammar.tokenizeLine('<div thing1="hi"></div>').tokens;
        return expect(tokens[3]).toEqual({
          value: 'thing1',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'entity.other.attribute-name.html']
        });
      });
      it('tokenizes interpolated CoffeeScript strings', function() {
        var tokens;
        tokens = grammar.tokenizeLine('<div className="#{@var}"></div>').tokens;
        expect(tokens.length).toEqual(14);
        expect(tokens[6]).toEqual({
          value: '#{',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'string.quoted.double.html', 'source.coffee.embedded.source', 'punctuation.section.embedded.coffee']
        });
        expect(tokens[7]).toEqual({
          value: '@var',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'string.quoted.double.html', 'source.coffee.embedded.source', 'variable.other.readwrite.instance.coffee']
        });
        return expect(tokens[8]).toEqual({
          value: '}',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'string.quoted.double.html', 'source.coffee.embedded.source', 'punctuation.section.embedded.coffee']
        });
      });
      it('tokenizes embedded CoffeeScript', function() {
        var tokens;
        tokens = grammar.tokenizeLine('<div>{@var}</div>').tokens;
        expect(tokens.length).toEqual(9);
        expect(tokens[3]).toEqual({
          value: '{',
          scopes: ['source.coffee.jsx', 'meta.brace.curly.coffee']
        });
        expect(tokens[4]).toEqual({
          value: '@var',
          scopes: ['source.coffee.jsx', 'variable.other.readwrite.instance.coffee']
        });
        return expect(tokens[5]).toEqual({
          value: '}',
          scopes: ['source.coffee.jsx', 'meta.brace.curly.coffee']
        });
      });
      return it("doesn't tokenize inner CJSX as CoffeeScript", function() {
        var tokens;
        tokens = grammar.tokenizeLine("<div>it's and</div>").tokens;
        expect(tokens.length).toEqual(7);
        return expect(tokens[3]).toEqual({
          value: "it's and",
          scopes: ['source.coffee.jsx']
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcmVhY3Qvc3BlYy9jb2ZmZWUtcmVhY3QtZ3JhbW1hci1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQVYsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsd0JBQTlCLEVBRGM7TUFBQSxDQUFoQixDQUFBLENBQUE7QUFBQSxNQUVBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLE9BQTlCLEVBRGM7TUFBQSxDQUFoQixDQUZBLENBQUE7YUFLQSxJQUFBLENBQUssU0FBQSxHQUFBO2VBQ0gsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0MsbUJBQWxDLEVBRFA7TUFBQSxDQUFMLEVBTlM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBV0EsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUEsR0FBQTtBQUN2QixNQUFBLE1BQUEsQ0FBTyxPQUFQLENBQWUsQ0FBQyxVQUFoQixDQUFBLENBQUEsQ0FBQTthQUNBLE1BQUEsQ0FBTyxPQUFPLENBQUMsU0FBZixDQUF5QixDQUFDLElBQTFCLENBQStCLG1CQUEvQixFQUZ1QjtJQUFBLENBQXpCLENBWEEsQ0FBQTtBQUFBLElBZUEsRUFBQSxDQUFHLHdCQUFILEVBQTZCLFNBQUEsR0FBQTtBQUMzQixVQUFBLE1BQUE7QUFBQSxNQUFDLFNBQVUsT0FBTyxDQUFD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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/react/spec/coffee-react-grammar-spec.coffee
