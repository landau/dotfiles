(function() {
  var ColorContext, ColorSearch, Emitter, Minimatch, registry, _ref;

  _ref = [], Emitter = _ref[0], Minimatch = _ref[1], ColorContext = _ref[2], registry = _ref[3];

  module.exports = ColorSearch = (function() {
    ColorSearch.deserialize = function(state) {
      return new ColorSearch(state.options);
    };

    function ColorSearch(options) {
      var subscription, _ref1;
      this.options = options != null ? options : {};
      _ref1 = this.options, this.sourceNames = _ref1.sourceNames, this.ignoredNameSources = _ref1.ignoredNames, this.context = _ref1.context, this.project = _ref1.project;
      if (Emitter == null) {
        Emitter = require('atom').Emitter;
      }
      this.emitter = new Emitter;
      if (this.project != null) {
        this.init();
      } else {
        subscription = atom.packages.onDidActivatePackage((function(_this) {
          return function(pkg) {
            if (pkg.name === 'pigments') {
              subscription.dispose();
              _this.project = pkg.mainModule.getProject();
              return _this.init();
            }
          };
        })(this));
      }
    }

    ColorSearch.prototype.init = function() {
      var error, ignore, _i, _len, _ref1;
      if (Minimatch == null) {
        Minimatch = require('minimatch').Minimatch;
      }
      if (ColorContext == null) {
        ColorContext = require('./color-context');
      }
      if (this.context == null) {
        this.context = new ColorContext({
          registry: this.project.getColorExpressionsRegistry()
        });
      }
      this.parser = this.context.parser;
      this.variables = this.context.getVariables();
      if (this.sourceNames == null) {
        this.sourceNames = [];
      }
      if (this.ignoredNameSources == null) {
        this.ignoredNameSources = [];
      }
      this.ignoredNames = [];
      _ref1 = this.ignoredNameSources;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        ignore = _ref1[_i];
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
      if (this.searchRequested) {
        return this.search();
      }
    };

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
      if (this.project == null) {
        this.searchRequested = true;
        return;
      }
      re = new RegExp(this.project.getColorExpressionsRegistry().getRegExp());
      results = [];
      promise = atom.workspace.scan(re, {
        paths: this.sourceNames
      }, (function(_this) {
        return function(m) {
          var newMatches, relativePath, result, scope, _i, _len, _ref1, _ref2;
          relativePath = atom.project.relativize(m.filePath);
          scope = _this.project.scopeFromFileName(relativePath);
          if (_this.isIgnored(relativePath)) {
            return;
          }
          newMatches = [];
          _ref1 = m.matches;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            result = _ref1[_i];
            result.color = _this.parser.parse(result.matchText, scope);
            if (!((_ref2 = result.color) != null ? _ref2.isValid() : void 0)) {
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
      var ignoredName, _i, _len, _ref1;
      _ref1 = this.ignoredNames;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        ignoredName = _ref1[_i];
        if (ignoredName.match(relativePath)) {
          return true;
        }
      }
    };

    ColorSearch.prototype.serialize = function() {
      return {
        deserializer: 'ColorSearch',
        options: {
          sourceNames: this.sourceNames,
          ignoredNames: this.ignoredNameSources
        }
      };
    };

    return ColorSearch;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLXNlYXJjaC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkRBQUE7O0FBQUEsRUFBQSxPQUErQyxFQUEvQyxFQUFDLGlCQUFELEVBQVUsbUJBQVYsRUFBcUIsc0JBQXJCLEVBQW1DLGtCQUFuQyxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsV0FBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLEtBQUQsR0FBQTthQUFlLElBQUEsV0FBQSxDQUFZLEtBQUssQ0FBQyxPQUFsQixFQUFmO0lBQUEsQ0FBZCxDQUFBOztBQUVhLElBQUEscUJBQUUsT0FBRixHQUFBO0FBQ1gsVUFBQSxtQkFBQTtBQUFBLE1BRFksSUFBQyxDQUFBLDRCQUFBLFVBQVEsRUFDckIsQ0FBQTtBQUFBLE1BQUEsUUFBd0UsSUFBQyxDQUFBLE9BQXpFLEVBQUMsSUFBQyxDQUFBLG9CQUFBLFdBQUYsRUFBNkIsSUFBQyxDQUFBLDJCQUFmLFlBQWYsRUFBa0QsSUFBQyxDQUFBLGdCQUFBLE9BQW5ELEVBQTRELElBQUMsQ0FBQSxnQkFBQSxPQUE3RCxDQUFBO0FBQ0EsTUFBQSxJQUFrQyxlQUFsQztBQUFBLFFBQUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BQUQsQ0FBQTtPQURBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUZYLENBQUE7QUFJQSxNQUFBLElBQUcsb0JBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBQSxDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsWUFBQSxHQUFlLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQWQsQ0FBbUMsQ0FBQSxTQUFBLEtBQUEs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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-search.coffee
