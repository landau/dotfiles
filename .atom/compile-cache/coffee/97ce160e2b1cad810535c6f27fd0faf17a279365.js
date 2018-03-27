(function() {
  var CompositeDisposable, Delegato, Disposable, Emitter, LazyLoadedLibs, ModeManager, Range, VimState, jQuery, lazyRequire, ref, settings,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Delegato = require('delegato');

  jQuery = null;

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable, Range = ref.Range;

  settings = require('./settings');

  ModeManager = require('./mode-manager');

  LazyLoadedLibs = {};

  lazyRequire = function(file) {
    if (!(file in LazyLoadedLibs)) {
      if (atom.inDevMode() && settings.get('debug')) {
        console.log("# lazy-require: " + file);
      }
      LazyLoadedLibs[file] = require(file);
    }
    return LazyLoadedLibs[file];
  };

  module.exports = VimState = (function() {
    var fileToLoad, propName, ref1;

    VimState.vimStatesByEditor = new Map;

    VimState.getByEditor = function(editor) {
      return this.vimStatesByEditor.get(editor);
    };

    VimState.has = function(editor) {
      return this.vimStatesByEditor.has(editor);
    };

    VimState["delete"] = function(editor) {
      return this.vimStatesByEditor["delete"](editor);
    };

    VimState.forEach = function(fn) {
      return this.vimStatesByEditor.forEach(fn);
    };

    VimState.clear = function() {
      return this.vimStatesByEditor.clear();
    };

    Delegato.includeInto(VimState);

    VimState.delegatesProperty('mode', 'submode', {
      toProperty: 'modeManager'
    });

    VimState.delegatesMethods('isMode', 'activate', {
      toProperty: 'modeManager'
    });

    VimState.delegatesMethods('flash', 'flashScreenRange', {
      toProperty: 'flashManager'
    });

    VimState.delegatesMethods('subscribe', 'getCount', 'setCount', 'hasCount', 'addToClassList', {
      toProperty: 'operationStack'
    });

    VimState.defineLazyProperty = function(name, fileToLoad, instantiate) {
      if (instantiate == null) {
        instantiate = true;
      }
      return Object.defineProperty(this.prototype, name, {
        get: function() {
          var name1;
          return this[name1 = "__" + name] != null ? this[name1] : this[name1] = (function(_this) {
            return function() {
              if (instantiate) {
                return new (lazyRequire(fileToLoad))(_this);
              } else {
                return lazyRequire(fileToLoad);
              }
            };
          })(this)();
        }
      });
    };

    VimState.prototype.getProp = function(name) {
      if (this["__" + name] != null) {
        return this[name];
      }
    };

    VimState.defineLazyProperty('swrap', './selection-wrapper', false);

    VimState.defineLazyProperty('utils', './utils', false);

    VimState.lazyProperties = {
      mark: './mark-manager',
      register: './register-manager',
      hover: './hover-manager',
      hoverSearchCounter: './hover-manager',
      searchHistory: './search-history-manager',
      highlightSearch: './highlight-search-manager',
      persistentSelection: './persistent-selection-manager',
      occurrenceManager: './occurrence-manager',
      mutationManager: './mutation-manager',
      flashManager: './flash-manager',
      searchInput: './search-input',
      operationStack: './operation-stack',
      cursorStyleManager: './cursor-style-manager'
    };

    ref1 = VimState.lazyProperties;
    for (propName in ref1) {
      fileToLoad = ref1[propName];
      VimState.defineLazyProperty(propName, fileToLoad);
    }

    VimState.prototype.reportRequireCache = function(arg) {
      var cachedPath, cachedPaths, excludeNodModules, focus, i, inspect, len, packPath, path, results;
      focus = arg.focus, excludeNodModules = arg.excludeNodModules;
      inspect = require('util').inspect;
      path = require('path');
      packPath = atom.packages.getLoadedPackage("vim-mode-plus").path;
      cachedPaths = Object.keys(require.cache).filter(function(p) {
        return p.startsWith(packPath + path.sep);
      }).map(function(p) {
        return p.replace(packPath, '');
      });
      results = [];
      for (i = 0, len = cachedPaths.length; i < len; i++) {
        cachedPath = cachedPaths[i];
        if (excludeNodModules && cachedPath.search(/node_modules/) >= 0) {
          continue;
        }
        if (focus && cachedPath.search(RegExp("" + focus)) >= 0) {
          cachedPath = '*' + cachedPath;
        }
        results.push(console.log(cachedPath));
      }
      return results;
    };

    function VimState(editor1, statusBarManager, globalState) {
      var startInsertScopes;
      this.editor = editor1;
      this.statusBarManager = statusBarManager;
      this.globalState = globalState;
      this.destroy = bind(this.destroy, this);
      this.editorElement = this.editor.element;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.modeManager = new ModeManager(this);
      this.previousSelection = {};
      this.observeSelections();
      this.editorElement.classList.add('vim-mode-plus');
      startInsertScopes = this.getConfig('startInInsertModeScopes');
      if (this.getConfig('startInInsertMode') || startInsertScopes.length && this.utils.matchScopes(this.editorElement, startInsertScopes)) {
        this.activate('insert');
      } else {
        this.activate('normal');
      }
      this.editor.onDidDestroy(this.destroy);
      this.constructor.vimStatesByEditor.set(this.editor, this);
    }

    VimState.prototype.getConfig = function(param) {
      return settings.get(param);
    };

    VimState.prototype.getBlockwiseSelections = function() {
      return this.swrap.getBlockwiseSelections(this.editor);
    };

    VimState.prototype.getLastBlockwiseSelection = function() {
      return this.swrap.getLastBlockwiseSelections(this.editor);
    };

    VimState.prototype.getBlockwiseSelectionsOrderedByBufferPosition = function() {
      return this.swrap.getBlockwiseSelectionsOrderedByBufferPosition(this.editor);
    };

    VimState.prototype.clearBlockwiseSelections = function() {
      var ref2;
      return (ref2 = this.getProp('swrap')) != null ? ref2.clearBlockwiseSelections(this.editor) : void 0;
    };

    VimState.prototype.swapClassName = function() {
      var classNames, oldMode, ref2;
      classNames = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      oldMode = this.mode;
      this.editorElement.classList.remove('vim-mode-plus', oldMode + "-mode");
      (ref2 = this.editorElement.classList).add.apply(ref2, classNames);
      return new Disposable((function(_this) {
        return function() {
          var classToAdd, ref3, ref4;
          (ref3 = _this.editorElement.classList).remove.apply(ref3, classNames);
          classToAdd = ['vim-mode-plus', 'is-focused'];
          if (_this.mode === oldMode) {
            classToAdd.push(oldMode + "-mode");
          }
          return (ref4 = _this.editorElement.classList).add.apply(ref4, classToAdd);
        };
      })(this));
    };

    VimState.prototype.onDidChangeSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidChange(fn));
    };

    VimState.prototype.onDidConfirmSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidConfirm(fn));
    };

    VimState.prototype.onDidCancelSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCancel(fn));
    };

    VimState.prototype.onDidCommandSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCommand(fn));
    };

    VimState.prototype.onDidSetTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-set-target', fn));
    };

    VimState.prototype.emitDidSetTarget = function(operator) {
      return this.emitter.emit('did-set-target', operator);
    };

    VimState.prototype.onWillSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('will-select-target', fn));
    };

    VimState.prototype.emitWillSelectTarget = function() {
      return this.emitter.emit('will-select-target');
    };

    VimState.prototype.onDidSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-select-target', fn));
    };

    VimState.prototype.emitDidSelectTarget = function() {
      return this.emitter.emit('did-select-target');
    };

    VimState.prototype.onDidFailSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-fail-select-target', fn));
    };

    VimState.prototype.emitDidFailSelectTarget = function() {
      return this.emitter.emit('did-fail-select-target');
    };

    VimState.prototype.onWillFinishMutation = function(fn) {
      return this.subscribe(this.emitter.on('on-will-finish-mutation', fn));
    };

    VimState.prototype.emitWillFinishMutation = function() {
      return this.emitter.emit('on-will-finish-mutation');
    };

    VimState.prototype.onDidFinishMutation = function(fn) {
      return this.subscribe(this.emitter.on('on-did-finish-mutation', fn));
    };

    VimState.prototype.emitDidFinishMutation = function() {
      return this.emitter.emit('on-did-finish-mutation');
    };

    VimState.prototype.onDidSetOperatorModifier = function(fn) {
      return this.subscribe(this.emitter.on('did-set-operator-modifier', fn));
    };

    VimState.prototype.emitDidSetOperatorModifier = function(options) {
      return this.emitter.emit('did-set-operator-modifier', options);
    };

    VimState.prototype.onDidFinishOperation = function(fn) {
      return this.subscribe(this.emitter.on('did-finish-operation', fn));
    };

    VimState.prototype.emitDidFinishOperation = function() {
      return this.emitter.emit('did-finish-operation');
    };

    VimState.prototype.onDidResetOperationStack = function(fn) {
      return this.subscribe(this.emitter.on('did-reset-operation-stack', fn));
    };

    VimState.prototype.emitDidResetOperationStack = function() {
      return this.emitter.emit('did-reset-operation-stack');
    };

    VimState.prototype.onDidConfirmSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-confirm-select-list', fn));
    };

    VimState.prototype.onDidCancelSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-cancel-select-list', fn));
    };

    VimState.prototype.onWillActivateMode = function(fn) {
      return this.subscribe(this.modeManager.onWillActivateMode(fn));
    };

    VimState.prototype.onDidActivateMode = function(fn) {
      return this.subscribe(this.modeManager.onDidActivateMode(fn));
    };

    VimState.prototype.onWillDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.onWillDeactivateMode(fn));
    };

    VimState.prototype.preemptWillDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.preemptWillDeactivateMode(fn));
    };

    VimState.prototype.onDidDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.onDidDeactivateMode(fn));
    };

    VimState.prototype.onDidFailToPushToOperationStack = function(fn) {
      return this.emitter.on('did-fail-to-push-to-operation-stack', fn);
    };

    VimState.prototype.emitDidFailToPushToOperationStack = function() {
      return this.emitter.emit('did-fail-to-push-to-operation-stack');
    };

    VimState.prototype.onDidDestroy = function(fn) {
      return this.emitter.on('did-destroy', fn);
    };

    VimState.prototype.onDidSetMark = function(fn) {
      return this.emitter.on('did-set-mark', fn);
    };

    VimState.prototype.onDidSetInputChar = function(fn) {
      return this.emitter.on('did-set-input-char', fn);
    };

    VimState.prototype.emitDidSetInputChar = function(char) {
      return this.emitter.emit('did-set-input-char', char);
    };

    VimState.prototype.isAlive = function() {
      return this.constructor.has(this.editor);
    };

    VimState.prototype.destroy = function() {
      var ref2, ref3;
      if (!this.isAlive()) {
        return;
      }
      this.constructor["delete"](this.editor);
      this.subscriptions.dispose();
      if (this.editor.isAlive()) {
        this.resetNormalMode();
        this.reset();
        if ((ref2 = this.editorElement.component) != null) {
          ref2.setInputEnabled(true);
        }
        this.editorElement.classList.remove('vim-mode-plus', 'normal-mode');
      }
      ref3 = {}, this.hover = ref3.hover, this.hoverSearchCounter = ref3.hoverSearchCounter, this.operationStack = ref3.operationStack, this.searchHistory = ref3.searchHistory, this.cursorStyleManager = ref3.cursorStyleManager, this.modeManager = ref3.modeManager, this.register = ref3.register, this.editor = ref3.editor, this.editorElement = ref3.editorElement, this.subscriptions = ref3.subscriptions, this.occurrenceManager = ref3.occurrenceManager, this.previousSelection = ref3.previousSelection, this.persistentSelection = ref3.persistentSelection;
      return this.emitter.emit('did-destroy');
    };

    VimState.prototype.haveSomeNonEmptySelection = function() {
      return this.editor.getSelections().some(function(selection) {
        return !selection.isEmpty();
      });
    };

    VimState.prototype.checkSelection = function(event) {
      var $selection, i, len, ref2, ref3, ref4, wise;
      if (atom.workspace.getActiveTextEditor() !== this.editor) {
        return;
      }
      if ((ref2 = this.getProp('operationStack')) != null ? ref2.isProcessing() : void 0) {
        return;
      }
      if (this.mode === 'insert') {
        return;
      }
      if (this.editorElement !== ((ref3 = event.target) != null ? typeof ref3.closest === "function" ? ref3.closest('atom-text-editor') : void 0 : void 0)) {
        return;
      }
      if (event.type.startsWith('vim-mode-plus')) {
        return;
      }
      if (this.haveSomeNonEmptySelection()) {
        this.editorElement.component.updateSync();
        wise = this.swrap.detectWise(this.editor);
        if (this.isMode('visual', wise)) {
          ref4 = this.swrap.getSelections(this.editor);
          for (i = 0, len = ref4.length; i < len; i++) {
            $selection = ref4[i];
            $selection.saveProperties();
          }
          return this.cursorStyleManager.refresh();
        } else {
          return this.activate('visual', wise);
        }
      } else {
        if (this.mode === 'visual') {
          return this.activate('normal');
        }
      }
    };

    VimState.prototype.observeSelections = function() {
      var checkSelection;
      checkSelection = this.checkSelection.bind(this);
      this.editorElement.addEventListener('mouseup', checkSelection);
      this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.removeEventListener('mouseup', checkSelection);
        };
      })(this)));
      this.subscriptions.add(atom.commands.onDidDispatch(checkSelection));
      this.editorElement.addEventListener('focus', checkSelection);
      return this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.removeEventListener('focus', checkSelection);
        };
      })(this)));
    };

    VimState.prototype.clearSelections = function() {
      return this.editor.setCursorBufferPosition(this.editor.getCursorBufferPosition());
    };

    VimState.prototype.resetNormalMode = function(arg) {
      var ref2, userInvocation;
      userInvocation = (arg != null ? arg : {}).userInvocation;
      this.clearBlockwiseSelections();
      if (userInvocation != null ? userInvocation : false) {
        switch (false) {
          case !this.editor.hasMultipleCursors():
            this.clearSelections();
            break;
          case !(this.hasPersistentSelections() && this.getConfig('clearPersistentSelectionOnResetNormalMode')):
            this.clearPersistentSelections();
            break;
          case !((ref2 = this.getProp('occurrenceManager')) != null ? ref2.hasPatterns() : void 0):
            this.occurrenceManager.resetPatterns();
        }
        if (this.getConfig('clearHighlightSearchOnResetNormalMode')) {
          this.globalState.set('highlightSearchPattern', null);
        }
      } else {
        this.clearSelections();
      }
      return this.activate('normal');
    };

    VimState.prototype.init = function() {
      return this.saveOriginalCursorPosition();
    };

    VimState.prototype.reset = function() {
      var ref2, ref3, ref4, ref5, ref6;
      if ((ref2 = this.getProp('register')) != null) {
        ref2.reset();
      }
      if ((ref3 = this.getProp('searchHistory')) != null) {
        ref3.reset();
      }
      if ((ref4 = this.getProp('hover')) != null) {
        ref4.reset();
      }
      if ((ref5 = this.getProp('operationStack')) != null) {
        ref5.reset();
      }
      return (ref6 = this.getProp('mutationManager')) != null ? ref6.reset() : void 0;
    };

    VimState.prototype.isVisible = function() {
      var ref2;
      return ref2 = this.editor, indexOf.call(this.utils.getVisibleEditors(), ref2) >= 0;
    };

    VimState.prototype.updatePreviousSelection = function() {
      var end, head, properties, ref2, ref3, ref4, start, tail;
      if (this.isMode('visual', 'blockwise')) {
        properties = (ref2 = this.getLastBlockwiseSelection()) != null ? ref2.getProperties() : void 0;
      } else {
        properties = this.swrap(this.editor.getLastSelection()).getProperties();
      }
      if (!properties) {
        return;
      }
      head = properties.head, tail = properties.tail;
      if (head.isGreaterThanOrEqual(tail)) {
        ref3 = [tail, head], start = ref3[0], end = ref3[1];
        head = end = this.utils.translatePointAndClip(this.editor, end, 'forward');
      } else {
        ref4 = [head, tail], start = ref4[0], end = ref4[1];
        tail = end = this.utils.translatePointAndClip(this.editor, end, 'forward');
      }
      this.mark.set('<', start);
      this.mark.set('>', end);
      return this.previousSelection = {
        properties: {
          head: head,
          tail: tail
        },
        submode: this.submode
      };
    };

    VimState.prototype.hasPersistentSelections = function() {
      var ref2;
      return (ref2 = this.getProp('persistentSelection')) != null ? ref2.hasMarkers() : void 0;
    };

    VimState.prototype.getPersistentSelectionBufferRanges = function() {
      var ref2, ref3;
      return (ref2 = (ref3 = this.getProp('persistentSelection')) != null ? ref3.getMarkerBufferRanges() : void 0) != null ? ref2 : [];
    };

    VimState.prototype.clearPersistentSelections = function() {
      var ref2;
      return (ref2 = this.getProp('persistentSelection')) != null ? ref2.clearMarkers() : void 0;
    };

    VimState.prototype.scrollAnimationEffect = null;

    VimState.prototype.requestScrollAnimation = function(from, to, options) {
      if (jQuery == null) {
        jQuery = require('atom-space-pen-views').jQuery;
      }
      return this.scrollAnimationEffect = jQuery(from).animate(to, options);
    };

    VimState.prototype.finishScrollAnimation = function() {
      var ref2;
      if ((ref2 = this.scrollAnimationEffect) != null) {
        ref2.finish();
      }
      return this.scrollAnimationEffect = null;
    };

    VimState.prototype.saveOriginalCursorPosition = function() {
      var point, ref2, selection;
      this.originalCursorPosition = null;
      if ((ref2 = this.originalCursorPositionByMarker) != null) {
        ref2.destroy();
      }
      if (this.mode === 'visual') {
        selection = this.editor.getLastSelection();
        point = this.swrap(selection).getBufferPositionFor('head', {
          from: ['property', 'selection']
        });
      } else {
        point = this.editor.getCursorBufferPosition();
      }
      this.originalCursorPosition = point;
      return this.originalCursorPositionByMarker = this.editor.markBufferPosition(point, {
        invalidate: 'never'
      });
    };

    VimState.prototype.restoreOriginalCursorPosition = function() {
      return this.editor.setCursorBufferPosition(this.getOriginalCursorPosition());
    };

    VimState.prototype.getOriginalCursorPosition = function() {
      return this.originalCursorPosition;
    };

    VimState.prototype.getOriginalCursorPositionByMarker = function() {
      return this.originalCursorPositionByMarker.getStartBufferPosition();
    };

    return VimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdmltLXN0YXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0lBQUE7SUFBQTs7OztFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDWCxNQUFBLEdBQVM7O0VBRVQsTUFBb0QsT0FBQSxDQUFRLE1BQVIsQ0FBcEQsRUFBQyxxQkFBRCxFQUFVLDJCQUFWLEVBQXNCLDZDQUF0QixFQUEyQzs7RUFFM0MsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUNYLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBRWQsY0FBQSxHQUFpQjs7RUFFakIsV0FBQSxHQUFjLFNBQUMsSUFBRDtJQUNaLElBQUEsQ0FBQSxDQUFPLElBQUEsSUFBUSxjQUFmLENBQUE7TUFFRSxJQUFHLElBQUksQ0FBQyxTQUFMLENBQUEsQ0FBQSxJQUFxQixRQUFRLENBQUMsR0FBVCxDQUFhLE9BQWIsQ0FBeEI7UUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLGtCQUFBLEdBQW1CLElBQS9CLEVBREY7O01BSUEsY0FBZSxDQUFBLElBQUEsQ0FBZixHQUF1QixPQUFBLENBQVEsSUFBUixFQU56Qjs7V0FPQSxjQUFlLENBQUEsSUFBQTtFQVJIOztFQVVkLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixRQUFBOztJQUFBLFFBQUMsQ0FBQSxpQkFBRCxHQUFvQixJQUFJOztJQUV4QixRQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsTUFBRDthQUFZLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxHQUFuQixDQUF1QixNQUF2QjtJQUFaOztJQUNkLFFBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxNQUFEO2FBQVksSUFBQyxDQUFBLGlCQUFpQixDQUFDLEdBQW5CLENBQXVCLE1BQXZCO0lBQVo7O0lBQ04sUUFBQyxF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QUFoQztJQUQ2Qjs7dUJBRy9CLHlCQUFBLEdBQTJCLFNBQUE7YUFDekIsSUFBQyxDQUFBO0lBRHdCOzt1QkFHM0IsaUNBQUEsR0FBbUMsU0FBQTthQUNqQyxJQUFDLENBQUEsOEJBQThCLENBQUMsc0JBQWhDLENBQUE7SUFEaUM7Ozs7O0FBOVdyQyIsInNvdXJjZXNDb250ZW50IjpbIkRlbGVnYXRvID0gcmVxdWlyZSAnZGVsZWdhdG8nXG5qUXVlcnkgPSBudWxsXG5cbntFbWl0dGVyLCBEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5Nb2RlTWFuYWdlciA9IHJlcXVpcmUgJy4vbW9kZS1tYW5hZ2VyJ1xuXG5MYXp5TG9hZGVkTGlicyA9IHt9XG5cbmxhenlSZXF1aXJlID0gKGZpbGUpIC0+XG4gIHVubGVzcyBmaWxlIG9mIExhenlMb2FkZWRMaWJzXG5cbiAgICBpZiBhdG9tLmluRGV2TW9kZSgpIGFuZCBzZXR0aW5ncy5nZXQoJ2RlYnVnJylcbiAgICAgIGNvbnNvbGUubG9nIFwiIyBsYXp5LXJlcXVpcmU6ICN7ZmlsZX1cIlxuICAgICAgIyBjb25zb2xlLnRyYWNlKClcblxuICAgIExhenlMb2FkZWRMaWJzW2ZpbGVdID0gcmVxdWlyZShmaWxlKVxuICBMYXp5TG9hZGVkTGlic1tmaWxlXVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBWaW1TdGF0ZVxuICBAdmltU3RhdGVzQnlFZGl0b3I6IG5ldyBNYXBcblxuICBAZ2V0QnlFZGl0b3I6IChlZGl0b3IpIC0+IEB2aW1TdGF0ZXNCeUVkaXRvci5nZXQoZWRpdG9yKVxuICBAaGFzOiAoZWRpdG9yKSAtPiBAdmltU3RhdGVzQnlFZGl0b3IuaGFzKGVkaXRvcilcbiAgQGRlbGV0ZTogKGVkaXRvcikgLT4gQHZpbVN0YXRlc0J5RWRpdG9yLmRlbGV0ZShlZGl0b3IpXG4gIEBmb3JFYWNoOiAoZm4pIC0+IEB2aW1TdGF0ZXNCeUVkaXRvci5mb3JFYWNoKGZuKVxuICBAY2xlYXI6IC0+IEB2aW1TdGF0ZXNCeUVkaXRvci5jbGVhcigpXG5cbiAgRGVsZWdhdG8uaW5jbHVkZUludG8odGhpcylcbiAgQGRlbGVnYXRlc1Byb3BlcnR5KCdtb2RlJywgJ3N1Ym1vZGUnLCB0b1Byb3BlcnR5OiAnbW9kZU1hbmFnZXInKVxuICBAZGVsZWdhdGVzTWV0aG9kcygnaXNNb2RlJywgJ2FjdGl2YXRlJywgdG9Qcm9wZXJ0eTogJ21vZGVNYW5hZ2VyJylcbiAgQGRlbGVnYXRlc01ldGhvZHMoJ2ZsYXNoJywgJ2ZsYXNoU2NyZWVuUmFuZ2UnLCB0b1Byb3BlcnR5OiAnZmxhc2hNYW5hZ2VyJylcbiAgQGRlbGVnYXRlc01ldGhvZHMoJ3N1YnNjcmliZScsICdnZXRDb3VudCcsICdzZXRDb3VudCcsICdoYXNDb3VudCcsICdhZGRUb0NsYXNzTGlzdCcsIHRvUHJvcGVydHk6ICdvcGVyYXRpb25TdGFjaycpXG5cbiAgQGRlZmluZUxhenlQcm9wZXJ0eTogKG5hbWUsIGZpbGVUb0xvYWQsIGluc3RhbnRpYXRlPXRydWUpIC0+XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIG5hbWUsXG4gICAgICBnZXQ6IC0+IHRoaXNbXCJfXyN7bmFtZX1cIl0gPz0gZG8gPT5cbiAgICAgICAgaWYgaW5zdGFudGlhdGVcbiAgICAgICAgICBuZXcgKGxhenlSZXF1aXJlKGZpbGVUb0xvYWQpKSh0aGlzKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbGF6eVJlcXVpcmUoZmlsZVRvTG9hZClcblxuICBnZXRQcm9wOiAobmFtZSkgLT5cbiAgICB0aGlzW25hbWVdIGlmIHRoaXNbXCJfXyN7bmFtZX1cIl0/XG5cbiAgQGRlZmluZUxhenlQcm9wZXJ0eSgnc3dyYXAnLCAnLi9zZWxlY3Rpb24td3JhcHBlcicsIGZhbHNlKVxuICBAZGVmaW5lTGF6eVByb3BlcnR5KCd1dGlscycsICcuL3V0aWxzJywgZmFsc2UpXG5cbiAgQGxhenlQcm9wZXJ0aWVzID1cbiAgICBtYXJrOiAnLi9tYXJrLW1hbmFnZXInXG4gICAgcmVnaXN0ZXI6ICcuL3JlZ2lzdGVyLW1hbmFnZXInXG4gICAgaG92ZXI6ICcuL2hvdmVyLW1hbmFnZXInXG4gICAgaG92ZXJTZWFyY2hDb3VudGVyOiAnLi9ob3Zlci1tYW5hZ2VyJ1xuICAgIHNlYXJjaEhpc3Rvcnk6ICcuL3NlYXJjaC1oaXN0b3J5LW1hbmFnZXInXG4gICAgaGlnaGxpZ2h0U2VhcmNoOiAnLi9oaWdobGlnaHQtc2VhcmNoLW1hbmFnZXInXG4gICAgcGVyc2lzdGVudFNlbGVjdGlvbjogJy4vcGVyc2lzdGVudC1zZWxlY3Rpb24tbWFuYWdlcidcbiAgICBvY2N1cnJlbmNlTWFuYWdlcjogJy4vb2NjdXJyZW5jZS1tYW5hZ2VyJ1xuICAgIG11dGF0aW9uTWFuYWdlcjogJy4vbXV0YXRpb24tbWFuYWdlcidcbiAgICBmbGFzaE1hbmFnZXI6ICcuL2ZsYXNoLW1hbmFnZXInXG4gICAgc2VhcmNoSW5wdXQ6ICcuL3NlYXJjaC1pbnB1dCdcbiAgICBvcGVyYXRpb25TdGFjazogJy4vb3BlcmF0aW9uLXN0YWNrJ1xuICAgIGN1cnNvclN0eWxlTWFuYWdlcjogJy4vY3Vyc29yLXN0eWxlLW1hbmFnZXInXG5cbiAgZm9yIHByb3BOYW1lLCBmaWxlVG9Mb2FkIG9mIEBsYXp5UHJvcGVydGllc1xuICAgIEBkZWZpbmVMYXp5UHJvcGVydHkocHJvcE5hbWUsIGZpbGVUb0xvYWQpXG5cbiAgcmVwb3J0UmVxdWlyZUNhY2hlOiAoe2ZvY3VzLCBleGNsdWRlTm9kTW9kdWxlc30pIC0+XG4gICAge2luc3BlY3R9ID0gcmVxdWlyZSAndXRpbCdcbiAgICBwYXRoID0gcmVxdWlyZSAncGF0aCdcbiAgICBwYWNrUGF0aCA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZShcInZpbS1tb2RlLXBsdXNcIikucGF0aFxuICAgIGNhY2hlZFBhdGhzID0gT2JqZWN0LmtleXMocmVxdWlyZS5jYWNoZSlcbiAgICAgIC5maWx0ZXIgKHApIC0+IHAuc3RhcnRzV2l0aChwYWNrUGF0aCArIHBhdGguc2VwKVxuICAgICAgLm1hcCAocCkgLT4gcC5yZXBsYWNlKHBhY2tQYXRoLCAnJylcblxuICAgIGZvciBjYWNoZWRQYXRoIGluIGNhY2hlZFBhdGhzXG4gICAgICBpZiBleGNsdWRlTm9kTW9kdWxlcyBhbmQgY2FjaGVkUGF0aC5zZWFyY2goL25vZGVfbW9kdWxlcy8pID49IDBcbiAgICAgICAgY29udGludWVcbiAgICAgIGlmIGZvY3VzIGFuZCBjYWNoZWRQYXRoLnNlYXJjaCgvLy8je2ZvY3VzfS8vLykgPj0gMFxuICAgICAgICBjYWNoZWRQYXRoID0gJyonICsgY2FjaGVkUGF0aFxuXG4gICAgICBjb25zb2xlLmxvZyBjYWNoZWRQYXRoXG5cblxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEBzdGF0dXNCYXJNYW5hZ2VyLCBAZ2xvYmFsU3RhdGUpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQgPSBAZWRpdG9yLmVsZW1lbnRcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBtb2RlTWFuYWdlciA9IG5ldyBNb2RlTWFuYWdlcih0aGlzKVxuICAgIEBwcmV2aW91c1NlbGVjdGlvbiA9IHt9XG4gICAgQG9ic2VydmVTZWxlY3Rpb25zKClcblxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3ZpbS1tb2RlLXBsdXMnKVxuICAgIHN0YXJ0SW5zZXJ0U2NvcGVzID0gQGdldENvbmZpZygnc3RhcnRJbkluc2VydE1vZGVTY29wZXMnKVxuXG4gICAgaWYgQGdldENvbmZpZygnc3RhcnRJbkluc2VydE1vZGUnKSBvciBzdGFydEluc2VydFNjb3Blcy5sZW5ndGggYW5kIEB1dGlscy5tYXRjaFNjb3BlcyhAZWRpdG9yRWxlbWVudCwgc3RhcnRJbnNlcnRTY29wZXMpXG4gICAgICBAYWN0aXZhdGUoJ2luc2VydCcpXG4gICAgZWxzZVxuICAgICAgQGFjdGl2YXRlKCdub3JtYWwnKVxuXG4gICAgQGVkaXRvci5vbkRpZERlc3Ryb3koQGRlc3Ryb3kpXG4gICAgQGNvbnN0cnVjdG9yLnZpbVN0YXRlc0J5RWRpdG9yLnNldChAZWRpdG9yLCB0aGlzKVxuXG4gIGdldENvbmZpZzogKHBhcmFtKSAtPlxuICAgIHNldHRpbmdzLmdldChwYXJhbSlcblxuICAjIEJsb2Nrd2lzZVNlbGVjdGlvbnNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGdldEJsb2Nrd2lzZVNlbGVjdGlvbnM6IC0+XG4gICAgQHN3cmFwLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoQGVkaXRvcilcblxuICBnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uOiAtPlxuICAgIEBzd3JhcC5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9ucyhAZWRpdG9yKVxuXG4gIGdldEJsb2Nrd2lzZVNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBAc3dyYXAuZ2V0QmxvY2t3aXNlU2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IpXG5cbiAgY2xlYXJCbG9ja3dpc2VTZWxlY3Rpb25zOiAtPlxuICAgIEBnZXRQcm9wKCdzd3JhcCcpPy5jbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnMoQGVkaXRvcilcblxuICAjIE90aGVyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIEZJWE1FOiBJIHdhbnQgdG8gcmVtb3ZlIHRoaXMgZGVuZ2VyaW91cyBhcHByb2FjaCwgYnV0IEkgY291bGRuJ3QgZmluZCB0aGUgYmV0dGVyIHdheS5cbiAgc3dhcENsYXNzTmFtZTogKGNsYXNzTmFtZXMuLi4pIC0+XG4gICAgb2xkTW9kZSA9IEBtb2RlXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgndmltLW1vZGUtcGx1cycsIG9sZE1vZGUgKyBcIi1tb2RlXCIpXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWVzLi4uKVxuXG4gICAgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lcy4uLilcbiAgICAgIGNsYXNzVG9BZGQgPSBbJ3ZpbS1tb2RlLXBsdXMnLCAnaXMtZm9jdXNlZCddXG4gICAgICBpZiBAbW9kZSBpcyBvbGRNb2RlXG4gICAgICAgIGNsYXNzVG9BZGQucHVzaChvbGRNb2RlICsgXCItbW9kZVwiKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc1RvQWRkLi4uKVxuXG4gICMgQWxsIHN1YnNjcmlwdGlvbnMgaGVyZSBpcyBjZWxhcmVkIG9uIGVhY2ggb3BlcmF0aW9uIGZpbmlzaGVkLlxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb25EaWRDaGFuZ2VTZWFyY2g6IChmbikgLT4gQHN1YnNjcmliZSBAc2VhcmNoSW5wdXQub25EaWRDaGFuZ2UoZm4pXG4gIG9uRGlkQ29uZmlybVNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENvbmZpcm0oZm4pXG4gIG9uRGlkQ2FuY2VsU2VhcmNoOiAoZm4pIC0+IEBzdWJzY3JpYmUgQHNlYXJjaElucHV0Lm9uRGlkQ2FuY2VsKGZuKVxuICBvbkRpZENvbW1hbmRTZWFyY2g6IChmbikgLT4gQHN1YnNjcmliZSBAc2VhcmNoSW5wdXQub25EaWRDb21tYW5kKGZuKVxuXG4gICMgU2VsZWN0IGFuZCB0ZXh0IG11dGF0aW9uKENoYW5nZSlcbiAgb25EaWRTZXRUYXJnZXQ6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXNldC10YXJnZXQnLCBmbilcbiAgZW1pdERpZFNldFRhcmdldDogKG9wZXJhdG9yKSAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2V0LXRhcmdldCcsIG9wZXJhdG9yKVxuXG4gIG9uV2lsbFNlbGVjdFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCd3aWxsLXNlbGVjdC10YXJnZXQnLCBmbilcbiAgZW1pdFdpbGxTZWxlY3RUYXJnZXQ6IC0+IEBlbWl0dGVyLmVtaXQoJ3dpbGwtc2VsZWN0LXRhcmdldCcpXG5cbiAgb25EaWRTZWxlY3RUYXJnZXQ6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXNlbGVjdC10YXJnZXQnLCBmbilcbiAgZW1pdERpZFNlbGVjdFRhcmdldDogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXNlbGVjdC10YXJnZXQnKVxuXG4gIG9uRGlkRmFpbFNlbGVjdFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtZmFpbC1zZWxlY3QtdGFyZ2V0JywgZm4pXG4gIGVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0OiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtZmFpbC1zZWxlY3QtdGFyZ2V0JylcblxuICBvbldpbGxGaW5pc2hNdXRhdGlvbjogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdvbi13aWxsLWZpbmlzaC1tdXRhdGlvbicsIGZuKVxuICBlbWl0V2lsbEZpbmlzaE11dGF0aW9uOiAtPiBAZW1pdHRlci5lbWl0KCdvbi13aWxsLWZpbmlzaC1tdXRhdGlvbicpXG5cbiAgb25EaWRGaW5pc2hNdXRhdGlvbjogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdvbi1kaWQtZmluaXNoLW11dGF0aW9uJywgZm4pXG4gIGVtaXREaWRGaW5pc2hNdXRhdGlvbjogLT4gQGVtaXR0ZXIuZW1pdCgnb24tZGlkLWZpbmlzaC1tdXRhdGlvbicpXG5cbiAgb25EaWRTZXRPcGVyYXRvck1vZGlmaWVyOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1zZXQtb3BlcmF0b3ItbW9kaWZpZXInLCBmbilcbiAgZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXI6IChvcHRpb25zKSAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2V0LW9wZXJhdG9yLW1vZGlmaWVyJywgb3B0aW9ucylcblxuICBvbkRpZEZpbmlzaE9wZXJhdGlvbjogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtZmluaXNoLW9wZXJhdGlvbicsIGZuKVxuICBlbWl0RGlkRmluaXNoT3BlcmF0aW9uOiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtZmluaXNoLW9wZXJhdGlvbicpXG5cbiAgb25EaWRSZXNldE9wZXJhdGlvblN0YWNrOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1yZXNldC1vcGVyYXRpb24tc3RhY2snLCBmbilcbiAgZW1pdERpZFJlc2V0T3BlcmF0aW9uU3RhY2s6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1yZXNldC1vcGVyYXRpb24tc3RhY2snKVxuXG4gICMgU2VsZWN0IGxpc3Qgdmlld1xuICBvbkRpZENvbmZpcm1TZWxlY3RMaXN0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1jb25maXJtLXNlbGVjdC1saXN0JywgZm4pXG4gIG9uRGlkQ2FuY2VsU2VsZWN0TGlzdDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtY2FuY2VsLXNlbGVjdC1saXN0JywgZm4pXG5cbiAgIyBQcm94eWluZyBtb2RlTWFuZ2VyJ3MgZXZlbnQgaG9vayB3aXRoIHNob3J0LWxpZmUgc3Vic2NyaXB0aW9uLlxuICBvbldpbGxBY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25XaWxsQWN0aXZhdGVNb2RlKGZuKVxuICBvbkRpZEFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbkRpZEFjdGl2YXRlTW9kZShmbilcbiAgb25XaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25XaWxsRGVhY3RpdmF0ZU1vZGUoZm4pXG4gIHByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIucHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZShmbilcbiAgb25EaWREZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbkRpZERlYWN0aXZhdGVNb2RlKGZuKVxuXG4gICMgRXZlbnRzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvbkRpZEZhaWxUb1B1c2hUb09wZXJhdGlvblN0YWNrOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtZmFpbC10by1wdXNoLXRvLW9wZXJhdGlvbi1zdGFjaycsIGZuKVxuICBlbWl0RGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2s6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1mYWlsLXRvLXB1c2gtdG8tb3BlcmF0aW9uLXN0YWNrJylcblxuICBvbkRpZERlc3Ryb3k6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgZm4pXG5cbiAgIyAqIGBmbmAge0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbiBtYXJrIHdhcyBzZXQuXG4gICMgICAqIGBuYW1lYCBOYW1lIG9mIG1hcmsgc3VjaCBhcyAnYScuXG4gICMgICAqIGBidWZmZXJQb3NpdGlvbmA6IGJ1ZmZlclBvc2l0aW9uIHdoZXJlIG1hcmsgd2FzIHNldC5cbiAgIyAgICogYGVkaXRvcmA6IGVkaXRvciB3aGVyZSBtYXJrIHdhcyBzZXQuXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgI1xuICAjICBVc2FnZTpcbiAgIyAgIG9uRGlkU2V0TWFyayAoe25hbWUsIGJ1ZmZlclBvc2l0aW9ufSkgLT4gZG8gc29tZXRoaW5nLi5cbiAgb25EaWRTZXRNYXJrOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtc2V0LW1hcmsnLCBmbilcblxuICBvbkRpZFNldElucHV0Q2hhcjogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLXNldC1pbnB1dC1jaGFyJywgZm4pXG4gIGVtaXREaWRTZXRJbnB1dENoYXI6IChjaGFyKSAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2V0LWlucHV0LWNoYXInLCBjaGFyKVxuXG4gIGlzQWxpdmU6IC0+XG4gICAgQGNvbnN0cnVjdG9yLmhhcyhAZWRpdG9yKVxuXG4gIGRlc3Ryb3k6ID0+XG4gICAgcmV0dXJuIHVubGVzcyBAaXNBbGl2ZSgpXG4gICAgQGNvbnN0cnVjdG9yLmRlbGV0ZShAZWRpdG9yKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gICAgaWYgQGVkaXRvci5pc0FsaXZlKClcbiAgICAgIEByZXNldE5vcm1hbE1vZGUoKVxuICAgICAgQHJlc2V0KClcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudD8uc2V0SW5wdXRFbmFibGVkKHRydWUpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd2aW0tbW9kZS1wbHVzJywgJ25vcm1hbC1tb2RlJylcblxuICAgIHtcbiAgICAgIEBob3ZlciwgQGhvdmVyU2VhcmNoQ291bnRlciwgQG9wZXJhdGlvblN0YWNrLFxuICAgICAgQHNlYXJjaEhpc3RvcnksIEBjdXJzb3JTdHlsZU1hbmFnZXJcbiAgICAgIEBtb2RlTWFuYWdlciwgQHJlZ2lzdGVyXG4gICAgICBAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQHN1YnNjcmlwdGlvbnMsXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXJcbiAgICAgIEBwcmV2aW91c1NlbGVjdGlvblxuICAgICAgQHBlcnNpc3RlbnRTZWxlY3Rpb25cbiAgICB9ID0ge31cbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtZGVzdHJveSdcblxuICBoYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uOiAtPlxuICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLnNvbWUoKHNlbGVjdGlvbikgLT4gbm90IHNlbGVjdGlvbi5pc0VtcHR5KCkpXG5cbiAgY2hlY2tTZWxlY3Rpb246IChldmVudCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSBpcyBAZWRpdG9yXG4gICAgcmV0dXJuIGlmIEBnZXRQcm9wKCdvcGVyYXRpb25TdGFjaycpPy5pc1Byb2Nlc3NpbmcoKSAjIERvbid0IHBvcHVsYXRlIGxhenktcHJvcCBvbiBzdGFydHVwXG4gICAgcmV0dXJuIGlmIEBtb2RlIGlzICdpbnNlcnQnXG4gICAgIyBJbnRlbnRpb25hbGx5IHVzaW5nIHRhcmdldC5jbG9zZXN0KCdhdG9tLXRleHQtZWRpdG9yJylcbiAgICAjIERvbid0IHVzZSB0YXJnZXQuZ2V0TW9kZWwoKSB3aGljaCBpcyB3b3JrIGZvciBDdXN0b21FdmVudCBidXQgbm90IHdvcmsgZm9yIG1vdXNlIGV2ZW50LlxuICAgIHJldHVybiB1bmxlc3MgQGVkaXRvckVsZW1lbnQgaXMgZXZlbnQudGFyZ2V0Py5jbG9zZXN0PygnYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgcmV0dXJuIGlmIGV2ZW50LnR5cGUuc3RhcnRzV2l0aCgndmltLW1vZGUtcGx1cycpICMgdG8gbWF0Y2ggdmltLW1vZGUtcGx1czogYW5kIHZpbS1tb2RlLXBsdXMtdXNlcjpcblxuICAgIGlmIEBoYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uKClcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC51cGRhdGVTeW5jKClcbiAgICAgIHdpc2UgPSBAc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKVxuICAgICAgaWYgQGlzTW9kZSgndmlzdWFsJywgd2lzZSlcbiAgICAgICAgZm9yICRzZWxlY3Rpb24gaW4gQHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcbiAgICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcbiAgICAgICAgQGN1cnNvclN0eWxlTWFuYWdlci5yZWZyZXNoKClcbiAgICAgIGVsc2VcbiAgICAgICAgQGFjdGl2YXRlKCd2aXN1YWwnLCB3aXNlKVxuICAgIGVsc2VcbiAgICAgIEBhY3RpdmF0ZSgnbm9ybWFsJykgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcblxuICBvYnNlcnZlU2VsZWN0aW9uczogLT5cbiAgICBjaGVja1NlbGVjdGlvbiA9IEBjaGVja1NlbGVjdGlvbi5iaW5kKHRoaXMpXG4gICAgQGVkaXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGNoZWNrU2VsZWN0aW9uKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQGVkaXRvckVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGNoZWNrU2VsZWN0aW9uKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMub25EaWREaXNwYXRjaChjaGVja1NlbGVjdGlvbilcblxuICAgIEBlZGl0b3JFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgY2hlY2tTZWxlY3Rpb24pXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIGNoZWNrU2VsZWN0aW9uKVxuXG4gICMgV2hhdCdzIHRoaXM/XG4gICMgZWRpdG9yLmNsZWFyU2VsZWN0aW9ucygpIGRvZXNuJ3QgcmVzcGVjdCBsYXN0Q3Vyc29yIHBvc2l0b2luLlxuICAjIFRoaXMgbWV0aG9kIHdvcmtzIGluIHNhbWUgd2F5IGFzIGVkaXRvci5jbGVhclNlbGVjdGlvbnMoKSBidXQgcmVzcGVjdCBsYXN0IGN1cnNvciBwb3NpdGlvbi5cbiAgY2xlYXJTZWxlY3Rpb25zOiAtPlxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuXG4gIHJlc2V0Tm9ybWFsTW9kZTogKHt1c2VySW52b2NhdGlvbn09e30pIC0+XG4gICAgQGNsZWFyQmxvY2t3aXNlU2VsZWN0aW9ucygpXG5cbiAgICBpZiB1c2VySW52b2NhdGlvbiA/IGZhbHNlXG4gICAgICBzd2l0Y2hcbiAgICAgICAgd2hlbiBAZWRpdG9yLmhhc011bHRpcGxlQ3Vyc29ycygpXG4gICAgICAgICAgQGNsZWFyU2VsZWN0aW9ucygpXG4gICAgICAgIHdoZW4gQGhhc1BlcnNpc3RlbnRTZWxlY3Rpb25zKCkgYW5kIEBnZXRDb25maWcoJ2NsZWFyUGVyc2lzdGVudFNlbGVjdGlvbk9uUmVzZXROb3JtYWxNb2RlJylcbiAgICAgICAgICBAY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9ucygpXG4gICAgICAgIHdoZW4gQGdldFByb3AoJ29jY3VycmVuY2VNYW5hZ2VyJyk/Lmhhc1BhdHRlcm5zKClcbiAgICAgICAgICBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpXG5cbiAgICAgIGlmIEBnZXRDb25maWcoJ2NsZWFySGlnaGxpZ2h0U2VhcmNoT25SZXNldE5vcm1hbE1vZGUnKVxuICAgICAgICBAZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbnVsbClcbiAgICBlbHNlXG4gICAgICBAY2xlYXJTZWxlY3Rpb25zKClcbiAgICBAYWN0aXZhdGUoJ25vcm1hbCcpXG5cbiAgaW5pdDogLT5cbiAgICBAc2F2ZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKVxuXG4gIHJlc2V0OiAtPlxuICAgICMgRG9uJ3QgcG9wdWxhdGUgbGF6eS1wcm9wIG9uIHN0YXJ0dXBcbiAgICBAZ2V0UHJvcCgncmVnaXN0ZXInKT8ucmVzZXQoKVxuICAgIEBnZXRQcm9wKCdzZWFyY2hIaXN0b3J5Jyk/LnJlc2V0KClcbiAgICBAZ2V0UHJvcCgnaG92ZXInKT8ucmVzZXQoKVxuICAgIEBnZXRQcm9wKCdvcGVyYXRpb25TdGFjaycpPy5yZXNldCgpXG4gICAgQGdldFByb3AoJ211dGF0aW9uTWFuYWdlcicpPy5yZXNldCgpXG5cbiAgaXNWaXNpYmxlOiAtPlxuICAgIEBlZGl0b3IgaW4gQHV0aWxzLmdldFZpc2libGVFZGl0b3JzKClcblxuICAjIEZJWE1FOiBuYW1pbmcsIHVwZGF0ZUxhc3RTZWxlY3RlZEluZm8gP1xuICB1cGRhdGVQcmV2aW91c1NlbGVjdGlvbjogLT5cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgIHByb3BlcnRpZXMgPSBAZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpPy5nZXRQcm9wZXJ0aWVzKClcbiAgICBlbHNlXG4gICAgICBwcm9wZXJ0aWVzID0gQHN3cmFwKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKS5nZXRQcm9wZXJ0aWVzKClcblxuICAgICMgVE9ETyM3MDQgd2hlbiBjdXJzb3IgaXMgYWRkZWQgaW4gdmlzdWFsLW1vZGUsIGNvcnJlc3BvbmRpbmcgc2VsZWN0aW9uIHByb3AgeWV0IG5vdCBleGlzdHMuXG4gICAgcmV0dXJuIHVubGVzcyBwcm9wZXJ0aWVzXG5cbiAgICB7aGVhZCwgdGFpbH0gPSBwcm9wZXJ0aWVzXG5cbiAgICBpZiBoZWFkLmlzR3JlYXRlclRoYW5PckVxdWFsKHRhaWwpXG4gICAgICBbc3RhcnQsIGVuZF0gPSBbdGFpbCwgaGVhZF1cbiAgICAgIGhlYWQgPSBlbmQgPSBAdXRpbHMudHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBlZGl0b3IsIGVuZCwgJ2ZvcndhcmQnKVxuICAgIGVsc2VcbiAgICAgIFtzdGFydCwgZW5kXSA9IFtoZWFkLCB0YWlsXVxuICAgICAgdGFpbCA9IGVuZCA9IEB1dGlscy50cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgZW5kLCAnZm9yd2FyZCcpXG5cbiAgICBAbWFyay5zZXQoJzwnLCBzdGFydClcbiAgICBAbWFyay5zZXQoJz4nLCBlbmQpXG4gICAgQHByZXZpb3VzU2VsZWN0aW9uID0ge3Byb3BlcnRpZXM6IHtoZWFkLCB0YWlsfSwgQHN1Ym1vZGV9XG5cbiAgIyBQZXJzaXN0ZW50IHNlbGVjdGlvblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaGFzUGVyc2lzdGVudFNlbGVjdGlvbnM6IC0+XG4gICAgQGdldFByb3AoJ3BlcnNpc3RlbnRTZWxlY3Rpb24nKT8uaGFzTWFya2VycygpXG5cbiAgZ2V0UGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlczogLT5cbiAgICBAZ2V0UHJvcCgncGVyc2lzdGVudFNlbGVjdGlvbicpPy5nZXRNYXJrZXJCdWZmZXJSYW5nZXMoKSA/IFtdXG5cbiAgY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uczogLT5cbiAgICBAZ2V0UHJvcCgncGVyc2lzdGVudFNlbGVjdGlvbicpPy5jbGVhck1hcmtlcnMoKVxuXG4gICMgQW5pbWF0aW9uIG1hbmFnZW1lbnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNjcm9sbEFuaW1hdGlvbkVmZmVjdDogbnVsbFxuICByZXF1ZXN0U2Nyb2xsQW5pbWF0aW9uOiAoZnJvbSwgdG8sIG9wdGlvbnMpIC0+XG4gICAgalF1ZXJ5ID89IHJlcXVpcmUoJ2F0b20tc3BhY2UtcGVuLXZpZXdzJykualF1ZXJ5XG4gICAgQHNjcm9sbEFuaW1hdGlvbkVmZmVjdCA9IGpRdWVyeShmcm9tKS5hbmltYXRlKHRvLCBvcHRpb25zKVxuXG4gIGZpbmlzaFNjcm9sbEFuaW1hdGlvbjogLT5cbiAgICBAc2Nyb2xsQW5pbWF0aW9uRWZmZWN0Py5maW5pc2goKVxuICAgIEBzY3JvbGxBbmltYXRpb25FZmZlY3QgPSBudWxsXG5cbiAgIyBPdGhlclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2F2ZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb246IC0+XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb24gPSBudWxsXG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlcj8uZGVzdHJveSgpXG5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgc2VsZWN0aW9uID0gQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKClcbiAgICAgIHBvaW50ID0gQHN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddKVxuICAgIGVsc2VcbiAgICAgIHBvaW50ID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb24gPSBwb2ludFxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXIgPSBAZWRpdG9yLm1hcmtCdWZmZXJQb3NpdGlvbihwb2ludCwgaW52YWxpZGF0ZTogJ25ldmVyJylcblxuICByZXN0b3JlT3JpZ2luYWxDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKEBnZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uKCkpXG5cbiAgZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvblxuXG4gIGdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlcjogLT5cbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyLmdldFN0YXJ0QnVmZmVyUG9zaXRpb24oKVxuIl19
