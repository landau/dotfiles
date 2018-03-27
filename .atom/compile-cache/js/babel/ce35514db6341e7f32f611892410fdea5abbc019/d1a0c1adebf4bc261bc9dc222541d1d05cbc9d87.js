'use babel';

/**
 * @access private
 */
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var LegacyAdater = (function () {
  function LegacyAdater(textEditor) {
    _classCallCheck(this, LegacyAdater);

    this.textEditor = textEditor;
  }

  _createClass(LegacyAdater, [{
    key: 'enableCache',
    value: function enableCache() {
      this.useCache = true;
    }
  }, {
    key: 'clearCache',
    value: function clearCache() {
      this.useCache = false;
      delete this.heightCache;
      delete this.scrollTopCache;
      delete this.scrollLeftCache;
      delete this.maxScrollTopCache;
    }
  }, {
    key: 'onDidChangeScrollTop',
    value: function onDidChangeScrollTop(callback) {
      return this.textEditor.onDidChangeScrollTop(callback);
    }
  }, {
    key: 'onDidChangeScrollLeft',
    value: function onDidChangeScrollLeft(callback) {
      return this.textEditor.onDidChangeScrollLeft(callback);
    }
  }, {
    key: 'getHeight',
    value: function getHeight() {
      if (this.useCache) {
        if (!this.heightCache) {
          this.heightCache = this.textEditor.getHeight();
        }
        return this.heightCache;
      }
      return this.textEditor.getHeight();
    }
  }, {
    key: 'getScrollTop',
    value: function getScrollTop() {
      if (this.useCache) {
        if (!this.scrollTopCache) {
          this.scrollTopCache = this.textEditor.getScrollTop();
        }
        return this.scrollTopCache;
      }
      return this.textEditor.getScrollTop();
    }
  }, {
    key: 'setScrollTop',
    value: function setScrollTop(scrollTop) {
      return this.textEditor.setScrollTop(scrollTop);
    }
  }, {
    key: 'getScrollLeft',
    value: function getScrollLeft() {
      if (this.useCache) {
        if (!this.scrollLeftCache) {
          this.scrollLeftCache = this.textEditor.getScrollLeft();
        }
        return this.scrollLeftCache;
      }

      return this.textEditor.getScrollLeft();
    }
  }, {
    key: 'getMaxScrollTop',
    value: function getMaxScrollTop() {
      if (this.maxScrollTopCache != null && this.useCache) {
        return this.maxScrollTopCache;
      }
      var maxScrollTop = this.textEditor.getMaxScrollTop();
      var lineHeight = this.textEditor.getLineHeightInPixels();

      if (this.scrollPastEnd) {
        maxScrollTop -= this.getHeight() - 3 * lineHeight;
      }
      if (this.useCache) {
        this.maxScrollTopCache = maxScrollTop;
      }
      return maxScrollTop;
    }
  }]);

  return LegacyAdater;
})();

exports['default'] = LegacyAdater;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL2FkYXB0ZXJzL2xlZ2FjeS1hZGFwdGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7OztJQUtVLFlBQVk7QUFDbkIsV0FETyxZQUFZLENBQ2xCLFVBQVUsRUFBRTswQkFETixZQUFZOztBQUNKLFFBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO0dBQUU7O2VBRHRDLFlBQVk7O1dBR25CLHVCQUFHO0FBQUUsVUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7S0FBRTs7O1dBRTVCLHNCQUFHO0FBQ1osVUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUE7QUFDckIsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFBO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQTtBQUMxQixhQUFPLElBQUksQ0FBQyxlQUFlLENBQUE7QUFDM0IsYUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUE7S0FDOUI7OztXQUVvQiw4QkFBQyxRQUFRLEVBQUU7QUFDOUIsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQ3REOzs7V0FFcUIsK0JBQUMsUUFBUSxFQUFFO0FBQy9CLGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUN2RDs7O1dBRVMscUJBQUc7QUFDWCxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDckIsY0FBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFBO1NBQy9DO0FBQ0QsZUFBTyxJQUFJLENBQUMsV0FBVyxDQUFBO09BQ3hCO0FBQ0QsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFBO0tBQ25DOzs7V0FFWSx3QkFBRztBQUNkLFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN4QixjQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUE7U0FDckQ7QUFDRCxlQUFPLElBQUksQ0FBQyxjQUFjLENBQUE7T0FDM0I7QUFDRCxhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUE7S0FDdEM7OztXQUVZLHNCQUFDLFNBQVMsRUFBRTtBQUN2QixhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0tBQy9DOzs7V0FFYSx5QkFBRztBQUNmLFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUN6QixjQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUE7U0FDdkQ7QUFDRCxlQUFPLElBQUksQ0FBQyxlQUFlLENBQUE7T0FDNUI7O0FBRUQsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFBO0tBQ3ZDOzs7V0FFZSwyQkFBRztBQUNqQixVQUFJLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNuRCxlQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQTtPQUM5QjtBQUNELFVBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUE7QUFDcEQsVUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFBOztBQUV4RCxVQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsb0JBQVksSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQTtPQUNsRDtBQUNELFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUFFLFlBQUksQ0FBQyxpQkFBaUIsR0FBRyxZQUFZLENBQUE7T0FBRTtBQUM1RCxhQUFPLFlBQVksQ0FBQTtLQUNwQjs7O1NBcEVrQixZQUFZOzs7cUJBQVosWUFBWSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9hZGFwdGVycy9sZWdhY3ktYWRhcHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbi8qKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExlZ2FjeUFkYXRlciB7XG4gIGNvbnN0cnVjdG9yICh0ZXh0RWRpdG9yKSB7IHRoaXMudGV4dEVkaXRvciA9IHRleHRFZGl0b3IgfVxuXG4gIGVuYWJsZUNhY2hlICgpIHsgdGhpcy51c2VDYWNoZSA9IHRydWUgfVxuXG4gIGNsZWFyQ2FjaGUgKCkge1xuICAgIHRoaXMudXNlQ2FjaGUgPSBmYWxzZVxuICAgIGRlbGV0ZSB0aGlzLmhlaWdodENhY2hlXG4gICAgZGVsZXRlIHRoaXMuc2Nyb2xsVG9wQ2FjaGVcbiAgICBkZWxldGUgdGhpcy5zY3JvbGxMZWZ0Q2FjaGVcbiAgICBkZWxldGUgdGhpcy5tYXhTY3JvbGxUb3BDYWNoZVxuICB9XG5cbiAgb25EaWRDaGFuZ2VTY3JvbGxUb3AgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvci5vbkRpZENoYW5nZVNjcm9sbFRvcChjYWxsYmFjaylcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlU2Nyb2xsTGVmdCAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yLm9uRGlkQ2hhbmdlU2Nyb2xsTGVmdChjYWxsYmFjaylcbiAgfVxuXG4gIGdldEhlaWdodCAoKSB7XG4gICAgaWYgKHRoaXMudXNlQ2FjaGUpIHtcbiAgICAgIGlmICghdGhpcy5oZWlnaHRDYWNoZSkge1xuICAgICAgICB0aGlzLmhlaWdodENhY2hlID0gdGhpcy50ZXh0RWRpdG9yLmdldEhlaWdodCgpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5oZWlnaHRDYWNoZVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yLmdldEhlaWdodCgpXG4gIH1cblxuICBnZXRTY3JvbGxUb3AgKCkge1xuICAgIGlmICh0aGlzLnVzZUNhY2hlKSB7XG4gICAgICBpZiAoIXRoaXMuc2Nyb2xsVG9wQ2FjaGUpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxUb3BDYWNoZSA9IHRoaXMudGV4dEVkaXRvci5nZXRTY3JvbGxUb3AoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuc2Nyb2xsVG9wQ2FjaGVcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvci5nZXRTY3JvbGxUb3AoKVxuICB9XG5cbiAgc2V0U2Nyb2xsVG9wIChzY3JvbGxUb3ApIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yLnNldFNjcm9sbFRvcChzY3JvbGxUb3ApXG4gIH1cblxuICBnZXRTY3JvbGxMZWZ0ICgpIHtcbiAgICBpZiAodGhpcy51c2VDYWNoZSkge1xuICAgICAgaWYgKCF0aGlzLnNjcm9sbExlZnRDYWNoZSkge1xuICAgICAgICB0aGlzLnNjcm9sbExlZnRDYWNoZSA9IHRoaXMudGV4dEVkaXRvci5nZXRTY3JvbGxMZWZ0KClcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnNjcm9sbExlZnRDYWNoZVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRleHRFZGl0b3IuZ2V0U2Nyb2xsTGVmdCgpXG4gIH1cblxuICBnZXRNYXhTY3JvbGxUb3AgKCkge1xuICAgIGlmICh0aGlzLm1heFNjcm9sbFRvcENhY2hlICE9IG51bGwgJiYgdGhpcy51c2VDYWNoZSkge1xuICAgICAgcmV0dXJuIHRoaXMubWF4U2Nyb2xsVG9wQ2FjaGVcbiAgICB9XG4gICAgdmFyIG1heFNjcm9sbFRvcCA9IHRoaXMudGV4dEVkaXRvci5nZXRNYXhTY3JvbGxUb3AoKVxuICAgIHZhciBsaW5lSGVpZ2h0ID0gdGhpcy50ZXh0RWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG5cbiAgICBpZiAodGhpcy5zY3JvbGxQYXN0RW5kKSB7XG4gICAgICBtYXhTY3JvbGxUb3AgLT0gdGhpcy5nZXRIZWlnaHQoKSAtIDMgKiBsaW5lSGVpZ2h0XG4gICAgfVxuICAgIGlmICh0aGlzLnVzZUNhY2hlKSB7IHRoaXMubWF4U2Nyb2xsVG9wQ2FjaGUgPSBtYXhTY3JvbGxUb3AgfVxuICAgIHJldHVybiBtYXhTY3JvbGxUb3BcbiAgfVxufVxuIl19
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/minimap/lib/adapters/legacy-adapter.js
