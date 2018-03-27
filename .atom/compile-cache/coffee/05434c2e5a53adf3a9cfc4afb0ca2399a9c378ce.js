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
    Settings.prototype.deprecatedParams = ['showCursorInVisualMode', 'showCursorInVisualMode2'];

    Settings.prototype.notifyDeprecatedParams = function() {
      var content, deprecatedParams, j, len, notification, param;
      deprecatedParams = this.deprecatedParams.filter((function(_this) {
        return function(param) {
          return _this.has(param);
        };
      })(this));
      if (deprecatedParams.length === 0) {
        return;
      }
      content = [this.scope + ": Config options deprecated.  ", "Remove from your `connfig.cson` now?  "];
      for (j = 0, len = deprecatedParams.length; j < len; j++) {
        param = deprecatedParams[j];
        content.push("- `" + param + "`");
      }
      return notification = atom.notifications.addWarning(content.join("\n"), {
        dismissable: true,
        buttons: [
          {
            text: 'Remove All',
            onDidClick: (function(_this) {
              return function() {
                var k, len1;
                for (k = 0, len1 = deprecatedParams.length; k < len1; k++) {
                  param = deprecatedParams[k];
                  _this["delete"](param);
                }
                return notification.dismiss();
              };
            })(this)
          }
        ]
      });
    };

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

    Settings.prototype.has = function(param) {
      return param in atom.config.get(this.scope);
    };

    Settings.prototype["delete"] = function(param) {
      return this.set(param, void 0);
    };

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
        keymapPToPutWithAutoIndent: {
          'atom-text-editor.vim-mode-plus:not(.insert-mode):not(.operator-pending-mode)': {
            'P': 'vim-mode-plus:put-before-with-auto-indent',
            'p': 'vim-mode-plus:put-after-with-auto-indent'
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
    keymapPToPutWithAutoIndent: {
      "default": false,
      description: "Remap `p` and `P` to auto indent version.<br>\n`p` remapped to `put-before-with-auto-indent` from original `put-before`<br>\n`P` remapped to `put-after-with-auto-indent` from original `put-after`<br>\nConflicts: Original `put-after` and `put-before` become unavailable unless you set different keymap by yourself."
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSOztFQUVmLFNBQUEsR0FBWSxTQUFDLEtBQUQ7QUFDVixZQUFBLEtBQUE7QUFBQSxZQUNPLE1BQU0sQ0FBQyxTQUFQLENBQWlCLEtBQWpCLENBRFA7ZUFDb0M7QUFEcEMsV0FFTyxPQUFPLEtBQVAsS0FBaUIsU0FGeEI7ZUFFdUM7QUFGdkMsV0FHTyxPQUFPLEtBQVAsS0FBaUIsUUFIeEI7ZUFHc0M7QUFIdEMsWUFJTyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQWQsQ0FKUDtlQUlpQztBQUpqQztFQURVOztFQU9OO3VCQUNKLGdCQUFBLEdBQWtCLENBQ2hCLHdCQURnQixFQUVoQix5QkFGZ0I7O3VCQUlsQixzQkFBQSxHQUF3QixTQUFBO0FBQ3RCLFVBQUE7TUFBQSxnQkFBQSxHQUFtQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsTUFBbEIsQ0FBeUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7aUJBQVcsS0FBQyxDQUFBLEdBQUQsQ0FBSyxLQUFMO1FBQVg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO01BQ25CLElBQVUsZ0JBQWdCLENBQUMsTUFBakIsS0FBMkIsQ0FBckM7QUFBQSxlQUFBOztNQUVBLE9BQUEsR0FBVSxDQUNMLElBQUMsQ0FBQSxLQUFGLEdBQVEsZ0NBREYsRUFFUix3Q0FGUTtBQUlWLFdBQUEsa0RBQUE7O1FBQUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxLQUFBLEdBQU0sS0FBTixHQUFZLEdBQXpCO0FBQUE7YUFFQSxZQUFBLEdBQWUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4QixPQUFPLENBQUMsSUFBUixDQUFhLElB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RjtJQTRKQSw4QkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO01BQ0EsV0FBQSxFQUFhLDJCQURiO0tBN0pGO0lBK0pBLHNDQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEdBQVQ7TUFDQSxXQUFBLEVBQWEsa0VBRGI7S0FoS0Y7SUFrS0Esd0JBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FBVDtNQUNBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsTUFBVixDQUROO0tBbktGO0lBcUtBLEtBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSxXQURiO0tBdEtGO0lBd0tBLGVBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSw2RUFEYjtLQXpLRjtHQURtQjtBQXhHckIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5pbmZlclR5cGUgPSAodmFsdWUpIC0+XG4gIHN3aXRjaFxuICAgIHdoZW4gTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgdGhlbiAnaW50ZWdlcidcbiAgICB3aGVuIHR5cGVvZih2YWx1ZSkgaXMgJ2Jvb2xlYW4nIHRoZW4gJ2Jvb2xlYW4nXG4gICAgd2hlbiB0eXBlb2YodmFsdWUpIGlzICdzdHJpbmcnIHRoZW4gJ3N0cmluZydcbiAgICB3aGVuIEFycmF5LmlzQXJyYXkodmFsdWUpIHRoZW4gJ2FycmF5J1xuXG5jbGFzcyBTZXR0aW5nc1xuICBkZXByZWNhdGVkUGFyYW1zOiBbXG4gICAgJ3Nob3dDdXJzb3JJblZpc3VhbE1vZGUnXG4gICAgJ3Nob3dDdXJzb3JJblZpc3VhbE1vZGUyJ1xuICBdXG4gIG5vdGlmeURlcHJlY2F0ZWRQYXJhbXM6IC0+XG4gICAgZGVwcmVjYXRlZFBhcmFtcyA9IEBkZXByZWNhdGVkUGFyYW1zLmZpbHRlcigocGFyYW0pID0+IEBoYXMocGFyYW0pKVxuICAgIHJldHVybiBpZiBkZXByZWNhdGVkUGFyYW1zLmxlbmd0aCBpcyAwXG5cbiAgICBjb250ZW50ID0gW1xuICAgICAgXCIje0BzY29wZX06IENvbmZpZyBvcHRpb25zIGRlcHJlY2F0ZWQuICBcIixcbiAgICAgIFwiUmVtb3ZlIGZyb20geW91ciBgY29ubmZpZy5jc29uYCBub3c/ICBcIlxuICAgIF1cbiAgICBjb250ZW50LnB1c2ggXCItIGAje3BhcmFtfWBcIiBmb3IgcGFyYW0gaW4gZGVwcmVjYXRlZFBhcmFtc1xuXG4gICAgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgY29udGVudC5qb2luKFwiXFxuXCIpLFxuICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICdSZW1vdmUgQWxsJ1xuICAgICAgICAgIG9uRGlkQ2xpY2s6ID0+XG4gICAgICAgICAgICBAZGVsZXRlKHBhcmFtKSBmb3IgcGFyYW0gaW4gZGVwcmVjYXRlZFBhcmFtc1xuICAgICAgICAgICAgbm90aWZpY2F0aW9uLmRpc21pc3MoKVxuICAgICAgICB9XG4gICAgICBdXG5cbiAgY29uc3RydWN0b3I6IChAc2NvcGUsIEBjb25maWcpIC0+XG4gICAgIyBBdXRvbWF0aWNhbGx5IGluZmVyIGFuZCBpbmplY3QgYHR5cGVgIG9mIGVhY2ggY29uZmlnIHBhcmFtZXRlci5cbiAgICAjIHNraXAgaWYgdmFsdWUgd2hpY2ggYWxlYWR5IGhhdmUgYHR5cGVgIGZpZWxkLlxuICAgICMgQWxzbyB0cmFuc2xhdGUgYmFyZSBgYm9vbGVhbmAgdmFsdWUgdG8ge2RlZmF1bHQ6IGBib29sZWFuYH0gb2JqZWN0XG4gICAgZm9yIGtleSBpbiBPYmplY3Qua2V5cyhAY29uZmlnKVxuICAgICAgaWYgdHlwZW9mKEBjb25maWdba2V5XSkgaXMgJ2Jvb2xlYW4nXG4gICAgICAgIEBjb25maWdba2V5XSA9IHtkZWZhdWx0OiBAY29uZmlnW2tleV19XG4gICAgICB1bmxlc3MgKHZhbHVlID0gQGNvbmZpZ1trZXldKS50eXBlP1xuICAgICAgICB2YWx1ZS50eXBlID0gaW5mZXJUeXBlKHZhbHVlLmRlZmF1bHQpXG5cbiAgICAjIFtDQVVUSU9OXSBpbmplY3Rpbmcgb3JkZXIgcHJvcGV0eSB0byBzZXQgb3JkZXIgc2hvd24gYXQgc2V0dGluZy12aWV3IE1VU1QtQ09NRS1MQVNULlxuICAgIGZvciBuYW1lLCBpIGluIE9iamVjdC5rZXlzKEBjb25maWcpXG4gICAgICBAY29uZmlnW25hbWVdLm9yZGVyID0gaVxuXG4gIGhhczogKHBhcmFtKSAtPlxuICAgIHBhcmFtIG9mIGF0b20uY29uZmlnLmdldChAc2NvcGUpXG5cbiAgZGVsZXRlOiAocGFyYW0pIC0+XG4gICAgQHNldChwYXJhbSwgdW5kZWZpbmVkKVxuXG4gIGdldDogKHBhcmFtKSAtPlxuICAgIGF0b20uY29uZmlnLmdldChcIiN7QHNjb3BlfS4je3BhcmFtfVwiKVxuXG4gIHNldDogKHBhcmFtLCB2YWx1ZSkgLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCIje0BzY29wZX0uI3twYXJhbX1cIiwgdmFsdWUpXG5cbiAgdG9nZ2xlOiAocGFyYW0pIC0+XG4gICAgQHNldChwYXJhbSwgbm90IEBnZXQocGFyYW0pKVxuXG4gIG9ic2VydmU6IChwYXJhbSwgZm4pIC0+XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZShcIiN7QHNjb3BlfS4je3BhcmFtfVwiLCBmbilcblxuICBvYnNlcnZlQ29uZGl0aW9uYWxLZXltYXBzOiAtPlxuICAgIGNvbmRpdGlvbmFsS2V5bWFwcyA9XG4gICAgICBrZXltYXBVbmRlcnNjb3JlVG9SZXBsYWNlV2l0aFJlZ2lzdGVyOlxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnXyc6ICd2aW0tbW9kZS1wbHVzOnJlcGxhY2Utd2l0aC1yZWdpc3RlcidcbiAgICAgIGtleW1hcFBUb1B1dFdpdGhBdXRvSW5kZW50OlxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpOm5vdCgub3BlcmF0b3ItcGVuZGluZy1tb2RlKSc6XG4gICAgICAgICAgJ1AnOiAndmltLW1vZGUtcGx1czpwdXQtYmVmb3JlLXdpdGgtYXV0by1pbmRlbnQnXG4gICAgICAgICAgJ3AnOiAndmltLW1vZGUtcGx1czpwdXQtYWZ0ZXItd2l0aC1hdXRvLWluZGVudCdcbiAgICAgIGtleW1hcENDVG9DaGFuZ2VJbm5lclNtYXJ0V29yZDpcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5vcGVyYXRvci1wZW5kaW5nLW1vZGUuY2hhbmdlLXBlbmRpbmcnOlxuICAgICAgICAgICdjJzogJ3ZpbS1tb2RlLXBsdXM6aW5uZXItc21hcnQtd29yZCdcbiAgICAgIGtleW1hcFNlbWljb2xvblRvSW5uZXJBbnlQYWlySW5PcGVyYXRvclBlbmRpbmdNb2RlOlxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm9wZXJhdG9yLXBlbmRpbmctbW9kZSc6XG4gICAgICAgICAgJzsnOiAndmltLW1vZGUtcGx1czppbm5lci1hbnktcGFpcidcbiAgICAgIGtleW1hcFNlbWljb2xvblRvSW5uZXJBbnlQYWlySW5WaXN1YWxNb2RlOlxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLnZpc3VhbC1tb2RlJzpcbiAgICAgICAgICAnOyc6ICd2aW0tbW9kZS1wbHVzOmlubmVyLWFueS1wYWlyJ1xuICAgICAga2V5bWFwQmFja3NsYXNoVG9Jbm5lckNvbW1lbnRPclBhcmFncmFwaFdoZW5Ub2dnbGVMaW5lQ29tbWVudHNJc1BlbmRpbmc6XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMub3BlcmF0b3ItcGVuZGluZy1tb2RlLnRvZ2dsZS1saW5lLWNvbW1lbnRzLXBlbmRpbmcnOlxuICAgICAgICAgICcvJzogJ3ZpbS1tb2RlLXBsdXM6aW5uZXItY29tbWVudC1vci1wYXJhZ3JhcGgnXG5cbiAgICBvYnNlcnZlQ29uZGl0aW9uYWxLZXltYXAgPSAocGFyYW0pID0+XG4gICAgICBrZXltYXBTb3VyY2UgPSBcInZpbS1tb2RlLXBsdXMtY29uZGl0aW9uYWwta2V5bWFwOiN7cGFyYW19XCJcbiAgICAgIGRpc3Bvc2FibGUgPSBAb2JzZXJ2ZSBwYXJhbSwgKG5ld1ZhbHVlKSAtPlxuICAgICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICAgIGF0b20ua2V5bWFwcy5hZGQoa2V5bWFwU291cmNlLCBjb25kaXRpb25hbEtleW1hcHNbcGFyYW1dKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXRvbS5rZXltYXBzLnJlbW92ZUJpbmRpbmdzRnJvbVNvdXJjZShrZXltYXBTb3VyY2UpXG5cbiAgICAgIG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICAgIGF0b20ua2V5bWFwcy5yZW1vdmVCaW5kaW5nc0Zyb21Tb3VyY2Uoa2V5bWFwU291cmNlKVxuXG4gICAgIyBSZXR1cm4gZGlzcG9zYWxiZXMgdG8gZGlzcG9zZSBjb25maWcgb2JzZXJ2YXRpb24gYW5kIGNvbmRpdGlvbmFsIGtleW1hcC5cbiAgICByZXR1cm4gT2JqZWN0LmtleXMoY29uZGl0aW9uYWxLZXltYXBzKS5tYXAgKHBhcmFtKSAtPiBvYnNlcnZlQ29uZGl0aW9uYWxLZXltYXAocGFyYW0pXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzICd2aW0tbW9kZS1wbHVzJyxcbiAga2V5bWFwVW5kZXJzY29yZVRvUmVwbGFjZVdpdGhSZWdpc3RlcjpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBDYW46IGBfIGkgKGAgdG8gcmVwbGFjZSBpbm5lci1wYXJlbnRoZXNpcyB3aXRoIHJlZ2lzdGVyJ3MgdmFsdWU8YnI+XG4gICAgQ2FuOiBgXyBpIDtgIHRvIHJlcGxhY2UgaW5uZXItYW55LXBhaXIgaWYgeW91IGVuYWJsZWQgYGtleW1hcFNlbWljb2xvblRvSW5uZXJBbnlQYWlySW5PcGVyYXRvclBlbmRpbmdNb2RlYDxicj5cbiAgICBDb25mbGljdHM6IGBfYCggYG1vdmUtdG8tZmlyc3QtY2hhcmFjdGVyLW9mLWxpbmUtYW5kLWRvd25gICkgbW90aW9uLiBXaG8gdXNlIHRoaXM/P1xuICAgIFwiXCJcIlxuICBrZXltYXBQVG9QdXRXaXRoQXV0b0luZGVudDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBSZW1hcCBgcGAgYW5kIGBQYCB0byBhdXRvIGluZGVudCB2ZXJzaW9uLjxicj5cbiAgICBgcGAgcmVtYXBwZWQgdG8gYHB1dC1iZWZvcmUtd2l0aC1hdXRvLWluZGVudGAgZnJvbSBvcmlnaW5hbCBgcHV0LWJlZm9yZWA8YnI+XG4gICAgYFBgIHJlbWFwcGVkIHRvIGBwdXQtYWZ0ZXItd2l0aC1hdXRvLWluZGVudGAgZnJvbSBvcmlnaW5hbCBgcHV0LWFmdGVyYDxicj5cbiAgICBDb25mbGljdHM6IE9yaWdpbmFsIGBwdXQtYWZ0ZXJgIGFuZCBgcHV0LWJlZm9yZWAgYmVjb21lIHVuYXZhaWxhYmxlIHVubGVzcyB5b3Ugc2V0IGRpZmZlcmVudCBrZXltYXAgYnkgeW91cnNlbGYuXG4gICAgXCJcIlwiXG4gIGtleW1hcENDVG9DaGFuZ2VJbm5lclNtYXJ0V29yZDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBDYW46IGBjIGNgIHRvIGBjaGFuZ2UgaW5uZXItc21hcnQtd29yZGA8YnI+XG4gICAgQ29uZmxpY3RzOiBgYyBjYCggY2hhbmdlLWN1cnJlbnQtbGluZSApIGtleXN0cm9rZSB3aGljaCBpcyBlcXVpdmFsZW50IHRvIGBTYCBvciBgYyBpIGxgIGV0Yy5cbiAgICBcIlwiXCJcbiAga2V5bWFwU2VtaWNvbG9uVG9Jbm5lckFueVBhaXJJbk9wZXJhdG9yUGVuZGluZ01vZGU6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgQ2FuOiBgYyA7YCB0byBgY2hhbmdlIGlubmVyLWFueS1wYWlyYCwgQ29uZmxpY3RzIHdpdGggb3JpZ2luYWwgYDtgKCBgcmVwZWF0LWZpbmRgICkgbW90aW9uLjxicj5cbiAgICBDb25mbGljdHM6IGA7YCggYHJlcGVhdC1maW5kYCApLlxuICAgIFwiXCJcIlxuICBrZXltYXBTZW1pY29sb25Ub0lubmVyQW55UGFpckluVmlzdWFsTW9kZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBDYW46IGB2IDtgIHRvIGBzZWxlY3QgaW5uZXItYW55LXBhaXJgLCBDb25mbGljdHMgd2l0aCBvcmlnaW5hbCBgO2AoIGByZXBlYXQtZmluZGAgKSBtb3Rpb24uPGJyPkxcbiAgICBDb25mbGljdHM6IGA7YCggYHJlcGVhdC1maW5kYCApLlxuICAgIFwiXCJcIlxuICBrZXltYXBCYWNrc2xhc2hUb0lubmVyQ29tbWVudE9yUGFyYWdyYXBoV2hlblRvZ2dsZUxpbmVDb21tZW50c0lzUGVuZGluZzpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBDYW46IGBnIC8gL2AgdG8gY29tbWVudC1pbiBhbHJlYWR5IGNvbW1lbnRlZCByZWdpb24sIGBnIC8gL2AgdG8gY29tbWVudC1vdXQgcGFyYWdyYXBoLjxicj5cbiAgICBDb25mbGljdHM6IGAvYCggYHNlYXJjaGAgKSBtb3Rpb24gb25seSB3aGVuIGBnIC9gIGlzIHBlbmRpbmcuIHlvdSBubyBsb25nZSBjYW4gYGcgL2Agd2l0aCBzZWFyY2guXG4gICAgXCJcIlwiXG4gIHNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG86IHRydWVcbiAgc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkb1N0cmF0ZWd5OlxuICAgIGRlZmF1bHQ6ICdzbWFydCdcbiAgICBlbnVtOiBbJ3NtYXJ0JywgJ3NpbXBsZSddXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIFdoZW4geW91IHRoaW5rIHVuZG8vcmVkbyBjdXJzb3IgcG9zaXRpb24gaGFzIEJVRywgc2V0IHRoaXMgdG8gYHNpbXBsZWAuPGJyPlxuICAgIGBzbWFydGA6IEdvb2QgYWNjdXJhY3kgYnV0IGhhdmUgY3Vyc29yLW5vdC11cGRhdGVkLW9uLWRpZmZlcmVudC1lZGl0b3IgbGltaXRhdGlvbjxicj5cbiAgICBgc2ltcGxlYDogQWx3YXlzIHdvcmssIGJ1dCBhY2N1cmFjeSBpcyBub3QgYXMgZ29vZCBhcyBgc21hcnRgLjxicj5cbiAgICBcIlwiXCJcbiAgZ3JvdXBDaGFuZ2VzV2hlbkxlYXZpbmdJbnNlcnRNb2RlOiB0cnVlXG4gIHVzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyOiB0cnVlXG4gIGRvbnRVcGRhdGVSZWdpc3Rlck9uQ2hhbmdlT3JTdWJzdGl0dXRlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIFdoZW4gc2V0IHRvIGB0cnVlYCBhbnkgYGNoYW5nZWAgb3IgYHN1YnN0aXR1dGVgIG9wZXJhdGlvbiBubyBsb25nZXIgdXBkYXRlIHJlZ2lzdGVyIGNvbnRlbnQ8YnI+XG4gICAgQWZmZWN0cyBgY2AsIGBDYCwgYHNgLCBgU2Agb3BlcmF0b3IuXG4gICAgXCJcIlwiXG4gIHN0YXJ0SW5JbnNlcnRNb2RlOiBmYWxzZVxuICBzdGFydEluSW5zZXJ0TW9kZVNjb3BlczpcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOiB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiAnU3RhcnQgaW4gaW5zZXJ0LW1vZGUgd2hlbiBlZGl0b3JFbGVtZW50IG1hdGNoZXMgc2NvcGUnXG4gIGNsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlOiBmYWxzZVxuICBhdXRvU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbk9uT3BlcmF0ZTogdHJ1ZVxuICBhdXRvbWF0aWNhbGx5RXNjYXBlSW5zZXJ0TW9kZU9uQWN0aXZlUGFuZUl0ZW1DaGFuZ2U6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0VzY2FwZSBpbnNlcnQtbW9kZSBvbiB0YWIgc3dpdGNoLCBwYW5lIHN3aXRjaCdcbiAgd3JhcExlZnRSaWdodE1vdGlvbjogZmFsc2VcbiAgbnVtYmVyUmVnZXg6XG4gICAgZGVmYXVsdDogJy0/WzAtOV0rJ1xuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICAgIFVzZWQgdG8gZmluZCBudW1iZXIgaW4gY3RybC1hL2N0cmwteC48YnI+XG4gICAgICBUbyBpZ25vcmUgXCItXCIobWludXMpIGNoYXIgaW4gc3RyaW5nIGxpa2UgXCJpZGVudGlmaWVyLTFcIiB1c2UgYCg/OlxcXFxCLSk/WzAtOV0rYFxuICAgICAgXCJcIlwiXG4gIGNsZWFySGlnaGxpZ2h0U2VhcmNoT25SZXNldE5vcm1hbE1vZGU6XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiAnQ2xlYXIgaGlnaGxpZ2h0U2VhcmNoIG9uIGBlc2NhcGVgIGluIG5vcm1hbC1tb2RlJ1xuICBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25PblJlc2V0Tm9ybWFsTW9kZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246ICdDbGVhciBwZXJzaXN0ZW50U2VsZWN0aW9uIG9uIGBlc2NhcGVgIGluIG5vcm1hbC1tb2RlJ1xuICBjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQ6XG4gICAgZGVmYXVsdDogW11cbiAgICBpdGVtczogdHlwZTogJ3N0cmluZydcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgICBDb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBjaGFyYWN0ZXIsIHdoaWNoIGFkZCBzcGFjZSBhcm91bmQgc3Vycm91bmRlZCB0ZXh0Ljxicj5cbiAgICAgIEZvciB2aW0tc3Vycm91bmQgY29tcGF0aWJsZSBiZWhhdmlvciwgc2V0IGAoLCB7LCBbLCA8YC5cbiAgICAgIFwiXCJcIlxuICBpZ25vcmVDYXNlRm9yU2VhcmNoOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdGb3IgYC9gIGFuZCBgP2AnXG4gIHVzZVNtYXJ0Y2FzZUZvclNlYXJjaDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAvYCBhbmQgYD9gLiBPdmVycmlkZSBgaWdub3JlQ2FzZUZvclNlYXJjaGAnXG4gIGlnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAqYCBhbmQgYCNgLidcbiAgdXNlU21hcnRjYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQ6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0ZvciBgKmAgYW5kIGAjYC4gT3ZlcnJpZGUgYGlnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZGAnXG4gIGhpZ2hsaWdodFNlYXJjaDogdHJ1ZVxuICBoaWdobGlnaHRTZWFyY2hFeGNsdWRlU2NvcGVzOlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246ICdTdXBwcmVzcyBoaWdobGlnaHRTZWFyY2ggd2hlbiBhbnkgb2YgdGhlc2UgY2xhc3NlcyBhcmUgcHJlc2VudCBpbiB0aGUgZWRpdG9yJ1xuICBpbmNyZW1lbnRhbFNlYXJjaDogZmFsc2VcbiAgaW5jcmVtZW50YWxTZWFyY2hWaXNpdERpcmVjdGlvbjpcbiAgICBkZWZhdWx0OiAnYWJzb2x1dGUnXG4gICAgZW51bTogWydhYnNvbHV0ZScsICdyZWxhdGl2ZSddXG4gICAgZGVzY3JpcHRpb246IFwiV2hlbiBgcmVsYXRpdmVgLCBgdGFiYCwgYW5kIGBzaGlmdC10YWJgIHJlc3BlY3Qgc2VhcmNoIGRpcmVjdGlvbignLycgb3IgJz8nKVwiXG4gIHN0YXlPblRyYW5zZm9ybVN0cmluZzpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIFRyYW5zZm9ybVN0cmluZyBlLmcgdXBwZXItY2FzZSwgc3Vycm91bmRcIlxuICBzdGF5T25ZYW5rOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRG9uJ3QgbW92ZSBjdXJzb3IgYWZ0ZXIgeWFua1wiXG4gIHN0YXlPbkRlbGV0ZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIGRlbGV0ZVwiXG4gIHN0YXlPbk9jY3VycmVuY2U6XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIHdoZW4gb3BlcmF0b3Igd29ya3Mgb24gb2NjdXJyZW5jZXMoIHdoZW4gYHRydWVgLCBvdmVycmlkZSBvcGVyYXRvciBzcGVjaWZpYyBgc3RheU9uYCBvcHRpb25zIClcIlxuICBrZWVwQ29sdW1uT25TZWxlY3RUZXh0T2JqZWN0OlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiS2VlcCBjb2x1bW4gb24gc2VsZWN0IFRleHRPYmplY3QoUGFyYWdyYXBoLCBJbmRlbnRhdGlvbiwgRm9sZCwgRnVuY3Rpb24sIEVkZ2UpXCJcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPblZlcnRpY2FsTW90aW9uOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgICBBbG1vc3QgZXF1aXZhbGVudCB0byBgc3RhcnRvZmxpbmVgIHB1cmUtVmltIG9wdGlvbi4gV2hlbiB0cnVlLCBtb3ZlIGN1cnNvciB0byBmaXJzdCBjaGFyLjxicj5cbiAgICAgIEFmZmVjdHMgdG8gYGN0cmwtZiwgYiwgZCwgdWAsIGBHYCwgYEhgLCBgTWAsIGBMYCwgYGdnYDxicj5cbiAgICAgIFVubGlrZSBwdXJlLVZpbSwgYGRgLCBgPDxgLCBgPj5gIGFyZSBub3QgYWZmZWN0ZWQgYnkgdGhpcyBvcHRpb24sIHVzZSBpbmRlcGVuZGVudCBgc3RheU9uYCBvcHRpb25zLlxuICAgICAgXCJcIlwiXG4gIGZsYXNoT25VbmRvUmVkbzogdHJ1ZVxuICBmbGFzaE9uTW92ZVRvT2NjdXJyZW5jZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkFmZmVjdHMgbm9ybWFsLW1vZGUncyBgdGFiYCwgYHNoaWZ0LXRhYmAuXCJcbiAgZmxhc2hPbk9wZXJhdGU6IHRydWVcbiAgZmxhc2hPbk9wZXJhdGVCbGFja2xpc3Q6XG4gICAgZGVmYXVsdDogW11cbiAgICBpdGVtczogdHlwZTogJ3N0cmluZydcbiAgICBkZXNjcmlwdGlvbjogJ0NvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIG9wZXJhdG9yIGNsYXNzIG5hbWUgdG8gZGlzYWJsZSBmbGFzaCBlLmcuIFwieWFuaywgYXV0by1pbmRlbnRcIidcbiAgZmxhc2hPblNlYXJjaDogdHJ1ZVxuICBmbGFzaFNjcmVlbk9uU2VhcmNoSGFzTm9NYXRjaDogdHJ1ZVxuICBzaG93SG92ZXJTZWFyY2hDb3VudGVyOiBmYWxzZVxuICBzaG93SG92ZXJTZWFyY2hDb3VudGVyRHVyYXRpb246XG4gICAgZGVmYXVsdDogNzAwXG4gICAgZGVzY3JpcHRpb246IFwiRHVyYXRpb24obXNlYykgZm9yIGhvdmVyIHNlYXJjaCBjb3VudGVyXCJcbiAgaGlkZVRhYkJhck9uTWF4aW1pemVQYW5lOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogXCJJZiBzZXQgdG8gYGZhbHNlYCwgdGFiIHN0aWxsIHZpc2libGUgYWZ0ZXIgbWF4aW1pemUtcGFuZSggYGNtZC1lbnRlcmAgKVwiXG4gIGhpZGVTdGF0dXNCYXJPbk1heGltaXplUGFuZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gIHNtb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvbjpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkZvciBgY3RybC1mYCBhbmQgYGN0cmwtYmBcIlxuICBzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb25EdXJhdGlvbjpcbiAgICBkZWZhdWx0OiA1MDBcbiAgICBkZXNjcmlwdGlvbjogXCJTbW9vdGggc2Nyb2xsIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyBmb3IgYGN0cmwtZmAgYW5kIGBjdHJsLWJgXCJcbiAgc21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRm9yIGBjdHJsLWRgIGFuZCBgY3RybC11YFwiXG4gIHNtb290aFNjcm9sbE9uSGFsZlNjcm9sbE1vdGlvbkR1cmF0aW9uOlxuICAgIGRlZmF1bHQ6IDUwMFxuICAgIGRlc2NyaXB0aW9uOiBcIlNtb290aCBzY3JvbGwgZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIGZvciBgY3RybC1kYCBhbmQgYGN0cmwtdWBcIlxuICBzdGF0dXNCYXJNb2RlU3RyaW5nU3R5bGU6XG4gICAgZGVmYXVsdDogJ3Nob3J0J1xuICAgIGVudW06IFsnc2hvcnQnLCAnbG9uZyddXG4gIGRlYnVnOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiW0RldiB1c2VdXCJcbiAgc3RyaWN0QXNzZXJ0aW9uOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiW0RldiB1c2VdIHRvIGNhdGNoZSB3aXJlZCBzdGF0ZSBpbiB2bXAtZGV2LCBlbmFibGUgdGhpcyBpZiB5b3Ugd2FudCBoZWxwIG1lXCJcbiJdfQ==
