(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  describe("dirty work for fast package activation", function() {
    var ensureRequiredFiles, withCleanActivation;
    withCleanActivation = null;
    ensureRequiredFiles = null;
    beforeEach(function() {
      return runs(function() {
        var cleanRequireCache, getRequiredLibOrNodeModulePaths, packPath;
        packPath = atom.packages.loadPackage('vim-mode-plus').path;
        getRequiredLibOrNodeModulePaths = function() {
          return Object.keys(require.cache).filter(function(p) {
            return p.startsWith(packPath + 'lib') || p.startsWith(packPath + 'node_modules');
          });
        };
        cleanRequireCache = function() {
          var oldPaths, savedCache;
          savedCache = {};
          oldPaths = getRequiredLibOrNodeModulePaths();
          oldPaths.forEach(function(p) {
            savedCache[p] = require.cache[p];
            return delete require.cache[p];
          });
          return function() {
            oldPaths.forEach(function(p) {
              return require.cache[p] = savedCache[p];
            });
            return getRequiredLibOrNodeModulePaths().forEach(function(p) {
              if (indexOf.call(oldPaths, p) < 0) {
                return delete require.cache[p];
              }
            });
          };
        };
        withCleanActivation = function(fn) {
          var restoreRequireCache;
          restoreRequireCache = null;
          runs(function() {
            return restoreRequireCache = cleanRequireCache();
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('vim-mode-plus').then(fn);
          });
          return runs(function() {
            return restoreRequireCache();
          });
        };
        return ensureRequiredFiles = function(files) {
          var should;
          should = files.map(function(file) {
            return packPath + file;
          });
          return expect(getRequiredLibOrNodeModulePaths()).toEqual(should);
        };
      });
    });
    describe("requrie as minimum num of file as possible on startup", function() {
      var shouldRequireFilesInOrdered;
      shouldRequireFilesInOrdered = ["lib/main.coffee", "lib/base.coffee", "node_modules/delegato/lib/delegator.js", "node_modules/mixto/lib/mixin.js", "lib/settings.coffee", "lib/global-state.coffee", "lib/vim-state.coffee", "lib/mode-manager.coffee", "lib/command-table.coffee"];
      if (atom.inDevMode()) {
        shouldRequireFilesInOrdered.push('lib/developer.coffee');
      }
      it("THIS IS WORKAROUND FOR Travis-CI's", function() {
        return withCleanActivation(function() {
          return null;
        });
      });
      it("require minimum set of files", function() {
        return withCleanActivation(function() {
          return ensureRequiredFiles(shouldRequireFilesInOrdered);
        });
      });
      it("[one editor opened] require minimum set of files", function() {
        return withCleanActivation(function() {
          waitsForPromise(function() {
            return atom.workspace.open();
          });
          return runs(function() {
            var files;
            files = shouldRequireFilesInOrdered.concat('lib/status-bar-manager.coffee');
            return ensureRequiredFiles(files);
          });
        });
      });
      return it("[after motion executed] require minimum set of files", function() {
        return withCleanActivation(function() {
          waitsForPromise(function() {
            return atom.workspace.open().then(function(e) {
              return atom.commands.dispatch(e.element, 'vim-mode-plus:move-right');
            });
          });
          return runs(function() {
            var extraShouldRequireFilesInOrdered, files;
            extraShouldRequireFilesInOrdered = ["lib/status-bar-manager.coffee", "lib/operation-stack.coffee", "lib/selection-wrapper.coffee", "lib/utils.coffee", "node_modules/underscore-plus/lib/underscore-plus.js", "node_modules/underscore/underscore.js", "lib/blockwise-selection.coffee", "lib/motion.coffee", "lib/cursor-style-manager.coffee"];
            files = shouldRequireFilesInOrdered.concat(extraShouldRequireFilesInOrdered);
            return ensureRequiredFiles(files);
          });
        });
      });
    });
    return describe("command-table", function() {
      describe("initial classRegistry", function() {
        return it("contains one entry and it's Base class", function() {
          return withCleanActivation(function(pack) {
            var Base, classRegistry, keys;
            Base = pack.mainModule.provideVimModePlus().Base;
            classRegistry = Base.getClassRegistry();
            keys = Object.keys(classRegistry);
            expect(keys).toHaveLength(1);
            expect(keys[0]).toBe("Base");
            return expect(classRegistry[keys[0]]).toBe(Base);
          });
        });
      });
      describe("fully populated classRegistry", function() {
        return it("generateCommandTableByEagerLoad populate all registry eagerly", function() {
          return withCleanActivation(function(pack) {
            var Base, newRegistriesLength, oldRegistries, oldRegistriesLength;
            Base = pack.mainModule.provideVimModePlus().Base;
            oldRegistries = Base.getClassRegistry();
            oldRegistriesLength = Object.keys(oldRegistries).length;
            expect(Object.keys(oldRegistries)).toHaveLength(1);
            Base.generateCommandTableByEagerLoad();
            newRegistriesLength = Object.keys(Base.getClassRegistry()).length;
            return expect(newRegistriesLength).toBeGreaterThan(oldRegistriesLength);
          });
        });
      });
      return describe("make sure cmd-table is NOT out-of-date", function() {
        return it("generateCommandTableByEagerLoad return table which is equals to initially loaded command table", function() {
          return withCleanActivation(function(pack) {
            var Base, loadedCommandTable, newCommandTable, oldCommandTable, ref;
            Base = pack.mainModule.provideVimModePlus().Base;
            ref = [], oldCommandTable = ref[0], newCommandTable = ref[1];
            oldCommandTable = Base.commandTable;
            newCommandTable = Base.generateCommandTableByEagerLoad();
            loadedCommandTable = require('../lib/command-table');
            expect(oldCommandTable).not.toBe(newCommandTable);
            expect(loadedCommandTable).toEqual(oldCommandTable);
            return expect(loadedCommandTable).toEqual(newCommandTable);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL2Zhc3QtYWN0aXZhdGlvbi1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFrQkE7QUFBQSxNQUFBOztFQUFBLFFBQUEsQ0FBUyx3Q0FBVCxFQUFtRCxTQUFBO0FBQ2pELFFBQUE7SUFBQSxtQkFBQSxHQUFzQjtJQUN0QixtQkFBQSxHQUFzQjtJQUV0QixVQUFBLENBQVcsU0FBQTthQUNULElBQUEsQ0FBSyxTQUFBO0FBQ0gsWUFBQTtRQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsZUFBMUIsQ0FBMEMsQ0FBQztRQUV0RCwrQkFBQSxHQUFrQyxTQUFBO2lCQUNoQyxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQU8sQ0FBQyxLQUFwQixDQUEwQixDQUFDLE1BQTNCLENBQWtDLFNBQUMsQ0FBRDttQkFDaEMsQ0FBQyxDQUFDLFVBQUYsQ0FBYSxRQUFBLEdBQVcsS0FBeEIsQ0FBQSxJQUFrQyxDQUFDLENBQUMsVUFBRixDQUFhLFFBQUEsR0FBVyxjQUF4QjtVQURGLENBQWxDO1FBRGdDO1FBS2xDLGlCQUFBLEdBQW9CLFNBQUE7QUFDbEIsY0FBQTtVQUFBLFVBQUEsR0FBYTtVQUNiLFFBQUEsR0FBVywrQkFBQSxDQUFBO1VBQ1gsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsU0FBQyxDQUFEO1lBQ2YsVUFBVyxDQUFBLENBQUEsQ0FBWCxHQUFnQixPQUFPLENBQUMsS0FBTSxDQUFBLENBQUE7bUJBQzlCLE9BQU8sT0FBTyxDQUFDLEtBQU0sQ0FBQSxDQUFBO1VBRk4sQ0FBakI7QUFJQSxpQkFBTyxTQUFBO1lBQ0wsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsU0FBQyxDQUFEO3FCQUNmLE9BQU8sQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFkLEdBQW1CLFVBQVcsQ0FBQSxDQUFBO1lBRGYsQ0FB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Q0FBQywrQkFBTCxDQUFBO1lBQ0EsbUJBQUEsR0FBc0IsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFJLENBQUMsZ0JBQUwsQ0FBQSxDQUFaLENBQW9DLENBQUM7bUJBQzNELE1BQUEsQ0FBTyxtQkFBUCxDQUEyQixDQUFDLGVBQTVCLENBQTRDLG1CQUE1QztVQVJrQixDQUFwQjtRQURrRSxDQUFwRTtNQUR3QyxDQUExQzthQVlBLFFBQUEsQ0FBUyx3Q0FBVCxFQUFtRCxTQUFBO2VBQ2pELEVBQUEsQ0FBRyxnR0FBSCxFQUFxRyxTQUFBO2lCQUNuRyxtQkFBQSxDQUFvQixTQUFDLElBQUQ7QUFDbEIsZ0JBQUE7WUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBaEIsQ0FBQSxDQUFvQyxDQUFDO1lBQzVDLE1BQXFDLEVBQXJDLEVBQUMsd0JBQUQsRUFBa0I7WUFFbEIsZUFBQSxHQUFrQixJQUFJLENBQUM7WUFDdkIsZUFBQSxHQUFrQixJQUFJLENBQUMsK0JBQUwsQ0FBQTtZQUNsQixrQkFBQSxHQUFxQixPQUFBLENBQVEsc0JBQVI7WUFFckIsTUFBQSxDQUFPLGVBQVAsQ0FBdUIsQ0FBQyxHQUFHLENBQUMsSUFBNUIsQ0FBaUMsZUFBakM7WUFDQSxNQUFBLENBQU8sa0JBQVAsQ0FBMEIsQ0FBQyxPQUEzQixDQUFtQyxlQUFuQzttQkFDQSxNQUFBLENBQU8sa0JBQVAsQ0FBMEIsQ0FBQyxPQUEzQixDQUFtQyxlQUFuQztVQVZrQixDQUFwQjtRQURtRyxDQUFyRztNQURpRCxDQUFuRDtJQTdCd0IsQ0FBMUI7RUFsR2lELENBQW5EO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIjIFtEQU5HRVJdXG4jIFdoYXQgSSdtIGRvaW5nIGluIHRoaXMgdGVzdC1zcGVjIGlzIFNVUEVSIGhhY2t5LCBhbmQgSSBkb24ndCBsaWtlIHRoaXMuXG4jXG4jIC0gV2hhdCBJJ20gZG9pbmcgYW5kIHdoeVxuIyAgLSBJbnZhbGlkYXRlIHJlcXVpcmUuY2FjaGUgdG8gXCJvYnNlcnZlIHJlcXVpcmVkIGZpbGUgb24gc3RhcnR1cFwiLlxuIyAgLSBUaGVuIHJlc3RvcmUgcmVxdWlyZS5jYWNoZSB0byBvcmlnaW5hbCBzdGF0ZS5cbiNcbiMgLSBKdXN0IGludmFsaWRhdGluZyBpcyBub3QgZW5vdWdoIHVubGVzcyByZXN0b3JlaW5nIG90aGVyIHNwZWMgZmlsZSBmYWlsLlxuI1xuIyAtIFdoYXQgaGFwcGVucyBqdXN0IGludmFsaWRhdGUgcmVxdWlyZS5jYWNoZSBhbmQgTk9UIHJlc3RvcmVkIHRvIG9yaWdpbmFsIHJlcXVpcmUuY2FjaGU/XG4jICAtIEZvciBtb2R1bGUgc3VjaCBsaWtlIGBnbG9ibGFsLXN0YXRlLmNvZmZlZWAgaXQgaW5zdGFudGlhdGVkIGF0IHJlcXVpcmVkIHRpbWUuXG4jICAtIEludmFsaWRhdGluZyByZXF1aXJlLmNhY2hlIGZvciBgZ2xvYmFsLXN0YXRlLmNvZmZlZWAgbWVhbnMsIGl0J3MgcmVsb2FkZWQgYWdhaW4uXG4jICAtIFRoaXMgMm5kIHJlbG9hZCByZXR1cm4gRElGRkVSRU5UIGdsb2JhbFN0YXRlIGluc3RhbmNlLlxuIyAgLSBTbyBnbG9iYWxTdGF0ZSBpcyBub3cgbm8gbG9uZ2VyIGdsb2JhbGx5IHJlZmVyZW5jaW5nIHNhbWUgc2FtZSBvYmplY3QsIGl0J3MgYnJva2VuLlxuIyAgLSBUaGlzIHNpdHVhdGlvbiBpcyBjYXVzZWQgYnkgZXhwbGljaXQgY2FjaGUgaW52YWxpZGF0aW9uIGFuZCBub3QgaGFwcGVuIGluIHJlYWwgdXNhZ2UuXG4jXG4jIC0gSSBrbm93IHRoaXMgc3BlYyBpcyBzdGlsbCBzdXBlciBoYWNreSBhbmQgSSB3YW50IHRvIGZpbmQgc2FmZXIgd2F5LlxuIyAgLSBCdXQgSSBuZWVkIHRoaXMgc3BlYyB0byBkZXRlY3QgdW53YW50ZWQgZmlsZSBpcyByZXF1aXJlZCBhdCBzdGFydHVwKCB2bXAgZ2V0IHNsb3dlciBzdGFydHVwICkuXG5kZXNjcmliZSBcImRpcnR5IHdvcmsgZm9yIGZhc3QgcGFja2FnZSBhY3RpdmF0aW9uXCIsIC0+XG4gIHdpdGhDbGVhbkFjdGl2YXRpb24gPSBudWxsXG4gIGVuc3VyZVJlcXVpcmVkRmlsZXMgPSBudWxsXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHJ1bnMgLT5cbiAgICAgIHBhY2tQYXRoID0gYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZSgndmltLW1vZGUtcGx1cycpLnBhdGhcblxuICAgICAgZ2V0UmVxdWlyZWRMaWJPck5vZGVNb2R1bGVQYXRocyA9IC0+XG4gICAgICAgIE9iamVjdC5rZXlzKHJlcXVpcmUuY2FjaGUpLmZpbHRlciAocCkgLT5cbiAgICAgICAgICBwLnN0YXJ0c1dpdGgocGFja1BhdGggKyAnbGliJykgb3IgcC5zdGFydHNXaXRoKHBhY2tQYXRoICsgJ25vZGVfbW9kdWxlcycpXG5cbiAgICAgICMgUmV0dXJuIGZ1bmN0aW9uIHRvIHJlc3RvcmUgb3JpZ2luYWwgcmVxdWlyZS5jYWNoZSBvZiBpbnRlcmVzdFxuICAgICAgY2xlYW5SZXF1aXJlQ2FjaGUgPSAtPlxuICAgICAgICBzYXZlZENhY2hlID0ge31cbiAgICAgICAgb2xkUGF0aHMgPSBnZXRSZXF1aXJlZExpYk9yTm9kZU1vZHVsZVBhdGhzKClcbiAgICAgICAgb2xkUGF0aHMuZm9yRWFjaCAocCkgLT5cbiAgICAgICAgICBzYXZlZENhY2hlW3BdID0gcmVxdWlyZS5jYWNoZVtwXVxuICAgICAgICAgIGRlbGV0ZSByZXF1aXJlLmNhY2hlW3BdXG5cbiAgICAgICAgcmV0dXJuIC0+XG4gICAgICAgICAgb2xkUGF0aHMuZm9yRWFjaCAocCkgLT5cbiAgICAgICAgICAgIHJlcXVpcmUuY2FjaGVbcF0gPSBzYXZlZENhY2hlW3BdXG4gICAgICAgICAgZ2V0UmVxdWlyZWRMaWJPck5vZGVNb2R1bGVQYXRocygpLmZvckVhY2ggKHApIC0+XG4gICAgICAgICAgICBpZiBwIG5vdCBpbiBvbGRQYXRoc1xuICAgICAgICAgICAgICBkZWxldGUgcmVxdWlyZS5jYWNoZVtwXVxuXG4gICAgICB3aXRoQ2xlYW5BY3RpdmF0aW9uID0gKGZuKSAtPlxuICAgICAgICByZXN0b3JlUmVxdWlyZUNhY2hlID0gbnVsbFxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgcmVzdG9yZVJlcXVpcmVDYWNoZSA9IGNsZWFuUmVxdWlyZUNhY2hlKClcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKS50aGVuKGZuKVxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgcmVzdG9yZVJlcXVpcmVDYWNoZSgpXG5cbiAgICAgIGVuc3VyZVJlcXVpcmVkRmlsZXMgPSAoZmlsZXMpIC0+XG4gICAgICAgIHNob3VsZCA9IGZpbGVzLm1hcCgoZmlsZSkgLT4gcGFja1BhdGggKyBmaWxlKVxuICAgICAgICBleHBlY3QoZ2V0UmVxdWlyZWRMaWJPck5vZGVNb2R1bGVQYXRocygpKS50b0VxdWFsKHNob3VsZClcblxuICAjICogVG8gcmVkdWNlIElPIGFuZCBjb21waWxlLWV2YWx1YXRpb24gb2YganMgZmlsZSBvbiBzdGFydHVwXG4gIGRlc2NyaWJlIFwicmVxdXJpZSBhcyBtaW5pbXVtIG51bSBvZiBmaWxlIGFzIHBvc3NpYmxlIG9uIHN0YXJ0dXBcIiwgLT5cbiAgICBzaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQgPSBbXG4gICAgICBcImxpYi9tYWluLmNvZmZlZVwiXG4gICAgICBcImxpYi9iYXNlLmNvZmZlZVwiXG4gICAgICBcIm5vZGVfbW9kdWxlcy9kZWxlZ2F0by9saWIvZGVsZWdhdG9yLmpzXCJcbiAgICAgIFwibm9kZV9tb2R1bGVzL21peHRvL2xpYi9taXhpbi5qc1wiXG4gICAgICBcImxpYi9zZXR0aW5ncy5jb2ZmZWVcIlxuICAgICAgXCJsaWIvZ2xvYmFsLXN0YXRlLmNvZmZlZVwiXG4gICAgICBcImxpYi92aW0tc3RhdGUuY29mZmVlXCJcbiAgICAgIFwibGliL21vZGUtbWFuYWdlci5jb2ZmZWVcIlxuICAgICAgXCJsaWIvY29tbWFuZC10YWJsZS5jb2ZmZWVcIlxuICAgIF1cbiAgICBpZiBhdG9tLmluRGV2TW9kZSgpXG4gICAgICBzaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQucHVzaCgnbGliL2RldmVsb3Blci5jb2ZmZWUnKVxuXG4gICAgaXQgXCJUSElTIElTIFdPUktBUk9VTkQgRk9SIFRyYXZpcy1DSSdzXCIsIC0+XG4gICAgICAjIEhBQ0s6XG4gICAgICAjIEFmdGVyIHZlcnkgZmlyc3QgY2FsbCBvZiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgndmltLW1vZGUtcGx1cycpXG4gICAgICAjIHJlcXVpcmUuY2FjaGUgaXMgTk9UIHBvcHVsYXRlZCB5ZXQgb24gVHJhdmlzLUNJLlxuICAgICAgIyBJdCBkb2Vzbid0IGluY2x1ZGUgbGliL21haW4uY29mZmVlKCB0aGlzIGlzIG9kZCBzdGF0ZSEgKS5cbiAgICAgICMgVGhpcyBvbmx5IGhhcHBlbnMgaW4gdmVyeSBmaXJzdCBhY3RpdmF0aW9uLlxuICAgICAgIyBTbyBwdXRpbmcgaGVyZSB1c2VsZXNzIHRlc3QganVzdCBhY3RpdmF0ZSBwYWNrYWdlIGNhbiBiZSB3b3JrYXJvdW5kLlxuICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAtPlxuICAgICAgICBudWxsXG5cbiAgICBpdCBcInJlcXVpcmUgbWluaW11bSBzZXQgb2YgZmlsZXNcIiwgLT5cbiAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gLT5cbiAgICAgICAgZW5zdXJlUmVxdWlyZWRGaWxlcyhzaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQpXG5cbiAgICBpdCBcIltvbmUgZWRpdG9yIG9wZW5lZF0gcmVxdWlyZSBtaW5pbXVtIHNldCBvZiBmaWxlc1wiLCAtPlxuICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGZpbGVzID0gc2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkLmNvbmNhdCgnbGliL3N0YXR1cy1iYXItbWFuYWdlci5jb2ZmZWUnKVxuICAgICAgICAgIGVuc3VyZVJlcXVpcmVkRmlsZXMoZmlsZXMpXG5cbiAgICBpdCBcIlthZnRlciBtb3Rpb24gZXhlY3V0ZWRdIHJlcXVpcmUgbWluaW11bSBzZXQgb2YgZmlsZXNcIiwgLT5cbiAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4gKGUpIC0+XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGUuZWxlbWVudCwgJ3ZpbS1tb2RlLXBsdXM6bW92ZS1yaWdodCcpXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHRyYVNob3VsZFJlcXVpcmVGaWxlc0luT3JkZXJlZCA9IFtcbiAgICAgICAgICAgIFwibGliL3N0YXR1cy1iYXItbWFuYWdlci5jb2ZmZWVcIlxuICAgICAgICAgICAgXCJsaWIvb3BlcmF0aW9uLXN0YWNrLmNvZmZlZVwiXG4gICAgICAgICAgICBcImxpYi9zZWxlY3Rpb24td3JhcHBlci5jb2ZmZWVcIlxuICAgICAgICAgICAgXCJsaWIvdXRpbHMuY29mZmVlXCJcbiAgICAgICAgICAgIFwibm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUtcGx1cy9saWIvdW5kZXJzY29yZS1wbHVzLmpzXCJcbiAgICAgICAgICAgIFwibm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qc1wiXG4gICAgICAgICAgICBcImxpYi9ibG9ja3dpc2Utc2VsZWN0aW9uLmNvZmZlZVwiXG4gICAgICAgICAgICBcImxpYi9tb3Rpb24uY29mZmVlXCJcbiAgICAgICAgICAgIFwibGliL2N1cnNvci1zdHlsZS1tYW5hZ2VyLmNvZmZlZVwiXG4gICAgICAgICAgXVxuICAgICAgICAgIGZpbGVzID0gc2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkLmNvbmNhdChleHRyYVNob3VsZFJlcXVpcmVGaWxlc0luT3JkZXJlZClcbiAgICAgICAgICBlbnN1cmVSZXF1aXJlZEZpbGVzKGZpbGVzKVxuXG4gIGRlc2NyaWJlIFwiY29tbWFuZC10YWJsZVwiLCAtPlxuICAgICMgKiBMb2FkaW5nIGF0b20gY29tbWFuZHMgZnJvbSBwcmUtZ2VuZXJhdGVkIGNvbW1hbmQtdGFibGUuXG4gICAgIyAqIFdoeT9cbiAgICAjICB2bXAgYWRkcyBhYm91dCAzMDAgY21kcywgd2hpY2ggaXMgaHVnZSwgZHluYW1pY2FsbHkgY2FsY3VsYXRpbmcgYW5kIHJlZ2lzdGVyIGNtZHNcbiAgICAjICB0b29rIHZlcnkgbG9uZyB0aW1lLlxuICAgICMgIFNvIGNhbGNsdWF0ZSBub24tZHluYW1pYyBwYXIgdGhlbiBzYXZlIHRvIGNvbW1hbmQtdGFibGUuY29mZmUgYW5kIGxvYWQgaW4gb24gc3RhcnR1cC5cbiAgICAjICBXaGVuIGNvbW1hbmQgYXJlIGV4ZWN1dGVkLCBuZWNlc3NhcnkgY29tbWFuZCBjbGFzcyBmaWxlIGlzIGxhenktcmVxdWlyZWQuXG4gICAgZGVzY3JpYmUgXCJpbml0aWFsIGNsYXNzUmVnaXN0cnlcIiwgLT5cbiAgICAgIGl0IFwiY29udGFpbnMgb25lIGVudHJ5IGFuZCBpdCdzIEJhc2UgY2xhc3NcIiwgLT5cbiAgICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAocGFjaykgLT5cbiAgICAgICAgICBCYXNlID0gcGFjay5tYWluTW9kdWxlLnByb3ZpZGVWaW1Nb2RlUGx1cygpLkJhc2VcbiAgICAgICAgICBjbGFzc1JlZ2lzdHJ5ID0gQmFzZS5nZXRDbGFzc1JlZ2lzdHJ5KClcbiAgICAgICAgICBrZXlzID0gT2JqZWN0LmtleXMoY2xhc3NSZWdpc3RyeSlcbiAgICAgICAgICBleHBlY3Qoa2V5cykudG9IYXZlTGVuZ3RoKDEpXG4gICAgICAgICAgZXhwZWN0KGtleXNbMF0pLnRvQmUoXCJCYXNlXCIpXG4gICAgICAgICAgZXhwZWN0KGNsYXNzUmVnaXN0cnlba2V5c1swXV0pLnRvQmUoQmFzZSlcblxuICAgIGRlc2NyaWJlIFwiZnVsbHkgcG9wdWxhdGVkIGNsYXNzUmVnaXN0cnlcIiwgLT5cbiAgICAgIGl0IFwiZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZCBwb3B1bGF0ZSBhbGwgcmVnaXN0cnkgZWFnZXJseVwiLCAtPlxuICAgICAgICB3aXRoQ2xlYW5BY3RpdmF0aW9uIChwYWNrKSAtPlxuICAgICAgICAgIEJhc2UgPSBwYWNrLm1haW5Nb2R1bGUucHJvdmlkZVZpbU1vZGVQbHVzKCkuQmFzZVxuICAgICAgICAgIG9sZFJlZ2lzdHJpZXMgPSBCYXNlLmdldENsYXNzUmVnaXN0cnkoKVxuICAgICAgICAgIG9sZFJlZ2lzdHJpZXNMZW5ndGggPSBPYmplY3Qua2V5cyhvbGRSZWdpc3RyaWVzKS5sZW5ndGhcbiAgICAgICAgICBleHBlY3QoT2JqZWN0LmtleXMob2xkUmVnaXN0cmllcykpLnRvSGF2ZUxlbmd0aCgxKVxuXG4gICAgICAgICAgQmFzZS5nZW5lcmF0ZUNvbW1hbmRUYWJsZUJ5RWFnZXJMb2FkKClcbiAgICAgICAgICBuZXdSZWdpc3RyaWVzTGVuZ3RoID0gT2JqZWN0LmtleXMoQmFzZS5nZXRDbGFzc1JlZ2lzdHJ5KCkpLmxlbmd0aFxuICAgICAgICAgIGV4cGVjdChuZXdSZWdpc3RyaWVzTGVuZ3RoKS50b0JlR3JlYXRlclRoYW4ob2xkUmVnaXN0cmllc0xlbmd0aClcblxuICAgIGRlc2NyaWJlIFwibWFrZSBzdXJlIGNtZC10YWJsZSBpcyBOT1Qgb3V0LW9mLWRhdGVcIiwgLT5cbiAgICAgIGl0IFwiZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZCByZXR1cm4gdGFibGUgd2hpY2ggaXMgZXF1YWxzIHRvIGluaXRpYWxseSBsb2FkZWQgY29tbWFuZCB0YWJsZVwiLCAtPlxuICAgICAgICB3aXRoQ2xlYW5BY3RpdmF0aW9uIChwYWNrKSAtPlxuICAgICAgICAgIEJhc2UgPSBwYWNrLm1haW5Nb2R1bGUucHJvdmlkZVZpbU1vZGVQbHVzKCkuQmFzZVxuICAgICAgICAgIFtvbGRDb21tYW5kVGFibGUsIG5ld0NvbW1hbmRUYWJsZV0gPSBbXVxuXG4gICAgICAgICAgb2xkQ29tbWFuZFRhYmxlID0gQmFzZS5jb21tYW5kVGFibGVcbiAgICAgICAgICBuZXdDb21tYW5kVGFibGUgPSBCYXNlLmdlbmVyYXRlQ29tbWFuZFRhYmxlQnlFYWdlckxvYWQoKVxuICAgICAgICAgIGxvYWRlZENvbW1hbmRUYWJsZSA9IHJlcXVpcmUoJy4uL2xpYi9jb21tYW5kLXRhYmxlJylcblxuICAgICAgICAgIGV4cGVjdChvbGRDb21tYW5kVGFibGUpLm5vdC50b0JlKG5ld0NvbW1hbmRUYWJsZSlcbiAgICAgICAgICBleHBlY3QobG9hZGVkQ29tbWFuZFRhYmxlKS50b0VxdWFsKG9sZENvbW1hbmRUYWJsZSlcbiAgICAgICAgICBleHBlY3QobG9hZGVkQ29tbWFuZFRhYmxlKS50b0VxdWFsKG5ld0NvbW1hbmRUYWJsZSlcbiJdfQ==
