Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var Provider = (function () {
  function Provider() {
    _classCallCheck(this, Provider);

    this.emitter = new _atom.Emitter();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
  }

  // Public

  _createClass(Provider, [{
    key: 'add',
    value: function add(title) {
      var priority = arguments.length <= 1 || arguments[1] === undefined ? 100 : arguments[1];

      this.emitter.emit('did-add', { title: title, priority: priority });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2J1c3ktc2lnbmFsL2xpYi9wcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFNkMsTUFBTTs7SUFHOUIsUUFBUTtBQUloQixXQUpRLFFBQVEsR0FJYjswQkFKSyxRQUFROztBQUt6QixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQ3JDOzs7O2VBVGtCLFFBQVE7O1dBV3hCLGFBQUMsS0FBYSxFQUEwQjtVQUF4QixRQUFnQix5REFBRyxHQUFHOztBQUN2QyxVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxLQUFLLEVBQUwsS0FBSyxFQUFFLFFBQVEsRUFBUixRQUFRLEVBQUUsQ0FBQyxDQUFBO0tBQ2xEOzs7OztXQUVLLGdCQUFDLEtBQWEsRUFBRTtBQUNwQixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUE7S0FDdkM7Ozs7O1dBRUksaUJBQUc7QUFDTixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtLQUMvQjs7O1dBQ08sa0JBQUMsUUFBK0QsRUFBYztBQUNwRixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUM1Qzs7O1dBQ1UscUJBQUMsUUFBa0MsRUFBYztBQUMxRCxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUMvQzs7O1dBQ1Msb0JBQUMsUUFBcUIsRUFBYztBQUM1QyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUM5Qzs7O1dBQ1csc0JBQUMsUUFBa0IsRUFBYztBQUMzQyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUNoRDs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUNoQyxVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQzdCOzs7U0FyQ2tCLFFBQVE7OztxQkFBUixRQUFRIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2J1c3ktc2lnbmFsL2xpYi9wcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXIgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHR5cGUgeyBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvdmlkZXIge1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgfVxuICAvLyBQdWJsaWNcbiAgYWRkKHRpdGxlOiBzdHJpbmcsIHByaW9yaXR5OiBudW1iZXIgPSAxMDApIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWFkZCcsIHsgdGl0bGUsIHByaW9yaXR5IH0pXG4gIH1cbiAgLy8gUHVibGljXG4gIHJlbW92ZSh0aXRsZTogc3RyaW5nKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1yZW1vdmUnLCB0aXRsZSlcbiAgfVxuICAvLyBQdWJsaWNcbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jbGVhcicpXG4gIH1cbiAgb25EaWRBZGQoY2FsbGJhY2s6ICgoc3RhdHVzOiB7IHRpdGxlOiBzdHJpbmcsIHByaW9yaXR5Om51bWJlciB9KSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWFkZCcsIGNhbGxiYWNrKVxuICB9XG4gIG9uRGlkUmVtb3ZlKGNhbGxiYWNrOiAoKHRpdGxlOiBzdHJpbmcpID0+IGFueSkpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtcmVtb3ZlJywgY2FsbGJhY2spXG4gIH1cbiAgb25EaWRDbGVhcihjYWxsYmFjazogKCgpID0+IGFueSkpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2xlYXInLCBjYWxsYmFjaylcbiAgfVxuICBvbkRpZERpc3Bvc2UoY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWRpc3Bvc2UnLCBjYWxsYmFjaylcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZGlzcG9zZScpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG59XG4iXX0=