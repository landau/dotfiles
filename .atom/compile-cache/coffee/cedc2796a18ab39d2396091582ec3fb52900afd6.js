(function() {
  var OperationAbortedError, VimModePlusError,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  VimModePlusError = (function(superClass) {
    extend(VimModePlusError, superClass);

    function VimModePlusError(arg) {
      this.message = arg.message;
      this.name = this.constructor.name;
    }

    return VimModePlusError;

  })(Error);

  OperationAbortedError = (function(superClass) {
    extend(OperationAbortedError, superClass);

    function OperationAbortedError() {
      return OperationAbortedError.__super__.constructor.apply(this, arguments);
    }

    return OperationAbortedError;

  })(VimModePlusError);

  module.exports = {
    OperationAbortedError: OperationAbortedError
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvZXJyb3JzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUNBQUE7SUFBQTs7O0VBQU07OztJQUNTLDBCQUFDLEdBQUQ7TUFBRSxJQUFDLENBQUEsVUFBRixJQUFFO01BQ2QsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDO0lBRFY7Ozs7S0FEZ0I7O0VBSXpCOzs7Ozs7Ozs7S0FBOEI7O0VBRXBDLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQ2YsdUJBQUEscUJBRGU7O0FBTmpCIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgVmltTW9kZVBsdXNFcnJvciBleHRlbmRzIEVycm9yXG4gIGNvbnN0cnVjdG9yOiAoe0BtZXNzYWdlfSkgLT5cbiAgICBAbmFtZSA9IEBjb25zdHJ1Y3Rvci5uYW1lXG5cbmNsYXNzIE9wZXJhdGlvbkFib3J0ZWRFcnJvciBleHRlbmRzIFZpbU1vZGVQbHVzRXJyb3JcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIE9wZXJhdGlvbkFib3J0ZWRFcnJvclxufVxuIl19
