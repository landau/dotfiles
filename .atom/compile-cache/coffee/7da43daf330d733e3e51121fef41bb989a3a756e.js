(function() {
  describe('Handlebars grammar', function() {
    var grammar;
    grammar = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('atom-handlebars');
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName('text.html.handlebars');
      });
    });
    it('parses the grammar', function() {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe('text.html.handlebars');
    });
    it('parses helpers', function() {
      var tokens;
      tokens = grammar.tokenizeLine("{{my-helper }}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: 'my-helper ',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars', 'entity.name.function.handlebars']
      });
      expect(tokens[2]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      tokens = grammar.tokenizeLine("{{my-helper class='test'}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: 'my-helper ',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars', 'entity.name.function.handlebars']
      });
      expect(tokens[2]).toEqual({
        value: 'class',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.other.attribute-name.handlebars', 'meta.tag.template.handlebars', 'entity.other.attribute-name.handlebars']
      });
      expect(tokens[3]).toEqual({
        value: '=',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.other.attribute-name.handlebars', 'meta.tag.template.handlebars']
      });
      expect(tokens[4]).toEqual({
        value: "'",
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'string.quoted.single.handlebars', 'punctuation.definition.string.begin.handlebars']
      });
      expect(tokens[5]).toEqual({
        value: 'test',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'string.quoted.single.handlebars']
      });
      expect(tokens[6]).toEqual({
        value: "'",
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'string.quoted.single.handlebars', 'punctuation.definition.string.end.handlebars']
      });
      expect(tokens[7]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      tokens = grammar.tokenizeLine("{{else}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: 'else',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars', 'entity.name.function.handlebars']
      });
      return expect(tokens[2]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
    });
    it('parses variables', function() {
      var tokens;
      tokens = grammar.tokenizeLine("{{name}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: 'name',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars']
      });
      expect(tokens[2]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      tokens = grammar.tokenizeLine("{{> name}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{>',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: ' name',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars']
      });
      return expect(tokens[2]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
    });
    it('parses comments', function() {
      var tokens;
      tokens = grammar.tokenizeLine("{{!-- comment --}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{!--',
        scopes: ['text.html.handlebars', 'comment.block.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: ' comment ',
        scopes: ['text.html.handlebars', 'comment.block.handlebars']
      });
      expect(tokens[2]).toEqual({
        value: '--}}',
        scopes: ['text.html.handlebars', 'comment.block.handlebars']
      });
      tokens = grammar.tokenizeLine("{{! comment }}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{!',
        scopes: ['text.html.handlebars', 'comment.block.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: ' comment ',
        scopes: ['text.html.handlebars', 'comment.block.handlebars']
      });
      return expect(tokens[2]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'comment.block.handlebars']
      });
    });
    it('parses block expression', function() {
      var tokens;
      tokens = grammar.tokenizeLine("{{#each person in people}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: '#',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars', 'punctuation.definition.block.begin.handlebars']
      });
      expect(tokens[2]).toEqual({
        value: 'each',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars', 'entity.name.function.handlebars']
      });
      expect(tokens[3]).toEqual({
        value: ' person',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars']
      });
      expect(tokens[4]).toEqual({
        value: ' in ',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.function.handlebars']
      });
      expect(tokens[5]).toEqual({
        value: 'people',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars']
      });
      expect(tokens[6]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      tokens = grammar.tokenizeLine("{{/if}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: '/',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars', 'punctuation.definition.block.end.handlebars']
      });
      expect(tokens[2]).toEqual({
        value: 'if',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars', 'entity.name.function.handlebars']
      });
      return expect(tokens[3]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
    });
    return it('parses unescaped expressions', function() {
      var tokens;
      tokens = grammar.tokenizeLine("{{{do not escape me}}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{{',
        scopes: ['text.html.handlebars', 'meta.tag.template.raw.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: 'do not escape me',
        scopes: ['text.html.handlebars', 'meta.tag.template.raw.handlebars']
      });
      return expect(tokens[2]).toEqual({
        value: '}}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.raw.handlebars', 'entity.name.tag.handlebars']
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1oYW5kbGViYXJzL3NwZWMvaGFuZGxlYmFycy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBO0FBQzdCLFFBQUE7SUFBQSxPQUFBLEdBQVU7SUFFVixVQUFBLENBQVcsU0FBQTtNQUNULGVBQUEsQ0FBZ0IsU0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixpQkFBOUI7TUFEYyxDQUFoQjthQUdBLElBQUEsQ0FBSyxTQUFBO2VBQ0gsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0Msc0JBQWxDO01BRFAsQ0FBTDtJQUpTLENBQVg7SUFPQSxFQUFBLENBQUcsb0JBQUgsRUFBeUIsU0FBQTtNQUN2QixNQUFBLENBQU8sT0FBUCxDQUFlLENBQUMsVUFBaEIsQ0FBQTthQUNBLE1BQUEsQ0FBTyxPQUFPLENBQUMsU0FBZixDQUF5QixDQUFDLElBQTFCLENBQStCLHNCQUEvQjtJQUZ1QixDQUF6QjtJQUlBLEVBQUEsQ0FBRyxnQkFBSCxFQUFxQixTQUFBO0FBQ25CLFVBQUE7TUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLGdCQUFyQjtNQUVYLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7UUFBQSxLQUFBLEVBQU8sSUFBUDtRQUFhLE1BQUEsRUFBUSxDQUFDLHNCQUFELEVBQXlCLDhCQUF6QixFQUF5RCw0QkFBekQsQ0FBckI7T0FBMUI7TUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO1FBQUEsS0FBQSxFQUFPLFlBQVA7UUFBcUIsTUFBQSxFQUFRLENBQUMsc0JBQUQsRUFBeUIsOEJBQXpCLEVBQXlELDRCQUF6RCxFQUF1RixpQ0FBdkYsQ0FBN0I7T0FBMUI7TUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO1FBQUEsS0FBQSxFQUFPLElBQVA7UUFBYSxNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5Qiw4QkFBekIsRUFBeUQsNEJBQXpELENBQXJCO09BQTFCO01BRUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQiw0QkFBckI7TUFFWCxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO1FBQUEsS0FBQSxFQUFPLElBQVA7UUFBYSxNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5Qiw4QkFBekIsRUFBeUQsNEJBQXpELENBQXJCO09BQTFCO01BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtRQUFBLEtBQUEsRUFBTyxZQUFQO1FBQXFCLE1BQUEsRUFBUSxDQUFDLHNCQUFELEVBQXlCLDhCQUF6QixFQUF5RCw0QkFBekQsRUFBdUYsaUNBQXZGLENBQTdCO09BQTFCO01BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtRQUFBLEtBQUEsRUFBTyxPQUFQO1FBQWdCLE1BQUEsRUFBUSxDQUFDLHNCQUFELEVBQXlCLDhCQUF6QixFQUF5RCx3Q0FBekQsRUFBbUcsOEJBQW5HLEVBQW1JLHdDQUFuSSxDQUF4QjtPQUExQjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7UUFBQSxLQUFBLEVBQU8sR0FBUDtRQUFZLE1BQUEsRUFBUSxDQUFDLHNCQUFELEVBQXlCLDhCQUF6QixFQUF5RCx3Q0FBekQsRUFBbUcsOEJBQW5HLENBQXBCO09BQTFCO01BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtRQUFBLEtBQUEsRUFBTyxHQUFQO1FBQVksTUFBQSxFQUFRLENBQUMsc0JBQUQsRUFBeUIsOEJBQXpCLEVBQXlELGlDQUF6RCxFQUE0RixnREFBNUYsQ0FBcEI7T0FBMUI7TUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO1FBQUEsS0FBQSxFQUFPLE1BQVA7UUFBZSxNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5Qiw4QkFBekIsRUFBeUQsaUNBQXpELENBQXZCO09BQTFCO01BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtRQUFBLEtBQUEsRUFBTyxHQUFQO1FBQVksTUFBQSxFQUFRLENBQUMsc0JBQUQsRUFBeUIsOEJBQXpCLEVBQXlELGlDQUF6RCxFQUE0Riw4Q0FBNUYsQ0FBcEI7T0FBMUI7TUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO1FBQUEsS0FBQSxFQUFPLElBQVA7UUFBYSxNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5Qiw4QkFBekIsRUFBeUQsNEJBQXpELENBQXJCO09BQTFCO01BRUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixVQUFyQjtNQUVYLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7UUFBQSxLQUFBLEVBQU8sSUFBUDtRQUFhLE1BQUEsRUFBUSxDQUFDLHNCQUFELEVBQXlCLDhCQUF6QixFQUF5RCw0QkFBekQsQ0FBckI7T0FBMUI7TUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO1FBQUEsS0FBQSxFQUFPLE1BQVA7UUFBZSxNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5Qiw4QkFBekIsRUFBeUQsNEJBQXpELEVBQXVGLGlDQUF2RixDQUF2QjtPQUExQjthQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7UUFBQSxLQUFBLEVBQU8sSUFBUDtRQUFhLE1BQUEsRUFBUSxDQUFDLHNCQUFELEVBQXlCLDhCQUF6QixFQUF5RCw0QkFBekQsQ0FBckI7T0FBMUI7SUF0Qm1CLENBQXJCO0lBd0JBLEVBQUEsQ0FBRyxrQkFBSCxFQUF1QixTQUFBO0FBQ3JCLFVBQUE7TUFBQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLFVBQXJCO01BRVgsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtRQUFBLEtBQUEsRUFBTyxJQUFQO1FBQWEsTUFBQSxFQUFRLENBQUMsc0JBQUQsRUFBeUIsOEJBQXpCLEVBQXlELDRCQUF6RCxDQUFyQjtPQUExQjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7UUFBQSxLQUFBLEVBQU8sTUFBUDtRQUFlLE1BQUEsRUFBUSxDQUFDLHNCQUFELEVBQXlCLDhCQUF6QixDQUF2QjtPQUExQjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7UUFBQSxLQUFBLEVBQU8sSUFBUDtRQUFhLE1BQUEsRUFBUSxDQUFDLHNCQUFELEVBQXlCLDhCQUF6QixFQUF5RCw0QkFBekQsQ0FBckI7T0FBMUI7TUFFQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLFlBQXJCO01BRVgsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtRQUFBLEtBQUEsRUFBTyxLQUFQO1FBQWMsTUFBQSxFQUFRLENBQUMsc0JBQUQsRUFBeUIsOEJBQXpCLEVBQXlELDRCQUF6RCxDQUF0QjtPQUExQjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7UUFBQSxLQUFBLEVBQU8sT0FBUDtRQUFnQixNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5Qiw4QkFBekIsQ0FBeEI7T0FBMUI7YUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO1FBQUEsS0FBQSxFQUFPLElBQVA7UUFBYSxNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5Qiw4QkFBekIsRUFBeUQsNEJBQXpELENBQXJCO09BQTFCO0lBWHFCLENBQXZCO0lBYUEsRUFBQSxDQUFHLGlCQUFILEVBQXNCLFNBQUE7QUFDcEIsVUFBQTtNQUFDLFNBQVUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsb0JBQXJCO01BRVgsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtRQUFBLEtBQUEsRUFBTyxPQUFQO1FBQWdCLE1BQUEsRUFBUSxDQUFDLHNCQUFELEVBQXlCLDBCQUF6QixDQUF4QjtPQUExQjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7UUFBQSxLQUFBLEVBQU8sV0FBUDtRQUFvQixNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5QiwwQkFBekIsQ0FBNUI7T0FBMUI7TUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO1FBQUEsS0FBQSxFQUFPLE1BQVA7UUFBZSxNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5QiwwQkFBekIsQ0FBdkI7T0FBMUI7TUFFQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLGdCQUFyQjtNQUVYLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7UUFBQSxLQUFBLEVBQU8sS0FBUDtRQUFjLE1BQUEsRUFBUSxDQUFDLHNCQUFELEVBQXlCLDBCQUF6QixDQUF0QjtPQUExQjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7UUFBQSxLQUFBLEVBQU8sV0FBUDtRQUFvQixNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5QiwwQkFBekIsQ0FBNUI7T0FBMUI7YUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO1FBQUEsS0FBQSxFQUFPLElBQVA7UUFBYSxNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5QiwwQkFBekIsQ0FBckI7T0FBMUI7SUFYb0IsQ0FBdEI7SUFhQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQTtBQUM1QixVQUFBO01BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQiw0QkFBckI7TUFFWCxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO1FBQUEsS0FBQSxFQUFPLElBQVA7UUFBYSxNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5Qiw4QkFBekIsRUFBeUQsNEJBQXpELENBQXJCO09BQTFCO01BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtRQUFBLEtBQUEsRUFBTyxHQUFQO1FBQVksTUFBQSxFQUFRLENBQUMsc0JBQUQsRUFBeUIsOEJBQXpCLEVBQXlELDRCQUF6RCxFQUF1RiwrQ0FBdkYsQ0FBcEI7T0FBMUI7TUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO1FBQUEsS0FBQSxFQUFPLE1BQVA7UUFBZSxNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5Qiw4QkFBekIsRUFBeUQsNEJBQXpELEVBQXVGLGlDQUF2RixDQUF2QjtPQUExQjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7UUFBQSxLQUFBLEVBQU8sU0FBUDtRQUFrQixNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5Qiw4QkFBekIsQ0FBMUI7T0FBMUI7TUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO1FBQUEsS0FBQSxFQUFPLE1BQVA7UUFBZSxNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5Qiw4QkFBekIsRUFBeUQsaUNBQXpELENBQXZCO09BQTFCO01BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtRQUFBLEtBQUEsRUFBTyxRQUFQO1FBQWlCLE1BQUEsRUFBUSxDQUFDLHNCQUFELEVBQXlCLDhCQUF6QixDQUF6QjtPQUExQjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7UUFBQSxLQUFBLEVBQU8sSUFBUDtRQUFhLE1BQUEsRUFBUSxDQUFDLHNCQUFELEVBQXlCLDhCQUF6QixFQUF5RCw0QkFBekQsQ0FBckI7T0FBMUI7TUFFQyxTQUFVLE9BQU8sQ0FBQyxZQUFSLENBQXFCLFNBQXJCO01BRVgsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtRQUFBLEtBQUEsRUFBTyxJQUFQO1FBQWEsTUFBQSxFQUFRLENBQUMsc0JBQUQsRUFBeUIsOEJBQXpCLEVBQXlELDRCQUF6RCxDQUFyQjtPQUExQjtNQUNBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7UUFBQSxLQUFBLEVBQU8sR0FBUDtRQUFZLE1BQUEsRUFBUSxDQUFDLHNCQUFELEVBQXlCLDhCQUF6QixFQUF5RCw0QkFBekQsRUFBdUYsNkNBQXZGLENBQXBCO09BQTFCO01BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtRQUFBLEtBQUEsRUFBTyxJQUFQO1FBQWEsTUFBQSxFQUFRLENBQUMsc0JBQUQsRUFBeUIsOEJBQXpCLEVBQXlELDRCQUF6RCxFQUF1RixpQ0FBdkYsQ0FBckI7T0FBMUI7YUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO1FBQUEsS0FBQSxFQUFPLElBQVA7UUFBYSxNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5Qiw4QkFBekIsRUFBeUQsNEJBQXpELENBQXJCO09BQTFCO0lBaEI0QixDQUE5QjtXQWtCQSxFQUFBLENBQUcsOEJBQUgsRUFBbUMsU0FBQTtBQUNqQyxVQUFBO01BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQix3QkFBckI7TUFFWCxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO1FBQUEsS0FBQSxFQUFPLEtBQVA7UUFBYyxNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5QixrQ0FBekIsRUFBNkQsNEJBQTdELENBQXRCO09BQTFCO01BQ0EsTUFBQSxDQUFPLE1BQU8sQ0FBQSxDQUFBLENBQWQsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQjtRQUFBLEtBQUEsRUFBTyxrQkFBUDtRQUEyQixNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5QixrQ0FBekIsQ0FBbkM7T0FBMUI7YUFDQSxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUEsQ0FBZCxDQUFpQixDQUFDLE9BQWxCLENBQTBCO1FBQUEsS0FBQSxFQUFPLEtBQVA7UUFBYyxNQUFBLEVBQVEsQ0FBQyxzQkFBRCxFQUF5QixrQ0FBekIsRUFBNkQsNEJBQTdELENBQXRCO09BQTFCO0lBTGlDLENBQW5DO0VBbEY2QixDQUEvQjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiZGVzY3JpYmUgJ0hhbmRsZWJhcnMgZ3JhbW1hcicsIC0+XG4gIGdyYW1tYXIgPSBudWxsXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F0b20taGFuZGxlYmFycycpXG5cbiAgICBydW5zIC0+XG4gICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKCd0ZXh0Lmh0bWwuaGFuZGxlYmFycycpXG5cbiAgaXQgJ3BhcnNlcyB0aGUgZ3JhbW1hcicsIC0+XG4gICAgZXhwZWN0KGdyYW1tYXIpLnRvQmVUcnV0aHkoKVxuICAgIGV4cGVjdChncmFtbWFyLnNjb3BlTmFtZSkudG9CZSAndGV4dC5odG1sLmhhbmRsZWJhcnMnXG5cbiAgaXQgJ3BhcnNlcyBoZWxwZXJzJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKFwie3tteS1oZWxwZXIgfX1cIilcblxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd7eycsIHNjb3BlczogWyd0ZXh0Lmh0bWwuaGFuZGxlYmFycycsICdtZXRhLnRhZy50ZW1wbGF0ZS5oYW5kbGViYXJzJywgJ2VudGl0eS5uYW1lLnRhZy5oYW5kbGViYXJzJ11cbiAgICBleHBlY3QodG9rZW5zWzFdKS50b0VxdWFsIHZhbHVlOiAnbXktaGVscGVyICcsIHNjb3BlczogWyd0ZXh0Lmh0bWwuaGFuZGxlYmFycycsICdtZXRhLnRhZy50ZW1wbGF0ZS5oYW5kbGViYXJzJywgJ2VudGl0eS5uYW1lLnRhZy5oYW5kbGViYXJzJywgJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLmhhbmRsZWJhcnMnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICd9fScsIHNjb3BlczogWyd0ZXh0Lmh0bWwuaGFuZGxlYmFycycsICdtZXRhLnRhZy50ZW1wbGF0ZS5oYW5kbGViYXJzJywgJ2VudGl0eS5uYW1lLnRhZy5oYW5kbGViYXJzJ11cblxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoXCJ7e215LWhlbHBlciBjbGFzcz0ndGVzdCd9fVwiKVxuXG4gICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3t7Jywgc2NvcGVzOiBbJ3RleHQuaHRtbC5oYW5kbGViYXJzJywgJ21ldGEudGFnLnRlbXBsYXRlLmhhbmRsZWJhcnMnLCAnZW50aXR5Lm5hbWUudGFnLmhhbmRsZWJhcnMnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICdteS1oZWxwZXIgJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5oYW5kbGViYXJzJywgJ21ldGEudGFnLnRlbXBsYXRlLmhhbmRsZWJhcnMnLCAnZW50aXR5Lm5hbWUudGFnLmhhbmRsZWJhcnMnLCAnZW50aXR5Lm5hbWUuZnVuY3Rpb24uaGFuZGxlYmFycyddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJ2NsYXNzJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5oYW5kbGViYXJzJywgJ21ldGEudGFnLnRlbXBsYXRlLmhhbmRsZWJhcnMnLCAnZW50aXR5Lm90aGVyLmF0dHJpYnV0ZS1uYW1lLmhhbmRsZWJhcnMnLCAnbWV0YS50YWcudGVtcGxhdGUuaGFuZGxlYmFycycsICdlbnRpdHkub3RoZXIuYXR0cmlidXRlLW5hbWUuaGFuZGxlYmFycyddXG4gICAgZXhwZWN0KHRva2Vuc1szXSkudG9FcXVhbCB2YWx1ZTogJz0nLCBzY29wZXM6IFsndGV4dC5odG1sLmhhbmRsZWJhcnMnLCAnbWV0YS50YWcudGVtcGxhdGUuaGFuZGxlYmFycycsICdlbnRpdHkub3RoZXIuYXR0cmlidXRlLW5hbWUuaGFuZGxlYmFycycsICdtZXRhLnRhZy50ZW1wbGF0ZS5oYW5kbGViYXJzJ11cbiAgICBleHBlY3QodG9rZW5zWzRdKS50b0VxdWFsIHZhbHVlOiBcIidcIiwgc2NvcGVzOiBbJ3RleHQuaHRtbC5oYW5kbGViYXJzJywgJ21ldGEudGFnLnRlbXBsYXRlLmhhbmRsZWJhcnMnLCAnc3RyaW5nLnF1b3RlZC5zaW5nbGUuaGFuZGxlYmFycycsICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5iZWdpbi5oYW5kbGViYXJzJ11cbiAgICBleHBlY3QodG9rZW5zWzVdKS50b0VxdWFsIHZhbHVlOiAndGVzdCcsIHNjb3BlczogWyd0ZXh0Lmh0bWwuaGFuZGxlYmFycycsICdtZXRhLnRhZy50ZW1wbGF0ZS5oYW5kbGViYXJzJywgJ3N0cmluZy5xdW90ZWQuc2luZ2xlLmhhbmRsZWJhcnMnXVxuICAgIGV4cGVjdCh0b2tlbnNbNl0pLnRvRXF1YWwgdmFsdWU6IFwiJ1wiLCBzY29wZXM6IFsndGV4dC5odG1sLmhhbmRsZWJhcnMnLCAnbWV0YS50YWcudGVtcGxhdGUuaGFuZGxlYmFycycsICdzdHJpbmcucXVvdGVkLnNpbmdsZS5oYW5kbGViYXJzJywgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmVuZC5oYW5kbGViYXJzJ11cbiAgICBleHBlY3QodG9rZW5zWzddKS50b0VxdWFsIHZhbHVlOiAnfX0nLCBzY29wZXM6IFsndGV4dC5odG1sLmhhbmRsZWJhcnMnLCAnbWV0YS50YWcudGVtcGxhdGUuaGFuZGxlYmFycycsICdlbnRpdHkubmFtZS50YWcuaGFuZGxlYmFycyddXG5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKFwie3tlbHNlfX1cIilcblxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd7eycsIHNjb3BlczogWyd0ZXh0Lmh0bWwuaGFuZGxlYmFycycsICdtZXRhLnRhZy50ZW1wbGF0ZS5oYW5kbGViYXJzJywgJ2VudGl0eS5uYW1lLnRhZy5oYW5kbGViYXJzJ11cbiAgICBleHBlY3QodG9rZW5zWzFdKS50b0VxdWFsIHZhbHVlOiAnZWxzZScsIHNjb3BlczogWyd0ZXh0Lmh0bWwuaGFuZGxlYmFycycsICdtZXRhLnRhZy50ZW1wbGF0ZS5oYW5kbGViYXJzJywgJ2VudGl0eS5uYW1lLnRhZy5oYW5kbGViYXJzJywgJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLmhhbmRsZWJhcnMnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICd9fScsIHNjb3BlczogWyd0ZXh0Lmh0bWwuaGFuZGxlYmFycycsICdtZXRhLnRhZy50ZW1wbGF0ZS5oYW5kbGViYXJzJywgJ2VudGl0eS5uYW1lLnRhZy5oYW5kbGViYXJzJ11cblxuICBpdCAncGFyc2VzIHZhcmlhYmxlcycsIC0+XG4gICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZShcInt7bmFtZX19XCIpXG5cbiAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAne3snLCBzY29wZXM6IFsndGV4dC5odG1sLmhhbmRsZWJhcnMnLCAnbWV0YS50YWcudGVtcGxhdGUuaGFuZGxlYmFycycsICdlbnRpdHkubmFtZS50YWcuaGFuZGxlYmFycyddXG4gICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJ25hbWUnLCBzY29wZXM6IFsndGV4dC5odG1sLmhhbmRsZWJhcnMnLCAnbWV0YS50YWcudGVtcGxhdGUuaGFuZGxlYmFycyddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJ319Jywgc2NvcGVzOiBbJ3RleHQuaHRtbC5oYW5kbGViYXJzJywgJ21ldGEudGFnLnRlbXBsYXRlLmhhbmRsZWJhcnMnLCAnZW50aXR5Lm5hbWUudGFnLmhhbmRsZWJhcnMnXVxuXG4gICAge3Rva2Vuc30gPSBncmFtbWFyLnRva2VuaXplTGluZShcInt7PiBuYW1lfX1cIilcblxuICAgIGV4cGVjdCh0b2tlbnNbMF0pLnRvRXF1YWwgdmFsdWU6ICd7ez4nLCBzY29wZXM6IFsndGV4dC5odG1sLmhhbmRsZWJhcnMnLCAnbWV0YS50YWcudGVtcGxhdGUuaGFuZGxlYmFycycsICdlbnRpdHkubmFtZS50YWcuaGFuZGxlYmFycyddXG4gICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJyBuYW1lJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5oYW5kbGViYXJzJywgJ21ldGEudGFnLnRlbXBsYXRlLmhhbmRsZWJhcnMnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICd9fScsIHNjb3BlczogWyd0ZXh0Lmh0bWwuaGFuZGxlYmFycycsICdtZXRhLnRhZy50ZW1wbGF0ZS5oYW5kbGViYXJzJywgJ2VudGl0eS5uYW1lLnRhZy5oYW5kbGViYXJzJ11cblxuICBpdCAncGFyc2VzIGNvbW1lbnRzJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKFwie3shLS0gY29tbWVudCAtLX19XCIpXG5cbiAgICBleHBlY3QodG9rZW5zWzBdKS50b0VxdWFsIHZhbHVlOiAne3shLS0nLCBzY29wZXM6IFsndGV4dC5odG1sLmhhbmRsZWJhcnMnLCAnY29tbWVudC5ibG9jay5oYW5kbGViYXJzJ11cbiAgICBleHBlY3QodG9rZW5zWzFdKS50b0VxdWFsIHZhbHVlOiAnIGNvbW1lbnQgJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5oYW5kbGViYXJzJywgJ2NvbW1lbnQuYmxvY2suaGFuZGxlYmFycyddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJy0tfX0nLCBzY29wZXM6IFsndGV4dC5odG1sLmhhbmRsZWJhcnMnLCAnY29tbWVudC5ibG9jay5oYW5kbGViYXJzJ11cblxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoXCJ7eyEgY29tbWVudCB9fVwiKVxuXG4gICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3t7IScsIHNjb3BlczogWyd0ZXh0Lmh0bWwuaGFuZGxlYmFycycsICdjb21tZW50LmJsb2NrLmhhbmRsZWJhcnMnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICcgY29tbWVudCAnLCBzY29wZXM6IFsndGV4dC5odG1sLmhhbmRsZWJhcnMnLCAnY29tbWVudC5ibG9jay5oYW5kbGViYXJzJ11cbiAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnfX0nLCBzY29wZXM6IFsndGV4dC5odG1sLmhhbmRsZWJhcnMnLCAnY29tbWVudC5ibG9jay5oYW5kbGViYXJzJ11cblxuICBpdCAncGFyc2VzIGJsb2NrIGV4cHJlc3Npb24nLCAtPlxuICAgIHt0b2tlbnN9ID0gZ3JhbW1hci50b2tlbml6ZUxpbmUoXCJ7eyNlYWNoIHBlcnNvbiBpbiBwZW9wbGV9fVwiKVxuXG4gICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3t7Jywgc2NvcGVzOiBbJ3RleHQuaHRtbC5oYW5kbGViYXJzJywgJ21ldGEudGFnLnRlbXBsYXRlLmhhbmRsZWJhcnMnLCAnZW50aXR5Lm5hbWUudGFnLmhhbmRsZWJhcnMnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICcjJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5oYW5kbGViYXJzJywgJ21ldGEudGFnLnRlbXBsYXRlLmhhbmRsZWJhcnMnLCAnZW50aXR5Lm5hbWUudGFnLmhhbmRsZWJhcnMnLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5ibG9jay5iZWdpbi5oYW5kbGViYXJzJ11cbiAgICBleHBlY3QodG9rZW5zWzJdKS50b0VxdWFsIHZhbHVlOiAnZWFjaCcsIHNjb3BlczogWyd0ZXh0Lmh0bWwuaGFuZGxlYmFycycsICdtZXRhLnRhZy50ZW1wbGF0ZS5oYW5kbGViYXJzJywgJ2VudGl0eS5uYW1lLnRhZy5oYW5kbGViYXJzJywgJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLmhhbmRsZWJhcnMnXVxuICAgIGV4cGVjdCh0b2tlbnNbM10pLnRvRXF1YWwgdmFsdWU6ICcgcGVyc29uJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5oYW5kbGViYXJzJywgJ21ldGEudGFnLnRlbXBsYXRlLmhhbmRsZWJhcnMnXVxuICAgIGV4cGVjdCh0b2tlbnNbNF0pLnRvRXF1YWwgdmFsdWU6ICcgaW4gJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5oYW5kbGViYXJzJywgJ21ldGEudGFnLnRlbXBsYXRlLmhhbmRsZWJhcnMnLCAnZW50aXR5Lm5hbWUuZnVuY3Rpb24uaGFuZGxlYmFycyddXG4gICAgZXhwZWN0KHRva2Vuc1s1XSkudG9FcXVhbCB2YWx1ZTogJ3Blb3BsZScsIHNjb3BlczogWyd0ZXh0Lmh0bWwuaGFuZGxlYmFycycsICdtZXRhLnRhZy50ZW1wbGF0ZS5oYW5kbGViYXJzJ11cbiAgICBleHBlY3QodG9rZW5zWzZdKS50b0VxdWFsIHZhbHVlOiAnfX0nLCBzY29wZXM6IFsndGV4dC5odG1sLmhhbmRsZWJhcnMnLCAnbWV0YS50YWcudGVtcGxhdGUuaGFuZGxlYmFycycsICdlbnRpdHkubmFtZS50YWcuaGFuZGxlYmFycyddXG5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKFwie3svaWZ9fVwiKVxuXG4gICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3t7Jywgc2NvcGVzOiBbJ3RleHQuaHRtbC5oYW5kbGViYXJzJywgJ21ldGEudGFnLnRlbXBsYXRlLmhhbmRsZWJhcnMnLCAnZW50aXR5Lm5hbWUudGFnLmhhbmRsZWJhcnMnXVxuICAgIGV4cGVjdCh0b2tlbnNbMV0pLnRvRXF1YWwgdmFsdWU6ICcvJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5oYW5kbGViYXJzJywgJ21ldGEudGFnLnRlbXBsYXRlLmhhbmRsZWJhcnMnLCAnZW50aXR5Lm5hbWUudGFnLmhhbmRsZWJhcnMnLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5ibG9jay5lbmQuaGFuZGxlYmFycyddXG4gICAgZXhwZWN0KHRva2Vuc1syXSkudG9FcXVhbCB2YWx1ZTogJ2lmJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5oYW5kbGViYXJzJywgJ21ldGEudGFnLnRlbXBsYXRlLmhhbmRsZWJhcnMnLCAnZW50aXR5Lm5hbWUudGFnLmhhbmRsZWJhcnMnLCAnZW50aXR5Lm5hbWUuZnVuY3Rpb24uaGFuZGxlYmFycyddXG4gICAgZXhwZWN0KHRva2Vuc1szXSkudG9FcXVhbCB2YWx1ZTogJ319Jywgc2NvcGVzOiBbJ3RleHQuaHRtbC5oYW5kbGViYXJzJywgJ21ldGEudGFnLnRlbXBsYXRlLmhhbmRsZWJhcnMnLCAnZW50aXR5Lm5hbWUudGFnLmhhbmRsZWJhcnMnXVxuXG4gIGl0ICdwYXJzZXMgdW5lc2NhcGVkIGV4cHJlc3Npb25zJywgLT5cbiAgICB7dG9rZW5zfSA9IGdyYW1tYXIudG9rZW5pemVMaW5lKFwie3t7ZG8gbm90IGVzY2FwZSBtZX19fVwiKVxuXG4gICAgZXhwZWN0KHRva2Vuc1swXSkudG9FcXVhbCB2YWx1ZTogJ3t7eycsIHNjb3BlczogWyd0ZXh0Lmh0bWwuaGFuZGxlYmFycycsICdtZXRhLnRhZy50ZW1wbGF0ZS5yYXcuaGFuZGxlYmFycycsICdlbnRpdHkubmFtZS50YWcuaGFuZGxlYmFycyddXG4gICAgZXhwZWN0KHRva2Vuc1sxXSkudG9FcXVhbCB2YWx1ZTogJ2RvIG5vdCBlc2NhcGUgbWUnLCBzY29wZXM6IFsndGV4dC5odG1sLmhhbmRsZWJhcnMnLCAnbWV0YS50YWcudGVtcGxhdGUucmF3LmhhbmRsZWJhcnMnXVxuICAgIGV4cGVjdCh0b2tlbnNbMl0pLnRvRXF1YWwgdmFsdWU6ICd9fX0nLCBzY29wZXM6IFsndGV4dC5odG1sLmhhbmRsZWJhcnMnLCAnbWV0YS50YWcudGVtcGxhdGUucmF3LmhhbmRsZWJhcnMnLCAnZW50aXR5Lm5hbWUudGFnLmhhbmRsZWJhcnMnXVxuIl19
