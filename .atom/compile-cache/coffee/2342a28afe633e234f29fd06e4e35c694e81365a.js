(function() {
  var Disposable, Pigments, PigmentsAPI, SERIALIZE_MARKERS_VERSION, SERIALIZE_VERSION, ref, registry;

  Disposable = require('atom').Disposable;

  Pigments = require('../lib/pigments');

  PigmentsAPI = require('../lib/pigments-api');

  registry = require('../lib/variable-expressions');

  ref = require('../lib/versions'), SERIALIZE_VERSION = ref.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = ref.SERIALIZE_MARKERS_VERSION;

  describe("Pigments", function() {
    var pigments, project, ref1, workspaceElement;
    ref1 = [], workspaceElement = ref1[0], pigments = ref1[1], project = ref1[2];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      atom.config.set('pigments.sourceNames', ['**/*.sass', '**/*.styl']);
      atom.config.set('pigments.ignoredNames', []);
      atom.config.set('pigments.ignoredScopes', []);
      atom.config.set('pigments.autocompleteScopes', []);
      registry.createExpression('pigments:txt_vars', '^[ \\t]*([a-zA-Z_$][a-zA-Z0-9\\-_]*)\\s*=(?!=)\\s*([^\\n\\r;]*);?$', ['txt']);
      return waitsForPromise({
        label: 'pigments activation'
      }, function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          pigments = pkg.mainModule;
          return project = pigments.getProject();
        });
      });
    });
    afterEach(function() {
      registry.removeExpression('pigments:txt_vars');
      return project != null ? project.destroy() : void 0;
    });
    it('instanciates a ColorProject instance', function() {
      return expect(pigments.getProject()).toBeDefined();
    });
    it('serializes the project', function() {
      var date;
      date = new Date;
      spyOn(pigments.getProject(), 'getTimestamp').andCallFake(function() {
        return date;
      });
      return expect(pigments.serialize()).toEqual({
        project: {
          deserializer: 'ColorProject',
          timestamp: date,
          version: SERIALIZE_VERSION,
          markersVersion: SERIALIZE_MARKERS_VERSION,
          globalSourceNames: ['**/*.sass', '**/*.styl'],
          globalIgnoredNames: [],
          buffers: {}
        }
      });
    });
    describe('when deactivated', function() {
      var colorBuffer, editor, editorElement, ref2;
      ref2 = [], editor = ref2[0], editorElement = ref2[1], colorBuffer = ref2[2];
      beforeEach(function() {
        waitsForPromise({
          label: 'text-editor opened'
        }, function() {
          return atom.workspace.open('four-variables.styl').then(function(e) {
            editor = e;
            editorElement = atom.views.getView(e);
            return colorBuffer = project.colorBufferForEditor(editor);
          });
        });
        waitsFor('pigments markers appended to the DOM', function() {
          return editorElement.querySelector('pigments-markers');
        });
        return runs(function() {
          spyOn(project, 'destroy').andCallThrough();
          spyOn(colorBuffer, 'destroy').andCallThrough();
          return pigments.deactivate();
        });
      });
      it('destroys the pigments project', function() {
        return expect(project.destroy).toHaveBeenCalled();
      });
      it('destroys all the color buffers that were created', function() {
        expect(project.colorBufferForEditor(editor)).toBeUndefined();
        expect(project.colorBuffersByEditorId).toBeNull();
        return expect(colorBuffer.destroy).toHaveBeenCalled();
      });
      return it('destroys the color buffer element that were added to the DOM', function() {
        return expect(editorElement.querySelector('pigments-markers')).not.toExist();
      });
    });
    describe('pigments:project-settings', function() {
      var item;
      item = null;
      beforeEach(function() {
        atom.commands.dispatch(workspaceElement, 'pigments:project-settings');
        return waitsFor('active pane item', function() {
          item = atom.workspace.getActivePaneItem();
          return item != null;
        });
      });
      return it('opens a settings view in the active pane', function() {
        return item.matches('pigments-color-project');
      });
    });
    describe('API provider', function() {
      var buffer, editor, editorElement, ref2, service;
      ref2 = [], service = ref2[0], editor = ref2[1], editorElement = ref2[2], buffer = ref2[3];
      beforeEach(function() {
        waitsForPromise({
          label: 'text-editor opened'
        }, function() {
          return atom.workspace.open('four-variables.styl').then(function(e) {
            editor = e;
            editorElement = atom.views.getView(e);
            return buffer = project.colorBufferForEditor(editor);
          });
        });
        runs(function() {
          return service = pigments.provideAPI();
        });
        return waitsForPromise({
          label: 'project initialized'
        }, function() {
          return project.initialize();
        });
      });
      it('returns an object conforming to the API', function() {
        expect(service instanceof PigmentsAPI).toBeTruthy();
        expect(service.getProject()).toBe(project);
        expect(service.getPalette()).toEqual(project.getPalette());
        expect(service.getPalette()).not.toBe(project.getPalette());
        expect(service.getVariables()).toEqual(project.getVariables());
        return expect(service.getColorVariables()).toEqual(project.getColorVariables());
      });
      return describe('::observeColorBuffers', function() {
        var spy;
        spy = [][0];
        beforeEach(function() {
          spy = jasmine.createSpy('did-create-color-buffer');
          return service.observeColorBuffers(spy);
        });
        it('calls the callback for every existing color buffer', function() {
          expect(spy).toHaveBeenCalled();
          return expect(spy.calls.length).toEqual(1);
        });
        return it('calls the callback on every new buffer creation', function() {
          waitsForPromise({
            label: 'text-editor opened'
          }, function() {
            return atom.workspace.open('buttons.styl');
          });
          return runs(function() {
            return expect(spy.calls.length).toEqual(2);
          });
        });
      });
    });
    describe('color expression consumer', function() {
      var colorBuffer, colorBufferElement, colorProvider, consumerDisposable, editor, editorElement, otherConsumerDisposable, ref2;
      ref2 = [], colorProvider = ref2[0], consumerDisposable = ref2[1], editor = ref2[2], editorElement = ref2[3], colorBuffer = ref2[4], colorBufferElement = ref2[5], otherConsumerDisposable = ref2[6];
      beforeEach(function() {
        return colorProvider = {
          name: 'todo',
          regexpString: 'TODO',
          scopes: ['*'],
          priority: 0,
          handle: function(match, expression, context) {
            return this.red = 255;
          }
        };
      });
      afterEach(function() {
        if (consumerDisposable != null) {
          consumerDisposable.dispose();
        }
        return otherConsumerDisposable != null ? otherConsumerDisposable.dispose() : void 0;
      });
      describe('when consumed before opening a text editor', function() {
        beforeEach(function() {
          consumerDisposable = pigments.consumeColorExpressions(colorProvider);
          waitsForPromise({
            label: 'text-editor opened'
          }, function() {
            return atom.workspace.open('color-consumer-sample.txt').then(function(e) {
              editor = e;
              editorElement = atom.views.getView(e);
              return colorBuffer = project.colorBufferForEditor(editor);
            });
          });
          waitsForPromise({
            label: 'color buffer initialized'
          }, function() {
            return colorBuffer.initialize();
          });
          return waitsForPromise({
            label: 'color buffer variables available'
          }, function() {
            return colorBuffer.variablesAvailable();
          });
        });
        it('parses the new expression and renders a color', function() {
          return expect(colorBuffer.getColorMarkers().length).toEqual(1);
        });
        it('returns a Disposable instance', function() {
          return expect(consumerDisposable instanceof Disposable).toBeTruthy();
        });
        return describe('the returned disposable', function() {
          it('removes the provided expression from the registry', function() {
            consumerDisposable.dispose();
            return expect(project.getColorExpressionsRegistry().getExpression('todo')).toBeUndefined();
          });
          return it('triggers an update in the opened editors', function() {
            var updateSpy;
            updateSpy = jasmine.createSpy('did-update-color-markers');
            colorBuffer.onDidUpdateColorMarkers(updateSpy);
            consumerDisposable.dispose();
            waitsFor('did-update-color-markers event dispatched', function() {
              return updateSpy.callCount > 0;
            });
            return runs(function() {
              return expect(colorBuffer.getColorMarkers().length).toEqual(0);
            });
          });
        });
      });
      describe('when consumed after opening a text editor', function() {
        beforeEach(function() {
          waitsForPromise({
            label: 'text-editor opened'
          }, function() {
            return atom.workspace.open('color-consumer-sample.txt').then(function(e) {
              editor = e;
              editorElement = atom.views.getView(e);
              return colorBuffer = project.colorBufferForEditor(editor);
            });
          });
          waitsForPromise({
            label: 'color buffer initialized'
          }, function() {
            return colorBuffer.initialize();
          });
          return waitsForPromise({
            label: 'color buffer variables available'
          }, function() {
            return colorBuffer.variablesAvailable();
          });
        });
        it('triggers an update in the opened editors', function() {
          var updateSpy;
          updateSpy = jasmine.createSpy('did-update-color-markers');
          colorBuffer.onDidUpdateColorMarkers(updateSpy);
          consumerDisposable = pigments.consumeColorExpressions(colorProvider);
          waitsFor('did-update-color-markers event dispatched', function() {
            return updateSpy.callCount > 0;
          });
          runs(function() {
            expect(colorBuffer.getColorMarkers().length).toEqual(1);
            return consumerDisposable.dispose();
          });
          waitsFor('did-update-color-markers event dispatched', function() {
            return updateSpy.callCount > 1;
          });
          return runs(function() {
            return expect(colorBuffer.getColorMarkers().length).toEqual(0);
          });
        });
        return describe('when an array of expressions is passed', function() {
          return it('triggers an update in the opened editors', function() {
            var updateSpy;
            updateSpy = jasmine.createSpy('did-update-color-markers');
            colorBuffer.onDidUpdateColorMarkers(updateSpy);
            consumerDisposable = pigments.consumeColorExpressions({
              expressions: [colorProvider]
            });
            waitsFor('did-update-color-markers event dispatched', function() {
              return updateSpy.callCount > 0;
            });
            runs(function() {
              expect(colorBuffer.getColorMarkers().length).toEqual(1);
              return consumerDisposable.dispose();
            });
            waitsFor('did-update-color-markers event dispatched', function() {
              return updateSpy.callCount > 1;
            });
            return runs(function() {
              return expect(colorBuffer.getColorMarkers().length).toEqual(0);
            });
          });
        });
      });
      return describe('when the expression matches a variable value', function() {
        beforeEach(function() {
          return waitsForPromise({
            label: 'project initialized'
          }, function() {
            return project.initialize();
          });
        });
        it('detects the new variable as a color variable', function() {
          var variableSpy;
          variableSpy = jasmine.createSpy('did-update-variables');
          project.onDidUpdateVariables(variableSpy);
          atom.config.set('pigments.sourceNames', ['**/*.txt']);
          waitsFor('variables updated', function() {
            return variableSpy.callCount > 1;
          });
          runs(function() {
            expect(project.getVariables().length).toEqual(6);
            expect(project.getColorVariables().length).toEqual(4);
            return consumerDisposable = pigments.consumeColorExpressions(colorProvider);
          });
          waitsFor('variables updated', function() {
            return variableSpy.callCount > 2;
          });
          return runs(function() {
            expect(project.getVariables().length).toEqual(6);
            return expect(project.getColorVariables().length).toEqual(5);
          });
        });
        return describe('and there was an expression that could not be resolved before', function() {
          return it('updates the invalid color as a now valid color', function() {
            var variableSpy;
            variableSpy = jasmine.createSpy('did-update-variables');
            project.onDidUpdateVariables(variableSpy);
            atom.config.set('pigments.sourceNames', ['**/*.txt']);
            waitsFor('variables updated', function() {
              return variableSpy.callCount > 1;
            });
            return runs(function() {
              otherConsumerDisposable = pigments.consumeColorExpressions({
                name: 'bar',
                regexpString: 'baz\\s+(\\w+)',
                handle: function(match, expression, context) {
                  var _, color, expr;
                  _ = match[0], expr = match[1];
                  color = context.readColor(expr);
                  if (context.isInvalid(color)) {
                    return this.invalid = true;
                  }
                  return this.rgba = color.rgba;
                }
              });
              consumerDisposable = pigments.consumeColorExpressions(colorProvider);
              waitsFor('variables updated', function() {
                return variableSpy.callCount > 2;
              });
              runs(function() {
                expect(project.getVariables().length).toEqual(6);
                expect(project.getColorVariables().length).toEqual(6);
                expect(project.getVariableByName('bar').color.invalid).toBeFalsy();
                return consumerDisposable.dispose();
              });
              waitsFor('variables updated', function() {
                return variableSpy.callCount > 3;
              });
              return runs(function() {
                expect(project.getVariables().length).toEqual(6);
                expect(project.getColorVariables().length).toEqual(5);
                return expect(project.getVariableByName('bar').color.invalid).toBeTruthy();
              });
            });
          });
        });
      });
    });
    return describe('variable expression consumer', function() {
      var colorBuffer, colorBufferElement, consumerDisposable, editor, editorElement, ref2, variableProvider;
      ref2 = [], variableProvider = ref2[0], consumerDisposable = ref2[1], editor = ref2[2], editorElement = ref2[3], colorBuffer = ref2[4], colorBufferElement = ref2[5];
      beforeEach(function() {
        variableProvider = {
          name: 'todo',
          regexpString: '(TODO):\\s*([^;\\n]+)'
        };
        return waitsForPromise({
          label: 'project initialized'
        }, function() {
          return project.initialize();
        });
      });
      afterEach(function() {
        return consumerDisposable != null ? consumerDisposable.dispose() : void 0;
      });
      it('updates the project variables when consumed', function() {
        var variableSpy;
        variableSpy = jasmine.createSpy('did-update-variables');
        project.onDidUpdateVariables(variableSpy);
        atom.config.set('pigments.sourceNames', ['**/*.txt']);
        waitsFor('variables updated', function() {
          return variableSpy.callCount > 1;
        });
        runs(function() {
          expect(project.getVariables().length).toEqual(6);
          expect(project.getColorVariables().length).toEqual(4);
          return consumerDisposable = pigments.consumeVariableExpressions(variableProvider);
        });
        waitsFor('variables updated after service consumed', function() {
          return variableSpy.callCount > 2;
        });
        runs(function() {
          expect(project.getVariables().length).toEqual(7);
          expect(project.getColorVariables().length).toEqual(4);
          return consumerDisposable.dispose();
        });
        waitsFor('variables updated after service disposed', function() {
          return variableSpy.callCount > 3;
        });
        return runs(function() {
          expect(project.getVariables().length).toEqual(6);
          return expect(project.getColorVariables().length).toEqual(4);
        });
      });
      return describe('when an array of expressions is passed', function() {
        return it('updates the project variables when consumed', function() {
          var previousVariablesCount;
          previousVariablesCount = null;
          atom.config.set('pigments.sourceNames', ['**/*.txt']);
          waitsFor('variables initialized', function() {
            return project.getVariables().length === 45;
          });
          runs(function() {
            return previousVariablesCount = project.getVariables().length;
          });
          waitsFor('variables updated', function() {
            return project.getVariables().length === 6;
          });
          runs(function() {
            expect(project.getVariables().length).toEqual(6);
            expect(project.getColorVariables().length).toEqual(4);
            previousVariablesCount = project.getVariables().length;
            return consumerDisposable = pigments.consumeVariableExpressions({
              expressions: [variableProvider]
            });
          });
          waitsFor('variables updated after service consumed', function() {
            return project.getVariables().length !== previousVariablesCount;
          });
          runs(function() {
            expect(project.getVariables().length).toEqual(7);
            expect(project.getColorVariables().length).toEqual(4);
            previousVariablesCount = project.getVariables().length;
            return consumerDisposable.dispose();
          });
          waitsFor('variables updated after service disposed', function() {
            return project.getVariables().length !== previousVariablesCount;
          });
          return runs(function() {
            expect(project.getVariables().length).toEqual(6);
            return expect(project.getColorVariables().length).toEqual(4);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9hY3RpdmF0aW9uLWFuZC1hcGktc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBQ2YsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFDWCxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSOztFQUNkLFFBQUEsR0FBVyxPQUFBLENBQVEsNkJBQVI7O0VBRVgsTUFBaUQsT0FBQSxDQUFRLGlCQUFSLENBQWpELEVBQUMseUNBQUQsRUFBb0I7O0VBRXBCLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUE7QUFDbkIsUUFBQTtJQUFBLE9BQXdDLEVBQXhDLEVBQUMsMEJBQUQsRUFBbUIsa0JBQW5CLEVBQTZCO0lBRTdCLFVBQUEsQ0FBVyxTQUFBO01BQ1QsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QjtNQUNuQixPQUFPLENBQUMsV0FBUixDQUFvQixnQkFBcEI7TUFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0JBQWhCLEVBQXdDLENBQUMsV0FBRCxFQUFjLFdBQWQsQ0FBeEM7TUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLEVBQXlDLEVBQXpDO01BQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQixFQUEwQyxFQUExQztNQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsRUFBK0MsRUFBL0M7TUFFQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsbUJBQTFCLEVBQStDLG9FQUEvQyxFQUFxSCxDQUFDLEtBQUQsQ0FBckg7YUFFQSxlQUFBLENBQWdCO1FBQUEsS0FBQSxFQUFPLHFCQUFQO09BQWhC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QSxDQUFLLFNBQUE7WUFDSCxNQUFBLENBQU8sT0FBTyxDQUFDLFlBQVIsQ0FBQSxDQUFzQixDQUFDLE1BQTlCLENBQXFDLENBQUMsT0FBdEMsQ0FBOEMsQ0FBOUM7bUJBQ0EsTUFBQSxDQUFPLE9BQU8sQ0FBQyxpQkFBUixDQUFBLENBQTJCLENBQUMsTUFBbkMsQ0FBMEMsQ0FBQyxPQUEzQyxDQUFtRCxDQUFuRDtVQUZHLENBQUw7UUFyQ2dELENBQWxEO01BRGlELENBQW5EO0lBNUN1QyxDQUF6QztFQWpVbUIsQ0FBckI7QUFQQSIsInNvdXJjZXNDb250ZW50IjpbIntEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5QaWdtZW50cyA9IHJlcXVpcmUgJy4uL2xpYi9waWdtZW50cydcblBpZ21lbnRzQVBJID0gcmVxdWlyZSAnLi4vbGliL3BpZ21lbnRzLWFwaSdcbnJlZ2lzdHJ5ID0gcmVxdWlyZSAnLi4vbGliL3ZhcmlhYmxlLWV4cHJlc3Npb25zJ1xuXG57U0VSSUFMSVpFX1ZFUlNJT04sIFNFUklBTElaRV9NQVJLRVJTX1ZFUlNJT059ID0gcmVxdWlyZSAnLi4vbGliL3ZlcnNpb25zJ1xuXG5kZXNjcmliZSBcIlBpZ21lbnRzXCIsIC0+XG4gIFt3b3Jrc3BhY2VFbGVtZW50LCBwaWdtZW50cywgcHJvamVjdF0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgIGphc21pbmUuYXR0YWNoVG9ET00od29ya3NwYWNlRWxlbWVudClcblxuICAgIGF0b20uY29uZmlnLnNldCgncGlnbWVudHMuc291cmNlTmFtZXMnLCBbJyoqLyouc2FzcycsICcqKi8qLnN0eWwnXSlcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLmlnbm9yZWROYW1lcycsIFtdKVxuICAgIGF0b20uY29uZmlnLnNldCgncGlnbWVudHMuaWdub3JlZFNjb3BlcycsIFtdKVxuICAgIGF0b20uY29uZmlnLnNldCgncGlnbWVudHMuYXV0b2NvbXBsZXRlU2NvcGVzJywgW10pXG5cbiAgICByZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czp0eHRfdmFycycsICdeWyBcXFxcdF0qKFthLXpBLVpfJF1bYS16QS1aMC05XFxcXC1fXSopXFxcXHMqPSg/IT0pXFxcXHMqKFteXFxcXG5cXFxccjtdKik7PyQnLCBbJ3R4dCddXG5cbiAgICB3YWl0c0ZvclByb21pc2UgbGFiZWw6ICdwaWdtZW50cyBhY3RpdmF0aW9uJywgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdwaWdtZW50cycpLnRoZW4gKHBrZykgLT5cbiAgICAgICAgcGlnbWVudHMgPSBwa2cubWFpbk1vZHVsZVxuICAgICAgICBwcm9qZWN0ID0gcGlnbWVudHMuZ2V0UHJvamVjdCgpXG5cbiAgYWZ0ZXJFYWNoIC0+XG4gICAgcmVnaXN0cnkucmVtb3ZlRXhwcmVzc2lvbiAncGlnbWVudHM6dHh0X3ZhcnMnXG4gICAgcHJvamVjdD8uZGVzdHJveSgpXG5cbiAgaXQgJ2luc3RhbmNpYXRlcyBhIENvbG9yUHJvamVjdCBpbnN0YW5jZScsIC0+XG4gICAgZXhwZWN0KHBpZ21lbnRzLmdldFByb2plY3QoKSkudG9CZURlZmluZWQoKVxuXG4gIGl0ICdzZXJpYWxpemVzIHRoZSBwcm9qZWN0JywgLT5cbiAgICBkYXRlID0gbmV3IERhdGVcbiAgICBzcHlPbihwaWdtZW50cy5nZXRQcm9qZWN0KCksICdnZXRUaW1lc3RhbXAnKS5hbmRDYWxsRmFrZSAtPiBkYXRlXG4gICAgZXhwZWN0KHBpZ21lbnRzLnNlcmlhbGl6ZSgpKS50b0VxdWFsKHtcbiAgICAgIHByb2plY3Q6XG4gICAgICAgIGRlc2VyaWFsaXplcjogJ0NvbG9yUHJvamVjdCdcbiAgICAgICAgdGltZXN0YW1wOiBkYXRlXG4gICAgICAgIHZlcnNpb246IFNFUklBTElaRV9WRVJTSU9OXG4gICAgICAgIG1hcmtlcnNWZXJzaW9uOiBTRVJJQUxJWkVfTUFSS0VSU19WRVJTSU9OXG4gICAgICAgIGdsb2JhbFNvdXJjZU5hbWVzOiBbJyoqLyouc2FzcycsICcqKi8qLnN0eWwnXVxuICAgICAgICBnbG9iYWxJZ25vcmVkTmFtZXM6IFtdXG4gICAgICAgIGJ1ZmZlcnM6IHt9XG4gICAgfSlcblxuICBkZXNjcmliZSAnd2hlbiBkZWFjdGl2YXRlZCcsIC0+XG4gICAgW2VkaXRvciwgZWRpdG9yRWxlbWVudCwgY29sb3JCdWZmZXJdID0gW11cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgbGFiZWw6ICd0ZXh0LWVkaXRvciBvcGVuZWQnLCAtPlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdmb3VyLXZhcmlhYmxlcy5zdHlsJykudGhlbiAoZSkgLT5cbiAgICAgICAgICBlZGl0b3IgPSBlXG4gICAgICAgICAgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlKVxuICAgICAgICAgIGNvbG9yQnVmZmVyID0gcHJvamVjdC5jb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpXG5cbiAgICAgIHdhaXRzRm9yICdwaWdtZW50cyBtYXJrZXJzIGFwcGVuZGVkIHRvIHRoZSBET00nLCAtPlxuICAgICAgICBlZGl0b3JFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ3BpZ21lbnRzLW1hcmtlcnMnKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIHNweU9uKHByb2plY3QsICdkZXN0cm95JykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBzcHlPbihjb2xvckJ1ZmZlciwgJ2Rlc3Ryb3knKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgcGlnbWVudHMuZGVhY3RpdmF0ZSgpXG5cbiAgICBpdCAnZGVzdHJveXMgdGhlIHBpZ21lbnRzIHByb2plY3QnLCAtPlxuICAgICAgZXhwZWN0KHByb2plY3QuZGVzdHJveSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBpdCAnZGVzdHJveXMgYWxsIHRoZSBjb2xvciBidWZmZXJzIHRoYXQgd2VyZSBjcmVhdGVkJywgLT5cbiAgICAgIGV4cGVjdChwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcikpLnRvQmVVbmRlZmluZWQoKVxuICAgICAgZXhwZWN0KHByb2plY3QuY29sb3JCdWZmZXJzQnlFZGl0b3JJZCkudG9CZU51bGwoKVxuICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmRlc3Ryb3kpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgaXQgJ2Rlc3Ryb3lzIHRoZSBjb2xvciBidWZmZXIgZWxlbWVudCB0aGF0IHdlcmUgYWRkZWQgdG8gdGhlIERPTScsIC0+XG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdwaWdtZW50cy1tYXJrZXJzJykpLm5vdC50b0V4aXN0KClcblxuICBkZXNjcmliZSAncGlnbWVudHM6cHJvamVjdC1zZXR0aW5ncycsIC0+XG4gICAgaXRlbSA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdwaWdtZW50czpwcm9qZWN0LXNldHRpbmdzJylcblxuICAgICAgd2FpdHNGb3IgJ2FjdGl2ZSBwYW5lIGl0ZW0nLCAtPlxuICAgICAgICBpdGVtID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuICAgICAgICBpdGVtP1xuXG4gICAgaXQgJ29wZW5zIGEgc2V0dGluZ3MgdmlldyBpbiB0aGUgYWN0aXZlIHBhbmUnLCAtPlxuICAgICAgaXRlbS5tYXRjaGVzKCdwaWdtZW50cy1jb2xvci1wcm9qZWN0JylcblxuICAjIyAgICAgICAjIyMgICAgIyMjIyMjIyMgICMjIyNcbiAgIyMgICAgICAjIyAjIyAgICMjICAgICAjIyAgIyNcbiAgIyMgICAgICMjICAgIyMgICMjICAgICAjIyAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjIyMjIyMjICAgIyNcbiAgIyMgICAgIyMjIyMjIyMjICMjICAgICAgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAgICAjIyMjXG5cbiAgZGVzY3JpYmUgJ0FQSSBwcm92aWRlcicsIC0+XG4gICAgW3NlcnZpY2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgYnVmZmVyXSA9IFtdXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIGxhYmVsOiAndGV4dC1lZGl0b3Igb3BlbmVkJywgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbignZm91ci12YXJpYWJsZXMuc3R5bCcpLnRoZW4gKGUpIC0+XG4gICAgICAgICAgZWRpdG9yID0gZVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZSlcbiAgICAgICAgICBidWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcblxuICAgICAgcnVucyAtPiBzZXJ2aWNlID0gcGlnbWVudHMucHJvdmlkZUFQSSgpXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSBsYWJlbDogJ3Byb2plY3QgaW5pdGlhbGl6ZWQnLCAtPiBwcm9qZWN0LmluaXRpYWxpemUoKVxuXG4gICAgaXQgJ3JldHVybnMgYW4gb2JqZWN0IGNvbmZvcm1pbmcgdG8gdGhlIEFQSScsIC0+XG4gICAgICBleHBlY3Qoc2VydmljZSBpbnN0YW5jZW9mIFBpZ21lbnRzQVBJKS50b0JlVHJ1dGh5KClcblxuICAgICAgZXhwZWN0KHNlcnZpY2UuZ2V0UHJvamVjdCgpKS50b0JlKHByb2plY3QpXG5cbiAgICAgIGV4cGVjdChzZXJ2aWNlLmdldFBhbGV0dGUoKSkudG9FcXVhbChwcm9qZWN0LmdldFBhbGV0dGUoKSlcbiAgICAgIGV4cGVjdChzZXJ2aWNlLmdldFBhbGV0dGUoKSkubm90LnRvQmUocHJvamVjdC5nZXRQYWxldHRlKCkpXG5cbiAgICAgIGV4cGVjdChzZXJ2aWNlLmdldFZhcmlhYmxlcygpKS50b0VxdWFsKHByb2plY3QuZ2V0VmFyaWFibGVzKCkpXG4gICAgICBleHBlY3Qoc2VydmljZS5nZXRDb2xvclZhcmlhYmxlcygpKS50b0VxdWFsKHByb2plY3QuZ2V0Q29sb3JWYXJpYWJsZXMoKSlcblxuICAgIGRlc2NyaWJlICc6Om9ic2VydmVDb2xvckJ1ZmZlcnMnLCAtPlxuICAgICAgW3NweV0gPSBbXVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtY3JlYXRlLWNvbG9yLWJ1ZmZlcicpXG4gICAgICAgIHNlcnZpY2Uub2JzZXJ2ZUNvbG9yQnVmZmVycyhzcHkpXG5cbiAgICAgIGl0ICdjYWxscyB0aGUgY2FsbGJhY2sgZm9yIGV2ZXJ5IGV4aXN0aW5nIGNvbG9yIGJ1ZmZlcicsIC0+XG4gICAgICAgIGV4cGVjdChzcHkpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBleHBlY3Qoc3B5LmNhbGxzLmxlbmd0aCkudG9FcXVhbCgxKVxuXG4gICAgICBpdCAnY2FsbHMgdGhlIGNhbGxiYWNrIG9uIGV2ZXJ5IG5ldyBidWZmZXIgY3JlYXRpb24nLCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgIGxhYmVsOiAndGV4dC1lZGl0b3Igb3BlbmVkJywgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdidXR0b25zLnN0eWwnKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3Qoc3B5LmNhbGxzLmxlbmd0aCkudG9FcXVhbCgyKVxuXG4gICMjICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyAgICAgICAgIyMjIyMjIyAgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgIyMgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAgIyMgIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyMjIyMjIyAgICMjIyMjI1xuICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgIyMgICAgICAgICAjI1xuICAjIyAgICAjIyAgICAjIyAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgICMjICAjIyAgICAjI1xuICAjIyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyMgICMjICAgICAjIyAgIyMjIyMjXG5cbiAgZGVzY3JpYmUgJ2NvbG9yIGV4cHJlc3Npb24gY29uc3VtZXInLCAtPlxuICAgIFtjb2xvclByb3ZpZGVyLCBjb25zdW1lckRpc3Bvc2FibGUsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgY29sb3JCdWZmZXIsIGNvbG9yQnVmZmVyRWxlbWVudCwgb3RoZXJDb25zdW1lckRpc3Bvc2FibGVdID0gW11cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBjb2xvclByb3ZpZGVyID1cbiAgICAgICAgbmFtZTogJ3RvZG8nXG4gICAgICAgIHJlZ2V4cFN0cmluZzogJ1RPRE8nXG4gICAgICAgIHNjb3BlczogWycqJ11cbiAgICAgICAgcHJpb3JpdHk6IDBcbiAgICAgICAgaGFuZGxlOiAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gICAgICAgICAgQHJlZCA9IDI1NVxuXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBjb25zdW1lckRpc3Bvc2FibGU/LmRpc3Bvc2UoKVxuICAgICAgb3RoZXJDb25zdW1lckRpc3Bvc2FibGU/LmRpc3Bvc2UoKVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gY29uc3VtZWQgYmVmb3JlIG9wZW5pbmcgYSB0ZXh0IGVkaXRvcicsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGNvbnN1bWVyRGlzcG9zYWJsZSA9IHBpZ21lbnRzLmNvbnN1bWVDb2xvckV4cHJlc3Npb25zKGNvbG9yUHJvdmlkZXIpXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIGxhYmVsOiAndGV4dC1lZGl0b3Igb3BlbmVkJywgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdjb2xvci1jb25zdW1lci1zYW1wbGUudHh0JykudGhlbiAoZSkgLT5cbiAgICAgICAgICAgIGVkaXRvciA9IGVcbiAgICAgICAgICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZSlcbiAgICAgICAgICAgIGNvbG9yQnVmZmVyID0gcHJvamVjdC5jb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIGxhYmVsOiAnY29sb3IgYnVmZmVyIGluaXRpYWxpemVkJywgLT5cbiAgICAgICAgICBjb2xvckJ1ZmZlci5pbml0aWFsaXplKClcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIGxhYmVsOiAnY29sb3IgYnVmZmVyIHZhcmlhYmxlcyBhdmFpbGFibGUnLCAtPlxuICAgICAgICAgIGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG5cbiAgICAgIGl0ICdwYXJzZXMgdGhlIG5ldyBleHByZXNzaW9uIGFuZCByZW5kZXJzIGEgY29sb3InLCAtPlxuICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDEpXG5cbiAgICAgIGl0ICdyZXR1cm5zIGEgRGlzcG9zYWJsZSBpbnN0YW5jZScsIC0+XG4gICAgICAgIGV4cGVjdChjb25zdW1lckRpc3Bvc2FibGUgaW5zdGFuY2VvZiBEaXNwb3NhYmxlKS50b0JlVHJ1dGh5KClcblxuICAgICAgZGVzY3JpYmUgJ3RoZSByZXR1cm5lZCBkaXNwb3NhYmxlJywgLT5cbiAgICAgICAgaXQgJ3JlbW92ZXMgdGhlIHByb3ZpZGVkIGV4cHJlc3Npb24gZnJvbSB0aGUgcmVnaXN0cnknLCAtPlxuICAgICAgICAgIGNvbnN1bWVyRGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldENvbG9yRXhwcmVzc2lvbnNSZWdpc3RyeSgpLmdldEV4cHJlc3Npb24oJ3RvZG8nKSkudG9CZVVuZGVmaW5lZCgpXG5cbiAgICAgICAgaXQgJ3RyaWdnZXJzIGFuIHVwZGF0ZSBpbiB0aGUgb3BlbmVkIGVkaXRvcnMnLCAtPlxuICAgICAgICAgIHVwZGF0ZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtdXBkYXRlLWNvbG9yLW1hcmtlcnMnKVxuXG4gICAgICAgICAgY29sb3JCdWZmZXIub25EaWRVcGRhdGVDb2xvck1hcmtlcnModXBkYXRlU3B5KVxuICAgICAgICAgIGNvbnN1bWVyRGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICAgICAgICAgIHdhaXRzRm9yICdkaWQtdXBkYXRlLWNvbG9yLW1hcmtlcnMgZXZlbnQgZGlzcGF0Y2hlZCcsIC0+XG4gICAgICAgICAgICB1cGRhdGVTcHkuY2FsbENvdW50ID4gMFxuXG4gICAgICAgICAgcnVucyAtPiBleHBlY3QoY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDApXG5cbiAgICBkZXNjcmliZSAnd2hlbiBjb25zdW1lZCBhZnRlciBvcGVuaW5nIGEgdGV4dCBlZGl0b3InLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgbGFiZWw6ICd0ZXh0LWVkaXRvciBvcGVuZWQnLCAtPlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ2NvbG9yLWNvbnN1bWVyLXNhbXBsZS50eHQnKS50aGVuIChlKSAtPlxuICAgICAgICAgICAgZWRpdG9yID0gZVxuICAgICAgICAgICAgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlKVxuICAgICAgICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UgbGFiZWw6ICdjb2xvciBidWZmZXIgaW5pdGlhbGl6ZWQnLCAtPlxuICAgICAgICAgIGNvbG9yQnVmZmVyLmluaXRpYWxpemUoKVxuICAgICAgICB3YWl0c0ZvclByb21pc2UgbGFiZWw6ICdjb2xvciBidWZmZXIgdmFyaWFibGVzIGF2YWlsYWJsZScsIC0+XG4gICAgICAgICAgY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcblxuICAgICAgaXQgJ3RyaWdnZXJzIGFuIHVwZGF0ZSBpbiB0aGUgb3BlbmVkIGVkaXRvcnMnLCAtPlxuICAgICAgICB1cGRhdGVTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLXVwZGF0ZS1jb2xvci1tYXJrZXJzJylcblxuICAgICAgICBjb2xvckJ1ZmZlci5vbkRpZFVwZGF0ZUNvbG9yTWFya2Vycyh1cGRhdGVTcHkpXG4gICAgICAgIGNvbnN1bWVyRGlzcG9zYWJsZSA9IHBpZ21lbnRzLmNvbnN1bWVDb2xvckV4cHJlc3Npb25zKGNvbG9yUHJvdmlkZXIpXG5cbiAgICAgICAgd2FpdHNGb3IgJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycyBldmVudCBkaXNwYXRjaGVkJywgLT5cbiAgICAgICAgICB1cGRhdGVTcHkuY2FsbENvdW50ID4gMFxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDEpXG5cbiAgICAgICAgICBjb25zdW1lckRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgICAgICAgd2FpdHNGb3IgJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycyBldmVudCBkaXNwYXRjaGVkJywgLT5cbiAgICAgICAgICB1cGRhdGVTcHkuY2FsbENvdW50ID4gMVxuXG4gICAgICAgIHJ1bnMgLT4gZXhwZWN0KGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCgwKVxuXG4gICAgICBkZXNjcmliZSAnd2hlbiBhbiBhcnJheSBvZiBleHByZXNzaW9ucyBpcyBwYXNzZWQnLCAtPlxuICAgICAgICBpdCAndHJpZ2dlcnMgYW4gdXBkYXRlIGluIHRoZSBvcGVuZWQgZWRpdG9ycycsIC0+XG4gICAgICAgICAgdXBkYXRlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycycpXG5cbiAgICAgICAgICBjb2xvckJ1ZmZlci5vbkRpZFVwZGF0ZUNvbG9yTWFya2Vycyh1cGRhdGVTcHkpXG4gICAgICAgICAgY29uc3VtZXJEaXNwb3NhYmxlID0gcGlnbWVudHMuY29uc3VtZUNvbG9yRXhwcmVzc2lvbnMoe1xuICAgICAgICAgICAgZXhwcmVzc2lvbnM6IFtjb2xvclByb3ZpZGVyXVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICB3YWl0c0ZvciAnZGlkLXVwZGF0ZS1jb2xvci1tYXJrZXJzIGV2ZW50IGRpc3BhdGNoZWQnLCAtPlxuICAgICAgICAgICAgdXBkYXRlU3B5LmNhbGxDb3VudCA+IDBcblxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5nZXRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoMSlcblxuICAgICAgICAgICAgY29uc3VtZXJEaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gICAgICAgICAgd2FpdHNGb3IgJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycyBldmVudCBkaXNwYXRjaGVkJywgLT5cbiAgICAgICAgICAgIHVwZGF0ZVNweS5jYWxsQ291bnQgPiAxXG5cbiAgICAgICAgICBydW5zIC0+IGV4cGVjdChjb2xvckJ1ZmZlci5nZXRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoMClcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZSBleHByZXNzaW9uIG1hdGNoZXMgYSB2YXJpYWJsZSB2YWx1ZScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSBsYWJlbDogJ3Byb2plY3QgaW5pdGlhbGl6ZWQnLCAtPlxuICAgICAgICAgIHByb2plY3QuaW5pdGlhbGl6ZSgpXG5cbiAgICAgIGl0ICdkZXRlY3RzIHRoZSBuZXcgdmFyaWFibGUgYXMgYSBjb2xvciB2YXJpYWJsZScsIC0+XG4gICAgICAgIHZhcmlhYmxlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtdmFyaWFibGVzJylcblxuICAgICAgICBwcm9qZWN0Lm9uRGlkVXBkYXRlVmFyaWFibGVzKHZhcmlhYmxlU3B5KVxuXG4gICAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuc291cmNlTmFtZXMnLCBbJyoqLyoudHh0J11cblxuICAgICAgICB3YWl0c0ZvciAndmFyaWFibGVzIHVwZGF0ZWQnLCAtPiB2YXJpYWJsZVNweS5jYWxsQ291bnQgPiAxXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCg2KVxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDQpXG5cbiAgICAgICAgICBjb25zdW1lckRpc3Bvc2FibGUgPSBwaWdtZW50cy5jb25zdW1lQ29sb3JFeHByZXNzaW9ucyhjb2xvclByb3ZpZGVyKVxuXG4gICAgICAgIHdhaXRzRm9yICd2YXJpYWJsZXMgdXBkYXRlZCcsIC0+IHZhcmlhYmxlU3B5LmNhbGxDb3VudCA+IDJcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDYpXG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0Q29sb3JWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoNSlcblxuICAgICAgZGVzY3JpYmUgJ2FuZCB0aGVyZSB3YXMgYW4gZXhwcmVzc2lvbiB0aGF0IGNvdWxkIG5vdCBiZSByZXNvbHZlZCBiZWZvcmUnLCAtPlxuICAgICAgICBpdCAndXBkYXRlcyB0aGUgaW52YWxpZCBjb2xvciBhcyBhIG5vdyB2YWxpZCBjb2xvcicsIC0+XG4gICAgICAgICAgdmFyaWFibGVTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLXVwZGF0ZS12YXJpYWJsZXMnKVxuXG4gICAgICAgICAgcHJvamVjdC5vbkRpZFVwZGF0ZVZhcmlhYmxlcyh2YXJpYWJsZVNweSlcblxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuc291cmNlTmFtZXMnLCBbJyoqLyoudHh0J11cblxuICAgICAgICAgIHdhaXRzRm9yICd2YXJpYWJsZXMgdXBkYXRlZCcsIC0+IHZhcmlhYmxlU3B5LmNhbGxDb3VudCA+IDFcblxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIG90aGVyQ29uc3VtZXJEaXNwb3NhYmxlID0gcGlnbWVudHMuY29uc3VtZUNvbG9yRXhwcmVzc2lvbnNcbiAgICAgICAgICAgICAgbmFtZTogJ2JhcidcbiAgICAgICAgICAgICAgcmVnZXhwU3RyaW5nOiAnYmF6XFxcXHMrKFxcXFx3KyknXG4gICAgICAgICAgICAgIGhhbmRsZTogKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICAgICAgICAgICAgICAgIFtfLCBleHByXSA9IG1hdGNoXG5cbiAgICAgICAgICAgICAgICBjb2xvciA9IGNvbnRleHQucmVhZENvbG9yKGV4cHIpXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGNvbG9yKVxuXG4gICAgICAgICAgICAgICAgQHJnYmEgPSBjb2xvci5yZ2JhXG5cbiAgICAgICAgICAgIGNvbnN1bWVyRGlzcG9zYWJsZSA9IHBpZ21lbnRzLmNvbnN1bWVDb2xvckV4cHJlc3Npb25zKGNvbG9yUHJvdmlkZXIpXG5cbiAgICAgICAgICAgIHdhaXRzRm9yICd2YXJpYWJsZXMgdXBkYXRlZCcsIC0+IHZhcmlhYmxlU3B5LmNhbGxDb3VudCA+IDJcblxuICAgICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoNilcbiAgICAgICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0Q29sb3JWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoNilcbiAgICAgICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVCeU5hbWUoJ2JhcicpLmNvbG9yLmludmFsaWQpLnRvQmVGYWxzeSgpXG5cbiAgICAgICAgICAgICAgY29uc3VtZXJEaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gICAgICAgICAgICB3YWl0c0ZvciAndmFyaWFibGVzIHVwZGF0ZWQnLCAtPiB2YXJpYWJsZVNweS5jYWxsQ291bnQgPiAzXG5cbiAgICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDYpXG4gICAgICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDUpXG4gICAgICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlQnlOYW1lKCdiYXInKS5jb2xvci5pbnZhbGlkKS50b0JlVHJ1dGh5KClcblxuICAjIyAgICAjIyAgICAgIyMgICAgIyMjICAgICMjIyMjIyMjICAgIyMjIyMjXG4gICMjICAgICMjICAgICAjIyAgICMjICMjICAgIyMgICAgICMjICMjICAgICMjXG4gICMjICAgICMjICAgICAjIyAgIyMgICAjIyAgIyMgICAgICMjICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgICMjICAgIyMgICMjIyMjIyMjIyAjIyAgICMjICAgICAgICAgIyNcbiAgIyMgICAgICAjIyAjIyAgICMjICAgICAjIyAjIyAgICAjIyAgIyMgICAgIyNcbiAgIyMgICAgICAgIyMjICAgICMjICAgICAjIyAjIyAgICAgIyMgICMjIyMjI1xuXG4gIGRlc2NyaWJlICd2YXJpYWJsZSBleHByZXNzaW9uIGNvbnN1bWVyJywgLT5cbiAgICBbdmFyaWFibGVQcm92aWRlciwgY29uc3VtZXJEaXNwb3NhYmxlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIGNvbG9yQnVmZmVyLCBjb2xvckJ1ZmZlckVsZW1lbnRdID0gW11cblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHZhcmlhYmxlUHJvdmlkZXIgPVxuICAgICAgICBuYW1lOiAndG9kbydcbiAgICAgICAgcmVnZXhwU3RyaW5nOiAnKFRPRE8pOlxcXFxzKihbXjtcXFxcbl0rKSdcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIGxhYmVsOiAncHJvamVjdCBpbml0aWFsaXplZCcsIC0+XG4gICAgICAgIHByb2plY3QuaW5pdGlhbGl6ZSgpXG5cbiAgICBhZnRlckVhY2ggLT4gY29uc3VtZXJEaXNwb3NhYmxlPy5kaXNwb3NlKClcblxuICAgIGl0ICd1cGRhdGVzIHRoZSBwcm9qZWN0IHZhcmlhYmxlcyB3aGVuIGNvbnN1bWVkJywgLT5cbiAgICAgIHZhcmlhYmxlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtdmFyaWFibGVzJylcblxuICAgICAgcHJvamVjdC5vbkRpZFVwZGF0ZVZhcmlhYmxlcyh2YXJpYWJsZVNweSlcblxuICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5zb3VyY2VOYW1lcycsIFsnKiovKi50eHQnXVxuXG4gICAgICB3YWl0c0ZvciAndmFyaWFibGVzIHVwZGF0ZWQnLCAtPiB2YXJpYWJsZVNweS5jYWxsQ291bnQgPiAxXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDYpXG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDQpXG5cbiAgICAgICAgY29uc3VtZXJEaXNwb3NhYmxlID0gcGlnbWVudHMuY29uc3VtZVZhcmlhYmxlRXhwcmVzc2lvbnModmFyaWFibGVQcm92aWRlcilcblxuICAgICAgd2FpdHNGb3IgJ3ZhcmlhYmxlcyB1cGRhdGVkIGFmdGVyIHNlcnZpY2UgY29uc3VtZWQnLCAtPlxuICAgICAgICB2YXJpYWJsZVNweS5jYWxsQ291bnQgPiAyXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDcpXG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDQpXG5cbiAgICAgICAgY29uc3VtZXJEaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gICAgICB3YWl0c0ZvciAndmFyaWFibGVzIHVwZGF0ZWQgYWZ0ZXIgc2VydmljZSBkaXNwb3NlZCcsIC0+XG4gICAgICAgIHZhcmlhYmxlU3B5LmNhbGxDb3VudCA+IDNcblxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoNilcbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0Q29sb3JWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoNClcblxuICAgIGRlc2NyaWJlICd3aGVuIGFuIGFycmF5IG9mIGV4cHJlc3Npb25zIGlzIHBhc3NlZCcsIC0+XG4gICAgICBpdCAndXBkYXRlcyB0aGUgcHJvamVjdCB2YXJpYWJsZXMgd2hlbiBjb25zdW1lZCcsIC0+XG4gICAgICAgIHByZXZpb3VzVmFyaWFibGVzQ291bnQgPSBudWxsXG4gICAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuc291cmNlTmFtZXMnLCBbJyoqLyoudHh0J11cblxuICAgICAgICB3YWl0c0ZvciAndmFyaWFibGVzIGluaXRpYWxpemVkJywgLT5cbiAgICAgICAgICBwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCBpcyA0NVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBwcmV2aW91c1ZhcmlhYmxlc0NvdW50ID0gcHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGhcblxuICAgICAgICB3YWl0c0ZvciAndmFyaWFibGVzIHVwZGF0ZWQnLCAtPlxuICAgICAgICAgIHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoIGlzIDZcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDYpXG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0Q29sb3JWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoNClcblxuICAgICAgICAgIHByZXZpb3VzVmFyaWFibGVzQ291bnQgPSBwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aFxuXG4gICAgICAgICAgY29uc3VtZXJEaXNwb3NhYmxlID0gcGlnbWVudHMuY29uc3VtZVZhcmlhYmxlRXhwcmVzc2lvbnMoe1xuICAgICAgICAgICAgZXhwcmVzc2lvbnM6IFt2YXJpYWJsZVByb3ZpZGVyXVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgd2FpdHNGb3IgJ3ZhcmlhYmxlcyB1cGRhdGVkIGFmdGVyIHNlcnZpY2UgY29uc3VtZWQnLCAtPlxuICAgICAgICAgIHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoIGlzbnQgcHJldmlvdXNWYXJpYWJsZXNDb3VudFxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoNylcbiAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCg0KVxuXG4gICAgICAgICAgcHJldmlvdXNWYXJpYWJsZXNDb3VudCA9IHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoXG5cbiAgICAgICAgICBjb25zdW1lckRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgICAgICAgd2FpdHNGb3IgJ3ZhcmlhYmxlcyB1cGRhdGVkIGFmdGVyIHNlcnZpY2UgZGlzcG9zZWQnLCAtPlxuICAgICAgICAgIHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoIGlzbnQgcHJldmlvdXNWYXJpYWJsZXNDb3VudFxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoNilcbiAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCg0KVxuIl19
