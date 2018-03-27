(function() {
  var ColorMarker, CompositeDisposable, fill, _ref;

  _ref = [], CompositeDisposable = _ref[0], fill = _ref[1];

  module.exports = ColorMarker = (function() {
    function ColorMarker(_arg) {
      this.marker = _arg.marker, this.color = _arg.color, this.text = _arg.text, this.invalid = _arg.invalid, this.colorBuffer = _arg.colorBuffer;
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
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
      var _ref1;
      if (this.destroyed) {
        return;
      }
      this.subscriptions.dispose();
      _ref1 = {}, this.marker = _ref1.marker, this.color = _ref1.color, this.text = _ref1.text, this.colorBuffer = _ref1.colorBuffer;
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
      var e, range, scope, scopeChain, _ref1;
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
        this.ignored = ((_ref1 = this.colorBuffer.ignoredScopes) != null ? _ref1 : []).some(function(scopeRegExp) {
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
      var _ref1;
      return this.screenRangeCache != null ? this.screenRangeCache : this.screenRangeCache = (_ref1 = this.marker) != null ? _ref1.getScreenRange() : void 0;
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
      if (fill == null) {
        fill = require('./utils').fill;
      }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLW1hcmtlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNENBQUE7O0FBQUEsRUFBQSxPQUE4QixFQUE5QixFQUFDLDZCQUFELEVBQXNCLGNBQXRCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSxxQkFBQyxJQUFELEdBQUE7QUFDWCxNQURhLElBQUMsQ0FBQSxjQUFBLFFBQVEsSUFBQyxDQUFBLGFBQUEsT0FBTyxJQUFDLENBQUEsWUFBQSxNQUFNLElBQUMsQ0FBQSxlQUFBLFNBQVMsSUFBQyxDQUFBLG1CQUFBLFdBQ2hELENBQUE7QUFBQSxNQUFBLElBQThDLDJCQUE5QztBQUFBLFFBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7T0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLEVBQUQsR0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLEVBRmQsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUhqQixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLGtCQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCLENBQW5CLENBSkEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFvQixDQUFBLFNBQUEsS0FBQSxH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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-marker.coffee
