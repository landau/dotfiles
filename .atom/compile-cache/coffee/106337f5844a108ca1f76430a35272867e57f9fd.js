(function() {
  var Color, ColorMarker;

  Color = require('../lib/color');

  ColorMarker = require('../lib/color-marker');

  describe('ColorMarker', function() {
    var colorMarker, editor, jasmineContent, marker, ref;
    ref = [], editor = ref[0], marker = ref[1], colorMarker = ref[2], jasmineContent = ref[3];
    beforeEach(function() {
      var color, colorBuffer, text;
      editor = atom.workspace.buildTextEditor({});
      editor.setText("body {\n  color: hsva(0, 100%, 100%, 0.5);\n  bar: foo;\n  foo: bar;\n}");
      marker = editor.markBufferRange([[1, 9], [1, 33]]);
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
    describe('::copyContentAsHex', function() {
      beforeEach(function() {
        return colorMarker.copyContentAsHex();
      });
      return it('write the hexadecimal version in the clipboard', function() {
        return expect(atom.clipboard.read()).toEqual("#ff0000");
      });
    });
    describe('::copyContentAsRGB', function() {
      beforeEach(function() {
        return colorMarker.copyContentAsRGB();
      });
      return it('write the rgb version in the clipboard', function() {
        return expect(atom.clipboard.read()).toEqual("rgb(255, 0, 0)");
      });
    });
    describe('::copyContentAsRGBA', function() {
      beforeEach(function() {
        return colorMarker.copyContentAsRGBA();
      });
      return it('write the rgba version in the clipboard', function() {
        return expect(atom.clipboard.read()).toEqual("rgba(255, 0, 0, 0.5)");
      });
    });
    describe('::copyContentAsHSL', function() {
      beforeEach(function() {
        return colorMarker.copyContentAsHSL();
      });
      return it('write the hsl version in the clipboard', function() {
        return expect(atom.clipboard.read()).toEqual("hsl(0, 100%, 50%)");
      });
    });
    describe('::copyContentAsHSLA', function() {
      beforeEach(function() {
        return colorMarker.copyContentAsHSLA();
      });
      return it('write the hsla version in the clipboard', function() {
        return expect(atom.clipboard.read()).toEqual("hsla(0, 100%, 50%, 0.5)");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9jb2xvci1tYXJrZXItc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsY0FBUjs7RUFDUixXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSOztFQUVkLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUE7QUFDdEIsUUFBQTtJQUFBLE1BQWdELEVBQWhELEVBQUMsZUFBRCxFQUFTLGVBQVQsRUFBaUIsb0JBQWpCLEVBQThCO0lBRTlCLFVBQUEsQ0FBVyxTQUFBO0FBQ1QsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBK0IsRUFBL0I7TUFDVCxNQUFNLENBQUMsT0FBUCxDQUFlLHlFQUFmO01BT0EsTUFBQSxHQUFTLE1BQU0sQ0FBQyxlQUFQLENBQXVCLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQU8sQ0FBQyxDQUFELEVBQUcsRUFBSCxDQUFQLENBQXZCO01BQ1QsS0FBQSxHQUFZLElBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxDQUFYLEVBQWMsQ0FBZCxFQUFpQixHQUFqQjtNQUNaLElBQUEsR0FBTztNQUNQLFdBQUEsR0FBYztRQUFDLFFBQUEsTUFBRDs7YUFFZCxXQUFBLEdBQWtCLElBQUEsV0FBQSxDQUFZO1FBQUMsUUFBQSxNQUFEO1FBQVMsT0FBQSxLQUFUO1FBQWdCLE1BQUEsSUFBaEI7UUFBc0IsYUFBQSxXQUF0QjtPQUFaO0lBZFQsQ0FBWDtJQWdCQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQTtNQUM3QixVQUFBLENBQVcsU0FBQTtlQUNULFdBQVcsQ0FBQyxnQkFBWixDQUFBO01BRFMsQ0FBWDthQUdBLEVBQUEsQ0FBRyxnREFBSCxFQUFxRCxTQUFBO2VBQ25ELE1BQUEsQ0FBTyxJ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QUFDLEtBQWxCLEdBQTBCO2VBQzFCLFdBQVcsQ0FBQyxtQkFBWixDQUFBO01BRlMsQ0FBWDtNQUlBLEVBQUEsQ0FBRyxvREFBSCxFQUF5RCxTQUFBO2VBQ3ZELE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxPQUF6QixDQUFpQyxrRUFBakM7TUFEdUQsQ0FBekQ7YUFTQSxRQUFBLENBQVMsK0JBQVQsRUFBMEMsU0FBQTtRQUN4QyxVQUFBLENBQVcsU0FBQTtpQkFDVCxXQUFXLENBQUMsbUJBQVosQ0FBQTtRQURTLENBQVg7ZUFHQSxFQUFBLENBQUcsb0RBQUgsRUFBeUQsU0FBQTtpQkFDdkQsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBUCxDQUF3QixDQUFDLE9BQXpCLENBQWlDLGtFQUFqQztRQUR1RCxDQUF6RDtNQUp3QyxDQUExQztJQWRnQyxDQUFsQztFQXBKc0IsQ0FBeEI7QUFIQSIsInNvdXJjZXNDb250ZW50IjpbIkNvbG9yID0gcmVxdWlyZSAnLi4vbGliL2NvbG9yJ1xuQ29sb3JNYXJrZXIgPSByZXF1aXJlICcuLi9saWIvY29sb3ItbWFya2VyJ1xuXG5kZXNjcmliZSAnQ29sb3JNYXJrZXInLCAtPlxuICBbZWRpdG9yLCBtYXJrZXIsIGNvbG9yTWFya2VyLCBqYXNtaW5lQ29udGVudF0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3Ioe30pXG4gICAgZWRpdG9yLnNldFRleHQoXCJcIlwiXG4gICAgYm9keSB7XG4gICAgICBjb2xvcjogaHN2YSgwLCAxMDAlLCAxMDAlLCAwLjUpO1xuICAgICAgYmFyOiBmb287XG4gICAgICBmb286IGJhcjtcbiAgICB9XG4gICAgXCJcIlwiKVxuICAgIG1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UgW1sxLDldLFsxLDMzXV1cbiAgICBjb2xvciA9IG5ldyBDb2xvcigyNTUsIDAsIDAsIDAuNSlcbiAgICB0ZXh0ID0gJ2hzdmEoMCwgMTAwJSwgMTAwJSwgMC41KSdcbiAgICBjb2xvckJ1ZmZlciA9IHtlZGl0b3J9XG5cbiAgICBjb2xvck1hcmtlciA9IG5ldyBDb2xvck1hcmtlcih7bWFya2VyLCBjb2xvciwgdGV4dCwgY29sb3JCdWZmZXJ9KVxuXG4gIGRlc2NyaWJlICc6OmNvcHlDb250ZW50QXNIZXgnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGNvbG9yTWFya2VyLmNvcHlDb250ZW50QXNIZXgoKVxuXG4gICAgaXQgJ3dyaXRlIHRoZSBoZXhhZGVjaW1hbCB2ZXJzaW9uIGluIHRoZSBjbGlwYm9hcmQnLCAtPlxuICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbChcIiNmZjAwMDBcIilcblxuICBkZXNjcmliZSAnOjpjb3B5Q29udGVudEFzUkdCJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBjb2xvck1hcmtlci5jb3B5Q29udGVudEFzUkdCKClcblxuICAgIGl0ICd3cml0ZSB0aGUgcmdiIHZlcnNpb24gaW4gdGhlIGNsaXBib2FyZCcsIC0+XG4gICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0VxdWFsKFwicmdiKDI1NSwgMCwgMClcIilcblxuICBkZXNjcmliZSAnOjpjb3B5Q29udGVudEFzUkdCQScsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgY29sb3JNYXJrZXIuY29weUNvbnRlbnRBc1JHQkEoKVxuXG4gICAgaXQgJ3dyaXRlIHRoZSByZ2JhIHZlcnNpb24gaW4gdGhlIGNsaXBib2FyZCcsIC0+XG4gICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0VxdWFsKFwicmdiYSgyNTUsIDAsIDAsIDAuNSlcIilcblxuICBkZXNjcmliZSAnOjpjb3B5Q29udGVudEFzSFNMJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBjb2xvck1hcmtlci5jb3B5Q29udGVudEFzSFNMKClcblxuICAgIGl0ICd3cml0ZSB0aGUgaHNsIHZlcnNpb24gaW4gdGhlIGNsaXBib2FyZCcsIC0+XG4gICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0VxdWFsKFwiaHNsKDAsIDEwMCUsIDUwJSlcIilcblxuICBkZXNjcmliZSAnOjpjb3B5Q29udGVudEFzSFNMQScsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgY29sb3JNYXJrZXIuY29weUNvbnRlbnRBc0hTTEEoKVxuXG4gICAgaXQgJ3dyaXRlIHRoZSBoc2xhIHZlcnNpb24gaW4gdGhlIGNsaXBib2FyZCcsIC0+XG4gICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0VxdWFsKFwiaHNsYSgwLCAxMDAlLCA1MCUsIDAuNSlcIilcblxuICBkZXNjcmliZSAnOjpjb252ZXJ0Q29udGVudFRvSGV4JywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBjb2xvck1hcmtlci5jb252ZXJ0Q29udGVudFRvSGV4KClcblxuICAgIGl0ICdyZXBsYWNlcyB0aGUgdGV4dCBpbiB0aGUgZWRpdG9yIGJ5IHRoZSBoZXhhZGVjaW1hbCB2ZXJzaW9uJywgLT5cbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKFwiXCJcIlxuICAgICAgYm9keSB7XG4gICAgICAgIGNvbG9yOiAjZmYwMDAwO1xuICAgICAgICBiYXI6IGZvbztcbiAgICAgICAgZm9vOiBiYXI7XG4gICAgICB9XG4gICAgICBcIlwiXCIpXG5cbiAgZGVzY3JpYmUgJzo6Y29udmVydENvbnRlbnRUb1JHQkEnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGNvbG9yTWFya2VyLmNvbnZlcnRDb250ZW50VG9SR0JBKClcblxuICAgIGl0ICdyZXBsYWNlcyB0aGUgdGV4dCBpbiB0aGUgZWRpdG9yIGJ5IHRoZSByZ2JhIHZlcnNpb24nLCAtPlxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJcIlwiXG4gICAgICBib2R5IHtcbiAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAwLCAwLCAwLjUpO1xuICAgICAgICBiYXI6IGZvbztcbiAgICAgICAgZm9vOiBiYXI7XG4gICAgICB9XG4gICAgICBcIlwiXCIpXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgY29sb3IgYWxwaGEgaXMgMScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGNvbG9yTWFya2VyLmNvbG9yLmFscGhhID0gMVxuICAgICAgICBjb2xvck1hcmtlci5jb252ZXJ0Q29udGVudFRvUkdCQSgpXG5cbiAgICAgIGl0ICdyZXBsYWNlcyB0aGUgdGV4dCBpbiB0aGUgZWRpdG9yIGJ5IHRoZSByZ2JhIHZlcnNpb24nLCAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbChcIlwiXCJcbiAgICAgICAgYm9keSB7XG4gICAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAwLCAwLCAxKTtcbiAgICAgICAgICBiYXI6IGZvbztcbiAgICAgICAgICBmb286IGJhcjtcbiAgICAgICAgfVxuICAgICAgICBcIlwiXCIpXG5cbiAgZGVzY3JpYmUgJzo6Y29udmVydENvbnRlbnRUb1JHQicsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgY29sb3JNYXJrZXIuY29sb3IuYWxwaGEgPSAxXG4gICAgICBjb2xvck1hcmtlci5jb252ZXJ0Q29udGVudFRvUkdCKClcblxuICAgIGl0ICdyZXBsYWNlcyB0aGUgdGV4dCBpbiB0aGUgZWRpdG9yIGJ5IHRoZSByZ2IgdmVyc2lvbicsIC0+XG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbChcIlwiXCJcbiAgICAgIGJvZHkge1xuICAgICAgICBjb2xvcjogcmdiKDI1NSwgMCwgMCk7XG4gICAgICAgIGJhcjogZm9vO1xuICAgICAgICBmb286IGJhcjtcbiAgICAgIH1cbiAgICAgIFwiXCJcIilcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZSBjb2xvciBhbHBoYSBpcyBub3QgMScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGNvbG9yTWFya2VyLmNvbnZlcnRDb250ZW50VG9SR0IoKVxuXG4gICAgICBpdCAncmVwbGFjZXMgdGhlIHRleHQgaW4gdGhlIGVkaXRvciBieSB0aGUgcmdiIHZlcnNpb24nLCAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbChcIlwiXCJcbiAgICAgICAgYm9keSB7XG4gICAgICAgICAgY29sb3I6IHJnYigyNTUsIDAsIDApO1xuICAgICAgICAgIGJhcjogZm9vO1xuICAgICAgICAgIGZvbzogYmFyO1xuICAgICAgICB9XG4gICAgICAgIFwiXCJcIilcblxuICBkZXNjcmliZSAnOjpjb252ZXJ0Q29udGVudFRvSFNMQScsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgY29sb3JNYXJrZXIuY29udmVydENvbnRlbnRUb0hTTEEoKVxuXG4gICAgaXQgJ3JlcGxhY2VzIHRoZSB0ZXh0IGluIHRoZSBlZGl0b3IgYnkgdGhlIGhzbGEgdmVyc2lvbicsIC0+XG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbChcIlwiXCJcbiAgICAgIGJvZHkge1xuICAgICAgICBjb2xvcjogaHNsYSgwLCAxMDAlLCA1MCUsIDAuNSk7XG4gICAgICAgIGJhcjogZm9vO1xuICAgICAgICBmb286IGJhcjtcbiAgICAgIH1cbiAgICAgIFwiXCJcIilcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZSBjb2xvciBhbHBoYSBpcyAxJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgY29sb3JNYXJrZXIuY29sb3IuYWxwaGEgPSAxXG4gICAgICAgIGNvbG9yTWFya2VyLmNvbnZlcnRDb250ZW50VG9IU0xBKClcblxuICAgICAgaXQgJ3JlcGxhY2VzIHRoZSB0ZXh0IGluIHRoZSBlZGl0b3IgYnkgdGhlIGhzbGEgdmVyc2lvbicsIC0+XG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKFwiXCJcIlxuICAgICAgICBib2R5IHtcbiAgICAgICAgICBjb2xvcjogaHNsYSgwLCAxMDAlLCA1MCUsIDEpO1xuICAgICAgICAgIGJhcjogZm9vO1xuICAgICAgICAgIGZvbzogYmFyO1xuICAgICAgICB9XG4gICAgICAgIFwiXCJcIilcblxuICBkZXNjcmliZSAnOjpjb252ZXJ0Q29udGVudFRvSFNMJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBjb2xvck1hcmtlci5jb2xvci5hbHBoYSA9IDFcbiAgICAgIGNvbG9yTWFya2VyLmNvbnZlcnRDb250ZW50VG9IU0woKVxuXG4gICAgaXQgJ3JlcGxhY2VzIHRoZSB0ZXh0IGluIHRoZSBlZGl0b3IgYnkgdGhlIGhzbCB2ZXJzaW9uJywgLT5cbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKFwiXCJcIlxuICAgICAgYm9keSB7XG4gICAgICAgIGNvbG9yOiBoc2woMCwgMTAwJSwgNTAlKTtcbiAgICAgICAgYmFyOiBmb287XG4gICAgICAgIGZvbzogYmFyO1xuICAgICAgfVxuICAgICAgXCJcIlwiKVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gdGhlIGNvbG9yIGFscGhhIGlzIG5vdCAxJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgY29sb3JNYXJrZXIuY29udmVydENvbnRlbnRUb0hTTCgpXG5cbiAgICAgIGl0ICdyZXBsYWNlcyB0aGUgdGV4dCBpbiB0aGUgZWRpdG9yIGJ5IHRoZSBoc2wgdmVyc2lvbicsIC0+XG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKFwiXCJcIlxuICAgICAgICBib2R5IHtcbiAgICAgICAgICBjb2xvcjogaHNsKDAsIDEwMCUsIDUwJSk7XG4gICAgICAgICAgYmFyOiBmb287XG4gICAgICAgICAgZm9vOiBiYXI7XG4gICAgICAgIH1cbiAgICAgICAgXCJcIlwiKVxuIl19
