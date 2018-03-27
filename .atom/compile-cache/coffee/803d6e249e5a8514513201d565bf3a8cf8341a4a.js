(function() {
  var CompositeDisposable, Mocha, ResultView, context, currentContext, mocha, os, path, resultView;

  path = require('path');

  os = require('os');

  context = require('./context');

  Mocha = require('./mocha');

  ResultView = require('./result-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  mocha = null;

  resultView = null;

  currentContext = null;

  module.exports = {
    config: {
      nodeBinaryPath: {
        type: 'string',
        "default": os.platform() === 'win32' ? 'C:\\Program Files\\nodejs\\node.exe' : '/usr/local/bin/node',
        description: 'Path to the node executable'
      },
      mochaCommand: {
        type: 'string',
        "default": os.platform() === 'win32' ? 'mocha.cmd' : 'mocha',
        description: 'Command to run mocha'
      },
      textOnlyOutput: {
        type: 'boolean',
        "default": false,
        description: 'Remove any colors from the Mocha output'
      },
      showContextInformation: {
        type: 'boolean',
        "default": false,
        description: 'Display extra information for troubleshooting'
      },
      options: {
        type: 'string',
        "default": '',
        description: 'Append given options always to Mocha binary'
      },
      optionsForDebug: {
        type: 'string',
        "default": '--debug --debug-brk',
        description: 'Append given options to Mocha binary to enable debugging'
      },
      env: {
        type: 'string',
        "default": '',
        description: 'Append environment variables'
      }
    },
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      resultView = new ResultView(state);
      this.subscriptions.add(atom.commands.add(resultView, 'result-view:close', (function(_this) {
        return function() {
          return _this.close();
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'core:cancel', (function(_this) {
        return function() {
          return _this.close();
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'core:close', (function(_this) {
        return function() {
          return _this.close();
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'mocha-test-runner:run': (function(_this) {
          return function() {
            return _this.run();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'mocha-test-runner:debug': (function(_this) {
          return function() {
            return _this.run(true);
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'mocha-test-runner:run-previous', (function(_this) {
        return function() {
          return _this.runPrevious();
        };
      })(this)));
      return this.subscriptions.add(atom.commands.add('atom-workspace', 'mocha-test-runner:debug-previous', (function(_this) {
        return function() {
          return _this.runPrevious(true);
        };
      })(this)));
    },
    deactivate: function() {
      this.close();
      this.subscriptions.dispose();
      return resultView = null;
    },
    serialize: function() {
      return resultView.serialize();
    },
    close: function() {
      var ref;
      if (mocha) {
        mocha.stop();
      }
      resultView.detach();
      return (ref = this.resultViewPanel) != null ? ref.destroy() : void 0;
    },
    run: function(inDebugMode) {
      var editor;
      if (inDebugMode == null) {
        inDebugMode = false;
      }
      editor = atom.workspace.getActivePaneItem();
      currentContext = context.find(editor);
      return this.execute(inDebugMode);
    },
    runPrevious: function(inDebugMode) {
      if (inDebugMode == null) {
        inDebugMode = false;
      }
      if (currentContext) {
        return this.execute(inDebugMode);
      } else {
        return this.displayError('No previous test run');
      }
    },
    execute: function(inDebugMode) {
      var editor, nodeBinary;
      if (inDebugMode == null) {
        inDebugMode = false;
      }
      resultView.reset();
      if (!resultView.hasParent()) {
        this.resultViewPanel = atom.workspace.addBottomPanel({
          item: resultView
        });
      }
      if (atom.config.get('mocha-test-runner.showContextInformation')) {
        nodeBinary = atom.config.get('mocha-test-runner.nodeBinaryPath');
        resultView.addLine("Node binary:    " + nodeBinary + "\n");
        resultView.addLine("Root folder:    " + currentContext.root + "\n");
        resultView.addLine("Mocha command:  " + currentContext.mochaCommand + "\n");
        resultView.addLine("Path to mocha:  " + currentContext.mocha + "\n");
        resultView.addLine("Debug-Mode:     " + inDebugMode + "\n");
        resultView.addLine("Test file:      " + currentContext.test + "\n");
        resultView.addLine("Selected test:  " + currentContext.grep + "\n\n");
      }
      editor = atom.workspace.getActivePaneItem();
      mocha = new Mocha(currentContext, inDebugMode);
      mocha.on('success', function() {
        return resultView.success();
      });
      mocha.on('failure', function() {
        return resultView.failure();
      });
      mocha.on('updateSummary', function(stats) {
        return resultView.updateSummary(stats);
      });
      mocha.on('output', function(text) {
        return resultView.addLine(text);
      });
      mocha.on('error', function(err) {
        resultView.addLine('Failed to run Mocha\n' + err.message);
        return resultView.failure();
      });
      return mocha.run();
    },
    displayError: function(message) {
      resultView.reset();
      resultView.addLine(message);
      resultView.failure();
      if (!resultView.hasParent()) {
        return atom.workspace.addBottomPanel({
          item: resultView
        });
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbW9jaGEtdGVzdC1ydW5uZXIvbGliL21vY2hhLXRlc3QtcnVubmVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFjLE9BQUEsQ0FBUSxNQUFSOztFQUNkLEVBQUEsR0FBYyxPQUFBLENBQVEsSUFBUjs7RUFDZCxPQUFBLEdBQWMsT0FBQSxDQUFRLFdBQVI7O0VBQ2QsS0FBQSxHQUFjLE9BQUEsQ0FBUSxTQUFSOztFQUNkLFVBQUEsR0FBYyxPQUFBLENBQVEsZUFBUjs7RUFFYixzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBRXhCLEtBQUEsR0FBUTs7RUFDUixVQUFBLEdBQWE7O0VBQ2IsY0FBQSxHQUFpQjs7RUFFakIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLGNBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBWSxFQUFFLENBQUMsUUFBSCxDQUFBLENBQUEsS0FBaUIsT0FBcEIsR0FBaUMscUNBQWpDLEdBQTRFLHFCQURyRjtRQUVBLFdBQUEsRUFBYSw2QkFGYjtPQURGO01BSUEsWUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFZLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxLQUFpQixPQUFwQixHQUFpQyxXQUFqQyxHQUFrRCxPQUQzRDtRQUVBLFdBQUEsRUFBYSxzQkFGYjtPQUxGO01BUUEsY0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEseUNBRmI7T0FURjtNQVlBLHNCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSwrQ0FGYjtPQWJGO01BZ0JBLE9BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsV0FBQSxFQUFhLDZDQUZiO09BakJGO01Bb0JBLGVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxxQkFEVDtRQUVBLFdBQUEsRUFBYSwwREFGYjtPQXJCRjtNQXdCQSxHQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLFdBQUEsRUFBYSw4QkFGYjtPQXpCRjtLQURGO0lBOEJBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFFUixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BRXJCLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQVcsS0FBWDtNQUVqQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLFVBQWxCLEVBQThCLG1CQUE5QixFQUFtRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLEtBQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuRCxDQUFuQjtNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLGFBQXBDLEVBQW1ELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsS0FBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5ELENBQW5CO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0MsWUFBcEMsRUFBa0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxLQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEQsQ0FBbkI7TUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLHVCQUFBLEVBQXlCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLEdBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QjtPQUFwQyxDQUFuQjtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO1FBQUEseUJBQUEsRUFBMkIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsR0FBRCxDQUFLLElBQUw7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0I7T0FBcEMsQ0FBbkI7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxnQ0FBcEMsRUFBc0UsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxXQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEUsQ0FBbkI7YUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxrQ0FBcEMsRUFBd0UsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxXQUFELENBQWEsSUFBYjtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4RSxDQUFuQjtJQWRRLENBOUJWO0lBOENBLFVBQUEsRUFBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLEtBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO2FBQ0EsVUFBQSxHQUFhO0lBSEgsQ0E5Q1o7SUFtREEsU0FBQSxFQUFXLFNBQUE7YUFDVCxVQUFVLENBQUMsU0FBWCxDQUFBO0lBRFMsQ0FuRFg7SUFzREEsS0FBQSxFQUFPLFNBQUE7QUFDTCxVQUFBO01BQUEsSUFBRyxLQUFIO1FBQWMsS0FBSyxDQUFDLElBQU4sQ0FBQSxFQUFkOztNQUNBLFVBQVUsQ0FBQyxNQUFYLENBQUE7dURBQ2dCLENBQUUsT0FBbEIsQ0FBQTtJQUhLLENBdERQO0lBMkRBLEdBQUEsRUFBSyxTQUFDLFdBQUQ7QUFDSCxVQUFBOztRQURJLGNBQWM7O01BQ2xCLE1BQUEsR0FBVyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFmLENBQUE7TUFDWCxjQUFBLEdBQWlCLE9BQU8sQ0FBQyxJQUFSLENBQWEsTUFBYjthQUNqQixJQUFDLENBQUEsT0FBRCxDQUFTLFdBQVQ7SUFIRyxDQTNETDtJQWdFQSxXQUFBLEVBQWEsU0FBQyxXQUFEOztRQUFDLGNBQWM7O01BQzFCLElBQUcsY0FBSDtlQUNFLElBQUMsQ0FBQSxPQUFELENBQVMsV0FBVCxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxZQUFELENBQWMsc0JBQWQsRUFIRjs7SUFEVyxDQWhFYjtJQXNFQSxPQUFBLEVBQVMsU0FBQyxXQUFEO0FBRVAsVUFBQTs7UUFGUSxjQUFjOztNQUV0QixVQUFVLENBQUMsS0FBWCxDQUFBO01BQ0EsSUFBRyxDQUFJLFVBQVUsQ0FBQyxTQUFYLENBQUEsQ0FBUDtRQUNFLElBQUMsQ0FBQSxlQUFELEdBQW1CLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBZixDQUE4QjtVQUFBLElBQUEsRUFBSyxVQUFMO1NBQTlCLEVBRHJCOztNQUdBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDBDQUFoQixDQUFIO1FBQ0UsVUFBQSxHQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQ0FBaEI7UUFDYixVQUFVLENBQUMsT0FBWCxDQUFtQixrQkFBQSxHQUFtQixVQUFuQixHQUE4QixJQUFqRDtRQUNBLFVBQVUsQ0FBQyxPQUFYLENBQW1CLGtCQUFBLEdBQW1CLGNBQWMsQ0FBQyxJQUFsQyxHQUF1QyxJQUExRDtRQUNBLFVBQVUsQ0FBQyxPQUFYLENBQW1CLGtCQUFBLEdBQW1CLGNBQWMsQ0FBQyxZQUFsQyxHQUErQyxJQUFsRTtRQUNBLFVBQVUsQ0FBQyxPQUFYLENBQW1CLGtCQUFBLEdBQW1CLGNBQWMsQ0FBQyxLQUFsQyxHQUF3QyxJQUEzRDtRQUNBLFVBQVUsQ0FBQyxPQUFYLENBQW1CLGtCQUFBLEdBQW1CLFdBQW5CLEdBQStCLElBQWxEO1FBQ0EsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsa0JBQUEsR0FBbUIsY0FBYyxDQUFDLElBQWxDLEdBQXVDLElBQTFEO1FBQ0EsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsa0JBQUEsR0FBbUIsY0FBYyxDQUFDLElBQWxDLEdBQXVDLE1BQTFELEVBUkY7O01BVUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWYsQ0FBQTtNQUNULEtBQUEsR0FBYSxJQUFBLEtBQUEsQ0FBTSxjQUFOLEVBQXNCLFdBQXRCO01BRWIsS0FBSyxDQUFDLEVBQU4sQ0FBUyxTQUFULEVBQW9CLFNBQUE7ZUFBRyxVQUFVLENBQUMsT0FBWCxDQUFBO01BQUgsQ0FBcEI7TUFDQSxLQUFLLENBQUMsRUFBTixDQUFTLFNBQVQsRUFBb0IsU0FBQTtlQUFHLFVBQVUsQ0FBQyxPQUFYLENBQUE7TUFBSCxDQUFwQjtNQUNBLEtBQUssQ0FBQyxFQUFOLENBQVMsZUFBVCxFQUEwQixTQUFDLEtBQUQ7ZUFBVyxVQUFVLENBQUMsYUFBWCxDQUF5QixLQUF6QjtNQUFYLENBQTFCO01BQ0EsS0FBSyxDQUFDLEVBQU4sQ0FBUyxRQUFULEVBQW1CLFNBQUMsSUFBRDtlQUFVLFVBQVUsQ0FBQyxPQUFYLENBQW1CLElBQW5CO01BQVYsQ0FBbkI7TUFDQSxLQUFLLENBQUMsRUFBTixDQUFTLE9BQVQsRUFBa0IsU0FBQyxHQUFEO1FBQ2hCLFVBQVUsQ0FBQyxPQUFYLENBQW1CLHVCQUFBLEdBQTBCLEdBQUcsQ0FBQyxPQUFqRDtlQUNBLFVBQVUsQ0FBQyxPQUFYLENBQUE7TUFGZ0IsQ0FBbEI7YUFJQSxLQUFLLENBQUMsR0FBTixDQUFBO0lBM0JPLENBdEVUO0lBb0dBLFlBQUEsRUFBYyxTQUFDLE9BQUQ7TUFDWixVQUFVLENBQUMsS0FBWCxDQUFBO01BQ0EsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsT0FBbkI7TUFDQSxVQUFVLENBQUMsT0FBWCxDQUFBO01BQ0EsSUFBRyxDQUFJLFVBQVUsQ0FBQyxTQUFYLENBQUEsQ0FBUDtlQUNFLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBZixDQUE4QjtVQUFBLElBQUEsRUFBSyxVQUFMO1NBQTlCLEVBREY7O0lBSlksQ0FwR2Q7O0FBYkYiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG5vcyAgICAgICAgICA9IHJlcXVpcmUgJ29zJ1xuY29udGV4dCAgICAgPSByZXF1aXJlICcuL2NvbnRleHQnXG5Nb2NoYSAgICAgICA9IHJlcXVpcmUgJy4vbW9jaGEnXG5SZXN1bHRWaWV3ICA9IHJlcXVpcmUgJy4vcmVzdWx0LXZpZXcnXG5cbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vY2hhID0gbnVsbFxucmVzdWx0VmlldyA9IG51bGxcbmN1cnJlbnRDb250ZXh0ID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzogIyBUaGV5IGFyZSBvbmx5IHJlYWQgdXBvbiBhY3RpdmF0aW9uIChhdG9tIGJ1Zz8pLCB0aHVzIHRoZSBhY3RpdmF0aW9uQ29tbWFuZHMgZm9yIFwic2V0dGluZ3MtdmlldzpvcGVuXCIgaW4gcGFja2FnZS5qc29uXG4gICAgbm9kZUJpbmFyeVBhdGg6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogaWYgb3MucGxhdGZvcm0oKSBpcyAnd2luMzInIHRoZW4gJ0M6XFxcXFByb2dyYW0gRmlsZXNcXFxcbm9kZWpzXFxcXG5vZGUuZXhlJyBlbHNlICcvdXNyL2xvY2FsL2Jpbi9ub2RlJ1xuICAgICAgZGVzY3JpcHRpb246ICdQYXRoIHRvIHRoZSBub2RlIGV4ZWN1dGFibGUnXG4gICAgbW9jaGFDb21tYW5kOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IGlmIG9zLnBsYXRmb3JtKCkgaXMgJ3dpbjMyJyB0aGVuICdtb2NoYS5jbWQnIGVsc2UgJ21vY2hhJ1xuICAgICAgZGVzY3JpcHRpb246ICdDb21tYW5kIHRvIHJ1biBtb2NoYSdcbiAgICB0ZXh0T25seU91dHB1dDpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiAnUmVtb3ZlIGFueSBjb2xvcnMgZnJvbSB0aGUgTW9jaGEgb3V0cHV0J1xuICAgIHNob3dDb250ZXh0SW5mb3JtYXRpb246XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogJ0Rpc3BsYXkgZXh0cmEgaW5mb3JtYXRpb24gZm9yIHRyb3VibGVzaG9vdGluZydcbiAgICBvcHRpb25zOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICBkZXNjcmlwdGlvbjogJ0FwcGVuZCBnaXZlbiBvcHRpb25zIGFsd2F5cyB0byBNb2NoYSBiaW5hcnknXG4gICAgb3B0aW9uc0ZvckRlYnVnOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICctLWRlYnVnIC0tZGVidWctYnJrJ1xuICAgICAgZGVzY3JpcHRpb246ICdBcHBlbmQgZ2l2ZW4gb3B0aW9ucyB0byBNb2NoYSBiaW5hcnkgdG8gZW5hYmxlIGRlYnVnZ2luZydcbiAgICBlbnY6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICAgIGRlc2NyaXB0aW9uOiAnQXBwZW5kIGVudmlyb25tZW50IHZhcmlhYmxlcydcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgICMgRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbSdzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXAgd2l0aCBhIENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICByZXN1bHRWaWV3ID0gbmV3IFJlc3VsdFZpZXcoc3RhdGUpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgcmVzdWx0VmlldywgJ3Jlc3VsdC12aWV3OmNsb3NlJywgPT4gQGNsb3NlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnY29yZTpjYW5jZWwnLCA9PiBAY2xvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnY29yZTpjbG9zZScsID0+IEBjbG9zZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ21vY2hhLXRlc3QtcnVubmVyOnJ1bic6ID0+IEBydW4oKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnbW9jaGEtdGVzdC1ydW5uZXI6ZGVidWcnOiA9PiBAcnVuKHRydWUpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdtb2NoYS10ZXN0LXJ1bm5lcjpydW4tcHJldmlvdXMnLCA9PiBAcnVuUHJldmlvdXMoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnbW9jaGEtdGVzdC1ydW5uZXI6ZGVidWctcHJldmlvdXMnLCA9PiBAcnVuUHJldmlvdXModHJ1ZSlcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBjbG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgcmVzdWx0VmlldyA9IG51bGxcblxuICBzZXJpYWxpemU6IC0+XG4gICAgcmVzdWx0Vmlldy5zZXJpYWxpemUoKVxuXG4gIGNsb3NlOiAtPlxuICAgIGlmIG1vY2hhIHRoZW4gbW9jaGEuc3RvcCgpXG4gICAgcmVzdWx0Vmlldy5kZXRhY2goKVxuICAgIEByZXN1bHRWaWV3UGFuZWw/LmRlc3Ryb3koKVxuXG4gIHJ1bjogKGluRGVidWdNb2RlID0gZmFsc2UpIC0+XG4gICAgZWRpdG9yICAgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpXG4gICAgY3VycmVudENvbnRleHQgPSBjb250ZXh0LmZpbmQgZWRpdG9yXG4gICAgQGV4ZWN1dGUoaW5EZWJ1Z01vZGUpXG5cbiAgcnVuUHJldmlvdXM6IChpbkRlYnVnTW9kZSA9IGZhbHNlKSAtPlxuICAgIGlmIGN1cnJlbnRDb250ZXh0XG4gICAgICBAZXhlY3V0ZShpbkRlYnVnTW9kZSlcbiAgICBlbHNlXG4gICAgICBAZGlzcGxheUVycm9yICdObyBwcmV2aW91cyB0ZXN0IHJ1bidcblxuICBleGVjdXRlOiAoaW5EZWJ1Z01vZGUgPSBmYWxzZSkgLT5cblxuICAgIHJlc3VsdFZpZXcucmVzZXQoKVxuICAgIGlmIG5vdCByZXN1bHRWaWV3Lmhhc1BhcmVudCgpXG4gICAgICBAcmVzdWx0Vmlld1BhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwgaXRlbTpyZXN1bHRWaWV3XG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQgJ21vY2hhLXRlc3QtcnVubmVyLnNob3dDb250ZXh0SW5mb3JtYXRpb24nXG4gICAgICBub2RlQmluYXJ5ID0gYXRvbS5jb25maWcuZ2V0ICdtb2NoYS10ZXN0LXJ1bm5lci5ub2RlQmluYXJ5UGF0aCdcbiAgICAgIHJlc3VsdFZpZXcuYWRkTGluZSBcIk5vZGUgYmluYXJ5OiAgICAje25vZGVCaW5hcnl9XFxuXCJcbiAgICAgIHJlc3VsdFZpZXcuYWRkTGluZSBcIlJvb3QgZm9sZGVyOiAgICAje2N1cnJlbnRDb250ZXh0LnJvb3R9XFxuXCJcbiAgICAgIHJlc3VsdFZpZXcuYWRkTGluZSBcIk1vY2hhIGNvbW1hbmQ6ICAje2N1cnJlbnRDb250ZXh0Lm1vY2hhQ29tbWFuZH1cXG5cIlxuICAgICAgcmVzdWx0Vmlldy5hZGRMaW5lIFwiUGF0aCB0byBtb2NoYTogICN7Y3VycmVudENvbnRleHQubW9jaGF9XFxuXCJcbiAgICAgIHJlc3VsdFZpZXcuYWRkTGluZSBcIkRlYnVnLU1vZGU6ICAgICAje2luRGVidWdNb2RlfVxcblwiXG4gICAgICByZXN1bHRWaWV3LmFkZExpbmUgXCJUZXN0IGZpbGU6ICAgICAgI3tjdXJyZW50Q29udGV4dC50ZXN0fVxcblwiXG4gICAgICByZXN1bHRWaWV3LmFkZExpbmUgXCJTZWxlY3RlZCB0ZXN0OiAgI3tjdXJyZW50Q29udGV4dC5ncmVwfVxcblxcblwiXG5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpXG4gICAgbW9jaGEgID0gbmV3IE1vY2hhIGN1cnJlbnRDb250ZXh0LCBpbkRlYnVnTW9kZVxuXG4gICAgbW9jaGEub24gJ3N1Y2Nlc3MnLCAtPiByZXN1bHRWaWV3LnN1Y2Nlc3MoKVxuICAgIG1vY2hhLm9uICdmYWlsdXJlJywgLT4gcmVzdWx0Vmlldy5mYWlsdXJlKClcbiAgICBtb2NoYS5vbiAndXBkYXRlU3VtbWFyeScsIChzdGF0cykgLT4gcmVzdWx0Vmlldy51cGRhdGVTdW1tYXJ5KHN0YXRzKVxuICAgIG1vY2hhLm9uICdvdXRwdXQnLCAodGV4dCkgLT4gcmVzdWx0Vmlldy5hZGRMaW5lKHRleHQpXG4gICAgbW9jaGEub24gJ2Vycm9yJywgKGVycikgLT5cbiAgICAgIHJlc3VsdFZpZXcuYWRkTGluZSgnRmFpbGVkIHRvIHJ1biBNb2NoYVxcbicgKyBlcnIubWVzc2FnZSlcbiAgICAgIHJlc3VsdFZpZXcuZmFpbHVyZSgpXG5cbiAgICBtb2NoYS5ydW4oKVxuXG5cbiAgZGlzcGxheUVycm9yOiAobWVzc2FnZSkgLT5cbiAgICByZXN1bHRWaWV3LnJlc2V0KClcbiAgICByZXN1bHRWaWV3LmFkZExpbmUgbWVzc2FnZVxuICAgIHJlc3VsdFZpZXcuZmFpbHVyZSgpXG4gICAgaWYgbm90IHJlc3VsdFZpZXcuaGFzUGFyZW50KClcbiAgICAgIGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsIGl0ZW06cmVzdWx0Vmlld1xuIl19
