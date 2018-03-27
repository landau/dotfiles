(function() {
  var Color, ColorMarker;

  Color = require('../lib/color');

  ColorMarker = require('../lib/color-marker');

  describe('ColorMarker', function() {
    var colorMarker, colorMarkerElement, editor, jasmineContent, marker, _ref;
    _ref = [], editor = _ref[0], marker = _ref[1], colorMarker = _ref[2], colorMarkerElement = _ref[3], jasmineContent = _ref[4];
    beforeEach(function() {
      var color, colorBuffer, text;
      editor = atom.workspace.buildTextEditor({});
      editor.setText("body {\n  color: hsva(0, 100%, 100%, 0.5);\n  bar: foo;\n  foo: bar;\n}");
      marker = editor.markBufferRange([[1, 9], [1, 33]], {
        type: 'pigments-color'
      });
      color = new Color(255, 0, 0, 0.5);
      text = 'hsva(0, 100%, 100%, 0.5)';
      colorBuffer = {
        editor: editor
      };
      return colorMarker = new ColorMarker({
        marker: marker,
        color: color,
        text: text,
        colorBuffer: colorBuffer
      });
    });
    describe('::convertContentToHex', function() {
      beforeEach(function() {
        return colorMarker.convertContentToHex();
      });
      return it('replaces the text in the editor by the hexadecimal version', function() {
        return expect(editor.getText()).toEqual("body {\n  color: #ff0000;\n  bar: foo;\n  foo: bar;\n}");
      });
    });
    describe('::convertContentToRGBA', function() {
      beforeEach(function() {
        return colorMarker.convertContentToRGBA();
      });
      it('replaces the text in the editor by the rgba version', function() {
        return expect(editor.getText()).toEqual("body {\n  color: rgba(255, 0, 0, 0.5);\n  bar: foo;\n  foo: bar;\n}");
      });
      return describe('when the color alpha is 1', function() {
        beforeEach(function() {
          colorMarker.color.alpha = 1;
          return colorMarker.convertContentToRGBA();
        });
        return it('replaces the text in the editor by the rgba version', function() {
          return expect(editor.getText()).toEqual("body {\n  color: rgba(255, 0, 0, 1);\n  bar: foo;\n  foo: bar;\n}");
        });
      });
    });
    describe('::convertContentToRGB', function() {
      beforeEach(function() {
        colorMarker.color.alpha = 1;
        return colorMarker.convertContentToRGB();
      });
      it('replaces the text in the editor by the rgb version', function() {
        return expect(editor.getText()).toEqual("body {\n  color: rgb(255, 0, 0);\n  bar: foo;\n  foo: bar;\n}");
      });
      return describe('when the color alpha is not 1', function() {
        beforeEach(function() {
          return colorMarker.convertContentToRGB();
        });
        return it('replaces the text in the editor by the rgb version', function() {
          return expect(editor.getText()).toEqual("body {\n  color: rgb(255, 0, 0);\n  bar: foo;\n  foo: bar;\n}");
        });
      });
    });
    describe('::convertContentToHSLA', function() {
      beforeEach(function() {
        return colorMarker.convertContentToHSLA();
      });
      it('replaces the text in the editor by the hsla version', function() {
        return expect(editor.getText()).toEqual("body {\n  color: hsla(0, 100%, 50%, 0.5);\n  bar: foo;\n  foo: bar;\n}");
      });
      return describe('when the color alpha is 1', function() {
        beforeEach(function() {
          colorMarker.color.alpha = 1;
          return colorMarker.convertContentToHSLA();
        });
        return it('replaces the text in the editor by the hsla version', function() {
          return expect(editor.getText()).toEqual("body {\n  color: hsla(0, 100%, 50%, 1);\n  bar: foo;\n  foo: bar;\n}");
        });
      });
    });
    return describe('::convertContentToHSL', function() {
      beforeEach(function() {
        colorMarker.color.alpha = 1;
        return colorMarker.convertContentToHSL();
      });
      it('replaces the text in the editor by the hsl version', function() {
        return expect(editor.getText()).toEqual("body {\n  color: hsl(0, 100%, 50%);\n  bar: foo;\n  foo: bar;\n}");
      });
      return describe('when the color alpha is not 1', function() {
        beforeEach(function() {
          return colorMarker.convertContentToHSL();
        });
        return it('replaces the text in the editor by the hsl version', function() {
          return expect(editor.getText()).toEqual("body {\n  color: hsl(0, 100%, 50%);\n  bar: foo;\n  foo: bar;\n}");
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9jb2xvci1tYXJrZXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0JBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLGNBQVIsQ0FBUixDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUixDQURkLENBQUE7O0FBQUEsRUFHQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsUUFBQSxxRUFBQTtBQUFBLElBQUEsT0FBb0UsRUFBcEUsRUFBQyxnQkFBRCxFQUFTLGdCQUFULEVBQWlCLHFCQUFqQixFQUE4Qiw0QkFBOUIsRUFBa0Qsd0JBQWxELENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLHdCQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFmLENBQStCLEVBQS9CLENBQVQsQ0FBQTtBQUFBLE1BQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBZSx5RUFBZixDQURBLENBQUE7QUFBQSxNQVFBLE1BQUEsR0FBUyxNQUFNLENBQUMsZUFBUCxDQUF1QixDQUFDLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBRCxFQUFPLENBQUMsQ0FBRCxFQUFHLEVBQUgsQ0FBUCxDQUF2QixFQUF1QztBQUFBLFFBQUEsSUFBQSxFQUFNLGdCQUFOO09BQXZDLENBUlQsQ0FBQTtBQUFBLE1BU0EsS0FBQSxHQUFZLElBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxDQUFYLEVBQWMsQ0FBZCxFQUFpQixHQUFqQixDQVRaLENBQUE7QUFBQSxNQVVBLElBQUEsR0FBTywwQkFWUCxDQUFBO0FBQUEsTUFXQSxXQUFBLEdBQWM7QUFBQSxR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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/spec/color-marker-spec.coffee
