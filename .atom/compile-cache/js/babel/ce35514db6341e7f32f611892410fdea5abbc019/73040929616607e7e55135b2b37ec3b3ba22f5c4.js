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

      var messages = this.registryMessages.messages;
      if (messages.length) {
        ui.render({ added: messages, messages: messages, removed: [] });
      }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OzBCQUV3QixhQUFhOzs7O29CQUNELE1BQU07OzJCQUVyQixpQkFBaUI7Ozs7d0JBQ2pCLFlBQVk7Ozs7MEJBQ1YsZUFBZTs7OzswQkFDZixlQUFlOzs7OzZCQUNaLGtCQUFrQjs7Ozs4QkFDakIsbUJBQW1COzs7OytCQUNsQixvQkFBb0I7Ozs7OEJBQ3BCLG1CQUFtQjs7Ozt1QkFDdEIsV0FBVzs7SUFBeEIsT0FBTzs7SUFHYixNQUFNO0FBU0MsV0FUUCxNQUFNLEdBU0k7OzswQkFUVixNQUFNOztBQVVSLFFBQUksQ0FBQyxRQUFRLEdBQUcsMkJBQWMsQ0FBQTtBQUM5QixRQUFJLENBQUMsVUFBVSxHQUFHLDZCQUFnQixDQUFBO0FBQ2xDLFFBQUksQ0FBQyxhQUFhLEdBQUcsZ0NBQW1CLENBQUE7QUFDeEMsUUFBSSxDQUFDLGVBQWUsR0FBRyxpQ0FBcUIsQ0FBQTtBQUM1QyxRQUFJLENBQUMsZUFBZSxHQUFHLGlDQUFvQixDQUFBO0FBQzNDLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxrQ0FBcUIsQ0FBQTs7QUFFN0MsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ3JDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUN2QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDMUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUE7QUFDN0MsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFD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QyxVQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7QUFDbkIsVUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtPQUN0RDtLQUNGOzs7V0FDTyxrQkFBQyxFQUFNLEVBQUU7QUFDZixVQUFJLENBQUMsVUFBVSxVQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7S0FDM0I7OztXQUNRLG1CQUFDLE1BQXNCLEVBQTJCO1VBQXpCLE1BQWUseURBQUcsS0FBSzs7QUFDdkQsVUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0tBQy9DOzs7V0FDVyxzQkFBQyxNQUFzQixFQUFFO0FBQ25DLFVBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3pDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDN0M7OztTQXRKRyxNQUFNOzs7QUF5SlosTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IGFycmF5VW5pcXVlIGZyb20gJ2xvZGFzaC51bmlxJ1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbmltcG9ydCBtYW5pZmVzdCBmcm9tICcuLi9wYWNrYWdlLmpzb24nXG5pbXBvcnQgQ29tbWFuZHMgZnJvbSAnLi9jb21tYW5kcydcbmltcG9ydCBVSVJlZ2lzdHJ5IGZyb20gJy4vdWktcmVnaXN0cnknXG5pbXBvcnQgVG9nZ2xlVmlldyBmcm9tICcuL3RvZ2dsZS12aWV3J1xuaW1wb3J0IEluZGllUmVnaXN0cnkgZnJvbSAnLi9pbmRpZS1yZWdpc3RyeSdcbmltcG9ydCBMaW50ZXJSZWdpc3RyeSBmcm9tICcuL2xpbnRlci1yZWdpc3RyeSdcbmltcG9ydCBNZXNzYWdlUmVnaXN0cnkgZnJvbSAnLi9tZXNzYWdlLXJlZ2lzdHJ5J1xuaW1wb3J0IEVkaXRvcnNSZWdpc3RyeSBmcm9tICcuL2VkaXRvci1yZWdpc3RyeSdcbmltcG9ydCAqIGFzIEhlbHBlcnMgZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBVSSwgTGludGVyIGFzIExpbnRlclByb3ZpZGVyIH0gZnJvbSAnLi90eXBlcydcblxuY2xhc3MgTGludGVyIHtcbiAgY29tbWFuZHM6IENvbW1hbmRzO1xuICByZWdpc3RyeVVJOiBVSVJlZ2lzdHJ5O1xuICByZWdpc3RyeUluZGllOiBJbmRpZVJlZ2lzdHJ5O1xuICByZWdpc3RyeUVkaXRvcnM6IEVkaXRvcnNSZWdpc3RyeTtcbiAgcmVnaXN0cnlMaW50ZXJzOiBMaW50ZXJSZWdpc3RyeTtcbiAgcmVnaXN0cnlNZXNzYWdlczogTWVzc2FnZVJlZ2lzdHJ5O1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY29tbWFuZHMgPSBuZXcgQ29tbWFuZHMoKVxuICAgIHRoaXMucmVnaXN0cnlVSSA9IG5ldyBVSVJlZ2lzdHJ5KClcbiAgICB0aGlzLnJlZ2lzdHJ5SW5kaWUgPSBuZXcgSW5kaWVSZWdpc3RyeSgpXG4gICAgdGhpcy5yZWdpc3RyeUVkaXRvcnMgPSBuZXcgRWRpdG9yc1JlZ2lzdHJ5KClcbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVycyA9IG5ldyBMaW50ZXJSZWdpc3RyeSgpXG4gICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzID0gbmV3IE1lc3NhZ2VSZWdpc3RyeSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuY29tbWFuZHMpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnJlZ2lzdHJ5VUkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnJlZ2lzdHJ5SW5kaWUpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnJlZ2lzdHJ5RWRpdG9ycylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMucmVnaXN0cnlMaW50ZXJzKVxuXG4gICAgdGhpcy5jb21tYW5kcy5vblNob3VsZExpbnQoKCkgPT4ge1xuICAgICAgY29uc3QgZWRpdG9yTGludGVyID0gdGhpcy5yZWdpc3RyeUVkaXRvcnMuZ2V0KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmIChlZGl0b3JMaW50ZXIpIHtcbiAgICAgICAgZWRpdG9yTGludGVyLmxpbnQoKVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5jb21tYW5kcy5vblNob3VsZFRvZ2dsZUFjdGl2ZUVkaXRvcigoKSA9PiB7XG4gICAgICBjb25zdCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBjb25zdCBlZGl0b3IgPSB0aGlzLnJlZ2lzdHJ5RWRpdG9ycy5nZXQodGV4dEVkaXRvcilcbiAgICAgIGlmIChlZGl0b3IpIHtcbiAgICAgICAgZWRpdG9yLmRpc3Bvc2UoKVxuICAgICAgfSBlbHNlIGlmICh0ZXh0RWRpdG9yKSB7XG4gICAgICAgIHRoaXMucmVnaXN0cnlFZGl0b3JzLmNyZWF0ZUZyb21UZXh0RWRpdG9yKHRleHRFZGl0b3IpXG4gICAgICB9XG4gICAgfSlcbiAgICAvLyBOT1RFOiBFU0xpbnQgYXJyb3ctcGFyZW5zIHJ1bGUgaGFzIGEgYnVnXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGFycm93LXBhcmVuc1xuICAgIHRoaXMuY29tbWFuZHMub25TaG91bGREZWJ1Zyhhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBsaW50ZXJzID0gdGhpcy5yZWdpc3RyeUxpbnRlcnMuZ2V0TGludGVycygpXG4gICAgICBjb25zdCBjb25maWdGaWxlID0gYXdhaXQgSGVscGVycy5nZXRDb25maWdGaWxlKClcbiAgICAgIGNvbnN0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGNvbnN0IHRleHRFZGl0b3JTY29wZXMgPSBIZWxwZXJzLmdldEVkaXRvckN1cnNvclNjb3Blcyh0ZXh0RWRpdG9yKVxuXG4gICAgICBjb25zdCBhbGxMaW50ZXJzID0gbGludGVyc1xuICAgICAgICAuc29ydCgoYSwgYikgPT4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKSlcbiAgICAgICAgLm1hcChsaW50ZXIgPT4gYCAgLSAke2xpbnRlci5uYW1lfWApLmpvaW4oJ1xcbicpXG4gICAgICBjb25zdCBtYXRjaGluZ0xpbnRlcnMgPSBsaW50ZXJzXG4gICAgICAgIC5maWx0ZXIobGludGVyID0+IEhlbHBlcnMuc2hvdWxkVHJpZ2dlckxpbnRlcihsaW50ZXIsIGZhbHNlLCB0ZXh0RWRpdG9yU2NvcGVzKSlcbiAgICAgICAgLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpXG4gICAgICAgIC5tYXAobGludGVyID0+IGAgIC0gJHtsaW50ZXIubmFtZX1gKS5qb2luKCdcXG4nKVxuICAgICAgY29uc3QgaHVtYW5pemVkU2NvcGVzID0gdGV4dEVkaXRvclNjb3Blc1xuICAgICAgICAubWFwKHNjb3BlID0+IGAgIC0gJHtzY29wZX1gKS5qb2luKCdcXG4nKVxuICAgICAgY29uc3QgZGlzYWJsZWRMaW50ZXJzID0gKGF3YWl0IGNvbmZpZ0ZpbGUuZ2V0KCdkaXNhYmxlZCcpKVxuICAgICAgICAubWFwKGxpbnRlciA9PiBgICAtICR7bGludGVyfWApLmpvaW4oJ1xcbicpXG5cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdMaW50ZXIgRGVidWcgSW5mbycsIHtcbiAgICAgICAgZGV0YWlsOiBbXG4gICAgICAgICAgYFBsYXRmb3JtOiAke3Byb2Nlc3MucGxhdGZvcm19YCxcbiAgICAgICAgICBgQXRvbSBWZXJzaW9uOiAke2F0b20uZ2V0VmVyc2lvbigpfWAsXG4gICAgICAgICAgYExpbnRlciBWZXJzaW9uOiAke21hbmlmZXN0LnZlcnNpb259YCxcbiAgICAgICAgICBgQWxsIExpbnRlciBQcm92aWRlcnM6IFxcbiR7YWxsTGludGVyc31gLFxuICAgICAgICAgIGBNYXRjaGluZyBMaW50ZXIgUHJvdmlkZXJzOiBcXG4ke21hdGNoaW5nTGludGVyc31gLFxuICAgICAgICAgIGBEaXNhYmxlZCBMaW50ZXIgUHJvdmlkZXJzOyBcXG4ke2Rpc2FibGVkTGludGVyc31gLFxuICAgICAgICAgIGBDdXJyZW50IEZpbGUgc2NvcGVzOiBcXG4ke2h1bWFuaXplZFNjb3Blc31gLFxuICAgICAgICBdLmpvaW4oJ1xcbicpLFxuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgIH0pXG4gICAgfSlcbiAgICB0aGlzLmNvbW1hbmRzLm9uU2hvdWxkVG9nZ2xlTGludGVyKChhY3Rpb24pID0+IHtcbiAgICAgIGNvbnN0IHRvZ2dsZVZpZXcgPSBuZXcgVG9nZ2xlVmlldyhhY3Rpb24sIGFycmF5VW5pcXVlKHRoaXMucmVnaXN0cnlMaW50ZXJzLmdldExpbnRlcnMoKS5tYXAobGludGVyID0+IGxpbnRlci5uYW1lKSkpXG4gICAgICB0b2dnbGVWaWV3Lm9uRGlkRGlzcG9zZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5yZW1vdmUodG9nZ2xlVmlldylcbiAgICAgIH0pXG4gICAgICB0b2dnbGVWaWV3Lm9uRGlkRGlzYWJsZSgobmFtZSkgPT4ge1xuICAgICAgICBjb25zdCBsaW50ZXIgPSB0aGlzLnJlZ2lzdHJ5TGludGVycy5nZXRMaW50ZXJzKCkuZmluZChlbnRyeSA9PiBlbnRyeS5uYW1lID09PSBuYW1lKVxuICAgICAgICBpZiAobGludGVyKSB7XG4gICAgICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLmRlbGV0ZUJ5TGludGVyKGxpbnRlcilcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHRvZ2dsZVZpZXcuc2hvdygpXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRvZ2dsZVZpZXcpXG4gICAgfSlcbiAgICB0aGlzLnJlZ2lzdHJ5SW5kaWUub2JzZXJ2ZSgoaW5kaWVMaW50ZXIpID0+IHtcbiAgICAgIGluZGllTGludGVyLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5kZWxldGVCeUxpbnRlcihpbmRpZUxpbnRlcilcbiAgICAgIH0pXG4gICAgfSlcbiAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9ycy5vYnNlcnZlKChlZGl0b3JMaW50ZXIpID0+IHtcbiAgICAgIGVkaXRvckxpbnRlci5vblNob3VsZExpbnQoKG9uQ2hhbmdlKSA9PiB7XG4gICAgICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLmxpbnQoeyBvbkNoYW5nZSwgZWRpdG9yOiBlZGl0b3JMaW50ZXIuZ2V0RWRpdG9yKCkgfSlcbiAgICAgIH0pXG4gICAgICBlZGl0b3JMaW50ZXIub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLmRlbGV0ZUJ5QnVmZmVyKGVkaXRvckxpbnRlci5nZXRFZGl0b3IoKS5nZXRCdWZmZXIoKSlcbiAgICAgIH0pXG4gICAgfSlcbiAgICB0aGlzLnJlZ2lzdHJ5SW5kaWUub25EaWRVcGRhdGUoKHsgbGludGVyLCBtZXNzYWdlcyB9KSA9PiB7XG4gICAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMuc2V0KHsgbGludGVyLCBtZXNzYWdlcywgYnVmZmVyOiBudWxsIH0pXG4gICAgfSlcbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVycy5vbkRpZFVwZGF0ZU1lc3NhZ2VzKCh7IGxpbnRlciwgbWVzc2FnZXMsIGJ1ZmZlciB9KSA9PiB7XG4gICAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMuc2V0KHsgbGludGVyLCBtZXNzYWdlcywgYnVmZmVyIH0pXG4gICAgfSlcbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVycy5vbkRpZEJlZ2luTGludGluZygoeyBsaW50ZXIsIGZpbGVQYXRoIH0pID0+IHtcbiAgICAgIHRoaXMucmVnaXN0cnlVSS5kaWRCZWdpbkxpbnRpbmcobGludGVyLCBmaWxlUGF0aClcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLm9uRGlkRmluaXNoTGludGluZygoeyBsaW50ZXIsIGZpbGVQYXRoIH0pID0+IHtcbiAgICAgIHRoaXMucmVnaXN0cnlVSS5kaWRGaW5pc2hMaW50aW5nKGxpbnRlciwgZmlsZVBhdGgpXG4gICAgfSlcbiAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMub25EaWRVcGRhdGVNZXNzYWdlcygoZGlmZmVyZW5jZSkgPT4ge1xuICAgICAgdGhpcy5yZWdpc3RyeVVJLnJlbmRlcihkaWZmZXJlbmNlKVxuICAgIH0pXG5cbiAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9ycy5hY3RpdmF0ZSgpXG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIC8vIE5PVEU6IEF0b20gdHJpZ2dlcnMgdGhpcyBvbiBib290IHNvIHdhaXQgYSB3aGlsZVxuICAgICAgaWYgKCF0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZWQpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jb21tYW5kcy5saW50KClcbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfSwgMTAwKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG5cbiAgLy8gQVBJIG1ldGhvZHMgZm9yIHByb3ZpZGluZy9jb25zdW1pbmcgc2VydmljZXNcbiAgYWRkVUkodWk6IFVJKSB7XG4gICAgdGhpcy5yZWdpc3RyeVVJLmFkZCh1aSlcblxuICAgIGNvbnN0IG1lc3NhZ2VzID0gdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLm1lc3NhZ2VzXG4gICAgaWYgKG1lc3NhZ2VzLmxlbmd0aCkge1xuICAgICAgdWkucmVuZGVyKHsgYWRkZWQ6IG1lc3NhZ2VzLCBtZXNzYWdlcywgcmVtb3ZlZDogW10gfSlcbiAgICB9XG4gIH1cbiAgZGVsZXRlVUkodWk6IFVJKSB7XG4gICAgdGhpcy5yZWdpc3RyeVVJLmRlbGV0ZSh1aSlcbiAgfVxuICBhZGRMaW50ZXIobGludGVyOiBMaW50ZXJQcm92aWRlciwgbGVnYWN5OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVycy5hZGRMaW50ZXIobGludGVyLCBsZWdhY3kpXG4gIH1cbiAgZGVsZXRlTGludGVyKGxpbnRlcjogTGludGVyUHJvdmlkZXIpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVycy5kZWxldGVMaW50ZXIobGludGVyKVxuICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5kZWxldGVCeUxpbnRlcihsaW50ZXIpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMaW50ZXJcbiJdfQ==