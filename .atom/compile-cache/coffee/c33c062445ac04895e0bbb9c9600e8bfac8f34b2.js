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
      if (typeof this.initialize === "function") {
        this.initialize();
      }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvaW5zZXJ0LW1vZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpR0FBQTtJQUFBOzs7RUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUVWLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFFRDs7O0lBQ0osVUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOztJQUNhLG9CQUFBO01BQ1gsNkNBQUEsU0FBQTs7UUFDQSxJQUFDLENBQUE7O0lBRlU7Ozs7S0FGVTs7RUFNbkI7Ozs7Ozs7SUFDSixjQUFDLENBQUEsTUFBRCxDQUFBOzs2QkFDQSxZQUFBLEdBQWM7OzZCQUVkLFVBQUEsR0FBWSxTQUFBO01BQ1YsZ0RBQUEsU0FBQTthQUNBLElBQUMsQ0FBQSxVQUFELENBQUE7SUFGVTs7NkJBSVosT0FBQSxHQUFTLFNBQUE7YUFDUCxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ2YsY0FBQTtBQUFBO0FBQUE7ZUFBQSxxQ0FBQTs7WUFDRSxJQUFBLEdBQU8sS0FBQyxDQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBMkIsS0FBQyxDQUFBLFFBQUQsQ0FBQSxDQUEzQixFQUF3QyxTQUF4Qzt5QkFDUCxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQjtBQUZGOztRQURlO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQjtJQURPOzs7O0tBUmtCOztFQWN2Qjs7Ozs7OztJQUNKLGtCQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLGtCQUFDLENBQUEsV0FBRCxHQUFjOztpQ0FJZCxPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBMkIsR0FBM0I7YUFDUCxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsSUFBbkI7SUFGTzs7OztLQU5zQjs7RUFVM0I7Ozs7Ozs7SUFDSixpQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxpQkFBQyxDQUFBLFdBQUQsR0FBYzs7Z0NBSWQsUUFBQSxHQUFVLENBQUM7O2dDQUVYLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLFdBQUEsR0FBYyxDQUFDLElBQUMsQ0FBQSxRQUFGLEVBQVksQ0FBWjthQUNkLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDZixjQUFBO0FBQUE7QUFBQTtlQUFBLHFDQUFBOztZQUNFLEtBQUEsR0FBUSxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFqQixDQUFBLENBQW9DLENBQUMsU0FBckMsQ0FBK0MsV0FBL0M7WUFDUixLQUFBLEdBQVEsS0FBSyxDQUFDLGtCQUFOLENBQXlCLEtBQXpCLEVBQWdDLENBQWhDLEVBQW1DLENBQW5DO1lBQ1IsSUFBRyxJQUFBLEdBQU8sS0FBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBUixDQUE2QixLQUE3QixDQUFWOzJCQUNFLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCLEdBREY7YUFBQSxNQUFBO21DQUFBOztBQUhGOztRQURlO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQjtJQUZPOzs7O0tBUnFCOztFQWlCMUI7Ozs7Ozs7SUFDSixpQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxpQkFBQyxDQUFBLFdBQUQsR0FBYzs7Z0NBSWQsUUFBQSxHQUFVLENBQUM7Ozs7S0FObUI7QUFuRGhDIiwic291cmNlc0NvbnRlbnQiOlsie1JhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5cbmNsYXNzIEluc2VydE1vZGUgZXh0ZW5kcyBCYXNlXG4gIEBleHRlbmQoZmFsc2UpXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAgQGluaXRpYWxpemU/KClcblxuY2xhc3MgSW5zZXJ0UmVnaXN0ZXIgZXh0ZW5kcyBJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICByZXF1aXJlSW5wdXQ6IHRydWVcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQGZvY3VzSW5wdXQoKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICB0ZXh0ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQoQGdldElucHV0KCksIHNlbGVjdGlvbilcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcblxuY2xhc3MgSW5zZXJ0TGFzdEluc2VydGVkIGV4dGVuZHMgSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgSW5zZXJ0IHRleHQgaW5zZXJ0ZWQgaW4gbGF0ZXN0IGluc2VydC1tb2RlLlxuICBFcXVpdmFsZW50IHRvICppX0NUUkwtQSogb2YgcHVyZSBWaW1cbiAgXCJcIlwiXG4gIGV4ZWN1dGU6IC0+XG4gICAgdGV4dCA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KCcuJylcbiAgICBAZWRpdG9yLmluc2VydFRleHQodGV4dClcblxuY2xhc3MgQ29weUZyb21MaW5lQWJvdmUgZXh0ZW5kcyBJbnNlcnRNb2RlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiXCJcIlxuICBJbnNlcnQgY2hhcmFjdGVyIG9mIHNhbWUtY29sdW1uIG9mIGFib3ZlIGxpbmUuXG4gIEVxdWl2YWxlbnQgdG8gKmlfQ1RSTC1ZKiBvZiBwdXJlIFZpbVxuICBcIlwiXCJcbiAgcm93RGVsdGE6IC0xXG5cbiAgZXhlY3V0ZTogLT5cbiAgICB0cmFuc2xhdGlvbiA9IFtAcm93RGVsdGEsIDBdXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICBwb2ludCA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS50cmFuc2xhdGUodHJhbnNsYXRpb24pXG4gICAgICAgIHJhbmdlID0gUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAxKVxuICAgICAgICBpZiB0ZXh0ID0gQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuXG5jbGFzcyBDb3B5RnJvbUxpbmVCZWxvdyBleHRlbmRzIENvcHlGcm9tTGluZUFib3ZlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiXCJcIlxuICBJbnNlcnQgY2hhcmFjdGVyIG9mIHNhbWUtY29sdW1uIG9mIGFib3ZlIGxpbmUuXG4gIEVxdWl2YWxlbnQgdG8gKmlfQ1RSTC1FKiBvZiBwdXJlIFZpbVxuICBcIlwiXCJcbiAgcm93RGVsdGE6ICsxXG4iXX0=
