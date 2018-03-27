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
      if (bufferElement.editor.isDestroyed()) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLW1hcmtlci1lbGVtZW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4SEFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQywyQkFBQSxtQkFBRCxFQUFzQixlQUFBLE9BQXRCLENBQUE7O0FBQUEsRUFDQSxRQUE4QyxPQUFBLENBQVEsWUFBUixDQUE5QyxFQUFDLGdDQUFBLHVCQUFELEVBQTBCLHlCQUFBLGdCQUQxQixDQUFBOztBQUFBLEVBR0EsU0FBQSxHQUFZLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FIWixDQUFBOztBQUFBLEVBSUEsU0FBQSxHQUNFO0FBQUEsSUFBQSxZQUFBLEVBQWMsT0FBQSxDQUFRLHdCQUFSLENBQWQ7QUFBQSxJQUNBLFNBQUEsRUFBVyxPQUFBLENBQVEscUJBQVIsQ0FEWDtBQUFBLElBRUEsV0FBQSxFQUFhLE9BQUEsQ0FBUSx1QkFBUixDQUZiO0FBQUEsSUFHQSxLQUFBLEVBQU8sT0FBQSxDQUFRLGlCQUFSLENBSFA7QUFBQSxJQUlBLFlBQUEsRUFBYyxPQUFBLENBQVEsd0JBQVIsQ0FKZDtHQUxGLENBQUE7O0FBQUEsRUFXTTtBQUNKLHlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGdCQUFnQixDQUFDLFdBQWpCLENBQTZCLGtCQUE3QixDQUFBLENBQUE7O0FBQUEsaUNBRUEsUUFBQSxHQUFVLEdBQUEsQ0FBQSxTQUFhLENBQUMsVUFGeEIsQ0FBQTs7QUFBQSxpQ0FJQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FBWCxDQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxLQUZHO0lBQUEsQ0FKakIsQ0FBQTs7QUFBQSxpQ0FRQSxnQkFBQSxHQUFrQixTQUFBLEdBQUEsQ0FSbEIsQ0FBQTs7QUFBQSxpQ0FVQSxnQkFBQSxHQUFrQixTQUFBLEdBQUEsQ0FWbEIsQ0FBQTs7QUFBQSxpQ0FZQSxZQUFBLEdBQWMsU0FBQyxRQUFELEdBQUE7YUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLFFBQTNCLEVBRFk7SUFBQSxDQVpkLENBQUE7O0FBQUEsaUNBZUEsWUFBQSxHQUFjLFNBQUUsYUFBRixHQUFBO0FBQWtCLE1BQWpCLElBQUMsQ0FBQSxnQkFBQSxhQUFnQixDQUFsQjtJQUFBLENBZmQsQ0FBQTs7QUFBQSxpQ0FpQkEsUUFBQSxHQUFVLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxZQUFKO0lBQUEsQ0FqQlYsQ0FBQTs7QUFBQSxpQ0FtQkEsUUFBQSxHQUFVLFNBQUUsV0FBRixHQUFBO0FBQ1IsTUFEUyxJQUFDLENBQUEsY0FBQSxXQUNWLENBQUE7QUFBQSxNQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsUUFBZjtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBRFosQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUZqQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFNLENBQUMsWUFBcEIsQ0FBaUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQyxDQUFuQixDQUhBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsV0FBVyxDQUFDLE1BQU0sQ0FBQyxXQUFwQixDQUFnQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFDakQsY0FBQSxPQUFBO0FBQUEsVUFBQyxVQUFXLEtBQVgsT0FBRCxDQUFBO0FBQ0EsVUFBQSxJQUFHLE9BQUg7bUJBQWdCLEtBQUMsQ0FBQSxhQUFhLENBQUMsbUJBQWYsQ0FBbUMsQ0FBQyxLQUFELENBQW5DLEVBQWhCO1dBQUEsTUFBQTttQkFBZ0UsS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQUFoRTtXQUZpRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDLENBQW5CLENBSkEsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixxQkFBcEIsRUFBMkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQzVELFVBQUEsSUFBa0QsSUFBQSxLQUFRLFFBQTFEO21CQUFBLEtBQUMsQ0FBQSxhQUFhLENBQUMsbUJBQWYsQ0FBbUMsQ0FBQyxLQUFELENBQW5DLEVBQUE7V0FENEQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxDQUFuQixDQVJBLENBQUE7QUFBQSxNQVdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsV0FBRCxDQUFhLElBQWIsRUFDakI7QUFBQSxRQUFBLEtBQUEsRUFBTyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsQ0FBRCxHQUFBO0FBQ0wsZ0JBQUEsV0FBQTtBQUFBLFlBQUEsV0FBQSxHQUFjLEtBQUMsQ0FBQSxXQUFXLENBQUMsV0FBM0IsQ0FBQTtBQUVBLFlBQUEsSUFBYyxtQkFBZDtBQUFBLG9CQUFBLENBQUE7YUFGQTttQkFJQSxXQUFXLENBQUMsOEJBQVosQ0FBMkMsS0FBQyxDQUFBLFdBQTVDLEVBTEs7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFQO09BRGlCLENBQW5CLENBWEEsQ0FBQTthQW1CQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBcEJRO0lBQUEsQ0FuQlYsQ0FBQTs7QUFBQSxpQ0F5Q0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsWUFBQTs7YUFBVyxDQUFFLFdBQWIsQ0FBeUIsSUFBekI7T0FBQTs7YUFDYyxDQUFFLE9BQWhCLENBQUE7T0FEQTthQUVBLElBQUMsQ0FBQSxLQUFELENBQUEsRUFITztJQUFBLENBekNULENBQUE7O0FBQUEsaUNBOENBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixVQUFBLHdGQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsQ0FBYywwQkFBQSxJQUFrQixnQ0FBbEIsSUFBMEMsdUJBQXhELENBQUE7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BRUMsbUJBQUEsV0FBRCxFQUFjLGdCQUFBLFFBQWQsRUFBd0IscUJBQUEsYUFGeEIsQ0FBQTtBQUlBLE1BQUEsSUFBVSxhQUFhLENBQUMsTUFBTSxDQUFDLFdBQXJCLENBQUEsQ0FBVjtBQUFBLGNBQUEsQ0FBQTtPQUpBO0FBQUEsTUFLQSxJQUFDLENBQUEsU0FBRCxHQUFhLEVBTGIsQ0FBQTtBQUFBLE1BTUEsUUFBK0IsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsV0FBaEIsQ0FBL0IsRUFBQyxjQUFBLEtBQUQsRUFBUSxnQkFBQSxPQUFSLEVBQXdCLFlBQVAsUUFOakIsQ0FBQTtBQUFBLE1BUUEsT0FBQSxHQUFVLENBQUMsT0FBQSxJQUFXLEVBQVosQ0FBZSxDQUFDLE1BQWhCLENBQXVCLFNBQUMsQ0FBRCxHQUFBO2VBQU8sVUFBUDtNQUFBLENBQXZCLENBUlYsQ0FBQTtBQVVBLE1BQUEsdUJBQUcsT0FBTyxDQUFFLElBQVQsQ0FBYyxTQUFDLENBQUQsR0FBQTsyQkFBTyxDQUFDLENBQUUsaUJBQVY7TUFBQSxDQUFkLFdBQUEsSUFBcUMsQ0FBQSxTQUF4QztBQUNFLGVBQU8sYUFBYSxDQUFDLG1CQUFkLENBQWtDLENBQUMsSUFBRCxDQUFsQyxDQUFQLENBREY7T0FWQTtBQWFBLFdBQUEsOENBQUE7NkJBQUE7QUFBQSxRQUFBLElBQUMsQ0FBQSxXQUFELENBQWEsTUFBYixDQUFBLENBQUE7QUFBQSxPQWJBO0FBY0EsTUFBQSxJQUFHLFdBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsR0FBYixDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxFQUFiLENBSEY7T0FkQTtBQW1CQSxNQUFBLElBQUcsYUFBSDtBQUNFLGFBQUEsVUFBQTt1QkFBQTtBQUFBLFVBQUEsSUFBQyxDQUFBLEtBQU0sQ0FBQSxDQUFBLENBQVAsR0FBWSxDQUFaLENBQUE7QUFBQSxTQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLEdBQWlCLEVBQWpCLENBSEY7T0FuQkE7YUF3QkEsSUFBQyxDQUFBLHFCQUFELEdBQXlCLFdBQVcsQ0FBQyxjQUFaLENBQUEsRUF6Qm5CO0lBQUEsQ0E5Q1IsQ0FBQTs7QUFBQSxpQ0F5RUEsZ0JBQUEsR0FBa0IsU0FBQSxHQUFBO0FBQ2hCLE1BQUEsSUFBQSxDQUFBLENBQWMsMEJBQUEsSUFBa0Isb0NBQWhDLENBQUE7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUNBLE1BQUEsSUFBQSxDQUFBLElBQVEsQ0FBQSxxQkFBcUIsQ0FBQyxPQUF2QixDQUErQixJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBQSxDQUEvQixDQUFQO2VBQ0UsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURGO09BRmdCO0lBQUEsQ0F6RWxCLENBQUE7O0FBQUEsaUNBOEVBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsU0FBSjtJQUFBLENBOUVaLENBQUE7O0FBQUEsaUNBZ0ZBLE9BQUEsR0FBUyxTQUFDLGFBQUQsR0FBQTtBQUNQLFVBQUEsTUFBQTs7UUFEUSxnQkFBYztPQUN0QjtBQUFBLE1BQUEsSUFBVSxJQUFDLENBQUEsUUFBWDtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxDQURBLENBQUE7QUFBQSxNQUVBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FGVixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBSEEsQ0FBQTtBQUlBLE1BQUEsSUFBc0QsYUFBdEQ7ZUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxhQUFkLEVBQTZCO0FBQUEsVUFBQyxRQUFBLE1BQUQ7QUFBQSxVQUFTLElBQUEsRUFBTSxJQUFmO1NBQTdCLEVBQUE7T0FMTztJQUFBLENBaEZULENBQUE7O0FBQUEsaUNBdUZBLEtBQUEsR0FBTyxTQUFBLEdBQUE7QUFDTCxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQWpCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFEZixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBRlosQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxFQUhiLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxTQUFELEdBQWEsRUFKYixDQUFBO2FBS0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLEdBQWlCLEdBTlo7SUFBQSxDQXZGUCxDQUFBOzs4QkFBQTs7S0FEK0IsWUFYakMsQ0FBQTs7QUFBQSxFQTJHQSxNQUFNLENBQUMsT0FBUCxHQUNBLGtCQUFBLEdBQ0EsdUJBQUEsQ0FBd0IsdUJBQXhCLEVBQWlELGtCQUFrQixDQUFDLFNBQXBFLENBN0dBLENBQUE7O0FBQUEsRUErR0Esa0JBQWtCLENBQUMsYUFBbkIsR0FBbUMsU0FBQyxVQUFELEdBQUE7QUFDakMsSUFBQSxJQUFVLFVBQUEsS0FBYyxRQUF4QjtBQUFBLFlBQUEsQ0FBQTtLQUFBO1dBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxRQUFYLEdBQXNCLEdBQUEsQ0FBQSxTQUFjLENBQUEsVUFBQSxFQUZIO0VBQUEsQ0EvR25DLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-marker-element.coffee
