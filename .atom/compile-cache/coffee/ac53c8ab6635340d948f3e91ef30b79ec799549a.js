(function() {
  var ColorMarker, CompositeDisposable, fill;

  CompositeDisposable = require('atom').CompositeDisposable;

  fill = require('./utils').fill;

  module.exports = ColorMarker = (function() {
    function ColorMarker(_arg) {
      this.marker = _arg.marker, this.color = _arg.color, this.text = _arg.text, this.invalid = _arg.invalid, this.colorBuffer = _arg.colorBuffer;
      this.id = this.marker.id;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.marker.onDidDestroy((function(_this) {
        return function() {
          return _this.markerWasDestroyed();
        };
      })(this)));
      this.subscriptions.add(this.marker.onDidChange((function(_this) {
        return function() {
          if (_this.marker.isValid()) {
            _this.invalidateScreenRangeCache();
            return _this.checkMarkerScope();
          } else {
            return _this.destroy();
          }
        };
      })(this)));
      this.checkMarkerScope();
    }

    ColorMarker.prototype.destroy = function() {
      if (this.destroyed) {
        return;
      }
      return this.marker.destroy();
    };

    ColorMarker.prototype.markerWasDestroyed = function() {
      var _ref;
      if (this.destroyed) {
        return;
      }
      this.subscriptions.dispose();
      _ref = {}, this.marker = _ref.marker, this.color = _ref.color, this.text = _ref.text, this.colorBuffer = _ref.colorBuffer;
      return this.destroyed = true;
    };

    ColorMarker.prototype.match = function(properties) {
      var bool;
      if (this.destroyed) {
        return false;
      }
      bool = true;
      if (properties.bufferRange != null) {
        bool && (bool = this.marker.getBufferRange().isEqual(properties.bufferRange));
      }
      if (properties.color != null) {
        bool && (bool = properties.color.isEqual(this.color));
      }
      if (properties.match != null) {
        bool && (bool = properties.match === this.text);
      }
      if (properties.text != null) {
        bool && (bool = properties.text === this.text);
      }
      return bool;
    };

    ColorMarker.prototype.serialize = function() {
      var out;
      if (this.destroyed) {
        return;
      }
      out = {
        markerId: String(this.marker.id),
        bufferRange: this.marker.getBufferRange().serialize(),
        color: this.color.serialize(),
        text: this.text,
        variables: this.color.variables
      };
      if (!this.color.isValid()) {
        out.invalid = true;
      }
      return out;
    };

    ColorMarker.prototype.checkMarkerScope = function(forceEvaluation) {
      var e, range, scope, scopeChain, _ref;
      if (forceEvaluation == null) {
        forceEvaluation = false;
      }
      if (this.destroyed || (this.colorBuffer == null)) {
        return;
      }
      range = this.marker.getBufferRange();
      try {
        scope = this.colorBuffer.editor.scopeDescriptorForBufferPosition != null ? this.colorBuffer.editor.scopeDescriptorForBufferPosition(range.start) : this.colorBuffer.editor.displayBuffer.scopeDescriptorForBufferPosition(range.start);
        scopeChain = scope.getScopeChain();
        if (!scopeChain || (!forceEvaluation && scopeChain === this.lastScopeChain)) {
          return;
        }
        this.ignored = ((_ref = this.colorBuffer.ignoredScopes) != null ? _ref : []).some(function(scopeRegExp) {
          return scopeChain.match(scopeRegExp);
        });
        return this.lastScopeChain = scopeChain;
      } catch (_error) {
        e = _error;
        return console.error(e);
      }
    };

    ColorMarker.prototype.isIgnored = function() {
      return this.ignored;
    };

    ColorMarker.prototype.getBufferRange = function() {
      return this.marker.getBufferRange();
    };

    ColorMarker.prototype.getScreenRange = function() {
      var _ref;
      return this.screenRangeCache != null ? this.screenRangeCache : this.screenRangeCache = (_ref = this.marker) != null ? _ref.getScreenRange() : void 0;
    };

    ColorMarker.prototype.invalidateScreenRangeCache = function() {
      return this.screenRangeCache = null;
    };

    ColorMarker.prototype.convertContentToHex = function() {
      return this.convertContentInPlace('hex');
    };

    ColorMarker.prototype.convertContentToRGB = function() {
      return this.convertContentInPlace('rgb');
    };

    ColorMarker.prototype.convertContentToRGBA = function() {
      return this.convertContentInPlace('rgba');
    };

    ColorMarker.prototype.convertContentToHSL = function() {
      return this.convertContentInPlace('hsl');
    };

    ColorMarker.prototype.convertContentToHSLA = function() {
      return this.convertContentInPlace('hsla');
    };

    ColorMarker.prototype.copyContentAsHex = function() {
      return atom.clipboard.write(this.convertContent('hex'));
    };

    ColorMarker.prototype.copyContentAsRGB = function() {
      return atom.clipboard.write(this.convertContent('rgb'));
    };

    ColorMarker.prototype.copyContentAsRGBA = function() {
      return atom.clipboard.write(this.convertContent('rgba'));
    };

    ColorMarker.prototype.copyContentAsHSL = function() {
      return atom.clipboard.write(this.convertContent('hsl'));
    };

    ColorMarker.prototype.copyContentAsHSLA = function() {
      return atom.clipboard.write(this.convertContent('hsla'));
    };

    ColorMarker.prototype.convertContentInPlace = function(mode) {
      return this.colorBuffer.editor.getBuffer().setTextInRange(this.marker.getBufferRange(), this.convertContent(mode));
    };

    ColorMarker.prototype.convertContent = function(mode) {
      switch (mode) {
        case 'hex':
          return '#' + fill(this.color.hex, 6);
        case 'rgb':
          return "rgb(" + (Math.round(this.color.red)) + ", " + (Math.round(this.color.green)) + ", " + (Math.round(this.color.blue)) + ")";
        case 'rgba':
          return "rgba(" + (Math.round(this.color.red)) + ", " + (Math.round(this.color.green)) + ", " + (Math.round(this.color.blue)) + ", " + this.color.alpha + ")";
        case 'hsl':
          return "hsl(" + (Math.round(this.color.hue)) + ", " + (Math.round(this.color.saturation)) + "%, " + (Math.round(this.color.lightness)) + "%)";
        case 'hsla':
          return "hsla(" + (Math.round(this.color.hue)) + ", " + (Math.round(this.color.saturation)) + "%, " + (Math.round(this.color.lightness)) + "%, " + this.color.alpha + ")";
      }
    };

    return ColorMarker;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLW1hcmtlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0NBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNDLE9BQVEsT0FBQSxDQUFRLFNBQVIsRUFBUixJQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSxxQkFBQyxJQUFELEdBQUE7QUFDWCxNQURhLElBQUMsQ0FBQSxjQUFBLFFBQVEsSUFBQyxDQUFBLGFBQUEsT0FBTyxJQUFDLENBQUEsWUFBQSxNQUFNLElBQUMsQ0FBQSxlQUFBLFNBQVMsSUFBQyxDQUFBLG1CQUFBLFdBQ2hELENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxFQUFELEdBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxFQUFkLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFEakIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxrQkFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQixDQUFuQixDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNyQyxVQUFBLElB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-marker.coffee
