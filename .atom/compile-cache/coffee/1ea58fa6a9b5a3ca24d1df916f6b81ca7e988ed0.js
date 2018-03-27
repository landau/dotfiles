(function() {
  var Color;

  require('./helpers/matchers');

  Color = require('../lib/color');

  describe('Color', function() {
    var color;
    color = [][0];
    beforeEach(function() {
      return color = new Color('#66ff6933');
    });
    describe('created with separated components', function() {
      return it('creates the color with the provided components', function() {
        return expect(new Color(255, 127, 64, 0.5)).toBeColor(255, 127, 64, 0.5);
      });
    });
    describe('created with a hexa rgb string', function() {
      return it('creates the color with the provided components', function() {
        return expect(new Color('#ff6933')).toBeColor(255, 105, 51, 1);
      });
    });
    describe('created with a hexa argb string', function() {
      return it('creates the color with the provided components', function() {
        return expect(new Color('#66ff6933')).toBeColor(255, 105, 51, 0.4);
      });
    });
    describe('created with the name of a svg color', function() {
      return it('creates the color using its name', function() {
        return expect(new Color('orange')).toBeColor('#ffa500');
      });
    });
    describe('::isValid', function() {
      it('returns true when all the color components are valid', function() {
        return expect(new Color).toBeValid();
      });
      it('returns false when one component is NaN', function() {
        expect(new Color(NaN, 0, 0, 1)).not.toBeValid();
        expect(new Color(0, NaN, 0, 1)).not.toBeValid();
        expect(new Color(0, 0, NaN, 1)).not.toBeValid();
        return expect(new Color(0, 0, 1, NaN)).not.toBeValid();
      });
      return it('returns false when the color has the invalid flag', function() {
        color = new Color;
        color.invalid = true;
        return expect(color).not.toBeValid();
      });
    });
    describe('::isLiteral', function() {
      it('returns true when the color does not rely on variables', function() {
        return expect(new Color('orange').isLiteral()).toBeTruthy();
      });
      return it('returns false when the color does rely on variables', function() {
        color = new Color(0, 0, 0, 1);
        color.variables = ['foo'];
        return expect(color.isLiteral()).toBeFalsy();
      });
    });
    describe('::rgb', function() {
      it('returns an array with the color components', function() {
        return expect(color.rgb).toBeComponentArrayCloseTo([color.red, color.green, color.blue]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.rgb = [1, 2, 3];
        return expect(color).toBeColor(1, 2, 3, 0.4);
      });
    });
    describe('::rgba', function() {
      it('returns an array with the color and alpha components', function() {
        return expect(color.rgba).toBeComponentArrayCloseTo([color.red, color.green, color.blue, color.alpha]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.rgba = [1, 2, 3, 0.7];
        return expect(color).toBeColor(1, 2, 3, 0.7);
      });
    });
    describe('::argb', function() {
      it('returns an array with the alpha and color components', function() {
        return expect(color.argb).toBeComponentArrayCloseTo([color.alpha, color.red, color.green, color.blue]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.argb = [0.7, 1, 2, 3];
        return expect(color).toBeColor(1, 2, 3, 0.7);
      });
    });
    describe('::hsv', function() {
      it('returns an array with the hue, saturation and value components', function() {
        return expect(color.hsv).toBeComponentArrayCloseTo([16, 80, 100]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hsv = [200, 50, 50];
        return expect(color).toBeColor(64, 106, 128, 0.4);
      });
    });
    describe('::hsva', function() {
      it('returns an array with the hue, saturation, value and alpha components', function() {
        return expect(color.hsva).toBeComponentArrayCloseTo([16, 80, 100, 0.4]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hsva = [200, 50, 50, 0.7];
        return expect(color).toBeColor(64, 106, 128, 0.7);
      });
    });
    describe('::hcg', function() {
      it('returns an array with the hue, chroma and gray components', function() {
        return expect(color.hcg).toBeComponentArrayCloseTo([16, 80, 100]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hcg = [200, 50, 50];
        return expect(color).toBeColor(64, 149, 191, 0.4);
      });
    });
    describe('::hcga', function() {
      it('returns an array with the hue, chroma, gray and alpha components', function() {
        return expect(color.hcga).toBeComponentArrayCloseTo([16, 80, 100, 0.4]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hcga = [200, 50, 50, 0.7];
        return expect(color).toBeColor(64, 149, 191, 0.7);
      });
    });
    describe('::hsl', function() {
      it('returns an array with the hue, saturation and luminosity components', function() {
        return expect(color.hsl).toBeComponentArrayCloseTo([16, 100, 60]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hsl = [200, 50, 50];
        return expect(color).toBeColor(64, 149, 191, 0.4);
      });
    });
    describe('::hsla', function() {
      it('returns an array with the hue, saturation, luminosity and alpha components', function() {
        return expect(color.hsla).toBeComponentArrayCloseTo([16, 100, 60, 0.4]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hsla = [200, 50, 50, 0.7];
        return expect(color).toBeColor(64, 149, 191, 0.7);
      });
    });
    describe('::hwb', function() {
      it('returns an array with the hue, whiteness and blackness components', function() {
        return expect(color.hwb).toBeComponentArrayCloseTo([16, 20, 0]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hwb = [210, 40, 40];
        return expect(color).toBeColor(102, 128, 153, 0.4);
      });
    });
    describe('::hwba', function() {
      it('returns an array with the hue, whiteness, blackness and alpha components', function() {
        return expect(color.hwba).toBeComponentArrayCloseTo([16, 20, 0, 0.4]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hwba = [210, 40, 40, 0.7];
        return expect(color).toBeColor(102, 128, 153, 0.7);
      });
    });
    describe('::hex', function() {
      it('returns the color as a hexadecimal string', function() {
        return expect(color.hex).toEqual('ff6933');
      });
      return it('parses the string and sets the color components accordingly', function() {
        color.hex = '00ff00';
        return expect(color).toBeColor(0, 255, 0, 0.4);
      });
    });
    describe('::hexARGB', function() {
      it('returns the color component as a hexadecimal string', function() {
        return expect(color.hexARGB).toEqual('66ff6933');
      });
      return it('parses the string and sets the color components accordingly', function() {
        color.hexARGB = 'ff00ff00';
        return expect(color).toBeColor(0, 255, 0, 1);
      });
    });
    describe('::hue', function() {
      it('returns the hue component', function() {
        return expect(color.hue).toEqual(color.hsl[0]);
      });
      return it('sets the hue component', function() {
        color.hue = 20;
        return expect(color.hsl).toBeComponentArrayCloseTo([20, 100, 60]);
      });
    });
    describe('::saturation', function() {
      it('returns the saturation component', function() {
        return expect(color.saturation).toEqual(color.hsl[1]);
      });
      return it('sets the saturation component', function() {
        color.saturation = 20;
        return expect(color.hsl).toBeComponentArrayCloseTo([16, 20, 60]);
      });
    });
    describe('::lightness', function() {
      it('returns the lightness component', function() {
        return expect(color.lightness).toEqual(color.hsl[2]);
      });
      return it('sets the lightness component', function() {
        color.lightness = 20;
        return expect(color.hsl).toBeComponentArrayCloseTo([16, 100, 20]);
      });
    });
    describe('::cmyk', function() {
      it('returns an array with the color in CMYK color space', function() {
        color = new Color('#FF7F00');
        return expect(color.cmyk).toBeComponentArrayCloseTo([0, 0.5, 1, 0]);
      });
      return it('sets the color components using cmyk values', function() {
        color.alpha = 1;
        color.cmyk = [0, 0.5, 1, 0];
        return expect(color).toBeColor('#FF7F00');
      });
    });
    describe('::clone', function() {
      return it('returns a copy of the current color', function() {
        expect(color.clone()).toBeColor(color);
        return expect(color.clone()).not.toBe(color);
      });
    });
    describe('::toCSS', function() {
      describe('when the color alpha channel is not 1', function() {
        return it('returns the color as a rgba() color', function() {
          return expect(color.toCSS()).toEqual('rgba(255,105,51,0.4)');
        });
      });
      describe('when the color alpha channel is 1', function() {
        return it('returns the color as a rgb() color', function() {
          color.alpha = 1;
          return expect(color.toCSS()).toEqual('rgb(255,105,51)');
        });
      });
      return describe('when the color have a CSS name', function() {
        return it('only returns the color name', function() {
          color = new Color('orange');
          return expect(color.toCSS()).toEqual('rgb(255,165,0)');
        });
      });
    });
    describe('::interpolate', function() {
      return it('blends the passed-in color linearly based on the passed-in ratio', function() {
        var colorA, colorB, colorC;
        colorA = new Color('#ff0000');
        colorB = new Color('#0000ff');
        colorC = colorA.interpolate(colorB, 0.5);
        return expect(colorC).toBeColor('#7f007f');
      });
    });
    describe('::blend', function() {
      return it('blends the passed-in color based on the passed-in blend function', function() {
        var colorA, colorB, colorC;
        colorA = new Color('#ff0000');
        colorB = new Color('#0000ff');
        colorC = colorA.blend(colorB, function(a, b) {
          return a / 2 + b / 2;
        });
        return expect(colorC).toBeColor('#800080');
      });
    });
    describe('::transparentize', function() {
      return it('returns a new color whose alpha is the passed-in value', function() {
        expect(color.transparentize(1)).toBeColor(255, 105, 51, 1);
        expect(color.transparentize(0.7)).toBeColor(255, 105, 51, 0.7);
        return expect(color.transparentize(0.1)).toBeColor(255, 105, 51, 0.1);
      });
    });
    return describe('::luma', function() {
      return it('returns the luma value of the color', function() {
        return expect(color.luma).toBeCloseTo(0.31, 1);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9jb2xvci1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxLQUFBOztBQUFBLEVBQUEsT0FBQSxDQUFRLG9CQUFSLENBQUEsQ0FBQTs7QUFBQSxFQUVBLEtBQUEsR0FBUSxPQUFBLENBQVEsY0FBUixDQUZSLENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBLEdBQUE7QUFDaEIsUUFBQSxLQUFBO0FBQUEsSUFBQyxRQUFTLEtBQVYsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTSxXQUFOLEVBREg7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBS0EsUUFBQSxDQUFTLG1DQUFULEVBQThDLFNBQUEsR0FBQTthQUM1QyxFQUFBLENBQUcsZ0RBQUgsRUFBcUQsU0FBQSxHQUFBO2VBQ25ELE1BQUEsQ0FBVyxJQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixFQUFoQixFQUFvQixHQUFwQixDQUFYLENBQW9DLENBQUMsU0FBckMsQ0FBK0MsR0FBL0MsRUFBb0QsR0FBcEQsRUFBeUQsRUFBekQsRUFBNkQsR0FBN0QsRUFEbUQ7TUFBQSxDQUFyRCxFQUQ0QztJQUFBLENBQTlDLENBTEEsQ0FBQTtBQUFBLElBU0EsUUFBQSxDQUFTLGdDQUFULEVBQTJDLFNBQUEsR0FBQTthQUN6QyxFQUFBLENBQUcsZ0RBQUgsRUFBcUQsU0FBQSxHQUFBO2VBQ25ELE1BQUEsQ0FBVyxJQUFBLEtBQUEsQ0FBTSxTQUFOLENBQVgsQ0FBNEIsQ0FBQyxTQUE3QixDQUF1QyxHQUF2QyxFQUE0QyxHQUE1QyxFQUFpRCxFQUFqRCxFQUFxRCxD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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/spec/color-spec.coffee
