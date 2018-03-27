Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atomUtils = require('atom-utils');

var _mixinsDomStylesReader = require('./mixins/dom-styles-reader');

var _mixinsDomStylesReader2 = _interopRequireDefault(_mixinsDomStylesReader);

var _mixinsCanvasDrawer = require('./mixins/canvas-drawer');

var _mixinsCanvasDrawer2 = _interopRequireDefault(_mixinsCanvasDrawer);

var _decoratorsInclude = require('./decorators/include');

var _decoratorsInclude2 = _interopRequireDefault(_decoratorsInclude);

var _decoratorsElement = require('./decorators/element');

var _decoratorsElement2 = _interopRequireDefault(_decoratorsElement);

'use babel';

var Main = undefined,
    MinimapQuickSettingsElement = undefined,
    CompositeDisposable = undefined,
    Disposable = undefined;

var SPEC_MODE = atom.inSpecMode();

/**
 * Public: The MinimapElement is the view meant to render a {@link Minimap}
 * instance in the DOM.
 *
 * You can retrieve the MinimapElement associated to a Minimap
 * using the `atom.views.getView` method.
 *
 * Note that most interactions with the Minimap package is done through the
 * Minimap model so you should never have to access MinimapElement
 * instances.
 *
 * @example
 * let minimapElement = atom.views.getView(minimap)
 */

var MinimapElement = (function () {
  function MinimapElement() {
    _classCallCheck(this, _MinimapElement);
  }

  _createClass(MinimapElement, [{
    key: 'createdCallback',

    //    ##     ##  #######   #######  ##    ##  ######
    //    ##     ## ##     ## ##     ## ##   ##  ##    ##
    //    ##     ## ##     ## ##     ## ##  ##   ##
    //    ######### ##     ## ##     ## #####     ######
    //    ##     ## ##     ## ##     ## ##  ##         ##
    //    ##     ## ##     ## ##     ## ##   ##  ##    ##
    //    ##     ##  #######   #######  ##    ##  ######

    /**
     * DOM callback invoked when a new MinimapElement is created.
     *
     * @access private
     */
    value: function createdCallback() {
      var _this = this;

      if (!CompositeDisposable) {
        var _require = require('atom');

        CompositeDisposable = _require.CompositeDisposable;
        Disposable = _require.Disposable;
      }

      // Core properties

      /**
       * @access private
       */
      this.minimap = undefined;
      /**
       * @access private
       */
      this.editorElement = undefined;
      /**
       * @access private
       */
      this.width = undefined;
      /**
       * @access private
       */
      this.height = undefined;

      // Subscriptions

      /**
       * @access private
       */
      this.subscriptions = new CompositeDisposable();
      /**
       * @access private
       */
      this.visibleAreaSubscription = undefined;
      /**
       * @access private
       */
      this.quickSettingsSubscription = undefined;
      /**
       * @access private
       */
      this.dragSubscription = undefined;
      /**
       * @access private
       */
      this.openQuickSettingSubscription = undefined;

      // Configs

      /**
      * @access private
      */
      this.displayMinimapOnLeft = false;
      /**
      * @access private
      */
      this.minimapScrollIndicator = undefined;
      /**
      * @access private
      */
      this.displayMinimapOnLeft = undefined;
      /**
      * @access private
      */
      this.displayPluginsControls = undefined;
      /**
      * @access private
      */
      this.textOpacity = undefined;
      /**
      * @access private
      */
      this.displayCodeHighlights = undefined;
      /**
      * @access private
      */
      this.adjustToSoftWrap = undefined;
      /**
      * @access private
      */
      this.useHardwareAcceleration = undefined;
      /**
      * @access private
      */
      this.absoluteMode = undefined;

      // Elements

      /**
       * @access private
       */
      this.shadowRoot = undefined;
      /**
       * @access private
       */
      this.visibleArea = undefined;
      /**
       * @access private
       */
      this.controls = undefined;
      /**
       * @access private
       */
      this.scrollIndicator = undefined;
      /**
       * @access private
       */
      this.openQuickSettings = undefined;
      /**
       * @access private
       */
      this.quickSettingsElement = undefined;

      // States

      /**
      * @access private
      */
      this.attached = undefined;
      /**
      * @access private
      */
      this.attachedToTextEditor = undefined;
      /**
      * @access private
      */
      this.standAlone = undefined;
      /**
       * @access private
       */
      this.wasVisible = undefined;

      // Other

      /**
       * @access private
       */
      this.offscreenFirstRow = undefined;
      /**
       * @access private
       */
      this.offscreenLastRow = undefined;
      /**
       * @access private
       */
      this.frameRequested = undefined;
      /**
       * @access private
       */
      this.flexBasis = undefined;

      this.initializeContent();

      return this.observeConfig({
        'minimap.displayMinimapOnLeft': function minimapDisplayMinimapOnLeft(displayMinimapOnLeft) {
          _this.displayMinimapOnLeft = displayMinimapOnLeft;

          _this.updateMinimapFlexPosition();
        },

        'minimap.minimapScrollIndicator': function minimapMinimapScrollIndicator(minimapScrollIndicator) {
          _this.minimapScrollIndicator = minimapScrollIndicator;

          if (_this.minimapScrollIndicator && !(_this.scrollIndicator != null) && !_this.standAlone) {
            _this.initializeScrollIndicator();
          } else if (_this.scrollIndicator != null) {
            _this.disposeScrollIndicator();
          }

          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'minimap.displayPluginsControls': function minimapDisplayPluginsControls(displayPluginsControls) {
          _this.displayPluginsControls = displayPluginsControls;

          if (_this.displayPluginsControls && !(_this.openQuickSettings != null) && !_this.standAlone) {
            _this.initializeOpenQuickSettings();
          } else if (_this.openQuickSettings != null) {
            _this.disposeOpenQuickSettings();
          }
        },

        'minimap.textOpacity': function minimapTextOpacity(textOpacity) {
          _this.textOpacity = textOpacity;

          if (_this.attached) {
            _this.requestForcedUpdate();
          }
        },

        'minimap.displayCodeHighlights': function minimapDisplayCodeHighlights(displayCodeHighlights) {
          _this.displayCodeHighlights = displayCodeHighlights;

          if (_this.attached) {
            _this.requestForcedUpdate();
          }
        },

        'minimap.smoothScrolling': function minimapSmoothScrolling(smoothScrolling) {
          _this.smoothScrolling = smoothScrolling;

          if (_this.attached) {
            if (!_this.smoothScrolling) {
              _this.backLayer.canvas.style.cssText = '';
              _this.tokensLayer.canvas.style.cssText = '';
              _this.frontLayer.canvas.style.cssText = '';
            } else {
              _this.requestUpdate();
            }
          }
        },

        'minimap.adjustMinimapWidthToSoftWrap': function minimapAdjustMinimapWidthToSoftWrap(adjustToSoftWrap) {
          _this.adjustToSoftWrap = adjustToSoftWrap;

          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'minimap.adjustMinimapWidthOnlyIfSmaller': function minimapAdjustMinimapWidthOnlyIfSmaller(adjustOnlyIfSmaller) {
          _this.adjustOnlyIfSmaller = adjustOnlyIfSmaller;

          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'minimap.useHardwareAcceleration': function minimapUseHardwareAcceleration(useHardwareAcceleration) {
          _this.useHardwareAcceleration = useHardwareAcceleration;

          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'minimap.absoluteMode': function minimapAbsoluteMode(absoluteMode) {
          _this.absoluteMode = absoluteMode;

          _this.classList.toggle('absolute', _this.absoluteMode);
        },

        'minimap.adjustAbsoluteModeHeight': function minimapAdjustAbsoluteModeHeight(adjustAbsoluteModeHeight) {
          _this.adjustAbsoluteModeHeight = adjustAbsoluteModeHeight;

          _this.classList.toggle('adjust-absolute-height', _this.adjustAbsoluteModeHeight);

          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'minimap.ignoreWhitespacesInTokens': function minimapIgnoreWhitespacesInTokens(ignoreWhitespacesInTokens) {
          _this.ignoreWhitespacesInTokens = ignoreWhitespacesInTokens;

          if (_this.attached) {
            _this.requestForcedUpdate();
          }
        },

        'editor.preferredLineLength': function editorPreferredLineLength() {
          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'editor.softWrap': function editorSoftWrap() {
          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'editor.showInvisibles': function editorShowInvisibles() {
          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'editor.invisibles': function editorInvisibles() {
          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'editor.softWrapAtPreferredLineLength': function editorSoftWrapAtPreferredLineLength() {
          if (_this.attached) {
            _this.requestUpdate();
          }
        }
      });
    }

    /**
     * DOM callback invoked when a new MinimapElement is attached to the DOM.
     *
     * @access private
     */
  }, {
    key: 'attachedCallback',
    value: function attachedCallback() {
      var _this2 = this;

      this.subscriptions.add(atom.views.pollDocument(function () {
        _this2.pollDOM();
      }));
      this.measureHeightAndWidth();
      this.updateMinimapFlexPosition();
      this.attached = true;
      this.attachedToTextEditor = this.parentNode === this.getTextEditorElementRoot();

      if (this.attachedToTextEditor) {
        this.getTextEditorElement().setAttribute('with-minimap', '');
      }

      /*
        We use `atom.styles.onDidAddStyleElement` instead of
        `atom.themes.onDidChangeActiveThemes`.
        Why? Currently, The style element will be removed first, and then re-added
        and the `change` event has not be triggered in the process.
      */
      this.subscriptions.add(atom.styles.onDidAddStyleElement(function () {
        _this2.invalidateDOMStylesCache();
        _this2.requestForcedUpdate();
      }));

      this.subscriptions.add(this.subscribeToMediaQuery());
    }

    /**
     * DOM callback invoked when a new MinimapElement is detached from the DOM.
     *
     * @access private
     */
  }, {
    key: 'detachedCallback',
    value: function detachedCallback() {
      this.getTextEditorElement().removeAttribute('with-minimap');
      this.attached = false;
    }

    //       ###    ######## ########    ###     ######  ##     ##
    //      ## ##      ##       ##      ## ##   ##    ## ##     ##
    //     ##   ##     ##       ##     ##   ##  ##       ##     ##
    //    ##     ##    ##       ##    ##     ## ##       #########
    //    #########    ##       ##    ######### ##       ##     ##
    //    ##     ##    ##       ##    ##     ## ##    ## ##     ##
    //    ##     ##    ##       ##    ##     ##  ######  ##     ##

    /**
     * Returns whether the MinimapElement is currently visible on screen or not.
     *
     * The visibility of the minimap is defined by testing the size of the offset
     * width and height of the element.
     *
     * @return {boolean} whether the MinimapElement is currently visible or not
     */
  }, {
    key: 'isVisible',
    value: function isVisible() {
      return this.offsetWidth > 0 || this.offsetHeight > 0;
    }

    /**
     * Attaches the MinimapElement to the DOM.
     *
     * The position at which the element is attached is defined by the
     * `displayMinimapOnLeft` setting.
     *
     * @param  {HTMLElement} [parent] the DOM node where attaching the minimap
     *                                element
     */
  }, {
    key: 'attach',
    value: function attach(parent) {
      if (this.attached) {
        return;
      }

      var container = parent || this.getTextEditorElementRoot();
      var minimaps = container.querySelectorAll('atom-text-editor-minimap');
      if (minimaps.length) {
        Array.prototype.forEach.call(minimaps, function (el) {
          el.destroy();
        });
      }
      container.appendChild(this);
    }

    /**
     * Detaches the MinimapElement from the DOM.
     */
  }, {
    key: 'detach',
    value: function detach() {
      if (!this.attached || this.parentNode == null) {
        return;
      }
      this.parentNode.removeChild(this);
    }

    /**
     * Toggles the minimap left/right position based on the value of the
     * `displayMinimapOnLeft` setting.
     *
     * @access private
     */
  }, {
    key: 'updateMinimapFlexPosition',
    value: function updateMinimapFlexPosition() {
      this.classList.toggle('left', this.displayMinimapOnLeft);
    }

    /**
     * Destroys this MinimapElement
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this.subscriptions.dispose();
      this.detach();
      this.minimap = null;
    }

    //     ######   #######  ##    ## ######## ######## ##    ## ########
    //    ##    ## ##     ## ###   ##    ##    ##       ###   ##    ##
    //    ##       ##     ## ####  ##    ##    ##       ####  ##    ##
    //    ##       ##     ## ## ## ##    ##    ######   ## ## ##    ##
    //    ##       ##     ## ##  ####    ##    ##       ##  ####    ##
    //    ##    ## ##     ## ##   ###    ##    ##       ##   ###    ##
    //     ######   #######  ##    ##    ##    ######## ##    ##    ##

    /**
     * Creates the content of the MinimapElement and attaches the mouse control
     * event listeners.
     *
     * @access private
     */
  }, {
    key: 'initializeContent',
    value: function initializeContent() {
      var _this3 = this;

      this.initializeCanvas();

      this.shadowRoot = this.createShadowRoot();
      this.attachCanvases(this.shadowRoot);

      this.createVisibleArea();
      this.createControls();

      this.subscriptions.add(this.subscribeTo(this, {
        'mousewheel': function mousewheel(e) {
          if (!_this3.standAlone) {
            _this3.relayMousewheelEvent(e);
          }
        }
      }));

      this.subscriptions.add(this.subscribeTo(this.getFrontCanvas(), {
        'mousedown': function mousedown(e) {
          _this3.canvasPressed(_this3.extractMouseEventData(e));
        },
        'touchstart': function touchstart(e) {
          _this3.canvasPressed(_this3.extractTouchEventData(e));
        }
      }));
    }

    /**
     * Initializes the visible area div.
     *
     * @access private
     */
  }, {
    key: 'createVisibleArea',
    value: function createVisibleArea() {
      var _this4 = this;

      if (this.visibleArea) {
        return;
      }

      this.visibleArea = document.createElement('div');
      this.visibleArea.classList.add('minimap-visible-area');
      this.shadowRoot.appendChild(this.visibleArea);
      this.visibleAreaSubscription = this.subscribeTo(this.visibleArea, {
        'mousedown': function mousedown(e) {
          _this4.startDrag(_this4.extractMouseEventData(e));
        },
        'touchstart': function touchstart(e) {
          _this4.startDrag(_this4.extractTouchEventData(e));
        }
      });

      this.subscriptions.add(this.visibleAreaSubscription);
    }

    /**
     * Removes the visible area div.
     *
     * @access private
     */
  }, {
    key: 'removeVisibleArea',
    value: function removeVisibleArea() {
      if (!this.visibleArea) {
        return;
      }

      this.subscriptions.remove(this.visibleAreaSubscription);
      this.visibleAreaSubscription.dispose();
      this.shadowRoot.removeChild(this.visibleArea);
      delete this.visibleArea;
    }

    /**
     * Creates the controls container div.
     *
     * @access private
     */
  }, {
    key: 'createControls',
    value: function createControls() {
      if (this.controls || this.standAlone) {
        return;
      }

      this.controls = document.createElement('div');
      this.controls.classList.add('minimap-controls');
      this.shadowRoot.appendChild(this.controls);
    }

    /**
     * Removes the controls container div.
     *
     * @access private
     */
  }, {
    key: 'removeControls',
    value: function removeControls() {
      if (!this.controls) {
        return;
      }

      this.shadowRoot.removeChild(this.controls);
      delete this.controls;
    }

    /**
     * Initializes the scroll indicator div when the `minimapScrollIndicator`
     * settings is enabled.
     *
     * @access private
     */
  }, {
    key: 'initializeScrollIndicator',
    value: function initializeScrollIndicator() {
      if (this.scrollIndicator || this.standAlone) {
        return;
      }

      this.scrollIndicator = document.createElement('div');
      this.scrollIndicator.classList.add('minimap-scroll-indicator');
      this.controls.appendChild(this.scrollIndicator);
    }

    /**
     * Disposes the scroll indicator div when the `minimapScrollIndicator`
     * settings is disabled.
     *
     * @access private
     */
  }, {
    key: 'disposeScrollIndicator',
    value: function disposeScrollIndicator() {
      if (!this.scrollIndicator) {
        return;
      }

      this.controls.removeChild(this.scrollIndicator);
      delete this.scrollIndicator;
    }

    /**
     * Initializes the quick settings openener div when the
     * `displayPluginsControls` setting is enabled.
     *
     * @access private
     */
  }, {
    key: 'initializeOpenQuickSettings',
    value: function initializeOpenQuickSettings() {
      var _this5 = this;

      if (this.openQuickSettings || this.standAlone) {
        return;
      }

      this.openQuickSettings = document.createElement('div');
      this.openQuickSettings.classList.add('open-minimap-quick-settings');
      this.controls.appendChild(this.openQuickSettings);

      this.openQuickSettingSubscription = this.subscribeTo(this.openQuickSettings, {
        'mousedown': function mousedown(e) {
          if (!MinimapQuickSettingsElement) {
            MinimapQuickSettingsElement = require('./minimap-quick-settings-element');
          }

          e.preventDefault();
          e.stopPropagation();

          if (_this5.quickSettingsElement != null) {
            _this5.quickSettingsElement.destroy();
            _this5.quickSettingsSubscription.dispose();
          } else {
            _this5.quickSettingsElement = new MinimapQuickSettingsElement();
            _this5.quickSettingsElement.setModel(_this5);
            _this5.quickSettingsSubscription = _this5.quickSettingsElement.onDidDestroy(function () {
              _this5.quickSettingsElement = null;
            });

            var _getFrontCanvas$getBoundingClientRect = _this5.getFrontCanvas().getBoundingClientRect();

            var _top = _getFrontCanvas$getBoundingClientRect.top;
            var left = _getFrontCanvas$getBoundingClientRect.left;
            var right = _getFrontCanvas$getBoundingClientRect.right;

            _this5.quickSettingsElement.style.top = _top + 'px';
            _this5.quickSettingsElement.attach();

            if (_this5.displayMinimapOnLeft) {
              _this5.quickSettingsElement.style.left = right + 'px';
            } else {
              _this5.quickSettingsElement.style.left = left - _this5.quickSettingsElement.clientWidth + 'px';
            }
          }
        }
      });
    }

    /**
     * Disposes the quick settings openener div when the `displayPluginsControls`
     * setting is disabled.
     *
     * @access private
     */
  }, {
    key: 'disposeOpenQuickSettings',
    value: function disposeOpenQuickSettings() {
      if (!this.openQuickSettings) {
        return;
      }

      this.controls.removeChild(this.openQuickSettings);
      this.openQuickSettingSubscription.dispose();
      delete this.openQuickSettings;
    }

    /**
     * Returns the target `TextEditor` of the Minimap.
     *
     * @return {TextEditor} the minimap's text editor
     */
  }, {
    key: 'getTextEditor',
    value: function getTextEditor() {
      return this.minimap.getTextEditor();
    }

    /**
     * Returns the `TextEditorElement` for the Minimap's `TextEditor`.
     *
     * @return {TextEditorElement} the minimap's text editor element
     */
  }, {
    key: 'getTextEditorElement',
    value: function getTextEditorElement() {
      if (this.editorElement) {
        return this.editorElement;
      }

      this.editorElement = atom.views.getView(this.getTextEditor());
      return this.editorElement;
    }

    /**
     * Returns the root of the `TextEditorElement` content.
     *
     * This method is mostly used to ensure compatibility with the `shadowDom`
     * setting.
     *
     * @return {HTMLElement} the root of the `TextEditorElement` content
     */
  }, {
    key: 'getTextEditorElementRoot',
    value: function getTextEditorElementRoot() {
      var editorElement = this.getTextEditorElement();

      if (editorElement.shadowRoot) {
        return editorElement.shadowRoot;
      } else {
        return editorElement;
      }
    }

    /**
     * Returns the root where to inject the dummy node used to read DOM styles.
     *
     * @param  {boolean} shadowRoot whether to use the text editor shadow DOM
     *                              or not
     * @return {HTMLElement} the root node where appending the dummy node
     * @access private
     */
  }, {
    key: 'getDummyDOMRoot',
    value: function getDummyDOMRoot(shadowRoot) {
      if (shadowRoot) {
        return this.getTextEditorElementRoot();
      } else {
        return this.getTextEditorElement();
      }
    }

    //    ##     ##  #######  ########  ######## ##
    //    ###   ### ##     ## ##     ## ##       ##
    //    #### #### ##     ## ##     ## ##       ##
    //    ## ### ## ##     ## ##     ## ######   ##
    //    ##     ## ##     ## ##     ## ##       ##
    //    ##     ## ##     ## ##     ## ##       ##
    //    ##     ##  #######  ########  ######## ########

    /**
     * Returns the Minimap for which this MinimapElement was created.
     *
     * @return {Minimap} this element's Minimap
     */
  }, {
    key: 'getModel',
    value: function getModel() {
      return this.minimap;
    }

    /**
     * Defines the Minimap model for this MinimapElement instance.
     *
     * @param  {Minimap} minimap the Minimap model for this instance.
     * @return {Minimap} this element's Minimap
     */
  }, {
    key: 'setModel',
    value: function setModel(minimap) {
      var _this6 = this;

      if (!Main) {
        Main = require('./main');
      }

      this.minimap = minimap;
      this.subscriptions.add(this.minimap.onDidChangeScrollTop(function () {
        _this6.requestUpdate();
      }));
      this.subscriptions.add(this.minimap.onDidChangeScrollLeft(function () {
        _this6.requestUpdate();
      }));
      this.subscriptions.add(this.minimap.onDidDestroy(function () {
        _this6.destroy();
      }));
      this.subscriptions.add(this.minimap.onDidChangeConfig(function () {
        if (_this6.attached) {
          return _this6.requestForcedUpdate();
        }
      }));

      this.subscriptions.add(this.minimap.onDidChangeStandAlone(function () {
        _this6.setStandAlone(_this6.minimap.isStandAlone());
        _this6.requestUpdate();
      }));

      this.subscriptions.add(this.minimap.onDidChange(function (change) {
        _this6.pendingChanges.push(change);
        _this6.requestUpdate();
      }));

      this.subscriptions.add(this.minimap.onDidChangeDecorationRange(function (change) {
        var type = change.type;

        if (type === 'line' || type === 'highlight-under' || type === 'background-custom') {
          _this6.pendingBackDecorationChanges.push(change);
        } else {
          _this6.pendingFrontDecorationChanges.push(change);
        }
        _this6.requestUpdate();
      }));

      this.subscriptions.add(Main.onDidChangePluginOrder(function () {
        _this6.requestForcedUpdate();
      }));

      this.setStandAlone(this.minimap.isStandAlone());

      if (this.width != null && this.height != null) {
        this.minimap.setScreenHeightAndWidth(this.height, this.width);
      }

      return this.minimap;
    }

    /**
     * Sets the stand-alone mode for this MinimapElement.
     *
     * @param {boolean} standAlone the new mode for this MinimapElement
     */
  }, {
    key: 'setStandAlone',
    value: function setStandAlone(standAlone) {
      this.standAlone = standAlone;

      if (this.standAlone) {
        this.setAttribute('stand-alone', true);
        this.disposeScrollIndicator();
        this.disposeOpenQuickSettings();
        this.removeControls();
        this.removeVisibleArea();
      } else {
        this.removeAttribute('stand-alone');
        this.createVisibleArea();
        this.createControls();
        if (this.minimapScrollIndicator) {
          this.initializeScrollIndicator();
        }
        if (this.displayPluginsControls) {
          this.initializeOpenQuickSettings();
        }
      }
    }

    //    ##     ## ########  ########     ###    ######## ########
    //    ##     ## ##     ## ##     ##   ## ##      ##    ##
    //    ##     ## ##     ## ##     ##  ##   ##     ##    ##
    //    ##     ## ########  ##     ## ##     ##    ##    ######
    //    ##     ## ##        ##     ## #########    ##    ##
    //    ##     ## ##        ##     ## ##     ##    ##    ##
    //     #######  ##        ########  ##     ##    ##    ########

    /**
     * Requests an update to be performed on the next frame.
     */
  }, {
    key: 'requestUpdate',
    value: function requestUpdate() {
      var _this7 = this;

      if (this.frameRequested) {
        return;
      }

      this.frameRequested = true;
      requestAnimationFrame(function () {
        _this7.update();
        _this7.frameRequested = false;
      });
    }

    /**
     * Requests an update to be performed on the next frame that will completely
     * redraw the minimap.
     */
  }, {
    key: 'requestForcedUpdate',
    value: function requestForcedUpdate() {
      this.offscreenFirstRow = null;
      this.offscreenLastRow = null;
      this.requestUpdate();
    }

    /**
     * Performs the actual MinimapElement update.
     *
     * @access private
     */
  }, {
    key: 'update',
    value: function update() {
      if (!(this.attached && this.isVisible() && this.minimap)) {
        return;
      }
      var minimap = this.minimap;
      minimap.enableCache();
      var canvas = this.getFrontCanvas();

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var visibleAreaLeft = minimap.getTextEditorScaledScrollLeft();
      var visibleAreaTop = minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop();
      var visibleWidth = Math.min(canvas.width / devicePixelRatio, this.width);

      if (this.adjustToSoftWrap && this.flexBasis) {
        this.style.flexBasis = this.flexBasis + 'px';
        this.style.width = this.flexBasis + 'px';
      } else {
        this.style.flexBasis = null;
        this.style.width = null;
      }

      if (SPEC_MODE) {
        this.applyStyles(this.visibleArea, {
          width: visibleWidth + 'px',
          height: minimap.getTextEditorScaledHeight() + 'px',
          top: visibleAreaTop + 'px',
          'border-left-width': visibleAreaLeft + 'px'
        });
      } else {
        this.applyStyles(this.visibleArea, {
          width: visibleWidth + 'px',
          height: minimap.getTextEditorScaledHeight() + 'px',
          transform: this.makeTranslate(0, visibleAreaTop),
          'border-left-width': visibleAreaLeft + 'px'
        });
      }

      this.applyStyles(this.controls, { width: visibleWidth + 'px' });

      var canvasTop = minimap.getFirstVisibleScreenRow() * minimap.getLineHeight() - minimap.getScrollTop();

      if (this.smoothScrolling) {
        if (SPEC_MODE) {
          this.applyStyles(this.backLayer.canvas, { top: canvasTop + 'px' });
          this.applyStyles(this.tokensLayer.canvas, { top: canvasTop + 'px' });
          this.applyStyles(this.frontLayer.canvas, { top: canvasTop + 'px' });
        } else {
          var canvasTransform = this.makeTranslate(0, canvasTop);
          if (devicePixelRatio !== 1) {
            canvasTransform += ' ' + this.makeScale(1 / devicePixelRatio);
          }
          this.applyStyles(this.backLayer.canvas, { transform: canvasTransform });
          this.applyStyles(this.tokensLayer.canvas, { transform: canvasTransform });
          this.applyStyles(this.frontLayer.canvas, { transform: canvasTransform });
        }
      } else {
        var canvasTransform = this.makeScale(1 / devicePixelRatio);
        this.applyStyles(this.backLayer.canvas, { transform: canvasTransform });
        this.applyStyles(this.tokensLayer.canvas, { transform: canvasTransform });
        this.applyStyles(this.frontLayer.canvas, { transform: canvasTransform });
      }

      if (this.minimapScrollIndicator && minimap.canScroll() && !this.scrollIndicator) {
        this.initializeScrollIndicator();
      }

      if (this.scrollIndicator != null) {
        var minimapScreenHeight = minimap.getScreenHeight();
        var indicatorHeight = minimapScreenHeight * (minimapScreenHeight / minimap.getHeight());
        var indicatorScroll = (minimapScreenHeight - indicatorHeight) * minimap.getScrollRatio();

        if (SPEC_MODE) {
          this.applyStyles(this.scrollIndicator, {
            height: indicatorHeight + 'px',
            top: indicatorScroll + 'px'
          });
        } else {
          this.applyStyles(this.scrollIndicator, {
            height: indicatorHeight + 'px',
            transform: this.makeTranslate(0, indicatorScroll)
          });
        }

        if (!minimap.canScroll()) {
          this.disposeScrollIndicator();
        }
      }

      if (this.absoluteMode && this.adjustAbsoluteModeHeight) {
        this.updateCanvasesSize();
      }

      this.updateCanvas();
      minimap.clearCache();
    }

    /**
     * Defines whether to render the code highlights or not.
     *
     * @param {Boolean} displayCodeHighlights whether to render the code
     *                                        highlights or not
     */
  }, {
    key: 'setDisplayCodeHighlights',
    value: function setDisplayCodeHighlights(displayCodeHighlights) {
      this.displayCodeHighlights = displayCodeHighlights;
      if (this.attached) {
        this.requestForcedUpdate();
      }
    }

    /**
     * Polling callback used to detect visibility and size changes.
     *
     * @access private
     */
  }, {
    key: 'pollDOM',
    value: function pollDOM() {
      var visibilityChanged = this.checkForVisibilityChange();
      if (this.isVisible()) {
        if (!this.wasVisible) {
          this.requestForcedUpdate();
        }

        this.measureHeightAndWidth(visibilityChanged, false);
      }
    }

    /**
     * A method that checks for visibility changes in the MinimapElement.
     * The method returns `true` when the visibility changed from visible to
     * hidden or from hidden to visible.
     *
     * @return {boolean} whether the visibility changed or not since the last call
     * @access private
     */
  }, {
    key: 'checkForVisibilityChange',
    value: function checkForVisibilityChange() {
      if (this.isVisible()) {
        if (this.wasVisible) {
          return false;
        } else {
          this.wasVisible = true;
          return this.wasVisible;
        }
      } else {
        if (this.wasVisible) {
          this.wasVisible = false;
          return true;
        } else {
          this.wasVisible = false;
          return this.wasVisible;
        }
      }
    }

    /**
     * A method used to measure the size of the MinimapElement and update internal
     * components based on the new size.
     *
     * @param  {boolean} visibilityChanged did the visibility changed since last
     *                                     measurement
     * @param  {[type]} [forceUpdate=true] forces the update even when no changes
     *                                     were detected
     * @access private
     */
  }, {
    key: 'measureHeightAndWidth',
    value: function measureHeightAndWidth(visibilityChanged) {
      var forceUpdate = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      if (!this.minimap) {
        return;
      }

      var safeFlexBasis = this.style.flexBasis;
      this.style.flexBasis = '';

      var wasResized = this.width !== this.clientWidth || this.height !== this.clientHeight;

      this.height = this.clientHeight;
      this.width = this.clientWidth;
      var canvasWidth = this.width;

      if (this.minimap != null) {
        this.minimap.setScreenHeightAndWidth(this.height, this.width);
      }

      if (wasResized || visibilityChanged || forceUpdate) {
        this.requestForcedUpdate();
      }

      if (!this.isVisible()) {
        return;
      }

      if (wasResized || forceUpdate) {
        if (this.adjustToSoftWrap) {
          var lineLength = atom.config.get('editor.preferredLineLength');
          var softWrap = atom.config.get('editor.softWrap');
          var softWrapAtPreferredLineLength = atom.config.get('editor.softWrapAtPreferredLineLength');
          var width = lineLength * this.minimap.getCharWidth();

          if (softWrap && softWrapAtPreferredLineLength && lineLength && (width <= this.width || !this.adjustOnlyIfSmaller)) {
            this.flexBasis = width;
            canvasWidth = width;
          } else {
            delete this.flexBasis;
          }
        } else {
          delete this.flexBasis;
        }

        this.updateCanvasesSize(canvasWidth);
      } else {
        this.style.flexBasis = safeFlexBasis;
      }
    }
  }, {
    key: 'updateCanvasesSize',
    value: function updateCanvasesSize() {
      var canvasWidth = arguments.length <= 0 || arguments[0] === undefined ? this.getFrontCanvas().width : arguments[0];

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var maxCanvasHeight = this.height + this.minimap.getLineHeight();
      var newHeight = this.absoluteMode && this.adjustAbsoluteModeHeight ? Math.min(this.minimap.getHeight(), maxCanvasHeight) : maxCanvasHeight;
      var canvas = this.getFrontCanvas();
      if (canvasWidth !== canvas.width || newHeight !== canvas.height) {
        this.setCanvasesSize(canvasWidth * devicePixelRatio, newHeight * devicePixelRatio);
        if (this.absoluteMode && this.adjustAbsoluteModeHeight) {
          this.offscreenFirstRow = null;
          this.offscreenLastRow = null;
        }
      }
    }

    //    ######## ##     ## ######## ##    ## ########  ######
    //    ##       ##     ## ##       ###   ##    ##    ##    ##
    //    ##       ##     ## ##       ####  ##    ##    ##
    //    ######   ##     ## ######   ## ## ##    ##     ######
    //    ##        ##   ##  ##       ##  ####    ##          ##
    //    ##         ## ##   ##       ##   ###    ##    ##    ##
    //    ########    ###    ######## ##    ##    ##     ######

    /**
     * Helper method to register config observers.
     *
     * @param  {Object} configs={} an object mapping the config name to observe
     *                             with the function to call back when a change
     *                             occurs
     * @access private
     */
  }, {
    key: 'observeConfig',
    value: function observeConfig() {
      var configs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      for (var config in configs) {
        this.subscriptions.add(atom.config.observe(config, configs[config]));
      }
    }

    /**
     * Callback triggered when the mouse is pressed on the MinimapElement canvas.
     *
     * @param  {number} y the vertical coordinate of the event
     * @param  {boolean} isLeftMouse was the left mouse button pressed?
     * @param  {boolean} isMiddleMouse was the middle mouse button pressed?
     * @access private
     */
  }, {
    key: 'canvasPressed',
    value: function canvasPressed(_ref) {
      var y = _ref.y;
      var isLeftMouse = _ref.isLeftMouse;
      var isMiddleMouse = _ref.isMiddleMouse;

      if (this.minimap.isStandAlone()) {
        return;
      }
      if (isLeftMouse) {
        this.canvasLeftMousePressed(y);
      } else if (isMiddleMouse) {
        this.canvasMiddleMousePressed(y);

        var _visibleArea$getBoundingClientRect = this.visibleArea.getBoundingClientRect();

        var _top2 = _visibleArea$getBoundingClientRect.top;
        var height = _visibleArea$getBoundingClientRect.height;

        this.startDrag({ y: _top2 + height / 2, isLeftMouse: false, isMiddleMouse: true });
      }
    }

    /**
     * Callback triggered when the mouse left button is pressed on the
     * MinimapElement canvas.
     *
     * @param  {MouseEvent} e the mouse event object
     * @param  {number} e.pageY the mouse y position in page
     * @param  {HTMLElement} e.target the source of the event
     * @access private
     */
  }, {
    key: 'canvasLeftMousePressed',
    value: function canvasLeftMousePressed(y) {
      var _this8 = this;

      var deltaY = y - this.getBoundingClientRect().top;
      var row = Math.floor(deltaY / this.minimap.getLineHeight()) + this.minimap.getFirstVisibleScreenRow();

      var textEditor = this.minimap.getTextEditor();
      var textEditorElement = this.getTextEditorElement();

      var scrollTop = row * textEditor.getLineHeightInPixels() - this.minimap.getTextEditorHeight() / 2;
      var textEditorScrollTop = textEditorElement.pixelPositionForScreenPosition([row, 0]).top - this.minimap.getTextEditorHeight() / 2;

      if (atom.config.get('minimap.moveCursorOnMinimapClick')) {
        textEditor.setCursorScreenPosition([row, 0]);
      }

      if (atom.config.get('minimap.scrollAnimation')) {
        var duration = atom.config.get('minimap.scrollAnimationDuration');
        var independentScroll = this.minimap.scrollIndependentlyOnMouseWheel();

        var from = this.minimap.getTextEditorScrollTop();
        var to = textEditorScrollTop;
        var step = undefined;

        if (independentScroll) {
          (function () {
            var minimapFrom = _this8.minimap.getScrollTop();
            var minimapTo = Math.min(1, scrollTop / (_this8.minimap.getTextEditorMaxScrollTop() || 1)) * _this8.minimap.getMaxScrollTop();

            step = function (now, t) {
              _this8.minimap.setTextEditorScrollTop(now, true);
              _this8.minimap.setScrollTop(minimapFrom + (minimapTo - minimapFrom) * t);
            };
            _this8.animate({ from: from, to: to, duration: duration, step: step });
          })();
        } else {
          step = function (now) {
            return _this8.minimap.setTextEditorScrollTop(now);
          };
          this.animate({ from: from, to: to, duration: duration, step: step });
        }
      } else {
        this.minimap.setTextEditorScrollTop(textEditorScrollTop);
      }
    }

    /**
     * Callback triggered when the mouse middle button is pressed on the
     * MinimapElement canvas.
     *
     * @param  {MouseEvent} e the mouse event object
     * @param  {number} e.pageY the mouse y position in page
     * @access private
     */
  }, {
    key: 'canvasMiddleMousePressed',
    value: function canvasMiddleMousePressed(y) {
      var _getBoundingClientRect = this.getBoundingClientRect();

      var offsetTop = _getBoundingClientRect.top;

      var deltaY = y - offsetTop - this.minimap.getTextEditorScaledHeight() / 2;

      var ratio = deltaY / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight());

      this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop());
    }

    /**
     * A method that relays the `mousewheel` events received by the MinimapElement
     * to the `TextEditorElement`.
     *
     * @param  {MouseEvent} e the mouse event object
     * @access private
     */
  }, {
    key: 'relayMousewheelEvent',
    value: function relayMousewheelEvent(e) {
      if (this.minimap.scrollIndependentlyOnMouseWheel()) {
        this.minimap.onMouseWheel(e);
      } else {
        this.getTextEditorElement().component.onMouseWheel(e);
      }
    }

    /**
     * A method that extracts data from a `MouseEvent` which can then be used to
     * process clicks and drags of the minimap.
     *
     * Used together with `extractTouchEventData` to provide a unified interface
     * for `MouseEvent`s and `TouchEvent`s.
     *
     * @param  {MouseEvent} mouseEvent the mouse event object
     * @access private
     */
  }, {
    key: 'extractMouseEventData',
    value: function extractMouseEventData(mouseEvent) {
      return {
        x: mouseEvent.pageX,
        y: mouseEvent.pageY,
        isLeftMouse: mouseEvent.which === 1,
        isMiddleMouse: mouseEvent.which === 2
      };
    }

    /**
     * A method that extracts data from a `TouchEvent` which can then be used to
     * process clicks and drags of the minimap.
     *
     * Used together with `extractMouseEventData` to provide a unified interface
     * for `MouseEvent`s and `TouchEvent`s.
     *
     * @param  {TouchEvent} touchEvent the touch event object
     * @access private
     */
  }, {
    key: 'extractTouchEventData',
    value: function extractTouchEventData(touchEvent) {
      // Use the first touch on the target area. Other touches will be ignored in
      // case of multi-touch.
      var touch = touchEvent.changedTouches[0];

      return {
        x: touch.pageX,
        y: touch.pageY,
        isLeftMouse: true, // Touch is treated like a left mouse button click
        isMiddleMouse: false
      };
    }

    /**
     * Subscribes to a media query for device pixel ratio changes and forces
     * a repaint when it occurs.
     *
     * @return {Disposable} a disposable to remove the media query listener
     * @access private
     */
  }, {
    key: 'subscribeToMediaQuery',
    value: function subscribeToMediaQuery() {
      var _this9 = this;

      if (!Disposable) {
        var _require2 = require('atom');

        CompositeDisposable = _require2.CompositeDisposable;
        Disposable = _require2.Disposable;
      }

      var query = 'screen and (-webkit-min-device-pixel-ratio: 1.5)';
      var mediaQuery = window.matchMedia(query);
      var mediaListener = function mediaListener(e) {
        _this9.requestForcedUpdate();
      };
      mediaQuery.addListener(mediaListener);

      return new Disposable(function () {
        mediaQuery.removeListener(mediaListener);
      });
    }

    //    ########    ####    ########
    //    ##     ##  ##  ##   ##     ##
    //    ##     ##   ####    ##     ##
    //    ##     ##  ####     ##     ##
    //    ##     ## ##  ## ## ##     ##
    //    ##     ## ##   ##   ##     ##
    //    ########   ####  ## ########

    /**
     * A method triggered when the mouse is pressed over the visible area that
     * starts the dragging gesture.
     *
     * @param  {number} y the vertical coordinate of the event
     * @param  {boolean} isLeftMouse was the left mouse button pressed?
     * @param  {boolean} isMiddleMouse was the middle mouse button pressed?
     * @access private
     */
  }, {
    key: 'startDrag',
    value: function startDrag(_ref2) {
      var _this10 = this;

      var y = _ref2.y;
      var isLeftMouse = _ref2.isLeftMouse;
      var isMiddleMouse = _ref2.isMiddleMouse;

      if (!Disposable) {
        var _require3 = require('atom');

        CompositeDisposable = _require3.CompositeDisposable;
        Disposable = _require3.Disposable;
      }

      if (!this.minimap) {
        return;
      }
      if (!isLeftMouse && !isMiddleMouse) {
        return;
      }

      var _visibleArea$getBoundingClientRect2 = this.visibleArea.getBoundingClientRect();

      var top = _visibleArea$getBoundingClientRect2.top;

      var _getBoundingClientRect2 = this.getBoundingClientRect();

      var offsetTop = _getBoundingClientRect2.top;

      var dragOffset = y - top;

      var initial = { dragOffset: dragOffset, offsetTop: offsetTop };

      var mousemoveHandler = function mousemoveHandler(e) {
        return _this10.drag(_this10.extractMouseEventData(e), initial);
      };
      var mouseupHandler = function mouseupHandler(e) {
        return _this10.endDrag();
      };

      var touchmoveHandler = function touchmoveHandler(e) {
        return _this10.drag(_this10.extractTouchEventData(e), initial);
      };
      var touchendHandler = function touchendHandler(e) {
        return _this10.endDrag();
      };

      document.body.addEventListener('mousemove', mousemoveHandler);
      document.body.addEventListener('mouseup', mouseupHandler);
      document.body.addEventListener('mouseleave', mouseupHandler);

      document.body.addEventListener('touchmove', touchmoveHandler);
      document.body.addEventListener('touchend', touchendHandler);
      document.body.addEventListener('touchcancel', touchendHandler);

      this.dragSubscription = new Disposable(function () {
        document.body.removeEventListener('mousemove', mousemoveHandler);
        document.body.removeEventListener('mouseup', mouseupHandler);
        document.body.removeEventListener('mouseleave', mouseupHandler);

        document.body.removeEventListener('touchmove', touchmoveHandler);
        document.body.removeEventListener('touchend', touchendHandler);
        document.body.removeEventListener('touchcancel', touchendHandler);
      });
    }

    /**
     * The method called during the drag gesture.
     *
     * @param  {number} y the vertical coordinate of the event
     * @param  {boolean} isLeftMouse was the left mouse button pressed?
     * @param  {boolean} isMiddleMouse was the middle mouse button pressed?
     * @param  {number} initial.dragOffset the mouse offset within the visible
     *                                     area
     * @param  {number} initial.offsetTop the MinimapElement offset at the moment
     *                                    of the drag start
     * @access private
     */
  }, {
    key: 'drag',
    value: function drag(_ref3, initial) {
      var y = _ref3.y;
      var isLeftMouse = _ref3.isLeftMouse;
      var isMiddleMouse = _ref3.isMiddleMouse;

      if (!this.minimap) {
        return;
      }
      if (!isLeftMouse && !isMiddleMouse) {
        return;
      }
      var deltaY = y - initial.offsetTop - initial.dragOffset;

      var ratio = deltaY / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight());

      this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop());
    }

    /**
     * The method that ends the drag gesture.
     *
     * @access private
     */
  }, {
    key: 'endDrag',
    value: function endDrag() {
      if (!this.minimap) {
        return;
      }
      this.dragSubscription.dispose();
    }

    //     ######   ######   ######
    //    ##    ## ##    ## ##    ##
    //    ##       ##       ##
    //    ##        ######   ######
    //    ##             ##       ##
    //    ##    ## ##    ## ##    ##
    //     ######   ######   ######

    /**
     * Applies the passed-in styles properties to the specified element
     *
     * @param  {HTMLElement} element the element onto which apply the styles
     * @param  {Object} styles the styles to apply
     * @access private
     */
  }, {
    key: 'applyStyles',
    value: function applyStyles(element, styles) {
      if (!element) {
        return;
      }

      var cssText = '';
      for (var property in styles) {
        cssText += property + ': ' + styles[property] + '; ';
      }

      element.style.cssText = cssText;
    }

    /**
     * Returns a string with a CSS translation tranform value.
     *
     * @param  {number} [x = 0] the x offset of the translation
     * @param  {number} [y = 0] the y offset of the translation
     * @return {string} the CSS translation string
     * @access private
     */
  }, {
    key: 'makeTranslate',
    value: function makeTranslate() {
      var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      if (this.useHardwareAcceleration) {
        return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
      } else {
        return 'translate(' + x + 'px, ' + y + 'px)';
      }
    }

    /**
     * Returns a string with a CSS scaling tranform value.
     *
     * @param  {number} [x = 0] the x scaling factor
     * @param  {number} [y = 0] the y scaling factor
     * @return {string} the CSS scaling string
     * @access private
     */
  }, {
    key: 'makeScale',
    value: function makeScale() {
      var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var y = arguments.length <= 1 || arguments[1] === undefined ? x : arguments[1];
      return (function () {
        if (this.useHardwareAcceleration) {
          return 'scale3d(' + x + ', ' + y + ', 1)';
        } else {
          return 'scale(' + x + ', ' + y + ')';
        }
      }).apply(this, arguments);
    }

    /**
     * A method that return the current time as a Date.
     *
     * That method exist so that we can mock it in tests.
     *
     * @return {Date} the current time as Date
     * @access private
     */
  }, {
    key: 'getTime',
    value: function getTime() {
      return new Date();
    }

    /**
     * A method that mimic the jQuery `animate` method and used to animate the
     * scroll when clicking on the MinimapElement canvas.
     *
     * @param  {Object} param the animation data object
     * @param  {[type]} param.from the start value
     * @param  {[type]} param.to the end value
     * @param  {[type]} param.duration the animation duration
     * @param  {[type]} param.step the easing function for the animation
     * @access private
     */
  }, {
    key: 'animate',
    value: function animate(_ref4) {
      var _this11 = this;

      var from = _ref4.from;
      var to = _ref4.to;
      var duration = _ref4.duration;
      var step = _ref4.step;

      var start = this.getTime();
      var progress = undefined;

      var swing = function swing(progress) {
        return 0.5 - Math.cos(progress * Math.PI) / 2;
      };

      var update = function update() {
        if (!_this11.minimap) {
          return;
        }

        var passed = _this11.getTime() - start;
        if (duration === 0) {
          progress = 1;
        } else {
          progress = passed / duration;
        }
        if (progress > 1) {
          progress = 1;
        }
        var delta = swing(progress);
        var value = from + (to - from) * delta;
        step(value, delta);

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      update();
    }
  }]);

  var _MinimapElement = MinimapElement;
  MinimapElement = (0, _decoratorsInclude2['default'])(_mixinsDomStylesReader2['default'], _mixinsCanvasDrawer2['default'], _atomUtils.EventsDelegation, _atomUtils.AncestorsMethods)(MinimapElement) || MinimapElement;
  MinimapElement = (0, _decoratorsElement2['default'])('atom-text-editor-minimap')(MinimapElement) || MinimapElement;
  return MinimapElement;
})();

exports['default'] = MinimapElement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL21pbmltYXAtZWxlbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3lCQUVpRCxZQUFZOztxQ0FDakMsNEJBQTRCOzs7O2tDQUMvQix3QkFBd0I7Ozs7aUNBQzdCLHNCQUFzQjs7OztpQ0FDdEIsc0JBQXNCOzs7O0FBTjFDLFdBQVcsQ0FBQTs7QUFRWCxJQUFJLElBQUksWUFBQTtJQUFFLDJCQUEyQixZQUFBO0lBQUUsbUJBQW1CLFlBQUE7SUFBRSxVQUFVLFlBQUEsQ0FBQTs7QUFFdEUsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7OztJQWtCZCxjQUFjO1dBQWQsY0FBYzs7OztlQUFkLGNBQWM7Ozs7Ozs7Ozs7Ozs7Ozs7V0FlakIsMkJBQUc7OztBQUNqQixVQUFJLENBQUMsbUJBQW1CLEVBQUU7dUJBQ2EsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7QUFBbEQsMkJBQW1CLFlBQW5CLG1CQUFtQjtBQUFFLGtCQUFVLFlBQVYsVUFBVTtPQUNsQzs7Ozs7OztBQU9ELFVBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFBOzs7O0FBSXhCLFVBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFBOzs7O0FBSTlCLFVBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFBOzs7O0FBSXRCLFVBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFBOzs7Ozs7O0FBT3ZCLFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFBOzs7O0FBSTlDLFVBQUksQ0FBQyx1QkFBdUIsR0FBRyxTQUFTLENBQUE7Ozs7QUFJeEMsVUFBSSxDQUFDLHlCQUF5QixHQUFHLFNBQVMsQ0FBQTs7OztBQUkxQyxVQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFBOzs7O0FBSWpDLFVBQUksQ0FBQyw0QkFBNEIsR0FB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QUFBO1NBQzdCO0FBQ0QsWUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFO0FBQUUsa0JBQVEsR0FBRyxDQUFDLENBQUE7U0FBRTtBQUNsQyxZQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDN0IsWUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQSxHQUFJLEtBQUssQ0FBQTtBQUN4QyxZQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFBOztBQUVsQixZQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUU7QUFBRSwrQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUFFO09BQ3BELENBQUE7O0FBRUQsWUFBTSxFQUFFLENBQUE7S0FDVDs7O3dCQW4wQ2tCLGNBQWM7QUFBZCxnQkFBYyxHQURsQyxrS0FBMEUsQ0FDdEQsY0FBYyxLQUFkLGNBQWM7QUFBZCxnQkFBYyxHQUZsQyxvQ0FBUSwwQkFBMEIsQ0FBQyxDQUVmLGNBQWMsS0FBZCxjQUFjO1NBQWQsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWluaW1hcC1lbGVtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtFdmVudHNEZWxlZ2F0aW9uLCBBbmNlc3RvcnNNZXRob2RzfSBmcm9tICdhdG9tLXV0aWxzJ1xuaW1wb3J0IERPTVN0eWxlc1JlYWRlciBmcm9tICcuL21peGlucy9kb20tc3R5bGVzLXJlYWRlcidcbmltcG9ydCBDYW52YXNEcmF3ZXIgZnJvbSAnLi9taXhpbnMvY2FudmFzLWRyYXdlcidcbmltcG9ydCBpbmNsdWRlIGZyb20gJy4vZGVjb3JhdG9ycy9pbmNsdWRlJ1xuaW1wb3J0IGVsZW1lbnQgZnJvbSAnLi9kZWNvcmF0b3JzL2VsZW1lbnQnXG5cbmxldCBNYWluLCBNaW5pbWFwUXVpY2tTZXR0aW5nc0VsZW1lbnQsIENvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGVcblxuY29uc3QgU1BFQ19NT0RFID0gYXRvbS5pblNwZWNNb2RlKClcblxuLyoqXG4gKiBQdWJsaWM6IFRoZSBNaW5pbWFwRWxlbWVudCBpcyB0aGUgdmlldyBtZWFudCB0byByZW5kZXIgYSB7QGxpbmsgTWluaW1hcH1cbiAqIGluc3RhbmNlIGluIHRoZSBET00uXG4gKlxuICogWW91IGNhbiByZXRyaWV2ZSB0aGUgTWluaW1hcEVsZW1lbnQgYXNzb2NpYXRlZCB0byBhIE1pbmltYXBcbiAqIHVzaW5nIHRoZSBgYXRvbS52aWV3cy5nZXRWaWV3YCBtZXRob2QuXG4gKlxuICogTm90ZSB0aGF0IG1vc3QgaW50ZXJhY3Rpb25zIHdpdGggdGhlIE1pbmltYXAgcGFja2FnZSBpcyBkb25lIHRocm91Z2ggdGhlXG4gKiBNaW5pbWFwIG1vZGVsIHNvIHlvdSBzaG91bGQgbmV2ZXIgaGF2ZSB0byBhY2Nlc3MgTWluaW1hcEVsZW1lbnRcbiAqIGluc3RhbmNlcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogbGV0IG1pbmltYXBFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KG1pbmltYXApXG4gKi9cbkBlbGVtZW50KCdhdG9tLXRleHQtZWRpdG9yLW1pbmltYXAnKVxuQGluY2x1ZGUoRE9NU3R5bGVzUmVhZGVyLCBDYW52YXNEcmF3ZXIsIEV2ZW50c0RlbGVnYXRpb24sIEFuY2VzdG9yc01ldGhvZHMpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaW5pbWFwRWxlbWVudCB7XG5cbiAgLy8gICAgIyMgICAgICMjICAjIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgICMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICMjICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgIyMgICAjI1xuICAvLyAgICAjIyMjIyMjIyMgIyMgICAgICMjICMjICAgICAjIyAjIyMjIyAgICAgIyMjIyMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAjIyAgICAgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgIyMgICMjICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICAjIyMjIyNcblxuICAvKipcbiAgICogRE9NIGNhbGxiYWNrIGludm9rZWQgd2hlbiBhIG5ldyBNaW5pbWFwRWxlbWVudCBpcyBjcmVhdGVkLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNyZWF0ZWRDYWxsYmFjayAoKSB7XG4gICAgaWYgKCFDb21wb3NpdGVEaXNwb3NhYmxlKSB7XG4gICAgICAoe0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpKVxuICAgIH1cblxuICAgIC8vIENvcmUgcHJvcGVydGllc1xuXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5taW5pbWFwID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5lZGl0b3JFbGVtZW50ID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy53aWR0aCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuaGVpZ2h0ID0gdW5kZWZpbmVkXG5cbiAgICAvLyBTdWJzY3JpcHRpb25zXG5cbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy52aXNpYmxlQXJlYVN1YnNjcmlwdGlvbiA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMucXVpY2tTZXR0aW5nc1N1YnNjcmlwdGlvbiA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZHJhZ1N1YnNjcmlwdGlvbiA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ1N1YnNjcmlwdGlvbiA9IHVuZGVmaW5lZFxuXG4gICAgLy8gQ29uZmlnc1xuXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuZGlzcGxheU1pbmltYXBPbkxlZnQgPSBmYWxzZVxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLm1pbmltYXBTY3JvbGxJbmRpY2F0b3IgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5kaXNwbGF5TWluaW1hcE9uTGVmdCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy50ZXh0T3BhY2l0eSA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cyA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmFkanVzdFRvU29mdFdyYXAgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbiA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmFic29sdXRlTW9kZSA9IHVuZGVmaW5lZFxuXG4gICAgLy8gRWxlbWVudHNcblxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuc2hhZG93Um9vdCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMudmlzaWJsZUFyZWEgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmNvbnRyb2xzID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5zY3JvbGxJbmRpY2F0b3IgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdzID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudCA9IHVuZGVmaW5lZFxuXG4gICAgLy8gU3RhdGVzXG5cbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5hdHRhY2hlZCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmF0dGFjaGVkVG9UZXh0RWRpdG9yID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuc3RhbmRBbG9uZSA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMud2FzVmlzaWJsZSA9IHVuZGVmaW5lZFxuXG4gICAgLy8gT3RoZXJcblxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMub2Zmc2NyZWVuRmlyc3RSb3cgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNjcmVlbkxhc3RSb3cgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmZyYW1lUmVxdWVzdGVkID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5mbGV4QmFzaXMgPSB1bmRlZmluZWRcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUNvbnRlbnQoKVxuXG4gICAgcmV0dXJuIHRoaXMub2JzZXJ2ZUNvbmZpZyh7XG4gICAgICAnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCc6IChkaXNwbGF5TWluaW1hcE9uTGVmdCkgPT4ge1xuICAgICAgICB0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0ID0gZGlzcGxheU1pbmltYXBPbkxlZnRcblxuICAgICAgICB0aGlzLnVwZGF0ZU1pbmltYXBGbGV4UG9zaXRpb24oKVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAubWluaW1hcFNjcm9sbEluZGljYXRvcic6IChtaW5pbWFwU2Nyb2xsSW5kaWNhdG9yKSA9PiB7XG4gICAgICAgIHRoaXMubWluaW1hcFNjcm9sbEluZGljYXRvciA9IG1pbmltYXBTY3JvbGxJbmRpY2F0b3JcblxuICAgICAgICBpZiAodGhpcy5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yICYmICEodGhpcy5zY3JvbGxJbmRpY2F0b3IgIT0gbnVsbCkgJiYgIXRoaXMuc3RhbmRBbG9uZSkge1xuICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZVNjcm9sbEluZGljYXRvcigpXG4gICAgICAgIH0gZWxzZSBpZiAoKHRoaXMuc2Nyb2xsSW5kaWNhdG9yICE9IG51bGwpKSB7XG4gICAgICAgICAgdGhpcy5kaXNwb3NlU2Nyb2xsSW5kaWNhdG9yKClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnOiAoZGlzcGxheVBsdWdpbnNDb250cm9scykgPT4ge1xuICAgICAgICB0aGlzLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMgPSBkaXNwbGF5UGx1Z2luc0NvbnRyb2xzXG5cbiAgICAgICAgaWYgKHRoaXMuZGlzcGxheVBsdWdpbnNDb250cm9scyAmJiAhKHRoaXMub3BlblF1aWNrU2V0dGluZ3MgIT0gbnVsbCkgJiYgIXRoaXMuc3RhbmRBbG9uZSkge1xuICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZU9wZW5RdWlja1NldHRpbmdzKClcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5vcGVuUXVpY2tTZXR0aW5ncyAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMuZGlzcG9zZU9wZW5RdWlja1NldHRpbmdzKClcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAudGV4dE9wYWNpdHknOiAodGV4dE9wYWNpdHkpID0+IHtcbiAgICAgICAgdGhpcy50ZXh0T3BhY2l0eSA9IHRleHRPcGFjaXR5XG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAuZGlzcGxheUNvZGVIaWdobGlnaHRzJzogKGRpc3BsYXlDb2RlSGlnaGxpZ2h0cykgPT4ge1xuICAgICAgICB0aGlzLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cyA9IGRpc3BsYXlDb2RlSGlnaGxpZ2h0c1xuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLnNtb290aFNjcm9sbGluZyc6IChzbW9vdGhTY3JvbGxpbmcpID0+IHtcbiAgICAgICAgdGhpcy5zbW9vdGhTY3JvbGxpbmcgPSBzbW9vdGhTY3JvbGxpbmdcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkge1xuICAgICAgICAgIGlmICghdGhpcy5zbW9vdGhTY3JvbGxpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuYmFja0xheWVyLmNhbnZhcy5zdHlsZS5jc3NUZXh0ID0gJydcbiAgICAgICAgICAgIHRoaXMudG9rZW5zTGF5ZXIuY2FudmFzLnN0eWxlLmNzc1RleHQgPSAnJ1xuICAgICAgICAgICAgdGhpcy5mcm9udExheWVyLmNhbnZhcy5zdHlsZS5jc3NUZXh0ID0gJydcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmFkanVzdE1pbmltYXBXaWR0aFRvU29mdFdyYXAnOiAoYWRqdXN0VG9Tb2Z0V3JhcCkgPT4ge1xuICAgICAgICB0aGlzLmFkanVzdFRvU29mdFdyYXAgPSBhZGp1c3RUb1NvZnRXcmFwXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKSB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5hZGp1c3RNaW5pbWFwV2lkdGhPbmx5SWZTbWFsbGVyJzogKGFkanVzdE9ubHlJZlNtYWxsZXIpID0+IHtcbiAgICAgICAgdGhpcy5hZGp1c3RPbmx5SWZTbWFsbGVyID0gYWRqdXN0T25seUlmU21hbGxlclxuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMubWVhc3VyZUhlaWdodEFuZFdpZHRoKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24nOiAodXNlSGFyZHdhcmVBY2NlbGVyYXRpb24pID0+IHtcbiAgICAgICAgdGhpcy51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbiA9IHVzZUhhcmR3YXJlQWNjZWxlcmF0aW9uXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0VXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAuYWJzb2x1dGVNb2RlJzogKGFic29sdXRlTW9kZSkgPT4ge1xuICAgICAgICB0aGlzLmFic29sdXRlTW9kZSA9IGFic29sdXRlTW9kZVxuXG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnYWJzb2x1dGUnLCB0aGlzLmFic29sdXRlTW9kZSlcbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCc6IChhZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQpID0+IHtcbiAgICAgICAgdGhpcy5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQgPSBhZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHRcblxuICAgICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2FkanVzdC1hYnNvbHV0ZS1oZWlnaHQnLCB0aGlzLmFkanVzdEFic29sdXRlTW9kZUhlaWdodClcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmlnbm9yZVdoaXRlc3BhY2VzSW5Ub2tlbnMnOiAoaWdub3JlV2hpdGVzcGFjZXNJblRva2VucykgPT4ge1xuICAgICAgICB0aGlzLmlnbm9yZVdoaXRlc3BhY2VzSW5Ub2tlbnMgPSBpZ25vcmVXaGl0ZXNwYWNlc0luVG9rZW5zXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJzogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3Iuc29mdFdyYXAnOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3Iuc2hvd0ludmlzaWJsZXMnOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3IuaW52aXNpYmxlcyc6ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0VXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ2VkaXRvci5zb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCc6ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0VXBkYXRlKCkgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogRE9NIGNhbGxiYWNrIGludm9rZWQgd2hlbiBhIG5ldyBNaW5pbWFwRWxlbWVudCBpcyBhdHRhY2hlZCB0byB0aGUgRE9NLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGF0dGFjaGVkQ2FsbGJhY2sgKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS52aWV3cy5wb2xsRG9jdW1lbnQoKCkgPT4geyB0aGlzLnBvbGxET00oKSB9KSlcbiAgICB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpXG4gICAgdGhpcy51cGRhdGVNaW5pbWFwRmxleFBvc2l0aW9uKClcbiAgICB0aGlzLmF0dGFjaGVkID0gdHJ1ZVxuICAgIHRoaXMuYXR0YWNoZWRUb1RleHRFZGl0b3IgPSB0aGlzLnBhcmVudE5vZGUgPT09IHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290KClcblxuICAgIGlmICh0aGlzLmF0dGFjaGVkVG9UZXh0RWRpdG9yKSB7XG4gICAgICB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50KCkuc2V0QXR0cmlidXRlKCd3aXRoLW1pbmltYXAnLCAnJylcbiAgICB9XG5cbiAgICAvKlxuICAgICAgV2UgdXNlIGBhdG9tLnN0eWxlcy5vbkRpZEFkZFN0eWxlRWxlbWVudGAgaW5zdGVhZCBvZlxuICAgICAgYGF0b20udGhlbWVzLm9uRGlkQ2hhbmdlQWN0aXZlVGhlbWVzYC5cbiAgICAgIFdoeT8gQ3VycmVudGx5LCBUaGUgc3R5bGUgZWxlbWVudCB3aWxsIGJlIHJlbW92ZWQgZmlyc3QsIGFuZCB0aGVuIHJlLWFkZGVkXG4gICAgICBhbmQgdGhlIGBjaGFuZ2VgIGV2ZW50IGhhcyBub3QgYmUgdHJpZ2dlcmVkIGluIHRoZSBwcm9jZXNzLlxuICAgICovXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLnN0eWxlcy5vbkRpZEFkZFN0eWxlRWxlbWVudCgoKSA9PiB7XG4gICAgICB0aGlzLmludmFsaWRhdGVET01TdHlsZXNDYWNoZSgpXG4gICAgICB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnN1YnNjcmliZVRvTWVkaWFRdWVyeSgpKVxuICB9XG5cbiAgLyoqXG4gICAqIERPTSBjYWxsYmFjayBpbnZva2VkIHdoZW4gYSBuZXcgTWluaW1hcEVsZW1lbnQgaXMgZGV0YWNoZWQgZnJvbSB0aGUgRE9NLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRldGFjaGVkQ2FsbGJhY2sgKCkge1xuICAgIHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKS5yZW1vdmVBdHRyaWJ1dGUoJ3dpdGgtbWluaW1hcCcpXG4gICAgdGhpcy5hdHRhY2hlZCA9IGZhbHNlXG4gIH1cblxuICAvLyAgICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyMgICAgIyMjICAgICAjIyMjIyMgICMjICAgICAjI1xuICAvLyAgICAgICMjICMjICAgICAgIyMgICAgICAgIyMgICAgICAjIyAjIyAgICMjICAgICMjICMjICAgICAjI1xuICAvLyAgICAgIyMgICAjIyAgICAgIyMgICAgICAgIyMgICAgICMjICAgIyMgICMjICAgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICMjICAgICAgICMjIyMjIyMjI1xuICAvLyAgICAjIyMjIyMjIyMgICAgIyMgICAgICAgIyMgICAgIyMjIyMjIyMjICMjICAgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICMjICAgICMjICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICAjIyMjIyMgICMjICAgICAjI1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIE1pbmltYXBFbGVtZW50IGlzIGN1cnJlbnRseSB2aXNpYmxlIG9uIHNjcmVlbiBvciBub3QuXG4gICAqXG4gICAqIFRoZSB2aXNpYmlsaXR5IG9mIHRoZSBtaW5pbWFwIGlzIGRlZmluZWQgYnkgdGVzdGluZyB0aGUgc2l6ZSBvZiB0aGUgb2Zmc2V0XG4gICAqIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIGVsZW1lbnQuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgdGhlIE1pbmltYXBFbGVtZW50IGlzIGN1cnJlbnRseSB2aXNpYmxlIG9yIG5vdFxuICAgKi9cbiAgaXNWaXNpYmxlICgpIHsgcmV0dXJuIHRoaXMub2Zmc2V0V2lkdGggPiAwIHx8IHRoaXMub2Zmc2V0SGVpZ2h0ID4gMCB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIHRoZSBNaW5pbWFwRWxlbWVudCB0byB0aGUgRE9NLlxuICAgKlxuICAgKiBUaGUgcG9zaXRpb24gYXQgd2hpY2ggdGhlIGVsZW1lbnQgaXMgYXR0YWNoZWQgaXMgZGVmaW5lZCBieSB0aGVcbiAgICogYGRpc3BsYXlNaW5pbWFwT25MZWZ0YCBzZXR0aW5nLlxuICAgKlxuICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gW3BhcmVudF0gdGhlIERPTSBub2RlIHdoZXJlIGF0dGFjaGluZyB0aGUgbWluaW1hcFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFxuICAgKi9cbiAgYXR0YWNoIChwYXJlbnQpIHtcbiAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyByZXR1cm4gfVxuXG4gICAgY29uc3QgY29udGFpbmVyID0gcGFyZW50IHx8IHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290KClcbiAgICBsZXQgbWluaW1hcHMgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwJylcbiAgICBpZiAobWluaW1hcHMubGVuZ3RoKSB7XG4gICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKG1pbmltYXBzLCAoZWwpID0+IHsgZWwuZGVzdHJveSgpIH0pXG4gICAgfVxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzKVxuICB9XG5cbiAgLyoqXG4gICAqIERldGFjaGVzIHRoZSBNaW5pbWFwRWxlbWVudCBmcm9tIHRoZSBET00uXG4gICAqL1xuICBkZXRhY2ggKCkge1xuICAgIGlmICghdGhpcy5hdHRhY2hlZCB8fCB0aGlzLnBhcmVudE5vZGUgPT0gbnVsbCkgeyByZXR1cm4gfVxuICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKVxuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIG1pbmltYXAgbGVmdC9yaWdodCBwb3NpdGlvbiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhlXG4gICAqIGBkaXNwbGF5TWluaW1hcE9uTGVmdGAgc2V0dGluZy5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVNaW5pbWFwRmxleFBvc2l0aW9uICgpIHtcbiAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2xlZnQnLCB0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0KVxuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoaXMgTWluaW1hcEVsZW1lbnRcbiAgICovXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLmRldGFjaCgpXG4gICAgdGhpcy5taW5pbWFwID0gbnVsbFxuICB9XG5cbiAgLy8gICAgICMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICMjIyMjIyMjICMjIyMjIyMjICMjICAgICMjICMjIyMjIyMjXG4gIC8vICAgICMjICAgICMjICMjICAgICAjIyAjIyMgICAjIyAgICAjIyAgICAjIyAgICAgICAjIyMgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMjIyAgIyMgICAgIyMgICAgIyMgICAgICAgIyMjIyAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICMjICMjICAgICMjICAgICMjIyMjIyAgICMjICMjICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAgIyMjIyAgICAjIyAgICAjIyAgICAgICAjIyAgIyMjIyAgICAjI1xuICAvLyAgICAjIyAgICAjIyAjIyAgICAgIyMgIyMgICAjIyMgICAgIyMgICAgIyMgICAgICAgIyMgICAjIyMgICAgIyNcbiAgLy8gICAgICMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICAgICMjICAgICMjIyMjIyMjICMjICAgICMjICAgICMjXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIGNvbnRlbnQgb2YgdGhlIE1pbmltYXBFbGVtZW50IGFuZCBhdHRhY2hlcyB0aGUgbW91c2UgY29udHJvbFxuICAgKiBldmVudCBsaXN0ZW5lcnMuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZUNvbnRlbnQgKCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZUNhbnZhcygpXG5cbiAgICB0aGlzLnNoYWRvd1Jvb3QgPSB0aGlzLmNyZWF0ZVNoYWRvd1Jvb3QoKVxuICAgIHRoaXMuYXR0YWNoQ2FudmFzZXModGhpcy5zaGFkb3dSb290KVxuXG4gICAgdGhpcy5jcmVhdGVWaXNpYmxlQXJlYSgpXG4gICAgdGhpcy5jcmVhdGVDb250cm9scygpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuc3Vic2NyaWJlVG8odGhpcywge1xuICAgICAgJ21vdXNld2hlZWwnOiAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3RhbmRBbG9uZSkge1xuICAgICAgICAgIHRoaXMucmVsYXlNb3VzZXdoZWVsRXZlbnQoZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnN1YnNjcmliZVRvKHRoaXMuZ2V0RnJvbnRDYW52YXMoKSwge1xuICAgICAgJ21vdXNlZG93bic6IChlKSA9PiB7IHRoaXMuY2FudmFzUHJlc3NlZCh0aGlzLmV4dHJhY3RNb3VzZUV2ZW50RGF0YShlKSkgfSxcbiAgICAgICd0b3VjaHN0YXJ0JzogKGUpID0+IHsgdGhpcy5jYW52YXNQcmVzc2VkKHRoaXMuZXh0cmFjdFRvdWNoRXZlbnREYXRhKGUpKSB9XG4gICAgfSkpXG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHZpc2libGUgYXJlYSBkaXYuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlVmlzaWJsZUFyZWEgKCkge1xuICAgIGlmICh0aGlzLnZpc2libGVBcmVhKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLnZpc2libGVBcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLnZpc2libGVBcmVhLmNsYXNzTGlzdC5hZGQoJ21pbmltYXAtdmlzaWJsZS1hcmVhJylcbiAgICB0aGlzLnNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQodGhpcy52aXNpYmxlQXJlYSlcbiAgICB0aGlzLnZpc2libGVBcmVhU3Vic2NyaXB0aW9uID0gdGhpcy5zdWJzY3JpYmVUbyh0aGlzLnZpc2libGVBcmVhLCB7XG4gICAgICAnbW91c2Vkb3duJzogKGUpID0+IHsgdGhpcy5zdGFydERyYWcodGhpcy5leHRyYWN0TW91c2VFdmVudERhdGEoZSkpIH0sXG4gICAgICAndG91Y2hzdGFydCc6IChlKSA9PiB7IHRoaXMuc3RhcnREcmFnKHRoaXMuZXh0cmFjdFRvdWNoRXZlbnREYXRhKGUpKSB9XG4gICAgfSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy52aXNpYmxlQXJlYVN1YnNjcmlwdGlvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSB2aXNpYmxlIGFyZWEgZGl2LlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHJlbW92ZVZpc2libGVBcmVhICgpIHtcbiAgICBpZiAoIXRoaXMudmlzaWJsZUFyZWEpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5yZW1vdmUodGhpcy52aXNpYmxlQXJlYVN1YnNjcmlwdGlvbilcbiAgICB0aGlzLnZpc2libGVBcmVhU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIHRoaXMuc2hhZG93Um9vdC5yZW1vdmVDaGlsZCh0aGlzLnZpc2libGVBcmVhKVxuICAgIGRlbGV0ZSB0aGlzLnZpc2libGVBcmVhXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgY29udHJvbHMgY29udGFpbmVyIGRpdi5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVDb250cm9scyAoKSB7XG4gICAgaWYgKHRoaXMuY29udHJvbHMgfHwgdGhpcy5zdGFuZEFsb25lKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLmNvbnRyb2xzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLmNvbnRyb2xzLmNsYXNzTGlzdC5hZGQoJ21pbmltYXAtY29udHJvbHMnKVxuICAgIHRoaXMuc2hhZG93Um9vdC5hcHBlbmRDaGlsZCh0aGlzLmNvbnRyb2xzKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGNvbnRyb2xzIGNvbnRhaW5lciBkaXYuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgcmVtb3ZlQ29udHJvbHMgKCkge1xuICAgIGlmICghdGhpcy5jb250cm9scykgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5zaGFkb3dSb290LnJlbW92ZUNoaWxkKHRoaXMuY29udHJvbHMpXG4gICAgZGVsZXRlIHRoaXMuY29udHJvbHNcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgc2Nyb2xsIGluZGljYXRvciBkaXYgd2hlbiB0aGUgYG1pbmltYXBTY3JvbGxJbmRpY2F0b3JgXG4gICAqIHNldHRpbmdzIGlzIGVuYWJsZWQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZVNjcm9sbEluZGljYXRvciAoKSB7XG4gICAgaWYgKHRoaXMuc2Nyb2xsSW5kaWNhdG9yIHx8IHRoaXMuc3RhbmRBbG9uZSkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5zY3JvbGxJbmRpY2F0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMuc2Nyb2xsSW5kaWNhdG9yLmNsYXNzTGlzdC5hZGQoJ21pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpXG4gICAgdGhpcy5jb250cm9scy5hcHBlbmRDaGlsZCh0aGlzLnNjcm9sbEluZGljYXRvcilcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlcyB0aGUgc2Nyb2xsIGluZGljYXRvciBkaXYgd2hlbiB0aGUgYG1pbmltYXBTY3JvbGxJbmRpY2F0b3JgXG4gICAqIHNldHRpbmdzIGlzIGRpc2FibGVkLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRpc3Bvc2VTY3JvbGxJbmRpY2F0b3IgKCkge1xuICAgIGlmICghdGhpcy5zY3JvbGxJbmRpY2F0b3IpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuY29udHJvbHMucmVtb3ZlQ2hpbGQodGhpcy5zY3JvbGxJbmRpY2F0b3IpXG4gICAgZGVsZXRlIHRoaXMuc2Nyb2xsSW5kaWNhdG9yXG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHF1aWNrIHNldHRpbmdzIG9wZW5lbmVyIGRpdiB3aGVuIHRoZVxuICAgKiBgZGlzcGxheVBsdWdpbnNDb250cm9sc2Agc2V0dGluZyBpcyBlbmFibGVkLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGluaXRpYWxpemVPcGVuUXVpY2tTZXR0aW5ncyAoKSB7XG4gICAgaWYgKHRoaXMub3BlblF1aWNrU2V0dGluZ3MgfHwgdGhpcy5zdGFuZEFsb25lKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdzLmNsYXNzTGlzdC5hZGQoJ29wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgdGhpcy5jb250cm9scy5hcHBlbmRDaGlsZCh0aGlzLm9wZW5RdWlja1NldHRpbmdzKVxuXG4gICAgdGhpcy5vcGVuUXVpY2tTZXR0aW5nU3Vic2NyaXB0aW9uID0gdGhpcy5zdWJzY3JpYmVUbyh0aGlzLm9wZW5RdWlja1NldHRpbmdzLCB7XG4gICAgICAnbW91c2Vkb3duJzogKGUpID0+IHtcbiAgICAgICAgaWYgKCFNaW5pbWFwUXVpY2tTZXR0aW5nc0VsZW1lbnQpIHtcbiAgICAgICAgICBNaW5pbWFwUXVpY2tTZXR0aW5nc0VsZW1lbnQgPSByZXF1aXJlKCcuL21pbmltYXAtcXVpY2stc2V0dGluZ3MtZWxlbWVudCcpXG4gICAgICAgIH1cblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICAgIGlmICgodGhpcy5xdWlja1NldHRpbmdzRWxlbWVudCAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuZGVzdHJveSgpXG4gICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQgPSBuZXcgTWluaW1hcFF1aWNrU2V0dGluZ3NFbGVtZW50KClcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnNldE1vZGVsKHRoaXMpXG4gICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzU3Vic2NyaXB0aW9uID0gdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudC5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudCA9IG51bGxcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgbGV0IHt0b3AsIGxlZnQsIHJpZ2h0fSA9IHRoaXMuZ2V0RnJvbnRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuc3R5bGUudG9wID0gdG9wICsgJ3B4J1xuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuYXR0YWNoKClcblxuICAgICAgICAgIGlmICh0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0KSB7XG4gICAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnN0eWxlLmxlZnQgPSAocmlnaHQpICsgJ3B4J1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnN0eWxlLmxlZnQgPSAobGVmdCAtIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuY2xpZW50V2lkdGgpICsgJ3B4J1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgdGhlIHF1aWNrIHNldHRpbmdzIG9wZW5lbmVyIGRpdiB3aGVuIHRoZSBgZGlzcGxheVBsdWdpbnNDb250cm9sc2BcbiAgICogc2V0dGluZyBpcyBkaXNhYmxlZC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkaXNwb3NlT3BlblF1aWNrU2V0dGluZ3MgKCkge1xuICAgIGlmICghdGhpcy5vcGVuUXVpY2tTZXR0aW5ncykgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5jb250cm9scy5yZW1vdmVDaGlsZCh0aGlzLm9wZW5RdWlja1NldHRpbmdzKVxuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICBkZWxldGUgdGhpcy5vcGVuUXVpY2tTZXR0aW5nc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHRhcmdldCBgVGV4dEVkaXRvcmAgb2YgdGhlIE1pbmltYXAuXG4gICAqXG4gICAqIEByZXR1cm4ge1RleHRFZGl0b3J9IHRoZSBtaW5pbWFwJ3MgdGV4dCBlZGl0b3JcbiAgICovXG4gIGdldFRleHRFZGl0b3IgKCkgeyByZXR1cm4gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3IoKSB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGBUZXh0RWRpdG9yRWxlbWVudGAgZm9yIHRoZSBNaW5pbWFwJ3MgYFRleHRFZGl0b3JgLlxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXh0RWRpdG9yRWxlbWVudH0gdGhlIG1pbmltYXAncyB0ZXh0IGVkaXRvciBlbGVtZW50XG4gICAqL1xuICBnZXRUZXh0RWRpdG9yRWxlbWVudCAoKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yRWxlbWVudCkgeyByZXR1cm4gdGhpcy5lZGl0b3JFbGVtZW50IH1cblxuICAgIHRoaXMuZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLmdldFRleHRFZGl0b3IoKSlcbiAgICByZXR1cm4gdGhpcy5lZGl0b3JFbGVtZW50XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcm9vdCBvZiB0aGUgYFRleHRFZGl0b3JFbGVtZW50YCBjb250ZW50LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBtb3N0bHkgdXNlZCB0byBlbnN1cmUgY29tcGF0aWJpbGl0eSB3aXRoIHRoZSBgc2hhZG93RG9tYFxuICAgKiBzZXR0aW5nLlxuICAgKlxuICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gdGhlIHJvb3Qgb2YgdGhlIGBUZXh0RWRpdG9yRWxlbWVudGAgY29udGVudFxuICAgKi9cbiAgZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290ICgpIHtcbiAgICBsZXQgZWRpdG9yRWxlbWVudCA9IHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKVxuXG4gICAgaWYgKGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdCkge1xuICAgICAgcmV0dXJuIGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZWRpdG9yRWxlbWVudFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByb290IHdoZXJlIHRvIGluamVjdCB0aGUgZHVtbXkgbm9kZSB1c2VkIHRvIHJlYWQgRE9NIHN0eWxlcy5cbiAgICpcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gc2hhZG93Um9vdCB3aGV0aGVyIHRvIHVzZSB0aGUgdGV4dCBlZGl0b3Igc2hhZG93IERPTVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yIG5vdFxuICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gdGhlIHJvb3Qgbm9kZSB3aGVyZSBhcHBlbmRpbmcgdGhlIGR1bW15IG5vZGVcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBnZXREdW1teURPTVJvb3QgKHNoYWRvd1Jvb3QpIHtcbiAgICBpZiAoc2hhZG93Um9vdCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290KClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKVxuICAgIH1cbiAgfVxuXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyMjICMjXG4gIC8vICAgICMjIyAgICMjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjIyMgIyMjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjICMjIyAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjIyMjIyAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIE1pbmltYXAgZm9yIHdoaWNoIHRoaXMgTWluaW1hcEVsZW1lbnQgd2FzIGNyZWF0ZWQuXG4gICAqXG4gICAqIEByZXR1cm4ge01pbmltYXB9IHRoaXMgZWxlbWVudCdzIE1pbmltYXBcbiAgICovXG4gIGdldE1vZGVsICgpIHsgcmV0dXJuIHRoaXMubWluaW1hcCB9XG5cbiAgLyoqXG4gICAqIERlZmluZXMgdGhlIE1pbmltYXAgbW9kZWwgZm9yIHRoaXMgTWluaW1hcEVsZW1lbnQgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSAge01pbmltYXB9IG1pbmltYXAgdGhlIE1pbmltYXAgbW9kZWwgZm9yIHRoaXMgaW5zdGFuY2UuXG4gICAqIEByZXR1cm4ge01pbmltYXB9IHRoaXMgZWxlbWVudCdzIE1pbmltYXBcbiAgICovXG4gIHNldE1vZGVsIChtaW5pbWFwKSB7XG4gICAgaWYgKCFNYWluKSB7IE1haW4gPSByZXF1aXJlKCcuL21haW4nKSB9XG5cbiAgICB0aGlzLm1pbmltYXAgPSBtaW5pbWFwXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VTY3JvbGxUb3AoKCkgPT4ge1xuICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubWluaW1hcC5vbkRpZENoYW5nZVNjcm9sbExlZnQoKCkgPT4ge1xuICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubWluaW1hcC5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgdGhpcy5kZXN0cm95KClcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubWluaW1hcC5vbkRpZENoYW5nZUNvbmZpZygoKSA9PiB7XG4gICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyByZXR1cm4gdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VTdGFuZEFsb25lKCgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhbmRBbG9uZSh0aGlzLm1pbmltYXAuaXNTdGFuZEFsb25lKCkpXG4gICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2UoKGNoYW5nZSkgPT4ge1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcy5wdXNoKGNoYW5nZSlcbiAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubWluaW1hcC5vbkRpZENoYW5nZURlY29yYXRpb25SYW5nZSgoY2hhbmdlKSA9PiB7XG4gICAgICBjb25zdCB7dHlwZX0gPSBjaGFuZ2VcbiAgICAgIGlmICh0eXBlID09PSAnbGluZScgfHwgdHlwZSA9PT0gJ2hpZ2hsaWdodC11bmRlcicgfHwgdHlwZSA9PT0gJ2JhY2tncm91bmQtY3VzdG9tJykge1xuICAgICAgICB0aGlzLnBlbmRpbmdCYWNrRGVjb3JhdGlvbkNoYW5nZXMucHVzaChjaGFuZ2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBlbmRpbmdGcm9udERlY29yYXRpb25DaGFuZ2VzLnB1c2goY2hhbmdlKVxuICAgICAgfVxuICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoTWFpbi5vbkRpZENoYW5nZVBsdWdpbk9yZGVyKCgpID0+IHtcbiAgICAgIHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnNldFN0YW5kQWxvbmUodGhpcy5taW5pbWFwLmlzU3RhbmRBbG9uZSgpKVxuXG4gICAgaWYgKHRoaXMud2lkdGggIT0gbnVsbCAmJiB0aGlzLmhlaWdodCAhPSBudWxsKSB7XG4gICAgICB0aGlzLm1pbmltYXAuc2V0U2NyZWVuSGVpZ2h0QW5kV2lkdGgodGhpcy5oZWlnaHQsIHRoaXMud2lkdGgpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubWluaW1hcFxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHN0YW5kLWFsb25lIG1vZGUgZm9yIHRoaXMgTWluaW1hcEVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc3RhbmRBbG9uZSB0aGUgbmV3IG1vZGUgZm9yIHRoaXMgTWluaW1hcEVsZW1lbnRcbiAgICovXG4gIHNldFN0YW5kQWxvbmUgKHN0YW5kQWxvbmUpIHtcbiAgICB0aGlzLnN0YW5kQWxvbmUgPSBzdGFuZEFsb25lXG5cbiAgICBpZiAodGhpcy5zdGFuZEFsb25lKSB7XG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnc3RhbmQtYWxvbmUnLCB0cnVlKVxuICAgICAgdGhpcy5kaXNwb3NlU2Nyb2xsSW5kaWNhdG9yKClcbiAgICAgIHRoaXMuZGlzcG9zZU9wZW5RdWlja1NldHRpbmdzKClcbiAgICAgIHRoaXMucmVtb3ZlQ29udHJvbHMoKVxuICAgICAgdGhpcy5yZW1vdmVWaXNpYmxlQXJlYSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdzdGFuZC1hbG9uZScpXG4gICAgICB0aGlzLmNyZWF0ZVZpc2libGVBcmVhKClcbiAgICAgIHRoaXMuY3JlYXRlQ29udHJvbHMoKVxuICAgICAgaWYgKHRoaXMubWluaW1hcFNjcm9sbEluZGljYXRvcikgeyB0aGlzLmluaXRpYWxpemVTY3JvbGxJbmRpY2F0b3IoKSB9XG4gICAgICBpZiAodGhpcy5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzKSB7IHRoaXMuaW5pdGlhbGl6ZU9wZW5RdWlja1NldHRpbmdzKCkgfVxuICAgIH1cbiAgfVxuXG4gIC8vICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMjIyMgICAgICMjIyAgICAjIyMjIyMjIyAjIyMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgICMjICMjICAgICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgICMjICAgIyMgICAgICMjICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMgICAgICMjICMjICAgICAjIyAgICAjIyAgICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMjIyMjIyMjICAgICMjICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgICAgIyMgICAgICMjICMjICAgICAjIyAgICAjIyAgICAjI1xuICAvLyAgICAgIyMjIyMjIyAgIyMgICAgICAgICMjIyMjIyMjICAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjIyNcblxuICAvKipcbiAgICogUmVxdWVzdHMgYW4gdXBkYXRlIHRvIGJlIHBlcmZvcm1lZCBvbiB0aGUgbmV4dCBmcmFtZS5cbiAgICovXG4gIHJlcXVlc3RVcGRhdGUgKCkge1xuICAgIGlmICh0aGlzLmZyYW1lUmVxdWVzdGVkKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLmZyYW1lUmVxdWVzdGVkID0gdHJ1ZVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICB0aGlzLmZyYW1lUmVxdWVzdGVkID0gZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVlc3RzIGFuIHVwZGF0ZSB0byBiZSBwZXJmb3JtZWQgb24gdGhlIG5leHQgZnJhbWUgdGhhdCB3aWxsIGNvbXBsZXRlbHlcbiAgICogcmVkcmF3IHRoZSBtaW5pbWFwLlxuICAgKi9cbiAgcmVxdWVzdEZvcmNlZFVwZGF0ZSAoKSB7XG4gICAgdGhpcy5vZmZzY3JlZW5GaXJzdFJvdyA9IG51bGxcbiAgICB0aGlzLm9mZnNjcmVlbkxhc3RSb3cgPSBudWxsXG4gICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgYWN0dWFsIE1pbmltYXBFbGVtZW50IHVwZGF0ZS5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICB1cGRhdGUgKCkge1xuICAgIGlmICghKHRoaXMuYXR0YWNoZWQgJiYgdGhpcy5pc1Zpc2libGUoKSAmJiB0aGlzLm1pbmltYXApKSB7IHJldHVybiB9XG4gICAgY29uc3QgbWluaW1hcCA9IHRoaXMubWluaW1hcFxuICAgIG1pbmltYXAuZW5hYmxlQ2FjaGUoKVxuICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMuZ2V0RnJvbnRDYW52YXMoKVxuXG4gICAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IHRoaXMubWluaW1hcC5nZXREZXZpY2VQaXhlbFJhdGlvKClcbiAgICBjb25zdCB2aXNpYmxlQXJlYUxlZnQgPSBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRTY3JvbGxMZWZ0KClcbiAgICBjb25zdCB2aXNpYmxlQXJlYVRvcCA9IG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbFRvcCgpIC0gbWluaW1hcC5nZXRTY3JvbGxUb3AoKVxuICAgIGNvbnN0IHZpc2libGVXaWR0aCA9IE1hdGgubWluKGNhbnZhcy53aWR0aCAvIGRldmljZVBpeGVsUmF0aW8sIHRoaXMud2lkdGgpXG5cbiAgICBpZiAodGhpcy5hZGp1c3RUb1NvZnRXcmFwICYmIHRoaXMuZmxleEJhc2lzKSB7XG4gICAgICB0aGlzLnN0eWxlLmZsZXhCYXNpcyA9IHRoaXMuZmxleEJhc2lzICsgJ3B4J1xuICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IHRoaXMuZmxleEJhc2lzICsgJ3B4J1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0eWxlLmZsZXhCYXNpcyA9IG51bGxcbiAgICAgIHRoaXMuc3R5bGUud2lkdGggPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKFNQRUNfTU9ERSkge1xuICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLnZpc2libGVBcmVhLCB7XG4gICAgICAgIHdpZHRoOiB2aXNpYmxlV2lkdGggKyAncHgnLFxuICAgICAgICBoZWlnaHQ6IG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpICsgJ3B4JyxcbiAgICAgICAgdG9wOiB2aXNpYmxlQXJlYVRvcCArICdweCcsXG4gICAgICAgICdib3JkZXItbGVmdC13aWR0aCc6IHZpc2libGVBcmVhTGVmdCArICdweCdcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy52aXNpYmxlQXJlYSwge1xuICAgICAgICB3aWR0aDogdmlzaWJsZVdpZHRoICsgJ3B4JyxcbiAgICAgICAgaGVpZ2h0OiBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSArICdweCcsXG4gICAgICAgIHRyYW5zZm9ybTogdGhpcy5tYWtlVHJhbnNsYXRlKDAsIHZpc2libGVBcmVhVG9wKSxcbiAgICAgICAgJ2JvcmRlci1sZWZ0LXdpZHRoJzogdmlzaWJsZUFyZWFMZWZ0ICsgJ3B4J1xuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuY29udHJvbHMsIHt3aWR0aDogdmlzaWJsZVdpZHRoICsgJ3B4J30pXG5cbiAgICBsZXQgY2FudmFzVG9wID0gbWluaW1hcC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSAqIG1pbmltYXAuZ2V0TGluZUhlaWdodCgpIC0gbWluaW1hcC5nZXRTY3JvbGxUb3AoKVxuXG4gICAgaWYgKHRoaXMuc21vb3RoU2Nyb2xsaW5nKSB7XG4gICAgICBpZiAoU1BFQ19NT0RFKSB7XG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5iYWNrTGF5ZXIuY2FudmFzLCB7dG9wOiBjYW52YXNUb3AgKyAncHgnfSlcbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLnRva2Vuc0xheWVyLmNhbnZhcywge3RvcDogY2FudmFzVG9wICsgJ3B4J30pXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5mcm9udExheWVyLmNhbnZhcywge3RvcDogY2FudmFzVG9wICsgJ3B4J30pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgY2FudmFzVHJhbnNmb3JtID0gdGhpcy5tYWtlVHJhbnNsYXRlKDAsIGNhbnZhc1RvcClcbiAgICAgICAgaWYgKGRldmljZVBpeGVsUmF0aW8gIT09IDEpIHtcbiAgICAgICAgICBjYW52YXNUcmFuc2Zvcm0gKz0gJyAnICsgdGhpcy5tYWtlU2NhbGUoMSAvIGRldmljZVBpeGVsUmF0aW8pXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmJhY2tMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy50b2tlbnNMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5mcm9udExheWVyLmNhbnZhcywge3RyYW5zZm9ybTogY2FudmFzVHJhbnNmb3JtfSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY2FudmFzVHJhbnNmb3JtID0gdGhpcy5tYWtlU2NhbGUoMSAvIGRldmljZVBpeGVsUmF0aW8pXG4gICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuYmFja0xheWVyLmNhbnZhcywge3RyYW5zZm9ybTogY2FudmFzVHJhbnNmb3JtfSlcbiAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy50b2tlbnNMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuZnJvbnRMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgfVxuXG4gICAgaWYgKHRoaXMubWluaW1hcFNjcm9sbEluZGljYXRvciAmJiBtaW5pbWFwLmNhblNjcm9sbCgpICYmICF0aGlzLnNjcm9sbEluZGljYXRvcikge1xuICAgICAgdGhpcy5pbml0aWFsaXplU2Nyb2xsSW5kaWNhdG9yKClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zY3JvbGxJbmRpY2F0b3IgIT0gbnVsbCkge1xuICAgICAgbGV0IG1pbmltYXBTY3JlZW5IZWlnaHQgPSBtaW5pbWFwLmdldFNjcmVlbkhlaWdodCgpXG4gICAgICBsZXQgaW5kaWNhdG9ySGVpZ2h0ID0gbWluaW1hcFNjcmVlbkhlaWdodCAqIChtaW5pbWFwU2NyZWVuSGVpZ2h0IC8gbWluaW1hcC5nZXRIZWlnaHQoKSlcbiAgICAgIGxldCBpbmRpY2F0b3JTY3JvbGwgPSAobWluaW1hcFNjcmVlbkhlaWdodCAtIGluZGljYXRvckhlaWdodCkgKiBtaW5pbWFwLmdldFNjcm9sbFJhdGlvKClcblxuICAgICAgaWYgKFNQRUNfTU9ERSkge1xuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuc2Nyb2xsSW5kaWNhdG9yLCB7XG4gICAgICAgICAgaGVpZ2h0OiBpbmRpY2F0b3JIZWlnaHQgKyAncHgnLFxuICAgICAgICAgIHRvcDogaW5kaWNhdG9yU2Nyb2xsICsgJ3B4J1xuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLnNjcm9sbEluZGljYXRvciwge1xuICAgICAgICAgIGhlaWdodDogaW5kaWNhdG9ySGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICB0cmFuc2Zvcm06IHRoaXMubWFrZVRyYW5zbGF0ZSgwLCBpbmRpY2F0b3JTY3JvbGwpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGlmICghbWluaW1hcC5jYW5TY3JvbGwoKSkgeyB0aGlzLmRpc3Bvc2VTY3JvbGxJbmRpY2F0b3IoKSB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYWJzb2x1dGVNb2RlICYmIHRoaXMuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0KSB7IHRoaXMudXBkYXRlQ2FudmFzZXNTaXplKCkgfVxuXG4gICAgdGhpcy51cGRhdGVDYW52YXMoKVxuICAgIG1pbmltYXAuY2xlYXJDYWNoZSgpXG4gIH1cblxuICAvKipcbiAgICogRGVmaW5lcyB3aGV0aGVyIHRvIHJlbmRlciB0aGUgY29kZSBoaWdobGlnaHRzIG9yIG5vdC5cbiAgICpcbiAgICogQHBhcmFtIHtCb29sZWFufSBkaXNwbGF5Q29kZUhpZ2hsaWdodHMgd2hldGhlciB0byByZW5kZXIgdGhlIGNvZGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0cyBvciBub3RcbiAgICovXG4gIHNldERpc3BsYXlDb2RlSGlnaGxpZ2h0cyAoZGlzcGxheUNvZGVIaWdobGlnaHRzKSB7XG4gICAgdGhpcy5kaXNwbGF5Q29kZUhpZ2hsaWdodHMgPSBkaXNwbGF5Q29kZUhpZ2hsaWdodHNcbiAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKSB9XG4gIH1cblxuICAvKipcbiAgICogUG9sbGluZyBjYWxsYmFjayB1c2VkIHRvIGRldGVjdCB2aXNpYmlsaXR5IGFuZCBzaXplIGNoYW5nZXMuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgcG9sbERPTSAoKSB7XG4gICAgbGV0IHZpc2liaWxpdHlDaGFuZ2VkID0gdGhpcy5jaGVja0ZvclZpc2liaWxpdHlDaGFuZ2UoKVxuICAgIGlmICh0aGlzLmlzVmlzaWJsZSgpKSB7XG4gICAgICBpZiAoIXRoaXMud2FzVmlzaWJsZSkgeyB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKSB9XG5cbiAgICAgIHRoaXMubWVhc3VyZUhlaWdodEFuZFdpZHRoKHZpc2liaWxpdHlDaGFuZ2VkLCBmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCBjaGVja3MgZm9yIHZpc2liaWxpdHkgY2hhbmdlcyBpbiB0aGUgTWluaW1hcEVsZW1lbnQuXG4gICAqIFRoZSBtZXRob2QgcmV0dXJucyBgdHJ1ZWAgd2hlbiB0aGUgdmlzaWJpbGl0eSBjaGFuZ2VkIGZyb20gdmlzaWJsZSB0b1xuICAgKiBoaWRkZW4gb3IgZnJvbSBoaWRkZW4gdG8gdmlzaWJsZS5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gd2hldGhlciB0aGUgdmlzaWJpbGl0eSBjaGFuZ2VkIG9yIG5vdCBzaW5jZSB0aGUgbGFzdCBjYWxsXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY2hlY2tGb3JWaXNpYmlsaXR5Q2hhbmdlICgpIHtcbiAgICBpZiAodGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgaWYgKHRoaXMud2FzVmlzaWJsZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMud2FzVmlzaWJsZSA9IHRydWVcbiAgICAgICAgcmV0dXJuIHRoaXMud2FzVmlzaWJsZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy53YXNWaXNpYmxlKSB7XG4gICAgICAgIHRoaXMud2FzVmlzaWJsZSA9IGZhbHNlXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndhc1Zpc2libGUgPSBmYWxzZVxuICAgICAgICByZXR1cm4gdGhpcy53YXNWaXNpYmxlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHVzZWQgdG8gbWVhc3VyZSB0aGUgc2l6ZSBvZiB0aGUgTWluaW1hcEVsZW1lbnQgYW5kIHVwZGF0ZSBpbnRlcm5hbFxuICAgKiBjb21wb25lbnRzIGJhc2VkIG9uIHRoZSBuZXcgc2l6ZS5cbiAgICpcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gdmlzaWJpbGl0eUNoYW5nZWQgZGlkIHRoZSB2aXNpYmlsaXR5IGNoYW5nZWQgc2luY2UgbGFzdFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWFzdXJlbWVudFxuICAgKiBAcGFyYW0gIHtbdHlwZV19IFtmb3JjZVVwZGF0ZT10cnVlXSBmb3JjZXMgdGhlIHVwZGF0ZSBldmVuIHdoZW4gbm8gY2hhbmdlc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3ZXJlIGRldGVjdGVkXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgbWVhc3VyZUhlaWdodEFuZFdpZHRoICh2aXNpYmlsaXR5Q2hhbmdlZCwgZm9yY2VVcGRhdGUgPSB0cnVlKSB7XG4gICAgaWYgKCF0aGlzLm1pbmltYXApIHsgcmV0dXJuIH1cblxuICAgIGNvbnN0IHNhZmVGbGV4QmFzaXMgPSB0aGlzLnN0eWxlLmZsZXhCYXNpc1xuICAgIHRoaXMuc3R5bGUuZmxleEJhc2lzID0gJydcblxuICAgIGxldCB3YXNSZXNpemVkID0gdGhpcy53aWR0aCAhPT0gdGhpcy5jbGllbnRXaWR0aCB8fCB0aGlzLmhlaWdodCAhPT0gdGhpcy5jbGllbnRIZWlnaHRcblxuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jbGllbnRIZWlnaHRcbiAgICB0aGlzLndpZHRoID0gdGhpcy5jbGllbnRXaWR0aFxuICAgIGxldCBjYW52YXNXaWR0aCA9IHRoaXMud2lkdGhcblxuICAgIGlmICgodGhpcy5taW5pbWFwICE9IG51bGwpKSB7XG4gICAgICB0aGlzLm1pbmltYXAuc2V0U2NyZWVuSGVpZ2h0QW5kV2lkdGgodGhpcy5oZWlnaHQsIHRoaXMud2lkdGgpXG4gICAgfVxuXG4gICAgaWYgKHdhc1Jlc2l6ZWQgfHwgdmlzaWJpbGl0eUNoYW5nZWQgfHwgZm9yY2VVcGRhdGUpIHtcbiAgICAgIHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmlzVmlzaWJsZSgpKSB7IHJldHVybiB9XG5cbiAgICBpZiAod2FzUmVzaXplZCB8fCBmb3JjZVVwZGF0ZSkge1xuICAgICAgaWYgKHRoaXMuYWRqdXN0VG9Tb2Z0V3JhcCkge1xuICAgICAgICBsZXQgbGluZUxlbmd0aCA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnKVxuICAgICAgICBsZXQgc29mdFdyYXAgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0V3JhcCcpXG4gICAgICAgIGxldCBzb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNvZnRXcmFwQXRQcmVmZXJyZWRMaW5lTGVuZ3RoJylcbiAgICAgICAgbGV0IHdpZHRoID0gbGluZUxlbmd0aCAqIHRoaXMubWluaW1hcC5nZXRDaGFyV2lkdGgoKVxuXG4gICAgICAgIGlmIChzb2Z0V3JhcCAmJiBzb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCAmJiBsaW5lTGVuZ3RoICYmICh3aWR0aCA8PSB0aGlzLndpZHRoIHx8ICF0aGlzLmFkanVzdE9ubHlJZlNtYWxsZXIpKSB7XG4gICAgICAgICAgdGhpcy5mbGV4QmFzaXMgPSB3aWR0aFxuICAgICAgICAgIGNhbnZhc1dpZHRoID0gd2lkdGhcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5mbGV4QmFzaXNcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuZmxleEJhc2lzXG4gICAgICB9XG5cbiAgICAgIHRoaXMudXBkYXRlQ2FudmFzZXNTaXplKGNhbnZhc1dpZHRoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0eWxlLmZsZXhCYXNpcyA9IHNhZmVGbGV4QmFzaXNcbiAgICB9XG4gIH1cblxuICB1cGRhdGVDYW52YXNlc1NpemUgKGNhbnZhc1dpZHRoID0gdGhpcy5nZXRGcm9udENhbnZhcygpLndpZHRoKSB7XG4gICAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IHRoaXMubWluaW1hcC5nZXREZXZpY2VQaXhlbFJhdGlvKClcbiAgICBjb25zdCBtYXhDYW52YXNIZWlnaHQgPSB0aGlzLmhlaWdodCArIHRoaXMubWluaW1hcC5nZXRMaW5lSGVpZ2h0KClcbiAgICBjb25zdCBuZXdIZWlnaHQgPSB0aGlzLmFic29sdXRlTW9kZSAmJiB0aGlzLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCA/IE1hdGgubWluKHRoaXMubWluaW1hcC5nZXRIZWlnaHQoKSwgbWF4Q2FudmFzSGVpZ2h0KSA6IG1heENhbnZhc0hlaWdodFxuICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMuZ2V0RnJvbnRDYW52YXMoKVxuICAgIGlmIChjYW52YXNXaWR0aCAhPT0gY2FudmFzLndpZHRoIHx8IG5ld0hlaWdodCAhPT0gY2FudmFzLmhlaWdodCkge1xuICAgICAgdGhpcy5zZXRDYW52YXNlc1NpemUoXG4gICAgICAgIGNhbnZhc1dpZHRoICogZGV2aWNlUGl4ZWxSYXRpbyxcbiAgICAgICAgbmV3SGVpZ2h0ICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgICAgKVxuICAgICAgaWYgKHRoaXMuYWJzb2x1dGVNb2RlICYmIHRoaXMuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0KSB7XG4gICAgICAgIHRoaXMub2Zmc2NyZWVuRmlyc3RSb3cgPSBudWxsXG4gICAgICAgIHRoaXMub2Zmc2NyZWVuTGFzdFJvdyA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyAgICAjIyMjIyMjIyAjIyAgICAgIyMgIyMjIyMjIyMgIyMgICAgIyMgIyMjIyMjIyMgICMjIyMjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMjICAgIyMgICAgIyMgICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICMjIyMgICMjICAgICMjICAgICMjXG4gIC8vICAgICMjIyMjIyAgICMjICAgICAjIyAjIyMjIyMgICAjIyAjIyAjIyAgICAjIyAgICAgIyMjIyMjXG4gIC8vICAgICMjICAgICAgICAjIyAgICMjICAjIyAgICAgICAjIyAgIyMjIyAgICAjIyAgICAgICAgICAjI1xuICAvLyAgICAjIyAgICAgICAgICMjICMjICAgIyMgICAgICAgIyMgICAjIyMgICAgIyMgICAgIyMgICAgIyNcbiAgLy8gICAgIyMjIyMjIyMgICAgIyMjICAgICMjIyMjIyMjICMjICAgICMjICAgICMjICAgICAjIyMjIyNcblxuICAvKipcbiAgICogSGVscGVyIG1ldGhvZCB0byByZWdpc3RlciBjb25maWcgb2JzZXJ2ZXJzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGNvbmZpZ3M9e30gYW4gb2JqZWN0IG1hcHBpbmcgdGhlIGNvbmZpZyBuYW1lIHRvIG9ic2VydmVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggdGhlIGZ1bmN0aW9uIHRvIGNhbGwgYmFjayB3aGVuIGEgY2hhbmdlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvY2N1cnNcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBvYnNlcnZlQ29uZmlnIChjb25maWdzID0ge30pIHtcbiAgICBmb3IgKGxldCBjb25maWcgaW4gY29uZmlncykge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKGNvbmZpZywgY29uZmlnc1tjb25maWddKSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgdHJpZ2dlcmVkIHdoZW4gdGhlIG1vdXNlIGlzIHByZXNzZWQgb24gdGhlIE1pbmltYXBFbGVtZW50IGNhbnZhcy5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSB5IHRoZSB2ZXJ0aWNhbCBjb29yZGluYXRlIG9mIHRoZSBldmVudFxuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc0xlZnRNb3VzZSB3YXMgdGhlIGxlZnQgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGlzTWlkZGxlTW91c2Ugd2FzIHRoZSBtaWRkbGUgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY2FudmFzUHJlc3NlZCAoe3ksIGlzTGVmdE1vdXNlLCBpc01pZGRsZU1vdXNlfSkge1xuICAgIGlmICh0aGlzLm1pbmltYXAuaXNTdGFuZEFsb25lKCkpIHsgcmV0dXJuIH1cbiAgICBpZiAoaXNMZWZ0TW91c2UpIHtcbiAgICAgIHRoaXMuY2FudmFzTGVmdE1vdXNlUHJlc3NlZCh5KVxuICAgIH0gZWxzZSBpZiAoaXNNaWRkbGVNb3VzZSkge1xuICAgICAgdGhpcy5jYW52YXNNaWRkbGVNb3VzZVByZXNzZWQoeSlcbiAgICAgIGxldCB7dG9wLCBoZWlnaHR9ID0gdGhpcy52aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgdGhpcy5zdGFydERyYWcoe3k6IHRvcCArIGhlaWdodCAvIDIsIGlzTGVmdE1vdXNlOiBmYWxzZSwgaXNNaWRkbGVNb3VzZTogdHJ1ZX0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRyaWdnZXJlZCB3aGVuIHRoZSBtb3VzZSBsZWZ0IGJ1dHRvbiBpcyBwcmVzc2VkIG9uIHRoZVxuICAgKiBNaW5pbWFwRWxlbWVudCBjYW52YXMuXG4gICAqXG4gICAqIEBwYXJhbSAge01vdXNlRXZlbnR9IGUgdGhlIG1vdXNlIGV2ZW50IG9iamVjdFxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGUucGFnZVkgdGhlIG1vdXNlIHkgcG9zaXRpb24gaW4gcGFnZVxuICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZS50YXJnZXQgdGhlIHNvdXJjZSBvZiB0aGUgZXZlbnRcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjYW52YXNMZWZ0TW91c2VQcmVzc2VkICh5KSB7XG4gICAgY29uc3QgZGVsdGFZID0geSAtIHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wXG4gICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihkZWx0YVkgLyB0aGlzLm1pbmltYXAuZ2V0TGluZUhlaWdodCgpKSArIHRoaXMubWluaW1hcC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gICAgY29uc3QgdGV4dEVkaXRvciA9IHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yKClcbiAgICBjb25zdCB0ZXh0RWRpdG9yRWxlbWVudCA9IHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKVxuXG4gICAgY29uc3Qgc2Nyb2xsVG9wID0gcm93ICogdGV4dEVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSAtIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9ySGVpZ2h0KCkgLyAyXG4gICAgY29uc3QgdGV4dEVkaXRvclNjcm9sbFRvcCA9IHRleHRFZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihbcm93LCAwXSkudG9wIC0gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JIZWlnaHQoKSAvIDJcblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAubW92ZUN1cnNvck9uTWluaW1hcENsaWNrJykpIHtcbiAgICAgIHRleHRFZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oW3JvdywgMF0pXG4gICAgfVxuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5zY3JvbGxBbmltYXRpb24nKSkge1xuICAgICAgY29uc3QgZHVyYXRpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuc2Nyb2xsQW5pbWF0aW9uRHVyYXRpb24nKVxuICAgICAgY29uc3QgaW5kZXBlbmRlbnRTY3JvbGwgPSB0aGlzLm1pbmltYXAuc2Nyb2xsSW5kZXBlbmRlbnRseU9uTW91c2VXaGVlbCgpXG5cbiAgICAgIGxldCBmcm9tID0gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JTY3JvbGxUb3AoKVxuICAgICAgbGV0IHRvID0gdGV4dEVkaXRvclNjcm9sbFRvcFxuICAgICAgbGV0IHN0ZXBcblxuICAgICAgaWYgKGluZGVwZW5kZW50U2Nyb2xsKSB7XG4gICAgICAgIGNvbnN0IG1pbmltYXBGcm9tID0gdGhpcy5taW5pbWFwLmdldFNjcm9sbFRvcCgpXG4gICAgICAgIGNvbnN0IG1pbmltYXBUbyA9IE1hdGgubWluKDEsIHNjcm9sbFRvcCAvICh0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvck1heFNjcm9sbFRvcCgpIHx8IDEpKSAqIHRoaXMubWluaW1hcC5nZXRNYXhTY3JvbGxUb3AoKVxuXG4gICAgICAgIHN0ZXAgPSAobm93LCB0KSA9PiB7XG4gICAgICAgICAgdGhpcy5taW5pbWFwLnNldFRleHRFZGl0b3JTY3JvbGxUb3Aobm93LCB0cnVlKVxuICAgICAgICAgIHRoaXMubWluaW1hcC5zZXRTY3JvbGxUb3AobWluaW1hcEZyb20gKyAobWluaW1hcFRvIC0gbWluaW1hcEZyb20pICogdClcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFuaW1hdGUoe2Zyb206IGZyb20sIHRvOiB0bywgZHVyYXRpb246IGR1cmF0aW9uLCBzdGVwOiBzdGVwfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ZXAgPSAobm93KSA9PiB0aGlzLm1pbmltYXAuc2V0VGV4dEVkaXRvclNjcm9sbFRvcChub3cpXG4gICAgICAgIHRoaXMuYW5pbWF0ZSh7ZnJvbTogZnJvbSwgdG86IHRvLCBkdXJhdGlvbjogZHVyYXRpb24sIHN0ZXA6IHN0ZXB9KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1pbmltYXAuc2V0VGV4dEVkaXRvclNjcm9sbFRvcCh0ZXh0RWRpdG9yU2Nyb2xsVG9wKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayB0cmlnZ2VyZWQgd2hlbiB0aGUgbW91c2UgbWlkZGxlIGJ1dHRvbiBpcyBwcmVzc2VkIG9uIHRoZVxuICAgKiBNaW5pbWFwRWxlbWVudCBjYW52YXMuXG4gICAqXG4gICAqIEBwYXJhbSAge01vdXNlRXZlbnR9IGUgdGhlIG1vdXNlIGV2ZW50IG9iamVjdFxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGUucGFnZVkgdGhlIG1vdXNlIHkgcG9zaXRpb24gaW4gcGFnZVxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNhbnZhc01pZGRsZU1vdXNlUHJlc3NlZCAoeSkge1xuICAgIGxldCB7dG9wOiBvZmZzZXRUb3B9ID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGxldCBkZWx0YVkgPSB5IC0gb2Zmc2V0VG9wIC0gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSAvIDJcblxuICAgIGxldCByYXRpbyA9IGRlbHRhWSAvICh0aGlzLm1pbmltYXAuZ2V0VmlzaWJsZUhlaWdodCgpIC0gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSlcblxuICAgIHRoaXMubWluaW1hcC5zZXRUZXh0RWRpdG9yU2Nyb2xsVG9wKHJhdGlvICogdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JNYXhTY3JvbGxUb3AoKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IHJlbGF5cyB0aGUgYG1vdXNld2hlZWxgIGV2ZW50cyByZWNlaXZlZCBieSB0aGUgTWluaW1hcEVsZW1lbnRcbiAgICogdG8gdGhlIGBUZXh0RWRpdG9yRWxlbWVudGAuXG4gICAqXG4gICAqIEBwYXJhbSAge01vdXNlRXZlbnR9IGUgdGhlIG1vdXNlIGV2ZW50IG9iamVjdFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHJlbGF5TW91c2V3aGVlbEV2ZW50IChlKSB7XG4gICAgaWYgKHRoaXMubWluaW1hcC5zY3JvbGxJbmRlcGVuZGVudGx5T25Nb3VzZVdoZWVsKCkpIHtcbiAgICAgIHRoaXMubWluaW1hcC5vbk1vdXNlV2hlZWwoZSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5nZXRUZXh0RWRpdG9yRWxlbWVudCgpLmNvbXBvbmVudC5vbk1vdXNlV2hlZWwoZSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCBleHRyYWN0cyBkYXRhIGZyb20gYSBgTW91c2VFdmVudGAgd2hpY2ggY2FuIHRoZW4gYmUgdXNlZCB0b1xuICAgKiBwcm9jZXNzIGNsaWNrcyBhbmQgZHJhZ3Mgb2YgdGhlIG1pbmltYXAuXG4gICAqXG4gICAqIFVzZWQgdG9nZXRoZXIgd2l0aCBgZXh0cmFjdFRvdWNoRXZlbnREYXRhYCB0byBwcm92aWRlIGEgdW5pZmllZCBpbnRlcmZhY2VcbiAgICogZm9yIGBNb3VzZUV2ZW50YHMgYW5kIGBUb3VjaEV2ZW50YHMuXG4gICAqXG4gICAqIEBwYXJhbSAge01vdXNlRXZlbnR9IG1vdXNlRXZlbnQgdGhlIG1vdXNlIGV2ZW50IG9iamVjdFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGV4dHJhY3RNb3VzZUV2ZW50RGF0YSAobW91c2VFdmVudCkge1xuICAgIHJldHVybiB7XG4gICAgICB4OiBtb3VzZUV2ZW50LnBhZ2VYLFxuICAgICAgeTogbW91c2VFdmVudC5wYWdlWSxcbiAgICAgIGlzTGVmdE1vdXNlOiBtb3VzZUV2ZW50LndoaWNoID09PSAxLFxuICAgICAgaXNNaWRkbGVNb3VzZTogbW91c2VFdmVudC53aGljaCA9PT0gMlxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IGV4dHJhY3RzIGRhdGEgZnJvbSBhIGBUb3VjaEV2ZW50YCB3aGljaCBjYW4gdGhlbiBiZSB1c2VkIHRvXG4gICAqIHByb2Nlc3MgY2xpY2tzIGFuZCBkcmFncyBvZiB0aGUgbWluaW1hcC5cbiAgICpcbiAgICogVXNlZCB0b2dldGhlciB3aXRoIGBleHRyYWN0TW91c2VFdmVudERhdGFgIHRvIHByb3ZpZGUgYSB1bmlmaWVkIGludGVyZmFjZVxuICAgKiBmb3IgYE1vdXNlRXZlbnRgcyBhbmQgYFRvdWNoRXZlbnRgcy5cbiAgICpcbiAgICogQHBhcmFtICB7VG91Y2hFdmVudH0gdG91Y2hFdmVudCB0aGUgdG91Y2ggZXZlbnQgb2JqZWN0XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZXh0cmFjdFRvdWNoRXZlbnREYXRhICh0b3VjaEV2ZW50KSB7XG4gICAgLy8gVXNlIHRoZSBmaXJzdCB0b3VjaCBvbiB0aGUgdGFyZ2V0IGFyZWEuIE90aGVyIHRvdWNoZXMgd2lsbCBiZSBpZ25vcmVkIGluXG4gICAgLy8gY2FzZSBvZiBtdWx0aS10b3VjaC5cbiAgICBsZXQgdG91Y2ggPSB0b3VjaEV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdXG5cbiAgICByZXR1cm4ge1xuICAgICAgeDogdG91Y2gucGFnZVgsXG4gICAgICB5OiB0b3VjaC5wYWdlWSxcbiAgICAgIGlzTGVmdE1vdXNlOiB0cnVlLCAvLyBUb3VjaCBpcyB0cmVhdGVkIGxpa2UgYSBsZWZ0IG1vdXNlIGJ1dHRvbiBjbGlja1xuICAgICAgaXNNaWRkbGVNb3VzZTogZmFsc2VcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlcyB0byBhIG1lZGlhIHF1ZXJ5IGZvciBkZXZpY2UgcGl4ZWwgcmF0aW8gY2hhbmdlcyBhbmQgZm9yY2VzXG4gICAqIGEgcmVwYWludCB3aGVuIGl0IG9jY3Vycy5cbiAgICpcbiAgICogQHJldHVybiB7RGlzcG9zYWJsZX0gYSBkaXNwb3NhYmxlIHRvIHJlbW92ZSB0aGUgbWVkaWEgcXVlcnkgbGlzdGVuZXJcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBzdWJzY3JpYmVUb01lZGlhUXVlcnkgKCkge1xuICAgIGlmICghRGlzcG9zYWJsZSkge1xuICAgICAgKHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKSlcbiAgICB9XG5cbiAgICBjb25zdCBxdWVyeSA9ICdzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDEuNSknXG4gICAgY29uc3QgbWVkaWFRdWVyeSA9IHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KVxuICAgIGNvbnN0IG1lZGlhTGlzdGVuZXIgPSAoZSkgPT4geyB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKSB9XG4gICAgbWVkaWFRdWVyeS5hZGRMaXN0ZW5lcihtZWRpYUxpc3RlbmVyKVxuXG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIG1lZGlhUXVlcnkucmVtb3ZlTGlzdGVuZXIobWVkaWFMaXN0ZW5lcilcbiAgICB9KVxuICB9XG5cbiAgLy8gICAgIyMjIyMjIyMgICAgIyMjIyAgICAjIyMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgICMjICAjIyAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAjIyMjICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICMjIyMgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICMjICMjICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAjIyAgICMjICAgICAjI1xuICAvLyAgICAjIyMjIyMjIyAgICMjIyMgICMjICMjIyMjIyMjXG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRyaWdnZXJlZCB3aGVuIHRoZSBtb3VzZSBpcyBwcmVzc2VkIG92ZXIgdGhlIHZpc2libGUgYXJlYSB0aGF0XG4gICAqIHN0YXJ0cyB0aGUgZHJhZ2dpbmcgZ2VzdHVyZS5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSB5IHRoZSB2ZXJ0aWNhbCBjb29yZGluYXRlIG9mIHRoZSBldmVudFxuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc0xlZnRNb3VzZSB3YXMgdGhlIGxlZnQgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGlzTWlkZGxlTW91c2Ugd2FzIHRoZSBtaWRkbGUgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgc3RhcnREcmFnICh7eSwgaXNMZWZ0TW91c2UsIGlzTWlkZGxlTW91c2V9KSB7XG4gICAgaWYgKCFEaXNwb3NhYmxlKSB7XG4gICAgICAoe0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpKVxuICAgIH1cblxuICAgIGlmICghdGhpcy5taW5pbWFwKSB7IHJldHVybiB9XG4gICAgaWYgKCFpc0xlZnRNb3VzZSAmJiAhaXNNaWRkbGVNb3VzZSkgeyByZXR1cm4gfVxuXG4gICAgbGV0IHt0b3B9ID0gdGhpcy52aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGxldCB7dG9wOiBvZmZzZXRUb3B9ID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgbGV0IGRyYWdPZmZzZXQgPSB5IC0gdG9wXG5cbiAgICBsZXQgaW5pdGlhbCA9IHtkcmFnT2Zmc2V0LCBvZmZzZXRUb3B9XG5cbiAgICBsZXQgbW91c2Vtb3ZlSGFuZGxlciA9IChlKSA9PiB0aGlzLmRyYWcodGhpcy5leHRyYWN0TW91c2VFdmVudERhdGEoZSksIGluaXRpYWwpXG4gICAgbGV0IG1vdXNldXBIYW5kbGVyID0gKGUpID0+IHRoaXMuZW5kRHJhZygpXG5cbiAgICBsZXQgdG91Y2htb3ZlSGFuZGxlciA9IChlKSA9PiB0aGlzLmRyYWcodGhpcy5leHRyYWN0VG91Y2hFdmVudERhdGEoZSksIGluaXRpYWwpXG4gICAgbGV0IHRvdWNoZW5kSGFuZGxlciA9IChlKSA9PiB0aGlzLmVuZERyYWcoKVxuXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmVIYW5kbGVyKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG1vdXNldXBIYW5kbGVyKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIG1vdXNldXBIYW5kbGVyKVxuXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0b3VjaG1vdmVIYW5kbGVyKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0b3VjaGVuZEhhbmRsZXIpXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRvdWNoZW5kSGFuZGxlcilcblxuICAgIHRoaXMuZHJhZ1N1YnNjcmlwdGlvbiA9IG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uICgpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2Vtb3ZlSGFuZGxlcilcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG1vdXNldXBIYW5kbGVyKVxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgbW91c2V1cEhhbmRsZXIpXG5cbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdG91Y2htb3ZlSGFuZGxlcilcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0b3VjaGVuZEhhbmRsZXIpXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdG91Y2hlbmRIYW5kbGVyKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogVGhlIG1ldGhvZCBjYWxsZWQgZHVyaW5nIHRoZSBkcmFnIGdlc3R1cmUuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0geSB0aGUgdmVydGljYWwgY29vcmRpbmF0ZSBvZiB0aGUgZXZlbnRcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gaXNMZWZ0TW91c2Ugd2FzIHRoZSBsZWZ0IG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc01pZGRsZU1vdXNlIHdhcyB0aGUgbWlkZGxlIG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGluaXRpYWwuZHJhZ09mZnNldCB0aGUgbW91c2Ugb2Zmc2V0IHdpdGhpbiB0aGUgdmlzaWJsZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmVhXG4gICAqIEBwYXJhbSAge251bWJlcn0gaW5pdGlhbC5vZmZzZXRUb3AgdGhlIE1pbmltYXBFbGVtZW50IG9mZnNldCBhdCB0aGUgbW9tZW50XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2YgdGhlIGRyYWcgc3RhcnRcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkcmFnICh7eSwgaXNMZWZ0TW91c2UsIGlzTWlkZGxlTW91c2V9LCBpbml0aWFsKSB7XG4gICAgaWYgKCF0aGlzLm1pbmltYXApIHsgcmV0dXJuIH1cbiAgICBpZiAoIWlzTGVmdE1vdXNlICYmICFpc01pZGRsZU1vdXNlKSB7IHJldHVybiB9XG4gICAgbGV0IGRlbHRhWSA9IHkgLSBpbml0aWFsLm9mZnNldFRvcCAtIGluaXRpYWwuZHJhZ09mZnNldFxuXG4gICAgbGV0IHJhdGlvID0gZGVsdGFZIC8gKHRoaXMubWluaW1hcC5nZXRWaXNpYmxlSGVpZ2h0KCkgLSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpKVxuXG4gICAgdGhpcy5taW5pbWFwLnNldFRleHRFZGl0b3JTY3JvbGxUb3AocmF0aW8gKiB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvck1heFNjcm9sbFRvcCgpKVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtZXRob2QgdGhhdCBlbmRzIHRoZSBkcmFnIGdlc3R1cmUuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZW5kRHJhZyAoKSB7XG4gICAgaWYgKCF0aGlzLm1pbmltYXApIHsgcmV0dXJuIH1cbiAgICB0aGlzLmRyYWdTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gIH1cblxuICAvLyAgICAgIyMjIyMjICAgIyMjIyMjICAgIyMjIyMjXG4gIC8vICAgICMjICAgICMjICMjICAgICMjICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAgICMjXG4gIC8vICAgICMjICAgICAgICAjIyMjIyMgICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICAgICAgICAgIyMgICAgICAgIyNcbiAgLy8gICAgIyMgICAgIyMgIyMgICAgIyMgIyMgICAgIyNcbiAgLy8gICAgICMjIyMjIyAgICMjIyMjIyAgICMjIyMjI1xuXG4gIC8qKlxuICAgKiBBcHBsaWVzIHRoZSBwYXNzZWQtaW4gc3R5bGVzIHByb3BlcnRpZXMgdG8gdGhlIHNwZWNpZmllZCBlbGVtZW50XG4gICAqXG4gICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBlbGVtZW50IHRoZSBlbGVtZW50IG9udG8gd2hpY2ggYXBwbHkgdGhlIHN0eWxlc1xuICAgKiBAcGFyYW0gIHtPYmplY3R9IHN0eWxlcyB0aGUgc3R5bGVzIHRvIGFwcGx5XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgYXBwbHlTdHlsZXMgKGVsZW1lbnQsIHN0eWxlcykge1xuICAgIGlmICghZWxlbWVudCkgeyByZXR1cm4gfVxuXG4gICAgbGV0IGNzc1RleHQgPSAnJ1xuICAgIGZvciAobGV0IHByb3BlcnR5IGluIHN0eWxlcykge1xuICAgICAgY3NzVGV4dCArPSBgJHtwcm9wZXJ0eX06ICR7c3R5bGVzW3Byb3BlcnR5XX07IGBcbiAgICB9XG5cbiAgICBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSBjc3NUZXh0XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyB3aXRoIGEgQ1NTIHRyYW5zbGF0aW9uIHRyYW5mb3JtIHZhbHVlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IFt4ID0gMF0gdGhlIHggb2Zmc2V0IG9mIHRoZSB0cmFuc2xhdGlvblxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IFt5ID0gMF0gdGhlIHkgb2Zmc2V0IG9mIHRoZSB0cmFuc2xhdGlvblxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBDU1MgdHJhbnNsYXRpb24gc3RyaW5nXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgbWFrZVRyYW5zbGF0ZSAoeCA9IDAsIHkgPSAwKSB7XG4gICAgaWYgKHRoaXMudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24pIHtcbiAgICAgIHJldHVybiBgdHJhbnNsYXRlM2QoJHt4fXB4LCAke3l9cHgsIDApYFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYHRyYW5zbGF0ZSgke3h9cHgsICR7eX1weClgXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgd2l0aCBhIENTUyBzY2FsaW5nIHRyYW5mb3JtIHZhbHVlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IFt4ID0gMF0gdGhlIHggc2NhbGluZyBmYWN0b3JcbiAgICogQHBhcmFtICB7bnVtYmVyfSBbeSA9IDBdIHRoZSB5IHNjYWxpbmcgZmFjdG9yXG4gICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIENTUyBzY2FsaW5nIHN0cmluZ1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIG1ha2VTY2FsZSAoeCA9IDAsIHkgPSB4KSB7XG4gICAgaWYgKHRoaXMudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24pIHtcbiAgICAgIHJldHVybiBgc2NhbGUzZCgke3h9LCAke3l9LCAxKWBcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBzY2FsZSgke3h9LCAke3l9KWBcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCByZXR1cm4gdGhlIGN1cnJlbnQgdGltZSBhcyBhIERhdGUuXG4gICAqXG4gICAqIFRoYXQgbWV0aG9kIGV4aXN0IHNvIHRoYXQgd2UgY2FuIG1vY2sgaXQgaW4gdGVzdHMuXG4gICAqXG4gICAqIEByZXR1cm4ge0RhdGV9IHRoZSBjdXJyZW50IHRpbWUgYXMgRGF0ZVxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGdldFRpbWUgKCkgeyByZXR1cm4gbmV3IERhdGUoKSB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgbWltaWMgdGhlIGpRdWVyeSBgYW5pbWF0ZWAgbWV0aG9kIGFuZCB1c2VkIHRvIGFuaW1hdGUgdGhlXG4gICAqIHNjcm9sbCB3aGVuIGNsaWNraW5nIG9uIHRoZSBNaW5pbWFwRWxlbWVudCBjYW52YXMuXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gcGFyYW0gdGhlIGFuaW1hdGlvbiBkYXRhIG9iamVjdFxuICAgKiBAcGFyYW0gIHtbdHlwZV19IHBhcmFtLmZyb20gdGhlIHN0YXJ0IHZhbHVlXG4gICAqIEBwYXJhbSAge1t0eXBlXX0gcGFyYW0udG8gdGhlIGVuZCB2YWx1ZVxuICAgKiBAcGFyYW0gIHtbdHlwZV19IHBhcmFtLmR1cmF0aW9uIHRoZSBhbmltYXRpb24gZHVyYXRpb25cbiAgICogQHBhcmFtICB7W3R5cGVdfSBwYXJhbS5zdGVwIHRoZSBlYXNpbmcgZnVuY3Rpb24gZm9yIHRoZSBhbmltYXRpb25cbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBhbmltYXRlICh7ZnJvbSwgdG8sIGR1cmF0aW9uLCBzdGVwfSkge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5nZXRUaW1lKClcbiAgICBsZXQgcHJvZ3Jlc3NcblxuICAgIGNvbnN0IHN3aW5nID0gZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICByZXR1cm4gMC41IC0gTWF0aC5jb3MocHJvZ3Jlc3MgKiBNYXRoLlBJKSAvIDJcbiAgICB9XG5cbiAgICBjb25zdCB1cGRhdGUgPSAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuXG4gICAgICBjb25zdCBwYXNzZWQgPSB0aGlzLmdldFRpbWUoKSAtIHN0YXJ0XG4gICAgICBpZiAoZHVyYXRpb24gPT09IDApIHtcbiAgICAgICAgcHJvZ3Jlc3MgPSAxXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9ncmVzcyA9IHBhc3NlZCAvIGR1cmF0aW9uXG4gICAgICB9XG4gICAgICBpZiAocHJvZ3Jlc3MgPiAxKSB7IHByb2dyZXNzID0gMSB9XG4gICAgICBjb25zdCBkZWx0YSA9IHN3aW5nKHByb2dyZXNzKVxuICAgICAgY29uc3QgdmFsdWUgPSBmcm9tICsgKHRvIC0gZnJvbSkgKiBkZWx0YVxuICAgICAgc3RlcCh2YWx1ZSwgZGVsdGEpXG5cbiAgICAgIGlmIChwcm9ncmVzcyA8IDEpIHsgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZSkgfVxuICAgIH1cblxuICAgIHVwZGF0ZSgpXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/minimap/lib/minimap-element.js
