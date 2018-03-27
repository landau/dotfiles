(function() {
  var ColorBuffer, jsonFixture, path, registry,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require('path');

  ColorBuffer = require('../lib/color-buffer');

  registry = require('../lib/color-expressions');

  jsonFixture = require('./helpers/fixtures').jsonFixture(__dirname, 'fixtures');

  describe('ColorBuffer', function() {
    var colorBuffer, editBuffer, editor, pigments, project, ref, sleep;
    ref = [], editor = ref[0], colorBuffer = ref[1], pigments = ref[2], project = ref[3];
    sleep = function(ms) {
      var start;
      start = new Date;
      return function() {
        return new Date - start >= ms;
      };
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
    beforeEach(function() {
      atom.config.set('pigments.delayBeforeScan', 0);
      atom.config.set('pigments.ignoredBufferNames', []);
      atom.config.set('pigments.filetypesForColorWords', ['*']);
      atom.config.set('pigments.sourceNames', ['*.styl', '*.less']);
      atom.config.set('pigments.ignoredNames', ['project/vendor/**']);
      waitsForPromise(function() {
        return atom.workspace.open('four-variables.styl').then(function(o) {
          return editor = o;
        });
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          pigments = pkg.mainModule;
          return project = pigments.getProject();
        })["catch"](function(err) {
          return console.error(err);
        });
      });
    });
    afterEach(function() {
      return colorBuffer != null ? colorBuffer.destroy() : void 0;
    });
    it('creates a color buffer for each editor in the workspace', function() {
      return expect(project.colorBuffersByEditorId[editor.id]).toBeDefined();
    });
    describe('when the file path matches an entry in ignoredBufferNames', function() {
      beforeEach(function() {
        expect(project.hasColorBufferForEditor(editor)).toBeTruthy();
        return atom.config.set('pigments.ignoredBufferNames', ['**/*.styl']);
      });
      it('destroys the color buffer for this file', function() {
        return expect(project.hasColorBufferForEditor(editor)).toBeFalsy();
      });
      it('recreates the color buffer when the settings no longer ignore the file', function() {
        expect(project.hasColorBufferForEditor(editor)).toBeFalsy();
        atom.config.set('pigments.ignoredBufferNames', []);
        return expect(project.hasColorBufferForEditor(editor)).toBeTruthy();
      });
      return it('prevents the creation of a new color buffer', function() {
        waitsForPromise(function() {
          return atom.workspace.open('variables.styl').then(function(o) {
            return editor = o;
          });
        });
        return runs(function() {
          return expect(project.hasColorBufferForEditor(editor)).toBeFalsy();
        });
      });
    });
    describe('when an editor with a path is not in the project paths is opened', function() {
      beforeEach(function() {
        return waitsFor(function() {
          return project.getPaths() != null;
        });
      });
      describe('when the file is already saved on disk', function() {
        var pathToOpen;
        pathToOpen = null;
        beforeEach(function() {
          return pathToOpen = project.paths.shift();
        });
        return it('adds the path to the project immediately', function() {
          spyOn(project, 'appendPath');
          waitsForPromise(function() {
            return atom.workspace.open(pathToOpen).then(function(o) {
              editor = o;
              return colorBuffer = project.colorBufferForEditor(editor);
            });
          });
          return runs(function() {
            return expect(project.appendPath).toHaveBeenCalledWith(pathToOpen);
          });
        });
      });
      return describe('when the file is not yet saved on disk', function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open('foo-de-fafa.styl').then(function(o) {
              editor = o;
              return colorBuffer = project.colorBufferForEditor(editor);
            });
          });
          return waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
        });
        it('does not fails when updating the colorBuffer', function() {
          return expect(function() {
            return colorBuffer.update();
          }).not.toThrow();
        });
        return it('adds the path to the project paths on save', function() {
          spyOn(colorBuffer, 'update').andCallThrough();
          spyOn(project, 'appendPath');
          editor.getBuffer().emitter.emit('did-save', {
            path: editor.getPath()
          });
          waitsFor(function() {
            return colorBuffer.update.callCount > 0;
          });
          return runs(function() {
            return expect(project.appendPath).toHaveBeenCalledWith(editor.getPath());
          });
        });
      });
    });
    describe('when an editor without path is opened', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open().then(function(o) {
            editor = o;
            return colorBuffer = project.colorBufferForEditor(editor);
          });
        });
        return waitsForPromise(function() {
          return colorBuffer.variablesAvailable();
        });
      });
      it('does not fails when updating the colorBuffer', function() {
        return expect(function() {
          return colorBuffer.update();
        }).not.toThrow();
      });
      return describe('when the file is saved and aquires a path', function() {
        describe('that is legible', function() {
          beforeEach(function() {
            spyOn(colorBuffer, 'update').andCallThrough();
            spyOn(editor, 'getPath').andReturn('new-path.styl');
            editor.emitter.emit('did-change-path', editor.getPath());
            return waitsFor(function() {
              return colorBuffer.update.callCount > 0;
            });
          });
          return it('adds the path to the project paths', function() {
            return expect(indexOf.call(project.getPaths(), 'new-path.styl') >= 0).toBeTruthy();
          });
        });
        describe('that is not legible', function() {
          beforeEach(function() {
            spyOn(colorBuffer, 'update').andCallThrough();
            spyOn(editor, 'getPath').andReturn('new-path.sass');
            editor.emitter.emit('did-change-path', editor.getPath());
            return waitsFor(function() {
              return colorBuffer.update.callCount > 0;
            });
          });
          return it('does not add the path to the project paths', function() {
            return expect(indexOf.call(project.getPaths(), 'new-path.styl') >= 0).toBeFalsy();
          });
        });
        return describe('that is ignored', function() {
          beforeEach(function() {
            spyOn(colorBuffer, 'update').andCallThrough();
            spyOn(editor, 'getPath').andReturn('project/vendor/new-path.styl');
            editor.emitter.emit('did-change-path', editor.getPath());
            return waitsFor(function() {
              return colorBuffer.update.callCount > 0;
            });
          });
          return it('does not add the path to the project paths', function() {
            return expect(indexOf.call(project.getPaths(), 'new-path.styl') >= 0).toBeFalsy();
          });
        });
      });
    });
    describe('with rapid changes that triggers a rescan', function() {
      beforeEach(function() {
        colorBuffer = project.colorBufferForEditor(editor);
        waitsFor(function() {
          return colorBuffer.initialized && colorBuffer.variableInitialized;
        });
        runs(function() {
          spyOn(colorBuffer, 'terminateRunningTask').andCallThrough();
          spyOn(colorBuffer, 'updateColorMarkers').andCallThrough();
          spyOn(colorBuffer, 'scanBufferForVariables').andCallThrough();
          editor.moveToBottom();
          editor.insertText('#fff\n');
          return editor.getBuffer().emitter.emit('did-stop-changing');
        });
        waitsFor(function() {
          return colorBuffer.scanBufferForVariables.callCount > 0;
        });
        return runs(function() {
          return editor.insertText(' ');
        });
      });
      return it('terminates the currently running task', function() {
        return expect(colorBuffer.terminateRunningTask).toHaveBeenCalled();
      });
    });
    describe('when created without a previous state', function() {
      beforeEach(function() {
        colorBuffer = project.colorBufferForEditor(editor);
        return waitsForPromise(function() {
          return colorBuffer.initialize();
        });
      });
      it('scans the buffer for colors without waiting for the project variables', function() {
        expect(colorBuffer.getColorMarkers().length).toEqual(4);
        return expect(colorBuffer.getValidColorMarkers().length).toEqual(3);
      });
      it('creates the corresponding markers in the text editor', function() {
        return expect(colorBuffer.getMarkerLayer().findMarkers().length).toEqual(4);
      });
      it('knows that it is legible as a variables source file', function() {
        return expect(colorBuffer.isVariablesSource()).toBeTruthy();
      });
      describe('when the editor is destroyed', function() {
        return it('destroys the color buffer at the same time', function() {
          editor.destroy();
          return expect(project.colorBuffersByEditorId[editor.id]).toBeUndefined();
        });
      });
      describe('::getColorMarkerAtBufferPosition', function() {
        describe('when the buffer position is contained in a marker range', function() {
          return it('returns the corresponding color marker', function() {
            var colorMarker;
            colorMarker = colorBuffer.getColorMarkerAtBufferPosition([2, 15]);
            return expect(colorMarker).toEqual(colorBuffer.colorMarkers[1]);
          });
        });
        return describe('when the buffer position is not contained in a marker range', function() {
          return it('returns undefined', function() {
            return expect(colorBuffer.getColorMarkerAtBufferPosition([1, 15])).toBeUndefined();
          });
        });
      });
      describe('when the project variables becomes available', function() {
        var updateSpy;
        updateSpy = [][0];
        beforeEach(function() {
          updateSpy = jasmine.createSpy('did-update-color-markers');
          colorBuffer.onDidUpdateColorMarkers(updateSpy);
          return waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
        });
        it('replaces the invalid markers that are now valid', function() {
          expect(colorBuffer.getValidColorMarkers().length).toEqual(4);
          expect(updateSpy.argsForCall[0][0].created.length).toEqual(1);
          return expect(updateSpy.argsForCall[0][0].destroyed.length).toEqual(1);
        });
        describe('when a variable is edited', function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = [][0];
          beforeEach(function() {
            colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
            colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
            return editBuffer('#336699', {
              start: [0, 13],
              end: [0, 17]
            });
          });
          return it('updates the modified colors', function() {
            waitsFor(function() {
              return colorsUpdateSpy.callCount > 0;
            });
            return runs(function() {
              expect(colorsUpdateSpy.argsForCall[0][0].destroyed.length).toEqual(2);
              return expect(colorsUpdateSpy.argsForCall[0][0].created.length).toEqual(2);
            });
          });
        });
        describe('when a new variable is added', function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = [][0];
          beforeEach(function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            return runs(function() {
              updateSpy = jasmine.createSpy('did-update-color-markers');
              colorBuffer.onDidUpdateColorMarkers(updateSpy);
              editor.moveToBottom();
              editBuffer('\nfoo = base-color');
              return waitsFor(function() {
                return updateSpy.callCount > 0;
              });
            });
          });
          return it('dispatches the new marker in a did-update-color-markers event', function() {
            expect(updateSpy.argsForCall[0][0].destroyed.length).toEqual(0);
            return expect(updateSpy.argsForCall[0][0].created.length).toEqual(1);
          });
        });
        describe('when a variable is removed', function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = [][0];
          beforeEach(function() {
            colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
            colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
            editBuffer('', {
              start: [0, 0],
              end: [0, 17]
            });
            return waitsFor(function() {
              return colorsUpdateSpy.callCount > 0;
            });
          });
          return it('invalidates colors that were relying on the deleted variables', function() {
            expect(colorBuffer.getColorMarkers().length).toEqual(3);
            return expect(colorBuffer.getValidColorMarkers().length).toEqual(2);
          });
        });
        return describe('::serialize', function() {
          beforeEach(function() {
            return waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
          });
          return it('returns the whole buffer data', function() {
            var expected;
            expected = jsonFixture("four-variables-buffer.json", {
              id: editor.id,
              root: atom.project.getPaths()[0],
              colorMarkers: colorBuffer.getColorMarkers().map(function(m) {
                return m.marker.id;
              })
            });
            return expect(colorBuffer.serialize()).toEqual(expected);
          });
        });
      });
      describe('with a buffer with only colors', function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open('buttons.styl').then(function(o) {
              return editor = o;
            });
          });
          return runs(function() {
            return colorBuffer = project.colorBufferForEditor(editor);
          });
        });
        it('creates the color markers for the variables used in the buffer', function() {
          waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
          return runs(function() {
            return expect(colorBuffer.getColorMarkers().length).toEqual(3);
          });
        });
        describe('when a color marker is edited', function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = [][0];
          beforeEach(function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            return runs(function() {
              colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
              colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
              editBuffer('#336699', {
                start: [1, 13],
                end: [1, 23]
              });
              return waitsFor(function() {
                return colorsUpdateSpy.callCount > 0;
              });
            });
          });
          it('updates the modified color marker', function() {
            var marker, markers;
            markers = colorBuffer.getColorMarkers();
            marker = markers[markers.length - 1];
            return expect(marker.color).toBeColor('#336699');
          });
          return it('updates only the affected marker', function() {
            expect(colorsUpdateSpy.argsForCall[0][0].destroyed.length).toEqual(1);
            return expect(colorsUpdateSpy.argsForCall[0][0].created.length).toEqual(1);
          });
        });
        describe('when new lines changes the markers range', function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = [][0];
          beforeEach(function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            return runs(function() {
              colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
              colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
              editBuffer('#fff\n\n', {
                start: [0, 0],
                end: [0, 0]
              });
              return waitsFor(function() {
                return colorsUpdateSpy.callCount > 0;
              });
            });
          });
          return it('does not destroys the previous markers', function() {
            expect(colorsUpdateSpy.argsForCall[0][0].destroyed.length).toEqual(0);
            return expect(colorsUpdateSpy.argsForCall[0][0].created.length).toEqual(1);
          });
        });
        describe('when a new color is added', function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = [][0];
          beforeEach(function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            return runs(function() {
              colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
              colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
              editor.moveToBottom();
              editBuffer('\n#336699');
              return waitsFor(function() {
                return colorsUpdateSpy.callCount > 0;
              });
            });
          });
          it('adds a marker for the new color', function() {
            var marker, markers;
            markers = colorBuffer.getColorMarkers();
            marker = markers[markers.length - 1];
            expect(markers.length).toEqual(4);
            expect(marker.color).toBeColor('#336699');
            return expect(colorBuffer.getMarkerLayer().findMarkers().length).toEqual(4);
          });
          return it('dispatches the new marker in a did-update-color-markers event', function() {
            expect(colorsUpdateSpy.argsForCall[0][0].destroyed.length).toEqual(0);
            return expect(colorsUpdateSpy.argsForCall[0][0].created.length).toEqual(1);
          });
        });
        return describe('when a color marker is edited', function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = [][0];
          beforeEach(function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            return runs(function() {
              colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
              colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
              editBuffer('', {
                start: [1, 2],
                end: [1, 23]
              });
              return waitsFor(function() {
                return colorsUpdateSpy.callCount > 0;
              });
            });
          });
          it('updates the modified color marker', function() {
            return expect(colorBuffer.getColorMarkers().length).toEqual(2);
          });
          it('updates only the affected marker', function() {
            expect(colorsUpdateSpy.argsForCall[0][0].destroyed.length).toEqual(1);
            return expect(colorsUpdateSpy.argsForCall[0][0].created.length).toEqual(0);
          });
          return it('removes the previous editor markers', function() {
            return expect(colorBuffer.getMarkerLayer().findMarkers().length).toEqual(2);
          });
        });
      });
      describe('with a buffer whose scope is not one of source files', function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open('project/lib/main.coffee').then(function(o) {
              return editor = o;
            });
          });
          runs(function() {
            return colorBuffer = project.colorBufferForEditor(editor);
          });
          return waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
        });
        return it('does not renders colors from variables', function() {
          return expect(colorBuffer.getColorMarkers().length).toEqual(4);
        });
      });
      return describe('with a buffer in crlf mode', function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open('crlf.styl').then(function(o) {
              return editor = o;
            });
          });
          runs(function() {
            return colorBuffer = project.colorBufferForEditor(editor);
          });
          return waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
        });
        return it('creates a marker for each colors', function() {
          return expect(colorBuffer.getValidColorMarkers().length).toEqual(2);
        });
      });
    });
    describe('with a buffer part of the global ignored files', function() {
      beforeEach(function() {
        project.setIgnoredNames([]);
        atom.config.set('pigments.ignoredNames', ['project/vendor/*']);
        waitsForPromise(function() {
          return atom.workspace.open('project/vendor/css/variables.less').then(function(o) {
            return editor = o;
          });
        });
        runs(function() {
          return colorBuffer = project.colorBufferForEditor(editor);
        });
        return waitsForPromise(function() {
          return colorBuffer.variablesAvailable();
        });
      });
      it('knows that it is part of the ignored files', function() {
        return expect(colorBuffer.isIgnored()).toBeTruthy();
      });
      it('knows that it is a variables source file', function() {
        return expect(colorBuffer.isVariablesSource()).toBeTruthy();
      });
      return it('scans the buffer for variables for in-buffer use only', function() {
        var validMarkers;
        expect(colorBuffer.getColorMarkers().length).toEqual(20);
        validMarkers = colorBuffer.getColorMarkers().filter(function(m) {
          return m.color.isValid();
        });
        return expect(validMarkers.length).toEqual(20);
      });
    });
    describe('with a buffer part of the project ignored files', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('project/vendor/css/variables.less').then(function(o) {
            return editor = o;
          });
        });
        runs(function() {
          return colorBuffer = project.colorBufferForEditor(editor);
        });
        return waitsForPromise(function() {
          return colorBuffer.variablesAvailable();
        });
      });
      it('knows that it is part of the ignored files', function() {
        return expect(colorBuffer.isIgnored()).toBeTruthy();
      });
      it('knows that it is a variables source file', function() {
        return expect(colorBuffer.isVariablesSource()).toBeTruthy();
      });
      it('scans the buffer for variables for in-buffer use only', function() {
        var validMarkers;
        expect(colorBuffer.getColorMarkers().length).toEqual(20);
        validMarkers = colorBuffer.getColorMarkers().filter(function(m) {
          return m.color.isValid();
        });
        return expect(validMarkers.length).toEqual(20);
      });
      return describe('when the buffer is edited', function() {
        beforeEach(function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
          colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
          editor.moveToBottom();
          editBuffer('\n\n@new-color: @base0;\n');
          return waitsFor(function() {
            return colorsUpdateSpy.callCount > 0;
          });
        });
        return it('finds the newly added color', function() {
          var validMarkers;
          expect(colorBuffer.getColorMarkers().length).toEqual(21);
          validMarkers = colorBuffer.getColorMarkers().filter(function(m) {
            return m.color.isValid();
          });
          return expect(validMarkers.length).toEqual(21);
        });
      });
    });
    describe('with a buffer not being a variable source', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('project/lib/main.coffee').then(function(o) {
            return editor = o;
          });
        });
        runs(function() {
          return colorBuffer = project.colorBufferForEditor(editor);
        });
        return waitsForPromise(function() {
          return colorBuffer.variablesAvailable();
        });
      });
      it('knows that it is not part of the source files', function() {
        return expect(colorBuffer.isVariablesSource()).toBeFalsy();
      });
      it('knows that it is not part of the ignored files', function() {
        return expect(colorBuffer.isIgnored()).toBeFalsy();
      });
      it('scans the buffer for variables for in-buffer use only', function() {
        var validMarkers;
        expect(colorBuffer.getColorMarkers().length).toEqual(4);
        validMarkers = colorBuffer.getColorMarkers().filter(function(m) {
          return m.color.isValid();
        });
        return expect(validMarkers.length).toEqual(4);
      });
      return describe('when the buffer is edited', function() {
        beforeEach(function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
          spyOn(project, 'reloadVariablesForPath').andCallThrough();
          colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
          editor.moveToBottom();
          editBuffer('\n\n@new-color = red;\n');
          return waitsFor(function() {
            return colorsUpdateSpy.callCount > 0;
          });
        });
        it('finds the newly added color', function() {
          var validMarkers;
          expect(colorBuffer.getColorMarkers().length).toEqual(5);
          validMarkers = colorBuffer.getColorMarkers().filter(function(m) {
            return m.color.isValid();
          });
          return expect(validMarkers.length).toEqual(5);
        });
        return it('does not ask the project to reload the variables', function() {
          if (parseFloat(atom.getVersion()) >= 1.19) {
            return expect(project.reloadVariablesForPath).not.toHaveBeenCalled();
          } else {
            return expect(project.reloadVariablesForPath.mostRecentCall.args[0]).not.toEqual(colorBuffer.editor.getPath());
          }
        });
      });
    });
    return describe('when created with a previous state', function() {
      describe('with variables and colors', function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return project.initialize();
          });
          return runs(function() {
            var state;
            project.colorBufferForEditor(editor).destroy();
            state = jsonFixture('four-variables-buffer.json', {
              id: editor.id,
              root: atom.project.getPaths()[0],
              colorMarkers: [-1, -2, -3, -4]
            });
            state.editor = editor;
            state.project = project;
            return colorBuffer = new ColorBuffer(state);
          });
        });
        it('creates markers from the state object', function() {
          return expect(colorBuffer.getColorMarkers().length).toEqual(4);
        });
        it('restores the markers properties', function() {
          var colorMarker;
          colorMarker = colorBuffer.getColorMarkers()[3];
          expect(colorMarker.color).toBeColor(255, 255, 255, 0.5);
          return expect(colorMarker.color.variables).toEqual(['base-color']);
        });
        it('restores the editor markers', function() {
          return expect(colorBuffer.getMarkerLayer().findMarkers().length).toEqual(4);
        });
        return it('restores the ability to fetch markers', function() {
          var i, len, marker, ref1, results;
          expect(colorBuffer.findColorMarkers().length).toEqual(4);
          ref1 = colorBuffer.findColorMarkers();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            marker = ref1[i];
            results.push(expect(marker).toBeDefined());
          }
          return results;
        });
      });
      return describe('with an invalid color', function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open('invalid-color.styl').then(function(o) {
              return editor = o;
            });
          });
          waitsForPromise(function() {
            return project.initialize();
          });
          return runs(function() {
            var state;
            state = jsonFixture('invalid-color-buffer.json', {
              id: editor.id,
              root: atom.project.getPaths()[0],
              colorMarkers: [-1]
            });
            state.editor = editor;
            state.project = project;
            return colorBuffer = new ColorBuffer(state);
          });
        });
        return it('creates markers from the state object', function() {
          expect(colorBuffer.getColorMarkers().length).toEqual(1);
          return expect(colorBuffer.getValidColorMarkers().length).toEqual(0);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9jb2xvci1idWZmZXItc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHdDQUFBO0lBQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFdBQUEsR0FBYyxPQUFBLENBQVEscUJBQVI7O0VBQ2QsUUFBQSxHQUFXLE9BQUEsQ0FBUSwwQkFBUjs7RUFDWCxXQUFBLEdBQWMsT0FBQSxDQUFRLG9CQUFSLENBQTZCLENBQUMsV0FBOUIsQ0FBMEMsU0FBMUMsRUFBcUQsVUFBckQ7O0VBR2QsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQTtBQUN0QixRQUFBO0lBQUEsTUFBMkMsRUFBM0MsRUFBQyxlQUFELEVBQVMsb0JBQVQsRUFBc0IsaUJBQXRCLEVBQWdDO0lBRWhDLEtBQUEsR0FBUSxTQUFDLEVBQUQ7QUFDTixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUk7YUFDWixTQUFBO2VBQUcsSUFBSSxJQUFKLEdBQVcsS0FBWCxJQUFvQjtNQUF2QjtJQUZNO0lBSVIsVUFBQSxHQUFhLFNBQUMsSUFBRCxFQUFPLE9BQVA7QUFDWCxVQUFBOztRQURrQixVQUFROztNQUMxQixJQUFHLHFCQUFIO1FBQ0UsSUFBRyxtQkFBSDtVQUNFLEtBQUEsR0FBUSxDQUFDLE9BQU8sQ0FBQyxLQUFULEVBQWdCLE9BQU8sQ0FBQyxHQUF4QixFQURWO1NBQUEsTUFBQTtVQUdFLEtBQUEsR0FBUSxDQUFDLE9BQU8sQ0FBQyxLQUFULEVBQWdCLE9BQU8sQ0FBQyxLQUF4QixFQUhWOztRQUtBLE1BQU0sQ0FBQyxzQkFBUCxDQUE4QixLQUE5QixFQU5GOztNQVFBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQWxCO01BQ0EsSUFBQSxDQUF5QixPQUFPLENBQUMsT0FBakM7ZUFBQSxZQUFBLENBQWEsR0FBYixFQUFB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dGggPSByZXF1aXJlICdwYXRoJ1xuQ29sb3JCdWZmZXIgPSByZXF1aXJlICcuLi9saWIvY29sb3ItYnVmZmVyJ1xucmVnaXN0cnkgPSByZXF1aXJlICcuLi9saWIvY29sb3ItZXhwcmVzc2lvbnMnXG5qc29uRml4dHVyZSA9IHJlcXVpcmUoJy4vaGVscGVycy9maXh0dXJlcycpLmpzb25GaXh0dXJlKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJylcblxuXG5kZXNjcmliZSAnQ29sb3JCdWZmZXInLCAtPlxuICBbZWRpdG9yLCBjb2xvckJ1ZmZlciwgcGlnbWVudHMsIHByb2plY3RdID0gW11cblxuICBzbGVlcCA9IChtcykgLT5cbiAgICBzdGFydCA9IG5ldyBEYXRlXG4gICAgLT4gbmV3IERhdGUgLSBzdGFydCA+PSBtc1xuXG4gIGVkaXRCdWZmZXIgPSAodGV4dCwgb3B0aW9ucz17fSkgLT5cbiAgICBpZiBvcHRpb25zLnN0YXJ0P1xuICAgICAgaWYgb3B0aW9ucy5lbmQ/XG4gICAgICAgIHJhbmdlID0gW29wdGlvbnMuc3RhcnQsIG9wdGlvbnMuZW5kXVxuICAgICAgZWxzZVxuICAgICAgICByYW5nZSA9IFtvcHRpb25zLnN0YXJ0LCBvcHRpb25zLnN0YXJ0XVxuXG4gICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShyYW5nZSlcblxuICAgIGVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG4gICAgYWR2YW5jZUNsb2NrKDUwMCkgdW5sZXNzIG9wdGlvbnMubm9FdmVudFxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLmRlbGF5QmVmb3JlU2NhbicsIDBcbiAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLmlnbm9yZWRCdWZmZXJOYW1lcycsIFtdXG4gICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5maWxldHlwZXNGb3JDb2xvcldvcmRzJywgWycqJ11cbiAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLnNvdXJjZU5hbWVzJywgW1xuICAgICAgJyouc3R5bCdcbiAgICAgICcqLmxlc3MnXG4gICAgXVxuXG4gICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5pZ25vcmVkTmFtZXMnLCBbJ3Byb2plY3QvdmVuZG9yLyoqJ11cblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbignZm91ci12YXJpYWJsZXMuc3R5bCcpLnRoZW4gKG8pIC0+IGVkaXRvciA9IG9cblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3BpZ21lbnRzJykudGhlbiAocGtnKSAtPlxuICAgICAgICBwaWdtZW50cyA9IHBrZy5tYWluTW9kdWxlXG4gICAgICAgIHByb2plY3QgPSBwaWdtZW50cy5nZXRQcm9qZWN0KClcbiAgICAgIC5jYXRjaCAoZXJyKSAtPiBjb25zb2xlLmVycm9yIGVyclxuXG4gIGFmdGVyRWFjaCAtPlxuICAgIGNvbG9yQnVmZmVyPy5kZXN0cm95KClcblxuICBpdCAnY3JlYXRlcyBhIGNvbG9yIGJ1ZmZlciBmb3IgZWFjaCBlZGl0b3IgaW4gdGhlIHdvcmtzcGFjZScsIC0+XG4gICAgZXhwZWN0KHByb2plY3QuY29sb3JCdWZmZXJzQnlFZGl0b3JJZFtlZGl0b3IuaWRdKS50b0JlRGVmaW5lZCgpXG5cbiAgZGVzY3JpYmUgJ3doZW4gdGhlIGZpbGUgcGF0aCBtYXRjaGVzIGFuIGVudHJ5IGluIGlnbm9yZWRCdWZmZXJOYW1lcycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZXhwZWN0KHByb2plY3QuaGFzQ29sb3JCdWZmZXJGb3JFZGl0b3IoZWRpdG9yKSkudG9CZVRydXRoeSgpXG5cbiAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuaWdub3JlZEJ1ZmZlck5hbWVzJywgWycqKi8qLnN0eWwnXVxuXG4gICAgaXQgJ2Rlc3Ryb3lzIHRoZSBjb2xvciBidWZmZXIgZm9yIHRoaXMgZmlsZScsIC0+XG4gICAgICBleHBlY3QocHJvamVjdC5oYXNDb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpKS50b0JlRmFsc3koKVxuXG4gICAgaXQgJ3JlY3JlYXRlcyB0aGUgY29sb3IgYnVmZmVyIHdoZW4gdGhlIHNldHRpbmdzIG5vIGxvbmdlciBpZ25vcmUgdGhlIGZpbGUnLCAtPlxuICAgICAgZXhwZWN0KHByb2plY3QuaGFzQ29sb3JCdWZmZXJGb3JFZGl0b3IoZWRpdG9yKSkudG9CZUZhbHN5KClcblxuICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5pZ25vcmVkQnVmZmVyTmFtZXMnLCBbXVxuXG4gICAgICBleHBlY3QocHJvamVjdC5oYXNDb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpKS50b0JlVHJ1dGh5KClcblxuICAgIGl0ICdwcmV2ZW50cyB0aGUgY3JlYXRpb24gb2YgYSBuZXcgY29sb3IgYnVmZmVyJywgLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCd2YXJpYWJsZXMuc3R5bCcpLnRoZW4gKG8pIC0+IGVkaXRvciA9IG9cblxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QocHJvamVjdC5oYXNDb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpKS50b0JlRmFsc3koKVxuXG4gIGRlc2NyaWJlICd3aGVuIGFuIGVkaXRvciB3aXRoIGEgcGF0aCBpcyBub3QgaW4gdGhlIHByb2plY3QgcGF0aHMgaXMgb3BlbmVkJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvciAtPiBwcm9qZWN0LmdldFBhdGhzKCk/XG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgZmlsZSBpcyBhbHJlYWR5IHNhdmVkIG9uIGRpc2snLCAtPlxuICAgICAgcGF0aFRvT3BlbiA9IG51bGxcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBwYXRoVG9PcGVuID0gcHJvamVjdC5wYXRocy5zaGlmdCgpXG5cbiAgICAgIGl0ICdhZGRzIHRoZSBwYXRoIHRvIHRoZSBwcm9qZWN0IGltbWVkaWF0ZWx5JywgLT5cbiAgICAgICAgc3B5T24ocHJvamVjdCwgJ2FwcGVuZFBhdGgnKVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aFRvT3BlbikudGhlbiAobykgLT5cbiAgICAgICAgICAgIGVkaXRvciA9IG9cbiAgICAgICAgICAgIGNvbG9yQnVmZmVyID0gcHJvamVjdC5jb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmFwcGVuZFBhdGgpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHBhdGhUb09wZW4pXG5cblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZSBmaWxlIGlzIG5vdCB5ZXQgc2F2ZWQgb24gZGlzaycsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ2Zvby1kZS1mYWZhLnN0eWwnKS50aGVuIChvKSAtPlxuICAgICAgICAgICAgZWRpdG9yID0gb1xuICAgICAgICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcblxuICAgICAgaXQgJ2RvZXMgbm90IGZhaWxzIHdoZW4gdXBkYXRpbmcgdGhlIGNvbG9yQnVmZmVyJywgLT5cbiAgICAgICAgZXhwZWN0KC0+IGNvbG9yQnVmZmVyLnVwZGF0ZSgpKS5ub3QudG9UaHJvdygpXG5cbiAgICAgIGl0ICdhZGRzIHRoZSBwYXRoIHRvIHRoZSBwcm9qZWN0IHBhdGhzIG9uIHNhdmUnLCAtPlxuICAgICAgICBzcHlPbihjb2xvckJ1ZmZlciwgJ3VwZGF0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgc3B5T24ocHJvamVjdCwgJ2FwcGVuZFBhdGgnKVxuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuZW1pdHRlci5lbWl0ICdkaWQtc2F2ZScsIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcblxuICAgICAgICB3YWl0c0ZvciAtPiBjb2xvckJ1ZmZlci51cGRhdGUuY2FsbENvdW50ID4gMFxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3QocHJvamVjdC5hcHBlbmRQYXRoKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChlZGl0b3IuZ2V0UGF0aCgpKVxuXG4gIGRlc2NyaWJlICd3aGVuIGFuIGVkaXRvciB3aXRob3V0IHBhdGggaXMgb3BlbmVkJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4gKG8pIC0+XG4gICAgICAgICAgZWRpdG9yID0gb1xuICAgICAgICAgIGNvbG9yQnVmZmVyID0gcHJvamVjdC5jb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci52YXJpYWJsZXNBdmFpbGFibGUoKVxuXG4gICAgaXQgJ2RvZXMgbm90IGZhaWxzIHdoZW4gdXBkYXRpbmcgdGhlIGNvbG9yQnVmZmVyJywgLT5cbiAgICAgIGV4cGVjdCgtPiBjb2xvckJ1ZmZlci51cGRhdGUoKSkubm90LnRvVGhyb3coKVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gdGhlIGZpbGUgaXMgc2F2ZWQgYW5kIGFxdWlyZXMgYSBwYXRoJywgLT5cbiAgICAgIGRlc2NyaWJlICd0aGF0IGlzIGxlZ2libGUnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc3B5T24oY29sb3JCdWZmZXIsICd1cGRhdGUnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0UGF0aCcpLmFuZFJldHVybignbmV3LXBhdGguc3R5bCcpXG4gICAgICAgICAgZWRpdG9yLmVtaXR0ZXIuZW1pdCAnZGlkLWNoYW5nZS1wYXRoJywgZWRpdG9yLmdldFBhdGgoKVxuXG4gICAgICAgICAgd2FpdHNGb3IgLT4gY29sb3JCdWZmZXIudXBkYXRlLmNhbGxDb3VudCA+IDBcblxuICAgICAgICBpdCAnYWRkcyB0aGUgcGF0aCB0byB0aGUgcHJvamVjdCBwYXRocycsIC0+XG4gICAgICAgICAgZXhwZWN0KCduZXctcGF0aC5zdHlsJyBpbiBwcm9qZWN0LmdldFBhdGhzKCkpLnRvQmVUcnV0aHkoKVxuXG4gICAgICBkZXNjcmliZSAndGhhdCBpcyBub3QgbGVnaWJsZScsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzcHlPbihjb2xvckJ1ZmZlciwgJ3VwZGF0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgICBzcHlPbihlZGl0b3IsICdnZXRQYXRoJykuYW5kUmV0dXJuKCduZXctcGF0aC5zYXNzJylcbiAgICAgICAgICBlZGl0b3IuZW1pdHRlci5lbWl0ICdkaWQtY2hhbmdlLXBhdGgnLCBlZGl0b3IuZ2V0UGF0aCgpXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPiBjb2xvckJ1ZmZlci51cGRhdGUuY2FsbENvdW50ID4gMFxuXG4gICAgICAgIGl0ICdkb2VzIG5vdCBhZGQgdGhlIHBhdGggdG8gdGhlIHByb2plY3QgcGF0aHMnLCAtPlxuICAgICAgICAgIGV4cGVjdCgnbmV3LXBhdGguc3R5bCcgaW4gcHJvamVjdC5nZXRQYXRocygpKS50b0JlRmFsc3koKVxuXG4gICAgICBkZXNjcmliZSAndGhhdCBpcyBpZ25vcmVkJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNweU9uKGNvbG9yQnVmZmVyLCAndXBkYXRlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICAgIHNweU9uKGVkaXRvciwgJ2dldFBhdGgnKS5hbmRSZXR1cm4oJ3Byb2plY3QvdmVuZG9yL25ldy1wYXRoLnN0eWwnKVxuICAgICAgICAgIGVkaXRvci5lbWl0dGVyLmVtaXQgJ2RpZC1jaGFuZ2UtcGF0aCcsIGVkaXRvci5nZXRQYXRoKClcblxuICAgICAgICAgIHdhaXRzRm9yIC0+IGNvbG9yQnVmZmVyLnVwZGF0ZS5jYWxsQ291bnQgPiAwXG5cbiAgICAgICAgaXQgJ2RvZXMgbm90IGFkZCB0aGUgcGF0aCB0byB0aGUgcHJvamVjdCBwYXRocycsIC0+XG4gICAgICAgICAgZXhwZWN0KCduZXctcGF0aC5zdHlsJyBpbiBwcm9qZWN0LmdldFBhdGhzKCkpLnRvQmVGYWxzeSgpXG5cbiAgIyBGSVhNRSBVc2luZyBhIDFzIHNsZWVwIHNlZW1zIHRvIGRvIG5vdGhpbmcgb24gVHJhdmlzLCBpdCdsbCBuZWVkXG4gICMgYSBiZXR0ZXIgc29sdXRpb24uXG4gIGRlc2NyaWJlICd3aXRoIHJhcGlkIGNoYW5nZXMgdGhhdCB0cmlnZ2VycyBhIHJlc2NhbicsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcbiAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgIGNvbG9yQnVmZmVyLmluaXRpYWxpemVkIGFuZCBjb2xvckJ1ZmZlci52YXJpYWJsZUluaXRpYWxpemVkXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc3B5T24oY29sb3JCdWZmZXIsICd0ZXJtaW5hdGVSdW5uaW5nVGFzaycpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgc3B5T24oY29sb3JCdWZmZXIsICd1cGRhdGVDb2xvck1hcmtlcnMnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIHNweU9uKGNvbG9yQnVmZmVyLCAnc2NhbkJ1ZmZlckZvclZhcmlhYmxlcycpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcblxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnI2ZmZlxcbicpXG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5lbWl0dGVyLmVtaXQoJ2RpZC1zdG9wLWNoYW5naW5nJylcblxuICAgICAgd2FpdHNGb3IgLT4gY29sb3JCdWZmZXIuc2NhbkJ1ZmZlckZvclZhcmlhYmxlcy5jYWxsQ291bnQgPiAwXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJyAnKVxuXG4gICAgaXQgJ3Rlcm1pbmF0ZXMgdGhlIGN1cnJlbnRseSBydW5uaW5nIHRhc2snLCAtPlxuICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLnRlcm1pbmF0ZVJ1bm5pbmdUYXNrKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSAnd2hlbiBjcmVhdGVkIHdpdGhvdXQgYSBwcmV2aW91cyBzdGF0ZScsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci5pbml0aWFsaXplKClcblxuICAgIGl0ICdzY2FucyB0aGUgYnVmZmVyIGZvciBjb2xvcnMgd2l0aG91dCB3YWl0aW5nIGZvciB0aGUgcHJvamVjdCB2YXJpYWJsZXMnLCAtPlxuICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCg0KVxuICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldFZhbGlkQ29sb3JNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDMpXG5cbiAgICBpdCAnY3JlYXRlcyB0aGUgY29ycmVzcG9uZGluZyBtYXJrZXJzIGluIHRoZSB0ZXh0IGVkaXRvcicsIC0+XG4gICAgICBleHBlY3QoY29sb3JCdWZmZXIuZ2V0TWFya2VyTGF5ZXIoKS5maW5kTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCg0KVxuXG4gICAgaXQgJ2tub3dzIHRoYXQgaXQgaXMgbGVnaWJsZSBhcyBhIHZhcmlhYmxlcyBzb3VyY2UgZmlsZScsIC0+XG4gICAgICBleHBlY3QoY29sb3JCdWZmZXIuaXNWYXJpYWJsZXNTb3VyY2UoKSkudG9CZVRydXRoeSgpXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgZWRpdG9yIGlzIGRlc3Ryb3llZCcsIC0+XG4gICAgICBpdCAnZGVzdHJveXMgdGhlIGNvbG9yIGJ1ZmZlciBhdCB0aGUgc2FtZSB0aW1lJywgLT5cbiAgICAgICAgZWRpdG9yLmRlc3Ryb3koKVxuXG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmNvbG9yQnVmZmVyc0J5RWRpdG9ySWRbZWRpdG9yLmlkXSkudG9CZVVuZGVmaW5lZCgpXG5cbiAgICBkZXNjcmliZSAnOjpnZXRDb2xvck1hcmtlckF0QnVmZmVyUG9zaXRpb24nLCAtPlxuICAgICAgZGVzY3JpYmUgJ3doZW4gdGhlIGJ1ZmZlciBwb3NpdGlvbiBpcyBjb250YWluZWQgaW4gYSBtYXJrZXIgcmFuZ2UnLCAtPlxuICAgICAgICBpdCAncmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyBjb2xvciBtYXJrZXInLCAtPlxuICAgICAgICAgIGNvbG9yTWFya2VyID0gY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJBdEJ1ZmZlclBvc2l0aW9uKFsyLCAxNV0pXG4gICAgICAgICAgZXhwZWN0KGNvbG9yTWFya2VyKS50b0VxdWFsKGNvbG9yQnVmZmVyLmNvbG9yTWFya2Vyc1sxXSlcblxuICAgICAgZGVzY3JpYmUgJ3doZW4gdGhlIGJ1ZmZlciBwb3NpdGlvbiBpcyBub3QgY29udGFpbmVkIGluIGEgbWFya2VyIHJhbmdlJywgLT5cbiAgICAgICAgaXQgJ3JldHVybnMgdW5kZWZpbmVkJywgLT5cbiAgICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJBdEJ1ZmZlclBvc2l0aW9uKFsxLCAxNV0pKS50b0JlVW5kZWZpbmVkKClcblxuICAgICMjICAgICMjICAgICAjIyAgICAjIyMgICAgIyMjIyMjIyMgICAjIyMjIyNcbiAgICAjIyAgICAjIyAgICAgIyMgICAjIyAjIyAgICMjICAgICAjIyAjIyAgICAjI1xuICAgICMjICAgICMjICAgICAjIyAgIyMgICAjIyAgIyMgICAgICMjICMjXG4gICAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAjIyMjIyMjIyAgICMjIyMjI1xuICAgICMjICAgICAjIyAgICMjICAjIyMjIyMjIyMgIyMgICAjIyAgICAgICAgICMjXG4gICAgIyMgICAgICAjIyAjIyAgICMjICAgICAjIyAjIyAgICAjIyAgIyMgICAgIyNcbiAgICAjIyAgICAgICAjIyMgICAgIyMgICAgICMjICMjICAgICAjIyAgIyMjIyMjXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgcHJvamVjdCB2YXJpYWJsZXMgYmVjb21lcyBhdmFpbGFibGUnLCAtPlxuICAgICAgW3VwZGF0ZVNweV0gPSBbXVxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB1cGRhdGVTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLXVwZGF0ZS1jb2xvci1tYXJrZXJzJylcbiAgICAgICAgY29sb3JCdWZmZXIub25EaWRVcGRhdGVDb2xvck1hcmtlcnModXBkYXRlU3B5KVxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcblxuICAgICAgaXQgJ3JlcGxhY2VzIHRoZSBpbnZhbGlkIG1hcmtlcnMgdGhhdCBhcmUgbm93IHZhbGlkJywgLT5cbiAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldFZhbGlkQ29sb3JNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDQpXG4gICAgICAgIGV4cGVjdCh1cGRhdGVTcHkuYXJnc0ZvckNhbGxbMF1bMF0uY3JlYXRlZC5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICAgICAgZXhwZWN0KHVwZGF0ZVNweS5hcmdzRm9yQ2FsbFswXVswXS5kZXN0cm95ZWQubGVuZ3RoKS50b0VxdWFsKDEpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIGEgdmFyaWFibGUgaXMgZWRpdGVkJywgLT5cbiAgICAgICAgW2NvbG9yc1VwZGF0ZVNweV0gPSBbXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgY29sb3JzVXBkYXRlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycycpXG4gICAgICAgICAgY29sb3JCdWZmZXIub25EaWRVcGRhdGVDb2xvck1hcmtlcnMoY29sb3JzVXBkYXRlU3B5KVxuICAgICAgICAgIGVkaXRCdWZmZXIgJyMzMzY2OTknLCBzdGFydDogWzAsMTNdLCBlbmQ6IFswLDE3XVxuXG4gICAgICAgIGl0ICd1cGRhdGVzIHRoZSBtb2RpZmllZCBjb2xvcnMnLCAtPlxuICAgICAgICAgIHdhaXRzRm9yIC0+IGNvbG9yc1VwZGF0ZVNweS5jYWxsQ291bnQgPiAwXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KGNvbG9yc1VwZGF0ZVNweS5hcmdzRm9yQ2FsbFswXVswXS5kZXN0cm95ZWQubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICAgICAgICBleHBlY3QoY29sb3JzVXBkYXRlU3B5LmFyZ3NGb3JDYWxsWzBdWzBdLmNyZWF0ZWQubGVuZ3RoKS50b0VxdWFsKDIpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIGEgbmV3IHZhcmlhYmxlIGlzIGFkZGVkJywgLT5cbiAgICAgICAgW2NvbG9yc1VwZGF0ZVNweV0gPSBbXVxuXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcblxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIHVwZGF0ZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtdXBkYXRlLWNvbG9yLW1hcmtlcnMnKVxuICAgICAgICAgICAgY29sb3JCdWZmZXIub25EaWRVcGRhdGVDb2xvck1hcmtlcnModXBkYXRlU3B5KVxuICAgICAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgICAgICBlZGl0QnVmZmVyICdcXG5mb28gPSBiYXNlLWNvbG9yJ1xuICAgICAgICAgICAgd2FpdHNGb3IgLT4gdXBkYXRlU3B5LmNhbGxDb3VudCA+IDBcblxuICAgICAgICBpdCAnZGlzcGF0Y2hlcyB0aGUgbmV3IG1hcmtlciBpbiBhIGRpZC11cGRhdGUtY29sb3ItbWFya2VycyBldmVudCcsIC0+XG4gICAgICAgICAgZXhwZWN0KHVwZGF0ZVNweS5hcmdzRm9yQ2FsbFswXVswXS5kZXN0cm95ZWQubGVuZ3RoKS50b0VxdWFsKDApXG4gICAgICAgICAgZXhwZWN0KHVwZGF0ZVNweS5hcmdzRm9yQ2FsbFswXVswXS5jcmVhdGVkLmxlbmd0aCkudG9FcXVhbCgxKVxuXG4gICAgICBkZXNjcmliZSAnd2hlbiBhIHZhcmlhYmxlIGlzIHJlbW92ZWQnLCAtPlxuICAgICAgICBbY29sb3JzVXBkYXRlU3B5XSA9IFtdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBjb2xvcnNVcGRhdGVTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLXVwZGF0ZS1jb2xvci1tYXJrZXJzJylcbiAgICAgICAgICBjb2xvckJ1ZmZlci5vbkRpZFVwZGF0ZUNvbG9yTWFya2Vycyhjb2xvcnNVcGRhdGVTcHkpXG4gICAgICAgICAgZWRpdEJ1ZmZlciAnJywgc3RhcnQ6IFswLDBdLCBlbmQ6IFswLDE3XVxuICAgICAgICAgIHdhaXRzRm9yIC0+IGNvbG9yc1VwZGF0ZVNweS5jYWxsQ291bnQgPiAwXG5cbiAgICAgICAgaXQgJ2ludmFsaWRhdGVzIGNvbG9ycyB0aGF0IHdlcmUgcmVseWluZyBvbiB0aGUgZGVsZXRlZCB2YXJpYWJsZXMnLCAtPlxuICAgICAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5nZXRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoMylcbiAgICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIuZ2V0VmFsaWRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoMilcblxuICAgICAgZGVzY3JpYmUgJzo6c2VyaWFsaXplJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci52YXJpYWJsZXNBdmFpbGFibGUoKVxuXG4gICAgICAgIGl0ICdyZXR1cm5zIHRoZSB3aG9sZSBidWZmZXIgZGF0YScsIC0+XG4gICAgICAgICAgZXhwZWN0ZWQgPSBqc29uRml4dHVyZSBcImZvdXItdmFyaWFibGVzLWJ1ZmZlci5qc29uXCIsIHtcbiAgICAgICAgICAgIGlkOiBlZGl0b3IuaWRcbiAgICAgICAgICAgIHJvb3Q6IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICAgICAgICBjb2xvck1hcmtlcnM6IGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLm1hcCAobSkgLT4gbS5tYXJrZXIuaWRcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIuc2VyaWFsaXplKCkpLnRvRXF1YWwoZXhwZWN0ZWQpXG5cbiAgICAjIyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgICAgICMjIyMjIyMgICMjIyMjIyMjICAgIyMjIyMjXG4gICAgIyMgICAgIyMgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgIyNcbiAgICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgICAjIyAjI1xuICAgICMjICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMjIyMjIyMgICAjIyMjIyNcbiAgICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgIyMgICAgICAgICAjI1xuICAgICMjICAgICMjICAgICMjICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgIyMgICMjICAgICMjXG4gICAgIyMgICAgICMjIyMjIyAgICMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjICAjIyAgICAgIyMgICMjIyMjI1xuXG4gICAgZGVzY3JpYmUgJ3dpdGggYSBidWZmZXIgd2l0aCBvbmx5IGNvbG9ycycsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ2J1dHRvbnMuc3R5bCcpLnRoZW4gKG8pIC0+IGVkaXRvciA9IG9cblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcblxuICAgICAgaXQgJ2NyZWF0ZXMgdGhlIGNvbG9yIG1hcmtlcnMgZm9yIHRoZSB2YXJpYWJsZXMgdXNlZCBpbiB0aGUgYnVmZmVyJywgLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG4gICAgICAgIHJ1bnMgLT4gZXhwZWN0KGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCgzKVxuXG4gICAgICBkZXNjcmliZSAnd2hlbiBhIGNvbG9yIG1hcmtlciBpcyBlZGl0ZWQnLCAtPlxuICAgICAgICBbY29sb3JzVXBkYXRlU3B5XSA9IFtdXG5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci52YXJpYWJsZXNBdmFpbGFibGUoKVxuXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgY29sb3JzVXBkYXRlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycycpXG4gICAgICAgICAgICBjb2xvckJ1ZmZlci5vbkRpZFVwZGF0ZUNvbG9yTWFya2Vycyhjb2xvcnNVcGRhdGVTcHkpXG4gICAgICAgICAgICBlZGl0QnVmZmVyICcjMzM2Njk5Jywgc3RhcnQ6IFsxLDEzXSwgZW5kOiBbMSwyM11cbiAgICAgICAgICAgIHdhaXRzRm9yIC0+IGNvbG9yc1VwZGF0ZVNweS5jYWxsQ291bnQgPiAwXG5cbiAgICAgICAgaXQgJ3VwZGF0ZXMgdGhlIG1vZGlmaWVkIGNvbG9yIG1hcmtlcicsIC0+XG4gICAgICAgICAgbWFya2VycyA9IGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpXG4gICAgICAgICAgbWFya2VyID0gbWFya2Vyc1ttYXJrZXJzLmxlbmd0aC0xXVxuICAgICAgICAgIGV4cGVjdChtYXJrZXIuY29sb3IpLnRvQmVDb2xvcignIzMzNjY5OScpXG5cbiAgICAgICAgaXQgJ3VwZGF0ZXMgb25seSB0aGUgYWZmZWN0ZWQgbWFya2VyJywgLT5cbiAgICAgICAgICBleHBlY3QoY29sb3JzVXBkYXRlU3B5LmFyZ3NGb3JDYWxsWzBdWzBdLmRlc3Ryb3llZC5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICAgICAgICBleHBlY3QoY29sb3JzVXBkYXRlU3B5LmFyZ3NGb3JDYWxsWzBdWzBdLmNyZWF0ZWQubGVuZ3RoKS50b0VxdWFsKDEpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIG5ldyBsaW5lcyBjaGFuZ2VzIHRoZSBtYXJrZXJzIHJhbmdlJywgLT5cbiAgICAgICAgW2NvbG9yc1VwZGF0ZVNweV0gPSBbXVxuXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcblxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGNvbG9yc1VwZGF0ZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtdXBkYXRlLWNvbG9yLW1hcmtlcnMnKVxuICAgICAgICAgICAgY29sb3JCdWZmZXIub25EaWRVcGRhdGVDb2xvck1hcmtlcnMoY29sb3JzVXBkYXRlU3B5KVxuICAgICAgICAgICAgZWRpdEJ1ZmZlciAnI2ZmZlxcblxcbicsIHN0YXJ0OiBbMCwwXSwgZW5kOiBbMCwwXVxuICAgICAgICAgICAgd2FpdHNGb3IgLT4gY29sb3JzVXBkYXRlU3B5LmNhbGxDb3VudCA+IDBcblxuICAgICAgICBpdCAnZG9lcyBub3QgZGVzdHJveXMgdGhlIHByZXZpb3VzIG1hcmtlcnMnLCAtPlxuICAgICAgICAgIGV4cGVjdChjb2xvcnNVcGRhdGVTcHkuYXJnc0ZvckNhbGxbMF1bMF0uZGVzdHJveWVkLmxlbmd0aCkudG9FcXVhbCgwKVxuICAgICAgICAgIGV4cGVjdChjb2xvcnNVcGRhdGVTcHkuYXJnc0ZvckNhbGxbMF1bMF0uY3JlYXRlZC5sZW5ndGgpLnRvRXF1YWwoMSlcblxuICAgICAgZGVzY3JpYmUgJ3doZW4gYSBuZXcgY29sb3IgaXMgYWRkZWQnLCAtPlxuICAgICAgICBbY29sb3JzVXBkYXRlU3B5XSA9IFtdXG5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci52YXJpYWJsZXNBdmFpbGFibGUoKVxuXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgY29sb3JzVXBkYXRlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycycpXG4gICAgICAgICAgICBjb2xvckJ1ZmZlci5vbkRpZFVwZGF0ZUNvbG9yTWFya2Vycyhjb2xvcnNVcGRhdGVTcHkpXG4gICAgICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgICAgIGVkaXRCdWZmZXIgJ1xcbiMzMzY2OTknXG4gICAgICAgICAgICB3YWl0c0ZvciAtPiBjb2xvcnNVcGRhdGVTcHkuY2FsbENvdW50ID4gMFxuXG4gICAgICAgIGl0ICdhZGRzIGEgbWFya2VyIGZvciB0aGUgbmV3IGNvbG9yJywgLT5cbiAgICAgICAgICBtYXJrZXJzID0gY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKClcbiAgICAgICAgICBtYXJrZXIgPSBtYXJrZXJzW21hcmtlcnMubGVuZ3RoLTFdXG4gICAgICAgICAgZXhwZWN0KG1hcmtlcnMubGVuZ3RoKS50b0VxdWFsKDQpXG4gICAgICAgICAgZXhwZWN0KG1hcmtlci5jb2xvcikudG9CZUNvbG9yKCcjMzM2Njk5JylcbiAgICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIuZ2V0TWFya2VyTGF5ZXIoKS5maW5kTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCg0KVxuXG4gICAgICAgIGl0ICdkaXNwYXRjaGVzIHRoZSBuZXcgbWFya2VyIGluIGEgZGlkLXVwZGF0ZS1jb2xvci1tYXJrZXJzIGV2ZW50JywgLT5cbiAgICAgICAgICBleHBlY3QoY29sb3JzVXBkYXRlU3B5LmFyZ3NGb3JDYWxsWzBdWzBdLmRlc3Ryb3llZC5sZW5ndGgpLnRvRXF1YWwoMClcbiAgICAgICAgICBleHBlY3QoY29sb3JzVXBkYXRlU3B5LmFyZ3NGb3JDYWxsWzBdWzBdLmNyZWF0ZWQubGVuZ3RoKS50b0VxdWFsKDEpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIGEgY29sb3IgbWFya2VyIGlzIGVkaXRlZCcsIC0+XG4gICAgICAgIFtjb2xvcnNVcGRhdGVTcHldID0gW11cblxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBjb2xvcnNVcGRhdGVTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLXVwZGF0ZS1jb2xvci1tYXJrZXJzJylcbiAgICAgICAgICAgIGNvbG9yQnVmZmVyLm9uRGlkVXBkYXRlQ29sb3JNYXJrZXJzKGNvbG9yc1VwZGF0ZVNweSlcbiAgICAgICAgICAgIGVkaXRCdWZmZXIgJycsIHN0YXJ0OiBbMSwyXSwgZW5kOiBbMSwyM11cbiAgICAgICAgICAgIHdhaXRzRm9yIC0+IGNvbG9yc1VwZGF0ZVNweS5jYWxsQ291bnQgPiAwXG5cbiAgICAgICAgaXQgJ3VwZGF0ZXMgdGhlIG1vZGlmaWVkIGNvbG9yIG1hcmtlcicsIC0+XG4gICAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCgyKVxuXG4gICAgICAgIGl0ICd1cGRhdGVzIG9ubHkgdGhlIGFmZmVjdGVkIG1hcmtlcicsIC0+XG4gICAgICAgICAgZXhwZWN0KGNvbG9yc1VwZGF0ZVNweS5hcmdzRm9yQ2FsbFswXVswXS5kZXN0cm95ZWQubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICAgICAgZXhwZWN0KGNvbG9yc1VwZGF0ZVNweS5hcmdzRm9yQ2FsbFswXVswXS5jcmVhdGVkLmxlbmd0aCkudG9FcXVhbCgwKVxuXG4gICAgICAgIGl0ICdyZW1vdmVzIHRoZSBwcmV2aW91cyBlZGl0b3IgbWFya2VycycsIC0+XG4gICAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldE1hcmtlckxheWVyKCkuZmluZE1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoMilcblxuICAgIGRlc2NyaWJlICd3aXRoIGEgYnVmZmVyIHdob3NlIHNjb3BlIGlzIG5vdCBvbmUgb2Ygc291cmNlIGZpbGVzJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigncHJvamVjdC9saWIvbWFpbi5jb2ZmZWUnKS50aGVuIChvKSAtPiBlZGl0b3IgPSBvXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGNvbG9yQnVmZmVyID0gcHJvamVjdC5jb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG5cbiAgICAgIGl0ICdkb2VzIG5vdCByZW5kZXJzIGNvbG9ycyBmcm9tIHZhcmlhYmxlcycsIC0+XG4gICAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5nZXRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoNClcblxuXG4gICAgZGVzY3JpYmUgJ3dpdGggYSBidWZmZXIgaW4gY3JsZiBtb2RlJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbignY3JsZi5zdHlsJykudGhlbiAobykgLT5cbiAgICAgICAgICAgIGVkaXRvciA9IG9cblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcblxuICAgICAgaXQgJ2NyZWF0ZXMgYSBtYXJrZXIgZm9yIGVhY2ggY29sb3JzJywgLT5cbiAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldFZhbGlkQ29sb3JNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDIpXG5cbiAgIyMgICAgIyMjIyAgIyMjIyMjICAgIyMgICAgIyMgICMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjIyAjIyMjIyMjI1xuICAjIyAgICAgIyMgICMjICAgICMjICAjIyMgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjICAgICAjI1xuICAjIyAgICAgIyMgICMjICAgICAgICAjIyMjICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjICAgICAjI1xuICAjIyAgICAgIyMgICMjICAgIyMjIyAjIyAjIyAjIyAjIyAgICAgIyMgIyMjIyMjIyMgICMjIyMjIyAgICMjICAgICAjI1xuICAjIyAgICAgIyMgICMjICAgICMjICAjIyAgIyMjIyAjIyAgICAgIyMgIyMgICAjIyAgICMjICAgICAgICMjICAgICAjI1xuICAjIyAgICAgIyMgICMjICAgICMjICAjIyAgICMjIyAjIyAgICAgIyMgIyMgICAgIyMgICMjICAgICAgICMjICAgICAjI1xuICAjIyAgICAjIyMjICAjIyMjIyMgICAjIyAgICAjIyAgIyMjIyMjIyAgIyMgICAgICMjICMjIyMjIyMjICMjIyMjIyMjXG5cbiAgZGVzY3JpYmUgJ3dpdGggYSBidWZmZXIgcGFydCBvZiB0aGUgZ2xvYmFsIGlnbm9yZWQgZmlsZXMnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHByb2plY3Quc2V0SWdub3JlZE5hbWVzKFtdKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5pZ25vcmVkTmFtZXMnLCBbJ3Byb2plY3QvdmVuZG9yLyonXSlcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ3Byb2plY3QvdmVuZG9yL2Nzcy92YXJpYWJsZXMubGVzcycpLnRoZW4gKG8pIC0+IGVkaXRvciA9IG9cblxuICAgICAgcnVucyAtPlxuICAgICAgICBjb2xvckJ1ZmZlciA9IHByb2plY3QuY29sb3JCdWZmZXJGb3JFZGl0b3IoZWRpdG9yKVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcblxuICAgIGl0ICdrbm93cyB0aGF0IGl0IGlzIHBhcnQgb2YgdGhlIGlnbm9yZWQgZmlsZXMnLCAtPlxuICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmlzSWdub3JlZCgpKS50b0JlVHJ1dGh5KClcblxuICAgIGl0ICdrbm93cyB0aGF0IGl0IGlzIGEgdmFyaWFibGVzIHNvdXJjZSBmaWxlJywgLT5cbiAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5pc1ZhcmlhYmxlc1NvdXJjZSgpKS50b0JlVHJ1dGh5KClcblxuICAgIGl0ICdzY2FucyB0aGUgYnVmZmVyIGZvciB2YXJpYWJsZXMgZm9yIGluLWJ1ZmZlciB1c2Ugb25seScsIC0+XG4gICAgICBleHBlY3QoY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDIwKVxuICAgICAgdmFsaWRNYXJrZXJzID0gY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKCkuZmlsdGVyIChtKSAtPlxuICAgICAgICBtLmNvbG9yLmlzVmFsaWQoKVxuXG4gICAgICBleHBlY3QodmFsaWRNYXJrZXJzLmxlbmd0aCkudG9FcXVhbCgyMClcblxuICBkZXNjcmliZSAnd2l0aCBhIGJ1ZmZlciBwYXJ0IG9mIHRoZSBwcm9qZWN0IGlnbm9yZWQgZmlsZXMnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdwcm9qZWN0L3ZlbmRvci9jc3MvdmFyaWFibGVzLmxlc3MnKS50aGVuIChvKSAtPiBlZGl0b3IgPSBvXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG5cbiAgICBpdCAna25vd3MgdGhhdCBpdCBpcyBwYXJ0IG9mIHRoZSBpZ25vcmVkIGZpbGVzJywgLT5cbiAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5pc0lnbm9yZWQoKSkudG9CZVRydXRoeSgpXG5cbiAgICBpdCAna25vd3MgdGhhdCBpdCBpcyBhIHZhcmlhYmxlcyBzb3VyY2UgZmlsZScsIC0+XG4gICAgICBleHBlY3QoY29sb3JCdWZmZXIuaXNWYXJpYWJsZXNTb3VyY2UoKSkudG9CZVRydXRoeSgpXG5cbiAgICBpdCAnc2NhbnMgdGhlIGJ1ZmZlciBmb3IgdmFyaWFibGVzIGZvciBpbi1idWZmZXIgdXNlIG9ubHknLCAtPlxuICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCgyMClcbiAgICAgIHZhbGlkTWFya2VycyA9IGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmZpbHRlciAobSkgLT5cbiAgICAgICAgbS5jb2xvci5pc1ZhbGlkKClcblxuICAgICAgZXhwZWN0KHZhbGlkTWFya2Vycy5sZW5ndGgpLnRvRXF1YWwoMjApXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgYnVmZmVyIGlzIGVkaXRlZCcsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGNvbG9yc1VwZGF0ZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtdXBkYXRlLWNvbG9yLW1hcmtlcnMnKVxuICAgICAgICBjb2xvckJ1ZmZlci5vbkRpZFVwZGF0ZUNvbG9yTWFya2Vycyhjb2xvcnNVcGRhdGVTcHkpXG4gICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICBlZGl0QnVmZmVyICdcXG5cXG5AbmV3LWNvbG9yOiBAYmFzZTA7XFxuJ1xuICAgICAgICB3YWl0c0ZvciAtPiBjb2xvcnNVcGRhdGVTcHkuY2FsbENvdW50ID4gMFxuXG4gICAgICBpdCAnZmluZHMgdGhlIG5ld2x5IGFkZGVkIGNvbG9yJywgLT5cbiAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCgyMSlcbiAgICAgICAgdmFsaWRNYXJrZXJzID0gY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKCkuZmlsdGVyIChtKSAtPlxuICAgICAgICAgIG0uY29sb3IuaXNWYWxpZCgpXG5cbiAgICAgICAgZXhwZWN0KHZhbGlkTWFya2Vycy5sZW5ndGgpLnRvRXF1YWwoMjEpXG5cbiAgIyMgICAgIyMgICAgIyMgICMjIyMjIyMgICMjICAgICAjIyAgICAjIyMgICAgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgIyMjICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgICMjICMjICAgIyMgICAgICMjICMjICAgICMjXG4gICMjICAgICMjIyMgICMjICMjICAgICAjIyAjIyAgICAgIyMgICMjICAgIyMgICMjICAgICAjIyAjI1xuICAjIyAgICAjIyAjIyAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyMjIyMjIyAgICMjIyMjI1xuICAjIyAgICAjIyAgIyMjIyAjIyAgICAgIyMgICMjICAgIyMgICMjIyMjIyMjIyAjIyAgICMjICAgICAgICAgIyNcbiAgIyMgICAgIyMgICAjIyMgIyMgICAgICMjICAgIyMgIyMgICAjIyAgICAgIyMgIyMgICAgIyMgICMjICAgICMjXG4gICMjICAgICMjICAgICMjICAjIyMjIyMjICAgICAjIyMgICAgIyMgICAgICMjICMjICAgICAjIyAgIyMjIyMjXG5cbiAgZGVzY3JpYmUgJ3dpdGggYSBidWZmZXIgbm90IGJlaW5nIGEgdmFyaWFibGUgc291cmNlJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigncHJvamVjdC9saWIvbWFpbi5jb2ZmZWUnKS50aGVuIChvKSAtPiBlZGl0b3IgPSBvXG5cbiAgICAgIHJ1bnMgLT4gY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG5cbiAgICBpdCAna25vd3MgdGhhdCBpdCBpcyBub3QgcGFydCBvZiB0aGUgc291cmNlIGZpbGVzJywgLT5cbiAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5pc1ZhcmlhYmxlc1NvdXJjZSgpKS50b0JlRmFsc3koKVxuXG4gICAgaXQgJ2tub3dzIHRoYXQgaXQgaXMgbm90IHBhcnQgb2YgdGhlIGlnbm9yZWQgZmlsZXMnLCAtPlxuICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmlzSWdub3JlZCgpKS50b0JlRmFsc3koKVxuXG4gICAgaXQgJ3NjYW5zIHRoZSBidWZmZXIgZm9yIHZhcmlhYmxlcyBmb3IgaW4tYnVmZmVyIHVzZSBvbmx5JywgLT5cbiAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5nZXRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoNClcbiAgICAgIHZhbGlkTWFya2VycyA9IGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmZpbHRlciAobSkgLT5cbiAgICAgICAgbS5jb2xvci5pc1ZhbGlkKClcblxuICAgICAgZXhwZWN0KHZhbGlkTWFya2Vycy5sZW5ndGgpLnRvRXF1YWwoNClcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZSBidWZmZXIgaXMgZWRpdGVkJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgY29sb3JzVXBkYXRlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycycpXG4gICAgICAgIHNweU9uKHByb2plY3QsICdyZWxvYWRWYXJpYWJsZXNGb3JQYXRoJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBjb2xvckJ1ZmZlci5vbkRpZFVwZGF0ZUNvbG9yTWFya2Vycyhjb2xvcnNVcGRhdGVTcHkpXG4gICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICBlZGl0QnVmZmVyICdcXG5cXG5AbmV3LWNvbG9yID0gcmVkO1xcbidcbiAgICAgICAgd2FpdHNGb3IgLT4gY29sb3JzVXBkYXRlU3B5LmNhbGxDb3VudCA+IDBcblxuICAgICAgaXQgJ2ZpbmRzIHRoZSBuZXdseSBhZGRlZCBjb2xvcicsIC0+XG4gICAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5nZXRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoNSlcbiAgICAgICAgdmFsaWRNYXJrZXJzID0gY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKCkuZmlsdGVyIChtKSAtPlxuICAgICAgICAgIG0uY29sb3IuaXNWYWxpZCgpXG5cbiAgICAgICAgZXhwZWN0KHZhbGlkTWFya2Vycy5sZW5ndGgpLnRvRXF1YWwoNSlcblxuICAgICAgaXQgJ2RvZXMgbm90IGFzayB0aGUgcHJvamVjdCB0byByZWxvYWQgdGhlIHZhcmlhYmxlcycsIC0+XG4gICAgICAgIGlmIHBhcnNlRmxvYXQoYXRvbS5nZXRWZXJzaW9uKCkpID49IDEuMTlcbiAgICAgICAgICBleHBlY3QocHJvamVjdC5yZWxvYWRWYXJpYWJsZXNGb3JQYXRoKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBleHBlY3QocHJvamVjdC5yZWxvYWRWYXJpYWJsZXNGb3JQYXRoLm1vc3RSZWNlbnRDYWxsLmFyZ3NbMF0pLm5vdC50b0VxdWFsKGNvbG9yQnVmZmVyLmVkaXRvci5nZXRQYXRoKCkpXG5cbiAgIyMgICAgIyMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjICAjIyMjIyMjIyAgIyMjIyMjIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICMjICAgICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAgICAgICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyNcbiAgIyMgICAgIyMjIyMjIyMgICMjIyMjIyAgICAjIyMjIyMgICAgICMjICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMjXG4gICMjICAgICMjICAgIyMgICAjIyAgICAgICAgICAgICAjIyAgICAjIyAgICAjIyAgICAgIyMgIyMgICAjIyAgICMjXG4gICMjICAgICMjICAgICMjICAjIyAgICAgICAjIyAgICAjIyAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgIyMgICMjXG4gICMjICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMjICAgICAjIyAgICAgIyMjIyMjIyAgIyMgICAgICMjICMjIyMjIyMjXG5cbiAgZGVzY3JpYmUgJ3doZW4gY3JlYXRlZCB3aXRoIGEgcHJldmlvdXMgc3RhdGUnLCAtPlxuICAgIGRlc2NyaWJlICd3aXRoIHZhcmlhYmxlcyBhbmQgY29sb3JzJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IHByb2plY3QuaW5pdGlhbGl6ZSgpXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcikuZGVzdHJveSgpXG5cbiAgICAgICAgICBzdGF0ZSA9IGpzb25GaXh0dXJlKCdmb3VyLXZhcmlhYmxlcy1idWZmZXIuanNvbicsIHtcbiAgICAgICAgICAgIGlkOiBlZGl0b3IuaWRcbiAgICAgICAgICAgIHJvb3Q6IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICAgICAgICBjb2xvck1hcmtlcnM6IFstMS4uLTRdXG4gICAgICAgICAgfSlcbiAgICAgICAgICBzdGF0ZS5lZGl0b3IgPSBlZGl0b3JcbiAgICAgICAgICBzdGF0ZS5wcm9qZWN0ID0gcHJvamVjdFxuICAgICAgICAgIGNvbG9yQnVmZmVyID0gbmV3IENvbG9yQnVmZmVyKHN0YXRlKVxuXG4gICAgICBpdCAnY3JlYXRlcyBtYXJrZXJzIGZyb20gdGhlIHN0YXRlIG9iamVjdCcsIC0+XG4gICAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5nZXRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoNClcblxuICAgICAgaXQgJ3Jlc3RvcmVzIHRoZSBtYXJrZXJzIHByb3BlcnRpZXMnLCAtPlxuICAgICAgICBjb2xvck1hcmtlciA9IGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpWzNdXG4gICAgICAgIGV4cGVjdChjb2xvck1hcmtlci5jb2xvcikudG9CZUNvbG9yKDI1NSwyNTUsMjU1LDAuNSlcbiAgICAgICAgZXhwZWN0KGNvbG9yTWFya2VyLmNvbG9yLnZhcmlhYmxlcykudG9FcXVhbChbJ2Jhc2UtY29sb3InXSlcblxuICAgICAgaXQgJ3Jlc3RvcmVzIHRoZSBlZGl0b3IgbWFya2VycycsIC0+XG4gICAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5nZXRNYXJrZXJMYXllcigpLmZpbmRNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDQpXG5cbiAgICAgIGl0ICdyZXN0b3JlcyB0aGUgYWJpbGl0eSB0byBmZXRjaCBtYXJrZXJzJywgLT5cbiAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmZpbmRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoNClcblxuICAgICAgICBmb3IgbWFya2VyIGluIGNvbG9yQnVmZmVyLmZpbmRDb2xvck1hcmtlcnMoKVxuICAgICAgICAgIGV4cGVjdChtYXJrZXIpLnRvQmVEZWZpbmVkKClcblxuICAgIGRlc2NyaWJlICd3aXRoIGFuIGludmFsaWQgY29sb3InLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdpbnZhbGlkLWNvbG9yLnN0eWwnKS50aGVuIChvKSAtPlxuICAgICAgICAgICAgZWRpdG9yID0gb1xuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBwcm9qZWN0LmluaXRpYWxpemUoKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBzdGF0ZSA9IGpzb25GaXh0dXJlKCdpbnZhbGlkLWNvbG9yLWJ1ZmZlci5qc29uJywge1xuICAgICAgICAgICAgaWQ6IGVkaXRvci5pZFxuICAgICAgICAgICAgcm9vdDogYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgICAgICAgIGNvbG9yTWFya2VyczogWy0xXVxuICAgICAgICAgIH0pXG4gICAgICAgICAgc3RhdGUuZWRpdG9yID0gZWRpdG9yXG4gICAgICAgICAgc3RhdGUucHJvamVjdCA9IHByb2plY3RcbiAgICAgICAgICBjb2xvckJ1ZmZlciA9IG5ldyBDb2xvckJ1ZmZlcihzdGF0ZSlcblxuICAgICAgaXQgJ2NyZWF0ZXMgbWFya2VycyBmcm9tIHRoZSBzdGF0ZSBvYmplY3QnLCAtPlxuICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5nZXRWYWxpZENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCgwKVxuIl19
