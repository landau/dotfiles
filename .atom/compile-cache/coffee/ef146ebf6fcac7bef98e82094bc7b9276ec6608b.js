(function() {
  var Base, CompositeDisposable, Disposable, Emitter, VimState, forEachPaneAxis, globalState, ref, settings,
    slice = [].slice;

  ref = require('atom'), Disposable = ref.Disposable, Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  globalState = require('./global-state');

  settings = require('./settings');

  VimState = require('./vim-state');

  forEachPaneAxis = null;

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
          var ref1;
          if (atom.workspace.isTextEditor(item) && !item.isMini()) {
            return (ref1 = _this.getEditorState(item)) != null ? ref1.highlightSearch.refresh() : void 0;
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
        'vim-mode-plus:maximize-pane': (function(_this) {
          return function() {
            return _this.maximizePane();
          };
        })(this),
        'vim-mode-plus:equalize-panes': (function(_this) {
          return function() {
            return _this.equalizePanes();
          };
        })(this)
      }));
    },
    demaximizePane: function() {
      if (this.maximizePaneDisposable != null) {
        this.maximizePaneDisposable.dispose();
        this.unsubscribe(this.maximizePaneDisposable);
        return this.maximizePaneDisposable = null;
      }
    },
    maximizePane: function() {
      var classActivePaneAxis, classHideStatusBar, classHideTabBar, classPaneMaximized, getView, paneElement, ref1, workspaceClassNames, workspaceElement;
      if (this.maximizePaneDisposable != null) {
        this.demaximizePane();
        return;
      }
      getView = function(model) {
        return atom.views.getView(model);
      };
      classPaneMaximized = 'vim-mode-plus--pane-maximized';
      classHideTabBar = 'vim-mode-plus--hide-tab-bar';
      classHideStatusBar = 'vim-mode-plus--hide-status-bar';
      classActivePaneAxis = 'vim-mode-plus--active-pane-axis';
      workspaceElement = getView(atom.workspace);
      paneElement = getView(atom.workspace.getActivePane());
      workspaceClassNames = [classPaneMaximized];
      if (settings.get('hideTabBarOnMaximizePane')) {
        workspaceClassNames.push(classHideTabBar);
      }
      if (settings.get('hideStatusBarOnMaximizePane')) {
        workspaceClassNames.push(classHideStatusBar);
      }
      (ref1 = workspaceElement.classList).add.apply(ref1, workspaceClassNames);
      if (forEachPaneAxis == null) {
        forEachPaneAxis = require('./utils').forEachPaneAxis;
      }
      forEachPaneAxis(function(axis) {
        var paneAxisElement;
        paneAxisElement = getView(axis);
        if (paneAxisElement.contains(paneElement)) {
          return paneAxisElement.classList.add(classActivePaneAxis);
        }
      });
      this.maximizePaneDisposable = new Disposable(function() {
        var ref2;
        forEachPaneAxis(function(axis) {
          return getView(axis).classList.remove(classActivePaneAxis);
        });
        return (ref2 = workspaceElement.classList).remove.apply(ref2, workspaceClassNames);
      });
      return this.subscribe(this.maximizePaneDisposable);
    },
    equalizePanes: function() {
      var setFlexScale;
      setFlexScale = function(newValue, base) {
        var child, i, len, ref1, ref2, results;
        if (base == null) {
          base = atom.workspace.getActivePane().getContainer().getRoot();
        }
        base.setFlexScale(newValue);
        ref2 = (ref1 = base.children) != null ? ref1 : [];
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          child = ref2[i];
          results.push(setFlexScale(newValue, child));
        }
        return results;
      };
      return setFlexScale(1);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFHQUFBO0lBQUE7O0VBQUEsTUFBNkMsT0FBQSxDQUFRLE1BQVIsQ0FBN0MsRUFBQywyQkFBRCxFQUFhLHFCQUFiLEVBQXNCOztFQUV0QixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGVBQUEsR0FBa0I7O0VBRWxCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQVEsUUFBUSxDQUFDLE1BQWpCO0lBRUEsbUJBQUEsRUFBcUIsU0FBQTs2Q0FDbkIsSUFBQyxDQUFBLG1CQUFELElBQUMsQ0FBQSxtQkFBb0IsSUFBSSxDQUFDLE9BQUEsQ0FBUSxzQkFBUixDQUFEO0lBRE4sQ0FGckI7SUFLQSxRQUFBLEVBQVUsU0FBQyxLQUFEO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BRWYsY0FBQSxHQUFpQixJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLElBQXJCO01BQ2pCLElBQUMsQ0FBQSxTQUFELGFBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxjQUFWLENBQVg7TUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSx3QkFBRCxDQUFBO01BRUEsUUFBUSxDQUFDLHNCQUFULENBQUE7TUFFQSxJQUFHLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBSDtRQUNFLFFBQVEsQ0FBQyxHQUFULENBQWEsaUJBQWIsRUFBZ0MsSUFBaEMs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TUFBckI7SUFEYyxDQTlRaEI7SUFpUkEsa0JBQUEsRUFBb0IsU0FBQTthQUNsQjtRQUFBLElBQUEsRUFBTSxJQUFOO1FBQ0EsdUJBQUEsRUFBeUIsSUFBSSxDQUFDLHVCQUQ5QjtRQUVBLGNBQUEsRUFBZ0IsSUFBQyxDQUFBLGNBRmpCO1FBR0EsY0FBQSxFQUFnQixJQUFDLENBQUEsY0FIakI7UUFJQSxnQkFBQSxFQUFrQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FKbEI7UUFLQSxnQkFBQSxFQUFrQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FMbEI7O0lBRGtCLENBalJwQjs7QUFURiIsInNvdXJjZXNDb250ZW50IjpbIntEaXNwb3NhYmxlLCBFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5nbG9iYWxTdGF0ZSA9IHJlcXVpcmUgJy4vZ2xvYmFsLXN0YXRlJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuVmltU3RhdGUgPSByZXF1aXJlICcuL3ZpbS1zdGF0ZSdcbmZvckVhY2hQYW5lQXhpcyA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6IHNldHRpbmdzLmNvbmZpZ1xuXG4gIGdldFN0YXR1c0Jhck1hbmFnZXI6IC0+XG4gICAgQHN0YXR1c0Jhck1hbmFnZXIgPz0gbmV3IChyZXF1aXJlICcuL3N0YXR1cy1iYXItbWFuYWdlcicpXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgZ2V0RWRpdG9yU3RhdGUgPSBAZ2V0RWRpdG9yU3RhdGUuYmluZCh0aGlzKVxuICAgIEBzdWJzY3JpYmUoQmFzZS5pbml0KGdldEVkaXRvclN0YXRlKS4uLilcbiAgICBAcmVnaXN0ZXJDb21tYW5kcygpXG4gICAgQHJlZ2lzdGVyVmltU3RhdGVDb21tYW5kcygpXG5cbiAgICBzZXR0aW5ncy5ub3RpZnlEZXByZWNhdGVkUGFyYW1zKClcblxuICAgIGlmIGF0b20uaW5TcGVjTW9kZSgpXG4gICAgICBzZXR0aW5ncy5zZXQoJ3N0cmljdEFzc2VydGlvbicsIHRydWUpXG5cbiAgICBpZiBhdG9tLmluRGV2TW9kZSgpXG4gICAgICBkZXZlbG9wZXIgPSBuZXcgKHJlcXVpcmUgJy4vZGV2ZWxvcGVyJylcbiAgICAgIEBzdWJzY3JpYmUoZGV2ZWxvcGVyLmluaXQoZ2V0RWRpdG9yU3RhdGUpKVxuXG4gICAgQHN1YnNjcmliZSBAb2JzZXJ2ZVZpbU1vZGUgLT5cbiAgICAgIG1lc3NhZ2UgPSBcIlwiXCJcbiAgICAgICAgIyMgTWVzc2FnZSBieSB2aW0tbW9kZS1wbHVzOiB2aW0tbW9kZSBkZXRlY3RlZCFcbiAgICAgICAgVG8gdXNlIHZpbS1tb2RlLXBsdXMsIHlvdSBtdXN0ICoqZGlzYWJsZSB2aW0tbW9kZSoqIG1hbnVhbGx5LlxuICAgICAgICBcIlwiXCJcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1lc3NhZ2UsIGRpc21pc3NhYmxlOiB0cnVlKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIEBjcmVhdGVWaW1TdGF0ZShlZGl0b3IpIHVubGVzcyBlZGl0b3IuaXNNaW5pKClcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSA9PlxuICAgICAgQGRlbWF4aW1pemVQYW5lKClcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSAtPlxuICAgICAgaWYgc2V0dGluZ3MuZ2V0KCdhdXRvbWF0aWNhbGx5RXNjYXBlSW5zZXJ0TW9kZU9uQWN0aXZlUGFuZUl0ZW1DaGFuZ2UnKVxuICAgICAgICBWaW1TdGF0ZS5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgICAgICB2aW1TdGF0ZS5hY3RpdmF0ZSgnbm9ybWFsJykgaWYgdmltU3RhdGUubW9kZSBpcyAnaW5zZXJ0J1xuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vbkRpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtIChpdGVtKSA9PlxuICAgICAgaWYgYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKGl0ZW0pIGFuZCBub3QgaXRlbS5pc01pbmkoKVxuICAgICAgICAjIFN0aWxsIHRoZXJlIGlzIHBvc3NpYmlsaXR5IGVkaXRvciBpcyBkZXN0cm95ZWQgYW5kIGRvbid0IGhhdmUgY29ycmVzcG9uZGluZ1xuICAgICAgICAjIHZpbVN0YXRlICMxOTYuXG4gICAgICAgIEBnZXRFZGl0b3JTdGF0ZShpdGVtKT8uaGlnaGxpZ2h0U2VhcmNoLnJlZnJlc2goKVxuXG4gICAgIyBAc3Vic2NyaWJlICBnbG9iYWxTdGF0ZS5nZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nKVxuICAgICMgUmVmcmVzaCBoaWdobGlnaHQgYmFzZWQgb24gZ2xvYmFsU3RhdGUuaGlnaGxpZ2h0U2VhcmNoUGF0dGVybiBjaGFuZ2VzLlxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIEBzdWJzY3JpYmUgZ2xvYmFsU3RhdGUub25EaWRDaGFuZ2UgKHtuYW1lLCBuZXdWYWx1ZX0pIC0+XG4gICAgICBpZiBuYW1lIGlzICdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJ1xuICAgICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICAgIFZpbVN0YXRlLmZvckVhY2ggKHZpbVN0YXRlKSAtPlxuICAgICAgICAgICAgdmltU3RhdGUuaGlnaGxpZ2h0U2VhcmNoLnJlZnJlc2goKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgVmltU3RhdGUuZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICAgICAgICAjIGF2b2lkIHBvcHVsYXRlIHByb3AgdW5uZWNlc3NhcmlseSBvbiB2aW1TdGF0ZS5yZXNldCBvbiBzdGFydHVwXG4gICAgICAgICAgICBpZiB2aW1TdGF0ZS5fX2hpZ2hsaWdodFNlYXJjaFxuICAgICAgICAgICAgICB2aW1TdGF0ZS5oaWdobGlnaHRTZWFyY2guY2xlYXJNYXJrZXJzKClcblxuICAgIEBzdWJzY3JpYmUgc2V0dGluZ3Mub2JzZXJ2ZSAnaGlnaGxpZ2h0U2VhcmNoJywgKG5ld1ZhbHVlKSAtPlxuICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgIyBSZS1zZXR0aW5nIHZhbHVlIHRyaWdnZXIgaGlnaGxpZ2h0U2VhcmNoIHJlZnJlc2hcbiAgICAgICAgZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0U2VhcmNoUGF0dGVybicpKVxuICAgICAgZWxzZVxuICAgICAgICBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBudWxsKVxuXG4gICAgQHN1YnNjcmliZShzZXR0aW5ncy5vYnNlcnZlQ29uZGl0aW9uYWxLZXltYXBzKCkuLi4pXG4gICAgXG4gICAgaWYgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpXG4gICAgICBkZXZlbG9wZXI/LnJlcG9ydFJlcXVpcmVDYWNoZShleGNsdWRlTm9kTW9kdWxlczogZmFsc2UpXG5cbiAgb2JzZXJ2ZVZpbU1vZGU6IChmbikgLT5cbiAgICBmbigpIGlmIGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKCd2aW0tbW9kZScpXG4gICAgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSAocGFjaykgLT5cbiAgICAgIGZuKCkgaWYgcGFjay5uYW1lIGlzICd2aW0tbW9kZSdcblxuICAjICogYGZuYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHZpbVN0YXRlIGluc3RhbmNlIHdhcyBjcmVhdGVkLlxuICAjICBVc2FnZTpcbiAgIyAgIG9uRGlkQWRkVmltU3RhdGUgKHZpbVN0YXRlKSAtPiBkbyBzb21ldGhpbmcuLlxuICAjIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9uRGlkQWRkVmltU3RhdGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1hZGQtdmltLXN0YXRlJywgZm4pXG5cbiAgIyAqIGBmbmAge0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2l0aCBhbGwgY3VycmVudCBhbmQgZnV0dXJlIHZpbVN0YXRlXG4gICMgIFVzYWdlOlxuICAjICAgb2JzZXJ2ZVZpbVN0YXRlcyAodmltU3RhdGUpIC0+IGRvIHNvbWV0aGluZy4uXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb2JzZXJ2ZVZpbVN0YXRlczogKGZuKSAtPlxuICAgIFZpbVN0YXRlPy5mb3JFYWNoKGZuKVxuICAgIEBvbkRpZEFkZFZpbVN0YXRlKGZuKVxuXG4gIGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbkZvckVkaXRvcnM6IC0+XG4gICAgZm9yIGVkaXRvciBpbiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpXG4gICAgICBAZ2V0RWRpdG9yU3RhdGUoZWRpdG9yKS5jbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25zKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIFZpbVN0YXRlPy5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgIHZpbVN0YXRlLmRlc3Ryb3koKVxuICAgIFZpbVN0YXRlPy5jbGVhcigpXG5cbiAgc3Vic2NyaWJlOiAoYXJncy4uLikgLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoYXJncy4uLilcblxuICB1bnN1YnNjcmliZTogKGFyZykgLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUoYXJnKVxuXG4gIHJlZ2lzdGVyQ29tbWFuZHM6IC0+XG4gICAgQHN1YnNjcmliZSBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsXG4gICAgICAndmltLW1vZGUtcGx1czpjbGVhci1oaWdobGlnaHQtc2VhcmNoJzogLT4gZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbnVsbClcbiAgICAgICd2aW0tbW9kZS1wbHVzOnRvZ2dsZS1oaWdobGlnaHQtc2VhcmNoJzogLT4gc2V0dGluZ3MudG9nZ2xlKCdoaWdobGlnaHRTZWFyY2gnKVxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6Y2xlYXItcGVyc2lzdGVudC1zZWxlY3Rpb24nOiA9PiBAY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uRm9yRWRpdG9ycygpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAndmltLW1vZGUtcGx1czptYXhpbWl6ZS1wYW5lJzogPT4gQG1heGltaXplUGFuZSgpXG4gICAgICAndmltLW1vZGUtcGx1czplcXVhbGl6ZS1wYW5lcyc6ID0+IEBlcXVhbGl6ZVBhbmVzKClcblxuICBkZW1heGltaXplUGFuZTogLT5cbiAgICBpZiBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZT9cbiAgICAgIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgQHVuc3Vic2NyaWJlKEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlKVxuICAgICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUgPSBudWxsXG5cbiAgbWF4aW1pemVQYW5lOiAtPlxuICAgIGlmIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlP1xuICAgICAgQGRlbWF4aW1pemVQYW5lKClcbiAgICAgIHJldHVyblxuXG4gICAgZ2V0VmlldyA9IChtb2RlbCkgLT4gYXRvbS52aWV3cy5nZXRWaWV3KG1vZGVsKVxuICAgIGNsYXNzUGFuZU1heGltaXplZCA9ICd2aW0tbW9kZS1wbHVzLS1wYW5lLW1heGltaXplZCdcbiAgICBjbGFzc0hpZGVUYWJCYXIgPSAndmltLW1vZGUtcGx1cy0taGlkZS10YWItYmFyJ1xuICAgIGNsYXNzSGlkZVN0YXR1c0JhciA9ICd2aW0tbW9kZS1wbHVzLS1oaWRlLXN0YXR1cy1iYXInXG4gICAgY2xhc3NBY3RpdmVQYW5lQXhpcyA9ICd2aW0tbW9kZS1wbHVzLS1hY3RpdmUtcGFuZS1heGlzJ1xuXG4gICAgd29ya3NwYWNlRWxlbWVudCA9IGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgcGFuZUVsZW1lbnQgPSBnZXRWaWV3KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKSlcblxuICAgIHdvcmtzcGFjZUNsYXNzTmFtZXMgPSBbY2xhc3NQYW5lTWF4aW1pemVkXVxuICAgIHdvcmtzcGFjZUNsYXNzTmFtZXMucHVzaChjbGFzc0hpZGVUYWJCYXIpIGlmIHNldHRpbmdzLmdldCgnaGlkZVRhYkJhck9uTWF4aW1pemVQYW5lJylcbiAgICB3b3Jrc3BhY2VDbGFzc05hbWVzLnB1c2goY2xhc3NIaWRlU3RhdHVzQmFyKSBpZiBzZXR0aW5ncy5nZXQoJ2hpZGVTdGF0dXNCYXJPbk1heGltaXplUGFuZScpXG5cbiAgICB3b3Jrc3BhY2VFbGVtZW50LmNsYXNzTGlzdC5hZGQod29ya3NwYWNlQ2xhc3NOYW1lcy4uLilcblxuICAgIGZvckVhY2hQYW5lQXhpcyA/PSByZXF1aXJlKCcuL3V0aWxzJykuZm9yRWFjaFBhbmVBeGlzXG4gICAgZm9yRWFjaFBhbmVBeGlzIChheGlzKSAtPlxuICAgICAgcGFuZUF4aXNFbGVtZW50ID0gZ2V0VmlldyhheGlzKVxuICAgICAgaWYgcGFuZUF4aXNFbGVtZW50LmNvbnRhaW5zKHBhbmVFbGVtZW50KVxuICAgICAgICBwYW5lQXhpc0VsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc0FjdGl2ZVBhbmVBeGlzKVxuXG4gICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZSAtPlxuICAgICAgZm9yRWFjaFBhbmVBeGlzIChheGlzKSAtPlxuICAgICAgICBnZXRWaWV3KGF4aXMpLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NBY3RpdmVQYW5lQXhpcylcbiAgICAgIHdvcmtzcGFjZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSh3b3Jrc3BhY2VDbGFzc05hbWVzLi4uKVxuXG4gICAgQHN1YnNjcmliZShAbWF4aW1pemVQYW5lRGlzcG9zYWJsZSlcblxuICBlcXVhbGl6ZVBhbmVzOiAtPlxuICAgIHNldEZsZXhTY2FsZSA9IChuZXdWYWx1ZSwgYmFzZSkgLT5cbiAgICAgIGJhc2UgPz0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmdldENvbnRhaW5lcigpLmdldFJvb3QoKVxuICAgICAgYmFzZS5zZXRGbGV4U2NhbGUobmV3VmFsdWUpXG4gICAgICBmb3IgY2hpbGQgaW4gYmFzZS5jaGlsZHJlbiA/IFtdXG4gICAgICAgIHNldEZsZXhTY2FsZShuZXdWYWx1ZSwgY2hpbGQpXG5cbiAgICBzZXRGbGV4U2NhbGUoMSlcblxuICByZWdpc3RlclZpbVN0YXRlQ29tbWFuZHM6IC0+XG4gICAgIyBhbGwgY29tbWFuZHMgaGVyZSBpcyBleGVjdXRlZCB3aXRoIGNvbnRleHQgd2hlcmUgJ3RoaXMnIGJvdW5kIHRvICd2aW1TdGF0ZSdcbiAgICBjb21tYW5kcyA9XG4gICAgICAnYWN0aXZhdGUtbm9ybWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ25vcm1hbCcpXG4gICAgICAnYWN0aXZhdGUtbGluZXdpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgICAnYWN0aXZhdGUtY2hhcmFjdGVyd2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnKVxuICAgICAgJ2FjdGl2YXRlLWJsb2Nrd2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICAncmVzZXQtbm9ybWFsLW1vZGUnOiAtPiBAcmVzZXROb3JtYWxNb2RlKHVzZXJJbnZvY2F0aW9uOiB0cnVlKVxuICAgICAgJ3NldC1yZWdpc3Rlci1uYW1lJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoKSAjIFwiXG4gICAgICAnc2V0LXJlZ2lzdGVyLW5hbWUtdG8tXyc6IC0+IEByZWdpc3Rlci5zZXROYW1lKCdfJylcbiAgICAgICdzZXQtcmVnaXN0ZXItbmFtZS10by0qJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoJyonKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLWNoYXJhY3Rlcndpc2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIod2lzZTogJ2NoYXJhY3Rlcndpc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLWxpbmV3aXNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKHdpc2U6ICdsaW5ld2lzZScpXG4gICAgICAnb3BlcmF0b3ItbW9kaWZpZXItb2NjdXJyZW5jZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcihvY2N1cnJlbmNlOiB0cnVlLCBvY2N1cnJlbmNlVHlwZTogJ2Jhc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLXN1YndvcmQtb2NjdXJyZW5jZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcihvY2N1cnJlbmNlOiB0cnVlLCBvY2N1cnJlbmNlVHlwZTogJ3N1YndvcmQnKVxuICAgICAgJ3JlcGVhdCc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5SZWNvcmRlZCgpXG4gICAgICAncmVwZWF0LWZpbmQnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudEZpbmQoKVxuICAgICAgJ3JlcGVhdC1maW5kLXJldmVyc2UnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudEZpbmQocmV2ZXJzZTogdHJ1ZSlcbiAgICAgICdyZXBlYXQtc2VhcmNoJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRTZWFyY2goKVxuICAgICAgJ3JlcGVhdC1zZWFyY2gtcmV2ZXJzZSc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50U2VhcmNoKHJldmVyc2U6IHRydWUpXG4gICAgICAnc2V0LWNvdW50LTAnOiAtPiBAc2V0Q291bnQoMClcbiAgICAgICdzZXQtY291bnQtMSc6IC0+IEBzZXRDb3VudCgxKVxuICAgICAgJ3NldC1jb3VudC0yJzogLT4gQHNldENvdW50KDIpXG4gICAgICAnc2V0LWNvdW50LTMnOiAtPiBAc2V0Q291bnQoMylcbiAgICAgICdzZXQtY291bnQtNCc6IC0+IEBzZXRDb3VudCg0KVxuICAgICAgJ3NldC1jb3VudC01JzogLT4gQHNldENvdW50KDUpXG4gICAgICAnc2V0LWNvdW50LTYnOiAtPiBAc2V0Q291bnQoNilcbiAgICAgICdzZXQtY291bnQtNyc6IC0+IEBzZXRDb3VudCg3KVxuICAgICAgJ3NldC1jb3VudC04JzogLT4gQHNldENvdW50KDgpXG4gICAgICAnc2V0LWNvdW50LTknOiAtPiBAc2V0Q291bnQoOSlcblxuICAgIGNoYXJzID0gWzMyLi4xMjZdLm1hcCAoY29kZSkgLT4gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKVxuICAgIGZvciBjaGFyIGluIGNoYXJzXG4gICAgICBkbyAoY2hhcikgLT5cbiAgICAgICAgY2hhckZvcktleW1hcCA9IGlmIGNoYXIgaXMgJyAnIHRoZW4gJ3NwYWNlJyBlbHNlIGNoYXJcbiAgICAgICAgY29tbWFuZHNbXCJzZXQtaW5wdXQtY2hhci0je2NoYXJGb3JLZXltYXB9XCJdID0gLT5cbiAgICAgICAgICBAZW1pdERpZFNldElucHV0Q2hhcihjaGFyKVxuXG4gICAgZ2V0RWRpdG9yU3RhdGUgPSBAZ2V0RWRpdG9yU3RhdGUuYmluZCh0aGlzKVxuXG4gICAgYmluZFRvVmltU3RhdGUgPSAob2xkQ29tbWFuZHMpIC0+XG4gICAgICBuZXdDb21tYW5kcyA9IHt9XG4gICAgICBmb3IgbmFtZSwgZm4gb2Ygb2xkQ29tbWFuZHNcbiAgICAgICAgZG8gKGZuKSAtPlxuICAgICAgICAgIG5ld0NvbW1hbmRzW1widmltLW1vZGUtcGx1czoje25hbWV9XCJdID0gKGV2ZW50KSAtPlxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIGlmIHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUoQGdldE1vZGVsKCkpXG4gICAgICAgICAgICAgIGZuLmNhbGwodmltU3RhdGUsIGV2ZW50KVxuICAgICAgbmV3Q29tbWFuZHNcblxuICAgIEBzdWJzY3JpYmUgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLCBiaW5kVG9WaW1TdGF0ZShjb21tYW5kcykpXG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKHN0YXR1c0JhcikgLT5cbiAgICBzdGF0dXNCYXJNYW5hZ2VyID0gQGdldFN0YXR1c0Jhck1hbmFnZXIoKVxuICAgIHN0YXR1c0Jhck1hbmFnZXIuaW5pdGlhbGl6ZShzdGF0dXNCYXIpXG4gICAgc3RhdHVzQmFyTWFuYWdlci5hdHRhY2goKVxuICAgIEBzdWJzY3JpYmUgbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgIHN0YXR1c0Jhck1hbmFnZXIuZGV0YWNoKClcblxuICBjb25zdW1lRGVtb01vZGU6ICh7b25XaWxsQWRkSXRlbSwgb25EaWRTdGFydCwgb25EaWRTdG9wLCBvbkRpZFJlbW92ZUhvdmVyfSkgLT5cbiAgICBAc3Vic2NyaWJlKFxuICAgICAgb25EaWRTdGFydCgtPiBnbG9iYWxTdGF0ZS5zZXQoJ2RlbW9Nb2RlSXNBY3RpdmUnLCB0cnVlKSlcbiAgICAgIG9uRGlkU3RvcCgtPiBnbG9iYWxTdGF0ZS5zZXQoJ2RlbW9Nb2RlSXNBY3RpdmUnLCBmYWxzZSkpXG4gICAgICBvbkRpZFJlbW92ZUhvdmVyKEBkZXN0cm95QWxsRGVtb01vZGVGbGFzaGVNYXJrZXJzLmJpbmQodGhpcykpXG4gICAgICBvbldpbGxBZGRJdGVtKCh7aXRlbSwgZXZlbnR9KSA9PlxuICAgICAgICBpZiBldmVudC5iaW5kaW5nLmNvbW1hbmQuc3RhcnRzV2l0aCgndmltLW1vZGUtcGx1czonKVxuICAgICAgICAgIGNvbW1hbmRFbGVtZW50ID0gaXRlbS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjb21tYW5kJylbMF1cbiAgICAgICAgICBjb21tYW5kRWxlbWVudC50ZXh0Q29udGVudCA9IGNvbW1hbmRFbGVtZW50LnRleHRDb250ZW50LnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sICcnKVxuXG4gICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdraW5kJywgJ3B1bGwtcmlnaHQnKVxuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gQGdldEtpbmRGb3JDb21tYW5kKGV2ZW50LmJpbmRpbmcuY29tbWFuZClcbiAgICAgICAgaXRlbS5hcHBlbmRDaGlsZChlbGVtZW50KVxuICAgICAgKVxuICAgIClcblxuICBkZXN0cm95QWxsRGVtb01vZGVGbGFzaGVNYXJrZXJzOiAtPlxuICAgIFZpbVN0YXRlPy5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgIHZpbVN0YXRlLmZsYXNoTWFuYWdlci5kZXN0cm95RGVtb01vZGVNYXJrZXJzKClcblxuICBnZXRLaW5kRm9yQ29tbWFuZDogKGNvbW1hbmQpIC0+XG4gICAgaWYgY29tbWFuZC5zdGFydHNXaXRoKCd2aW0tbW9kZS1wbHVzJylcbiAgICAgIGNvbW1hbmQgPSBjb21tYW5kLnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sICcnKVxuICAgICAgaWYgY29tbWFuZC5zdGFydHNXaXRoKCdvcGVyYXRvci1tb2RpZmllcicpXG4gICAgICAgIGtpbmQgPSAnb3AtbW9kaWZpZXInXG4gICAgICBlbHNlXG4gICAgICAgIEJhc2UuZ2V0S2luZEZvckNvbW1hbmROYW1lKGNvbW1hbmQpID8gJ3ZtcC1vdGhlcidcbiAgICBlbHNlXG4gICAgICAnbm9uLXZtcCdcblxuICBjcmVhdGVWaW1TdGF0ZTogKGVkaXRvcikgLT5cbiAgICB2aW1TdGF0ZSA9IG5ldyBWaW1TdGF0ZShlZGl0b3IsIEBnZXRTdGF0dXNCYXJNYW5hZ2VyKCksIGdsb2JhbFN0YXRlKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1hZGQtdmltLXN0YXRlJywgdmltU3RhdGUpXG5cbiAgY3JlYXRlVmltU3RhdGVJZk5lY2Vzc2FyeTogKGVkaXRvcikgLT5cbiAgICByZXR1cm4gaWYgVmltU3RhdGUuaGFzKGVkaXRvcilcbiAgICB2aW1TdGF0ZSA9IG5ldyBWaW1TdGF0ZShlZGl0b3IsIEBnZXRTdGF0dXNCYXJNYW5hZ2VyKCksIGdsb2JhbFN0YXRlKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1hZGQtdmltLXN0YXRlJywgdmltU3RhdGUpXG5cbiAgIyBTZXJ2aWNlIEFQSVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0R2xvYmFsU3RhdGU6IC0+XG4gICAgZ2xvYmFsU3RhdGVcblxuICBnZXRFZGl0b3JTdGF0ZTogKGVkaXRvcikgLT5cbiAgICBWaW1TdGF0ZS5nZXRCeUVkaXRvcihlZGl0b3IpXG5cbiAgcHJvdmlkZVZpbU1vZGVQbHVzOiAtPlxuICAgIEJhc2U6IEJhc2VcbiAgICByZWdpc3RlckNvbW1hbmRGcm9tU3BlYzogQmFzZS5yZWdpc3RlckNvbW1hbmRGcm9tU3BlY1xuICAgIGdldEdsb2JhbFN0YXRlOiBAZ2V0R2xvYmFsU3RhdGVcbiAgICBnZXRFZGl0b3JTdGF0ZTogQGdldEVkaXRvclN0YXRlXG4gICAgb2JzZXJ2ZVZpbVN0YXRlczogQG9ic2VydmVWaW1TdGF0ZXMuYmluZCh0aGlzKVxuICAgIG9uRGlkQWRkVmltU3RhdGU6IEBvbkRpZEFkZFZpbVN0YXRlLmJpbmQodGhpcylcbiJdfQ==
