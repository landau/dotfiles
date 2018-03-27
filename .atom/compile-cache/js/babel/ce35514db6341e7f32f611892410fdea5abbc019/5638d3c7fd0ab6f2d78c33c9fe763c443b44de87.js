var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _helpers = require('../helpers');

var PanelDelegate = (function () {
  function PanelDelegate() {
    var _this = this;

    _classCallCheck(this, PanelDelegate);

    this.emitter = new _atom.Emitter();
    this.messages = [];
    this.filteredMessages = [];
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.config.observe('linter-ui-default.panelRepresents', function (panelRepresents) {
      var notInitial = typeof _this.panelRepresents !== 'undefined';
      _this.panelRepresents = panelRepresents;
      if (notInitial) {
        _this.update();
      }
    }));
    var changeSubscription = undefined;
    this.subscriptions.add(atom.workspace.observeActivePaneItem(function (paneItem) {
      if (changeSubscription) {
        changeSubscription.dispose();
        changeSubscription = null;
      }
      var isTextEditor = atom.workspace.isTextEditor(paneItem);
      if (isTextEditor) {
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

      if (_this.panelRepresents !== 'Entire Project' || isTextEditor) {
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
    key: 'getFilteredMessages',
    value: function getFilteredMessages() {
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
  }, {
    key: 'update',
    value: function update() {
      var messages = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (Array.isArray(messages)) {
        this.messages = messages;
      }
      this.filteredMessages = this.getFilteredMessages();
      this.emitter.emit('observe-messages', this.filteredMessages);
    }
  }, {
    key: 'onDidChangeMessages',
    value: function onDidChangeMessages(callback) {
      return this.emitter.on('observe-messages', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }]);

  return PanelDelegate;
})();

module.exports = PanelDelegate;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9kZWxlZ2F0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUVnRSxNQUFNOzt1QkFFVCxZQUFZOztJQUduRSxhQUFhO0FBT04sV0FQUCxhQUFhLEdBT0g7OzswQkFQVixhQUFhOztBQVFmLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFBO0FBQzFCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxFQUFFLFVBQUMsZUFBZSxFQUFLO0FBQ25HLFVBQU0sVUFBVSxHQUFHLE9BQU8sTUFBSyxlQUFlLEtBQUssV0FBVyxDQUFBO0FBQzlELFlBQUssZUFBZSxHQUFHLGVBQWUsQ0FBQTtBQUN0QyxVQUFJLFVBQVUsRUFBRTtBQUNkLGNBQUssTUFBTSxFQUFFLENBQUE7T0FDZDtLQUNGLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFBSSxrQkFBa0IsWUFBQSxDQUFBO0FBQ3RCLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsVUFBQyxRQUFRLEVBQUs7QUFDeEUsVUFBSSxrQkFBa0IsRUFBRTtBQUN0QiwwQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QiwwQkFBa0IsR0FBRyxJQUFJLENBQUE7T0FDMUI7QUFDRCxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUMxRCxVQUFJLFlBQVksRUFBRTs7QUFDaEIsY0FBSSxNQUFLLGVBQWUsS0FB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QUFPLEdBQUcsYUFBYSxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9kZWxlZ2F0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUsIEVtaXR0ZXIsIFJhbmdlIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IHsgZmlsdGVyTWVzc2FnZXMsIGZpbHRlck1lc3NhZ2VzQnlSYW5nZU9yUG9pbnQgfSBmcm9tICcuLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMnXG5cbmNsYXNzIFBhbmVsRGVsZWdhdGUge1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT47XG4gIGZpbHRlcmVkTWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+O1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBwYW5lbFJlcHJlc2VudHM6ICdFbnRpcmUgUHJvamVjdCcgfCAnQ3VycmVudCBGaWxlJyB8ICdDdXJyZW50IExpbmUnO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLm1lc3NhZ2VzID0gW11cbiAgICB0aGlzLmZpbHRlcmVkTWVzc2FnZXMgPSBbXVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQucGFuZWxSZXByZXNlbnRzJywgKHBhbmVsUmVwcmVzZW50cykgPT4ge1xuICAgICAgY29uc3Qgbm90SW5pdGlhbCA9IHR5cGVvZiB0aGlzLnBhbmVsUmVwcmVzZW50cyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHRoaXMucGFuZWxSZXByZXNlbnRzID0gcGFuZWxSZXByZXNlbnRzXG4gICAgICBpZiAobm90SW5pdGlhbCkge1xuICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICB9XG4gICAgfSkpXG4gICAgbGV0IGNoYW5nZVN1YnNjcmlwdGlvblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZUFjdGl2ZVBhbmVJdGVtKChwYW5lSXRlbSkgPT4ge1xuICAgICAgaWYgKGNoYW5nZVN1YnNjcmlwdGlvbikge1xuICAgICAgICBjaGFuZ2VTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICAgIGNoYW5nZVN1YnNjcmlwdGlvbiA9IG51bGxcbiAgICAgIH1cbiAgICAgIGNvbnN0IGlzVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihwYW5lSXRlbSlcbiAgICAgIGlmIChpc1RleHRFZGl0b3IpIHtcbiAgICAgICAgaWYgKHRoaXMucGFuZWxSZXByZXNlbnRzICE9PSAnRW50aXJlIFByb2plY3QnKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgICB9XG4gICAgICAgIGxldCBvbGRSb3cgPSAtMVxuICAgICAgICBjaGFuZ2VTdWJzY3JpcHRpb24gPSBwYW5lSXRlbS5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKCh7IG5ld0J1ZmZlclBvc2l0aW9uIH0pID0+IHtcbiAgICAgICAgICBpZiAob2xkUm93ICE9PSBuZXdCdWZmZXJQb3NpdGlvbi5yb3cgJiYgdGhpcy5wYW5lbFJlcHJlc2VudHMgPT09ICdDdXJyZW50IExpbmUnKSB7XG4gICAgICAgICAgICBvbGRSb3cgPSBuZXdCdWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnBhbmVsUmVwcmVzZW50cyAhPT0gJ0VudGlyZSBQcm9qZWN0JyB8fCBpc1RleHRFZGl0b3IpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoY2hhbmdlU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIGNoYW5nZVN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgIH1cbiAgICB9KSlcbiAgfVxuICBnZXRGaWx0ZXJlZE1lc3NhZ2VzKCk6IEFycmF5PExpbnRlck1lc3NhZ2U+IHtcbiAgICBsZXQgZmlsdGVyZWRNZXNzYWdlcyA9IFtdXG4gICAgaWYgKHRoaXMucGFuZWxSZXByZXNlbnRzID09PSAnRW50aXJlIFByb2plY3QnKSB7XG4gICAgICBmaWx0ZXJlZE1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlc1xuICAgIH0gZWxzZSBpZiAodGhpcy5wYW5lbFJlcHJlc2VudHMgPT09ICdDdXJyZW50IEZpbGUnKSB7XG4gICAgICBjb25zdCBhY3RpdmVFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGlmICghYWN0aXZlRWRpdG9yKSByZXR1cm4gW11cbiAgICAgIGZpbHRlcmVkTWVzc2FnZXMgPSBmaWx0ZXJNZXNzYWdlcyh0aGlzLm1lc3NhZ2VzLCBhY3RpdmVFZGl0b3IuZ2V0UGF0aCgpKVxuICAgIH0gZWxzZSBpZiAodGhpcy5wYW5lbFJlcHJlc2VudHMgPT09ICdDdXJyZW50IExpbmUnKSB7XG4gICAgICBjb25zdCBhY3RpdmVFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGlmICghYWN0aXZlRWRpdG9yKSByZXR1cm4gW11cbiAgICAgIGNvbnN0IGFjdGl2ZUxpbmUgPSBhY3RpdmVFZGl0b3IuZ2V0Q3Vyc29ycygpWzBdLmdldEJ1ZmZlclJvdygpXG4gICAgICBmaWx0ZXJlZE1lc3NhZ2VzID0gZmlsdGVyTWVzc2FnZXNCeVJhbmdlT3JQb2ludCh0aGlzLm1lc3NhZ2VzLCBhY3RpdmVFZGl0b3IuZ2V0UGF0aCgpLCBSYW5nZS5mcm9tT2JqZWN0KFtbYWN0aXZlTGluZSwgMF0sIFthY3RpdmVMaW5lLCBJbmZpbml0eV1dKSlcbiAgICB9XG4gICAgcmV0dXJuIGZpbHRlcmVkTWVzc2FnZXNcbiAgfVxuICB1cGRhdGUobWVzc2FnZXM6ID9BcnJheTxMaW50ZXJNZXNzYWdlPiA9IG51bGwpOiB2b2lkIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShtZXNzYWdlcykpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSBtZXNzYWdlc1xuICAgIH1cbiAgICB0aGlzLmZpbHRlcmVkTWVzc2FnZXMgPSB0aGlzLmdldEZpbHRlcmVkTWVzc2FnZXMoKVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdvYnNlcnZlLW1lc3NhZ2VzJywgdGhpcy5maWx0ZXJlZE1lc3NhZ2VzKVxuICB9XG4gIG9uRGlkQ2hhbmdlTWVzc2FnZXMoY2FsbGJhY2s6ICgobWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+KSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignb2JzZXJ2ZS1tZXNzYWdlcycsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGFuZWxEZWxlZ2F0ZVxuIl19