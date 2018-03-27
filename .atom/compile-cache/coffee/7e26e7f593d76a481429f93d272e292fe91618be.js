(function() {
  var Scroll, ScrollCursor, ScrollCursorToBottom, ScrollCursorToLeft, ScrollCursorToMiddle, ScrollCursorToRight, ScrollCursorToTop, ScrollDown, ScrollHorizontal, ScrollUp,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Scroll = (function() {
    Scroll.prototype.isComplete = function() {
      return true;
    };

    Scroll.prototype.isRecordable = function() {
      return false;
    };

    function Scroll(editorElement) {
      this.editorElement = editorElement;
      this.scrolloff = 2;
      this.editor = this.editorElement.getModel();
      this.rows = {
        first: this.editorElement.getFirstVisibleScreenRow(),
        last: this.editorElement.getLastVisibleScreenRow(),
        final: this.editor.getLastScreenRow()
      };
    }

    return Scroll;

  })();

  ScrollDown = (function(_super) {
    __extends(ScrollDown, _super);

    function ScrollDown() {
      return ScrollDown.__super__.constructor.apply(this, arguments);
    }

    ScrollDown.prototype.execute = function(count) {
      var cursor, newFirstRow, oldFirstRow, position, _i, _len, _ref;
      if (count == null) {
        count = 1;
      }
      oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow + count);
      newFirstRow = this.editor.getFirstVisibleScreenRow();
      _ref = this.editor.getCursors();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cursor = _ref[_i];
        position = cursor.getScreenPosition();
        if (position.row <= newFirstRow + this.scrolloff) {
          cursor.setScreenPosition([position.row + newFirstRow - oldFirstRow, position.column], {
            autoscroll: false
          });
        }
      }
      this.editorElement.component.updateSync();
    };

    return ScrollDown;

  })(Scroll);

  ScrollUp = (function(_super) {
    __extends(ScrollUp, _super);

    function ScrollUp() {
      return ScrollUp.__super__.constructor.apply(this, arguments);
    }

    ScrollUp.prototype.execute = function(count) {
      var cursor, newLastRow, oldFirstRow, oldLastRow, position, _i, _len, _ref;
      if (count == null) {
        count = 1;
      }
      oldFirstRow = this.editor.getFirstVisibleScreenRow();
      oldLastRow = this.editor.getLastVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow - count);
      newLastRow = this.editor.getLastVisibleScreenRow();
      _ref = this.editor.getCursors();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cursor = _ref[_i];
        position = cursor.getScreenPosition();
        if (position.row >= newLastRow - this.scrolloff) {
          cursor.setScreenPosition([position.row - (oldLastRow - newLastRow), position.column], {
            autoscroll: false
          });
        }
      }
      this.editorElement.component.updateSync();
    };

    return ScrollUp;

  })(Scroll);

  ScrollCursor = (function(_super) {
    __extends(ScrollCursor, _super);

    function ScrollCursor(editorElement, opts) {
      var cursor;
      this.editorElement = editorElement;
      this.opts = opts != null ? opts : {};
      ScrollCursor.__super__.constructor.apply(this, arguments);
      cursor = this.editor.getCursorScreenPosition();
      this.pixel = this.editorElement.pixelPositionForScreenPosition(cursor).top;
    }

    return ScrollCursor;

  })(Scroll);

  ScrollCursorToTop = (function(_super) {
    __extends(ScrollCursorToTop, _super);

    function ScrollCursorToTop() {
      return ScrollCursorToTop.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToTop.prototype.execute = function() {
      if (!this.opts.leaveCursor) {
        this.moveToFirstNonBlank();
      }
      return this.scrollUp();
    };

    ScrollCursorToTop.prototype.scrollUp = function() {
      if (this.rows.last === this.rows.final) {
        return;
      }
      this.pixel -= this.editor.getLineHeightInPixels() * this.scrolloff;
      return this.editorElement.setScrollTop(this.pixel);
    };

    ScrollCursorToTop.prototype.moveToFirstNonBlank = function() {
      return this.editor.moveToFirstCharacterOfLine();
    };

    return ScrollCursorToTop;

  })(ScrollCursor);

  ScrollCursorToMiddle = (function(_super) {
    __extends(ScrollCursorToMiddle, _super);

    function ScrollCursorToMiddle() {
      return ScrollCursorToMiddle.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToMiddle.prototype.execute = function() {
      if (!this.opts.leaveCursor) {
        this.moveToFirstNonBlank();
      }
      return this.scrollMiddle();
    };

    ScrollCursorToMiddle.prototype.scrollMiddle = function() {
      this.pixel -= this.editorElement.getHeight() / 2;
      return this.editorElement.setScrollTop(this.pixel);
    };

    ScrollCursorToMiddle.prototype.moveToFirstNonBlank = function() {
      return this.editor.moveToFirstCharacterOfLine();
    };

    return ScrollCursorToMiddle;

  })(ScrollCursor);

  ScrollCursorToBottom = (function(_super) {
    __extends(ScrollCursorToBottom, _super);

    function ScrollCursorToBottom() {
      return ScrollCursorToBottom.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToBottom.prototype.execute = function() {
      if (!this.opts.leaveCursor) {
        this.moveToFirstNonBlank();
      }
      return this.scrollDown();
    };

    ScrollCursorToBottom.prototype.scrollDown = function() {
      var offset;
      if (this.rows.first === 0) {
        return;
      }
      offset = this.editor.getLineHeightInPixels() * (this.scrolloff + 1);
      this.pixel -= this.editorElement.getHeight() - offset;
      return this.editorElement.setScrollTop(this.pixel);
    };

    ScrollCursorToBottom.prototype.moveToFirstNonBlank = function() {
      return this.editor.moveToFirstCharacterOfLine();
    };

    return ScrollCursorToBottom;

  })(ScrollCursor);

  ScrollHorizontal = (function() {
    ScrollHorizontal.prototype.isComplete = function() {
      return true;
    };

    ScrollHorizontal.prototype.isRecordable = function() {
      return false;
    };

    function ScrollHorizontal(editorElement) {
      var cursorPos;
      this.editorElement = editorElement;
      this.editor = this.editorElement.getModel();
      cursorPos = this.editor.getCursorScreenPosition();
      this.pixel = this.editorElement.pixelPositionForScreenPosition(cursorPos).left;
      this.cursor = this.editor.getLastCursor();
    }

    ScrollHorizontal.prototype.putCursorOnScreen = function() {
      return this.editor.scrollToCursorPosition({
        center: false
      });
    };

    return ScrollHorizontal;

  })();

  ScrollCursorToLeft = (function(_super) {
    __extends(ScrollCursorToLeft, _super);

    function ScrollCursorToLeft() {
      return ScrollCursorToLeft.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToLeft.prototype.execute = function() {
      this.editorElement.setScrollLeft(this.pixel);
      return this.putCursorOnScreen();
    };

    return ScrollCursorToLeft;

  })(ScrollHorizontal);

  ScrollCursorToRight = (function(_super) {
    __extends(ScrollCursorToRight, _super);

    function ScrollCursorToRight() {
      return ScrollCursorToRight.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToRight.prototype.execute = function() {
      this.editorElement.setScrollRight(this.pixel);
      return this.putCursorOnScreen();
    };

    return ScrollCursorToRight;

  })(ScrollHorizontal);

  module.exports = {
    ScrollDown: ScrollDown,
    ScrollUp: ScrollUp,
    ScrollCursorToTop: ScrollCursorToTop,
    ScrollCursorToMiddle: ScrollCursorToMiddle,
    ScrollCursorToBottom: ScrollCursorToBottom,
    ScrollCursorToLeft: ScrollCursorToLeft,
    ScrollCursorToRight: ScrollCursorToRight
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3Njcm9sbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0tBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFNO0FBQ0oscUJBQUEsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUFHLEtBQUg7SUFBQSxDQUFaLENBQUE7O0FBQUEscUJBQ0EsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUFHLE1BQUg7SUFBQSxDQURkLENBQUE7O0FBRWEsSUFBQSxnQkFBRSxhQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxnQkFBQSxhQUNiLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBYixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxhQUFhLENBQUMsUUFBZixDQUFBLENBRFYsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLElBQUQsR0FDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLElBQUMsQ0FBQSxhQUFhLENBQUMsd0JBQWYsQ0FBQSxDQUFQO0FBQUEsUUFDQSxJQUFBLEVBQU0sSUFBQyxDQUFBLGFBQWEsQ0FBQyx1QkFBZixDQUFBLENBRE47QUFBQSxRQUVBLEtBQUEsRUFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUEsQ0FGUDtPQUhGLENBRFc7SUFBQSxDQUZiOztrQkFBQTs7TUFERixDQUFBOztBQUFBLEVBV007QUFDSixpQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEseUJBQUEsT0FBQSxHQUFTLFNBQUMsS0FBRCxHQUFBO0FBQ1AsVUFBQSwwREFBQTs7UUFEUSxRQUFNO09BQ2Q7QUFBQSxNQUFBLFdBQUEsR0FBYyxJQUFDLENBQUEsTUFBTSxDQUFDLHdCQUFSLENBQUEsQ0FBZCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLHdCQUFSLENBQWlDLFdBQUEsR0FBYyxLQUEvQyxDQURBLENBQUE7QUFBQSxNQUVBLFdBQUEsR0FBYyxJQUFDLENBQUEsTUFBTSxDQUFDLHdCQUFSLENBQUEsQ0FGZCxDQUFBO0FBSUE7QUFBQSxXQUFBLDJDQUFBOzBCQUFBO0FBQ0UsUUFBQSxRQUFBLEdBQVcsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBWCxDQUFBO0FBQ0EsUUFBQSxJQUFHLFFBQVEsQ0FBQyxHQUFULElBQWdCLFdBQUEsR0FBYyxJQUFDLENBQUEsU0FBbEM7QUFDRSxVQUFBLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixDQUFDLFFBQVEsQ0FBQyxHQUFULEdBQWUsV0FBZixHQUE2QixXQUE5QixFQUEyQyxRQUFRLENBQUMsTUFBcEQsQ0FBekIsRUFBc0Y7QUFBQSxZQUFBLFVBQUEsRUFBWSxLQUFaO1dBQXRGLENBQUEsQ0FERjtTQUZGO0FBQUEsT0FKQTtBQUFBLE1BV0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsVUFBekIsQ0FBQSxDQVhBLENBRE87SUFBQSxDQUFULENBQUE7O3NCQUFBOztLQUR1QixPQVh6QixDQUFBOztBQUFBLEVBNEJNO0FBQ0osK0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHVCQUFBLE9BQUEsR0FBUyxTQUFDLEtBQUQsR0FBQTtBQUNQLFVBQUEscUVBQUE7O1FBRFEsUUFBTTtPQUNkO0FBQUEsTUFBQSxXQUFBLEdBQWMsSUFBQyxDQUFBLE1BQU0sQ0FBQyx3QkFBUixDQUFBLENBQWQsQ0FBQTtBQUFBLE1BQ0EsVUFBQSxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxDQURiLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsd0JBQVIsQ0FBaUMsV0FBQSxHQUFjLEtBQS9DLENBRkEsQ0FBQTtBQUFBLE1BR0EsVUFBQSxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxDQUhiLENBQUE7QUFLQTtBQUFBLFdBQUEsMkNBQUE7MEJBQUE7QUFDRSxRQUFBLFFBQUEsR0FBVyxNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUFYLENBQUE7QUFDQSxRQUFBLElBQUcsUUFBUSxDQUFDLEdBQVQsSUFBZ0IsVUFBQSxHQUFhLElBQUMsQ0FBQSxTQUFqQztBQUNFLFVBQUEsTUFBTSxDQUFDLGlCQUFQLENBQXlCLENBQUMsUUFBUSxDQUFDLEdBQVQsR0FBZSxDQUFDLFVBQUEsR0FBYSxVQUFkLENBQWhCLEVBQTJDLFFBQVEsQ0FBQyxNQUFwRCxDQUF6QixFQUFzRjtBQUFBLFlBQUEsVUFBQSxFQUFZLEtBQVo7V0FBdEYsQ0FBQSxDQURGO1NBRkY7QUFBQSxPQUxBO0FBQUEsTUFZQSxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxVQUF6QixDQUFBLENBWkEsQ0FETztJQUFBLENBQVQsQ0FBQTs7b0JBQUE7O0tBRHFCLE9BNUJ2QixDQUFBOztBQUFBLEVBOENNO0FBQ0osbUNBQUEsQ0FBQTs7QUFBYSxJQUFBLHNCQUFFLGFBQUYsRUFBa0IsSUFBbEIsR0FBQTtBQUNYLFVBQUEsTUFBQTtBQUFBLE1BRFksSUFBQyxDQUFBLGdCQUFBLGFBQ2IsQ0FBQTtBQUFBLE1BRDRCLElBQUMsQ0FBQSxzQkFBQSxPQUFLLEVBQ2xDLENBQUE7QUFBQSxNQUFBLCtDQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBRFQsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsYUFBYSxDQUFDLDhCQUFmLENBQThDLE1BQTlDLENBQXFELENBQUMsR0FGL0QsQ0FEVztJQUFBLENBQWI7O3dCQUFBOztLQUR5QixPQTlDM0IsQ0FBQTs7QUFBQSxFQW9ETTtBQUNKLHdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxnQ0FBQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFBLENBQUEsSUFBK0IsQ0FBQSxJQUFJLENBQUMsV0FBcEM7QUFBQSxRQUFBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQUEsQ0FBQTtPQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBQSxFQUZPO0lBQUEsQ0FBVCxDQUFBOztBQUFBLGdDQUlBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQVUsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLEtBQWMsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUE5QjtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBRCxJQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQVIsQ0FBQSxDQUFBLEdBQWtDLElBQUMsQ0FBQSxTQUQ5QyxDQUFBO2FBRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxZQUFmLENBQTRCLElBQUMsQ0FBQSxLQUE3QixFQUhRO0lBQUEsQ0FKVixDQUFBOztBQUFBLGdDQVNBLG1CQUFBLEdBQXFCLFNBQUEsR0FBQTthQUNuQixJQUFDLENBQUEsTUFBTSxDQUFDLDBCQUFSLENBQUEsRUFEbUI7SUFBQSxDQVRyQixDQUFBOzs2QkFBQTs7S0FEOEIsYUFwRGhDLENBQUE7O0FBQUEsRUFpRU07QUFDSiwyQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsbUNBQUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQSxDQUFBLElBQStCLENBQUEsSUFBSSxDQUFDLFdBQXBDO0FBQUEsUUFBQSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUFBLENBQUE7T0FBQTthQUNBLElBQUMsQ0FBQSxZQUFELENBQUEsRUFGTztJQUFBLENBQVQsQ0FBQTs7QUFBQSxtQ0FJQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osTUFBQSxJQUFDLENBQUEsS0FBRCxJQUFXLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBZixDQUFBLENBQUEsR0FBNkIsQ0FBeEMsQ0FBQTthQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsWUFBZixDQUE0QixJQUFDLENBQUEsS0FBN0IsRUFGWTtJQUFBLENBSmQsQ0FBQTs7QUFBQSxtQ0FRQSxtQkFBQSxHQUFxQixTQUFBLEdBQUE7YUFDbkIsSUFBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFBLEVBRG1CO0lBQUEsQ0FSckIsQ0FBQTs7Z0NBQUE7O0tBRGlDLGFBakVuQyxDQUFBOztBQUFBLEVBNkVNO0FBQ0osMkNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLG1DQUFBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUEsQ0FBQSxJQUErQixDQUFBLElBQUksQ0FBQyxXQUFwQztBQUFBLFFBQUEsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FBQSxDQUFBO09BQUE7YUFDQSxJQUFDLENBQUEsVUFBRCxDQUFBLEVBRk87SUFBQSxDQUFULENBQUE7O0FBQUEsbUNBSUEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsTUFBQTtBQUFBLE1BQUEsSUFBVSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sS0FBZSxDQUF6QjtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBUixDQUFBLENBQUEsR0FBa0MsQ0FBQyxJQUFDLENBQUEsU0FBRCxHQUFhLENBQWQsQ0FENUMsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLEtBQUQsSUFBVyxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQWYsQ0FBQSxDQUFBLEdBQTZCLE1BRnhDLENBQUE7YUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLFlBQWYsQ0FBNEIsSUFBQyxDQUFBLEtBQTdCLEVBSlU7SUFBQSxDQUpaLENBQUE7O0FBQUEsbUNBVUEsbUJBQUEsR0FBcUIsU0FBQSxHQUFBO2FBQ25CLElBQUMsQ0FBQSxNQUFNLENBQUMsMEJBQVIsQ0FBQSxFQURtQjtJQUFBLENBVnJCLENBQUE7O2dDQUFBOztLQURpQyxhQTdFbkMsQ0FBQTs7QUFBQSxFQTJGTTtBQUNKLCtCQUFBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFBRyxLQUFIO0lBQUEsQ0FBWixDQUFBOztBQUFBLCtCQUNBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFBRyxNQUFIO0lBQUEsQ0FEZCxDQUFBOztBQUVhLElBQUEsMEJBQUUsYUFBRixHQUFBO0FBQ1gsVUFBQSxTQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsZ0JBQUEsYUFDYixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxhQUFhLENBQUMsUUFBZixDQUFBLENBQVYsQ0FBQTtBQUFBLE1BQ0EsU0FBQSxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxDQURaLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLGFBQWEsQ0FBQyw4QkFBZixDQUE4QyxTQUE5QyxDQUF3RCxDQUFDLElBRmxFLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FIVixDQURXO0lBQUEsQ0FGYjs7QUFBQSwrQkFRQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7YUFDakIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxzQkFBUixDQUErQjtBQUFBLFFBQUMsTUFBQSxFQUFRLEtBQVQ7T0FBL0IsRUFEaUI7SUFBQSxDQVJuQixDQUFBOzs0QkFBQTs7TUE1RkYsQ0FBQTs7QUFBQSxFQXVHTTtBQUNKLHlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxpQ0FBQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLGFBQWYsQ0FBNkIsSUFBQyxDQUFBLEtBQTlCLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBRk87SUFBQSxDQUFULENBQUE7OzhCQUFBOztLQUQrQixpQkF2R2pDLENBQUE7O0FBQUEsRUE0R007QUFDSiwwQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsa0NBQUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxjQUFmLENBQThCLElBQUMsQ0FBQSxLQUEvQixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQUZPO0lBQUEsQ0FBVCxDQUFBOzsrQkFBQTs7S0FEZ0MsaUJBNUdsQyxDQUFBOztBQUFBLEVBaUhBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFBQyxZQUFBLFVBQUQ7QUFBQSxJQUFhLFVBQUEsUUFBYjtBQUFBLElBQXVCLG1CQUFBLGlCQUF2QjtBQUFBLElBQTBDLHNCQUFBLG9CQUExQztBQUFBLElBQ2Ysc0JBQUEsb0JBRGU7QUFBQSxJQUNPLG9CQUFBLGtCQURQO0FBQUEsSUFDMkIscUJBQUEsbUJBRDNCO0dBakhqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/scroll.coffee
