(function() {
  var ColorContext, ColorParser, registry,
    slice = [].slice;

  ColorContext = require('../lib/color-context');

  ColorParser = require('../lib/color-parser');

  registry = require('../lib/color-expressions');

  describe('ColorContext', function() {
    var context, itParses, parser, ref;
    ref = [], context = ref[0], parser = ref[1];
    itParses = function(expression) {
      return {
        asUndefined: function() {
          return it("parses '" + expression + "' as undefined", function() {
            return expect(context.getValue(expression)).toBeUndefined();
          });
        },
        asUndefinedColor: function() {
          return it("parses '" + expression + "' as undefined color", function() {
            return expect(context.readColor(expression)).toBeUndefined();
          });
        },
        asInt: function(expected) {
          return it("parses '" + expression + "' as an integer with value of " + expected, function() {
            return expect(context.readInt(expression)).toEqual(expected);
          });
        },
        asFloat: function(expected) {
          return it("parses '" + expression + "' as a float with value of " + expected, function() {
            return expect(context.readFloat(expression)).toEqual(expected);
          });
        },
        asIntOrPercent: function(expected) {
          return it("parses '" + expression + "' as an integer or a percentage with value of " + expected, function() {
            return expect(context.readIntOrPercent(expression)).toEqual(expected);
          });
        },
        asFloatOrPercent: function(expected) {
          return it("parses '" + expression + "' as a float or a percentage with value of " + expected, function() {
            return expect(context.readFloatOrPercent(expression)).toEqual(expected);
          });
        },
        asColorExpression: function(expected) {
          return it("parses '" + expression + "' as a color expression", function() {
            return expect(context.readColorExpression(expression)).toEqual(expected);
          });
        },
        asColor: function() {
          var expected;
          expected = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return it("parses '" + expression + "' as a color with value of " + (jasmine.pp(expected)), function() {
            var ref1;
            return (ref1 = expect(context.readColor(expression))).toBeColor.apply(ref1, expected);
          });
        },
        asInvalidColor: function() {
          var expected;
          expected = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return it("parses '" + expression + "' as an invalid color", function() {
            return expect(context.readColor(expression)).not.toBeValid();
          });
        }
      };
    };
    describe('created without any variables', function() {
      beforeEach(function() {
        return context = new ColorContext({
          registry: registry
        });
      });
      itParses('10').asInt(10);
      itParses('10').asFloat(10);
      itParses('0.5').asFloat(0.5);
      itParses('.5').asFloat(0.5);
      itParses('10').asIntOrPercent(10);
      itParses('10%').asIntOrPercent(26);
      itParses('0.1').asFloatOrPercent(0.1);
      itParses('10%').asFloatOrPercent(0.1);
      itParses('red').asColorExpression('red');
      itParses('red').asColor(255, 0, 0);
      itParses('#ff0000').asColor(255, 0, 0);
      return itParses('rgb(255,127,0)').asColor(255, 127, 0);
    });
    describe('with a variables array', function() {
      var createColorVar, createVar;
      createVar = function(name, value, path) {
        return {
          value: value,
          name: name,
          path: path != null ? path : '/path/to/file.coffee'
        };
      };
      createColorVar = function(name, value, path) {
        var v;
        v = createVar(name, value, path);
        v.isColor = true;
        return v;
      };
      describe('that contains valid variables', function() {
        beforeEach(function() {
          var colorVariables, variables;
          variables = [createVar('x', '10'), createVar('y', '0.1'), createVar('z', '10%'), createColorVar('c', 'rgb(255,127,0)')];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            registry: registry
          });
        });
        itParses('x').asInt(10);
        itParses('y').asFloat(0.1);
        itParses('z').asIntOrPercent(26);
        itParses('z').asFloatOrPercent(0.1);
        itParses('c').asColorExpression('rgb(255,127,0)');
        return itParses('c').asColor(255, 127, 0);
      });
      describe('that contains alias for named colors', function() {
        beforeEach(function() {
          var colorVariables, variables;
          variables = [createColorVar('$text-color', 'white', '/path/to/file.css.sass'), createColorVar('$background-color', 'black', '/path/to/file.css.sass')];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            registry: registry
          });
        });
        itParses('$text-color').asColor(255, 255, 255);
        return itParses('$background-color').asColor(0, 0, 0);
      });
      describe('that contains invalid colors', function() {
        beforeEach(function() {
          var variables;
          variables = [createVar('@text-height', '@scale-b-xxl * 1rem'), createVar('@component-line-height', '@text-height'), createVar('@list-item-height', '@component-line-height')];
          return context = new ColorContext({
            variables: variables,
            registry: registry
          });
        });
        return itParses('@list-item-height').asUndefinedColor();
      });
      describe('that contains circular references', function() {
        beforeEach(function() {
          var variables;
          variables = [createVar('@foo', '@bar'), createVar('@bar', '@baz'), createVar('@baz', '@foo'), createVar('@taz', '@taz')];
          return context = new ColorContext({
            variables: variables,
            registry: registry
          });
        });
        itParses('@foo').asUndefined();
        return itParses('@taz').asUndefined();
      });
      describe('that contains circular references', function() {
        beforeEach(function() {
          var colorVariables, variables;
          variables = [createColorVar('@foo', '@bar'), createColorVar('@bar', '@baz'), createColorVar('@baz', '@foo'), createColorVar('@taz', '@taz')];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            registry: registry
          });
        });
        itParses('@foo').asInvalidColor();
        itParses('@foo').asUndefined();
        return itParses('@taz').asUndefined();
      });
      return describe('that contains circular references nested in operations', function() {
        beforeEach(function() {
          var colorVariables, variables;
          variables = [createColorVar('@foo', 'complement(@bar)'), createColorVar('@bar', 'transparentize(@baz, 0.5)'), createColorVar('@baz', 'darken(@foo, 10%)')];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            registry: registry
          });
        });
        return itParses('@foo').asInvalidColor();
      });
    });
    describe('with variables from a default file', function() {
      var createColorVar, createVar, projectPath, ref1, referenceVariable;
      ref1 = [], projectPath = ref1[0], referenceVariable = ref1[1];
      createVar = function(name, value, path, isDefault) {
        if (isDefault == null) {
          isDefault = false;
        }
        if (path == null) {
          path = projectPath + "/file.styl";
        }
        return {
          value: value,
          name: name,
          path: path,
          "default": isDefault
        };
      };
      createColorVar = function(name, value, path, isDefault) {
        var v;
        v = createVar(name, value, path, isDefault);
        v.isColor = true;
        return v;
      };
      describe('when there is another valid value', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', projectPath + "/b.styl", true), createVar('b', '20', projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(20);
      });
      describe('when there is no another valid value', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', projectPath + "/b.styl", true), createVar('b', 'c', projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(10);
      });
      describe('when there is another valid color', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createColorVar('a', 'b', projectPath + "/a.styl");
          variables = [referenceVariable, createColorVar('b', '#ff0000', projectPath + "/b.styl", true), createColorVar('b', '#0000ff', projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asColor(0, 0, 255);
      });
      return describe('when there is no another valid color', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createColorVar('a', 'b', projectPath + "/a.styl");
          variables = [referenceVariable, createColorVar('b', '#ff0000', projectPath + "/b.styl", true), createColorVar('b', 'c', projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asColor(255, 0, 0);
      });
    });
    describe('with a reference variable', function() {
      var createColorVar, createVar, projectPath, ref1, referenceVariable;
      ref1 = [], projectPath = ref1[0], referenceVariable = ref1[1];
      createVar = function(name, value, path) {
        if (path == null) {
          path = projectPath + "/file.styl";
        }
        return {
          value: value,
          name: name,
          path: path
        };
      };
      createColorVar = function(name, value) {
        var v;
        v = createVar(name, value);
        v.isColor = true;
        return v;
      };
      describe('when there is a single root path', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', '10', projectPath + "/a.styl");
          variables = [referenceVariable, createVar('a', '20', projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(10);
      });
      return describe('when there are many root paths', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', projectPath + "/b.styl"), createVar('b', '20', projectPath + "2/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath, projectPath + "2"]
          });
        });
        return itParses('a').asInt(10);
      });
    });
    return describe('with a reference path', function() {
      var createColorVar, createVar, projectPath, ref1, referenceVariable;
      ref1 = [], projectPath = ref1[0], referenceVariable = ref1[1];
      createVar = function(name, value, path) {
        if (path == null) {
          path = projectPath + "/file.styl";
        }
        return {
          value: value,
          name: name,
          path: path
        };
      };
      createColorVar = function(name, value) {
        var v;
        v = createVar(name, value);
        v.isColor = true;
        return v;
      };
      describe('when there is a single root path', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', '10', projectPath + "/a.styl");
          variables = [referenceVariable, createVar('a', '20', projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referencePath: projectPath + "/a.styl",
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(10);
      });
      return describe('when there are many root paths', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', projectPath + "/b.styl"), createVar('b', '20', projectPath + "2/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referencePath: projectPath + "/a.styl",
            rootPaths: [projectPath, projectPath + "2"]
          });
        });
        return itParses('a').asInt(10);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9jb2xvci1jb250ZXh0LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQSxtQ0FBQTtJQUFBOztFQUFBLFlBQUEsR0FBZSxPQUFBLENBQVEsc0JBQVI7O0VBQ2YsV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUjs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLDBCQUFSOztFQUVYLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUE7QUFDdkIsUUFBQTtJQUFBLE1BQW9CLEVBQXBCLEVBQUMsZ0JBQUQsRUFBVTtJQUVWLFFBQUEsR0FBVyxTQUFDLFVBQUQ7YUFDVDtRQUFBLFdBQUEsRUFBYSxTQUFBO2lCQUNYLEVBQUEsQ0FBRyxVQUFBLEdBQVcsVUFBWCxHQUFzQixnQkFBekIsRUFBMEMsU0FBQTttQkFDeEMsTUFBQSxDQUFPLE9BQU8sQ0FBQyxRQUFSLENBQWlCLFVBQWpCLENBQVAsQ0FBb0MsQ0FBQyxhQUFyQyxDQUFBO1VBRHdDLENBQTFDO1FBRFcsQ0FBYjtRQUlBLGdCQUFBLEVBQWtCLFNBQUE7aUJBQ2hCLEVBQUEsQ0FBRyxVQUFBLEdBQVcsVUFBWCxHQUFzQixzQkFBekIsRUFBZ0QsU0FBQTttQkFDOUMsTUFBQSxDQUFPLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFVBQWxCLENBQVAsQ0FBcUMsQ0FBQyxhQUF0QyxDQUFBO1VBRDhDLENBQWhEO1FBRGdCLENBSmxCO1FBUUEsS0FBQSxFQUFPLFNBQUMsUUFBRDtpQkFDTCxFQUFBLENBQUcsVUFBQSxHQUFXLFVBQVgsR0FBc0IsZ0NBQXRCLEdBQXNELFFBQXpELEVBQXFFLFNBQUE7bUJBQ25FLE1BQUEsQ0FBTyxPQUFPLENBQUMsT0FBUixDQUFnQixVQUFoQixDQUFQLENBQW1DLENBQUMsT0FBcEMsQ0FBNEMsUUFBNUM7VUFEbUUsQ0FBckU7UUFE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aUJBQUEsR0FBb0IsU0FBQSxDQUFVLEdBQVYsRUFBZSxHQUFmLEVBQXVCLFdBQUQsR0FBYSxTQUFuQztVQUVwQixTQUFBLEdBQVksQ0FDVixpQkFEVSxFQUVWLFNBQUEsQ0FBVSxHQUFWLEVBQWUsSUFBZixFQUF3QixXQUFELEdBQWEsU0FBcEMsQ0FGVSxFQUdWLFNBQUEsQ0FBVSxHQUFWLEVBQWUsSUFBZixFQUF3QixXQUFELEdBQWEsVUFBcEMsQ0FIVTtVQU1aLGNBQUEsR0FBaUIsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsU0FBQyxDQUFEO21CQUFPLENBQUMsQ0FBQztVQUFULENBQWpCO2lCQUVqQixPQUFBLEdBQWMsSUFBQSxZQUFBLENBQWE7WUFDekIsVUFBQSxRQUR5QjtZQUV6QixXQUFBLFNBRnlCO1lBR3pCLGdCQUFBLGNBSHlCO1lBSXpCLGFBQUEsRUFBa0IsV0FBRCxHQUFhLFNBSkw7WUFLekIsU0FBQSxFQUFXLENBQUMsV0FBRCxFQUFpQixXQUFELEdBQWEsR0FBN0IsQ0FMYztXQUFiO1FBWkwsQ0FBWDtlQW9CQSxRQUFBLENBQVMsR0FBVCxDQUFhLENBQUMsS0FBZCxDQUFvQixFQUFwQjtNQXJCeUMsQ0FBM0M7SUFqQ2dDLENBQWxDO0VBbFV1QixDQUF6QjtBQUpBIiwic291cmNlc0NvbnRlbnQiOlsiXG5Db2xvckNvbnRleHQgPSByZXF1aXJlICcuLi9saWIvY29sb3ItY29udGV4dCdcbkNvbG9yUGFyc2VyID0gcmVxdWlyZSAnLi4vbGliL2NvbG9yLXBhcnNlcidcbnJlZ2lzdHJ5ID0gcmVxdWlyZSAnLi4vbGliL2NvbG9yLWV4cHJlc3Npb25zJ1xuXG5kZXNjcmliZSAnQ29sb3JDb250ZXh0JywgLT5cbiAgW2NvbnRleHQsIHBhcnNlcl0gPSBbXVxuXG4gIGl0UGFyc2VzID0gKGV4cHJlc3Npb24pIC0+XG4gICAgYXNVbmRlZmluZWQ6IC0+XG4gICAgICBpdCBcInBhcnNlcyAnI3tleHByZXNzaW9ufScgYXMgdW5kZWZpbmVkXCIsIC0+XG4gICAgICAgIGV4cGVjdChjb250ZXh0LmdldFZhbHVlKGV4cHJlc3Npb24pKS50b0JlVW5kZWZpbmVkKClcblxuICAgIGFzVW5kZWZpbmVkQ29sb3I6IC0+XG4gICAgICBpdCBcInBhcnNlcyAnI3tleHByZXNzaW9ufScgYXMgdW5kZWZpbmVkIGNvbG9yXCIsIC0+XG4gICAgICAgIGV4cGVjdChjb250ZXh0LnJlYWRDb2xvcihleHByZXNzaW9uKSkudG9CZVVuZGVmaW5lZCgpXG5cbiAgICBhc0ludDogKGV4cGVjdGVkKSAtPlxuICAgICAgaXQgXCJwYXJzZXMgJyN7ZXhwcmVzc2lvbn0nIGFzIGFuIGludGVnZXIgd2l0aCB2YWx1ZSBvZiAje2V4cGVjdGVkfVwiLCAtPlxuICAgICAgICBleHBlY3QoY29udGV4dC5yZWFkSW50KGV4cHJlc3Npb24pKS50b0VxdWFsKGV4cGVjdGVkKVxuXG4gICAgYXNGbG9hdDogKGV4cGVjdGVkKSAtPlxuICAgICAgaXQgXCJwYXJzZXMgJyN7ZXhwcmVzc2lvbn0nIGFzIGEgZmxvYXQgd2l0aCB2YWx1ZSBvZiAje2V4cGVjdGVkfVwiLCAtPlxuICAgICAgICBleHBlY3QoY29udGV4dC5yZWFkRmxvYXQoZXhwcmVzc2lvbikpLnRvRXF1YWwoZXhwZWN0ZWQpXG5cbiAgICBhc0ludE9yUGVyY2VudDogKGV4cGVjdGVkKSAtPlxuICAgICAgaXQgXCJwYXJzZXMgJyN7ZXhwcmVzc2lvbn0nIGFzIGFuIGludGVnZXIgb3IgYSBwZXJjZW50YWdlIHdpdGggdmFsdWUgb2YgI3tleHBlY3RlZH1cIiwgLT5cbiAgICAgICAgZXhwZWN0KGNvbnRleHQucmVhZEludE9yUGVyY2VudChleHByZXNzaW9uKSkudG9FcXVhbChleHBlY3RlZClcblxuICAgIGFzRmxvYXRPclBlcmNlbnQ6IChleHBlY3RlZCkgLT5cbiAgICAgIGl0IFwicGFyc2VzICcje2V4cHJlc3Npb259JyBhcyBhIGZsb2F0IG9yIGEgcGVyY2VudGFnZSB3aXRoIHZhbHVlIG9mICN7ZXhwZWN0ZWR9XCIsIC0+XG4gICAgICAgIGV4cGVjdChjb250ZXh0LnJlYWRGbG9hdE9yUGVyY2VudChleHByZXNzaW9uKSkudG9FcXVhbChleHBlY3RlZClcblxuICAgIGFzQ29sb3JFeHByZXNzaW9uOiAoZXhwZWN0ZWQpIC0+XG4gICAgICBpdCBcInBhcnNlcyAnI3tleHByZXNzaW9ufScgYXMgYSBjb2xvciBleHByZXNzaW9uXCIsIC0+XG4gICAgICAgIGV4cGVjdChjb250ZXh0LnJlYWRDb2xvckV4cHJlc3Npb24oZXhwcmVzc2lvbikpLnRvRXF1YWwoZXhwZWN0ZWQpXG5cbiAgICBhc0NvbG9yOiAoZXhwZWN0ZWQuLi4pIC0+XG4gICAgICBpdCBcInBhcnNlcyAnI3tleHByZXNzaW9ufScgYXMgYSBjb2xvciB3aXRoIHZhbHVlIG9mICN7amFzbWluZS5wcCBleHBlY3RlZH1cIiwgLT5cbiAgICAgICAgZXhwZWN0KGNvbnRleHQucmVhZENvbG9yKGV4cHJlc3Npb24pKS50b0JlQ29sb3IoZXhwZWN0ZWQuLi4pXG5cbiAgICBhc0ludmFsaWRDb2xvcjogKGV4cGVjdGVkLi4uKSAtPlxuICAgICAgaXQgXCJwYXJzZXMgJyN7ZXhwcmVzc2lvbn0nIGFzIGFuIGludmFsaWQgY29sb3JcIiwgLT5cbiAgICAgICAgZXhwZWN0KGNvbnRleHQucmVhZENvbG9yKGV4cHJlc3Npb24pKS5ub3QudG9CZVZhbGlkKClcblxuICBkZXNjcmliZSAnY3JlYXRlZCB3aXRob3V0IGFueSB2YXJpYWJsZXMnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGNvbnRleHQgPSBuZXcgQ29sb3JDb250ZXh0KHtyZWdpc3RyeX0pXG5cbiAgICBpdFBhcnNlcygnMTAnKS5hc0ludCgxMClcblxuICAgIGl0UGFyc2VzKCcxMCcpLmFzRmxvYXQoMTApXG4gICAgaXRQYXJzZXMoJzAuNScpLmFzRmxvYXQoMC41KVxuICAgIGl0UGFyc2VzKCcuNScpLmFzRmxvYXQoMC41KVxuXG4gICAgaXRQYXJzZXMoJzEwJykuYXNJbnRPclBlcmNlbnQoMTApXG4gICAgaXRQYXJzZXMoJzEwJScpLmFzSW50T3JQZXJjZW50KDI2KVxuXG4gICAgaXRQYXJzZXMoJzAuMScpLmFzRmxvYXRPclBlcmNlbnQoMC4xKVxuICAgIGl0UGFyc2VzKCcxMCUnKS5hc0Zsb2F0T3JQZXJjZW50KDAuMSlcblxuICAgIGl0UGFyc2VzKCdyZWQnKS5hc0NvbG9yRXhwcmVzc2lvbigncmVkJylcblxuICAgIGl0UGFyc2VzKCdyZWQnKS5hc0NvbG9yKDI1NSwgMCwgMClcbiAgICBpdFBhcnNlcygnI2ZmMDAwMCcpLmFzQ29sb3IoMjU1LCAwLCAwKVxuICAgIGl0UGFyc2VzKCdyZ2IoMjU1LDEyNywwKScpLmFzQ29sb3IoMjU1LCAxMjcsIDApXG5cbiAgZGVzY3JpYmUgJ3dpdGggYSB2YXJpYWJsZXMgYXJyYXknLCAtPlxuICAgIGNyZWF0ZVZhciA9IChuYW1lLCB2YWx1ZSwgcGF0aCkgLT5cbiAgICAgIHt2YWx1ZSwgbmFtZSwgcGF0aDogcGF0aCA/ICcvcGF0aC90by9maWxlLmNvZmZlZSd9XG5cbiAgICBjcmVhdGVDb2xvclZhciA9IChuYW1lLCB2YWx1ZSwgcGF0aCkgLT5cbiAgICAgIHYgPSBjcmVhdGVWYXIobmFtZSwgdmFsdWUsIHBhdGgpXG4gICAgICB2LmlzQ29sb3IgPSB0cnVlXG4gICAgICB2XG5cbiAgICBkZXNjcmliZSAndGhhdCBjb250YWlucyB2YWxpZCB2YXJpYWJsZXMnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB2YXJpYWJsZXMgPSBbXG4gICAgICAgICAgY3JlYXRlVmFyICd4JywgJzEwJ1xuICAgICAgICAgIGNyZWF0ZVZhciAneScsICcwLjEnXG4gICAgICAgICAgY3JlYXRlVmFyICd6JywgJzEwJSdcbiAgICAgICAgICBjcmVhdGVDb2xvclZhciAnYycsICdyZ2IoMjU1LDEyNywwKSdcbiAgICAgICAgXVxuXG4gICAgICAgIGNvbG9yVmFyaWFibGVzID0gdmFyaWFibGVzLmZpbHRlciAodikgLT4gdi5pc0NvbG9yXG5cbiAgICAgICAgY29udGV4dCA9IG5ldyBDb2xvckNvbnRleHQoe3ZhcmlhYmxlcywgY29sb3JWYXJpYWJsZXMsIHJlZ2lzdHJ5fSlcblxuICAgICAgaXRQYXJzZXMoJ3gnKS5hc0ludCgxMClcbiAgICAgIGl0UGFyc2VzKCd5JykuYXNGbG9hdCgwLjEpXG4gICAgICBpdFBhcnNlcygneicpLmFzSW50T3JQZXJjZW50KDI2KVxuICAgICAgaXRQYXJzZXMoJ3onKS5hc0Zsb2F0T3JQZXJjZW50KDAuMSlcblxuICAgICAgaXRQYXJzZXMoJ2MnKS5hc0NvbG9yRXhwcmVzc2lvbigncmdiKDI1NSwxMjcsMCknKVxuICAgICAgaXRQYXJzZXMoJ2MnKS5hc0NvbG9yKDI1NSwgMTI3LCAwKVxuXG4gICAgZGVzY3JpYmUgJ3RoYXQgY29udGFpbnMgYWxpYXMgZm9yIG5hbWVkIGNvbG9ycycsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHZhcmlhYmxlcyA9W1xuICAgICAgICAgIGNyZWF0ZUNvbG9yVmFyICckdGV4dC1jb2xvcicsICd3aGl0ZScsICcvcGF0aC90by9maWxlLmNzcy5zYXNzJ1xuICAgICAgICAgIGNyZWF0ZUNvbG9yVmFyICckYmFja2dyb3VuZC1jb2xvcicsICdibGFjaycsICcvcGF0aC90by9maWxlLmNzcy5zYXNzJ1xuICAgICAgICBdXG5cbiAgICAgICAgY29sb3JWYXJpYWJsZXMgPSB2YXJpYWJsZXMuZmlsdGVyICh2KSAtPiB2LmlzQ29sb3JcblxuICAgICAgICBjb250ZXh0ID0gbmV3IENvbG9yQ29udGV4dCh7dmFyaWFibGVzLCBjb2xvclZhcmlhYmxlcywgcmVnaXN0cnl9KVxuXG4gICAgICBpdFBhcnNlcygnJHRleHQtY29sb3InKS5hc0NvbG9yKDI1NSwyNTUsMjU1KVxuICAgICAgaXRQYXJzZXMoJyRiYWNrZ3JvdW5kLWNvbG9yJykuYXNDb2xvcigwLDAsMClcblxuICAgIGRlc2NyaWJlICd0aGF0IGNvbnRhaW5zIGludmFsaWQgY29sb3JzJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgdmFyaWFibGVzID1bXG4gICAgICAgICAgY3JlYXRlVmFyICdAdGV4dC1oZWlnaHQnLCAnQHNjYWxlLWIteHhsICogMXJlbSdcbiAgICAgICAgICBjcmVhdGVWYXIgJ0Bjb21wb25lbnQtbGluZS1oZWlnaHQnLCAnQHRleHQtaGVpZ2h0J1xuICAgICAgICAgIGNyZWF0ZVZhciAnQGxpc3QtaXRlbS1oZWlnaHQnLCAnQGNvbXBvbmVudC1saW5lLWhlaWdodCdcbiAgICAgICAgXVxuXG4gICAgICAgIGNvbnRleHQgPSBuZXcgQ29sb3JDb250ZXh0KHt2YXJpYWJsZXMsIHJlZ2lzdHJ5fSlcblxuICAgICAgaXRQYXJzZXMoJ0BsaXN0LWl0ZW0taGVpZ2h0JykuYXNVbmRlZmluZWRDb2xvcigpXG5cbiAgICBkZXNjcmliZSAndGhhdCBjb250YWlucyBjaXJjdWxhciByZWZlcmVuY2VzJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgdmFyaWFibGVzID1bXG4gICAgICAgICAgY3JlYXRlVmFyICdAZm9vJywgJ0BiYXInXG4gICAgICAgICAgY3JlYXRlVmFyICdAYmFyJywgJ0BiYXonXG4gICAgICAgICAgY3JlYXRlVmFyICdAYmF6JywgJ0Bmb28nXG4gICAgICAgICAgY3JlYXRlVmFyICdAdGF6JywgJ0B0YXonXG4gICAgICAgIF1cblxuICAgICAgICBjb250ZXh0ID0gbmV3IENvbG9yQ29udGV4dCh7dmFyaWFibGVzLCByZWdpc3RyeX0pXG5cbiAgICAgIGl0UGFyc2VzKCdAZm9vJykuYXNVbmRlZmluZWQoKVxuICAgICAgaXRQYXJzZXMoJ0B0YXonKS5hc1VuZGVmaW5lZCgpXG5cbiAgICBkZXNjcmliZSAndGhhdCBjb250YWlucyBjaXJjdWxhciByZWZlcmVuY2VzJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgdmFyaWFibGVzID1bXG4gICAgICAgICAgY3JlYXRlQ29sb3JWYXIgJ0Bmb28nLCAnQGJhcidcbiAgICAgICAgICBjcmVhdGVDb2xvclZhciAnQGJhcicsICdAYmF6J1xuICAgICAgICAgIGNyZWF0ZUNvbG9yVmFyICdAYmF6JywgJ0Bmb28nXG4gICAgICAgICAgY3JlYXRlQ29sb3JWYXIgJ0B0YXonLCAnQHRheidcbiAgICAgICAgXVxuXG4gICAgICAgIGNvbG9yVmFyaWFibGVzID0gdmFyaWFibGVzLmZpbHRlciAodikgLT4gdi5pc0NvbG9yXG5cbiAgICAgICAgY29udGV4dCA9IG5ldyBDb2xvckNvbnRleHQoe3ZhcmlhYmxlcywgY29sb3JWYXJpYWJsZXMsIHJlZ2lzdHJ5fSlcblxuICAgICAgaXRQYXJzZXMoJ0Bmb28nKS5hc0ludmFsaWRDb2xvcigpXG4gICAgICBpdFBhcnNlcygnQGZvbycpLmFzVW5kZWZpbmVkKClcbiAgICAgIGl0UGFyc2VzKCdAdGF6JykuYXNVbmRlZmluZWQoKVxuXG4gICAgZGVzY3JpYmUgJ3RoYXQgY29udGFpbnMgY2lyY3VsYXIgcmVmZXJlbmNlcyBuZXN0ZWQgaW4gb3BlcmF0aW9ucycsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHZhcmlhYmxlcyA9W1xuICAgICAgICAgIGNyZWF0ZUNvbG9yVmFyICdAZm9vJywgJ2NvbXBsZW1lbnQoQGJhciknXG4gICAgICAgICAgY3JlYXRlQ29sb3JWYXIgJ0BiYXInLCAndHJhbnNwYXJlbnRpemUoQGJheiwgMC41KSdcbiAgICAgICAgICBjcmVhdGVDb2xvclZhciAnQGJheicsICdkYXJrZW4oQGZvbywgMTAlKSdcbiAgICAgICAgXVxuXG4gICAgICAgIGNvbG9yVmFyaWFibGVzID0gdmFyaWFibGVzLmZpbHRlciAodikgLT4gdi5pc0NvbG9yXG5cbiAgICAgICAgY29udGV4dCA9IG5ldyBDb2xvckNvbnRleHQoe3ZhcmlhYmxlcywgY29sb3JWYXJpYWJsZXMsIHJlZ2lzdHJ5fSlcblxuICAgICAgaXRQYXJzZXMoJ0Bmb28nKS5hc0ludmFsaWRDb2xvcigpXG5cbiAgZGVzY3JpYmUgJ3dpdGggdmFyaWFibGVzIGZyb20gYSBkZWZhdWx0IGZpbGUnLCAtPlxuICAgIFtwcm9qZWN0UGF0aCwgcmVmZXJlbmNlVmFyaWFibGVdID0gW11cbiAgICBjcmVhdGVWYXIgPSAobmFtZSwgdmFsdWUsIHBhdGgsIGlzRGVmYXVsdD1mYWxzZSkgLT5cbiAgICAgIHBhdGggPz0gXCIje3Byb2plY3RQYXRofS9maWxlLnN0eWxcIlxuICAgICAge3ZhbHVlLCBuYW1lLCBwYXRoLCBkZWZhdWx0OiBpc0RlZmF1bHR9XG5cbiAgICBjcmVhdGVDb2xvclZhciA9IChuYW1lLCB2YWx1ZSwgcGF0aCwgaXNEZWZhdWx0KSAtPlxuICAgICAgdiA9IGNyZWF0ZVZhcihuYW1lLCB2YWx1ZSwgcGF0aCwgaXNEZWZhdWx0KVxuICAgICAgdi5pc0NvbG9yID0gdHJ1ZVxuICAgICAgdlxuXG4gICAgZGVzY3JpYmUgJ3doZW4gdGhlcmUgaXMgYW5vdGhlciB2YWxpZCB2YWx1ZScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgICAgcmVmZXJlbmNlVmFyaWFibGUgPSBjcmVhdGVWYXIgJ2EnLCAnYicsIFwiI3twcm9qZWN0UGF0aH0vYS5zdHlsXCJcblxuICAgICAgICB2YXJpYWJsZXMgPSBbXG4gICAgICAgICAgcmVmZXJlbmNlVmFyaWFibGVcbiAgICAgICAgICBjcmVhdGVWYXIgJ2InLCAnMTAnLCBcIiN7cHJvamVjdFBhdGh9L2Iuc3R5bFwiLCB0cnVlXG4gICAgICAgICAgY3JlYXRlVmFyICdiJywgJzIwJywgXCIje3Byb2plY3RQYXRofS9iLnN0eWxcIlxuICAgICAgICBdXG5cbiAgICAgICAgY29sb3JWYXJpYWJsZXMgPSB2YXJpYWJsZXMuZmlsdGVyICh2KSAtPiB2LmlzQ29sb3JcblxuICAgICAgICBjb250ZXh0ID0gbmV3IENvbG9yQ29udGV4dCh7XG4gICAgICAgICAgcmVnaXN0cnlcbiAgICAgICAgICB2YXJpYWJsZXNcbiAgICAgICAgICBjb2xvclZhcmlhYmxlc1xuICAgICAgICAgIHJlZmVyZW5jZVZhcmlhYmxlXG4gICAgICAgICAgcm9vdFBhdGhzOiBbcHJvamVjdFBhdGhdXG4gICAgICAgIH0pXG5cbiAgICAgIGl0UGFyc2VzKCdhJykuYXNJbnQoMjApXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGVyZSBpcyBubyBhbm90aGVyIHZhbGlkIHZhbHVlJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXVxuICAgICAgICByZWZlcmVuY2VWYXJpYWJsZSA9IGNyZWF0ZVZhciAnYScsICdiJywgXCIje3Byb2plY3RQYXRofS9hLnN0eWxcIlxuXG4gICAgICAgIHZhcmlhYmxlcyA9IFtcbiAgICAgICAgICByZWZlcmVuY2VWYXJpYWJsZVxuICAgICAgICAgIGNyZWF0ZVZhciAnYicsICcxMCcsIFwiI3twcm9qZWN0UGF0aH0vYi5zdHlsXCIsIHRydWVcbiAgICAgICAgICBjcmVhdGVWYXIgJ2InLCAnYycsIFwiI3twcm9qZWN0UGF0aH0vYi5zdHlsXCJcbiAgICAgICAgXVxuXG4gICAgICAgIGNvbG9yVmFyaWFibGVzID0gdmFyaWFibGVzLmZpbHRlciAodikgLT4gdi5pc0NvbG9yXG5cbiAgICAgICAgY29udGV4dCA9IG5ldyBDb2xvckNvbnRleHQoe1xuICAgICAgICAgIHJlZ2lzdHJ5XG4gICAgICAgICAgdmFyaWFibGVzXG4gICAgICAgICAgY29sb3JWYXJpYWJsZXNcbiAgICAgICAgICByZWZlcmVuY2VWYXJpYWJsZVxuICAgICAgICAgIHJvb3RQYXRoczogW3Byb2plY3RQYXRoXVxuICAgICAgICB9KVxuXG4gICAgICBpdFBhcnNlcygnYScpLmFzSW50KDEwKVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gdGhlcmUgaXMgYW5vdGhlciB2YWxpZCBjb2xvcicsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgICAgcmVmZXJlbmNlVmFyaWFibGUgPSBjcmVhdGVDb2xvclZhciAnYScsICdiJywgXCIje3Byb2plY3RQYXRofS9hLnN0eWxcIlxuXG4gICAgICAgIHZhcmlhYmxlcyA9IFtcbiAgICAgICAgICByZWZlcmVuY2VWYXJpYWJsZVxuICAgICAgICAgIGNyZWF0ZUNvbG9yVmFyICdiJywgJyNmZjAwMDAnLCBcIiN7cHJvamVjdFBhdGh9L2Iuc3R5bFwiLCB0cnVlXG4gICAgICAgICAgY3JlYXRlQ29sb3JWYXIgJ2InLCAnIzAwMDBmZicsIFwiI3twcm9qZWN0UGF0aH0vYi5zdHlsXCJcbiAgICAgICAgXVxuXG4gICAgICAgIGNvbG9yVmFyaWFibGVzID0gdmFyaWFibGVzLmZpbHRlciAodikgLT4gdi5pc0NvbG9yXG5cbiAgICAgICAgY29udGV4dCA9IG5ldyBDb2xvckNvbnRleHQoe1xuICAgICAgICAgIHJlZ2lzdHJ5XG4gICAgICAgICAgdmFyaWFibGVzXG4gICAgICAgICAgY29sb3JWYXJpYWJsZXNcbiAgICAgICAgICByZWZlcmVuY2VWYXJpYWJsZVxuICAgICAgICAgIHJvb3RQYXRoczogW3Byb2plY3RQYXRoXVxuICAgICAgICB9KVxuXG4gICAgICBpdFBhcnNlcygnYScpLmFzQ29sb3IoMCwgMCwgMjU1KVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gdGhlcmUgaXMgbm8gYW5vdGhlciB2YWxpZCBjb2xvcicsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgICAgcmVmZXJlbmNlVmFyaWFibGUgPSBjcmVhdGVDb2xvclZhciAnYScsICdiJywgXCIje3Byb2plY3RQYXRofS9hLnN0eWxcIlxuXG4gICAgICAgIHZhcmlhYmxlcyA9IFtcbiAgICAgICAgICByZWZlcmVuY2VWYXJpYWJsZVxuICAgICAgICAgIGNyZWF0ZUNvbG9yVmFyICdiJywgJyNmZjAwMDAnLCBcIiN7cHJvamVjdFBhdGh9L2Iuc3R5bFwiLCB0cnVlXG4gICAgICAgICAgY3JlYXRlQ29sb3JWYXIgJ2InLCAnYycsIFwiI3twcm9qZWN0UGF0aH0vYi5zdHlsXCJcbiAgICAgICAgXVxuXG4gICAgICAgIGNvbG9yVmFyaWFibGVzID0gdmFyaWFibGVzLmZpbHRlciAodikgLT4gdi5pc0NvbG9yXG5cbiAgICAgICAgY29udGV4dCA9IG5ldyBDb2xvckNvbnRleHQoe1xuICAgICAgICAgIHJlZ2lzdHJ5XG4gICAgICAgICAgdmFyaWFibGVzXG4gICAgICAgICAgY29sb3JWYXJpYWJsZXNcbiAgICAgICAgICByZWZlcmVuY2VWYXJpYWJsZVxuICAgICAgICAgIHJvb3RQYXRoczogW3Byb2plY3RQYXRoXVxuICAgICAgICB9KVxuXG4gICAgICBpdFBhcnNlcygnYScpLmFzQ29sb3IoMjU1LCAwLCAwKVxuXG4gIGRlc2NyaWJlICd3aXRoIGEgcmVmZXJlbmNlIHZhcmlhYmxlJywgLT5cbiAgICBbcHJvamVjdFBhdGgsIHJlZmVyZW5jZVZhcmlhYmxlXSA9IFtdXG4gICAgY3JlYXRlVmFyID0gKG5hbWUsIHZhbHVlLCBwYXRoKSAtPlxuICAgICAgcGF0aCA/PSBcIiN7cHJvamVjdFBhdGh9L2ZpbGUuc3R5bFwiXG4gICAgICB7dmFsdWUsIG5hbWUsIHBhdGh9XG5cbiAgICBjcmVhdGVDb2xvclZhciA9IChuYW1lLCB2YWx1ZSkgLT5cbiAgICAgIHYgPSBjcmVhdGVWYXIobmFtZSwgdmFsdWUpXG4gICAgICB2LmlzQ29sb3IgPSB0cnVlXG4gICAgICB2XG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGVyZSBpcyBhIHNpbmdsZSByb290IHBhdGgnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICAgIHJlZmVyZW5jZVZhcmlhYmxlID0gY3JlYXRlVmFyICdhJywgJzEwJywgXCIje3Byb2plY3RQYXRofS9hLnN0eWxcIlxuXG4gICAgICAgIHZhcmlhYmxlcyA9IFtcbiAgICAgICAgICByZWZlcmVuY2VWYXJpYWJsZVxuICAgICAgICAgIGNyZWF0ZVZhciAnYScsICcyMCcsIFwiI3twcm9qZWN0UGF0aH0vYi5zdHlsXCJcbiAgICAgICAgXVxuXG4gICAgICAgIGNvbG9yVmFyaWFibGVzID0gdmFyaWFibGVzLmZpbHRlciAodikgLT4gdi5pc0NvbG9yXG5cbiAgICAgICAgY29udGV4dCA9IG5ldyBDb2xvckNvbnRleHQoe1xuICAgICAgICAgIHJlZ2lzdHJ5XG4gICAgICAgICAgdmFyaWFibGVzXG4gICAgICAgICAgY29sb3JWYXJpYWJsZXNcbiAgICAgICAgICByZWZlcmVuY2VWYXJpYWJsZVxuICAgICAgICAgIHJvb3RQYXRoczogW3Byb2plY3RQYXRoXVxuICAgICAgICB9KVxuXG4gICAgICBpdFBhcnNlcygnYScpLmFzSW50KDEwKVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gdGhlcmUgYXJlIG1hbnkgcm9vdCBwYXRocycsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgICAgcmVmZXJlbmNlVmFyaWFibGUgPSBjcmVhdGVWYXIgJ2EnLCAnYicsIFwiI3twcm9qZWN0UGF0aH0vYS5zdHlsXCJcblxuICAgICAgICB2YXJpYWJsZXMgPSBbXG4gICAgICAgICAgcmVmZXJlbmNlVmFyaWFibGVcbiAgICAgICAgICBjcmVhdGVWYXIgJ2InLCAnMTAnLCBcIiN7cHJvamVjdFBhdGh9L2Iuc3R5bFwiXG4gICAgICAgICAgY3JlYXRlVmFyICdiJywgJzIwJywgXCIje3Byb2plY3RQYXRofTIvYi5zdHlsXCJcbiAgICAgICAgXVxuXG4gICAgICAgIGNvbG9yVmFyaWFibGVzID0gdmFyaWFibGVzLmZpbHRlciAodikgLT4gdi5pc0NvbG9yXG5cbiAgICAgICAgY29udGV4dCA9IG5ldyBDb2xvckNvbnRleHQoe1xuICAgICAgICAgIHJlZ2lzdHJ5XG4gICAgICAgICAgdmFyaWFibGVzXG4gICAgICAgICAgY29sb3JWYXJpYWJsZXNcbiAgICAgICAgICByZWZlcmVuY2VWYXJpYWJsZVxuICAgICAgICAgIHJvb3RQYXRoczogW3Byb2plY3RQYXRoLCBcIiN7cHJvamVjdFBhdGh9MlwiXVxuICAgICAgICB9KVxuXG4gICAgICBpdFBhcnNlcygnYScpLmFzSW50KDEwKVxuXG4gIGRlc2NyaWJlICd3aXRoIGEgcmVmZXJlbmNlIHBhdGgnLCAtPlxuICAgIFtwcm9qZWN0UGF0aCwgcmVmZXJlbmNlVmFyaWFibGVdID0gW11cbiAgICBjcmVhdGVWYXIgPSAobmFtZSwgdmFsdWUsIHBhdGgpIC0+XG4gICAgICBwYXRoID89IFwiI3twcm9qZWN0UGF0aH0vZmlsZS5zdHlsXCJcbiAgICAgIHt2YWx1ZSwgbmFtZSwgcGF0aH1cblxuICAgIGNyZWF0ZUNvbG9yVmFyID0gKG5hbWUsIHZhbHVlKSAtPlxuICAgICAgdiA9IGNyZWF0ZVZhcihuYW1lLCB2YWx1ZSlcbiAgICAgIHYuaXNDb2xvciA9IHRydWVcbiAgICAgIHZcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZXJlIGlzIGEgc2luZ2xlIHJvb3QgcGF0aCcsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgICAgcmVmZXJlbmNlVmFyaWFibGUgPSBjcmVhdGVWYXIgJ2EnLCAnMTAnLCBcIiN7cHJvamVjdFBhdGh9L2Euc3R5bFwiXG5cbiAgICAgICAgdmFyaWFibGVzID0gW1xuICAgICAgICAgIHJlZmVyZW5jZVZhcmlhYmxlXG4gICAgICAgICAgY3JlYXRlVmFyICdhJywgJzIwJywgXCIje3Byb2plY3RQYXRofS9iLnN0eWxcIlxuICAgICAgICBdXG5cbiAgICAgICAgY29sb3JWYXJpYWJsZXMgPSB2YXJpYWJsZXMuZmlsdGVyICh2KSAtPiB2LmlzQ29sb3JcblxuICAgICAgICBjb250ZXh0ID0gbmV3IENvbG9yQ29udGV4dCh7XG4gICAgICAgICAgcmVnaXN0cnlcbiAgICAgICAgICB2YXJpYWJsZXNcbiAgICAgICAgICBjb2xvclZhcmlhYmxlc1xuICAgICAgICAgIHJlZmVyZW5jZVBhdGg6IFwiI3twcm9qZWN0UGF0aH0vYS5zdHlsXCJcbiAgICAgICAgICByb290UGF0aHM6IFtwcm9qZWN0UGF0aF1cbiAgICAgICAgfSlcblxuICAgICAgaXRQYXJzZXMoJ2EnKS5hc0ludCgxMClcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZXJlIGFyZSBtYW55IHJvb3QgcGF0aHMnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICAgIHJlZmVyZW5jZVZhcmlhYmxlID0gY3JlYXRlVmFyICdhJywgJ2InLCBcIiN7cHJvamVjdFBhdGh9L2Euc3R5bFwiXG5cbiAgICAgICAgdmFyaWFibGVzID0gW1xuICAgICAgICAgIHJlZmVyZW5jZVZhcmlhYmxlXG4gICAgICAgICAgY3JlYXRlVmFyICdiJywgJzEwJywgXCIje3Byb2plY3RQYXRofS9iLnN0eWxcIlxuICAgICAgICAgIGNyZWF0ZVZhciAnYicsICcyMCcsIFwiI3twcm9qZWN0UGF0aH0yL2Iuc3R5bFwiXG4gICAgICAgIF1cblxuICAgICAgICBjb2xvclZhcmlhYmxlcyA9IHZhcmlhYmxlcy5maWx0ZXIgKHYpIC0+IHYuaXNDb2xvclxuXG4gICAgICAgIGNvbnRleHQgPSBuZXcgQ29sb3JDb250ZXh0KHtcbiAgICAgICAgICByZWdpc3RyeVxuICAgICAgICAgIHZhcmlhYmxlc1xuICAgICAgICAgIGNvbG9yVmFyaWFibGVzXG4gICAgICAgICAgcmVmZXJlbmNlUGF0aDogXCIje3Byb2plY3RQYXRofS9hLnN0eWxcIlxuICAgICAgICAgIHJvb3RQYXRoczogW3Byb2plY3RQYXRoLCBcIiN7cHJvamVjdFBhdGh9MlwiXVxuICAgICAgICB9KVxuXG4gICAgICBpdFBhcnNlcygnYScpLmFzSW50KDEwKVxuIl19
