(function() {
  var SearchHistoryManager, _,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  module.exports = SearchHistoryManager = (function() {
    SearchHistoryManager.prototype.idx = null;

    function SearchHistoryManager(vimState) {
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      this.globalState = this.vimState.globalState;
      this.idx = -1;
      this.vimState.onDidDestroy(this.destroy);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2VhcmNoLWhpc3RvcnktbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixNQUFNLENBQUMsT0FBUCxHQUNNO21DQUNKLEdBQUEsR0FBSzs7SUFFUSw4QkFBQyxRQUFEO01BQUMsSUFBQyxDQUFBLFdBQUQ7O01BQ1gsSUFBQyxDQUFBLGNBQWUsSUFBQyxDQUFBLFNBQWhCO01BQ0YsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFDO01BQ1IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUF4QjtJQUhXOzttQ0FLYixHQUFBLEdBQUssU0FBQyxTQUFEO0FBQ0gsVUFBQTtBQUFBLGNBQU8sU0FBUDtBQUFBLGFBQ08sTUFEUDtVQUNtQixJQUFpQixDQUFDLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBUixDQUFBLEtBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUEvQjtZQUFBLElBQUMsQ0FBQSxHQUFELElBQVEsRUFBUjs7QUFBWjtBQURQLGFBRU8sTUFGUDtVQUVtQixJQUFBLENBQWlCLENBQUMsSUFBQyxDQUFBLEdBQUQsS0FBUSxDQUFDLENBQVYsQ0FBakI7WUFBQSxJQUFDLENBQUEsR0FBRCxJQUFRLEVBQVI7O0FBRm5CO3FGQUcwQztJQUp2Qzs7bUNBTUwsSUFBQSxHQUFNLFNBQUMsS0FBRDtBQUNKLFVBQUE7TUFBQSxJQUFVLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBVixDQUFWO0FBQUEsZUFBQTs7TUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLGVBQWpCLENBQWlDLENBQUMsS0FBbEMsQ0FBQTtNQUNWLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEtBQWhCO01BQ0EsT0FBQSxHQUFVLENBQUMsQ0FBQyxJQUFGLENBQU8sT0FBUDtNQUNWLElBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFBLEdBQWEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLGFBQXBCLENBQWhCO1FBQ0UsT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBb0IsYUFBcEIsQ0FBZixFQURGOzthQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixlQUFqQixFQUFrQyxPQUFsQztJQVJJOzttQ0FVTixLQUFBLEdBQU8sU0FBQTthQUNMLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBQztJQURIOzttQ0FHUCxLQUFBLEdBQU8sU0FBQTthQUNMLElBQUMsQ0FBQSxXQUFXLENBQUMsS0FBYixDQUFtQixlQUFuQjtJQURLOzttQ0FHUCxPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixlQUFqQixDQUFpQyxDQUFDO0lBRDNCOzttQ0FHVCxPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxHQUFELEdBQU87SUFEQTs7Ozs7QUFwQ1giLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTZWFyY2hIaXN0b3J5TWFuYWdlclxuICBpZHg6IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGdsb2JhbFN0YXRlfSA9IEB2aW1TdGF0ZVxuICAgIEBpZHggPSAtMVxuICAgIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kpXG5cbiAgZ2V0OiAoZGlyZWN0aW9uKSAtPlxuICAgIHN3aXRjaCBkaXJlY3Rpb25cbiAgICAgIHdoZW4gJ3ByZXYnIHRoZW4gQGlkeCArPSAxIHVubGVzcyAoQGlkeCArIDEpIGlzIEBnZXRTaXplKClcbiAgICAgIHdoZW4gJ25leHQnIHRoZW4gQGlkeCAtPSAxIHVubGVzcyAoQGlkeCBpcyAtMSlcbiAgICBAZ2xvYmFsU3RhdGUuZ2V0KCdzZWFyY2hIaXN0b3J5JylbQGlkeF0gPyAnJ1xuXG4gIHNhdmU6IChlbnRyeSkgLT5cbiAgICByZXR1cm4gaWYgXy5pc0VtcHR5KGVudHJ5KVxuXG4gICAgZW50cmllcyA9IEBnbG9iYWxTdGF0ZS5nZXQoJ3NlYXJjaEhpc3RvcnknKS5zbGljZSgpXG4gICAgZW50cmllcy51bnNoaWZ0KGVudHJ5KVxuICAgIGVudHJpZXMgPSBfLnVuaXEoZW50cmllcylcbiAgICBpZiBAZ2V0U2l6ZSgpID4gQHZpbVN0YXRlLmdldENvbmZpZygnaGlzdG9yeVNpemUnKVxuICAgICAgZW50cmllcy5zcGxpY2UoQHZpbVN0YXRlLmdldENvbmZpZygnaGlzdG9yeVNpemUnKSlcbiAgICBAZ2xvYmFsU3RhdGUuc2V0KCdzZWFyY2hIaXN0b3J5JywgZW50cmllcylcblxuICByZXNldDogLT5cbiAgICBAaWR4ID0gLTFcblxuICBjbGVhcjogLT5cbiAgICBAZ2xvYmFsU3RhdGUucmVzZXQoJ3NlYXJjaEhpc3RvcnknKVxuXG4gIGdldFNpemU6IC0+XG4gICAgQGdsb2JhbFN0YXRlLmdldCgnc2VhcmNoSGlzdG9yeScpLmxlbmd0aFxuXG4gIGRlc3Ryb3k6ID0+XG4gICAgQGlkeCA9IG51bGxcbiJdfQ==
