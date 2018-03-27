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
    Disposable = undefined,
    overlayStyle = undefined;

var ensureOverlayStyle = function ensureOverlayStyle() {
  if (!overlayStyle) {
    overlayStyle = document.createElement('style');
    overlayStyle.setAttribute('context', 'atom-text-editor-minimap');
    document.head.appendChild(overlayStyle);
  }
};

var removeOverlayStyle = function removeOverlayStyle() {
  if (overlayStyle) {
    overlayStyle.parentNode.removeChild(overlayStyle);
    overlayStyle = null;
  }
};

var updateOverlayStyle = function updateOverlayStyle(basis) {
  if (overlayStyle) {
    if (basis) {
      overlayStyle.textContent = '\n      atom-text-editor[with-minimap]::shadow atom-overlay,\n      atom-text-editor[with-minimap] atom-overlay {\n        margin-left: ' + basis + ';\n      }\n      ';
    } else {
      overlayStyle.textContent = '\n      atom-text-editor[with-minimap]::shadow atom-overlay,\n      atom-text-editor[with-minimap] atom-overlay {\n        margin-left: 10%;\n      }\n      ';
    }
  }
};

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

          displayMinimapOnLeft ? ensureOverlayStyle() : removeOverlayStyle();
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
            updateOverlayStyle(width);
          } else {
            delete this.flexBasis;
            updateOverlayStyle();
          }
        } else {
          delete this.flexBasis;
          updateOverlayStyle();
        }

        this.updateCanvasesSize(canvasWidth);
      } else {
        this.style.flexBasis = safeFlexBasis;
        updateOverlayStyle(safeFlexBasis);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL21pbmltYXAtZWxlbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3lCQUVpRCxZQUFZOztxQ0FDakMsNEJBQTRCOzs7O2tDQUMvQix3QkFBd0I7Ozs7aUNBQzdCLHNCQUFzQjs7OztpQ0FDdEIsc0JBQXNCOzs7O0FBTjFDLFdBQVcsQ0FBQTs7QUFRWCxJQUFJLElBQUksWUFBQTtJQUFFLDJCQUEyQixZQUFBO0lBQUUsbUJBQW1CLFlBQUE7SUFBRSxVQUFVLFlBQUE7SUFBRSxZQUFZLFlBQUEsQ0FBQTs7QUFFcEYsSUFBTSxrQkFBa0IsR0FBRyxTQUFyQixrQkFBa0IsR0FBUztBQUMvQixNQUFJLENBQUMsWUFBWSxFQUFFO0FBQ2pCLGdCQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUM5QyxnQkFBWSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsMEJBQTBCLENBQUMsQ0FBQTtBQUNoRSxZQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQTtHQUN4QztDQUNGLENBQUE7O0FBRUQsSUFBTSxrQkFBa0IsR0FBRyxTQUFyQixrQkFBa0IsR0FBUztBQUMvQixNQUFJLFlBQVksRUFBRTtBQUNoQixnQkFBWSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUE7QUFDakQsZ0JBQVksR0FBRyxJQUFJLENBQUE7R0FDcEI7Q0FDRixDQUFBOztBQUVELElBQU0sa0JBQWtCLEdBQUcsU0FBckIsa0JBQWtCLENBQUksS0FBSyxFQUFLO0FBQ3BDLE1BQUksWUFBWSxFQUFFO0FBQ2hCLFFBQUksS0FBSyxFQUFFO0FBQ1Qsa0JBQVksQ0FBQyxXQUFXLGdKQUdQLEtBQUssdUJBRXJCLENBQUE7S0FDRixNQUFNO0FBQ0wsa0JBQVksQ0FBQyxXQUFXLGtLQUt2QixDQUFBO0tBQ0Y7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LFlBQU0sS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUEsR0FBSSxLQUFLLENBQUE7QUFDeEMsWUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQTs7QUFFbEIsWUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFO0FBQUUsK0JBQXFCLENBQUMsTUFBTSxDQUFDLENBQUE7U0FBRTtPQUNwRCxDQUFBOztBQUVELFlBQU0sRUFBRSxDQUFBO0tBQ1Q7Ozt3QkExMENrQixjQUFjO0FBQWQsZ0JBQWMsR0FEbEMsa0tBQTBFLENBQ3RELGNBQWMsS0FBZCxjQUFjO0FBQWQsZ0JBQWMsR0FGbEMsb0NBQVEsMEJBQTBCLENBQUMsQ0FFZixjQUFjLEtBQWQsY0FBYztTQUFkLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL21pbmltYXAtZWxlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7RXZlbnRzRGVsZWdhdGlvbiwgQW5jZXN0b3JzTWV0aG9kc30gZnJvbSAnYXRvbS11dGlscydcbmltcG9ydCBET01TdHlsZXNSZWFkZXIgZnJvbSAnLi9taXhpbnMvZG9tLXN0eWxlcy1yZWFkZXInXG5pbXBvcnQgQ2FudmFzRHJhd2VyIGZyb20gJy4vbWl4aW5zL2NhbnZhcy1kcmF3ZXInXG5pbXBvcnQgaW5jbHVkZSBmcm9tICcuL2RlY29yYXRvcnMvaW5jbHVkZSdcbmltcG9ydCBlbGVtZW50IGZyb20gJy4vZGVjb3JhdG9ycy9lbGVtZW50J1xuXG5sZXQgTWFpbiwgTWluaW1hcFF1aWNrU2V0dGluZ3NFbGVtZW50LCBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlLCBvdmVybGF5U3R5bGVcblxuY29uc3QgZW5zdXJlT3ZlcmxheVN0eWxlID0gKCkgPT4ge1xuICBpZiAoIW92ZXJsYXlTdHlsZSkge1xuICAgIG92ZXJsYXlTdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgICBvdmVybGF5U3R5bGUuc2V0QXR0cmlidXRlKCdjb250ZXh0JywgJ2F0b20tdGV4dC1lZGl0b3ItbWluaW1hcCcpXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChvdmVybGF5U3R5bGUpXG4gIH1cbn1cblxuY29uc3QgcmVtb3ZlT3ZlcmxheVN0eWxlID0gKCkgPT4ge1xuICBpZiAob3ZlcmxheVN0eWxlKSB7XG4gICAgb3ZlcmxheVN0eWxlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob3ZlcmxheVN0eWxlKVxuICAgIG92ZXJsYXlTdHlsZSA9IG51bGxcbiAgfVxufVxuXG5jb25zdCB1cGRhdGVPdmVybGF5U3R5bGUgPSAoYmFzaXMpID0+IHtcbiAgaWYgKG92ZXJsYXlTdHlsZSkge1xuICAgIGlmIChiYXNpcykge1xuICAgICAgb3ZlcmxheVN0eWxlLnRleHRDb250ZW50ID0gYFxuICAgICAgYXRvbS10ZXh0LWVkaXRvclt3aXRoLW1pbmltYXBdOjpzaGFkb3cgYXRvbS1vdmVybGF5LFxuICAgICAgYXRvbS10ZXh0LWVkaXRvclt3aXRoLW1pbmltYXBdIGF0b20tb3ZlcmxheSB7XG4gICAgICAgIG1hcmdpbi1sZWZ0OiAke2Jhc2lzfTtcbiAgICAgIH1cbiAgICAgIGBcbiAgICB9IGVsc2Uge1xuICAgICAgb3ZlcmxheVN0eWxlLnRleHRDb250ZW50ID0gYFxuICAgICAgYXRvbS10ZXh0LWVkaXRvclt3aXRoLW1pbmltYXBdOjpzaGFkb3cgYXRvbS1vdmVybGF5LFxuICAgICAgYXRvbS10ZXh0LWVkaXRvclt3aXRoLW1pbmltYXBdIGF0b20tb3ZlcmxheSB7XG4gICAgICAgIG1hcmdpbi1sZWZ0OiAxMCU7XG4gICAgICB9XG4gICAgICBgXG4gICAgfVxuICB9XG59XG5cbmNvbnN0IFNQRUNfTU9ERSA9IGF0b20uaW5TcGVjTW9kZSgpXG5cbi8qKlxuICogUHVibGljOiBUaGUgTWluaW1hcEVsZW1lbnQgaXMgdGhlIHZpZXcgbWVhbnQgdG8gcmVuZGVyIGEge0BsaW5rIE1pbmltYXB9XG4gKiBpbnN0YW5jZSBpbiB0aGUgRE9NLlxuICpcbiAqIFlvdSBjYW4gcmV0cmlldmUgdGhlIE1pbmltYXBFbGVtZW50IGFzc29jaWF0ZWQgdG8gYSBNaW5pbWFwXG4gKiB1c2luZyB0aGUgYGF0b20udmlld3MuZ2V0Vmlld2AgbWV0aG9kLlxuICpcbiAqIE5vdGUgdGhhdCBtb3N0IGludGVyYWN0aW9ucyB3aXRoIHRoZSBNaW5pbWFwIHBhY2thZ2UgaXMgZG9uZSB0aHJvdWdoIHRoZVxuICogTWluaW1hcCBtb2RlbCBzbyB5b3Ugc2hvdWxkIG5ldmVyIGhhdmUgdG8gYWNjZXNzIE1pbmltYXBFbGVtZW50XG4gKiBpbnN0YW5jZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGxldCBtaW5pbWFwRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhtaW5pbWFwKVxuICovXG5AZWxlbWVudCgnYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwJylcbkBpbmNsdWRlKERPTVN0eWxlc1JlYWRlciwgQ2FudmFzRHJhd2VyLCBFdmVudHNEZWxlZ2F0aW9uLCBBbmNlc3RvcnNNZXRob2RzKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWluaW1hcEVsZW1lbnQge1xuXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAjIyAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgIyMgICMjICAgIyNcbiAgLy8gICAgIyMjIyMjIyMjICMjICAgICAjIyAjIyAgICAgIyMgIyMjIyMgICAgICMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgIyMgICAgICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICMjICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICMjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAgIyMjIyMjXG5cbiAgLyoqXG4gICAqIERPTSBjYWxsYmFjayBpbnZva2VkIHdoZW4gYSBuZXcgTWluaW1hcEVsZW1lbnQgaXMgY3JlYXRlZC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVkQ2FsbGJhY2sgKCkge1xuICAgIGlmICghQ29tcG9zaXRlRGlzcG9zYWJsZSkge1xuICAgICAgKHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKSlcbiAgICB9XG5cbiAgICAvLyBDb3JlIHByb3BlcnRpZXNcblxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMubWluaW1hcCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZWRpdG9yRWxlbWVudCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMud2lkdGggPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmhlaWdodCA9IHVuZGVmaW5lZFxuXG4gICAgLy8gU3Vic2NyaXB0aW9uc1xuXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMudmlzaWJsZUFyZWFTdWJzY3JpcHRpb24gPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnF1aWNrU2V0dGluZ3NTdWJzY3JpcHRpb24gPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmRyYWdTdWJzY3JpcHRpb24gPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdTdWJzY3JpcHRpb24gPSB1bmRlZmluZWRcblxuICAgIC8vIENvbmZpZ3NcblxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0ID0gZmFsc2VcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuZGlzcGxheU1pbmltYXBPbkxlZnQgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMudGV4dE9wYWNpdHkgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5kaXNwbGF5Q29kZUhpZ2hsaWdodHMgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5hZGp1c3RUb1NvZnRXcmFwID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24gPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5hYnNvbHV0ZU1vZGUgPSB1bmRlZmluZWRcblxuICAgIC8vIEVsZW1lbnRzXG5cbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnNoYWRvd1Jvb3QgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnZpc2libGVBcmVhID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5jb250cm9scyA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuc2Nyb2xsSW5kaWNhdG9yID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5vcGVuUXVpY2tTZXR0aW5ncyA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQgPSB1bmRlZmluZWRcblxuICAgIC8vIFN0YXRlc1xuXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuYXR0YWNoZWQgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5hdHRhY2hlZFRvVGV4dEVkaXRvciA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLnN0YW5kQWxvbmUgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLndhc1Zpc2libGUgPSB1bmRlZmluZWRcblxuICAgIC8vIE90aGVyXG5cbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNjcmVlbkZpcnN0Um93ID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5vZmZzY3JlZW5MYXN0Um93ID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5mcmFtZVJlcXVlc3RlZCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZmxleEJhc2lzID0gdW5kZWZpbmVkXG5cbiAgICB0aGlzLmluaXRpYWxpemVDb250ZW50KClcblxuICAgIHJldHVybiB0aGlzLm9ic2VydmVDb25maWcoe1xuICAgICAgJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnOiAoZGlzcGxheU1pbmltYXBPbkxlZnQpID0+IHtcbiAgICAgICAgdGhpcy5kaXNwbGF5TWluaW1hcE9uTGVmdCA9IGRpc3BsYXlNaW5pbWFwT25MZWZ0XG5cbiAgICAgICAgZGlzcGxheU1pbmltYXBPbkxlZnRcbiAgICAgICAgICA/IGVuc3VyZU92ZXJsYXlTdHlsZSgpXG4gICAgICAgICAgOiByZW1vdmVPdmVybGF5U3R5bGUoKVxuICAgICAgICB0aGlzLnVwZGF0ZU1pbmltYXBGbGV4UG9zaXRpb24oKVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAubWluaW1hcFNjcm9sbEluZGljYXRvcic6IChtaW5pbWFwU2Nyb2xsSW5kaWNhdG9yKSA9PiB7XG4gICAgICAgIHRoaXMubWluaW1hcFNjcm9sbEluZGljYXRvciA9IG1pbmltYXBTY3JvbGxJbmRpY2F0b3JcblxuICAgICAgICBpZiAodGhpcy5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yICYmICEodGhpcy5zY3JvbGxJbmRpY2F0b3IgIT0gbnVsbCkgJiYgIXRoaXMuc3RhbmRBbG9uZSkge1xuICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZVNjcm9sbEluZGljYXRvcigpXG4gICAgICAgIH0gZWxzZSBpZiAoKHRoaXMuc2Nyb2xsSW5kaWNhdG9yICE9IG51bGwpKSB7XG4gICAgICAgICAgdGhpcy5kaXNwb3NlU2Nyb2xsSW5kaWNhdG9yKClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnOiAoZGlzcGxheVBsdWdpbnNDb250cm9scykgPT4ge1xuICAgICAgICB0aGlzLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMgPSBkaXNwbGF5UGx1Z2luc0NvbnRyb2xzXG5cbiAgICAgICAgaWYgKHRoaXMuZGlzcGxheVBsdWdpbnNDb250cm9scyAmJiAhKHRoaXMub3BlblF1aWNrU2V0dGluZ3MgIT0gbnVsbCkgJiYgIXRoaXMuc3RhbmRBbG9uZSkge1xuICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZU9wZW5RdWlja1NldHRpbmdzKClcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5vcGVuUXVpY2tTZXR0aW5ncyAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMuZGlzcG9zZU9wZW5RdWlja1NldHRpbmdzKClcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAudGV4dE9wYWNpdHknOiAodGV4dE9wYWNpdHkpID0+IHtcbiAgICAgICAgdGhpcy50ZXh0T3BhY2l0eSA9IHRleHRPcGFjaXR5XG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAuZGlzcGxheUNvZGVIaWdobGlnaHRzJzogKGRpc3BsYXlDb2RlSGlnaGxpZ2h0cykgPT4ge1xuICAgICAgICB0aGlzLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cyA9IGRpc3BsYXlDb2RlSGlnaGxpZ2h0c1xuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLnNtb290aFNjcm9sbGluZyc6IChzbW9vdGhTY3JvbGxpbmcpID0+IHtcbiAgICAgICAgdGhpcy5zbW9vdGhTY3JvbGxpbmcgPSBzbW9vdGhTY3JvbGxpbmdcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkge1xuICAgICAgICAgIGlmICghdGhpcy5zbW9vdGhTY3JvbGxpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuYmFja0xheWVyLmNhbnZhcy5zdHlsZS5jc3NUZXh0ID0gJydcbiAgICAgICAgICAgIHRoaXMudG9rZW5zTGF5ZXIuY2FudmFzLnN0eWxlLmNzc1RleHQgPSAnJ1xuICAgICAgICAgICAgdGhpcy5mcm9udExheWVyLmNhbnZhcy5zdHlsZS5jc3NUZXh0ID0gJydcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmFkanVzdE1pbmltYXBXaWR0aFRvU29mdFdyYXAnOiAoYWRqdXN0VG9Tb2Z0V3JhcCkgPT4ge1xuICAgICAgICB0aGlzLmFkanVzdFRvU29mdFdyYXAgPSBhZGp1c3RUb1NvZnRXcmFwXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKSB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5hZGp1c3RNaW5pbWFwV2lkdGhPbmx5SWZTbWFsbGVyJzogKGFkanVzdE9ubHlJZlNtYWxsZXIpID0+IHtcbiAgICAgICAgdGhpcy5hZGp1c3RPbmx5SWZTbWFsbGVyID0gYWRqdXN0T25seUlmU21hbGxlclxuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMubWVhc3VyZUhlaWdodEFuZFdpZHRoKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24nOiAodXNlSGFyZHdhcmVBY2NlbGVyYXRpb24pID0+IHtcbiAgICAgICAgdGhpcy51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbiA9IHVzZUhhcmR3YXJlQWNjZWxlcmF0aW9uXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0VXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAuYWJzb2x1dGVNb2RlJzogKGFic29sdXRlTW9kZSkgPT4ge1xuICAgICAgICB0aGlzLmFic29sdXRlTW9kZSA9IGFic29sdXRlTW9kZVxuXG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnYWJzb2x1dGUnLCB0aGlzLmFic29sdXRlTW9kZSlcbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCc6IChhZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQpID0+IHtcbiAgICAgICAgdGhpcy5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQgPSBhZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHRcblxuICAgICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2FkanVzdC1hYnNvbHV0ZS1oZWlnaHQnLCB0aGlzLmFkanVzdEFic29sdXRlTW9kZUhlaWdodClcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmlnbm9yZVdoaXRlc3BhY2VzSW5Ub2tlbnMnOiAoaWdub3JlV2hpdGVzcGFjZXNJblRva2VucykgPT4ge1xuICAgICAgICB0aGlzLmlnbm9yZVdoaXRlc3BhY2VzSW5Ub2tlbnMgPSBpZ25vcmVXaGl0ZXNwYWNlc0luVG9rZW5zXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJzogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3Iuc29mdFdyYXAnOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3Iuc2hvd0ludmlzaWJsZXMnOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3IuaW52aXNpYmxlcyc6ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0VXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ2VkaXRvci5zb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCc6ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0VXBkYXRlKCkgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogRE9NIGNhbGxiYWNrIGludm9rZWQgd2hlbiBhIG5ldyBNaW5pbWFwRWxlbWVudCBpcyBhdHRhY2hlZCB0byB0aGUgRE9NLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGF0dGFjaGVkQ2FsbGJhY2sgKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS52aWV3cy5wb2xsRG9jdW1lbnQoKCkgPT4geyB0aGlzLnBvbGxET00oKSB9KSlcbiAgICB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpXG4gICAgdGhpcy51cGRhdGVNaW5pbWFwRmxleFBvc2l0aW9uKClcbiAgICB0aGlzLmF0dGFjaGVkID0gdHJ1ZVxuICAgIHRoaXMuYXR0YWNoZWRUb1RleHRFZGl0b3IgPSB0aGlzLnBhcmVudE5vZGUgPT09IHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290KClcblxuICAgIGlmICh0aGlzLmF0dGFjaGVkVG9UZXh0RWRpdG9yKSB7XG4gICAgICB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50KCkuc2V0QXR0cmlidXRlKCd3aXRoLW1pbmltYXAnLCAnJylcbiAgICB9XG5cbiAgICAvKlxuICAgICAgV2UgdXNlIGBhdG9tLnN0eWxlcy5vbkRpZEFkZFN0eWxlRWxlbWVudGAgaW5zdGVhZCBvZlxuICAgICAgYGF0b20udGhlbWVzLm9uRGlkQ2hhbmdlQWN0aXZlVGhlbWVzYC5cbiAgICAgIFdoeT8gQ3VycmVudGx5LCBUaGUgc3R5bGUgZWxlbWVudCB3aWxsIGJlIHJlbW92ZWQgZmlyc3QsIGFuZCB0aGVuIHJlLWFkZGVkXG4gICAgICBhbmQgdGhlIGBjaGFuZ2VgIGV2ZW50IGhhcyBub3QgYmUgdHJpZ2dlcmVkIGluIHRoZSBwcm9jZXNzLlxuICAgICovXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLnN0eWxlcy5vbkRpZEFkZFN0eWxlRWxlbWVudCgoKSA9PiB7XG4gICAgICB0aGlzLmludmFsaWRhdGVET01TdHlsZXNDYWNoZSgpXG4gICAgICB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnN1YnNjcmliZVRvTWVkaWFRdWVyeSgpKVxuICB9XG5cbiAgLyoqXG4gICAqIERPTSBjYWxsYmFjayBpbnZva2VkIHdoZW4gYSBuZXcgTWluaW1hcEVsZW1lbnQgaXMgZGV0YWNoZWQgZnJvbSB0aGUgRE9NLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRldGFjaGVkQ2FsbGJhY2sgKCkge1xuICAgIHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKS5yZW1vdmVBdHRyaWJ1dGUoJ3dpdGgtbWluaW1hcCcpXG4gICAgdGhpcy5hdHRhY2hlZCA9IGZhbHNlXG4gIH1cblxuICAvLyAgICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyMgICAgIyMjICAgICAjIyMjIyMgICMjICAgICAjI1xuICAvLyAgICAgICMjICMjICAgICAgIyMgICAgICAgIyMgICAgICAjIyAjIyAgICMjICAgICMjICMjICAgICAjI1xuICAvLyAgICAgIyMgICAjIyAgICAgIyMgICAgICAgIyMgICAgICMjICAgIyMgICMjICAgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICMjICAgICAgICMjIyMjIyMjI1xuICAvLyAgICAjIyMjIyMjIyMgICAgIyMgICAgICAgIyMgICAgIyMjIyMjIyMjICMjICAgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICMjICAgICMjICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICAjIyMjIyMgICMjICAgICAjI1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIE1pbmltYXBFbGVtZW50IGlzIGN1cnJlbnRseSB2aXNpYmxlIG9uIHNjcmVlbiBvciBub3QuXG4gICAqXG4gICAqIFRoZSB2aXNpYmlsaXR5IG9mIHRoZSBtaW5pbWFwIGlzIGRlZmluZWQgYnkgdGVzdGluZyB0aGUgc2l6ZSBvZiB0aGUgb2Zmc2V0XG4gICAqIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIGVsZW1lbnQuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgdGhlIE1pbmltYXBFbGVtZW50IGlzIGN1cnJlbnRseSB2aXNpYmxlIG9yIG5vdFxuICAgKi9cbiAgaXNWaXNpYmxlICgpIHsgcmV0dXJuIHRoaXMub2Zmc2V0V2lkdGggPiAwIHx8IHRoaXMub2Zmc2V0SGVpZ2h0ID4gMCB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIHRoZSBNaW5pbWFwRWxlbWVudCB0byB0aGUgRE9NLlxuICAgKlxuICAgKiBUaGUgcG9zaXRpb24gYXQgd2hpY2ggdGhlIGVsZW1lbnQgaXMgYXR0YWNoZWQgaXMgZGVmaW5lZCBieSB0aGVcbiAgICogYGRpc3BsYXlNaW5pbWFwT25MZWZ0YCBzZXR0aW5nLlxuICAgKlxuICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gW3BhcmVudF0gdGhlIERPTSBub2RlIHdoZXJlIGF0dGFjaGluZyB0aGUgbWluaW1hcFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFxuICAgKi9cbiAgYXR0YWNoIChwYXJlbnQpIHtcbiAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyByZXR1cm4gfVxuXG4gICAgY29uc3QgY29udGFpbmVyID0gcGFyZW50IHx8IHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290KClcbiAgICBsZXQgbWluaW1hcHMgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwJylcbiAgICBpZiAobWluaW1hcHMubGVuZ3RoKSB7XG4gICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKG1pbmltYXBzLCAoZWwpID0+IHsgZWwuZGVzdHJveSgpIH0pXG4gICAgfVxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzKVxuICB9XG5cbiAgLyoqXG4gICAqIERldGFjaGVzIHRoZSBNaW5pbWFwRWxlbWVudCBmcm9tIHRoZSBET00uXG4gICAqL1xuICBkZXRhY2ggKCkge1xuICAgIGlmICghdGhpcy5hdHRhY2hlZCB8fCB0aGlzLnBhcmVudE5vZGUgPT0gbnVsbCkgeyByZXR1cm4gfVxuICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKVxuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIG1pbmltYXAgbGVmdC9yaWdodCBwb3NpdGlvbiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhlXG4gICAqIGBkaXNwbGF5TWluaW1hcE9uTGVmdGAgc2V0dGluZy5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVNaW5pbWFwRmxleFBvc2l0aW9uICgpIHtcbiAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2xlZnQnLCB0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0KVxuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoaXMgTWluaW1hcEVsZW1lbnRcbiAgICovXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLmRldGFjaCgpXG4gICAgdGhpcy5taW5pbWFwID0gbnVsbFxuICB9XG5cbiAgLy8gICAgICMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICMjIyMjIyMjICMjIyMjIyMjICMjICAgICMjICMjIyMjIyMjXG4gIC8vICAgICMjICAgICMjICMjICAgICAjIyAjIyMgICAjIyAgICAjIyAgICAjIyAgICAgICAjIyMgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMjIyAgIyMgICAgIyMgICAgIyMgICAgICAgIyMjIyAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICMjICMjICAgICMjICAgICMjIyMjIyAgICMjICMjICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAgIyMjIyAgICAjIyAgICAjIyAgICAgICAjIyAgIyMjIyAgICAjI1xuICAvLyAgICAjIyAgICAjIyAjIyAgICAgIyMgIyMgICAjIyMgICAgIyMgICAgIyMgICAgICAgIyMgICAjIyMgICAgIyNcbiAgLy8gICAgICMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICAgICMjICAgICMjIyMjIyMjICMjICAgICMjICAgICMjXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIGNvbnRlbnQgb2YgdGhlIE1pbmltYXBFbGVtZW50IGFuZCBhdHRhY2hlcyB0aGUgbW91c2UgY29udHJvbFxuICAgKiBldmVudCBsaXN0ZW5lcnMuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZUNvbnRlbnQgKCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZUNhbnZhcygpXG5cbiAgICB0aGlzLnNoYWRvd1Jvb3QgPSB0aGlzLmNyZWF0ZVNoYWRvd1Jvb3QoKVxuICAgIHRoaXMuYXR0YWNoQ2FudmFzZXModGhpcy5zaGFkb3dSb290KVxuXG4gICAgdGhpcy5jcmVhdGVWaXNpYmxlQXJlYSgpXG4gICAgdGhpcy5jcmVhdGVDb250cm9scygpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuc3Vic2NyaWJlVG8odGhpcywge1xuICAgICAgJ21vdXNld2hlZWwnOiAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3RhbmRBbG9uZSkge1xuICAgICAgICAgIHRoaXMucmVsYXlNb3VzZXdoZWVsRXZlbnQoZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnN1YnNjcmliZVRvKHRoaXMuZ2V0RnJvbnRDYW52YXMoKSwge1xuICAgICAgJ21vdXNlZG93bic6IChlKSA9PiB7IHRoaXMuY2FudmFzUHJlc3NlZCh0aGlzLmV4dHJhY3RNb3VzZUV2ZW50RGF0YShlKSkgfSxcbiAgICAgICd0b3VjaHN0YXJ0JzogKGUpID0+IHsgdGhpcy5jYW52YXNQcmVzc2VkKHRoaXMuZXh0cmFjdFRvdWNoRXZlbnREYXRhKGUpKSB9XG4gICAgfSkpXG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHZpc2libGUgYXJlYSBkaXYuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlVmlzaWJsZUFyZWEgKCkge1xuICAgIGlmICh0aGlzLnZpc2libGVBcmVhKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLnZpc2libGVBcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLnZpc2libGVBcmVhLmNsYXNzTGlzdC5hZGQoJ21pbmltYXAtdmlzaWJsZS1hcmVhJylcbiAgICB0aGlzLnNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQodGhpcy52aXNpYmxlQXJlYSlcbiAgICB0aGlzLnZpc2libGVBcmVhU3Vic2NyaXB0aW9uID0gdGhpcy5zdWJzY3JpYmVUbyh0aGlzLnZpc2libGVBcmVhLCB7XG4gICAgICAnbW91c2Vkb3duJzogKGUpID0+IHsgdGhpcy5zdGFydERyYWcodGhpcy5leHRyYWN0TW91c2VFdmVudERhdGEoZSkpIH0sXG4gICAgICAndG91Y2hzdGFydCc6IChlKSA9PiB7IHRoaXMuc3RhcnREcmFnKHRoaXMuZXh0cmFjdFRvdWNoRXZlbnREYXRhKGUpKSB9XG4gICAgfSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy52aXNpYmxlQXJlYVN1YnNjcmlwdGlvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSB2aXNpYmxlIGFyZWEgZGl2LlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHJlbW92ZVZpc2libGVBcmVhICgpIHtcbiAgICBpZiAoIXRoaXMudmlzaWJsZUFyZWEpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5yZW1vdmUodGhpcy52aXNpYmxlQXJlYVN1YnNjcmlwdGlvbilcbiAgICB0aGlzLnZpc2libGVBcmVhU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIHRoaXMuc2hhZG93Um9vdC5yZW1vdmVDaGlsZCh0aGlzLnZpc2libGVBcmVhKVxuICAgIGRlbGV0ZSB0aGlzLnZpc2libGVBcmVhXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgY29udHJvbHMgY29udGFpbmVyIGRpdi5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVDb250cm9scyAoKSB7XG4gICAgaWYgKHRoaXMuY29udHJvbHMgfHwgdGhpcy5zdGFuZEFsb25lKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLmNvbnRyb2xzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLmNvbnRyb2xzLmNsYXNzTGlzdC5hZGQoJ21pbmltYXAtY29udHJvbHMnKVxuICAgIHRoaXMuc2hhZG93Um9vdC5hcHBlbmRDaGlsZCh0aGlzLmNvbnRyb2xzKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGNvbnRyb2xzIGNvbnRhaW5lciBkaXYuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgcmVtb3ZlQ29udHJvbHMgKCkge1xuICAgIGlmICghdGhpcy5jb250cm9scykgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5zaGFkb3dSb290LnJlbW92ZUNoaWxkKHRoaXMuY29udHJvbHMpXG4gICAgZGVsZXRlIHRoaXMuY29udHJvbHNcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgc2Nyb2xsIGluZGljYXRvciBkaXYgd2hlbiB0aGUgYG1pbmltYXBTY3JvbGxJbmRpY2F0b3JgXG4gICAqIHNldHRpbmdzIGlzIGVuYWJsZWQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZVNjcm9sbEluZGljYXRvciAoKSB7XG4gICAgaWYgKHRoaXMuc2Nyb2xsSW5kaWNhdG9yIHx8IHRoaXMuc3RhbmRBbG9uZSkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5zY3JvbGxJbmRpY2F0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMuc2Nyb2xsSW5kaWNhdG9yLmNsYXNzTGlzdC5hZGQoJ21pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpXG4gICAgdGhpcy5jb250cm9scy5hcHBlbmRDaGlsZCh0aGlzLnNjcm9sbEluZGljYXRvcilcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlcyB0aGUgc2Nyb2xsIGluZGljYXRvciBkaXYgd2hlbiB0aGUgYG1pbmltYXBTY3JvbGxJbmRpY2F0b3JgXG4gICAqIHNldHRpbmdzIGlzIGRpc2FibGVkLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRpc3Bvc2VTY3JvbGxJbmRpY2F0b3IgKCkge1xuICAgIGlmICghdGhpcy5zY3JvbGxJbmRpY2F0b3IpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuY29udHJvbHMucmVtb3ZlQ2hpbGQodGhpcy5zY3JvbGxJbmRpY2F0b3IpXG4gICAgZGVsZXRlIHRoaXMuc2Nyb2xsSW5kaWNhdG9yXG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHF1aWNrIHNldHRpbmdzIG9wZW5lbmVyIGRpdiB3aGVuIHRoZVxuICAgKiBgZGlzcGxheVBsdWdpbnNDb250cm9sc2Agc2V0dGluZyBpcyBlbmFibGVkLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGluaXRpYWxpemVPcGVuUXVpY2tTZXR0aW5ncyAoKSB7XG4gICAgaWYgKHRoaXMub3BlblF1aWNrU2V0dGluZ3MgfHwgdGhpcy5zdGFuZEFsb25lKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdzLmNsYXNzTGlzdC5hZGQoJ29wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgdGhpcy5jb250cm9scy5hcHBlbmRDaGlsZCh0aGlzLm9wZW5RdWlja1NldHRpbmdzKVxuXG4gICAgdGhpcy5vcGVuUXVpY2tTZXR0aW5nU3Vic2NyaXB0aW9uID0gdGhpcy5zdWJzY3JpYmVUbyh0aGlzLm9wZW5RdWlja1NldHRpbmdzLCB7XG4gICAgICAnbW91c2Vkb3duJzogKGUpID0+IHtcbiAgICAgICAgaWYgKCFNaW5pbWFwUXVpY2tTZXR0aW5nc0VsZW1lbnQpIHtcbiAgICAgICAgICBNaW5pbWFwUXVpY2tTZXR0aW5nc0VsZW1lbnQgPSByZXF1aXJlKCcuL21pbmltYXAtcXVpY2stc2V0dGluZ3MtZWxlbWVudCcpXG4gICAgICAgIH1cblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICAgIGlmICgodGhpcy5xdWlja1NldHRpbmdzRWxlbWVudCAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuZGVzdHJveSgpXG4gICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQgPSBuZXcgTWluaW1hcFF1aWNrU2V0dGluZ3NFbGVtZW50KClcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnNldE1vZGVsKHRoaXMpXG4gICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzU3Vic2NyaXB0aW9uID0gdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudC5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudCA9IG51bGxcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgbGV0IHt0b3AsIGxlZnQsIHJpZ2h0fSA9IHRoaXMuZ2V0RnJvbnRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuc3R5bGUudG9wID0gdG9wICsgJ3B4J1xuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuYXR0YWNoKClcblxuICAgICAgICAgIGlmICh0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0KSB7XG4gICAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnN0eWxlLmxlZnQgPSAocmlnaHQpICsgJ3B4J1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnN0eWxlLmxlZnQgPSAobGVmdCAtIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuY2xpZW50V2lkdGgpICsgJ3B4J1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgdGhlIHF1aWNrIHNldHRpbmdzIG9wZW5lbmVyIGRpdiB3aGVuIHRoZSBgZGlzcGxheVBsdWdpbnNDb250cm9sc2BcbiAgICogc2V0dGluZyBpcyBkaXNhYmxlZC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkaXNwb3NlT3BlblF1aWNrU2V0dGluZ3MgKCkge1xuICAgIGlmICghdGhpcy5vcGVuUXVpY2tTZXR0aW5ncykgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5jb250cm9scy5yZW1vdmVDaGlsZCh0aGlzLm9wZW5RdWlja1NldHRpbmdzKVxuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICBkZWxldGUgdGhpcy5vcGVuUXVpY2tTZXR0aW5nc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHRhcmdldCBgVGV4dEVkaXRvcmAgb2YgdGhlIE1pbmltYXAuXG4gICAqXG4gICAqIEByZXR1cm4ge1RleHRFZGl0b3J9IHRoZSBtaW5pbWFwJ3MgdGV4dCBlZGl0b3JcbiAgICovXG4gIGdldFRleHRFZGl0b3IgKCkgeyByZXR1cm4gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3IoKSB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGBUZXh0RWRpdG9yRWxlbWVudGAgZm9yIHRoZSBNaW5pbWFwJ3MgYFRleHRFZGl0b3JgLlxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXh0RWRpdG9yRWxlbWVudH0gdGhlIG1pbmltYXAncyB0ZXh0IGVkaXRvciBlbGVtZW50XG4gICAqL1xuICBnZXRUZXh0RWRpdG9yRWxlbWVudCAoKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yRWxlbWVudCkgeyByZXR1cm4gdGhpcy5lZGl0b3JFbGVtZW50IH1cblxuICAgIHRoaXMuZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLmdldFRleHRFZGl0b3IoKSlcbiAgICByZXR1cm4gdGhpcy5lZGl0b3JFbGVtZW50XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcm9vdCBvZiB0aGUgYFRleHRFZGl0b3JFbGVtZW50YCBjb250ZW50LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBtb3N0bHkgdXNlZCB0byBlbnN1cmUgY29tcGF0aWJpbGl0eSB3aXRoIHRoZSBgc2hhZG93RG9tYFxuICAgKiBzZXR0aW5nLlxuICAgKlxuICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gdGhlIHJvb3Qgb2YgdGhlIGBUZXh0RWRpdG9yRWxlbWVudGAgY29udGVudFxuICAgKi9cbiAgZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290ICgpIHtcbiAgICBsZXQgZWRpdG9yRWxlbWVudCA9IHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKVxuXG4gICAgaWYgKGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdCkge1xuICAgICAgcmV0dXJuIGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZWRpdG9yRWxlbWVudFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByb290IHdoZXJlIHRvIGluamVjdCB0aGUgZHVtbXkgbm9kZSB1c2VkIHRvIHJlYWQgRE9NIHN0eWxlcy5cbiAgICpcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gc2hhZG93Um9vdCB3aGV0aGVyIHRvIHVzZSB0aGUgdGV4dCBlZGl0b3Igc2hhZG93IERPTVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yIG5vdFxuICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gdGhlIHJvb3Qgbm9kZSB3aGVyZSBhcHBlbmRpbmcgdGhlIGR1bW15IG5vZGVcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBnZXREdW1teURPTVJvb3QgKHNoYWRvd1Jvb3QpIHtcbiAgICBpZiAoc2hhZG93Um9vdCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290KClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKVxuICAgIH1cbiAgfVxuXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyMjICMjXG4gIC8vICAgICMjIyAgICMjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjIyMgIyMjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjICMjIyAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjIyMjIyAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIE1pbmltYXAgZm9yIHdoaWNoIHRoaXMgTWluaW1hcEVsZW1lbnQgd2FzIGNyZWF0ZWQuXG4gICAqXG4gICAqIEByZXR1cm4ge01pbmltYXB9IHRoaXMgZWxlbWVudCdzIE1pbmltYXBcbiAgICovXG4gIGdldE1vZGVsICgpIHsgcmV0dXJuIHRoaXMubWluaW1hcCB9XG5cbiAgLyoqXG4gICAqIERlZmluZXMgdGhlIE1pbmltYXAgbW9kZWwgZm9yIHRoaXMgTWluaW1hcEVsZW1lbnQgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSAge01pbmltYXB9IG1pbmltYXAgdGhlIE1pbmltYXAgbW9kZWwgZm9yIHRoaXMgaW5zdGFuY2UuXG4gICAqIEByZXR1cm4ge01pbmltYXB9IHRoaXMgZWxlbWVudCdzIE1pbmltYXBcbiAgICovXG4gIHNldE1vZGVsIChtaW5pbWFwKSB7XG4gICAgaWYgKCFNYWluKSB7IE1haW4gPSByZXF1aXJlKCcuL21haW4nKSB9XG5cbiAgICB0aGlzLm1pbmltYXAgPSBtaW5pbWFwXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VTY3JvbGxUb3AoKCkgPT4ge1xuICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubWluaW1hcC5vbkRpZENoYW5nZVNjcm9sbExlZnQoKCkgPT4ge1xuICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubWluaW1hcC5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgdGhpcy5kZXN0cm95KClcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubWluaW1hcC5vbkRpZENoYW5nZUNvbmZpZygoKSA9PiB7XG4gICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyByZXR1cm4gdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VTdGFuZEFsb25lKCgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhbmRBbG9uZSh0aGlzLm1pbmltYXAuaXNTdGFuZEFsb25lKCkpXG4gICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2UoKGNoYW5nZSkgPT4ge1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcy5wdXNoKGNoYW5nZSlcbiAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubWluaW1hcC5vbkRpZENoYW5nZURlY29yYXRpb25SYW5nZSgoY2hhbmdlKSA9PiB7XG4gICAgICBjb25zdCB7dHlwZX0gPSBjaGFuZ2VcbiAgICAgIGlmICh0eXBlID09PSAnbGluZScgfHwgdHlwZSA9PT0gJ2hpZ2hsaWdodC11bmRlcicgfHwgdHlwZSA9PT0gJ2JhY2tncm91bmQtY3VzdG9tJykge1xuICAgICAgICB0aGlzLnBlbmRpbmdCYWNrRGVjb3JhdGlvbkNoYW5nZXMucHVzaChjaGFuZ2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBlbmRpbmdGcm9udERlY29yYXRpb25DaGFuZ2VzLnB1c2goY2hhbmdlKVxuICAgICAgfVxuICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoTWFpbi5vbkRpZENoYW5nZVBsdWdpbk9yZGVyKCgpID0+IHtcbiAgICAgIHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnNldFN0YW5kQWxvbmUodGhpcy5taW5pbWFwLmlzU3RhbmRBbG9uZSgpKVxuXG4gICAgaWYgKHRoaXMud2lkdGggIT0gbnVsbCAmJiB0aGlzLmhlaWdodCAhPSBudWxsKSB7XG4gICAgICB0aGlzLm1pbmltYXAuc2V0U2NyZWVuSGVpZ2h0QW5kV2lkdGgodGhpcy5oZWlnaHQsIHRoaXMud2lkdGgpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubWluaW1hcFxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHN0YW5kLWFsb25lIG1vZGUgZm9yIHRoaXMgTWluaW1hcEVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc3RhbmRBbG9uZSB0aGUgbmV3IG1vZGUgZm9yIHRoaXMgTWluaW1hcEVsZW1lbnRcbiAgICovXG4gIHNldFN0YW5kQWxvbmUgKHN0YW5kQWxvbmUpIHtcbiAgICB0aGlzLnN0YW5kQWxvbmUgPSBzdGFuZEFsb25lXG5cbiAgICBpZiAodGhpcy5zdGFuZEFsb25lKSB7XG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnc3RhbmQtYWxvbmUnLCB0cnVlKVxuICAgICAgdGhpcy5kaXNwb3NlU2Nyb2xsSW5kaWNhdG9yKClcbiAgICAgIHRoaXMuZGlzcG9zZU9wZW5RdWlja1NldHRpbmdzKClcbiAgICAgIHRoaXMucmVtb3ZlQ29udHJvbHMoKVxuICAgICAgdGhpcy5yZW1vdmVWaXNpYmxlQXJlYSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdzdGFuZC1hbG9uZScpXG4gICAgICB0aGlzLmNyZWF0ZVZpc2libGVBcmVhKClcbiAgICAgIHRoaXMuY3JlYXRlQ29udHJvbHMoKVxuICAgICAgaWYgKHRoaXMubWluaW1hcFNjcm9sbEluZGljYXRvcikgeyB0aGlzLmluaXRpYWxpemVTY3JvbGxJbmRpY2F0b3IoKSB9XG4gICAgICBpZiAodGhpcy5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzKSB7IHRoaXMuaW5pdGlhbGl6ZU9wZW5RdWlja1NldHRpbmdzKCkgfVxuICAgIH1cbiAgfVxuXG4gIC8vICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMjIyMgICAgICMjIyAgICAjIyMjIyMjIyAjIyMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgICMjICMjICAgICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgICMjICAgIyMgICAgICMjICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMgICAgICMjICMjICAgICAjIyAgICAjIyAgICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMjIyMjIyMjICAgICMjICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgICAgIyMgICAgICMjICMjICAgICAjIyAgICAjIyAgICAjI1xuICAvLyAgICAgIyMjIyMjIyAgIyMgICAgICAgICMjIyMjIyMjICAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjIyNcblxuICAvKipcbiAgICogUmVxdWVzdHMgYW4gdXBkYXRlIHRvIGJlIHBlcmZvcm1lZCBvbiB0aGUgbmV4dCBmcmFtZS5cbiAgICovXG4gIHJlcXVlc3RVcGRhdGUgKCkge1xuICAgIGlmICh0aGlzLmZyYW1lUmVxdWVzdGVkKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLmZyYW1lUmVxdWVzdGVkID0gdHJ1ZVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICB0aGlzLmZyYW1lUmVxdWVzdGVkID0gZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVlc3RzIGFuIHVwZGF0ZSB0byBiZSBwZXJmb3JtZWQgb24gdGhlIG5leHQgZnJhbWUgdGhhdCB3aWxsIGNvbXBsZXRlbHlcbiAgICogcmVkcmF3IHRoZSBtaW5pbWFwLlxuICAgKi9cbiAgcmVxdWVzdEZvcmNlZFVwZGF0ZSAoKSB7XG4gICAgdGhpcy5vZmZzY3JlZW5GaXJzdFJvdyA9IG51bGxcbiAgICB0aGlzLm9mZnNjcmVlbkxhc3RSb3cgPSBudWxsXG4gICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgYWN0dWFsIE1pbmltYXBFbGVtZW50IHVwZGF0ZS5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICB1cGRhdGUgKCkge1xuICAgIGlmICghKHRoaXMuYXR0YWNoZWQgJiYgdGhpcy5pc1Zpc2libGUoKSAmJiB0aGlzLm1pbmltYXApKSB7IHJldHVybiB9XG4gICAgY29uc3QgbWluaW1hcCA9IHRoaXMubWluaW1hcFxuICAgIG1pbmltYXAuZW5hYmxlQ2FjaGUoKVxuICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMuZ2V0RnJvbnRDYW52YXMoKVxuXG4gICAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IHRoaXMubWluaW1hcC5nZXREZXZpY2VQaXhlbFJhdGlvKClcbiAgICBjb25zdCB2aXNpYmxlQXJlYUxlZnQgPSBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRTY3JvbGxMZWZ0KClcbiAgICBjb25zdCB2aXNpYmxlQXJlYVRvcCA9IG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbFRvcCgpIC0gbWluaW1hcC5nZXRTY3JvbGxUb3AoKVxuICAgIGNvbnN0IHZpc2libGVXaWR0aCA9IE1hdGgubWluKGNhbnZhcy53aWR0aCAvIGRldmljZVBpeGVsUmF0aW8sIHRoaXMud2lkdGgpXG5cbiAgICBpZiAodGhpcy5hZGp1c3RUb1NvZnRXcmFwICYmIHRoaXMuZmxleEJhc2lzKSB7XG4gICAgICB0aGlzLnN0eWxlLmZsZXhCYXNpcyA9IHRoaXMuZmxleEJhc2lzICsgJ3B4J1xuICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IHRoaXMuZmxleEJhc2lzICsgJ3B4J1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0eWxlLmZsZXhCYXNpcyA9IG51bGxcbiAgICAgIHRoaXMuc3R5bGUud2lkdGggPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKFNQRUNfTU9ERSkge1xuICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLnZpc2libGVBcmVhLCB7XG4gICAgICAgIHdpZHRoOiB2aXNpYmxlV2lkdGggKyAncHgnLFxuICAgICAgICBoZWlnaHQ6IG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpICsgJ3B4JyxcbiAgICAgICAgdG9wOiB2aXNpYmxlQXJlYVRvcCArICdweCcsXG4gICAgICAgICdib3JkZXItbGVmdC13aWR0aCc6IHZpc2libGVBcmVhTGVmdCArICdweCdcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy52aXNpYmxlQXJlYSwge1xuICAgICAgICB3aWR0aDogdmlzaWJsZVdpZHRoICsgJ3B4JyxcbiAgICAgICAgaGVpZ2h0OiBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSArICdweCcsXG4gICAgICAgIHRyYW5zZm9ybTogdGhpcy5tYWtlVHJhbnNsYXRlKDAsIHZpc2libGVBcmVhVG9wKSxcbiAgICAgICAgJ2JvcmRlci1sZWZ0LXdpZHRoJzogdmlzaWJsZUFyZWFMZWZ0ICsgJ3B4J1xuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuY29udHJvbHMsIHt3aWR0aDogdmlzaWJsZVdpZHRoICsgJ3B4J30pXG5cbiAgICBsZXQgY2FudmFzVG9wID0gbWluaW1hcC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSAqIG1pbmltYXAuZ2V0TGluZUhlaWdodCgpIC0gbWluaW1hcC5nZXRTY3JvbGxUb3AoKVxuXG4gICAgaWYgKHRoaXMuc21vb3RoU2Nyb2xsaW5nKSB7XG4gICAgICBpZiAoU1BFQ19NT0RFKSB7XG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5iYWNrTGF5ZXIuY2FudmFzLCB7dG9wOiBjYW52YXNUb3AgKyAncHgnfSlcbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLnRva2Vuc0xheWVyLmNhbnZhcywge3RvcDogY2FudmFzVG9wICsgJ3B4J30pXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5mcm9udExheWVyLmNhbnZhcywge3RvcDogY2FudmFzVG9wICsgJ3B4J30pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgY2FudmFzVHJhbnNmb3JtID0gdGhpcy5tYWtlVHJhbnNsYXRlKDAsIGNhbnZhc1RvcClcbiAgICAgICAgaWYgKGRldmljZVBpeGVsUmF0aW8gIT09IDEpIHtcbiAgICAgICAgICBjYW52YXNUcmFuc2Zvcm0gKz0gJyAnICsgdGhpcy5tYWtlU2NhbGUoMSAvIGRldmljZVBpeGVsUmF0aW8pXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmJhY2tMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy50b2tlbnNMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5mcm9udExheWVyLmNhbnZhcywge3RyYW5zZm9ybTogY2FudmFzVHJhbnNmb3JtfSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY2FudmFzVHJhbnNmb3JtID0gdGhpcy5tYWtlU2NhbGUoMSAvIGRldmljZVBpeGVsUmF0aW8pXG4gICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuYmFja0xheWVyLmNhbnZhcywge3RyYW5zZm9ybTogY2FudmFzVHJhbnNmb3JtfSlcbiAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy50b2tlbnNMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuZnJvbnRMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgfVxuXG4gICAgaWYgKHRoaXMubWluaW1hcFNjcm9sbEluZGljYXRvciAmJiBtaW5pbWFwLmNhblNjcm9sbCgpICYmICF0aGlzLnNjcm9sbEluZGljYXRvcikge1xuICAgICAgdGhpcy5pbml0aWFsaXplU2Nyb2xsSW5kaWNhdG9yKClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zY3JvbGxJbmRpY2F0b3IgIT0gbnVsbCkge1xuICAgICAgbGV0IG1pbmltYXBTY3JlZW5IZWlnaHQgPSBtaW5pbWFwLmdldFNjcmVlbkhlaWdodCgpXG4gICAgICBsZXQgaW5kaWNhdG9ySGVpZ2h0ID0gbWluaW1hcFNjcmVlbkhlaWdodCAqIChtaW5pbWFwU2NyZWVuSGVpZ2h0IC8gbWluaW1hcC5nZXRIZWlnaHQoKSlcbiAgICAgIGxldCBpbmRpY2F0b3JTY3JvbGwgPSAobWluaW1hcFNjcmVlbkhlaWdodCAtIGluZGljYXRvckhlaWdodCkgKiBtaW5pbWFwLmdldFNjcm9sbFJhdGlvKClcblxuICAgICAgaWYgKFNQRUNfTU9ERSkge1xuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuc2Nyb2xsSW5kaWNhdG9yLCB7XG4gICAgICAgICAgaGVpZ2h0OiBpbmRpY2F0b3JIZWlnaHQgKyAncHgnLFxuICAgICAgICAgIHRvcDogaW5kaWNhdG9yU2Nyb2xsICsgJ3B4J1xuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLnNjcm9sbEluZGljYXRvciwge1xuICAgICAgICAgIGhlaWdodDogaW5kaWNhdG9ySGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICB0cmFuc2Zvcm06IHRoaXMubWFrZVRyYW5zbGF0ZSgwLCBpbmRpY2F0b3JTY3JvbGwpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGlmICghbWluaW1hcC5jYW5TY3JvbGwoKSkgeyB0aGlzLmRpc3Bvc2VTY3JvbGxJbmRpY2F0b3IoKSB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYWJzb2x1dGVNb2RlICYmIHRoaXMuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0KSB7IHRoaXMudXBkYXRlQ2FudmFzZXNTaXplKCkgfVxuXG4gICAgdGhpcy51cGRhdGVDYW52YXMoKVxuICAgIG1pbmltYXAuY2xlYXJDYWNoZSgpXG4gIH1cblxuICAvKipcbiAgICogRGVmaW5lcyB3aGV0aGVyIHRvIHJlbmRlciB0aGUgY29kZSBoaWdobGlnaHRzIG9yIG5vdC5cbiAgICpcbiAgICogQHBhcmFtIHtCb29sZWFufSBkaXNwbGF5Q29kZUhpZ2hsaWdodHMgd2hldGhlciB0byByZW5kZXIgdGhlIGNvZGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0cyBvciBub3RcbiAgICovXG4gIHNldERpc3BsYXlDb2RlSGlnaGxpZ2h0cyAoZGlzcGxheUNvZGVIaWdobGlnaHRzKSB7XG4gICAgdGhpcy5kaXNwbGF5Q29kZUhpZ2hsaWdodHMgPSBkaXNwbGF5Q29kZUhpZ2hsaWdodHNcbiAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKSB9XG4gIH1cblxuICAvKipcbiAgICogUG9sbGluZyBjYWxsYmFjayB1c2VkIHRvIGRldGVjdCB2aXNpYmlsaXR5IGFuZCBzaXplIGNoYW5nZXMuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgcG9sbERPTSAoKSB7XG4gICAgbGV0IHZpc2liaWxpdHlDaGFuZ2VkID0gdGhpcy5jaGVja0ZvclZpc2liaWxpdHlDaGFuZ2UoKVxuICAgIGlmICh0aGlzLmlzVmlzaWJsZSgpKSB7XG4gICAgICBpZiAoIXRoaXMud2FzVmlzaWJsZSkgeyB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKSB9XG5cbiAgICAgIHRoaXMubWVhc3VyZUhlaWdodEFuZFdpZHRoKHZpc2liaWxpdHlDaGFuZ2VkLCBmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCBjaGVja3MgZm9yIHZpc2liaWxpdHkgY2hhbmdlcyBpbiB0aGUgTWluaW1hcEVsZW1lbnQuXG4gICAqIFRoZSBtZXRob2QgcmV0dXJucyBgdHJ1ZWAgd2hlbiB0aGUgdmlzaWJpbGl0eSBjaGFuZ2VkIGZyb20gdmlzaWJsZSB0b1xuICAgKiBoaWRkZW4gb3IgZnJvbSBoaWRkZW4gdG8gdmlzaWJsZS5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gd2hldGhlciB0aGUgdmlzaWJpbGl0eSBjaGFuZ2VkIG9yIG5vdCBzaW5jZSB0aGUgbGFzdCBjYWxsXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY2hlY2tGb3JWaXNpYmlsaXR5Q2hhbmdlICgpIHtcbiAgICBpZiAodGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgaWYgKHRoaXMud2FzVmlzaWJsZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMud2FzVmlzaWJsZSA9IHRydWVcbiAgICAgICAgcmV0dXJuIHRoaXMud2FzVmlzaWJsZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy53YXNWaXNpYmxlKSB7XG4gICAgICAgIHRoaXMud2FzVmlzaWJsZSA9IGZhbHNlXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndhc1Zpc2libGUgPSBmYWxzZVxuICAgICAgICByZXR1cm4gdGhpcy53YXNWaXNpYmxlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHVzZWQgdG8gbWVhc3VyZSB0aGUgc2l6ZSBvZiB0aGUgTWluaW1hcEVsZW1lbnQgYW5kIHVwZGF0ZSBpbnRlcm5hbFxuICAgKiBjb21wb25lbnRzIGJhc2VkIG9uIHRoZSBuZXcgc2l6ZS5cbiAgICpcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gdmlzaWJpbGl0eUNoYW5nZWQgZGlkIHRoZSB2aXNpYmlsaXR5IGNoYW5nZWQgc2luY2UgbGFzdFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWFzdXJlbWVudFxuICAgKiBAcGFyYW0gIHtbdHlwZV19IFtmb3JjZVVwZGF0ZT10cnVlXSBmb3JjZXMgdGhlIHVwZGF0ZSBldmVuIHdoZW4gbm8gY2hhbmdlc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3ZXJlIGRldGVjdGVkXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgbWVhc3VyZUhlaWdodEFuZFdpZHRoICh2aXNpYmlsaXR5Q2hhbmdlZCwgZm9yY2VVcGRhdGUgPSB0cnVlKSB7XG4gICAgaWYgKCF0aGlzLm1pbmltYXApIHsgcmV0dXJuIH1cblxuICAgIGNvbnN0IHNhZmVGbGV4QmFzaXMgPSB0aGlzLnN0eWxlLmZsZXhCYXNpc1xuICAgIHRoaXMuc3R5bGUuZmxleEJhc2lzID0gJydcblxuICAgIGxldCB3YXNSZXNpemVkID0gdGhpcy53aWR0aCAhPT0gdGhpcy5jbGllbnRXaWR0aCB8fCB0aGlzLmhlaWdodCAhPT0gdGhpcy5jbGllbnRIZWlnaHRcblxuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jbGllbnRIZWlnaHRcbiAgICB0aGlzLndpZHRoID0gdGhpcy5jbGllbnRXaWR0aFxuICAgIGxldCBjYW52YXNXaWR0aCA9IHRoaXMud2lkdGhcblxuICAgIGlmICgodGhpcy5taW5pbWFwICE9IG51bGwpKSB7XG4gICAgICB0aGlzLm1pbmltYXAuc2V0U2NyZWVuSGVpZ2h0QW5kV2lkdGgodGhpcy5oZWlnaHQsIHRoaXMud2lkdGgpXG4gICAgfVxuXG4gICAgaWYgKHdhc1Jlc2l6ZWQgfHwgdmlzaWJpbGl0eUNoYW5nZWQgfHwgZm9yY2VVcGRhdGUpIHtcbiAgICAgIHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmlzVmlzaWJsZSgpKSB7IHJldHVybiB9XG5cbiAgICBpZiAod2FzUmVzaXplZCB8fCBmb3JjZVVwZGF0ZSkge1xuICAgICAgaWYgKHRoaXMuYWRqdXN0VG9Tb2Z0V3JhcCkge1xuICAgICAgICBsZXQgbGluZUxlbmd0aCA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnKVxuICAgICAgICBsZXQgc29mdFdyYXAgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0V3JhcCcpXG4gICAgICAgIGxldCBzb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNvZnRXcmFwQXRQcmVmZXJyZWRMaW5lTGVuZ3RoJylcbiAgICAgICAgbGV0IHdpZHRoID0gbGluZUxlbmd0aCAqIHRoaXMubWluaW1hcC5nZXRDaGFyV2lkdGgoKVxuXG4gICAgICAgIGlmIChzb2Z0V3JhcCAmJiBzb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCAmJiBsaW5lTGVuZ3RoICYmICh3aWR0aCA8PSB0aGlzLndpZHRoIHx8ICF0aGlzLmFkanVzdE9ubHlJZlNtYWxsZXIpKSB7XG4gICAgICAgICAgdGhpcy5mbGV4QmFzaXMgPSB3aWR0aFxuICAgICAgICAgIGNhbnZhc1dpZHRoID0gd2lkdGhcbiAgICAgICAgICB1cGRhdGVPdmVybGF5U3R5bGUod2lkdGgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuZmxleEJhc2lzXG4gICAgICAgICAgdXBkYXRlT3ZlcmxheVN0eWxlKClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuZmxleEJhc2lzXG4gICAgICAgIHVwZGF0ZU92ZXJsYXlTdHlsZSgpXG4gICAgICB9XG5cbiAgICAgIHRoaXMudXBkYXRlQ2FudmFzZXNTaXplKGNhbnZhc1dpZHRoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0eWxlLmZsZXhCYXNpcyA9IHNhZmVGbGV4QmFzaXNcbiAgICAgIHVwZGF0ZU92ZXJsYXlTdHlsZShzYWZlRmxleEJhc2lzKVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUNhbnZhc2VzU2l6ZSAoY2FudmFzV2lkdGggPSB0aGlzLmdldEZyb250Q2FudmFzKCkud2lkdGgpIHtcbiAgICBjb25zdCBkZXZpY2VQaXhlbFJhdGlvID0gdGhpcy5taW5pbWFwLmdldERldmljZVBpeGVsUmF0aW8oKVxuICAgIGNvbnN0IG1heENhbnZhc0hlaWdodCA9IHRoaXMuaGVpZ2h0ICsgdGhpcy5taW5pbWFwLmdldExpbmVIZWlnaHQoKVxuICAgIGNvbnN0IG5ld0hlaWdodCA9IHRoaXMuYWJzb2x1dGVNb2RlICYmIHRoaXMuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0ID8gTWF0aC5taW4odGhpcy5taW5pbWFwLmdldEhlaWdodCgpLCBtYXhDYW52YXNIZWlnaHQpIDogbWF4Q2FudmFzSGVpZ2h0XG4gICAgY29uc3QgY2FudmFzID0gdGhpcy5nZXRGcm9udENhbnZhcygpXG4gICAgaWYgKGNhbnZhc1dpZHRoICE9PSBjYW52YXMud2lkdGggfHwgbmV3SGVpZ2h0ICE9PSBjYW52YXMuaGVpZ2h0KSB7XG4gICAgICB0aGlzLnNldENhbnZhc2VzU2l6ZShcbiAgICAgICAgY2FudmFzV2lkdGggKiBkZXZpY2VQaXhlbFJhdGlvLFxuICAgICAgICBuZXdIZWlnaHQgKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgICApXG4gICAgICBpZiAodGhpcy5hYnNvbHV0ZU1vZGUgJiYgdGhpcy5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQpIHtcbiAgICAgICAgdGhpcy5vZmZzY3JlZW5GaXJzdFJvdyA9IG51bGxcbiAgICAgICAgdGhpcy5vZmZzY3JlZW5MYXN0Um93ID0gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vICAgICMjIyMjIyMjICMjICAgICAjIyAjIyMjIyMjIyAjIyAgICAjIyAjIyMjIyMjIyAgIyMjIyMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyMgICAjIyAgICAjIyAgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMjIyAgIyMgICAgIyMgICAgIyNcbiAgLy8gICAgIyMjIyMjICAgIyMgICAgICMjICMjIyMjIyAgICMjICMjICMjICAgICMjICAgICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICAgICMjICAgIyMgICMjICAgICAgICMjICAjIyMjICAgICMjICAgICAgICAgICMjXG4gIC8vICAgICMjICAgICAgICAgIyMgIyMgICAjIyAgICAgICAjIyAgICMjIyAgICAjIyAgICAjIyAgICAjI1xuICAvLyAgICAjIyMjIyMjIyAgICAjIyMgICAgIyMjIyMjIyMgIyMgICAgIyMgICAgIyMgICAgICMjIyMjI1xuXG4gIC8qKlxuICAgKiBIZWxwZXIgbWV0aG9kIHRvIHJlZ2lzdGVyIGNvbmZpZyBvYnNlcnZlcnMuXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gY29uZmlncz17fSBhbiBvYmplY3QgbWFwcGluZyB0aGUgY29uZmlnIG5hbWUgdG8gb2JzZXJ2ZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2l0aCB0aGUgZnVuY3Rpb24gdG8gY2FsbCBiYWNrIHdoZW4gYSBjaGFuZ2VcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9jY3Vyc1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIG9ic2VydmVDb25maWcgKGNvbmZpZ3MgPSB7fSkge1xuICAgIGZvciAobGV0IGNvbmZpZyBpbiBjb25maWdzKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoY29uZmlnLCBjb25maWdzW2NvbmZpZ10pKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayB0cmlnZ2VyZWQgd2hlbiB0aGUgbW91c2UgaXMgcHJlc3NlZCBvbiB0aGUgTWluaW1hcEVsZW1lbnQgY2FudmFzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IHkgdGhlIHZlcnRpY2FsIGNvb3JkaW5hdGUgb2YgdGhlIGV2ZW50XG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGlzTGVmdE1vdXNlIHdhcyB0aGUgbGVmdCBtb3VzZSBidXR0b24gcHJlc3NlZD9cbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gaXNNaWRkbGVNb3VzZSB3YXMgdGhlIG1pZGRsZSBtb3VzZSBidXR0b24gcHJlc3NlZD9cbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjYW52YXNQcmVzc2VkICh7eSwgaXNMZWZ0TW91c2UsIGlzTWlkZGxlTW91c2V9KSB7XG4gICAgaWYgKHRoaXMubWluaW1hcC5pc1N0YW5kQWxvbmUoKSkgeyByZXR1cm4gfVxuICAgIGlmIChpc0xlZnRNb3VzZSkge1xuICAgICAgdGhpcy5jYW52YXNMZWZ0TW91c2VQcmVzc2VkKHkpXG4gICAgfSBlbHNlIGlmIChpc01pZGRsZU1vdXNlKSB7XG4gICAgICB0aGlzLmNhbnZhc01pZGRsZU1vdXNlUHJlc3NlZCh5KVxuICAgICAgbGV0IHt0b3AsIGhlaWdodH0gPSB0aGlzLnZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICB0aGlzLnN0YXJ0RHJhZyh7eTogdG9wICsgaGVpZ2h0IC8gMiwgaXNMZWZ0TW91c2U6IGZhbHNlLCBpc01pZGRsZU1vdXNlOiB0cnVlfSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgdHJpZ2dlcmVkIHdoZW4gdGhlIG1vdXNlIGxlZnQgYnV0dG9uIGlzIHByZXNzZWQgb24gdGhlXG4gICAqIE1pbmltYXBFbGVtZW50IGNhbnZhcy5cbiAgICpcbiAgICogQHBhcmFtICB7TW91c2VFdmVudH0gZSB0aGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAqIEBwYXJhbSAge251bWJlcn0gZS5wYWdlWSB0aGUgbW91c2UgeSBwb3NpdGlvbiBpbiBwYWdlXG4gICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBlLnRhcmdldCB0aGUgc291cmNlIG9mIHRoZSBldmVudFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNhbnZhc0xlZnRNb3VzZVByZXNzZWQgKHkpIHtcbiAgICBjb25zdCBkZWx0YVkgPSB5IC0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3BcbiAgICBjb25zdCByb3cgPSBNYXRoLmZsb29yKGRlbHRhWSAvIHRoaXMubWluaW1hcC5nZXRMaW5lSGVpZ2h0KCkpICsgdGhpcy5taW5pbWFwLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3IoKVxuICAgIGNvbnN0IHRleHRFZGl0b3JFbGVtZW50ID0gdGhpcy5nZXRUZXh0RWRpdG9yRWxlbWVudCgpXG5cbiAgICBjb25zdCBzY3JvbGxUb3AgPSByb3cgKiB0ZXh0RWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpIC0gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JIZWlnaHQoKSAvIDJcbiAgICBjb25zdCB0ZXh0RWRpdG9yU2Nyb2xsVG9wID0gdGV4dEVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKFtyb3csIDBdKS50b3AgLSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvckhlaWdodCgpIC8gMlxuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5tb3ZlQ3Vyc29yT25NaW5pbWFwQ2xpY2snKSkge1xuICAgICAgdGV4dEVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbihbcm93LCAwXSlcbiAgICB9XG5cbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLnNjcm9sbEFuaW1hdGlvbicpKSB7XG4gICAgICBjb25zdCBkdXJhdGlvbiA9IGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5zY3JvbGxBbmltYXRpb25EdXJhdGlvbicpXG4gICAgICBjb25zdCBpbmRlcGVuZGVudFNjcm9sbCA9IHRoaXMubWluaW1hcC5zY3JvbGxJbmRlcGVuZGVudGx5T25Nb3VzZVdoZWVsKClcblxuICAgICAgbGV0IGZyb20gPSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvclNjcm9sbFRvcCgpXG4gICAgICBsZXQgdG8gPSB0ZXh0RWRpdG9yU2Nyb2xsVG9wXG4gICAgICBsZXQgc3RlcFxuXG4gICAgICBpZiAoaW5kZXBlbmRlbnRTY3JvbGwpIHtcbiAgICAgICAgY29uc3QgbWluaW1hcEZyb20gPSB0aGlzLm1pbmltYXAuZ2V0U2Nyb2xsVG9wKClcbiAgICAgICAgY29uc3QgbWluaW1hcFRvID0gTWF0aC5taW4oMSwgc2Nyb2xsVG9wIC8gKHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yTWF4U2Nyb2xsVG9wKCkgfHwgMSkpICogdGhpcy5taW5pbWFwLmdldE1heFNjcm9sbFRvcCgpXG5cbiAgICAgICAgc3RlcCA9IChub3csIHQpID0+IHtcbiAgICAgICAgICB0aGlzLm1pbmltYXAuc2V0VGV4dEVkaXRvclNjcm9sbFRvcChub3csIHRydWUpXG4gICAgICAgICAgdGhpcy5taW5pbWFwLnNldFNjcm9sbFRvcChtaW5pbWFwRnJvbSArIChtaW5pbWFwVG8gLSBtaW5pbWFwRnJvbSkgKiB0KVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYW5pbWF0ZSh7ZnJvbTogZnJvbSwgdG86IHRvLCBkdXJhdGlvbjogZHVyYXRpb24sIHN0ZXA6IHN0ZXB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RlcCA9IChub3cpID0+IHRoaXMubWluaW1hcC5zZXRUZXh0RWRpdG9yU2Nyb2xsVG9wKG5vdylcbiAgICAgICAgdGhpcy5hbmltYXRlKHtmcm9tOiBmcm9tLCB0bzogdG8sIGR1cmF0aW9uOiBkdXJhdGlvbiwgc3RlcDogc3RlcH0pXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubWluaW1hcC5zZXRUZXh0RWRpdG9yU2Nyb2xsVG9wKHRleHRFZGl0b3JTY3JvbGxUb3ApXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRyaWdnZXJlZCB3aGVuIHRoZSBtb3VzZSBtaWRkbGUgYnV0dG9uIGlzIHByZXNzZWQgb24gdGhlXG4gICAqIE1pbmltYXBFbGVtZW50IGNhbnZhcy5cbiAgICpcbiAgICogQHBhcmFtICB7TW91c2VFdmVudH0gZSB0aGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAqIEBwYXJhbSAge251bWJlcn0gZS5wYWdlWSB0aGUgbW91c2UgeSBwb3NpdGlvbiBpbiBwYWdlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY2FudmFzTWlkZGxlTW91c2VQcmVzc2VkICh5KSB7XG4gICAgbGV0IHt0b3A6IG9mZnNldFRvcH0gPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgbGV0IGRlbHRhWSA9IHkgLSBvZmZzZXRUb3AgLSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpIC8gMlxuXG4gICAgbGV0IHJhdGlvID0gZGVsdGFZIC8gKHRoaXMubWluaW1hcC5nZXRWaXNpYmxlSGVpZ2h0KCkgLSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpKVxuXG4gICAgdGhpcy5taW5pbWFwLnNldFRleHRFZGl0b3JTY3JvbGxUb3AocmF0aW8gKiB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvck1heFNjcm9sbFRvcCgpKVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgcmVsYXlzIHRoZSBgbW91c2V3aGVlbGAgZXZlbnRzIHJlY2VpdmVkIGJ5IHRoZSBNaW5pbWFwRWxlbWVudFxuICAgKiB0byB0aGUgYFRleHRFZGl0b3JFbGVtZW50YC5cbiAgICpcbiAgICogQHBhcmFtICB7TW91c2VFdmVudH0gZSB0aGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgcmVsYXlNb3VzZXdoZWVsRXZlbnQgKGUpIHtcbiAgICBpZiAodGhpcy5taW5pbWFwLnNjcm9sbEluZGVwZW5kZW50bHlPbk1vdXNlV2hlZWwoKSkge1xuICAgICAgdGhpcy5taW5pbWFwLm9uTW91c2VXaGVlbChlKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50KCkuY29tcG9uZW50Lm9uTW91c2VXaGVlbChlKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IGV4dHJhY3RzIGRhdGEgZnJvbSBhIGBNb3VzZUV2ZW50YCB3aGljaCBjYW4gdGhlbiBiZSB1c2VkIHRvXG4gICAqIHByb2Nlc3MgY2xpY2tzIGFuZCBkcmFncyBvZiB0aGUgbWluaW1hcC5cbiAgICpcbiAgICogVXNlZCB0b2dldGhlciB3aXRoIGBleHRyYWN0VG91Y2hFdmVudERhdGFgIHRvIHByb3ZpZGUgYSB1bmlmaWVkIGludGVyZmFjZVxuICAgKiBmb3IgYE1vdXNlRXZlbnRgcyBhbmQgYFRvdWNoRXZlbnRgcy5cbiAgICpcbiAgICogQHBhcmFtICB7TW91c2VFdmVudH0gbW91c2VFdmVudCB0aGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZXh0cmFjdE1vdXNlRXZlbnREYXRhIChtb3VzZUV2ZW50KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IG1vdXNlRXZlbnQucGFnZVgsXG4gICAgICB5OiBtb3VzZUV2ZW50LnBhZ2VZLFxuICAgICAgaXNMZWZ0TW91c2U6IG1vdXNlRXZlbnQud2hpY2ggPT09IDEsXG4gICAgICBpc01pZGRsZU1vdXNlOiBtb3VzZUV2ZW50LndoaWNoID09PSAyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgZXh0cmFjdHMgZGF0YSBmcm9tIGEgYFRvdWNoRXZlbnRgIHdoaWNoIGNhbiB0aGVuIGJlIHVzZWQgdG9cbiAgICogcHJvY2VzcyBjbGlja3MgYW5kIGRyYWdzIG9mIHRoZSBtaW5pbWFwLlxuICAgKlxuICAgKiBVc2VkIHRvZ2V0aGVyIHdpdGggYGV4dHJhY3RNb3VzZUV2ZW50RGF0YWAgdG8gcHJvdmlkZSBhIHVuaWZpZWQgaW50ZXJmYWNlXG4gICAqIGZvciBgTW91c2VFdmVudGBzIGFuZCBgVG91Y2hFdmVudGBzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtUb3VjaEV2ZW50fSB0b3VjaEV2ZW50IHRoZSB0b3VjaCBldmVudCBvYmplY3RcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBleHRyYWN0VG91Y2hFdmVudERhdGEgKHRvdWNoRXZlbnQpIHtcbiAgICAvLyBVc2UgdGhlIGZpcnN0IHRvdWNoIG9uIHRoZSB0YXJnZXQgYXJlYS4gT3RoZXIgdG91Y2hlcyB3aWxsIGJlIGlnbm9yZWQgaW5cbiAgICAvLyBjYXNlIG9mIG11bHRpLXRvdWNoLlxuICAgIGxldCB0b3VjaCA9IHRvdWNoRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF1cblxuICAgIHJldHVybiB7XG4gICAgICB4OiB0b3VjaC5wYWdlWCxcbiAgICAgIHk6IHRvdWNoLnBhZ2VZLFxuICAgICAgaXNMZWZ0TW91c2U6IHRydWUsIC8vIFRvdWNoIGlzIHRyZWF0ZWQgbGlrZSBhIGxlZnQgbW91c2UgYnV0dG9uIGNsaWNrXG4gICAgICBpc01pZGRsZU1vdXNlOiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmVzIHRvIGEgbWVkaWEgcXVlcnkgZm9yIGRldmljZSBwaXhlbCByYXRpbyBjaGFuZ2VzIGFuZCBmb3JjZXNcbiAgICogYSByZXBhaW50IHdoZW4gaXQgb2NjdXJzLlxuICAgKlxuICAgKiBAcmV0dXJuIHtEaXNwb3NhYmxlfSBhIGRpc3Bvc2FibGUgdG8gcmVtb3ZlIHRoZSBtZWRpYSBxdWVyeSBsaXN0ZW5lclxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHN1YnNjcmliZVRvTWVkaWFRdWVyeSAoKSB7XG4gICAgaWYgKCFEaXNwb3NhYmxlKSB7XG4gICAgICAoe0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpKVxuICAgIH1cblxuICAgIGNvbnN0IHF1ZXJ5ID0gJ3NjcmVlbiBhbmQgKC13ZWJraXQtbWluLWRldmljZS1waXhlbC1yYXRpbzogMS41KSdcbiAgICBjb25zdCBtZWRpYVF1ZXJ5ID0gd2luZG93Lm1hdGNoTWVkaWEocXVlcnkpXG4gICAgY29uc3QgbWVkaWFMaXN0ZW5lciA9IChlKSA9PiB7IHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cbiAgICBtZWRpYVF1ZXJ5LmFkZExpc3RlbmVyKG1lZGlhTGlzdGVuZXIpXG5cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgbWVkaWFRdWVyeS5yZW1vdmVMaXN0ZW5lcihtZWRpYUxpc3RlbmVyKVxuICAgIH0pXG4gIH1cblxuICAvLyAgICAjIyMjIyMjIyAgICAjIyMjICAgICMjIyMjIyMjXG4gIC8vICAgICMjICAgICAjIyAgIyMgICMjICAgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgICMjIyMgICAgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyAgICAgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgIyMgIyMgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICMjICAgIyMgICAgICMjXG4gIC8vICAgICMjIyMjIyMjICAgIyMjIyAgIyMgIyMjIyMjIyNcblxuICAvKipcbiAgICogQSBtZXRob2QgdHJpZ2dlcmVkIHdoZW4gdGhlIG1vdXNlIGlzIHByZXNzZWQgb3ZlciB0aGUgdmlzaWJsZSBhcmVhIHRoYXRcbiAgICogc3RhcnRzIHRoZSBkcmFnZ2luZyBnZXN0dXJlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IHkgdGhlIHZlcnRpY2FsIGNvb3JkaW5hdGUgb2YgdGhlIGV2ZW50XG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGlzTGVmdE1vdXNlIHdhcyB0aGUgbGVmdCBtb3VzZSBidXR0b24gcHJlc3NlZD9cbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gaXNNaWRkbGVNb3VzZSB3YXMgdGhlIG1pZGRsZSBtb3VzZSBidXR0b24gcHJlc3NlZD9cbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBzdGFydERyYWcgKHt5LCBpc0xlZnRNb3VzZSwgaXNNaWRkbGVNb3VzZX0pIHtcbiAgICBpZiAoIURpc3Bvc2FibGUpIHtcbiAgICAgICh7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJykpXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLm1pbmltYXApIHsgcmV0dXJuIH1cbiAgICBpZiAoIWlzTGVmdE1vdXNlICYmICFpc01pZGRsZU1vdXNlKSB7IHJldHVybiB9XG5cbiAgICBsZXQge3RvcH0gPSB0aGlzLnZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgbGV0IHt0b3A6IG9mZnNldFRvcH0gPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cbiAgICBsZXQgZHJhZ09mZnNldCA9IHkgLSB0b3BcblxuICAgIGxldCBpbml0aWFsID0ge2RyYWdPZmZzZXQsIG9mZnNldFRvcH1cblxuICAgIGxldCBtb3VzZW1vdmVIYW5kbGVyID0gKGUpID0+IHRoaXMuZHJhZyh0aGlzLmV4dHJhY3RNb3VzZUV2ZW50RGF0YShlKSwgaW5pdGlhbClcbiAgICBsZXQgbW91c2V1cEhhbmRsZXIgPSAoZSkgPT4gdGhpcy5lbmREcmFnKClcblxuICAgIGxldCB0b3VjaG1vdmVIYW5kbGVyID0gKGUpID0+IHRoaXMuZHJhZyh0aGlzLmV4dHJhY3RUb3VjaEV2ZW50RGF0YShlKSwgaW5pdGlhbClcbiAgICBsZXQgdG91Y2hlbmRIYW5kbGVyID0gKGUpID0+IHRoaXMuZW5kRHJhZygpXG5cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdXNlbW92ZUhhbmRsZXIpXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgbW91c2V1cEhhbmRsZXIpXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgbW91c2V1cEhhbmRsZXIpXG5cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRvdWNobW92ZUhhbmRsZXIpXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRvdWNoZW5kSGFuZGxlcilcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdG91Y2hlbmRIYW5kbGVyKVxuXG4gICAgdGhpcy5kcmFnU3Vic2NyaXB0aW9uID0gbmV3IERpc3Bvc2FibGUoZnVuY3Rpb24gKCkge1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmVIYW5kbGVyKVxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgbW91c2V1cEhhbmRsZXIpXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBtb3VzZXVwSGFuZGxlcilcblxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0b3VjaG1vdmVIYW5kbGVyKVxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRvdWNoZW5kSGFuZGxlcilcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0b3VjaGVuZEhhbmRsZXIpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWV0aG9kIGNhbGxlZCBkdXJpbmcgdGhlIGRyYWcgZ2VzdHVyZS5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSB5IHRoZSB2ZXJ0aWNhbCBjb29yZGluYXRlIG9mIHRoZSBldmVudFxuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc0xlZnRNb3VzZSB3YXMgdGhlIGxlZnQgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGlzTWlkZGxlTW91c2Ugd2FzIHRoZSBtaWRkbGUgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBwYXJhbSAge251bWJlcn0gaW5pdGlhbC5kcmFnT2Zmc2V0IHRoZSBtb3VzZSBvZmZzZXQgd2l0aGluIHRoZSB2aXNpYmxlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWFcbiAgICogQHBhcmFtICB7bnVtYmVyfSBpbml0aWFsLm9mZnNldFRvcCB0aGUgTWluaW1hcEVsZW1lbnQgb2Zmc2V0IGF0IHRoZSBtb21lbnRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZiB0aGUgZHJhZyBzdGFydFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYWcgKHt5LCBpc0xlZnRNb3VzZSwgaXNNaWRkbGVNb3VzZX0sIGluaXRpYWwpIHtcbiAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuICAgIGlmICghaXNMZWZ0TW91c2UgJiYgIWlzTWlkZGxlTW91c2UpIHsgcmV0dXJuIH1cbiAgICBsZXQgZGVsdGFZID0geSAtIGluaXRpYWwub2Zmc2V0VG9wIC0gaW5pdGlhbC5kcmFnT2Zmc2V0XG5cbiAgICBsZXQgcmF0aW8gPSBkZWx0YVkgLyAodGhpcy5taW5pbWFwLmdldFZpc2libGVIZWlnaHQoKSAtIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkpXG5cbiAgICB0aGlzLm1pbmltYXAuc2V0VGV4dEVkaXRvclNjcm9sbFRvcChyYXRpbyAqIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yTWF4U2Nyb2xsVG9wKCkpXG4gIH1cblxuICAvKipcbiAgICogVGhlIG1ldGhvZCB0aGF0IGVuZHMgdGhlIGRyYWcgZ2VzdHVyZS5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBlbmREcmFnICgpIHtcbiAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuICAgIHRoaXMuZHJhZ1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgfVxuXG4gIC8vICAgICAjIyMjIyMgICAjIyMjIyMgICAjIyMjIyNcbiAgLy8gICAgIyMgICAgIyMgIyMgICAgIyMgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICAgIyNcbiAgLy8gICAgIyMgICAgICAgICMjIyMjIyAgICMjIyMjI1xuICAvLyAgICAjIyAgICAgICAgICAgICAjIyAgICAgICAjI1xuICAvLyAgICAjIyAgICAjIyAjIyAgICAjIyAjIyAgICAjI1xuICAvLyAgICAgIyMjIyMjICAgIyMjIyMjICAgIyMjIyMjXG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgdGhlIHBhc3NlZC1pbiBzdHlsZXMgcHJvcGVydGllcyB0byB0aGUgc3BlY2lmaWVkIGVsZW1lbnRcbiAgICpcbiAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgdGhlIGVsZW1lbnQgb250byB3aGljaCBhcHBseSB0aGUgc3R5bGVzXG4gICAqIEBwYXJhbSAge09iamVjdH0gc3R5bGVzIHRoZSBzdHlsZXMgdG8gYXBwbHlcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBhcHBseVN0eWxlcyAoZWxlbWVudCwgc3R5bGVzKSB7XG4gICAgaWYgKCFlbGVtZW50KSB7IHJldHVybiB9XG5cbiAgICBsZXQgY3NzVGV4dCA9ICcnXG4gICAgZm9yIChsZXQgcHJvcGVydHkgaW4gc3R5bGVzKSB7XG4gICAgICBjc3NUZXh0ICs9IGAke3Byb3BlcnR5fTogJHtzdHlsZXNbcHJvcGVydHldfTsgYFxuICAgIH1cblxuICAgIGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGNzc1RleHRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHdpdGggYSBDU1MgdHJhbnNsYXRpb24gdHJhbmZvcm0gdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gW3ggPSAwXSB0aGUgeCBvZmZzZXQgb2YgdGhlIHRyYW5zbGF0aW9uXG4gICAqIEBwYXJhbSAge251bWJlcn0gW3kgPSAwXSB0aGUgeSBvZmZzZXQgb2YgdGhlIHRyYW5zbGF0aW9uXG4gICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIENTUyB0cmFuc2xhdGlvbiBzdHJpbmdcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBtYWtlVHJhbnNsYXRlICh4ID0gMCwgeSA9IDApIHtcbiAgICBpZiAodGhpcy51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbikge1xuICAgICAgcmV0dXJuIGB0cmFuc2xhdGUzZCgke3h9cHgsICR7eX1weCwgMClgXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgdHJhbnNsYXRlKCR7eH1weCwgJHt5fXB4KWBcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyB3aXRoIGEgQ1NTIHNjYWxpbmcgdHJhbmZvcm0gdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gW3ggPSAwXSB0aGUgeCBzY2FsaW5nIGZhY3RvclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IFt5ID0gMF0gdGhlIHkgc2NhbGluZyBmYWN0b3JcbiAgICogQHJldHVybiB7c3RyaW5nfSB0aGUgQ1NTIHNjYWxpbmcgc3RyaW5nXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgbWFrZVNjYWxlICh4ID0gMCwgeSA9IHgpIHtcbiAgICBpZiAodGhpcy51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbikge1xuICAgICAgcmV0dXJuIGBzY2FsZTNkKCR7eH0sICR7eX0sIDEpYFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYHNjYWxlKCR7eH0sICR7eX0pYFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IHJldHVybiB0aGUgY3VycmVudCB0aW1lIGFzIGEgRGF0ZS5cbiAgICpcbiAgICogVGhhdCBtZXRob2QgZXhpc3Qgc28gdGhhdCB3ZSBjYW4gbW9jayBpdCBpbiB0ZXN0cy5cbiAgICpcbiAgICogQHJldHVybiB7RGF0ZX0gdGhlIGN1cnJlbnQgdGltZSBhcyBEYXRlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZ2V0VGltZSAoKSB7IHJldHVybiBuZXcgRGF0ZSgpIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCBtaW1pYyB0aGUgalF1ZXJ5IGBhbmltYXRlYCBtZXRob2QgYW5kIHVzZWQgdG8gYW5pbWF0ZSB0aGVcbiAgICogc2Nyb2xsIHdoZW4gY2xpY2tpbmcgb24gdGhlIE1pbmltYXBFbGVtZW50IGNhbnZhcy5cbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSBwYXJhbSB0aGUgYW5pbWF0aW9uIGRhdGEgb2JqZWN0XG4gICAqIEBwYXJhbSAge1t0eXBlXX0gcGFyYW0uZnJvbSB0aGUgc3RhcnQgdmFsdWVcbiAgICogQHBhcmFtICB7W3R5cGVdfSBwYXJhbS50byB0aGUgZW5kIHZhbHVlXG4gICAqIEBwYXJhbSAge1t0eXBlXX0gcGFyYW0uZHVyYXRpb24gdGhlIGFuaW1hdGlvbiBkdXJhdGlvblxuICAgKiBAcGFyYW0gIHtbdHlwZV19IHBhcmFtLnN0ZXAgdGhlIGVhc2luZyBmdW5jdGlvbiBmb3IgdGhlIGFuaW1hdGlvblxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGFuaW1hdGUgKHtmcm9tLCB0bywgZHVyYXRpb24sIHN0ZXB9KSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLmdldFRpbWUoKVxuICAgIGxldCBwcm9ncmVzc1xuXG4gICAgY29uc3Qgc3dpbmcgPSBmdW5jdGlvbiAocHJvZ3Jlc3MpIHtcbiAgICAgIHJldHVybiAwLjUgLSBNYXRoLmNvcyhwcm9ncmVzcyAqIE1hdGguUEkpIC8gMlxuICAgIH1cblxuICAgIGNvbnN0IHVwZGF0ZSA9ICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5taW5pbWFwKSB7IHJldHVybiB9XG5cbiAgICAgIGNvbnN0IHBhc3NlZCA9IHRoaXMuZ2V0VGltZSgpIC0gc3RhcnRcbiAgICAgIGlmIChkdXJhdGlvbiA9PT0gMCkge1xuICAgICAgICBwcm9ncmVzcyA9IDFcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2dyZXNzID0gcGFzc2VkIC8gZHVyYXRpb25cbiAgICAgIH1cbiAgICAgIGlmIChwcm9ncmVzcyA+IDEpIHsgcHJvZ3Jlc3MgPSAxIH1cbiAgICAgIGNvbnN0IGRlbHRhID0gc3dpbmcocHJvZ3Jlc3MpXG4gICAgICBjb25zdCB2YWx1ZSA9IGZyb20gKyAodG8gLSBmcm9tKSAqIGRlbHRhXG4gICAgICBzdGVwKHZhbHVlLCBkZWx0YSlcblxuICAgICAgaWYgKHByb2dyZXNzIDwgMSkgeyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKSB9XG4gICAgfVxuXG4gICAgdXBkYXRlKClcbiAgfVxufVxuIl19
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/minimap/lib/minimap-element.js
