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
    this.subscriptions.add(atom.config.observe('linter-ui-defalt.showProviderName', function (showProviderName) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL2RlbGVnYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OzBCQUU2QyxjQUFjOztJQUd0QyxlQUFlO0FBTXZCLFdBTlEsZUFBZSxHQU1wQjs7OzBCQU5LLGVBQWU7O0FBT2hDLFFBQUksQ0FBQyxPQUFPLEdBQUcseUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQTtBQUNyQixRQUFJLENBQUMsYUFBYSxHQUFHLHFDQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUNBQW1DLEVBQUUsVUFBQyxnQkFBZ0IsRUFBSztBQUNwRyxVQUFNLFlBQVksR0FBRyxPQUFPLE1BQUssZ0JBQWdCLEtBQUssV0FBVyxDQUFBO0FBQ2pFLFlBQUssZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUE7QUFDeEMsVUFBSSxZQUFZLEVBQUU7QUFDaEIsY0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFBO09BQ25DO0tBQ0YsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6RCx3Q0FBa0MsRUFBRSxzQ0FBQyxLQUFLLEVBQUs7QUFDN0MsWUFBSSxNQUFLLFFBQVEsRUFBRTtBQUNqQixpQkFBTTtTQUNQO0FBQ0QsY0FBSyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3BCLGNBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQTs7O0FBR2xDLFlBQUksS0FBSyxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRTtBQUN4RCxrQkFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxhQUFhLEdBQUc7QUFDL0Qsb0JBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFBO0FBQ3pELGdCQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsb0NBQW9DLENBQUMsQ0FBQTtXQUNqRyxDQUFDLENBQUE7U0FDSDtPQUNGO0FBQ0QsMENBQW9DLEVBQUUsMENBQU07QUFDMUMsY0FBSyxRQUFRLEdBQUcsS0FBSyxDQUFBO0FBQ3JCLGNBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO09BQ3JDO0tBQ0YsQ0FBQyxDQUFDLENBQUE7R0FDSjs7ZUF4Q2tCLGVBQWU7O1dBeUNwQix3QkFBQyxRQUFxQixFQUFjO0FBQ2hELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2xEOzs7V0FDYSx3QkFBQyxRQUFxQixFQUFjO0FBQ2hELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2xEOzs7V0FDZSwwQkFBQyxRQUFxQixFQUFjO0FBQ2xELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDcEQ7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUN2Qjs7O1NBcERrQixlQUFlOzs7cUJBQWYsZUFBZSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvdG9vbHRpcC9kZWxlZ2F0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXIgfSBmcm9tICdzYi1ldmVudC1raXQnXG5pbXBvcnQgdHlwZSB7IERpc3Bvc2FibGUgfSBmcm9tICdzYi1ldmVudC1raXQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRvb2x0aXBEZWxlZ2F0ZSB7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIGV4cGFuZGVkOiBib29sZWFuO1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBzaG93UHJvdmlkZXJOYW1lOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLmV4cGFuZGVkID0gZmFsc2VcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhbHQuc2hvd1Byb3ZpZGVyTmFtZScsIChzaG93UHJvdmlkZXJOYW1lKSA9PiB7XG4gICAgICBjb25zdCBzaG91bGRVcGRhdGUgPSB0eXBlb2YgdGhpcy5zaG93UHJvdmlkZXJOYW1lICE9PSAndW5kZWZpbmVkJ1xuICAgICAgdGhpcy5zaG93UHJvdmlkZXJOYW1lID0gc2hvd1Byb3ZpZGVyTmFtZVxuICAgICAgaWYgKHNob3VsZFVwZGF0ZSkge1xuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnc2hvdWxkLXVwZGF0ZScpXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6ZXhwYW5kLXRvb2x0aXAnOiAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZXhwYW5kZWQpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV4cGFuZGVkID0gdHJ1ZVxuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnc2hvdWxkLWV4cGFuZCcpXG5cbiAgICAgICAgLy8gSWYgYm91bmQgdG8gYSBrZXksIGNvbGxhcHNlIHdoZW4gdGhhdCBrZXkgaXMgcmVsZWFzZWQsIGp1c3QgbGlrZSBvbGQgdGltZXNcbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgJiYgZXZlbnQub3JpZ2luYWxFdmVudC5pc1RydXN0ZWQpIHtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24gZXZlbnRMaXN0ZW5lcigpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBldmVudExpc3RlbmVyKVxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnbGludGVyLXVpLWRlZmF1bHQ6Y29sbGFwc2UtdG9vbHRpcCcpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpjb2xsYXBzZS10b29sdGlwJzogKCkgPT4ge1xuICAgICAgICB0aGlzLmV4cGFuZGVkID0gZmFsc2VcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3Nob3VsZC1jb2xsYXBzZScpXG4gICAgICB9LFxuICAgIH0pKVxuICB9XG4gIG9uU2hvdWxkVXBkYXRlKGNhbGxiYWNrOiAoKCkgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3Nob3VsZC11cGRhdGUnLCBjYWxsYmFjaylcbiAgfVxuICBvblNob3VsZEV4cGFuZChjYWxsYmFjazogKCgpID0+IGFueSkpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdzaG91bGQtZXhwYW5kJywgY2FsbGJhY2spXG4gIH1cbiAgb25TaG91bGRDb2xsYXBzZShjYWxsYmFjazogKCgpID0+IGFueSkpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdzaG91bGQtY29sbGFwc2UnLCBjYWxsYmFjaylcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuZW1pdHRlci5kaXNwb3NlKClcbiAgfVxufVxuIl19