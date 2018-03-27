(function() {
  describe("React tests", function() {
    var sampleCorrectAddonsES6File, sampleCorrectAddonsFile, sampleCorrectES6File, sampleCorrectFile, sampleCorrectNativeFile, sampleInvalidFile;
    sampleCorrectFile = require.resolve('./fixtures/sample-correct.js');
    sampleCorrectNativeFile = require.resolve('./fixtures/sample-correct-native.js');
    sampleCorrectES6File = require.resolve('./fixtures/sample-correct-es6.js');
    sampleCorrectAddonsES6File = require.resolve('./fixtures/sample-correct-addons-es6.js');
    sampleCorrectAddonsFile = require.resolve('./fixtures/sample-correct-addons.js');
    sampleInvalidFile = require.resolve('./fixtures/sample-invalid.js');
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage("language-javascript");
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage("react");
      });
      return afterEach(function() {
        atom.packages.deactivatePackages();
        return atom.packages.unloadPackages();
      });
    });
    return describe("should select correct grammar", function() {
      it("should select source.js.jsx if file has require('react')", function() {
        return waitsForPromise(function() {
          return atom.workspace.open(sampleCorrectFile, {
            autoIndent: false
          }).then(function(editor) {
            expect(editor.getGrammar().scopeName).toEqual('source.js.jsx');
            return editor.destroy();
          });
        });
      });
      it("should select source.js.jsx if file has require('react-native')", function() {
        return waitsForPromise(function() {
          return atom.workspace.open(sampleCorrectNativeFile, {
            autoIndent: false
          }).then(function(editor) {
            expect(editor.getGrammar().scopeName).toEqual('source.js.jsx');
            return editor.destroy();
          });
        });
      });
      it("should select source.js.jsx if file has require('react/addons')", function() {
        return waitsForPromise(function() {
          return atom.workspace.open(sampleCorrectAddonsFile, {
            autoIndent: false
          }).then(function(editor) {
            expect(editor.getGrammar().scopeName).toEqual('source.js.jsx');
            return editor.destroy();
          });
        });
      });
      it("should select source.js.jsx if file has react es6 import", function() {
        return waitsForPromise(function() {
          return atom.workspace.open(sampleCorrectES6File, {
            autoIndent: false
          }).then(function(editor) {
            expect(editor.getGrammar().scopeName).toEqual('source.js.jsx');
            return editor.destroy();
          });
        });
      });
      it("should select source.js.jsx if file has react/addons es6 import", function() {
        return waitsForPromise(function() {
          return atom.workspace.open(sampleCorrectAddonsES6File, {
            autoIndent: false
          }).then(function(editor) {
            expect(editor.getGrammar().scopeName).toEqual('source.js.jsx');
            return editor.destroy();
          });
        });
      });
      return it("should select source.js if file doesnt have require('react')", function() {
        return waitsForPromise(function() {
          return atom.workspace.open(sampleInvalidFile, {
            autoIndent: false
          }).then(function(editor) {
            expect(editor.getGrammar().scopeName).toEqual('source.js');
            return editor.destroy();
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcmVhY3Qvc3BlYy9hdG9tLXJlYWN0LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixRQUFBLHdJQUFBO0FBQUEsSUFBQSxpQkFBQSxHQUFvQixPQUFPLENBQUMsT0FBUixDQUFnQiw4QkFBaEIsQ0FBcEIsQ0FBQTtBQUFBLElBQ0EsdUJBQUEsR0FBMEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IscUNBQWhCLENBRDFCLENBQUE7QUFBQSxJQUVBLG9CQUFBLEdBQXVCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLGtDQUFoQixDQUZ2QixDQUFBO0FBQUEsSUFHQSwwQkFBQSxHQUE2QixPQUFPLENBQUMsT0FBUixDQUFnQix5Q0FBaEIsQ0FIN0IsQ0FBQTtBQUFBLElBSUEsdUJBQUEsR0FBMEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IscUNBQWhCLENBSjFCLENBQUE7QUFBQSxJQUtBLGlCQUFBLEdBQW9CLE9BQU8sQ0FBQyxPQUFSLENBQWdCLDhCQUFoQixDQUxwQixDQUFBO0FBQUEsSUFPQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixxQkFBOUIsRUFEYztNQUFBLENBQWhCLENBQUEsQ0FBQTtBQUFBLE1BR0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsT0FBOUIsRUFEYztNQUFBLENBQWhCLENBSEEsQ0FBQTthQU1BLFNBQUEsQ0FBVSxTQUFBLEdBQUE7QUFDUixRQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWQsQ0FBQSxDQUFBLENBQUE7ZUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWQsQ0FBQSxFQUZRO01BQUEsQ0FBVixFQVBTO0lBQUEsQ0FBWCxDQVBBLENBQUE7V0FrQkEsUUFBQSxDQUFTLCtCQUFULEVBQTBDLFNBQUEsR0FBQTtBQUN4QyxNQUFBLEVBQUEsQ0FBRywwREFBSCxFQUErRCxTQUFBLEdBQUE7ZUFDN0QsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLGlCQUFwQixFQUF1QztBQUFBLFlBQUEsVUFBQSxFQUFZLEtBQVo7V0FBdkMsQ0FBeUQsQ0FBQyxJQUExRCxDQUErRCxTQUFDLE1BQUQsR0FBQTtBQUM3RCxZQUFBLE1BQUEsQ0FBTyxNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsU0FBM0IsQ0FBcUMsQ0FBQyxPQUF0QyxDQUE4QyxlQUE5QyxDQUFBLENBQUE7bUJBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBQSxFQUY2RDtVQUFBLENBQS9ELEVBRGM7UUFBQSxDQUFoQixFQUQ2RDtNQUFBLENBQS9ELENBQUEsQ0FBQTtBQUFBLE1BTUEsRUFBQSxDQUFHLGlFQUFILEVBQXNFLFNBQUEsR0FBQTtlQUNwRSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsdUJBQXBCLEVBQTZDO0FBQUEsWUFBQSxVQUFBLEVBQVksS0FBWjtXQUE3QyxDQUErRCxDQUFDLElBQWhFLENBQXFFLFNBQUMsTUFBRCxHQUFBO0FBQ25FLFlBQUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxTQUEzQixDQUFxQyxDQUFDLE9BQXRDLENBQThDLGVBQTlDLENBQUEsQ0FBQTttQkFDQSxNQUFNLENBQUMsT0FBUCxDQUFBLEVBRm1FO1VBQUEsQ0FBckUsRUFEYztRQUFBLENBQWhCLEVBRG9FO01BQUEsQ0FBdEUsQ0FOQSxDQUFBO0FBQUEsTUFZQSxFQUFBLENBQUcsaUVBQUgsRUFBc0UsU0FBQSxHQUFBO2VBQ3BFLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQix1QkFBcEIsRUFBNkM7QUFBQSxZQUFBLFVBQUEsRUFBWSxLQUFaO1dBQTdDLENBQStELENBQUMsSUFBaEUsQ0FBcUUsU0FBQyxNQUFELEdBQUE7QUFDbkUsWUFBQSxNQUFBLENBQU8sTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFtQixDQUFDLFNBQTNCLENBQXFDLENBQUMsT0FBdEMsQ0FBOEMsZUFBOUMsQ0FBQSxDQUFBO21CQUNBLE1BQU0sQ0FBQyxPQUFQLENBQUEsRUFGbUU7VUFBQSxDQUFyRSxFQURjO1FBQUEsQ0FBaEIsRUFEb0U7TUFBQSxDQUF0RSxDQVpBLENBQUE7QUFBQSxNQWtCQSxFQUFBLENBQUcsMERBQUgsRUFBK0QsU0FBQSxHQUFBO2VBQzdELGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixvQkFBcEIsRUFBMEM7QUFBQSxZQUFBLFVBQUEsRUFBWSxLQUFaO1dBQTFDLENBQTRELENBQUMsSUFBN0QsQ0FBa0UsU0FBQyxNQUFELEdBQUE7QUFDaEUsWUFBQSxNQUFBLENBQU8sTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFtQixDQUFDLFNBQTNCLENBQXFDLENBQUMsT0FBdEMsQ0FBOEMsZUFBOUMsQ0FBQSxDQUFBO21CQUNBLE1BQU0sQ0FBQyxPQUFQLENBQUEsRUFGZ0U7VUFBQSxDQUFsRSxFQURjO1FBQUEsQ0FBaEIsRUFENkQ7TUFBQSxDQUEvRCxDQWxCQSxDQUFBO0FBQUEsTUF3QkEsRUFBQSxDQUFHLGlFQUFILEVBQXNFLFNBQUEsR0FBQTtlQUNwRSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsMEJBQXBCLEVBQWdEO0FBQUEsWUFBQSxVQUFBLEVBQVksS0FBWjtXQUFoRCxDQUFrRSxDQUFDLElBQW5FLENBQXdFLFNBQUMsTUFBRCxHQUFBO0FBQ3RFLFlBQUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxTQUEzQixDQUFxQyxDQUFDLE9BQXRDLENBQThDLGVBQTlDLENBQUEsQ0FBQTttQkFDQSxNQUFNLENBQUMsT0FBUCxDQUFBLEVBRnNFO1VBQUEsQ0FBeEUsRUFEYztRQUFBLENBQWhCLEVBRG9FO01BQUEsQ0FBdEUsQ0F4QkEsQ0FBQTthQThCQSxFQUFBLENBQUcsOERBQUgsRUFBbUUsU0FBQSxHQUFBO2VBQ2pFLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixpQkFBcEIsRUFBdUM7QUFBQSxZQUFBLFVBQUEsRUFBWSxLQUFaO1dBQXZDLENBQXlELENBQUMsSUFBMUQsQ0FBK0QsU0FBQyxNQUFELEdBQUE7QUFDN0QsWUFBQSxNQUFBLENBQU8sTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFtQixDQUFDLFNBQTNCLENBQXFDLENBQUMsT0FBdEMsQ0FBOEMsV0FBOUMsQ0FBQSxDQUFBO21CQUNBLE1BQU0sQ0FBQyxPQUFQLENBQUEsRUFGNkQ7VUFBQSxDQUEvRCxFQURjO1FBQUEsQ0FBaEIsRUFEaUU7TUFBQSxDQUFuRSxFQS9Cd0M7SUFBQSxDQUExQyxFQW5Cc0I7RUFBQSxDQUF4QixDQUFBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/react/spec/atom-react-spec.coffee
