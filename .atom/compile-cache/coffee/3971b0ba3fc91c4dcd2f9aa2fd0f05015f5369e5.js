(function() {
  var CompositeDisposable, Input, REGISTERS, RegisterManager;

  CompositeDisposable = require('atom').CompositeDisposable;

  Input = require('./input');

  REGISTERS = /(?:[a-zA-Z*+%_".])/;

  module.exports = RegisterManager = (function() {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvcmVnaXN0ZXItbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztFQUVSLFNBQUEsR0FBWTs7RUFpQlosTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHlCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixNQUEwQyxJQUFDLENBQUEsUUFBM0MsRUFBQyxJQUFDLENBQUEsYUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLG9CQUFBLGFBQVgsRUFBMEIsSUFBQyxDQUFBLGtCQUFBO01BQzNCLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLFVBQWpCO01BQ1IsSUFBQyxDQUFBLHVCQUFELEdBQTJCLElBQUk7TUFDL0IsSUFBQyxDQUFBLG9CQUFELEdBQXdCLElBQUk7SUFKakI7OzhCQU1iLEtBQUEsR0FBTyxTQUFBO01BQ0wsSUFBQyxDQUFBLElBQUQsR0FBUTthQUNSLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLGVBQWhDLEVBQWlELEtBQWpEO0lBRks7OzhCQUlQLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUMsQ0FBQSx1QkFBdUIsQ0FBQyxPQUF6QixDQUFpQyxTQUFDLFVBQUQ7ZUFDL0IsVUFBVSxDQUFDLE9BQVgsQ0FBQTtNQUQrQixDQUFqQztNQUVBLElBQUMsQ0FBQSx1QkFBdUIsQ0FBQyxLQUF6QixDQUFBO01BQ0EsSUFBQyxDQUFBLG9CQUFvQixDQUFDLEtBQXRCLENBQUE7YUFDQSxNQUFvRCxFQUFwRCxFQUFDLElBQUMsQ0FBQSw4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QUdFLGdCQUhGOztJQURXOzs7OztBQTdJZiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5JbnB1dCA9IHJlcXVpcmUgJy4vaW5wdXQnXG5cblJFR0lTVEVSUyA9IC8vLyAoXG4gID86IFthLXpBLVoqKyVfXCIuXVxuKSAvLy9cblxuIyBUT0RPOiBWaW0gc3VwcG9ydCBmb2xsb3dpbmcgcmVnaXN0ZXJzLlxuIyB4OiBjb21wbGV0ZSwgLTogcGFydGlhbGx5XG4jICBbeF0gMS4gVGhlIHVubmFtZWQgcmVnaXN0ZXIgXCJcIlxuIyAgWyBdIDIuIDEwIG51bWJlcmVkIHJlZ2lzdGVycyBcIjAgdG8gXCI5XG4jICBbIF0gMy4gVGhlIHNtYWxsIGRlbGV0ZSByZWdpc3RlciBcIi1cbiMgIFt4XSA0LiAyNiBuYW1lZCByZWdpc3RlcnMgXCJhIHRvIFwieiBvciBcIkEgdG8gXCJaXG4jICBbLV0gNS4gdGhyZWUgcmVhZC1vbmx5IHJlZ2lzdGVycyBcIjosIFwiLiwgXCIlXG4jICBbIF0gNi4gYWx0ZXJuYXRlIGJ1ZmZlciByZWdpc3RlciBcIiNcbiMgIFsgXSA3LiB0aGUgZXhwcmVzc2lvbiByZWdpc3RlciBcIj1cbiMgIFsgXSA4LiBUaGUgc2VsZWN0aW9uIGFuZCBkcm9wIHJlZ2lzdGVycyBcIiosIFwiKyBhbmQgXCJ+XG4jICBbeF0gOS4gVGhlIGJsYWNrIGhvbGUgcmVnaXN0ZXIgXCJfXG4jICBbIF0gMTAuIExhc3Qgc2VhcmNoIHBhdHRlcm4gcmVnaXN0ZXIgXCIvXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFJlZ2lzdGVyTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBnbG9iYWxTdGF0ZX0gPSBAdmltU3RhdGVcbiAgICBAZGF0YSA9IEBnbG9iYWxTdGF0ZS5nZXQoJ3JlZ2lzdGVyJylcbiAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24gPSBuZXcgTWFwXG4gICAgQGNsaXBib2FyZEJ5U2VsZWN0aW9uID0gbmV3IE1hcFxuXG4gIHJlc2V0OiAtPlxuICAgIEBuYW1lID0gbnVsbFxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ3dpdGgtcmVnaXN0ZXInLCBmYWxzZSlcblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5mb3JFYWNoIChkaXNwb3NhYmxlKSAtPlxuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uY2xlYXIoKVxuICAgIEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5jbGVhcigpXG4gICAge0BzdWJzY3JpcHRpb25CeVNlbGVjdGlvbiwgQGNsaXBib2FyZEJ5U2VsZWN0aW9ufSA9IHt9XG5cbiAgaXNWYWxpZE5hbWU6IChuYW1lKSAtPlxuICAgIFJFR0lTVEVSUy50ZXN0KG5hbWUpXG5cbiAgZ2V0VGV4dDogKG5hbWUsIHNlbGVjdGlvbikgLT5cbiAgICBAZ2V0KG5hbWUsIHNlbGVjdGlvbikudGV4dCA/ICcnXG5cbiAgcmVhZENsaXBib2FyZDogKHNlbGVjdGlvbj1udWxsKSAtPlxuICAgIGlmIHNlbGVjdGlvbj8uZWRpdG9yLmhhc011bHRpcGxlQ3Vyc29ycygpIGFuZCBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgIEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgIGVsc2VcbiAgICAgIGF0b20uY2xpcGJvYXJkLnJlYWQoKVxuXG4gIHdyaXRlQ2xpcGJvYXJkOiAoc2VsZWN0aW9uPW51bGwsIHRleHQpIC0+XG4gICAgaWYgc2VsZWN0aW9uPy5lZGl0b3IuaGFzTXVsdGlwbGVDdXJzb3JzKCkgYW5kIG5vdCBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgIGRpc3Bvc2FibGUgPSBzZWxlY3Rpb24ub25EaWREZXN0cm95ID0+XG4gICAgICAgIEBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5kZWxldGUoc2VsZWN0aW9uKVxuICAgICAgICBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uZGVsZXRlKHNlbGVjdGlvbilcbiAgICAgIEBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBkaXNwb3NhYmxlKVxuXG4gICAgaWYgKHNlbGVjdGlvbiBpcyBudWxsKSBvciBzZWxlY3Rpb24uaXNMYXN0U2VsZWN0aW9uKClcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHRleHQpXG4gICAgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIHRleHQpIGlmIHNlbGVjdGlvbj9cblxuICBnZXRSZWdpc3Rlck5hbWVUb1VzZTogKG5hbWUpIC0+XG4gICAgaWYgbmFtZT8gYW5kIG5vdCBAaXNWYWxpZE5hbWUobmFtZSlcbiAgICAgIHJldHVybiBudWxsXG5cbiAgICBuYW1lID89IEBuYW1lID8gJ1wiJ1xuICAgIGlmIG5hbWUgaXMgJ1wiJyBhbmQgQHZpbVN0YXRlLmdldENvbmZpZygndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInKVxuICAgICAgJyonXG4gICAgZWxzZVxuICAgICAgbmFtZVxuXG4gIGdldDogKG5hbWUsIHNlbGVjdGlvbikgLT5cbiAgICBuYW1lID0gQGdldFJlZ2lzdGVyTmFtZVRvVXNlKG5hbWUpXG4gICAgcmV0dXJuIHVubGVzcyBuYW1lP1xuXG4gICAgc3dpdGNoIG5hbWVcbiAgICAgIHdoZW4gJyonLCAnKycgdGhlbiB0ZXh0ID0gQHJlYWRDbGlwYm9hcmQoc2VsZWN0aW9uKVxuICAgICAgd2hlbiAnJScgdGhlbiB0ZXh0ID0gQGVkaXRvci5nZXRVUkkoKVxuICAgICAgd2hlbiAnXycgdGhlbiB0ZXh0ID0gJycgIyBCbGFja2hvbGUgYWx3YXlzIHJldHVybnMgbm90aGluZ1xuICAgICAgZWxzZVxuICAgICAgICB7dGV4dCwgdHlwZX0gPSBAZGF0YVtuYW1lLnRvTG93ZXJDYXNlKCldID8ge31cbiAgICB0eXBlID89IEBnZXRDb3B5VHlwZSh0ZXh0ID8gJycpXG4gICAge3RleHQsIHR5cGV9XG5cbiAgIyBQcml2YXRlOiBTZXRzIHRoZSB2YWx1ZSBvZiBhIGdpdmVuIHJlZ2lzdGVyLlxuICAjXG4gICMgbmFtZSAgLSBUaGUgbmFtZSBvZiB0aGUgcmVnaXN0ZXIgdG8gZmV0Y2guXG4gICMgdmFsdWUgLSBUaGUgdmFsdWUgdG8gc2V0IHRoZSByZWdpc3RlciB0bywgd2l0aCBmb2xsb3dpbmcgcHJvcGVydGllcy5cbiAgIyAgdGV4dDogdGV4dCB0byBzYXZlIHRvIHJlZ2lzdGVyLlxuICAjICB0eXBlOiAob3B0aW9uYWwpIGlmIG9tbWl0ZWQgYXV0b21hdGljYWxseSBzZXQgZnJvbSB0ZXh0LlxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICBzZXQ6IChuYW1lLCB2YWx1ZSkgLT5cbiAgICBuYW1lID0gQGdldFJlZ2lzdGVyTmFtZVRvVXNlKG5hbWUpXG4gICAgcmV0dXJuIHVubGVzcyBuYW1lP1xuXG4gICAgdmFsdWUudHlwZSA/PSBAZ2V0Q29weVR5cGUodmFsdWUudGV4dClcblxuICAgIHNlbGVjdGlvbiA9IHZhbHVlLnNlbGVjdGlvblxuICAgIGRlbGV0ZSB2YWx1ZS5zZWxlY3Rpb25cblxuICAgIHN3aXRjaCBuYW1lXG4gICAgICB3aGVuICcqJywgJysnIHRoZW4gQHdyaXRlQ2xpcGJvYXJkKHNlbGVjdGlvbiwgdmFsdWUudGV4dClcbiAgICAgIHdoZW4gJ18nLCAnJScgdGhlbiBudWxsXG4gICAgICBlbHNlXG4gICAgICAgIGlmIC9eW0EtWl0kLy50ZXN0KG5hbWUpXG4gICAgICAgICAgbmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGlmIEBkYXRhW25hbWVdP1xuICAgICAgICAgICAgQGFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZGF0YVtuYW1lXSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZGF0YVtuYW1lXSA9IHZhbHVlXG5cbiAgYXBwZW5kOiAobmFtZSwgdmFsdWUpIC0+XG4gICAgcmVnaXN0ZXIgPSBAZGF0YVtuYW1lXVxuICAgIGlmICdsaW5ld2lzZScgaW4gW3JlZ2lzdGVyLnR5cGUsIHZhbHVlLnR5cGVdXG4gICAgICBpZiByZWdpc3Rlci50eXBlIGlzbnQgJ2xpbmV3aXNlJ1xuICAgICAgICByZWdpc3Rlci50eXBlID0gJ2xpbmV3aXNlJ1xuICAgICAgICByZWdpc3Rlci50ZXh0ICs9ICdcXG4nXG4gICAgICBpZiB2YWx1ZS50eXBlIGlzbnQgJ2xpbmV3aXNlJ1xuICAgICAgICB2YWx1ZS50ZXh0ICs9ICdcXG4nXG4gICAgcmVnaXN0ZXIudGV4dCArPSB2YWx1ZS50ZXh0XG5cbiAgc2V0TmFtZTogKG5hbWUpIC0+XG4gICAgaWYgbmFtZT9cbiAgICAgIEBuYW1lID0gbmFtZVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnd2l0aC1yZWdpc3RlcicsIHRydWUpXG4gICAgICBAdmltU3RhdGUuaG92ZXIuc2V0KCdcIicgKyBAbmFtZSlcbiAgICBlbHNlXG4gICAgICBpbnB1dFVJID0gbmV3IElucHV0KEB2aW1TdGF0ZSlcbiAgICAgIGlucHV0VUkub25EaWRDb25maXJtIChuYW1lKSA9PlxuICAgICAgICBpZiBAaXNWYWxpZE5hbWUobmFtZSlcbiAgICAgICAgICBAc2V0TmFtZShuYW1lKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHZpbVN0YXRlLmhvdmVyLnJlc2V0KClcbiAgICAgIGlucHV0VUkub25EaWRDYW5jZWwgPT4gQHZpbVN0YXRlLmhvdmVyLnJlc2V0KClcbiAgICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoJ1wiJylcbiAgICAgIGlucHV0VUkuZm9jdXMoMSlcblxuICBnZXRDb3B5VHlwZTogKHRleHQpIC0+XG4gICAgaWYgdGV4dC5lbmRzV2l0aChcIlxcblwiKSBvciB0ZXh0LmVuZHNXaXRoKFwiXFxyXCIpXG4gICAgICAnbGluZXdpc2UnXG4gICAgZWxzZVxuICAgICAgJ2NoYXJhY3Rlcndpc2UnXG4iXX0=
