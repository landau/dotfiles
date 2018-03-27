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
      shouldRequireFilesInOrdered = ["lib/main.js", "lib/base.coffee", "node_modules/delegato/lib/delegator.js", "node_modules/mixto/lib/mixin.js", "lib/settings.js", "lib/global-state.js", "lib/vim-state.js", "lib/mode-manager.js", "lib/command-table.coffee"];
      if (atom.inDevMode()) {
        shouldRequireFilesInOrdered.push('lib/developer.js');
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
            files = shouldRequireFilesInOrdered.concat('lib/status-bar-manager.js');
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
            extraShouldRequireFilesInOrdered = ["lib/status-bar-manager.js", "lib/operation-stack.js", "lib/selection-wrapper.js", "lib/utils.js", "node_modules/underscore-plus/lib/underscore-plus.js", "node_modules/underscore/underscore.js", "lib/blockwise-selection.js", "lib/motion.coffee", "lib/cursor-style-manager.js"];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL2Zhc3QtYWN0aXZhdGlvbi1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFrQkE7QUFBQSxNQUFBOztFQUFBLFFBQUEsQ0FBUyx3Q0FBVCxFQUFtRCxTQUFBO0FBQ2pELFFBQUE7SUFBQSxtQkFBQSxHQUFzQjtJQUN0QixtQkFBQSxHQUFzQjtJQUV0QixVQUFBLENBQVcsU0FBQTthQUNULElBQUEsQ0FBSyxTQUFBO0FBQ0gsWUFBQTtRQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsZUFBMUIsQ0FBMEMsQ0FBQztRQUV0RCwrQkFBQSxHQUFrQyxTQUFBO2lCQUNoQyxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQU8sQ0FBQyxLQUFwQixDQUEwQixDQUFDLE1BQTNCLENBQWtDLFNBQUMsQ0FBRDttQkFDaEMsQ0FBQyxDQUFDLFVBQUYsQ0FBYSxRQUFBLEdBQVcsS0FBeEIsQ0FBQSxJQUFrQyxDQUFDLENBQUMsVUFBRixDQUFhLFFBQUEsR0FBVyxjQUF4QjtVQURGLENBQWxDO1FBRGdDO1FBS2xDLGlCQUFBLEdBQW9CLFNBQUE7QUFDbEIsY0FBQTtVQUFBLFVBQUEsR0FBYTtVQUNiLFFBQUEsR0FBVywrQkFBQSxDQUFBO1VBQ1gsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsU0FBQyxDQUFEO1lBQ2YsVUFBVyxDQUFBLENBQUEsQ0FBWCxHQUFnQixPQUFPLENBQUMsS0FBTSxDQUFBLENBQUE7bUJBQzlCLE9BQU8sT0FBTyxDQUFDLEtBQU0sQ0FBQSxDQUFBO1VBRk4sQ0FBakI7QUFJQSxpQkFBTyxTQUFBO1lBQ0wsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsU0FBQyxDQUFEO3FCQUNmLE9BQU8sQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFkLEdBQW1CLFVBQVcsQ0FBQSxDQUFBO1lBRGYsQ0FB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QUMsK0JBQUwsQ0FBQTtZQUNBLG1CQUFBLEdBQXNCLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBSSxDQUFDLGdCQUFMLENBQUEsQ0FBWixDQUFvQyxDQUFDO21CQUMzRCxNQUFBLENBQU8sbUJBQVAsQ0FBMkIsQ0FBQyxlQUE1QixDQUE0QyxtQkFBNUM7VUFSa0IsQ0FBcEI7UUFEa0UsQ0FBcEU7TUFEd0MsQ0FBMUM7YUFZQSxRQUFBLENBQVMsd0NBQVQsRUFBbUQsU0FBQTtlQUNqRCxFQUFBLENBQUcsZ0dBQUgsRUFBcUcsU0FBQTtpQkFDbkcsbUJBQUEsQ0FBb0IsU0FBQyxJQUFEO0FBQ2xCLGdCQUFBO1lBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWhCLENBQUEsQ0FBb0MsQ0FBQztZQUM1QyxNQUFxQyxFQUFyQyxFQUFDLHdCQUFELEVBQWtCO1lBRWxCLGVBQUEsR0FBa0IsSUFBSSxDQUFDO1lBQ3ZCLGVBQUEsR0FBa0IsSUFBSSxDQUFDLCtCQUFMLENBQUE7WUFDbEIsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHNCQUFSO1lBRXJCLE1BQUEsQ0FBTyxlQUFQLENBQXVCLENBQUMsR0FBRyxDQUFDLElBQTVCLENBQWlDLGVBQWpDO1lBQ0EsTUFBQSxDQUFPLGtCQUFQLENBQTBCLENBQUMsT0FBM0IsQ0FBbUMsZUFBbkM7bUJBQ0EsTUFBQSxDQUFPLGtCQUFQLENBQTBCLENBQUMsT0FBM0IsQ0FBbUMsZUFBbkM7VUFWa0IsQ0FBcEI7UUFEbUcsQ0FBckc7TUFEaUQsQ0FBbkQ7SUE3QndCLENBQTFCO0VBcEdpRCxDQUFuRDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiIyBbREFOR0VSXVxuIyBXaGF0IEknbSBkb2luZyBpbiB0aGlzIHRlc3Qtc3BlYyBpcyBTVVBFUiBoYWNreSwgYW5kIEkgZG9uJ3QgbGlrZSB0aGlzLlxuI1xuIyAtIFdoYXQgSSdtIGRvaW5nIGFuZCB3aHlcbiMgIC0gSW52YWxpZGF0ZSByZXF1aXJlLmNhY2hlIHRvIFwib2JzZXJ2ZSByZXF1aXJlZCBmaWxlIG9uIHN0YXJ0dXBcIi5cbiMgIC0gVGhlbiByZXN0b3JlIHJlcXVpcmUuY2FjaGUgdG8gb3JpZ2luYWwgc3RhdGUuXG4jXG4jIC0gSnVzdCBpbnZhbGlkYXRpbmcgaXMgbm90IGVub3VnaCB1bmxlc3MgcmVzdG9yZWluZyBvdGhlciBzcGVjIGZpbGUgZmFpbC5cbiNcbiMgLSBXaGF0IGhhcHBlbnMganVzdCBpbnZhbGlkYXRlIHJlcXVpcmUuY2FjaGUgYW5kIE5PVCByZXN0b3JlZCB0byBvcmlnaW5hbCByZXF1aXJlLmNhY2hlP1xuIyAgLSBGb3IgbW9kdWxlIHN1Y2ggbGlrZSBgZ2xvYmxhbC1zdGF0ZS5jb2ZmZWVgIGl0IGluc3RhbnRpYXRlZCBhdCByZXF1aXJlZCB0aW1lLlxuIyAgLSBJbnZhbGlkYXRpbmcgcmVxdWlyZS5jYWNoZSBmb3IgYGdsb2JhbC1zdGF0ZS5jb2ZmZWVgIG1lYW5zLCBpdCdzIHJlbG9hZGVkIGFnYWluLlxuIyAgLSBUaGlzIDJuZCByZWxvYWQgcmV0dXJuIERJRkZFUkVOVCBnbG9iYWxTdGF0ZSBpbnN0YW5jZS5cbiMgIC0gU28gZ2xvYmFsU3RhdGUgaXMgbm93IG5vIGxvbmdlciBnbG9iYWxseSByZWZlcmVuY2luZyBzYW1lIHNhbWUgb2JqZWN0LCBpdCdzIGJyb2tlbi5cbiMgIC0gVGhpcyBzaXR1YXRpb24gaXMgY2F1c2VkIGJ5IGV4cGxpY2l0IGNhY2hlIGludmFsaWRhdGlvbiBhbmQgbm90IGhhcHBlbiBpbiByZWFsIHVzYWdlLlxuI1xuIyAtIEkga25vdyB0aGlzIHNwZWMgaXMgc3RpbGwgc3VwZXIgaGFja3kgYW5kIEkgd2FudCB0byBmaW5kIHNhZmVyIHdheS5cbiMgIC0gQnV0IEkgbmVlZCB0aGlzIHNwZWMgdG8gZGV0ZWN0IHVud2FudGVkIGZpbGUgaXMgcmVxdWlyZWQgYXQgc3RhcnR1cCggdm1wIGdldCBzbG93ZXIgc3RhcnR1cCApLlxuZGVzY3JpYmUgXCJkaXJ0eSB3b3JrIGZvciBmYXN0IHBhY2thZ2UgYWN0aXZhdGlvblwiLCAtPlxuICB3aXRoQ2xlYW5BY3RpdmF0aW9uID0gbnVsbFxuICBlbnN1cmVSZXF1aXJlZEZpbGVzID0gbnVsbFxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBydW5zIC0+XG4gICAgICBwYWNrUGF0aCA9IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKS5wYXRoXG5cbiAgICAgIGdldFJlcXVpcmVkTGliT3JOb2RlTW9kdWxlUGF0aHMgPSAtPlxuICAgICAgICBPYmplY3Qua2V5cyhyZXF1aXJlLmNhY2hlKS5maWx0ZXIgKHApIC0+XG4gICAgICAgICAgcC5zdGFydHNXaXRoKHBhY2tQYXRoICsgJ2xpYicpIG9yIHAuc3RhcnRzV2l0aChwYWNrUGF0aCArICdub2RlX21vZHVsZXMnKVxuXG4gICAgICAjIFJldHVybiBmdW5jdGlvbiB0byByZXN0b3JlIG9yaWdpbmFsIHJlcXVpcmUuY2FjaGUgb2YgaW50ZXJlc3RcbiAgICAgIGNsZWFuUmVxdWlyZUNhY2hlID0gLT5cbiAgICAgICAgc2F2ZWRDYWNoZSA9IHt9XG4gICAgICAgIG9sZFBhdGhzID0gZ2V0UmVxdWlyZWRMaWJPck5vZGVNb2R1bGVQYXRocygpXG4gICAgICAgIG9sZFBhdGhzLmZvckVhY2ggKHApIC0+XG4gICAgICAgICAgc2F2ZWRDYWNoZVtwXSA9IHJlcXVpcmUuY2FjaGVbcF1cbiAgICAgICAgICBkZWxldGUgcmVxdWlyZS5jYWNoZVtwXVxuXG4gICAgICAgIHJldHVybiAtPlxuICAgICAgICAgIG9sZFBhdGhzLmZvckVhY2ggKHApIC0+XG4gICAgICAgICAgICByZXF1aXJlLmNhY2hlW3BdID0gc2F2ZWRDYWNoZVtwXVxuICAgICAgICAgIGdldFJlcXVpcmVkTGliT3JOb2RlTW9kdWxlUGF0aHMoKS5mb3JFYWNoIChwKSAtPlxuICAgICAgICAgICAgaWYgcCBub3QgaW4gb2xkUGF0aHNcbiAgICAgICAgICAgICAgZGVsZXRlIHJlcXVpcmUuY2FjaGVbcF1cblxuICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiA9IChmbikgLT5cbiAgICAgICAgcmVzdG9yZVJlcXVpcmVDYWNoZSA9IG51bGxcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHJlc3RvcmVSZXF1aXJlQ2FjaGUgPSBjbGVhblJlcXVpcmVDYWNoZSgpXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCd2aW0tbW9kZS1wbHVzJykudGhlbihmbilcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHJlc3RvcmVSZXF1aXJlQ2FjaGUoKVxuXG4gICAgICBlbnN1cmVSZXF1aXJlZEZpbGVzID0gKGZpbGVzKSAtPlxuICAgICAgICBzaG91bGQgPSBmaWxlcy5tYXAoKGZpbGUpIC0+IHBhY2tQYXRoICsgZmlsZSlcbiAgICAgICAgIyBjb25zb2xlLmxvZyBcIiMgc2hvdWxkXCIsIHNob3VsZC5qb2luKFwiXFxuXCIpXG4gICAgICAgICMgY29uc29sZS5sb2cgXCIjIGFjdHVhbFwiLCBnZXRSZXF1aXJlZExpYk9yTm9kZU1vZHVsZVBhdGhzKCkuam9pbihcIlxcblwiKVxuICAgICAgICBleHBlY3QoZ2V0UmVxdWlyZWRMaWJPck5vZGVNb2R1bGVQYXRocygpKS50b0VxdWFsKHNob3VsZClcblxuICAjICogVG8gcmVkdWNlIElPIGFuZCBjb21waWxlLWV2YWx1YXRpb24gb2YganMgZmlsZSBvbiBzdGFydHVwXG4gIGRlc2NyaWJlIFwicmVxdXJpZSBhcyBtaW5pbXVtIG51bSBvZiBmaWxlIGFzIHBvc3NpYmxlIG9uIHN0YXJ0dXBcIiwgLT5cbiAgICBzaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQgPSBbXG4gICAgICBcImxpYi9tYWluLmpzXCJcbiAgICAgIFwibGliL2Jhc2UuY29mZmVlXCJcbiAgICAgIFwibm9kZV9tb2R1bGVzL2RlbGVnYXRvL2xpYi9kZWxlZ2F0b3IuanNcIlxuICAgICAgXCJub2RlX21vZHVsZXMvbWl4dG8vbGliL21peGluLmpzXCJcbiAgICAgIFwibGliL3NldHRpbmdzLmpzXCJcbiAgICAgIFwibGliL2dsb2JhbC1zdGF0ZS5qc1wiXG4gICAgICBcImxpYi92aW0tc3RhdGUuanNcIlxuICAgICAgXCJsaWIvbW9kZS1tYW5hZ2VyLmpzXCJcbiAgICAgIFwibGliL2NvbW1hbmQtdGFibGUuY29mZmVlXCJcbiAgICBdXG4gICAgaWYgYXRvbS5pbkRldk1vZGUoKVxuICAgICAgc2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkLnB1c2goJ2xpYi9kZXZlbG9wZXIuanMnKVxuXG4gICAgaXQgXCJUSElTIElTIFdPUktBUk9VTkQgRk9SIFRyYXZpcy1DSSdzXCIsIC0+XG4gICAgICAjIEhBQ0s6XG4gICAgICAjIEFmdGVyIHZlcnkgZmlyc3QgY2FsbCBvZiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgndmltLW1vZGUtcGx1cycpXG4gICAgICAjIHJlcXVpcmUuY2FjaGUgaXMgTk9UIHBvcHVsYXRlZCB5ZXQgb24gVHJhdmlzLUNJLlxuICAgICAgIyBJdCBkb2Vzbid0IGluY2x1ZGUgbGliL21haW4uY29mZmVlKCB0aGlzIGlzIG9kZCBzdGF0ZSEgKS5cbiAgICAgICMgVGhpcyBvbmx5IGhhcHBlbnMgaW4gdmVyeSBmaXJzdCBhY3RpdmF0aW9uLlxuICAgICAgIyBTbyBwdXRpbmcgaGVyZSB1c2VsZXNzIHRlc3QganVzdCBhY3RpdmF0ZSBwYWNrYWdlIGNhbiBiZSB3b3JrYXJvdW5kLlxuICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAtPlxuICAgICAgICBudWxsXG5cbiAgICBpdCBcInJlcXVpcmUgbWluaW11bSBzZXQgb2YgZmlsZXNcIiwgLT5cbiAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gLT5cbiAgICAgICAgZW5zdXJlUmVxdWlyZWRGaWxlcyhzaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQpXG5cbiAgICBpdCBcIltvbmUgZWRpdG9yIG9wZW5lZF0gcmVxdWlyZSBtaW5pbXVtIHNldCBvZiBmaWxlc1wiLCAtPlxuICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGZpbGVzID0gc2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkLmNvbmNhdCgnbGliL3N0YXR1cy1iYXItbWFuYWdlci5qcycpXG4gICAgICAgICAgZW5zdXJlUmVxdWlyZWRGaWxlcyhmaWxlcylcblxuICAgIGl0IFwiW2FmdGVyIG1vdGlvbiBleGVjdXRlZF0gcmVxdWlyZSBtaW5pbXVtIHNldCBvZiBmaWxlc1wiLCAtPlxuICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbiAoZSkgLT5cbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZS5lbGVtZW50LCAndmltLW1vZGUtcGx1czptb3ZlLXJpZ2h0JylcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4dHJhU2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkID0gW1xuICAgICAgICAgICAgXCJsaWIvc3RhdHVzLWJhci1tYW5hZ2VyLmpzXCJcbiAgICAgICAgICAgIFwibGliL29wZXJhdGlvbi1zdGFjay5qc1wiXG4gICAgICAgICAgICBcImxpYi9zZWxlY3Rpb24td3JhcHBlci5qc1wiXG4gICAgICAgICAgICBcImxpYi91dGlscy5qc1wiXG4gICAgICAgICAgICBcIm5vZGVfbW9kdWxlcy91bmRlcnNjb3JlLXBsdXMvbGliL3VuZGVyc2NvcmUtcGx1cy5qc1wiXG4gICAgICAgICAgICBcIm5vZGVfbW9kdWxlcy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuanNcIlxuICAgICAgICAgICAgXCJsaWIvYmxvY2t3aXNlLXNlbGVjdGlvbi5qc1wiXG4gICAgICAgICAgICBcImxpYi9tb3Rpb24uY29mZmVlXCJcbiAgICAgICAgICAgIFwibGliL2N1cnNvci1zdHlsZS1tYW5hZ2VyLmpzXCJcbiAgICAgICAgICBdXG4gICAgICAgICAgZmlsZXMgPSBzaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQuY29uY2F0KGV4dHJhU2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkKVxuICAgICAgICAgIGVuc3VyZVJlcXVpcmVkRmlsZXMoZmlsZXMpXG5cbiAgZGVzY3JpYmUgXCJjb21tYW5kLXRhYmxlXCIsIC0+XG4gICAgIyAqIExvYWRpbmcgYXRvbSBjb21tYW5kcyBmcm9tIHByZS1nZW5lcmF0ZWQgY29tbWFuZC10YWJsZS5cbiAgICAjICogV2h5P1xuICAgICMgIHZtcCBhZGRzIGFib3V0IDMwMCBjbWRzLCB3aGljaCBpcyBodWdlLCBkeW5hbWljYWxseSBjYWxjdWxhdGluZyBhbmQgcmVnaXN0ZXIgY21kc1xuICAgICMgIHRvb2sgdmVyeSBsb25nIHRpbWUuXG4gICAgIyAgU28gY2FsY2x1YXRlIG5vbi1keW5hbWljIHBhciB0aGVuIHNhdmUgdG8gY29tbWFuZC10YWJsZS5jb2ZmZSBhbmQgbG9hZCBpbiBvbiBzdGFydHVwLlxuICAgICMgIFdoZW4gY29tbWFuZCBhcmUgZXhlY3V0ZWQsIG5lY2Vzc2FyeSBjb21tYW5kIGNsYXNzIGZpbGUgaXMgbGF6eS1yZXF1aXJlZC5cbiAgICBkZXNjcmliZSBcImluaXRpYWwgY2xhc3NSZWdpc3RyeVwiLCAtPlxuICAgICAgaXQgXCJjb250YWlucyBvbmUgZW50cnkgYW5kIGl0J3MgQmFzZSBjbGFzc1wiLCAtPlxuICAgICAgICB3aXRoQ2xlYW5BY3RpdmF0aW9uIChwYWNrKSAtPlxuICAgICAgICAgIEJhc2UgPSBwYWNrLm1haW5Nb2R1bGUucHJvdmlkZVZpbU1vZGVQbHVzKCkuQmFzZVxuICAgICAgICAgIGNsYXNzUmVnaXN0cnkgPSBCYXNlLmdldENsYXNzUmVnaXN0cnkoKVxuICAgICAgICAgIGtleXMgPSBPYmplY3Qua2V5cyhjbGFzc1JlZ2lzdHJ5KVxuICAgICAgICAgIGV4cGVjdChrZXlzKS50b0hhdmVMZW5ndGgoMSlcbiAgICAgICAgICBleHBlY3Qoa2V5c1swXSkudG9CZShcIkJhc2VcIilcbiAgICAgICAgICBleHBlY3QoY2xhc3NSZWdpc3RyeVtrZXlzWzBdXSkudG9CZShCYXNlKVxuXG4gICAgZGVzY3JpYmUgXCJmdWxseSBwb3B1bGF0ZWQgY2xhc3NSZWdpc3RyeVwiLCAtPlxuICAgICAgaXQgXCJnZW5lcmF0ZUNvbW1hbmRUYWJsZUJ5RWFnZXJMb2FkIHBvcHVsYXRlIGFsbCByZWdpc3RyeSBlYWdlcmx5XCIsIC0+XG4gICAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gKHBhY2spIC0+XG4gICAgICAgICAgQmFzZSA9IHBhY2subWFpbk1vZHVsZS5wcm92aWRlVmltTW9kZVBsdXMoKS5CYXNlXG4gICAgICAgICAgb2xkUmVnaXN0cmllcyA9IEJhc2UuZ2V0Q2xhc3NSZWdpc3RyeSgpXG4gICAgICAgICAgb2xkUmVnaXN0cmllc0xlbmd0aCA9IE9iamVjdC5rZXlzKG9sZFJlZ2lzdHJpZXMpLmxlbmd0aFxuICAgICAgICAgIGV4cGVjdChPYmplY3Qua2V5cyhvbGRSZWdpc3RyaWVzKSkudG9IYXZlTGVuZ3RoKDEpXG5cbiAgICAgICAgICBCYXNlLmdlbmVyYXRlQ29tbWFuZFRhYmxlQnlFYWdlckxvYWQoKVxuICAgICAgICAgIG5ld1JlZ2lzdHJpZXNMZW5ndGggPSBPYmplY3Qua2V5cyhCYXNlLmdldENsYXNzUmVnaXN0cnkoKSkubGVuZ3RoXG4gICAgICAgICAgZXhwZWN0KG5ld1JlZ2lzdHJpZXNMZW5ndGgpLnRvQmVHcmVhdGVyVGhhbihvbGRSZWdpc3RyaWVzTGVuZ3RoKVxuXG4gICAgZGVzY3JpYmUgXCJtYWtlIHN1cmUgY21kLXRhYmxlIGlzIE5PVCBvdXQtb2YtZGF0ZVwiLCAtPlxuICAgICAgaXQgXCJnZW5lcmF0ZUNvbW1hbmRUYWJsZUJ5RWFnZXJMb2FkIHJldHVybiB0YWJsZSB3aGljaCBpcyBlcXVhbHMgdG8gaW5pdGlhbGx5IGxvYWRlZCBjb21tYW5kIHRhYmxlXCIsIC0+XG4gICAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gKHBhY2spIC0+XG4gICAgICAgICAgQmFzZSA9IHBhY2subWFpbk1vZHVsZS5wcm92aWRlVmltTW9kZVBsdXMoKS5CYXNlXG4gICAgICAgICAgW29sZENvbW1hbmRUYWJsZSwgbmV3Q29tbWFuZFRhYmxlXSA9IFtdXG5cbiAgICAgICAgICBvbGRDb21tYW5kVGFibGUgPSBCYXNlLmNvbW1hbmRUYWJsZVxuICAgICAgICAgIG5ld0NvbW1hbmRUYWJsZSA9IEJhc2UuZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZCgpXG4gICAgICAgICAgbG9hZGVkQ29tbWFuZFRhYmxlID0gcmVxdWlyZSgnLi4vbGliL2NvbW1hbmQtdGFibGUnKVxuXG4gICAgICAgICAgZXhwZWN0KG9sZENvbW1hbmRUYWJsZSkubm90LnRvQmUobmV3Q29tbWFuZFRhYmxlKVxuICAgICAgICAgIGV4cGVjdChsb2FkZWRDb21tYW5kVGFibGUpLnRvRXF1YWwob2xkQ29tbWFuZFRhYmxlKVxuICAgICAgICAgIGV4cGVjdChsb2FkZWRDb21tYW5kVGFibGUpLnRvRXF1YWwobmV3Q29tbWFuZFRhYmxlKVxuIl19
