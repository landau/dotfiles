(function() {
  var HoverManager,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports = HoverManager = (function() {
    function HoverManager(vimState) {
      var ref;
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement;
      this.container = document.createElement('div');
      this.decorationOptions = {
        type: 'overlay',
        item: this.container
      };
      this.vimState.onDidDestroy(this.destroy);
      this.reset();
    }

    HoverManager.prototype.getPoint = function() {
      var selection;
      if (this.vimState.isMode('visual', 'blockwise')) {
        return this.vimState.getLastBlockwiseSelection().getHeadSelection().getHeadBufferPosition();
      } else {
        selection = this.editor.getLastSelection();
        return this.vimState.swrap(selection).getBufferPositionFor('head', {
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
      var ref;
      this.container.remove();
      if ((ref = this.marker) != null) {
        ref.destroy();
      }
      return this.marker = null;
    };

    return HoverManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvaG92ZXItbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLFlBQUE7SUFBQTs7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1Msc0JBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDs7TUFDWixNQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsYUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLG9CQUFBO01BQ1gsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNiLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtRQUFDLElBQUEsRUFBTSxTQUFQO1FBQWtCLElBQUEsRUFBTSxJQUFDLENBQUEsU0FBekI7O01BQ3JCLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBeEI7TUFDQSxJQUFDLENBQUEsS0FBRCxDQUFBO0lBTFc7OzJCQU9iLFFBQUEsR0FBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLFFBQWpCLEVBQTJCLFdBQTNCLENBQUg7ZUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLHlCQUFWLENBQUEsQ0FBcUMsQ0FBQyxnQkFBdEMsQ0FBQSxDQUF3RCxDQUFDLHFCQUF6RCxDQUFBLEVBREY7T0FBQSxNQUFBO1FBR0UsU0FBQSxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBQTtlQUNaLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFnQixTQUFoQixDQUEwQixDQUFDLG9CQUEzQixDQUFnRCxNQUFoRCxFQUF3RDtVQUFBLElBQUEsRUFBTSxDQUFDLFVBQUQsRUFBYSxXQUFiLENBQU47U0FBeEQsRUFKRjs7SUFEUTs7MkJBT1YsR0FBQSxHQUFLLFNBQUMsSUFBRCxFQUFPLEtBQVAsRUFBMEIsT0FBMUI7QUFDSCxVQUFBOztRQURVLFFBQU0sSUFBQyxDQUFBLFFBQUQsQ0FBQTs7O1FBQWEsVUFBUTs7TUFDckMsSUFBTyxtQkFBUDtRQUNFLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUEyQixLQUEzQjtRQUNWLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixJQUFDLENBQUEsTUFBeEIsRUFBZ0MsSUFBQyxDQUFBLGlCQUFqQyxFQUZGOztNQUlBLDJDQUFvQixDQUFFLGVBQXRCO1FBQ0UsUUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVgsQ0FBb0IsQ0FBQyxHQUFyQixhQUF5QixPQUFPLENBQUMsU0FBakMsRUFERjs7YUFFQSxJQUFDLENBQUEsU0FBUyxDQUFDLFdBQVgsR0FBeUI7SUFQdEI7OzJCQVNMLEtBQUEsR0FBTyxTQUFBO0FBQ0wsVUFBQTtNQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBWCxHQUF1Qjs7V0FDaEIsQ0FBRSxPQUFULENBQUE7O2FBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUhMOzsyQkFLUCxPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQTs7V0FDTyxDQUFFLE9BQVQsQ0FBQTs7YUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVO0lBSEg7Ozs7O0FBOUJYIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSG92ZXJNYW5hZ2VyXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBAZGVjb3JhdGlvbk9wdGlvbnMgPSB7dHlwZTogJ292ZXJsYXknLCBpdGVtOiBAY29udGFpbmVyfVxuICAgIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kpXG4gICAgQHJlc2V0KClcblxuICBnZXRQb2ludDogLT5cbiAgICBpZiBAdmltU3RhdGUuaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgIEB2aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCkuZ2V0SGVhZFNlbGVjdGlvbigpLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgZWxzZVxuICAgICAgc2VsZWN0aW9uID0gQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKClcbiAgICAgIEB2aW1TdGF0ZS5zd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXSlcblxuICBzZXQ6ICh0ZXh0LCBwb2ludD1AZ2V0UG9pbnQoKSwgb3B0aW9ucz17fSkgLT5cbiAgICB1bmxlc3MgQG1hcmtlcj9cbiAgICAgIEBtYXJrZXIgPSBAZWRpdG9yLm1hcmtCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIEBlZGl0b3IuZGVjb3JhdGVNYXJrZXIoQG1hcmtlciwgQGRlY29yYXRpb25PcHRpb25zKVxuXG4gICAgaWYgb3B0aW9ucy5jbGFzc0xpc3Q/Lmxlbmd0aFxuICAgICAgQGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKG9wdGlvbnMuY2xhc3NMaXN0Li4uKVxuICAgIEBjb250YWluZXIudGV4dENvbnRlbnQgPSB0ZXh0XG5cbiAgcmVzZXQ6IC0+XG4gICAgQGNvbnRhaW5lci5jbGFzc05hbWUgPSAndmltLW1vZGUtcGx1cy1ob3ZlcidcbiAgICBAbWFya2VyPy5kZXN0cm95KClcbiAgICBAbWFya2VyID0gbnVsbFxuXG4gIGRlc3Ryb3k6ID0+XG4gICAgQGNvbnRhaW5lci5yZW1vdmUoKVxuICAgIEBtYXJrZXI/LmRlc3Ryb3koKVxuICAgIEBtYXJrZXIgPSBudWxsXG4iXX0=
