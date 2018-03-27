(function() {
  var ContentsByMode, StatusBarManager;

  ContentsByMode = {
    'insert': ["status-bar-vim-mode-insert", "Insert"],
    'insert.replace': ["status-bar-vim-mode-insert", "Replace"],
    'normal': ["status-bar-vim-mode-normal", "Normal"],
    'visual': ["status-bar-vim-mode-visual", "Visual"],
    'visual.characterwise': ["status-bar-vim-mode-visual", "Visual"],
    'visual.linewise': ["status-bar-vim-mode-visual", "Visual Line"],
    'visual.blockwise': ["status-bar-vim-mode-visual", "Visual Block"]
  };

  module.exports = StatusBarManager = (function() {
    function StatusBarManager() {
      this.element = document.createElement("div");
      this.element.id = "status-bar-vim-mode";
      this.container = document.createElement("div");
      this.container.className = "inline-block";
      this.container.appendChild(this.element);
    }

    StatusBarManager.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
    };

    StatusBarManager.prototype.update = function(currentMode, currentSubmode) {
      var klass, newContents, text;
      if (currentSubmode != null) {
        currentMode = currentMode + "." + currentSubmode;
      }
      if (newContents = ContentsByMode[currentMode]) {
        klass = newContents[0], text = newContents[1];
        this.element.className = klass;
        return this.element.textContent = text;
      } else {
        return this.hide();
      }
    };

    StatusBarManager.prototype.hide = function() {
      return this.element.className = 'hidden';
    };

    StatusBarManager.prototype.attach = function() {
      return this.tile = this.statusBar.addRightTile({
        item: this.container,
        priority: 20
      });
    };

    StatusBarManager.prototype.detach = function() {
      return this.tile.destroy();
    };

    return StatusBarManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3N0YXR1cy1iYXItbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0NBQUE7O0FBQUEsRUFBQSxjQUFBLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxDQUFDLDRCQUFELEVBQStCLFFBQS9CLENBQVY7QUFBQSxJQUNBLGdCQUFBLEVBQWtCLENBQUMsNEJBQUQsRUFBK0IsU0FBL0IsQ0FEbEI7QUFBQSxJQUVBLFFBQUEsRUFBVSxDQUFDLDRCQUFELEVBQStCLFFBQS9CLENBRlY7QUFBQSxJQUdBLFFBQUEsRUFBVSxDQUFDLDRCQUFELEVBQStCLFFBQS9CLENBSFY7QUFBQSxJQUlBLHNCQUFBLEVBQXdCLENBQUMsNEJBQUQsRUFBK0IsUUFBL0IsQ0FKeEI7QUFBQSxJQUtBLGlCQUFBLEVBQW1CLENBQUMsNEJBQUQsRUFBK0IsYUFBL0IsQ0FMbkI7QUFBQSxJQU1BLGtCQUFBLEVBQW9CLENBQUMsNEJBQUQsRUFBK0IsY0FBL0IsQ0FOcEI7R0FERixDQUFBOztBQUFBLEVBU0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsMEJBQUEsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxHQUFjLHFCQURkLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxTQUFELEdBQWEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FIYixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVgsR0FBdUIsY0FKdkIsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxXQUFYLENBQXVCLElBQUMsQ0FBQSxPQUF4QixDQUxBLENBRFc7SUFBQSxDQUFiOztBQUFBLCtCQVFBLFVBQUEsR0FBWSxTQUFFLFNBQUYsR0FBQTtBQUFjLE1BQWIsSUFBQyxDQUFBLFlBQUEsU0FBWSxDQUFkO0lBQUEsQ0FSWixDQUFBOztBQUFBLCtCQVVBLE1BQUEsR0FBUSxTQUFDLFdBQUQsRUFBYyxjQUFkLEdBQUE7QUFDTixVQUFBLHdCQUFBO0FBQUEsTUFBQSxJQUFvRCxzQkFBcEQ7QUFBQSxRQUFBLFdBQUEsR0FBYyxXQUFBLEdBQWMsR0FBZCxHQUFvQixjQUFsQyxDQUFBO09BQUE7QUFDQSxNQUFBLElBQUcsV0FBQSxHQUFjLGNBQWUsQ0FBQSxXQUFBLENBQWhDO0FBQ0UsUUFBQyxzQkFBRCxFQUFRLHFCQUFSLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixLQURyQixDQUFBO2VBRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULEdBQXVCLEtBSHpCO09BQUEsTUFBQTtlQUtFLElBQUMsQ0FBQSxJQUFELENBQUEsRUFMRjtPQUZNO0lBQUEsQ0FWUixDQUFBOztBQUFBLCtCQW1CQSxJQUFBLEdBQU0sU0FBQSxHQUFBO2FBQ0osSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCLFNBRGpCO0lBQUEsQ0FuQk4sQ0FBQTs7QUFBQSwrQkF3QkEsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxZQUFYLENBQXdCO0FBQUEsUUFBQSxJQUFBLEVBQU0sSUFBQyxDQUFBLFNBQVA7QUFBQSxRQUFrQixRQUFBLEVBQVUsRUFBNUI7T0FBeEIsRUFERjtJQUFBLENBeEJSLENBQUE7O0FBQUEsK0JBMkJBLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFDTixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQSxFQURNO0lBQUEsQ0EzQlIsQ0FBQTs7NEJBQUE7O01BWEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/status-bar-manager.coffee
