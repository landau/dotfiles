(function() {
  var slice = [].slice;

  module.exports = {
    prefix: 'autocomplete-python:',
    debug: function() {
      var msg;
      msg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (atom.config.get('autocomplete-python.outputDebug')) {
        return console.debug.apply(console, [this.prefix].concat(slice.call(msg)));
      }
    },
    warning: function() {
      var msg;
      msg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return console.warn.apply(console, [this.prefix].concat(slice.call(msg)));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFBUSxzQkFBUjtJQUNBLEtBQUEsRUFBTyxTQUFBO0FBQ0wsVUFBQTtNQURNO01BQ04sSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCLENBQUg7QUFDRSxlQUFPLE9BQU8sQ0FBQyxLQUFSLGdCQUFjLENBQUEsSUFBQyxDQUFBLE1BQVEsU0FBQSxXQUFBLEdBQUEsQ0FBQSxDQUF2QixFQURUOztJQURLLENBRFA7SUFLQSxPQUFBLEVBQVMsU0FBQTtBQUNQLFVBQUE7TUFEUTtBQUNSLGFBQU8sT0FBTyxDQUFDLElBQVIsZ0JBQWEsQ0FBQSxJQUFDLENBQUEsTUFBUSxTQUFBLFdBQUEsR0FBQSxDQUFBLENBQXRCO0lBREEsQ0FMVDs7QUFERiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgcHJlZml4OiAnYXV0b2NvbXBsZXRlLXB5dGhvbjonXG4gIGRlYnVnOiAobXNnLi4uKSAtPlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5vdXRwdXREZWJ1ZycpXG4gICAgICByZXR1cm4gY29uc29sZS5kZWJ1ZyBAcHJlZml4LCBtc2cuLi5cblxuICB3YXJuaW5nOiAobXNnLi4uKSAtPlxuICAgIHJldHVybiBjb25zb2xlLndhcm4gQHByZWZpeCwgbXNnLi4uXG4iXX0=
