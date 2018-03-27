(function() {
  var ColorProjectElement, CompositeDisposable, EventsDelegation, SpacePenDSL, capitalize, registerOrUpdateElement, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-utils'), SpacePenDSL = _ref.SpacePenDSL, EventsDelegation = _ref.EventsDelegation, registerOrUpdateElement = _ref.registerOrUpdateElement;

  CompositeDisposable = null;

  capitalize = function(s) {
    return s.replace(/^./, function(m) {
      return m.toUpperCase();
    });
  };

  ColorProjectElement = (function(_super) {
    __extends(ColorProjectElement, _super);

    function ColorProjectElement() {
      return ColorProjectElement.__super__.constructor.apply(this, arguments);
    }

    SpacePenDSL.includeInto(ColorProjectElement);

    EventsDelegation.includeInto(ColorProjectElement);

    ColorProjectElement.content = function() {
      var arrayField, booleanField, selectField;
      arrayField = (function(_this) {
        return function(name, label, setting, description) {
          var settingName;
          settingName = "pigments." + name;
          return _this.div({
            "class": 'control-group array'
          }, function() {
            return _this.div({
              "class": 'controls'
            }, function() {
              _this.label({
                "class": 'control-label'
              }, function() {
                return _this.span({
                  "class": 'setting-title'
                }, label);
              });
              return _this.div({
                "class": 'control-wrapper'
              }, function() {
                _this.tag('atom-text-editor', {
                  mini: true,
                  outlet: name,
                  type: 'array',
                  property: name
                });
                return _this.div({
                  "class": 'setting-description'
                }, function() {
                  _this.div(function() {
                    _this.raw("Global config: <code>" + (atom.config.get(setting != null ? setting : settingName).join(', ')) + "</code>");
                    if (description != null) {
                      return _this.p(function() {
                        return _this.raw(description);
                      });
                    }
                  });
                  return booleanField("ignoreGlobal" + (capitalize(name)), 'Ignore Global', null, true);
                });
              });
            });
          });
        };
      })(this);
      selectField = (function(_this) {
        return function(name, label, _arg) {
          var description, options, setting, settingName, useBoolean, _ref1;
          _ref1 = _arg != null ? _arg : {}, options = _ref1.options, setting = _ref1.setting, description = _ref1.description, useBoolean = _ref1.useBoolean;
          settingName = "pigments." + name;
          return _this.div({
            "class": 'control-group array'
          }, function() {
            return _this.div({
              "class": 'controls'
            }, function() {
              _this.label({
                "class": 'control-label'
              }, function() {
                return _this.span({
                  "class": 'setting-title'
                }, label);
              });
              return _this.div({
                "class": 'control-wrapper'
              }, function() {
                _this.select({
                  outlet: name,
                  "class": 'form-control',
                  required: true
                }, function() {
                  return options.forEach(function(option) {
                    if (option === '') {
                      return _this.option({
                        value: option
                      }, 'Use global config');
                    } else {
                      return _this.option({
                        value: option
                      }, capitalize(option));
                    }
                  });
                });
                return _this.div({
                  "class": 'setting-description'
                }, function() {
                  _this.div(function() {
                    _this.raw("Global config: <code>" + (atom.config.get(setting != null ? setting : settingName)) + "</code>");
                    if (description != null) {
                      return _this.p(function() {
                        return _this.raw(description);
                      });
                    }
                  });
                  if (useBoolean) {
                    return booleanField("ignoreGlobal" + (capitalize(name)), 'Ignore Global', null, true);
                  }
                });
              });
            });
          });
        };
      })(this);
      booleanField = (function(_this) {
        return function(name, label, description, nested) {
          return _this.div({
            "class": 'control-group boolean'
          }, function() {
            return _this.div({
              "class": 'controls'
            }, function() {
              _this.input({
                type: 'checkbox',
                id: "pigments-" + name,
                outlet: name
              });
              _this.label({
                "class": 'control-label',
                "for": "pigments-" + name
              }, function() {
                return _this.span({
                  "class": (nested ? 'setting-description' : 'setting-title')
                }, label);
              });
              if (description != null) {
                return _this.div({
                  "class": 'setting-description'
                }, function() {
                  return _this.raw(description);
                });
              }
            });
          });
        };
      })(this);
      return this.section({
        "class": 'settings-view pane-item'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'settings-wrapper'
          }, function() {
            _this.div({
              "class": 'header'
            }, function() {
              _this.div({
                "class": 'logo'
              }, function() {
                return _this.img({
                  src: 'atom://pigments/resources/logo.svg',
                  width: 140,
                  height: 35
                });
              });
              return _this.p({
                "class": 'setting-description'
              }, "These settings apply on the current project only and are complementary\nto the package settings.");
            });
            return _this.div({
              "class": 'fields'
            }, function() {
              var themes;
              themes = atom.themes.getActiveThemeNames();
              arrayField('sourceNames', 'Source Names');
              arrayField('ignoredNames', 'Ignored Names');
              arrayField('supportedFiletypes', 'Supported Filetypes');
              arrayField('ignoredScopes', 'Ignored Scopes');
              arrayField('searchNames', 'Extended Search Names', 'pigments.extendedSearchNames');
              selectField('sassShadeAndTintImplementation', 'Sass Shade And Tint Implementation', {
                options: ['', 'compass', 'bourbon'],
                setting: 'pigments.sassShadeAndTintImplementation',
                description: "Sass doesn't provide any implementation for shade and tint function, and Compass and Bourbon have different implementation for these two methods. This setting allow you to chose which implementation use."
              });
              return booleanField('includeThemes', 'Include Atom Themes Stylesheets', "The variables from <code>" + themes[0] + "</code> and\n<code>" + themes[1] + "</code> themes will be automatically added to the\nproject palette.");
            });
          });
        };
      })(this));
    };

    ColorProjectElement.prototype.createdCallback = function() {
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      return this.subscriptions = new CompositeDisposable;
    };

    ColorProjectElement.prototype.setModel = function(project) {
      this.project = project;
      return this.initializeBindings();
    };

    ColorProjectElement.prototype.initializeBindings = function() {
      var grammar;
      grammar = atom.grammars.grammarForScopeName('source.js.regexp');
      this.ignoredScopes.getModel().setGrammar(grammar);
      this.initializeTextEditor('sourceNames');
      this.initializeTextEditor('searchNames');
      this.initializeTextEditor('ignoredNames');
      this.initializeTextEditor('ignoredScopes');
      this.initializeTextEditor('supportedFiletypes');
      this.initializeCheckbox('includeThemes');
      this.initializeCheckbox('ignoreGlobalSourceNames');
      this.initializeCheckbox('ignoreGlobalIgnoredNames');
      this.initializeCheckbox('ignoreGlobalIgnoredScopes');
      this.initializeCheckbox('ignoreGlobalSearchNames');
      this.initializeCheckbox('ignoreGlobalSupportedFiletypes');
      return this.initializeSelect('sassShadeAndTintImplementation');
    };

    ColorProjectElement.prototype.initializeTextEditor = function(name) {
      var capitalizedName, editor, _ref1;
      capitalizedName = capitalize(name);
      editor = this[name].getModel();
      editor.setText(((_ref1 = this.project[name]) != null ? _ref1 : []).join(', '));
      return this.subscriptions.add(editor.onDidStopChanging((function(_this) {
        return function() {
          var array;
          array = editor.getText().split(/\s*,\s*/g).filter(function(s) {
            return s.length > 0;
          });
          return _this.project["set" + capitalizedName](array);
        };
      })(this)));
    };

    ColorProjectElement.prototype.initializeSelect = function(name) {
      var capitalizedName, optionValues, select;
      capitalizedName = capitalize(name);
      select = this[name];
      optionValues = [].slice.call(select.querySelectorAll('option')).map(function(o) {
        return o.value;
      });
      if (this.project[name]) {
        select.selectedIndex = optionValues.indexOf(this.project[name]);
      }
      return this.subscriptions.add(this.subscribeTo(select, {
        change: (function(_this) {
          return function() {
            var value, _ref1;
            value = (_ref1 = select.selectedOptions[0]) != null ? _ref1.value : void 0;
            return _this.project["set" + capitalizedName](value === '' ? null : value);
          };
        })(this)
      }));
    };

    ColorProjectElement.prototype.initializeCheckbox = function(name) {
      var capitalizedName, checkbox;
      capitalizedName = capitalize(name);
      checkbox = this[name];
      checkbox.checked = this.project[name];
      return this.subscriptions.add(this.subscribeTo(checkbox, {
        change: (function(_this) {
          return function() {
            return _this.project["set" + capitalizedName](checkbox.checked);
          };
        })(this)
      }));
    };

    ColorProjectElement.prototype.getTitle = function() {
      return 'Project Settings';
    };

    ColorProjectElement.prototype.getURI = function() {
      return 'pigments://settings';
    };

    ColorProjectElement.prototype.getIconName = function() {
      return "pigments";
    };

    ColorProjectElement.prototype.serialize = function() {
      return {
        deserializer: 'ColorProjectElement'
      };
    };

    return ColorProjectElement;

  })(HTMLElement);

  module.exports = ColorProjectElement = registerOrUpdateElement('pigments-color-project', ColorProjectElement.prototype);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLXByb2plY3QtZWxlbWVudC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0hBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE9BQTJELE9BQUEsQ0FBUSxZQUFSLENBQTNELEVBQUMsbUJBQUEsV0FBRCxFQUFjLHdCQUFBLGdCQUFkLEVBQWdDLCtCQUFBLHVCQUFoQyxDQUFBOztBQUFBLEVBQ0EsbUJBQUEsR0FBc0IsSUFEdEIsQ0FBQTs7QUFBQSxFQUdBLFVBQUEsR0FBYSxTQUFDLENBQUQsR0FBQTtXQUFPLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBVixFQUFnQixTQUFDLENBQUQsR0FBQTthQUFPLENBQUMsQ0FBQyxXQUFGLENBQUEsRUFBUDtJQUFBLENBQWhCLEVBQVA7RUFBQSxDQUhiLENBQUE7O0FBQUEsRUFLTTtBQUNKLDBDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFdBQVcsQ0FBQyxXQUFaLENBQXdCLG1CQUF4QixDQUFBLENBQUE7O0FBQUEsSUFDQSxnQkFBZ0IsQ0FBQyxXQUFqQixDQUE2QixtQkFBN0IsQ0FEQSxDQUFBOztBQUFBLElBR0EsbUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO0FBQ1IsVUFBQSxxQ0FBQTtBQUFBLE1BQUEsVUFBQSxHQUFhLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsRUFBTyxLQUFQLEVBQWMsT0FBZCxFQUF1QixXQUF2QixHQUFBO0FBQ1gsY0FBQSxXQUFBO0FBQUEsVUFBQSxXQUFBLEdBQWUsV0FBQSxHQUFXLElBQTFCLENBQUE7aUJBRUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLHFCQUFQO1dBQUwsRUFB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-project-element.coffee
