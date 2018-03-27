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
      this.releaseAllMarkerViews();
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
            return changes != null ? changes.forEach(function(change) {
              return _this.updateDotDecorationsOffsets(change.start.row);
            }) : void 0;
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
          if (__indexOf.call(classes, 'in-selection') < 0) {
            classes.push('in-selection');
          }
          props["class"] = classes.join(' ');
          decoration.setProperties(props);
          return;
        }
      }
      classes = classes.filter(function(cls) {
        return cls !== 'in-selection';
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
