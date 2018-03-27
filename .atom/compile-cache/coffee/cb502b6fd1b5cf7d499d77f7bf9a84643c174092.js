(function() {
  var Helpers, Range, child_process, minimatch, path,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Range = require('atom').Range;

  path = require('path');

  child_process = require('child_process');

  minimatch = require('minimatch');

  Helpers = module.exports = {
    messageKey: function(message) {
      return (message.text || message.html) + '$' + message.type + '$' + (message["class"] || '') + '$' + (message.name || '') + '$' + message.filePath + '$' + (message.range ? message.range.start.column + ':' + message.range.start.row + ':' + message.range.end.column + ':' + message.range.end.row : '');
    },
    error: function(e) {
      return atom.notifications.addError(e.toString(), {
        detail: e.stack || '',
        dismissable: true
      });
    },
    shouldTriggerLinter: function(linter, onChange, scopes) {
      if (onChange && !linter.lintOnFly) {
        return false;
      }
      if (!scopes.some(function(entry) {
        return __indexOf.call(linter.grammarScopes, entry) >= 0;
      })) {
        return false;
      }
      return true;
    },
    requestUpdateFrame: function(callback) {
      return setTimeout(callback, 100);
    },
    debounce: function(callback, delay) {
      var timeout;
      timeout = null;
      return function(arg) {
        clearTimeout(timeout);
        return timeout = setTimeout((function(_this) {
          return function() {
            return callback.call(_this, arg);
          };
        })(this), delay);
      };
    },
    isPathIgnored: function(filePath) {
      var i, projectPath, repo, _i, _len, _ref;
      repo = null;
      _ref = atom.project.getPaths();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        projectPath = _ref[i];
        if (filePath.indexOf(projectPath + path.sep) === 0) {
          repo = atom.project.getRepositories()[i];
          break;
        }
      }
      if (repo && repo.isProjectAtRoot() && repo.isPathIgnored(filePath)) {
        return true;
      }
      return minimatch(filePath, atom.config.get('linter.ignoreMatchedFiles'));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9oZWxwZXJzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4Q0FBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUMsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBQUQsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxlQUFSLENBRmhCLENBQUE7O0FBQUEsRUFHQSxTQUFBLEdBQVksT0FBQSxDQUFRLFdBQVIsQ0FIWixDQUFBOztBQUFBLEVBS0EsT0FBQSxHQUFVLE1BQU0sQ0FBQyxPQUFQLEdBQ1I7QUFBQSxJQUFBLFVBQUEsRUFBWSxTQUFDLE9BQUQsR0FBQTthQUNWLENBQUMsT0FBTyxDQUFDLElBQVIsSUFBZ0IsT0FBTyxDQUFDLElBQXpCLENBQUEsR0FBaUMsR0FBakMsR0FBdUMsT0FBTyxDQUFDLElBQS9DLEdBQXNELEdBQXRELEdBQTRELENBQUMsT0FBTyxDQUFDLE9BQUQsQ0FBUCxJQUFpQixFQUFsQixDQUE1RCxHQUFvRixHQUFwRixHQUEwRixDQUFDLE9BQU8sQ0FBQyxJQUFSLElBQWdCLEVBQWpCLENBQTFGLEdBQWlILEdBQWpILEdBQXVILE9BQU8sQ0FBQyxRQUEvSCxHQUEwSSxHQUExSSxHQUFnSixDQUFJLE9BQU8sQ0FBQyxLQUFYLEdBQXNCLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQXBCLEdBQTZCLEdBQTdCLEdBQW1DLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQXZELEdBQTZELEdBQTdELEdBQW1FLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQXJGLEdBQThGLEdB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/linter/lib/helpers.coffee
