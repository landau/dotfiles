Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _validate = require('./validate');

var UIRegistry = (function () {
  function UIRegistry() {
    _classCallCheck(this, UIRegistry);

    this.providers = new Set();
    this.subscriptions = new _atom.CompositeDisposable();
  }

  _createClass(UIRegistry, [{
    key: 'add',
    value: function add(ui) {
      if (!this.providers.has(ui) && (0, _validate.ui)(ui)) {
        this.subscriptions.add(ui);
        this.providers.add(ui);
      }
    }
  }, {
    key: 'delete',
    value: function _delete(provider) {
      if (this.providers.has(provider)) {
        provider.dispose();
        this.providers['delete'](provider);
      }
    }
  }, {
    key: 'render',
    value: function render(messages) {
      this.providers.forEach(function (provider) {
        provider.render(messages);
      });
    }
  }, {
    key: 'didBeginLinting',
    value: function didBeginLinting(linter) {
      var filePath = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      this.providers.forEach(function (provider) {
        provider.didBeginLinting(linter, filePath);
      });
    }
  }, {
    key: 'didFinishLinting',
    value: function didFinishLinting(linter) {
      var filePath = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      this.providers.forEach(function (provider) {
        provider.didFinishLinting(linter, filePath);
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.providers.clear();
      this.subscriptions.dispose();
    }
  }]);

  return UIRegistry;
})();

exports['default'] = UIRegistry;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvdWktcmVnaXN0cnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBRW9DLE1BQU07O3dCQUNULFlBQVk7O0lBR3hCLFVBQVU7QUFJbEIsV0FKUSxVQUFVLEdBSWY7MEJBSkssVUFBVTs7QUFLM0IsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQzFCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7R0FDL0M7O2VBUGtCLFVBQVU7O1dBUTFCLGFBQUMsRUFBTSxFQUFFO0FBQ1YsVUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLGtCQUFXLEVBQUUsQ0FBQyxFQUFFO0FBQzdDLFlBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQzFCLFlBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO09BQ3ZCO0tBQ0Y7OztXQUNLLGlCQUFDLFFBQVksRUFBRTtBQUNuQixVQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ2hDLGdCQUFRLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDbEIsWUFBSSxDQUFDLFNBQVMsVUFBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO09BQ2hDO0tBQ0Y7OztXQUNLLGdCQUFDLFFBQXVCLEVBQUU7QUFDOUIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBUyxRQUFRLEVBQUU7QUFDeEMsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUE7T0FDMUIsQ0FBQyxDQUFBO0tBQ0g7OztXQUNjLHlCQUFDLE1BQWMsRUFBNEI7VUFBMUIsUUFBaUIseURBQUcsSUFBSTs7QUFDdEQsVUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBUyxRQUFRLEVBQUU7QUFDeEMsZ0JBQVEsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO09BQzNDLENBQUMsQ0FBQTtLQUNIOzs7V0FDZSwwQkFBQyxNQUFjLEVBQTRCO1VBQTFCLFFBQWlCLHlEQUFHLElBQUk7O0FBQ3ZELFVBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVMsUUFBUSxFQUFFO0FBQ3hDLGdCQUFRLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO09BQzVDLENBQUMsQ0FBQTtLQUNIOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDdEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3Qjs7O1NBdENrQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL3VpLXJlZ2lzdHJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyB1aSBhcyB2YWxpZGF0ZVVJIH0gZnJvbSAnLi92YWxpZGF0ZSdcbmltcG9ydCB0eXBlIHsgTGludGVyLCBVSSwgTWVzc2FnZXNQYXRjaCB9IGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVJUmVnaXN0cnkge1xuICBwcm92aWRlcnM6IFNldDxVST47XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5wcm92aWRlcnMgPSBuZXcgU2V0KClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIH1cbiAgYWRkKHVpOiBVSSkge1xuICAgIGlmICghdGhpcy5wcm92aWRlcnMuaGFzKHVpKSAmJiB2YWxpZGF0ZVVJKHVpKSkge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh1aSlcbiAgICAgIHRoaXMucHJvdmlkZXJzLmFkZCh1aSlcbiAgICB9XG4gIH1cbiAgZGVsZXRlKHByb3ZpZGVyOiBVSSkge1xuICAgIGlmICh0aGlzLnByb3ZpZGVycy5oYXMocHJvdmlkZXIpKSB7XG4gICAgICBwcm92aWRlci5kaXNwb3NlKClcbiAgICAgIHRoaXMucHJvdmlkZXJzLmRlbGV0ZShwcm92aWRlcilcbiAgICB9XG4gIH1cbiAgcmVuZGVyKG1lc3NhZ2VzOiBNZXNzYWdlc1BhdGNoKSB7XG4gICAgdGhpcy5wcm92aWRlcnMuZm9yRWFjaChmdW5jdGlvbihwcm92aWRlcikge1xuICAgICAgcHJvdmlkZXIucmVuZGVyKG1lc3NhZ2VzKVxuICAgIH0pXG4gIH1cbiAgZGlkQmVnaW5MaW50aW5nKGxpbnRlcjogTGludGVyLCBmaWxlUGF0aDogP3N0cmluZyA9IG51bGwpIHtcbiAgICB0aGlzLnByb3ZpZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHByb3ZpZGVyKSB7XG4gICAgICBwcm92aWRlci5kaWRCZWdpbkxpbnRpbmcobGludGVyLCBmaWxlUGF0aClcbiAgICB9KVxuICB9XG4gIGRpZEZpbmlzaExpbnRpbmcobGludGVyOiBMaW50ZXIsIGZpbGVQYXRoOiA/c3RyaW5nID0gbnVsbCkge1xuICAgIHRoaXMucHJvdmlkZXJzLmZvckVhY2goZnVuY3Rpb24ocHJvdmlkZXIpIHtcbiAgICAgIHByb3ZpZGVyLmRpZEZpbmlzaExpbnRpbmcobGludGVyLCBmaWxlUGF0aClcbiAgICB9KVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5wcm92aWRlcnMuY2xlYXIoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuIl19