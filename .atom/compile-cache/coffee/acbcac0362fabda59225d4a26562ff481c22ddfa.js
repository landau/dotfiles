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
      description: "Don't move cursor after yank"
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
    throwErrorOnNonEmptySelectionInNormalMode: {
      "default": false,
      description: "[Dev use] Throw error when non-empty selection was remained in normal-mode at the timing of operation finished"
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxTQUFBLEdBQVksU0FBQyxLQUFEO0FBQ1YsWUFBQSxLQUFBO0FBQUEsWUFDTyxNQUFNLENBQUMsU0FBUCxDQUFpQixLQUFqQixDQURQO2VBQ29DO0FBRHBDLFdBRU8sT0FBTyxLQUFQLEtBQWlCLFNBRnhCO2VBRXVDO0FBRnZDLFdBR08sT0FBTyxLQUFQLEtBQWlCLFFBSHhCO2VBR3NDO0FBSHRDLFlBSU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFkLENBSlA7ZUFJaUM7QUFKakM7RUFEVTs7RUFPTjtJQUNTLGtCQUFDLEtBQUQsRUFBUyxNQUFUO0FBSVgsVUFBQTtNQUpZLElBQUMsQ0FBQSxRQUFEO01BQVEsSUFBQyxDQUFBLFNBQUQ7QUFJcEI7QUFBQSxXQUFBLHFDQUFBOztRQUNFLElBQUcsT0FBTyxJQUFDLENBQUEsTUFBTyxDQUFBLEdBQUEsQ0FBZixLQUF3QixTQUEzQjtVQUNFLElBQUMsQ0FBQSxNQUFPLENBQUEsR0FBQSxDQUFSLEdBQWU7WUFBQyxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBQUMsQ0FBQSxNQUFPLENBQUEsR0FBQSxDQUFsQjtZQURqQjs7UUFFQSxJQUFPLHVDQUFQO1VBQ0UsS0FBSyxDQUFDLElBQU4sR0FBYSxTQUFBLENBQVUsS0FBSyxFQUFDLE9BQUQsRUFBZixFQURmOztBQUhGO0FBT0E7QUFBQSxXQUFBLGdEQUFBOztRQUNFLElBQUMsQ0FBQSxNQUFPLENBQUEsSUFBQSxDQUFLLENBQUMsS0FBZCxHQUFzQjtBQUR4QjtJQVhXOzt1QkFjYixHQUFBLEdBQUssU0FBQyxLQUFEO01BQ0gsSUFBRyxLQUFBLEtBQVMsaUJBQVo7UUFDRSxJQUFHLElBQUMsQ0FBQSxHQUFELENB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L0I7SUFpR0Esc0JBQUEsRUFBd0IsS0FqR3hCO0lBa0dBLDhCQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEdBQVQ7TUFDQSxXQUFBLEVBQWEseUNBRGI7S0FuR0Y7SUFxR0Esd0JBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFBVDtNQUNBLFdBQUEsRUFBYSx5RUFEYjtLQXRHRjtJQXdHQSwyQkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUFUO0tBekdGO0lBMEdBLDhCQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7TUFDQSxXQUFBLEVBQWEsMkJBRGI7S0EzR0Y7SUE2R0Esc0NBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsR0FBVDtNQUNBLFdBQUEsRUFBYSxrRUFEYjtLQTlHRjtJQWdIQSw4QkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO01BQ0EsV0FBQSxFQUFhLDJCQURiO0tBakhGO0lBbUhBLHNDQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEdBQVQ7TUFDQSxXQUFBLEVBQWEsa0VBRGI7S0FwSEY7SUFzSEEsd0JBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FBVDtNQUNBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsTUFBVixDQUROO0tBdkhGO0lBeUhBLHlDQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7TUFDQSxXQUFBLEVBQWEsZ0hBRGI7S0ExSEY7R0FEbUI7QUFyQ3JCIiwic291cmNlc0NvbnRlbnQiOlsiaW5mZXJUeXBlID0gKHZhbHVlKSAtPlxuICBzd2l0Y2hcbiAgICB3aGVuIE51bWJlci5pc0ludGVnZXIodmFsdWUpIHRoZW4gJ2ludGVnZXInXG4gICAgd2hlbiB0eXBlb2YodmFsdWUpIGlzICdib29sZWFuJyB0aGVuICdib29sZWFuJ1xuICAgIHdoZW4gdHlwZW9mKHZhbHVlKSBpcyAnc3RyaW5nJyB0aGVuICdzdHJpbmcnXG4gICAgd2hlbiBBcnJheS5pc0FycmF5KHZhbHVlKSB0aGVuICdhcnJheSdcblxuY2xhc3MgU2V0dGluZ3NcbiAgY29uc3RydWN0b3I6IChAc2NvcGUsIEBjb25maWcpIC0+XG4gICAgIyBBdXRvbWF0aWNhbGx5IGluZmVyIGFuZCBpbmplY3QgYHR5cGVgIG9mIGVhY2ggY29uZmlnIHBhcmFtZXRlci5cbiAgICAjIHNraXAgaWYgdmFsdWUgd2hpY2ggYWxlYWR5IGhhdmUgYHR5cGVgIGZpZWxkLlxuICAgICMgQWxzbyB0cmFuc2xhdGUgYmFyZSBgYm9vbGVhbmAgdmFsdWUgdG8ge2RlZmF1bHQ6IGBib29sZWFuYH0gb2JqZWN0XG4gICAgZm9yIGtleSBpbiBPYmplY3Qua2V5cyhAY29uZmlnKVxuICAgICAgaWYgdHlwZW9mKEBjb25maWdba2V5XSkgaXMgJ2Jvb2xlYW4nXG4gICAgICAgIEBjb25maWdba2V5XSA9IHtkZWZhdWx0OiBAY29uZmlnW2tleV19XG4gICAgICB1bmxlc3MgKHZhbHVlID0gQGNvbmZpZ1trZXldKS50eXBlP1xuICAgICAgICB2YWx1ZS50eXBlID0gaW5mZXJUeXBlKHZhbHVlLmRlZmF1bHQpXG5cbiAgICAjIFtDQVVUSU9OXSBpbmplY3Rpbmcgb3JkZXIgcHJvcGV0eSB0byBzZXQgb3JkZXIgc2hvd24gYXQgc2V0dGluZy12aWV3IE1VU1QtQ09NRS1MQVNULlxuICAgIGZvciBuYW1lLCBpIGluIE9iamVjdC5rZXlzKEBjb25maWcpXG4gICAgICBAY29uZmlnW25hbWVdLm9yZGVyID0gaVxuXG4gIGdldDogKHBhcmFtKSAtPlxuICAgIGlmIHBhcmFtIGlzICdkZWZhdWx0UmVnaXN0ZXInXG4gICAgICBpZiBAZ2V0KCd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicpIHRoZW4gJyonIGVsc2UgJ1wiJ1xuICAgIGVsc2VcbiAgICAgIGF0b20uY29uZmlnLmdldCBcIiN7QHNjb3BlfS4je3BhcmFtfVwiXG5cbiAgc2V0OiAocGFyYW0sIHZhbHVlKSAtPlxuICAgIGF0b20uY29uZmlnLnNldCBcIiN7QHNjb3BlfS4je3BhcmFtfVwiLCB2YWx1ZVxuXG4gIHRvZ2dsZTogKHBhcmFtKSAtPlxuICAgIEBzZXQocGFyYW0sIG5vdCBAZ2V0KHBhcmFtKSlcblxuICBvYnNlcnZlOiAocGFyYW0sIGZuKSAtPlxuICAgIGF0b20uY29uZmlnLm9ic2VydmUgXCIje0BzY29wZX0uI3twYXJhbX1cIiwgZm5cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MgJ3ZpbS1tb2RlLXBsdXMnLFxuICBzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvOiB0cnVlXG4gIHNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG9TdHJhdGVneTpcbiAgICBkZWZhdWx0OiAnc21hcnQnXG4gICAgZW51bTogWydzbWFydCcsICdzaW1wbGUnXVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBXaGVuIHlvdSB0aGluayB1bmRvL3JlZG8gY3Vyc29yIHBvc2l0aW9uIGhhcyBCVUcsIHNldCB0aGlzIHRvIGBzaW1wbGVgLjxicj5cbiAgICBgc21hcnRgOiBHb29kIGFjY3VyYWN5IGJ1dCBoYXZlIGN1cnNvci1ub3QtdXBkYXRlZC1vbi1kaWZmZXJlbnQtZWRpdG9yIGxpbWl0YXRpb248YnI+XG4gICAgYHNpbXBsZWA6IEFsd2F5cyB3b3JrLCBidXQgYWNjdXJhY3kgaXMgbm90IGFzIGdvb2QgYXMgYHNtYXJ0YC48YnI+XG4gICAgXCJcIlwiXG4gIGdyb3VwQ2hhbmdlc1doZW5MZWF2aW5nSW5zZXJ0TW9kZTogdHJ1ZVxuICB1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcjogZmFsc2VcbiAgc3RhcnRJbkluc2VydE1vZGU6IGZhbHNlXG4gIHN0YXJ0SW5JbnNlcnRNb2RlU2NvcGVzOlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246ICdTdGFydCBpbiBpbnNlcnQtbW9kZSB3aGVuIGVkaXRvckVsZW1lbnQgbWF0Y2hlcyBzY29wZSdcbiAgY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGU6IGZhbHNlXG4gIGF1dG9TZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uT25PcGVyYXRlOiB0cnVlXG4gIGF1dG9tYXRpY2FsbHlFc2NhcGVJbnNlcnRNb2RlT25BY3RpdmVQYW5lSXRlbUNoYW5nZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRXNjYXBlIGluc2VydC1tb2RlIG9uIHRhYiBzd2l0Y2gsIHBhbmUgc3dpdGNoJ1xuICB3cmFwTGVmdFJpZ2h0TW90aW9uOiBmYWxzZVxuICBudW1iZXJSZWdleDpcbiAgICBkZWZhdWx0OiAnLT9bMC05XSsnXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgICAgVXNlZCB0byBmaW5kIG51bWJlciBpbiBjdHJsLWEvY3RybC14Ljxicj5cbiAgICAgIFRvIGlnbm9yZSBcIi1cIihtaW51cykgY2hhciBpbiBzdHJpbmcgbGlrZSBcImlkZW50aWZpZXItMVwiIHVzZSBgKD86XFxcXEItKT9bMC05XStgXG4gICAgICBcIlwiXCJcbiAgY2xlYXJIaWdobGlnaHRTZWFyY2hPblJlc2V0Tm9ybWFsTW9kZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnQ2xlYXIgaGlnaGxpZ2h0U2VhcmNoIG9uIGBlc2NhcGVgIGluIG5vcm1hbC1tb2RlJ1xuICBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25PblJlc2V0Tm9ybWFsTW9kZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnQ2xlYXIgcGVyc2lzdGVudFNlbGVjdGlvbiBvbiBgZXNjYXBlYCBpbiBub3JtYWwtbW9kZSdcbiAgY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kOlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgICAgQ29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgY2hhcmFjdGVyLCB3aGljaCBhZGQgc3BhY2UgYXJvdW5kIHN1cnJvdW5kZWQgdGV4dC48YnI+XG4gICAgICBGb3IgdmltLXN1cnJvdW5kIGNvbXBhdGlibGUgYmVoYXZpb3IsIHNldCBgKCwgeywgWywgPGAuXG4gICAgICBcIlwiXCJcbiAgc2hvd0N1cnNvckluVmlzdWFsTW9kZTogdHJ1ZVxuICBpZ25vcmVDYXNlRm9yU2VhcmNoOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdGb3IgYC9gIGFuZCBgP2AnXG4gIHVzZVNtYXJ0Y2FzZUZvclNlYXJjaDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAvYCBhbmQgYD9gLiBPdmVycmlkZSBgaWdub3JlQ2FzZUZvclNlYXJjaGAnXG4gIGlnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAqYCBhbmQgYCNgLidcbiAgdXNlU21hcnRjYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQ6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0ZvciBgKmAgYW5kIGAjYC4gT3ZlcnJpZGUgYGlnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZGAnXG4gIGhpZ2hsaWdodFNlYXJjaDogZmFsc2VcbiAgaGlnaGxpZ2h0U2VhcmNoRXhjbHVkZVNjb3BlczpcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOiB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiAnU3VwcHJlc3MgaGlnaGxpZ2h0U2VhcmNoIHdoZW4gYW55IG9mIHRoZXNlIGNsYXNzZXMgYXJlIHByZXNlbnQgaW4gdGhlIGVkaXRvcidcbiAgaW5jcmVtZW50YWxTZWFyY2g6IGZhbHNlXG4gIGluY3JlbWVudGFsU2VhcmNoVmlzaXREaXJlY3Rpb246XG4gICAgZGVmYXVsdDogJ2Fic29sdXRlJ1xuICAgIGVudW06IFsnYWJzb2x1dGUnLCAncmVsYXRpdmUnXVxuICAgIGRlc2NyaXB0aW9uOiBcIldoZW4gYHJlbGF0aXZlYCwgYHRhYmAsIGFuZCBgc2hpZnQtdGFiYCByZXNwZWN0IHNlYXJjaCBkaXJlY3Rpb24oJy8nIG9yICc/JylcIlxuICBzdGF5T25UcmFuc2Zvcm1TdHJpbmc6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBtb3ZlIGN1cnNvciBhZnRlciBUcmFuc2Zvcm1TdHJpbmcgZS5nIHVwcGVyLWNhc2UsIHN1cnJvdW5kXCJcbiAgc3RheU9uWWFuazpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIHlhbmtcIlxuICBzdGF5T25EZWxldGU6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBtb3ZlIGN1cnNvciBhZnRlciB5YW5rXCJcbiAgc3RheU9uT2NjdXJyZW5jZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246IFwiRG9uJ3QgbW92ZSBjdXJzb3Igd2hlbiBvcGVyYXRvciB3b3JrcyBvbiBvY2N1cnJlbmNlcyggd2hlbiBgdHJ1ZWAsIG92ZXJyaWRlIG9wZXJhdG9yIHNwZWNpZmljIGBzdGF5T25gIG9wdGlvbnMgKVwiXG4gIGtlZXBDb2x1bW5PblNlbGVjdFRleHRPYmplY3Q6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJLZWVwIGNvbHVtbiBvbiBzZWxlY3QgVGV4dE9iamVjdChQYXJhZ3JhcGgsIEluZGVudGF0aW9uLCBGb2xkLCBGdW5jdGlvbiwgRWRnZSlcIlxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9uVmVydGljYWxNb3Rpb246XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICAgIEFsbW9zdCBlcXVpdmFsZW50IHRvIGBzdGFydG9mbGluZWAgcHVyZS1WaW0gb3B0aW9uLiBXaGVuIHRydWUsIG1vdmUgY3Vyc29yIHRvIGZpcnN0IGNoYXIuPGJyPlxuICAgICAgQWZmZWN0cyB0byBgY3RybC1mLCBiLCBkLCB1YCwgYEdgLCBgSGAsIGBNYCwgYExgLCBgZ2dgPGJyPlxuICAgICAgVW5saWtlIHB1cmUtVmltLCBgZGAsIGA8PGAsIGA+PmAgYXJlIG5vdCBhZmZlY3RlZCBieSB0aGlzIG9wdGlvbiwgdXNlIGluZGVwZW5kZW50IGBzdGF5T25gIG9wdGlvbnMuXG4gICAgICBcIlwiXCJcbiAgZmxhc2hPblVuZG9SZWRvOiB0cnVlXG4gIGZsYXNoT25Nb3ZlVG9PY2N1cnJlbmNlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiQWZmZWN0cyBub3JtYWwtbW9kZSdzIGB0YWJgLCBgc2hpZnQtdGFiYC5cIlxuICBmbGFzaE9uT3BlcmF0ZTogdHJ1ZVxuICBmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdDpcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOiB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiAnQ29tbWEgc2VwYXJhdGVkIGxpc3Qgb2Ygb3BlcmF0b3IgY2xhc3MgbmFtZSB0byBkaXNhYmxlIGZsYXNoIGUuZy4gXCJ5YW5rLCBhdXRvLWluZGVudFwiJ1xuICBmbGFzaE9uU2VhcmNoOiB0cnVlXG4gIGZsYXNoU2NyZWVuT25TZWFyY2hIYXNOb01hdGNoOiB0cnVlXG4gIHNob3dIb3ZlclNlYXJjaENvdW50ZXI6IGZhbHNlXG4gIHNob3dIb3ZlclNlYXJjaENvdW50ZXJEdXJhdGlvbjpcbiAgICBkZWZhdWx0OiA3MDBcbiAgICBkZXNjcmlwdGlvbjogXCJEdXJhdGlvbihtc2VjKSBmb3IgaG92ZXIgc2VhcmNoIGNvdW50ZXJcIlxuICBoaWRlVGFiQmFyT25NYXhpbWl6ZVBhbmU6XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiBcIklmIHNldCB0byBgZmFsc2VgLCB0YWIgc3RpbGwgdmlzaWJsZSBhZnRlciBtYXhpbWl6ZS1wYW5lKCBgY21kLWVudGVyYCApXCJcbiAgaGlkZVN0YXR1c0Jhck9uTWF4aW1pemVQYW5lOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgc21vb3RoU2Nyb2xsT25GdWxsU2Nyb2xsTW90aW9uOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRm9yIGBjdHJsLWZgIGFuZCBgY3RybC1iYFwiXG4gIHNtb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvbkR1cmF0aW9uOlxuICAgIGRlZmF1bHQ6IDUwMFxuICAgIGRlc2NyaXB0aW9uOiBcIlNtb290aCBzY3JvbGwgZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIGZvciBgY3RybC1mYCBhbmQgYGN0cmwtYmBcIlxuICBzbW9vdGhTY3JvbGxPbkhhbGZTY3JvbGxNb3Rpb246XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJGb3IgYGN0cmwtZGAgYW5kIGBjdHJsLXVgXCJcbiAgc21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uRHVyYXRpb246XG4gICAgZGVmYXVsdDogNTAwXG4gICAgZGVzY3JpcHRpb246IFwiU21vb3RoIHNjcm9sbCBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgZm9yIGBjdHJsLWRgIGFuZCBgY3RybC11YFwiXG4gIHN0YXR1c0Jhck1vZGVTdHJpbmdTdHlsZTpcbiAgICBkZWZhdWx0OiAnc2hvcnQnXG4gICAgZW51bTogWydzaG9ydCcsICdsb25nJ11cbiAgdGhyb3dFcnJvck9uTm9uRW1wdHlTZWxlY3Rpb25Jbk5vcm1hbE1vZGU6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJbRGV2IHVzZV0gVGhyb3cgZXJyb3Igd2hlbiBub24tZW1wdHkgc2VsZWN0aW9uIHdhcyByZW1haW5lZCBpbiBub3JtYWwtbW9kZSBhdCB0aGUgdGltaW5nIG9mIG9wZXJhdGlvbiBmaW5pc2hlZFwiXG4iXX0=
