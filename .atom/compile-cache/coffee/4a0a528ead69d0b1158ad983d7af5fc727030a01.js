(function() {
  var DotRenderer;

  module.exports = DotRenderer = (function() {
    function DotRenderer() {}

    DotRenderer.prototype.render = function(colorMarker) {
      var charWidth, color, column, index, lineHeight, markers, pixelPosition, range, screenLine, textEditor, textEditorElement;
      range = colorMarker.getScreenRange();
      color = colorMarker.color;
      if (color == null) {
        return {};
      }
      textEditor = colorMarker.colorBuffer.editor;
      textEditorElement = atom.views.getView(textEditor);
      charWidth = textEditor.getDefaultCharWidth();
      markers = colorMarker.colorBuffer.getMarkerLayer().findMarkers({
        type: 'pigments-color',
        intersectsScreenRowRange: [range.end.row, range.end.row]
      });
      index = markers.indexOf(colorMarker.marker);
      screenLine = this.screenLineForScreenRow(textEditor, range.end.row);
      if (screenLine == null) {
        return {};
      }
      lineHeight = textEditor.getLineHeightInPixels();
      column = this.getLineLastColumn(screenLine) * charWidth;
      pixelPosition = textEditorElement.pixelPositionForScreenPosition(range.end);
      return {
        "class": 'dot',
        style: {
          backgroundColor: color.toCSS(),
          top: (pixelPosition.top + lineHeight / 2) + 'px',
          left: (column + index * 18) + 'px'
        }
      };
    };

    DotRenderer.prototype.getLineLastColumn = function(line) {
      if (line.lineText != null) {
        return line.lineText.length + 1;
      } else {
        return line.getMaxScreenColumn() + 1;
      }
    };

    DotRenderer.prototype.screenLineForScreenRow = function(textEditor, row) {
      if (textEditor.screenLineForScreenRow != null) {
        return textEditor.screenLineForScreenRow(row);
      } else {
        return textEditor.displayBuffer.screenLines[row];
      }
    };

    return DotRenderer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3JlbmRlcmVycy9kb3QuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLFdBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNOzZCQUNKOztBQUFBLDBCQUFBLE1BQUEsR0FBUSxTQUFDLFdBQUQsR0FBQTtBQUNOLFVBQUEscUhBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxXQUFXLENBQUMsY0FBWixDQUFBLENBQVIsQ0FBQTtBQUFBLE1BRUEsS0FBQSxHQUFRLFdBQVcsQ0FBQyxLQUZwQixDQUFBO0FBSUEsTUFBQSxJQUFpQixhQUFqQjtBQUFBLGVBQU8sRUFBUCxDQUFBO09BSkE7QUFBQSxNQU1BLFVBQUEsR0FBYSxXQUFXLENBQUMsV0FBVyxDQUFDLE1BTnJDLENBQUE7QUFBQSxNQU9BLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixVQUFuQixDQVBwQixDQUFBO0FBQUEsTUFRQSxTQUFBLEdBQVksVUFBVSxDQUFDLG1CQUFYLENBQUEsQ0FSWixDQUFBO0FBQUEsTUFVQSxPQUFBLEdBQVUsV0FBVyxDQUFDLFdBQVcsQ0FBQyxjQUF4QixDQUFBLENBQXdDLENBQUMsV0FBekMsQ0FBcUQ7QUFBQSxRQUM3RCxJQUFBLEVBQU0sZ0JBRHVEO0FBQUEsUUFFN0Qsd0JBQUEsRUFBMEIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQVgsRUFBZ0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUExQixDQUZtQztPQUFyRCxDQVZWLENBQUE7QUFBQSxNQWVBLEtBQUEsR0FBUSxPQUFPLENBQUMsT0FBUixDQUFnQixXQUFXLENBQUMsTUFBNUIsQ0FmUixDQUFBO0FBQUEsTUFnQkEsVUFBQSxHQUFhLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixVQUF4QixFQUFvQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQTlDLENBaEJiLENBQUE7QUFrQkEsTUFBQSxJQUFpQixrQkFBakI7QUFBQSxlQUFPLEVBQVAsQ0FBQTtPQWxCQTtBQUFBLE1Bb0JBLFVBQUEsR0FBYSxVQUFVLENBQUMscUJBQVgsQ0FBQSxDQXBCYixDQUFBO0FBQUEsTUFxQkEsTUFBQSxHQUFTLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixVQUFuQixDQUFBLEdBQWlDLFNBckIxQyxDQUFBO0FBQUEsTUFzQkEsYUFBQSxHQUFnQixpQkFBaUIsQ0FBQyw4QkFBbEIsQ0FBaUQsS0FBSyxDQUFDLEdBQXZELENBdEJoQixDQUFBO2FBd0JBO0FBQUEsUUFBQSxPQUFBLEVBQU8sS0FBUDtBQUFBLFFBQ0EsS0FBQSxFQUNFO0FBQUEsVUFBQSxlQUFBLEVBQWlCLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FBakI7QUFBQSxVQUNBLEdBQUEsRUFBSyxDQUFDLGFBQWEsQ0FBQyxHQUFkLEdBQW9CLFVBQUEsR0FBYSxDQUFsQyxDQUFBLEdBQXVDLElBRDVDO0FBQUEsVUFFQSxJQUFBLEVBQU0sQ0FBQyxNQUFBLEdBQVMsS0FBQSxHQUFRLEVBQWxCLENBQUEsR0FBd0IsSUFGOUI7U0FGRjtRQXpCTTtJQUFBLENBQVIsQ0FBQTs7QUFBQSwwQkErQkEsaUJBQUEsR0FBbUIsU0FBQyxJQUFELEdBQUE7QUFDakIsTUFBQSxJQUFHLHFCQUFIO2VBQ0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFkLEdBQXVCLEVBRHpCO09BQUEsTUFBQTtlQUdFLElBQUksQ0FBQyxrQkFBTCxDQUFBLENBQUEsR0FBNEIsRUFIOUI7T0FEaUI7SUFBQSxDQS9CbkIsQ0FBQTs7QUFBQSwwQkFxQ0Esc0JBQUEsR0FBd0IsU0FBQyxVQUFELEVBQWEsR0FBYixHQUFBO0FBQ3RCLE1BQUEsSUFBRyx5Q0FBSDtlQUNFLFVBQVUsQ0FBQyxzQkFBWCxDQUFrQyxHQUFsQyxFQURGO09BQUEsTUFBQTtlQUdFLFVBQVUsQ0FBQyxhQUFhLENBQUMsV0FBWSxDQUFBLEdBQUEsRUFIdkM7T0FEc0I7SUFBQSxDQXJDeEIsQ0FBQTs7dUJBQUE7O01BRkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/renderers/dot.coffee
