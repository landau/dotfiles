(function() {
  var ColorBufferElement, CompositeDisposable, Emitter, EventsDelegation, nextHighlightId, ref, ref1, registerOrUpdateElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom-utils'), registerOrUpdateElement = ref.registerOrUpdateElement, EventsDelegation = ref.EventsDelegation;

  ref1 = [], Emitter = ref1[0], CompositeDisposable = ref1[1];

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
      this.subscriptions.add(atom.config.observe('pigments.maxDecorationsInGutter', (function(_this) {
        return function() {
          return _this.update();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', (function(_this) {
        return function(type) {
          _this.initializeNativeDecorations(type);
          return _this.previousType = type;
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
      this.destroyNativeDecorations();
      return this.colorBuffer = null;
    };

    ColorBufferElement.prototype.update = function() {
      if (this.isGutterType()) {
        return this.updateGutterDecorations();
      } else {
        return this.updateHighlightDecorations(this.previousType);
      }
    };

    ColorBufferElement.prototype.getEditorRoot = function() {
      return this.editorElement;
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

    ColorBufferElement.prototype.initializeNativeDecorations = function(type) {
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
          if (type === 'native-background') {
            this.decorationByMarkerId[m.id] = this.editor.decorateMarker(m.marker, {
              type: 'text',
              "class": "pigments-" + type + " " + className
            });
          } else {
            this.decorationByMarkerId[m.id] = this.editor.decorateMarker(m.marker, {
              type: 'highlight',
              "class": "pigments-" + type + " " + className
            });
          }
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
        style.innerHTML = "." + className + " {\n  background-color: " + (marker.color.toCSS()) + ";\n  background-image:\n    linear-gradient(to bottom, " + (marker.color.toCSS()) + " 0%, " + (marker.color.toCSS()) + " 100%),\n    url(atom://pigments/resources/transparent-background.png);\n  color: " + (l > 0.43 ? 'black' : 'white') + ";\n}";
      } else if (type === 'native-underline') {
        style.innerHTML = "." + className + " .region {\n  background-color: " + (marker.color.toCSS()) + ";\n  background-image:\n    linear-gradient(to bottom, " + (marker.color.toCSS()) + " 0%, " + (marker.color.toCSS()) + " 100%),\n    url(atom://pigments/resources/transparent-background.png);\n}";
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
        this.gutterSubscription.add(this.editorElement.onDidChangeScrollLeft((function(_this) {
          return function() {
            return requestAnimationFrame(function() {
              return _this.updateDotDecorationsOffsets(_this.editorElement.getFirstVisibleScreenRow(), _this.editorElement.getLastVisibleScreenRow());
            });
          };
        })(this)));
        this.gutterSubscription.add(this.editorElement.onDidChangeScrollTop((function(_this) {
          return function() {
            return requestAnimationFrame(function() {
              return _this.updateDotDecorationsOffsets(_this.editorElement.getFirstVisibleScreenRow(), _this.editorElement.getLastVisibleScreenRow());
            });
          };
        })(this)));
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
      try {
        this.gutter.destroy();
      } catch (error) {}
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
      var deco, decoWidth, i, j, len, len1, m, markers, markersByRows, maxDecorationsInGutter, maxRowLength, ref2, ref3, ref4, row, rowLength, scrollLeft;
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
      scrollLeft = this.editorElement.getScrollLeft();
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
          try {
            rowLength = this.editorElement.pixelPositionForScreenPosition([row, 2e308]).left;
          } catch (error) {}
        }
        decoWidth = 14;
        deco.properties.item.style.left = ((rowLength + markersByRows[row] * decoWidth) - scrollLeft) + "px";
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
      var deco, decoWidth, i, m, markerRow, markersByRows, ref2, ref3, results, row, rowLength, scrollLeft;
      markersByRows = {};
      scrollLeft = this.editorElement.getScrollLeft();
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
            deco.properties.item.style.left = ((rowLength + markersByRows[row] * decoWidth) - scrollLeft) + "px";
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
      div.innerHTML = "<span style='background-image: linear-gradient(to bottom, " + (marker.color.toCSS()) + " 0%, " + (marker.color.toCSS()) + " 100%), url(atom://pigments/resources/transparent-background.png);' data-marker-id='" + marker.id + "'></span>";
      return div;
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
      var decoration, i, len, marker, ref2, results;
      if (this.editor.isDestroyed()) {
        return;
      }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLWJ1ZmZlci1lbGVtZW50LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUEsdUhBQUE7SUFBQTs7OztFQUFBLE1BQThDLE9BQUEsQ0FBUSxZQUFSLENBQTlDLEVBQUMscURBQUQsRUFBMEI7O0VBRTFCLE9BQWlDLEVBQWpDLEVBQUMsaUJBQUQsRUFBVTs7RUFFVixlQUFBLEdBQWtCOztFQUVaOzs7Ozs7O0lBQ0osZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsa0JBQTdCOztpQ0FFQSxlQUFBLEdBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsSUFBTyxlQUFQO1FBQ0UsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxzQkFBRCxFQUFVLCtDQURaOztNQUdBLE9BQXdDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBeEMsRUFBQyxJQUFDLENBQUEsMEJBQUYsRUFBb0IsSUFBQyxDQUFBO01BQ3JCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGdCQUFELEdBQW9CO01BQ3BCLElBQUMsQ0FBQSxXQUFELEdBQWU7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQjthQUNqQixJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFJO0lBVlA7O2lDQVlqQixnQkFBQSxHQUFrQixTQUFBO01BQ2hCLElBQUMsQ0FBQSxRQUFELEdBQVk7YUFDWixJQUFDLENBQUEsTUFBRCxDQUFBO0lBRmdCOztpQ0FJbEIsZ0JBQUEsR0FBa0IsU0FBQTthQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZO0lBREk7O2lDQUdsQixXQUFBLEdBQWEsU0FBQyxRQUFEO2FBQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixRQUExQjtJ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QUFDLENBQUEsYUFEWSxHQUdiLElBQUMsQ0FBQTtNQUVILFdBQUEsR0FBYyxJQUFDLENBQUEsYUFBRCxDQUFBO01BRWQsSUFBYywyQ0FBZDtBQUFBLGVBQUE7O01BRUEsT0FBYyxXQUFXLENBQUMsYUFBWixDQUEwQixRQUExQixDQUFtQyxDQUFDLHFCQUFwQyxDQUFBLENBQWQsRUFBQyxjQUFELEVBQU07TUFDTixHQUFBLEdBQU0sT0FBQSxHQUFVLEdBQVYsR0FBZ0IsWUFBWSxDQUFDLFlBQWIsQ0FBQTtNQUN0QixJQUFBLEdBQU8sT0FBQSxHQUFVLElBQVYsR0FBaUIsWUFBWSxDQUFDLGFBQWIsQ0FBQTthQUN4QjtRQUFDLEtBQUEsR0FBRDtRQUFNLE1BQUEsSUFBTjs7SUFmMEI7Ozs7S0F6YUc7O0VBMGJqQyxNQUFNLENBQUMsT0FBUCxHQUNBLGtCQUFBLEdBQ0EsdUJBQUEsQ0FBd0Isa0JBQXhCLEVBQTRDLGtCQUFrQixDQUFDLFNBQS9EO0FBbGNBIiwic291cmNlc0NvbnRlbnQiOlsiXG57cmVnaXN0ZXJPclVwZGF0ZUVsZW1lbnQsIEV2ZW50c0RlbGVnYXRpb259ID0gcmVxdWlyZSAnYXRvbS11dGlscydcblxuW0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGVdID0gW11cblxubmV4dEhpZ2hsaWdodElkID0gMFxuXG5jbGFzcyBDb2xvckJ1ZmZlckVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudFxuICBFdmVudHNEZWxlZ2F0aW9uLmluY2x1ZGVJbnRvKHRoaXMpXG5cbiAgY3JlYXRlZENhbGxiYWNrOiAtPlxuICAgIHVubGVzcyBFbWl0dGVyP1xuICAgICAge0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuICAgIFtAZWRpdG9yU2Nyb2xsTGVmdCwgQGVkaXRvclNjcm9sbFRvcF0gPSBbMCwgMF1cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwbGF5ZWRNYXJrZXJzID0gW11cbiAgICBAdXNlZE1hcmtlcnMgPSBbXVxuICAgIEB1bnVzZWRNYXJrZXJzID0gW11cbiAgICBAdmlld3NCeU1hcmtlcnMgPSBuZXcgV2Vha01hcFxuXG4gIGF0dGFjaGVkQ2FsbGJhY2s6IC0+XG4gICAgQGF0dGFjaGVkID0gdHJ1ZVxuICAgIEB1cGRhdGUoKVxuXG4gIGRldGFjaGVkQ2FsbGJhY2s6IC0+XG4gICAgQGF0dGFjaGVkID0gZmFsc2VcblxuICBvbkRpZFVwZGF0ZTogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtdXBkYXRlJywgY2FsbGJhY2tcblxuICBnZXRNb2RlbDogLT4gQGNvbG9yQnVmZmVyXG5cbiAgc2V0TW9kZWw6IChAY29sb3JCdWZmZXIpIC0+XG4gICAge0BlZGl0b3J9ID0gQGNvbG9yQnVmZmVyXG4gICAgcmV0dXJuIGlmIEBlZGl0b3IuaXNEZXN0cm95ZWQoKVxuICAgIEBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KEBlZGl0b3IpXG5cbiAgICBAY29sb3JCdWZmZXIuaW5pdGlhbGl6ZSgpLnRoZW4gPT4gQHVwZGF0ZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGNvbG9yQnVmZmVyLm9uRGlkVXBkYXRlQ29sb3JNYXJrZXJzID0+IEB1cGRhdGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAY29sb3JCdWZmZXIub25EaWREZXN0cm95ID0+IEBkZXN0cm95KClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlID0+XG4gICAgICBAdXNlZE1hcmtlcnMuZm9yRWFjaCAobWFya2VyKSAtPlxuICAgICAgICBtYXJrZXIuY29sb3JNYXJrZXI/LmludmFsaWRhdGVTY3JlZW5SYW5nZUNhY2hlKClcbiAgICAgICAgbWFya2VyLmNoZWNrU2NyZWVuUmFuZ2UoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRBZGRDdXJzb3IgPT5cbiAgICAgIEByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZFJlbW92ZUN1cnNvciA9PlxuICAgICAgQHJlcXVlc3RTZWxlY3Rpb25VcGRhdGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24gPT5cbiAgICAgIEByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZEFkZFNlbGVjdGlvbiA9PlxuICAgICAgQHJlcXVlc3RTZWxlY3Rpb25VcGRhdGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkUmVtb3ZlU2VsZWN0aW9uID0+XG4gICAgICBAcmVxdWVzdFNlbGVjdGlvblVwZGF0ZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRDaGFuZ2VTZWxlY3Rpb25SYW5nZSA9PlxuICAgICAgQHJlcXVlc3RTZWxlY3Rpb25VcGRhdGUoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3BpZ21lbnRzLm1heERlY29yYXRpb25zSW5HdXR0ZXInLCA9PlxuICAgICAgQHVwZGF0ZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncGlnbWVudHMubWFya2VyVHlwZScsICh0eXBlKSA9PlxuICAgICAgQGluaXRpYWxpemVOYXRpdmVEZWNvcmF0aW9ucyh0eXBlKVxuICAgICAgQHByZXZpb3VzVHlwZSA9IHR5cGVcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yRWxlbWVudC5vbkRpZEF0dGFjaCA9PiBAYXR0YWNoKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvckVsZW1lbnQub25EaWREZXRhY2ggPT4gQGRldGFjaCgpXG5cbiAgYXR0YWNoOiAtPlxuICAgIHJldHVybiBpZiBAcGFyZW50Tm9kZT9cbiAgICByZXR1cm4gdW5sZXNzIEBlZGl0b3JFbGVtZW50P1xuICAgIEBnZXRFZGl0b3JSb290KCkucXVlcnlTZWxlY3RvcignLmxpbmVzJyk/LmFwcGVuZENoaWxkKHRoaXMpXG5cbiAgZGV0YWNoOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHBhcmVudE5vZGU/XG5cbiAgICBAcGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRldGFjaCgpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQGRlc3Ryb3lOYXRpdmVEZWNvcmF0aW9ucygpXG5cbiAgICBAY29sb3JCdWZmZXIgPSBudWxsXG5cbiAgdXBkYXRlOiAtPlxuICAgIGlmIEBpc0d1dHRlclR5cGUoKVxuICAgICAgQHVwZGF0ZUd1dHRlckRlY29yYXRpb25zKClcbiAgICBlbHNlXG4gICAgICBAdXBkYXRlSGlnaGxpZ2h0RGVjb3JhdGlvbnMoQHByZXZpb3VzVHlwZSlcblxuICBnZXRFZGl0b3JSb290OiAtPiBAZWRpdG9yRWxlbWVudFxuXG4gIGlzR3V0dGVyVHlwZTogKHR5cGU9QHByZXZpb3VzVHlwZSkgLT5cbiAgICB0eXBlIGluIFsnZ3V0dGVyJywgJ25hdGl2ZS1kb3QnLCAnbmF0aXZlLXNxdWFyZS1kb3QnXVxuXG4gIGlzRG90VHlwZTogICh0eXBlPUBwcmV2aW91c1R5cGUpIC0+XG4gICAgdHlwZSBpbiBbJ25hdGl2ZS1kb3QnLCAnbmF0aXZlLXNxdWFyZS1kb3QnXVxuXG4gIGluaXRpYWxpemVOYXRpdmVEZWNvcmF0aW9uczogKHR5cGUpIC0+XG4gICAgQGRlc3Ryb3lOYXRpdmVEZWNvcmF0aW9ucygpXG5cbiAgICBpZiBAaXNHdXR0ZXJUeXBlKHR5cGUpXG4gICAgICBAaW5pdGlhbGl6ZUd1dHRlcih0eXBlKVxuICAgIGVsc2VcbiAgICAgIEB1cGRhdGVIaWdobGlnaHREZWNvcmF0aW9ucyh0eXBlKVxuXG4gIGRlc3Ryb3lOYXRpdmVEZWNvcmF0aW9uczogLT5cbiAgICBpZiBAaXNHdXR0ZXJUeXBlKClcbiAgICAgIEBkZXN0cm95R3V0dGVyKClcbiAgICBlbHNlXG4gICAgICBAZGVzdHJveUhpZ2hsaWdodERlY29yYXRpb25zKClcblxuICAjIyAgICMjICAgICAjIyAjIyAgIyMjIyMjICAgIyMgICAgICMjICMjICAgICAgICMjICAjIyMjIyMgICAjIyAgICAgIyMgIyMjIyMjIyNcbiAgIyMgICAjIyAgICAgIyMgIyMgIyMgICAgIyMgICMjICAgICAjIyAjIyAgICAgICAjIyAjIyAgICAjIyAgIyMgICAgICMjICAgICMjXG4gICMjICAgIyMgICAgICMjICMjICMjICAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgIyMgICAgICAgICMjICAgICAjIyAgICAjI1xuICAjIyAgICMjIyMjIyMjIyAjIyAjIyAgICMjIyMgIyMjIyMjIyMjICMjICAgICAgICMjICMjICAgIyMjIyAjIyMjIyMjIyMgICAgIyNcbiAgIyMgICAjIyAgICAgIyMgIyMgIyMgICAgIyMgICMjICAgICAjIyAjIyAgICAgICAjIyAjIyAgICAjIyAgIyMgICAgICMjICAgICMjXG4gICMjICAgIyMgICAgICMjICMjICMjICAgICMjICAjIyAgICAgIyMgIyMgICAgICAgIyMgIyMgICAgIyMgICMjICAgICAjIyAgICAjI1xuICAjIyAgICMjICAgICAjIyAjIyAgIyMjIyMjICAgIyMgICAgICMjICMjIyMjIyMjICMjICAjIyMjIyMgICAjIyAgICAgIyMgICAgIyNcblxuICB1cGRhdGVIaWdobGlnaHREZWNvcmF0aW9uczogKHR5cGUpIC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0b3IuaXNEZXN0cm95ZWQoKVxuXG4gICAgQHN0eWxlQnlNYXJrZXJJZCA/PSB7fVxuICAgIEBkZWNvcmF0aW9uQnlNYXJrZXJJZCA/PSB7fVxuXG4gICAgbWFya2VycyA9IEBjb2xvckJ1ZmZlci5nZXRWYWxpZENvbG9yTWFya2VycygpXG5cbiAgICBmb3IgbSBpbiBAZGlzcGxheWVkTWFya2VycyB3aGVuIG0gbm90IGluIG1hcmtlcnNcbiAgICAgIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFttLmlkXT8uZGVzdHJveSgpXG4gICAgICBAcmVtb3ZlQ2hpbGQoQHN0eWxlQnlNYXJrZXJJZFttLmlkXSlcbiAgICAgIGRlbGV0ZSBAc3R5bGVCeU1hcmtlcklkW20uaWRdXG4gICAgICBkZWxldGUgQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdXG5cbiAgICBtYXJrZXJzQnlSb3dzID0ge31cbiAgICBtYXhSb3dMZW5ndGggPSAwXG5cbiAgICBmb3IgbSBpbiBtYXJrZXJzXG4gICAgICBpZiBtLmNvbG9yPy5pc1ZhbGlkKCkgYW5kIG0gbm90IGluIEBkaXNwbGF5ZWRNYXJrZXJzXG4gICAgICAgIHtjbGFzc05hbWUsIHN0eWxlfSA9IEBnZXRIaWdobGlnaERlY29yYXRpb25DU1MobSwgdHlwZSlcbiAgICAgICAgQGFwcGVuZENoaWxkKHN0eWxlKVxuICAgICAgICBAc3R5bGVCeU1hcmtlcklkW20uaWRdID0gc3R5bGVcbiAgICAgICAgaWYgdHlwZSBpcyAnbmF0aXZlLWJhY2tncm91bmQnXG4gICAgICAgICAgQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdID0gQGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtLm1hcmtlciwge1xuICAgICAgICAgICAgdHlwZTogJ3RleHQnXG4gICAgICAgICAgICBjbGFzczogXCJwaWdtZW50cy0je3R5cGV9ICN7Y2xhc3NOYW1lfVwiXG4gICAgICAgICAgfSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFttLmlkXSA9IEBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobS5tYXJrZXIsIHtcbiAgICAgICAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICAgICAgICBjbGFzczogXCJwaWdtZW50cy0je3R5cGV9ICN7Y2xhc3NOYW1lfVwiXG4gICAgICAgICAgfSlcblxuICAgIEBkaXNwbGF5ZWRNYXJrZXJzID0gbWFya2Vyc1xuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC11cGRhdGUnXG5cbiAgZGVzdHJveUhpZ2hsaWdodERlY29yYXRpb25zOiAtPlxuICAgIGZvciBpZCwgZGVjbyBvZiBAZGVjb3JhdGlvbkJ5TWFya2VySWRcbiAgICAgIEByZW1vdmVDaGlsZChAc3R5bGVCeU1hcmtlcklkW2lkXSkgaWYgQHN0eWxlQnlNYXJrZXJJZFtpZF0/XG4gICAgICBkZWNvLmRlc3Ryb3koKVxuXG4gICAgZGVsZXRlIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFxuICAgIGRlbGV0ZSBAc3R5bGVCeU1hcmtlcklkXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBbXVxuXG4gIGdldEhpZ2hsaWdoRGVjb3JhdGlvbkNTUzogKG1hcmtlciwgdHlwZSkgLT5cbiAgICBjbGFzc05hbWUgPSBcInBpZ21lbnRzLWhpZ2hsaWdodC0je25leHRIaWdobGlnaHRJZCsrfVwiXG4gICAgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgbCA9IG1hcmtlci5jb2xvci5sdW1hXG5cbiAgICBpZiB0eXBlIGlzICduYXRpdmUtYmFja2dyb3VuZCdcbiAgICAgIHN0eWxlLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgLiN7Y2xhc3NOYW1lfSB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICN7bWFya2VyLmNvbG9yLnRvQ1NTKCl9O1xuICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOlxuICAgICAgICAgIGxpbmVhci1ncmFkaWVudCh0byBib3R0b20sICN7bWFya2VyLmNvbG9yLnRvQ1NTKCl9IDAlLCAje21hcmtlci5jb2xvci50b0NTUygpfSAxMDAlKSxcbiAgICAgICAgICB1cmwoYXRvbTovL3BpZ21lbnRzL3Jlc291cmNlcy90cmFuc3BhcmVudC1iYWNrZ3JvdW5kLnBuZyk7XG4gICAgICAgIGNvbG9yOiAje2lmIGwgPiAwLjQzIHRoZW4gJ2JsYWNrJyBlbHNlICd3aGl0ZSd9O1xuICAgICAgfVxuICAgICAgXCJcIlwiXG4gICAgZWxzZSBpZiB0eXBlIGlzICduYXRpdmUtdW5kZXJsaW5lJ1xuICAgICAgc3R5bGUuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAuI3tjbGFzc05hbWV9IC5yZWdpb24ge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAje21hcmtlci5jb2xvci50b0NTUygpfTtcbiAgICAgICAgYmFja2dyb3VuZC1pbWFnZTpcbiAgICAgICAgICBsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tLCAje21hcmtlci5jb2xvci50b0NTUygpfSAwJSwgI3ttYXJrZXIuY29sb3IudG9DU1MoKX0gMTAwJSksXG4gICAgICAgICAgdXJsKGF0b206Ly9waWdtZW50cy9yZXNvdXJjZXMvdHJhbnNwYXJlbnQtYmFja2dyb3VuZC5wbmcpO1xuICAgICAgfVxuICAgICAgXCJcIlwiXG4gICAgZWxzZSBpZiB0eXBlIGlzICduYXRpdmUtb3V0bGluZSdcbiAgICAgIHN0eWxlLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgLiN7Y2xhc3NOYW1lfSAucmVnaW9uIHtcbiAgICAgICAgYm9yZGVyLWNvbG9yOiAje21hcmtlci5jb2xvci50b0NTUygpfTtcbiAgICAgIH1cbiAgICAgIFwiXCJcIlxuXG4gICAge2NsYXNzTmFtZSwgc3R5bGV9XG5cbiAgIyMgICAgICMjIyMjIyAgICMjICAgICAjIyAjIyMjIyMjIyAjIyMjIyMjIyAjIyMjIyMjIyAjIyMjIyMjI1xuICAjIyAgICAjIyAgICAjIyAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAgICMjICAgICAjI1xuICAjIyAgICAjIyAgICAgICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAgICMjICAgICAjI1xuICAjIyAgICAjIyAgICMjIyMgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjIyMjIyAgICMjIyMjIyMjXG4gICMjICAgICMjICAgICMjICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICAgIyMgICAjI1xuICAjIyAgICAjIyAgICAjIyAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAgICMjICAgICMjXG4gICMjICAgICAjIyMjIyMgICAgIyMjIyMjIyAgICAgIyMgICAgICAgIyMgICAgIyMjIyMjIyMgIyMgICAgICMjXG5cbiAgaW5pdGlhbGl6ZUd1dHRlcjogKHR5cGUpIC0+XG4gICAgb3B0aW9ucyA9IG5hbWU6IFwicGlnbWVudHMtI3t0eXBlfVwiXG4gICAgb3B0aW9ucy5wcmlvcml0eSA9IDEwMDAgaWYgdHlwZSBpc250ICdndXR0ZXInXG5cbiAgICBAZ3V0dGVyID0gQGVkaXRvci5hZGRHdXR0ZXIob3B0aW9ucylcbiAgICBAZGlzcGxheWVkTWFya2VycyA9IFtdXG4gICAgQGRlY29yYXRpb25CeU1hcmtlcklkID89IHt9XG4gICAgZ3V0dGVyQ29udGFpbmVyID0gQGdldEVkaXRvclJvb3QoKS5xdWVyeVNlbGVjdG9yKCcuZ3V0dGVyLWNvbnRhaW5lcicpXG4gICAgQGd1dHRlclN1YnNjcmlwdGlvbiA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAZ3V0dGVyU3Vic2NyaXB0aW9uLmFkZCBAc3Vic2NyaWJlVG8gZ3V0dGVyQ29udGFpbmVyLFxuICAgICAgbW91c2Vkb3duOiAoZSkgPT5cbiAgICAgICAgdGFyZ2V0RGVjb3JhdGlvbiA9IGUucGF0aFswXVxuXG4gICAgICAgIHVubGVzcyB0YXJnZXREZWNvcmF0aW9uLm1hdGNoZXMoJ3NwYW4nKVxuICAgICAgICAgIHRhcmdldERlY29yYXRpb24gPSB0YXJnZXREZWNvcmF0aW9uLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKVxuXG4gICAgICAgIHJldHVybiB1bmxlc3MgdGFyZ2V0RGVjb3JhdGlvbj9cblxuICAgICAgICBtYXJrZXJJZCA9IHRhcmdldERlY29yYXRpb24uZGF0YXNldC5tYXJrZXJJZFxuICAgICAgICBjb2xvck1hcmtlciA9IEBkaXNwbGF5ZWRNYXJrZXJzLmZpbHRlcigobSkgLT4gbS5pZCBpcyBOdW1iZXIobWFya2VySWQpKVswXVxuXG4gICAgICAgIHJldHVybiB1bmxlc3MgY29sb3JNYXJrZXI/IGFuZCBAY29sb3JCdWZmZXI/XG5cbiAgICAgICAgQGNvbG9yQnVmZmVyLnNlbGVjdENvbG9yTWFya2VyQW5kT3BlblBpY2tlcihjb2xvck1hcmtlcilcblxuICAgIGlmIEBpc0RvdFR5cGUodHlwZSlcbiAgICAgIEBndXR0ZXJTdWJzY3JpcHRpb24uYWRkIEBlZGl0b3JFbGVtZW50Lm9uRGlkQ2hhbmdlU2Nyb2xsTGVmdCA9PlxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT5cbiAgICAgICAgICBAdXBkYXRlRG90RGVjb3JhdGlvbnNPZmZzZXRzKEBlZGl0b3JFbGVtZW50LmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpLCBAZWRpdG9yRWxlbWVudC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpKVxuXG4gICAgICBAZ3V0dGVyU3Vic2NyaXB0aW9uLmFkZCBAZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbFRvcCA9PlxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT5cbiAgICAgICAgICBAdXBkYXRlRG90RGVjb3JhdGlvbnNPZmZzZXRzKEBlZGl0b3JFbGVtZW50LmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpLCBAZWRpdG9yRWxlbWVudC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpKVxuXG4gICAgICBAZ3V0dGVyU3Vic2NyaXB0aW9uLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlIChjaGFuZ2VzKSA9PlxuICAgICAgICBpZiBBcnJheS5pc0FycmF5IGNoYW5nZXNcbiAgICAgICAgICBjaGFuZ2VzPy5mb3JFYWNoIChjaGFuZ2UpID0+XG4gICAgICAgICAgICBAdXBkYXRlRG90RGVjb3JhdGlvbnNPZmZzZXRzKGNoYW5nZS5zdGFydC5yb3csIGNoYW5nZS5uZXdFeHRlbnQucm93KVxuXG4gICAgICAgIGVsc2UgaWYgY2hhbmdlcy5zdGFydD8gYW5kIGNoYW5nZXMubmV3RXh0ZW50P1xuICAgICAgICAgIEB1cGRhdGVEb3REZWNvcmF0aW9uc09mZnNldHMoY2hhbmdlcy5zdGFydC5yb3csIGNoYW5nZXMubmV3RXh0ZW50LnJvdylcblxuICAgIEB1cGRhdGVHdXR0ZXJEZWNvcmF0aW9ucyh0eXBlKVxuXG4gIGRlc3Ryb3lHdXR0ZXI6IC0+XG4gICAgdHJ5IEBndXR0ZXIuZGVzdHJveSgpXG4gICAgQGd1dHRlclN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICBAZGlzcGxheWVkTWFya2VycyA9IFtdXG4gICAgZGVjb3JhdGlvbi5kZXN0cm95KCkgZm9yIGlkLCBkZWNvcmF0aW9uIG9mIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFxuICAgIGRlbGV0ZSBAZGVjb3JhdGlvbkJ5TWFya2VySWRcbiAgICBkZWxldGUgQGd1dHRlclN1YnNjcmlwdGlvblxuXG4gIHVwZGF0ZUd1dHRlckRlY29yYXRpb25zOiAodHlwZT1AcHJldmlvdXNUeXBlKSAtPlxuICAgIHJldHVybiBpZiBAZWRpdG9yLmlzRGVzdHJveWVkKClcblxuICAgIG1hcmtlcnMgPSBAY29sb3JCdWZmZXIuZ2V0VmFsaWRDb2xvck1hcmtlcnMoKVxuXG4gICAgZm9yIG0gaW4gQGRpc3BsYXllZE1hcmtlcnMgd2hlbiBtIG5vdCBpbiBtYXJrZXJzXG4gICAgICBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF0/LmRlc3Ryb3koKVxuICAgICAgZGVsZXRlIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFttLmlkXVxuXG4gICAgbWFya2Vyc0J5Um93cyA9IHt9XG4gICAgbWF4Um93TGVuZ3RoID0gMFxuICAgIHNjcm9sbExlZnQgPSBAZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcbiAgICBtYXhEZWNvcmF0aW9uc0luR3V0dGVyID0gYXRvbS5jb25maWcuZ2V0KCdwaWdtZW50cy5tYXhEZWNvcmF0aW9uc0luR3V0dGVyJylcblxuICAgIGZvciBtIGluIG1hcmtlcnNcbiAgICAgIGlmIG0uY29sb3I/LmlzVmFsaWQoKSBhbmQgbSBub3QgaW4gQGRpc3BsYXllZE1hcmtlcnNcbiAgICAgICAgQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdID0gQGd1dHRlci5kZWNvcmF0ZU1hcmtlcihtLm1hcmtlciwge1xuICAgICAgICAgIHR5cGU6ICdndXR0ZXInXG4gICAgICAgICAgY2xhc3M6ICdwaWdtZW50cy1ndXR0ZXItbWFya2VyJ1xuICAgICAgICAgIGl0ZW06IEBnZXRHdXR0ZXJEZWNvcmF0aW9uSXRlbShtKVxuICAgICAgICB9KVxuXG4gICAgICBkZWNvID0gQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdXG4gICAgICByb3cgPSBtLm1hcmtlci5nZXRTdGFydFNjcmVlblBvc2l0aW9uKCkucm93XG4gICAgICBtYXJrZXJzQnlSb3dzW3Jvd10gPz0gMFxuXG4gICAgICBjb250aW51ZSBpZiBtYXJrZXJzQnlSb3dzW3Jvd10gPj0gbWF4RGVjb3JhdGlvbnNJbkd1dHRlclxuXG4gICAgICByb3dMZW5ndGggPSAwXG5cbiAgICAgIGlmIHR5cGUgaXNudCAnZ3V0dGVyJ1xuICAgICAgICB0cnlcbiAgICAgICAgICByb3dMZW5ndGggPSBAZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oW3JvdywgSW5maW5pdHldKS5sZWZ0XG5cbiAgICAgIGRlY29XaWR0aCA9IDE0XG5cbiAgICAgIGRlY28ucHJvcGVydGllcy5pdGVtLnN0eWxlLmxlZnQgPSBcIiN7KHJvd0xlbmd0aCArIG1hcmtlcnNCeVJvd3Nbcm93XSAqIGRlY29XaWR0aCkgLSBzY3JvbGxMZWZ0fXB4XCJcblxuICAgICAgbWFya2Vyc0J5Um93c1tyb3ddKytcbiAgICAgIG1heFJvd0xlbmd0aCA9IE1hdGgubWF4KG1heFJvd0xlbmd0aCwgbWFya2Vyc0J5Um93c1tyb3ddKVxuXG4gICAgaWYgdHlwZSBpcyAnZ3V0dGVyJ1xuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KEBndXR0ZXIpLnN0eWxlLm1pbldpZHRoID0gXCIje21heFJvd0xlbmd0aCAqIGRlY29XaWR0aH1weFwiXG4gICAgZWxzZVxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KEBndXR0ZXIpLnN0eWxlLndpZHRoID0gXCIwcHhcIlxuXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBtYXJrZXJzXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXVwZGF0ZSdcblxuICB1cGRhdGVEb3REZWNvcmF0aW9uc09mZnNldHM6IChyb3dTdGFydCwgcm93RW5kKSAtPlxuICAgIG1hcmtlcnNCeVJvd3MgPSB7fVxuICAgIHNjcm9sbExlZnQgPSBAZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcblxuICAgIGZvciByb3cgaW4gW3Jvd1N0YXJ0Li5yb3dFbmRdXG4gICAgICBmb3IgbSBpbiBAZGlzcGxheWVkTWFya2Vyc1xuICAgICAgICBkZWNvID0gQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdXG4gICAgICAgIGNvbnRpbnVlIHVubGVzcyBtLm1hcmtlcj9cbiAgICAgICAgbWFya2VyUm93ID0gbS5tYXJrZXIuZ2V0U3RhcnRTY3JlZW5Qb3NpdGlvbigpLnJvd1xuICAgICAgICBjb250aW51ZSB1bmxlc3Mgcm93IGlzIG1hcmtlclJvd1xuXG4gICAgICAgIG1hcmtlcnNCeVJvd3Nbcm93XSA/PSAwXG5cbiAgICAgICAgcm93TGVuZ3RoID0gQGVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKFtyb3csIEluZmluaXR5XSkubGVmdFxuXG4gICAgICAgIGRlY29XaWR0aCA9IDE0XG5cbiAgICAgICAgZGVjby5wcm9wZXJ0aWVzLml0ZW0uc3R5bGUubGVmdCA9IFwiI3socm93TGVuZ3RoICsgbWFya2Vyc0J5Um93c1tyb3ddICogZGVjb1dpZHRoKSAtIHNjcm9sbExlZnR9cHhcIlxuICAgICAgICBtYXJrZXJzQnlSb3dzW3Jvd10rK1xuXG4gIGdldEd1dHRlckRlY29yYXRpb25JdGVtOiAobWFya2VyKSAtPlxuICAgIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZGl2LmlubmVySFRNTCA9IFwiXCJcIlxuICAgIDxzcGFuIHN0eWxlPSdiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tLCAje21hcmtlci5jb2xvci50b0NTUygpfSAwJSwgI3ttYXJrZXIuY29sb3IudG9DU1MoKX0gMTAwJSksIHVybChhdG9tOi8vcGlnbWVudHMvcmVzb3VyY2VzL3RyYW5zcGFyZW50LWJhY2tncm91bmQucG5nKTsnIGRhdGEtbWFya2VyLWlkPScje21hcmtlci5pZH0nPjwvc3Bhbj5cbiAgICBcIlwiXCJcbiAgICBkaXZcblxuICAjIyAgICAgIyMjIyMjICAjIyMjIyMjIyAjIyAgICAgICAjIyMjIyMjIyAgIyMjIyMjICAjIyMjIyMjI1xuICAjIyAgICAjIyAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAjIyAgICAjI1xuICAjIyAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAgICAjI1xuICAjIyAgICAgIyMjIyMjICAjIyMjIyMgICAjIyAgICAgICAjIyMjIyMgICAjIyAgICAgICAgICAjI1xuICAjIyAgICAgICAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAgICAjI1xuICAjIyAgICAjIyAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAjIyAgICAjI1xuICAjIyAgICAgIyMjIyMjICAjIyMjIyMjIyAjIyMjIyMjIyAjIyMjIyMjIyAgIyMjIyMjICAgICAjI1xuXG4gIHJlcXVlc3RTZWxlY3Rpb25VcGRhdGU6IC0+XG4gICAgcmV0dXJuIGlmIEB1cGRhdGVSZXF1ZXN0ZWRcblxuICAgIEB1cGRhdGVSZXF1ZXN0ZWQgPSB0cnVlXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+XG4gICAgICBAdXBkYXRlUmVxdWVzdGVkID0gZmFsc2VcbiAgICAgIHJldHVybiBpZiBAZWRpdG9yLmdldEJ1ZmZlcigpLmlzRGVzdHJveWVkKClcbiAgICAgIEB1cGRhdGVTZWxlY3Rpb25zKClcblxuICB1cGRhdGVTZWxlY3Rpb25zOiAtPlxuICAgIHJldHVybiBpZiBAZWRpdG9yLmlzRGVzdHJveWVkKClcbiAgICBmb3IgbWFya2VyIGluIEBkaXNwbGF5ZWRNYXJrZXJzXG4gICAgICBkZWNvcmF0aW9uID0gQGRlY29yYXRpb25CeU1hcmtlcklkW21hcmtlci5pZF1cblxuICAgICAgQGhpZGVEZWNvcmF0aW9uSWZJblNlbGVjdGlvbihtYXJrZXIsIGRlY29yYXRpb24pIGlmIGRlY29yYXRpb24/XG5cbiAgaGlkZURlY29yYXRpb25JZkluU2VsZWN0aW9uOiAobWFya2VyLCBkZWNvcmF0aW9uKSAtPlxuICAgIHNlbGVjdGlvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuXG4gICAgcHJvcHMgPSBkZWNvcmF0aW9uLmdldFByb3BlcnRpZXMoKVxuICAgIGNsYXNzZXMgPSBwcm9wcy5jbGFzcy5zcGxpdCgvXFxzKy9nKVxuXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBzZWxlY3Rpb25zXG4gICAgICByYW5nZSA9IHNlbGVjdGlvbi5nZXRTY3JlZW5SYW5nZSgpXG4gICAgICBtYXJrZXJSYW5nZSA9IG1hcmtlci5nZXRTY3JlZW5SYW5nZSgpXG5cbiAgICAgIGNvbnRpbnVlIHVubGVzcyBtYXJrZXJSYW5nZT8gYW5kIHJhbmdlP1xuICAgICAgaWYgbWFya2VyUmFuZ2UuaW50ZXJzZWN0c1dpdGgocmFuZ2UpXG4gICAgICAgIGNsYXNzZXNbMF0gKz0gJy1pbi1zZWxlY3Rpb24nIHVubGVzcyBjbGFzc2VzWzBdLm1hdGNoKC8taW4tc2VsZWN0aW9uJC8pP1xuICAgICAgICBwcm9wcy5jbGFzcyA9IGNsYXNzZXMuam9pbignICcpXG4gICAgICAgIGRlY29yYXRpb24uc2V0UHJvcGVydGllcyhwcm9wcylcbiAgICAgICAgcmV0dXJuXG5cbiAgICBjbGFzc2VzID0gY2xhc3Nlcy5tYXAgKGNscykgLT4gY2xzLnJlcGxhY2UoJy1pbi1zZWxlY3Rpb24nLCAnJylcbiAgICBwcm9wcy5jbGFzcyA9IGNsYXNzZXMuam9pbignICcpXG4gICAgZGVjb3JhdGlvbi5zZXRQcm9wZXJ0aWVzKHByb3BzKVxuXG4gIGhpZGVNYXJrZXJJZkluU2VsZWN0aW9uT3JGb2xkOiAobWFya2VyLCB2aWV3KSAtPlxuICAgIHNlbGVjdGlvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBzZWxlY3Rpb25zXG4gICAgICByYW5nZSA9IHNlbGVjdGlvbi5nZXRTY3JlZW5SYW5nZSgpXG4gICAgICBtYXJrZXJSYW5nZSA9IG1hcmtlci5nZXRTY3JlZW5SYW5nZSgpXG5cbiAgICAgIGNvbnRpbnVlIHVubGVzcyBtYXJrZXJSYW5nZT8gYW5kIHJhbmdlP1xuXG4gICAgICB2aWV3LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpIGlmIG1hcmtlclJhbmdlLmludGVyc2VjdHNXaXRoKHJhbmdlKVxuICAgICAgdmlldy5jbGFzc0xpc3QuYWRkKCdpbi1mb2xkJykgaWYgIEBlZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydC5yb3cpXG5cbiAgIyMgICAgICMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICMjIyMjIyMjICMjIyMjIyMjICMjICAgICAjIyAjIyMjIyMjI1xuICAjIyAgICAjIyAgICAjIyAjIyAgICAgIyMgIyMjICAgIyMgICAgIyMgICAgIyMgICAgICAgICMjICAgIyMgICAgICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAjIyAjIyMjICAjIyAgICAjIyAgICAjIyAgICAgICAgICMjICMjICAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjICMjICMjICAgICMjICAgICMjIyMjIyAgICAgICMjIyAgICAgICAjI1xuICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICMjIyMgICAgIyMgICAgIyMgICAgICAgICAjIyAjIyAgICAgICMjXG4gICMjICAgICMjICAgICMjICMjICAgICAjIyAjIyAgICMjIyAgICAjIyAgICAjIyAgICAgICAgIyMgICAjIyAgICAgIyNcbiAgIyMgICAgICMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICAgICMjICAgICMjIyMjIyMjICMjICAgICAjIyAgICAjI1xuICAjI1xuICAjIyAgICAjIyAgICAgIyMgIyMjIyMjIyMgIyMgICAgIyMgIyMgICAgICMjXG4gICMjICAgICMjIyAgICMjIyAjIyAgICAgICAjIyMgICAjIyAjIyAgICAgIyNcbiAgIyMgICAgIyMjIyAjIyMjICMjICAgICAgICMjIyMgICMjICMjICAgICAjI1xuICAjIyAgICAjIyAjIyMgIyMgIyMjIyMjICAgIyMgIyMgIyMgIyMgICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgIyMjIyAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAgICMjICAgIyMjICMjICAgICAjI1xuICAjIyAgICAjIyAgICAgIyMgIyMjIyMjIyMgIyMgICAgIyMgICMjIyMjIyNcblxuICBjb2xvck1hcmtlckZvck1vdXNlRXZlbnQ6IChldmVudCkgLT5cbiAgICBwb3NpdGlvbiA9IEBzY3JlZW5Qb3NpdGlvbkZvck1vdXNlRXZlbnQoZXZlbnQpXG5cbiAgICByZXR1cm4gdW5sZXNzIHBvc2l0aW9uP1xuXG4gICAgYnVmZmVyUG9zaXRpb24gPSBAY29sb3JCdWZmZXIuZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24ocG9zaXRpb24pXG5cbiAgICBAY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJBdEJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuXG4gIHNjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudDogKGV2ZW50KSAtPlxuICAgIHBpeGVsUG9zaXRpb24gPSBAcGl4ZWxQb3NpdGlvbkZvck1vdXNlRXZlbnQoZXZlbnQpXG5cbiAgICByZXR1cm4gdW5sZXNzIHBpeGVsUG9zaXRpb24/XG5cbiAgICBpZiBAZWRpdG9yRWxlbWVudC5zY3JlZW5Qb3NpdGlvbkZvclBpeGVsUG9zaXRpb24/XG4gICAgICBAZWRpdG9yRWxlbWVudC5zY3JlZW5Qb3NpdGlvbkZvclBpeGVsUG9zaXRpb24ocGl4ZWxQb3NpdGlvbilcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yUGl4ZWxQb3NpdGlvbihwaXhlbFBvc2l0aW9uKVxuXG4gIHBpeGVsUG9zaXRpb25Gb3JNb3VzZUV2ZW50OiAoZXZlbnQpIC0+XG4gICAge2NsaWVudFgsIGNsaWVudFl9ID0gZXZlbnRcblxuICAgIHNjcm9sbFRhcmdldCA9IGlmIEBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcD9cbiAgICAgIEBlZGl0b3JFbGVtZW50XG4gICAgZWxzZVxuICAgICAgQGVkaXRvclxuXG4gICAgcm9vdEVsZW1lbnQgPSBAZ2V0RWRpdG9yUm9vdCgpXG5cbiAgICByZXR1cm4gdW5sZXNzIHJvb3RFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5saW5lcycpP1xuXG4gICAge3RvcCwgbGVmdH0gPSByb290RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcubGluZXMnKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIHRvcCA9IGNsaWVudFkgLSB0b3AgKyBzY3JvbGxUYXJnZXQuZ2V0U2Nyb2xsVG9wKClcbiAgICBsZWZ0ID0gY2xpZW50WCAtIGxlZnQgKyBzY3JvbGxUYXJnZXQuZ2V0U2Nyb2xsTGVmdCgpXG4gICAge3RvcCwgbGVmdH1cblxubW9kdWxlLmV4cG9ydHMgPVxuQ29sb3JCdWZmZXJFbGVtZW50ID1cbnJlZ2lzdGVyT3JVcGRhdGVFbGVtZW50ICdwaWdtZW50cy1tYXJrZXJzJywgQ29sb3JCdWZmZXJFbGVtZW50LnByb3RvdHlwZVxuIl19
