(function() {
  var HoverManager, swrap;

  swrap = require('./selection-wrapper');

  module.exports = HoverManager = (function() {
    function HoverManager(vimState) {
      var ref;
      this.vimState = vimState;
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement;
      this.container = document.createElement('div');
      this.decorationOptions = {
        type: 'overlay',
        item: this.container
      };
      this.reset();
    }

    HoverManager.prototype.getPoint = function() {
      var selection;
      if (this.vimState.isMode('visual', 'blockwise')) {
        return this.vimState.getLastBlockwiseSelection().getHeadSelection().getHeadBufferPosition();
      } else {
        selection = this.editor.getLastSelection();
        return swrap(selection).getBufferPositionFor('head', {
          from: ['property', 'selection']
        });
      }
    };

    HoverManager.prototype.set = function(text, point, options) {
      var ref, ref1;
      if (point == null) {
        point = this.getPoint();
      }
      if (options == null) {
        options = {};
      }
      if (this.marker == null) {
        this.marker = this.editor.markBufferPosition(point);
        this.editor.decorateMarker(this.marker, this.decorationOptions);
      }
      if ((ref = options.classList) != null ? ref.length : void 0) {
        (ref1 = this.container.classList).add.apply(ref1, options.classList);
      }
      return this.container.textContent = text;
    };

    HoverManager.prototype.reset = function() {
      var ref;
      this.container.className = 'vim-mode-plus-hover';
      if ((ref = this.marker) != null) {
        ref.destroy();
      }
      return this.marker = null;
    };

    HoverManager.prototype.destroy = function() {
      this.vimState = {}.vimState;
      return this.reset();
    };

    return HoverManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvaG92ZXItbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBRVIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHNCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixNQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsYUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLG9CQUFBO01BQ1gsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNiLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtRQUFDLElBQUEsRUFBTSxTQUFQO1FBQWtCLElBQUEsRUFBTSxJQUFDLENBQUEsU0FBekI7O01BQ3JCLElBQUMsQ0FBQSxLQUFELENBQUE7SUFKVzs7MkJBTWIsUUFBQSxHQUFVLFNBQUE7QUFDUixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsUUFBakIsRUFBMkIsV0FBM0IsQ0FBSDtlQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMseUJBQVYsQ0FBQSxDQUFxQyxDQUFDLGdCQUF0QyxDQUFBLENBQXdELENBQUMscUJBQXpELENBQUEsRUFERjtPQUFBLE1BQUE7UUFHRSxTQUFBLEdBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBO2VBQ1osS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxvQkFBakIsQ0FBc0MsTUFBdEMsRUFBOEM7VUFBQSxJQUFBLEVBQU0sQ0FBQyxVQUFELEVBQWEsV0FBYixDQUFOO1NBQTlDLEVBSkY7O0lBRFE7OzJCQU9WLEdBQUEsR0FBSyxTQUFDLElBQUQsRUFBTyxLQUFQLEVBQTBCLE9BQTFCO0FBQ0gsVUFBQTs7UUFEVSxRQUFNLElBQUMsQ0FBQSxRQUFELENBQUE7OztRQUFhLFVBQVE7O01BQ3JDLElBQU8sbUJBQVA7UUFDRSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBMkIsS0FBM0I7UUFDVixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBdUIsSUFBQyxDQUFBLE1BQXhCLEVBQWdDLElBQUMsQ0FBQSxpQkFBakMsRUFGRjs7TUFJQSwyQ0FBb0IsQ0FBRSxlQUF0QjtRQUNFLFFBQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxTQUFYLENBQW9CLENBQUMsR0FBckIsYUFBeUIsT0FBTyxDQUFDLFNBQWpDLEVBREY7O2FBRUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxXQUFYLEdBQXlCO0lBUHRCOzsyQkFTTCxLQUFBLEdBQU8sU0FBQTtBQUNMLFVBQUE7TUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVgsR0FBdUI7O1dBQ2hCLENBQUUsT0FBVCxDQUFBOzthQUNBLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFITDs7MkJBS1AsT0FBQSxHQUFTLFNBQUE7TUFDTixJQUFDLENBQUEsV0FBWSxHQUFaO2FBQ0YsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUZPOzs7OztBQS9CWCIsInNvdXJjZXNDb250ZW50IjpbInN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSG92ZXJNYW5hZ2VyXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBAZGVjb3JhdGlvbk9wdGlvbnMgPSB7dHlwZTogJ292ZXJsYXknLCBpdGVtOiBAY29udGFpbmVyfVxuICAgIEByZXNldCgpXG5cbiAgZ2V0UG9pbnQ6IC0+XG4gICAgaWYgQHZpbVN0YXRlLmlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICBAdmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmdldEhlYWRTZWxlY3Rpb24oKS5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIGVsc2VcbiAgICAgIHNlbGVjdGlvbiA9IEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpXG4gICAgICBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXSlcblxuICBzZXQ6ICh0ZXh0LCBwb2ludD1AZ2V0UG9pbnQoKSwgb3B0aW9ucz17fSkgLT5cbiAgICB1bmxlc3MgQG1hcmtlcj9cbiAgICAgIEBtYXJrZXIgPSBAZWRpdG9yLm1hcmtCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIEBlZGl0b3IuZGVjb3JhdGVNYXJrZXIoQG1hcmtlciwgQGRlY29yYXRpb25PcHRpb25zKVxuXG4gICAgaWYgb3B0aW9ucy5jbGFzc0xpc3Q/Lmxlbmd0aFxuICAgICAgQGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKG9wdGlvbnMuY2xhc3NMaXN0Li4uKVxuICAgIEBjb250YWluZXIudGV4dENvbnRlbnQgPSB0ZXh0XG5cbiAgcmVzZXQ6IC0+XG4gICAgQGNvbnRhaW5lci5jbGFzc05hbWUgPSAndmltLW1vZGUtcGx1cy1ob3ZlcidcbiAgICBAbWFya2VyPy5kZXN0cm95KClcbiAgICBAbWFya2VyID0gbnVsbFxuXG4gIGRlc3Ryb3k6IC0+XG4gICAge0B2aW1TdGF0ZX0gPSB7fVxuICAgIEByZXNldCgpXG4iXX0=
