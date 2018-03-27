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
      var bufferPosition, event;
      if (!this.isValid(name)) {
        return;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWFyay1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMERBQUE7SUFBQTs7RUFBQSxNQUFzQyxPQUFBLENBQVEsTUFBUixDQUF0QyxFQUFDLGlCQUFELEVBQVEsaUJBQVIsRUFBZTs7RUFFZixLQUFBLEdBQVE7O0VBS0Y7MEJBQ0osS0FBQSxHQUFPOztJQUVNLHFCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBO01BQ1gsSUFBQyxDQUFBLEtBQUQsR0FBUztNQUVULElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXZCLENBQW5CO0lBTFc7OzBCQU9iLE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFETzs7MEJBR1QsT0FBQSxHQUFTLFNBQUMsSUFBRDthQUNQLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtJQURPOzswQkFHVCxHQUFBLEdBQUssU0FBQyxJQUFEO0FBQ0gsVUFBQTtNQUFBLElBQUEsQ0FBYyxJQUFDLENBQUEsT0FBRCxDQUFTLElBQVQsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsS0FBQSwyQ0FBb0IsQ0FBRSxzQkFBZCxDQUFBO01BQ1IsSUFBRyxhQUFRLElBQVIsRUFBQSxJQUFBLE1BQUg7K0JBQ0UsUUFBUSxLQUFLLENBQUMsS0FEaEI7T0FBQSxNQUFBO2VBR0UsTUFIRjs7SUFIRzs7MEJBU0wsUUFBQSxHQUFVLFNBQUMsU0FBRCxFQUFZLE9BQVo7QUFDUixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxHQUFELENBQUssU0FBTDtNQUNSLEdBQUEsR0FBTSxJQUFDLENBQUEsR0FBRCxDQUFLLE9BQUw7TUFDTixJQUFHLGVBQUEsSUFBVyxhQUFkO2VBQ00sSUFBQSxLQUFBLENBQU0sS0FBTixFQUFhLEdBQWIsRUFETjs7SUFIUTs7MEJBTVYsUUFBQSxHQUFVLFNBQUMsU0FBRCxFQUFZLE9BQVosRUFBcUIsS0FBckI7QUFDUixVQUFBO01BQUEsT0FBZSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQixDQUFmLEVBQUMsa0JBQUQsRUFBUTtNQUNSLElBQUMsQ0FBQSxHQUFELENBQUssU0FBTCxFQUFnQixLQUFoQjthQUNBLElBQUMsQ0FBQSxHQUFELENBQUssT0FBTCxFQUFjLEdBQWQ7SUFIUTs7MEJBTVYsR0FBQSxHQUFLLFNBQUMsSUFBRCxFQUFPLEtBQVA7QUFDSCxVQUFBO01BQUEsSUFBQSxDQUFjLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxDQUFkO0FBQUEsZUFBQTs7TUFDQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBMkIsS0FBM0I7TUFDakIsSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBLENBQVAsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQTJCLGNBQTNCO01BQ2YsS0FBQSxHQUFRO1FBQUMsTUFBQSxJQUFEO1FBQU8sZ0JBQUEsY0FBUDtRQUF3QixRQUFELElBQUMsQ0FBQSxNQUF4Qjs7YUFDUixJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFsQixDQUF1QixjQUF2QixFQUF1QyxLQUF2QztJQUxHOzs7Ozs7RUFPUCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQW5EakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2UsIFBvaW50LCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbk1BUktTID0gLy8vIChcbiAgPzogW2Etel1cbiAgIHwgW1xcW1xcXWAnLl4oKXt9PD5dXG4pIC8vL1xuXG5jbGFzcyBNYXJrTWFuYWdlclxuICBtYXJrczogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAbWFya3MgPSB7fVxuXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICBpc1ZhbGlkOiAobmFtZSkgLT5cbiAgICBNQVJLUy50ZXN0KG5hbWUpXG5cbiAgZ2V0OiAobmFtZSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpc1ZhbGlkKG5hbWUpXG4gICAgcG9pbnQgPSBAbWFya3NbbmFtZV0/LmdldFN0YXJ0QnVmZmVyUG9zaXRpb24oKVxuICAgIGlmIG5hbWUgaW4gXCJgJ1wiXG4gICAgICBwb2ludCA/IFBvaW50LlpFUk9cbiAgICBlbHNlXG4gICAgICBwb2ludFxuXG4gICMgUmV0dXJuIHJhbmdlIGJldHdlZW4gbWFya3NcbiAgZ2V0UmFuZ2U6IChzdGFydE1hcmssIGVuZE1hcmspIC0+XG4gICAgc3RhcnQgPSBAZ2V0KHN0YXJ0TWFyaylcbiAgICBlbmQgPSBAZ2V0KGVuZE1hcmspXG4gICAgaWYgc3RhcnQ/IGFuZCBlbmQ/XG4gICAgICBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcblxuICBzZXRSYW5nZTogKHN0YXJ0TWFyaywgZW5kTWFyaywgcmFuZ2UpIC0+XG4gICAge3N0YXJ0LCBlbmR9ID0gUmFuZ2UuZnJvbU9iamVjdChyYW5nZSlcbiAgICBAc2V0KHN0YXJ0TWFyaywgc3RhcnQpXG4gICAgQHNldChlbmRNYXJrLCBlbmQpXG5cbiAgIyBbRklYTUVdIE5lZWQgdG8gc3VwcG9ydCBHbG9iYWwgbWFyayB3aXRoIGNhcGl0YWwgbmFtZSBbQS1aXVxuICBzZXQ6IChuYW1lLCBwb2ludCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpc1ZhbGlkKG5hbWUpXG4gICAgYnVmZmVyUG9zaXRpb24gPSBAZWRpdG9yLmNsaXBCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICBAbWFya3NbbmFtZV0gPSBAZWRpdG9yLm1hcmtCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcbiAgICBldmVudCA9IHtuYW1lLCBidWZmZXJQb3NpdGlvbiwgQGVkaXRvcn1cbiAgICBAdmltU3RhdGUuZW1pdHRlci5lbWl0KCdkaWQtc2V0LW1hcmsnLCBldmVudClcblxubW9kdWxlLmV4cG9ydHMgPSBNYXJrTWFuYWdlclxuIl19
