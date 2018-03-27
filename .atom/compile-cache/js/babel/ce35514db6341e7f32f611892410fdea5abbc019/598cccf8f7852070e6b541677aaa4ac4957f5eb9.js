Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _elementsList = require('./elements/list');

var _elementsList2 = _interopRequireDefault(_elementsList);

var ListView = (function () {
  function ListView() {
    _classCallCheck(this, ListView);

    this.emitter = new _atom.Emitter();
    this.element = new _elementsList2['default']();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(this.element);
  }

  _createClass(ListView, [{
    key: 'activate',
    value: function activate(editor, suggestions) {
      var _this = this;

      this.element.render(suggestions, function (selected) {
        _this.emitter.emit('did-select', selected);
        _this.dispose();
      });
      this.element.move('move-to-top');

      var bufferPosition = editor.getCursorBufferPosition();
      var marker = editor.markBufferRange([bufferPosition, bufferPosition], { invalidate: 'never' });
      editor.decorateMarker(marker, {
        type: 'overlay',
        item: this.element
      });
      this.subscriptions.add(new _atom.Disposable(function () {
        marker.destroy();
      }));
    }
  }, {
    key: 'move',
    value: function move(movement) {
      this.element.move(movement);
    }
  }, {
    key: 'select',
    value: function select() {
      this.element.select();
    }
  }, {
    key: 'onDidSelect',
    value: function onDidSelect(callback) {
      return this.emitter.on('did-select', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }]);

  return ListView;
})();

exports['default'] = ListView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2ludGVudGlvbnMvbGliL3ZpZXctbGlzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUV5RCxNQUFNOzs0QkFHdkMsaUJBQWlCOzs7O0lBR3BCLFFBQVE7QUFLaEIsV0FMUSxRQUFRLEdBS2I7MEJBTEssUUFBUTs7QUFNekIsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxPQUFPLEdBQUcsK0JBQWlCLENBQUE7QUFDaEMsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtHQUNyQzs7ZUFaa0IsUUFBUTs7V0FhbkIsa0JBQUMsTUFBa0IsRUFBRSxXQUE0QixFQUFFOzs7QUFDekQsVUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLFVBQUEsUUFBUSxFQUFJO0FBQzNDLGNBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDekMsY0FBSyxPQUFPLEVBQUUsQ0FBQTtPQUNmLENBQUMsQ0FBQTtBQUNGLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBOztBQUVoQyxVQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQTtBQUN2RCxVQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsY0FBYyxFQUFFLGNBQWMsQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7QUFDaEcsWUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUU7QUFDNUIsWUFBSSxFQUFFLFNBQVM7QUFDZixZQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU87T0FDbkIsQ0FBQyxDQUFBO0FBQ0YsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMscUJBQWUsWUFBVztBQUMvQyxjQUFNLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDakIsQ0FBQyxDQUFDLENBQUE7S0FDSjs7O1dBQ0csY0FBQyxRQUFzQixFQUFFO0FBQzNCLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQzVCOzs7V0FDSyxrQkFBRztBQUNQLFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUE7S0FDdEI7OztXQUNVLHFCQUFDLFFBQWtCLEVBQWM7QUFDMUMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDL0M7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3Qjs7O1NBekNrQixRQUFROzs7cUJBQVIsUUFBUSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9pbnRlbnRpb25zL2xpYi92aWV3LWxpc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyLCBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIHsgVGV4dEVkaXRvciB9IGZyb20gJ2F0b20nXG5cbmltcG9ydCBMaXN0RWxlbWVudCBmcm9tICcuL2VsZW1lbnRzL2xpc3QnXG5pbXBvcnQgdHlwZSB7IExpc3RJdGVtLCBMaXN0TW92ZW1lbnQgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaXN0VmlldyB7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIGVsZW1lbnQ6IExpc3RFbGVtZW50O1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLmVsZW1lbnQgPSBuZXcgTGlzdEVsZW1lbnQoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbGVtZW50KVxuICB9XG4gIGFjdGl2YXRlKGVkaXRvcjogVGV4dEVkaXRvciwgc3VnZ2VzdGlvbnM6IEFycmF5PExpc3RJdGVtPikge1xuICAgIHRoaXMuZWxlbWVudC5yZW5kZXIoc3VnZ2VzdGlvbnMsIHNlbGVjdGVkID0+IHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtc2VsZWN0Jywgc2VsZWN0ZWQpXG4gICAgICB0aGlzLmRpc3Bvc2UoKVxuICAgIH0pXG4gICAgdGhpcy5lbGVtZW50Lm1vdmUoJ21vdmUtdG8tdG9wJylcblxuICAgIGNvbnN0IGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBjb25zdCBtYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtidWZmZXJQb3NpdGlvbiwgYnVmZmVyUG9zaXRpb25dLCB7IGludmFsaWRhdGU6ICduZXZlcicgfSlcbiAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICB0eXBlOiAnb3ZlcmxheScsXG4gICAgICBpdGVtOiB0aGlzLmVsZW1lbnQsXG4gICAgfSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uKCkge1xuICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgIH0pKVxuICB9XG4gIG1vdmUobW92ZW1lbnQ6IExpc3RNb3ZlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudC5tb3ZlKG1vdmVtZW50KVxuICB9XG4gIHNlbGVjdCgpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2VsZWN0KClcbiAgfVxuICBvbkRpZFNlbGVjdChjYWxsYmFjazogRnVuY3Rpb24pOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtc2VsZWN0JywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cbiJdfQ==