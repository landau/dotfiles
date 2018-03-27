var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _helpers = require('../helpers');

var PanelDelegate = (function () {
  function PanelDelegate(panel) {
    var _this = this;

    _classCallCheck(this, PanelDelegate);

    this.panel = panel;
    this.emitter = new _atom.Emitter();
    this.messages = [];
    this.subscriptions = new _atom.CompositeDisposable();

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
    this.subscriptions.add(new _atom.Disposable(function () {
      if (changeSubscription) {
        changeSubscription.dispose();
      }
    }));
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

module.exports = PanelDelegate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9kZWxlZ2F0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUVnRSxNQUFNOzt1QkFHVCxZQUFZOztJQUduRSxhQUFhO0FBVU4sV0FWUCxhQUFhLENBVUwsS0FBWSxFQUFFOzs7MEJBVnRCLGFBQWE7O0FBV2YsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDbEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxFQUFFLFVBQUMsZUFBZSxFQUFLO0FBQ25HLFVBQU0sVUFBVSxHQUFHLE9BQU8sTUFBSyxlQUFlLEtBQUssV0FBVyxDQUFBO0FBQzlELFlBQUssZUFBZSxHQUFHLGVBQWUsQ0FBQTtBQUN0QyxVQUFJLFVBQVUsRUFBRTtBQUNkLGNBQUssTUFBTSxFQUFFLENBQUE7T0FDZDtLQUNGLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUUsVUFBQyxXQUFXLEVBQUs7QUFDM0YsVUFBTSxVQUFVLEdBQUcsT0FBTyxNQUFLLFdBQVcsS0FBSyxXQUFXLENBQUE7QUFDMUQsWUFBSyxXQUFXLEdBQUcsV0FBVyxDQUFBO0FBQzlCLFVBQUksVUFBVSxFQUFFO0FBQ2QsY0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUE7T0FDMUM7S0FDRixDQUFDLENBQUMsQ0FBQTtBQUNILFFBQUksQ0FBQyxhQUFhLENBQUMs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QUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUE7QUFDOUQsd0JBQWdCLEdBQUcsMkNBQTZCLElBQUksQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLE9BQU8sRUFBRSxFQUFFLFlBQU0sVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7T0FDcEo7QUFDRCxhQUFPLGdCQUFnQixDQUFBO0tBQ3hCOzs7U0FyRkcsYUFBYTs7O0FBb0huQixNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvcGFuZWwvZGVsZWdhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlLCBFbWl0dGVyLCBSYW5nZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSB7IFBhbmVsIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IHsgZmlsdGVyTWVzc2FnZXMsIGZpbHRlck1lc3NhZ2VzQnlSYW5nZU9yUG9pbnQgfSBmcm9tICcuLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMnXG5cbmNsYXNzIFBhbmVsRGVsZWdhdGUge1xuICBwYW5lbDogUGFuZWw7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPjtcbiAgdmlzaWJpbGl0eTogYm9vbGVhbjtcbiAgcGFuZWxIZWlnaHQ6IG51bWJlcjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgcGFuZWxSZXByZXNlbnRzOiAnRW50aXJlIFByb2plY3QnIHwgJ0N1cnJlbnQgRmlsZScgfCAnQ3VycmVudCBMaW5lJztcbiAgcGFuZWxUYWtlc01pbmltdW1IZWlnaHQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocGFuZWw6IFBhbmVsKSB7XG4gICAgdGhpcy5wYW5lbCA9IHBhbmVsXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMubWVzc2FnZXMgPSBbXVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQucGFuZWxSZXByZXNlbnRzJywgKHBhbmVsUmVwcmVzZW50cykgPT4ge1xuICAgICAgY29uc3Qgbm90SW5pdGlhbCA9IHR5cGVvZiB0aGlzLnBhbmVsUmVwcmVzZW50cyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHRoaXMucGFuZWxSZXByZXNlbnRzID0gcGFuZWxSZXByZXNlbnRzXG4gICAgICBpZiAobm90SW5pdGlhbCkge1xuICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5wYW5lbEhlaWdodCcsIChwYW5lbEhlaWdodCkgPT4ge1xuICAgICAgY29uc3Qgbm90SW5pdGlhbCA9IHR5cGVvZiB0aGlzLnBhbmVsSGVpZ2h0ICE9PSAndW5kZWZpbmVkJ1xuICAgICAgdGhpcy5wYW5lbEhlaWdodCA9IHBhbmVsSGVpZ2h0XG4gICAgICBpZiAobm90SW5pdGlhbCkge1xuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnb2JzZXJ2ZS1wYW5lbC1jb25maWcnKVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQucGFuZWxUYWtlc01pbmltdW1IZWlnaHQnLCAocGFuZWxUYWtlc01pbmltdW1IZWlnaHQpID0+IHtcbiAgICAgIGNvbnN0IG5vdEluaXRpYWwgPSB0eXBlb2YgdGhpcy5wYW5lbFRha2VzTWluaW11bUhlaWdodCAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHRoaXMucGFuZWxUYWtlc01pbmltdW1IZWlnaHQgPSBwYW5lbFRha2VzTWluaW11bUhlaWdodFxuICAgICAgaWYgKG5vdEluaXRpYWwpIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ29ic2VydmUtcGFuZWwtY29uZmlnJylcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIGxldCBjaGFuZ2VTdWJzY3JpcHRpb25cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVBY3RpdmVQYW5lSXRlbSgocGFuZUl0ZW0pID0+IHtcbiAgICAgIGlmIChjaGFuZ2VTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgY2hhbmdlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgICBjaGFuZ2VTdWJzY3JpcHRpb24gPSBudWxsXG4gICAgICB9XG4gICAgICB0aGlzLnZpc2liaWxpdHkgPSBhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IocGFuZUl0ZW0pXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnb2JzZXJ2ZS12aXNpYmlsaXR5JywgdGhpcy52aXNpYmlsaXR5KVxuICAgICAgaWYgKHRoaXMudmlzaWJpbGl0eSkge1xuICAgICAgICBpZiAodGhpcy5wYW5lbFJlcHJlc2VudHMgIT09ICdFbnRpcmUgUHJvamVjdCcpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICAgIH1cbiAgICAgICAgbGV0IG9sZFJvdyA9IC0xXG4gICAgICAgIGNoYW5nZVN1YnNjcmlwdGlvbiA9IHBhbmVJdGVtLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oKHsgbmV3QnVmZmVyUG9zaXRpb24gfSkgPT4ge1xuICAgICAgICAgIGlmIChvbGRSb3cgIT09IG5ld0J1ZmZlclBvc2l0aW9uLnJvdyAmJiB0aGlzLnBhbmVsUmVwcmVzZW50cyA9PT0gJ0N1cnJlbnQgTGluZScpIHtcbiAgICAgICAgICAgIG9sZFJvdyA9IG5ld0J1ZmZlclBvc2l0aW9uLnJvd1xuICAgICAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNob3VsZFVwZGF0ZSA9IHR5cGVvZiB0aGlzLnZpc2liaWxpdHkgIT09ICd1bmRlZmluZWQnICYmIHRoaXMucGFuZWxSZXByZXNlbnRzICE9PSAnRW50aXJlIFByb2plY3QnXG5cbiAgICAgIGlmICh0aGlzLnZpc2liaWxpdHkgJiYgc2hvdWxkVXBkYXRlKSB7XG4gICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGNoYW5nZVN1YnNjcmlwdGlvbikge1xuICAgICAgICBjaGFuZ2VTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICB9XG4gICAgfSkpXG4gIH1cbiAgZ2V0IGZpbHRlcmVkTWVzc2FnZXMoKTogQXJyYXk8TGludGVyTWVzc2FnZT4ge1xuICAgIGxldCBmaWx0ZXJlZE1lc3NhZ2VzID0gW11cbiAgICBpZiAodGhpcy5wYW5lbFJlcHJlc2VudHMgPT09ICdFbnRpcmUgUHJvamVjdCcpIHtcbiAgICAgIGZpbHRlcmVkTWVzc2FnZXMgPSB0aGlzLm1lc3NhZ2VzXG4gICAgfSBlbHNlIGlmICh0aGlzLnBhbmVsUmVwcmVzZW50cyA9PT0gJ0N1cnJlbnQgRmlsZScpIHtcbiAgICAgIGNvbnN0IGFjdGl2ZUVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgaWYgKCFhY3RpdmVFZGl0b3IpIHJldHVybiBbXVxuICAgICAgZmlsdGVyZWRNZXNzYWdlcyA9IGZpbHRlck1lc3NhZ2VzKHRoaXMubWVzc2FnZXMsIGFjdGl2ZUVkaXRvci5nZXRQYXRoKCkpXG4gICAgfSBlbHNlIGlmICh0aGlzLnBhbmVsUmVwcmVzZW50cyA9PT0gJ0N1cnJlbnQgTGluZScpIHtcbiAgICAgIGNvbnN0IGFjdGl2ZUVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgaWYgKCFhY3RpdmVFZGl0b3IpIHJldHVybiBbXVxuICAgICAgY29uc3QgYWN0aXZlTGluZSA9IGFjdGl2ZUVkaXRvci5nZXRDdXJzb3JzKClbMF0uZ2V0QnVmZmVyUm93KClcbiAgICAgIGZpbHRlcmVkTWVzc2FnZXMgPSBmaWx0ZXJNZXNzYWdlc0J5UmFuZ2VPclBvaW50KHRoaXMubWVzc2FnZXMsIGFjdGl2ZUVkaXRvci5nZXRQYXRoKCksIFJhbmdlLmZyb21PYmplY3QoW1thY3RpdmVMaW5lLCAwXSwgW2FjdGl2ZUxpbmUsIEluZmluaXR5XV0pKVxuICAgIH1cbiAgICByZXR1cm4gZmlsdGVyZWRNZXNzYWdlc1xuICB9XG4gIHVwZGF0ZShtZXNzYWdlczogP0FycmF5PExpbnRlck1lc3NhZ2U+ID0gbnVsbCk6IHZvaWQge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG1lc3NhZ2VzKSkge1xuICAgICAgdGhpcy5tZXNzYWdlcyA9IG1lc3NhZ2VzXG4gICAgfVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdvYnNlcnZlLW1lc3NhZ2VzJywgdGhpcy5maWx0ZXJlZE1lc3NhZ2VzKVxuICB9XG4gIHVwZGF0ZVBhbmVsSGVpZ2h0KHBhbmVsSGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci11aS1kZWZhdWx0LnBhbmVsSGVpZ2h0JywgcGFuZWxIZWlnaHQpXG4gIH1cbiAgb25EaWRDaGFuZ2VNZXNzYWdlcyhjYWxsYmFjazogKChtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT4pID0+IGFueSkpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdvYnNlcnZlLW1lc3NhZ2VzJywgY2FsbGJhY2spXG4gIH1cbiAgb25EaWRDaGFuZ2VWaXNpYmlsaXR5KGNhbGxiYWNrOiAoKHZpc2liaWxpdHk6IGJvb2xlYW4pID0+IGFueSkpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdvYnNlcnZlLXZpc2liaWxpdHknLCBjYWxsYmFjaylcbiAgfVxuICBvbkRpZENoYW5nZVBhbmVsQ29uZmlnKGNhbGxiYWNrOiAoKCkgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ29ic2VydmUtcGFuZWwtY29uZmlnJywgY2FsbGJhY2spXG4gIH1cbiAgc2V0UGFuZWxWaXNpYmlsaXR5KHZpc2liaWxpdHk6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodmlzaWJpbGl0eSAmJiAhdGhpcy5wYW5lbC5pc1Zpc2libGUoKSkge1xuICAgICAgdGhpcy5wYW5lbC5zaG93KClcbiAgICB9IGVsc2UgaWYgKCF2aXNpYmlsaXR5ICYmIHRoaXMucGFuZWwuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHRoaXMucGFuZWwuaGlkZSgpXG4gICAgfVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGFuZWxEZWxlZ2F0ZVxuIl19