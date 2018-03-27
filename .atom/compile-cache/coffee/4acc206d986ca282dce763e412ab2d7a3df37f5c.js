(function() {
  var BlockwiseSelection, CompositeDisposable, CursorStyleManager, Delegato, Disposable, Emitter, FlashManager, HighlightSearchManager, HoverManager, MarkManager, ModeManager, MutationManager, OccurrenceManager, OperationStack, PersistentSelectionManager, Range, RegisterManager, SearchHistoryManager, SearchInput, VimState, _, getVisibleEditors, haveSomeNonEmptySelection, jQuery, matchScopes, packageScope, ref, ref1, semver, settings, swrap, translatePointAndClip,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  semver = require('semver');

  Delegato = require('delegato');

  jQuery = require('atom-space-pen-views').jQuery;

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable, Range = ref.Range;

  settings = require('./settings');

  HoverManager = require('./hover-manager');

  SearchInput = require('./search-input');

  ref1 = require('./utils'), getVisibleEditors = ref1.getVisibleEditors, matchScopes = ref1.matchScopes, translatePointAndClip = ref1.translatePointAndClip, haveSomeNonEmptySelection = ref1.haveSomeNonEmptySelection;

  swrap = require('./selection-wrapper');

  OperationStack = require('./operation-stack');

  MarkManager = require('./mark-manager');

  ModeManager = require('./mode-manager');

  RegisterManager = require('./register-manager');

  SearchHistoryManager = require('./search-history-manager');

  CursorStyleManager = require('./cursor-style-manager');

  BlockwiseSelection = require('./blockwise-selection');

  OccurrenceManager = require('./occurrence-manager');

  HighlightSearchManager = require('./highlight-search-manager');

  MutationManager = require('./mutation-manager');

  PersistentSelectionManager = require('./persistent-selection-manager');

  FlashManager = require('./flash-manager');

  packageScope = 'vim-mode-plus';

  module.exports = VimState = (function() {
    VimState.vimStatesByEditor = new Map;

    VimState.getByEditor = function(editor) {
      return this.vimStatesByEditor.get(editor);
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

    function VimState(editor1, statusBarManager, globalState) {
      var refreshHighlightSearch;
      this.editor = editor1;
      this.statusBarManager = statusBarManager;
      this.globalState = globalState;
      this.editorElement = this.editor.element;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.modeManager = new ModeManager(this);
      this.mark = new MarkManager(this);
      this.register = new RegisterManager(this);
      this.hover = new HoverManager(this);
      this.hoverSearchCounter = new HoverManager(this);
      this.searchHistory = new SearchHistoryManager(this);
      this.highlightSearch = new HighlightSearchManager(this);
      this.persistentSelection = new PersistentSelectionManager(this);
      this.occurrenceManager = new OccurrenceManager(this);
      this.mutationManager = new MutationManager(this);
      this.flashManager = new FlashManager(this);
      this.searchInput = new SearchInput(this);
      this.operationStack = new OperationStack(this);
      this.cursorStyleManager = new CursorStyleManager(this);
      this.blockwiseSelections = [];
      this.previousSelection = {};
      this.observeSelections();
      refreshHighlightSearch = (function(_this) {
        return function() {
          return _this.highlightSearch.refresh();
        };
      })(this);
      this.subscriptions.add(this.editor.onDidStopChanging(refreshHighlightSearch));
      this.editorElement.classList.add(packageScope);
      if (this.getConfig('startInInsertMode') || matchScopes(this.editorElement, this.getConfig('startInInsertModeScopes'))) {
        this.activate('insert');
      } else {
        this.activate('normal');
      }
      this.subscriptions.add(this.editor.onDidDestroy(this.destroy.bind(this)));
      this.constructor.vimStatesByEditor.set(this.editor, this);
    }

    VimState.prototype.getConfig = function(param) {
      return settings.get(param);
    };

    VimState.prototype.getBlockwiseSelections = function() {
      return BlockwiseSelection.getSelections(this.editor);
    };

    VimState.prototype.getLastBlockwiseSelection = function() {
      return BlockwiseSelection.getLastSelection(this.editor);
    };

    VimState.prototype.getBlockwiseSelectionsOrderedByBufferPosition = function() {
      return BlockwiseSelection.getSelectionsOrderedByBufferPosition(this.editor);
    };

    VimState.prototype.clearBlockwiseSelections = function() {
      return BlockwiseSelection.clearSelections(this.editor);
    };

    VimState.prototype.toggleClassList = function(className, bool) {
      if (bool == null) {
        bool = void 0;
      }
      return this.editorElement.classList.toggle(className, bool);
    };

    VimState.prototype.swapClassName = function() {
      var classNames, oldMode, ref2;
      classNames = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      oldMode = this.mode;
      this.editorElement.classList.remove(oldMode + "-mode");
      this.editorElement.classList.remove('vim-mode-plus');
      (ref2 = this.editorElement.classList).add.apply(ref2, classNames);
      return new Disposable((function(_this) {
        return function() {
          var ref3;
          (ref3 = _this.editorElement.classList).remove.apply(ref3, classNames);
          if (_this.mode === oldMode) {
            _this.editorElement.classList.add(oldMode + "-mode");
          }
          _this.editorElement.classList.add('vim-mode-plus');
          return _this.editorElement.classList.add('is-focused');
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
      return this.constructor.vimStatesByEditor.has(this.editor);
    };

    VimState.prototype.destroy = function() {
      var ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
      if (!this.isAlive()) {
        return;
      }
      this.constructor.vimStatesByEditor["delete"](this.editor);
      BlockwiseSelection.clearSelections(this.editor);
      this.subscriptions.dispose();
      if (this.editor.isAlive()) {
        this.resetNormalMode();
        this.reset();
        if ((ref2 = this.editorElement.component) != null) {
          ref2.setInputEnabled(true);
        }
        this.editorElement.classList.remove(packageScope, 'normal-mode');
      }
      if ((ref3 = this.hover) != null) {
        if (typeof ref3.destroy === "function") {
          ref3.destroy();
        }
      }
      if ((ref4 = this.hoverSearchCounter) != null) {
        if (typeof ref4.destroy === "function") {
          ref4.destroy();
        }
      }
      if ((ref5 = this.searchHistory) != null) {
        if (typeof ref5.destroy === "function") {
          ref5.destroy();
        }
      }
      if ((ref6 = this.cursorStyleManager) != null) {
        if (typeof ref6.destroy === "function") {
          ref6.destroy();
        }
      }
      if ((ref7 = this.search) != null) {
        if (typeof ref7.destroy === "function") {
          ref7.destroy();
        }
      }
      ((ref8 = this.register) != null ? ref8.destroy : void 0) != null;
      ref9 = {}, this.hover = ref9.hover, this.hoverSearchCounter = ref9.hoverSearchCounter, this.operationStack = ref9.operationStack, this.searchHistory = ref9.searchHistory, this.cursorStyleManager = ref9.cursorStyleManager, this.search = ref9.search, this.modeManager = ref9.modeManager, this.register = ref9.register, this.editor = ref9.editor, this.editorElement = ref9.editorElement, this.subscriptions = ref9.subscriptions, this.occurrenceManager = ref9.occurrenceManager, this.previousSelection = ref9.previousSelection, this.persistentSelection = ref9.persistentSelection;
      return this.emitter.emit('did-destroy');
    };

    VimState.prototype.checkSelection = function(event) {
      var $selection, i, len, ref2, ref3, wise;
      if (atom.workspace.getActiveTextEditor() !== this.editor) {
        return;
      }
      if (this.operationStack.isProcessing()) {
        return;
      }
      if (this.mode === 'insert') {
        return;
      }
      if (this.editorElement !== ((ref2 = event.target) != null ? typeof ref2.closest === "function" ? ref2.closest('atom-text-editor') : void 0 : void 0)) {
        return;
      }
      if (event.type.startsWith('vim-mode-plus')) {
        return;
      }
      if (haveSomeNonEmptySelection(this.editor)) {
        this.editorElement.component.updateSync();
        wise = swrap.detectWise(this.editor);
        if (this.isMode('visual', wise)) {
          ref3 = swrap.getSelections(this.editor);
          for (i = 0, len = ref3.length; i < len; i++) {
            $selection = ref3[i];
            $selection.saveProperties();
          }
          return this.updateCursorsVisibility();
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
      var userInvocation;
      userInvocation = (arg != null ? arg : {}).userInvocation;
      BlockwiseSelection.clearSelections(this.editor);
      if (userInvocation != null ? userInvocation : false) {
        switch (false) {
          case !this.editor.hasMultipleCursors():
            this.clearSelections();
            break;
          case !(this.hasPersistentSelections() && this.getConfig('clearPersistentSelectionOnResetNormalMode')):
            this.clearPersistentSelections();
            break;
          case !this.occurrenceManager.hasPatterns():
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
      this.register.reset();
      this.searchHistory.reset();
      this.hover.reset();
      this.operationStack.reset();
      return this.mutationManager.reset();
    };

    VimState.prototype.isVisible = function() {
      var ref2;
      return ref2 = this.editor, indexOf.call(getVisibleEditors(), ref2) >= 0;
    };

    VimState.prototype.updateCursorsVisibility = function() {
      return this.cursorStyleManager.refresh();
    };

    VimState.prototype.updatePreviousSelection = function() {
      var end, head, properties, ref2, ref3, ref4, start, tail;
      if (this.isMode('visual', 'blockwise')) {
        properties = (ref2 = this.getLastBlockwiseSelection()) != null ? ref2.getProperties() : void 0;
      } else {
        properties = swrap(this.editor.getLastSelection()).getProperties();
      }
      if (!properties) {
        return;
      }
      head = properties.head, tail = properties.tail;
      if (head.isGreaterThanOrEqual(tail)) {
        ref3 = [tail, head], start = ref3[0], end = ref3[1];
        head = end = translatePointAndClip(this.editor, end, 'forward');
      } else {
        ref4 = [head, tail], start = ref4[0], end = ref4[1];
        tail = end = translatePointAndClip(this.editor, end, 'forward');
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
      return this.persistentSelection.hasMarkers();
    };

    VimState.prototype.getPersistentSelectionBufferRanges = function() {
      return this.persistentSelection.getMarkerBufferRanges();
    };

    VimState.prototype.clearPersistentSelections = function() {
      return this.persistentSelection.clearMarkers();
    };

    VimState.prototype.scrollAnimationEffect = null;

    VimState.prototype.requestScrollAnimation = function(from, to, options) {
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
        point = swrap(selection).getBufferPositionFor('head', {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdmltLXN0YXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNGNBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDVixTQUFVLE9BQUEsQ0FBUSxzQkFBUjs7RUFFWCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQW9ELE9BQUEsQ0FBUSxNQUFSLENBQXBELEVBQUMscUJBQUQsRUFBVSwyQkFBVixFQUFzQiw2Q0FBdEIsRUFBMkM7O0VBRTNDLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNmLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsT0FBcUYsT0FBQSxDQUFRLFNBQVIsQ0FBckYsRUFBQywwQ0FBRCxFQUFvQiw4QkFBcEIsRUFBaUMsa0RBQWpDLEVBQXdEOztFQUN4RCxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUVSLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSOztFQUNqQixXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsZUFBQSxHQUFrQixPQUFBLENBQVEsb0JBQVI7O0VBQ2xCLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwwQkFBUjs7RUFDdkIsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHdCQUFSOztFQUNyQixrQkFBQSxHQUFxQixPQUFBLENBQVEsdUJBQVI7O0VBQ3JCLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSxzQkFBUjs7RUFDcEIsc0JBQUEsR0FBeUIsT0FBQSxDQUFRLDRCQUFSOztFQUN6QixlQUFBLEdBQWtC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QixTQUFBO0FBQzFCLFVBQUE7TUFBQSxJQUFDLENBQUEsc0JBQUQsR0FBMEI7O1lBQ0ssQ0FBRSxPQUFqQyxDQUFBOztNQUVBLElBQUcsSUFBQyxDQUFBLElBQUQsS0FBUyxRQUFaO1FBQ0UsU0FBQSxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBQTtRQUNaLEtBQUEsR0FBUSxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLG9CQUFqQixDQUFzQyxNQUF0QyxFQUE4QztVQUFBLElBQUEsRUFBTSxDQUFDLFVBQUQsRUFBYSxXQUFiLENBQU47U0FBOUMsRUFGVjtPQUFBLE1BQUE7UUFJRSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLEVBSlY7O01BS0EsSUFBQyxDQUFBLHNCQUFELEdBQTBCO2FBQzFCLElBQUMsQ0FBQSw4QkFBRCxHQUFrQyxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQTJCLEtBQTNCLEVBQWtDO1FBQUEsVUFBQSxFQUFZLE9BQVo7T0FBbEM7SUFWUjs7dUJBWTVCLDZCQUFBLEdBQStCLFNBQUE7YUFDN0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxJQUFDLENBQUEseUJBQUQsQ0FBQSxDQUFoQztJQUQ2Qjs7dUJBRy9CLHlCQUFBLEdBQTJCLFNBQUE7YUFDekIsSUFBQyxDQUFBO0lBRHdCOzt1QkFHM0IsaUNBQUEsR0FBbUMsU0FBQTthQUNqQyxJQUFDLENBQUEsOEJBQThCLENBQUMsc0JBQWhDLENBQUE7SUFEaUM7Ozs7O0FBcFdyQyIsInNvdXJjZXNDb250ZW50IjpbInNlbXZlciA9IHJlcXVpcmUgJ3NlbXZlcidcbkRlbGVnYXRvID0gcmVxdWlyZSAnZGVsZWdhdG8nXG57alF1ZXJ5fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0VtaXR0ZXIsIERpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbkhvdmVyTWFuYWdlciA9IHJlcXVpcmUgJy4vaG92ZXItbWFuYWdlcidcblNlYXJjaElucHV0ID0gcmVxdWlyZSAnLi9zZWFyY2gtaW5wdXQnXG57Z2V0VmlzaWJsZUVkaXRvcnMsIG1hdGNoU2NvcGVzLCB0cmFuc2xhdGVQb2ludEFuZENsaXAsIGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb259ID0gcmVxdWlyZSAnLi91dGlscydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcblxuT3BlcmF0aW9uU3RhY2sgPSByZXF1aXJlICcuL29wZXJhdGlvbi1zdGFjaydcbk1hcmtNYW5hZ2VyID0gcmVxdWlyZSAnLi9tYXJrLW1hbmFnZXInXG5Nb2RlTWFuYWdlciA9IHJlcXVpcmUgJy4vbW9kZS1tYW5hZ2VyJ1xuUmVnaXN0ZXJNYW5hZ2VyID0gcmVxdWlyZSAnLi9yZWdpc3Rlci1tYW5hZ2VyJ1xuU2VhcmNoSGlzdG9yeU1hbmFnZXIgPSByZXF1aXJlICcuL3NlYXJjaC1oaXN0b3J5LW1hbmFnZXInXG5DdXJzb3JTdHlsZU1hbmFnZXIgPSByZXF1aXJlICcuL2N1cnNvci1zdHlsZS1tYW5hZ2VyJ1xuQmxvY2t3aXNlU2VsZWN0aW9uID0gcmVxdWlyZSAnLi9ibG9ja3dpc2Utc2VsZWN0aW9uJ1xuT2NjdXJyZW5jZU1hbmFnZXIgPSByZXF1aXJlICcuL29jY3VycmVuY2UtbWFuYWdlcidcbkhpZ2hsaWdodFNlYXJjaE1hbmFnZXIgPSByZXF1aXJlICcuL2hpZ2hsaWdodC1zZWFyY2gtbWFuYWdlcidcbk11dGF0aW9uTWFuYWdlciA9IHJlcXVpcmUgJy4vbXV0YXRpb24tbWFuYWdlcidcblBlcnNpc3RlbnRTZWxlY3Rpb25NYW5hZ2VyID0gcmVxdWlyZSAnLi9wZXJzaXN0ZW50LXNlbGVjdGlvbi1tYW5hZ2VyJ1xuRmxhc2hNYW5hZ2VyID0gcmVxdWlyZSAnLi9mbGFzaC1tYW5hZ2VyJ1xuXG5wYWNrYWdlU2NvcGUgPSAndmltLW1vZGUtcGx1cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVmltU3RhdGVcbiAgQHZpbVN0YXRlc0J5RWRpdG9yOiBuZXcgTWFwXG5cbiAgQGdldEJ5RWRpdG9yOiAoZWRpdG9yKSAtPlxuICAgIEB2aW1TdGF0ZXNCeUVkaXRvci5nZXQoZWRpdG9yKVxuXG4gIEBmb3JFYWNoOiAoZm4pIC0+XG4gICAgQHZpbVN0YXRlc0J5RWRpdG9yLmZvckVhY2goZm4pXG5cbiAgQGNsZWFyOiAtPlxuICAgIEB2aW1TdGF0ZXNCeUVkaXRvci5jbGVhcigpXG5cbiAgRGVsZWdhdG8uaW5jbHVkZUludG8odGhpcylcblxuICBAZGVsZWdhdGVzUHJvcGVydHkoJ21vZGUnLCAnc3VibW9kZScsIHRvUHJvcGVydHk6ICdtb2RlTWFuYWdlcicpXG4gIEBkZWxlZ2F0ZXNNZXRob2RzKCdpc01vZGUnLCAnYWN0aXZhdGUnLCB0b1Byb3BlcnR5OiAnbW9kZU1hbmFnZXInKVxuICBAZGVsZWdhdGVzTWV0aG9kcygnZmxhc2gnLCAnZmxhc2hTY3JlZW5SYW5nZScsIHRvUHJvcGVydHk6ICdmbGFzaE1hbmFnZXInKVxuICBAZGVsZWdhdGVzTWV0aG9kcygnc3Vic2NyaWJlJywgJ2dldENvdW50JywgJ3NldENvdW50JywgJ2hhc0NvdW50JywgJ2FkZFRvQ2xhc3NMaXN0JywgdG9Qcm9wZXJ0eTogJ29wZXJhdGlvblN0YWNrJylcblxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEBzdGF0dXNCYXJNYW5hZ2VyLCBAZ2xvYmFsU3RhdGUpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQgPSBAZWRpdG9yLmVsZW1lbnRcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBtb2RlTWFuYWdlciA9IG5ldyBNb2RlTWFuYWdlcih0aGlzKVxuICAgIEBtYXJrID0gbmV3IE1hcmtNYW5hZ2VyKHRoaXMpXG4gICAgQHJlZ2lzdGVyID0gbmV3IFJlZ2lzdGVyTWFuYWdlcih0aGlzKVxuICAgIEBob3ZlciA9IG5ldyBIb3Zlck1hbmFnZXIodGhpcylcbiAgICBAaG92ZXJTZWFyY2hDb3VudGVyID0gbmV3IEhvdmVyTWFuYWdlcih0aGlzKVxuICAgIEBzZWFyY2hIaXN0b3J5ID0gbmV3IFNlYXJjaEhpc3RvcnlNYW5hZ2VyKHRoaXMpXG4gICAgQGhpZ2hsaWdodFNlYXJjaCA9IG5ldyBIaWdobGlnaHRTZWFyY2hNYW5hZ2VyKHRoaXMpXG4gICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24gPSBuZXcgUGVyc2lzdGVudFNlbGVjdGlvbk1hbmFnZXIodGhpcylcbiAgICBAb2NjdXJyZW5jZU1hbmFnZXIgPSBuZXcgT2NjdXJyZW5jZU1hbmFnZXIodGhpcylcbiAgICBAbXV0YXRpb25NYW5hZ2VyID0gbmV3IE11dGF0aW9uTWFuYWdlcih0aGlzKVxuICAgIEBmbGFzaE1hbmFnZXIgPSBuZXcgRmxhc2hNYW5hZ2VyKHRoaXMpXG4gICAgQHNlYXJjaElucHV0ID0gbmV3IFNlYXJjaElucHV0KHRoaXMpXG4gICAgQG9wZXJhdGlvblN0YWNrID0gbmV3IE9wZXJhdGlvblN0YWNrKHRoaXMpXG4gICAgQGN1cnNvclN0eWxlTWFuYWdlciA9IG5ldyBDdXJzb3JTdHlsZU1hbmFnZXIodGhpcylcbiAgICBAYmxvY2t3aXNlU2VsZWN0aW9ucyA9IFtdXG4gICAgQHByZXZpb3VzU2VsZWN0aW9uID0ge31cbiAgICBAb2JzZXJ2ZVNlbGVjdGlvbnMoKVxuXG4gICAgcmVmcmVzaEhpZ2hsaWdodFNlYXJjaCA9ID0+XG4gICAgICBAaGlnaGxpZ2h0U2VhcmNoLnJlZnJlc2goKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkU3RvcENoYW5naW5nKHJlZnJlc2hIaWdobGlnaHRTZWFyY2gpXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKHBhY2thZ2VTY29wZSlcbiAgICBpZiBAZ2V0Q29uZmlnKCdzdGFydEluSW5zZXJ0TW9kZScpIG9yIG1hdGNoU2NvcGVzKEBlZGl0b3JFbGVtZW50LCBAZ2V0Q29uZmlnKCdzdGFydEluSW5zZXJ0TW9kZVNjb3BlcycpKVxuICAgICAgQGFjdGl2YXRlKCdpbnNlcnQnKVxuICAgIGVsc2VcbiAgICAgIEBhY3RpdmF0ZSgnbm9ybWFsJylcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuICAgIEBjb25zdHJ1Y3Rvci52aW1TdGF0ZXNCeUVkaXRvci5zZXQoQGVkaXRvciwgdGhpcylcblxuICBnZXRDb25maWc6IChwYXJhbSkgLT5cbiAgICBzZXR0aW5ncy5nZXQocGFyYW0pXG5cbiAgIyBCbG9ja3dpc2VTZWxlY3Rpb25zXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zOiAtPlxuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpXG5cbiAgZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbjogLT5cbiAgICBCbG9ja3dpc2VTZWxlY3Rpb24uZ2V0TGFzdFNlbGVjdGlvbihAZWRpdG9yKVxuXG4gIGdldEJsb2Nrd2lzZVNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBCbG9ja3dpc2VTZWxlY3Rpb24uZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IpXG5cbiAgY2xlYXJCbG9ja3dpc2VTZWxlY3Rpb25zOiAtPlxuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbi5jbGVhclNlbGVjdGlvbnMoQGVkaXRvcilcblxuICAjIE90aGVyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0b2dnbGVDbGFzc0xpc3Q6IChjbGFzc05hbWUsIGJvb2w9dW5kZWZpbmVkKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoY2xhc3NOYW1lLCBib29sKVxuXG4gICMgRklYTUU6IEkgd2FudCB0byByZW1vdmUgdGhpcyBkZW5nZXJpb3VzIGFwcHJvYWNoLCBidXQgSSBjb3VsZG4ndCBmaW5kIHRoZSBiZXR0ZXIgd2F5LlxuICBzd2FwQ2xhc3NOYW1lOiAoY2xhc3NOYW1lcy4uLikgLT5cbiAgICBvbGRNb2RlID0gQG1vZGVcblxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUob2xkTW9kZSArIFwiLW1vZGVcIilcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd2aW0tbW9kZS1wbHVzJylcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZXMuLi4pXG5cbiAgICBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWVzLi4uKVxuICAgICAgaWYgQG1vZGUgaXMgb2xkTW9kZVxuICAgICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKG9sZE1vZGUgKyBcIi1tb2RlXCIpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKCd2aW0tbW9kZS1wbHVzJylcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLWZvY3VzZWQnKVxuXG4gICMgQWxsIHN1YnNjcmlwdGlvbnMgaGVyZSBpcyBjZWxhcmVkIG9uIGVhY2ggb3BlcmF0aW9uIGZpbmlzaGVkLlxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb25EaWRDaGFuZ2VTZWFyY2g6IChmbikgLT4gQHN1YnNjcmliZSBAc2VhcmNoSW5wdXQub25EaWRDaGFuZ2UoZm4pXG4gIG9uRGlkQ29uZmlybVNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENvbmZpcm0oZm4pXG4gIG9uRGlkQ2FuY2VsU2VhcmNoOiAoZm4pIC0+IEBzdWJzY3JpYmUgQHNlYXJjaElucHV0Lm9uRGlkQ2FuY2VsKGZuKVxuICBvbkRpZENvbW1hbmRTZWFyY2g6IChmbikgLT4gQHN1YnNjcmliZSBAc2VhcmNoSW5wdXQub25EaWRDb21tYW5kKGZuKVxuXG4gICMgU2VsZWN0IGFuZCB0ZXh0IG11dGF0aW9uKENoYW5nZSlcbiAgb25EaWRTZXRUYXJnZXQ6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXNldC10YXJnZXQnLCBmbilcbiAgZW1pdERpZFNldFRhcmdldDogKG9wZXJhdG9yKSAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2V0LXRhcmdldCcsIG9wZXJhdG9yKVxuXG4gIG9uV2lsbFNlbGVjdFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCd3aWxsLXNlbGVjdC10YXJnZXQnLCBmbilcbiAgZW1pdFdpbGxTZWxlY3RUYXJnZXQ6IC0+IEBlbWl0dGVyLmVtaXQoJ3dpbGwtc2VsZWN0LXRhcmdldCcpXG5cbiAgb25EaWRTZWxlY3RUYXJnZXQ6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXNlbGVjdC10YXJnZXQnLCBmbilcbiAgZW1pdERpZFNlbGVjdFRhcmdldDogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXNlbGVjdC10YXJnZXQnKVxuXG4gIG9uRGlkRmFpbFNlbGVjdFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtZmFpbC1zZWxlY3QtdGFyZ2V0JywgZm4pXG4gIGVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0OiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtZmFpbC1zZWxlY3QtdGFyZ2V0JylcblxuICBvbldpbGxGaW5pc2hNdXRhdGlvbjogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdvbi13aWxsLWZpbmlzaC1tdXRhdGlvbicsIGZuKVxuICBlbWl0V2lsbEZpbmlzaE11dGF0aW9uOiAtPiBAZW1pdHRlci5lbWl0KCdvbi13aWxsLWZpbmlzaC1tdXRhdGlvbicpXG5cbiAgb25EaWRGaW5pc2hNdXRhdGlvbjogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdvbi1kaWQtZmluaXNoLW11dGF0aW9uJywgZm4pXG4gIGVtaXREaWRGaW5pc2hNdXRhdGlvbjogLT4gQGVtaXR0ZXIuZW1pdCgnb24tZGlkLWZpbmlzaC1tdXRhdGlvbicpXG5cbiAgb25EaWRTZXRPcGVyYXRvck1vZGlmaWVyOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1zZXQtb3BlcmF0b3ItbW9kaWZpZXInLCBmbilcbiAgZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXI6IChvcHRpb25zKSAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2V0LW9wZXJhdG9yLW1vZGlmaWVyJywgb3B0aW9ucylcblxuICBvbkRpZEZpbmlzaE9wZXJhdGlvbjogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtZmluaXNoLW9wZXJhdGlvbicsIGZuKVxuICBlbWl0RGlkRmluaXNoT3BlcmF0aW9uOiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtZmluaXNoLW9wZXJhdGlvbicpXG5cbiAgb25EaWRSZXNldE9wZXJhdGlvblN0YWNrOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1yZXNldC1vcGVyYXRpb24tc3RhY2snLCBmbilcbiAgZW1pdERpZFJlc2V0T3BlcmF0aW9uU3RhY2s6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1yZXNldC1vcGVyYXRpb24tc3RhY2snKVxuXG4gICMgU2VsZWN0IGxpc3Qgdmlld1xuICBvbkRpZENvbmZpcm1TZWxlY3RMaXN0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1jb25maXJtLXNlbGVjdC1saXN0JywgZm4pXG4gIG9uRGlkQ2FuY2VsU2VsZWN0TGlzdDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtY2FuY2VsLXNlbGVjdC1saXN0JywgZm4pXG5cbiAgIyBQcm94eWluZyBtb2RlTWFuZ2VyJ3MgZXZlbnQgaG9vayB3aXRoIHNob3J0LWxpZmUgc3Vic2NyaXB0aW9uLlxuICBvbldpbGxBY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25XaWxsQWN0aXZhdGVNb2RlKGZuKVxuICBvbkRpZEFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbkRpZEFjdGl2YXRlTW9kZShmbilcbiAgb25XaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25XaWxsRGVhY3RpdmF0ZU1vZGUoZm4pXG4gIHByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIucHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZShmbilcbiAgb25EaWREZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbkRpZERlYWN0aXZhdGVNb2RlKGZuKVxuXG4gICMgRXZlbnRzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvbkRpZEZhaWxUb1B1c2hUb09wZXJhdGlvblN0YWNrOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtZmFpbC10by1wdXNoLXRvLW9wZXJhdGlvbi1zdGFjaycsIGZuKVxuICBlbWl0RGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2s6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1mYWlsLXRvLXB1c2gtdG8tb3BlcmF0aW9uLXN0YWNrJylcblxuICBvbkRpZERlc3Ryb3k6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgZm4pXG5cbiAgIyAqIGBmbmAge0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbiBtYXJrIHdhcyBzZXQuXG4gICMgICAqIGBuYW1lYCBOYW1lIG9mIG1hcmsgc3VjaCBhcyAnYScuXG4gICMgICAqIGBidWZmZXJQb3NpdGlvbmA6IGJ1ZmZlclBvc2l0aW9uIHdoZXJlIG1hcmsgd2FzIHNldC5cbiAgIyAgICogYGVkaXRvcmA6IGVkaXRvciB3aGVyZSBtYXJrIHdhcyBzZXQuXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgI1xuICAjICBVc2FnZTpcbiAgIyAgIG9uRGlkU2V0TWFyayAoe25hbWUsIGJ1ZmZlclBvc2l0aW9ufSkgLT4gZG8gc29tZXRoaW5nLi5cbiAgb25EaWRTZXRNYXJrOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtc2V0LW1hcmsnLCBmbilcblxuICBvbkRpZFNldElucHV0Q2hhcjogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLXNldC1pbnB1dC1jaGFyJywgZm4pXG4gIGVtaXREaWRTZXRJbnB1dENoYXI6IChjaGFyKSAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2V0LWlucHV0LWNoYXInLCBjaGFyKVxuXG4gIGlzQWxpdmU6IC0+XG4gICAgQGNvbnN0cnVjdG9yLnZpbVN0YXRlc0J5RWRpdG9yLmhhcyhAZWRpdG9yKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaXNBbGl2ZSgpXG4gICAgQGNvbnN0cnVjdG9yLnZpbVN0YXRlc0J5RWRpdG9yLmRlbGV0ZShAZWRpdG9yKVxuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbi5jbGVhclNlbGVjdGlvbnMoQGVkaXRvcilcblxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gICAgaWYgQGVkaXRvci5pc0FsaXZlKClcbiAgICAgIEByZXNldE5vcm1hbE1vZGUoKVxuICAgICAgQHJlc2V0KClcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudD8uc2V0SW5wdXRFbmFibGVkKHRydWUpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHBhY2thZ2VTY29wZSwgJ25vcm1hbC1tb2RlJylcblxuICAgIEBob3Zlcj8uZGVzdHJveT8oKVxuICAgIEBob3ZlclNlYXJjaENvdW50ZXI/LmRlc3Ryb3k/KClcbiAgICBAc2VhcmNoSGlzdG9yeT8uZGVzdHJveT8oKVxuICAgIEBjdXJzb3JTdHlsZU1hbmFnZXI/LmRlc3Ryb3k/KClcbiAgICBAc2VhcmNoPy5kZXN0cm95PygpXG4gICAgQHJlZ2lzdGVyPy5kZXN0cm95P1xuICAgIHtcbiAgICAgIEBob3ZlciwgQGhvdmVyU2VhcmNoQ291bnRlciwgQG9wZXJhdGlvblN0YWNrLFxuICAgICAgQHNlYXJjaEhpc3RvcnksIEBjdXJzb3JTdHlsZU1hbmFnZXJcbiAgICAgIEBzZWFyY2gsIEBtb2RlTWFuYWdlciwgQHJlZ2lzdGVyXG4gICAgICBAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQHN1YnNjcmlwdGlvbnMsXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXJcbiAgICAgIEBwcmV2aW91c1NlbGVjdGlvblxuICAgICAgQHBlcnNpc3RlbnRTZWxlY3Rpb25cbiAgICB9ID0ge31cbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtZGVzdHJveSdcblxuICBjaGVja1NlbGVjdGlvbjogKGV2ZW50KSAtPlxuICAgIHJldHVybiB1bmxlc3MgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpIGlzIEBlZGl0b3JcbiAgICByZXR1cm4gaWYgQG9wZXJhdGlvblN0YWNrLmlzUHJvY2Vzc2luZygpXG4gICAgcmV0dXJuIGlmIEBtb2RlIGlzICdpbnNlcnQnXG4gICAgIyBJbnRlbnRpb25hbGx5IHVzaW5nIHRhcmdldC5jbG9zZXN0KCdhdG9tLXRleHQtZWRpdG9yJylcbiAgICAjIERvbid0IHVzZSB0YXJnZXQuZ2V0TW9kZWwoKSB3aGljaCBpcyB3b3JrIGZvciBDdXN0b21FdmVudCBidXQgbm90IHdvcmsgZm9yIG1vdXNlIGV2ZW50LlxuICAgIHJldHVybiB1bmxlc3MgQGVkaXRvckVsZW1lbnQgaXMgZXZlbnQudGFyZ2V0Py5jbG9zZXN0PygnYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgcmV0dXJuIGlmIGV2ZW50LnR5cGUuc3RhcnRzV2l0aCgndmltLW1vZGUtcGx1cycpICMgdG8gbWF0Y2ggdmltLW1vZGUtcGx1czogYW5kIHZpbS1tb2RlLXBsdXMtdXNlcjpcblxuICAgIGlmIGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24oQGVkaXRvcilcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC51cGRhdGVTeW5jKClcbiAgICAgIHdpc2UgPSBzd3JhcC5kZXRlY3RXaXNlKEBlZGl0b3IpXG4gICAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCB3aXNlKVxuICAgICAgICBmb3IgJHNlbGVjdGlvbiBpbiBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpXG4gICAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICAgIEB1cGRhdGVDdXJzb3JzVmlzaWJpbGl0eSgpXG4gICAgICBlbHNlXG4gICAgICAgIEBhY3RpdmF0ZSgndmlzdWFsJywgd2lzZSlcbiAgICBlbHNlXG4gICAgICBAYWN0aXZhdGUoJ25vcm1hbCcpIGlmIEBtb2RlIGlzICd2aXN1YWwnXG5cbiAgb2JzZXJ2ZVNlbGVjdGlvbnM6IC0+XG4gICAgY2hlY2tTZWxlY3Rpb24gPSBAY2hlY2tTZWxlY3Rpb24uYmluZCh0aGlzKVxuICAgIEBlZGl0b3JFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBjaGVja1NlbGVjdGlvbilcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBjaGVja1NlbGVjdGlvbilcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLm9uRGlkRGlzcGF0Y2goY2hlY2tTZWxlY3Rpb24pXG5cbiAgICBAZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIGNoZWNrU2VsZWN0aW9uKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQGVkaXRvckVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBjaGVja1NlbGVjdGlvbilcblxuICAjIFdoYXQncyB0aGlzP1xuICAjIGVkaXRvci5jbGVhclNlbGVjdGlvbnMoKSBkb2Vzbid0IHJlc3BlY3QgbGFzdEN1cnNvciBwb3NpdG9pbi5cbiAgIyBUaGlzIG1ldGhvZCB3b3JrcyBpbiBzYW1lIHdheSBhcyBlZGl0b3IuY2xlYXJTZWxlY3Rpb25zKCkgYnV0IHJlc3BlY3QgbGFzdCBjdXJzb3IgcG9zaXRpb24uXG4gIGNsZWFyU2VsZWN0aW9uczogLT5cbiAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcblxuICByZXNldE5vcm1hbE1vZGU6ICh7dXNlckludm9jYXRpb259PXt9KSAtPlxuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbi5jbGVhclNlbGVjdGlvbnMoQGVkaXRvcilcblxuICAgIGlmIHVzZXJJbnZvY2F0aW9uID8gZmFsc2VcbiAgICAgIHN3aXRjaFxuICAgICAgICB3aGVuIEBlZGl0b3IuaGFzTXVsdGlwbGVDdXJzb3JzKClcbiAgICAgICAgICBAY2xlYXJTZWxlY3Rpb25zKClcbiAgICAgICAgd2hlbiBAaGFzUGVyc2lzdGVudFNlbGVjdGlvbnMoKSBhbmQgQGdldENvbmZpZygnY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uT25SZXNldE5vcm1hbE1vZGUnKVxuICAgICAgICAgIEBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25zKClcbiAgICAgICAgd2hlbiBAb2NjdXJyZW5jZU1hbmFnZXIuaGFzUGF0dGVybnMoKVxuICAgICAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKClcblxuICAgICAgaWYgQGdldENvbmZpZygnY2xlYXJIaWdobGlnaHRTZWFyY2hPblJlc2V0Tm9ybWFsTW9kZScpXG4gICAgICAgIEBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBudWxsKVxuICAgIGVsc2VcbiAgICAgIEBjbGVhclNlbGVjdGlvbnMoKVxuICAgIEBhY3RpdmF0ZSgnbm9ybWFsJylcblxuICBpbml0OiAtPlxuICAgIEBzYXZlT3JpZ2luYWxDdXJzb3JQb3NpdGlvbigpXG5cbiAgcmVzZXQ6IC0+XG4gICAgQHJlZ2lzdGVyLnJlc2V0KClcbiAgICBAc2VhcmNoSGlzdG9yeS5yZXNldCgpXG4gICAgQGhvdmVyLnJlc2V0KClcbiAgICBAb3BlcmF0aW9uU3RhY2sucmVzZXQoKVxuICAgIEBtdXRhdGlvbk1hbmFnZXIucmVzZXQoKVxuXG4gIGlzVmlzaWJsZTogLT5cbiAgICBAZWRpdG9yIGluIGdldFZpc2libGVFZGl0b3JzKClcblxuICB1cGRhdGVDdXJzb3JzVmlzaWJpbGl0eTogLT5cbiAgICBAY3Vyc29yU3R5bGVNYW5hZ2VyLnJlZnJlc2goKVxuXG4gICMgRklYTUU6IG5hbWluZywgdXBkYXRlTGFzdFNlbGVjdGVkSW5mbyA/XG4gIHVwZGF0ZVByZXZpb3VzU2VsZWN0aW9uOiAtPlxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgcHJvcGVydGllcyA9IEBnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCk/LmdldFByb3BlcnRpZXMoKVxuICAgIGVsc2VcbiAgICAgIHByb3BlcnRpZXMgPSBzd3JhcChAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSkuZ2V0UHJvcGVydGllcygpXG5cbiAgICAjIFRPRE8jNzA0IHdoZW4gY3Vyc29yIGlzIGFkZGVkIGluIHZpc3VhbC1tb2RlLCBjb3JyZXNwb25kaW5nIHNlbGVjdGlvbiBwcm9wIHlldCBub3QgZXhpc3RzLlxuICAgIHJldHVybiB1bmxlc3MgcHJvcGVydGllc1xuXG4gICAge2hlYWQsIHRhaWx9ID0gcHJvcGVydGllc1xuXG4gICAgaWYgaGVhZC5pc0dyZWF0ZXJUaGFuT3JFcXVhbCh0YWlsKVxuICAgICAgW3N0YXJ0LCBlbmRdID0gW3RhaWwsIGhlYWRdXG4gICAgICBoZWFkID0gZW5kID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBlZGl0b3IsIGVuZCwgJ2ZvcndhcmQnKVxuICAgIGVsc2VcbiAgICAgIFtzdGFydCwgZW5kXSA9IFtoZWFkLCB0YWlsXVxuICAgICAgdGFpbCA9IGVuZCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBlbmQsICdmb3J3YXJkJylcblxuICAgIEBtYXJrLnNldCgnPCcsIHN0YXJ0KVxuICAgIEBtYXJrLnNldCgnPicsIGVuZClcbiAgICBAcHJldmlvdXNTZWxlY3Rpb24gPSB7cHJvcGVydGllczoge2hlYWQsIHRhaWx9LCBAc3VibW9kZX1cblxuICAjIFBlcnNpc3RlbnQgc2VsZWN0aW9uXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoYXNQZXJzaXN0ZW50U2VsZWN0aW9uczogLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5oYXNNYXJrZXJzKClcblxuICBnZXRQZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2VzOiAtPlxuICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckJ1ZmZlclJhbmdlcygpXG5cbiAgY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uczogLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5jbGVhck1hcmtlcnMoKVxuXG4gICMgQW5pbWF0aW9uIG1hbmFnZW1lbnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNjcm9sbEFuaW1hdGlvbkVmZmVjdDogbnVsbFxuICByZXF1ZXN0U2Nyb2xsQW5pbWF0aW9uOiAoZnJvbSwgdG8sIG9wdGlvbnMpIC0+XG4gICAgQHNjcm9sbEFuaW1hdGlvbkVmZmVjdCA9IGpRdWVyeShmcm9tKS5hbmltYXRlKHRvLCBvcHRpb25zKVxuXG4gIGZpbmlzaFNjcm9sbEFuaW1hdGlvbjogLT5cbiAgICBAc2Nyb2xsQW5pbWF0aW9uRWZmZWN0Py5maW5pc2goKVxuICAgIEBzY3JvbGxBbmltYXRpb25FZmZlY3QgPSBudWxsXG5cbiAgIyBPdGhlclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2F2ZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb246IC0+XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb24gPSBudWxsXG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlcj8uZGVzdHJveSgpXG5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgc2VsZWN0aW9uID0gQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKClcbiAgICAgIHBvaW50ID0gc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknLCAnc2VsZWN0aW9uJ10pXG4gICAgZWxzZVxuICAgICAgcG9pbnQgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbiA9IHBvaW50XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlciA9IEBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKHBvaW50LCBpbnZhbGlkYXRlOiAnbmV2ZXInKVxuXG4gIHJlc3RvcmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oQGdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKSlcblxuICBnZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uXG5cbiAgZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyOiAtPlxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXIuZ2V0U3RhcnRCdWZmZXJQb3NpdGlvbigpXG4iXX0=
