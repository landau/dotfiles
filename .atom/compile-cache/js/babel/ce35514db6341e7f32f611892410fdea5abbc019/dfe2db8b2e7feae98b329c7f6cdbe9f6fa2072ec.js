Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var Helpers = undefined;
var manifest = undefined;

function formatItem(item) {
  var name = undefined;
  if (item && typeof item === 'object' && typeof item.name === 'string') {
    name = item.name;
  } else if (typeof item === 'string') {
    name = item;
  } else {
    throw new Error('Unknown object passed to formatItem()');
  }
  return '  - ' + name;
}
function sortByName(item1, item2) {
  return item1.name.localeCompare(item2.name);
}

var Commands = (function () {
  function Commands() {
    var _this = this;

    _classCallCheck(this, Commands);

    this.emitter = new _atom.Emitter();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linter:enable-linter': function linterEnableLinter() {
        return _this.enableLinter();
      },
      'linter:disable-linter': function linterDisableLinter() {
        return _this.disableLinter();
      }
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
      'linter:lint': function linterLint() {
        return _this.lint();
      },
      'linter:debug': function linterDebug() {
        return _this.debug();
      },
      'linter:toggle-active-editor': function linterToggleActiveEditor() {
        return _this.toggleActiveEditor();
      }
    }));
  }

  _createClass(Commands, [{
    key: 'lint',
    value: function lint() {
      this.emitter.emit('should-lint');
    }
  }, {
    key: 'debug',
    value: function debug() {
      this.emitter.emit('should-debug');
    }
  }, {
    key: 'enableLinter',
    value: function enableLinter() {
      this.emitter.emit('should-toggle-linter', 'enable');
    }
  }, {
    key: 'disableLinter',
    value: function disableLinter() {
      this.emitter.emit('should-toggle-linter', 'disable');
    }
  }, {
    key: 'toggleActiveEditor',
    value: function toggleActiveEditor() {
      this.emitter.emit('should-toggle-active-editor');
    }
  }, {
    key: 'showDebug',
    value: function showDebug(standardLinters, indieLinters, uiProviders) {
      if (!manifest) {
        manifest = require('../package.json');
      }
      if (!Helpers) {
        Helpers = require('./helpers');
      }

      var textEditor = atom.workspace.getActiveTextEditor();
      var textEditorScopes = Helpers.getEditorCursorScopes(textEditor);
      var sortedLinters = standardLinters.slice().sort(sortByName);
      var sortedIndieLinters = indieLinters.slice().sort(sortByName);
      var sortedUIProviders = uiProviders.slice().sort(sortByName);

      var indieLinterNames = sortedIndieLinters.map(formatItem).join('\n');
      var standardLinterNames = sortedLinters.map(formatItem).join('\n');
      var matchingStandardLinters = sortedLinters.filter(function (linter) {
        return Helpers.shouldTriggerLinter(linter, false, textEditorScopes);
      }).map(formatItem).join('\n');
      var humanizedScopes = textEditorScopes.map(formatItem).join('\n');
      var uiProviderNames = sortedUIProviders.map(formatItem).join('\n');

      var ignoreGlob = atom.config.get('linter.ignoreGlob');
      var ignoreVCSIgnoredPaths = atom.config.get('core.excludeVcsIgnoredPaths');
      var disabledLinters = atom.config.get('linter.disabledProviders').map(formatItem).join('\n');
      var filePathIgnored = Helpers.isPathIgnored(textEditor.getPath(), ignoreGlob, ignoreVCSIgnoredPaths);

      atom.notifications.addInfo('Linter Debug Info', {
        detail: ['Platform: ' + process.platform, 'Atom Version: ' + atom.getVersion(), 'Linter Version: ' + manifest.version, 'Opened file is ignored: ' + (filePathIgnored ? 'Yes' : 'No'), 'Matching Linter Providers: \n' + matchingStandardLinters, 'Disabled Linter Providers: \n' + disabledLinters, 'Standard Linter Providers: \n' + standardLinterNames, 'Indie Linter Providers: \n' + indieLinterNames, 'UI Providers: \n' + uiProviderNames, 'Ignore Glob: ' + ignoreGlob, 'VCS Ignored Paths are excluded: ' + ignoreVCSIgnoredPaths, 'Current File Scopes: \n' + humanizedScopes].join('\n'),
        dismissable: true
      });
    }
  }, {
    key: 'onShouldLint',
    value: function onShouldLint(callback) {
      return this.emitter.on('should-lint', callback);
    }
  }, {
    key: 'onShouldDebug',
    value: function onShouldDebug(callback) {
      return this.emitter.on('should-debug', callback);
    }
  }, {
    key: 'onShouldToggleActiveEditor',
    value: function onShouldToggleActiveEditor(callback) {
      return this.emitter.on('should-toggle-active-editor', callback);
    }
  }, {
    key: 'onShouldToggleLinter',
    value: function onShouldToggleLinter(callback) {
      return this.emitter.on('should-toggle-linter', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }]);

  return Commands;
})();

exports['default'] = Commands;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvY29tbWFuZHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBRTZDLE1BQU07O0FBS25ELElBQUksT0FBTyxZQUFBLENBQUE7QUFDWCxJQUFJLFFBQVEsWUFBQSxDQUFBOztBQUVaLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRTtBQUN4QixNQUFJLElBQUksWUFBQSxDQUFBO0FBQ1IsTUFBSSxJQUFJLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDckUsUUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUE7R0FDakIsTUFBTSxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtBQUNuQyxRQUFJLEdBQUcsSUFBSSxDQUFBO0dBQ1osTUFBTTtBQUNMLFVBQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQTtHQUN6RDtBQUNELGtCQUFjLElBQUksQ0FBRTtDQUNyQjtBQUNELFNBQVMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDaEMsU0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7Q0FDNUM7O0lBRW9CLFFBQVE7QUFJaEIsV0FKUSxRQUFRLEdBSWI7OzswQkFKSyxRQUFROztBQUt6QixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3pELDRCQUFzQixFQUFFO2VBQU0sTUFB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QUE2QixFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2hFOzs7V0FDbUIsOEJBQUMsUUFBa0IsRUFBYztBQUNuRCxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ3pEOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDN0I7OztTQWxHa0IsUUFBUTs7O3FCQUFSLFFBQVEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9jb21tYW5kcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXIgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHR5cGUgeyBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIHsgTGludGVyLCBVSSB9IGZyb20gJy4vdHlwZXMnXG5pbXBvcnQgdHlwZSBJbmRpZURlbGVnYXRlIGZyb20gJy4vaW5kaWUtZGVsZWdhdGUnXG5cbmxldCBIZWxwZXJzXG5sZXQgbWFuaWZlc3RcblxuZnVuY3Rpb24gZm9ybWF0SXRlbShpdGVtKSB7XG4gIGxldCBuYW1lXG4gIGlmIChpdGVtICYmIHR5cGVvZiBpdGVtID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgaXRlbS5uYW1lID09PSAnc3RyaW5nJykge1xuICAgIG5hbWUgPSBpdGVtLm5hbWVcbiAgfSBlbHNlIGlmICh0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZycpIHtcbiAgICBuYW1lID0gaXRlbVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBvYmplY3QgcGFzc2VkIHRvIGZvcm1hdEl0ZW0oKScpXG4gIH1cbiAgcmV0dXJuIGAgIC0gJHtuYW1lfWBcbn1cbmZ1bmN0aW9uIHNvcnRCeU5hbWUoaXRlbTEsIGl0ZW0yKSB7XG4gIHJldHVybiBpdGVtMS5uYW1lLmxvY2FsZUNvbXBhcmUoaXRlbTIubmFtZSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZHMge1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdsaW50ZXI6ZW5hYmxlLWxpbnRlcic6ICgpID0+IHRoaXMuZW5hYmxlTGludGVyKCksXG4gICAgICAnbGludGVyOmRpc2FibGUtbGludGVyJzogKCkgPT4gdGhpcy5kaXNhYmxlTGludGVyKCksXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsIHtcbiAgICAgICdsaW50ZXI6bGludCc6ICgpID0+IHRoaXMubGludCgpLFxuICAgICAgJ2xpbnRlcjpkZWJ1Zyc6ICgpID0+IHRoaXMuZGVidWcoKSxcbiAgICAgICdsaW50ZXI6dG9nZ2xlLWFjdGl2ZS1lZGl0b3InOiAoKSA9PiB0aGlzLnRvZ2dsZUFjdGl2ZUVkaXRvcigpLFxuICAgIH0pKVxuICB9XG4gIGxpbnQoKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3Nob3VsZC1saW50JylcbiAgfVxuICBkZWJ1ZygpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnc2hvdWxkLWRlYnVnJylcbiAgfVxuICBlbmFibGVMaW50ZXIoKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3Nob3VsZC10b2dnbGUtbGludGVyJywgJ2VuYWJsZScpXG4gIH1cbiAgZGlzYWJsZUxpbnRlcigpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnc2hvdWxkLXRvZ2dsZS1saW50ZXInLCAnZGlzYWJsZScpXG4gIH1cbiAgdG9nZ2xlQWN0aXZlRWRpdG9yKCkge1xuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdzaG91bGQtdG9nZ2xlLWFjdGl2ZS1lZGl0b3InKVxuICB9XG4gIHNob3dEZWJ1ZyhzdGFuZGFyZExpbnRlcnM6IEFycmF5PExpbnRlcj4sIGluZGllTGludGVyczogQXJyYXk8SW5kaWVEZWxlZ2F0ZT4sIHVpUHJvdmlkZXJzOiBBcnJheTxVST4pIHtcbiAgICBpZiAoIW1hbmlmZXN0KSB7XG4gICAgICBtYW5pZmVzdCA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpXG4gICAgfVxuICAgIGlmICghSGVscGVycykge1xuICAgICAgSGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpXG4gICAgfVxuXG4gICAgY29uc3QgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGNvbnN0IHRleHRFZGl0b3JTY29wZXMgPSBIZWxwZXJzLmdldEVkaXRvckN1cnNvclNjb3Blcyh0ZXh0RWRpdG9yKVxuICAgIGNvbnN0IHNvcnRlZExpbnRlcnMgPSBzdGFuZGFyZExpbnRlcnMuc2xpY2UoKS5zb3J0KHNvcnRCeU5hbWUpXG4gICAgY29uc3Qgc29ydGVkSW5kaWVMaW50ZXJzID0gaW5kaWVMaW50ZXJzLnNsaWNlKCkuc29ydChzb3J0QnlOYW1lKVxuICAgIGNvbnN0IHNvcnRlZFVJUHJvdmlkZXJzID0gdWlQcm92aWRlcnMuc2xpY2UoKS5zb3J0KHNvcnRCeU5hbWUpXG5cbiAgICBjb25zdCBpbmRpZUxpbnRlck5hbWVzID0gc29ydGVkSW5kaWVMaW50ZXJzXG4gICAgICAubWFwKGZvcm1hdEl0ZW0pLmpvaW4oJ1xcbicpXG4gICAgY29uc3Qgc3RhbmRhcmRMaW50ZXJOYW1lcyA9IHNvcnRlZExpbnRlcnNcbiAgICAgIC5tYXAoZm9ybWF0SXRlbSkuam9pbignXFxuJylcbiAgICBjb25zdCBtYXRjaGluZ1N0YW5kYXJkTGludGVycyA9IHNvcnRlZExpbnRlcnNcbiAgICAgIC5maWx0ZXIobGludGVyID0+IEhlbHBlcnMuc2hvdWxkVHJpZ2dlckxpbnRlcihsaW50ZXIsIGZhbHNlLCB0ZXh0RWRpdG9yU2NvcGVzKSlcbiAgICAgIC5tYXAoZm9ybWF0SXRlbSkuam9pbignXFxuJylcbiAgICBjb25zdCBodW1hbml6ZWRTY29wZXMgPSB0ZXh0RWRpdG9yU2NvcGVzXG4gICAgICAubWFwKGZvcm1hdEl0ZW0pLmpvaW4oJ1xcbicpXG4gICAgY29uc3QgdWlQcm92aWRlck5hbWVzID0gc29ydGVkVUlQcm92aWRlcnNcbiAgICAgIC5tYXAoZm9ybWF0SXRlbSkuam9pbignXFxuJylcblxuICAgIGNvbnN0IGlnbm9yZUdsb2IgPSBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci5pZ25vcmVHbG9iJylcbiAgICBjb25zdCBpZ25vcmVWQ1NJZ25vcmVkUGF0aHMgPSBhdG9tLmNvbmZpZy5nZXQoJ2NvcmUuZXhjbHVkZVZjc0lnbm9yZWRQYXRocycpXG4gICAgY29uc3QgZGlzYWJsZWRMaW50ZXJzID0gYXRvbS5jb25maWcuZ2V0KCdsaW50ZXIuZGlzYWJsZWRQcm92aWRlcnMnKVxuICAgICAgLm1hcChmb3JtYXRJdGVtKS5qb2luKCdcXG4nKVxuICAgIGNvbnN0IGZpbGVQYXRoSWdub3JlZCA9IEhlbHBlcnMuaXNQYXRoSWdub3JlZCh0ZXh0RWRpdG9yLmdldFBhdGgoKSwgaWdub3JlR2xvYiwgaWdub3JlVkNTSWdub3JlZFBhdGhzKVxuXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ0xpbnRlciBEZWJ1ZyBJbmZvJywge1xuICAgICAgZGV0YWlsOiBbXG4gICAgICAgIGBQbGF0Zm9ybTogJHtwcm9jZXNzLnBsYXRmb3JtfWAsXG4gICAgICAgIGBBdG9tIFZlcnNpb246ICR7YXRvbS5nZXRWZXJzaW9uKCl9YCxcbiAgICAgICAgYExpbnRlciBWZXJzaW9uOiAke21hbmlmZXN0LnZlcnNpb259YCxcbiAgICAgICAgYE9wZW5lZCBmaWxlIGlzIGlnbm9yZWQ6ICR7ZmlsZVBhdGhJZ25vcmVkID8gJ1llcycgOiAnTm8nfWAsXG4gICAgICAgIGBNYXRjaGluZyBMaW50ZXIgUHJvdmlkZXJzOiBcXG4ke21hdGNoaW5nU3RhbmRhcmRMaW50ZXJzfWAsXG4gICAgICAgIGBEaXNhYmxlZCBMaW50ZXIgUHJvdmlkZXJzOiBcXG4ke2Rpc2FibGVkTGludGVyc31gLFxuICAgICAgICBgU3RhbmRhcmQgTGludGVyIFByb3ZpZGVyczogXFxuJHtzdGFuZGFyZExpbnRlck5hbWVzfWAsXG4gICAgICAgIGBJbmRpZSBMaW50ZXIgUHJvdmlkZXJzOiBcXG4ke2luZGllTGludGVyTmFtZXN9YCxcbiAgICAgICAgYFVJIFByb3ZpZGVyczogXFxuJHt1aVByb3ZpZGVyTmFtZXN9YCxcbiAgICAgICAgYElnbm9yZSBHbG9iOiAke2lnbm9yZUdsb2J9YCxcbiAgICAgICAgYFZDUyBJZ25vcmVkIFBhdGhzIGFyZSBleGNsdWRlZDogJHtpZ25vcmVWQ1NJZ25vcmVkUGF0aHN9YCxcbiAgICAgICAgYEN1cnJlbnQgRmlsZSBTY29wZXM6IFxcbiR7aHVtYW5pemVkU2NvcGVzfWAsXG4gICAgICBdLmpvaW4oJ1xcbicpLFxuICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgfSlcbiAgfVxuICBvblNob3VsZExpbnQoY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignc2hvdWxkLWxpbnQnLCBjYWxsYmFjaylcbiAgfVxuICBvblNob3VsZERlYnVnKGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3Nob3VsZC1kZWJ1ZycsIGNhbGxiYWNrKVxuICB9XG4gIG9uU2hvdWxkVG9nZ2xlQWN0aXZlRWRpdG9yKGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3Nob3VsZC10b2dnbGUtYWN0aXZlLWVkaXRvcicsIGNhbGxiYWNrKVxuICB9XG4gIG9uU2hvdWxkVG9nZ2xlTGludGVyKGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3Nob3VsZC10b2dnbGUtbGludGVyJywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cbiJdfQ==