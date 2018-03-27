(function() {
  var ColorExpression, ExpressionsRegistry, SVGColors, colorRegexp, colors, comma, elmAngle, float, floatOrPercent, hexadecimal, insensitive, int, intOrPercent, namePrefixes, notQuote, optionalPercent, pe, percent, ps, registry, strip, variables, _ref, _ref1;

  _ref = require('./regexes'), int = _ref.int, float = _ref.float, percent = _ref.percent, optionalPercent = _ref.optionalPercent, intOrPercent = _ref.intOrPercent, floatOrPercent = _ref.floatOrPercent, comma = _ref.comma, notQuote = _ref.notQuote, hexadecimal = _ref.hexadecimal, ps = _ref.ps, pe = _ref.pe, variables = _ref.variables, namePrefixes = _ref.namePrefixes;

  _ref1 = require('./utils'), strip = _ref1.strip, insensitive = _ref1.insensitive;

  ExpressionsRegistry = require('./expressions-registry');

  ColorExpression = require('./color-expression');

  SVGColors = require('./svg-colors');

  module.exports = registry = new ExpressionsRegistry(ColorExpression);

  registry.createExpression('pigments:css_hexa_8', "#(" + hexadecimal + "{8})(?![\\d\\w-])", 1, ['css', 'less', 'styl', 'stylus', 'sass', 'scss'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hexRGBA = hexa;
  });

  registry.createExpression('pigments:argb_hexa_8', "#(" + hexadecimal + "{8})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hexARGB = hexa;
  });

  registry.createExpression('pigments:css_hexa_6', "#(" + hexadecimal + "{6})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hex = hexa;
  });

  registry.createExpression('pigments:css_hexa_4', "(?:" + namePrefixes + ")#(" + hexadecimal + "{4})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var colorAsInt, hexa, _;
    _ = match[0], hexa = match[1];
    colorAsInt = context.readInt(hexa, 16);
    this.colorExpression = "#" + hexa;
    this.red = (colorAsInt >> 12 & 0xf) * 17;
    this.green = (colorAsInt >> 8 & 0xf) * 17;
    this.blue = (colorAsInt >> 4 & 0xf) * 17;
    return this.alpha = ((colorAsInt & 0xf) * 17) / 255;
  });

  registry.createExpression('pigments:css_hexa_3', "(?:" + namePrefixes + ")#(" + hexadecimal + "{3})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var colorAsInt, hexa, _;
    _ = match[0], hexa = match[1];
    colorAsInt = context.readInt(hexa, 16);
    this.colorExpression = "#" + hexa;
    this.red = (colorAsInt >> 8 & 0xf) * 17;
    this.green = (colorAsInt >> 4 & 0xf) * 17;
    return this.blue = (colorAsInt & 0xf) * 17;
  });

  registry.createExpression('pigments:int_hexa_8', "0x(" + hexadecimal + "{8})(?!" + hexadecimal + ")", ['*'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hexARGB = hexa;
  });

  registry.createExpression('pigments:int_hexa_6', "0x(" + hexadecimal + "{6})(?!" + hexadecimal + ")", ['*'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hex = hexa;
  });

  registry.createExpression('pigments:css_rgb', strip("" + (insensitive('rgb')) + ps + "\\s* (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    this.red = context.readIntOrPercent(r);
    this.green = context.readIntOrPercent(g);
    this.blue = context.readIntOrPercent(b);
    return this.alpha = 1;
  });

  registry.createExpression('pigments:css_rgba', strip("" + (insensitive('rgba')) + ps + "\\s* (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var a, b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readIntOrPercent(r);
    this.green = context.readIntOrPercent(g);
    this.blue = context.readIntOrPercent(b);
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:stylus_rgba', strip("rgba" + ps + "\\s* (" + notQuote + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var a, baseColor, subexpr, _;
    _ = match[0], subexpr = match[1], a = match[2];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:css_hsl', strip("" + (insensitive('hsl')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['css', 'sass', 'scss', 'styl', 'stylus'], function(match, expression, context) {
    var h, hsl, l, s, _;
    _ = match[0], h = match[1], s = match[2], l = match[3];
    hsl = [context.readInt(h), context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:less_hsl', strip("hsl" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['less'], function(match, expression, context) {
    var h, hsl, l, s, _;
    _ = match[0], h = match[1], s = match[2], l = match[3];
    hsl = [context.readInt(h), context.readFloatOrPercent(s) * 100, context.readFloatOrPercent(l) * 100];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:css_hsla', strip("" + (insensitive('hsla')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var a, h, hsl, l, s, _;
    _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
    hsl = [context.readInt(h), context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:hsv', strip("(?:" + (insensitive('hsv')) + "|" + (insensitive('hsb')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var h, hsv, s, v, _;
    _ = match[0], h = match[1], s = match[2], v = match[3];
    hsv = [context.readInt(h), context.readFloat(s), context.readFloat(v)];
    if (hsv.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsv = hsv;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:hsva', strip("(?:" + (insensitive('hsva')) + "|" + (insensitive('hsba')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var a, h, hsv, s, v, _;
    _ = match[0], h = match[1], s = match[2], v = match[3], a = match[4];
    hsv = [context.readInt(h), context.readFloat(s), context.readFloat(v)];
    if (hsv.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsv = hsv;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:hcg', strip("(?:" + (insensitive('hcg')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var c, gr, h, hcg, _;
    _ = match[0], h = match[1], c = match[2], gr = match[3];
    hcg = [context.readInt(h), context.readFloat(c), context.readFloat(gr)];
    if (hcg.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hcg = hcg;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:hcga', strip("(?:" + (insensitive('hcga')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var a, c, gr, h, hcg, _;
    _ = match[0], h = match[1], c = match[2], gr = match[3], a = match[4];
    hcg = [context.readInt(h), context.readFloat(c), context.readFloat(gr)];
    if (hcg.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hcg = hcg;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:vec4', strip("vec4" + ps + "\\s* (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + pe), ['*'], function(match, expression, context) {
    var a, h, l, s, _;
    _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
    return this.rgba = [context.readFloat(h) * 255, context.readFloat(s) * 255, context.readFloat(l) * 255, context.readFloat(a)];
  });

  registry.createExpression('pigments:hwb', strip("" + (insensitive('hwb')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") (?:" + comma + "(" + float + "|" + variables + "))? " + pe), ['*'], function(match, expression, context) {
    var a, b, h, w, _;
    _ = match[0], h = match[1], w = match[2], b = match[3], a = match[4];
    this.hwb = [context.readInt(h), context.readFloat(w), context.readFloat(b)];
    return this.alpha = a != null ? context.readFloat(a) : 1;
  });

  registry.createExpression('pigments:cmyk', strip("" + (insensitive('cmyk')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var c, k, m, y, _;
    _ = match[0], c = match[1], m = match[2], y = match[3], k = match[4];
    return this.cmyk = [context.readFloat(c), context.readFloat(m), context.readFloat(y), context.readFloat(k)];
  });

  registry.createExpression('pigments:gray', strip("" + (insensitive('gray')) + ps + "\\s* (" + optionalPercent + "|" + variables + ") (?:" + comma + "(" + float + "|" + variables + "))? " + pe), 1, ['*'], function(match, expression, context) {
    var a, p, _;
    _ = match[0], p = match[1], a = match[2];
    p = context.readFloat(p) / 100 * 255;
    this.rgb = [p, p, p];
    return this.alpha = a != null ? context.readFloat(a) : 1;
  });

  colors = Object.keys(SVGColors.allCases);

  colorRegexp = "(?:" + namePrefixes + ")(" + (colors.join('|')) + ")\\b(?![ \\t]*[-\\.:=\\(])";

  registry.createExpression('pigments:named_colors', colorRegexp, [], function(match, expression, context) {
    var name, _;
    _ = match[0], name = match[1];
    this.colorExpression = this.name = name;
    return this.hex = context.SVGColors.allCases[name].replace('#', '');
  });

  registry.createExpression('pigments:darken', strip("darken" + ps + " (" + notQuote + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [h, s, context.clampInt(l - amount)];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:lighten', strip("lighten" + ps + " (" + notQuote + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [h, s, context.clampInt(l + amount)];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:fade', strip("(?:fade|alpha)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = amount;
  });

  registry.createExpression('pigments:transparentize', strip("(?:transparentize|fadeout|fade-out|fade_out)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = context.clamp(baseColor.alpha - amount);
  });

  registry.createExpression('pigments:opacify', strip("(?:opacify|fadein|fade-in|fade_in)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = context.clamp(baseColor.alpha + amount);
  });

  registry.createExpression('pigments:stylus_component_functions', strip("(red|green|blue)" + ps + " (" + notQuote + ") " + comma + " (" + int + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, channel, subexpr, _;
    _ = match[0], channel = match[1], subexpr = match[2], amount = match[3];
    amount = context.readInt(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (isNaN(amount)) {
      return this.invalid = true;
    }
    return this[channel] = amount;
  });

  registry.createExpression('pigments:transparentify', strip("transparentify" + ps + " (" + notQuote + ") " + pe), ['*'], function(match, expression, context) {
    var alpha, bestAlpha, bottom, expr, processChannel, top, _, _ref2;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), top = _ref2[0], bottom = _ref2[1], alpha = _ref2[2];
    top = context.readColor(top);
    bottom = context.readColor(bottom);
    alpha = context.readFloatOrPercent(alpha);
    if (context.isInvalid(top)) {
      return this.invalid = true;
    }
    if ((bottom != null) && context.isInvalid(bottom)) {
      return this.invalid = true;
    }
    if (bottom == null) {
      bottom = new context.Color(255, 255, 255, 1);
    }
    if (isNaN(alpha)) {
      alpha = void 0;
    }
    bestAlpha = ['red', 'green', 'blue'].map(function(channel) {
      var res;
      res = (top[channel] - bottom[channel]) / ((0 < top[channel] - bottom[channel] ? 255 : 0) - bottom[channel]);
      return res;
    }).sort(function(a, b) {
      return a < b;
    })[0];
    processChannel = function(channel) {
      if (bestAlpha === 0) {
        return bottom[channel];
      } else {
        return bottom[channel] + (top[channel] - bottom[channel]) / bestAlpha;
      }
    };
    if (alpha != null) {
      bestAlpha = alpha;
    }
    bestAlpha = Math.max(Math.min(bestAlpha, 1), 0);
    this.red = processChannel('red');
    this.green = processChannel('green');
    this.blue = processChannel('blue');
    return this.alpha = Math.round(bestAlpha * 100) / 100;
  });

  registry.createExpression('pigments:hue', strip("hue" + ps + " (" + notQuote + ") " + comma + " (" + int + "deg|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (isNaN(amount)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [amount % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:stylus_sl_component_functions', strip("(saturation|lightness)" + ps + " (" + notQuote + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, channel, subexpr, _;
    _ = match[0], channel = match[1], subexpr = match[2], amount = match[3];
    amount = context.readInt(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (isNaN(amount)) {
      return this.invalid = true;
    }
    baseColor[channel] = amount;
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:adjust-hue', strip("adjust-hue" + ps + " (" + notQuote + ") " + comma + " (-?" + int + "deg|" + variables + "|-?" + optionalPercent + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [(h + amount) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:mix', "mix" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var amount, baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1], amount = _ref2[2];
    if (amount != null) {
      amount = context.readFloatOrPercent(amount);
    } else {
      amount = 0.5;
    }
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = context.mixColors(baseColor1, baseColor2, amount), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:stylus_tint', strip("tint" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['styl', 'stylus', 'less'], function(match, expression, context) {
    var amount, baseColor, subexpr, white, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    white = new context.Color(255, 255, 255);
    return this.rgba = context.mixColors(white, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:stylus_shade', strip("shade" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['styl', 'stylus', 'less'], function(match, expression, context) {
    var amount, baseColor, black, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    black = new context.Color(0, 0, 0);
    return this.rgba = context.mixColors(black, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:compass_tint', strip("tint" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:compass', 'scss:compass'], function(match, expression, context) {
    var amount, baseColor, subexpr, white, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    white = new context.Color(255, 255, 255);
    return this.rgba = context.mixColors(baseColor, white, amount).rgba;
  });

  registry.createExpression('pigments:compass_shade', strip("shade" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:compass', 'scss:compass'], function(match, expression, context) {
    var amount, baseColor, black, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    black = new context.Color(0, 0, 0);
    return this.rgba = context.mixColors(baseColor, black, amount).rgba;
  });

  registry.createExpression('pigments:bourbon_tint', strip("tint" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:bourbon', 'scss:bourbon'], function(match, expression, context) {
    var amount, baseColor, subexpr, white, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    white = new context.Color(255, 255, 255);
    return this.rgba = context.mixColors(white, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:bourbon_shade', strip("shade" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:bourbon', 'scss:bourbon'], function(match, expression, context) {
    var amount, baseColor, black, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    black = new context.Color(0, 0, 0);
    return this.rgba = context.mixColors(black, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:desaturate', "desaturate" + ps + "(" + notQuote + ")" + comma + "(" + floatOrPercent + "|" + variables + ")" + pe, ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [h, context.clampInt(s - amount * 100), l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:saturate', strip("saturate" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [h, context.clampInt(s + amount * 100), l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:grayscale', "gr(?:a|e)yscale" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [h, 0, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:invert', "invert" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var b, baseColor, g, r, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.rgb, r = _ref2[0], g = _ref2[1], b = _ref2[2];
    this.rgb = [255 - r, 255 - g, 255 - b];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:complement', "complement" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [(h + 180) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:spin', strip("spin" + ps + " (" + notQuote + ") " + comma + " (-?(" + int + ")(deg)?|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var angle, baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1], angle = match[2];
    baseColor = context.readColor(subexpr);
    angle = context.readInt(angle);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [(360 + h + angle) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:contrast_n_arguments', strip("contrast" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var base, baseColor, dark, expr, light, res, threshold, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), base = _ref2[0], dark = _ref2[1], light = _ref2[2], threshold = _ref2[3];
    baseColor = context.readColor(base);
    dark = context.readColor(dark);
    light = context.readColor(light);
    if (threshold != null) {
      threshold = context.readPercent(threshold);
    }
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (dark != null ? dark.invalid : void 0) {
      return this.invalid = true;
    }
    if (light != null ? light.invalid : void 0) {
      return this.invalid = true;
    }
    res = context.contrast(baseColor, dark, light);
    if (context.isInvalid(res)) {
      return this.invalid = true;
    }
    return _ref3 = context.contrast(baseColor, dark, light, threshold), this.rgb = _ref3.rgb, _ref3;
  });

  registry.createExpression('pigments:contrast_1_argument', strip("contrast" + ps + " (" + notQuote + ") " + pe), ['*'], function(match, expression, context) {
    var baseColor, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    return _ref2 = context.contrast(baseColor), this.rgb = _ref2.rgb, _ref2;
  });

  registry.createExpression('pigments:css_color_function', "(?:" + namePrefixes + ")(" + (insensitive('color')) + ps + "(" + notQuote + ")" + pe + ")", ['css'], function(match, expression, context) {
    var cssColor, e, expr, k, rgba, v, _, _ref2;
    try {
      _ = match[0], expr = match[1];
      _ref2 = context.vars;
      for (k in _ref2) {
        v = _ref2[k];
        expr = expr.replace(RegExp("" + (k.replace(/\(/g, '\\(').replace(/\)/g, '\\)')), "g"), v.value);
      }
      cssColor = require('css-color-function');
      rgba = cssColor.convert(expr.toLowerCase());
      this.rgba = context.readColor(rgba).rgba;
      return this.colorExpression = expr;
    } catch (_error) {
      e = _error;
      return this.invalid = true;
    }
  });

  registry.createExpression('pigments:sass_adjust_color', "adjust-color" + ps + "(" + notQuote + ")" + pe, 1, ['*'], function(match, expression, context) {
    var baseColor, param, params, res, subexpr, subject, _, _i, _len;
    _ = match[0], subexpr = match[1];
    res = context.split(subexpr);
    subject = res[0];
    params = res.slice(1);
    baseColor = context.readColor(subject);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    for (_i = 0, _len = params.length; _i < _len; _i++) {
      param = params[_i];
      context.readParam(param, function(name, value) {
        return baseColor[name] += context.readFloat(value);
      });
    }
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:sass_scale_color', "scale-color" + ps + "(" + notQuote + ")" + pe, 1, ['*'], function(match, expression, context) {
    var MAX_PER_COMPONENT, baseColor, param, params, res, subexpr, subject, _, _i, _len;
    MAX_PER_COMPONENT = {
      red: 255,
      green: 255,
      blue: 255,
      alpha: 1,
      hue: 360,
      saturation: 100,
      lightness: 100
    };
    _ = match[0], subexpr = match[1];
    res = context.split(subexpr);
    subject = res[0];
    params = res.slice(1);
    baseColor = context.readColor(subject);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    for (_i = 0, _len = params.length; _i < _len; _i++) {
      param = params[_i];
      context.readParam(param, function(name, value) {
        var dif, result;
        value = context.readFloat(value) / 100;
        result = value > 0 ? (dif = MAX_PER_COMPONENT[name] - baseColor[name], result = baseColor[name] + dif * value) : result = baseColor[name] * (1 + value);
        return baseColor[name] = result;
      });
    }
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:sass_change_color', "change-color" + ps + "(" + notQuote + ")" + pe, 1, ['*'], function(match, expression, context) {
    var baseColor, param, params, res, subexpr, subject, _, _i, _len;
    _ = match[0], subexpr = match[1];
    res = context.split(subexpr);
    subject = res[0];
    params = res.slice(1);
    baseColor = context.readColor(subject);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    for (_i = 0, _len = params.length; _i < _len; _i++) {
      param = params[_i];
      context.readParam(param, function(name, value) {
        return baseColor[name] = context.readFloat(value);
      });
    }
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:stylus_blend', strip("blend" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return this.rgba = [baseColor1.red * baseColor1.alpha + baseColor2.red * (1 - baseColor1.alpha), baseColor1.green * baseColor1.alpha + baseColor2.green * (1 - baseColor1.alpha), baseColor1.blue * baseColor1.alpha + baseColor2.blue * (1 - baseColor1.alpha), baseColor1.alpha + baseColor2.alpha - baseColor1.alpha * baseColor2.alpha];
  });

  registry.createExpression('pigments:lua_rgba', strip("(?:" + namePrefixes + ")Color" + ps + "\\s* (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + pe), ['lua'], function(match, expression, context) {
    var a, b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readInt(r);
    this.green = context.readInt(g);
    this.blue = context.readInt(b);
    return this.alpha = context.readInt(a) / 255;
  });

  registry.createExpression('pigments:multiply', strip("multiply" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.MULTIPLY), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:screen', strip("screen" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.SCREEN), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:overlay', strip("overlay" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.OVERLAY), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:softlight', strip("softlight" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.SOFT_LIGHT), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:hardlight', strip("hardlight" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.HARD_LIGHT), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:difference', strip("difference" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.DIFFERENCE), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:exclusion', strip("exclusion" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.EXCLUSION), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:average', strip("average" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.AVERAGE), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:negation', strip("negation" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.NEGATION), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:elm_rgba', strip("rgba\\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var a, b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readInt(r);
    this.green = context.readInt(g);
    this.blue = context.readInt(b);
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:elm_rgb', strip("rgb\\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    this.red = context.readInt(r);
    this.green = context.readInt(g);
    return this.blue = context.readInt(b);
  });

  elmAngle = "(?:" + float + "|\\(degrees\\s+(?:" + int + "|" + variables + ")\\))";

  registry.createExpression('pigments:elm_hsl', strip("hsl\\s+ (" + elmAngle + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var elmDegreesRegexp, h, hsl, l, m, s, _;
    elmDegreesRegexp = new RegExp("\\(degrees\\s+(" + context.int + "|" + context.variablesRE + ")\\)");
    _ = match[0], h = match[1], s = match[2], l = match[3];
    if (m = elmDegreesRegexp.exec(h)) {
      h = context.readInt(m[1]);
    } else {
      h = context.readFloat(h) * 180 / Math.PI;
    }
    hsl = [h, context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:elm_hsla', strip("hsla\\s+ (" + elmAngle + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var a, elmDegreesRegexp, h, hsl, l, m, s, _;
    elmDegreesRegexp = new RegExp("\\(degrees\\s+(" + context.int + "|" + context.variablesRE + ")\\)");
    _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
    if (m = elmDegreesRegexp.exec(h)) {
      h = context.readInt(m[1]);
    } else {
      h = context.readFloat(h) * 180 / Math.PI;
    }
    hsl = [h, context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:elm_grayscale', "gr(?:a|e)yscale\\s+(" + float + "|" + variables + ")", ['elm'], function(match, expression, context) {
    var amount, _;
    _ = match[0], amount = match[1];
    amount = Math.floor(255 - context.readFloat(amount) * 255);
    return this.rgb = [amount, amount, amount];
  });

  registry.createExpression('pigments:elm_complement', strip("complement\\s+(" + notQuote + ")"), ['elm'], function(match, expression, context) {
    var baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [(h + 180) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:latex_gray', strip("\\[gray\\]\\{(" + float + ")\\}"), ['tex'], function(match, expression, context) {
    var amount, _;
    _ = match[0], amount = match[1];
    amount = context.readFloat(amount) * 255;
    return this.rgb = [amount, amount, amount];
  });

  registry.createExpression('pigments:latex_html', strip("\\[HTML\\]\\{(" + hexadecimal + "{6})\\}"), ['tex'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hex = hexa;
  });

  registry.createExpression('pigments:latex_rgb', strip("\\[rgb\\]\\{(" + float + ")" + comma + "(" + float + ")" + comma + "(" + float + ")\\}"), ['tex'], function(match, expression, context) {
    var b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    r = Math.floor(context.readFloat(r) * 255);
    g = Math.floor(context.readFloat(g) * 255);
    b = Math.floor(context.readFloat(b) * 255);
    return this.rgb = [r, g, b];
  });

  registry.createExpression('pigments:latex_RGB', strip("\\[RGB\\]\\{(" + int + ")" + comma + "(" + int + ")" + comma + "(" + int + ")\\}"), ['tex'], function(match, expression, context) {
    var b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    r = context.readInt(r);
    g = context.readInt(g);
    b = context.readInt(b);
    return this.rgb = [r, g, b];
  });

  registry.createExpression('pigments:latex_cmyk', strip("\\[cmyk\\]\\{(" + float + ")" + comma + "(" + float + ")" + comma + "(" + float + ")" + comma + "(" + float + ")\\}"), ['tex'], function(match, expression, context) {
    var c, k, m, y, _;
    _ = match[0], c = match[1], m = match[2], y = match[3], k = match[4];
    c = context.readFloat(c);
    m = context.readFloat(m);
    y = context.readFloat(y);
    k = context.readFloat(k);
    return this.cmyk = [c, m, y, k];
  });

  registry.createExpression('pigments:latex_predefined', strip('\\{(black|blue|brown|cyan|darkgray|gray|green|lightgray|lime|magenta|olive|orange|pink|purple|red|teal|violet|white|yellow)\\}'), ['tex'], function(match, expression, context) {
    var name, _;
    _ = match[0], name = match[1];
    return this.hex = context.SVGColors.allCases[name].replace('#', '');
  });

  registry.createExpression('pigments:latex_predefined_dvipnames', strip('\\{(Apricot|Aquamarine|Bittersweet|Black|Blue|BlueGreen|BlueViolet|BrickRed|Brown|BurntOrange|CadetBlue|CarnationPink|Cerulean|CornflowerBlue|Cyan|Dandelion|DarkOrchid|Emerald|ForestGreen|Fuchsia|Goldenrod|Gray|Green|GreenYellow|JungleGreen|Lavender|LimeGreen|Magenta|Mahogany|Maroon|Melon|MidnightBlue|Mulberry|NavyBlue|OliveGreen|Orange|OrangeRed|Orchid|Peach|Periwinkle|PineGreen|Plum|ProcessBlue|Purple|RawSienna|Red|RedOrange|RedViolet|Rhodamine|RoyalBlue|RoyalPurple|RubineRed|Salmon|SeaGreen|Sepia|SkyBlue|SpringGreen|Tan|TealBlue|Thistle|Turquoise|Violet|VioletRed|White|WildStrawberry|Yellow|YellowGreen|YellowOrange)\\}'), ['tex'], function(match, expression, context) {
    var name, _;
    _ = match[0], name = match[1];
    return this.hex = context.DVIPnames[name].replace('#', '');
  });

  registry.createExpression('pigments:latex_mix', strip('\\{([^!\\n\\}]+[!][^\\}\\n]+)\\}'), ['tex'], function(match, expression, context) {
    var expr, mix, nextColor, op, triplet, _;
    _ = match[0], expr = match[1];
    op = expr.split('!');
    mix = function(_arg) {
      var a, b, colorA, colorB, p;
      a = _arg[0], p = _arg[1], b = _arg[2];
      colorA = a instanceof context.Color ? a : context.readColor("{" + a + "}");
      colorB = b instanceof context.Color ? b : context.readColor("{" + b + "}");
      percent = context.readInt(p);
      return context.mixColors(colorA, colorB, percent / 100);
    };
    if (op.length === 2) {
      op.push(new context.Color(255, 255, 255));
    }
    nextColor = null;
    while (op.length > 0) {
      triplet = op.splice(0, 3);
      nextColor = mix(triplet);
      if (op.length > 0) {
        op.unshift(nextColor);
      }
    }
    return this.rgb = nextColor.rgb;
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLWV4cHJlc3Npb25zLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0UEFBQTs7QUFBQSxFQUFBLE9BY0ksT0FBQSxDQUFRLFdBQVIsQ0FkSixFQUNFLFdBQUEsR0FERixFQUVFLGFBQUEsS0FGRixFQUdFLGVBQUEsT0FIRixFQUlFLHVCQUFBLGVBSkYsRUFLRSxvQkFBQSxZQUxGLEVBTUUsc0JBQUEsY0FORixFQU9FLGFBQUEsS0FQRixFQVFFLGdCQUFBLFFBUkYsRUFTRSxtQkFBQSxXQVRGLEVBVUUsVUFBQSxFQVZGLEVBV0UsVUFBQSxFQVhGLEVBWUUsaUJBQUEsU0FaRixFQWFFLG9CQUFBLFlBYkYsQ0FBQTs7QUFBQSxFQWdCQSxRQUF1QixPQUFBLENBQVEsU0FBUixDQUF2QixFQUFDLGNBQUEsS0FBRCxFQUFRLG9CQUFBLFdBaEJSLENBQUE7O0FBQUEsRUFrQkEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHdCQUFSLENBbEJ0QixDQUFBOztBQUFBLEVBbUJBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSLENBbkJsQixDQUFBOztBQUFBLEVBb0JBLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUixDQXBCWixDQUFBOztBQUFBLEVBc0JBLE1BQU0sQ0FBQyxPQUFQLEdBQ0EsUUFBQSxHQUFlLElBQUEsbUJBQUEsQ0FBb0IsZUFBcEIsQ0F2QmYsQ0FBQTs7QUFBQSxFQWtDQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIscUJBQTFCLEVBQWtELElBQUEsR0FBSSxXQUFKLEdBQWdCLG1CQUFsRSxFQUFzRixDQUF0RixFQUF5RixDQUFDLEtBQUQsRUFBUSxNQUFSLEVBQWdCLE1BQWhCLEVBQXdCLFFBQXhCLEVBQWtDLE1BQWxD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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-expressions.coffee
