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
      var ref, swrapOptions;
      if (this.vimState.isMode('visual', 'blockwise')) {
        return (ref = this.vimState.getLastBlockwiseSelection()) != null ? ref.getHeadSelection().getHeadBufferPosition() : void 0;
      } else {
        swrapOptions = {
          fromProperty: true,
          allowFallback: true
        };
        return swrap(this.editor.getLastSelection()).getBufferPositionFor('head', swrapOptions);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvaG92ZXItbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBRVIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHNCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixNQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsYUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLG9CQUFBO01BQ1gsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNiLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtRQUFDLElBQUEsRUFBTSxTQUFQO1FBQWtCLElBQUEsRUFBTSxJQUFDLENBQUEsU0FBekI7O01BQ3JCLElBQUMsQ0FBQSxLQUFELENBQUE7SUFKVzs7MkJBTWIsUUFBQSxHQUFVLFNBQUE7QUFDUixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsUUFBakIsRUFBMkIsV0FBM0IsQ0FBSDs4RUFFdUMsQ0FBRSxnQkFBdkMsQ0FBQSxDQUF5RCxDQUFDLHFCQUExRCxDQUFBLFdBRkY7T0FBQSxNQUFBO1FBSUUsWUFBQSxHQUFlO1VBQUMsWUFBQSxFQUFjLElBQWY7VUFBcUIsYUFBQSxFQUFlLElBQXBDOztlQUNmLEtBQUEsQ0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUEsQ0FBTixDQUFpQyxDQUFDLG9CQUFsQyxDQUF1RCxNQUF2RCxFQUErRCxZQUEvRCxFQUxGOztJQURROzsyQkFRVixHQUFBLEdBQUssU0FBQyxJQUFELEVBQU8sS0FBUCxFQUEwQixPQUExQjtBQUNILFVBQUE7O1FBRFUsUUFBTSxJQUFDLENBQUEsUUFBRCxDQUFBOzs7UUFBYSxVQUFROztNQUNyQyxJQUFPLG1CQUFQO1FBQ0UsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQTJCLEtBQTNCO1FBQ1YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLElBQUMsQ0FBQSxNQUF4QixFQUFnQyxJQUFDLENBQUEsaUJBQWpDLEVBRkY7O01BSUEsMkNBQW9CLENBQUUsZUFBdEI7UUFDRSxRQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBWCxDQUFvQixDQUFDLEdBQXJCLGFBQXlCLE9BQU8sQ0FBQyxTQUFqQyxFQURGOzthQUVBLElBQUMsQ0FBQSxTQUFTLENBQUMsV0FBWCxHQUF5QjtJQVB0Qjs7MkJBU0wsS0FBQSxHQUFPLFNBQUE7QUFDTCxVQUFBO01BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxTQUFYLEdBQXVCOztXQUNoQixDQUFFLE9BQVQsQ0FBQTs7YUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVO0lBSEw7OzJCQUtQLE9BQUEsR0FBUyxTQUFBO01BQ04sSUFBQyxDQUFBLFdBQVksR0FBWjthQUNGLElBQUMsQ0FBQSxLQUFELENBQUE7SUFGTzs7Ozs7QUFoQ1giLCJzb3VyY2VzQ29udGVudCI6WyJzd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEhvdmVyTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG4gICAgQGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgQGRlY29yYXRpb25PcHRpb25zID0ge3R5cGU6ICdvdmVybGF5JywgaXRlbTogQGNvbnRhaW5lcn1cbiAgICBAcmVzZXQoKVxuXG4gIGdldFBvaW50OiAtPlxuICAgIGlmIEB2aW1TdGF0ZS5pc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgIyBGSVhNRSAjMTc5XG4gICAgICBAdmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpPy5nZXRIZWFkU2VsZWN0aW9uKCkuZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICBlbHNlXG4gICAgICBzd3JhcE9wdGlvbnMgPSB7ZnJvbVByb3BlcnR5OiB0cnVlLCBhbGxvd0ZhbGxiYWNrOiB0cnVlfVxuICAgICAgc3dyYXAoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgc3dyYXBPcHRpb25zKVxuXG4gIHNldDogKHRleHQsIHBvaW50PUBnZXRQb2ludCgpLCBvcHRpb25zPXt9KSAtPlxuICAgIHVubGVzcyBAbWFya2VyP1xuICAgICAgQG1hcmtlciA9IEBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgQGVkaXRvci5kZWNvcmF0ZU1hcmtlcihAbWFya2VyLCBAZGVjb3JhdGlvbk9wdGlvbnMpXG5cbiAgICBpZiBvcHRpb25zLmNsYXNzTGlzdD8ubGVuZ3RoXG4gICAgICBAY29udGFpbmVyLmNsYXNzTGlzdC5hZGQob3B0aW9ucy5jbGFzc0xpc3QuLi4pXG4gICAgQGNvbnRhaW5lci50ZXh0Q29udGVudCA9IHRleHRcblxuICByZXNldDogLT5cbiAgICBAY29udGFpbmVyLmNsYXNzTmFtZSA9ICd2aW0tbW9kZS1wbHVzLWhvdmVyJ1xuICAgIEBtYXJrZXI/LmRlc3Ryb3koKVxuICAgIEBtYXJrZXIgPSBudWxsXG5cbiAgZGVzdHJveTogLT5cbiAgICB7QHZpbVN0YXRlfSA9IHt9XG4gICAgQHJlc2V0KClcbiJdfQ==
