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
      var _this = this;

      var notification = (0, _greetV2Welcome2['default'])();
      notification.onDidDismiss(function () {
        return _this.notifications['delete'](notification);
      });
      this.notifications.add(notification);
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

module.exports = Greeter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvZ3JlZXRlci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs4QkFHMkIsb0JBQW9COzs7Ozs7O0lBSXpDLE9BQU87QUFFQSxXQUZQLE9BQU8sR0FFRzswQkFGVixPQUFPOztBQUdULFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtHQUMvQjs7ZUFKRyxPQUFPOztXQUtBLHVCQUFTOzs7QUFDbEIsVUFBTSxZQUFZLEdBQUcsa0NBQWdCLENBQUE7QUFDckMsa0JBQVksQ0FBQyxZQUFZLENBQUM7ZUFBTSxNQUFLLGFBQWEsVUFBTyxDQUFDLFlBQVksQ0FBQztPQUFBLENBQUMsQ0FBQTtBQUN4RSxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQTtLQUNyQzs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7ZUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFO09BQUEsQ0FBQyxDQUFBO0FBQzVDLFVBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUE7S0FDM0I7OztTQWJHLE9BQU87OztBQWdCYixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2dyZWV0ZXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG4vLyBHcmVldHNcbmltcG9ydCBncmVldFYyV2VsY29tZSBmcm9tICcuL2dyZWV0LXYyLXdlbGNvbWUnXG5cbi8vIE5vdGU6IFRoaXMgcGFja2FnZSBzaG91bGQgbm90IGJlIHVzZWQgZnJvbSBcIk1haW5cIiBjbGFzcyxcbi8vIEluc3RlYWQgaXQgc2hvdWxkIGJlIHVzZWQgZnJvbSB0aGUgbWFpbiBwYWNrYWdlIGVudHJ5IHBvaW50IGRpcmVjdGx5XG5jbGFzcyBHcmVldGVyIHtcbiAgbm90aWZpY2F0aW9uczogU2V0PE9iamVjdD47XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubm90aWZpY2F0aW9ucyA9IG5ldyBTZXQoKVxuICB9XG4gIHNob3dXZWxjb21lKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGdyZWV0VjJXZWxjb21lKClcbiAgICBub3RpZmljYXRpb24ub25EaWREaXNtaXNzKCgpID0+IHRoaXMubm90aWZpY2F0aW9ucy5kZWxldGUobm90aWZpY2F0aW9uKSlcbiAgICB0aGlzLm5vdGlmaWNhdGlvbnMuYWRkKG5vdGlmaWNhdGlvbilcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMubm90aWZpY2F0aW9ucy5mb3JFYWNoKG4gPT4gbi5kaXNtaXNzKCkpXG4gICAgdGhpcy5ub3RpZmljYXRpb25zLmNsZWFyKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdyZWV0ZXJcbiJdfQ==