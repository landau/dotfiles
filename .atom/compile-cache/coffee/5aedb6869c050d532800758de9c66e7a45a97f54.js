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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvcmVnaXN0ZXItbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGlDQUFBO0lBQUE7O0VBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztFQUVSLFNBQUEsR0FBWTs7RUFpQlosTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHlCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7O01BQ1osTUFBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGFBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxvQkFBQTtNQUNYLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBdEIsQ0FBMEIsVUFBMUI7TUFDUixJQUFDLENBQUEsdUJBQUQsR0FBMkIsSUFBSTtNQUMvQixJQUFDLENBQUEsb0JBQUQsR0FBd0IsSUFBSTtNQUU1QixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQXhCO0lBTlc7OzhCQVFiLEtBQUEsR0FBTyxTQUFBO01BQ0wsSUFBQyxDQUFBLElBQUQsR0FBUTthQUNSLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLGVBQWhDLEVBQWlELEtBQWpEO0lBRks7OzhCQUlQLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUMsQ0FBQSx1QkFBdUIsQ0FBQyxPQUF6QixDQUFpQyxTQUFDLFVBQUQ7ZUFDL0IsVUFBVSxDQUFDLE9BQVgsQ0FBQTtNQUQrQixDQUFqQztNQUVBLElBQUMsQ0FBQSx1QkFBdUIsQ0FBQyxLQUF6QixDQUFBO01BQ0EsSUFBQyxDQUFBLG9CQUFvQixDQUFDLEtBQXRCLENBQUE7YUFDQSxNQUFvRCxFQUFwRCxFQUFDLElBQUMsQ0FBQSw4QkFBQSx1QkFBRixFQUEyQixJQUFDLENBQUEsMkJBQUEsb0JBQTVCLEVBQUE7SUFMTzs7OEJBT1QsV0FBQSxHQUFhLFNBQUMsSUFBRDthQUNYLFNBQVMsQ0FBQyxJQUFWLENBQWUsSUFBZjtJQURXOzs4QkFHYixPQUFBLEdBQVMsU0FBQyxJQUFELEVBQU8sU0FBUDtBQUNQLFVBQUE7b0VBQTZCO0lBRHRCOzs4QkFHVCxhQUFBLEdBQWUsU0FBQyxTQUFEOztRQUFDLFlBQVU7O01BQ3hCLHlCQUFHLFNBQVMsQ0FBRSxNQUFNLENBQUMsa0JBQWxCLENBQUEsV0FBQSxJQUEyQyxJQUFDLENBQUEsb0JBQW9CLENBQUMsR0FBdEIsQ0FBMEIsU0FBMUIsQ0FBOUM7ZUFDRSxJQUFDLENBQUEsb0JBQW9CLENBQUMsR0FBdEIsQ0FBMEIsU0FBMUIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBQSxFQUhGOztJQURhOzs4QkFNZixjQUFBLEdBQWdCLFNBQUMsU0FBRCxFQUFpQixJQUFqQjtBQUNkLFVBQUE7O1FBRGUsWUFBVTs7TUFDekIseUJBQUcsU0FBUyxDQUFFLE1BQU0sQ0FBQyxrQkFBbEIsQ0FBQSxXQUFBLElBQTJDLENBQUksSUFBQyxDQUFBLG9CQUFvQixDQUFDLEdBQXRCLENBQTBCLFNBQTFCLENBQWxEO1FBQ0UsVUFBQSxHQUFhLFNBQVMsQ0FBQyxZQUFWLENBQXVCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7WUFDbEMsS0FBQyxDQUFBLHVCQUF1QixFQUFDLE1BQUQsRUFBeEIsQ0FBZ0MsU0FBaEM7bUJBQ0EsS0FBQyxDQUFBLG9CQUFvQixFQUFDLE1BQUQsRUFBckIsQ0FBNkIsU0FBN0I7VUFGa0M7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCO1FBR2IsSUFBQyxDQUFBLHVCQUF1QixDQUFDLEdBQXpCLENBQTZCLFNBQTdCLEVBQXdDLFVBQXhDLEVBSkY7O01BTUEsSUFBRyxDQUFDLFNBQUEsS0FBYSxJQUFkLENBQUEsSUFBdUIsU0FBUyxDQUFDLGVBQVYsQ0FBQSxDQUExQjtRQUNFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBZixDQUFxQixJQUFyQixFQURGOztNQUVBLElBQThDLGlCQUE5QztlQUFBLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxHQUF0QixDQUEwQixTQUExQixFQUFxQyxJQUFyQyxFQUFBOztJQVRjOzs4QkFXaEIsb0JBQUEsR0FBc0IsU0FBQyxJQUFEO0FBQ3BCLFVBQUE7TUFBQSxJQUFHLGNBQUEsSUFBVSxDQUFJLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBYixDQUFqQjtBQUNFLGVBQU8sS0FEVDs7O1FBR0EseUNBQWdCOztNQUNoQixJQUFHLElBQUEsS0FBUSxHQUFSLElBQWdCLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFvQiwrQkFBcEIsQ0FBbkI7ZUFDRSxJQURGO09BQUEsTUFBQTtlQUdFLEtBSEY7O0lBTG9COzs4QkFVdEIsR0FBQSxHQUFLLFNBQUMsSUFBRCxFQUFPLFNBQVA7QUFDSCxVQUFBO01BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixJQUF0QjtNQUNQLElBQWMsWUFBZDtBQUFBLGVBQUE7O0FBRUEsY0FBTyxJQUFQO0FBQUEsYUFDTyxHQURQO0FBQUEsYUFDWSxHQURaO1VBQ3FCLElBQUEsR0FBTyxJQUFDLENBQUEsYUFBRCxDQUFlLFNBQWY7QUFBaEI7QUFEWixhQUVPLEdBRlA7VUFFZ0IsSUFBQSxHQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBO0FBQWhCO0FBRlAsYUFHTyxHQUhQO1VBR2dCLElBQUEsR0FBTztBQUFoQjtBQUhQO1VBS0ksNkRBQTJDLEVBQTNDLEVBQUMsZ0JBQUQsRUFBTztBQUxYOztRQU1BLE9BQVEsSUFBQyxDQUFBLFdBQUQsZ0JBQWEsT0FBTyxFQUFwQjs7YUFDUjtRQUFDLE1BQUEsSUFBRDtRQUFPLE1BQUEsSUFBUDs7SUFYRzs7OEJBcUJMLEdBQUEsR0FBSyxTQUFDLElBQUQsRUFBTyxLQUFQO0FBQ0gsVUFBQTtNQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsSUFBdEI7TUFDUCxJQUFjLFlBQWQ7QUFBQSxlQUFBOzs7UUFFQSxLQUFLLENBQUMsT0FBUSxJQUFDLENBQUEsV0FBRCxDQUFhLEtBQUssQ0FBQyxJQUFuQjs7TUFFZCxTQUFBLEdBQVksS0FBSyxDQUFDO01BQ2xCLE9BQU8sS0FBSyxDQUFDO0FBRWIsY0FBTyxJQUFQO0FBQUEsYUFDTyxHQURQO0FBQUEsYUFDWSxHQURaO2lCQUNxQixJQUFDLENBQUEsY0FBRCxDQUFnQixTQUFoQixFQUEyQixLQUFLLENBQUMsSUFBakM7QUFEckIsYUFFTyxHQUZQO0FBQUEsYUFFWSxHQUZaO2lCQUVxQjtBQUZyQjtVQUlJLElBQUcsU0FBUyxDQUFDLElBQVYsQ0FBZSxJQUFmLENBQUg7WUFDRSxJQUFBLEdBQU8sSUFBSSxDQUFDLFdBQUwsQ0FBQTtZQUNQLElBQUcsdUJBQUg7cUJBQ0UsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFSLEVBQWMsS0FBZCxFQURGO2FBQUEsTUFBQTtxQkFHRSxJQUFDLENBQUEsSUFBSyxDQUFBLElBQUEsQ0FBTixHQUFjLE1BSGhCO2FBRkY7V0FBQSxNQUFBO21CQU9FLElBQUMsQ0FBQSxJQUFLLENBQUEsSUFBQSxDQUFOLEdBQWMsTUFQaEI7O0FBSko7SUFURzs7OEJBc0JMLE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxLQUFQO0FBQ04sVUFBQTtNQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsSUFBSyxDQUFBLElBQUE7TUFDakIsSUFBRyxVQUFBLEtBQWUsUUFBUSxDQUFDLElBQXhCLElBQUEsVUFBQSxLQUE4QixLQUFLLENBQUMsSUFBdkM7UUFDRSxJQUFHLFFBQVEsQ0FBQyxJQUFULEtBQW1CLFVBQXRCO1VBQ0UsUUFBUSxDQUFDLElBQVQsR0FBZ0I7VUFDaEIsUUFBUSxDQUFDLElBQVQsSUFBaUIsS0FGbkI7O1FBR0EsSUFBRyxLQUFLLENBQUMsSUFBTixLQUFnQixVQUFuQjtVQUNFLEtBQUssQ0FBQyxJQUFOLElBQWMsS0FEaEI7U0FKRjs7YUFNQSxRQUFRLENBQUMsSUFBVCxJQUFpQixLQUFLLENBQUM7SUFSakI7OzhCQVVSLE9BQUEsR0FBUyxTQUFDLElBQUQ7QUFDUCxVQUFBO01BQUEsSUFBRyxZQUFIO1FBQ0UsSUFBQyxDQUFBLElBQUQsR0FBUTtRQUNSLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLGVBQWhDLEVBQWlELElBQWpEO2VBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBaEIsQ0FBb0IsR0FBQSxHQUFNLElBQUMsQ0FBQSxJQUEzQixFQUhGO09BQUEsTUFBQTtRQUtFLE9BQUEsR0FBYyxJQUFBLEtBQUEsQ0FBTSxJQUFDLENBQUEsUUFBUDtRQUNkLE9BQU8sQ0FBQyxZQUFSLENBQXFCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsSUFBRDtZQUNuQixJQUFHLEtBQUMsQ0FBQSxXQUFELENBQWEsSUFBYixDQUFIO3FCQUNFLEtBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxFQURGO2FBQUEsTUFBQTtxQkFHRSxLQUFDLENBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFoQixDQUFBLEVBSEY7O1VBRG1CO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtRQUtBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBaEIsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQjtRQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQWhCLENBQW9CLEdBQXBCO2VBQ0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxDQUFkLEVBYkY7O0lBRE87OzhCQWdCVCxXQUFBLEdBQWEsU0FBQyxJQUFEO01BQ1gsSUFBRyxJQUFJLENBQUMsUUFBTCxDQUFjLElBQWQsQ0FBQSxJQUF1QixJQUFJLENBQUMsUUFBTCxDQUFjLElBQWQsQ0FBMUI7ZUFDRSxXQURGO09BQUEsTUFBQTtlQUdFLGdCQUhGOztJQURXOzs7OztBQTlJZiIsInNvdXJjZXNDb250ZW50IjpbIklucHV0ID0gcmVxdWlyZSAnLi9pbnB1dCdcblxuUkVHSVNURVJTID0gLy8vIChcbiAgPzogW2EtekEtWiorJV9cIi5dXG4pIC8vL1xuXG4jIFRPRE86IFZpbSBzdXBwb3J0IGZvbGxvd2luZyByZWdpc3RlcnMuXG4jIHg6IGNvbXBsZXRlLCAtOiBwYXJ0aWFsbHlcbiMgIFt4XSAxLiBUaGUgdW5uYW1lZCByZWdpc3RlciBcIlwiXG4jICBbIF0gMi4gMTAgbnVtYmVyZWQgcmVnaXN0ZXJzIFwiMCB0byBcIjlcbiMgIFsgXSAzLiBUaGUgc21hbGwgZGVsZXRlIHJlZ2lzdGVyIFwiLVxuIyAgW3hdIDQuIDI2IG5hbWVkIHJlZ2lzdGVycyBcImEgdG8gXCJ6IG9yIFwiQSB0byBcIlpcbiMgIFstXSA1LiB0aHJlZSByZWFkLW9ubHkgcmVnaXN0ZXJzIFwiOiwgXCIuLCBcIiVcbiMgIFsgXSA2LiBhbHRlcm5hdGUgYnVmZmVyIHJlZ2lzdGVyIFwiI1xuIyAgWyBdIDcuIHRoZSBleHByZXNzaW9uIHJlZ2lzdGVyIFwiPVxuIyAgWyBdIDguIFRoZSBzZWxlY3Rpb24gYW5kIGRyb3AgcmVnaXN0ZXJzIFwiKiwgXCIrIGFuZCBcIn5cbiMgIFt4XSA5LiBUaGUgYmxhY2sgaG9sZSByZWdpc3RlciBcIl9cbiMgIFsgXSAxMC4gTGFzdCBzZWFyY2ggcGF0dGVybiByZWdpc3RlciBcIi9cblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUmVnaXN0ZXJNYW5hZ2VyXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAZGF0YSA9IEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoJ3JlZ2lzdGVyJylcbiAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24gPSBuZXcgTWFwXG4gICAgQGNsaXBib2FyZEJ5U2VsZWN0aW9uID0gbmV3IE1hcFxuXG4gICAgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveSlcblxuICByZXNldDogLT5cbiAgICBAbmFtZSA9IG51bGxcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCd3aXRoLXJlZ2lzdGVyJywgZmFsc2UpXG5cbiAgZGVzdHJveTogPT5cbiAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uZm9yRWFjaCAoZGlzcG9zYWJsZSkgLT5cbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLmNsZWFyKClcbiAgICBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uY2xlYXIoKVxuICAgIHtAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24sIEBjbGlwYm9hcmRCeVNlbGVjdGlvbn0gPSB7fVxuXG4gIGlzVmFsaWROYW1lOiAobmFtZSkgLT5cbiAgICBSRUdJU1RFUlMudGVzdChuYW1lKVxuXG4gIGdldFRleHQ6IChuYW1lLCBzZWxlY3Rpb24pIC0+XG4gICAgQGdldChuYW1lLCBzZWxlY3Rpb24pLnRleHQgPyAnJ1xuXG4gIHJlYWRDbGlwYm9hcmQ6IChzZWxlY3Rpb249bnVsbCkgLT5cbiAgICBpZiBzZWxlY3Rpb24/LmVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKSBhbmQgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pXG4gICAgICBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICBlbHNlXG4gICAgICBhdG9tLmNsaXBib2FyZC5yZWFkKClcblxuICB3cml0ZUNsaXBib2FyZDogKHNlbGVjdGlvbj1udWxsLCB0ZXh0KSAtPlxuICAgIGlmIHNlbGVjdGlvbj8uZWRpdG9yLmhhc011bHRpcGxlQ3Vyc29ycygpIGFuZCBub3QgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pXG4gICAgICBkaXNwb3NhYmxlID0gc2VsZWN0aW9uLm9uRGlkRGVzdHJveSA9PlxuICAgICAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uZGVsZXRlKHNlbGVjdGlvbilcbiAgICAgICAgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLmRlbGV0ZShzZWxlY3Rpb24pXG4gICAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgZGlzcG9zYWJsZSlcblxuICAgIGlmIChzZWxlY3Rpb24gaXMgbnVsbCkgb3Igc2VsZWN0aW9uLmlzTGFzdFNlbGVjdGlvbigpXG4gICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSh0ZXh0KVxuICAgIEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCB0ZXh0KSBpZiBzZWxlY3Rpb24/XG5cbiAgZ2V0UmVnaXN0ZXJOYW1lVG9Vc2U6IChuYW1lKSAtPlxuICAgIGlmIG5hbWU/IGFuZCBub3QgQGlzVmFsaWROYW1lKG5hbWUpXG4gICAgICByZXR1cm4gbnVsbFxuXG4gICAgbmFtZSA/PSBAbmFtZSA/ICdcIidcbiAgICBpZiBuYW1lIGlzICdcIicgYW5kIEB2aW1TdGF0ZS5nZXRDb25maWcoJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJylcbiAgICAgICcqJ1xuICAgIGVsc2VcbiAgICAgIG5hbWVcblxuICBnZXQ6IChuYW1lLCBzZWxlY3Rpb24pIC0+XG4gICAgbmFtZSA9IEBnZXRSZWdpc3Rlck5hbWVUb1VzZShuYW1lKVxuICAgIHJldHVybiB1bmxlc3MgbmFtZT9cblxuICAgIHN3aXRjaCBuYW1lXG4gICAgICB3aGVuICcqJywgJysnIHRoZW4gdGV4dCA9IEByZWFkQ2xpcGJvYXJkKHNlbGVjdGlvbilcbiAgICAgIHdoZW4gJyUnIHRoZW4gdGV4dCA9IEBlZGl0b3IuZ2V0VVJJKClcbiAgICAgIHdoZW4gJ18nIHRoZW4gdGV4dCA9ICcnICMgQmxhY2tob2xlIGFsd2F5cyByZXR1cm5zIG5vdGhpbmdcbiAgICAgIGVsc2VcbiAgICAgICAge3RleHQsIHR5cGV9ID0gQGRhdGFbbmFtZS50b0xvd2VyQ2FzZSgpXSA/IHt9XG4gICAgdHlwZSA/PSBAZ2V0Q29weVR5cGUodGV4dCA/ICcnKVxuICAgIHt0ZXh0LCB0eXBlfVxuXG4gICMgUHJpdmF0ZTogU2V0cyB0aGUgdmFsdWUgb2YgYSBnaXZlbiByZWdpc3Rlci5cbiAgI1xuICAjIG5hbWUgIC0gVGhlIG5hbWUgb2YgdGhlIHJlZ2lzdGVyIHRvIGZldGNoLlxuICAjIHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldCB0aGUgcmVnaXN0ZXIgdG8sIHdpdGggZm9sbG93aW5nIHByb3BlcnRpZXMuXG4gICMgIHRleHQ6IHRleHQgdG8gc2F2ZSB0byByZWdpc3Rlci5cbiAgIyAgdHlwZTogKG9wdGlvbmFsKSBpZiBvbW1pdGVkIGF1dG9tYXRpY2FsbHkgc2V0IGZyb20gdGV4dC5cbiAgI1xuICAjIFJldHVybnMgbm90aGluZy5cbiAgc2V0OiAobmFtZSwgdmFsdWUpIC0+XG4gICAgbmFtZSA9IEBnZXRSZWdpc3Rlck5hbWVUb1VzZShuYW1lKVxuICAgIHJldHVybiB1bmxlc3MgbmFtZT9cblxuICAgIHZhbHVlLnR5cGUgPz0gQGdldENvcHlUeXBlKHZhbHVlLnRleHQpXG5cbiAgICBzZWxlY3Rpb24gPSB2YWx1ZS5zZWxlY3Rpb25cbiAgICBkZWxldGUgdmFsdWUuc2VsZWN0aW9uXG5cbiAgICBzd2l0Y2ggbmFtZVxuICAgICAgd2hlbiAnKicsICcrJyB0aGVuIEB3cml0ZUNsaXBib2FyZChzZWxlY3Rpb24sIHZhbHVlLnRleHQpXG4gICAgICB3aGVuICdfJywgJyUnIHRoZW4gbnVsbFxuICAgICAgZWxzZVxuICAgICAgICBpZiAvXltBLVpdJC8udGVzdChuYW1lKVxuICAgICAgICAgIG5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBpZiBAZGF0YVtuYW1lXT9cbiAgICAgICAgICAgIEBhcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGRhdGFbbmFtZV0gPSB2YWx1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGRhdGFbbmFtZV0gPSB2YWx1ZVxuXG4gIGFwcGVuZDogKG5hbWUsIHZhbHVlKSAtPlxuICAgIHJlZ2lzdGVyID0gQGRhdGFbbmFtZV1cbiAgICBpZiAnbGluZXdpc2UnIGluIFtyZWdpc3Rlci50eXBlLCB2YWx1ZS50eXBlXVxuICAgICAgaWYgcmVnaXN0ZXIudHlwZSBpc250ICdsaW5ld2lzZSdcbiAgICAgICAgcmVnaXN0ZXIudHlwZSA9ICdsaW5ld2lzZSdcbiAgICAgICAgcmVnaXN0ZXIudGV4dCArPSAnXFxuJ1xuICAgICAgaWYgdmFsdWUudHlwZSBpc250ICdsaW5ld2lzZSdcbiAgICAgICAgdmFsdWUudGV4dCArPSAnXFxuJ1xuICAgIHJlZ2lzdGVyLnRleHQgKz0gdmFsdWUudGV4dFxuXG4gIHNldE5hbWU6IChuYW1lKSAtPlxuICAgIGlmIG5hbWU/XG4gICAgICBAbmFtZSA9IG5hbWVcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ3dpdGgtcmVnaXN0ZXInLCB0cnVlKVxuICAgICAgQHZpbVN0YXRlLmhvdmVyLnNldCgnXCInICsgQG5hbWUpXG4gICAgZWxzZVxuICAgICAgaW5wdXRVSSA9IG5ldyBJbnB1dChAdmltU3RhdGUpXG4gICAgICBpbnB1dFVJLm9uRGlkQ29uZmlybSAobmFtZSkgPT5cbiAgICAgICAgaWYgQGlzVmFsaWROYW1lKG5hbWUpXG4gICAgICAgICAgQHNldE5hbWUobmFtZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEB2aW1TdGF0ZS5ob3Zlci5yZXNldCgpXG4gICAgICBpbnB1dFVJLm9uRGlkQ2FuY2VsID0+IEB2aW1TdGF0ZS5ob3Zlci5yZXNldCgpXG4gICAgICBAdmltU3RhdGUuaG92ZXIuc2V0KCdcIicpXG4gICAgICBpbnB1dFVJLmZvY3VzKDEpXG5cbiAgZ2V0Q29weVR5cGU6ICh0ZXh0KSAtPlxuICAgIGlmIHRleHQuZW5kc1dpdGgoXCJcXG5cIikgb3IgdGV4dC5lbmRzV2l0aChcIlxcclwiKVxuICAgICAgJ2xpbmV3aXNlJ1xuICAgIGVsc2VcbiAgICAgICdjaGFyYWN0ZXJ3aXNlJ1xuIl19
