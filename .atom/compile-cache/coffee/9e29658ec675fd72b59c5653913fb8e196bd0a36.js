(function() {
  var TagMacher;

  TagMacher = (function() {
    TagMacher.prototype.startRegex = /\S/;

    TagMacher.prototype.endRegex = /\S(\s+)?$/;

    function TagMacher(editor) {
      this.editor = editor;
    }

    TagMacher.prototype.lineStartsWithOpeningTag = function(bufferLine) {
      var match, scopeDescriptor;
      if (match = bufferLine.match(/\S/)) {
        scopeDescriptor = this.editor.tokenForBufferPosition([bufferRow, match.index]);
        return scopeDescriptor.scopes.indexOf('tag.open.js') > -1 && scopeDescriptor.scopes.indexOf('meta.tag.attribute-name.js') === -1;
      }
      return false;
    };

    TagMacher.prototype.lineStartWithAttribute = function(bufferLine) {
      var match, scopeDescriptor;
      if (match = bufferLine.match(/\S/)) {
        scopeDescriptor = this.editor.tokenForBufferPosition([bufferRow, match.index]);
        return scopeDescriptor.scopes.indexOf('meta.tag.attribute-name.js') > -1;
      }
      return false;
    };

    TagMacher.prototype.lineStartsWithClosingTag = function(bufferRow) {
      var match, scopeDescriptor;
      if (match = bufferLine.match(/\S/)) {
        scopeDescriptor = this.editor.tokenForBufferPosition([bufferRow, match.index]);
        return scopeDescriptor.scopes.indexOf('tag.closed.js') > -1;
      }
      return false;
    };

    return TagMacher;

  })();

  module.exports = TagMacher;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcmVhY3QvbGliL3RhZy1tYXRjaGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxTQUFBOztBQUFBLEVBQU07QUFDSix3QkFBQSxVQUFBLEdBQVksSUFBWixDQUFBOztBQUFBLHdCQUNBLFFBQUEsR0FBVSxXQURWLENBQUE7O0FBR2EsSUFBQSxtQkFBQyxNQUFELEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsTUFBVixDQURXO0lBQUEsQ0FIYjs7QUFBQSx3QkFNQSx3QkFBQSxHQUEwQixTQUFDLFVBQUQsR0FBQTtBQUN4QixVQUFBLHNCQUFBO0FBQUEsTUFBQSxJQUFHLEtBQUEsR0FBUSxVQUFVLENBQUMsS0FBWCxDQUFpQixJQUFqQixDQUFYO0FBQ0UsUUFBQSxlQUFBLEdBQWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsc0JBQVIsQ0FBK0IsQ0FBQyxTQUFELEVBQVksS0FBSyxDQUFDLEtBQWxCLENBQS9CLENBQWxCLENBQUE7QUFDQSxlQUFPLGVBQWUsQ0FBQyxNQUFNLENBQUMsT0FBdkIsQ0FBK0IsYUFBL0IsQ0FBQSxHQUFnRCxDQUFBLENBQWhELElBQ0EsZUFBZSxDQUFDLE1BQU0sQ0FBQyxPQUF2QixDQUErQiw0QkFBL0IsQ0FBQSxLQUFnRSxDQUFBLENBRHZFLENBRkY7T0FBQTtBQUtBLGFBQU8sS0FBUCxDQU53QjtJQUFBLENBTjFCLENBQUE7O0FBQUEsd0JBY0Esc0JBQUEsR0FBd0IsU0FBQyxVQUFELEdBQUE7QUFDdEIsVUFBQSxzQkFBQTtBQUFBLE1BQUEsSUFBRyxLQUFBLEdBQVEsVUFBVSxDQUFDLEtBQVgsQ0FBaUIsSUFBakIsQ0FBWDtBQUNFLFFBQUEsZUFBQSxHQUFrQixJQUFDLENBQUEsTUFBTSxDQUFDLHNCQUFSLENBQStCLENBQUMsU0FBRCxFQUFZLEtBQUssQ0FBQyxLQUFsQixDQUEvQixDQUFsQixDQUFBO0FBQ0EsZUFBTyxlQUFlLENBQUMsTUFBTSxDQUFDLE9BQXZCLENBQStCLDRCQUEvQixDQUFBLEdBQStELENBQUEsQ0FBdEUsQ0FGRjtPQUFBO0FBSUEsYUFBTyxLQUFQLENBTHNCO0lBQUEsQ0FkeEIsQ0FBQTs7QUFBQSx3QkFxQkEsd0JBQUEsR0FBMEIsU0FBQyxTQUFELEdBQUE7QUFDeEIsVUFBQSxzQkFBQTtBQUFBLE1BQUEsSUFBRyxLQUFBLEdBQVEsVUFBVSxDQUFDLEtBQVgsQ0FBaUIsSUFBakIsQ0FBWDtBQUNFLFFBQUEsZUFBQSxHQUFrQixJQUFDLENBQUEsTUFBTSxDQUFDLHNCQUFSLENBQStCLENBQUMsU0FBRCxFQUFZLEtBQUssQ0FBQyxLQUFsQixDQUEvQixDQUFsQixDQUFBO0FBQ0EsZUFBTyxlQUFlLENBQUMsTUFBTSxDQUFDLE9BQXZCLENBQStCLGVBQS9CLENBQUEsR0FBa0QsQ0FBQSxDQUF6RCxDQUZGO09BQUE7QUFJQSxhQUFPLEtBQVAsQ0FMd0I7SUFBQSxDQXJCMUIsQ0FBQTs7cUJBQUE7O01BREYsQ0FBQTs7QUFBQSxFQTZCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQTdCakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/react/lib/tag-matcher.coffee
