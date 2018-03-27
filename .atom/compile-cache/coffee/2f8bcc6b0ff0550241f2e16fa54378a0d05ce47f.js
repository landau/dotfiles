(function() {
  var ColorProjectElement, CompositeDisposable, EventsDelegation, SpacePenDSL, capitalize, registerOrUpdateElement, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require('atom-utils'), SpacePenDSL = _ref.SpacePenDSL, EventsDelegation = _ref.EventsDelegation, registerOrUpdateElement = _ref.registerOrUpdateElement;

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
        deserializer: this.constructor.name
      };
    };

    return ColorProjectElement;

  })(HTMLElement);

  module.exports = ColorProjectElement = registerOrUpdateElement('pigments-color-project', ColorProjectElement.prototype);

  ColorProjectElement.deserialize = function(state) {
    var element;
    element = new ColorProjectElement;
    element.setModel(atom.packages.getActivePackage('pigments').mainModule.getProject());
    return element;
  };

  ColorProjectElement.registerViewProvider = function(modelClass) {
    return atom.views.addViewProvider(modelClass, function(model) {
      var element;
      element = new ColorProjectElement;
      element.setModel(model);
      return element;
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLXByb2plY3QtZWxlbWVudC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0hBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsT0FBMkQsT0FBQSxDQUFRLFlBQVIsQ0FBM0QsRUFBQyxtQkFBQSxXQUFELEVBQWMsd0JBQUEsZ0JBQWQsRUFBZ0MsK0JBQUEsdUJBRGhDLENBQUE7O0FBQUEsRUFHQSxVQUFBLEdBQWEsU0FBQyxDQUFELEdBQUE7V0FBTyxDQUFDLENBQUMsT0FBRixDQUFVLElBQVYsRUFBZ0IsU0FBQyxDQUFELEdBQUE7YUFBTyxDQUFDLENBQUMsV0FBRixDQUFBLEVBQVA7SUFBQSxDQUFoQixFQUFQO0VBQUEsQ0FIYixDQUFBOztBQUFBLEVBS007QUFDSiwwQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxXQUFXLENBQUMsV0FBWixDQUF3QixtQkFBeEIsQ0FBQSxDQUFBOztBQUFBLElBQ0EsZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsbUJBQTdCLENBREEsQ0FBQTs7QUFBQSxJQUdBLG1CQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTtBQUNSLFVBQUEscUNBQUE7QUFBQSxNQUFBLFVBQUEsR0FBYSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEVBQU8sS0FBUCxFQUFjLE9BQWQsRUFBdUIsV0FBdkIsR0FBQTtBQUNYLGNBQUEsV0FBQTtBQUFBLFVBQUEsV0FBQSxHQUFlLFdBQUEsR0FBVyxJQUExQixDQUFBO2lCQUVBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxxQkFBUDtXQUFMLEVBQW1DLFNBQUEsR0FBQTttQkFDakMsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsT0FBQSxFQUFPLFVBQVA7YUFBTCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsY0FBQSxLQUFDLENBQUEsS0FBRCxDQUFPO0FBQUEsZ0JBQUEsT0FBQSxFQUFPLGVBQVA7ZUFBUCxFQUErQixTQUFBLEdBQUE7dUJBQzdCLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxrQkFBQSxPQUFBLEVBQU8sZUFBUDtpQkFBTixFQUE4QixLQUE5QixFQUQ2QjtjQUFBLENBQS9CLENBQUEsQ0FBQTtxQkFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsZ0JBQUEsT0FBQSxFQUFPLGlCQUFQO2VBQUwsRUFBK0IsU0FBQSxHQUFBO0FBQzdCLGdCQUFBLEtBQUMsQ0FBQSxHQUFELENBQUssa0JBQUwsRUFBeUI7QUFBQSxrQkFBQSxJQUFBLEVBQU0sSUFBTjtBQUFBLGtCQUFZLE1BQUEsRUFBUSxJQUFwQjtBQUFBLGtCQUEwQixJQUFBLEVBQU0sT0FBaEM7QUFBQSxrQkFBeUMsUUFBQSxFQUFVLElBQW5EO2lCQUF6QixDQUFBLENBQUE7dUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGtCQUFBLE9BQUEsRUFBTyxxQkFBUDtpQkFBTCxFQUFtQyxTQUFBLEdBQUE7QUFDakMsa0JBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSyxTQUFBLEdBQUE7QUFDSCxvQkFBQSxLQUFDLENBQUEsR0FBRCxDQUFNLHVCQUFBLEdBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLG1CQUFnQixVQUFVLFdBQTFCLENBQXNDLENBQUMsSUFBdkMsQ0FBNEMsSUFBNUMsQ0FBRCxDQUF0QixHQUF5RSxTQUEvRSxDQUFBLENBQUE7QUFFQSxvQkFBQSxJQUEyQixtQkFBM0I7NkJBQUEsS0FBQyxDQUFBLENBQUQsQ0FBRyxTQUFBLEdBQUE7K0JBQUcsS0FBQyxDQUFBLEdBQUQsQ0FBSyxXQUFMLEVBQUg7c0JBQUEsQ0FBSCxFQUFBO3FCQUhHO2tCQUFBLENBQUwsQ0FBQSxDQUFBO3lCQUtBLFlBQUEsQ0FBYyxjQUFBLEdBQWEsQ0FBQyxVQUFBLENBQVcsSUFBWCxDQUFELENBQTNCLEVBQStDLGVBQS9DLEVBQWdFLElBQWhFLEVBQXNFLElBQXRFLEVBTmlDO2dCQUFBLENBQW5DLEVBRjZCO2NBQUEsQ0FBL0IsRUFKc0I7WUFBQSxDQUF4QixFQURpQztVQUFBLENBQW5DLEVBSFc7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFiLENBQUE7QUFBQSxNQWtCQSxXQUFBLEdBQWMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxFQUFPLEtBQVAsRUFBYyxJQUFkLEdBQUE7QUFDWixjQUFBLDZEQUFBO0FBQUEsaUNBRDBCLE9BQTRDLElBQTNDLGdCQUFBLFNBQVMsZ0JBQUEsU0FBUyxvQkFBQSxhQUFhLG1CQUFBLFVBQzFELENBQUE7QUFBQSxVQUFBLFdBQUEsR0FBZSxXQUFBLEdBQVcsSUFBMUIsQ0FBQTtpQkFFQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8scUJBQVA7V0FBTCxFQUFtQyxTQUFBLEdBQUE7bUJBQ2pDLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxjQUFBLE9BQUEsRUFBTyxVQUFQO2FBQUwsRUFBd0IsU0FBQSxHQUFBO0FBQ3RCLGNBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTztBQUFBLGdCQUFBLE9BQUEsRUFBTyxlQUFQO2VBQVAsRUFBK0IsU0FBQSxHQUFBO3VCQUM3QixLQUFDLENBQUEsSUFBRCxDQUFNO0FBQUEsa0JBQUEsT0FBQSxFQUFPLGVBQVA7aUJBQU4sRUFBOEIsS0FBOUIsRUFENkI7Y0FBQSxDQUEvQixDQUFBLENBQUE7cUJBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGdCQUFBLE9BQUEsRUFBTyxpQkFBUDtlQUFMLEVBQStCLFNBQUEsR0FBQTtBQUM3QixnQkFBQSxLQUFDLENBQUEsTUFBRCxDQUFRO0FBQUEsa0JBQUEsTUFBQSxFQUFRLElBQVI7QUFBQSxrQkFBYyxPQUFBLEVBQU8sY0FBckI7QUFBQSxrQkFBcUMsUUFBQSxFQUFVLElBQS9DO2lCQUFSLEVBQTZELFNBQUEsR0FBQTt5QkFDM0QsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsU0FBQyxNQUFELEdBQUE7QUFDZCxvQkFBQSxJQUFHLE1BQUEsS0FBVSxFQUFiOzZCQUNFLEtBQUMsQ0FBQSxNQUFELENBQVE7QUFBQSx3QkFBQSxLQUFBLEVBQU8sTUFBUDt1QkFBUixFQUF1QixtQkFBdkIsRUFERjtxQkFBQSxNQUFBOzZCQUdFLEtBQUMsQ0FBQSxNQUFELENBQVE7QUFBQSx3QkFBQSxLQUFBLEVBQU8sTUFBUDt1QkFBUixFQUF1QixVQUFBLENBQVcsTUFBWCxDQUF2QixFQUhGO3FCQURjO2tCQUFBLENBQWhCLEVBRDJEO2dCQUFBLENBQTdELENBQUEsQ0FBQTt1QkFPQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsa0JBQUEsT0FBQSxFQUFPLHFCQUFQO2lCQUFMLEVBQW1DLFNBQUEsR0FBQTtBQUNqQyxrQkFBQSxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUEsR0FBQTtBQUNILG9CQUFBLEtBQUMsQ0FBQSxHQUFELENBQU0sdUJBQUEsR0FBc0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosbUJBQWdCLFVBQVUsV0FBMUIsQ0FBRCxDQUF0QixHQUE4RCxTQUFwRSxDQUFBLENBQUE7QUFFQSxvQkFBQSxJQUEyQixtQkFBM0I7NkJBQUEsS0FBQyxDQUFBLENBQUQsQ0FBRyxTQUFBLEdBQUE7K0JBQUcsS0FBQyxDQUFBLEdBQUQsQ0FBSyxXQUFMLEVBQUg7c0JBQUEsQ0FBSCxFQUFBO3FCQUhHO2tCQUFBLENBQUwsQ0FBQSxDQUFBO0FBS0Esa0JBQUEsSUFBRyxVQUFIOzJCQUNFLFlBQUEsQ0FBYyxjQUFBLEdBQWEsQ0FBQyxVQUFBLENBQVcsSUFBWCxDQUFELENBQTNCLEVBQStDLGVBQS9DLEVBQWdFLElBQWhFLEVBQXNFLElBQXRFLEVBREY7bUJBTmlDO2dCQUFBLENBQW5DLEVBUjZCO2NBQUEsQ0FBL0IsRUFKc0I7WUFBQSxDQUF4QixFQURpQztVQUFBLENBQW5DLEVBSFk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQWxCZCxDQUFBO0FBQUEsTUEyQ0EsWUFBQSxHQUFlLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsRUFBTyxLQUFQLEVBQWMsV0FBZCxFQUEyQixNQUEzQixHQUFBO2lCQUNiLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyx1QkFBUDtXQUFMLEVBQXFDLFNBQUEsR0FBQTttQkFDbkMsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsT0FBQSxFQUFPLFVBQVA7YUFBTCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsY0FBQSxLQUFDLENBQUEsS0FBRCxDQUFPO0FBQUEsZ0JBQUEsSUFBQSxFQUFNLFVBQU47QUFBQSxnQkFBa0IsRUFBQSxFQUFLLFdBQUEsR0FBVyxJQUFsQztBQUFBLGdCQUEwQyxNQUFBLEVBQVEsSUFBbEQ7ZUFBUCxDQUFBLENBQUE7QUFBQSxjQUNBLEtBQUMsQ0FBQSxLQUFELENBQU87QUFBQSxnQkFBQSxPQUFBLEVBQU8sZUFBUDtBQUFBLGdCQUF3QixLQUFBLEVBQU0sV0FBQSxHQUFXLElBQXpDO2VBQVAsRUFBd0QsU0FBQSxHQUFBO3VCQUN0RCxLQUFDLENBQUEsSUFBRCxDQUFNO0FBQUEsa0JBQUEsT0FBQSxFQUFPLENBQUksTUFBSCxHQUFlLHFCQUFmLEdBQTBDLGVBQTNDLENBQVA7aUJBQU4sRUFBMEUsS0FBMUUsRUFEc0Q7Y0FBQSxDQUF4RCxDQURBLENBQUE7QUFJQSxjQUFBLElBQUcsbUJBQUg7dUJBQ0UsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGtCQUFBLE9BQUEsRUFBTyxxQkFBUDtpQkFBTCxFQUFtQyxTQUFBLEdBQUE7eUJBQ2pDLEtBQUMsQ0FBQSxHQUFELENBQUssV0FBTCxFQURpQztnQkFBQSxDQUFuQyxFQURGO2VBTHNCO1lBQUEsQ0FBeEIsRUFEbUM7VUFBQSxDQUFyQyxFQURhO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0EzQ2YsQ0FBQTthQXNEQSxJQUFDLENBQUEsT0FBRCxDQUFTO0FBQUEsUUFBQSxPQUFBLEVBQU8seUJBQVA7T0FBVCxFQUEyQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUN6QyxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sa0JBQVA7V0FBTCxFQUFnQyxTQUFBLEdBQUE7QUFDOUIsWUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsY0FBQSxPQUFBLEVBQU8sUUFBUDthQUFMLEVBQXNCLFNBQUEsR0FBQTtBQUNwQixjQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxnQkFBQSxPQUFBLEVBQU8sTUFBUDtlQUFMLEVBQW9CLFNBQUEsR0FBQTt1QkFDbEIsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGtCQUFBLEdBQUEsRUFBSyxvQ0FBTDtBQUFBLGtCQUEyQyxLQUFBLEVBQU8sR0FBbEQ7QUFBQSxrQkFBdUQsTUFBQSxFQUFRLEVBQS9EO2lCQUFMLEVBRGtCO2NBQUEsQ0FBcEIsQ0FBQSxDQUFBO3FCQUdBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxnQkFBQSxPQUFBLEVBQU8scUJBQVA7ZUFBSCxFQUFpQyxrR0FBakMsRUFKb0I7WUFBQSxDQUF0QixDQUFBLENBQUE7bUJBU0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsT0FBQSxFQUFPLFFBQVA7YUFBTCxFQUFzQixTQUFBLEdBQUE7QUFDcEIsa0JBQUEsTUFBQTtBQUFBLGNBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQVosQ0FBQSxDQUFULENBQUE7QUFBQSxjQUNBLFVBQUEsQ0FBVyxhQUFYLEVBQTBCLGNBQTFCLENBREEsQ0FBQTtBQUFBLGNBRUEsVUFBQSxDQUFXLGNBQVgsRUFBMkIsZUFBM0IsQ0FGQSxDQUFBO0FBQUEsY0FHQSxVQUFBLENBQVcsb0JBQVgsRUFBaUMscUJBQWpDLENBSEEsQ0FBQTtBQUFBLGNBSUEsVUFBQSxDQUFXLGVBQVgsRUFBNEIsZ0JBQTVCLENBSkEsQ0FBQTtBQUFBLGNBS0EsVUFBQSxDQUFXLGFBQVgsRUFBMEIsdUJBQTFCLEVBQW1ELDhCQUFuRCxDQUxBLENBQUE7QUFBQSxjQU1BLFdBQUEsQ0FBWSxnQ0FBWixFQUE4QyxvQ0FBOUMsRUFBb0Y7QUFBQSxnQkFDbEYsT0FBQSxFQUFTLENBQUMsRUFBRCxFQUFLLFNBQUwsRUFBZ0IsU0FBaEIsQ0FEeUU7QUFBQSxnQkFFbEYsT0FBQSxFQUFTLHlDQUZ5RTtBQUFBLGdCQUdsRixXQUFBLEVBQWEsNk1BSHFFO2VBQXBGLENBTkEsQ0FBQTtxQkFZQSxZQUFBLENBQWEsZUFBYixFQUE4QixpQ0FBOUIsRUFDViwyQkFBQSxHQUEyQixNQUFPLENBQUEsQ0FBQSxDQUFsQyxHQUFxQyxxQkFBckMsR0FBeUQsTUFBTyxDQUFBLENBQUEsQ0FBaEUsR0FDUSxxRUFGRSxFQWJvQjtZQUFBLENBQXRCLEVBVjhCO1VBQUEsQ0FBaEMsRUFEeUM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxFQXZEUTtJQUFBLENBSFYsQ0FBQTs7QUFBQSxrQ0F3RkEsZUFBQSxHQUFpQixTQUFBLEdBQUE7YUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsb0JBREY7SUFBQSxDQXhGakIsQ0FBQTs7QUFBQSxrQ0EyRkEsUUFBQSxHQUFVLFNBQUUsT0FBRixHQUFBO0FBQ1IsTUFEUyxJQUFDLENBQUEsVUFBQSxPQUNWLENBQUE7YUFBQSxJQUFDLENBQUEsa0JBQUQsQ0FBQSxFQURRO0lBQUEsQ0EzRlYsQ0FBQTs7QUFBQSxrQ0E4RkEsa0JBQUEsR0FBb0IsU0FBQSxHQUFBO0FBQ2xCLFVBQUEsT0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0Msa0JBQWxDLENBQVYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxRQUFmLENBQUEsQ0FBeUIsQ0FBQyxVQUExQixDQUFxQyxPQUFyQyxDQURBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixhQUF0QixDQUhBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixhQUF0QixDQUpBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixjQUF0QixDQUxBLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixlQUF0QixDQU5BLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixvQkFBdEIsQ0FQQSxDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsZUFBcEIsQ0FSQSxDQUFBO0FBQUEsTUFTQSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IseUJBQXBCLENBVEEsQ0FBQTtBQUFBLE1BVUEsSUFBQyxDQUFBLGtCQUFELENBQW9CLDBCQUFwQixDQVZBLENBQUE7QUFBQSxNQVdBLElBQUMsQ0FBQSxrQkFBRCxDQUFvQiwyQkFBcEIsQ0FYQSxDQUFBO0FBQUEsTUFZQSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IseUJBQXBCLENBWkEsQ0FBQTtBQUFBLE1BYUEsSUFBQyxDQUFBLGtCQUFELENBQW9CLGdDQUFwQixDQWJBLENBQUE7YUFjQSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsZ0NBQWxCLEVBZmtCO0lBQUEsQ0E5RnBCLENBQUE7O0FBQUEsa0NBK0dBLG9CQUFBLEdBQXNCLFNBQUMsSUFBRCxHQUFBO0FBQ3BCLFVBQUEsOEJBQUE7QUFBQSxNQUFBLGVBQUEsR0FBa0IsVUFBQSxDQUFXLElBQVgsQ0FBbEIsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLElBQUUsQ0FBQSxJQUFBLENBQUssQ0FBQyxRQUFSLENBQUEsQ0FEVCxDQUFBO0FBQUEsTUFHQSxNQUFNLENBQUMsT0FBUCxDQUFlLGdEQUFrQixFQUFsQixDQUFxQixDQUFDLElBQXRCLENBQTJCLElBQTNCLENBQWYsQ0FIQSxDQUFBO2FBS0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQzFDLGNBQUEsS0FBQTtBQUFBLFVBQUEsS0FBQSxHQUFRLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBZ0IsQ0FBQyxLQUFqQixDQUF1QixVQUF2QixDQUFrQyxDQUFDLE1BQW5DLENBQTBDLFNBQUMsQ0FBRCxHQUFBO21CQUFPLENBQUMsQ0FBQyxNQUFGLEdBQVcsRUFBbEI7VUFBQSxDQUExQyxDQUFSLENBQUE7aUJBQ0EsS0FBQyxDQUFBLE9BQVEsQ0FBQyxLQUFBLEdBQUssZUFBTixDQUFULENBQWtDLEtBQWxDLEVBRjBDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekIsQ0FBbkIsRUFOb0I7SUFBQSxDQS9HdEIsQ0FBQTs7QUFBQSxrQ0F5SEEsZ0JBQUEsR0FBa0IsU0FBQyxJQUFELEdBQUE7QUFDaEIsVUFBQSxxQ0FBQTtBQUFBLE1BQUEsZUFBQSxHQUFrQixVQUFBLENBQVcsSUFBWCxDQUFsQixDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsSUFBRSxDQUFBLElBQUEsQ0FEWCxDQUFBO0FBQUEsTUFFQSxZQUFBLEdBQWUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFULENBQWMsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFFBQXhCLENBQWQsQ0FBZ0QsQ0FBQyxHQUFqRCxDQUFxRCxTQUFDLENBQUQsR0FBQTtlQUFPLENBQUMsQ0FBQyxNQUFUO01BQUEsQ0FBckQsQ0FGZixDQUFBO0FBSUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFRLENBQUEsSUFBQSxDQUFaO0FBQ0UsUUFBQSxNQUFNLENBQUMsYUFBUCxHQUF1QixZQUFZLENBQUMsT0FBYixDQUFxQixJQUFDLENBQUEsT0FBUSxDQUFBLElBQUEsQ0FBOUIsQ0FBdkIsQ0FERjtPQUpBO2FBT0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFELENBQWEsTUFBYixFQUFxQjtBQUFBLFFBQUEsTUFBQSxFQUFRLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO0FBQzlDLGdCQUFBLFlBQUE7QUFBQSxZQUFBLEtBQUEsc0RBQWlDLENBQUUsY0FBbkMsQ0FBQTttQkFDQSxLQUFDLENBQUEsT0FBUSxDQUFDLEtBQUEsR0FBSyxlQUFOLENBQVQsQ0FBcUMsS0FBQSxLQUFTLEVBQVosR0FBb0IsSUFBcEIsR0FBOEIsS0FBaEUsRUFGOEM7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSO09BQXJCLENBQW5CLEVBUmdCO0lBQUEsQ0F6SGxCLENBQUE7O0FBQUEsa0NBcUlBLGtCQUFBLEdBQW9CLFNBQUMsSUFBRCxHQUFBO0FBQ2xCLFVBQUEseUJBQUE7QUFBQSxNQUFBLGVBQUEsR0FBa0IsVUFBQSxDQUFXLElBQVgsQ0FBbEIsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLElBQUUsQ0FBQSxJQUFBLENBRGIsQ0FBQTtBQUFBLE1BRUEsUUFBUSxDQUFDLE9BQVQsR0FBbUIsSUFBQyxDQUFBLE9BQVEsQ0FBQSxJQUFBLENBRjVCLENBQUE7YUFJQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFdBQUQsQ0FBYSxRQUFiLEVBQXVCO0FBQUEsUUFBQSxNQUFBLEVBQVEsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQ2hELEtBQUMsQ0FBQSxPQUFRLENBQUMsS0FBQSxHQUFLLGVBQU4sQ0FBVCxDQUFrQyxRQUFRLENBQUMsT0FBM0MsRUFEZ0Q7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSO09BQXZCLENBQW5CLEVBTGtCO0lBQUEsQ0FySXBCLENBQUE7O0FBQUEsa0NBNklBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFBRyxtQkFBSDtJQUFBLENBN0lWLENBQUE7O0FBQUEsa0NBK0lBLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFBRyxzQkFBSDtJQUFBLENBL0lSLENBQUE7O0FBQUEsa0NBaUpBLFdBQUEsR0FBYSxTQUFBLEdBQUE7YUFBRyxXQUFIO0lBQUEsQ0FqSmIsQ0FBQTs7QUFBQSxrQ0FtSkEsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUFHO0FBQUEsUUFBQyxZQUFBLEVBQWMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUE1QjtRQUFIO0lBQUEsQ0FuSlgsQ0FBQTs7K0JBQUE7O0tBRGdDLFlBTGxDLENBQUE7O0FBQUEsRUEySkEsTUFBTSxDQUFDLE9BQVAsR0FDQSxtQkFBQSxHQUNBLHVCQUFBLENBQXdCLHdCQUF4QixFQUFrRCxtQkFBbUIsQ0FBQyxTQUF0RSxDQTdKQSxDQUFBOztBQUFBLEVBK0pBLG1CQUFtQixDQUFDLFdBQXBCLEdBQWtDLFNBQUMsS0FBRCxHQUFBO0FBQ2hDLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLEdBQUEsQ0FBQSxtQkFBVixDQUFBO0FBQUEsSUFDQSxPQUFPLENBQUMsUUFBUixDQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLFVBQS9CLENBQTBDLENBQUMsVUFBVSxDQUFDLFVBQXRELENBQUEsQ0FBakIsQ0FEQSxDQUFBO1dBRUEsUUFIZ0M7RUFBQSxDQS9KbEMsQ0FBQTs7QUFBQSxFQW9LQSxtQkFBbUIsQ0FBQyxvQkFBcEIsR0FBMkMsU0FBQyxVQUFELEdBQUE7V0FDekMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFYLENBQTJCLFVBQTNCLEVBQXVDLFNBQUMsS0FBRCxHQUFBO0FBQ3JDLFVBQUEsT0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLEdBQUEsQ0FBQSxtQkFBVixDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsUUFBUixDQUFpQixLQUFqQixDQURBLENBQUE7YUFFQSxRQUhxQztJQUFBLENBQXZDLEVBRHlDO0VBQUEsQ0FwSzNDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-project-element.coffee
