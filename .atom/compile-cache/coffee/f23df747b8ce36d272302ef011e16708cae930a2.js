(function() {
  var SearchHistoryManager, _;

  _ = require('underscore-plus');

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
      entries = this.globalState.get('searchHistory').slice();
      entries.unshift(entry);
      entries = _.uniq(entries);
      if (this.getSize() > this.vimState.getConfig('historySize')) {
        entries.splice(this.vimState.getConfig('historySize'));
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
      return this.globalState.get('searchHistory').length;
    };

    SearchHistoryManager.prototype.destroy = function() {
      return this.idx = null;
    };

    return SearchHistoryManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2VhcmNoLWhpc3RvcnktbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosTUFBTSxDQUFDLE9BQVAsR0FDTTttQ0FDSixHQUFBLEdBQUs7O0lBRVEsOEJBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxXQUFEO01BQ1gsSUFBQyxDQUFBLGNBQWUsSUFBQyxDQUFBLFNBQWhCO01BQ0YsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFDO0lBRkc7O21DQUliLEdBQUEsR0FBSyxTQUFDLFNBQUQ7QUFDSCxVQUFBO0FBQUEsY0FBTyxTQUFQO0FBQUEsYUFDTyxNQURQO1VBQ21CLElBQWlCLENBQUMsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFSLENBQUEsS0FBYyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQS9CO1lBQUEsSUFBQyxDQUFBLEdBQUQsSUFBUSxFQUFSOztBQUFaO0FBRFAsYUFFTyxNQUZQO1VBRW1CLElBQUEsQ0FBaUIsQ0FBQyxJQUFDLENBQUEsR0FBRCxLQUFRLENBQUMsQ0FBVixDQUFqQjtZQUFBLElBQUMsQ0FBQSxHQUFELElBQVEsRUFBUjs7QUFGbkI7cUZBRzBDO0lBSnZDOzttQ0FNTCxJQUFBLEdBQU0sU0FBQyxLQUFEO0FBQ0osVUFBQTtNQUFBLElBQVUsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFWLENBQVY7QUFBQSxlQUFBOztNQUVBLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsZUFBakIsQ0FBaUMsQ0FBQyxLQUFsQyxDQUFBO01BQ1YsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsS0FBaEI7TUFDQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLElBQUYsQ0FBTyxPQUFQO01BQ1YsSUFBRyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQUEsR0FBYSxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBb0IsYUFBcEIsQ0FBaEI7UUFDRSxPQUFPLENBQUMsTUFBUixDQUFlLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFvQixhQUFwQixDQUFmLEVBREY7O2FBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLGVBQWpCLEVBQWtDLE9BQWxDO0lBUkk7O21DQVVOLEtBQUEsR0FBTyxTQUFBO2FBQ0wsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFDO0lBREg7O21DQUdQLEtBQUEsR0FBTyxTQUFBO2FBQ0wsSUFBQyxDQUFBLFdBQVcsQ0FBQyxLQUFiLENBQW1CLGVBQW5CO0lBREs7O21DQUdQLE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLGVBQWpCLENBQWlDLENBQUM7SUFEM0I7O21DQUdULE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLEdBQUQsR0FBTztJQURBOzs7OztBQW5DWCIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFNlYXJjaEhpc3RvcnlNYW5hZ2VyXG4gIGlkeDogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZ2xvYmFsU3RhdGV9ID0gQHZpbVN0YXRlXG4gICAgQGlkeCA9IC0xXG5cbiAgZ2V0OiAoZGlyZWN0aW9uKSAtPlxuICAgIHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgIHdoZW4gJ3ByZXYnIHRoZW4gQGlkeCArPSAxIHVubGVzcyAoQGlkeCArIDEpIGlzIEBnZXRTaXplKClcbiAgICAgIHdoZW4gJ25leHQnIHRoZW4gQGlkeCAtPSAxIHVubGVzcyAoQGlkeCBpcyAtMSlcbiAgICBAZ2xvYmFsU3RhdGUuZ2V0KCdzZWFyY2hIaXN0b3J5JylbQGlkeF0gPyAnJ1xuXG4gIHNhdmU6IChlbnRyeSkgLT5cbiAgICByZXR1cm4gaWYgXy5pc0VtcHR5KGVudHJ5KVxuXG4gICAgZW50cmllcyA9IEBnbG9iYWxTdGF0ZS5nZXQoJ3NlYXJjaEhpc3RvcnknKS5zbGljZSgpXG4gICAgZW50cmllcy51bnNoaWZ0KGVudHJ5KVxuICAgIGVudHJpZXMgPSBfLnVuaXEoZW50cmllcylcbiAgICBpZiBAZ2V0U2l6ZSgpID4gQHZpbVN0YXRlLmdldENvbmZpZygnaGlzdG9yeVNpemUnKVxuICAgICAgZW50cmllcy5zcGxpY2UoQHZpbVN0YXRlLmdldENvbmZpZygnaGlzdG9yeVNpemUnKSlcbiAgICBAZ2xvYmFsU3RhdGUuc2V0KCdzZWFyY2hIaXN0b3J5JywgZW50cmllcylcblxuICByZXNldDogLT5cbiAgICBAaWR4ID0gLTFcblxuICBjbGVhcjogLT5cbiAgICBAZ2xvYmFsU3RhdGUucmVzZXQoJ3NlYXJjaEhpc3RvcnknKVxuXG4gIGdldFNpemU6IC0+XG4gICAgQGdsb2JhbFN0YXRlLmdldCgnc2VhcmNoSGlzdG9yeScpLmxlbmd0aFxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGlkeCA9IG51bGxcbiJdfQ==
