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
              var _ref, _ref1;
              if (context != null) {
                return expect(parser.parse(expression, (_ref = this.scope) != null ? _ref : 'less')).toBeColor(r, g, b, a, Object.keys(context).sort());
              } else {
                return expect(parser.parse(expression, (_ref1 = this.scope) != null ? _ref1 : 'less')).toBeColor(r, g, b, a);
              }
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
    itParses('hsl(200,50%,50%)').asColor(64, 149, 191);
    itParses('hsl(200,50,50)').asColor(64, 149, 191);
    itParses('hsl(200.5,50.5,50.5)').asColor(65, 150, 193);
    itParses('hsl($h,$s,$l,)').asUndefined();
    itParses('hsl($h,$s,$l)').asInvalid();
    itParses('hsl($h,0%,0%)').asInvalid();
    itParses('hsl(0,$s,0%)').asInvalid();
    itParses('hsl(0,0%,$l)').asInvalid();
    itParses('hsl($h,$s,$l)').withContext({
      '$h': '200',
      '$s': '50%',
      '$l': '50%'
    }).asColor(64, 149, 191);
    itParses('hsla(200,50%,50%,0.5)').asColor(64, 149, 191, 0.5);
    itParses('hsla(200,50%,50%,.5)').asColor(64, 149, 191, 0.5);
    itParses('hsla(200,50,50,.5)').asColor(64, 149, 191, 0.5);
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
    itParses('hsba(200,50%,50%,0.5)').asColor(64, 106, 128, 0.5);
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
    itParses('hwb(210,40%,40%)').asColor(102, 128, 153);
    itParses('hwb(210,40,40)').asColor(102, 128, 153);
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
    itParses('gray(100%)').asColor(255, 255, 255);
    itParses('gray(100)').asColor(255, 255, 255);
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
      beforeEach(function() {
        return this.scope = 'sass';
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
    itParses('color(#fd0cc7 tint(66%))').asColor(254, 172, 236);
    itParses('color(var(--foo) tint(66%))').withContext({
      'var(--foo)': asColor('#fd0cc7')
    }).asColor(254, 172, 236);
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
    return describe('elm-lang support', function() {
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
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9jb2xvci1wYXJzZXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0RBQUE7O0FBQUEsRUFBQSxPQUFBLENBQVEsb0JBQVIsQ0FBQSxDQUFBOztBQUFBLEVBRUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUixDQUZkLENBQUE7O0FBQUEsRUFHQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSLENBSGYsQ0FBQTs7QUFBQSxFQUlBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHlCQUFSLENBSmxCLENBQUE7O0FBQUEsRUFLQSxRQUFBLEdBQVcsT0FBQSxDQUFRLDBCQUFSLENBTFgsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixRQUFBLG9DQUFBO0FBQUEsSUFBQyxTQUFVLEtBQVgsQ0FBQTtBQUFBLElBRUEsT0FBQSxHQUFVLFNBQUMsS0FBRCxHQUFBO2FBQVksUUFBQSxHQUFRLE1BQXBCO0lBQUEsQ0FGVixDQUFBO0FBQUEsSUFJQSxTQUFBLEdBQVksU0FBQyxPQUFELEdBQUE7QUFDVixNQUFBLE9BQUEsR0FBYyxJQUFBLFlBQUEsbUJBQWEsVUFBVTtBQUFBLFFBQUMsVUFBQSxRQUFEO09BQXZCLENBQWQsQ0FBQTthQUNBLE9BQU8sQ0FBQyxPQUZFO0lBQUEsQ0FKWixDQUFBO0FBQUEsSUFRQSxRQUFBLEdBQVcsU0FBQyxVQUFELEdBQUE7YUFDVDtBQUFBLFFBQUEsV0FBQSxFQUFhLEVBQWI7QUFBQSxRQUNBLE9BQUEsRUFBUyxTQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsR0FBQTtBQUNQLGNBQUEsT0FBQTs7WUFEYyxJQUFFO1dBQ2hCO0FB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/spec/color-parser-spec.coffee
