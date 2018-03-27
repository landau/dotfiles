(function() {
  var Color, Palette, THEME_VARIABLES, change, click, ref;

  Color = require('../lib/color');

  Palette = require('../lib/palette');

  THEME_VARIABLES = require('../lib/uris').THEME_VARIABLES;

  ref = require('./helpers/events'), change = ref.change, click = ref.click;

  describe('PaletteElement', function() {
    var createVar, nextID, palette, paletteElement, pigments, project, ref1, workspaceElement;
    ref1 = [0], nextID = ref1[0], palette = ref1[1], paletteElement = ref1[2], workspaceElement = ref1[3], pigments = ref1[4], project = ref1[5];
    createVar = function(name, color, path, line, isAlternate) {
      if (isAlternate == null) {
        isAlternate = false;
      }
      return {
        name: name,
        color: color,
        path: path,
        line: line,
        id: nextID++,
        isAlternate: isAlternate
      };
    };
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      atom.config.set('pigments.sourceNames', ['*.styl', '*.less']);
      waitsForPromise(function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          pigments = pkg.mainModule;
          return project = pigments.getProject();
        });
      });
      return waitsForPromise(function() {
        return project.initialize();
      });
    });
    afterEach(function() {
      return project.destroy();
    });
    describe('as a view provider', function() {
      beforeEach(function() {
        palette = new Palette([createVar('red', new Color('#ff0000'), 'file.styl', 0), createVar('green', new Color('#00ff00'), 'file.styl', 1), createVar('blue', new Color('#0000ff'), 'file.styl', 2), createVar('redCopy', new Color('#ff0000'), 'file.styl', 3), createVar('red_copy', new Color('#ff0000'), 'file.styl', 3, true), createVar('red', new Color('#ff0000'), THEME_VARIABLES, 0)]);
        paletteElement = atom.views.getView(palette);
        return jasmine.attachToDOM(paletteElement);
      });
      it('is associated with the Palette model', function() {
        return expect(paletteElement).toBeDefined();
      });
      it('does not render alernate form of a variable', function() {
        return expect(paletteElement.querySelectorAll('li').length).toEqual(5);
      });
      return it('does not render the file link when the variable comes from a theme', function() {
        return expect(paletteElement.querySelectorAll('li')[4].querySelector(' [data-variable-id]')).not.toExist();
      });
    });
    describe('when pigments:show-palette commands is triggered', function() {
      beforeEach(function() {
        atom.commands.dispatch(workspaceElement, 'pigments:show-palette');
        waitsFor(function() {
          return paletteElement = workspaceElement.querySelector('pigments-palette');
        });
        return runs(function() {
          palette = paletteElement.getModel();
          return jasmine.attachToDOM(paletteElement);
        });
      });
      it('opens a palette element', function() {
        return expect(paletteElement).toBeDefined();
      });
      it('creates as many list item as there is colors in the project', function() {
        expect(paletteElement.querySelectorAll('li').length).not.toEqual(0);
        return expect(paletteElement.querySelectorAll('li').length).toEqual(palette.variables.filter(function(v) {
          return !v.isAlternate;
        }).length);
      });
      it('binds colors with project variables', function() {
        var li, projectVariables;
        projectVariables = project.getColorVariables();
        li = paletteElement.querySelector('li');
        return expect(li.querySelector('.path').textContent).toEqual(atom.project.relativize(projectVariables[0].path));
      });
      describe('clicking on a result path', function() {
        return it('shows the variable in its file', function() {
          var pathElement;
          spyOn(project, 'showVariableInFile');
          pathElement = paletteElement.querySelector('[data-variable-id]');
          click(pathElement);
          return waitsFor(function() {
            return project.showVariableInFile.callCount > 0;
          });
        });
      });
      describe('when the sortPaletteColors settings is set to color', function() {
        beforeEach(function() {
          return atom.config.set('pigments.sortPaletteColors', 'by color');
        });
        return it('reorders the colors', function() {
          var i, j, len, lis, name, results, sortedColors;
          sortedColors = project.getPalette().sortedByColor().filter(function(v) {
            return !v.isAlternate;
          });
          lis = paletteElement.querySelectorAll('li');
          results = [];
          for (i = j = 0, len = sortedColors.length; j < len; i = ++j) {
            name = sortedColors[i].name;
            results.push(expect(lis[i].querySelector('.name').textContent).toEqual(name));
          }
          return results;
        });
      });
      describe('when the sortPaletteColors settings is set to name', function() {
        beforeEach(function() {
          return atom.config.set('pigments.sortPaletteColors', 'by name');
        });
        return it('reorders the colors', function() {
          var i, j, len, lis, name, results, sortedColors;
          sortedColors = project.getPalette().sortedByName().filter(function(v) {
            return !v.isAlternate;
          });
          lis = paletteElement.querySelectorAll('li');
          results = [];
          for (i = j = 0, len = sortedColors.length; j < len; i = ++j) {
            name = sortedColors[i].name;
            results.push(expect(lis[i].querySelector('.name').textContent).toEqual(name));
          }
          return results;
        });
      });
      describe('when the groupPaletteColors setting is set to file', function() {
        beforeEach(function() {
          return atom.config.set('pigments.groupPaletteColors', 'by file');
        });
        it('renders the list with sublists for each files', function() {
          var ols;
          ols = paletteElement.querySelectorAll('ol ol');
          return expect(ols.length).toEqual(5);
        });
        it('adds a header with the file path for each sublist', function() {
          var ols;
          ols = paletteElement.querySelectorAll('.pigments-color-group-header');
          return expect(ols.length).toEqual(5);
        });
        describe('and the sortPaletteColors is set to name', function() {
          beforeEach(function() {
            return atom.config.set('pigments.sortPaletteColors', 'by name');
          });
          return it('sorts the nested list items', function() {
            var file, i, lis, n, name, ol, ols, palettes, results, sortedColors;
            palettes = paletteElement.getFilesPalettes();
            ols = paletteElement.querySelectorAll('.pigments-color-group');
            n = 0;
            results = [];
            for (file in palettes) {
              palette = palettes[file];
              ol = ols[n++];
              lis = ol.querySelectorAll('li');
              sortedColors = palette.sortedByName().filter(function(v) {
                return !v.isAlternate;
              });
              results.push((function() {
                var j, len, results1;
                results1 = [];
                for (i = j = 0, len = sortedColors.length; j < len; i = ++j) {
                  name = sortedColors[i].name;
                  results1.push(expect(lis[i].querySelector('.name').textContent).toEqual(name));
                }
                return results1;
              })());
            }
            return results;
          });
        });
        return describe('when the mergeColorDuplicates', function() {
          beforeEach(function() {
            return atom.config.set('pigments.mergeColorDuplicates', true);
          });
          return it('groups identical colors together', function() {
            var lis;
            lis = paletteElement.querySelectorAll('li');
            return expect(lis.length).toEqual(40);
          });
        });
      });
      describe('sorting selector', function() {
        var sortSelect;
        sortSelect = [][0];
        return describe('when changed', function() {
          beforeEach(function() {
            sortSelect = paletteElement.querySelector('#sort-palette-colors');
            sortSelect.querySelector('option[value="by name"]').setAttribute('selected', 'selected');
            return change(sortSelect);
          });
          return it('changes the settings value', function() {
            return expect(atom.config.get('pigments.sortPaletteColors')).toEqual('by name');
          });
        });
      });
      return describe('grouping selector', function() {
        var groupSelect;
        groupSelect = [][0];
        return describe('when changed', function() {
          beforeEach(function() {
            groupSelect = paletteElement.querySelector('#group-palette-colors');
            groupSelect.querySelector('option[value="by file"]').setAttribute('selected', 'selected');
            return change(groupSelect);
          });
          return it('changes the settings value', function() {
            return expect(atom.config.get('pigments.groupPaletteColors')).toEqual('by file');
          });
        });
      });
    });
    describe('when the palette settings differs from defaults', function() {
      beforeEach(function() {
        atom.config.set('pigments.sortPaletteColors', 'by name');
        atom.config.set('pigments.groupPaletteColors', 'by file');
        return atom.config.set('pigments.mergeColorDuplicates', true);
      });
      return describe('when pigments:show-palette commands is triggered', function() {
        beforeEach(function() {
          atom.commands.dispatch(workspaceElement, 'pigments:show-palette');
          waitsFor(function() {
            return paletteElement = workspaceElement.querySelector('pigments-palette');
          });
          return runs(function() {
            return palette = paletteElement.getModel();
          });
        });
        describe('the sorting selector', function() {
          return it('selects the current value', function() {
            var sortSelect;
            sortSelect = paletteElement.querySelector('#sort-palette-colors');
            return expect(sortSelect.querySelector('option[selected]').value).toEqual('by name');
          });
        });
        describe('the grouping selector', function() {
          return it('selects the current value', function() {
            var groupSelect;
            groupSelect = paletteElement.querySelector('#group-palette-colors');
            return expect(groupSelect.querySelector('option[selected]').value).toEqual('by file');
          });
        });
        return it('checks the merge checkbox', function() {
          var mergeCheckBox;
          mergeCheckBox = paletteElement.querySelector('#merge-duplicates');
          return expect(mergeCheckBox.checked).toBeTruthy();
        });
      });
    });
    return describe('when the project variables are modified', function() {
      var initialColorCount, ref2, spy;
      ref2 = [], spy = ref2[0], initialColorCount = ref2[1];
      beforeEach(function() {
        atom.commands.dispatch(workspaceElement, 'pigments:show-palette');
        waitsFor(function() {
          return paletteElement = workspaceElement.querySelector('pigments-palette');
        });
        runs(function() {
          palette = paletteElement.getModel();
          initialColorCount = palette.getColorsCount();
          spy = jasmine.createSpy('onDidUpdateVariables');
          project.onDidUpdateVariables(spy);
          return atom.config.set('pigments.sourceNames', ['*.styl', '*.less', '*.sass']);
        });
        return waitsFor(function() {
          return spy.callCount > 0;
        });
      });
      return it('updates the palette', function() {
        var lis;
        expect(palette.getColorsCount()).not.toEqual(initialColorCount);
        lis = paletteElement.querySelectorAll('li');
        return expect(lis.length).not.toEqual(initialColorCount);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9wYWxldHRlLWVsZW1lbnQtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsY0FBUjs7RUFDUixPQUFBLEdBQVUsT0FBQSxDQUFRLGdCQUFSOztFQUNULGtCQUFtQixPQUFBLENBQVEsYUFBUjs7RUFDcEIsTUFBa0IsT0FBQSxDQUFRLGtCQUFSLENBQWxCLEVBQUMsbUJBQUQsRUFBUzs7RUFFVCxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQTtBQUN6QixRQUFBO0lBQUEsT0FBeUUsQ0FBQyxDQUFELENBQXpFLEVBQUMsZ0JBQUQsRUFBUyxpQkFBVCxFQUFrQix3QkFBbEIsRUFBa0MsMEJBQWxDLEVBQW9ELGtCQUFwRCxFQUE4RDtJQUU5RCxTQUFBLEdBQVksU0FBQyxJQUFELEVBQU8sS0FBUCxFQUFjLElBQWQsRUFBb0IsSUFBcEIsRUFBMEIsV0FBMUI7O1FBQTBCLGNBQVk7O2FBQ2hEO1FBQUMsTUFBQSxJQUFEO1FBQU8sT0FBQSxLQUFQO1FBQWMsTUFBQSxJQUFkO1FBQW9CLE1BQUEsSUFBcEI7UUFBMEIsRUFBQSxFQUFJLE1BQUEsRUFBOUI7UUFBd0MsYUFBQSxXQUF4Qzs7SUFEVTtJQUdaLFVBQUEsQ0FBVyxTQUFBO01BQ1QsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QjtNQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0JBQWhCLEVBQXdDLENBQ3RDLFFBRHNDLEVBRXRDLFFBRnNDLENBQXhDO01BS0EsZUFBQSxDQUFnQixTQUFBO2VBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFVBQTlCLENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsU0FBQyxH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QSxHQUFNLE9BQU8sQ0FBQyxTQUFSLENBQWtCLHNCQUFsQjtVQUVOLE9BQU8sQ0FBQyxvQkFBUixDQUE2QixHQUE3QjtpQkFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0JBQWhCLEVBQXdDLENBQ3RDLFFBRHNDLEVBRXRDLFFBRnNDLEVBR3RDLFFBSHNDLENBQXhDO1FBUEcsQ0FBTDtlQWFBLFFBQUEsQ0FBUyxTQUFBO2lCQUFHLEdBQUcsQ0FBQyxTQUFKLEdBQWdCO1FBQW5CLENBQVQ7TUFuQlMsQ0FBWDthQXFCQSxFQUFBLENBQUcscUJBQUgsRUFBMEIsU0FBQTtBQUN4QixZQUFBO1FBQUEsTUFBQSxDQUFPLE9BQU8sQ0FBQyxjQUFSLENBQUEsQ0FBUCxDQUFnQyxDQUFDLEdBQUcsQ0FBQyxPQUFyQyxDQUE2QyxpQkFBN0M7UUFFQSxHQUFBLEdBQU0sY0FBYyxDQUFDLGdCQUFmLENBQWdDLElBQWhDO2VBRU4sTUFBQSxDQUFPLEdBQUcsQ0FBQyxNQUFYLENBQWtCLENBQUMsR0FBRyxDQUFDLE9BQXZCLENBQStCLGlCQUEvQjtNQUx3QixDQUExQjtJQXZCa0QsQ0FBcEQ7RUFuTXlCLENBQTNCO0FBTEEiLCJzb3VyY2VzQ29udGVudCI6WyJDb2xvciA9IHJlcXVpcmUgJy4uL2xpYi9jb2xvcidcblBhbGV0dGUgPSByZXF1aXJlICcuLi9saWIvcGFsZXR0ZSdcbntUSEVNRV9WQVJJQUJMRVN9ID0gcmVxdWlyZSAnLi4vbGliL3VyaXMnXG57Y2hhbmdlLCBjbGlja30gPSByZXF1aXJlICcuL2hlbHBlcnMvZXZlbnRzJ1xuXG5kZXNjcmliZSAnUGFsZXR0ZUVsZW1lbnQnLCAtPlxuICBbbmV4dElELCBwYWxldHRlLCBwYWxldHRlRWxlbWVudCwgd29ya3NwYWNlRWxlbWVudCwgcGlnbWVudHMsIHByb2plY3RdID0gWzBdXG5cbiAgY3JlYXRlVmFyID0gKG5hbWUsIGNvbG9yLCBwYXRoLCBsaW5lLCBpc0FsdGVybmF0ZT1mYWxzZSkgLT5cbiAgICB7bmFtZSwgY29sb3IsIHBhdGgsIGxpbmUsIGlkOiBuZXh0SUQrKywgaXNBbHRlcm5hdGV9XG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5zb3VyY2VOYW1lcycsIFtcbiAgICAgICcqLnN0eWwnXG4gICAgICAnKi5sZXNzJ1xuICAgIF1cblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgncGlnbWVudHMnKS50aGVuIChwa2cpIC0+XG4gICAgICBwaWdtZW50cyA9IHBrZy5tYWluTW9kdWxlXG4gICAgICBwcm9qZWN0ID0gcGlnbWVudHMuZ2V0UHJvamVjdCgpXG5cbiAgICB3YWl0c0ZvclByb21pc2UgLT4gcHJvamVjdC5pbml0aWFsaXplKClcblxuICBhZnRlckVhY2ggLT5cbiAgICBwcm9qZWN0LmRlc3Ryb3koKVxuXG4gIGRlc2NyaWJlICdhcyBhIHZpZXcgcHJvdmlkZXInLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHBhbGV0dGUgPSBuZXcgUGFsZXR0ZShbXG4gICAgICAgIGNyZWF0ZVZhciAncmVkJywgbmV3IENvbG9yKCcjZmYwMDAwJyksICdmaWxlLnN0eWwnLCAwXG4gICAgICAgIGNyZWF0ZVZhciAnZ3JlZW4nLCBuZXcgQ29sb3IoJyMwMGZmMDAnKSwgJ2ZpbGUuc3R5bCcsIDFcbiAgICAgICAgY3JlYXRlVmFyICdibHVlJywgbmV3IENvbG9yKCcjMDAwMGZmJyksICdmaWxlLnN0eWwnLCAyXG4gICAgICAgIGNyZWF0ZVZhciAncmVkQ29weScsIG5ldyBDb2xvcignI2ZmMDAwMCcpLCAnZmlsZS5zdHlsJywgM1xuICAgICAgICBjcmVhdGVWYXIgJ3JlZF9jb3B5JywgbmV3IENvbG9yKCcjZmYwMDAwJyksICdmaWxlLnN0eWwnLCAzLCB0cnVlXG4gICAgICAgIGNyZWF0ZVZhciAncmVkJywgbmV3IENvbG9yKCcjZmYwMDAwJyksIFRIRU1FX1ZBUklBQkxFUywgMFxuICAgICAgXSlcblxuICAgICAgcGFsZXR0ZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcocGFsZXR0ZSlcbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00ocGFsZXR0ZUVsZW1lbnQpXG5cbiAgICBpdCAnaXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBQYWxldHRlIG1vZGVsJywgLT5cbiAgICAgIGV4cGVjdChwYWxldHRlRWxlbWVudCkudG9CZURlZmluZWQoKVxuXG4gICAgaXQgJ2RvZXMgbm90IHJlbmRlciBhbGVybmF0ZSBmb3JtIG9mIGEgdmFyaWFibGUnLCAtPlxuICAgICAgZXhwZWN0KHBhbGV0dGVFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpJykubGVuZ3RoKS50b0VxdWFsKDUpXG5cbiAgICBpdCAnZG9lcyBub3QgcmVuZGVyIHRoZSBmaWxlIGxpbmsgd2hlbiB0aGUgdmFyaWFibGUgY29tZXMgZnJvbSBhIHRoZW1lJywgLT5cbiAgICAgIGV4cGVjdChwYWxldHRlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdsaScpWzRdLnF1ZXJ5U2VsZWN0b3IoJyBbZGF0YS12YXJpYWJsZS1pZF0nKSkubm90LnRvRXhpc3QoKVxuXG4gIGRlc2NyaWJlICd3aGVuIHBpZ21lbnRzOnNob3ctcGFsZXR0ZSBjb21tYW5kcyBpcyB0cmlnZ2VyZWQnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ3BpZ21lbnRzOnNob3ctcGFsZXR0ZScpXG5cbiAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgIHBhbGV0dGVFbGVtZW50ID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdwaWdtZW50cy1wYWxldHRlJylcblxuICAgICAgcnVucyAtPlxuICAgICAgICBwYWxldHRlID0gcGFsZXR0ZUVsZW1lbnQuZ2V0TW9kZWwoKVxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHBhbGV0dGVFbGVtZW50KVxuXG4gICAgaXQgJ29wZW5zIGEgcGFsZXR0ZSBlbGVtZW50JywgLT5cbiAgICAgIGV4cGVjdChwYWxldHRlRWxlbWVudCkudG9CZURlZmluZWQoKVxuXG4gICAgaXQgJ2NyZWF0ZXMgYXMgbWFueSBsaXN0IGl0ZW0gYXMgdGhlcmUgaXMgY29sb3JzIGluIHRoZSBwcm9qZWN0JywgLT5cbiAgICAgIGV4cGVjdChwYWxldHRlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdsaScpLmxlbmd0aCkubm90LnRvRXF1YWwoMClcbiAgICAgIGV4cGVjdChwYWxldHRlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdsaScpLmxlbmd0aCkudG9FcXVhbChwYWxldHRlLnZhcmlhYmxlcy5maWx0ZXIoKHYpIC0+IG5vdCB2LmlzQWx0ZXJuYXRlKS5sZW5ndGgpXG5cbiAgICBpdCAnYmluZHMgY29sb3JzIHdpdGggcHJvamVjdCB2YXJpYWJsZXMnLCAtPlxuICAgICAgcHJvamVjdFZhcmlhYmxlcyA9IHByb2plY3QuZ2V0Q29sb3JWYXJpYWJsZXMoKVxuXG4gICAgICBsaSA9IHBhbGV0dGVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpJylcbiAgICAgIGV4cGVjdChsaS5xdWVyeVNlbGVjdG9yKCcucGF0aCcpLnRleHRDb250ZW50KS50b0VxdWFsKGF0b20ucHJvamVjdC5yZWxhdGl2aXplKHByb2plY3RWYXJpYWJsZXNbMF0ucGF0aCkpXG5cbiAgICBkZXNjcmliZSAnY2xpY2tpbmcgb24gYSByZXN1bHQgcGF0aCcsIC0+XG4gICAgICBpdCAnc2hvd3MgdGhlIHZhcmlhYmxlIGluIGl0cyBmaWxlJywgLT5cbiAgICAgICAgc3B5T24ocHJvamVjdCwgJ3Nob3dWYXJpYWJsZUluRmlsZScpXG5cbiAgICAgICAgcGF0aEVsZW1lbnQgPSBwYWxldHRlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS12YXJpYWJsZS1pZF0nKVxuXG4gICAgICAgIGNsaWNrKHBhdGhFbGVtZW50KVxuXG4gICAgICAgIHdhaXRzRm9yIC0+IHByb2plY3Quc2hvd1ZhcmlhYmxlSW5GaWxlLmNhbGxDb3VudCA+IDBcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZSBzb3J0UGFsZXR0ZUNvbG9ycyBzZXR0aW5ncyBpcyBzZXQgdG8gY29sb3InLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLnNvcnRQYWxldHRlQ29sb3JzJywgJ2J5IGNvbG9yJ1xuXG4gICAgICBpdCAncmVvcmRlcnMgdGhlIGNvbG9ycycsIC0+XG4gICAgICAgIHNvcnRlZENvbG9ycyA9IHByb2plY3QuZ2V0UGFsZXR0ZSgpLnNvcnRlZEJ5Q29sb3IoKS5maWx0ZXIoKHYpIC0+IG5vdCB2LmlzQWx0ZXJuYXRlKVxuICAgICAgICBsaXMgPSBwYWxldHRlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdsaScpXG5cbiAgICAgICAgZm9yIHtuYW1lfSxpIGluIHNvcnRlZENvbG9yc1xuICAgICAgICAgIGV4cGVjdChsaXNbaV0ucXVlcnlTZWxlY3RvcignLm5hbWUnKS50ZXh0Q29udGVudCkudG9FcXVhbChuYW1lKVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gdGhlIHNvcnRQYWxldHRlQ29sb3JzIHNldHRpbmdzIGlzIHNldCB0byBuYW1lJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5zb3J0UGFsZXR0ZUNvbG9ycycsICdieSBuYW1lJ1xuXG4gICAgICBpdCAncmVvcmRlcnMgdGhlIGNvbG9ycycsIC0+XG4gICAgICAgIHNvcnRlZENvbG9ycyA9IHByb2plY3QuZ2V0UGFsZXR0ZSgpLnNvcnRlZEJ5TmFtZSgpLmZpbHRlcigodikgLT4gbm90IHYuaXNBbHRlcm5hdGUpXG4gICAgICAgIGxpcyA9IHBhbGV0dGVFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpJylcblxuICAgICAgICBmb3Ige25hbWV9LGkgaW4gc29ydGVkQ29sb3JzXG4gICAgICAgICAgZXhwZWN0KGxpc1tpXS5xdWVyeVNlbGVjdG9yKCcubmFtZScpLnRleHRDb250ZW50KS50b0VxdWFsKG5hbWUpXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgZ3JvdXBQYWxldHRlQ29sb3JzIHNldHRpbmcgaXMgc2V0IHRvIGZpbGUnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLmdyb3VwUGFsZXR0ZUNvbG9ycycsICdieSBmaWxlJ1xuXG4gICAgICBpdCAncmVuZGVycyB0aGUgbGlzdCB3aXRoIHN1Ymxpc3RzIGZvciBlYWNoIGZpbGVzJywgLT5cbiAgICAgICAgb2xzID0gcGFsZXR0ZUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnb2wgb2wnKVxuICAgICAgICBleHBlY3Qob2xzLmxlbmd0aCkudG9FcXVhbCg1KVxuXG4gICAgICBpdCAnYWRkcyBhIGhlYWRlciB3aXRoIHRoZSBmaWxlIHBhdGggZm9yIGVhY2ggc3VibGlzdCcsIC0+XG4gICAgICAgIG9scyA9IHBhbGV0dGVFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5waWdtZW50cy1jb2xvci1ncm91cC1oZWFkZXInKVxuICAgICAgICBleHBlY3Qob2xzLmxlbmd0aCkudG9FcXVhbCg1KVxuXG4gICAgICBkZXNjcmliZSAnYW5kIHRoZSBzb3J0UGFsZXR0ZUNvbG9ycyBpcyBzZXQgdG8gbmFtZScsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLnNvcnRQYWxldHRlQ29sb3JzJywgJ2J5IG5hbWUnXG5cbiAgICAgICAgaXQgJ3NvcnRzIHRoZSBuZXN0ZWQgbGlzdCBpdGVtcycsIC0+XG4gICAgICAgICAgcGFsZXR0ZXMgPSBwYWxldHRlRWxlbWVudC5nZXRGaWxlc1BhbGV0dGVzKClcbiAgICAgICAgICBvbHMgPSBwYWxldHRlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucGlnbWVudHMtY29sb3ItZ3JvdXAnKVxuICAgICAgICAgIG4gPSAwXG5cbiAgICAgICAgICBmb3IgZmlsZSwgcGFsZXR0ZSBvZiBwYWxldHRlc1xuICAgICAgICAgICAgb2wgPSBvbHNbbisrXVxuICAgICAgICAgICAgbGlzID0gb2wucXVlcnlTZWxlY3RvckFsbCgnbGknKVxuICAgICAgICAgICAgc29ydGVkQ29sb3JzID0gcGFsZXR0ZS5zb3J0ZWRCeU5hbWUoKS5maWx0ZXIoKHYpIC0+IG5vdCB2LmlzQWx0ZXJuYXRlKVxuXG4gICAgICAgICAgICBmb3Ige25hbWV9LGkgaW4gc29ydGVkQ29sb3JzXG4gICAgICAgICAgICAgIGV4cGVjdChsaXNbaV0ucXVlcnlTZWxlY3RvcignLm5hbWUnKS50ZXh0Q29udGVudCkudG9FcXVhbChuYW1lKVxuXG4gICAgICBkZXNjcmliZSAnd2hlbiB0aGUgbWVyZ2VDb2xvckR1cGxpY2F0ZXMnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5tZXJnZUNvbG9yRHVwbGljYXRlcycsIHRydWVcblxuICAgICAgICBpdCAnZ3JvdXBzIGlkZW50aWNhbCBjb2xvcnMgdG9nZXRoZXInLCAtPlxuICAgICAgICAgIGxpcyA9IHBhbGV0dGVFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpJylcblxuICAgICAgICAgIGV4cGVjdChsaXMubGVuZ3RoKS50b0VxdWFsKDQwKVxuXG4gICAgZGVzY3JpYmUgJ3NvcnRpbmcgc2VsZWN0b3InLCAtPlxuICAgICAgW3NvcnRTZWxlY3RdID0gW11cblxuICAgICAgZGVzY3JpYmUgJ3doZW4gY2hhbmdlZCcsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzb3J0U2VsZWN0ID0gcGFsZXR0ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignI3NvcnQtcGFsZXR0ZS1jb2xvcnMnKVxuICAgICAgICAgIHNvcnRTZWxlY3QucXVlcnlTZWxlY3Rvcignb3B0aW9uW3ZhbHVlPVwiYnkgbmFtZVwiXScpLnNldEF0dHJpYnV0ZSgnc2VsZWN0ZWQnLCAnc2VsZWN0ZWQnKVxuXG4gICAgICAgICAgY2hhbmdlKHNvcnRTZWxlY3QpXG5cbiAgICAgICAgaXQgJ2NoYW5nZXMgdGhlIHNldHRpbmdzIHZhbHVlJywgLT5cbiAgICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdwaWdtZW50cy5zb3J0UGFsZXR0ZUNvbG9ycycpKS50b0VxdWFsKCdieSBuYW1lJylcblxuICAgIGRlc2NyaWJlICdncm91cGluZyBzZWxlY3RvcicsIC0+XG4gICAgICBbZ3JvdXBTZWxlY3RdID0gW11cblxuICAgICAgZGVzY3JpYmUgJ3doZW4gY2hhbmdlZCcsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBncm91cFNlbGVjdCA9IHBhbGV0dGVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJyNncm91cC1wYWxldHRlLWNvbG9ycycpXG4gICAgICAgICAgZ3JvdXBTZWxlY3QucXVlcnlTZWxlY3Rvcignb3B0aW9uW3ZhbHVlPVwiYnkgZmlsZVwiXScpLnNldEF0dHJpYnV0ZSgnc2VsZWN0ZWQnLCAnc2VsZWN0ZWQnKVxuXG4gICAgICAgICAgY2hhbmdlKGdyb3VwU2VsZWN0KVxuXG4gICAgICAgIGl0ICdjaGFuZ2VzIHRoZSBzZXR0aW5ncyB2YWx1ZScsIC0+XG4gICAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuZ3JvdXBQYWxldHRlQ29sb3JzJykpLnRvRXF1YWwoJ2J5IGZpbGUnKVxuXG4gIGRlc2NyaWJlICd3aGVuIHRoZSBwYWxldHRlIHNldHRpbmdzIGRpZmZlcnMgZnJvbSBkZWZhdWx0cycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5zb3J0UGFsZXR0ZUNvbG9ycycsICdieSBuYW1lJylcbiAgICAgIGF0b20uY29uZmlnLnNldCgncGlnbWVudHMuZ3JvdXBQYWxldHRlQ29sb3JzJywgJ2J5IGZpbGUnKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5tZXJnZUNvbG9yRHVwbGljYXRlcycsIHRydWUpXG5cbiAgICBkZXNjcmliZSAnd2hlbiBwaWdtZW50czpzaG93LXBhbGV0dGUgY29tbWFuZHMgaXMgdHJpZ2dlcmVkJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAncGlnbWVudHM6c2hvdy1wYWxldHRlJylcblxuICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgIHBhbGV0dGVFbGVtZW50ID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdwaWdtZW50cy1wYWxldHRlJylcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgcGFsZXR0ZSA9IHBhbGV0dGVFbGVtZW50LmdldE1vZGVsKClcblxuICAgICAgZGVzY3JpYmUgJ3RoZSBzb3J0aW5nIHNlbGVjdG9yJywgLT5cbiAgICAgICAgaXQgJ3NlbGVjdHMgdGhlIGN1cnJlbnQgdmFsdWUnLCAtPlxuICAgICAgICAgIHNvcnRTZWxlY3QgPSBwYWxldHRlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcjc29ydC1wYWxldHRlLWNvbG9ycycpXG4gICAgICAgICAgZXhwZWN0KHNvcnRTZWxlY3QucXVlcnlTZWxlY3Rvcignb3B0aW9uW3NlbGVjdGVkXScpLnZhbHVlKS50b0VxdWFsKCdieSBuYW1lJylcblxuICAgICAgZGVzY3JpYmUgJ3RoZSBncm91cGluZyBzZWxlY3RvcicsIC0+XG4gICAgICAgIGl0ICdzZWxlY3RzIHRoZSBjdXJyZW50IHZhbHVlJywgLT5cbiAgICAgICAgICBncm91cFNlbGVjdCA9IHBhbGV0dGVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJyNncm91cC1wYWxldHRlLWNvbG9ycycpXG4gICAgICAgICAgZXhwZWN0KGdyb3VwU2VsZWN0LnF1ZXJ5U2VsZWN0b3IoJ29wdGlvbltzZWxlY3RlZF0nKS52YWx1ZSkudG9FcXVhbCgnYnkgZmlsZScpXG5cbiAgICAgIGl0ICdjaGVja3MgdGhlIG1lcmdlIGNoZWNrYm94JywgLT5cbiAgICAgICAgbWVyZ2VDaGVja0JveCA9IHBhbGV0dGVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZXJnZS1kdXBsaWNhdGVzJylcbiAgICAgICAgZXhwZWN0KG1lcmdlQ2hlY2tCb3guY2hlY2tlZCkudG9CZVRydXRoeSgpXG5cbiAgZGVzY3JpYmUgJ3doZW4gdGhlIHByb2plY3QgdmFyaWFibGVzIGFyZSBtb2RpZmllZCcsIC0+XG4gICAgW3NweSwgaW5pdGlhbENvbG9yQ291bnRdID0gW11cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdwaWdtZW50czpzaG93LXBhbGV0dGUnKVxuXG4gICAgICB3YWl0c0ZvciAtPlxuICAgICAgICBwYWxldHRlRWxlbWVudCA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcigncGlnbWVudHMtcGFsZXR0ZScpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgcGFsZXR0ZSA9IHBhbGV0dGVFbGVtZW50LmdldE1vZGVsKClcbiAgICAgICAgaW5pdGlhbENvbG9yQ291bnQgPSBwYWxldHRlLmdldENvbG9yc0NvdW50KClcbiAgICAgICAgc3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ29uRGlkVXBkYXRlVmFyaWFibGVzJylcblxuICAgICAgICBwcm9qZWN0Lm9uRGlkVXBkYXRlVmFyaWFibGVzKHNweSlcblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLnNvdXJjZU5hbWVzJywgW1xuICAgICAgICAgICcqLnN0eWwnXG4gICAgICAgICAgJyoubGVzcydcbiAgICAgICAgICAnKi5zYXNzJ1xuICAgICAgICBdXG5cbiAgICAgIHdhaXRzRm9yIC0+IHNweS5jYWxsQ291bnQgPiAwXG5cbiAgICBpdCAndXBkYXRlcyB0aGUgcGFsZXR0ZScsIC0+XG4gICAgICBleHBlY3QocGFsZXR0ZS5nZXRDb2xvcnNDb3VudCgpKS5ub3QudG9FcXVhbChpbml0aWFsQ29sb3JDb3VudClcblxuICAgICAgbGlzID0gcGFsZXR0ZUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbGknKVxuXG4gICAgICBleHBlY3QobGlzLmxlbmd0aCkubm90LnRvRXF1YWwoaW5pdGlhbENvbG9yQ291bnQpXG4iXX0=
