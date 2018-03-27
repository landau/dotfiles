(function() {
  var ColorBuffer, jsonFixture, path, registry,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require('path');

  ColorBuffer = require('../lib/color-buffer');

  registry = require('../lib/color-expressions');

  jsonFixture = require('./helpers/fixtures').jsonFixture(__dirname, 'fixtures');

  describe('ColorBuffer', function() {
    var colorBuffer, editBuffer, editor, pigments, project, sleep, _ref;
    _ref = [], editor = _ref[0], colorBuffer = _ref[1], pigments = _ref[2], project = _ref[3];
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
      atom.config.set('pigments.extendedFiletypesForColorWords', ['*']);
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
            return expect(__indexOf.call(project.getPaths(), 'new-path.styl') >= 0).toBeTruthy();
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
            return expect(__indexOf.call(project.getPaths(), 'new-path.styl') >= 0).toBeFalsy();
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
            return expect(__indexOf.call(project.getPaths(), 'new-path.styl') >= 0).toBeFalsy();
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
        return expect(colorBuffer.getMarkerLayer().findMarkers({
          type: 'pigments-color'
        }).length).toEqual(4);
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
        it('destroys the text editor markers', function() {
          return expect(colorBuffer.getMarkerLayer().findMarkers({
            type: 'pigments-color'
          }).length).toEqual(4);
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
            return colorBuffer.initialize();
          });
          return runs(function() {
            return expect(colorBuffer.getColorMarkers().length).toEqual(0);
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
          it('updates only the affected marker', function() {
            expect(colorsUpdateSpy.argsForCall[0][0].destroyed.length).toEqual(1);
            return expect(colorsUpdateSpy.argsForCall[0][0].created.length).toEqual(1);
          });
          return it('removes the previous editor markers', function() {
            return expect(colorBuffer.getMarkerLayer().findMarkers({
              type: 'pigments-color'
            }).length).toEqual(3);
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
            return expect(colorBuffer.getMarkerLayer().findMarkers({
              type: 'pigments-color'
            }).length).toEqual(4);
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
            return expect(colorBuffer.getMarkerLayer().findMarkers({
              type: 'pigments-color'
            }).length).toEqual(2);
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
          return expect(project.reloadVariablesForPath.mostRecentCall.args[0]).not.toEqual(colorBuffer.editor.getPath());
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
          return expect(colorBuffer.getMarkerLayer().findMarkers({
            type: 'pigments-color'
          }).length).toEqual(4);
        });
        return it('restores the ability to fetch markers', function() {
          var marker, _i, _len, _ref1, _results;
          expect(colorBuffer.findColorMarkers().length).toEqual(4);
          _ref1 = colorBuffer.findColorMarkers();
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            marker = _ref1[_i];
            _results.push(expect(marker).toBeDefined());
          }
          return _results;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9jb2xvci1idWZmZXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0NBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSLENBRGQsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsMEJBQVIsQ0FGWCxDQUFBOztBQUFBLEVBR0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxvQkFBUixDQUE2QixDQUFDLFdBQTlCLENBQTBDLFNBQTFDLEVBQXFELFVBQXJELENBSGQsQ0FBQTs7QUFBQSxFQU1BLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixRQUFBLCtEQUFBO0FBQUEsSUFBQSxPQUEyQyxFQUEzQyxFQUFDLGdCQUFELEVBQVMscUJBQVQsRUFBc0Isa0JBQXRCLEVBQWdDLGlCQUFoQyxDQUFBO0FBQUEsSUFFQSxLQUFBLEdBQVEsU0FBQyxFQUFELEdBQUE7QUFDTixVQUFBLEtBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxHQUFBLENBQUEsSUFBUixDQUFBO2FBQ0EsU0FBQSxHQUFBO2VBQUcsR0FBQSxDQUFBLElBQUEsR0FBVyxLQUFYLElBQW9CLEdBQXZCO01BQUEsRUFGTTtJQUFBLENBRlIsQ0FBQTtBQUFBLElBTUEsVUFBQSxHQUFhLFNBQUMsSUFBRCxFQUFPLE9BQVAsR0FBQTtBQUNYLFVBQUEsS0FBQTs7UUFEa0IsVUFBUTtPQUMxQjtBQUFBLE1BQUEsSUFBRyxxQkFBSDtBQUNFLFFBQUEsSUFBRyxtQkFBSDtBQUNFLFVBQUEsS0FBQSxHQUFRLENBQUMsT0FB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/spec/color-buffer-spec.coffee
