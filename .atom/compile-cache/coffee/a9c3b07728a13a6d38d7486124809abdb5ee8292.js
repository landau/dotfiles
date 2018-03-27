(function() {
  var Base, CompositeDisposable, Disposable, Emitter, VimState, forEachPaneAxis, globalState, paneUtils, ref, settings,
    slice = [].slice;

  ref = require('atom'), Disposable = ref.Disposable, Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  globalState = require('./global-state');

  settings = require('./settings');

  VimState = require('./vim-state');

  forEachPaneAxis = null;

  paneUtils = null;

  module.exports = {
    config: settings.config,
    getStatusBarManager: function() {
      return this.statusBarManager != null ? this.statusBarManager : this.statusBarManager = new (require('./status-bar-manager'));
    },
    activate: function(state) {
      var developer, getEditorState;
      this.subscriptions = new CompositeDisposable;
      this.emitter = new Emitter;
      getEditorState = this.getEditorState.bind(this);
      this.subscribe.apply(this, Base.init(getEditorState));
      this.registerCommands();
      this.registerVimStateCommands();
      settings.notifyDeprecatedParams();
      if (atom.inSpecMode()) {
        settings.set('strictAssertion', true);
      }
      if (atom.inDevMode()) {
        developer = new (require('./developer'));
        this.subscribe(developer.init(getEditorState));
      }
      this.subscribe(this.observeVimMode(function() {
        var message;
        message = "## Message by vim-mode-plus: vim-mode detected!\nTo use vim-mode-plus, you must **disable vim-mode** manually.";
        return atom.notifications.addWarning(message, {
          dismissable: true
        });
      }));
      this.subscribe(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          if (!editor.isMini()) {
            return _this.createVimState(editor);
          }
        };
      })(this)));
      this.subscribe(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          return _this.demaximizePane();
        };
      })(this)));
      this.subscribe(atom.workspace.onDidChangeActivePaneItem(function() {
        if (settings.get('automaticallyEscapeInsertModeOnActivePaneItemChange')) {
          return VimState.forEach(function(vimState) {
            if (vimState.mode === 'insert') {
              return vimState.activate('normal');
            }
          });
        }
      }));
      this.subscribe(atom.workspace.onDidStopChangingActivePaneItem((function(_this) {
        return function(item) {
          var ref1, vimState;
          if (atom.workspace.isTextEditor(item) && !item.isMini()) {
            vimState = _this.getEditorState(item);
            if (vimState == null) {
              return;
            }
            if (globalState.get('highlightSearchPattern')) {
              return vimState.highlightSearch.refresh();
            } else {
              return (ref1 = vimState.getProp('highlightSearch')) != null ? ref1.refresh() : void 0;
            }
          }
        };
      })(this)));
      this.subscribe(globalState.onDidChange(function(arg1) {
        var name, newValue;
        name = arg1.name, newValue = arg1.newValue;
        if (name === 'highlightSearchPattern') {
          if (newValue) {
            return VimState.forEach(function(vimState) {
              return vimState.highlightSearch.refresh();
            });
          } else {
            return VimState.forEach(function(vimState) {
              if (vimState.__highlightSearch) {
                return vimState.highlightSearch.clearMarkers();
              }
            });
          }
        }
      }));
      this.subscribe(settings.observe('highlightSearch', function(newValue) {
        if (newValue) {
          return globalState.set('highlightSearchPattern', globalState.get('lastSearchPattern'));
        } else {
          return globalState.set('highlightSearchPattern', null);
        }
      }));
      this.subscribe.apply(this, settings.observeConditionalKeymaps());
      if (settings.get('debug')) {
        return developer != null ? developer.reportRequireCache({
          excludeNodModules: false
        }) : void 0;
      }
    },
    observeVimMode: function(fn) {
      if (atom.packages.isPackageActive('vim-mode')) {
        fn();
      }
      return atom.packages.onDidActivatePackage(function(pack) {
        if (pack.name === 'vim-mode') {
          return fn();
        }
      });
    },
    onDidAddVimState: function(fn) {
      return this.emitter.on('did-add-vim-state', fn);
    },
    observeVimStates: function(fn) {
      if (VimState != null) {
        VimState.forEach(fn);
      }
      return this.onDidAddVimState(fn);
    },
    clearPersistentSelectionForEditors: function() {
      var editor, i, len, ref1, results;
      ref1 = atom.workspace.getTextEditors();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        editor = ref1[i];
        results.push(this.getEditorState(editor).clearPersistentSelections());
      }
      return results;
    },
    deactivate: function() {
      this.demaximizePane();
      this.subscriptions.dispose();
      if (VimState != null) {
        VimState.forEach(function(vimState) {
          return vimState.destroy();
        });
      }
      return VimState != null ? VimState.clear() : void 0;
    },
    subscribe: function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.subscriptions).add.apply(ref1, args);
    },
    unsubscribe: function(arg) {
      return this.subscriptions.remove(arg);
    },
    registerCommands: function() {
      this.subscribe(atom.commands.add('atom-text-editor:not([mini])', {
        'vim-mode-plus:clear-highlight-search': function() {
          return globalState.set('highlightSearchPattern', null);
        },
        'vim-mode-plus:toggle-highlight-search': function() {
          return settings.toggle('highlightSearch');
        },
        'vim-mode-plus:clear-persistent-selection': (function(_this) {
          return function() {
            return _this.clearPersistentSelectionForEditors();
          };
        })(this)
      }));
      return this.subscribe(atom.commands.add('atom-workspace', {
        "vim-mode-plus:maximize-pane": (function(_this) {
          return function() {
            return _this.maximizePane();
          };
        })(this),
        "vim-mode-plus:equalize-panes": (function(_this) {
          return function() {
            return _this.equalizePanes();
          };
        })(this),
        "vim-mode-plus:exchange-pane": (function(_this) {
          return function() {
            return _this.exchangePane();
          };
        })(this),
        "vim-mode-plus:move-pane-to-very-top": (function(_this) {
          return function() {
            return _this.movePaneToVery("top");
          };
        })(this),
        "vim-mode-plus:move-pane-to-very-bottom": (function(_this) {
          return function() {
            return _this.movePaneToVery("bottom");
          };
        })(this),
        "vim-mode-plus:move-pane-to-very-left": (function(_this) {
          return function() {
            return _this.movePaneToVery("left");
          };
        })(this),
        "vim-mode-plus:move-pane-to-very-right": (function(_this) {
          return function() {
            return _this.movePaneToVery("right");
          };
        })(this)
      }));
    },
    exchangePane: function() {
      if (paneUtils == null) {
        paneUtils = require("./pane-utils");
      }
      return paneUtils.exchangePane();
    },
    demaximizePane: function() {
      if (this.maximizePaneDisposable != null) {
        this.maximizePaneDisposable.dispose();
        return this.maximizePaneDisposable = null;
      }
    },
    maximizePane: function() {
      if (this.maximizePaneDisposable != null) {
        this.demaximizePane();
        return;
      }
      if (paneUtils == null) {
        paneUtils = require("./pane-utils");
      }
      return this.maximizePaneDisposable = paneUtils.maximizePane();
    },
    equalizePanes: function() {
      if (paneUtils == null) {
        paneUtils = require("./pane-utils");
      }
      return paneUtils.equalizePanes();
    },
    movePaneToVery: function(direction) {
      if (paneUtils == null) {
        paneUtils = require("./pane-utils");
      }
      return paneUtils.movePaneToVery(direction);
    },
    registerVimStateCommands: function() {
      var bindToVimState, char, chars, commands, fn1, getEditorState, i, j, len, results;
      commands = {
        'activate-normal-mode': function() {
          return this.activate('normal');
        },
        'activate-linewise-visual-mode': function() {
          return this.activate('visual', 'linewise');
        },
        'activate-characterwise-visual-mode': function() {
          return this.activate('visual', 'characterwise');
        },
        'activate-blockwise-visual-mode': function() {
          return this.activate('visual', 'blockwise');
        },
        'reset-normal-mode': function() {
          return this.resetNormalMode({
            userInvocation: true
          });
        },
        'set-register-name': function() {
          return this.register.setName();
        },
        'set-register-name-to-_': function() {
          return this.register.setName('_');
        },
        'set-register-name-to-*': function() {
          return this.register.setName('*');
        },
        'operator-modifier-characterwise': function() {
          return this.emitDidSetOperatorModifier({
            wise: 'characterwise'
          });
        },
        'operator-modifier-linewise': function() {
          return this.emitDidSetOperatorModifier({
            wise: 'linewise'
          });
        },
        'operator-modifier-occurrence': function() {
          return this.emitDidSetOperatorModifier({
            occurrence: true,
            occurrenceType: 'base'
          });
        },
        'operator-modifier-subword-occurrence': function() {
          return this.emitDidSetOperatorModifier({
            occurrence: true,
            occurrenceType: 'subword'
          });
        },
        'repeat': function() {
          return this.operationStack.runRecorded();
        },
        'repeat-find': function() {
          return this.operationStack.runCurrentFind();
        },
        'repeat-find-reverse': function() {
          return this.operationStack.runCurrentFind({
            reverse: true
          });
        },
        'repeat-search': function() {
          return this.operationStack.runCurrentSearch();
        },
        'repeat-search-reverse': function() {
          return this.operationStack.runCurrentSearch({
            reverse: true
          });
        },
        'set-count-0': function() {
          return this.setCount(0);
        },
        'set-count-1': function() {
          return this.setCount(1);
        },
        'set-count-2': function() {
          return this.setCount(2);
        },
        'set-count-3': function() {
          return this.setCount(3);
        },
        'set-count-4': function() {
          return this.setCount(4);
        },
        'set-count-5': function() {
          return this.setCount(5);
        },
        'set-count-6': function() {
          return this.setCount(6);
        },
        'set-count-7': function() {
          return this.setCount(7);
        },
        'set-count-8': function() {
          return this.setCount(8);
        },
        'set-count-9': function() {
          return this.setCount(9);
        }
      };
      chars = (function() {
        results = [];
        for (i = 32; i <= 126; i++){ results.push(i); }
        return results;
      }).apply(this).map(function(code) {
        return String.fromCharCode(code);
      });
      fn1 = function(char) {
        var charForKeymap;
        charForKeymap = char === ' ' ? 'space' : char;
        return commands["set-input-char-" + charForKeymap] = function() {
          return this.emitDidSetInputChar(char);
        };
      };
      for (j = 0, len = chars.length; j < len; j++) {
        char = chars[j];
        fn1(char);
      }
      getEditorState = this.getEditorState.bind(this);
      bindToVimState = function(oldCommands) {
        var fn, fn2, name, newCommands;
        newCommands = {};
        fn2 = function(fn) {
          return newCommands["vim-mode-plus:" + name] = function(event) {
            var vimState;
            event.stopPropagation();
            if (vimState = getEditorState(this.getModel())) {
              return fn.call(vimState, event);
            }
          };
        };
        for (name in oldCommands) {
          fn = oldCommands[name];
          fn2(fn);
        }
        return newCommands;
      };
      return this.subscribe(atom.commands.add('atom-text-editor:not([mini])', bindToVimState(commands)));
    },
    consumeStatusBar: function(statusBar) {
      var statusBarManager;
      statusBarManager = this.getStatusBarManager();
      statusBarManager.initialize(statusBar);
      statusBarManager.attach();
      return this.subscribe(new Disposable(function() {
        return statusBarManager.detach();
      }));
    },
    consumeDemoMode: function(arg1) {
      var onDidRemoveHover, onDidStart, onDidStop, onWillAddItem;
      onWillAddItem = arg1.onWillAddItem, onDidStart = arg1.onDidStart, onDidStop = arg1.onDidStop, onDidRemoveHover = arg1.onDidRemoveHover;
      return this.subscribe(onDidStart(function() {
        return globalState.set('demoModeIsActive', true);
      }), onDidStop(function() {
        return globalState.set('demoModeIsActive', false);
      }), onDidRemoveHover(this.destroyAllDemoModeFlasheMarkers.bind(this)), onWillAddItem((function(_this) {
        return function(arg2) {
          var commandElement, element, event, item;
          item = arg2.item, event = arg2.event;
          if (event.binding.command.startsWith('vim-mode-plus:')) {
            commandElement = item.getElementsByClassName('command')[0];
            commandElement.textContent = commandElement.textContent.replace(/^vim-mode-plus:/, '');
          }
          element = document.createElement('span');
          element.classList.add('kind', 'pull-right');
          element.textContent = _this.getKindForCommand(event.binding.command);
          return item.appendChild(element);
        };
      })(this)));
    },
    destroyAllDemoModeFlasheMarkers: function() {
      return VimState != null ? VimState.forEach(function(vimState) {
        return vimState.flashManager.destroyDemoModeMarkers();
      }) : void 0;
    },
    getKindForCommand: function(command) {
      var kind, ref1;
      if (command.startsWith('vim-mode-plus')) {
        command = command.replace(/^vim-mode-plus:/, '');
        if (command.startsWith('operator-modifier')) {
          return kind = 'op-modifier';
        } else {
          return (ref1 = Base.getKindForCommandName(command)) != null ? ref1 : 'vmp-other';
        }
      } else {
        return 'non-vmp';
      }
    },
    createVimState: function(editor) {
      var vimState;
      vimState = new VimState(editor, this.getStatusBarManager(), globalState);
      return this.emitter.emit('did-add-vim-state', vimState);
    },
    createVimStateIfNecessary: function(editor) {
      var vimState;
      if (VimState.has(editor)) {
        return;
      }
      vimState = new VimState(editor, this.getStatusBarManager(), globalState);
      return this.emitter.emit('did-add-vim-state', vimState);
    },
    getGlobalState: function() {
      return globalState;
    },
    getEditorState: function(editor) {
      return VimState.getByEditor(editor);
    },
    provideVimModePlus: function() {
      return {
        Base: Base,
        registerCommandFromSpec: Base.registerCommandFromSpec,
        getGlobalState: this.getGlobalState,
        getEditorState: this.getEditorState,
        observeVimStates: this.observeVimStates.bind(this),
        onDidAddVimState: this.onDidAddVimState.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGdIQUFBO0lBQUE7O0VBQUEsTUFBNkMsT0FBQSxDQUFRLE1BQVIsQ0FBN0MsRUFBQywyQkFBRCxFQUFhLHFCQUFiLEVBQXNCOztFQUV0QixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGVBQUEsR0FBa0I7O0VBQ2xCLFNBQUEsR0FBWTs7RUFFWixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUFRLFFBQVEsQ0FBQyxNQUFqQjtJQUVBLG1CQUFBLEVBQXFCLFNBQUE7NkNBQ25CLElBQUMsQ0FBQSxtQkFBRCxJQUFDLENBQUEsbUJBQW9CLElBQUksQ0FBQyxPQUFBLENBQVEsc0JBQVIsQ0FBRDtJQUROLENBRnJCO0lBS0EsUUFBQSxFQUFVLFNBQUMsS0FBRDtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLGNBQUEsR0FBaUIsSUFBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFxQixJQUFyQjtNQUNqQixJQUFDLENBQUEsU0FBRCxhQUFXLElBQUksQ0FBQyxJQUFMLENBQVUsY0FBVixDQUFYO01BQ0EsSUFBQyxDQUFBLGdCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsd0JBQUQsQ0FBQTtNQUVBLFFBQVEsQ0FBQyxzQkFBVCxDQUFBO01BRUEsSUFBRyxJQUFJLENBQUMsVUFBTCxDQUFBLENBQUg7UUFDRSxRQUFRLENBQUMsR0FBVCxDQUFhLGlCQUFiLEVBQWdD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QUFrQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FMbEI7O0lBRGtCLENBdFFwQjs7QUFWRiIsInNvdXJjZXNDb250ZW50IjpbIntEaXNwb3NhYmxlLCBFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5nbG9iYWxTdGF0ZSA9IHJlcXVpcmUgJy4vZ2xvYmFsLXN0YXRlJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuVmltU3RhdGUgPSByZXF1aXJlICcuL3ZpbS1zdGF0ZSdcbmZvckVhY2hQYW5lQXhpcyA9IG51bGxcbnBhbmVVdGlscyA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6IHNldHRpbmdzLmNvbmZpZ1xuXG4gIGdldFN0YXR1c0Jhck1hbmFnZXI6IC0+XG4gICAgQHN0YXR1c0Jhck1hbmFnZXIgPz0gbmV3IChyZXF1aXJlICcuL3N0YXR1cy1iYXItbWFuYWdlcicpXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgZ2V0RWRpdG9yU3RhdGUgPSBAZ2V0RWRpdG9yU3RhdGUuYmluZCh0aGlzKVxuICAgIEBzdWJzY3JpYmUoQmFzZS5pbml0KGdldEVkaXRvclN0YXRlKS4uLilcbiAgICBAcmVnaXN0ZXJDb21tYW5kcygpXG4gICAgQHJlZ2lzdGVyVmltU3RhdGVDb21tYW5kcygpXG5cbiAgICBzZXR0aW5ncy5ub3RpZnlEZXByZWNhdGVkUGFyYW1zKClcblxuICAgIGlmIGF0b20uaW5TcGVjTW9kZSgpXG4gICAgICBzZXR0aW5ncy5zZXQoJ3N0cmljdEFzc2VydGlvbicsIHRydWUpXG5cbiAgICBpZiBhdG9tLmluRGV2TW9kZSgpXG4gICAgICBkZXZlbG9wZXIgPSBuZXcgKHJlcXVpcmUgJy4vZGV2ZWxvcGVyJylcbiAgICAgIEBzdWJzY3JpYmUoZGV2ZWxvcGVyLmluaXQoZ2V0RWRpdG9yU3RhdGUpKVxuXG4gICAgQHN1YnNjcmliZSBAb2JzZXJ2ZVZpbU1vZGUgLT5cbiAgICAgIG1lc3NhZ2UgPSBcIlwiXCJcbiAgICAgICAgIyMgTWVzc2FnZSBieSB2aW0tbW9kZS1wbHVzOiB2aW0tbW9kZSBkZXRlY3RlZCFcbiAgICAgICAgVG8gdXNlIHZpbS1tb2RlLXBsdXMsIHlvdSBtdXN0ICoqZGlzYWJsZSB2aW0tbW9kZSoqIG1hbnVhbGx5LlxuICAgICAgICBcIlwiXCJcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1lc3NhZ2UsIGRpc21pc3NhYmxlOiB0cnVlKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIEBjcmVhdGVWaW1TdGF0ZShlZGl0b3IpIHVubGVzcyBlZGl0b3IuaXNNaW5pKClcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSA9PlxuICAgICAgQGRlbWF4aW1pemVQYW5lKClcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSAtPlxuICAgICAgaWYgc2V0dGluZ3MuZ2V0KCdhdXRvbWF0aWNhbGx5RXNjYXBlSW5zZXJ0TW9kZU9uQWN0aXZlUGFuZUl0ZW1DaGFuZ2UnKVxuICAgICAgICBWaW1TdGF0ZS5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgICAgICB2aW1TdGF0ZS5hY3RpdmF0ZSgnbm9ybWFsJykgaWYgdmltU3RhdGUubW9kZSBpcyAnaW5zZXJ0J1xuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vbkRpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtIChpdGVtKSA9PlxuICAgICAgaWYgYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKGl0ZW0pIGFuZCBub3QgaXRlbS5pc01pbmkoKVxuICAgICAgICAjIFN0aWxsIHRoZXJlIGlzIHBvc3NpYmlsaXR5IGVkaXRvciBpcyBkZXN0cm95ZWQgYW5kIGRvbid0IGhhdmUgY29ycmVzcG9uZGluZ1xuICAgICAgICAjIHZpbVN0YXRlICMxOTYuXG4gICAgICAgIHZpbVN0YXRlID0gQGdldEVkaXRvclN0YXRlKGl0ZW0pXG4gICAgICAgIHJldHVybiB1bmxlc3MgdmltU3RhdGU/XG4gICAgICAgIGlmIGdsb2JhbFN0YXRlLmdldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicpXG4gICAgICAgICAgdmltU3RhdGUuaGlnaGxpZ2h0U2VhcmNoLnJlZnJlc2goKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdmltU3RhdGUuZ2V0UHJvcCgnaGlnaGxpZ2h0U2VhcmNoJyk/LnJlZnJlc2goKVxuXG4gICAgIyBAc3Vic2NyaWJlICBnbG9iYWxTdGF0ZS5nZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nKVxuICAgICMgUmVmcmVzaCBoaWdobGlnaHQgYmFzZWQgb24gZ2xvYmFsU3RhdGUuaGlnaGxpZ2h0U2VhcmNoUGF0dGVybiBjaGFuZ2VzLlxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIEBzdWJzY3JpYmUgZ2xvYmFsU3RhdGUub25EaWRDaGFuZ2UgKHtuYW1lLCBuZXdWYWx1ZX0pIC0+XG4gICAgICBpZiBuYW1lIGlzICdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJ1xuICAgICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICAgIFZpbVN0YXRlLmZvckVhY2ggKHZpbVN0YXRlKSAtPlxuICAgICAgICAgICAgdmltU3RhdGUuaGlnaGxpZ2h0U2VhcmNoLnJlZnJlc2goKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgVmltU3RhdGUuZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICAgICAgICAjIGF2b2lkIHBvcHVsYXRlIHByb3AgdW5uZWNlc3NhcmlseSBvbiB2aW1TdGF0ZS5yZXNldCBvbiBzdGFydHVwXG4gICAgICAgICAgICBpZiB2aW1TdGF0ZS5fX2hpZ2hsaWdodFNlYXJjaFxuICAgICAgICAgICAgICB2aW1TdGF0ZS5oaWdobGlnaHRTZWFyY2guY2xlYXJNYXJrZXJzKClcblxuICAgIEBzdWJzY3JpYmUgc2V0dGluZ3Mub2JzZXJ2ZSAnaGlnaGxpZ2h0U2VhcmNoJywgKG5ld1ZhbHVlKSAtPlxuICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgIyBSZS1zZXR0aW5nIHZhbHVlIHRyaWdnZXIgaGlnaGxpZ2h0U2VhcmNoIHJlZnJlc2hcbiAgICAgICAgZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0U2VhcmNoUGF0dGVybicpKVxuICAgICAgZWxzZVxuICAgICAgICBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBudWxsKVxuXG4gICAgQHN1YnNjcmliZShzZXR0aW5ncy5vYnNlcnZlQ29uZGl0aW9uYWxLZXltYXBzKCkuLi4pXG5cbiAgICBpZiBzZXR0aW5ncy5nZXQoJ2RlYnVnJylcbiAgICAgIGRldmVsb3Blcj8ucmVwb3J0UmVxdWlyZUNhY2hlKGV4Y2x1ZGVOb2RNb2R1bGVzOiBmYWxzZSlcblxuICBvYnNlcnZlVmltTW9kZTogKGZuKSAtPlxuICAgIGZuKCkgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUoJ3ZpbS1tb2RlJylcbiAgICBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlIChwYWNrKSAtPlxuICAgICAgZm4oKSBpZiBwYWNrLm5hbWUgaXMgJ3ZpbS1tb2RlJ1xuXG4gICMgKiBgZm5gIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdoZW4gdmltU3RhdGUgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQuXG4gICMgIFVzYWdlOlxuICAjICAgb25EaWRBZGRWaW1TdGF0ZSAodmltU3RhdGUpIC0+IGRvIHNvbWV0aGluZy4uXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWRBZGRWaW1TdGF0ZTogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWFkZC12aW0tc3RhdGUnLCBmbilcblxuICAjICogYGZuYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aXRoIGFsbCBjdXJyZW50IGFuZCBmdXR1cmUgdmltU3RhdGVcbiAgIyAgVXNhZ2U6XG4gICMgICBvYnNlcnZlVmltU3RhdGVzICh2aW1TdGF0ZSkgLT4gZG8gc29tZXRoaW5nLi5cbiAgIyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvYnNlcnZlVmltU3RhdGVzOiAoZm4pIC0+XG4gICAgVmltU3RhdGU/LmZvckVhY2goZm4pXG4gICAgQG9uRGlkQWRkVmltU3RhdGUoZm4pXG5cbiAgY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uRm9yRWRpdG9yczogLT5cbiAgICBmb3IgZWRpdG9yIGluIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgIEBnZXRFZGl0b3JTdGF0ZShlZGl0b3IpLmNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbnMoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGRlbWF4aW1pemVQYW5lKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIFZpbVN0YXRlPy5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgIHZpbVN0YXRlLmRlc3Ryb3koKVxuICAgIFZpbVN0YXRlPy5jbGVhcigpXG5cbiAgc3Vic2NyaWJlOiAoYXJncy4uLikgLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoYXJncy4uLilcblxuICB1bnN1YnNjcmliZTogKGFyZykgLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUoYXJnKVxuXG4gIHJlZ2lzdGVyQ29tbWFuZHM6IC0+XG4gICAgQHN1YnNjcmliZSBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsXG4gICAgICAndmltLW1vZGUtcGx1czpjbGVhci1oaWdobGlnaHQtc2VhcmNoJzogLT4gZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbnVsbClcbiAgICAgICd2aW0tbW9kZS1wbHVzOnRvZ2dsZS1oaWdobGlnaHQtc2VhcmNoJzogLT4gc2V0dGluZ3MudG9nZ2xlKCdoaWdobGlnaHRTZWFyY2gnKVxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6Y2xlYXItcGVyc2lzdGVudC1zZWxlY3Rpb24nOiA9PiBAY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uRm9yRWRpdG9ycygpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICBcInZpbS1tb2RlLXBsdXM6bWF4aW1pemUtcGFuZVwiOiA9PiBAbWF4aW1pemVQYW5lKClcbiAgICAgIFwidmltLW1vZGUtcGx1czplcXVhbGl6ZS1wYW5lc1wiOiA9PiBAZXF1YWxpemVQYW5lcygpXG4gICAgICBcInZpbS1tb2RlLXBsdXM6ZXhjaGFuZ2UtcGFuZVwiOiA9PiBAZXhjaGFuZ2VQYW5lKClcbiAgICAgIFwidmltLW1vZGUtcGx1czptb3ZlLXBhbmUtdG8tdmVyeS10b3BcIjogPT4gQG1vdmVQYW5lVG9WZXJ5KFwidG9wXCIpXG4gICAgICBcInZpbS1tb2RlLXBsdXM6bW92ZS1wYW5lLXRvLXZlcnktYm90dG9tXCI6ID0+IEBtb3ZlUGFuZVRvVmVyeShcImJvdHRvbVwiKVxuICAgICAgXCJ2aW0tbW9kZS1wbHVzOm1vdmUtcGFuZS10by12ZXJ5LWxlZnRcIjogPT4gQG1vdmVQYW5lVG9WZXJ5KFwibGVmdFwiKVxuICAgICAgXCJ2aW0tbW9kZS1wbHVzOm1vdmUtcGFuZS10by12ZXJ5LXJpZ2h0XCI6ID0+IEBtb3ZlUGFuZVRvVmVyeShcInJpZ2h0XCIpXG5cbiAgZXhjaGFuZ2VQYW5lOiAtPlxuICAgIHBhbmVVdGlscyA/PSByZXF1aXJlKFwiLi9wYW5lLXV0aWxzXCIpXG4gICAgcGFuZVV0aWxzLmV4Y2hhbmdlUGFuZSgpXG5cbiAgZGVtYXhpbWl6ZVBhbmU6IC0+XG4gICAgaWYgQG1heGltaXplUGFuZURpc3Bvc2FibGU/XG4gICAgICBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlID0gbnVsbFxuXG4gIG1heGltaXplUGFuZTogLT5cbiAgICBpZiBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZT9cbiAgICAgIEBkZW1heGltaXplUGFuZSgpXG4gICAgICByZXR1cm5cblxuICAgIHBhbmVVdGlscyA/PSByZXF1aXJlKFwiLi9wYW5lLXV0aWxzXCIpXG4gICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUgPSBwYW5lVXRpbHMubWF4aW1pemVQYW5lKClcblxuICBlcXVhbGl6ZVBhbmVzOiAtPlxuICAgIHBhbmVVdGlscyA/PSByZXF1aXJlKFwiLi9wYW5lLXV0aWxzXCIpXG4gICAgcGFuZVV0aWxzLmVxdWFsaXplUGFuZXMoKVxuXG4gIG1vdmVQYW5lVG9WZXJ5OiAoZGlyZWN0aW9uKSAtPlxuICAgIHBhbmVVdGlscyA/PSByZXF1aXJlKFwiLi9wYW5lLXV0aWxzXCIpXG4gICAgcGFuZVV0aWxzLm1vdmVQYW5lVG9WZXJ5KGRpcmVjdGlvbilcblxuICByZWdpc3RlclZpbVN0YXRlQ29tbWFuZHM6IC0+XG4gICAgIyBhbGwgY29tbWFuZHMgaGVyZSBpcyBleGVjdXRlZCB3aXRoIGNvbnRleHQgd2hlcmUgJ3RoaXMnIGJvdW5kIHRvICd2aW1TdGF0ZSdcbiAgICBjb21tYW5kcyA9XG4gICAgICAnYWN0aXZhdGUtbm9ybWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ25vcm1hbCcpXG4gICAgICAnYWN0aXZhdGUtbGluZXdpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgICAnYWN0aXZhdGUtY2hhcmFjdGVyd2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnKVxuICAgICAgJ2FjdGl2YXRlLWJsb2Nrd2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICAncmVzZXQtbm9ybWFsLW1vZGUnOiAtPiBAcmVzZXROb3JtYWxNb2RlKHVzZXJJbnZvY2F0aW9uOiB0cnVlKVxuICAgICAgJ3NldC1yZWdpc3Rlci1uYW1lJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoKSAjIFwiXG4gICAgICAnc2V0LXJlZ2lzdGVyLW5hbWUtdG8tXyc6IC0+IEByZWdpc3Rlci5zZXROYW1lKCdfJylcbiAgICAgICdzZXQtcmVnaXN0ZXItbmFtZS10by0qJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoJyonKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLWNoYXJhY3Rlcndpc2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIod2lzZTogJ2NoYXJhY3Rlcndpc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLWxpbmV3aXNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKHdpc2U6ICdsaW5ld2lzZScpXG4gICAgICAnb3BlcmF0b3ItbW9kaWZpZXItb2NjdXJyZW5jZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcihvY2N1cnJlbmNlOiB0cnVlLCBvY2N1cnJlbmNlVHlwZTogJ2Jhc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLXN1YndvcmQtb2NjdXJyZW5jZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcihvY2N1cnJlbmNlOiB0cnVlLCBvY2N1cnJlbmNlVHlwZTogJ3N1YndvcmQnKVxuICAgICAgJ3JlcGVhdCc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5SZWNvcmRlZCgpXG4gICAgICAncmVwZWF0LWZpbmQnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudEZpbmQoKVxuICAgICAgJ3JlcGVhdC1maW5kLXJldmVyc2UnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudEZpbmQocmV2ZXJzZTogdHJ1ZSlcbiAgICAgICdyZXBlYXQtc2VhcmNoJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRTZWFyY2goKVxuICAgICAgJ3JlcGVhdC1zZWFyY2gtcmV2ZXJzZSc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50U2VhcmNoKHJldmVyc2U6IHRydWUpXG4gICAgICAnc2V0LWNvdW50LTAnOiAtPiBAc2V0Q291bnQoMClcbiAgICAgICdzZXQtY291bnQtMSc6IC0+IEBzZXRDb3VudCgxKVxuICAgICAgJ3NldC1jb3VudC0yJzogLT4gQHNldENvdW50KDIpXG4gICAgICAnc2V0LWNvdW50LTMnOiAtPiBAc2V0Q291bnQoMylcbiAgICAgICdzZXQtY291bnQtNCc6IC0+IEBzZXRDb3VudCg0KVxuICAgICAgJ3NldC1jb3VudC01JzogLT4gQHNldENvdW50KDUpXG4gICAgICAnc2V0LWNvdW50LTYnOiAtPiBAc2V0Q291bnQoNilcbiAgICAgICdzZXQtY291bnQtNyc6IC0+IEBzZXRDb3VudCg3KVxuICAgICAgJ3NldC1jb3VudC04JzogLT4gQHNldENvdW50KDgpXG4gICAgICAnc2V0LWNvdW50LTknOiAtPiBAc2V0Q291bnQoOSlcblxuICAgIGNoYXJzID0gWzMyLi4xMjZdLm1hcCAoY29kZSkgLT4gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKVxuICAgIGZvciBjaGFyIGluIGNoYXJzXG4gICAgICBkbyAoY2hhcikgLT5cbiAgICAgICAgY2hhckZvcktleW1hcCA9IGlmIGNoYXIgaXMgJyAnIHRoZW4gJ3NwYWNlJyBlbHNlIGNoYXJcbiAgICAgICAgY29tbWFuZHNbXCJzZXQtaW5wdXQtY2hhci0je2NoYXJGb3JLZXltYXB9XCJdID0gLT5cbiAgICAgICAgICBAZW1pdERpZFNldElucHV0Q2hhcihjaGFyKVxuXG4gICAgZ2V0RWRpdG9yU3RhdGUgPSBAZ2V0RWRpdG9yU3RhdGUuYmluZCh0aGlzKVxuXG4gICAgYmluZFRvVmltU3RhdGUgPSAob2xkQ29tbWFuZHMpIC0+XG4gICAgICBuZXdDb21tYW5kcyA9IHt9XG4gICAgICBmb3IgbmFtZSwgZm4gb2Ygb2xkQ29tbWFuZHNcbiAgICAgICAgZG8gKGZuKSAtPlxuICAgICAgICAgIG5ld0NvbW1hbmRzW1widmltLW1vZGUtcGx1czoje25hbWV9XCJdID0gKGV2ZW50KSAtPlxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIGlmIHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUoQGdldE1vZGVsKCkpXG4gICAgICAgICAgICAgIGZuLmNhbGwodmltU3RhdGUsIGV2ZW50KVxuICAgICAgbmV3Q29tbWFuZHNcblxuICAgIEBzdWJzY3JpYmUgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLCBiaW5kVG9WaW1TdGF0ZShjb21tYW5kcykpXG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKHN0YXR1c0JhcikgLT5cbiAgICBzdGF0dXNCYXJNYW5hZ2VyID0gQGdldFN0YXR1c0Jhck1hbmFnZXIoKVxuICAgIHN0YXR1c0Jhck1hbmFnZXIuaW5pdGlhbGl6ZShzdGF0dXNCYXIpXG4gICAgc3RhdHVzQmFyTWFuYWdlci5hdHRhY2goKVxuICAgIEBzdWJzY3JpYmUgbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgIHN0YXR1c0Jhck1hbmFnZXIuZGV0YWNoKClcblxuICBjb25zdW1lRGVtb01vZGU6ICh7b25XaWxsQWRkSXRlbSwgb25EaWRTdGFydCwgb25EaWRTdG9wLCBvbkRpZFJlbW92ZUhvdmVyfSkgLT5cbiAgICBAc3Vic2NyaWJlKFxuICAgICAgb25EaWRTdGFydCgtPiBnbG9iYWxTdGF0ZS5zZXQoJ2RlbW9Nb2RlSXNBY3RpdmUnLCB0cnVlKSlcbiAgICAgIG9uRGlkU3RvcCgtPiBnbG9iYWxTdGF0ZS5zZXQoJ2RlbW9Nb2RlSXNBY3RpdmUnLCBmYWxzZSkpXG4gICAgICBvbkRpZFJlbW92ZUhvdmVyKEBkZXN0cm95QWxsRGVtb01vZGVGbGFzaGVNYXJrZXJzLmJpbmQodGhpcykpXG4gICAgICBvbldpbGxBZGRJdGVtKCh7aXRlbSwgZXZlbnR9KSA9PlxuICAgICAgICBpZiBldmVudC5iaW5kaW5nLmNvbW1hbmQuc3RhcnRzV2l0aCgndmltLW1vZGUtcGx1czonKVxuICAgICAgICAgIGNvbW1hbmRFbGVtZW50ID0gaXRlbS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjb21tYW5kJylbMF1cbiAgICAgICAgICBjb21tYW5kRWxlbWVudC50ZXh0Q29udGVudCA9IGNvbW1hbmRFbGVtZW50LnRleHRDb250ZW50LnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sICcnKVxuXG4gICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdraW5kJywgJ3B1bGwtcmlnaHQnKVxuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gQGdldEtpbmRGb3JDb21tYW5kKGV2ZW50LmJpbmRpbmcuY29tbWFuZClcbiAgICAgICAgaXRlbS5hcHBlbmRDaGlsZChlbGVtZW50KVxuICAgICAgKVxuICAgIClcblxuICBkZXN0cm95QWxsRGVtb01vZGVGbGFzaGVNYXJrZXJzOiAtPlxuICAgIFZpbVN0YXRlPy5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgIHZpbVN0YXRlLmZsYXNoTWFuYWdlci5kZXN0cm95RGVtb01vZGVNYXJrZXJzKClcblxuICBnZXRLaW5kRm9yQ29tbWFuZDogKGNvbW1hbmQpIC0+XG4gICAgaWYgY29tbWFuZC5zdGFydHNXaXRoKCd2aW0tbW9kZS1wbHVzJylcbiAgICAgIGNvbW1hbmQgPSBjb21tYW5kLnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sICcnKVxuICAgICAgaWYgY29tbWFuZC5zdGFydHNXaXRoKCdvcGVyYXRvci1tb2RpZmllcicpXG4gICAgICAgIGtpbmQgPSAnb3AtbW9kaWZpZXInXG4gICAgICBlbHNlXG4gICAgICAgIEJhc2UuZ2V0S2luZEZvckNvbW1hbmROYW1lKGNvbW1hbmQpID8gJ3ZtcC1vdGhlcidcbiAgICBlbHNlXG4gICAgICAnbm9uLXZtcCdcblxuICBjcmVhdGVWaW1TdGF0ZTogKGVkaXRvcikgLT5cbiAgICB2aW1TdGF0ZSA9IG5ldyBWaW1TdGF0ZShlZGl0b3IsIEBnZXRTdGF0dXNCYXJNYW5hZ2VyKCksIGdsb2JhbFN0YXRlKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1hZGQtdmltLXN0YXRlJywgdmltU3RhdGUpXG5cbiAgY3JlYXRlVmltU3RhdGVJZk5lY2Vzc2FyeTogKGVkaXRvcikgLT5cbiAgICByZXR1cm4gaWYgVmltU3RhdGUuaGFzKGVkaXRvcilcbiAgICB2aW1TdGF0ZSA9IG5ldyBWaW1TdGF0ZShlZGl0b3IsIEBnZXRTdGF0dXNCYXJNYW5hZ2VyKCksIGdsb2JhbFN0YXRlKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1hZGQtdmltLXN0YXRlJywgdmltU3RhdGUpXG5cbiAgIyBTZXJ2aWNlIEFQSVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0R2xvYmFsU3RhdGU6IC0+XG4gICAgZ2xvYmFsU3RhdGVcblxuICBnZXRFZGl0b3JTdGF0ZTogKGVkaXRvcikgLT5cbiAgICBWaW1TdGF0ZS5nZXRCeUVkaXRvcihlZGl0b3IpXG5cbiAgcHJvdmlkZVZpbU1vZGVQbHVzOiAtPlxuICAgIEJhc2U6IEJhc2VcbiAgICByZWdpc3RlckNvbW1hbmRGcm9tU3BlYzogQmFzZS5yZWdpc3RlckNvbW1hbmRGcm9tU3BlY1xuICAgIGdldEdsb2JhbFN0YXRlOiBAZ2V0R2xvYmFsU3RhdGVcbiAgICBnZXRFZGl0b3JTdGF0ZTogQGdldEVkaXRvclN0YXRlXG4gICAgb2JzZXJ2ZVZpbVN0YXRlczogQG9ic2VydmVWaW1TdGF0ZXMuYmluZCh0aGlzKVxuICAgIG9uRGlkQWRkVmltU3RhdGU6IEBvbkRpZEFkZFZpbVN0YXRlLmJpbmQodGhpcylcbiJdfQ==
