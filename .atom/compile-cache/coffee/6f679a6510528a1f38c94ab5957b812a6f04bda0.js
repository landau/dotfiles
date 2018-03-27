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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFHQUFBO0lBQUE7O0VBQUEsTUFBNkMsT0FBQSxDQUFRLE1BQVIsQ0FBN0MsRUFBQywyQkFBRCxFQUFhLHFCQUFiLEVBQXNCOztFQUV0QixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGVBQUEsR0FBa0I7O0VBRWxCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQVEsUUFBUSxDQUFDLE1BQWpCO0lBRUEsbUJBQUEsRUFBcUIsU0FBQTs2Q0FDbkIsSUFBQyxDQUFBLG1CQUFELElBQUMsQ0FBQSxtQkFBb0IsSUFBSSxDQUFDLE9BQUEsQ0FBUSxzQkFBUixDQUFEO0lBRE4sQ0FGckI7SUFLQSxRQUFBLEVBQVUsU0FBQyxLQUFEO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BRWYsY0FBQSxHQUFpQixJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLElBQXJCO01BQ2pCLElBQUMsQ0FBQSxTQUFELGFBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxjQUFWLENBQVg7TUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSx3QkFBRCxDQUFBO01BRUEsUUFBUSxDQUFDLHNCQUFULENBQUE7TUFFQSxJQUFHLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBSDtRQUNFLFFBQVEsQ0FBQyxHQUFULENBQWEsaUJBQWIsRUFBZ0MsSUFBaEMs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QzthQUNmLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLG1CQUFkLEVBQW1DLFFBQW5DO0lBSHlCLENBelEzQjtJQWdSQSxjQUFBLEVBQWdCLFNBQUE7YUFDZDtJQURjLENBaFJoQjtJQW1SQSxjQUFBLEVBQWdCLFNBQUMsTUFBRDthQUNkLFFBQVEsQ0FBQyxXQUFULENBQXFCLE1BQXJCO0lBRGMsQ0FuUmhCO0lBc1JBLGtCQUFBLEVBQW9CLFNBQUE7YUFDbEI7UUFBQSxJQUFBLEVBQU0sSUFBTjtRQUNBLHVCQUFBLEVBQXlCLElBQUksQ0FBQyx1QkFEOUI7UUFFQSxjQUFBLEVBQWdCLElBQUMsQ0FBQSxjQUZqQjtRQUdBLGNBQUEsRUFBZ0IsSUFBQyxDQUFBLGNBSGpCO1FBSUEsZ0JBQUEsRUFBa0IsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLElBQXZCLENBSmxCO1FBS0EsZ0JBQUEsRUFBa0IsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLElBQXZCLENBTGxCOztJQURrQixDQXRScEI7O0FBVEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7RGlzcG9zYWJsZSwgRW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuZ2xvYmFsU3RhdGUgPSByZXF1aXJlICcuL2dsb2JhbC1zdGF0ZSdcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblZpbVN0YXRlID0gcmVxdWlyZSAnLi92aW0tc3RhdGUnXG5mb3JFYWNoUGFuZUF4aXMgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOiBzZXR0aW5ncy5jb25maWdcblxuICBnZXRTdGF0dXNCYXJNYW5hZ2VyOiAtPlxuICAgIEBzdGF0dXNCYXJNYW5hZ2VyID89IG5ldyAocmVxdWlyZSAnLi9zdGF0dXMtYmFyLW1hbmFnZXInKVxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIGdldEVkaXRvclN0YXRlID0gQGdldEVkaXRvclN0YXRlLmJpbmQodGhpcylcbiAgICBAc3Vic2NyaWJlKEJhc2UuaW5pdChnZXRFZGl0b3JTdGF0ZSkuLi4pXG4gICAgQHJlZ2lzdGVyQ29tbWFuZHMoKVxuICAgIEByZWdpc3RlclZpbVN0YXRlQ29tbWFuZHMoKVxuXG4gICAgc2V0dGluZ3Mubm90aWZ5RGVwcmVjYXRlZFBhcmFtcygpXG5cbiAgICBpZiBhdG9tLmluU3BlY01vZGUoKVxuICAgICAgc2V0dGluZ3Muc2V0KCdzdHJpY3RBc3NlcnRpb24nLCB0cnVlKVxuXG4gICAgaWYgYXRvbS5pbkRldk1vZGUoKVxuICAgICAgZGV2ZWxvcGVyID0gbmV3IChyZXF1aXJlICcuL2RldmVsb3BlcicpXG4gICAgICBAc3Vic2NyaWJlKGRldmVsb3Blci5pbml0KGdldEVkaXRvclN0YXRlKSlcblxuICAgIEBzdWJzY3JpYmUgQG9ic2VydmVWaW1Nb2RlIC0+XG4gICAgICBtZXNzYWdlID0gXCJcIlwiXG4gICAgICAgICMjIE1lc3NhZ2UgYnkgdmltLW1vZGUtcGx1czogdmltLW1vZGUgZGV0ZWN0ZWQhXG4gICAgICAgIFRvIHVzZSB2aW0tbW9kZS1wbHVzLCB5b3UgbXVzdCAqKmRpc2FibGUgdmltLW1vZGUqKiBtYW51YWxseS5cbiAgICAgICAgXCJcIlwiXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhtZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICBAY3JlYXRlVmltU3RhdGUoZWRpdG9yKSB1bmxlc3MgZWRpdG9yLmlzTWluaSgpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gPT5cbiAgICAgIEBkZW1heGltaXplUGFuZSgpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gLT5cbiAgICAgIGlmIHNldHRpbmdzLmdldCgnYXV0b21hdGljYWxseUVzY2FwZUluc2VydE1vZGVPbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlJylcbiAgICAgICAgVmltU3RhdGUuZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICAgICAgdmltU3RhdGUuYWN0aXZhdGUoJ25vcm1hbCcpIGlmIHZpbVN0YXRlLm1vZGUgaXMgJ2luc2VydCdcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub25EaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbSAoaXRlbSkgPT5cbiAgICAgIGlmIGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihpdGVtKSBhbmQgbm90IGl0ZW0uaXNNaW5pKClcbiAgICAgICAgIyBTdGlsbCB0aGVyZSBpcyBwb3NzaWJpbGl0eSBlZGl0b3IgaXMgZGVzdHJveWVkIGFuZCBkb24ndCBoYXZlIGNvcnJlc3BvbmRpbmdcbiAgICAgICAgIyB2aW1TdGF0ZSAjMTk2LlxuICAgICAgICB2aW1TdGF0ZSA9IEBnZXRFZGl0b3JTdGF0ZShpdGVtKVxuICAgICAgICByZXR1cm4gdW5sZXNzIHZpbVN0YXRlP1xuICAgICAgICBpZiBnbG9iYWxTdGF0ZS5nZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nKVxuICAgICAgICAgIHZpbVN0YXRlLmhpZ2hsaWdodFNlYXJjaC5yZWZyZXNoKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZpbVN0YXRlLmdldFByb3AoJ2hpZ2hsaWdodFNlYXJjaCcpPy5yZWZyZXNoKClcblxuICAgICMgQHN1YnNjcmliZSAgZ2xvYmFsU3RhdGUuZ2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJylcbiAgICAjIFJlZnJlc2ggaGlnaGxpZ2h0IGJhc2VkIG9uIGdsb2JhbFN0YXRlLmhpZ2hsaWdodFNlYXJjaFBhdHRlcm4gY2hhbmdlcy5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBAc3Vic2NyaWJlIGdsb2JhbFN0YXRlLm9uRGlkQ2hhbmdlICh7bmFtZSwgbmV3VmFsdWV9KSAtPlxuICAgICAgaWYgbmFtZSBpcyAnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybidcbiAgICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgICBWaW1TdGF0ZS5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgICAgICAgIHZpbVN0YXRlLmhpZ2hsaWdodFNlYXJjaC5yZWZyZXNoKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFZpbVN0YXRlLmZvckVhY2ggKHZpbVN0YXRlKSAtPlxuICAgICAgICAgICAgIyBhdm9pZCBwb3B1bGF0ZSBwcm9wIHVubmVjZXNzYXJpbHkgb24gdmltU3RhdGUucmVzZXQgb24gc3RhcnR1cFxuICAgICAgICAgICAgaWYgdmltU3RhdGUuX19oaWdobGlnaHRTZWFyY2hcbiAgICAgICAgICAgICAgdmltU3RhdGUuaGlnaGxpZ2h0U2VhcmNoLmNsZWFyTWFya2VycygpXG5cbiAgICBAc3Vic2NyaWJlIHNldHRpbmdzLm9ic2VydmUgJ2hpZ2hsaWdodFNlYXJjaCcsIChuZXdWYWx1ZSkgLT5cbiAgICAgIGlmIG5ld1ZhbHVlXG4gICAgICAgICMgUmUtc2V0dGluZyB2YWx1ZSB0cmlnZ2VyIGhpZ2hsaWdodFNlYXJjaCByZWZyZXNoXG4gICAgICAgIGdsb2JhbFN0YXRlLnNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIGdsb2JhbFN0YXRlLmdldCgnbGFzdFNlYXJjaFBhdHRlcm4nKSlcbiAgICAgIGVsc2VcbiAgICAgICAgZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbnVsbClcblxuICAgIEBzdWJzY3JpYmUoc2V0dGluZ3Mub2JzZXJ2ZUNvbmRpdGlvbmFsS2V5bWFwcygpLi4uKVxuXG4gICAgaWYgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpXG4gICAgICBkZXZlbG9wZXI/LnJlcG9ydFJlcXVpcmVDYWNoZShleGNsdWRlTm9kTW9kdWxlczogZmFsc2UpXG5cbiAgb2JzZXJ2ZVZpbU1vZGU6IChmbikgLT5cbiAgICBmbigpIGlmIGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKCd2aW0tbW9kZScpXG4gICAgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSAocGFjaykgLT5cbiAgICAgIGZuKCkgaWYgcGFjay5uYW1lIGlzICd2aW0tbW9kZSdcblxuICAjICogYGZuYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHZpbVN0YXRlIGluc3RhbmNlIHdhcyBjcmVhdGVkLlxuICAjICBVc2FnZTpcbiAgIyAgIG9uRGlkQWRkVmltU3RhdGUgKHZpbVN0YXRlKSAtPiBkbyBzb21ldGhpbmcuLlxuICAjIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9uRGlkQWRkVmltU3RhdGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1hZGQtdmltLXN0YXRlJywgZm4pXG5cbiAgIyAqIGBmbmAge0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2l0aCBhbGwgY3VycmVudCBhbmQgZnV0dXJlIHZpbVN0YXRlXG4gICMgIFVzYWdlOlxuICAjICAgb2JzZXJ2ZVZpbVN0YXRlcyAodmltU3RhdGUpIC0+IGRvIHNvbWV0aGluZy4uXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb2JzZXJ2ZVZpbVN0YXRlczogKGZuKSAtPlxuICAgIFZpbVN0YXRlPy5mb3JFYWNoKGZuKVxuICAgIEBvbkRpZEFkZFZpbVN0YXRlKGZuKVxuXG4gIGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbkZvckVkaXRvcnM6IC0+XG4gICAgZm9yIGVkaXRvciBpbiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpXG4gICAgICBAZ2V0RWRpdG9yU3RhdGUoZWRpdG9yKS5jbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25zKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIFZpbVN0YXRlPy5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgIHZpbVN0YXRlLmRlc3Ryb3koKVxuICAgIFZpbVN0YXRlPy5jbGVhcigpXG5cbiAgc3Vic2NyaWJlOiAoYXJncy4uLikgLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoYXJncy4uLilcblxuICB1bnN1YnNjcmliZTogKGFyZykgLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUoYXJnKVxuXG4gIHJlZ2lzdGVyQ29tbWFuZHM6IC0+XG4gICAgQHN1YnNjcmliZSBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsXG4gICAgICAndmltLW1vZGUtcGx1czpjbGVhci1oaWdobGlnaHQtc2VhcmNoJzogLT4gZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbnVsbClcbiAgICAgICd2aW0tbW9kZS1wbHVzOnRvZ2dsZS1oaWdobGlnaHQtc2VhcmNoJzogLT4gc2V0dGluZ3MudG9nZ2xlKCdoaWdobGlnaHRTZWFyY2gnKVxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6Y2xlYXItcGVyc2lzdGVudC1zZWxlY3Rpb24nOiA9PiBAY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uRm9yRWRpdG9ycygpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAndmltLW1vZGUtcGx1czptYXhpbWl6ZS1wYW5lJzogPT4gQG1heGltaXplUGFuZSgpXG4gICAgICAndmltLW1vZGUtcGx1czplcXVhbGl6ZS1wYW5lcyc6ID0+IEBlcXVhbGl6ZVBhbmVzKClcblxuICBkZW1heGltaXplUGFuZTogLT5cbiAgICBpZiBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZT9cbiAgICAgIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgQHVuc3Vic2NyaWJlKEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlKVxuICAgICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUgPSBudWxsXG5cbiAgbWF4aW1pemVQYW5lOiAtPlxuICAgIGlmIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlP1xuICAgICAgQGRlbWF4aW1pemVQYW5lKClcbiAgICAgIHJldHVyblxuXG4gICAgZ2V0VmlldyA9IChtb2RlbCkgLT4gYXRvbS52aWV3cy5nZXRWaWV3KG1vZGVsKVxuICAgIGNsYXNzUGFuZU1heGltaXplZCA9ICd2aW0tbW9kZS1wbHVzLS1wYW5lLW1heGltaXplZCdcbiAgICBjbGFzc0hpZGVUYWJCYXIgPSAndmltLW1vZGUtcGx1cy0taGlkZS10YWItYmFyJ1xuICAgIGNsYXNzSGlkZVN0YXR1c0JhciA9ICd2aW0tbW9kZS1wbHVzLS1oaWRlLXN0YXR1cy1iYXInXG4gICAgY2xhc3NBY3RpdmVQYW5lQXhpcyA9ICd2aW0tbW9kZS1wbHVzLS1hY3RpdmUtcGFuZS1heGlzJ1xuXG4gICAgd29ya3NwYWNlRWxlbWVudCA9IGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgcGFuZUVsZW1lbnQgPSBnZXRWaWV3KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKSlcblxuICAgIHdvcmtzcGFjZUNsYXNzTmFtZXMgPSBbY2xhc3NQYW5lTWF4aW1pemVkXVxuICAgIHdvcmtzcGFjZUNsYXNzTmFtZXMucHVzaChjbGFzc0hpZGVUYWJCYXIpIGlmIHNldHRpbmdzLmdldCgnaGlkZVRhYkJhck9uTWF4aW1pemVQYW5lJylcbiAgICB3b3Jrc3BhY2VDbGFzc05hbWVzLnB1c2goY2xhc3NIaWRlU3RhdHVzQmFyKSBpZiBzZXR0aW5ncy5nZXQoJ2hpZGVTdGF0dXNCYXJPbk1heGltaXplUGFuZScpXG5cbiAgICB3b3Jrc3BhY2VFbGVtZW50LmNsYXNzTGlzdC5hZGQod29ya3NwYWNlQ2xhc3NOYW1lcy4uLilcblxuICAgIGZvckVhY2hQYW5lQXhpcyA/PSByZXF1aXJlKCcuL3V0aWxzJykuZm9yRWFjaFBhbmVBeGlzXG4gICAgZm9yRWFjaFBhbmVBeGlzIChheGlzKSAtPlxuICAgICAgcGFuZUF4aXNFbGVtZW50ID0gZ2V0VmlldyhheGlzKVxuICAgICAgaWYgcGFuZUF4aXNFbGVtZW50LmNvbnRhaW5zKHBhbmVFbGVtZW50KVxuICAgICAgICBwYW5lQXhpc0VsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc0FjdGl2ZVBhbmVBeGlzKVxuXG4gICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZSAtPlxuICAgICAgZm9yRWFjaFBhbmVBeGlzIChheGlzKSAtPlxuICAgICAgICBnZXRWaWV3KGF4aXMpLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NBY3RpdmVQYW5lQXhpcylcbiAgICAgIHdvcmtzcGFjZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSh3b3Jrc3BhY2VDbGFzc05hbWVzLi4uKVxuXG4gICAgQHN1YnNjcmliZShAbWF4aW1pemVQYW5lRGlzcG9zYWJsZSlcblxuICBlcXVhbGl6ZVBhbmVzOiAtPlxuICAgIHNldEZsZXhTY2FsZSA9IChuZXdWYWx1ZSwgYmFzZSkgLT5cbiAgICAgIGJhc2UgPz0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmdldENvbnRhaW5lcigpLmdldFJvb3QoKVxuICAgICAgYmFzZS5zZXRGbGV4U2NhbGUobmV3VmFsdWUpXG4gICAgICBmb3IgY2hpbGQgaW4gYmFzZS5jaGlsZHJlbiA/IFtdXG4gICAgICAgIHNldEZsZXhTY2FsZShuZXdWYWx1ZSwgY2hpbGQpXG5cbiAgICBzZXRGbGV4U2NhbGUoMSlcblxuICByZWdpc3RlclZpbVN0YXRlQ29tbWFuZHM6IC0+XG4gICAgIyBhbGwgY29tbWFuZHMgaGVyZSBpcyBleGVjdXRlZCB3aXRoIGNvbnRleHQgd2hlcmUgJ3RoaXMnIGJvdW5kIHRvICd2aW1TdGF0ZSdcbiAgICBjb21tYW5kcyA9XG4gICAgICAnYWN0aXZhdGUtbm9ybWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ25vcm1hbCcpXG4gICAgICAnYWN0aXZhdGUtbGluZXdpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgICAnYWN0aXZhdGUtY2hhcmFjdGVyd2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnKVxuICAgICAgJ2FjdGl2YXRlLWJsb2Nrd2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICAncmVzZXQtbm9ybWFsLW1vZGUnOiAtPiBAcmVzZXROb3JtYWxNb2RlKHVzZXJJbnZvY2F0aW9uOiB0cnVlKVxuICAgICAgJ3NldC1yZWdpc3Rlci1uYW1lJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoKSAjIFwiXG4gICAgICAnc2V0LXJlZ2lzdGVyLW5hbWUtdG8tXyc6IC0+IEByZWdpc3Rlci5zZXROYW1lKCdfJylcbiAgICAgICdzZXQtcmVnaXN0ZXItbmFtZS10by0qJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoJyonKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLWNoYXJhY3Rlcndpc2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIod2lzZTogJ2NoYXJhY3Rlcndpc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLWxpbmV3aXNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKHdpc2U6ICdsaW5ld2lzZScpXG4gICAgICAnb3BlcmF0b3ItbW9kaWZpZXItb2NjdXJyZW5jZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcihvY2N1cnJlbmNlOiB0cnVlLCBvY2N1cnJlbmNlVHlwZTogJ2Jhc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLXN1YndvcmQtb2NjdXJyZW5jZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcihvY2N1cnJlbmNlOiB0cnVlLCBvY2N1cnJlbmNlVHlwZTogJ3N1YndvcmQnKVxuICAgICAgJ3JlcGVhdCc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5SZWNvcmRlZCgpXG4gICAgICAncmVwZWF0LWZpbmQnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudEZpbmQoKVxuICAgICAgJ3JlcGVhdC1maW5kLXJldmVyc2UnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudEZpbmQocmV2ZXJzZTogdHJ1ZSlcbiAgICAgICdyZXBlYXQtc2VhcmNoJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRTZWFyY2goKVxuICAgICAgJ3JlcGVhdC1zZWFyY2gtcmV2ZXJzZSc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50U2VhcmNoKHJldmVyc2U6IHRydWUpXG4gICAgICAnc2V0LWNvdW50LTAnOiAtPiBAc2V0Q291bnQoMClcbiAgICAgICdzZXQtY291bnQtMSc6IC0+IEBzZXRDb3VudCgxKVxuICAgICAgJ3NldC1jb3VudC0yJzogLT4gQHNldENvdW50KDIpXG4gICAgICAnc2V0LWNvdW50LTMnOiAtPiBAc2V0Q291bnQoMylcbiAgICAgICdzZXQtY291bnQtNCc6IC0+IEBzZXRDb3VudCg0KVxuICAgICAgJ3NldC1jb3VudC01JzogLT4gQHNldENvdW50KDUpXG4gICAgICAnc2V0LWNvdW50LTYnOiAtPiBAc2V0Q291bnQoNilcbiAgICAgICdzZXQtY291bnQtNyc6IC0+IEBzZXRDb3VudCg3KVxuICAgICAgJ3NldC1jb3VudC04JzogLT4gQHNldENvdW50KDgpXG4gICAgICAnc2V0LWNvdW50LTknOiAtPiBAc2V0Q291bnQoOSlcblxuICAgIGNoYXJzID0gWzMyLi4xMjZdLm1hcCAoY29kZSkgLT4gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKVxuICAgIGZvciBjaGFyIGluIGNoYXJzXG4gICAgICBkbyAoY2hhcikgLT5cbiAgICAgICAgY2hhckZvcktleW1hcCA9IGlmIGNoYXIgaXMgJyAnIHRoZW4gJ3NwYWNlJyBlbHNlIGNoYXJcbiAgICAgICAgY29tbWFuZHNbXCJzZXQtaW5wdXQtY2hhci0je2NoYXJGb3JLZXltYXB9XCJdID0gLT5cbiAgICAgICAgICBAZW1pdERpZFNldElucHV0Q2hhcihjaGFyKVxuXG4gICAgZ2V0RWRpdG9yU3RhdGUgPSBAZ2V0RWRpdG9yU3RhdGUuYmluZCh0aGlzKVxuXG4gICAgYmluZFRvVmltU3RhdGUgPSAob2xkQ29tbWFuZHMpIC0+XG4gICAgICBuZXdDb21tYW5kcyA9IHt9XG4gICAgICBmb3IgbmFtZSwgZm4gb2Ygb2xkQ29tbWFuZHNcbiAgICAgICAgZG8gKGZuKSAtPlxuICAgICAgICAgIG5ld0NvbW1hbmRzW1widmltLW1vZGUtcGx1czoje25hbWV9XCJdID0gKGV2ZW50KSAtPlxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIGlmIHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUoQGdldE1vZGVsKCkpXG4gICAgICAgICAgICAgIGZuLmNhbGwodmltU3RhdGUsIGV2ZW50KVxuICAgICAgbmV3Q29tbWFuZHNcblxuICAgIEBzdWJzY3JpYmUgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLCBiaW5kVG9WaW1TdGF0ZShjb21tYW5kcykpXG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKHN0YXR1c0JhcikgLT5cbiAgICBzdGF0dXNCYXJNYW5hZ2VyID0gQGdldFN0YXR1c0Jhck1hbmFnZXIoKVxuICAgIHN0YXR1c0Jhck1hbmFnZXIuaW5pdGlhbGl6ZShzdGF0dXNCYXIpXG4gICAgc3RhdHVzQmFyTWFuYWdlci5hdHRhY2goKVxuICAgIEBzdWJzY3JpYmUgbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgIHN0YXR1c0Jhck1hbmFnZXIuZGV0YWNoKClcblxuICBjb25zdW1lRGVtb01vZGU6ICh7b25XaWxsQWRkSXRlbSwgb25EaWRTdGFydCwgb25EaWRTdG9wLCBvbkRpZFJlbW92ZUhvdmVyfSkgLT5cbiAgICBAc3Vic2NyaWJlKFxuICAgICAgb25EaWRTdGFydCgtPiBnbG9iYWxTdGF0ZS5zZXQoJ2RlbW9Nb2RlSXNBY3RpdmUnLCB0cnVlKSlcbiAgICAgIG9uRGlkU3RvcCgtPiBnbG9iYWxTdGF0ZS5zZXQoJ2RlbW9Nb2RlSXNBY3RpdmUnLCBmYWxzZSkpXG4gICAgICBvbkRpZFJlbW92ZUhvdmVyKEBkZXN0cm95QWxsRGVtb01vZGVGbGFzaGVNYXJrZXJzLmJpbmQodGhpcykpXG4gICAgICBvbldpbGxBZGRJdGVtKCh7aXRlbSwgZXZlbnR9KSA9PlxuICAgICAgICBpZiBldmVudC5iaW5kaW5nLmNvbW1hbmQuc3RhcnRzV2l0aCgndmltLW1vZGUtcGx1czonKVxuICAgICAgICAgIGNvbW1hbmRFbGVtZW50ID0gaXRlbS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjb21tYW5kJylbMF1cbiAgICAgICAgICBjb21tYW5kRWxlbWVudC50ZXh0Q29udGVudCA9IGNvbW1hbmRFbGVtZW50LnRleHRDb250ZW50LnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sICcnKVxuXG4gICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdraW5kJywgJ3B1bGwtcmlnaHQnKVxuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gQGdldEtpbmRGb3JDb21tYW5kKGV2ZW50LmJpbmRpbmcuY29tbWFuZClcbiAgICAgICAgaXRlbS5hcHBlbmRDaGlsZChlbGVtZW50KVxuICAgICAgKVxuICAgIClcblxuICBkZXN0cm95QWxsRGVtb01vZGVGbGFzaGVNYXJrZXJzOiAtPlxuICAgIFZpbVN0YXRlPy5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgIHZpbVN0YXRlLmZsYXNoTWFuYWdlci5kZXN0cm95RGVtb01vZGVNYXJrZXJzKClcblxuICBnZXRLaW5kRm9yQ29tbWFuZDogKGNvbW1hbmQpIC0+XG4gICAgaWYgY29tbWFuZC5zdGFydHNXaXRoKCd2aW0tbW9kZS1wbHVzJylcbiAgICAgIGNvbW1hbmQgPSBjb21tYW5kLnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sICcnKVxuICAgICAgaWYgY29tbWFuZC5zdGFydHNXaXRoKCdvcGVyYXRvci1tb2RpZmllcicpXG4gICAgICAgIGtpbmQgPSAnb3AtbW9kaWZpZXInXG4gICAgICBlbHNlXG4gICAgICAgIEJhc2UuZ2V0S2luZEZvckNvbW1hbmROYW1lKGNvbW1hbmQpID8gJ3ZtcC1vdGhlcidcbiAgICBlbHNlXG4gICAgICAnbm9uLXZtcCdcblxuICBjcmVhdGVWaW1TdGF0ZTogKGVkaXRvcikgLT5cbiAgICB2aW1TdGF0ZSA9IG5ldyBWaW1TdGF0ZShlZGl0b3IsIEBnZXRTdGF0dXNCYXJNYW5hZ2VyKCksIGdsb2JhbFN0YXRlKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1hZGQtdmltLXN0YXRlJywgdmltU3RhdGUpXG5cbiAgY3JlYXRlVmltU3RhdGVJZk5lY2Vzc2FyeTogKGVkaXRvcikgLT5cbiAgICByZXR1cm4gaWYgVmltU3RhdGUuaGFzKGVkaXRvcilcbiAgICB2aW1TdGF0ZSA9IG5ldyBWaW1TdGF0ZShlZGl0b3IsIEBnZXRTdGF0dXNCYXJNYW5hZ2VyKCksIGdsb2JhbFN0YXRlKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1hZGQtdmltLXN0YXRlJywgdmltU3RhdGUpXG5cbiAgIyBTZXJ2aWNlIEFQSVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0R2xvYmFsU3RhdGU6IC0+XG4gICAgZ2xvYmFsU3RhdGVcblxuICBnZXRFZGl0b3JTdGF0ZTogKGVkaXRvcikgLT5cbiAgICBWaW1TdGF0ZS5nZXRCeUVkaXRvcihlZGl0b3IpXG5cbiAgcHJvdmlkZVZpbU1vZGVQbHVzOiAtPlxuICAgIEJhc2U6IEJhc2VcbiAgICByZWdpc3RlckNvbW1hbmRGcm9tU3BlYzogQmFzZS5yZWdpc3RlckNvbW1hbmRGcm9tU3BlY1xuICAgIGdldEdsb2JhbFN0YXRlOiBAZ2V0R2xvYmFsU3RhdGVcbiAgICBnZXRFZGl0b3JTdGF0ZTogQGdldEVkaXRvclN0YXRlXG4gICAgb2JzZXJ2ZVZpbVN0YXRlczogQG9ic2VydmVWaW1TdGF0ZXMuYmluZCh0aGlzKVxuICAgIG9uRGlkQWRkVmltU3RhdGU6IEBvbkRpZEFkZFZpbVN0YXRlLmJpbmQodGhpcylcbiJdfQ==
