(function() {
  var Task;

  Task = null;

  module.exports = {
    startTask: function(paths, registry, callback) {
      var results, taskPath;
      if (Task == null) {
        Task = require('atom').Task;
      }
      results = [];
      taskPath = require.resolve('./tasks/scan-paths-handler');
      this.task = Task.once(taskPath, [paths, registry.serialize()], (function(_this) {
        return function() {
          _this.task = null;
          return callback(results);
        };
      })(this));
      this.task.on('scan-paths:path-scanned', function(result) {
        return results = results.concat(result);
      });
      return this.task;
    },
    terminateRunningTask: function() {
      var _ref;
      return (_ref = this.task) != null ? _ref.terminate() : void 0;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3BhdGhzLXNjYW5uZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sSUFBUCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsU0FBQSxFQUFXLFNBQUMsS0FBRCxFQUFRLFFBQVIsRUFBa0IsUUFBbEIsR0FBQTtBQUNULFVBQUEsaUJBQUE7O1FBQUEsT0FBUSxPQUFBLENBQVEsTUFBUixDQUFlLENBQUM7T0FBeEI7QUFBQSxNQUVBLE9BQUEsR0FBVSxFQUZWLENBQUE7QUFBQSxNQUdBLFFBQUEsR0FBVyxPQUFPLENBQUMsT0FBUixDQUFnQiw0QkFBaEIsQ0FIWCxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUksQ0FBQyxJQUFMLENBQ04sUUFETSxFQUVOLENBQUMsS0FBRCxFQUFRLFFBQVEsQ0FBQyxTQUFULENBQUEsQ0FBUixDQUZNLEVBR04sQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNFLFVBQUEsS0FBQyxDQUFBLElBQUQsR0FBUSxJQUFSLENBQUE7aUJBQ0EsUUFBQSxDQUFTLE9BQVQsRUFGRjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSE0sQ0FMUixDQUFBO0FBQUEsTUFhQSxJQUFDLENBQUEsSUFBSSxDQUFDLEVBQU4sQ0FBUyx5QkFBVCxFQUFvQyxTQUFDLE1BQUQsR0FBQTtlQUNsQyxPQUFBLEdBQVUsT0FBTyxDQUFDLE1BQVIsQ0FBZSxNQUFmLEVBRHdCO01BQUEsQ0FBcEMsQ0FiQSxDQUFBO2FBZ0JBLElBQUMsQ0FBQSxLQWpCUTtJQUFBLENBQVg7QUFBQSxJQW1CQSxvQkFBQSxFQUFzQixTQUFBLEdBQUE7QUFDcEIsVUFBQSxJQUFBOzhDQUFLLENBQUUsU0FBUCxDQUFBLFdBRG9CO0lBQUEsQ0FuQnRCO0dBSEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/paths-scanner.coffee
