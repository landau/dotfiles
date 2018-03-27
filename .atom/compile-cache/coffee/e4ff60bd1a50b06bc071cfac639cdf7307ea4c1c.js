(function() {
  var Disposable, Settings, inferType;

  Disposable = require('atom').Disposable;

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
      return atom.config.get(this.scope + "." + param);
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

    Settings.prototype.observeConditionalKeymaps = function() {
      var conditionalKeymaps, observeConditionalKeymap;
      conditionalKeymaps = {
        keymapUnderscoreToReplaceWithRegister: {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            '_': 'vim-mode-plus:replace-with-register'
          }
        },
        keymapCCToChangeInnerSmartWord: {
          'atom-text-editor.vim-mode-plus.operator-pending-mode.change-pending': {
            'c': 'vim-mode-plus:inner-smart-word'
          }
        },
        keymapSemicolonToInnerAnyPairInOperatorPendingMode: {
          'atom-text-editor.vim-mode-plus.operator-pending-mode': {
            ';': 'vim-mode-plus:inner-any-pair'
          }
        },
        keymapSemicolonToInnerAnyPairInVisualMode: {
          'atom-text-editor.vim-mode-plus.visual-mode': {
            ';': 'vim-mode-plus:inner-any-pair'
          }
        },
        keymapBackslashToInnerCommentOrParagraphWhenToggleLineCommentsIsPending: {
          'atom-text-editor.vim-mode-plus.operator-pending-mode.toggle-line-comments-pending': {
            '/': 'vim-mode-plus:inner-comment-or-paragraph'
          }
        }
      };
      observeConditionalKeymap = (function(_this) {
        return function(param) {
          var disposable, keymapSource;
          keymapSource = "vim-mode-plus-conditional-keymap:" + param;
          disposable = _this.observe(param, function(newValue) {
            if (newValue) {
              return atom.keymaps.add(keymapSource, conditionalKeymaps[param]);
            } else {
              return atom.keymaps.removeBindingsFromSource(keymapSource);
            }
          });
          return new Disposable(function() {
            disposable.dispose();
            return atom.keymaps.removeBindingsFromSource(keymapSource);
          });
        };
      })(this);
      return Object.keys(conditionalKeymaps).map(function(param) {
        return observeConditionalKeymap(param);
      });
    };

    return Settings;

  })();

  module.exports = new Settings('vim-mode-plus', {
    keymapUnderscoreToReplaceWithRegister: {
      "default": false,
      description: "Can: `_ i (` to replace inner-parenthesis with register's value<br>\nCan: `_ i ;` to replace inner-any-pair if you enabled `keymapSemicolonToInnerAnyPairInOperatorPendingMode`<br>\nConflicts: `_`( `move-to-first-character-of-line-and-down` ) motion. Who use this??"
    },
    keymapCCToChangeInnerSmartWord: {
      "default": false,
      description: "Can: `c c` to `change inner-smart-word`<br>\nConflicts: `c c`( change-current-line ) keystroke which is equivalent to `S` or `c i l` etc."
    },
    keymapSemicolonToInnerAnyPairInOperatorPendingMode: {
      "default": false,
      description: "Can: `c ;` to `change inner-any-pair`, Conflicts with original `;`( `repeat-find` ) motion.<br>\nConflicts: `;`( `repeat-find` )."
    },
    keymapSemicolonToInnerAnyPairInVisualMode: {
      "default": false,
      description: "Can: `v ;` to `select inner-any-pair`, Conflicts with original `;`( `repeat-find` ) motion.<br>L\nConflicts: `;`( `repeat-find` )."
    },
    keymapBackslashToInnerCommentOrParagraphWhenToggleLineCommentsIsPending: {
      "default": false,
      description: "Can: `g / /` to comment-in already commented region, `g / /` to comment-out paragraph.<br>\nConflicts: `/`( `search` ) motion only when `g /` is pending. you no longe can `g /` with search."
    },
    setCursorToStartOfChangeOnUndoRedo: true,
    setCursorToStartOfChangeOnUndoRedoStrategy: {
      "default": 'smart',
      "enum": ['smart', 'simple'],
      description: "When you think undo/redo cursor position has BUG, set this to `simple`.<br>\n`smart`: Good accuracy but have cursor-not-updated-on-different-editor limitation<br>\n`simple`: Always work, but accuracy is not as good as `smart`.<br>"
    },
    groupChangesWhenLeavingInsertMode: true,
    useClipboardAsDefaultRegister: true,
    dontUpdateRegisterOnChangeOrSubstitute: {
      "default": false,
      description: "When set to `true` any `change` or `substitute` operation no longer update register content<br>\nAffects `c`, `C`, `s`, `S` operator."
    },
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
      "default": true,
      description: 'Clear highlightSearch on `escape` in normal-mode'
    },
    clearPersistentSelectionOnResetNormalMode: {
      "default": true,
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
    highlightSearch: true,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSOztFQUVmLFNBQUEsR0FBWSxTQUFDLEtBQUQ7QUFDVixZQUFBLEtBQUE7QUFBQSxZQUNPLE1BQU0sQ0FBQyxTQUFQLENBQWlCLEtBQWpCLENBRFA7ZUFDb0M7QUFEcEMsV0FFTyxPQUFPLEtBQVAsS0FBaUIsU0FGeEI7ZUFFdUM7QUFGdkMsV0FHTyxPQUFPLEtBQVAsS0FBaUIsUUFIeEI7ZUFHc0M7QUFIdEMsWUFJTyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQWQsQ0FKUDtlQUlpQztBQUpqQztFQURVOztFQU9OO0lBQ1Msa0JBQUMsS0FBRCxFQUFTLE1BQVQ7QUFJWCxVQUFBO01BSlksSUFBQyxDQUFBLFFBQUQ7TUFBUSxJQUFDLENBQUEsU0FBRDtBQUlwQjtBQUFBLFdBQUEscUNBQUE7O1FBQ0UsSUFBRyxPQUFPLElBQUMsQ0FBQSxNQUFPLENBQUEsR0FBQSxDQUFmLEtBQXdCLFNBQTNCO1VBQ0UsSUFBQyxDQUFBLE1BQU8sQ0FBQSxHQUFBLENBQVIsR0FBZTtZQUFDLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFBQyxDQUFBLE1BQU8sQ0FBQSxHQUFBLENBQWxCO1lBRGpCOztRQUVBLElBQU8sdUNBQVA7VUFDRSxLQUFLLENBQUMsSUFBTixHQUFhLFNBQUEsQ0FBVSxLQUFLLEVBQUMsT0FBRCxFQUFmLEVBRGY7O0FBSEY7QUFPQTtBQUFBLFdBQUEsZ0RBQUE7O1FBQ0UsSUFBQyxDQUFBLE1BQU8sQ0FBQSxJQUFBLENBQUssQ0FBQyxLQUFkLEdBQXNCO0FBRHhCO0lBWFc7O3VCQWNiLEdBQUEsR0FBSyxTQUFDLEtBQUQ7YUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLEdB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O0lBMkpBLHdCQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE9BQVQ7TUFDQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsT0FBRCxFQUFVLE1BQVYsQ0FETjtLQTVKRjtJQThKQSxLQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7TUFDQSxXQUFBLEVBQWEsV0FEYjtLQS9KRjtJQWlLQSxlQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7TUFDQSxXQUFBLEVBQWEsNkVBRGI7S0FsS0Y7R0FEbUI7QUFyRXJCIiwic291cmNlc0NvbnRlbnQiOlsie0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuaW5mZXJUeXBlID0gKHZhbHVlKSAtPlxuICBzd2l0Y2hcbiAgICB3aGVuIE51bWJlci5pc0ludGVnZXIodmFsdWUpIHRoZW4gJ2ludGVnZXInXG4gICAgd2hlbiB0eXBlb2YodmFsdWUpIGlzICdib29sZWFuJyB0aGVuICdib29sZWFuJ1xuICAgIHdoZW4gdHlwZW9mKHZhbHVlKSBpcyAnc3RyaW5nJyB0aGVuICdzdHJpbmcnXG4gICAgd2hlbiBBcnJheS5pc0FycmF5KHZhbHVlKSB0aGVuICdhcnJheSdcblxuY2xhc3MgU2V0dGluZ3NcbiAgY29uc3RydWN0b3I6IChAc2NvcGUsIEBjb25maWcpIC0+XG4gICAgIyBBdXRvbWF0aWNhbGx5IGluZmVyIGFuZCBpbmplY3QgYHR5cGVgIG9mIGVhY2ggY29uZmlnIHBhcmFtZXRlci5cbiAgICAjIHNraXAgaWYgdmFsdWUgd2hpY2ggYWxlYWR5IGhhdmUgYHR5cGVgIGZpZWxkLlxuICAgICMgQWxzbyB0cmFuc2xhdGUgYmFyZSBgYm9vbGVhbmAgdmFsdWUgdG8ge2RlZmF1bHQ6IGBib29sZWFuYH0gb2JqZWN0XG4gICAgZm9yIGtleSBpbiBPYmplY3Qua2V5cyhAY29uZmlnKVxuICAgICAgaWYgdHlwZW9mKEBjb25maWdba2V5XSkgaXMgJ2Jvb2xlYW4nXG4gICAgICAgIEBjb25maWdba2V5XSA9IHtkZWZhdWx0OiBAY29uZmlnW2tleV19XG4gICAgICB1bmxlc3MgKHZhbHVlID0gQGNvbmZpZ1trZXldKS50eXBlP1xuICAgICAgICB2YWx1ZS50eXBlID0gaW5mZXJUeXBlKHZhbHVlLmRlZmF1bHQpXG5cbiAgICAjIFtDQVVUSU9OXSBpbmplY3Rpbmcgb3JkZXIgcHJvcGV0eSB0byBzZXQgb3JkZXIgc2hvd24gYXQgc2V0dGluZy12aWV3IE1VU1QtQ09NRS1MQVNULlxuICAgIGZvciBuYW1lLCBpIGluIE9iamVjdC5rZXlzKEBjb25maWcpXG4gICAgICBAY29uZmlnW25hbWVdLm9yZGVyID0gaVxuXG4gIGdldDogKHBhcmFtKSAtPlxuICAgIGF0b20uY29uZmlnLmdldChcIiN7QHNjb3BlfS4je3BhcmFtfVwiKVxuXG4gIHNldDogKHBhcmFtLCB2YWx1ZSkgLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCIje0BzY29wZX0uI3twYXJhbX1cIiwgdmFsdWUpXG5cbiAgdG9nZ2xlOiAocGFyYW0pIC0+XG4gICAgQHNldChwYXJhbSwgbm90IEBnZXQocGFyYW0pKVxuXG4gIG9ic2VydmU6IChwYXJhbSwgZm4pIC0+XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZShcIiN7QHNjb3BlfS4je3BhcmFtfVwiLCBmbilcblxuICBvYnNlcnZlQ29uZGl0aW9uYWxLZXltYXBzOiAtPlxuICAgIGNvbmRpdGlvbmFsS2V5bWFwcyA9XG4gICAgICBrZXltYXBVbmRlcnNjb3JlVG9SZXBsYWNlV2l0aFJlZ2lzdGVyOlxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnXyc6ICd2aW0tbW9kZS1wbHVzOnJlcGxhY2Utd2l0aC1yZWdpc3RlcidcbiAgICAgIGtleW1hcENDVG9DaGFuZ2VJbm5lclNtYXJ0V29yZDpcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5vcGVyYXRvci1wZW5kaW5nLW1vZGUuY2hhbmdlLXBlbmRpbmcnOlxuICAgICAgICAgICdjJzogJ3ZpbS1tb2RlLXBsdXM6aW5uZXItc21hcnQtd29yZCdcbiAgICAgIGtleW1hcFNlbWljb2xvblRvSW5uZXJBbnlQYWlySW5PcGVyYXRvclBlbmRpbmdNb2RlOlxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm9wZXJhdG9yLXBlbmRpbmctbW9kZSc6XG4gICAgICAgICAgJzsnOiAndmltLW1vZGUtcGx1czppbm5lci1hbnktcGFpcidcbiAgICAgIGtleW1hcFNlbWljb2xvblRvSW5uZXJBbnlQYWlySW5WaXN1YWxNb2RlOlxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLnZpc3VhbC1tb2RlJzpcbiAgICAgICAgICAnOyc6ICd2aW0tbW9kZS1wbHVzOmlubmVyLWFueS1wYWlyJ1xuICAgICAga2V5bWFwQmFja3NsYXNoVG9Jbm5lckNvbW1lbnRPclBhcmFncmFwaFdoZW5Ub2dnbGVMaW5lQ29tbWVudHNJc1BlbmRpbmc6XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMub3BlcmF0b3ItcGVuZGluZy1tb2RlLnRvZ2dsZS1saW5lLWNvbW1lbnRzLXBlbmRpbmcnOlxuICAgICAgICAgICcvJzogJ3ZpbS1tb2RlLXBsdXM6aW5uZXItY29tbWVudC1vci1wYXJhZ3JhcGgnXG5cbiAgICBvYnNlcnZlQ29uZGl0aW9uYWxLZXltYXAgPSAocGFyYW0pID0+XG4gICAgICBrZXltYXBTb3VyY2UgPSBcInZpbS1tb2RlLXBsdXMtY29uZGl0aW9uYWwta2V5bWFwOiN7cGFyYW19XCJcbiAgICAgIGRpc3Bvc2FibGUgPSBAb2JzZXJ2ZSBwYXJhbSwgKG5ld1ZhbHVlKSAtPlxuICAgICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICAgIGF0b20ua2V5bWFwcy5hZGQoa2V5bWFwU291cmNlLCBjb25kaXRpb25hbEtleW1hcHNbcGFyYW1dKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXRvbS5rZXltYXBzLnJlbW92ZUJpbmRpbmdzRnJvbVNvdXJjZShrZXltYXBTb3VyY2UpXG5cbiAgICAgIG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICAgIGF0b20ua2V5bWFwcy5yZW1vdmVCaW5kaW5nc0Zyb21Tb3VyY2Uoa2V5bWFwU291cmNlKVxuXG4gICAgIyBSZXR1cm4gZGlzcG9zYWxiZXMgdG8gZGlzcG9zZSBjb25maWcgb2JzZXJ2YXRpb24gYW5kIGNvbmRpdGlvbmFsIGtleW1hcC5cbiAgICByZXR1cm4gT2JqZWN0LmtleXMoY29uZGl0aW9uYWxLZXltYXBzKS5tYXAgKHBhcmFtKSAtPiBvYnNlcnZlQ29uZGl0aW9uYWxLZXltYXAocGFyYW0pXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzICd2aW0tbW9kZS1wbHVzJyxcbiAga2V5bWFwVW5kZXJzY29yZVRvUmVwbGFjZVdpdGhSZWdpc3RlcjpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBDYW46IGBfIGkgKGAgdG8gcmVwbGFjZSBpbm5lci1wYXJlbnRoZXNpcyB3aXRoIHJlZ2lzdGVyJ3MgdmFsdWU8YnI+XG4gICAgQ2FuOiBgXyBpIDtgIHRvIHJlcGxhY2UgaW5uZXItYW55LXBhaXIgaWYgeW91IGVuYWJsZWQgYGtleW1hcFNlbWljb2xvblRvSW5uZXJBbnlQYWlySW5PcGVyYXRvclBlbmRpbmdNb2RlYDxicj5cbiAgICBDb25mbGljdHM6IGBfYCggYG1vdmUtdG8tZmlyc3QtY2hhcmFjdGVyLW9mLWxpbmUtYW5kLWRvd25gICkgbW90aW9uLiBXaG8gdXNlIHRoaXM/P1xuICAgIFwiXCJcIlxuICBrZXltYXBDQ1RvQ2hhbmdlSW5uZXJTbWFydFdvcmQ6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgQ2FuOiBgYyBjYCB0byBgY2hhbmdlIGlubmVyLXNtYXJ0LXdvcmRgPGJyPlxuICAgIENvbmZsaWN0czogYGMgY2AoIGNoYW5nZS1jdXJyZW50LWxpbmUgKSBrZXlzdHJva2Ugd2hpY2ggaXMgZXF1aXZhbGVudCB0byBgU2Agb3IgYGMgaSBsYCBldGMuXG4gICAgXCJcIlwiXG4gIGtleW1hcFNlbWljb2xvblRvSW5uZXJBbnlQYWlySW5PcGVyYXRvclBlbmRpbmdNb2RlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIENhbjogYGMgO2AgdG8gYGNoYW5nZSBpbm5lci1hbnktcGFpcmAsIENvbmZsaWN0cyB3aXRoIG9yaWdpbmFsIGA7YCggYHJlcGVhdC1maW5kYCApIG1vdGlvbi48YnI+XG4gICAgQ29uZmxpY3RzOiBgO2AoIGByZXBlYXQtZmluZGAgKS5cbiAgICBcIlwiXCJcbiAga2V5bWFwU2VtaWNvbG9uVG9Jbm5lckFueVBhaXJJblZpc3VhbE1vZGU6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgQ2FuOiBgdiA7YCB0byBgc2VsZWN0IGlubmVyLWFueS1wYWlyYCwgQ29uZmxpY3RzIHdpdGggb3JpZ2luYWwgYDtgKCBgcmVwZWF0LWZpbmRgICkgbW90aW9uLjxicj5MXG4gICAgQ29uZmxpY3RzOiBgO2AoIGByZXBlYXQtZmluZGAgKS5cbiAgICBcIlwiXCJcbiAga2V5bWFwQmFja3NsYXNoVG9Jbm5lckNvbW1lbnRPclBhcmFncmFwaFdoZW5Ub2dnbGVMaW5lQ29tbWVudHNJc1BlbmRpbmc6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgQ2FuOiBgZyAvIC9gIHRvIGNvbW1lbnQtaW4gYWxyZWFkeSBjb21tZW50ZWQgcmVnaW9uLCBgZyAvIC9gIHRvIGNvbW1lbnQtb3V0IHBhcmFncmFwaC48YnI+XG4gICAgQ29uZmxpY3RzOiBgL2AoIGBzZWFyY2hgICkgbW90aW9uIG9ubHkgd2hlbiBgZyAvYCBpcyBwZW5kaW5nLiB5b3Ugbm8gbG9uZ2UgY2FuIGBnIC9gIHdpdGggc2VhcmNoLlxuICAgIFwiXCJcIlxuICBzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvOiB0cnVlXG4gIHNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG9TdHJhdGVneTpcbiAgICBkZWZhdWx0OiAnc21hcnQnXG4gICAgZW51bTogWydzbWFydCcsICdzaW1wbGUnXVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBXaGVuIHlvdSB0aGluayB1bmRvL3JlZG8gY3Vyc29yIHBvc2l0aW9uIGhhcyBCVUcsIHNldCB0aGlzIHRvIGBzaW1wbGVgLjxicj5cbiAgICBgc21hcnRgOiBHb29kIGFjY3VyYWN5IGJ1dCBoYXZlIGN1cnNvci1ub3QtdXBkYXRlZC1vbi1kaWZmZXJlbnQtZWRpdG9yIGxpbWl0YXRpb248YnI+XG4gICAgYHNpbXBsZWA6IEFsd2F5cyB3b3JrLCBidXQgYWNjdXJhY3kgaXMgbm90IGFzIGdvb2QgYXMgYHNtYXJ0YC48YnI+XG4gICAgXCJcIlwiXG4gIGdyb3VwQ2hhbmdlc1doZW5MZWF2aW5nSW5zZXJ0TW9kZTogdHJ1ZVxuICB1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcjogdHJ1ZVxuICBkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBXaGVuIHNldCB0byBgdHJ1ZWAgYW55IGBjaGFuZ2VgIG9yIGBzdWJzdGl0dXRlYCBvcGVyYXRpb24gbm8gbG9uZ2VyIHVwZGF0ZSByZWdpc3RlciBjb250ZW50PGJyPlxuICAgIEFmZmVjdHMgYGNgLCBgQ2AsIGBzYCwgYFNgIG9wZXJhdG9yLlxuICAgIFwiXCJcIlxuICBzdGFydEluSW5zZXJ0TW9kZTogZmFsc2VcbiAgc3RhcnRJbkluc2VydE1vZGVTY29wZXM6XG4gICAgZGVmYXVsdDogW11cbiAgICBpdGVtczogdHlwZTogJ3N0cmluZydcbiAgICBkZXNjcmlwdGlvbjogJ1N0YXJ0IGluIGluc2VydC1tb2RlIHdoZW4gZWRpdG9yRWxlbWVudCBtYXRjaGVzIHNjb3BlJ1xuICBjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZTogZmFsc2VcbiAgYXV0b1NlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25Pbk9wZXJhdGU6IHRydWVcbiAgYXV0b21hdGljYWxseUVzY2FwZUluc2VydE1vZGVPbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdFc2NhcGUgaW5zZXJ0LW1vZGUgb24gdGFiIHN3aXRjaCwgcGFuZSBzd2l0Y2gnXG4gIHdyYXBMZWZ0UmlnaHRNb3Rpb246IGZhbHNlXG4gIG51bWJlclJlZ2V4OlxuICAgIGRlZmF1bHQ6ICctP1swLTldKydcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgICBVc2VkIHRvIGZpbmQgbnVtYmVyIGluIGN0cmwtYS9jdHJsLXguPGJyPlxuICAgICAgVG8gaWdub3JlIFwiLVwiKG1pbnVzKSBjaGFyIGluIHN0cmluZyBsaWtlIFwiaWRlbnRpZmllci0xXCIgdXNlIGAoPzpcXFxcQi0pP1swLTldK2BcbiAgICAgIFwiXCJcIlxuICBjbGVhckhpZ2hsaWdodFNlYXJjaE9uUmVzZXROb3JtYWxNb2RlOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogJ0NsZWFyIGhpZ2hsaWdodFNlYXJjaCBvbiBgZXNjYXBlYCBpbiBub3JtYWwtbW9kZSdcbiAgY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uT25SZXNldE5vcm1hbE1vZGU6XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiAnQ2xlYXIgcGVyc2lzdGVudFNlbGVjdGlvbiBvbiBgZXNjYXBlYCBpbiBub3JtYWwtbW9kZSdcbiAgY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kOlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgICAgQ29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgY2hhcmFjdGVyLCB3aGljaCBhZGQgc3BhY2UgYXJvdW5kIHN1cnJvdW5kZWQgdGV4dC48YnI+XG4gICAgICBGb3IgdmltLXN1cnJvdW5kIGNvbXBhdGlibGUgYmVoYXZpb3IsIHNldCBgKCwgeywgWywgPGAuXG4gICAgICBcIlwiXCJcbiAgc2hvd0N1cnNvckluVmlzdWFsTW9kZTogdHJ1ZVxuICBpZ25vcmVDYXNlRm9yU2VhcmNoOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdGb3IgYC9gIGFuZCBgP2AnXG4gIHVzZVNtYXJ0Y2FzZUZvclNlYXJjaDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAvYCBhbmQgYD9gLiBPdmVycmlkZSBgaWdub3JlQ2FzZUZvclNlYXJjaGAnXG4gIGlnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAqYCBhbmQgYCNgLidcbiAgdXNlU21hcnRjYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQ6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0ZvciBgKmAgYW5kIGAjYC4gT3ZlcnJpZGUgYGlnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZGAnXG4gIGhpZ2hsaWdodFNlYXJjaDogdHJ1ZVxuICBoaWdobGlnaHRTZWFyY2hFeGNsdWRlU2NvcGVzOlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246ICdTdXBwcmVzcyBoaWdobGlnaHRTZWFyY2ggd2hlbiBhbnkgb2YgdGhlc2UgY2xhc3NlcyBhcmUgcHJlc2VudCBpbiB0aGUgZWRpdG9yJ1xuICBpbmNyZW1lbnRhbFNlYXJjaDogZmFsc2VcbiAgaW5jcmVtZW50YWxTZWFyY2hWaXNpdERpcmVjdGlvbjpcbiAgICBkZWZhdWx0OiAnYWJzb2x1dGUnXG4gICAgZW51bTogWydhYnNvbHV0ZScsICdyZWxhdGl2ZSddXG4gICAgZGVzY3JpcHRpb246IFwiV2hlbiBgcmVsYXRpdmVgLCBgdGFiYCwgYW5kIGBzaGlmdC10YWJgIHJlc3BlY3Qgc2VhcmNoIGRpcmVjdGlvbignLycgb3IgJz8nKVwiXG4gIHN0YXlPblRyYW5zZm9ybVN0cmluZzpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIFRyYW5zZm9ybVN0cmluZyBlLmcgdXBwZXItY2FzZSwgc3Vycm91bmRcIlxuICBzdGF5T25ZYW5rOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRG9uJ3QgbW92ZSBjdXJzb3IgYWZ0ZXIgeWFua1wiXG4gIHN0YXlPbkRlbGV0ZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIGRlbGV0ZVwiXG4gIHN0YXlPbk9jY3VycmVuY2U6XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIHdoZW4gb3BlcmF0b3Igd29ya3Mgb24gb2NjdXJyZW5jZXMoIHdoZW4gYHRydWVgLCBvdmVycmlkZSBvcGVyYXRvciBzcGVjaWZpYyBgc3RheU9uYCBvcHRpb25zIClcIlxuICBrZWVwQ29sdW1uT25TZWxlY3RUZXh0T2JqZWN0OlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiS2VlcCBjb2x1bW4gb24gc2VsZWN0IFRleHRPYmplY3QoUGFyYWdyYXBoLCBJbmRlbnRhdGlvbiwgRm9sZCwgRnVuY3Rpb24sIEVkZ2UpXCJcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPblZlcnRpY2FsTW90aW9uOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgICBBbG1vc3QgZXF1aXZhbGVudCB0byBgc3RhcnRvZmxpbmVgIHB1cmUtVmltIG9wdGlvbi4gV2hlbiB0cnVlLCBtb3ZlIGN1cnNvciB0byBmaXJzdCBjaGFyLjxicj5cbiAgICAgIEFmZmVjdHMgdG8gYGN0cmwtZiwgYiwgZCwgdWAsIGBHYCwgYEhgLCBgTWAsIGBMYCwgYGdnYDxicj5cbiAgICAgIFVubGlrZSBwdXJlLVZpbSwgYGRgLCBgPDxgLCBgPj5gIGFyZSBub3QgYWZmZWN0ZWQgYnkgdGhpcyBvcHRpb24sIHVzZSBpbmRlcGVuZGVudCBgc3RheU9uYCBvcHRpb25zLlxuICAgICAgXCJcIlwiXG4gIGZsYXNoT25VbmRvUmVkbzogdHJ1ZVxuICBmbGFzaE9uTW92ZVRvT2NjdXJyZW5jZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkFmZmVjdHMgbm9ybWFsLW1vZGUncyBgdGFiYCwgYHNoaWZ0LXRhYmAuXCJcbiAgZmxhc2hPbk9wZXJhdGU6IHRydWVcbiAgZmxhc2hPbk9wZXJhdGVCbGFja2xpc3Q6XG4gICAgZGVmYXVsdDogW11cbiAgICBpdGVtczogdHlwZTogJ3N0cmluZydcbiAgICBkZXNjcmlwdGlvbjogJ0NvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIG9wZXJhdG9yIGNsYXNzIG5hbWUgdG8gZGlzYWJsZSBmbGFzaCBlLmcuIFwieWFuaywgYXV0by1pbmRlbnRcIidcbiAgZmxhc2hPblNlYXJjaDogdHJ1ZVxuICBmbGFzaFNjcmVlbk9uU2VhcmNoSGFzTm9NYXRjaDogdHJ1ZVxuICBzaG93SG92ZXJTZWFyY2hDb3VudGVyOiBmYWxzZVxuICBzaG93SG92ZXJTZWFyY2hDb3VudGVyRHVyYXRpb246XG4gICAgZGVmYXVsdDogNzAwXG4gICAgZGVzY3JpcHRpb246IFwiRHVyYXRpb24obXNlYykgZm9yIGhvdmVyIHNlYXJjaCBjb3VudGVyXCJcbiAgaGlkZVRhYkJhck9uTWF4aW1pemVQYW5lOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogXCJJZiBzZXQgdG8gYGZhbHNlYCwgdGFiIHN0aWxsIHZpc2libGUgYWZ0ZXIgbWF4aW1pemUtcGFuZSggYGNtZC1lbnRlcmAgKVwiXG4gIGhpZGVTdGF0dXNCYXJPbk1heGltaXplUGFuZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gIHNtb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvbjpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkZvciBgY3RybC1mYCBhbmQgYGN0cmwtYmBcIlxuICBzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb25EdXJhdGlvbjpcbiAgICBkZWZhdWx0OiA1MDBcbiAgICBkZXNjcmlwdGlvbjogXCJTbW9vdGggc2Nyb2xsIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyBmb3IgYGN0cmwtZmAgYW5kIGBjdHJsLWJgXCJcbiAgc21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRm9yIGBjdHJsLWRgIGFuZCBgY3RybC11YFwiXG4gIHNtb290aFNjcm9sbE9uSGFsZlNjcm9sbE1vdGlvbkR1cmF0aW9uOlxuICAgIGRlZmF1bHQ6IDUwMFxuICAgIGRlc2NyaXB0aW9uOiBcIlNtb290aCBzY3JvbGwgZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIGZvciBgY3RybC1kYCBhbmQgYGN0cmwtdWBcIlxuICBzdGF0dXNCYXJNb2RlU3RyaW5nU3R5bGU6XG4gICAgZGVmYXVsdDogJ3Nob3J0J1xuICAgIGVudW06IFsnc2hvcnQnLCAnbG9uZyddXG4gIGRlYnVnOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiW0RldiB1c2VdXCJcbiAgc3RyaWN0QXNzZXJ0aW9uOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiW0RldiB1c2VdIHRvIGNhdGNoZSB3aXJlZCBzdGF0ZSBpbiB2bXAtZGV2LCBlbmFibGUgdGhpcyBpZiB5b3Ugd2FudCBoZWxwIG1lXCJcbiJdfQ==
