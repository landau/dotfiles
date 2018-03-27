function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _jasmineFix = require('jasmine-fix');

var _libToggleView = require('../lib/toggle-view');

var _libToggleView2 = _interopRequireDefault(_libToggleView);

describe('Toggle View', function () {
  beforeEach(function () {
    atom.config.set('linter.disabledProviders', []);
  });

  describe('::getItems', function () {
    (0, _jasmineFix.it)('returns disabled when enabling', _asyncToGenerator(function* () {
      var toggleView = new _libToggleView2['default']('enable', ['Package 1', 'Package 2', 'Package 3']);
      atom.config.set('linter.disabledProviders', ['Package 2']);
      expect((yield toggleView.getItems())).toEqual(['Package 2']);
    }));
    (0, _jasmineFix.it)('returns enabled when disabling', _asyncToGenerator(function* () {
      var toggleView = new _libToggleView2['default']('disable', ['Package 1', 'Package 2', 'Package 3']);
      atom.config.set('linter.disabledProviders', ['Package 2']);
      expect((yield toggleView.getItems())).toEqual(['Package 1', 'Package 3']);
    }));
  });
  (0, _jasmineFix.it)('has a working lifecycle', _asyncToGenerator(function* () {
    var didDisable = [];
    var toggleView = new _libToggleView2['default']('disable', ['Package 1', 'Package 2', 'Package 3']);

    spyOn(toggleView, 'process').andCallThrough();
    spyOn(toggleView, 'getItems').andCallThrough();
    toggleView.onDidDisable(function (name) {
      return didDisable.push(name);
    });

    expect(didDisable).toEqual([]);
    expect(toggleView.process.calls.length).toBe(0);
    expect(toggleView.getItems.calls.length).toBe(0);
    expect(atom.workspace.getModalPanels().length).toBe(0);
    yield toggleView.show();
    expect(didDisable).toEqual([]);
    expect(toggleView.process.calls.length).toBe(0);
    expect(toggleView.getItems.calls.length).toBe(1);
    expect(atom.workspace.getModalPanels().length).toBe(1);

    var element = atom.workspace.getModalPanels()[0].item.element.querySelector('.list-group');
    expect(element.children.length).toBe(3);
    expect(element.children[0].textContent).toBe('Package 1');
    expect(element.children[1].textContent).toBe('Package 2');
    expect(element.children[2].textContent).toBe('Package 3');
    element.children[1].dispatchEvent(new MouseEvent('click'));

    expect(toggleView.process.calls.length).toBe(1);
    expect(toggleView.getItems.calls.length).toBe(1);
    expect(toggleView.process.calls[0].args[0]).toBe('Package 2');
    yield (0, _jasmineFix.wait)(50);
    expect(didDisable).toEqual(['Package 2']);
    expect(atom.config.get('linter.disabledProviders')).toEqual(['Package 2']);
  }));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9zcGVjL3RvZ2dsZS12aWV3LXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OzswQkFFeUIsYUFBYTs7NkJBRWYsb0JBQW9COzs7O0FBRTNDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsWUFBVztBQUNqQyxZQUFVLENBQUMsWUFBVztBQUNwQixRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxFQUFFLENBQUMsQ0FBQTtHQUNoRCxDQUFDLENBQUE7O0FBRUYsVUFBUSxDQUFDLFlBQVksRUFBRSxZQUFXO0FBQ2hDLHdCQUFHLGdDQUFnQyxvQkFBRSxhQUFpQjtBQUNwRCxVQUFNLFVBQVUsR0FBRywrQkFBZSxRQUFRLEVBQUUsQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUE7QUFDcEYsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO0FBQzFELFlBQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQTtLQUMzRCxFQUFDLENBQUE7QUFDRix3QkFBRyxnQ0FBZ0Msb0JBQUUsYUFBaUI7QUFDcEQsVUFBTSxVQUFVLEdBQUcsK0JBQWUsU0FBUyxFQUFFLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFBO0FBQ3JGLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQTtBQUMxRCxZQUFNLEVBQUMsTUFBTSxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFBO0tBQ3hFLEVBQUMsQ0FB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Q0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDN0QsVUFBTSxzQkFBSyxFQUFFLENBQUMsQ0FBQTtBQUNkLFVBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO0FBQ3pDLFVBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQTtHQUMzRSxFQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvdG9nZ2xlLXZpZXctc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IGl0LCB3YWl0IH0gZnJvbSAnamFzbWluZS1maXgnXG5cbmltcG9ydCBUb2dnbGVWaWV3IGZyb20gJy4uL2xpYi90b2dnbGUtdmlldydcblxuZGVzY3JpYmUoJ1RvZ2dsZSBWaWV3JywgZnVuY3Rpb24oKSB7XG4gIGJlZm9yZUVhY2goZnVuY3Rpb24oKSB7XG4gICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXIuZGlzYWJsZWRQcm92aWRlcnMnLCBbXSlcbiAgfSlcblxuICBkZXNjcmliZSgnOjpnZXRJdGVtcycsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdyZXR1cm5zIGRpc2FibGVkIHdoZW4gZW5hYmxpbmcnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IHRvZ2dsZVZpZXcgPSBuZXcgVG9nZ2xlVmlldygnZW5hYmxlJywgWydQYWNrYWdlIDEnLCAnUGFja2FnZSAyJywgJ1BhY2thZ2UgMyddKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXIuZGlzYWJsZWRQcm92aWRlcnMnLCBbJ1BhY2thZ2UgMiddKVxuICAgICAgZXhwZWN0KGF3YWl0IHRvZ2dsZVZpZXcuZ2V0SXRlbXMoKSkudG9FcXVhbChbJ1BhY2thZ2UgMiddKVxuICAgIH0pXG4gICAgaXQoJ3JldHVybnMgZW5hYmxlZCB3aGVuIGRpc2FibGluZycsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgdG9nZ2xlVmlldyA9IG5ldyBUb2dnbGVWaWV3KCdkaXNhYmxlJywgWydQYWNrYWdlIDEnLCAnUGFja2FnZSAyJywgJ1BhY2thZ2UgMyddKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXIuZGlzYWJsZWRQcm92aWRlcnMnLCBbJ1BhY2thZ2UgMiddKVxuICAgICAgZXhwZWN0KGF3YWl0IHRvZ2dsZVZpZXcuZ2V0SXRlbXMoKSkudG9FcXVhbChbJ1BhY2thZ2UgMScsICdQYWNrYWdlIDMnXSlcbiAgICB9KVxuICB9KVxuICBpdCgnaGFzIGEgd29ya2luZyBsaWZlY3ljbGUnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBkaWREaXNhYmxlID0gW11cbiAgICBjb25zdCB0b2dnbGVWaWV3ID0gbmV3IFRvZ2dsZVZpZXcoJ2Rpc2FibGUnLCBbJ1BhY2thZ2UgMScsICdQYWNrYWdlIDInLCAnUGFja2FnZSAzJ10pXG5cbiAgICBzcHlPbih0b2dnbGVWaWV3LCAncHJvY2VzcycpLmFuZENhbGxUaHJvdWdoKClcbiAgICBzcHlPbih0b2dnbGVWaWV3LCAnZ2V0SXRlbXMnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgdG9nZ2xlVmlldy5vbkRpZERpc2FibGUobmFtZSA9PiBkaWREaXNhYmxlLnB1c2gobmFtZSkpXG5cbiAgICBleHBlY3QoZGlkRGlzYWJsZSkudG9FcXVhbChbXSlcbiAgICBleHBlY3QodG9nZ2xlVmlldy5wcm9jZXNzLmNhbGxzLmxlbmd0aCkudG9CZSgwKVxuICAgIGV4cGVjdCh0b2dnbGVWaWV3LmdldEl0ZW1zLmNhbGxzLmxlbmd0aCkudG9CZSgwKVxuICAgIGV4cGVjdChhdG9tLndvcmtzcGFjZS5nZXRNb2RhbFBhbmVscygpLmxlbmd0aCkudG9CZSgwKVxuICAgIGF3YWl0IHRvZ2dsZVZpZXcuc2hvdygpXG4gICAgZXhwZWN0KGRpZERpc2FibGUpLnRvRXF1YWwoW10pXG4gICAgZXhwZWN0KHRvZ2dsZVZpZXcucHJvY2Vzcy5jYWxscy5sZW5ndGgpLnRvQmUoMClcbiAgICBleHBlY3QodG9nZ2xlVmlldy5nZXRJdGVtcy5jYWxscy5sZW5ndGgpLnRvQmUoMSlcbiAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2UuZ2V0TW9kYWxQYW5lbHMoKS5sZW5ndGgpLnRvQmUoMSlcblxuICAgIGNvbnN0IGVsZW1lbnQgPSBhdG9tLndvcmtzcGFjZS5nZXRNb2RhbFBhbmVscygpWzBdLml0ZW0uZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcubGlzdC1ncm91cCcpXG4gICAgZXhwZWN0KGVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoKS50b0JlKDMpXG4gICAgZXhwZWN0KGVsZW1lbnQuY2hpbGRyZW5bMF0udGV4dENvbnRlbnQpLnRvQmUoJ1BhY2thZ2UgMScpXG4gICAgZXhwZWN0KGVsZW1lbnQuY2hpbGRyZW5bMV0udGV4dENvbnRlbnQpLnRvQmUoJ1BhY2thZ2UgMicpXG4gICAgZXhwZWN0KGVsZW1lbnQuY2hpbGRyZW5bMl0udGV4dENvbnRlbnQpLnRvQmUoJ1BhY2thZ2UgMycpXG4gICAgZWxlbWVudC5jaGlsZHJlblsxXS5kaXNwYXRjaEV2ZW50KG5ldyBNb3VzZUV2ZW50KCdjbGljaycpKVxuXG4gICAgZXhwZWN0KHRvZ2dsZVZpZXcucHJvY2Vzcy5jYWxscy5sZW5ndGgpLnRvQmUoMSlcbiAgICBleHBlY3QodG9nZ2xlVmlldy5nZXRJdGVtcy5jYWxscy5sZW5ndGgpLnRvQmUoMSlcbiAgICBleHBlY3QodG9nZ2xlVmlldy5wcm9jZXNzLmNhbGxzWzBdLmFyZ3NbMF0pLnRvQmUoJ1BhY2thZ2UgMicpXG4gICAgYXdhaXQgd2FpdCg1MClcbiAgICBleHBlY3QoZGlkRGlzYWJsZSkudG9FcXVhbChbJ1BhY2thZ2UgMiddKVxuICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci5kaXNhYmxlZFByb3ZpZGVycycpKS50b0VxdWFsKFsnUGFja2FnZSAyJ10pXG4gIH0pXG59KVxuIl19