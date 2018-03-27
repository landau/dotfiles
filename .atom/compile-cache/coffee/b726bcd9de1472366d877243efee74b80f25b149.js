(function() {
  var ColorBuffer, ColorBufferElement, ColorMarker, ColorProject, ColorProjectElement, ColorResultsElement, ColorSearch, Disposable, Palette, PaletteElement, PigmentsAPI, PigmentsProvider, VariablesCollection, ref, uris, url;

  ref = [], Palette = ref[0], PaletteElement = ref[1], ColorSearch = ref[2], ColorResultsElement = ref[3], ColorProject = ref[4], ColorProjectElement = ref[5], ColorBuffer = ref[6], ColorBufferElement = ref[7], ColorMarker = ref[8], VariablesCollection = ref[9], PigmentsProvider = ref[10], PigmentsAPI = ref[11], Disposable = ref[12], url = ref[13], uris = ref[14];

  module.exports = {
    activate: function(state) {
      var convertMethod, copyMethod;
      if (ColorProject == null) {
        ColorProject = require('./color-project');
      }
      this.project = state.project != null ? ColorProject.deserialize(state.project) : new ColorProject();
      atom.commands.add('atom-workspace', {
        'pigments:find-colors': (function(_this) {
          return function() {
            return _this.findColors();
          };
        })(this),
        'pigments:show-palette': (function(_this) {
          return function() {
            return _this.showPalette();
          };
        })(this),
        'pigments:project-settings': (function(_this) {
          return function() {
            return _this.showSettings();
          };
        })(this),
        'pigments:reload': (function(_this) {
          return function() {
            return _this.reloadProjectVariables();
          };
        })(this),
        'pigments:report': (function(_this) {
          return function() {
            return _this.createPigmentsReport();
          };
        })(this)
      });
      convertMethod = (function(_this) {
        return function(action) {
          return function(event) {
            var colorBuffer, editor;
            if (_this.lastEvent != null) {
              action(_this.colorMarkerForMouseEvent(_this.lastEvent));
            } else {
              editor = atom.workspace.getActiveTextEditor();
              colorBuffer = _this.project.colorBufferForEditor(editor);
              editor.getCursors().forEach(function(cursor) {
                var marker;
                marker = colorBuffer.getColorMarkerAtBufferPosition(cursor.getBufferPosition());
                return action(marker);
              });
            }
            return _this.lastEvent = null;
          };
        };
      })(this);
      copyMethod = (function(_this) {
        return function(action) {
          return function(event) {
            var colorBuffer, cursor, editor, marker;
            if (_this.lastEvent != null) {
              action(_this.colorMarkerForMouseEvent(_this.lastEvent));
            } else {
              editor = atom.workspace.getActiveTextEditor();
              colorBuffer = _this.project.colorBufferForEditor(editor);
              cursor = editor.getLastCursor();
              marker = colorBuffer.getColorMarkerAtBufferPosition(cursor.getBufferPosition());
              action(marker);
            }
            return _this.lastEvent = null;
          };
        };
      })(this);
      atom.commands.add('atom-text-editor', {
        'pigments:convert-to-hex': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToHex();
          }
        }),
        'pigments:convert-to-rgb': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToRGB();
          }
        }),
        'pigments:convert-to-rgba': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToRGBA();
          }
        }),
        'pigments:convert-to-hsl': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToHSL();
          }
        }),
        'pigments:convert-to-hsla': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToHSLA();
          }
        }),
        'pigments:copy-as-hex': copyMethod(function(marker) {
          if (marker != null) {
            return marker.copyContentAsHex();
          }
        }),
        'pigments:copy-as-rgb': copyMethod(function(marker) {
          if (marker != null) {
            return marker.copyContentAsRGB();
          }
        }),
        'pigments:copy-as-rgba': copyMethod(function(marker) {
          if (marker != null) {
            return marker.copyContentAsRGBA();
          }
        }),
        'pigments:copy-as-hsl': copyMethod(function(marker) {
          if (marker != null) {
            return marker.copyContentAsHSL();
          }
        }),
        'pigments:copy-as-hsla': copyMethod(function(marker) {
          if (marker != null) {
            return marker.copyContentAsHSLA();
          }
        })
      });
      atom.workspace.addOpener((function(_this) {
        return function(uriToOpen) {
          var host, protocol, ref1;
          url || (url = require('url'));
          ref1 = url.parse(uriToOpen), protocol = ref1.protocol, host = ref1.host;
          if (protocol !== 'pigments:') {
            return;
          }
          switch (host) {
            case 'search':
              return _this.project.findAllColors();
            case 'palette':
              return _this.project.getPalette();
            case 'settings':
              return atom.views.getView(_this.project);
          }
        };
      })(this));
      return atom.contextMenu.add({
        'atom-text-editor': [
          {
            label: 'Pigments',
            submenu: [
              {
                label: 'Convert to hexadecimal',
                command: 'pigments:convert-to-hex'
              }, {
                label: 'Convert to RGB',
                command: 'pigments:convert-to-rgb'
              }, {
                label: 'Convert to RGBA',
                command: 'pigments:convert-to-rgba'
              }, {
                label: 'Convert to HSL',
                command: 'pigments:convert-to-hsl'
              }, {
                label: 'Convert to HSLA',
                command: 'pigments:convert-to-hsla'
              }, {
                type: 'separator'
              }, {
                label: 'Copy as hexadecimal',
                command: 'pigments:copy-as-hex'
              }, {
                label: 'Copy as RGB',
                command: 'pigments:copy-as-rgb'
              }, {
                label: 'Copy as RGBA',
                command: 'pigments:copy-as-rgba'
              }, {
                label: 'Copy as HSL',
                command: 'pigments:copy-as-hsl'
              }, {
                label: 'Copy as HSLA',
                command: 'pigments:copy-as-hsla'
              }
            ],
            shouldDisplay: (function(_this) {
              return function(event) {
                return _this.shouldDisplayContextMenu(event);
              };
            })(this)
          }
        ]
      });
    },
    deactivate: function() {
      var ref1;
      return (ref1 = this.getProject()) != null ? typeof ref1.destroy === "function" ? ref1.destroy() : void 0 : void 0;
    },
    provideAutocomplete: function() {
      if (PigmentsProvider == null) {
        PigmentsProvider = require('./pigments-provider');
      }
      return new PigmentsProvider(this);
    },
    provideAPI: function() {
      if (PigmentsAPI == null) {
        PigmentsAPI = require('./pigments-api');
      }
      return new PigmentsAPI(this.getProject());
    },
    consumeColorPicker: function(api) {
      if (Disposable == null) {
        Disposable = require('atom').Disposable;
      }
      this.getProject().setColorPickerAPI(api);
      return new Disposable((function(_this) {
        return function() {
          return _this.getProject().setColorPickerAPI(null);
        };
      })(this));
    },
    consumeColorExpressions: function(options) {
      var handle, name, names, priority, regexpString, registry, scopes;
      if (options == null) {
        options = {};
      }
      if (Disposable == null) {
        Disposable = require('atom').Disposable;
      }
      registry = this.getProject().getColorExpressionsRegistry();
      if (options.expressions != null) {
        names = options.expressions.map(function(e) {
          return e.name;
        });
        registry.createExpressions(options.expressions);
        return new Disposable(function() {
          var i, len, name, results;
          results = [];
          for (i = 0, len = names.length; i < len; i++) {
            name = names[i];
            results.push(registry.removeExpression(name));
          }
          return results;
        });
      } else {
        name = options.name, regexpString = options.regexpString, handle = options.handle, scopes = options.scopes, priority = options.priority;
        registry.createExpression(name, regexpString, priority, scopes, handle);
        return new Disposable(function() {
          return registry.removeExpression(name);
        });
      }
    },
    consumeVariableExpressions: function(options) {
      var handle, name, names, priority, regexpString, registry, scopes;
      if (options == null) {
        options = {};
      }
      if (Disposable == null) {
        Disposable = require('atom').Disposable;
      }
      registry = this.getProject().getVariableExpressionsRegistry();
      if (options.expressions != null) {
        names = options.expressions.map(function(e) {
          return e.name;
        });
        registry.createExpressions(options.expressions);
        return new Disposable(function() {
          var i, len, name, results;
          results = [];
          for (i = 0, len = names.length; i < len; i++) {
            name = names[i];
            results.push(registry.removeExpression(name));
          }
          return results;
        });
      } else {
        name = options.name, regexpString = options.regexpString, handle = options.handle, scopes = options.scopes, priority = options.priority;
        registry.createExpression(name, regexpString, priority, scopes, handle);
        return new Disposable(function() {
          return registry.removeExpression(name);
        });
      }
    },
    deserializePalette: function(state) {
      if (Palette == null) {
        Palette = require('./palette');
      }
      return Palette.deserialize(state);
    },
    deserializeColorSearch: function(state) {
      if (ColorSearch == null) {
        ColorSearch = require('./color-search');
      }
      return ColorSearch.deserialize(state);
    },
    deserializeColorProject: function(state) {
      if (ColorProject == null) {
        ColorProject = require('./color-project');
      }
      return ColorProject.deserialize(state);
    },
    deserializeColorProjectElement: function(state) {
      var element, subscription;
      if (ColorProjectElement == null) {
        ColorProjectElement = require('./color-project-element');
      }
      element = new ColorProjectElement;
      if (this.project != null) {
        element.setModel(this.getProject());
      } else {
        subscription = atom.packages.onDidActivatePackage((function(_this) {
          return function(pkg) {
            if (pkg.name === 'pigments') {
              subscription.dispose();
              return element.setModel(_this.getProject());
            }
          };
        })(this));
      }
      return element;
    },
    deserializeVariablesCollection: function(state) {
      if (VariablesCollection == null) {
        VariablesCollection = require('./variables-collection');
      }
      return VariablesCollection.deserialize(state);
    },
    pigmentsViewProvider: function(model) {
      var element;
      element = model instanceof (ColorBuffer != null ? ColorBuffer : ColorBuffer = require('./color-buffer')) ? (ColorBufferElement != null ? ColorBufferElement : ColorBufferElement = require('./color-buffer-element'), element = new ColorBufferElement) : model instanceof (ColorSearch != null ? ColorSearch : ColorSearch = require('./color-search')) ? (ColorResultsElement != null ? ColorResultsElement : ColorResultsElement = require('./color-results-element'), element = new ColorResultsElement) : model instanceof (ColorProject != null ? ColorProject : ColorProject = require('./color-project')) ? (ColorProjectElement != null ? ColorProjectElement : ColorProjectElement = require('./color-project-element'), element = new ColorProjectElement) : model instanceof (Palette != null ? Palette : Palette = require('./palette')) ? (PaletteElement != null ? PaletteElement : PaletteElement = require('./palette-element'), element = new PaletteElement) : void 0;
      if (element != null) {
        element.setModel(model);
      }
      return element;
    },
    shouldDisplayContextMenu: function(event) {
      this.lastEvent = event;
      setTimeout(((function(_this) {
        return function() {
          return _this.lastEvent = null;
        };
      })(this)), 10);
      return this.colorMarkerForMouseEvent(event) != null;
    },
    colorMarkerForMouseEvent: function(event) {
      var colorBuffer, colorBufferElement, editor;
      editor = atom.workspace.getActiveTextEditor();
      colorBuffer = this.project.colorBufferForEditor(editor);
      colorBufferElement = atom.views.getView(colorBuffer);
      return colorBufferElement != null ? colorBufferElement.colorMarkerForMouseEvent(event) : void 0;
    },
    serialize: function() {
      return {
        project: this.project.serialize()
      };
    },
    getProject: function() {
      return this.project;
    },
    findColors: function() {
      var pane;
      if (uris == null) {
        uris = require('./uris');
      }
      pane = atom.workspace.paneForURI(uris.SEARCH);
      pane || (pane = atom.workspace.getActivePane());
      return atom.workspace.openURIInPane(uris.SEARCH, pane, {});
    },
    showPalette: function() {
      if (uris == null) {
        uris = require('./uris');
      }
      return this.project.initialize().then(function() {
        var pane;
        pane = atom.workspace.paneForURI(uris.PALETTE);
        pane || (pane = atom.workspace.getActivePane());
        return atom.workspace.openURIInPane(uris.PALETTE, pane, {});
      })["catch"](function(reason) {
        return console.error(reason);
      });
    },
    showSettings: function() {
      if (uris == null) {
        uris = require('./uris');
      }
      return this.project.initialize().then(function() {
        var pane;
        pane = atom.workspace.paneForURI(uris.SETTINGS);
        pane || (pane = atom.workspace.getActivePane());
        return atom.workspace.openURIInPane(uris.SETTINGS, pane, {});
      })["catch"](function(reason) {
        return console.error(reason);
      });
    },
    reloadProjectVariables: function() {
      return this.project.reload();
    },
    createPigmentsReport: function() {
      return atom.workspace.open('pigments-report.json').then((function(_this) {
        return function(editor) {
          return editor.setText(_this.createReport());
        };
      })(this));
    },
    createReport: function() {
      var o;
      o = {
        atom: atom.getVersion(),
        pigments: atom.packages.getLoadedPackage('pigments').metadata.version,
        platform: require('os').platform(),
        config: atom.config.get('pigments'),
        project: {
          config: {
            sourceNames: this.project.sourceNames,
            searchNames: this.project.searchNames,
            ignoredNames: this.project.ignoredNames,
            ignoredScopes: this.project.ignoredScopes,
            includeThemes: this.project.includeThemes,
            ignoreGlobalSourceNames: this.project.ignoreGlobalSourceNames,
            ignoreGlobalSearchNames: this.project.ignoreGlobalSearchNames,
            ignoreGlobalIgnoredNames: this.project.ignoreGlobalIgnoredNames,
            ignoreGlobalIgnoredScopes: this.project.ignoreGlobalIgnoredScopes
          },
          paths: this.project.getPaths(),
          variables: {
            colors: this.project.getColorVariables().length,
            total: this.project.getVariables().length
          }
        }
      };
      return JSON.stringify(o, null, 2).replace(RegExp("" + (atom.project.getPaths().join('|')), "g"), '<root>');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3BpZ21lbnRzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFTSSxFQVRKLEVBQ0UsZ0JBREYsRUFDVyx1QkFEWCxFQUVFLG9CQUZGLEVBRWUsNEJBRmYsRUFHRSxxQkFIRixFQUdnQiw0QkFIaEIsRUFJRSxvQkFKRixFQUllLDJCQUpmLEVBS0Usb0JBTEYsRUFNRSw0QkFORixFQU11QiwwQkFOdkIsRUFNeUMscUJBTnpDLEVBT0Usb0JBUEYsRUFRRSxhQVJGLEVBUU87O0VBR1AsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7QUFDUixVQUFBOztRQUFBLGVBQWdCLE9BQUEsQ0FBUSxpQkFBUjs7TUFFaEIsSUFBQyxDQUFBLE9BQUQsR0FBYyxxQkFBSCxHQUNULFlBQVksQ0FBQyxXQUFiLENBQXlCLEtBQUssQ0FBQyxPQUEvQixDQURTLEdBR0wsSUFBQSxZQUFBLENBQUE7TUFFTixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ0U7UUFBQSxzQkFBQSxFQUF3QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxVQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEI7UUFDQSx1QkFBQSxFQUF5QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxXQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEekI7UUFFQSwyQkFBQSxFQUE2QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxZQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGN0I7UUFHQSxpQkFBQSxFQUFtQixD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ZXR0ZUVsZW1lbnQsXG4gIENvbG9yU2VhcmNoLCBDb2xvclJlc3VsdHNFbGVtZW50LFxuICBDb2xvclByb2plY3QsIENvbG9yUHJvamVjdEVsZW1lbnQsXG4gIENvbG9yQnVmZmVyLCBDb2xvckJ1ZmZlckVsZW1lbnQsXG4gIENvbG9yTWFya2VyLFxuICBWYXJpYWJsZXNDb2xsZWN0aW9uLCBQaWdtZW50c1Byb3ZpZGVyLCBQaWdtZW50c0FQSSxcbiAgRGlzcG9zYWJsZSxcbiAgdXJsLCB1cmlzXG5dID0gW11cblxubW9kdWxlLmV4cG9ydHMgPVxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIENvbG9yUHJvamVjdCA/PSByZXF1aXJlICcuL2NvbG9yLXByb2plY3QnXG5cbiAgICBAcHJvamVjdCA9IGlmIHN0YXRlLnByb2plY3Q/XG4gICAgICBDb2xvclByb2plY3QuZGVzZXJpYWxpemUoc3RhdGUucHJvamVjdClcbiAgICBlbHNlXG4gICAgICBuZXcgQ29sb3JQcm9qZWN0KClcblxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAncGlnbWVudHM6ZmluZC1jb2xvcnMnOiA9PiBAZmluZENvbG9ycygpXG4gICAgICAncGlnbWVudHM6c2hvdy1wYWxldHRlJzogPT4gQHNob3dQYWxldHRlKClcbiAgICAgICdwaWdtZW50czpwcm9qZWN0LXNldHRpbmdzJzogPT4gQHNob3dTZXR0aW5ncygpXG4gICAgICAncGlnbWVudHM6cmVsb2FkJzogPT4gQHJlbG9hZFByb2plY3RWYXJpYWJsZXMoKVxuICAgICAgJ3BpZ21lbnRzOnJlcG9ydCc6ID0+IEBjcmVhdGVQaWdtZW50c1JlcG9ydCgpXG5cbiAgICBjb252ZXJ0TWV0aG9kID0gKGFjdGlvbikgPT4gKGV2ZW50KSA9PlxuICAgICAgaWYgQGxhc3RFdmVudD9cbiAgICAgICAgYWN0aW9uIEBjb2xvck1hcmtlckZvck1vdXNlRXZlbnQoQGxhc3RFdmVudClcbiAgICAgIGVsc2VcbiAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIGNvbG9yQnVmZmVyID0gQHByb2plY3QuY29sb3JCdWZmZXJGb3JFZGl0b3IoZWRpdG9yKVxuXG4gICAgICAgIGVkaXRvci5nZXRDdXJzb3JzKCkuZm9yRWFjaCAoY3Vyc29yKSA9PlxuICAgICAgICAgIG1hcmtlciA9IGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VyQXRCdWZmZXJQb3NpdGlvbihjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgICAgICBhY3Rpb24obWFya2VyKVxuXG4gICAgICBAbGFzdEV2ZW50ID0gbnVsbFxuXG4gICAgY29weU1ldGhvZCA9IChhY3Rpb24pID0+IChldmVudCkgPT5cbiAgICAgIGlmIEBsYXN0RXZlbnQ/XG4gICAgICAgIGFjdGlvbiBAY29sb3JNYXJrZXJGb3JNb3VzZUV2ZW50KEBsYXN0RXZlbnQpXG4gICAgICBlbHNlXG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBjb2xvckJ1ZmZlciA9IEBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcbiAgICAgICAgY3Vyc29yID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuICAgICAgICBtYXJrZXIgPSBjb2xvckJ1ZmZlci5nZXRDb2xvck1hcmtlckF0QnVmZmVyUG9zaXRpb24oY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICAgIGFjdGlvbihtYXJrZXIpXG5cbiAgICAgIEBsYXN0RXZlbnQgPSBudWxsXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgICAncGlnbWVudHM6Y29udmVydC10by1oZXgnOiBjb252ZXJ0TWV0aG9kIChtYXJrZXIpIC0+XG4gICAgICAgIG1hcmtlci5jb252ZXJ0Q29udGVudFRvSGV4KCkgaWYgbWFya2VyP1xuXG4gICAgICAncGlnbWVudHM6Y29udmVydC10by1yZ2InOiBjb252ZXJ0TWV0aG9kIChtYXJrZXIpIC0+XG4gICAgICAgIG1hcmtlci5jb252ZXJ0Q29udGVudFRvUkdCKCkgaWYgbWFya2VyP1xuXG4gICAgICAncGlnbWVudHM6Y29udmVydC10by1yZ2JhJzogY29udmVydE1ldGhvZCAobWFya2VyKSAtPlxuICAgICAgICBtYXJrZXIuY29udmVydENvbnRlbnRUb1JHQkEoKSBpZiBtYXJrZXI/XG5cbiAgICAgICdwaWdtZW50czpjb252ZXJ0LXRvLWhzbCc6IGNvbnZlcnRNZXRob2QgKG1hcmtlcikgLT5cbiAgICAgICAgbWFya2VyLmNvbnZlcnRDb250ZW50VG9IU0woKSBpZiBtYXJrZXI/XG5cbiAgICAgICdwaWdtZW50czpjb252ZXJ0LXRvLWhzbGEnOiBjb252ZXJ0TWV0aG9kIChtYXJrZXIpIC0+XG4gICAgICAgIG1hcmtlci5jb252ZXJ0Q29udGVudFRvSFNMQSgpIGlmIG1hcmtlcj9cblxuICAgICAgJ3BpZ21lbnRzOmNvcHktYXMtaGV4JzogY29weU1ldGhvZCAobWFya2VyKSAtPlxuICAgICAgICBtYXJrZXIuY29weUNvbnRlbnRBc0hleCgpIGlmIG1hcmtlcj9cblxuICAgICAgJ3BpZ21lbnRzOmNvcHktYXMtcmdiJzogY29weU1ldGhvZCAobWFya2VyKSAtPlxuICAgICAgICBtYXJrZXIuY29weUNvbnRlbnRBc1JHQigpIGlmIG1hcmtlcj9cblxuICAgICAgJ3BpZ21lbnRzOmNvcHktYXMtcmdiYSc6IGNvcHlNZXRob2QgKG1hcmtlcikgLT5cbiAgICAgICAgbWFya2VyLmNvcHlDb250ZW50QXNSR0JBKCkgaWYgbWFya2VyP1xuXG4gICAgICAncGlnbWVudHM6Y29weS1hcy1oc2wnOiBjb3B5TWV0aG9kIChtYXJrZXIpIC0+XG4gICAgICAgIG1hcmtlci5jb3B5Q29udGVudEFzSFNMKCkgaWYgbWFya2VyP1xuXG4gICAgICAncGlnbWVudHM6Y29weS1hcy1oc2xhJzogY29weU1ldGhvZCAobWFya2VyKSAtPlxuICAgICAgICBtYXJrZXIuY29weUNvbnRlbnRBc0hTTEEoKSBpZiBtYXJrZXI/XG5cbiAgICBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIgKHVyaVRvT3BlbikgPT5cbiAgICAgIHVybCB8fD0gcmVxdWlyZSAndXJsJ1xuXG4gICAgICB7cHJvdG9jb2wsIGhvc3R9ID0gdXJsLnBhcnNlIHVyaVRvT3BlblxuICAgICAgcmV0dXJuIHVubGVzcyBwcm90b2NvbCBpcyAncGlnbWVudHM6J1xuXG4gICAgICBzd2l0Y2ggaG9zdFxuICAgICAgICB3aGVuICdzZWFyY2gnIHRoZW4gQHByb2plY3QuZmluZEFsbENvbG9ycygpXG4gICAgICAgIHdoZW4gJ3BhbGV0dGUnIHRoZW4gQHByb2plY3QuZ2V0UGFsZXR0ZSgpXG4gICAgICAgIHdoZW4gJ3NldHRpbmdzJyB0aGVuIGF0b20udmlld3MuZ2V0VmlldyhAcHJvamVjdClcblxuICAgIGF0b20uY29udGV4dE1lbnUuYWRkXG4gICAgICAnYXRvbS10ZXh0LWVkaXRvcic6IFt7XG4gICAgICAgIGxhYmVsOiAnUGlnbWVudHMnXG4gICAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgICB7bGFiZWw6ICdDb252ZXJ0IHRvIGhleGFkZWNpbWFsJywgY29tbWFuZDogJ3BpZ21lbnRzOmNvbnZlcnQtdG8taGV4J31cbiAgICAgICAgICB7bGFiZWw6ICdDb252ZXJ0IHRvIFJHQicsIGNvbW1hbmQ6ICdwaWdtZW50czpjb252ZXJ0LXRvLXJnYid9XG4gICAgICAgICAge2xhYmVsOiAnQ29udmVydCB0byBSR0JBJywgY29tbWFuZDogJ3BpZ21lbnRzOmNvbnZlcnQtdG8tcmdiYSd9XG4gICAgICAgICAge2xhYmVsOiAnQ29udmVydCB0byBIU0wnLCBjb21tYW5kOiAncGlnbWVudHM6Y29udmVydC10by1oc2wnfVxuICAgICAgICAgIHtsYWJlbDogJ0NvbnZlcnQgdG8gSFNMQScsIGNvbW1hbmQ6ICdwaWdtZW50czpjb252ZXJ0LXRvLWhzbGEnfVxuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ31cbiAgICAgICAgICB7bGFiZWw6ICdDb3B5IGFzIGhleGFkZWNpbWFsJywgY29tbWFuZDogJ3BpZ21lbnRzOmNvcHktYXMtaGV4J31cbiAgICAgICAgICB7bGFiZWw6ICdDb3B5IGFzIFJHQicsIGNvbW1hbmQ6ICdwaWdtZW50czpjb3B5LWFzLXJnYid9XG4gICAgICAgICAge2xhYmVsOiAnQ29weSBhcyBSR0JBJywgY29tbWFuZDogJ3BpZ21lbnRzOmNvcHktYXMtcmdiYSd9XG4gICAgICAgICAge2xhYmVsOiAnQ29weSBhcyBIU0wnLCBjb21tYW5kOiAncGlnbWVudHM6Y29weS1hcy1oc2wnfVxuICAgICAgICAgIHtsYWJlbDogJ0NvcHkgYXMgSFNMQScsIGNvbW1hbmQ6ICdwaWdtZW50czpjb3B5LWFzLWhzbGEnfVxuICAgICAgICBdXG4gICAgICAgIHNob3VsZERpc3BsYXk6IChldmVudCkgPT4gQHNob3VsZERpc3BsYXlDb250ZXh0TWVudShldmVudClcbiAgICAgIH1dXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAZ2V0UHJvamVjdCgpPy5kZXN0cm95PygpXG5cbiAgcHJvdmlkZUF1dG9jb21wbGV0ZTogLT5cbiAgICBQaWdtZW50c1Byb3ZpZGVyID89IHJlcXVpcmUgJy4vcGlnbWVudHMtcHJvdmlkZXInXG4gICAgbmV3IFBpZ21lbnRzUHJvdmlkZXIodGhpcylcblxuICBwcm92aWRlQVBJOiAtPlxuICAgIFBpZ21lbnRzQVBJID89IHJlcXVpcmUgJy4vcGlnbWVudHMtYXBpJ1xuICAgIG5ldyBQaWdtZW50c0FQSShAZ2V0UHJvamVjdCgpKVxuXG4gIGNvbnN1bWVDb2xvclBpY2tlcjogKGFwaSkgLT5cbiAgICBEaXNwb3NhYmxlID89IHJlcXVpcmUoJ2F0b20nKS5EaXNwb3NhYmxlXG5cbiAgICBAZ2V0UHJvamVjdCgpLnNldENvbG9yUGlja2VyQVBJKGFwaSlcblxuICAgIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAZ2V0UHJvamVjdCgpLnNldENvbG9yUGlja2VyQVBJKG51bGwpXG5cbiAgY29uc3VtZUNvbG9yRXhwcmVzc2lvbnM6IChvcHRpb25zPXt9KSAtPlxuICAgIERpc3Bvc2FibGUgPz0gcmVxdWlyZSgnYXRvbScpLkRpc3Bvc2FibGVcblxuICAgIHJlZ2lzdHJ5ID0gQGdldFByb2plY3QoKS5nZXRDb2xvckV4cHJlc3Npb25zUmVnaXN0cnkoKVxuXG4gICAgaWYgb3B0aW9ucy5leHByZXNzaW9ucz9cbiAgICAgIG5hbWVzID0gb3B0aW9ucy5leHByZXNzaW9ucy5tYXAgKGUpIC0+IGUubmFtZVxuICAgICAgcmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbnMob3B0aW9ucy5leHByZXNzaW9ucylcblxuICAgICAgbmV3IERpc3Bvc2FibGUgLT4gcmVnaXN0cnkucmVtb3ZlRXhwcmVzc2lvbihuYW1lKSBmb3IgbmFtZSBpbiBuYW1lc1xuICAgIGVsc2VcbiAgICAgIHtuYW1lLCByZWdleHBTdHJpbmcsIGhhbmRsZSwgc2NvcGVzLCBwcmlvcml0eX0gPSBvcHRpb25zXG4gICAgICByZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uKG5hbWUsIHJlZ2V4cFN0cmluZywgcHJpb3JpdHksIHNjb3BlcywgaGFuZGxlKVxuXG4gICAgICBuZXcgRGlzcG9zYWJsZSAtPiByZWdpc3RyeS5yZW1vdmVFeHByZXNzaW9uKG5hbWUpXG5cbiAgY29uc3VtZVZhcmlhYmxlRXhwcmVzc2lvbnM6IChvcHRpb25zPXt9KSAtPlxuICAgIERpc3Bvc2FibGUgPz0gcmVxdWlyZSgnYXRvbScpLkRpc3Bvc2FibGVcblxuICAgIHJlZ2lzdHJ5ID0gQGdldFByb2plY3QoKS5nZXRWYXJpYWJsZUV4cHJlc3Npb25zUmVnaXN0cnkoKVxuXG4gICAgaWYgb3B0aW9ucy5leHByZXNzaW9ucz9cbiAgICAgIG5hbWVzID0gb3B0aW9ucy5leHByZXNzaW9ucy5tYXAgKGUpIC0+IGUubmFtZVxuICAgICAgcmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbnMob3B0aW9ucy5leHByZXNzaW9ucylcblxuICAgICAgbmV3IERpc3Bvc2FibGUgLT4gcmVnaXN0cnkucmVtb3ZlRXhwcmVzc2lvbihuYW1lKSBmb3IgbmFtZSBpbiBuYW1lc1xuICAgIGVsc2VcbiAgICAgIHtuYW1lLCByZWdleHBTdHJpbmcsIGhhbmRsZSwgc2NvcGVzLCBwcmlvcml0eX0gPSBvcHRpb25zXG4gICAgICByZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uKG5hbWUsIHJlZ2V4cFN0cmluZywgcHJpb3JpdHksIHNjb3BlcywgaGFuZGxlKVxuXG4gICAgICBuZXcgRGlzcG9zYWJsZSAtPiByZWdpc3RyeS5yZW1vdmVFeHByZXNzaW9uKG5hbWUpXG5cbiAgZGVzZXJpYWxpemVQYWxldHRlOiAoc3RhdGUpIC0+XG4gICAgUGFsZXR0ZSA/PSByZXF1aXJlICcuL3BhbGV0dGUnXG4gICAgUGFsZXR0ZS5kZXNlcmlhbGl6ZShzdGF0ZSlcblxuICBkZXNlcmlhbGl6ZUNvbG9yU2VhcmNoOiAoc3RhdGUpIC0+XG4gICAgQ29sb3JTZWFyY2ggPz0gcmVxdWlyZSAnLi9jb2xvci1zZWFyY2gnXG4gICAgQ29sb3JTZWFyY2guZGVzZXJpYWxpemUoc3RhdGUpXG5cbiAgZGVzZXJpYWxpemVDb2xvclByb2plY3Q6IChzdGF0ZSkgLT5cbiAgICBDb2xvclByb2plY3QgPz0gcmVxdWlyZSAnLi9jb2xvci1wcm9qZWN0J1xuICAgIENvbG9yUHJvamVjdC5kZXNlcmlhbGl6ZShzdGF0ZSlcblxuICBkZXNlcmlhbGl6ZUNvbG9yUHJvamVjdEVsZW1lbnQ6IChzdGF0ZSkgLT5cbiAgICBDb2xvclByb2plY3RFbGVtZW50ID89IHJlcXVpcmUgJy4vY29sb3ItcHJvamVjdC1lbGVtZW50J1xuICAgIGVsZW1lbnQgPSBuZXcgQ29sb3JQcm9qZWN0RWxlbWVudFxuXG4gICAgaWYgQHByb2plY3Q/XG4gICAgICBlbGVtZW50LnNldE1vZGVsKEBnZXRQcm9qZWN0KCkpXG4gICAgZWxzZVxuICAgICAgc3Vic2NyaXB0aW9uID0gYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSAocGtnKSA9PlxuICAgICAgICBpZiBwa2cubmFtZSBpcyAncGlnbWVudHMnXG4gICAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgICAgIGVsZW1lbnQuc2V0TW9kZWwoQGdldFByb2plY3QoKSlcblxuICAgIGVsZW1lbnRcblxuICBkZXNlcmlhbGl6ZVZhcmlhYmxlc0NvbGxlY3Rpb246IChzdGF0ZSkgLT5cbiAgICBWYXJpYWJsZXNDb2xsZWN0aW9uID89IHJlcXVpcmUgJy4vdmFyaWFibGVzLWNvbGxlY3Rpb24nXG4gICAgVmFyaWFibGVzQ29sbGVjdGlvbi5kZXNlcmlhbGl6ZShzdGF0ZSlcblxuICBwaWdtZW50c1ZpZXdQcm92aWRlcjogKG1vZGVsKSAtPlxuICAgIGVsZW1lbnQgPSBpZiBtb2RlbCBpbnN0YW5jZW9mIChDb2xvckJ1ZmZlciA/PSByZXF1aXJlICcuL2NvbG9yLWJ1ZmZlcicpXG4gICAgICBDb2xvckJ1ZmZlckVsZW1lbnQgPz0gcmVxdWlyZSAnLi9jb2xvci1idWZmZXItZWxlbWVudCdcbiAgICAgIGVsZW1lbnQgPSBuZXcgQ29sb3JCdWZmZXJFbGVtZW50XG4gICAgZWxzZSBpZiBtb2RlbCBpbnN0YW5jZW9mIChDb2xvclNlYXJjaCA/PSByZXF1aXJlICcuL2NvbG9yLXNlYXJjaCcpXG4gICAgICBDb2xvclJlc3VsdHNFbGVtZW50ID89IHJlcXVpcmUgJy4vY29sb3ItcmVzdWx0cy1lbGVtZW50J1xuICAgICAgZWxlbWVudCA9IG5ldyBDb2xvclJlc3VsdHNFbGVtZW50XG4gICAgZWxzZSBpZiBtb2RlbCBpbnN0YW5jZW9mIChDb2xvclByb2plY3QgPz0gcmVxdWlyZSAnLi9jb2xvci1wcm9qZWN0JylcbiAgICAgIENvbG9yUHJvamVjdEVsZW1lbnQgPz0gcmVxdWlyZSAnLi9jb2xvci1wcm9qZWN0LWVsZW1lbnQnXG4gICAgICBlbGVtZW50ID0gbmV3IENvbG9yUHJvamVjdEVsZW1lbnRcbiAgICBlbHNlIGlmIG1vZGVsIGluc3RhbmNlb2YgKFBhbGV0dGUgPz0gcmVxdWlyZSAnLi9wYWxldHRlJylcbiAgICAgIFBhbGV0dGVFbGVtZW50ID89IHJlcXVpcmUgJy4vcGFsZXR0ZS1lbGVtZW50J1xuICAgICAgZWxlbWVudCA9IG5ldyBQYWxldHRlRWxlbWVudFxuXG4gICAgZWxlbWVudC5zZXRNb2RlbChtb2RlbCkgaWYgZWxlbWVudD9cbiAgICBlbGVtZW50XG5cbiAgc2hvdWxkRGlzcGxheUNvbnRleHRNZW51OiAoZXZlbnQpIC0+XG4gICAgQGxhc3RFdmVudCA9IGV2ZW50XG4gICAgc2V0VGltZW91dCAoPT4gQGxhc3RFdmVudCA9IG51bGwpLCAxMFxuICAgIEBjb2xvck1hcmtlckZvck1vdXNlRXZlbnQoZXZlbnQpP1xuXG4gIGNvbG9yTWFya2VyRm9yTW91c2VFdmVudDogKGV2ZW50KSAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGNvbG9yQnVmZmVyID0gQHByb2plY3QuY29sb3JCdWZmZXJGb3JFZGl0b3IoZWRpdG9yKVxuICAgIGNvbG9yQnVmZmVyRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyhjb2xvckJ1ZmZlcilcbiAgICBjb2xvckJ1ZmZlckVsZW1lbnQ/LmNvbG9yTWFya2VyRm9yTW91c2VFdmVudChldmVudClcblxuICBzZXJpYWxpemU6IC0+IHtwcm9qZWN0OiBAcHJvamVjdC5zZXJpYWxpemUoKX1cblxuICBnZXRQcm9qZWN0OiAtPiBAcHJvamVjdFxuXG4gIGZpbmRDb2xvcnM6IC0+XG4gICAgdXJpcyA/PSByZXF1aXJlICcuL3VyaXMnXG5cbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSSh1cmlzLlNFQVJDSClcbiAgICBwYW5lIHx8PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcblxuICAgIGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUodXJpcy5TRUFSQ0gsIHBhbmUsIHt9KVxuXG4gIHNob3dQYWxldHRlOiAtPlxuICAgIHVyaXMgPz0gcmVxdWlyZSAnLi91cmlzJ1xuXG4gICAgQHByb2plY3QuaW5pdGlhbGl6ZSgpLnRoZW4gLT5cbiAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKHVyaXMuUEFMRVRURSlcbiAgICAgIHBhbmUgfHw9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuXG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuVVJJSW5QYW5lKHVyaXMuUEFMRVRURSwgcGFuZSwge30pXG4gICAgLmNhdGNoIChyZWFzb24pIC0+XG4gICAgICBjb25zb2xlLmVycm9yIHJlYXNvblxuXG4gIHNob3dTZXR0aW5nczogLT5cbiAgICB1cmlzID89IHJlcXVpcmUgJy4vdXJpcydcblxuICAgIEBwcm9qZWN0LmluaXRpYWxpemUoKS50aGVuIC0+XG4gICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSSh1cmlzLlNFVFRJTkdTKVxuICAgICAgcGFuZSB8fD0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG5cbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUodXJpcy5TRVRUSU5HUywgcGFuZSwge30pXG4gICAgLmNhdGNoIChyZWFzb24pIC0+XG4gICAgICBjb25zb2xlLmVycm9yIHJlYXNvblxuXG4gIHJlbG9hZFByb2plY3RWYXJpYWJsZXM6IC0+IEBwcm9qZWN0LnJlbG9hZCgpXG5cbiAgY3JlYXRlUGlnbWVudHNSZXBvcnQ6IC0+XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbigncGlnbWVudHMtcmVwb3J0Lmpzb24nKS50aGVuIChlZGl0b3IpID0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dChAY3JlYXRlUmVwb3J0KCkpXG5cbiAgY3JlYXRlUmVwb3J0OiAtPlxuICAgIG8gPVxuICAgICAgYXRvbTogYXRvbS5nZXRWZXJzaW9uKClcbiAgICAgIHBpZ21lbnRzOiBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoJ3BpZ21lbnRzJykubWV0YWRhdGEudmVyc2lvblxuICAgICAgcGxhdGZvcm06IHJlcXVpcmUoJ29zJykucGxhdGZvcm0oKVxuICAgICAgY29uZmlnOiBhdG9tLmNvbmZpZy5nZXQoJ3BpZ21lbnRzJylcbiAgICAgIHByb2plY3Q6XG4gICAgICAgIGNvbmZpZzpcbiAgICAgICAgICBzb3VyY2VOYW1lczogQHByb2plY3Quc291cmNlTmFtZXNcbiAgICAgICAgICBzZWFyY2hOYW1lczogQHByb2plY3Quc2VhcmNoTmFtZXNcbiAgICAgICAgICBpZ25vcmVkTmFtZXM6IEBwcm9qZWN0Lmlnbm9yZWROYW1lc1xuICAgICAgICAgIGlnbm9yZWRTY29wZXM6IEBwcm9qZWN0Lmlnbm9yZWRTY29wZXNcbiAgICAgICAgICBpbmNsdWRlVGhlbWVzOiBAcHJvamVjdC5pbmNsdWRlVGhlbWVzXG4gICAgICAgICAgaWdub3JlR2xvYmFsU291cmNlTmFtZXM6IEBwcm9qZWN0Lmlnbm9yZUdsb2JhbFNvdXJjZU5hbWVzXG4gICAgICAgICAgaWdub3JlR2xvYmFsU2VhcmNoTmFtZXM6IEBwcm9qZWN0Lmlnbm9yZUdsb2JhbFNlYXJjaE5hbWVzXG4gICAgICAgICAgaWdub3JlR2xvYmFsSWdub3JlZE5hbWVzOiBAcHJvamVjdC5pZ25vcmVHbG9iYWxJZ25vcmVkTmFtZXNcbiAgICAgICAgICBpZ25vcmVHbG9iYWxJZ25vcmVkU2NvcGVzOiBAcHJvamVjdC5pZ25vcmVHbG9iYWxJZ25vcmVkU2NvcGVzXG4gICAgICAgIHBhdGhzOiBAcHJvamVjdC5nZXRQYXRocygpXG4gICAgICAgIHZhcmlhYmxlczpcbiAgICAgICAgICBjb2xvcnM6IEBwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoXG4gICAgICAgICAgdG90YWw6IEBwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aFxuXG4gICAgSlNPTi5zdHJpbmdpZnkobywgbnVsbCwgMilcbiAgICAucmVwbGFjZSgvLy8je2F0b20ucHJvamVjdC5nZXRQYXRocygpLmpvaW4oJ3wnKX0vLy9nLCAnPHJvb3Q+JylcbiJdfQ==
