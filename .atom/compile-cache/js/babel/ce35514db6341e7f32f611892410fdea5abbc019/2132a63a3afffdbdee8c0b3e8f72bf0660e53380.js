Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('atom');

var CoverageView = (function (_HTMLElement) {
  _inherits(CoverageView, _HTMLElement);

  function CoverageView() {
    _classCallCheck(this, CoverageView);

    _get(Object.getPrototypeOf(CoverageView.prototype), 'constructor', this).apply(this, arguments);

    this.tooltipDisposable = null;
  }

  _createClass(CoverageView, [{
    key: 'initialize',
    value: function initialize() {
      this.classList.add('inline-block');

      this.addEventListener('click', function () {
        atom.config.set('flow-ide.showUncovered', !atom.config.get('flow-ide.showUncovered'));
      });
    }
  }, {
    key: 'update',
    value: function update(json) {
      var covered = json.expressions.covered_count;
      var uncovered = json.expressions.uncovered_count;
      var total = covered + uncovered;
      var percent = total === 0 ? 100 : Math.round(covered / total * 100);

      this.textContent = 'Flow Coverage: ' + percent + '%';

      if (this.tooltipDisposable) {
        this.tooltipDisposable.dispose();
      }

      this.classList.remove('flow-ide-hide');
      this.tooltipDisposable = atom.tooltips.add(this, {
        title: 'Covered ' + percent + '% (' + covered + ' of ' + total + ' expressions)<br>Click to toggle uncovered code'
      });
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.classList.add('flow-ide-hide');
      this.textContent = '';
      if (this.tooltipDisposable) {
        this.tooltipDisposable.dispose();
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.tooltipDisposable) {
        this.tooltipDisposable.dispose();
      }
    }
  }]);

  return CoverageView;
})(HTMLElement);

exports['default'] = document.registerElement('flow-ide-coverage', {
  prototype: CoverageView.prototype,
  'extends': 'a'
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2Zsb3ctaWRlL2xpYi9jb3ZlcmFnZS12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztvQkFFb0MsTUFBTTs7SUFHcEMsWUFBWTtZQUFaLFlBQVk7O1dBQVosWUFBWTswQkFBWixZQUFZOzsrQkFBWixZQUFZOztTQUNoQixpQkFBaUIsR0FBNkIsSUFBSTs7O2VBRDlDLFlBQVk7O1dBR04sc0JBQVM7QUFDakIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUE7O0FBRWxDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsWUFBTTtBQUNuQyxZQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQTtPQUN0RixDQUFDLENBQUE7S0FDSDs7O1dBRUssZ0JBQUMsSUFBb0IsRUFBUTtBQUNqQyxVQUFNLE9BQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQTtBQUN0RCxVQUFNLFNBQWlCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUE7QUFDMUQsVUFBTSxLQUFhLEdBQUcsT0FBTyxHQUFHLFNBQVMsQ0FBQTtBQUN6QyxVQUFNLE9BQWUsR0FBRyxLQUFLLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEFBQUMsT0FBTyxHQUFHLEtBQUssR0FBSSxHQUFHLENBQUMsQ0FBQTs7QUFFL0UsVUFBSSxDQUFDLFdBQVcsdUJBQXFCLE9BQU8sTUFBRyxDQUFBOztBQUUvQyxVQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtBQUMxQixZQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDakM7O0FBRUQsVUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsVUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTtBQUMvQyxhQUFLLGVBQWEsT0FBTyxXQUFNLE9BQU8sWUFBTyxLQUFLLG9EQUFpRDtPQUNwRyxDQUFDLENBQUE7S0FDSDs7O1dBRUksaUJBQUc7QUFDTixVQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUNuQyxVQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQTtBQUNyQixVQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtBQUMxQixZQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDakM7S0FDRjs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtBQUMxQixZQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDakM7S0FDRjs7O1NBekNHLFlBQVk7R0FBUyxXQUFXOztxQkE0Q3ZCLFFBQVEsQ0FBQyxlQUFlLENBQUMsbUJBQW1CLEVBQUU7QUFDM0QsV0FBUyxFQUFFLFlBQVksQ0FBQyxTQUFTO0FBQ2pDLGFBQVMsR0FBRztDQUNiLENBQUMiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvZmxvdy1pZGUvbGliL2NvdmVyYWdlLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIHsgQ292ZXJhZ2VPYmplY3QgfSBmcm9tICcuL3R5cGVzJ1xuXG5jbGFzcyBDb3ZlcmFnZVZpZXcgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIHRvb2x0aXBEaXNwb3NhYmxlOiBDb21wb3NpdGVEaXNwb3NhYmxlfG51bGwgPSBudWxsO1xuXG4gIGluaXRpYWxpemUoKTogdm9pZCB7XG4gICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdpbmxpbmUtYmxvY2snKVxuXG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGF0b20uY29uZmlnLnNldCgnZmxvdy1pZGUuc2hvd1VuY292ZXJlZCcsICFhdG9tLmNvbmZpZy5nZXQoJ2Zsb3ctaWRlLnNob3dVbmNvdmVyZWQnKSlcbiAgICB9KVxuICB9XG5cbiAgdXBkYXRlKGpzb246IENvdmVyYWdlT2JqZWN0KTogdm9pZCB7XG4gICAgY29uc3QgY292ZXJlZDogbnVtYmVyID0ganNvbi5leHByZXNzaW9ucy5jb3ZlcmVkX2NvdW50XG4gICAgY29uc3QgdW5jb3ZlcmVkOiBudW1iZXIgPSBqc29uLmV4cHJlc3Npb25zLnVuY292ZXJlZF9jb3VudFxuICAgIGNvbnN0IHRvdGFsOiBudW1iZXIgPSBjb3ZlcmVkICsgdW5jb3ZlcmVkXG4gICAgY29uc3QgcGVyY2VudDogbnVtYmVyID0gdG90YWwgPT09IDAgPyAxMDAgOiBNYXRoLnJvdW5kKChjb3ZlcmVkIC8gdG90YWwpICogMTAwKVxuXG4gICAgdGhpcy50ZXh0Q29udGVudCA9IGBGbG93IENvdmVyYWdlOiAke3BlcmNlbnR9JWBcblxuICAgIGlmICh0aGlzLnRvb2x0aXBEaXNwb3NhYmxlKSB7XG4gICAgICB0aGlzLnRvb2x0aXBEaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgIH1cblxuICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZSgnZmxvdy1pZGUtaGlkZScpXG4gICAgdGhpcy50b29sdGlwRGlzcG9zYWJsZSA9IGF0b20udG9vbHRpcHMuYWRkKHRoaXMsIHtcbiAgICAgIHRpdGxlOiBgQ292ZXJlZCAke3BlcmNlbnR9JSAoJHtjb3ZlcmVkfSBvZiAke3RvdGFsfSBleHByZXNzaW9ucyk8YnI+Q2xpY2sgdG8gdG9nZ2xlIHVuY292ZXJlZCBjb2RlYCxcbiAgICB9KVxuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdmbG93LWlkZS1oaWRlJylcbiAgICB0aGlzLnRleHRDb250ZW50ID0gJydcbiAgICBpZiAodGhpcy50b29sdGlwRGlzcG9zYWJsZSkge1xuICAgICAgdGhpcy50b29sdGlwRGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnRvb2x0aXBEaXNwb3NhYmxlKSB7XG4gICAgICB0aGlzLnRvb2x0aXBEaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ2Zsb3ctaWRlLWNvdmVyYWdlJywge1xuICBwcm90b3R5cGU6IENvdmVyYWdlVmlldy5wcm90b3R5cGUsXG4gIGV4dGVuZHM6ICdhJyxcbn0pXG4iXX0=