Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

var stylesheetPath = _path2['default'].resolve(__dirname, '../../styles/minimap.less');
var stylesheet = atom.themes.loadStylesheet(stylesheetPath);

exports['default'] = { stylesheet: stylesheet };

beforeEach(function () {
  if (!atom.workspace.buildTextEditor) {
    (function () {
      var _require = require('atom');

      var TextEditor = _require.TextEditor;

      atom.workspace.buildTextEditor = function (opts) {
        return new TextEditor(opts);
      };
    })();
  }

  var jasmineContent = document.body.querySelector('#jasmine-content');
  var styleNode = document.createElement('style');
  styleNode.textContent = '\n    ' + stylesheet + '\n\n    atom-text-editor-minimap[stand-alone] {\n      width: 100px\n      height: 100px\n    }\n\n    atom-text-editor, atom-text-editor::shadow {\n      line-height: 17px\n    }\n\n    atom-text-editor atom-text-editor-minimap, atom-text-editor::shadow atom-text-editor-minimap {\n      background: rgba(255,0,0,0.3)\n    }\n\n    atom-text-editor atom-text-editor-minimap::shadow .minimap-scroll-indicator, atom-text-editor::shadow atom-text-editor-minimap::shadow .minimap-scroll-indicator {\n      background: rgba(0,0,255,0.3)\n    }\n\n    atom-text-editor atom-text-editor-minimap::shadow .minimap-visible-area, atom-text-editor::shadow atom-text-editor-minimap::shadow .minimap-visible-area {\n      background: rgba(0,255,0,0.3)\n      opacity: 1\n    }\n\n    atom-text-editor::shadow atom-text-editor-minimap::shadow .open-minimap-quick-settings {\n      opacity: 1 !important\n    }\n  ';

  jasmineContent.appendChild(styleNode);
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvc3BlYy9oZWxwZXJzL3dvcmtzcGFjZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBRWlCLE1BQU07Ozs7QUFGdkIsV0FBVyxDQUFBOztBQUlYLElBQUksY0FBYyxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxTQUFTLEVBQUUsMkJBQTJCLENBQUMsQ0FBQTtBQUN6RSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQTs7cUJBRTVDLEVBQUMsVUFBVSxFQUFWLFVBQVUsRUFBQzs7QUFFM0IsVUFBVSxDQUFDLFlBQU07QUFDZixNQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUU7O3FCQUNoQixPQUFPLENBQUMsTUFBTSxDQUFDOztVQUE3QixVQUFVLFlBQVYsVUFBVTs7QUFDZixVQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsR0FBRyxVQUFVLElBQUksRUFBRTtBQUMvQyxlQUFPLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO09BQzVCLENBQUE7O0dBQ0Y7O0FBRUQsTUFBSSxjQUFjLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtBQUNwRSxNQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQy9DLFdBQVMsQ0FBQyxXQUFXLGNBQ2pCLFVBQVUsdzRCQTJCYixDQUFBOztBQUVELGdCQUFjLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0NBQ3RDLENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL3NwZWMvaGVscGVycy93b3Jrc3BhY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5sZXQgc3R5bGVzaGVldFBhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vc3R5bGVzL21pbmltYXAubGVzcycpXG5sZXQgc3R5bGVzaGVldCA9IGF0b20udGhlbWVzLmxvYWRTdHlsZXNoZWV0KHN0eWxlc2hlZXRQYXRoKVxuXG5leHBvcnQgZGVmYXVsdCB7c3R5bGVzaGVldH1cblxuYmVmb3JlRWFjaCgoKSA9PiB7XG4gIGlmICghYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKSB7XG4gICAgbGV0IHtUZXh0RWRpdG9yfSA9IHJlcXVpcmUoJ2F0b20nKVxuICAgIGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvciA9IGZ1bmN0aW9uIChvcHRzKSB7XG4gICAgICByZXR1cm4gbmV3IFRleHRFZGl0b3Iob3B0cylcbiAgICB9XG4gIH1cblxuICBsZXQgamFzbWluZUNvbnRlbnQgPSBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJyNqYXNtaW5lLWNvbnRlbnQnKVxuICBsZXQgc3R5bGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICBzdHlsZU5vZGUudGV4dENvbnRlbnQgPSBgXG4gICAgJHtzdHlsZXNoZWV0fVxuXG4gICAgYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwW3N0YW5kLWFsb25lXSB7XG4gICAgICB3aWR0aDogMTAwcHhcbiAgICAgIGhlaWdodDogMTAwcHhcbiAgICB9XG5cbiAgICBhdG9tLXRleHQtZWRpdG9yLCBhdG9tLXRleHQtZWRpdG9yOjpzaGFkb3cge1xuICAgICAgbGluZS1oZWlnaHQ6IDE3cHhcbiAgICB9XG5cbiAgICBhdG9tLXRleHQtZWRpdG9yIGF0b20tdGV4dC1lZGl0b3ItbWluaW1hcCwgYXRvbS10ZXh0LWVkaXRvcjo6c2hhZG93IGF0b20tdGV4dC1lZGl0b3ItbWluaW1hcCB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwwLDAsMC4zKVxuICAgIH1cblxuICAgIGF0b20tdGV4dC1lZGl0b3IgYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwOjpzaGFkb3cgLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvciwgYXRvbS10ZXh0LWVkaXRvcjo6c2hhZG93IGF0b20tdGV4dC1lZGl0b3ItbWluaW1hcDo6c2hhZG93IC5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3Ige1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLDAsMjU1LDAuMylcbiAgICB9XG5cbiAgICBhdG9tLXRleHQtZWRpdG9yIGF0b20tdGV4dC1lZGl0b3ItbWluaW1hcDo6c2hhZG93IC5taW5pbWFwLXZpc2libGUtYXJlYSwgYXRvbS10ZXh0LWVkaXRvcjo6c2hhZG93IGF0b20tdGV4dC1lZGl0b3ItbWluaW1hcDo6c2hhZG93IC5taW5pbWFwLXZpc2libGUtYXJlYSB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsMjU1LDAsMC4zKVxuICAgICAgb3BhY2l0eTogMVxuICAgIH1cblxuICAgIGF0b20tdGV4dC1lZGl0b3I6OnNoYWRvdyBhdG9tLXRleHQtZWRpdG9yLW1pbmltYXA6OnNoYWRvdyAub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzIHtcbiAgICAgIG9wYWNpdHk6IDEgIWltcG9ydGFudFxuICAgIH1cbiAgYFxuXG4gIGphc21pbmVDb250ZW50LmFwcGVuZENoaWxkKHN0eWxlTm9kZSlcbn0pXG4iXX0=
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/minimap/spec/helpers/workspace.js
