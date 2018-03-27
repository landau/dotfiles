Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _indieDelegate = require('./indie-delegate');

var _indieDelegate2 = _interopRequireDefault(_indieDelegate);

var _validate = require('./validate');

var IndieRegistry = (function () {
  function IndieRegistry() {
    _classCallCheck(this, IndieRegistry);

    this.emitter = new _atom.Emitter();
    this.delegates = new Set();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
  }

  _createClass(IndieRegistry, [{
    key: 'register',
    value: function register(config, version) {
      var _this = this;

      if (!(0, _validate.indie)(config)) {
        throw new Error('Error registering Indie Linter');
      }
      var indieLinter = new _indieDelegate2['default'](config, version);
      this.delegates.add(indieLinter);
      indieLinter.onDidDestroy(function () {
        _this.delegates['delete'](indieLinter);
      });
      indieLinter.onDidUpdate(function (messages) {
        _this.emitter.emit('did-update', { linter: indieLinter, messages: messages });
      });
      this.emitter.emit('observe', indieLinter);

      return indieLinter;
    }
  }, {
    key: 'observe',
    value: function observe(callback) {
      this.delegates.forEach(callback);
      return this.emitter.on('observe', callback);
    }
  }, {
    key: 'onDidUpdate',
    value: function onDidUpdate(callback) {
      return this.emitter.on('did-update', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      for (var entry of this.delegates) {
        entry.dispose();
      }
      this.subscriptions.dispose();
    }
  }]);

  return IndieRegistry;
})();

exports['default'] = IndieRegistry;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvaW5kaWUtcmVnaXN0cnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFNkMsTUFBTTs7NkJBR3pCLGtCQUFrQjs7Ozt3QkFDTCxZQUFZOztJQUc5QixhQUFhO0FBS3JCLFdBTFEsYUFBYSxHQUtsQjswQkFMSyxhQUFhOztBQU05QixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQzFCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtHQUNyQzs7ZUFYa0IsYUFBYTs7V0FZeEIsa0JBQUMsTUFBYSxFQUFFLE9BQWMsRUFBaUI7OztBQUNyRCxVQUFJLENBQUMscUJBQWMsTUFBTSxDQUFDLEVBQUU7QUFDMUIsY0FBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFBO09BQ2xEO0FBQ0QsVUFBTSxXQUFXLEdBQUcsK0JBQWtCLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUN0RCxVQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUMvQixpQkFBVyxDQUFDLFlBQVksQ0FBQyxZQUFNO0FBQzdCLGNBQUssU0FBUyxVQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7T0FDbkMsQ0FBQyxDQUFBO0FBQ0YsaUJBQVcsQ0FBQyxXQUFXLENBQUMsVUFBQyxRQUFRLEVBQUs7QUFDcEMsY0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBRSxDQUFDLENBQUE7T0FDbkUsQ0FBQyxDQUFBO0FBQ0YsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFBOztBQUV6QyxhQUFPLFdBQVcsQ0FBQTtLQUNuQjs7O1dBQ00saUJBQUMsUUFBa0IsRUFBYztBQUN0QyxVQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUNoQyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUM1Qzs7O1dBQ1UscUJBQUMsUUFBa0IsRUFBYztBQUMxQyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUMvQzs7O1dBQ00sbUJBQUc7QUFDUixXQUFLLElBQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDbEMsYUFBSyxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQ2hCO0FBQ0QsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3Qjs7O1NBeENrQixhQUFhOzs7cUJBQWIsYUFBYSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2luZGllLXJlZ2lzdHJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgRW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSB7IERpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5pbXBvcnQgSW5kaWVEZWxlZ2F0ZSBmcm9tICcuL2luZGllLWRlbGVnYXRlJ1xuaW1wb3J0IHsgaW5kaWUgYXMgdmFsaWRhdGVJbmRpZSB9IGZyb20gJy4vdmFsaWRhdGUnXG5pbXBvcnQgdHlwZSB7IEluZGllIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5kaWVSZWdpc3RyeSB7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIGRlbGVnYXRlczogU2V0PEluZGllRGVsZWdhdGU+O1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLmRlbGVnYXRlcyA9IG5ldyBTZXQoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICB9XG4gIHJlZ2lzdGVyKGNvbmZpZzogSW5kaWUsIHZlcnNpb246IDEgfCAyKTogSW5kaWVEZWxlZ2F0ZSB7XG4gICAgaWYgKCF2YWxpZGF0ZUluZGllKGNvbmZpZykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3IgcmVnaXN0ZXJpbmcgSW5kaWUgTGludGVyJylcbiAgICB9XG4gICAgY29uc3QgaW5kaWVMaW50ZXIgPSBuZXcgSW5kaWVEZWxlZ2F0ZShjb25maWcsIHZlcnNpb24pXG4gICAgdGhpcy5kZWxlZ2F0ZXMuYWRkKGluZGllTGludGVyKVxuICAgIGluZGllTGludGVyLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICB0aGlzLmRlbGVnYXRlcy5kZWxldGUoaW5kaWVMaW50ZXIpXG4gICAgfSlcbiAgICBpbmRpZUxpbnRlci5vbkRpZFVwZGF0ZSgobWVzc2FnZXMpID0+IHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtdXBkYXRlJywgeyBsaW50ZXI6IGluZGllTGludGVyLCBtZXNzYWdlcyB9KVxuICAgIH0pXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ29ic2VydmUnLCBpbmRpZUxpbnRlcilcblxuICAgIHJldHVybiBpbmRpZUxpbnRlclxuICB9XG4gIG9ic2VydmUoY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5kZWxlZ2F0ZXMuZm9yRWFjaChjYWxsYmFjaylcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdvYnNlcnZlJywgY2FsbGJhY2spXG4gIH1cbiAgb25EaWRVcGRhdGUoY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXVwZGF0ZScsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLmRlbGVnYXRlcykge1xuICAgICAgZW50cnkuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuIl19