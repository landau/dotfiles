(function() {
  var Settings, inferType;

  inferType = function(value) {
    switch (false) {
      case !Number.isInteger(value):
        return 'integer';
      case typeof value !== 'boolean':
        return 'boolean';
      case typeof value !== 'string':
        return 'string';
      case !Array.isArray(value):
        return 'array';
    }
  };

  Settings = (function() {
    function Settings(scope, config) {
      var i, j, k, key, len, len1, name, ref, ref1, value;
      this.scope = scope;
      this.config = config;
      ref = Object.keys(this.config);
      for (j = 0, len = ref.length; j < len; j++) {
        key = ref[j];
        if (typeof this.config[key] === 'boolean') {
          this.config[key] = {
            "default": this.config[key]
          };
        }
        if ((value = this.config[key]).type == null) {
          value.type = inferType(value["default"]);
        }
      }
      ref1 = Object.keys(this.config);
      for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
        name = ref1[i];
        this.config[name].order = i;
      }
    }

    Settings.prototype.get = function(param) {
      if (param === 'defaultRegister') {
        if (this.get('useClipboardAsDefaultRegister')) {
          return '*';
        } else {
          return '"';
        }
      } else {
        return atom.config.get(this.scope + "." + param);
      }
    };

    Settings.prototype.set = function(param, value) {
      return atom.config.set(this.scope + "." + param, value);
    };

    Settings.prototype.toggle = function(param) {
      return this.set(param, !this.get(param));
    };

    Settings.prototype.observe = function(param, fn) {
      return atom.config.observe(this.scope + "." + param, fn);
    };

    return Settings;

  })();

  module.exports = new Settings('vim-mode-plus', {
    setCursorToStartOfChangeOnUndoRedo: true,
    setCursorToStartOfChangeOnUndoRedoStrategy: {
      "default": 'smart',
      "enum": ['smart', 'simple'],
      description: "When you think undo/redo cursor position has BUG, set this to `simple`.<br>\n`smart`: Good accuracy but have cursor-not-updated-on-different-editor limitation<br>\n`simple`: Always work, but accuracy is not as good as `smart`.<br>"
    },
    groupChangesWhenLeavingInsertMode: true,
    useClipboardAsDefaultRegister: false,
    startInInsertMode: false,
    startInInsertModeScopes: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'Start in insert-mode when editorElement matches scope'
    },
    clearMultipleCursorsOnEscapeInsertMode: false,
    autoSelectPersistentSelectionOnOperate: true,
    automaticallyEscapeInsertModeOnActivePaneItemChange: {
      "default": false,
      description: 'Escape insert-mode on tab switch, pane switch'
    },
    wrapLeftRightMotion: false,
    numberRegex: {
      "default": '-?[0-9]+',
      description: "Used to find number in ctrl-a/ctrl-x.<br>\nTo ignore \"-\"(minus) char in string like \"identifier-1\" use `(?:\\B-)?[0-9]+`"
    },
    clearHighlightSearchOnResetNormalMode: {
      "default": false,
      description: 'Clear highlightSearch on `escape` in normal-mode'
    },
    clearPersistentSelectionOnResetNormalMode: {
      "default": false,
      description: 'Clear persistentSelection on `escape` in normal-mode'
    },
    charactersToAddSpaceOnSurround: {
      "default": [],
      items: {
        type: 'string'
      },
      description: "Comma separated list of character, which add space around surrounded text.<br>\nFor vim-surround compatible behavior, set `(, {, [, <`."
    },
    showCursorInVisualMode: true,
    ignoreCaseForSearch: {
      "default": false,
      description: 'For `/` and `?`'
    },
    useSmartcaseForSearch: {
      "default": false,
      description: 'For `/` and `?`. Override `ignoreCaseForSearch`'
    },
    ignoreCaseForSearchCurrentWord: {
      "default": false,
      description: 'For `*` and `#`.'
    },
    useSmartcaseForSearchCurrentWord: {
      "default": false,
      description: 'For `*` and `#`. Override `ignoreCaseForSearchCurrentWord`'
    },
    highlightSearch: false,
    highlightSearchExcludeScopes: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'Suppress highlightSearch when any of these classes are present in the editor'
    },
    incrementalSearch: false,
    incrementalSearchVisitDirection: {
      "default": 'absolute',
      "enum": ['absolute', 'relative'],
      description: "When `relative`, `tab`, and `shift-tab` respect search direction('/' or '?')"
    },
    stayOnTransformString: {
      "default": false,
      description: "Don't move cursor after TransformString e.g upper-case, surround"
    },
    stayOnYank: {
      "default": false,
      description: "Don't move cursor after yank"
    },
    stayOnDelete: {
      "default": false,
      description: "Don't move cursor after delete"
    },
    stayOnOccurrence: {
      "default": true,
      description: "Don't move cursor when operator works on occurrences( when `true`, override operator specific `stayOn` options )"
    },
    keepColumnOnSelectTextObject: {
      "default": false,
      description: "Keep column on select TextObject(Paragraph, Indentation, Fold, Function, Edge)"
    },
    moveToFirstCharacterOnVerticalMotion: {
      "default": true,
      description: "Almost equivalent to `startofline` pure-Vim option. When true, move cursor to first char.<br>\nAffects to `ctrl-f, b, d, u`, `G`, `H`, `M`, `L`, `gg`<br>\nUnlike pure-Vim, `d`, `<<`, `>>` are not affected by this option, use independent `stayOn` options."
    },
    flashOnUndoRedo: true,
    flashOnMoveToOccurrence: {
      "default": false,
      description: "Affects normal-mode's `tab`, `shift-tab`."
    },
    flashOnOperate: true,
    flashOnOperateBlacklist: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'Comma separated list of operator class name to disable flash e.g. "yank, auto-indent"'
    },
    flashOnSearch: true,
    flashScreenOnSearchHasNoMatch: true,
    showHoverSearchCounter: false,
    showHoverSearchCounterDuration: {
      "default": 700,
      description: "Duration(msec) for hover search counter"
    },
    hideTabBarOnMaximizePane: {
      "default": true,
      description: "If set to `false`, tab still visible after maximize-pane( `cmd-enter` )"
    },
    hideStatusBarOnMaximizePane: {
      "default": true
    },
    smoothScrollOnFullScrollMotion: {
      "default": false,
      description: "For `ctrl-f` and `ctrl-b`"
    },
    smoothScrollOnFullScrollMotionDuration: {
      "default": 500,
      description: "Smooth scroll duration in milliseconds for `ctrl-f` and `ctrl-b`"
    },
    smoothScrollOnHalfScrollMotion: {
      "default": false,
      description: "For `ctrl-d` and `ctrl-u`"
    },
    smoothScrollOnHalfScrollMotionDuration: {
      "default": 500,
      description: "Smooth scroll duration in milliseconds for `ctrl-d` and `ctrl-u`"
    },
    statusBarModeStringStyle: {
      "default": 'short',
      "enum": ['short', 'long']
    },
    devThrowErrorOnNonEmptySelectionInNormalMode: {
      "default": false,
      description: "[Dev use] Throw error when non-empty selection was remained in normal-mode at the timing of operation finished"
    },
    debug: {
      "default": false
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxTQUFBLEdBQVksU0FBQyxLQUFEO0FBQ1YsWUFBQSxLQUFBO0FBQUEsWUFDTyxNQUFNLENBQUMsU0FBUCxDQUFpQixLQUFqQixDQURQO2VBQ29DO0FBRHBDLFdBRU8sT0FBTyxLQUFQLEtBQWlCLFNBRnhCO2VBRXVDO0FBRnZDLFdBR08sT0FBTyxLQUFQLEtBQWlCLFFBSHhCO2VBR3NDO0FBSHRDLFlBSU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFkLENBSlA7ZUFJaUM7QUFKakM7RUFEVTs7RUFPTjtJQUNTLGtCQUFDLEtBQUQsRUFBUyxNQUFUO0FBSVgsVUFBQTtNQUpZLElBQUMsQ0FBQSxRQUFEO01BQVEsSUFBQyxDQUFBLFNBQUQ7QUFJcEI7QUFBQSxXQUFBLHFDQUFBOztRQUNFLElBQUcsT0FBTyxJQUFDLENBQUEsTUFBTyxDQUFBLEdBQUEsQ0FBZixLQUF3QixTQUEzQjtVQUNFLElBQUMsQ0FBQSxNQUFPLENBQUEsR0FBQSxDQUFSLEdBQWU7WUFBQyxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBQUMsQ0FBQSxNQUFPLENBQUEsR0FBQSxDQUFsQjtZQURqQjs7UUFFQSxJQUFPLHVDQUFQO1VBQ0UsS0FBSyxDQUFDLElBQU4sR0FBYSxTQUFBLENBQVUsS0FBSyxFQUFDLE9BQUQsRUFBZixFQURmOztBQUhGO0FBT0E7QUFBQSxXQUFBLGdEQUFBOztRQUNFLElBQUMsQ0FBQSxNQUFPLENBQUEsSUFBQSxDQUFLLENBQUMsS0FBZCxHQUFzQjtBQUR4QjtJQVhXOzt1QkFjYixHQUFBLEdBQUssU0FBQyxLQUFEO01BQ0gsSUFBRyxLQUFBLEtBQVMsaUJBQVo7UUFDRSxJQUFHLElBQUMsQ0FBQSxHQUFELENBQUssK0JBQUwsQ0FBSDtpQkFBOEMsSUFBOUM7U0FBQSxNQUFBO2lCQUF1RCxJQUF2RDtTQURGO09BQUEsTUFBQTtlQUdFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFtQixJQUFDLENBQUEsS0FBRixHQUFRLEdBQVIsR0FBVyxLQUE3QixFQUhGOztJQURHOzt1QkFNTCxHQUFBLEdBQUssU0FBQyxLQUFELEVBQVEsS0FBUjthQUNILElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFtQixJQUFDLENBQUEsS0FBRixHQUFRLEdBQVIsR0FBVyxLQUE3QixFQUFzQyxLQUF0QztJQURHOzt1QkFHTCxNQUFBLEdBQVEsU0FBQyxLQUFEO2FBQ04sSUFBQyxDQUFBLEdBQUQsQ0FBSyxLQUFMLEVBQVksQ0FBSSxJQUFDLENBQUEsR0FBRCxDQUFLLEtBQUwsQ0FBaEI7SUFETTs7dUJBR1IsT0FBQSxHQUFTLFNBQUMsS0FBRCxFQUFRLEVBQVI7YUFDUCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBdUIsSUFBQyxDQUFBLEtBQUYsR0FBUSxHQUFSLEdBQVcsS0FBakMsRUFBMEMsRUFBMUM7SUFETzs7Ozs7O0VBR1gsTUFBTSxDQUFDLE9BQVAsR0FBcUIsSUFBQSxRQUFBLENBQVMsZUFBVCxFQUNuQjtJQUFBLGtDQUFBLEVBQW9DLElBQXBDO0lBQ0EsMENBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FBVDtNQUNBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsUUFBVixDQUROO01BRUEsV0FBQSxFQUFhLHdPQUZiO0tBRkY7SUFTQSxpQ0FBQSxFQUFtQyxJQVRuQztJQVVBLDZCQUFBLEVBQStCLEtBVi9CO0lBV0EsaUJBQUEsRUFBbUIsS0FYbkI7SUFZQSx1QkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUFUO01BQ0EsS0FBQSxFQUFPO1FBQUEsSUFBQSxFQUFNLFFBQU47T0FEUDtNQUVBLFdBQUEsRUFBYSx1REFGYjtLQWJGO0lBZ0JBLHNDQUFBLEVBQXdDLEtBaEJ4QztJQWlCQSxzQ0FBQSxFQUF3QyxJQWpCeEM7SUFrQkEsbURBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSwrQ0FEYjtLQW5CRjtJQXFCQSxtQkFBQSxFQUFxQixLQXJCckI7SUFzQkEsV0FBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxVQUFUO01BQ0EsV0FBQSxFQUFhLDhIQURiO0tBdkJGO0lBNEJBLHFDQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7TUFDQSxXQUFBLEVBQWEsa0RBRGI7S0E3QkY7SUErQkEseUNBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSxzREFEYjtLQWhDRjtJQWtDQSw4QkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUFUO01BQ0EsS0FBQSxFQUFPO1FBQUEsSUFBQSxFQUFNLFFBQU47T0FEUDtNQUVBLFdBQUEsRUFBYSx5SUFGYjtLQW5DRjtJQXlDQSxzQkFBQSxFQUF3QixJQXpDeEI7SUEwQ0EsbUJBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSxpQkFEYjtLQTNDRjtJQTZDQSxxQkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO01BQ0EsV0FBQSxFQUFhLGlEQURiO0tBOUNGO0lBZ0RBLDhCQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7TUFDQSxXQUFBLEVBQWEsa0JBRGI7S0FqREY7SUFtREEsZ0NBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSw0REFEYjtLQXBERjtJQXNEQSxlQUFBLEVBQWlCLEtBdERqQjtJQXVEQSw0QkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUFUO01BQ0EsS0FBQSxFQUFPO1FBQUEsSUFBQSxFQUFNLFFBQU47T0FEUDtNQUVBLFdBQUEsRUFBYSw4RUFGYjtLQXhERjtJQTJEQSxpQkFBQSxFQUFtQixLQTNEbkI7SUE0REEsK0JBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsVUFBVDtNQUNBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxVQUFELEVBQWEsVUFBYixDQUROO01BRUEsV0FBQSxFQUFhLDhFQUZiO0tBN0RGO0lBZ0VBLHFCQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7TUFDQSxXQUFBLEVBQWEsa0VBRGI7S0FqRUY7SUFtRUEsVUFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO01BQ0EsV0FBQSxFQUFhLDhCQURiO0tBcEVGO0lBc0VBLFlBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSxnQ0FEYjtLQXZFRjtJQXlFQSxnQkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUFUO01BQ0EsV0FBQSxFQUFhLGtIQURiO0tBMUVGO0lBNEVBLDRCQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7TUFDQSxXQUFBLEVBQWEsZ0ZBRGI7S0E3RUY7SUErRUEsb0NBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFBVDtNQUNBLFdBQUEsRUFBYSxnUUFEYjtLQWhGRjtJQXNGQSxlQUFBLEVBQWlCLElBdEZqQjtJQXVGQSx1QkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO01BQ0EsV0FBQSxFQUFhLDJDQURiO0tBeEZGO0lBMEZBLGNBQUEsRUFBZ0IsSUExRmhCO0lBMkZBLHVCQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBQVQ7TUFDQSxLQUFBLEVBQU87UUFBQSxJQUFBLEVBQU0sUUFBTjtPQURQO01BRUEsV0FBQSxFQUFhLHVGQUZiO0tBNUZGO0lBK0ZBLGFBQUEsRUFBZSxJQS9GZjtJQWdHQSw2QkFBQSxFQUErQixJQWhHL0I7SUFpR0Esc0JBQUEsRUFBd0IsS0FqR3hCO0lBa0dBLDhCQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEdBQVQ7TUFDQSxXQUFBLEVBQWEseUNBRGI7S0FuR0Y7SUFxR0Esd0JBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFBVDtNQUNBLFdBQUEsRUFBYSx5RUFEYjtLQXRHRjtJQXdHQSwyQkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUFUO0tBekdGO0lBMEdBLDhCQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7TUFDQSxXQUFBLEVBQWEsMkJBRGI7S0EzR0Y7SUE2R0Esc0NBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsR0FBVDtNQUNBLFdBQUEsRUFBYSxrRUFEYjtLQTlHRjtJQWdIQSw4QkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO01BQ0EsV0FBQSxFQUFhLDJCQURiO0tBakhGO0lBbUhBLHNDQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEdBQVQ7TUFDQSxXQUFBLEVBQWEsa0VBRGI7S0FwSEY7SUFzSEEsd0JBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FBVDtNQUNBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsTUFBVixDQUROO0tBdkhGO0lBeUhBLDRDQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7TUFDQSxXQUFBLEVBQWEsZ0hBRGI7S0ExSEY7SUE0SEEsS0FBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO0tBN0hGO0dBRG1CO0FBckNyQiIsInNvdXJjZXNDb250ZW50IjpbImluZmVyVHlwZSA9ICh2YWx1ZSkgLT5cbiAgc3dpdGNoXG4gICAgd2hlbiBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSB0aGVuICdpbnRlZ2VyJ1xuICAgIHdoZW4gdHlwZW9mKHZhbHVlKSBpcyAnYm9vbGVhbicgdGhlbiAnYm9vbGVhbidcbiAgICB3aGVuIHR5cGVvZih2YWx1ZSkgaXMgJ3N0cmluZycgdGhlbiAnc3RyaW5nJ1xuICAgIHdoZW4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgdGhlbiAnYXJyYXknXG5cbmNsYXNzIFNldHRpbmdzXG4gIGNvbnN0cnVjdG9yOiAoQHNjb3BlLCBAY29uZmlnKSAtPlxuICAgICMgQXV0b21hdGljYWxseSBpbmZlciBhbmQgaW5qZWN0IGB0eXBlYCBvZiBlYWNoIGNvbmZpZyBwYXJhbWV0ZXIuXG4gICAgIyBza2lwIGlmIHZhbHVlIHdoaWNoIGFsZWFkeSBoYXZlIGB0eXBlYCBmaWVsZC5cbiAgICAjIEFsc28gdHJhbnNsYXRlIGJhcmUgYGJvb2xlYW5gIHZhbHVlIHRvIHtkZWZhdWx0OiBgYm9vbGVhbmB9IG9iamVjdFxuICAgIGZvciBrZXkgaW4gT2JqZWN0LmtleXMoQGNvbmZpZylcbiAgICAgIGlmIHR5cGVvZihAY29uZmlnW2tleV0pIGlzICdib29sZWFuJ1xuICAgICAgICBAY29uZmlnW2tleV0gPSB7ZGVmYXVsdDogQGNvbmZpZ1trZXldfVxuICAgICAgdW5sZXNzICh2YWx1ZSA9IEBjb25maWdba2V5XSkudHlwZT9cbiAgICAgICAgdmFsdWUudHlwZSA9IGluZmVyVHlwZSh2YWx1ZS5kZWZhdWx0KVxuXG4gICAgIyBbQ0FVVElPTl0gaW5qZWN0aW5nIG9yZGVyIHByb3BldHkgdG8gc2V0IG9yZGVyIHNob3duIGF0IHNldHRpbmctdmlldyBNVVNULUNPTUUtTEFTVC5cbiAgICBmb3IgbmFtZSwgaSBpbiBPYmplY3Qua2V5cyhAY29uZmlnKVxuICAgICAgQGNvbmZpZ1tuYW1lXS5vcmRlciA9IGlcblxuICBnZXQ6IChwYXJhbSkgLT5cbiAgICBpZiBwYXJhbSBpcyAnZGVmYXVsdFJlZ2lzdGVyJ1xuICAgICAgaWYgQGdldCgndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInKSB0aGVuICcqJyBlbHNlICdcIidcbiAgICBlbHNlXG4gICAgICBhdG9tLmNvbmZpZy5nZXQgXCIje0BzY29wZX0uI3twYXJhbX1cIlxuXG4gIHNldDogKHBhcmFtLCB2YWx1ZSkgLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQgXCIje0BzY29wZX0uI3twYXJhbX1cIiwgdmFsdWVcblxuICB0b2dnbGU6IChwYXJhbSkgLT5cbiAgICBAc2V0KHBhcmFtLCBub3QgQGdldChwYXJhbSkpXG5cbiAgb2JzZXJ2ZTogKHBhcmFtLCBmbikgLT5cbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlIFwiI3tAc2NvcGV9LiN7cGFyYW19XCIsIGZuXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzICd2aW0tbW9kZS1wbHVzJyxcbiAgc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkbzogdHJ1ZVxuICBzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvU3RyYXRlZ3k6XG4gICAgZGVmYXVsdDogJ3NtYXJ0J1xuICAgIGVudW06IFsnc21hcnQnLCAnc2ltcGxlJ11cbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgV2hlbiB5b3UgdGhpbmsgdW5kby9yZWRvIGN1cnNvciBwb3NpdGlvbiBoYXMgQlVHLCBzZXQgdGhpcyB0byBgc2ltcGxlYC48YnI+XG4gICAgYHNtYXJ0YDogR29vZCBhY2N1cmFjeSBidXQgaGF2ZSBjdXJzb3Itbm90LXVwZGF0ZWQtb24tZGlmZmVyZW50LWVkaXRvciBsaW1pdGF0aW9uPGJyPlxuICAgIGBzaW1wbGVgOiBBbHdheXMgd29yaywgYnV0IGFjY3VyYWN5IGlzIG5vdCBhcyBnb29kIGFzIGBzbWFydGAuPGJyPlxuICAgIFwiXCJcIlxuICBncm91cENoYW5nZXNXaGVuTGVhdmluZ0luc2VydE1vZGU6IHRydWVcbiAgdXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXI6IGZhbHNlXG4gIHN0YXJ0SW5JbnNlcnRNb2RlOiBmYWxzZVxuICBzdGFydEluSW5zZXJ0TW9kZVNjb3BlczpcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOiB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiAnU3RhcnQgaW4gaW5zZXJ0LW1vZGUgd2hlbiBlZGl0b3JFbGVtZW50IG1hdGNoZXMgc2NvcGUnXG4gIGNsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlOiBmYWxzZVxuICBhdXRvU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbk9uT3BlcmF0ZTogdHJ1ZVxuICBhdXRvbWF0aWNhbGx5RXNjYXBlSW5zZXJ0TW9kZU9uQWN0aXZlUGFuZUl0ZW1DaGFuZ2U6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0VzY2FwZSBpbnNlcnQtbW9kZSBvbiB0YWIgc3dpdGNoLCBwYW5lIHN3aXRjaCdcbiAgd3JhcExlZnRSaWdodE1vdGlvbjogZmFsc2VcbiAgbnVtYmVyUmVnZXg6XG4gICAgZGVmYXVsdDogJy0/WzAtOV0rJ1xuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICAgIFVzZWQgdG8gZmluZCBudW1iZXIgaW4gY3RybC1hL2N0cmwteC48YnI+XG4gICAgICBUbyBpZ25vcmUgXCItXCIobWludXMpIGNoYXIgaW4gc3RyaW5nIGxpa2UgXCJpZGVudGlmaWVyLTFcIiB1c2UgYCg/OlxcXFxCLSk/WzAtOV0rYFxuICAgICAgXCJcIlwiXG4gIGNsZWFySGlnaGxpZ2h0U2VhcmNoT25SZXNldE5vcm1hbE1vZGU6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0NsZWFyIGhpZ2hsaWdodFNlYXJjaCBvbiBgZXNjYXBlYCBpbiBub3JtYWwtbW9kZSdcbiAgY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uT25SZXNldE5vcm1hbE1vZGU6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0NsZWFyIHBlcnNpc3RlbnRTZWxlY3Rpb24gb24gYGVzY2FwZWAgaW4gbm9ybWFsLW1vZGUnXG4gIGNoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZDpcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOiB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICAgIENvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIGNoYXJhY3Rlciwgd2hpY2ggYWRkIHNwYWNlIGFyb3VuZCBzdXJyb3VuZGVkIHRleHQuPGJyPlxuICAgICAgRm9yIHZpbS1zdXJyb3VuZCBjb21wYXRpYmxlIGJlaGF2aW9yLCBzZXQgYCgsIHssIFssIDxgLlxuICAgICAgXCJcIlwiXG4gIHNob3dDdXJzb3JJblZpc3VhbE1vZGU6IHRydWVcbiAgaWdub3JlQ2FzZUZvclNlYXJjaDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAvYCBhbmQgYD9gJ1xuICB1c2VTbWFydGNhc2VGb3JTZWFyY2g6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0ZvciBgL2AgYW5kIGA/YC4gT3ZlcnJpZGUgYGlnbm9yZUNhc2VGb3JTZWFyY2hgJ1xuICBpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQ6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0ZvciBgKmAgYW5kIGAjYC4nXG4gIHVzZVNtYXJ0Y2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdGb3IgYCpgIGFuZCBgI2AuIE92ZXJyaWRlIGBpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmRgJ1xuICBoaWdobGlnaHRTZWFyY2g6IGZhbHNlXG4gIGhpZ2hsaWdodFNlYXJjaEV4Y2x1ZGVTY29wZXM6XG4gICAgZGVmYXVsdDogW11cbiAgICBpdGVtczogdHlwZTogJ3N0cmluZydcbiAgICBkZXNjcmlwdGlvbjogJ1N1cHByZXNzIGhpZ2hsaWdodFNlYXJjaCB3aGVuIGFueSBvZiB0aGVzZSBjbGFzc2VzIGFyZSBwcmVzZW50IGluIHRoZSBlZGl0b3InXG4gIGluY3JlbWVudGFsU2VhcmNoOiBmYWxzZVxuICBpbmNyZW1lbnRhbFNlYXJjaFZpc2l0RGlyZWN0aW9uOlxuICAgIGRlZmF1bHQ6ICdhYnNvbHV0ZSdcbiAgICBlbnVtOiBbJ2Fic29sdXRlJywgJ3JlbGF0aXZlJ11cbiAgICBkZXNjcmlwdGlvbjogXCJXaGVuIGByZWxhdGl2ZWAsIGB0YWJgLCBhbmQgYHNoaWZ0LXRhYmAgcmVzcGVjdCBzZWFyY2ggZGlyZWN0aW9uKCcvJyBvciAnPycpXCJcbiAgc3RheU9uVHJhbnNmb3JtU3RyaW5nOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRG9uJ3QgbW92ZSBjdXJzb3IgYWZ0ZXIgVHJhbnNmb3JtU3RyaW5nIGUuZyB1cHBlci1jYXNlLCBzdXJyb3VuZFwiXG4gIHN0YXlPbllhbms6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBtb3ZlIGN1cnNvciBhZnRlciB5YW5rXCJcbiAgc3RheU9uRGVsZXRlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRG9uJ3QgbW92ZSBjdXJzb3IgYWZ0ZXIgZGVsZXRlXCJcbiAgc3RheU9uT2NjdXJyZW5jZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246IFwiRG9uJ3QgbW92ZSBjdXJzb3Igd2hlbiBvcGVyYXRvciB3b3JrcyBvbiBvY2N1cnJlbmNlcyggd2hlbiBgdHJ1ZWAsIG92ZXJyaWRlIG9wZXJhdG9yIHNwZWNpZmljIGBzdGF5T25gIG9wdGlvbnMgKVwiXG4gIGtlZXBDb2x1bW5PblNlbGVjdFRleHRPYmplY3Q6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJLZWVwIGNvbHVtbiBvbiBzZWxlY3QgVGV4dE9iamVjdChQYXJhZ3JhcGgsIEluZGVudGF0aW9uLCBGb2xkLCBGdW5jdGlvbiwgRWRnZSlcIlxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9uVmVydGljYWxNb3Rpb246XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICAgIEFsbW9zdCBlcXVpdmFsZW50IHRvIGBzdGFydG9mbGluZWAgcHVyZS1WaW0gb3B0aW9uLiBXaGVuIHRydWUsIG1vdmUgY3Vyc29yIHRvIGZpcnN0IGNoYXIuPGJyPlxuICAgICAgQWZmZWN0cyB0byBgY3RybC1mLCBiLCBkLCB1YCwgYEdgLCBgSGAsIGBNYCwgYExgLCBgZ2dgPGJyPlxuICAgICAgVW5saWtlIHB1cmUtVmltLCBgZGAsIGA8PGAsIGA+PmAgYXJlIG5vdCBhZmZlY3RlZCBieSB0aGlzIG9wdGlvbiwgdXNlIGluZGVwZW5kZW50IGBzdGF5T25gIG9wdGlvbnMuXG4gICAgICBcIlwiXCJcbiAgZmxhc2hPblVuZG9SZWRvOiB0cnVlXG4gIGZsYXNoT25Nb3ZlVG9PY2N1cnJlbmNlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiQWZmZWN0cyBub3JtYWwtbW9kZSdzIGB0YWJgLCBgc2hpZnQtdGFiYC5cIlxuICBmbGFzaE9uT3BlcmF0ZTogdHJ1ZVxuICBmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdDpcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOiB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiAnQ29tbWEgc2VwYXJhdGVkIGxpc3Qgb2Ygb3BlcmF0b3IgY2xhc3MgbmFtZSB0byBkaXNhYmxlIGZsYXNoIGUuZy4gXCJ5YW5rLCBhdXRvLWluZGVudFwiJ1xuICBmbGFzaE9uU2VhcmNoOiB0cnVlXG4gIGZsYXNoU2NyZWVuT25TZWFyY2hIYXNOb01hdGNoOiB0cnVlXG4gIHNob3dIb3ZlclNlYXJjaENvdW50ZXI6IGZhbHNlXG4gIHNob3dIb3ZlclNlYXJjaENvdW50ZXJEdXJhdGlvbjpcbiAgICBkZWZhdWx0OiA3MDBcbiAgICBkZXNjcmlwdGlvbjogXCJEdXJhdGlvbihtc2VjKSBmb3IgaG92ZXIgc2VhcmNoIGNvdW50ZXJcIlxuICBoaWRlVGFiQmFyT25NYXhpbWl6ZVBhbmU6XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiBcIklmIHNldCB0byBgZmFsc2VgLCB0YWIgc3RpbGwgdmlzaWJsZSBhZnRlciBtYXhpbWl6ZS1wYW5lKCBgY21kLWVudGVyYCApXCJcbiAgaGlkZVN0YXR1c0Jhck9uTWF4aW1pemVQYW5lOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgc21vb3RoU2Nyb2xsT25GdWxsU2Nyb2xsTW90aW9uOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRm9yIGBjdHJsLWZgIGFuZCBgY3RybC1iYFwiXG4gIHNtb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvbkR1cmF0aW9uOlxuICAgIGRlZmF1bHQ6IDUwMFxuICAgIGRlc2NyaXB0aW9uOiBcIlNtb290aCBzY3JvbGwgZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIGZvciBgY3RybC1mYCBhbmQgYGN0cmwtYmBcIlxuICBzbW9vdGhTY3JvbGxPbkhhbGZTY3JvbGxNb3Rpb246XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJGb3IgYGN0cmwtZGAgYW5kIGBjdHJsLXVgXCJcbiAgc21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uRHVyYXRpb246XG4gICAgZGVmYXVsdDogNTAwXG4gICAgZGVzY3JpcHRpb246IFwiU21vb3RoIHNjcm9sbCBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgZm9yIGBjdHJsLWRgIGFuZCBgY3RybC11YFwiXG4gIHN0YXR1c0Jhck1vZGVTdHJpbmdTdHlsZTpcbiAgICBkZWZhdWx0OiAnc2hvcnQnXG4gICAgZW51bTogWydzaG9ydCcsICdsb25nJ11cbiAgZGV2VGhyb3dFcnJvck9uTm9uRW1wdHlTZWxlY3Rpb25Jbk5vcm1hbE1vZGU6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJbRGV2IHVzZV0gVGhyb3cgZXJyb3Igd2hlbiBub24tZW1wdHkgc2VsZWN0aW9uIHdhcyByZW1haW5lZCBpbiBub3JtYWwtbW9kZSBhdCB0aGUgdGltaW5nIG9mIG9wZXJhdGlvbiBmaW5pc2hlZFwiXG4gIGRlYnVnOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4iXX0=
