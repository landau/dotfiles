(function() {
  var SearchViewModel, ViewModel,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ViewModel = require('./view-model').ViewModel;

  module.exports = SearchViewModel = (function(_super) {
    __extends(SearchViewModel, _super);

    function SearchViewModel(searchMotion) {
      this.searchMotion = searchMotion;
      this.confirm = __bind(this.confirm, this);
      this.decreaseHistorySearch = __bind(this.decreaseHistorySearch, this);
      this.increaseHistorySearch = __bind(this.increaseHistorySearch, this);
      SearchViewModel.__super__.constructor.call(this, this.searchMotion, {
        "class": 'search'
      });
      this.historyIndex = -1;
      atom.commands.add(this.view.editorElement, 'core:move-up', this.increaseHistorySearch);
      atom.commands.add(this.view.editorElement, 'core:move-down', this.decreaseHistorySearch);
    }

    SearchViewModel.prototype.restoreHistory = function(index) {
      return this.view.editorElement.getModel().setText(this.history(index));
    };

    SearchViewModel.prototype.history = function(index) {
      return this.vimState.getSearchHistoryItem(index);
    };

    SearchViewModel.prototype.increaseHistorySearch = function() {
      if (this.history(this.historyIndex + 1) != null) {
        this.historyIndex += 1;
        return this.restoreHistory(this.historyIndex);
      }
    };

    SearchViewModel.prototype.decreaseHistorySearch = function() {
      if (this.historyIndex <= 0) {
        this.historyIndex = -1;
        return this.view.editorElement.getModel().setText('');
      } else {
        this.historyIndex -= 1;
        return this.restoreHistory(this.historyIndex);
      }
    };

    SearchViewModel.prototype.confirm = function(view) {
      var lastSearch, repeatChar;
      repeatChar = this.searchMotion.initiallyReversed ? '?' : '/';
      if (this.view.value === '' || this.view.value === repeatChar) {
        lastSearch = this.history(0);
        if (lastSearch != null) {
          this.view.value = lastSearch;
        } else {
          this.view.value = '';
          atom.beep();
        }
      }
      SearchViewModel.__super__.confirm.call(this, view);
      return this.vimState.pushSearchHistory(this.view.value);
    };

    SearchViewModel.prototype.update = function(reverse) {
      if (reverse) {
        this.view.classList.add('reverse-search-input');
        return this.view.classList.remove('search-input');
      } else {
        this.view.classList.add('search-input');
        return this.view.classList.remove('reverse-search-input');
      }
    };

    return SearchViewModel;

  })(ViewModel);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3ZpZXctbW9kZWxzL3NlYXJjaC12aWV3LW1vZGVsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwQkFBQTtJQUFBOzttU0FBQTs7QUFBQSxFQUFDLFlBQWEsT0FBQSxDQUFRLGNBQVIsRUFBYixTQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osc0NBQUEsQ0FBQTs7QUFBYSxJQUFBLHlCQUFFLFlBQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLGVBQUEsWUFDYixDQUFBO0FBQUEsK0NBQUEsQ0FBQTtBQUFBLDJFQUFBLENBQUE7QUFBQSwyRUFBQSxDQUFBO0FBQUEsTUFBQSxpREFBTSxJQUFDLENBQUEsWUFBUCxFQUFxQjtBQUFBLFFBQUEsT0FBQSxFQUFPLFFBQVA7T0FBckIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixDQUFBLENBRGhCLENBQUE7QUFBQSxNQUdBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsSUFBSSxDQUFDLGFBQXhCLEVBQXVDLGNBQXZDLEVBQXVELElBQUMsQ0FBQSxxQkFBeEQsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLElBQUksQ0FBQyxhQUF4QixFQUF1QyxnQkFBdkMsRUFBeUQsSUFBQyxDQUFBLHFCQUExRCxDQUpBLENBRFc7SUFBQSxDQUFiOztBQUFBLDhCQU9BLGNBQUEsR0FBZ0IsU0FBQyxLQUFELEdBQUE7YUFDZCxJQUFDLENBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFwQixDQUFBLENBQThCLENBQUMsT0FBL0IsQ0FBdUMs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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/view-models/search-view-model.coffee
