(function() {
  var Task;

  Task = null;

  module.exports = {
    startTask: function(config, callback) {
      var dirtied, removed, task, taskPath;
      if (Task == null) {
        Task = require('atom').Task;
      }
      dirtied = [];
      removed = [];
      taskPath = require.resolve('./tasks/load-paths-handler');
      task = Task.once(taskPath, config, function() {
        return callback({
          dirtied: dirtied,
          removed: removed
        });
      });
      task.on('load-paths:paths-found', function(paths) {
        return dirtied.push.apply(dirtied, paths);
      });
      task.on('load-paths:paths-lost', function(paths) {
        return removed.push.apply(removed, paths);
      });
      return task;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3BhdGhzLWxvYWRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsSUFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxTQUFBLEVBQVcsU0FBQyxNQUFELEVBQVMsUUFBVCxHQUFBO0FBQ1QsVUFBQSxnQ0FBQTs7UUFBQSxPQUFRLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQztPQUF4QjtBQUFBLE1BRUEsT0FBQSxHQUFVLEVBRlYsQ0FBQTtBQUFBLE1BR0EsT0FBQSxHQUFVLEVBSFYsQ0FBQTtBQUFBLE1BSUEsUUFBQSxHQUFXLE9BQU8sQ0FBQyxPQUFSLENBQWdCLDRCQUFoQixDQUpYLENBQUE7QUFBQSxNQU1BLElBQUEsR0FBTyxJQUFJLENBQUMsSUFBTCxDQUNMLFFBREssRUFFTCxNQUZLLEVBR0wsU0FBQSxHQUFBO2VBQUcsUUFBQSxDQUFTO0FBQUEsVUFBQyxTQUFBLE9BQUQ7QUFBQSxVQUFVLFNBQUEsT0FBVjtTQUFULEVBQUg7TUFBQSxDQUhLLENBTlAsQ0FBQTtBQUFBLE1BWUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSx3QkFBUixFQUFrQyxTQUFDLEtBQUQsR0FBQTtlQUFXLE9BQU8sQ0FBQyxJQUFSLGdCQUFhLEtBQWIsRUFBWDtNQUFBLENBQWxDLENBWkEsQ0FBQTtBQUFBLE1BYUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSx1QkFBUixFQUFpQyxTQUFDLEtBQUQsR0FBQTtlQUFXLE9BQU8sQ0FBQyxJQUFSLGdCQUFhLEtBQWIsRUFBWDtNQUFBLENBQWpDLENBYkEsQ0FBQTthQWVBLEtBaEJTO0lBQUEsQ0FBWDtHQUhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/paths-loader.coffee
