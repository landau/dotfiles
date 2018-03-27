function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _jasmineFix = require('jasmine-fix');

var _libHelpers = require('../lib/helpers');

var Helpers = _interopRequireWildcard(_libHelpers);

var _libLinterRegistry = require('../lib/linter-registry');

var _libLinterRegistry2 = _interopRequireDefault(_libLinterRegistry);

var _common = require('./common');

describe('LinterRegistry', function () {
  var linterRegistry = undefined;

  (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
    atom.packages.loadPackage('linter');
    atom.packages.loadPackage('language-javascript');
    linterRegistry = new _libLinterRegistry2['default']();
    yield atom.packages.activatePackage('language-javascript');
    yield atom.workspace.open(__filename);
  }));
  afterEach(function () {
    linterRegistry.dispose();
    atom.workspace.destroyActivePane();
  });

  describe('life cycle', function () {
    (0, _jasmineFix.it)('works', function () {
      var linter = (0, _common.getLinter)();
      expect(linterRegistry.hasLinter(linter)).toBe(false);
      linterRegistry.addLinter(linter);
      expect(linterRegistry.hasLinter(linter)).toBe(true);
      linterRegistry.deleteLinter(linter);
      expect(linterRegistry.hasLinter(linter)).toBe(false);
    });
    (0, _jasmineFix.it)('sets props on add', function () {
      var linter = (0, _common.getLinter)();
      expect(typeof linter[Helpers.$version]).toBe('undefined');
      expect(typeof linter[Helpers.$requestLatest]).toBe('undefined');
      expect(typeof linter[Helpers.$requestLastReceived]).toBe('undefined');
      linterRegistry.addLinter(linter);
      expect(typeof linter[Helpers.$version]).toBe('number');
      expect(typeof linter[Helpers.$requestLatest]).toBe('number');
      expect(typeof linter[Helpers.$requestLastReceived]).toBe('number');
      expect(linter[Helpers.$version]).toBe(2);
      expect(linter[Helpers.$requestLatest]).toBe(0);
      expect(linter[Helpers.$requestLastReceived]).toBe(0);
    });
    (0, _jasmineFix.it)('sets version based on legacy param', function () {
      {
        // scenario: 2
        var linter = (0, _common.getLinter)();
        linterRegistry.addLinter(linter);
        expect(linter[Helpers.$version]).toBe(2);
      }
      {
        // scenario: 1
        var linter = (0, _common.getLinter)();
        linter.lintOnFly = linter.lintsOnChange;
        linterRegistry.addLinter(linter, true);
        expect(linter[Helpers.$version]).toBe(1);
      }
    });
    (0, _jasmineFix.it)('deactivates the attributes on delete', function () {
      var linter = (0, _common.getLinter)();
      linterRegistry.addLinter(linter);
      expect(linter[Helpers.$activated]).toBe(true);
      linterRegistry.deleteLinter(linter);
      expect(linter[Helpers.$activated]).toBe(false);
    });
  });
  describe('::lint', function () {
    (0, _jasmineFix.it)('does not lint if editor is not saved on disk', _asyncToGenerator(function* () {
      try {
        yield atom.workspace.open();
        var editor = atom.workspace.getActiveTextEditor();
        expect((yield linterRegistry.lint({ editor: editor, onChange: false }))).toBe(false);
      } finally {
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('does not lint if editor is ignored by VCS', _asyncToGenerator(function* () {
      try {
        yield atom.workspace.open((0, _common.getFixturesPath)('ignored.txt'));
        var editor = atom.workspace.getActiveTextEditor();
        expect((yield linterRegistry.lint({ editor: editor, onChange: false }))).toBe(false);
      } finally {
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('does not lint onChange if onChange is disabled by config', _asyncToGenerator(function* () {
      try {
        atom.config.set('linter.lintOnChange', false);
        yield atom.workspace.open((0, _common.getFixturesPath)('file.txt'));
        var editor = atom.workspace.getActiveTextEditor();
        expect((yield linterRegistry.lint({ editor: editor, onChange: true }))).toBe(false);
      } finally {
        atom.config.set('linter.lintOnChange', true);
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('lints onChange if allowed by config', _asyncToGenerator(function* () {
      try {
        yield atom.workspace.open((0, _common.getFixturesPath)('file.txt'));
        var editor = atom.workspace.getActiveTextEditor();
        expect((yield linterRegistry.lint({ editor: editor, onChange: true }))).toBe(true);
      } finally {
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('does not lint preview tabs if disallowed by config', _asyncToGenerator(function* () {
      try {
        yield* (function* () {
          atom.config.set('linter.lintPreviewTabs', false);
          yield atom.workspace.open((0, _common.getFixturesPath)('file.txt'));
          var editor = atom.workspace.getActiveTextEditor();
          var activePane = atom.workspace.getActivePane();
          spyOn(activePane, 'getPendingItem').andCallFake(function () {
            return editor;
          });
          expect((yield linterRegistry.lint({ editor: editor, onChange: false }))).toBe(false);
        })();
      } finally {
        atom.config.set('linter.lintPreviewTabs', true);
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('does lint preview tabs if allowed by config', _asyncToGenerator(function* () {
      try {
        yield atom.workspace.open((0, _common.getFixturesPath)('file.txt'));
        var editor = atom.workspace.getActiveTextEditor();
        editor.hasTerminatedPendingState = false;
        expect((yield linterRegistry.lint({ editor: editor, onChange: false }))).toBe(true);
      } finally {
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('lints the editor even if its not the active one', _asyncToGenerator(function* () {
      try {
        yield atom.workspace.open((0, _common.getFixturesPath)('file.txt'));
        var editor = atom.workspace.getActiveTextEditor();
        yield atom.workspace.open(__filename);
        expect((yield linterRegistry.lint({ editor: editor, onChange: false }))).toBe(true);
      } finally {
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('triggers providers if scopes match', _asyncToGenerator(function* () {
      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      spyOn(Helpers, 'shouldTriggerLinter').andCallThrough();
      spyOn(linter, 'lint').andCallThrough();
      expect((yield linterRegistry.lint({ editor: editor, onChange: false }))).toBe(true);
      expect(Helpers.shouldTriggerLinter).toHaveBeenCalled();
      // $FlowIgnore: It's a magic property, duh
      expect(Helpers.shouldTriggerLinter.calls.length).toBe(1);
      expect(linter.lint).toHaveBeenCalled();
      expect(linter.lint.calls.length).toBe(1);
    }));
    (0, _jasmineFix.it)('does not match if scopes dont match', _asyncToGenerator(function* () {
      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linter.grammarScopes = ['source.coffee'];
      linterRegistry.addLinter(linter);
      spyOn(Helpers, 'shouldTriggerLinter').andCallThrough();
      spyOn(linter, 'lint').andCallThrough();
      expect((yield linterRegistry.lint({ editor: editor, onChange: false }))).toBe(true);
      expect(Helpers.shouldTriggerLinter).toHaveBeenCalled();
      // $FlowIgnore: It's a magic property, duh
      expect(Helpers.shouldTriggerLinter.calls.length).toBe(1);
      expect(linter.lint).not.toHaveBeenCalled();
      expect(linter.lint.calls.length).toBe(0);
    }));
    (0, _jasmineFix.it)('emits events properly', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesFinished).toBe(0);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        expect(timesUpdated).toBe(0);
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)('does not update if the buffer it was associated to was destroyed', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesFinished).toBe(0);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        expect(timesUpdated).toBe(0);
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linter.scope = 'file';
      linterRegistry.addLinter(linter);
      editor.destroy();
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(0);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)('does update if buffer was destroyed if its project scoped', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesFinished).toBe(0);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        expect(timesUpdated).toBe(0);
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      editor.destroy();
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)('does not update if null is returned', _asyncToGenerator(function* () {
      var promise = undefined;
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesBegan - 1).toBe(timesFinished);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        expect(timesFinished - 1).toBe(timesUpdated);
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      linter.lint = _asyncToGenerator(function* () {
        yield (0, _jasmineFix.wait)(50);
        if (timesBegan === 2) {
          return null;
        }
        return [];
      });

      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(2);
    }));
    (0, _jasmineFix.it)('shows error notification if response is not array and is non-null', _asyncToGenerator(function* () {
      var promise = undefined;
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesBegan - 1).toBe(timesFinished);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        // NOTE: Not adding a timesUpdated assertion here on purpose
        // Because we're testing invalid return values and they don't
        // update linter result
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      linter.lint = _asyncToGenerator(function* () {
        yield (0, _jasmineFix.wait)(50);
        if (timesBegan === 2) {
          return false;
        } else if (timesBegan === 3) {
          return null;
        } else if (timesBegan === 4) {
          return undefined;
        }
        return [];
      });

      // with array
      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
      expect(atom.notifications.getNotifications().length).toBe(0);

      // with false
      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(2);
      expect(atom.notifications.getNotifications().length).toBe(1);

      // with null
      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(3);
      expect(atom.notifications.getNotifications().length).toBe(1);

      // with undefined
      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(4);
      expect(atom.notifications.getNotifications().length).toBe(2);
    }));
    (0, _jasmineFix.it)('triggers the finish event even when the provider crashes', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesFinished).toBe(0);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        expect(timesUpdated).toBe(0);
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      linter.lint = _asyncToGenerator(function* () {
        yield (0, _jasmineFix.wait)(50);throw new Error('Boom');
      });
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(0);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)('gives buffer for file scoped linters on update event', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesFinished).toBe(0);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        expect(timesBegan).toBe(1);
      });
      linterRegistry.onDidUpdateMessages(function (_ref) {
        var buffer = _ref.buffer;

        timesUpdated++;
        expect(buffer.constructor.name).toBe('TextBuffer');
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linter.scope = 'file';
      linterRegistry.addLinter(linter);
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)('does not give a buffer for project scoped linters on update event', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesFinished).toBe(0);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        expect(timesBegan).toBe(1);
      });
      linterRegistry.onDidUpdateMessages(function (_ref2) {
        var buffer = _ref2.buffer;

        timesUpdated++;
        expect(buffer).toBe(null);
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)('gives a filepath for file scoped linters on start and finish events', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function (_ref3) {
        var filePath = _ref3.filePath;

        timesBegan++;
        expect(timesFinished).toBe(0);
        expect(filePath).toBe(__filename);
      });
      linterRegistry.onDidFinishLinting(function (_ref4) {
        var filePath = _ref4.filePath;

        timesFinished++;
        expect(timesBegan).toBe(1);
        expect(filePath).toBe(__filename);
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linter.scope = 'file';
      linterRegistry.addLinter(linter);
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)('does not give a file path for project scoped linters on start and finish events', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function (_ref5) {
        var filePath = _ref5.filePath;

        timesBegan++;
        expect(timesFinished).toBe(0);
        expect(filePath).toBe(null);
      });
      linterRegistry.onDidFinishLinting(function (_ref6) {
        var filePath = _ref6.filePath;

        timesFinished++;
        expect(timesBegan).toBe(1);
        expect(filePath).toBe(null);
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)("does not invoke a linter if it's ignored", _asyncToGenerator(function* () {
      var promise = undefined;
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        return timesBegan++;
      });
      linterRegistry.onDidFinishLinting(function () {
        return timesFinished++;
      });
      linterRegistry.onDidUpdateMessages(function () {
        return timesUpdated++;
      });

      var linter = (0, _common.getLinter)();
      atom.config.set('linter.disabledProviders', []);
      var editor = atom.workspace.getActiveTextEditor();
      linter.name = 'Some Linter';
      linterRegistry.addLinter(linter);

      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);

      atom.config.set('linter.disabledProviders', [linter.name]);
      yield (0, _jasmineFix.wait)(100);

      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);

      atom.config.set('linter.disabledProviders', []);
      yield (0, _jasmineFix.wait)(100);

      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(2);
      expect(timesUpdated).toBe(2);
      expect(timesFinished).toBe(2);
    }));
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9zcGVjL2xpbnRlci1yZWdpc3RyeS1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OzswQkFFcUMsYUFBYTs7MEJBQ3pCLGdCQUFnQjs7SUFBN0IsT0FBTzs7aUNBQ1Esd0JBQXdCOzs7O3NCQUNSLFVBQVU7O0FBRXJELFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFXO0FBQ3BDLE1BQUksY0FBYyxZQUFBLENBQUE7O0FBRWxCLGdEQUFXLGFBQWlCO0FBQzFCLFFBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ25DLFFBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLENBQUE7QUFDaEQsa0JBQWMsR0FBRyxvQ0FBb0IsQ0FBQTtBQUNyQyxVQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLHFCQUFxQixDQUFDLENBQUE7QUFDMUQsVUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtHQUN0QyxFQUFDLENBQUE7QUFDRixXQUFTLENBQUMsWUFBVztBQUNuQixrQkFBYyxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3hCLFFBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtHQUNuQyxDQUFDLENBQUE7O0FBRUYsVUFBUSxDQUFDLFlBQVksRUFBRSxZQUFXO0FBQ2hDLHdCQUFHLE9BQU8sRUFBRSxZQUFXO0FBQ3JCLFVBQU0sTUFBTSxHQUFHLHdCQUFXLENBQUE7QUFDMUIsWUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDcEQsb0JBQWMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDaEMsWUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFD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QUFDLENBQUE7QUFDMUQsWUFBTSxzQkFBSyxHQUFHLENBQUMsQ0FBQTs7QUFFZixhQUFPLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7QUFDMUQsWUFBTSxFQUFDLE1BQU0sT0FBTyxDQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDaEMsWUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUMxQixZQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzVCLFlBQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRTdCLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQy9DLFlBQU0sc0JBQUssR0FBRyxDQUFDLENBQUE7O0FBRWYsYUFBTyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO0FBQzFELFlBQU0sRUFBQyxNQUFNLE9BQU8sQ0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2hDLFlBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDMUIsWUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM1QixZQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQzlCLEVBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy9saW50ZXItcmVnaXN0cnktc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IGl0LCB3YWl0LCBiZWZvcmVFYWNoIH0gZnJvbSAnamFzbWluZS1maXgnXG5pbXBvcnQgKiBhcyBIZWxwZXJzIGZyb20gJy4uL2xpYi9oZWxwZXJzJ1xuaW1wb3J0IExpbnRlclJlZ2lzdHJ5IGZyb20gJy4uL2xpYi9saW50ZXItcmVnaXN0cnknXG5pbXBvcnQgeyBnZXRMaW50ZXIsIGdldEZpeHR1cmVzUGF0aCB9IGZyb20gJy4vY29tbW9uJ1xuXG5kZXNjcmliZSgnTGludGVyUmVnaXN0cnknLCBmdW5jdGlvbigpIHtcbiAgbGV0IGxpbnRlclJlZ2lzdHJ5XG5cbiAgYmVmb3JlRWFjaChhc3luYyBmdW5jdGlvbigpIHtcbiAgICBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKCdsaW50ZXInKVxuICAgIGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKVxuICAgIGxpbnRlclJlZ2lzdHJ5ID0gbmV3IExpbnRlclJlZ2lzdHJ5KClcbiAgICBhd2FpdCBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtamF2YXNjcmlwdCcpXG4gICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihfX2ZpbGVuYW1lKVxuICB9KVxuICBhZnRlckVhY2goZnVuY3Rpb24oKSB7XG4gICAgbGludGVyUmVnaXN0cnkuZGlzcG9zZSgpXG4gICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmUoKVxuICB9KVxuXG4gIGRlc2NyaWJlKCdsaWZlIGN5Y2xlJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ3dvcmtzJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBsaW50ZXIgPSBnZXRMaW50ZXIoKVxuICAgICAgZXhwZWN0KGxpbnRlclJlZ2lzdHJ5Lmhhc0xpbnRlcihsaW50ZXIpKS50b0JlKGZhbHNlKVxuICAgICAgbGludGVyUmVnaXN0cnkuYWRkTGludGVyKGxpbnRlcilcbiAgICAgIGV4cGVjdChsaW50ZXJSZWdpc3RyeS5oYXNMaW50ZXIobGludGVyKSkudG9CZSh0cnVlKVxuICAgICAgbGludGVyUmVnaXN0cnkuZGVsZXRlTGludGVyKGxpbnRlcilcbiAgICAgIGV4cGVjdChsaW50ZXJSZWdpc3RyeS5oYXNMaW50ZXIobGludGVyKSkudG9CZShmYWxzZSlcbiAgICB9KVxuICAgIGl0KCdzZXRzIHByb3BzIG9uIGFkZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbGludGVyID0gZ2V0TGludGVyKClcbiAgICAgIGV4cGVjdCh0eXBlb2YgbGludGVyW0hlbHBlcnMuJHZlcnNpb25dKS50b0JlKCd1bmRlZmluZWQnKVxuICAgICAgZXhwZWN0KHR5cGVvZiBsaW50ZXJbSGVscGVycy4kcmVxdWVzdExhdGVzdF0pLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICBleHBlY3QodHlwZW9mIGxpbnRlcltIZWxwZXJzLiRyZXF1ZXN0TGFzdFJlY2VpdmVkXSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgIGxpbnRlclJlZ2lzdHJ5LmFkZExpbnRlcihsaW50ZXIpXG4gICAgICBleHBlY3QodHlwZW9mIGxpbnRlcltIZWxwZXJzLiR2ZXJzaW9uXSkudG9CZSgnbnVtYmVyJylcbiAgICAgIGV4cGVjdCh0eXBlb2YgbGludGVyW0hlbHBlcnMuJHJlcXVlc3RMYXRlc3RdKS50b0JlKCdudW1iZXInKVxuICAgICAgZXhwZWN0KHR5cGVvZiBsaW50ZXJbSGVscGVycy4kcmVxdWVzdExhc3RSZWNlaXZlZF0pLnRvQmUoJ251bWJlcicpXG4gICAgICBleHBlY3QobGludGVyW0hlbHBlcnMuJHZlcnNpb25dKS50b0JlKDIpXG4gICAgICBleHBlY3QobGludGVyW0hlbHBlcnMuJHJlcXVlc3RMYXRlc3RdKS50b0JlKDApXG4gICAgICBleHBlY3QobGludGVyW0hlbHBlcnMuJHJlcXVlc3RMYXN0UmVjZWl2ZWRdKS50b0JlKDApXG4gICAgfSlcbiAgICBpdCgnc2V0cyB2ZXJzaW9uIGJhc2VkIG9uIGxlZ2FjeSBwYXJhbScsIGZ1bmN0aW9uKCkge1xuICAgICAge1xuICAgICAgICAvLyBzY2VuYXJpbzogMlxuICAgICAgICBjb25zdCBsaW50ZXIgPSBnZXRMaW50ZXIoKVxuICAgICAgICBsaW50ZXJSZWdpc3RyeS5hZGRMaW50ZXIobGludGVyKVxuICAgICAgICBleHBlY3QobGludGVyW0hlbHBlcnMuJHZlcnNpb25dKS50b0JlKDIpXG4gICAgICB9XG4gICAgICB7XG4gICAgICAgIC8vIHNjZW5hcmlvOiAxXG4gICAgICAgIGNvbnN0IGxpbnRlciA9IGdldExpbnRlcigpXG4gICAgICAgIGxpbnRlci5saW50T25GbHkgPSBsaW50ZXIubGludHNPbkNoYW5nZVxuICAgICAgICBsaW50ZXJSZWdpc3RyeS5hZGRMaW50ZXIobGludGVyLCB0cnVlKVxuICAgICAgICBleHBlY3QobGludGVyW0hlbHBlcnMuJHZlcnNpb25dKS50b0JlKDEpXG4gICAgICB9XG4gICAgfSlcbiAgICBpdCgnZGVhY3RpdmF0ZXMgdGhlIGF0dHJpYnV0ZXMgb24gZGVsZXRlJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBsaW50ZXIgPSBnZXRMaW50ZXIoKVxuICAgICAgbGludGVyUmVnaXN0cnkuYWRkTGludGVyKGxpbnRlcilcbiAgICAgIGV4cGVjdChsaW50ZXJbSGVscGVycy4kYWN0aXZhdGVkXSkudG9CZSh0cnVlKVxuICAgICAgbGludGVyUmVnaXN0cnkuZGVsZXRlTGludGVyKGxpbnRlcilcbiAgICAgIGV4cGVjdChsaW50ZXJbSGVscGVycy4kYWN0aXZhdGVkXSkudG9CZShmYWxzZSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnOjpsaW50JywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ2RvZXMgbm90IGxpbnQgaWYgZWRpdG9yIGlzIG5vdCBzYXZlZCBvbiBkaXNrJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIGV4cGVjdChhd2FpdCBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSkpLnRvQmUoZmFsc2UpXG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5kZXN0cm95QWN0aXZlUGFuZSgpXG4gICAgICB9XG4gICAgfSlcbiAgICBpdCgnZG9lcyBub3QgbGludCBpZiBlZGl0b3IgaXMgaWdub3JlZCBieSBWQ1MnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oZ2V0Rml4dHVyZXNQYXRoKCdpZ25vcmVkLnR4dCcpKVxuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgZXhwZWN0KGF3YWl0IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KSkudG9CZShmYWxzZSlcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lKClcbiAgICAgIH1cbiAgICB9KVxuICAgIGl0KCdkb2VzIG5vdCBsaW50IG9uQ2hhbmdlIGlmIG9uQ2hhbmdlIGlzIGRpc2FibGVkIGJ5IGNvbmZpZycsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXIubGludE9uQ2hhbmdlJywgZmFsc2UpXG4gICAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oZ2V0Rml4dHVyZXNQYXRoKCdmaWxlLnR4dCcpKVxuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgZXhwZWN0KGF3YWl0IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiB0cnVlIH0pKS50b0JlKGZhbHNlKVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXIubGludE9uQ2hhbmdlJywgdHJ1ZSlcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmUoKVxuICAgICAgfVxuICAgIH0pXG4gICAgaXQoJ2xpbnRzIG9uQ2hhbmdlIGlmIGFsbG93ZWQgYnkgY29uZmlnJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGdldEZpeHR1cmVzUGF0aCgnZmlsZS50eHQnKSlcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIGV4cGVjdChhd2FpdCBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogdHJ1ZSB9KSkudG9CZSh0cnVlKVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmUoKVxuICAgICAgfVxuICAgIH0pXG4gICAgaXQoJ2RvZXMgbm90IGxpbnQgcHJldmlldyB0YWJzIGlmIGRpc2FsbG93ZWQgYnkgY29uZmlnJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci5saW50UHJldmlld1RhYnMnLCBmYWxzZSlcbiAgICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihnZXRGaXh0dXJlc1BhdGgoJ2ZpbGUudHh0JykpXG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBjb25zdCBhY3RpdmVQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHNweU9uKGFjdGl2ZVBhbmUsICdnZXRQZW5kaW5nSXRlbScpLmFuZENhbGxGYWtlKCgpID0+IGVkaXRvcilcbiAgICAgICAgZXhwZWN0KGF3YWl0IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KSkudG9CZShmYWxzZSlcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLmxpbnRQcmV2aWV3VGFicycsIHRydWUpXG4gICAgICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lKClcbiAgICAgIH1cbiAgICB9KVxuICAgIGl0KCdkb2VzIGxpbnQgcHJldmlldyB0YWJzIGlmIGFsbG93ZWQgYnkgY29uZmlnJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGdldEZpeHR1cmVzUGF0aCgnZmlsZS50eHQnKSlcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIGVkaXRvci5oYXNUZXJtaW5hdGVkUGVuZGluZ1N0YXRlID0gZmFsc2VcbiAgICAgICAgZXhwZWN0KGF3YWl0IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KSkudG9CZSh0cnVlKVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmUoKVxuICAgICAgfVxuICAgIH0pXG4gICAgaXQoJ2xpbnRzIHRoZSBlZGl0b3IgZXZlbiBpZiBpdHMgbm90IHRoZSBhY3RpdmUgb25lJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGdldEZpeHR1cmVzUGF0aCgnZmlsZS50eHQnKSlcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oX19maWxlbmFtZSlcbiAgICAgICAgZXhwZWN0KGF3YWl0IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KSkudG9CZSh0cnVlKVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmUoKVxuICAgICAgfVxuICAgIH0pXG4gICAgaXQoJ3RyaWdnZXJzIHByb3ZpZGVycyBpZiBzY29wZXMgbWF0Y2gnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGxpbnRlciA9IGdldExpbnRlcigpXG4gICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGxpbnRlclJlZ2lzdHJ5LmFkZExpbnRlcihsaW50ZXIpXG4gICAgICBzcHlPbihIZWxwZXJzLCAnc2hvdWxkVHJpZ2dlckxpbnRlcicpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHNweU9uKGxpbnRlciwgJ2xpbnQnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBleHBlY3QoYXdhaXQgbGludGVyUmVnaXN0cnkubGludCh7IGVkaXRvciwgb25DaGFuZ2U6IGZhbHNlIH0pKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoSGVscGVycy5zaG91bGRUcmlnZ2VyTGludGVyKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIC8vICRGbG93SWdub3JlOiBJdCdzIGEgbWFnaWMgcHJvcGVydHksIGR1aFxuICAgICAgZXhwZWN0KEhlbHBlcnMuc2hvdWxkVHJpZ2dlckxpbnRlci5jYWxscy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChsaW50ZXIubGludCkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICBleHBlY3QobGludGVyLmxpbnQuY2FsbHMubGVuZ3RoKS50b0JlKDEpXG4gICAgfSlcbiAgICBpdCgnZG9lcyBub3QgbWF0Y2ggaWYgc2NvcGVzIGRvbnQgbWF0Y2gnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGxpbnRlciA9IGdldExpbnRlcigpXG4gICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGxpbnRlci5ncmFtbWFyU2NvcGVzID0gWydzb3VyY2UuY29mZmVlJ11cbiAgICAgIGxpbnRlclJlZ2lzdHJ5LmFkZExpbnRlcihsaW50ZXIpXG4gICAgICBzcHlPbihIZWxwZXJzLCAnc2hvdWxkVHJpZ2dlckxpbnRlcicpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHNweU9uKGxpbnRlciwgJ2xpbnQnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBleHBlY3QoYXdhaXQgbGludGVyUmVnaXN0cnkubGludCh7IGVkaXRvciwgb25DaGFuZ2U6IGZhbHNlIH0pKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoSGVscGVycy5zaG91bGRUcmlnZ2VyTGludGVyKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIC8vICRGbG93SWdub3JlOiBJdCdzIGEgbWFnaWMgcHJvcGVydHksIGR1aFxuICAgICAgZXhwZWN0KEhlbHBlcnMuc2hvdWxkVHJpZ2dlckxpbnRlci5jYWxscy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChsaW50ZXIubGludCkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZXhwZWN0KGxpbnRlci5saW50LmNhbGxzLmxlbmd0aCkudG9CZSgwKVxuICAgIH0pXG4gICAgaXQoJ2VtaXRzIGV2ZW50cyBwcm9wZXJseScsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHRpbWVzQmVnYW4gPSAwXG4gICAgICBsZXQgdGltZXNVcGRhdGVkID0gMFxuICAgICAgbGV0IHRpbWVzRmluaXNoZWQgPSAwXG5cbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkQmVnaW5MaW50aW5nKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc0JlZ2FuKytcbiAgICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMClcbiAgICAgIH0pXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEZpbmlzaExpbnRpbmcoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzRmluaXNoZWQrK1xuICAgICAgICBleHBlY3QodGltZXNVcGRhdGVkKS50b0JlKDApXG4gICAgICB9KVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRVcGRhdGVNZXNzYWdlcyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNVcGRhdGVkKytcbiAgICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMSlcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGxpbnRlciA9IGdldExpbnRlcigpXG4gICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGxpbnRlclJlZ2lzdHJ5LmFkZExpbnRlcihsaW50ZXIpXG4gICAgICBjb25zdCBwcm9taXNlID0gbGludGVyUmVnaXN0cnkubGludCh7IGVkaXRvciwgb25DaGFuZ2U6IGZhbHNlIH0pXG4gICAgICBleHBlY3QoYXdhaXQgcHJvbWlzZSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KHRpbWVzQmVnYW4pLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc1VwZGF0ZWQpLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDEpXG4gICAgfSlcbiAgICBpdCgnZG9lcyBub3QgdXBkYXRlIGlmIHRoZSBidWZmZXIgaXQgd2FzIGFzc29jaWF0ZWQgdG8gd2FzIGRlc3Ryb3llZCcsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHRpbWVzQmVnYW4gPSAwXG4gICAgICBsZXQgdGltZXNVcGRhdGVkID0gMFxuICAgICAgbGV0IHRpbWVzRmluaXNoZWQgPSAwXG5cbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkQmVnaW5MaW50aW5nKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc0JlZ2FuKytcbiAgICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMClcbiAgICAgIH0pXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEZpbmlzaExpbnRpbmcoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzRmluaXNoZWQrK1xuICAgICAgICBleHBlY3QodGltZXNVcGRhdGVkKS50b0JlKDApXG4gICAgICB9KVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRVcGRhdGVNZXNzYWdlcyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNVcGRhdGVkKytcbiAgICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMSlcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGxpbnRlciA9IGdldExpbnRlcigpXG4gICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGxpbnRlci5zY29wZSA9ICdmaWxlJ1xuICAgICAgbGludGVyUmVnaXN0cnkuYWRkTGludGVyKGxpbnRlcilcbiAgICAgIGVkaXRvci5kZXN0cm95KClcbiAgICAgIGNvbnN0IHByb21pc2UgPSBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSlcbiAgICAgIGV4cGVjdChhd2FpdCBwcm9taXNlKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QodGltZXNCZWdhbikudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgwKVxuICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMSlcbiAgICB9KVxuICAgIGl0KCdkb2VzIHVwZGF0ZSBpZiBidWZmZXIgd2FzIGRlc3Ryb3llZCBpZiBpdHMgcHJvamVjdCBzY29wZWQnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGxldCB0aW1lc0JlZ2FuID0gMFxuICAgICAgbGV0IHRpbWVzVXBkYXRlZCA9IDBcbiAgICAgIGxldCB0aW1lc0ZpbmlzaGVkID0gMFxuXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEJlZ2luTGludGluZyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNCZWdhbisrXG4gICAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDApXG4gICAgICB9KVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRGaW5pc2hMaW50aW5nKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc0ZpbmlzaGVkKytcbiAgICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgwKVxuICAgICAgfSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkVXBkYXRlTWVzc2FnZXMoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzVXBkYXRlZCsrXG4gICAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDEpXG4gICAgICB9KVxuXG4gICAgICBjb25zdCBsaW50ZXIgPSBnZXRMaW50ZXIoKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBsaW50ZXJSZWdpc3RyeS5hZGRMaW50ZXIobGludGVyKVxuICAgICAgZWRpdG9yLmRlc3Ryb3koKVxuICAgICAgY29uc3QgcHJvbWlzZSA9IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KVxuICAgICAgZXhwZWN0KGF3YWl0IHByb21pc2UpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdCh0aW1lc0JlZ2FuKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNVcGRhdGVkKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgxKVxuICAgIH0pXG4gICAgaXQoJ2RvZXMgbm90IHVwZGF0ZSBpZiBudWxsIGlzIHJldHVybmVkJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgcHJvbWlzZVxuICAgICAgbGV0IHRpbWVzQmVnYW4gPSAwXG4gICAgICBsZXQgdGltZXNVcGRhdGVkID0gMFxuICAgICAgbGV0IHRpbWVzRmluaXNoZWQgPSAwXG5cbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkQmVnaW5MaW50aW5nKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc0JlZ2FuKytcbiAgICAgICAgZXhwZWN0KHRpbWVzQmVnYW4gLSAxKS50b0JlKHRpbWVzRmluaXNoZWQpXG4gICAgICB9KVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRGaW5pc2hMaW50aW5nKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc0ZpbmlzaGVkKytcbiAgICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQgLSAxKS50b0JlKHRpbWVzVXBkYXRlZClcbiAgICAgIH0pXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZFVwZGF0ZU1lc3NhZ2VzKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc1VwZGF0ZWQrK1xuICAgICAgfSlcblxuICAgICAgY29uc3QgbGludGVyID0gZ2V0TGludGVyKClcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgbGludGVyUmVnaXN0cnkuYWRkTGludGVyKGxpbnRlcilcbiAgICAgIGxpbnRlci5saW50ID0gYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIGF3YWl0IHdhaXQoNTApXG4gICAgICAgIGlmICh0aW1lc0JlZ2FuID09PSAyKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW11cbiAgICAgIH1cblxuICAgICAgcHJvbWlzZSA9IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KVxuICAgICAgZXhwZWN0KGF3YWl0IHByb21pc2UpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdCh0aW1lc1VwZGF0ZWQpLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDEpXG4gICAgICBwcm9taXNlID0gbGludGVyUmVnaXN0cnkubGludCh7IGVkaXRvciwgb25DaGFuZ2U6IGZhbHNlIH0pXG4gICAgICBleHBlY3QoYXdhaXQgcHJvbWlzZSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMilcbiAgICB9KVxuICAgIGl0KCdzaG93cyBlcnJvciBub3RpZmljYXRpb24gaWYgcmVzcG9uc2UgaXMgbm90IGFycmF5IGFuZCBpcyBub24tbnVsbCcsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHByb21pc2VcbiAgICAgIGxldCB0aW1lc0JlZ2FuID0gMFxuICAgICAgbGV0IHRpbWVzVXBkYXRlZCA9IDBcbiAgICAgIGxldCB0aW1lc0ZpbmlzaGVkID0gMFxuXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEJlZ2luTGludGluZyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNCZWdhbisrXG4gICAgICAgIGV4cGVjdCh0aW1lc0JlZ2FuIC0gMSkudG9CZSh0aW1lc0ZpbmlzaGVkKVxuICAgICAgfSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkRmluaXNoTGludGluZyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNGaW5pc2hlZCsrXG4gICAgICAgIC8vIE5PVEU6IE5vdCBhZGRpbmcgYSB0aW1lc1VwZGF0ZWQgYXNzZXJ0aW9uIGhlcmUgb24gcHVycG9zZVxuICAgICAgICAvLyBCZWNhdXNlIHdlJ3JlIHRlc3RpbmcgaW52YWxpZCByZXR1cm4gdmFsdWVzIGFuZCB0aGV5IGRvbid0XG4gICAgICAgIC8vIHVwZGF0ZSBsaW50ZXIgcmVzdWx0XG4gICAgICB9KVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRVcGRhdGVNZXNzYWdlcyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNVcGRhdGVkKytcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGxpbnRlciA9IGdldExpbnRlcigpXG4gICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGxpbnRlclJlZ2lzdHJ5LmFkZExpbnRlcihsaW50ZXIpXG4gICAgICBsaW50ZXIubGludCA9IGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgICBhd2FpdCB3YWl0KDUwKVxuICAgICAgICBpZiAodGltZXNCZWdhbiA9PT0gMikge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9IGVsc2UgaWYgKHRpbWVzQmVnYW4gPT09IDMpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9IGVsc2UgaWYgKHRpbWVzQmVnYW4gPT09IDQpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtdXG4gICAgICB9XG5cbiAgICAgIC8vIHdpdGggYXJyYXlcbiAgICAgIHByb21pc2UgPSBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSlcbiAgICAgIGV4cGVjdChhd2FpdCBwcm9taXNlKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QodGltZXNVcGRhdGVkKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgxKVxuICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5nZXROb3RpZmljYXRpb25zKCkubGVuZ3RoKS50b0JlKDApXG5cbiAgICAgIC8vIHdpdGggZmFsc2VcbiAgICAgIHByb21pc2UgPSBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSlcbiAgICAgIGV4cGVjdChhd2FpdCBwcm9taXNlKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QodGltZXNVcGRhdGVkKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgyKVxuICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5nZXROb3RpZmljYXRpb25zKCkubGVuZ3RoKS50b0JlKDEpXG5cbiAgICAgIC8vIHdpdGggbnVsbFxuICAgICAgcHJvbWlzZSA9IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KVxuICAgICAgZXhwZWN0KGF3YWl0IHByb21pc2UpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdCh0aW1lc1VwZGF0ZWQpLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDMpXG4gICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLmdldE5vdGlmaWNhdGlvbnMoKS5sZW5ndGgpLnRvQmUoMSlcblxuICAgICAgLy8gd2l0aCB1bmRlZmluZWRcbiAgICAgIHByb21pc2UgPSBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSlcbiAgICAgIGV4cGVjdChhd2FpdCBwcm9taXNlKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QodGltZXNVcGRhdGVkKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSg0KVxuICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5nZXROb3RpZmljYXRpb25zKCkubGVuZ3RoKS50b0JlKDIpXG4gICAgfSlcbiAgICBpdCgndHJpZ2dlcnMgdGhlIGZpbmlzaCBldmVudCBldmVuIHdoZW4gdGhlIHByb3ZpZGVyIGNyYXNoZXMnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGxldCB0aW1lc0JlZ2FuID0gMFxuICAgICAgbGV0IHRpbWVzVXBkYXRlZCA9IDBcbiAgICAgIGxldCB0aW1lc0ZpbmlzaGVkID0gMFxuXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEJlZ2luTGludGluZyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNCZWdhbisrXG4gICAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDApXG4gICAgICB9KVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRGaW5pc2hMaW50aW5nKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc0ZpbmlzaGVkKytcbiAgICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgwKVxuICAgICAgfSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkVXBkYXRlTWVzc2FnZXMoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzVXBkYXRlZCsrXG4gICAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDEpXG4gICAgICB9KVxuXG4gICAgICBjb25zdCBsaW50ZXIgPSBnZXRMaW50ZXIoKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBsaW50ZXJSZWdpc3RyeS5hZGRMaW50ZXIobGludGVyKVxuICAgICAgbGludGVyLmxpbnQgPSBhc3luYyBmdW5jdGlvbigpIHsgYXdhaXQgd2FpdCg1MCk7IHRocm93IG5ldyBFcnJvcignQm9vbScpIH1cbiAgICAgIGNvbnN0IHByb21pc2UgPSBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSlcbiAgICAgIGV4cGVjdChhd2FpdCBwcm9taXNlKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QodGltZXNCZWdhbikudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgwKVxuICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMSlcbiAgICB9KVxuICAgIGl0KCdnaXZlcyBidWZmZXIgZm9yIGZpbGUgc2NvcGVkIGxpbnRlcnMgb24gdXBkYXRlIGV2ZW50JywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgdGltZXNCZWdhbiA9IDBcbiAgICAgIGxldCB0aW1lc1VwZGF0ZWQgPSAwXG4gICAgICBsZXQgdGltZXNGaW5pc2hlZCA9IDBcblxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRCZWdpbkxpbnRpbmcoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzQmVnYW4rK1xuICAgICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgwKVxuICAgICAgfSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkRmluaXNoTGludGluZyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNGaW5pc2hlZCsrXG4gICAgICAgIGV4cGVjdCh0aW1lc0JlZ2FuKS50b0JlKDEpXG4gICAgICB9KVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRVcGRhdGVNZXNzYWdlcyhmdW5jdGlvbih7IGJ1ZmZlciB9KSB7XG4gICAgICAgIHRpbWVzVXBkYXRlZCsrXG4gICAgICAgIGV4cGVjdChidWZmZXIuY29uc3RydWN0b3IubmFtZSkudG9CZSgnVGV4dEJ1ZmZlcicpXG4gICAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDEpXG4gICAgICB9KVxuXG4gICAgICBjb25zdCBsaW50ZXIgPSBnZXRMaW50ZXIoKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBsaW50ZXIuc2NvcGUgPSAnZmlsZSdcbiAgICAgIGxpbnRlclJlZ2lzdHJ5LmFkZExpbnRlcihsaW50ZXIpXG4gICAgICBjb25zdCBwcm9taXNlID0gbGludGVyUmVnaXN0cnkubGludCh7IGVkaXRvciwgb25DaGFuZ2U6IGZhbHNlIH0pXG4gICAgICBleHBlY3QoYXdhaXQgcHJvbWlzZSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KHRpbWVzQmVnYW4pLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc1VwZGF0ZWQpLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDEpXG4gICAgfSlcbiAgICBpdCgnZG9lcyBub3QgZ2l2ZSBhIGJ1ZmZlciBmb3IgcHJvamVjdCBzY29wZWQgbGludGVycyBvbiB1cGRhdGUgZXZlbnQnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGxldCB0aW1lc0JlZ2FuID0gMFxuICAgICAgbGV0IHRpbWVzVXBkYXRlZCA9IDBcbiAgICAgIGxldCB0aW1lc0ZpbmlzaGVkID0gMFxuXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEJlZ2luTGludGluZyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNCZWdhbisrXG4gICAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDApXG4gICAgICB9KVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRGaW5pc2hMaW50aW5nKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc0ZpbmlzaGVkKytcbiAgICAgICAgZXhwZWN0KHRpbWVzQmVnYW4pLnRvQmUoMSlcbiAgICAgIH0pXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZFVwZGF0ZU1lc3NhZ2VzKGZ1bmN0aW9uKHsgYnVmZmVyIH0pIHtcbiAgICAgICAgdGltZXNVcGRhdGVkKytcbiAgICAgICAgZXhwZWN0KGJ1ZmZlcikudG9CZShudWxsKVxuICAgICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgxKVxuICAgICAgfSlcblxuICAgICAgY29uc3QgbGludGVyID0gZ2V0TGludGVyKClcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgbGludGVyUmVnaXN0cnkuYWRkTGludGVyKGxpbnRlcilcbiAgICAgIGNvbnN0IHByb21pc2UgPSBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSlcbiAgICAgIGV4cGVjdChhd2FpdCBwcm9taXNlKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QodGltZXNCZWdhbikudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMSlcbiAgICB9KVxuICAgIGl0KCdnaXZlcyBhIGZpbGVwYXRoIGZvciBmaWxlIHNjb3BlZCBsaW50ZXJzIG9uIHN0YXJ0IGFuZCBmaW5pc2ggZXZlbnRzJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgdGltZXNCZWdhbiA9IDBcbiAgICAgIGxldCB0aW1lc1VwZGF0ZWQgPSAwXG4gICAgICBsZXQgdGltZXNGaW5pc2hlZCA9IDBcblxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRCZWdpbkxpbnRpbmcoZnVuY3Rpb24oeyBmaWxlUGF0aCB9KSB7XG4gICAgICAgIHRpbWVzQmVnYW4rK1xuICAgICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgwKVxuICAgICAgICBleHBlY3QoZmlsZVBhdGgpLnRvQmUoX19maWxlbmFtZSlcbiAgICAgIH0pXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEZpbmlzaExpbnRpbmcoZnVuY3Rpb24oeyBmaWxlUGF0aCB9KSB7XG4gICAgICAgIHRpbWVzRmluaXNoZWQrK1xuICAgICAgICBleHBlY3QodGltZXNCZWdhbikudG9CZSgxKVxuICAgICAgICBleHBlY3QoZmlsZVBhdGgpLnRvQmUoX19maWxlbmFtZSlcbiAgICAgIH0pXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZFVwZGF0ZU1lc3NhZ2VzKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc1VwZGF0ZWQrK1xuICAgICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgxKVxuICAgICAgfSlcblxuICAgICAgY29uc3QgbGludGVyID0gZ2V0TGludGVyKClcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgbGludGVyLnNjb3BlID0gJ2ZpbGUnXG4gICAgICBsaW50ZXJSZWdpc3RyeS5hZGRMaW50ZXIobGludGVyKVxuICAgICAgY29uc3QgcHJvbWlzZSA9IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KVxuICAgICAgZXhwZWN0KGF3YWl0IHByb21pc2UpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdCh0aW1lc0JlZ2FuKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNVcGRhdGVkKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgxKVxuICAgIH0pXG4gICAgaXQoJ2RvZXMgbm90IGdpdmUgYSBmaWxlIHBhdGggZm9yIHByb2plY3Qgc2NvcGVkIGxpbnRlcnMgb24gc3RhcnQgYW5kIGZpbmlzaCBldmVudHMnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGxldCB0aW1lc0JlZ2FuID0gMFxuICAgICAgbGV0IHRpbWVzVXBkYXRlZCA9IDBcbiAgICAgIGxldCB0aW1lc0ZpbmlzaGVkID0gMFxuXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEJlZ2luTGludGluZyhmdW5jdGlvbih7IGZpbGVQYXRoIH0pIHtcbiAgICAgICAgdGltZXNCZWdhbisrXG4gICAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDApXG4gICAgICAgIGV4cGVjdChmaWxlUGF0aCkudG9CZShudWxsKVxuICAgICAgfSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkRmluaXNoTGludGluZyhmdW5jdGlvbih7IGZpbGVQYXRoIH0pIHtcbiAgICAgICAgdGltZXNGaW5pc2hlZCsrXG4gICAgICAgIGV4cGVjdCh0aW1lc0JlZ2FuKS50b0JlKDEpXG4gICAgICAgIGV4cGVjdChmaWxlUGF0aCkudG9CZShudWxsKVxuICAgICAgfSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkVXBkYXRlTWVzc2FnZXMoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzVXBkYXRlZCsrXG4gICAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDEpXG4gICAgICB9KVxuXG4gICAgICBjb25zdCBsaW50ZXIgPSBnZXRMaW50ZXIoKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBsaW50ZXJSZWdpc3RyeS5hZGRMaW50ZXIobGludGVyKVxuICAgICAgY29uc3QgcHJvbWlzZSA9IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KVxuICAgICAgZXhwZWN0KGF3YWl0IHByb21pc2UpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdCh0aW1lc0JlZ2FuKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNVcGRhdGVkKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgxKVxuICAgIH0pXG4gICAgaXQoXCJkb2VzIG5vdCBpbnZva2UgYSBsaW50ZXIgaWYgaXQncyBpZ25vcmVkXCIsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHByb21pc2VcbiAgICAgIGxldCB0aW1lc0JlZ2FuID0gMFxuICAgICAgbGV0IHRpbWVzVXBkYXRlZCA9IDBcbiAgICAgIGxldCB0aW1lc0ZpbmlzaGVkID0gMFxuXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEJlZ2luTGludGluZygoKSA9PiB0aW1lc0JlZ2FuKyspXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEZpbmlzaExpbnRpbmcoKCkgPT4gdGltZXNGaW5pc2hlZCsrKVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRVcGRhdGVNZXNzYWdlcygoKSA9PiB0aW1lc1VwZGF0ZWQrKylcblxuICAgICAgY29uc3QgbGludGVyID0gZ2V0TGludGVyKClcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLmRpc2FibGVkUHJvdmlkZXJzJywgW10pXG4gICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGxpbnRlci5uYW1lID0gJ1NvbWUgTGludGVyJ1xuICAgICAgbGludGVyUmVnaXN0cnkuYWRkTGludGVyKGxpbnRlcilcblxuICAgICAgcHJvbWlzZSA9IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KVxuICAgICAgZXhwZWN0KGF3YWl0IHByb21pc2UpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdCh0aW1lc0JlZ2FuKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNCZWdhbikudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMSlcblxuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXIuZGlzYWJsZWRQcm92aWRlcnMnLCBbbGludGVyLm5hbWVdKVxuICAgICAgYXdhaXQgd2FpdCgxMDApXG5cbiAgICAgIHByb21pc2UgPSBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSlcbiAgICAgIGV4cGVjdChhd2FpdCBwcm9taXNlKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QodGltZXNCZWdhbikudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMSlcblxuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXIuZGlzYWJsZWRQcm92aWRlcnMnLCBbXSlcbiAgICAgIGF3YWl0IHdhaXQoMTAwKVxuXG4gICAgICBwcm9taXNlID0gbGludGVyUmVnaXN0cnkubGludCh7IGVkaXRvciwgb25DaGFuZ2U6IGZhbHNlIH0pXG4gICAgICBleHBlY3QoYXdhaXQgcHJvbWlzZSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KHRpbWVzQmVnYW4pLnRvQmUoMilcbiAgICAgIGV4cGVjdCh0aW1lc1VwZGF0ZWQpLnRvQmUoMilcbiAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDIpXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=