(function() {
  var MochaWrapper, STATS_MATCHER, ansi, clickablePaths, escape, events, fs, kill, killTree, path, psTree, spawn, util,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fs = require('fs');

  path = require('path');

  util = require('util');

  events = require('events');

  escape = require('jsesc');

  ansi = require('ansi-html-stream');

  psTree = require('process-tree');

  spawn = require('child_process').spawn;

  kill = require('tree-kill');

  clickablePaths = require('./clickable-paths');

  STATS_MATCHER = /\d+\s+(?:failing|passing|pending)/g;

  module.exports = MochaWrapper = (function(superClass) {
    extend(MochaWrapper, superClass);

    function MochaWrapper(context, debugMode) {
      var optionsForDebug;
      this.context = context;
      if (debugMode == null) {
        debugMode = false;
      }
      this.mocha = null;
      this.node = atom.config.get('mocha-test-runner.nodeBinaryPath');
      this.mochaCommand = atom.config.get('mocha-test-runner.mochaCommand');
      this.textOnly = atom.config.get('mocha-test-runner.textOnlyOutput');
      this.options = atom.config.get('mocha-test-runner.options');
      this.env = atom.config.get('mocha-test-runner.env');
      if (debugMode) {
        optionsForDebug = atom.config.get('mocha-test-runner.optionsForDebug');
        this.options = this.options + " " + optionsForDebug;
      }
      this.resetStatistics();
    }

    MochaWrapper.prototype.stop = function() {
      if (this.mocha != null) {
        killTree(this.mocha.pid);
        return this.mocha = null;
      }
    };

    MochaWrapper.prototype.run = function() {
      var env, flags, index, key, name, opts, ref, ref1, stream, value;
      flags = [this.context.test];
      env = {
        PATH: [process.env.PATH, path.dirname(this.node)].join(':')
      };
      if (this.env) {
        ref = this.env.split(' ');
        for (index in ref) {
          name = ref[index];
          ref1 = name.split('='), key = ref1[0], value = ref1[1];
          env[key] = value;
        }
      }
      if (this.textOnly) {
        flags.push('--no-colors');
      } else {
        flags.push('--colors');
      }
      if (this.context.grep) {
        flags.push('--grep');
        flags.push(escape(this.context.grep, {
          escapeEverything: true
        }));
      }
      if (this.options) {
        Array.prototype.push.apply(flags, this.options.split(' '));
      }
      opts = {
        cwd: this.context.root,
        env: env
      };
      this.resetStatistics();
      this.mocha = spawn(this.context.mocha, flags, opts);
      if (this.textOnly) {
        this.mocha.stdout.on('data', (function(_this) {
          return function(data) {
            _this.parseStatistics(data);
            return _this.emit('output', data.toString());
          };
        })(this));
        this.mocha.stderr.on('data', (function(_this) {
          return function(data) {
            _this.parseStatistics(data);
            return _this.emit('output', data.toString());
          };
        })(this));
      } else {
        stream = ansi({
          chunked: false
        });
        this.mocha.stdout.pipe(stream);
        this.mocha.stderr.pipe(stream);
        stream.on('data', (function(_this) {
          return function(data) {
            _this.parseStatistics(data);
            return _this.emit('output', clickablePaths.link(data.toString()));
          };
        })(this));
      }
      this.mocha.on('error', (function(_this) {
        return function(err) {
          return _this.emit('error', err);
        };
      })(this));
      return this.mocha.on('exit', (function(_this) {
        return function(code) {
          if (code === 0) {
            return _this.emit('success', _this.stats);
          } else {
            return _this.emit('failure', _this.stats);
          }
        };
      })(this));
    };

    MochaWrapper.prototype.resetStatistics = function() {
      return this.stats = [];
    };

    MochaWrapper.prototype.parseStatistics = function(data) {
      var matches, results, stat;
      results = [];
      while (matches = STATS_MATCHER.exec(data)) {
        stat = matches[0];
        this.stats.push(stat);
        results.push(this.emit('updateSummary', this.stats));
      }
      return results;
    };

    return MochaWrapper;

  })(events.EventEmitter);

  killTree = function(pid, signal, callback) {
    signal = signal || 'SIGKILL';
    callback = callback || (function() {});
    return psTree(pid, function(err, children) {
      var childrenPid;
      childrenPid = children.map(function(p) {
        return p.PID;
      });
      [pid].concat(childrenPid).forEach(function(tpid) {
        var ex;
        try {
          return kill(tpid, signal);
        } catch (error) {
          ex = error;
          return console.log("Failed to " + signal + " " + tpid);
        }
      });
      return callback();
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbW9jaGEtdGVzdC1ydW5uZXIvbGliL21vY2hhLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZ0hBQUE7SUFBQTs7O0VBQUEsRUFBQSxHQUFTLE9BQUEsQ0FBUSxJQUFSOztFQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7RUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0VBQ1QsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULE1BQUEsR0FBUyxPQUFBLENBQVEsT0FBUjs7RUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLGtCQUFSOztFQUNULE1BQUEsR0FBUyxPQUFBLENBQVEsY0FBUjs7RUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVIsQ0FBd0IsQ0FBQzs7RUFDbEMsSUFBQSxHQUFTLE9BQUEsQ0FBUSxXQUFSOztFQUVULGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSOztFQUVqQixhQUFBLEdBQWdCOztFQUVoQixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7O0lBRVIsc0JBQUMsT0FBRCxFQUFXLFNBQVg7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFVBQUQ7O1FBQVUsWUFBWTs7TUFDbEMsSUFBQyxDQUFBLEtBQUQsR0FBUztNQUNULElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtDQUFoQjtNQUNSLElBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEI7TUFDaEIsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0NBQWhCO01BQ1osSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMkJBQWhCO01BQ1gsSUFBQyxD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Q0FBQyxJQUFkLENBQW1CLElBQW5CLENBQWhCO1FBQ0UsSUFBQSxHQUFPLE9BQVEsQ0FBQSxDQUFBO1FBQ2YsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWjtxQkFDQSxJQUFDLENBQUEsSUFBRCxDQUFNLGVBQU4sRUFBdUIsSUFBQyxDQUFBLEtBQXhCO01BSEYsQ0FBQTs7SUFEZTs7OztLQWpGeUIsTUFBTSxDQUFDOztFQXdGbkQsUUFBQSxHQUFXLFNBQUMsR0FBRCxFQUFNLE1BQU4sRUFBYyxRQUFkO0lBQ1QsTUFBQSxHQUFTLE1BQUEsSUFBVTtJQUNuQixRQUFBLEdBQVcsUUFBQSxJQUFZLENBQUMsU0FBQSxHQUFBLENBQUQ7V0FDdkIsTUFBQSxDQUFPLEdBQVAsRUFBWSxTQUFDLEdBQUQsRUFBTSxRQUFOO0FBQ1YsVUFBQTtNQUFBLFdBQUEsR0FBYyxRQUFRLENBQUMsR0FBVCxDQUFhLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQztNQUFULENBQWI7TUFDZCxDQUFDLEdBQUQsQ0FBSyxDQUFDLE1BQU4sQ0FBYSxXQUFiLENBQXlCLENBQUMsT0FBMUIsQ0FBa0MsU0FBQyxJQUFEO0FBQ2hDLFlBQUE7QUFBQTtpQkFDRSxJQUFBLENBQUssSUFBTCxFQUFXLE1BQVgsRUFERjtTQUFBLGFBQUE7VUFHTTtpQkFDSixPQUFPLENBQUMsR0FBUixDQUFZLFlBQUEsR0FBYSxNQUFiLEdBQW9CLEdBQXBCLEdBQXVCLElBQW5DLEVBSkY7O01BRGdDLENBQWxDO2FBTUEsUUFBQSxDQUFBO0lBUlUsQ0FBWjtFQUhTO0FBdEdYIiwic291cmNlc0NvbnRlbnQiOlsiZnMgICAgID0gcmVxdWlyZSAnZnMnXG5wYXRoICAgPSByZXF1aXJlICdwYXRoJ1xudXRpbCAgID0gcmVxdWlyZSAndXRpbCdcbmV2ZW50cyA9IHJlcXVpcmUgJ2V2ZW50cydcbmVzY2FwZSA9IHJlcXVpcmUgJ2pzZXNjJ1xuYW5zaSAgID0gcmVxdWlyZSAnYW5zaS1odG1sLXN0cmVhbSdcbnBzVHJlZSA9IHJlcXVpcmUgJ3Byb2Nlc3MtdHJlZSdcbnNwYXduICA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3blxua2lsbCAgID0gcmVxdWlyZSAndHJlZS1raWxsJ1xuXG5jbGlja2FibGVQYXRocyA9IHJlcXVpcmUgJy4vY2xpY2thYmxlLXBhdGhzJ1xuXG5TVEFUU19NQVRDSEVSID0gL1xcZCtcXHMrKD86ZmFpbGluZ3xwYXNzaW5nfHBlbmRpbmcpL2dcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBNb2NoYVdyYXBwZXIgZXh0ZW5kcyBldmVudHMuRXZlbnRFbWl0dGVyXG5cbiAgY29uc3RydWN0b3I6IChAY29udGV4dCwgZGVidWdNb2RlID0gZmFsc2UpIC0+XG4gICAgQG1vY2hhID0gbnVsbFxuICAgIEBub2RlID0gYXRvbS5jb25maWcuZ2V0ICdtb2NoYS10ZXN0LXJ1bm5lci5ub2RlQmluYXJ5UGF0aCdcbiAgICBAbW9jaGFDb21tYW5kID0gYXRvbS5jb25maWcuZ2V0ICdtb2NoYS10ZXN0LXJ1bm5lci5tb2NoYUNvbW1hbmQnXG4gICAgQHRleHRPbmx5ID0gYXRvbS5jb25maWcuZ2V0ICdtb2NoYS10ZXN0LXJ1bm5lci50ZXh0T25seU91dHB1dCdcbiAgICBAb3B0aW9ucyA9IGF0b20uY29uZmlnLmdldCAnbW9jaGEtdGVzdC1ydW5uZXIub3B0aW9ucydcbiAgICBAZW52ID0gYXRvbS5jb25maWcuZ2V0ICdtb2NoYS10ZXN0LXJ1bm5lci5lbnYnXG5cbiAgICBpZiBkZWJ1Z01vZGVcbiAgICAgIG9wdGlvbnNGb3JEZWJ1ZyA9IGF0b20uY29uZmlnLmdldCAnbW9jaGEtdGVzdC1ydW5uZXIub3B0aW9uc0ZvckRlYnVnJ1xuICAgICAgQG9wdGlvbnMgPSBcIiN7QG9wdGlvbnN9ICN7b3B0aW9uc0ZvckRlYnVnfVwiXG5cbiAgICBAcmVzZXRTdGF0aXN0aWNzKClcblxuICBzdG9wOiAtPlxuICAgIGlmIEBtb2NoYT9cbiAgICAgIGtpbGxUcmVlKEBtb2NoYS5waWQpXG4gICAgICBAbW9jaGEgPSBudWxsXG5cbiAgcnVuOiAtPlxuXG4gICAgZmxhZ3MgPSBbXG4gICAgICBAY29udGV4dC50ZXN0XG4gICAgXVxuXG4gICAgZW52ID1cbiAgICAgIFBBVEg6IFtwcm9jZXNzLmVudi5QQVRILCBwYXRoLmRpcm5hbWUoQG5vZGUpXS5qb2luKCc6JylcblxuICAgIGlmIEBlbnZcbiAgICAgIGZvciBpbmRleCwgbmFtZSBvZiBAZW52LnNwbGl0ICcgJ1xuICAgICAgICBba2V5LCB2YWx1ZV0gPSBuYW1lLnNwbGl0KCc9JylcbiAgICAgICAgZW52W2tleV0gPSB2YWx1ZVxuXG4gICAgaWYgQHRleHRPbmx5XG4gICAgICBmbGFncy5wdXNoICctLW5vLWNvbG9ycydcbiAgICBlbHNlXG4gICAgICBmbGFncy5wdXNoICctLWNvbG9ycydcblxuICAgIGlmIEBjb250ZXh0LmdyZXBcbiAgICAgIGZsYWdzLnB1c2ggJy0tZ3JlcCdcbiAgICAgIGZsYWdzLnB1c2ggZXNjYXBlKEBjb250ZXh0LmdyZXAsIGVzY2FwZUV2ZXJ5dGhpbmc6IHRydWUpXG5cbiAgICBpZiBAb3B0aW9uc1xuICAgICAgQXJyYXk6OnB1c2guYXBwbHkgZmxhZ3MsIEBvcHRpb25zLnNwbGl0ICcgJ1xuXG4gICAgb3B0cyA9XG4gICAgICBjd2Q6IEBjb250ZXh0LnJvb3RcbiAgICAgIGVudjogZW52XG5cbiAgICBAcmVzZXRTdGF0aXN0aWNzKClcbiAgICBAbW9jaGEgPSBzcGF3biBAY29udGV4dC5tb2NoYSwgZmxhZ3MsIG9wdHNcblxuICAgIGlmIEB0ZXh0T25seVxuICAgICAgQG1vY2hhLnN0ZG91dC5vbiAnZGF0YScsIChkYXRhKSA9PlxuICAgICAgICBAcGFyc2VTdGF0aXN0aWNzIGRhdGFcbiAgICAgICAgQGVtaXQgJ291dHB1dCcsIGRhdGEudG9TdHJpbmcoKVxuICAgICAgQG1vY2hhLnN0ZGVyci5vbiAnZGF0YScsIChkYXRhKSA9PlxuICAgICAgICBAcGFyc2VTdGF0aXN0aWNzIGRhdGFcbiAgICAgICAgQGVtaXQgJ291dHB1dCcsIGRhdGEudG9TdHJpbmcoKVxuICAgIGVsc2VcbiAgICAgIHN0cmVhbSA9IGFuc2koY2h1bmtlZDogZmFsc2UpXG4gICAgICBAbW9jaGEuc3Rkb3V0LnBpcGUgc3RyZWFtXG4gICAgICBAbW9jaGEuc3RkZXJyLnBpcGUgc3RyZWFtXG4gICAgICBzdHJlYW0ub24gJ2RhdGEnLCAoZGF0YSkgPT5cbiAgICAgICAgQHBhcnNlU3RhdGlzdGljcyBkYXRhXG4gICAgICAgIEBlbWl0ICdvdXRwdXQnLCBjbGlja2FibGVQYXRocy5saW5rIGRhdGEudG9TdHJpbmcoKVxuXG4gICAgQG1vY2hhLm9uICdlcnJvcicsIChlcnIpID0+XG4gICAgICBAZW1pdCAnZXJyb3InLCBlcnJcblxuICAgIEBtb2NoYS5vbiAnZXhpdCcsIChjb2RlKSA9PlxuICAgICAgaWYgY29kZSBpcyAwXG4gICAgICAgIEBlbWl0ICdzdWNjZXNzJywgQHN0YXRzXG4gICAgICBlbHNlXG4gICAgICAgIEBlbWl0ICdmYWlsdXJlJywgQHN0YXRzXG5cbiAgcmVzZXRTdGF0aXN0aWNzOiAtPlxuICAgIEBzdGF0cyA9IFtdXG5cbiAgcGFyc2VTdGF0aXN0aWNzOiAoZGF0YSkgLT5cbiAgICB3aGlsZSBtYXRjaGVzID0gU1RBVFNfTUFUQ0hFUi5leGVjKGRhdGEpXG4gICAgICBzdGF0ID0gbWF0Y2hlc1swXVxuICAgICAgQHN0YXRzLnB1c2goc3RhdClcbiAgICAgIEBlbWl0ICd1cGRhdGVTdW1tYXJ5JywgQHN0YXRzXG5cblxua2lsbFRyZWUgPSAocGlkLCBzaWduYWwsIGNhbGxiYWNrKSAtPlxuICBzaWduYWwgPSBzaWduYWwgb3IgJ1NJR0tJTEwnXG4gIGNhbGxiYWNrID0gY2FsbGJhY2sgb3IgKC0+KVxuICBwc1RyZWUgcGlkLCAoZXJyLCBjaGlsZHJlbikgLT5cbiAgICBjaGlsZHJlblBpZCA9IGNoaWxkcmVuLm1hcCAocCkgLT4gcC5QSURcbiAgICBbcGlkXS5jb25jYXQoY2hpbGRyZW5QaWQpLmZvckVhY2ggKHRwaWQpIC0+XG4gICAgICB0cnlcbiAgICAgICAga2lsbCB0cGlkLCBzaWduYWxcbiAgICAgICAgIyBwcm9jZXNzLmtpbGwgdHBpZCwgc2lnbmFsXG4gICAgICBjYXRjaCBleFxuICAgICAgICBjb25zb2xlLmxvZyBcIkZhaWxlZCB0byAje3NpZ25hbH0gI3t0cGlkfVwiXG4gICAgY2FsbGJhY2soKVxuIl19
