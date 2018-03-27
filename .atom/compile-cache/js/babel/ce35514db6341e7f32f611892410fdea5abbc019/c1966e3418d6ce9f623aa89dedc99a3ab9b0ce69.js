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
        _this.update();
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
            _this.update();
          }
          var oldRow = -1;
          changeSubscription = paneItem.onDidChangeCursorPosition(function (_ref) {
            var newBufferPosition = _ref.newBufferPosition;

            if (oldRow !== newBufferPosition.row && _this.panelRepresents === 'Current Line') {
              oldRow = newBufferPosition.row;
              _this.update();
            }
          });
        })();
      }
      var shouldUpdate = typeof _this.visibility !== 'undefined' && _this.panelRepresents !== 'Entire Project';

      if (_this.visibility && shouldUpdate) {
        _this.update();
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
    value: function update() {
      var messages = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (Array.isArray(messages)) {
        this.messages = messages;
      }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9kZWxlZ2F0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFc0IsTUFBTTs7MEJBQ2lCLGNBQWM7O3VCQUlFLFlBQVk7O0lBR3BELGFBQWE7QUFVckIsV0FWUSxhQUFhLENBVXBCLEtBQVksRUFBRTs7OzBCQVZQLGFBQWE7O0FBVzlCLFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxPQUFPLEdBQUcseUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixRQUFJLENBQUMsYUFBYSxHQUFHLHFDQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQ0FBbUMsRUFBRSxVQUFDLGVBQWUsRUFBSztBQUNuRyxVQUFNLFVBQVUsR0FBRyxPQUFPLE1BQUssZUFBZSxLQUFLLFdBQVcsQ0FBQTtBQUM5RCxZQUFLLGVBQWUsR0FBRyxlQUFlLENBQUE7QUFDdEMsVUFBSSxVQUFVLEVBQUU7QUFDZCxjQUFLLE1BQU0sRUFBRSxDQUFBO09BQ2Q7S0FDRixDQUFDLENBQUMsQ0FBQTtBQUNILFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLCtCQUErQixFQUFFLFVBQUMsV0FBVyxFQUFLO0FBQzNGLFVBQU0sVUFBVSxHQUFHLE9BQU8sTUFBSyxXQUFXLEtBQUssV0FBVyxDQUFBO0FBQzFELFlBQUssV0FBVyxHQUFHLFdBQVcsQ0FBQTtBQUM5QixVQUFJLFVBQVUsRUFBRTtBQUNkLGNBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO09BQzFDO0tBQ0YsQ0FBQyxDQUFDLENBQUE7QUFDSCxR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QUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFBO0FBQzlELHdCQUFnQixHQUFHLDJDQUE2QixJQUFJLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxPQUFPLEVBQUUsRUFBRSxZQUFNLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO09BQ3BKO0FBQ0QsYUFBTyxnQkFBZ0IsQ0FBQTtLQUN4Qjs7O1NBckZrQixhQUFhOzs7cUJBQWIsYUFBYSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvcGFuZWwvZGVsZWdhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBSYW5nZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyIH0gZnJvbSAnc2ItZXZlbnQta2l0J1xuaW1wb3J0IHR5cGUgeyBQYW5lbCB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSB7IERpc3Bvc2FibGUgfSBmcm9tICdzYi1ldmVudC1raXQnXG5cbmltcG9ydCB7IGZpbHRlck1lc3NhZ2VzLCBmaWx0ZXJNZXNzYWdlc0J5UmFuZ2VPclBvaW50IH0gZnJvbSAnLi4vaGVscGVycydcbmltcG9ydCB0eXBlIHsgTGludGVyTWVzc2FnZSB9IGZyb20gJy4uL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYW5lbERlbGVnYXRlIHtcbiAgcGFuZWw6IFBhbmVsO1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT47XG4gIHZpc2liaWxpdHk6IGJvb2xlYW47XG4gIHBhbmVsSGVpZ2h0OiBudW1iZXI7XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIHBhbmVsUmVwcmVzZW50czogJ0VudGlyZSBQcm9qZWN0JyB8ICdDdXJyZW50IEZpbGUnIHwgJ0N1cnJlbnQgTGluZSc7XG4gIHBhbmVsVGFrZXNNaW5pbXVtSGVpZ2h0OiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHBhbmVsOiBQYW5lbCkge1xuICAgIHRoaXMucGFuZWwgPSBwYW5lbFxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLm1lc3NhZ2VzID0gW11cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnBhbmVsUmVwcmVzZW50cycsIChwYW5lbFJlcHJlc2VudHMpID0+IHtcbiAgICAgIGNvbnN0IG5vdEluaXRpYWwgPSB0eXBlb2YgdGhpcy5wYW5lbFJlcHJlc2VudHMgIT09ICd1bmRlZmluZWQnXG4gICAgICB0aGlzLnBhbmVsUmVwcmVzZW50cyA9IHBhbmVsUmVwcmVzZW50c1xuICAgICAgaWYgKG5vdEluaXRpYWwpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQucGFuZWxIZWlnaHQnLCAocGFuZWxIZWlnaHQpID0+IHtcbiAgICAgIGNvbnN0IG5vdEluaXRpYWwgPSB0eXBlb2YgdGhpcy5wYW5lbEhlaWdodCAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHRoaXMucGFuZWxIZWlnaHQgPSBwYW5lbEhlaWdodFxuICAgICAgaWYgKG5vdEluaXRpYWwpIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ29ic2VydmUtcGFuZWwtY29uZmlnJylcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnBhbmVsVGFrZXNNaW5pbXVtSGVpZ2h0JywgKHBhbmVsVGFrZXNNaW5pbXVtSGVpZ2h0KSA9PiB7XG4gICAgICBjb25zdCBub3RJbml0aWFsID0gdHlwZW9mIHRoaXMucGFuZWxUYWtlc01pbmltdW1IZWlnaHQgIT09ICd1bmRlZmluZWQnXG4gICAgICB0aGlzLnBhbmVsVGFrZXNNaW5pbXVtSGVpZ2h0ID0gcGFuZWxUYWtlc01pbmltdW1IZWlnaHRcbiAgICAgIGlmIChub3RJbml0aWFsKSB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdvYnNlcnZlLXBhbmVsLWNvbmZpZycpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICBsZXQgY2hhbmdlU3Vic2NyaXB0aW9uXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlQWN0aXZlUGFuZUl0ZW0oKHBhbmVJdGVtKSA9PiB7XG4gICAgICBpZiAoY2hhbmdlU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIGNoYW5nZVN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgICAgY2hhbmdlU3Vic2NyaXB0aW9uID0gbnVsbFxuICAgICAgfVxuICAgICAgdGhpcy52aXNpYmlsaXR5ID0gYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKHBhbmVJdGVtKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ29ic2VydmUtdmlzaWJpbGl0eScsIHRoaXMudmlzaWJpbGl0eSlcbiAgICAgIGlmICh0aGlzLnZpc2liaWxpdHkpIHtcbiAgICAgICAgaWYgKHRoaXMucGFuZWxSZXByZXNlbnRzICE9PSAnRW50aXJlIFByb2plY3QnKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgICB9XG4gICAgICAgIGxldCBvbGRSb3cgPSAtMVxuICAgICAgICBjaGFuZ2VTdWJzY3JpcHRpb24gPSBwYW5lSXRlbS5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKCh7IG5ld0J1ZmZlclBvc2l0aW9uIH0pID0+IHtcbiAgICAgICAgICBpZiAob2xkUm93ICE9PSBuZXdCdWZmZXJQb3NpdGlvbi5yb3cgJiYgdGhpcy5wYW5lbFJlcHJlc2VudHMgPT09ICdDdXJyZW50IExpbmUnKSB7XG4gICAgICAgICAgICBvbGRSb3cgPSBuZXdCdWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBjb25zdCBzaG91bGRVcGRhdGUgPSB0eXBlb2YgdGhpcy52aXNpYmlsaXR5ICE9PSAndW5kZWZpbmVkJyAmJiB0aGlzLnBhbmVsUmVwcmVzZW50cyAhPT0gJ0VudGlyZSBQcm9qZWN0J1xuXG4gICAgICBpZiAodGhpcy52aXNpYmlsaXR5ICYmIHNob3VsZFVwZGF0ZSkge1xuICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChmdW5jdGlvbigpIHtcbiAgICAgIGlmIChjaGFuZ2VTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgY2hhbmdlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgZ2V0IGZpbHRlcmVkTWVzc2FnZXMoKTogQXJyYXk8TGludGVyTWVzc2FnZT4ge1xuICAgIGxldCBmaWx0ZXJlZE1lc3NhZ2VzID0gW11cbiAgICBpZiAodGhpcy5wYW5lbFJlcHJlc2VudHMgPT09ICdFbnRpcmUgUHJvamVjdCcpIHtcbiAgICAgIGZpbHRlcmVkTWVzc2FnZXMgPSB0aGlzLm1lc3NhZ2VzXG4gICAgfSBlbHNlIGlmICh0aGlzLnBhbmVsUmVwcmVzZW50cyA9PT0gJ0N1cnJlbnQgRmlsZScpIHtcbiAgICAgIGNvbnN0IGFjdGl2ZUVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgaWYgKCFhY3RpdmVFZGl0b3IpIHJldHVybiBbXVxuICAgICAgZmlsdGVyZWRNZXNzYWdlcyA9IGZpbHRlck1lc3NhZ2VzKHRoaXMubWVzc2FnZXMsIGFjdGl2ZUVkaXRvci5nZXRQYXRoKCkpXG4gICAgfSBlbHNlIGlmICh0aGlzLnBhbmVsUmVwcmVzZW50cyA9PT0gJ0N1cnJlbnQgTGluZScpIHtcbiAgICAgIGNvbnN0IGFjdGl2ZUVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgaWYgKCFhY3RpdmVFZGl0b3IpIHJldHVybiBbXVxuICAgICAgY29uc3QgYWN0aXZlTGluZSA9IGFjdGl2ZUVkaXRvci5nZXRDdXJzb3JzKClbMF0uZ2V0QnVmZmVyUm93KClcbiAgICAgIGZpbHRlcmVkTWVzc2FnZXMgPSBmaWx0ZXJNZXNzYWdlc0J5UmFuZ2VPclBvaW50KHRoaXMubWVzc2FnZXMsIGFjdGl2ZUVkaXRvci5nZXRQYXRoKCksIFJhbmdlLmZyb21PYmplY3QoW1thY3RpdmVMaW5lLCAwXSwgW2FjdGl2ZUxpbmUsIEluZmluaXR5XV0pKVxuICAgIH1cbiAgICByZXR1cm4gZmlsdGVyZWRNZXNzYWdlc1xuICB9XG4gIHVwZGF0ZShtZXNzYWdlczogP0FycmF5PExpbnRlck1lc3NhZ2U+ID0gbnVsbCk6IHZvaWQge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG1lc3NhZ2VzKSkge1xuICAgICAgdGhpcy5tZXNzYWdlcyA9IG1lc3NhZ2VzXG4gICAgfVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdvYnNlcnZlLW1lc3NhZ2VzJywgdGhpcy5maWx0ZXJlZE1lc3NhZ2VzKVxuICB9XG4gIHVwZGF0ZVBhbmVsSGVpZ2h0KHBhbmVsSGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci11aS1kZWZhdWx0LnBhbmVsSGVpZ2h0JywgcGFuZWxIZWlnaHQpXG4gIH1cbiAgb25EaWRDaGFuZ2VNZXNzYWdlcyhjYWxsYmFjazogKChtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT4pID0+IGFueSkpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdvYnNlcnZlLW1lc3NhZ2VzJywgY2FsbGJhY2spXG4gIH1cbiAgb25EaWRDaGFuZ2VWaXNpYmlsaXR5KGNhbGxiYWNrOiAoKHZpc2liaWxpdHk6IGJvb2xlYW4pID0+IGFueSkpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdvYnNlcnZlLXZpc2liaWxpdHknLCBjYWxsYmFjaylcbiAgfVxuICBvbkRpZENoYW5nZVBhbmVsQ29uZmlnKGNhbGxiYWNrOiAoKCkgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ29ic2VydmUtcGFuZWwtY29uZmlnJywgY2FsbGJhY2spXG4gIH1cbiAgc2V0UGFuZWxWaXNpYmlsaXR5KHZpc2liaWxpdHk6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodmlzaWJpbGl0eSAmJiAhdGhpcy5wYW5lbC5pc1Zpc2libGUoKSkge1xuICAgICAgdGhpcy5wYW5lbC5zaG93KClcbiAgICB9IGVsc2UgaWYgKCF2aXNpYmlsaXR5ICYmIHRoaXMucGFuZWwuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHRoaXMucGFuZWwuaGlkZSgpXG4gICAgfVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG59XG4iXX0=