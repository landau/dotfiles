var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _delegate = require('./delegate');

var _delegate2 = _interopRequireDefault(_delegate);

var _dock = require('./dock');

var _dock2 = _interopRequireDefault(_dock);

var Panel = (function () {
  function Panel() {
    var _this = this;

    _classCallCheck(this, Panel);

    this.panel = null;
    this.element = document.createElement('div');
    this.delegate = new _delegate2['default']();
    this.messages = [];
    this.deactivating = false;
    this.subscriptions = new _atom.CompositeDisposable();
    this.showPanelStateMessages = false;

    this.subscriptions.add(this.delegate);
    this.subscriptions.add(atom.config.observe('linter-ui-default.hidePanelWhenEmpty', function (hidePanelWhenEmpty) {
      _this.hidePanelWhenEmpty = hidePanelWhenEmpty;
      _this.refresh();
    }));
    this.subscriptions.add(atom.workspace.onDidDestroyPaneItem(function (_ref) {
      var paneItem = _ref.item;

      if (paneItem instanceof _dock2['default'] && !_this.deactivating) {
        _this.panel = null;
        atom.config.set('linter-ui-default.showPanel', false);
      }
    }));
    this.subscriptions.add(atom.config.observe('linter-ui-default.showPanel', function (showPanel) {
      _this.showPanelConfig = showPanel;
      _this.refresh();
    }));
    this.subscriptions.add(atom.workspace.observeActivePaneItem(function () {
      _this.showPanelStateMessages = !!_this.delegate.filteredMessages.length;
      _this.refresh();
    }));
    this.activationTimer = window.requestIdleCallback(function () {
      _this.activate();
    });
  }

  _createClass(Panel, [{
    key: 'activate',
    value: _asyncToGenerator(function* () {
      if (this.panel) {
        return;
      }
      this.panel = new _dock2['default'](this.delegate);
      yield atom.workspace.open(this.panel, {
        activatePane: false,
        activateItem: false,
        searchAllPanes: true
      });
      this.update();
      this.refresh();
    })
  }, {
    key: 'update',
    value: function update() {
      var newMessages = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (newMessages) {
        this.messages = newMessages;
      }
      this.delegate.update(this.messages);
      this.showPanelStateMessages = !!this.delegate.filteredMessages.length;
      this.refresh();
    }
  }, {
    key: 'refresh',
    value: _asyncToGenerator(function* () {
      if (this.panel === null) {
        if (this.showPanelConfig) {
          yield this.activate();
        }
        return;
      }
      var paneContainer = atom.workspace.paneContainerForItem(this.panel);
      if (!paneContainer || paneContainer.location !== 'bottom' || paneContainer.getActivePaneItem() !== this.panel) {
        return;
      }
      if (this.showPanelConfig && (!this.hidePanelWhenEmpty || this.showPanelStateMessages)) {
        paneContainer.show();
      } else {
        paneContainer.hide();
      }
    })
  }, {
    key: 'dispose',
    value: function dispose() {
      this.deactivating = true;
      if (this.panel) {
        this.panel.dispose();
      }
      this.subscriptions.dispose();
      window.cancelIdleCallback(this.activationTimer);
    }
  }]);

  return Panel;
})();

module.exports = Panel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFb0MsTUFBTTs7d0JBQ3JCLFlBQVk7Ozs7b0JBQ1gsUUFBUTs7OztJQUd4QixLQUFLO0FBV0UsV0FYUCxLQUFLLEdBV0s7OzswQkFYVixLQUFLOztBQVlQLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQ2pCLFFBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM1QyxRQUFJLENBQUMsUUFBUSxHQUFHLDJCQUFjLENBQUE7QUFDOUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsUUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUE7QUFDekIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxRQUFJLENBQUMsc0JBQXNCLEdBQUcsS0FBSyxDQUFBOztBQUVuQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDckMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsc0NBQXNDLEVBQUUsVUFBQyxrQkFBa0IsRUFBSztBQUN6RyxZQUFLLGtCQUFrQixHQUFHLGtCQUFrQixDQUFBO0FBQzVDLFlBQUssT0FBTyxFQUFFLENBQUE7S0FDZixDQUFDLENBQUMsQ0FBQTtBQUNILFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsVUFBQyxJQUFrQixFQUFLO1VBQWYsUUFBUSxHQUFoQixJQUFrQixDQUFoQixJQUFJOztBQUNoRSxVQUFJLFFBQVEsNkJBQXFCLElBQUksQ0FBQyxNQUFLLFlBQVksRUFBRTtBQUN2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QUFDLE9BQU8sRUFBRSxDQUFBO09BQ3JCO0FBQ0QsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QixZQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFBO0tBQ2hEOzs7U0EzRkcsS0FBSzs7O0FBOEZYLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IERlbGVnYXRlIGZyb20gJy4vZGVsZWdhdGUnXG5pbXBvcnQgUGFuZWxEb2NrIGZyb20gJy4vZG9jaydcbmltcG9ydCB0eXBlIHsgTGludGVyTWVzc2FnZSB9IGZyb20gJy4uL3R5cGVzJ1xuXG5jbGFzcyBQYW5lbCB7XG4gIHBhbmVsOiA/UGFuZWxEb2NrO1xuICBlbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgZGVsZWdhdGU6IERlbGVnYXRlO1xuICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT47XG4gIGRlYWN0aXZhdGluZzogYm9vbGVhbjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgc2hvd1BhbmVsQ29uZmlnOiBib29sZWFuO1xuICBoaWRlUGFuZWxXaGVuRW1wdHk6IGJvb2xlYW47XG4gIHNob3dQYW5lbFN0YXRlTWVzc2FnZXM6IGJvb2xlYW47XG4gIGFjdGl2YXRpb25UaW1lcjogbnVtYmVyO1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnBhbmVsID0gbnVsbFxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5kZWxlZ2F0ZSA9IG5ldyBEZWxlZ2F0ZSgpXG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdXG4gICAgdGhpcy5kZWFjdGl2YXRpbmcgPSBmYWxzZVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLnNob3dQYW5lbFN0YXRlTWVzc2FnZXMgPSBmYWxzZVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmRlbGVnYXRlKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuaGlkZVBhbmVsV2hlbkVtcHR5JywgKGhpZGVQYW5lbFdoZW5FbXB0eSkgPT4ge1xuICAgICAgdGhpcy5oaWRlUGFuZWxXaGVuRW1wdHkgPSBoaWRlUGFuZWxXaGVuRW1wdHlcbiAgICAgIHRoaXMucmVmcmVzaCgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vbkRpZERlc3Ryb3lQYW5lSXRlbSgoeyBpdGVtOiBwYW5lSXRlbSB9KSA9PiB7XG4gICAgICBpZiAocGFuZUl0ZW0gaW5zdGFuY2VvZiBQYW5lbERvY2sgJiYgIXRoaXMuZGVhY3RpdmF0aW5nKSB7XG4gICAgICAgIHRoaXMucGFuZWwgPSBudWxsXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLXVpLWRlZmF1bHQuc2hvd1BhbmVsJywgZmFsc2UpXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5zaG93UGFuZWwnLCAoc2hvd1BhbmVsKSA9PiB7XG4gICAgICB0aGlzLnNob3dQYW5lbENvbmZpZyA9IHNob3dQYW5lbFxuICAgICAgdGhpcy5yZWZyZXNoKClcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVBY3RpdmVQYW5lSXRlbSgoKSA9PiB7XG4gICAgICB0aGlzLnNob3dQYW5lbFN0YXRlTWVzc2FnZXMgPSAhIXRoaXMuZGVsZWdhdGUuZmlsdGVyZWRNZXNzYWdlcy5sZW5ndGhcbiAgICAgIHRoaXMucmVmcmVzaCgpXG4gICAgfSkpXG4gICAgdGhpcy5hY3RpdmF0aW9uVGltZXIgPSB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFjaygoKSA9PiB7XG4gICAgICB0aGlzLmFjdGl2YXRlKClcbiAgICB9KVxuICB9XG4gIGFzeW5jIGFjdGl2YXRlKCkge1xuICAgIGlmICh0aGlzLnBhbmVsKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5wYW5lbCA9IG5ldyBQYW5lbERvY2sodGhpcy5kZWxlZ2F0ZSlcbiAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKHRoaXMucGFuZWwsIHtcbiAgICAgIGFjdGl2YXRlUGFuZTogZmFsc2UsXG4gICAgICBhY3RpdmF0ZUl0ZW06IGZhbHNlLFxuICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWUsXG4gICAgfSlcbiAgICB0aGlzLnVwZGF0ZSgpXG4gICAgdGhpcy5yZWZyZXNoKClcbiAgfVxuICB1cGRhdGUobmV3TWVzc2FnZXM6ID9BcnJheTxMaW50ZXJNZXNzYWdlPiA9IG51bGwpOiB2b2lkIHtcbiAgICBpZiAobmV3TWVzc2FnZXMpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSBuZXdNZXNzYWdlc1xuICAgIH1cbiAgICB0aGlzLmRlbGVnYXRlLnVwZGF0ZSh0aGlzLm1lc3NhZ2VzKVxuICAgIHRoaXMuc2hvd1BhbmVsU3RhdGVNZXNzYWdlcyA9ICEhdGhpcy5kZWxlZ2F0ZS5maWx0ZXJlZE1lc3NhZ2VzLmxlbmd0aFxuICAgIHRoaXMucmVmcmVzaCgpXG4gIH1cbiAgYXN5bmMgcmVmcmVzaCgpIHtcbiAgICBpZiAodGhpcy5wYW5lbCA9PT0gbnVsbCkge1xuICAgICAgaWYgKHRoaXMuc2hvd1BhbmVsQ29uZmlnKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuYWN0aXZhdGUoKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHBhbmVDb250YWluZXIgPSBhdG9tLndvcmtzcGFjZS5wYW5lQ29udGFpbmVyRm9ySXRlbSh0aGlzLnBhbmVsKVxuICAgIGlmICghcGFuZUNvbnRhaW5lciB8fCBwYW5lQ29udGFpbmVyLmxvY2F0aW9uICE9PSAnYm90dG9tJyB8fCBwYW5lQ29udGFpbmVyLmdldEFjdGl2ZVBhbmVJdGVtKCkgIT09IHRoaXMucGFuZWwpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAoXG4gICAgICAodGhpcy5zaG93UGFuZWxDb25maWcpICYmXG4gICAgICAoIXRoaXMuaGlkZVBhbmVsV2hlbkVtcHR5IHx8IHRoaXMuc2hvd1BhbmVsU3RhdGVNZXNzYWdlcylcbiAgICApIHtcbiAgICAgIHBhbmVDb250YWluZXIuc2hvdygpXG4gICAgfSBlbHNlIHtcbiAgICAgIHBhbmVDb250YWluZXIuaGlkZSgpXG4gICAgfVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5kZWFjdGl2YXRpbmcgPSB0cnVlXG4gICAgaWYgKHRoaXMucGFuZWwpIHtcbiAgICAgIHRoaXMucGFuZWwuZGlzcG9zZSgpXG4gICAgfVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB3aW5kb3cuY2FuY2VsSWRsZUNhbGxiYWNrKHRoaXMuYWN0aXZhdGlvblRpbWVyKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGFuZWxcbiJdfQ==