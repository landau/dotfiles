(function() {
  var $$, SelectListView, UsagesView, path, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  path = require('path');

  module.exports = UsagesView = (function(superClass) {
    extend(UsagesView, superClass);

    function UsagesView() {
      return UsagesView.__super__.constructor.apply(this, arguments);
    }

    UsagesView.prototype.initialize = function(matches) {
      UsagesView.__super__.initialize.apply(this, arguments);
      this.storeFocusedElement();
      this.addClass('symbols-view');
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setLoading('Looking for usages');
      return this.focusFilterEditor();
    };

    UsagesView.prototype.destroy = function() {
      this.cancel();
      return this.panel.destroy();
    };

    UsagesView.prototype.viewForItem = function(arg) {
      var _, column, fileName, line, moduleName, name, ref1, relativePath;
      name = arg.name, moduleName = arg.moduleName, fileName = arg.fileName, line = arg.line, column = arg.column;
      ref1 = atom.project.relativizePath(fileName), _ = ref1[0], relativePath = ref1[1];
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div("" + name, {
              "class": 'primary-line'
            });
            return _this.div(relativePath + ", line " + line, {
              "class": 'secondary-line'
            });
          };
        })(this));
      });
    };

    UsagesView.prototype.getFilterKey = function() {
      return 'fileName';
    };

    UsagesView.prototype.scrollToItemView = function() {
      var column, editor, fileName, line, moduleName, name, ref1;
      UsagesView.__super__.scrollToItemView.apply(this, arguments);
      ref1 = this.getSelectedItem(), name = ref1.name, moduleName = ref1.moduleName, fileName = ref1.fileName, line = ref1.line, column = ref1.column;
      editor = atom.workspace.getActiveTextEditor();
      if (editor.getBuffer().file.path === fileName) {
        editor.setSelectedBufferRange([[line - 1, column], [line - 1, column + name.length]]);
        return editor.scrollToBufferPosition([line - 1, column], {
          center: true
        });
      }
    };

    UsagesView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No usages found';
      } else {
        return UsagesView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    UsagesView.prototype.confirmed = function(arg) {
      var column, fileName, line, moduleName, name, promise;
      name = arg.name, moduleName = arg.moduleName, fileName = arg.fileName, line = arg.line, column = arg.column;
      this.cancelPosition = null;
      this.cancel();
      promise = atom.workspace.open(fileName);
      return promise.then(function(editor) {
        editor.setCursorBufferPosition([line - 1, column]);
        editor.setSelectedBufferRange([[line - 1, column], [line - 1, column + name.length]]);
        return editor.scrollToCursorPosition();
      });
    };

    UsagesView.prototype.cancelled = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.hide() : void 0;
    };

    return UsagesView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvdXNhZ2VzLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx5Q0FBQTtJQUFBOzs7RUFBQSxNQUF1QixPQUFBLENBQVEsc0JBQVIsQ0FBdkIsRUFBQyxXQUFELEVBQUs7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7eUJBQ0osVUFBQSxHQUFZLFNBQUMsT0FBRDtNQUNWLDRDQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsY0FBVjs7UUFDQSxJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3Qjs7TUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtNQUNBLElBQUMsQ0FBQSxVQUFELENBQVksb0JBQVo7YUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQVBVOzt5QkFTWixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxNQUFELENBQUE7YUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQTtJQUZPOzt5QkFJVCxXQUFBLEdBQWEsU0FBQyxHQUFEO0FBQ1gsVUFBQTtNQURhLGlCQUFNLDZCQUFZLHlCQUFVLGlCQUFNO01BQy9DLE9BQW9CLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUE0QixRQUE1QixDQUFwQixFQUFDLFdBQUQsRUFBSTtBQUNKLGFBQU8sRUFBQSxDQUFHLFNBQUE7ZUFDUixJQUFDLENBQUEsRUFBRCxDQUFJO1VBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxXQUFQO1NBQUosRUFBd0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtZQUN0QixLQUFDLENBQUEsR0FBRCxDQUFLLEVBQUEsR0FBRyxJQUFSLEVBQWdCO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxjQUFQO2FBQWhCO21CQUNBLEtBQUMsQ0FBQSxHQUFELENBQVEsWUFBRCxHQUFjLFNBQWQsR0FBdUIsSUFBOUIsRUFBc0M7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdCQUFQO2FBQXRDO1VBRnNCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtNQURRLENBQUg7SUFGSTs7eUJBT2IsWUFBQSxHQUFjLFNBQUE7YUFBRztJQUFIOzt5QkFFZCxnQkFBQSxHQUFrQixTQUFBO0FBQ2hCLFVBQUE7TUFBQSxrREFBQSxTQUFBO01BQ0EsT0FBNkMsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUE3QyxFQUFDLGdCQUFELEVBQU8sNEJBQVAsRUFBbUIsd0JBQW5CLEVBQTZCLGdCQUE3QixFQUFtQztNQUNuQyxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO01BQ1QsSUFBRyxNQUFNLENBQUMsU0FBUCxDQUFBLENBQWtCLENBQUMsSUFBSSxDQUFDLElBQXhCLEtBQWdDLFFBQW5DO1FBQ0UsTUFBTSxDQUFDLHNCQUFQLENBQThCLENBQzVCLENBQUMsSUFBQSxHQUFPLENBQVIsRUFBVyxNQUFYLENBRDRCLEVBQ1IsQ0FBQyxJQUFBLEdBQU8sQ0FBUixFQUFXLE1BQUEsR0FBUyxJQUFJLENBQUMsTUFBekIsQ0FEUSxDQUE5QjtlQUVBLE1BQU0sQ0FBQyxzQkFBUCxDQUE4QixDQUFDLElBQUEsR0FBTyxDQUFSLEVBQVcsTUFBWCxDQUE5QixFQUFrRDtVQUFBLE1BQUEsRUFBUSxJQUFSO1NBQWxELEVBSEY7O0lBSmdCOzt5QkFTbEIsZUFBQSxHQUFpQixTQUFDLFNBQUQ7TUFDZixJQUFHLFNBQUEsS0FBYSxDQUFoQjtlQUNFLGtCQURGO09BQUEsTUFBQTtlQUdFLGlEQUFBLFNBQUEsRUFIRjs7SUFEZTs7eUJBTWpCLFNBQUEsR0FBVyxTQUFDLEdBQUQ7QUFDVCxVQUFBO01BRFcsaUJBQU0sNkJBQVkseUJBQVUsaUJBQU07TUFDN0MsSUFBQyxDQUFBLGNBQUQsR0FBa0I7TUFDbEIsSUFBQyxDQUFBLE1BQUQsQ0FBQTtNQUNBLE9BQUEsR0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsUUFBcEI7YUFDVixPQUFPLENBQUMsSUFBUixDQUFhLFNBQUMsTUFBRDtRQUNYLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixDQUFDLElBQUEsR0FBTyxDQUFSLEVBQVcsTUFBWCxDQUEvQjtRQUNBLE1BQU0sQ0FBQyxzQkFBUCxDQUE4QixDQUM1QixDQUFDLElBQUEsR0FBTyxDQUFSLEVBQVcsTUFBWCxDQUQ0QixFQUNSLENBQUMsSUFBQSxHQUFPLENBQVIsRUFBVyxNQUFBLEdBQVMsSUFBSSxDQUFDLE1BQXpCLENBRFEsQ0FBOUI7ZUFFQSxNQUFNLENBQUMsc0JBQVAsQ0FBQTtNQUpXLENBQWI7SUFKUzs7eUJBVVgsU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBOytDQUFNLENBQUUsSUFBUixDQUFBO0lBRFM7Ozs7S0FoRFk7QUFKekIiLCJzb3VyY2VzQ29udGVudCI6WyJ7JCQsIFNlbGVjdExpc3RWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFVzYWdlc1ZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0Vmlld1xuICBpbml0aWFsaXplOiAobWF0Y2hlcykgLT5cbiAgICBzdXBlclxuICAgIEBzdG9yZUZvY3VzZWRFbGVtZW50KClcbiAgICBAYWRkQ2xhc3MoJ3N5bWJvbHMtdmlldycpXG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHNldExvYWRpbmcoJ0xvb2tpbmcgZm9yIHVzYWdlcycpXG4gICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICBkZXN0cm95OiAtPlxuICAgIEBjYW5jZWwoKVxuICAgIEBwYW5lbC5kZXN0cm95KClcblxuICB2aWV3Rm9ySXRlbTogKHtuYW1lLCBtb2R1bGVOYW1lLCBmaWxlTmFtZSwgbGluZSwgY29sdW1ufSkgLT5cbiAgICBbXywgcmVsYXRpdmVQYXRoXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlTmFtZSlcbiAgICByZXR1cm4gJCQgLT5cbiAgICAgIEBsaSBjbGFzczogJ3R3by1saW5lcycsID0+XG4gICAgICAgIEBkaXYgXCIje25hbWV9XCIsIGNsYXNzOiAncHJpbWFyeS1saW5lJ1xuICAgICAgICBAZGl2IFwiI3tyZWxhdGl2ZVBhdGh9LCBsaW5lICN7bGluZX1cIiwgY2xhc3M6ICdzZWNvbmRhcnktbGluZSdcblxuICBnZXRGaWx0ZXJLZXk6IC0+ICdmaWxlTmFtZSdcblxuICBzY3JvbGxUb0l0ZW1WaWV3OiAtPlxuICAgIHN1cGVyXG4gICAge25hbWUsIG1vZHVsZU5hbWUsIGZpbGVOYW1lLCBsaW5lLCBjb2x1bW59ID0gQGdldFNlbGVjdGVkSXRlbSgpXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgZWRpdG9yLmdldEJ1ZmZlcigpLmZpbGUucGF0aCBpcyBmaWxlTmFtZVxuICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UoW1xuICAgICAgICBbbGluZSAtIDEsIGNvbHVtbl0sIFtsaW5lIC0gMSwgY29sdW1uICsgbmFtZS5sZW5ndGhdXSlcbiAgICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKFtsaW5lIC0gMSwgY29sdW1uXSwgY2VudGVyOiB0cnVlKVxuXG4gIGdldEVtcHR5TWVzc2FnZTogKGl0ZW1Db3VudCkgLT5cbiAgICBpZiBpdGVtQ291bnQgaXMgMFxuICAgICAgJ05vIHVzYWdlcyBmb3VuZCdcbiAgICBlbHNlXG4gICAgICBzdXBlclxuXG4gIGNvbmZpcm1lZDogKHtuYW1lLCBtb2R1bGVOYW1lLCBmaWxlTmFtZSwgbGluZSwgY29sdW1ufSkgLT5cbiAgICBAY2FuY2VsUG9zaXRpb24gPSBudWxsXG4gICAgQGNhbmNlbCgpXG4gICAgcHJvbWlzZSA9IGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZU5hbWUpXG4gICAgcHJvbWlzZS50aGVuIChlZGl0b3IpIC0+XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2xpbmUgLSAxLCBjb2x1bW5dKVxuICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UoW1xuICAgICAgICBbbGluZSAtIDEsIGNvbHVtbl0sIFtsaW5lIC0gMSwgY29sdW1uICsgbmFtZS5sZW5ndGhdXSlcbiAgICAgIGVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKClcblxuICBjYW5jZWxsZWQ6IC0+XG4gICAgQHBhbmVsPy5oaWRlKClcbiJdfQ==
