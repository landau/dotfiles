(function() {
  var Prefix, Register, Repeat,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Prefix = (function() {
    function Prefix() {}

    Prefix.prototype.complete = null;

    Prefix.prototype.composedObject = null;

    Prefix.prototype.isComplete = function() {
      return this.complete;
    };

    Prefix.prototype.isRecordable = function() {
      return this.composedObject.isRecordable();
    };

    Prefix.prototype.compose = function(composedObject) {
      this.composedObject = composedObject;
      return this.complete = true;
    };

    Prefix.prototype.execute = function() {
      var _base;
      return typeof (_base = this.composedObject).execute === "function" ? _base.execute(this.count) : void 0;
    };

    Prefix.prototype.select = function() {
      var _base;
      return typeof (_base = this.composedObject).select === "function" ? _base.select(this.count) : void 0;
    };

    Prefix.prototype.isLinewise = function() {
      var _base;
      return typeof (_base = this.composedObject).isLinewise === "function" ? _base.isLinewise() : void 0;
    };

    return Prefix;

  })();

  Repeat = (function(_super) {
    __extends(Repeat, _super);

    Repeat.prototype.count = null;

    function Repeat(count) {
      this.count = count;
      this.complete = false;
    }

    Repeat.prototype.addDigit = function(digit) {
      return this.count = this.count * 10 + digit;
    };

    return Repeat;

  })(Prefix);

  Register = (function(_super) {
    __extends(Register, _super);

    Register.prototype.name = null;

    function Register(name) {
      this.name = name;
      this.complete = false;
    }

    Register.prototype.compose = function(composedObject) {
      Register.__super__.compose.call(this, composedObject);
      if (composedObject.register != null) {
        return composedObject.register = this.name;
      }
    };

    return Register;

  })(Prefix);

  module.exports = {
    Repeat: Repeat,
    Register: Register
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3ByZWZpeGVzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3QkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQU07d0JBQ0o7O0FBQUEscUJBQUEsUUFBQSxHQUFVLElBQVYsQ0FBQTs7QUFBQSxxQkFDQSxjQUFBLEdBQWdCLElBRGhCLENBQUE7O0FBQUEscUJBR0EsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxTQUFKO0lBQUEsQ0FIWixDQUFBOztBQUFBLHFCQUtBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsY0FBYyxDQUFDLFlBQWhCLENBQUEsRUFBSDtJQUFBLENBTGQsQ0FBQTs7QUFBQSxxQkFZQSxPQUFBLEdBQVMsU0FBRSxjQUFGLEdBQUE7QUFDUCxNQURRLElBQUMsQ0FBQSxpQkFBQSxjQUNULENBQUE7YUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBREw7SUFBQSxDQVpULENBQUE7O0FBQUEscUJBa0JBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLEtBQUE7Z0ZBQWUsQ0FBQyxRQUFTLElBQUMsQ0FBQSxnQkFEbkI7SUFBQSxDQWxCVCxDQUFBOztBQUFBLHFCQXdCQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sVUFBQSxLQUFBOytFQUFlLENBQUMsT0FBUSxJQUFDLENBQUEsZ0JBRG5CO0lBQUEsQ0F4QlIsQ0FBQTs7QUFBQSxxQkEyQkEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsS0FBQTttRkFBZSxDQUFDLHNCQUROO0lBQUEsQ0EzQlosQ0FBQTs7a0JBQUE7O01BREYsQ0FBQTs7QUFBQSxFQW1DTTtBQUNKLDZCQUFBLENBQUE7O0FBQUEscUJBQUEsS0FBQSxHQUFPLElBQVAsQ0FBQTs7QUFHYSxJQUFBLGdCQUFFLEtBQUYsR0FBQTtBQUFZLE1BQVgsSUFBQyxDQUFBLFFBQUEsS0FBVSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBQVosQ0FBWjtJQUFBLENBSGI7O0FBQUEscUJBVUEsUUFBQSxHQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsS0FBRCxHQUFTLEVBQVQsR0FBYyxNQURmO0lBQUEsQ0FWVixDQUFBOztrQkFBQTs7S0FEbUIsT0FuQ3JCLENBQUE7O0FBQUEsRUFvRE07QUFDSiwrQkFBQSxDQUFBOztBQUFBLHVCQUFBLElBQUEsR0FBTSxJQUFOLENBQUE7O0FBR2EsSUFBQSxrQkFBRSxJQUFGLEdBQUE7QUFBVyxNQUFWLElBQUMsQ0FBQSxPQUFBLElBQVMsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxLQUFaLENBQVg7SUFBQSxDQUhiOztBQUFBLHVCQVVBLE9BQUEsR0FBUyxTQUFDLGNBQUQsR0FBQTtBQUNQLE1BQUEsc0NBQU0sY0FBTixDQUFBLENBQUE7QUFDQSxNQUFBLElBQW1DLCtCQUFuQztlQUFBLGNBQWMsQ0FBQyxRQUFmLEdBQTBCLElBQUMsQ0FBQSxLQUEzQjtPQUZPO0lBQUEsQ0FWVCxDQUFBOztvQkFBQTs7S0FEcUIsT0FwRHZCLENBQUE7O0FBQUEsRUFtRUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBQSxJQUFDLFFBQUEsTUFBRDtBQUFBLElBQVMsVUFBQSxRQUFUO0dBbkVqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/prefixes.coffee
