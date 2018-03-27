Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _atomUtils = require('atom-utils');

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var _decoratorsInclude = require('./decorators/include');

var _decoratorsInclude2 = _interopRequireDefault(_decoratorsInclude);

var _decoratorsElement = require('./decorators/element');

var _decoratorsElement2 = _interopRequireDefault(_decoratorsElement);

var _mixinsDomStylesReader = require('./mixins/dom-styles-reader');

var _mixinsDomStylesReader2 = _interopRequireDefault(_mixinsDomStylesReader);

var _mixinsCanvasDrawer = require('./mixins/canvas-drawer');

var _mixinsCanvasDrawer2 = _interopRequireDefault(_mixinsCanvasDrawer);

var _minimapQuickSettingsElement = require('./minimap-quick-settings-element');

var _minimapQuickSettingsElement2 = _interopRequireDefault(_minimapQuickSettingsElement);

'use babel';

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
      this.subscriptions = new _atom.CompositeDisposable();
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
      (parent || this.getTextEditorElementRoot()).appendChild(this);
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
          e.preventDefault();
          e.stopPropagation();

          if (_this5.quickSettingsElement != null) {
            _this5.quickSettingsElement.destroy();
            _this5.quickSettingsSubscription.dispose();
          } else {
            _this5.quickSettingsElement = new _minimapQuickSettingsElement2['default']();
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

      this.subscriptions.add(_main2['default'].onDidChangePluginOrder(function () {
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
          left: visibleAreaLeft + 'px'
        });
      } else {
        this.applyStyles(this.visibleArea, {
          width: visibleWidth + 'px',
          height: minimap.getTextEditorScaledHeight() + 'px',
          transform: this.makeTranslate(visibleAreaLeft, visibleAreaTop)
        });
      }

      this.applyStyles(this.controls, { width: visibleWidth + 'px' });

      var canvasTop = minimap.getFirstVisibleScreenRow() * minimap.getLineHeight() - minimap.getScrollTop();

      var canvasTransform = this.makeTranslate(0, canvasTop);
      if (devicePixelRatio !== 1) {
        canvasTransform += ' ' + this.makeScale(1 / devicePixelRatio);
      }

      if (this.smoothScrolling) {
        if (SPEC_MODE) {
          this.applyStyles(this.backLayer.canvas, { top: canvasTop + 'px' });
          this.applyStyles(this.tokensLayer.canvas, { top: canvasTop + 'px' });
          this.applyStyles(this.frontLayer.canvas, { top: canvasTop + 'px' });
        } else {
          this.applyStyles(this.backLayer.canvas, { transform: canvasTransform });
          this.applyStyles(this.tokensLayer.canvas, { transform: canvasTransform });
          this.applyStyles(this.frontLayer.canvas, { transform: canvasTransform });
        }
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

          if (softWrap && softWrapAtPreferredLineLength && lineLength && width <= this.width) {
            this.flexBasis = width;
            canvasWidth = width;
          } else {
            delete this.flexBasis;
          }
        } else {
          delete this.flexBasis;
        }

        this.updateCanvasesSize(canvasWidth);
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

      var scrollTop = row * textEditor.getLineHeightInPixels() - this.minimap.getTextEditorHeight() / 2;

      if (atom.config.get('minimap.scrollAnimation')) {
        var duration = atom.config.get('minimap.scrollAnimationDuration');
        var independentScroll = this.minimap.scrollIndependentlyOnMouseWheel();

        var from = this.minimap.getTextEditorScrollTop();
        var to = scrollTop;
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
        this.minimap.setTextEditorScrollTop(scrollTop);
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

      var query = 'screen and (-webkit-min-device-pixel-ratio: 1.5)';
      var mediaQuery = window.matchMedia(query);
      var mediaListener = function mediaListener(e) {
        _this9.requestForcedUpdate();
      };
      mediaQuery.addListener(mediaListener);

      return new _atom.Disposable(function () {
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

      this.dragSubscription = new _atom.Disposable(function () {
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
  }], [{
    key: 'registerViewProvider',

    /**
     * The method that registers the MinimapElement factory in the
     * `atom.views` registry with the Minimap model.
     */
    value: function registerViewProvider(Minimap) {
      atom.views.addViewProvider(Minimap, function (model) {
        var element = new MinimapElement();
        element.setModel(model);
        return element;
      });
    }
  }]);

  var _MinimapElement = MinimapElement;
  MinimapElement = (0, _decoratorsInclude2['default'])(_mixinsDomStylesReader2['default'], _mixinsCanvasDrawer2['default'], _atomUtils.EventsDelegation, _atomUtils.AncestorsMethods)(MinimapElement) || MinimapElement;
  MinimapElement = (0, _decoratorsElement2['default'])('atom-text-editor-minimap')(MinimapElement) || MinimapElement;
  return MinimapElement;
})();

exports['default'] = MinimapElement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL21pbmltYXAtZWxlbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUU4QyxNQUFNOzt5QkFDSCxZQUFZOztvQkFDNUMsUUFBUTs7OztpQ0FDTCxzQkFBc0I7Ozs7aUNBQ3RCLHNCQUFzQjs7OztxQ0FDZCw0QkFBNEI7Ozs7a0NBQy9CLHdCQUF3Qjs7OzsyQ0FDVCxrQ0FBa0M7Ozs7QUFUMUUsV0FBVyxDQUFBOztBQVdYLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrQmQsY0FBYztXQUFkLGNBQWM7Ozs7ZUFBZCxjQUFjOzs7Ozs7Ozs7Ozs7Ozs7O1dBMkJqQiwyQkFBRzs7Ozs7Ozs7QUFNakIsVUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUE7Ozs7QUFJeEIsVUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUE7Ozs7QUFJOUIsVUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUE7Ozs7QUFJdEIsVUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUE7Ozs7Ozs7QUFPdkIsVUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7OztBQUk5QyxVQUFJLENBQUMsdUJBQXVCLEdBQUcsU0FBUyxDQUFBOzs7O0FBSXhDLFVBQUksQ0FBQyx5QkFBeUIsR0FBRyxTQUFTLENBQUE7Ozs7QUFJMUMsVUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQTs7OztBQUlqQyxVQUFJLENBQUMsNEJBQTRCLEdBQUcsU0FBUyxDQUFBOzs7Ozs7O0FBTzdDLFVBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUE7Ozs7QUFJakMsVUFBSSxDQUFDLHNCQUFzQixHQUFHLFNBQVMsQ0FBQTs7OztBQUl2QyxVQUFJLENBQUMsb0JBQW9CLEdBQUcsU0FBUyxDQUFBOzs7O0FBSXJDLFVBQUks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QUFPLEVBQUU7QUFDcEMsVUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLFVBQVUsS0FBSyxFQUFFO0FBQ25ELFlBQUksT0FBTyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUE7QUFDbEMsZUFBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN2QixlQUFPLE9BQU8sQ0FBQTtPQUNmLENBQUMsQ0FBQTtLQUNIOzs7d0JBWmtCLGNBQWM7QUFBZCxnQkFBYyxHQURsQyxrS0FBMEUsQ0FDdEQsY0FBYyxLQUFkLGNBQWM7QUFBZCxnQkFBYyxHQUZsQyxvQ0FBUSwwQkFBMEIsQ0FBQyxDQUVmLGNBQWMsS0FBZCxjQUFjO1NBQWQsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWluaW1hcC1lbGVtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHtFdmVudHNEZWxlZ2F0aW9uLCBBbmNlc3RvcnNNZXRob2RzfSBmcm9tICdhdG9tLXV0aWxzJ1xuaW1wb3J0IE1haW4gZnJvbSAnLi9tYWluJ1xuaW1wb3J0IGluY2x1ZGUgZnJvbSAnLi9kZWNvcmF0b3JzL2luY2x1ZGUnXG5pbXBvcnQgZWxlbWVudCBmcm9tICcuL2RlY29yYXRvcnMvZWxlbWVudCdcbmltcG9ydCBET01TdHlsZXNSZWFkZXIgZnJvbSAnLi9taXhpbnMvZG9tLXN0eWxlcy1yZWFkZXInXG5pbXBvcnQgQ2FudmFzRHJhd2VyIGZyb20gJy4vbWl4aW5zL2NhbnZhcy1kcmF3ZXInXG5pbXBvcnQgTWluaW1hcFF1aWNrU2V0dGluZ3NFbGVtZW50IGZyb20gJy4vbWluaW1hcC1xdWljay1zZXR0aW5ncy1lbGVtZW50J1xuXG5jb25zdCBTUEVDX01PREUgPSBhdG9tLmluU3BlY01vZGUoKVxuXG4vKipcbiAqIFB1YmxpYzogVGhlIE1pbmltYXBFbGVtZW50IGlzIHRoZSB2aWV3IG1lYW50IHRvIHJlbmRlciBhIHtAbGluayBNaW5pbWFwfVxuICogaW5zdGFuY2UgaW4gdGhlIERPTS5cbiAqXG4gKiBZb3UgY2FuIHJldHJpZXZlIHRoZSBNaW5pbWFwRWxlbWVudCBhc3NvY2lhdGVkIHRvIGEgTWluaW1hcFxuICogdXNpbmcgdGhlIGBhdG9tLnZpZXdzLmdldFZpZXdgIG1ldGhvZC5cbiAqXG4gKiBOb3RlIHRoYXQgbW9zdCBpbnRlcmFjdGlvbnMgd2l0aCB0aGUgTWluaW1hcCBwYWNrYWdlIGlzIGRvbmUgdGhyb3VnaCB0aGVcbiAqIE1pbmltYXAgbW9kZWwgc28geW91IHNob3VsZCBuZXZlciBoYXZlIHRvIGFjY2VzcyBNaW5pbWFwRWxlbWVudFxuICogaW5zdGFuY2VzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBsZXQgbWluaW1hcEVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcobWluaW1hcClcbiAqL1xuQGVsZW1lbnQoJ2F0b20tdGV4dC1lZGl0b3ItbWluaW1hcCcpXG5AaW5jbHVkZShET01TdHlsZXNSZWFkZXIsIENhbnZhc0RyYXdlciwgRXZlbnRzRGVsZWdhdGlvbiwgQW5jZXN0b3JzTWV0aG9kcylcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1pbmltYXBFbGVtZW50IHtcblxuICAvKipcbiAgICogVGhlIG1ldGhvZCB0aGF0IHJlZ2lzdGVycyB0aGUgTWluaW1hcEVsZW1lbnQgZmFjdG9yeSBpbiB0aGVcbiAgICogYGF0b20udmlld3NgIHJlZ2lzdHJ5IHdpdGggdGhlIE1pbmltYXAgbW9kZWwuXG4gICAqL1xuICBzdGF0aWMgcmVnaXN0ZXJWaWV3UHJvdmlkZXIgKE1pbmltYXApIHtcbiAgICBhdG9tLnZpZXdzLmFkZFZpZXdQcm92aWRlcihNaW5pbWFwLCBmdW5jdGlvbiAobW9kZWwpIHtcbiAgICAgIGxldCBlbGVtZW50ID0gbmV3IE1pbmltYXBFbGVtZW50KClcbiAgICAgIGVsZW1lbnQuc2V0TW9kZWwobW9kZWwpXG4gICAgICByZXR1cm4gZWxlbWVudFxuICAgIH0pXG4gIH1cblxuICAvLyAgICAjIyAgICAgIyMgICMjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAgIyMjIyMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgIyMgICMjICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAjIyAgICMjXG4gIC8vICAgICMjIyMjIyMjIyAjIyAgICAgIyMgIyMgICAgICMjICMjIyMjICAgICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgIyMgICMjICAgICAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAjIyAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAjIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgICMjIyMjI1xuXG4gIC8qKlxuICAgKiBET00gY2FsbGJhY2sgaW52b2tlZCB3aGVuIGEgbmV3IE1pbmltYXBFbGVtZW50IGlzIGNyZWF0ZWQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlZENhbGxiYWNrICgpIHtcbiAgICAvLyBDb3JlIHByb3BlcnRpZXNcblxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMubWluaW1hcCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZWRpdG9yRWxlbWVudCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMud2lkdGggPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmhlaWdodCA9IHVuZGVmaW5lZFxuXG4gICAgLy8gU3Vic2NyaXB0aW9uc1xuXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMudmlzaWJsZUFyZWFTdWJzY3JpcHRpb24gPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnF1aWNrU2V0dGluZ3NTdWJzY3JpcHRpb24gPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmRyYWdTdWJzY3JpcHRpb24gPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdTdWJzY3JpcHRpb24gPSB1bmRlZmluZWRcblxuICAgIC8vIENvbmZpZ3NcblxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0ID0gZmFsc2VcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuZGlzcGxheU1pbmltYXBPbkxlZnQgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMudGV4dE9wYWNpdHkgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5kaXNwbGF5Q29kZUhpZ2hsaWdodHMgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5hZGp1c3RUb1NvZnRXcmFwID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24gPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5hYnNvbHV0ZU1vZGUgPSB1bmRlZmluZWRcblxuICAgIC8vIEVsZW1lbnRzXG5cbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnNoYWRvd1Jvb3QgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnZpc2libGVBcmVhID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5jb250cm9scyA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuc2Nyb2xsSW5kaWNhdG9yID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5vcGVuUXVpY2tTZXR0aW5ncyA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQgPSB1bmRlZmluZWRcblxuICAgIC8vIFN0YXRlc1xuXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuYXR0YWNoZWQgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5hdHRhY2hlZFRvVGV4dEVkaXRvciA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLnN0YW5kQWxvbmUgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLndhc1Zpc2libGUgPSB1bmRlZmluZWRcblxuICAgIC8vIE90aGVyXG5cbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNjcmVlbkZpcnN0Um93ID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5vZmZzY3JlZW5MYXN0Um93ID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5mcmFtZVJlcXVlc3RlZCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZmxleEJhc2lzID0gdW5kZWZpbmVkXG5cbiAgICB0aGlzLmluaXRpYWxpemVDb250ZW50KClcblxuICAgIHJldHVybiB0aGlzLm9ic2VydmVDb25maWcoe1xuICAgICAgJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnOiAoZGlzcGxheU1pbmltYXBPbkxlZnQpID0+IHtcbiAgICAgICAgdGhpcy5kaXNwbGF5TWluaW1hcE9uTGVmdCA9IGRpc3BsYXlNaW5pbWFwT25MZWZ0XG5cbiAgICAgICAgdGhpcy51cGRhdGVNaW5pbWFwRmxleFBvc2l0aW9uKClcbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3InOiAobWluaW1hcFNjcm9sbEluZGljYXRvcikgPT4ge1xuICAgICAgICB0aGlzLm1pbmltYXBTY3JvbGxJbmRpY2F0b3IgPSBtaW5pbWFwU2Nyb2xsSW5kaWNhdG9yXG5cbiAgICAgICAgaWYgKHRoaXMubWluaW1hcFNjcm9sbEluZGljYXRvciAmJiAhKHRoaXMuc2Nyb2xsSW5kaWNhdG9yICE9IG51bGwpICYmICF0aGlzLnN0YW5kQWxvbmUpIHtcbiAgICAgICAgICB0aGlzLmluaXRpYWxpemVTY3JvbGxJbmRpY2F0b3IoKVxuICAgICAgICB9IGVsc2UgaWYgKCh0aGlzLnNjcm9sbEluZGljYXRvciAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMuZGlzcG9zZVNjcm9sbEluZGljYXRvcigpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RVcGRhdGUoKSB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzJzogKGRpc3BsYXlQbHVnaW5zQ29udHJvbHMpID0+IHtcbiAgICAgICAgdGhpcy5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzID0gZGlzcGxheVBsdWdpbnNDb250cm9sc1xuXG4gICAgICAgIGlmICh0aGlzLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMgJiYgISh0aGlzLm9wZW5RdWlja1NldHRpbmdzICE9IG51bGwpICYmICF0aGlzLnN0YW5kQWxvbmUpIHtcbiAgICAgICAgICB0aGlzLmluaXRpYWxpemVPcGVuUXVpY2tTZXR0aW5ncygpXG4gICAgICAgIH0gZWxzZSBpZiAoKHRoaXMub3BlblF1aWNrU2V0dGluZ3MgIT0gbnVsbCkpIHtcbiAgICAgICAgICB0aGlzLmRpc3Bvc2VPcGVuUXVpY2tTZXR0aW5ncygpXG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLnRleHRPcGFjaXR5JzogKHRleHRPcGFjaXR5KSA9PiB7XG4gICAgICAgIHRoaXMudGV4dE9wYWNpdHkgPSB0ZXh0T3BhY2l0eVxuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cyc6IChkaXNwbGF5Q29kZUhpZ2hsaWdodHMpID0+IHtcbiAgICAgICAgdGhpcy5kaXNwbGF5Q29kZUhpZ2hsaWdodHMgPSBkaXNwbGF5Q29kZUhpZ2hsaWdodHNcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKSB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5zbW9vdGhTY3JvbGxpbmcnOiAoc21vb3RoU2Nyb2xsaW5nKSA9PiB7XG4gICAgICAgIHRoaXMuc21vb3RoU2Nyb2xsaW5nID0gc21vb3RoU2Nyb2xsaW5nXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHtcbiAgICAgICAgICBpZiAoIXRoaXMuc21vb3RoU2Nyb2xsaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmJhY2tMYXllci5jYW52YXMuc3R5bGUuY3NzVGV4dCA9ICcnXG4gICAgICAgICAgICB0aGlzLnRva2Vuc0xheWVyLmNhbnZhcy5zdHlsZS5jc3NUZXh0ID0gJydcbiAgICAgICAgICAgIHRoaXMuZnJvbnRMYXllci5jYW52YXMuc3R5bGUuY3NzVGV4dCA9ICcnXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5hZGp1c3RNaW5pbWFwV2lkdGhUb1NvZnRXcmFwJzogKGFkanVzdFRvU29mdFdyYXApID0+IHtcbiAgICAgICAgdGhpcy5hZGp1c3RUb1NvZnRXcmFwID0gYWRqdXN0VG9Tb2Z0V3JhcFxuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMubWVhc3VyZUhlaWdodEFuZFdpZHRoKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24nOiAodXNlSGFyZHdhcmVBY2NlbGVyYXRpb24pID0+IHtcbiAgICAgICAgdGhpcy51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbiA9IHVzZUhhcmR3YXJlQWNjZWxlcmF0aW9uXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0VXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAuYWJzb2x1dGVNb2RlJzogKGFic29sdXRlTW9kZSkgPT4ge1xuICAgICAgICB0aGlzLmFic29sdXRlTW9kZSA9IGFic29sdXRlTW9kZVxuXG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnYWJzb2x1dGUnLCB0aGlzLmFic29sdXRlTW9kZSlcbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCc6IChhZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQpID0+IHtcbiAgICAgICAgdGhpcy5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQgPSBhZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHRcblxuICAgICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2FkanVzdC1hYnNvbHV0ZS1oZWlnaHQnLCB0aGlzLmFkanVzdEFic29sdXRlTW9kZUhlaWdodClcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmlnbm9yZVdoaXRlc3BhY2VzSW5Ub2tlbnMnOiAoaWdub3JlV2hpdGVzcGFjZXNJblRva2VucykgPT4ge1xuICAgICAgICB0aGlzLmlnbm9yZVdoaXRlc3BhY2VzSW5Ub2tlbnMgPSBpZ25vcmVXaGl0ZXNwYWNlc0luVG9rZW5zXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJzogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3Iuc29mdFdyYXAnOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3Iuc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGgnOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIERPTSBjYWxsYmFjayBpbnZva2VkIHdoZW4gYSBuZXcgTWluaW1hcEVsZW1lbnQgaXMgYXR0YWNoZWQgdG8gdGhlIERPTS5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBhdHRhY2hlZENhbGxiYWNrICgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20udmlld3MucG9sbERvY3VtZW50KCgpID0+IHsgdGhpcy5wb2xsRE9NKCkgfSkpXG4gICAgdGhpcy5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKVxuICAgIHRoaXMudXBkYXRlTWluaW1hcEZsZXhQb3NpdGlvbigpXG4gICAgdGhpcy5hdHRhY2hlZCA9IHRydWVcbiAgICB0aGlzLmF0dGFjaGVkVG9UZXh0RWRpdG9yID0gdGhpcy5wYXJlbnROb2RlID09PSB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50Um9vdCgpXG5cbiAgICAvKlxuICAgICAgV2UgdXNlIGBhdG9tLnN0eWxlcy5vbkRpZEFkZFN0eWxlRWxlbWVudGAgaW5zdGVhZCBvZlxuICAgICAgYGF0b20udGhlbWVzLm9uRGlkQ2hhbmdlQWN0aXZlVGhlbWVzYC5cbiAgICAgIFdoeT8gQ3VycmVudGx5LCBUaGUgc3R5bGUgZWxlbWVudCB3aWxsIGJlIHJlbW92ZWQgZmlyc3QsIGFuZCB0aGVuIHJlLWFkZGVkXG4gICAgICBhbmQgdGhlIGBjaGFuZ2VgIGV2ZW50IGhhcyBub3QgYmUgdHJpZ2dlcmVkIGluIHRoZSBwcm9jZXNzLlxuICAgICovXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLnN0eWxlcy5vbkRpZEFkZFN0eWxlRWxlbWVudCgoKSA9PiB7XG4gICAgICB0aGlzLmludmFsaWRhdGVET01TdHlsZXNDYWNoZSgpXG4gICAgICB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnN1YnNjcmliZVRvTWVkaWFRdWVyeSgpKVxuICB9XG5cbiAgLyoqXG4gICAqIERPTSBjYWxsYmFjayBpbnZva2VkIHdoZW4gYSBuZXcgTWluaW1hcEVsZW1lbnQgaXMgZGV0YWNoZWQgZnJvbSB0aGUgRE9NLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRldGFjaGVkQ2FsbGJhY2sgKCkge1xuICAgIHRoaXMuYXR0YWNoZWQgPSBmYWxzZVxuICB9XG5cbiAgLy8gICAgICAgIyMjICAgICMjIyMjIyMjICMjIyMjIyMjICAgICMjIyAgICAgIyMjIyMjICAjIyAgICAgIyNcbiAgLy8gICAgICAjIyAjIyAgICAgICMjICAgICAgICMjICAgICAgIyMgIyMgICAjIyAgICAjIyAjIyAgICAgIyNcbiAgLy8gICAgICMjICAgIyMgICAgICMjICAgICAgICMjICAgICAjIyAgICMjICAjIyAgICAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyMjIyMjIyNcbiAgLy8gICAgIyMjIyMjIyMjICAgICMjICAgICAgICMjICAgICMjIyMjIyMjIyAjIyAgICAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAjIyAjIyAgICAjIyAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAjIyAgIyMjIyMjICAjIyAgICAgIyNcblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBNaW5pbWFwRWxlbWVudCBpcyBjdXJyZW50bHkgdmlzaWJsZSBvbiBzY3JlZW4gb3Igbm90LlxuICAgKlxuICAgKiBUaGUgdmlzaWJpbGl0eSBvZiB0aGUgbWluaW1hcCBpcyBkZWZpbmVkIGJ5IHRlc3RpbmcgdGhlIHNpemUgb2YgdGhlIG9mZnNldFxuICAgKiB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSBlbGVtZW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB3aGV0aGVyIHRoZSBNaW5pbWFwRWxlbWVudCBpcyBjdXJyZW50bHkgdmlzaWJsZSBvciBub3RcbiAgICovXG4gIGlzVmlzaWJsZSAoKSB7IHJldHVybiB0aGlzLm9mZnNldFdpZHRoID4gMCB8fCB0aGlzLm9mZnNldEhlaWdodCA+IDAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyB0aGUgTWluaW1hcEVsZW1lbnQgdG8gdGhlIERPTS5cbiAgICpcbiAgICogVGhlIHBvc2l0aW9uIGF0IHdoaWNoIHRoZSBlbGVtZW50IGlzIGF0dGFjaGVkIGlzIGRlZmluZWQgYnkgdGhlXG4gICAqIGBkaXNwbGF5TWluaW1hcE9uTGVmdGAgc2V0dGluZy5cbiAgICpcbiAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IFtwYXJlbnRdIHRoZSBET00gbm9kZSB3aGVyZSBhdHRhY2hpbmcgdGhlIG1pbmltYXBcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRcbiAgICovXG4gIGF0dGFjaCAocGFyZW50KSB7XG4gICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgcmV0dXJuIH1cbiAgICAocGFyZW50IHx8IHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290KCkpLmFwcGVuZENoaWxkKHRoaXMpXG4gIH1cblxuICAvKipcbiAgICogRGV0YWNoZXMgdGhlIE1pbmltYXBFbGVtZW50IGZyb20gdGhlIERPTS5cbiAgICovXG4gIGRldGFjaCAoKSB7XG4gICAgaWYgKCF0aGlzLmF0dGFjaGVkIHx8IHRoaXMucGFyZW50Tm9kZSA9PSBudWxsKSB7IHJldHVybiB9XG4gICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpXG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgbWluaW1hcCBsZWZ0L3JpZ2h0IHBvc2l0aW9uIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiB0aGVcbiAgICogYGRpc3BsYXlNaW5pbWFwT25MZWZ0YCBzZXR0aW5nLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZU1pbmltYXBGbGV4UG9zaXRpb24gKCkge1xuICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnbGVmdCcsIHRoaXMuZGlzcGxheU1pbmltYXBPbkxlZnQpXG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhpcyBNaW5pbWFwRWxlbWVudFxuICAgKi9cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHRoaXMuZGV0YWNoKClcbiAgICB0aGlzLm1pbmltYXAgPSBudWxsXG4gIH1cblxuICAvLyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgIyMjIyMjIyMgIyMjIyMjIyMgIyMgICAgIyMgIyMjIyMjIyNcbiAgLy8gICAgIyMgICAgIyMgIyMgICAgICMjICMjIyAgICMjICAgICMjICAgICMjICAgICAgICMjIyAgICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyMjICAjIyAgICAjIyAgICAjIyAgICAgICAjIyMjICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgIyMgIyMgICAgIyMgICAgIyMjIyMjICAgIyMgIyMgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICAjIyMjICAgICMjICAgICMjICAgICAgICMjICAjIyMjICAgICMjXG4gIC8vICAgICMjICAgICMjICMjICAgICAjIyAjIyAgICMjIyAgICAjIyAgICAjIyAgICAgICAjIyAgICMjIyAgICAjI1xuICAvLyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgICAgIyMgICAgIyMjIyMjIyMgIyMgICAgIyMgICAgIyNcblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgY29udGVudCBvZiB0aGUgTWluaW1hcEVsZW1lbnQgYW5kIGF0dGFjaGVzIHRoZSBtb3VzZSBjb250cm9sXG4gICAqIGV2ZW50IGxpc3RlbmVycy5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplQ29udGVudCAoKSB7XG4gICAgdGhpcy5pbml0aWFsaXplQ2FudmFzKClcblxuICAgIHRoaXMuc2hhZG93Um9vdCA9IHRoaXMuY3JlYXRlU2hhZG93Um9vdCgpXG4gICAgdGhpcy5hdHRhY2hDYW52YXNlcyh0aGlzLnNoYWRvd1Jvb3QpXG5cbiAgICB0aGlzLmNyZWF0ZVZpc2libGVBcmVhKClcbiAgICB0aGlzLmNyZWF0ZUNvbnRyb2xzKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5zdWJzY3JpYmVUbyh0aGlzLCB7XG4gICAgICAnbW91c2V3aGVlbCc6IChlKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdGFuZEFsb25lKSB7XG4gICAgICAgICAgdGhpcy5yZWxheU1vdXNld2hlZWxFdmVudChlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuc3Vic2NyaWJlVG8odGhpcy5nZXRGcm9udENhbnZhcygpLCB7XG4gICAgICAnbW91c2Vkb3duJzogKGUpID0+IHsgdGhpcy5jYW52YXNQcmVzc2VkKHRoaXMuZXh0cmFjdE1vdXNlRXZlbnREYXRhKGUpKSB9LFxuICAgICAgJ3RvdWNoc3RhcnQnOiAoZSkgPT4geyB0aGlzLmNhbnZhc1ByZXNzZWQodGhpcy5leHRyYWN0VG91Y2hFdmVudERhdGEoZSkpIH1cbiAgICB9KSlcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgdmlzaWJsZSBhcmVhIGRpdi5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVWaXNpYmxlQXJlYSAoKSB7XG4gICAgaWYgKHRoaXMudmlzaWJsZUFyZWEpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMudmlzaWJsZUFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMudmlzaWJsZUFyZWEuY2xhc3NMaXN0LmFkZCgnbWluaW1hcC12aXNpYmxlLWFyZWEnKVxuICAgIHRoaXMuc2hhZG93Um9vdC5hcHBlbmRDaGlsZCh0aGlzLnZpc2libGVBcmVhKVxuICAgIHRoaXMudmlzaWJsZUFyZWFTdWJzY3JpcHRpb24gPSB0aGlzLnN1YnNjcmliZVRvKHRoaXMudmlzaWJsZUFyZWEsIHtcbiAgICAgICdtb3VzZWRvd24nOiAoZSkgPT4geyB0aGlzLnN0YXJ0RHJhZyh0aGlzLmV4dHJhY3RNb3VzZUV2ZW50RGF0YShlKSkgfSxcbiAgICAgICd0b3VjaHN0YXJ0JzogKGUpID0+IHsgdGhpcy5zdGFydERyYWcodGhpcy5leHRyYWN0VG91Y2hFdmVudERhdGEoZSkpIH1cbiAgICB9KVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnZpc2libGVBcmVhU3Vic2NyaXB0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIHZpc2libGUgYXJlYSBkaXYuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgcmVtb3ZlVmlzaWJsZUFyZWEgKCkge1xuICAgIGlmICghdGhpcy52aXNpYmxlQXJlYSkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLnJlbW92ZSh0aGlzLnZpc2libGVBcmVhU3Vic2NyaXB0aW9uKVxuICAgIHRoaXMudmlzaWJsZUFyZWFTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgdGhpcy5zaGFkb3dSb290LnJlbW92ZUNoaWxkKHRoaXMudmlzaWJsZUFyZWEpXG4gICAgZGVsZXRlIHRoaXMudmlzaWJsZUFyZWFcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBjb250cm9scyBjb250YWluZXIgZGl2LlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNyZWF0ZUNvbnRyb2xzICgpIHtcbiAgICBpZiAodGhpcy5jb250cm9scyB8fCB0aGlzLnN0YW5kQWxvbmUpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuY29udHJvbHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMuY29udHJvbHMuY2xhc3NMaXN0LmFkZCgnbWluaW1hcC1jb250cm9scycpXG4gICAgdGhpcy5zaGFkb3dSb290LmFwcGVuZENoaWxkKHRoaXMuY29udHJvbHMpXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgY29udHJvbHMgY29udGFpbmVyIGRpdi5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICByZW1vdmVDb250cm9scyAoKSB7XG4gICAgaWYgKCF0aGlzLmNvbnRyb2xzKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLnNoYWRvd1Jvb3QucmVtb3ZlQ2hpbGQodGhpcy5jb250cm9scylcbiAgICBkZWxldGUgdGhpcy5jb250cm9sc1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBzY3JvbGwgaW5kaWNhdG9yIGRpdiB3aGVuIHRoZSBgbWluaW1hcFNjcm9sbEluZGljYXRvcmBcbiAgICogc2V0dGluZ3MgaXMgZW5hYmxlZC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplU2Nyb2xsSW5kaWNhdG9yICgpIHtcbiAgICBpZiAodGhpcy5zY3JvbGxJbmRpY2F0b3IgfHwgdGhpcy5zdGFuZEFsb25lKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLnNjcm9sbEluZGljYXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5zY3JvbGxJbmRpY2F0b3IuY2xhc3NMaXN0LmFkZCgnbWluaW1hcC1zY3JvbGwtaW5kaWNhdG9yJylcbiAgICB0aGlzLmNvbnRyb2xzLmFwcGVuZENoaWxkKHRoaXMuc2Nyb2xsSW5kaWNhdG9yKVxuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2VzIHRoZSBzY3JvbGwgaW5kaWNhdG9yIGRpdiB3aGVuIHRoZSBgbWluaW1hcFNjcm9sbEluZGljYXRvcmBcbiAgICogc2V0dGluZ3MgaXMgZGlzYWJsZWQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZGlzcG9zZVNjcm9sbEluZGljYXRvciAoKSB7XG4gICAgaWYgKCF0aGlzLnNjcm9sbEluZGljYXRvcikgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5jb250cm9scy5yZW1vdmVDaGlsZCh0aGlzLnNjcm9sbEluZGljYXRvcilcbiAgICBkZWxldGUgdGhpcy5zY3JvbGxJbmRpY2F0b3JcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgcXVpY2sgc2V0dGluZ3Mgb3BlbmVuZXIgZGl2IHdoZW4gdGhlXG4gICAqIGBkaXNwbGF5UGx1Z2luc0NvbnRyb2xzYCBzZXR0aW5nIGlzIGVuYWJsZWQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZU9wZW5RdWlja1NldHRpbmdzICgpIHtcbiAgICBpZiAodGhpcy5vcGVuUXVpY2tTZXR0aW5ncyB8fCB0aGlzLnN0YW5kQWxvbmUpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ3MuY2xhc3NMaXN0LmFkZCgnb3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICB0aGlzLmNvbnRyb2xzLmFwcGVuZENoaWxkKHRoaXMub3BlblF1aWNrU2V0dGluZ3MpXG5cbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdTdWJzY3JpcHRpb24gPSB0aGlzLnN1YnNjcmliZVRvKHRoaXMub3BlblF1aWNrU2V0dGluZ3MsIHtcbiAgICAgICdtb3VzZWRvd24nOiAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICAgIGlmICgodGhpcy5xdWlja1NldHRpbmdzRWxlbWVudCAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuZGVzdHJveSgpXG4gICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQgPSBuZXcgTWluaW1hcFF1aWNrU2V0dGluZ3NFbGVtZW50KClcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnNldE1vZGVsKHRoaXMpXG4gICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzU3Vic2NyaXB0aW9uID0gdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudC5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudCA9IG51bGxcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgbGV0IHt0b3AsIGxlZnQsIHJpZ2h0fSA9IHRoaXMuZ2V0RnJvbnRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuc3R5bGUudG9wID0gdG9wICsgJ3B4J1xuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuYXR0YWNoKClcblxuICAgICAgICAgIGlmICh0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0KSB7XG4gICAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnN0eWxlLmxlZnQgPSAocmlnaHQpICsgJ3B4J1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnN0eWxlLmxlZnQgPSAobGVmdCAtIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuY2xpZW50V2lkdGgpICsgJ3B4J1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgdGhlIHF1aWNrIHNldHRpbmdzIG9wZW5lbmVyIGRpdiB3aGVuIHRoZSBgZGlzcGxheVBsdWdpbnNDb250cm9sc2BcbiAgICogc2V0dGluZyBpcyBkaXNhYmxlZC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkaXNwb3NlT3BlblF1aWNrU2V0dGluZ3MgKCkge1xuICAgIGlmICghdGhpcy5vcGVuUXVpY2tTZXR0aW5ncykgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5jb250cm9scy5yZW1vdmVDaGlsZCh0aGlzLm9wZW5RdWlja1NldHRpbmdzKVxuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICBkZWxldGUgdGhpcy5vcGVuUXVpY2tTZXR0aW5nc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHRhcmdldCBgVGV4dEVkaXRvcmAgb2YgdGhlIE1pbmltYXAuXG4gICAqXG4gICAqIEByZXR1cm4ge1RleHRFZGl0b3J9IHRoZSBtaW5pbWFwJ3MgdGV4dCBlZGl0b3JcbiAgICovXG4gIGdldFRleHRFZGl0b3IgKCkgeyByZXR1cm4gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3IoKSB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGBUZXh0RWRpdG9yRWxlbWVudGAgZm9yIHRoZSBNaW5pbWFwJ3MgYFRleHRFZGl0b3JgLlxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXh0RWRpdG9yRWxlbWVudH0gdGhlIG1pbmltYXAncyB0ZXh0IGVkaXRvciBlbGVtZW50XG4gICAqL1xuICBnZXRUZXh0RWRpdG9yRWxlbWVudCAoKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yRWxlbWVudCkgeyByZXR1cm4gdGhpcy5lZGl0b3JFbGVtZW50IH1cblxuICAgIHRoaXMuZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLmdldFRleHRFZGl0b3IoKSlcbiAgICByZXR1cm4gdGhpcy5lZGl0b3JFbGVtZW50XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcm9vdCBvZiB0aGUgYFRleHRFZGl0b3JFbGVtZW50YCBjb250ZW50LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBtb3N0bHkgdXNlZCB0byBlbnN1cmUgY29tcGF0aWJpbGl0eSB3aXRoIHRoZSBgc2hhZG93RG9tYFxuICAgKiBzZXR0aW5nLlxuICAgKlxuICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gdGhlIHJvb3Qgb2YgdGhlIGBUZXh0RWRpdG9yRWxlbWVudGAgY29udGVudFxuICAgKi9cbiAgZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290ICgpIHtcbiAgICBsZXQgZWRpdG9yRWxlbWVudCA9IHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKVxuXG4gICAgaWYgKGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdCkge1xuICAgICAgcmV0dXJuIGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZWRpdG9yRWxlbWVudFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByb290IHdoZXJlIHRvIGluamVjdCB0aGUgZHVtbXkgbm9kZSB1c2VkIHRvIHJlYWQgRE9NIHN0eWxlcy5cbiAgICpcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gc2hhZG93Um9vdCB3aGV0aGVyIHRvIHVzZSB0aGUgdGV4dCBlZGl0b3Igc2hhZG93IERPTVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yIG5vdFxuICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gdGhlIHJvb3Qgbm9kZSB3aGVyZSBhcHBlbmRpbmcgdGhlIGR1bW15IG5vZGVcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBnZXREdW1teURPTVJvb3QgKHNoYWRvd1Jvb3QpIHtcbiAgICBpZiAoc2hhZG93Um9vdCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290KClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKVxuICAgIH1cbiAgfVxuXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyMjICMjXG4gIC8vICAgICMjIyAgICMjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjIyMgIyMjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjICMjIyAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjIyMjIyAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIE1pbmltYXAgZm9yIHdoaWNoIHRoaXMgTWluaW1hcEVsZW1lbnQgd2FzIGNyZWF0ZWQuXG4gICAqXG4gICAqIEByZXR1cm4ge01pbmltYXB9IHRoaXMgZWxlbWVudCdzIE1pbmltYXBcbiAgICovXG4gIGdldE1vZGVsICgpIHsgcmV0dXJuIHRoaXMubWluaW1hcCB9XG5cbiAgLyoqXG4gICAqIERlZmluZXMgdGhlIE1pbmltYXAgbW9kZWwgZm9yIHRoaXMgTWluaW1hcEVsZW1lbnQgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSAge01pbmltYXB9IG1pbmltYXAgdGhlIE1pbmltYXAgbW9kZWwgZm9yIHRoaXMgaW5zdGFuY2UuXG4gICAqIEByZXR1cm4ge01pbmltYXB9IHRoaXMgZWxlbWVudCdzIE1pbmltYXBcbiAgICovXG4gIHNldE1vZGVsIChtaW5pbWFwKSB7XG4gICAgdGhpcy5taW5pbWFwID0gbWluaW1hcFxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKCgpID0+IHtcbiAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KCgpID0+IHtcbiAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgIHRoaXMuZGVzdHJveSgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VDb25maWcoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgcmV0dXJuIHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlU3RhbmRBbG9uZSgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YW5kQWxvbmUodGhpcy5taW5pbWFwLmlzU3RhbmRBbG9uZSgpKVxuICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlKChjaGFuZ2UpID0+IHtcbiAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMucHVzaChjaGFuZ2UpXG4gICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VEZWNvcmF0aW9uUmFuZ2UoKGNoYW5nZSkgPT4ge1xuICAgICAgY29uc3Qge3R5cGV9ID0gY2hhbmdlXG4gICAgICBpZiAodHlwZSA9PT0gJ2xpbmUnIHx8IHR5cGUgPT09ICdoaWdobGlnaHQtdW5kZXInIHx8IHR5cGUgPT09ICdiYWNrZ3JvdW5kLWN1c3RvbScpIHtcbiAgICAgICAgdGhpcy5wZW5kaW5nQmFja0RlY29yYXRpb25DaGFuZ2VzLnB1c2goY2hhbmdlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wZW5kaW5nRnJvbnREZWNvcmF0aW9uQ2hhbmdlcy5wdXNoKGNoYW5nZSlcbiAgICAgIH1cbiAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKE1haW4ub25EaWRDaGFuZ2VQbHVnaW5PcmRlcigoKSA9PiB7XG4gICAgICB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zZXRTdGFuZEFsb25lKHRoaXMubWluaW1hcC5pc1N0YW5kQWxvbmUoKSlcblxuICAgIGlmICh0aGlzLndpZHRoICE9IG51bGwgJiYgdGhpcy5oZWlnaHQgIT0gbnVsbCkge1xuICAgICAgdGhpcy5taW5pbWFwLnNldFNjcmVlbkhlaWdodEFuZFdpZHRoKHRoaXMuaGVpZ2h0LCB0aGlzLndpZHRoKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm1pbmltYXBcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzdGFuZC1hbG9uZSBtb2RlIGZvciB0aGlzIE1pbmltYXBFbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN0YW5kQWxvbmUgdGhlIG5ldyBtb2RlIGZvciB0aGlzIE1pbmltYXBFbGVtZW50XG4gICAqL1xuICBzZXRTdGFuZEFsb25lIChzdGFuZEFsb25lKSB7XG4gICAgdGhpcy5zdGFuZEFsb25lID0gc3RhbmRBbG9uZVxuXG4gICAgaWYgKHRoaXMuc3RhbmRBbG9uZSkge1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ3N0YW5kLWFsb25lJywgdHJ1ZSlcbiAgICAgIHRoaXMuZGlzcG9zZVNjcm9sbEluZGljYXRvcigpXG4gICAgICB0aGlzLmRpc3Bvc2VPcGVuUXVpY2tTZXR0aW5ncygpXG4gICAgICB0aGlzLnJlbW92ZUNvbnRyb2xzKClcbiAgICAgIHRoaXMucmVtb3ZlVmlzaWJsZUFyZWEoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnc3RhbmQtYWxvbmUnKVxuICAgICAgdGhpcy5jcmVhdGVWaXNpYmxlQXJlYSgpXG4gICAgICB0aGlzLmNyZWF0ZUNvbnRyb2xzKClcbiAgICAgIGlmICh0aGlzLm1pbmltYXBTY3JvbGxJbmRpY2F0b3IpIHsgdGhpcy5pbml0aWFsaXplU2Nyb2xsSW5kaWNhdG9yKCkgfVxuICAgICAgaWYgKHRoaXMuZGlzcGxheVBsdWdpbnNDb250cm9scykgeyB0aGlzLmluaXRpYWxpemVPcGVuUXVpY2tTZXR0aW5ncygpIH1cbiAgICB9XG4gIH1cblxuICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjIyMjIyMjICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgICAjIyAjIyAgICAgICMjICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICAjIyAgICMjICAgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjICAgICAjIyAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgICAgIyMgICAgICMjICMjIyMjIyMjIyAgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgICMjICAgICAjIyAjIyAgICAgIyMgICAgIyMgICAgIyNcbiAgLy8gICAgICMjIyMjIyMgICMjICAgICAgICAjIyMjIyMjIyAgIyMgICAgICMjICAgICMjICAgICMjIyMjIyMjXG5cbiAgLyoqXG4gICAqIFJlcXVlc3RzIGFuIHVwZGF0ZSB0byBiZSBwZXJmb3JtZWQgb24gdGhlIG5leHQgZnJhbWUuXG4gICAqL1xuICByZXF1ZXN0VXBkYXRlICgpIHtcbiAgICBpZiAodGhpcy5mcmFtZVJlcXVlc3RlZCkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5mcmFtZVJlcXVlc3RlZCA9IHRydWVcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgdGhpcy5mcmFtZVJlcXVlc3RlZCA9IGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0cyBhbiB1cGRhdGUgdG8gYmUgcGVyZm9ybWVkIG9uIHRoZSBuZXh0IGZyYW1lIHRoYXQgd2lsbCBjb21wbGV0ZWx5XG4gICAqIHJlZHJhdyB0aGUgbWluaW1hcC5cbiAgICovXG4gIHJlcXVlc3RGb3JjZWRVcGRhdGUgKCkge1xuICAgIHRoaXMub2Zmc2NyZWVuRmlyc3RSb3cgPSBudWxsXG4gICAgdGhpcy5vZmZzY3JlZW5MYXN0Um93ID0gbnVsbFxuICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgdGhlIGFjdHVhbCBNaW5pbWFwRWxlbWVudCB1cGRhdGUuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlICgpIHtcbiAgICBpZiAoISh0aGlzLmF0dGFjaGVkICYmIHRoaXMuaXNWaXNpYmxlKCkgJiYgdGhpcy5taW5pbWFwKSkgeyByZXR1cm4gfVxuICAgIGxldCBtaW5pbWFwID0gdGhpcy5taW5pbWFwXG4gICAgbWluaW1hcC5lbmFibGVDYWNoZSgpXG4gICAgbGV0IGNhbnZhcyA9IHRoaXMuZ2V0RnJvbnRDYW52YXMoKVxuXG4gICAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IHRoaXMubWluaW1hcC5nZXREZXZpY2VQaXhlbFJhdGlvKClcbiAgICBsZXQgdmlzaWJsZUFyZWFMZWZ0ID0gbWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkU2Nyb2xsTGVmdCgpXG4gICAgbGV0IHZpc2libGVBcmVhVG9wID0gbWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkU2Nyb2xsVG9wKCkgLSBtaW5pbWFwLmdldFNjcm9sbFRvcCgpXG4gICAgbGV0IHZpc2libGVXaWR0aCA9IE1hdGgubWluKGNhbnZhcy53aWR0aCAvIGRldmljZVBpeGVsUmF0aW8sIHRoaXMud2lkdGgpXG5cbiAgICBpZiAodGhpcy5hZGp1c3RUb1NvZnRXcmFwICYmIHRoaXMuZmxleEJhc2lzKSB7XG4gICAgICB0aGlzLnN0eWxlLmZsZXhCYXNpcyA9IHRoaXMuZmxleEJhc2lzICsgJ3B4J1xuICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IHRoaXMuZmxleEJhc2lzICsgJ3B4J1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0eWxlLmZsZXhCYXNpcyA9IG51bGxcbiAgICAgIHRoaXMuc3R5bGUud2lkdGggPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKFNQRUNfTU9ERSkge1xuICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLnZpc2libGVBcmVhLCB7XG4gICAgICAgIHdpZHRoOiB2aXNpYmxlV2lkdGggKyAncHgnLFxuICAgICAgICBoZWlnaHQ6IG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpICsgJ3B4JyxcbiAgICAgICAgdG9wOiB2aXNpYmxlQXJlYVRvcCArICdweCcsXG4gICAgICAgIGxlZnQ6IHZpc2libGVBcmVhTGVmdCArICdweCdcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy52aXNpYmxlQXJlYSwge1xuICAgICAgICB3aWR0aDogdmlzaWJsZVdpZHRoICsgJ3B4JyxcbiAgICAgICAgaGVpZ2h0OiBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSArICdweCcsXG4gICAgICAgIHRyYW5zZm9ybTogdGhpcy5tYWtlVHJhbnNsYXRlKHZpc2libGVBcmVhTGVmdCwgdmlzaWJsZUFyZWFUb3ApXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5jb250cm9scywge3dpZHRoOiB2aXNpYmxlV2lkdGggKyAncHgnfSlcblxuICAgIGxldCBjYW52YXNUb3AgPSBtaW5pbWFwLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpICogbWluaW1hcC5nZXRMaW5lSGVpZ2h0KCkgLSBtaW5pbWFwLmdldFNjcm9sbFRvcCgpXG5cbiAgICBsZXQgY2FudmFzVHJhbnNmb3JtID0gdGhpcy5tYWtlVHJhbnNsYXRlKDAsIGNhbnZhc1RvcClcbiAgICBpZiAoZGV2aWNlUGl4ZWxSYXRpbyAhPT0gMSkge1xuICAgICAgY2FudmFzVHJhbnNmb3JtICs9ICcgJyArIHRoaXMubWFrZVNjYWxlKDEgLyBkZXZpY2VQaXhlbFJhdGlvKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnNtb290aFNjcm9sbGluZykge1xuICAgICAgaWYgKFNQRUNfTU9ERSkge1xuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuYmFja0xheWVyLmNhbnZhcywge3RvcDogY2FudmFzVG9wICsgJ3B4J30pXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy50b2tlbnNMYXllci5jYW52YXMsIHt0b3A6IGNhbnZhc1RvcCArICdweCd9KVxuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuZnJvbnRMYXllci5jYW52YXMsIHt0b3A6IGNhbnZhc1RvcCArICdweCd9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmJhY2tMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy50b2tlbnNMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5mcm9udExheWVyLmNhbnZhcywge3RyYW5zZm9ybTogY2FudmFzVHJhbnNmb3JtfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yICYmIG1pbmltYXAuY2FuU2Nyb2xsKCkgJiYgIXRoaXMuc2Nyb2xsSW5kaWNhdG9yKSB7XG4gICAgICB0aGlzLmluaXRpYWxpemVTY3JvbGxJbmRpY2F0b3IoKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnNjcm9sbEluZGljYXRvciAhPSBudWxsKSB7XG4gICAgICBsZXQgbWluaW1hcFNjcmVlbkhlaWdodCA9IG1pbmltYXAuZ2V0U2NyZWVuSGVpZ2h0KClcbiAgICAgIGxldCBpbmRpY2F0b3JIZWlnaHQgPSBtaW5pbWFwU2NyZWVuSGVpZ2h0ICogKG1pbmltYXBTY3JlZW5IZWlnaHQgLyBtaW5pbWFwLmdldEhlaWdodCgpKVxuICAgICAgbGV0IGluZGljYXRvclNjcm9sbCA9IChtaW5pbWFwU2NyZWVuSGVpZ2h0IC0gaW5kaWNhdG9ySGVpZ2h0KSAqIG1pbmltYXAuZ2V0U2Nyb2xsUmF0aW8oKVxuXG4gICAgICBpZiAoU1BFQ19NT0RFKSB7XG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5zY3JvbGxJbmRpY2F0b3IsIHtcbiAgICAgICAgICBoZWlnaHQ6IGluZGljYXRvckhlaWdodCArICdweCcsXG4gICAgICAgICAgdG9wOiBpbmRpY2F0b3JTY3JvbGwgKyAncHgnXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuc2Nyb2xsSW5kaWNhdG9yLCB7XG4gICAgICAgICAgaGVpZ2h0OiBpbmRpY2F0b3JIZWlnaHQgKyAncHgnLFxuICAgICAgICAgIHRyYW5zZm9ybTogdGhpcy5tYWtlVHJhbnNsYXRlKDAsIGluZGljYXRvclNjcm9sbClcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgaWYgKCFtaW5pbWFwLmNhblNjcm9sbCgpKSB7IHRoaXMuZGlzcG9zZVNjcm9sbEluZGljYXRvcigpIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5hYnNvbHV0ZU1vZGUgJiYgdGhpcy5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQpIHsgdGhpcy51cGRhdGVDYW52YXNlc1NpemUoKSB9XG5cbiAgICB0aGlzLnVwZGF0ZUNhbnZhcygpXG4gICAgbWluaW1hcC5jbGVhckNhY2hlKClcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWZpbmVzIHdoZXRoZXIgdG8gcmVuZGVyIHRoZSBjb2RlIGhpZ2hsaWdodHMgb3Igbm90LlxuICAgKlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGRpc3BsYXlDb2RlSGlnaGxpZ2h0cyB3aGV0aGVyIHRvIHJlbmRlciB0aGUgY29kZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRzIG9yIG5vdFxuICAgKi9cbiAgc2V0RGlzcGxheUNvZGVIaWdobGlnaHRzIChkaXNwbGF5Q29kZUhpZ2hsaWdodHMpIHtcbiAgICB0aGlzLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cyA9IGRpc3BsYXlDb2RlSGlnaGxpZ2h0c1xuICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQb2xsaW5nIGNhbGxiYWNrIHVzZWQgdG8gZGV0ZWN0IHZpc2liaWxpdHkgYW5kIHNpemUgY2hhbmdlcy5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBwb2xsRE9NICgpIHtcbiAgICBsZXQgdmlzaWJpbGl0eUNoYW5nZWQgPSB0aGlzLmNoZWNrRm9yVmlzaWJpbGl0eUNoYW5nZSgpXG4gICAgaWYgKHRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgIGlmICghdGhpcy53YXNWaXNpYmxlKSB7IHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cblxuICAgICAgdGhpcy5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgodmlzaWJpbGl0eUNoYW5nZWQsIGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IGNoZWNrcyBmb3IgdmlzaWJpbGl0eSBjaGFuZ2VzIGluIHRoZSBNaW5pbWFwRWxlbWVudC5cbiAgICogVGhlIG1ldGhvZCByZXR1cm5zIGB0cnVlYCB3aGVuIHRoZSB2aXNpYmlsaXR5IGNoYW5nZWQgZnJvbSB2aXNpYmxlIHRvXG4gICAqIGhpZGRlbiBvciBmcm9tIGhpZGRlbiB0byB2aXNpYmxlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB3aGV0aGVyIHRoZSB2aXNpYmlsaXR5IGNoYW5nZWQgb3Igbm90IHNpbmNlIHRoZSBsYXN0IGNhbGxcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjaGVja0ZvclZpc2liaWxpdHlDaGFuZ2UgKCkge1xuICAgIGlmICh0aGlzLmlzVmlzaWJsZSgpKSB7XG4gICAgICBpZiAodGhpcy53YXNWaXNpYmxlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy53YXNWaXNpYmxlID0gdHJ1ZVxuICAgICAgICByZXR1cm4gdGhpcy53YXNWaXNpYmxlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLndhc1Zpc2libGUpIHtcbiAgICAgICAgdGhpcy53YXNWaXNpYmxlID0gZmFsc2VcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMud2FzVmlzaWJsZSA9IGZhbHNlXG4gICAgICAgIHJldHVybiB0aGlzLndhc1Zpc2libGVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdXNlZCB0byBtZWFzdXJlIHRoZSBzaXplIG9mIHRoZSBNaW5pbWFwRWxlbWVudCBhbmQgdXBkYXRlIGludGVybmFsXG4gICAqIGNvbXBvbmVudHMgYmFzZWQgb24gdGhlIG5ldyBzaXplLlxuICAgKlxuICAgKiBAcGFyYW0gIHtib29sZWFufSB2aXNpYmlsaXR5Q2hhbmdlZCBkaWQgdGhlIHZpc2liaWxpdHkgY2hhbmdlZCBzaW5jZSBsYXN0XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lYXN1cmVtZW50XG4gICAqIEBwYXJhbSAge1t0eXBlXX0gW2ZvcmNlVXBkYXRlPXRydWVdIGZvcmNlcyB0aGUgdXBkYXRlIGV2ZW4gd2hlbiBubyBjaGFuZ2VzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdlcmUgZGV0ZWN0ZWRcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBtZWFzdXJlSGVpZ2h0QW5kV2lkdGggKHZpc2liaWxpdHlDaGFuZ2VkLCBmb3JjZVVwZGF0ZSA9IHRydWUpIHtcbiAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuXG4gICAgbGV0IHdhc1Jlc2l6ZWQgPSB0aGlzLndpZHRoICE9PSB0aGlzLmNsaWVudFdpZHRoIHx8IHRoaXMuaGVpZ2h0ICE9PSB0aGlzLmNsaWVudEhlaWdodFxuXG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmNsaWVudEhlaWdodFxuICAgIHRoaXMud2lkdGggPSB0aGlzLmNsaWVudFdpZHRoXG4gICAgbGV0IGNhbnZhc1dpZHRoID0gdGhpcy53aWR0aFxuXG4gICAgaWYgKCh0aGlzLm1pbmltYXAgIT0gbnVsbCkpIHtcbiAgICAgIHRoaXMubWluaW1hcC5zZXRTY3JlZW5IZWlnaHRBbmRXaWR0aCh0aGlzLmhlaWdodCwgdGhpcy53aWR0aClcbiAgICB9XG5cbiAgICBpZiAod2FzUmVzaXplZCB8fCB2aXNpYmlsaXR5Q2hhbmdlZCB8fCBmb3JjZVVwZGF0ZSkge1xuICAgICAgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKClcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaXNWaXNpYmxlKCkpIHsgcmV0dXJuIH1cblxuICAgIGlmICh3YXNSZXNpemVkIHx8IGZvcmNlVXBkYXRlKSB7XG4gICAgICBpZiAodGhpcy5hZGp1c3RUb1NvZnRXcmFwKSB7XG4gICAgICAgIGxldCBsaW5lTGVuZ3RoID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IucHJlZmVycmVkTGluZUxlbmd0aCcpXG4gICAgICAgIGxldCBzb2Z0V3JhcCA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNvZnRXcmFwJylcbiAgICAgICAgbGV0IHNvZnRXcmFwQXRQcmVmZXJyZWRMaW5lTGVuZ3RoID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGgnKVxuICAgICAgICBsZXQgd2lkdGggPSBsaW5lTGVuZ3RoICogdGhpcy5taW5pbWFwLmdldENoYXJXaWR0aCgpXG5cbiAgICAgICAgaWYgKHNvZnRXcmFwICYmIHNvZnRXcmFwQXRQcmVmZXJyZWRMaW5lTGVuZ3RoICYmIGxpbmVMZW5ndGggJiYgd2lkdGggPD0gdGhpcy53aWR0aCkge1xuICAgICAgICAgIHRoaXMuZmxleEJhc2lzID0gd2lkdGhcbiAgICAgICAgICBjYW52YXNXaWR0aCA9IHdpZHRoXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuZmxleEJhc2lzXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmZsZXhCYXNpc1xuICAgICAgfVxuXG4gICAgICB0aGlzLnVwZGF0ZUNhbnZhc2VzU2l6ZShjYW52YXNXaWR0aClcbiAgICB9XG4gIH1cblxuICB1cGRhdGVDYW52YXNlc1NpemUgKGNhbnZhc1dpZHRoID0gdGhpcy5nZXRGcm9udENhbnZhcygpLndpZHRoKSB7XG4gICAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IHRoaXMubWluaW1hcC5nZXREZXZpY2VQaXhlbFJhdGlvKClcbiAgICBjb25zdCBtYXhDYW52YXNIZWlnaHQgPSB0aGlzLmhlaWdodCArIHRoaXMubWluaW1hcC5nZXRMaW5lSGVpZ2h0KClcbiAgICBjb25zdCBuZXdIZWlnaHQgPSB0aGlzLmFic29sdXRlTW9kZSAmJiB0aGlzLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCA/IE1hdGgubWluKHRoaXMubWluaW1hcC5nZXRIZWlnaHQoKSwgbWF4Q2FudmFzSGVpZ2h0KSA6IG1heENhbnZhc0hlaWdodFxuICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMuZ2V0RnJvbnRDYW52YXMoKVxuICAgIGlmIChjYW52YXNXaWR0aCAhPT0gY2FudmFzLndpZHRoIHx8IG5ld0hlaWdodCAhPT0gY2FudmFzLmhlaWdodCkge1xuICAgICAgdGhpcy5zZXRDYW52YXNlc1NpemUoXG4gICAgICAgIGNhbnZhc1dpZHRoICogZGV2aWNlUGl4ZWxSYXRpbyxcbiAgICAgICAgbmV3SGVpZ2h0ICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgICAgKVxuICAgICAgaWYgKHRoaXMuYWJzb2x1dGVNb2RlICYmIHRoaXMuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0KSB7XG4gICAgICAgIHRoaXMub2Zmc2NyZWVuRmlyc3RSb3cgPSBudWxsXG4gICAgICAgIHRoaXMub2Zmc2NyZWVuTGFzdFJvdyA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyAgICAjIyMjIyMjIyAjIyAgICAgIyMgIyMjIyMjIyMgIyMgICAgIyMgIyMjIyMjIyMgICMjIyMjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMjICAgIyMgICAgIyMgICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICMjIyMgICMjICAgICMjICAgICMjXG4gIC8vICAgICMjIyMjIyAgICMjICAgICAjIyAjIyMjIyMgICAjIyAjIyAjIyAgICAjIyAgICAgIyMjIyMjXG4gIC8vICAgICMjICAgICAgICAjIyAgICMjICAjIyAgICAgICAjIyAgIyMjIyAgICAjIyAgICAgICAgICAjI1xuICAvLyAgICAjIyAgICAgICAgICMjICMjICAgIyMgICAgICAgIyMgICAjIyMgICAgIyMgICAgIyMgICAgIyNcbiAgLy8gICAgIyMjIyMjIyMgICAgIyMjICAgICMjIyMjIyMjICMjICAgICMjICAgICMjICAgICAjIyMjIyNcblxuICAvKipcbiAgICogSGVscGVyIG1ldGhvZCB0byByZWdpc3RlciBjb25maWcgb2JzZXJ2ZXJzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGNvbmZpZ3M9e30gYW4gb2JqZWN0IG1hcHBpbmcgdGhlIGNvbmZpZyBuYW1lIHRvIG9ic2VydmVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggdGhlIGZ1bmN0aW9uIHRvIGNhbGwgYmFjayB3aGVuIGEgY2hhbmdlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvY2N1cnNcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBvYnNlcnZlQ29uZmlnIChjb25maWdzID0ge30pIHtcbiAgICBmb3IgKGxldCBjb25maWcgaW4gY29uZmlncykge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKGNvbmZpZywgY29uZmlnc1tjb25maWddKSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgdHJpZ2dlcmVkIHdoZW4gdGhlIG1vdXNlIGlzIHByZXNzZWQgb24gdGhlIE1pbmltYXBFbGVtZW50IGNhbnZhcy5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSB5IHRoZSB2ZXJ0aWNhbCBjb29yZGluYXRlIG9mIHRoZSBldmVudFxuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc0xlZnRNb3VzZSB3YXMgdGhlIGxlZnQgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGlzTWlkZGxlTW91c2Ugd2FzIHRoZSBtaWRkbGUgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY2FudmFzUHJlc3NlZCAoe3ksIGlzTGVmdE1vdXNlLCBpc01pZGRsZU1vdXNlfSkge1xuICAgIGlmICh0aGlzLm1pbmltYXAuaXNTdGFuZEFsb25lKCkpIHsgcmV0dXJuIH1cbiAgICBpZiAoaXNMZWZ0TW91c2UpIHtcbiAgICAgIHRoaXMuY2FudmFzTGVmdE1vdXNlUHJlc3NlZCh5KVxuICAgIH0gZWxzZSBpZiAoaXNNaWRkbGVNb3VzZSkge1xuICAgICAgdGhpcy5jYW52YXNNaWRkbGVNb3VzZVByZXNzZWQoeSlcbiAgICAgIGxldCB7dG9wLCBoZWlnaHR9ID0gdGhpcy52aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgdGhpcy5zdGFydERyYWcoe3k6IHRvcCArIGhlaWdodCAvIDIsIGlzTGVmdE1vdXNlOiBmYWxzZSwgaXNNaWRkbGVNb3VzZTogdHJ1ZX0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRyaWdnZXJlZCB3aGVuIHRoZSBtb3VzZSBsZWZ0IGJ1dHRvbiBpcyBwcmVzc2VkIG9uIHRoZVxuICAgKiBNaW5pbWFwRWxlbWVudCBjYW52YXMuXG4gICAqXG4gICAqIEBwYXJhbSAge01vdXNlRXZlbnR9IGUgdGhlIG1vdXNlIGV2ZW50IG9iamVjdFxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGUucGFnZVkgdGhlIG1vdXNlIHkgcG9zaXRpb24gaW4gcGFnZVxuICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZS50YXJnZXQgdGhlIHNvdXJjZSBvZiB0aGUgZXZlbnRcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjYW52YXNMZWZ0TW91c2VQcmVzc2VkICh5KSB7XG4gICAgY29uc3QgZGVsdGFZID0geSAtIHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wXG4gICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihkZWx0YVkgLyB0aGlzLm1pbmltYXAuZ2V0TGluZUhlaWdodCgpKSArIHRoaXMubWluaW1hcC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gICAgY29uc3QgdGV4dEVkaXRvciA9IHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yKClcblxuICAgIGNvbnN0IHNjcm9sbFRvcCA9IHJvdyAqIHRleHRFZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgLSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvckhlaWdodCgpIC8gMlxuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5zY3JvbGxBbmltYXRpb24nKSkge1xuICAgICAgY29uc3QgZHVyYXRpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuc2Nyb2xsQW5pbWF0aW9uRHVyYXRpb24nKVxuICAgICAgY29uc3QgaW5kZXBlbmRlbnRTY3JvbGwgPSB0aGlzLm1pbmltYXAuc2Nyb2xsSW5kZXBlbmRlbnRseU9uTW91c2VXaGVlbCgpXG5cbiAgICAgIGxldCBmcm9tID0gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JTY3JvbGxUb3AoKVxuICAgICAgbGV0IHRvID0gc2Nyb2xsVG9wXG4gICAgICBsZXQgc3RlcFxuXG4gICAgICBpZiAoaW5kZXBlbmRlbnRTY3JvbGwpIHtcbiAgICAgICAgY29uc3QgbWluaW1hcEZyb20gPSB0aGlzLm1pbmltYXAuZ2V0U2Nyb2xsVG9wKClcbiAgICAgICAgY29uc3QgbWluaW1hcFRvID0gTWF0aC5taW4oMSwgc2Nyb2xsVG9wIC8gKHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yTWF4U2Nyb2xsVG9wKCkgfHwgMSkpICogdGhpcy5taW5pbWFwLmdldE1heFNjcm9sbFRvcCgpXG5cbiAgICAgICAgc3RlcCA9IChub3csIHQpID0+IHtcbiAgICAgICAgICB0aGlzLm1pbmltYXAuc2V0VGV4dEVkaXRvclNjcm9sbFRvcChub3csIHRydWUpXG4gICAgICAgICAgdGhpcy5taW5pbWFwLnNldFNjcm9sbFRvcChtaW5pbWFwRnJvbSArIChtaW5pbWFwVG8gLSBtaW5pbWFwRnJvbSkgKiB0KVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYW5pbWF0ZSh7ZnJvbTogZnJvbSwgdG86IHRvLCBkdXJhdGlvbjogZHVyYXRpb24sIHN0ZXA6IHN0ZXB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RlcCA9IChub3cpID0+IHRoaXMubWluaW1hcC5zZXRUZXh0RWRpdG9yU2Nyb2xsVG9wKG5vdylcbiAgICAgICAgdGhpcy5hbmltYXRlKHtmcm9tOiBmcm9tLCB0bzogdG8sIGR1cmF0aW9uOiBkdXJhdGlvbiwgc3RlcDogc3RlcH0pXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubWluaW1hcC5zZXRUZXh0RWRpdG9yU2Nyb2xsVG9wKHNjcm9sbFRvcClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgdHJpZ2dlcmVkIHdoZW4gdGhlIG1vdXNlIG1pZGRsZSBidXR0b24gaXMgcHJlc3NlZCBvbiB0aGVcbiAgICogTWluaW1hcEVsZW1lbnQgY2FudmFzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNb3VzZUV2ZW50fSBlIHRoZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICogQHBhcmFtICB7bnVtYmVyfSBlLnBhZ2VZIHRoZSBtb3VzZSB5IHBvc2l0aW9uIGluIHBhZ2VcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjYW52YXNNaWRkbGVNb3VzZVByZXNzZWQgKHkpIHtcbiAgICBsZXQge3RvcDogb2Zmc2V0VG9wfSA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBsZXQgZGVsdGFZID0geSAtIG9mZnNldFRvcCAtIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkgLyAyXG5cbiAgICBsZXQgcmF0aW8gPSBkZWx0YVkgLyAodGhpcy5taW5pbWFwLmdldFZpc2libGVIZWlnaHQoKSAtIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkpXG5cbiAgICB0aGlzLm1pbmltYXAuc2V0VGV4dEVkaXRvclNjcm9sbFRvcChyYXRpbyAqIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yTWF4U2Nyb2xsVG9wKCkpXG4gIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCByZWxheXMgdGhlIGBtb3VzZXdoZWVsYCBldmVudHMgcmVjZWl2ZWQgYnkgdGhlIE1pbmltYXBFbGVtZW50XG4gICAqIHRvIHRoZSBgVGV4dEVkaXRvckVsZW1lbnRgLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNb3VzZUV2ZW50fSBlIHRoZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICByZWxheU1vdXNld2hlZWxFdmVudCAoZSkge1xuICAgIGlmICh0aGlzLm1pbmltYXAuc2Nyb2xsSW5kZXBlbmRlbnRseU9uTW91c2VXaGVlbCgpKSB7XG4gICAgICB0aGlzLm1pbmltYXAub25Nb3VzZVdoZWVsKGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKS5jb21wb25lbnQub25Nb3VzZVdoZWVsKGUpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgZXh0cmFjdHMgZGF0YSBmcm9tIGEgYE1vdXNlRXZlbnRgIHdoaWNoIGNhbiB0aGVuIGJlIHVzZWQgdG9cbiAgICogcHJvY2VzcyBjbGlja3MgYW5kIGRyYWdzIG9mIHRoZSBtaW5pbWFwLlxuICAgKlxuICAgKiBVc2VkIHRvZ2V0aGVyIHdpdGggYGV4dHJhY3RUb3VjaEV2ZW50RGF0YWAgdG8gcHJvdmlkZSBhIHVuaWZpZWQgaW50ZXJmYWNlXG4gICAqIGZvciBgTW91c2VFdmVudGBzIGFuZCBgVG91Y2hFdmVudGBzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNb3VzZUV2ZW50fSBtb3VzZUV2ZW50IHRoZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBleHRyYWN0TW91c2VFdmVudERhdGEgKG1vdXNlRXZlbnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogbW91c2VFdmVudC5wYWdlWCxcbiAgICAgIHk6IG1vdXNlRXZlbnQucGFnZVksXG4gICAgICBpc0xlZnRNb3VzZTogbW91c2VFdmVudC53aGljaCA9PT0gMSxcbiAgICAgIGlzTWlkZGxlTW91c2U6IG1vdXNlRXZlbnQud2hpY2ggPT09IDJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCBleHRyYWN0cyBkYXRhIGZyb20gYSBgVG91Y2hFdmVudGAgd2hpY2ggY2FuIHRoZW4gYmUgdXNlZCB0b1xuICAgKiBwcm9jZXNzIGNsaWNrcyBhbmQgZHJhZ3Mgb2YgdGhlIG1pbmltYXAuXG4gICAqXG4gICAqIFVzZWQgdG9nZXRoZXIgd2l0aCBgZXh0cmFjdE1vdXNlRXZlbnREYXRhYCB0byBwcm92aWRlIGEgdW5pZmllZCBpbnRlcmZhY2VcbiAgICogZm9yIGBNb3VzZUV2ZW50YHMgYW5kIGBUb3VjaEV2ZW50YHMuXG4gICAqXG4gICAqIEBwYXJhbSAge1RvdWNoRXZlbnR9IHRvdWNoRXZlbnQgdGhlIHRvdWNoIGV2ZW50IG9iamVjdFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGV4dHJhY3RUb3VjaEV2ZW50RGF0YSAodG91Y2hFdmVudCkge1xuICAgIC8vIFVzZSB0aGUgZmlyc3QgdG91Y2ggb24gdGhlIHRhcmdldCBhcmVhLiBPdGhlciB0b3VjaGVzIHdpbGwgYmUgaWdub3JlZCBpblxuICAgIC8vIGNhc2Ugb2YgbXVsdGktdG91Y2guXG4gICAgbGV0IHRvdWNoID0gdG91Y2hFdmVudC5jaGFuZ2VkVG91Y2hlc1swXVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHRvdWNoLnBhZ2VYLFxuICAgICAgeTogdG91Y2gucGFnZVksXG4gICAgICBpc0xlZnRNb3VzZTogdHJ1ZSwgLy8gVG91Y2ggaXMgdHJlYXRlZCBsaWtlIGEgbGVmdCBtb3VzZSBidXR0b24gY2xpY2tcbiAgICAgIGlzTWlkZGxlTW91c2U6IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZXMgdG8gYSBtZWRpYSBxdWVyeSBmb3IgZGV2aWNlIHBpeGVsIHJhdGlvIGNoYW5nZXMgYW5kIGZvcmNlc1xuICAgKiBhIHJlcGFpbnQgd2hlbiBpdCBvY2N1cnMuXG4gICAqXG4gICAqIEByZXR1cm4ge0Rpc3Bvc2FibGV9IGEgZGlzcG9zYWJsZSB0byByZW1vdmUgdGhlIG1lZGlhIHF1ZXJ5IGxpc3RlbmVyXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgc3Vic2NyaWJlVG9NZWRpYVF1ZXJ5ICgpIHtcbiAgICBjb25zdCBxdWVyeSA9ICdzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDEuNSknXG4gICAgY29uc3QgbWVkaWFRdWVyeSA9IHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KVxuICAgIGNvbnN0IG1lZGlhTGlzdGVuZXIgPSAoZSkgPT4geyB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKSB9XG4gICAgbWVkaWFRdWVyeS5hZGRMaXN0ZW5lcihtZWRpYUxpc3RlbmVyKVxuXG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIG1lZGlhUXVlcnkucmVtb3ZlTGlzdGVuZXIobWVkaWFMaXN0ZW5lcilcbiAgICB9KVxuICB9XG5cbiAgLy8gICAgIyMjIyMjIyMgICAgIyMjIyAgICAjIyMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgICMjICAjIyAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAjIyMjICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICMjIyMgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICMjICMjICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAjIyAgICMjICAgICAjI1xuICAvLyAgICAjIyMjIyMjIyAgICMjIyMgICMjICMjIyMjIyMjXG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRyaWdnZXJlZCB3aGVuIHRoZSBtb3VzZSBpcyBwcmVzc2VkIG92ZXIgdGhlIHZpc2libGUgYXJlYSB0aGF0XG4gICAqIHN0YXJ0cyB0aGUgZHJhZ2dpbmcgZ2VzdHVyZS5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSB5IHRoZSB2ZXJ0aWNhbCBjb29yZGluYXRlIG9mIHRoZSBldmVudFxuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc0xlZnRNb3VzZSB3YXMgdGhlIGxlZnQgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGlzTWlkZGxlTW91c2Ugd2FzIHRoZSBtaWRkbGUgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgc3RhcnREcmFnICh7eSwgaXNMZWZ0TW91c2UsIGlzTWlkZGxlTW91c2V9KSB7XG4gICAgaWYgKCF0aGlzLm1pbmltYXApIHsgcmV0dXJuIH1cbiAgICBpZiAoIWlzTGVmdE1vdXNlICYmICFpc01pZGRsZU1vdXNlKSB7IHJldHVybiB9XG5cbiAgICBsZXQge3RvcH0gPSB0aGlzLnZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgbGV0IHt0b3A6IG9mZnNldFRvcH0gPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cbiAgICBsZXQgZHJhZ09mZnNldCA9IHkgLSB0b3BcblxuICAgIGxldCBpbml0aWFsID0ge2RyYWdPZmZzZXQsIG9mZnNldFRvcH1cblxuICAgIGxldCBtb3VzZW1vdmVIYW5kbGVyID0gKGUpID0+IHRoaXMuZHJhZyh0aGlzLmV4dHJhY3RNb3VzZUV2ZW50RGF0YShlKSwgaW5pdGlhbClcbiAgICBsZXQgbW91c2V1cEhhbmRsZXIgPSAoZSkgPT4gdGhpcy5lbmREcmFnKClcblxuICAgIGxldCB0b3VjaG1vdmVIYW5kbGVyID0gKGUpID0+IHRoaXMuZHJhZyh0aGlzLmV4dHJhY3RUb3VjaEV2ZW50RGF0YShlKSwgaW5pdGlhbClcbiAgICBsZXQgdG91Y2hlbmRIYW5kbGVyID0gKGUpID0+IHRoaXMuZW5kRHJhZygpXG5cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdXNlbW92ZUhhbmRsZXIpXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgbW91c2V1cEhhbmRsZXIpXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgbW91c2V1cEhhbmRsZXIpXG5cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRvdWNobW92ZUhhbmRsZXIpXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRvdWNoZW5kSGFuZGxlcilcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdG91Y2hlbmRIYW5kbGVyKVxuXG4gICAgdGhpcy5kcmFnU3Vic2NyaXB0aW9uID0gbmV3IERpc3Bvc2FibGUoZnVuY3Rpb24gKCkge1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmVIYW5kbGVyKVxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgbW91c2V1cEhhbmRsZXIpXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBtb3VzZXVwSGFuZGxlcilcblxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0b3VjaG1vdmVIYW5kbGVyKVxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRvdWNoZW5kSGFuZGxlcilcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0b3VjaGVuZEhhbmRsZXIpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWV0aG9kIGNhbGxlZCBkdXJpbmcgdGhlIGRyYWcgZ2VzdHVyZS5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSB5IHRoZSB2ZXJ0aWNhbCBjb29yZGluYXRlIG9mIHRoZSBldmVudFxuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc0xlZnRNb3VzZSB3YXMgdGhlIGxlZnQgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGlzTWlkZGxlTW91c2Ugd2FzIHRoZSBtaWRkbGUgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBwYXJhbSAge251bWJlcn0gaW5pdGlhbC5kcmFnT2Zmc2V0IHRoZSBtb3VzZSBvZmZzZXQgd2l0aGluIHRoZSB2aXNpYmxlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWFcbiAgICogQHBhcmFtICB7bnVtYmVyfSBpbml0aWFsLm9mZnNldFRvcCB0aGUgTWluaW1hcEVsZW1lbnQgb2Zmc2V0IGF0IHRoZSBtb21lbnRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZiB0aGUgZHJhZyBzdGFydFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYWcgKHt5LCBpc0xlZnRNb3VzZSwgaXNNaWRkbGVNb3VzZX0sIGluaXRpYWwpIHtcbiAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuICAgIGlmICghaXNMZWZ0TW91c2UgJiYgIWlzTWlkZGxlTW91c2UpIHsgcmV0dXJuIH1cbiAgICBsZXQgZGVsdGFZID0geSAtIGluaXRpYWwub2Zmc2V0VG9wIC0gaW5pdGlhbC5kcmFnT2Zmc2V0XG5cbiAgICBsZXQgcmF0aW8gPSBkZWx0YVkgLyAodGhpcy5taW5pbWFwLmdldFZpc2libGVIZWlnaHQoKSAtIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkpXG5cbiAgICB0aGlzLm1pbmltYXAuc2V0VGV4dEVkaXRvclNjcm9sbFRvcChyYXRpbyAqIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yTWF4U2Nyb2xsVG9wKCkpXG4gIH1cblxuICAvKipcbiAgICogVGhlIG1ldGhvZCB0aGF0IGVuZHMgdGhlIGRyYWcgZ2VzdHVyZS5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBlbmREcmFnICgpIHtcbiAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuICAgIHRoaXMuZHJhZ1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgfVxuXG4gIC8vICAgICAjIyMjIyMgICAjIyMjIyMgICAjIyMjIyNcbiAgLy8gICAgIyMgICAgIyMgIyMgICAgIyMgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICAgIyNcbiAgLy8gICAgIyMgICAgICAgICMjIyMjIyAgICMjIyMjI1xuICAvLyAgICAjIyAgICAgICAgICAgICAjIyAgICAgICAjI1xuICAvLyAgICAjIyAgICAjIyAjIyAgICAjIyAjIyAgICAjI1xuICAvLyAgICAgIyMjIyMjICAgIyMjIyMjICAgIyMjIyMjXG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgdGhlIHBhc3NlZC1pbiBzdHlsZXMgcHJvcGVydGllcyB0byB0aGUgc3BlY2lmaWVkIGVsZW1lbnRcbiAgICpcbiAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgdGhlIGVsZW1lbnQgb250byB3aGljaCBhcHBseSB0aGUgc3R5bGVzXG4gICAqIEBwYXJhbSAge09iamVjdH0gc3R5bGVzIHRoZSBzdHlsZXMgdG8gYXBwbHlcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBhcHBseVN0eWxlcyAoZWxlbWVudCwgc3R5bGVzKSB7XG4gICAgaWYgKCFlbGVtZW50KSB7IHJldHVybiB9XG5cbiAgICBsZXQgY3NzVGV4dCA9ICcnXG4gICAgZm9yIChsZXQgcHJvcGVydHkgaW4gc3R5bGVzKSB7XG4gICAgICBjc3NUZXh0ICs9IGAke3Byb3BlcnR5fTogJHtzdHlsZXNbcHJvcGVydHldfTsgYFxuICAgIH1cblxuICAgIGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGNzc1RleHRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHdpdGggYSBDU1MgdHJhbnNsYXRpb24gdHJhbmZvcm0gdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gW3ggPSAwXSB0aGUgeCBvZmZzZXQgb2YgdGhlIHRyYW5zbGF0aW9uXG4gICAqIEBwYXJhbSAge251bWJlcn0gW3kgPSAwXSB0aGUgeSBvZmZzZXQgb2YgdGhlIHRyYW5zbGF0aW9uXG4gICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIENTUyB0cmFuc2xhdGlvbiBzdHJpbmdcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBtYWtlVHJhbnNsYXRlICh4ID0gMCwgeSA9IDApIHtcbiAgICBpZiAodGhpcy51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbikge1xuICAgICAgcmV0dXJuIGB0cmFuc2xhdGUzZCgke3h9cHgsICR7eX1weCwgMClgXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgdHJhbnNsYXRlKCR7eH1weCwgJHt5fXB4KWBcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyB3aXRoIGEgQ1NTIHNjYWxpbmcgdHJhbmZvcm0gdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gW3ggPSAwXSB0aGUgeCBzY2FsaW5nIGZhY3RvclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IFt5ID0gMF0gdGhlIHkgc2NhbGluZyBmYWN0b3JcbiAgICogQHJldHVybiB7c3RyaW5nfSB0aGUgQ1NTIHNjYWxpbmcgc3RyaW5nXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgbWFrZVNjYWxlICh4ID0gMCwgeSA9IHgpIHtcbiAgICBpZiAodGhpcy51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbikge1xuICAgICAgcmV0dXJuIGBzY2FsZTNkKCR7eH0sICR7eX0sIDEpYFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYHNjYWxlKCR7eH0sICR7eX0pYFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IHJldHVybiB0aGUgY3VycmVudCB0aW1lIGFzIGEgRGF0ZS5cbiAgICpcbiAgICogVGhhdCBtZXRob2QgZXhpc3Qgc28gdGhhdCB3ZSBjYW4gbW9jayBpdCBpbiB0ZXN0cy5cbiAgICpcbiAgICogQHJldHVybiB7RGF0ZX0gdGhlIGN1cnJlbnQgdGltZSBhcyBEYXRlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZ2V0VGltZSAoKSB7IHJldHVybiBuZXcgRGF0ZSgpIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCBtaW1pYyB0aGUgalF1ZXJ5IGBhbmltYXRlYCBtZXRob2QgYW5kIHVzZWQgdG8gYW5pbWF0ZSB0aGVcbiAgICogc2Nyb2xsIHdoZW4gY2xpY2tpbmcgb24gdGhlIE1pbmltYXBFbGVtZW50IGNhbnZhcy5cbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSBwYXJhbSB0aGUgYW5pbWF0aW9uIGRhdGEgb2JqZWN0XG4gICAqIEBwYXJhbSAge1t0eXBlXX0gcGFyYW0uZnJvbSB0aGUgc3RhcnQgdmFsdWVcbiAgICogQHBhcmFtICB7W3R5cGVdfSBwYXJhbS50byB0aGUgZW5kIHZhbHVlXG4gICAqIEBwYXJhbSAge1t0eXBlXX0gcGFyYW0uZHVyYXRpb24gdGhlIGFuaW1hdGlvbiBkdXJhdGlvblxuICAgKiBAcGFyYW0gIHtbdHlwZV19IHBhcmFtLnN0ZXAgdGhlIGVhc2luZyBmdW5jdGlvbiBmb3IgdGhlIGFuaW1hdGlvblxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGFuaW1hdGUgKHtmcm9tLCB0bywgZHVyYXRpb24sIHN0ZXB9KSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLmdldFRpbWUoKVxuICAgIGxldCBwcm9ncmVzc1xuXG4gICAgY29uc3Qgc3dpbmcgPSBmdW5jdGlvbiAocHJvZ3Jlc3MpIHtcbiAgICAgIHJldHVybiAwLjUgLSBNYXRoLmNvcyhwcm9ncmVzcyAqIE1hdGguUEkpIC8gMlxuICAgIH1cblxuICAgIGNvbnN0IHVwZGF0ZSA9ICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5taW5pbWFwKSB7IHJldHVybiB9XG5cbiAgICAgIGNvbnN0IHBhc3NlZCA9IHRoaXMuZ2V0VGltZSgpIC0gc3RhcnRcbiAgICAgIGlmIChkdXJhdGlvbiA9PT0gMCkge1xuICAgICAgICBwcm9ncmVzcyA9IDFcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2dyZXNzID0gcGFzc2VkIC8gZHVyYXRpb25cbiAgICAgIH1cbiAgICAgIGlmIChwcm9ncmVzcyA+IDEpIHsgcHJvZ3Jlc3MgPSAxIH1cbiAgICAgIGNvbnN0IGRlbHRhID0gc3dpbmcocHJvZ3Jlc3MpXG4gICAgICBjb25zdCB2YWx1ZSA9IGZyb20gKyAodG8gLSBmcm9tKSAqIGRlbHRhXG4gICAgICBzdGVwKHZhbHVlLCBkZWx0YSlcblxuICAgICAgaWYgKHByb2dyZXNzIDwgMSkgeyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKSB9XG4gICAgfVxuXG4gICAgdXBkYXRlKClcbiAgfVxufVxuIl19
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/minimap/lib/minimap-element.js
