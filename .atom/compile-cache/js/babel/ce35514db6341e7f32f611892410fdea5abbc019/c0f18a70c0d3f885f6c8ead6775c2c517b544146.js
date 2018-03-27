Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

// Greets

var _greetV2Welcome = require('./greet-v2-welcome');

var _greetV2Welcome2 = _interopRequireDefault(_greetV2Welcome);

// Note: This package should not be used from "Main" class,
// Instead it should be used from the main package entry point directly

var Greeter = (function () {
  function Greeter() {
    _classCallCheck(this, Greeter);

    this.notifications = new Set();
  }

  _createClass(Greeter, [{
    key: 'showWelcome',
    value: function showWelcome() {
      (0, _greetV2Welcome2['default'])();
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.notifications.forEach(function (n) {
        return n.dismiss();
      });
      this.notifications.clear();
    }
  }]);

  return Greeter;
})();

exports['default'] = Greeter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvZ3JlZXRlci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OEJBRzJCLG9CQUFvQjs7Ozs7OztJQUsxQixPQUFPO0FBRWYsV0FGUSxPQUFPLEdBRVo7MEJBRkssT0FBTzs7QUFHeEIsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0dBQy9COztlQUprQixPQUFPOztXQUtmLHVCQUFTO0FBQ2xCLHdDQUFnQixDQUFBO0tBQ2pCOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztlQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUU7T0FBQSxDQUFDLENBQUE7QUFDNUMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtLQUMzQjs7O1NBWGtCLE9BQU87OztxQkFBUCxPQUFPIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvZ3JlZXRlci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbi8vIEdyZWV0c1xuaW1wb3J0IGdyZWV0VjJXZWxjb21lIGZyb20gJy4vZ3JlZXQtdjItd2VsY29tZSdcblxuXG4vLyBOb3RlOiBUaGlzIHBhY2thZ2Ugc2hvdWxkIG5vdCBiZSB1c2VkIGZyb20gXCJNYWluXCIgY2xhc3MsXG4vLyBJbnN0ZWFkIGl0IHNob3VsZCBiZSB1c2VkIGZyb20gdGhlIG1haW4gcGFja2FnZSBlbnRyeSBwb2ludCBkaXJlY3RseVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JlZXRlciB7XG4gIG5vdGlmaWNhdGlvbnM6IFNldDxPYmplY3Q+O1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm5vdGlmaWNhdGlvbnMgPSBuZXcgU2V0KClcbiAgfVxuICBzaG93V2VsY29tZSgpOiB2b2lkIHtcbiAgICBncmVldFYyV2VsY29tZSgpXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLm5vdGlmaWNhdGlvbnMuZm9yRWFjaChuID0+IG4uZGlzbWlzcygpKVxuICAgIHRoaXMubm90aWZpY2F0aW9ucy5jbGVhcigpXG4gIH1cbn1cbiJdfQ==