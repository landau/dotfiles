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
      return this.subscribe(settings.observe('highlightSearch', function(newValue) {
        if (newValue) {
          return globalState.set('highlightSearchPattern', globalState.get('lastSearchPattern'));
        } else {
          return globalState.set('highlightSearchPattern', null);
        }
      }));
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
    subscribe: function(arg) {
      return this.subscriptions.add(arg);
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
      var onDidStart, onDidStop, onWillAddItem;
      onWillAddItem = arg1.onWillAddItem, onDidStart = arg1.onDidStart, onDidStop = arg1.onDidStop;
      return this.subscribe(onDidStart(function() {
        return globalState.set('demoModeIsActive', true);
      }), onDidStop(function() {
        return globalState.set('demoModeIsActive', false);
      }), onWillAddItem((function(_this) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLCtKQUFBO0lBQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixNQUE2QyxPQUFBLENBQVEsTUFBUixDQUE3QyxFQUFDLDJCQUFELEVBQWEscUJBQWIsRUFBc0I7O0VBRXRCLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxnQkFBQSxHQUFtQixPQUFBLENBQVEsc0JBQVI7O0VBQ25CLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxPQUFtRCxPQUFBLENBQVEsU0FBUixDQUFuRCxFQUFDLHNDQUFELEVBQWtCLGdDQUFsQixFQUFnQzs7RUFFaEMsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFBUSxRQUFRLENBQUMsTUFBakI7SUFFQSxRQUFBLEVBQVUsU0FBQyxLQUFEO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUk7TUFDeEIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BRWYsT0FBQSxHQUFVLElBQUMsQ0FBQSxrQkFBRCxDQUFBO01BQ1YsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBWDtNQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLHdCQUFELENBQUE7TUFFQSxJQUFHLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBSDtRQUNFLFFBQVEsQ0FBQyxHQUFULENBQWEsaUJBQWIsRUFBZ0MsSUFBaEMsRUFE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LElBQXZCLENBSmxCOztJQURrQixDQTNPcEI7O0FBWkYiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG57RGlzcG9zYWJsZSwgRW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuU3RhdHVzQmFyTWFuYWdlciA9IHJlcXVpcmUgJy4vc3RhdHVzLWJhci1tYW5hZ2VyJ1xuZ2xvYmFsU3RhdGUgPSByZXF1aXJlICcuL2dsb2JhbC1zdGF0ZSdcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblZpbVN0YXRlID0gcmVxdWlyZSAnLi92aW0tc3RhdGUnXG57Zm9yRWFjaFBhbmVBeGlzLCBhZGRDbGFzc0xpc3QsIHJlbW92ZUNsYXNzTGlzdH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzogc2V0dGluZ3MuY29uZmlnXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN0YXR1c0Jhck1hbmFnZXIgPSBuZXcgU3RhdHVzQmFyTWFuYWdlclxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIHNlcnZpY2UgPSBAcHJvdmlkZVZpbU1vZGVQbHVzKClcbiAgICBAc3Vic2NyaWJlKEJhc2UuaW5pdChzZXJ2aWNlKSlcbiAgICBAcmVnaXN0ZXJDb21tYW5kcygpXG4gICAgQHJlZ2lzdGVyVmltU3RhdGVDb21tYW5kcygpXG5cbiAgICBpZiBhdG9tLmluU3BlY01vZGUoKVxuICAgICAgc2V0dGluZ3Muc2V0KCdzdHJpY3RBc3NlcnRpb24nLCB0cnVlKVxuXG4gICAgaWYgYXRvbS5pbkRldk1vZGUoKVxuICAgICAgZGV2ZWxvcGVyID0gbmV3IChyZXF1aXJlICcuL2RldmVsb3BlcicpXG4gICAgICBAc3Vic2NyaWJlKGRldmVsb3Blci5pbml0KHNlcnZpY2UpKVxuXG4gICAgQHN1YnNjcmliZSBAb2JzZXJ2ZVZpbU1vZGUgLT5cbiAgICAgIG1lc3NhZ2UgPSBcIlwiXCJcbiAgICAgICAgIyMgTWVzc2FnZSBieSB2aW0tbW9kZS1wbHVzOiB2aW0tbW9kZSBkZXRlY3RlZCFcbiAgICAgICAgVG8gdXNlIHZpbS1tb2RlLXBsdXMsIHlvdSBtdXN0ICoqZGlzYWJsZSB2aW0tbW9kZSoqIG1hbnVhbGx5LlxuICAgICAgICBcIlwiXCJcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1lc3NhZ2UsIGRpc21pc3NhYmxlOiB0cnVlKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIHJldHVybiBpZiBlZGl0b3IuaXNNaW5pKClcbiAgICAgIHZpbVN0YXRlID0gbmV3IFZpbVN0YXRlKGVkaXRvciwgQHN0YXR1c0Jhck1hbmFnZXIsIGdsb2JhbFN0YXRlKVxuICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWFkZC12aW0tc3RhdGUnLCB2aW1TdGF0ZSlcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lKEBkZW1heGltaXplUGFuZS5iaW5kKHRoaXMpKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIC0+XG4gICAgICBpZiBzZXR0aW5ncy5nZXQoJ2F1dG9tYXRpY2FsbHlFc2NhcGVJbnNlcnRNb2RlT25BY3RpdmVQYW5lSXRlbUNoYW5nZScpXG4gICAgICAgIFZpbVN0YXRlLmZvckVhY2ggKHZpbVN0YXRlKSAtPlxuICAgICAgICAgIHZpbVN0YXRlLmFjdGl2YXRlKCdub3JtYWwnKSBpZiB2aW1TdGF0ZS5tb2RlIGlzICdpbnNlcnQnXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9uRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0gKGl0ZW0pID0+XG4gICAgICBpZiBhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IoaXRlbSlcbiAgICAgICAgIyBTdGlsbCB0aGVyZSBpcyBwb3NzaWJpbGl0eSBlZGl0b3IgaXMgZGVzdHJveWVkIGFuZCBkb24ndCBoYXZlIGNvcnJlc3BvbmRpbmdcbiAgICAgICAgIyB2aW1TdGF0ZSAjMTk2LlxuICAgICAgICBAZ2V0RWRpdG9yU3RhdGUoaXRlbSk/LmhpZ2hsaWdodFNlYXJjaC5yZWZyZXNoKClcblxuICAgIEBzdWJzY3JpYmUgc2V0dGluZ3Mub2JzZXJ2ZSAnaGlnaGxpZ2h0U2VhcmNoJywgKG5ld1ZhbHVlKSAtPlxuICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgIyBSZS1zZXR0aW5nIHZhbHVlIHRyaWdnZXIgaGlnaGxpZ2h0U2VhcmNoIHJlZnJlc2hcbiAgICAgICAgZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0U2VhcmNoUGF0dGVybicpKVxuICAgICAgZWxzZVxuICAgICAgICBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBudWxsKVxuXG4gIG9ic2VydmVWaW1Nb2RlOiAoZm4pIC0+XG4gICAgZm4oKSBpZiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZSgndmltLW1vZGUnKVxuICAgIGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZVBhY2thZ2UgKHBhY2spIC0+XG4gICAgICBmbigpIGlmIHBhY2submFtZSBpcyAndmltLW1vZGUnXG5cbiAgIyAqIGBmbmAge0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbiB2aW1TdGF0ZSBpbnN0YW5jZSB3YXMgY3JlYXRlZC5cbiAgIyAgVXNhZ2U6XG4gICMgICBvbkRpZEFkZFZpbVN0YXRlICh2aW1TdGF0ZSkgLT4gZG8gc29tZXRoaW5nLi5cbiAgIyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbkRpZEFkZFZpbVN0YXRlOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtYWRkLXZpbS1zdGF0ZScsIGZuKVxuXG4gICMgKiBgZm5gIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdpdGggYWxsIGN1cnJlbnQgYW5kIGZ1dHVyZSB2aW1TdGF0ZVxuICAjICBVc2FnZTpcbiAgIyAgIG9ic2VydmVWaW1TdGF0ZXMgKHZpbVN0YXRlKSAtPiBkbyBzb21ldGhpbmcuLlxuICAjIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9ic2VydmVWaW1TdGF0ZXM6IChmbikgLT5cbiAgICBWaW1TdGF0ZS5mb3JFYWNoKGZuKVxuICAgIEBvbkRpZEFkZFZpbVN0YXRlKGZuKVxuXG4gIGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbkZvckVkaXRvcnM6IC0+XG4gICAgZm9yIGVkaXRvciBpbiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpXG4gICAgICBAZ2V0RWRpdG9yU3RhdGUoZWRpdG9yKS5jbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25zKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIFZpbVN0YXRlLmZvckVhY2ggKHZpbVN0YXRlKSAtPlxuICAgICAgdmltU3RhdGUuZGVzdHJveSgpXG4gICAgVmltU3RhdGUuY2xlYXIoKVxuXG4gIHN1YnNjcmliZTogKGFyZykgLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoYXJnKVxuXG4gIHVuc3Vic2NyaWJlOiAoYXJnKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zLnJlbW92ZShhcmcpXG5cbiAgcmVnaXN0ZXJDb21tYW5kczogLT5cbiAgICBAc3Vic2NyaWJlIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pJyxcbiAgICAgICd2aW0tbW9kZS1wbHVzOmNsZWFyLWhpZ2hsaWdodC1zZWFyY2gnOiAtPiBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBudWxsKVxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6dG9nZ2xlLWhpZ2hsaWdodC1zZWFyY2gnOiAtPiBzZXR0aW5ncy50b2dnbGUoJ2hpZ2hsaWdodFNlYXJjaCcpXG4gICAgICAndmltLW1vZGUtcGx1czpjbGVhci1wZXJzaXN0ZW50LXNlbGVjdGlvbic6ID0+IEBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25Gb3JFZGl0b3JzKClcblxuICAgIEBzdWJzY3JpYmUgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICd2aW0tbW9kZS1wbHVzOm1heGltaXplLXBhbmUnOiA9PiBAbWF4aW1pemVQYW5lKClcbiAgICAgICd2aW0tbW9kZS1wbHVzOmVxdWFsaXplLXBhbmVzJzogPT4gQGVxdWFsaXplUGFuZXMoKVxuXG4gIGRlbWF4aW1pemVQYW5lOiAtPlxuICAgIGlmIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlP1xuICAgICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICBAdW5zdWJzY3JpYmUoQG1heGltaXplUGFuZURpc3Bvc2FibGUpXG4gICAgICBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZSA9IG51bGxcblxuICBtYXhpbWl6ZVBhbmU6IC0+XG4gICAgaWYgQG1heGltaXplUGFuZURpc3Bvc2FibGU/XG4gICAgICBAZGVtYXhpbWl6ZVBhbmUoKVxuICAgICAgcmV0dXJuXG5cbiAgICBnZXRWaWV3ID0gKG1vZGVsKSAtPiBhdG9tLnZpZXdzLmdldFZpZXcobW9kZWwpXG4gICAgY2xhc3NQYW5lTWF4aW1pemVkID0gJ3ZpbS1tb2RlLXBsdXMtLXBhbmUtbWF4aW1pemVkJ1xuICAgIGNsYXNzSGlkZVRhYkJhciA9ICd2aW0tbW9kZS1wbHVzLS1oaWRlLXRhYi1iYXInXG4gICAgY2xhc3NIaWRlU3RhdHVzQmFyID0gJ3ZpbS1tb2RlLXBsdXMtLWhpZGUtc3RhdHVzLWJhcidcbiAgICBjbGFzc0FjdGl2ZVBhbmVBeGlzID0gJ3ZpbS1tb2RlLXBsdXMtLWFjdGl2ZS1wYW5lLWF4aXMnXG5cbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICBwYW5lRWxlbWVudCA9IGdldFZpZXcoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpKVxuXG4gICAgd29ya3NwYWNlQ2xhc3NOYW1lcyA9IFtjbGFzc1BhbmVNYXhpbWl6ZWRdXG4gICAgd29ya3NwYWNlQ2xhc3NOYW1lcy5wdXNoKGNsYXNzSGlkZVRhYkJhcikgaWYgc2V0dGluZ3MuZ2V0KCdoaWRlVGFiQmFyT25NYXhpbWl6ZVBhbmUnKVxuICAgIHdvcmtzcGFjZUNsYXNzTmFtZXMucHVzaChjbGFzc0hpZGVTdGF0dXNCYXIpIGlmIHNldHRpbmdzLmdldCgnaGlkZVN0YXR1c0Jhck9uTWF4aW1pemVQYW5lJylcblxuICAgIGFkZENsYXNzTGlzdCh3b3Jrc3BhY2VFbGVtZW50LCB3b3Jrc3BhY2VDbGFzc05hbWVzLi4uKVxuXG4gICAgZm9yRWFjaFBhbmVBeGlzIChheGlzKSAtPlxuICAgICAgcGFuZUF4aXNFbGVtZW50ID0gZ2V0VmlldyhheGlzKVxuICAgICAgaWYgcGFuZUF4aXNFbGVtZW50LmNvbnRhaW5zKHBhbmVFbGVtZW50KVxuICAgICAgICBhZGRDbGFzc0xpc3QocGFuZUF4aXNFbGVtZW50LCBjbGFzc0FjdGl2ZVBhbmVBeGlzKVxuXG4gICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZSAtPlxuICAgICAgZm9yRWFjaFBhbmVBeGlzIChheGlzKSAtPlxuICAgICAgICByZW1vdmVDbGFzc0xpc3QoZ2V0VmlldyhheGlzKSwgY2xhc3NBY3RpdmVQYW5lQXhpcylcbiAgICAgIHJlbW92ZUNsYXNzTGlzdCh3b3Jrc3BhY2VFbGVtZW50LCB3b3Jrc3BhY2VDbGFzc05hbWVzLi4uKVxuXG4gICAgQHN1YnNjcmliZShAbWF4aW1pemVQYW5lRGlzcG9zYWJsZSlcblxuICBlcXVhbGl6ZVBhbmVzOiAtPlxuICAgIHNldEZsZXhTY2FsZSA9IChuZXdWYWx1ZSwgYmFzZSkgLT5cbiAgICAgIGJhc2UgPz0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmdldENvbnRhaW5lcigpLmdldFJvb3QoKVxuICAgICAgYmFzZS5zZXRGbGV4U2NhbGUobmV3VmFsdWUpXG4gICAgICBmb3IgY2hpbGQgaW4gYmFzZS5jaGlsZHJlbiA/IFtdXG4gICAgICAgIHNldEZsZXhTY2FsZShuZXdWYWx1ZSwgY2hpbGQpXG5cbiAgICBzZXRGbGV4U2NhbGUoMSlcblxuICByZWdpc3RlclZpbVN0YXRlQ29tbWFuZHM6IC0+XG4gICAgIyBhbGwgY29tbWFuZHMgaGVyZSBpcyBleGVjdXRlZCB3aXRoIGNvbnRleHQgd2hlcmUgJ3RoaXMnIGJvdW5kIHRvICd2aW1TdGF0ZSdcbiAgICBjb21tYW5kcyA9XG4gICAgICAnYWN0aXZhdGUtbm9ybWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ25vcm1hbCcpXG4gICAgICAnYWN0aXZhdGUtbGluZXdpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgICAnYWN0aXZhdGUtY2hhcmFjdGVyd2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnKVxuICAgICAgJ2FjdGl2YXRlLWJsb2Nrd2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICAncmVzZXQtbm9ybWFsLW1vZGUnOiAtPiBAcmVzZXROb3JtYWxNb2RlKHVzZXJJbnZvY2F0aW9uOiB0cnVlKVxuICAgICAgJ3NldC1yZWdpc3Rlci1uYW1lJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoKSAjIFwiXG4gICAgICAnc2V0LXJlZ2lzdGVyLW5hbWUtdG8tXyc6IC0+IEByZWdpc3Rlci5zZXROYW1lKCdfJylcbiAgICAgICdzZXQtcmVnaXN0ZXItbmFtZS10by0qJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoJyonKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLWNoYXJhY3Rlcndpc2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIod2lzZTogJ2NoYXJhY3Rlcndpc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLWxpbmV3aXNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKHdpc2U6ICdsaW5ld2lzZScpXG4gICAgICAnb3BlcmF0b3ItbW9kaWZpZXItb2NjdXJyZW5jZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcihvY2N1cnJlbmNlOiB0cnVlLCBvY2N1cnJlbmNlVHlwZTogJ2Jhc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLXN1YndvcmQtb2NjdXJyZW5jZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcihvY2N1cnJlbmNlOiB0cnVlLCBvY2N1cnJlbmNlVHlwZTogJ3N1YndvcmQnKVxuICAgICAgJ3JlcGVhdCc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5SZWNvcmRlZCgpXG4gICAgICAncmVwZWF0LWZpbmQnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudEZpbmQoKVxuICAgICAgJ3JlcGVhdC1maW5kLXJldmVyc2UnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudEZpbmQocmV2ZXJzZTogdHJ1ZSlcbiAgICAgICdyZXBlYXQtc2VhcmNoJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRTZWFyY2goKVxuICAgICAgJ3JlcGVhdC1zZWFyY2gtcmV2ZXJzZSc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50U2VhcmNoKHJldmVyc2U6IHRydWUpXG4gICAgICAnc2V0LWNvdW50LTAnOiAtPiBAc2V0Q291bnQoMClcbiAgICAgICdzZXQtY291bnQtMSc6IC0+IEBzZXRDb3VudCgxKVxuICAgICAgJ3NldC1jb3VudC0yJzogLT4gQHNldENvdW50KDIpXG4gICAgICAnc2V0LWNvdW50LTMnOiAtPiBAc2V0Q291bnQoMylcbiAgICAgICdzZXQtY291bnQtNCc6IC0+IEBzZXRDb3VudCg0KVxuICAgICAgJ3NldC1jb3VudC01JzogLT4gQHNldENvdW50KDUpXG4gICAgICAnc2V0LWNvdW50LTYnOiAtPiBAc2V0Q291bnQoNilcbiAgICAgICdzZXQtY291bnQtNyc6IC0+IEBzZXRDb3VudCg3KVxuICAgICAgJ3NldC1jb3VudC04JzogLT4gQHNldENvdW50KDgpXG4gICAgICAnc2V0LWNvdW50LTknOiAtPiBAc2V0Q291bnQoOSlcblxuICAgIGNoYXJzID0gWzMyLi4xMjZdLm1hcCAoY29kZSkgLT4gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKVxuICAgIGZvciBjaGFyIGluIGNoYXJzXG4gICAgICBkbyAoY2hhcikgLT5cbiAgICAgICAgY2hhckZvcktleW1hcCA9IGlmIGNoYXIgaXMgJyAnIHRoZW4gJ3NwYWNlJyBlbHNlIGNoYXJcbiAgICAgICAgY29tbWFuZHNbXCJzZXQtaW5wdXQtY2hhci0je2NoYXJGb3JLZXltYXB9XCJdID0gLT5cbiAgICAgICAgICBAZW1pdERpZFNldElucHV0Q2hhcihjaGFyKVxuXG4gICAgZ2V0RWRpdG9yU3RhdGUgPSBAZ2V0RWRpdG9yU3RhdGUuYmluZCh0aGlzKVxuXG4gICAgYmluZFRvVmltU3RhdGUgPSAob2xkQ29tbWFuZHMpIC0+XG4gICAgICBuZXdDb21tYW5kcyA9IHt9XG4gICAgICBmb3IgbmFtZSwgZm4gb2Ygb2xkQ29tbWFuZHNcbiAgICAgICAgZG8gKGZuKSAtPlxuICAgICAgICAgIG5ld0NvbW1hbmRzW1widmltLW1vZGUtcGx1czoje25hbWV9XCJdID0gKGV2ZW50KSAtPlxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIGlmIHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUoQGdldE1vZGVsKCkpXG4gICAgICAgICAgICAgIGZuLmNhbGwodmltU3RhdGUsIGV2ZW50KVxuICAgICAgbmV3Q29tbWFuZHNcblxuICAgIEBzdWJzY3JpYmUgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLCBiaW5kVG9WaW1TdGF0ZShjb21tYW5kcykpXG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKHN0YXR1c0JhcikgLT5cbiAgICBAc3RhdHVzQmFyTWFuYWdlci5pbml0aWFsaXplKHN0YXR1c0JhcilcbiAgICBAc3RhdHVzQmFyTWFuYWdlci5hdHRhY2goKVxuICAgIEBzdWJzY3JpYmUgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBzdGF0dXNCYXJNYW5hZ2VyLmRldGFjaCgpXG5cbiAgY29uc3VtZURlbW9Nb2RlOiAoe29uV2lsbEFkZEl0ZW0sIG9uRGlkU3RhcnQsIG9uRGlkU3RvcH0pIC0+XG4gICAgQHN1YnNjcmliZShcbiAgICAgIG9uRGlkU3RhcnQoLT4gZ2xvYmFsU3RhdGUuc2V0KCdkZW1vTW9kZUlzQWN0aXZlJywgdHJ1ZSkpXG4gICAgICBvbkRpZFN0b3AoLT4gZ2xvYmFsU3RhdGUuc2V0KCdkZW1vTW9kZUlzQWN0aXZlJywgZmFsc2UpKVxuICAgICAgb25XaWxsQWRkSXRlbSgoe2l0ZW0sIGV2ZW50fSkgPT5cbiAgICAgICAgaWYgZXZlbnQuYmluZGluZy5jb21tYW5kLnN0YXJ0c1dpdGgoJ3ZpbS1tb2RlLXBsdXM6JylcbiAgICAgICAgICBjb21tYW5kRWxlbWVudCA9IGl0ZW0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY29tbWFuZCcpWzBdXG4gICAgICAgICAgY29tbWFuZEVsZW1lbnQudGV4dENvbnRlbnQgPSBjb21tYW5kRWxlbWVudC50ZXh0Q29udGVudC5yZXBsYWNlKC9edmltLW1vZGUtcGx1czovLCAnJylcblxuICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgna2luZCcsICdwdWxsLXJpZ2h0JylcbiAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IEBnZXRLaW5kRm9yQ29tbWFuZChldmVudC5iaW5kaW5nLmNvbW1hbmQpXG4gICAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQoZWxlbWVudClcbiAgICAgIClcbiAgICApXG5cbiAgZ2V0S2luZEZvckNvbW1hbmQ6IChjb21tYW5kKSAtPlxuICAgIGlmIGNvbW1hbmQuc3RhcnRzV2l0aCgndmltLW1vZGUtcGx1cycpXG4gICAgICBjb21tYW5kID0gY29tbWFuZC5yZXBsYWNlKC9edmltLW1vZGUtcGx1czovLCAnJylcbiAgICAgIGlmIGNvbW1hbmQuc3RhcnRzV2l0aCgnb3BlcmF0b3ItbW9kaWZpZXInKVxuICAgICAgICBraW5kID0gJ29wLW1vZGlmaWVyJ1xuICAgICAgZWxzZVxuICAgICAgICBCYXNlLmdldEtpbmRGb3JDb21tYW5kTmFtZShjb21tYW5kKSA/ICd2bXAtb3RoZXInXG4gICAgZWxzZVxuICAgICAgJ25vbi12bXAnXG5cbiAgIyBTZXJ2aWNlIEFQSVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0R2xvYmFsU3RhdGU6IC0+XG4gICAgZ2xvYmFsU3RhdGVcblxuICBnZXRFZGl0b3JTdGF0ZTogKGVkaXRvcikgLT5cbiAgICBWaW1TdGF0ZS5nZXRCeUVkaXRvcihlZGl0b3IpXG5cbiAgcHJvdmlkZVZpbU1vZGVQbHVzOiAtPlxuICAgIEJhc2U6IEJhc2VcbiAgICBnZXRHbG9iYWxTdGF0ZTogQGdldEdsb2JhbFN0YXRlLmJpbmQodGhpcylcbiAgICBnZXRFZGl0b3JTdGF0ZTogQGdldEVkaXRvclN0YXRlLmJpbmQodGhpcylcbiAgICBvYnNlcnZlVmltU3RhdGVzOiBAb2JzZXJ2ZVZpbVN0YXRlcy5iaW5kKHRoaXMpXG4gICAgb25EaWRBZGRWaW1TdGF0ZTogQG9uRGlkQWRkVmltU3RhdGUuYmluZCh0aGlzKVxuIl19
