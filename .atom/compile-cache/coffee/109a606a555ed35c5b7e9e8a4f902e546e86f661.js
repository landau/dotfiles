(function() {
  var basename;

  basename = require("path").basename;

  module.exports = {
    config: {
      coloured: {
        type: 'boolean',
        "default": true,
        description: 'Untick this for colourless icons'
      },
      forceShow: {
        type: 'boolean',
        "default": false,
        description: 'Force show icons - for themes that hide icons'
      },
      onChanges: {
        type: 'boolean',
        "default": false,
        description: 'Only colour icons when file is modified'
      },
      tabPaneIcon: {
        type: 'boolean',
        "default": true,
        description: 'Show file icons on tab pane'
      }
    },
    activate: function(state) {
      this.disableSetiIcons(true);
      atom.config.onDidChange('file-icons.coloured', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.colour(newValue);
        };
      })(this));
      this.colour(atom.config.get('file-icons.coloured'));
      this.observe(true);
      atom.config.onDidChange('file-icons.forceShow', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.forceShow(newValue);
        };
      })(this));
      this.forceShow(atom.config.get('file-icons.forceShow'));
      atom.config.onDidChange('file-icons.onChanges', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.onChanges(newValue);
        };
      })(this));
      this.onChanges(atom.config.get('file-icons.onChanges'));
      atom.config.onDidChange('file-icons.tabPaneIcon', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.tabPaneIcon(newValue);
        };
      })(this));
      return this.tabPaneIcon(atom.config.get('file-icons.tabPaneIcon'));
    },
    deactivate: function() {
      this.disableSetiIcons(false);
      this.forceShow(false);
      this.onChanges(false);
      this.colour(true);
      this.tabPaneIcon(false);
      return this.observe(false);
    },
    observe: function(enabled) {
      if (enabled) {
        return this.observer = atom.workspace.observeTextEditors(function(editor) {
          var onDone, onSave, openedFile, workspace;
          workspace = atom.views.getView(atom.workspace);
          openedFile = editor.getPath();
          if (!openedFile) {
            return onSave = editor.onDidSave(function(file) {
              var path, tab;
              tab = workspace != null ? workspace.querySelector(".tab-bar > .active.tab > .title") : void 0;
              if (!(tab != null ? tab.dataset.path : void 0)) {
                path = file.path;
                tab.dataset.path = path;
                tab.dataset.name = basename(path);
              }
              return onSave.dispose();
            });
          } else {
            return onDone = editor.onDidStopChanging(function() {
              var fileTabs, tabs;
              tabs = workspace != null ? workspace.querySelectorAll(".pane > .tab-bar > .tab") : void 0;
              fileTabs = [].filter.call(tabs, function(tab) {
                return (tab != null ? tab.item : void 0) === editor;
              });
              editor.onDidChangePath((function(_this) {
                return function(path) {
                  var tab, title, _i, _len, _results;
                  _results = [];
                  for (_i = 0, _len = fileTabs.length; _i < _len; _i++) {
                    tab = fileTabs[_i];
                    title = tab.itemTitle;
                    title.dataset.path = path;
                    _results.push(title.dataset.name = basename(path));
                  }
                  return _results;
                };
              })(this));
              return onDone.dispose();
            });
          }
        });
      } else if (this.observer != null) {
        return this.observer.dispose();
      }
    },
    serialize: function() {},
    colour: function(enable) {
      var body;
      body = document.querySelector('body');
      return body.classList.toggle('file-icons-colourless', !enable);
    },
    forceShow: function(enable) {
      var body;
      body = document.querySelector('body');
      return body.classList.toggle('file-icons-force-show-icons', enable);
    },
    onChanges: function(enable) {
      var body;
      body = document.querySelector('body');
      return body.classList.toggle('file-icons-on-changes', enable);
    },
    tabPaneIcon: function(enable) {
      var body;
      body = document.querySelector('body');
      return body.classList.toggle('file-icons-tab-pane-icon', enable);
    },
    disableSetiIcons: function(disable) {
      var workspaceElement;
      workspaceElement = atom.views.getView(atom.workspace);
      return workspaceElement.classList.toggle('seti-ui-no-icons', disable);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvZmlsZS1pY29ucy9pbmRleC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsUUFBQTs7QUFBQSxFQUFDLFdBQVksT0FBQSxDQUFRLE1BQVIsRUFBWixRQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLFFBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxJQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsa0NBRmI7T0FERjtBQUFBLE1BSUEsU0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSwrQ0FGYjtPQUxGO0FBQUEsTUFRQSxTQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLHlDQUZiO09BVEY7QUFBQSxNQVlBLFdBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxJQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsNkJBRmI7T0FiRjtLQURGO0FBQUEsSUFrQkEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsSUFBbEIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IscUJBQXhCLEVBQStDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUM3QyxjQUFBLGtCQUFBO0FBQUEsVUFE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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/file-icons/index.coffee
