(function() {
  var $$, DefinitionsView, SelectListView, path, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  path = require('path');

  module.exports = DefinitionsView = (function(superClass) {
    extend(DefinitionsView, superClass);

    function DefinitionsView() {
      return DefinitionsView.__super__.constructor.apply(this, arguments);
    }

    DefinitionsView.prototype.initialize = function(matches) {
      DefinitionsView.__super__.initialize.apply(this, arguments);
      this.storeFocusedElement();
      this.addClass('symbols-view');
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setLoading('Looking for definitions');
      return this.focusFilterEditor();
    };

    DefinitionsView.prototype.destroy = function() {
      this.cancel();
      return this.panel.destroy();
    };

    DefinitionsView.prototype.viewForItem = function(arg) {
      var _, column, fileName, line, ref1, relativePath, text, type;
      text = arg.text, fileName = arg.fileName, line = arg.line, column = arg.column, type = arg.type;
      ref1 = atom.project.relativizePath(fileName), _ = ref1[0], relativePath = ref1[1];
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div(type + " " + text, {
              "class": 'primary-line'
            });
            return _this.div(relativePath + ", line " + (line + 1), {
              "class": 'secondary-line'
            });
          };
        })(this));
      });
    };

    DefinitionsView.prototype.getFilterKey = function() {
      return 'fileName';
    };

    DefinitionsView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No definition found';
      } else {
        return DefinitionsView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    DefinitionsView.prototype.confirmed = function(arg) {
      var column, fileName, line, promise;
      fileName = arg.fileName, line = arg.line, column = arg.column;
      this.cancelPosition = null;
      this.cancel();
      promise = atom.workspace.open(fileName);
      return promise.then(function(editor) {
        editor.setCursorBufferPosition([line, column]);
        return editor.scrollToCursorPosition();
      });
    };

    DefinitionsView.prototype.cancelled = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.hide() : void 0;
    };

    return DefinitionsView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvZGVmaW5pdGlvbnMtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7OztFQUFBLE1BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFdBQUQsRUFBSzs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozs4QkFDSixVQUFBLEdBQVksU0FBQyxPQUFEO01BQ1YsaURBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxtQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxjQUFWOztRQUNBLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCOztNQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO01BQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBWSx5QkFBWjthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBUFU7OzhCQVNaLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLE1BQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBO0lBRk87OzhCQUlULFdBQUEsR0FBYSxTQUFDLEdBQUQ7QUFDWCxVQUFBO01BRGEsaUJBQU0seUJBQVUsaUJBQU0scUJBQVE7TUFDM0MsT0FBb0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQTRCLFFBQTVCLENBQXBCLEVBQUMsV0FBRCxFQUFJO0FBQ0osYUFBTyxFQUFBLENBQUcsU0FBQTtlQUNSLElBQUMsQ0FBQSxFQUFELENBQUk7VUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFdBQVA7U0FBSixFQUF3QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO1lBQ3RCLEtBQUMsQ0FBQSxHQUFELENBQVEsSUFBRCxHQUFNLEdBQU4sR0FBUyxJQUFoQixFQUF3QjtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sY0FBUDthQUF4QjttQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFRLFlBQUQsR0FBYyxTQUFkLEdBQXNCLENBQUMsSUFBQSxHQUFPLENBQVIsQ0FBN0IsRUFBMEM7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdCQUFQO2FBQTFDO1VBRnNCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtNQURRLENBQUg7SUFGSTs7OEJBT2IsWUFBQSxHQUFjLFNBQUE7YUFBRztJQUFIOzs4QkFFZCxlQUFBLEdBQWlCLFNBQUMsU0FBRDtNQUNmLElBQUcsU0FBQSxLQUFhLENBQWhCO2VBQ0Usc0JBREY7T0FBQSxNQUFBO2VBR0Usc0RBQUEsU0FBQSxFQUhGOztJQURlOzs4QkFNakIsU0FBQSxHQUFXLFNBQUMsR0FBRDtBQUNULFVBQUE7TUFEVyx5QkFBVSxpQkFBTTtNQUMzQixJQUFDLENBQUEsY0FBRCxHQUFrQjtNQUNsQixJQUFDLENBQUEsTUFBRCxDQUFBO01BQ0EsT0FBQSxHQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixRQUFwQjthQUNWLE9BQU8sQ0FBQyxJQUFSLENBQWEsU0FBQyxNQUFEO1FBQ1gsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQUMsSUFBRCxFQUFPLE1BQVAsQ0FBL0I7ZUFDQSxNQUFNLENBQUMsc0JBQVAsQ0FBQTtNQUZXLENBQWI7SUFKUzs7OEJBUVgsU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBOytDQUFNLENBQUUsSUFBUixDQUFBO0lBRFM7Ozs7S0FyQ2lCO0FBSjlCIiwic291cmNlc0NvbnRlbnQiOlsieyQkLCBTZWxlY3RMaXN0Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBEZWZpbml0aW9uc1ZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0Vmlld1xuICBpbml0aWFsaXplOiAobWF0Y2hlcykgLT5cbiAgICBzdXBlclxuICAgIEBzdG9yZUZvY3VzZWRFbGVtZW50KClcbiAgICBAYWRkQ2xhc3MoJ3N5bWJvbHMtdmlldycpXG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHNldExvYWRpbmcoJ0xvb2tpbmcgZm9yIGRlZmluaXRpb25zJylcbiAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGNhbmNlbCgpXG4gICAgQHBhbmVsLmRlc3Ryb3koKVxuXG4gIHZpZXdGb3JJdGVtOiAoe3RleHQsIGZpbGVOYW1lLCBsaW5lLCBjb2x1bW4sIHR5cGV9KSAtPlxuICAgIFtfLCByZWxhdGl2ZVBhdGhdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVOYW1lKVxuICAgIHJldHVybiAkJCAtPlxuICAgICAgQGxpIGNsYXNzOiAndHdvLWxpbmVzJywgPT5cbiAgICAgICAgQGRpdiBcIiN7dHlwZX0gI3t0ZXh0fVwiLCBjbGFzczogJ3ByaW1hcnktbGluZSdcbiAgICAgICAgQGRpdiBcIiN7cmVsYXRpdmVQYXRofSwgbGluZSAje2xpbmUgKyAxfVwiLCBjbGFzczogJ3NlY29uZGFyeS1saW5lJ1xuXG4gIGdldEZpbHRlcktleTogLT4gJ2ZpbGVOYW1lJ1xuXG4gIGdldEVtcHR5TWVzc2FnZTogKGl0ZW1Db3VudCkgLT5cbiAgICBpZiBpdGVtQ291bnQgaXMgMFxuICAgICAgJ05vIGRlZmluaXRpb24gZm91bmQnXG4gICAgZWxzZVxuICAgICAgc3VwZXJcblxuICBjb25maXJtZWQ6ICh7ZmlsZU5hbWUsIGxpbmUsIGNvbHVtbn0pIC0+XG4gICAgQGNhbmNlbFBvc2l0aW9uID0gbnVsbFxuICAgIEBjYW5jZWwoKVxuICAgIHByb21pc2UgPSBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVOYW1lKVxuICAgIHByb21pc2UudGhlbiAoZWRpdG9yKSAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtsaW5lLCBjb2x1bW5dKVxuICAgICAgZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKVxuXG4gIGNhbmNlbGxlZDogLT5cbiAgICBAcGFuZWw/LmhpZGUoKVxuIl19
