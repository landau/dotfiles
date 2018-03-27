(function() {
  var RenameView, TextEditorView, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('space-pen').View;

  TextEditorView = require('atom-space-pen-views').TextEditorView;

  module.exports = RenameView = (function(superClass) {
    extend(RenameView, superClass);

    function RenameView() {
      return RenameView.__super__.constructor.apply(this, arguments);
    }

    RenameView.prototype.initialize = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: true
        });
      }
      return atom.commands.add(this.element, 'core:cancel', (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this));
    };

    RenameView.prototype.destroy = function() {
      this.panel.hide();
      this.focusout();
      return this.panel.destroy();
    };

    RenameView.content = function(usages) {
      var n, name;
      n = usages.length;
      name = usages[0].name;
      return this.div((function(_this) {
        return function() {
          _this.div("Type new name to replace " + n + " occurences of " + name + " within project:");
          return _this.subview('miniEditor', new TextEditorView({
            mini: true,
            placeholderText: name
          }));
        };
      })(this));
    };

    RenameView.prototype.onInput = function(callback) {
      this.miniEditor.focus();
      return atom.commands.add(this.element, {
        'core:confirm': (function(_this) {
          return function() {
            callback(_this.miniEditor.getText());
            return _this.destroy();
          };
        })(this)
      });
    };

    return RenameView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvcmVuYW1lLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnQ0FBQTtJQUFBOzs7RUFBQyxPQUFRLE9BQUEsQ0FBUSxXQUFSOztFQUNSLGlCQUFrQixPQUFBLENBQVEsc0JBQVI7O0VBRW5CLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7eUJBQ0osVUFBQSxHQUFZLFNBQUE7O1FBQ1YsSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1VBQUEsSUFBQSxFQUFNLElBQU47VUFBUyxPQUFBLEVBQVMsSUFBbEI7U0FBN0I7O2FBQ1YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxPQUFuQixFQUE0QixhQUE1QixFQUEyQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQztJQUZVOzt5QkFJWixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO01BQ0EsSUFBQyxDQUFDLFFBQUYsQ0FBQTthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBO0lBSE87O0lBS1QsVUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLE1BQUQ7QUFDUixVQUFBO01BQUEsQ0FBQSxHQUFJLE1BQU0sQ0FBQztNQUNYLElBQUEsR0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUM7YUFDakIsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDSCxLQUFDLENBQUEsR0FBRCxDQUFLLDJCQUFBLEdBQTRCLENBQTVCLEdBQThCLGlCQUE5QixHQUErQyxJQUEvQyxHQUFvRCxrQkFBekQ7aUJBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULEVBQTJCLElBQUEsY0FBQSxDQUN6QjtZQUFBLElBQUEsRUFBTSxJQUFOO1lBQVksZUFBQSxFQUFpQixJQUE3QjtXQUR5QixDQUEzQjtRQUZHO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFMO0lBSFE7O3lCQVFWLE9BQUEsR0FBUyxTQUFDLFFBQUQ7TUFDUCxJQUFDLENBQUEsVUFBVSxDQUFDLEtBQVosQ0FBQTthQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsT0FBbkIsRUFBNEI7UUFBQSxjQUFBLEVBQWdCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7WUFDMUMsUUFBQSxDQUFTLEtBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBLENBQVQ7bUJBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBQTtVQUYwQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEI7T0FBNUI7SUFGTzs7OztLQWxCYztBQUp6QiIsInNvdXJjZXNDb250ZW50IjpbIntWaWV3fSA9IHJlcXVpcmUgJ3NwYWNlLXBlbidcbntUZXh0RWRpdG9yVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUmVuYW1lVmlldyBleHRlbmRzIFZpZXdcbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiBALCB2aXNpYmxlOiB0cnVlKVxuICAgIGF0b20uY29tbWFuZHMuYWRkKEBlbGVtZW50LCAnY29yZTpjYW5jZWwnLCA9PiBAZGVzdHJveSgpKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHBhbmVsLmhpZGUoKVxuICAgIEAuZm9jdXNvdXQoKVxuICAgIEBwYW5lbC5kZXN0cm95KClcblxuICBAY29udGVudDogKHVzYWdlcykgLT5cbiAgICBuID0gdXNhZ2VzLmxlbmd0aFxuICAgIG5hbWUgPSB1c2FnZXNbMF0ubmFtZVxuICAgIEBkaXYgPT5cbiAgICAgIEBkaXYgXCJUeXBlIG5ldyBuYW1lIHRvIHJlcGxhY2UgI3tufSBvY2N1cmVuY2VzIG9mICN7bmFtZX0gd2l0aGluIHByb2plY3Q6XCJcbiAgICAgIEBzdWJ2aWV3ICdtaW5pRWRpdG9yJywgbmV3IFRleHRFZGl0b3JWaWV3XG4gICAgICAgIG1pbmk6IHRydWUsIHBsYWNlaG9sZGVyVGV4dDogbmFtZVxuXG4gIG9uSW5wdXQ6IChjYWxsYmFjaykgLT5cbiAgICBAbWluaUVkaXRvci5mb2N1cygpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgQGVsZW1lbnQsICdjb3JlOmNvbmZpcm0nOiA9PlxuICAgICAgY2FsbGJhY2soQG1pbmlFZGl0b3IuZ2V0VGV4dCgpKVxuICAgICAgQGRlc3Ryb3koKVxuIl19
