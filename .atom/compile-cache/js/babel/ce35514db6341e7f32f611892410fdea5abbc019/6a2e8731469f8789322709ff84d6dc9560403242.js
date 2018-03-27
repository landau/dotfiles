function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libProvider = require('../lib/provider');

var _libProvider2 = _interopRequireDefault(_libProvider);

describe('Provider', function () {
  var provider = undefined;

  beforeEach(function () {
    provider = new _libProvider2['default']();
  });
  afterEach(function () {
    provider.dispose();
  });

  it('emits add event properly', function () {
    var timesTriggered = 0;

    provider.onDidAdd(function (title) {
      if (timesTriggered === 0) {
        expect(title).toBe('First');
      } else if (timesTriggered === 1) {
        expect(title).toBe('Second');
      } else if (timesTriggered === 2) {
        expect(title).toBe('Third');
      } else {
        expect(false).toBe(true);
      }
      timesTriggered++;
    });
    expect(timesTriggered).toBe(0);
    provider.add('First');
    expect(timesTriggered).toBe(1);
    provider.add('Second');
    expect(timesTriggered).toBe(2);
    provider.add('Third');
    expect(timesTriggered).toBe(3);
  });
  it('emits remove event properly', function () {
    var timesTriggered = 0;

    provider.onDidRemove(function (title) {
      if (timesTriggered === 0) {
        expect(title).toBe('First');
      } else if (timesTriggered === 1) {
        expect(title).toBe('Second');
      } else if (timesTriggered === 2) {
        expect(title).toBe('Third');
      } else {
        expect(false).toBe(true);
      }
      timesTriggered++;
    });

    expect(timesTriggered).toBe(0);
    provider.remove('First');
    expect(timesTriggered).toBe(1);
    provider.remove('Second');
    expect(timesTriggered).toBe(2);
    provider.remove('Third');
    expect(timesTriggered).toBe(3);
  });
  it('emits clear event properly', function () {
    var timesTriggered = 0;

    provider.onDidClear(function () {
      timesTriggered++;
    });

    expect(timesTriggered).toBe(0);
    provider.clear();
    expect(timesTriggered).toBe(1);
    provider.clear();
    expect(timesTriggered).toBe(2);
    provider.clear();
    expect(timesTriggered).toBe(3);
    provider.clear();
    expect(timesTriggered).toBe(4);
  });
  it('emits destroy event properly', function () {
    var timesTriggered = 0;

    provider.onDidDispose(function () {
      timesTriggered++;
    });

    expect(timesTriggered).toBe(0);
    provider.dispose();
    expect(timesTriggered).toBe(1);
    provider.dispose();
    expect(timesTriggered).toBe(1);
    provider.dispose();
    expect(timesTriggered).toBe(1);
    provider.dispose();
    expect(timesTriggered).toBe(1);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2J1c3ktc2lnbmFsL3NwZWMvcHJvdmlkZXItc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzsyQkFFcUIsaUJBQWlCOzs7O0FBRXRDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsWUFBVztBQUM5QixNQUFJLFFBQVEsWUFBQSxDQUFBOztBQUVaLFlBQVUsQ0FBQyxZQUFXO0FBQ3BCLFlBQVEsR0FBRyw4QkFBYyxDQUFBO0dBQzFCLENBQUMsQ0FBQTtBQUNGLFdBQVMsQ0FBQyxZQUFXO0FBQ25CLFlBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtHQUNuQixDQUFDLENBQUE7O0FBRUYsSUFBRSxDQUFDLDBCQUEwQixFQUFFLFlBQVc7QUFDeEMsUUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFBOztBQUV0QixZQUFRLENBQUMsUUFBUSxDQUFDLFVBQVMsS0FBSyxFQUFFO0FBQ2hDLFVBQUksY0FBYyxLQUFLLENBQUMsRUFBRTtBQUN4QixjQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO09BQzVCLE1BQU0sSUFBSSxjQUFjLEtBQUssQ0FBQyxFQUFFO0FBQy9CLGNBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7T0FDN0IsTUFBTSxJQUFJLGNBQWMsS0FBSyxDQUFDLEVBQUU7QUFDL0IsY0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtPQUM1QixNQUFNO0FBQ0wsY0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtPQUN6QjtBQUNELG9CQUFjLEVBQUUsQ0FBQTtLQUNqQixDQUFDLENBQUE7QUFDRixVQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzlCLFlBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENB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QUE7O0FBRUYsVUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM5QixZQUFRLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDbEIsVUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM5QixZQUFRLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDbEIsVUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM5QixZQUFRLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDbEIsVUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM5QixZQUFRLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDbEIsVUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUMvQixDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYnVzeS1zaWduYWwvc3BlYy9wcm92aWRlci1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFByb3ZpZGVyIGZyb20gJy4uL2xpYi9wcm92aWRlcidcblxuZGVzY3JpYmUoJ1Byb3ZpZGVyJywgZnVuY3Rpb24oKSB7XG4gIGxldCBwcm92aWRlclxuXG4gIGJlZm9yZUVhY2goZnVuY3Rpb24oKSB7XG4gICAgcHJvdmlkZXIgPSBuZXcgUHJvdmlkZXIoKVxuICB9KVxuICBhZnRlckVhY2goZnVuY3Rpb24oKSB7XG4gICAgcHJvdmlkZXIuZGlzcG9zZSgpXG4gIH0pXG5cbiAgaXQoJ2VtaXRzIGFkZCBldmVudCBwcm9wZXJseScsIGZ1bmN0aW9uKCkge1xuICAgIGxldCB0aW1lc1RyaWdnZXJlZCA9IDBcblxuICAgIHByb3ZpZGVyLm9uRGlkQWRkKGZ1bmN0aW9uKHRpdGxlKSB7XG4gICAgICBpZiAodGltZXNUcmlnZ2VyZWQgPT09IDApIHtcbiAgICAgICAgZXhwZWN0KHRpdGxlKS50b0JlKCdGaXJzdCcpXG4gICAgICB9IGVsc2UgaWYgKHRpbWVzVHJpZ2dlcmVkID09PSAxKSB7XG4gICAgICAgIGV4cGVjdCh0aXRsZSkudG9CZSgnU2Vjb25kJylcbiAgICAgIH0gZWxzZSBpZiAodGltZXNUcmlnZ2VyZWQgPT09IDIpIHtcbiAgICAgICAgZXhwZWN0KHRpdGxlKS50b0JlKCdUaGlyZCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBleHBlY3QoZmFsc2UpLnRvQmUodHJ1ZSlcbiAgICAgIH1cbiAgICAgIHRpbWVzVHJpZ2dlcmVkKytcbiAgICB9KVxuICAgIGV4cGVjdCh0aW1lc1RyaWdnZXJlZCkudG9CZSgwKVxuICAgIHByb3ZpZGVyLmFkZCgnRmlyc3QnKVxuICAgIGV4cGVjdCh0aW1lc1RyaWdnZXJlZCkudG9CZSgxKVxuICAgIHByb3ZpZGVyLmFkZCgnU2Vjb25kJylcbiAgICBleHBlY3QodGltZXNUcmlnZ2VyZWQpLnRvQmUoMilcbiAgICBwcm92aWRlci5hZGQoJ1RoaXJkJylcbiAgICBleHBlY3QodGltZXNUcmlnZ2VyZWQpLnRvQmUoMylcbiAgfSlcbiAgaXQoJ2VtaXRzIHJlbW92ZSBldmVudCBwcm9wZXJseScsIGZ1bmN0aW9uKCkge1xuICAgIGxldCB0aW1lc1RyaWdnZXJlZCA9IDBcblxuICAgIHByb3ZpZGVyLm9uRGlkUmVtb3ZlKGZ1bmN0aW9uKHRpdGxlKSB7XG4gICAgICBpZiAodGltZXNUcmlnZ2VyZWQgPT09IDApIHtcbiAgICAgICAgZXhwZWN0KHRpdGxlKS50b0JlKCdGaXJzdCcpXG4gICAgICB9IGVsc2UgaWYgKHRpbWVzVHJpZ2dlcmVkID09PSAxKSB7XG4gICAgICAgIGV4cGVjdCh0aXRsZSkudG9CZSgnU2Vjb25kJylcbiAgICAgIH0gZWxzZSBpZiAodGltZXNUcmlnZ2VyZWQgPT09IDIpIHtcbiAgICAgICAgZXhwZWN0KHRpdGxlKS50b0JlKCdUaGlyZCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBleHBlY3QoZmFsc2UpLnRvQmUodHJ1ZSlcbiAgICAgIH1cbiAgICAgIHRpbWVzVHJpZ2dlcmVkKytcbiAgICB9KVxuXG4gICAgZXhwZWN0KHRpbWVzVHJpZ2dlcmVkKS50b0JlKDApXG4gICAgcHJvdmlkZXIucmVtb3ZlKCdGaXJzdCcpXG4gICAgZXhwZWN0KHRpbWVzVHJpZ2dlcmVkKS50b0JlKDEpXG4gICAgcHJvdmlkZXIucmVtb3ZlKCdTZWNvbmQnKVxuICAgIGV4cGVjdCh0aW1lc1RyaWdnZXJlZCkudG9CZSgyKVxuICAgIHByb3ZpZGVyLnJlbW92ZSgnVGhpcmQnKVxuICAgIGV4cGVjdCh0aW1lc1RyaWdnZXJlZCkudG9CZSgzKVxuICB9KVxuICBpdCgnZW1pdHMgY2xlYXIgZXZlbnQgcHJvcGVybHknLCBmdW5jdGlvbigpIHtcbiAgICBsZXQgdGltZXNUcmlnZ2VyZWQgPSAwXG5cbiAgICBwcm92aWRlci5vbkRpZENsZWFyKGZ1bmN0aW9uKCkge1xuICAgICAgdGltZXNUcmlnZ2VyZWQrK1xuICAgIH0pXG5cbiAgICBleHBlY3QodGltZXNUcmlnZ2VyZWQpLnRvQmUoMClcbiAgICBwcm92aWRlci5jbGVhcigpXG4gICAgZXhwZWN0KHRpbWVzVHJpZ2dlcmVkKS50b0JlKDEpXG4gICAgcHJvdmlkZXIuY2xlYXIoKVxuICAgIGV4cGVjdCh0aW1lc1RyaWdnZXJlZCkudG9CZSgyKVxuICAgIHByb3ZpZGVyLmNsZWFyKClcbiAgICBleHBlY3QodGltZXNUcmlnZ2VyZWQpLnRvQmUoMylcbiAgICBwcm92aWRlci5jbGVhcigpXG4gICAgZXhwZWN0KHRpbWVzVHJpZ2dlcmVkKS50b0JlKDQpXG4gIH0pXG4gIGl0KCdlbWl0cyBkZXN0cm95IGV2ZW50IHByb3Blcmx5JywgZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRpbWVzVHJpZ2dlcmVkID0gMFxuXG4gICAgcHJvdmlkZXIub25EaWREaXNwb3NlKGZ1bmN0aW9uKCkge1xuICAgICAgdGltZXNUcmlnZ2VyZWQrK1xuICAgIH0pXG5cbiAgICBleHBlY3QodGltZXNUcmlnZ2VyZWQpLnRvQmUoMClcbiAgICBwcm92aWRlci5kaXNwb3NlKClcbiAgICBleHBlY3QodGltZXNUcmlnZ2VyZWQpLnRvQmUoMSlcbiAgICBwcm92aWRlci5kaXNwb3NlKClcbiAgICBleHBlY3QodGltZXNUcmlnZ2VyZWQpLnRvQmUoMSlcbiAgICBwcm92aWRlci5kaXNwb3NlKClcbiAgICBleHBlY3QodGltZXNUcmlnZ2VyZWQpLnRvQmUoMSlcbiAgICBwcm92aWRlci5kaXNwb3NlKClcbiAgICBleHBlY3QodGltZXNUcmlnZ2VyZWQpLnRvQmUoMSlcbiAgfSlcbn0pXG4iXX0=