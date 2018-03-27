Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sbEventKit = require('sb-event-kit');

var TooltipDelegate = (function () {
  function TooltipDelegate() {
    var _this = this;

    _classCallCheck(this, TooltipDelegate);

    this.emitter = new _sbEventKit.Emitter();
    this.expanded = false;
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('linter-ui-default.showProviderName', function (showProviderName) {
      var shouldUpdate = typeof _this.showProviderName !== 'undefined';
      _this.showProviderName = showProviderName;
      if (shouldUpdate) {
        _this.emitter.emit('should-update');
      }
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linter-ui-default:expand-tooltip': function linterUiDefaultExpandTooltip(event) {
        if (_this.expanded) {
          return;
        }
        _this.expanded = true;
        _this.emitter.emit('should-expand');

        // If bound to a key, collapse when that key is released, just like old times
        if (event.originalEvent && event.originalEvent.isTrusted) {
          document.body.addEventListener('keyup', function eventListener() {
            document.body.removeEventListener('keyup', eventListener);
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'linter-ui-default:collapse-tooltip');
          });
        }
      },
      'linter-ui-default:collapse-tooltip': function linterUiDefaultCollapseTooltip() {
        _this.expanded = false;
        _this.emitter.emit('should-collapse');
      }
    }));
  }

  _createClass(TooltipDelegate, [{
    key: 'onShouldUpdate',
    value: function onShouldUpdate(callback) {
      return this.emitter.on('should-update', callback);
    }
  }, {
    key: 'onShouldExpand',
    value: function onShouldExpand(callback) {
      return this.emitter.on('should-expand', callback);
    }
  }, {
    key: 'onShouldCollapse',
    value: function onShouldCollapse(callback) {
      return this.emitter.on('should-collapse', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.emitter.dispose();
    }
  }]);

  return TooltipDelegate;
})();

exports['default'] = TooltipDelegate;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL2RlbGVnYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OzBCQUU2QyxjQUFjOztJQUd0QyxlQUFlO0FBTXZCLFdBTlEsZUFBZSxHQU1wQjs7OzBCQU5LLGVBQWU7O0FBT2hDLFFBQUksQ0FBQyxPQUFPLEdBQUcseUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQTtBQUNyQixRQUFJLENBQUMsYUFBYSxHQUFHLHFDQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsb0NBQW9DLEVBQUUsVUFBQyxnQkFBZ0IsRUFBSztBQUNyRyxVQUFNLFlBQVksR0FBRyxPQUFPLE1BQUssZ0JBQWdCLEtBQUssV0FBVyxDQUFBO0FBQ2pFLFlBQUssZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUE7QUFDeEMsVUFBSSxZQUFZLEVBQUU7QUFDaEIsY0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFBO09BQ25DO0tBQ0YsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6RCx3Q0FBa0MsRUFBRSxzQ0FBQyxLQUFLLEVBQUs7QUFDN0MsWUFBSSxNQUFLLFFBQVEsRUFBRTtBQUNqQixpQkFBTTtTQUNQO0FBQ0QsY0FBSyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3BCLGNBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQTs7O0FBR2xDLFlBQUksS0FBSyxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRTtBQUN4RCxrQkFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxhQUFhLEdBQUc7QUFDL0Qsb0JBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFBO0FBQ3pELGdCQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsb0NBQW9DLENBQUMsQ0FBQTtXQUNqRyxDQUFDLENBQUE7U0FDSDtPQUNGO0FBQ0QsMENBQW9DLEVBQUUsMENBQU07QUFDMUMsY0FBSyxRQUFRLEdBQUcsS0FBSyxDQUFBO0FBQ3JCLGNBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO09BQ3JDO0tBQ0YsQ0FBQyxDQUFDLENBQUE7R0FDSjs7ZUF4Q2tCLGVBQWU7O1dBeUNwQix3QkFBQyxRQUFxQixFQUFjO0FBQ2hELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2xEOzs7V0FDYSx3QkFBQyxRQUFxQixFQUFjO0FBQ2hELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2xEOzs7V0FDZSwwQkFBQyxRQUFxQixFQUFjO0FBQ2xELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDcEQ7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUN2Qjs7O1NBcERrQixlQUFlOzs7cUJBQWYsZUFBZSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvdG9vbHRpcC9kZWxlZ2F0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXIgfSBmcm9tICdzYi1ldmVudC1raXQnXG5pbXBvcnQgdHlwZSB7IERpc3Bvc2FibGUgfSBmcm9tICdzYi1ldmVudC1raXQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRvb2x0aXBEZWxlZ2F0ZSB7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIGV4cGFuZGVkOiBib29sZWFuO1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBzaG93UHJvdmlkZXJOYW1lOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLmV4cGFuZGVkID0gZmFsc2VcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dQcm92aWRlck5hbWUnLCAoc2hvd1Byb3ZpZGVyTmFtZSkgPT4ge1xuICAgICAgY29uc3Qgc2hvdWxkVXBkYXRlID0gdHlwZW9mIHRoaXMuc2hvd1Byb3ZpZGVyTmFtZSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHRoaXMuc2hvd1Byb3ZpZGVyTmFtZSA9IHNob3dQcm92aWRlck5hbWVcbiAgICAgIGlmIChzaG91bGRVcGRhdGUpIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3Nob3VsZC11cGRhdGUnKVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OmV4cGFuZC10b29sdGlwJzogKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmV4cGFuZGVkKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5leHBhbmRlZCA9IHRydWVcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3Nob3VsZC1leHBhbmQnKVxuXG4gICAgICAgIC8vIElmIGJvdW5kIHRvIGEga2V5LCBjb2xsYXBzZSB3aGVuIHRoYXQga2V5IGlzIHJlbGVhc2VkLCBqdXN0IGxpa2Ugb2xkIHRpbWVzXG4gICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQuaXNUcnVzdGVkKSB7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uIGV2ZW50TGlzdGVuZXIoKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZXZlbnRMaXN0ZW5lcilcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ2xpbnRlci11aS1kZWZhdWx0OmNvbGxhcHNlLXRvb2x0aXAnKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6Y29sbGFwc2UtdG9vbHRpcCc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5leHBhbmRlZCA9IGZhbHNlXG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdzaG91bGQtY29sbGFwc2UnKVxuICAgICAgfSxcbiAgICB9KSlcbiAgfVxuICBvblNob3VsZFVwZGF0ZShjYWxsYmFjazogKCgpID0+IGFueSkpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdzaG91bGQtdXBkYXRlJywgY2FsbGJhY2spXG4gIH1cbiAgb25TaG91bGRFeHBhbmQoY2FsbGJhY2s6ICgoKSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignc2hvdWxkLWV4cGFuZCcsIGNhbGxiYWNrKVxuICB9XG4gIG9uU2hvdWxkQ29sbGFwc2UoY2FsbGJhY2s6ICgoKSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignc2hvdWxkLWNvbGxhcHNlJywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZGlzcG9zZSgpXG4gIH1cbn1cbiJdfQ==