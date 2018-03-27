(function() {
  var GlobalVimState;

  module.exports = GlobalVimState = (function() {
    function GlobalVimState() {}

    GlobalVimState.prototype.registers = {};

    GlobalVimState.prototype.searchHistory = [];

    GlobalVimState.prototype.currentSearch = {};

    GlobalVimState.prototype.currentFind = null;

    return GlobalVimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL2dsb2JhbC12aW0tc3RhdGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGNBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO2dDQUNKOztBQUFBLDZCQUFBLFNBQUEsR0FBVyxFQUFYLENBQUE7O0FBQUEsNkJBQ0EsYUFBQSxHQUFlLEVBRGYsQ0FBQTs7QUFBQSw2QkFFQSxhQUFBLEdBQWUsRUFGZixDQUFBOztBQUFBLDZCQUdBLFdBQUEsR0FBYSxJQUhiLENBQUE7OzBCQUFBOztNQUZGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/global-vim-state.coffee
