(function() {
  var ColorContext, ColorExpression, ColorParser, registry;

  require('./helpers/matchers');

  ColorParser = require('../lib/color-parser');

  ColorContext = require('../lib/color-context');

  ColorExpression = require('../lib/color-expression');

  registry = require('../lib/color-expressions');

  describe('ColorParser', function() {
    var asColor, getParser, itParses, parser;
    parser = [][0];
    beforeEach(function() {
      var svgColorExpression;
      svgColorExpression = registry.getExpression('pigments:named_colors');
      return svgColorExpression.scopes = ['*'];
    });
    asColor = function(value) {
      return "color:" + value;
    };
    getParser = function(context) {
      context = new ColorContext(context != null ? context : {
        registry: registry
      });
      return context.parser;
    };
    itParses = function(expression) {
      return {
        description: '',
        asColor: function(r, g, b, a) {
          var context;
          if (a == null) {
            a = 1;
          }
          context = this.context;
          return describe(this.description, function() {
            beforeEach(function() {
              return parser = getParser(context);
            });
            return it("parses '" + expression + "' as a color", function() {
              var _ref;
              return expect(parser.parse(expression, (_ref = this.scope) != null ? _ref : 'less')).toBeColor(r, g, b, a);
            });
          });
        },
        asUndefined: function() {
          var context;
          context = this.context;
          return describe(this.description, function() {
            beforeEach(function() {
              return parser = getParser(context);
            });
            return it("does not parse '" + expression + "' and return undefined", function() {
              var _ref;
              return expect(parser.parse(expression, (_ref = this.scope) != null ? _ref : 'less')).toBeUndefined();
            });
          });
        },
        asInvalid: function() {
          var context;
          context = this.context;
          return describe(this.description, function() {
            beforeEach(function() {
              return parser = getParser(context);
            });
            return it("parses '" + expression + "' as an invalid color", function() {
              var _ref;
              return expect(parser.parse(expression, (_ref = this.scope) != null ? _ref : 'less')).not.toBeValid();
            });
          });
        },
        withContext: function(variables) {
          var colorVars, name, path, value, vars;
          vars = [];
          colorVars = [];
          path = "/path/to/file.styl";
          for (name in variables) {
            value = variables[name];
            if (value.indexOf('color:') !== -1) {
              value = value.replace('color:', '');
              vars.push({
                name: name,
                value: value,
                path: path
              });
              colorVars.push({
                name: name,
                value: value,
                path: path
              });
            } else {
              vars.push({
                name: name,
                value: value,
                path: path
              });
            }
          }
          this.context = {
            variables: vars,
            colorVariables: colorVars,
            registry: registry
          };
          this.description = "with variables context " + (jasmine.pp(variables)) + " ";
          return this;
        }
      };
    };
    itParses('@list-item-height').withContext({
      '@text-height': '@scale-b-xxl * 1rem',
      '@component-line-height': '@text-height',
      '@list-item-height': '@component-line-height'
    }).asUndefined();
    itParses('$text-color !default').withContext({
      '$text-color': asColor('cyan')
    }).asColor(0, 255, 255);
    itParses('c').withContext({
      'c': 'c'
    }).asUndefined();
    itParses('c').withContext({
      'c': 'd',
      'd': 'e',
      'e': 'c'
    }).asUndefined();
    itParses('#ff7f00').asColor(255, 127, 0);
    itParses('#f70').asColor(255, 119, 0);
    itParses('#ff7f00cc').asColor(255, 127, 0, 0.8);
    itParses('#f70c').asColor(255, 119, 0, 0.8);
    itParses('0xff7f00').asColor(255, 127, 0);
    itParses('0x00ff7f00').asColor(255, 127, 0, 0);
    describe('in context other than css and pre-processors', function() {
      beforeEach(function() {
        return this.scope = 'xaml';
      });
      return itParses('#ccff7f00').asColor(255, 127, 0, 0.8);
    });
    itParses('rgb(255,127,0)').asColor(255, 127, 0);
    itParses('rgb(255,127,0)').asColor(255, 127, 0);
    itParses('RGB(255,127,0)').asColor(255, 127, 0);
    itParses('RgB(255,127,0)').asColor(255, 127, 0);
    itParses('rGb(255,127,0)').asColor(255, 127, 0);
    itParses('rgb($r,$g,$b)').asInvalid();
    itParses('rgb($r,0,0)').asInvalid();
    itParses('rgb(0,$g,0)').asInvalid();
    itParses('rgb(0,0,$b)').asInvalid();
    itParses('rgb($r,$g,$b)').withContext({
      '$r': '255',
      '$g': '127',
      '$b': '0'
    }).asColor(255, 127, 0);
    itParses('rgba(255,127,0,0.5)').asColor(255, 127, 0, 0.5);
    itParses('rgba(255,127,0,.5)').asColor(255, 127, 0, 0.5);
    itParses('RGBA(255,127,0,.5)').asColor(255, 127, 0, 0.5);
    itParses('rGbA(255,127,0,.5)').asColor(255, 127, 0, 0.5);
    itParses('rgba(255,127,0,)').asUndefined();
    itParses('rgba($r,$g,$b,$a)').asInvalid();
    itParses('rgba($r,0,0,0)').asInvalid();
    itParses('rgba(0,$g,0,0)').asInvalid();
    itParses('rgba(0,0,$b,0)').asInvalid();
    itParses('rgba(0,0,0,$a)').asInvalid();
    itParses('rgba($r,$g,$b,$a)').withContext({
      '$r': '255',
      '$g': '127',
      '$b': '0',
      '$a': '0.5'
    }).asColor(255, 127, 0, 0.5);
    itParses('rgba(green, 0.5)').asColor(0, 128, 0, 0.5);
    itParses('rgba($c,$a,)').asUndefined();
    itParses('rgba($c,$a)').asInvalid();
    itParses('rgba($c,1)').asInvalid();
    itParses('rgba($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('rgba($c,$a)').withContext({
      '$c': asColor('green'),
      '$a': '0.5'
    }).asColor(0, 128, 0, 0.5);
    describe('css', function() {
      beforeEach(function() {
        return this.scope = 'css';
      });
      itParses('hsl(200,50%,50%)').asColor(64, 149, 191);
      itParses('hsl(200,50,50)').asColor(64, 149, 191);
      itParses('HSL(200,50,50)').asColor(64, 149, 191);
      itParses('hSl(200,50,50)').asColor(64, 149, 191);
      itParses('hsl(200.5,50.5,50.5)').asColor(65, 150, 193);
      itParses('hsl($h,$s,$l,)').asUndefined();
      itParses('hsl($h,$s,$l)').asInvalid();
      itParses('hsl($h,0%,0%)').asInvalid();
      itParses('hsl(0,$s,0%)').asInvalid();
      itParses('hsl(0,0%,$l)').asInvalid();
      return itParses('hsl($h,$s,$l)').withContext({
        '$h': '200',
        '$s': '50%',
        '$l': '50%'
      }).asColor(64, 149, 191);
    });
    describe('less', function() {
      beforeEach(function() {
        return this.scope = 'less';
      });
      itParses('hsl(285, 0.7, 0.7)').asColor('#cd7de8');
      return itParses('hsl(200,50%,50%)').asColor(64, 149, 191);
    });
    itParses('hsla(200,50%,50%,0.5)').asColor(64, 149, 191, 0.5);
    itParses('hsla(200,50%,50%,.5)').asColor(64, 149, 191, 0.5);
    itParses('hsla(200,50,50,.5)').asColor(64, 149, 191, 0.5);
    itParses('HSLA(200,50,50,.5)').asColor(64, 149, 191, 0.5);
    itParses('HsLa(200,50,50,.5)').asColor(64, 149, 191, 0.5);
    itParses('hsla(200.5,50.5,50.5,.5)').asColor(65, 150, 193, 0.5);
    itParses('hsla(200,50%,50%,)').asUndefined();
    itParses('hsla($h,$s,$l,$a)').asInvalid();
    itParses('hsla($h,0%,0%,0)').asInvalid();
    itParses('hsla(0,$s,0%,0)').asInvalid();
    itParses('hsla(0,0%,$l,0)').asInvalid();
    itParses('hsla(0,0%,0%,$a)').asInvalid();
    itParses('hsla($h,$s,$l,$a)').withContext({
      '$h': '200',
      '$s': '50%',
      '$l': '50%',
      '$a': '0.5'
    }).asColor(64, 149, 191, 0.5);
    itParses('hsv(200,50%,50%)').asColor(64, 106, 128);
    itParses('HSV(200,50%,50%)').asColor(64, 106, 128);
    itParses('hSv(200,50%,50%)').asColor(64, 106, 128);
    itParses('hsb(200,50%,50%)').asColor(64, 106, 128);
    itParses('hsb(200,50,50)').asColor(64, 106, 128);
    itParses('hsb(200.5,50.5,50.5)').asColor(64, 107, 129);
    itParses('hsv($h,$s,$v,)').asUndefined();
    itParses('hsv($h,$s,$v)').asInvalid();
    itParses('hsv($h,0%,0%)').asInvalid();
    itParses('hsv(0,$s,0%)').asInvalid();
    itParses('hsv(0,0%,$v)').asInvalid();
    itParses('hsv($h,$s,$v)').withContext({
      '$h': '200',
      '$s': '50%',
      '$v': '50%'
    }).asColor(64, 106, 128);
    itParses('hsva(200,50%,50%,0.5)').asColor(64, 106, 128, 0.5);
    itParses('hsva(200,50,50,0.5)').asColor(64, 106, 128, 0.5);
    itParses('HSVA(200,50,50,0.5)').asColor(64, 106, 128, 0.5);
    itParses('hsba(200,50%,50%,0.5)').asColor(64, 106, 128, 0.5);
    itParses('HsBa(200,50%,50%,0.5)').asColor(64, 106, 128, 0.5);
    itParses('hsva(200,50%,50%,.5)').asColor(64, 106, 128, 0.5);
    itParses('hsva(200.5,50.5,50.5,.5)').asColor(64, 107, 129, 0.5);
    itParses('hsva(200,50%,50%,)').asUndefined();
    itParses('hsva($h,$s,$v,$a)').asInvalid();
    itParses('hsva($h,0%,0%,0)').asInvalid();
    itParses('hsva(0,$s,0%,0)').asInvalid();
    itParses('hsva(0,0%,$v,0)').asInvalid();
    itParses('hsva($h,$s,$v,$a)').withContext({
      '$h': '200',
      '$s': '50%',
      '$v': '50%',
      '$a': '0.5'
    }).asColor(64, 106, 128, 0.5);
    itParses('hcg(200,50%,50%)').asColor(64, 149, 191);
    itParses('HCG(200,50%,50%)').asColor(64, 149, 191);
    itParses('hcg(200,50,50)').asColor(64, 149, 191);
    itParses('hcg(200.5,50.5,50.5)').asColor(64, 150, 193);
    itParses('hcg($h,$c,$g,)').asUndefined();
    itParses('hcg($h,$c,$g)').asInvalid();
    itParses('hcg($h,0%,0%)').asInvalid();
    itParses('hcg(0,$c,0%)').asInvalid();
    itParses('hcg(0,0%,$g)').asInvalid();
    itParses('hcg($h,$c,$g)').withContext({
      '$h': '200',
      '$c': '50%',
      '$g': '50%'
    }).asColor(64, 149, 191);
    itParses('hcga(200,50%,50%,0.5)').asColor(64, 149, 191, 0.5);
    itParses('hcga(200,50,50,0.5)').asColor(64, 149, 191, 0.5);
    itParses('HCGA(200,50,50,0.5)').asColor(64, 149, 191, 0.5);
    itParses('hcga(200,50%,50%,.5)').asColor(64, 149, 191, 0.5);
    itParses('hcga(200.5,50.5,50.5,.5)').asColor(64, 150, 193, 0.5);
    itParses('hcga(200,50%,50%,)').asUndefined();
    itParses('hcga($h,$c,$g,$a)').asInvalid();
    itParses('hcga($h,0%,0%,0)').asInvalid();
    itParses('hcga(0,$c,0%,0)').asInvalid();
    itParses('hcga(0,0%,$g,0)').asInvalid();
    itParses('hcga($h,$c,$g,$a)').withContext({
      '$h': '200',
      '$c': '50%',
      '$g': '50%',
      '$a': '0.5'
    }).asColor(64, 149, 191, 0.5);
    itParses('hwb(210,40%,40%)').asColor(102, 128, 153);
    itParses('hwb(210,40,40)').asColor(102, 128, 153);
    itParses('HWB(210,40,40)').asColor(102, 128, 153);
    itParses('hWb(210,40,40)').asColor(102, 128, 153);
    itParses('hwb(210,40%,40%, 0.5)').asColor(102, 128, 153, 0.5);
    itParses('hwb(210.5,40.5,40.5)').asColor(103, 128, 152);
    itParses('hwb(210.5,40.5%,40.5%, 0.5)').asColor(103, 128, 152, 0.5);
    itParses('hwb($h,$w,$b,)').asUndefined();
    itParses('hwb($h,$w,$b)').asInvalid();
    itParses('hwb($h,0%,0%)').asInvalid();
    itParses('hwb(0,$w,0%)').asInvalid();
    itParses('hwb(0,0%,$b)').asInvalid();
    itParses('hwb($h,0%,0%,0)').asInvalid();
    itParses('hwb(0,$w,0%,0)').asInvalid();
    itParses('hwb(0,0%,$b,0)').asInvalid();
    itParses('hwb(0,0%,0%,$a)').asInvalid();
    itParses('hwb($h,$w,$b)').withContext({
      '$h': '210',
      '$w': '40%',
      '$b': '40%'
    }).asColor(102, 128, 153);
    itParses('hwb($h,$w,$b,$a)').withContext({
      '$h': '210',
      '$w': '40%',
      '$b': '40%',
      '$a': '0.5'
    }).asColor(102, 128, 153, 0.5);
    itParses('cmyk(0,0.5,1,0)').asColor('#ff7f00');
    itParses('CMYK(0,0.5,1,0)').asColor('#ff7f00');
    itParses('cMyK(0,0.5,1,0)').asColor('#ff7f00');
    itParses('cmyk(c,m,y,k)').withContext({
      'c': '0',
      'm': '0.5',
      'y': '1',
      'k': '0'
    }).asColor('#ff7f00');
    itParses('cmyk(c,m,y,k)').asInvalid();
    itParses('gray(100%)').asColor(255, 255, 255);
    itParses('gray(100)').asColor(255, 255, 255);
    itParses('GRAY(100)').asColor(255, 255, 255);
    itParses('gRaY(100)').asColor(255, 255, 255);
    itParses('gray(100%, 0.5)').asColor(255, 255, 255, 0.5);
    itParses('gray($c, $a,)').asUndefined();
    itParses('gray($c, $a)').asInvalid();
    itParses('gray(0%, $a)').asInvalid();
    itParses('gray($c, 0)').asInvalid();
    itParses('gray($c, $a)').withContext({
      '$c': '100%',
      '$a': '0.5'
    }).asColor(255, 255, 255, 0.5);
    itParses('yellowgreen').asColor('#9acd32');
    itParses('YELLOWGREEN').asColor('#9acd32');
    itParses('yellowGreen').asColor('#9acd32');
    itParses('YellowGreen').asColor('#9acd32');
    itParses('yellow_green').asColor('#9acd32');
    itParses('YELLOW_GREEN').asColor('#9acd32');
    itParses('>YELLOW_GREEN').asColor('#9acd32');
    itParses('darken(cyan, 20%)').asColor(0, 153, 153);
    itParses('darken(cyan, 20)').asColor(0, 153, 153);
    itParses('darken(#fff, 100%)').asColor(0, 0, 0);
    itParses('darken(cyan, $r)').asInvalid();
    itParses('darken($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('darken($c, $r)').withContext({
      '$c': asColor('cyan'),
      '$r': '20%'
    }).asColor(0, 153, 153);
    itParses('darken($a, $r)').withContext({
      '$a': asColor('rgba($c, 1)'),
      '$c': asColor('cyan'),
      '$r': '20%'
    }).asColor(0, 153, 153);
    itParses('lighten(cyan, 20%)').asColor(102, 255, 255);
    itParses('lighten(cyan, 20)').asColor(102, 255, 255);
    itParses('lighten(#000, 100%)').asColor(255, 255, 255);
    itParses('lighten(cyan, $r)').asInvalid();
    itParses('lighten($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('lighten($c, $r)').withContext({
      '$c': asColor('cyan'),
      '$r': '20%'
    }).asColor(102, 255, 255);
    itParses('lighten($a, $r)').withContext({
      '$a': asColor('rgba($c, 1)'),
      '$c': asColor('cyan'),
      '$r': '20%'
    }).asColor(102, 255, 255);
    itParses('transparentize(cyan, 50%)').asColor(0, 255, 255, 0.5);
    itParses('transparentize(cyan, 50)').asColor(0, 255, 255, 0.5);
    itParses('transparentize(cyan, 0.5)').asColor(0, 255, 255, 0.5);
    itParses('transparentize(cyan, .5)').asColor(0, 255, 255, 0.5);
    itParses('fadeout(cyan, 0.5)').asColor(0, 255, 255, 0.5);
    itParses('fade-out(cyan, 0.5)').asColor(0, 255, 255, 0.5);
    itParses('fade_out(cyan, 0.5)').asColor(0, 255, 255, 0.5);
    itParses('fadeout(cyan, .5)').asColor(0, 255, 255, 0.5);
    itParses('fadeout(cyan, @r)').asInvalid();
    itParses('fadeout($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('fadeout(@c, @r)').withContext({
      '@c': asColor('cyan'),
      '@r': '0.5'
    }).asColor(0, 255, 255, 0.5);
    itParses('fadeout(@a, @r)').withContext({
      '@a': asColor('rgba(@c, 1)'),
      '@c': asColor('cyan'),
      '@r': '0.5'
    }).asColor(0, 255, 255, 0.5);
    itParses('opacify(0x7800FFFF, 50%)').asColor(0, 255, 255, 1);
    itParses('opacify(0x7800FFFF, 50)').asColor(0, 255, 255, 1);
    itParses('opacify(0x7800FFFF, 0.5)').asColor(0, 255, 255, 1);
    itParses('opacify(0x7800FFFF, .5)').asColor(0, 255, 255, 1);
    itParses('fadein(0x7800FFFF, 0.5)').asColor(0, 255, 255, 1);
    itParses('fade-in(0x7800FFFF, 0.5)').asColor(0, 255, 255, 1);
    itParses('fade_in(0x7800FFFF, 0.5)').asColor(0, 255, 255, 1);
    itParses('fadein(0x7800FFFF, .5)').asColor(0, 255, 255, 1);
    itParses('fadein(0x7800FFFF, @r)').asInvalid();
    itParses('fadein($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('fadein(@c, @r)').withContext({
      '@c': asColor('0x7800FFFF'),
      '@r': '0.5'
    }).asColor(0, 255, 255, 1);
    itParses('fadein(@a, @r)').withContext({
      '@a': asColor('rgba(@c, 1)'),
      '@c': asColor('0x7800FFFF'),
      '@r': '0.5'
    }).asColor(0, 255, 255, 1);
    itParses('saturate(#855, 20%)').asColor(158, 63, 63);
    itParses('saturate(#855, 20)').asColor(158, 63, 63);
    itParses('saturate(#855, 0.2)').asColor(158, 63, 63);
    itParses('saturate(#855, @r)').asInvalid();
    itParses('saturate($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('saturate(@c, @r)').withContext({
      '@c': asColor('#855'),
      '@r': '0.2'
    }).asColor(158, 63, 63);
    itParses('saturate(@a, @r)').withContext({
      '@a': asColor('rgba(@c, 1)'),
      '@c': asColor('#855'),
      '@r': '0.2'
    }).asColor(158, 63, 63);
    itParses('desaturate(#9e3f3f, 20%)').asColor(136, 85, 85);
    itParses('desaturate(#9e3f3f, 20)').asColor(136, 85, 85);
    itParses('desaturate(#9e3f3f, 0.2)').asColor(136, 85, 85);
    itParses('desaturate(#9e3f3f, .2)').asColor(136, 85, 85);
    itParses('desaturate(#9e3f3f, @r)').asInvalid();
    itParses('desaturate($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('desaturate(@c, @r)').withContext({
      '@c': asColor('#9e3f3f'),
      '@r': '0.2'
    }).asColor(136, 85, 85);
    itParses('desaturate(@a, @r)').withContext({
      '@a': asColor('rgba(@c, 1)'),
      '@c': asColor('#9e3f3f'),
      '@r': '0.2'
    }).asColor(136, 85, 85);
    itParses('grayscale(#9e3f3f)').asColor(111, 111, 111);
    itParses('greyscale(#9e3f3f)').asColor(111, 111, 111);
    itParses('grayscale(@c)').asInvalid();
    itParses('grayscale($c)').withContext({
      '$c': asColor('hsv($h, $s, $v)')
    }).asInvalid();
    itParses('grayscale(@c)').withContext({
      '@c': asColor('#9e3f3f')
    }).asColor(111, 111, 111);
    itParses('grayscale(@a)').withContext({
      '@a': asColor('rgba(@c, 1)'),
      '@c': asColor('#9e3f3f')
    }).asColor(111, 111, 111);
    itParses('invert(#9e3f3f)').asColor(97, 192, 192);
    itParses('invert(@c)').asInvalid();
    itParses('invert($c)').withContext({
      '$c': asColor('hsv($h, $s, $v)')
    }).asInvalid();
    itParses('invert(@c)').withContext({
      '@c': asColor('#9e3f3f')
    }).asColor(97, 192, 192);
    itParses('invert(@a)').withContext({
      '@a': asColor('rgba(@c, 1)'),
      '@c': asColor('#9e3f3f')
    }).asColor(97, 192, 192);
    itParses('adjust-hue(#811, 45deg)').asColor(136, 106, 17);
    itParses('adjust-hue(#811, -45deg)').asColor(136, 17, 106);
    itParses('adjust-hue(#811, 45%)').asColor(136, 106, 17);
    itParses('adjust-hue(#811, -45%)').asColor(136, 17, 106);
    itParses('adjust-hue(#811, 45)').asColor(136, 106, 17);
    itParses('adjust-hue(#811, -45)').asColor(136, 17, 106);
    itParses('adjust-hue($c, $r)').asInvalid();
    itParses('adjust-hue($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('adjust-hue($c, $r)').withContext({
      '$c': asColor('#811'),
      '$r': '-45deg'
    }).asColor(136, 17, 106);
    itParses('adjust-hue($a, $r)').withContext({
      '$a': asColor('rgba($c, 0.5)'),
      '$c': asColor('#811'),
      '$r': '-45deg'
    }).asColor(136, 17, 106, 0.5);
    itParses('mix(rgb(255,0,0), blue)').asColor(127, 0, 127);
    itParses('mix(red, rgb(0,0,255), 25%)').asColor(63, 0, 191);
    itParses('mix(#ff0000, 0x0000ff)').asColor('#7f007f');
    itParses('mix(#ff0000, 0x0000ff, 25%)').asColor('#3f00bf');
    itParses('mix(red, rgb(0,0,255), 25)').asColor(63, 0, 191);
    itParses('mix($a, $b, $r)').asInvalid();
    itParses('mix($a, $b, $r)').withContext({
      '$a': asColor('hsv($h, $s, $v)'),
      '$b': asColor('blue'),
      '$r': '25%'
    }).asInvalid();
    itParses('mix($a, $b, $r)').withContext({
      '$a': asColor('blue'),
      '$b': asColor('hsv($h, $s, $v)'),
      '$r': '25%'
    }).asInvalid();
    itParses('mix($a, $b, $r)').withContext({
      '$a': asColor('red'),
      '$b': asColor('blue'),
      '$r': '25%'
    }).asColor(63, 0, 191);
    itParses('mix($c, $d, $r)').withContext({
      '$a': asColor('red'),
      '$b': asColor('blue'),
      '$c': asColor('rgba($a, 1)'),
      '$d': asColor('rgba($b, 1)'),
      '$r': '25%'
    }).asColor(63, 0, 191);
    describe('stylus and less', function() {
      beforeEach(function() {
        return this.scope = 'styl';
      });
      itParses('tint(#fd0cc7,66%)').asColor(254, 172, 235);
      itParses('tint(#fd0cc7,66)').asColor(254, 172, 235);
      itParses('tint($c,$r)').asInvalid();
      itParses('tint($c, $r)').withContext({
        '$c': asColor('hsv($h, $s, $v)'),
        '$r': '1'
      }).asInvalid();
      itParses('tint($c,$r)').withContext({
        '$c': asColor('#fd0cc7'),
        '$r': '66%'
      }).asColor(254, 172, 235);
      itParses('tint($c,$r)').withContext({
        '$a': asColor('#fd0cc7'),
        '$c': asColor('rgba($a, 0.9)'),
        '$r': '66%'
      }).asColor(254, 172, 235, 0.966);
      itParses('shade(#fd0cc7,66%)').asColor(86, 4, 67);
      itParses('shade(#fd0cc7,66)').asColor(86, 4, 67);
      itParses('shade($c,$r)').asInvalid();
      itParses('shade($c, $r)').withContext({
        '$c': asColor('hsv($h, $s, $v)'),
        '$r': '1'
      }).asInvalid();
      itParses('shade($c,$r)').withContext({
        '$c': asColor('#fd0cc7'),
        '$r': '66%'
      }).asColor(86, 4, 67);
      return itParses('shade($c,$r)').withContext({
        '$a': asColor('#fd0cc7'),
        '$c': asColor('rgba($a, 0.9)'),
        '$r': '66%'
      }).asColor(86, 4, 67, 0.966);
    });
    describe('scss and sass', function() {
      describe('with compass implementation', function() {
        beforeEach(function() {
          return this.scope = 'sass:compass';
        });
        itParses('tint(#BADA55, 42%)').asColor('#e2efb7');
        itParses('tint(#BADA55, 42)').asColor('#e2efb7');
        itParses('tint($c,$r)').asInvalid();
        itParses('tint($c, $r)').withContext({
          '$c': asColor('hsv($h, $s, $v)'),
          '$r': '1'
        }).asInvalid();
        itParses('tint($c,$r)').withContext({
          '$c': asColor('#BADA55'),
          '$r': '42%'
        }).asColor('#e2efb7');
        itParses('tint($c,$r)').withContext({
          '$a': asColor('#BADA55'),
          '$c': asColor('rgba($a, 0.9)'),
          '$r': '42%'
        }).asColor(226, 239, 183, 0.942);
        itParses('shade(#663399, 42%)').asColor('#2a1540');
        itParses('shade(#663399, 42)').asColor('#2a1540');
        itParses('shade($c,$r)').asInvalid();
        itParses('shade($c, $r)').withContext({
          '$c': asColor('hsv($h, $s, $v)'),
          '$r': '1'
        }).asInvalid();
        itParses('shade($c,$r)').withContext({
          '$c': asColor('#663399'),
          '$r': '42%'
        }).asColor('#2a1540');
        return itParses('shade($c,$r)').withContext({
          '$a': asColor('#663399'),
          '$c': asColor('rgba($a, 0.9)'),
          '$r': '42%'
        }).asColor(0x2a, 0x15, 0x40, 0.942);
      });
      return describe('with bourbon implementation', function() {
        beforeEach(function() {
          return this.scope = 'sass:bourbon';
        });
        itParses('tint(#BADA55, 42%)').asColor(214, 233, 156);
        itParses('tint(#BADA55, 42)').asColor(214, 233, 156);
        itParses('tint($c,$r)').asInvalid();
        itParses('tint($c, $r)').withContext({
          '$c': asColor('hsv($h, $s, $v)'),
          '$r': '1'
        }).asInvalid();
        itParses('tint($c,$r)').withContext({
          '$c': asColor('#BADA55'),
          '$r': '42%'
        }).asColor(214, 233, 156);
        itParses('tint($c,$r)').withContext({
          '$a': asColor('#BADA55'),
          '$c': asColor('rgba($a, 0.9)'),
          '$r': '42%'
        }).asColor(214, 233, 156, 0.942);
        itParses('shade(#663399, 42%)').asColor(59, 29, 88);
        itParses('shade(#663399, 42)').asColor(59, 29, 88);
        itParses('shade($c,$r)').asInvalid();
        itParses('shade($c, $r)').withContext({
          '$c': asColor('hsv($h, $s, $v)'),
          '$r': '1'
        }).asInvalid();
        itParses('shade($c,$r)').withContext({
          '$c': asColor('#663399'),
          '$r': '42%'
        }).asColor(59, 29, 88);
        return itParses('shade($c,$r)').withContext({
          '$a': asColor('#663399'),
          '$c': asColor('rgba($a, 0.9)'),
          '$r': '42%'
        }).asColor(59, 29, 88, 0.942);
      });
    });
    itParses('adjust-color(#102030, $red: -5, $blue: 5)', 11, 32, 53);
    itParses('adjust-color(hsl(25, 100%, 80%), $lightness: -30%, $alpha: -0.4)', 255, 106, 0, 0.6);
    itParses('adjust-color($c, $red: $a, $blue: $b)').asInvalid();
    itParses('adjust-color($d, $red: $a, $blue: $b)').withContext({
      '$a': '-5',
      '$b': '5',
      '$d': asColor('rgba($c, 1)')
    }).asInvalid();
    itParses('adjust-color($c, $red: $a, $blue: $b)').withContext({
      '$a': '-5',
      '$b': '5',
      '$c': asColor('#102030')
    }).asColor(11, 32, 53);
    itParses('adjust-color($d, $red: $a, $blue: $b)').withContext({
      '$a': '-5',
      '$b': '5',
      '$c': asColor('#102030'),
      '$d': asColor('rgba($c, 1)')
    }).asColor(11, 32, 53);
    itParses('scale-color(rgb(200, 150, 170), $green: -40%, $blue: 70%)').asColor(200, 90, 230);
    itParses('change-color(rgb(200, 150, 170), $green: 40, $blue: 70)').asColor(200, 40, 70);
    itParses('scale-color($c, $green: $a, $blue: $b)').asInvalid();
    itParses('scale-color($d, $green: $a, $blue: $b)').withContext({
      '$a': '-40%',
      '$b': '70%',
      '$d': asColor('rgba($c, 1)')
    }).asInvalid();
    itParses('scale-color($c, $green: $a, $blue: $b)').withContext({
      '$a': '-40%',
      '$b': '70%',
      '$c': asColor('rgb(200, 150, 170)')
    }).asColor(200, 90, 230);
    itParses('scale-color($d, $green: $a, $blue: $b)').withContext({
      '$a': '-40%',
      '$b': '70%',
      '$c': asColor('rgb(200, 150, 170)'),
      '$d': asColor('rgba($c, 1)')
    }).asColor(200, 90, 230);
    itParses('spin(#F00, 120)').asColor(0, 255, 0);
    itParses('spin(#F00, 120)').asColor(0, 255, 0);
    itParses('spin(#F00, 120deg)').asColor(0, 255, 0);
    itParses('spin(#F00, -120)').asColor(0, 0, 255);
    itParses('spin(#F00, -120deg)').asColor(0, 0, 255);
    itParses('spin(@c, @a)').withContext({
      '@c': asColor('#F00'),
      '@a': '120'
    }).asColor(0, 255, 0);
    itParses('spin(@c, @a)').withContext({
      '@a': '120'
    }).asInvalid();
    itParses('spin(@c, @a)').withContext({
      '@a': '120'
    }).asInvalid();
    itParses('spin(@c, @a,)').asUndefined();
    itParses('fade(#F00, 0.5)').asColor(255, 0, 0, 0.5);
    itParses('fade(#F00, 50%)').asColor(255, 0, 0, 0.5);
    itParses('fade(#F00, 50)').asColor(255, 0, 0, 0.5);
    itParses('fade(@c, @a)').withContext({
      '@c': asColor('#F00'),
      '@a': '0.5'
    }).asColor(255, 0, 0, 0.5);
    itParses('fade(@c, @a)').withContext({
      '@a': '0.5'
    }).asInvalid();
    itParses('fade(@c, @a)').withContext({
      '@a': '0.5'
    }).asInvalid();
    itParses('fade(@c, @a,)').asUndefined();
    itParses('contrast(#bbbbbb)').asColor(0, 0, 0);
    itParses('contrast(#333333)').asColor(255, 255, 255);
    itParses('contrast(#bbbbbb, rgb(20,20,20))').asColor(20, 20, 20);
    itParses('contrast(#333333, rgb(20,20,20), rgb(140,140,140))').asColor(140, 140, 140);
    itParses('contrast(#666666, rgb(20,20,20), rgb(140,140,140), 13%)').asColor(140, 140, 140);
    itParses('contrast(@base)').withContext({
      '@base': asColor('#bbbbbb')
    }).asColor(0, 0, 0);
    itParses('contrast(@base)').withContext({
      '@base': asColor('#333333')
    }).asColor(255, 255, 255);
    itParses('contrast(@base, @dark)').withContext({
      '@base': asColor('#bbbbbb'),
      '@dark': asColor('rgb(20,20,20)')
    }).asColor(20, 20, 20);
    itParses('contrast(@base, @dark, @light)').withContext({
      '@base': asColor('#333333'),
      '@dark': asColor('rgb(20,20,20)'),
      '@light': asColor('rgb(140,140,140)')
    }).asColor(140, 140, 140);
    itParses('contrast(@base, @dark, @light, @threshold)').withContext({
      '@base': asColor('#666666'),
      '@dark': asColor('rgb(20,20,20)'),
      '@light': asColor('rgb(140,140,140)'),
      '@threshold': '13%'
    }).asColor(140, 140, 140);
    itParses('contrast(@base)').asInvalid();
    itParses('contrast(@base)').asInvalid();
    itParses('contrast(@base, @dark)').asInvalid();
    itParses('contrast(@base, @dark, @light)').asInvalid();
    itParses('contrast(@base, @dark, @light, @threshold)').asInvalid();
    itParses('multiply(#ff6600, 0x666666)').asColor('#662900');
    itParses('multiply(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#662900');
    itParses('multiply(@base, @modifier)').asInvalid();
    itParses('screen(#ff6600, 0x666666)').asColor('#ffa366');
    itParses('screen(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#ffa366');
    itParses('screen(@base, @modifier)').asInvalid();
    itParses('overlay(#ff6600, 0x666666)').asColor('#ff5200');
    itParses('overlay(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#ff5200');
    itParses('overlay(@base, @modifier)').asInvalid();
    itParses('softlight(#ff6600, 0x666666)').asColor('#ff5a00');
    itParses('softlight(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#ff5a00');
    itParses('softlight(@base, @modifier)').asInvalid();
    itParses('hardlight(#ff6600, 0x666666)').asColor('#cc5200');
    itParses('hardlight(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#cc5200');
    itParses('hardlight(@base, @modifier)').asInvalid();
    itParses('difference(#ff6600, 0x666666)').asColor('#990066');
    itParses('difference(#ff6600,)()').asInvalid();
    itParses('difference(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#990066');
    itParses('difference(@base, @modifier)').asInvalid();
    itParses('exclusion(#ff6600, 0x666666)').asColor('#997a66');
    itParses('exclusion(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#997a66');
    itParses('exclusion(@base, @modifier)').asInvalid();
    itParses('average(#ff6600, 0x666666)').asColor('#b36633');
    itParses('average(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#b36633');
    itParses('average(@base, @modifier)').asInvalid();
    itParses('average(@gradient-b, @gradient-mean)').withContext({
      '@gradient-a': asColor('#00d38b'),
      '@gradient-b': asColor('#009285'),
      '@gradient-mean': asColor('average(@gradient-a, @gradient-b)')
    }).asColor('#00a287');
    itParses('negation(#ff6600, 0x666666)').asColor('#99cc66');
    itParses('negation(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#99cc66');
    itParses('negation(@base, @modifier)').asInvalid();
    itParses('blend(rgba(#FFDE00,.42), 0x19C261)').asColor('#7ace38');
    itParses('blend(@top, @bottom)').withContext({
      '@top': asColor('rgba(#FFDE00,.42)'),
      '@bottom': asColor('0x19C261')
    }).asColor('#7ace38');
    itParses('blend(@top, @bottom)').asInvalid();
    itParses('complement(red)').asColor('#00ffff');
    itParses('complement(@base)').withContext({
      '@base': asColor('red')
    }).asColor('#00ffff');
    itParses('complement(@base)').asInvalid();
    itParses('transparentify(#808080)').asColor(0, 0, 0, 0.5);
    itParses('transparentify(#414141, black)').asColor(255, 255, 255, 0.25);
    itParses('transparentify(#91974C, 0xF34949, 0.5)').asColor(47, 229, 79, 0.5);
    itParses('transparentify(a)').withContext({
      'a': asColor('#808080')
    }).asColor(0, 0, 0, 0.5);
    itParses('transparentify(a, b, 0.5)').withContext({
      'a': asColor('#91974C'),
      'b': asColor('#F34949')
    }).asColor(47, 229, 79, 0.5);
    itParses('transparentify(a)').asInvalid();
    itParses('red(#000, 255)').asColor(255, 0, 0);
    itParses('red(a, b)').withContext({
      'a': asColor('#000'),
      'b': '255'
    }).asColor(255, 0, 0);
    itParses('red(a, b)').asInvalid();
    itParses('green(#000, 255)').asColor(0, 255, 0);
    itParses('green(a, b)').withContext({
      'a': asColor('#000'),
      'b': '255'
    }).asColor(0, 255, 0);
    itParses('green(a, b)').asInvalid();
    itParses('blue(#000, 255)').asColor(0, 0, 255);
    itParses('blue(a, b)').withContext({
      'a': asColor('#000'),
      'b': '255'
    }).asColor(0, 0, 255);
    itParses('blue(a, b)').asInvalid();
    itParses('alpha(#000, 0.5)').asColor(0, 0, 0, 0.5);
    itParses('alpha(a, b)').withContext({
      'a': asColor('#000'),
      'b': '0.5'
    }).asColor(0, 0, 0, 0.5);
    itParses('alpha(a, b)').asInvalid();
    itParses('hue(#00c, 90deg)').asColor(0x66, 0xCC, 0);
    itParses('hue(a, b)').withContext({
      'a': asColor('#00c'),
      'b': '90deg'
    }).asColor(0x66, 0xCC, 0);
    itParses('hue(a, b)').asInvalid();
    itParses('saturation(#00c, 50%)').asColor(0x33, 0x33, 0x99);
    itParses('saturation(a, b)').withContext({
      'a': asColor('#00c'),
      'b': '50%'
    }).asColor(0x33, 0x33, 0x99);
    itParses('saturation(a, b)').asInvalid();
    itParses('lightness(#00c, 80%)').asColor(0x99, 0x99, 0xff);
    itParses('lightness(a, b)').withContext({
      'a': asColor('#00c'),
      'b': '80%'
    }).asColor(0x99, 0x99, 0xff);
    itParses('lightness(a, b)').asInvalid();
    describe('CSS color function', function() {
      beforeEach(function() {
        return this.scope = 'css';
      });
      itParses('color(#fd0cc7 tint(66%))').asColor(254, 172, 236);
      itParses('COLOR(#fd0cc7 tint(66%))').asColor(254, 172, 236);
      itParses('cOlOr(#fd0cc7 tint(66%))').asColor(254, 172, 236);
      return itParses('color(var(--foo) tint(66%))').withContext({
        'var(--foo)': asColor('#fd0cc7')
      }).asColor(254, 172, 236);
    });
    describe('lua color', function() {
      beforeEach(function() {
        return this.scope = 'lua';
      });
      itParses('Color(255, 0, 0, 255)').asColor(255, 0, 0);
      itParses('Color(r, g, b, a)').withContext({
        'r': '255',
        'g': '0',
        'b': '0',
        'a': '255'
      }).asColor(255, 0, 0);
      return itParses('Color(r, g, b, a)').asInvalid();
    });
    describe('elm-lang support', function() {
      beforeEach(function() {
        return this.scope = 'elm';
      });
      itParses('rgba 255 0 0 1').asColor(255, 0, 0);
      itParses('rgba r g b a').withContext({
        'r': '255',
        'g': '0',
        'b': '0',
        'a': '1'
      }).asColor(255, 0, 0);
      itParses('rgba r g b a').asInvalid();
      itParses('rgb 255 0 0').asColor(255, 0, 0);
      itParses('rgb r g b').withContext({
        'r': '255',
        'g': '0',
        'b': '0'
      }).asColor(255, 0, 0);
      itParses('rgb r g b').asInvalid();
      itParses('hsla (degrees 200) 50 50 0.5').asColor(64, 149, 191, 0.5);
      itParses('hsla (degrees h) s l a').withContext({
        'h': '200',
        's': '50',
        'l': '50',
        'a': '0.5'
      }).asColor(64, 149, 191, 0.5);
      itParses('hsla (degrees h) s l a').asInvalid();
      itParses('hsla 3.49 50 50 0.5').asColor(64, 149, 191, 0.5);
      itParses('hsla h s l a').withContext({
        'h': '3.49',
        's': '50',
        'l': '50',
        'a': '0.5'
      }).asColor(64, 149, 191, 0.5);
      itParses('hsla h s l a').asInvalid();
      itParses('hsl (degrees 200) 50 50').asColor(64, 149, 191);
      itParses('hsl (degrees h) s l').withContext({
        'h': '200',
        's': '50',
        'l': '50'
      }).asColor(64, 149, 191);
      itParses('hsl (degrees h) s l').asInvalid();
      itParses('hsl 3.49 50 50').asColor(64, 149, 191);
      itParses('hsl h s l').withContext({
        'h': '3.49',
        's': '50',
        'l': '50'
      }).asColor(64, 149, 191);
      itParses('hsl h s l').asInvalid();
      itParses('grayscale 1').asColor(0, 0, 0);
      itParses('greyscale 0.5').asColor(127, 127, 127);
      itParses('grayscale 0').asColor(255, 255, 255);
      itParses('grayscale g').withContext({
        'g': '0.5'
      }).asColor(127, 127, 127);
      itParses('grayscale g').asInvalid();
      itParses('complement rgb 255 0 0').asColor('#00ffff');
      itParses('complement base').withContext({
        'base': asColor('red')
      }).asColor('#00ffff');
      return itParses('complement base').asInvalid();
    });
    return describe('latex support', function() {
      beforeEach(function() {
        return this.scope = 'tex';
      });
      itParses('[gray]{1}').asColor('#ffffff');
      itParses('[rgb]{1,0.5,0}').asColor('#ff7f00');
      itParses('[RGB]{255,127,0}').asColor('#ff7f00');
      itParses('[cmyk]{0,0.5,1,0}').asColor('#ff7f00');
      itParses('[HTML]{ff7f00}').asColor('#ff7f00');
      itParses('{blue}').asColor('#0000ff');
      itParses('{blue!20}').asColor('#ccccff');
      itParses('{blue!20!black}').asColor('#000033');
      return itParses('{blue!20!black!30!green}').asColor('#00590f');
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9jb2xvci1wYXJzZXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0RBQUE7O0FBQUEsRUFBQSxPQUFBLENBQVEsb0JBQVIsQ0FBQSxDQUFBOztBQUFBLEVBRUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUixDQUZkLENBQUE7O0FBQUEsRUFHQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSLENBSGYsQ0FBQTs7QUFBQSxFQUlBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHlCQUFSLENBSmxCLENBQUE7O0FBQUEsRUFLQSxRQUFBLEdBQVcsT0FBQSxDQUFRLDBCQUFSLENBTFgsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixRQUFBLG9DQUFBO0FBQUEsSUFBQyxTQUFVLEtBQVgsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsa0JBQUE7QUFBQSxNQUFBLGtCQUFBLEdBQXFCLFFBQVEsQ0FBQyxhQUFULENBQXVCLHVCQUF2QixDQUFyQixDQUFBO2FBQ0Esa0JBQWtCLENBQUMsTUFBbkIsR0FBNEIsQ0FBQyxHQUFELEVBRm5CO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQU1BLE9BQUEsR0FBVSxTQUFDLEtBQUQsR0FBQTthQUFZLFFBQUEsR0FBUSxNQUFwQjtJQUFBLENBTlYsQ0FBQTtBQUFBLElBUUEsU0FBQSxHQUFZLFNBQUMsT0FBRCxHQUFBO0FBQ1YsTUFBQSxPQUFBLEdBQWMsSUFBQSxZQUFBLG1CQUFhLFVBQVU7QUFBQSxRQUFDLFVBQUEsUUFBRDtPQUF2QixDQUFkLENBQUE7YUFDQSxPQUFPLENBQUMsT0FGRTtJQUFBLENB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/spec/color-parser-spec.coffee
