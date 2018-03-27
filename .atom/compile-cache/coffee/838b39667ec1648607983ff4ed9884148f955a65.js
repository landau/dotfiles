(function() {
  var ColorBufferElement, ColorMarkerElement, mousedown, path, sleep;

  path = require('path');

  require('./helpers/spec-helper');

  mousedown = require('./helpers/events').mousedown;

  ColorBufferElement = require('../lib/color-buffer-element');

  ColorMarkerElement = require('../lib/color-marker-element');

  sleep = function(duration) {
    var t;
    t = new Date();
    return waitsFor(function() {
      return new Date() - t > duration;
    });
  };

  describe('ColorBufferElement', function() {
    var colorBuffer, colorBufferElement, editBuffer, editor, editorElement, isVisible, jasmineContent, jsonFixture, pigments, project, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], colorBuffer = _ref[2], pigments = _ref[3], project = _ref[4], colorBufferElement = _ref[5], jasmineContent = _ref[6];
    isVisible = function(node) {
      return !node.classList.contains('hidden');
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
        return expect(editorElement.shadowRoot.querySelector('.lines pigments-markers')).toExist();
      });
      describe('when the editor shadow dom setting is not enabled', function() {
        beforeEach(function() {
          editor.destroy();
          atom.config.set('editor.useShadowDOM', false);
          waitsForPromise(function() {
            return atom.workspace.open('four-variables.styl').then(function(o) {
              return editor = o;
            });
          });
          return runs(function() {
            editorElement = atom.views.getView(editor);
            colorBuffer = project.colorBufferForEditor(editor);
            colorBufferElement = atom.views.getView(colorBuffer);
            return colorBufferElement.attach();
          });
        });
        return it('attaches itself in the target text editor element', function() {
          return expect(colorBufferElement.parentNode).toExist();
        });
      });
      describe('when the color buffer is initialized', function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return colorBuffer.initialize();
          });
        });
        it('creates markers views for every visible buffer marker', function() {
          var marker, markersElements, _i, _len, _results;
          markersElements = colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker');
          expect(markersElements.length).toEqual(3);
          _results = [];
          for (_i = 0, _len = markersElements.length; _i < _len; _i++) {
            marker = markersElements[_i];
            _results.push(expect(marker.getModel()).toBeDefined());
          }
          return _results;
        });
        describe('when the project variables are initialized', function() {
          return it('creates markers for the new valid colors', function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            return runs(function() {
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length).toEqual(4);
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
              var markers;
              markers = colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker');
              expect(isVisible(markers[0])).toBeTruthy();
              expect(isVisible(markers[1])).toBeTruthy();
              expect(isVisible(markers[2])).toBeTruthy();
              return expect(isVisible(markers[3])).toBeFalsy();
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
              var markers;
              markers = colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker');
              expect(isVisible(markers[0])).toBeFalsy();
              expect(isVisible(markers[1])).toBeTruthy();
              return expect(isVisible(markers[2])).toBeTruthy();
            });
            return describe('and the markers are updated', function() {
              beforeEach(function() {
                waitsForPromise('colors available', function() {
                  return colorBuffer.variablesAvailable();
                });
                return waitsFor('last marker visible', function() {
                  var markers;
                  markers = colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker');
                  return isVisible(markers[3]);
                });
              });
              return it('hides the created markers', function() {
                var markers;
                markers = colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker');
                expect(isVisible(markers[0])).toBeFalsy();
                expect(isVisible(markers[1])).toBeTruthy();
                expect(isVisible(markers[2])).toBeTruthy();
                return expect(isVisible(markers[3])).toBeTruthy();
              });
            });
          });
        });
        describe('when a line is edited and gets wrapped', function() {
          var marker;
          marker = null;
          beforeEach(function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            runs(function() {
              marker = colorBufferElement.usedMarkers[colorBufferElement.usedMarkers.length - 1];
              spyOn(marker, 'render').andCallThrough();
              return editBuffer(new Array(20).join("foo "), {
                start: [1, 0],
                end: [1, 0]
              });
            });
            return waitsFor(function() {
              return marker.render.callCount > 0;
            });
          });
          return it('updates the markers whose screen range have changed', function() {
            return expect(marker.render).toHaveBeenCalled();
          });
        });
        describe('when some markers are destroyed', function() {
          var spy;
          spy = [][0];
          beforeEach(function() {
            var el, _i, _len, _ref1;
            _ref1 = colorBufferElement.usedMarkers;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              el = _ref1[_i];
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
          it('releases the unused markers', function() {
            var marker, _i, _len, _ref1, _results;
            expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length).toEqual(3);
            expect(colorBufferElement.usedMarkers.length).toEqual(2);
            expect(colorBufferElement.unusedMarkers.length).toEqual(1);
            _ref1 = colorBufferElement.unusedMarkers;
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              marker = _ref1[_i];
              _results.push(expect(marker.release).toHaveBeenCalled());
            }
            return _results;
          });
          return describe('and then a new marker is created', function() {
            beforeEach(function() {
              editor.moveToBottom();
              editBuffer('\nfoo = #123456\n');
              return waitsFor(function() {
                return colorBufferElement.unusedMarkers.length === 0;
              });
            });
            return it('reuses the previously released marker element', function() {
              expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length).toEqual(3);
              expect(colorBufferElement.usedMarkers.length).toEqual(3);
              return expect(colorBufferElement.unusedMarkers.length).toEqual(0);
            });
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
              return colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length;
            });
          });
          return it('should keep all the buffer elements attached', function() {
            var editors;
            editors = atom.workspace.getTextEditors();
            return editors.forEach(function(editor) {
              editorElement = atom.views.getView(editor);
              colorBufferElement = editorElement.shadowRoot.querySelector('pigments-markers');
              expect(colorBufferElement).toExist();
              expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length).toEqual(3);
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:empty').length).toEqual(0);
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
              return gutter = editorElement.shadowRoot.querySelector('[gutter-name="pigments-gutter"]');
            });
          });
          it('removes the markers', function() {
            return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length).toEqual(0);
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
                  decoration = editorElement.shadowRoot.querySelector('.pigments-gutter-marker span');
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
              return atom.config.set('pigments.markerType', 'background');
            });
            it('removes the gutter', function() {
              return expect(editorElement.shadowRoot.querySelector('[gutter-name="pigments-gutter"]')).not.toExist();
            });
            return it('recreates the markers', function() {
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length).toEqual(3);
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
                return gutter = editorElement.shadowRoot.querySelector('[gutter-name="pigments-gutter"]');
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
        var newPane, pane, _ref1;
        _ref1 = [], pane = _ref1[0], newPane = _ref1[1];
        beforeEach(function() {
          pane = atom.workspace.getActivePane();
          newPane = pane.splitDown({
            copyActiveItem: false
          });
          colorBuffer = project.colorBufferForEditor(editor);
          colorBufferElement = atom.views.getView(colorBuffer);
          expect(atom.workspace.getPanes().length).toEqual(2);
          pane.moveItemToPane(editor, newPane, 0);
          return waitsFor(function() {
            return colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length;
          });
        });
        return it('moves the editor with the buffer to the new pane', function() {
          expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length).toEqual(3);
          return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:empty').length).toEqual(0);
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
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(2);
            });
            loadBuffer('project/vendor/css/variables.less');
            return runs(function() {
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(20);
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
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(2);
            });
            loadBuffer('project/vendor/css/variables.less');
            return runs(function() {
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(0);
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
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(2);
            });
            loadBuffer('project/vendor/css/variables.less');
            runs(function() {
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(20);
            });
            loadBuffer('four-variables.styl');
            return runs(function() {
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(0);
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
                return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(0);
              });
              loadBuffer('project/vendor/css/variables.less');
              runs(function() {
                return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(20);
              });
              loadBuffer('four-variables.styl');
              return runs(function() {
                return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(0);
              });
            });
          });
        });
      });
      describe('when pigments.ignoredScopes settings is defined', function() {
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
            return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(1);
          });
        });
        describe('with two filters', function() {
          beforeEach(function() {
            return atom.config.set('pigments.ignoredScopes', ['\\.string', '\\.comment']);
          });
          return it('ignores the colors that matches the defined scopes', function() {
            return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(0);
          });
        });
        describe('with an invalid filter', function() {
          beforeEach(function() {
            return atom.config.set('pigments.ignoredScopes', ['\\']);
          });
          return it('ignores the filter', function() {
            return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(2);
          });
        });
        return describe('when the project ignoredScopes is defined', function() {
          beforeEach(function() {
            atom.config.set('pigments.ignoredScopes', ['\\.string']);
            return project.setIgnoredScopes(['\\.comment']);
          });
          return it('ignores the colors that matches the defined scopes', function() {
            return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(0);
          });
        });
      });
      return describe('when a text editor settings is modified', function() {
        var originalMarkers;
        originalMarkers = [][0];
        beforeEach(function() {
          waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
          return runs(function() {
            originalMarkers = colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)');
            spyOn(colorBufferElement, 'updateMarkers').andCallThrough();
            return spyOn(ColorMarkerElement.prototype, 'render').andCallThrough();
          });
        });
        describe('editor.fontSize', function() {
          beforeEach(function() {
            return atom.config.set('editor.fontSize', 20);
          });
          return it('forces an update and a re-render of existing markers', function() {
            var marker, _i, _len, _results;
            expect(colorBufferElement.updateMarkers).toHaveBeenCalled();
            _results = [];
            for (_i = 0, _len = originalMarkers.length; _i < _len; _i++) {
              marker = originalMarkers[_i];
              _results.push(expect(marker.render).toHaveBeenCalled());
            }
            return _results;
          });
        });
        return describe('editor.lineHeight', function() {
          beforeEach(function() {
            return atom.config.set('editor.lineHeight', 20);
          });
          return it('forces an update and a re-render of existing markers', function() {
            var marker, _i, _len, _results;
            expect(colorBufferElement.updateMarkers).toHaveBeenCalled();
            _results = [];
            for (_i = 0, _len = originalMarkers.length; _i < _len; _i++) {
              marker = originalMarkers[_i];
              _results.push(expect(marker.render).toHaveBeenCalled());
            }
            return _results;
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9jb2xvci1idWZmZXItZWxlbWVudC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4REFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxPQUFBLENBQVEsdUJBQVIsQ0FEQSxDQUFBOztBQUFBLEVBRUMsWUFBYSxPQUFBLENBQVEsa0JBQVIsRUFBYixTQUZELENBQUE7O0FBQUEsRUFJQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsNkJBQVIsQ0FKckIsQ0FBQTs7QUFBQSxFQUtBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSw2QkFBUixDQUxyQixDQUFBOztBQUFBLEVBT0EsS0FBQSxHQUFRLFNBQUMsUUFBRCxHQUFBO0FBQ04sUUFBQSxDQUFBO0FBQUEsSUFBQSxDQUFBLEdBQVEsSUFBQSxJQUFBLENBQUEsQ0FBUixDQUFBO1dBQ0EsUUFBQSxDQUFTLFNBQUEsR0FBQTthQUFPLElBQUEsSUFBQSxDQUFBLENBQUosR0FBYSxDQUFiLEdBQWlCLFNBQXBCO0lBQUEsQ0FBVCxFQUZNO0VBQUEsQ0FQUixDQUFBOztBQUFBLEVBV0EsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUEsR0FBQTtBQUM3QixRQUFBLG1JQUFBO0FBQUEsSUFBQSxPQUE4RixFQUE5RixFQUFDLGdCQUFELEVBQVMsdUJBQVQsRUFBd0IscUJBQXhCLEVBQXFDLGtCQUFyQyxFQUErQyxpQkFBL0MsRUFBd0QsNEJBQXhELEVBQTRFLHdCQUE1RSxDQUFBO0FBQUEsSUFFQSxTQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFBVSxDQUFBLElBQVEsQ0FBQyxTQUFTLENBQUMsUUFBZixDQUF3QixRQUF4QixFQUFkO0lBQUEsQ0FGWixDQUFBO0FBQUEsSUFJQSxVQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sT0FBUCxHQUFBO0FBQ1gsVUFBQSxLQUFBOztRQURrQixVQUFRO09BQzFCO0FBQUEsTUFBQSxJQUFHLHFCQUFIO0FBQ0UsUUFBQSxJQUFHLG1CQUFIO0FBQ0UsVUFBQSxLQUFBLEdBQVEsQ0FBQyxPQUFPLENBQUMsS0FBVCxFQUFnQixPQUFPLENBQUMsR0FBeEIsQ0FBUixDQURGO1NBQUEsTUFBQTtBQUdFLFVBQUEsS0FBQSxHQUFRLENBQUMsT0FBTyxDQUFDLEtBQVQsRUFBZ0IsT0FBTyxDQUFDLEtBQXhCLENBQVIsQ0FIRjtTQUFBO0FBQUEsUUFLQSxNQUFNLENBQUMsc0JBQVAsQ0FBOEIsS0FBOUIsQ0FMQSxDQURGO09BQUE7QUFBQSxNQVFBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQWxCLENBUkEsQ0FBQTtBQVNBLE1BQUEsSUFBQSxDQUFBLE9BQWdDLENBQUMsT0FBakM7ZUFBQSxZQUFBLENBQWEsR0FBYixFQUFBO09BVlc7SUFBQSxDQUpiLENBQUE7QUFBQSxJQWdCQSxXQUFBLEdBQWMsU0FBQyxPQUFELEVBQVUsSUFBVixHQUFBO0FBQ1osVUFBQSxjQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLFVBQXhCLEVBQW9DLE9BQXBDLENBQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLEVBQUUsQ0FBQyxZQUFILENBQWdCLFFBQWhCLENBQXlCLENBQUMsUUFBMUIsQ0FBQSxDQURQLENBQUE7QUFBQSxNQUVBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLGFBQWIsRUFBNEIsU0FBQyxDQUFELEVBQUcsQ0FBSCxHQUFBO2VBQVMsSUFBSyxDQUFBLENBQUEsRUFBZDtNQUFBLENBQTVCLENBRlAsQ0FBQTthQUlBLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxFQUxZO0lBQUEsQ0FoQmQsQ0FBQTtBQUFBLElBdUJBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLGdCQUFBO0FBQUEsTUFBQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQW5CLENBQUE7QUFBQSxNQUNBLGNBQUEsR0FBaUIsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFkLENBQTRCLGtCQUE1QixDQURqQixDQUFBO0FBQUEsTUFHQSxjQUFjLENBQUMsV0FBZixDQUEyQixnQkFBM0IsQ0FIQSxDQUFBO0FBQUEsTUFLQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUJBQWhCLEVBQW1DLElBQW5DLENBTEEsQ0FBQTtBQUFBLE1BTUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNDQUFoQixFQUF3RCxJQUF4RCxDQU5BLENBQUE7QUFBQSxNQU9BLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEIsRUFBOEMsRUFBOUMsQ0FQQSxDQUFBO0FBQUEsTUFTQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMEJBQWhCLEVBQTRDLENBQTVDLENBVEEsQ0FBQTtBQUFBLE1BVUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNCQUFoQixFQUF3QyxDQUN0QyxRQURzQyxFQUV0QyxRQUZzQyxDQUF4QyxDQVZBLENBQUE7QUFBQSxNQWVBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLHFCQUFwQixDQUEwQyxDQUFDLElBQTNDLENBQWdELFNBQUMsQ0FBRCxHQUFBO0FBQzlDLFVBQUEsTUFBQSxHQUFTLENBQVQsQ0FBQTtpQkFDQSxhQUFBLEdBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQixFQUY4QjtRQUFBLENBQWhELEVBRGM7TUFBQSxDQUFoQixDQWZBLENBQUE7YUFvQkEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsVUFBOUIsQ0FBeUMsQ0FBQyxJQUExQyxDQUErQyxTQUFDLEdBQUQsR0FBQTtBQUNoRSxVQUFBLFFBQUEsR0FBVyxHQUFHLENBQUMsVUFBZixDQUFBO2lCQUNBLE9BQUEsR0FBVSxRQUFRLENBQUMsVUFBVCxDQUFBLEVBRnNEO1FBQUEsQ0FBL0MsRUFBSDtNQUFBLENBQWhCLEVBckJTO0lBQUEsQ0FBWCxDQXZCQSxDQUFBO0FBQUEsSUFnREEsU0FBQSxDQUFVLFNBQUEsR0FBQTttQ0FDUixXQUFXLENBQUUsT0FBYixDQUFBLFdBRFE7SUFBQSxDQUFWLENBaERBLENBQUE7V0FtREEsUUFBQSxDQUFTLDBCQUFULEVBQXFDLFNBQUEsR0FBQTtBQUNuQyxNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLFdBQUEsR0FBYyxPQUFPLENBQUMsb0JBQVIsQ0FBNkIsTUFBN0IsQ0FBZCxDQUFBO0FBQUEsUUFDQSxrQkFBQSxHQUFxQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsV0FBbkIsQ0FEckIsQ0FBQTtlQUVBLGtCQUFrQixDQUFDLE1BQW5CLENBQUEsRUFIUztNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFLQSxFQUFBLENBQUcsd0NBQUgsRUFBNkMsU0FBQSxHQUFBO0FBQzNDLFFBQUEsTUFBQSxDQUFPLGtCQUFQLENBQTBCLENBQUMsV0FBM0IsQ0FBQSxDQUFBLENBQUE7ZUFDQSxNQUFBLENBQU8sa0JBQWtCLENBQUMsUUFBbkIsQ0FBQSxDQUFQLENBQXFDLENBQUMsSUFBdEMsQ0FBMkMsV0FBM0MsRUFGMkM7TUFBQSxDQUE3QyxDQUxBLENBQUE7QUFBQSxNQVNBLEVBQUEsQ0FBRyxtREFBSCxFQUF3RCxTQUFBLEdBQUE7QUFDdEQsUUFBQSxNQUFBLENBQU8sa0JBQWtCLENBQUMsVUFBMUIsQ0FBcUMsQ0FBQyxPQUF0QyxDQUFBLENBQUEsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxhQUFhLENBQUMsVUFBVSxDQUFDLGFBQXpCLENBQXVDLHlCQUF2QyxDQUFQLENBQXlFLENBQUMsT0FBMUUsQ0FBQSxFQUZzRDtNQUFBLENBQXhELENBVEEsQ0FBQTtBQUFBLE1BYUEsUUFBQSxDQUFTLG1EQUFULEVBQThELFNBQUEsR0FBQTtBQUM1RCxRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUJBQWhCLEVBQXVDLEtBQXZDLENBRkEsQ0FBQTtBQUFBLFVBSUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7bUJBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLHFCQUFwQixDQUEwQyxDQUFDLElBQTNDLENBQWdELFNBQUMsQ0FBRCxHQUFBO3FCQUFPLE1BQUEsR0FBUyxFQUFoQjtZQUFBLENBQWhELEVBRGM7VUFBQSxDQUFoQixDQUpBLENBQUE7aUJBT0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFlBQUEsYUFBQSxHQUFnQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsQ0FBaEIsQ0FBQTtBQUFBLFlBQ0EsV0FBQSxHQUFjLE9BQU8sQ0FBQyxvQkFBUixDQUE2QixNQUE3QixDQURkLENBQUE7QUFBQSxZQUVBLGtCQUFBLEdBQXFCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixXQUFuQixDQUZyQixDQUFBO21CQUdBLGtCQUFrQixDQUFDLE1BQW5CLENBQUEsRUFKRztVQUFBLENBQUwsRUFSUztRQUFBLENBQVgsQ0FBQSxDQUFBO2VBY0EsRUFBQSxDQUFHLG1EQUFILEVBQXdELFNBQUEsR0FBQTtpQkFDdEQsTUFBQSxDQUFPLGtCQUFrQixDQUFDLFVBQTFCLENBQXFDLENBQUMsT0FBdEMsQ0FBQSxFQURzRDtRQUFBLENBQXhELEVBZjREO01BQUEsQ0FBOUQsQ0FiQSxDQUFBO0FBQUEsTUFnQ0EsUUFBQSxDQUFTLHNDQUFULEVBQWlELFNBQUEsR0FBQTtBQUMvQyxRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsZUFBQSxDQUFnQixTQUFBLEdBQUE7bUJBQUcsV0FBVyxDQUFDLFVBQVosQ0FBQSxFQUFIO1VBQUEsQ0FBaEIsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFHQSxFQUFBLENBQUcsdURBQUgsRUFBNEQsU0FBQSxHQUFBO0FBQzFELGNBQUEsMkNBQUE7QUFBQSxVQUFBLGVBQUEsR0FBa0Isa0JBQWtCLENBQUMsVUFBVSxDQUFDLGdCQUE5QixDQUErQyx1QkFBL0MsQ0FBbEIsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFPLGVBQWUsQ0FBQyxNQUF2QixDQUE4QixDQUFDLE9BQS9CLENBQXVDLENBQXZDLENBRkEsQ0FBQTtBQUlBO2VBQUEsc0RBQUE7eUNBQUE7QUFDRSwwQkFBQSxNQUFBLENBQU8sTUFBTSxDQUFDLFFBQVAsQ0FBQSxDQUFQLENBQXlCLENBQUMsV0FBMUIsQ0FBQSxFQUFBLENBREY7QUFBQTswQkFMMEQ7UUFBQSxDQUE1RCxDQUhBLENBQUE7QUFBQSxRQVdBLFFBQUEsQ0FBUyw0Q0FBVCxFQUF1RCxTQUFBLEdBQUE7aUJBQ3JELEVBQUEsQ0FBRywwQ0FBSCxFQUErQyxTQUFBLEdBQUE7QUFDN0MsWUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtxQkFBRyxXQUFXLENBQUMsa0JBQVosQ0FBQSxFQUFIO1lBQUEsQ0FBaEIsQ0FBQSxDQUFBO21CQUNBLElBQUEsQ0FBSyxTQUFBLEdBQUE7cUJBQ0gsTUFBQSxDQUFPLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxnQkFBOUIsQ0FBK0MsdUJBQS9DLENBQXVFLENBQUMsTUFBL0UsQ0FBc0YsQ0FBQyxPQUF2RixDQUErRixDQUEvRixFQURHO1lBQUEsQ0FBTCxFQUY2QztVQUFBLENBQS9DLEVBRHFEO1FBQUEsQ0FBdkQsQ0FYQSxDQUFBO0FBQUEsUUFpQkEsUUFBQSxDQUFTLDRDQUFULEVBQXVELFNBQUEsR0FBQTtBQUNyRCxVQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7bUJBQ1QsS0FBQSxDQUFNLGtCQUFOLEVBQTBCLGtCQUExQixDQUE2QyxDQUFDLGNBQTlDLENBQUEsRUFEUztVQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsVUFHQSxRQUFBLENBQVMscUNBQVQsRUFBZ0QsU0FBQSxHQUFBO0FBQzlDLFlBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULGNBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7dUJBQUcsV0FBVyxDQUFDLGtCQUFaLENBQUEsRUFBSDtjQUFBLENBQWhCLENBQUEsQ0FBQTtBQUFBLGNBQ0EsSUFBQSxDQUFLLFNBQUEsR0FBQTt1QkFBRyxNQUFNLENBQUMsc0JBQVAsQ0FBOEIsQ0FBQyxDQUFDLENBQUQsRUFBRyxFQUFILENBQUQsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVIsQ0FBOUIsRUFBSDtjQUFBLENBQUwsQ0FEQSxDQUFBO3FCQUVBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7dUJBQUcsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsU0FBcEMsR0FBZ0QsRUFBbkQ7Y0FBQSxDQUFULEVBSFM7WUFBQSxDQUFYLENBQUEsQ0FBQTttQkFLQSxFQUFBLENBQUcsOEJBQUgsRUFBbUMsU0FBQSxHQUFBO0FBQ2pDLGtCQUFBLE9BQUE7QUFBQSxjQUFBLE9BQUEsR0FBVSxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsZ0JBQTlCLENBQStDLHVCQUEvQyxDQUFWLENBQUE7QUFBQSxjQUVBLE1BQUEsQ0FBTyxTQUFBLENBQVUsT0FBUSxDQUFBLENBQUEsQ0FBbEIsQ0FBUCxDQUE2QixDQUFDLFVBQTlCLENBQUEsQ0FGQSxDQUFBO0FBQUEsY0FHQSxNQUFBLENBQU8sU0FBQSxDQUFVLE9BQVEsQ0FBQSxDQUFBLENBQWxCLENBQVAsQ0FBNkIsQ0FBQyxVQUE5QixDQUFBLENBSEEsQ0FBQTtBQUFBLGNBSUEsTUFBQSxDQUFPLFNBQUEsQ0FBVSxPQUFRLENBQUEsQ0FBQSxDQUFsQixDQUFQLENBQTZCLENBQUMsVUFBOUIsQ0FBQSxDQUpBLENBQUE7cUJBS0EsTUFBQSxDQUFPLFNBQUEsQ0FBVSxPQUFRLENBQUEsQ0FBQSxDQUFsQixDQUFQLENBQTZCLENBQUMsU0FBOUIsQ0FBQSxFQU5pQztZQUFBLENBQW5DLEVBTjhDO1VBQUEsQ0FBaEQsQ0FIQSxDQUFBO2lCQWlCQSxRQUFBLENBQVMsMENBQVQsRUFBcUQsU0FBQSxHQUFBO0FBQ25ELFlBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULGNBQUEsSUFBQSxDQUFLLFNBQUEsR0FBQTt1QkFBRyxNQUFNLENBQUMsc0JBQVAsQ0FBOEIsQ0FBQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQUQsRUFBTyxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVAsQ0FBOUIsRUFBSDtjQUFBLENBQUwsQ0FBQSxDQUFBO3FCQUNBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7dUJBQUcsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsU0FBcEMsR0FBZ0QsRUFBbkQ7Y0FBQSxDQUFULEVBRlM7WUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFlBSUEsRUFBQSxDQUFHLDRCQUFILEVBQWlDLFNBQUEsR0FBQTtBQUMvQixrQkFBQSxPQUFBO0FBQUEsY0FBQSxPQUFBLEdBQVUsa0JBQWtCLENBQUMsVUFBVSxDQUFDLGdCQUE5QixDQUErQyx1QkFBL0MsQ0FBVixDQUFBO0FBQUEsY0FFQSxNQUFBLENBQU8sU0FBQSxDQUFVLE9BQVEsQ0FBQSxDQUFBLENBQWxCLENBQVAsQ0FBNkIsQ0FBQyxTQUE5QixDQUFBLENBRkEsQ0FBQTtBQUFBLGNBR0EsTUFBQSxDQUFPLFNBQUEsQ0FBVSxPQUFRLENBQUEsQ0FBQSxDQUFsQixDQUFQLENBQTZCLENBQUMsVUFBOUIsQ0FBQSxDQUhBLENBQUE7cUJBSUEsTUFBQSxDQUFPLFNBQUEsQ0FBVSxPQUFRLENBQUEsQ0FBQSxDQUFsQixDQUFQLENBQTZCLENBQUMsVUFBOUIsQ0FBQSxFQUwrQjtZQUFBLENBQWpDLENBSkEsQ0FBQTttQkFXQSxRQUFBLENBQVMsNkJBQVQsRUFBd0MsU0FBQSxHQUFBO0FBQ3RDLGNBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULGdCQUFBLGVBQUEsQ0FBZ0Isa0JBQWhCLEVBQW9DLFNBQUEsR0FBQTt5QkFDbEMsV0FBVyxDQUFDLGtCQUFaLENBQUEsRUFEa0M7Z0JBQUEsQ0FBcEMsQ0FBQSxDQUFBO3VCQUVBLFFBQUEsQ0FBUyxxQkFBVCxFQUFnQyxTQUFBLEdBQUE7QUFDOUIsc0JBQUEsT0FBQTtBQUFBLGtCQUFBLE9BQUEsR0FBVSxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsZ0JBQTlCLENBQStDLHVCQUEvQyxDQUFWLENBQUE7eUJBQ0EsU0FBQSxDQUFVLE9BQVEsQ0FBQSxDQUFBLENBQWxCLEVBRjhCO2dCQUFBLENBQWhDLEVBSFM7Y0FBQSxDQUFYLENBQUEsQ0FBQTtxQkFPQSxFQUFBLENBQUcsMkJBQUgsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLG9CQUFBLE9BQUE7QUFBQSxnQkFBQSxPQUFBLEdBQVUsa0JBQWtCLENBQUMsVUFBVSxDQUFDLGdCQUE5QixDQUErQyx1QkFBL0MsQ0FBVixDQUFBO0FBQUEsZ0JBQ0EsTUFBQSxDQUFPLFNBQUEsQ0FBVSxPQUFRLENBQUEsQ0FBQSxDQUFsQixDQUFQLENBQTZCLENBQUMsU0FBOUIsQ0FBQSxDQURBLENBQUE7QUFBQSxnQkFFQSxNQUFBLENBQU8sU0FBQSxDQUFVLE9BQVEsQ0FBQSxDQUFBLENBQWxCLENBQVAsQ0FBNkIsQ0FBQyxVQUE5QixDQUFBLENBRkEsQ0FBQTtBQUFBLGdCQUdBLE1BQUEsQ0FBTyxTQUFBLENBQVUsT0FBUSxDQUFBLENBQUEsQ0FBbEIsQ0FBUCxDQUE2QixDQUFDLFVBQTlCLENBQUEsQ0FIQSxDQUFBO3VCQUlBLE1BQUEsQ0FBTyxTQUFBLENBQVUsT0FBUSxDQUFBLENBQUEsQ0FBbEIsQ0FBUCxDQUE2QixDQUFDLFVBQTlCLENBQUEsRUFMOEI7Y0FBQSxDQUFoQyxFQVJzQztZQUFBLENBQXhDLEVBWm1EO1VBQUEsQ0FBckQsRUFsQnFEO1FBQUEsQ0FBdkQsQ0FqQkEsQ0FBQTtBQUFBLFFBOERBLFFBQUEsQ0FBUyx3Q0FBVCxFQUFtRCxTQUFBLEdBQUE7QUFDakQsY0FBQSxNQUFBO0FBQUEsVUFBQSxNQUFBLEdBQVMsSUFBVCxDQUFBO0FBQUEsVUFDQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsWUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtxQkFBRyxXQUFXLENBQUMsa0JBQVosQ0FBQSxFQUFIO1lBQUEsQ0FBaEIsQ0FBQSxDQUFBO0FBQUEsWUFFQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsY0FBQSxNQUFBLEdBQVMsa0JBQWtCLENBQUMsV0FBWSxDQUFBLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxNQUEvQixHQUFzQyxDQUF0QyxDQUF4QyxDQUFBO0FBQUEsY0FDQSxLQUFBLENBQU0sTUFBTixFQUFjLFFBQWQsQ0FBdUIsQ0FBQyxjQUF4QixDQUFBLENBREEsQ0FBQTtxQkFHQSxVQUFBLENBQWUsSUFBQSxLQUFBLENBQU0sRUFBTixDQUFTLENBQUMsSUFBVixDQUFlLE1BQWYsQ0FBZixFQUF1QztBQUFBLGdCQUFBLEtBQUEsRUFBTyxDQUFDLENBQUQsRUFBRyxDQUFILENBQVA7QUFBQSxnQkFBYyxHQUFBLEVBQUssQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFuQjtlQUF2QyxFQUpHO1lBQUEsQ0FBTCxDQUZBLENBQUE7bUJBUUEsUUFBQSxDQUFTLFNBQUEsR0FBQTtxQkFDUCxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQWQsR0FBMEIsRUFEbkI7WUFBQSxDQUFULEVBVFM7VUFBQSxDQUFYLENBREEsQ0FBQTtpQkFhQSxFQUFBLENBQUcscURBQUgsRUFBMEQsU0FBQSxHQUFBO21CQUN4RCxNQUFBLENBQU8sTUFBTSxDQUFDLE1BQWQsQ0FBcUIsQ0FBQyxnQkFBdEIsQ0FBQSxFQUR3RDtVQUFBLENBQTFELEVBZGlEO1FBQUEsQ0FBbkQsQ0E5REEsQ0FBQTtBQUFBLFFBK0VBLFFBQUEsQ0FBUyxpQ0FBVCxFQUE0QyxTQUFBLEdBQUE7QUFDMUMsY0FBQSxHQUFBO0FBQUEsVUFBQyxNQUFPLEtBQVIsQ0FBQTtBQUFBLFVBQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULGdCQUFBLG1CQUFBO0FBQUE7QUFBQSxpQkFBQSw0Q0FBQTs2QkFBQTtBQUNFLGNBQUEsS0FBQSxDQUFNLEVBQU4sRUFBVSxTQUFWLENBQW9CLENBQUMsY0FBckIsQ0FBQSxDQUFBLENBREY7QUFBQSxhQUFBO0FBQUEsWUFHQSxHQUFBLEdBQU0sT0FBTyxDQUFDLFNBQVIsQ0FBa0IsWUFBbEIsQ0FITixDQUFBO0FBQUEsWUFJQSxrQkFBa0IsQ0FBQyxXQUFuQixDQUErQixHQUEvQixDQUpBLENBQUE7QUFBQSxZQUtBLFVBQUEsQ0FBVyxFQUFYLEVBQWU7QUFBQSxjQUFBLEtBQUEsRUFBTyxDQUFDLENBQUQsRUFBRyxDQUFILENBQVA7QUFBQSxjQUFjLEdBQUEsRUFBSyxDQUFDLENBQUQsRUFBRyxDQUFILENBQW5CO2FBQWYsQ0FMQSxDQUFBO21CQU1BLFFBQUEsQ0FBUyxTQUFBLEdBQUE7cUJBQUcsR0FBRyxDQUFDLFNBQUosR0FBZ0IsRUFBbkI7WUFBQSxDQUFULEVBUFM7VUFBQSxDQUFYLENBREEsQ0FBQTtBQUFBLFVBVUEsRUFBQSxDQUFHLDZCQUFILEVBQWtDLFNBQUEsR0FBQTtBQUNoQyxnQkFBQSxpQ0FBQTtBQUFBLFlBQUEsTUFBQSxDQUFPLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxnQkFBOUIsQ0FBK0MsdUJBQS9DLENBQXVFLENBQUMsTUFBL0UsQ0FBc0YsQ0FBQyxPQUF2RixDQUErRixDQUEvRixDQUFBLENBQUE7QUFBQSxZQUNBLE1BQUEsQ0FBTyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsTUFBdEMsQ0FBNkMsQ0FBQyxPQUE5QyxDQUFzRCxDQUF0RCxDQURBLENBQUE7QUFBQSxZQUVBLE1BQUEsQ0FBTyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsTUFBeEMsQ0FBK0MsQ0FBQyxPQUFoRCxDQUF3RCxDQUF4RCxDQUZBLENBQUE7QUFJQTtBQUFBO2lCQUFBLDRDQUFBO2lDQUFBO0FBQ0UsNEJBQUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFkLENBQXNCLENBQUMsZ0JBQXZCLENBQUEsRUFBQSxDQURGO0FBQUE7NEJBTGdDO1VBQUEsQ0FBbEMsQ0FWQSxDQUFBO2lCQWtCQSxRQUFBLENBQVMsa0NBQVQsRUFBNkMsU0FBQSxHQUFBO0FBQzNDLFlBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULGNBQUEsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFBLENBQUE7QUFBQSxjQUNBLFVBQUEsQ0FBVyxtQkFBWCxDQURBLENBQUE7cUJBRUEsUUFBQSxDQUFTLFNBQUEsR0FBQTt1QkFBRyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsTUFBakMsS0FBMkMsRUFBOUM7Y0FBQSxDQUFULEVBSFM7WUFBQSxDQUFYLENBQUEsQ0FBQTttQkFLQSxFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQSxHQUFBO0FBQ2xELGNBQUEsTUFBQSxDQUFPLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxnQkFBOUIsQ0FBK0MsdUJBQS9DLENBQXVFLENBQUMsTUFBL0UsQ0FBc0YsQ0FBQyxPQUF2RixDQUErRixDQUEvRixDQUFBLENBQUE7QUFBQSxjQUNBLE1BQUEsQ0FBTyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsTUFBdEMsQ0FBNkMsQ0FBQyxPQUE5QyxDQUFzRCxDQUF0RCxDQURBLENBQUE7cUJBRUEsTUFBQSxDQUFPLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxNQUF4QyxDQUErQyxDQUFDLE9BQWhELENBQXdELENBQXhELEVBSGtEO1lBQUEsQ0FBcEQsRUFOMkM7VUFBQSxDQUE3QyxFQW5CMEM7UUFBQSxDQUE1QyxDQS9FQSxDQUFBO0FBQUEsUUE2R0EsUUFBQSxDQUFTLGdEQUFULEVBQTJELFNBQUEsR0FBQTtBQUN6RCxVQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxnQkFBQSxPQUFBO0FBQUEsWUFBQSxPQUFBLEdBQVUsVUFBQSxDQUFXLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBaUIsQ0FBQyxLQUFsQixDQUF3QixHQUF4QixDQUE0QixDQUFDLEtBQTdCLENBQW1DLENBQW5DLEVBQXFDLENBQXJDLENBQXVDLENBQUMsSUFBeEMsQ0FBNkMsR0FBN0MsQ0FBWCxDQUFWLENBQUE7QUFDQSxZQUFBLElBQUcsT0FBQSxHQUFVLENBQWI7QUFDRSxjQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixhQUF2QixFQUFzQyx1Q0FBdEMsQ0FBQSxDQURGO2FBQUEsTUFBQTtBQUdFLGNBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGFBQXZCLEVBQXNDLGtCQUF0QyxDQUFBLENBSEY7YUFEQTtBQUFBLFlBTUEsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQSxHQUFBO3FCQUN0QixNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQUEsQ0FBZ0MsQ0FBQSxDQUFBLEVBRG5CO1lBQUEsQ0FBeEIsQ0FOQSxDQUFBO0FBQUEsWUFTQSxRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQSxHQUFBO3FCQUMvQixrQkFBQSxHQUFxQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsT0FBTyxDQUFDLG9CQUFSLENBQTZCLE1BQTdCLENBQW5CLEVBRFU7WUFBQSxDQUFqQyxDQVRBLENBQUE7bUJBV0EsUUFBQSxDQUFTLDhCQUFULEVBQXlDLFNBQUEsR0FBQTtxQkFDdkMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLGdCQUE5QixDQUErQyx1QkFBL0MsQ0FBdUUsQ0FBQyxPQURqQztZQUFBLENBQXpDLEVBWlM7VUFBQSxDQUFYLENBQUEsQ0FBQTtpQkFlQSxFQUFBLENBQUcsOENBQUgsRUFBbUQsU0FBQSxHQUFBO0FBQ2pELGdCQUFBLE9BQUE7QUFBQSxZQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWYsQ0FBQSxDQUFWLENBQUE7bUJBRUEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsU0FBQyxNQUFELEdBQUE7QUFDZCxjQUFBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CLENBQWhCLENBQUE7QUFBQSxjQUNBLGtCQUFBLEdBQXFCLGFBQWEsQ0FBQyxVQUFVLENBQUMsYUFBekIsQ0FBdUMsa0JBQXZDLENBRHJCLENBQUE7QUFBQSxjQUVBLE1BQUEsQ0FBTyxrQkFBUCxDQUEwQixDQUFDLE9BQTNCLENBQUEsQ0FGQSxDQUFBO0FBQUEsY0FJQSxNQUFBLENBQU8sa0JBQWtCLENBQUMsVUFBVSxDQUFDLGdCQUE5QixDQUErQyx1QkFBL0MsQ0FBdUUsQ0FBQyxNQUEvRSxDQUFzRixDQUFDLE9BQXZGLENBQStGLENBQS9GLENBSkEsQ0FBQTtxQkFLQSxNQUFBLENBQU8sa0JBQWtCLENBQUMsVUFBVSxDQUFDLGdCQUE5QixDQUErQyw2QkFBL0MsQ0FBNkUsQ0FBQyxNQUFyRixDQUE0RixDQUFDLE9BQTdGLENBQXFHLENBQXJHLEVBTmM7WUFBQSxDQUFoQixFQUhpRDtVQUFBLENBQW5ELEVBaEJ5RDtRQUFBLENBQTNELENBN0dBLENBQUE7ZUF3SUEsUUFBQSxDQUFTLHVDQUFULEVBQWtELFNBQUEsR0FBQTtBQUNoRCxjQUFBLE1BQUE7QUFBQSxVQUFDLFNBQVUsS0FBWCxDQUFBO0FBQUEsVUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsWUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtxQkFBRyxXQUFXLENBQUMsVUFBWixDQUFBLEVBQUg7WUFBQSxDQUFoQixDQUFBLENBQUE7bUJBQ0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILGNBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHFCQUFoQixFQUF1QyxRQUF2QyxDQUFBLENBQUE7cUJBQ0EsTUFBQSxHQUFTLGFBQWEsQ0FBQyxVQUFVLENBQUMsYUFBekIsQ0FBdUMsaUNBQXZDLEVBRk47WUFBQSxDQUFMLEVBRlM7VUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLFVBUUEsRUFBQSxDQUFHLHFCQUFILEVBQTBCLFNBQUEsR0FBQTttQkFDeEIsTUFBQSxDQUFPLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxnQkFBOUIsQ0FBK0MsdUJBQS9DLENBQXVFLENBQUMsTUFBL0UsQ0FBc0YsQ0FBQyxPQUF2RixDQUErRixDQUEvRixFQUR3QjtVQUFBLENBQTFCLENBUkEsQ0FBQTtBQUFBLFVBV0EsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUEsR0FBQTttQkFDNUMsTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLE9BQWYsQ0FBQSxFQUQ0QztVQUFBLENBQTlDLENBWEEsQ0FBQTtBQUFBLFVBY0EsRUFBQSxDQUFHLDRFQUFILEVBQWlGLFNBQUEsR0FBQTttQkFDL0UsTUFBQSxDQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBcEIsQ0FBNkIsQ0FBQyxPQUE5QixDQUFzQyxNQUF0QyxFQUQrRTtVQUFBLENBQWpGLENBZEEsQ0FBQTtBQUFBLFVBaUJBLEVBQUEsQ0FBRyxnREFBSCxFQUFxRCxTQUFBLEdBQUE7QUFDbkQsZ0JBQUEsV0FBQTtBQUFBLFlBQUEsV0FBQSxHQUFjLE1BQU0sQ0FBQyxjQUFQLENBQUEsQ0FBdUIsQ0FBQyxNQUF4QixDQUErQixTQUFDLENBQUQsR0FBQTtxQkFDM0MsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFiLEtBQXFCLFNBRHNCO1lBQUEsQ0FBL0IsQ0FBZCxDQUFBO21CQUVBLE1BQUEsQ0FBTyxXQUFXLENBQUMsTUFBbkIsQ0FBMEIsQ0FBQyxPQUEzQixDQUFtQyxDQUFuQyxFQUhtRDtVQUFBLENBQXJELENBakJBLENBQUE7QUFBQSxVQXNCQSxRQUFBLENBQVMscUNBQVQsRUFBZ0QsU0FBQSxHQUFBO0FBQzlDLFlBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtxQkFDVCxlQUFBLENBQWdCLFNBQUEsR0FBQTt1QkFBRyxXQUFXLENBQUMsa0JBQVosQ0FBQSxFQUFIO2NBQUEsQ0FBaEIsRUFEUztZQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsWUFHQSxFQUFBLENBQUcsOENBQUgsRUFBbUQsU0FBQSxHQUFBO0FBQ2pELGtCQUFBLFdBQUE7QUFBQSxjQUFBLFdBQUEsR0FBYyxNQUFNLENBQUMsY0FBUCxDQUFBLENBQXVCLENBQUMsTUFBeEIsQ0FBK0IsU0FBQyxDQUFELEdBQUE7dUJBQzNDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBYixLQUFxQixTQURzQjtjQUFBLENBQS9CLENBQWQsQ0FBQTtxQkFFQSxNQUFBLENBQU8sV0FBVyxDQUFDLE1BQW5CLENBQTBCLENBQUMsT0FBM0IsQ0FBbUMsQ0FBbkMsRUFIaUQ7WUFBQSxDQUFuRCxDQUhBLENBQUE7bUJBUUEsUUFBQSxDQUFTLDhDQUFULEVBQXlELFNBQUEsR0FBQTtBQUN2RCxjQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxvQkFBQSxTQUFBO0FBQUEsZ0JBQUEsU0FBQSxHQUFZLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFlBQWxCLENBQVosQ0FBQTtBQUFBLGdCQUNBLGtCQUFrQixDQUFDLFdBQW5CLENBQStCLFNBQS9CLENBREEsQ0FBQTtBQUFBLGdCQUdBLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FIQSxDQUFBO0FBQUEsZ0JBSUEsVUFBQSxDQUFXLHNDQUFYLENBSkEsQ0FBQTt1QkFLQSxRQUFBLENBQVMsU0FBQSxHQUFBO3lCQUFHLFNBQVMsQ0FBQyxTQUFWLEdBQXNCLEVBQXpCO2dCQUFBLENBQVQsRUFOUztjQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsY0FRQSxFQUFBLENBQUcsd0NBQUgsRUFBNkMsU0FBQSxHQUFBO0FBQzNDLG9CQUFBLFdBQUE7QUFBQSxnQkFBQSxXQUFBLEdBQWMsTUFBTSxDQUFDLGNBQVAsQ0FBQSxDQUF1QixDQUFDLE1BQXhCLENBQStCLFNBQUMsQ0FBRCxHQUFBO3lCQUMzQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQWIsS0FBcUIsU0FEc0I7Z0JBQUEsQ0FBL0IsQ0FBZCxDQUFBO3VCQUdBLE1BQUEsQ0FBTyxXQUFXLENBQUMsTUFBbkIsQ0FBMEIsQ0FBQyxPQUEzQixDQUFtQyxDQUFuQyxFQUoyQztjQUFBLENBQTdDLENBUkEsQ0FBQTtBQUFBLGNBY0EsRUFBQSxDQUFHLDRFQUFILEVBQWlGLFNBQUEsR0FBQTt1QkFDL0UsTUFBQSxDQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBcEIsQ0FBNkIsQ0FBQyxPQUE5QixDQUFzQyxNQUF0QyxFQUQrRTtjQUFBLENBQWpGLENBZEEsQ0FBQTtxQkFpQkEsUUFBQSxDQUFTLGlDQUFULEVBQTRDLFNBQUEsR0FBQTtBQUMxQyxnQkFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1Qsc0JBQUEsVUFBQTtBQUFBLGtCQUFBLE9BQU8sQ0FBQyxjQUFSLEdBQ0U7QUFBQSxvQkFBQSxJQUFBLEVBQU0sT0FBTyxDQUFDLFNBQVIsQ0FBa0IsbUJBQWxCLENBQU47bUJBREYsQ0FBQTtBQUFBLGtCQUdBLFVBQUEsR0FBYSxhQUFhLENBQUMsVUFBVSxDQUFDLGFBQXpCLENBQXVDLDhCQUF2QyxDQUhiLENBQUE7eUJBSUEsU0FBQSxDQUFVLFVBQVYsRUFMUztnQkFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLGdCQU9BLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBLEdBQUE7eUJBQ25DLE1BQUEsQ0FBTyxNQUFNLENBQUMsc0JBQVAsQ0FBQSxDQUFQLENBQXVDLENBQUMsT0FBeEMsQ0FBZ0QsQ0FBQyxDQUFDLENBQUQsRUFBRyxFQUFILENBQUQsRUFBUSxDQUFDLENBQUQsRUFBRyxFQUFILENBQVIsQ0FBaEQsRUFEbUM7Z0JBQUEsQ0FBckMsQ0FQQSxDQUFBO3VCQVVBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBLEdBQUE7eUJBQzNCLE1BQUEsQ0FBTyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQTlCLENBQW1DLENBQUMsZ0JBQXBDLENBQUEsRUFEMkI7Z0JBQUEsQ0FBN0IsRUFYMEM7Y0FBQSxDQUE1QyxFQWxCdUQ7WUFBQSxDQUF6RCxFQVQ4QztVQUFBLENBQWhELENBdEJBLENBQUE7QUFBQSxVQStEQSxRQUFBLENBQVMsa0NBQVQsRUFBNkMsU0FBQSxHQUFBO0FBQzNDLFlBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtxQkFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUJBQWhCLEVBQXVDLFlBQXZDLEVBRFM7WUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFlBR0EsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUEsR0FBQTtxQkFDdkIsTUFBQSxDQUFPLGFBQWEsQ0FBQyxVQUFVLENBQUMsYUFBekIsQ0FBdUMsaUNBQXZDLENBQVAsQ0FBaUYsQ0FBQyxHQUFHLENBQUMsT0FBdEYsQ0FBQSxFQUR1QjtZQUFBLENBQXpCLENBSEEsQ0FBQTttQkFNQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO3FCQUMxQixNQUFBLENBQU8sa0JBQWtCLENBQUMsVUFBVSxDQUFDLGdCQUE5QixDQUErQyx1QkFBL0MsQ0FBdUUsQ0FBQyxNQUEvRSxDQUFzRixDQUFDLE9BQXZGLENBQStGLENBQS9GLEVBRDBCO1lBQUEsQ0FBNUIsRUFQMkM7VUFBQSxDQUE3QyxDQS9EQSxDQUFBO2lCQXlFQSxRQUFBLENBQVMsNkJBQVQsRUFBd0MsU0FBQSxHQUFBO0FBQ3RDLFlBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULGNBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7dUJBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLCtCQUFwQixDQUFvRCxDQUFDLElBQXJELENBQTBELFNBQUMsQ0FBRCxHQUFBO0FBQ3hELGtCQUFBLE1BQUEsR0FBUyxDQUFULENBQUE7QUFBQSxrQkFDQSxhQUFBLEdBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQixDQURoQixDQUFBO0FBQUEsa0JBRUEsV0FBQSxHQUFjLE9BQU8sQ0FBQyxvQkFBUixDQUE2QixNQUE3QixDQUZkLENBQUE7eUJBR0Esa0JBQUEsR0FBcUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLFdBQW5CLEVBSm1DO2dCQUFBLENBQTFELEVBRGM7Y0FBQSxDQUFoQixDQUFBLENBQUE7QUFBQSxjQU9BLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO3VCQUFHLFdBQVcsQ0FBQyxVQUFaLENBQUEsRUFBSDtjQUFBLENBQWhCLENBUEEsQ0FBQTtBQUFBLGNBUUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7dUJBQUcsV0FBVyxDQUFDLGtCQUFaLENBQUEsRUFBSDtjQUFBLENBQWhCLENBUkEsQ0FBQTtxQkFVQSxJQUFBLENBQUssU0FBQSxHQUFBO3VCQUNILE1BQUEsR0FBUyxhQUFhLENBQUMsVUFBVSxDQUFDLGFBQXpCLENBQXVDLGlDQUF2QyxFQUROO2NBQUEsQ0FBTCxFQVhTO1lBQUEsQ0FBWCxDQUFBLENBQUE7bUJBY0EsRUFBQSxDQUFHLGtEQUFILEVBQXVELFNBQUEsR0FBQTtBQUNyRCxrQkFBQSxXQUFBO0FBQUEsY0FBQSxXQUFBLEdBQWMsTUFBTSxDQUFDLGNBQVAsQ0FBQSxDQUF1QixDQUFDLE1BQXhCLENBQStCLFNBQUMsQ0FBRCxHQUFBO3VCQUMzQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQWIsS0FBcUIsU0FEc0I7Y0FBQSxDQUEvQixDQUFkLENBQUE7cUJBR0EsTUFBQSxDQUFPLFdBQVcsQ0FBQyxNQUFuQixDQUEwQixDQUFDLE9BQTNCLENBQW1DLEVBQW5DLEVBSnFEO1lBQUEsQ0FBdkQsRUFmc0M7VUFBQSxDQUF4QyxFQTFFZ0Q7UUFBQSxDQUFsRCxFQXpJK0M7TUFBQSxDQUFqRCxDQWhDQSxDQUFBO0FBQUEsTUF3UUEsUUFBQSxDQUFTLDBDQUFULEVBQXFELFNBQUEsR0FBQTtBQUNuRCxZQUFBLG9CQUFBO0FBQUEsUUFBQSxRQUFrQixFQUFsQixFQUFDLGVBQUQsRUFBTyxrQkFBUCxDQUFBO0FBQUEsUUFDQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBUCxDQUFBO0FBQUEsVUFDQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFNBQUwsQ0FBZTtBQUFBLFlBQUEsY0FBQSxFQUFnQixLQUFoQjtXQUFmLENBRFYsQ0FBQTtBQUFBLFVBRUEsV0FBQSxHQUFjLE9BQU8sQ0FBQyxvQkFBUixDQUE2QixNQUE3QixDQUZkLENBQUE7QUFBQSxVQUdBLGtCQUFBLEdBQXFCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixXQUFuQixDQUhyQixDQUFBO0FBQUEsVUFLQSxNQUFBLENBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFmLENBQUEsQ0FBeUIsQ0FBQyxNQUFqQyxDQUF3QyxDQUFDLE9BQXpDLENBQWlELENBQWpELENBTEEsQ0FBQTtBQUFBLFVBT0EsSUFBSSxDQUFDLGNBQUwsQ0FBb0IsTUFBcEIsRUFBNEIsT0FBNUIsRUFBcUMsQ0FBckMsQ0FQQSxDQUFBO2lCQVNBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7bUJBQ1Asa0JBQWtCLENBQUMsVUFBVSxDQUFDLGdCQUE5QixDQUErQyxtQ0FBL0MsQ0FBbUYsQ0FBQyxPQUQ3RTtVQUFBLENBQVQsRUFWUztRQUFBLENBQVgsQ0FEQSxDQUFBO2VBY0EsRUFBQSxDQUFHLGtEQUFILEVBQXVELFNBQUEsR0FBQTtBQUNyRCxVQUFBLE1BQUEsQ0FBTyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsZ0JBQTlCLENBQStDLHVCQUEvQyxDQUF1RSxDQUFDLE1BQS9FLENBQXNGLENBQUMsT0FBdkYsQ0FBK0YsQ0FBL0YsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsZ0JBQTlCLENBQStDLDZCQUEvQyxDQUE2RSxDQUFDLE1BQXJGLENBQTRGLENBQUMsT0FBN0YsQ0FBcUcsQ0FBckcsRUFGcUQ7UUFBQSxDQUF2RCxFQWZtRDtNQUFBLENBQXJELENBeFFBLENBQUE7QUFBQSxNQTJSQSxRQUFBLENBQVMsc0RBQVQsRUFBaUUsU0FBQSxHQUFBO0FBQy9ELFlBQUEsVUFBQTtBQUFBLFFBQUEsVUFBQSxHQUFhLFNBQUMsUUFBRCxHQUFBO0FBQ1gsVUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTttQkFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsUUFBcEIsQ0FBNkIsQ0FBQyxJQUE5QixDQUFtQyxTQUFDLENBQUQsR0FBQTtBQUNqQyxjQUFBLE1BQUEsR0FBUyxDQUFULENBQUE7QUFBQSxjQUNBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CLENBRGhCLENBQUE7QUFBQSxjQUVBLFdBQUEsR0FBYyxPQUFPLENBQUMsb0JBQVIsQ0FBNkIsTUFBN0IsQ0FGZCxDQUFBO0FBQUEsY0FHQSxrQkFBQSxHQUFxQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsV0FBbkIsQ0FIckIsQ0FBQTtxQkFJQSxrQkFBa0IsQ0FBQyxNQUFuQixDQUFBLEVBTGlDO1lBQUEsQ0FBbkMsRUFEYztVQUFBLENBQWhCLENBQUEsQ0FBQTtBQUFBLFVBUUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7bUJBQUcsV0FBVyxDQUFDLFVBQVosQ0FBQSxFQUFIO1VBQUEsQ0FBaEIsQ0FSQSxDQUFBO2lCQVNBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO21CQUFHLFdBQVcsQ0FBQyxrQkFBWixDQUFBLEVBQUg7VUFBQSxDQUFoQixFQVZXO1FBQUEsQ0FBYixDQUFBO0FBQUEsUUFZQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTttQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsd0JBQTlCLEVBRGM7VUFBQSxDQUFoQixDQUFBLENBQUE7aUJBRUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7bUJBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGVBQTlCLEVBRGM7VUFBQSxDQUFoQixFQUhTO1FBQUEsQ0FBWCxDQVpBLENBQUE7QUFBQSxRQWtCQSxRQUFBLENBQVMsMkJBQVQsRUFBc0MsU0FBQSxHQUFBO0FBQ3BDLFVBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTttQkFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkJBQWhCLEVBQStDLENBQUMsR0FBRCxDQUEvQyxFQURTO1VBQUEsQ0FBWCxDQUFBLENBQUE7aUJBR0EsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUEsR0FBQTtBQUM1QixZQUFBLFVBQUEsQ0FBVyxxQkFBWCxDQUFBLENBQUE7QUFBQSxZQUNBLElBQUEsQ0FBSyxTQUFBLEdBQUE7cUJBQ0gsTUFBQSxDQUFPLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxnQkFBOUIsQ0FBK0MsbUNBQS9DLENBQW1GLENBQUMsTUFBM0YsQ0FBa0csQ0FBQyxPQUFuRyxDQUEyRyxDQUEzRyxFQURHO1lBQUEsQ0FBTCxDQURBLENBQUE7QUFBQSxZQUlBLFVBQUEsQ0FBVyxtQ0FBWCxDQUpBLENBQUE7bUJBS0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtxQkFDSCxNQUFBLENBQU8sa0JBQWtCLENBQUMsVUFBVSxDQUFDLGdCQUE5QixDQUErQyxtQ0FBL0MsQ0FBbUYsQ0FBQyxNQUEzRixDQUFrRyxDQUFDLE9BQW5HLENBQTJHLEVBQTNHLEVBREc7WUFBQSxDQUFMLEVBTjRCO1VBQUEsQ0FBOUIsRUFKb0M7UUFBQSxDQUF0QyxDQWxCQSxDQUFBO0FBQUEsUUErQkEsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTtBQUMxQixVQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7bUJBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZCQUFoQixFQUErQyxDQUFDLFFBQUQsQ0FBL0MsRUFEUztVQUFBLENBQVgsQ0FBQSxDQUFBO2lCQUdBLEVBQUEsQ0FBRyxrQ0FBSCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsWUFBQSxVQUFBLENBQVcscUJBQVgsQ0FBQSxDQUFBO0FBQUEsWUFDQSxJQUFBLENBQUssU0FBQSxHQUFBO3FCQUNILE1BQUEsQ0FBTyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsZ0JBQTlCLENBQStDLG1DQUEvQyxDQUFtRixDQUFDLE1BQTNGLENBQWtHLENBQUMsT0FBbkcsQ0FBMkcsQ0FBM0csRUFERztZQUFBLENBQUwsQ0FEQSxDQUFBO0FBQUEsWUFJQSxVQUFBLENBQVcsbUNBQVgsQ0FKQSxDQUFBO21CQUtBLElBQUEsQ0FBSyxTQUFBLEdBQUE7cUJBQ0gsTUFBQSxDQUFPLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxnQkFBOUIsQ0FBK0MsbUNBQS9DLENBQW1GLENBQUMsTUFBM0YsQ0FBa0csQ0FBQyxPQUFuRyxDQUEyRyxDQUEzRyxFQURHO1lBQUEsQ0FBTCxFQU5xQztVQUFBLENBQXZDLEVBSjBCO1FBQUEsQ0FBNUIsQ0EvQkEsQ0FBQTtlQTRDQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLFVBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFlBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZCQUFoQixFQUErQyxDQUFDLFFBQUQsQ0FBL0MsQ0FBQSxDQUFBO21CQUNBLE9BQU8sQ0FBQyxxQkFBUixDQUE4QixDQUFDLE1BQUQsQ0FBOUIsRUFGUztVQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsVUFJQSxFQUFBLENBQUcsbUNBQUgsRUFBd0MsU0FBQSxHQUFBO0FBQ3RDLFlBQUEsVUFBQSxDQUFXLHFCQUFYLENBQUEsQ0FBQTtBQUFBLFlBQ0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtxQkFDSCxNQUFBLENBQU8sa0JBQWtCLENBQUMsVUFBVSxDQUFDLGdCQUE5QixDQUErQyxtQ0FBL0MsQ0FBbUYsQ0FBQyxNQUEzRixDQUFrRyxDQUFDLE9BQW5HLENBQTJHLENBQTNHLEVBREc7WUFBQSxDQUFMLENBREEsQ0FBQTtBQUFBLFlBSUEsVUFBQSxDQUFXLG1DQUFYLENBSkEsQ0FBQTtBQUFBLFlBS0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtxQkFDSCxNQUFBLENBQU8sa0JBQWtCLENBQUMsVUFBVSxDQUFDLGdCQUE5QixDQUErQyxtQ0FBL0MsQ0FBbUYsQ0FBQyxNQUEzRixDQUFrRyxDQUFDLE9BQW5HLENBQTJHLEVBQTNHLEVBREc7WUFBQSxDQUFMLENBTEEsQ0FBQTtBQUFBLFlBUUEsVUFBQSxDQUFXLHFCQUFYLENBUkEsQ0FBQTttQkFTQSxJQUFBLENBQUssU0FBQSxHQUFBO3FCQUNILE1BQUEsQ0FBTyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsZ0JBQTlCLENBQStDLG1DQUEvQyxDQUFtRixDQUFDLE1BQTNGLENBQWtHLENBQUMsT0FBbkcsQ0FBMkcsQ0FBM0csRUFERztZQUFBLENBQUwsRUFWc0M7VUFBQSxDQUF4QyxDQUpBLENBQUE7aUJBaUJBLFFBQUEsQ0FBUyxnQ0FBVCxFQUEyQyxTQUFBLEdBQUE7QUFDekMsWUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsY0FBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkJBQWhCLEVBQStDLENBQUMsUUFBRCxDQUEvQyxDQUFBLENBQUE7QUFBQSxjQUNBLE9BQU8sQ0FBQyxpQ0FBUixDQUEwQyxJQUExQyxDQURBLENBQUE7cUJBRUEsT0FBTyxDQUFDLHFCQUFSLENBQThCLENBQUMsTUFBRCxDQUE5QixFQUhTO1lBQUEsQ0FBWCxDQUFBLENBQUE7bUJBS0EsRUFBQSxDQUFHLG1DQUFILEVBQXdDLFNBQUEsR0FBQTtBQUN0QyxjQUFBLFVBQUEsQ0FBVyxxQkFBWCxDQUFBLENBQUE7QUFBQSxjQUNBLElBQUEsQ0FBSyxTQUFBLEdBQUE7dUJBQ0gsTUFBQSxDQUFPLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxnQkFBOUIsQ0FBK0MsbUNBQS9DLENBQW1GLENBQUMsTUFBM0YsQ0FBa0csQ0FBQyxPQUFuRyxDQUEyRyxDQUEzRyxFQURHO2NBQUEsQ0FBTCxDQURBLENBQUE7QUFBQSxjQUlBLFVBQUEsQ0FBVyxtQ0FBWCxDQUpBLENBQUE7QUFBQSxjQUtBLElBQUEsQ0FBSyxTQUFBLEdBQUE7dUJBQ0gsTUFBQSxDQUFPLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxnQkFBOUIsQ0FBK0MsbUNBQS9DLENBQW1GLENBQUMsTUFBM0YsQ0FBa0csQ0FBQyxPQUFuRyxDQUEyRyxFQUEzRyxFQURHO2NBQUEsQ0FBTCxDQUxBLENBQUE7QUFBQSxjQVFBLFVBQUEsQ0FBVyxxQkFBWCxDQVJBLENBQUE7cUJBU0EsSUFBQSxDQUFLLFNBQUEsR0FBQTt1QkFDSCxNQUFBLENBQU8sa0JBQWtCLENBQUMsVUFBVSxDQUFDLGdCQUE5QixDQUErQyxtQ0FBL0MsQ0FBbUYsQ0FBQyxNQUEzRixDQUFrRyxDQUFDLE9BQW5HLENBQTJHLENBQTNHLEVBREc7Y0FBQSxDQUFMLEVBVnNDO1lBQUEsQ0FBeEMsRUFOeUM7VUFBQSxDQUEzQyxFQWxCOEI7UUFBQSxDQUFoQyxFQTdDK0Q7TUFBQSxDQUFqRSxDQTNSQSxDQUFBO0FBQUEsTUE2V0EsUUFBQSxDQUFTLGlEQUFULEVBQTRELFNBQUEsR0FBQTtBQUMxRCxRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO21CQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4Qix3QkFBOUIsRUFEYztVQUFBLENBQWhCLENBQUEsQ0FBQTtBQUFBLFVBR0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7bUJBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLHFCQUFwQixDQUEwQyxDQUFDLElBQTNDLENBQWdELFNBQUMsQ0FBRCxHQUFBO0FBQzlDLGNBQUEsTUFBQSxHQUFTLENBQVQsQ0FBQTtBQUFBLGNBQ0EsYUFBQSxHQUFnQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsQ0FEaEIsQ0FBQTtBQUFBLGNBRUEsV0FBQSxHQUFjLE9BQU8sQ0FBQyxvQkFBUixDQUE2QixNQUE3QixDQUZkLENBQUE7QUFBQSxjQUdBLGtCQUFBLEdBQXFCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixXQUFuQixDQUhyQixDQUFBO3FCQUlBLGtCQUFrQixDQUFDLE1BQW5CLENBQUEsRUFMOEM7WUFBQSxDQUFoRCxFQURjO1VBQUEsQ0FBaEIsQ0FIQSxDQUFBO2lCQVdBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO21CQUFHLFdBQVcsQ0FBQyxVQUFaLENBQUEsRUFBSDtVQUFBLENBQWhCLEVBWlM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBY0EsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTtBQUMxQixVQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7bUJBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQixFQUEwQyxDQUFDLFlBQUQsQ0FBMUMsRUFEUztVQUFBLENBQVgsQ0FBQSxDQUFBO2lCQUdBLEVBQUEsQ0FBRyxvREFBSCxFQUF5RCxTQUFBLEdBQUE7bUJBQ3ZELE1BQUEsQ0FBTyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsZ0JBQTlCLENBQStDLG1DQUEvQyxDQUFtRixDQUFDLE1BQTNGLENBQWtHLENBQUMsT0FBbkcsQ0FBMkcsQ0FBM0csRUFEdUQ7VUFBQSxDQUF6RCxFQUowQjtRQUFBLENBQTVCLENBZEEsQ0FBQTtBQUFBLFFBcUJBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsVUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsRUFBMEMsQ0FBQyxXQUFELEVBQWMsWUFBZCxDQUExQyxFQURTO1VBQUEsQ0FBWCxDQUFBLENBQUE7aUJBR0EsRUFBQSxDQUFHLG9EQUFILEVBQXlELFNBQUEsR0FBQTttQkFDdkQsTUFBQSxDQUFPLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxnQkFBOUIsQ0FBK0MsbUNBQS9DLENBQW1GLENBQUMsTUFBM0YsQ0FBa0csQ0FBQyxPQUFuRyxDQUEyRyxDQUEzRyxFQUR1RDtVQUFBLENBQXpELEVBSjJCO1FBQUEsQ0FBN0IsQ0FyQkEsQ0FBQTtBQUFBLFFBNEJBLFFBQUEsQ0FBUyx3QkFBVCxFQUFtQyxTQUFBLEdBQUE7QUFDakMsVUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsRUFBMEMsQ0FBQyxJQUFELENBQTFDLEVBRFM7VUFBQSxDQUFYLENBQUEsQ0FBQTtpQkFHQSxFQUFBLENBQUcsb0JBQUgsRUFBeUIsU0FBQSxHQUFBO21CQUN2QixNQUFBLENBQU8sa0JBQWtCLENBQUMsVUFBVSxDQUFDLGdCQUE5QixDQUErQyxtQ0FBL0MsQ0FBbUYsQ0FBQyxNQUEzRixDQUFrRyxDQUFDLE9BQW5HLENBQTJHLENBQTNHLEVBRHVCO1VBQUEsQ0FBekIsRUFKaUM7UUFBQSxDQUFuQyxDQTVCQSxDQUFBO2VBbUNBLFFBQUEsQ0FBUywyQ0FBVCxFQUFzRCxTQUFBLEdBQUE7QUFDcEQsVUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsWUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0JBQWhCLEVBQTBDLENBQUMsV0FBRCxDQUExQyxDQUFBLENBQUE7bUJBQ0EsT0FBTyxDQUFDLGdCQUFSLENBQXlCLENBQUMsWUFBRCxDQUF6QixFQUZTO1VBQUEsQ0FBWCxDQUFBLENBQUE7aUJBSUEsRUFBQSxDQUFHLG9EQUFILEVBQXlELFNBQUEsR0FBQTttQkFDdkQsTUFBQSxDQUFPLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxnQkFBOUIsQ0FBK0MsbUNBQS9DLENBQW1GLENBQUMsTUFBM0YsQ0FBa0csQ0FBQyxPQUFuRyxDQUEyRyxDQUEzRyxFQUR1RDtVQUFBLENBQXpELEVBTG9EO1FBQUEsQ0FBdEQsRUFwQzBEO01BQUEsQ0FBNUQsQ0E3V0EsQ0FBQTthQXlaQSxRQUFBLENBQVMseUNBQVQsRUFBb0QsU0FBQSxHQUFBO0FBQ2xELFlBQUEsZUFBQTtBQUFBLFFBQUMsa0JBQW1CLEtBQXBCLENBQUE7QUFBQSxRQUNBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO21CQUFHLFdBQVcsQ0FBQyxrQkFBWixDQUFBLEVBQUg7VUFBQSxDQUFoQixDQUFBLENBQUE7aUJBRUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFlBQUEsZUFBQSxHQUFrQixrQkFBa0IsQ0FBQyxVQUFVLENBQUMsZ0JBQTlCLENBQStDLG1DQUEvQyxDQUFsQixDQUFBO0FBQUEsWUFDQSxLQUFBLENBQU0sa0JBQU4sRUFBMEIsZUFBMUIsQ0FBMEMsQ0FBQyxjQUEzQyxDQUFBLENBREEsQ0FBQTttQkFFQSxLQUFBLENBQU0sa0JBQWtCLENBQUEsU0FBeEIsRUFBNEIsUUFBNUIsQ0FBcUMsQ0FBQyxjQUF0QyxDQUFBLEVBSEc7VUFBQSxDQUFMLEVBSFM7UUFBQSxDQUFYLENBREEsQ0FBQTtBQUFBLFFBU0EsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTtBQUMxQixVQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7bUJBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlCQUFoQixFQUFtQyxFQUFuQyxFQURTO1VBQUEsQ0FBWCxDQUFBLENBQUE7aUJBR0EsRUFBQSxDQUFHLHNEQUFILEVBQTJELFNBQUEsR0FBQTtBQUN6RCxnQkFBQSwwQkFBQTtBQUFBLFlBQUEsTUFBQSxDQUFPLGtCQUFrQixDQUFDLGFBQTFCLENBQXdDLENBQUMsZ0JBQXpDLENBQUEsQ0FBQSxDQUFBO0FBQ0E7aUJBQUEsc0RBQUE7MkNBQUE7QUFDRSw0QkFBQSxNQUFBLENBQU8sTUFBTSxDQUFDLE1BQWQsQ0FBcUIsQ0FBQyxnQkFBdEIsQ0FBQSxFQUFBLENBREY7QUFBQTs0QkFGeUQ7VUFBQSxDQUEzRCxFQUowQjtRQUFBLENBQTVCLENBVEEsQ0FBQTtlQWtCQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLFVBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTttQkFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUJBQWhCLEVBQXFDLEVBQXJDLEVBRFM7VUFBQSxDQUFYLENBQUEsQ0FBQTtpQkFHQSxFQUFBLENBQUcsc0RBQUgsRUFBMkQsU0FBQSxHQUFBO0FBQ3pELGdCQUFBLDBCQUFBO0FBQUEsWUFBQSxNQUFBLENBQU8sa0JBQWtCLENBQUMsYUFBMUIsQ0FBd0MsQ0FBQyxnQkFBekMsQ0FBQSxDQUFBLENBQUE7QUFDQTtpQkFBQSxzREFBQTsyQ0FBQTtBQUNFLDRCQUFBLE1BQUEsQ0FBTyxNQUFNLENBQUMsTUFBZCxDQUFxQixDQUFDLGdCQUF0QixDQUFBLEVBQUEsQ0FERjtBQUFBOzRCQUZ5RDtVQUFBLENBQTNELEVBSjRCO1FBQUEsQ0FBOUIsRUFuQmtEO01BQUEsQ0FBcEQsRUExWm1DO0lBQUEsQ0FBckMsRUFwRDZCO0VBQUEsQ0FBL0IsQ0FYQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/spec/color-buffer-element-spec.coffee
