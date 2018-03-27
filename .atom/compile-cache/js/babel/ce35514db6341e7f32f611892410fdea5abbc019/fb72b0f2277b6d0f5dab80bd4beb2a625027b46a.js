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
    this.subscriptions.add(atom.workspace.getCenter().observeActivePaneItem(function () {
      if (changeSubscription) {
        changeSubscription.dispose();
        changeSubscription = null;
      }
      var textEditor = (0, _helpers.getActiveTextEditor)();
      if (textEditor) {
        (function () {
          if (_this.panelRepresents !== 'Entire Project') {
            _this.update();
          }
          var oldRow = -1;
          changeSubscription = textEditor.onDidChangeCursorPosition(function (_ref) {
            var newBufferPosition = _ref.newBufferPosition;

            if (oldRow !== newBufferPosition.row && _this.panelRepresents === 'Current Line') {
              oldRow = newBufferPosition.row;
              _this.update();
            }
          });
        })();
      }

      if (_this.panelRepresents !== 'Entire Project' || textEditor) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9kZWxlZ2F0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUVnRSxNQUFNOzt1QkFFWSxZQUFZOztJQUd4RixhQUFhO0FBT04sV0FQUCxhQUFhLEdBT0g7OzswQkFQVixhQUFhOztBQVFmLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFBO0FBQzFCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxFQUFFLFVBQUMsZUFBZSxFQUFLO0FBQ25HLFVBQU0sVUFBVSxHQUFHLE9BQU8sTUFBSyxlQUFlLEtBQUssV0FBVyxDQUFBO0FBQzlELFlBQUssZUFBZSxHQUFHLGVBQWUsQ0FBQTtBQUN0QyxVQUFJLFVBQVUsRUFBRTtBQUNkLGNBQUssTUFBTSxFQUFFLENBQUE7T0FDZDtLQUNGLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFBSSxrQkFBa0IsWUFBQSxDQUFBO0FBQ3RCLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMscUJBQXFCLENBQUMsWUFBTTtBQUM1RSxVQUFJLGtCQUFrQixFQUFFO0FBQ3RCLDBCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzVCLDBCQUFrQixHQUFHLElBQUksQ0FBQTtPQUMxQjtBQUNELFVBQU0sVUFBVSxHQUFHLG1DQUFxQixDQUFBO0FBQ3hDLFVBQUksVUFBVSxFQUFFOztBQUNkLGNBQUksTUFBSyxlQUFlLEtBQUssZ0JBQWdCLEVBQUU7QUFDN0Msa0JBQUssTUFB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L3BhbmVsL2RlbGVnYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSwgRW1pdHRlciwgUmFuZ2UgfSBmcm9tICdhdG9tJ1xuXG5pbXBvcnQgeyBnZXRBY3RpdmVUZXh0RWRpdG9yLCBmaWx0ZXJNZXNzYWdlcywgZmlsdGVyTWVzc2FnZXNCeVJhbmdlT3JQb2ludCB9IGZyb20gJy4uL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcydcblxuY2xhc3MgUGFuZWxEZWxlZ2F0ZSB7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPjtcbiAgZmlsdGVyZWRNZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT47XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIHBhbmVsUmVwcmVzZW50czogJ0VudGlyZSBQcm9qZWN0JyB8ICdDdXJyZW50IEZpbGUnIHwgJ0N1cnJlbnQgTGluZSc7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMubWVzc2FnZXMgPSBbXVxuICAgIHRoaXMuZmlsdGVyZWRNZXNzYWdlcyA9IFtdXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5wYW5lbFJlcHJlc2VudHMnLCAocGFuZWxSZXByZXNlbnRzKSA9PiB7XG4gICAgICBjb25zdCBub3RJbml0aWFsID0gdHlwZW9mIHRoaXMucGFuZWxSZXByZXNlbnRzICE9PSAndW5kZWZpbmVkJ1xuICAgICAgdGhpcy5wYW5lbFJlcHJlc2VudHMgPSBwYW5lbFJlcHJlc2VudHNcbiAgICAgIGlmIChub3RJbml0aWFsKSB7XG4gICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgIH1cbiAgICB9KSlcbiAgICBsZXQgY2hhbmdlU3Vic2NyaXB0aW9uXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5vYnNlcnZlQWN0aXZlUGFuZUl0ZW0oKCkgPT4ge1xuICAgICAgaWYgKGNoYW5nZVN1YnNjcmlwdGlvbikge1xuICAgICAgICBjaGFuZ2VTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICAgIGNoYW5nZVN1YnNjcmlwdGlvbiA9IG51bGxcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRleHRFZGl0b3IgPSBnZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGlmICh0ZXh0RWRpdG9yKSB7XG4gICAgICAgIGlmICh0aGlzLnBhbmVsUmVwcmVzZW50cyAhPT0gJ0VudGlyZSBQcm9qZWN0Jykge1xuICAgICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgICAgfVxuICAgICAgICBsZXQgb2xkUm93ID0gLTFcbiAgICAgICAgY2hhbmdlU3Vic2NyaXB0aW9uID0gdGV4dEVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKCh7IG5ld0J1ZmZlclBvc2l0aW9uIH0pID0+IHtcbiAgICAgICAgICBpZiAob2xkUm93ICE9PSBuZXdCdWZmZXJQb3NpdGlvbi5yb3cgJiYgdGhpcy5wYW5lbFJlcHJlc2VudHMgPT09ICdDdXJyZW50IExpbmUnKSB7XG4gICAgICAgICAgICBvbGRSb3cgPSBuZXdCdWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnBhbmVsUmVwcmVzZW50cyAhPT0gJ0VudGlyZSBQcm9qZWN0JyB8fCB0ZXh0RWRpdG9yKSB7XG4gICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGNoYW5nZVN1YnNjcmlwdGlvbikge1xuICAgICAgICBjaGFuZ2VTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICB9XG4gICAgfSkpXG4gIH1cbiAgZ2V0RmlsdGVyZWRNZXNzYWdlcygpOiBBcnJheTxMaW50ZXJNZXNzYWdlPiB7XG4gICAgbGV0IGZpbHRlcmVkTWVzc2FnZXMgPSBbXVxuICAgIGlmICh0aGlzLnBhbmVsUmVwcmVzZW50cyA9PT0gJ0VudGlyZSBQcm9qZWN0Jykge1xuICAgICAgZmlsdGVyZWRNZXNzYWdlcyA9IHRoaXMubWVzc2FnZXNcbiAgICB9IGVsc2UgaWYgKHRoaXMucGFuZWxSZXByZXNlbnRzID09PSAnQ3VycmVudCBGaWxlJykge1xuICAgICAgY29uc3QgYWN0aXZlRWRpdG9yID0gZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBpZiAoIWFjdGl2ZUVkaXRvcikgcmV0dXJuIFtdXG4gICAgICBmaWx0ZXJlZE1lc3NhZ2VzID0gZmlsdGVyTWVzc2FnZXModGhpcy5tZXNzYWdlcywgYWN0aXZlRWRpdG9yLmdldFBhdGgoKSlcbiAgICB9IGVsc2UgaWYgKHRoaXMucGFuZWxSZXByZXNlbnRzID09PSAnQ3VycmVudCBMaW5lJykge1xuICAgICAgY29uc3QgYWN0aXZlRWRpdG9yID0gZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBpZiAoIWFjdGl2ZUVkaXRvcikgcmV0dXJuIFtdXG4gICAgICBjb25zdCBhY3RpdmVMaW5lID0gYWN0aXZlRWRpdG9yLmdldEN1cnNvcnMoKVswXS5nZXRCdWZmZXJSb3coKVxuICAgICAgZmlsdGVyZWRNZXNzYWdlcyA9IGZpbHRlck1lc3NhZ2VzQnlSYW5nZU9yUG9pbnQodGhpcy5tZXNzYWdlcywgYWN0aXZlRWRpdG9yLmdldFBhdGgoKSwgUmFuZ2UuZnJvbU9iamVjdChbW2FjdGl2ZUxpbmUsIDBdLCBbYWN0aXZlTGluZSwgSW5maW5pdHldXSkpXG4gICAgfVxuICAgIHJldHVybiBmaWx0ZXJlZE1lc3NhZ2VzXG4gIH1cbiAgdXBkYXRlKG1lc3NhZ2VzOiA/QXJyYXk8TGludGVyTWVzc2FnZT4gPSBudWxsKTogdm9pZCB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobWVzc2FnZXMpKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzID0gbWVzc2FnZXNcbiAgICB9XG4gICAgdGhpcy5maWx0ZXJlZE1lc3NhZ2VzID0gdGhpcy5nZXRGaWx0ZXJlZE1lc3NhZ2VzKClcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnb2JzZXJ2ZS1tZXNzYWdlcycsIHRoaXMuZmlsdGVyZWRNZXNzYWdlcylcbiAgfVxuICBvbkRpZENoYW5nZU1lc3NhZ2VzKGNhbGxiYWNrOiAoKG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPikgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ29ic2VydmUtbWVzc2FnZXMnLCBjYWxsYmFjaylcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhbmVsRGVsZWdhdGVcbiJdfQ==