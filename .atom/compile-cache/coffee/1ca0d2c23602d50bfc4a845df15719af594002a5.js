(function() {
  var CompositeDisposable, MARKS, MarkManager, Point, ref,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Point = ref.Point, CompositeDisposable = ref.CompositeDisposable;

  MARKS = /(?:[a-z]|[\[\]`'.^(){}<>])/;

  MarkManager = (function() {
    MarkManager.prototype.marks = null;

    function MarkManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.marks = {};
      this.markerLayer = this.editor.addMarkerLayer();
    }

    MarkManager.prototype.destroy = function() {
      this.disposables.dispose();
      this.markerLayer.destroy();
      return this.marks = null;
    };

    MarkManager.prototype.isValid = function(name) {
      return MARKS.test(name);
    };

    MarkManager.prototype.get = function(name) {
      var point, ref1;
      if (!this.isValid(name)) {
        return;
      }
      point = (ref1 = this.marks[name]) != null ? ref1.getStartBufferPosition() : void 0;
      if (indexOf.call("`'", name) >= 0) {
        return point != null ? point : Point.ZERO;
      } else {
        return point;
      }
    };

    MarkManager.prototype.set = function(name, point) {
      var bufferPosition, marker;
      if (!this.isValid(name)) {
        return;
      }
      if (marker = this.marks[name]) {
        marker.destroy();
      }
      bufferPosition = this.editor.clipBufferPosition(point);
      this.marks[name] = this.markerLayer.markBufferPosition(bufferPosition, {
        invalidate: 'never'
      });
      return this.vimState.emitter.emit('did-set-mark', {
        name: name,
        bufferPosition: bufferPosition,
        editor: this.editor
      });
    };

    return MarkManager;

  })();

  module.exports = MarkManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWFyay1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsbURBQUE7SUFBQTs7RUFBQSxNQUErQixPQUFBLENBQVEsTUFBUixDQUEvQixFQUFDLGlCQUFELEVBQVE7O0VBRVIsS0FBQSxHQUFROztFQUtGOzBCQUNKLEtBQUEsR0FBTzs7SUFFTSxxQkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQTtNQUNYLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBakI7TUFFQSxJQUFDLENBQUEsS0FBRCxHQUFTO01BQ1QsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQTtJQU5KOzswQkFRYixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7YUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTO0lBSEY7OzBCQUtULE9BQUEsR0FBUyxTQUFDLElBQUQ7YUFDUCxLQUFLLENBQUMsSUFBTixDQUFXLElBQVg7SUFETzs7MEJBR1QsR0FBQSxHQUFLLFNBQUMsSUFBRDtBQUNILFVBQUE7TUFBQSxJQUFBLENBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULENBQWQ7QUFBQSxlQUFBOztNQUNBLEtBQUEsMkNBQW9CLENBQUUsc0JBQWQsQ0FBQTtNQUNSLElBQUcsYUFBUSxJQUFSLEVBQUEsSUFBQSxNQUFIOytCQUNFLFFBQVEsS0FBSyxDQUFDLEtBRGhCO09BQUEsTUFBQTtlQUdFLE1BSEY7O0lBSEc7OzBCQVNMLEdBQUEsR0FBSyxTQUFDLElBQUQsRUFBTyxLQUFQO0FBQ0gsVUFBQTtNQUFBLElBQUEsQ0FBYyxJQUFDLENBQUEsT0FBRCxDQUFTLElBQVQsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsSUFBRyxNQUFBLEdBQVMsSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBLENBQW5CO1FBQ0UsTUFBTSxDQUFDLE9BQVAsQ0FBQSxFQURGOztNQUVBLGNBQUEsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUEyQixLQUEzQjtNQUNqQixJQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsQ0FBUCxHQUFlLElBQUMsQ0FBQSxXQUFXLENBQUMsa0JBQWIsQ0FBZ0MsY0FBaEMsRUFBZ0Q7UUFBQSxVQUFBLEVBQVksT0FBWjtPQUFoRDthQUNmLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLElBQWxCLENBQXVCLGNBQXZCLEVBQXVDO1FBQUMsTUFBQSxJQUFEO1FBQU8sZ0JBQUEsY0FBUDtRQUF3QixRQUFELElBQUMsQ0FBQSxNQUF4QjtPQUF2QztJQU5HOzs7Ozs7RUFRUCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQTNDakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UG9pbnQsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuTUFSS1MgPSAvLy8gKFxuICA/OiBbYS16XVxuICAgfCBbXFxbXFxdYCcuXigpe308Pl1cbikgLy8vXG5cbmNsYXNzIE1hcmtNYW5hZ2VyXG4gIG1hcmtzOiBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG5cbiAgICBAbWFya3MgPSB7fVxuICAgIEBtYXJrZXJMYXllciA9IEBlZGl0b3IuYWRkTWFya2VyTGF5ZXIoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEBtYXJrZXJMYXllci5kZXN0cm95KClcbiAgICBAbWFya3MgPSBudWxsXG5cbiAgaXNWYWxpZDogKG5hbWUpIC0+XG4gICAgTUFSS1MudGVzdChuYW1lKVxuXG4gIGdldDogKG5hbWUpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaXNWYWxpZChuYW1lKVxuICAgIHBvaW50ID0gQG1hcmtzW25hbWVdPy5nZXRTdGFydEJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiBuYW1lIGluIFwiYCdcIlxuICAgICAgcG9pbnQgPyBQb2ludC5aRVJPXG4gICAgZWxzZVxuICAgICAgcG9pbnRcblxuICAjIFtGSVhNRV0gTmVlZCB0byBzdXBwb3J0IEdsb2JhbCBtYXJrIHdpdGggY2FwaXRhbCBuYW1lIFtBLVpdXG4gIHNldDogKG5hbWUsIHBvaW50KSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGlzVmFsaWQobmFtZSlcbiAgICBpZiBtYXJrZXIgPSBAbWFya3NbbmFtZV1cbiAgICAgIG1hcmtlci5kZXN0cm95KClcbiAgICBidWZmZXJQb3NpdGlvbiA9IEBlZGl0b3IuY2xpcEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIEBtYXJrc1tuYW1lXSA9IEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24sIGludmFsaWRhdGU6ICduZXZlcicpXG4gICAgQHZpbVN0YXRlLmVtaXR0ZXIuZW1pdCgnZGlkLXNldC1tYXJrJywge25hbWUsIGJ1ZmZlclBvc2l0aW9uLCBAZWRpdG9yfSlcblxubW9kdWxlLmV4cG9ydHMgPSBNYXJrTWFuYWdlclxuIl19
