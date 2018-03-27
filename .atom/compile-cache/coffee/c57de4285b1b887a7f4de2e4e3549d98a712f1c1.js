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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLCtKQUFBO0lBQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixNQUE2QyxPQUFBLENBQVEsTUFBUixDQUE3QyxFQUFDLDJCQUFELEVBQWEscUJBQWIsRUFBc0I7O0VBRXRCLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxnQkFBQSxHQUFtQixPQUFBLENBQVEsc0JBQVI7O0VBQ25CLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxPQUFtRCxPQUFBLENBQVEsU0FBUixDQUFuRCxFQUFDLHNDQUFELEVBQWtCLGdDQUFsQixFQUFnQzs7RUFFaEMsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFBUSxRQUFRLENBQUMsTUFBakI7SUFFQSxRQUFBLEVBQVUsU0FBQyxLQUFEO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUk7TUFDeEIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BRWYsT0FBQSxHQUFVLElBQUMsQ0FBQSxrQkFBRCxDQUFBO01BQ1YsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBWDtNQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLHdCQUFELENBQUE7TUFFQSxJQUFHLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBSDtRQUNFLFFBQVEsQ0FBQyxHQUFULENBQWEsaUJBQWIsRUFBZ0MsSUFBaEMsRUFE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QixTQUFBO2FBQ2xCO1FBQUEsSUFBQSxFQUFNLElBQU47UUFDQSxjQUFBLEVBQWdCLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsQ0FEaEI7UUFFQSxjQUFBLEVBQWdCLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsQ0FGaEI7UUFHQSxnQkFBQSxFQUFrQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FIbEI7UUFJQSxnQkFBQSxFQUFrQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FKbEI7O0lBRGtCLENBbFBwQjs7QUFaRiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbntEaXNwb3NhYmxlLCBFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5TdGF0dXNCYXJNYW5hZ2VyID0gcmVxdWlyZSAnLi9zdGF0dXMtYmFyLW1hbmFnZXInXG5nbG9iYWxTdGF0ZSA9IHJlcXVpcmUgJy4vZ2xvYmFsLXN0YXRlJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuVmltU3RhdGUgPSByZXF1aXJlICcuL3ZpbS1zdGF0ZSdcbntmb3JFYWNoUGFuZUF4aXMsIGFkZENsYXNzTGlzdCwgcmVtb3ZlQ2xhc3NMaXN0fSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOiBzZXR0aW5ncy5jb25maWdcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3RhdHVzQmFyTWFuYWdlciA9IG5ldyBTdGF0dXNCYXJNYW5hZ2VyXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgc2VydmljZSA9IEBwcm92aWRlVmltTW9kZVBsdXMoKVxuICAgIEBzdWJzY3JpYmUoQmFzZS5pbml0KHNlcnZpY2UpKVxuICAgIEByZWdpc3RlckNvbW1hbmRzKClcbiAgICBAcmVnaXN0ZXJWaW1TdGF0ZUNvbW1hbmRzKClcblxuICAgIGlmIGF0b20uaW5TcGVjTW9kZSgpXG4gICAgICBzZXR0aW5ncy5zZXQoJ3N0cmljdEFzc2VydGlvbicsIHRydWUpXG5cbiAgICBpZiBhdG9tLmluRGV2TW9kZSgpXG4gICAgICBkZXZlbG9wZXIgPSBuZXcgKHJlcXVpcmUgJy4vZGV2ZWxvcGVyJylcbiAgICAgIEBzdWJzY3JpYmUoZGV2ZWxvcGVyLmluaXQoc2VydmljZSkpXG5cbiAgICBAc3Vic2NyaWJlIEBvYnNlcnZlVmltTW9kZSAtPlxuICAgICAgbWVzc2FnZSA9IFwiXCJcIlxuICAgICAgICAjIyBNZXNzYWdlIGJ5IHZpbS1tb2RlLXBsdXM6IHZpbS1tb2RlIGRldGVjdGVkIVxuICAgICAgICBUbyB1c2UgdmltLW1vZGUtcGx1cywgeW91IG11c3QgKipkaXNhYmxlIHZpbS1tb2RlKiogbWFudWFsbHkuXG4gICAgICAgIFwiXCJcIlxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcobWVzc2FnZSwgZGlzbWlzc2FibGU6IHRydWUpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgcmV0dXJuIGlmIGVkaXRvci5pc01pbmkoKVxuICAgICAgdmltU3RhdGUgPSBuZXcgVmltU3RhdGUoZWRpdG9yLCBAc3RhdHVzQmFyTWFuYWdlciwgZ2xvYmFsU3RhdGUpXG4gICAgICBAZW1pdHRlci5lbWl0KCdkaWQtYWRkLXZpbS1zdGF0ZScsIHZpbVN0YXRlKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmUoQGRlbWF4aW1pemVQYW5lLmJpbmQodGhpcykpXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gLT5cbiAgICAgIGlmIHNldHRpbmdzLmdldCgnYXV0b21hdGljYWxseUVzY2FwZUluc2VydE1vZGVPbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlJylcbiAgICAgICAgVmltU3RhdGUuZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICAgICAgdmltU3RhdGUuYWN0aXZhdGUoJ25vcm1hbCcpIGlmIHZpbVN0YXRlLm1vZGUgaXMgJ2luc2VydCdcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub25EaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbSAoaXRlbSkgPT5cbiAgICAgIGlmIGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihpdGVtKVxuICAgICAgICAjIFN0aWxsIHRoZXJlIGlzIHBvc3NpYmlsaXR5IGVkaXRvciBpcyBkZXN0cm95ZWQgYW5kIGRvbid0IGhhdmUgY29ycmVzcG9uZGluZ1xuICAgICAgICAjIHZpbVN0YXRlICMxOTYuXG4gICAgICAgIEBnZXRFZGl0b3JTdGF0ZShpdGVtKT8uaGlnaGxpZ2h0U2VhcmNoLnJlZnJlc2goKVxuXG4gICAgQHN1YnNjcmliZSBzZXR0aW5ncy5vYnNlcnZlICdoaWdobGlnaHRTZWFyY2gnLCAobmV3VmFsdWUpIC0+XG4gICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICAjIFJlLXNldHRpbmcgdmFsdWUgdHJpZ2dlciBoaWdobGlnaHRTZWFyY2ggcmVmcmVzaFxuICAgICAgICBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBnbG9iYWxTdGF0ZS5nZXQoJ2xhc3RTZWFyY2hQYXR0ZXJuJykpXG4gICAgICBlbHNlXG4gICAgICAgIGdsb2JhbFN0YXRlLnNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIG51bGwpXG5cbiAgICBAc3Vic2NyaWJlKHNldHRpbmdzLm9ic2VydmVDb25kaXRpb25hbEtleW1hcHMoKS4uLilcblxuICBvYnNlcnZlVmltTW9kZTogKGZuKSAtPlxuICAgIGZuKCkgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUoJ3ZpbS1tb2RlJylcbiAgICBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlIChwYWNrKSAtPlxuICAgICAgZm4oKSBpZiBwYWNrLm5hbWUgaXMgJ3ZpbS1tb2RlJ1xuXG4gICMgKiBgZm5gIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdoZW4gdmltU3RhdGUgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQuXG4gICMgIFVzYWdlOlxuICAjICAgb25EaWRBZGRWaW1TdGF0ZSAodmltU3RhdGUpIC0+IGRvIHNvbWV0aGluZy4uXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWRBZGRWaW1TdGF0ZTogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWFkZC12aW0tc3RhdGUnLCBmbilcblxuICAjICogYGZuYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aXRoIGFsbCBjdXJyZW50IGFuZCBmdXR1cmUgdmltU3RhdGVcbiAgIyAgVXNhZ2U6XG4gICMgICBvYnNlcnZlVmltU3RhdGVzICh2aW1TdGF0ZSkgLT4gZG8gc29tZXRoaW5nLi5cbiAgIyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvYnNlcnZlVmltU3RhdGVzOiAoZm4pIC0+XG4gICAgVmltU3RhdGUuZm9yRWFjaChmbilcbiAgICBAb25EaWRBZGRWaW1TdGF0ZShmbilcblxuICBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25Gb3JFZGl0b3JzOiAtPlxuICAgIGZvciBlZGl0b3IgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKVxuICAgICAgQGdldEVkaXRvclN0YXRlKGVkaXRvcikuY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9ucygpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBWaW1TdGF0ZS5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgIHZpbVN0YXRlLmRlc3Ryb3koKVxuICAgIFZpbVN0YXRlLmNsZWFyKClcblxuICBzdWJzY3JpYmU6IChhcmdzLi4uKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChhcmdzLi4uKVxuXG4gIHVuc3Vic2NyaWJlOiAoYXJnKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zLnJlbW92ZShhcmcpXG5cbiAgcmVnaXN0ZXJDb21tYW5kczogLT5cbiAgICBAc3Vic2NyaWJlIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pJyxcbiAgICAgICd2aW0tbW9kZS1wbHVzOmNsZWFyLWhpZ2hsaWdodC1zZWFyY2gnOiAtPiBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBudWxsKVxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6dG9nZ2xlLWhpZ2hsaWdodC1zZWFyY2gnOiAtPiBzZXR0aW5ncy50b2dnbGUoJ2hpZ2hsaWdodFNlYXJjaCcpXG4gICAgICAndmltLW1vZGUtcGx1czpjbGVhci1wZXJzaXN0ZW50LXNlbGVjdGlvbic6ID0+IEBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25Gb3JFZGl0b3JzKClcblxuICAgIEBzdWJzY3JpYmUgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICd2aW0tbW9kZS1wbHVzOm1heGltaXplLXBhbmUnOiA9PiBAbWF4aW1pemVQYW5lKClcbiAgICAgICd2aW0tbW9kZS1wbHVzOmVxdWFsaXplLXBhbmVzJzogPT4gQGVxdWFsaXplUGFuZXMoKVxuXG4gIGRlbWF4aW1pemVQYW5lOiAtPlxuICAgIGlmIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlP1xuICAgICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICBAdW5zdWJzY3JpYmUoQG1heGltaXplUGFuZURpc3Bvc2FibGUpXG4gICAgICBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZSA9IG51bGxcblxuICBtYXhpbWl6ZVBhbmU6IC0+XG4gICAgaWYgQG1heGltaXplUGFuZURpc3Bvc2FibGU/XG4gICAgICBAZGVtYXhpbWl6ZVBhbmUoKVxuICAgICAgcmV0dXJuXG5cbiAgICBnZXRWaWV3ID0gKG1vZGVsKSAtPiBhdG9tLnZpZXdzLmdldFZpZXcobW9kZWwpXG4gICAgY2xhc3NQYW5lTWF4aW1pemVkID0gJ3ZpbS1tb2RlLXBsdXMtLXBhbmUtbWF4aW1pemVkJ1xuICAgIGNsYXNzSGlkZVRhYkJhciA9ICd2aW0tbW9kZS1wbHVzLS1oaWRlLXRhYi1iYXInXG4gICAgY2xhc3NIaWRlU3RhdHVzQmFyID0gJ3ZpbS1tb2RlLXBsdXMtLWhpZGUtc3RhdHVzLWJhcidcbiAgICBjbGFzc0FjdGl2ZVBhbmVBeGlzID0gJ3ZpbS1tb2RlLXBsdXMtLWFjdGl2ZS1wYW5lLWF4aXMnXG5cbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICBwYW5lRWxlbWVudCA9IGdldFZpZXcoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpKVxuXG4gICAgd29ya3NwYWNlQ2xhc3NOYW1lcyA9IFtjbGFzc1BhbmVNYXhpbWl6ZWRdXG4gICAgd29ya3NwYWNlQ2xhc3NOYW1lcy5wdXNoKGNsYXNzSGlkZVRhYkJhcikgaWYgc2V0dGluZ3MuZ2V0KCdoaWRlVGFiQmFyT25NYXhpbWl6ZVBhbmUnKVxuICAgIHdvcmtzcGFjZUNsYXNzTmFtZXMucHVzaChjbGFzc0hpZGVTdGF0dXNCYXIpIGlmIHNldHRpbmdzLmdldCgnaGlkZVN0YXR1c0Jhck9uTWF4aW1pemVQYW5lJylcblxuICAgIGFkZENsYXNzTGlzdCh3b3Jrc3BhY2VFbGVtZW50LCB3b3Jrc3BhY2VDbGFzc05hbWVzLi4uKVxuXG4gICAgZm9yRWFjaFBhbmVBeGlzIChheGlzKSAtPlxuICAgICAgcGFuZUF4aXNFbGVtZW50ID0gZ2V0VmlldyhheGlzKVxuICAgICAgaWYgcGFuZUF4aXNFbGVtZW50LmNvbnRhaW5zKHBhbmVFbGVtZW50KVxuICAgICAgICBhZGRDbGFzc0xpc3QocGFuZUF4aXNFbGVtZW50LCBjbGFzc0FjdGl2ZVBhbmVBeGlzKVxuXG4gICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZSAtPlxuICAgICAgZm9yRWFjaFBhbmVBeGlzIChheGlzKSAtPlxuICAgICAgICByZW1vdmVDbGFzc0xpc3QoZ2V0VmlldyhheGlzKSwgY2xhc3NBY3RpdmVQYW5lQXhpcylcbiAgICAgIHJlbW92ZUNsYXNzTGlzdCh3b3Jrc3BhY2VFbGVtZW50LCB3b3Jrc3BhY2VDbGFzc05hbWVzLi4uKVxuXG4gICAgQHN1YnNjcmliZShAbWF4aW1pemVQYW5lRGlzcG9zYWJsZSlcblxuICBlcXVhbGl6ZVBhbmVzOiAtPlxuICAgIHNldEZsZXhTY2FsZSA9IChuZXdWYWx1ZSwgYmFzZSkgLT5cbiAgICAgIGJhc2UgPz0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmdldENvbnRhaW5lcigpLmdldFJvb3QoKVxuICAgICAgYmFzZS5zZXRGbGV4U2NhbGUobmV3VmFsdWUpXG4gICAgICBmb3IgY2hpbGQgaW4gYmFzZS5jaGlsZHJlbiA/IFtdXG4gICAgICAgIHNldEZsZXhTY2FsZShuZXdWYWx1ZSwgY2hpbGQpXG5cbiAgICBzZXRGbGV4U2NhbGUoMSlcblxuICByZWdpc3RlclZpbVN0YXRlQ29tbWFuZHM6IC0+XG4gICAgIyBhbGwgY29tbWFuZHMgaGVyZSBpcyBleGVjdXRlZCB3aXRoIGNvbnRleHQgd2hlcmUgJ3RoaXMnIGJvdW5kIHRvICd2aW1TdGF0ZSdcbiAgICBjb21tYW5kcyA9XG4gICAgICAnYWN0aXZhdGUtbm9ybWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ25vcm1hbCcpXG4gICAgICAnYWN0aXZhdGUtbGluZXdpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgICAnYWN0aXZhdGUtY2hhcmFjdGVyd2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnKVxuICAgICAgJ2FjdGl2YXRlLWJsb2Nrd2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICAncmVzZXQtbm9ybWFsLW1vZGUnOiAtPiBAcmVzZXROb3JtYWxNb2RlKHVzZXJJbnZvY2F0aW9uOiB0cnVlKVxuICAgICAgJ3NldC1yZWdpc3Rlci1uYW1lJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoKSAjIFwiXG4gICAgICAnc2V0LXJlZ2lzdGVyLW5hbWUtdG8tXyc6IC0+IEByZWdpc3Rlci5zZXROYW1lKCdfJylcbiAgICAgICdzZXQtcmVnaXN0ZXItbmFtZS10by0qJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoJyonKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLWNoYXJhY3Rlcndpc2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIod2lzZTogJ2NoYXJhY3Rlcndpc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLWxpbmV3aXNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKHdpc2U6ICdsaW5ld2lzZScpXG4gICAgICAnb3BlcmF0b3ItbW9kaWZpZXItb2NjdXJyZW5jZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcihvY2N1cnJlbmNlOiB0cnVlLCBvY2N1cnJlbmNlVHlwZTogJ2Jhc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLXN1YndvcmQtb2NjdXJyZW5jZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcihvY2N1cnJlbmNlOiB0cnVlLCBvY2N1cnJlbmNlVHlwZTogJ3N1YndvcmQnKVxuICAgICAgJ3JlcGVhdCc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5SZWNvcmRlZCgpXG4gICAgICAncmVwZWF0LWZpbmQnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudEZpbmQoKVxuICAgICAgJ3JlcGVhdC1maW5kLXJldmVyc2UnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudEZpbmQocmV2ZXJzZTogdHJ1ZSlcbiAgICAgICdyZXBlYXQtc2VhcmNoJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRTZWFyY2goKVxuICAgICAgJ3JlcGVhdC1zZWFyY2gtcmV2ZXJzZSc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50U2VhcmNoKHJldmVyc2U6IHRydWUpXG4gICAgICAnc2V0LWNvdW50LTAnOiAtPiBAc2V0Q291bnQoMClcbiAgICAgICdzZXQtY291bnQtMSc6IC0+IEBzZXRDb3VudCgxKVxuICAgICAgJ3NldC1jb3VudC0yJzogLT4gQHNldENvdW50KDIpXG4gICAgICAnc2V0LWNvdW50LTMnOiAtPiBAc2V0Q291bnQoMylcbiAgICAgICdzZXQtY291bnQtNCc6IC0+IEBzZXRDb3VudCg0KVxuICAgICAgJ3NldC1jb3VudC01JzogLT4gQHNldENvdW50KDUpXG4gICAgICAnc2V0LWNvdW50LTYnOiAtPiBAc2V0Q291bnQoNilcbiAgICAgICdzZXQtY291bnQtNyc6IC0+IEBzZXRDb3VudCg3KVxuICAgICAgJ3NldC1jb3VudC04JzogLT4gQHNldENvdW50KDgpXG4gICAgICAnc2V0LWNvdW50LTknOiAtPiBAc2V0Q291bnQoOSlcblxuICAgIGNoYXJzID0gWzMyLi4xMjZdLm1hcCAoY29kZSkgLT4gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKVxuICAgIGZvciBjaGFyIGluIGNoYXJzXG4gICAgICBkbyAoY2hhcikgLT5cbiAgICAgICAgY2hhckZvcktleW1hcCA9IGlmIGNoYXIgaXMgJyAnIHRoZW4gJ3NwYWNlJyBlbHNlIGNoYXJcbiAgICAgICAgY29tbWFuZHNbXCJzZXQtaW5wdXQtY2hhci0je2NoYXJGb3JLZXltYXB9XCJdID0gLT5cbiAgICAgICAgICBAZW1pdERpZFNldElucHV0Q2hhcihjaGFyKVxuXG4gICAgZ2V0RWRpdG9yU3RhdGUgPSBAZ2V0RWRpdG9yU3RhdGUuYmluZCh0aGlzKVxuXG4gICAgYmluZFRvVmltU3RhdGUgPSAob2xkQ29tbWFuZHMpIC0+XG4gICAgICBuZXdDb21tYW5kcyA9IHt9XG4gICAgICBmb3IgbmFtZSwgZm4gb2Ygb2xkQ29tbWFuZHNcbiAgICAgICAgZG8gKGZuKSAtPlxuICAgICAgICAgIG5ld0NvbW1hbmRzW1widmltLW1vZGUtcGx1czoje25hbWV9XCJdID0gKGV2ZW50KSAtPlxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIGlmIHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUoQGdldE1vZGVsKCkpXG4gICAgICAgICAgICAgIGZuLmNhbGwodmltU3RhdGUsIGV2ZW50KVxuICAgICAgbmV3Q29tbWFuZHNcblxuICAgIEBzdWJzY3JpYmUgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLCBiaW5kVG9WaW1TdGF0ZShjb21tYW5kcykpXG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKHN0YXR1c0JhcikgLT5cbiAgICBAc3RhdHVzQmFyTWFuYWdlci5pbml0aWFsaXplKHN0YXR1c0JhcilcbiAgICBAc3RhdHVzQmFyTWFuYWdlci5hdHRhY2goKVxuICAgIEBzdWJzY3JpYmUgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBzdGF0dXNCYXJNYW5hZ2VyLmRldGFjaCgpXG5cbiAgY29uc3VtZURlbW9Nb2RlOiAoe29uV2lsbEFkZEl0ZW0sIG9uRGlkU3RhcnQsIG9uRGlkU3RvcCwgb25EaWRSZW1vdmVIb3Zlcn0pIC0+XG4gICAgQHN1YnNjcmliZShcbiAgICAgIG9uRGlkU3RhcnQoLT4gZ2xvYmFsU3RhdGUuc2V0KCdkZW1vTW9kZUlzQWN0aXZlJywgdHJ1ZSkpXG4gICAgICBvbkRpZFN0b3AoLT4gZ2xvYmFsU3RhdGUuc2V0KCdkZW1vTW9kZUlzQWN0aXZlJywgZmFsc2UpKVxuICAgICAgb25EaWRSZW1vdmVIb3ZlcihAZGVzdHJveUFsbERlbW9Nb2RlRmxhc2hlTWFya2Vycy5iaW5kKHRoaXMpKVxuICAgICAgb25XaWxsQWRkSXRlbSgoe2l0ZW0sIGV2ZW50fSkgPT5cbiAgICAgICAgaWYgZXZlbnQuYmluZGluZy5jb21tYW5kLnN0YXJ0c1dpdGgoJ3ZpbS1tb2RlLXBsdXM6JylcbiAgICAgICAgICBjb21tYW5kRWxlbWVudCA9IGl0ZW0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY29tbWFuZCcpWzBdXG4gICAgICAgICAgY29tbWFuZEVsZW1lbnQudGV4dENvbnRlbnQgPSBjb21tYW5kRWxlbWVudC50ZXh0Q29udGVudC5yZXBsYWNlKC9edmltLW1vZGUtcGx1czovLCAnJylcblxuICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgna2luZCcsICdwdWxsLXJpZ2h0JylcbiAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IEBnZXRLaW5kRm9yQ29tbWFuZChldmVudC5iaW5kaW5nLmNvbW1hbmQpXG4gICAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQoZWxlbWVudClcbiAgICAgIClcbiAgICApXG5cbiAgZGVzdHJveUFsbERlbW9Nb2RlRmxhc2hlTWFya2VyczogLT5cbiAgICBWaW1TdGF0ZS5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgIHZpbVN0YXRlLmZsYXNoTWFuYWdlci5kZXN0cm95RGVtb01vZGVNYXJrZXJzKClcblxuICBnZXRLaW5kRm9yQ29tbWFuZDogKGNvbW1hbmQpIC0+XG4gICAgaWYgY29tbWFuZC5zdGFydHNXaXRoKCd2aW0tbW9kZS1wbHVzJylcbiAgICAgIGNvbW1hbmQgPSBjb21tYW5kLnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sICcnKVxuICAgICAgaWYgY29tbWFuZC5zdGFydHNXaXRoKCdvcGVyYXRvci1tb2RpZmllcicpXG4gICAgICAgIGtpbmQgPSAnb3AtbW9kaWZpZXInXG4gICAgICBlbHNlXG4gICAgICAgIEJhc2UuZ2V0S2luZEZvckNvbW1hbmROYW1lKGNvbW1hbmQpID8gJ3ZtcC1vdGhlcidcbiAgICBlbHNlXG4gICAgICAnbm9uLXZtcCdcblxuICAjIFNlcnZpY2UgQVBJXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBnZXRHbG9iYWxTdGF0ZTogLT5cbiAgICBnbG9iYWxTdGF0ZVxuXG4gIGdldEVkaXRvclN0YXRlOiAoZWRpdG9yKSAtPlxuICAgIFZpbVN0YXRlLmdldEJ5RWRpdG9yKGVkaXRvcilcblxuICBwcm92aWRlVmltTW9kZVBsdXM6IC0+XG4gICAgQmFzZTogQmFzZVxuICAgIGdldEdsb2JhbFN0YXRlOiBAZ2V0R2xvYmFsU3RhdGUuYmluZCh0aGlzKVxuICAgIGdldEVkaXRvclN0YXRlOiBAZ2V0RWRpdG9yU3RhdGUuYmluZCh0aGlzKVxuICAgIG9ic2VydmVWaW1TdGF0ZXM6IEBvYnNlcnZlVmltU3RhdGVzLmJpbmQodGhpcylcbiAgICBvbkRpZEFkZFZpbVN0YXRlOiBAb25EaWRBZGRWaW1TdGF0ZS5iaW5kKHRoaXMpXG4iXX0=
