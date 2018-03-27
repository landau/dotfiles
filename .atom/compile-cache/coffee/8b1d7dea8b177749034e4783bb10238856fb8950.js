(function() {
  var ColorBufferElement, mousedown, path, sleep;

  path = require('path');

  require('./helpers/spec-helper');

  mousedown = require('./helpers/events').mousedown;

  ColorBufferElement = require('../lib/color-buffer-element');

  sleep = function(duration) {
    var t;
    t = new Date();
    return waitsFor(function() {
      return new Date() - t > duration;
    });
  };

  describe('ColorBufferElement', function() {
    var colorBuffer, colorBufferElement, editBuffer, editor, editorElement, getEditorDecorations, isVisible, jasmineContent, jsonFixture, pigments, project, ref;
    ref = [], editor = ref[0], editorElement = ref[1], colorBuffer = ref[2], pigments = ref[3], project = ref[4], colorBufferElement = ref[5], jasmineContent = ref[6];
    isVisible = function(decoration) {
      return !/-in-selection/.test(decoration.properties["class"]);
    };
    editBuffer = function(text, options) {
      var range;
      if (options == null) {
        options = {};
      }
      if (options.start != null) {
        if (options.end != null) {
          range = [options.start, options.end];
        } else {
          range = [options.start, options.start];
        }
        editor.setSelectedBufferRange(range);
      }
      editor.insertText(text);
      if (!options.noEvent) {
        return advanceClock(500);
      }
    };
    jsonFixture = function(fixture, data) {
      var json, jsonPath;
      jsonPath = path.resolve(__dirname, 'fixtures', fixture);
      json = fs.readFileSync(jsonPath).toString();
      json = json.replace(/#\{(\w+)\}/g, function(m, w) {
        return data[w];
      });
      return JSON.parse(json);
    };
    getEditorDecorations = function(type) {
      return editor.getDecorations().filter(function(d) {
        return d.properties["class"].startsWith('pigments-native-background');
      });
    };
    beforeEach(function() {
      var workspaceElement;
      workspaceElement = atom.views.getView(atom.workspace);
      jasmineContent = document.body.querySelector('#jasmine-content');
      jasmineContent.appendChild(workspaceElement);
      atom.config.set('editor.softWrap', true);
      atom.config.set('editor.softWrapAtPreferredLineLength', true);
      atom.config.set('editor.preferredLineLength', 40);
      atom.config.set('pigments.delayBeforeScan', 0);
      atom.config.set('pigments.sourceNames', ['*.styl', '*.less']);
      waitsForPromise(function() {
        return atom.workspace.open('four-variables.styl').then(function(o) {
          editor = o;
          return editorElement = atom.views.getView(editor);
        });
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          pigments = pkg.mainModule;
          return project = pigments.getProject();
        });
      });
    });
    afterEach(function() {
      return colorBuffer != null ? colorBuffer.destroy() : void 0;
    });
    return describe('when an editor is opened', function() {
      beforeEach(function() {
        colorBuffer = project.colorBufferForEditor(editor);
        colorBufferElement = atom.views.getView(colorBuffer);
        return colorBufferElement.attach();
      });
      it('is associated to the ColorBuffer model', function() {
        expect(colorBufferElement).toBeDefined();
        return expect(colorBufferElement.getModel()).toBe(colorBuffer);
      });
      it('attaches itself in the target text editor element', function() {
        expect(colorBufferElement.parentNode).toExist();
        return expect(editorElement.querySelector('.lines pigments-markers')).toExist();
      });
      describe('when the color buffer is initialized', function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return colorBuffer.initialize();
          });
        });
        it('creates markers views for every visible buffer marker', function() {
          return expect(getEditorDecorations('native-background').length).toEqual(3);
        });
        describe('when the project variables are initialized', function() {
          return it('creates markers for the new valid colors', function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            return runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(4);
            });
          });
        });
        describe('when a selection intersects a marker range', function() {
          beforeEach(function() {
            return spyOn(colorBufferElement, 'updateSelections').andCallThrough();
          });
          describe('after the markers views was created', function() {
            beforeEach(function() {
              waitsForPromise(function() {
                return colorBuffer.variablesAvailable();
              });
              runs(function() {
                return editor.setSelectedBufferRange([[2, 12], [2, 14]]);
              });
              return waitsFor(function() {
                return colorBufferElement.updateSelections.callCount > 0;
              });
            });
            return it('hides the intersected marker', function() {
              var decorations;
              decorations = getEditorDecorations('native-background');
              expect(isVisible(decorations[0])).toBeTruthy();
              expect(isVisible(decorations[1])).toBeTruthy();
              expect(isVisible(decorations[2])).toBeTruthy();
              return expect(isVisible(decorations[3])).toBeFalsy();
            });
          });
          return describe('before all the markers views was created', function() {
            beforeEach(function() {
              runs(function() {
                return editor.setSelectedBufferRange([[0, 0], [2, 14]]);
              });
              return waitsFor(function() {
                return colorBufferElement.updateSelections.callCount > 0;
              });
            });
            it('hides the existing markers', function() {
              var decorations;
              decorations = getEditorDecorations('native-background');
              expect(isVisible(decorations[0])).toBeFalsy();
              expect(isVisible(decorations[1])).toBeTruthy();
              return expect(isVisible(decorations[2])).toBeTruthy();
            });
            return describe('and the markers are updated', function() {
              beforeEach(function() {
                waitsForPromise('colors available', function() {
                  return colorBuffer.variablesAvailable();
                });
                return waitsFor('last marker visible', function() {
                  var decorations;
                  decorations = getEditorDecorations('native-background');
                  return isVisible(decorations[3]);
                });
              });
              return it('hides the created markers', function() {
                var decorations;
                decorations = getEditorDecorations('native-background');
                expect(isVisible(decorations[0])).toBeFalsy();
                expect(isVisible(decorations[1])).toBeTruthy();
                expect(isVisible(decorations[2])).toBeTruthy();
                return expect(isVisible(decorations[3])).toBeTruthy();
              });
            });
          });
        });
        describe('when some markers are destroyed', function() {
          var spy;
          spy = [][0];
          beforeEach(function() {
            var el, i, len, ref1;
            ref1 = colorBufferElement.usedMarkers;
            for (i = 0, len = ref1.length; i < len; i++) {
              el = ref1[i];
              spyOn(el, 'release').andCallThrough();
            }
            spy = jasmine.createSpy('did-update');
            colorBufferElement.onDidUpdate(spy);
            editBuffer('', {
              start: [4, 0],
              end: [8, 0]
            });
            return waitsFor(function() {
              return spy.callCount > 0;
            });
          });
          return it('releases the unused markers', function() {
            return expect(getEditorDecorations('native-background').length).toEqual(2);
          });
        });
        describe('when the current pane is splitted to the right', function() {
          beforeEach(function() {
            var version;
            version = parseFloat(atom.getVersion().split('.').slice(1, 2).join('.'));
            if (version > 5) {
              atom.commands.dispatch(editorElement, 'pane:split-right-and-copy-active-item');
            } else {
              atom.commands.dispatch(editorElement, 'pane:split-right');
            }
            waitsFor('text editor', function() {
              return editor = atom.workspace.getTextEditors()[1];
            });
            waitsFor('color buffer element', function() {
              return colorBufferElement = atom.views.getView(project.colorBufferForEditor(editor));
            });
            return waitsFor('color buffer element markers', function() {
              return getEditorDecorations('native-background').length;
            });
          });
          return it('should keep all the buffer elements attached', function() {
            var editors;
            editors = atom.workspace.getTextEditors();
            return editors.forEach(function(editor) {
              editorElement = atom.views.getView(editor);
              colorBufferElement = editorElement.querySelector('pigments-markers');
              expect(colorBufferElement).toExist();
              return expect(getEditorDecorations('native-background').length).toEqual(4);
            });
          });
        });
        return describe('when the marker type is set to gutter', function() {
          var gutter;
          gutter = [][0];
          beforeEach(function() {
            waitsForPromise(function() {
              return colorBuffer.initialize();
            });
            return runs(function() {
              atom.config.set('pigments.markerType', 'gutter');
              return gutter = editorElement.querySelector('[gutter-name="pigments-gutter"]');
            });
          });
          it('removes the markers', function() {
            return expect(colorBufferElement.querySelectorAll('pigments-color-marker').length).toEqual(0);
          });
          it('adds a custom gutter to the text editor', function() {
            return expect(gutter).toExist();
          });
          it('sets the size of the gutter based on the number of markers in the same row', function() {
            return expect(gutter.style.minWidth).toEqual('14px');
          });
          it('adds a gutter decoration for each color marker', function() {
            var decorations;
            decorations = editor.getDecorations().filter(function(d) {
              return d.properties.type === 'gutter';
            });
            return expect(decorations.length).toEqual(3);
          });
          describe('when the variables become available', function() {
            beforeEach(function() {
              return waitsForPromise(function() {
                return colorBuffer.variablesAvailable();
              });
            });
            it('creates decorations for the new valid colors', function() {
              var decorations;
              decorations = editor.getDecorations().filter(function(d) {
                return d.properties.type === 'gutter';
              });
              return expect(decorations.length).toEqual(4);
            });
            return describe('when many markers are added on the same line', function() {
              beforeEach(function() {
                var updateSpy;
                updateSpy = jasmine.createSpy('did-update');
                colorBufferElement.onDidUpdate(updateSpy);
                editor.moveToBottom();
                editBuffer('\nlist = #123456, #987654, #abcdef\n');
                return waitsFor(function() {
                  return updateSpy.callCount > 0;
                });
              });
              it('adds the new decorations to the gutter', function() {
                var decorations;
                decorations = editor.getDecorations().filter(function(d) {
                  return d.properties.type === 'gutter';
                });
                return expect(decorations.length).toEqual(7);
              });
              it('sets the size of the gutter based on the number of markers in the same row', function() {
                return expect(gutter.style.minWidth).toEqual('42px');
              });
              return describe('clicking on a gutter decoration', function() {
                beforeEach(function() {
                  var decoration;
                  project.colorPickerAPI = {
                    open: jasmine.createSpy('color-picker.open')
                  };
                  decoration = editorElement.querySelector('.pigments-gutter-marker span');
                  return mousedown(decoration);
                });
                it('selects the text in the editor', function() {
                  return expect(editor.getSelectedScreenRange()).toEqual([[0, 13], [0, 17]]);
                });
                return it('opens the color picker', function() {
                  return expect(project.colorPickerAPI.open).toHaveBeenCalled();
                });
              });
            });
          });
          describe('when the marker is changed again', function() {
            beforeEach(function() {
              return atom.config.set('pigments.markerType', 'native-background');
            });
            it('removes the gutter', function() {
              return expect(editorElement.querySelector('[gutter-name="pigments-gutter"]')).not.toExist();
            });
            return it('recreates the markers', function() {
              return expect(getEditorDecorations('native-background').length).toEqual(3);
            });
          });
          return describe('when a new buffer is opened', function() {
            beforeEach(function() {
              waitsForPromise(function() {
                return atom.workspace.open('project/styles/variables.styl').then(function(e) {
                  editor = e;
                  editorElement = atom.views.getView(editor);
                  colorBuffer = project.colorBufferForEditor(editor);
                  return colorBufferElement = atom.views.getView(colorBuffer);
                });
              });
              waitsForPromise(function() {
                return colorBuffer.initialize();
              });
              waitsForPromise(function() {
                return colorBuffer.variablesAvailable();
              });
              return runs(function() {
                return gutter = editorElement.querySelector('[gutter-name="pigments-gutter"]');
              });
            });
            return it('creates the decorations in the new buffer gutter', function() {
              var decorations;
              decorations = editor.getDecorations().filter(function(d) {
                return d.properties.type === 'gutter';
              });
              return expect(decorations.length).toEqual(10);
            });
          });
        });
      });
      describe('when the editor is moved to another pane', function() {
        var newPane, pane, ref1;
        ref1 = [], pane = ref1[0], newPane = ref1[1];
        beforeEach(function() {
          pane = atom.workspace.getActivePane();
          newPane = pane.splitDown({
            copyActiveItem: false
          });
          colorBuffer = project.colorBufferForEditor(editor);
          colorBufferElement = atom.views.getView(colorBuffer);
          pane.moveItemToPane(editor, newPane, 0);
          return waitsFor(function() {
            return getEditorDecorations('native-background').length;
          });
        });
        return it('moves the editor with the buffer to the new pane', function() {
          return expect(getEditorDecorations('native-background').length).toEqual(3);
        });
      });
      describe('when pigments.supportedFiletypes settings is defined', function() {
        var loadBuffer;
        loadBuffer = function(filePath) {
          waitsForPromise(function() {
            return atom.workspace.open(filePath).then(function(o) {
              editor = o;
              editorElement = atom.views.getView(editor);
              colorBuffer = project.colorBufferForEditor(editor);
              colorBufferElement = atom.views.getView(colorBuffer);
              return colorBufferElement.attach();
            });
          });
          waitsForPromise(function() {
            return colorBuffer.initialize();
          });
          return waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
        };
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-coffee-script');
          });
          return waitsForPromise(function() {
            return atom.packages.activatePackage('language-less');
          });
        });
        describe('with the default wildcard', function() {
          beforeEach(function() {
            return atom.config.set('pigments.supportedFiletypes', ['*']);
          });
          return it('supports every filetype', function() {
            loadBuffer('scope-filter.coffee');
            runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(2);
            });
            loadBuffer('project/vendor/css/variables.less');
            return runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(20);
            });
          });
        });
        describe('with a filetype', function() {
          beforeEach(function() {
            return atom.config.set('pigments.supportedFiletypes', ['coffee']);
          });
          return it('supports the specified file type', function() {
            loadBuffer('scope-filter.coffee');
            runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(2);
            });
            loadBuffer('project/vendor/css/variables.less');
            return runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(0);
            });
          });
        });
        return describe('with many filetypes', function() {
          beforeEach(function() {
            atom.config.set('pigments.supportedFiletypes', ['coffee']);
            return project.setSupportedFiletypes(['less']);
          });
          it('supports the specified file types', function() {
            loadBuffer('scope-filter.coffee');
            runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(2);
            });
            loadBuffer('project/vendor/css/variables.less');
            runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(20);
            });
            loadBuffer('four-variables.styl');
            return runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(0);
            });
          });
          return describe('with global file types ignored', function() {
            beforeEach(function() {
              atom.config.set('pigments.supportedFiletypes', ['coffee']);
              project.setIgnoreGlobalSupportedFiletypes(true);
              return project.setSupportedFiletypes(['less']);
            });
            return it('supports the specified file types', function() {
              loadBuffer('scope-filter.coffee');
              runs(function() {
                return expect(getEditorDecorations('native-background').length).toEqual(0);
              });
              loadBuffer('project/vendor/css/variables.less');
              runs(function() {
                return expect(getEditorDecorations('native-background').length).toEqual(20);
              });
              loadBuffer('four-variables.styl');
              return runs(function() {
                return expect(getEditorDecorations('native-background').length).toEqual(0);
              });
            });
          });
        });
      });
      return describe('when pigments.ignoredScopes settings is defined', function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-coffee-script');
          });
          waitsForPromise(function() {
            return atom.workspace.open('scope-filter.coffee').then(function(o) {
              editor = o;
              editorElement = atom.views.getView(editor);
              colorBuffer = project.colorBufferForEditor(editor);
              colorBufferElement = atom.views.getView(colorBuffer);
              return colorBufferElement.attach();
            });
          });
          return waitsForPromise(function() {
            return colorBuffer.initialize();
          });
        });
        describe('with one filter', function() {
          beforeEach(function() {
            return atom.config.set('pigments.ignoredScopes', ['\\.comment']);
          });
          return it('ignores the colors that matches the defined scopes', function() {
            return expect(getEditorDecorations('native-background').length).toEqual(1);
          });
        });
        describe('with two filters', function() {
          beforeEach(function() {
            return atom.config.set('pigments.ignoredScopes', ['\\.string', '\\.comment']);
          });
          return it('ignores the colors that matches the defined scopes', function() {
            return expect(getEditorDecorations('native-background').length).toEqual(0);
          });
        });
        describe('with an invalid filter', function() {
          beforeEach(function() {
            return atom.config.set('pigments.ignoredScopes', ['\\']);
          });
          return it('ignores the filter', function() {
            return expect(getEditorDecorations('native-background').length).toEqual(2);
          });
        });
        return describe('when the project ignoredScopes is defined', function() {
          beforeEach(function() {
            atom.config.set('pigments.ignoredScopes', ['\\.string']);
            return project.setIgnoredScopes(['\\.comment']);
          });
          return it('ignores the colors that matches the defined scopes', function() {
            return expect(getEditorDecorations('native-background').length).toEqual(0);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9jb2xvci1idWZmZXItZWxlbWVudC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE9BQUEsQ0FBUSx1QkFBUjs7RUFDQyxZQUFhLE9BQUEsQ0FBUSxrQkFBUjs7RUFFZCxrQkFBQSxHQUFxQixPQUFBLENBQVEsNkJBQVI7O0VBRXJCLEtBQUEsR0FBUSxTQUFDLFFBQUQ7QUFDTixRQUFBO0lBQUEsQ0FBQSxHQUFRLElBQUEsSUFBQSxDQUFBO1dBQ1IsUUFBQSxDQUFTLFNBQUE7YUFBTyxJQUFBLElBQUEsQ0FBQSxDQUFKLEdBQWEsQ0FBYixHQUFpQjtJQUFwQixDQUFUO0VBRk07O0VBSVIsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUE7QUFDN0IsUUFBQTtJQUFBLE1BQThGLEVBQTlGLEVBQUMsZUFBRCxFQUFTLHNCQUFULEVBQXdCLG9CQUF4QixFQUFxQyxpQkFBckMsRUFBK0MsZ0JBQS9DLEVBQXdELDJCQUF4RCxFQUE0RTtJQUU1RSxTQUFBLEdBQVksU0FBQyxVQUFEO2FBQ1YsQ0FBSSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsVUFBVSxDQUFDLFVBQVUsRUFBQyxLQUFELEVBQTFDO0lBRE07SUFHWixVQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sT0FBUDtBQUNYLFVBQUE7O1FBRGtCLFVBQVE7O01BQzFCLElBQUcscUJBQUg7UUFDRSxJQUFHLG1CQUFIO1VBQ0UsS0FBQSxHQUFRLENBQUMsT0FBTyxDQUFDLEtBQVQsRUFBZ0IsT0FBTyxDQUFDLEdBQXhCLEVBRFY7U0FBQSxNQUFBO1VBR0UsS0FBQSxHQUFRLENBQUMsT0FBTyxDQUFDLEtBQVQsRUFBZ0IsT0FBTyxDQUFDLEtBQXhCLEVBSFY7O1FBS0EsTUFBTSxDQUFD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d0JBQVQsRUFBbUMsU0FBQTtVQUNqQyxVQUFBLENBQVcsU0FBQTttQkFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0JBQWhCLEVBQTBDLENBQUMsSUFBRCxDQUExQztVQURTLENBQVg7aUJBR0EsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUE7bUJBQ3ZCLE1BQUEsQ0FBTyxvQkFBQSxDQUFxQixtQkFBckIsQ0FBeUMsQ0FBQyxNQUFqRCxDQUF3RCxDQUFDLE9BQXpELENBQWlFLENBQWpFO1VBRHVCLENBQXpCO1FBSmlDLENBQW5DO2VBT0EsUUFBQSxDQUFTLDJDQUFULEVBQXNELFNBQUE7VUFDcEQsVUFBQSxDQUFXLFNBQUE7WUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0JBQWhCLEVBQTBDLENBQUMsV0FBRCxDQUExQzttQkFDQSxPQUFPLENBQUMsZ0JBQVIsQ0FBeUIsQ0FBQyxZQUFELENBQXpCO1VBRlMsQ0FBWDtpQkFJQSxFQUFBLENBQUcsb0RBQUgsRUFBeUQsU0FBQTttQkFDdkQsTUFBQSxDQUFPLG9CQUFBLENBQXFCLG1CQUFyQixDQUF5QyxDQUFDLE1BQWpELENBQXdELENBQUMsT0FBekQsQ0FBaUUsQ0FBakU7VUFEdUQsQ0FBekQ7UUFMb0QsQ0FBdEQ7TUFwQzBELENBQTVEO0lBalRtQyxDQUFyQztFQXpENkIsQ0FBL0I7QUFWQSIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xucmVxdWlyZSAnLi9oZWxwZXJzL3NwZWMtaGVscGVyJ1xue21vdXNlZG93bn0gPSByZXF1aXJlICcuL2hlbHBlcnMvZXZlbnRzJ1xuXG5Db2xvckJ1ZmZlckVsZW1lbnQgPSByZXF1aXJlICcuLi9saWIvY29sb3ItYnVmZmVyLWVsZW1lbnQnXG5cbnNsZWVwID0gKGR1cmF0aW9uKSAtPlxuICB0ID0gbmV3IERhdGUoKVxuICB3YWl0c0ZvciAtPiBuZXcgRGF0ZSgpIC0gdCA+IGR1cmF0aW9uXG5cbmRlc2NyaWJlICdDb2xvckJ1ZmZlckVsZW1lbnQnLCAtPlxuICBbZWRpdG9yLCBlZGl0b3JFbGVtZW50LCBjb2xvckJ1ZmZlciwgcGlnbWVudHMsIHByb2plY3QsIGNvbG9yQnVmZmVyRWxlbWVudCwgamFzbWluZUNvbnRlbnRdID0gW11cblxuICBpc1Zpc2libGUgPSAoZGVjb3JhdGlvbikgLT5cbiAgICBub3QgLy1pbi1zZWxlY3Rpb24vLnRlc3QgZGVjb3JhdGlvbi5wcm9wZXJ0aWVzLmNsYXNzXG5cbiAgZWRpdEJ1ZmZlciA9ICh0ZXh0LCBvcHRpb25zPXt9KSAtPlxuICAgIGlmIG9wdGlvbnMuc3RhcnQ/XG4gICAgICBpZiBvcHRpb25zLmVuZD9cbiAgICAgICAgcmFuZ2UgPSBbb3B0aW9ucy5zdGFydCwgb3B0aW9ucy5lbmRdXG4gICAgICBlbHNlXG4gICAgICAgIHJhbmdlID0gW29wdGlvbnMuc3RhcnQsIG9wdGlvbnMuc3RhcnRdXG5cbiAgICAgIGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKHJhbmdlKVxuXG4gICAgZWRpdG9yLmluc2VydFRleHQodGV4dClcbiAgICBhZHZhbmNlQ2xvY2soNTAwKSB1bmxlc3Mgb3B0aW9ucy5ub0V2ZW50XG5cbiAganNvbkZpeHR1cmUgPSAoZml4dHVyZSwgZGF0YSkgLT5cbiAgICBqc29uUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdmaXh0dXJlcycsIGZpeHR1cmUpXG4gICAganNvbiA9IGZzLnJlYWRGaWxlU3luYyhqc29uUGF0aCkudG9TdHJpbmcoKVxuICAgIGpzb24gPSBqc29uLnJlcGxhY2UgLyNcXHsoXFx3KylcXH0vZywgKG0sdykgLT4gZGF0YVt3XVxuXG4gICAgSlNPTi5wYXJzZShqc29uKVxuXG4gIGdldEVkaXRvckRlY29yYXRpb25zID0gKHR5cGUpIC0+XG4gICAgZWRpdG9yLmdldERlY29yYXRpb25zKClcbiAgICAuZmlsdGVyKChkKSAtPiBkLnByb3BlcnRpZXMuY2xhc3Muc3RhcnRzV2l0aCAncGlnbWVudHMtbmF0aXZlLWJhY2tncm91bmQnKVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgIGphc21pbmVDb250ZW50ID0gZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCcjamFzbWluZS1jb250ZW50JylcblxuICAgIGphc21pbmVDb250ZW50LmFwcGVuZENoaWxkKHdvcmtzcGFjZUVsZW1lbnQpXG5cbiAgICBhdG9tLmNvbmZpZy5zZXQgJ2VkaXRvci5zb2Z0V3JhcCcsIHRydWVcbiAgICBhdG9tLmNvbmZpZy5zZXQgJ2VkaXRvci5zb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCcsIHRydWVcbiAgICBhdG9tLmNvbmZpZy5zZXQgJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJywgNDBcblxuICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuZGVsYXlCZWZvcmVTY2FuJywgMFxuICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuc291cmNlTmFtZXMnLCBbXG4gICAgICAnKi5zdHlsJ1xuICAgICAgJyoubGVzcydcbiAgICBdXG5cbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ2ZvdXItdmFyaWFibGVzLnN0eWwnKS50aGVuIChvKSAtPlxuICAgICAgICBlZGl0b3IgPSBvXG4gICAgICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdwaWdtZW50cycpLnRoZW4gKHBrZykgLT5cbiAgICAgIHBpZ21lbnRzID0gcGtnLm1haW5Nb2R1bGVcbiAgICAgIHByb2plY3QgPSBwaWdtZW50cy5nZXRQcm9qZWN0KClcblxuICBhZnRlckVhY2ggLT5cbiAgICBjb2xvckJ1ZmZlcj8uZGVzdHJveSgpXG5cbiAgZGVzY3JpYmUgJ3doZW4gYW4gZWRpdG9yIGlzIG9wZW5lZCcsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcbiAgICAgIGNvbG9yQnVmZmVyRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyhjb2xvckJ1ZmZlcilcbiAgICAgIGNvbG9yQnVmZmVyRWxlbWVudC5hdHRhY2goKVxuXG4gICAgaXQgJ2lzIGFzc29jaWF0ZWQgdG8gdGhlIENvbG9yQnVmZmVyIG1vZGVsJywgLT5cbiAgICAgIGV4cGVjdChjb2xvckJ1ZmZlckVsZW1lbnQpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChjb2xvckJ1ZmZlckVsZW1lbnQuZ2V0TW9kZWwoKSkudG9CZShjb2xvckJ1ZmZlcilcblxuICAgIGl0ICdhdHRhY2hlcyBpdHNlbGYgaW4gdGhlIHRhcmdldCB0ZXh0IGVkaXRvciBlbGVtZW50JywgLT5cbiAgICAgIGV4cGVjdChjb2xvckJ1ZmZlckVsZW1lbnQucGFyZW50Tm9kZSkudG9FeGlzdCgpXG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcubGluZXMgcGlnbWVudHMtbWFya2VycycpKS50b0V4aXN0KClcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZSBjb2xvciBidWZmZXIgaXMgaW5pdGlhbGl6ZWQnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIuaW5pdGlhbGl6ZSgpXG5cbiAgICAgIGl0ICdjcmVhdGVzIG1hcmtlcnMgdmlld3MgZm9yIGV2ZXJ5IHZpc2libGUgYnVmZmVyIG1hcmtlcicsIC0+XG4gICAgICAgIGV4cGVjdChnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKS5sZW5ndGgpLnRvRXF1YWwoMylcblxuICAgICAgZGVzY3JpYmUgJ3doZW4gdGhlIHByb2plY3QgdmFyaWFibGVzIGFyZSBpbml0aWFsaXplZCcsIC0+XG4gICAgICAgIGl0ICdjcmVhdGVzIG1hcmtlcnMgZm9yIHRoZSBuZXcgdmFsaWQgY29sb3JzJywgLT5cbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBleHBlY3QoZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJykubGVuZ3RoKS50b0VxdWFsKDQpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIGEgc2VsZWN0aW9uIGludGVyc2VjdHMgYSBtYXJrZXIgcmFuZ2UnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc3B5T24oY29sb3JCdWZmZXJFbGVtZW50LCAndXBkYXRlU2VsZWN0aW9ucycpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBkZXNjcmliZSAnYWZ0ZXIgdGhlIG1hcmtlcnMgdmlld3Mgd2FzIGNyZWF0ZWQnLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci52YXJpYWJsZXNBdmFpbGFibGUoKVxuICAgICAgICAgICAgcnVucyAtPiBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSBbWzIsMTJdLFsyLCAxNF1dXG4gICAgICAgICAgICB3YWl0c0ZvciAtPiBjb2xvckJ1ZmZlckVsZW1lbnQudXBkYXRlU2VsZWN0aW9ucy5jYWxsQ291bnQgPiAwXG5cbiAgICAgICAgICBpdCAnaGlkZXMgdGhlIGludGVyc2VjdGVkIG1hcmtlcicsIC0+XG4gICAgICAgICAgICBkZWNvcmF0aW9ucyA9IGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpXG5cbiAgICAgICAgICAgIGV4cGVjdChpc1Zpc2libGUoZGVjb3JhdGlvbnNbMF0pKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICAgIGV4cGVjdChpc1Zpc2libGUoZGVjb3JhdGlvbnNbMV0pKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICAgIGV4cGVjdChpc1Zpc2libGUoZGVjb3JhdGlvbnNbMl0pKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICAgIGV4cGVjdChpc1Zpc2libGUoZGVjb3JhdGlvbnNbM10pKS50b0JlRmFsc3koKVxuXG4gICAgICAgIGRlc2NyaWJlICdiZWZvcmUgYWxsIHRoZSBtYXJrZXJzIHZpZXdzIHdhcyBjcmVhdGVkJywgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBydW5zIC0+IGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlIFtbMCwwXSxbMiwgMTRdXVxuICAgICAgICAgICAgd2FpdHNGb3IgLT4gY29sb3JCdWZmZXJFbGVtZW50LnVwZGF0ZVNlbGVjdGlvbnMuY2FsbENvdW50ID4gMFxuXG4gICAgICAgICAgaXQgJ2hpZGVzIHRoZSBleGlzdGluZyBtYXJrZXJzJywgLT5cbiAgICAgICAgICAgIGRlY29yYXRpb25zID0gZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJylcblxuICAgICAgICAgICAgZXhwZWN0KGlzVmlzaWJsZShkZWNvcmF0aW9uc1swXSkpLnRvQmVGYWxzeSgpXG4gICAgICAgICAgICBleHBlY3QoaXNWaXNpYmxlKGRlY29yYXRpb25zWzFdKSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgICBleHBlY3QoaXNWaXNpYmxlKGRlY29yYXRpb25zWzJdKSkudG9CZVRydXRoeSgpXG5cbiAgICAgICAgICBkZXNjcmliZSAnYW5kIHRoZSBtYXJrZXJzIGFyZSB1cGRhdGVkJywgLT5cbiAgICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgICAgd2FpdHNGb3JQcm9taXNlICdjb2xvcnMgYXZhaWxhYmxlJywgLT5cbiAgICAgICAgICAgICAgICBjb2xvckJ1ZmZlci52YXJpYWJsZXNBdmFpbGFibGUoKVxuICAgICAgICAgICAgICB3YWl0c0ZvciAnbGFzdCBtYXJrZXIgdmlzaWJsZScsIC0+XG4gICAgICAgICAgICAgICAgZGVjb3JhdGlvbnMgPSBnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKVxuICAgICAgICAgICAgICAgIGlzVmlzaWJsZShkZWNvcmF0aW9uc1szXSlcblxuICAgICAgICAgICAgaXQgJ2hpZGVzIHRoZSBjcmVhdGVkIG1hcmtlcnMnLCAtPlxuICAgICAgICAgICAgICBkZWNvcmF0aW9ucyA9IGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpXG4gICAgICAgICAgICAgIGV4cGVjdChpc1Zpc2libGUoZGVjb3JhdGlvbnNbMF0pKS50b0JlRmFsc3koKVxuICAgICAgICAgICAgICBleHBlY3QoaXNWaXNpYmxlKGRlY29yYXRpb25zWzFdKSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgICAgIGV4cGVjdChpc1Zpc2libGUoZGVjb3JhdGlvbnNbMl0pKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICAgICAgZXhwZWN0KGlzVmlzaWJsZShkZWNvcmF0aW9uc1szXSkpLnRvQmVUcnV0aHkoKVxuXG4gICAgICBkZXNjcmliZSAnd2hlbiBzb21lIG1hcmtlcnMgYXJlIGRlc3Ryb3llZCcsIC0+XG4gICAgICAgIFtzcHldID0gW11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGZvciBlbCBpbiBjb2xvckJ1ZmZlckVsZW1lbnQudXNlZE1hcmtlcnNcbiAgICAgICAgICAgIHNweU9uKGVsLCAncmVsZWFzZScpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICAgIHNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtdXBkYXRlJylcbiAgICAgICAgICBjb2xvckJ1ZmZlckVsZW1lbnQub25EaWRVcGRhdGUoc3B5KVxuICAgICAgICAgIGVkaXRCdWZmZXIgJycsIHN0YXJ0OiBbNCwwXSwgZW5kOiBbOCwwXVxuICAgICAgICAgIHdhaXRzRm9yIC0+IHNweS5jYWxsQ291bnQgPiAwXG5cbiAgICAgICAgaXQgJ3JlbGVhc2VzIHRoZSB1bnVzZWQgbWFya2VycycsIC0+XG4gICAgICAgICAgZXhwZWN0KGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpLmxlbmd0aCkudG9FcXVhbCgyKVxuXG4gICAgICBkZXNjcmliZSAnd2hlbiB0aGUgY3VycmVudCBwYW5lIGlzIHNwbGl0dGVkIHRvIHRoZSByaWdodCcsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICB2ZXJzaW9uID0gcGFyc2VGbG9hdChhdG9tLmdldFZlcnNpb24oKS5zcGxpdCgnLicpLnNsaWNlKDEsMikuam9pbignLicpKVxuICAgICAgICAgIGlmIHZlcnNpb24gPiA1XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdwYW5lOnNwbGl0LXJpZ2h0LWFuZC1jb3B5LWFjdGl2ZS1pdGVtJylcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdwYW5lOnNwbGl0LXJpZ2h0JylcblxuICAgICAgICAgIHdhaXRzRm9yICd0ZXh0IGVkaXRvcicsIC0+XG4gICAgICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpWzFdXG5cbiAgICAgICAgICB3YWl0c0ZvciAnY29sb3IgYnVmZmVyIGVsZW1lbnQnLCAtPlxuICAgICAgICAgICAgY29sb3JCdWZmZXJFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KHByb2plY3QuY29sb3JCdWZmZXJGb3JFZGl0b3IoZWRpdG9yKSlcbiAgICAgICAgICB3YWl0c0ZvciAnY29sb3IgYnVmZmVyIGVsZW1lbnQgbWFya2VycycsIC0+XG4gICAgICAgICAgICBnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKS5sZW5ndGhcblxuICAgICAgICBpdCAnc2hvdWxkIGtlZXAgYWxsIHRoZSBidWZmZXIgZWxlbWVudHMgYXR0YWNoZWQnLCAtPlxuICAgICAgICAgIGVkaXRvcnMgPSBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpXG5cbiAgICAgICAgICBlZGl0b3JzLmZvckVhY2ggKGVkaXRvcikgLT5cbiAgICAgICAgICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgICAgICAgY29sb3JCdWZmZXJFbGVtZW50ID0gZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdwaWdtZW50cy1tYXJrZXJzJylcbiAgICAgICAgICAgIGV4cGVjdChjb2xvckJ1ZmZlckVsZW1lbnQpLnRvRXhpc3QoKVxuXG4gICAgICAgICAgICBleHBlY3QoZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJykubGVuZ3RoKS50b0VxdWFsKDQpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIHRoZSBtYXJrZXIgdHlwZSBpcyBzZXQgdG8gZ3V0dGVyJywgLT5cbiAgICAgICAgW2d1dHRlcl0gPSBbXVxuXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIuaW5pdGlhbGl6ZSgpXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5tYXJrZXJUeXBlJywgJ2d1dHRlcidcbiAgICAgICAgICAgIGd1dHRlciA9IGVkaXRvckVsZW1lbnQucXVlcnlTZWxlY3RvcignW2d1dHRlci1uYW1lPVwicGlnbWVudHMtZ3V0dGVyXCJdJylcblxuICAgICAgICBpdCAncmVtb3ZlcyB0aGUgbWFya2VycycsIC0+XG4gICAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdwaWdtZW50cy1jb2xvci1tYXJrZXInKS5sZW5ndGgpLnRvRXF1YWwoMClcblxuICAgICAgICBpdCAnYWRkcyBhIGN1c3RvbSBndXR0ZXIgdG8gdGhlIHRleHQgZWRpdG9yJywgLT5cbiAgICAgICAgICBleHBlY3QoZ3V0dGVyKS50b0V4aXN0KClcblxuICAgICAgICBpdCAnc2V0cyB0aGUgc2l6ZSBvZiB0aGUgZ3V0dGVyIGJhc2VkIG9uIHRoZSBudW1iZXIgb2YgbWFya2VycyBpbiB0aGUgc2FtZSByb3cnLCAtPlxuICAgICAgICAgIGV4cGVjdChndXR0ZXIuc3R5bGUubWluV2lkdGgpLnRvRXF1YWwoJzE0cHgnKVxuXG4gICAgICAgIGl0ICdhZGRzIGEgZ3V0dGVyIGRlY29yYXRpb24gZm9yIGVhY2ggY29sb3IgbWFya2VyJywgLT5cbiAgICAgICAgICBkZWNvcmF0aW9ucyA9IGVkaXRvci5nZXREZWNvcmF0aW9ucygpLmZpbHRlciAoZCkgLT5cbiAgICAgICAgICAgIGQucHJvcGVydGllcy50eXBlIGlzICdndXR0ZXInXG4gICAgICAgICAgZXhwZWN0KGRlY29yYXRpb25zLmxlbmd0aCkudG9FcXVhbCgzKVxuXG4gICAgICAgIGRlc2NyaWJlICd3aGVuIHRoZSB2YXJpYWJsZXMgYmVjb21lIGF2YWlsYWJsZScsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG5cbiAgICAgICAgICBpdCAnY3JlYXRlcyBkZWNvcmF0aW9ucyBmb3IgdGhlIG5ldyB2YWxpZCBjb2xvcnMnLCAtPlxuICAgICAgICAgICAgZGVjb3JhdGlvbnMgPSBlZGl0b3IuZ2V0RGVjb3JhdGlvbnMoKS5maWx0ZXIgKGQpIC0+XG4gICAgICAgICAgICAgIGQucHJvcGVydGllcy50eXBlIGlzICdndXR0ZXInXG4gICAgICAgICAgICBleHBlY3QoZGVjb3JhdGlvbnMubGVuZ3RoKS50b0VxdWFsKDQpXG5cbiAgICAgICAgICBkZXNjcmliZSAnd2hlbiBtYW55IG1hcmtlcnMgYXJlIGFkZGVkIG9uIHRoZSBzYW1lIGxpbmUnLCAtPlxuICAgICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgICB1cGRhdGVTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLXVwZGF0ZScpXG4gICAgICAgICAgICAgIGNvbG9yQnVmZmVyRWxlbWVudC5vbkRpZFVwZGF0ZSh1cGRhdGVTcHkpXG5cbiAgICAgICAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgICAgICAgIGVkaXRCdWZmZXIgJ1xcbmxpc3QgPSAjMTIzNDU2LCAjOTg3NjU0LCAjYWJjZGVmXFxuJ1xuICAgICAgICAgICAgICB3YWl0c0ZvciAtPiB1cGRhdGVTcHkuY2FsbENvdW50ID4gMFxuXG4gICAgICAgICAgICBpdCAnYWRkcyB0aGUgbmV3IGRlY29yYXRpb25zIHRvIHRoZSBndXR0ZXInLCAtPlxuICAgICAgICAgICAgICBkZWNvcmF0aW9ucyA9IGVkaXRvci5nZXREZWNvcmF0aW9ucygpLmZpbHRlciAoZCkgLT5cbiAgICAgICAgICAgICAgICBkLnByb3BlcnRpZXMudHlwZSBpcyAnZ3V0dGVyJ1xuXG4gICAgICAgICAgICAgIGV4cGVjdChkZWNvcmF0aW9ucy5sZW5ndGgpLnRvRXF1YWwoNylcblxuICAgICAgICAgICAgaXQgJ3NldHMgdGhlIHNpemUgb2YgdGhlIGd1dHRlciBiYXNlZCBvbiB0aGUgbnVtYmVyIG9mIG1hcmtlcnMgaW4gdGhlIHNhbWUgcm93JywgLT5cbiAgICAgICAgICAgICAgZXhwZWN0KGd1dHRlci5zdHlsZS5taW5XaWR0aCkudG9FcXVhbCgnNDJweCcpXG5cbiAgICAgICAgICAgIGRlc2NyaWJlICdjbGlja2luZyBvbiBhIGd1dHRlciBkZWNvcmF0aW9uJywgLT5cbiAgICAgICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgICAgIHByb2plY3QuY29sb3JQaWNrZXJBUEkgPVxuICAgICAgICAgICAgICAgICAgb3BlbjogamFzbWluZS5jcmVhdGVTcHkoJ2NvbG9yLXBpY2tlci5vcGVuJylcblxuICAgICAgICAgICAgICAgIGRlY29yYXRpb24gPSBlZGl0b3JFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5waWdtZW50cy1ndXR0ZXItbWFya2VyIHNwYW4nKVxuICAgICAgICAgICAgICAgIG1vdXNlZG93bihkZWNvcmF0aW9uKVxuXG4gICAgICAgICAgICAgIGl0ICdzZWxlY3RzIHRoZSB0ZXh0IGluIHRoZSBlZGl0b3InLCAtPlxuICAgICAgICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0U2VsZWN0ZWRTY3JlZW5SYW5nZSgpKS50b0VxdWFsKFtbMCwxM10sWzAsMTddXSlcblxuICAgICAgICAgICAgICBpdCAnb3BlbnMgdGhlIGNvbG9yIHBpY2tlcicsIC0+XG4gICAgICAgICAgICAgICAgZXhwZWN0KHByb2plY3QuY29sb3JQaWNrZXJBUEkub3BlbikudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgICAgZGVzY3JpYmUgJ3doZW4gdGhlIG1hcmtlciBpcyBjaGFuZ2VkIGFnYWluJywgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLm1hcmtlclR5cGUnLCAnbmF0aXZlLWJhY2tncm91bmQnXG5cbiAgICAgICAgICBpdCAncmVtb3ZlcyB0aGUgZ3V0dGVyJywgLT5cbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tndXR0ZXItbmFtZT1cInBpZ21lbnRzLWd1dHRlclwiXScpKS5ub3QudG9FeGlzdCgpXG5cbiAgICAgICAgICBpdCAncmVjcmVhdGVzIHRoZSBtYXJrZXJzJywgLT5cbiAgICAgICAgICAgIGV4cGVjdChnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKS5sZW5ndGgpLnRvRXF1YWwoMylcblxuICAgICAgICBkZXNjcmliZSAnd2hlbiBhIG5ldyBidWZmZXIgaXMgb3BlbmVkJywgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigncHJvamVjdC9zdHlsZXMvdmFyaWFibGVzLnN0eWwnKS50aGVuIChlKSAtPlxuICAgICAgICAgICAgICAgIGVkaXRvciA9IGVcbiAgICAgICAgICAgICAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICAgICAgICAgICAgICBjb2xvckJ1ZmZlciA9IHByb2plY3QuY29sb3JCdWZmZXJGb3JFZGl0b3IoZWRpdG9yKVxuICAgICAgICAgICAgICAgIGNvbG9yQnVmZmVyRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyhjb2xvckJ1ZmZlcilcblxuICAgICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLmluaXRpYWxpemUoKVxuICAgICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG5cbiAgICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgICAgZ3V0dGVyID0gZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdbZ3V0dGVyLW5hbWU9XCJwaWdtZW50cy1ndXR0ZXJcIl0nKVxuXG4gICAgICAgICAgaXQgJ2NyZWF0ZXMgdGhlIGRlY29yYXRpb25zIGluIHRoZSBuZXcgYnVmZmVyIGd1dHRlcicsIC0+XG4gICAgICAgICAgICBkZWNvcmF0aW9ucyA9IGVkaXRvci5nZXREZWNvcmF0aW9ucygpLmZpbHRlciAoZCkgLT5cbiAgICAgICAgICAgICAgZC5wcm9wZXJ0aWVzLnR5cGUgaXMgJ2d1dHRlcidcblxuICAgICAgICAgICAgZXhwZWN0KGRlY29yYXRpb25zLmxlbmd0aCkudG9FcXVhbCgxMClcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZSBlZGl0b3IgaXMgbW92ZWQgdG8gYW5vdGhlciBwYW5lJywgLT5cbiAgICAgIFtwYW5lLCBuZXdQYW5lXSA9IFtdXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgbmV3UGFuZSA9IHBhbmUuc3BsaXREb3duKGNvcHlBY3RpdmVJdGVtOiBmYWxzZSlcbiAgICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcbiAgICAgICAgY29sb3JCdWZmZXJFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGNvbG9yQnVmZmVyKVxuXG4gICAgICAgIHBhbmUubW92ZUl0ZW1Ub1BhbmUoZWRpdG9yLCBuZXdQYW5lLCAwKVxuXG4gICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJykubGVuZ3RoXG5cbiAgICAgIGl0ICdtb3ZlcyB0aGUgZWRpdG9yIHdpdGggdGhlIGJ1ZmZlciB0byB0aGUgbmV3IHBhbmUnLCAtPlxuICAgICAgICBleHBlY3QoZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJykubGVuZ3RoKS50b0VxdWFsKDMpXG5cbiAgICBkZXNjcmliZSAnd2hlbiBwaWdtZW50cy5zdXBwb3J0ZWRGaWxldHlwZXMgc2V0dGluZ3MgaXMgZGVmaW5lZCcsIC0+XG4gICAgICBsb2FkQnVmZmVyID0gKGZpbGVQYXRoKSAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKS50aGVuIChvKSAtPlxuICAgICAgICAgICAgZWRpdG9yID0gb1xuICAgICAgICAgICAgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgICAgICAgICBjb2xvckJ1ZmZlciA9IHByb2plY3QuY29sb3JCdWZmZXJGb3JFZGl0b3IoZWRpdG9yKVxuICAgICAgICAgICAgY29sb3JCdWZmZXJFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGNvbG9yQnVmZmVyKVxuICAgICAgICAgICAgY29sb3JCdWZmZXJFbGVtZW50LmF0dGFjaCgpXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLmluaXRpYWxpemUoKVxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1sZXNzJylcblxuICAgICAgZGVzY3JpYmUgJ3dpdGggdGhlIGRlZmF1bHQgd2lsZGNhcmQnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5zdXBwb3J0ZWRGaWxldHlwZXMnLCBbJyonXVxuXG4gICAgICAgIGl0ICdzdXBwb3J0cyBldmVyeSBmaWxldHlwZScsIC0+XG4gICAgICAgICAgbG9hZEJ1ZmZlcignc2NvcGUtZmlsdGVyLmNvZmZlZScpXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpLmxlbmd0aCkudG9FcXVhbCgyKVxuXG4gICAgICAgICAgbG9hZEJ1ZmZlcigncHJvamVjdC92ZW5kb3IvY3NzL3ZhcmlhYmxlcy5sZXNzJylcbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBleHBlY3QoZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJykubGVuZ3RoKS50b0VxdWFsKDIwKVxuXG4gICAgICBkZXNjcmliZSAnd2l0aCBhIGZpbGV0eXBlJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuc3VwcG9ydGVkRmlsZXR5cGVzJywgWydjb2ZmZWUnXVxuXG4gICAgICAgIGl0ICdzdXBwb3J0cyB0aGUgc3BlY2lmaWVkIGZpbGUgdHlwZScsIC0+XG4gICAgICAgICAgbG9hZEJ1ZmZlcignc2NvcGUtZmlsdGVyLmNvZmZlZScpXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpLmxlbmd0aCkudG9FcXVhbCgyKVxuXG4gICAgICAgICAgbG9hZEJ1ZmZlcigncHJvamVjdC92ZW5kb3IvY3NzL3ZhcmlhYmxlcy5sZXNzJylcbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBleHBlY3QoZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJykubGVuZ3RoKS50b0VxdWFsKDApXG5cbiAgICAgIGRlc2NyaWJlICd3aXRoIG1hbnkgZmlsZXR5cGVzJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuc3VwcG9ydGVkRmlsZXR5cGVzJywgWydjb2ZmZWUnXVxuICAgICAgICAgIHByb2plY3Quc2V0U3VwcG9ydGVkRmlsZXR5cGVzKFsnbGVzcyddKVxuXG4gICAgICAgIGl0ICdzdXBwb3J0cyB0aGUgc3BlY2lmaWVkIGZpbGUgdHlwZXMnLCAtPlxuICAgICAgICAgIGxvYWRCdWZmZXIoJ3Njb3BlLWZpbHRlci5jb2ZmZWUnKVxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGV4cGVjdChnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKS5sZW5ndGgpLnRvRXF1YWwoMilcblxuICAgICAgICAgIGxvYWRCdWZmZXIoJ3Byb2plY3QvdmVuZG9yL2Nzcy92YXJpYWJsZXMubGVzcycpXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpLmxlbmd0aCkudG9FcXVhbCgyMClcblxuICAgICAgICAgIGxvYWRCdWZmZXIoJ2ZvdXItdmFyaWFibGVzLnN0eWwnKVxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGV4cGVjdChnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKS5sZW5ndGgpLnRvRXF1YWwoMClcblxuICAgICAgICBkZXNjcmliZSAnd2l0aCBnbG9iYWwgZmlsZSB0eXBlcyBpZ25vcmVkJywgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLnN1cHBvcnRlZEZpbGV0eXBlcycsIFsnY29mZmVlJ11cbiAgICAgICAgICAgIHByb2plY3Quc2V0SWdub3JlR2xvYmFsU3VwcG9ydGVkRmlsZXR5cGVzKHRydWUpXG4gICAgICAgICAgICBwcm9qZWN0LnNldFN1cHBvcnRlZEZpbGV0eXBlcyhbJ2xlc3MnXSlcblxuICAgICAgICAgIGl0ICdzdXBwb3J0cyB0aGUgc3BlY2lmaWVkIGZpbGUgdHlwZXMnLCAtPlxuICAgICAgICAgICAgbG9hZEJ1ZmZlcignc2NvcGUtZmlsdGVyLmNvZmZlZScpXG4gICAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICAgIGV4cGVjdChnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKS5sZW5ndGgpLnRvRXF1YWwoMClcblxuICAgICAgICAgICAgbG9hZEJ1ZmZlcigncHJvamVjdC92ZW5kb3IvY3NzL3ZhcmlhYmxlcy5sZXNzJylcbiAgICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgICAgZXhwZWN0KGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpLmxlbmd0aCkudG9FcXVhbCgyMClcblxuICAgICAgICAgICAgbG9hZEJ1ZmZlcignZm91ci12YXJpYWJsZXMuc3R5bCcpXG4gICAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICAgIGV4cGVjdChnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKS5sZW5ndGgpLnRvRXF1YWwoMClcblxuICAgIGRlc2NyaWJlICd3aGVuIHBpZ21lbnRzLmlnbm9yZWRTY29wZXMgc2V0dGluZ3MgaXMgZGVmaW5lZCcsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdzY29wZS1maWx0ZXIuY29mZmVlJykudGhlbiAobykgLT5cbiAgICAgICAgICAgIGVkaXRvciA9IG9cbiAgICAgICAgICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcbiAgICAgICAgICAgIGNvbG9yQnVmZmVyRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyhjb2xvckJ1ZmZlcilcbiAgICAgICAgICAgIGNvbG9yQnVmZmVyRWxlbWVudC5hdHRhY2goKVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci5pbml0aWFsaXplKClcblxuICAgICAgZGVzY3JpYmUgJ3dpdGggb25lIGZpbHRlcicsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLmlnbm9yZWRTY29wZXMnLCBbJ1xcXFwuY29tbWVudCddKVxuXG4gICAgICAgIGl0ICdpZ25vcmVzIHRoZSBjb2xvcnMgdGhhdCBtYXRjaGVzIHRoZSBkZWZpbmVkIHNjb3BlcycsIC0+XG4gICAgICAgICAgZXhwZWN0KGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpLmxlbmd0aCkudG9FcXVhbCgxKVxuXG4gICAgICBkZXNjcmliZSAnd2l0aCB0d28gZmlsdGVycycsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLmlnbm9yZWRTY29wZXMnLCBbJ1xcXFwuc3RyaW5nJywgJ1xcXFwuY29tbWVudCddKVxuXG4gICAgICAgIGl0ICdpZ25vcmVzIHRoZSBjb2xvcnMgdGhhdCBtYXRjaGVzIHRoZSBkZWZpbmVkIHNjb3BlcycsIC0+XG4gICAgICAgICAgZXhwZWN0KGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpLmxlbmd0aCkudG9FcXVhbCgwKVxuXG4gICAgICBkZXNjcmliZSAnd2l0aCBhbiBpbnZhbGlkIGZpbHRlcicsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLmlnbm9yZWRTY29wZXMnLCBbJ1xcXFwnXSlcblxuICAgICAgICBpdCAnaWdub3JlcyB0aGUgZmlsdGVyJywgLT5cbiAgICAgICAgICBleHBlY3QoZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJykubGVuZ3RoKS50b0VxdWFsKDIpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIHRoZSBwcm9qZWN0IGlnbm9yZWRTY29wZXMgaXMgZGVmaW5lZCcsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLmlnbm9yZWRTY29wZXMnLCBbJ1xcXFwuc3RyaW5nJ10pXG4gICAgICAgICAgcHJvamVjdC5zZXRJZ25vcmVkU2NvcGVzKFsnXFxcXC5jb21tZW50J10pXG5cbiAgICAgICAgaXQgJ2lnbm9yZXMgdGhlIGNvbG9ycyB0aGF0IG1hdGNoZXMgdGhlIGRlZmluZWQgc2NvcGVzJywgLT5cbiAgICAgICAgICBleHBlY3QoZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJykubGVuZ3RoKS50b0VxdWFsKDApXG4iXX0=
