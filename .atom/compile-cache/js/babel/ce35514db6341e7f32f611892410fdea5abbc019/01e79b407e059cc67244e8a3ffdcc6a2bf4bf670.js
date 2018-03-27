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
    this.subscriptions.add(atom.workspace.getCenter().observeActivePaneItem(function (paneItem) {
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
        var activeEditor = (0, _helpers.getActiveTextEditor)();
        if (!activeEditor) return [];
        filteredMessages = (0, _helpers.filterMessages)(this.messages, activeEditor.getPath());
      } else if (this.panelRepresents === 'Current Line') {
        var activeEditor = (0, _helpers.getActiveTextEditor)();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9kZWxlZ2F0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUVnRSxNQUFNOzt1QkFFWSxZQUFZOztJQUd4RixhQUFhO0FBT04sV0FQUCxhQUFhLEdBT0g7OzswQkFQVixhQUFhOztBQVFmLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFBO0FBQzFCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxFQUFFLFVBQUMsZUFBZSxFQUFLO0FBQ25HLFVBQU0sVUFBVSxHQUFHLE9BQU8sTUFBSyxlQUFlLEtBQUssV0FBVyxDQUFBO0FBQzlELFlBQUssZUFBZSxHQUFHLGVBQWUsQ0FBQTtBQUN0QyxVQUFJLFVBQVUsRUFBRTtBQUNkLGNBQUssTUFBTSxFQUFFLENBQUE7T0FDZDtLQUNGLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFBSSxrQkFBa0IsWUFBQSxDQUFBO0FBQ3RCLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMscUJBQXFCLENBQUMsVUFBQyxRQUFRLEVBQUs7QUFDcEYsVUFBSSxrQkFBa0IsRUFBRTtBQUN0QiwwQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QiwwQkFBa0IsR0FBRyxJQUFJLENBQUE7T0FDMUI7QUFDRCxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUMxRCxVQUFJLFlBQVksRUFBRTs7QUFDaEIsY0FB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dGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvcGFuZWwvZGVsZWdhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlLCBFbWl0dGVyLCBSYW5nZSB9IGZyb20gJ2F0b20nXG5cbmltcG9ydCB7IGdldEFjdGl2ZVRleHRFZGl0b3IsIGZpbHRlck1lc3NhZ2VzLCBmaWx0ZXJNZXNzYWdlc0J5UmFuZ2VPclBvaW50IH0gZnJvbSAnLi4vaGVscGVycydcbmltcG9ydCB0eXBlIHsgTGludGVyTWVzc2FnZSB9IGZyb20gJy4uL3R5cGVzJ1xuXG5jbGFzcyBQYW5lbERlbGVnYXRlIHtcbiAgZW1pdHRlcjogRW1pdHRlcjtcbiAgbWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+O1xuICBmaWx0ZXJlZE1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgcGFuZWxSZXByZXNlbnRzOiAnRW50aXJlIFByb2plY3QnIHwgJ0N1cnJlbnQgRmlsZScgfCAnQ3VycmVudCBMaW5lJztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdXG4gICAgdGhpcy5maWx0ZXJlZE1lc3NhZ2VzID0gW11cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnBhbmVsUmVwcmVzZW50cycsIChwYW5lbFJlcHJlc2VudHMpID0+IHtcbiAgICAgIGNvbnN0IG5vdEluaXRpYWwgPSB0eXBlb2YgdGhpcy5wYW5lbFJlcHJlc2VudHMgIT09ICd1bmRlZmluZWQnXG4gICAgICB0aGlzLnBhbmVsUmVwcmVzZW50cyA9IHBhbmVsUmVwcmVzZW50c1xuICAgICAgaWYgKG5vdEluaXRpYWwpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgfVxuICAgIH0pKVxuICAgIGxldCBjaGFuZ2VTdWJzY3JpcHRpb25cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLm9ic2VydmVBY3RpdmVQYW5lSXRlbSgocGFuZUl0ZW0pID0+IHtcbiAgICAgIGlmIChjaGFuZ2VTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgY2hhbmdlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgICBjaGFuZ2VTdWJzY3JpcHRpb24gPSBudWxsXG4gICAgICB9XG4gICAgICBjb25zdCBpc1RleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IocGFuZUl0ZW0pXG4gICAgICBpZiAoaXNUZXh0RWRpdG9yKSB7XG4gICAgICAgIGlmICh0aGlzLnBhbmVsUmVwcmVzZW50cyAhPT0gJ0VudGlyZSBQcm9qZWN0Jykge1xuICAgICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgICAgfVxuICAgICAgICBsZXQgb2xkUm93ID0gLTFcbiAgICAgICAgY2hhbmdlU3Vic2NyaXB0aW9uID0gcGFuZUl0ZW0ub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbigoeyBuZXdCdWZmZXJQb3NpdGlvbiB9KSA9PiB7XG4gICAgICAgICAgaWYgKG9sZFJvdyAhPT0gbmV3QnVmZmVyUG9zaXRpb24ucm93ICYmIHRoaXMucGFuZWxSZXByZXNlbnRzID09PSAnQ3VycmVudCBMaW5lJykge1xuICAgICAgICAgICAgb2xkUm93ID0gbmV3QnVmZmVyUG9zaXRpb24ucm93XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5wYW5lbFJlcHJlc2VudHMgIT09ICdFbnRpcmUgUHJvamVjdCcgfHwgaXNUZXh0RWRpdG9yKSB7XG4gICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGNoYW5nZVN1YnNjcmlwdGlvbikge1xuICAgICAgICBjaGFuZ2VTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICB9XG4gICAgfSkpXG4gIH1cbiAgZ2V0RmlsdGVyZWRNZXNzYWdlcygpOiBBcnJheTxMaW50ZXJNZXNzYWdlPiB7XG4gICAgbGV0IGZpbHRlcmVkTWVzc2FnZXMgPSBbXVxuICAgIGlmICh0aGlzLnBhbmVsUmVwcmVzZW50cyA9PT0gJ0VudGlyZSBQcm9qZWN0Jykge1xuICAgICAgZmlsdGVyZWRNZXNzYWdlcyA9IHRoaXMubWVzc2FnZXNcbiAgICB9IGVsc2UgaWYgKHRoaXMucGFuZWxSZXByZXNlbnRzID09PSAnQ3VycmVudCBGaWxlJykge1xuICAgICAgY29uc3QgYWN0aXZlRWRpdG9yID0gZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBpZiAoIWFjdGl2ZUVkaXRvcikgcmV0dXJuIFtdXG4gICAgICBmaWx0ZXJlZE1lc3NhZ2VzID0gZmlsdGVyTWVzc2FnZXModGhpcy5tZXNzYWdlcywgYWN0aXZlRWRpdG9yLmdldFBhdGgoKSlcbiAgICB9IGVsc2UgaWYgKHRoaXMucGFuZWxSZXByZXNlbnRzID09PSAnQ3VycmVudCBMaW5lJykge1xuICAgICAgY29uc3QgYWN0aXZlRWRpdG9yID0gZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBpZiAoIWFjdGl2ZUVkaXRvcikgcmV0dXJuIFtdXG4gICAgICBjb25zdCBhY3RpdmVMaW5lID0gYWN0aXZlRWRpdG9yLmdldEN1cnNvcnMoKVswXS5nZXRCdWZmZXJSb3coKVxuICAgICAgZmlsdGVyZWRNZXNzYWdlcyA9IGZpbHRlck1lc3NhZ2VzQnlSYW5nZU9yUG9pbnQodGhpcy5tZXNzYWdlcywgYWN0aXZlRWRpdG9yLmdldFBhdGgoKSwgUmFuZ2UuZnJvbU9iamVjdChbW2FjdGl2ZUxpbmUsIDBdLCBbYWN0aXZlTGluZSwgSW5maW5pdHldXSkpXG4gICAgfVxuICAgIHJldHVybiBmaWx0ZXJlZE1lc3NhZ2VzXG4gIH1cbiAgdXBkYXRlKG1lc3NhZ2VzOiA/QXJyYXk8TGludGVyTWVzc2FnZT4gPSBudWxsKTogdm9pZCB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobWVzc2FnZXMpKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzID0gbWVzc2FnZXNcbiAgICB9XG4gICAgdGhpcy5maWx0ZXJlZE1lc3NhZ2VzID0gdGhpcy5nZXRGaWx0ZXJlZE1lc3NhZ2VzKClcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnb2JzZXJ2ZS1tZXNzYWdlcycsIHRoaXMuZmlsdGVyZWRNZXNzYWdlcylcbiAgfVxuICBvbkRpZENoYW5nZU1lc3NhZ2VzKGNhbGxiYWNrOiAoKG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPikgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ29ic2VydmUtbWVzc2FnZXMnLCBjYWxsYmFjaylcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhbmVsRGVsZWdhdGVcbiJdfQ==