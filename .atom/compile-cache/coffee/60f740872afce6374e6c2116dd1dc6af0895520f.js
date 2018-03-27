(function() {
  var event, mouseEvent, objectCenterCoordinates;

  event = function(type, properties) {
    if (properties == null) {
      properties = {};
    }
    return new Event(type, properties);
  };

  mouseEvent = function(type, properties) {
    var defaults, k, v;
    defaults = {
      bubbles: true,
      cancelable: type !== "mousemove",
      view: window,
      detail: 0,
      pageX: 0,
      pageY: 0,
      clientX: 0,
      clientY: 0,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      button: 0,
      relatedTarget: void 0
    };
    for (k in defaults) {
      v = defaults[k];
      if (properties[k] == null) {
        properties[k] = v;
      }
    }
    return new MouseEvent(type, properties);
  };

  objectCenterCoordinates = function(target) {
    var height, left, top, width, _ref;
    _ref = target.getBoundingClientRect(), top = _ref.top, left = _ref.left, width = _ref.width, height = _ref.height;
    return {
      x: left + width / 2,
      y: top + height / 2
    };
  };

  module.exports = {
    objectCenterCoordinates: objectCenterCoordinates,
    mouseEvent: mouseEvent,
    event: event
  };

  ['mousedown', 'mousemove', 'mouseup', 'click'].forEach(function(key) {
    return module.exports[key] = function(target, x, y, cx, cy, btn) {
      var _ref;
      if (!((x != null) && (y != null))) {
        _ref = objectCenterCoordinates(target), x = _ref.x, y = _ref.y;
      }
      if (!((cx != null) && (cy != null))) {
        cx = x;
        cy = y;
      }
      return target.dispatchEvent(mouseEvent(key, {
        target: target,
        pageX: x,
        pageY: y,
        clientX: cx,
        clientY: cy,
        button: btn
      }));
    };
  });

  module.exports.mousewheel = function(target, deltaX, deltaY) {
    if (deltaX == null) {
      deltaX = 0;
    }
    if (deltaY == null) {
      deltaY = 0;
    }
    return target.dispatchEvent(mouseEvent('mousewheel', {
      target: target,
      deltaX: deltaX,
      deltaY: deltaY
    }));
  };

  module.exports.change = function(target) {
    return target.dispatchEvent(event('change', {
      target: target
    }));
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9oZWxwZXJzL2V2ZW50cy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMENBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sVUFBUCxHQUFBOztNQUFPLGFBQVc7S0FBTztXQUFJLElBQUEsS0FBQSxDQUFNLElBQU4sRUFBWSxVQUFaLEVBQTdCO0VBQUEsQ0FBUixDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFhLFNBQUMsSUFBRCxFQUFPLFVBQVAsR0FBQTtBQUNYLFFBQUEsY0FBQTtBQUFBLElBQUEsUUFBQSxHQUFXO0FBQUEsTUFDVCxPQUFBLEVBQVMsSUFEQTtBQUFBLE1BRVQsVUFBQSxFQUFhLElBQUEsS0FBVSxXQUZkO0FBQUEsTUFHVCxJQUFBLEVBQU0sTUFIRztBQUFBLE1BSVQsTUFBQSxFQUFRLENBSkM7QUFBQSxNQUtULEtBQUEsRUFBTyxDQUxFO0FBQUEsTUFNVCxLQUFBLEVBQU8sQ0FORTtBQUFBLE1BT1QsT0FBQSxFQUFTLENBUEE7QUFBQSxNQVFULE9BQUEsRUFBUyxDQVJBO0FBQUEsTUFTVCxPQUFBLEVBQVMsS0FUQTtBQUFBLE1BVVQsTUFBQSxFQUFRLEtBVkM7QUFBQSxNQVdULFFBQUEsRUFBVSxLQVhEO0FBQUEsTUFZVCxPQUFBLEVBQVMsS0FaQTtBQUFBLE1BYVQsTUFBQSxFQUFRLENBYkM7QUFBQSxNQWNULGFBQUEsRUFBZSxNQWROO0tBQVgsQ0FBQTtBQWlCQSxTQUFBLGFBQUE7c0JBQUE7VUFBK0M7QUFBL0MsUUFBQSxVQUFXLENBQUEsQ0FBQSxDQUFYLEdBQWdCLENBQWhCO09BQUE7QUFBQSxLQWpCQTtXQW1CSSxJQUFBLFVBQUEsQ0FBVyxJQUFYLEVBQWlCLFVBQWpCLEVB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/spec/helpers/events.coffee
