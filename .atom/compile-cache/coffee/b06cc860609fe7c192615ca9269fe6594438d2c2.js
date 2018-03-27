(function() {
  var ColorBuffer, ColorBufferElement, ColorMarker, ColorMarkerElement, ColorProject, ColorProjectElement, ColorResultsElement, ColorSearch, Disposable, Palette, PaletteElement, PigmentsAPI, PigmentsProvider, VariablesCollection, uris, url, _ref;

  _ref = [], Palette = _ref[0], PaletteElement = _ref[1], ColorSearch = _ref[2], ColorResultsElement = _ref[3], ColorProject = _ref[4], ColorProjectElement = _ref[5], ColorBuffer = _ref[6], ColorBufferElement = _ref[7], ColorMarker = _ref[8], ColorMarkerElement = _ref[9], VariablesCollection = _ref[10], PigmentsProvider = _ref[11], PigmentsAPI = _ref[12], Disposable = _ref[13], url = _ref[14], uris = _ref[15];

  module.exports = {
    activate: function(state) {
      var convertMethod, copyMethod;
      if (ColorProject == null) {
        ColorProject = require('./color-project');
      }
      this.patchAtom();
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
          var host, protocol, _ref1;
          url || (url = require('url'));
          _ref1 = url.parse(uriToOpen), protocol = _ref1.protocol, host = _ref1.host;
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
      var _ref1;
      return (_ref1 = this.getProject()) != null ? typeof _ref1.destroy === "function" ? _ref1.destroy() : void 0 : void 0;
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
          var name, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = names.length; _i < _len; _i++) {
            name = names[_i];
            _results.push(registry.removeExpression(name));
          }
          return _results;
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
          var name, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = names.length; _i < _len; _i++) {
            name = names[_i];
            _results.push(registry.removeExpression(name));
          }
          return _results;
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
      element = model instanceof (ColorBuffer != null ? ColorBuffer : ColorBuffer = require('./color-buffer')) ? (ColorBufferElement != null ? ColorBufferElement : ColorBufferElement = require('./color-buffer-element'), element = new ColorBufferElement) : model instanceof (ColorMarker != null ? ColorMarker : ColorMarker = require('./color-marker')) ? (ColorMarkerElement != null ? ColorMarkerElement : ColorMarkerElement = require('./color-marker-element'), element = new ColorMarkerElement) : model instanceof (ColorSearch != null ? ColorSearch : ColorSearch = require('./color-search')) ? (ColorResultsElement != null ? ColorResultsElement : ColorResultsElement = require('./color-results-element'), element = new ColorResultsElement) : model instanceof (ColorProject != null ? ColorProject : ColorProject = require('./color-project')) ? (ColorProjectElement != null ? ColorProjectElement : ColorProjectElement = require('./color-project-element'), element = new ColorProjectElement) : model instanceof (Palette != null ? Palette : Palette = require('./palette')) ? (PaletteElement != null ? PaletteElement : PaletteElement = require('./palette-element'), element = new PaletteElement) : void 0;
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
    },
    patchAtom: function() {
      var HighlightComponent, TextEditorPresenter, requireCore, _buildHighlightRegions, _updateHighlightRegions;
      requireCore = function(name) {
        return require(Object.keys(require.cache).filter(function(s) {
          return s.indexOf(name) > -1;
        })[0]);
      };
      HighlightComponent = requireCore('highlights-component');
      TextEditorPresenter = requireCore('text-editor-presenter');
      if (TextEditorPresenter.getTextInScreenRange == null) {
        TextEditorPresenter.prototype.getTextInScreenRange = function(screenRange) {
          if (this.displayLayer != null) {
            return this.model.getTextInRange(this.displayLayer.translateScreenRange(screenRange));
          } else {
            return this.model.getTextInRange(this.model.bufferRangeForScreenRange(screenRange));
          }
        };
        _buildHighlightRegions = TextEditorPresenter.prototype.buildHighlightRegions;
        TextEditorPresenter.prototype.buildHighlightRegions = function(screenRange) {
          var regions;
          regions = _buildHighlightRegions.call(this, screenRange);
          if (regions.length === 1) {
            regions[0].text = this.getTextInScreenRange(screenRange);
          } else {
            regions[0].text = this.getTextInScreenRange([screenRange.start, [screenRange.start.row, Infinity]]);
            regions[regions.length - 1].text = this.getTextInScreenRange([[screenRange.end.row, 0], screenRange.end]);
            if (regions.length > 2) {
              regions[1].text = this.getTextInScreenRange([[screenRange.start.row + 1, 0], [screenRange.end.row - 1, Infinity]]);
            }
          }
          return regions;
        };
        _updateHighlightRegions = HighlightComponent.prototype.updateHighlightRegions;
        return HighlightComponent.prototype.updateHighlightRegions = function(id, newHighlightState) {
          var i, newRegionState, regionNode, _i, _len, _ref1, _ref2, _results;
          _updateHighlightRegions.call(this, id, newHighlightState);
          if ((_ref1 = newHighlightState["class"]) != null ? _ref1.match(/^pigments-native-background\s/) : void 0) {
            _ref2 = newHighlightState.regions;
            _results = [];
            for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
              newRegionState = _ref2[i];
              regionNode = this.regionNodesByHighlightId[id][i];
              if (newRegionState.text != null) {
                _results.push(regionNode.textContent = newRegionState.text);
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          }
        };
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3BpZ21lbnRzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrT0FBQTs7QUFBQSxFQUFBLE9BU0ksRUFUSixFQUNFLGlCQURGLEVBQ1csd0JBRFgsRUFFRSxxQkFGRixFQUVlLDZCQUZmLEVBR0Usc0JBSEYsRUFHZ0IsNkJBSGhCLEVBSUUscUJBSkYsRUFJZSw0QkFKZixFQUtFLHFCQUxGLEVBS2UsNEJBTGYsRUFNRSw4QkFORixFQU11QiwyQkFOdkIsRUFNeUMsc0JBTnpDLEVBT0UscUJBUEYsRUFRRSxjQVJGLEVBUU8sZUFSUCxDQUFBOztBQUFBLEVBV0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsVUFBQSx5QkFBQTs7UUFBQSxlQUFnQixPQUFBLENBQVEsaUJBQVI7T0FBaEI7QUFBQSxNQUVBLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FGQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsT0FBRCxHQUFjLHFCQUFILEdBQ1QsWUFBWSxDQUFDLFdBQWIsQ0FBeUIsS0FBSyxDQUFDLE9BQS9CLENBRFMsR0FHTCxJQUFBLFlBQUEsQ0FBQSxDQVBOLENBQUE7QUFBQSxNQVNBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDRTtBQUFBLFFBQUEsc0JBQUEsRUFBd0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLFVBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEI7QUFBQSxRQUNBLHVCQUFBLEVBQXlCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/pigments.coffee
