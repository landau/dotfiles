(function() {
  var exec,
    slice = [].slice;

  exec = require("child_process").exec;

  module.exports = function(pid, callback) {
    var process_lister, process_lister_command, stderr, stdout;
    process_lister_command = process.platform === "win32" ? "wmic PROCESS GET Name,ProcessId,ParentProcessId" : "ps -A -o ppid,pid,comm";
    process_lister = exec(process_lister_command);
    process_lister.on("error", callback);
    stdout = "";
    stderr = "";
    process_lister.stdout.on("data", function(data) {
      return stdout += data;
    });
    process_lister.stderr.on("data", function(data) {
      return stderr += data;
    });
    return process_lister.on("close", function(code) {
      var children_of, header_keys, headers, i, info, key, output, proc_infos, procs, ref, row, row_values, rows, value;
      if (code) {
        return callback(new Error("Process `" + process_lister_command + "` exited with code " + code + ":\n" + stderr));
      }
      output = stdout.trim();
      ref = output.split(/\r?\n/), headers = ref[0], rows = 2 <= ref.length ? slice.call(ref, 1) : [];
      header_keys = headers.toLowerCase().trim().split(/\s+/);
      proc_infos = (function() {
        var j, k, len, len1, ref1, results;
        results = [];
        for (j = 0, len = rows.length; j < len; j++) {
          row = rows[j];
          info = {};
          row_values = row.trim().split(/\s+/);
          for (i = k = 0, len1 = header_keys.length; k < len1; i = ++k) {
            key = header_keys[i];
            value = (ref1 = row_values[i]) != null ? ref1 : "";
            if (!(key.match(/name|comm|cmd/i) || isNaN(value))) {
              value = parseFloat(value);
            }
            info[key] = value;
          }
          results.push(info);
        }
        return results;
      })();
      procs = (function() {
        var j, len, ref1, ref2, ref3, ref4, ref5, results;
        results = [];
        for (j = 0, len = proc_infos.length; j < len; j++) {
          info = proc_infos[j];
          results.push({
            pid: (ref1 = info.pid) != null ? ref1 : info.processid,
            ppid: (ref2 = info.ppid) != null ? ref2 : info.parentprocessid,
            name: (ref3 = (ref4 = (ref5 = info.name) != null ? ref5 : info.comm) != null ? ref4 : info.cmd) != null ? ref3 : info.command
          });
        }
        return results;
      })();
      children_of = function(ppid) {
        var j, len, proc, results;
        results = [];
        for (j = 0, len = procs.length; j < len; j++) {
          proc = procs[j];
          if (!(("" + proc.ppid) === ("" + ppid))) {
            continue;
          }
          proc.children = children_of(proc.pid);
          results.push(proc);
        }
        return results;
      };
      return callback(null, children_of(pid));
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbW9jaGEtdGVzdC1ydW5uZXIvbm9kZV9tb2R1bGVzL3Byb2Nlc3MtdHJlZS9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBLElBQUE7SUFBQTs7RUFBQyxPQUFRLE9BQUEsQ0FBUSxlQUFSOztFQUdULE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsR0FBRCxFQUFNLFFBQU47QUFDaEIsUUFBQTtJQUFBLHNCQUFBLEdBQ0ksT0FBTyxDQUFDLFFBQVIsS0FBb0IsT0FBdkIsR0FDQyxpREFERCxHQUdDO0lBRUYsY0FBQSxHQUFpQixJQUFBLENBQUssc0JBQUw7SUFDakIsY0FBYyxDQUFDLEVBQWYsQ0FBa0IsT0FBbEIsRUFBMkIsUUFBM0I7SUFDQSxNQUFBLEdBQVM7SUFDVCxNQUFBLEdBQVM7SUFDVCxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQXRCLENBQXlCLE1BQXpCLEVBQWlDLFNBQUMsSUFBRDthQUFTLE1BQUEsSUFBVTtJQUFuQixDQUFqQztJQUNBLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBdEIsQ0FBeUIsTUFBekIsRUFBaUMsU0FBQyxJQUFEO2FBQVMsTUFBQSxJQUFVO0lBQW5CLENBQWpDO1dBQ0EsY0FBYyxDQUFDLEVBQWYsQ0FBa0IsT0FBbEIsRUFBMkIsU0FBQyxJQUFEO0FBQzFCLFVBQUE7TUFBQSxJQUF3RyxJQUF4RztBQUFBLGVBQU8sUUFBQSxDQUFhLElBQUEsS0FBQSxDQUFNLFdBQUEsR0FBWSxzQkFBWixHQUFtQyxxQkFBbkMsR0FBd0QsSUFBeEQsR0FBNkQsS0FBN0QsR0FBa0UsTUFBeEUsQ0FBYixFQUFQOztNQUVBLE1BQUEsR0FBUyxNQUFNLENBQUMsSUFBUCxDQUFBO01BSVQsTUFBcUIsTUFBTSxDQUFDLEtBQVAsQ0FBYSxPQUFiLENBQXJCLEVBQUMsZ0JBQUQsRUFBVTtNQUNWLFdBQUEsR0FBYyxPQUFPLENBQUMsV0FBUixDQUFBLENBQXFCLENBQUMsSUFBdEIsQ0FBQSxDQUE0QixDQUFDLEtBQTdCLENBQW1DLEtBQW5DO01BQ2QsVUFBQTs7QUFDQzthQUFBLHNDQUFBOztVQUNDLElBQUEsR0FBTztVQUNQLFVBQUEsR0FBYSxHQUFHLENBQUMsSUFBSixDQUFBLENBQVUsQ0FBQyxLQUFYLENBQWlCLEtBQWpCO0FBQ2IsZUFBQSx1REFBQTs7WUFDQyxLQUFBLDJDQUF3QjtZQUN4QixJQUFBLENBQUEsQ0FBaUMsR0FBRyxDQUFDLEtBQUosQ0FBVSxnQkFBVixDQUFBLElBQStCLEtBQUEsQ0FBTSxLQUFOLENBQWhFLENBQUE7Y0FBQSxLQUFBLEdBQVEsVUFBQSxDQUFXLEtBQVgsRUFBUjs7WUFDQSxJQUFLLENBQUEsR0FBQSxDQUFMLEdBQVk7QUFIYjt1QkFJQTtBQVBEOzs7TUFTRCxLQUFBOztBQUNDO2FBQUEsNENBQUE7O3VCQUNDO1lBQUEsR0FBQSxxQ0FBZ0IsSUFBSSxDQUFDLFNBQXJCO1lBQ0EsSUFBQSxzQ0FBa0IsSUFBSSxDQUFDLGVBRHZCO1lBRUEsSUFBQSw2R0FBeUMsSUFBSSxDQUFDLE9BRjlDOztBQUREOzs7TUFLRCxXQUFBLEdBQWMsU0FBQyxJQUFEO0FBQ2IsWUFBQTtBQUFBO2FBQUEsdUNBQUE7O2dCQUF1QixDQUFBLEVBQUEsR0FBRyxJQUFJLENBQUMsSUFBUixDQUFBLEtBQWtCLENBQUEsRUFBQSxHQUFHLElBQUg7OztVQUN4QyxJQUFJLENBQUMsUUFBTCxHQUFnQixXQUFBLENBQVksSUFBSSxDQUFDLEdBQWpCO3VCQUNoQjtBQUZEOztNQURhO2FBS2QsUUFBQSxDQUFTLElBQVQsRUFBZSxXQUFBLENBQVksR0FBWixDQUFmO0lBOUIwQixDQUEzQjtFQWJnQjtBQUhqQiIsInNvdXJjZXNDb250ZW50IjpbIlxue2V4ZWN9ID0gcmVxdWlyZSBcImNoaWxkX3Byb2Nlc3NcIlxuXG4jIFRPRE86IGFsbG93IHBpZCB0byBiZSBvbW1pdHRlZDsgbGlzdCBhbGwgcHJvY2Vzc2VzXG5tb2R1bGUuZXhwb3J0cyA9IChwaWQsIGNhbGxiYWNrKS0+XG5cdHByb2Nlc3NfbGlzdGVyX2NvbW1hbmQgPVxuXHRcdGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgXCJ3aW4zMlwiXG5cdFx0XHRcIndtaWMgUFJPQ0VTUyBHRVQgTmFtZSxQcm9jZXNzSWQsUGFyZW50UHJvY2Vzc0lkXCJcblx0XHRlbHNlXG5cdFx0XHRcInBzIC1BIC1vIHBwaWQscGlkLGNvbW1cIlxuXHRcblx0cHJvY2Vzc19saXN0ZXIgPSBleGVjIHByb2Nlc3NfbGlzdGVyX2NvbW1hbmRcblx0cHJvY2Vzc19saXN0ZXIub24gXCJlcnJvclwiLCBjYWxsYmFja1xuXHRzdGRvdXQgPSBcIlwiXG5cdHN0ZGVyciA9IFwiXCJcblx0cHJvY2Vzc19saXN0ZXIuc3Rkb3V0Lm9uIFwiZGF0YVwiLCAoZGF0YSktPiBzdGRvdXQgKz0gZGF0YVxuXHRwcm9jZXNzX2xpc3Rlci5zdGRlcnIub24gXCJkYXRhXCIsIChkYXRhKS0+IHN0ZGVyciArPSBkYXRhXG5cdHByb2Nlc3NfbGlzdGVyLm9uIFwiY2xvc2VcIiwgKGNvZGUpLT5cblx0XHRyZXR1cm4gY2FsbGJhY2sgbmV3IEVycm9yIFwiUHJvY2VzcyBgI3twcm9jZXNzX2xpc3Rlcl9jb21tYW5kfWAgZXhpdGVkIHdpdGggY29kZSAje2NvZGV9OlxcbiN7c3RkZXJyfVwiIGlmIGNvZGVcblx0XHRcblx0XHRvdXRwdXQgPSBzdGRvdXQudHJpbSgpXG5cdFx0IyBjb25zb2xlLmxvZyBcIk91dHB1dCBmcm9tIGAje3Byb2Nlc3NfbGlzdGVyX2NvbW1hbmR9YDpcXG4je291dHB1dH1cIlxuXHRcdFxuXHRcdCMgVE9ETzogbWF5YmUgdXNlIGh0dHBzOi8vZ2l0aHViLmNvbS9uYW1zaGkvbm9kZS1zaGVsbC1wYXJzZXJcblx0XHRbaGVhZGVycywgcm93cy4uLl0gPSBvdXRwdXQuc3BsaXQgL1xccj9cXG4vXG5cdFx0aGVhZGVyX2tleXMgPSBoZWFkZXJzLnRvTG93ZXJDYXNlKCkudHJpbSgpLnNwbGl0IC9cXHMrL1xuXHRcdHByb2NfaW5mb3MgPVxuXHRcdFx0Zm9yIHJvdyBpbiByb3dzXG5cdFx0XHRcdGluZm8gPSB7fVxuXHRcdFx0XHRyb3dfdmFsdWVzID0gcm93LnRyaW0oKS5zcGxpdCAvXFxzKy9cblx0XHRcdFx0Zm9yIGtleSwgaSBpbiBoZWFkZXJfa2V5c1xuXHRcdFx0XHRcdHZhbHVlID0gcm93X3ZhbHVlc1tpXSA/IFwiXCJcblx0XHRcdFx0XHR2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpIHVubGVzcyBrZXkubWF0Y2goL25hbWV8Y29tbXxjbWQvaSkgb3IgaXNOYU4odmFsdWUpXG5cdFx0XHRcdFx0aW5mb1trZXldID0gdmFsdWVcblx0XHRcdFx0aW5mb1xuXHRcdFxuXHRcdHByb2NzID1cblx0XHRcdGZvciBpbmZvIGluIHByb2NfaW5mb3Ncblx0XHRcdFx0cGlkOiBpbmZvLnBpZCA/IGluZm8ucHJvY2Vzc2lkXG5cdFx0XHRcdHBwaWQ6IGluZm8ucHBpZCA/IGluZm8ucGFyZW50cHJvY2Vzc2lkXG5cdFx0XHRcdG5hbWU6IGluZm8ubmFtZSA/IGluZm8uY29tbSA/IGluZm8uY21kID8gaW5mby5jb21tYW5kXG5cdFx0XG5cdFx0Y2hpbGRyZW5fb2YgPSAocHBpZCktPlxuXHRcdFx0Zm9yIHByb2MgaW4gcHJvY3Mgd2hlbiBcIiN7cHJvYy5wcGlkfVwiIGlzIFwiI3twcGlkfVwiXG5cdFx0XHRcdHByb2MuY2hpbGRyZW4gPSBjaGlsZHJlbl9vZihwcm9jLnBpZClcblx0XHRcdFx0cHJvY1xuXHRcdFxuXHRcdGNhbGxiYWNrIG51bGwsIGNoaWxkcmVuX29mKHBpZClcbiJdfQ==
