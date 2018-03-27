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
      this.texts.splice(0);
    }
  }, {
    key: 'add',
    value: function add(text) {
      if (this.texts.includes(text)) {
        throw new TypeError('\'' + text + '\' already added');
      }
      this.texts.push(text);
    }
  }, {
    key: 'remove',
    value: function remove(text) {
      var index = this.texts.indexOf(text);
      if (index !== -1) {
        this.texts.splice(index, 1);
      }
    }
  }], [{
    key: 'create',
    value: function create() {
      var registry = new SignalRegistry();
      spyOn(registry, 'add').andCallThrough();
      spyOn(registry, 'remove').andCallThrough();
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
    var texts = busySignal.provider && busySignal.provider.texts;
    expect(texts).toEqual([]);
    busySignal.didBeginLinting(linterA, '/');
    expect(texts).toEqual(['some on /']);
    busySignal.didFinishLinting(linterA, '/');
    busySignal.didFinishLinting(linterA, '/');
    expect(texts).toEqual([]);
    busySignal.didBeginLinting(linterA, '/');
    busySignal.didBeginLinting(linterA, '/');
    expect(texts).toEqual(['some on /']);
    busySignal.didFinishLinting(linterA, '/');
    expect(texts).toEqual([]);
  });
  it('shows one line per file and one for all project scoped ones', function () {
    var linterA = (0, _helpers.getLinter)('A');
    var linterB = (0, _helpers.getLinter)('B');
    var linterC = (0, _helpers.getLinter)('C');
    var linterD = (0, _helpers.getLinter)('D');
    var linterE = (0, _helpers.getLinter)('E');
    busySignal.didBeginLinting(linterA, '/a');
    busySignal.didBeginLinting(linterA, '/aa');
    busySignal.didBeginLinting(linterB, '/b');
    busySignal.didBeginLinting(linterC, '/b');
    busySignal.didBeginLinting(linterD);
    busySignal.didBeginLinting(linterE);
    var texts = busySignal.provider && busySignal.provider.texts;
    // Test initial state
    expect(texts).toEqual(['A on /a', 'A on /aa', 'B on /b', 'C on /b', 'D', 'E']);
    // Test finish event for no file for a linter
    busySignal.didFinishLinting(linterA);
    expect(texts).toEqual(['A on /a', 'A on /aa', 'B on /b', 'C on /b', 'D', 'E']);
    // Test finish of a single file of a linter with two files running
    busySignal.didFinishLinting(linterA, '/a');
    expect(texts).toEqual(['A on /aa', 'B on /b', 'C on /b', 'D', 'E']);
    // Test finish of the last remaining file for linterA
    busySignal.didFinishLinting(linterA, '/aa');
    expect(texts).toEqual(['B on /b', 'C on /b', 'D', 'E']);
    // Test finish of first linter of two running on '/b'
    busySignal.didFinishLinting(linterB, '/b');
    expect(texts).toEqual(['C on /b', 'D', 'E']);
    // Test finish of second (last) linter running on '/b'
    busySignal.didFinishLinting(linterC, '/b');
    expect(texts).toEqual(['D', 'E']);
    // Test finish even for an unkown file for a linter
    busySignal.didFinishLinting(linterD, '/b');
    expect(texts).toEqual(['D', 'E']);
    // Test finishing a project linter (no file)
    busySignal.didFinishLinting(linterD);
    expect(texts).toEqual(['E']);
    // Test finishing the last linter
    busySignal.didFinishLinting(linterE);
    expect(texts).toEqual([]);
  });
  it('clears everything on dispose', function () {
    var linterA = (0, _helpers.getLinter)();
    busySignal.didBeginLinting(linterA, '/a');
    var texts = busySignal.provider && busySignal.provider.texts;
    expect(texts).toEqual(['some on /a']);
    busySignal.dispose();
    expect(texts).toEqual([]);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L3NwZWMvYnVzeS1zaW5nYWwtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OzswQkFFMkIsYUFBYTs7NkJBQ2pCLG9CQUFvQjs7Ozt1QkFDakIsV0FBVzs7SUFFL0IsY0FBYztBQUVQLFdBRlAsY0FBYyxHQUVKOzBCQUZWLGNBQWM7O0FBR2hCLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFBO0dBQ2hCOztlQUpHLGNBQWM7O1dBS2IsaUJBQUc7QUFDTixVQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNyQjs7O1dBQ0UsYUFBQyxJQUFJLEVBQUU7QUFDUixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzdCLGNBQU0sSUFBSSxTQUFTLFFBQUssSUFBSSxzQkFBa0IsQ0FBQTtPQUMvQztBQUNELFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQ3RCOzs7V0FDSyxnQkFBQyxJQUFJLEVBQUU7QUFDWCxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN0QyxVQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNoQixZQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUE7T0FDNUI7S0FDRjs7O1dBQ1ksa0JBQUc7QUFDZCxVQUFNLFFBQVEsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFBO0FBQ3JDLFdBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUE7QUFDdkMsV0FBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtBQUMxQyxXQUFLLENBQUMsUUFB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Q0FBQyxDQUFDLENBQUE7O0FBRWpDLGNBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNwQyxVQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTs7QUFFNUIsY0FBVSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLFVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7R0FDMUIsQ0FBQyxDQUFBO0FBQ0YsSUFBRSxDQUFDLDhCQUE4QixFQUFFLFlBQVc7QUFDNUMsUUFBTSxPQUFPLEdBQUcseUJBQVcsQ0FBQTtBQUMzQixjQUFVLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUN6QyxRQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsUUFBUSxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFBO0FBQzlELFVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFBO0FBQ3JDLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUNwQixVQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0dBQzFCLENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9zcGVjL2J1c3ktc2luZ2FsLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBiZWZvcmVFYWNoIH0gZnJvbSAnamFzbWluZS1maXgnXG5pbXBvcnQgQnVzeVNpZ25hbCBmcm9tICcuLi9saWIvYnVzeS1zaWduYWwnXG5pbXBvcnQgeyBnZXRMaW50ZXIgfSBmcm9tICcuL2hlbHBlcnMnXG5cbmNsYXNzIFNpZ25hbFJlZ2lzdHJ5IHtcbiAgdGV4dHM6IEFycmF5PHN0cmluZz47XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMudGV4dHMgPSBbXVxuICB9XG4gIGNsZWFyKCkge1xuICAgIHRoaXMudGV4dHMuc3BsaWNlKDApXG4gIH1cbiAgYWRkKHRleHQpIHtcbiAgICBpZiAodGhpcy50ZXh0cy5pbmNsdWRlcyh0ZXh0KSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgJyR7dGV4dH0nIGFscmVhZHkgYWRkZWRgKVxuICAgIH1cbiAgICB0aGlzLnRleHRzLnB1c2godGV4dClcbiAgfVxuICByZW1vdmUodGV4dCkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy50ZXh0cy5pbmRleE9mKHRleHQpXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgdGhpcy50ZXh0cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgfVxuICB9XG4gIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgY29uc3QgcmVnaXN0cnkgPSBuZXcgU2lnbmFsUmVnaXN0cnkoKVxuICAgIHNweU9uKHJlZ2lzdHJ5LCAnYWRkJykuYW5kQ2FsbFRocm91Z2goKVxuICAgIHNweU9uKHJlZ2lzdHJ5LCAncmVtb3ZlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgIHNweU9uKHJlZ2lzdHJ5LCAnY2xlYXInKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgcmV0dXJuIHJlZ2lzdHJ5XG4gIH1cbn1cblxuZGVzY3JpYmUoJ0J1c3lTaWduYWwnLCBmdW5jdGlvbigpIHtcbiAgbGV0IGJ1c3lTaWduYWxcblxuICBiZWZvcmVFYWNoKGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgIGF3YWl0IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoJ2xpbnRlci11aS1kZWZhdWx0JylcbiAgICBidXN5U2lnbmFsID0gbmV3IEJ1c3lTaWduYWwoKVxuICAgIGJ1c3lTaWduYWwuYXR0YWNoKFNpZ25hbFJlZ2lzdHJ5KVxuICB9KVxuICBhZnRlckVhY2goZnVuY3Rpb24oKSB7XG4gICAgYnVzeVNpZ25hbC5kaXNwb3NlKClcbiAgfSlcblxuICBpdCgndGVsbHMgdGhlIHJlZ2lzdHJ5IHdoZW4gbGludGluZyBpcyBpbiBwcm9ncmVzcyB3aXRob3V0IGFkZGluZyBkdXBsaWNhdGVzJywgZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgbGludGVyQSA9IGdldExpbnRlcigpXG4gICAgY29uc3QgdGV4dHMgPSBidXN5U2lnbmFsLnByb3ZpZGVyICYmIGJ1c3lTaWduYWwucHJvdmlkZXIudGV4dHNcbiAgICBleHBlY3QodGV4dHMpLnRvRXF1YWwoW10pXG4gICAgYnVzeVNpZ25hbC5kaWRCZWdpbkxpbnRpbmcobGludGVyQSwgJy8nKVxuICAgIGV4cGVjdCh0ZXh0cykudG9FcXVhbChbJ3NvbWUgb24gLyddKVxuICAgIGJ1c3lTaWduYWwuZGlkRmluaXNoTGludGluZyhsaW50ZXJBLCAnLycpXG4gICAgYnVzeVNpZ25hbC5kaWRGaW5pc2hMaW50aW5nKGxpbnRlckEsICcvJylcbiAgICBleHBlY3QodGV4dHMpLnRvRXF1YWwoW10pXG4gICAgYnVzeVNpZ25hbC5kaWRCZWdpbkxpbnRpbmcobGludGVyQSwgJy8nKVxuICAgIGJ1c3lTaWduYWwuZGlkQmVnaW5MaW50aW5nKGxpbnRlckEsICcvJylcbiAgICBleHBlY3QodGV4dHMpLnRvRXF1YWwoWydzb21lIG9uIC8nXSlcbiAgICBidXN5U2lnbmFsLmRpZEZpbmlzaExpbnRpbmcobGludGVyQSwgJy8nKVxuICAgIGV4cGVjdCh0ZXh0cykudG9FcXVhbChbXSlcbiAgfSlcbiAgaXQoJ3Nob3dzIG9uZSBsaW5lIHBlciBmaWxlIGFuZCBvbmUgZm9yIGFsbCBwcm9qZWN0IHNjb3BlZCBvbmVzJywgZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgbGludGVyQSA9IGdldExpbnRlcignQScpXG4gICAgY29uc3QgbGludGVyQiA9IGdldExpbnRlcignQicpXG4gICAgY29uc3QgbGludGVyQyA9IGdldExpbnRlcignQycpXG4gICAgY29uc3QgbGludGVyRCA9IGdldExpbnRlcignRCcpXG4gICAgY29uc3QgbGludGVyRSA9IGdldExpbnRlcignRScpXG4gICAgYnVzeVNpZ25hbC5kaWRCZWdpbkxpbnRpbmcobGludGVyQSwgJy9hJylcbiAgICBidXN5U2lnbmFsLmRpZEJlZ2luTGludGluZyhsaW50ZXJBLCAnL2FhJylcbiAgICBidXN5U2lnbmFsLmRpZEJlZ2luTGludGluZyhsaW50ZXJCLCAnL2InKVxuICAgIGJ1c3lTaWduYWwuZGlkQmVnaW5MaW50aW5nKGxpbnRlckMsICcvYicpXG4gICAgYnVzeVNpZ25hbC5kaWRCZWdpbkxpbnRpbmcobGludGVyRClcbiAgICBidXN5U2lnbmFsLmRpZEJlZ2luTGludGluZyhsaW50ZXJFKVxuICAgIGNvbnN0IHRleHRzID0gYnVzeVNpZ25hbC5wcm92aWRlciAmJiBidXN5U2lnbmFsLnByb3ZpZGVyLnRleHRzXG4gICAgLy8gVGVzdCBpbml0aWFsIHN0YXRlXG4gICAgZXhwZWN0KHRleHRzKS50b0VxdWFsKFsnQSBvbiAvYScsICdBIG9uIC9hYScsICdCIG9uIC9iJywgJ0Mgb24gL2InLCAnRCcsICdFJ10pXG4gICAgLy8gVGVzdCBmaW5pc2ggZXZlbnQgZm9yIG5vIGZpbGUgZm9yIGEgbGludGVyXG4gICAgYnVzeVNpZ25hbC5kaWRGaW5pc2hMaW50aW5nKGxpbnRlckEpXG4gICAgZXhwZWN0KHRleHRzKS50b0VxdWFsKFsnQSBvbiAvYScsICdBIG9uIC9hYScsICdCIG9uIC9iJywgJ0Mgb24gL2InLCAnRCcsICdFJ10pXG4gICAgLy8gVGVzdCBmaW5pc2ggb2YgYSBzaW5nbGUgZmlsZSBvZiBhIGxpbnRlciB3aXRoIHR3byBmaWxlcyBydW5uaW5nXG4gICAgYnVzeVNpZ25hbC5kaWRGaW5pc2hMaW50aW5nKGxpbnRlckEsICcvYScpXG4gICAgZXhwZWN0KHRleHRzKS50b0VxdWFsKFsnQSBvbiAvYWEnLCAnQiBvbiAvYicsICdDIG9uIC9iJywgJ0QnLCAnRSddKVxuICAgIC8vIFRlc3QgZmluaXNoIG9mIHRoZSBsYXN0IHJlbWFpbmluZyBmaWxlIGZvciBsaW50ZXJBXG4gICAgYnVzeVNpZ25hbC5kaWRGaW5pc2hMaW50aW5nKGxpbnRlckEsICcvYWEnKVxuICAgIGV4cGVjdCh0ZXh0cykudG9FcXVhbChbJ0Igb24gL2InLCAnQyBvbiAvYicsICdEJywgJ0UnXSlcbiAgICAvLyBUZXN0IGZpbmlzaCBvZiBmaXJzdCBsaW50ZXIgb2YgdHdvIHJ1bm5pbmcgb24gJy9iJ1xuICAgIGJ1c3lTaWduYWwuZGlkRmluaXNoTGludGluZyhsaW50ZXJCLCAnL2InKVxuICAgIGV4cGVjdCh0ZXh0cykudG9FcXVhbChbJ0Mgb24gL2InLCAnRCcsICdFJ10pXG4gICAgLy8gVGVzdCBmaW5pc2ggb2Ygc2Vjb25kIChsYXN0KSBsaW50ZXIgcnVubmluZyBvbiAnL2InXG4gICAgYnVzeVNpZ25hbC5kaWRGaW5pc2hMaW50aW5nKGxpbnRlckMsICcvYicpXG4gICAgZXhwZWN0KHRleHRzKS50b0VxdWFsKFsnRCcsICdFJ10pXG4gICAgLy8gVGVzdCBmaW5pc2ggZXZlbiBmb3IgYW4gdW5rb3duIGZpbGUgZm9yIGEgbGludGVyXG4gICAgYnVzeVNpZ25hbC5kaWRGaW5pc2hMaW50aW5nKGxpbnRlckQsICcvYicpXG4gICAgZXhwZWN0KHRleHRzKS50b0VxdWFsKFsnRCcsICdFJ10pXG4gICAgLy8gVGVzdCBmaW5pc2hpbmcgYSBwcm9qZWN0IGxpbnRlciAobm8gZmlsZSlcbiAgICBidXN5U2lnbmFsLmRpZEZpbmlzaExpbnRpbmcobGludGVyRClcbiAgICBleHBlY3QodGV4dHMpLnRvRXF1YWwoWydFJ10pXG4gICAgLy8gVGVzdCBmaW5pc2hpbmcgdGhlIGxhc3QgbGludGVyXG4gICAgYnVzeVNpZ25hbC5kaWRGaW5pc2hMaW50aW5nKGxpbnRlckUpXG4gICAgZXhwZWN0KHRleHRzKS50b0VxdWFsKFtdKVxuICB9KVxuICBpdCgnY2xlYXJzIGV2ZXJ5dGhpbmcgb24gZGlzcG9zZScsIGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IGxpbnRlckEgPSBnZXRMaW50ZXIoKVxuICAgIGJ1c3lTaWduYWwuZGlkQmVnaW5MaW50aW5nKGxpbnRlckEsICcvYScpXG4gICAgY29uc3QgdGV4dHMgPSBidXN5U2lnbmFsLnByb3ZpZGVyICYmIGJ1c3lTaWduYWwucHJvdmlkZXIudGV4dHNcbiAgICBleHBlY3QodGV4dHMpLnRvRXF1YWwoWydzb21lIG9uIC9hJ10pXG4gICAgYnVzeVNpZ25hbC5kaXNwb3NlKClcbiAgICBleHBlY3QodGV4dHMpLnRvRXF1YWwoW10pXG4gIH0pXG59KVxuIl19