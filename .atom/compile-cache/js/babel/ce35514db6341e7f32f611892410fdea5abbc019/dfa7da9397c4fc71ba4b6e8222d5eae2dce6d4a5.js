var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

var _statusBar = require('./status-bar');

var _statusBar2 = _interopRequireDefault(_statusBar);

var _busySignal = require('./busy-signal');

var _busySignal2 = _interopRequireDefault(_busySignal);

var _intentions = require('./intentions');

var _intentions2 = _interopRequireDefault(_intentions);

var Panel = undefined;
var Editors = undefined;
var TreeView = undefined;

var LinterUI = (function () {
  function LinterUI() {
    _classCallCheck(this, LinterUI);

    this.name = 'Linter';
    this.idleCallbacks = new Set();
    this.signal = new _busySignal2['default']();
    this.commands = new _commands2['default']();
    this.messages = [];
    this.statusBar = new _statusBar2['default']();
    this.intentions = new _intentions2['default']();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.signal);
    this.subscriptions.add(this.commands);
    this.subscriptions.add(this.statusBar);

    var obsShowPanelCB = window.requestIdleCallback((function observeShowPanel() {
      var _this = this;

      this.idleCallbacks['delete'](obsShowPanelCB);
      if (!Panel) {
        Panel = require('./panel');
      }
      this.subscriptions.add(atom.config.observe('linter-ui-default.showPanel', function (showPanel) {
        if (showPanel && !_this.panel) {
          _this.panel = new Panel();
          _this.panel.update(_this.messages);
        } else if (!showPanel && _this.panel) {
          _this.panel.dispose();
          _this.panel = null;
        }
      }));
    }).bind(this));
    this.idleCallbacks.add(obsShowPanelCB);

    var obsShowDecorationsCB = window.requestIdleCallback((function observeShowDecorations() {
      var _this2 = this;

      this.idleCallbacks['delete'](obsShowDecorationsCB);
      if (!Editors) {
        Editors = require('./editors');
      }
      this.subscriptions.add(atom.config.observe('linter-ui-default.showDecorations', function (showDecorations) {
        if (showDecorations && !_this2.editors) {
          _this2.editors = new Editors();
          _this2.editors.update({ added: _this2.messages, removed: [], messages: _this2.messages });
        } else if (!showDecorations && _this2.editors) {
          _this2.editors.dispose();
          _this2.editors = null;
        }
      }));
    }).bind(this));
    this.idleCallbacks.add(obsShowDecorationsCB);
  }

  _createClass(LinterUI, [{
    key: 'render',
    value: function render(difference) {
      var editors = this.editors;

      this.messages = difference.messages;
      if (editors) {
        if (editors.isFirstRender()) {
          editors.update({ added: difference.messages, removed: [], messages: difference.messages });
        } else {
          editors.update(difference);
        }
      }
      // Initialize the TreeView subscription if necessary
      if (!this.treeview) {
        if (!TreeView) {
          TreeView = require('./tree-view');
        }
        this.treeview = new TreeView();
        this.subscriptions.add(this.treeview);
      }
      this.treeview.update(difference.messages);

      if (this.panel) {
        this.panel.update(difference.messages);
      }
      this.commands.update(difference.messages);
      this.intentions.update(difference.messages);
      this.statusBar.update(difference.messages);
    }
  }, {
    key: 'didBeginLinting',
    value: function didBeginLinting(linter, filePath) {
      this.signal.didBeginLinting(linter, filePath);
    }
  }, {
    key: 'didFinishLinting',
    value: function didFinishLinting(linter, filePath) {
      this.signal.didFinishLinting(linter, filePath);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.idleCallbacks.forEach(function (callbackID) {
        return window.cancelIdleCallback(callbackID);
      });
      this.idleCallbacks.clear();
      this.subscriptions.dispose();
      if (this.panel) {
        this.panel.dispose();
      }
      if (this.editors) {
        this.editors.dispose();
      }
    }
  }]);

  return LinterUI;
})();

module.exports = LinterUI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztvQkFFb0MsTUFBTTs7d0JBQ3JCLFlBQVk7Ozs7eUJBQ1gsY0FBYzs7OzswQkFDYixlQUFlOzs7OzBCQUNmLGNBQWM7Ozs7QUFHckMsSUFBSSxLQUFLLFlBQUEsQ0FBQTtBQUNULElBQUksT0FBTyxZQUFBLENBQUE7QUFDWCxJQUFJLFFBQVEsWUFBQSxDQUFBOztJQUVOLFFBQVE7QUFhRCxXQWJQLFFBQVEsR0FhRTswQkFiVixRQUFROztBQWNWLFFBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFBO0FBQ3BCLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUM5QixRQUFJLENBQUMsTUFBTSxHQUFHLDZCQUFnQixDQUFBO0FBQzlCLFFBQUksQ0FBQyxRQUFRLEdBQUcsMkJBQWMsQ0FBQTtBQUM5QixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixRQUFJLENBQUMsU0FBUyxHQUFHLDRCQUFlLENBQUE7QUFDaEMsUUFBSSxDQUFDLFVBQVUsR0FBRyw2QkFBZ0IsQ0FBQTtBQUNsQyxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDbkMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ3JDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTs7QUFFdEMsUUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUEsU0FBUyxnQkFBZ0IsR0FBRzs7O0FBQzVFLFVBQUksQ0FBQyxhQUFhLFVBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUN6QyxVQUFJLENBQUMsS0FBSyxFQUFFO0FBQ1YsYUFBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtPQUMzQjtBQUNELFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDZCQUE2QixFQUFFLFVBQUMsU0FBUyxFQUFLO0FBQ3ZGLFlBQUksU0FBUyxJQUFJLENBQUMsTUFBSyxLQUFLLEVBQUU7QUFDNUIsZ0JBQUssS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUE7QUFDeEIsZ0JBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFLLFFBQVEsQ0FBQyxDQUFBO1NBQ2pDLE1BQU0sSUFBSSxDQUFDLFNBQVMsSUFBSSxNQUFLLEtBQUssRUFBRTtBQUNuQyxnQkFBSyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDcEIsZ0JBQUssS0FBSyxHQUFHLElBQUksQ0FBQTtTQUNsQjtPQUNGLENBQUMsQ0FBQyxDQUFBO0tBQ0osQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBQ2IsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUE7O0FBRXRDLFFBQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUEsU0FBUyxzQkFBc0IsR0FBRzs7O0FBQ3hGLFVBQUksQ0FBQyxhQUFhLFVBQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0FBQy9DLFVBQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixlQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO09BQy9CO0FBQ0QsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUNBQW1DLEVBQUUsVUFBQyxlQUFlLEVBQUs7QUFDbkcsWUFBSSxlQUFlLElBQUksQ0FBQyxPQUFLLE9BQU8sRUFBRTtBQUNwQyxpQkFBSyxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQTtBQUM1QixpQkFBSyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQUssUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLE9BQUssUUFBUSxFQUFFLENBQUMsQ0FBQTtTQUNwRixNQUFNLElBQUksQ0FBQyxlQUFlLElBQUksT0FBSyxPQUFPLEVBQUU7QUFDM0MsaUJBQUssT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3RCLGlCQUFLLE9BQU8sR0FBRyxJQUFJLENBQUE7U0FDcEI7T0FDRixDQUFDLENBQUMsQ0FBQTtLQUNKLENBQUEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUNiLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUE7R0FDN0M7O2VBNURHLFFBQVE7O1dBNkROLGdCQUFDLFVBQXlCLEVBQUU7QUFDaEMsVUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQTs7QUFFNUIsVUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFBO0FBQ25DLFVBQUksT0FBTyxFQUFFO0FBQ1gsWUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUU7QUFDM0IsaUJBQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtTQUMzRixNQUFNO0FBQ0wsaUJBQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUE7U0FDM0I7T0FDRjs7QUFFRCxVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNsQixZQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2Isa0JBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7U0FDbEM7QUFDRCxZQUFJLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUE7QUFDOUIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO09BQ3RDO0FBQ0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFBOztBQUV6QyxVQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZCxZQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUE7T0FDdkM7QUFDRCxVQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDekMsVUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzNDLFVBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUMzQzs7O1dBQ2MseUJBQUMsTUFBYyxFQUFFLFFBQWdCLEVBQUU7QUFDaEQsVUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQzlDOzs7V0FDZSwwQkFBQyxNQUFjLEVBQUUsUUFBZ0IsRUFBRTtBQUNqRCxVQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUMvQzs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFVBQVU7ZUFBSSxNQUFNLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDO09BQUEsQ0FBQyxDQUFBO0FBQy9FLFVBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDMUIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QixVQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZCxZQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQ3JCO0FBQ0QsVUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDdkI7S0FDRjs7O1NBekdHLFFBQVE7OztBQTRHZCxNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IENvbW1hbmRzIGZyb20gJy4vY29tbWFuZHMnXG5pbXBvcnQgU3RhdHVzQmFyIGZyb20gJy4vc3RhdHVzLWJhcidcbmltcG9ydCBCdXN5U2lnbmFsIGZyb20gJy4vYnVzeS1zaWduYWwnXG5pbXBvcnQgSW50ZW50aW9ucyBmcm9tICcuL2ludGVudGlvbnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlciwgTGludGVyTWVzc2FnZSwgTWVzc2FnZXNQYXRjaCB9IGZyb20gJy4vdHlwZXMnXG5cbmxldCBQYW5lbFxubGV0IEVkaXRvcnNcbmxldCBUcmVlVmlld1xuXG5jbGFzcyBMaW50ZXJVSSB7XG4gIG5hbWU6IHN0cmluZztcbiAgcGFuZWw6ID9QYW5lbDtcbiAgc2lnbmFsOiBCdXN5U2lnbmFsO1xuICBlZGl0b3JzOiA/RWRpdG9ycztcbiAgdHJlZXZpZXc6IFRyZWVWaWV3O1xuICBjb21tYW5kczogQ29tbWFuZHM7XG4gIG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPjtcbiAgc3RhdHVzQmFyOiBTdGF0dXNCYXI7XG4gIGludGVudGlvbnM6IEludGVudGlvbnM7XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIGlkbGVDYWxsYmFja3M6IFNldDxudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubmFtZSA9ICdMaW50ZXInXG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzID0gbmV3IFNldCgpXG4gICAgdGhpcy5zaWduYWwgPSBuZXcgQnVzeVNpZ25hbCgpXG4gICAgdGhpcy5jb21tYW5kcyA9IG5ldyBDb21tYW5kcygpXG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdXG4gICAgdGhpcy5zdGF0dXNCYXIgPSBuZXcgU3RhdHVzQmFyKClcbiAgICB0aGlzLmludGVudGlvbnMgPSBuZXcgSW50ZW50aW9ucygpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnNpZ25hbClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuY29tbWFuZHMpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnN0YXR1c0JhcilcblxuICAgIGNvbnN0IG9ic1Nob3dQYW5lbENCID0gd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2soZnVuY3Rpb24gb2JzZXJ2ZVNob3dQYW5lbCgpIHtcbiAgICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5kZWxldGUob2JzU2hvd1BhbmVsQ0IpXG4gICAgICBpZiAoIVBhbmVsKSB7XG4gICAgICAgIFBhbmVsID0gcmVxdWlyZSgnLi9wYW5lbCcpXG4gICAgICB9XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dQYW5lbCcsIChzaG93UGFuZWwpID0+IHtcbiAgICAgICAgaWYgKHNob3dQYW5lbCAmJiAhdGhpcy5wYW5lbCkge1xuICAgICAgICAgIHRoaXMucGFuZWwgPSBuZXcgUGFuZWwoKVxuICAgICAgICAgIHRoaXMucGFuZWwudXBkYXRlKHRoaXMubWVzc2FnZXMpXG4gICAgICAgIH0gZWxzZSBpZiAoIXNob3dQYW5lbCAmJiB0aGlzLnBhbmVsKSB7XG4gICAgICAgICAgdGhpcy5wYW5lbC5kaXNwb3NlKClcbiAgICAgICAgICB0aGlzLnBhbmVsID0gbnVsbFxuICAgICAgICB9XG4gICAgICB9KSlcbiAgICB9LmJpbmQodGhpcykpXG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmFkZChvYnNTaG93UGFuZWxDQilcblxuICAgIGNvbnN0IG9ic1Nob3dEZWNvcmF0aW9uc0NCID0gd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2soZnVuY3Rpb24gb2JzZXJ2ZVNob3dEZWNvcmF0aW9ucygpIHtcbiAgICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5kZWxldGUob2JzU2hvd0RlY29yYXRpb25zQ0IpXG4gICAgICBpZiAoIUVkaXRvcnMpIHtcbiAgICAgICAgRWRpdG9ycyA9IHJlcXVpcmUoJy4vZWRpdG9ycycpXG4gICAgICB9XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dEZWNvcmF0aW9ucycsIChzaG93RGVjb3JhdGlvbnMpID0+IHtcbiAgICAgICAgaWYgKHNob3dEZWNvcmF0aW9ucyAmJiAhdGhpcy5lZGl0b3JzKSB7XG4gICAgICAgICAgdGhpcy5lZGl0b3JzID0gbmV3IEVkaXRvcnMoKVxuICAgICAgICAgIHRoaXMuZWRpdG9ycy51cGRhdGUoeyBhZGRlZDogdGhpcy5tZXNzYWdlcywgcmVtb3ZlZDogW10sIG1lc3NhZ2VzOiB0aGlzLm1lc3NhZ2VzIH0pXG4gICAgICAgIH0gZWxzZSBpZiAoIXNob3dEZWNvcmF0aW9ucyAmJiB0aGlzLmVkaXRvcnMpIHtcbiAgICAgICAgICB0aGlzLmVkaXRvcnMuZGlzcG9zZSgpXG4gICAgICAgICAgdGhpcy5lZGl0b3JzID0gbnVsbFxuICAgICAgICB9XG4gICAgICB9KSlcbiAgICB9LmJpbmQodGhpcykpXG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmFkZChvYnNTaG93RGVjb3JhdGlvbnNDQilcbiAgfVxuICByZW5kZXIoZGlmZmVyZW5jZTogTWVzc2FnZXNQYXRjaCkge1xuICAgIGNvbnN0IGVkaXRvcnMgPSB0aGlzLmVkaXRvcnNcblxuICAgIHRoaXMubWVzc2FnZXMgPSBkaWZmZXJlbmNlLm1lc3NhZ2VzXG4gICAgaWYgKGVkaXRvcnMpIHtcbiAgICAgIGlmIChlZGl0b3JzLmlzRmlyc3RSZW5kZXIoKSkge1xuICAgICAgICBlZGl0b3JzLnVwZGF0ZSh7IGFkZGVkOiBkaWZmZXJlbmNlLm1lc3NhZ2VzLCByZW1vdmVkOiBbXSwgbWVzc2FnZXM6IGRpZmZlcmVuY2UubWVzc2FnZXMgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVkaXRvcnMudXBkYXRlKGRpZmZlcmVuY2UpXG4gICAgICB9XG4gICAgfVxuICAgIC8vIEluaXRpYWxpemUgdGhlIFRyZWVWaWV3IHN1YnNjcmlwdGlvbiBpZiBuZWNlc3NhcnlcbiAgICBpZiAoIXRoaXMudHJlZXZpZXcpIHtcbiAgICAgIGlmICghVHJlZVZpZXcpIHtcbiAgICAgICAgVHJlZVZpZXcgPSByZXF1aXJlKCcuL3RyZWUtdmlldycpXG4gICAgICB9XG4gICAgICB0aGlzLnRyZWV2aWV3ID0gbmV3IFRyZWVWaWV3KClcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy50cmVldmlldylcbiAgICB9XG4gICAgdGhpcy50cmVldmlldy51cGRhdGUoZGlmZmVyZW5jZS5tZXNzYWdlcylcblxuICAgIGlmICh0aGlzLnBhbmVsKSB7XG4gICAgICB0aGlzLnBhbmVsLnVwZGF0ZShkaWZmZXJlbmNlLm1lc3NhZ2VzKVxuICAgIH1cbiAgICB0aGlzLmNvbW1hbmRzLnVwZGF0ZShkaWZmZXJlbmNlLm1lc3NhZ2VzKVxuICAgIHRoaXMuaW50ZW50aW9ucy51cGRhdGUoZGlmZmVyZW5jZS5tZXNzYWdlcylcbiAgICB0aGlzLnN0YXR1c0Jhci51cGRhdGUoZGlmZmVyZW5jZS5tZXNzYWdlcylcbiAgfVxuICBkaWRCZWdpbkxpbnRpbmcobGludGVyOiBMaW50ZXIsIGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNpZ25hbC5kaWRCZWdpbkxpbnRpbmcobGludGVyLCBmaWxlUGF0aClcbiAgfVxuICBkaWRGaW5pc2hMaW50aW5nKGxpbnRlcjogTGludGVyLCBmaWxlUGF0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5zaWduYWwuZGlkRmluaXNoTGludGluZyhsaW50ZXIsIGZpbGVQYXRoKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmZvckVhY2goY2FsbGJhY2tJRCA9PiB3aW5kb3cuY2FuY2VsSWRsZUNhbGxiYWNrKGNhbGxiYWNrSUQpKVxuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5jbGVhcigpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIGlmICh0aGlzLnBhbmVsKSB7XG4gICAgICB0aGlzLnBhbmVsLmRpc3Bvc2UoKVxuICAgIH1cbiAgICBpZiAodGhpcy5lZGl0b3JzKSB7XG4gICAgICB0aGlzLmVkaXRvcnMuZGlzcG9zZSgpXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGludGVyVUlcbiJdfQ==