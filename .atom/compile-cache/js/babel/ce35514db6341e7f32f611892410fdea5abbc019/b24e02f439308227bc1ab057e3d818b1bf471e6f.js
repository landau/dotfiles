Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

var _atom = require('atom');

'use babel';
var config = {
  accentColor: {
    type: 'string',
    'default': 'red',
    'enum': ['red', 'purple', 'blue', 'green'],
    order: 1
  },
  coloredTabs: {
    description: 'Match the active tab\'s background color with the text editor',
    type: 'boolean',
    'default': true,
    order: 2
  }
};

exports.config = config;
var disposable;

function activate() {
  disposable = new _atom.CompositeDisposable(atom.config.observe('dark-flat-ui.accentColor', updateAccentColor), atom.config.observe('dark-flat-ui.coloredTabs', updateTabColor));
}

function deactivate() {
  disposable.dispose();
}

var workspaceView = atom.views.getView(atom.workspace);

function updateAccentColor(accentColor) {
  workspaceView.setAttribute('data-dark-flat-ui-accent-color', accentColor);
}

function updateTabColor(tabColor) {
  workspaceView.setAttribute('data-dark-flat-ui-colored-tabs', tabColor);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2RhcmstZmxhdC11aS9saWIvZGFyay1mbGF0LXVpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztvQkFDb0MsTUFBTTs7QUFEMUMsV0FBVyxDQUFDO0FBR0wsSUFBSSxNQUFNLEdBQUc7QUFDbEIsYUFBVyxFQUFFO0FBQ1gsUUFBSSxFQUFFLFFBQVE7QUFDZCxlQUFTLEtBQUs7QUFDZCxZQUFNLENBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFFO0FBQzFDLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxhQUFXLEVBQUU7QUFDWCxlQUFXLEVBQUUsK0RBQStEO0FBQzVFLFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxJQUFJO0FBQ2IsU0FBSyxFQUFFLENBQUM7R0FDVDtDQUNGLENBQUM7OztBQUVGLElBQUksVUFBVSxDQUFDOztBQUVSLFNBQVMsUUFBUSxHQUFHO0FBQ3pCLFlBQVUsR0FBRyw4QkFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxpQkFBaUIsQ0FBQyxFQUNsRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxjQUFjLENBQUMsQ0FDaEUsQ0FBQztDQUNIOztBQUVNLFNBQVMsVUFBVSxHQUFHO0FBQzNCLFlBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztDQUN0Qjs7QUFFRCxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRXZELFNBQVMsaUJBQWlCLENBQUMsV0FBVyxFQUFFO0FBQ3RDLGVBQWEsQ0FBQyxZQUFZLENBQUMsZ0NBQWdDLEVBQUUsV0FBVyxDQUFDLENBQUM7Q0FDM0U7O0FBRUQsU0FBUyxjQUFjLENBQUMsUUFBUSxFQUFFO0FBQ2hDLGVBQWEsQ0FBQyxZQUFZLENBQUMsZ0NBQWdDLEVBQUUsUUFBUSxDQUFDLENBQUM7Q0FDeEUiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvZGFyay1mbGF0LXVpL2xpYi9kYXJrLWZsYXQtdWkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcblxuZXhwb3J0IHZhciBjb25maWcgPSB7XG4gIGFjY2VudENvbG9yOiB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ3JlZCcsXG4gICAgZW51bTogWyAncmVkJywgJ3B1cnBsZScsICdibHVlJywgJ2dyZWVuJyBdLFxuICAgIG9yZGVyOiAxXG4gIH0sXG4gIGNvbG9yZWRUYWJzOiB7XG4gICAgZGVzY3JpcHRpb246ICdNYXRjaCB0aGUgYWN0aXZlIHRhYlxcJ3MgYmFja2dyb3VuZCBjb2xvciB3aXRoIHRoZSB0ZXh0IGVkaXRvcicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDJcbiAgfVxufTtcblxudmFyIGRpc3Bvc2FibGU7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcbiAgZGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2RhcmstZmxhdC11aS5hY2NlbnRDb2xvcicsIHVwZGF0ZUFjY2VudENvbG9yKSxcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdkYXJrLWZsYXQtdWkuY29sb3JlZFRhYnMnLCB1cGRhdGVUYWJDb2xvcilcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xufVxuXG52YXIgd29ya3NwYWNlVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSk7XG5cbmZ1bmN0aW9uIHVwZGF0ZUFjY2VudENvbG9yKGFjY2VudENvbG9yKSB7XG4gIHdvcmtzcGFjZVZpZXcuc2V0QXR0cmlidXRlKCdkYXRhLWRhcmstZmxhdC11aS1hY2NlbnQtY29sb3InLCBhY2NlbnRDb2xvcik7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVRhYkNvbG9yKHRhYkNvbG9yKSB7XG4gIHdvcmtzcGFjZVZpZXcuc2V0QXR0cmlidXRlKCdkYXRhLWRhcmstZmxhdC11aS1jb2xvcmVkLXRhYnMnLCB0YWJDb2xvcik7XG59XG4iXX0=
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/dark-flat-ui/lib/dark-flat-ui.js
