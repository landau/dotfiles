Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpers = require('../helpers');

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
    key: 'activate',
    value: _asyncToGenerator(function* () {
      var updated = false;
      var configFile = yield (0, _helpers.getConfigFile)();
      var shown = yield configFile.get('greeter.shown');

      if (!shown.includes('V2_WELCOME_MESSAGE')) {
        updated = true;
        shown.push('V2_WELCOME_MESSAGE');
        (0, _greetV2Welcome2['default'])();
      }

      if (updated) {
        yield configFile.set('greeter.shown', shown);
      }
    })
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvZ3JlZXRlci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7dUJBRThCLFlBQVk7Ozs7OEJBR2Ysb0JBQW9COzs7Ozs7O0lBSzFCLE9BQU87QUFFZixXQUZRLE9BQU8sR0FFWjswQkFGSyxPQUFPOztBQUd4QixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7R0FDL0I7O2VBSmtCLE9BQU87OzZCQUtaLGFBQUc7QUFDZixVQUFJLE9BQU8sR0FBRyxLQUFLLENBQUE7QUFDbkIsVUFBTSxVQUFVLEdBQUcsTUFBTSw2QkFBZSxDQUFBO0FBQ3hDLFVBQU0sS0FBSyxHQUFHLE1BQU0sVUFBVSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQTs7QUFFbkQsVUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsRUFBRTtBQUN6QyxlQUFPLEdBQUcsSUFBSSxDQUFBO0FBQ2QsYUFBSyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0FBQ2hDLDBDQUFnQixDQUFBO09BQ2pCOztBQUVELFVBQUksT0FBTyxFQUFFO0FBQ1gsY0FBTSxVQUFVLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQTtPQUM3QztLQUNGOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztlQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUU7T0FBQSxDQUFDLENBQUE7QUFDNUMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtLQUMzQjs7O1NBdkJrQixPQUFPOzs7cUJBQVAsT0FBTyIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2dyZWV0ZXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBnZXRDb25maWdGaWxlIH0gZnJvbSAnLi4vaGVscGVycydcblxuLy8gR3JlZXRzXG5pbXBvcnQgZ3JlZXRWMldlbGNvbWUgZnJvbSAnLi9ncmVldC12Mi13ZWxjb21lJ1xuXG5cbi8vIE5vdGU6IFRoaXMgcGFja2FnZSBzaG91bGQgbm90IGJlIHVzZWQgZnJvbSBcIk1haW5cIiBjbGFzcyxcbi8vIEluc3RlYWQgaXQgc2hvdWxkIGJlIHVzZWQgZnJvbSB0aGUgbWFpbiBwYWNrYWdlIGVudHJ5IHBvaW50IGRpcmVjdGx5XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmVldGVyIHtcbiAgbm90aWZpY2F0aW9uczogU2V0PE9iamVjdD47XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubm90aWZpY2F0aW9ucyA9IG5ldyBTZXQoKVxuICB9XG4gIGFzeW5jIGFjdGl2YXRlKCkge1xuICAgIGxldCB1cGRhdGVkID0gZmFsc2VcbiAgICBjb25zdCBjb25maWdGaWxlID0gYXdhaXQgZ2V0Q29uZmlnRmlsZSgpXG4gICAgY29uc3Qgc2hvd24gPSBhd2FpdCBjb25maWdGaWxlLmdldCgnZ3JlZXRlci5zaG93bicpXG5cbiAgICBpZiAoIXNob3duLmluY2x1ZGVzKCdWMl9XRUxDT01FX01FU1NBR0UnKSkge1xuICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICAgIHNob3duLnB1c2goJ1YyX1dFTENPTUVfTUVTU0FHRScpXG4gICAgICBncmVldFYyV2VsY29tZSgpXG4gICAgfVxuXG4gICAgaWYgKHVwZGF0ZWQpIHtcbiAgICAgIGF3YWl0IGNvbmZpZ0ZpbGUuc2V0KCdncmVldGVyLnNob3duJywgc2hvd24pXG4gICAgfVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5ub3RpZmljYXRpb25zLmZvckVhY2gobiA9PiBuLmRpc21pc3MoKSlcbiAgICB0aGlzLm5vdGlmaWNhdGlvbnMuY2xlYXIoKVxuICB9XG59XG4iXX0=