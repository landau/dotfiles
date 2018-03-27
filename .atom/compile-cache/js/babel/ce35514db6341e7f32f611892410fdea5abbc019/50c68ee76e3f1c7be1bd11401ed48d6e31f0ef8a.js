var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

var Helpers = undefined;
var manifest = undefined;
var ToggleView = undefined;
var UIRegistry = undefined;
var arrayUnique = undefined;
var IndieRegistry = undefined;
var LinterRegistry = undefined;
var EditorsRegistry = undefined;
var MessageRegistry = undefined;

var Linter = (function () {
  function Linter() {
    var _this = this;

    _classCallCheck(this, Linter);

    this.idleCallbacks = new Set();
    this.subscriptions = new _atom.CompositeDisposable();

    this.commands = new _commands2['default']();
    this.subscriptions.add(this.commands);

    this.commands.onShouldLint(function () {
      _this.registryEditorsInit();
      var editorLinter = _this.registryEditors.get(atom.workspace.getActiveTextEditor());
      if (editorLinter) {
        editorLinter.lint();
      }
    });
    this.commands.onShouldToggleActiveEditor(function () {
      var textEditor = atom.workspace.getActiveTextEditor();
      _this.registryEditorsInit();
      var editor = _this.registryEditors.get(textEditor);
      if (editor) {
        editor.dispose();
      } else if (textEditor) {
        _this.registryEditors.createFromTextEditor(textEditor);
      }
    });
    this.commands.onShouldDebug(_asyncToGenerator(function* () {
      if (!Helpers) {
        Helpers = require('./helpers');
      }
      if (!manifest) {
        manifest = require('../package.json');
      }
      _this.registryLintersInit();
      var linters = _this.registryLinters.getLinters();
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
      var disabledLinters = atom.config.get('linter.disabledProviders').map(function (linter) {
        return '  - ' + linter;
      }).join('\n');

      atom.notifications.addInfo('Linter Debug Info', {
        detail: ['Platform: ' + process.platform, 'Atom Version: ' + atom.getVersion(), 'Linter Version: ' + manifest.version, 'All Linter Providers: \n' + allLinters, 'Matching Linter Providers: \n' + matchingLinters, 'Disabled Linter Providers; \n' + disabledLinters, 'Current File scopes: \n' + humanizedScopes].join('\n'),
        dismissable: true
      });
    }));
    this.commands.onShouldToggleLinter(function (action) {
      if (!ToggleView) {
        ToggleView = require('./toggle-view');
      }
      if (!arrayUnique) {
        arrayUnique = require('lodash.uniq');
      }
      _this.registryLintersInit();
      var toggleView = new ToggleView(action, arrayUnique(_this.registryLinters.getLinters().map(function (linter) {
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
          _this.registryMessagesInit();
          _this.registryMessages.deleteByLinter(linter);
        }
      });
      toggleView.show();
      _this.subscriptions.add(toggleView);
    });

    var projectPathChangeCallbackID = window.requestIdleCallback((function projectPathChange() {
      var _this2 = this;

      this.idleCallbacks['delete'](projectPathChangeCallbackID);
      // NOTE: Atom triggers this on boot so wait a while
      this.subscriptions.add(atom.project.onDidChangePaths(function () {
        _this2.commands.lint();
      }));
    }).bind(this));
    this.idleCallbacks.add(projectPathChangeCallbackID);

    var registryEditorsInitCallbackID = window.requestIdleCallback((function registryEditorsIdleInit() {
      this.idleCallbacks['delete'](registryEditorsInitCallbackID);
      // This will be called on the fly if needed, but needs to run on it's
      // own at some point or linting on open or on change will never trigger
      this.registryEditorsInit();
    }).bind(this));
    this.idleCallbacks.add(registryEditorsInitCallbackID);
  }

  _createClass(Linter, [{
    key: 'dispose',
    value: function dispose() {
      this.idleCallbacks.forEach(function (callbackID) {
        return window.cancelIdleCallback(callbackID);
      });
      this.idleCallbacks.clear();
      this.subscriptions.dispose();
    }
  }, {
    key: 'registryEditorsInit',
    value: function registryEditorsInit() {
      var _this3 = this;

      if (this.registryEditors) {
        return;
      }
      if (!EditorsRegistry) {
        EditorsRegistry = require('./editor-registry');
      }
      this.registryEditors = new EditorsRegistry();
      this.subscriptions.add(this.registryEditors);
      this.registryEditors.observe(function (editorLinter) {
        editorLinter.onShouldLint(function (onChange) {
          _this3.registryLintersInit();
          _this3.registryLinters.lint({ onChange: onChange, editor: editorLinter.getEditor() });
        });
        editorLinter.onDidDestroy(function () {
          _this3.registryMessagesInit();
          _this3.registryMessages.deleteByBuffer(editorLinter.getEditor().getBuffer());
        });
      });
      this.registryEditors.activate();
    }
  }, {
    key: 'registryLintersInit',
    value: function registryLintersInit() {
      var _this4 = this;

      if (this.registryLinters) {
        return;
      }
      if (!LinterRegistry) {
        LinterRegistry = require('./linter-registry');
      }
      this.registryLinters = new LinterRegistry();
      this.subscriptions.add(this.registryLinters);
      this.registryLinters.onDidUpdateMessages(function (_ref) {
        var linter = _ref.linter;
        var messages = _ref.messages;
        var buffer = _ref.buffer;

        _this4.registryMessagesInit();
        _this4.registryMessages.set({ linter: linter, messages: messages, buffer: buffer });
      });
      this.registryLinters.onDidBeginLinting(function (_ref2) {
        var linter = _ref2.linter;
        var filePath = _ref2.filePath;

        _this4.registryUIInit();
        _this4.registryUI.didBeginLinting(linter, filePath);
      });
      this.registryLinters.onDidFinishLinting(function (_ref3) {
        var linter = _ref3.linter;
        var filePath = _ref3.filePath;

        _this4.registryUIInit();
        _this4.registryUI.didFinishLinting(linter, filePath);
      });
    }
  }, {
    key: 'registryIndieInit',
    value: function registryIndieInit() {
      var _this5 = this;

      if (this.registryIndie) {
        return;
      }
      if (!IndieRegistry) {
        IndieRegistry = require('./indie-registry');
      }
      this.registryIndie = new IndieRegistry();
      this.subscriptions.add(this.registryIndie);
      this.registryIndie.observe(function (indieLinter) {
        indieLinter.onDidDestroy(function () {
          _this5.registryMessagesInit();
          _this5.registryMessages.deleteByLinter(indieLinter);
        });
      });
      this.registryIndie.onDidUpdate(function (_ref4) {
        var linter = _ref4.linter;
        var messages = _ref4.messages;

        _this5.registryMessagesInit();
        _this5.registryMessages.set({ linter: linter, messages: messages, buffer: null });
      });
    }
  }, {
    key: 'registryMessagesInit',
    value: function registryMessagesInit() {
      var _this6 = this;

      if (this.registryMessages) {
        return;
      }
      if (!MessageRegistry) {
        MessageRegistry = require('./message-registry');
      }
      this.registryMessages = new MessageRegistry();
      this.subscriptions.add(this.registryMessages);
      this.registryMessages.onDidUpdateMessages(function (difference) {
        _this6.registryUIInit();
        _this6.registryUI.render(difference);
      });
    }
  }, {
    key: 'registryUIInit',
    value: function registryUIInit() {
      if (this.registryUI) {
        return;
      }
      if (!UIRegistry) {
        UIRegistry = require('./ui-registry');
      }
      this.registryUI = new UIRegistry();
      this.subscriptions.add(this.registryUI);
    }

    // API methods for providing/consuming services
    // UI
  }, {
    key: 'addUI',
    value: function addUI(ui) {
      this.registryUIInit();
      this.registryUI.add(ui);
      this.registryMessagesInit();
      var messages = this.registryMessages.messages;
      if (messages.length) {
        ui.render({ added: messages, messages: messages, removed: [] });
      }
    }
  }, {
    key: 'deleteUI',
    value: function deleteUI(ui) {
      this.registryUIInit();
      this.registryUI['delete'](ui);
    }

    // Standard Linter
  }, {
    key: 'addLinter',
    value: function addLinter(linter) {
      var legacy = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      this.registryLintersInit();
      this.registryLinters.addLinter(linter, legacy);
    }
  }, {
    key: 'deleteLinter',
    value: function deleteLinter(linter) {
      this.registryLintersInit();
      this.registryLinters.deleteLinter(linter);
      this.registryMessagesInit();
      this.registryMessages.deleteByLinter(linter);
    }

    // Indie Linter
  }, {
    key: 'addIndie',
    value: function addIndie(indie) {
      this.registryIndieInit();
      return this.registryIndie.register(indie, 2);
    }
  }, {
    key: 'addLegacyIndie',
    value: function addLegacyIndie(indie) {
      this.registryIndieInit();
      return this.registryIndie.register(indie, 1);
    }
  }]);

  return Linter;
})();

module.exports = Linter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFb0MsTUFBTTs7d0JBRXJCLFlBQVk7Ozs7QUFHakMsSUFBSSxPQUFPLFlBQUEsQ0FBQTtBQUNYLElBQUksUUFBUSxZQUFBLENBQUE7QUFDWixJQUFJLFVBQVUsWUFBQSxDQUFBO0FBQ2QsSUFBSSxVQUFVLFlBQUEsQ0FBQTtBQUNkLElBQUksV0FBVyxZQUFBLENBQUE7QUFDZixJQUFJLGFBQWEsWUFBQSxDQUFBO0FBQ2pCLElBQUksY0FBYyxZQUFBLENBQUE7QUFDbEIsSUFBSSxlQUFlLFlBQUEsQ0FBQTtBQUNuQixJQUFJLGVBQWUsWUFBQSxDQUFBOztJQUViLE1BQU07QUFVQyxXQVZQLE1BQU0sR0FVSTs7OzBCQVZWLE1BQU07O0FBV1IsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQzlCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxRQUFRLEdBQUcsMkJBQWMsQ0FBQTtBQUM5QixRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7O0FBRXJDLFFBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQU07QUFDL0IsWUFBSyxtQkFBbUIsRUFBRSxDQUFBO0FBQzFCLFVBQU0sWUFBWSxHQUFHLE1BQUssZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQTtBQUNuRixVQUFJLFlBQVksRUFBRTtBQUNoQixvQkFBWSxDQUFDLElBQUksRUFBRSxDQUFBO09BQ3BCO0tBQ0YsQ0FBQyxDQUFBO0FBQ0YsUUFBSSxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsQ0FBQyxZQUFNO0FBQzdDLFVBQU0sVUFBVSxHQUFHLElBQUks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Q0FBQyxpQkFBaUIsRUFBRSxDQUFBO0FBQ3hCLGFBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFBO0tBQzdDOzs7V0FDYSx3QkFBQyxLQUFhLEVBQUU7QUFDNUIsVUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUE7QUFDeEIsYUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUE7S0FDN0M7OztTQWxQRyxNQUFNOzs7QUFxUFosTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbmltcG9ydCBDb21tYW5kcyBmcm9tICcuL2NvbW1hbmRzJ1xuaW1wb3J0IHR5cGUgeyBVSSwgTGludGVyIGFzIExpbnRlclByb3ZpZGVyIH0gZnJvbSAnLi90eXBlcydcblxubGV0IEhlbHBlcnNcbmxldCBtYW5pZmVzdFxubGV0IFRvZ2dsZVZpZXdcbmxldCBVSVJlZ2lzdHJ5XG5sZXQgYXJyYXlVbmlxdWVcbmxldCBJbmRpZVJlZ2lzdHJ5XG5sZXQgTGludGVyUmVnaXN0cnlcbmxldCBFZGl0b3JzUmVnaXN0cnlcbmxldCBNZXNzYWdlUmVnaXN0cnlcblxuY2xhc3MgTGludGVyIHtcbiAgY29tbWFuZHM6IENvbW1hbmRzO1xuICByZWdpc3RyeVVJOiBVSVJlZ2lzdHJ5O1xuICByZWdpc3RyeUluZGllOiBJbmRpZVJlZ2lzdHJ5O1xuICByZWdpc3RyeUVkaXRvcnM6IEVkaXRvcnNSZWdpc3RyeTtcbiAgcmVnaXN0cnlMaW50ZXJzOiBMaW50ZXJSZWdpc3RyeTtcbiAgcmVnaXN0cnlNZXNzYWdlczogTWVzc2FnZVJlZ2lzdHJ5O1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBpZGxlQ2FsbGJhY2tzOiBTZXQ8bnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MgPSBuZXcgU2V0KClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLmNvbW1hbmRzID0gbmV3IENvbW1hbmRzKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuY29tbWFuZHMpXG5cbiAgICB0aGlzLmNvbW1hbmRzLm9uU2hvdWxkTGludCgoKSA9PiB7XG4gICAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9yc0luaXQoKVxuICAgICAgY29uc3QgZWRpdG9yTGludGVyID0gdGhpcy5yZWdpc3RyeUVkaXRvcnMuZ2V0KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmIChlZGl0b3JMaW50ZXIpIHtcbiAgICAgICAgZWRpdG9yTGludGVyLmxpbnQoKVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5jb21tYW5kcy5vblNob3VsZFRvZ2dsZUFjdGl2ZUVkaXRvcigoKSA9PiB7XG4gICAgICBjb25zdCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9yc0luaXQoKVxuICAgICAgY29uc3QgZWRpdG9yID0gdGhpcy5yZWdpc3RyeUVkaXRvcnMuZ2V0KHRleHRFZGl0b3IpXG4gICAgICBpZiAoZWRpdG9yKSB7XG4gICAgICAgIGVkaXRvci5kaXNwb3NlKClcbiAgICAgIH0gZWxzZSBpZiAodGV4dEVkaXRvcikge1xuICAgICAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9ycy5jcmVhdGVGcm9tVGV4dEVkaXRvcih0ZXh0RWRpdG9yKVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5jb21tYW5kcy5vblNob3VsZERlYnVnKGFzeW5jICgpID0+IHtcbiAgICAgIGlmICghSGVscGVycykge1xuICAgICAgICBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJylcbiAgICAgIH1cbiAgICAgIGlmICghbWFuaWZlc3QpIHtcbiAgICAgICAgbWFuaWZlc3QgPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKVxuICAgICAgfVxuICAgICAgdGhpcy5yZWdpc3RyeUxpbnRlcnNJbml0KClcbiAgICAgIGNvbnN0IGxpbnRlcnMgPSB0aGlzLnJlZ2lzdHJ5TGludGVycy5nZXRMaW50ZXJzKClcbiAgICAgIGNvbnN0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGNvbnN0IHRleHRFZGl0b3JTY29wZXMgPSBIZWxwZXJzLmdldEVkaXRvckN1cnNvclNjb3Blcyh0ZXh0RWRpdG9yKVxuXG4gICAgICBjb25zdCBhbGxMaW50ZXJzID0gbGludGVyc1xuICAgICAgICAuc29ydCgoYSwgYikgPT4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKSlcbiAgICAgICAgLm1hcChsaW50ZXIgPT4gYCAgLSAke2xpbnRlci5uYW1lfWApLmpvaW4oJ1xcbicpXG4gICAgICBjb25zdCBtYXRjaGluZ0xpbnRlcnMgPSBsaW50ZXJzXG4gICAgICAgIC5maWx0ZXIobGludGVyID0+IEhlbHBlcnMuc2hvdWxkVHJpZ2dlckxpbnRlcihsaW50ZXIsIGZhbHNlLCB0ZXh0RWRpdG9yU2NvcGVzKSlcbiAgICAgICAgLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpXG4gICAgICAgIC5tYXAobGludGVyID0+IGAgIC0gJHtsaW50ZXIubmFtZX1gKS5qb2luKCdcXG4nKVxuICAgICAgY29uc3QgaHVtYW5pemVkU2NvcGVzID0gdGV4dEVkaXRvclNjb3Blc1xuICAgICAgICAubWFwKHNjb3BlID0+IGAgIC0gJHtzY29wZX1gKS5qb2luKCdcXG4nKVxuICAgICAgY29uc3QgZGlzYWJsZWRMaW50ZXJzID0gYXRvbS5jb25maWcuZ2V0KCdsaW50ZXIuZGlzYWJsZWRQcm92aWRlcnMnKVxuICAgICAgICAubWFwKGxpbnRlciA9PiBgICAtICR7bGludGVyfWApLmpvaW4oJ1xcbicpXG5cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdMaW50ZXIgRGVidWcgSW5mbycsIHtcbiAgICAgICAgZGV0YWlsOiBbXG4gICAgICAgICAgYFBsYXRmb3JtOiAke3Byb2Nlc3MucGxhdGZvcm19YCxcbiAgICAgICAgICBgQXRvbSBWZXJzaW9uOiAke2F0b20uZ2V0VmVyc2lvbigpfWAsXG4gICAgICAgICAgYExpbnRlciBWZXJzaW9uOiAke21hbmlmZXN0LnZlcnNpb259YCxcbiAgICAgICAgICBgQWxsIExpbnRlciBQcm92aWRlcnM6IFxcbiR7YWxsTGludGVyc31gLFxuICAgICAgICAgIGBNYXRjaGluZyBMaW50ZXIgUHJvdmlkZXJzOiBcXG4ke21hdGNoaW5nTGludGVyc31gLFxuICAgICAgICAgIGBEaXNhYmxlZCBMaW50ZXIgUHJvdmlkZXJzOyBcXG4ke2Rpc2FibGVkTGludGVyc31gLFxuICAgICAgICAgIGBDdXJyZW50IEZpbGUgc2NvcGVzOiBcXG4ke2h1bWFuaXplZFNjb3Blc31gLFxuICAgICAgICBdLmpvaW4oJ1xcbicpLFxuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgIH0pXG4gICAgfSlcbiAgICB0aGlzLmNvbW1hbmRzLm9uU2hvdWxkVG9nZ2xlTGludGVyKChhY3Rpb24pID0+IHtcbiAgICAgIGlmICghVG9nZ2xlVmlldykge1xuICAgICAgICBUb2dnbGVWaWV3ID0gcmVxdWlyZSgnLi90b2dnbGUtdmlldycpXG4gICAgICB9XG4gICAgICBpZiAoIWFycmF5VW5pcXVlKSB7XG4gICAgICAgIGFycmF5VW5pcXVlID0gcmVxdWlyZSgnbG9kYXNoLnVuaXEnKVxuICAgICAgfVxuICAgICAgdGhpcy5yZWdpc3RyeUxpbnRlcnNJbml0KClcbiAgICAgIGNvbnN0IHRvZ2dsZVZpZXcgPSBuZXcgVG9nZ2xlVmlldyhhY3Rpb24sXG4gICAgICAgIGFycmF5VW5pcXVlKHRoaXMucmVnaXN0cnlMaW50ZXJzLmdldExpbnRlcnMoKS5tYXAobGludGVyID0+IGxpbnRlci5uYW1lKSkpXG4gICAgICB0b2dnbGVWaWV3Lm9uRGlkRGlzcG9zZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5yZW1vdmUodG9nZ2xlVmlldylcbiAgICAgIH0pXG4gICAgICB0b2dnbGVWaWV3Lm9uRGlkRGlzYWJsZSgobmFtZSkgPT4ge1xuICAgICAgICBjb25zdCBsaW50ZXIgPSB0aGlzLnJlZ2lzdHJ5TGludGVycy5nZXRMaW50ZXJzKCkuZmluZChlbnRyeSA9PiBlbnRyeS5uYW1lID09PSBuYW1lKVxuICAgICAgICBpZiAobGludGVyKSB7XG4gICAgICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzSW5pdCgpXG4gICAgICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLmRlbGV0ZUJ5TGludGVyKGxpbnRlcilcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHRvZ2dsZVZpZXcuc2hvdygpXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRvZ2dsZVZpZXcpXG4gICAgfSlcblxuICAgIGNvbnN0IHByb2plY3RQYXRoQ2hhbmdlQ2FsbGJhY2tJRCA9IHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrKFxuICAgICAgZnVuY3Rpb24gcHJvamVjdFBhdGhDaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5kZWxldGUocHJvamVjdFBhdGhDaGFuZ2VDYWxsYmFja0lEKVxuICAgICAgICAvLyBOT1RFOiBBdG9tIHRyaWdnZXJzIHRoaXMgb24gYm9vdCBzbyB3YWl0IGEgd2hpbGVcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jb21tYW5kcy5saW50KClcbiAgICAgICAgfSkpXG4gICAgICB9LmJpbmQodGhpcykpXG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmFkZChwcm9qZWN0UGF0aENoYW5nZUNhbGxiYWNrSUQpXG5cbiAgICBjb25zdCByZWdpc3RyeUVkaXRvcnNJbml0Q2FsbGJhY2tJRCA9IHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrKFxuICAgICAgZnVuY3Rpb24gcmVnaXN0cnlFZGl0b3JzSWRsZUluaXQoKSB7XG4gICAgICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5kZWxldGUocmVnaXN0cnlFZGl0b3JzSW5pdENhbGxiYWNrSUQpXG4gICAgICAgIC8vIFRoaXMgd2lsbCBiZSBjYWxsZWQgb24gdGhlIGZseSBpZiBuZWVkZWQsIGJ1dCBuZWVkcyB0byBydW4gb24gaXQnc1xuICAgICAgICAvLyBvd24gYXQgc29tZSBwb2ludCBvciBsaW50aW5nIG9uIG9wZW4gb3Igb24gY2hhbmdlIHdpbGwgbmV2ZXIgdHJpZ2dlclxuICAgICAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9yc0luaXQoKVxuICAgICAgfS5iaW5kKHRoaXMpKVxuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5hZGQocmVnaXN0cnlFZGl0b3JzSW5pdENhbGxiYWNrSUQpXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MuZm9yRWFjaChjYWxsYmFja0lEID0+IHdpbmRvdy5jYW5jZWxJZGxlQ2FsbGJhY2soY2FsbGJhY2tJRCkpXG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmNsZWFyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cblxuICByZWdpc3RyeUVkaXRvcnNJbml0KCkge1xuICAgIGlmICh0aGlzLnJlZ2lzdHJ5RWRpdG9ycykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICghRWRpdG9yc1JlZ2lzdHJ5KSB7XG4gICAgICBFZGl0b3JzUmVnaXN0cnkgPSByZXF1aXJlKCcuL2VkaXRvci1yZWdpc3RyeScpXG4gICAgfVxuICAgIHRoaXMucmVnaXN0cnlFZGl0b3JzID0gbmV3IEVkaXRvcnNSZWdpc3RyeSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnJlZ2lzdHJ5RWRpdG9ycylcbiAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9ycy5vYnNlcnZlKChlZGl0b3JMaW50ZXIpID0+IHtcbiAgICAgIGVkaXRvckxpbnRlci5vblNob3VsZExpbnQoKG9uQ2hhbmdlKSA9PiB7XG4gICAgICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzSW5pdCgpXG4gICAgICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLmxpbnQoeyBvbkNoYW5nZSwgZWRpdG9yOiBlZGl0b3JMaW50ZXIuZ2V0RWRpdG9yKCkgfSlcbiAgICAgIH0pXG4gICAgICBlZGl0b3JMaW50ZXIub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzSW5pdCgpXG4gICAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5kZWxldGVCeUJ1ZmZlcihlZGl0b3JMaW50ZXIuZ2V0RWRpdG9yKCkuZ2V0QnVmZmVyKCkpXG4gICAgICB9KVxuICAgIH0pXG4gICAgdGhpcy5yZWdpc3RyeUVkaXRvcnMuYWN0aXZhdGUoKVxuICB9XG4gIHJlZ2lzdHJ5TGludGVyc0luaXQoKSB7XG4gICAgaWYgKHRoaXMucmVnaXN0cnlMaW50ZXJzKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKCFMaW50ZXJSZWdpc3RyeSkge1xuICAgICAgTGludGVyUmVnaXN0cnkgPSByZXF1aXJlKCcuL2xpbnRlci1yZWdpc3RyeScpXG4gICAgfVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzID0gbmV3IExpbnRlclJlZ2lzdHJ5KClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMucmVnaXN0cnlMaW50ZXJzKVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLm9uRGlkVXBkYXRlTWVzc2FnZXMoKHsgbGludGVyLCBtZXNzYWdlcywgYnVmZmVyIH0pID0+IHtcbiAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlc0luaXQoKVxuICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLnNldCh7IGxpbnRlciwgbWVzc2FnZXMsIGJ1ZmZlciB9KVxuICAgIH0pXG4gICAgdGhpcy5yZWdpc3RyeUxpbnRlcnMub25EaWRCZWdpbkxpbnRpbmcoKHsgbGludGVyLCBmaWxlUGF0aCB9KSA9PiB7XG4gICAgICB0aGlzLnJlZ2lzdHJ5VUlJbml0KClcbiAgICAgIHRoaXMucmVnaXN0cnlVSS5kaWRCZWdpbkxpbnRpbmcobGludGVyLCBmaWxlUGF0aClcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLm9uRGlkRmluaXNoTGludGluZygoeyBsaW50ZXIsIGZpbGVQYXRoIH0pID0+IHtcbiAgICAgIHRoaXMucmVnaXN0cnlVSUluaXQoKVxuICAgICAgdGhpcy5yZWdpc3RyeVVJLmRpZEZpbmlzaExpbnRpbmcobGludGVyLCBmaWxlUGF0aClcbiAgICB9KVxuICB9XG4gIHJlZ2lzdHJ5SW5kaWVJbml0KCkge1xuICAgIGlmICh0aGlzLnJlZ2lzdHJ5SW5kaWUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAoIUluZGllUmVnaXN0cnkpIHtcbiAgICAgIEluZGllUmVnaXN0cnkgPSByZXF1aXJlKCcuL2luZGllLXJlZ2lzdHJ5JylcbiAgICB9XG4gICAgdGhpcy5yZWdpc3RyeUluZGllID0gbmV3IEluZGllUmVnaXN0cnkoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5yZWdpc3RyeUluZGllKVxuICAgIHRoaXMucmVnaXN0cnlJbmRpZS5vYnNlcnZlKChpbmRpZUxpbnRlcikgPT4ge1xuICAgICAgaW5kaWVMaW50ZXIub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzSW5pdCgpXG4gICAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5kZWxldGVCeUxpbnRlcihpbmRpZUxpbnRlcilcbiAgICAgIH0pXG4gICAgfSlcbiAgICB0aGlzLnJlZ2lzdHJ5SW5kaWUub25EaWRVcGRhdGUoKHsgbGludGVyLCBtZXNzYWdlcyB9KSA9PiB7XG4gICAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXNJbml0KClcbiAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5zZXQoeyBsaW50ZXIsIG1lc3NhZ2VzLCBidWZmZXI6IG51bGwgfSlcbiAgICB9KVxuICB9XG4gIHJlZ2lzdHJ5TWVzc2FnZXNJbml0KCkge1xuICAgIGlmICh0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAoIU1lc3NhZ2VSZWdpc3RyeSkge1xuICAgICAgTWVzc2FnZVJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9tZXNzYWdlLXJlZ2lzdHJ5JylcbiAgICB9XG4gICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzID0gbmV3IE1lc3NhZ2VSZWdpc3RyeSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMpXG4gICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLm9uRGlkVXBkYXRlTWVzc2FnZXMoKGRpZmZlcmVuY2UpID0+IHtcbiAgICAgIHRoaXMucmVnaXN0cnlVSUluaXQoKVxuICAgICAgdGhpcy5yZWdpc3RyeVVJLnJlbmRlcihkaWZmZXJlbmNlKVxuICAgIH0pXG4gIH1cbiAgcmVnaXN0cnlVSUluaXQoKSB7XG4gICAgaWYgKHRoaXMucmVnaXN0cnlVSSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICghVUlSZWdpc3RyeSkge1xuICAgICAgVUlSZWdpc3RyeSA9IHJlcXVpcmUoJy4vdWktcmVnaXN0cnknKVxuICAgIH1cbiAgICB0aGlzLnJlZ2lzdHJ5VUkgPSBuZXcgVUlSZWdpc3RyeSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnJlZ2lzdHJ5VUkpXG4gIH1cblxuICAvLyBBUEkgbWV0aG9kcyBmb3IgcHJvdmlkaW5nL2NvbnN1bWluZyBzZXJ2aWNlc1xuICAvLyBVSVxuICBhZGRVSSh1aTogVUkpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5VUlJbml0KClcbiAgICB0aGlzLnJlZ2lzdHJ5VUkuYWRkKHVpKVxuICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlc0luaXQoKVxuICAgIGNvbnN0IG1lc3NhZ2VzID0gdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLm1lc3NhZ2VzXG4gICAgaWYgKG1lc3NhZ2VzLmxlbmd0aCkge1xuICAgICAgdWkucmVuZGVyKHsgYWRkZWQ6IG1lc3NhZ2VzLCBtZXNzYWdlcywgcmVtb3ZlZDogW10gfSlcbiAgICB9XG4gIH1cbiAgZGVsZXRlVUkodWk6IFVJKSB7XG4gICAgdGhpcy5yZWdpc3RyeVVJSW5pdCgpXG4gICAgdGhpcy5yZWdpc3RyeVVJLmRlbGV0ZSh1aSlcbiAgfVxuICAvLyBTdGFuZGFyZCBMaW50ZXJcbiAgYWRkTGludGVyKGxpbnRlcjogTGludGVyUHJvdmlkZXIsIGxlZ2FjeTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgdGhpcy5yZWdpc3RyeUxpbnRlcnNJbml0KClcbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVycy5hZGRMaW50ZXIobGludGVyLCBsZWdhY3kpXG4gIH1cbiAgZGVsZXRlTGludGVyKGxpbnRlcjogTGludGVyUHJvdmlkZXIpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVyc0luaXQoKVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLmRlbGV0ZUxpbnRlcihsaW50ZXIpXG4gICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzSW5pdCgpXG4gICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLmRlbGV0ZUJ5TGludGVyKGxpbnRlcilcbiAgfVxuICAvLyBJbmRpZSBMaW50ZXJcbiAgYWRkSW5kaWUoaW5kaWU6IE9iamVjdCkge1xuICAgIHRoaXMucmVnaXN0cnlJbmRpZUluaXQoKVxuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5SW5kaWUucmVnaXN0ZXIoaW5kaWUsIDIpXG4gIH1cbiAgYWRkTGVnYWN5SW5kaWUoaW5kaWU6IE9iamVjdCkge1xuICAgIHRoaXMucmVnaXN0cnlJbmRpZUluaXQoKVxuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5SW5kaWUucmVnaXN0ZXIoaW5kaWUsIDEpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMaW50ZXJcbiJdfQ==