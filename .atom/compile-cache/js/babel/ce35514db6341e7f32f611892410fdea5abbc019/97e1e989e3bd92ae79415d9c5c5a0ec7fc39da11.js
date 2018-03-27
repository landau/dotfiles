Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _generateSnippets = require('./generate-snippets');

var _generateSnippets2 = _interopRequireDefault(_generateSnippets);

var _atom = require('atom');

'use babel';

exports['default'] = {

  modalPanel: null,
  subscriptions: null,

  activate: function activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.config.onDidChange('atom-mocha-snippets', function (value) {
      (0, _generateSnippets2['default'])();
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
    this.atomMochaSnippetsView.destroy();
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2F0b20tbW9jaGEtc25pcHBldHMvbGliL2F0b20tbW9jaGEtc25pcHBldHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O2dDQUU2QixxQkFBcUI7Ozs7b0JBQ2QsTUFBTTs7QUFIMUMsV0FBVyxDQUFDOztxQkFLRzs7QUFFYixZQUFVLEVBQUUsSUFBSTtBQUNoQixlQUFhLEVBQUUsSUFBSTs7QUFFbkIsVUFBUSxFQUFBLGtCQUFDLEtBQUssRUFBRTs7QUFFZCxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFDOztBQUUvQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxVQUFDLEtBQUssRUFBSztBQUMvRSwwQ0FBa0IsQ0FBQztLQUNwQixDQUFDLENBQUMsQ0FBQztHQUNMOztBQUVELFlBQVUsRUFBQSxzQkFBRztBQUNYLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0IsUUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQ3RDO0NBQ0YiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1tb2NoYS1zbmlwcGV0cy9saWIvYXRvbS1tb2NoYS1zbmlwcGV0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgZ2VuZXJhdGVTbmlwcGV0cyBmcm9tICcuL2dlbmVyYXRlLXNuaXBwZXRzJztcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIG1vZGFsUGFuZWw6IG51bGwsXG4gIHN1YnNjcmlwdGlvbnM6IG51bGwsXG5cbiAgYWN0aXZhdGUoc3RhdGUpIHtcbiAgICAvLyBFdmVudHMgc3Vic2NyaWJlZCB0byBpbiBhdG9tJ3Mgc3lzdGVtIGNhbiBiZSBlYXNpbHkgY2xlYW5lZCB1cCB3aXRoIGEgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLW1vY2hhLXNuaXBwZXRzJywgKHZhbHVlKSA9PiB7XG4gICAgICBnZW5lcmF0ZVNuaXBwZXRzKCk7XG4gICAgfSkpO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB0aGlzLmF0b21Nb2NoYVNuaXBwZXRzVmlldy5kZXN0cm95KCk7XG4gIH0sXG59O1xuIl19