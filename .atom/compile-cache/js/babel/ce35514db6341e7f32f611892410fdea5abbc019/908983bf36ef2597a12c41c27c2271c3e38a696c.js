var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashUniq = require('lodash.uniq');

var _lodashUniq2 = _interopRequireDefault(_lodashUniq);

var _atom = require('atom');

var _packageJson = require('../package.json');

var _packageJson2 = _interopRequireDefault(_packageJson);

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

var _uiRegistry = require('./ui-registry');

var _uiRegistry2 = _interopRequireDefault(_uiRegistry);

var _toggleView = require('./toggle-view');

var _toggleView2 = _interopRequireDefault(_toggleView);

var _indieRegistry = require('./indie-registry');

var _indieRegistry2 = _interopRequireDefault(_indieRegistry);

var _linterRegistry = require('./linter-registry');

var _linterRegistry2 = _interopRequireDefault(_linterRegistry);

var _messageRegistry = require('./message-registry');

var _messageRegistry2 = _interopRequireDefault(_messageRegistry);

var _editorRegistry = require('./editor-registry');

var _editorRegistry2 = _interopRequireDefault(_editorRegistry);

var _helpers = require('./helpers');

var Helpers = _interopRequireWildcard(_helpers);

var Linter = (function () {
  function Linter() {
    var _this = this;

    _classCallCheck(this, Linter);

    this.commands = new _commands2['default']();
    this.registryUI = new _uiRegistry2['default']();
    this.registryIndie = new _indieRegistry2['default']();
    this.registryEditors = new _editorRegistry2['default']();
    this.registryLinters = new _linterRegistry2['default']();
    this.registryMessages = new _messageRegistry2['default']();

    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.commands);
    this.subscriptions.add(this.registryUI);
    this.subscriptions.add(this.registryIndie);
    this.subscriptions.add(this.registryMessages);
    this.subscriptions.add(this.registryEditors);
    this.subscriptions.add(this.registryLinters);

    this.commands.onShouldLint(function () {
      var editorLinter = _this.registryEditors.get(atom.workspace.getActiveTextEditor());
      if (editorLinter) {
        editorLinter.lint();
      }
    });
    this.commands.onShouldToggleActiveEditor(function () {
      var textEditor = atom.workspace.getActiveTextEditor();
      var editor = _this.registryEditors.get(textEditor);
      if (editor) {
        editor.dispose();
      } else if (textEditor) {
        _this.registryEditors.createFromTextEditor(textEditor);
      }
    });
    // NOTE: ESLint arrow-parens rule has a bug
    // eslint-disable-next-line arrow-parens
    this.commands.onShouldDebug(_asyncToGenerator(function* () {
      var linters = _this.registryLinters.getLinters();
      var configFile = yield Helpers.getConfigFile();
      var textEditor = atom.workspace.getActiveTextEditor();
      var textEditorScopes = Helpers.getEditorCursorScopes(textEditor);

      var allLinters = linters.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      }).map(function (linter) {
        return '  - ' + linter.name;
      }).join('\n');
      var matchingLinters = linters.filter(function (linter) {
        return Helpers.shouldTriggerLinter(linter, false, textEditorScopes);
      }).sort(function (a, b) {
        return a.name.localeCompare(b.name);
      }).map(function (linter) {
        return '  - ' + linter.name;
      }).join('\n');
      var humanizedScopes = textEditorScopes.map(function (scope) {
        return '  - ' + scope;
      }).join('\n');
      var disabledLinters = (yield configFile.get('disabled')).map(function (linter) {
        return '  - ' + linter;
      }).join('\n');

      atom.notifications.addInfo('Linter Debug Info', {
        detail: ['Platform: ' + process.platform, 'Atom Version: ' + atom.getVersion(), 'Linter Version: ' + _packageJson2['default'].version, 'All Linter Providers: \n' + allLinters, 'Matching Linter Providers: \n' + matchingLinters, 'Disabled Linter Providers; \n' + disabledLinters, 'Current File scopes: \n' + humanizedScopes].join('\n'),
        dismissable: true
      });
    }));
    this.commands.onShouldToggleLinter(function (action) {
      var toggleView = new _toggleView2['default'](action, (0, _lodashUniq2['default'])(_this.registryLinters.getLinters().map(function (linter) {
        return linter.name;
      })));
      toggleView.onDidDispose(function () {
        _this.subscriptions.remove(toggleView);
      });
      toggleView.onDidDisable(function (name) {
        var linter = _this.registryLinters.getLinters().find(function (entry) {
          return entry.name === name;
        });
        if (linter) {
          _this.registryMessages.deleteByLinter(linter);
        }
      });
      toggleView.show();
      _this.subscriptions.add(toggleView);
    });
    this.registryIndie.observe(function (indieLinter) {
      indieLinter.onDidDestroy(function () {
        _this.registryMessages.deleteByLinter(indieLinter);
      });
    });
    this.registryEditors.observe(function (editorLinter) {
      editorLinter.onShouldLint(function (onChange) {
        _this.registryLinters.lint({ onChange: onChange, editor: editorLinter.getEditor() });
      });
      editorLinter.onDidDestroy(function () {
        _this.registryMessages.deleteByBuffer(editorLinter.getEditor().getBuffer());
      });
    });
    this.registryIndie.onDidUpdate(function (_ref) {
      var linter = _ref.linter;
      var messages = _ref.messages;

      _this.registryMessages.set({ linter: linter, messages: messages, buffer: null });
    });
    this.registryLinters.onDidUpdateMessages(function (_ref2) {
      var linter = _ref2.linter;
      var messages = _ref2.messages;
      var buffer = _ref2.buffer;

      _this.registryMessages.set({ linter: linter, messages: messages, buffer: buffer });
    });
    this.registryLinters.onDidBeginLinting(function (_ref3) {
      var linter = _ref3.linter;
      var filePath = _ref3.filePath;

      _this.registryUI.didBeginLinting(linter, filePath);
    });
    this.registryLinters.onDidFinishLinting(function (_ref4) {
      var linter = _ref4.linter;
      var filePath = _ref4.filePath;

      _this.registryUI.didFinishLinting(linter, filePath);
    });
    this.registryMessages.onDidUpdateMessages(function (difference) {
      _this.registryUI.render(difference);
    });

    this.registryEditors.activate();

    setTimeout(function () {
      // NOTE: Atom triggers this on boot so wait a while
      if (!_this.subscriptions.disposed) {
        _this.subscriptions.add(atom.project.onDidChangePaths(function () {
          _this.commands.lint();
        }));
      }
    }, 100);
  }

  _createClass(Linter, [{
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }

    // API methods for providing/consuming services
  }, {
    key: 'addUI',
    value: function addUI(ui) {
      this.registryUI.add(ui);
    }
  }, {
    key: 'deleteUI',
    value: function deleteUI(ui) {
      this.registryUI['delete'](ui);
    }
  }, {
    key: 'addLinter',
    value: function addLinter(linter) {
      var legacy = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      this.registryLinters.addLinter(linter, legacy);
    }
  }, {
    key: 'deleteLinter',
    value: function deleteLinter(linter) {
      this.registryLinters.deleteLinter(linter);
      this.registryMessages.deleteByLinter(linter);
    }
  }]);

  return Linter;
})();

module.exports = Linter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OzBCQUV3QixhQUFhOzs7O29CQUNELE1BQU07OzJCQUVyQixpQkFBaUI7Ozs7d0JBQ2pCLFlBQVk7Ozs7MEJBQ1YsZUFBZTs7OzswQkFDZixlQUFlOzs7OzZCQUNaLGtCQUFrQjs7Ozs4QkFDakIsbUJBQW1COzs7OytCQUNsQixvQkFBb0I7Ozs7OEJBQ3BCLG1CQUFtQjs7Ozt1QkFDdEIsV0FBVzs7SUFBeEIsT0FBTzs7SUFHYixNQUFNO0FBU0MsV0FUUCxNQUFNLEdBU0k7OzswQkFUVixNQUFNOztBQVVSLFFBQUksQ0FBQyxRQUFRLEdBQUcsMkJBQWMsQ0FBQTtBQUM5QixRQUFJLENBQUMsVUFBVSxHQUFHLDZCQUFnQixDQUFBO0FBQ2xDLFFBQUksQ0FBQyxhQUFhLEdBQUcsZ0NBQW1CLENBQUE7QUFDeEMsUUFBSSxDQUFDLGVBQWUsR0FBRyxpQ0FBcUIsQ0FBQTtBQUM1QyxRQUFJLENBQUMsZUFBZSxHQUFHLGlDQUFvQixDQUFBO0FBQzNDLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxrQ0FBcUIsQ0FBQTs7QUFFN0MsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ3JDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUN2QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDMUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUE7QUFDN0MsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFD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LEVBQUUsQ0FBQyxDQUFBO0tBQzNCOzs7V0FDUSxtQkFBQyxNQUFzQixFQUEyQjtVQUF6QixNQUFlLHlEQUFHLEtBQUs7O0FBQ3ZELFVBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtLQUMvQzs7O1dBQ1csc0JBQUMsTUFBc0IsRUFBRTtBQUNuQyxVQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUN6QyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0tBQzdDOzs7U0FqSkcsTUFBTTs7O0FBb0paLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBhcnJheVVuaXF1ZSBmcm9tICdsb2Rhc2gudW5pcSdcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5pbXBvcnQgbWFuaWZlc3QgZnJvbSAnLi4vcGFja2FnZS5qc29uJ1xuaW1wb3J0IENvbW1hbmRzIGZyb20gJy4vY29tbWFuZHMnXG5pbXBvcnQgVUlSZWdpc3RyeSBmcm9tICcuL3VpLXJlZ2lzdHJ5J1xuaW1wb3J0IFRvZ2dsZVZpZXcgZnJvbSAnLi90b2dnbGUtdmlldydcbmltcG9ydCBJbmRpZVJlZ2lzdHJ5IGZyb20gJy4vaW5kaWUtcmVnaXN0cnknXG5pbXBvcnQgTGludGVyUmVnaXN0cnkgZnJvbSAnLi9saW50ZXItcmVnaXN0cnknXG5pbXBvcnQgTWVzc2FnZVJlZ2lzdHJ5IGZyb20gJy4vbWVzc2FnZS1yZWdpc3RyeSdcbmltcG9ydCBFZGl0b3JzUmVnaXN0cnkgZnJvbSAnLi9lZGl0b3ItcmVnaXN0cnknXG5pbXBvcnQgKiBhcyBIZWxwZXJzIGZyb20gJy4vaGVscGVycydcbmltcG9ydCB0eXBlIHsgVUksIExpbnRlciBhcyBMaW50ZXJQcm92aWRlciB9IGZyb20gJy4vdHlwZXMnXG5cbmNsYXNzIExpbnRlciB7XG4gIGNvbW1hbmRzOiBDb21tYW5kcztcbiAgcmVnaXN0cnlVSTogVUlSZWdpc3RyeTtcbiAgcmVnaXN0cnlJbmRpZTogSW5kaWVSZWdpc3RyeTtcbiAgcmVnaXN0cnlFZGl0b3JzOiBFZGl0b3JzUmVnaXN0cnk7XG4gIHJlZ2lzdHJ5TGludGVyczogTGludGVyUmVnaXN0cnk7XG4gIHJlZ2lzdHJ5TWVzc2FnZXM6IE1lc3NhZ2VSZWdpc3RyeTtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbW1hbmRzID0gbmV3IENvbW1hbmRzKClcbiAgICB0aGlzLnJlZ2lzdHJ5VUkgPSBuZXcgVUlSZWdpc3RyeSgpXG4gICAgdGhpcy5yZWdpc3RyeUluZGllID0gbmV3IEluZGllUmVnaXN0cnkoKVxuICAgIHRoaXMucmVnaXN0cnlFZGl0b3JzID0gbmV3IEVkaXRvcnNSZWdpc3RyeSgpXG4gICAgdGhpcy5yZWdpc3RyeUxpbnRlcnMgPSBuZXcgTGludGVyUmVnaXN0cnkoKVxuICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcyA9IG5ldyBNZXNzYWdlUmVnaXN0cnkoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmNvbW1hbmRzKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5yZWdpc3RyeVVJKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5yZWdpc3RyeUluZGllKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5yZWdpc3RyeU1lc3NhZ2VzKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5yZWdpc3RyeUVkaXRvcnMpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnJlZ2lzdHJ5TGludGVycylcblxuICAgIHRoaXMuY29tbWFuZHMub25TaG91bGRMaW50KCgpID0+IHtcbiAgICAgIGNvbnN0IGVkaXRvckxpbnRlciA9IHRoaXMucmVnaXN0cnlFZGl0b3JzLmdldChhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgICBpZiAoZWRpdG9yTGludGVyKSB7XG4gICAgICAgIGVkaXRvckxpbnRlci5saW50KClcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMuY29tbWFuZHMub25TaG91bGRUb2dnbGVBY3RpdmVFZGl0b3IoKCkgPT4ge1xuICAgICAgY29uc3QgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgY29uc3QgZWRpdG9yID0gdGhpcy5yZWdpc3RyeUVkaXRvcnMuZ2V0KHRleHRFZGl0b3IpXG4gICAgICBpZiAoZWRpdG9yKSB7XG4gICAgICAgIGVkaXRvci5kaXNwb3NlKClcbiAgICAgIH0gZWxzZSBpZiAodGV4dEVkaXRvcikge1xuICAgICAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9ycy5jcmVhdGVGcm9tVGV4dEVkaXRvcih0ZXh0RWRpdG9yKVxuICAgICAgfVxuICAgIH0pXG4gICAgLy8gTk9URTogRVNMaW50IGFycm93LXBhcmVucyBydWxlIGhhcyBhIGJ1Z1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBhcnJvdy1wYXJlbnNcbiAgICB0aGlzLmNvbW1hbmRzLm9uU2hvdWxkRGVidWcoYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgbGludGVycyA9IHRoaXMucmVnaXN0cnlMaW50ZXJzLmdldExpbnRlcnMoKVxuICAgICAgY29uc3QgY29uZmlnRmlsZSA9IGF3YWl0IEhlbHBlcnMuZ2V0Q29uZmlnRmlsZSgpXG4gICAgICBjb25zdCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBjb25zdCB0ZXh0RWRpdG9yU2NvcGVzID0gSGVscGVycy5nZXRFZGl0b3JDdXJzb3JTY29wZXModGV4dEVkaXRvcilcblxuICAgICAgY29uc3QgYWxsTGludGVycyA9IGxpbnRlcnNcbiAgICAgICAgLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpXG4gICAgICAgIC5tYXAobGludGVyID0+IGAgIC0gJHtsaW50ZXIubmFtZX1gKS5qb2luKCdcXG4nKVxuICAgICAgY29uc3QgbWF0Y2hpbmdMaW50ZXJzID0gbGludGVyc1xuICAgICAgICAuZmlsdGVyKGxpbnRlciA9PiBIZWxwZXJzLnNob3VsZFRyaWdnZXJMaW50ZXIobGludGVyLCBmYWxzZSwgdGV4dEVkaXRvclNjb3BlcykpXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpKVxuICAgICAgICAubWFwKGxpbnRlciA9PiBgICAtICR7bGludGVyLm5hbWV9YCkuam9pbignXFxuJylcbiAgICAgIGNvbnN0IGh1bWFuaXplZFNjb3BlcyA9IHRleHRFZGl0b3JTY29wZXNcbiAgICAgICAgLm1hcChzY29wZSA9PiBgICAtICR7c2NvcGV9YCkuam9pbignXFxuJylcbiAgICAgIGNvbnN0IGRpc2FibGVkTGludGVycyA9IChhd2FpdCBjb25maWdGaWxlLmdldCgnZGlzYWJsZWQnKSlcbiAgICAgICAgLm1hcChsaW50ZXIgPT4gYCAgLSAke2xpbnRlcn1gKS5qb2luKCdcXG4nKVxuXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnTGludGVyIERlYnVnIEluZm8nLCB7XG4gICAgICAgIGRldGFpbDogW1xuICAgICAgICAgIGBQbGF0Zm9ybTogJHtwcm9jZXNzLnBsYXRmb3JtfWAsXG4gICAgICAgICAgYEF0b20gVmVyc2lvbjogJHthdG9tLmdldFZlcnNpb24oKX1gLFxuICAgICAgICAgIGBMaW50ZXIgVmVyc2lvbjogJHttYW5pZmVzdC52ZXJzaW9ufWAsXG4gICAgICAgICAgYEFsbCBMaW50ZXIgUHJvdmlkZXJzOiBcXG4ke2FsbExpbnRlcnN9YCxcbiAgICAgICAgICBgTWF0Y2hpbmcgTGludGVyIFByb3ZpZGVyczogXFxuJHttYXRjaGluZ0xpbnRlcnN9YCxcbiAgICAgICAgICBgRGlzYWJsZWQgTGludGVyIFByb3ZpZGVyczsgXFxuJHtkaXNhYmxlZExpbnRlcnN9YCxcbiAgICAgICAgICBgQ3VycmVudCBGaWxlIHNjb3BlczogXFxuJHtodW1hbml6ZWRTY29wZXN9YCxcbiAgICAgICAgXS5qb2luKCdcXG4nKSxcbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICB9KVxuICAgIH0pXG4gICAgdGhpcy5jb21tYW5kcy5vblNob3VsZFRvZ2dsZUxpbnRlcigoYWN0aW9uKSA9PiB7XG4gICAgICBjb25zdCB0b2dnbGVWaWV3ID0gbmV3IFRvZ2dsZVZpZXcoYWN0aW9uLCBhcnJheVVuaXF1ZSh0aGlzLnJlZ2lzdHJ5TGludGVycy5nZXRMaW50ZXJzKCkubWFwKGxpbnRlciA9PiBsaW50ZXIubmFtZSkpKVxuICAgICAgdG9nZ2xlVmlldy5vbkRpZERpc3Bvc2UoKCkgPT4ge1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMucmVtb3ZlKHRvZ2dsZVZpZXcpXG4gICAgICB9KVxuICAgICAgdG9nZ2xlVmlldy5vbkRpZERpc2FibGUoKG5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgbGludGVyID0gdGhpcy5yZWdpc3RyeUxpbnRlcnMuZ2V0TGludGVycygpLmZpbmQoZW50cnkgPT4gZW50cnkubmFtZSA9PT0gbmFtZSlcbiAgICAgICAgaWYgKGxpbnRlcikge1xuICAgICAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5kZWxldGVCeUxpbnRlcihsaW50ZXIpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB0b2dnbGVWaWV3LnNob3coKVxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0b2dnbGVWaWV3KVxuICAgIH0pXG4gICAgdGhpcy5yZWdpc3RyeUluZGllLm9ic2VydmUoKGluZGllTGludGVyKSA9PiB7XG4gICAgICBpbmRpZUxpbnRlci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMuZGVsZXRlQnlMaW50ZXIoaW5kaWVMaW50ZXIpXG4gICAgICB9KVxuICAgIH0pXG4gICAgdGhpcy5yZWdpc3RyeUVkaXRvcnMub2JzZXJ2ZSgoZWRpdG9yTGludGVyKSA9PiB7XG4gICAgICBlZGl0b3JMaW50ZXIub25TaG91bGRMaW50KChvbkNoYW5nZSkgPT4ge1xuICAgICAgICB0aGlzLnJlZ2lzdHJ5TGludGVycy5saW50KHsgb25DaGFuZ2UsIGVkaXRvcjogZWRpdG9yTGludGVyLmdldEVkaXRvcigpIH0pXG4gICAgICB9KVxuICAgICAgZWRpdG9yTGludGVyLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5kZWxldGVCeUJ1ZmZlcihlZGl0b3JMaW50ZXIuZ2V0RWRpdG9yKCkuZ2V0QnVmZmVyKCkpXG4gICAgICB9KVxuICAgIH0pXG4gICAgdGhpcy5yZWdpc3RyeUluZGllLm9uRGlkVXBkYXRlKCh7IGxpbnRlciwgbWVzc2FnZXMgfSkgPT4ge1xuICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLnNldCh7IGxpbnRlciwgbWVzc2FnZXMsIGJ1ZmZlcjogbnVsbCB9KVxuICAgIH0pXG4gICAgdGhpcy5yZWdpc3RyeUxpbnRlcnMub25EaWRVcGRhdGVNZXNzYWdlcygoeyBsaW50ZXIsIG1lc3NhZ2VzLCBidWZmZXIgfSkgPT4ge1xuICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLnNldCh7IGxpbnRlciwgbWVzc2FnZXMsIGJ1ZmZlciB9KVxuICAgIH0pXG4gICAgdGhpcy5yZWdpc3RyeUxpbnRlcnMub25EaWRCZWdpbkxpbnRpbmcoKHsgbGludGVyLCBmaWxlUGF0aCB9KSA9PiB7XG4gICAgICB0aGlzLnJlZ2lzdHJ5VUkuZGlkQmVnaW5MaW50aW5nKGxpbnRlciwgZmlsZVBhdGgpXG4gICAgfSlcbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVycy5vbkRpZEZpbmlzaExpbnRpbmcoKHsgbGludGVyLCBmaWxlUGF0aCB9KSA9PiB7XG4gICAgICB0aGlzLnJlZ2lzdHJ5VUkuZGlkRmluaXNoTGludGluZyhsaW50ZXIsIGZpbGVQYXRoKVxuICAgIH0pXG4gICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLm9uRGlkVXBkYXRlTWVzc2FnZXMoKGRpZmZlcmVuY2UpID0+IHtcbiAgICAgIHRoaXMucmVnaXN0cnlVSS5yZW5kZXIoZGlmZmVyZW5jZSlcbiAgICB9KVxuXG4gICAgdGhpcy5yZWdpc3RyeUVkaXRvcnMuYWN0aXZhdGUoKVxuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAvLyBOT1RFOiBBdG9tIHRyaWdnZXJzIHRoaXMgb24gYm9vdCBzbyB3YWl0IGEgd2hpbGVcbiAgICAgIGlmICghdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2VkKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuY29tbWFuZHMubGludCgpXG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH0sIDEwMClcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxuXG4gIC8vIEFQSSBtZXRob2RzIGZvciBwcm92aWRpbmcvY29uc3VtaW5nIHNlcnZpY2VzXG4gIGFkZFVJKHVpOiBVSSkge1xuICAgIHRoaXMucmVnaXN0cnlVSS5hZGQodWkpXG4gIH1cbiAgZGVsZXRlVUkodWk6IFVJKSB7XG4gICAgdGhpcy5yZWdpc3RyeVVJLmRlbGV0ZSh1aSlcbiAgfVxuICBhZGRMaW50ZXIobGludGVyOiBMaW50ZXJQcm92aWRlciwgbGVnYWN5OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVycy5hZGRMaW50ZXIobGludGVyLCBsZWdhY3kpXG4gIH1cbiAgZGVsZXRlTGludGVyKGxpbnRlcjogTGludGVyUHJvdmlkZXIpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVycy5kZWxldGVMaW50ZXIobGludGVyKVxuICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5kZWxldGVCeUxpbnRlcihsaW50ZXIpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMaW50ZXJcbiJdfQ==