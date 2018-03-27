(function() {
  var BlockwiseSelection, CompositeDisposable, CursorStyleManager, Delegato, Disposable, Emitter, FlashManager, HighlightSearchManager, HoverManager, MarkManager, ModeManager, MutationManager, OccurrenceManager, OperationStack, PersistentSelectionManager, Range, RegisterManager, SearchHistoryManager, SearchInputElement, VimState, _, getVisibleEditors, jQuery, matchScopes, packageScope, ref, ref1, semver, settings, swrap,
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

  ref1 = require('./utils'), getVisibleEditors = ref1.getVisibleEditors, matchScopes = ref1.matchScopes;

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
      if (settings.get('startInInsertMode') || matchScopes(this.editorElement, settings.get('startInInsertModeScopes'))) {
        this.activate('insert');
      } else {
        this.activate('normal');
      }
      this.subscriptions.add(this.editor.onDidDestroy(this.destroy.bind(this)));
      this.constructor.vimStatesByEditor.set(this.editor, this);
    }

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
      var i, len, nonEmptySelecitons, selection, submode;
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
        submode = swrap.detectVisualModeSubmode(this.editor);
        if (this.isMode('visual', submode)) {
          for (i = 0, len = nonEmptySelecitons.length; i < len; i++) {
            selection = nonEmptySelecitons[i];
            if (!swrap(selection).hasProperties()) {
              swrap(selection).saveProperties();
            }
          }
          return this.updateCursorsVisibility();
        } else {
          return this.activate('visual', submode);
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
        } else if (this.hasPersistentSelections() && settings.get('clearPersistentSelectionOnResetNormalMode')) {
          this.clearPersistentSelections();
        } else if (this.occurrenceManager.hasPatterns()) {
          this.occurrenceManager.resetPatterns();
        }
        if (settings.get('clearHighlightSearchOnResetNormalMode')) {
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
      var options, point, ref2;
      this.originalCursorPosition = null;
      if ((ref2 = this.originalCursorPositionByMarker) != null) {
        ref2.destroy();
      }
      if (this.mode === 'visual') {
        options = {
          fromProperty: true,
          allowFallback: true
        };
        point = swrap(this.editor.getLastSelection()).getBufferPositionFor('head', options);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdmltLXN0YXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaWFBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDVixTQUFVLE9BQUEsQ0FBUSxzQkFBUjs7RUFFWCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQW9ELE9BQUEsQ0FBUSxNQUFSLENBQXBELEVBQUMscUJBQUQsRUFBVSwyQkFBVixFQUFzQiw2Q0FBdEIsRUFBMkM7O0VBRTNDLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNmLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSxnQkFBUjs7RUFDckIsT0FHSSxPQUFBLENBQVEsU0FBUixDQUhKLEVBQ0UsMENBREYsRUFFRTs7RUFFRixLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUVSLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSOztFQUNqQixXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsZUFBQSxHQUFrQixPQUFBLENBQVEsb0JBQVI7O0VBQ2xCLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwwQkFBUjs7RUFDdkIsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHdCQUFSOztFQUNyQixrQkFBQSxHQUFxQixPQUFBLENBQVEsdUJBQVI7O0VBQ3JCLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSxzQkFBUjs7RUFDcEIsc0JBQUEsR0FBeUIsT0FBQSxDQUFRLDRCQUFSOztFQUN6QixlQUFBLEdBQWtCLE9BQUEsQ0FBUSxvQkFBUjs7RUFDbEIsMEJB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QWhDO0lBRDZCOzt1QkFHL0IseUJBQUEsR0FBMkIsU0FBQTthQUN6QixJQUFDLENBQUE7SUFEd0I7O3VCQUczQixpQ0FBQSxHQUFtQyxTQUFBO2FBQ2pDLElBQUMsQ0FBQSw4QkFBOEIsQ0FBQyxzQkFBaEMsQ0FBQTtJQURpQzs7Ozs7QUFwWHJDIiwic291cmNlc0NvbnRlbnQiOlsic2VtdmVyID0gcmVxdWlyZSAnc2VtdmVyJ1xuRGVsZWdhdG8gPSByZXF1aXJlICdkZWxlZ2F0bydcbntqUXVlcnl9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57RW1pdHRlciwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuSG92ZXJNYW5hZ2VyID0gcmVxdWlyZSAnLi9ob3Zlci1tYW5hZ2VyJ1xuU2VhcmNoSW5wdXRFbGVtZW50ID0gcmVxdWlyZSAnLi9zZWFyY2gtaW5wdXQnXG57XG4gIGdldFZpc2libGVFZGl0b3JzXG4gIG1hdGNoU2NvcGVzXG59ID0gcmVxdWlyZSAnLi91dGlscydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcblxuT3BlcmF0aW9uU3RhY2sgPSByZXF1aXJlICcuL29wZXJhdGlvbi1zdGFjaydcbk1hcmtNYW5hZ2VyID0gcmVxdWlyZSAnLi9tYXJrLW1hbmFnZXInXG5Nb2RlTWFuYWdlciA9IHJlcXVpcmUgJy4vbW9kZS1tYW5hZ2VyJ1xuUmVnaXN0ZXJNYW5hZ2VyID0gcmVxdWlyZSAnLi9yZWdpc3Rlci1tYW5hZ2VyJ1xuU2VhcmNoSGlzdG9yeU1hbmFnZXIgPSByZXF1aXJlICcuL3NlYXJjaC1oaXN0b3J5LW1hbmFnZXInXG5DdXJzb3JTdHlsZU1hbmFnZXIgPSByZXF1aXJlICcuL2N1cnNvci1zdHlsZS1tYW5hZ2VyJ1xuQmxvY2t3aXNlU2VsZWN0aW9uID0gcmVxdWlyZSAnLi9ibG9ja3dpc2Utc2VsZWN0aW9uJ1xuT2NjdXJyZW5jZU1hbmFnZXIgPSByZXF1aXJlICcuL29jY3VycmVuY2UtbWFuYWdlcidcbkhpZ2hsaWdodFNlYXJjaE1hbmFnZXIgPSByZXF1aXJlICcuL2hpZ2hsaWdodC1zZWFyY2gtbWFuYWdlcidcbk11dGF0aW9uTWFuYWdlciA9IHJlcXVpcmUgJy4vbXV0YXRpb24tbWFuYWdlcidcblBlcnNpc3RlbnRTZWxlY3Rpb25NYW5hZ2VyID0gcmVxdWlyZSAnLi9wZXJzaXN0ZW50LXNlbGVjdGlvbi1tYW5hZ2VyJ1xuRmxhc2hNYW5hZ2VyID0gcmVxdWlyZSAnLi9mbGFzaC1tYW5hZ2VyJ1xuXG5wYWNrYWdlU2NvcGUgPSAndmltLW1vZGUtcGx1cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVmltU3RhdGVcbiAgQHZpbVN0YXRlc0J5RWRpdG9yOiBuZXcgTWFwXG5cbiAgQGdldEJ5RWRpdG9yOiAoZWRpdG9yKSAtPlxuICAgIEB2aW1TdGF0ZXNCeUVkaXRvci5nZXQoZWRpdG9yKVxuXG4gIEBmb3JFYWNoOiAoZm4pIC0+XG4gICAgQHZpbVN0YXRlc0J5RWRpdG9yLmZvckVhY2goZm4pXG5cbiAgQGNsZWFyOiAtPlxuICAgIEB2aW1TdGF0ZXNCeUVkaXRvci5jbGVhcigpXG5cbiAgRGVsZWdhdG8uaW5jbHVkZUludG8odGhpcylcblxuICBAZGVsZWdhdGVzUHJvcGVydHkoJ21vZGUnLCAnc3VibW9kZScsIHRvUHJvcGVydHk6ICdtb2RlTWFuYWdlcicpXG4gIEBkZWxlZ2F0ZXNNZXRob2RzKCdpc01vZGUnLCAnYWN0aXZhdGUnLCB0b1Byb3BlcnR5OiAnbW9kZU1hbmFnZXInKVxuICBAZGVsZWdhdGVzTWV0aG9kcygnZmxhc2gnLCAnZmxhc2hTY3JlZW5SYW5nZScsIHRvUHJvcGVydHk6ICdmbGFzaE1hbmFnZXInKVxuICBAZGVsZWdhdGVzTWV0aG9kcygnc3Vic2NyaWJlJywgJ2dldENvdW50JywgJ3NldENvdW50JywgJ2hhc0NvdW50JywgJ2FkZFRvQ2xhc3NMaXN0JywgdG9Qcm9wZXJ0eTogJ29wZXJhdGlvblN0YWNrJylcblxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEBzdGF0dXNCYXJNYW5hZ2VyLCBAZ2xvYmFsU3RhdGUpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQgPSBAZWRpdG9yLmVsZW1lbnRcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBtb2RlTWFuYWdlciA9IG5ldyBNb2RlTWFuYWdlcih0aGlzKVxuICAgIEBtYXJrID0gbmV3IE1hcmtNYW5hZ2VyKHRoaXMpXG4gICAgQHJlZ2lzdGVyID0gbmV3IFJlZ2lzdGVyTWFuYWdlcih0aGlzKVxuICAgIEBob3ZlciA9IG5ldyBIb3Zlck1hbmFnZXIodGhpcylcbiAgICBAaG92ZXJTZWFyY2hDb3VudGVyID0gbmV3IEhvdmVyTWFuYWdlcih0aGlzKVxuICAgIEBzZWFyY2hIaXN0b3J5ID0gbmV3IFNlYXJjaEhpc3RvcnlNYW5hZ2VyKHRoaXMpXG4gICAgQGhpZ2hsaWdodFNlYXJjaCA9IG5ldyBIaWdobGlnaHRTZWFyY2hNYW5hZ2VyKHRoaXMpXG4gICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24gPSBuZXcgUGVyc2lzdGVudFNlbGVjdGlvbk1hbmFnZXIodGhpcylcbiAgICBAb2NjdXJyZW5jZU1hbmFnZXIgPSBuZXcgT2NjdXJyZW5jZU1hbmFnZXIodGhpcylcbiAgICBAbXV0YXRpb25NYW5hZ2VyID0gbmV3IE11dGF0aW9uTWFuYWdlcih0aGlzKVxuICAgIEBmbGFzaE1hbmFnZXIgPSBuZXcgRmxhc2hNYW5hZ2VyKHRoaXMpXG5cbiAgICBAc2VhcmNoSW5wdXQgPSBuZXcgU2VhcmNoSW5wdXRFbGVtZW50KCkuaW5pdGlhbGl6ZSh0aGlzKVxuXG4gICAgQG9wZXJhdGlvblN0YWNrID0gbmV3IE9wZXJhdGlvblN0YWNrKHRoaXMpXG4gICAgQGN1cnNvclN0eWxlTWFuYWdlciA9IG5ldyBDdXJzb3JTdHlsZU1hbmFnZXIodGhpcylcbiAgICBAYmxvY2t3aXNlU2VsZWN0aW9ucyA9IFtdXG4gICAgQHByZXZpb3VzU2VsZWN0aW9uID0ge31cbiAgICBAb2JzZXJ2ZVNlbGVjdGlvbnMoKVxuXG4gICAgcmVmcmVzaEhpZ2hsaWdodFNlYXJjaCA9ID0+XG4gICAgICBAaGlnaGxpZ2h0U2VhcmNoLnJlZnJlc2goKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkU3RvcENoYW5naW5nKHJlZnJlc2hIaWdobGlnaHRTZWFyY2gpXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKHBhY2thZ2VTY29wZSlcbiAgICBpZiBzZXR0aW5ncy5nZXQoJ3N0YXJ0SW5JbnNlcnRNb2RlJykgb3IgbWF0Y2hTY29wZXMoQGVkaXRvckVsZW1lbnQsIHNldHRpbmdzLmdldCgnc3RhcnRJbkluc2VydE1vZGVTY29wZXMnKSlcbiAgICAgIEBhY3RpdmF0ZSgnaW5zZXJ0JylcbiAgICBlbHNlXG4gICAgICBAYWN0aXZhdGUoJ25vcm1hbCcpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcbiAgICBAY29uc3RydWN0b3IudmltU3RhdGVzQnlFZGl0b3Iuc2V0KEBlZGl0b3IsIHRoaXMpXG5cbiAgIyBCbG9ja3dpc2VTZWxlY3Rpb25zXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zOiAtPlxuICAgIEBibG9ja3dpc2VTZWxlY3Rpb25zXG5cbiAgZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbjogLT5cbiAgICBfLmxhc3QoQGJsb2Nrd2lzZVNlbGVjdGlvbnMpXG5cbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIEBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkuc29ydCAoYSwgYikgLT5cbiAgICAgIGEuZ2V0U3RhcnRTZWxlY3Rpb24oKS5jb21wYXJlKGIuZ2V0U3RhcnRTZWxlY3Rpb24oKSlcblxuICBjbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnM6IC0+XG4gICAgQGJsb2Nrd2lzZVNlbGVjdGlvbnMgPSBbXVxuXG4gIHNlbGVjdEJsb2Nrd2lzZUZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAYmxvY2t3aXNlU2VsZWN0aW9ucy5wdXNoKG5ldyBCbG9ja3dpc2VTZWxlY3Rpb24oc2VsZWN0aW9uKSlcblxuICBzZWxlY3RCbG9ja3dpc2U6IC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHNlbGVjdEJsb2Nrd2lzZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgQGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsSWZSZXZlcnNlZCgpXG5cbiAgIyBPdGhlclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2VsZWN0TGluZXdpc2U6IC0+XG4gICAgc3dyYXAuYXBwbHlXaXNlKEBlZGl0b3IsICdsaW5ld2lzZScpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRvZ2dsZUNsYXNzTGlzdDogKGNsYXNzTmFtZSwgYm9vbD11bmRlZmluZWQpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShjbGFzc05hbWUsIGJvb2wpXG5cbiAgIyBGSVhNRTogSSB3YW50IHRvIHJlbW92ZSB0aGlzIGRlbmdlcmlvdXMgYXBwcm9hY2gsIGJ1dCBJIGNvdWxkbid0IGZpbmQgdGhlIGJldHRlciB3YXkuXG4gIHN3YXBDbGFzc05hbWU6IChjbGFzc05hbWVzLi4uKSAtPlxuICAgIG9sZE1vZGUgPSBAbW9kZVxuXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShvbGRNb2RlICsgXCItbW9kZVwiKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3ZpbS1tb2RlLXBsdXMnKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lcy4uLilcblxuICAgIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZXMuLi4pXG4gICAgICBpZiBAbW9kZSBpcyBvbGRNb2RlXG4gICAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQob2xkTW9kZSArIFwiLW1vZGVcIilcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3ZpbS1tb2RlLXBsdXMnKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtZm9jdXNlZCcpXG5cbiAgIyBBbGwgc3Vic2NyaXB0aW9ucyBoZXJlIGlzIGNlbGFyZWQgb24gZWFjaCBvcGVyYXRpb24gZmluaXNoZWQuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvbkRpZENoYW5nZVNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENoYW5nZShmbilcbiAgb25EaWRDb25maXJtU2VhcmNoOiAoZm4pIC0+IEBzdWJzY3JpYmUgQHNlYXJjaElucHV0Lm9uRGlkQ29uZmlybShmbilcbiAgb25EaWRDYW5jZWxTZWFyY2g6IChmbikgLT4gQHN1YnNjcmliZSBAc2VhcmNoSW5wdXQub25EaWRDYW5jZWwoZm4pXG4gIG9uRGlkQ29tbWFuZFNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENvbW1hbmQoZm4pXG5cbiAgIyBTZWxlY3QgYW5kIHRleHQgbXV0YXRpb24oQ2hhbmdlKVxuICBvbkRpZFNldFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtc2V0LXRhcmdldCcsIGZuKVxuICBlbWl0RGlkU2V0VGFyZ2V0OiAob3BlcmF0b3IpIC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZXQtdGFyZ2V0Jywgb3BlcmF0b3IpXG5cbiAgb25XaWxsU2VsZWN0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ3dpbGwtc2VsZWN0LXRhcmdldCcsIGZuKVxuICBlbWl0V2lsbFNlbGVjdFRhcmdldDogLT4gQGVtaXR0ZXIuZW1pdCgnd2lsbC1zZWxlY3QtdGFyZ2V0JylcblxuICBvbkRpZFNlbGVjdFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtc2VsZWN0LXRhcmdldCcsIGZuKVxuICBlbWl0RGlkU2VsZWN0VGFyZ2V0OiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2VsZWN0LXRhcmdldCcpXG5cbiAgb25EaWRGYWlsU2VsZWN0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1mYWlsLXNlbGVjdC10YXJnZXQnLCBmbilcbiAgZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQ6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1mYWlsLXNlbGVjdC10YXJnZXQnKVxuXG4gIG9uV2lsbEZpbmlzaE11dGF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ29uLXdpbGwtZmluaXNoLW11dGF0aW9uJywgZm4pXG4gIGVtaXRXaWxsRmluaXNoTXV0YXRpb246IC0+IEBlbWl0dGVyLmVtaXQoJ29uLXdpbGwtZmluaXNoLW11dGF0aW9uJylcblxuICBvbkRpZEZpbmlzaE11dGF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ29uLWRpZC1maW5pc2gtbXV0YXRpb24nLCBmbilcbiAgZW1pdERpZEZpbmlzaE11dGF0aW9uOiAtPiBAZW1pdHRlci5lbWl0KCdvbi1kaWQtZmluaXNoLW11dGF0aW9uJylcblxuICBvbkRpZFJlc3RvcmVDdXJzb3JQb3NpdGlvbnM6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXJlc3RvcmUtY3Vyc29yLXBvc2l0aW9ucycsIGZuKVxuICBlbWl0RGlkUmVzdG9yZUN1cnNvclBvc2l0aW9uczogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXJlc3RvcmUtY3Vyc29yLXBvc2l0aW9ucycpXG5cbiAgb25EaWRTZXRPcGVyYXRvck1vZGlmaWVyOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1zZXQtb3BlcmF0b3ItbW9kaWZpZXInLCBmbilcbiAgZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXI6IChvcHRpb25zKSAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2V0LW9wZXJhdG9yLW1vZGlmaWVyJywgb3B0aW9ucylcblxuICBvbkRpZEZpbmlzaE9wZXJhdGlvbjogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtZmluaXNoLW9wZXJhdGlvbicsIGZuKVxuICBlbWl0RGlkRmluaXNoT3BlcmF0aW9uOiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtZmluaXNoLW9wZXJhdGlvbicpXG5cbiAgb25EaWRSZXNldE9wZXJhdGlvblN0YWNrOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1yZXNldC1vcGVyYXRpb24tc3RhY2snLCBmbilcbiAgZW1pdERpZFJlc2V0T3BlcmF0aW9uU3RhY2s6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1yZXNldC1vcGVyYXRpb24tc3RhY2snKVxuXG4gICMgU2VsZWN0IGxpc3Qgdmlld1xuICBvbkRpZENvbmZpcm1TZWxlY3RMaXN0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1jb25maXJtLXNlbGVjdC1saXN0JywgZm4pXG4gIG9uRGlkQ2FuY2VsU2VsZWN0TGlzdDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtY2FuY2VsLXNlbGVjdC1saXN0JywgZm4pXG5cbiAgIyBQcm94eWluZyBtb2RlTWFuZ2VyJ3MgZXZlbnQgaG9vayB3aXRoIHNob3J0LWxpZmUgc3Vic2NyaXB0aW9uLlxuICBvbldpbGxBY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25XaWxsQWN0aXZhdGVNb2RlKGZuKVxuICBvbkRpZEFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbkRpZEFjdGl2YXRlTW9kZShmbilcbiAgb25XaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25XaWxsRGVhY3RpdmF0ZU1vZGUoZm4pXG4gIHByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIucHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZShmbilcbiAgb25EaWREZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbkRpZERlYWN0aXZhdGVNb2RlKGZuKVxuXG4gICMgRXZlbnRzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvbkRpZEZhaWxUb1B1c2hUb09wZXJhdGlvblN0YWNrOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtZmFpbC10by1wdXNoLXRvLW9wZXJhdGlvbi1zdGFjaycsIGZuKVxuICBlbWl0RGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2s6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1mYWlsLXRvLXB1c2gtdG8tb3BlcmF0aW9uLXN0YWNrJylcblxuICBvbkRpZERlc3Ryb3k6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgZm4pXG5cbiAgIyAqIGBmbmAge0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbiBtYXJrIHdhcyBzZXQuXG4gICMgICAqIGBuYW1lYCBOYW1lIG9mIG1hcmsgc3VjaCBhcyAnYScuXG4gICMgICAqIGBidWZmZXJQb3NpdGlvbmA6IGJ1ZmZlclBvc2l0aW9uIHdoZXJlIG1hcmsgd2FzIHNldC5cbiAgIyAgICogYGVkaXRvcmA6IGVkaXRvciB3aGVyZSBtYXJrIHdhcyBzZXQuXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgI1xuICAjICBVc2FnZTpcbiAgIyAgIG9uRGlkU2V0TWFyayAoe25hbWUsIGJ1ZmZlclBvc2l0aW9ufSkgLT4gZG8gc29tZXRoaW5nLi5cbiAgb25EaWRTZXRNYXJrOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtc2V0LW1hcmsnLCBmbilcblxuICBvbkRpZFNldElucHV0Q2hhcjogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLXNldC1pbnB1dC1jaGFyJywgZm4pXG4gIGVtaXREaWRTZXRJbnB1dENoYXI6IChjaGFyKSAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2V0LWlucHV0LWNoYXInLCBjaGFyKVxuXG4gIGlzQWxpdmU6IC0+XG4gICAgQGNvbnN0cnVjdG9yLnZpbVN0YXRlc0J5RWRpdG9yLmhhcyhAZWRpdG9yKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaXNBbGl2ZSgpXG4gICAgQGNvbnN0cnVjdG9yLnZpbVN0YXRlc0J5RWRpdG9yLmRlbGV0ZShAZWRpdG9yKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgICBpZiBAZWRpdG9yLmlzQWxpdmUoKVxuICAgICAgQHJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgICBAcmVzZXQoKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50Py5zZXRJbnB1dEVuYWJsZWQodHJ1ZSlcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUocGFja2FnZVNjb3BlLCAnbm9ybWFsLW1vZGUnKVxuXG4gICAgQGhvdmVyPy5kZXN0cm95PygpXG4gICAgQGhvdmVyU2VhcmNoQ291bnRlcj8uZGVzdHJveT8oKVxuICAgIEBzZWFyY2hIaXN0b3J5Py5kZXN0cm95PygpXG4gICAgQGN1cnNvclN0eWxlTWFuYWdlcj8uZGVzdHJveT8oKVxuICAgIEBzZWFyY2g/LmRlc3Ryb3k/KClcbiAgICBAcmVnaXN0ZXI/LmRlc3Ryb3k/XG4gICAge1xuICAgICAgQGhvdmVyLCBAaG92ZXJTZWFyY2hDb3VudGVyLCBAb3BlcmF0aW9uU3RhY2ssXG4gICAgICBAc2VhcmNoSGlzdG9yeSwgQGN1cnNvclN0eWxlTWFuYWdlclxuICAgICAgQHNlYXJjaCwgQG1vZGVNYW5hZ2VyLCBAcmVnaXN0ZXJcbiAgICAgIEBlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAc3Vic2NyaXB0aW9ucyxcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlclxuICAgICAgQHByZXZpb3VzU2VsZWN0aW9uXG4gICAgICBAcGVyc2lzdGVudFNlbGVjdGlvblxuICAgIH0gPSB7fVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1kZXN0cm95J1xuXG4gIGlzSW50ZXJlc3RpbmdFdmVudDogKHt0YXJnZXQsIHR5cGV9KSAtPlxuICAgIGlmIEBtb2RlIGlzICdpbnNlcnQnXG4gICAgICBmYWxzZVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3I/IGFuZFxuICAgICAgICB0YXJnZXQ/LmNsb3Nlc3Q/KCdhdG9tLXRleHQtZWRpdG9yJykgaXMgQGVkaXRvckVsZW1lbnQgYW5kXG4gICAgICAgIG5vdCBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJykgYW5kXG4gICAgICAgIG5vdCB0eXBlLnN0YXJ0c1dpdGgoJ3ZpbS1tb2RlLXBsdXM6JylcblxuICBjaGVja1NlbGVjdGlvbjogKGV2ZW50KSAtPlxuICAgIHJldHVybiBpZiBAb3BlcmF0aW9uU3RhY2suaXNQcm9jZXNzaW5nKClcbiAgICByZXR1cm4gdW5sZXNzIEBpc0ludGVyZXN0aW5nRXZlbnQoZXZlbnQpXG5cbiAgICBub25FbXB0eVNlbGVjaXRvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5maWx0ZXIgKHNlbGVjdGlvbikgLT4gbm90IHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICBpZiBub25FbXB0eVNlbGVjaXRvbnMubGVuZ3RoXG4gICAgICBzdWJtb2RlID0gc3dyYXAuZGV0ZWN0VmlzdWFsTW9kZVN1Ym1vZGUoQGVkaXRvcilcbiAgICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsIHN1Ym1vZGUpXG4gICAgICAgIGZvciBzZWxlY3Rpb24gaW4gbm9uRW1wdHlTZWxlY2l0b25zIHdoZW4gbm90IHN3cmFwKHNlbGVjdGlvbikuaGFzUHJvcGVydGllcygpXG4gICAgICAgICAgc3dyYXAoc2VsZWN0aW9uKS5zYXZlUHJvcGVydGllcygpXG4gICAgICAgIEB1cGRhdGVDdXJzb3JzVmlzaWJpbGl0eSgpXG4gICAgICBlbHNlXG4gICAgICAgIEBhY3RpdmF0ZSgndmlzdWFsJywgc3VibW9kZSlcbiAgICBlbHNlXG4gICAgICBAYWN0aXZhdGUoJ25vcm1hbCcpIGlmIEBpc01vZGUoJ3Zpc3VhbCcpXG5cbiAgc2F2ZVByb3BlcnRpZXM6IChldmVudCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpc0ludGVyZXN0aW5nRXZlbnQoZXZlbnQpXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgc3dyYXAoc2VsZWN0aW9uKS5zYXZlUHJvcGVydGllcygpXG5cbiAgb2JzZXJ2ZVNlbGVjdGlvbnM6IC0+XG4gICAgY2hlY2tTZWxlY3Rpb24gPSBAY2hlY2tTZWxlY3Rpb24uYmluZCh0aGlzKVxuICAgIEBlZGl0b3JFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBjaGVja1NlbGVjdGlvbilcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBjaGVja1NlbGVjdGlvbilcblxuICAgICMgW0ZJWE1FXVxuICAgICMgSG92ZXIgcG9zaXRpb24gZ2V0IHdpcmVkIHdoZW4gZm9jdXMtY2hhbmdlIGJldHdlZW4gbW9yZSB0aGFuIHR3byBwYW5lLlxuICAgICMgY29tbWVudGluZyBvdXQgaXMgZmFyIGJldHRlciB0aGFuIGludHJvZHVjaW5nIEJ1Z2d5IGJlaGF2aW9yLlxuICAgICMgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMub25XaWxsRGlzcGF0Y2goc2F2ZVByb3BlcnRpZXMpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMub25EaWREaXNwYXRjaChjaGVja1NlbGVjdGlvbilcblxuICAjIFdoYXQncyB0aGlzP1xuICAjIGVkaXRvci5jbGVhclNlbGVjdGlvbnMoKSBkb2Vzbid0IHJlc3BlY3QgbGFzdEN1cnNvciBwb3NpdG9pbi5cbiAgIyBUaGlzIG1ldGhvZCB3b3JrcyBpbiBzYW1lIHdheSBhcyBlZGl0b3IuY2xlYXJTZWxlY3Rpb25zKCkgYnV0IHJlc3BlY3QgbGFzdCBjdXJzb3IgcG9zaXRpb24uXG4gIGNsZWFyU2VsZWN0aW9uczogLT5cbiAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcblxuICByZXNldE5vcm1hbE1vZGU6ICh7dXNlckludm9jYXRpb259PXt9KSAtPlxuICAgIGlmIHVzZXJJbnZvY2F0aW9uID8gZmFsc2VcbiAgICAgIGlmIEBlZGl0b3IuaGFzTXVsdGlwbGVDdXJzb3JzKClcbiAgICAgICAgQGNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICAgIGVsc2UgaWYgQGhhc1BlcnNpc3RlbnRTZWxlY3Rpb25zKCkgYW5kIHNldHRpbmdzLmdldCgnY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uT25SZXNldE5vcm1hbE1vZGUnKVxuICAgICAgICBAY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9ucygpXG4gICAgICBlbHNlIGlmIEBvY2N1cnJlbmNlTWFuYWdlci5oYXNQYXR0ZXJucygpXG4gICAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKClcblxuICAgICAgaWYgc2V0dGluZ3MuZ2V0KCdjbGVhckhpZ2hsaWdodFNlYXJjaE9uUmVzZXROb3JtYWxNb2RlJylcbiAgICAgICAgQGdsb2JhbFN0YXRlLnNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIG51bGwpXG4gICAgZWxzZVxuICAgICAgQGNsZWFyU2VsZWN0aW9ucygpXG4gICAgQGFjdGl2YXRlKCdub3JtYWwnKVxuXG4gIGluaXQ6IC0+XG4gICAgQHNhdmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uKClcblxuICByZXNldDogLT5cbiAgICBAcmVnaXN0ZXIucmVzZXQoKVxuICAgIEBzZWFyY2hIaXN0b3J5LnJlc2V0KClcbiAgICBAaG92ZXIucmVzZXQoKVxuICAgIEBvcGVyYXRpb25TdGFjay5yZXNldCgpXG4gICAgQG11dGF0aW9uTWFuYWdlci5yZXNldCgpXG5cbiAgaXNWaXNpYmxlOiAtPlxuICAgIEBlZGl0b3IgaW4gZ2V0VmlzaWJsZUVkaXRvcnMoKVxuXG4gIHVwZGF0ZUN1cnNvcnNWaXNpYmlsaXR5OiAtPlxuICAgIEBjdXJzb3JTdHlsZU1hbmFnZXIucmVmcmVzaCgpXG5cbiAgdXBkYXRlUHJldmlvdXNTZWxlY3Rpb246IC0+ICMgRklYTUU6IG5hbWluZywgdXBkYXRlTGFzdFNlbGVjdGVkSW5mbyA/XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICBwcm9wZXJ0aWVzID0gQGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKT8uZ2V0Q2hhcmFjdGVyd2lzZVByb3BlcnRpZXMoKVxuICAgIGVsc2VcbiAgICAgIHByb3BlcnRpZXMgPSBzd3JhcChAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSkuY2FwdHVyZVByb3BlcnRpZXMoKVxuXG4gICAgcmV0dXJuIHVubGVzcyBwcm9wZXJ0aWVzP1xuXG4gICAge2hlYWQsIHRhaWx9ID0gcHJvcGVydGllc1xuICAgIGlmIGhlYWQuaXNHcmVhdGVyVGhhbih0YWlsKVxuICAgICAgQG1hcmsuc2V0UmFuZ2UoJzwnLCAnPicsIFt0YWlsLCBoZWFkXSlcbiAgICBlbHNlXG4gICAgICBAbWFyay5zZXRSYW5nZSgnPCcsICc+JywgW2hlYWQsIHRhaWxdKVxuICAgIEBwcmV2aW91c1NlbGVjdGlvbiA9IHtwcm9wZXJ0aWVzLCBAc3VibW9kZX1cblxuICAjIFBlcnNpc3RlbnQgc2VsZWN0aW9uXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoYXNQZXJzaXN0ZW50U2VsZWN0aW9uczogLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5oYXNNYXJrZXJzKClcblxuICBnZXRQZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2VzOiAtPlxuICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckJ1ZmZlclJhbmdlcygpXG5cbiAgY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uczogLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5jbGVhck1hcmtlcnMoKVxuXG4gICMgQW5pbWF0aW9uIG1hbmFnZW1lbnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNjcm9sbEFuaW1hdGlvbkVmZmVjdDogbnVsbFxuICByZXF1ZXN0U2Nyb2xsQW5pbWF0aW9uOiAoZnJvbSwgdG8sIG9wdGlvbnMpIC0+XG4gICAgQHNjcm9sbEFuaW1hdGlvbkVmZmVjdCA9IGpRdWVyeShmcm9tKS5hbmltYXRlKHRvLCBvcHRpb25zKVxuXG4gIGZpbmlzaFNjcm9sbEFuaW1hdGlvbjogLT5cbiAgICBAc2Nyb2xsQW5pbWF0aW9uRWZmZWN0Py5maW5pc2goKVxuICAgIEBzY3JvbGxBbmltYXRpb25FZmZlY3QgPSBudWxsXG5cbiAgIyBPdGhlclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2F2ZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb246IC0+XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb24gPSBudWxsXG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlcj8uZGVzdHJveSgpXG5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgb3B0aW9ucyA9IHtmcm9tUHJvcGVydHk6IHRydWUsIGFsbG93RmFsbGJhY2s6IHRydWV9XG4gICAgICBwb2ludCA9IHN3cmFwKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIG9wdGlvbnMpXG4gICAgZWxzZVxuICAgICAgcG9pbnQgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbiA9IHBvaW50XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlciA9IEBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKHBvaW50LCBpbnZhbGlkYXRlOiAnbmV2ZXInKVxuXG4gIHJlc3RvcmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oQGdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKSlcblxuICBnZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uXG5cbiAgZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyOiAtPlxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXIuZ2V0U3RhcnRCdWZmZXJQb3NpdGlvbigpXG4iXX0=
