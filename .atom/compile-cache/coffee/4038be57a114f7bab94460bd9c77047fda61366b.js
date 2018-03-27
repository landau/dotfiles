(function() {
  var CompositeDisposable, EventsDelegation, Palette, PaletteElement, SpacePenDSL, StickyTitle, THEME_VARIABLES, pigments, ref, ref1, registerOrUpdateElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-utils'), SpacePenDSL = ref.SpacePenDSL, EventsDelegation = ref.EventsDelegation, registerOrUpdateElement = ref.registerOrUpdateElement;

  ref1 = [], CompositeDisposable = ref1[0], THEME_VARIABLES = ref1[1], pigments = ref1[2], Palette = ref1[3], StickyTitle = ref1[4];

  PaletteElement = (function(superClass) {
    extend(PaletteElement, superClass);

    function PaletteElement() {
      return PaletteElement.__super__.constructor.apply(this, arguments);
    }

    SpacePenDSL.includeInto(PaletteElement);

    EventsDelegation.includeInto(PaletteElement);

    PaletteElement.content = function() {
      var group, merge, optAttrs, sort;
      sort = atom.config.get('pigments.sortPaletteColors');
      group = atom.config.get('pigments.groupPaletteColors');
      merge = atom.config.get('pigments.mergeColorDuplicates');
      optAttrs = function(bool, name, attrs) {
        if (bool) {
          attrs[name] = name;
        }
        return attrs;
      };
      return this.div({
        "class": 'pigments-palette-panel'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'pigments-palette-controls settings-view pane-item'
          }, function() {
            return _this.div({
              "class": 'pigments-palette-controls-wrapper'
            }, function() {
              _this.span({
                "class": 'input-group-inline'
              }, function() {
                _this.label({
                  "for": 'sort-palette-colors'
                }, 'Sort Colors');
                return _this.select({
                  outlet: 'sort',
                  id: 'sort-palette-colors'
                }, function() {
                  _this.option(optAttrs(sort === 'none', 'selected', {
                    value: 'none'
                  }), 'None');
                  _this.option(optAttrs(sort === 'by name', 'selected', {
                    value: 'by name'
                  }), 'By Name');
                  return _this.option(optAttrs(sort === 'by file', 'selected', {
                    value: 'by color'
                  }), 'By Color');
                });
              });
              _this.span({
                "class": 'input-group-inline'
              }, function() {
                _this.label({
                  "for": 'sort-palette-colors'
                }, 'Group Colors');
                return _this.select({
                  outlet: 'group',
                  id: 'group-palette-colors'
                }, function() {
                  _this.option(optAttrs(group === 'none', 'selected', {
                    value: 'none'
                  }), 'None');
                  return _this.option(optAttrs(group === 'by file', 'selected', {
                    value: 'by file'
                  }), 'By File');
                });
              });
              return _this.span({
                "class": 'input-group-inline'
              }, function() {
                _this.input(optAttrs(merge, 'checked', {
                  type: 'checkbox',
                  id: 'merge-duplicates',
                  outlet: 'merge'
                }));
                return _this.label({
                  "for": 'merge-duplicates'
                }, 'Merge Duplicates');
              });
            });
          });
          return _this.div({
            "class": 'pigments-palette-list native-key-bindings',
            tabindex: -1
          }, function() {
            return _this.ol({
              outlet: 'list'
            });
          });
        };
      })(this));
    };

    PaletteElement.prototype.createdCallback = function() {
      var subscription;
      if (pigments == null) {
        pigments = require('./pigments');
      }
      this.project = pigments.getProject();
      if (this.project != null) {
        return this.init();
      } else {
        return subscription = atom.packages.onDidActivatePackage((function(_this) {
          return function(pkg) {
            if (pkg.name === 'pigments') {
              subscription.dispose();
              _this.project = pigments.getProject();
              return _this.init();
            }
          };
        })(this));
      }
    };

    PaletteElement.prototype.init = function() {
      if (this.project.isDestroyed()) {
        return;
      }
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.project.onDidUpdateVariables((function(_this) {
        return function() {
          if (_this.palette != null) {
            _this.palette.variables = _this.project.getColorVariables();
            if (_this.attached) {
              return _this.renderList();
            }
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.sortPaletteColors', (function(_this) {
        return function(sortPaletteColors) {
          _this.sortPaletteColors = sortPaletteColors;
          if ((_this.palette != null) && _this.attached) {
            return _this.renderList();
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.groupPaletteColors', (function(_this) {
        return function(groupPaletteColors) {
          _this.groupPaletteColors = groupPaletteColors;
          if ((_this.palette != null) && _this.attached) {
            return _this.renderList();
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.mergeColorDuplicates', (function(_this) {
        return function(mergeColorDuplicates) {
          _this.mergeColorDuplicates = mergeColorDuplicates;
          if ((_this.palette != null) && _this.attached) {
            return _this.renderList();
          }
        };
      })(this)));
      this.subscriptions.add(this.subscribeTo(this.sort, {
        'change': function(e) {
          return atom.config.set('pigments.sortPaletteColors', e.target.value);
        }
      }));
      this.subscriptions.add(this.subscribeTo(this.group, {
        'change': function(e) {
          return atom.config.set('pigments.groupPaletteColors', e.target.value);
        }
      }));
      this.subscriptions.add(this.subscribeTo(this.merge, {
        'change': function(e) {
          return atom.config.set('pigments.mergeColorDuplicates', e.target.checked);
        }
      }));
      return this.subscriptions.add(this.subscribeTo(this.list, '[data-variable-id]', {
        'click': (function(_this) {
          return function(e) {
            var variable, variableId;
            variableId = Number(e.target.dataset.variableId);
            variable = _this.project.getVariableById(variableId);
            return _this.project.showVariableInFile(variable);
          };
        })(this)
      }));
    };

    PaletteElement.prototype.attachedCallback = function() {
      if (this.palette != null) {
        this.renderList();
      }
      return this.attached = true;
    };

    PaletteElement.prototype.detachedCallback = function() {
      this.subscriptions.dispose();
      return this.attached = false;
    };

    PaletteElement.prototype.getModel = function() {
      return this.palette;
    };

    PaletteElement.prototype.setModel = function(palette1) {
      this.palette = palette1;
      if (this.attached) {
        return this.renderList();
      }
    };

    PaletteElement.prototype.getColorsList = function(palette) {
      switch (this.sortPaletteColors) {
        case 'by color':
          return palette.sortedByColor();
        case 'by name':
          return palette.sortedByName();
        default:
          return palette.variables.slice();
      }
    };

    PaletteElement.prototype.renderList = function() {
      var file, li, ol, palette, palettes, ref2;
      if ((ref2 = this.stickyTitle) != null) {
        ref2.dispose();
      }
      this.list.innerHTML = '';
      if (this.groupPaletteColors === 'by file') {
        if (StickyTitle == null) {
          StickyTitle = require('./sticky-title');
        }
        palettes = this.getFilesPalettes();
        for (file in palettes) {
          palette = palettes[file];
          li = document.createElement('li');
          li.className = 'pigments-color-group';
          ol = document.createElement('ol');
          li.appendChild(this.getGroupHeader(atom.project.relativize(file)));
          li.appendChild(ol);
          this.buildList(ol, this.getColorsList(palette));
          this.list.appendChild(li);
        }
        return this.stickyTitle = new StickyTitle(this.list.querySelectorAll('.pigments-color-group-header-content'), this.querySelector('.pigments-palette-list'));
      } else {
        return this.buildList(this.list, this.getColorsList(this.palette));
      }
    };

    PaletteElement.prototype.getGroupHeader = function(label) {
      var content, header;
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      header = document.createElement('div');
      header.className = 'pigments-color-group-header';
      content = document.createElement('div');
      content.className = 'pigments-color-group-header-content';
      if (label === THEME_VARIABLES) {
        content.textContent = 'Atom Themes';
      } else {
        content.textContent = label;
      }
      header.appendChild(content);
      return header;
    };

    PaletteElement.prototype.getFilesPalettes = function() {
      var palettes;
      if (Palette == null) {
        Palette = require('./palette');
      }
      palettes = {};
      this.palette.eachColor((function(_this) {
        return function(variable) {
          var path;
          path = variable.path;
          if (palettes[path] == null) {
            palettes[path] = new Palette([]);
          }
          return palettes[path].variables.push(variable);
        };
      })(this));
      return palettes;
    };

    PaletteElement.prototype.buildList = function(container, paletteColors) {
      var color, html, i, id, isAlternate, j, len, len1, li, line, name, path, ref2, ref3, results1, variables;
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      paletteColors = this.checkForDuplicates(paletteColors);
      results1 = [];
      for (i = 0, len = paletteColors.length; i < len; i++) {
        variables = paletteColors[i];
        li = document.createElement('li');
        li.className = 'pigments-color-item';
        ref2 = variables[0], color = ref2.color, isAlternate = ref2.isAlternate;
        if (isAlternate) {
          continue;
        }
        if (color.toCSS == null) {
          continue;
        }
        html = "<div class=\"pigments-color\">\n  <span class=\"pigments-color-preview\"\n        style=\"background-color: " + (color.toCSS()) + "\">\n  </span>\n  <span class=\"pigments-color-properties\">\n    <span class=\"pigments-color-component\"><strong>R:</strong> " + (Math.round(color.red)) + "</span>\n    <span class=\"pigments-color-component\"><strong>G:</strong> " + (Math.round(color.green)) + "</span>\n    <span class=\"pigments-color-component\"><strong>B:</strong> " + (Math.round(color.blue)) + "</span>\n    <span class=\"pigments-color-component\"><strong>A:</strong> " + (Math.round(color.alpha * 1000) / 1000) + "</span>\n  </span>\n</div>\n<div class=\"pigments-color-details\">";
        for (j = 0, len1 = variables.length; j < len1; j++) {
          ref3 = variables[j], name = ref3.name, path = ref3.path, line = ref3.line, id = ref3.id;
          html += "<span class=\"pigments-color-occurence\">\n    <span class=\"name\">" + name + "</span>";
          if (path !== THEME_VARIABLES) {
            html += "<span data-variable-id=\"" + id + "\">\n  <span class=\"path\">" + (atom.project.relativize(path)) + "</span>\n  <span class=\"line\">at line " + (line + 1) + "</span>\n</span>";
          }
          html += '</span>';
        }
        html += '</div>';
        li.innerHTML = html;
        results1.push(container.appendChild(li));
      }
      return results1;
    };

    PaletteElement.prototype.checkForDuplicates = function(paletteColors) {
      var colors, findColor, i, key, len, map, results, v;
      results = [];
      if (this.mergeColorDuplicates) {
        map = new Map();
        colors = [];
        findColor = function(color) {
          var col, i, len;
          for (i = 0, len = colors.length; i < len; i++) {
            col = colors[i];
            if (typeof col.isEqual === "function" ? col.isEqual(color) : void 0) {
              return col;
            }
          }
        };
        for (i = 0, len = paletteColors.length; i < len; i++) {
          v = paletteColors[i];
          if (key = findColor(v.color)) {
            map.get(key).push(v);
          } else {
            map.set(v.color, [v]);
            colors.push(v.color);
          }
        }
        map.forEach(function(vars, color) {
          return results.push(vars);
        });
        return results;
      } else {
        return (function() {
          var j, len1, results1;
          results1 = [];
          for (j = 0, len1 = paletteColors.length; j < len1; j++) {
            v = paletteColors[j];
            results1.push([v]);
          }
          return results1;
        })();
      }
    };

    return PaletteElement;

  })(HTMLElement);

  module.exports = PaletteElement = registerOrUpdateElement('pigments-palette', PaletteElement.prototype);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3BhbGV0dGUtZWxlbWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVKQUFBO0lBQUE7OztFQUFBLE1BQTJELE9BQUEsQ0FBUSxZQUFSLENBQTNELEVBQUMsNkJBQUQsRUFBYyx1Q0FBZCxFQUFnQzs7RUFFaEMsT0FBeUUsRUFBekUsRUFBQyw2QkFBRCxFQUFzQix5QkFBdEIsRUFBdUMsa0JBQXZDLEVBQWlELGlCQUFqRCxFQUEwRDs7RUFFcEQ7Ozs7Ozs7SUFDSixXQUFXLENBQUMsV0FBWixDQUF3QixjQUF4Qjs7SUFDQSxnQkFBZ0IsQ0FBQyxXQUFqQixDQUE2QixjQUE3Qjs7SUFFQSxjQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7QUFDUixVQUFBO01BQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEI7TUFDUCxLQUFBLEdBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZCQUFoQjtNQUNSLEtBQUEsR0FBUSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsK0JBQWhCO01BQ1IsUUFBQSxHQUFXLFNBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxLQUFiO1FBQ1QsSUFBc0IsSUFBdEI7VUFBQSxLQUFNLENBQUEsSUFBQSxDQUFOLEdBQWMsS0FBZDs7ZUFDQTtNQUZTO2FBSVgsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sd0JBQVA7T0FBTCxFQUFzQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDcEMsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sbURBQVA7V0FBTCxFQUFpRSxTQUFBO21CQUMvRCxLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsQ0FBQSxLQUFB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bkRTTCwgRXZlbnRzRGVsZWdhdGlvbiwgcmVnaXN0ZXJPclVwZGF0ZUVsZW1lbnR9ID0gcmVxdWlyZSAnYXRvbS11dGlscydcblxuW0NvbXBvc2l0ZURpc3Bvc2FibGUsIFRIRU1FX1ZBUklBQkxFUywgcGlnbWVudHMsIFBhbGV0dGUsIFN0aWNreVRpdGxlXSA9IFtdXG5cbmNsYXNzIFBhbGV0dGVFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnRcbiAgU3BhY2VQZW5EU0wuaW5jbHVkZUludG8odGhpcylcbiAgRXZlbnRzRGVsZWdhdGlvbi5pbmNsdWRlSW50byh0aGlzKVxuXG4gIEBjb250ZW50OiAtPlxuICAgIHNvcnQgPSBhdG9tLmNvbmZpZy5nZXQoJ3BpZ21lbnRzLnNvcnRQYWxldHRlQ29sb3JzJylcbiAgICBncm91cCA9IGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuZ3JvdXBQYWxldHRlQ29sb3JzJylcbiAgICBtZXJnZSA9IGF0b20uY29uZmlnLmdldCgncGlnbWVudHMubWVyZ2VDb2xvckR1cGxpY2F0ZXMnKVxuICAgIG9wdEF0dHJzID0gKGJvb2wsIG5hbWUsIGF0dHJzKSAtPlxuICAgICAgYXR0cnNbbmFtZV0gPSBuYW1lIGlmIGJvb2xcbiAgICAgIGF0dHJzXG5cbiAgICBAZGl2IGNsYXNzOiAncGlnbWVudHMtcGFsZXR0ZS1wYW5lbCcsID0+XG4gICAgICBAZGl2IGNsYXNzOiAncGlnbWVudHMtcGFsZXR0ZS1jb250cm9scyBzZXR0aW5ncy12aWV3IHBhbmUtaXRlbScsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdwaWdtZW50cy1wYWxldHRlLWNvbnRyb2xzLXdyYXBwZXInLCA9PlxuICAgICAgICAgIEBzcGFuIGNsYXNzOiAnaW5wdXQtZ3JvdXAtaW5saW5lJywgPT5cbiAgICAgICAgICAgIEBsYWJlbCBmb3I6ICdzb3J0LXBhbGV0dGUtY29sb3JzJywgJ1NvcnQgQ29sb3JzJ1xuICAgICAgICAgICAgQHNlbGVjdCBvdXRsZXQ6ICdzb3J0JywgaWQ6ICdzb3J0LXBhbGV0dGUtY29sb3JzJywgPT5cbiAgICAgICAgICAgICAgQG9wdGlvbiBvcHRBdHRycyhzb3J0IGlzICdub25lJywgJ3NlbGVjdGVkJywgdmFsdWU6ICdub25lJyksICdOb25lJ1xuICAgICAgICAgICAgICBAb3B0aW9uIG9wdEF0dHJzKHNvcnQgaXMgJ2J5IG5hbWUnLCAnc2VsZWN0ZWQnLCB2YWx1ZTogJ2J5IG5hbWUnKSwgJ0J5IE5hbWUnXG4gICAgICAgICAgICAgIEBvcHRpb24gb3B0QXR0cnMoc29ydCBpcyAnYnkgZmlsZScsICdzZWxlY3RlZCcsIHZhbHVlOiAnYnkgY29sb3InKSwgJ0J5IENvbG9yJ1xuXG4gICAgICAgICAgQHNwYW4gY2xhc3M6ICdpbnB1dC1ncm91cC1pbmxpbmUnLCA9PlxuICAgICAgICAgICAgQGxhYmVsIGZvcjogJ3NvcnQtcGFsZXR0ZS1jb2xvcnMnLCAnR3JvdXAgQ29sb3JzJ1xuICAgICAgICAgICAgQHNlbGVjdCBvdXRsZXQ6ICdncm91cCcsIGlkOiAnZ3JvdXAtcGFsZXR0ZS1jb2xvcnMnLCA9PlxuICAgICAgICAgICAgICBAb3B0aW9uIG9wdEF0dHJzKGdyb3VwIGlzICdub25lJywgJ3NlbGVjdGVkJywgdmFsdWU6ICdub25lJyksICdOb25lJ1xuICAgICAgICAgICAgICBAb3B0aW9uIG9wdEF0dHJzKGdyb3VwIGlzICdieSBmaWxlJywgJ3NlbGVjdGVkJywgdmFsdWU6ICdieSBmaWxlJyksICdCeSBGaWxlJ1xuXG4gICAgICAgICAgQHNwYW4gY2xhc3M6ICdpbnB1dC1ncm91cC1pbmxpbmUnLCA9PlxuICAgICAgICAgICAgQGlucHV0IG9wdEF0dHJzIG1lcmdlLCAnY2hlY2tlZCcsIHR5cGU6ICdjaGVja2JveCcsIGlkOiAnbWVyZ2UtZHVwbGljYXRlcycsIG91dGxldDogJ21lcmdlJ1xuICAgICAgICAgICAgQGxhYmVsIGZvcjogJ21lcmdlLWR1cGxpY2F0ZXMnLCAnTWVyZ2UgRHVwbGljYXRlcydcblxuICAgICAgQGRpdiBjbGFzczogJ3BpZ21lbnRzLXBhbGV0dGUtbGlzdCBuYXRpdmUta2V5LWJpbmRpbmdzJywgdGFiaW5kZXg6IC0xLCA9PlxuICAgICAgICBAb2wgb3V0bGV0OiAnbGlzdCdcblxuICBjcmVhdGVkQ2FsbGJhY2s6IC0+XG4gICAgcGlnbWVudHMgPz0gcmVxdWlyZSAnLi9waWdtZW50cydcblxuICAgIEBwcm9qZWN0ID0gcGlnbWVudHMuZ2V0UHJvamVjdCgpXG5cbiAgICBpZiBAcHJvamVjdD9cbiAgICAgIEBpbml0KClcbiAgICBlbHNlXG4gICAgICBzdWJzY3JpcHRpb24gPSBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlIChwa2cpID0+XG4gICAgICAgIGlmIHBrZy5uYW1lIGlzICdwaWdtZW50cydcbiAgICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICAgICAgQHByb2plY3QgPSBwaWdtZW50cy5nZXRQcm9qZWN0KClcbiAgICAgICAgICBAaW5pdCgpXG5cbiAgaW5pdDogLT5cbiAgICByZXR1cm4gaWYgQHByb2plY3QuaXNEZXN0cm95ZWQoKVxuXG4gICAgQ29tcG9zaXRlRGlzcG9zYWJsZSA/PSByZXF1aXJlKCdhdG9tJykuQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAcHJvamVjdC5vbkRpZFVwZGF0ZVZhcmlhYmxlcyA9PlxuICAgICAgaWYgQHBhbGV0dGU/XG4gICAgICAgIEBwYWxldHRlLnZhcmlhYmxlcyA9IEBwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKClcbiAgICAgICAgQHJlbmRlckxpc3QoKSBpZiBAYXR0YWNoZWRcblxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3BpZ21lbnRzLnNvcnRQYWxldHRlQ29sb3JzJywgKEBzb3J0UGFsZXR0ZUNvbG9ycykgPT5cbiAgICAgIEByZW5kZXJMaXN0KCkgaWYgQHBhbGV0dGU/IGFuZCBAYXR0YWNoZWRcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdwaWdtZW50cy5ncm91cFBhbGV0dGVDb2xvcnMnLCAoQGdyb3VwUGFsZXR0ZUNvbG9ycykgPT5cbiAgICAgIEByZW5kZXJMaXN0KCkgaWYgQHBhbGV0dGU/IGFuZCBAYXR0YWNoZWRcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdwaWdtZW50cy5tZXJnZUNvbG9yRHVwbGljYXRlcycsIChAbWVyZ2VDb2xvckR1cGxpY2F0ZXMpID0+XG4gICAgICBAcmVuZGVyTGlzdCgpIGlmIEBwYWxldHRlPyBhbmQgQGF0dGFjaGVkXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHN1YnNjcmliZVRvIEBzb3J0LCAnY2hhbmdlJzogKGUpIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLnNvcnRQYWxldHRlQ29sb3JzJywgZS50YXJnZXQudmFsdWVcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAc3Vic2NyaWJlVG8gQGdyb3VwLCAnY2hhbmdlJzogKGUpIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLmdyb3VwUGFsZXR0ZUNvbG9ycycsIGUudGFyZ2V0LnZhbHVlXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHN1YnNjcmliZVRvIEBtZXJnZSwgJ2NoYW5nZSc6IChlKSAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5tZXJnZUNvbG9yRHVwbGljYXRlcycsIGUudGFyZ2V0LmNoZWNrZWRcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAc3Vic2NyaWJlVG8gQGxpc3QsICdbZGF0YS12YXJpYWJsZS1pZF0nLCAnY2xpY2snOiAoZSkgPT5cbiAgICAgIHZhcmlhYmxlSWQgPSBOdW1iZXIoZS50YXJnZXQuZGF0YXNldC52YXJpYWJsZUlkKVxuICAgICAgdmFyaWFibGUgPSBAcHJvamVjdC5nZXRWYXJpYWJsZUJ5SWQodmFyaWFibGVJZClcblxuICAgICAgQHByb2plY3Quc2hvd1ZhcmlhYmxlSW5GaWxlKHZhcmlhYmxlKVxuXG4gIGF0dGFjaGVkQ2FsbGJhY2s6IC0+XG4gICAgQHJlbmRlckxpc3QoKSBpZiBAcGFsZXR0ZT9cbiAgICBAYXR0YWNoZWQgPSB0cnVlXG5cbiAgZGV0YWNoZWRDYWxsYmFjazogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAYXR0YWNoZWQgPSBmYWxzZVxuXG4gIGdldE1vZGVsOiAtPiBAcGFsZXR0ZVxuXG4gIHNldE1vZGVsOiAoQHBhbGV0dGUpIC0+IEByZW5kZXJMaXN0KCkgaWYgQGF0dGFjaGVkXG5cbiAgZ2V0Q29sb3JzTGlzdDogKHBhbGV0dGUpIC0+XG4gICAgc3dpdGNoIEBzb3J0UGFsZXR0ZUNvbG9yc1xuICAgICAgd2hlbiAnYnkgY29sb3InIHRoZW4gcGFsZXR0ZS5zb3J0ZWRCeUNvbG9yKClcbiAgICAgIHdoZW4gJ2J5IG5hbWUnIHRoZW4gcGFsZXR0ZS5zb3J0ZWRCeU5hbWUoKVxuICAgICAgZWxzZSBwYWxldHRlLnZhcmlhYmxlcy5zbGljZSgpXG5cbiAgcmVuZGVyTGlzdDogLT5cbiAgICBAc3RpY2t5VGl0bGU/LmRpc3Bvc2UoKVxuICAgIEBsaXN0LmlubmVySFRNTCA9ICcnXG5cbiAgICBpZiBAZ3JvdXBQYWxldHRlQ29sb3JzIGlzICdieSBmaWxlJ1xuICAgICAgU3RpY2t5VGl0bGUgPz0gcmVxdWlyZSAnLi9zdGlja3ktdGl0bGUnXG5cbiAgICAgIHBhbGV0dGVzID0gQGdldEZpbGVzUGFsZXR0ZXMoKVxuICAgICAgZm9yIGZpbGUsIHBhbGV0dGUgb2YgcGFsZXR0ZXNcbiAgICAgICAgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gICAgICAgIGxpLmNsYXNzTmFtZSA9ICdwaWdtZW50cy1jb2xvci1ncm91cCdcbiAgICAgICAgb2wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvbCcpXG5cbiAgICAgICAgbGkuYXBwZW5kQ2hpbGQgQGdldEdyb3VwSGVhZGVyKGF0b20ucHJvamVjdC5yZWxhdGl2aXplKGZpbGUpKVxuICAgICAgICBsaS5hcHBlbmRDaGlsZCBvbFxuICAgICAgICBAYnVpbGRMaXN0KG9sLCBAZ2V0Q29sb3JzTGlzdChwYWxldHRlKSlcbiAgICAgICAgQGxpc3QuYXBwZW5kQ2hpbGQobGkpXG5cbiAgICAgIEBzdGlja3lUaXRsZSA9IG5ldyBTdGlja3lUaXRsZShcbiAgICAgICAgQGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLnBpZ21lbnRzLWNvbG9yLWdyb3VwLWhlYWRlci1jb250ZW50JyksXG4gICAgICAgIEBxdWVyeVNlbGVjdG9yKCcucGlnbWVudHMtcGFsZXR0ZS1saXN0JylcbiAgICAgIClcbiAgICBlbHNlXG4gICAgICBAYnVpbGRMaXN0KEBsaXN0LCBAZ2V0Q29sb3JzTGlzdChAcGFsZXR0ZSkpXG5cbiAgZ2V0R3JvdXBIZWFkZXI6IChsYWJlbCkgLT5cbiAgICBUSEVNRV9WQVJJQUJMRVMgPz0gcmVxdWlyZSgnLi91cmlzJykuVEhFTUVfVkFSSUFCTEVTXG5cbiAgICBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGhlYWRlci5jbGFzc05hbWUgPSAncGlnbWVudHMtY29sb3ItZ3JvdXAtaGVhZGVyJ1xuXG4gICAgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgY29udGVudC5jbGFzc05hbWUgPSAncGlnbWVudHMtY29sb3ItZ3JvdXAtaGVhZGVyLWNvbnRlbnQnXG4gICAgaWYgbGFiZWwgaXMgVEhFTUVfVkFSSUFCTEVTXG4gICAgICBjb250ZW50LnRleHRDb250ZW50ID0gJ0F0b20gVGhlbWVzJ1xuICAgIGVsc2VcbiAgICAgIGNvbnRlbnQudGV4dENvbnRlbnQgPSBsYWJlbFxuXG4gICAgaGVhZGVyLmFwcGVuZENoaWxkKGNvbnRlbnQpXG4gICAgaGVhZGVyXG5cbiAgZ2V0RmlsZXNQYWxldHRlczogLT5cbiAgICBQYWxldHRlID89IHJlcXVpcmUgJy4vcGFsZXR0ZSdcblxuICAgIHBhbGV0dGVzID0ge31cblxuICAgIEBwYWxldHRlLmVhY2hDb2xvciAodmFyaWFibGUpID0+XG4gICAgICB7cGF0aH0gPSB2YXJpYWJsZVxuXG4gICAgICBwYWxldHRlc1twYXRoXSA/PSBuZXcgUGFsZXR0ZSBbXVxuICAgICAgcGFsZXR0ZXNbcGF0aF0udmFyaWFibGVzLnB1c2godmFyaWFibGUpXG5cbiAgICBwYWxldHRlc1xuXG4gIGJ1aWxkTGlzdDogKGNvbnRhaW5lciwgcGFsZXR0ZUNvbG9ycykgLT5cbiAgICBUSEVNRV9WQVJJQUJMRVMgPz0gcmVxdWlyZSgnLi91cmlzJykuVEhFTUVfVkFSSUFCTEVTXG5cbiAgICBwYWxldHRlQ29sb3JzID0gQGNoZWNrRm9yRHVwbGljYXRlcyhwYWxldHRlQ29sb3JzKVxuICAgIGZvciB2YXJpYWJsZXMgaW4gcGFsZXR0ZUNvbG9yc1xuICAgICAgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gICAgICBsaS5jbGFzc05hbWUgPSAncGlnbWVudHMtY29sb3ItaXRlbSdcbiAgICAgIHtjb2xvciwgaXNBbHRlcm5hdGV9ID0gdmFyaWFibGVzWzBdXG5cbiAgICAgIGNvbnRpbnVlIGlmIGlzQWx0ZXJuYXRlXG4gICAgICBjb250aW51ZSB1bmxlc3MgY29sb3IudG9DU1M/XG5cbiAgICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9XCJwaWdtZW50cy1jb2xvclwiPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInBpZ21lbnRzLWNvbG9yLXByZXZpZXdcIlxuICAgICAgICAgICAgICBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6ICN7Y29sb3IudG9DU1MoKX1cIj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInBpZ21lbnRzLWNvbG9yLXByb3BlcnRpZXNcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cInBpZ21lbnRzLWNvbG9yLWNvbXBvbmVudFwiPjxzdHJvbmc+Ujo8L3N0cm9uZz4gI3tNYXRoLnJvdW5kIGNvbG9yLnJlZH08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJwaWdtZW50cy1jb2xvci1jb21wb25lbnRcIj48c3Ryb25nPkc6PC9zdHJvbmc+ICN7TWF0aC5yb3VuZCBjb2xvci5ncmVlbn08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJwaWdtZW50cy1jb2xvci1jb21wb25lbnRcIj48c3Ryb25nPkI6PC9zdHJvbmc+ICN7TWF0aC5yb3VuZCBjb2xvci5ibHVlfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cInBpZ21lbnRzLWNvbG9yLWNvbXBvbmVudFwiPjxzdHJvbmc+QTo8L3N0cm9uZz4gI3tNYXRoLnJvdW5kKGNvbG9yLmFscGhhICogMTAwMCkgLyAxMDAwfTwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwicGlnbWVudHMtY29sb3ItZGV0YWlsc1wiPlxuICAgICAgXCJcIlwiXG5cbiAgICAgIGZvciB7bmFtZSwgcGF0aCwgbGluZSwgaWR9IGluIHZhcmlhYmxlc1xuICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICA8c3BhbiBjbGFzcz1cInBpZ21lbnRzLWNvbG9yLW9jY3VyZW5jZVwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJuYW1lXCI+I3tuYW1lfTwvc3Bhbj5cbiAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaWYgcGF0aCBpc250IFRIRU1FX1ZBUklBQkxFU1xuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgPHNwYW4gZGF0YS12YXJpYWJsZS1pZD1cIiN7aWR9XCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInBhdGhcIj4je2F0b20ucHJvamVjdC5yZWxhdGl2aXplKHBhdGgpfTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGluZVwiPmF0IGxpbmUgI3tsaW5lICsgMX08L3NwYW4+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGh0bWwgKz0gJzwvc3Bhbj4nXG5cbiAgICAgIGh0bWwgKz0gJzwvZGl2PidcblxuICAgICAgbGkuaW5uZXJIVE1MID0gaHRtbFxuXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobGkpXG5cbiAgY2hlY2tGb3JEdXBsaWNhdGVzOiAocGFsZXR0ZUNvbG9ycykgLT5cbiAgICByZXN1bHRzID0gW11cbiAgICBpZiBAbWVyZ2VDb2xvckR1cGxpY2F0ZXNcbiAgICAgIG1hcCA9IG5ldyBNYXAoKVxuXG4gICAgICBjb2xvcnMgPSBbXVxuXG4gICAgICBmaW5kQ29sb3IgPSAoY29sb3IpIC0+XG4gICAgICAgIHJldHVybiBjb2wgZm9yIGNvbCBpbiBjb2xvcnMgd2hlbiBjb2wuaXNFcXVhbD8oY29sb3IpXG5cbiAgICAgIGZvciB2IGluIHBhbGV0dGVDb2xvcnNcbiAgICAgICAgaWYga2V5ID0gZmluZENvbG9yKHYuY29sb3IpXG4gICAgICAgICAgbWFwLmdldChrZXkpLnB1c2godilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG1hcC5zZXQodi5jb2xvciwgW3ZdKVxuICAgICAgICAgIGNvbG9ycy5wdXNoKHYuY29sb3IpXG5cbiAgICAgIG1hcC5mb3JFYWNoICh2YXJzLCBjb2xvcikgLT4gcmVzdWx0cy5wdXNoIHZhcnNcblxuICAgICAgcmV0dXJuIHJlc3VsdHNcbiAgICBlbHNlXG4gICAgICByZXR1cm4gKFt2XSBmb3IgdiBpbiBwYWxldHRlQ29sb3JzKVxuXG5cbm1vZHVsZS5leHBvcnRzID1cblBhbGV0dGVFbGVtZW50ID1cbnJlZ2lzdGVyT3JVcGRhdGVFbGVtZW50ICdwaWdtZW50cy1wYWxldHRlJywgUGFsZXR0ZUVsZW1lbnQucHJvdG90eXBlXG4iXX0=
