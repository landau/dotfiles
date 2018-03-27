(function() {
  var BlockwiseSelection, CompositeDisposable, CursorStyleManager, Delegato, Disposable, Emitter, FlashManager, HighlightSearchManager, HoverManager, MarkManager, ModeManager, MutationManager, OccurrenceManager, OperationStack, PersistentSelectionManager, Range, RegisterManager, SearchHistoryManager, SearchInput, VimState, _, getVisibleEditors, jQuery, matchScopes, packageScope, ref, ref1, semver, settings, swrap, translatePointAndClip,
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

  ref1 = require('./utils'), getVisibleEditors = ref1.getVisibleEditors, matchScopes = ref1.matchScopes, translatePointAndClip = ref1.translatePointAndClip;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdmltLXN0YXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaWJBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDVixTQUFVLE9BQUEsQ0FBUSxzQkFBUjs7RUFFWCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQW9ELE9BQUEsQ0FBUSxNQUFSLENBQXBELEVBQUMscUJBQUQsRUFBVSwyQkFBVixFQUFzQiw2Q0FBdEIsRUFBMkM7O0VBRTNDLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNmLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsT0FBMEQsT0FBQSxDQUFRLFNBQVIsQ0FBMUQsRUFBQywwQ0FBRCxFQUFvQiw4QkFBcEIsRUFBaUM7O0VBQ2pDLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBRVIsY0FBQSxHQUFpQixPQUFBLENBQVEsbUJBQVI7O0VBQ2pCLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxvQkFBUjs7RUFDbEIsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDBCQUFSOztFQUN2QixrQkFBQSxHQUFxQixPQUFBLENBQVEsd0JBQVI7O0VBQ3JCLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx1QkFBUjs7RUFDckIsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHNCQUFSOztFQUNwQixzQkFBQSxHQUF5QixPQUFBLENBQVEsNEJBQVI7O0VBQ3pCLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9C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QTtJQURpQzs7Ozs7QUFqWHJDIiwic291cmNlc0NvbnRlbnQiOlsic2VtdmVyID0gcmVxdWlyZSAnc2VtdmVyJ1xuRGVsZWdhdG8gPSByZXF1aXJlICdkZWxlZ2F0bydcbntqUXVlcnl9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57RW1pdHRlciwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuSG92ZXJNYW5hZ2VyID0gcmVxdWlyZSAnLi9ob3Zlci1tYW5hZ2VyJ1xuU2VhcmNoSW5wdXQgPSByZXF1aXJlICcuL3NlYXJjaC1pbnB1dCdcbntnZXRWaXNpYmxlRWRpdG9ycywgbWF0Y2hTY29wZXMsIHRyYW5zbGF0ZVBvaW50QW5kQ2xpcH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXG5PcGVyYXRpb25TdGFjayA9IHJlcXVpcmUgJy4vb3BlcmF0aW9uLXN0YWNrJ1xuTWFya01hbmFnZXIgPSByZXF1aXJlICcuL21hcmstbWFuYWdlcidcbk1vZGVNYW5hZ2VyID0gcmVxdWlyZSAnLi9tb2RlLW1hbmFnZXInXG5SZWdpc3Rlck1hbmFnZXIgPSByZXF1aXJlICcuL3JlZ2lzdGVyLW1hbmFnZXInXG5TZWFyY2hIaXN0b3J5TWFuYWdlciA9IHJlcXVpcmUgJy4vc2VhcmNoLWhpc3RvcnktbWFuYWdlcidcbkN1cnNvclN0eWxlTWFuYWdlciA9IHJlcXVpcmUgJy4vY3Vyc29yLXN0eWxlLW1hbmFnZXInXG5CbG9ja3dpc2VTZWxlY3Rpb24gPSByZXF1aXJlICcuL2Jsb2Nrd2lzZS1zZWxlY3Rpb24nXG5PY2N1cnJlbmNlTWFuYWdlciA9IHJlcXVpcmUgJy4vb2NjdXJyZW5jZS1tYW5hZ2VyJ1xuSGlnaGxpZ2h0U2VhcmNoTWFuYWdlciA9IHJlcXVpcmUgJy4vaGlnaGxpZ2h0LXNlYXJjaC1tYW5hZ2VyJ1xuTXV0YXRpb25NYW5hZ2VyID0gcmVxdWlyZSAnLi9tdXRhdGlvbi1tYW5hZ2VyJ1xuUGVyc2lzdGVudFNlbGVjdGlvbk1hbmFnZXIgPSByZXF1aXJlICcuL3BlcnNpc3RlbnQtc2VsZWN0aW9uLW1hbmFnZXInXG5GbGFzaE1hbmFnZXIgPSByZXF1aXJlICcuL2ZsYXNoLW1hbmFnZXInXG5cbnBhY2thZ2VTY29wZSA9ICd2aW0tbW9kZS1wbHVzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBWaW1TdGF0ZVxuICBAdmltU3RhdGVzQnlFZGl0b3I6IG5ldyBNYXBcblxuICBAZ2V0QnlFZGl0b3I6IChlZGl0b3IpIC0+XG4gICAgQHZpbVN0YXRlc0J5RWRpdG9yLmdldChlZGl0b3IpXG5cbiAgQGZvckVhY2g6IChmbikgLT5cbiAgICBAdmltU3RhdGVzQnlFZGl0b3IuZm9yRWFjaChmbilcblxuICBAY2xlYXI6IC0+XG4gICAgQHZpbVN0YXRlc0J5RWRpdG9yLmNsZWFyKClcblxuICBEZWxlZ2F0by5pbmNsdWRlSW50byh0aGlzKVxuXG4gIEBkZWxlZ2F0ZXNQcm9wZXJ0eSgnbW9kZScsICdzdWJtb2RlJywgdG9Qcm9wZXJ0eTogJ21vZGVNYW5hZ2VyJylcbiAgQGRlbGVnYXRlc01ldGhvZHMoJ2lzTW9kZScsICdhY3RpdmF0ZScsIHRvUHJvcGVydHk6ICdtb2RlTWFuYWdlcicpXG4gIEBkZWxlZ2F0ZXNNZXRob2RzKCdmbGFzaCcsICdmbGFzaFNjcmVlblJhbmdlJywgdG9Qcm9wZXJ0eTogJ2ZsYXNoTWFuYWdlcicpXG4gIEBkZWxlZ2F0ZXNNZXRob2RzKCdzdWJzY3JpYmUnLCAnZ2V0Q291bnQnLCAnc2V0Q291bnQnLCAnaGFzQ291bnQnLCAnYWRkVG9DbGFzc0xpc3QnLCB0b1Byb3BlcnR5OiAnb3BlcmF0aW9uU3RhY2snKVxuXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgQHN0YXR1c0Jhck1hbmFnZXIsIEBnbG9iYWxTdGF0ZSkgLT5cbiAgICBAZWRpdG9yRWxlbWVudCA9IEBlZGl0b3IuZWxlbWVudFxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQG1vZGVNYW5hZ2VyID0gbmV3IE1vZGVNYW5hZ2VyKHRoaXMpXG4gICAgQG1hcmsgPSBuZXcgTWFya01hbmFnZXIodGhpcylcbiAgICBAcmVnaXN0ZXIgPSBuZXcgUmVnaXN0ZXJNYW5hZ2VyKHRoaXMpXG4gICAgQGhvdmVyID0gbmV3IEhvdmVyTWFuYWdlcih0aGlzKVxuICAgIEBob3ZlclNlYXJjaENvdW50ZXIgPSBuZXcgSG92ZXJNYW5hZ2VyKHRoaXMpXG4gICAgQHNlYXJjaEhpc3RvcnkgPSBuZXcgU2VhcmNoSGlzdG9yeU1hbmFnZXIodGhpcylcbiAgICBAaGlnaGxpZ2h0U2VhcmNoID0gbmV3IEhpZ2hsaWdodFNlYXJjaE1hbmFnZXIodGhpcylcbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbiA9IG5ldyBQZXJzaXN0ZW50U2VsZWN0aW9uTWFuYWdlcih0aGlzKVxuICAgIEBvY2N1cnJlbmNlTWFuYWdlciA9IG5ldyBPY2N1cnJlbmNlTWFuYWdlcih0aGlzKVxuICAgIEBtdXRhdGlvbk1hbmFnZXIgPSBuZXcgTXV0YXRpb25NYW5hZ2VyKHRoaXMpXG4gICAgQGZsYXNoTWFuYWdlciA9IG5ldyBGbGFzaE1hbmFnZXIodGhpcylcbiAgICBAc2VhcmNoSW5wdXQgPSBuZXcgU2VhcmNoSW5wdXQodGhpcylcbiAgICBAb3BlcmF0aW9uU3RhY2sgPSBuZXcgT3BlcmF0aW9uU3RhY2sodGhpcylcbiAgICBAY3Vyc29yU3R5bGVNYW5hZ2VyID0gbmV3IEN1cnNvclN0eWxlTWFuYWdlcih0aGlzKVxuICAgIEBibG9ja3dpc2VTZWxlY3Rpb25zID0gW11cbiAgICBAcHJldmlvdXNTZWxlY3Rpb24gPSB7fVxuICAgIEBvYnNlcnZlU2VsZWN0aW9ucygpXG5cbiAgICByZWZyZXNoSGlnaGxpZ2h0U2VhcmNoID0gPT5cbiAgICAgIEBoaWdobGlnaHRTZWFyY2gucmVmcmVzaCgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcocmVmcmVzaEhpZ2hsaWdodFNlYXJjaClcblxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQocGFja2FnZVNjb3BlKVxuICAgIGlmIEBnZXRDb25maWcoJ3N0YXJ0SW5JbnNlcnRNb2RlJykgb3IgbWF0Y2hTY29wZXMoQGVkaXRvckVsZW1lbnQsIEBnZXRDb25maWcoJ3N0YXJ0SW5JbnNlcnRNb2RlU2NvcGVzJykpXG4gICAgICBAYWN0aXZhdGUoJ2luc2VydCcpXG4gICAgZWxzZVxuICAgICAgQGFjdGl2YXRlKCdub3JtYWwnKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG4gICAgQGNvbnN0cnVjdG9yLnZpbVN0YXRlc0J5RWRpdG9yLnNldChAZWRpdG9yLCB0aGlzKVxuXG4gIGdldENvbmZpZzogKHBhcmFtKSAtPlxuICAgIHNldHRpbmdzLmdldChwYXJhbSlcblxuICAjIEJsb2Nrd2lzZVNlbGVjdGlvbnNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGdldEJsb2Nrd2lzZVNlbGVjdGlvbnM6IC0+XG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcblxuICBnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uOiAtPlxuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRMYXN0U2VsZWN0aW9uKEBlZGl0b3IpXG5cbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oQGVkaXRvcilcblxuICBjbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnM6IC0+XG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmNsZWFyU2VsZWN0aW9ucyhAZWRpdG9yKVxuXG4gICMgT3RoZXJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRvZ2dsZUNsYXNzTGlzdDogKGNsYXNzTmFtZSwgYm9vbD11bmRlZmluZWQpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShjbGFzc05hbWUsIGJvb2wpXG5cbiAgIyBGSVhNRTogSSB3YW50IHRvIHJlbW92ZSB0aGlzIGRlbmdlcmlvdXMgYXBwcm9hY2gsIGJ1dCBJIGNvdWxkbid0IGZpbmQgdGhlIGJldHRlciB3YXkuXG4gIHN3YXBDbGFzc05hbWU6IChjbGFzc05hbWVzLi4uKSAtPlxuICAgIG9sZE1vZGUgPSBAbW9kZVxuXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShvbGRNb2RlICsgXCItbW9kZVwiKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3ZpbS1tb2RlLXBsdXMnKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lcy4uLilcblxuICAgIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZXMuLi4pXG4gICAgICBpZiBAbW9kZSBpcyBvbGRNb2RlXG4gICAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQob2xkTW9kZSArIFwiLW1vZGVcIilcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3ZpbS1tb2RlLXBsdXMnKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtZm9jdXNlZCcpXG5cbiAgIyBBbGwgc3Vic2NyaXB0aW9ucyBoZXJlIGlzIGNlbGFyZWQgb24gZWFjaCBvcGVyYXRpb24gZmluaXNoZWQuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvbkRpZENoYW5nZVNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENoYW5nZShmbilcbiAgb25EaWRDb25maXJtU2VhcmNoOiAoZm4pIC0+IEBzdWJzY3JpYmUgQHNlYXJjaElucHV0Lm9uRGlkQ29uZmlybShmbilcbiAgb25EaWRDYW5jZWxTZWFyY2g6IChmbikgLT4gQHN1YnNjcmliZSBAc2VhcmNoSW5wdXQub25EaWRDYW5jZWwoZm4pXG4gIG9uRGlkQ29tbWFuZFNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENvbW1hbmQoZm4pXG5cbiAgIyBTZWxlY3QgYW5kIHRleHQgbXV0YXRpb24oQ2hhbmdlKVxuICBvbkRpZFNldFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtc2V0LXRhcmdldCcsIGZuKVxuICBlbWl0RGlkU2V0VGFyZ2V0OiAob3BlcmF0b3IpIC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZXQtdGFyZ2V0Jywgb3BlcmF0b3IpXG5cbiAgb25XaWxsU2VsZWN0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ3dpbGwtc2VsZWN0LXRhcmdldCcsIGZuKVxuICBlbWl0V2lsbFNlbGVjdFRhcmdldDogLT4gQGVtaXR0ZXIuZW1pdCgnd2lsbC1zZWxlY3QtdGFyZ2V0JylcblxuICBvbkRpZFNlbGVjdFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtc2VsZWN0LXRhcmdldCcsIGZuKVxuICBlbWl0RGlkU2VsZWN0VGFyZ2V0OiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2VsZWN0LXRhcmdldCcpXG5cbiAgb25EaWRGYWlsU2VsZWN0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1mYWlsLXNlbGVjdC10YXJnZXQnLCBmbilcbiAgZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQ6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1mYWlsLXNlbGVjdC10YXJnZXQnKVxuXG4gIG9uV2lsbEZpbmlzaE11dGF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ29uLXdpbGwtZmluaXNoLW11dGF0aW9uJywgZm4pXG4gIGVtaXRXaWxsRmluaXNoTXV0YXRpb246IC0+IEBlbWl0dGVyLmVtaXQoJ29uLXdpbGwtZmluaXNoLW11dGF0aW9uJylcblxuICBvbkRpZEZpbmlzaE11dGF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ29uLWRpZC1maW5pc2gtbXV0YXRpb24nLCBmbilcbiAgZW1pdERpZEZpbmlzaE11dGF0aW9uOiAtPiBAZW1pdHRlci5lbWl0KCdvbi1kaWQtZmluaXNoLW11dGF0aW9uJylcblxuICBvbkRpZFNldE9wZXJhdG9yTW9kaWZpZXI6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXNldC1vcGVyYXRvci1tb2RpZmllcicsIGZuKVxuICBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcjogKG9wdGlvbnMpIC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZXQtb3BlcmF0b3ItbW9kaWZpZXInLCBvcHRpb25zKVxuXG4gIG9uRGlkRmluaXNoT3BlcmF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1maW5pc2gtb3BlcmF0aW9uJywgZm4pXG4gIGVtaXREaWRGaW5pc2hPcGVyYXRpb246IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1maW5pc2gtb3BlcmF0aW9uJylcblxuICBvbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2s6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXJlc2V0LW9wZXJhdGlvbi1zdGFjaycsIGZuKVxuICBlbWl0RGlkUmVzZXRPcGVyYXRpb25TdGFjazogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXJlc2V0LW9wZXJhdGlvbi1zdGFjaycpXG5cbiAgIyBTZWxlY3QgbGlzdCB2aWV3XG4gIG9uRGlkQ29uZmlybVNlbGVjdExpc3Q6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLWNvbmZpcm0tc2VsZWN0LWxpc3QnLCBmbilcbiAgb25EaWRDYW5jZWxTZWxlY3RMaXN0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1jYW5jZWwtc2VsZWN0LWxpc3QnLCBmbilcblxuICAjIFByb3h5aW5nIG1vZGVNYW5nZXIncyBldmVudCBob29rIHdpdGggc2hvcnQtbGlmZSBzdWJzY3JpcHRpb24uXG4gIG9uV2lsbEFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbldpbGxBY3RpdmF0ZU1vZGUoZm4pXG4gIG9uRGlkQWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLm9uRGlkQWN0aXZhdGVNb2RlKGZuKVxuICBvbldpbGxEZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbldpbGxEZWFjdGl2YXRlTW9kZShmbilcbiAgcHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5wcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlKGZuKVxuICBvbkRpZERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLm9uRGlkRGVhY3RpdmF0ZU1vZGUoZm4pXG5cbiAgIyBFdmVudHNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG9uRGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2s6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1mYWlsLXRvLXB1c2gtdG8tb3BlcmF0aW9uLXN0YWNrJywgZm4pXG4gIGVtaXREaWRGYWlsVG9QdXNoVG9PcGVyYXRpb25TdGFjazogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLWZhaWwtdG8tcHVzaC10by1vcGVyYXRpb24tc3RhY2snKVxuXG4gIG9uRGlkRGVzdHJveTogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWRlc3Ryb3knLCBmbilcblxuICAjICogYGZuYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIG1hcmsgd2FzIHNldC5cbiAgIyAgICogYG5hbWVgIE5hbWUgb2YgbWFyayBzdWNoIGFzICdhJy5cbiAgIyAgICogYGJ1ZmZlclBvc2l0aW9uYDogYnVmZmVyUG9zaXRpb24gd2hlcmUgbWFyayB3YXMgc2V0LlxuICAjICAgKiBgZWRpdG9yYDogZWRpdG9yIHdoZXJlIG1hcmsgd2FzIHNldC5cbiAgIyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICAjXG4gICMgIFVzYWdlOlxuICAjICAgb25EaWRTZXRNYXJrICh7bmFtZSwgYnVmZmVyUG9zaXRpb259KSAtPiBkbyBzb21ldGhpbmcuLlxuICBvbkRpZFNldE1hcms6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1zZXQtbWFyaycsIGZuKVxuXG4gIG9uRGlkU2V0SW5wdXRDaGFyOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtc2V0LWlucHV0LWNoYXInLCBmbilcbiAgZW1pdERpZFNldElucHV0Q2hhcjogKGNoYXIpIC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZXQtaW5wdXQtY2hhcicsIGNoYXIpXG5cbiAgaXNBbGl2ZTogLT5cbiAgICBAY29uc3RydWN0b3IudmltU3RhdGVzQnlFZGl0b3IuaGFzKEBlZGl0b3IpXG5cbiAgZGVzdHJveTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpc0FsaXZlKClcbiAgICBAY29uc3RydWN0b3IudmltU3RhdGVzQnlFZGl0b3IuZGVsZXRlKEBlZGl0b3IpXG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmNsZWFyU2VsZWN0aW9ucyhAZWRpdG9yKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgICBpZiBAZWRpdG9yLmlzQWxpdmUoKVxuICAgICAgQHJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgICBAcmVzZXQoKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50Py5zZXRJbnB1dEVuYWJsZWQodHJ1ZSlcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUocGFja2FnZVNjb3BlLCAnbm9ybWFsLW1vZGUnKVxuXG4gICAgQGhvdmVyPy5kZXN0cm95PygpXG4gICAgQGhvdmVyU2VhcmNoQ291bnRlcj8uZGVzdHJveT8oKVxuICAgIEBzZWFyY2hIaXN0b3J5Py5kZXN0cm95PygpXG4gICAgQGN1cnNvclN0eWxlTWFuYWdlcj8uZGVzdHJveT8oKVxuICAgIEBzZWFyY2g/LmRlc3Ryb3k/KClcbiAgICBAcmVnaXN0ZXI/LmRlc3Ryb3k/XG4gICAge1xuICAgICAgQGhvdmVyLCBAaG92ZXJTZWFyY2hDb3VudGVyLCBAb3BlcmF0aW9uU3RhY2ssXG4gICAgICBAc2VhcmNoSGlzdG9yeSwgQGN1cnNvclN0eWxlTWFuYWdlclxuICAgICAgQHNlYXJjaCwgQG1vZGVNYW5hZ2VyLCBAcmVnaXN0ZXJcbiAgICAgIEBlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAc3Vic2NyaXB0aW9ucyxcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlclxuICAgICAgQHByZXZpb3VzU2VsZWN0aW9uXG4gICAgICBAcGVyc2lzdGVudFNlbGVjdGlvblxuICAgIH0gPSB7fVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1kZXN0cm95J1xuXG4gIGlzSW50ZXJlc3RpbmdFdmVudDogKHt0YXJnZXQsIHR5cGV9KSAtPlxuICAgIGlmIEBtb2RlIGlzICdpbnNlcnQnXG4gICAgICBmYWxzZVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3I/IGFuZFxuICAgICAgICB0YXJnZXQ/LmNsb3Nlc3Q/KCdhdG9tLXRleHQtZWRpdG9yJykgaXMgQGVkaXRvckVsZW1lbnQgYW5kXG4gICAgICAgIG5vdCBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJykgYW5kXG4gICAgICAgIG5vdCB0eXBlLnN0YXJ0c1dpdGgoJ3ZpbS1tb2RlLXBsdXM6JylcblxuICBjaGVja1NlbGVjdGlvbjogKGV2ZW50KSAtPlxuICAgIHJldHVybiBpZiBAb3BlcmF0aW9uU3RhY2suaXNQcm9jZXNzaW5nKClcbiAgICByZXR1cm4gdW5sZXNzIEBpc0ludGVyZXN0aW5nRXZlbnQoZXZlbnQpXG5cbiAgICBub25FbXB0eVNlbGVjaXRvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5maWx0ZXIgKHNlbGVjdGlvbikgLT4gbm90IHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICBpZiBub25FbXB0eVNlbGVjaXRvbnMubGVuZ3RoXG4gICAgICB3aXNlID0gc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuICAgICAgaWYgQGlzTW9kZSgndmlzdWFsJywgd2lzZSlcbiAgICAgICAgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuICAgICAgICAgIGlmICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgICAgICAgICAkc2VsZWN0aW9uLmZpeFByb3BlcnR5Um93VG9Sb3dSYW5nZSgpIGlmIHdpc2UgaXMgJ2xpbmV3aXNlJ1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICBAdXBkYXRlQ3Vyc29yc1Zpc2liaWxpdHkoKVxuICAgICAgZWxzZVxuICAgICAgICBAYWN0aXZhdGUoJ3Zpc3VhbCcsIHdpc2UpXG4gICAgZWxzZVxuICAgICAgQGFjdGl2YXRlKCdub3JtYWwnKSBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuXG4gIHNhdmVQcm9wZXJ0aWVzOiAoZXZlbnQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaXNJbnRlcmVzdGluZ0V2ZW50KGV2ZW50KVxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHN3cmFwKHNlbGVjdGlvbikuc2F2ZVByb3BlcnRpZXMoKVxuXG4gIG9ic2VydmVTZWxlY3Rpb25zOiAtPlxuICAgIGNoZWNrU2VsZWN0aW9uID0gQGNoZWNrU2VsZWN0aW9uLmJpbmQodGhpcylcbiAgICBAZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgY2hlY2tTZWxlY3Rpb24pXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgY2hlY2tTZWxlY3Rpb24pXG5cbiAgICAjIFtGSVhNRV1cbiAgICAjIEhvdmVyIHBvc2l0aW9uIGdldCB3aXJlZCB3aGVuIGZvY3VzLWNoYW5nZSBiZXR3ZWVuIG1vcmUgdGhhbiB0d28gcGFuZS5cbiAgICAjIGNvbW1lbnRpbmcgb3V0IGlzIGZhciBiZXR0ZXIgdGhhbiBpbnRyb2R1Y2luZyBCdWdneSBiZWhhdmlvci5cbiAgICAjIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLm9uV2lsbERpc3BhdGNoKHNhdmVQcm9wZXJ0aWVzKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLm9uRGlkRGlzcGF0Y2goY2hlY2tTZWxlY3Rpb24pXG5cbiAgIyBXaGF0J3MgdGhpcz9cbiAgIyBlZGl0b3IuY2xlYXJTZWxlY3Rpb25zKCkgZG9lc24ndCByZXNwZWN0IGxhc3RDdXJzb3IgcG9zaXRvaW4uXG4gICMgVGhpcyBtZXRob2Qgd29ya3MgaW4gc2FtZSB3YXkgYXMgZWRpdG9yLmNsZWFyU2VsZWN0aW9ucygpIGJ1dCByZXNwZWN0IGxhc3QgY3Vyc29yIHBvc2l0aW9uLlxuICBjbGVhclNlbGVjdGlvbnM6IC0+XG4gICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgcmVzZXROb3JtYWxNb2RlOiAoe3VzZXJJbnZvY2F0aW9ufT17fSkgLT5cbiAgICBCbG9ja3dpc2VTZWxlY3Rpb24uY2xlYXJTZWxlY3Rpb25zKEBlZGl0b3IpXG5cbiAgICBpZiB1c2VySW52b2NhdGlvbiA/IGZhbHNlXG4gICAgICBzd2l0Y2hcbiAgICAgICAgd2hlbiBAZWRpdG9yLmhhc011bHRpcGxlQ3Vyc29ycygpXG4gICAgICAgICAgQGNsZWFyU2VsZWN0aW9ucygpXG4gICAgICAgIHdoZW4gQGhhc1BlcnNpc3RlbnRTZWxlY3Rpb25zKCkgYW5kIEBnZXRDb25maWcoJ2NsZWFyUGVyc2lzdGVudFNlbGVjdGlvbk9uUmVzZXROb3JtYWxNb2RlJylcbiAgICAgICAgICBAY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9ucygpXG4gICAgICAgIHdoZW4gQG9jY3VycmVuY2VNYW5hZ2VyLmhhc1BhdHRlcm5zKClcbiAgICAgICAgICBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpXG5cbiAgICAgIGlmIEBnZXRDb25maWcoJ2NsZWFySGlnaGxpZ2h0U2VhcmNoT25SZXNldE5vcm1hbE1vZGUnKVxuICAgICAgICBAZ2xvYmFsU3RhdGUuc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbnVsbClcbiAgICBlbHNlXG4gICAgICBAY2xlYXJTZWxlY3Rpb25zKClcbiAgICBAYWN0aXZhdGUoJ25vcm1hbCcpXG5cbiAgaW5pdDogLT5cbiAgICBAc2F2ZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKVxuXG4gIHJlc2V0OiAtPlxuICAgIEByZWdpc3Rlci5yZXNldCgpXG4gICAgQHNlYXJjaEhpc3RvcnkucmVzZXQoKVxuICAgIEBob3Zlci5yZXNldCgpXG4gICAgQG9wZXJhdGlvblN0YWNrLnJlc2V0KClcbiAgICBAbXV0YXRpb25NYW5hZ2VyLnJlc2V0KClcblxuICBpc1Zpc2libGU6IC0+XG4gICAgQGVkaXRvciBpbiBnZXRWaXNpYmxlRWRpdG9ycygpXG5cbiAgdXBkYXRlQ3Vyc29yc1Zpc2liaWxpdHk6IC0+XG4gICAgQGN1cnNvclN0eWxlTWFuYWdlci5yZWZyZXNoKClcblxuICAjIEZJWE1FOiBuYW1pbmcsIHVwZGF0ZUxhc3RTZWxlY3RlZEluZm8gP1xuICB1cGRhdGVQcmV2aW91c1NlbGVjdGlvbjogLT5cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgIHByb3BlcnRpZXMgPSBAZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpPy5nZXRQcm9wZXJ0aWVzKClcbiAgICBlbHNlXG4gICAgICBwcm9wZXJ0aWVzID0gc3dyYXAoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLmdldFByb3BlcnRpZXMoKVxuXG4gICAgIyBUT0RPIzcwNCB3aGVuIGN1cnNvciBpcyBhZGRlZCBpbiB2aXN1YWwtbW9kZSwgY29ycmVzcG9uZGluZyBzZWxlY3Rpb24gcHJvcCB5ZXQgbm90IGV4aXN0cy5cbiAgICByZXR1cm4gdW5sZXNzIHByb3BlcnRpZXNcblxuICAgIHtoZWFkLCB0YWlsfSA9IHByb3BlcnRpZXNcblxuICAgIGlmIGhlYWQuaXNHcmVhdGVyVGhhbk9yRXF1YWwodGFpbClcbiAgICAgIFtzdGFydCwgZW5kXSA9IFt0YWlsLCBoZWFkXVxuICAgICAgaGVhZCA9IGVuZCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBlbmQsICdmb3J3YXJkJylcbiAgICBlbHNlXG4gICAgICBbc3RhcnQsIGVuZF0gPSBbaGVhZCwgdGFpbF1cbiAgICAgIHRhaWwgPSBlbmQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgZW5kLCAnZm9yd2FyZCcpXG5cbiAgICBAbWFyay5zZXQoJzwnLCBzdGFydClcbiAgICBAbWFyay5zZXQoJz4nLCBlbmQpXG4gICAgQHByZXZpb3VzU2VsZWN0aW9uID0ge3Byb3BlcnRpZXM6IHtoZWFkLCB0YWlsfSwgQHN1Ym1vZGV9XG5cbiAgIyBQZXJzaXN0ZW50IHNlbGVjdGlvblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaGFzUGVyc2lzdGVudFNlbGVjdGlvbnM6IC0+XG4gICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24uaGFzTWFya2VycygpXG5cbiAgZ2V0UGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlczogLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJCdWZmZXJSYW5nZXMoKVxuXG4gIGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbnM6IC0+XG4gICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24uY2xlYXJNYXJrZXJzKClcblxuICAjIEFuaW1hdGlvbiBtYW5hZ2VtZW50XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzY3JvbGxBbmltYXRpb25FZmZlY3Q6IG51bGxcbiAgcmVxdWVzdFNjcm9sbEFuaW1hdGlvbjogKGZyb20sIHRvLCBvcHRpb25zKSAtPlxuICAgIEBzY3JvbGxBbmltYXRpb25FZmZlY3QgPSBqUXVlcnkoZnJvbSkuYW5pbWF0ZSh0bywgb3B0aW9ucylcblxuICBmaW5pc2hTY3JvbGxBbmltYXRpb246IC0+XG4gICAgQHNjcm9sbEFuaW1hdGlvbkVmZmVjdD8uZmluaXNoKClcbiAgICBAc2Nyb2xsQW5pbWF0aW9uRWZmZWN0ID0gbnVsbFxuXG4gICMgT3RoZXJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNhdmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uID0gbnVsbFxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXI/LmRlc3Ryb3koKVxuXG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIHNlbGVjdGlvbiA9IEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpXG4gICAgICBwb2ludCA9IHN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddKVxuICAgIGVsc2VcbiAgICAgIHBvaW50ID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb24gPSBwb2ludFxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXIgPSBAZWRpdG9yLm1hcmtCdWZmZXJQb3NpdGlvbihwb2ludCwgaW52YWxpZGF0ZTogJ25ldmVyJylcblxuICByZXN0b3JlT3JpZ2luYWxDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKEBnZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uKCkpXG5cbiAgZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvblxuXG4gIGdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlcjogLT5cbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyLmdldFN0YXJ0QnVmZmVyUG9zaXRpb24oKVxuIl19
