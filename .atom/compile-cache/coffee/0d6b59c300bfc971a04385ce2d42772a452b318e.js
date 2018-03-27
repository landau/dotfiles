(function() {
  var closestPackage, fs, isWindows, path, selectedTest, util;

  fs = require('fs');

  path = require('path');

  util = require('util');

  selectedTest = require('./selected-test');

  isWindows = /^win/.test(process.platform);

  exports.find = function(editor) {
    var mochaBinary, mochaCommand, root;
    root = closestPackage(editor.getPath());
    if (root) {
      mochaCommand = atom.config.get('mocha-test-runner.mochaCommand');
      mochaBinary = path.join(root, 'node_modules', '.bin', mochaCommand);
      if (!fs.existsSync(mochaBinary)) {
        mochaBinary = 'mocha';
      }
      return {
        root: root,
        test: path.relative(root, editor.getPath()),
        grep: selectedTest.fromEditor(editor),
        mocha: mochaBinary
      };
    } else {
      return {
        root: path.dirname(editor.getPath()),
        test: path.basename(editor.getPath()),
        grep: selectedTest.fromEditor(editor),
        mocha: atom.config.get('mocha-test-runner.mochaCommand')
      };
    }
  };

  closestPackage = function(folder) {
    var pkg;
    pkg = path.join(folder, 'package.json');
    if (fs.existsSync(pkg)) {
      return folder;
    } else if (folder === '/') {
      return null;
    } else {
      return closestPackage(path.dirname(folder));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbW9jaGEtdGVzdC1ydW5uZXIvbGliL2NvbnRleHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQU8sT0FBQSxDQUFRLElBQVI7O0VBQ1AsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNmLFNBQUEsR0FBWSxNQUFVLENBQUMsSUFBWCxDQUFnQixPQUFPLENBQUMsUUFBeEI7O0VBRVosT0FBTyxDQUFDLElBQVIsR0FBZSxTQUFDLE1BQUQ7QUFDYixRQUFBO0lBQUEsSUFBQSxHQUFPLGNBQUEsQ0FBZSxNQUFNLENBQUMsT0FBUCxDQUFBLENBQWY7SUFDUCxJQUFHLElBQUg7TUFDRSxZQUFBLEdBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdDQUFoQjtNQUNmLFdBQUEsR0FBYyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsRUFBZ0IsY0FBaEIsRUFBZ0MsTUFBaEMsRUFBd0MsWUFBeEM7TUFDZCxJQUFHLENBQUksRUFBRSxDQUFDLFVBQUgsQ0FBYyxXQUFkLENBQVA7UUFDRSxXQUFBLEdBQWMsUUFEaEI7O2FBRUE7UUFBQSxJQUFBLEVBQU0sSUFBTjtRQUNBLElBQUEsRUFBTSxJQUFJLENBQUMsUUFBTCxDQUFjLElBQWQsRUFBb0IsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFwQixDQUROO1FBRUEsSUFBQSxFQUFNLFlBQVksQ0FBQyxVQUFiLENBQXdCLE1BQXhCLENBRk47UUFHQSxLQUFBLEVBQU8sV0FIUDtRQUxGO0tBQUEsTUFBQTthQVVFO1FBQUEsSUFBQSxFQUFNLElBQUksQ0FBQyxPQUFMLENBQWEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFiLENBQU47UUFDQSxJQUFBLEVBQU0sSUFBSSxDQUFDLFFBQUwsQ0FBYyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQWQsQ0FETjtRQUVBLElBQUEsRUFBTSxZQUFZLENBQUMsVUFBYixDQUF3QixNQUF4QixDQUZOO1FBR0EsS0FBQSxFQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEIsQ0FIUDtRQVZGOztFQUZhOztFQWlCZixjQUFBLEdBQWlCLFNBQUMsTUFBRDtBQUNmLFFBQUE7SUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLEVBQWtCLGNBQWxCO0lBQ04sSUFBRyxFQUFFLENBQUMsVUFBSCxDQUFjLEdBQWQsQ0FBSDthQUNFLE9BREY7S0FBQSxNQUVLLElBQUcsTUFBQSxLQUFVLEdBQWI7YUFDSCxLQURHO0tBQUEsTUFBQTthQUdILGNBQUEsQ0FBZSxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQWIsQ0FBZixFQUhHOztFQUpVO0FBdkJqQiIsInNvdXJjZXNDb250ZW50IjpbImZzICAgPSByZXF1aXJlICdmcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xudXRpbCA9IHJlcXVpcmUgJ3V0aWwnXG5zZWxlY3RlZFRlc3QgPSByZXF1aXJlICcuL3NlbGVjdGVkLXRlc3QnXG5pc1dpbmRvd3MgPSAvLy9ed2luLy8vLnRlc3QgcHJvY2Vzcy5wbGF0Zm9ybVxuXG5leHBvcnRzLmZpbmQgPSAoZWRpdG9yKSAtPlxuICByb290ID0gY2xvc2VzdFBhY2thZ2UgZWRpdG9yLmdldFBhdGgoKVxuICBpZiByb290XG4gICAgbW9jaGFDb21tYW5kID0gYXRvbS5jb25maWcuZ2V0ICdtb2NoYS10ZXN0LXJ1bm5lci5tb2NoYUNvbW1hbmQnXG4gICAgbW9jaGFCaW5hcnkgPSBwYXRoLmpvaW4gcm9vdCwgJ25vZGVfbW9kdWxlcycsICcuYmluJywgbW9jaGFDb21tYW5kXG4gICAgaWYgbm90IGZzLmV4aXN0c1N5bmMgbW9jaGFCaW5hcnlcbiAgICAgIG1vY2hhQmluYXJ5ID0gJ21vY2hhJ1xuICAgIHJvb3Q6IHJvb3RcbiAgICB0ZXN0OiBwYXRoLnJlbGF0aXZlIHJvb3QsIGVkaXRvci5nZXRQYXRoKClcbiAgICBncmVwOiBzZWxlY3RlZFRlc3QuZnJvbUVkaXRvciBlZGl0b3JcbiAgICBtb2NoYTogbW9jaGFCaW5hcnlcbiAgZWxzZVxuICAgIHJvb3Q6IHBhdGguZGlybmFtZSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgdGVzdDogcGF0aC5iYXNlbmFtZSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgZ3JlcDogc2VsZWN0ZWRUZXN0LmZyb21FZGl0b3IgZWRpdG9yXG4gICAgbW9jaGE6IGF0b20uY29uZmlnLmdldCAnbW9jaGEtdGVzdC1ydW5uZXIubW9jaGFDb21tYW5kJ1xuXG5jbG9zZXN0UGFja2FnZSA9IChmb2xkZXIpIC0+XG4gIHBrZyA9IHBhdGguam9pbiBmb2xkZXIsICdwYWNrYWdlLmpzb24nXG4gIGlmIGZzLmV4aXN0c1N5bmMgcGtnXG4gICAgZm9sZGVyXG4gIGVsc2UgaWYgZm9sZGVyIGlzICcvJ1xuICAgIG51bGxcbiAgZWxzZVxuICAgIGNsb3Nlc3RQYWNrYWdlIHBhdGguZGlybmFtZShmb2xkZXIpXG4iXX0=
