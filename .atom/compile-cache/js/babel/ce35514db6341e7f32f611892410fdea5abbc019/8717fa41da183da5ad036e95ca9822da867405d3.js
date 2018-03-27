Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _helpers = require('./helpers');

var Provider = (function () {
  function Provider() {
    _classCallCheck(this, Provider);

    this.id = (0, _helpers.generateRandom)();
    this.emitter = new _atom.Emitter();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
  }

  // Public

  _createClass(Provider, [{
    key: 'add',
    value: function add(title) {
      this.emitter.emit('did-add', title);
    }

    // Public
  }, {
    key: 'remove',
    value: function remove(title) {
      this.emitter.emit('did-remove', title);
    }

    // Public
  }, {
    key: 'clear',
    value: function clear() {
      this.emitter.emit('did-clear');
    }
  }, {
    key: 'onDidAdd',
    value: function onDidAdd(callback) {
      return this.emitter.on('did-add', callback);
    }
  }, {
    key: 'onDidRemove',
    value: function onDidRemove(callback) {
      return this.emitter.on('did-remove', callback);
    }
  }, {
    key: 'onDidClear',
    value: function onDidClear(callback) {
      return this.emitter.on('did-clear', callback);
    }
  }, {
    key: 'onDidDispose',
    value: function onDidDispose(callback) {
      return this.emitter.on('did-dispose', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.emitter.emit('did-dispose');
      this.subscriptions.dispose();
    }
  }]);

  return Provider;
})();

exports['default'] = Provider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2J1c3ktc2lnbmFsL2xpYi9wcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFNkMsTUFBTTs7dUJBRXBCLFdBQVc7O0lBRXJCLFFBQVE7QUFLaEIsV0FMUSxRQUFRLEdBS2I7MEJBTEssUUFBUTs7QUFNekIsUUFBSSxDQUFDLEVBQUUsR0FBRyw4QkFBZ0IsQ0FBQTtBQUMxQixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQ3JDOzs7O2VBWGtCLFFBQVE7O1dBYXhCLGFBQUMsS0FBYSxFQUFFO0FBQ2pCLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQTtLQUNwQzs7Ozs7V0FFSyxnQkFBQyxLQUFhLEVBQUU7QUFDcEIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFBO0tBQ3ZDOzs7OztXQUVJLGlCQUFHO0FBQ04sVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7S0FDL0I7OztXQUNPLGtCQUFDLFFBQWtDLEVBQWM7QUFDdkQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDNUM7OztXQUNVLHFCQUFDLFFBQWtDLEVBQWM7QUFDMUQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDL0M7OztXQUNTLG9CQUFDLFFBQXFCLEVBQWM7QUFDNUMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDOUM7OztXQUNXLHNCQUFDLFFBQWtCLEVBQWM7QUFDM0MsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDaEQ7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDaEMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3Qjs7O1NBdkNrQixRQUFROzs7cUJBQVIsUUFBUSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9idXN5LXNpZ25hbC9saWIvcHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIHsgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBnZW5lcmF0ZVJhbmRvbSB9IGZyb20gJy4vaGVscGVycydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvdmlkZXIge1xuICBpZDogc3RyaW5nO1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVJhbmRvbSgpXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICB9XG4gIC8vIFB1YmxpY1xuICBhZGQodGl0bGU6IHN0cmluZykge1xuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtYWRkJywgdGl0bGUpXG4gIH1cbiAgLy8gUHVibGljXG4gIHJlbW92ZSh0aXRsZTogc3RyaW5nKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1yZW1vdmUnLCB0aXRsZSlcbiAgfVxuICAvLyBQdWJsaWNcbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jbGVhcicpXG4gIH1cbiAgb25EaWRBZGQoY2FsbGJhY2s6ICgodGl0bGU6IHN0cmluZykgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1hZGQnLCBjYWxsYmFjaylcbiAgfVxuICBvbkRpZFJlbW92ZShjYWxsYmFjazogKCh0aXRsZTogc3RyaW5nKSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXJlbW92ZScsIGNhbGxiYWNrKVxuICB9XG4gIG9uRGlkQ2xlYXIoY2FsbGJhY2s6ICgoKSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNsZWFyJywgY2FsbGJhY2spXG4gIH1cbiAgb25EaWREaXNwb3NlKGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1kaXNwb3NlJywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRpc3Bvc2UnKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuIl19