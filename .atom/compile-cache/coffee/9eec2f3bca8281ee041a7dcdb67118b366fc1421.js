(function() {
  var copyCharacterFromAbove, copyCharacterFromBelow;

  copyCharacterFromAbove = function(editor, vimState) {
    return editor.transact(function() {
      var column, cursor, range, row, _i, _len, _ref, _ref1, _results;
      _ref = editor.getCursors();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cursor = _ref[_i];
        _ref1 = cursor.getScreenPosition(), row = _ref1.row, column = _ref1.column;
        if (row === 0) {
          continue;
        }
        range = [[row - 1, column], [row - 1, column + 1]];
        _results.push(cursor.selection.insertText(editor.getTextInBufferRange(editor.bufferRangeForScreenRange(range))));
      }
      return _results;
    });
  };

  copyCharacterFromBelow = function(editor, vimState) {
    return editor.transact(function() {
      var column, cursor, range, row, _i, _len, _ref, _ref1, _results;
      _ref = editor.getCursors();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cursor = _ref[_i];
        _ref1 = cursor.getScreenPosition(), row = _ref1.row, column = _ref1.column;
        range = [[row + 1, column], [row + 1, column + 1]];
        _results.push(cursor.selection.insertText(editor.getTextInBufferRange(editor.bufferRangeForScreenRange(range))));
      }
      return _results;
    });
  };

  module.exports = {
    copyCharacterFromAbove: copyCharacterFromAbove,
    copyCharacterFromBelow: copyCharacterFromBelow
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL2luc2VydC1tb2RlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4Q0FBQTs7QUFBQSxFQUFBLHNCQUFBLEdBQXlCLFNBQUMsTUFBRCxFQUFTLFFBQVQsR0FBQTtXQUN2QixNQUFNLENBQUMsUUFBUCxDQUFnQixTQUFBLEdBQUE7QUFDZCxVQUFBLDJEQUFBO0FBQUE7QUFBQTtXQUFBLDJDQUFBOzBCQUFBO0FBQ0UsUUFBQSxRQUFnQixNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUFoQixFQUFDLFlBQUEsR0FBRCxFQUFNLGVBQUEsTUFBTixDQUFBO0FBQ0EsUUFBQSxJQUFZLEdBQUEsS0FBTyxDQUFuQjtBQUFBLG1CQUFBO1NBREE7QUFBQSxRQUVBLEtBQUEsR0FBUSxDQUFDLENBQUMsR0FBQSxHQUFJLENBQUwsRUFBUSxNQUFSLENBQUQsRUFBa0IsQ0FBQyxHQUFBLEdBQUksQ0FBTCxFQUFRLE1BQUEsR0FBTyxDQUFmLENBQWxCLENBRlIsQ0FBQTtBQUFBLHNCQUdBLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBakIsQ0FBNEIsTUFBTSxDQUFDLG9CQUFQLENBQTRCLE1BQU0sQ0FBQyx5QkFBUCxDQUFpQyxLQUFqQyxDQUE1QixDQUE1QixFQUhBLENBREY7QUFBQTtzQkFEYztJQUFBLENBQWhCLEVBRHVCO0VBQUEsQ0FBekIsQ0FBQTs7QUFBQSxFQVFBLHNCQUFBLEdBQXlCLFNBQUMsTUFBRCxFQUFTLFFBQVQsR0FBQTtXQUN2QixNQUFNLENBQUMsUUFBUCxDQUFnQixTQUFBLEdBQUE7QUFDZCxVQUFBLDJEQUFBO0FBQUE7QUFBQTtXQUFBLDJDQUFBOzBCQUFBO0FBQ0UsUUFBQSxRQUFnQixNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUFoQixFQUFDLFlBQUEsR0FBRCxFQUFNLGVBQUEsTUFBTixDQUFBO0FBQUEsUUFDQSxLQUFBLEdBQVEsQ0FBQyxDQUFDLEdBQUEsR0FBSSxDQUFMLEVBQVEsTUFBUixDQUFELEVBQWtCLENBQUMsR0FBQSxHQUFJLENBQUwsRUFBUSxNQUFBLEdBQU8sQ0FBZixDQUFsQixDQURSLENBQUE7QUFBQSxzQkFFQSxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQWpCLENBQTRCLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixNQUFNLENBQUMseUJBQVAsQ0FBaUMsS0FBakMsQ0FBNUIsQ0FBNUIsRUFGQSxDQURGO0FBQUE7c0JBRGM7SUFBQSxDQUFoQixFQUR1QjtFQUFBLENBUnpCLENBQUE7O0FBQUEsRUFlQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBQ2Ysd0JBQUEsc0JBRGU7QUFBQSxJQUVmLHdCQUFBLHNCQUZlO0dBZmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/insert-mode.coffee
