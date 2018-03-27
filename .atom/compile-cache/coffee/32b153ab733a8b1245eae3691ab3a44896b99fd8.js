(function() {
  var ColorBufferElement, ColorMarkerElement, CompositeDisposable, Emitter, EventsDelegation, nextHighlightId, ref, ref1, registerOrUpdateElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom-utils'), registerOrUpdateElement = ref.registerOrUpdateElement, EventsDelegation = ref.EventsDelegation;

  ref1 = [], ColorMarkerElement = ref1[0], Emitter = ref1[1], CompositeDisposable = ref1[2];

  nextHighlightId = 0;

  ColorBufferElement = (function(superClass) {
    extend(ColorBufferElement, superClass);

    function ColorBufferElement() {
      return ColorBufferElement.__super__.constructor.apply(this, arguments);
    }

    EventsDelegation.includeInto(ColorBufferElement);

    ColorBufferElement.prototype.createdCallback = function() {
      var ref2, ref3;
      if (Emitter == null) {
        ref2 = require('atom'), Emitter = ref2.Emitter, CompositeDisposable = ref2.CompositeDisposable;
      }
      ref3 = [0, 0], this.editorScrollLeft = ref3[0], this.editorScrollTop = ref3[1];
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
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
            var ref2;
            if ((ref2 = marker.colorMarker) != null) {
              ref2.invalidateScreenRangeCache();
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
      this.subscriptions.add(atom.config.observe('pigments.maxDecorationsInGutter', (function(_this) {
        return function() {
          return _this.update();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', (function(_this) {
        return function(type) {
          if (ColorMarkerElement == null) {
            ColorMarkerElement = require('./color-marker-element');
          }
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
      var ref2;
      if (this.parentNode != null) {
        return;
      }
      if (this.editorElement == null) {
        return;
      }
      return (ref2 = this.getEditorRoot().querySelector('.lines')) != null ? ref2.appendChild(this) : void 0;
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
      return this.editorElement;
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
      if (ColorMarkerElement == null) {
        ColorMarkerElement = require('./color-marker-element');
      }
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
      var className, i, j, len, len1, m, markers, markersByRows, maxRowLength, ref2, ref3, ref4, ref5, style;
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
      ref2 = this.displayedMarkers;
      for (i = 0, len = ref2.length; i < len; i++) {
        m = ref2[i];
        if (!(indexOf.call(markers, m) < 0)) {
          continue;
        }
        if ((ref3 = this.decorationByMarkerId[m.id]) != null) {
          ref3.destroy();
        }
        this.removeChild(this.styleByMarkerId[m.id]);
        delete this.styleByMarkerId[m.id];
        delete this.decorationByMarkerId[m.id];
      }
      markersByRows = {};
      maxRowLength = 0;
      for (j = 0, len1 = markers.length; j < len1; j++) {
        m = markers[j];
        if (((ref4 = m.color) != null ? ref4.isValid() : void 0) && indexOf.call(this.displayedMarkers, m) < 0) {
          ref5 = this.getHighlighDecorationCSS(m, type), className = ref5.className, style = ref5.style;
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
      var deco, id, ref2;
      ref2 = this.decorationByMarkerId;
      for (id in ref2) {
        deco = ref2[id];
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
                return _this.updateDotDecorationsOffsets(change.start.row, change.newExtent.row);
              }) : void 0;
            } else if ((changes.start != null) && (changes.newExtent != null)) {
              return _this.updateDotDecorationsOffsets(changes.start.row, changes.newExtent.row);
            }
          };
        })(this)));
      }
      return this.updateGutterDecorations(type);
    };

    ColorBufferElement.prototype.destroyGutter = function() {
      var decoration, id, ref2;
      this.gutter.destroy();
      this.gutterSubscription.dispose();
      this.displayedMarkers = [];
      ref2 = this.decorationByMarkerId;
      for (id in ref2) {
        decoration = ref2[id];
        decoration.destroy();
      }
      delete this.decorationByMarkerId;
      return delete this.gutterSubscription;
    };

    ColorBufferElement.prototype.updateGutterDecorations = function(type) {
      var deco, decoWidth, i, j, len, len1, m, markers, markersByRows, maxDecorationsInGutter, maxRowLength, ref2, ref3, ref4, row, rowLength;
      if (type == null) {
        type = this.previousType;
      }
      if (this.editor.isDestroyed()) {
        return;
      }
      markers = this.colorBuffer.getValidColorMarkers();
      ref2 = this.displayedMarkers;
      for (i = 0, len = ref2.length; i < len; i++) {
        m = ref2[i];
        if (!(indexOf.call(markers, m) < 0)) {
          continue;
        }
        if ((ref3 = this.decorationByMarkerId[m.id]) != null) {
          ref3.destroy();
        }
        delete this.decorationByMarkerId[m.id];
      }
      markersByRows = {};
      maxRowLength = 0;
      maxDecorationsInGutter = atom.config.get('pigments.maxDecorationsInGutter');
      for (j = 0, len1 = markers.length; j < len1; j++) {
        m = markers[j];
        if (((ref4 = m.color) != null ? ref4.isValid() : void 0) && indexOf.call(this.displayedMarkers, m) < 0) {
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
        if (markersByRows[row] >= maxDecorationsInGutter) {
          continue;
        }
        rowLength = 0;
        if (type !== 'gutter') {
          rowLength = this.editorElement.pixelPositionForScreenPosition([row, 2e308]).left;
        }
        decoWidth = 14;
        deco.properties.item.style.left = (rowLength + markersByRows[row] * decoWidth) + "px";
        markersByRows[row]++;
        maxRowLength = Math.max(maxRowLength, markersByRows[row]);
      }
      if (type === 'gutter') {
        atom.views.getView(this.gutter).style.minWidth = (maxRowLength * decoWidth) + "px";
      } else {
        atom.views.getView(this.gutter).style.width = "0px";
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.updateDotDecorationsOffsets = function(rowStart, rowEnd) {
      var deco, decoWidth, i, m, markerRow, markersByRows, ref2, ref3, results, row, rowLength;
      markersByRows = {};
      results = [];
      for (row = i = ref2 = rowStart, ref3 = rowEnd; ref2 <= ref3 ? i <= ref3 : i >= ref3; row = ref2 <= ref3 ? ++i : --i) {
        results.push((function() {
          var j, len, ref4, results1;
          ref4 = this.displayedMarkers;
          results1 = [];
          for (j = 0, len = ref4.length; j < len; j++) {
            m = ref4[j];
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
            rowLength = this.editorElement.pixelPositionForScreenPosition([row, 2e308]).left;
            decoWidth = 14;
            deco.properties.item.style.left = (rowLength + markersByRows[row] * decoWidth) + "px";
            results1.push(markersByRows[row]++);
          }
          return results1;
        }).call(this));
      }
      return results;
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
          var dirtyMarkers, i, len, m, ref2;
          dirtyMarkers = [];
          ref2 = _this.dirtyMarkers;
          for (i = 0, len = ref2.length; i < len; i++) {
            m = ref2[i];
            if (indexOf.call(dirtyMarkers, m) < 0) {
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
      var base, base1, i, j, len, len1, m, markers, ref2, ref3, ref4;
      if (type == null) {
        type = this.previousType;
      }
      if (this.editor.isDestroyed()) {
        return;
      }
      markers = this.colorBuffer.findValidColorMarkers({
        intersectsScreenRowRange: (ref2 = typeof (base = this.editorElement).getVisibleRowRange === "function" ? base.getVisibleRowRange() : void 0) != null ? ref2 : typeof (base1 = this.editor).getVisibleRowRange === "function" ? base1.getVisibleRowRange() : void 0
      });
      ref3 = this.displayedMarkers;
      for (i = 0, len = ref3.length; i < len; i++) {
        m = ref3[i];
        if (indexOf.call(markers, m) < 0) {
          this.releaseMarkerView(m);
        }
      }
      for (j = 0, len1 = markers.length; j < len1; j++) {
        m = markers[j];
        if (((ref4 = m.color) != null ? ref4.isValid() : void 0) && indexOf.call(this.displayedMarkers, m) < 0) {
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
        if (ColorMarkerElement == null) {
          ColorMarkerElement = require('./color-marker-element');
        }
        view = new ColorMarkerElement;
        view.setContainer(this);
        view.onDidRelease((function(_this) {
          return function(arg) {
            var marker;
            marker = arg.marker;
            _this.displayedMarkers.splice(_this.displayedMarkers.indexOf(marker), 1);
            return _this.releaseMarkerView(marker);
          };
        })(this));
        this.appendChild(view);
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
      var i, j, len, len1, ref2, ref3, view;
      ref2 = this.usedMarkers;
      for (i = 0, len = ref2.length; i < len; i++) {
        view = ref2[i];
        view.destroy();
      }
      ref3 = this.unusedMarkers;
      for (j = 0, len1 = ref3.length; j < len1; j++) {
        view = ref3[j];
        view.destroy();
      }
      this.usedMarkers = [];
      this.unusedMarkers = [];
      return Array.prototype.forEach.call(this.querySelectorAll('pigments-color-marker'), function(el) {
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
      var decoration, i, j, len, len1, marker, ref2, ref3, results, results1, view;
      if (this.editor.isDestroyed()) {
        return;
      }
      if (this.useNativeDecorations()) {
        ref2 = this.displayedMarkers;
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          marker = ref2[i];
          decoration = this.decorationByMarkerId[marker.id];
          if (decoration != null) {
            results.push(this.hideDecorationIfInSelection(marker, decoration));
          } else {
            results.push(void 0);
          }
        }
        return results;
      } else {
        ref3 = this.displayedMarkers;
        results1 = [];
        for (j = 0, len1 = ref3.length; j < len1; j++) {
          marker = ref3[j];
          view = this.viewsByMarkers.get(marker);
          if (view != null) {
            view.classList.remove('hidden');
            view.classList.remove('in-fold');
            results1.push(this.hideMarkerIfInSelectionOrFold(marker, view));
          } else {
            results1.push(console.warn("A color marker was found in the displayed markers array without an associated view", marker));
          }
        }
        return results1;
      }
    };

    ColorBufferElement.prototype.hideDecorationIfInSelection = function(marker, decoration) {
      var classes, i, len, markerRange, props, range, selection, selections;
      selections = this.editor.getSelections();
      props = decoration.getProperties();
      classes = props["class"].split(/\s+/g);
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
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
      var i, len, markerRange, range, results, selection, selections;
      selections = this.editor.getSelections();
      results = [];
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
        range = selection.getScreenRange();
        markerRange = marker.getScreenRange();
        if (!((markerRange != null) && (range != null))) {
          continue;
        }
        if (markerRange.intersectsWith(range)) {
          view.classList.add('hidden');
        }
        if (this.editor.isFoldedAtBufferRow(marker.getBufferRange().start.row)) {
          results.push(view.classList.add('in-fold'));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    ColorBufferElement.prototype.colorMarkerForMouseEvent = function(event) {
      var bufferPosition, position;
      position = this.screenPositionForMouseEvent(event);
      if (position == null) {
        return;
      }
      bufferPosition = this.colorBuffer.editor.bufferPositionForScreenPosition(position);
      return this.colorBuffer.getColorMarkerAtBufferPosition(bufferPosition);
    };

    ColorBufferElement.prototype.screenPositionForMouseEvent = function(event) {
      var pixelPosition;
      pixelPosition = this.pixelPositionForMouseEvent(event);
      if (pixelPosition == null) {
        return;
      }
      if (this.editorElement.screenPositionForPixelPosition != null) {
        return this.editorElement.screenPositionForPixelPosition(pixelPosition);
      } else {
        return this.editor.screenPositionForPixelPosition(pixelPosition);
      }
    };

    ColorBufferElement.prototype.pixelPositionForMouseEvent = function(event) {
      var clientX, clientY, left, ref2, rootElement, scrollTarget, top;
      clientX = event.clientX, clientY = event.clientY;
      scrollTarget = this.editorElement.getScrollTop != null ? this.editorElement : this.editor;
      rootElement = this.getEditorRoot();
      if (rootElement.querySelector('.lines') == null) {
        return;
      }
      ref2 = rootElement.querySelector('.lines').getBoundingClientRect(), top = ref2.top, left = ref2.left;
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

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLWJ1ZmZlci1lbGVtZW50LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMklBQUE7SUFBQTs7OztFQUFBLE1BQThDLE9BQUEsQ0FBUSxZQUFSLENBQTlDLEVBQUMscURBQUQsRUFBMEI7O0VBRTFCLE9BQXFELEVBQXJELEVBQUMsNEJBQUQsRUFBcUIsaUJBQXJCLEVBQThCOztFQUU5QixlQUFBLEdBQWtCOztFQUVaOzs7Ozs7O0lBQ0osZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsa0JBQTdCOztpQ0FFQSxlQUFBLEdBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsSUFBTyxlQUFQO1FBQ0UsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxzQkFBRCxFQUFVLCtDQURaOztNQUdBLE9BQXdDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBeEMsRUFBQyxJQUFDLENBQUEsMEJBQUYsRUFBb0IsSUFBQyxDQUFBO01BQ3JCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGdCQUFELEdBQW9CO01BQ3BCLElBQUMsQ0FBQSxXQUFELEdBQWU7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQjthQUNqQixJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFJO0lBVlA7O2lDQVlqQixnQkFBQSxHQUFrQixTQUFBO01BQ2hCLElBQUMsQ0FBQSxRQUFELEdBQVk7YUFDWixJQUFDLENBQUEsTUFBRCxDQUFBO0lBRmdCOztpQ0FJbEIsZ0JBQUEsR0FBa0IsU0FBQTthQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZO0lBREk7O2lDQUdsQixXQUFBLEdBQWEsU0FBQyxRQUFEO2FBQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFU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QUE7ZUFHRSxJQUFDLENBQUEsTUFBTSxDQUFDLDhCQUFSLENBQXVDLGFBQXZDLEVBSEY7O0lBTDJCOztpQ0FVN0IsMEJBQUEsR0FBNEIsU0FBQyxLQUFEO0FBQzFCLFVBQUE7TUFBQyx1QkFBRCxFQUFVO01BRVYsWUFBQSxHQUFrQix1Q0FBSCxHQUNiLElBQUMsQ0FBQSxhQURZLEdBR2IsSUFBQyxDQUFBO01BRUgsV0FBQSxHQUFjLElBQUMsQ0FBQSxhQUFELENBQUE7TUFFZCxJQUFjLDJDQUFkO0FBQUEsZUFBQTs7TUFFQSxPQUFjLFdBQVcsQ0FBQyxhQUFaLENBQTBCLFFBQTFCLENBQW1DLENBQUMscUJBQXBDLENBQUEsQ0FBZCxFQUFDLGNBQUQsRUFBTTtNQUNOLEdBQUEsR0FBTSxPQUFBLEdBQVUsR0FBVixHQUFnQixZQUFZLENBQUMsWUFBYixDQUFBO01BQ3RCLElBQUEsR0FBTyxPQUFBLEdBQVUsSUFBVixHQUFpQixZQUFZLENBQUMsYUFBYixDQUFBO2FBQ3hCO1FBQUMsS0FBQSxHQUFEO1FBQU0sTUFBQSxJQUFOOztJQWYwQjs7OztLQTdqQkc7O0VBOGtCakMsTUFBTSxDQUFDLE9BQVAsR0FDQSxrQkFBQSxHQUNBLHVCQUFBLENBQXdCLGtCQUF4QixFQUE0QyxrQkFBa0IsQ0FBQyxTQUEvRDtBQXRsQkEiLCJzb3VyY2VzQ29udGVudCI6WyJ7cmVnaXN0ZXJPclVwZGF0ZUVsZW1lbnQsIEV2ZW50c0RlbGVnYXRpb259ID0gcmVxdWlyZSAnYXRvbS11dGlscydcblxuW0NvbG9yTWFya2VyRWxlbWVudCwgRW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZV0gPSBbXVxuXG5uZXh0SGlnaGxpZ2h0SWQgPSAwXG5cbmNsYXNzIENvbG9yQnVmZmVyRWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50XG4gIEV2ZW50c0RlbGVnYXRpb24uaW5jbHVkZUludG8odGhpcylcblxuICBjcmVhdGVkQ2FsbGJhY2s6IC0+XG4gICAgdW5sZXNzIEVtaXR0ZXI/XG4gICAgICB7RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG4gICAgW0BlZGl0b3JTY3JvbGxMZWZ0LCBAZWRpdG9yU2Nyb2xsVG9wXSA9IFswLCAwXVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBbXVxuICAgIEB1c2VkTWFya2VycyA9IFtdXG4gICAgQHVudXNlZE1hcmtlcnMgPSBbXVxuICAgIEB2aWV3c0J5TWFya2VycyA9IG5ldyBXZWFrTWFwXG5cbiAgYXR0YWNoZWRDYWxsYmFjazogLT5cbiAgICBAYXR0YWNoZWQgPSB0cnVlXG4gICAgQHVwZGF0ZSgpXG5cbiAgZGV0YWNoZWRDYWxsYmFjazogLT5cbiAgICBAYXR0YWNoZWQgPSBmYWxzZVxuXG4gIG9uRGlkVXBkYXRlOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC11cGRhdGUnLCBjYWxsYmFja1xuXG4gIGdldE1vZGVsOiAtPiBAY29sb3JCdWZmZXJcblxuICBzZXRNb2RlbDogKEBjb2xvckJ1ZmZlcikgLT5cbiAgICB7QGVkaXRvcn0gPSBAY29sb3JCdWZmZXJcbiAgICByZXR1cm4gaWYgQGVkaXRvci5pc0Rlc3Ryb3llZCgpXG4gICAgQGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoQGVkaXRvcilcblxuICAgIEBjb2xvckJ1ZmZlci5pbml0aWFsaXplKCkudGhlbiA9PiBAdXBkYXRlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAY29sb3JCdWZmZXIub25EaWRVcGRhdGVDb2xvck1hcmtlcnMgPT4gQHVwZGF0ZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBjb2xvckJ1ZmZlci5vbkRpZERlc3Ryb3kgPT4gQGRlc3Ryb3koKVxuXG4gICAgc2Nyb2xsTGVmdExpc3RlbmVyID0gKEBlZGl0b3JTY3JvbGxMZWZ0KSA9PiBAdXBkYXRlU2Nyb2xsKClcbiAgICBzY3JvbGxUb3BMaXN0ZW5lciA9IChAZWRpdG9yU2Nyb2xsVG9wKSA9PlxuICAgICAgcmV0dXJuIGlmIEB1c2VOYXRpdmVEZWNvcmF0aW9ucygpXG4gICAgICBAdXBkYXRlU2Nyb2xsKClcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiBAdXBkYXRlTWFya2VycygpXG5cbiAgICBpZiBAZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbExlZnQ/XG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KHNjcm9sbExlZnRMaXN0ZW5lcilcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbFRvcChzY3JvbGxUb3BMaXN0ZW5lcilcbiAgICBlbHNlXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZVNjcm9sbExlZnQoc2Nyb2xsTGVmdExpc3RlbmVyKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRDaGFuZ2VTY3JvbGxUb3Aoc2Nyb2xsVG9wTGlzdGVuZXIpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZSA9PlxuICAgICAgQHVzZWRNYXJrZXJzLmZvckVhY2ggKG1hcmtlcikgLT5cbiAgICAgICAgbWFya2VyLmNvbG9yTWFya2VyPy5pbnZhbGlkYXRlU2NyZWVuUmFuZ2VDYWNoZSgpXG4gICAgICAgIG1hcmtlci5jaGVja1NjcmVlblJhbmdlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkQWRkQ3Vyc29yID0+XG4gICAgICBAcmVxdWVzdFNlbGVjdGlvblVwZGF0ZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRSZW1vdmVDdXJzb3IgPT5cbiAgICAgIEByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uID0+XG4gICAgICBAcmVxdWVzdFNlbGVjdGlvblVwZGF0ZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRBZGRTZWxlY3Rpb24gPT5cbiAgICAgIEByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZFJlbW92ZVNlbGVjdGlvbiA9PlxuICAgICAgQHJlcXVlc3RTZWxlY3Rpb25VcGRhdGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlU2VsZWN0aW9uUmFuZ2UgPT5cbiAgICAgIEByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlKClcblxuICAgIGlmIEBlZGl0b3Iub25EaWRUb2tlbml6ZT9cbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkVG9rZW5pemUgPT4gQGVkaXRvckNvbmZpZ0NoYW5nZWQoKVxuICAgIGVsc2VcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLmRpc3BsYXlCdWZmZXIub25EaWRUb2tlbml6ZSA9PlxuICAgICAgICBAZWRpdG9yQ29uZmlnQ2hhbmdlZCgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnZWRpdG9yLmZvbnRTaXplJywgPT5cbiAgICAgIEBlZGl0b3JDb25maWdDaGFuZ2VkKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdlZGl0b3IubGluZUhlaWdodCcsID0+XG4gICAgICBAZWRpdG9yQ29uZmlnQ2hhbmdlZCgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncGlnbWVudHMubWF4RGVjb3JhdGlvbnNJbkd1dHRlcicsID0+XG4gICAgICBAdXBkYXRlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdwaWdtZW50cy5tYXJrZXJUeXBlJywgKHR5cGUpID0+XG4gICAgICBDb2xvck1hcmtlckVsZW1lbnQgPz0gcmVxdWlyZSAnLi9jb2xvci1tYXJrZXItZWxlbWVudCdcblxuICAgICAgaWYgQ29sb3JNYXJrZXJFbGVtZW50OjpyZW5kZXJlclR5cGUgaXNudCB0eXBlXG4gICAgICAgIENvbG9yTWFya2VyRWxlbWVudC5zZXRNYXJrZXJUeXBlKHR5cGUpXG5cbiAgICAgIGlmIEBpc05hdGl2ZURlY29yYXRpb25UeXBlKHR5cGUpXG4gICAgICAgIEBpbml0aWFsaXplTmF0aXZlRGVjb3JhdGlvbnModHlwZSlcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgdHlwZSBpcyAnYmFja2dyb3VuZCdcbiAgICAgICAgICBAY2xhc3NMaXN0LmFkZCgnYWJvdmUtZWRpdG9yLWNvbnRlbnQnKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGNsYXNzTGlzdC5yZW1vdmUoJ2Fib3ZlLWVkaXRvci1jb250ZW50JylcblxuICAgICAgICBAZGVzdHJveU5hdGl2ZURlY29yYXRpb25zKClcbiAgICAgICAgQHVwZGF0ZU1hcmtlcnModHlwZSlcblxuICAgICAgQHByZXZpb3VzVHlwZSA9IHR5cGVcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnN0eWxlcy5vbkRpZEFkZFN0eWxlRWxlbWVudCA9PlxuICAgICAgQGVkaXRvckNvbmZpZ0NoYW5nZWQoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3JFbGVtZW50Lm9uRGlkQXR0YWNoID0+IEBhdHRhY2goKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yRWxlbWVudC5vbkRpZERldGFjaCA9PiBAZGV0YWNoKClcblxuICBhdHRhY2g6IC0+XG4gICAgcmV0dXJuIGlmIEBwYXJlbnROb2RlP1xuICAgIHJldHVybiB1bmxlc3MgQGVkaXRvckVsZW1lbnQ/XG4gICAgQGdldEVkaXRvclJvb3QoKS5xdWVyeVNlbGVjdG9yKCcubGluZXMnKT8uYXBwZW5kQ2hpbGQodGhpcylcblxuICBkZXRhY2g6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcGFyZW50Tm9kZT9cblxuICAgIEBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAZGV0YWNoKClcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICAgIGlmIEBpc05hdGl2ZURlY29yYXRpb25UeXBlKClcbiAgICAgIEBkZXN0cm95TmF0aXZlRGVjb3JhdGlvbnMoKVxuICAgIGVsc2VcbiAgICAgIEByZWxlYXNlQWxsTWFya2VyVmlld3MoKVxuXG4gICAgQGNvbG9yQnVmZmVyID0gbnVsbFxuXG4gIHVwZGF0ZTogLT5cbiAgICBpZiBAdXNlTmF0aXZlRGVjb3JhdGlvbnMoKVxuICAgICAgaWYgQGlzR3V0dGVyVHlwZSgpXG4gICAgICAgIEB1cGRhdGVHdXR0ZXJEZWNvcmF0aW9ucygpXG4gICAgICBlbHNlXG4gICAgICAgIEB1cGRhdGVIaWdobGlnaHREZWNvcmF0aW9ucyhAcHJldmlvdXNUeXBlKVxuICAgIGVsc2VcbiAgICAgIEB1cGRhdGVNYXJrZXJzKClcblxuICB1cGRhdGVTY3JvbGw6IC0+XG4gICAgaWYgQGVkaXRvckVsZW1lbnQuaGFzVGlsZWRSZW5kZXJpbmcgYW5kIG5vdCBAdXNlTmF0aXZlRGVjb3JhdGlvbnMoKVxuICAgICAgQHN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IFwidHJhbnNsYXRlM2QoI3stQGVkaXRvclNjcm9sbExlZnR9cHgsICN7LUBlZGl0b3JTY3JvbGxUb3B9cHgsIDApXCJcblxuICBnZXRFZGl0b3JSb290OiAtPiBAZWRpdG9yRWxlbWVudFxuXG4gIGVkaXRvckNvbmZpZ0NoYW5nZWQ6IC0+XG4gICAgcmV0dXJuIGlmIG5vdCBAcGFyZW50Tm9kZT8gb3IgQHVzZU5hdGl2ZURlY29yYXRpb25zKClcbiAgICBAdXNlZE1hcmtlcnMuZm9yRWFjaCAobWFya2VyKSA9PlxuICAgICAgaWYgbWFya2VyLmNvbG9yTWFya2VyP1xuICAgICAgICBtYXJrZXIucmVuZGVyKClcbiAgICAgIGVsc2VcbiAgICAgICAgY29uc29sZS53YXJuIFwiQSBtYXJrZXIgdmlldyB3YXMgZm91bmQgaW4gdGhlIHVzZWQgaW5zdGFuY2UgcG9vbCB3aGlsZSBoYXZpbmcgYSBudWxsIG1vZGVsXCIsIG1hcmtlclxuICAgICAgICBAcmVsZWFzZU1hcmtlckVsZW1lbnQobWFya2VyKVxuXG4gICAgQHVwZGF0ZU1hcmtlcnMoKVxuXG4gIGlzR3V0dGVyVHlwZTogKHR5cGU9QHByZXZpb3VzVHlwZSkgLT5cbiAgICB0eXBlIGluIFsnZ3V0dGVyJywgJ25hdGl2ZS1kb3QnLCAnbmF0aXZlLXNxdWFyZS1kb3QnXVxuXG4gIGlzRG90VHlwZTogICh0eXBlPUBwcmV2aW91c1R5cGUpIC0+XG4gICAgdHlwZSBpbiBbJ25hdGl2ZS1kb3QnLCAnbmF0aXZlLXNxdWFyZS1kb3QnXVxuXG4gIHVzZU5hdGl2ZURlY29yYXRpb25zOiAtPlxuICAgIEBpc05hdGl2ZURlY29yYXRpb25UeXBlKEBwcmV2aW91c1R5cGUpXG5cbiAgaXNOYXRpdmVEZWNvcmF0aW9uVHlwZTogKHR5cGUpIC0+XG4gICAgQ29sb3JNYXJrZXJFbGVtZW50ID89IHJlcXVpcmUgJy4vY29sb3ItbWFya2VyLWVsZW1lbnQnXG5cbiAgICBDb2xvck1hcmtlckVsZW1lbnQuaXNOYXRpdmVEZWNvcmF0aW9uVHlwZSh0eXBlKVxuXG4gIGluaXRpYWxpemVOYXRpdmVEZWNvcmF0aW9uczogKHR5cGUpIC0+XG4gICAgICBAcmVsZWFzZUFsbE1hcmtlclZpZXdzKClcbiAgICAgIEBkZXN0cm95TmF0aXZlRGVjb3JhdGlvbnMoKVxuXG4gICAgICBpZiBAaXNHdXR0ZXJUeXBlKHR5cGUpXG4gICAgICAgIEBpbml0aWFsaXplR3V0dGVyKHR5cGUpXG4gICAgICBlbHNlXG4gICAgICAgIEB1cGRhdGVIaWdobGlnaHREZWNvcmF0aW9ucyh0eXBlKVxuXG4gIGRlc3Ryb3lOYXRpdmVEZWNvcmF0aW9uczogLT5cbiAgICBpZiBAaXNHdXR0ZXJUeXBlKClcbiAgICAgIEBkZXN0cm95R3V0dGVyKClcbiAgICBlbHNlXG4gICAgICBAZGVzdHJveUhpZ2hsaWdodERlY29yYXRpb25zKClcblxuICAjIyAgICMjICAgICAjIyAjIyAgIyMjIyMjICAgIyMgICAgICMjICMjICAgICAgICMjICAjIyMjIyMgICAjIyAgICAgIyMgIyMjIyMjIyNcbiAgIyMgICAjIyAgICAgIyMgIyMgIyMgICAgIyMgICMjICAgICAjIyAjIyAgICAgICAjIyAjIyAgICAjIyAgIyMgICAgICMjICAgICMjXG4gICMjICAgIyMgICAgICMjICMjICMjICAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgIyMgICAgICAgICMjICAgICAjIyAgICAjI1xuICAjIyAgICMjIyMjIyMjIyAjIyAjIyAgICMjIyMgIyMjIyMjIyMjICMjICAgICAgICMjICMjICAgIyMjIyAjIyMjIyMjIyMgICAgIyNcbiAgIyMgICAjIyAgICAgIyMgIyMgIyMgICAgIyMgICMjICAgICAjIyAjIyAgICAgICAjIyAjIyAgICAjIyAgIyMgICAgICMjICAgICMjXG4gICMjICAgIyMgICAgICMjICMjICMjICAgICMjICAjIyAgICAgIyMgIyMgICAgICAgIyMgIyMgICAgIyMgICMjICAgICAjIyAgICAjI1xuICAjIyAgICMjICAgICAjIyAjIyAgIyMjIyMjICAgIyMgICAgICMjICMjIyMjIyMjICMjICAjIyMjIyMgICAjIyAgICAgIyMgICAgIyNcblxuICB1cGRhdGVIaWdobGlnaHREZWNvcmF0aW9uczogKHR5cGUpIC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0b3IuaXNEZXN0cm95ZWQoKVxuXG4gICAgQHN0eWxlQnlNYXJrZXJJZCA/PSB7fVxuICAgIEBkZWNvcmF0aW9uQnlNYXJrZXJJZCA/PSB7fVxuXG4gICAgbWFya2VycyA9IEBjb2xvckJ1ZmZlci5nZXRWYWxpZENvbG9yTWFya2VycygpXG5cbiAgICBmb3IgbSBpbiBAZGlzcGxheWVkTWFya2VycyB3aGVuIG0gbm90IGluIG1hcmtlcnNcbiAgICAgIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFttLmlkXT8uZGVzdHJveSgpXG4gICAgICBAcmVtb3ZlQ2hpbGQoQHN0eWxlQnlNYXJrZXJJZFttLmlkXSlcbiAgICAgIGRlbGV0ZSBAc3R5bGVCeU1hcmtlcklkW20uaWRdXG4gICAgICBkZWxldGUgQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdXG5cbiAgICBtYXJrZXJzQnlSb3dzID0ge31cbiAgICBtYXhSb3dMZW5ndGggPSAwXG5cbiAgICBmb3IgbSBpbiBtYXJrZXJzXG4gICAgICBpZiBtLmNvbG9yPy5pc1ZhbGlkKCkgYW5kIG0gbm90IGluIEBkaXNwbGF5ZWRNYXJrZXJzXG4gICAgICAgIHtjbGFzc05hbWUsIHN0eWxlfSA9IEBnZXRIaWdobGlnaERlY29yYXRpb25DU1MobSwgdHlwZSlcbiAgICAgICAgQGFwcGVuZENoaWxkKHN0eWxlKVxuICAgICAgICBAc3R5bGVCeU1hcmtlcklkW20uaWRdID0gc3R5bGVcbiAgICAgICAgQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdID0gQGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtLm1hcmtlciwge1xuICAgICAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICAgICAgY2xhc3M6IFwicGlnbWVudHMtI3t0eXBlfSAje2NsYXNzTmFtZX1cIlxuICAgICAgICAgIGluY2x1ZGVNYXJrZXJUZXh0OiB0eXBlIGlzICdoaWdobGlnaHQnXG4gICAgICAgIH0pXG5cbiAgICBAZGlzcGxheWVkTWFya2VycyA9IG1hcmtlcnNcbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtdXBkYXRlJ1xuXG4gIGRlc3Ryb3lIaWdobGlnaHREZWNvcmF0aW9uczogLT5cbiAgICBmb3IgaWQsIGRlY28gb2YgQGRlY29yYXRpb25CeU1hcmtlcklkXG4gICAgICBAcmVtb3ZlQ2hpbGQoQHN0eWxlQnlNYXJrZXJJZFtpZF0pIGlmIEBzdHlsZUJ5TWFya2VySWRbaWRdP1xuICAgICAgZGVjby5kZXN0cm95KClcblxuICAgIGRlbGV0ZSBAZGVjb3JhdGlvbkJ5TWFya2VySWRcbiAgICBkZWxldGUgQHN0eWxlQnlNYXJrZXJJZFxuICAgIEBkaXNwbGF5ZWRNYXJrZXJzID0gW11cblxuICBnZXRIaWdobGlnaERlY29yYXRpb25DU1M6IChtYXJrZXIsIHR5cGUpIC0+XG4gICAgY2xhc3NOYW1lID0gXCJwaWdtZW50cy1oaWdobGlnaHQtI3tuZXh0SGlnaGxpZ2h0SWQrK31cIlxuICAgIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgIGwgPSBtYXJrZXIuY29sb3IubHVtYVxuXG4gICAgaWYgdHlwZSBpcyAnbmF0aXZlLWJhY2tncm91bmQnXG4gICAgICBzdHlsZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgIC4je2NsYXNzTmFtZX0gLnJlZ2lvbiB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICN7bWFya2VyLmNvbG9yLnRvQ1NTKCl9O1xuICAgICAgICBjb2xvcjogI3tpZiBsID4gMC40MyB0aGVuICdibGFjaycgZWxzZSAnd2hpdGUnfTtcbiAgICAgIH1cbiAgICAgIFwiXCJcIlxuICAgIGVsc2UgaWYgdHlwZSBpcyAnbmF0aXZlLXVuZGVybGluZSdcbiAgICAgIHN0eWxlLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgLiN7Y2xhc3NOYW1lfSAucmVnaW9uIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI3ttYXJrZXIuY29sb3IudG9DU1MoKX07XG4gICAgICB9XG4gICAgICBcIlwiXCJcbiAgICBlbHNlIGlmIHR5cGUgaXMgJ25hdGl2ZS1vdXRsaW5lJ1xuICAgICAgc3R5bGUuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAuI3tjbGFzc05hbWV9IC5yZWdpb24ge1xuICAgICAgICBib3JkZXItY29sb3I6ICN7bWFya2VyLmNvbG9yLnRvQ1NTKCl9O1xuICAgICAgfVxuICAgICAgXCJcIlwiXG5cbiAgICB7Y2xhc3NOYW1lLCBzdHlsZX1cblxuICAjIyAgICAgIyMjIyMjICAgIyMgICAgICMjICMjIyMjIyMjICMjIyMjIyMjICMjIyMjIyMjICMjIyMjIyMjXG4gICMjICAgICMjICAgICMjICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICAgIyMgICAgICMjXG4gICMjICAgICMjICAgICAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICAgIyMgICAgICMjXG4gICMjICAgICMjICAgIyMjIyAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMjIyMjICAgIyMjIyMjIyNcbiAgIyMgICAgIyMgICAgIyMgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgICAjIyAgICMjXG4gICMjICAgICMjICAgICMjICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyNcbiAgIyMgICAgICMjIyMjIyAgICAjIyMjIyMjICAgICAjIyAgICAgICAjIyAgICAjIyMjIyMjIyAjIyAgICAgIyNcblxuICBpbml0aWFsaXplR3V0dGVyOiAodHlwZSkgLT5cbiAgICBvcHRpb25zID0gbmFtZTogXCJwaWdtZW50cy0je3R5cGV9XCJcbiAgICBvcHRpb25zLnByaW9yaXR5ID0gMTAwMCBpZiB0eXBlIGlzbnQgJ2d1dHRlcidcblxuICAgIEBndXR0ZXIgPSBAZWRpdG9yLmFkZEd1dHRlcihvcHRpb25zKVxuICAgIEBkaXNwbGF5ZWRNYXJrZXJzID0gW11cbiAgICBAZGVjb3JhdGlvbkJ5TWFya2VySWQgPz0ge31cbiAgICBndXR0ZXJDb250YWluZXIgPSBAZ2V0RWRpdG9yUm9vdCgpLnF1ZXJ5U2VsZWN0b3IoJy5ndXR0ZXItY29udGFpbmVyJylcbiAgICBAZ3V0dGVyU3Vic2NyaXB0aW9uID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIEBndXR0ZXJTdWJzY3JpcHRpb24uYWRkIEBzdWJzY3JpYmVUbyBndXR0ZXJDb250YWluZXIsXG4gICAgICBtb3VzZWRvd246IChlKSA9PlxuICAgICAgICB0YXJnZXREZWNvcmF0aW9uID0gZS5wYXRoWzBdXG5cbiAgICAgICAgdW5sZXNzIHRhcmdldERlY29yYXRpb24ubWF0Y2hlcygnc3BhbicpXG4gICAgICAgICAgdGFyZ2V0RGVjb3JhdGlvbiA9IHRhcmdldERlY29yYXRpb24ucXVlcnlTZWxlY3Rvcignc3BhbicpXG5cbiAgICAgICAgcmV0dXJuIHVubGVzcyB0YXJnZXREZWNvcmF0aW9uP1xuXG4gICAgICAgIG1hcmtlcklkID0gdGFyZ2V0RGVjb3JhdGlvbi5kYXRhc2V0Lm1hcmtlcklkXG4gICAgICAgIGNvbG9yTWFya2VyID0gQGRpc3BsYXllZE1hcmtlcnMuZmlsdGVyKChtKSAtPiBtLmlkIGlzIE51bWJlcihtYXJrZXJJZCkpWzBdXG5cbiAgICAgICAgcmV0dXJuIHVubGVzcyBjb2xvck1hcmtlcj8gYW5kIEBjb2xvckJ1ZmZlcj9cblxuICAgICAgICBAY29sb3JCdWZmZXIuc2VsZWN0Q29sb3JNYXJrZXJBbmRPcGVuUGlja2VyKGNvbG9yTWFya2VyKVxuXG4gICAgaWYgQGlzRG90VHlwZSh0eXBlKVxuICAgICAgQGd1dHRlclN1YnNjcmlwdGlvbi5hZGQgQGVkaXRvci5vbkRpZENoYW5nZSAoY2hhbmdlcykgPT5cbiAgICAgICAgaWYgQXJyYXkuaXNBcnJheSBjaGFuZ2VzXG4gICAgICAgICAgY2hhbmdlcz8uZm9yRWFjaCAoY2hhbmdlKSA9PlxuICAgICAgICAgICAgQHVwZGF0ZURvdERlY29yYXRpb25zT2Zmc2V0cyhjaGFuZ2Uuc3RhcnQucm93LCBjaGFuZ2UubmV3RXh0ZW50LnJvdylcblxuICAgICAgICBlbHNlIGlmIGNoYW5nZXMuc3RhcnQ/IGFuZCBjaGFuZ2VzLm5ld0V4dGVudD9cbiAgICAgICAgICBAdXBkYXRlRG90RGVjb3JhdGlvbnNPZmZzZXRzKGNoYW5nZXMuc3RhcnQucm93LCBjaGFuZ2VzLm5ld0V4dGVudC5yb3cpXG5cbiAgICBAdXBkYXRlR3V0dGVyRGVjb3JhdGlvbnModHlwZSlcblxuICBkZXN0cm95R3V0dGVyOiAtPlxuICAgIEBndXR0ZXIuZGVzdHJveSgpXG4gICAgQGd1dHRlclN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICBAZGlzcGxheWVkTWFya2VycyA9IFtdXG4gICAgZGVjb3JhdGlvbi5kZXN0cm95KCkgZm9yIGlkLCBkZWNvcmF0aW9uIG9mIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFxuICAgIGRlbGV0ZSBAZGVjb3JhdGlvbkJ5TWFya2VySWRcbiAgICBkZWxldGUgQGd1dHRlclN1YnNjcmlwdGlvblxuXG4gIHVwZGF0ZUd1dHRlckRlY29yYXRpb25zOiAodHlwZT1AcHJldmlvdXNUeXBlKSAtPlxuICAgIHJldHVybiBpZiBAZWRpdG9yLmlzRGVzdHJveWVkKClcblxuICAgIG1hcmtlcnMgPSBAY29sb3JCdWZmZXIuZ2V0VmFsaWRDb2xvck1hcmtlcnMoKVxuXG4gICAgZm9yIG0gaW4gQGRpc3BsYXllZE1hcmtlcnMgd2hlbiBtIG5vdCBpbiBtYXJrZXJzXG4gICAgICBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF0/LmRlc3Ryb3koKVxuICAgICAgZGVsZXRlIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFttLmlkXVxuXG4gICAgbWFya2Vyc0J5Um93cyA9IHt9XG4gICAgbWF4Um93TGVuZ3RoID0gMFxuICAgIG1heERlY29yYXRpb25zSW5HdXR0ZXIgPSBhdG9tLmNvbmZpZy5nZXQoJ3BpZ21lbnRzLm1heERlY29yYXRpb25zSW5HdXR0ZXInKVxuXG4gICAgZm9yIG0gaW4gbWFya2Vyc1xuICAgICAgaWYgbS5jb2xvcj8uaXNWYWxpZCgpIGFuZCBtIG5vdCBpbiBAZGlzcGxheWVkTWFya2Vyc1xuICAgICAgICBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF0gPSBAZ3V0dGVyLmRlY29yYXRlTWFya2VyKG0ubWFya2VyLCB7XG4gICAgICAgICAgdHlwZTogJ2d1dHRlcidcbiAgICAgICAgICBjbGFzczogJ3BpZ21lbnRzLWd1dHRlci1tYXJrZXInXG4gICAgICAgICAgaXRlbTogQGdldEd1dHRlckRlY29yYXRpb25JdGVtKG0pXG4gICAgICAgIH0pXG5cbiAgICAgIGRlY28gPSBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF1cbiAgICAgIHJvdyA9IG0ubWFya2VyLmdldFN0YXJ0U2NyZWVuUG9zaXRpb24oKS5yb3dcbiAgICAgIG1hcmtlcnNCeVJvd3Nbcm93XSA/PSAwXG5cbiAgICAgIGNvbnRpbnVlIGlmIG1hcmtlcnNCeVJvd3Nbcm93XSA+PSBtYXhEZWNvcmF0aW9uc0luR3V0dGVyXG5cbiAgICAgIHJvd0xlbmd0aCA9IDBcblxuICAgICAgaWYgdHlwZSBpc250ICdndXR0ZXInXG4gICAgICAgIHJvd0xlbmd0aCA9IEBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihbcm93LCBJbmZpbml0eV0pLmxlZnRcblxuICAgICAgZGVjb1dpZHRoID0gMTRcblxuICAgICAgZGVjby5wcm9wZXJ0aWVzLml0ZW0uc3R5bGUubGVmdCA9IFwiI3tyb3dMZW5ndGggKyBtYXJrZXJzQnlSb3dzW3Jvd10gKiBkZWNvV2lkdGh9cHhcIlxuXG4gICAgICBtYXJrZXJzQnlSb3dzW3Jvd10rK1xuICAgICAgbWF4Um93TGVuZ3RoID0gTWF0aC5tYXgobWF4Um93TGVuZ3RoLCBtYXJrZXJzQnlSb3dzW3Jvd10pXG5cbiAgICBpZiB0eXBlIGlzICdndXR0ZXInXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoQGd1dHRlcikuc3R5bGUubWluV2lkdGggPSBcIiN7bWF4Um93TGVuZ3RoICogZGVjb1dpZHRofXB4XCJcbiAgICBlbHNlXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoQGd1dHRlcikuc3R5bGUud2lkdGggPSBcIjBweFwiXG5cbiAgICBAZGlzcGxheWVkTWFya2VycyA9IG1hcmtlcnNcbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtdXBkYXRlJ1xuXG4gIHVwZGF0ZURvdERlY29yYXRpb25zT2Zmc2V0czogKHJvd1N0YXJ0LCByb3dFbmQpIC0+XG4gICAgbWFya2Vyc0J5Um93cyA9IHt9XG5cbiAgICBmb3Igcm93IGluIFtyb3dTdGFydC4ucm93RW5kXVxuICAgICAgZm9yIG0gaW4gQGRpc3BsYXllZE1hcmtlcnNcbiAgICAgICAgZGVjbyA9IEBkZWNvcmF0aW9uQnlNYXJrZXJJZFttLmlkXVxuICAgICAgICBjb250aW51ZSB1bmxlc3MgbS5tYXJrZXI/XG4gICAgICAgIG1hcmtlclJvdyA9IG0ubWFya2VyLmdldFN0YXJ0U2NyZWVuUG9zaXRpb24oKS5yb3dcbiAgICAgICAgY29udGludWUgdW5sZXNzIHJvdyBpcyBtYXJrZXJSb3dcblxuICAgICAgICBtYXJrZXJzQnlSb3dzW3Jvd10gPz0gMFxuXG4gICAgICAgIHJvd0xlbmd0aCA9IEBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihbcm93LCBJbmZpbml0eV0pLmxlZnRcblxuICAgICAgICBkZWNvV2lkdGggPSAxNFxuXG4gICAgICAgIGRlY28ucHJvcGVydGllcy5pdGVtLnN0eWxlLmxlZnQgPSBcIiN7cm93TGVuZ3RoICsgbWFya2Vyc0J5Um93c1tyb3ddICogZGVjb1dpZHRofXB4XCJcbiAgICAgICAgbWFya2Vyc0J5Um93c1tyb3ddKytcblxuICBnZXRHdXR0ZXJEZWNvcmF0aW9uSXRlbTogKG1hcmtlcikgLT5cbiAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRpdi5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICA8c3BhbiBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjogI3ttYXJrZXIuY29sb3IudG9DU1MoKX07JyBkYXRhLW1hcmtlci1pZD0nI3ttYXJrZXIuaWR9Jz48L3NwYW4+XG4gICAgXCJcIlwiXG4gICAgZGl2XG5cbiAgIyMgICAgIyMgICAgICMjICAgICMjIyAgICAjIyMjIyMjIyAgIyMgICAgIyMgIyMjIyMjIyMgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgIyMjICAgIyMjICAgIyMgIyMgICAjIyAgICAgIyMgIyMgICAjIyAgIyMgICAgICAgIyMgICAgICMjICMjICAgICMjXG4gICMjICAgICMjIyMgIyMjIyAgIyMgICAjIyAgIyMgICAgICMjICMjICAjIyAgICMjICAgICAgICMjICAgICAjIyAjI1xuICAjIyAgICAjIyAjIyMgIyMgIyMgICAgICMjICMjIyMjIyMjICAjIyMjIyAgICAjIyMjIyMgICAjIyMjIyMjIyAgICMjIyMjI1xuICAjIyAgICAjIyAgICAgIyMgIyMjIyMjIyMjICMjICAgIyMgICAjIyAgIyMgICAjIyAgICAgICAjIyAgICMjICAgICAgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAjIyAgIyMgICAjIyAgIyMgICAgICAgIyMgICAgIyMgICMjICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICMjICMjIyMjIyMjICMjICAgICAjIyAgIyMjIyMjXG5cbiAgcmVxdWVzdE1hcmtlclVwZGF0ZTogKG1hcmtlcnMpIC0+XG4gICAgaWYgQGZyYW1lUmVxdWVzdGVkXG4gICAgICBAZGlydHlNYXJrZXJzID0gQGRpcnR5TWFya2Vycy5jb25jYXQobWFya2VycylcbiAgICAgIHJldHVyblxuICAgIGVsc2VcbiAgICAgIEBkaXJ0eU1hcmtlcnMgPSBtYXJrZXJzLnNsaWNlKClcbiAgICAgIEBmcmFtZVJlcXVlc3RlZCA9IHRydWVcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PlxuICAgICAgZGlydHlNYXJrZXJzID0gW11cbiAgICAgIGRpcnR5TWFya2Vycy5wdXNoKG0pIGZvciBtIGluIEBkaXJ0eU1hcmtlcnMgd2hlbiBtIG5vdCBpbiBkaXJ0eU1hcmtlcnNcblxuICAgICAgZGVsZXRlIEBmcmFtZVJlcXVlc3RlZFxuICAgICAgZGVsZXRlIEBkaXJ0eU1hcmtlcnNcblxuICAgICAgcmV0dXJuIHVubGVzcyBAY29sb3JCdWZmZXI/XG5cbiAgICAgIGRpcnR5TWFya2Vycy5mb3JFYWNoIChtYXJrZXIpIC0+IG1hcmtlci5yZW5kZXIoKVxuXG4gIHVwZGF0ZU1hcmtlcnM6ICh0eXBlPUBwcmV2aW91c1R5cGUpIC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0b3IuaXNEZXN0cm95ZWQoKVxuXG4gICAgbWFya2VycyA9IEBjb2xvckJ1ZmZlci5maW5kVmFsaWRDb2xvck1hcmtlcnMoe1xuICAgICAgaW50ZXJzZWN0c1NjcmVlblJvd1JhbmdlOiBAZWRpdG9yRWxlbWVudC5nZXRWaXNpYmxlUm93UmFuZ2U/KCkgPyBAZWRpdG9yLmdldFZpc2libGVSb3dSYW5nZT8oKVxuICAgIH0pXG5cbiAgICBmb3IgbSBpbiBAZGlzcGxheWVkTWFya2VycyB3aGVuIG0gbm90IGluIG1hcmtlcnNcbiAgICAgIEByZWxlYXNlTWFya2VyVmlldyhtKVxuXG4gICAgZm9yIG0gaW4gbWFya2VycyB3aGVuIG0uY29sb3I/LmlzVmFsaWQoKSBhbmQgbSBub3QgaW4gQGRpc3BsYXllZE1hcmtlcnNcbiAgICAgIEByZXF1ZXN0TWFya2VyVmlldyhtKVxuXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBtYXJrZXJzXG5cbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtdXBkYXRlJ1xuXG4gIHJlcXVlc3RNYXJrZXJWaWV3OiAobWFya2VyKSAtPlxuICAgIGlmIEB1bnVzZWRNYXJrZXJzLmxlbmd0aFxuICAgICAgdmlldyA9IEB1bnVzZWRNYXJrZXJzLnNoaWZ0KClcbiAgICBlbHNlXG4gICAgICBDb2xvck1hcmtlckVsZW1lbnQgPz0gcmVxdWlyZSAnLi9jb2xvci1tYXJrZXItZWxlbWVudCdcblxuICAgICAgdmlldyA9IG5ldyBDb2xvck1hcmtlckVsZW1lbnRcbiAgICAgIHZpZXcuc2V0Q29udGFpbmVyKHRoaXMpXG4gICAgICB2aWV3Lm9uRGlkUmVsZWFzZSAoe21hcmtlcn0pID0+XG4gICAgICAgIEBkaXNwbGF5ZWRNYXJrZXJzLnNwbGljZShAZGlzcGxheWVkTWFya2Vycy5pbmRleE9mKG1hcmtlciksIDEpXG4gICAgICAgIEByZWxlYXNlTWFya2VyVmlldyhtYXJrZXIpXG4gICAgICBAYXBwZW5kQ2hpbGQgdmlld1xuXG4gICAgdmlldy5zZXRNb2RlbChtYXJrZXIpXG5cbiAgICBAaGlkZU1hcmtlcklmSW5TZWxlY3Rpb25PckZvbGQobWFya2VyLCB2aWV3KVxuICAgIEB1c2VkTWFya2Vycy5wdXNoKHZpZXcpXG4gICAgQHZpZXdzQnlNYXJrZXJzLnNldChtYXJrZXIsIHZpZXcpXG4gICAgdmlld1xuXG4gIHJlbGVhc2VNYXJrZXJWaWV3OiAobWFya2VyT3JWaWV3KSAtPlxuICAgIG1hcmtlciA9IG1hcmtlck9yVmlld1xuICAgIHZpZXcgPSBAdmlld3NCeU1hcmtlcnMuZ2V0KG1hcmtlck9yVmlldylcblxuICAgIGlmIHZpZXc/XG4gICAgICBAdmlld3NCeU1hcmtlcnMuZGVsZXRlKG1hcmtlcikgaWYgbWFya2VyP1xuICAgICAgQHJlbGVhc2VNYXJrZXJFbGVtZW50KHZpZXcpXG5cbiAgcmVsZWFzZU1hcmtlckVsZW1lbnQ6ICh2aWV3KSAtPlxuICAgIEB1c2VkTWFya2Vycy5zcGxpY2UoQHVzZWRNYXJrZXJzLmluZGV4T2YodmlldyksIDEpXG4gICAgdmlldy5yZWxlYXNlKGZhbHNlKSB1bmxlc3Mgdmlldy5pc1JlbGVhc2VkKClcbiAgICBAdW51c2VkTWFya2Vycy5wdXNoKHZpZXcpXG5cbiAgcmVsZWFzZUFsbE1hcmtlclZpZXdzOiAtPlxuICAgIHZpZXcuZGVzdHJveSgpIGZvciB2aWV3IGluIEB1c2VkTWFya2Vyc1xuICAgIHZpZXcuZGVzdHJveSgpIGZvciB2aWV3IGluIEB1bnVzZWRNYXJrZXJzXG5cbiAgICBAdXNlZE1hcmtlcnMgPSBbXVxuICAgIEB1bnVzZWRNYXJrZXJzID0gW11cblxuICAgIEFycmF5Ojpmb3JFYWNoLmNhbGwgQHF1ZXJ5U2VsZWN0b3JBbGwoJ3BpZ21lbnRzLWNvbG9yLW1hcmtlcicpLCAoZWwpIC0+IGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpXG5cbiAgIyMgICAgICMjIyMjIyAgIyMjIyMjIyMgIyMgICAgICAgIyMjIyMjIyMgICMjIyMjIyAgIyMjIyMjIyNcbiAgIyMgICAgIyMgICAgIyMgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgIyMgICAgIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgICAgIyNcbiAgIyMgICAgICMjIyMjIyAgIyMjIyMjICAgIyMgICAgICAgIyMjIyMjICAgIyMgICAgICAgICAgIyNcbiAgIyMgICAgICAgICAgIyMgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgICAgIyNcbiAgIyMgICAgIyMgICAgIyMgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgIyMgICAgIyNcbiAgIyMgICAgICMjIyMjIyAgIyMjIyMjIyMgIyMjIyMjIyMgIyMjIyMjIyMgICMjIyMjIyAgICAgIyNcblxuICByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlOiAtPlxuICAgIHJldHVybiBpZiBAdXBkYXRlUmVxdWVzdGVkXG5cbiAgICBAdXBkYXRlUmVxdWVzdGVkID0gdHJ1ZVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PlxuICAgICAgQHVwZGF0ZVJlcXVlc3RlZCA9IGZhbHNlXG4gICAgICByZXR1cm4gaWYgQGVkaXRvci5nZXRCdWZmZXIoKS5pc0Rlc3Ryb3llZCgpXG4gICAgICBAdXBkYXRlU2VsZWN0aW9ucygpXG5cbiAgdXBkYXRlU2VsZWN0aW9uczogLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvci5pc0Rlc3Ryb3llZCgpXG4gICAgaWYgQHVzZU5hdGl2ZURlY29yYXRpb25zKClcbiAgICAgIGZvciBtYXJrZXIgaW4gQGRpc3BsYXllZE1hcmtlcnNcbiAgICAgICAgZGVjb3JhdGlvbiA9IEBkZWNvcmF0aW9uQnlNYXJrZXJJZFttYXJrZXIuaWRdXG5cbiAgICAgICAgQGhpZGVEZWNvcmF0aW9uSWZJblNlbGVjdGlvbihtYXJrZXIsIGRlY29yYXRpb24pIGlmIGRlY29yYXRpb24/XG4gICAgZWxzZVxuICAgICAgZm9yIG1hcmtlciBpbiBAZGlzcGxheWVkTWFya2Vyc1xuICAgICAgICB2aWV3ID0gQHZpZXdzQnlNYXJrZXJzLmdldChtYXJrZXIpXG4gICAgICAgIGlmIHZpZXc/XG4gICAgICAgICAgdmlldy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxuICAgICAgICAgIHZpZXcuY2xhc3NMaXN0LnJlbW92ZSgnaW4tZm9sZCcpXG4gICAgICAgICAgQGhpZGVNYXJrZXJJZkluU2VsZWN0aW9uT3JGb2xkKG1hcmtlciwgdmlldylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvbnNvbGUud2FybiBcIkEgY29sb3IgbWFya2VyIHdhcyBmb3VuZCBpbiB0aGUgZGlzcGxheWVkIG1hcmtlcnMgYXJyYXkgd2l0aG91dCBhbiBhc3NvY2lhdGVkIHZpZXdcIiwgbWFya2VyXG5cbiAgaGlkZURlY29yYXRpb25JZkluU2VsZWN0aW9uOiAobWFya2VyLCBkZWNvcmF0aW9uKSAtPlxuICAgIHNlbGVjdGlvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuXG4gICAgcHJvcHMgPSBkZWNvcmF0aW9uLmdldFByb3BlcnRpZXMoKVxuICAgIGNsYXNzZXMgPSBwcm9wcy5jbGFzcy5zcGxpdCgvXFxzKy9nKVxuXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBzZWxlY3Rpb25zXG4gICAgICByYW5nZSA9IHNlbGVjdGlvbi5nZXRTY3JlZW5SYW5nZSgpXG4gICAgICBtYXJrZXJSYW5nZSA9IG1hcmtlci5nZXRTY3JlZW5SYW5nZSgpXG5cbiAgICAgIGNvbnRpbnVlIHVubGVzcyBtYXJrZXJSYW5nZT8gYW5kIHJhbmdlP1xuICAgICAgaWYgbWFya2VyUmFuZ2UuaW50ZXJzZWN0c1dpdGgocmFuZ2UpXG4gICAgICAgIGNsYXNzZXNbMF0gKz0gJy1pbi1zZWxlY3Rpb24nIHVubGVzcyBjbGFzc2VzWzBdLm1hdGNoKC8taW4tc2VsZWN0aW9uJC8pP1xuICAgICAgICBwcm9wcy5jbGFzcyA9IGNsYXNzZXMuam9pbignICcpXG4gICAgICAgIGRlY29yYXRpb24uc2V0UHJvcGVydGllcyhwcm9wcylcbiAgICAgICAgcmV0dXJuXG5cbiAgICBjbGFzc2VzID0gY2xhc3Nlcy5tYXAgKGNscykgLT4gY2xzLnJlcGxhY2UoJy1pbi1zZWxlY3Rpb24nLCAnJylcbiAgICBwcm9wcy5jbGFzcyA9IGNsYXNzZXMuam9pbignICcpXG4gICAgZGVjb3JhdGlvbi5zZXRQcm9wZXJ0aWVzKHByb3BzKVxuXG4gIGhpZGVNYXJrZXJJZkluU2VsZWN0aW9uT3JGb2xkOiAobWFya2VyLCB2aWV3KSAtPlxuICAgIHNlbGVjdGlvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBzZWxlY3Rpb25zXG4gICAgICByYW5nZSA9IHNlbGVjdGlvbi5nZXRTY3JlZW5SYW5nZSgpXG4gICAgICBtYXJrZXJSYW5nZSA9IG1hcmtlci5nZXRTY3JlZW5SYW5nZSgpXG5cbiAgICAgIGNvbnRpbnVlIHVubGVzcyBtYXJrZXJSYW5nZT8gYW5kIHJhbmdlP1xuXG4gICAgICB2aWV3LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpIGlmIG1hcmtlclJhbmdlLmludGVyc2VjdHNXaXRoKHJhbmdlKVxuICAgICAgdmlldy5jbGFzc0xpc3QuYWRkKCdpbi1mb2xkJykgaWYgIEBlZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydC5yb3cpXG5cbiAgIyMgICAgICMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICMjIyMjIyMjICMjIyMjIyMjICMjICAgICAjIyAjIyMjIyMjI1xuICAjIyAgICAjIyAgICAjIyAjIyAgICAgIyMgIyMjICAgIyMgICAgIyMgICAgIyMgICAgICAgICMjICAgIyMgICAgICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAjIyAjIyMjICAjIyAgICAjIyAgICAjIyAgICAgICAgICMjICMjICAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjICMjICMjICAgICMjICAgICMjIyMjIyAgICAgICMjIyAgICAgICAjI1xuICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICMjIyMgICAgIyMgICAgIyMgICAgICAgICAjIyAjIyAgICAgICMjXG4gICMjICAgICMjICAgICMjICMjICAgICAjIyAjIyAgICMjIyAgICAjIyAgICAjIyAgICAgICAgIyMgICAjIyAgICAgIyNcbiAgIyMgICAgICMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICAgICMjICAgICMjIyMjIyMjICMjICAgICAjIyAgICAjI1xuICAjI1xuICAjIyAgICAjIyAgICAgIyMgIyMjIyMjIyMgIyMgICAgIyMgIyMgICAgICMjXG4gICMjICAgICMjIyAgICMjIyAjIyAgICAgICAjIyMgICAjIyAjIyAgICAgIyNcbiAgIyMgICAgIyMjIyAjIyMjICMjICAgICAgICMjIyMgICMjICMjICAgICAjI1xuICAjIyAgICAjIyAjIyMgIyMgIyMjIyMjICAgIyMgIyMgIyMgIyMgICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgIyMjIyAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAgICMjICAgIyMjICMjICAgICAjI1xuICAjIyAgICAjIyAgICAgIyMgIyMjIyMjIyMgIyMgICAgIyMgICMjIyMjIyNcblxuICBjb2xvck1hcmtlckZvck1vdXNlRXZlbnQ6IChldmVudCkgLT5cbiAgICBwb3NpdGlvbiA9IEBzY3JlZW5Qb3NpdGlvbkZvck1vdXNlRXZlbnQoZXZlbnQpXG5cbiAgICByZXR1cm4gdW5sZXNzIHBvc2l0aW9uP1xuXG4gICAgYnVmZmVyUG9zaXRpb24gPSBAY29sb3JCdWZmZXIuZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24ocG9zaXRpb24pXG5cbiAgICBAY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJBdEJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuXG4gIHNjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudDogKGV2ZW50KSAtPlxuICAgIHBpeGVsUG9zaXRpb24gPSBAcGl4ZWxQb3NpdGlvbkZvck1vdXNlRXZlbnQoZXZlbnQpXG5cbiAgICByZXR1cm4gdW5sZXNzIHBpeGVsUG9zaXRpb24/XG5cbiAgICBpZiBAZWRpdG9yRWxlbWVudC5zY3JlZW5Qb3NpdGlvbkZvclBpeGVsUG9zaXRpb24/XG4gICAgICBAZWRpdG9yRWxlbWVudC5zY3JlZW5Qb3NpdGlvbkZvclBpeGVsUG9zaXRpb24ocGl4ZWxQb3NpdGlvbilcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yUGl4ZWxQb3NpdGlvbihwaXhlbFBvc2l0aW9uKVxuXG4gIHBpeGVsUG9zaXRpb25Gb3JNb3VzZUV2ZW50OiAoZXZlbnQpIC0+XG4gICAge2NsaWVudFgsIGNsaWVudFl9ID0gZXZlbnRcblxuICAgIHNjcm9sbFRhcmdldCA9IGlmIEBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcD9cbiAgICAgIEBlZGl0b3JFbGVtZW50XG4gICAgZWxzZVxuICAgICAgQGVkaXRvclxuXG4gICAgcm9vdEVsZW1lbnQgPSBAZ2V0RWRpdG9yUm9vdCgpXG5cbiAgICByZXR1cm4gdW5sZXNzIHJvb3RFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5saW5lcycpP1xuXG4gICAge3RvcCwgbGVmdH0gPSByb290RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcubGluZXMnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIHRvcCA9IGNsaWVudFkgLSB0b3AgKyBzY3JvbGxUYXJnZXQuZ2V0U2Nyb2xsVG9wKClcbiAgICBsZWZ0ID0gY2xpZW50WCAtIGxlZnQgKyBzY3JvbGxUYXJnZXQuZ2V0U2Nyb2xsTGVmdCgpXG4gICAge3RvcCwgbGVmdH1cblxubW9kdWxlLmV4cG9ydHMgPVxuQ29sb3JCdWZmZXJFbGVtZW50ID1cbnJlZ2lzdGVyT3JVcGRhdGVFbGVtZW50ICdwaWdtZW50cy1tYXJrZXJzJywgQ29sb3JCdWZmZXJFbGVtZW50LnByb3RvdHlwZVxuIl19
