(function() {
  var ColorContext, ColorParser, ColorSearch, Emitter, Minimatch, path, registry;

  path = require('path');

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
      _ref = this.options, this.sourceNames = _ref.sourceNames, ignoredNames = _ref.ignoredNames, this.context = _ref.context;
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
          scope = path.extname(relativePath);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLXNlYXJjaC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMEVBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0MsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BREQsQ0FBQTs7QUFBQSxFQUVDLFlBQWEsT0FBQSxDQUFRLFdBQVIsRUFBYixTQUZELENBQUE7O0FBQUEsRUFHQSxRQUFBLEdBQVcsT0FBQSxDQUFRLHFCQUFSLENBSFgsQ0FBQTs7QUFBQSxFQUlBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FKZCxDQUFBOztBQUFBLEVBS0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQUxmLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxXQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsS0FBRCxHQUFBO2FBQWUsSUFBQSxXQUFBLENBQVksS0FBSyxDQUFDLE9BQWxCLEVBQWY7SUFBQSxDQUFkLENBQUE7O0FBRWEsSUFBQSxxQkFBRSxPQUFGLEdBQUE7QUFDWCxVQUFBLDJDQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsNEJBQUEsVUFBUSxFQUNyQixDQUFBO0FBQUEsTUFBQSxPQUF5QyxJQUFDLENBQUEsT0FBMUMsRUFBQyxJQUFDLENBQUEsbUJBQUEsV0FBRixFQUFlLG9CQUFBLFlBQWYsRUFBNkIsSUFBQyxDQUFBLGVBQUEsT0FBOUIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FEWCxDQUFBOztRQUVBLElBQUMsQ0FBQSxVQUFlLElBQUEsWUFBQSxDQUFhO0FBQUEsVUFBQyxV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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-search.coffee
