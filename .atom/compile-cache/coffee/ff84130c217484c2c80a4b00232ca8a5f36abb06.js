(function() {
  describe("JSX indent", function() {
    var buffer, editor, formattedFile, formattedLines, formattedSample, fs, languageMode, sampleFile, _ref;
    fs = require('fs');
    formattedFile = require.resolve('./fixtures/sample-formatted.jsx');
    sampleFile = require.resolve('./fixtures/sample.jsx');
    formattedSample = fs.readFileSync(formattedFile);
    formattedLines = formattedSample.toString().split('\n');
    _ref = [], editor = _ref[0], buffer = _ref[1], languageMode = _ref[2];
    afterEach(function() {
      return editor.destroy();
    });
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open(sampleFile, {
          autoIndent: false
        }).then(function(o) {
          editor = o;
          return buffer = editor.buffer, languageMode = editor.languageMode, editor;
        });
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage("react");
      });
      afterEach(function() {
        atom.packages.deactivatePackages();
        return atom.packages.unloadPackages();
      });
      return runs(function() {
        var grammar;
        grammar = atom.grammars.grammarForScopeName("source.js.jsx");
        return editor.setGrammar(grammar);
      });
    });
    return describe("should indent sample file correctly", function() {
      return it("autoIndentBufferRows should indent same as sample file", function() {
        var i, line, _i, _ref1, _results;
        editor.autoIndentBufferRows(0, formattedLines.length - 1);
        _results = [];
        for (i = _i = 0, _ref1 = formattedLines.length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
          line = formattedLines[i];
          if (!line.trim()) {
            continue;
          }
          _results.push(expect((i + 1) + ":" + buffer.lineForRow(i)).toBe((i + 1) + ":" + line));
        }
        return _results;
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcmVhY3Qvc3BlYy9pbmRlbnQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLFFBQUEsa0dBQUE7QUFBQSxJQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUFMLENBQUE7QUFBQSxJQUNBLGFBQUEsR0FBZ0IsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsaUNBQWhCLENBRGhCLENBQUE7QUFBQSxJQUVBLFVBQUEsR0FBYSxPQUFPLENBQUMsT0FBUixDQUFnQix1QkFBaEIsQ0FGYixDQUFBO0FBQUEsSUFHQSxlQUFBLEdBQWtCLEVBQUUsQ0FBQyxZQUFILENBQWdCLGFBQWhCLENBSGxCLENBQUE7QUFBQSxJQUlBLGNBQUEsR0FBaUIsZUFBZSxDQUFDLFFBQWhCLENBQUEsQ0FBMEIsQ0FBQyxLQUEzQixDQUFpQyxJQUFqQyxDQUpqQixDQUFBO0FBQUEsSUFLQSxPQUFpQyxFQUFqQyxFQUFDLGdCQUFELEVBQVMsZ0JBQVQsRUFBaUIsc0JBTGpCLENBQUE7QUFBQSxJQU9BLFNBQUEsQ0FBVSxTQUFBLEdBQUE7YUFDUixNQUFNLENBQUMsT0FBUCxDQUFBLEVBRFE7SUFBQSxDQUFWLENBUEEsQ0FBQTtBQUFBLElBVUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDWixJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsVUFBcEIsRUFBZ0M7QUFBQSxVQUFBLFVBQUEsRUFBWSxLQUFaO1NBQWhDLENBQWtELENBQUMsSUFBbkQsQ0FBd0QsU0FBQyxDQUFELEdBQUE7QUFDdEQsVUFBQSxNQUFBLEdBQVMsQ0FBVCxDQUFBO2lCQUNDLGdCQUFBLE1BQUQsRUFBUyxzQkFBQSxZQUFULEVBQXlCLE9BRjZCO1FBQUEsQ0FBeEQsRUFEWTtNQUFBLENBQWhCLENBQUEsQ0FBQTtBQUFBLE1BS0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsT0FBOUIsRUFEYztNQUFBLENBQWhCLENBTEEsQ0FBQTtBQUFBLE1BUUEsU0FBQSxDQUFVLFNBQUEsR0FBQTtBQUNSLFFBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBZCxDQUFBLENBQUEsQ0FBQTtlQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBZCxDQUFBLEVBRlE7TUFBQSxDQUFWLENBUkEsQ0FBQTthQVlBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxZQUFBLE9BQUE7QUFBQSxRQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFkLENBQWtDLGVBQWxDLENBQVYsQ0FBQTtlQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLE9BQWxCLEVBRkc7TUFBQSxDQUFMLEVBYlM7SUFBQSxDQUFYLENBVkEsQ0FBQTtXQTJCQSxRQUFBLENBQVMscUNBQVQsRUFBZ0QsU0FBQSxHQUFBO2FBQzlDLEVBQUEsQ0FBRyx3REFBSCxFQUE2RCxTQUFBLEdBQUE7QUFDM0QsWUFBQSw0QkFBQTtBQUFBLFFBQUEsTUFBTSxDQUFDLG9CQUFQLENBQTRCLENBQTVCLEVBQStCLGNBQWMsQ0FBQyxNQUFmLEdBQXdCLENBQXZELENBQUEsQ0FBQTtBQUNBO2FBQVMsNkdBQVQsR0FBQTtBQUNFLFVBQUEsSUFBQSxHQUFPLGNBQWUsQ0FBQSxDQUFBLENBQXRCLENBQUE7QUFDQSxVQUFBLElBQVksQ0FBQSxJQUFLLENBQUMsSUFBTCxDQUFBLENBQWI7QUFBQSxxQkFBQTtXQURBO0FBQUEsd0JBRUEsTUFBQSxDQUFPLENBQUMsQ0FBQSxHQUFJLENBQUwsQ0FBQSxHQUFVLEdBQVYsR0FBZ0IsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsQ0FBbEIsQ0FBdkIsQ0FBNEMsQ0FBQyxJQUE3QyxDQUFtRCxDQUFDLENBQUEsR0FBSSxDQUFMLENBQUEsR0FBVSxHQUFWLEdBQWdCLElBQW5FLEVBRkEsQ0FERjtBQUFBO3dCQUYyRDtNQUFBLENBQTdELEVBRDhDO0lBQUEsQ0FBaEQsRUE1QnFCO0VBQUEsQ0FBdkIsQ0FBQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/react/spec/indent-spec.coffee
