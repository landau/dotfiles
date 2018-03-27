function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libMain = require('../lib/main');

var _libMain2 = _interopRequireDefault(_libMain);

var _common = require('./common');

describe('Atom Linter', function () {
  var atomLinter = undefined;

  beforeEach(function () {
    atomLinter = new _libMain2['default']();
  });
  afterEach(function () {
    atomLinter.dispose();
  });

  it('feeds old messages to newly added ui providers', function () {
    var patchCalled = 0;

    var message = (0, _common.getMessage)(true);
    var uiProvider = {
      name: 'test',
      didBeginLinting: function didBeginLinting() {},
      didFinishLinting: function didFinishLinting() {},
      render: function render(patch) {
        expect(patch.added).toEqual([message]);
        expect(patch.messages).toEqual([message]);
        expect(patch.removed).toEqual([]);
        patchCalled++;
      },
      dispose: function dispose() {}
    };
    // Force the MessageRegistry to initialze, note that this is handled under
    // normal usage!
    atomLinter.registryMessagesInit();
    atomLinter.registryMessages.messages.push(message);
    atomLinter.addUI(uiProvider);
    expect(patchCalled).toBe(1);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9zcGVjL21haW4tc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzt1QkFFdUIsYUFBYTs7OztzQkFDVCxVQUFVOztBQUVyQyxRQUFRLENBQUMsYUFBYSxFQUFFLFlBQVc7QUFDakMsTUFBSSxVQUFVLFlBQUEsQ0FBQTs7QUFFZCxZQUFVLENBQUMsWUFBVztBQUNwQixjQUFVLEdBQUcsMEJBQWdCLENBQUE7R0FDOUIsQ0FBQyxDQUFBO0FBQ0YsV0FBUyxDQUFDLFlBQVc7QUFDbkIsY0FBVSxDQUFDLE9BQU8sRUFBRSxDQUFBO0dBQ3JCLENBQUMsQ0FBQTs7QUFFRixJQUFFLENBQUMsZ0RBQWdELEVBQUUsWUFBVztBQUM5RCxRQUFJLFdBQVcsR0FBRyxDQUFDLENBQUE7O0FBRW5CLFFBQU0sT0FBTyxHQUFHLHdCQUFXLElBQUksQ0FBQyxDQUFBO0FBQ2hDLFFBQU0sVUFBVSxHQUFHO0FBQ2pCLFVBQUksRUFBRSxNQUFNO0FBQ1oscUJBQWUsRUFBQSwyQkFBRyxFQUFFO0FBQ3BCLHNCQUFnQixFQUFBLDRCQUFHLEVBQUU7QUFDckIsWUFBTSxFQUFBLGdCQUFDLEtBQUssRUFBRTtBQUNaLGNBQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN0QyxjQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDekMsY0FBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDakMsbUJBQVcsRUFBRSxDQUFBO09BQ2Q7QUFDRCxhQUFPLEVBQUEsbUJBQUcsRUFBRTtLQUNiLENBQUE7OztBQUdELGNBQVUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFBO0FBQ2pDLGNBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ2xELGNBQVUsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDNUIsVUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUM1QixDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvbWFpbi1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IEF0b21MaW50ZXIgZnJvbSAnLi4vbGliL21haW4nXG5pbXBvcnQgeyBnZXRNZXNzYWdlIH0gZnJvbSAnLi9jb21tb24nXG5cbmRlc2NyaWJlKCdBdG9tIExpbnRlcicsIGZ1bmN0aW9uKCkge1xuICBsZXQgYXRvbUxpbnRlclxuXG4gIGJlZm9yZUVhY2goZnVuY3Rpb24oKSB7XG4gICAgYXRvbUxpbnRlciA9IG5ldyBBdG9tTGludGVyKClcbiAgfSlcbiAgYWZ0ZXJFYWNoKGZ1bmN0aW9uKCkge1xuICAgIGF0b21MaW50ZXIuZGlzcG9zZSgpXG4gIH0pXG5cbiAgaXQoJ2ZlZWRzIG9sZCBtZXNzYWdlcyB0byBuZXdseSBhZGRlZCB1aSBwcm92aWRlcnMnLCBmdW5jdGlvbigpIHtcbiAgICBsZXQgcGF0Y2hDYWxsZWQgPSAwXG5cbiAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZSh0cnVlKVxuICAgIGNvbnN0IHVpUHJvdmlkZXIgPSB7XG4gICAgICBuYW1lOiAndGVzdCcsXG4gICAgICBkaWRCZWdpbkxpbnRpbmcoKSB7fSxcbiAgICAgIGRpZEZpbmlzaExpbnRpbmcoKSB7fSxcbiAgICAgIHJlbmRlcihwYXRjaCkge1xuICAgICAgICBleHBlY3QocGF0Y2guYWRkZWQpLnRvRXF1YWwoW21lc3NhZ2VdKVxuICAgICAgICBleHBlY3QocGF0Y2gubWVzc2FnZXMpLnRvRXF1YWwoW21lc3NhZ2VdKVxuICAgICAgICBleHBlY3QocGF0Y2gucmVtb3ZlZCkudG9FcXVhbChbXSlcbiAgICAgICAgcGF0Y2hDYWxsZWQrK1xuICAgICAgfSxcbiAgICAgIGRpc3Bvc2UoKSB7fSxcbiAgICB9XG4gICAgLy8gRm9yY2UgdGhlIE1lc3NhZ2VSZWdpc3RyeSB0byBpbml0aWFsemUsIG5vdGUgdGhhdCB0aGlzIGlzIGhhbmRsZWQgdW5kZXJcbiAgICAvLyBub3JtYWwgdXNhZ2UhXG4gICAgYXRvbUxpbnRlci5yZWdpc3RyeU1lc3NhZ2VzSW5pdCgpXG4gICAgYXRvbUxpbnRlci5yZWdpc3RyeU1lc3NhZ2VzLm1lc3NhZ2VzLnB1c2gobWVzc2FnZSlcbiAgICBhdG9tTGludGVyLmFkZFVJKHVpUHJvdmlkZXIpXG4gICAgZXhwZWN0KHBhdGNoQ2FsbGVkKS50b0JlKDEpXG4gIH0pXG59KVxuIl19