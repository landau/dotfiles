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
    Settings.prototype.deprecatedParams = ['showCursorInVisualMode'];

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
      description: "Can: `_ i (` to replace inner-parenthesis with register's value<br>\nCan: `_ ;` to replace inner-any-pair if you enabled `keymapSemicolonToInnerAnyPairInOperatorPendingMode`<br>\nConflicts: `_`( `move-to-first-character-of-line-and-down` ) motion. Who use this??"
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
    maxFoldableIndentLevel: {
      "default": 20,
      minimum: 0,
      description: 'Folds which startRow exceed this level are not folded on `zm` and `zM`'
    },
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSOztFQUVmLFNBQUEsR0FBWSxTQUFDLEtBQUQ7QUFDVixZQUFBLEtBQUE7QUFBQSxZQUNPLE1BQU0sQ0FBQyxTQUFQLENBQWlCLEtBQWpCLENBRFA7ZUFDb0M7QUFEcEMsV0FFTyxPQUFPLEtBQVAsS0FBaUIsU0FGeEI7ZUFFdUM7QUFGdkMsV0FHTyxPQUFPLEtBQVAsS0FBaUIsUUFIeEI7ZUFHc0M7QUFIdEMsWUFJTyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQWQsQ0FKUDtlQUlpQztBQUpqQztFQURVOztFQU9OO3VCQUNKLGdCQUFBLEdBQWtCLENBQ2hCLHdCQURnQjs7dUJBR2xCLHNCQUFBLEdBQXdCLFNBQUE7QUFDdEIsVUFBQTtNQUFBLGdCQUFBLEdBQW1CLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxNQUFsQixDQUF5QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtpQkFBVyxLQUFDLENBQUEsR0FBRCxDQUFLLEtBQUw7UUFBWDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7TUFDbkIsSUFBVSxnQkFBZ0IsQ0FBQyxNQUFqQixLQUEyQixDQUFyQztBQUFBLGVBQUE7O01BRUEsT0FBQSxHQUFVLENBQ0wsSUFBQyxDQUFBLEtBQUYsR0FBUSxnQ0FERixFQUVSLHdDQUZRO0FBSVYsV0FBQSxrREFBQTs7UUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLEtBQUEsR0FBTSxLQUFOLEdBQVksR0FBekI7QUFBQTthQUVBLFlBQUEsR0FBZSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBYixDQUE5QixFQUNi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RGI7S0EzSkY7SUE2SkEsc0NBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsR0FBVDtNQUNBLFdBQUEsRUFBYSxrRUFEYjtLQTlKRjtJQWdLQSw4QkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO01BQ0EsV0FBQSxFQUFhLDJCQURiO0tBaktGO0lBbUtBLHNDQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEdBQVQ7TUFDQSxXQUFBLEVBQWEsa0VBRGI7S0FwS0Y7SUFzS0Esd0JBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FBVDtNQUNBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsTUFBVixDQUROO0tBdktGO0lBeUtBLEtBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSxXQURiO0tBMUtGO0lBNEtBLGVBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSw2RUFEYjtLQTdLRjtHQURtQjtBQXZHckIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5pbmZlclR5cGUgPSAodmFsdWUpIC0+XG4gIHN3aXRjaFxuICAgIHdoZW4gTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgdGhlbiAnaW50ZWdlcidcbiAgICB3aGVuIHR5cGVvZih2YWx1ZSkgaXMgJ2Jvb2xlYW4nIHRoZW4gJ2Jvb2xlYW4nXG4gICAgd2hlbiB0eXBlb2YodmFsdWUpIGlzICdzdHJpbmcnIHRoZW4gJ3N0cmluZydcbiAgICB3aGVuIEFycmF5LmlzQXJyYXkodmFsdWUpIHRoZW4gJ2FycmF5J1xuXG5jbGFzcyBTZXR0aW5nc1xuICBkZXByZWNhdGVkUGFyYW1zOiBbXG4gICAgJ3Nob3dDdXJzb3JJblZpc3VhbE1vZGUnXG4gIF1cbiAgbm90aWZ5RGVwcmVjYXRlZFBhcmFtczogLT5cbiAgICBkZXByZWNhdGVkUGFyYW1zID0gQGRlcHJlY2F0ZWRQYXJhbXMuZmlsdGVyKChwYXJhbSkgPT4gQGhhcyhwYXJhbSkpXG4gICAgcmV0dXJuIGlmIGRlcHJlY2F0ZWRQYXJhbXMubGVuZ3RoIGlzIDBcblxuICAgIGNvbnRlbnQgPSBbXG4gICAgICBcIiN7QHNjb3BlfTogQ29uZmlnIG9wdGlvbnMgZGVwcmVjYXRlZC4gIFwiLFxuICAgICAgXCJSZW1vdmUgZnJvbSB5b3VyIGBjb25uZmlnLmNzb25gIG5vdz8gIFwiXG4gICAgXVxuICAgIGNvbnRlbnQucHVzaCBcIi0gYCN7cGFyYW19YFwiIGZvciBwYXJhbSBpbiBkZXByZWNhdGVkUGFyYW1zXG5cbiAgICBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyBjb250ZW50LmpvaW4oXCJcXG5cIiksXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgYnV0dG9uczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJ1JlbW92ZSBBbGwnXG4gICAgICAgICAgb25EaWRDbGljazogPT5cbiAgICAgICAgICAgIEBkZWxldGUocGFyYW0pIGZvciBwYXJhbSBpbiBkZXByZWNhdGVkUGFyYW1zXG4gICAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICAgIH1cbiAgICAgIF1cblxuICBjb25zdHJ1Y3RvcjogKEBzY29wZSwgQGNvbmZpZykgLT5cbiAgICAjIEF1dG9tYXRpY2FsbHkgaW5mZXIgYW5kIGluamVjdCBgdHlwZWAgb2YgZWFjaCBjb25maWcgcGFyYW1ldGVyLlxuICAgICMgc2tpcCBpZiB2YWx1ZSB3aGljaCBhbGVhZHkgaGF2ZSBgdHlwZWAgZmllbGQuXG4gICAgIyBBbHNvIHRyYW5zbGF0ZSBiYXJlIGBib29sZWFuYCB2YWx1ZSB0byB7ZGVmYXVsdDogYGJvb2xlYW5gfSBvYmplY3RcbiAgICBmb3Iga2V5IGluIE9iamVjdC5rZXlzKEBjb25maWcpXG4gICAgICBpZiB0eXBlb2YoQGNvbmZpZ1trZXldKSBpcyAnYm9vbGVhbidcbiAgICAgICAgQGNvbmZpZ1trZXldID0ge2RlZmF1bHQ6IEBjb25maWdba2V5XX1cbiAgICAgIHVubGVzcyAodmFsdWUgPSBAY29uZmlnW2tleV0pLnR5cGU/XG4gICAgICAgIHZhbHVlLnR5cGUgPSBpbmZlclR5cGUodmFsdWUuZGVmYXVsdClcblxuICAgICMgW0NBVVRJT05dIGluamVjdGluZyBvcmRlciBwcm9wZXR5IHRvIHNldCBvcmRlciBzaG93biBhdCBzZXR0aW5nLXZpZXcgTVVTVC1DT01FLUxBU1QuXG4gICAgZm9yIG5hbWUsIGkgaW4gT2JqZWN0LmtleXMoQGNvbmZpZylcbiAgICAgIEBjb25maWdbbmFtZV0ub3JkZXIgPSBpXG5cbiAgaGFzOiAocGFyYW0pIC0+XG4gICAgcGFyYW0gb2YgYXRvbS5jb25maWcuZ2V0KEBzY29wZSlcblxuICBkZWxldGU6IChwYXJhbSkgLT5cbiAgICBAc2V0KHBhcmFtLCB1bmRlZmluZWQpXG5cbiAgZ2V0OiAocGFyYW0pIC0+XG4gICAgYXRvbS5jb25maWcuZ2V0KFwiI3tAc2NvcGV9LiN7cGFyYW19XCIpXG5cbiAgc2V0OiAocGFyYW0sIHZhbHVlKSAtPlxuICAgIGF0b20uY29uZmlnLnNldChcIiN7QHNjb3BlfS4je3BhcmFtfVwiLCB2YWx1ZSlcblxuICB0b2dnbGU6IChwYXJhbSkgLT5cbiAgICBAc2V0KHBhcmFtLCBub3QgQGdldChwYXJhbSkpXG5cbiAgb2JzZXJ2ZTogKHBhcmFtLCBmbikgLT5cbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFwiI3tAc2NvcGV9LiN7cGFyYW19XCIsIGZuKVxuXG4gIG9ic2VydmVDb25kaXRpb25hbEtleW1hcHM6IC0+XG4gICAgY29uZGl0aW9uYWxLZXltYXBzID1cbiAgICAgIGtleW1hcFVuZGVyc2NvcmVUb1JlcGxhY2VXaXRoUmVnaXN0ZXI6XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdfJzogJ3ZpbS1tb2RlLXBsdXM6cmVwbGFjZS13aXRoLXJlZ2lzdGVyJ1xuICAgICAga2V5bWFwUFRvUHV0V2l0aEF1dG9JbmRlbnQ6XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSk6bm90KC5vcGVyYXRvci1wZW5kaW5nLW1vZGUpJzpcbiAgICAgICAgICAnUCc6ICd2aW0tbW9kZS1wbHVzOnB1dC1iZWZvcmUtd2l0aC1hdXRvLWluZGVudCdcbiAgICAgICAgICAncCc6ICd2aW0tbW9kZS1wbHVzOnB1dC1hZnRlci13aXRoLWF1dG8taW5kZW50J1xuICAgICAga2V5bWFwQ0NUb0NoYW5nZUlubmVyU21hcnRXb3JkOlxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm9wZXJhdG9yLXBlbmRpbmctbW9kZS5jaGFuZ2UtcGVuZGluZyc6XG4gICAgICAgICAgJ2MnOiAndmltLW1vZGUtcGx1czppbm5lci1zbWFydC13b3JkJ1xuICAgICAga2V5bWFwU2VtaWNvbG9uVG9Jbm5lckFueVBhaXJJbk9wZXJhdG9yUGVuZGluZ01vZGU6XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMub3BlcmF0b3ItcGVuZGluZy1tb2RlJzpcbiAgICAgICAgICAnOyc6ICd2aW0tbW9kZS1wbHVzOmlubmVyLWFueS1wYWlyJ1xuICAgICAga2V5bWFwU2VtaWNvbG9uVG9Jbm5lckFueVBhaXJJblZpc3VhbE1vZGU6XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMudmlzdWFsLW1vZGUnOlxuICAgICAgICAgICc7JzogJ3ZpbS1tb2RlLXBsdXM6aW5uZXItYW55LXBhaXInXG4gICAgICBrZXltYXBCYWNrc2xhc2hUb0lubmVyQ29tbWVudE9yUGFyYWdyYXBoV2hlblRvZ2dsZUxpbmVDb21tZW50c0lzUGVuZGluZzpcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5vcGVyYXRvci1wZW5kaW5nLW1vZGUudG9nZ2xlLWxpbmUtY29tbWVudHMtcGVuZGluZyc6XG4gICAgICAgICAgJy8nOiAndmltLW1vZGUtcGx1czppbm5lci1jb21tZW50LW9yLXBhcmFncmFwaCdcblxuICAgIG9ic2VydmVDb25kaXRpb25hbEtleW1hcCA9IChwYXJhbSkgPT5cbiAgICAgIGtleW1hcFNvdXJjZSA9IFwidmltLW1vZGUtcGx1cy1jb25kaXRpb25hbC1rZXltYXA6I3twYXJhbX1cIlxuICAgICAgZGlzcG9zYWJsZSA9IEBvYnNlcnZlIHBhcmFtLCAobmV3VmFsdWUpIC0+XG4gICAgICAgIGlmIG5ld1ZhbHVlXG4gICAgICAgICAgYXRvbS5rZXltYXBzLmFkZChrZXltYXBTb3VyY2UsIGNvbmRpdGlvbmFsS2V5bWFwc1twYXJhbV0pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhdG9tLmtleW1hcHMucmVtb3ZlQmluZGluZ3NGcm9tU291cmNlKGtleW1hcFNvdXJjZSlcblxuICAgICAgbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgICAgYXRvbS5rZXltYXBzLnJlbW92ZUJpbmRpbmdzRnJvbVNvdXJjZShrZXltYXBTb3VyY2UpXG5cbiAgICAjIFJldHVybiBkaXNwb3NhbGJlcyB0byBkaXNwb3NlIGNvbmZpZyBvYnNlcnZhdGlvbiBhbmQgY29uZGl0aW9uYWwga2V5bWFwLlxuICAgIHJldHVybiBPYmplY3Qua2V5cyhjb25kaXRpb25hbEtleW1hcHMpLm1hcCAocGFyYW0pIC0+IG9ic2VydmVDb25kaXRpb25hbEtleW1hcChwYXJhbSlcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MgJ3ZpbS1tb2RlLXBsdXMnLFxuICBrZXltYXBVbmRlcnNjb3JlVG9SZXBsYWNlV2l0aFJlZ2lzdGVyOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIENhbjogYF8gaSAoYCB0byByZXBsYWNlIGlubmVyLXBhcmVudGhlc2lzIHdpdGggcmVnaXN0ZXIncyB2YWx1ZTxicj5cbiAgICBDYW46IGBfIDtgIHRvIHJlcGxhY2UgaW5uZXItYW55LXBhaXIgaWYgeW91IGVuYWJsZWQgYGtleW1hcFNlbWljb2xvblRvSW5uZXJBbnlQYWlySW5PcGVyYXRvclBlbmRpbmdNb2RlYDxicj5cbiAgICBDb25mbGljdHM6IGBfYCggYG1vdmUtdG8tZmlyc3QtY2hhcmFjdGVyLW9mLWxpbmUtYW5kLWRvd25gICkgbW90aW9uLiBXaG8gdXNlIHRoaXM/P1xuICAgIFwiXCJcIlxuICBrZXltYXBQVG9QdXRXaXRoQXV0b0luZGVudDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBSZW1hcCBgcGAgYW5kIGBQYCB0byBhdXRvIGluZGVudCB2ZXJzaW9uLjxicj5cbiAgICBgcGAgcmVtYXBwZWQgdG8gYHB1dC1iZWZvcmUtd2l0aC1hdXRvLWluZGVudGAgZnJvbSBvcmlnaW5hbCBgcHV0LWJlZm9yZWA8YnI+XG4gICAgYFBgIHJlbWFwcGVkIHRvIGBwdXQtYWZ0ZXItd2l0aC1hdXRvLWluZGVudGAgZnJvbSBvcmlnaW5hbCBgcHV0LWFmdGVyYDxicj5cbiAgICBDb25mbGljdHM6IE9yaWdpbmFsIGBwdXQtYWZ0ZXJgIGFuZCBgcHV0LWJlZm9yZWAgYmVjb21lIHVuYXZhaWxhYmxlIHVubGVzcyB5b3Ugc2V0IGRpZmZlcmVudCBrZXltYXAgYnkgeW91cnNlbGYuXG4gICAgXCJcIlwiXG4gIGtleW1hcENDVG9DaGFuZ2VJbm5lclNtYXJ0V29yZDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBDYW46IGBjIGNgIHRvIGBjaGFuZ2UgaW5uZXItc21hcnQtd29yZGA8YnI+XG4gICAgQ29uZmxpY3RzOiBgYyBjYCggY2hhbmdlLWN1cnJlbnQtbGluZSApIGtleXN0cm9rZSB3aGljaCBpcyBlcXVpdmFsZW50IHRvIGBTYCBvciBgYyBpIGxgIGV0Yy5cbiAgICBcIlwiXCJcbiAga2V5bWFwU2VtaWNvbG9uVG9Jbm5lckFueVBhaXJJbk9wZXJhdG9yUGVuZGluZ01vZGU6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgQ2FuOiBgYyA7YCB0byBgY2hhbmdlIGlubmVyLWFueS1wYWlyYCwgQ29uZmxpY3RzIHdpdGggb3JpZ2luYWwgYDtgKCBgcmVwZWF0LWZpbmRgICkgbW90aW9uLjxicj5cbiAgICBDb25mbGljdHM6IGA7YCggYHJlcGVhdC1maW5kYCApLlxuICAgIFwiXCJcIlxuICBrZXltYXBTZW1pY29sb25Ub0lubmVyQW55UGFpckluVmlzdWFsTW9kZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBDYW46IGB2IDtgIHRvIGBzZWxlY3QgaW5uZXItYW55LXBhaXJgLCBDb25mbGljdHMgd2l0aCBvcmlnaW5hbCBgO2AoIGByZXBlYXQtZmluZGAgKSBtb3Rpb24uPGJyPkxcbiAgICBDb25mbGljdHM6IGA7YCggYHJlcGVhdC1maW5kYCApLlxuICAgIFwiXCJcIlxuICBrZXltYXBCYWNrc2xhc2hUb0lubmVyQ29tbWVudE9yUGFyYWdyYXBoV2hlblRvZ2dsZUxpbmVDb21tZW50c0lzUGVuZGluZzpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBDYW46IGBnIC8gL2AgdG8gY29tbWVudC1pbiBhbHJlYWR5IGNvbW1lbnRlZCByZWdpb24sIGBnIC8gL2AgdG8gY29tbWVudC1vdXQgcGFyYWdyYXBoLjxicj5cbiAgICBDb25mbGljdHM6IGAvYCggYHNlYXJjaGAgKSBtb3Rpb24gb25seSB3aGVuIGBnIC9gIGlzIHBlbmRpbmcuIHlvdSBubyBsb25nZSBjYW4gYGcgL2Agd2l0aCBzZWFyY2guXG4gICAgXCJcIlwiXG4gIHNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG86IHRydWVcbiAgc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkb1N0cmF0ZWd5OlxuICAgIGRlZmF1bHQ6ICdzbWFydCdcbiAgICBlbnVtOiBbJ3NtYXJ0JywgJ3NpbXBsZSddXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIFdoZW4geW91IHRoaW5rIHVuZG8vcmVkbyBjdXJzb3IgcG9zaXRpb24gaGFzIEJVRywgc2V0IHRoaXMgdG8gYHNpbXBsZWAuPGJyPlxuICAgIGBzbWFydGA6IEdvb2QgYWNjdXJhY3kgYnV0IGhhdmUgY3Vyc29yLW5vdC11cGRhdGVkLW9uLWRpZmZlcmVudC1lZGl0b3IgbGltaXRhdGlvbjxicj5cbiAgICBgc2ltcGxlYDogQWx3YXlzIHdvcmssIGJ1dCBhY2N1cmFjeSBpcyBub3QgYXMgZ29vZCBhcyBgc21hcnRgLjxicj5cbiAgICBcIlwiXCJcbiAgZ3JvdXBDaGFuZ2VzV2hlbkxlYXZpbmdJbnNlcnRNb2RlOiB0cnVlXG4gIHVzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyOiB0cnVlXG4gIGRvbnRVcGRhdGVSZWdpc3Rlck9uQ2hhbmdlT3JTdWJzdGl0dXRlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIFdoZW4gc2V0IHRvIGB0cnVlYCBhbnkgYGNoYW5nZWAgb3IgYHN1YnN0aXR1dGVgIG9wZXJhdGlvbiBubyBsb25nZXIgdXBkYXRlIHJlZ2lzdGVyIGNvbnRlbnQ8YnI+XG4gICAgQWZmZWN0cyBgY2AsIGBDYCwgYHNgLCBgU2Agb3BlcmF0b3IuXG4gICAgXCJcIlwiXG4gIHN0YXJ0SW5JbnNlcnRNb2RlOiBmYWxzZVxuICBzdGFydEluSW5zZXJ0TW9kZVNjb3BlczpcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOiB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiAnU3RhcnQgaW4gaW5zZXJ0LW1vZGUgd2hlbiBlZGl0b3JFbGVtZW50IG1hdGNoZXMgc2NvcGUnXG4gIGNsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlOiBmYWxzZVxuICBhdXRvU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbk9uT3BlcmF0ZTogdHJ1ZVxuICBhdXRvbWF0aWNhbGx5RXNjYXBlSW5zZXJ0TW9kZU9uQWN0aXZlUGFuZUl0ZW1DaGFuZ2U6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0VzY2FwZSBpbnNlcnQtbW9kZSBvbiB0YWIgc3dpdGNoLCBwYW5lIHN3aXRjaCdcbiAgd3JhcExlZnRSaWdodE1vdGlvbjogZmFsc2VcbiAgbnVtYmVyUmVnZXg6XG4gICAgZGVmYXVsdDogJy0/WzAtOV0rJ1xuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICAgIFVzZWQgdG8gZmluZCBudW1iZXIgaW4gY3RybC1hL2N0cmwteC48YnI+XG4gICAgICBUbyBpZ25vcmUgXCItXCIobWludXMpIGNoYXIgaW4gc3RyaW5nIGxpa2UgXCJpZGVudGlmaWVyLTFcIiB1c2UgYCg/OlxcXFxCLSk/WzAtOV0rYFxuICAgICAgXCJcIlwiXG4gIGNsZWFySGlnaGxpZ2h0U2VhcmNoT25SZXNldE5vcm1hbE1vZGU6XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiAnQ2xlYXIgaGlnaGxpZ2h0U2VhcmNoIG9uIGBlc2NhcGVgIGluIG5vcm1hbC1tb2RlJ1xuICBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25PblJlc2V0Tm9ybWFsTW9kZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246ICdDbGVhciBwZXJzaXN0ZW50U2VsZWN0aW9uIG9uIGBlc2NhcGVgIGluIG5vcm1hbC1tb2RlJ1xuICBjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQ6XG4gICAgZGVmYXVsdDogW11cbiAgICBpdGVtczogdHlwZTogJ3N0cmluZydcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgICBDb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBjaGFyYWN0ZXIsIHdoaWNoIGFkZCBzcGFjZSBhcm91bmQgc3Vycm91bmRlZCB0ZXh0Ljxicj5cbiAgICAgIEZvciB2aW0tc3Vycm91bmQgY29tcGF0aWJsZSBiZWhhdmlvciwgc2V0IGAoLCB7LCBbLCA8YC5cbiAgICAgIFwiXCJcIlxuICBpZ25vcmVDYXNlRm9yU2VhcmNoOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdGb3IgYC9gIGFuZCBgP2AnXG4gIHVzZVNtYXJ0Y2FzZUZvclNlYXJjaDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAvYCBhbmQgYD9gLiBPdmVycmlkZSBgaWdub3JlQ2FzZUZvclNlYXJjaGAnXG4gIGlnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAqYCBhbmQgYCNgLidcbiAgdXNlU21hcnRjYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQ6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0ZvciBgKmAgYW5kIGAjYC4gT3ZlcnJpZGUgYGlnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZGAnXG4gIGhpZ2hsaWdodFNlYXJjaDogdHJ1ZVxuICBoaWdobGlnaHRTZWFyY2hFeGNsdWRlU2NvcGVzOlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246ICdTdXBwcmVzcyBoaWdobGlnaHRTZWFyY2ggd2hlbiBhbnkgb2YgdGhlc2UgY2xhc3NlcyBhcmUgcHJlc2VudCBpbiB0aGUgZWRpdG9yJ1xuICBpbmNyZW1lbnRhbFNlYXJjaDogZmFsc2VcbiAgaW5jcmVtZW50YWxTZWFyY2hWaXNpdERpcmVjdGlvbjpcbiAgICBkZWZhdWx0OiAnYWJzb2x1dGUnXG4gICAgZW51bTogWydhYnNvbHV0ZScsICdyZWxhdGl2ZSddXG4gICAgZGVzY3JpcHRpb246IFwiV2hlbiBgcmVsYXRpdmVgLCBgdGFiYCwgYW5kIGBzaGlmdC10YWJgIHJlc3BlY3Qgc2VhcmNoIGRpcmVjdGlvbignLycgb3IgJz8nKVwiXG4gIHN0YXlPblRyYW5zZm9ybVN0cmluZzpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIFRyYW5zZm9ybVN0cmluZyBlLmcgdXBwZXItY2FzZSwgc3Vycm91bmRcIlxuICBzdGF5T25ZYW5rOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRG9uJ3QgbW92ZSBjdXJzb3IgYWZ0ZXIgeWFua1wiXG4gIHN0YXlPbkRlbGV0ZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIGRlbGV0ZVwiXG4gIHN0YXlPbk9jY3VycmVuY2U6XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIHdoZW4gb3BlcmF0b3Igd29ya3Mgb24gb2NjdXJyZW5jZXMoIHdoZW4gYHRydWVgLCBvdmVycmlkZSBvcGVyYXRvciBzcGVjaWZpYyBgc3RheU9uYCBvcHRpb25zIClcIlxuICBrZWVwQ29sdW1uT25TZWxlY3RUZXh0T2JqZWN0OlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiS2VlcCBjb2x1bW4gb24gc2VsZWN0IFRleHRPYmplY3QoUGFyYWdyYXBoLCBJbmRlbnRhdGlvbiwgRm9sZCwgRnVuY3Rpb24sIEVkZ2UpXCJcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPblZlcnRpY2FsTW90aW9uOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgICBBbG1vc3QgZXF1aXZhbGVudCB0byBgc3RhcnRvZmxpbmVgIHB1cmUtVmltIG9wdGlvbi4gV2hlbiB0cnVlLCBtb3ZlIGN1cnNvciB0byBmaXJzdCBjaGFyLjxicj5cbiAgICAgIEFmZmVjdHMgdG8gYGN0cmwtZiwgYiwgZCwgdWAsIGBHYCwgYEhgLCBgTWAsIGBMYCwgYGdnYDxicj5cbiAgICAgIFVubGlrZSBwdXJlLVZpbSwgYGRgLCBgPDxgLCBgPj5gIGFyZSBub3QgYWZmZWN0ZWQgYnkgdGhpcyBvcHRpb24sIHVzZSBpbmRlcGVuZGVudCBgc3RheU9uYCBvcHRpb25zLlxuICAgICAgXCJcIlwiXG4gIGZsYXNoT25VbmRvUmVkbzogdHJ1ZVxuICBmbGFzaE9uTW92ZVRvT2NjdXJyZW5jZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkFmZmVjdHMgbm9ybWFsLW1vZGUncyBgdGFiYCwgYHNoaWZ0LXRhYmAuXCJcbiAgZmxhc2hPbk9wZXJhdGU6IHRydWVcbiAgZmxhc2hPbk9wZXJhdGVCbGFja2xpc3Q6XG4gICAgZGVmYXVsdDogW11cbiAgICBpdGVtczogdHlwZTogJ3N0cmluZydcbiAgICBkZXNjcmlwdGlvbjogJ0NvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIG9wZXJhdG9yIGNsYXNzIG5hbWUgdG8gZGlzYWJsZSBmbGFzaCBlLmcuIFwieWFuaywgYXV0by1pbmRlbnRcIidcbiAgZmxhc2hPblNlYXJjaDogdHJ1ZVxuICBmbGFzaFNjcmVlbk9uU2VhcmNoSGFzTm9NYXRjaDogdHJ1ZVxuICBtYXhGb2xkYWJsZUluZGVudExldmVsOlxuICAgIGRlZmF1bHQ6IDIwXG4gICAgbWluaW11bTogMFxuICAgIGRlc2NyaXB0aW9uOiAnRm9sZHMgd2hpY2ggc3RhcnRSb3cgZXhjZWVkIHRoaXMgbGV2ZWwgYXJlIG5vdCBmb2xkZWQgb24gYHptYCBhbmQgYHpNYCdcbiAgc2hvd0hvdmVyU2VhcmNoQ291bnRlcjogZmFsc2VcbiAgc2hvd0hvdmVyU2VhcmNoQ291bnRlckR1cmF0aW9uOlxuICAgIGRlZmF1bHQ6IDcwMFxuICAgIGRlc2NyaXB0aW9uOiBcIkR1cmF0aW9uKG1zZWMpIGZvciBob3ZlciBzZWFyY2ggY291bnRlclwiXG4gIGhpZGVUYWJCYXJPbk1heGltaXplUGFuZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246IFwiSWYgc2V0IHRvIGBmYWxzZWAsIHRhYiBzdGlsbCB2aXNpYmxlIGFmdGVyIG1heGltaXplLXBhbmUoIGBjbWQtZW50ZXJgIClcIlxuICBoaWRlU3RhdHVzQmFyT25NYXhpbWl6ZVBhbmU6XG4gICAgZGVmYXVsdDogdHJ1ZVxuICBzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb246XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJGb3IgYGN0cmwtZmAgYW5kIGBjdHJsLWJgXCJcbiAgc21vb3RoU2Nyb2xsT25GdWxsU2Nyb2xsTW90aW9uRHVyYXRpb246XG4gICAgZGVmYXVsdDogNTAwXG4gICAgZGVzY3JpcHRpb246IFwiU21vb3RoIHNjcm9sbCBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgZm9yIGBjdHJsLWZgIGFuZCBgY3RybC1iYFwiXG4gIHNtb290aFNjcm9sbE9uSGFsZlNjcm9sbE1vdGlvbjpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkZvciBgY3RybC1kYCBhbmQgYGN0cmwtdWBcIlxuICBzbW9vdGhTY3JvbGxPbkhhbGZTY3JvbGxNb3Rpb25EdXJhdGlvbjpcbiAgICBkZWZhdWx0OiA1MDBcbiAgICBkZXNjcmlwdGlvbjogXCJTbW9vdGggc2Nyb2xsIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyBmb3IgYGN0cmwtZGAgYW5kIGBjdHJsLXVgXCJcbiAgc3RhdHVzQmFyTW9kZVN0cmluZ1N0eWxlOlxuICAgIGRlZmF1bHQ6ICdzaG9ydCdcbiAgICBlbnVtOiBbJ3Nob3J0JywgJ2xvbmcnXVxuICBkZWJ1ZzpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIltEZXYgdXNlXVwiXG4gIHN0cmljdEFzc2VydGlvbjpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIltEZXYgdXNlXSB0byBjYXRjaGUgd2lyZWQgc3RhdGUgaW4gdm1wLWRldiwgZW5hYmxlIHRoaXMgaWYgeW91IHdhbnQgaGVscCBtZVwiXG4iXX0=
