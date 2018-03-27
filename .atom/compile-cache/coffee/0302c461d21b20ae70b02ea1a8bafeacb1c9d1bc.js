(function() {
  var CompositeDisposable, EventsDelegation, Palette, PaletteElement, SpacePenDSL, StickyTitle, THEME_VARIABLES, pigments, registerOrUpdateElement, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-utils'), SpacePenDSL = _ref.SpacePenDSL, EventsDelegation = _ref.EventsDelegation, registerOrUpdateElement = _ref.registerOrUpdateElement;

  _ref1 = [], CompositeDisposable = _ref1[0], THEME_VARIABLES = _ref1[1], pigments = _ref1[2], Palette = _ref1[3], StickyTitle = _ref1[4];

  PaletteElement = (function(_super) {
    __extends(PaletteElement, _super);

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

    PaletteElement.prototype.setModel = function(palette) {
      this.palette = palette;
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
      var file, li, ol, palette, palettes, _ref2;
      if ((_ref2 = this.stickyTitle) != null) {
        _ref2.dispose();
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
      var color, html, id, li, line, name, path, variables, _i, _j, _len, _len1, _ref2, _results;
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      paletteColors = this.checkForDuplicates(paletteColors);
      _results = [];
      for (_i = 0, _len = paletteColors.length; _i < _len; _i++) {
        variables = paletteColors[_i];
        li = document.createElement('li');
        li.className = 'pigments-color-item';
        color = variables[0].color;
        if (color.toCSS == null) {
          continue;
        }
        html = "<div class=\"pigments-color\">\n  <span class=\"pigments-color-preview\"\n        style=\"background-color: " + (color.toCSS()) + "\">\n  </span>\n  <span class=\"pigments-color-properties\">\n    <span class=\"pigments-color-component\"><strong>R:</strong> " + (Math.round(color.red)) + "</span>\n    <span class=\"pigments-color-component\"><strong>G:</strong> " + (Math.round(color.green)) + "</span>\n    <span class=\"pigments-color-component\"><strong>B:</strong> " + (Math.round(color.blue)) + "</span>\n    <span class=\"pigments-color-component\"><strong>A:</strong> " + (Math.round(color.alpha * 1000) / 1000) + "</span>\n  </span>\n</div>\n<div class=\"pigments-color-details\">";
        for (_j = 0, _len1 = variables.length; _j < _len1; _j++) {
          _ref2 = variables[_j], name = _ref2.name, path = _ref2.path, line = _ref2.line, id = _ref2.id;
          html += "<span class=\"pigments-color-occurence\">\n    <span class=\"name\">" + name + "</span>";
          if (path !== THEME_VARIABLES) {
            html += "<span data-variable-id=\"" + id + "\">\n  <span class=\"path\">" + (atom.project.relativize(path)) + "</span>\n  <span class=\"line\">at line " + (line + 1) + "</span>\n</span>";
          }
          html += '</span>';
        }
        html += '</div>';
        li.innerHTML = html;
        _results.push(container.appendChild(li));
      }
      return _results;
    };

    PaletteElement.prototype.checkForDuplicates = function(paletteColors) {
      var colors, findColor, key, map, results, v, _i, _len;
      results = [];
      if (this.mergeColorDuplicates) {
        map = new Map();
        colors = [];
        findColor = function(color) {
          var col, _i, _len;
          for (_i = 0, _len = colors.length; _i < _len; _i++) {
            col = colors[_i];
            if (typeof col.isEqual === "function" ? col.isEqual(color) : void 0) {
              return col;
            }
          }
        };
        for (_i = 0, _len = paletteColors.length; _i < _len; _i++) {
          v = paletteColors[_i];
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
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = paletteColors.length; _j < _len1; _j++) {
            v = paletteColors[_j];
            _results.push([v]);
          }
          return _results;
        })();
      }
    };

    return PaletteElement;

  })(HTMLElement);

  module.exports = PaletteElement = registerOrUpdateElement('pigments-palette', PaletteElement.prototype);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3BhbGV0dGUtZWxlbWVudC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseUpBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE9BQTJELE9BQUEsQ0FBUSxZQUFSLENBQTNELEVBQUMsbUJBQUEsV0FBRCxFQUFjLHdCQUFBLGdCQUFkLEVBQWdDLCtCQUFBLHVCQUFoQyxDQUFBOztBQUFBLEVBRUEsUUFBeUUsRUFBekUsRUFBQyw4QkFBRCxFQUFzQiwwQkFBdEIsRUFBdUMsbUJBQXZDLEVBQWlELGtCQUFqRCxFQUEwRCxzQkFGMUQsQ0FBQTs7QUFBQSxFQUlNO0FBQ0oscUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsV0FBVyxDQUFDLFdBQVosQ0FBd0IsY0FBeEIsQ0FBQSxDQUFBOztBQUFBLElBQ0EsZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsY0FBN0IsQ0FEQSxDQUFBOztBQUFBLElBR0EsY0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7QUFDUixVQUFBLDRCQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixDQUFQLENBQUE7QUFBQSxNQUNBLEtBQUEsR0FBUSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkJBQWhCLENBRFIsQ0FBQTtBQUFBLE1BRUEsS0FBQSxHQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwrQkFBaEIsQ0FGUixDQUFBO0FBQUEsTUFHQSxRQUFBLEdBQVcsU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLEtBQWIsR0FBQTtBQUNULFFBQUEsSUFBc0IsSUFBdEI7QUFBQSxVQUFBLEtBQU0sQ0FBQSxJQUFBLENB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/palette-element.coffee
