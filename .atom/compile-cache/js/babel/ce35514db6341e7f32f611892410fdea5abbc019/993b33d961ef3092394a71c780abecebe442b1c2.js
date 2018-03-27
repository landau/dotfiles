function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _jasmineFix = require('jasmine-fix');

var _libEditorRegistry = require('../lib/editor-registry');

var _libEditorRegistry2 = _interopRequireDefault(_libEditorRegistry);

describe('EditorRegistry', function () {
  var editorRegistry = undefined;

  (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
    yield atom.workspace.open(__filename);
    editorRegistry = new _libEditorRegistry2['default']();
  }));
  afterEach(function () {
    atom.workspace.destroyActivePane();
    editorRegistry.dispose();
  });

  describe('::constructor', function () {
    (0, _jasmineFix.it)('is a saint', function () {
      expect(function () {
        return new _libEditorRegistry2['default']();
      }).not.toThrow();
    });
  });

  describe('::activate && ::createFromTextEditor', function () {
    (0, _jasmineFix.it)('adds current open editors to registry', function () {
      expect(editorRegistry.editorLinters.size).toBe(0);
      editorRegistry.activate();
      expect(editorRegistry.editorLinters.size).toBe(1);
    });
    (0, _jasmineFix.it)('adds editors as they are opened', _asyncToGenerator(function* () {
      expect(editorRegistry.editorLinters.size).toBe(0);
      editorRegistry.activate();
      expect(editorRegistry.editorLinters.size).toBe(1);
      yield atom.workspace.open();
      expect(editorRegistry.editorLinters.size).toBe(2);
    }));
    (0, _jasmineFix.it)('removes the editor as it is closed', _asyncToGenerator(function* () {
      expect(editorRegistry.editorLinters.size).toBe(0);
      editorRegistry.activate();
      expect(editorRegistry.editorLinters.size).toBe(1);
      yield atom.workspace.open();
      expect(editorRegistry.editorLinters.size).toBe(2);
      atom.workspace.destroyActivePaneItem();
      expect(editorRegistry.editorLinters.size).toBe(1);
      atom.workspace.destroyActivePane();
      expect(editorRegistry.editorLinters.size).toBe(0);
    }));
    (0, _jasmineFix.it)('does not lint instantly if lintOnOpen is off', _asyncToGenerator(function* () {
      editorRegistry.activate();
      atom.config.set('linter.lintOnOpen', false);
      var lintCalls = 0;
      editorRegistry.observe(function (editorLinter) {
        editorLinter.onShouldLint(function () {
          return ++lintCalls;
        });
      });
      expect(lintCalls).toBe(0);
      yield atom.workspace.open();
      expect(lintCalls).toBe(0);
    }));
    (0, _jasmineFix.it)('invokes lint instantly if lintOnOpen is on', _asyncToGenerator(function* () {
      editorRegistry.activate();
      atom.config.set('linter.lintOnOpen', true);
      var lintCalls = 0;
      editorRegistry.observe(function (editorLinter) {
        editorLinter.onShouldLint(function () {
          return ++lintCalls;
        });
      });
      expect(lintCalls).toBe(0);
      yield atom.workspace.open();
      expect(lintCalls).toBe(1);
    }));
  });
  describe('::observe', function () {
    (0, _jasmineFix.it)('calls with current editors and updates as new are opened', _asyncToGenerator(function* () {
      var timesCalled = 0;
      editorRegistry.observe(function () {
        timesCalled++;
      });
      expect(timesCalled).toBe(0);
      editorRegistry.activate();
      expect(timesCalled).toBe(1);
      yield atom.workspace.open();
      expect(timesCalled).toBe(2);
    }));
  });
  describe('::dispose', function () {
    (0, _jasmineFix.it)('disposes all the editors on dispose', _asyncToGenerator(function* () {
      var timesDisposed = 0;
      editorRegistry.observe(function (editorLinter) {
        editorLinter.onDidDestroy(function () {
          timesDisposed++;
        });
      });
      expect(timesDisposed).toBe(0);
      editorRegistry.activate();
      expect(timesDisposed).toBe(0);
      atom.workspace.destroyActivePaneItem();
      expect(timesDisposed).toBe(1);
      yield atom.workspace.open();
      expect(timesDisposed).toBe(1);
      atom.workspace.destroyActivePaneItem();
      expect(timesDisposed).toBe(2);
      yield atom.workspace.open();
      yield atom.workspace.open();
      editorRegistry.dispose();
      expect(timesDisposed).toBe(4);
    }));
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9zcGVjL2VkaXRvci1yZWdpc3RyeS1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7MEJBRStCLGFBQWE7O2lDQUNqQix3QkFBd0I7Ozs7QUFFbkQsUUFBUSxDQUFDLGdCQUFnQixFQUFFLFlBQVc7QUFDcEMsTUFBSSxjQUFjLFlBQUEsQ0FBQTs7QUFFbEIsZ0RBQVcsYUFBaUI7QUFDMUIsVUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUNyQyxrQkFBYyxHQUFHLG9DQUFvQixDQUFBO0dBQ3RDLEVBQUMsQ0FBQTtBQUNGLFdBQVMsQ0FBQyxZQUFXO0FBQ25CLFFBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtBQUNsQyxrQkFBYyxDQUFDLE9BQU8sRUFBRSxDQUFBO0dBQ3pCLENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMsZUFBZSxFQUFFLFlBQVc7QUFDbkMsd0JBQUcsWUFBWSxFQUFFLFlBQVc7QUFDMUIsWUFBTSxDQUFDLFlBQVc7QUFDaEIsZUFBTyxvQ0FBb0IsQ0FBQTtPQUM1QixDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQ2pCLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMsc0NBQXNDLEVBQUUsWUFBVztBQUMxRCx3QkFBRyx1Q0FBdUMsRUFBRSxZQUFXO0FBQ3JELFlBQU0sQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqRCxvQkFBYyxDQUFDLFFBQVEsRUFBRSxDQUFBO0FBQ3pCLFlBQU0sQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNsRCxDQUFDLENBQUE7QUFDRix3QkFBRyxpQ0FBaUMsb0JBQUUs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LENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDN0IsWUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzNCLFlBQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDN0IsVUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFBO0FBQ3RDLFlBQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDN0IsWUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzNCLFlBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUMzQixvQkFBYyxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3hCLFlBQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDOUIsRUFBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9zcGVjL2VkaXRvci1yZWdpc3RyeS1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgaXQsIGJlZm9yZUVhY2ggfSBmcm9tICdqYXNtaW5lLWZpeCdcbmltcG9ydCBFZGl0b3JSZWdpc3RyeSBmcm9tICcuLi9saWIvZWRpdG9yLXJlZ2lzdHJ5J1xuXG5kZXNjcmliZSgnRWRpdG9yUmVnaXN0cnknLCBmdW5jdGlvbigpIHtcbiAgbGV0IGVkaXRvclJlZ2lzdHJ5XG5cbiAgYmVmb3JlRWFjaChhc3luYyBmdW5jdGlvbigpIHtcbiAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKF9fZmlsZW5hbWUpXG4gICAgZWRpdG9yUmVnaXN0cnkgPSBuZXcgRWRpdG9yUmVnaXN0cnkoKVxuICB9KVxuICBhZnRlckVhY2goZnVuY3Rpb24oKSB7XG4gICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmUoKVxuICAgIGVkaXRvclJlZ2lzdHJ5LmRpc3Bvc2UoKVxuICB9KVxuXG4gIGRlc2NyaWJlKCc6OmNvbnN0cnVjdG9yJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ2lzIGEgc2FpbnQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGV4cGVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFZGl0b3JSZWdpc3RyeSgpXG4gICAgICB9KS5ub3QudG9UaHJvdygpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnOjphY3RpdmF0ZSAmJiA6OmNyZWF0ZUZyb21UZXh0RWRpdG9yJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ2FkZHMgY3VycmVudCBvcGVuIGVkaXRvcnMgdG8gcmVnaXN0cnknLCBmdW5jdGlvbigpIHtcbiAgICAgIGV4cGVjdChlZGl0b3JSZWdpc3RyeS5lZGl0b3JMaW50ZXJzLnNpemUpLnRvQmUoMClcbiAgICAgIGVkaXRvclJlZ2lzdHJ5LmFjdGl2YXRlKClcbiAgICAgIGV4cGVjdChlZGl0b3JSZWdpc3RyeS5lZGl0b3JMaW50ZXJzLnNpemUpLnRvQmUoMSlcbiAgICB9KVxuICAgIGl0KCdhZGRzIGVkaXRvcnMgYXMgdGhleSBhcmUgb3BlbmVkJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBleHBlY3QoZWRpdG9yUmVnaXN0cnkuZWRpdG9yTGludGVycy5zaXplKS50b0JlKDApXG4gICAgICBlZGl0b3JSZWdpc3RyeS5hY3RpdmF0ZSgpXG4gICAgICBleHBlY3QoZWRpdG9yUmVnaXN0cnkuZWRpdG9yTGludGVycy5zaXplKS50b0JlKDEpXG4gICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICAgIGV4cGVjdChlZGl0b3JSZWdpc3RyeS5lZGl0b3JMaW50ZXJzLnNpemUpLnRvQmUoMilcbiAgICB9KVxuICAgIGl0KCdyZW1vdmVzIHRoZSBlZGl0b3IgYXMgaXQgaXMgY2xvc2VkJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBleHBlY3QoZWRpdG9yUmVnaXN0cnkuZWRpdG9yTGludGVycy5zaXplKS50b0JlKDApXG4gICAgICBlZGl0b3JSZWdpc3RyeS5hY3RpdmF0ZSgpXG4gICAgICBleHBlY3QoZWRpdG9yUmVnaXN0cnkuZWRpdG9yTGludGVycy5zaXplKS50b0JlKDEpXG4gICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICAgIGV4cGVjdChlZGl0b3JSZWdpc3RyeS5lZGl0b3JMaW50ZXJzLnNpemUpLnRvQmUoMilcbiAgICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lSXRlbSgpXG4gICAgICBleHBlY3QoZWRpdG9yUmVnaXN0cnkuZWRpdG9yTGludGVycy5zaXplKS50b0JlKDEpXG4gICAgICBhdG9tLndvcmtzcGFjZS5kZXN0cm95QWN0aXZlUGFuZSgpXG4gICAgICBleHBlY3QoZWRpdG9yUmVnaXN0cnkuZWRpdG9yTGludGVycy5zaXplKS50b0JlKDApXG4gICAgfSlcbiAgICBpdCgnZG9lcyBub3QgbGludCBpbnN0YW50bHkgaWYgbGludE9uT3BlbiBpcyBvZmYnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGVkaXRvclJlZ2lzdHJ5LmFjdGl2YXRlKClcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLmxpbnRPbk9wZW4nLCBmYWxzZSlcbiAgICAgIGxldCBsaW50Q2FsbHMgPSAwXG4gICAgICBlZGl0b3JSZWdpc3RyeS5vYnNlcnZlKGZ1bmN0aW9uKGVkaXRvckxpbnRlcikge1xuICAgICAgICBlZGl0b3JMaW50ZXIub25TaG91bGRMaW50KCgpID0+ICsrbGludENhbGxzKVxuICAgICAgfSlcbiAgICAgIGV4cGVjdChsaW50Q2FsbHMpLnRvQmUoMClcbiAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oKVxuICAgICAgZXhwZWN0KGxpbnRDYWxscykudG9CZSgwKVxuICAgIH0pXG4gICAgaXQoJ2ludm9rZXMgbGludCBpbnN0YW50bHkgaWYgbGludE9uT3BlbiBpcyBvbicsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgZWRpdG9yUmVnaXN0cnkuYWN0aXZhdGUoKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXIubGludE9uT3BlbicsIHRydWUpXG4gICAgICBsZXQgbGludENhbGxzID0gMFxuICAgICAgZWRpdG9yUmVnaXN0cnkub2JzZXJ2ZShmdW5jdGlvbihlZGl0b3JMaW50ZXIpIHtcbiAgICAgICAgZWRpdG9yTGludGVyLm9uU2hvdWxkTGludCgoKSA9PiArK2xpbnRDYWxscylcbiAgICAgIH0pXG4gICAgICBleHBlY3QobGludENhbGxzKS50b0JlKDApXG4gICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICAgIGV4cGVjdChsaW50Q2FsbHMpLnRvQmUoMSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnOjpvYnNlcnZlJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ2NhbGxzIHdpdGggY3VycmVudCBlZGl0b3JzIGFuZCB1cGRhdGVzIGFzIG5ldyBhcmUgb3BlbmVkJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgdGltZXNDYWxsZWQgPSAwXG4gICAgICBlZGl0b3JSZWdpc3RyeS5vYnNlcnZlKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc0NhbGxlZCsrXG4gICAgICB9KVxuICAgICAgZXhwZWN0KHRpbWVzQ2FsbGVkKS50b0JlKDApXG4gICAgICBlZGl0b3JSZWdpc3RyeS5hY3RpdmF0ZSgpXG4gICAgICBleHBlY3QodGltZXNDYWxsZWQpLnRvQmUoMSlcbiAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oKVxuICAgICAgZXhwZWN0KHRpbWVzQ2FsbGVkKS50b0JlKDIpXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJzo6ZGlzcG9zZScsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdkaXNwb3NlcyBhbGwgdGhlIGVkaXRvcnMgb24gZGlzcG9zZScsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHRpbWVzRGlzcG9zZWQgPSAwXG4gICAgICBlZGl0b3JSZWdpc3RyeS5vYnNlcnZlKGZ1bmN0aW9uKGVkaXRvckxpbnRlcikge1xuICAgICAgICBlZGl0b3JMaW50ZXIub25EaWREZXN0cm95KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRpbWVzRGlzcG9zZWQrK1xuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIGV4cGVjdCh0aW1lc0Rpc3Bvc2VkKS50b0JlKDApXG4gICAgICBlZGl0b3JSZWdpc3RyeS5hY3RpdmF0ZSgpXG4gICAgICBleHBlY3QodGltZXNEaXNwb3NlZCkudG9CZSgwKVxuICAgICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmVJdGVtKClcbiAgICAgIGV4cGVjdCh0aW1lc0Rpc3Bvc2VkKS50b0JlKDEpXG4gICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICAgIGV4cGVjdCh0aW1lc0Rpc3Bvc2VkKS50b0JlKDEpXG4gICAgICBhdG9tLndvcmtzcGFjZS5kZXN0cm95QWN0aXZlUGFuZUl0ZW0oKVxuICAgICAgZXhwZWN0KHRpbWVzRGlzcG9zZWQpLnRvQmUoMilcbiAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oKVxuICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbigpXG4gICAgICBlZGl0b3JSZWdpc3RyeS5kaXNwb3NlKClcbiAgICAgIGV4cGVjdCh0aW1lc0Rpc3Bvc2VkKS50b0JlKDQpXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=