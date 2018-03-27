var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var TooltipDelegate = (function () {
  function TooltipDelegate() {
    var _this = this;

    _classCallCheck(this, TooltipDelegate);

    this.emitter = new _atom.Emitter();
    this.expanded = false;
    this.subscriptions = new _atom.CompositeDisposable();

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
          // $FlowIgnore: document.body is never null
          document.body.addEventListener('keyup', function eventListener() {
            // $FlowIgnore: document.body is never null
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

module.exports = TooltipDelegate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL2RlbGVnYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBRTZDLE1BQU07O0lBRzdDLGVBQWU7QUFNUixXQU5QLGVBQWUsR0FNTDs7OzBCQU5WLGVBQWU7O0FBT2pCLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQTtBQUNyQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsb0NBQW9DLEVBQUUsVUFBQyxnQkFBZ0IsRUFBSztBQUNyRyxVQUFNLFlBQVksR0FBRyxPQUFPLE1BQUssZ0JBQWdCLEtBQUssV0FBVyxDQUFBO0FBQ2pFLFlBQUssZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUE7QUFDeEMsVUFBSSxZQUFZLEVBQUU7QUFDaEIsY0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFBO09BQ25DO0tBQ0YsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6RCx3Q0FBa0MsRUFBRSxzQ0FBQyxLQUFLLEVBQUs7QUFDN0MsWUFBSSxNQUFLLFFBQVEsRUFBRTtBQUNqQixpQkFBTTtTQUNQO0FBQ0QsY0FBSyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3BCLGNBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQTs7O0FBR2xDLFlBQUksS0FBSyxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRTs7QUFFeEQsa0JBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFNBQVMsYUFBYSxHQUFHOztBQUUvRCxvQkFBUSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUE7QUFDekQsZ0JBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFBO1dBQ2pHLENBQUMsQ0FBQTtTQUNIO09BQ0Y7QUFDRCwwQ0FBb0MsRUFBRSwwQ0FBTTtBQUMxQyxjQUFLLFFBQVEsR0FBRyxLQUFLLENBQUE7QUFDckIsY0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUE7T0FDckM7S0FDRixDQUFDLENBQUMsQ0FBQTtHQUNKOztlQTFDRyxlQUFlOztXQTJDTCx3QkFBQyxRQUFxQixFQUFjO0FBQ2hELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2xEOzs7V0FDYSx3QkFBQyxRQUFxQixFQUFjO0FBQ2hELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2xEOzs7V0FDZSwwQkFBQyxRQUFxQixFQUFjO0FBQ2xELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDcEQ7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUN2Qjs7O1NBdERHLGVBQWU7OztBQXlEckIsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3Rvb2x0aXAvZGVsZWdhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIHsgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbmNsYXNzIFRvb2x0aXBEZWxlZ2F0ZSB7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIGV4cGFuZGVkOiBib29sZWFuO1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBzaG93UHJvdmlkZXJOYW1lOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLmV4cGFuZGVkID0gZmFsc2VcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dQcm92aWRlck5hbWUnLCAoc2hvd1Byb3ZpZGVyTmFtZSkgPT4ge1xuICAgICAgY29uc3Qgc2hvdWxkVXBkYXRlID0gdHlwZW9mIHRoaXMuc2hvd1Byb3ZpZGVyTmFtZSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHRoaXMuc2hvd1Byb3ZpZGVyTmFtZSA9IHNob3dQcm92aWRlck5hbWVcbiAgICAgIGlmIChzaG91bGRVcGRhdGUpIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3Nob3VsZC11cGRhdGUnKVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OmV4cGFuZC10b29sdGlwJzogKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmV4cGFuZGVkKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5leHBhbmRlZCA9IHRydWVcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3Nob3VsZC1leHBhbmQnKVxuXG4gICAgICAgIC8vIElmIGJvdW5kIHRvIGEga2V5LCBjb2xsYXBzZSB3aGVuIHRoYXQga2V5IGlzIHJlbGVhc2VkLCBqdXN0IGxpa2Ugb2xkIHRpbWVzXG4gICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQuaXNUcnVzdGVkKSB7XG4gICAgICAgICAgLy8gJEZsb3dJZ25vcmU6IGRvY3VtZW50LmJvZHkgaXMgbmV2ZXIgbnVsbFxuICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbiBldmVudExpc3RlbmVyKCkge1xuICAgICAgICAgICAgLy8gJEZsb3dJZ25vcmU6IGRvY3VtZW50LmJvZHkgaXMgbmV2ZXIgbnVsbFxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIGV2ZW50TGlzdGVuZXIpXG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdsaW50ZXItdWktZGVmYXVsdDpjb2xsYXBzZS10b29sdGlwJylcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OmNvbGxhcHNlLXRvb2x0aXAnOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuZXhwYW5kZWQgPSBmYWxzZVxuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnc2hvdWxkLWNvbGxhcHNlJylcbiAgICAgIH0sXG4gICAgfSkpXG4gIH1cbiAgb25TaG91bGRVcGRhdGUoY2FsbGJhY2s6ICgoKSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignc2hvdWxkLXVwZGF0ZScsIGNhbGxiYWNrKVxuICB9XG4gIG9uU2hvdWxkRXhwYW5kKGNhbGxiYWNrOiAoKCkgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3Nob3VsZC1leHBhbmQnLCBjYWxsYmFjaylcbiAgfVxuICBvblNob3VsZENvbGxhcHNlKGNhbGxiYWNrOiAoKCkgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3Nob3VsZC1jb2xsYXBzZScsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5lbWl0dGVyLmRpc3Bvc2UoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVG9vbHRpcERlbGVnYXRlXG4iXX0=