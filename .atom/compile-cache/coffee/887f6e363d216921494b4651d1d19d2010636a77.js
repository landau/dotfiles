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
        title: 'Only colour when changed',
        description: 'Show different icon colours for modified files only. Requires that project be a Git repository.'
      },
      tabPaneIcon: {
        type: 'boolean',
        "default": true,
        title: 'Show icons in file tabs'
      }
    },
    activate: function(state) {
      var colouredIcons;
      this.disableSetiIcons(true);
      colouredIcons = "file-icons.coloured";
      atom.config.onDidChange(colouredIcons, (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.colour(newValue);
        };
      })(this));
      this.colour(atom.config.get(colouredIcons));
      atom.commands.add('body', 'file-icons:toggle-colours', function(event) {
        return atom.config.set(colouredIcons, !(atom.config.get(colouredIcons)));
      });
      this.observe(true);
      atom.packages.onDidActivateInitialPackages(function() {
        var selector, tab, tabs, _i, _len, _results;
        selector = '.file-icons-tab-pane-icon .tab[data-type="MarkdownPreviewView"]';
        tabs = atom.views.getView(atom.workspace).querySelectorAll(selector);
        _results = [];
        for (_i = 0, _len = tabs.length; _i < _len; _i++) {
          tab = tabs[_i];
          _results.push(tab.itemTitle.removeAttribute("data-path"));
        }
        return _results;
      });
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvZmlsZS1pY29ucy9pbmRleC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsUUFBQTs7QUFBQSxFQUFDLFdBQVksT0FBQSxDQUFRLE1BQVIsRUFBWixRQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLFFBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxJQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsa0NBRmI7T0FERjtBQUFBLE1BSUEsU0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSwrQ0FGYjtPQUxGO0FBQUEsTUFRQSxTQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtBQUFBLFFBRUEsS0FBQSxFQUFPLDBCQUZQO0FBQUEsUUFHQSxXQUFBLEVBQWEsaUdBSGI7T0FURjtBQUFBLE1BYUEsV0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLEtBQUEsRUFBTyx5QkFGUDtPQWRGO0tBREY7QUFBQSxJQW1CQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixVQUFBLGFBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixJQUFsQixDQUFBLENBQUE7QUFBQSxNQUVBLGFBQUEsR0FBZ0IscUJBRmhCLENBQUE7QUFBQSxNQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixhQUF4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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/file-icons/index.coffee
