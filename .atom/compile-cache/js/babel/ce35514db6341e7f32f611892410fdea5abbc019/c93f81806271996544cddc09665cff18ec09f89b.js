var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _jasmineFix = require('jasmine-fix');

var _libBusySignal = require('../lib/busy-signal');

var _libBusySignal2 = _interopRequireDefault(_libBusySignal);

var _helpers = require('./helpers');

var SignalRegistry = (function () {
  function SignalRegistry() {
    _classCallCheck(this, SignalRegistry);

    this.texts = [];
  }

  _createClass(SignalRegistry, [{
    key: 'clear',
    value: function clear() {
      this.texts = [];
    }
  }, {
    key: 'add',
    value: function add(text) {
      this.texts.push(text);
    }
  }], [{
    key: 'create',
    value: function create() {
      var registry = new SignalRegistry();
      spyOn(registry, 'add').andCallThrough();
      spyOn(registry, 'clear').andCallThrough();
      return registry;
    }
  }]);

  return SignalRegistry;
})();

describe('BusySignal', function () {
  var busySignal = undefined;

  (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
    yield atom.packages.loadPackage('linter-ui-default');
    busySignal = new _libBusySignal2['default']();
    busySignal.attach(SignalRegistry);
  }));
  afterEach(function () {
    busySignal.dispose();
  });

  it('tells the registry when linting is in progress without adding duplicates', function () {
    var linterA = (0, _helpers.getLinter)();
    expect(busySignal.provider && busySignal.provider.texts).toEqual([]);
    busySignal.didBeginLinting(linterA, '/');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some on /']);
    busySignal.didFinishLinting(linterA, '/');
    busySignal.didFinishLinting(linterA, '/');
    expect(busySignal.provider && busySignal.provider.texts).toEqual([]);
    busySignal.didBeginLinting(linterA, '/');
    busySignal.didBeginLinting(linterA, '/');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some on /']);
    busySignal.didFinishLinting(linterA, '/');
    expect(busySignal.provider && busySignal.provider.texts).toEqual([]);
  });
  it('shows one line per file and one for all project scoped ones', function () {
    var linterA = (0, _helpers.getLinter)();
    var linterB = (0, _helpers.getLinter)();
    var linterC = (0, _helpers.getLinter)();
    var linterD = (0, _helpers.getLinter)();
    var linterE = (0, _helpers.getLinter)();
    busySignal.didBeginLinting(linterA, '/a');
    busySignal.didBeginLinting(linterA, '/aa');
    busySignal.didBeginLinting(linterB, '/b');
    busySignal.didBeginLinting(linterC, '/b');
    busySignal.didBeginLinting(linterD);
    busySignal.didBeginLinting(linterE);
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some on /a', 'some on /aa', 'some, some on /b', 'some, some']);
    busySignal.didFinishLinting(linterA);
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some on /a', 'some on /aa', 'some, some on /b', 'some, some']);
    busySignal.didFinishLinting(linterA, '/a');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some on /aa', 'some, some on /b', 'some, some']);
    busySignal.didFinishLinting(linterA, '/aa');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some, some on /b', 'some, some']);
    busySignal.didFinishLinting(linterB, '/b');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some on /b', 'some, some']);
    busySignal.didFinishLinting(linterC, '/b');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some, some']);
    busySignal.didFinishLinting(linterD, '/b');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some, some']);
    busySignal.didFinishLinting(linterD);
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some']);
    busySignal.didFinishLinting(linterE);
    expect(busySignal.provider && busySignal.provider.texts).toEqual([]);
  });
  it('clears everything on dispose', function () {
    var linterA = (0, _helpers.getLinter)();
    busySignal.didBeginLinting(linterA, '/a');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some on /a']);
    busySignal.dispose();
    expect(busySignal.provider && busySignal.provider.texts).toEqual([]);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L3NwZWMvYnVzeS1zaW5nYWwtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OzswQkFFMkIsYUFBYTs7NkJBQ2pCLG9CQUFvQjs7Ozt1QkFDakIsV0FBVzs7SUFFL0IsY0FBYztBQUVQLFdBRlAsY0FBYyxHQUVKOzBCQUZWLGNBQWM7O0FBR2hCLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFBO0dBQ2hCOztlQUpHLGNBQWM7O1dBS2IsaUJBQUc7QUFDTixVQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQTtLQUNoQjs7O1dBQ0UsYUFBQyxJQUFJLEVBQUU7QUFDUixVQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUN0Qjs7O1dBQ1ksa0JBQUc7QUFDZCxVQUFNLFFBQVEsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFBO0FBQ3JDLFdBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUE7QUFDdkMsV0FBSyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtBQUN6QyxhQUFPLFFBQVEsQ0FBQTtLQUNoQjs7O1NBaEJHLGNBQWM7OztBQW1CcEIsUUFBUSxDQUFDLFlBQVksRUFBRSxZQUFXO0FBQ2hDLE1BQUksVUFBVSxZQUFBLENBQUE7O0FBRWQsZ0RBQVcsYUFBaUI7QUFDMUIsVUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3BELGNBQVUsR0FBRyxnQ0FBZ0IsQ0FBQTtBQUM3QixjQUFVLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFBO0dBQ2xDLEVBQUMsQ0FBQTtBQUNGLFdBQVMsQ0FBQyxZQUFXO0FBQ25CLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtHQUNyQixDQUFDLENBQUE7O0FBRUYs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T0FBTyxDQUFDLENBQUE7QUFDcEMsVUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7R0FDckUsQ0FBQyxDQUFBO0FBQ0YsSUFBRSxDQUFDLDhCQUE4QixFQUFFLFlBQVc7QUFDNUMsUUFBTSxPQUFPLEdBQUcseUJBQVcsQ0FBQTtBQUMzQixjQUFVLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUN6QyxVQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUE7QUFDaEYsY0FBVSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3BCLFVBQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0dBQ3JFLENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9zcGVjL2J1c3ktc2luZ2FsLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBiZWZvcmVFYWNoIH0gZnJvbSAnamFzbWluZS1maXgnXG5pbXBvcnQgQnVzeVNpZ25hbCBmcm9tICcuLi9saWIvYnVzeS1zaWduYWwnXG5pbXBvcnQgeyBnZXRMaW50ZXIgfSBmcm9tICcuL2hlbHBlcnMnXG5cbmNsYXNzIFNpZ25hbFJlZ2lzdHJ5IHtcbiAgdGV4dHM6IEFycmF5PHN0cmluZz47XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMudGV4dHMgPSBbXVxuICB9XG4gIGNsZWFyKCkge1xuICAgIHRoaXMudGV4dHMgPSBbXVxuICB9XG4gIGFkZCh0ZXh0KSB7XG4gICAgdGhpcy50ZXh0cy5wdXNoKHRleHQpXG4gIH1cbiAgc3RhdGljIGNyZWF0ZSgpIHtcbiAgICBjb25zdCByZWdpc3RyeSA9IG5ldyBTaWduYWxSZWdpc3RyeSgpXG4gICAgc3B5T24ocmVnaXN0cnksICdhZGQnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgc3B5T24ocmVnaXN0cnksICdjbGVhcicpLmFuZENhbGxUaHJvdWdoKClcbiAgICByZXR1cm4gcmVnaXN0cnlcbiAgfVxufVxuXG5kZXNjcmliZSgnQnVzeVNpZ25hbCcsIGZ1bmN0aW9uKCkge1xuICBsZXQgYnVzeVNpZ25hbFxuXG4gIGJlZm9yZUVhY2goYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgYXdhaXQgYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZSgnbGludGVyLXVpLWRlZmF1bHQnKVxuICAgIGJ1c3lTaWduYWwgPSBuZXcgQnVzeVNpZ25hbCgpXG4gICAgYnVzeVNpZ25hbC5hdHRhY2goU2lnbmFsUmVnaXN0cnkpXG4gIH0pXG4gIGFmdGVyRWFjaChmdW5jdGlvbigpIHtcbiAgICBidXN5U2lnbmFsLmRpc3Bvc2UoKVxuICB9KVxuXG4gIGl0KCd0ZWxscyB0aGUgcmVnaXN0cnkgd2hlbiBsaW50aW5nIGlzIGluIHByb2dyZXNzIHdpdGhvdXQgYWRkaW5nIGR1cGxpY2F0ZXMnLCBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBsaW50ZXJBID0gZ2V0TGludGVyKClcbiAgICBleHBlY3QoYnVzeVNpZ25hbC5wcm92aWRlciAmJiBidXN5U2lnbmFsLnByb3ZpZGVyLnRleHRzKS50b0VxdWFsKFtdKVxuICAgIGJ1c3lTaWduYWwuZGlkQmVnaW5MaW50aW5nKGxpbnRlckEsICcvJylcbiAgICBleHBlY3QoYnVzeVNpZ25hbC5wcm92aWRlciAmJiBidXN5U2lnbmFsLnByb3ZpZGVyLnRleHRzKS50b0VxdWFsKFsnc29tZSBvbiAvJ10pXG4gICAgYnVzeVNpZ25hbC5kaWRGaW5pc2hMaW50aW5nKGxpbnRlckEsICcvJylcbiAgICBidXN5U2lnbmFsLmRpZEZpbmlzaExpbnRpbmcobGludGVyQSwgJy8nKVxuICAgIGV4cGVjdChidXN5U2lnbmFsLnByb3ZpZGVyICYmIGJ1c3lTaWduYWwucHJvdmlkZXIudGV4dHMpLnRvRXF1YWwoW10pXG4gICAgYnVzeVNpZ25hbC5kaWRCZWdpbkxpbnRpbmcobGludGVyQSwgJy8nKVxuICAgIGJ1c3lTaWduYWwuZGlkQmVnaW5MaW50aW5nKGxpbnRlckEsICcvJylcbiAgICBleHBlY3QoYnVzeVNpZ25hbC5wcm92aWRlciAmJiBidXN5U2lnbmFsLnByb3ZpZGVyLnRleHRzKS50b0VxdWFsKFsnc29tZSBvbiAvJ10pXG4gICAgYnVzeVNpZ25hbC5kaWRGaW5pc2hMaW50aW5nKGxpbnRlckEsICcvJylcbiAgICBleHBlY3QoYnVzeVNpZ25hbC5wcm92aWRlciAmJiBidXN5U2lnbmFsLnByb3ZpZGVyLnRleHRzKS50b0VxdWFsKFtdKVxuICB9KVxuICBpdCgnc2hvd3Mgb25lIGxpbmUgcGVyIGZpbGUgYW5kIG9uZSBmb3IgYWxsIHByb2plY3Qgc2NvcGVkIG9uZXMnLCBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBsaW50ZXJBID0gZ2V0TGludGVyKClcbiAgICBjb25zdCBsaW50ZXJCID0gZ2V0TGludGVyKClcbiAgICBjb25zdCBsaW50ZXJDID0gZ2V0TGludGVyKClcbiAgICBjb25zdCBsaW50ZXJEID0gZ2V0TGludGVyKClcbiAgICBjb25zdCBsaW50ZXJFID0gZ2V0TGludGVyKClcbiAgICBidXN5U2lnbmFsLmRpZEJlZ2luTGludGluZyhsaW50ZXJBLCAnL2EnKVxuICAgIGJ1c3lTaWduYWwuZGlkQmVnaW5MaW50aW5nKGxpbnRlckEsICcvYWEnKVxuICAgIGJ1c3lTaWduYWwuZGlkQmVnaW5MaW50aW5nKGxpbnRlckIsICcvYicpXG4gICAgYnVzeVNpZ25hbC5kaWRCZWdpbkxpbnRpbmcobGludGVyQywgJy9iJylcbiAgICBidXN5U2lnbmFsLmRpZEJlZ2luTGludGluZyhsaW50ZXJEKVxuICAgIGJ1c3lTaWduYWwuZGlkQmVnaW5MaW50aW5nKGxpbnRlckUpXG4gICAgZXhwZWN0KGJ1c3lTaWduYWwucHJvdmlkZXIgJiYgYnVzeVNpZ25hbC5wcm92aWRlci50ZXh0cykudG9FcXVhbChbJ3NvbWUgb24gL2EnLCAnc29tZSBvbiAvYWEnLCAnc29tZSwgc29tZSBvbiAvYicsICdzb21lLCBzb21lJ10pXG4gICAgYnVzeVNpZ25hbC5kaWRGaW5pc2hMaW50aW5nKGxpbnRlckEpXG4gICAgZXhwZWN0KGJ1c3lTaWduYWwucHJvdmlkZXIgJiYgYnVzeVNpZ25hbC5wcm92aWRlci50ZXh0cykudG9FcXVhbChbJ3NvbWUgb24gL2EnLCAnc29tZSBvbiAvYWEnLCAnc29tZSwgc29tZSBvbiAvYicsICdzb21lLCBzb21lJ10pXG4gICAgYnVzeVNpZ25hbC5kaWRGaW5pc2hMaW50aW5nKGxpbnRlckEsICcvYScpXG4gICAgZXhwZWN0KGJ1c3lTaWduYWwucHJvdmlkZXIgJiYgYnVzeVNpZ25hbC5wcm92aWRlci50ZXh0cykudG9FcXVhbChbJ3NvbWUgb24gL2FhJywgJ3NvbWUsIHNvbWUgb24gL2InLCAnc29tZSwgc29tZSddKVxuICAgIGJ1c3lTaWduYWwuZGlkRmluaXNoTGludGluZyhsaW50ZXJBLCAnL2FhJylcbiAgICBleHBlY3QoYnVzeVNpZ25hbC5wcm92aWRlciAmJiBidXN5U2lnbmFsLnByb3ZpZGVyLnRleHRzKS50b0VxdWFsKFsnc29tZSwgc29tZSBvbiAvYicsICdzb21lLCBzb21lJ10pXG4gICAgYnVzeVNpZ25hbC5kaWRGaW5pc2hMaW50aW5nKGxpbnRlckIsICcvYicpXG4gICAgZXhwZWN0KGJ1c3lTaWduYWwucHJvdmlkZXIgJiYgYnVzeVNpZ25hbC5wcm92aWRlci50ZXh0cykudG9FcXVhbChbJ3NvbWUgb24gL2InLCAnc29tZSwgc29tZSddKVxuICAgIGJ1c3lTaWduYWwuZGlkRmluaXNoTGludGluZyhsaW50ZXJDLCAnL2InKVxuICAgIGV4cGVjdChidXN5U2lnbmFsLnByb3ZpZGVyICYmIGJ1c3lTaWduYWwucHJvdmlkZXIudGV4dHMpLnRvRXF1YWwoWydzb21lLCBzb21lJ10pXG4gICAgYnVzeVNpZ25hbC5kaWRGaW5pc2hMaW50aW5nKGxpbnRlckQsICcvYicpXG4gICAgZXhwZWN0KGJ1c3lTaWduYWwucHJvdmlkZXIgJiYgYnVzeVNpZ25hbC5wcm92aWRlci50ZXh0cykudG9FcXVhbChbJ3NvbWUsIHNvbWUnXSlcbiAgICBidXN5U2lnbmFsLmRpZEZpbmlzaExpbnRpbmcobGludGVyRClcbiAgICBleHBlY3QoYnVzeVNpZ25hbC5wcm92aWRlciAmJiBidXN5U2lnbmFsLnByb3ZpZGVyLnRleHRzKS50b0VxdWFsKFsnc29tZSddKVxuICAgIGJ1c3lTaWduYWwuZGlkRmluaXNoTGludGluZyhsaW50ZXJFKVxuICAgIGV4cGVjdChidXN5U2lnbmFsLnByb3ZpZGVyICYmIGJ1c3lTaWduYWwucHJvdmlkZXIudGV4dHMpLnRvRXF1YWwoW10pXG4gIH0pXG4gIGl0KCdjbGVhcnMgZXZlcnl0aGluZyBvbiBkaXNwb3NlJywgZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgbGludGVyQSA9IGdldExpbnRlcigpXG4gICAgYnVzeVNpZ25hbC5kaWRCZWdpbkxpbnRpbmcobGludGVyQSwgJy9hJylcbiAgICBleHBlY3QoYnVzeVNpZ25hbC5wcm92aWRlciAmJiBidXN5U2lnbmFsLnByb3ZpZGVyLnRleHRzKS50b0VxdWFsKFsnc29tZSBvbiAvYSddKVxuICAgIGJ1c3lTaWduYWwuZGlzcG9zZSgpXG4gICAgZXhwZWN0KGJ1c3lTaWduYWwucHJvdmlkZXIgJiYgYnVzeVNpZ25hbC5wcm92aWRlci50ZXh0cykudG9FcXVhbChbXSlcbiAgfSlcbn0pXG4iXX0=