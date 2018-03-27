(function() {
  var CompositeDisposable, PigmentsProvider, variablesRegExp, _, _ref;

  _ref = [], CompositeDisposable = _ref[0], variablesRegExp = _ref[1], _ = _ref[2];

  module.exports = PigmentsProvider = (function() {
    function PigmentsProvider(pigments) {
      this.pigments = pigments;
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      this.subscriptions = new CompositeDisposable;
      this.selector = atom.config.get('pigments.autocompleteScopes').join(',');
      this.subscriptions.add(atom.config.observe('pigments.autocompleteScopes', (function(_this) {
        return function(scopes) {
          return _this.selector = scopes.join(',');
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.extendAutocompleteToVariables', (function(_this) {
        return function(extendAutocompleteToVariables) {
          _this.extendAutocompleteToVariables = extendAutocompleteToVariables;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.extendAutocompleteToColorValue', (function(_this) {
        return function(extendAutocompleteToColorValue) {
          _this.extendAutocompleteToColorValue = extendAutocompleteToColorValue;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.autocompleteSuggestionsFromValue', (function(_this) {
        return function(autocompleteSuggestionsFromValue) {
          _this.autocompleteSuggestionsFromValue = autocompleteSuggestionsFromValue;
        };
      })(this)));
    }

    PigmentsProvider.prototype.dispose = function() {
      this.disposed = true;
      this.subscriptions.dispose();
      return this.pigments = null;
    };

    PigmentsProvider.prototype.getProject = function() {
      if (this.disposed) {
        return;
      }
      return this.pigments.getProject();
    };

    PigmentsProvider.prototype.getSuggestions = function(_arg) {
      var bufferPosition, editor, prefix, project, suggestions, variables;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition;
      if (this.disposed) {
        return;
      }
      prefix = this.getPrefix(editor, bufferPosition);
      project = this.getProject();
      if (!(prefix != null ? prefix.length : void 0)) {
        return;
      }
      if (project == null) {
        return;
      }
      if (this.extendAutocompleteToVariables) {
        variables = project.getVariables();
      } else {
        variables = project.getColorVariables();
      }
      suggestions = this.findSuggestionsForPrefix(variables, prefix);
      return suggestions;
    };

    PigmentsProvider.prototype.getPrefix = function(editor, bufferPosition) {
      var line, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (variablesRegExp == null) {
        variablesRegExp = require('./regexes').variables;
      }
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      if (this.autocompleteSuggestionsFromValue) {
        return (_ref1 = (_ref2 = (_ref3 = (_ref4 = (_ref5 = line.match(/(?:#[a-fA-F0-9]*|rgb.+)$/)) != null ? _ref5[0] : void 0) != null ? _ref4 : (_ref6 = line.match(new RegExp("(" + variablesRegExp + ")$"))) != null ? _ref6[0] : void 0) != null ? _ref3 : (_ref7 = line.match(/:\s*([^\s].+)$/)) != null ? _ref7[1] : void 0) != null ? _ref2 : (_ref8 = line.match(/^\s*([^\s].+)$/)) != null ? _ref8[1] : void 0) != null ? _ref1 : '';
      } else {
        return ((_ref9 = line.match(new RegExp("(" + variablesRegExp + ")$"))) != null ? _ref9[0] : void 0) || '';
      }
    };

    PigmentsProvider.prototype.findSuggestionsForPrefix = function(variables, prefix) {
      var matchedVariables, matchesColorValue, re, suggestions;
      if (variables == null) {
        return [];
      }
      if (_ == null) {
        _ = require('underscore-plus');
      }
      re = RegExp("^" + (_.escapeRegExp(prefix).replace(/,\s*/, '\\s*,\\s*')));
      suggestions = [];
      matchesColorValue = function(v) {
        var res;
        res = re.test(v.value);
        if (v.color != null) {
          res || (res = v.color.suggestionValues.some(function(s) {
            return re.test(s);
          }));
        }
        return res;
      };
      matchedVariables = variables.filter((function(_this) {
        return function(v) {
          return !v.isAlternate && re.test(v.name) || (_this.autocompleteSuggestionsFromValue && matchesColorValue(v));
        };
      })(this));
      matchedVariables.forEach((function(_this) {
        return function(v) {
          var color, rightLabelHTML;
          if (v.isColor) {
            color = v.color.alpha === 1 ? '#' + v.color.hex : v.color.toCSS();
            rightLabelHTML = "<span class='color-suggestion-preview' style='background: " + (v.color.toCSS()) + "'></span>";
            if (_this.extendAutocompleteToColorValue) {
              rightLabelHTML = "" + color + " " + rightLabelHTML;
            }
            return suggestions.push({
              text: v.name,
              rightLabelHTML: rightLabelHTML,
              replacementPrefix: prefix,
              className: 'color-suggestion'
            });
          } else {
            return suggestions.push({
              text: v.name,
              rightLabel: v.value,
              replacementPrefix: prefix,
              className: 'pigments-suggestion'
            });
          }
        };
      })(this));
      return suggestions;
    };

    return PigmentsProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3BpZ21lbnRzLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrREFBQTs7QUFBQSxFQUFBLE9BRUksRUFGSixFQUNFLDZCQURGLEVBQ3VCLHlCQUR2QixFQUN3QyxXQUR4QyxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsMEJBQUUsUUFBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsV0FBQSxRQUNiLENBQUE7O1FBQUEsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQztPQUF2QztBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUZqQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsQ0FBOEMsQ0FBQyxJQUEvQyxDQUFvRCxHQUFwRCxDQUhaLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsNkJBQXBCLEVBQW1ELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtpQkFDcEUsS0FBQyxDQUFBLFFBQUQsR0FBWSxNQUFNLENBQUMsSUFBUCxDQUFZLEdBQVosRUFEd0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuRCxDQUFuQixDQUxBLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0Isd0NBQXBCLEVBQThELENBQUEsU0FBQSxL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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/pigments-provider.coffee
