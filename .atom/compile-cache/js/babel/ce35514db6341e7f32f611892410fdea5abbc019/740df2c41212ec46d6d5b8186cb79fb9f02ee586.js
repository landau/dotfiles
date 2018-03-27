Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

var _atom2 = _interopRequireDefault(_atom);

'use babel';

var Quokka = (function () {
  function Quokka() {
    _classCallCheck(this, Quokka);
  }

  _createClass(Quokka, [{
    key: 'activate',
    value: function activate() {
      var _this = this;

      setImmediate(function () {
        _this._plugin = require('quokka-atom');
        _this._plugin.activate({
          atom: _atom2['default'],
          extendedCoreClient: require('quokka-atom' + (!process.env.quokkaDebug ? '/build/extension/dist' : '') + '/wallaby/client'),
          atomViews: require('atom-space-pen-views'),
          statusBar: _this._statusBar,
          packagePath: _path2['default'].join(__dirname, '..')
        });
      });
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this._plugin && this._plugin.deactivate();
    }
  }, {
    key: 'statusBar',
    value: function statusBar(control) {
      this._statusBar = control;
    }
  }]);

  return Quokka;
})();

exports['default'] = new Quokka();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2F0b20tcXVva2thL2xpYi9xdW9ra2EuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFaUIsTUFBTTs7OztvQkFDTixNQUFNOzs7O0FBSHZCLFdBQVcsQ0FBQzs7SUFLTixNQUFNO1dBQU4sTUFBTTswQkFBTixNQUFNOzs7ZUFBTixNQUFNOztXQUNGLG9CQUFHOzs7QUFDVCxrQkFBWSxDQUFDLFlBQU07QUFDakIsY0FBSyxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3RDLGNBQUssT0FBTyxDQUFDLFFBQVEsQ0FBQztBQUNwQixjQUFJLG1CQUFNO0FBQ1YsNEJBQWtCLEVBQUUsT0FBTyxrQkFBZSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLHVCQUF1QixHQUFHLEVBQUUsQ0FBQSxxQkFBa0I7QUFDbkgsbUJBQVMsRUFBRSxPQUFPLENBQUMsc0JBQXNCLENBQUM7QUFDMUMsbUJBQVMsRUFBRSxNQUFLLFVBQVU7QUFDMUIscUJBQVcsRUFBRSxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQztTQUN4QyxDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1dBRVMsc0JBQUc7QUFDWCxVQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7S0FDM0M7OztXQUVRLG1CQUFDLE9BQU8sRUFBRTtBQUNqQixVQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQztLQUMzQjs7O1NBcEJHLE1BQU07OztxQkF1QkcsSUFBSSxNQUFNLEVBQUUiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1xdW9ra2EvbGliL3F1b2trYS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBhdG9tIGZyb20gJ2F0b20nO1xuXG5jbGFzcyBRdW9ra2Ege1xuICBhY3RpdmF0ZSgpIHtcbiAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgdGhpcy5fcGx1Z2luID0gcmVxdWlyZSgncXVva2thLWF0b20nKTtcbiAgICAgIHRoaXMuX3BsdWdpbi5hY3RpdmF0ZSh7XG4gICAgICAgIGF0b206IGF0b20sXG4gICAgICAgIGV4dGVuZGVkQ29yZUNsaWVudDogcmVxdWlyZShgcXVva2thLWF0b20keyFwcm9jZXNzLmVudi5xdW9ra2FEZWJ1ZyA/ICcvYnVpbGQvZXh0ZW5zaW9uL2Rpc3QnIDogJyd9L3dhbGxhYnkvY2xpZW50YCksXG4gICAgICAgIGF0b21WaWV3czogcmVxdWlyZSgnYXRvbS1zcGFjZS1wZW4tdmlld3MnKSxcbiAgICAgICAgc3RhdHVzQmFyOiB0aGlzLl9zdGF0dXNCYXIsXG4gICAgICAgIHBhY2thZ2VQYXRoOiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nKVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuX3BsdWdpbiAmJiB0aGlzLl9wbHVnaW4uZGVhY3RpdmF0ZSgpO1xuICB9XG5cbiAgc3RhdHVzQmFyKGNvbnRyb2wpIHtcbiAgICB0aGlzLl9zdGF0dXNCYXIgPSBjb250cm9sO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBRdW9ra2EoKTsiXX0=