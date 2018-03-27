(function() {
  var root, setFormFocusEffect, setTabSizing, unsetFormFocusEffect, unsetTabSizing;

  root = document.documentElement;

  module.exports = {
    activate: function(state) {
      atom.config.observe('nord-atom-ui.tabSizing', function(noFullWidth) {
        return setTabSizing(noFullWidth);
      });
      return atom.config.observe('nord-atom-ui.darkerFormFocusEffect', function(noSnowLight) {
        return setFormFocusEffect(noSnowLight);
      });
    },
    deactivate: function() {
      unsetTabSizing();
      return unsetFormFocusEffect();
    }
  };

  setFormFocusEffect = function(noSnowLight) {
    if (noSnowLight) {
      return root.setAttribute('theme-nord-atom-ui-form-focus-effect', "nosnowlight");
    } else {
      return unsetFormFocusEffect();
    }
  };

  setTabSizing = function(noFullWidth) {
    if (noFullWidth) {
      return unsetTabSizing();
    } else {
      return root.setAttribute('theme-nord-atom-ui-tabsizing', "nofullwidth");
    }
  };

  unsetFormFocusEffect = function() {
    return root.removeAttribute('theme-nord-atom-ui-form-focus-effect');
  };

  unsetTabSizing = function() {
    return root.removeAttribute('theme-nord-atom-ui-tabsizing');
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbm9yZC1hdG9tLXVpL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLFFBQVEsQ0FBQzs7RUFFaEIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0Isd0JBQXBCLEVBQThDLFNBQUMsV0FBRDtlQUM1QyxZQUFBLENBQWEsV0FBYjtNQUQ0QyxDQUE5QzthQUVBLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixvQ0FBcEIsRUFBMEQsU0FBQyxXQUFEO2VBQ3hELGtCQUFBLENBQW1CLFdBQW5CO01BRHdELENBQTFEO0lBSFEsQ0FBVjtJQU1BLFVBQUEsRUFBWSxTQUFBO01BQ1YsY0FBQSxDQUFBO2FBQ0Esb0JBQUEsQ0FBQTtJQUZVLENBTlo7OztFQVVGLGtCQUFBLEdBQXFCLFNBQUMsV0FBRDtJQUNuQixJQUFJLFdBQUo7YUFDRSxJQUFJLENBQUMsWUFBTCxDQUFrQixzQ0FBbEIsRUFBMEQsYUFBMUQsRUFERjtLQUFBLE1BQUE7YUFHRSxvQkFBQSxDQUFBLEVBSEY7O0VBRG1COztFQU1yQixZQUFBLEdBQWUsU0FBQyxXQUFEO0lBQ2IsSUFBSSxXQUFKO2FBQ0UsY0FBQSxDQUFBLEVBREY7S0FBQSxNQUFBO2FBR0UsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsOEJBQWxCLEVBQWtELGFBQWxELEVBSEY7O0VBRGE7O0VBTWYsb0JBQUEsR0FBdUIsU0FBQTtXQUNyQixJQUFJLENBQUMsZUFBTCxDQUFxQixzQ0FBckI7RUFEcUI7O0VBR3ZCLGNBQUEsR0FBaUIsU0FBQTtXQUNmLElBQUksQ0FBQyxlQUFMLENBQXFCLDhCQUFyQjtFQURlO0FBNUJqQiIsInNvdXJjZXNDb250ZW50IjpbInJvb3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID1cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICdub3JkLWF0b20tdWkudGFiU2l6aW5nJywgKG5vRnVsbFdpZHRoKSAtPlxuICAgICAgc2V0VGFiU2l6aW5nKG5vRnVsbFdpZHRoKVxuICAgIGF0b20uY29uZmlnLm9ic2VydmUgJ25vcmQtYXRvbS11aS5kYXJrZXJGb3JtRm9jdXNFZmZlY3QnLCAobm9Tbm93TGlnaHQpIC0+XG4gICAgICBzZXRGb3JtRm9jdXNFZmZlY3Qobm9Tbm93TGlnaHQpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICB1bnNldFRhYlNpemluZygpXG4gICAgdW5zZXRGb3JtRm9jdXNFZmZlY3QoKVxuXG5zZXRGb3JtRm9jdXNFZmZlY3QgPSAobm9Tbm93TGlnaHQpIC0+XG4gIGlmIChub1Nub3dMaWdodClcbiAgICByb290LnNldEF0dHJpYnV0ZSgndGhlbWUtbm9yZC1hdG9tLXVpLWZvcm0tZm9jdXMtZWZmZWN0JywgXCJub3Nub3dsaWdodFwiKVxuICBlbHNlXG4gICAgdW5zZXRGb3JtRm9jdXNFZmZlY3QoKVxuXG5zZXRUYWJTaXppbmcgPSAobm9GdWxsV2lkdGgpIC0+XG4gIGlmIChub0Z1bGxXaWR0aClcbiAgICB1bnNldFRhYlNpemluZygpXG4gIGVsc2VcbiAgICByb290LnNldEF0dHJpYnV0ZSgndGhlbWUtbm9yZC1hdG9tLXVpLXRhYnNpemluZycsIFwibm9mdWxsd2lkdGhcIilcblxudW5zZXRGb3JtRm9jdXNFZmZlY3QgPSAtPlxuICByb290LnJlbW92ZUF0dHJpYnV0ZSgndGhlbWUtbm9yZC1hdG9tLXVpLWZvcm0tZm9jdXMtZWZmZWN0JylcblxudW5zZXRUYWJTaXppbmcgPSAtPlxuICByb290LnJlbW92ZUF0dHJpYnV0ZSgndGhlbWUtbm9yZC1hdG9tLXVpLXRhYnNpemluZycpXG4iXX0=
