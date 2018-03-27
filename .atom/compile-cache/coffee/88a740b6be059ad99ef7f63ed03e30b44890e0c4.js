(function() {
  var ColorContext, ColorParser, ColorSearch, Emitter, Minimatch, registry;

  Emitter = require('atom').Emitter;

  Minimatch = require('minimatch').Minimatch;

  registry = require('./color-expressions');

  ColorParser = require('./color-parser');

  ColorContext = require('./color-context');

  module.exports = ColorSearch = (function() {
    ColorSearch.deserialize = function(state) {
      return new ColorSearch(state.options);
    };

    function ColorSearch(options) {
      var error, ignore, ignoredNames, _i, _len, _ref;
      this.options = options != null ? options : {};
      _ref = this.options, this.sourceNames = _ref.sourceNames, ignoredNames = _ref.ignoredNames, this.context = _ref.context, this.project = _ref.project;
      this.emitter = new Emitter;
      if (this.context == null) {
        this.context = new ColorContext({
          registry: registry
        });
      }
      this.parser = this.context.parser;
      this.variables = this.context.getVariables();
      if (this.sourceNames == null) {
        this.sourceNames = [];
      }
      if (ignoredNames == null) {
        ignoredNames = [];
      }
      this.ignoredNames = [];
      for (_i = 0, _len = ignoredNames.length; _i < _len; _i++) {
        ignore = ignoredNames[_i];
        if (ignore != null) {
          try {
            this.ignoredNames.push(new Minimatch(ignore, {
              matchBase: true,
              dot: true
            }));
          } catch (_error) {
            error = _error;
            console.warn("Error parsing ignore pattern (" + ignore + "): " + error.message);
          }
        }
      }
    }

    ColorSearch.prototype.getTitle = function() {
      return 'Pigments Find Results';
    };

    ColorSearch.prototype.getURI = function() {
      return 'pigments://search';
    };

    ColorSearch.prototype.getIconName = function() {
      return "pigments";
    };

    ColorSearch.prototype.onDidFindMatches = function(callback) {
      return this.emitter.on('did-find-matches', callback);
    };

    ColorSearch.prototype.onDidCompleteSearch = function(callback) {
      return this.emitter.on('did-complete-search', callback);
    };

    ColorSearch.prototype.search = function() {
      var promise, re, results;
      re = new RegExp(registry.getRegExp());
      results = [];
      promise = atom.workspace.scan(re, {
        paths: this.sourceNames
      }, (function(_this) {
        return function(m) {
          var newMatches, relativePath, result, scope, _i, _len, _ref, _ref1;
          relativePath = atom.project.relativize(m.filePath);
          scope = _this.project.scopeFromFileName(relativePath);
          if (_this.isIgnored(relativePath)) {
            return;
          }
          newMatches = [];
          _ref = m.matches;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            result = _ref[_i];
            result.color = _this.parser.parse(result.matchText, scope);
            if (!((_ref1 = result.color) != null ? _ref1.isValid() : void 0)) {
              continue;
            }
            if (result.range[0] == null) {
              console.warn("Color search returned a result with an invalid range", result);
              continue;
            }
            result.range[0][1] += result.matchText.indexOf(result.color.colorExpression);
            result.matchText = result.color.colorExpression;
            results.push(result);
            newMatches.push(result);
          }
          m.matches = newMatches;
          if (m.matches.length > 0) {
            return _this.emitter.emit('did-find-matches', m);
          }
        };
      })(this));
      return promise.then((function(_this) {
        return function() {
          _this.results = results;
          return _this.emitter.emit('did-complete-search', results);
        };
      })(this));
    };

    ColorSearch.prototype.isIgnored = function(relativePath) {
      var ignoredName, _i, _len, _ref;
      _ref = this.ignoredNames;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ignoredName = _ref[_i];
        if (ignoredName.match(relativePath)) {
          return true;
        }
      }
    };

    ColorSearch.prototype.serialize = function() {
      return {
        deserializer: 'ColorSearch',
        options: this.options
      };
    };

    return ColorSearch;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLXNlYXJjaC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0VBQUE7O0FBQUEsRUFBQyxVQUFXLE9BQUEsQ0FBUSxNQUFSLEVBQVgsT0FBRCxDQUFBOztBQUFBLEVBQ0MsWUFBYSxPQUFBLENBQVEsV0FBUixFQUFiLFNBREQsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEscUJBQVIsQ0FGWCxDQUFBOztBQUFBLEVBR0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUhkLENBQUE7O0FBQUEsRUFJQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBSmYsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLFdBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxLQUFELEdBQUE7YUFBZSxJQUFBLFdBQUEsQ0FBWSxLQUFLLENBQUMsT0FBbEIsRUFBZjtJQUFBLENBQWQsQ0FBQTs7QUFFYSxJQUFBLHFCQUFFLE9BQUYsR0FBQTtBQUNYLFVBQUEsMkNBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSw0QkFBQSxVQUFRLEVBQ3JCLENBQUE7QUFBQSxNQUFBLE9BQW1ELElBQUMsQ0FBQSxPQUFwRCxFQUFDLElBQUMsQ0FBQSxtQkFBQSxXQUFGLEVBQWUsb0JBQUEsWUFBZixFQUE2QixJQUFDLENBQUEsZUFBQSxPQUE5QixFQUF1QyxJQUFDLENBQUEsZUFBQSxPQUF4QyxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQURYLENBQUE7O1FBRUEsSUFBQyxDQUFBLFVBQWUsSUFBQSxZQUFBLENBQWE7QUFBQSxVQUFDLFVBQUEsUUFBRDtTQUFiO09BRmhC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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-search.coffee
