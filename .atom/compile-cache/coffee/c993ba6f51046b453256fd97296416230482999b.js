(function() {
  var GlobalVimState, StatusBarManager, VimMode, VimState, dispatchKeyboardEvent, dispatchTextEvent, getEditorElement, globalVimState, keydown, mockPlatform, statusBarManager, unmockPlatform, _ref,
    __slice = [].slice;

  VimState = require('../lib/vim-state');

  GlobalVimState = require('../lib/global-vim-state');

  VimMode = require('../lib/vim-mode');

  StatusBarManager = require('../lib/status-bar-manager');

  _ref = [], globalVimState = _ref[0], statusBarManager = _ref[1];

  beforeEach(function() {
    atom.workspace || (atom.workspace = {});
    statusBarManager = null;
    globalVimState = null;
    return spyOn(atom, 'beep');
  });

  getEditorElement = function(callback) {
    var textEditor;
    textEditor = null;
    waitsForPromise(function() {
      return atom.workspace.open().then(function(e) {
        return textEditor = e;
      });
    });
    return runs(function() {
      var element;
      element = atom.views.getView(textEditor);
      element.setUpdatedSynchronously(true);
      element.classList.add('vim-mode');
      if (statusBarManager == null) {
        statusBarManager = new StatusBarManager;
      }
      if (globalVimState == null) {
        globalVimState = new GlobalVimState;
      }
      element.vimState = new VimState(element, statusBarManager, globalVimState);
      element.addEventListener("keydown", function(e) {
        return atom.keymaps.handleKeyboardEvent(e);
      });
      document.createElement("html").appendChild(element);
      return callback(element);
    });
  };

  mockPlatform = function(editorElement, platform) {
    var wrapper;
    wrapper = document.createElement('div');
    wrapper.className = platform;
    return wrapper.appendChild(editorElement);
  };

  unmockPlatform = function(editorElement) {
    return editorElement.parentNode.removeChild(editorElement);
  };

  dispatchKeyboardEvent = function() {
    var e, eventArgs, target;
    target = arguments[0], eventArgs = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    e = document.createEvent('KeyboardEvent');
    e.initKeyboardEvent.apply(e, eventArgs);
    if (e.keyCode === 0) {
      Object.defineProperty(e, 'keyCode', {
        get: function() {
          return void 0;
        }
      });
    }
    return target.dispatchEvent(e);
  };

  dispatchTextEvent = function() {
    var e, eventArgs, target;
    target = arguments[0], eventArgs = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    e = document.createEvent('TextEvent');
    e.initTextEvent.apply(e, eventArgs);
    return target.dispatchEvent(e);
  };

  keydown = function(key, _arg) {
    var alt, canceled, ctrl, element, eventArgs, meta, raw, shift, _ref1;
    _ref1 = _arg != null ? _arg : {}, element = _ref1.element, ctrl = _ref1.ctrl, shift = _ref1.shift, alt = _ref1.alt, meta = _ref1.meta, raw = _ref1.raw;
    if (!(key === 'escape' || (raw != null))) {
      key = "U+" + (key.charCodeAt(0).toString(16));
    }
    element || (element = document.activeElement);
    eventArgs = [false, true, null, key, 0, ctrl, alt, shift, meta];
    canceled = !dispatchKeyboardEvent.apply(null, [element, 'keydown'].concat(__slice.call(eventArgs)));
    dispatchKeyboardEvent.apply(null, [element, 'keypress'].concat(__slice.call(eventArgs)));
    if (!canceled) {
      if (dispatchTextEvent.apply(null, [element, 'textInput'].concat(__slice.call(eventArgs)))) {
        element.value += key;
      }
    }
    return dispatchKeyboardEvent.apply(null, [element, 'keyup'].concat(__slice.call(eventArgs)));
  };

  module.exports = {
    keydown: keydown,
    getEditorElement: getEditorElement,
    mockPlatform: mockPlatform,
    unmockPlatform: unmockPlatform
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvc3BlYy9zcGVjLWhlbHBlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOExBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsa0JBQVIsQ0FBWCxDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFpQixPQUFBLENBQVEseUJBQVIsQ0FEakIsQ0FBQTs7QUFBQSxFQUVBLE9BQUEsR0FBVyxPQUFBLENBQVEsaUJBQVIsQ0FGWCxDQUFBOztBQUFBLEVBR0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLDJCQUFSLENBSG5CLENBQUE7O0FBQUEsRUFLQSxPQUFxQyxFQUFyQyxFQUFDLHdCQUFELEVBQWlCLDBCQUxqQixDQUFBOztBQUFBLEVBT0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULElBQUEsSUFBSSxDQUFDLGNBQUwsSUFBSSxDQUFDLFlBQWMsR0FBbkIsQ0FBQTtBQUFBLElBQ0EsZ0JBQUEsR0FBbUIsSUFEbkIsQ0FBQTtBQUFBLElBRUEsY0FBQSxHQUFpQixJQUZqQixDQUFBO1dBR0EsS0FBQSxDQUFNLElBQU4sRUFBWSxNQUFaLEVBSlM7RUFBQSxDQUFYLENBUEEsQ0FBQTs7QUFBQSxFQWFBLGdCQUFBLEdBQW1CLFNBQUMsUUFBRCxHQUFBO0FBQ2pCLFFBQUEsVUFBQTtBQUFBLElBQUEsVUFBQSxHQUFhLElBQWIsQ0FBQTtBQUFBLElBRUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7YUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBQSxDQUFxQixDQUFDLElBQXRCLENBQTJCLFNBQUMsQ0FBRCxHQUFBO2VBQ3pCLFVBQUEsR0FBYSxFQURZO01BQUEsQ0FBM0IsRUFEYztJQUFBLENBQWhCLENBRkEs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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/spec/spec-helper.coffee
