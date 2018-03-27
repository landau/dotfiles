(function() {
  var Selector, log, provider, selectorsMatchScopeChain;

  provider = require('./provider');

  log = require('./log');

  selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;

  Selector = require('selector-kit').Selector;

  module.exports = {
    priority: 1,
    providerName: 'autocomplete-python',
    disableForSelector: provider.disableForSelector + ", .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name",
    _getScopes: function(editor, range) {
      return editor.scopeDescriptorForBufferPosition(range).scopes;
    },
    getSuggestionForWord: function(editor, text, range) {
      var bufferPosition, callback, disableForSelector, scopeChain, scopeDescriptor;
      if (text === '.' || text === ':') {
        return;
      }
      if (editor.getGrammar().scopeName.indexOf('source.python') > -1) {
        bufferPosition = range.start;
        scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
        scopeChain = scopeDescriptor.getScopeChain();
        disableForSelector = Selector.create(this.disableForSelector);
        if (selectorsMatchScopeChain(disableForSelector, scopeChain)) {
          return;
        }
        if (atom.config.get('autocomplete-python.outputDebug')) {
          log.debug(range.start, this._getScopes(editor, range.start));
          log.debug(range.end, this._getScopes(editor, range.end));
        }
        callback = function() {
          return provider.goToDefinition(editor, bufferPosition);
        };
        return {
          range: range,
          callback: callback
        };
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvaHlwZXJjbGljay1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVI7O0VBQ0wsMkJBQTRCLE9BQUEsQ0FBUSxpQkFBUjs7RUFDNUIsV0FBWSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsUUFBQSxFQUFVLENBQVY7SUFFQSxZQUFBLEVBQWMscUJBRmQ7SUFJQSxrQkFBQSxFQUF1QixRQUFRLENBQUMsa0JBQVYsR0FBNkIsNk5BSm5EO0lBTUEsVUFBQSxFQUFZLFNBQUMsTUFBRCxFQUFTLEtBQVQ7QUFDVixhQUFPLE1BQU0sQ0FBQyxnQ0FBUCxDQUF3QyxLQUF4QyxDQUE4QyxDQUFDO0lBRDVDLENBTlo7SUFTQSxvQkFBQSxFQUFzQixTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsS0FBZjtBQUNwQixVQUFBO01BQUEsSUFBRyxJQUFBLEtBQVMsR0FBVCxJQUFBLElBQUEsS0FBYyxHQUFqQjtBQUNFLGVBREY7O01BRUEsSUFBRyxNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsU0FBUyxDQUFDLE9BQTlCLENBQXNDLGVBQXRDLENBQUEsR0FBeUQsQ0FBQyxDQUE3RDtRQUNFLGNBQUEsR0FBaUIsS0FBSyxDQUFDO1FBQ3ZCLGVBQUEsR0FBa0IsTUFBTSxDQUFDLGdDQUFQLENBQ2hCLGNBRGdCO1FBRWxCLFVBQUEsR0FBYSxlQUFlLENBQUMsYUFBaEIsQ0FBQTtRQUNiLGtCQUFBLEdBQXFCLFFBQVEsQ0FBQyxNQUFULENBQWdCLElBQUMsQ0FBQSxrQkFBakI7UUFDckIsSUFBRyx3QkFBQSxDQUF5QixrQkFBekIsRUFBNkMsVUFBN0MsQ0FBSDtBQUNFLGlCQURGOztRQUdBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQixDQUFIO1VBQ0UsR0FBRyxDQUFDLEtBQUosQ0FBVSxLQUFLLENBQUMsS0FBaEIsRUFBdUIsSUFBQyxDQUFBLFVBQUQsQ0FBWSxNQUFaLEVBQW9CLEtBQUssQ0FBQyxLQUExQixDQUF2QjtVQUNBLEdBQUcsQ0FBQyxLQUFKLENBQVUsS0FBSyxDQUFDLEdBQWhCLEVBQXFCLElBQUMsQ0FBQSxVQUFELENBQVksTUFBWixFQUFvQixLQUFLLENBQUMsR0FBMUIsQ0FBckIsRUFGRjs7UUFHQSxRQUFBLEdBQVcsU0FBQTtpQkFDVCxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixFQUFnQyxjQUFoQztRQURTO0FBRVgsZUFBTztVQUFDLE9BQUEsS0FBRDtVQUFRLFVBQUEsUUFBUjtVQWRUOztJQUhvQixDQVR0Qjs7QUFORiIsInNvdXJjZXNDb250ZW50IjpbInByb3ZpZGVyID0gcmVxdWlyZSAnLi9wcm92aWRlcidcbmxvZyA9IHJlcXVpcmUgJy4vbG9nJ1xue3NlbGVjdG9yc01hdGNoU2NvcGVDaGFpbn0gPSByZXF1aXJlICcuL3Njb3BlLWhlbHBlcnMnXG57U2VsZWN0b3J9ID0gcmVxdWlyZSAnc2VsZWN0b3Ita2l0J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHByaW9yaXR5OiAxXG5cbiAgcHJvdmlkZXJOYW1lOiAnYXV0b2NvbXBsZXRlLXB5dGhvbidcblxuICBkaXNhYmxlRm9yU2VsZWN0b3I6IFwiI3twcm92aWRlci5kaXNhYmxlRm9yU2VsZWN0b3J9LCAuc291cmNlLnB5dGhvbiAubnVtZXJpYywgLnNvdXJjZS5weXRob24gLmludGVnZXIsIC5zb3VyY2UucHl0aG9uIC5kZWNpbWFsLCAuc291cmNlLnB5dGhvbiAucHVuY3R1YXRpb24sIC5zb3VyY2UucHl0aG9uIC5rZXl3b3JkLCAuc291cmNlLnB5dGhvbiAuc3RvcmFnZSwgLnNvdXJjZS5weXRob24gLnZhcmlhYmxlLnBhcmFtZXRlciwgLnNvdXJjZS5weXRob24gLmVudGl0eS5uYW1lXCJcblxuICBfZ2V0U2NvcGVzOiAoZWRpdG9yLCByYW5nZSkgLT5cbiAgICByZXR1cm4gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKHJhbmdlKS5zY29wZXNcblxuICBnZXRTdWdnZXN0aW9uRm9yV29yZDogKGVkaXRvciwgdGV4dCwgcmFuZ2UpIC0+XG4gICAgaWYgdGV4dCBpbiBbJy4nLCAnOiddXG4gICAgICByZXR1cm5cbiAgICBpZiBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZS5pbmRleE9mKCdzb3VyY2UucHl0aG9uJykgPiAtMVxuICAgICAgYnVmZmVyUG9zaXRpb24gPSByYW5nZS5zdGFydFxuICAgICAgc2NvcGVEZXNjcmlwdG9yID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFxuICAgICAgICBidWZmZXJQb3NpdGlvbilcbiAgICAgIHNjb3BlQ2hhaW4gPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVDaGFpbigpXG4gICAgICBkaXNhYmxlRm9yU2VsZWN0b3IgPSBTZWxlY3Rvci5jcmVhdGUoQGRpc2FibGVGb3JTZWxlY3RvcilcbiAgICAgIGlmIHNlbGVjdG9yc01hdGNoU2NvcGVDaGFpbihkaXNhYmxlRm9yU2VsZWN0b3IsIHNjb3BlQ2hhaW4pXG4gICAgICAgIHJldHVyblxuXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24ub3V0cHV0RGVidWcnKVxuICAgICAgICBsb2cuZGVidWcgcmFuZ2Uuc3RhcnQsIEBfZ2V0U2NvcGVzKGVkaXRvciwgcmFuZ2Uuc3RhcnQpXG4gICAgICAgIGxvZy5kZWJ1ZyByYW5nZS5lbmQsIEBfZ2V0U2NvcGVzKGVkaXRvciwgcmFuZ2UuZW5kKVxuICAgICAgY2FsbGJhY2sgPSAtPlxuICAgICAgICBwcm92aWRlci5nb1RvRGVmaW5pdGlvbihlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgcmV0dXJuIHtyYW5nZSwgY2FsbGJhY2t9XG4iXX0=
