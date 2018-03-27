(function() {
  var $$, OverrideView, SelectListView, path, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  path = require('path');

  module.exports = OverrideView = (function(superClass) {
    extend(OverrideView, superClass);

    function OverrideView() {
      return OverrideView.__super__.constructor.apply(this, arguments);
    }

    OverrideView.prototype.initialize = function(matches) {
      OverrideView.__super__.initialize.apply(this, arguments);
      this.storeFocusedElement();
      this.addClass('symbols-view');
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setLoading('Looking for methods');
      this.focusFilterEditor();
      this.indent = 0;
      return this.bufferPosition = null;
    };

    OverrideView.prototype.destroy = function() {
      this.cancel();
      return this.panel.destroy();
    };

    OverrideView.prototype.viewForItem = function(arg) {
      var _, column, fileName, line, moduleName, name, params, parent, ref1, relativePath;
      parent = arg.parent, name = arg.name, params = arg.params, moduleName = arg.moduleName, fileName = arg.fileName, line = arg.line, column = arg.column;
      if (!line) {
        return $$(function() {
          return this.li({
            "class": 'two-lines'
          }, (function(_this) {
            return function() {
              _this.div(parent + "." + name, {
                "class": 'primary-line'
              });
              return _this.div('builtin', {
                "class": 'secondary-line'
              });
            };
          })(this));
        });
      } else {
        ref1 = atom.project.relativizePath(fileName), _ = ref1[0], relativePath = ref1[1];
        return $$(function() {
          return this.li({
            "class": 'two-lines'
          }, (function(_this) {
            return function() {
              _this.div(parent + "." + name, {
                "class": 'primary-line'
              });
              return _this.div(relativePath + ", line " + line, {
                "class": 'secondary-line'
              });
            };
          })(this));
        });
      }
    };

    OverrideView.prototype.getFilterKey = function() {
      return 'name';
    };

    OverrideView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No methods found';
      } else {
        return OverrideView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    OverrideView.prototype.confirmed = function(arg) {
      var column, editor, instance, line, line1, line2, name, params, parent, superCall, tabLength, tabText, userIndent;
      parent = arg.parent, instance = arg.instance, name = arg.name, params = arg.params, line = arg.line, column = arg.column;
      this.cancelPosition = null;
      this.cancel();
      editor = atom.workspace.getActiveTextEditor();
      tabLength = editor.getTabLength();
      line1 = "def " + name + "(" + (['self'].concat(params).join(', ')) + "):";
      superCall = "super(" + instance + ", self)." + name + "(" + (params.join(', ')) + ")";
      if (name === '__init__') {
        line2 = "" + superCall;
      } else {
        line2 = "return " + superCall;
      }
      if (this.indent < 1) {
        tabText = editor.getTabText();
        editor.insertText("" + tabText + line1);
        editor.insertNewlineBelow();
        return editor.setTextInBufferRange([[this.bufferPosition.row + 1, 0], [this.bufferPosition.row + 1, tabLength * 2]], "" + tabText + tabText + line2);
      } else {
        userIndent = editor.getTextInRange([[this.bufferPosition.row, 0], [this.bufferPosition.row, this.bufferPosition.column]]);
        editor.insertText("" + line1);
        editor.insertNewlineBelow();
        return editor.setTextInBufferRange([[this.bufferPosition.row + 1, 0], [this.bufferPosition.row + 1, tabLength * 2]], "" + userIndent + userIndent + line2);
      }
    };

    OverrideView.prototype.cancelled = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.hide() : void 0;
    };

    return OverrideView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvb3ZlcnJpZGUtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJDQUFBO0lBQUE7OztFQUFBLE1BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFdBQUQsRUFBSzs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OzsyQkFDSixVQUFBLEdBQVksU0FBQyxPQUFEO01BQ1YsOENBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxtQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxjQUFWOztRQUNBLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCOztNQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO01BQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBWSxxQkFBWjtNQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTthQUNWLElBQUMsQ0FBQSxjQUFELEdBQWtCO0lBVFI7OzJCQVdaLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLE1BQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBO0lBRk87OzJCQUlULFdBQUEsR0FBYSxTQUFDLEdBQUQ7QUFDWCxVQUFBO01BRGEscUJBQVEsaUJBQU0scUJBQVEsNkJBQVkseUJBQVUsaUJBQU07TUFDL0QsSUFBRyxDQUFJLElBQVA7QUFDRSxlQUFPLEVBQUEsQ0FBRyxTQUFBO2lCQUNSLElBQUMsQ0FBQSxFQUFELENBQUk7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFdBQVA7V0FBSixFQUF3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Q0FBc0IsQ0FDakMsQ0FBQyxJQUFDLENBQUEsY0FBYyxDQUFDLEdBQWpCLEVBQXNCLENBQXRCLENBRGlDLEVBRWpDLENBQUMsSUFBQyxDQUFBLGNBQWMsQ0FBQyxHQUFqQixFQUFzQixJQUFDLENBQUEsY0FBYyxDQUFDLE1BQXRDLENBRmlDLENBQXRCO1FBSWIsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsRUFBQSxHQUFHLEtBQXJCO1FBQ0EsTUFBTSxDQUFDLGtCQUFQLENBQUE7ZUFDQSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsQ0FDeEIsQ0FBQyxJQUFDLENBQUEsY0FBYyxDQUFDLEdBQWhCLEdBQXNCLENBQXZCLEVBQTBCLENBQTFCLENBRHdCLEVBRXhCLENBQUMsSUFBQyxDQUFBLGNBQWMsQ0FBQyxHQUFoQixHQUFzQixDQUF2QixFQUEwQixTQUFBLEdBQVksQ0FBdEMsQ0FGd0IsQ0FBNUIsRUFJRSxFQUFBLEdBQUcsVUFBSCxHQUFnQixVQUFoQixHQUE2QixLQUovQixFQWpCRjs7SUFiUzs7MkJBb0NYLFNBQUEsR0FBVyxTQUFBO0FBQ1QsVUFBQTsrQ0FBTSxDQUFFLElBQVIsQ0FBQTtJQURTOzs7O0tBekVjO0FBSjNCIiwic291cmNlc0NvbnRlbnQiOlsieyQkLCBTZWxlY3RMaXN0Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBPdmVycmlkZVZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0Vmlld1xuICBpbml0aWFsaXplOiAobWF0Y2hlcykgLT5cbiAgICBzdXBlclxuICAgIEBzdG9yZUZvY3VzZWRFbGVtZW50KClcbiAgICBAYWRkQ2xhc3MoJ3N5bWJvbHMtdmlldycpXG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHNldExvYWRpbmcoJ0xvb2tpbmcgZm9yIG1ldGhvZHMnKVxuICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG4gICAgQGluZGVudCA9IDBcbiAgICBAYnVmZmVyUG9zaXRpb24gPSBudWxsXG5cbiAgZGVzdHJveTogLT5cbiAgICBAY2FuY2VsKClcbiAgICBAcGFuZWwuZGVzdHJveSgpXG5cbiAgdmlld0Zvckl0ZW06ICh7cGFyZW50LCBuYW1lLCBwYXJhbXMsIG1vZHVsZU5hbWUsIGZpbGVOYW1lLCBsaW5lLCBjb2x1bW59KSAtPlxuICAgIGlmIG5vdCBsaW5lXG4gICAgICByZXR1cm4gJCQgLT5cbiAgICAgICAgQGxpIGNsYXNzOiAndHdvLWxpbmVzJywgPT5cbiAgICAgICAgICBAZGl2IFwiI3twYXJlbnR9LiN7bmFtZX1cIiwgY2xhc3M6ICdwcmltYXJ5LWxpbmUnXG4gICAgICAgICAgQGRpdiAnYnVpbHRpbicsIGNsYXNzOiAnc2Vjb25kYXJ5LWxpbmUnXG4gICAgZWxzZVxuICAgICAgW18sIHJlbGF0aXZlUGF0aF0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZU5hbWUpXG4gICAgICByZXR1cm4gJCQgLT5cbiAgICAgICAgQGxpIGNsYXNzOiAndHdvLWxpbmVzJywgPT5cbiAgICAgICAgICBAZGl2IFwiI3twYXJlbnR9LiN7bmFtZX1cIiwgY2xhc3M6ICdwcmltYXJ5LWxpbmUnXG4gICAgICAgICAgQGRpdiBcIiN7cmVsYXRpdmVQYXRofSwgbGluZSAje2xpbmV9XCIsIGNsYXNzOiAnc2Vjb25kYXJ5LWxpbmUnXG5cbiAgZ2V0RmlsdGVyS2V5OiAtPiAnbmFtZSdcblxuICBnZXRFbXB0eU1lc3NhZ2U6IChpdGVtQ291bnQpIC0+XG4gICAgaWYgaXRlbUNvdW50IGlzIDBcbiAgICAgICdObyBtZXRob2RzIGZvdW5kJ1xuICAgIGVsc2VcbiAgICAgIHN1cGVyXG5cbiAgY29uZmlybWVkOiAoe3BhcmVudCwgaW5zdGFuY2UsIG5hbWUsIHBhcmFtcywgbGluZSwgY29sdW1ufSkgLT5cbiAgICBAY2FuY2VsUG9zaXRpb24gPSBudWxsXG4gICAgQGNhbmNlbCgpXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgdGFiTGVuZ3RoID0gZWRpdG9yLmdldFRhYkxlbmd0aCgpXG5cbiAgICBsaW5lMSA9IFwiZGVmICN7bmFtZX0oI3tbJ3NlbGYnXS5jb25jYXQocGFyYW1zKS5qb2luKCcsICcpfSk6XCJcbiAgICBzdXBlckNhbGwgPSBcInN1cGVyKCN7aW5zdGFuY2V9LCBzZWxmKS4je25hbWV9KCN7cGFyYW1zLmpvaW4oJywgJyl9KVwiXG4gICAgaWYgbmFtZSBpbiBbJ19faW5pdF9fJ11cbiAgICAgIGxpbmUyID0gXCIje3N1cGVyQ2FsbH1cIlxuICAgIGVsc2VcbiAgICAgIGxpbmUyID0gXCJyZXR1cm4gI3tzdXBlckNhbGx9XCJcblxuICAgIGlmIEBpbmRlbnQgPCAxXG4gICAgICB0YWJUZXh0ID0gZWRpdG9yLmdldFRhYlRleHQoKVxuICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIje3RhYlRleHR9I3tsaW5lMX1cIilcbiAgICAgIGVkaXRvci5pbnNlcnROZXdsaW5lQmVsb3coKVxuICAgICAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlIFtcbiAgICAgICAgICBbQGJ1ZmZlclBvc2l0aW9uLnJvdyArIDEsIDBdLFxuICAgICAgICAgIFtAYnVmZmVyUG9zaXRpb24ucm93ICsgMSwgdGFiTGVuZ3RoICogMl1cbiAgICAgICAgXSxcbiAgICAgICAgXCIje3RhYlRleHR9I3t0YWJUZXh0fSN7bGluZTJ9XCJcblxuICAgIGVsc2VcbiAgICAgIHVzZXJJbmRlbnQgPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1xuICAgICAgICBbQGJ1ZmZlclBvc2l0aW9uLnJvdywgMF0sXG4gICAgICAgIFtAYnVmZmVyUG9zaXRpb24ucm93LCBAYnVmZmVyUG9zaXRpb24uY29sdW1uXVxuICAgICAgXSlcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiI3tsaW5lMX1cIilcbiAgICAgIGVkaXRvci5pbnNlcnROZXdsaW5lQmVsb3coKVxuICAgICAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlIFtcbiAgICAgICAgICBbQGJ1ZmZlclBvc2l0aW9uLnJvdyArIDEsIDBdLFxuICAgICAgICAgIFtAYnVmZmVyUG9zaXRpb24ucm93ICsgMSwgdGFiTGVuZ3RoICogMl1cbiAgICAgICAgXSxcbiAgICAgICAgXCIje3VzZXJJbmRlbnR9I3t1c2VySW5kZW50fSN7bGluZTJ9XCJcblxuICBjYW5jZWxsZWQ6IC0+XG4gICAgQHBhbmVsPy5oaWRlKClcbiJdfQ==
