(function() {
  var QuickSort;

  QuickSort = (function() {
    function QuickSort() {}

    QuickSort.prototype.sort = function(items) {
      var current, left, pivot, right;
      if (items.length <= 1) {
        return items;
      }
      pivot = items.shift();
      left = [];
      right = [];
      while (items.length > 0) {
        current = items.shift();
        if (current < pivot) {
          left.push(current);
        } else {
          right.push(current);
        }
      }
      return sort(left).concat(pivot).concat(sort(right));
    };

    QuickSort.prototype.noop = function() {};

    return QuickSort;

  })();

  exports.modules = quicksort;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL2ZpeHR1cmVzL3NhbXBsZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUE7QUFBQSxNQUFBOztFQUFNOzs7d0JBQ0osSUFBQSxHQUFNLFNBQUMsS0FBRDtBQUNKLFVBQUE7TUFBQSxJQUFnQixLQUFLLENBQUMsTUFBTixJQUFnQixDQUFoQztBQUFBLGVBQU8sTUFBUDs7TUFFQSxLQUFBLEdBQVEsS0FBSyxDQUFDLEtBQU4sQ0FBQTtNQUNSLElBQUEsR0FBTztNQUNQLEtBQUEsR0FBUTtBQUlSLGFBQU0sS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFyQjtRQUNFLE9BQUEsR0FBVSxLQUFLLENBQUMsS0FBTixDQUFBO1FBQ1YsSUFBRyxPQUFBLEdBQVUsS0FBYjtVQUNFLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQURGO1NBQUEsTUFBQTtVQUdFLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWCxFQUhGOztNQUZGO2FBT0EsSUFBQSxDQUFLLElBQUwsQ0FBVSxDQUFDLE1BQVgsQ0FBa0IsS0FBbEIsQ0FBd0IsQ0FBQyxNQUF6QixDQUFnQyxJQUFBLENBQUssS0FBTCxDQUFoQztJQWhCSTs7d0JBa0JOLElBQUEsR0FBTSxTQUFBLEdBQUE7Ozs7OztFQUdSLE9BQU8sQ0FBQyxPQUFSLEdBQWtCO0FBdEJsQiIsInNvdXJjZXNDb250ZW50IjpbIiMgVGhpc1xuIyBpc1xuIyBDb21tZW50XG5cbiMgT25lIGxpbmUgY29tbWVudFxuXG4jIENvbW1lbnRcbiMgYm9yZGVyXG5jbGFzcyBRdWlja1NvcnRcbiAgc29ydDogKGl0ZW1zKSAtPlxuICAgIHJldHVybiBpdGVtcyBpZiBpdGVtcy5sZW5ndGggPD0gMVxuXG4gICAgcGl2b3QgPSBpdGVtcy5zaGlmdCgpXG4gICAgbGVmdCA9IFtdXG4gICAgcmlnaHQgPSBbXVxuXG4gICAgIyBDb21tZW50IGluIHRoZSBtaWRkbGVcblxuICAgIHdoaWxlIGl0ZW1zLmxlbmd0aCA+IDBcbiAgICAgIGN1cnJlbnQgPSBpdGVtcy5zaGlmdCgpXG4gICAgICBpZiBjdXJyZW50IDwgcGl2b3RcbiAgICAgICAgbGVmdC5wdXNoKGN1cnJlbnQpXG4gICAgICBlbHNlXG4gICAgICAgIHJpZ2h0LnB1c2goY3VycmVudClcblxuICAgIHNvcnQobGVmdCkuY29uY2F0KHBpdm90KS5jb25jYXQoc29ydChyaWdodCkpXG5cbiAgbm9vcDogLT5cbiAgIyBqdXN0IGEgbm9vcFxuXG5leHBvcnRzLm1vZHVsZXMgPSBxdWlja3NvcnRcbiJdfQ==
