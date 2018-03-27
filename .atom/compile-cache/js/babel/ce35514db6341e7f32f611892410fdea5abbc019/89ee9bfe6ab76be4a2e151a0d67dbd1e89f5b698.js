Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sbEventKit = require('sb-event-kit');

var _element = require('./element');

var _element2 = _interopRequireDefault(_element);

var _helpers = require('../helpers');

var StatusBar = (function () {
  function StatusBar() {
    var _this = this;

    _classCallCheck(this, StatusBar);

    this.element = new _element2['default']();
    this.messages = [];
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.element);
    this.subscriptions.add(atom.config.observe('linter-ui-default.statusBarRepresents', function (statusBarRepresents) {
      var notInitial = typeof _this.statusBarRepresents !== 'undefined';
      _this.statusBarRepresents = statusBarRepresents;
      if (notInitial) {
        _this.update();
      }
    }));
    this.subscriptions.add(atom.config.observe('linter-ui-default.statusBarClickBehavior', function (statusBarClickBehavior) {
      var notInitial = typeof _this.statusBarClickBehavior !== 'undefined';
      _this.statusBarClickBehavior = statusBarClickBehavior;
      if (notInitial) {
        _this.update();
      }
    }));
    this.subscriptions.add(atom.workspace.observeActivePaneItem(function (paneItem) {
      var isTextEditor = atom.workspace.isTextEditor(paneItem);
      _this.element.setVisibility(isTextEditor);
      if (isTextEditor && _this.statusBarRepresents === 'Current File') {
        _this.update();
      }
    }));

    this.element.onDidClick(function (type) {
      var workspaceView = atom.views.getView(atom.workspace);
      if (_this.statusBarClickBehavior === 'Toggle Panel') {
        atom.commands.dispatch(workspaceView, 'linter-ui-default:toggle-panel');
      } else {
        var postfix = _this.statusBarRepresents === 'Current File' ? '-in-current-file' : '';
        atom.commands.dispatch(workspaceView, 'linter-ui-default:next-' + type + postfix);
      }
    });
  }

  _createClass(StatusBar, [{
    key: 'update',
    value: function update() {
      var _this2 = this;

      var messages = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (messages) {
        this.messages = messages;
      } else {
        messages = this.messages;
      }

      var count = { error: 0, warning: 0, info: 0 };
      var currentTextEditor = atom.workspace.getActiveTextEditor();
      var currentPath = currentTextEditor && currentTextEditor.getPath() || NaN;
      // NOTE: ^ Setting default to NaN so it won't match empty file paths in messages

      messages.forEach(function (message) {
        if (_this2.statusBarRepresents === 'Entire Project' || (0, _helpers.$file)(message) === currentPath) {
          if (message.severity === 'error') {
            count.error++;
          } else if (message.severity === 'warning') {
            count.warning++;
          } else {
            count.info++;
          }
        }
      });
      this.element.update(count.error, count.warning, count.info);
    }
  }, {
    key: 'attach',
    value: function attach(statusBarRegistry) {
      var _this3 = this;

      var statusBar = null;

      this.subscriptions.add(atom.config.observe('linter-ui-default.statusBarPosition', function (statusBarPosition) {
        if (statusBar) {
          statusBar.destroy();
        }
        statusBar = statusBarRegistry['add' + statusBarPosition + 'Tile']({
          item: _this3.element.item,
          priority: statusBarPosition === 'Left' ? 5 : 1000
        });
      }));
      this.subscriptions.add(function () {
        if (statusBar) {
          statusBar.destroy();
        }
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }]);

  return StatusBar;
})();

exports['default'] = StatusBar;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9zdGF0dXMtYmFyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7MEJBRW9DLGNBQWM7O3VCQUU5QixXQUFXOzs7O3VCQUNULFlBQVk7O0lBR2IsU0FBUztBQU9qQixXQVBRLFNBQVMsR0FPZDs7OzBCQVBLLFNBQVM7O0FBUTFCLFFBQUksQ0FBQyxPQUFPLEdBQUcsMEJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixRQUFJLENBQUMsYUFBYSxHQUFHLHFDQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsdUNBQXVDLEVBQUUsVUFBQyxtQkFBbUIsRUFBSztBQUMzRyxVQUFNLFVBQVUsR0FBRyxPQUFPLE1BQUssbUJBQW1CLEtBQUssV0FBVyxDQUFBO0FBQ2xFLFlBQUssbUJBQW1CLEdBQUcsbUJBQW1CLENBQUE7QUFDOUMsVUFBSSxVQUFVLEVBQUU7QUFDZCxjQUFLLE1BQU0sRUFBRSxDQUFBO09BQ2Q7S0FDRixDQUFDLENBQUMsQ0FBQTtBQUNILFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDBDQUEwQyxFQUFFLFVBQUMsc0JBQXNCLEVBQUs7QUFDakgsVUFBTSxVQUFVLEdBQUcsT0FBTyxNQUFLLHNCQUFzQixLQUFLLFdBQVcsQ0FBQTtBQUNyRSxZQUFLLHNCQUFzQixHQUFHLHNCQUFzQixDQUFBO0FBQ3BELFVBQUksVUFBVSxFQUFFO0FBQ2QsY0FBSyxNQUFNLEVBQUUsQ0FBQTtPQUNkO0tBQ0YsQ0FBQyxDQUFD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RUFBRSxPQUFLLE9BQU8sQ0FBQyxJQUFJO0FBQ3ZCLGtCQUFRLEVBQUUsaUJBQWlCLEtBQUssTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJO1NBQ2xELENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQyxDQUFBO0FBQ0gsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsWUFBVztBQUNoQyxZQUFJLFNBQVMsRUFBRTtBQUNiLG1CQUFTLENBQUMsT0FBTyxFQUFFLENBQUE7U0FDcEI7T0FDRixDQUFDLENBQUE7S0FDSDs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQzdCOzs7U0ExRmtCLFNBQVM7OztxQkFBVCxTQUFTIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9zdGF0dXMtYmFyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ3NiLWV2ZW50LWtpdCdcblxuaW1wb3J0IEVsZW1lbnQgZnJvbSAnLi9lbGVtZW50J1xuaW1wb3J0IHsgJGZpbGUgfSBmcm9tICcuLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXR1c0JhciB7XG4gIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gIG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgc3RhdHVzQmFyUmVwcmVzZW50czogJ0VudGlyZSBQcm9qZWN0JyB8ICdDdXJyZW50IEZpbGUnO1xuICBzdGF0dXNCYXJDbGlja0JlaGF2aW9yOiAnVG9nZ2xlIFBhbmVsJyB8ICdKdW1wIHRvIG5leHQgaXNzdWUnO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZWxlbWVudCA9IG5ldyBFbGVtZW50KClcbiAgICB0aGlzLm1lc3NhZ2VzID0gW11cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZWxlbWVudClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnN0YXR1c0JhclJlcHJlc2VudHMnLCAoc3RhdHVzQmFyUmVwcmVzZW50cykgPT4ge1xuICAgICAgY29uc3Qgbm90SW5pdGlhbCA9IHR5cGVvZiB0aGlzLnN0YXR1c0JhclJlcHJlc2VudHMgIT09ICd1bmRlZmluZWQnXG4gICAgICB0aGlzLnN0YXR1c0JhclJlcHJlc2VudHMgPSBzdGF0dXNCYXJSZXByZXNlbnRzXG4gICAgICBpZiAobm90SW5pdGlhbCkge1xuICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5zdGF0dXNCYXJDbGlja0JlaGF2aW9yJywgKHN0YXR1c0JhckNsaWNrQmVoYXZpb3IpID0+IHtcbiAgICAgIGNvbnN0IG5vdEluaXRpYWwgPSB0eXBlb2YgdGhpcy5zdGF0dXNCYXJDbGlja0JlaGF2aW9yICE9PSAndW5kZWZpbmVkJ1xuICAgICAgdGhpcy5zdGF0dXNCYXJDbGlja0JlaGF2aW9yID0gc3RhdHVzQmFyQ2xpY2tCZWhhdmlvclxuICAgICAgaWYgKG5vdEluaXRpYWwpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZUFjdGl2ZVBhbmVJdGVtKChwYW5lSXRlbSkgPT4ge1xuICAgICAgY29uc3QgaXNUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKHBhbmVJdGVtKVxuICAgICAgdGhpcy5lbGVtZW50LnNldFZpc2liaWxpdHkoaXNUZXh0RWRpdG9yKVxuICAgICAgaWYgKGlzVGV4dEVkaXRvciAmJiB0aGlzLnN0YXR1c0JhclJlcHJlc2VudHMgPT09ICdDdXJyZW50IEZpbGUnKSB7XG4gICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIHRoaXMuZWxlbWVudC5vbkRpZENsaWNrKCh0eXBlKSA9PiB7XG4gICAgICBjb25zdCB3b3Jrc3BhY2VWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgICAgaWYgKHRoaXMuc3RhdHVzQmFyQ2xpY2tCZWhhdmlvciA9PT0gJ1RvZ2dsZSBQYW5lbCcpIHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VWaWV3LCAnbGludGVyLXVpLWRlZmF1bHQ6dG9nZ2xlLXBhbmVsJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHBvc3RmaXggPSB0aGlzLnN0YXR1c0JhclJlcHJlc2VudHMgPT09ICdDdXJyZW50IEZpbGUnID8gJy1pbi1jdXJyZW50LWZpbGUnIDogJydcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VWaWV3LCBgbGludGVyLXVpLWRlZmF1bHQ6bmV4dC0ke3R5cGV9JHtwb3N0Zml4fWApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICB1cGRhdGUobWVzc2FnZXM6ID9BcnJheTxMaW50ZXJNZXNzYWdlPiA9IG51bGwpOiB2b2lkIHtcbiAgICBpZiAobWVzc2FnZXMpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSBtZXNzYWdlc1xuICAgIH0gZWxzZSB7XG4gICAgICBtZXNzYWdlcyA9IHRoaXMubWVzc2FnZXNcbiAgICB9XG5cbiAgICBjb25zdCBjb3VudCA9IHsgZXJyb3I6IDAsIHdhcm5pbmc6IDAsIGluZm86IDAgfVxuICAgIGNvbnN0IGN1cnJlbnRUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgY29uc3QgY3VycmVudFBhdGggPSAoY3VycmVudFRleHRFZGl0b3IgJiYgY3VycmVudFRleHRFZGl0b3IuZ2V0UGF0aCgpKSB8fCBOYU5cbiAgICAvLyBOT1RFOiBeIFNldHRpbmcgZGVmYXVsdCB0byBOYU4gc28gaXQgd29uJ3QgbWF0Y2ggZW1wdHkgZmlsZSBwYXRocyBpbiBtZXNzYWdlc1xuXG4gICAgbWVzc2FnZXMuZm9yRWFjaCgobWVzc2FnZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuc3RhdHVzQmFyUmVwcmVzZW50cyA9PT0gJ0VudGlyZSBQcm9qZWN0JyB8fCAkZmlsZShtZXNzYWdlKSA9PT0gY3VycmVudFBhdGgpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2Uuc2V2ZXJpdHkgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICBjb3VudC5lcnJvcisrXG4gICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS5zZXZlcml0eSA9PT0gJ3dhcm5pbmcnKSB7XG4gICAgICAgICAgY291bnQud2FybmluZysrXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY291bnQuaW5mbysrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMuZWxlbWVudC51cGRhdGUoY291bnQuZXJyb3IsIGNvdW50Lndhcm5pbmcsIGNvdW50LmluZm8pXG4gIH1cbiAgYXR0YWNoKHN0YXR1c0JhclJlZ2lzdHJ5OiBPYmplY3QpIHtcbiAgICBsZXQgc3RhdHVzQmFyID0gbnVsbFxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5zdGF0dXNCYXJQb3NpdGlvbicsIChzdGF0dXNCYXJQb3NpdGlvbikgPT4ge1xuICAgICAgaWYgKHN0YXR1c0Jhcikge1xuICAgICAgICBzdGF0dXNCYXIuZGVzdHJveSgpXG4gICAgICB9XG4gICAgICBzdGF0dXNCYXIgPSBzdGF0dXNCYXJSZWdpc3RyeVtgYWRkJHtzdGF0dXNCYXJQb3NpdGlvbn1UaWxlYF0oe1xuICAgICAgICBpdGVtOiB0aGlzLmVsZW1lbnQuaXRlbSxcbiAgICAgICAgcHJpb3JpdHk6IHN0YXR1c0JhclBvc2l0aW9uID09PSAnTGVmdCcgPyA1IDogMTAwMCxcbiAgICAgIH0pXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChmdW5jdGlvbigpIHtcbiAgICAgIGlmIChzdGF0dXNCYXIpIHtcbiAgICAgICAgc3RhdHVzQmFyLmRlc3Ryb3koKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cbiJdfQ==