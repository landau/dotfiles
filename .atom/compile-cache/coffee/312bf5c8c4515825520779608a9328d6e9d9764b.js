(function() {
  var EscapeCharacterRegex, cachedMatchesBySelector, getCachedMatch, parseScopeChain, selectorForScopeChain, selectorsMatchScopeChain, setCachedMatch, slick;

  slick = require('atom-slick');

  EscapeCharacterRegex = /[-!"#$%&'*+,\/:;=?@|^~()<>{}[\]]/g;

  cachedMatchesBySelector = new WeakMap;

  getCachedMatch = function(selector, scopeChain) {
    var cachedMatchesByScopeChain;
    if (cachedMatchesByScopeChain = cachedMatchesBySelector.get(selector)) {
      return cachedMatchesByScopeChain[scopeChain];
    }
  };

  setCachedMatch = function(selector, scopeChain, match) {
    var cachedMatchesByScopeChain;
    if (!(cachedMatchesByScopeChain = cachedMatchesBySelector.get(selector))) {
      cachedMatchesByScopeChain = {};
      cachedMatchesBySelector.set(selector, cachedMatchesByScopeChain);
    }
    return cachedMatchesByScopeChain[scopeChain] = match;
  };

  parseScopeChain = function(scopeChain) {
    var i, len, ref, ref1, results, scope;
    scopeChain = scopeChain.replace(EscapeCharacterRegex, function(match) {
      return "\\" + match[0];
    });
    ref1 = (ref = slick.parse(scopeChain)[0]) != null ? ref : [];
    results = [];
    for (i = 0, len = ref1.length; i < len; i++) {
      scope = ref1[i];
      results.push(scope);
    }
    return results;
  };

  selectorForScopeChain = function(selectors, scopeChain) {
    var cachedMatch, i, len, scopes, selector;
    for (i = 0, len = selectors.length; i < len; i++) {
      selector = selectors[i];
      cachedMatch = getCachedMatch(selector, scopeChain);
      if (cachedMatch != null) {
        if (cachedMatch) {
          return selector;
        } else {
          continue;
        }
      } else {
        scopes = parseScopeChain(scopeChain);
        while (scopes.length > 0) {
          if (selector.matches(scopes)) {
            setCachedMatch(selector, scopeChain, true);
            return selector;
          }
          scopes.pop();
        }
        setCachedMatch(selector, scopeChain, false);
      }
    }
    return null;
  };

  selectorsMatchScopeChain = function(selectors, scopeChain) {
    return selectorForScopeChain(selectors, scopeChain) != null;
  };

  module.exports = {
    parseScopeChain: parseScopeChain,
    selectorsMatchScopeChain: selectorsMatchScopeChain,
    selectorForScopeChain: selectorForScopeChain
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvc2NvcGUtaGVscGVycy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsWUFBUjs7RUFFUixvQkFBQSxHQUF1Qjs7RUFFdkIsdUJBQUEsR0FBMEIsSUFBSTs7RUFFOUIsY0FBQSxHQUFpQixTQUFDLFFBQUQsRUFBVyxVQUFYO0FBQ2YsUUFBQTtJQUFBLElBQUcseUJBQUEsR0FBNEIsdUJBQXVCLENBQUMsR0FBeEIsQ0FBNEIsUUFBNUIsQ0FBL0I7QUFDRSxhQUFPLHlCQUEwQixDQUFBLFVBQUEsRUFEbkM7O0VBRGU7O0VBSWpCLGNBQUEsR0FBaUIsU0FBQyxRQUFELEVBQVcsVUFBWCxFQUF1QixLQUF2QjtBQUNmLFFBQUE7SUFBQSxJQUFBLENBQU8sQ0FBQSx5QkFBQSxHQUE0Qix1QkFBdUIsQ0FBQyxHQUF4QixDQUE0QixRQUE1QixDQUE1QixDQUFQO01BQ0UseUJBQUEsR0FBNEI7TUFDNUIsdUJBQXVCLENBQUMsR0FBeEIsQ0FBNEIsUUFBNUIsRUFBc0MseUJBQXRDLEVBRkY7O1dBR0EseUJBQTBCLENBQUEsVUFBQSxDQUExQixHQUF3QztFQUp6Qjs7RUFNakIsZUFBQSxHQUFrQixTQUFDLFVBQUQ7QUFDaEIsUUFBQTtJQUFBLFVBQUEsR0FBYSxVQUFVLENBQUMsT0FBWCxDQUFtQixvQkFBbkIsRUFBeUMsU0FBQyxLQUFEO2FBQVcsSUFBQSxHQUFLLEtBQU0sQ0FBQSxDQUFBO0lBQXRCLENBQXpDO0FBQ2I7QUFBQTtTQUFBLHNDQUFBOzttQkFBQTtBQUFBOztFQUZnQjs7RUFJbEIscUJBQUEsR0FBd0IsU0FBQyxTQUFELEVBQVksVUFBWjtBQUN0QixRQUFBO0FBQUEsU0FBQSwyQ0FBQTs7TUFDRSxXQUFBLEdBQWMsY0FBQSxDQUFlLFFBQWYsRUFBeUIsVUFBekI7TUFDZCxJQUFHLG1CQUFIO1FBQ0UsSUFBRyxXQUFIO0FBQ0UsaUJBQU8sU0FEVDtTQUFBLE1BQUE7QUFHRSxtQkFIRjtTQURGO09BQUEsTUFBQTtRQU1FLE1BQUEsR0FBUyxlQUFBLENBQWdCLFVBQWhCO0FBQ1QsZUFBTSxNQUFNLENBQUMsTUFBUCxHQUFnQixDQUF0QjtVQUNFLElBQUcsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsTUFBakIsQ0FBSDtZQUNFLGNBQUEsQ0FBZSxRQUFmLEVBQXlCLFVBQXpCLEVBQXFDLElBQXJDO0FBQ0EsbUJBQU8sU0FGVDs7VUFHQSxNQUFNLENBQUMsR0FBUCxDQUFBO1FBSkY7UUFLQSxjQUFBLENBQWUsUUFBZixFQUF5QixVQUF6QixFQUFxQyxLQUFyQyxFQVpGOztBQUZGO1dBZ0JBO0VBakJzQjs7RUFtQnhCLHdCQUFBLEdBQTJCLFNBQUMsU0FBRCxFQUFZLFVBQVo7V0FDekI7RUFEeUI7O0VBRzNCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQUMsaUJBQUEsZUFBRDtJQUFrQiwwQkFBQSx3QkFBbEI7SUFBNEMsdUJBQUEscUJBQTVDOztBQTFDakIiLCJzb3VyY2VzQ29udGVudCI6WyJzbGljayA9IHJlcXVpcmUgJ2F0b20tc2xpY2snXG5cbkVzY2FwZUNoYXJhY3RlclJlZ2V4ID0gL1stIVwiIyQlJicqKywvOjs9P0B8Xn4oKTw+e31bXFxdXS9nXG5cbmNhY2hlZE1hdGNoZXNCeVNlbGVjdG9yID0gbmV3IFdlYWtNYXBcblxuZ2V0Q2FjaGVkTWF0Y2ggPSAoc2VsZWN0b3IsIHNjb3BlQ2hhaW4pIC0+XG4gIGlmIGNhY2hlZE1hdGNoZXNCeVNjb3BlQ2hhaW4gPSBjYWNoZWRNYXRjaGVzQnlTZWxlY3Rvci5nZXQoc2VsZWN0b3IpXG4gICAgcmV0dXJuIGNhY2hlZE1hdGNoZXNCeVNjb3BlQ2hhaW5bc2NvcGVDaGFpbl1cblxuc2V0Q2FjaGVkTWF0Y2ggPSAoc2VsZWN0b3IsIHNjb3BlQ2hhaW4sIG1hdGNoKSAtPlxuICB1bmxlc3MgY2FjaGVkTWF0Y2hlc0J5U2NvcGVDaGFpbiA9IGNhY2hlZE1hdGNoZXNCeVNlbGVjdG9yLmdldChzZWxlY3RvcilcbiAgICBjYWNoZWRNYXRjaGVzQnlTY29wZUNoYWluID0ge31cbiAgICBjYWNoZWRNYXRjaGVzQnlTZWxlY3Rvci5zZXQoc2VsZWN0b3IsIGNhY2hlZE1hdGNoZXNCeVNjb3BlQ2hhaW4pXG4gIGNhY2hlZE1hdGNoZXNCeVNjb3BlQ2hhaW5bc2NvcGVDaGFpbl0gPSBtYXRjaFxuXG5wYXJzZVNjb3BlQ2hhaW4gPSAoc2NvcGVDaGFpbikgLT5cbiAgc2NvcGVDaGFpbiA9IHNjb3BlQ2hhaW4ucmVwbGFjZSBFc2NhcGVDaGFyYWN0ZXJSZWdleCwgKG1hdGNoKSAtPiBcIlxcXFwje21hdGNoWzBdfVwiXG4gIHNjb3BlIGZvciBzY29wZSBpbiBzbGljay5wYXJzZShzY29wZUNoYWluKVswXSA/IFtdXG5cbnNlbGVjdG9yRm9yU2NvcGVDaGFpbiA9IChzZWxlY3RvcnMsIHNjb3BlQ2hhaW4pIC0+XG4gIGZvciBzZWxlY3RvciBpbiBzZWxlY3RvcnNcbiAgICBjYWNoZWRNYXRjaCA9IGdldENhY2hlZE1hdGNoKHNlbGVjdG9yLCBzY29wZUNoYWluKVxuICAgIGlmIGNhY2hlZE1hdGNoP1xuICAgICAgaWYgY2FjaGVkTWF0Y2hcbiAgICAgICAgcmV0dXJuIHNlbGVjdG9yXG4gICAgICBlbHNlXG4gICAgICAgIGNvbnRpbnVlXG4gICAgZWxzZVxuICAgICAgc2NvcGVzID0gcGFyc2VTY29wZUNoYWluKHNjb3BlQ2hhaW4pXG4gICAgICB3aGlsZSBzY29wZXMubGVuZ3RoID4gMFxuICAgICAgICBpZiBzZWxlY3Rvci5tYXRjaGVzKHNjb3BlcylcbiAgICAgICAgICBzZXRDYWNoZWRNYXRjaChzZWxlY3Rvciwgc2NvcGVDaGFpbiwgdHJ1ZSlcbiAgICAgICAgICByZXR1cm4gc2VsZWN0b3JcbiAgICAgICAgc2NvcGVzLnBvcCgpXG4gICAgICBzZXRDYWNoZWRNYXRjaChzZWxlY3Rvciwgc2NvcGVDaGFpbiwgZmFsc2UpXG5cbiAgbnVsbFxuXG5zZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4gPSAoc2VsZWN0b3JzLCBzY29wZUNoYWluKSAtPlxuICBzZWxlY3RvckZvclNjb3BlQ2hhaW4oc2VsZWN0b3JzLCBzY29wZUNoYWluKT9cblxubW9kdWxlLmV4cG9ydHMgPSB7cGFyc2VTY29wZUNoYWluLCBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4sIHNlbGVjdG9yRm9yU2NvcGVDaGFpbn1cbiJdfQ==
