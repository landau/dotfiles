Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sbEventKit = require('sb-event-kit');

var _panel = require('./panel');

var _panel2 = _interopRequireDefault(_panel);

var _editors = require('./editors');

var _editors2 = _interopRequireDefault(_editors);

var _treeView = require('./tree-view');

var _treeView2 = _interopRequireDefault(_treeView);

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

var _statusBar = require('./status-bar');

var _statusBar2 = _interopRequireDefault(_statusBar);

var _busySignal = require('./busy-signal');

var _busySignal2 = _interopRequireDefault(_busySignal);

var _intentions = require('./intentions');

var _intentions2 = _interopRequireDefault(_intentions);

var LinterUI = (function () {
  function LinterUI() {
    var _this = this;

    _classCallCheck(this, LinterUI);

    this.name = 'Linter';
    this.signal = new _busySignal2['default']();
    this.treeview = new _treeView2['default']();
    this.commands = new _commands2['default']();
    this.messages = [];
    this.statusBar = new _statusBar2['default']();
    this.intentions = new _intentions2['default']();
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.signal);
    this.subscriptions.add(this.treeview);
    this.subscriptions.add(this.commands);
    this.subscriptions.add(this.statusBar);

    this.subscriptions.add(atom.config.observe('linter-ui-default.showPanel', function (showPanel) {
      if (showPanel && !_this.panel) {
        _this.panel = new _panel2['default']();
        _this.panel.update(_this.messages);
      } else if (!showPanel && _this.panel) {
        _this.panel.dispose();
        _this.panel = null;
      }
    }));
    this.subscriptions.add(atom.config.observe('linter-ui-default.showDecorations', function (showDecorations) {
      if (showDecorations && !_this.editors) {
        _this.editors = new _editors2['default']();
        _this.editors.update({ added: _this.messages, removed: [], messages: _this.messages });
      } else if (!showDecorations && _this.editors) {
        _this.editors.dispose();
        _this.editors = null;
      }
    }));
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
      if (this.panel) {
        this.panel.update(difference.messages);
      }
      this.commands.update(difference.messages);
      this.treeview.update(difference.messages);
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

exports['default'] = LinterUI;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7MEJBRW9DLGNBQWM7O3FCQUNoQyxTQUFTOzs7O3VCQUNQLFdBQVc7Ozs7d0JBQ1YsYUFBYTs7Ozt3QkFDYixZQUFZOzs7O3lCQUNYLGNBQWM7Ozs7MEJBQ2IsZUFBZTs7OzswQkFDZixjQUFjOzs7O0lBR2hCLFFBQVE7QUFZaEIsV0FaUSxRQUFRLEdBWWI7OzswQkFaSyxRQUFROztBQWF6QixRQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQTtBQUNwQixRQUFJLENBQUMsTUFBTSxHQUFHLDZCQUFnQixDQUFBO0FBQzlCLFFBQUksQ0FBQyxRQUFRLEdBQUcsMkJBQWMsQ0FBQTtBQUM5QixRQUFJLENBQUMsUUFBUSxHQUFHLDJCQUFjLENBQUE7QUFDOUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsUUFBSSxDQUFDLFNBQVMsR0FBRyw0QkFBZSxDQUFBO0FBQ2hDLFFBQUksQ0FBQyxVQUFVLEdBQUcsNkJBQWdCLENBQUE7QUFDbEMsUUFBSSxDQUFDLGFBQWEsR0FBRyxxQ0FBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ25DLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUNyQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDckMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBOztBQUV0QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyw2QkFB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QUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQ3ZCO0tBQ0Y7OztTQS9Fa0IsUUFBUTs7O3FCQUFSLFFBQVEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnc2ItZXZlbnQta2l0J1xuaW1wb3J0IFBhbmVsIGZyb20gJy4vcGFuZWwnXG5pbXBvcnQgRWRpdG9ycyBmcm9tICcuL2VkaXRvcnMnXG5pbXBvcnQgVHJlZVZpZXcgZnJvbSAnLi90cmVlLXZpZXcnXG5pbXBvcnQgQ29tbWFuZHMgZnJvbSAnLi9jb21tYW5kcydcbmltcG9ydCBTdGF0dXNCYXIgZnJvbSAnLi9zdGF0dXMtYmFyJ1xuaW1wb3J0IEJ1c3lTaWduYWwgZnJvbSAnLi9idXN5LXNpZ25hbCdcbmltcG9ydCBJbnRlbnRpb25zIGZyb20gJy4vaW50ZW50aW9ucydcbmltcG9ydCB0eXBlIHsgTGludGVyLCBMaW50ZXJNZXNzYWdlLCBNZXNzYWdlc1BhdGNoIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGludGVyVUkge1xuICBuYW1lOiBzdHJpbmc7XG4gIHBhbmVsOiA/UGFuZWw7XG4gIHNpZ25hbDogQnVzeVNpZ25hbDtcbiAgZWRpdG9yczogP0VkaXRvcnM7XG4gIHRyZWV2aWV3OiBUcmVlVmlldztcbiAgY29tbWFuZHM6IENvbW1hbmRzO1xuICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT47XG4gIHN0YXR1c0JhcjogU3RhdHVzQmFyO1xuICBpbnRlbnRpb25zOiBJbnRlbnRpb25zO1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubmFtZSA9ICdMaW50ZXInXG4gICAgdGhpcy5zaWduYWwgPSBuZXcgQnVzeVNpZ25hbCgpXG4gICAgdGhpcy50cmVldmlldyA9IG5ldyBUcmVlVmlldygpXG4gICAgdGhpcy5jb21tYW5kcyA9IG5ldyBDb21tYW5kcygpXG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdXG4gICAgdGhpcy5zdGF0dXNCYXIgPSBuZXcgU3RhdHVzQmFyKClcbiAgICB0aGlzLmludGVudGlvbnMgPSBuZXcgSW50ZW50aW9ucygpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnNpZ25hbClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMudHJlZXZpZXcpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmNvbW1hbmRzKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5zdGF0dXNCYXIpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dQYW5lbCcsIChzaG93UGFuZWwpID0+IHtcbiAgICAgIGlmIChzaG93UGFuZWwgJiYgIXRoaXMucGFuZWwpIHtcbiAgICAgICAgdGhpcy5wYW5lbCA9IG5ldyBQYW5lbCgpXG4gICAgICAgIHRoaXMucGFuZWwudXBkYXRlKHRoaXMubWVzc2FnZXMpXG4gICAgICB9IGVsc2UgaWYgKCFzaG93UGFuZWwgJiYgdGhpcy5wYW5lbCkge1xuICAgICAgICB0aGlzLnBhbmVsLmRpc3Bvc2UoKVxuICAgICAgICB0aGlzLnBhbmVsID0gbnVsbFxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuc2hvd0RlY29yYXRpb25zJywgKHNob3dEZWNvcmF0aW9ucykgPT4ge1xuICAgICAgaWYgKHNob3dEZWNvcmF0aW9ucyAmJiAhdGhpcy5lZGl0b3JzKSB7XG4gICAgICAgIHRoaXMuZWRpdG9ycyA9IG5ldyBFZGl0b3JzKClcbiAgICAgICAgdGhpcy5lZGl0b3JzLnVwZGF0ZSh7IGFkZGVkOiB0aGlzLm1lc3NhZ2VzLCByZW1vdmVkOiBbXSwgbWVzc2FnZXM6IHRoaXMubWVzc2FnZXMgfSlcbiAgICAgIH0gZWxzZSBpZiAoIXNob3dEZWNvcmF0aW9ucyAmJiB0aGlzLmVkaXRvcnMpIHtcbiAgICAgICAgdGhpcy5lZGl0b3JzLmRpc3Bvc2UoKVxuICAgICAgICB0aGlzLmVkaXRvcnMgPSBudWxsXG4gICAgICB9XG4gICAgfSkpXG4gIH1cbiAgcmVuZGVyKGRpZmZlcmVuY2U6IE1lc3NhZ2VzUGF0Y2gpIHtcbiAgICBjb25zdCBlZGl0b3JzID0gdGhpcy5lZGl0b3JzXG5cbiAgICB0aGlzLm1lc3NhZ2VzID0gZGlmZmVyZW5jZS5tZXNzYWdlc1xuICAgIGlmIChlZGl0b3JzKSB7XG4gICAgICBpZiAoZWRpdG9ycy5pc0ZpcnN0UmVuZGVyKCkpIHtcbiAgICAgICAgZWRpdG9ycy51cGRhdGUoeyBhZGRlZDogZGlmZmVyZW5jZS5tZXNzYWdlcywgcmVtb3ZlZDogW10sIG1lc3NhZ2VzOiBkaWZmZXJlbmNlLm1lc3NhZ2VzIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlZGl0b3JzLnVwZGF0ZShkaWZmZXJlbmNlKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5wYW5lbCkge1xuICAgICAgdGhpcy5wYW5lbC51cGRhdGUoZGlmZmVyZW5jZS5tZXNzYWdlcylcbiAgICB9XG4gICAgdGhpcy5jb21tYW5kcy51cGRhdGUoZGlmZmVyZW5jZS5tZXNzYWdlcylcbiAgICB0aGlzLnRyZWV2aWV3LnVwZGF0ZShkaWZmZXJlbmNlLm1lc3NhZ2VzKVxuICAgIHRoaXMuaW50ZW50aW9ucy51cGRhdGUoZGlmZmVyZW5jZS5tZXNzYWdlcylcbiAgICB0aGlzLnN0YXR1c0Jhci51cGRhdGUoZGlmZmVyZW5jZS5tZXNzYWdlcylcbiAgfVxuICBkaWRCZWdpbkxpbnRpbmcobGludGVyOiBMaW50ZXIsIGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNpZ25hbC5kaWRCZWdpbkxpbnRpbmcobGludGVyLCBmaWxlUGF0aClcbiAgfVxuICBkaWRGaW5pc2hMaW50aW5nKGxpbnRlcjogTGludGVyLCBmaWxlUGF0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5zaWduYWwuZGlkRmluaXNoTGludGluZyhsaW50ZXIsIGZpbGVQYXRoKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIGlmICh0aGlzLnBhbmVsKSB7XG4gICAgICB0aGlzLnBhbmVsLmRpc3Bvc2UoKVxuICAgIH1cbiAgICBpZiAodGhpcy5lZGl0b3JzKSB7XG4gICAgICB0aGlzLmVkaXRvcnMuZGlzcG9zZSgpXG4gICAgfVxuICB9XG59XG4iXX0=