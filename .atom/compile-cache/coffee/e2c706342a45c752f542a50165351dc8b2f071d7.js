(function() {
  var ColorBufferElement, ColorMarkerElement, CompositeDisposable, Emitter, EventsDelegation, nextHighlightId, registerOrUpdateElement, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  _ref1 = require('atom-utils'), registerOrUpdateElement = _ref1.registerOrUpdateElement, EventsDelegation = _ref1.EventsDelegation;

  ColorMarkerElement = require('./color-marker-element');

  nextHighlightId = 0;

  ColorBufferElement = (function(_super) {
    __extends(ColorBufferElement, _super);

    function ColorBufferElement() {
      return ColorBufferElement.__super__.constructor.apply(this, arguments);
    }

    EventsDelegation.includeInto(ColorBufferElement);

    ColorBufferElement.prototype.createdCallback = function() {
      var _ref2;
      _ref2 = [0, 0], this.editorScrollLeft = _ref2[0], this.editorScrollTop = _ref2[1];
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.shadowRoot = this.createShadowRoot();
      this.displayedMarkers = [];
      this.usedMarkers = [];
      this.unusedMarkers = [];
      return this.viewsByMarkers = new WeakMap;
    };

    ColorBufferElement.prototype.attachedCallback = function() {
      this.attached = true;
      return this.update();
    };

    ColorBufferElement.prototype.detachedCallback = function() {
      return this.attached = false;
    };

    ColorBufferElement.prototype.onDidUpdate = function(callback) {
      return this.emitter.on('did-update', callback);
    };

    ColorBufferElement.prototype.getModel = function() {
      return this.colorBuffer;
    };

    ColorBufferElement.prototype.setModel = function(colorBuffer) {
      var scrollLeftListener, scrollTopListener;
      this.colorBuffer = colorBuffer;
      this.editor = this.colorBuffer.editor;
      if (this.editor.isDestroyed()) {
        return;
      }
      this.editorElement = atom.views.getView(this.editor);
      this.colorBuffer.initialize().then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
      this.subscriptions.add(this.colorBuffer.onDidUpdateColorMarkers((function(_this) {
        return function() {
          return _this.update();
        };
      })(this)));
      this.subscriptions.add(this.colorBuffer.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      scrollLeftListener = (function(_this) {
        return function(editorScrollLeft) {
          _this.editorScrollLeft = editorScrollLeft;
          return _this.updateScroll();
        };
      })(this);
      scrollTopListener = (function(_this) {
        return function(editorScrollTop) {
          _this.editorScrollTop = editorScrollTop;
          if (_this.useNativeDecorations()) {
            return;
          }
          _this.updateScroll();
          return requestAnimationFrame(function() {
            return _this.updateMarkers();
          });
        };
      })(this);
      if (this.editorElement.onDidChangeScrollLeft != null) {
        this.subscriptions.add(this.editorElement.onDidChangeScrollLeft(scrollLeftListener));
        this.subscriptions.add(this.editorElement.onDidChangeScrollTop(scrollTopListener));
      } else {
        this.subscriptions.add(this.editor.onDidChangeScrollLeft(scrollLeftListener));
        this.subscriptions.add(this.editor.onDidChangeScrollTop(scrollTopListener));
      }
      this.subscriptions.add(this.editor.onDidChange((function(_this) {
        return function() {
          return _this.usedMarkers.forEach(function(marker) {
            var _ref2;
            if ((_ref2 = marker.colorMarker) != null) {
              _ref2.invalidateScreenRangeCache();
            }
            return marker.checkScreenRange();
          });
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidAddCursor((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidRemoveCursor((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangeCursorPosition((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidAddSelection((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidRemoveSelection((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangeSelectionRange((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      if (this.editor.onDidTokenize != null) {
        this.subscriptions.add(this.editor.onDidTokenize((function(_this) {
          return function() {
            return _this.editorConfigChanged();
          };
        })(this)));
      } else {
        this.subscriptions.add(this.editor.displayBuffer.onDidTokenize((function(_this) {
          return function() {
            return _this.editorConfigChanged();
          };
        })(this)));
      }
      this.subscriptions.add(atom.config.observe('editor.fontSize', (function(_this) {
        return function() {
          return _this.editorConfigChanged();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('editor.lineHeight', (function(_this) {
        return function() {
          return _this.editorConfigChanged();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', (function(_this) {
        return function(type) {
          if (ColorMarkerElement.prototype.rendererType !== type) {
            ColorMarkerElement.setMarkerType(type);
          }
          if (_this.isNativeDecorationType(type)) {
            _this.initializeNativeDecorations(type);
          } else {
            if (type === 'background') {
              _this.classList.add('above-editor-content');
            } else {
              _this.classList.remove('above-editor-content');
            }
            _this.destroyNativeDecorations();
            _this.updateMarkers(type);
          }
          return _this.previousType = type;
        };
      })(this)));
      this.subscriptions.add(atom.styles.onDidAddStyleElement((function(_this) {
        return function() {
          return _this.editorConfigChanged();
        };
      })(this)));
      this.subscriptions.add(this.editorElement.onDidAttach((function(_this) {
        return function() {
          return _this.attach();
        };
      })(this)));
      return this.subscriptions.add(this.editorElement.onDidDetach((function(_this) {
        return function() {
          return _this.detach();
        };
      })(this)));
    };

    ColorBufferElement.prototype.attach = function() {
      var _ref2;
      if (this.parentNode != null) {
        return;
      }
      if (this.editorElement == null) {
        return;
      }
      return (_ref2 = this.getEditorRoot().querySelector('.lines')) != null ? _ref2.appendChild(this) : void 0;
    };

    ColorBufferElement.prototype.detach = function() {
      if (this.parentNode == null) {
        return;
      }
      return this.parentNode.removeChild(this);
    };

    ColorBufferElement.prototype.destroy = function() {
      this.detach();
      this.subscriptions.dispose();
      if (this.isNativeDecorationType()) {
        this.destroyNativeDecorations();
      } else {
        this.releaseAllMarkerViews();
      }
      return this.colorBuffer = null;
    };

    ColorBufferElement.prototype.update = function() {
      if (this.useNativeDecorations()) {
        if (this.isGutterType()) {
          return this.updateGutterDecorations();
        } else {
          return this.updateHighlightDecorations(this.previousType);
        }
      } else {
        return this.updateMarkers();
      }
    };

    ColorBufferElement.prototype.updateScroll = function() {
      if (this.editorElement.hasTiledRendering && !this.useNativeDecorations()) {
        return this.style.webkitTransform = "translate3d(" + (-this.editorScrollLeft) + "px, " + (-this.editorScrollTop) + "px, 0)";
      }
    };

    ColorBufferElement.prototype.getEditorRoot = function() {
      var _ref2;
      return (_ref2 = this.editorElement.shadowRoot) != null ? _ref2 : this.editorElement;
    };

    ColorBufferElement.prototype.editorConfigChanged = function() {
      if ((this.parentNode == null) || this.useNativeDecorations()) {
        return;
      }
      this.usedMarkers.forEach((function(_this) {
        return function(marker) {
          if (marker.colorMarker != null) {
            return marker.render();
          } else {
            console.warn("A marker view was found in the used instance pool while having a null model", marker);
            return _this.releaseMarkerElement(marker);
          }
        };
      })(this));
      return this.updateMarkers();
    };

    ColorBufferElement.prototype.isGutterType = function(type) {
      if (type == null) {
        type = this.previousType;
      }
      return type === 'gutter' || type === 'native-dot' || type === 'native-square-dot';
    };

    ColorBufferElement.prototype.isDotType = function(type) {
      if (type == null) {
        type = this.previousType;
      }
      return type === 'native-dot' || type === 'native-square-dot';
    };

    ColorBufferElement.prototype.useNativeDecorations = function() {
      return this.isNativeDecorationType(this.previousType);
    };

    ColorBufferElement.prototype.isNativeDecorationType = function(type) {
      return ColorMarkerElement.isNativeDecorationType(type);
    };

    ColorBufferElement.prototype.initializeNativeDecorations = function(type) {
      this.releaseAllMarkerViews();
      this.destroyNativeDecorations();
      if (this.isGutterType(type)) {
        return this.initializeGutter(type);
      } else {
        return this.updateHighlightDecorations(type);
      }
    };

    ColorBufferElement.prototype.destroyNativeDecorations = function() {
      if (this.isGutterType()) {
        return this.destroyGutter();
      } else {
        return this.destroyHighlightDecorations();
      }
    };

    ColorBufferElement.prototype.updateHighlightDecorations = function(type) {
      var className, m, markers, markersByRows, maxRowLength, style, _i, _j, _len, _len1, _ref2, _ref3, _ref4, _ref5;
      if (this.editor.isDestroyed()) {
        return;
      }
      if (this.styleByMarkerId == null) {
        this.styleByMarkerId = {};
      }
      if (this.decorationByMarkerId == null) {
        this.decorationByMarkerId = {};
      }
      markers = this.colorBuffer.getValidColorMarkers();
      _ref2 = this.displayedMarkers;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        m = _ref2[_i];
        if (!(__indexOf.call(markers, m) < 0)) {
          continue;
        }
        if ((_ref3 = this.decorationByMarkerId[m.id]) != null) {
          _ref3.destroy();
        }
        this.removeChild(this.styleByMarkerId[m.id]);
        delete this.styleByMarkerId[m.id];
        delete this.decorationByMarkerId[m.id];
      }
      markersByRows = {};
      maxRowLength = 0;
      for (_j = 0, _len1 = markers.length; _j < _len1; _j++) {
        m = markers[_j];
        if (((_ref4 = m.color) != null ? _ref4.isValid() : void 0) && __indexOf.call(this.displayedMarkers, m) < 0) {
          _ref5 = this.getHighlighDecorationCSS(m, type), className = _ref5.className, style = _ref5.style;
          this.appendChild(style);
          this.styleByMarkerId[m.id] = style;
          this.decorationByMarkerId[m.id] = this.editor.decorateMarker(m.marker, {
            type: 'highlight',
            "class": "pigments-" + type + " " + className,
            includeMarkerText: type === 'highlight'
          });
        }
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.destroyHighlightDecorations = function() {
      var deco, id, _ref2;
      _ref2 = this.decorationByMarkerId;
      for (id in _ref2) {
        deco = _ref2[id];
        if (this.styleByMarkerId[id] != null) {
          this.removeChild(this.styleByMarkerId[id]);
        }
        deco.destroy();
      }
      delete this.decorationByMarkerId;
      delete this.styleByMarkerId;
      return this.displayedMarkers = [];
    };

    ColorBufferElement.prototype.getHighlighDecorationCSS = function(marker, type) {
      var className, l, style;
      className = "pigments-highlight-" + (nextHighlightId++);
      style = document.createElement('style');
      l = marker.color.luma;
      if (type === 'native-background') {
        style.innerHTML = "." + className + " .region {\n  background-color: " + (marker.color.toCSS()) + ";\n  color: " + (l > 0.43 ? 'black' : 'white') + ";\n}";
      } else if (type === 'native-underline') {
        style.innerHTML = "." + className + " .region {\n  background-color: " + (marker.color.toCSS()) + ";\n}";
      } else if (type === 'native-outline') {
        style.innerHTML = "." + className + " .region {\n  border-color: " + (marker.color.toCSS()) + ";\n}";
      }
      return {
        className: className,
        style: style
      };
    };

    ColorBufferElement.prototype.initializeGutter = function(type) {
      var gutterContainer, options;
      options = {
        name: "pigments-" + type
      };
      if (type !== 'gutter') {
        options.priority = 1000;
      }
      this.gutter = this.editor.addGutter(options);
      this.displayedMarkers = [];
      if (this.decorationByMarkerId == null) {
        this.decorationByMarkerId = {};
      }
      gutterContainer = this.getEditorRoot().querySelector('.gutter-container');
      this.gutterSubscription = new CompositeDisposable;
      this.gutterSubscription.add(this.subscribeTo(gutterContainer, {
        mousedown: (function(_this) {
          return function(e) {
            var colorMarker, markerId, targetDecoration;
            targetDecoration = e.path[0];
            if (!targetDecoration.matches('span')) {
              targetDecoration = targetDecoration.querySelector('span');
            }
            if (targetDecoration == null) {
              return;
            }
            markerId = targetDecoration.dataset.markerId;
            colorMarker = _this.displayedMarkers.filter(function(m) {
              return m.id === Number(markerId);
            })[0];
            if (!((colorMarker != null) && (_this.colorBuffer != null))) {
              return;
            }
            return _this.colorBuffer.selectColorMarkerAndOpenPicker(colorMarker);
          };
        })(this)
      }));
      if (this.isDotType(type)) {
        this.gutterSubscription.add(this.editor.onDidChange((function(_this) {
          return function(changes) {
            if (Array.isArray(changes)) {
              return changes != null ? changes.forEach(function(change) {
                return _this.updateDotDecorationsOffsets(change.start.row);
              }) : void 0;
            } else {
              return _this.updateDotDecorationsOffsets(changes.start.row);
            }
          };
        })(this)));
      }
      return this.updateGutterDecorations(type);
    };

    ColorBufferElement.prototype.destroyGutter = function() {
      var decoration, id, _ref2;
      this.gutter.destroy();
      this.gutterSubscription.dispose();
      this.displayedMarkers = [];
      _ref2 = this.decorationByMarkerId;
      for (id in _ref2) {
        decoration = _ref2[id];
        decoration.destroy();
      }
      delete this.decorationByMarkerId;
      return delete this.gutterSubscription;
    };

    ColorBufferElement.prototype.updateGutterDecorations = function(type) {
      var deco, decoWidth, m, markers, markersByRows, maxRowLength, row, rowLength, _i, _j, _len, _len1, _ref2, _ref3, _ref4;
      if (type == null) {
        type = this.previousType;
      }
      if (this.editor.isDestroyed()) {
        return;
      }
      markers = this.colorBuffer.getValidColorMarkers();
      _ref2 = this.displayedMarkers;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        m = _ref2[_i];
        if (!(__indexOf.call(markers, m) < 0)) {
          continue;
        }
        if ((_ref3 = this.decorationByMarkerId[m.id]) != null) {
          _ref3.destroy();
        }
        delete this.decorationByMarkerId[m.id];
      }
      markersByRows = {};
      maxRowLength = 0;
      for (_j = 0, _len1 = markers.length; _j < _len1; _j++) {
        m = markers[_j];
        if (((_ref4 = m.color) != null ? _ref4.isValid() : void 0) && __indexOf.call(this.displayedMarkers, m) < 0) {
          this.decorationByMarkerId[m.id] = this.gutter.decorateMarker(m.marker, {
            type: 'gutter',
            "class": 'pigments-gutter-marker',
            item: this.getGutterDecorationItem(m)
          });
        }
        deco = this.decorationByMarkerId[m.id];
        row = m.marker.getStartScreenPosition().row;
        if (markersByRows[row] == null) {
          markersByRows[row] = 0;
        }
        rowLength = 0;
        if (type !== 'gutter') {
          rowLength = this.editorElement.pixelPositionForScreenPosition([row, Infinity]).left;
        }
        decoWidth = 14;
        deco.properties.item.style.left = "" + (rowLength + markersByRows[row] * decoWidth) + "px";
        markersByRows[row]++;
        maxRowLength = Math.max(maxRowLength, markersByRows[row]);
      }
      if (type === 'gutter') {
        atom.views.getView(this.gutter).style.minWidth = "" + (maxRowLength * decoWidth) + "px";
      } else {
        atom.views.getView(this.gutter).style.width = "0px";
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.updateDotDecorationsOffsets = function(row) {
      var deco, decoWidth, m, markerRow, markersByRows, rowLength, _i, _len, _ref2, _results;
      markersByRows = {};
      _ref2 = this.displayedMarkers;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        m = _ref2[_i];
        deco = this.decorationByMarkerId[m.id];
        if (m.marker == null) {
          continue;
        }
        markerRow = m.marker.getStartScreenPosition().row;
        if (row !== markerRow) {
          continue;
        }
        if (markersByRows[row] == null) {
          markersByRows[row] = 0;
        }
        rowLength = this.editorElement.pixelPositionForScreenPosition([row, Infinity]).left;
        decoWidth = 14;
        deco.properties.item.style.left = "" + (rowLength + markersByRows[row] * decoWidth) + "px";
        _results.push(markersByRows[row]++);
      }
      return _results;
    };

    ColorBufferElement.prototype.getGutterDecorationItem = function(marker) {
      var div;
      div = document.createElement('div');
      div.innerHTML = "<span style='background-color: " + (marker.color.toCSS()) + ";' data-marker-id='" + marker.id + "'></span>";
      return div;
    };

    ColorBufferElement.prototype.requestMarkerUpdate = function(markers) {
      if (this.frameRequested) {
        this.dirtyMarkers = this.dirtyMarkers.concat(markers);
        return;
      } else {
        this.dirtyMarkers = markers.slice();
        this.frameRequested = true;
      }
      return requestAnimationFrame((function(_this) {
        return function() {
          var dirtyMarkers, m, _i, _len, _ref2;
          dirtyMarkers = [];
          _ref2 = _this.dirtyMarkers;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            m = _ref2[_i];
            if (__indexOf.call(dirtyMarkers, m) < 0) {
              dirtyMarkers.push(m);
            }
          }
          delete _this.frameRequested;
          delete _this.dirtyMarkers;
          if (_this.colorBuffer == null) {
            return;
          }
          return dirtyMarkers.forEach(function(marker) {
            return marker.render();
          });
        };
      })(this));
    };

    ColorBufferElement.prototype.updateMarkers = function(type) {
      var m, markers, _base, _base1, _i, _j, _len, _len1, _ref2, _ref3, _ref4;
      if (type == null) {
        type = this.previousType;
      }
      if (this.editor.isDestroyed()) {
        return;
      }
      markers = this.colorBuffer.findValidColorMarkers({
        intersectsScreenRowRange: (_ref2 = typeof (_base = this.editorElement).getVisibleRowRange === "function" ? _base.getVisibleRowRange() : void 0) != null ? _ref2 : typeof (_base1 = this.editor).getVisibleRowRange === "function" ? _base1.getVisibleRowRange() : void 0
      });
      _ref3 = this.displayedMarkers;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        m = _ref3[_i];
        if (__indexOf.call(markers, m) < 0) {
          this.releaseMarkerView(m);
        }
      }
      for (_j = 0, _len1 = markers.length; _j < _len1; _j++) {
        m = markers[_j];
        if (((_ref4 = m.color) != null ? _ref4.isValid() : void 0) && __indexOf.call(this.displayedMarkers, m) < 0) {
          this.requestMarkerView(m);
        }
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.requestMarkerView = function(marker) {
      var view;
      if (this.unusedMarkers.length) {
        view = this.unusedMarkers.shift();
      } else {
        view = new ColorMarkerElement;
        view.setContainer(this);
        view.onDidRelease((function(_this) {
          return function(_arg) {
            var marker;
            marker = _arg.marker;
            _this.displayedMarkers.splice(_this.displayedMarkers.indexOf(marker), 1);
            return _this.releaseMarkerView(marker);
          };
        })(this));
        this.shadowRoot.appendChild(view);
      }
      view.setModel(marker);
      this.hideMarkerIfInSelectionOrFold(marker, view);
      this.usedMarkers.push(view);
      this.viewsByMarkers.set(marker, view);
      return view;
    };

    ColorBufferElement.prototype.releaseMarkerView = function(markerOrView) {
      var marker, view;
      marker = markerOrView;
      view = this.viewsByMarkers.get(markerOrView);
      if (view != null) {
        if (marker != null) {
          this.viewsByMarkers["delete"](marker);
        }
        return this.releaseMarkerElement(view);
      }
    };

    ColorBufferElement.prototype.releaseMarkerElement = function(view) {
      this.usedMarkers.splice(this.usedMarkers.indexOf(view), 1);
      if (!view.isReleased()) {
        view.release(false);
      }
      return this.unusedMarkers.push(view);
    };

    ColorBufferElement.prototype.releaseAllMarkerViews = function() {
      var view, _i, _j, _len, _len1, _ref2, _ref3;
      _ref2 = this.usedMarkers;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        view = _ref2[_i];
        view.destroy();
      }
      _ref3 = this.unusedMarkers;
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        view = _ref3[_j];
        view.destroy();
      }
      this.usedMarkers = [];
      this.unusedMarkers = [];
      return Array.prototype.forEach.call(this.shadowRoot.querySelectorAll('pigments-color-marker'), function(el) {
        return el.parentNode.removeChild(el);
      });
    };

    ColorBufferElement.prototype.requestSelectionUpdate = function() {
      if (this.updateRequested) {
        return;
      }
      this.updateRequested = true;
      return requestAnimationFrame((function(_this) {
        return function() {
          _this.updateRequested = false;
          if (_this.editor.getBuffer().isDestroyed()) {
            return;
          }
          return _this.updateSelections();
        };
      })(this));
    };

    ColorBufferElement.prototype.updateSelections = function() {
      var decoration, marker, view, _i, _j, _len, _len1, _ref2, _ref3, _results, _results1;
      if (this.editor.isDestroyed()) {
        return;
      }
      if (this.useNativeDecorations()) {
        _ref2 = this.displayedMarkers;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          marker = _ref2[_i];
          decoration = this.decorationByMarkerId[marker.id];
          if (decoration != null) {
            _results.push(this.hideDecorationIfInSelection(marker, decoration));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      } else {
        _ref3 = this.displayedMarkers;
        _results1 = [];
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          marker = _ref3[_j];
          view = this.viewsByMarkers.get(marker);
          if (view != null) {
            view.classList.remove('hidden');
            view.classList.remove('in-fold');
            _results1.push(this.hideMarkerIfInSelectionOrFold(marker, view));
          } else {
            _results1.push(console.warn("A color marker was found in the displayed markers array without an associated view", marker));
          }
        }
        return _results1;
      }
    };

    ColorBufferElement.prototype.hideDecorationIfInSelection = function(marker, decoration) {
      var classes, markerRange, props, range, selection, selections, _i, _len;
      selections = this.editor.getSelections();
      props = decoration.getProperties();
      classes = props["class"].split(/\s+/g);
      for (_i = 0, _len = selections.length; _i < _len; _i++) {
        selection = selections[_i];
        range = selection.getScreenRange();
        markerRange = marker.getScreenRange();
        if (!((markerRange != null) && (range != null))) {
          continue;
        }
        if (markerRange.intersectsWith(range)) {
          if (classes[0].match(/-in-selection$/) == null) {
            classes[0] += '-in-selection';
          }
          props["class"] = classes.join(' ');
          decoration.setProperties(props);
          return;
        }
      }
      classes = classes.map(function(cls) {
        return cls.replace('-in-selection', '');
      });
      props["class"] = classes.join(' ');
      return decoration.setProperties(props);
    };

    ColorBufferElement.prototype.hideMarkerIfInSelectionOrFold = function(marker, view) {
      var markerRange, range, selection, selections, _i, _len, _results;
      selections = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = selections.length; _i < _len; _i++) {
        selection = selections[_i];
        range = selection.getScreenRange();
        markerRange = marker.getScreenRange();
        if (!((markerRange != null) && (range != null))) {
          continue;
        }
        if (markerRange.intersectsWith(range)) {
          view.classList.add('hidden');
        }
        if (this.editor.isFoldedAtBufferRow(marker.getBufferRange().start.row)) {
          _results.push(view.classList.add('in-fold'));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    ColorBufferElement.prototype.colorMarkerForMouseEvent = function(event) {
      var bufferPosition, position;
      position = this.screenPositionForMouseEvent(event);
      bufferPosition = this.colorBuffer.editor.bufferPositionForScreenPosition(position);
      return this.colorBuffer.getColorMarkerAtBufferPosition(bufferPosition);
    };

    ColorBufferElement.prototype.screenPositionForMouseEvent = function(event) {
      var pixelPosition;
      pixelPosition = this.pixelPositionForMouseEvent(event);
      if (this.editorElement.screenPositionForPixelPosition != null) {
        return this.editorElement.screenPositionForPixelPosition(pixelPosition);
      } else {
        return this.editor.screenPositionForPixelPosition(pixelPosition);
      }
    };

    ColorBufferElement.prototype.pixelPositionForMouseEvent = function(event) {
      var clientX, clientY, left, rootElement, scrollTarget, top, _ref2;
      clientX = event.clientX, clientY = event.clientY;
      scrollTarget = this.editorElement.getScrollTop != null ? this.editorElement : this.editor;
      rootElement = this.getEditorRoot();
      _ref2 = rootElement.querySelector('.lines').getBoundingClientRect(), top = _ref2.top, left = _ref2.left;
      top = clientY - top + scrollTarget.getScrollTop();
      left = clientX - left + scrollTarget.getScrollLeft();
      return {
        top: top,
        left: left
      };
    };

    return ColorBufferElement;

  })(HTMLElement);

  module.exports = ColorBufferElement = registerOrUpdateElement('pigments-markers', ColorBufferElement.prototype);

  ColorBufferElement.registerViewProvider = function(modelClass) {
    return atom.views.addViewProvider(modelClass, function(model) {
      var element;
      element = new ColorBufferElement;
      element.setModel(model);
      return element;
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLWJ1ZmZlci1lbGVtZW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2SUFBQTtJQUFBOzt5SkFBQTs7QUFBQSxFQUFBLE9BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsZUFBQSxPQUFELEVBQVUsMkJBQUEsbUJBQVYsQ0FBQTs7QUFBQSxFQUNBLFFBQThDLE9BQUEsQ0FBUSxZQUFSLENBQTlDLEVBQUMsZ0NBQUEsdUJBQUQsRUFBMEIseUJBQUEsZ0JBRDFCLENBQUE7O0FBQUEsRUFFQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsd0JBQVIsQ0FGckIsQ0FBQTs7QUFBQSxFQUlBLGVBQUEsR0FBa0IsQ0FKbEIsQ0FBQTs7QUFBQSxFQU1NO0FBQ0oseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsa0JBQTdCLENBQUEsQ0FBQTs7QUFBQSxpQ0FFQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLFVBQUEsS0FBQTtBQUFBLE1BQUEsUUFBd0MsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF4QyxFQUFDLElBQUMsQ0FBQSwyQkFBRixFQUFvQixJQUFDLENBQUEsMEJBQXJCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BRFgsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUZqQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBSGQsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGdCQUFELEdBQW9CLEVBSnBCLENBQUE7QUFBQSxNQUtB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-buffer-element.coffee
