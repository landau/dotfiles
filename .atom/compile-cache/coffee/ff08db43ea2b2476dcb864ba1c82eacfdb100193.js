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
    debug: {
      "default": false,
      description: "[Dev use]"
    },
    strictAssertion: {
      "default": false,
      description: "[Dev use] to catche wired state in vmp-dev, enable this if you want help me"
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxTQUFBLEdBQVksU0FBQyxLQUFEO0FBQ1YsWUFBQSxLQUFBO0FBQUEsWUFDTyxNQUFNLENBQUMsU0FBUCxDQUFpQixLQUFqQixDQURQO2VBQ29DO0FBRHBDLFdBRU8sT0FBTyxLQUFQLEtBQWlCLFNBRnhCO2VBRXVDO0FBRnZDLFdBR08sT0FBTyxLQUFQLEtBQWlCLFFBSHhCO2VBR3NDO0FBSHRDLFlBSU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFkLENBSlA7ZUFJaUM7QUFKakM7RUFEVTs7RUFPTjtJQUNTLGtCQUFDLEtBQUQsRUFBUyxNQUFUO0FBSVgsVUFBQTtNQUpZLElBQUMsQ0FBQSxRQUFEO01BQVEsSUFBQyxDQUFBLFNBQUQ7QUFJcEI7QUFBQSxXQUFBLHFDQUFBOztRQUNFLElBQUcsT0FBTyxJQUFDLENBQUEsTUFBTyxDQUFBLEdBQUEsQ0FBZixLQUF3QixTQUEzQjtVQUNFLElBQUMsQ0FBQSxNQUFPLENBQUEsR0FBQSxDQUFSLEdBQWU7WUFBQyxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBQUMsQ0FBQSxNQUFPLENBQUEsR0FBQSxDQUFsQjtZQURqQjs7UUFFQSxJQUFPLHVDQUFQO1VBQ0UsS0FBSyxDQUFDLElBQU4sR0FBYSxTQUFBLENBQVUsS0FBSyxFQUFDLE9BQUQsRUFBZixFQURmOztBQUhGO0FBT0E7QUFBQSxXQUFBLGdEQUFBOztRQUNFLElBQUMsQ0FBQSxNQUFPLENBQUEsSUFBQSxDQUFLLENBQUMsS0FBZCxHQUFzQjtBQUR4QjtJQVhXOzt1QkFjYixHQUFBLEdBQUssU0FBQyxLQUFEO01BQ0gsSUFBRyxLQUFBLEtBQVMsaUJBQVo7UUFDRSxJQUFHLElBQUMsQ0FBQSxHQUFELENB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L0I7SUFpR0Esc0JBQUEsRUFBd0IsS0FqR3hCO0lBa0dBLDhCQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEdBQVQ7TUFDQSxXQUFBLEVBQWEseUNBRGI7S0FuR0Y7SUFxR0Esd0JBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFBVDtNQUNBLFdBQUEsRUFBYSx5RUFEYjtLQXRHRjtJQXdHQSwyQkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUFUO0tBekdGO0lBMEdBLDhCQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7TUFDQSxXQUFBLEVBQWEsMkJBRGI7S0EzR0Y7SUE2R0Esc0NBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsR0FBVDtNQUNBLFdBQUEsRUFBYSxrRUFEYjtLQTlHRjtJQWdIQSw4QkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO01BQ0EsV0FBQSxFQUFhLDJCQURiO0tBakhGO0lBbUhBLHNDQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEdBQVQ7TUFDQSxXQUFBLEVBQWEsa0VBRGI7S0FwSEY7SUFzSEEsd0JBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FBVDtNQUNBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsTUFBVixDQUROO0tBdkhGO0lBeUhBLEtBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSxXQURiO0tBMUhGO0lBNEhBLGVBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSw2RUFEYjtLQTdIRjtHQURtQjtBQXJDckIiLCJzb3VyY2VzQ29udGVudCI6WyJpbmZlclR5cGUgPSAodmFsdWUpIC0+XG4gIHN3aXRjaFxuICAgIHdoZW4gTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgdGhlbiAnaW50ZWdlcidcbiAgICB3aGVuIHR5cGVvZih2YWx1ZSkgaXMgJ2Jvb2xlYW4nIHRoZW4gJ2Jvb2xlYW4nXG4gICAgd2hlbiB0eXBlb2YodmFsdWUpIGlzICdzdHJpbmcnIHRoZW4gJ3N0cmluZydcbiAgICB3aGVuIEFycmF5LmlzQXJyYXkodmFsdWUpIHRoZW4gJ2FycmF5J1xuXG5jbGFzcyBTZXR0aW5nc1xuICBjb25zdHJ1Y3RvcjogKEBzY29wZSwgQGNvbmZpZykgLT5cbiAgICAjIEF1dG9tYXRpY2FsbHkgaW5mZXIgYW5kIGluamVjdCBgdHlwZWAgb2YgZWFjaCBjb25maWcgcGFyYW1ldGVyLlxuICAgICMgc2tpcCBpZiB2YWx1ZSB3aGljaCBhbGVhZHkgaGF2ZSBgdHlwZWAgZmllbGQuXG4gICAgIyBBbHNvIHRyYW5zbGF0ZSBiYXJlIGBib29sZWFuYCB2YWx1ZSB0byB7ZGVmYXVsdDogYGJvb2xlYW5gfSBvYmplY3RcbiAgICBmb3Iga2V5IGluIE9iamVjdC5rZXlzKEBjb25maWcpXG4gICAgICBpZiB0eXBlb2YoQGNvbmZpZ1trZXldKSBpcyAnYm9vbGVhbidcbiAgICAgICAgQGNvbmZpZ1trZXldID0ge2RlZmF1bHQ6IEBjb25maWdba2V5XX1cbiAgICAgIHVubGVzcyAodmFsdWUgPSBAY29uZmlnW2tleV0pLnR5cGU/XG4gICAgICAgIHZhbHVlLnR5cGUgPSBpbmZlclR5cGUodmFsdWUuZGVmYXVsdClcblxuICAgICMgW0NBVVRJT05dIGluamVjdGluZyBvcmRlciBwcm9wZXR5IHRvIHNldCBvcmRlciBzaG93biBhdCBzZXR0aW5nLXZpZXcgTVVTVC1DT01FLUxBU1QuXG4gICAgZm9yIG5hbWUsIGkgaW4gT2JqZWN0LmtleXMoQGNvbmZpZylcbiAgICAgIEBjb25maWdbbmFtZV0ub3JkZXIgPSBpXG5cbiAgZ2V0OiAocGFyYW0pIC0+XG4gICAgaWYgcGFyYW0gaXMgJ2RlZmF1bHRSZWdpc3RlcidcbiAgICAgIGlmIEBnZXQoJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJykgdGhlbiAnKicgZWxzZSAnXCInXG4gICAgZWxzZVxuICAgICAgYXRvbS5jb25maWcuZ2V0IFwiI3tAc2NvcGV9LiN7cGFyYW19XCJcblxuICBzZXQ6IChwYXJhbSwgdmFsdWUpIC0+XG4gICAgYXRvbS5jb25maWcuc2V0IFwiI3tAc2NvcGV9LiN7cGFyYW19XCIsIHZhbHVlXG5cbiAgdG9nZ2xlOiAocGFyYW0pIC0+XG4gICAgQHNldChwYXJhbSwgbm90IEBnZXQocGFyYW0pKVxuXG4gIG9ic2VydmU6IChwYXJhbSwgZm4pIC0+XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSBcIiN7QHNjb3BlfS4je3BhcmFtfVwiLCBmblxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncyAndmltLW1vZGUtcGx1cycsXG4gIHNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG86IHRydWVcbiAgc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkb1N0cmF0ZWd5OlxuICAgIGRlZmF1bHQ6ICdzbWFydCdcbiAgICBlbnVtOiBbJ3NtYXJ0JywgJ3NpbXBsZSddXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIFdoZW4geW91IHRoaW5rIHVuZG8vcmVkbyBjdXJzb3IgcG9zaXRpb24gaGFzIEJVRywgc2V0IHRoaXMgdG8gYHNpbXBsZWAuPGJyPlxuICAgIGBzbWFydGA6IEdvb2QgYWNjdXJhY3kgYnV0IGhhdmUgY3Vyc29yLW5vdC11cGRhdGVkLW9uLWRpZmZlcmVudC1lZGl0b3IgbGltaXRhdGlvbjxicj5cbiAgICBgc2ltcGxlYDogQWx3YXlzIHdvcmssIGJ1dCBhY2N1cmFjeSBpcyBub3QgYXMgZ29vZCBhcyBgc21hcnRgLjxicj5cbiAgICBcIlwiXCJcbiAgZ3JvdXBDaGFuZ2VzV2hlbkxlYXZpbmdJbnNlcnRNb2RlOiB0cnVlXG4gIHVzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyOiBmYWxzZVxuICBzdGFydEluSW5zZXJ0TW9kZTogZmFsc2VcbiAgc3RhcnRJbkluc2VydE1vZGVTY29wZXM6XG4gICAgZGVmYXVsdDogW11cbiAgICBpdGVtczogdHlwZTogJ3N0cmluZydcbiAgICBkZXNjcmlwdGlvbjogJ1N0YXJ0IGluIGluc2VydC1tb2RlIHdoZW4gZWRpdG9yRWxlbWVudCBtYXRjaGVzIHNjb3BlJ1xuICBjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZTogZmFsc2VcbiAgYXV0b1NlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25Pbk9wZXJhdGU6IHRydWVcbiAgYXV0b21hdGljYWxseUVzY2FwZUluc2VydE1vZGVPbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdFc2NhcGUgaW5zZXJ0LW1vZGUgb24gdGFiIHN3aXRjaCwgcGFuZSBzd2l0Y2gnXG4gIHdyYXBMZWZ0UmlnaHRNb3Rpb246IGZhbHNlXG4gIG51bWJlclJlZ2V4OlxuICAgIGRlZmF1bHQ6ICctP1swLTldKydcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgICBVc2VkIHRvIGZpbmQgbnVtYmVyIGluIGN0cmwtYS9jdHJsLXguPGJyPlxuICAgICAgVG8gaWdub3JlIFwiLVwiKG1pbnVzKSBjaGFyIGluIHN0cmluZyBsaWtlIFwiaWRlbnRpZmllci0xXCIgdXNlIGAoPzpcXFxcQi0pP1swLTldK2BcbiAgICAgIFwiXCJcIlxuICBjbGVhckhpZ2hsaWdodFNlYXJjaE9uUmVzZXROb3JtYWxNb2RlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdDbGVhciBoaWdobGlnaHRTZWFyY2ggb24gYGVzY2FwZWAgaW4gbm9ybWFsLW1vZGUnXG4gIGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbk9uUmVzZXROb3JtYWxNb2RlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdDbGVhciBwZXJzaXN0ZW50U2VsZWN0aW9uIG9uIGBlc2NhcGVgIGluIG5vcm1hbC1tb2RlJ1xuICBjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQ6XG4gICAgZGVmYXVsdDogW11cbiAgICBpdGVtczogdHlwZTogJ3N0cmluZydcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgICBDb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBjaGFyYWN0ZXIsIHdoaWNoIGFkZCBzcGFjZSBhcm91bmQgc3Vycm91bmRlZCB0ZXh0Ljxicj5cbiAgICAgIEZvciB2aW0tc3Vycm91bmQgY29tcGF0aWJsZSBiZWhhdmlvciwgc2V0IGAoLCB7LCBbLCA8YC5cbiAgICAgIFwiXCJcIlxuICBzaG93Q3Vyc29ySW5WaXN1YWxNb2RlOiB0cnVlXG4gIGlnbm9yZUNhc2VGb3JTZWFyY2g6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0ZvciBgL2AgYW5kIGA/YCdcbiAgdXNlU21hcnRjYXNlRm9yU2VhcmNoOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdGb3IgYC9gIGFuZCBgP2AuIE92ZXJyaWRlIGBpZ25vcmVDYXNlRm9yU2VhcmNoYCdcbiAgaWdub3JlQ2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdGb3IgYCpgIGFuZCBgI2AuJ1xuICB1c2VTbWFydGNhc2VGb3JTZWFyY2hDdXJyZW50V29yZDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAqYCBhbmQgYCNgLiBPdmVycmlkZSBgaWdub3JlQ2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkYCdcbiAgaGlnaGxpZ2h0U2VhcmNoOiBmYWxzZVxuICBoaWdobGlnaHRTZWFyY2hFeGNsdWRlU2NvcGVzOlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246ICdTdXBwcmVzcyBoaWdobGlnaHRTZWFyY2ggd2hlbiBhbnkgb2YgdGhlc2UgY2xhc3NlcyBhcmUgcHJlc2VudCBpbiB0aGUgZWRpdG9yJ1xuICBpbmNyZW1lbnRhbFNlYXJjaDogZmFsc2VcbiAgaW5jcmVtZW50YWxTZWFyY2hWaXNpdERpcmVjdGlvbjpcbiAgICBkZWZhdWx0OiAnYWJzb2x1dGUnXG4gICAgZW51bTogWydhYnNvbHV0ZScsICdyZWxhdGl2ZSddXG4gICAgZGVzY3JpcHRpb246IFwiV2hlbiBgcmVsYXRpdmVgLCBgdGFiYCwgYW5kIGBzaGlmdC10YWJgIHJlc3BlY3Qgc2VhcmNoIGRpcmVjdGlvbignLycgb3IgJz8nKVwiXG4gIHN0YXlPblRyYW5zZm9ybVN0cmluZzpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIFRyYW5zZm9ybVN0cmluZyBlLmcgdXBwZXItY2FzZSwgc3Vycm91bmRcIlxuICBzdGF5T25ZYW5rOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRG9uJ3QgbW92ZSBjdXJzb3IgYWZ0ZXIgeWFua1wiXG4gIHN0YXlPbkRlbGV0ZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIGRlbGV0ZVwiXG4gIHN0YXlPbk9jY3VycmVuY2U6XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIHdoZW4gb3BlcmF0b3Igd29ya3Mgb24gb2NjdXJyZW5jZXMoIHdoZW4gYHRydWVgLCBvdmVycmlkZSBvcGVyYXRvciBzcGVjaWZpYyBgc3RheU9uYCBvcHRpb25zIClcIlxuICBrZWVwQ29sdW1uT25TZWxlY3RUZXh0T2JqZWN0OlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiS2VlcCBjb2x1bW4gb24gc2VsZWN0IFRleHRPYmplY3QoUGFyYWdyYXBoLCBJbmRlbnRhdGlvbiwgRm9sZCwgRnVuY3Rpb24sIEVkZ2UpXCJcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPblZlcnRpY2FsTW90aW9uOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgICBBbG1vc3QgZXF1aXZhbGVudCB0byBgc3RhcnRvZmxpbmVgIHB1cmUtVmltIG9wdGlvbi4gV2hlbiB0cnVlLCBtb3ZlIGN1cnNvciB0byBmaXJzdCBjaGFyLjxicj5cbiAgICAgIEFmZmVjdHMgdG8gYGN0cmwtZiwgYiwgZCwgdWAsIGBHYCwgYEhgLCBgTWAsIGBMYCwgYGdnYDxicj5cbiAgICAgIFVubGlrZSBwdXJlLVZpbSwgYGRgLCBgPDxgLCBgPj5gIGFyZSBub3QgYWZmZWN0ZWQgYnkgdGhpcyBvcHRpb24sIHVzZSBpbmRlcGVuZGVudCBgc3RheU9uYCBvcHRpb25zLlxuICAgICAgXCJcIlwiXG4gIGZsYXNoT25VbmRvUmVkbzogdHJ1ZVxuICBmbGFzaE9uTW92ZVRvT2NjdXJyZW5jZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkFmZmVjdHMgbm9ybWFsLW1vZGUncyBgdGFiYCwgYHNoaWZ0LXRhYmAuXCJcbiAgZmxhc2hPbk9wZXJhdGU6IHRydWVcbiAgZmxhc2hPbk9wZXJhdGVCbGFja2xpc3Q6XG4gICAgZGVmYXVsdDogW11cbiAgICBpdGVtczogdHlwZTogJ3N0cmluZydcbiAgICBkZXNjcmlwdGlvbjogJ0NvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIG9wZXJhdG9yIGNsYXNzIG5hbWUgdG8gZGlzYWJsZSBmbGFzaCBlLmcuIFwieWFuaywgYXV0by1pbmRlbnRcIidcbiAgZmxhc2hPblNlYXJjaDogdHJ1ZVxuICBmbGFzaFNjcmVlbk9uU2VhcmNoSGFzTm9NYXRjaDogdHJ1ZVxuICBzaG93SG92ZXJTZWFyY2hDb3VudGVyOiBmYWxzZVxuICBzaG93SG92ZXJTZWFyY2hDb3VudGVyRHVyYXRpb246XG4gICAgZGVmYXVsdDogNzAwXG4gICAgZGVzY3JpcHRpb246IFwiRHVyYXRpb24obXNlYykgZm9yIGhvdmVyIHNlYXJjaCBjb3VudGVyXCJcbiAgaGlkZVRhYkJhck9uTWF4aW1pemVQYW5lOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogXCJJZiBzZXQgdG8gYGZhbHNlYCwgdGFiIHN0aWxsIHZpc2libGUgYWZ0ZXIgbWF4aW1pemUtcGFuZSggYGNtZC1lbnRlcmAgKVwiXG4gIGhpZGVTdGF0dXNCYXJPbk1heGltaXplUGFuZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gIHNtb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvbjpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkZvciBgY3RybC1mYCBhbmQgYGN0cmwtYmBcIlxuICBzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb25EdXJhdGlvbjpcbiAgICBkZWZhdWx0OiA1MDBcbiAgICBkZXNjcmlwdGlvbjogXCJTbW9vdGggc2Nyb2xsIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyBmb3IgYGN0cmwtZmAgYW5kIGBjdHJsLWJgXCJcbiAgc21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRm9yIGBjdHJsLWRgIGFuZCBgY3RybC11YFwiXG4gIHNtb290aFNjcm9sbE9uSGFsZlNjcm9sbE1vdGlvbkR1cmF0aW9uOlxuICAgIGRlZmF1bHQ6IDUwMFxuICAgIGRlc2NyaXB0aW9uOiBcIlNtb290aCBzY3JvbGwgZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIGZvciBgY3RybC1kYCBhbmQgYGN0cmwtdWBcIlxuICBzdGF0dXNCYXJNb2RlU3RyaW5nU3R5bGU6XG4gICAgZGVmYXVsdDogJ3Nob3J0J1xuICAgIGVudW06IFsnc2hvcnQnLCAnbG9uZyddXG4gIGRlYnVnOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiW0RldiB1c2VdXCJcbiAgc3RyaWN0QXNzZXJ0aW9uOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiW0RldiB1c2VdIHRvIGNhdGNoZSB3aXJlZCBzdGF0ZSBpbiB2bXAtZGV2LCBlbmFibGUgdGhpcyBpZiB5b3Ugd2FudCBoZWxwIG1lXCJcbiJdfQ==
