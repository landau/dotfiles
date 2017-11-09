const {Disposable, Emitter, CompositeDisposable} = require("atom")

const Base = require("./base")
const settings = require("./settings")
const VimState = require("./vim-state")

module.exports = {
  config: settings.config,

  activate() {
    this.emitter = new Emitter()
    settings.notifyDeprecatedParams()
    settings.notifyCoffeeScriptNoLongerSupportedToExtendVMP()
    settings.migrateRenamedParams()

    if (atom.inSpecMode()) settings.set("strictAssertion", true)

    this.subscriptions = new CompositeDisposable(
      ...Base.init(this.getEditorState),
      ...this.registerCommands(),
      this.registerVimStateCommands(),
      this.observeAndWarnVimMode(),
      atom.workspace.onDidChangeActivePane(() => this.demaximizePane()),
      atom.workspace.observeTextEditors(editor => {
        if (!editor.isMini()) {
          this.emitter.emit("did-add-vim-state", new VimState(editor, this.statusBarManager))
        }
      }),
      atom.workspace.onDidStopChangingActivePaneItem(item => {
        if (atom.workspace.isTextEditor(item) && item.isMini()) return

        const autoEscapeInsertMode = settings.get("automaticallyEscapeInsertModeOnActivePaneItemChange")

        VimState.forEach(vimState => {
          if (vimState.editor === item) {
            vimState.updateStatusBar()
          } else if (autoEscapeInsertMode && vimState.mode === "insert") {
            vimState.activate("normal")
          }

          // [FIXME] Clear existing flash markers for all vimState to avoid hide/show editor re-start flash animation.
          // This is workaround for "the keyframe animation being restarted on re-activating editor"-issue.
          // Ideally I want to remove this and keyframe animation state is mainained across hide/show editor item.
          vimState.clearFlash()

          if (vimState.__highlightSearch || this.globalState.get("highlightSearchPattern")) {
            vimState.highlightSearch.refresh()
          }
        })

        if (!atom.workspace.isTextEditor(item)) {
          this.statusBarManager.clear()
        }
      }),
      settings.onDidChange("highlightSearch", ({newValue}) => {
        if (newValue) {
          this.globalState.set("highlightSearchPattern", this.globalState.get("lastSearchPattern"))
        } else {
          this.clearHighlightSearch()
        }
      }),
      ...settings.observeConditionalKeymaps()
    )

    if (atom.inDevMode()) {
      this.developer = new (require("./developer"))()
      this.subscriptions.add(this.developer.init(this.getEditorState))
      if (settings.get("debug")) {
        this.developer.reportRequireCache({excludeNodModules: false})
      }
    }
  },

  observeAndWarnVimMode(fn) {
    const warn = () => {
      const message = [
        "## Message by vim-mode-plus: vim-mode detected!",
        "To use vim-mode-plus, you must **disable vim-mode** manually.",
      ].join("\n")

      atom.notifications.addWarning(message, {dismissable: true})
    }

    if (atom.packages.isPackageActive("vim-mode")) warn()
    return atom.packages.onDidActivatePackage(pack => {
      if (pack.name === "vim-mode") warn()
    })
  },

  // * `fn` {Function} to be called when vimState instance was created.
  //  Usage:
  //   onDidAddVimState (vimState) -> do something..
  // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  onDidAddVimState(fn) {
    return this.emitter.on("did-add-vim-state", fn)
  },

  // * `fn` {Function} to be called with all current and future vimState
  //  Usage:
  //   observeVimStates (vimState) -> do something..
  // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  observeVimStates(fn) {
    VimState.forEach(fn)
    return this.onDidAddVimState(fn)
  },

  deactivate() {
    this.demaximizePane()
    if (this.demoModeSupport) this.demoModeSupport.destroy()

    this.subscriptions.dispose()
    VimState.forEach(vimState => vimState.destroy())
    VimState.clear()
  },

  registerCommands() {
    return [
      atom.commands.add("atom-text-editor:not([mini])", {
        "vim-mode-plus:clear-highlight-search": () => this.clearHighlightSearch(),
        "vim-mode-plus:toggle-highlight-search": () => this.toggleHighlightSearch(),
      }),
      atom.commands.add("atom-workspace", {
        "vim-mode-plus:maximize-pane": () => this.paneUtils.maximizePane(),
        "vim-mode-plus:maximize-pane-without-center": () => this.paneUtils.maximizePane(false),
        "vim-mode-plus:equalize-panes": () => this.paneUtils.equalizePanes(),
        "vim-mode-plus:exchange-pane": () => this.paneUtils.exchangePane(),
        "vim-mode-plus:move-pane-to-very-top": () => this.paneUtils.movePaneToVery("top"),
        "vim-mode-plus:move-pane-to-very-bottom": () => this.paneUtils.movePaneToVery("bottom"),
        "vim-mode-plus:move-pane-to-very-left": () => this.paneUtils.movePaneToVery("left"),
        "vim-mode-plus:move-pane-to-very-right": () => this.paneUtils.movePaneToVery("right"),
      }),
    ]
  },

  // atom-text-editor commands
  clearHighlightSearch() {
    this.globalState.set("highlightSearchPattern", null)
  },

  toggleHighlightSearch() {
    settings.toggle("highlightSearch")
  },

  demaximizePane() {
    this.__paneUtils && this.paneUtils.demaximizePane()
  },

  registerVimStateCommands() {
    // all commands here is executed with context where 'this' bound to 'vimState'
    // prettier-ignore
    const commands = {
      "activate-normal-mode"() { this.activate("normal") },
      "activate-linewise-visual-mode"() { this.activate("visual", "linewise") },
      "activate-characterwise-visual-mode"() { this.activate("visual", "characterwise") },
      "activate-blockwise-visual-mode"() { this.activate("visual", "blockwise") },
      "reset-normal-mode"() { this.resetNormalMode({userInvocation: true}) },
      "clear-persistent-selections"() { this.clearPersistentSelections() },
      "set-register-name"() { this.register.setName() },
      "set-register-name-to-_"() { this.register.setName("_") },
      "set-register-name-to-*"() { this.register.setName("*") },
      "operator-modifier-characterwise"() { this.setOperatorModifier({wise: "characterwise"}) },
      "operator-modifier-linewise"() { this.setOperatorModifier({wise: "linewise"}) },
      "operator-modifier-occurrence"() { this.setOperatorModifier({occurrence: true, occurrenceType: "base"}) },
      "operator-modifier-subword-occurrence"() { this.setOperatorModifier({occurrence: true, occurrenceType: "subword"}) },
      repeat() { this.operationStack.runRecorded() },
      "repeat-find"() { this.operationStack.runCurrentFind() },
      "repeat-find-reverse"() { this.operationStack.runCurrentFind({reverse: true}) },
      "repeat-search"() { this.operationStack.runCurrentSearch() },
      "repeat-search-reverse"() { this.operationStack.runCurrentSearch({reverse: true}) },
      "set-count-0"() { this.setCount(0) },
      "set-count-1"() { this.setCount(1) },
      "set-count-2"() { this.setCount(2) },
      "set-count-3"() { this.setCount(3) },
      "set-count-4"() { this.setCount(4) },
      "set-count-5"() { this.setCount(5) },
      "set-count-6"() { this.setCount(6) },
      "set-count-7"() { this.setCount(7) },
      "set-count-8"() { this.setCount(8) },
      "set-count-9"() { this.setCount(9) },
    }

    for (let code = 32; code <= 126; code++) {
      const char = String.fromCharCode(code)
      const charForKeymap = char === " " ? "space" : char
      commands[`set-input-char-${charForKeymap}`] = function() {
        this.emitDidSetInputChar(char)
      }
    }

    const getEditorState = this.getEditorState.bind(this)

    function bindToVimState(commands) {
      const boundCommands = {}
      for (const name of Object.keys(commands)) {
        const fn = commands[name]
        boundCommands[`vim-mode-plus:${name}`] = function(event) {
          event.stopPropagation()
          const vimState = getEditorState(this.getModel())
          if (vimState) fn.call(vimState, event)
        }
      }
      return boundCommands
    }

    return atom.commands.add("atom-text-editor:not([mini])", bindToVimState(commands))
  },

  consumeStatusBar(statusBar) {
    this.statusBarManager.initialize(statusBar)
    this.statusBarManager.attach()
    this.subscriptions.add(new Disposable(() => this.statusBarManager.detach()))
  },

  consumeDemoMode(demoModeService) {
    this.demoModeSupport = new (require("./demo-mode-support"))(demoModeService)
  },

  // Computed props
  // -------------------------
  get statusBarManager() {
    return this.__statusBarManager || (this.__statusBarManager = require("./status-bar-manager"))
  },

  get paneUtils() {
    return this.__paneUtils || (this.__paneUtils = require("./pane-utils"))
  },

  get globalState() {
    return this.__globalState || (this.__globalState = require("./global-state"))
  },

  // Service API
  // -------------------------
  getGlobalState() {
    return this.globalState
  },

  getEditorState(editor) {
    return VimState.get(editor)
  },

  provideVimModePlus() {
    return {
      Base: Base,
      registerCommandFromSpec: Base.registerCommandFromSpec.bind(Base),
      getGlobalState: this.getGlobalState.bind(this),
      getEditorState: this.getEditorState.bind(this),
      observeVimStates: this.observeVimStates.bind(this),
      onDidAddVimState: this.onDidAddVimState.bind(this),
    }
  },
}
