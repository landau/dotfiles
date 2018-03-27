(function() {
  var Beautifier, Executable, PHPCSFixer, isWindows, path;

  PHPCSFixer = require("../src/beautifiers/php-cs-fixer");

  Beautifier = require("../src/beautifiers/beautifier");

  Executable = require("../src/beautifiers/executable");

  path = require('path');

  isWindows = process.platform === 'win32' || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';

  describe("PHP-CS-Fixer Beautifier", function() {
    beforeEach(function() {
      return waitsForPromise(function() {
        var activationPromise, pack;
        activationPromise = atom.packages.activatePackage('atom-beautify');
        pack = atom.packages.getLoadedPackage("atom-beautify");
        pack.activateNow();
        atom.config.set('atom-beautify.general.loggerLevel', 'info');
        return activationPromise;
      });
    });
    return describe("Beautifier::beautify", function() {
      var OSSpecificSpecs, beautifier, execSpawn;
      beautifier = null;
      execSpawn = null;
      beforeEach(function() {
        beautifier = new PHPCSFixer();
        return execSpawn = Executable.prototype.spawn;
      });
      afterEach(function() {
        return Executable.prototype.spawn = execSpawn;
      });
      OSSpecificSpecs = function() {
        var failWhichProgram, text;
        text = "<?php echo \"test\"; ?>";
        it("should error when beautifier's program not found", function() {
          expect(beautifier).not.toBe(null);
          expect(beautifier instanceof Beautifier).toBe(true);
          return waitsForPromise({
            shouldReject: true
          }, function() {
            var cb, language, options, p;
            language = "PHP";
            options = {
              fixers: "",
              levels: ""
            };
            Executable.prototype.spawn = function(exe, args, options) {
              var er;
              er = new Error('ENOENT');
              er.code = 'ENOENT';
              return beautifier.Promise.reject(er);
            };
            p = beautifier.loadExecutables().then(function() {
              return beautifier.beautify(text, language, options);
            });
            expect(p).not.toBe(null);
            expect(p instanceof beautifier.Promise).toBe(true);
            cb = function(v) {
              expect(v).not.toBe(null);
              expect(v instanceof Error).toBe(true, "Expected '" + v + "' to be instance of Error");
              expect(v.code).toBe("CommandNotFound", "Expected to be CommandNotFound");
              return v;
            };
            p.then(cb, cb);
            return p;
          });
        });
        failWhichProgram = function(failingProgram) {
          return it("should error when '" + failingProgram + "' not found", function() {
            expect(beautifier).not.toBe(null);
            expect(beautifier instanceof Beautifier).toBe(true);
            if (!Executable.isWindows && failingProgram === "php") {
              return;
            }
            return waitsForPromise({
              shouldReject: true
            }, function() {
              var cb, language, options, p;
              language = "PHP";
              options = {
                fixers: "",
                levels: ""
              };
              cb = function(v) {
                expect(v).not.toBe(null);
                expect(v instanceof Error).toBe(true, "Expected '" + v + "' to be instance of Error");
                expect(v.code).toBe("CommandNotFound", "Expected to be CommandNotFound");
                expect(v.file).toBe(failingProgram);
                return v;
              };
              beautifier.which = function(exe, options) {
                if (exe == null) {
                  return beautifier.Promise.resolve(null);
                }
                if (exe === failingProgram) {
                  return beautifier.Promise.resolve(failingProgram);
                } else {
                  return beautifier.Promise.resolve("/" + exe);
                }
              };
              Executable.prototype.spawn = function(exe, args, options) {
                var er;
                if (exe === failingProgram) {
                  er = new Error('ENOENT');
                  er.code = 'ENOENT';
                  return beautifier.Promise.reject(er);
                } else {
                  return beautifier.Promise.resolve({
                    returnCode: 0,
                    stdout: 'stdout',
                    stderr: ''
                  });
                }
              };
              p = beautifier.loadExecutables().then(function() {
                return beautifier.beautify(text, language, options);
              });
              expect(p).not.toBe(null);
              expect(p instanceof beautifier.Promise).toBe(true);
              p.then(cb, cb);
              return p;
            });
          });
        };
        return failWhichProgram('PHP');
      };
      if (!isWindows) {
        describe("Mac/Linux", function() {
          beforeEach(function() {
            return Executable.isWindows = function() {
              return false;
            };
          });
          return OSSpecificSpecs();
        });
      }
      return describe("Windows", function() {
        beforeEach(function() {
          return Executable.isWindows = function() {
            return true;
          };
        });
        return OSSpecificSpecs();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcGVjL2JlYXV0aWZpZXItcGhwLWNzLWZpeGVyLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGlDQUFSOztFQUNiLFVBQUEsR0FBYSxPQUFBLENBQVEsK0JBQVI7O0VBQ2IsVUFBQSxHQUFhLE9BQUEsQ0FBUSwrQkFBUjs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBUVAsU0FBQSxHQUFZLE9BQU8sQ0FBQyxRQUFSLEtBQW9CLE9BQXBCLElBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFaLEtBQXNCLFFBRFosSUFFVixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQVosS0FBc0I7O0VBRXhCLFFBQUEsQ0FBUyx5QkFBVCxFQUFvQyxTQUFBO0lBRWxDLFVBQUEsQ0FBVyxTQUFBO2FBR1QsZUFBQSxDQUFnQixTQUFBO0FBQ2QsWUFBQTtRQUFBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixlQUE5QjtRQUVwQixJQUFBLEdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixlQUEvQjtRQUNQLElBQUksQ0FBQyxXQUFMLENBQUE7UUFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUNBQWhCLEVBQXFELE1BQXJEO0FBRUEsZUFBTztNQVJPLENBQWhCO0lBSFMsQ0FBWDtXQWFBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBO0FBRS9CLFVBQUE7TUFBQSxVQUFBLEdBQWE7TUFDYixTQUFBLEdBQVk7TUFFWixVQUFBLENBQVcsU0FBQTtRQUNULFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQUE7ZUFFakIsU0FBQSxHQUFZLFVBQVUsQ0FBQyxTQUFTLENBQUM7TUFIeEIsQ0FBWDtN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QUFPLENBQVAsQ0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFkLENBQW1CLElBQW5CO2NBQ0EsTUFBQSxDQUFPLENBQUEsWUFBYSxVQUFVLENBQUMsT0FBL0IsQ0FBdUMsQ0FBQyxJQUF4QyxDQUE2QyxJQUE3QztjQUNBLENBQUMsQ0FBQyxJQUFGLENBQU8sRUFBUCxFQUFXLEVBQVg7QUFDQSxxQkFBTztZQTVDMkIsQ0FBcEM7VUFSb0QsQ0FBdEQ7UUFEaUI7ZUF1RG5CLGdCQUFBLENBQWlCLEtBQWpCO01BMUZnQjtNQTZGbEIsSUFBQSxDQUFPLFNBQVA7UUFDRSxRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBO1VBRXBCLFVBQUEsQ0FBVyxTQUFBO21CQUVULFVBQVUsQ0FBQyxTQUFYLEdBQXVCLFNBQUE7cUJBQU07WUFBTjtVQUZkLENBQVg7aUJBSUcsZUFBSCxDQUFBO1FBTm9CLENBQXRCLEVBREY7O2FBU0EsUUFBQSxDQUFTLFNBQVQsRUFBb0IsU0FBQTtRQUVsQixVQUFBLENBQVcsU0FBQTtpQkFFVCxVQUFVLENBQUMsU0FBWCxHQUF1QixTQUFBO21CQUFNO1VBQU47UUFGZCxDQUFYO2VBSUcsZUFBSCxDQUFBO01BTmtCLENBQXBCO0lBbkgrQixDQUFqQztFQWZrQyxDQUFwQztBQWZBIiwic291cmNlc0NvbnRlbnQiOlsiUEhQQ1NGaXhlciA9IHJlcXVpcmUgXCIuLi9zcmMvYmVhdXRpZmllcnMvcGhwLWNzLWZpeGVyXCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlIFwiLi4vc3JjL2JlYXV0aWZpZXJzL2JlYXV0aWZpZXJcIlxuRXhlY3V0YWJsZSA9IHJlcXVpcmUgXCIuLi9zcmMvYmVhdXRpZmllcnMvZXhlY3V0YWJsZVwiXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblxuIyBVc2UgdGhlIGNvbW1hbmQgYHdpbmRvdzpydW4tcGFja2FnZS1zcGVjc2AgKGNtZC1hbHQtY3RybC1wKSB0byBydW4gc3BlY3MuXG4jXG4jIFRvIHJ1biBhIHNwZWNpZmljIGBpdGAgb3IgYGRlc2NyaWJlYCBibG9jayBhZGQgYW4gYGZgIHRvIHRoZSBmcm9udCAoZS5nLiBgZml0YFxuIyBvciBgZmRlc2NyaWJlYCkuIFJlbW92ZSB0aGUgYGZgIHRvIHVuZm9jdXMgdGhlIGJsb2NrLlxuXG4jIENoZWNrIGlmIFdpbmRvd3NcbmlzV2luZG93cyA9IHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJyBvclxuICBwcm9jZXNzLmVudi5PU1RZUEUgaXMgJ2N5Z3dpbicgb3JcbiAgcHJvY2Vzcy5lbnYuT1NUWVBFIGlzICdtc3lzJ1xuXG5kZXNjcmliZSBcIlBIUC1DUy1GaXhlciBCZWF1dGlmaWVyXCIsIC0+XG5cbiAgYmVmb3JlRWFjaCAtPlxuXG4gICAgIyBBY3RpdmF0ZSBwYWNrYWdlXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBhY3RpdmF0aW9uUHJvbWlzZSA9IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdG9tLWJlYXV0aWZ5JylcbiAgICAgICMgRm9yY2UgYWN0aXZhdGUgcGFja2FnZVxuICAgICAgcGFjayA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZShcImF0b20tYmVhdXRpZnlcIilcbiAgICAgIHBhY2suYWN0aXZhdGVOb3coKVxuICAgICAgIyBDaGFuZ2UgbG9nZ2VyIGxldmVsXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F0b20tYmVhdXRpZnkuZ2VuZXJhbC5sb2dnZXJMZXZlbCcsICdpbmZvJylcbiAgICAgICMgUmV0dXJuIHByb21pc2VcbiAgICAgIHJldHVybiBhY3RpdmF0aW9uUHJvbWlzZVxuXG4gIGRlc2NyaWJlIFwiQmVhdXRpZmllcjo6YmVhdXRpZnlcIiwgLT5cblxuICAgIGJlYXV0aWZpZXIgPSBudWxsXG4gICAgZXhlY1NwYXduID0gbnVsbFxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYmVhdXRpZmllciA9IG5ldyBQSFBDU0ZpeGVyKClcbiAgICAgICMgY29uc29sZS5sb2coJ25ldyBiZWF1dGlmaWVyJylcbiAgICAgIGV4ZWNTcGF3biA9IEV4ZWN1dGFibGUucHJvdG90eXBlLnNwYXduXG5cbiAgICBhZnRlckVhY2ggLT5cbiAgICAgIEV4ZWN1dGFibGUucHJvdG90eXBlLnNwYXduID0gZXhlY1NwYXduXG5cbiAgICBPU1NwZWNpZmljU3BlY3MgPSAtPlxuICAgICAgdGV4dCA9IFwiPD9waHAgZWNobyBcXFwidGVzdFxcXCI7ID8+XCJcblxuICAgICAgaXQgXCJzaG91bGQgZXJyb3Igd2hlbiBiZWF1dGlmaWVyJ3MgcHJvZ3JhbSBub3QgZm91bmRcIiwgLT5cbiAgICAgICAgZXhwZWN0KGJlYXV0aWZpZXIpLm5vdC50b0JlKG51bGwpXG4gICAgICAgIGV4cGVjdChiZWF1dGlmaWVyIGluc3RhbmNlb2YgQmVhdXRpZmllcikudG9CZSh0cnVlKVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSBzaG91bGRSZWplY3Q6IHRydWUsIC0+XG4gICAgICAgICAgbGFuZ3VhZ2UgPSBcIlBIUFwiXG4gICAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGZpeGVyczogXCJcIlxuICAgICAgICAgICAgbGV2ZWxzOiBcIlwiXG4gICAgICAgICAgfVxuICAgICAgICAgICMgTW9jayBzcGF3blxuICAgICAgICAgICMgYmVhdXRpZmllci5zcGF3blxuICAgICAgICAgIEV4ZWN1dGFibGUucHJvdG90eXBlLnNwYXduID0gKGV4ZSwgYXJncywgb3B0aW9ucykgLT5cbiAgICAgICAgICAgICMgY29uc29sZS5sb2coJ3NwYXduJywgZXhlLCBhcmdzLCBvcHRpb25zKVxuICAgICAgICAgICAgZXIgPSBuZXcgRXJyb3IoJ0VOT0VOVCcpXG4gICAgICAgICAgICBlci5jb2RlID0gJ0VOT0VOVCdcbiAgICAgICAgICAgIHJldHVybiBiZWF1dGlmaWVyLlByb21pc2UucmVqZWN0KGVyKVxuICAgICAgICAgICMgQmVhdXRpZnlcbiAgICAgICAgICBwID0gYmVhdXRpZmllci5sb2FkRXhlY3V0YWJsZXMoKS50aGVuKCgpIC0+IGJlYXV0aWZpZXIuYmVhdXRpZnkodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpKVxuICAgICAgICAgIGV4cGVjdChwKS5ub3QudG9CZShudWxsKVxuICAgICAgICAgIGV4cGVjdChwIGluc3RhbmNlb2YgYmVhdXRpZmllci5Qcm9taXNlKS50b0JlKHRydWUpXG4gICAgICAgICAgY2IgPSAodikgLT5cbiAgICAgICAgICAgICMgY29uc29sZS5sb2codilcbiAgICAgICAgICAgIGV4cGVjdCh2KS5ub3QudG9CZShudWxsKVxuICAgICAgICAgICAgZXhwZWN0KHYgaW5zdGFuY2VvZiBFcnJvcikudG9CZSh0cnVlLCBcXFxuICAgICAgICAgICAgICBcIkV4cGVjdGVkICcje3Z9JyB0byBiZSBpbnN0YW5jZSBvZiBFcnJvclwiKVxuICAgICAgICAgICAgZXhwZWN0KHYuY29kZSkudG9CZShcIkNvbW1hbmROb3RGb3VuZFwiLCBcXFxuICAgICAgICAgICAgICBcIkV4cGVjdGVkIHRvIGJlIENvbW1hbmROb3RGb3VuZFwiKVxuICAgICAgICAgICAgcmV0dXJuIHZcbiAgICAgICAgICBwLnRoZW4oY2IsIGNiKVxuICAgICAgICAgIHJldHVybiBwXG5cbiAgICAgIGZhaWxXaGljaFByb2dyYW0gPSAoZmFpbGluZ1Byb2dyYW0pIC0+XG4gICAgICAgIGl0IFwic2hvdWxkIGVycm9yIHdoZW4gJyN7ZmFpbGluZ1Byb2dyYW19JyBub3QgZm91bmRcIiwgLT5cbiAgICAgICAgICBleHBlY3QoYmVhdXRpZmllcikubm90LnRvQmUobnVsbClcbiAgICAgICAgICBleHBlY3QoYmVhdXRpZmllciBpbnN0YW5jZW9mIEJlYXV0aWZpZXIpLnRvQmUodHJ1ZSlcblxuICAgICAgICAgIGlmIG5vdCBFeGVjdXRhYmxlLmlzV2luZG93cyBhbmQgZmFpbGluZ1Byb2dyYW0gaXMgXCJwaHBcIlxuICAgICAgICAgICAgIyBPbmx5IGFwcGxpY2FibGUgb24gV2luZG93c1xuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgICB3YWl0c0ZvclByb21pc2Ugc2hvdWxkUmVqZWN0OiB0cnVlLCAtPlxuICAgICAgICAgICAgbGFuZ3VhZ2UgPSBcIlBIUFwiXG4gICAgICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgICAgICBmaXhlcnM6IFwiXCJcbiAgICAgICAgICAgICAgbGV2ZWxzOiBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYiA9ICh2KSAtPlxuICAgICAgICAgICAgICAjIGNvbnNvbGUubG9nKCdjYiB2YWx1ZScsIHYpXG4gICAgICAgICAgICAgIGV4cGVjdCh2KS5ub3QudG9CZShudWxsKVxuICAgICAgICAgICAgICBleHBlY3QodiBpbnN0YW5jZW9mIEVycm9yKS50b0JlKHRydWUsIFxcXG4gICAgICAgICAgICAgICAgXCJFeHBlY3RlZCAnI3t2fScgdG8gYmUgaW5zdGFuY2Ugb2YgRXJyb3JcIilcbiAgICAgICAgICAgICAgZXhwZWN0KHYuY29kZSkudG9CZShcIkNvbW1hbmROb3RGb3VuZFwiLCBcXFxuICAgICAgICAgICAgICAgIFwiRXhwZWN0ZWQgdG8gYmUgQ29tbWFuZE5vdEZvdW5kXCIpXG4gICAgICAgICAgICAgIGV4cGVjdCh2LmZpbGUpLnRvQmUoZmFpbGluZ1Byb2dyYW0pXG4gICAgICAgICAgICAgIHJldHVybiB2XG4gICAgICAgICAgICAjIHdoaWNoID0gYmVhdXRpZmllci53aGljaC5iaW5kKGJlYXV0aWZpZXIpXG4gICAgICAgICAgICBiZWF1dGlmaWVyLndoaWNoID0gKGV4ZSwgb3B0aW9ucykgLT5cbiAgICAgICAgICAgICAgcmV0dXJuIGJlYXV0aWZpZXIuUHJvbWlzZS5yZXNvbHZlKG51bGwpIFxcXG4gICAgICAgICAgICAgICAgaWYgbm90IGV4ZT9cbiAgICAgICAgICAgICAgaWYgZXhlIGlzIGZhaWxpbmdQcm9ncmFtXG4gICAgICAgICAgICAgICAgYmVhdXRpZmllci5Qcm9taXNlLnJlc29sdmUoZmFpbGluZ1Byb2dyYW0pXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjIHdoaWNoKGV4ZSwgb3B0aW9ucylcbiAgICAgICAgICAgICAgICAjIGNvbnNvbGUubG9nKCdmYWtlIGV4ZSBwYXRoJywgZXhlKVxuICAgICAgICAgICAgICAgIGJlYXV0aWZpZXIuUHJvbWlzZS5yZXNvbHZlKFwiLyN7ZXhlfVwiKVxuXG4gICAgICAgICAgICAjIG9sZFNwYXduID0gYmVhdXRpZmllci5zcGF3bi5iaW5kKGJlYXV0aWZpZXIpXG4gICAgICAgICAgICAjIGJlYXV0aWZpZXIuc3Bhd25cbiAgICAgICAgICAgIEV4ZWN1dGFibGUucHJvdG90eXBlLnNwYXduID0gKGV4ZSwgYXJncywgb3B0aW9ucykgLT5cbiAgICAgICAgICAgICAgIyBjb25zb2xlLmxvZygnc3Bhd24nLCBleGUsIGFyZ3MsIG9wdGlvbnMpXG4gICAgICAgICAgICAgIGlmIGV4ZSBpcyBmYWlsaW5nUHJvZ3JhbVxuICAgICAgICAgICAgICAgIGVyID0gbmV3IEVycm9yKCdFTk9FTlQnKVxuICAgICAgICAgICAgICAgIGVyLmNvZGUgPSAnRU5PRU5UJ1xuICAgICAgICAgICAgICAgIHJldHVybiBiZWF1dGlmaWVyLlByb21pc2UucmVqZWN0KGVyKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJlYXV0aWZpZXIuUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgIHJldHVybkNvZGU6IDAsXG4gICAgICAgICAgICAgICAgICBzdGRvdXQ6ICdzdGRvdXQnLFxuICAgICAgICAgICAgICAgICAgc3RkZXJyOiAnJ1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHAgPSBiZWF1dGlmaWVyLmxvYWRFeGVjdXRhYmxlcygpLnRoZW4oKCkgLT4gYmVhdXRpZmllci5iZWF1dGlmeSh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykpXG4gICAgICAgICAgICBleHBlY3QocCkubm90LnRvQmUobnVsbClcbiAgICAgICAgICAgIGV4cGVjdChwIGluc3RhbmNlb2YgYmVhdXRpZmllci5Qcm9taXNlKS50b0JlKHRydWUpXG4gICAgICAgICAgICBwLnRoZW4oY2IsIGNiKVxuICAgICAgICAgICAgcmV0dXJuIHBcblxuICAgICAgZmFpbFdoaWNoUHJvZ3JhbSgnUEhQJylcbiAgICAgICMgZmFpbFdoaWNoUHJvZ3JhbSgncGhwLWNzLWZpeGVyJylcblxuICAgIHVubGVzcyBpc1dpbmRvd3NcbiAgICAgIGRlc2NyaWJlIFwiTWFjL0xpbnV4XCIsIC0+XG5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICMgY29uc29sZS5sb2coJ21hYy9saW54JylcbiAgICAgICAgICBFeGVjdXRhYmxlLmlzV2luZG93cyA9ICgpIC0+IGZhbHNlXG5cbiAgICAgICAgZG8gT1NTcGVjaWZpY1NwZWNzXG5cbiAgICBkZXNjcmliZSBcIldpbmRvd3NcIiwgLT5cblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAjIGNvbnNvbGUubG9nKCd3aW5kb3dzJylcbiAgICAgICAgRXhlY3V0YWJsZS5pc1dpbmRvd3MgPSAoKSAtPiB0cnVlXG5cbiAgICAgIGRvIE9TU3BlY2lmaWNTcGVjc1xuIl19
