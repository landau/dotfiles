(function() {
  var VariableParser, registry;

  VariableParser = require('../lib/variable-parser');

  registry = require('../lib/variable-expressions');

  describe('VariableParser', function() {
    var itParses, parser;
    parser = [][0];
    itParses = function(expression) {
      return {
        as: function(variables) {
          it("parses '" + expression + "' as variables " + (jasmine.pp(variables)), function() {
            var expected, i, len, name, range, ref, results, results1, value;
            results = parser.parse(expression);
            expect(results.length).toEqual(Object.keys(variables).length);
            results1 = [];
            for (i = 0, len = results.length; i < len; i++) {
              ref = results[i], name = ref.name, value = ref.value, range = ref.range;
              expected = variables[name];
              if (expected.value != null) {
                results1.push(expect(value).toEqual(expected.value));
              } else if (expected.range != null) {
                results1.push(expect(range).toEqual(expected.range));
              } else {
                results1.push(expect(value).toEqual(expected));
              }
            }
            return results1;
          });
          return this;
        },
        asDefault: function(variables) {
          it("parses '" + expression + "' as default variables " + (jasmine.pp(variables)), function() {
            var expected, i, isDefault, len, name, range, ref, results, results1, value;
            results = parser.parse(expression);
            expect(results.length).toEqual(Object.keys(variables).length);
            results1 = [];
            for (i = 0, len = results.length; i < len; i++) {
              ref = results[i], name = ref.name, value = ref.value, range = ref.range, isDefault = ref["default"];
              expected = variables[name];
              expect(isDefault).toBeTruthy();
              if (expected.value != null) {
                results1.push(expect(value).toEqual(expected.value));
              } else if (expected.range != null) {
                results1.push(expect(range).toEqual(expected.range));
              } else {
                results1.push(expect(value).toEqual(expected));
              }
            }
            return results1;
          });
          return this;
        },
        asUndefined: function() {
          return it("does not parse '" + expression + "' as a variable expression", function() {
            var results;
            results = parser.parse(expression);
            return expect(results).toBeUndefined();
          });
        }
      };
    };
    beforeEach(function() {
      return parser = new VariableParser(registry);
    });
    itParses('color = white').as({
      'color': 'white'
    });
    itParses('non-color = 10px').as({
      'non-color': '10px'
    });
    itParses('$color: white').as({
      '$color': 'white'
    });
    itParses('$color: white !default').asDefault({
      '$color': 'white'
    });
    itParses('$color: white // foo').as({
      '$color': 'white'
    });
    itParses('$color  : white').as({
      '$color': 'white'
    });
    itParses('$some-color: white;').as({
      '$some-color': 'white',
      '$some_color': 'white'
    });
    itParses('$some_color  : white').as({
      '$some-color': 'white',
      '$some_color': 'white'
    });
    itParses('$non-color: 10px;').as({
      '$non-color': '10px',
      '$non_color': '10px'
    });
    itParses('$non_color: 10px').as({
      '$non-color': '10px',
      '$non_color': '10px'
    });
    itParses('@color: white;').as({
      '@color': 'white'
    });
    itParses('@non-color: 10px;').as({
      '@non-color': '10px'
    });
    itParses('@non--color: 10px;').as({
      '@non--color': '10px'
    });
    itParses('--color: white;').as({
      'var(--color)': 'white'
    });
    itParses('--non-color: 10px;').as({
      'var(--non-color)': '10px'
    });
    itParses('\\definecolor{orange}{gray}{1}').as({
      '{orange}': 'gray(100%)'
    });
    itParses('\\definecolor{orange}{RGB}{255,127,0}').as({
      '{orange}': 'rgb(255,127,0)'
    });
    itParses('\\definecolor{orange}{rgb}{1,0.5,0}').as({
      '{orange}': 'rgb(255,127,0)'
    });
    itParses('\\definecolor{orange}{cmyk}{0,0.5,1,0}').as({
      '{orange}': 'cmyk(0,0.5,1,0)'
    });
    itParses('\\definecolor{orange}{HTML}{FF7F00}').as({
      '{orange}': '#FF7F00'
    });
    itParses('\\definecolor{darkgreen}{blue!20!black!30!green}').as({
      '{darkgreen}': '{blue!20!black!30!green}'
    });
    itParses('\n.error--large(@color: red) {\n  background-color: @color;\n}').asUndefined();
    return itParses("colors = {\n  red: rgb(255,0,0),\n  green: rgb(0,255,0),\n  blue: rgb(0,0,255)\n  value: 10px\n  light: {\n    base: lightgrey\n  }\n  dark: {\n    base: slategrey\n  }\n}").as({
      'colors.red': {
        value: 'rgb(255,0,0)',
        range: [[1, 2], [1, 14]]
      },
      'colors.green': {
        value: 'rgb(0,255,0)',
        range: [[2, 2], [2, 16]]
      },
      'colors.blue': {
        value: 'rgb(0,0,255)',
        range: [[3, 2], [3, 15]]
      },
      'colors.value': {
        value: '10px',
        range: [[4, 2], [4, 13]]
      },
      'colors.light.base': {
        value: 'lightgrey',
        range: [[9, 4], [9, 17]]
      },
      'colors.dark.base': {
        value: 'slategrey',
        range: [[12, 4], [12, 14]]
      }
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy92YXJpYWJsZS1wYXJzZXItc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLHdCQUFSOztFQUNqQixRQUFBLEdBQVcsT0FBQSxDQUFRLDZCQUFSOztFQUVYLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO0FBQ3pCLFFBQUE7SUFBQyxTQUFVO0lBRVgsUUFBQSxHQUFXLFNBQUMsVUFBRDthQUNUO1FBQUEsRUFBQSxFQUFJLFNBQUMsU0FBRDtVQUNGLEVBQUEsQ0FBRyxVQUFBLEdBQVcsVUFBWCxHQUFzQixpQkFBdEIsR0FBc0MsQ0FBQyxPQUFPLENBQUMsRUFBUixDQUFXLFNBQVgsQ0FBRCxDQUF6QyxFQUFtRSxTQUFBO0FBQ2pFLGdCQUFBO1lBQUEsT0FBQSxHQUFVLE1BQU0sQ0FBQyxLQUFQLENBQWEsVUFBYjtZQUVWLE1BQUEsQ0FBTyxPQUFPLENBQUMsTUFBZixDQUFzQixDQUFDLE9BQXZCLENBQStCLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBWixDQUFzQixDQUFDLE1BQXREO0FBQ0E7aUJBQUEseUNBQUE7Z0NBQUssaUJBQU0sbUJBQU87Y0FDaEIsUUFBQSxHQUFXLFNBQVUsQ0FBQSxJQUFBO2NBQ3JCLElBQUcsc0JBQUg7OEJBQ0UsTUFBQSxDQUFPLEtBQVAsQ0FBYSxDQUFDLE9BQWQsQ0FBc0IsUUFBUSxDQUFDLEtBQS9CLEdBREY7ZUFBQSxNQUVLLElBQUcsc0JBQUg7OEJBQ0gsTUFBQSxDQUFPLEtBQVAsQ0FBYSxDQUFDLE9BQWQsQ0FBc0IsUUFBUSxDQUFDLEtBQS9CLEdBREc7ZUFBQSxNQUFBOzhCQUdILE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxPQUFkLENBQXNCLFFBQXRCLEdBSEc7O0FBSlA7O1VBSmlFLENBQW5FO2lC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QUFELEVBQUcsRUFBSCxDQUFSLENBRFA7T0FGSTtNQUlOLGNBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxjQUFQO1FBQ0EsS0FBQSxFQUFPLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQVEsQ0FBQyxDQUFELEVBQUcsRUFBSCxDQUFSLENBRFA7T0FMSTtNQU9OLGFBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxjQUFQO1FBQ0EsS0FBQSxFQUFPLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQU8sQ0FBQyxDQUFELEVBQUcsRUFBSCxDQUFQLENBRFA7T0FSSTtNQVVOLGNBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxNQUFQO1FBQ0EsS0FBQSxFQUFPLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQU8sQ0FBQyxDQUFELEVBQUcsRUFBSCxDQUFQLENBRFA7T0FYSTtNQWFOLG1CQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sV0FBUDtRQUNBLEtBQUEsRUFBTyxDQUFDLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBRCxFQUFPLENBQUMsQ0FBRCxFQUFHLEVBQUgsQ0FBUCxDQURQO09BZEk7TUFnQk4sa0JBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxXQUFQO1FBQ0EsS0FBQSxFQUFPLENBQUMsQ0FBQyxFQUFELEVBQUksQ0FBSixDQUFELEVBQVEsQ0FBQyxFQUFELEVBQUksRUFBSixDQUFSLENBRFA7T0FqQkk7S0FiUjtFQXhHeUIsQ0FBM0I7QUFIQSIsInNvdXJjZXNDb250ZW50IjpbIlZhcmlhYmxlUGFyc2VyID0gcmVxdWlyZSAnLi4vbGliL3ZhcmlhYmxlLXBhcnNlcidcbnJlZ2lzdHJ5ID0gcmVxdWlyZSAnLi4vbGliL3ZhcmlhYmxlLWV4cHJlc3Npb25zJ1xuXG5kZXNjcmliZSAnVmFyaWFibGVQYXJzZXInLCAtPlxuICBbcGFyc2VyXSA9IFtdXG5cbiAgaXRQYXJzZXMgPSAoZXhwcmVzc2lvbikgLT5cbiAgICBhczogKHZhcmlhYmxlcykgLT5cbiAgICAgIGl0IFwicGFyc2VzICcje2V4cHJlc3Npb259JyBhcyB2YXJpYWJsZXMgI3tqYXNtaW5lLnBwKHZhcmlhYmxlcyl9XCIsIC0+XG4gICAgICAgIHJlc3VsdHMgPSBwYXJzZXIucGFyc2UoZXhwcmVzc2lvbilcblxuICAgICAgICBleHBlY3QocmVzdWx0cy5sZW5ndGgpLnRvRXF1YWwoT2JqZWN0LmtleXModmFyaWFibGVzKS5sZW5ndGgpXG4gICAgICAgIGZvciB7bmFtZSwgdmFsdWUsIHJhbmdlfSBpbiByZXN1bHRzXG4gICAgICAgICAgZXhwZWN0ZWQgPSB2YXJpYWJsZXNbbmFtZV1cbiAgICAgICAgICBpZiBleHBlY3RlZC52YWx1ZT9cbiAgICAgICAgICAgIGV4cGVjdCh2YWx1ZSkudG9FcXVhbChleHBlY3RlZC52YWx1ZSlcbiAgICAgICAgICBlbHNlIGlmIGV4cGVjdGVkLnJhbmdlP1xuICAgICAgICAgICAgZXhwZWN0KHJhbmdlKS50b0VxdWFsKGV4cGVjdGVkLnJhbmdlKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGV4cGVjdCh2YWx1ZSkudG9FcXVhbChleHBlY3RlZClcblxuICAgICAgdGhpc1xuXG4gICAgYXNEZWZhdWx0OiAodmFyaWFibGVzKSAtPlxuICAgICAgaXQgXCJwYXJzZXMgJyN7ZXhwcmVzc2lvbn0nIGFzIGRlZmF1bHQgdmFyaWFibGVzICN7amFzbWluZS5wcCh2YXJpYWJsZXMpfVwiLCAtPlxuICAgICAgICByZXN1bHRzID0gcGFyc2VyLnBhcnNlKGV4cHJlc3Npb24pXG5cbiAgICAgICAgZXhwZWN0KHJlc3VsdHMubGVuZ3RoKS50b0VxdWFsKE9iamVjdC5rZXlzKHZhcmlhYmxlcykubGVuZ3RoKVxuICAgICAgICBmb3Ige25hbWUsIHZhbHVlLCByYW5nZSwgZGVmYXVsdDogaXNEZWZhdWx0fSBpbiByZXN1bHRzXG4gICAgICAgICAgZXhwZWN0ZWQgPSB2YXJpYWJsZXNbbmFtZV1cbiAgICAgICAgICBleHBlY3QoaXNEZWZhdWx0KS50b0JlVHJ1dGh5KClcbiAgICAgICAgICBpZiBleHBlY3RlZC52YWx1ZT9cbiAgICAgICAgICAgIGV4cGVjdCh2YWx1ZSkudG9FcXVhbChleHBlY3RlZC52YWx1ZSlcbiAgICAgICAgICBlbHNlIGlmIGV4cGVjdGVkLnJhbmdlP1xuICAgICAgICAgICAgZXhwZWN0KHJhbmdlKS50b0VxdWFsKGV4cGVjdGVkLnJhbmdlKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGV4cGVjdCh2YWx1ZSkudG9FcXVhbChleHBlY3RlZClcblxuICAgICAgdGhpc1xuXG5cbiAgICBhc1VuZGVmaW5lZDogLT5cbiAgICAgIGl0IFwiZG9lcyBub3QgcGFyc2UgJyN7ZXhwcmVzc2lvbn0nIGFzIGEgdmFyaWFibGUgZXhwcmVzc2lvblwiLCAtPlxuICAgICAgICByZXN1bHRzID0gcGFyc2VyLnBhcnNlKGV4cHJlc3Npb24pXG5cbiAgICAgICAgZXhwZWN0KHJlc3VsdHMpLnRvQmVVbmRlZmluZWQoKVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBwYXJzZXIgPSBuZXcgVmFyaWFibGVQYXJzZXIocmVnaXN0cnkpXG5cbiAgaXRQYXJzZXMoJ2NvbG9yID0gd2hpdGUnKS5hcygnY29sb3InOiAnd2hpdGUnKVxuICBpdFBhcnNlcygnbm9uLWNvbG9yID0gMTBweCcpLmFzKCdub24tY29sb3InOiAnMTBweCcpXG5cbiAgaXRQYXJzZXMoJyRjb2xvcjogd2hpdGUnKS5hcygnJGNvbG9yJzogJ3doaXRlJylcbiAgaXRQYXJzZXMoJyRjb2xvcjogd2hpdGUgIWRlZmF1bHQnKS5hc0RlZmF1bHQoJyRjb2xvcic6ICd3aGl0ZScpXG4gIGl0UGFyc2VzKCckY29sb3I6IHdoaXRlIC8vIGZvbycpLmFzKCckY29sb3InOiAnd2hpdGUnKVxuICBpdFBhcnNlcygnJGNvbG9yICA6IHdoaXRlJykuYXMoJyRjb2xvcic6ICd3aGl0ZScpXG4gIGl0UGFyc2VzKCckc29tZS1jb2xvcjogd2hpdGU7JykuYXMoe1xuICAgICckc29tZS1jb2xvcic6ICd3aGl0ZSdcbiAgICAnJHNvbWVfY29sb3InOiAnd2hpdGUnXG4gIH0pXG4gIGl0UGFyc2VzKCckc29tZV9jb2xvciAgOiB3aGl0ZScpLmFzKHtcbiAgICAnJHNvbWUtY29sb3InOiAnd2hpdGUnXG4gICAgJyRzb21lX2NvbG9yJzogJ3doaXRlJ1xuICB9KVxuICBpdFBhcnNlcygnJG5vbi1jb2xvcjogMTBweDsnKS5hcyh7XG4gICAgJyRub24tY29sb3InOiAnMTBweCdcbiAgICAnJG5vbl9jb2xvcic6ICcxMHB4J1xuICB9KVxuICBpdFBhcnNlcygnJG5vbl9jb2xvcjogMTBweCcpLmFzKHtcbiAgICAnJG5vbi1jb2xvcic6ICcxMHB4J1xuICAgICckbm9uX2NvbG9yJzogJzEwcHgnXG4gIH0pXG5cbiAgaXRQYXJzZXMoJ0Bjb2xvcjogd2hpdGU7JykuYXMoJ0Bjb2xvcic6ICd3aGl0ZScpXG4gIGl0UGFyc2VzKCdAbm9uLWNvbG9yOiAxMHB4OycpLmFzKCdAbm9uLWNvbG9yJzogJzEwcHgnKVxuICBpdFBhcnNlcygnQG5vbi0tY29sb3I6IDEwcHg7JykuYXMoJ0Bub24tLWNvbG9yJzogJzEwcHgnKVxuXG4gIGl0UGFyc2VzKCctLWNvbG9yOiB3aGl0ZTsnKS5hcygndmFyKC0tY29sb3IpJzogJ3doaXRlJylcbiAgaXRQYXJzZXMoJy0tbm9uLWNvbG9yOiAxMHB4OycpLmFzKCd2YXIoLS1ub24tY29sb3IpJzogJzEwcHgnKVxuXG4gIGl0UGFyc2VzKCdcXFxcZGVmaW5lY29sb3J7b3JhbmdlfXtncmF5fXsxfScpLmFzKHtcbiAgICAne29yYW5nZX0nOiAnZ3JheSgxMDAlKSdcbiAgfSlcblxuICBpdFBhcnNlcygnXFxcXGRlZmluZWNvbG9ye29yYW5nZX17UkdCfXsyNTUsMTI3LDB9JykuYXMoe1xuICAgICd7b3JhbmdlfSc6ICdyZ2IoMjU1LDEyNywwKSdcbiAgfSlcblxuICBpdFBhcnNlcygnXFxcXGRlZmluZWNvbG9ye29yYW5nZX17cmdifXsxLDAuNSwwfScpLmFzKHtcbiAgICAne29yYW5nZX0nOiAncmdiKDI1NSwxMjcsMCknXG4gIH0pXG5cbiAgaXRQYXJzZXMoJ1xcXFxkZWZpbmVjb2xvcntvcmFuZ2V9e2NteWt9ezAsMC41LDEsMH0nKS5hcyh7XG4gICAgJ3tvcmFuZ2V9JzogJ2NteWsoMCwwLjUsMSwwKSdcbiAgfSlcblxuICBpdFBhcnNlcygnXFxcXGRlZmluZWNvbG9ye29yYW5nZX17SFRNTH17RkY3RjAwfScpLmFzKHtcbiAgICAne29yYW5nZX0nOiAnI0ZGN0YwMCdcbiAgfSlcblxuICBpdFBhcnNlcygnXFxcXGRlZmluZWNvbG9ye2RhcmtncmVlbn17Ymx1ZSEyMCFibGFjayEzMCFncmVlbn0nKS5hcyh7XG4gICAgJ3tkYXJrZ3JlZW59JzogJ3tibHVlITIwIWJsYWNrITMwIWdyZWVufSdcbiAgfSlcblxuICBpdFBhcnNlcygnXFxuLmVycm9yLS1sYXJnZShAY29sb3I6IHJlZCkge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogQGNvbG9yO1xcbn0nKS5hc1VuZGVmaW5lZCgpXG5cbiAgaXRQYXJzZXMoXCJcIlwiXG4gICAgY29sb3JzID0ge1xuICAgICAgcmVkOiByZ2IoMjU1LDAsMCksXG4gICAgICBncmVlbjogcmdiKDAsMjU1LDApLFxuICAgICAgYmx1ZTogcmdiKDAsMCwyNTUpXG4gICAgICB2YWx1ZTogMTBweFxuICAgICAgbGlnaHQ6IHtcbiAgICAgICAgYmFzZTogbGlnaHRncmV5XG4gICAgICB9XG4gICAgICBkYXJrOiB7XG4gICAgICAgIGJhc2U6IHNsYXRlZ3JleVxuICAgICAgfVxuICAgIH1cbiAgXCJcIlwiKS5hcyh7XG4gICAgJ2NvbG9ycy5yZWQnOlxuICAgICAgdmFsdWU6ICdyZ2IoMjU1LDAsMCknXG4gICAgICByYW5nZTogW1sxLDJdLCBbMSwxNF1dXG4gICAgJ2NvbG9ycy5ncmVlbic6XG4gICAgICB2YWx1ZTogJ3JnYigwLDI1NSwwKSdcbiAgICAgIHJhbmdlOiBbWzIsMl0sIFsyLDE2XV1cbiAgICAnY29sb3JzLmJsdWUnOlxuICAgICAgdmFsdWU6ICdyZ2IoMCwwLDI1NSknXG4gICAgICByYW5nZTogW1szLDJdLFszLDE1XV1cbiAgICAnY29sb3JzLnZhbHVlJzpcbiAgICAgIHZhbHVlOiAnMTBweCdcbiAgICAgIHJhbmdlOiBbWzQsMl0sWzQsMTNdXVxuICAgICdjb2xvcnMubGlnaHQuYmFzZSc6XG4gICAgICB2YWx1ZTogJ2xpZ2h0Z3JleSdcbiAgICAgIHJhbmdlOiBbWzksNF0sWzksMTddXVxuICAgICdjb2xvcnMuZGFyay5iYXNlJzpcbiAgICAgIHZhbHVlOiAnc2xhdGVncmV5J1xuICAgICAgcmFuZ2U6IFtbMTIsNF0sWzEyLDE0XV1cbiAgfSlcbiJdfQ==
