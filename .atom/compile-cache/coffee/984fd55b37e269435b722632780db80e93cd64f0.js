(function() {
  var CompositeDisposable, MARKS, MarkManager, Point, Range, ref,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point, CompositeDisposable = ref.CompositeDisposable;

  MARKS = /(?:[a-z]|[\[\]`'.^(){}<>])/;

  MarkManager = (function() {
    MarkManager.prototype.marks = null;

    function MarkManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
      this.marks = {};
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
    }

    MarkManager.prototype.destroy = function() {
      var i, len, marker, name, ref1;
      ref1 = this.marks;
      for (marker = i = 0, len = ref1.length; i < len; marker = ++i) {
        name = ref1[marker];
        marker.destroy();
      }
      return this.subscriptions.dispose();
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

    MarkManager.prototype.getRange = function(startMark, endMark) {
      var end, start;
      start = this.get(startMark);
      end = this.get(endMark);
      if ((start != null) && (end != null)) {
        return new Range(start, end);
      }
    };

    MarkManager.prototype.setRange = function(startMark, endMark, range) {
      var end, ref1, start;
      ref1 = Range.fromObject(range), start = ref1.start, end = ref1.end;
      this.set(startMark, start);
      return this.set(endMark, end);
    };

    MarkManager.prototype.set = function(name, point) {
      var bufferPosition, event, marker;
      if (!this.isValid(name)) {
        return;
      }
      if (marker = this.marks[name]) {
        marker.destroy();
      }
      bufferPosition = this.editor.clipBufferPosition(point);
      this.marks[name] = this.editor.markBufferPosition(bufferPosition);
      event = {
        name: name,
        bufferPosition: bufferPosition,
        editor: this.editor
      };
      return this.vimState.emitter.emit('did-set-mark', event);
    };

    return MarkManager;

  })();

  module.exports = MarkManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWFyay1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMERBQUE7SUFBQTs7RUFBQSxNQUFzQyxPQUFBLENBQVEsTUFBUixDQUF0QyxFQUFDLGlCQUFELEVBQVEsaUJBQVIsRUFBZTs7RUFFZixLQUFBLEdBQVE7O0VBS0Y7MEJBQ0osS0FBQSxHQUFPOztJQUVNLHFCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBO01BQ1gsSUFBQyxDQUFBLEtBQUQsR0FBUztNQUVULElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXZCLENBQW5CO0lBTFc7OzBCQU9iLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtBQUFBO0FBQUEsV0FBQSx3REFBQTs7UUFBQSxNQUFNLENBQUMsT0FBUCxDQUFBO0FBQUE7YUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtJQUZPOzswQkFJVCxPQUFBLEdBQVMsU0FBQyxJQUFEO2FBQ1AsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYO0lBRE87OzBCQUdULEdBQUEsR0FBSyxTQUFDLElBQUQ7QUFDSCxVQUFBO01BQUEsSUFBQSxDQUFjLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxDQUFkO0FBQUEsZUFBQTs7TUFDQSxLQUFBLDJDQUFvQixDQUFFLHNCQUFkLENBQUE7TUFDUixJQUFHLGFBQVEsSUFBUixFQUFBLElBQUEsTUFBSDsrQkFDRSxRQUFRLEtBQUssQ0FBQyxLQURoQjtPQUFBLE1BQUE7ZUFHRSxNQUhGOztJQUhHOzswQkFTTCxRQUFBLEdBQVUsU0FBQyxTQUFELEVBQVksT0FBWjtBQUNSLFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxTQUFMO01BQ1IsR0FBQSxHQUFNLElBQUMsQ0FBQSxHQUFELENBQUssT0FBTDtNQUNOLElBQUcsZUFBQSxJQUFXLGFBQWQ7ZUFDTSxJQUFBLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQUROOztJQUhROzswQkFNVixRQUFBLEdBQVUsU0FBQyxTQUFELEVBQVksT0FBWixFQUFxQixLQUFyQjtBQUNSLFVBQUE7TUFBQSxPQUFlLEtBQUssQ0FBQyxVQUFOLENBQWlCLEtBQWpCLENBQWYsRUFBQyxrQkFBRCxFQUFRO01BQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxTQUFMLEVBQWdCLEtBQWhCO2FBQ0EsSUFBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLEVBQWMsR0FBZDtJQUhROzswQkFNVixHQUFBLEdBQUssU0FBQyxJQUFELEVBQU8sS0FBUDtBQUNILFVBQUE7TUFBQSxJQUFBLENBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULENBQWQ7QUFBQSxlQUFBOztNQUNBLElBQW9CLE1BQUEsR0FBUyxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsQ0FBcEM7UUFBQSxNQUFNLENBQUMsT0FBUCxDQUFBLEVBQUE7O01BQ0EsY0FBQSxHQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQTJCLEtBQTNCO01BQ2pCLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQSxDQUFQLEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUEyQixjQUEzQjtNQUNmLEtBQUEsR0FBUTtRQUFDLE1BQUEsSUFBRDtRQUFPLGdCQUFBLGNBQVA7UUFBd0IsUUFBRCxJQUFDLENBQUEsTUFBeEI7O2FBQ1IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBbEIsQ0FBdUIsY0FBdkIsRUFBdUMsS0FBdkM7SUFORzs7Ozs7O0VBUVAsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFyRGpCIiwic291cmNlc0NvbnRlbnQiOlsie1JhbmdlLCBQb2ludCwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5NQVJLUyA9IC8vLyAoXG4gID86IFthLXpdXG4gICB8IFtcXFtcXF1gJy5eKCl7fTw+XVxuKSAvLy9cblxuY2xhc3MgTWFya01hbmFnZXJcbiAgbWFya3M6IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG4gICAgQG1hcmtzID0ge31cblxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgbWFya2VyLmRlc3Ryb3koKSBmb3IgbmFtZSwgbWFya2VyIGluIEBtYXJrc1xuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIGlzVmFsaWQ6IChuYW1lKSAtPlxuICAgIE1BUktTLnRlc3QobmFtZSlcblxuICBnZXQ6IChuYW1lKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGlzVmFsaWQobmFtZSlcbiAgICBwb2ludCA9IEBtYXJrc1tuYW1lXT8uZ2V0U3RhcnRCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgbmFtZSBpbiBcImAnXCJcbiAgICAgIHBvaW50ID8gUG9pbnQuWkVST1xuICAgIGVsc2VcbiAgICAgIHBvaW50XG5cbiAgIyBSZXR1cm4gcmFuZ2UgYmV0d2VlbiBtYXJrc1xuICBnZXRSYW5nZTogKHN0YXJ0TWFyaywgZW5kTWFyaykgLT5cbiAgICBzdGFydCA9IEBnZXQoc3RhcnRNYXJrKVxuICAgIGVuZCA9IEBnZXQoZW5kTWFyaylcbiAgICBpZiBzdGFydD8gYW5kIGVuZD9cbiAgICAgIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuXG4gIHNldFJhbmdlOiAoc3RhcnRNYXJrLCBlbmRNYXJrLCByYW5nZSkgLT5cbiAgICB7c3RhcnQsIGVuZH0gPSBSYW5nZS5mcm9tT2JqZWN0KHJhbmdlKVxuICAgIEBzZXQoc3RhcnRNYXJrLCBzdGFydClcbiAgICBAc2V0KGVuZE1hcmssIGVuZClcblxuICAjIFtGSVhNRV0gTmVlZCB0byBzdXBwb3J0IEdsb2JhbCBtYXJrIHdpdGggY2FwaXRhbCBuYW1lIFtBLVpdXG4gIHNldDogKG5hbWUsIHBvaW50KSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGlzVmFsaWQobmFtZSlcbiAgICBtYXJrZXIuZGVzdHJveSgpIGlmIG1hcmtlciA9IEBtYXJrc1tuYW1lXVxuICAgIGJ1ZmZlclBvc2l0aW9uID0gQGVkaXRvci5jbGlwQnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgQG1hcmtzW25hbWVdID0gQGVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG4gICAgZXZlbnQgPSB7bmFtZSwgYnVmZmVyUG9zaXRpb24sIEBlZGl0b3J9XG4gICAgQHZpbVN0YXRlLmVtaXR0ZXIuZW1pdCgnZGlkLXNldC1tYXJrJywgZXZlbnQpXG5cbm1vZHVsZS5leHBvcnRzID0gTWFya01hbmFnZXJcbiJdfQ==
