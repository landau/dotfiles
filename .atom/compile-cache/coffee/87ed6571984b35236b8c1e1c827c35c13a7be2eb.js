(function() {
  var BlockwiseSelection, CompositeDisposable, CursorStyleManager, Delegato, Disposable, Emitter, FlashManager, HighlightSearchManager, HoverManager, MarkManager, ModeManager, MutationManager, OccurrenceManager, OperationStack, PersistentSelectionManager, Range, RegisterManager, SearchHistoryManager, SearchInputElement, VimState, _, assert, assertWithException, getVisibleEditors, jQuery, matchScopes, packageScope, ref, ref1, semver, settings, swrap,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  semver = require('semver');

  Delegato = require('delegato');

  jQuery = require('atom-space-pen-views').jQuery;

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable, Range = ref.Range;

  settings = require('./settings');

  HoverManager = require('./hover-manager');

  SearchInputElement = require('./search-input');

  ref1 = require('./utils'), getVisibleEditors = ref1.getVisibleEditors, matchScopes = ref1.matchScopes, assert = ref1.assert, assertWithException = ref1.assertWithException;

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
      this.searchInput = new SearchInputElement().initialize(this);
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

    VimState.prototype.assert = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return assert.apply(null, args);
    };

    VimState.prototype.assertWithException = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return assertWithException.apply(null, args);
    };

    VimState.prototype.getConfig = function(param) {
      return settings.get(param);
    };

    VimState.prototype.getBlockwiseSelections = function() {
      return this.blockwiseSelections;
    };

    VimState.prototype.getLastBlockwiseSelection = function() {
      return _.last(this.blockwiseSelections);
    };

    VimState.prototype.getBlockwiseSelectionsOrderedByBufferPosition = function() {
      return this.getBlockwiseSelections().sort(function(a, b) {
        return a.getStartSelection().compare(b.getStartSelection());
      });
    };

    VimState.prototype.clearBlockwiseSelections = function() {
      return this.blockwiseSelections = [];
    };

    VimState.prototype.selectBlockwiseForSelection = function(selection) {
      return this.blockwiseSelections.push(new BlockwiseSelection(selection));
    };

    VimState.prototype.selectBlockwise = function() {
      var i, len, ref2, selection;
      ref2 = this.editor.getSelections();
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        this.selectBlockwiseForSelection(selection);
      }
      return this.getLastBlockwiseSelection().autoscrollIfReversed();
    };

    VimState.prototype.selectLinewise = function() {
      return swrap.applyWise(this.editor, 'linewise');
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

    VimState.prototype.onDidRestoreCursorPositions = function(fn) {
      return this.subscribe(this.emitter.on('did-restore-cursor-positions', fn));
    };

    VimState.prototype.emitDidRestoreCursorPositions = function() {
      return this.emitter.emit('did-restore-cursor-positions');
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

    VimState.prototype.isInterestingEvent = function(arg) {
      var target, type;
      target = arg.target, type = arg.type;
      if (this.mode === 'insert') {
        return false;
      } else {
        return (this.editor != null) && (target != null ? typeof target.closest === "function" ? target.closest('atom-text-editor') : void 0 : void 0) === this.editorElement && !this.isMode('visual', 'blockwise') && !type.startsWith('vim-mode-plus:');
      }
    };

    VimState.prototype.checkSelection = function(event) {
      var i, len, nonEmptySelecitons, selection, wise;
      if (this.operationStack.isProcessing()) {
        return;
      }
      if (!this.isInterestingEvent(event)) {
        return;
      }
      nonEmptySelecitons = this.editor.getSelections().filter(function(selection) {
        return !selection.isEmpty();
      });
      if (nonEmptySelecitons.length) {
        wise = swrap.detectWise(this.editor);
        if (this.isMode('visual', wise)) {
          for (i = 0, len = nonEmptySelecitons.length; i < len; i++) {
            selection = nonEmptySelecitons[i];
            if (!swrap(selection).hasProperties()) {
              swrap(selection).saveProperties();
            }
          }
          return this.updateCursorsVisibility();
        } else {
          return this.activate('visual', wise);
        }
      } else {
        if (this.isMode('visual')) {
          return this.activate('normal');
        }
      }
    };

    VimState.prototype.saveProperties = function(event) {
      var i, len, ref2, results, selection;
      if (!this.isInterestingEvent(event)) {
        return;
      }
      ref2 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        results.push(swrap(selection).saveProperties());
      }
      return results;
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
      return this.subscriptions.add(atom.commands.onDidDispatch(checkSelection));
    };

    VimState.prototype.clearSelections = function() {
      return this.editor.setCursorBufferPosition(this.editor.getCursorBufferPosition());
    };

    VimState.prototype.resetNormalMode = function(arg) {
      var userInvocation;
      userInvocation = (arg != null ? arg : {}).userInvocation;
      if (userInvocation != null ? userInvocation : false) {
        if (this.editor.hasMultipleCursors()) {
          this.clearSelections();
        } else if (this.hasPersistentSelections() && this.getConfig('clearPersistentSelectionOnResetNormalMode')) {
          this.clearPersistentSelections();
        } else if (this.occurrenceManager.hasPatterns()) {
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
      var head, properties, ref2, tail;
      if (this.isMode('visual', 'blockwise')) {
        properties = (ref2 = this.getLastBlockwiseSelection()) != null ? ref2.getCharacterwiseProperties() : void 0;
      } else {
        properties = swrap(this.editor.getLastSelection()).captureProperties();
      }
      if (properties == null) {
        return;
      }
      head = properties.head, tail = properties.tail;
      if (head.isGreaterThan(tail)) {
        this.mark.setRange('<', '>', [tail, head]);
      } else {
        this.mark.setRange('<', '>', [head, tail]);
      }
      return this.previousSelection = {
        properties: properties,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdmltLXN0YXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsOGJBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDVixTQUFVLE9BQUEsQ0FBUSxzQkFBUjs7RUFFWCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQW9ELE9BQUEsQ0FBUSxNQUFSLENBQXBELEVBQUMscUJBQUQsRUFBVSwyQkFBVixFQUFzQiw2Q0FBdEIsRUFBMkM7O0VBRTNDLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNmLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSxnQkFBUjs7RUFDckIsT0FLSSxPQUFBLENBQVEsU0FBUixDQUxKLEVBQ0UsMENBREYsRUFFRSw4QkFGRixFQUdFLG9CQUhGLEVBSUU7O0VBRUYsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFFUixjQUFBLEdBQWlCLE9BQUEsQ0FBUSxtQkFBUjs7RUFDakIsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSOztFQUNsQixvQkFBQSxHQUF1QixPQUFBLENBQVEsMEJBQVI7O0VBQ3ZCLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx3QkFBUjs7RUFDckIsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHVCQUFSOztFQUNyQixpQkFBQSxHQUFvQixPQUFBLENBQVEsc0JBQVI7O0VBQ3BCLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSw0QkFBUjs7RUFDekIsZUFBQSxHQUFrQixPQUFB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S0EsSUFBQyxDQUFBLHNCQUFELEdBQTBCO2FBQzFCLElBQUMsQ0FBQSw4QkFBRCxHQUFrQyxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQTJCLEtBQTNCLEVBQWtDO1FBQUEsVUFBQSxFQUFZLE9BQVo7T0FBbEM7SUFWUjs7dUJBWTVCLDZCQUFBLEdBQStCLFNBQUE7YUFDN0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxJQUFDLENBQUEseUJBQUQsQ0FBQSxDQUFoQztJQUQ2Qjs7dUJBRy9CLHlCQUFBLEdBQTJCLFNBQUE7YUFDekIsSUFBQyxDQUFBO0lBRHdCOzt1QkFHM0IsaUNBQUEsR0FBbUMsU0FBQTthQUNqQyxJQUFDLENBQUEsOEJBQThCLENBQUMsc0JBQWhDLENBQUE7SUFEaUM7Ozs7O0FBL1hyQyIsInNvdXJjZXNDb250ZW50IjpbInNlbXZlciA9IHJlcXVpcmUgJ3NlbXZlcidcbkRlbGVnYXRvID0gcmVxdWlyZSAnZGVsZWdhdG8nXG57alF1ZXJ5fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0VtaXR0ZXIsIERpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbkhvdmVyTWFuYWdlciA9IHJlcXVpcmUgJy4vaG92ZXItbWFuYWdlcidcblNlYXJjaElucHV0RWxlbWVudCA9IHJlcXVpcmUgJy4vc2VhcmNoLWlucHV0J1xue1xuICBnZXRWaXNpYmxlRWRpdG9yc1xuICBtYXRjaFNjb3Blc1xuICBhc3NlcnRcbiAgYXNzZXJ0V2l0aEV4Y2VwdGlvblxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5cbk9wZXJhdGlvblN0YWNrID0gcmVxdWlyZSAnLi9vcGVyYXRpb24tc3RhY2snXG5NYXJrTWFuYWdlciA9IHJlcXVpcmUgJy4vbWFyay1tYW5hZ2VyJ1xuTW9kZU1hbmFnZXIgPSByZXF1aXJlICcuL21vZGUtbWFuYWdlcidcblJlZ2lzdGVyTWFuYWdlciA9IHJlcXVpcmUgJy4vcmVnaXN0ZXItbWFuYWdlcidcblNlYXJjaEhpc3RvcnlNYW5hZ2VyID0gcmVxdWlyZSAnLi9zZWFyY2gtaGlzdG9yeS1tYW5hZ2VyJ1xuQ3Vyc29yU3R5bGVNYW5hZ2VyID0gcmVxdWlyZSAnLi9jdXJzb3Itc3R5bGUtbWFuYWdlcidcbkJsb2Nrd2lzZVNlbGVjdGlvbiA9IHJlcXVpcmUgJy4vYmxvY2t3aXNlLXNlbGVjdGlvbidcbk9jY3VycmVuY2VNYW5hZ2VyID0gcmVxdWlyZSAnLi9vY2N1cnJlbmNlLW1hbmFnZXInXG5IaWdobGlnaHRTZWFyY2hNYW5hZ2VyID0gcmVxdWlyZSAnLi9oaWdobGlnaHQtc2VhcmNoLW1hbmFnZXInXG5NdXRhdGlvbk1hbmFnZXIgPSByZXF1aXJlICcuL211dGF0aW9uLW1hbmFnZXInXG5QZXJzaXN0ZW50U2VsZWN0aW9uTWFuYWdlciA9IHJlcXVpcmUgJy4vcGVyc2lzdGVudC1zZWxlY3Rpb24tbWFuYWdlcidcbkZsYXNoTWFuYWdlciA9IHJlcXVpcmUgJy4vZmxhc2gtbWFuYWdlcidcblxucGFja2FnZVNjb3BlID0gJ3ZpbS1tb2RlLXBsdXMnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFZpbVN0YXRlXG4gIEB2aW1TdGF0ZXNCeUVkaXRvcjogbmV3IE1hcFxuXG4gIEBnZXRCeUVkaXRvcjogKGVkaXRvcikgLT5cbiAgICBAdmltU3RhdGVzQnlFZGl0b3IuZ2V0KGVkaXRvcilcblxuICBAZm9yRWFjaDogKGZuKSAtPlxuICAgIEB2aW1TdGF0ZXNCeUVkaXRvci5mb3JFYWNoKGZuKVxuXG4gIEBjbGVhcjogLT5cbiAgICBAdmltU3RhdGVzQnlFZGl0b3IuY2xlYXIoKVxuXG4gIERlbGVnYXRvLmluY2x1ZGVJbnRvKHRoaXMpXG5cbiAgQGRlbGVnYXRlc1Byb3BlcnR5KCdtb2RlJywgJ3N1Ym1vZGUnLCB0b1Byb3BlcnR5OiAnbW9kZU1hbmFnZXInKVxuICBAZGVsZWdhdGVzTWV0aG9kcygnaXNNb2RlJywgJ2FjdGl2YXRlJywgdG9Qcm9wZXJ0eTogJ21vZGVNYW5hZ2VyJylcbiAgQGRlbGVnYXRlc01ldGhvZHMoJ2ZsYXNoJywgJ2ZsYXNoU2NyZWVuUmFuZ2UnLCB0b1Byb3BlcnR5OiAnZmxhc2hNYW5hZ2VyJylcbiAgQGRlbGVnYXRlc01ldGhvZHMoJ3N1YnNjcmliZScsICdnZXRDb3VudCcsICdzZXRDb3VudCcsICdoYXNDb3VudCcsICdhZGRUb0NsYXNzTGlzdCcsIHRvUHJvcGVydHk6ICdvcGVyYXRpb25TdGFjaycpXG5cbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBAc3RhdHVzQmFyTWFuYWdlciwgQGdsb2JhbFN0YXRlKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50ID0gQGVkaXRvci5lbGVtZW50XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAbW9kZU1hbmFnZXIgPSBuZXcgTW9kZU1hbmFnZXIodGhpcylcbiAgICBAbWFyayA9IG5ldyBNYXJrTWFuYWdlcih0aGlzKVxuICAgIEByZWdpc3RlciA9IG5ldyBSZWdpc3Rlck1hbmFnZXIodGhpcylcbiAgICBAaG92ZXIgPSBuZXcgSG92ZXJNYW5hZ2VyKHRoaXMpXG4gICAgQGhvdmVyU2VhcmNoQ291bnRlciA9IG5ldyBIb3Zlck1hbmFnZXIodGhpcylcbiAgICBAc2VhcmNoSGlzdG9yeSA9IG5ldyBTZWFyY2hIaXN0b3J5TWFuYWdlcih0aGlzKVxuICAgIEBoaWdobGlnaHRTZWFyY2ggPSBuZXcgSGlnaGxpZ2h0U2VhcmNoTWFuYWdlcih0aGlzKVxuICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uID0gbmV3IFBlcnNpc3RlbnRTZWxlY3Rpb25NYW5hZ2VyKHRoaXMpXG4gICAgQG9jY3VycmVuY2VNYW5hZ2VyID0gbmV3IE9jY3VycmVuY2VNYW5hZ2VyKHRoaXMpXG4gICAgQG11dGF0aW9uTWFuYWdlciA9IG5ldyBNdXRhdGlvbk1hbmFnZXIodGhpcylcbiAgICBAZmxhc2hNYW5hZ2VyID0gbmV3IEZsYXNoTWFuYWdlcih0aGlzKVxuXG4gICAgQHNlYXJjaElucHV0ID0gbmV3IFNlYXJjaElucHV0RWxlbWVudCgpLmluaXRpYWxpemUodGhpcylcblxuICAgIEBvcGVyYXRpb25TdGFjayA9IG5ldyBPcGVyYXRpb25TdGFjayh0aGlzKVxuICAgIEBjdXJzb3JTdHlsZU1hbmFnZXIgPSBuZXcgQ3Vyc29yU3R5bGVNYW5hZ2VyKHRoaXMpXG4gICAgQGJsb2Nrd2lzZVNlbGVjdGlvbnMgPSBbXVxuICAgIEBwcmV2aW91c1NlbGVjdGlvbiA9IHt9XG4gICAgQG9ic2VydmVTZWxlY3Rpb25zKClcblxuICAgIHJlZnJlc2hIaWdobGlnaHRTZWFyY2ggPSA9PlxuICAgICAgQGhpZ2hsaWdodFNlYXJjaC5yZWZyZXNoKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZFN0b3BDaGFuZ2luZyhyZWZyZXNoSGlnaGxpZ2h0U2VhcmNoKVxuXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChwYWNrYWdlU2NvcGUpXG4gICAgaWYgQGdldENvbmZpZygnc3RhcnRJbkluc2VydE1vZGUnKSBvciBtYXRjaFNjb3BlcyhAZWRpdG9yRWxlbWVudCwgQGdldENvbmZpZygnc3RhcnRJbkluc2VydE1vZGVTY29wZXMnKSlcbiAgICAgIEBhY3RpdmF0ZSgnaW5zZXJ0JylcbiAgICBlbHNlXG4gICAgICBAYWN0aXZhdGUoJ25vcm1hbCcpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcbiAgICBAY29uc3RydWN0b3IudmltU3RhdGVzQnlFZGl0b3Iuc2V0KEBlZGl0b3IsIHRoaXMpXG5cbiAgYXNzZXJ0OiAoYXJncy4uLikgLT5cbiAgICBhc3NlcnQoYXJncy4uLilcblxuICBhc3NlcnRXaXRoRXhjZXB0aW9uOiAoYXJncy4uLikgLT5cbiAgICBhc3NlcnRXaXRoRXhjZXB0aW9uKGFyZ3MuLi4pXG5cbiAgZ2V0Q29uZmlnOiAocGFyYW0pIC0+XG4gICAgc2V0dGluZ3MuZ2V0KHBhcmFtKVxuXG4gICMgQmxvY2t3aXNlU2VsZWN0aW9uc1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9uczogLT5cbiAgICBAYmxvY2t3aXNlU2VsZWN0aW9uc1xuXG4gIGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb246IC0+XG4gICAgXy5sYXN0KEBibG9ja3dpc2VTZWxlY3Rpb25zKVxuXG4gIGdldEJsb2Nrd2lzZVNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBAZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpLnNvcnQgKGEsIGIpIC0+XG4gICAgICBhLmdldFN0YXJ0U2VsZWN0aW9uKCkuY29tcGFyZShiLmdldFN0YXJ0U2VsZWN0aW9uKCkpXG5cbiAgY2xlYXJCbG9ja3dpc2VTZWxlY3Rpb25zOiAtPlxuICAgIEBibG9ja3dpc2VTZWxlY3Rpb25zID0gW11cblxuICBzZWxlY3RCbG9ja3dpc2VGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQGJsb2Nrd2lzZVNlbGVjdGlvbnMucHVzaChuZXcgQmxvY2t3aXNlU2VsZWN0aW9uKHNlbGVjdGlvbikpXG5cbiAgc2VsZWN0QmxvY2t3aXNlOiAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIEBzZWxlY3RCbG9ja3dpc2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIEBnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCkuYXV0b3Njcm9sbElmUmV2ZXJzZWQoKVxuXG4gICMgT3RoZXJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNlbGVjdExpbmV3aXNlOiAtPlxuICAgIHN3cmFwLmFwcGx5V2lzZShAZWRpdG9yLCAnbGluZXdpc2UnKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0b2dnbGVDbGFzc0xpc3Q6IChjbGFzc05hbWUsIGJvb2w9dW5kZWZpbmVkKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoY2xhc3NOYW1lLCBib29sKVxuXG4gICMgRklYTUU6IEkgd2FudCB0byByZW1vdmUgdGhpcyBkZW5nZXJpb3VzIGFwcHJvYWNoLCBidXQgSSBjb3VsZG4ndCBmaW5kIHRoZSBiZXR0ZXIgd2F5LlxuICBzd2FwQ2xhc3NOYW1lOiAoY2xhc3NOYW1lcy4uLikgLT5cbiAgICBvbGRNb2RlID0gQG1vZGVcblxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUob2xkTW9kZSArIFwiLW1vZGVcIilcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd2aW0tbW9kZS1wbHVzJylcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZXMuLi4pXG5cbiAgICBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWVzLi4uKVxuICAgICAgaWYgQG1vZGUgaXMgb2xkTW9kZVxuICAgICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKG9sZE1vZGUgKyBcIi1tb2RlXCIpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKCd2aW0tbW9kZS1wbHVzJylcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLWZvY3VzZWQnKVxuXG4gICMgQWxsIHN1YnNjcmlwdGlvbnMgaGVyZSBpcyBjZWxhcmVkIG9uIGVhY2ggb3BlcmF0aW9uIGZpbmlzaGVkLlxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb25EaWRDaGFuZ2VTZWFyY2g6IChmbikgLT4gQHN1YnNjcmliZSBAc2VhcmNoSW5wdXQub25EaWRDaGFuZ2UoZm4pXG4gIG9uRGlkQ29uZmlybVNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENvbmZpcm0oZm4pXG4gIG9uRGlkQ2FuY2VsU2VhcmNoOiAoZm4pIC0+IEBzdWJzY3JpYmUgQHNlYXJjaElucHV0Lm9uRGlkQ2FuY2VsKGZuKVxuICBvbkRpZENvbW1hbmRTZWFyY2g6IChmbikgLT4gQHN1YnNjcmliZSBAc2VhcmNoSW5wdXQub25EaWRDb21tYW5kKGZuKVxuXG4gICMgU2VsZWN0IGFuZCB0ZXh0IG11dGF0aW9uKENoYW5nZSlcbiAgb25EaWRTZXRUYXJnZXQ6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXNldC10YXJnZXQnLCBmbilcbiAgZW1pdERpZFNldFRhcmdldDogKG9wZXJhdG9yKSAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2V0LXRhcmdldCcsIG9wZXJhdG9yKVxuXG4gIG9uV2lsbFNlbGVjdFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCd3aWxsLXNlbGVjdC10YXJnZXQnLCBmbilcbiAgZW1pdFdpbGxTZWxlY3RUYXJnZXQ6IC0+IEBlbWl0dGVyLmVtaXQoJ3dpbGwtc2VsZWN0LXRhcmdldCcpXG5cbiAgb25EaWRTZWxlY3RUYXJnZXQ6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXNlbGVjdC10YXJnZXQnLCBmbilcbiAgZW1pdERpZFNlbGVjdFRhcmdldDogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXNlbGVjdC10YXJnZXQnKVxuXG4gIG9uRGlkRmFpbFNlbGVjdFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtZmFpbC1zZWxlY3QtdGFyZ2V0JywgZm4pXG4gIGVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0OiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtZmFpbC1zZWxlY3QtdGFyZ2V0JylcblxuICBvbldpbGxGaW5pc2hNdXRhdGlvbjogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdvbi13aWxsLWZpbmlzaC1tdXRhdGlvbicsIGZuKVxuICBlbWl0V2lsbEZpbmlzaE11dGF0aW9uOiAtPiBAZW1pdHRlci5lbWl0KCdvbi13aWxsLWZpbmlzaC1tdXRhdGlvbicpXG5cbiAgb25EaWRGaW5pc2hNdXRhdGlvbjogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdvbi1kaWQtZmluaXNoLW11dGF0aW9uJywgZm4pXG4gIGVtaXREaWRGaW5pc2hNdXRhdGlvbjogLT4gQGVtaXR0ZXIuZW1pdCgnb24tZGlkLWZpbmlzaC1tdXRhdGlvbicpXG5cbiAgb25EaWRSZXN0b3JlQ3Vyc29yUG9zaXRpb25zOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1yZXN0b3JlLWN1cnNvci1wb3NpdGlvbnMnLCBmbilcbiAgZW1pdERpZFJlc3RvcmVDdXJzb3JQb3NpdGlvbnM6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1yZXN0b3JlLWN1cnNvci1wb3NpdGlvbnMnKVxuXG4gIG9uRGlkU2V0T3BlcmF0b3JNb2RpZmllcjogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtc2V0LW9wZXJhdG9yLW1vZGlmaWVyJywgZm4pXG4gIGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyOiAob3B0aW9ucykgLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXNldC1vcGVyYXRvci1tb2RpZmllcicsIG9wdGlvbnMpXG5cbiAgb25EaWRGaW5pc2hPcGVyYXRpb246IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLWZpbmlzaC1vcGVyYXRpb24nLCBmbilcbiAgZW1pdERpZEZpbmlzaE9wZXJhdGlvbjogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLWZpbmlzaC1vcGVyYXRpb24nKVxuXG4gIG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjazogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtcmVzZXQtb3BlcmF0aW9uLXN0YWNrJywgZm4pXG4gIGVtaXREaWRSZXNldE9wZXJhdGlvblN0YWNrOiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtcmVzZXQtb3BlcmF0aW9uLXN0YWNrJylcblxuICAjIFNlbGVjdCBsaXN0IHZpZXdcbiAgb25EaWRDb25maXJtU2VsZWN0TGlzdDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtY29uZmlybS1zZWxlY3QtbGlzdCcsIGZuKVxuICBvbkRpZENhbmNlbFNlbGVjdExpc3Q6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLWNhbmNlbC1zZWxlY3QtbGlzdCcsIGZuKVxuXG4gICMgUHJveHlpbmcgbW9kZU1hbmdlcidzIGV2ZW50IGhvb2sgd2l0aCBzaG9ydC1saWZlIHN1YnNjcmlwdGlvbi5cbiAgb25XaWxsQWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLm9uV2lsbEFjdGl2YXRlTW9kZShmbilcbiAgb25EaWRBY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25EaWRBY3RpdmF0ZU1vZGUoZm4pXG4gIG9uV2lsbERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLm9uV2lsbERlYWN0aXZhdGVNb2RlKGZuKVxuICBwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLnByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGUoZm4pXG4gIG9uRGlkRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25EaWREZWFjdGl2YXRlTW9kZShmbilcblxuICAjIEV2ZW50c1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb25EaWRGYWlsVG9QdXNoVG9PcGVyYXRpb25TdGFjazogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWZhaWwtdG8tcHVzaC10by1vcGVyYXRpb24tc3RhY2snLCBmbilcbiAgZW1pdERpZEZhaWxUb1B1c2hUb09wZXJhdGlvblN0YWNrOiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtZmFpbC10by1wdXNoLXRvLW9wZXJhdGlvbi1zdGFjaycpXG5cbiAgb25EaWREZXN0cm95OiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtZGVzdHJveScsIGZuKVxuXG4gICMgKiBgZm5gIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdoZW4gbWFyayB3YXMgc2V0LlxuICAjICAgKiBgbmFtZWAgTmFtZSBvZiBtYXJrIHN1Y2ggYXMgJ2EnLlxuICAjICAgKiBgYnVmZmVyUG9zaXRpb25gOiBidWZmZXJQb3NpdGlvbiB3aGVyZSBtYXJrIHdhcyBzZXQuXG4gICMgICAqIGBlZGl0b3JgOiBlZGl0b3Igd2hlcmUgbWFyayB3YXMgc2V0LlxuICAjIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gICNcbiAgIyAgVXNhZ2U6XG4gICMgICBvbkRpZFNldE1hcmsgKHtuYW1lLCBidWZmZXJQb3NpdGlvbn0pIC0+IGRvIHNvbWV0aGluZy4uXG4gIG9uRGlkU2V0TWFyazogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLXNldC1tYXJrJywgZm4pXG5cbiAgb25EaWRTZXRJbnB1dENoYXI6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1zZXQtaW5wdXQtY2hhcicsIGZuKVxuICBlbWl0RGlkU2V0SW5wdXRDaGFyOiAoY2hhcikgLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXNldC1pbnB1dC1jaGFyJywgY2hhcilcblxuICBpc0FsaXZlOiAtPlxuICAgIEBjb25zdHJ1Y3Rvci52aW1TdGF0ZXNCeUVkaXRvci5oYXMoQGVkaXRvcilcblxuICBkZXN0cm95OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGlzQWxpdmUoKVxuICAgIEBjb25zdHJ1Y3Rvci52aW1TdGF0ZXNCeUVkaXRvci5kZWxldGUoQGVkaXRvcilcblxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gICAgaWYgQGVkaXRvci5pc0FsaXZlKClcbiAgICAgIEByZXNldE5vcm1hbE1vZGUoKVxuICAgICAgQHJlc2V0KClcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudD8uc2V0SW5wdXRFbmFibGVkKHRydWUpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHBhY2thZ2VTY29wZSwgJ25vcm1hbC1tb2RlJylcblxuICAgIEBob3Zlcj8uZGVzdHJveT8oKVxuICAgIEBob3ZlclNlYXJjaENvdW50ZXI/LmRlc3Ryb3k/KClcbiAgICBAc2VhcmNoSGlzdG9yeT8uZGVzdHJveT8oKVxuICAgIEBjdXJzb3JTdHlsZU1hbmFnZXI/LmRlc3Ryb3k/KClcbiAgICBAc2VhcmNoPy5kZXN0cm95PygpXG4gICAgQHJlZ2lzdGVyPy5kZXN0cm95P1xuICAgIHtcbiAgICAgIEBob3ZlciwgQGhvdmVyU2VhcmNoQ291bnRlciwgQG9wZXJhdGlvblN0YWNrLFxuICAgICAgQHNlYXJjaEhpc3RvcnksIEBjdXJzb3JTdHlsZU1hbmFnZXJcbiAgICAgIEBzZWFyY2gsIEBtb2RlTWFuYWdlciwgQHJlZ2lzdGVyXG4gICAgICBAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQHN1YnNjcmlwdGlvbnMsXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXJcbiAgICAgIEBwcmV2aW91c1NlbGVjdGlvblxuICAgICAgQHBlcnNpc3RlbnRTZWxlY3Rpb25cbiAgICB9ID0ge31cbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtZGVzdHJveSdcblxuICBpc0ludGVyZXN0aW5nRXZlbnQ6ICh7dGFyZ2V0LCB0eXBlfSkgLT5cbiAgICBpZiBAbW9kZSBpcyAnaW5zZXJ0J1xuICAgICAgZmFsc2VcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yPyBhbmRcbiAgICAgICAgdGFyZ2V0Py5jbG9zZXN0PygnYXRvbS10ZXh0LWVkaXRvcicpIGlzIEBlZGl0b3JFbGVtZW50IGFuZFxuICAgICAgICBub3QgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpIGFuZFxuICAgICAgICBub3QgdHlwZS5zdGFydHNXaXRoKCd2aW0tbW9kZS1wbHVzOicpXG5cbiAgY2hlY2tTZWxlY3Rpb246IChldmVudCkgLT5cbiAgICByZXR1cm4gaWYgQG9wZXJhdGlvblN0YWNrLmlzUHJvY2Vzc2luZygpXG4gICAgcmV0dXJuIHVubGVzcyBAaXNJbnRlcmVzdGluZ0V2ZW50KGV2ZW50KVxuXG4gICAgbm9uRW1wdHlTZWxlY2l0b25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuZmlsdGVyIChzZWxlY3Rpb24pIC0+IG5vdCBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgaWYgbm9uRW1wdHlTZWxlY2l0b25zLmxlbmd0aFxuICAgICAgd2lzZSA9IHN3cmFwLmRldGVjdFdpc2UoQGVkaXRvcilcbiAgICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsIHdpc2UpXG4gICAgICAgIGZvciBzZWxlY3Rpb24gaW4gbm9uRW1wdHlTZWxlY2l0b25zIHdoZW4gbm90IHN3cmFwKHNlbGVjdGlvbikuaGFzUHJvcGVydGllcygpXG4gICAgICAgICAgc3dyYXAoc2VsZWN0aW9uKS5zYXZlUHJvcGVydGllcygpXG4gICAgICAgIEB1cGRhdGVDdXJzb3JzVmlzaWJpbGl0eSgpXG4gICAgICBlbHNlXG4gICAgICAgIEBhY3RpdmF0ZSgndmlzdWFsJywgd2lzZSlcbiAgICBlbHNlXG4gICAgICBAYWN0aXZhdGUoJ25vcm1hbCcpIGlmIEBpc01vZGUoJ3Zpc3VhbCcpXG5cbiAgc2F2ZVByb3BlcnRpZXM6IChldmVudCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpc0ludGVyZXN0aW5nRXZlbnQoZXZlbnQpXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgc3dyYXAoc2VsZWN0aW9uKS5zYXZlUHJvcGVydGllcygpXG5cbiAgb2JzZXJ2ZVNlbGVjdGlvbnM6IC0+XG4gICAgY2hlY2tTZWxlY3Rpb24gPSBAY2hlY2tTZWxlY3Rpb24uYmluZCh0aGlzKVxuICAgIEBlZGl0b3JFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBjaGVja1NlbGVjdGlvbilcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBjaGVja1NlbGVjdGlvbilcblxuICAgICMgW0ZJWE1FXVxuICAgICMgSG92ZXIgcG9zaXRpb24gZ2V0IHdpcmVkIHdoZW4gZm9jdXMtY2hhbmdlIGJldHdlZW4gbW9yZSB0aGFuIHR3byBwYW5lLlxuICAgICMgY29tbWVudGluZyBvdXQgaXMgZmFyIGJldHRlciB0aGFuIGludHJvZHVjaW5nIEJ1Z2d5IGJlaGF2aW9yLlxuICAgICMgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMub25XaWxsRGlzcGF0Y2goc2F2ZVByb3BlcnRpZXMpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMub25EaWREaXNwYXRjaChjaGVja1NlbGVjdGlvbilcblxuICAjIFdoYXQncyB0aGlzP1xuICAjIGVkaXRvci5jbGVhclNlbGVjdGlvbnMoKSBkb2Vzbid0IHJlc3BlY3QgbGFzdEN1cnNvciBwb3NpdG9pbi5cbiAgIyBUaGlzIG1ldGhvZCB3b3JrcyBpbiBzYW1lIHdheSBhcyBlZGl0b3IuY2xlYXJTZWxlY3Rpb25zKCkgYnV0IHJlc3BlY3QgbGFzdCBjdXJzb3IgcG9zaXRpb24uXG4gIGNsZWFyU2VsZWN0aW9uczogLT5cbiAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcblxuICByZXNldE5vcm1hbE1vZGU6ICh7dXNlckludm9jYXRpb259PXt9KSAtPlxuICAgIGlmIHVzZXJJbnZvY2F0aW9uID8gZmFsc2VcbiAgICAgIGlmIEBlZGl0b3IuaGFzTXVsdGlwbGVDdXJzb3JzKClcbiAgICAgICAgQGNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICAgIGVsc2UgaWYgQGhhc1BlcnNpc3RlbnRTZWxlY3Rpb25zKCkgYW5kIEBnZXRDb25maWcoJ2NsZWFyUGVyc2lzdGVudFNlbGVjdGlvbk9uUmVzZXROb3JtYWxNb2RlJylcbiAgICAgICAgQGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbnMoKVxuICAgICAgZWxzZSBpZiBAb2NjdXJyZW5jZU1hbmFnZXIuaGFzUGF0dGVybnMoKVxuICAgICAgICBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpXG5cbiAgICAgIGlmIEBnZXRDb25maWcoJ2NsZWFySGlnaGxpZ2h0U2VhcmNoT25SZXNldE5vcm1hbE1vZGUnKVxuICAgICAgICBAZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbnVsbClcbiAgICBlbHNlXG4gICAgICBAY2xlYXJTZWxlY3Rpb25zKClcbiAgICBAYWN0aXZhdGUoJ25vcm1hbCcpXG5cbiAgaW5pdDogLT5cbiAgICBAc2F2ZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKVxuXG4gIHJlc2V0OiAtPlxuICAgIEByZWdpc3Rlci5yZXNldCgpXG4gICAgQHNlYXJjaEhpc3RvcnkucmVzZXQoKVxuICAgIEBob3Zlci5yZXNldCgpXG4gICAgQG9wZXJhdGlvblN0YWNrLnJlc2V0KClcbiAgICBAbXV0YXRpb25NYW5hZ2VyLnJlc2V0KClcblxuICBpc1Zpc2libGU6IC0+XG4gICAgQGVkaXRvciBpbiBnZXRWaXNpYmxlRWRpdG9ycygpXG5cbiAgdXBkYXRlQ3Vyc29yc1Zpc2liaWxpdHk6IC0+XG4gICAgQGN1cnNvclN0eWxlTWFuYWdlci5yZWZyZXNoKClcblxuICB1cGRhdGVQcmV2aW91c1NlbGVjdGlvbjogLT4gIyBGSVhNRTogbmFtaW5nLCB1cGRhdGVMYXN0U2VsZWN0ZWRJbmZvID9cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgIHByb3BlcnRpZXMgPSBAZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpPy5nZXRDaGFyYWN0ZXJ3aXNlUHJvcGVydGllcygpXG4gICAgZWxzZVxuICAgICAgcHJvcGVydGllcyA9IHN3cmFwKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKS5jYXB0dXJlUHJvcGVydGllcygpXG5cbiAgICByZXR1cm4gdW5sZXNzIHByb3BlcnRpZXM/XG5cbiAgICB7aGVhZCwgdGFpbH0gPSBwcm9wZXJ0aWVzXG4gICAgaWYgaGVhZC5pc0dyZWF0ZXJUaGFuKHRhaWwpXG4gICAgICBAbWFyay5zZXRSYW5nZSgnPCcsICc+JywgW3RhaWwsIGhlYWRdKVxuICAgIGVsc2VcbiAgICAgIEBtYXJrLnNldFJhbmdlKCc8JywgJz4nLCBbaGVhZCwgdGFpbF0pXG4gICAgQHByZXZpb3VzU2VsZWN0aW9uID0ge3Byb3BlcnRpZXMsIEBzdWJtb2RlfVxuXG4gICMgUGVyc2lzdGVudCBzZWxlY3Rpb25cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGhhc1BlcnNpc3RlbnRTZWxlY3Rpb25zOiAtPlxuICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uLmhhc01hcmtlcnMoKVxuXG4gIGdldFBlcnNpc3RlbnRTZWxlY3Rpb25CdWZmZXJSYW5nZXM6IC0+XG4gICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQnVmZmVyUmFuZ2VzKClcblxuICBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25zOiAtPlxuICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uLmNsZWFyTWFya2VycygpXG5cbiAgIyBBbmltYXRpb24gbWFuYWdlbWVudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2Nyb2xsQW5pbWF0aW9uRWZmZWN0OiBudWxsXG4gIHJlcXVlc3RTY3JvbGxBbmltYXRpb246IChmcm9tLCB0bywgb3B0aW9ucykgLT5cbiAgICBAc2Nyb2xsQW5pbWF0aW9uRWZmZWN0ID0galF1ZXJ5KGZyb20pLmFuaW1hdGUodG8sIG9wdGlvbnMpXG5cbiAgZmluaXNoU2Nyb2xsQW5pbWF0aW9uOiAtPlxuICAgIEBzY3JvbGxBbmltYXRpb25FZmZlY3Q/LmZpbmlzaCgpXG4gICAgQHNjcm9sbEFuaW1hdGlvbkVmZmVjdCA9IG51bGxcblxuICAjIE90aGVyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzYXZlT3JpZ2luYWxDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbiA9IG51bGxcbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyPy5kZXN0cm95KClcblxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBzZWxlY3Rpb24gPSBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKVxuICAgICAgcG9pbnQgPSBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXSlcbiAgICBlbHNlXG4gICAgICBwb2ludCA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uID0gcG9pbnRcbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyID0gQGVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24ocG9pbnQsIGludmFsaWRhdGU6ICduZXZlcicpXG5cbiAgcmVzdG9yZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb246IC0+XG4gICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihAZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbigpKVxuXG4gIGdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb246IC0+XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25cblxuICBnZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXI6IC0+XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlci5nZXRTdGFydEJ1ZmZlclBvc2l0aW9uKClcbiJdfQ==
