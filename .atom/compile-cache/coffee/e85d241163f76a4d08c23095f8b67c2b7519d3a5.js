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
              var ref;
              return expect(parser.parse(expression, (ref = this.scope) != null ? ref : 'less')).toBeColor(r, g, b, a);
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
              var ref;
              return expect(parser.parse(expression, (ref = this.scope) != null ? ref : 'less')).toBeUndefined();
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
              var ref;
              return expect(parser.parse(expression, (ref = this.scope) != null ? ref : 'less')).not.toBeValid();
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
    describe('latex support', function() {
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
    describe('qt support', function() {
      beforeEach(function() {
        return this.scope = 'qml';
      });
      return itParses('Qt.rgba(1.0,1.0,0,0.5)').asColor(255, 255, 0, 0.5);
    });
    return describe('qt cpp support', function() {
      beforeEach(function() {
        return this.scope = 'cpp';
      });
      return itParses('Qt.rgba(1.0,1.0,0,0.5)').asColor(255, 255, 0, 0.5);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9jb2xvci1wYXJzZXItc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE9BQUEsQ0FBUSxvQkFBUjs7RUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSOztFQUNkLFlBQUEsR0FBZSxPQUFBLENBQVEsc0JBQVI7O0VBQ2YsZUFBQSxHQUFrQixPQUFBLENBQVEseUJBQVI7O0VBQ2xCLFFBQUEsR0FBVyxPQUFBLENBQVEsMEJBQVI7O0VBRVgsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQTtBQUN0QixRQUFBO0lBQUMsU0FBVTtJQUVYLFVBQUEsQ0FBVyxTQUFBO0FBQ1QsVUFBQTtNQUFBLGtCQUFBLEdBQXFCLFFBQVEsQ0FBQyxhQUFULENBQXVCLHVCQUF2QjthQUNyQixrQkFBa0IsQ0FBQyxNQUFuQixHQUE0QixDQUFDLEdBQUQ7SUFGbkIsQ0FBWDtJQUlBLE9BQUEsR0FBVSxTQUFDLEtBQUQ7YUFBVyxRQUFBLEdBQVM7SUFBcEI7SUFFVixTQUFBLEdBQVksU0FBQyxPQUFEO01BQ1YsT0FBQSxHQUFjLElBQUEsWUFBQSxtQkFBYSxVQUFVO1FBQUMsVUFBQSxRQUFEO09BQXZCO2FBQ2QsT0FBTyxDQUFDO0lBRkU7SUFJWixRQUFBLEdBQVcsU0FBQyxVQUFEO2FBQ1Q7UUFBQSxXQUFBLEVBQWEsRUFBYjtRQUNBLE9BQUEsRUFBUyxTQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVA7QUFDUCxjQUFBOztZQURjLElBQUU7O1VBQ2hCLE9BQUEsR0FBVSxJQUFDLENBQUE7aUJBQ1gsUUFBQSxDQUFTLElBQUMsQ0FBQSxXQUFWLEVBQXVCLFNBQUE7WUFDckIsVUFBQSxDQUFXLFNBQUE7cUJBQUcsTUFBQSxHQUFTLFNBQUEsQ0FBVSxPQUFWO1lBQVosQ0FBWDttQkFF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YUFFQSxRQUFBLENBQVMsd0JBQVQsQ0FBa0MsQ0FBQyxPQUFuQyxDQUEyQyxHQUEzQyxFQUFnRCxHQUFoRCxFQUFxRCxDQUFyRCxFQUF3RCxHQUF4RDtJQUhxQixDQUF2QjtXQUtBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO01BQ3pCLFVBQUEsQ0FBVyxTQUFBO2VBQUcsSUFBQyxDQUFBLEtBQUQsR0FBUztNQUFaLENBQVg7YUFFQSxRQUFBLENBQVMsd0JBQVQsQ0FBa0MsQ0FBQyxPQUFuQyxDQUEyQyxHQUEzQyxFQUFnRCxHQUFoRCxFQUFxRCxDQUFyRCxFQUF3RCxHQUF4RDtJQUh5QixDQUEzQjtFQW4rQnNCLENBQXhCO0FBUEEiLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlICcuL2hlbHBlcnMvbWF0Y2hlcnMnXG5cbkNvbG9yUGFyc2VyID0gcmVxdWlyZSAnLi4vbGliL2NvbG9yLXBhcnNlcidcbkNvbG9yQ29udGV4dCA9IHJlcXVpcmUgJy4uL2xpYi9jb2xvci1jb250ZXh0J1xuQ29sb3JFeHByZXNzaW9uID0gcmVxdWlyZSAnLi4vbGliL2NvbG9yLWV4cHJlc3Npb24nXG5yZWdpc3RyeSA9IHJlcXVpcmUgJy4uL2xpYi9jb2xvci1leHByZXNzaW9ucydcblxuZGVzY3JpYmUgJ0NvbG9yUGFyc2VyJywgLT5cbiAgW3BhcnNlcl0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBzdmdDb2xvckV4cHJlc3Npb24gPSByZWdpc3RyeS5nZXRFeHByZXNzaW9uKCdwaWdtZW50czpuYW1lZF9jb2xvcnMnKVxuICAgIHN2Z0NvbG9yRXhwcmVzc2lvbi5zY29wZXMgPSBbJyonXVxuXG4gIGFzQ29sb3IgPSAodmFsdWUpIC0+IFwiY29sb3I6I3t2YWx1ZX1cIlxuXG4gIGdldFBhcnNlciA9IChjb250ZXh0KSAtPlxuICAgIGNvbnRleHQgPSBuZXcgQ29sb3JDb250ZXh0KGNvbnRleHQgPyB7cmVnaXN0cnl9KVxuICAgIGNvbnRleHQucGFyc2VyXG5cbiAgaXRQYXJzZXMgPSAoZXhwcmVzc2lvbikgLT5cbiAgICBkZXNjcmlwdGlvbjogJydcbiAgICBhc0NvbG9yOiAocixnLGIsYT0xKSAtPlxuICAgICAgY29udGV4dCA9IEBjb250ZXh0XG4gICAgICBkZXNjcmliZSBAZGVzY3JpcHRpb24sIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gcGFyc2VyID0gZ2V0UGFyc2VyKGNvbnRleHQpXG5cbiAgICAgICAgaXQgXCJwYXJzZXMgJyN7ZXhwcmVzc2lvbn0nIGFzIGEgY29sb3JcIiwgLT5cbiAgICAgICAgICBleHBlY3QocGFyc2VyLnBhcnNlKGV4cHJlc3Npb24sIEBzY29wZSA/ICdsZXNzJykpLnRvQmVDb2xvcihyLGcsYixhKVxuXG4gICAgYXNVbmRlZmluZWQ6IC0+XG4gICAgICBjb250ZXh0ID0gQGNvbnRleHRcbiAgICAgIGRlc2NyaWJlIEBkZXNjcmlwdGlvbiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBwYXJzZXIgPSBnZXRQYXJzZXIoY29udGV4dClcblxuICAgICAgICBpdCBcImRvZXMgbm90IHBhcnNlICcje2V4cHJlc3Npb259JyBhbmQgcmV0dXJuIHVuZGVmaW5lZFwiLCAtPlxuICAgICAgICAgIGV4cGVjdChwYXJzZXIucGFyc2UoZXhwcmVzc2lvbiwgQHNjb3BlID8gJ2xlc3MnKSkudG9CZVVuZGVmaW5lZCgpXG5cbiAgICBhc0ludmFsaWQ6IC0+XG4gICAgICBjb250ZXh0ID0gQGNvbnRleHRcbiAgICAgIGRlc2NyaWJlIEBkZXNjcmlwdGlvbiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBwYXJzZXIgPSBnZXRQYXJzZXIoY29udGV4dClcblxuICAgICAgICBpdCBcInBhcnNlcyAnI3tleHByZXNzaW9ufScgYXMgYW4gaW52YWxpZCBjb2xvclwiLCAtPlxuICAgICAgICAgIGV4cGVjdChwYXJzZXIucGFyc2UoZXhwcmVzc2lvbiwgQHNjb3BlID8gJ2xlc3MnKSkubm90LnRvQmVWYWxpZCgpXG5cbiAgICB3aXRoQ29udGV4dDogKHZhcmlhYmxlcykgLT5cbiAgICAgIHZhcnMgPSBbXVxuICAgICAgY29sb3JWYXJzID0gW11cbiAgICAgIHBhdGggPSBcIi9wYXRoL3RvL2ZpbGUuc3R5bFwiXG4gICAgICBmb3IgbmFtZSx2YWx1ZSBvZiB2YXJpYWJsZXNcbiAgICAgICAgaWYgdmFsdWUuaW5kZXhPZignY29sb3I6JykgaXNudCAtMVxuICAgICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgnY29sb3I6JywgJycpXG4gICAgICAgICAgdmFycy5wdXNoIHtuYW1lLCB2YWx1ZSwgcGF0aH1cbiAgICAgICAgICBjb2xvclZhcnMucHVzaCB7bmFtZSwgdmFsdWUsIHBhdGh9XG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZhcnMucHVzaCB7bmFtZSwgdmFsdWUsIHBhdGh9XG4gICAgICBAY29udGV4dCA9IHt2YXJpYWJsZXM6IHZhcnMsIGNvbG9yVmFyaWFibGVzOiBjb2xvclZhcnMsIHJlZ2lzdHJ5fVxuICAgICAgQGRlc2NyaXB0aW9uID0gXCJ3aXRoIHZhcmlhYmxlcyBjb250ZXh0ICN7amFzbWluZS5wcCB2YXJpYWJsZXN9IFwiXG5cbiAgICAgIHJldHVybiB0aGlzXG5cbiAgaXRQYXJzZXMoJ0BsaXN0LWl0ZW0taGVpZ2h0Jykud2l0aENvbnRleHQoe1xuICAgICdAdGV4dC1oZWlnaHQnOiAnQHNjYWxlLWIteHhsICogMXJlbSdcbiAgICAnQGNvbXBvbmVudC1saW5lLWhlaWdodCc6ICdAdGV4dC1oZWlnaHQnXG4gICAgJ0BsaXN0LWl0ZW0taGVpZ2h0JzogJ0Bjb21wb25lbnQtbGluZS1oZWlnaHQnXG4gICAgfSkuYXNVbmRlZmluZWQoKVxuXG4gIGl0UGFyc2VzKCckdGV4dC1jb2xvciAhZGVmYXVsdCcpLndpdGhDb250ZXh0KHtcbiAgICAnJHRleHQtY29sb3InOiBhc0NvbG9yICdjeWFuJ1xuICB9KS5hc0NvbG9yKDAsMjU1LDI1NSlcblxuICBpdFBhcnNlcygnYycpLndpdGhDb250ZXh0KHsnYyc6ICdjJ30pLmFzVW5kZWZpbmVkKClcbiAgaXRQYXJzZXMoJ2MnKS53aXRoQ29udGV4dCh7XG4gICAgJ2MnOiAnZCdcbiAgICAnZCc6ICdlJ1xuICAgICdlJzogJ2MnXG4gIH0pLmFzVW5kZWZpbmVkKClcblxuICBpdFBhcnNlcygnI2ZmN2YwMCcpLmFzQ29sb3IoMjU1LCAxMjcsIDApXG4gIGl0UGFyc2VzKCcjZjcwJykuYXNDb2xvcigyNTUsIDExOSwgMClcblxuICBpdFBhcnNlcygnI2ZmN2YwMGNjJykuYXNDb2xvcigyNTUsIDEyNywgMCwgMC44KVxuICBpdFBhcnNlcygnI2Y3MGMnKS5hc0NvbG9yKDI1NSwgMTE5LCAwLCAwLjgpXG5cbiAgaXRQYXJzZXMoJzB4ZmY3ZjAwJykuYXNDb2xvcigyNTUsIDEyNywgMClcbiAgaXRQYXJzZXMoJzB4MDBmZjdmMDAnKS5hc0NvbG9yKDI1NSwgMTI3LCAwLCAwKVxuXG4gIGRlc2NyaWJlICdpbiBjb250ZXh0IG90aGVyIHRoYW4gY3NzIGFuZCBwcmUtcHJvY2Vzc29ycycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPiBAc2NvcGUgPSAneGFtbCdcblxuICAgIGl0UGFyc2VzKCcjY2NmZjdmMDAnKS5hc0NvbG9yKDI1NSwgMTI3LCAwLCAwLjgpXG5cbiAgaXRQYXJzZXMoJ3JnYigyNTUsMTI3LDApJykuYXNDb2xvcigyNTUsIDEyNywgMClcbiAgaXRQYXJzZXMoJ3JnYigyNTUsMTI3LDApJykuYXNDb2xvcigyNTUsIDEyNywgMClcbiAgaXRQYXJzZXMoJ1JHQigyNTUsMTI3LDApJykuYXNDb2xvcigyNTUsIDEyNywgMClcbiAgaXRQYXJzZXMoJ1JnQigyNTUsMTI3LDApJykuYXNDb2xvcigyNTUsIDEyNywgMClcbiAgaXRQYXJzZXMoJ3JHYigyNTUsMTI3LDApJykuYXNDb2xvcigyNTUsIDEyNywgMClcbiAgaXRQYXJzZXMoJ3JnYigkciwkZywkYiknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygncmdiKCRyLDAsMCknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygncmdiKDAsJGcsMCknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygncmdiKDAsMCwkYiknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygncmdiKCRyLCRnLCRiKScpLndpdGhDb250ZXh0KHtcbiAgICAnJHInOiAnMjU1J1xuICAgICckZyc6ICcxMjcnXG4gICAgJyRiJzogJzAnXG4gIH0pLmFzQ29sb3IoMjU1LCAxMjcsIDApXG5cbiAgaXRQYXJzZXMoJ3JnYmEoMjU1LDEyNywwLDAuNSknKS5hc0NvbG9yKDI1NSwgMTI3LCAwLCAwLjUpXG4gIGl0UGFyc2VzKCdyZ2JhKDI1NSwxMjcsMCwuNSknKS5hc0NvbG9yKDI1NSwgMTI3LCAwLCAwLjUpXG4gIGl0UGFyc2VzKCdSR0JBKDI1NSwxMjcsMCwuNSknKS5hc0NvbG9yKDI1NSwgMTI3LCAwLCAwLjUpXG4gIGl0UGFyc2VzKCdyR2JBKDI1NSwxMjcsMCwuNSknKS5hc0NvbG9yKDI1NSwgMTI3LCAwLCAwLjUpXG4gIGl0UGFyc2VzKCdyZ2JhKDI1NSwxMjcsMCwpJykuYXNVbmRlZmluZWQoKVxuICBpdFBhcnNlcygncmdiYSgkciwkZywkYiwkYSknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygncmdiYSgkciwwLDAsMCknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygncmdiYSgwLCRnLDAsMCknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygncmdiYSgwLDAsJGIsMCknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygncmdiYSgwLDAsMCwkYSknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygncmdiYSgkciwkZywkYiwkYSknKS53aXRoQ29udGV4dCh7XG4gICAgJyRyJzogJzI1NSdcbiAgICAnJGcnOiAnMTI3J1xuICAgICckYic6ICcwJ1xuICAgICckYSc6ICcwLjUnXG4gIH0pLmFzQ29sb3IoMjU1LCAxMjcsIDAsIDAuNSlcblxuICBpdFBhcnNlcygncmdiYShncmVlbiwgMC41KScpLmFzQ29sb3IoMCwgMTI4LCAwLCAwLjUpXG4gIGl0UGFyc2VzKCdyZ2JhKCRjLCRhLCknKS5hc1VuZGVmaW5lZCgpXG4gIGl0UGFyc2VzKCdyZ2JhKCRjLCRhKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdyZ2JhKCRjLDEpJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ3JnYmEoJGMsICRyKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGMnOiBhc0NvbG9yICdoc3YoJGgsICRzLCAkdiknXG4gICAgJyRyJzogJzEnXG4gIH0pLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdyZ2JhKCRjLCRhKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGMnOiBhc0NvbG9yICdncmVlbidcbiAgICAnJGEnOiAnMC41J1xuICB9KS5hc0NvbG9yKDAsIDEyOCwgMCwgMC41KVxuXG4gIGRlc2NyaWJlICdjc3MnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT4gQHNjb3BlID0gJ2NzcydcblxuICAgIGl0UGFyc2VzKCdoc2woMjAwLDUwJSw1MCUpJykuYXNDb2xvcig2NCwgMTQ5LCAxOTEpXG4gICAgaXRQYXJzZXMoJ2hzbCgyMDAsNTAsNTApJykuYXNDb2xvcig2NCwgMTQ5LCAxOTEpXG4gICAgaXRQYXJzZXMoJ0hTTCgyMDAsNTAsNTApJykuYXNDb2xvcig2NCwgMTQ5LCAxOTEpXG4gICAgaXRQYXJzZXMoJ2hTbCgyMDAsNTAsNTApJykuYXNDb2xvcig2NCwgMTQ5LCAxOTEpXG4gICAgaXRQYXJzZXMoJ2hzbCgyMDAuNSw1MC41LDUwLjUpJykuYXNDb2xvcig2NSwgMTUwLCAxOTMpXG4gICAgaXRQYXJzZXMoJ2hzbCgkaCwkcywkbCwpJykuYXNVbmRlZmluZWQoKVxuICAgIGl0UGFyc2VzKCdoc2woJGgsJHMsJGwpJykuYXNJbnZhbGlkKClcbiAgICBpdFBhcnNlcygnaHNsKCRoLDAlLDAlKScpLmFzSW52YWxpZCgpXG4gICAgaXRQYXJzZXMoJ2hzbCgwLCRzLDAlKScpLmFzSW52YWxpZCgpXG4gICAgaXRQYXJzZXMoJ2hzbCgwLDAlLCRsKScpLmFzSW52YWxpZCgpXG4gICAgaXRQYXJzZXMoJ2hzbCgkaCwkcywkbCknKS53aXRoQ29udGV4dCh7XG4gICAgICAnJGgnOiAnMjAwJ1xuICAgICAgJyRzJzogJzUwJSdcbiAgICAgICckbCc6ICc1MCUnXG4gICAgfSkuYXNDb2xvcig2NCwgMTQ5LCAxOTEpXG5cbiAgZGVzY3JpYmUgJ2xlc3MnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT4gQHNjb3BlID0gJ2xlc3MnXG5cbiAgICBpdFBhcnNlcygnaHNsKDI4NSwgMC43LCAwLjcpJykuYXNDb2xvcignI2NkN2RlOCcpXG4gICAgaXRQYXJzZXMoJ2hzbCgyMDAsNTAlLDUwJSknKS5hc0NvbG9yKDY0LCAxNDksIDE5MSlcblxuICBpdFBhcnNlcygnaHNsYSgyMDAsNTAlLDUwJSwwLjUpJykuYXNDb2xvcig2NCwgMTQ5LCAxOTEsIDAuNSlcbiAgaXRQYXJzZXMoJ2hzbGEoMjAwLDUwJSw1MCUsLjUpJykuYXNDb2xvcig2NCwgMTQ5LCAxOTEsIDAuNSlcbiAgaXRQYXJzZXMoJ2hzbGEoMjAwLDUwLDUwLC41KScpLmFzQ29sb3IoNjQsIDE0OSwgMTkxLCAwLjUpXG4gIGl0UGFyc2VzKCdIU0xBKDIwMCw1MCw1MCwuNSknKS5hc0NvbG9yKDY0LCAxNDksIDE5MSwgMC41KVxuICBpdFBhcnNlcygnSHNMYSgyMDAsNTAsNTAsLjUpJykuYXNDb2xvcig2NCwgMTQ5LCAxOTEsIDAuNSlcbiAgaXRQYXJzZXMoJ2hzbGEoMjAwLjUsNTAuNSw1MC41LC41KScpLmFzQ29sb3IoNjUsIDE1MCwgMTkzLCAwLjUpXG4gIGl0UGFyc2VzKCdoc2xhKDIwMCw1MCUsNTAlLCknKS5hc1VuZGVmaW5lZCgpXG4gIGl0UGFyc2VzKCdoc2xhKCRoLCRzLCRsLCRhKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdoc2xhKCRoLDAlLDAlLDApJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2hzbGEoMCwkcywwJSwwKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdoc2xhKDAsMCUsJGwsMCknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnaHNsYSgwLDAlLDAlLCRhKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdoc2xhKCRoLCRzLCRsLCRhKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGgnOiAnMjAwJ1xuICAgICckcyc6ICc1MCUnXG4gICAgJyRsJzogJzUwJSdcbiAgICAnJGEnOiAnMC41J1xuICB9KS5hc0NvbG9yKDY0LCAxNDksIDE5MSwgMC41KVxuXG4gIGl0UGFyc2VzKCdoc3YoMjAwLDUwJSw1MCUpJykuYXNDb2xvcig2NCwgMTA2LCAxMjgpXG4gIGl0UGFyc2VzKCdIU1YoMjAwLDUwJSw1MCUpJykuYXNDb2xvcig2NCwgMTA2LCAxMjgpXG4gIGl0UGFyc2VzKCdoU3YoMjAwLDUwJSw1MCUpJykuYXNDb2xvcig2NCwgMTA2LCAxMjgpXG4gIGl0UGFyc2VzKCdoc2IoMjAwLDUwJSw1MCUpJykuYXNDb2xvcig2NCwgMTA2LCAxMjgpXG4gIGl0UGFyc2VzKCdoc2IoMjAwLDUwLDUwKScpLmFzQ29sb3IoNjQsIDEwNiwgMTI4KVxuICBpdFBhcnNlcygnaHNiKDIwMC41LDUwLjUsNTAuNSknKS5hc0NvbG9yKDY0LCAxMDcsIDEyOSlcbiAgaXRQYXJzZXMoJ2hzdigkaCwkcywkdiwpJykuYXNVbmRlZmluZWQoKVxuICBpdFBhcnNlcygnaHN2KCRoLCRzLCR2KScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdoc3YoJGgsMCUsMCUpJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2hzdigwLCRzLDAlKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdoc3YoMCwwJSwkdiknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnaHN2KCRoLCRzLCR2KScpLndpdGhDb250ZXh0KHtcbiAgICAnJGgnOiAnMjAwJ1xuICAgICckcyc6ICc1MCUnXG4gICAgJyR2JzogJzUwJSdcbiAgfSkuYXNDb2xvcig2NCwgMTA2LCAxMjgpXG5cbiAgaXRQYXJzZXMoJ2hzdmEoMjAwLDUwJSw1MCUsMC41KScpLmFzQ29sb3IoNjQsIDEwNiwgMTI4LCAwLjUpXG4gIGl0UGFyc2VzKCdoc3ZhKDIwMCw1MCw1MCwwLjUpJykuYXNDb2xvcig2NCwgMTA2LCAxMjgsIDAuNSlcbiAgaXRQYXJzZXMoJ0hTVkEoMjAwLDUwLDUwLDAuNSknKS5hc0NvbG9yKDY0LCAxMDYsIDEyOCwgMC41KVxuICBpdFBhcnNlcygnaHNiYSgyMDAsNTAlLDUwJSwwLjUpJykuYXNDb2xvcig2NCwgMTA2LCAxMjgsIDAuNSlcbiAgaXRQYXJzZXMoJ0hzQmEoMjAwLDUwJSw1MCUsMC41KScpLmFzQ29sb3IoNjQsIDEwNiwgMTI4LCAwLjUpXG4gIGl0UGFyc2VzKCdoc3ZhKDIwMCw1MCUsNTAlLC41KScpLmFzQ29sb3IoNjQsIDEwNiwgMTI4LCAwLjUpXG4gIGl0UGFyc2VzKCdoc3ZhKDIwMC41LDUwLjUsNTAuNSwuNSknKS5hc0NvbG9yKDY0LCAxMDcsIDEyOSwgMC41KVxuICBpdFBhcnNlcygnaHN2YSgyMDAsNTAlLDUwJSwpJykuYXNVbmRlZmluZWQoKVxuICBpdFBhcnNlcygnaHN2YSgkaCwkcywkdiwkYSknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnaHN2YSgkaCwwJSwwJSwwKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdoc3ZhKDAsJHMsMCUsMCknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnaHN2YSgwLDAlLCR2LDApJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2hzdmEoJGgsJHMsJHYsJGEpJykud2l0aENvbnRleHQoe1xuICAgICckaCc6ICcyMDAnXG4gICAgJyRzJzogJzUwJSdcbiAgICAnJHYnOiAnNTAlJ1xuICAgICckYSc6ICcwLjUnXG4gIH0pLmFzQ29sb3IoNjQsIDEwNiwgMTI4LCAwLjUpXG5cbiAgaXRQYXJzZXMoJ2hjZygyMDAsNTAlLDUwJSknKS5hc0NvbG9yKDY0LCAxNDksIDE5MSlcbiAgaXRQYXJzZXMoJ0hDRygyMDAsNTAlLDUwJSknKS5hc0NvbG9yKDY0LCAxNDksIDE5MSlcbiAgaXRQYXJzZXMoJ2hjZygyMDAsNTAsNTApJykuYXNDb2xvcig2NCwgMTQ5LCAxOTEpXG4gIGl0UGFyc2VzKCdoY2coMjAwLjUsNTAuNSw1MC41KScpLmFzQ29sb3IoNjQsIDE1MCwgMTkzKVxuICBpdFBhcnNlcygnaGNnKCRoLCRjLCRnLCknKS5hc1VuZGVmaW5lZCgpXG4gIGl0UGFyc2VzKCdoY2coJGgsJGMsJGcpJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2hjZygkaCwwJSwwJSknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnaGNnKDAsJGMsMCUpJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2hjZygwLDAlLCRnKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdoY2coJGgsJGMsJGcpJykud2l0aENvbnRleHQoe1xuICAgICckaCc6ICcyMDAnXG4gICAgJyRjJzogJzUwJSdcbiAgICAnJGcnOiAnNTAlJ1xuICB9KS5hc0NvbG9yKDY0LCAxNDksIDE5MSlcblxuICBpdFBhcnNlcygnaGNnYSgyMDAsNTAlLDUwJSwwLjUpJykuYXNDb2xvcig2NCwgMTQ5LCAxOTEsIDAuNSlcbiAgaXRQYXJzZXMoJ2hjZ2EoMjAwLDUwLDUwLDAuNSknKS5hc0NvbG9yKDY0LCAxNDksIDE5MSwgMC41KVxuICBpdFBhcnNlcygnSENHQSgyMDAsNTAsNTAsMC41KScpLmFzQ29sb3IoNjQsIDE0OSwgMTkxLCAwLjUpXG4gIGl0UGFyc2VzKCdoY2dhKDIwMCw1MCUsNTAlLC41KScpLmFzQ29sb3IoNjQsIDE0OSwgMTkxLCAwLjUpXG4gIGl0UGFyc2VzKCdoY2dhKDIwMC41LDUwLjUsNTAuNSwuNSknKS5hc0NvbG9yKDY0LCAxNTAsIDE5MywgMC41KVxuICBpdFBhcnNlcygnaGNnYSgyMDAsNTAlLDUwJSwpJykuYXNVbmRlZmluZWQoKVxuICBpdFBhcnNlcygnaGNnYSgkaCwkYywkZywkYSknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnaGNnYSgkaCwwJSwwJSwwKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdoY2dhKDAsJGMsMCUsMCknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnaGNnYSgwLDAlLCRnLDApJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2hjZ2EoJGgsJGMsJGcsJGEpJykud2l0aENvbnRleHQoe1xuICAgICckaCc6ICcyMDAnXG4gICAgJyRjJzogJzUwJSdcbiAgICAnJGcnOiAnNTAlJ1xuICAgICckYSc6ICcwLjUnXG4gIH0pLmFzQ29sb3IoNjQsIDE0OSwgMTkxLCAwLjUpXG5cbiAgaXRQYXJzZXMoJ2h3YigyMTAsNDAlLDQwJSknKS5hc0NvbG9yKDEwMiwgMTI4LCAxNTMpXG4gIGl0UGFyc2VzKCdod2IoMjEwLDQwLDQwKScpLmFzQ29sb3IoMTAyLCAxMjgsIDE1MylcbiAgaXRQYXJzZXMoJ0hXQigyMTAsNDAsNDApJykuYXNDb2xvcigxMDIsIDEyOCwgMTUzKVxuICBpdFBhcnNlcygnaFdiKDIxMCw0MCw0MCknKS5hc0NvbG9yKDEwMiwgMTI4LCAxNTMpXG4gIGl0UGFyc2VzKCdod2IoMjEwLDQwJSw0MCUsIDAuNSknKS5hc0NvbG9yKDEwMiwgMTI4LCAxNTMsIDAuNSlcbiAgaXRQYXJzZXMoJ2h3YigyMTAuNSw0MC41LDQwLjUpJykuYXNDb2xvcigxMDMsIDEyOCwgMTUyKVxuICBpdFBhcnNlcygnaHdiKDIxMC41LDQwLjUlLDQwLjUlLCAwLjUpJykuYXNDb2xvcigxMDMsIDEyOCwgMTUyLCAwLjUpXG4gIGl0UGFyc2VzKCdod2IoJGgsJHcsJGIsKScpLmFzVW5kZWZpbmVkKClcbiAgaXRQYXJzZXMoJ2h3YigkaCwkdywkYiknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnaHdiKCRoLDAlLDAlKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdod2IoMCwkdywwJSknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnaHdiKDAsMCUsJGIpJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2h3YigkaCwwJSwwJSwwKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdod2IoMCwkdywwJSwwKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdod2IoMCwwJSwkYiwwKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdod2IoMCwwJSwwJSwkYSknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnaHdiKCRoLCR3LCRiKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGgnOiAnMjEwJ1xuICAgICckdyc6ICc0MCUnXG4gICAgJyRiJzogJzQwJSdcbiAgfSkuYXNDb2xvcigxMDIsIDEyOCwgMTUzKVxuICBpdFBhcnNlcygnaHdiKCRoLCR3LCRiLCRhKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGgnOiAnMjEwJ1xuICAgICckdyc6ICc0MCUnXG4gICAgJyRiJzogJzQwJSdcbiAgICAnJGEnOiAnMC41J1xuICB9KS5hc0NvbG9yKDEwMiwgMTI4LCAxNTMsIDAuNSlcblxuICBpdFBhcnNlcygnY215aygwLDAuNSwxLDApJykuYXNDb2xvcignI2ZmN2YwMCcpXG4gIGl0UGFyc2VzKCdDTVlLKDAsMC41LDEsMCknKS5hc0NvbG9yKCcjZmY3ZjAwJylcbiAgaXRQYXJzZXMoJ2NNeUsoMCwwLjUsMSwwKScpLmFzQ29sb3IoJyNmZjdmMDAnKVxuICBpdFBhcnNlcygnY215ayhjLG0seSxrKScpLndpdGhDb250ZXh0KHtcbiAgICAnYyc6ICcwJ1xuICAgICdtJzogJzAuNSdcbiAgICAneSc6ICcxJ1xuICAgICdrJzogJzAnXG4gIH0pLmFzQ29sb3IoJyNmZjdmMDAnKVxuICBpdFBhcnNlcygnY215ayhjLG0seSxrKScpLmFzSW52YWxpZCgpXG5cbiAgaXRQYXJzZXMoJ2dyYXkoMTAwJSknKS5hc0NvbG9yKDI1NSwgMjU1LCAyNTUpXG4gIGl0UGFyc2VzKCdncmF5KDEwMCknKS5hc0NvbG9yKDI1NSwgMjU1LCAyNTUpXG4gIGl0UGFyc2VzKCdHUkFZKDEwMCknKS5hc0NvbG9yKDI1NSwgMjU1LCAyNTUpXG4gIGl0UGFyc2VzKCdnUmFZKDEwMCknKS5hc0NvbG9yKDI1NSwgMjU1LCAyNTUpXG4gIGl0UGFyc2VzKCdncmF5KDEwMCUsIDAuNSknKS5hc0NvbG9yKDI1NSwgMjU1LCAyNTUsIDAuNSlcbiAgaXRQYXJzZXMoJ2dyYXkoJGMsICRhLCknKS5hc1VuZGVmaW5lZCgpXG4gIGl0UGFyc2VzKCdncmF5KCRjLCAkYSknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnZ3JheSgwJSwgJGEpJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2dyYXkoJGMsIDApJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2dyYXkoJGMsICRhKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGMnOiAnMTAwJSdcbiAgICAnJGEnOiAnMC41J1xuICB9KS5hc0NvbG9yKDI1NSwgMjU1LCAyNTUsIDAuNSlcblxuICBpdFBhcnNlcygneWVsbG93Z3JlZW4nKS5hc0NvbG9yKCcjOWFjZDMyJylcbiAgaXRQYXJzZXMoJ1lFTExPV0dSRUVOJykuYXNDb2xvcignIzlhY2QzMicpXG4gIGl0UGFyc2VzKCd5ZWxsb3dHcmVlbicpLmFzQ29sb3IoJyM5YWNkMzInKVxuICBpdFBhcnNlcygnWWVsbG93R3JlZW4nKS5hc0NvbG9yKCcjOWFjZDMyJylcbiAgaXRQYXJzZXMoJ3llbGxvd19ncmVlbicpLmFzQ29sb3IoJyM5YWNkMzInKVxuICBpdFBhcnNlcygnWUVMTE9XX0dSRUVOJykuYXNDb2xvcignIzlhY2QzMicpXG4gIGl0UGFyc2VzKCc+WUVMTE9XX0dSRUVOJykuYXNDb2xvcignIzlhY2QzMicpXG5cbiAgaXRQYXJzZXMoJ2RhcmtlbihjeWFuLCAyMCUpJykuYXNDb2xvcigwLCAxNTMsIDE1MylcbiAgaXRQYXJzZXMoJ2RhcmtlbihjeWFuLCAyMCknKS5hc0NvbG9yKDAsIDE1MywgMTUzKVxuICBpdFBhcnNlcygnZGFya2VuKCNmZmYsIDEwMCUpJykuYXNDb2xvcigwLCAwLCAwKVxuICBpdFBhcnNlcygnZGFya2VuKGN5YW4sICRyKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdkYXJrZW4oJGMsICRyKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGMnOiBhc0NvbG9yICdoc3YoJGgsICRzLCAkdiknXG4gICAgJyRyJzogJzEnXG4gIH0pLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdkYXJrZW4oJGMsICRyKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGMnOiBhc0NvbG9yICdjeWFuJ1xuICAgICckcic6ICcyMCUnXG4gIH0pLmFzQ29sb3IoMCwgMTUzLCAxNTMpXG4gIGl0UGFyc2VzKCdkYXJrZW4oJGEsICRyKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGEnOiBhc0NvbG9yICdyZ2JhKCRjLCAxKSdcbiAgICAnJGMnOiBhc0NvbG9yICdjeWFuJ1xuICAgICckcic6ICcyMCUnXG4gIH0pLmFzQ29sb3IoMCwgMTUzLCAxNTMpXG5cbiAgaXRQYXJzZXMoJ2xpZ2h0ZW4oY3lhbiwgMjAlKScpLmFzQ29sb3IoMTAyLCAyNTUsIDI1NSlcbiAgaXRQYXJzZXMoJ2xpZ2h0ZW4oY3lhbiwgMjApJykuYXNDb2xvcigxMDIsIDI1NSwgMjU1KVxuICBpdFBhcnNlcygnbGlnaHRlbigjMDAwLCAxMDAlKScpLmFzQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgaXRQYXJzZXMoJ2xpZ2h0ZW4oY3lhbiwgJHIpJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2xpZ2h0ZW4oJGMsICRyKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGMnOiBhc0NvbG9yICdoc3YoJGgsICRzLCAkdiknXG4gICAgJyRyJzogJzEnXG4gIH0pLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdsaWdodGVuKCRjLCAkciknKS53aXRoQ29udGV4dCh7XG4gICAgJyRjJzogYXNDb2xvciAnY3lhbidcbiAgICAnJHInOiAnMjAlJ1xuICB9KS5hc0NvbG9yKDEwMiwgMjU1LCAyNTUpXG4gIGl0UGFyc2VzKCdsaWdodGVuKCRhLCAkciknKS53aXRoQ29udGV4dCh7XG4gICAgJyRhJzogYXNDb2xvciAncmdiYSgkYywgMSknXG4gICAgJyRjJzogYXNDb2xvciAnY3lhbidcbiAgICAnJHInOiAnMjAlJ1xuICB9KS5hc0NvbG9yKDEwMiwgMjU1LCAyNTUpXG5cbiAgaXRQYXJzZXMoJ3RyYW5zcGFyZW50aXplKGN5YW4sIDUwJSknKS5hc0NvbG9yKDAsIDI1NSwgMjU1LCAwLjUpXG4gIGl0UGFyc2VzKCd0cmFuc3BhcmVudGl6ZShjeWFuLCA1MCknKS5hc0NvbG9yKDAsIDI1NSwgMjU1LCAwLjUpXG4gIGl0UGFyc2VzKCd0cmFuc3BhcmVudGl6ZShjeWFuLCAwLjUpJykuYXNDb2xvcigwLCAyNTUsIDI1NSwgMC41KVxuICBpdFBhcnNlcygndHJhbnNwYXJlbnRpemUoY3lhbiwgLjUpJykuYXNDb2xvcigwLCAyNTUsIDI1NSwgMC41KVxuICBpdFBhcnNlcygnZmFkZW91dChjeWFuLCAwLjUpJykuYXNDb2xvcigwLCAyNTUsIDI1NSwgMC41KVxuICBpdFBhcnNlcygnZmFkZS1vdXQoY3lhbiwgMC41KScpLmFzQ29sb3IoMCwgMjU1LCAyNTUsIDAuNSlcbiAgaXRQYXJzZXMoJ2ZhZGVfb3V0KGN5YW4sIDAuNSknKS5hc0NvbG9yKDAsIDI1NSwgMjU1LCAwLjUpXG4gIGl0UGFyc2VzKCdmYWRlb3V0KGN5YW4sIC41KScpLmFzQ29sb3IoMCwgMjU1LCAyNTUsIDAuNSlcbiAgaXRQYXJzZXMoJ2ZhZGVvdXQoY3lhbiwgQHIpJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2ZhZGVvdXQoJGMsICRyKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGMnOiBhc0NvbG9yICdoc3YoJGgsICRzLCAkdiknXG4gICAgJyRyJzogJzEnXG4gIH0pLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdmYWRlb3V0KEBjLCBAciknKS53aXRoQ29udGV4dCh7XG4gICAgJ0BjJzogYXNDb2xvciAnY3lhbidcbiAgICAnQHInOiAnMC41J1xuICB9KS5hc0NvbG9yKDAsIDI1NSwgMjU1LCAwLjUpXG4gIGl0UGFyc2VzKCdmYWRlb3V0KEBhLCBAciknKS53aXRoQ29udGV4dCh7XG4gICAgJ0BhJzogYXNDb2xvciAncmdiYShAYywgMSknXG4gICAgJ0BjJzogYXNDb2xvciAnY3lhbidcbiAgICAnQHInOiAnMC41J1xuICB9KS5hc0NvbG9yKDAsIDI1NSwgMjU1LCAwLjUpXG5cbiAgaXRQYXJzZXMoJ29wYWNpZnkoMHg3ODAwRkZGRiwgNTAlKScpLmFzQ29sb3IoMCwgMjU1LCAyNTUsIDEpXG4gIGl0UGFyc2VzKCdvcGFjaWZ5KDB4NzgwMEZGRkYsIDUwKScpLmFzQ29sb3IoMCwgMjU1LCAyNTUsIDEpXG4gIGl0UGFyc2VzKCdvcGFjaWZ5KDB4NzgwMEZGRkYsIDAuNSknKS5hc0NvbG9yKDAsIDI1NSwgMjU1LCAxKVxuICBpdFBhcnNlcygnb3BhY2lmeSgweDc4MDBGRkZGLCAuNSknKS5hc0NvbG9yKDAsIDI1NSwgMjU1LCAxKVxuICBpdFBhcnNlcygnZmFkZWluKDB4NzgwMEZGRkYsIDAuNSknKS5hc0NvbG9yKDAsIDI1NSwgMjU1LCAxKVxuICBpdFBhcnNlcygnZmFkZS1pbigweDc4MDBGRkZGLCAwLjUpJykuYXNDb2xvcigwLCAyNTUsIDI1NSwgMSlcbiAgaXRQYXJzZXMoJ2ZhZGVfaW4oMHg3ODAwRkZGRiwgMC41KScpLmFzQ29sb3IoMCwgMjU1LCAyNTUsIDEpXG4gIGl0UGFyc2VzKCdmYWRlaW4oMHg3ODAwRkZGRiwgLjUpJykuYXNDb2xvcigwLCAyNTUsIDI1NSwgMSlcbiAgaXRQYXJzZXMoJ2ZhZGVpbigweDc4MDBGRkZGLCBAciknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnZmFkZWluKCRjLCAkciknKS53aXRoQ29udGV4dCh7XG4gICAgJyRjJzogYXNDb2xvciAnaHN2KCRoLCAkcywgJHYpJ1xuICAgICckcic6ICcxJ1xuICB9KS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnZmFkZWluKEBjLCBAciknKS53aXRoQ29udGV4dCh7XG4gICAgJ0BjJzogYXNDb2xvciAnMHg3ODAwRkZGRidcbiAgICAnQHInOiAnMC41J1xuICB9KS5hc0NvbG9yKDAsIDI1NSwgMjU1LCAxKVxuICBpdFBhcnNlcygnZmFkZWluKEBhLCBAciknKS53aXRoQ29udGV4dCh7XG4gICAgJ0BhJzogYXNDb2xvciAncmdiYShAYywgMSknXG4gICAgJ0BjJzogYXNDb2xvciAnMHg3ODAwRkZGRidcbiAgICAnQHInOiAnMC41J1xuICB9KS5hc0NvbG9yKDAsIDI1NSwgMjU1LCAxKVxuXG4gIGl0UGFyc2VzKCdzYXR1cmF0ZSgjODU1LCAyMCUpJykuYXNDb2xvcigxNTgsIDYzLCA2MylcbiAgaXRQYXJzZXMoJ3NhdHVyYXRlKCM4NTUsIDIwKScpLmFzQ29sb3IoMTU4LCA2MywgNjMpXG4gIGl0UGFyc2VzKCdzYXR1cmF0ZSgjODU1LCAwLjIpJykuYXNDb2xvcigxNTgsIDYzLCA2MylcbiAgaXRQYXJzZXMoJ3NhdHVyYXRlKCM4NTUsIEByKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdzYXR1cmF0ZSgkYywgJHIpJykud2l0aENvbnRleHQoe1xuICAgICckYyc6IGFzQ29sb3IgJ2hzdigkaCwgJHMsICR2KSdcbiAgICAnJHInOiAnMSdcbiAgfSkuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ3NhdHVyYXRlKEBjLCBAciknKS53aXRoQ29udGV4dCh7XG4gICAgJ0BjJzogYXNDb2xvciAnIzg1NSdcbiAgICAnQHInOiAnMC4yJ1xuICB9KS5hc0NvbG9yKDE1OCwgNjMsIDYzKVxuICBpdFBhcnNlcygnc2F0dXJhdGUoQGEsIEByKScpLndpdGhDb250ZXh0KHtcbiAgICAnQGEnOiBhc0NvbG9yICdyZ2JhKEBjLCAxKSdcbiAgICAnQGMnOiBhc0NvbG9yICcjODU1J1xuICAgICdAcic6ICcwLjInXG4gIH0pLmFzQ29sb3IoMTU4LCA2MywgNjMpXG5cbiAgaXRQYXJzZXMoJ2Rlc2F0dXJhdGUoIzllM2YzZiwgMjAlKScpLmFzQ29sb3IoMTM2LCA4NSwgODUpXG4gIGl0UGFyc2VzKCdkZXNhdHVyYXRlKCM5ZTNmM2YsIDIwKScpLmFzQ29sb3IoMTM2LCA4NSwgODUpXG4gIGl0UGFyc2VzKCdkZXNhdHVyYXRlKCM5ZTNmM2YsIDAuMiknKS5hc0NvbG9yKDEzNiwgODUsIDg1KVxuICBpdFBhcnNlcygnZGVzYXR1cmF0ZSgjOWUzZjNmLCAuMiknKS5hc0NvbG9yKDEzNiwgODUsIDg1KVxuICBpdFBhcnNlcygnZGVzYXR1cmF0ZSgjOWUzZjNmLCBAciknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnZGVzYXR1cmF0ZSgkYywgJHIpJykud2l0aENvbnRleHQoe1xuICAgICckYyc6IGFzQ29sb3IgJ2hzdigkaCwgJHMsICR2KSdcbiAgICAnJHInOiAnMSdcbiAgfSkuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2Rlc2F0dXJhdGUoQGMsIEByKScpLndpdGhDb250ZXh0KHtcbiAgICAnQGMnOiBhc0NvbG9yICcjOWUzZjNmJ1xuICAgICdAcic6ICcwLjInXG4gIH0pLmFzQ29sb3IoMTM2LCA4NSwgODUpXG4gIGl0UGFyc2VzKCdkZXNhdHVyYXRlKEBhLCBAciknKS53aXRoQ29udGV4dCh7XG4gICAgJ0BhJzogYXNDb2xvciAncmdiYShAYywgMSknXG4gICAgJ0BjJzogYXNDb2xvciAnIzllM2YzZidcbiAgICAnQHInOiAnMC4yJ1xuICB9KS5hc0NvbG9yKDEzNiwgODUsIDg1KVxuXG4gIGl0UGFyc2VzKCdncmF5c2NhbGUoIzllM2YzZiknKS5hc0NvbG9yKDExMSwgMTExLCAxMTEpXG4gIGl0UGFyc2VzKCdncmV5c2NhbGUoIzllM2YzZiknKS5hc0NvbG9yKDExMSwgMTExLCAxMTEpXG4gIGl0UGFyc2VzKCdncmF5c2NhbGUoQGMpJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2dyYXlzY2FsZSgkYyknKS53aXRoQ29udGV4dCh7XG4gICAgJyRjJzogYXNDb2xvciAnaHN2KCRoLCAkcywgJHYpJ1xuICB9KS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnZ3JheXNjYWxlKEBjKScpLndpdGhDb250ZXh0KHtcbiAgICAnQGMnOiBhc0NvbG9yICcjOWUzZjNmJ1xuICB9KS5hc0NvbG9yKDExMSwgMTExLCAxMTEpXG4gIGl0UGFyc2VzKCdncmF5c2NhbGUoQGEpJykud2l0aENvbnRleHQoe1xuICAgICdAYSc6IGFzQ29sb3IgJ3JnYmEoQGMsIDEpJ1xuICAgICdAYyc6IGFzQ29sb3IgJyM5ZTNmM2YnXG4gIH0pLmFzQ29sb3IoMTExLCAxMTEsIDExMSlcblxuICBpdFBhcnNlcygnaW52ZXJ0KCM5ZTNmM2YpJykuYXNDb2xvcig5NywgMTkyLCAxOTIpXG4gIGl0UGFyc2VzKCdpbnZlcnQoQGMpJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2ludmVydCgkYyknKS53aXRoQ29udGV4dCh7XG4gICAgJyRjJzogYXNDb2xvciAnaHN2KCRoLCAkcywgJHYpJ1xuICB9KS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnaW52ZXJ0KEBjKScpLndpdGhDb250ZXh0KHtcbiAgICAnQGMnOiBhc0NvbG9yICcjOWUzZjNmJ1xuICB9KS5hc0NvbG9yKDk3LCAxOTIsIDE5MilcbiAgaXRQYXJzZXMoJ2ludmVydChAYSknKS53aXRoQ29udGV4dCh7XG4gICAgJ0BhJzogYXNDb2xvciAncmdiYShAYywgMSknXG4gICAgJ0BjJzogYXNDb2xvciAnIzllM2YzZidcbiAgfSkuYXNDb2xvcig5NywgMTkyLCAxOTIpXG5cbiAgaXRQYXJzZXMoJ2FkanVzdC1odWUoIzgxMSwgNDVkZWcpJykuYXNDb2xvcigxMzYsIDEwNiwgMTcpXG4gIGl0UGFyc2VzKCdhZGp1c3QtaHVlKCM4MTEsIC00NWRlZyknKS5hc0NvbG9yKDEzNiwgMTcsIDEwNilcbiAgaXRQYXJzZXMoJ2FkanVzdC1odWUoIzgxMSwgNDUlKScpLmFzQ29sb3IoMTM2LCAxMDYsIDE3KVxuICBpdFBhcnNlcygnYWRqdXN0LWh1ZSgjODExLCAtNDUlKScpLmFzQ29sb3IoMTM2LCAxNywgMTA2KVxuICBpdFBhcnNlcygnYWRqdXN0LWh1ZSgjODExLCA0NSknKS5hc0NvbG9yKDEzNiwgMTA2LCAxNylcbiAgaXRQYXJzZXMoJ2FkanVzdC1odWUoIzgxMSwgLTQ1KScpLmFzQ29sb3IoMTM2LCAxNywgMTA2KVxuICBpdFBhcnNlcygnYWRqdXN0LWh1ZSgkYywgJHIpJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2FkanVzdC1odWUoJGMsICRyKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGMnOiBhc0NvbG9yICdoc3YoJGgsICRzLCAkdiknXG4gICAgJyRyJzogJzEnXG4gIH0pLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdhZGp1c3QtaHVlKCRjLCAkciknKS53aXRoQ29udGV4dCh7XG4gICAgJyRjJzogYXNDb2xvciAnIzgxMSdcbiAgICAnJHInOiAnLTQ1ZGVnJ1xuICB9KS5hc0NvbG9yKDEzNiwgMTcsIDEwNilcbiAgaXRQYXJzZXMoJ2FkanVzdC1odWUoJGEsICRyKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGEnOiBhc0NvbG9yICdyZ2JhKCRjLCAwLjUpJ1xuICAgICckYyc6IGFzQ29sb3IgJyM4MTEnXG4gICAgJyRyJzogJy00NWRlZydcbiAgfSkuYXNDb2xvcigxMzYsIDE3LCAxMDYsIDAuNSlcblxuICBpdFBhcnNlcygnbWl4KHJnYigyNTUsMCwwKSwgYmx1ZSknKS5hc0NvbG9yKDEyNywgMCwgMTI3KVxuICBpdFBhcnNlcygnbWl4KHJlZCwgcmdiKDAsMCwyNTUpLCAyNSUpJykuYXNDb2xvcig2MywgMCwgMTkxKVxuICBpdFBhcnNlcygnbWl4KCNmZjAwMDAsIDB4MDAwMGZmKScpLmFzQ29sb3IoJyM3ZjAwN2YnKVxuICBpdFBhcnNlcygnbWl4KCNmZjAwMDAsIDB4MDAwMGZmLCAyNSUpJykuYXNDb2xvcignIzNmMDBiZicpXG4gIGl0UGFyc2VzKCdtaXgocmVkLCByZ2IoMCwwLDI1NSksIDI1KScpLmFzQ29sb3IoNjMsIDAsIDE5MSlcbiAgaXRQYXJzZXMoJ21peCgkYSwgJGIsICRyKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdtaXgoJGEsICRiLCAkciknKS53aXRoQ29udGV4dCh7XG4gICAgJyRhJzogYXNDb2xvciAnaHN2KCRoLCAkcywgJHYpJ1xuICAgICckYic6IGFzQ29sb3IgJ2JsdWUnXG4gICAgJyRyJzogJzI1JSdcbiAgfSkuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ21peCgkYSwgJGIsICRyKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGEnOiBhc0NvbG9yICdibHVlJ1xuICAgICckYic6IGFzQ29sb3IgJ2hzdigkaCwgJHMsICR2KSdcbiAgICAnJHInOiAnMjUlJ1xuICB9KS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnbWl4KCRhLCAkYiwgJHIpJykud2l0aENvbnRleHQoe1xuICAgICckYSc6IGFzQ29sb3IgJ3JlZCdcbiAgICAnJGInOiBhc0NvbG9yICdibHVlJ1xuICAgICckcic6ICcyNSUnXG4gIH0pLmFzQ29sb3IoNjMsIDAsIDE5MSlcbiAgaXRQYXJzZXMoJ21peCgkYywgJGQsICRyKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGEnOiBhc0NvbG9yICdyZWQnXG4gICAgJyRiJzogYXNDb2xvciAnYmx1ZSdcbiAgICAnJGMnOiBhc0NvbG9yICdyZ2JhKCRhLCAxKSdcbiAgICAnJGQnOiBhc0NvbG9yICdyZ2JhKCRiLCAxKSdcbiAgICAnJHInOiAnMjUlJ1xuICB9KS5hc0NvbG9yKDYzLCAwLCAxOTEpXG5cbiAgZGVzY3JpYmUgJ3N0eWx1cyBhbmQgbGVzcycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPiBAc2NvcGUgPSAnc3R5bCdcblxuICAgIGl0UGFyc2VzKCd0aW50KCNmZDBjYzcsNjYlKScpLmFzQ29sb3IoMjU0LCAxNzIsIDIzNSlcbiAgICBpdFBhcnNlcygndGludCgjZmQwY2M3LDY2KScpLmFzQ29sb3IoMjU0LCAxNzIsIDIzNSlcbiAgICBpdFBhcnNlcygndGludCgkYywkciknKS5hc0ludmFsaWQoKVxuICAgIGl0UGFyc2VzKCd0aW50KCRjLCAkciknKS53aXRoQ29udGV4dCh7XG4gICAgICAnJGMnOiBhc0NvbG9yICdoc3YoJGgsICRzLCAkdiknXG4gICAgICAnJHInOiAnMSdcbiAgICB9KS5hc0ludmFsaWQoKVxuICAgIGl0UGFyc2VzKCd0aW50KCRjLCRyKScpLndpdGhDb250ZXh0KHtcbiAgICAgICckYyc6IGFzQ29sb3IgJyNmZDBjYzcnXG4gICAgICAnJHInOiAnNjYlJ1xuICAgIH0pLmFzQ29sb3IoMjU0LCAxNzIsIDIzNSlcbiAgICBpdFBhcnNlcygndGludCgkYywkciknKS53aXRoQ29udGV4dCh7XG4gICAgICAnJGEnOiBhc0NvbG9yICcjZmQwY2M3J1xuICAgICAgJyRjJzogYXNDb2xvciAncmdiYSgkYSwgMC45KSdcbiAgICAgICckcic6ICc2NiUnXG4gICAgfSkuYXNDb2xvcigyNTQsIDE3MiwgMjM1LCAwLjk2NilcblxuICAgIGl0UGFyc2VzKCdzaGFkZSgjZmQwY2M3LDY2JSknKS5hc0NvbG9yKDg2LCA0LCA2NylcbiAgICBpdFBhcnNlcygnc2hhZGUoI2ZkMGNjNyw2NiknKS5hc0NvbG9yKDg2LCA0LCA2NylcbiAgICBpdFBhcnNlcygnc2hhZGUoJGMsJHIpJykuYXNJbnZhbGlkKClcbiAgICBpdFBhcnNlcygnc2hhZGUoJGMsICRyKScpLndpdGhDb250ZXh0KHtcbiAgICAgICckYyc6IGFzQ29sb3IgJ2hzdigkaCwgJHMsICR2KSdcbiAgICAgICckcic6ICcxJ1xuICAgIH0pLmFzSW52YWxpZCgpXG4gICAgaXRQYXJzZXMoJ3NoYWRlKCRjLCRyKScpLndpdGhDb250ZXh0KHtcbiAgICAgICckYyc6IGFzQ29sb3IgJyNmZDBjYzcnXG4gICAgICAnJHInOiAnNjYlJ1xuICAgIH0pLmFzQ29sb3IoODYsIDQsIDY3KVxuICAgIGl0UGFyc2VzKCdzaGFkZSgkYywkciknKS53aXRoQ29udGV4dCh7XG4gICAgICAnJGEnOiBhc0NvbG9yICcjZmQwY2M3J1xuICAgICAgJyRjJzogYXNDb2xvciAncmdiYSgkYSwgMC45KSdcbiAgICAgICckcic6ICc2NiUnXG4gICAgfSkuYXNDb2xvcig4NiwgNCwgNjcsIDAuOTY2KVxuXG4gIGRlc2NyaWJlICdzY3NzIGFuZCBzYXNzJywgLT5cbiAgICBkZXNjcmliZSAnd2l0aCBjb21wYXNzIGltcGxlbWVudGF0aW9uJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT4gQHNjb3BlID0gJ3Nhc3M6Y29tcGFzcydcblxuICAgICAgaXRQYXJzZXMoJ3RpbnQoI0JBREE1NSwgNDIlKScpLmFzQ29sb3IoJyNlMmVmYjcnKVxuICAgICAgaXRQYXJzZXMoJ3RpbnQoI0JBREE1NSwgNDIpJykuYXNDb2xvcignI2UyZWZiNycpXG4gICAgICBpdFBhcnNlcygndGludCgkYywkciknKS5hc0ludmFsaWQoKVxuICAgICAgaXRQYXJzZXMoJ3RpbnQoJGMsICRyKScpLndpdGhDb250ZXh0KHtcbiAgICAgICAgJyRjJzogYXNDb2xvciAnaHN2KCRoLCAkcywgJHYpJ1xuICAgICAgICAnJHInOiAnMSdcbiAgICAgIH0pLmFzSW52YWxpZCgpXG4gICAgICBpdFBhcnNlcygndGludCgkYywkciknKS53aXRoQ29udGV4dCh7XG4gICAgICAgICckYyc6IGFzQ29sb3IgJyNCQURBNTUnXG4gICAgICAgICckcic6ICc0MiUnXG4gICAgICB9KS5hc0NvbG9yKCcjZTJlZmI3JylcbiAgICAgIGl0UGFyc2VzKCd0aW50KCRjLCRyKScpLndpdGhDb250ZXh0KHtcbiAgICAgICAgJyRhJzogYXNDb2xvciAnI0JBREE1NSdcbiAgICAgICAgJyRjJzogYXNDb2xvciAncmdiYSgkYSwgMC45KSdcbiAgICAgICAgJyRyJzogJzQyJSdcbiAgICAgIH0pLmFzQ29sb3IoMjI2LDIzOSwxODMsMC45NDIpXG5cbiAgICAgIGl0UGFyc2VzKCdzaGFkZSgjNjYzMzk5LCA0MiUpJykuYXNDb2xvcignIzJhMTU0MCcpXG4gICAgICBpdFBhcnNlcygnc2hhZGUoIzY2MzM5OSwgNDIpJykuYXNDb2xvcignIzJhMTU0MCcpXG4gICAgICBpdFBhcnNlcygnc2hhZGUoJGMsJHIpJykuYXNJbnZhbGlkKClcbiAgICAgIGl0UGFyc2VzKCdzaGFkZSgkYywgJHIpJykud2l0aENvbnRleHQoe1xuICAgICAgICAnJGMnOiBhc0NvbG9yICdoc3YoJGgsICRzLCAkdiknXG4gICAgICAgICckcic6ICcxJ1xuICAgICAgfSkuYXNJbnZhbGlkKClcbiAgICAgIGl0UGFyc2VzKCdzaGFkZSgkYywkciknKS53aXRoQ29udGV4dCh7XG4gICAgICAgICckYyc6IGFzQ29sb3IgJyM2NjMzOTknXG4gICAgICAgICckcic6ICc0MiUnXG4gICAgICB9KS5hc0NvbG9yKCcjMmExNTQwJylcbiAgICAgIGl0UGFyc2VzKCdzaGFkZSgkYywkciknKS53aXRoQ29udGV4dCh7XG4gICAgICAgICckYSc6IGFzQ29sb3IgJyM2NjMzOTknXG4gICAgICAgICckYyc6IGFzQ29sb3IgJ3JnYmEoJGEsIDAuOSknXG4gICAgICAgICckcic6ICc0MiUnXG4gICAgICB9KS5hc0NvbG9yKDB4MmEsMHgxNSwweDQwLDAuOTQyKVxuXG4gICAgZGVzY3JpYmUgJ3dpdGggYm91cmJvbiBpbXBsZW1lbnRhdGlvbicsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+IEBzY29wZSA9ICdzYXNzOmJvdXJib24nXG5cbiAgICAgIGl0UGFyc2VzKCd0aW50KCNCQURBNTUsIDQyJSknKS5hc0NvbG9yKDIxNCwgMjMzLCAxNTYpXG4gICAgICBpdFBhcnNlcygndGludCgjQkFEQTU1LCA0MiknKS5hc0NvbG9yKDIxNCwgMjMzLCAxNTYpXG4gICAgICBpdFBhcnNlcygndGludCgkYywkciknKS5hc0ludmFsaWQoKVxuICAgICAgaXRQYXJzZXMoJ3RpbnQoJGMsICRyKScpLndpdGhDb250ZXh0KHtcbiAgICAgICAgJyRjJzogYXNDb2xvciAnaHN2KCRoLCAkcywgJHYpJ1xuICAgICAgICAnJHInOiAnMSdcbiAgICAgIH0pLmFzSW52YWxpZCgpXG4gICAgICBpdFBhcnNlcygndGludCgkYywkciknKS53aXRoQ29udGV4dCh7XG4gICAgICAgICckYyc6IGFzQ29sb3IgJyNCQURBNTUnXG4gICAgICAgICckcic6ICc0MiUnXG4gICAgICB9KS5hc0NvbG9yKDIxNCwgMjMzLCAxNTYpXG4gICAgICBpdFBhcnNlcygndGludCgkYywkciknKS53aXRoQ29udGV4dCh7XG4gICAgICAgICckYSc6IGFzQ29sb3IgJyNCQURBNTUnXG4gICAgICAgICckYyc6IGFzQ29sb3IgJ3JnYmEoJGEsIDAuOSknXG4gICAgICAgICckcic6ICc0MiUnXG4gICAgICB9KS5hc0NvbG9yKDIxNCwgMjMzLCAxNTYsIDAuOTQyKVxuXG4gICAgICBpdFBhcnNlcygnc2hhZGUoIzY2MzM5OSwgNDIlKScpLmFzQ29sb3IoNTksIDI5LCA4OClcbiAgICAgIGl0UGFyc2VzKCdzaGFkZSgjNjYzMzk5LCA0MiknKS5hc0NvbG9yKDU5LCAyOSwgODgpXG4gICAgICBpdFBhcnNlcygnc2hhZGUoJGMsJHIpJykuYXNJbnZhbGlkKClcbiAgICAgIGl0UGFyc2VzKCdzaGFkZSgkYywgJHIpJykud2l0aENvbnRleHQoe1xuICAgICAgICAnJGMnOiBhc0NvbG9yICdoc3YoJGgsICRzLCAkdiknXG4gICAgICAgICckcic6ICcxJ1xuICAgICAgfSkuYXNJbnZhbGlkKClcbiAgICAgIGl0UGFyc2VzKCdzaGFkZSgkYywkciknKS53aXRoQ29udGV4dCh7XG4gICAgICAgICckYyc6IGFzQ29sb3IgJyM2NjMzOTknXG4gICAgICAgICckcic6ICc0MiUnXG4gICAgICB9KS5hc0NvbG9yKDU5LCAyOSwgODgpXG4gICAgICBpdFBhcnNlcygnc2hhZGUoJGMsJHIpJykud2l0aENvbnRleHQoe1xuICAgICAgICAnJGEnOiBhc0NvbG9yICcjNjYzMzk5J1xuICAgICAgICAnJGMnOiBhc0NvbG9yICdyZ2JhKCRhLCAwLjkpJ1xuICAgICAgICAnJHInOiAnNDIlJ1xuICAgICAgfSkuYXNDb2xvcig1OSwgMjksIDg4LCAwLjk0MilcblxuICBpdFBhcnNlcygnYWRqdXN0LWNvbG9yKCMxMDIwMzAsICRyZWQ6IC01LCAkYmx1ZTogNSknLCAxMSwgMzIsIDUzKVxuICBpdFBhcnNlcygnYWRqdXN0LWNvbG9yKGhzbCgyNSwgMTAwJSwgODAlKSwgJGxpZ2h0bmVzczogLTMwJSwgJGFscGhhOiAtMC40KScsIDI1NSwgMTA2LCAwLCAwLjYpXG4gIGl0UGFyc2VzKCdhZGp1c3QtY29sb3IoJGMsICRyZWQ6ICRhLCAkYmx1ZTogJGIpJykuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2FkanVzdC1jb2xvcigkZCwgJHJlZDogJGEsICRibHVlOiAkYiknKS53aXRoQ29udGV4dCh7XG4gICAgJyRhJzogJy01J1xuICAgICckYic6ICc1J1xuICAgICckZCc6IGFzQ29sb3IgJ3JnYmEoJGMsIDEpJ1xuICB9KS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnYWRqdXN0LWNvbG9yKCRjLCAkcmVkOiAkYSwgJGJsdWU6ICRiKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGEnOiAnLTUnXG4gICAgJyRiJzogJzUnXG4gICAgJyRjJzogYXNDb2xvciAnIzEwMjAzMCdcbiAgfSkuYXNDb2xvcigxMSwgMzIsIDUzKVxuICBpdFBhcnNlcygnYWRqdXN0LWNvbG9yKCRkLCAkcmVkOiAkYSwgJGJsdWU6ICRiKScpLndpdGhDb250ZXh0KHtcbiAgICAnJGEnOiAnLTUnXG4gICAgJyRiJzogJzUnXG4gICAgJyRjJzogYXNDb2xvciAnIzEwMjAzMCdcbiAgICAnJGQnOiBhc0NvbG9yICdyZ2JhKCRjLCAxKSdcbiAgfSkuYXNDb2xvcigxMSwgMzIsIDUzKVxuXG4gIGl0UGFyc2VzKCdzY2FsZS1jb2xvcihyZ2IoMjAwLCAxNTAsIDE3MCksICRncmVlbjogLTQwJSwgJGJsdWU6IDcwJSknKS5hc0NvbG9yKDIwMCwgOTAsIDIzMClcbiAgaXRQYXJzZXMoJ2NoYW5nZS1jb2xvcihyZ2IoMjAwLCAxNTAsIDE3MCksICRncmVlbjogNDAsICRibHVlOiA3MCknKS5hc0NvbG9yKDIwMCwgNDAsIDcwKVxuICBpdFBhcnNlcygnc2NhbGUtY29sb3IoJGMsICRncmVlbjogJGEsICRibHVlOiAkYiknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnc2NhbGUtY29sb3IoJGQsICRncmVlbjogJGEsICRibHVlOiAkYiknKS53aXRoQ29udGV4dCh7XG4gICAgJyRhJzogJy00MCUnXG4gICAgJyRiJzogJzcwJSdcbiAgICAnJGQnOiBhc0NvbG9yICdyZ2JhKCRjLCAxKSdcbiAgfSkuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ3NjYWxlLWNvbG9yKCRjLCAkZ3JlZW46ICRhLCAkYmx1ZTogJGIpJykud2l0aENvbnRleHQoe1xuICAgICckYSc6ICctNDAlJ1xuICAgICckYic6ICc3MCUnXG4gICAgJyRjJzogYXNDb2xvciAncmdiKDIwMCwgMTUwLCAxNzApJ1xuICB9KS5hc0NvbG9yKDIwMCwgOTAsIDIzMClcbiAgaXRQYXJzZXMoJ3NjYWxlLWNvbG9yKCRkLCAkZ3JlZW46ICRhLCAkYmx1ZTogJGIpJykud2l0aENvbnRleHQoe1xuICAgICckYSc6ICctNDAlJ1xuICAgICckYic6ICc3MCUnXG4gICAgJyRjJzogYXNDb2xvciAncmdiKDIwMCwgMTUwLCAxNzApJ1xuICAgICckZCc6IGFzQ29sb3IgJ3JnYmEoJGMsIDEpJ1xuICB9KS5hc0NvbG9yKDIwMCwgOTAsIDIzMClcblxuICBpdFBhcnNlcygnc3BpbigjRjAwLCAxMjApJykuYXNDb2xvcigwLCAyNTUsIDApXG4gIGl0UGFyc2VzKCdzcGluKCNGMDAsIDEyMCknKS5hc0NvbG9yKDAsIDI1NSwgMClcbiAgaXRQYXJzZXMoJ3NwaW4oI0YwMCwgMTIwZGVnKScpLmFzQ29sb3IoMCwgMjU1LCAwKVxuICBpdFBhcnNlcygnc3BpbigjRjAwLCAtMTIwKScpLmFzQ29sb3IoMCwgMCwgMjU1KVxuICBpdFBhcnNlcygnc3BpbigjRjAwLCAtMTIwZGVnKScpLmFzQ29sb3IoMCwgMCwgMjU1KVxuICBpdFBhcnNlcygnc3BpbihAYywgQGEpJykud2l0aENvbnRleHQoe1xuICAgICdAYyc6IGFzQ29sb3IgJyNGMDAnXG4gICAgJ0BhJzogJzEyMCdcbiAgfSkuYXNDb2xvcigwLCAyNTUsIDApXG4gIGl0UGFyc2VzKCdzcGluKEBjLCBAYSknKS53aXRoQ29udGV4dCh7XG4gICAgJ0BhJzogJzEyMCdcbiAgfSkuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ3NwaW4oQGMsIEBhKScpLndpdGhDb250ZXh0KHtcbiAgICAnQGEnOiAnMTIwJ1xuICB9KS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnc3BpbihAYywgQGEsKScpLmFzVW5kZWZpbmVkKClcblxuICBpdFBhcnNlcygnZmFkZSgjRjAwLCAwLjUpJykuYXNDb2xvcigyNTUsIDAsIDAsIDAuNSlcbiAgaXRQYXJzZXMoJ2ZhZGUoI0YwMCwgNTAlKScpLmFzQ29sb3IoMjU1LCAwLCAwLCAwLjUpXG4gIGl0UGFyc2VzKCdmYWRlKCNGMDAsIDUwKScpLmFzQ29sb3IoMjU1LCAwLCAwLCAwLjUpXG4gIGl0UGFyc2VzKCdmYWRlKEBjLCBAYSknKS53aXRoQ29udGV4dCh7XG4gICAgJ0BjJzogYXNDb2xvciAnI0YwMCdcbiAgICAnQGEnOiAnMC41J1xuICB9KS5hc0NvbG9yKDI1NSwgMCwgMCwgMC41KVxuICBpdFBhcnNlcygnZmFkZShAYywgQGEpJykud2l0aENvbnRleHQoe1xuICAgICdAYSc6ICcwLjUnXG4gIH0pLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdmYWRlKEBjLCBAYSknKS53aXRoQ29udGV4dCh7XG4gICAgJ0BhJzogJzAuNSdcbiAgfSkuYXNJbnZhbGlkKClcbiAgaXRQYXJzZXMoJ2ZhZGUoQGMsIEBhLCknKS5hc1VuZGVmaW5lZCgpXG5cbiAgaXRQYXJzZXMoJ2NvbnRyYXN0KCNiYmJiYmIpJykuYXNDb2xvcigwLDAsMClcbiAgaXRQYXJzZXMoJ2NvbnRyYXN0KCMzMzMzMzMpJykuYXNDb2xvcigyNTUsMjU1LDI1NSlcbiAgaXRQYXJzZXMoJ2NvbnRyYXN0KCNiYmJiYmIsIHJnYigyMCwyMCwyMCkpJykuYXNDb2xvcigyMCwyMCwyMClcbiAgaXRQYXJzZXMoJ2NvbnRyYXN0KCMzMzMzMzMsIHJnYigyMCwyMCwyMCksIHJnYigxNDAsMTQwLDE0MCkpJykuYXNDb2xvcigxNDAsMTQwLDE0MClcbiAgaXRQYXJzZXMoJ2NvbnRyYXN0KCM2NjY2NjYsIHJnYigyMCwyMCwyMCksIHJnYigxNDAsMTQwLDE0MCksIDEzJSknKS5hc0NvbG9yKDE0MCwxNDAsMTQwKVxuXG4gIGl0UGFyc2VzKCdjb250cmFzdChAYmFzZSknKS53aXRoQ29udGV4dCh7XG4gICAgJ0BiYXNlJzogYXNDb2xvciAnI2JiYmJiYidcbiAgfSkuYXNDb2xvcigwLDAsMClcbiAgaXRQYXJzZXMoJ2NvbnRyYXN0KEBiYXNlKScpLndpdGhDb250ZXh0KHtcbiAgICAnQGJhc2UnOiBhc0NvbG9yICcjMzMzMzMzJ1xuICB9KS5hc0NvbG9yKDI1NSwyNTUsMjU1KVxuICBpdFBhcnNlcygnY29udHJhc3QoQGJhc2UsIEBkYXJrKScpLndpdGhDb250ZXh0KHtcbiAgICAnQGJhc2UnOiBhc0NvbG9yICcjYmJiYmJiJ1xuICAgICdAZGFyayc6IGFzQ29sb3IgJ3JnYigyMCwyMCwyMCknXG4gIH0pLmFzQ29sb3IoMjAsMjAsMjApXG4gIGl0UGFyc2VzKCdjb250cmFzdChAYmFzZSwgQGRhcmssIEBsaWdodCknKS53aXRoQ29udGV4dCh7XG4gICAgJ0BiYXNlJzogYXNDb2xvciAnIzMzMzMzMydcbiAgICAnQGRhcmsnOiBhc0NvbG9yICdyZ2IoMjAsMjAsMjApJ1xuICAgICdAbGlnaHQnOiBhc0NvbG9yICdyZ2IoMTQwLDE0MCwxNDApJ1xuICB9KS5hc0NvbG9yKDE0MCwxNDAsMTQwKVxuICBpdFBhcnNlcygnY29udHJhc3QoQGJhc2UsIEBkYXJrLCBAbGlnaHQsIEB0aHJlc2hvbGQpJykud2l0aENvbnRleHQoe1xuICAgICdAYmFzZSc6IGFzQ29sb3IgJyM2NjY2NjYnXG4gICAgJ0BkYXJrJzogYXNDb2xvciAncmdiKDIwLDIwLDIwKSdcbiAgICAnQGxpZ2h0JzogYXNDb2xvciAncmdiKDE0MCwxNDAsMTQwKSdcbiAgICAnQHRocmVzaG9sZCc6ICcxMyUnXG4gIH0pLmFzQ29sb3IoMTQwLDE0MCwxNDApXG5cbiAgaXRQYXJzZXMoJ2NvbnRyYXN0KEBiYXNlKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdjb250cmFzdChAYmFzZSknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnY29udHJhc3QoQGJhc2UsIEBkYXJrKScpLmFzSW52YWxpZCgpXG4gIGl0UGFyc2VzKCdjb250cmFzdChAYmFzZSwgQGRhcmssIEBsaWdodCknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnY29udHJhc3QoQGJhc2UsIEBkYXJrLCBAbGlnaHQsIEB0aHJlc2hvbGQpJykuYXNJbnZhbGlkKClcblxuICBpdFBhcnNlcygnbXVsdGlwbHkoI2ZmNjYwMCwgMHg2NjY2NjYpJykuYXNDb2xvcignIzY2MjkwMCcpXG4gIGl0UGFyc2VzKCdtdWx0aXBseShAYmFzZSwgQG1vZGlmaWVyKScpLndpdGhDb250ZXh0KHtcbiAgICAnQGJhc2UnOiBhc0NvbG9yICcjZmY2NjAwJ1xuICAgICdAbW9kaWZpZXInOiBhc0NvbG9yICcjNjY2NjY2J1xuICB9KS5hc0NvbG9yKCcjNjYyOTAwJylcbiAgaXRQYXJzZXMoJ211bHRpcGx5KEBiYXNlLCBAbW9kaWZpZXIpJykuYXNJbnZhbGlkKClcblxuICBpdFBhcnNlcygnc2NyZWVuKCNmZjY2MDAsIDB4NjY2NjY2KScpLmFzQ29sb3IoJyNmZmEzNjYnKVxuICBpdFBhcnNlcygnc2NyZWVuKEBiYXNlLCBAbW9kaWZpZXIpJykud2l0aENvbnRleHQoe1xuICAgICdAYmFzZSc6IGFzQ29sb3IgJyNmZjY2MDAnXG4gICAgJ0Btb2RpZmllcic6IGFzQ29sb3IgJyM2NjY2NjYnXG4gIH0pLmFzQ29sb3IoJyNmZmEzNjYnKVxuICBpdFBhcnNlcygnc2NyZWVuKEBiYXNlLCBAbW9kaWZpZXIpJykuYXNJbnZhbGlkKClcblxuICBpdFBhcnNlcygnb3ZlcmxheSgjZmY2NjAwLCAweDY2NjY2NiknKS5hc0NvbG9yKCcjZmY1MjAwJylcbiAgaXRQYXJzZXMoJ292ZXJsYXkoQGJhc2UsIEBtb2RpZmllciknKS53aXRoQ29udGV4dCh7XG4gICAgJ0BiYXNlJzogYXNDb2xvciAnI2ZmNjYwMCdcbiAgICAnQG1vZGlmaWVyJzogYXNDb2xvciAnIzY2NjY2NidcbiAgfSkuYXNDb2xvcignI2ZmNTIwMCcpXG4gIGl0UGFyc2VzKCdvdmVybGF5KEBiYXNlLCBAbW9kaWZpZXIpJykuYXNJbnZhbGlkKClcblxuICBpdFBhcnNlcygnc29mdGxpZ2h0KCNmZjY2MDAsIDB4NjY2NjY2KScpLmFzQ29sb3IoJyNmZjVhMDAnKVxuICBpdFBhcnNlcygnc29mdGxpZ2h0KEBiYXNlLCBAbW9kaWZpZXIpJykud2l0aENvbnRleHQoe1xuICAgICdAYmFzZSc6IGFzQ29sb3IgJyNmZjY2MDAnXG4gICAgJ0Btb2RpZmllcic6IGFzQ29sb3IgJyM2NjY2NjYnXG4gIH0pLmFzQ29sb3IoJyNmZjVhMDAnKVxuICBpdFBhcnNlcygnc29mdGxpZ2h0KEBiYXNlLCBAbW9kaWZpZXIpJykuYXNJbnZhbGlkKClcblxuICBpdFBhcnNlcygnaGFyZGxpZ2h0KCNmZjY2MDAsIDB4NjY2NjY2KScpLmFzQ29sb3IoJyNjYzUyMDAnKVxuICBpdFBhcnNlcygnaGFyZGxpZ2h0KEBiYXNlLCBAbW9kaWZpZXIpJykud2l0aENvbnRleHQoe1xuICAgICdAYmFzZSc6IGFzQ29sb3IgJyNmZjY2MDAnXG4gICAgJ0Btb2RpZmllcic6IGFzQ29sb3IgJyM2NjY2NjYnXG4gIH0pLmFzQ29sb3IoJyNjYzUyMDAnKVxuICBpdFBhcnNlcygnaGFyZGxpZ2h0KEBiYXNlLCBAbW9kaWZpZXIpJykuYXNJbnZhbGlkKClcblxuICBpdFBhcnNlcygnZGlmZmVyZW5jZSgjZmY2NjAwLCAweDY2NjY2NiknKS5hc0NvbG9yKCcjOTkwMDY2JylcbiAgaXRQYXJzZXMoJ2RpZmZlcmVuY2UoI2ZmNjYwMCwpKCknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnZGlmZmVyZW5jZShAYmFzZSwgQG1vZGlmaWVyKScpLndpdGhDb250ZXh0KHtcbiAgICAnQGJhc2UnOiBhc0NvbG9yICcjZmY2NjAwJ1xuICAgICdAbW9kaWZpZXInOiBhc0NvbG9yICcjNjY2NjY2J1xuICB9KS5hc0NvbG9yKCcjOTkwMDY2JylcbiAgaXRQYXJzZXMoJ2RpZmZlcmVuY2UoQGJhc2UsIEBtb2RpZmllciknKS5hc0ludmFsaWQoKVxuXG4gIGl0UGFyc2VzKCdleGNsdXNpb24oI2ZmNjYwMCwgMHg2NjY2NjYpJykuYXNDb2xvcignIzk5N2E2NicpXG4gIGl0UGFyc2VzKCdleGNsdXNpb24oQGJhc2UsIEBtb2RpZmllciknKS53aXRoQ29udGV4dCh7XG4gICAgJ0BiYXNlJzogYXNDb2xvciAnI2ZmNjYwMCdcbiAgICAnQG1vZGlmaWVyJzogYXNDb2xvciAnIzY2NjY2NidcbiAgfSkuYXNDb2xvcignIzk5N2E2NicpXG4gIGl0UGFyc2VzKCdleGNsdXNpb24oQGJhc2UsIEBtb2RpZmllciknKS5hc0ludmFsaWQoKVxuXG4gIGl0UGFyc2VzKCdhdmVyYWdlKCNmZjY2MDAsIDB4NjY2NjY2KScpLmFzQ29sb3IoJyNiMzY2MzMnKVxuICBpdFBhcnNlcygnYXZlcmFnZShAYmFzZSwgQG1vZGlmaWVyKScpLndpdGhDb250ZXh0KHtcbiAgICAnQGJhc2UnOiBhc0NvbG9yICcjZmY2NjAwJ1xuICAgICdAbW9kaWZpZXInOiBhc0NvbG9yICcjNjY2NjY2J1xuICB9KS5hc0NvbG9yKCcjYjM2NjMzJylcbiAgaXRQYXJzZXMoJ2F2ZXJhZ2UoQGJhc2UsIEBtb2RpZmllciknKS5hc0ludmFsaWQoKVxuICBpdFBhcnNlcygnYXZlcmFnZShAZ3JhZGllbnQtYiwgQGdyYWRpZW50LW1lYW4pJykud2l0aENvbnRleHQoe1xuICAgICdAZ3JhZGllbnQtYSc6IGFzQ29sb3IgJyMwMGQzOGInXG4gICAgJ0BncmFkaWVudC1iJzogYXNDb2xvciAnIzAwOTI4NSdcbiAgICAnQGdyYWRpZW50LW1lYW4nOiBhc0NvbG9yICdhdmVyYWdlKEBncmFkaWVudC1hLCBAZ3JhZGllbnQtYiknXG4gIH0pLmFzQ29sb3IoJyMwMGEyODcnKVxuXG4gIGl0UGFyc2VzKCduZWdhdGlvbigjZmY2NjAwLCAweDY2NjY2NiknKS5hc0NvbG9yKCcjOTljYzY2JylcbiAgaXRQYXJzZXMoJ25lZ2F0aW9uKEBiYXNlLCBAbW9kaWZpZXIpJykud2l0aENvbnRleHQoe1xuICAgICdAYmFzZSc6IGFzQ29sb3IgJyNmZjY2MDAnXG4gICAgJ0Btb2RpZmllcic6IGFzQ29sb3IgJyM2NjY2NjYnXG4gIH0pLmFzQ29sb3IoJyM5OWNjNjYnKVxuICBpdFBhcnNlcygnbmVnYXRpb24oQGJhc2UsIEBtb2RpZmllciknKS5hc0ludmFsaWQoKVxuXG4gIGl0UGFyc2VzKCdibGVuZChyZ2JhKCNGRkRFMDAsLjQyKSwgMHgxOUMyNjEpJykuYXNDb2xvcignIzdhY2UzOCcpXG4gIGl0UGFyc2VzKCdibGVuZChAdG9wLCBAYm90dG9tKScpLndpdGhDb250ZXh0KHtcbiAgICAnQHRvcCc6IGFzQ29sb3IgJ3JnYmEoI0ZGREUwMCwuNDIpJ1xuICAgICdAYm90dG9tJzogYXNDb2xvciAnMHgxOUMyNjEnXG4gIH0pLmFzQ29sb3IoJyM3YWNlMzgnKVxuICBpdFBhcnNlcygnYmxlbmQoQHRvcCwgQGJvdHRvbSknKS5hc0ludmFsaWQoKVxuXG4gIGl0UGFyc2VzKCdjb21wbGVtZW50KHJlZCknKS5hc0NvbG9yKCcjMDBmZmZmJylcbiAgaXRQYXJzZXMoJ2NvbXBsZW1lbnQoQGJhc2UpJykud2l0aENvbnRleHQoe1xuICAgICdAYmFzZSc6IGFzQ29sb3IgJ3JlZCdcbiAgfSkuYXNDb2xvcignIzAwZmZmZicpXG4gIGl0UGFyc2VzKCdjb21wbGVtZW50KEBiYXNlKScpLmFzSW52YWxpZCgpXG5cbiAgaXRQYXJzZXMoJ3RyYW5zcGFyZW50aWZ5KCM4MDgwODApJykuYXNDb2xvcigwLDAsMCwwLjUpXG4gIGl0UGFyc2VzKCd0cmFuc3BhcmVudGlmeSgjNDE0MTQxLCBibGFjayknKS5hc0NvbG9yKDI1NSwyNTUsMjU1LDAuMjUpXG4gIGl0UGFyc2VzKCd0cmFuc3BhcmVudGlmeSgjOTE5NzRDLCAweEYzNDk0OSwgMC41KScpLmFzQ29sb3IoNDcsMjI5LDc5LDAuNSlcbiAgaXRQYXJzZXMoJ3RyYW5zcGFyZW50aWZ5KGEpJykud2l0aENvbnRleHQoe1xuICAgICdhJzogYXNDb2xvciAnIzgwODA4MCdcbiAgfSkuYXNDb2xvcigwLDAsMCwwLjUpXG4gIGl0UGFyc2VzKCd0cmFuc3BhcmVudGlmeShhLCBiLCAwLjUpJykud2l0aENvbnRleHQoe1xuICAgICdhJzogYXNDb2xvciAnIzkxOTc0QydcbiAgICAnYic6IGFzQ29sb3IgJyNGMzQ5NDknXG4gIH0pLmFzQ29sb3IoNDcsMjI5LDc5LDAuNSlcbiAgaXRQYXJzZXMoJ3RyYW5zcGFyZW50aWZ5KGEpJykuYXNJbnZhbGlkKClcblxuICBpdFBhcnNlcygncmVkKCMwMDAsIDI1NSknKS5hc0NvbG9yKDI1NSwwLDApXG4gIGl0UGFyc2VzKCdyZWQoYSwgYiknKS53aXRoQ29udGV4dCh7XG4gICAgJ2EnOiBhc0NvbG9yICcjMDAwJ1xuICAgICdiJzogJzI1NSdcbiAgfSkuYXNDb2xvcigyNTUsMCwwKVxuICBpdFBhcnNlcygncmVkKGEsIGIpJykuYXNJbnZhbGlkKClcblxuICBpdFBhcnNlcygnZ3JlZW4oIzAwMCwgMjU1KScpLmFzQ29sb3IoMCwyNTUsMClcbiAgaXRQYXJzZXMoJ2dyZWVuKGEsIGIpJykud2l0aENvbnRleHQoe1xuICAgICdhJzogYXNDb2xvciAnIzAwMCdcbiAgICAnYic6ICcyNTUnXG4gIH0pLmFzQ29sb3IoMCwyNTUsMClcbiAgaXRQYXJzZXMoJ2dyZWVuKGEsIGIpJykuYXNJbnZhbGlkKClcblxuICBpdFBhcnNlcygnYmx1ZSgjMDAwLCAyNTUpJykuYXNDb2xvcigwLDAsMjU1KVxuICBpdFBhcnNlcygnYmx1ZShhLCBiKScpLndpdGhDb250ZXh0KHtcbiAgICAnYSc6IGFzQ29sb3IgJyMwMDAnXG4gICAgJ2InOiAnMjU1J1xuICB9KS5hc0NvbG9yKDAsMCwyNTUpXG4gIGl0UGFyc2VzKCdibHVlKGEsIGIpJykuYXNJbnZhbGlkKClcblxuICBpdFBhcnNlcygnYWxwaGEoIzAwMCwgMC41KScpLmFzQ29sb3IoMCwwLDAsMC41KVxuICBpdFBhcnNlcygnYWxwaGEoYSwgYiknKS53aXRoQ29udGV4dCh7XG4gICAgJ2EnOiBhc0NvbG9yICcjMDAwJ1xuICAgICdiJzogJzAuNSdcbiAgfSkuYXNDb2xvcigwLDAsMCwwLjUpXG4gIGl0UGFyc2VzKCdhbHBoYShhLCBiKScpLmFzSW52YWxpZCgpXG5cbiAgaXRQYXJzZXMoJ2h1ZSgjMDBjLCA5MGRlZyknKS5hc0NvbG9yKDB4NjYsMHhDQywwKVxuICBpdFBhcnNlcygnaHVlKGEsIGIpJykud2l0aENvbnRleHQoe1xuICAgICdhJzogYXNDb2xvciAnIzAwYydcbiAgICAnYic6ICc5MGRlZydcbiAgfSkuYXNDb2xvcigweDY2LDB4Q0MsMClcbiAgaXRQYXJzZXMoJ2h1ZShhLCBiKScpLmFzSW52YWxpZCgpXG5cbiAgaXRQYXJzZXMoJ3NhdHVyYXRpb24oIzAwYywgNTAlKScpLmFzQ29sb3IoMHgzMywweDMzLDB4OTkpXG4gIGl0UGFyc2VzKCdzYXR1cmF0aW9uKGEsIGIpJykud2l0aENvbnRleHQoe1xuICAgICdhJzogYXNDb2xvciAnIzAwYydcbiAgICAnYic6ICc1MCUnXG4gIH0pLmFzQ29sb3IoMHgzMywweDMzLDB4OTkpXG4gIGl0UGFyc2VzKCdzYXR1cmF0aW9uKGEsIGIpJykuYXNJbnZhbGlkKClcblxuICBpdFBhcnNlcygnbGlnaHRuZXNzKCMwMGMsIDgwJSknKS5hc0NvbG9yKDB4OTksMHg5OSwweGZmKVxuICBpdFBhcnNlcygnbGlnaHRuZXNzKGEsIGIpJykud2l0aENvbnRleHQoe1xuICAgICdhJzogYXNDb2xvciAnIzAwYydcbiAgICAnYic6ICc4MCUnXG4gIH0pLmFzQ29sb3IoMHg5OSwweDk5LDB4ZmYpXG4gIGl0UGFyc2VzKCdsaWdodG5lc3MoYSwgYiknKS5hc0ludmFsaWQoKVxuXG4gIGRlc2NyaWJlICdDU1MgY29sb3IgZnVuY3Rpb24nLCAtPlxuICAgIGJlZm9yZUVhY2ggLT4gQHNjb3BlID0gJ2NzcydcblxuICAgIGl0UGFyc2VzKCdjb2xvcigjZmQwY2M3IHRpbnQoNjYlKSknKS5hc0NvbG9yKDI1NCwgMTcyLCAyMzYpXG4gICAgaXRQYXJzZXMoJ0NPTE9SKCNmZDBjYzcgdGludCg2NiUpKScpLmFzQ29sb3IoMjU0LCAxNzIsIDIzNilcbiAgICBpdFBhcnNlcygnY09sT3IoI2ZkMGNjNyB0aW50KDY2JSkpJykuYXNDb2xvcigyNTQsIDE3MiwgMjM2KVxuICAgIGl0UGFyc2VzKCdjb2xvcih2YXIoLS1mb28pIHRpbnQoNjYlKSknKS53aXRoQ29udGV4dCh7XG4gICAgICAndmFyKC0tZm9vKSc6IGFzQ29sb3IgJyNmZDBjYzcnXG4gICAgfSkuYXNDb2xvcigyNTQsIDE3MiwgMjM2KVxuXG4gIGRlc2NyaWJlICdsdWEgY29sb3InLCAtPlxuICAgIGJlZm9yZUVhY2ggLT4gQHNjb3BlID0gJ2x1YSdcblxuICAgIGl0UGFyc2VzKCdDb2xvcigyNTUsIDAsIDAsIDI1NSknKS5hc0NvbG9yKDI1NSwwLDApXG4gICAgaXRQYXJzZXMoJ0NvbG9yKHIsIGcsIGIsIGEpJykud2l0aENvbnRleHQoe1xuICAgICAgJ3InOiAnMjU1J1xuICAgICAgJ2cnOiAnMCdcbiAgICAgICdiJzogJzAnXG4gICAgICAnYSc6ICcyNTUnXG4gICAgfSkuYXNDb2xvcigyNTUsMCwwKVxuICAgIGl0UGFyc2VzKCdDb2xvcihyLCBnLCBiLCBhKScpLmFzSW52YWxpZCgpXG5cbiAgIyAgICAjIyMjIyMjIyAjIyAgICAgICAjIyAgICAgIyNcbiAgIyAgICAjIyAgICAgICAjIyAgICAgICAjIyMgICAjIyNcbiAgIyAgICAjIyAgICAgICAjIyAgICAgICAjIyMjICMjIyNcbiAgIyAgICAjIyMjIyMgICAjIyAgICAgICAjIyAjIyMgIyNcbiAgIyAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAgIyNcbiAgIyAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAgIyNcbiAgIyAgICAjIyMjIyMjIyAjIyMjIyMjIyAjIyAgICAgIyNcblxuICBkZXNjcmliZSAnZWxtLWxhbmcgc3VwcG9ydCcsIC0+XG4gICAgYmVmb3JlRWFjaCAtPiBAc2NvcGUgPSAnZWxtJ1xuXG4gICAgaXRQYXJzZXMoJ3JnYmEgMjU1IDAgMCAxJykuYXNDb2xvcigyNTUsMCwwKVxuICAgIGl0UGFyc2VzKCdyZ2JhIHIgZyBiIGEnKS53aXRoQ29udGV4dCh7XG4gICAgICAncic6ICcyNTUnXG4gICAgICAnZyc6ICcwJ1xuICAgICAgJ2InOiAnMCdcbiAgICAgICdhJzogJzEnXG4gICAgfSkuYXNDb2xvcigyNTUsMCwwKVxuICAgIGl0UGFyc2VzKCdyZ2JhIHIgZyBiIGEnKS5hc0ludmFsaWQoKVxuXG4gICAgaXRQYXJzZXMoJ3JnYiAyNTUgMCAwJykuYXNDb2xvcigyNTUsMCwwKVxuICAgIGl0UGFyc2VzKCdyZ2IgciBnIGInKS53aXRoQ29udGV4dCh7XG4gICAgICAncic6ICcyNTUnXG4gICAgICAnZyc6ICcwJ1xuICAgICAgJ2InOiAnMCdcbiAgICB9KS5hc0NvbG9yKDI1NSwwLDApXG4gICAgaXRQYXJzZXMoJ3JnYiByIGcgYicpLmFzSW52YWxpZCgpXG5cbiAgICBpdFBhcnNlcygnaHNsYSAoZGVncmVlcyAyMDApIDUwIDUwIDAuNScpLmFzQ29sb3IoNjQsIDE0OSwgMTkxLCAwLjUpXG4gICAgaXRQYXJzZXMoJ2hzbGEgKGRlZ3JlZXMgaCkgcyBsIGEnKS53aXRoQ29udGV4dCh7XG4gICAgICAnaCc6ICcyMDAnXG4gICAgICAncyc6ICc1MCdcbiAgICAgICdsJzogJzUwJ1xuICAgICAgJ2EnOiAnMC41J1xuICAgIH0pLmFzQ29sb3IoNjQsIDE0OSwgMTkxLCAwLjUpXG4gICAgaXRQYXJzZXMoJ2hzbGEgKGRlZ3JlZXMgaCkgcyBsIGEnKS5hc0ludmFsaWQoKVxuXG4gICAgaXRQYXJzZXMoJ2hzbGEgMy40OSA1MCA1MCAwLjUnKS5hc0NvbG9yKDY0LCAxNDksIDE5MSwgMC41KVxuICAgIGl0UGFyc2VzKCdoc2xhIGggcyBsIGEnKS53aXRoQ29udGV4dCh7XG4gICAgICAnaCc6ICczLjQ5J1xuICAgICAgJ3MnOiAnNTAnXG4gICAgICAnbCc6ICc1MCdcbiAgICAgICdhJzogJzAuNSdcbiAgICB9KS5hc0NvbG9yKDY0LCAxNDksIDE5MSwgMC41KVxuICAgIGl0UGFyc2VzKCdoc2xhIGggcyBsIGEnKS5hc0ludmFsaWQoKVxuXG4gICAgaXRQYXJzZXMoJ2hzbCAoZGVncmVlcyAyMDApIDUwIDUwJykuYXNDb2xvcig2NCwgMTQ5LCAxOTEpXG4gICAgaXRQYXJzZXMoJ2hzbCAoZGVncmVlcyBoKSBzIGwnKS53aXRoQ29udGV4dCh7XG4gICAgICAnaCc6ICcyMDAnXG4gICAgICAncyc6ICc1MCdcbiAgICAgICdsJzogJzUwJ1xuICAgIH0pLmFzQ29sb3IoNjQsIDE0OSwgMTkxKVxuICAgIGl0UGFyc2VzKCdoc2wgKGRlZ3JlZXMgaCkgcyBsJykuYXNJbnZhbGlkKClcblxuICAgIGl0UGFyc2VzKCdoc2wgMy40OSA1MCA1MCcpLmFzQ29sb3IoNjQsIDE0OSwgMTkxKVxuICAgIGl0UGFyc2VzKCdoc2wgaCBzIGwnKS53aXRoQ29udGV4dCh7XG4gICAgICAnaCc6ICczLjQ5J1xuICAgICAgJ3MnOiAnNTAnXG4gICAgICAnbCc6ICc1MCdcbiAgICB9KS5hc0NvbG9yKDY0LCAxNDksIDE5MSlcbiAgICBpdFBhcnNlcygnaHNsIGggcyBsJykuYXNJbnZhbGlkKClcblxuICAgIGl0UGFyc2VzKCdncmF5c2NhbGUgMScpLmFzQ29sb3IoMCwgMCwgMClcbiAgICBpdFBhcnNlcygnZ3JleXNjYWxlIDAuNScpLmFzQ29sb3IoMTI3LCAxMjcsIDEyNylcbiAgICBpdFBhcnNlcygnZ3JheXNjYWxlIDAnKS5hc0NvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgaXRQYXJzZXMoJ2dyYXlzY2FsZSBnJykud2l0aENvbnRleHQoe1xuICAgICAgJ2cnOiAnMC41J1xuICAgIH0pLmFzQ29sb3IoMTI3LCAxMjcsIDEyNylcbiAgICBpdFBhcnNlcygnZ3JheXNjYWxlIGcnKS5hc0ludmFsaWQoKVxuXG4gICAgaXRQYXJzZXMoJ2NvbXBsZW1lbnQgcmdiIDI1NSAwIDAnKS5hc0NvbG9yKCcjMDBmZmZmJylcbiAgICBpdFBhcnNlcygnY29tcGxlbWVudCBiYXNlJykud2l0aENvbnRleHQoe1xuICAgICAgJ2Jhc2UnOiBhc0NvbG9yICdyZWQnXG4gICAgfSkuYXNDb2xvcignIzAwZmZmZicpXG4gICAgaXRQYXJzZXMoJ2NvbXBsZW1lbnQgYmFzZScpLmFzSW52YWxpZCgpXG5cbiAgIyAgICAjIyAgICAgICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyMgIyMgICAgICMjXG4gICMgICAgIyMgICAgICAgICAjIyAjIyAgICAgICMjICAgICMjICAgICAgICAjIyAgICMjXG4gICMgICAgIyMgICAgICAgICMjICAgIyMgICAgICMjICAgICMjICAgICAgICAgIyMgIyNcbiAgIyAgICAjIyAgICAgICAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjICAgICAgIyMjXG4gICMgICAgIyMgICAgICAgIyMjIyMjIyMjICAgICMjICAgICMjICAgICAgICAgIyMgIyNcbiAgIyAgICAjIyAgICAgICAjIyAgICAgIyMgICAgIyMgICAgIyMgICAgICAgICMjICAgIyNcbiAgIyAgICAjIyMjIyMjIyAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjIyMgIyMgICAgICMjXG5cbiAgZGVzY3JpYmUgJ2xhdGV4IHN1cHBvcnQnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT4gQHNjb3BlID0gJ3RleCdcblxuICAgIGl0UGFyc2VzKCdbZ3JheV17MX0nKS5hc0NvbG9yKCcjZmZmZmZmJylcbiAgICBpdFBhcnNlcygnW3JnYl17MSwwLjUsMH0nKS5hc0NvbG9yKCcjZmY3ZjAwJylcbiAgICBpdFBhcnNlcygnW1JHQl17MjU1LDEyNywwfScpLmFzQ29sb3IoJyNmZjdmMDAnKVxuICAgIGl0UGFyc2VzKCdbY215a117MCwwLjUsMSwwfScpLmFzQ29sb3IoJyNmZjdmMDAnKVxuICAgIGl0UGFyc2VzKCdbSFRNTF17ZmY3ZjAwfScpLmFzQ29sb3IoJyNmZjdmMDAnKVxuICAgIGl0UGFyc2VzKCd7Ymx1ZX0nKS5hc0NvbG9yKCcjMDAwMGZmJylcblxuICAgIGl0UGFyc2VzKCd7Ymx1ZSEyMH0nKS5hc0NvbG9yKCcjY2NjY2ZmJylcbiAgICBpdFBhcnNlcygne2JsdWUhMjAhYmxhY2t9JykuYXNDb2xvcignIzAwMDAzMycpXG4gICAgaXRQYXJzZXMoJ3tibHVlITIwIWJsYWNrITMwIWdyZWVufScpLmFzQ29sb3IoJyMwMDU5MGYnKVxuXG4gICMgICAgICMjIyMjIyMgICMjIyMjIyMjXG4gICMgICAgIyMgICAgICMjICAgICMjXG4gICMgICAgIyMgICAgICMjICAgICMjXG4gICMgICAgIyMgICAgICMjICAgICMjXG4gICMgICAgIyMgICMjICMjICAgICMjXG4gICMgICAgIyMgICAgIyMgICAgICMjXG4gICMgICAgICMjIyMjICMjICAgICMjXG5cbiAgZGVzY3JpYmUgJ3F0IHN1cHBvcnQnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT4gQHNjb3BlID0gJ3FtbCdcblxuICAgIGl0UGFyc2VzKCdRdC5yZ2JhKDEuMCwxLjAsMCwwLjUpJykuYXNDb2xvcigyNTUsIDI1NSwgMCwgMC41KVxuXG4gIGRlc2NyaWJlICdxdCBjcHAgc3VwcG9ydCcsIC0+XG4gICAgYmVmb3JlRWFjaCAtPiBAc2NvcGUgPSAnY3BwJ1xuXG4gICAgaXRQYXJzZXMoJ1F0LnJnYmEoMS4wLDEuMCwwLDAuNSknKS5hc0NvbG9yKDI1NSwgMjU1LCAwLCAwLjUpXG4iXX0=
