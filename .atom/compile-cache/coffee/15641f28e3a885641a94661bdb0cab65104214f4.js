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
          var fixAfterLoading, onSave, openedFile, workspace;
          workspace = atom.views.getView(atom.workspace);
          openedFile = editor.getPath();
          fixAfterLoading = function() {
            var onDone;
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
          };
          if (!openedFile) {
            return onSave = editor.onDidSave(function(file) {
              var fixIcon, onTerminate, tab;
              tab = workspace != null ? workspace.querySelector(".tab-bar > .active.tab > .title") : void 0;
              fixIcon = function() {
                var path;
                if (!(tab != null ? tab.dataset.path : void 0)) {
                  path = file.path;
                  tab.dataset.path = path;
                  tab.dataset.name = basename(path);
                  return fixAfterLoading();
                }
              };
              if (tab) {
                fixIcon();
              } else {
                onTerminate = editor.onDidTerminatePendingState(function() {
                  setTimeout((function() {
                    tab = workspace != null ? workspace.querySelector(".tab-bar > .active.tab > .title") : void 0;
                    return fixIcon();
                  }), 10);
                  return onTerminate.dispose();
                });
              }
              return onSave.dispose();
            });
          } else {
            return fixAfterLoading();
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
