(function() {
  var Base, CopyFromLineAbove, CopyFromLineBelow, InsertLastInserted, InsertMode, InsertRegister, Range,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Range = require('atom').Range;

  Base = require('./base');

  InsertMode = (function(superClass) {
    extend(InsertMode, superClass);

    InsertMode.extend(false);

    function InsertMode() {
      InsertMode.__super__.constructor.apply(this, arguments);
      this.initialize();
    }

    return InsertMode;

  })(Base);

  InsertRegister = (function(superClass) {
    extend(InsertRegister, superClass);

    function InsertRegister() {
      return InsertRegister.__super__.constructor.apply(this, arguments);
    }

    InsertRegister.extend();

    InsertRegister.prototype.requireInput = true;

    InsertRegister.prototype.initialize = function() {
      InsertRegister.__super__.initialize.apply(this, arguments);
      return this.focusInput();
    };

    InsertRegister.prototype.execute = function() {
      return this.editor.transact((function(_this) {
        return function() {
          var i, len, ref, results, selection, text;
          ref = _this.editor.getSelections();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            selection = ref[i];
            text = _this.vimState.register.getText(_this.getInput(), selection);
            results.push(selection.insertText(text));
          }
          return results;
        };
      })(this));
    };

    return InsertRegister;

  })(InsertMode);

  InsertLastInserted = (function(superClass) {
    extend(InsertLastInserted, superClass);

    function InsertLastInserted() {
      return InsertLastInserted.__super__.constructor.apply(this, arguments);
    }

    InsertLastInserted.extend();

    InsertLastInserted.description = "Insert text inserted in latest insert-mode.\nEquivalent to *i_CTRL-A* of pure Vim";

    InsertLastInserted.prototype.execute = function() {
      var text;
      text = this.vimState.register.getText('.');
      return this.editor.insertText(text);
    };

    return InsertLastInserted;

  })(InsertMode);

  CopyFromLineAbove = (function(superClass) {
    extend(CopyFromLineAbove, superClass);

    function CopyFromLineAbove() {
      return CopyFromLineAbove.__super__.constructor.apply(this, arguments);
    }

    CopyFromLineAbove.extend();

    CopyFromLineAbove.description = "Insert character of same-column of above line.\nEquivalent to *i_CTRL-Y* of pure Vim";

    CopyFromLineAbove.prototype.rowDelta = -1;

    CopyFromLineAbove.prototype.execute = function() {
      var translation;
      translation = [this.rowDelta, 0];
      return this.editor.transact((function(_this) {
        return function() {
          var i, len, point, range, ref, results, selection, text;
          ref = _this.editor.getSelections();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            selection = ref[i];
            point = selection.cursor.getBufferPosition().translate(translation);
            range = Range.fromPointWithDelta(point, 0, 1);
            if (text = _this.editor.getTextInBufferRange(range)) {
              results.push(selection.insertText(text));
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this));
    };

    return CopyFromLineAbove;

  })(InsertMode);

  CopyFromLineBelow = (function(superClass) {
    extend(CopyFromLineBelow, superClass);

    function CopyFromLineBelow() {
      return CopyFromLineBelow.__super__.constructor.apply(this, arguments);
    }

    CopyFromLineBelow.extend();

    CopyFromLineBelow.description = "Insert character of same-column of above line.\nEquivalent to *i_CTRL-E* of pure Vim";

    CopyFromLineBelow.prototype.rowDelta = +1;

    return CopyFromLineBelow;

  })(CopyFromLineAbove);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvaW5zZXJ0LW1vZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpR0FBQTtJQUFBOzs7RUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUVWLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFFRDs7O0lBQ0osVUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOztJQUNhLG9CQUFBO01BQ1gsNkNBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxVQUFELENBQUE7SUFGVzs7OztLQUZVOztFQU1uQjs7Ozs7OztJQUNKLGNBQUMsQ0FBQSxNQUFELENBQUE7OzZCQUNBLFlBQUEsR0FBYzs7NkJBRWQsVUFBQSxHQUFZLFNBQUE7TUFDVixnREFBQSxTQUFBO2FBQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQUZVOzs2QkFJWixPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDZixjQUFBO0FBQUE7QUFBQTtlQUFBLHFDQUFBOztZQUNFLElBQUEsR0FBTyxLQUFDLENBQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFuQixDQUEyQixLQUFDLENBQUEsUUFBRCxDQUFBLENBQTNCLEVBQXdDLFNBQXhDO3lCQUNQLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCO0FBRkY7O1FBRGU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO0lBRE87Ozs7S0FSa0I7O0VBY3ZCOzs7Ozs7O0lBQ0osa0JBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0Esa0JBQUMsQ0FBQSxXQUFELEdBQWM7O2lDQUlkLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFuQixDQUEyQixHQUEzQjthQUNQLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFtQixJQUFuQjtJQUZPOzs7O0tBTnNCOztFQVUzQjs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLGlCQUFDLENBQUEsV0FBRCxHQUFjOztnQ0FJZCxRQUFBLEdBQVUsQ0FBQzs7Z0NBRVgsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsV0FBQSxHQUFjLENBQUMsSUFBQyxDQUFBLFFBQUYsRUFBWSxDQUFaO2FBQ2QsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNmLGNBQUE7QUFBQTtBQUFBO2VBQUEscUNBQUE7O1lBQ0UsS0FBQSxHQUFRLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWpCLENBQUEsQ0FBb0MsQ0FBQyxTQUFyQyxDQUErQyxXQUEvQztZQUNSLEtBQUEsR0FBUSxLQUFLLENBQUMsa0JBQU4sQ0FBeUIsS0FBekIsRUFBZ0MsQ0FBaEMsRUFBbUMsQ0FBbkM7WUFDUixJQUFHLElBQUEsR0FBTyxLQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLEtBQTdCLENBQVY7MkJBQ0UsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsR0FERjthQUFBLE1BQUE7bUNBQUE7O0FBSEY7O1FBRGU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO0lBRk87Ozs7S0FScUI7O0VBaUIxQjs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLGlCQUFDLENBQUEsV0FBRCxHQUFjOztnQ0FJZCxRQUFBLEdBQVUsQ0FBQzs7OztLQU5tQjtBQW5EaEMiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcblxuY2xhc3MgSW5zZXJ0TW9kZSBleHRlbmRzIEJhc2VcbiAgQGV4dGVuZChmYWxzZSlcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcbiAgICBAaW5pdGlhbGl6ZSgpXG5cbmNsYXNzIEluc2VydFJlZ2lzdGVyIGV4dGVuZHMgSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBmb2N1c0lucHV0KClcblxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgdGV4dCA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KEBnZXRJbnB1dCgpLCBzZWxlY3Rpb24pXG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbmNsYXNzIEluc2VydExhc3RJbnNlcnRlZCBleHRlbmRzIEluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJcIlwiXG4gIEluc2VydCB0ZXh0IGluc2VydGVkIGluIGxhdGVzdCBpbnNlcnQtbW9kZS5cbiAgRXF1aXZhbGVudCB0byAqaV9DVFJMLUEqIG9mIHB1cmUgVmltXG4gIFwiXCJcIlxuICBleGVjdXRlOiAtPlxuICAgIHRleHQgPSBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dCgnLicpXG4gICAgQGVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG5cbmNsYXNzIENvcHlGcm9tTGluZUFib3ZlIGV4dGVuZHMgSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgSW5zZXJ0IGNoYXJhY3RlciBvZiBzYW1lLWNvbHVtbiBvZiBhYm92ZSBsaW5lLlxuICBFcXVpdmFsZW50IHRvICppX0NUUkwtWSogb2YgcHVyZSBWaW1cbiAgXCJcIlwiXG4gIHJvd0RlbHRhOiAtMVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgdHJhbnNsYXRpb24gPSBbQHJvd0RlbHRhLCAwXVxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgcG9pbnQgPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkudHJhbnNsYXRlKHRyYW5zbGF0aW9uKVxuICAgICAgICByYW5nZSA9IFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShwb2ludCwgMCwgMSlcbiAgICAgICAgaWYgdGV4dCA9IEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcblxuY2xhc3MgQ29weUZyb21MaW5lQmVsb3cgZXh0ZW5kcyBDb3B5RnJvbUxpbmVBYm92ZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgSW5zZXJ0IGNoYXJhY3RlciBvZiBzYW1lLWNvbHVtbiBvZiBhYm92ZSBsaW5lLlxuICBFcXVpdmFsZW50IHRvICppX0NUUkwtRSogb2YgcHVyZSBWaW1cbiAgXCJcIlwiXG4gIHJvd0RlbHRhOiArMVxuIl19
