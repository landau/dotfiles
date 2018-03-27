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

  // Public method

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
    key: 'getProviders',
    value: function getProviders() {
      return Array.from(this.delegates);
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

module.exports = IndieRegistry;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvaW5kaWUtcmVnaXN0cnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUU2QyxNQUFNOzs2QkFHekIsa0JBQWtCOzs7O3dCQUNMLFlBQVk7O0lBRzdDLGFBQWE7QUFLTixXQUxQLGFBQWEsR0FLSDswQkFMVixhQUFhOztBQU1mLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDMUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQ3JDOzs7O2VBWEcsYUFBYTs7V0FhVCxrQkFBQyxNQUFhLEVBQUUsT0FBYyxFQUFpQjs7O0FBQ3JELFVBQUksQ0FBQyxxQkFBYyxNQUFNLENBQUMsRUFBRTtBQUMxQixjQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUE7T0FDbEQ7QUFDRCxVQUFNLFdBQVcsR0FBRywrQkFBa0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQ3RELFVBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQy9CLGlCQUFXLENBQUMsWUFBWSxDQUFDLFlBQU07QUFDN0IsY0FBSyxTQUFTLFVBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQTtPQUNuQyxDQUFDLENBQUE7QUFDRixpQkFBVyxDQUFDLFdBQVcsQ0FBQyxVQUFDLFFBQVEsRUFBSztBQUNwQyxjQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQVIsUUFBUSxFQUFFLENBQUMsQ0FBQTtPQUNuRSxDQUFDLENBQUE7QUFDRixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUE7O0FBRXpDLGFBQU8sV0FBVyxDQUFBO0tBQ25COzs7V0FDVyx3QkFBRztBQUNiLGFBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDbEM7OztXQUNNLGlCQUFDLFFBQWtCLEVBQWM7QUFDdEMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDaEMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDNUM7OztXQUNVLHFCQUFDLFFBQWtCLEVBQWM7QUFDMUMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDL0M7OztXQUNNLG1CQUFHO0FBQ1IsV0FBSyxJQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2xDLGFBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtPQUNoQjtBQUNELFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDN0I7OztTQTVDRyxhQUFhOzs7QUErQ25CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvaW5kaWUtcmVnaXN0cnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIHsgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbmltcG9ydCBJbmRpZURlbGVnYXRlIGZyb20gJy4vaW5kaWUtZGVsZWdhdGUnXG5pbXBvcnQgeyBpbmRpZSBhcyB2YWxpZGF0ZUluZGllIH0gZnJvbSAnLi92YWxpZGF0ZSdcbmltcG9ydCB0eXBlIHsgSW5kaWUgfSBmcm9tICcuL3R5cGVzJ1xuXG5jbGFzcyBJbmRpZVJlZ2lzdHJ5IHtcbiAgZW1pdHRlcjogRW1pdHRlcjtcbiAgZGVsZWdhdGVzOiBTZXQ8SW5kaWVEZWxlZ2F0ZT47XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMuZGVsZWdhdGVzID0gbmV3IFNldCgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG4gIH1cbiAgLy8gUHVibGljIG1ldGhvZFxuICByZWdpc3Rlcihjb25maWc6IEluZGllLCB2ZXJzaW9uOiAxIHwgMik6IEluZGllRGVsZWdhdGUge1xuICAgIGlmICghdmFsaWRhdGVJbmRpZShjb25maWcpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHJlZ2lzdGVyaW5nIEluZGllIExpbnRlcicpXG4gICAgfVxuICAgIGNvbnN0IGluZGllTGludGVyID0gbmV3IEluZGllRGVsZWdhdGUoY29uZmlnLCB2ZXJzaW9uKVxuICAgIHRoaXMuZGVsZWdhdGVzLmFkZChpbmRpZUxpbnRlcilcbiAgICBpbmRpZUxpbnRlci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgdGhpcy5kZWxlZ2F0ZXMuZGVsZXRlKGluZGllTGludGVyKVxuICAgIH0pXG4gICAgaW5kaWVMaW50ZXIub25EaWRVcGRhdGUoKG1lc3NhZ2VzKSA9PiB7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXVwZGF0ZScsIHsgbGludGVyOiBpbmRpZUxpbnRlciwgbWVzc2FnZXMgfSlcbiAgICB9KVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdvYnNlcnZlJywgaW5kaWVMaW50ZXIpXG5cbiAgICByZXR1cm4gaW5kaWVMaW50ZXJcbiAgfVxuICBnZXRQcm92aWRlcnMoKSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5kZWxlZ2F0ZXMpXG4gIH1cbiAgb2JzZXJ2ZShjYWxsYmFjazogRnVuY3Rpb24pOiBEaXNwb3NhYmxlIHtcbiAgICB0aGlzLmRlbGVnYXRlcy5mb3JFYWNoKGNhbGxiYWNrKVxuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ29ic2VydmUnLCBjYWxsYmFjaylcbiAgfVxuICBvbkRpZFVwZGF0ZShjYWxsYmFjazogRnVuY3Rpb24pOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtdXBkYXRlJywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHRoaXMuZGVsZWdhdGVzKSB7XG4gICAgICBlbnRyeS5kaXNwb3NlKClcbiAgICB9XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW5kaWVSZWdpc3RyeVxuIl19