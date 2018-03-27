(function() {
  var $, PATH_REGEX, Point, fs, path;

  fs = require('fs');

  path = require('path');

  Point = require('atom').Point;

  $ = require('atom-space-pen-views').$;

  PATH_REGEX = /((?:\w:)?[^:\s\(\)]+):(\d+):(\d+)/g;

  module.exports.link = function(line) {
    if (line == null) {
      return null;
    }
    return line.replace(PATH_REGEX, '<a class="flink">$&</a>');
  };

  module.exports.attachClickHandler = function() {
    return $(document).on('click', '.flink', module.exports.clicked);
  };

  module.exports.removeClickHandler = function() {
    return $(document).off('click', '.flink', module.exports.clicked);
  };

  module.exports.clicked = function() {
    var extendedPath;
    extendedPath = this.innerHTML;
    return module.exports.open(extendedPath);
  };

  module.exports.open = function(extendedPath) {
    var col, filename, parts, ref, row;
    parts = PATH_REGEX.exec(extendedPath);
    if (parts == null) {
      return;
    }
    ref = parts.slice(1), filename = ref[0], row = ref[1], col = ref[2];
    if (filename == null) {
      return;
    }
    if (!fs.existsSync(filename)) {
      alert("File not found: " + filename);
      return;
    }
    return atom.workspace.open(filename).then(function() {
      var editor, position;
      if (row == null) {
        return;
      }
      row = Math.max(row - 1, 0);
      col = Math.max(~~col - 1, 0);
      position = new Point(row, col);
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      editor.scrollToBufferPosition(position, {
        center: true
      });
      return editor.setCursorBufferPosition(position);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbW9jaGEtdGVzdC1ydW5uZXIvbGliL2NsaWNrYWJsZS1wYXRocy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUjs7RUFDVixJQUFBLEdBQVUsT0FBQSxDQUFRLE1BQVI7O0VBQ1QsUUFBUyxPQUFBLENBQVEsTUFBUjs7RUFDVCxJQUFTLE9BQUEsQ0FBUSxzQkFBUjs7RUFFVixVQUFBLEdBQWE7O0VBRWIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFmLEdBQXNCLFNBQUMsSUFBRDtJQUNwQixJQUFtQixZQUFuQjtBQUFBLGFBQU8sS0FBUDs7V0FDQSxJQUFJLENBQUMsT0FBTCxDQUFhLFVBQWIsRUFBd0IseUJBQXhCO0VBRm9COztFQUt0QixNQUFNLENBQUMsT0FBTyxDQUFDLGtCQUFmLEdBQW9DLFNBQUE7V0FDbEMsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEVBQVosQ0FBZSxPQUFmLEVBQXdCLFFBQXhCLEVBQWtDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBakQ7RUFEa0M7O0VBR3BDLE1BQU0sQ0FBQyxPQUFPLENBQUMsa0JBQWYsR0FBb0MsU0FBQTtXQUNsQyxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsR0FBWixDQUFnQixPQUFoQixFQUF5QixRQUF6QixFQUFtQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQWxEO0VBRGtDOztFQUdwQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQWYsR0FBeUIsU0FBQTtBQUN2QixRQUFBO0lBQUEsWUFBQSxHQUFlLElBQUksQ0FBQztXQUNwQixNQUFNLENBQUMsT0FBTyxDQUFDLElBQWYsQ0FBb0IsWUFBcEI7RUFGdUI7O0VBS3pCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBZixHQUFzQixTQUFDLFlBQUQ7QUFDcEIsUUFBQTtJQUFBLEtBQUEsR0FBUSxVQUFVLENBQUMsSUFBWCxDQUFnQixZQUFoQjtJQUNSLElBQWMsYUFBZDtBQUFBLGFBQUE7O0lBRUEsTUFBcUIsS0FBSyxDQUFDLEtBQU4sQ0FBWSxDQUFaLENBQXJCLEVBQUMsaUJBQUQsRUFBVSxZQUFWLEVBQWM7SUFDZCxJQUFjLGdCQUFkO0FBQUEsYUFBQTs7SUFFQSxJQUFBLENBQU8sRUFBRSxDQUFDLFVBQUgsQ0FBYyxRQUFkLENBQVA7TUFDRSxLQUFBLENBQU0sa0JBQUEsR0FBbUIsUUFBekI7QUFDQSxhQUZGOztXQUlBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixRQUFwQixDQUNBLENBQUMsSUFERCxDQUNNLFNBQUE7QUFDSixVQUFBO01BQUEsSUFBYyxXQUFkO0FBQUEsZUFBQTs7TUFHQSxHQUFBLEdBQU0sSUFBSSxDQUFDLEdBQUwsQ0FBUyxHQUFBLEdBQU0sQ0FBZixFQUFrQixDQUFsQjtNQUNOLEdBQUEsR0FBTSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUMsQ0FBQyxHQUFGLEdBQVEsQ0FBakIsRUFBb0IsQ0FBcEI7TUFDTixRQUFBLEdBQWUsSUFBQSxLQUFBLENBQU0sR0FBTixFQUFXLEdBQVg7TUFFZixNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO01BQ1QsSUFBYyxjQUFkO0FBQUEsZUFBQTs7TUFFQSxNQUFNLENBQUMsc0JBQVAsQ0FBOEIsUUFBOUIsRUFBd0M7UUFBQSxNQUFBLEVBQU8sSUFBUDtPQUF4QzthQUNBLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixRQUEvQjtJQVpJLENBRE47RUFYb0I7QUF2QnRCIiwic291cmNlc0NvbnRlbnQiOlsiZnMgICAgICA9IHJlcXVpcmUgJ2ZzJ1xucGF0aCAgICA9IHJlcXVpcmUgJ3BhdGgnXG57UG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcbnskfSAgICAgPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuUEFUSF9SRUdFWCA9IC8oKD86XFx3Oik/W146XFxzXFwoXFwpXSspOihcXGQrKTooXFxkKykvZ1xuXG5tb2R1bGUuZXhwb3J0cy5saW5rID0gKGxpbmUpIC0+XG4gIHJldHVybiBudWxsIHVubGVzcyBsaW5lP1xuICBsaW5lLnJlcGxhY2UoUEFUSF9SRUdFWCwnPGEgY2xhc3M9XCJmbGlua1wiPiQmPC9hPicpXG5cblxubW9kdWxlLmV4cG9ydHMuYXR0YWNoQ2xpY2tIYW5kbGVyID0gLT5cbiAgJChkb2N1bWVudCkub24gJ2NsaWNrJywgJy5mbGluaycsIG1vZHVsZS5leHBvcnRzLmNsaWNrZWRcblxubW9kdWxlLmV4cG9ydHMucmVtb3ZlQ2xpY2tIYW5kbGVyID0gLT5cbiAgJChkb2N1bWVudCkub2ZmICdjbGljaycsICcuZmxpbmsnLCBtb2R1bGUuZXhwb3J0cy5jbGlja2VkXG5cbm1vZHVsZS5leHBvcnRzLmNsaWNrZWQgPSAtPlxuICBleHRlbmRlZFBhdGggPSB0aGlzLmlubmVySFRNTFxuICBtb2R1bGUuZXhwb3J0cy5vcGVuKGV4dGVuZGVkUGF0aClcblxuXG5tb2R1bGUuZXhwb3J0cy5vcGVuID0gKGV4dGVuZGVkUGF0aCkgLT5cbiAgcGFydHMgPSBQQVRIX1JFR0VYLmV4ZWMoZXh0ZW5kZWRQYXRoKVxuICByZXR1cm4gdW5sZXNzIHBhcnRzP1xuXG4gIFtmaWxlbmFtZSxyb3csY29sXSA9IHBhcnRzLnNsaWNlKDEpXG4gIHJldHVybiB1bmxlc3MgZmlsZW5hbWU/XG5cbiAgdW5sZXNzIGZzLmV4aXN0c1N5bmMoZmlsZW5hbWUpXG4gICAgYWxlcnQgXCJGaWxlIG5vdCBmb3VuZDogI3tmaWxlbmFtZX1cIlxuICAgIHJldHVyblxuXG4gIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZW5hbWUpXG4gIC50aGVuIC0+XG4gICAgcmV0dXJuIHVubGVzcyByb3c/XG5cbiAgICAjIGFsaWduIGNvb3JkaW5hdGVzIDAtaW5kZXgtYmFzZWRcbiAgICByb3cgPSBNYXRoLm1heChyb3cgLSAxLCAwKVxuICAgIGNvbCA9IE1hdGgubWF4KH5+Y29sIC0gMSwgMClcbiAgICBwb3NpdGlvbiA9IG5ldyBQb2ludChyb3csIGNvbClcblxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yP1xuXG4gICAgZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24ocG9zaXRpb24sIGNlbnRlcjp0cnVlKVxuICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihwb3NpdGlvbilcbiJdfQ==
