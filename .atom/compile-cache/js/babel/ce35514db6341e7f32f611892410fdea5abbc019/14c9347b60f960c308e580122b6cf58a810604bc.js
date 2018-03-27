var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

var Helpers = undefined;
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
      _this.registryUIInit();
      _this.registryIndieInit();
      _this.registryLintersInit();
      _this.commands.showDebug(_this.registryLinters.getProviders(), _this.registryIndie.getProviders(), _this.registryUI.getProviders());
    }));
    this.commands.onShouldToggleLinter(function (action) {
      if (!ToggleView) {
        ToggleView = require('./toggle-view');
      }
      if (!arrayUnique) {
        arrayUnique = require('lodash.uniq');
      }
      _this.registryLintersInit();
      var toggleView = new ToggleView(action, arrayUnique(_this.registryLinters.getProviders().map(function (linter) {
        return linter.name;
      })));
      toggleView.onDidDispose(function () {
        _this.subscriptions.remove(toggleView);
      });
      toggleView.onDidDisable(function (name) {
        var linter = _this.registryLinters.getProviders().find(function (entry) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFb0MsTUFBTTs7d0JBRXJCLFlBQVk7Ozs7QUFHakMsSUFBSSxPQUFPLFlBQUEsQ0FBQTtBQUNYLElBQUksVUFBVSxZQUFBLENBQUE7QUFDZCxJQUFJLFVBQVUsWUFBQSxDQUFBO0FBQ2QsSUFBSSxXQUFXLFlBQUEsQ0FBQTtBQUNmLElBQUksYUFBYSxZQUFBLENBQUE7QUFDakIsSUFBSSxjQUFjLFlBQUEsQ0FBQTtBQUNsQixJQUFJLGVBQWUsWUFBQSxDQUFBO0FBQ25CLElBQUksZUFBZSxZQUFBLENBQUE7O0lBRWIsTUFBTTtBQVVDLFdBVlAsTUFBTSxHQVVJOzs7MEJBVlYsTUFBTTs7QUFXUixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDOUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLFFBQVEsR0FBRywyQkFBYyxDQUFBO0FBQzlCLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTs7QUFFckMsUUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsWUFBTTtBQUMvQixZQUFLLG1CQUFtQixFQUFFLENBQUE7QUFDMUIsVUFBTSxZQUFZLEdBQUcsTUFBSyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFBO0FBQ25GLFVBQUksWUFBWSxFQUFFO0FBQ2hCLG9CQUFZLENBQUMsSUFBSSxFQUFFLENBQUE7T0FDcEI7S0FDRixDQUFDLENBQUE7QUFDRixRQUFJLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDLFlBQU07QUFDN0MsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO0FB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QUMsQ0FBQTtLQUM3Qzs7O1NBMU5HLE1BQU07OztBQTZOWixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IENvbW1hbmRzIGZyb20gJy4vY29tbWFuZHMnXG5pbXBvcnQgdHlwZSB7IFVJLCBMaW50ZXIgYXMgTGludGVyUHJvdmlkZXIgfSBmcm9tICcuL3R5cGVzJ1xuXG5sZXQgSGVscGVyc1xubGV0IFRvZ2dsZVZpZXdcbmxldCBVSVJlZ2lzdHJ5XG5sZXQgYXJyYXlVbmlxdWVcbmxldCBJbmRpZVJlZ2lzdHJ5XG5sZXQgTGludGVyUmVnaXN0cnlcbmxldCBFZGl0b3JzUmVnaXN0cnlcbmxldCBNZXNzYWdlUmVnaXN0cnlcblxuY2xhc3MgTGludGVyIHtcbiAgY29tbWFuZHM6IENvbW1hbmRzO1xuICByZWdpc3RyeVVJOiBVSVJlZ2lzdHJ5O1xuICByZWdpc3RyeUluZGllOiBJbmRpZVJlZ2lzdHJ5O1xuICByZWdpc3RyeUVkaXRvcnM6IEVkaXRvcnNSZWdpc3RyeTtcbiAgcmVnaXN0cnlMaW50ZXJzOiBMaW50ZXJSZWdpc3RyeTtcbiAgcmVnaXN0cnlNZXNzYWdlczogTWVzc2FnZVJlZ2lzdHJ5O1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBpZGxlQ2FsbGJhY2tzOiBTZXQ8bnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MgPSBuZXcgU2V0KClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLmNvbW1hbmRzID0gbmV3IENvbW1hbmRzKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuY29tbWFuZHMpXG5cbiAgICB0aGlzLmNvbW1hbmRzLm9uU2hvdWxkTGludCgoKSA9PiB7XG4gICAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9yc0luaXQoKVxuICAgICAgY29uc3QgZWRpdG9yTGludGVyID0gdGhpcy5yZWdpc3RyeUVkaXRvcnMuZ2V0KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmIChlZGl0b3JMaW50ZXIpIHtcbiAgICAgICAgZWRpdG9yTGludGVyLmxpbnQoKVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5jb21tYW5kcy5vblNob3VsZFRvZ2dsZUFjdGl2ZUVkaXRvcigoKSA9PiB7XG4gICAgICBjb25zdCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9yc0luaXQoKVxuICAgICAgY29uc3QgZWRpdG9yID0gdGhpcy5yZWdpc3RyeUVkaXRvcnMuZ2V0KHRleHRFZGl0b3IpXG4gICAgICBpZiAoZWRpdG9yKSB7XG4gICAgICAgIGVkaXRvci5kaXNwb3NlKClcbiAgICAgIH0gZWxzZSBpZiAodGV4dEVkaXRvcikge1xuICAgICAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9ycy5jcmVhdGVGcm9tVGV4dEVkaXRvcih0ZXh0RWRpdG9yKVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5jb21tYW5kcy5vblNob3VsZERlYnVnKGFzeW5jICgpID0+IHtcbiAgICAgIGlmICghSGVscGVycykge1xuICAgICAgICBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJylcbiAgICAgIH1cbiAgICAgIHRoaXMucmVnaXN0cnlVSUluaXQoKVxuICAgICAgdGhpcy5yZWdpc3RyeUluZGllSW5pdCgpXG4gICAgICB0aGlzLnJlZ2lzdHJ5TGludGVyc0luaXQoKVxuICAgICAgdGhpcy5jb21tYW5kcy5zaG93RGVidWcoXG4gICAgICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLmdldFByb3ZpZGVycygpLFxuICAgICAgICB0aGlzLnJlZ2lzdHJ5SW5kaWUuZ2V0UHJvdmlkZXJzKCksXG4gICAgICAgIHRoaXMucmVnaXN0cnlVSS5nZXRQcm92aWRlcnMoKSxcbiAgICAgIClcbiAgICB9KVxuICAgIHRoaXMuY29tbWFuZHMub25TaG91bGRUb2dnbGVMaW50ZXIoKGFjdGlvbikgPT4ge1xuICAgICAgaWYgKCFUb2dnbGVWaWV3KSB7XG4gICAgICAgIFRvZ2dsZVZpZXcgPSByZXF1aXJlKCcuL3RvZ2dsZS12aWV3JylcbiAgICAgIH1cbiAgICAgIGlmICghYXJyYXlVbmlxdWUpIHtcbiAgICAgICAgYXJyYXlVbmlxdWUgPSByZXF1aXJlKCdsb2Rhc2gudW5pcScpXG4gICAgICB9XG4gICAgICB0aGlzLnJlZ2lzdHJ5TGludGVyc0luaXQoKVxuICAgICAgY29uc3QgdG9nZ2xlVmlldyA9IG5ldyBUb2dnbGVWaWV3KGFjdGlvbixcbiAgICAgICAgYXJyYXlVbmlxdWUodGhpcy5yZWdpc3RyeUxpbnRlcnMuZ2V0UHJvdmlkZXJzKCkubWFwKGxpbnRlciA9PiBsaW50ZXIubmFtZSkpKVxuICAgICAgdG9nZ2xlVmlldy5vbkRpZERpc3Bvc2UoKCkgPT4ge1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMucmVtb3ZlKHRvZ2dsZVZpZXcpXG4gICAgICB9KVxuICAgICAgdG9nZ2xlVmlldy5vbkRpZERpc2FibGUoKG5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgbGludGVyID0gdGhpcy5yZWdpc3RyeUxpbnRlcnMuZ2V0UHJvdmlkZXJzKCkuZmluZChlbnRyeSA9PiBlbnRyeS5uYW1lID09PSBuYW1lKVxuICAgICAgICBpZiAobGludGVyKSB7XG4gICAgICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzSW5pdCgpXG4gICAgICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLmRlbGV0ZUJ5TGludGVyKGxpbnRlcilcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHRvZ2dsZVZpZXcuc2hvdygpXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRvZ2dsZVZpZXcpXG4gICAgfSlcblxuICAgIGNvbnN0IHByb2plY3RQYXRoQ2hhbmdlQ2FsbGJhY2tJRCA9IHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrKFxuICAgICAgZnVuY3Rpb24gcHJvamVjdFBhdGhDaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5kZWxldGUocHJvamVjdFBhdGhDaGFuZ2VDYWxsYmFja0lEKVxuICAgICAgICAvLyBOT1RFOiBBdG9tIHRyaWdnZXJzIHRoaXMgb24gYm9vdCBzbyB3YWl0IGEgd2hpbGVcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jb21tYW5kcy5saW50KClcbiAgICAgICAgfSkpXG4gICAgICB9LmJpbmQodGhpcykpXG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmFkZChwcm9qZWN0UGF0aENoYW5nZUNhbGxiYWNrSUQpXG5cbiAgICBjb25zdCByZWdpc3RyeUVkaXRvcnNJbml0Q2FsbGJhY2tJRCA9IHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrKFxuICAgICAgZnVuY3Rpb24gcmVnaXN0cnlFZGl0b3JzSWRsZUluaXQoKSB7XG4gICAgICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5kZWxldGUocmVnaXN0cnlFZGl0b3JzSW5pdENhbGxiYWNrSUQpXG4gICAgICAgIC8vIFRoaXMgd2lsbCBiZSBjYWxsZWQgb24gdGhlIGZseSBpZiBuZWVkZWQsIGJ1dCBuZWVkcyB0byBydW4gb24gaXQnc1xuICAgICAgICAvLyBvd24gYXQgc29tZSBwb2ludCBvciBsaW50aW5nIG9uIG9wZW4gb3Igb24gY2hhbmdlIHdpbGwgbmV2ZXIgdHJpZ2dlclxuICAgICAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9yc0luaXQoKVxuICAgICAgfS5iaW5kKHRoaXMpKVxuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5hZGQocmVnaXN0cnlFZGl0b3JzSW5pdENhbGxiYWNrSUQpXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MuZm9yRWFjaChjYWxsYmFja0lEID0+IHdpbmRvdy5jYW5jZWxJZGxlQ2FsbGJhY2soY2FsbGJhY2tJRCkpXG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmNsZWFyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cblxuICByZWdpc3RyeUVkaXRvcnNJbml0KCkge1xuICAgIGlmICh0aGlzLnJlZ2lzdHJ5RWRpdG9ycykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICghRWRpdG9yc1JlZ2lzdHJ5KSB7XG4gICAgICBFZGl0b3JzUmVnaXN0cnkgPSByZXF1aXJlKCcuL2VkaXRvci1yZWdpc3RyeScpXG4gICAgfVxuICAgIHRoaXMucmVnaXN0cnlFZGl0b3JzID0gbmV3IEVkaXRvcnNSZWdpc3RyeSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnJlZ2lzdHJ5RWRpdG9ycylcbiAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9ycy5vYnNlcnZlKChlZGl0b3JMaW50ZXIpID0+IHtcbiAgICAgIGVkaXRvckxpbnRlci5vblNob3VsZExpbnQoKG9uQ2hhbmdlKSA9PiB7XG4gICAgICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzSW5pdCgpXG4gICAgICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLmxpbnQoeyBvbkNoYW5nZSwgZWRpdG9yOiBlZGl0b3JMaW50ZXIuZ2V0RWRpdG9yKCkgfSlcbiAgICAgIH0pXG4gICAgICBlZGl0b3JMaW50ZXIub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzSW5pdCgpXG4gICAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5kZWxldGVCeUJ1ZmZlcihlZGl0b3JMaW50ZXIuZ2V0RWRpdG9yKCkuZ2V0QnVmZmVyKCkpXG4gICAgICB9KVxuICAgIH0pXG4gICAgdGhpcy5yZWdpc3RyeUVkaXRvcnMuYWN0aXZhdGUoKVxuICB9XG4gIHJlZ2lzdHJ5TGludGVyc0luaXQoKSB7XG4gICAgaWYgKHRoaXMucmVnaXN0cnlMaW50ZXJzKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKCFMaW50ZXJSZWdpc3RyeSkge1xuICAgICAgTGludGVyUmVnaXN0cnkgPSByZXF1aXJlKCcuL2xpbnRlci1yZWdpc3RyeScpXG4gICAgfVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzID0gbmV3IExpbnRlclJlZ2lzdHJ5KClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMucmVnaXN0cnlMaW50ZXJzKVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLm9uRGlkVXBkYXRlTWVzc2FnZXMoKHsgbGludGVyLCBtZXNzYWdlcywgYnVmZmVyIH0pID0+IHtcbiAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlc0luaXQoKVxuICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLnNldCh7IGxpbnRlciwgbWVzc2FnZXMsIGJ1ZmZlciB9KVxuICAgIH0pXG4gICAgdGhpcy5yZWdpc3RyeUxpbnRlcnMub25EaWRCZWdpbkxpbnRpbmcoKHsgbGludGVyLCBmaWxlUGF0aCB9KSA9PiB7XG4gICAgICB0aGlzLnJlZ2lzdHJ5VUlJbml0KClcbiAgICAgIHRoaXMucmVnaXN0cnlVSS5kaWRCZWdpbkxpbnRpbmcobGludGVyLCBmaWxlUGF0aClcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLm9uRGlkRmluaXNoTGludGluZygoeyBsaW50ZXIsIGZpbGVQYXRoIH0pID0+IHtcbiAgICAgIHRoaXMucmVnaXN0cnlVSUluaXQoKVxuICAgICAgdGhpcy5yZWdpc3RyeVVJLmRpZEZpbmlzaExpbnRpbmcobGludGVyLCBmaWxlUGF0aClcbiAgICB9KVxuICB9XG4gIHJlZ2lzdHJ5SW5kaWVJbml0KCkge1xuICAgIGlmICh0aGlzLnJlZ2lzdHJ5SW5kaWUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAoIUluZGllUmVnaXN0cnkpIHtcbiAgICAgIEluZGllUmVnaXN0cnkgPSByZXF1aXJlKCcuL2luZGllLXJlZ2lzdHJ5JylcbiAgICB9XG4gICAgdGhpcy5yZWdpc3RyeUluZGllID0gbmV3IEluZGllUmVnaXN0cnkoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5yZWdpc3RyeUluZGllKVxuICAgIHRoaXMucmVnaXN0cnlJbmRpZS5vYnNlcnZlKChpbmRpZUxpbnRlcikgPT4ge1xuICAgICAgaW5kaWVMaW50ZXIub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzSW5pdCgpXG4gICAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5kZWxldGVCeUxpbnRlcihpbmRpZUxpbnRlcilcbiAgICAgIH0pXG4gICAgfSlcbiAgICB0aGlzLnJlZ2lzdHJ5SW5kaWUub25EaWRVcGRhdGUoKHsgbGludGVyLCBtZXNzYWdlcyB9KSA9PiB7XG4gICAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXNJbml0KClcbiAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5zZXQoeyBsaW50ZXIsIG1lc3NhZ2VzLCBidWZmZXI6IG51bGwgfSlcbiAgICB9KVxuICB9XG4gIHJlZ2lzdHJ5TWVzc2FnZXNJbml0KCkge1xuICAgIGlmICh0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAoIU1lc3NhZ2VSZWdpc3RyeSkge1xuICAgICAgTWVzc2FnZVJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9tZXNzYWdlLXJlZ2lzdHJ5JylcbiAgICB9XG4gICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzID0gbmV3IE1lc3NhZ2VSZWdpc3RyeSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMpXG4gICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLm9uRGlkVXBkYXRlTWVzc2FnZXMoKGRpZmZlcmVuY2UpID0+IHtcbiAgICAgIHRoaXMucmVnaXN0cnlVSUluaXQoKVxuICAgICAgdGhpcy5yZWdpc3RyeVVJLnJlbmRlcihkaWZmZXJlbmNlKVxuICAgIH0pXG4gIH1cbiAgcmVnaXN0cnlVSUluaXQoKSB7XG4gICAgaWYgKHRoaXMucmVnaXN0cnlVSSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICghVUlSZWdpc3RyeSkge1xuICAgICAgVUlSZWdpc3RyeSA9IHJlcXVpcmUoJy4vdWktcmVnaXN0cnknKVxuICAgIH1cbiAgICB0aGlzLnJlZ2lzdHJ5VUkgPSBuZXcgVUlSZWdpc3RyeSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnJlZ2lzdHJ5VUkpXG4gIH1cblxuICAvLyBBUEkgbWV0aG9kcyBmb3IgcHJvdmlkaW5nL2NvbnN1bWluZyBzZXJ2aWNlc1xuICAvLyBVSVxuICBhZGRVSSh1aTogVUkpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5VUlJbml0KClcbiAgICB0aGlzLnJlZ2lzdHJ5VUkuYWRkKHVpKVxuICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlc0luaXQoKVxuICAgIGNvbnN0IG1lc3NhZ2VzID0gdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLm1lc3NhZ2VzXG4gICAgaWYgKG1lc3NhZ2VzLmxlbmd0aCkge1xuICAgICAgdWkucmVuZGVyKHsgYWRkZWQ6IG1lc3NhZ2VzLCBtZXNzYWdlcywgcmVtb3ZlZDogW10gfSlcbiAgICB9XG4gIH1cbiAgZGVsZXRlVUkodWk6IFVJKSB7XG4gICAgdGhpcy5yZWdpc3RyeVVJSW5pdCgpXG4gICAgdGhpcy5yZWdpc3RyeVVJLmRlbGV0ZSh1aSlcbiAgfVxuICAvLyBTdGFuZGFyZCBMaW50ZXJcbiAgYWRkTGludGVyKGxpbnRlcjogTGludGVyUHJvdmlkZXIsIGxlZ2FjeTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgdGhpcy5yZWdpc3RyeUxpbnRlcnNJbml0KClcbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVycy5hZGRMaW50ZXIobGludGVyLCBsZWdhY3kpXG4gIH1cbiAgZGVsZXRlTGludGVyKGxpbnRlcjogTGludGVyUHJvdmlkZXIpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVyc0luaXQoKVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLmRlbGV0ZUxpbnRlcihsaW50ZXIpXG4gICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzSW5pdCgpXG4gICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLmRlbGV0ZUJ5TGludGVyKGxpbnRlcilcbiAgfVxuICAvLyBJbmRpZSBMaW50ZXJcbiAgYWRkSW5kaWUoaW5kaWU6IE9iamVjdCkge1xuICAgIHRoaXMucmVnaXN0cnlJbmRpZUluaXQoKVxuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5SW5kaWUucmVnaXN0ZXIoaW5kaWUsIDIpXG4gIH1cbiAgYWRkTGVnYWN5SW5kaWUoaW5kaWU6IE9iamVjdCkge1xuICAgIHRoaXMucmVnaXN0cnlJbmRpZUluaXQoKVxuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5SW5kaWUucmVnaXN0ZXIoaW5kaWUsIDEpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMaW50ZXJcbiJdfQ==