(function() {
  var CompositeDisposable, Input, REGISTERS, RegisterManager,
    slice = [].slice;

  CompositeDisposable = require('atom').CompositeDisposable;

  Input = require('./input');

  REGISTERS = /(?:[a-zA-Z*+%_".])/;

  RegisterManager = (function() {
    function RegisterManager(vimState) {
      var ref;
      this.vimState = vimState;
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement, this.globalState = ref.globalState;
      this.data = this.globalState.get('register');
      this.subscriptionBySelection = new Map;
      this.clipboardBySelection = new Map;
    }

    RegisterManager.prototype.reset = function() {
      this.name = null;
      return this.vimState.toggleClassList('with-register', this.hasName());
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
      var ref;
      return (ref = this.get(name, selection).text) != null ? ref : '';
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

    RegisterManager.prototype.get = function(name, selection) {
      var ref, ref1, text, type;
      if (name == null) {
        name = this.getName();
      }
      if (name === '"') {
        name = this.vimState.getConfig('defaultRegister');
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

    RegisterManager.prototype.set = function() {
      var args, name, ref, selection, value;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      ref = [], name = ref[0], value = ref[1];
      switch (args.length) {
        case 1:
          value = args[0];
          break;
        case 2:
          name = args[0], value = args[1];
      }
      if (name == null) {
        name = this.getName();
      }
      if (!this.isValidName(name)) {
        return;
      }
      if (name === '"') {
        name = this.vimState.getConfig('defaultRegister');
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
            return this.append(name.toLowerCase(), value);
          } else {
            return this.data[name] = value;
          }
      }
    };

    RegisterManager.prototype.append = function(name, value) {
      var register;
      if (!(register = this.data[name])) {
        this.data[name] = value;
        return;
      }
      if ('linewise' === register.type || 'linewise' === value.type) {
        if (register.type !== 'linewise') {
          register.text += '\n';
          register.type = 'linewise';
        }
        if (value.type !== 'linewise') {
          value.text += '\n';
        }
      }
      return register.text += value.text;
    };

    RegisterManager.prototype.getName = function() {
      var ref;
      return (ref = this.name) != null ? ref : this.vimState.getConfig('defaultRegister');
    };

    RegisterManager.prototype.isDefaultName = function() {
      return this.getName() === this.vimState.getConfig('defaultRegister');
    };

    RegisterManager.prototype.hasName = function() {
      return this.name != null;
    };

    RegisterManager.prototype.setName = function(name) {
      var inputUI;
      if (name == null) {
        name = null;
      }
      if (name != null) {
        if (this.isValidName(name)) {
          return this.name = name;
        }
      } else {
        this.vimState.hover.set('"');
        inputUI = new Input(this.vimState);
        inputUI.onDidConfirm((function(_this) {
          return function(name1) {
            _this.name = name1;
            _this.vimState.toggleClassList('with-register', true);
            return _this.vimState.hover.set('"' + _this.name);
          };
        })(this));
        inputUI.onDidCancel((function(_this) {
          return function() {
            return _this.vimState.hover.reset();
          };
        })(this));
        return inputUI.focus(1);
      }
    };

    RegisterManager.prototype.getCopyType = function(text) {
      if (text.lastIndexOf("\n") === text.length - 1) {
        return 'linewise';
      } else if (text.lastIndexOf("\r") === text.length - 1) {
        return 'linewise';
      } else {
        return 'characterwise';
      }
    };

    return RegisterManager;

  })();

  module.exports = RegisterManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvcmVnaXN0ZXItbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHNEQUFBO0lBQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0VBRVIsU0FBQSxHQUFZOztFQWlCTjtJQUNTLHlCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixNQUEwQyxJQUFDLENBQUEsUUFBM0MsRUFBQyxJQUFDLENBQUEsYUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLG9CQUFBLGFBQVgsRUFBMEIsSUFBQyxDQUFBLGtCQUFBO01BQzNCLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLFVBQWpCO01BQ1IsSUFBQyxDQUFBLHVCQUFELEdBQTJCLElBQUk7TUFDL0IsSUFBQyxDQUFBLG9CQUFELEdBQXdCLElBQUk7SUFKakI7OzhCQU1iLEtBQUEsR0FBTyxTQUFBO01BQ0wsSUFBQyxDQUFBLElBQUQsR0FBUTthQUNSLElBQUMsQ0FBQSxRQUFRLENBQUMsZUFBVixDQUEwQixlQUExQixFQUEyQyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQTNDO0lBRks7OzhCQUlQLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUMsQ0FBQSx1QkFBdUIsQ0FBQyxPQUF6QixDQUFpQyxTQUFDLFVBQUQ7ZUFDL0IsVUFBVSxDQUFDLE9BQVgsQ0FBQTtNQUQrQixDQUFqQztNQUVBLElBQUMsQ0FBQSx1QkFBdUIsQ0FBQyxLQUF6QixDQUFBO01BQ0EsSUFBQyxDQUFBLG9CQUFvQixDQUFDLEtBQXRCLENBQUE7YUFDQSxNQUFvRCxFQUFwRCxFQUFDLElBQUMsQ0FBQSw4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TyxDQUFDLEtBQVIsQ0FBYyxDQUFkLEVBWEY7O0lBRE87OzhCQWNULFdBQUEsR0FBYSxTQUFDLElBQUQ7TUFDWCxJQUFHLElBQUksQ0FBQyxXQUFMLENBQWlCLElBQWpCLENBQUEsS0FBMEIsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUEzQztlQUNFLFdBREY7T0FBQSxNQUVLLElBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsSUFBakIsQ0FBQSxLQUEwQixJQUFJLENBQUMsTUFBTCxHQUFjLENBQTNDO2VBQ0gsV0FERztPQUFBLE1BQUE7ZUFHSCxnQkFIRzs7SUFITTs7Ozs7O0VBUWYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF0SmpCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbklucHV0ID0gcmVxdWlyZSAnLi9pbnB1dCdcblxuUkVHSVNURVJTID0gLy8vIChcbiAgPzogW2EtekEtWiorJV9cIi5dXG4pIC8vL1xuXG4jIFRPRE86IFZpbSBzdXBwb3J0IGZvbGxvd2luZyByZWdpc3RlcnMuXG4jIHg6IGNvbXBsZXRlLCAtOiBwYXJ0aWFsbHlcbiMgIFt4XSAxLiBUaGUgdW5uYW1lZCByZWdpc3RlciBcIlwiXG4jICBbIF0gMi4gMTAgbnVtYmVyZWQgcmVnaXN0ZXJzIFwiMCB0byBcIjlcbiMgIFsgXSAzLiBUaGUgc21hbGwgZGVsZXRlIHJlZ2lzdGVyIFwiLVxuIyAgW3hdIDQuIDI2IG5hbWVkIHJlZ2lzdGVycyBcImEgdG8gXCJ6IG9yIFwiQSB0byBcIlpcbiMgIFstXSA1LiB0aHJlZSByZWFkLW9ubHkgcmVnaXN0ZXJzIFwiOiwgXCIuLCBcIiVcbiMgIFsgXSA2LiBhbHRlcm5hdGUgYnVmZmVyIHJlZ2lzdGVyIFwiI1xuIyAgWyBdIDcuIHRoZSBleHByZXNzaW9uIHJlZ2lzdGVyIFwiPVxuIyAgWyBdIDguIFRoZSBzZWxlY3Rpb24gYW5kIGRyb3AgcmVnaXN0ZXJzIFwiKiwgXCIrIGFuZCBcIn5cbiMgIFt4XSA5LiBUaGUgYmxhY2sgaG9sZSByZWdpc3RlciBcIl9cbiMgIFsgXSAxMC4gTGFzdCBzZWFyY2ggcGF0dGVybiByZWdpc3RlciBcIi9cblxuY2xhc3MgUmVnaXN0ZXJNYW5hZ2VyXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQGdsb2JhbFN0YXRlfSA9IEB2aW1TdGF0ZVxuICAgIEBkYXRhID0gQGdsb2JhbFN0YXRlLmdldCgncmVnaXN0ZXInKVxuICAgIEBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbiA9IG5ldyBNYXBcbiAgICBAY2xpcGJvYXJkQnlTZWxlY3Rpb24gPSBuZXcgTWFwXG5cbiAgcmVzZXQ6IC0+XG4gICAgQG5hbWUgPSBudWxsXG4gICAgQHZpbVN0YXRlLnRvZ2dsZUNsYXNzTGlzdCgnd2l0aC1yZWdpc3RlcicsIEBoYXNOYW1lKCkpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uZm9yRWFjaCAoZGlzcG9zYWJsZSkgLT5cbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLmNsZWFyKClcbiAgICBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uY2xlYXIoKVxuICAgIHtAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24sIEBjbGlwYm9hcmRCeVNlbGVjdGlvbn0gPSB7fVxuXG4gIGlzVmFsaWROYW1lOiAobmFtZSkgLT5cbiAgICBSRUdJU1RFUlMudGVzdChuYW1lKVxuXG4gIGdldFRleHQ6IChuYW1lLCBzZWxlY3Rpb24pIC0+XG4gICAgQGdldChuYW1lLCBzZWxlY3Rpb24pLnRleHQgPyAnJ1xuXG4gIHJlYWRDbGlwYm9hcmQ6IChzZWxlY3Rpb249bnVsbCkgLT5cbiAgICBpZiBzZWxlY3Rpb24/LmVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKSBhbmQgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pXG4gICAgICBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICBlbHNlXG4gICAgICBhdG9tLmNsaXBib2FyZC5yZWFkKClcblxuICB3cml0ZUNsaXBib2FyZDogKHNlbGVjdGlvbj1udWxsLCB0ZXh0KSAtPlxuICAgIGlmIHNlbGVjdGlvbj8uZWRpdG9yLmhhc011bHRpcGxlQ3Vyc29ycygpIGFuZCBub3QgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pXG4gICAgICBkaXNwb3NhYmxlID0gc2VsZWN0aW9uLm9uRGlkRGVzdHJveSA9PlxuICAgICAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uZGVsZXRlKHNlbGVjdGlvbilcbiAgICAgICAgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLmRlbGV0ZShzZWxlY3Rpb24pXG4gICAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgZGlzcG9zYWJsZSlcblxuICAgIGlmIChzZWxlY3Rpb24gaXMgbnVsbCkgb3Igc2VsZWN0aW9uLmlzTGFzdFNlbGVjdGlvbigpXG4gICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSh0ZXh0KVxuICAgIEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCB0ZXh0KSBpZiBzZWxlY3Rpb24/XG5cbiAgZ2V0OiAobmFtZSwgc2VsZWN0aW9uKSAtPlxuICAgIG5hbWUgPz0gQGdldE5hbWUoKVxuICAgIG5hbWUgPSBAdmltU3RhdGUuZ2V0Q29uZmlnKCdkZWZhdWx0UmVnaXN0ZXInKSBpZiBuYW1lIGlzICdcIidcblxuICAgIHN3aXRjaCBuYW1lXG4gICAgICB3aGVuICcqJywgJysnIHRoZW4gdGV4dCA9IEByZWFkQ2xpcGJvYXJkKHNlbGVjdGlvbilcbiAgICAgIHdoZW4gJyUnIHRoZW4gdGV4dCA9IEBlZGl0b3IuZ2V0VVJJKClcbiAgICAgIHdoZW4gJ18nIHRoZW4gdGV4dCA9ICcnICMgQmxhY2tob2xlIGFsd2F5cyByZXR1cm5zIG5vdGhpbmdcbiAgICAgIGVsc2VcbiAgICAgICAge3RleHQsIHR5cGV9ID0gQGRhdGFbbmFtZS50b0xvd2VyQ2FzZSgpXSA/IHt9XG4gICAgdHlwZSA/PSBAZ2V0Q29weVR5cGUodGV4dCA/ICcnKVxuICAgIHt0ZXh0LCB0eXBlfVxuXG4gICMgUHJpdmF0ZTogU2V0cyB0aGUgdmFsdWUgb2YgYSBnaXZlbiByZWdpc3Rlci5cbiAgI1xuICAjIG5hbWUgIC0gVGhlIG5hbWUgb2YgdGhlIHJlZ2lzdGVyIHRvIGZldGNoLlxuICAjIHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldCB0aGUgcmVnaXN0ZXIgdG8sIHdpdGggZm9sbG93aW5nIHByb3BlcnRpZXMuXG4gICMgIHRleHQ6IHRleHQgdG8gc2F2ZSB0byByZWdpc3Rlci5cbiAgIyAgdHlwZTogKG9wdGlvbmFsKSBpZiBvbW1pdGVkIGF1dG9tYXRpY2FsbHkgc2V0IGZyb20gdGV4dC5cbiAgI1xuICAjIFJldHVybnMgbm90aGluZy5cbiAgc2V0OiAoYXJncy4uLikgLT5cbiAgICBbbmFtZSwgdmFsdWVdID0gW11cbiAgICBzd2l0Y2ggYXJncy5sZW5ndGhcbiAgICAgIHdoZW4gMSB0aGVuIFt2YWx1ZV0gPSBhcmdzXG4gICAgICB3aGVuIDIgdGhlbiBbbmFtZSwgdmFsdWVdID0gYXJnc1xuXG4gICAgbmFtZSA/PSBAZ2V0TmFtZSgpXG4gICAgcmV0dXJuIHVubGVzcyBAaXNWYWxpZE5hbWUobmFtZSlcbiAgICBuYW1lID0gQHZpbVN0YXRlLmdldENvbmZpZygnZGVmYXVsdFJlZ2lzdGVyJykgaWYgbmFtZSBpcyAnXCInXG4gICAgdmFsdWUudHlwZSA/PSBAZ2V0Q29weVR5cGUodmFsdWUudGV4dClcblxuICAgIHNlbGVjdGlvbiA9IHZhbHVlLnNlbGVjdGlvblxuICAgIGRlbGV0ZSB2YWx1ZS5zZWxlY3Rpb25cbiAgICBzd2l0Y2ggbmFtZVxuICAgICAgd2hlbiAnKicsICcrJyB0aGVuIEB3cml0ZUNsaXBib2FyZChzZWxlY3Rpb24sIHZhbHVlLnRleHQpXG4gICAgICB3aGVuICdfJywgJyUnIHRoZW4gbnVsbFxuICAgICAgZWxzZVxuICAgICAgICBpZiAvXltBLVpdJC8udGVzdChuYW1lKVxuICAgICAgICAgIEBhcHBlbmQobmFtZS50b0xvd2VyQ2FzZSgpLCB2YWx1ZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBkYXRhW25hbWVdID0gdmFsdWVcblxuICAjIFByaXZhdGU6IGFwcGVuZCBhIHZhbHVlIGludG8gYSBnaXZlbiByZWdpc3RlclxuICAjIGxpa2Ugc2V0UmVnaXN0ZXIsIGJ1dCBhcHBlbmRzIHRoZSB2YWx1ZVxuICBhcHBlbmQ6IChuYW1lLCB2YWx1ZSkgLT5cbiAgICB1bmxlc3MgcmVnaXN0ZXIgPSBAZGF0YVtuYW1lXVxuICAgICAgQGRhdGFbbmFtZV0gPSB2YWx1ZVxuICAgICAgcmV0dXJuXG5cbiAgICBpZiAnbGluZXdpc2UnIGluIFtyZWdpc3Rlci50eXBlLCB2YWx1ZS50eXBlXVxuICAgICAgaWYgcmVnaXN0ZXIudHlwZSBpc250ICdsaW5ld2lzZSdcbiAgICAgICAgcmVnaXN0ZXIudGV4dCArPSAnXFxuJ1xuICAgICAgICByZWdpc3Rlci50eXBlID0gJ2xpbmV3aXNlJ1xuICAgICAgaWYgdmFsdWUudHlwZSBpc250ICdsaW5ld2lzZSdcbiAgICAgICAgdmFsdWUudGV4dCArPSAnXFxuJ1xuICAgIHJlZ2lzdGVyLnRleHQgKz0gdmFsdWUudGV4dFxuXG4gIGdldE5hbWU6IC0+XG4gICAgQG5hbWUgPyBAdmltU3RhdGUuZ2V0Q29uZmlnKCdkZWZhdWx0UmVnaXN0ZXInKVxuXG4gIGlzRGVmYXVsdE5hbWU6IC0+XG4gICAgQGdldE5hbWUoKSBpcyBAdmltU3RhdGUuZ2V0Q29uZmlnKCdkZWZhdWx0UmVnaXN0ZXInKVxuXG4gIGhhc05hbWU6IC0+XG4gICAgQG5hbWU/XG5cbiAgc2V0TmFtZTogKG5hbWU9bnVsbCkgLT5cbiAgICBpZiBuYW1lP1xuICAgICAgQG5hbWUgPSBuYW1lIGlmIEBpc1ZhbGlkTmFtZShuYW1lKVxuICAgIGVsc2VcbiAgICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoJ1wiJylcblxuICAgICAgaW5wdXRVSSA9IG5ldyBJbnB1dChAdmltU3RhdGUpXG4gICAgICBpbnB1dFVJLm9uRGlkQ29uZmlybSAoQG5hbWUpID0+XG4gICAgICAgIEB2aW1TdGF0ZS50b2dnbGVDbGFzc0xpc3QoJ3dpdGgtcmVnaXN0ZXInLCB0cnVlKVxuICAgICAgICBAdmltU3RhdGUuaG92ZXIuc2V0KCdcIicgKyBAbmFtZSlcbiAgICAgIGlucHV0VUkub25EaWRDYW5jZWwgPT5cbiAgICAgICAgQHZpbVN0YXRlLmhvdmVyLnJlc2V0KClcbiAgICAgIGlucHV0VUkuZm9jdXMoMSlcblxuICBnZXRDb3B5VHlwZTogKHRleHQpIC0+XG4gICAgaWYgdGV4dC5sYXN0SW5kZXhPZihcIlxcblwiKSBpcyB0ZXh0Lmxlbmd0aCAtIDFcbiAgICAgICdsaW5ld2lzZSdcbiAgICBlbHNlIGlmIHRleHQubGFzdEluZGV4T2YoXCJcXHJcIikgaXMgdGV4dC5sZW5ndGggLSAxXG4gICAgICAnbGluZXdpc2UnXG4gICAgZWxzZVxuICAgICAgJ2NoYXJhY3Rlcndpc2UnXG5cbm1vZHVsZS5leHBvcnRzID0gUmVnaXN0ZXJNYW5hZ2VyXG4iXX0=
