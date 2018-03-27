var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _panel = require('./panel');

var _panel2 = _interopRequireDefault(_panel);

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

var _statusBar = require('./status-bar');

var _statusBar2 = _interopRequireDefault(_statusBar);

var _busySignal = require('./busy-signal');

var _busySignal2 = _interopRequireDefault(_busySignal);

var _intentions = require('./intentions');

var _intentions2 = _interopRequireDefault(_intentions);

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
      this.idleCallbacks['delete'](obsShowPanelCB);
      this.panel = new _panel2['default']();
      this.panel.update(this.messages);
    }).bind(this));
    this.idleCallbacks.add(obsShowPanelCB);

    var obsShowDecorationsCB = window.requestIdleCallback((function observeShowDecorations() {
      var _this = this;

      this.idleCallbacks['delete'](obsShowDecorationsCB);
      if (!Editors) {
        Editors = require('./editors');
      }
      this.subscriptions.add(atom.config.observe('linter-ui-default.showDecorations', function (showDecorations) {
        if (showDecorations && !_this.editors) {
          _this.editors = new Editors();
          _this.editors.update({ added: _this.messages, removed: [], messages: _this.messages });
        } else if (!showDecorations && _this.editors) {
          _this.editors.dispose();
          _this.editors = null;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztvQkFFb0MsTUFBTTs7cUJBQ3hCLFNBQVM7Ozs7d0JBQ04sWUFBWTs7Ozt5QkFDWCxjQUFjOzs7OzBCQUNiLGVBQWU7Ozs7MEJBQ2YsY0FBYzs7OztBQUdyQyxJQUFJLE9BQU8sWUFBQSxDQUFBO0FBQ1gsSUFBSSxRQUFRLFlBQUEsQ0FBQTs7SUFFTixRQUFRO0FBYUQsV0FiUCxRQUFRLEdBYUU7MEJBYlYsUUFBUTs7QUFjVixRQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQTtBQUNwQixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDOUIsUUFBSSxDQUFDLE1BQU0sR0FBRyw2QkFBZ0IsQ0FBQTtBQUM5QixRQUFJLENBQUMsUUFBUSxHQUFHLDJCQUFjLENBQUE7QUFDOUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsUUFBSSxDQUFDLFNBQVMsR0FBRyw0QkFBZSxDQUFBO0FBQ2hDLFFBQUksQ0FBQyxVQUFVLEdBQUcsNkJBQWdCLENBQUE7QUFDbEMsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ25DLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUNyQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7O0FBRXRDLFFBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBLFNBQVMsZ0JBQWdCLEdBQUc7QUFDNUUsVUFBSSxDQUFDLGFBQWEsVUFBTyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ3pDLFVBQUksQ0FBQyxLQUFLLEdBQUcsd0JBQVcsQ0FBQTtBQUN4QixVQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDakMsQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBQ2IsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUE7O0FBRXRDLFFBQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUEsU0FBUyxzQkFBc0IsR0FBRzs7O0FBQ3hGLFVBQUksQ0FBQyxhQUFhLFVBQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0FBQy9DLFVBQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixlQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO09BQy9CO0FBQ0QsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUNBQW1DLEVBQUUsVUFBQyxlQUFlLEVBQUs7QUFDbkcsWUFBSSxlQUFlLElBQUksQ0FBQyxNQUFLLE9BQU8sRUFBRTtBQUNwQyxnQkFBSyxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQTtBQUM1QixnQkFBSyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQUssUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQUssUUFBUSxFQUFFLENBQUMsQ0FBQTtTQUNwRixNQUFNLElBQUksQ0FBQyxlQUFlLElBQUksTUFBSyxPQUFPLEVBQUU7QUFDM0MsZ0JBQUssT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3RCLGdCQUFLLE9BQU8sR0FBRyxJQUFJLENBQUE7U0FDcEI7T0FDRixDQUFDLENBQUMsQ0FBQTtLQUNKLENBQUEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUNiLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUE7R0FDN0M7O2VBbERHLFFBQVE7O1dBbUROLGdCQUFDLFVBQXlCLEVBQUU7QUFDaEMsVUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQTs7QUFFNUIsVUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFBO0FBQ25DLFVBQUksT0FBTyxFQUFFO0FBQ1gsWUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUU7QUFDM0IsaUJBQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtTQUMzRixNQUFNO0FBQ0wsaUJBQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUE7U0FDM0I7T0FDRjs7QUFFRCxVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNsQixZQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2Isa0JBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7U0FDbEM7QUFDRCxZQUFJLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUE7QUFDOUIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO09BQ3RDO0FBQ0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFBOztBQUV6QyxVQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZCxZQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUE7T0FDdkM7QUFDRCxVQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDekMsVUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzNDLFVBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUMzQzs7O1dBQ2MseUJBQUMsTUFBYyxFQUFFLFFBQWdCLEVBQUU7QUFDaEQsVUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQzlDOzs7V0FDZSwwQkFBQyxNQUFjLEVBQUUsUUFBZ0IsRUFBRTtBQUNqRCxVQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUMvQzs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFVBQVU7ZUFBSSxNQUFNLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDO09BQUEsQ0FBQyxDQUFBO0FBQy9FLFVBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDMUIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QixVQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZCxZQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQ3JCO0FBQ0QsVUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDdkI7S0FDRjs7O1NBL0ZHLFFBQVE7OztBQWtHZCxNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IFBhbmVsIGZyb20gJy4vcGFuZWwnXG5pbXBvcnQgQ29tbWFuZHMgZnJvbSAnLi9jb21tYW5kcydcbmltcG9ydCBTdGF0dXNCYXIgZnJvbSAnLi9zdGF0dXMtYmFyJ1xuaW1wb3J0IEJ1c3lTaWduYWwgZnJvbSAnLi9idXN5LXNpZ25hbCdcbmltcG9ydCBJbnRlbnRpb25zIGZyb20gJy4vaW50ZW50aW9ucydcbmltcG9ydCB0eXBlIHsgTGludGVyLCBMaW50ZXJNZXNzYWdlLCBNZXNzYWdlc1BhdGNoIH0gZnJvbSAnLi90eXBlcydcblxubGV0IEVkaXRvcnNcbmxldCBUcmVlVmlld1xuXG5jbGFzcyBMaW50ZXJVSSB7XG4gIG5hbWU6IHN0cmluZztcbiAgcGFuZWw6IFBhbmVsO1xuICBzaWduYWw6IEJ1c3lTaWduYWw7XG4gIGVkaXRvcnM6ID9FZGl0b3JzO1xuICB0cmVldmlldzogVHJlZVZpZXc7XG4gIGNvbW1hbmRzOiBDb21tYW5kcztcbiAgbWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+O1xuICBzdGF0dXNCYXI6IFN0YXR1c0JhcjtcbiAgaW50ZW50aW9uczogSW50ZW50aW9ucztcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgaWRsZUNhbGxiYWNrczogU2V0PG51bWJlcj47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5uYW1lID0gJ0xpbnRlcidcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MgPSBuZXcgU2V0KClcbiAgICB0aGlzLnNpZ25hbCA9IG5ldyBCdXN5U2lnbmFsKClcbiAgICB0aGlzLmNvbW1hbmRzID0gbmV3IENvbW1hbmRzKClcbiAgICB0aGlzLm1lc3NhZ2VzID0gW11cbiAgICB0aGlzLnN0YXR1c0JhciA9IG5ldyBTdGF0dXNCYXIoKVxuICAgIHRoaXMuaW50ZW50aW9ucyA9IG5ldyBJbnRlbnRpb25zKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuc2lnbmFsKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5jb21tYW5kcylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuc3RhdHVzQmFyKVxuXG4gICAgY29uc3Qgb2JzU2hvd1BhbmVsQ0IgPSB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFjayhmdW5jdGlvbiBvYnNlcnZlU2hvd1BhbmVsKCkge1xuICAgICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmRlbGV0ZShvYnNTaG93UGFuZWxDQilcbiAgICAgIHRoaXMucGFuZWwgPSBuZXcgUGFuZWwoKVxuICAgICAgdGhpcy5wYW5lbC51cGRhdGUodGhpcy5tZXNzYWdlcylcbiAgICB9LmJpbmQodGhpcykpXG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmFkZChvYnNTaG93UGFuZWxDQilcblxuICAgIGNvbnN0IG9ic1Nob3dEZWNvcmF0aW9uc0NCID0gd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2soZnVuY3Rpb24gb2JzZXJ2ZVNob3dEZWNvcmF0aW9ucygpIHtcbiAgICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5kZWxldGUob2JzU2hvd0RlY29yYXRpb25zQ0IpXG4gICAgICBpZiAoIUVkaXRvcnMpIHtcbiAgICAgICAgRWRpdG9ycyA9IHJlcXVpcmUoJy4vZWRpdG9ycycpXG4gICAgICB9XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dEZWNvcmF0aW9ucycsIChzaG93RGVjb3JhdGlvbnMpID0+IHtcbiAgICAgICAgaWYgKHNob3dEZWNvcmF0aW9ucyAmJiAhdGhpcy5lZGl0b3JzKSB7XG4gICAgICAgICAgdGhpcy5lZGl0b3JzID0gbmV3IEVkaXRvcnMoKVxuICAgICAgICAgIHRoaXMuZWRpdG9ycy51cGRhdGUoeyBhZGRlZDogdGhpcy5tZXNzYWdlcywgcmVtb3ZlZDogW10sIG1lc3NhZ2VzOiB0aGlzLm1lc3NhZ2VzIH0pXG4gICAgICAgIH0gZWxzZSBpZiAoIXNob3dEZWNvcmF0aW9ucyAmJiB0aGlzLmVkaXRvcnMpIHtcbiAgICAgICAgICB0aGlzLmVkaXRvcnMuZGlzcG9zZSgpXG4gICAgICAgICAgdGhpcy5lZGl0b3JzID0gbnVsbFxuICAgICAgICB9XG4gICAgICB9KSlcbiAgICB9LmJpbmQodGhpcykpXG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmFkZChvYnNTaG93RGVjb3JhdGlvbnNDQilcbiAgfVxuICByZW5kZXIoZGlmZmVyZW5jZTogTWVzc2FnZXNQYXRjaCkge1xuICAgIGNvbnN0IGVkaXRvcnMgPSB0aGlzLmVkaXRvcnNcblxuICAgIHRoaXMubWVzc2FnZXMgPSBkaWZmZXJlbmNlLm1lc3NhZ2VzXG4gICAgaWYgKGVkaXRvcnMpIHtcbiAgICAgIGlmIChlZGl0b3JzLmlzRmlyc3RSZW5kZXIoKSkge1xuICAgICAgICBlZGl0b3JzLnVwZGF0ZSh7IGFkZGVkOiBkaWZmZXJlbmNlLm1lc3NhZ2VzLCByZW1vdmVkOiBbXSwgbWVzc2FnZXM6IGRpZmZlcmVuY2UubWVzc2FnZXMgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVkaXRvcnMudXBkYXRlKGRpZmZlcmVuY2UpXG4gICAgICB9XG4gICAgfVxuICAgIC8vIEluaXRpYWxpemUgdGhlIFRyZWVWaWV3IHN1YnNjcmlwdGlvbiBpZiBuZWNlc3NhcnlcbiAgICBpZiAoIXRoaXMudHJlZXZpZXcpIHtcbiAgICAgIGlmICghVHJlZVZpZXcpIHtcbiAgICAgICAgVHJlZVZpZXcgPSByZXF1aXJlKCcuL3RyZWUtdmlldycpXG4gICAgICB9XG4gICAgICB0aGlzLnRyZWV2aWV3ID0gbmV3IFRyZWVWaWV3KClcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy50cmVldmlldylcbiAgICB9XG4gICAgdGhpcy50cmVldmlldy51cGRhdGUoZGlmZmVyZW5jZS5tZXNzYWdlcylcblxuICAgIGlmICh0aGlzLnBhbmVsKSB7XG4gICAgICB0aGlzLnBhbmVsLnVwZGF0ZShkaWZmZXJlbmNlLm1lc3NhZ2VzKVxuICAgIH1cbiAgICB0aGlzLmNvbW1hbmRzLnVwZGF0ZShkaWZmZXJlbmNlLm1lc3NhZ2VzKVxuICAgIHRoaXMuaW50ZW50aW9ucy51cGRhdGUoZGlmZmVyZW5jZS5tZXNzYWdlcylcbiAgICB0aGlzLnN0YXR1c0Jhci51cGRhdGUoZGlmZmVyZW5jZS5tZXNzYWdlcylcbiAgfVxuICBkaWRCZWdpbkxpbnRpbmcobGludGVyOiBMaW50ZXIsIGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNpZ25hbC5kaWRCZWdpbkxpbnRpbmcobGludGVyLCBmaWxlUGF0aClcbiAgfVxuICBkaWRGaW5pc2hMaW50aW5nKGxpbnRlcjogTGludGVyLCBmaWxlUGF0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5zaWduYWwuZGlkRmluaXNoTGludGluZyhsaW50ZXIsIGZpbGVQYXRoKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmZvckVhY2goY2FsbGJhY2tJRCA9PiB3aW5kb3cuY2FuY2VsSWRsZUNhbGxiYWNrKGNhbGxiYWNrSUQpKVxuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5jbGVhcigpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIGlmICh0aGlzLnBhbmVsKSB7XG4gICAgICB0aGlzLnBhbmVsLmRpc3Bvc2UoKVxuICAgIH1cbiAgICBpZiAodGhpcy5lZGl0b3JzKSB7XG4gICAgICB0aGlzLmVkaXRvcnMuZGlzcG9zZSgpXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGludGVyVUlcbiJdfQ==