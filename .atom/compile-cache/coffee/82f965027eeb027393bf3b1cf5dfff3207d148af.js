(function() {
  var ColorProject, CompositeDisposable, Disposable, PigmentsAPI, PigmentsProvider, uris, url, _ref, _ref1;

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  uris = require('./uris');

  ColorProject = require('./color-project');

  _ref1 = [], PigmentsProvider = _ref1[0], PigmentsAPI = _ref1[1], url = _ref1[2];

  module.exports = {
    config: {
      traverseIntoSymlinkDirectories: {
        type: 'boolean',
        "default": false
      },
      sourceNames: {
        type: 'array',
        "default": ['**/*.styl', '**/*.stylus', '**/*.less', '**/*.sass', '**/*.scss'],
        description: "Glob patterns of files to scan for variables.",
        items: {
          type: 'string'
        }
      },
      ignoredNames: {
        type: 'array',
        "default": ["vendor/*", "node_modules/*", "spec/*", "test/*"],
        description: "Glob patterns of files to ignore when scanning the project for variables.",
        items: {
          type: 'string'
        }
      },
      ignoredBufferNames: {
        type: 'array',
        "default": [],
        description: "Glob patterns of files that won't get any colors highlighted",
        items: {
          type: 'string'
        }
      },
      extendedSearchNames: {
        type: 'array',
        "default": ['**/*.css'],
        description: "When performing the `find-colors` command, the search will scans all the files that match the `sourceNames` glob patterns and the one defined in this setting."
      },
      supportedFiletypes: {
        type: 'array',
        "default": ['*'],
        description: "An array of file extensions where colors will be highlighted. If the wildcard `*` is present in this array then colors in every file will be highlighted."
      },
      filetypesForColorWords: {
        type: 'array',
        "default": ['css', 'less', 'styl', 'stylus', 'sass', 'scss'],
        description: "An array of file extensions where color values such as `red`, `azure` or `whitesmoke` will be highlighted. By default CSS and CSS pre-processors files are supported.\n\nYou can use `none` or whatever value that doesn't match a file extension to completely prevent color words from being highlighted."
      },
      ignoredScopes: {
        type: 'array',
        "default": [],
        description: "Regular expressions of scopes in which colors are ignored. For example, to ignore all colors in comments you can use `\\.comment`.",
        items: {
          type: 'string'
        }
      },
      autocompleteScopes: {
        type: 'array',
        "default": ['.source.css', '.source.css.less', '.source.sass', '.source.css.scss', '.source.stylus'],
        description: 'The autocomplete provider will only complete color names in editors whose scope is present in this list.',
        items: {
          type: 'string'
        }
      },
      extendAutocompleteToVariables: {
        type: 'boolean',
        "default": false,
        description: 'When enabled, the autocomplete provider will also provides completion for non-color variables.'
      },
      extendAutocompleteToColorValue: {
        type: 'boolean',
        "default": false,
        description: 'When enabled, the autocomplete provider will also provides color value.'
      },
      markerType: {
        type: 'string',
        "default": 'background',
        "enum": ['native-background', 'native-underline', 'native-outline', 'native-dot', 'native-square-dot', 'background', 'outline', 'underline', 'dot', 'square-dot', 'gutter']
      },
      sassShadeAndTintImplementation: {
        type: 'string',
        "default": 'compass',
        "enum": ['compass', 'bourbon'],
        description: "Sass doesn't provide any implementation for shade and tint function, and Compass and Bourbon have different implementation for these two methods. This setting allow you to chose which implementation use."
      },
      sortPaletteColors: {
        type: 'string',
        "default": 'none',
        "enum": ['none', 'by name', 'by color']
      },
      groupPaletteColors: {
        type: 'string',
        "default": 'none',
        "enum": ['none', 'by file']
      },
      mergeColorDuplicates: {
        type: 'boolean',
        "default": false
      },
      delayBeforeScan: {
        type: 'integer',
        "default": 500,
        description: 'Number of milliseconds after which the current buffer will be scanned for changes in the colors. This delay starts at the end of the text input and will be aborted if you start typing again during the interval.'
      },
      ignoreVcsIgnoredPaths: {
        type: 'boolean',
        "default": true,
        title: 'Ignore VCS Ignored Paths'
      }
    },
    activate: function(state) {
      var convertMethod, copyMethod;
      this.patchAtom();
      this.project = state.project != null ? atom.deserializers.deserialize(state.project) : new ColorProject();
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
          var host, protocol, _ref2;
          url || (url = require('url'));
          _ref2 = url.parse(uriToOpen), protocol = _ref2.protocol, host = _ref2.host;
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
      var _ref2;
      return (_ref2 = this.getProject()) != null ? typeof _ref2.destroy === "function" ? _ref2.destroy() : void 0 : void 0;
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
      pane = atom.workspace.paneForURI(uris.SEARCH);
      pane || (pane = atom.workspace.getActivePane());
      return atom.workspace.openURIInPane(uris.SEARCH, pane, {});
    },
    showPalette: function() {
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
      return this.project.initialize().then((function(_this) {
        return function() {
          return _this.project.loadPathsAndVariables();
        };
      })(this))["catch"](function(reason) {
        return console.error(reason);
      });
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
          var i, newRegionState, regionNode, _i, _len, _ref2, _ref3, _results;
          _updateHighlightRegions.call(this, id, newHighlightState);
          if ((_ref2 = newHighlightState["class"]) != null ? _ref2.match(/^pigments-native-background\s/) : void 0) {
            _ref3 = newHighlightState.regions;
            _results = [];
            for (i = _i = 0, _len = _ref3.length; _i < _len; i = ++_i) {
              newRegionState = _ref3[i];
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
    },
    loadDeserializersAndRegisterViews: function() {
      var ColorBuffer, ColorBufferElement, ColorMarkerElement, ColorProjectElement, ColorResultsElement, ColorSearch, Palette, PaletteElement, VariablesCollection;
      ColorBuffer = require('./color-buffer');
      ColorSearch = require('./color-search');
      Palette = require('./palette');
      ColorBufferElement = require('./color-buffer-element');
      ColorMarkerElement = require('./color-marker-element');
      ColorResultsElement = require('./color-results-element');
      ColorProjectElement = require('./color-project-element');
      PaletteElement = require('./palette-element');
      VariablesCollection = require('./variables-collection');
      ColorBufferElement.registerViewProvider(ColorBuffer);
      ColorResultsElement.registerViewProvider(ColorSearch);
      ColorProjectElement.registerViewProvider(ColorProject);
      PaletteElement.registerViewProvider(Palette);
      atom.deserializers.add(Palette);
      atom.deserializers.add(ColorSearch);
      atom.deserializers.add(ColorProject);
      atom.deserializers.add(ColorProjectElement);
      return atom.deserializers.add(VariablesCollection);
    }
  };

  module.exports.loadDeserializersAndRegisterViews();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3BpZ21lbnRzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvR0FBQTs7QUFBQSxFQUFBLE9BQW9DLE9BQUEsQ0FBUSxNQUFSLENBQXBDLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0Isa0JBQUEsVUFBdEIsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBRmYsQ0FBQTs7QUFBQSxFQUdBLFFBQXVDLEVBQXZDLEVBQUMsMkJBQUQsRUFBbUIsc0JBQW5CLEVBQWdDLGNBSGhDLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLDhCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtPQURGO0FBQUEsTUFHQSxXQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsQ0FDUCxXQURPLEVBRVAsYUFGTyxFQUdQLFdBSE8sRUFJUCxXQUpPLEVBS1AsV0FMTyxDQURUO0FBQUEsUUFRQSxXQUFBLEVBQWEsK0NBUmI7QUFBQSxRQVNBLEtBQUEsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLFFBQU47U0FWRjtPQUpGO0FBQUEsTUFlQSxZQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsQ0FDUCxVQURPLEVBRVAsZ0JBRk8sRUFHUCxRQUhPLEVBSVAsUUFKTyxDQURUO0FBQUEsUUFPQSxXQUFBLEVBQWEsMkVBUGI7QUFB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/pigments.coffee
