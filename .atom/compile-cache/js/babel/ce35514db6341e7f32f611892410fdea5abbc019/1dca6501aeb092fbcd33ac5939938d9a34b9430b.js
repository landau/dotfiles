Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _sbEventKit = require('sb-event-kit');

var _helpers = require('../helpers');

var PanelDelegate = (function () {
  function PanelDelegate(panel) {
    var _this = this;

    _classCallCheck(this, PanelDelegate);

    this.panel = panel;
    this.emitter = new _sbEventKit.Emitter();
    this.messages = [];
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(atom.config.observe('linter-ui-default.panelRepresents', function (panelRepresents) {
      var notInitial = typeof _this.panelRepresents !== 'undefined';
      _this.panelRepresents = panelRepresents;
      if (notInitial) {
        _this.update(_this.messages);
      }
    }));
    this.subscriptions.add(atom.config.observe('linter-ui-default.panelHeight', function (panelHeight) {
      var notInitial = typeof _this.panelHeight !== 'undefined';
      _this.panelHeight = panelHeight;
      if (notInitial) {
        _this.emitter.emit('observe-panel-config');
      }
    }));
    this.subscriptions.add(atom.config.observe('linter-ui-default.panelTakesMinimumHeight', function (panelTakesMinimumHeight) {
      var notInitial = typeof _this.panelTakesMinimumHeight !== 'undefined';
      _this.panelTakesMinimumHeight = panelTakesMinimumHeight;
      if (notInitial) {
        _this.emitter.emit('observe-panel-config');
      }
    }));

    var changeSubscription = undefined;
    this.subscriptions.add(atom.workspace.observeActivePaneItem(function (paneItem) {
      if (changeSubscription) {
        changeSubscription.dispose();
        changeSubscription = null;
      }
      _this.visibility = atom.workspace.isTextEditor(paneItem);
      _this.emitter.emit('observe-visibility', _this.visibility);
      if (_this.visibility) {
        (function () {
          if (_this.panelRepresents !== 'Entire Project') {
            _this.update(_this.messages);
          }
          var oldRow = -1;
          changeSubscription = paneItem.onDidChangeCursorPosition(function (_ref) {
            var newBufferPosition = _ref.newBufferPosition;

            if (oldRow !== newBufferPosition.row && _this.panelRepresents === 'Current Line') {
              oldRow = newBufferPosition.row;
              _this.update(_this.messages);
            }
          });
        })();
      }
      var shouldUpdate = typeof _this.visibility !== 'undefined' && _this.panelRepresents !== 'Entire Project';

      if (_this.visibility && shouldUpdate) {
        _this.update(_this.messages);
      }
    }));
    this.subscriptions.add(function () {
      if (changeSubscription) {
        changeSubscription.dispose();
      }
    });
  }

  _createClass(PanelDelegate, [{
    key: 'update',
    value: function update(messages) {
      this.messages = messages;
      this.emitter.emit('observe-messages', this.filteredMessages);
    }
  }, {
    key: 'updatePanelHeight',
    value: function updatePanelHeight(panelHeight) {
      atom.config.set('linter-ui-default.panelHeight', panelHeight);
    }
  }, {
    key: 'onDidChangeMessages',
    value: function onDidChangeMessages(callback) {
      return this.emitter.on('observe-messages', callback);
    }
  }, {
    key: 'onDidChangeVisibility',
    value: function onDidChangeVisibility(callback) {
      return this.emitter.on('observe-visibility', callback);
    }
  }, {
    key: 'onDidChangePanelConfig',
    value: function onDidChangePanelConfig(callback) {
      return this.emitter.on('observe-panel-config', callback);
    }
  }, {
    key: 'setPanelVisibility',
    value: function setPanelVisibility(visibility) {
      if (visibility && !this.panel.isVisible()) {
        this.panel.show();
      } else if (!visibility && this.panel.isVisible()) {
        this.panel.hide();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }, {
    key: 'filteredMessages',
    get: function get() {
      var filteredMessages = [];
      if (this.panelRepresents === 'Entire Project') {
        filteredMessages = this.messages;
      } else if (this.panelRepresents === 'Current File') {
        var activeEditor = atom.workspace.getActiveTextEditor();
        if (!activeEditor) return [];
        filteredMessages = (0, _helpers.filterMessages)(this.messages, activeEditor.getPath());
      } else if (this.panelRepresents === 'Current Line') {
        var activeEditor = atom.workspace.getActiveTextEditor();
        if (!activeEditor) return [];
        var activeLine = activeEditor.getCursors()[0].getBufferRow();
        filteredMessages = (0, _helpers.filterMessagesByRangeOrPoint)(this.messages, activeEditor.getPath(), _atom.Range.fromObject([[activeLine, 0], [activeLine, Infinity]]));
      }
      return filteredMessages;
    }
  }]);

  return PanelDelegate;
})();

exports['default'] = PanelDelegate;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9kZWxlZ2F0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFc0IsTUFBTTs7MEJBQ2lCLGNBQWM7O3VCQUlFLFlBQVk7O0lBR3BELGFBQWE7QUFVckIsV0FWUSxhQUFhLENBVXBCLEtBQVksRUFBRTs7OzBCQVZQLGFBQWE7O0FBVzlCLFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxPQUFPLEdBQUcseUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixRQUFJLENBQUMsYUFBYSxHQUFHLHFDQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQ0FBbUMsRUFBRSxVQUFDLGVBQWUsRUFBSztBQUNuRyxVQUFNLFVBQVUsR0FBRyxPQUFPLE1BQUssZUFBZSxLQUFLLFdBQVcsQ0FBQTtBQUM5RCxZQUFLLGVBQWUsR0FBRyxlQUFlLENBQUE7QUFDdEMsVUFBSSxVQUFVLEVBQUU7QUFDZCxjQUFLLE1BQU0sQ0FBQyxNQUFLLFFBQVEsQ0FBQyxDQUFBO09BQzNCO0tBQ0YsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsRUFBRSxVQUFDLFdBQVcsRUFBSztBQUMzRixVQUFNLFVBQVUsR0FBRyxPQUFPLE1BQUssV0FBVyxLQUFLLFdBQVcsQ0FBQTtBQUMxRCxZQUFLLFdBQVcsR0FBRyxXQUFXLENBQUE7QUFDOUIsVUFBSSxVQUFVLEVBQUU7QUFDZCxjQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtPQUMxQztLQUNGLENBQUMs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RyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUE7QUFDOUQsd0JBQWdCLEdBQUcsMkNBQTZCLElBQUksQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLE9BQU8sRUFBRSxFQUFFLFlBQU0sVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7T0FDcEo7QUFDRCxhQUFPLGdCQUFnQixDQUFBO0tBQ3hCOzs7U0FyRmtCLGFBQWE7OztxQkFBYixhQUFhIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9kZWxlZ2F0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IFJhbmdlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXIgfSBmcm9tICdzYi1ldmVudC1raXQnXG5pbXBvcnQgdHlwZSB7IFBhbmVsIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIHsgRGlzcG9zYWJsZSB9IGZyb20gJ3NiLWV2ZW50LWtpdCdcblxuaW1wb3J0IHsgZmlsdGVyTWVzc2FnZXMsIGZpbHRlck1lc3NhZ2VzQnlSYW5nZU9yUG9pbnQgfSBmcm9tICcuLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhbmVsRGVsZWdhdGUge1xuICBwYW5lbDogUGFuZWw7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPjtcbiAgdmlzaWJpbGl0eTogYm9vbGVhbjtcbiAgcGFuZWxIZWlnaHQ6IG51bWJlcjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgcGFuZWxSZXByZXNlbnRzOiAnRW50aXJlIFByb2plY3QnIHwgJ0N1cnJlbnQgRmlsZScgfCAnQ3VycmVudCBMaW5lJztcbiAgcGFuZWxUYWtlc01pbmltdW1IZWlnaHQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocGFuZWw6IFBhbmVsKSB7XG4gICAgdGhpcy5wYW5lbCA9IHBhbmVsXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMubWVzc2FnZXMgPSBbXVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQucGFuZWxSZXByZXNlbnRzJywgKHBhbmVsUmVwcmVzZW50cykgPT4ge1xuICAgICAgY29uc3Qgbm90SW5pdGlhbCA9IHR5cGVvZiB0aGlzLnBhbmVsUmVwcmVzZW50cyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHRoaXMucGFuZWxSZXByZXNlbnRzID0gcGFuZWxSZXByZXNlbnRzXG4gICAgICBpZiAobm90SW5pdGlhbCkge1xuICAgICAgICB0aGlzLnVwZGF0ZSh0aGlzLm1lc3NhZ2VzKVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQucGFuZWxIZWlnaHQnLCAocGFuZWxIZWlnaHQpID0+IHtcbiAgICAgIGNvbnN0IG5vdEluaXRpYWwgPSB0eXBlb2YgdGhpcy5wYW5lbEhlaWdodCAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHRoaXMucGFuZWxIZWlnaHQgPSBwYW5lbEhlaWdodFxuICAgICAgaWYgKG5vdEluaXRpYWwpIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ29ic2VydmUtcGFuZWwtY29uZmlnJylcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnBhbmVsVGFrZXNNaW5pbXVtSGVpZ2h0JywgKHBhbmVsVGFrZXNNaW5pbXVtSGVpZ2h0KSA9PiB7XG4gICAgICBjb25zdCBub3RJbml0aWFsID0gdHlwZW9mIHRoaXMucGFuZWxUYWtlc01pbmltdW1IZWlnaHQgIT09ICd1bmRlZmluZWQnXG4gICAgICB0aGlzLnBhbmVsVGFrZXNNaW5pbXVtSGVpZ2h0ID0gcGFuZWxUYWtlc01pbmltdW1IZWlnaHRcbiAgICAgIGlmIChub3RJbml0aWFsKSB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdvYnNlcnZlLXBhbmVsLWNvbmZpZycpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICBsZXQgY2hhbmdlU3Vic2NyaXB0aW9uXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlQWN0aXZlUGFuZUl0ZW0oKHBhbmVJdGVtKSA9PiB7XG4gICAgICBpZiAoY2hhbmdlU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIGNoYW5nZVN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgICAgY2hhbmdlU3Vic2NyaXB0aW9uID0gbnVsbFxuICAgICAgfVxuICAgICAgdGhpcy52aXNpYmlsaXR5ID0gYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKHBhbmVJdGVtKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ29ic2VydmUtdmlzaWJpbGl0eScsIHRoaXMudmlzaWJpbGl0eSlcbiAgICAgIGlmICh0aGlzLnZpc2liaWxpdHkpIHtcbiAgICAgICAgaWYgKHRoaXMucGFuZWxSZXByZXNlbnRzICE9PSAnRW50aXJlIFByb2plY3QnKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGUodGhpcy5tZXNzYWdlcylcbiAgICAgICAgfVxuICAgICAgICBsZXQgb2xkUm93ID0gLTFcbiAgICAgICAgY2hhbmdlU3Vic2NyaXB0aW9uID0gcGFuZUl0ZW0ub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbigoeyBuZXdCdWZmZXJQb3NpdGlvbiB9KSA9PiB7XG4gICAgICAgICAgaWYgKG9sZFJvdyAhPT0gbmV3QnVmZmVyUG9zaXRpb24ucm93ICYmIHRoaXMucGFuZWxSZXByZXNlbnRzID09PSAnQ3VycmVudCBMaW5lJykge1xuICAgICAgICAgICAgb2xkUm93ID0gbmV3QnVmZmVyUG9zaXRpb24ucm93XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSh0aGlzLm1lc3NhZ2VzKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNob3VsZFVwZGF0ZSA9IHR5cGVvZiB0aGlzLnZpc2liaWxpdHkgIT09ICd1bmRlZmluZWQnICYmIHRoaXMucGFuZWxSZXByZXNlbnRzICE9PSAnRW50aXJlIFByb2plY3QnXG5cbiAgICAgIGlmICh0aGlzLnZpc2liaWxpdHkgJiYgc2hvdWxkVXBkYXRlKSB7XG4gICAgICAgIHRoaXMudXBkYXRlKHRoaXMubWVzc2FnZXMpXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChmdW5jdGlvbigpIHtcbiAgICAgIGlmIChjaGFuZ2VTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgY2hhbmdlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgZ2V0IGZpbHRlcmVkTWVzc2FnZXMoKTogQXJyYXk8TGludGVyTWVzc2FnZT4ge1xuICAgIGxldCBmaWx0ZXJlZE1lc3NhZ2VzID0gW11cbiAgICBpZiAodGhpcy5wYW5lbFJlcHJlc2VudHMgPT09ICdFbnRpcmUgUHJvamVjdCcpIHtcbiAgICAgIGZpbHRlcmVkTWVzc2FnZXMgPSB0aGlzLm1lc3NhZ2VzXG4gICAgfSBlbHNlIGlmICh0aGlzLnBhbmVsUmVwcmVzZW50cyA9PT0gJ0N1cnJlbnQgRmlsZScpIHtcbiAgICAgIGNvbnN0IGFjdGl2ZUVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgaWYgKCFhY3RpdmVFZGl0b3IpIHJldHVybiBbXVxuICAgICAgZmlsdGVyZWRNZXNzYWdlcyA9IGZpbHRlck1lc3NhZ2VzKHRoaXMubWVzc2FnZXMsIGFjdGl2ZUVkaXRvci5nZXRQYXRoKCkpXG4gICAgfSBlbHNlIGlmICh0aGlzLnBhbmVsUmVwcmVzZW50cyA9PT0gJ0N1cnJlbnQgTGluZScpIHtcbiAgICAgIGNvbnN0IGFjdGl2ZUVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgaWYgKCFhY3RpdmVFZGl0b3IpIHJldHVybiBbXVxuICAgICAgY29uc3QgYWN0aXZlTGluZSA9IGFjdGl2ZUVkaXRvci5nZXRDdXJzb3JzKClbMF0uZ2V0QnVmZmVyUm93KClcbiAgICAgIGZpbHRlcmVkTWVzc2FnZXMgPSBmaWx0ZXJNZXNzYWdlc0J5UmFuZ2VPclBvaW50KHRoaXMubWVzc2FnZXMsIGFjdGl2ZUVkaXRvci5nZXRQYXRoKCksIFJhbmdlLmZyb21PYmplY3QoW1thY3RpdmVMaW5lLCAwXSwgW2FjdGl2ZUxpbmUsIEluZmluaXR5XV0pKVxuICAgIH1cbiAgICByZXR1cm4gZmlsdGVyZWRNZXNzYWdlc1xuICB9XG4gIHVwZGF0ZShtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT4pOiB2b2lkIHtcbiAgICB0aGlzLm1lc3NhZ2VzID0gbWVzc2FnZXNcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnb2JzZXJ2ZS1tZXNzYWdlcycsIHRoaXMuZmlsdGVyZWRNZXNzYWdlcylcbiAgfVxuICB1cGRhdGVQYW5lbEhlaWdodChwYW5lbEhlaWdodDogbnVtYmVyKTogdm9pZCB7XG4gICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItdWktZGVmYXVsdC5wYW5lbEhlaWdodCcsIHBhbmVsSGVpZ2h0KVxuICB9XG4gIG9uRGlkQ2hhbmdlTWVzc2FnZXMoY2FsbGJhY2s6ICgobWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+KSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignb2JzZXJ2ZS1tZXNzYWdlcycsIGNhbGxiYWNrKVxuICB9XG4gIG9uRGlkQ2hhbmdlVmlzaWJpbGl0eShjYWxsYmFjazogKCh2aXNpYmlsaXR5OiBib29sZWFuKSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignb2JzZXJ2ZS12aXNpYmlsaXR5JywgY2FsbGJhY2spXG4gIH1cbiAgb25EaWRDaGFuZ2VQYW5lbENvbmZpZyhjYWxsYmFjazogKCgpID0+IGFueSkpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdvYnNlcnZlLXBhbmVsLWNvbmZpZycsIGNhbGxiYWNrKVxuICB9XG4gIHNldFBhbmVsVmlzaWJpbGl0eSh2aXNpYmlsaXR5OiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHZpc2liaWxpdHkgJiYgIXRoaXMucGFuZWwuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHRoaXMucGFuZWwuc2hvdygpXG4gICAgfSBlbHNlIGlmICghdmlzaWJpbGl0eSAmJiB0aGlzLnBhbmVsLmlzVmlzaWJsZSgpKSB7XG4gICAgICB0aGlzLnBhbmVsLmhpZGUoKVxuICAgIH1cbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuIl19