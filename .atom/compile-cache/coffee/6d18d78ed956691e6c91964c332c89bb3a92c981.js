(function() {
  describe('Linter Indie API', function() {
    var Remote, linter, wait;
    linter = null;
    wait = require('./common').wait;
    Remote = require('remote');
    beforeEach(function() {
      global.setTimeout = Remote.getGlobal('setTimeout');
      global.setInterval = Remote.getGlobal('setInterval');
      return waitsForPromise(function() {
        return atom.packages.activate('linter').then(function() {
          return linter = atom.packages.getActivePackage(linter);
        });
      });
    });
    return describe('it works', function() {
      var indieLinter;
      indieLinter = linter.indieLinter.register({
        name: 'Wow'
      });
      indieLinter.setMessages([
        {
          type: 'Error',
          text: 'Hey!'
        }
      ]);
      return waitsForPromise(function() {
        return wait(100).then(function() {
          expect(linter.messages.publicMessages.length).toBe(1);
          indieLinter.deleteMessages();
          return wait(100);
        }).then(function() {
          return expect(linter.messages.publicMessages.length).toBe(0);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvbGludGVyLWluZGllLWFwaS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUUzQixRQUFBLG9CQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsSUFBVCxDQUFBO0FBQUEsSUFDQyxPQUFRLE9BQUEsQ0FBUSxVQUFSLEVBQVIsSUFERCxDQUFBO0FBQUEsSUFFQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FGVCxDQUFBO0FBQUEsSUFJQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxNQUFNLENBQUMsVUFBUCxHQUFvQixNQUFNLENBQUMsU0FBUCxDQUFpQixZQUFqQixDQUFwQixDQUFBO0FBQUEsTUFDQSxNQUFNLENBQUMsV0FBUCxHQUFxQixNQUFNLENBQUMsU0FBUCxDQUFpQixhQUFqQixDQURyQixDQUFBO2FBRUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsUUFBdkIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxTQUFBLEdBQUE7aUJBQ3BDLE1BQUEsR0FBUyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLE1BQS9CLEVBRDJCO1FBQUEsQ0FBdEMsRUFEYztNQUFBLENBQWhCLEVBSFM7SUFBQSxDQUFYLENBSkEsQ0FBQTtXQVdBLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUEsR0FBQTtBQUNuQixVQUFBLFdBQUE7QUFBQSxNQUFBLFdBQUEsR0FBYyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQW5CLENBQTRCO0FBQUEsUUFBQyxJQUFBLEVBQU0sS0FBUDtPQUE1QixDQUFkLENBQUE7QUFBQSxNQUNBLFdBQVcsQ0FBQyxXQUFaLENBQXdCO1FBQUM7QUFBQSxVQUFDLElBQUEsRUFBTSxPQUFQO0FBQUEsVUFBZ0IsSUFBQSxFQUFNLE1BQXRCO1NBQUQ7T0FBeEIsQ0FEQSxDQUFBO2FBRUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFBLENBQUssR0FBTCxDQUFTLENBQUMsSUFBVixDQUFlLFNBQUEsR0FBQTtBQUNiLFVBQUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQXRDLENBQTZDLENBQUMsSUFBOUMsQ0FBbUQsQ0FBbkQsQ0FBQSxDQUFBO0FBQUEsVUFDQSxXQUFXLENBQUMsY0FBWixDQUFBLENBREEsQ0FBQTtpQkFFQSxJQUFBLENBQUssR0FBTCxFQUhhO1FBQUEsQ0FBZixDQUlBLENBQUMsSUFKRCxDQUlNLFNBQUEsR0FBQTtpQkFDSixNQUFBLENBQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBdEMsQ0FBNkMsQ0FBQyxJQUE5QyxDQUFtRCxDQUFuRCxFQURJO1FBQUEsQ0FKTixFQURjO01BQUEsQ0FBaEIsRUFIbUI7SUFBQSxDQUFyQixFQWIyQjtFQUFBLENBQTdCLENBQUEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/linter/spec/linter-indie-api.coffee
