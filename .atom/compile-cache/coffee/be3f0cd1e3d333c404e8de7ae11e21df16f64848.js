(function() {
  var ColorMarkerElement, CompositeDisposable, Emitter, EventsDelegation, RENDERERS, SPEC_MODE, registerOrUpdateElement, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;

  _ref1 = require('atom-utils'), registerOrUpdateElement = _ref1.registerOrUpdateElement, EventsDelegation = _ref1.EventsDelegation;

  SPEC_MODE = atom.inSpecMode();

  RENDERERS = {
    'background': require('./renderers/background'),
    'outline': require('./renderers/outline'),
    'underline': require('./renderers/underline'),
    'dot': require('./renderers/dot'),
    'square-dot': require('./renderers/square-dot')
  };

  ColorMarkerElement = (function(_super) {
    __extends(ColorMarkerElement, _super);

    function ColorMarkerElement() {
      return ColorMarkerElement.__super__.constructor.apply(this, arguments);
    }

    EventsDelegation.includeInto(ColorMarkerElement);

    ColorMarkerElement.prototype.renderer = new RENDERERS.background;

    ColorMarkerElement.prototype.createdCallback = function() {
      this.emitter = new Emitter;
      return this.released = true;
    };

    ColorMarkerElement.prototype.attachedCallback = function() {};

    ColorMarkerElement.prototype.detachedCallback = function() {};

    ColorMarkerElement.prototype.onDidRelease = function(callback) {
      return this.emitter.on('did-release', callback);
    };

    ColorMarkerElement.prototype.setContainer = function(bufferElement) {
      this.bufferElement = bufferElement;
    };

    ColorMarkerElement.prototype.getModel = function() {
      return this.colorMarker;
    };

    ColorMarkerElement.prototype.setModel = function(colorMarker) {
      this.colorMarker = colorMarker;
      if (!this.released) {
        return;
      }
      this.released = false;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.colorMarker.marker.onDidDestroy((function(_this) {
        return function() {
          return _this.release();
        };
      })(this)));
      this.subscriptions.add(this.colorMarker.marker.onDidChange((function(_this) {
        return function(data) {
          var isValid;
          isValid = data.isValid;
          if (isValid) {
            return _this.bufferElement.requestMarkerUpdate([_this]);
          } else {
            return _this.release();
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', (function(_this) {
        return function(type) {
          if (type !== 'gutter') {
            return _this.bufferElement.requestMarkerUpdate([_this]);
          }
        };
      })(this)));
      this.subscriptions.add(this.subscribeTo(this, {
        click: (function(_this) {
          return function(e) {
            var colorBuffer;
            colorBuffer = _this.colorMarker.colorBuffer;
            if (colorBuffer == null) {
              return;
            }
            return colorBuffer.selectColorMarkerAndOpenPicker(_this.colorMarker);
          };
        })(this)
      }));
      return this.render();
    };

    ColorMarkerElement.prototype.destroy = function() {
      var _ref2, _ref3;
      if ((_ref2 = this.parentNode) != null) {
        _ref2.removeChild(this);
      }
      if ((_ref3 = this.subscriptions) != null) {
        _ref3.dispose();
      }
      return this.clear();
    };

    ColorMarkerElement.prototype.render = function() {
      var bufferElement, cls, colorMarker, k, region, regions, renderer, style, v, _i, _len, _ref2;
      if (!((this.colorMarker != null) && (this.colorMarker.color != null) && (this.renderer != null))) {
        return;
      }
      colorMarker = this.colorMarker, renderer = this.renderer, bufferElement = this.bufferElement;
      if (colorMarker.marker.displayBuffer.isDestroyed()) {
        return;
      }
      this.innerHTML = '';
      _ref2 = renderer.render(colorMarker), style = _ref2.style, regions = _ref2.regions, cls = _ref2["class"];
      regions = (regions || []).filter(function(r) {
        return r != null;
      });
      if ((regions != null ? regions.some(function(r) {
        return r != null ? r.invalid : void 0;
      }) : void 0) && !SPEC_MODE) {
        return bufferElement.requestMarkerUpdate([this]);
      }
      for (_i = 0, _len = regions.length; _i < _len; _i++) {
        region = regions[_i];
        this.appendChild(region);
      }
      if (cls != null) {
        this.className = cls;
      } else {
        this.className = '';
      }
      if (style != null) {
        for (k in style) {
          v = style[k];
          this.style[k] = v;
        }
      } else {
        this.style.cssText = '';
      }
      return this.lastMarkerScreenRange = colorMarker.getScreenRange();
    };

    ColorMarkerElement.prototype.checkScreenRange = function() {
      if (!((this.colorMarker != null) && (this.lastMarkerScreenRange != null))) {
        return;
      }
      if (!this.lastMarkerScreenRange.isEqual(this.colorMarker.getScreenRange())) {
        return this.render();
      }
    };

    ColorMarkerElement.prototype.isReleased = function() {
      return this.released;
    };

    ColorMarkerElement.prototype.release = function(dispatchEvent) {
      var marker;
      if (dispatchEvent == null) {
        dispatchEvent = true;
      }
      if (this.released) {
        return;
      }
      this.subscriptions.dispose();
      marker = this.colorMarker;
      this.clear();
      if (dispatchEvent) {
        return this.emitter.emit('did-release', {
          marker: marker,
          view: this
        });
      }
    };

    ColorMarkerElement.prototype.clear = function() {
      this.subscriptions = null;
      this.colorMarker = null;
      this.released = true;
      this.innerHTML = '';
      this.className = '';
      return this.style.cssText = '';
    };

    return ColorMarkerElement;

  })(HTMLElement);

  module.exports = ColorMarkerElement = registerOrUpdateElement('pigments-color-marker', ColorMarkerElement.prototype);

  ColorMarkerElement.setMarkerType = function(markerType) {
    if (markerType === 'gutter') {
      return;
    }
    return this.prototype.renderer = new RENDERERS[markerType];
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLW1hcmtlci1lbGVtZW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4SEFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQywyQkFBQSxtQkFBRCxFQUFzQixlQUFBLE9BQXRCLENBQUE7O0FBQUEsRUFDQSxRQUE4QyxPQUFBLENBQVEsWUFBUixDQUE5QyxFQUFDLGdDQUFBLHVCQUFELEVBQTBCLHlCQUFBLGdCQUQxQixDQUFBOztBQUFBLEVBR0EsU0FBQSxHQUFZLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FIWixDQUFBOztBQUFBLEVBSUEsU0FBQSxHQUNFO0FBQUEsSUFBQSxZQUFBLEVBQWMsT0FBQSxDQUFRLHdCQUFSLENBQWQ7QUFBQSxJQUNBLFNBQUEsRUFBVyxPQUFBLENBQVEscUJBQVIsQ0FEWDtBQUFBLElBRUEsV0FBQSxFQUFhLE9BQUEsQ0FBUSx1QkFBUixDQUZiO0FBQUEsSUFHQSxLQUFBLEVBQU8sT0FBQSxDQUFRLGlCQUFSLENBSFA7QUFBQSxJQUlBLFlBQUEsRUFBYyxPQUFBLENBQVEsd0JBQVIsQ0FKZDtHQUxGLENBQUE7O0FBQUEsRUFXTTtBQUNKLHlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGdCQUFnQixDQUFDLFdBQWpCLENBQTZCLGtCQUE3QixDQUFBLENBQUE7O0FBQUEsaUNBRUEsUUFBQSxHQUFVLEdBQUEsQ0FBQSxTQUFhLENBQUMsVUFGeEIsQ0FBQTs7QUFBQSxpQ0FJQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FBWCxDQUFBO2FBQ0EsSUFBQyxDQUFB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-marker-element.coffee
