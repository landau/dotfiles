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
      var activePane, activePaneElement, addClassList, root, workspaceClassList;
      if (this.maximizePaneDisposable != null) {
        this.demaximizePane();
        return;
      }
      this.maximizePaneDisposable = new CompositeDisposable;
      addClassList = (function(_this) {
        return function(element, classList) {
          var ref1;
          classList = classList.map(function(className) {
            return "vim-mode-plus--" + className;
          });
          (ref1 = element.classList).add.apply(ref1, classList);
          return _this.maximizePaneDisposable.add(new Disposable(function() {
            var ref2;
            return (ref2 = element.classList).remove.apply(ref2, classList);
          }));
        };
      })(this);
      workspaceClassList = ['pane-maximized'];
      if (settings.get('hideTabBarOnMaximizePane')) {
        workspaceClassList.push('hide-tab-bar');
      }
      if (settings.get('hideStatusBarOnMaximizePane')) {
        workspaceClassList.push('hide-status-bar');
      }
      addClassList(atom.views.getView(atom.workspace), workspaceClassList);
      activePane = atom.workspace.getActivePane();
      activePaneElement = atom.views.getView(activePane);
      addClassList(activePaneElement, ['active-pane']);
      if (forEachPaneAxis == null) {
        forEachPaneAxis = require('./utils').forEachPaneAxis;
      }
      root = activePane.getContainer().getRoot();
      forEachPaneAxis(root, function(axis) {
        var paneAxisElement;
        paneAxisElement = atom.views.getView(axis);
        if (paneAxisElement.contains(activePaneElement)) {
          return addClassList(paneAxisElement, ['active-pane-axis']);
        }
      });
      return this.subscribe(this.maximizePaneDisposable);
    },
    equalizePanes: function() {
      var setFlexScale;
      setFlexScale = function(root, newValue) {
        var child, i, len, ref1, ref2, results;
        root.setFlexScale(newValue);
        ref2 = (ref1 = root.children) != null ? ref1 : [];
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          child = ref2[i];
          results.push(setFlexScale(child, newValue));
        }
        return results;
      };
      return setFlexScale(atom.workspace.getActivePane().getContainer().getRoot(), 1);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFHQUFBO0lBQUE7O0VBQUEsTUFBNkMsT0FBQSxDQUFRLE1BQVIsQ0FBN0MsRUFBQywyQkFBRCxFQUFhLHFCQUFiLEVBQXNCOztFQUV0QixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGVBQUEsR0FBa0I7O0VBRWxCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQVEsUUFBUSxDQUFDLE1BQWpCO0lBRUEsbUJBQUEsRUFBcUIsU0FBQTs2Q0FDbkIsSUFBQyxDQUFBLG1CQUFELElBQUMsQ0FBQSxtQkFBb0IsSUFBSSxDQUFDLE9BQUEsQ0FBUSxzQkFBUixDQUFEO0lBRE4sQ0FGckI7SUFLQSxRQUFBLEVBQVUsU0FBQyxLQUFEO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BRWYsY0FBQSxHQUFpQixJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLElBQXJCO01BQ2pCLElBQUMsQ0FBQSxTQUFELGFBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxjQUFWLENBQVg7TUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSx3QkFBRCxDQUFBO01BRUEsUUFBUSxDQUFDLHNCQUFULENBQUE7TUFFQSxJQUFHLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBSDtRQUNFLFFBQVEsQ0FBQyxHQUFULENBQWEsaUJBQWIsRUFBZ0MsSUFBaEMsRUFERjs7TUFH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RmMsQ0FuUWhCO0lBdVFBLHlCQUFBLEVBQTJCLFNBQUMsTUFBRDtBQUN6QixVQUFBO01BQUEsSUFBVSxRQUFRLENBQUMsR0FBVCxDQUFhLE1BQWIsQ0FBVjtBQUFBLGVBQUE7O01BQ0EsUUFBQSxHQUFlLElBQUEsUUFBQSxDQUFTLE1BQVQsRUFBaUIsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FBakIsRUFBeUMsV0FBekM7YUFDZixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxtQkFBZCxFQUFtQyxRQUFuQztJQUh5QixDQXZRM0I7SUE4UUEsY0FBQSxFQUFnQixTQUFBO2FBQ2Q7SUFEYyxDQTlRaEI7SUFpUkEsY0FBQSxFQUFnQixTQUFDLE1BQUQ7YUFDZCxRQUFRLENBQUMsV0FBVCxDQUFxQixNQUFyQjtJQURjLENBalJoQjtJQW9SQSxrQkFBQSxFQUFvQixTQUFBO2FBQ2xCO1FBQUEsSUFBQSxFQUFNLElBQU47UUFDQSx1QkFBQSxFQUF5QixJQUFJLENBQUMsdUJBRDlCO1FBRUEsY0FBQSxFQUFnQixJQUFDLENBQUEsY0FGakI7UUFHQSxjQUFBLEVBQWdCLElBQUMsQ0FBQSxjQUhqQjtRQUlBLGdCQUFBLEVBQWtCLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixJQUF2QixDQUpsQjtRQUtBLGdCQUFBLEVBQWtCLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixJQUF2QixDQUxsQjs7SUFEa0IsQ0FwUnBCOztBQVRGIiwic291cmNlc0NvbnRlbnQiOlsie0Rpc3Bvc2FibGUsIEVtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbmdsb2JhbFN0YXRlID0gcmVxdWlyZSAnLi9nbG9iYWwtc3RhdGUnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5WaW1TdGF0ZSA9IHJlcXVpcmUgJy4vdmltLXN0YXRlJ1xuZm9yRWFjaFBhbmVBeGlzID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzogc2V0dGluZ3MuY29uZmlnXG5cbiAgZ2V0U3RhdHVzQmFyTWFuYWdlcjogLT5cbiAgICBAc3RhdHVzQmFyTWFuYWdlciA/PSBuZXcgKHJlcXVpcmUgJy4vc3RhdHVzLWJhci1tYW5hZ2VyJylcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG5cbiAgICBnZXRFZGl0b3JTdGF0ZSA9IEBnZXRFZGl0b3JTdGF0ZS5iaW5kKHRoaXMpXG4gICAgQHN1YnNjcmliZShCYXNlLmluaXQoZ2V0RWRpdG9yU3RhdGUpLi4uKVxuICAgIEByZWdpc3RlckNvbW1hbmRzKClcbiAgICBAcmVnaXN0ZXJWaW1TdGF0ZUNvbW1hbmRzKClcblxuICAgIHNldHRpbmdzLm5vdGlmeURlcHJlY2F0ZWRQYXJhbXMoKVxuXG4gICAgaWYgYXRvbS5pblNwZWNNb2RlKClcbiAgICAgIHNldHRpbmdzLnNldCgnc3RyaWN0QXNzZXJ0aW9uJywgdHJ1ZSlcblxuICAgIGlmIGF0b20uaW5EZXZNb2RlKClcbiAgICAgIGRldmVsb3BlciA9IG5ldyAocmVxdWlyZSAnLi9kZXZlbG9wZXInKVxuICAgICAgQHN1YnNjcmliZShkZXZlbG9wZXIuaW5pdChnZXRFZGl0b3JTdGF0ZSkpXG5cbiAgICBAc3Vic2NyaWJlIEBvYnNlcnZlVmltTW9kZSAtPlxuICAgICAgbWVzc2FnZSA9IFwiXCJcIlxuICAgICAgICAjIyBNZXNzYWdlIGJ5IHZpbS1tb2RlLXBsdXM6IHZpbS1tb2RlIGRldGVjdGVkIVxuICAgICAgICBUbyB1c2UgdmltLW1vZGUtcGx1cywgeW91IG11c3QgKipkaXNhYmxlIHZpbS1tb2RlKiogbWFudWFsbHkuXG4gICAgICAgIFwiXCJcIlxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcobWVzc2FnZSwgZGlzbWlzc2FibGU6IHRydWUpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgQGNyZWF0ZVZpbVN0YXRlKGVkaXRvcikgdW5sZXNzIGVkaXRvci5pc01pbmkoKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtID0+XG4gICAgICBAZGVtYXhpbWl6ZVBhbmUoKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIC0+XG4gICAgICBpZiBzZXR0aW5ncy5nZXQoJ2F1dG9tYXRpY2FsbHlFc2NhcGVJbnNlcnRNb2RlT25BY3RpdmVQYW5lSXRlbUNoYW5nZScpXG4gICAgICAgIFZpbVN0YXRlLmZvckVhY2ggKHZpbVN0YXRlKSAtPlxuICAgICAgICAgIHZpbVN0YXRlLmFjdGl2YXRlKCdub3JtYWwnKSBpZiB2aW1TdGF0ZS5tb2RlIGlzICdpbnNlcnQnXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9uRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0gKGl0ZW0pID0+XG4gICAgICBpZiBhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IoaXRlbSkgYW5kIG5vdCBpdGVtLmlzTWluaSgpXG4gICAgICAgICMgU3RpbGwgdGhlcmUgaXMgcG9zc2liaWxpdHkgZWRpdG9yIGlzIGRlc3Ryb3llZCBhbmQgZG9uJ3QgaGF2ZSBjb3JyZXNwb25kaW5nXG4gICAgICAgICMgdmltU3RhdGUgIzE5Ni5cbiAgICAgICAgdmltU3RhdGUgPSBAZ2V0RWRpdG9yU3RhdGUoaXRlbSlcbiAgICAgICAgcmV0dXJuIHVubGVzcyB2aW1TdGF0ZT9cbiAgICAgICAgaWYgZ2xvYmFsU3RhdGUuZ2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJylcbiAgICAgICAgICB2aW1TdGF0ZS5oaWdobGlnaHRTZWFyY2gucmVmcmVzaCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB2aW1TdGF0ZS5nZXRQcm9wKCdoaWdobGlnaHRTZWFyY2gnKT8ucmVmcmVzaCgpXG5cbiAgICAjIEBzdWJzY3JpYmUgIGdsb2JhbFN0YXRlLmdldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicpXG4gICAgIyBSZWZyZXNoIGhpZ2hsaWdodCBiYXNlZCBvbiBnbG9iYWxTdGF0ZS5oaWdobGlnaHRTZWFyY2hQYXR0ZXJuIGNoYW5nZXMuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgQHN1YnNjcmliZSBnbG9iYWxTdGF0ZS5vbkRpZENoYW5nZSAoe25hbWUsIG5ld1ZhbHVlfSkgLT5cbiAgICAgIGlmIG5hbWUgaXMgJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nXG4gICAgICAgIGlmIG5ld1ZhbHVlXG4gICAgICAgICAgVmltU3RhdGUuZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICAgICAgICB2aW1TdGF0ZS5oaWdobGlnaHRTZWFyY2gucmVmcmVzaCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBWaW1TdGF0ZS5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgICAgICAgICMgYXZvaWQgcG9wdWxhdGUgcHJvcCB1bm5lY2Vzc2FyaWx5IG9uIHZpbVN0YXRlLnJlc2V0IG9uIHN0YXJ0dXBcbiAgICAgICAgICAgIGlmIHZpbVN0YXRlLl9faGlnaGxpZ2h0U2VhcmNoXG4gICAgICAgICAgICAgIHZpbVN0YXRlLmhpZ2hsaWdodFNlYXJjaC5jbGVhck1hcmtlcnMoKVxuXG4gICAgQHN1YnNjcmliZSBzZXR0aW5ncy5vYnNlcnZlICdoaWdobGlnaHRTZWFyY2gnLCAobmV3VmFsdWUpIC0+XG4gICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICAjIFJlLXNldHRpbmcgdmFsdWUgdHJpZ2dlciBoaWdobGlnaHRTZWFyY2ggcmVmcmVzaFxuICAgICAgICBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBnbG9iYWxTdGF0ZS5nZXQoJ2xhc3RTZWFyY2hQYXR0ZXJuJykpXG4gICAgICBlbHNlXG4gICAgICAgIGdsb2JhbFN0YXRlLnNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIG51bGwpXG5cbiAgICBAc3Vic2NyaWJlKHNldHRpbmdzLm9ic2VydmVDb25kaXRpb25hbEtleW1hcHMoKS4uLilcblxuICAgIGlmIHNldHRpbmdzLmdldCgnZGVidWcnKVxuICAgICAgZGV2ZWxvcGVyPy5yZXBvcnRSZXF1aXJlQ2FjaGUoZXhjbHVkZU5vZE1vZHVsZXM6IGZhbHNlKVxuXG4gIG9ic2VydmVWaW1Nb2RlOiAoZm4pIC0+XG4gICAgZm4oKSBpZiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZSgndmltLW1vZGUnKVxuICAgIGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZVBhY2thZ2UgKHBhY2spIC0+XG4gICAgICBmbigpIGlmIHBhY2submFtZSBpcyAndmltLW1vZGUnXG5cbiAgIyAqIGBmbmAge0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbiB2aW1TdGF0ZSBpbnN0YW5jZSB3YXMgY3JlYXRlZC5cbiAgIyAgVXNhZ2U6XG4gICMgICBvbkRpZEFkZFZpbVN0YXRlICh2aW1TdGF0ZSkgLT4gZG8gc29tZXRoaW5nLi5cbiAgIyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbkRpZEFkZFZpbVN0YXRlOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtYWRkLXZpbS1zdGF0ZScsIGZuKVxuXG4gICMgKiBgZm5gIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdpdGggYWxsIGN1cnJlbnQgYW5kIGZ1dHVyZSB2aW1TdGF0ZVxuICAjICBVc2FnZTpcbiAgIyAgIG9ic2VydmVWaW1TdGF0ZXMgKHZpbVN0YXRlKSAtPiBkbyBzb21ldGhpbmcuLlxuICAjIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9ic2VydmVWaW1TdGF0ZXM6IChmbikgLT5cbiAgICBWaW1TdGF0ZT8uZm9yRWFjaChmbilcbiAgICBAb25EaWRBZGRWaW1TdGF0ZShmbilcblxuICBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25Gb3JFZGl0b3JzOiAtPlxuICAgIGZvciBlZGl0b3IgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKVxuICAgICAgQGdldEVkaXRvclN0YXRlKGVkaXRvcikuY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9ucygpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBWaW1TdGF0ZT8uZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICB2aW1TdGF0ZS5kZXN0cm95KClcbiAgICBWaW1TdGF0ZT8uY2xlYXIoKVxuXG4gIHN1YnNjcmliZTogKGFyZ3MuLi4pIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkKGFyZ3MuLi4pXG5cbiAgdW5zdWJzY3JpYmU6IChhcmcpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMucmVtb3ZlKGFyZylcblxuICByZWdpc3RlckNvbW1hbmRzOiAtPlxuICAgIEBzdWJzY3JpYmUgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6Y2xlYXItaGlnaGxpZ2h0LXNlYXJjaCc6IC0+IGdsb2JhbFN0YXRlLnNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIG51bGwpXG4gICAgICAndmltLW1vZGUtcGx1czp0b2dnbGUtaGlnaGxpZ2h0LXNlYXJjaCc6IC0+IHNldHRpbmdzLnRvZ2dsZSgnaGlnaGxpZ2h0U2VhcmNoJylcbiAgICAgICd2aW0tbW9kZS1wbHVzOmNsZWFyLXBlcnNpc3RlbnQtc2VsZWN0aW9uJzogPT4gQGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbkZvckVkaXRvcnMoKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6bWF4aW1pemUtcGFuZSc6ID0+IEBtYXhpbWl6ZVBhbmUoKVxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6ZXF1YWxpemUtcGFuZXMnOiA9PiBAZXF1YWxpemVQYW5lcygpXG5cbiAgZGVtYXhpbWl6ZVBhbmU6IC0+XG4gICAgaWYgQG1heGltaXplUGFuZURpc3Bvc2FibGU/XG4gICAgICBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgIEB1bnN1YnNjcmliZShAbWF4aW1pemVQYW5lRGlzcG9zYWJsZSlcbiAgICAgIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlID0gbnVsbFxuXG4gIG1heGltaXplUGFuZTogLT5cbiAgICBpZiBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZT9cbiAgICAgIEBkZW1heGltaXplUGFuZSgpXG4gICAgICByZXR1cm5cblxuICAgIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIGFkZENsYXNzTGlzdCA9IChlbGVtZW50LCBjbGFzc0xpc3QpID0+XG4gICAgICBjbGFzc0xpc3QgPSBjbGFzc0xpc3QubWFwIChjbGFzc05hbWUpIC0+XG4gICAgICAgIFwidmltLW1vZGUtcGx1cy0tI3tjbGFzc05hbWV9XCJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc0xpc3QuLi4pXG4gICAgICBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZS5hZGQgbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTGlzdC4uLilcblxuICAgIHdvcmtzcGFjZUNsYXNzTGlzdCA9IFsncGFuZS1tYXhpbWl6ZWQnXVxuICAgIHdvcmtzcGFjZUNsYXNzTGlzdC5wdXNoKCdoaWRlLXRhYi1iYXInKSBpZiBzZXR0aW5ncy5nZXQoJ2hpZGVUYWJCYXJPbk1heGltaXplUGFuZScpXG4gICAgd29ya3NwYWNlQ2xhc3NMaXN0LnB1c2goJ2hpZGUtc3RhdHVzLWJhcicpIGlmIHNldHRpbmdzLmdldCgnaGlkZVN0YXR1c0Jhck9uTWF4aW1pemVQYW5lJylcbiAgICBhZGRDbGFzc0xpc3QoYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgd29ya3NwYWNlQ2xhc3NMaXN0KVxuXG4gICAgYWN0aXZlUGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgIGFjdGl2ZVBhbmVFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGFjdGl2ZVBhbmUpXG4gICAgYWRkQ2xhc3NMaXN0KGFjdGl2ZVBhbmVFbGVtZW50LCBbJ2FjdGl2ZS1wYW5lJ10pXG5cbiAgICBmb3JFYWNoUGFuZUF4aXMgPz0gcmVxdWlyZSgnLi91dGlscycpLmZvckVhY2hQYW5lQXhpc1xuICAgIHJvb3QgPSBhY3RpdmVQYW5lLmdldENvbnRhaW5lcigpLmdldFJvb3QoKVxuICAgIGZvckVhY2hQYW5lQXhpcyByb290LCAoYXhpcykgLT5cbiAgICAgIHBhbmVBeGlzRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhheGlzKVxuICAgICAgaWYgcGFuZUF4aXNFbGVtZW50LmNvbnRhaW5zKGFjdGl2ZVBhbmVFbGVtZW50KVxuICAgICAgICBhZGRDbGFzc0xpc3QocGFuZUF4aXNFbGVtZW50LCBbJ2FjdGl2ZS1wYW5lLWF4aXMnXSlcblxuICAgIEBzdWJzY3JpYmUoQG1heGltaXplUGFuZURpc3Bvc2FibGUpXG5cbiAgZXF1YWxpemVQYW5lczogLT5cbiAgICBzZXRGbGV4U2NhbGUgPSAocm9vdCwgbmV3VmFsdWUpIC0+XG4gICAgICByb290LnNldEZsZXhTY2FsZShuZXdWYWx1ZSlcbiAgICAgIGZvciBjaGlsZCBpbiByb290LmNoaWxkcmVuID8gW11cbiAgICAgICAgc2V0RmxleFNjYWxlKGNoaWxkLCBuZXdWYWx1ZSlcblxuICAgIHNldEZsZXhTY2FsZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuZ2V0Q29udGFpbmVyKCkuZ2V0Um9vdCgpLCAxKVxuXG4gIHJlZ2lzdGVyVmltU3RhdGVDb21tYW5kczogLT5cbiAgICAjIGFsbCBjb21tYW5kcyBoZXJlIGlzIGV4ZWN1dGVkIHdpdGggY29udGV4dCB3aGVyZSAndGhpcycgYm91bmQgdG8gJ3ZpbVN0YXRlJ1xuICAgIGNvbW1hbmRzID1cbiAgICAgICdhY3RpdmF0ZS1ub3JtYWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgnbm9ybWFsJylcbiAgICAgICdhY3RpdmF0ZS1saW5ld2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2xpbmV3aXNlJylcbiAgICAgICdhY3RpdmF0ZS1jaGFyYWN0ZXJ3aXNlLXZpc3VhbC1tb2RlJzogLT4gQGFjdGl2YXRlKCd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZScpXG4gICAgICAnYWN0aXZhdGUtYmxvY2t3aXNlLXZpc3VhbC1tb2RlJzogLT4gQGFjdGl2YXRlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgICdyZXNldC1ub3JtYWwtbW9kZSc6IC0+IEByZXNldE5vcm1hbE1vZGUodXNlckludm9jYXRpb246IHRydWUpXG4gICAgICAnc2V0LXJlZ2lzdGVyLW5hbWUnOiAtPiBAcmVnaXN0ZXIuc2V0TmFtZSgpICMgXCJcbiAgICAgICdzZXQtcmVnaXN0ZXItbmFtZS10by1fJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoJ18nKVxuICAgICAgJ3NldC1yZWdpc3Rlci1uYW1lLXRvLSonOiAtPiBAcmVnaXN0ZXIuc2V0TmFtZSgnKicpXG4gICAgICAnb3BlcmF0b3ItbW9kaWZpZXItY2hhcmFjdGVyd2lzZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcih3aXNlOiAnY2hhcmFjdGVyd2lzZScpXG4gICAgICAnb3BlcmF0b3ItbW9kaWZpZXItbGluZXdpc2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIod2lzZTogJ2xpbmV3aXNlJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1vY2N1cnJlbmNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKG9jY3VycmVuY2U6IHRydWUsIG9jY3VycmVuY2VUeXBlOiAnYmFzZScpXG4gICAgICAnb3BlcmF0b3ItbW9kaWZpZXItc3Vid29yZC1vY2N1cnJlbmNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKG9jY3VycmVuY2U6IHRydWUsIG9jY3VycmVuY2VUeXBlOiAnc3Vid29yZCcpXG4gICAgICAncmVwZWF0JzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1blJlY29yZGVkKClcbiAgICAgICdyZXBlYXQtZmluZCc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50RmluZCgpXG4gICAgICAncmVwZWF0LWZpbmQtcmV2ZXJzZSc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50RmluZChyZXZlcnNlOiB0cnVlKVxuICAgICAgJ3JlcGVhdC1zZWFyY2gnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudFNlYXJjaCgpXG4gICAgICAncmVwZWF0LXNlYXJjaC1yZXZlcnNlJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRTZWFyY2gocmV2ZXJzZTogdHJ1ZSlcbiAgICAgICdzZXQtY291bnQtMCc6IC0+IEBzZXRDb3VudCgwKVxuICAgICAgJ3NldC1jb3VudC0xJzogLT4gQHNldENvdW50KDEpXG4gICAgICAnc2V0LWNvdW50LTInOiAtPiBAc2V0Q291bnQoMilcbiAgICAgICdzZXQtY291bnQtMyc6IC0+IEBzZXRDb3VudCgzKVxuICAgICAgJ3NldC1jb3VudC00JzogLT4gQHNldENvdW50KDQpXG4gICAgICAnc2V0LWNvdW50LTUnOiAtPiBAc2V0Q291bnQoNSlcbiAgICAgICdzZXQtY291bnQtNic6IC0+IEBzZXRDb3VudCg2KVxuICAgICAgJ3NldC1jb3VudC03JzogLT4gQHNldENvdW50KDcpXG4gICAgICAnc2V0LWNvdW50LTgnOiAtPiBAc2V0Q291bnQoOClcbiAgICAgICdzZXQtY291bnQtOSc6IC0+IEBzZXRDb3VudCg5KVxuXG4gICAgY2hhcnMgPSBbMzIuLjEyNl0ubWFwIChjb2RlKSAtPiBTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGUpXG4gICAgZm9yIGNoYXIgaW4gY2hhcnNcbiAgICAgIGRvIChjaGFyKSAtPlxuICAgICAgICBjaGFyRm9yS2V5bWFwID0gaWYgY2hhciBpcyAnICcgdGhlbiAnc3BhY2UnIGVsc2UgY2hhclxuICAgICAgICBjb21tYW5kc1tcInNldC1pbnB1dC1jaGFyLSN7Y2hhckZvcktleW1hcH1cIl0gPSAtPlxuICAgICAgICAgIEBlbWl0RGlkU2V0SW5wdXRDaGFyKGNoYXIpXG5cbiAgICBnZXRFZGl0b3JTdGF0ZSA9IEBnZXRFZGl0b3JTdGF0ZS5iaW5kKHRoaXMpXG5cbiAgICBiaW5kVG9WaW1TdGF0ZSA9IChvbGRDb21tYW5kcykgLT5cbiAgICAgIG5ld0NvbW1hbmRzID0ge31cbiAgICAgIGZvciBuYW1lLCBmbiBvZiBvbGRDb21tYW5kc1xuICAgICAgICBkbyAoZm4pIC0+XG4gICAgICAgICAgbmV3Q29tbWFuZHNbXCJ2aW0tbW9kZS1wbHVzOiN7bmFtZX1cIl0gPSAoZXZlbnQpIC0+XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgaWYgdmltU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZShAZ2V0TW9kZWwoKSlcbiAgICAgICAgICAgICAgZm4uY2FsbCh2aW1TdGF0ZSwgZXZlbnQpXG4gICAgICBuZXdDb21tYW5kc1xuXG4gICAgQHN1YnNjcmliZSBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsIGJpbmRUb1ZpbVN0YXRlKGNvbW1hbmRzKSlcblxuICBjb25zdW1lU3RhdHVzQmFyOiAoc3RhdHVzQmFyKSAtPlxuICAgIHN0YXR1c0Jhck1hbmFnZXIgPSBAZ2V0U3RhdHVzQmFyTWFuYWdlcigpXG4gICAgc3RhdHVzQmFyTWFuYWdlci5pbml0aWFsaXplKHN0YXR1c0JhcilcbiAgICBzdGF0dXNCYXJNYW5hZ2VyLmF0dGFjaCgpXG4gICAgQHN1YnNjcmliZSBuZXcgRGlzcG9zYWJsZSAtPlxuICAgICAgc3RhdHVzQmFyTWFuYWdlci5kZXRhY2goKVxuXG4gIGNvbnN1bWVEZW1vTW9kZTogKHtvbldpbGxBZGRJdGVtLCBvbkRpZFN0YXJ0LCBvbkRpZFN0b3AsIG9uRGlkUmVtb3ZlSG92ZXJ9KSAtPlxuICAgIEBzdWJzY3JpYmUoXG4gICAgICBvbkRpZFN0YXJ0KC0+IGdsb2JhbFN0YXRlLnNldCgnZGVtb01vZGVJc0FjdGl2ZScsIHRydWUpKVxuICAgICAgb25EaWRTdG9wKC0+IGdsb2JhbFN0YXRlLnNldCgnZGVtb01vZGVJc0FjdGl2ZScsIGZhbHNlKSlcbiAgICAgIG9uRGlkUmVtb3ZlSG92ZXIoQGRlc3Ryb3lBbGxEZW1vTW9kZUZsYXNoZU1hcmtlcnMuYmluZCh0aGlzKSlcbiAgICAgIG9uV2lsbEFkZEl0ZW0oKHtpdGVtLCBldmVudH0pID0+XG4gICAgICAgIGlmIGV2ZW50LmJpbmRpbmcuY29tbWFuZC5zdGFydHNXaXRoKCd2aW0tbW9kZS1wbHVzOicpXG4gICAgICAgICAgY29tbWFuZEVsZW1lbnQgPSBpdGVtLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NvbW1hbmQnKVswXVxuICAgICAgICAgIGNvbW1hbmRFbGVtZW50LnRleHRDb250ZW50ID0gY29tbWFuZEVsZW1lbnQudGV4dENvbnRlbnQucmVwbGFjZSgvXnZpbS1tb2RlLXBsdXM6LywgJycpXG5cbiAgICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2tpbmQnLCAncHVsbC1yaWdodCcpXG4gICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBAZ2V0S2luZEZvckNvbW1hbmQoZXZlbnQuYmluZGluZy5jb21tYW5kKVxuICAgICAgICBpdGVtLmFwcGVuZENoaWxkKGVsZW1lbnQpXG4gICAgICApXG4gICAgKVxuXG4gIGRlc3Ryb3lBbGxEZW1vTW9kZUZsYXNoZU1hcmtlcnM6IC0+XG4gICAgVmltU3RhdGU/LmZvckVhY2ggKHZpbVN0YXRlKSAtPlxuICAgICAgdmltU3RhdGUuZmxhc2hNYW5hZ2VyLmRlc3Ryb3lEZW1vTW9kZU1hcmtlcnMoKVxuXG4gIGdldEtpbmRGb3JDb21tYW5kOiAoY29tbWFuZCkgLT5cbiAgICBpZiBjb21tYW5kLnN0YXJ0c1dpdGgoJ3ZpbS1tb2RlLXBsdXMnKVxuICAgICAgY29tbWFuZCA9IGNvbW1hbmQucmVwbGFjZSgvXnZpbS1tb2RlLXBsdXM6LywgJycpXG4gICAgICBpZiBjb21tYW5kLnN0YXJ0c1dpdGgoJ29wZXJhdG9yLW1vZGlmaWVyJylcbiAgICAgICAga2luZCA9ICdvcC1tb2RpZmllcidcbiAgICAgIGVsc2VcbiAgICAgICAgQmFzZS5nZXRLaW5kRm9yQ29tbWFuZE5hbWUoY29tbWFuZCkgPyAndm1wLW90aGVyJ1xuICAgIGVsc2VcbiAgICAgICdub24tdm1wJ1xuXG4gIGNyZWF0ZVZpbVN0YXRlOiAoZWRpdG9yKSAtPlxuICAgIHZpbVN0YXRlID0gbmV3IFZpbVN0YXRlKGVkaXRvciwgQGdldFN0YXR1c0Jhck1hbmFnZXIoKSwgZ2xvYmFsU3RhdGUpXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWFkZC12aW0tc3RhdGUnLCB2aW1TdGF0ZSlcblxuICBjcmVhdGVWaW1TdGF0ZUlmTmVjZXNzYXJ5OiAoZWRpdG9yKSAtPlxuICAgIHJldHVybiBpZiBWaW1TdGF0ZS5oYXMoZWRpdG9yKVxuICAgIHZpbVN0YXRlID0gbmV3IFZpbVN0YXRlKGVkaXRvciwgQGdldFN0YXR1c0Jhck1hbmFnZXIoKSwgZ2xvYmFsU3RhdGUpXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWFkZC12aW0tc3RhdGUnLCB2aW1TdGF0ZSlcblxuICAjIFNlcnZpY2UgQVBJXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBnZXRHbG9iYWxTdGF0ZTogLT5cbiAgICBnbG9iYWxTdGF0ZVxuXG4gIGdldEVkaXRvclN0YXRlOiAoZWRpdG9yKSAtPlxuICAgIFZpbVN0YXRlLmdldEJ5RWRpdG9yKGVkaXRvcilcblxuICBwcm92aWRlVmltTW9kZVBsdXM6IC0+XG4gICAgQmFzZTogQmFzZVxuICAgIHJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjOiBCYXNlLnJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjXG4gICAgZ2V0R2xvYmFsU3RhdGU6IEBnZXRHbG9iYWxTdGF0ZVxuICAgIGdldEVkaXRvclN0YXRlOiBAZ2V0RWRpdG9yU3RhdGVcbiAgICBvYnNlcnZlVmltU3RhdGVzOiBAb2JzZXJ2ZVZpbVN0YXRlcy5iaW5kKHRoaXMpXG4gICAgb25EaWRBZGRWaW1TdGF0ZTogQG9uRGlkQWRkVmltU3RhdGUuYmluZCh0aGlzKVxuIl19
