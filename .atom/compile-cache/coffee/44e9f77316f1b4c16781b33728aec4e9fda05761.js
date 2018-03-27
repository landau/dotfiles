(function() {
  var Input, REGISTERS, RegisterManager,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Input = require('./input');

  REGISTERS = /(?:[a-zA-Z*+%_".])/;

  module.exports = RegisterManager = (function() {
    function RegisterManager(vimState) {
      var ref;
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement;
      this.data = this.vimState.globalState.get('register');
      this.subscriptionBySelection = new Map;
      this.clipboardBySelection = new Map;
      this.vimState.onDidDestroy(this.destroy);
    }

    RegisterManager.prototype.reset = function() {
      this.name = null;
      return this.editorElement.classList.toggle('with-register', false);
    };

    RegisterManager.prototype.destroy = function() {
      var ref;
      this.subscriptionBySelection.forEach(function(disposable) {
        return disposable.dispose();
      });
      this.subscriptionBySelection.clear();
      this.clipboardBySelection.clear();
      return ref = {}, this.subscriptionBySelection = ref.subscriptionBySelection, this.clipboardBySelection = ref.clipboardBySelection, ref;
    };

    RegisterManager.prototype.isValidName = function(name) {
      return REGISTERS.test(name);
    };

    RegisterManager.prototype.getText = function(name, selection) {
      var ref, ref1;
      return (ref = (ref1 = this.get(name, selection)) != null ? ref1.text : void 0) != null ? ref : '';
    };

    RegisterManager.prototype.readClipboard = function(selection) {
      if (selection == null) {
        selection = null;
      }
      if ((selection != null ? selection.editor.hasMultipleCursors() : void 0) && this.clipboardBySelection.has(selection)) {
        return this.clipboardBySelection.get(selection);
      } else {
        return atom.clipboard.read();
      }
    };

    RegisterManager.prototype.writeClipboard = function(selection, text) {
      var disposable;
      if (selection == null) {
        selection = null;
      }
      if ((selection != null ? selection.editor.hasMultipleCursors() : void 0) && !this.clipboardBySelection.has(selection)) {
        disposable = selection.onDidDestroy((function(_this) {
          return function() {
            _this.subscriptionBySelection["delete"](selection);
            return _this.clipboardBySelection["delete"](selection);
          };
        })(this));
        this.subscriptionBySelection.set(selection, disposable);
      }
      if ((selection === null) || selection.isLastSelection()) {
        atom.clipboard.write(text);
      }
      if (selection != null) {
        return this.clipboardBySelection.set(selection, text);
      }
    };

    RegisterManager.prototype.getRegisterNameToUse = function(name) {
      var ref;
      if ((name != null) && !this.isValidName(name)) {
        return null;
      }
      if (name == null) {
        name = (ref = this.name) != null ? ref : '"';
      }
      if (name === '"' && this.vimState.getConfig('useClipboardAsDefaultRegister')) {
        return '*';
      } else {
        return name;
      }
    };

    RegisterManager.prototype.get = function(name, selection) {
      var ref, ref1, text, type;
      name = this.getRegisterNameToUse(name);
      if (name == null) {
        return;
      }
      switch (name) {
        case '*':
        case '+':
          text = this.readClipboard(selection);
          break;
        case '%':
          text = this.editor.getURI();
          break;
        case '_':
          text = '';
          break;
        default:
          ref1 = (ref = this.data[name.toLowerCase()]) != null ? ref : {}, text = ref1.text, type = ref1.type;
      }
      if (type == null) {
        type = this.getCopyType(text != null ? text : '');
      }
      return {
        text: text,
        type: type
      };
    };

    RegisterManager.prototype.set = function(name, value) {
      var selection;
      name = this.getRegisterNameToUse(name);
      if (name == null) {
        return;
      }
      if (value.type == null) {
        value.type = this.getCopyType(value.text);
      }
      selection = value.selection;
      delete value.selection;
      switch (name) {
        case '*':
        case '+':
          return this.writeClipboard(selection, value.text);
        case '_':
        case '%':
          return null;
        default:
          if (/^[A-Z]$/.test(name)) {
            name = name.toLowerCase();
            if (this.data[name] != null) {
              return this.append(name, value);
            } else {
              return this.data[name] = value;
            }
          } else {
            return this.data[name] = value;
          }
      }
    };

    RegisterManager.prototype.append = function(name, value) {
      var register;
      register = this.data[name];
      if ('linewise' === register.type || 'linewise' === value.type) {
        if (register.type !== 'linewise') {
          register.type = 'linewise';
          register.text += '\n';
        }
        if (value.type !== 'linewise') {
          value.text += '\n';
        }
      }
      return register.text += value.text;
    };

    RegisterManager.prototype.setName = function(name) {
      var inputUI;
      if (name != null) {
        this.name = name;
        this.editorElement.classList.toggle('with-register', true);
        return this.vimState.hover.set('"' + this.name);
      } else {
        inputUI = new Input(this.vimState);
        inputUI.onDidConfirm((function(_this) {
          return function(name) {
            if (_this.isValidName(name)) {
              return _this.setName(name);
            } else {
              return _this.vimState.hover.reset();
            }
          };
        })(this));
        inputUI.onDidCancel((function(_this) {
          return function() {
            return _this.vimState.hover.reset();
          };
        })(this));
        this.vimState.hover.set('"');
        return inputUI.focus(1);
      }
    };

    RegisterManager.prototype.getCopyType = function(text) {
      if (text.endsWith("\n") || text.endsWith("\r")) {
        return 'linewise';
      } else {
        return 'characterwise';
      }
    };

    return RegisterManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvcmVnaXN0ZXItbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGlDQUFBO0lBQUE7O0VBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztFQUVSLFNBQUEsR0FBWTs7RUFpQlosTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHlCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7O01BQ1osTUFBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGFBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxvQkFBQTtNQUNYLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBdEIsQ0FBMEIsVUFBMUI7TUFDUixJQUFDLENBQUEsdUJBQUQsR0FBMkIsSUFBSTtNQUMvQixJQUFDLENBQUEsb0JBQUQsR0FBd0IsSUFBSTtNQUU1QixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQXhCO0lBTlc7OzhCQVFiLEtBQUEsR0FBTyxTQUFBO01BQ0wsSUFBQyxDQUFBLElBQUQsR0FBUTthQUNSLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLGVBQWhDLEVBQWlELEtBQWpEO0lBRks7OzhCQUlQLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUMsQ0FBQSx1QkFBdUIsQ0FBQyxPQUF6QixDQUFpQyxTQUFDLFVBQUQ7ZUFDL0IsVUFBVSxDQUFDLE9BQVgsQ0FBQTtNQUQrQixDQUFqQztNQUVBLElBQUMsQ0FBQSx1QkFBdUIsQ0FBQyxLQUF6QixDQUFBO01BQ0EsSUFBQyxDQUFBLG9CQUFvQixDQUFDLEtBQXRCLENBQUE7YUFDQSxNQUFvRCxFQUFwRCxFQUFDLElB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QUEsTUFBQTtlQUdFLGdCQUhGOztJQURXOzs7OztBQTlJZiIsInNvdXJjZXNDb250ZW50IjpbIklucHV0ID0gcmVxdWlyZSAnLi9pbnB1dCdcblxuUkVHSVNURVJTID0gLy8vIChcbiAgPzogW2EtekEtWiorJV9cIi5dXG4pIC8vL1xuXG4jIFRPRE86IFZpbSBzdXBwb3J0IGZvbGxvd2luZyByZWdpc3RlcnMuXG4jIHg6IGNvbXBsZXRlLCAtOiBwYXJ0aWFsbHlcbiMgIFt4XSAxLiBUaGUgdW5uYW1lZCByZWdpc3RlciBcIlwiXG4jICBbIF0gMi4gMTAgbnVtYmVyZWQgcmVnaXN0ZXJzIFwiMCB0byBcIjlcbiMgIFsgXSAzLiBUaGUgc21hbGwgZGVsZXRlIHJlZ2lzdGVyIFwiLVxuIyAgW3hdIDQuIDI2IG5hbWVkIHJlZ2lzdGVycyBcImEgdG8gXCJ6IG9yIFwiQSB0byBcIlpcbiMgIFstXSA1LiB0aHJlZSByZWFkLW9ubHkgcmVnaXN0ZXJzIFwiOiwgXCIuLCBcIiVcbiMgIFsgXSA2LiBhbHRlcm5hdGUgYnVmZmVyIHJlZ2lzdGVyIFwiI1xuIyAgWyBdIDcuIHRoZSBleHByZXNzaW9uIHJlZ2lzdGVyIFwiPVxuIyAgWyBdIDguIFRoZSBzZWxlY3Rpb24gYW5kIGRyb3AgcmVnaXN0ZXJzIFwiKiwgXCIrIGFuZCBcIn5cbiMgIFt4XSA5LiBUaGUgYmxhY2sgaG9sZSByZWdpc3RlciBcIl9cbiMgIFsgXSAxMC4gTGFzdCBzZWFyY2ggcGF0dGVybiByZWdpc3RlciBcIi9cblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUmVnaXN0ZXJNYW5hZ2VyXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAZGF0YSA9IEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoJ3JlZ2lzdGVyJylcbiAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24gPSBuZXcgTWFwXG4gICAgQGNsaXBib2FyZEJ5U2VsZWN0aW9uID0gbmV3IE1hcFxuXG4gICAgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveSlcblxuICByZXNldDogLT5cbiAgICBAbmFtZSA9IG51bGxcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCd3aXRoLXJlZ2lzdGVyJywgZmFsc2UpXG5cbiAgZGVzdHJveTogPT5cbiAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uZm9yRWFjaCAoZGlzcG9zYWJsZSkgLT5cbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLmNsZWFyKClcbiAgICBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uY2xlYXIoKVxuICAgIHtAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24sIEBjbGlwYm9hcmRCeVNlbGVjdGlvbn0gPSB7fVxuXG4gIGlzVmFsaWROYW1lOiAobmFtZSkgLT5cbiAgICBSRUdJU1RFUlMudGVzdChuYW1lKVxuXG4gIGdldFRleHQ6IChuYW1lLCBzZWxlY3Rpb24pIC0+XG4gICAgQGdldChuYW1lLCBzZWxlY3Rpb24pPy50ZXh0ID8gJydcblxuICByZWFkQ2xpcGJvYXJkOiAoc2VsZWN0aW9uPW51bGwpIC0+XG4gICAgaWYgc2VsZWN0aW9uPy5lZGl0b3IuaGFzTXVsdGlwbGVDdXJzb3JzKCkgYW5kIEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKVxuICAgICAgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gICAgZWxzZVxuICAgICAgYXRvbS5jbGlwYm9hcmQucmVhZCgpXG5cbiAgd3JpdGVDbGlwYm9hcmQ6IChzZWxlY3Rpb249bnVsbCwgdGV4dCkgLT5cbiAgICBpZiBzZWxlY3Rpb24/LmVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKSBhbmQgbm90IEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKVxuICAgICAgZGlzcG9zYWJsZSA9IHNlbGVjdGlvbi5vbkRpZERlc3Ryb3kgPT5cbiAgICAgICAgQHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLmRlbGV0ZShzZWxlY3Rpb24pXG4gICAgICAgIEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5kZWxldGUoc2VsZWN0aW9uKVxuICAgICAgQHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIGRpc3Bvc2FibGUpXG5cbiAgICBpZiAoc2VsZWN0aW9uIGlzIG51bGwpIG9yIHNlbGVjdGlvbi5pc0xhc3RTZWxlY3Rpb24oKVxuICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUodGV4dClcbiAgICBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgdGV4dCkgaWYgc2VsZWN0aW9uP1xuXG4gIGdldFJlZ2lzdGVyTmFtZVRvVXNlOiAobmFtZSkgLT5cbiAgICBpZiBuYW1lPyBhbmQgbm90IEBpc1ZhbGlkTmFtZShuYW1lKVxuICAgICAgcmV0dXJuIG51bGxcblxuICAgIG5hbWUgPz0gQG5hbWUgPyAnXCInXG4gICAgaWYgbmFtZSBpcyAnXCInIGFuZCBAdmltU3RhdGUuZ2V0Q29uZmlnKCd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicpXG4gICAgICAnKidcbiAgICBlbHNlXG4gICAgICBuYW1lXG5cbiAgZ2V0OiAobmFtZSwgc2VsZWN0aW9uKSAtPlxuICAgIG5hbWUgPSBAZ2V0UmVnaXN0ZXJOYW1lVG9Vc2UobmFtZSlcbiAgICByZXR1cm4gdW5sZXNzIG5hbWU/XG5cbiAgICBzd2l0Y2ggbmFtZVxuICAgICAgd2hlbiAnKicsICcrJyB0aGVuIHRleHQgPSBAcmVhZENsaXBib2FyZChzZWxlY3Rpb24pXG4gICAgICB3aGVuICclJyB0aGVuIHRleHQgPSBAZWRpdG9yLmdldFVSSSgpXG4gICAgICB3aGVuICdfJyB0aGVuIHRleHQgPSAnJyAjIEJsYWNraG9sZSBhbHdheXMgcmV0dXJucyBub3RoaW5nXG4gICAgICBlbHNlXG4gICAgICAgIHt0ZXh0LCB0eXBlfSA9IEBkYXRhW25hbWUudG9Mb3dlckNhc2UoKV0gPyB7fVxuICAgIHR5cGUgPz0gQGdldENvcHlUeXBlKHRleHQgPyAnJylcbiAgICB7dGV4dCwgdHlwZX1cblxuICAjIFByaXZhdGU6IFNldHMgdGhlIHZhbHVlIG9mIGEgZ2l2ZW4gcmVnaXN0ZXIuXG4gICNcbiAgIyBuYW1lICAtIFRoZSBuYW1lIG9mIHRoZSByZWdpc3RlciB0byBmZXRjaC5cbiAgIyB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBzZXQgdGhlIHJlZ2lzdGVyIHRvLCB3aXRoIGZvbGxvd2luZyBwcm9wZXJ0aWVzLlxuICAjICB0ZXh0OiB0ZXh0IHRvIHNhdmUgdG8gcmVnaXN0ZXIuXG4gICMgIHR5cGU6IChvcHRpb25hbCkgaWYgb21taXRlZCBhdXRvbWF0aWNhbGx5IHNldCBmcm9tIHRleHQuXG4gICNcbiAgIyBSZXR1cm5zIG5vdGhpbmcuXG4gIHNldDogKG5hbWUsIHZhbHVlKSAtPlxuICAgIG5hbWUgPSBAZ2V0UmVnaXN0ZXJOYW1lVG9Vc2UobmFtZSlcbiAgICByZXR1cm4gdW5sZXNzIG5hbWU/XG5cbiAgICB2YWx1ZS50eXBlID89IEBnZXRDb3B5VHlwZSh2YWx1ZS50ZXh0KVxuXG4gICAgc2VsZWN0aW9uID0gdmFsdWUuc2VsZWN0aW9uXG4gICAgZGVsZXRlIHZhbHVlLnNlbGVjdGlvblxuXG4gICAgc3dpdGNoIG5hbWVcbiAgICAgIHdoZW4gJyonLCAnKycgdGhlbiBAd3JpdGVDbGlwYm9hcmQoc2VsZWN0aW9uLCB2YWx1ZS50ZXh0KVxuICAgICAgd2hlbiAnXycsICclJyB0aGVuIG51bGxcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgL15bQS1aXSQvLnRlc3QobmFtZSlcbiAgICAgICAgICBuYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgaWYgQGRhdGFbbmFtZV0/XG4gICAgICAgICAgICBAYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBkYXRhW25hbWVdID0gdmFsdWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBkYXRhW25hbWVdID0gdmFsdWVcblxuICBhcHBlbmQ6IChuYW1lLCB2YWx1ZSkgLT5cbiAgICByZWdpc3RlciA9IEBkYXRhW25hbWVdXG4gICAgaWYgJ2xpbmV3aXNlJyBpbiBbcmVnaXN0ZXIudHlwZSwgdmFsdWUudHlwZV1cbiAgICAgIGlmIHJlZ2lzdGVyLnR5cGUgaXNudCAnbGluZXdpc2UnXG4gICAgICAgIHJlZ2lzdGVyLnR5cGUgPSAnbGluZXdpc2UnXG4gICAgICAgIHJlZ2lzdGVyLnRleHQgKz0gJ1xcbidcbiAgICAgIGlmIHZhbHVlLnR5cGUgaXNudCAnbGluZXdpc2UnXG4gICAgICAgIHZhbHVlLnRleHQgKz0gJ1xcbidcbiAgICByZWdpc3Rlci50ZXh0ICs9IHZhbHVlLnRleHRcblxuICBzZXROYW1lOiAobmFtZSkgLT5cbiAgICBpZiBuYW1lP1xuICAgICAgQG5hbWUgPSBuYW1lXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCd3aXRoLXJlZ2lzdGVyJywgdHJ1ZSlcbiAgICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoJ1wiJyArIEBuYW1lKVxuICAgIGVsc2VcbiAgICAgIGlucHV0VUkgPSBuZXcgSW5wdXQoQHZpbVN0YXRlKVxuICAgICAgaW5wdXRVSS5vbkRpZENvbmZpcm0gKG5hbWUpID0+XG4gICAgICAgIGlmIEBpc1ZhbGlkTmFtZShuYW1lKVxuICAgICAgICAgIEBzZXROYW1lKG5hbWUpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdmltU3RhdGUuaG92ZXIucmVzZXQoKVxuICAgICAgaW5wdXRVSS5vbkRpZENhbmNlbCA9PiBAdmltU3RhdGUuaG92ZXIucmVzZXQoKVxuICAgICAgQHZpbVN0YXRlLmhvdmVyLnNldCgnXCInKVxuICAgICAgaW5wdXRVSS5mb2N1cygxKVxuXG4gIGdldENvcHlUeXBlOiAodGV4dCkgLT5cbiAgICBpZiB0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpIG9yIHRleHQuZW5kc1dpdGgoXCJcXHJcIilcbiAgICAgICdsaW5ld2lzZSdcbiAgICBlbHNlXG4gICAgICAnY2hhcmFjdGVyd2lzZSdcbiJdfQ==
