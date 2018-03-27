Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _sbDebounce = require('sb-debounce');

var _sbDebounce2 = _interopRequireDefault(_sbDebounce);

var _helpers = require('./helpers');

var EditorLinter = (function () {
  function EditorLinter(editor) {
    var _this = this;

    _classCallCheck(this, EditorLinter);

    if (!atom.workspace.isTextEditor(editor)) {
      throw new Error('EditorLinter expects a valid TextEditor');
    }

    this.editor = editor;
    this.emitter = new _atom.Emitter();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.editor.onDidDestroy(function () {
      return _this.dispose();
    }));
    this.subscriptions.add(this.editor.onDidSave((0, _sbDebounce2['default'])(function () {
      return _this.emitter.emit('should-lint', false);
    }), 16, true));
    // NOTE: TextEditor::onDidChange immediately invokes the callback if the text editor was *just* created
    // Using TextBuffer::onDidChange doesn't have the same behavior so using it instead.
    this.subscriptions.add((0, _helpers.subscriptiveObserve)(atom.config, 'linter.lintOnChangeInterval', function (interval) {
      return _this.editor.getBuffer().onDidChange((0, _sbDebounce2['default'])(function () {
        _this.emitter.emit('should-lint', true);
      }, interval));
    }));
  }

  _createClass(EditorLinter, [{
    key: 'getEditor',
    value: function getEditor() {
      return this.editor;
    }
  }, {
    key: 'lint',
    value: function lint() {
      var onChange = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      this.emitter.emit('should-lint', onChange);
    }
  }, {
    key: 'onShouldLint',
    value: function onShouldLint(callback) {
      return this.emitter.on('should-lint', callback);
    }
  }, {
    key: 'onDidDestroy',
    value: function onDidDestroy(callback) {
      return this.emitter.on('did-destroy', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.emitter.emit('did-destroy');
      this.subscriptions.dispose();
      this.emitter.dispose();
    }
  }]);

  return EditorLinter;
})();

exports['default'] = EditorLinter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvZWRpdG9yLWxpbnRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUV5RCxNQUFNOzswQkFDMUMsYUFBYTs7Ozt1QkFFRSxXQUFXOztJQUUxQixZQUFZO0FBS3BCLFdBTFEsWUFBWSxDQUtuQixNQUFrQixFQUFFOzs7MEJBTGIsWUFBWTs7QUFNN0IsUUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQ3hDLFlBQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQTtLQUMzRDs7QUFFRCxRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7YUFDOUMsTUFBSyxPQUFPLEVBQUU7S0FBQSxDQUNmLENBQUMsQ0FBQTtBQUNGLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLDZCQUFTO2FBQ3BELE1BQUssT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDO0tBQUEsQ0FDeEMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTs7O0FBR2IsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsa0NBQW9CLElBQUksQ0FBQyxNQUFNLEVBQUUsNkJBQTZCLEVBQUUsVUFBQSxRQUFRO2FBQzdGLE1BQUssTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsQ0FBQyw2QkFBUyxZQUFNO0FBQ2pELGNBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUE7T0FDdkMsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUFBLENBQ2QsQ0FBQyxDQUFBO0dBQ0g7O2VBM0JrQixZQUFZOztXQTRCdEIscUJBQWU7QUFDdEIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFBO0tBQ25COzs7V0FDRyxnQkFBNEI7VUFBM0IsUUFBaUIseURBQUcsS0FBSzs7QUFDNUIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQzNDOzs7V0FDVyxzQkFBQyxRQUFrQixFQUFjO0FBQzNDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2hEOzs7V0FDVyxzQkFBQyxRQUFrQixFQUFjO0FBQzNDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2hEOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ2hDLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDNUIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUN2Qjs7O1NBNUNrQixZQUFZOzs7cUJBQVosWUFBWSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2VkaXRvci1saW50ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCBkZWJvdW5jZSBmcm9tICdzYi1kZWJvdW5jZSdcbmltcG9ydCB0eXBlIHsgVGV4dEVkaXRvciB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBzdWJzY3JpcHRpdmVPYnNlcnZlIH0gZnJvbSAnLi9oZWxwZXJzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFZGl0b3JMaW50ZXIge1xuICBlZGl0b3I6IFRleHRFZGl0b3I7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoZWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gICAgaWYgKCFhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IoZWRpdG9yKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFZGl0b3JMaW50ZXIgZXhwZWN0cyBhIHZhbGlkIFRleHRFZGl0b3InKVxuICAgIH1cblxuICAgIHRoaXMuZWRpdG9yID0gZWRpdG9yXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lZGl0b3Iub25EaWREZXN0cm95KCgpID0+XG4gICAgICB0aGlzLmRpc3Bvc2UoKVxuICAgICkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVkaXRvci5vbkRpZFNhdmUoZGVib3VuY2UoKCkgPT5cbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdzaG91bGQtbGludCcsIGZhbHNlKVxuICAgICksIDE2LCB0cnVlKSlcbiAgICAvLyBOT1RFOiBUZXh0RWRpdG9yOjpvbkRpZENoYW5nZSBpbW1lZGlhdGVseSBpbnZva2VzIHRoZSBjYWxsYmFjayBpZiB0aGUgdGV4dCBlZGl0b3Igd2FzICpqdXN0KiBjcmVhdGVkXG4gICAgLy8gVXNpbmcgVGV4dEJ1ZmZlcjo6b25EaWRDaGFuZ2UgZG9lc24ndCBoYXZlIHRoZSBzYW1lIGJlaGF2aW9yIHNvIHVzaW5nIGl0IGluc3RlYWQuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChzdWJzY3JpcHRpdmVPYnNlcnZlKGF0b20uY29uZmlnLCAnbGludGVyLmxpbnRPbkNoYW5nZUludGVydmFsJywgaW50ZXJ2YWwgPT5cbiAgICAgIHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkQ2hhbmdlKGRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3Nob3VsZC1saW50JywgdHJ1ZSlcbiAgICAgIH0sIGludGVydmFsKSlcbiAgICApKVxuICB9XG4gIGdldEVkaXRvcigpOiBUZXh0RWRpdG9yIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3JcbiAgfVxuICBsaW50KG9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnc2hvdWxkLWxpbnQnLCBvbkNoYW5nZSlcbiAgfVxuICBvblNob3VsZExpbnQoY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignc2hvdWxkLWxpbnQnLCBjYWxsYmFjaylcbiAgfVxuICBvbkRpZERlc3Ryb3koY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWRlc3Ryb3knLCBjYWxsYmFjaylcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZGVzdHJveScpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHRoaXMuZW1pdHRlci5kaXNwb3NlKClcbiAgfVxufVxuIl19