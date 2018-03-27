var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _element = require('./element');

var _element2 = _interopRequireDefault(_element);

var _helpers = require('../helpers');

var StatusBar = (function () {
  function StatusBar() {
    var _this = this;

    _classCallCheck(this, StatusBar);

    this.element = new _element2['default']();
    this.messages = [];
    this.subscriptions = new _atom.CompositeDisposable();

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
    this.subscriptions.add(atom.config.observe('linter-ui-default.showStatusBar', function (showStatusBar) {
      _this.element.setVisibility('config', showStatusBar);
    }));
    this.subscriptions.add(atom.workspace.getCenter().observeActivePaneItem(function (paneItem) {
      var isTextEditor = atom.workspace.isTextEditor(paneItem);
      _this.element.setVisibility('pane', isTextEditor);
      if (isTextEditor && _this.statusBarRepresents === 'Current File') {
        _this.update();
      }
    }));

    this.element.onDidClick(function (type) {
      var workspaceView = atom.views.getView(atom.workspace);
      if (_this.statusBarClickBehavior === 'Toggle Panel') {
        atom.commands.dispatch(workspaceView, 'linter-ui-default:toggle-panel');
      } else if (_this.statusBarClickBehavior === 'Toggle Status Bar Scope') {
        atom.config.set('linter-ui-default.statusBarRepresents', _this.statusBarRepresents === 'Entire Project' ? 'Current File' : 'Entire Project');
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
      var currentTextEditor = (0, _helpers.getActiveTextEditor)();
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
          priority: statusBarPosition === 'Left' ? 0 : 1000
        });
      }));
      this.subscriptions.add(new _atom.Disposable(function () {
        if (statusBar) {
          statusBar.destroy();
        }
      }));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }]);

  return StatusBar;
})();

module.exports = StatusBar;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9zdGF0dXMtYmFyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztvQkFFZ0QsTUFBTTs7dUJBRWxDLFdBQVc7Ozs7dUJBQ1ksWUFBWTs7SUFHakQsU0FBUztBQU9GLFdBUFAsU0FBUyxHQU9DOzs7MEJBUFYsU0FBUzs7QUFRWCxRQUFJLENBQUMsT0FBTyxHQUFHLDBCQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHVDQUF1QyxFQUFFLFVBQUMsbUJBQW1CLEVBQUs7QUFDM0csVUFBTSxVQUFVLEdBQUcsT0FBTyxNQUFLLG1CQUFtQixLQUFLLFdBQVcsQ0FBQTtBQUNsRSxZQUFLLG1CQUFtQixHQUFHLG1CQUFtQixDQUFBO0FBQzlDLFVBQUksVUFBVSxFQUFFO0FBQ2QsY0FBSyxNQUFNLEVBQUUsQ0FBQTtPQUNkO0tBQ0YsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywwQ0FBMEMsRUFBRSxVQUFDLHNCQUFzQixFQUFLO0FBQ2pILFVBQU0sVUFBVSxHQUFHLE9BQU8sTUFBSyxzQkFBc0IsS0FBSyxXQUFXLENBQUE7QUFDckUsWUFBSyxzQkFBc0IsR0FBRyxzQkFBc0IsQ0FBQTtBQUNwRCxVQUFJLFVBQVUsRUFBRTtBQUNkLGNBQUssTUFBTSxFQUFFLENBQUE7T0FDZDtLQUNGLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFB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QUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQzVEOzs7V0FDSyxnQkFBQyxpQkFBeUIsRUFBRTs7O0FBQ2hDLFVBQUksU0FBUyxHQUFHLElBQUksQ0FBQTs7QUFFcEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMscUNBQXFDLEVBQUUsVUFBQyxpQkFBaUIsRUFBSztBQUN2RyxZQUFJLFNBQVMsRUFBRTtBQUNiLG1CQUFTLENBQUMsT0FBTyxFQUFFLENBQUE7U0FDcEI7QUFDRCxpQkFBUyxHQUFHLGlCQUFpQixTQUFPLGlCQUFpQixVQUFPLENBQUM7QUFDM0QsY0FBSSxFQUFFLE9BQUssT0FBTyxDQUFDLElBQUk7QUFDdkIsa0JBQVEsRUFBRSxpQkFBaUIsS0FBSyxNQUFNLEdBQUcsQ0FBQyxHQUFHLElBQUk7U0FDbEQsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFDLENBQUE7QUFDSCxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxxQkFBZSxZQUFXO0FBQy9DLFlBQUksU0FBUyxFQUFFO0FBQ2IsbUJBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtTQUNwQjtPQUNGLENBQUMsQ0FBQyxDQUFBO0tBQ0o7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3Qjs7O1NBL0ZHLFNBQVM7OztBQWtHZixNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvc3RhdHVzLWJhci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5pbXBvcnQgRWxlbWVudCBmcm9tICcuL2VsZW1lbnQnXG5pbXBvcnQgeyAkZmlsZSwgZ2V0QWN0aXZlVGV4dEVkaXRvciB9IGZyb20gJy4uL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcydcblxuY2xhc3MgU3RhdHVzQmFyIHtcbiAgZWxlbWVudDogRWxlbWVudDtcbiAgbWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+O1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBzdGF0dXNCYXJSZXByZXNlbnRzOiAnRW50aXJlIFByb2plY3QnIHwgJ0N1cnJlbnQgRmlsZSc7XG4gIHN0YXR1c0JhckNsaWNrQmVoYXZpb3I6ICdUb2dnbGUgUGFuZWwnIHwgJ0p1bXAgdG8gbmV4dCBpc3N1ZScgfCAnVG9nZ2xlIFN0YXR1cyBCYXIgU2NvcGUnO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZWxlbWVudCA9IG5ldyBFbGVtZW50KClcbiAgICB0aGlzLm1lc3NhZ2VzID0gW11cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZWxlbWVudClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnN0YXR1c0JhclJlcHJlc2VudHMnLCAoc3RhdHVzQmFyUmVwcmVzZW50cykgPT4ge1xuICAgICAgY29uc3Qgbm90SW5pdGlhbCA9IHR5cGVvZiB0aGlzLnN0YXR1c0JhclJlcHJlc2VudHMgIT09ICd1bmRlZmluZWQnXG4gICAgICB0aGlzLnN0YXR1c0JhclJlcHJlc2VudHMgPSBzdGF0dXNCYXJSZXByZXNlbnRzXG4gICAgICBpZiAobm90SW5pdGlhbCkge1xuICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5zdGF0dXNCYXJDbGlja0JlaGF2aW9yJywgKHN0YXR1c0JhckNsaWNrQmVoYXZpb3IpID0+IHtcbiAgICAgIGNvbnN0IG5vdEluaXRpYWwgPSB0eXBlb2YgdGhpcy5zdGF0dXNCYXJDbGlja0JlaGF2aW9yICE9PSAndW5kZWZpbmVkJ1xuICAgICAgdGhpcy5zdGF0dXNCYXJDbGlja0JlaGF2aW9yID0gc3RhdHVzQmFyQ2xpY2tCZWhhdmlvclxuICAgICAgaWYgKG5vdEluaXRpYWwpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuc2hvd1N0YXR1c0JhcicsIChzaG93U3RhdHVzQmFyKSA9PiB7XG4gICAgICB0aGlzLmVsZW1lbnQuc2V0VmlzaWJpbGl0eSgnY29uZmlnJywgc2hvd1N0YXR1c0JhcilcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLm9ic2VydmVBY3RpdmVQYW5lSXRlbSgocGFuZUl0ZW0pID0+IHtcbiAgICAgIGNvbnN0IGlzVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihwYW5lSXRlbSlcbiAgICAgIHRoaXMuZWxlbWVudC5zZXRWaXNpYmlsaXR5KCdwYW5lJywgaXNUZXh0RWRpdG9yKVxuICAgICAgaWYgKGlzVGV4dEVkaXRvciAmJiB0aGlzLnN0YXR1c0JhclJlcHJlc2VudHMgPT09ICdDdXJyZW50IEZpbGUnKSB7XG4gICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIHRoaXMuZWxlbWVudC5vbkRpZENsaWNrKCh0eXBlKSA9PiB7XG4gICAgICBjb25zdCB3b3Jrc3BhY2VWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgICAgaWYgKHRoaXMuc3RhdHVzQmFyQ2xpY2tCZWhhdmlvciA9PT0gJ1RvZ2dsZSBQYW5lbCcpIHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VWaWV3LCAnbGludGVyLXVpLWRlZmF1bHQ6dG9nZ2xlLXBhbmVsJylcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0dXNCYXJDbGlja0JlaGF2aW9yID09PSAnVG9nZ2xlIFN0YXR1cyBCYXIgU2NvcGUnKSB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLXVpLWRlZmF1bHQuc3RhdHVzQmFyUmVwcmVzZW50cycsIHRoaXMuc3RhdHVzQmFyUmVwcmVzZW50cyA9PT0gJ0VudGlyZSBQcm9qZWN0JyA/ICdDdXJyZW50IEZpbGUnIDogJ0VudGlyZSBQcm9qZWN0JylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHBvc3RmaXggPSB0aGlzLnN0YXR1c0JhclJlcHJlc2VudHMgPT09ICdDdXJyZW50IEZpbGUnID8gJy1pbi1jdXJyZW50LWZpbGUnIDogJydcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VWaWV3LCBgbGludGVyLXVpLWRlZmF1bHQ6bmV4dC0ke3R5cGV9JHtwb3N0Zml4fWApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICB1cGRhdGUobWVzc2FnZXM6ID9BcnJheTxMaW50ZXJNZXNzYWdlPiA9IG51bGwpOiB2b2lkIHtcbiAgICBpZiAobWVzc2FnZXMpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSBtZXNzYWdlc1xuICAgIH0gZWxzZSB7XG4gICAgICBtZXNzYWdlcyA9IHRoaXMubWVzc2FnZXNcbiAgICB9XG5cbiAgICBjb25zdCBjb3VudCA9IHsgZXJyb3I6IDAsIHdhcm5pbmc6IDAsIGluZm86IDAgfVxuICAgIGNvbnN0IGN1cnJlbnRUZXh0RWRpdG9yID0gZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgY29uc3QgY3VycmVudFBhdGggPSAoY3VycmVudFRleHRFZGl0b3IgJiYgY3VycmVudFRleHRFZGl0b3IuZ2V0UGF0aCgpKSB8fCBOYU5cbiAgICAvLyBOT1RFOiBeIFNldHRpbmcgZGVmYXVsdCB0byBOYU4gc28gaXQgd29uJ3QgbWF0Y2ggZW1wdHkgZmlsZSBwYXRocyBpbiBtZXNzYWdlc1xuXG4gICAgbWVzc2FnZXMuZm9yRWFjaCgobWVzc2FnZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuc3RhdHVzQmFyUmVwcmVzZW50cyA9PT0gJ0VudGlyZSBQcm9qZWN0JyB8fCAkZmlsZShtZXNzYWdlKSA9PT0gY3VycmVudFBhdGgpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2Uuc2V2ZXJpdHkgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICBjb3VudC5lcnJvcisrXG4gICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS5zZXZlcml0eSA9PT0gJ3dhcm5pbmcnKSB7XG4gICAgICAgICAgY291bnQud2FybmluZysrXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY291bnQuaW5mbysrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMuZWxlbWVudC51cGRhdGUoY291bnQuZXJyb3IsIGNvdW50Lndhcm5pbmcsIGNvdW50LmluZm8pXG4gIH1cbiAgYXR0YWNoKHN0YXR1c0JhclJlZ2lzdHJ5OiBPYmplY3QpIHtcbiAgICBsZXQgc3RhdHVzQmFyID0gbnVsbFxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5zdGF0dXNCYXJQb3NpdGlvbicsIChzdGF0dXNCYXJQb3NpdGlvbikgPT4ge1xuICAgICAgaWYgKHN0YXR1c0Jhcikge1xuICAgICAgICBzdGF0dXNCYXIuZGVzdHJveSgpXG4gICAgICB9XG4gICAgICBzdGF0dXNCYXIgPSBzdGF0dXNCYXJSZWdpc3RyeVtgYWRkJHtzdGF0dXNCYXJQb3NpdGlvbn1UaWxlYF0oe1xuICAgICAgICBpdGVtOiB0aGlzLmVsZW1lbnQuaXRlbSxcbiAgICAgICAgcHJpb3JpdHk6IHN0YXR1c0JhclBvc2l0aW9uID09PSAnTGVmdCcgPyAwIDogMTAwMCxcbiAgICAgIH0pXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZShmdW5jdGlvbigpIHtcbiAgICAgIGlmIChzdGF0dXNCYXIpIHtcbiAgICAgICAgc3RhdHVzQmFyLmRlc3Ryb3koKVxuICAgICAgfVxuICAgIH0pKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdHVzQmFyXG4iXX0=