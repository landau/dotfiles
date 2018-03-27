(function() {
  var BlockwiseSelection, CompositeDisposable, CursorStyleManager, Delegato, Disposable, Emitter, FlashManager, HighlightSearchManager, HoverManager, MarkManager, ModeManager, MutationManager, OccurrenceManager, OperationStack, PersistentSelectionManager, Range, RegisterManager, SearchHistoryManager, SearchInputElement, VimState, _, assert, assertWithException, getVisibleEditors, jQuery, matchScopes, packageScope, ref, ref1, semver, settings, swrap, translatePointAndClip,
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

  ref1 = require('./utils'), getVisibleEditors = ref1.getVisibleEditors, matchScopes = ref1.matchScopes, assert = ref1.assert, assertWithException = ref1.assertWithException, translatePointAndClip = ref1.translatePointAndClip;

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

    VimState.prototype.onDidRestoreCursorPositions = function(fn) {
      return this.subscribe(this.emitter.on('did-restore-cursor-positions', fn));
    };

    VimState.prototype.emitDidRestoreCursorPositions = function(event) {
      return this.emitter.emit('did-restore-cursor-positions', event);
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
      var $selection, i, len, nonEmptySelecitons, ref2, wise;
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
        this.editorElement.component.updateSync();
        if (this.isMode('visual', wise)) {
          ref2 = swrap.getSelections(this.editor);
          for (i = 0, len = ref2.length; i < len; i++) {
            $selection = ref2[i];
            if ($selection.hasProperties()) {
              if (wise === 'linewise') {
                $selection.fixPropertyRowToRowRange();
              }
            } else {
              $selection.saveProperties();
            }
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
      this.mark.setRange('<', '>', [start, end]);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdmltLXN0YXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEscWRBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDVixTQUFVLE9BQUEsQ0FBUSxzQkFBUjs7RUFFWCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQW9ELE9BQUEsQ0FBUSxNQUFSLENBQXBELEVBQUMscUJBQUQsRUFBVSwyQkFBVixFQUFzQiw2Q0FBdEIsRUFBMkM7O0VBRTNDLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNmLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSxnQkFBUjs7RUFDckIsT0FNSSxPQUFBLENBQVEsU0FBUixDQU5KLEVBQ0UsMENBREYsRUFFRSw4QkFGRixFQUdFLG9CQUhGLEVBSUUsOENBSkYsRUFLRTs7RUFFRixLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUVSLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSOztFQUNqQixXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsZUFBQSxHQUFrQixPQUFBLENBQVEsb0JBQVI7O0VBQ2xCLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwwQkFBUjs7RUFDdkIsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHdCQUFSOztFQUNyQixrQkFBQSxHQUFxQixPQUFBLENBQVEsdUJBQVI7O0VBQ3JCLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSxzQkFBUjs7RUFDcEIsc0JBQUEsR0FBeUIsT0FBQSxDQUFRLDRCQUFSOztFQUN6QixlQUFB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TUFBTSxDQUFDLHVCQUFSLENBQUEsRUFKVjs7TUFLQSxJQUFDLENBQUEsc0JBQUQsR0FBMEI7YUFDMUIsSUFBQyxDQUFBLDhCQUFELEdBQWtDLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBMkIsS0FBM0IsRUFBa0M7UUFBQSxVQUFBLEVBQVksT0FBWjtPQUFsQztJQVZSOzt1QkFZNUIsNkJBQUEsR0FBK0IsU0FBQTthQUM3QixJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLElBQUMsQ0FBQSx5QkFBRCxDQUFBLENBQWhDO0lBRDZCOzt1QkFHL0IseUJBQUEsR0FBMkIsU0FBQTthQUN6QixJQUFDLENBQUE7SUFEd0I7O3VCQUczQixpQ0FBQSxHQUFtQyxTQUFBO2FBQ2pDLElBQUMsQ0FBQSw4QkFBOEIsQ0FBQyxzQkFBaEMsQ0FBQTtJQURpQzs7Ozs7QUFqWXJDIiwic291cmNlc0NvbnRlbnQiOlsic2VtdmVyID0gcmVxdWlyZSAnc2VtdmVyJ1xuRGVsZWdhdG8gPSByZXF1aXJlICdkZWxlZ2F0bydcbntqUXVlcnl9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57RW1pdHRlciwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuSG92ZXJNYW5hZ2VyID0gcmVxdWlyZSAnLi9ob3Zlci1tYW5hZ2VyJ1xuU2VhcmNoSW5wdXRFbGVtZW50ID0gcmVxdWlyZSAnLi9zZWFyY2gtaW5wdXQnXG57XG4gIGdldFZpc2libGVFZGl0b3JzXG4gIG1hdGNoU2NvcGVzXG4gIGFzc2VydFxuICBhc3NlcnRXaXRoRXhjZXB0aW9uXG4gIHRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5cbk9wZXJhdGlvblN0YWNrID0gcmVxdWlyZSAnLi9vcGVyYXRpb24tc3RhY2snXG5NYXJrTWFuYWdlciA9IHJlcXVpcmUgJy4vbWFyay1tYW5hZ2VyJ1xuTW9kZU1hbmFnZXIgPSByZXF1aXJlICcuL21vZGUtbWFuYWdlcidcblJlZ2lzdGVyTWFuYWdlciA9IHJlcXVpcmUgJy4vcmVnaXN0ZXItbWFuYWdlcidcblNlYXJjaEhpc3RvcnlNYW5hZ2VyID0gcmVxdWlyZSAnLi9zZWFyY2gtaGlzdG9yeS1tYW5hZ2VyJ1xuQ3Vyc29yU3R5bGVNYW5hZ2VyID0gcmVxdWlyZSAnLi9jdXJzb3Itc3R5bGUtbWFuYWdlcidcbkJsb2Nrd2lzZVNlbGVjdGlvbiA9IHJlcXVpcmUgJy4vYmxvY2t3aXNlLXNlbGVjdGlvbidcbk9jY3VycmVuY2VNYW5hZ2VyID0gcmVxdWlyZSAnLi9vY2N1cnJlbmNlLW1hbmFnZXInXG5IaWdobGlnaHRTZWFyY2hNYW5hZ2VyID0gcmVxdWlyZSAnLi9oaWdobGlnaHQtc2VhcmNoLW1hbmFnZXInXG5NdXRhdGlvbk1hbmFnZXIgPSByZXF1aXJlICcuL211dGF0aW9uLW1hbmFnZXInXG5QZXJzaXN0ZW50U2VsZWN0aW9uTWFuYWdlciA9IHJlcXVpcmUgJy4vcGVyc2lzdGVudC1zZWxlY3Rpb24tbWFuYWdlcidcbkZsYXNoTWFuYWdlciA9IHJlcXVpcmUgJy4vZmxhc2gtbWFuYWdlcidcblxucGFja2FnZVNjb3BlID0gJ3ZpbS1tb2RlLXBsdXMnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFZpbVN0YXRlXG4gIEB2aW1TdGF0ZXNCeUVkaXRvcjogbmV3IE1hcFxuXG4gIEBnZXRCeUVkaXRvcjogKGVkaXRvcikgLT5cbiAgICBAdmltU3RhdGVzQnlFZGl0b3IuZ2V0KGVkaXRvcilcblxuICBAZm9yRWFjaDogKGZuKSAtPlxuICAgIEB2aW1TdGF0ZXNCeUVkaXRvci5mb3JFYWNoKGZuKVxuXG4gIEBjbGVhcjogLT5cbiAgICBAdmltU3RhdGVzQnlFZGl0b3IuY2xlYXIoKVxuXG4gIERlbGVnYXRvLmluY2x1ZGVJbnRvKHRoaXMpXG5cbiAgQGRlbGVnYXRlc1Byb3BlcnR5KCdtb2RlJywgJ3N1Ym1vZGUnLCB0b1Byb3BlcnR5OiAnbW9kZU1hbmFnZXInKVxuICBAZGVsZWdhdGVzTWV0aG9kcygnaXNNb2RlJywgJ2FjdGl2YXRlJywgdG9Qcm9wZXJ0eTogJ21vZGVNYW5hZ2VyJylcbiAgQGRlbGVnYXRlc01ldGhvZHMoJ2ZsYXNoJywgJ2ZsYXNoU2NyZWVuUmFuZ2UnLCB0b1Byb3BlcnR5OiAnZmxhc2hNYW5hZ2VyJylcbiAgQGRlbGVnYXRlc01ldGhvZHMoJ3N1YnNjcmliZScsICdnZXRDb3VudCcsICdzZXRDb3VudCcsICdoYXNDb3VudCcsICdhZGRUb0NsYXNzTGlzdCcsIHRvUHJvcGVydHk6ICdvcGVyYXRpb25TdGFjaycpXG5cbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBAc3RhdHVzQmFyTWFuYWdlciwgQGdsb2JhbFN0YXRlKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50ID0gQGVkaXRvci5lbGVtZW50XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAbW9kZU1hbmFnZXIgPSBuZXcgTW9kZU1hbmFnZXIodGhpcylcbiAgICBAbWFyayA9IG5ldyBNYXJrTWFuYWdlcih0aGlzKVxuICAgIEByZWdpc3RlciA9IG5ldyBSZWdpc3Rlck1hbmFnZXIodGhpcylcbiAgICBAaG92ZXIgPSBuZXcgSG92ZXJNYW5hZ2VyKHRoaXMpXG4gICAgQGhvdmVyU2VhcmNoQ291bnRlciA9IG5ldyBIb3Zlck1hbmFnZXIodGhpcylcbiAgICBAc2VhcmNoSGlzdG9yeSA9IG5ldyBTZWFyY2hIaXN0b3J5TWFuYWdlcih0aGlzKVxuICAgIEBoaWdobGlnaHRTZWFyY2ggPSBuZXcgSGlnaGxpZ2h0U2VhcmNoTWFuYWdlcih0aGlzKVxuICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uID0gbmV3IFBlcnNpc3RlbnRTZWxlY3Rpb25NYW5hZ2VyKHRoaXMpXG4gICAgQG9jY3VycmVuY2VNYW5hZ2VyID0gbmV3IE9jY3VycmVuY2VNYW5hZ2VyKHRoaXMpXG4gICAgQG11dGF0aW9uTWFuYWdlciA9IG5ldyBNdXRhdGlvbk1hbmFnZXIodGhpcylcbiAgICBAZmxhc2hNYW5hZ2VyID0gbmV3IEZsYXNoTWFuYWdlcih0aGlzKVxuXG4gICAgQHNlYXJjaElucHV0ID0gbmV3IFNlYXJjaElucHV0RWxlbWVudCgpLmluaXRpYWxpemUodGhpcylcblxuICAgIEBvcGVyYXRpb25TdGFjayA9IG5ldyBPcGVyYXRpb25TdGFjayh0aGlzKVxuICAgIEBjdXJzb3JTdHlsZU1hbmFnZXIgPSBuZXcgQ3Vyc29yU3R5bGVNYW5hZ2VyKHRoaXMpXG4gICAgQGJsb2Nrd2lzZVNlbGVjdGlvbnMgPSBbXVxuICAgIEBwcmV2aW91c1NlbGVjdGlvbiA9IHt9XG4gICAgQG9ic2VydmVTZWxlY3Rpb25zKClcblxuICAgIHJlZnJlc2hIaWdobGlnaHRTZWFyY2ggPSA9PlxuICAgICAgQGhpZ2hsaWdodFNlYXJjaC5yZWZyZXNoKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZFN0b3BDaGFuZ2luZyhyZWZyZXNoSGlnaGxpZ2h0U2VhcmNoKVxuXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChwYWNrYWdlU2NvcGUpXG4gICAgaWYgQGdldENvbmZpZygnc3RhcnRJbkluc2VydE1vZGUnKSBvciBtYXRjaFNjb3BlcyhAZWRpdG9yRWxlbWVudCwgQGdldENvbmZpZygnc3RhcnRJbkluc2VydE1vZGVTY29wZXMnKSlcbiAgICAgIEBhY3RpdmF0ZSgnaW5zZXJ0JylcbiAgICBlbHNlXG4gICAgICBAYWN0aXZhdGUoJ25vcm1hbCcpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcbiAgICBAY29uc3RydWN0b3IudmltU3RhdGVzQnlFZGl0b3Iuc2V0KEBlZGl0b3IsIHRoaXMpXG5cbiAgYXNzZXJ0OiAoYXJncy4uLikgLT5cbiAgICBhc3NlcnQoYXJncy4uLilcblxuICBhc3NlcnRXaXRoRXhjZXB0aW9uOiAoYXJncy4uLikgLT5cbiAgICBhc3NlcnRXaXRoRXhjZXB0aW9uKGFyZ3MuLi4pXG5cbiAgZ2V0Q29uZmlnOiAocGFyYW0pIC0+XG4gICAgc2V0dGluZ3MuZ2V0KHBhcmFtKVxuXG4gICMgQmxvY2t3aXNlU2VsZWN0aW9uc1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9uczogLT5cbiAgICBCbG9ja3dpc2VTZWxlY3Rpb24uZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuXG4gIGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb246IC0+XG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmdldExhc3RTZWxlY3Rpb24oQGVkaXRvcilcblxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb246IC0+XG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbihAZWRpdG9yKVxuXG4gIGNsZWFyQmxvY2t3aXNlU2VsZWN0aW9uczogLT5cbiAgICBCbG9ja3dpc2VTZWxlY3Rpb24uY2xlYXJTZWxlY3Rpb25zKEBlZGl0b3IpXG5cbiAgIyBPdGhlclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdG9nZ2xlQ2xhc3NMaXN0OiAoY2xhc3NOYW1lLCBib29sPXVuZGVmaW5lZCkgLT5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKGNsYXNzTmFtZSwgYm9vbClcblxuICAjIEZJWE1FOiBJIHdhbnQgdG8gcmVtb3ZlIHRoaXMgZGVuZ2VyaW91cyBhcHByb2FjaCwgYnV0IEkgY291bGRuJ3QgZmluZCB0aGUgYmV0dGVyIHdheS5cbiAgc3dhcENsYXNzTmFtZTogKGNsYXNzTmFtZXMuLi4pIC0+XG4gICAgb2xkTW9kZSA9IEBtb2RlXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKG9sZE1vZGUgKyBcIi1tb2RlXCIpXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgndmltLW1vZGUtcGx1cycpXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWVzLi4uKVxuXG4gICAgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lcy4uLilcbiAgICAgIGlmIEBtb2RlIGlzIG9sZE1vZGVcbiAgICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChvbGRNb2RlICsgXCItbW9kZVwiKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgndmltLW1vZGUtcGx1cycpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1mb2N1c2VkJylcblxuICAjIEFsbCBzdWJzY3JpcHRpb25zIGhlcmUgaXMgY2VsYXJlZCBvbiBlYWNoIG9wZXJhdGlvbiBmaW5pc2hlZC5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG9uRGlkQ2hhbmdlU2VhcmNoOiAoZm4pIC0+IEBzdWJzY3JpYmUgQHNlYXJjaElucHV0Lm9uRGlkQ2hhbmdlKGZuKVxuICBvbkRpZENvbmZpcm1TZWFyY2g6IChmbikgLT4gQHN1YnNjcmliZSBAc2VhcmNoSW5wdXQub25EaWRDb25maXJtKGZuKVxuICBvbkRpZENhbmNlbFNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENhbmNlbChmbilcbiAgb25EaWRDb21tYW5kU2VhcmNoOiAoZm4pIC0+IEBzdWJzY3JpYmUgQHNlYXJjaElucHV0Lm9uRGlkQ29tbWFuZChmbilcblxuICAjIFNlbGVjdCBhbmQgdGV4dCBtdXRhdGlvbihDaGFuZ2UpXG4gIG9uRGlkU2V0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1zZXQtdGFyZ2V0JywgZm4pXG4gIGVtaXREaWRTZXRUYXJnZXQ6IChvcGVyYXRvcikgLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXNldC10YXJnZXQnLCBvcGVyYXRvcilcblxuICBvbldpbGxTZWxlY3RUYXJnZXQ6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignd2lsbC1zZWxlY3QtdGFyZ2V0JywgZm4pXG4gIGVtaXRXaWxsU2VsZWN0VGFyZ2V0OiAtPiBAZW1pdHRlci5lbWl0KCd3aWxsLXNlbGVjdC10YXJnZXQnKVxuXG4gIG9uRGlkU2VsZWN0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1zZWxlY3QtdGFyZ2V0JywgZm4pXG4gIGVtaXREaWRTZWxlY3RUYXJnZXQ6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZWxlY3QtdGFyZ2V0JylcblxuICBvbkRpZEZhaWxTZWxlY3RUYXJnZXQ6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLWZhaWwtc2VsZWN0LXRhcmdldCcsIGZuKVxuICBlbWl0RGlkRmFpbFNlbGVjdFRhcmdldDogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLWZhaWwtc2VsZWN0LXRhcmdldCcpXG5cbiAgb25XaWxsRmluaXNoTXV0YXRpb246IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignb24td2lsbC1maW5pc2gtbXV0YXRpb24nLCBmbilcbiAgZW1pdFdpbGxGaW5pc2hNdXRhdGlvbjogLT4gQGVtaXR0ZXIuZW1pdCgnb24td2lsbC1maW5pc2gtbXV0YXRpb24nKVxuXG4gIG9uRGlkRmluaXNoTXV0YXRpb246IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignb24tZGlkLWZpbmlzaC1tdXRhdGlvbicsIGZuKVxuICBlbWl0RGlkRmluaXNoTXV0YXRpb246IC0+IEBlbWl0dGVyLmVtaXQoJ29uLWRpZC1maW5pc2gtbXV0YXRpb24nKVxuXG4gIG9uRGlkUmVzdG9yZUN1cnNvclBvc2l0aW9uczogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtcmVzdG9yZS1jdXJzb3ItcG9zaXRpb25zJywgZm4pXG4gIGVtaXREaWRSZXN0b3JlQ3Vyc29yUG9zaXRpb25zOiAoZXZlbnQpIC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1yZXN0b3JlLWN1cnNvci1wb3NpdGlvbnMnLCBldmVudClcblxuICBvbkRpZFNldE9wZXJhdG9yTW9kaWZpZXI6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXNldC1vcGVyYXRvci1tb2RpZmllcicsIGZuKVxuICBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcjogKG9wdGlvbnMpIC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZXQtb3BlcmF0b3ItbW9kaWZpZXInLCBvcHRpb25zKVxuXG4gIG9uRGlkRmluaXNoT3BlcmF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1maW5pc2gtb3BlcmF0aW9uJywgZm4pXG4gIGVtaXREaWRGaW5pc2hPcGVyYXRpb246IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1maW5pc2gtb3BlcmF0aW9uJylcblxuICBvbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2s6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXJlc2V0LW9wZXJhdGlvbi1zdGFjaycsIGZuKVxuICBlbWl0RGlkUmVzZXRPcGVyYXRpb25TdGFjazogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXJlc2V0LW9wZXJhdGlvbi1zdGFjaycpXG5cbiAgIyBTZWxlY3QgbGlzdCB2aWV3XG4gIG9uRGlkQ29uZmlybVNlbGVjdExpc3Q6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLWNvbmZpcm0tc2VsZWN0LWxpc3QnLCBmbilcbiAgb25EaWRDYW5jZWxTZWxlY3RMaXN0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1jYW5jZWwtc2VsZWN0LWxpc3QnLCBmbilcblxuICAjIFByb3h5aW5nIG1vZGVNYW5nZXIncyBldmVudCBob29rIHdpdGggc2hvcnQtbGlmZSBzdWJzY3JpcHRpb24uXG4gIG9uV2lsbEFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbldpbGxBY3RpdmF0ZU1vZGUoZm4pXG4gIG9uRGlkQWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLm9uRGlkQWN0aXZhdGVNb2RlKGZuKVxuICBvbldpbGxEZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbldpbGxEZWFjdGl2YXRlTW9kZShmbilcbiAgcHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5wcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlKGZuKVxuICBvbkRpZERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLm9uRGlkRGVhY3RpdmF0ZU1vZGUoZm4pXG5cbiAgIyBFdmVudHNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG9uRGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2s6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1mYWlsLXRvLXB1c2gtdG8tb3BlcmF0aW9uLXN0YWNrJywgZm4pXG4gIGVtaXREaWRGYWlsVG9QdXNoVG9PcGVyYXRpb25TdGFjazogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLWZhaWwtdG8tcHVzaC10by1vcGVyYXRpb24tc3RhY2snKVxuXG4gIG9uRGlkRGVzdHJveTogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWRlc3Ryb3knLCBmbilcblxuICAjICogYGZuYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIG1hcmsgd2FzIHNldC5cbiAgIyAgICogYG5hbWVgIE5hbWUgb2YgbWFyayBzdWNoIGFzICdhJy5cbiAgIyAgICogYGJ1ZmZlclBvc2l0aW9uYDogYnVmZmVyUG9zaXRpb24gd2hlcmUgbWFyayB3YXMgc2V0LlxuICAjICAgKiBgZWRpdG9yYDogZWRpdG9yIHdoZXJlIG1hcmsgd2FzIHNldC5cbiAgIyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICAjXG4gICMgIFVzYWdlOlxuICAjICAgb25EaWRTZXRNYXJrICh7bmFtZSwgYnVmZmVyUG9zaXRpb259KSAtPiBkbyBzb21ldGhpbmcuLlxuICBvbkRpZFNldE1hcms6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1zZXQtbWFyaycsIGZuKVxuXG4gIG9uRGlkU2V0SW5wdXRDaGFyOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtc2V0LWlucHV0LWNoYXInLCBmbilcbiAgZW1pdERpZFNldElucHV0Q2hhcjogKGNoYXIpIC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZXQtaW5wdXQtY2hhcicsIGNoYXIpXG5cbiAgaXNBbGl2ZTogLT5cbiAgICBAY29uc3RydWN0b3IudmltU3RhdGVzQnlFZGl0b3IuaGFzKEBlZGl0b3IpXG5cbiAgZGVzdHJveTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpc0FsaXZlKClcbiAgICBAY29uc3RydWN0b3IudmltU3RhdGVzQnlFZGl0b3IuZGVsZXRlKEBlZGl0b3IpXG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmNsZWFyU2VsZWN0aW9ucyhAZWRpdG9yKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgICBpZiBAZWRpdG9yLmlzQWxpdmUoKVxuICAgICAgQHJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgICBAcmVzZXQoKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50Py5zZXRJbnB1dEVuYWJsZWQodHJ1ZSlcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUocGFja2FnZVNjb3BlLCAnbm9ybWFsLW1vZGUnKVxuXG4gICAgQGhvdmVyPy5kZXN0cm95PygpXG4gICAgQGhvdmVyU2VhcmNoQ291bnRlcj8uZGVzdHJveT8oKVxuICAgIEBzZWFyY2hIaXN0b3J5Py5kZXN0cm95PygpXG4gICAgQGN1cnNvclN0eWxlTWFuYWdlcj8uZGVzdHJveT8oKVxuICAgIEBzZWFyY2g/LmRlc3Ryb3k/KClcbiAgICBAcmVnaXN0ZXI/LmRlc3Ryb3k/XG4gICAge1xuICAgICAgQGhvdmVyLCBAaG92ZXJTZWFyY2hDb3VudGVyLCBAb3BlcmF0aW9uU3RhY2ssXG4gICAgICBAc2VhcmNoSGlzdG9yeSwgQGN1cnNvclN0eWxlTWFuYWdlclxuICAgICAgQHNlYXJjaCwgQG1vZGVNYW5hZ2VyLCBAcmVnaXN0ZXJcbiAgICAgIEBlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAc3Vic2NyaXB0aW9ucyxcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlclxuICAgICAgQHByZXZpb3VzU2VsZWN0aW9uXG4gICAgICBAcGVyc2lzdGVudFNlbGVjdGlvblxuICAgIH0gPSB7fVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1kZXN0cm95J1xuXG4gIGlzSW50ZXJlc3RpbmdFdmVudDogKHt0YXJnZXQsIHR5cGV9KSAtPlxuICAgIGlmIEBtb2RlIGlzICdpbnNlcnQnXG4gICAgICBmYWxzZVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3I/IGFuZFxuICAgICAgICB0YXJnZXQ/LmNsb3Nlc3Q/KCdhdG9tLXRleHQtZWRpdG9yJykgaXMgQGVkaXRvckVsZW1lbnQgYW5kXG4gICAgICAgIG5vdCBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJykgYW5kXG4gICAgICAgIG5vdCB0eXBlLnN0YXJ0c1dpdGgoJ3ZpbS1tb2RlLXBsdXM6JylcblxuICBjaGVja1NlbGVjdGlvbjogKGV2ZW50KSAtPlxuICAgIHJldHVybiBpZiBAb3BlcmF0aW9uU3RhY2suaXNQcm9jZXNzaW5nKClcbiAgICByZXR1cm4gdW5sZXNzIEBpc0ludGVyZXN0aW5nRXZlbnQoZXZlbnQpXG5cbiAgICBub25FbXB0eVNlbGVjaXRvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5maWx0ZXIgKHNlbGVjdGlvbikgLT4gbm90IHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICBpZiBub25FbXB0eVNlbGVjaXRvbnMubGVuZ3RoXG4gICAgICB3aXNlID0gc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuICAgICAgaWYgQGlzTW9kZSgndmlzdWFsJywgd2lzZSlcbiAgICAgICAgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuICAgICAgICAgIGlmICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgICAgICAgICAkc2VsZWN0aW9uLmZpeFByb3BlcnR5Um93VG9Sb3dSYW5nZSgpIGlmIHdpc2UgaXMgJ2xpbmV3aXNlJ1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICBAdXBkYXRlQ3Vyc29yc1Zpc2liaWxpdHkoKVxuICAgICAgZWxzZVxuICAgICAgICBAYWN0aXZhdGUoJ3Zpc3VhbCcsIHdpc2UpXG4gICAgZWxzZVxuICAgICAgQGFjdGl2YXRlKCdub3JtYWwnKSBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuXG4gIHNhdmVQcm9wZXJ0aWVzOiAoZXZlbnQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaXNJbnRlcmVzdGluZ0V2ZW50KGV2ZW50KVxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHN3cmFwKHNlbGVjdGlvbikuc2F2ZVByb3BlcnRpZXMoKVxuXG4gIG9ic2VydmVTZWxlY3Rpb25zOiAtPlxuICAgIGNoZWNrU2VsZWN0aW9uID0gQGNoZWNrU2VsZWN0aW9uLmJpbmQodGhpcylcbiAgICBAZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgY2hlY2tTZWxlY3Rpb24pXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgY2hlY2tTZWxlY3Rpb24pXG5cbiAgICAjIFtGSVhNRV1cbiAgICAjIEhvdmVyIHBvc2l0aW9uIGdldCB3aXJlZCB3aGVuIGZvY3VzLWNoYW5nZSBiZXR3ZWVuIG1vcmUgdGhhbiB0d28gcGFuZS5cbiAgICAjIGNvbW1lbnRpbmcgb3V0IGlzIGZhciBiZXR0ZXIgdGhhbiBpbnRyb2R1Y2luZyBCdWdneSBiZWhhdmlvci5cbiAgICAjIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLm9uV2lsbERpc3BhdGNoKHNhdmVQcm9wZXJ0aWVzKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLm9uRGlkRGlzcGF0Y2goY2hlY2tTZWxlY3Rpb24pXG5cbiAgIyBXaGF0J3MgdGhpcz9cbiAgIyBlZGl0b3IuY2xlYXJTZWxlY3Rpb25zKCkgZG9lc24ndCByZXNwZWN0IGxhc3RDdXJzb3IgcG9zaXRvaW4uXG4gICMgVGhpcyBtZXRob2Qgd29ya3MgaW4gc2FtZSB3YXkgYXMgZWRpdG9yLmNsZWFyU2VsZWN0aW9ucygpIGJ1dCByZXNwZWN0IGxhc3QgY3Vyc29yIHBvc2l0aW9uLlxuICBjbGVhclNlbGVjdGlvbnM6IC0+XG4gICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgcmVzZXROb3JtYWxNb2RlOiAoe3VzZXJJbnZvY2F0aW9ufT17fSkgLT5cbiAgICBCbG9ja3dpc2VTZWxlY3Rpb24uY2xlYXJTZWxlY3Rpb25zKEBlZGl0b3IpXG5cbiAgICBpZiB1c2VySW52b2NhdGlvbiA/IGZhbHNlXG4gICAgICBzd2l0Y2hcbiAgICAgICAgd2hlbiBAZWRpdG9yLmhhc011bHRpcGxlQ3Vyc29ycygpXG4gICAgICAgICAgQGNsZWFyU2VsZWN0aW9ucygpXG4gICAgICAgIHdoZW4gQGhhc1BlcnNpc3RlbnRTZWxlY3Rpb25zKCkgYW5kIEBnZXRDb25maWcoJ2NsZWFyUGVyc2lzdGVudFNlbGVjdGlvbk9uUmVzZXROb3JtYWxNb2RlJylcbiAgICAgICAgICBAY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9ucygpXG4gICAgICAgIHdoZW4gQG9jY3VycmVuY2VNYW5hZ2VyLmhhc1BhdHRlcm5zKClcbiAgICAgICAgICBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpXG5cbiAgICAgIGlmIEBnZXRDb25maWcoJ2NsZWFySGlnaGxpZ2h0U2VhcmNoT25SZXNldE5vcm1hbE1vZGUnKVxuICAgICAgICBAZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbnVsbClcbiAgICBlbHNlXG4gICAgICBAY2xlYXJTZWxlY3Rpb25zKClcbiAgICBAYWN0aXZhdGUoJ25vcm1hbCcpXG5cbiAgaW5pdDogLT5cbiAgICBAc2F2ZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKVxuXG4gIHJlc2V0OiAtPlxuICAgIEByZWdpc3Rlci5yZXNldCgpXG4gICAgQHNlYXJjaEhpc3RvcnkucmVzZXQoKVxuICAgIEBob3Zlci5yZXNldCgpXG4gICAgQG9wZXJhdGlvblN0YWNrLnJlc2V0KClcbiAgICBAbXV0YXRpb25NYW5hZ2VyLnJlc2V0KClcblxuICBpc1Zpc2libGU6IC0+XG4gICAgQGVkaXRvciBpbiBnZXRWaXNpYmxlRWRpdG9ycygpXG5cbiAgdXBkYXRlQ3Vyc29yc1Zpc2liaWxpdHk6IC0+XG4gICAgQGN1cnNvclN0eWxlTWFuYWdlci5yZWZyZXNoKClcblxuICAjIEZJWE1FOiBuYW1pbmcsIHVwZGF0ZUxhc3RTZWxlY3RlZEluZm8gP1xuICB1cGRhdGVQcmV2aW91c1NlbGVjdGlvbjogLT5cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgIHByb3BlcnRpZXMgPSBAZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpPy5nZXRQcm9wZXJ0aWVzKClcbiAgICBlbHNlXG4gICAgICBwcm9wZXJ0aWVzID0gc3dyYXAoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLmdldFByb3BlcnRpZXMoKVxuXG4gICAgIyBUT0RPIzcwNCB3aGVuIGN1cnNvciBpcyBhZGRlZCBpbiB2aXN1YWwtbW9kZSwgY29ycmVzcG9uZGluZyBzZWxlY3Rpb24gcHJvcCB5ZXQgbm90IGV4aXN0cy5cbiAgICByZXR1cm4gdW5sZXNzIHByb3BlcnRpZXNcblxuICAgIHtoZWFkLCB0YWlsfSA9IHByb3BlcnRpZXNcblxuICAgIGlmIGhlYWQuaXNHcmVhdGVyVGhhbk9yRXF1YWwodGFpbClcbiAgICAgIFtzdGFydCwgZW5kXSA9IFt0YWlsLCBoZWFkXVxuICAgICAgaGVhZCA9IGVuZCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBlbmQsICdmb3J3YXJkJylcbiAgICBlbHNlXG4gICAgICBbc3RhcnQsIGVuZF0gPSBbaGVhZCwgdGFpbF1cbiAgICAgIHRhaWwgPSBlbmQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgZW5kLCAnZm9yd2FyZCcpXG5cbiAgICBAbWFyay5zZXRSYW5nZSgnPCcsICc+JywgW3N0YXJ0LCBlbmRdKVxuICAgIEBwcmV2aW91c1NlbGVjdGlvbiA9IHtwcm9wZXJ0aWVzOiB7aGVhZCwgdGFpbH0sIEBzdWJtb2RlfVxuXG4gICMgUGVyc2lzdGVudCBzZWxlY3Rpb25cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGhhc1BlcnNpc3RlbnRTZWxlY3Rpb25zOiAtPlxuICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uLmhhc01hcmtlcnMoKVxuXG4gIGdldFBlcnNpc3RlbnRTZWxlY3Rpb25CdWZmZXJSYW5nZXM6IC0+XG4gICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQnVmZmVyUmFuZ2VzKClcblxuICBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25zOiAtPlxuICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uLmNsZWFyTWFya2VycygpXG5cbiAgIyBBbmltYXRpb24gbWFuYWdlbWVudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2Nyb2xsQW5pbWF0aW9uRWZmZWN0OiBudWxsXG4gIHJlcXVlc3RTY3JvbGxBbmltYXRpb246IChmcm9tLCB0bywgb3B0aW9ucykgLT5cbiAgICBAc2Nyb2xsQW5pbWF0aW9uRWZmZWN0ID0galF1ZXJ5KGZyb20pLmFuaW1hdGUodG8sIG9wdGlvbnMpXG5cbiAgZmluaXNoU2Nyb2xsQW5pbWF0aW9uOiAtPlxuICAgIEBzY3JvbGxBbmltYXRpb25FZmZlY3Q/LmZpbmlzaCgpXG4gICAgQHNjcm9sbEFuaW1hdGlvbkVmZmVjdCA9IG51bGxcblxuICAjIE90aGVyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzYXZlT3JpZ2luYWxDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbiA9IG51bGxcbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyPy5kZXN0cm95KClcblxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBzZWxlY3Rpb24gPSBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKVxuICAgICAgcG9pbnQgPSBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXSlcbiAgICBlbHNlXG4gICAgICBwb2ludCA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uID0gcG9pbnRcbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyID0gQGVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24ocG9pbnQsIGludmFsaWRhdGU6ICduZXZlcicpXG5cbiAgcmVzdG9yZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb246IC0+XG4gICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihAZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbigpKVxuXG4gIGdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb246IC0+XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25cblxuICBnZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXI6IC0+XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlci5nZXRTdGFydEJ1ZmZlclBvc2l0aW9uKClcbiJdfQ==
