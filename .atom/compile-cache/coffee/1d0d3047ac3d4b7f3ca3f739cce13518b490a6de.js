(function() {
  var CompositeDisposable, Disposable, GlobalVimState, StatusBarManager, VimState, settings, _ref;

  _ref = require('event-kit'), Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  StatusBarManager = require('./status-bar-manager');

  GlobalVimState = require('./global-vim-state');

  VimState = require('./vim-state');

  settings = require('./settings');

  module.exports = {
    config: settings.config,
    activate: function(state) {
      this.disposables = new CompositeDisposable;
      this.globalVimState = new GlobalVimState;
      this.statusBarManager = new StatusBarManager;
      this.vimStates = new Set;
      this.vimStatesByEditor = new WeakMap;
      this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var vimState;
          if (editor.isMini() || _this.getEditorState(editor)) {
            return;
          }
          vimState = new VimState(atom.views.getView(editor), _this.statusBarManager, _this.globalVimState);
          _this.vimStates.add(vimState);
          _this.vimStatesByEditor.set(editor, vimState);
          return vimState.onDidDestroy(function() {
            return _this.vimStates["delete"](vimState);
          });
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidChangeActivePaneItem(this.updateToPaneItem.bind(this)));
      return this.disposables.add(new Disposable((function(_this) {
        return function() {
          return _this.vimStates.forEach(function(vimState) {
            return vimState.destroy();
          });
        };
      })(this)));
    },
    deactivate: function() {
      return this.disposables.dispose();
    },
    getGlobalState: function() {
      return this.globalVimState;
    },
    getEditorState: function(editor) {
      return this.vimStatesByEditor.get(editor);
    },
    consumeStatusBar: function(statusBar) {
      this.statusBarManager.initialize(statusBar);
      this.statusBarManager.attach();
      return this.disposables.add(new Disposable((function(_this) {
        return function() {
          return _this.statusBarManager.detach();
        };
      })(this)));
    },
    updateToPaneItem: function(item) {
      var vimState;
      if (item != null) {
        vimState = this.getEditorState(item);
      }
      if (vimState != null) {
        return vimState.updateStatusBar();
      } else {
        return this.statusBarManager.hide();
      }
    },
    provideVimMode: function() {
      return {
        getGlobalState: this.getGlobalState.bind(this),
        getEditorState: this.getEditorState.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3ZpbS1tb2RlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyRkFBQTs7QUFBQSxFQUFBLE9BQW9DLE9BQUEsQ0FBUSxXQUFSLENBQXBDLEVBQUMsa0JBQUEsVUFBRCxFQUFhLDJCQUFBLG1CQUFiLENBQUE7O0FBQUEsRUFDQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsc0JBQVIsQ0FEbkIsQ0FBQTs7QUFBQSxFQUVBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSLENBRmpCLENBQUE7O0FBQUEsRUFHQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FIWCxDQUFBOztBQUFBLEVBSUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBSlgsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFBUSxRQUFRLENBQUMsTUFBakI7QUFBQSxJQUVBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUFBLENBQUEsbUJBQWYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGNBQUQsR0FBa0IsR0FBQSxDQUFBLGNBRGxCLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixHQUFBLENBQUEsZ0JBRnBCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxTQUFELEdBQWEsR0FBQSxDQUFBLEdBSmIsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLGlCQUFELEdBQXFCLEdBQUEsQ0FBQSxPQUxyQixDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxD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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/vim-mode.coffee
