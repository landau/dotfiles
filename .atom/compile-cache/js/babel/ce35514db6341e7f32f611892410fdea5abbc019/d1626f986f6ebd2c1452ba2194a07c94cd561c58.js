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
    this.subscriptions.add(atom.workspace.observeActivePaneItem(function (paneItem) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9zdGF0dXMtYmFyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztvQkFFZ0QsTUFBTTs7dUJBRWxDLFdBQVc7Ozs7dUJBQ1QsWUFBWTs7SUFHNUIsU0FBUztBQU9GLFdBUFAsU0FBUyxHQU9DOzs7MEJBUFYsU0FBUzs7QUFRWCxRQUFJLENBQUMsT0FBTyxHQUFHLDBCQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHVDQUF1QyxFQUFFLFVBQUMsbUJBQW1CLEVBQUs7QUFDM0csVUFBTSxVQUFVLEdBQUcsT0FBTyxNQUFLLG1CQUFtQixLQUFLLFdBQVcsQ0FBQTtBQUNsRSxZQUFLLG1CQUFtQixHQUFHLG1CQUFtQixDQUFBO0FBQzlDLFVBQUksVUFBVSxFQUFFO0FBQ2QsY0FBSyxNQUFNLEVBQUUsQ0FBQTtPQUNkO0tBQ0YsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywwQ0FBMEMsRUFBRSxVQUFDLHNCQUFzQixFQUFLO0FBQ2pILFVBQU0sVUFBVSxHQUFHLE9BQU8sTUFBSyxzQkFBc0IsS0FBSyxXQUFXLENBQUE7QUFDckUsWUFBSyxzQkFBc0IsR0FBRyxzQkFBc0IsQ0FBQTtBQUNwRCxVQUFJLFVBQVUsRUFBRTtBQUNkLGNBQUssTUFBTSxFQUFFLENBQUE7T0FDZDtLQUNGLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFB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QUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUM1RDs7O1dBQ0ssZ0JBQUMsaUJBQXlCLEVBQUU7OztBQUNoQyxVQUFJLFNBQVMsR0FBRyxJQUFJLENBQUE7O0FBRXBCLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHFDQUFxQyxFQUFFLFVBQUMsaUJBQWlCLEVBQUs7QUFDdkcsWUFBSSxTQUFTLEVBQUU7QUFDYixtQkFBUyxDQUFDLE9BQU8sRUFBRSxDQUFBO1NBQ3BCO0FBQ0QsaUJBQVMsR0FBRyxpQkFBaUIsU0FBTyxpQkFBaUIsVUFBTyxDQUFDO0FBQzNELGNBQUksRUFBRSxPQUFLLE9BQU8sQ0FBQyxJQUFJO0FBQ3ZCLGtCQUFRLEVBQUUsaUJBQWlCLEtBQUssTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJO1NBQ2xELENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQyxDQUFBO0FBQ0gsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMscUJBQWUsWUFBVztBQUMvQyxZQUFJLFNBQVMsRUFBRTtBQUNiLG1CQUFTLENBQUMsT0FBTyxFQUFFLENBQUE7U0FDcEI7T0FDRixDQUFDLENBQUMsQ0FBQTtLQUNKOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDN0I7OztTQS9GRyxTQUFTOzs7QUFrR2YsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3N0YXR1cy1iYXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IEVsZW1lbnQgZnJvbSAnLi9lbGVtZW50J1xuaW1wb3J0IHsgJGZpbGUgfSBmcm9tICcuLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMnXG5cbmNsYXNzIFN0YXR1c0JhciB7XG4gIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gIG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgc3RhdHVzQmFyUmVwcmVzZW50czogJ0VudGlyZSBQcm9qZWN0JyB8ICdDdXJyZW50IEZpbGUnO1xuICBzdGF0dXNCYXJDbGlja0JlaGF2aW9yOiAnVG9nZ2xlIFBhbmVsJyB8ICdKdW1wIHRvIG5leHQgaXNzdWUnIHwgJ1RvZ2dsZSBTdGF0dXMgQmFyIFNjb3BlJztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBuZXcgRWxlbWVudCgpXG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVsZW1lbnQpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5zdGF0dXNCYXJSZXByZXNlbnRzJywgKHN0YXR1c0JhclJlcHJlc2VudHMpID0+IHtcbiAgICAgIGNvbnN0IG5vdEluaXRpYWwgPSB0eXBlb2YgdGhpcy5zdGF0dXNCYXJSZXByZXNlbnRzICE9PSAndW5kZWZpbmVkJ1xuICAgICAgdGhpcy5zdGF0dXNCYXJSZXByZXNlbnRzID0gc3RhdHVzQmFyUmVwcmVzZW50c1xuICAgICAgaWYgKG5vdEluaXRpYWwpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuc3RhdHVzQmFyQ2xpY2tCZWhhdmlvcicsIChzdGF0dXNCYXJDbGlja0JlaGF2aW9yKSA9PiB7XG4gICAgICBjb25zdCBub3RJbml0aWFsID0gdHlwZW9mIHRoaXMuc3RhdHVzQmFyQ2xpY2tCZWhhdmlvciAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHRoaXMuc3RhdHVzQmFyQ2xpY2tCZWhhdmlvciA9IHN0YXR1c0JhckNsaWNrQmVoYXZpb3JcbiAgICAgIGlmIChub3RJbml0aWFsKSB7XG4gICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dTdGF0dXNCYXInLCAoc2hvd1N0YXR1c0JhcikgPT4ge1xuICAgICAgdGhpcy5lbGVtZW50LnNldFZpc2liaWxpdHkoJ2NvbmZpZycsIHNob3dTdGF0dXNCYXIpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlQWN0aXZlUGFuZUl0ZW0oKHBhbmVJdGVtKSA9PiB7XG4gICAgICBjb25zdCBpc1RleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IocGFuZUl0ZW0pXG4gICAgICB0aGlzLmVsZW1lbnQuc2V0VmlzaWJpbGl0eSgncGFuZScsIGlzVGV4dEVkaXRvcilcbiAgICAgIGlmIChpc1RleHRFZGl0b3IgJiYgdGhpcy5zdGF0dXNCYXJSZXByZXNlbnRzID09PSAnQ3VycmVudCBGaWxlJykge1xuICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICB0aGlzLmVsZW1lbnQub25EaWRDbGljaygodHlwZSkgPT4ge1xuICAgICAgY29uc3Qgd29ya3NwYWNlVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgIGlmICh0aGlzLnN0YXR1c0JhckNsaWNrQmVoYXZpb3IgPT09ICdUb2dnbGUgUGFuZWwnKSB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlVmlldywgJ2xpbnRlci11aS1kZWZhdWx0OnRvZ2dsZS1wYW5lbCcpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdHVzQmFyQ2xpY2tCZWhhdmlvciA9PT0gJ1RvZ2dsZSBTdGF0dXMgQmFyIFNjb3BlJykge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci11aS1kZWZhdWx0LnN0YXR1c0JhclJlcHJlc2VudHMnLCB0aGlzLnN0YXR1c0JhclJlcHJlc2VudHMgPT09ICdFbnRpcmUgUHJvamVjdCcgPyAnQ3VycmVudCBGaWxlJyA6ICdFbnRpcmUgUHJvamVjdCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBwb3N0Zml4ID0gdGhpcy5zdGF0dXNCYXJSZXByZXNlbnRzID09PSAnQ3VycmVudCBGaWxlJyA/ICctaW4tY3VycmVudC1maWxlJyA6ICcnXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlVmlldywgYGxpbnRlci11aS1kZWZhdWx0Om5leHQtJHt0eXBlfSR7cG9zdGZpeH1gKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgdXBkYXRlKG1lc3NhZ2VzOiA/QXJyYXk8TGludGVyTWVzc2FnZT4gPSBudWxsKTogdm9pZCB7XG4gICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzID0gbWVzc2FnZXNcbiAgICB9IGVsc2Uge1xuICAgICAgbWVzc2FnZXMgPSB0aGlzLm1lc3NhZ2VzXG4gICAgfVxuXG4gICAgY29uc3QgY291bnQgPSB7IGVycm9yOiAwLCB3YXJuaW5nOiAwLCBpbmZvOiAwIH1cbiAgICBjb25zdCBjdXJyZW50VGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGNvbnN0IGN1cnJlbnRQYXRoID0gKGN1cnJlbnRUZXh0RWRpdG9yICYmIGN1cnJlbnRUZXh0RWRpdG9yLmdldFBhdGgoKSkgfHwgTmFOXG4gICAgLy8gTk9URTogXiBTZXR0aW5nIGRlZmF1bHQgdG8gTmFOIHNvIGl0IHdvbid0IG1hdGNoIGVtcHR5IGZpbGUgcGF0aHMgaW4gbWVzc2FnZXNcblxuICAgIG1lc3NhZ2VzLmZvckVhY2goKG1lc3NhZ2UpID0+IHtcbiAgICAgIGlmICh0aGlzLnN0YXR1c0JhclJlcHJlc2VudHMgPT09ICdFbnRpcmUgUHJvamVjdCcgfHwgJGZpbGUobWVzc2FnZSkgPT09IGN1cnJlbnRQYXRoKSB7XG4gICAgICAgIGlmIChtZXNzYWdlLnNldmVyaXR5ID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgY291bnQuZXJyb3IrK1xuICAgICAgICB9IGVsc2UgaWYgKG1lc3NhZ2Uuc2V2ZXJpdHkgPT09ICd3YXJuaW5nJykge1xuICAgICAgICAgIGNvdW50Lndhcm5pbmcrK1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvdW50LmluZm8rK1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLmVsZW1lbnQudXBkYXRlKGNvdW50LmVycm9yLCBjb3VudC53YXJuaW5nLCBjb3VudC5pbmZvKVxuICB9XG4gIGF0dGFjaChzdGF0dXNCYXJSZWdpc3RyeTogT2JqZWN0KSB7XG4gICAgbGV0IHN0YXR1c0JhciA9IG51bGxcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuc3RhdHVzQmFyUG9zaXRpb24nLCAoc3RhdHVzQmFyUG9zaXRpb24pID0+IHtcbiAgICAgIGlmIChzdGF0dXNCYXIpIHtcbiAgICAgICAgc3RhdHVzQmFyLmRlc3Ryb3koKVxuICAgICAgfVxuICAgICAgc3RhdHVzQmFyID0gc3RhdHVzQmFyUmVnaXN0cnlbYGFkZCR7c3RhdHVzQmFyUG9zaXRpb259VGlsZWBdKHtcbiAgICAgICAgaXRlbTogdGhpcy5lbGVtZW50Lml0ZW0sXG4gICAgICAgIHByaW9yaXR5OiBzdGF0dXNCYXJQb3NpdGlvbiA9PT0gJ0xlZnQnID8gMCA6IDEwMDAsXG4gICAgICB9KVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoc3RhdHVzQmFyKSB7XG4gICAgICAgIHN0YXR1c0Jhci5kZXN0cm95KClcbiAgICAgIH1cbiAgICB9KSlcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXR1c0JhclxuIl19