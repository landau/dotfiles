(function() {
  var Base, CompositeDisposable, Disposable, Emitter, StatusBarManager, VimState, _, addClassList, forEachPaneAxis, globalState, ref, ref1, removeClassList, settings,
    slice = [].slice;

  _ = require('underscore-plus');

  ref = require('atom'), Disposable = ref.Disposable, Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  StatusBarManager = require('./status-bar-manager');

  globalState = require('./global-state');

  settings = require('./settings');

  VimState = require('./vim-state');

  ref1 = require('./utils'), forEachPaneAxis = ref1.forEachPaneAxis, addClassList = ref1.addClassList, removeClassList = ref1.removeClassList;

  module.exports = {
    config: settings.config,
    activate: function(state) {
      var developer, service;
      this.subscriptions = new CompositeDisposable;
      this.statusBarManager = new StatusBarManager;
      this.emitter = new Emitter;
      service = this.provideVimModePlus();
      this.subscribe(Base.init(service));
      this.registerCommands();
      this.registerVimStateCommands();
      settings.notifyDeprecatedParams();
      if (atom.inSpecMode()) {
        settings.set('strictAssertion', true);
      }
      if (atom.inDevMode()) {
        developer = new (require('./developer'));
        this.subscribe(developer.init(service));
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
          var vimState;
          if (editor.isMini()) {
            return;
          }
          vimState = new VimState(editor, _this.statusBarManager, globalState);
          return _this.emitter.emit('did-add-vim-state', vimState);
        };
      })(this)));
      this.subscribe(atom.workspace.onDidChangeActivePane(this.demaximizePane.bind(this)));
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
          var ref2;
          if (atom.workspace.isTextEditor(item)) {
            return (ref2 = _this.getEditorState(item)) != null ? ref2.highlightSearch.refresh() : void 0;
          }
        };
      })(this)));
      this.subscribe(settings.observe('highlightSearch', function(newValue) {
        if (newValue) {
          return globalState.set('highlightSearchPattern', globalState.get('lastSearchPattern'));
        } else {
          return globalState.set('highlightSearchPattern', null);
        }
      }));
      return this.subscribe.apply(this, settings.observeConditionalKeymaps());
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
      VimState.forEach(fn);
      return this.onDidAddVimState(fn);
    },
    clearPersistentSelectionForEditors: function() {
      var editor, i, len, ref2, results;
      ref2 = atom.workspace.getTextEditors();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        editor = ref2[i];
        results.push(this.getEditorState(editor).clearPersistentSelections());
      }
      return results;
    },
    deactivate: function() {
      this.subscriptions.dispose();
      VimState.forEach(function(vimState) {
        return vimState.destroy();
      });
      return VimState.clear();
    },
    subscribe: function() {
      var args, ref2;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref2 = this.subscriptions).add.apply(ref2, args);
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
      var classActivePaneAxis, classHideStatusBar, classHideTabBar, classPaneMaximized, getView, paneElement, workspaceClassNames, workspaceElement;
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
      addClassList.apply(null, [workspaceElement].concat(slice.call(workspaceClassNames)));
      forEachPaneAxis(function(axis) {
        var paneAxisElement;
        paneAxisElement = getView(axis);
        if (paneAxisElement.contains(paneElement)) {
          return addClassList(paneAxisElement, classActivePaneAxis);
        }
      });
      this.maximizePaneDisposable = new Disposable(function() {
        forEachPaneAxis(function(axis) {
          return removeClassList(getView(axis), classActivePaneAxis);
        });
        return removeClassList.apply(null, [workspaceElement].concat(slice.call(workspaceClassNames)));
      });
      return this.subscribe(this.maximizePaneDisposable);
    },
    equalizePanes: function() {
      var setFlexScale;
      setFlexScale = function(newValue, base) {
        var child, i, len, ref2, ref3, results;
        if (base == null) {
          base = atom.workspace.getActivePane().getContainer().getRoot();
        }
        base.setFlexScale(newValue);
        ref3 = (ref2 = base.children) != null ? ref2 : [];
        results = [];
        for (i = 0, len = ref3.length; i < len; i++) {
          child = ref3[i];
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
      this.statusBarManager.initialize(statusBar);
      this.statusBarManager.attach();
      return this.subscribe(new Disposable((function(_this) {
        return function() {
          return _this.statusBarManager.detach();
        };
      })(this)));
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
      return VimState.forEach(function(vimState) {
        return vimState.flashManager.destroyDemoModeMarkers();
      });
    },
    getKindForCommand: function(command) {
      var kind, ref2;
      if (command.startsWith('vim-mode-plus')) {
        command = command.replace(/^vim-mode-plus:/, '');
        if (command.startsWith('operator-modifier')) {
          return kind = 'op-modifier';
        } else {
          return (ref2 = Base.getKindForCommandName(command)) != null ? ref2 : 'vmp-other';
        }
      } else {
        return 'non-vmp';
      }
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
        getGlobalState: this.getGlobalState.bind(this),
        getEditorState: this.getEditorState.bind(this),
        observeVimStates: this.observeVimStates.bind(this),
        onDidAddVimState: this.onDidAddVimState.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLCtKQUFBO0lBQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixNQUE2QyxPQUFBLENBQVEsTUFBUixDQUE3QyxFQUFDLDJCQUFELEVBQWEscUJBQWIsRUFBc0I7O0VBRXRCLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxnQkFBQSxHQUFtQixPQUFBLENBQVEsc0JBQVI7O0VBQ25CLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxPQUFtRCxPQUFBLENBQVEsU0FBUixDQUFuRCxFQUFDLHNDQUFELEVBQWtCLGdDQUFsQixFQUFnQzs7RUFFaEMsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFBUSxRQUFRLENBQUMsTUFBakI7SUFFQSxRQUFBLEVBQVUsU0FBQyxLQUFEO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUk7TUFDeEIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BRWYsT0FBQSxHQUFVLElBQUMsQ0FBQSxrQkFBRCxDQUFBO01BQ1YsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBWDtNQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLHdCQUFELENBQUE7TUFFQSxRQUFRLENBQUMsc0JBQVQsQ0FBQTtNQUVBLElBQUcsSUFBSSxDQUFDLFVBQUwsQ0FBQSxDQUFIO1FBQ0UsUUFBUSxDQUFDLEdBQVQs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RGMsQ0FqUGhCO0lBb1BBLGtCQUFBLEVBQW9CLFNBQUE7YUFDbEI7UUFBQSxJQUFBLEVBQU0sSUFBTjtRQUNBLGNBQUEsRUFBZ0IsSUFBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixDQURoQjtRQUVBLGNBQUEsRUFBZ0IsSUFBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixDQUZoQjtRQUdBLGdCQUFBLEVBQWtCLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixJQUF2QixDQUhsQjtRQUlBLGdCQUFBLEVBQWtCLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixJQUF2QixDQUpsQjs7SUFEa0IsQ0FwUHBCOztBQVpGIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxue0Rpc3Bvc2FibGUsIEVtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcblN0YXR1c0Jhck1hbmFnZXIgPSByZXF1aXJlICcuL3N0YXR1cy1iYXItbWFuYWdlcidcbmdsb2JhbFN0YXRlID0gcmVxdWlyZSAnLi9nbG9iYWwtc3RhdGUnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5WaW1TdGF0ZSA9IHJlcXVpcmUgJy4vdmltLXN0YXRlJ1xue2ZvckVhY2hQYW5lQXhpcywgYWRkQ2xhc3NMaXN0LCByZW1vdmVDbGFzc0xpc3R9ID0gcmVxdWlyZSAnLi91dGlscydcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6IHNldHRpbmdzLmNvbmZpZ1xuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdGF0dXNCYXJNYW5hZ2VyID0gbmV3IFN0YXR1c0Jhck1hbmFnZXJcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG5cbiAgICBzZXJ2aWNlID0gQHByb3ZpZGVWaW1Nb2RlUGx1cygpXG4gICAgQHN1YnNjcmliZShCYXNlLmluaXQoc2VydmljZSkpXG4gICAgQHJlZ2lzdGVyQ29tbWFuZHMoKVxuICAgIEByZWdpc3RlclZpbVN0YXRlQ29tbWFuZHMoKVxuXG4gICAgc2V0dGluZ3Mubm90aWZ5RGVwcmVjYXRlZFBhcmFtcygpXG5cbiAgICBpZiBhdG9tLmluU3BlY01vZGUoKVxuICAgICAgc2V0dGluZ3Muc2V0KCdzdHJpY3RBc3NlcnRpb24nLCB0cnVlKVxuXG4gICAgaWYgYXRvbS5pbkRldk1vZGUoKVxuICAgICAgZGV2ZWxvcGVyID0gbmV3IChyZXF1aXJlICcuL2RldmVsb3BlcicpXG4gICAgICBAc3Vic2NyaWJlKGRldmVsb3Blci5pbml0KHNlcnZpY2UpKVxuXG4gICAgQHN1YnNjcmliZSBAb2JzZXJ2ZVZpbU1vZGUgLT5cbiAgICAgIG1lc3NhZ2UgPSBcIlwiXCJcbiAgICAgICAgIyMgTWVzc2FnZSBieSB2aW0tbW9kZS1wbHVzOiB2aW0tbW9kZSBkZXRlY3RlZCFcbiAgICAgICAgVG8gdXNlIHZpbS1tb2RlLXBsdXMsIHlvdSBtdXN0ICoqZGlzYWJsZSB2aW0tbW9kZSoqIG1hbnVhbGx5LlxuICAgICAgICBcIlwiXCJcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1lc3NhZ2UsIGRpc21pc3NhYmxlOiB0cnVlKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIHJldHVybiBpZiBlZGl0b3IuaXNNaW5pKClcbiAgICAgIHZpbVN0YXRlID0gbmV3IFZpbVN0YXRlKGVkaXRvciwgQHN0YXR1c0Jhck1hbmFnZXIsIGdsb2JhbFN0YXRlKVxuICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWFkZC12aW0tc3RhdGUnLCB2aW1TdGF0ZSlcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lKEBkZW1heGltaXplUGFuZS5iaW5kKHRoaXMpKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIC0+XG4gICAgICBpZiBzZXR0aW5ncy5nZXQoJ2F1dG9tYXRpY2FsbHlFc2NhcGVJbnNlcnRNb2RlT25BY3RpdmVQYW5lSXRlbUNoYW5nZScpXG4gICAgICAgIFZpbVN0YXRlLmZvckVhY2ggKHZpbVN0YXRlKSAtPlxuICAgICAgICAgIHZpbVN0YXRlLmFjdGl2YXRlKCdub3JtYWwnKSBpZiB2aW1TdGF0ZS5tb2RlIGlzICdpbnNlcnQnXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9uRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0gKGl0ZW0pID0+XG4gICAgICBpZiBhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IoaXRlbSlcbiAgICAgICAgIyBTdGlsbCB0aGVyZSBpcyBwb3NzaWJpbGl0eSBlZGl0b3IgaXMgZGVzdHJveWVkIGFuZCBkb24ndCBoYXZlIGNvcnJlc3BvbmRpbmdcbiAgICAgICAgIyB2aW1TdGF0ZSAjMTk2LlxuICAgICAgICBAZ2V0RWRpdG9yU3RhdGUoaXRlbSk/LmhpZ2hsaWdodFNlYXJjaC5yZWZyZXNoKClcblxuICAgIEBzdWJzY3JpYmUgc2V0dGluZ3Mub2JzZXJ2ZSAnaGlnaGxpZ2h0U2VhcmNoJywgKG5ld1ZhbHVlKSAtPlxuICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgIyBSZS1zZXR0aW5nIHZhbHVlIHRyaWdnZXIgaGlnaGxpZ2h0U2VhcmNoIHJlZnJlc2hcbiAgICAgICAgZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0U2VhcmNoUGF0dGVybicpKVxuICAgICAgZWxzZVxuICAgICAgICBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBudWxsKVxuXG4gICAgQHN1YnNjcmliZShzZXR0aW5ncy5vYnNlcnZlQ29uZGl0aW9uYWxLZXltYXBzKCkuLi4pXG5cbiAgb2JzZXJ2ZVZpbU1vZGU6IChmbikgLT5cbiAgICBmbigpIGlmIGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKCd2aW0tbW9kZScpXG4gICAgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSAocGFjaykgLT5cbiAgICAgIGZuKCkgaWYgcGFjay5uYW1lIGlzICd2aW0tbW9kZSdcblxuICAjICogYGZuYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHZpbVN0YXRlIGluc3RhbmNlIHdhcyBjcmVhdGVkLlxuICAjICBVc2FnZTpcbiAgIyAgIG9uRGlkQWRkVmltU3RhdGUgKHZpbVN0YXRlKSAtPiBkbyBzb21ldGhpbmcuLlxuICAjIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9uRGlkQWRkVmltU3RhdGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1hZGQtdmltLXN0YXRlJywgZm4pXG5cbiAgIyAqIGBmbmAge0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2l0aCBhbGwgY3VycmVudCBhbmQgZnV0dXJlIHZpbVN0YXRlXG4gICMgIFVzYWdlOlxuICAjICAgb2JzZXJ2ZVZpbVN0YXRlcyAodmltU3RhdGUpIC0+IGRvIHNvbWV0aGluZy4uXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb2JzZXJ2ZVZpbVN0YXRlczogKGZuKSAtPlxuICAgIFZpbVN0YXRlLmZvckVhY2goZm4pXG4gICAgQG9uRGlkQWRkVmltU3RhdGUoZm4pXG5cbiAgY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uRm9yRWRpdG9yczogLT5cbiAgICBmb3IgZWRpdG9yIGluIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgIEBnZXRFZGl0b3JTdGF0ZShlZGl0b3IpLmNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbnMoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgVmltU3RhdGUuZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICB2aW1TdGF0ZS5kZXN0cm95KClcbiAgICBWaW1TdGF0ZS5jbGVhcigpXG5cbiAgc3Vic2NyaWJlOiAoYXJncy4uLikgLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoYXJncy4uLilcblxuICB1bnN1YnNjcmliZTogKGFyZykgLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUoYXJnKVxuXG4gIHJlZ2lzdGVyQ29tbWFuZHM6IC0+XG4gICAgQHN1YnNjcmliZSBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsXG4gICAgICAndmltLW1vZGUtcGx1czpjbGVhci1oaWdobGlnaHQtc2VhcmNoJzogLT4gZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbnVsbClcbiAgICAgICd2aW0tbW9kZS1wbHVzOnRvZ2dsZS1oaWdobGlnaHQtc2VhcmNoJzogLT4gc2V0dGluZ3MudG9nZ2xlKCdoaWdobGlnaHRTZWFyY2gnKVxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6Y2xlYXItcGVyc2lzdGVudC1zZWxlY3Rpb24nOiA9PiBAY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uRm9yRWRpdG9ycygpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAndmltLW1vZGUtcGx1czptYXhpbWl6ZS1wYW5lJzogPT4gQG1heGltaXplUGFuZSgpXG4gICAgICAndmltLW1vZGUtcGx1czplcXVhbGl6ZS1wYW5lcyc6ID0+IEBlcXVhbGl6ZVBhbmVzKClcblxuICBkZW1heGltaXplUGFuZTogLT5cbiAgICBpZiBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZT9cbiAgICAgIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgQHVuc3Vic2NyaWJlKEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlKVxuICAgICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUgPSBudWxsXG5cbiAgbWF4aW1pemVQYW5lOiAtPlxuICAgIGlmIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlP1xuICAgICAgQGRlbWF4aW1pemVQYW5lKClcbiAgICAgIHJldHVyblxuXG4gICAgZ2V0VmlldyA9IChtb2RlbCkgLT4gYXRvbS52aWV3cy5nZXRWaWV3KG1vZGVsKVxuICAgIGNsYXNzUGFuZU1heGltaXplZCA9ICd2aW0tbW9kZS1wbHVzLS1wYW5lLW1heGltaXplZCdcbiAgICBjbGFzc0hpZGVUYWJCYXIgPSAndmltLW1vZGUtcGx1cy0taGlkZS10YWItYmFyJ1xuICAgIGNsYXNzSGlkZVN0YXR1c0JhciA9ICd2aW0tbW9kZS1wbHVzLS1oaWRlLXN0YXR1cy1iYXInXG4gICAgY2xhc3NBY3RpdmVQYW5lQXhpcyA9ICd2aW0tbW9kZS1wbHVzLS1hY3RpdmUtcGFuZS1heGlzJ1xuXG4gICAgd29ya3NwYWNlRWxlbWVudCA9IGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgcGFuZUVsZW1lbnQgPSBnZXRWaWV3KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKSlcblxuICAgIHdvcmtzcGFjZUNsYXNzTmFtZXMgPSBbY2xhc3NQYW5lTWF4aW1pemVkXVxuICAgIHdvcmtzcGFjZUNsYXNzTmFtZXMucHVzaChjbGFzc0hpZGVUYWJCYXIpIGlmIHNldHRpbmdzLmdldCgnaGlkZVRhYkJhck9uTWF4aW1pemVQYW5lJylcbiAgICB3b3Jrc3BhY2VDbGFzc05hbWVzLnB1c2goY2xhc3NIaWRlU3RhdHVzQmFyKSBpZiBzZXR0aW5ncy5nZXQoJ2hpZGVTdGF0dXNCYXJPbk1heGltaXplUGFuZScpXG5cbiAgICBhZGRDbGFzc0xpc3Qod29ya3NwYWNlRWxlbWVudCwgd29ya3NwYWNlQ2xhc3NOYW1lcy4uLilcblxuICAgIGZvckVhY2hQYW5lQXhpcyAoYXhpcykgLT5cbiAgICAgIHBhbmVBeGlzRWxlbWVudCA9IGdldFZpZXcoYXhpcylcbiAgICAgIGlmIHBhbmVBeGlzRWxlbWVudC5jb250YWlucyhwYW5lRWxlbWVudClcbiAgICAgICAgYWRkQ2xhc3NMaXN0KHBhbmVBeGlzRWxlbWVudCwgY2xhc3NBY3RpdmVQYW5lQXhpcylcblxuICAgIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlID0gbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgIGZvckVhY2hQYW5lQXhpcyAoYXhpcykgLT5cbiAgICAgICAgcmVtb3ZlQ2xhc3NMaXN0KGdldFZpZXcoYXhpcyksIGNsYXNzQWN0aXZlUGFuZUF4aXMpXG4gICAgICByZW1vdmVDbGFzc0xpc3Qod29ya3NwYWNlRWxlbWVudCwgd29ya3NwYWNlQ2xhc3NOYW1lcy4uLilcblxuICAgIEBzdWJzY3JpYmUoQG1heGltaXplUGFuZURpc3Bvc2FibGUpXG5cbiAgZXF1YWxpemVQYW5lczogLT5cbiAgICBzZXRGbGV4U2NhbGUgPSAobmV3VmFsdWUsIGJhc2UpIC0+XG4gICAgICBiYXNlID89IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5nZXRDb250YWluZXIoKS5nZXRSb290KClcbiAgICAgIGJhc2Uuc2V0RmxleFNjYWxlKG5ld1ZhbHVlKVxuICAgICAgZm9yIGNoaWxkIGluIGJhc2UuY2hpbGRyZW4gPyBbXVxuICAgICAgICBzZXRGbGV4U2NhbGUobmV3VmFsdWUsIGNoaWxkKVxuXG4gICAgc2V0RmxleFNjYWxlKDEpXG5cbiAgcmVnaXN0ZXJWaW1TdGF0ZUNvbW1hbmRzOiAtPlxuICAgICMgYWxsIGNvbW1hbmRzIGhlcmUgaXMgZXhlY3V0ZWQgd2l0aCBjb250ZXh0IHdoZXJlICd0aGlzJyBib3VuZCB0byAndmltU3RhdGUnXG4gICAgY29tbWFuZHMgPVxuICAgICAgJ2FjdGl2YXRlLW5vcm1hbC1tb2RlJzogLT4gQGFjdGl2YXRlKCdub3JtYWwnKVxuICAgICAgJ2FjdGl2YXRlLWxpbmV3aXNlLXZpc3VhbC1tb2RlJzogLT4gQGFjdGl2YXRlKCd2aXN1YWwnLCAnbGluZXdpc2UnKVxuICAgICAgJ2FjdGl2YXRlLWNoYXJhY3Rlcndpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJylcbiAgICAgICdhY3RpdmF0ZS1ibG9ja3dpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgJ3Jlc2V0LW5vcm1hbC1tb2RlJzogLT4gQHJlc2V0Tm9ybWFsTW9kZSh1c2VySW52b2NhdGlvbjogdHJ1ZSlcbiAgICAgICdzZXQtcmVnaXN0ZXItbmFtZSc6IC0+IEByZWdpc3Rlci5zZXROYW1lKCkgIyBcIlxuICAgICAgJ3NldC1yZWdpc3Rlci1uYW1lLXRvLV8nOiAtPiBAcmVnaXN0ZXIuc2V0TmFtZSgnXycpXG4gICAgICAnc2V0LXJlZ2lzdGVyLW5hbWUtdG8tKic6IC0+IEByZWdpc3Rlci5zZXROYW1lKCcqJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1jaGFyYWN0ZXJ3aXNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKHdpc2U6ICdjaGFyYWN0ZXJ3aXNlJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1saW5ld2lzZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcih3aXNlOiAnbGluZXdpc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLW9jY3VycmVuY2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIob2NjdXJyZW5jZTogdHJ1ZSwgb2NjdXJyZW5jZVR5cGU6ICdiYXNlJylcbiAgICAgICdvcGVyYXRvci1tb2RpZmllci1zdWJ3b3JkLW9jY3VycmVuY2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIob2NjdXJyZW5jZTogdHJ1ZSwgb2NjdXJyZW5jZVR5cGU6ICdzdWJ3b3JkJylcbiAgICAgICdyZXBlYXQnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuUmVjb3JkZWQoKVxuICAgICAgJ3JlcGVhdC1maW5kJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRGaW5kKClcbiAgICAgICdyZXBlYXQtZmluZC1yZXZlcnNlJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRGaW5kKHJldmVyc2U6IHRydWUpXG4gICAgICAncmVwZWF0LXNlYXJjaCc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50U2VhcmNoKClcbiAgICAgICdyZXBlYXQtc2VhcmNoLXJldmVyc2UnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudFNlYXJjaChyZXZlcnNlOiB0cnVlKVxuICAgICAgJ3NldC1jb3VudC0wJzogLT4gQHNldENvdW50KDApXG4gICAgICAnc2V0LWNvdW50LTEnOiAtPiBAc2V0Q291bnQoMSlcbiAgICAgICdzZXQtY291bnQtMic6IC0+IEBzZXRDb3VudCgyKVxuICAgICAgJ3NldC1jb3VudC0zJzogLT4gQHNldENvdW50KDMpXG4gICAgICAnc2V0LWNvdW50LTQnOiAtPiBAc2V0Q291bnQoNClcbiAgICAgICdzZXQtY291bnQtNSc6IC0+IEBzZXRDb3VudCg1KVxuICAgICAgJ3NldC1jb3VudC02JzogLT4gQHNldENvdW50KDYpXG4gICAgICAnc2V0LWNvdW50LTcnOiAtPiBAc2V0Q291bnQoNylcbiAgICAgICdzZXQtY291bnQtOCc6IC0+IEBzZXRDb3VudCg4KVxuICAgICAgJ3NldC1jb3VudC05JzogLT4gQHNldENvdW50KDkpXG5cbiAgICBjaGFycyA9IFszMi4uMTI2XS5tYXAgKGNvZGUpIC0+IFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZSlcbiAgICBmb3IgY2hhciBpbiBjaGFyc1xuICAgICAgZG8gKGNoYXIpIC0+XG4gICAgICAgIGNoYXJGb3JLZXltYXAgPSBpZiBjaGFyIGlzICcgJyB0aGVuICdzcGFjZScgZWxzZSBjaGFyXG4gICAgICAgIGNvbW1hbmRzW1wic2V0LWlucHV0LWNoYXItI3tjaGFyRm9yS2V5bWFwfVwiXSA9IC0+XG4gICAgICAgICAgQGVtaXREaWRTZXRJbnB1dENoYXIoY2hhcilcblxuICAgIGdldEVkaXRvclN0YXRlID0gQGdldEVkaXRvclN0YXRlLmJpbmQodGhpcylcblxuICAgIGJpbmRUb1ZpbVN0YXRlID0gKG9sZENvbW1hbmRzKSAtPlxuICAgICAgbmV3Q29tbWFuZHMgPSB7fVxuICAgICAgZm9yIG5hbWUsIGZuIG9mIG9sZENvbW1hbmRzXG4gICAgICAgIGRvIChmbikgLT5cbiAgICAgICAgICBuZXdDb21tYW5kc1tcInZpbS1tb2RlLXBsdXM6I3tuYW1lfVwiXSA9IChldmVudCkgLT5cbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICBpZiB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKEBnZXRNb2RlbCgpKVxuICAgICAgICAgICAgICBmbi5jYWxsKHZpbVN0YXRlLCBldmVudClcbiAgICAgIG5ld0NvbW1hbmRzXG5cbiAgICBAc3Vic2NyaWJlIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pJywgYmluZFRvVmltU3RhdGUoY29tbWFuZHMpKVxuXG4gIGNvbnN1bWVTdGF0dXNCYXI6IChzdGF0dXNCYXIpIC0+XG4gICAgQHN0YXR1c0Jhck1hbmFnZXIuaW5pdGlhbGl6ZShzdGF0dXNCYXIpXG4gICAgQHN0YXR1c0Jhck1hbmFnZXIuYXR0YWNoKClcbiAgICBAc3Vic2NyaWJlIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAc3RhdHVzQmFyTWFuYWdlci5kZXRhY2goKVxuXG4gIGNvbnN1bWVEZW1vTW9kZTogKHtvbldpbGxBZGRJdGVtLCBvbkRpZFN0YXJ0LCBvbkRpZFN0b3AsIG9uRGlkUmVtb3ZlSG92ZXJ9KSAtPlxuICAgIEBzdWJzY3JpYmUoXG4gICAgICBvbkRpZFN0YXJ0KC0+IGdsb2JhbFN0YXRlLnNldCgnZGVtb01vZGVJc0FjdGl2ZScsIHRydWUpKVxuICAgICAgb25EaWRTdG9wKC0+IGdsb2JhbFN0YXRlLnNldCgnZGVtb01vZGVJc0FjdGl2ZScsIGZhbHNlKSlcbiAgICAgIG9uRGlkUmVtb3ZlSG92ZXIoQGRlc3Ryb3lBbGxEZW1vTW9kZUZsYXNoZU1hcmtlcnMuYmluZCh0aGlzKSlcbiAgICAgIG9uV2lsbEFkZEl0ZW0oKHtpdGVtLCBldmVudH0pID0+XG4gICAgICAgIGlmIGV2ZW50LmJpbmRpbmcuY29tbWFuZC5zdGFydHNXaXRoKCd2aW0tbW9kZS1wbHVzOicpXG4gICAgICAgICAgY29tbWFuZEVsZW1lbnQgPSBpdGVtLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NvbW1hbmQnKVswXVxuICAgICAgICAgIGNvbW1hbmRFbGVtZW50LnRleHRDb250ZW50ID0gY29tbWFuZEVsZW1lbnQudGV4dENvbnRlbnQucmVwbGFjZSgvXnZpbS1tb2RlLXBsdXM6LywgJycpXG5cbiAgICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2tpbmQnLCAncHVsbC1yaWdodCcpXG4gICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBAZ2V0S2luZEZvckNvbW1hbmQoZXZlbnQuYmluZGluZy5jb21tYW5kKVxuICAgICAgICBpdGVtLmFwcGVuZENoaWxkKGVsZW1lbnQpXG4gICAgICApXG4gICAgKVxuXG4gIGRlc3Ryb3lBbGxEZW1vTW9kZUZsYXNoZU1hcmtlcnM6IC0+XG4gICAgVmltU3RhdGUuZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICB2aW1TdGF0ZS5mbGFzaE1hbmFnZXIuZGVzdHJveURlbW9Nb2RlTWFya2VycygpXG5cbiAgZ2V0S2luZEZvckNvbW1hbmQ6IChjb21tYW5kKSAtPlxuICAgIGlmIGNvbW1hbmQuc3RhcnRzV2l0aCgndmltLW1vZGUtcGx1cycpXG4gICAgICBjb21tYW5kID0gY29tbWFuZC5yZXBsYWNlKC9edmltLW1vZGUtcGx1czovLCAnJylcbiAgICAgIGlmIGNvbW1hbmQuc3RhcnRzV2l0aCgnb3BlcmF0b3ItbW9kaWZpZXInKVxuICAgICAgICBraW5kID0gJ29wLW1vZGlmaWVyJ1xuICAgICAgZWxzZVxuICAgICAgICBCYXNlLmdldEtpbmRGb3JDb21tYW5kTmFtZShjb21tYW5kKSA/ICd2bXAtb3RoZXInXG4gICAgZWxzZVxuICAgICAgJ25vbi12bXAnXG5cbiAgIyBTZXJ2aWNlIEFQSVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0R2xvYmFsU3RhdGU6IC0+XG4gICAgZ2xvYmFsU3RhdGVcblxuICBnZXRFZGl0b3JTdGF0ZTogKGVkaXRvcikgLT5cbiAgICBWaW1TdGF0ZS5nZXRCeUVkaXRvcihlZGl0b3IpXG5cbiAgcHJvdmlkZVZpbU1vZGVQbHVzOiAtPlxuICAgIEJhc2U6IEJhc2VcbiAgICBnZXRHbG9iYWxTdGF0ZTogQGdldEdsb2JhbFN0YXRlLmJpbmQodGhpcylcbiAgICBnZXRFZGl0b3JTdGF0ZTogQGdldEVkaXRvclN0YXRlLmJpbmQodGhpcylcbiAgICBvYnNlcnZlVmltU3RhdGVzOiBAb2JzZXJ2ZVZpbVN0YXRlcy5iaW5kKHRoaXMpXG4gICAgb25EaWRBZGRWaW1TdGF0ZTogQG9uRGlkQWRkVmltU3RhdGUuYmluZCh0aGlzKVxuIl19
