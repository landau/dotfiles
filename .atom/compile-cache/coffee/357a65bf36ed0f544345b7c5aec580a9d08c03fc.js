(function() {
  var extractMatch, getTestName, localeval, path;

  path = require('path');

  localeval = require('localeval');

  exports.fromEditor = function(editor) {
    var line, row, test;
    row = editor.getCursorScreenPosition().row;
    line = editor.lineTextForBufferRow(row);
    test = getTestName(line);
    return test;
  };

  getTestName = function(line) {
    var describe, it, suite, test;
    describe = extractMatch(line, /describe\s*\(?\s*['"](.*)['"]/);
    suite = extractMatch(line, /suite\s*\(?\s*['"](.*)['"]/);
    it = extractMatch(line, /it\s*\(?\s*['"](.*)['"]/);
    test = extractMatch(line, /test\s*\(?\s*['"](.*)['"]/);
    return describe || suite || it || test || null;
  };

  extractMatch = function(line, regex) {
    var matches;
    matches = regex.exec(line);
    if (matches && matches.length >= 2) {
      return localeval("'" + matches[1] + "'");
    } else {
      return null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbW9jaGEtdGVzdC1ydW5uZXIvbGliL3NlbGVjdGVkLXRlc3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQVksT0FBQSxDQUFRLE1BQVI7O0VBQ1osU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSOztFQUVaLE9BQU8sQ0FBQyxVQUFSLEdBQXFCLFNBQUMsTUFBRDtBQUNuQixRQUFBO0lBQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQWdDLENBQUM7SUFDdkMsSUFBQSxHQUFPLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixHQUE1QjtJQUNQLElBQUEsR0FBTyxXQUFBLENBQVksSUFBWjtBQUNQLFdBQU87RUFKWTs7RUFNckIsV0FBQSxHQUFjLFNBQUMsSUFBRDtBQUNaLFFBQUE7SUFBQSxRQUFBLEdBQWEsWUFBQSxDQUFhLElBQWIsRUFBbUIsK0JBQW5CO0lBQ2IsS0FBQSxHQUFhLFlBQUEsQ0FBYSxJQUFiLEVBQW1CLDRCQUFuQjtJQUNiLEVBQUEsR0FBYSxZQUFBLENBQWEsSUFBYixFQUFtQix5QkFBbkI7SUFDYixJQUFBLEdBQWEsWUFBQSxDQUFhLElBQWIsRUFBbUIsMkJBQW5CO1dBQ2IsUUFBQSxJQUFZLEtBQVosSUFBcUIsRUFBckIsSUFBMkIsSUFBM0IsSUFBbUM7RUFMdkI7O0VBT2QsWUFBQSxHQUFlLFNBQUMsSUFBRCxFQUFPLEtBQVA7QUFDYixRQUFBO0lBQUEsT0FBQSxHQUFVLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtJQUNWLElBQUcsT0FBQSxJQUFZLE9BQU8sQ0FBQyxNQUFSLElBQWtCLENBQWpDO2FBQ0UsU0FBQSxDQUFVLEdBQUEsR0FBSSxPQUFRLENBQUEsQ0FBQSxDQUFaLEdBQWUsR0FBekIsRUFERjtLQUFBLE1BQUE7YUFHRSxLQUhGOztFQUZhO0FBaEJmIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCAgICAgID0gcmVxdWlyZSAncGF0aCdcbmxvY2FsZXZhbCA9IHJlcXVpcmUgJ2xvY2FsZXZhbCdcblxuZXhwb3J0cy5mcm9tRWRpdG9yID0gKGVkaXRvcikgLT5cbiAgcm93ID0gZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKCkucm93XG4gIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG4gIHRlc3QgPSBnZXRUZXN0TmFtZSBsaW5lXG4gIHJldHVybiB0ZXN0XG5cbmdldFRlc3ROYW1lID0gKGxpbmUpIC0+XG4gIGRlc2NyaWJlICAgPSBleHRyYWN0TWF0Y2ggbGluZSwgL2Rlc2NyaWJlXFxzKlxcKD9cXHMqWydcIl0oLiopWydcIl0vXG4gIHN1aXRlICAgICAgPSBleHRyYWN0TWF0Y2ggbGluZSwgL3N1aXRlXFxzKlxcKD9cXHMqWydcIl0oLiopWydcIl0vXG4gIGl0ICAgICAgICAgPSBleHRyYWN0TWF0Y2ggbGluZSwgL2l0XFxzKlxcKD9cXHMqWydcIl0oLiopWydcIl0vXG4gIHRlc3QgICAgICAgPSBleHRyYWN0TWF0Y2ggbGluZSwgL3Rlc3RcXHMqXFwoP1xccypbJ1wiXSguKilbJ1wiXS9cbiAgZGVzY3JpYmUgb3Igc3VpdGUgb3IgaXQgb3IgdGVzdCBvciBudWxsXG5cbmV4dHJhY3RNYXRjaCA9IChsaW5lLCByZWdleCkgLT5cbiAgbWF0Y2hlcyA9IHJlZ2V4LmV4ZWMgbGluZVxuICBpZiBtYXRjaGVzIGFuZCBtYXRjaGVzLmxlbmd0aCA+PSAyXG4gICAgbG9jYWxldmFsIFwiJyN7bWF0Y2hlc1sxXX0nXCJcbiAgZWxzZVxuICAgIG51bGxcbiJdfQ==
