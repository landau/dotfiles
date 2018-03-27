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
      var line, _ref1;
      if (variablesRegExp == null) {
        variablesRegExp = require('./regexes').variables;
      }
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return ((_ref1 = line.match(new RegExp(variablesRegExp + '$'))) != null ? _ref1[0] : void 0) || '';
    };

    PigmentsProvider.prototype.findSuggestionsForPrefix = function(variables, prefix) {
      var matchedVariables, suggestions;
      if (variables == null) {
        return [];
      }
      if (_ == null) {
        _ = require('underscore-plus');
      }
      suggestions = [];
      matchedVariables = variables.filter(function(v) {
        return !v.isAlternate && RegExp("^" + (_.escapeRegExp(prefix))).test(v.name);
      });
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
