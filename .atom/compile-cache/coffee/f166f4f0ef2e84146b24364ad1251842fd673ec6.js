(function() {
  var OperationAbortedError,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  module.exports = OperationAbortedError = (function(superClass) {
    extend(OperationAbortedError, superClass);

    function OperationAbortedError(arg) {
      this.message = arg.message;
      this.name = this.constructor.name;
    }

    return OperationAbortedError;

  })(Error);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvZXJyb3JzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEscUJBQUE7SUFBQTs7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBQ1MsK0JBQUMsR0FBRDtNQUFFLElBQUMsQ0FBQSxVQUFGLElBQUU7TUFDZCxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxXQUFXLENBQUM7SUFEVjs7OztLQURxQjtBQURwQyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIE9wZXJhdGlvbkFib3J0ZWRFcnJvciBleHRlbmRzIEVycm9yXG4gIGNvbnN0cnVjdG9yOiAoe0BtZXNzYWdlfSkgLT5cbiAgICBAbmFtZSA9IEBjb25zdHJ1Y3Rvci5uYW1lXG4iXX0=
