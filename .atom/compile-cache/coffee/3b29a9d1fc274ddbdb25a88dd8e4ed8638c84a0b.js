(function() {
  var SearchHistoryManager, _, settings;

  _ = require('underscore-plus');

  settings = require('./settings');

  module.exports = SearchHistoryManager = (function() {
    SearchHistoryManager.prototype.idx = null;

    function SearchHistoryManager(vimState) {
      this.vimState = vimState;
      this.globalState = this.vimState.globalState;
      this.idx = -1;
    }

    SearchHistoryManager.prototype.get = function(direction) {
      var ref;
      switch (direction) {
        case 'prev':
          if ((this.idx + 1) !== this.getSize()) {
            this.idx += 1;
          }
          break;
        case 'next':
          if (!(this.idx === -1)) {
            this.idx -= 1;
          }
      }
      return (ref = this.globalState.get('searchHistory')[this.idx]) != null ? ref : '';
    };

    SearchHistoryManager.prototype.save = function(entry) {
      var entries;
      if (_.isEmpty(entry)) {
        return;
      }
      entries = _.uniq([entry].concat(this.getEntries()));
      if (this.getSize() > settings.get('historySize')) {
        entries.splice(settings.get('historySize'));
      }
      return this.globalState.set('searchHistory', entries);
    };

    SearchHistoryManager.prototype.reset = function() {
      return this.idx = -1;
    };

    SearchHistoryManager.prototype.clear = function() {
      return this.globalState.reset('searchHistory');
    };

    SearchHistoryManager.prototype.getSize = function() {
      return this.getEntries().length;
    };

    SearchHistoryManager.prototype.getEntries = function() {
      return this.globalState.get('searchHistory');
    };

    SearchHistoryManager.prototype.destroy = function() {
      return this.idx = null;
    };

    return SearchHistoryManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2VhcmNoLWhpc3RvcnktbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVYLE1BQU0sQ0FBQyxPQUFQLEdBQ007bUNBQ0osR0FBQSxHQUFLOztJQUVRLDhCQUFDLFFBQUQ7TUFBQyxJQUFDLENBQUEsV0FBRDtNQUNYLElBQUMsQ0FBQSxjQUFlLElBQUMsQ0FBQSxTQUFoQjtNQUNGLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBQztJQUZHOzttQ0FJYixHQUFBLEdBQUssU0FBQyxTQUFEO0FBQ0gsVUFBQTtBQUFBLGNBQU8sU0FBUDtBQUFBLGFBQ08sTUFEUDtVQUNtQixJQUFpQixDQUFDLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBUixDQUFBLEtBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUEvQjtZQUFBLElBQUMsQ0FBQSxHQUFELElBQVEsRUFBUjs7QUFBWjtBQURQLGFBRU8sTUFGUDtVQUVtQixJQUFBLENBQWlCLENBQUMsSUFBQyxDQUFBLEdBQUQsS0FBUSxDQUFDLENBQVYsQ0FBakI7WUFBQSxJQUFDLENBQUEsR0FBRCxJQUFRLEVBQVI7O0FBRm5CO3FGQUcwQztJQUp2Qzs7bUNBTUwsSUFBQSxHQUFNLFNBQUMsS0FBRDtBQUNKLFVBQUE7TUFBQSxJQUFVLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBVixDQUFWO0FBQUEsZUFBQTs7TUFDQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLElBQUYsQ0FBTyxDQUFDLEtBQUQsQ0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQWYsQ0FBUDtNQUNWLElBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFBLEdBQWEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxhQUFiLENBQWhCO1FBQ0UsT0FBTyxDQUFDLE1BQVIsQ0FBZSxRQUFRLENBQUMsR0FBVCxDQUFhLGFBQWIsQ0FBZixFQURGOzthQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixlQUFqQixFQUFrQyxPQUFsQztJQUxJOzttQ0FPTixLQUFBLEdBQU8sU0FBQTthQUNMLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBQztJQURIOzttQ0FHUCxLQUFBLEdBQU8sU0FBQTthQUNMLElBQUMsQ0FBQSxXQUFXLENBQUMsS0FBYixDQUFtQixlQUFuQjtJQURLOzttQ0FHUCxPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBYSxDQUFDO0lBRFA7O21DQUdULFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLGVBQWpCO0lBRFU7O21DQUdaLE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLEdBQUQsR0FBTztJQURBOzs7OztBQXBDWCIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFNlYXJjaEhpc3RvcnlNYW5hZ2VyXG4gIGlkeDogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZ2xvYmFsU3RhdGV9ID0gQHZpbVN0YXRlXG4gICAgQGlkeCA9IC0xXG5cbiAgZ2V0OiAoZGlyZWN0aW9uKSAtPlxuICAgIHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgIHdoZW4gJ3ByZXYnIHRoZW4gQGlkeCArPSAxIHVubGVzcyAoQGlkeCArIDEpIGlzIEBnZXRTaXplKClcbiAgICAgIHdoZW4gJ25leHQnIHRoZW4gQGlkeCAtPSAxIHVubGVzcyAoQGlkeCBpcyAtMSlcbiAgICBAZ2xvYmFsU3RhdGUuZ2V0KCdzZWFyY2hIaXN0b3J5JylbQGlkeF0gPyAnJ1xuXG4gIHNhdmU6IChlbnRyeSkgLT5cbiAgICByZXR1cm4gaWYgXy5pc0VtcHR5KGVudHJ5KVxuICAgIGVudHJpZXMgPSBfLnVuaXEoW2VudHJ5XS5jb25jYXQoQGdldEVudHJpZXMoKSkpXG4gICAgaWYgQGdldFNpemUoKSA+IHNldHRpbmdzLmdldCgnaGlzdG9yeVNpemUnKVxuICAgICAgZW50cmllcy5zcGxpY2Uoc2V0dGluZ3MuZ2V0KCdoaXN0b3J5U2l6ZScpKVxuICAgIEBnbG9iYWxTdGF0ZS5zZXQoJ3NlYXJjaEhpc3RvcnknLCBlbnRyaWVzKVxuXG4gIHJlc2V0OiAtPlxuICAgIEBpZHggPSAtMVxuXG4gIGNsZWFyOiAtPlxuICAgIEBnbG9iYWxTdGF0ZS5yZXNldCgnc2VhcmNoSGlzdG9yeScpXG5cbiAgZ2V0U2l6ZTogLT5cbiAgICBAZ2V0RW50cmllcygpLmxlbmd0aFxuXG4gIGdldEVudHJpZXM6IC0+XG4gICAgQGdsb2JhbFN0YXRlLmdldCgnc2VhcmNoSGlzdG9yeScpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAaWR4ID0gbnVsbFxuIl19
