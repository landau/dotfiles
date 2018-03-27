(function() {
  var RegionRenderer;

  module.exports = RegionRenderer = (function() {
    function RegionRenderer() {}

    RegionRenderer.prototype.includeTextInRegion = false;

    RegionRenderer.prototype.renderRegions = function(colorMarker) {
      var displayBuffer, range, regions, row, rowSpan, _i, _ref, _ref1;
      range = colorMarker.getScreenRange();
      if (range.isEmpty()) {
        return [];
      }
      rowSpan = range.end.row - range.start.row;
      regions = [];
      displayBuffer = colorMarker.marker.displayBuffer;
      if (rowSpan === 0) {
        regions.push(this.createRegion(range.start, range.end, colorMarker));
      } else {
        regions.push(this.createRegion(range.start, {
          row: range.start.row,
          column: Infinity
        }, colorMarker, displayBuffer.screenLines[range.start.row]));
        if (rowSpan > 1) {
          for (row = _i = _ref = range.start.row + 1, _ref1 = range.end.row; _ref <= _ref1 ? _i < _ref1 : _i > _ref1; row = _ref <= _ref1 ? ++_i : --_i) {
            regions.push(this.createRegion({
              row: row,
              column: 0
            }, {
              row: row,
              column: Infinity
            }, colorMarker, displayBuffer.screenLines[row]));
          }
        }
        regions.push(this.createRegion({
          row: range.end.row,
          column: 0
        }, range.end, colorMarker, displayBuffer.screenLines[range.end.row]));
      }
      return regions;
    };

    RegionRenderer.prototype.createRegion = function(start, end, colorMarker, screenLine) {
      var bufferRange, charWidth, clippedEnd, clippedStart, css, displayBuffer, endPosition, lineHeight, name, needAdjustment, region, startPosition, text, textEditor, textEditorElement, value, _ref, _ref1;
      textEditor = colorMarker.colorBuffer.editor;
      textEditorElement = atom.views.getView(textEditor);
      displayBuffer = colorMarker.marker.displayBuffer;
      if (textEditorElement.component == null) {
        return;
      }
      lineHeight = textEditor.getLineHeightInPixels();
      charWidth = textEditor.getDefaultCharWidth();
      clippedStart = {
        row: start.row,
        column: (_ref = screenLine != null ? screenLine.clipScreenColumn(start.column) : void 0) != null ? _ref : start.column
      };
      clippedEnd = {
        row: end.row,
        column: (_ref1 = screenLine != null ? screenLine.clipScreenColumn(end.column) : void 0) != null ? _ref1 : end.column
      };
      bufferRange = displayBuffer.bufferRangeForScreenRange({
        start: clippedStart,
        end: clippedEnd
      });
      needAdjustment = (screenLine != null ? screenLine.isSoftWrapped() : void 0) && end.column >= (screenLine != null ? screenLine.text.length : void 0) - (screenLine != null ? screenLine.softWrapIndentationDelta : void 0);
      if (needAdjustment) {
        bufferRange.end.column++;
      }
      startPosition = textEditorElement.pixelPositionForScreenPosition(clippedStart);
      endPosition = textEditorElement.pixelPositionForScreenPosition(clippedEnd);
      text = displayBuffer.buffer.getTextInRange(bufferRange);
      css = {};
      css.left = startPosition.left;
      css.top = startPosition.top;
      css.width = endPosition.left - startPosition.left;
      if (needAdjustment) {
        css.width += charWidth;
      }
      css.height = lineHeight;
      region = document.createElement('div');
      region.className = 'region';
      if (this.includeTextInRegion) {
        region.textContent = text;
      }
      if (startPosition.left === endPosition.left) {
        region.invalid = true;
      }
      for (name in css) {
        value = css[name];
        region.style[name] = value + 'px';
      }
      return region;
    };

    return RegionRenderer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3JlbmRlcmVycy9yZWdpb24tcmVuZGVyZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLGNBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO2dDQUNKOztBQUFBLDZCQUFBLG1CQUFBLEdBQXFCLEtBQXJCLENBQUE7O0FBQUEsNkJBRUEsYUFBQSxHQUFlLFNBQUMsV0FBRCxHQUFBO0FBQ2IsVUFBQSw0REFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLFdBQVcsQ0FBQyxjQUFaLENBQUEsQ0FBUixDQUFBO0FBQ0EsTUFBQSxJQUFhLEtBQUssQ0FBQyxPQUFOLENBQUEsQ0FBYjtBQUFBLGVBQU8sRUFBUCxDQUFBO09BREE7QUFBQSxNQUdBLE9BQUEsR0FBVSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQVYsR0FBZ0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUh0QyxDQUFBO0FBQUEsTUFJQSxPQUFBLEdBQVUsRUFKVixDQUFBO0FBQUEsTUFNQSxhQUFBLEdBQWdCLFdBQVcsQ0FBQyxNQUFNLENBQUMsYUFObkMsQ0FBQTtBQVFBLE1BQUEsSUFBRyxPQUFBLEtBQVcsQ0FBZDtBQUNFLFFBQUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFDLENBQUEsWUFBRCxDQUFjLEtBQUssQ0FBQyxLQUFwQixFQUEyQixLQUFLLENBQUMsR0FBakMsRUFBc0MsV0FBdEMsQ0FBYixDQUFBLENBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLElBQUMsQ0FBQSxZQUFELENBQ1gsS0FBSyxDQUFDLEtBREssRUFFWDtBQUFBLFVBQ0UsR0FBQSxFQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FEbkI7QUFBQSxVQUVFLE1B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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/renderers/region-renderer.coffee
