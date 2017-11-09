let jQuery, focusInput

const {Emitter, Disposable, CompositeDisposable, Range} = require("atom")
const settings = require("./settings")
const ModeManager = require("./mode-manager")

const LazyLoadedLibs = {}
function lazyRequire(file) {
  if (!(file in LazyLoadedLibs)) {
    if (atom.inDevMode() && settings.get("debug")) {
      console.log(`# lazy-require: ${file}`)
    }
    LazyLoadedLibs[file] = require(file)
  }
  return LazyLoadedLibs[file]
}

const __vimStatesByEditor = new Map()

module.exports = class VimState {
  // Proxy propperties and methods
  //===========================================================================
  static get(editor) { return __vimStatesByEditor.get(editor) } // prettier-ignore
  static set(editor, vimState) { return __vimStatesByEditor.set(editor, vimState) } // prettier-ignore
  static has(editor) { return __vimStatesByEditor.has(editor) } // prettier-ignore
  static delete(editor) { return __vimStatesByEditor.delete(editor) } // prettier-ignore
  static forEach(fn) { return __vimStatesByEditor.forEach(fn) } // prettier-ignore
  static clear() { return __vimStatesByEditor.clear() } // prettier-ignore

  // To modeManager
  get mode() { return this.modeManager.mode } // prettier-ignore
  get submode() { return this.modeManager.submode } // prettier-ignore
  // FIXME: REMOVE THIS; DONT directly update submode just for skip normalization
  set submode(submode) { this.modeManager.submode = submode } // prettier-ignore

  isMode(...args) { return this.modeManager.isMode(...args) } // prettier-ignore
  activate(...args) { this.modeManager.activate(...args) } // prettier-ignore
  flash(...args) { this.flashManager.flash(...args) } // prettier-ignore
  clearFlash() { this.__flashManager && this.flashManager.clearAllMarkers() } // prettier-ignore
  updateStatusBar() { this.statusBarManager.update(this.mode, this.submode) } // prettier-ignore
  setOperatorModifier(...args) { this.operationStack.setOperatorModifier(...args) } // prettier-ignore
  subscribe(...args) { return this.operationStack.subscribe(...args) } // prettier-ignore
  getCount(...args) { return this.operationStack.getCount(...args) } // prettier-ignore
  hasCount(...args) { return this.operationStack.hasCount(...args) } // prettier-ignore
  setCount(...args) { this.operationStack.setCount(...args) } // prettier-ignore
  addToClassList(...args) { return this.operationStack.addToClassList(...args) } // prettier-ignore

  // Lazy populated properties for fast package startup
  //=====================================================
  load(fileToLoad, instantiate = true) {
    const lib = lazyRequire(fileToLoad)
    return instantiate ? new lib(this) : lib
  }
  get mark() { return this.__mark || (this.__mark = this.load("./mark-manager")) } // prettier-ignore
  get register() { return this.__register || (this.__register = this.load("./register-manager")) } // prettier-ignore
  get hover() { return this.__hover || (this.__hover = this.load("./hover-manager")) } // prettier-ignore
  get hoverSearchCounter() { return this.__hoverSearchCounter || (this.__hoverSearchCounter = this.load("./hover-manager")) } // prettier-ignore
  get searchHistory() { return this.__searchHistory || (this.__searchHistory = this.load("./search-history-manager")) } // prettier-ignore
  get highlightSearch() { return this.__highlightSearch || (this.__highlightSearch = this.load("./highlight-search-manager")) } // prettier-ignore
  get highlightFind() { return this.__highlightFind || (this.__highlightFind = this.load("./highlight-find-manager")) } // prettier-ignore
  get persistentSelection() { return this.__persistentSelection || (this.__persistentSelection = this.load("./persistent-selection-manager")) } // prettier-ignore
  get occurrenceManager() { return this.__occurrenceManager || (this.__occurrenceManager = this.load("./occurrence-manager")) } // prettier-ignore
  get mutationManager() { return this.__mutationManager || (this.__mutationManager = this.load("./mutation-manager")) } // prettier-ignore
  get flashManager() { return this.__flashManager || (this.__flashManager = this.load("./flash-manager")) } // prettier-ignore
  get searchInput() { return this.__searchInput || (this.__searchInput = this.load("./search-input")) } // prettier-ignore
  get operationStack() { return this.__operationStack || (this.__operationStack = this.load("./operation-stack")) } // prettier-ignore
  get cursorStyleManager() { return this.__cursorStyleManager || (this.__cursorStyleManager = this.load("./cursor-style-manager")) } // prettier-ignore
  get sequentialPasteManager() { return this.__sequentialPasteManager || (this.__sequentialPasteManager = this.load("./sequential-paste-manager")) } // prettier-ignore
  get swrap() { return this.__swrap || (this.__swrap = this.load("./selection-wrapper", false)) } // prettier-ignore
  get utils() { return this.__utils || (this.__utils = this.load("./utils", false)) } // prettier-ignore
  get globalState() { return this.__globalState || (this.__globalState = this.load("./global-state", false)) } // prettier-ignore

  constructor(editor, statusBarManager) {
    this.editor = editor
    this.editorElement = editor.element
    this.statusBarManager = statusBarManager
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
    this.modeManager = new ModeManager(this)
    this.previousSelection = {}
    this.scrollAnimationEffect = null
    this.ignoreSelectionChange = false

    this.subscriptions.add(
      this.observeMouse(),
      this.editor.onDidAddSelection(selection => this.reconcileVisualModeWithActualSelection()),
      this.editor.onDidChangeSelectionRange(event => this.reconcileVisualModeWithActualSelection())
    )

    this.editorElement.classList.add("vim-mode-plus")

    if (this.getConfig("startInInsertMode") || this.matchScopes(this.getConfig("startInInsertModeScopes"))) {
      this.activate("insert")
    } else {
      this.activate("normal")
    }

    editor.onDidDestroy(() => this.destroy())
    this.constructor.set(editor, this)
  }

  getConfig(param) {
    return settings.get(param)
  }

  matchScopes(scopes) {
    // HACK: length guard to avoid utils prop populated unnecessarily
    return scopes.length && this.utils.matchScopes(this.editorElement, scopes)
  }

  // BlockwiseSelections
  // -------------------------
  getBlockwiseSelections() {
    return this.swrap.getBlockwiseSelections(this.editor)
  }

  getLastBlockwiseSelection() {
    return this.swrap.getLastBlockwiseSelections(this.editor)
  }

  getBlockwiseSelectionsOrderedByBufferPosition() {
    return this.swrap.getBlockwiseSelectionsOrderedByBufferPosition(this.editor)
  }

  clearBlockwiseSelections() {
    if (this.__swrap) this.swrap.clearBlockwiseSelections(this.editor)
  }

  // Other
  // -------------------------
  // FIXME: I want to remove this dengerious approach, but I couldn't find the better way.
  swapClassName(...classNames) {
    const oldMode = this.mode
    this.editorElement.classList.remove("vim-mode-plus", oldMode + "-mode")
    this.editorElement.classList.add(...classNames)

    return new Disposable(() => {
      this.editorElement.classList.remove(...classNames)
      const classToAdd = ["vim-mode-plus", "is-focused"]
      if (this.mode === oldMode) classToAdd.push(oldMode + "-mode")
      this.editorElement.classList.add(...classToAdd)
    })
  }

  // All subscriptions here is celared on each operation finished.
  // -------------------------
  onDidChangeSearch(fn) { return this.subscribe(this.searchInput.onDidChange(fn)) } // prettier-ignore
  onDidConfirmSearch(fn) { return this.subscribe(this.searchInput.onDidConfirm(fn)) } // prettier-ignore
  onDidCancelSearch(fn) { return this.subscribe(this.searchInput.onDidCancel(fn)) } // prettier-ignore
  onDidCommandSearch(fn) { return this.subscribe(this.searchInput.onDidCommand(fn)) } // prettier-ignore

  onDidSetTarget(fn) { return this.subscribe(this.emitter.on("did-set-target", fn)) } // prettier-ignore
  emitDidSetTarget(operator) { this.emitter.emit("did-set-target", operator) } // prettier-ignore

  onWillSelectTarget(fn) { return this.subscribe(this.emitter.on("will-select-target", fn)) } // prettier-ignore
  emitWillSelectTarget() { this.emitter.emit("will-select-target") } // prettier-ignore

  onDidSelectTarget(fn) { return this.subscribe(this.emitter.on("did-select-target", fn)) } // prettier-ignore
  emitDidSelectTarget() { this.emitter.emit("did-select-target") } // prettier-ignore

  onDidFailSelectTarget(fn) { return this.subscribe(this.emitter.on("did-fail-select-target", fn)) } // prettier-ignore
  emitDidFailSelectTarget() { this.emitter.emit("did-fail-select-target") } // prettier-ignore

  onWillFinishMutation(fn) { return this.subscribe(this.emitter.on("on-will-finish-mutation", fn)) } // prettier-ignore
  emitWillFinishMutation() { this.emitter.emit("on-will-finish-mutation") } // prettier-ignore

  onDidFinishMutation(fn) { return this.subscribe(this.emitter.on("on-did-finish-mutation", fn)) } // prettier-ignore
  emitDidFinishMutation() { this.emitter.emit("on-did-finish-mutation") } // prettier-ignore

  onDidFinishOperation(fn) { return this.subscribe(this.emitter.on("did-finish-operation", fn)) } // prettier-ignore
  emitDidFinishOperation() { this.emitter.emit("did-finish-operation") } // prettier-ignore

  onDidResetOperationStack(fn) { return this.subscribe(this.emitter.on("did-reset-operation-stack", fn)) } // prettier-ignore
  emitDidResetOperationStack() { this.emitter.emit("did-reset-operation-stack") } // prettier-ignore

  onDidConfirmSelectList(fn) { return this.subscribe(this.emitter.on("did-confirm-select-list", fn)) } // prettier-ignore
  onDidCancelSelectList(fn) { return this.subscribe(this.emitter.on("did-cancel-select-list", fn)) } // prettier-ignore

  onWillActivateMode(fn) { return this.subscribe(this.modeManager.onWillActivateMode(fn)) } // prettier-ignore
  onDidActivateMode(fn) { return this.subscribe(this.modeManager.onDidActivateMode(fn)) } // prettier-ignore
  onWillDeactivateMode(fn) { return this.subscribe(this.modeManager.onWillDeactivateMode(fn)) } // prettier-ignore
  preemptWillDeactivateMode(fn) { return this.subscribe(this.modeManager.preemptWillDeactivateMode(fn)) } // prettier-ignore
  onDidDeactivateMode(fn) { return this.subscribe(this.modeManager.onDidDeactivateMode(fn)) } // prettier-ignore

  // Events
  // -------------------------
  onDidFailToPushToOperationStack(fn) {
    return this.emitter.on("did-fail-to-push-to-operation-stack", fn)
  }
  emitDidFailToPushToOperationStack() {
    this.emitter.emit("did-fail-to-push-to-operation-stack")
  }

  onDidDestroy(fn) {
    return this.emitter.on("did-destroy", fn)
  }

  // * `fn` {Function} to be called when mark was set.
  //   * `name` Name of mark such as 'a'.
  //   * `bufferPosition`: bufferPosition where mark was set.
  //   * `editor`: editor where mark was set.
  // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  //
  //  Usage:
  //   onDidSetMark ({name, bufferPosition}) -> do something..
  onDidSetMark(fn) {
    return this.emitter.on("did-set-mark", fn)
  }

  onDidSetInputChar(fn) {
    return this.emitter.on("did-set-input-char", fn)
  }
  emitDidSetInputChar(char) {
    this.emitter.emit("did-set-input-char", char)
  }

  isAlive() {
    return this.constructor.has(this.editor)
  }

  destroy() {
    if (!this.isAlive()) return

    this.constructor.delete(this.editor)
    this.subscriptions.dispose()

    if (this.editor.isAlive()) {
      this.resetNormalMode()
      this.reset()
      if (this.editorElement.component) this.editorElement.component.setInputEnabled(true)
      this.editorElement.classList.remove("vim-mode-plus", "normal-mode")
    }
    this.emitter.emit("did-destroy")
  }

  haveSomeNonEmptySelection() {
    return this.editor.getSelections().some(selection => !selection.isEmpty())
  }

  // This function is mainly called in editor.onDidChangeSelectionRange enent
  // Purpose of this function is to auto-start/stop visual-mode when outer-vmp modify selection.
  // See. vim-mode-plus#878, #873 for detail
  //
  // - When outer-vmp command select some range(1) and clear(2) within single-command.
  // - Vmp start `visual-mode` at (1), then reset to `normal-mode` at (2).
  // - This is NOT elegant solution, but there is no other better way.
  // - We cannot determine selection is eventually cleared or not within `editor.onDidChangeSelectionRange` event.
  // - Delaying, debouncing to minimize useless mode-shift is bad for UX, user see slight delay for cursor updated.
  reconcileVisualModeWithActualSelection(shiftToNormalIfNoSelection = true) {
    // This guard is somewhat verbose and duplicate, but I prefer duplication than increase chance of infinite loop.
    if (this.shouldIgnoreChangeSelection()) return

    this.ignoreSelectionChange = true

    const refreshCursorStyle = () => {
      this.swrap.getSelections(this.editor).forEach($s => $s.saveProperties())
      this.cursorStyleManager.refresh()
    }

    const hasSelection = this.haveSomeNonEmptySelection()
    const isVisual = this.mode === "visual"

    if (hasSelection && isVisual) refreshCursorStyle()
    else if (hasSelection && !isVisual) this.activate("visual", this.swrap.detectWise(this.editor))
    else if (!hasSelection && isVisual) {
      if (shiftToNormalIfNoSelection) this.activate("normal")
      else refreshCursorStyle()
    }

    this.ignoreSelectionChange = false
  }

  shouldIgnoreChangeSelection() {
    return (
      this.ignoreSelectionChange || this.mode === "insert" || (this.__operationStack && this.operationStack.isRunning())
    )
  }

  observeMouse() {
    const nextMouseEventTable = {
      "mousedown-capture": "mousedown-bubble",
      "mousedown-bubble": "mouseup",
      mouseup: "mousedown-capture",
    }

    // Why explicitly assure mouse-event lifecycle? see #830 for detail.
    let waitingMouseEvent = "mousedown-capture"
    const isWaiting = mouseEvent => {
      const isValid = waitingMouseEvent === mouseEvent && !this.shouldIgnoreChangeSelection()
      if (isValid) waitingMouseEvent = nextMouseEventTable[mouseEvent]
      return isValid
    }

    // To keep original cursor screen range(tail range of selection) keep selected on `shift+click`
    // At this phase, cursor position is NOT yet updated, so we interact with original before-clicked cursor position.
    const onMouseDownCapture = () => {
      if (isWaiting("mousedown-capture")) {
        for (const selection of this.editor.getSelections()) {
          selection.initialScreenRange = this.swrap(selection).getTailScreenRange()
        }
      }
    }

    const onMouseDownBubble = () => {
      if (isWaiting("mousedown-bubble")) {
        if (this.isMode("visual", "blockwise") && !this.haveSomeNonEmptySelection()) {
          this.getBlockwiseSelections().forEach(bs => bs.skipNormalization())
        }
        for (const selection of this.editor.getSelections().filter(s => s.isEmpty())) {
          selection.initialScreenRange = this.swrap(selection).getTailScreenRange()
        }
        // For shilft+click which not involve mousemove event.
        this.reconcileVisualModeWithActualSelection(false) // Prevent auto-shift-to-normal-mode by passing `false`
      }
    }

    const onMouseUp = () => {
      if (isWaiting("mouseup")) {
        this.reconcileVisualModeWithActualSelection()
      }
    }

    this.editorElement.addEventListener("mousedown", onMouseDownCapture, true)
    this.editorElement.addEventListener("mousedown", onMouseDownBubble, false)
    this.editorElement.addEventListener("mouseup", onMouseUp)

    return new Disposable(() => {
      this.editorElement.removeEventListener("mousedown", onMouseDownCapture, true)
      this.editorElement.removeEventListener("mousedown", onMouseDownBubble, false)
      this.editorElement.removeEventListener("mouseup", onMouseUp)
    })
  }

  // What's this?
  // clear all selections and final cursor position becomes head of last selection.
  // editor.clearSelections() does not respect last selection's head, since it merge all selections before clearing.
  clearSelections() {
    this.editor.setCursorBufferPosition(this.editor.getCursorBufferPosition())
  }

  resetNormalMode({userInvocation = false} = {}) {
    this.clearBlockwiseSelections()

    if (userInvocation) {
      this.operationStack.lastCommandName = null

      if (this.editor.hasMultipleCursors()) {
        this.clearSelections()
      } else if (this.hasPersistentSelections() && this.getConfig("clearPersistentSelectionOnResetNormalMode")) {
        this.clearPersistentSelections()
      } else if (this.__occurrenceManager && this.occurrenceManager.hasPatterns()) {
        this.occurrenceManager.resetPatterns()
      }
      if (this.getConfig("clearHighlightSearchOnResetNormalMode")) this.globalState.set("highlightSearchPattern", null)
    } else {
      this.clearSelections()
    }
    this.activate("normal")
  }

  reset() {
    // Reset each props only if it's already populated.
    this.__register && this.register.reset()
    this.__searchHistory && this.searchHistory.reset()
    this.__hover && this.hover.reset()
    this.__operationStack && this.operationStack.reset()
    this.__mutationManager && this.mutationManager.reset()
  }

  isVisible() {
    return this.utils.getVisibleEditors().includes(this.editor)
  }

  // FIXME: naming, updateLastSelectedInfo ?
  updatePreviousSelection() {
    let properties

    if (this.isMode("visual", "blockwise")) {
      const blockwiseSelection = this.getLastBlockwiseSelection()
      properties = blockwiseSelection && blockwiseSelection.getProperties()
    } else {
      properties = this.swrap(this.editor.getLastSelection()).getProperties()
    }

    // TODO#704 when cursor is added in visual-mode, corresponding selection prop yet not exists.
    if (!properties) return

    // Copy by extracting only used item.
    properties = {head: properties.head, tail: properties.tail}

    const [whichStart, whichEnd] = properties.head.isGreaterThanOrEqual(properties.tail)
      ? ["tail", "head"]
      : ["head", "tail"]
    properties[whichEnd] = this.utils.translatePointAndClip(this.editor, properties[whichEnd], "forward")

    this.mark.set("<", properties[whichStart])
    this.mark.set(">", properties[whichEnd])
    this.previousSelection = {properties, submode: this.submode}
  }

  // Persistent selection
  // -------------------------
  hasPersistentSelections() {
    return this.__persistentSelection ? this.persistentSelection.hasMarkers() : false
  }

  getPersistentSelectionBufferRanges() {
    return this.__persistentSelection ? this.persistentSelection.getMarkerBufferRanges() : []
  }

  clearPersistentSelections() {
    if (this.__persistentSelection) this.persistentSelection.clearMarkers()
  }

  requestScroll({amountOfScreenRows, scrollTop, duration, onFinish}) {
    // Finalize previous scroll request first
    if (this.scrollRequest) {
      this.scrollRequest.finish()
      this.scrollRequest = null
    }

    let scrollFrom, scrollTo
    if (amountOfScreenRows != null) {
      const fromRow = this.editor.getFirstVisibleScreenRow()
      const toRow = fromRow + amountOfScreenRows

      if (!duration) {
        this.editor.setFirstVisibleScreenRow(toRow)
        if (onFinish) onFinish()
        return
      }

      const getPixelRectTopForRow = row => this.editorElement.pixelRectForScreenRange([[row, 0], [row, 0]]).top
      scrollFrom = {top: getPixelRectTopForRow(fromRow)}
      scrollTo = {top: getPixelRectTopForRow(toRow)}
    } else {
      if (!duration) {
        this.editorElement.setScrollTop(scrollTop)
        if (onFinish) onFinish()
        return
      }
      scrollFrom = {top: this.editorElement.getScrollTop()}
      scrollTo = {top: scrollTop}
    }

    if (!jQuery) jQuery = require("atom-space-pen-views").jQuery
    this.scrollRequest = jQuery(scrollFrom).animate(scrollTo, {
      duration: duration,
      step: newTop => {
        // [NOTE]
        // intentionally use `element.component.setScrollTop` instead of `element.setScrollTop`.
        // Since element.setScrollTop will throw exception when element.component no longer exists.
        if (this.editorElement.component) {
          this.editorElement.component.setScrollTop(newTop)
          this.editorElement.component.updateSync()
        }
      },
      done: () => {
        this.scrollRequest = null
        if (this.editor.element.component) this.editor.element.component.updateSync()
        if (onFinish) onFinish()
      },
    })
  }

  // Other
  // -------------------------
  focusInput(options) {
    if (!focusInput) focusInput = require("./focus-input")
    focusInput(this, options)
  }

  readChar({onCancel, onConfirm}) {
    const disposables = new CompositeDisposable(
      this.onDidFailToPushToOperationStack(() => {
        disposables.dispose()
        onCancel()
      }),
      this.swapClassName("vim-mode-plus-input-char-waiting", "is-focused"),
      this.onDidSetInputChar(char => {
        disposables.dispose()
        onConfirm(char)
      }),
      atom.commands.add(this.editorElement, {
        "core:cancel": event => {
          event.stopImmediatePropagation()
          disposables.dispose()
          onCancel()
        },
      })
    )
  }
}
