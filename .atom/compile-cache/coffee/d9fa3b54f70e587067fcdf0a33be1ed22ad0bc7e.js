(function() {
  var DotRenderer;

  module.exports = DotRenderer = (function() {
    function DotRenderer() {}

    DotRenderer.prototype.render = function(colorMarker) {
      var charWidth, color, column, displayBuffer, index, lineHeight, markers, pixelPosition, range, screenLine, textEditor, textEditorElement;
      range = colorMarker.getScreenRange();
      color = colorMarker.color;
      if (color == null) {
        return {};
      }
      textEditor = colorMarker.colorBuffer.editor;
      textEditorElement = atom.views.getView(textEditor);
      displayBuffer = colorMarker.marker.displayBuffer;
      charWidth = displayBuffer.getDefaultCharWidth();
      markers = colorMarker.colorBuffer.getMarkerLayer().findMarkers({
        type: 'pigments-color',
        intersectsScreenRowRange: [range.end.row, range.end.row]
      });
      index = markers.indexOf(colorMarker.marker);
      screenLine = displayBuffer.screenLines[range.end.row];
      if (screenLine == null) {
        return {};
      }
      lineHeight = textEditor.getLineHeightInPixels();
      column = (screenLine.getMaxScreenColumn() + 1) * charWidth;
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

    return DotRenderer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3JlbmRlcmVycy9kb3QuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLFdBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNOzZCQUNKOztBQUFBLDBCQUFBLE1BQUEsR0FBUSxTQUFDLFdBQUQsR0FBQTtBQUNOLFVBQUEsb0lBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxXQUFXLENBQUMsY0FBWixDQUFBLENBQVIsQ0FBQTtBQUFBLE1BRUEsS0FBQSxHQUFRLFdBQVcsQ0FBQyxLQUZwQixDQUFBO0FBSUEsTUFBQSxJQUFpQixhQUFqQjtBQUFBLGVBQU8sRUFBUCxDQUFBO09BSkE7QUFBQSxNQU1BLFVBQUEsR0FBYSxXQUFXLENBQUMsV0FBVyxDQUFDLE1BTnJDLENBQUE7QUFBQSxNQU9BLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixVQUFuQixDQVBwQixDQUFBO0FBQUEsTUFRQSxhQUFBLEdBQWdCLFdBQVcsQ0FBQyxNQUFNLENBQUMsYUFSbkMsQ0FBQTtBQUFBLE1BU0EsU0FBQSxHQUFZLGFBQWEsQ0FBQyxtQkFBZCxDQUFBLENBVFosQ0FBQTtBQUFBLE1BV0EsT0FBQSxHQUFVLFdBQVcsQ0FBQyxXQUFXLENBQUMsY0FBeEIsQ0FBQSxDQUF3QyxDQUFDLFdBQXpDLENBQXFEO0FBQUEsUUFDN0QsSUFBQSxFQUFNLGdCQUR1RDtBQUFBLFFBRTdELHdCQUFBLEVBQTBCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFYLEVBQWdCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBMUIsQ0FGbUM7T0FBckQsQ0FYVixDQUFBO0FBQUEsTUFnQkEsS0FBQSxHQUFRLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFdBQVcsQ0FBQyxNQUE1QixDQWhCUixDQUFBO0FBQUEsTUFpQkEsVUFBQSxHQUFhLGFBQWEsQ0FBQyxXQUFZLENBQUEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFWLENBakJ2QyxDQUFBO0FBbUJBLE1BQUEsSUFBaUIsa0JBQWpCO0FBQUEsZUFBTyxFQUFQLENBQUE7T0FuQkE7QUFBQSxNQXFCQSxVQUFBLEdBQWEsVUFBVSxDQUFDLHFCQUFYLENBQUEsQ0FyQmIsQ0FBQTtBQUFBLE1Bc0JBLE1BQUEsR0FBUyxDQUFDLFVBQVUsQ0FBQyxrQkFBWCxDQUFBLENBQUEsR0FBa0MsQ0FBbkMsQ0FBQSxHQUF3QyxTQXRCakQsQ0FBQTtBQUFBLE1BdUJBLGFBQUEsR0FBZ0IsaUJBQWlCLENBQUMsOEJBQWxCLENBQWlELEtBQUssQ0FBQyxHQUF2RCxDQXZCaEIsQ0FBQTthQXlCQTtBQUFBLFFBQUEsT0FBQSxFQUFPLEtBQVA7QUFBQSxRQUNBLEtBQUEsRUFDRTtBQUFBLFVBQUEsZUFBQSxFQUFpQixLQUFLLENBQUMsS0FBTixDQUFBLENBQWpCO0FBQUEsVUFDQSxHQUFBLEVBQUssQ0FBQyxhQUFhLENBQUMsR0FBZCxHQUFvQixVQUFBLEdBQWEsQ0FBbEMsQ0FBQSxHQUF1QyxJQUQ1QztBQUFBLFVBRUEsSUFBQSxFQUFNLENBQUMsTUFBQSxHQUFTLEtBQUEsR0FBUSxFQUFsQixDQUFBLEdBQXdCLElBRjlCO1NBRkY7UUExQk07SUFBQSxDQUFSLENBQUE7O3VCQUFBOztNQUZGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/renderers/dot.coffee
