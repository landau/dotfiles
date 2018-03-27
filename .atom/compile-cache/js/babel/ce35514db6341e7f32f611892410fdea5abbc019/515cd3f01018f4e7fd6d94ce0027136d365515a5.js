Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _editorLinter = require('./editor-linter');

var _editorLinter2 = _interopRequireDefault(_editorLinter);

var EditorRegistry = (function () {
  function EditorRegistry() {
    var _this = this;

    _classCallCheck(this, EditorRegistry);

    this.emitter = new _atom.Emitter();
    this.subscriptions = new _atom.CompositeDisposable();
    this.editorLinters = new Map();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('linter.lintOnOpen', function (lintOnOpen) {
      _this.lintOnOpen = lintOnOpen;
    }));
  }

  _createClass(EditorRegistry, [{
    key: 'activate',
    value: function activate() {
      var _this2 = this;

      this.subscriptions.add(atom.workspace.observeTextEditors(function (textEditor) {
        _this2.createFromTextEditor(textEditor);
      }));
    }
  }, {
    key: 'get',
    value: function get(textEditor) {
      return this.editorLinters.get(textEditor);
    }
  }, {
    key: 'createFromTextEditor',
    value: function createFromTextEditor(textEditor) {
      var _this3 = this;

      var editorLinter = this.editorLinters.get(textEditor);
      if (editorLinter) {
        return editorLinter;
      }
      editorLinter = new _editorLinter2['default'](textEditor);
      editorLinter.onDidDestroy(function () {
        _this3.editorLinters['delete'](textEditor);
      });
      this.editorLinters.set(textEditor, editorLinter);
      this.emitter.emit('observe', editorLinter);
      if (this.lintOnOpen) {
        editorLinter.lint();
      }
      return editorLinter;
    }
  }, {
    key: 'observe',
    value: function observe(callback) {
      this.editorLinters.forEach(callback);
      return this.emitter.on('observe', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      for (var entry of this.editorLinters.values()) {
        entry.dispose();
      }
      this.subscriptions.dispose();
    }
  }]);

  return EditorRegistry;
})();

exports['default'] = EditorRegistry;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvZWRpdG9yLXJlZ2lzdHJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRTZDLE1BQU07OzRCQUUxQixpQkFBaUI7Ozs7SUFFckIsY0FBYztBQU10QixXQU5RLGNBQWMsR0FNbkI7OzswQkFOSyxjQUFjOztBQU8vQixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7O0FBRTlCLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNwQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxVQUFDLFVBQVUsRUFBSztBQUM5RSxZQUFLLFVBQVUsR0FBRyxVQUFVLENBQUE7S0FDN0IsQ0FBQyxDQUFDLENBQUE7R0FDSjs7ZUFma0IsY0FBYzs7V0FnQnpCLG9CQUFHOzs7QUFDVCxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLFVBQUMsVUFBVSxFQUFLO0FBQ3ZFLGVBQUssb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUE7T0FDdEMsQ0FBQyxDQUFDLENBQUE7S0FDSjs7O1dBQ0UsYUFBQyxVQUFzQixFQUFpQjtBQUN6QyxhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0tBQzFDOzs7V0FDbUIsOEJBQUMsVUFBc0IsRUFBZ0I7OztBQUN6RCxVQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUNyRCxVQUFJLFlBQVksRUFBRTtBQUNoQixlQUFPLFlBQVksQ0FBQTtPQUNwQjtBQUNELGtCQUFZLEdBQUcsOEJBQWlCLFVBQVUsQ0FBQyxDQUFBO0FBQzNDLGtCQUFZLENBQUMsWUFBWSxDQUFDLFlBQU07QUFDOUIsZUFBSyxhQUFhLFVBQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtPQUN0QyxDQUFDLENBQUE7QUFDRixVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUE7QUFDaEQsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFBO0FBQzFDLFVBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNuQixvQkFBWSxDQUFDLElBQUksRUFBRSxDQUFBO09BQ3BCO0FBQ0QsYUFBTyxZQUFZLENBQUE7S0FDcEI7OztXQUNNLGlCQUFDLFFBQWdELEVBQWM7QUFDcEUsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDcEMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDNUM7OztXQUNNLG1CQUFHO0FBQ1IsV0FBSyxJQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxFQUFFO0FBQy9DLGFBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtPQUNoQjtBQUNELFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDN0I7OztTQWpEa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9lZGl0b3ItcmVnaXN0cnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIHsgRGlzcG9zYWJsZSwgVGV4dEVkaXRvciB9IGZyb20gJ2F0b20nXG5pbXBvcnQgRWRpdG9yTGludGVyIGZyb20gJy4vZWRpdG9yLWxpbnRlcidcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWRpdG9yUmVnaXN0cnkge1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBsaW50T25PcGVuOiBib29sZWFuO1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBlZGl0b3JMaW50ZXJzOiBNYXA8VGV4dEVkaXRvciwgRWRpdG9yTGludGVyPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuZWRpdG9yTGludGVycyA9IG5ldyBNYXAoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIubGludE9uT3BlbicsIChsaW50T25PcGVuKSA9PiB7XG4gICAgICB0aGlzLmxpbnRPbk9wZW4gPSBsaW50T25PcGVuXG4gICAgfSkpXG4gIH1cbiAgYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoKHRleHRFZGl0b3IpID0+IHtcbiAgICAgIHRoaXMuY3JlYXRlRnJvbVRleHRFZGl0b3IodGV4dEVkaXRvcilcbiAgICB9KSlcbiAgfVxuICBnZXQodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6ID9FZGl0b3JMaW50ZXIge1xuICAgIHJldHVybiB0aGlzLmVkaXRvckxpbnRlcnMuZ2V0KHRleHRFZGl0b3IpXG4gIH1cbiAgY3JlYXRlRnJvbVRleHRFZGl0b3IodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IEVkaXRvckxpbnRlciB7XG4gICAgbGV0IGVkaXRvckxpbnRlciA9IHRoaXMuZWRpdG9yTGludGVycy5nZXQodGV4dEVkaXRvcilcbiAgICBpZiAoZWRpdG9yTGludGVyKSB7XG4gICAgICByZXR1cm4gZWRpdG9yTGludGVyXG4gICAgfVxuICAgIGVkaXRvckxpbnRlciA9IG5ldyBFZGl0b3JMaW50ZXIodGV4dEVkaXRvcilcbiAgICBlZGl0b3JMaW50ZXIub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgIHRoaXMuZWRpdG9yTGludGVycy5kZWxldGUodGV4dEVkaXRvcilcbiAgICB9KVxuICAgIHRoaXMuZWRpdG9yTGludGVycy5zZXQodGV4dEVkaXRvciwgZWRpdG9yTGludGVyKVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdvYnNlcnZlJywgZWRpdG9yTGludGVyKVxuICAgIGlmICh0aGlzLmxpbnRPbk9wZW4pIHtcbiAgICAgIGVkaXRvckxpbnRlci5saW50KClcbiAgICB9XG4gICAgcmV0dXJuIGVkaXRvckxpbnRlclxuICB9XG4gIG9ic2VydmUoY2FsbGJhY2s6ICgoZWRpdG9yTGludGVyOiBFZGl0b3JMaW50ZXIpID0+IHZvaWQpKTogRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5lZGl0b3JMaW50ZXJzLmZvckVhY2goY2FsbGJhY2spXG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignb2JzZXJ2ZScsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLmVkaXRvckxpbnRlcnMudmFsdWVzKCkpIHtcbiAgICAgIGVudHJ5LmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cbiJdfQ==