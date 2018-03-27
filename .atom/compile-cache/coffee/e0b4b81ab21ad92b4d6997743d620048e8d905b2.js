(function() {
  var CompositeDisposable, Emitter, Input, ref;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  module.exports = Input = (function() {
    Input.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    Input.prototype.onDidConfirm = function(fn) {
      return this.emitter.on('did-confirm', fn);
    };

    Input.prototype.onDidCancel = function(fn) {
      return this.emitter.on('did-cancel', fn);
    };

    function Input(vimState) {
      this.vimState = vimState;
      this.editorElement = this.vimState.editorElement;
      this.vimState.onDidFailToPushToOperationStack((function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      this.emitter = new Emitter;
    }

    Input.prototype.destroy = function() {
      var ref1;
      return ref1 = {}, this.vimState = ref1.vimState, ref1;
    };

    Input.prototype.focus = function(charsMax) {
      var chars;
      if (charsMax == null) {
        charsMax = 1;
      }
      chars = [];
      this.disposables = new CompositeDisposable();
      this.disposables.add(this.vimState.swapClassName("vim-mode-plus-input-char-waiting", "is-focused"));
      this.disposables.add(this.vimState.onDidSetInputChar((function(_this) {
        return function(char) {
          var text;
          if (charsMax === 1) {
            return _this.confirm(char);
          } else {
            chars.push(char);
            text = chars.join('');
            _this.emitter.emit('did-change', text);
            if (chars.length >= charsMax) {
              return _this.confirm(text);
            }
          }
        };
      })(this)));
      return this.disposables.add(atom.commands.add(this.editorElement, {
        'core:cancel': (function(_this) {
          return function(event) {
            event.stopImmediatePropagation();
            return _this.cancel();
          };
        })(this),
        'core:confirm': (function(_this) {
          return function(event) {
            event.stopImmediatePropagation();
            return _this.confirm(chars.join(''));
          };
        })(this)
      }));
    };

    Input.prototype.confirm = function(char) {
      var ref1;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
      }
      return this.emitter.emit('did-confirm', char);
    };

    Input.prototype.cancel = function() {
      var ref1;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
      }
      return this.emitter.emit('did-cancel');
    };

    return Input;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvaW5wdXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLHFCQUFELEVBQVU7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDTTtvQkFDSixXQUFBLEdBQWEsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQjtJQUFSOztvQkFDYixZQUFBLEdBQWMsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksYUFBWixFQUEyQixFQUEzQjtJQUFSOztvQkFDZCxXQUFBLEdBQWEsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQjtJQUFSOztJQUVBLGVBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxXQUFEO01BQ1gsSUFBQyxDQUFBLGdCQUFpQixJQUFDLENBQUEsU0FBbEI7TUFDRixJQUFDLENBQUEsUUFBUSxDQUFDLCtCQUFWLENBQTBDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDeEMsS0FBQyxDQUFBLE1BQUQsQ0FBQTtRQUR3QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUM7TUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7SUFKSjs7b0JBTWIsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO2FBQUEsT0FBYyxFQUFkLEVBQUMsSUFBQyxDQUFBLGdCQUFBLFFBQUYsRUFBQTtJQURPOztvQkFHVCxLQUFBLEdBQU8sU0FBQyxRQUFEO0FBQ0wsVUFBQTs7UUFETSxXQUFTOztNQUNmLEtBQUEsR0FBUTtNQUVSLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsbUJBQUEsQ0FBQTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxhQUFWLENBQXdCLGtDQUF4QixFQUE2RCxZQUE3RCxDQUFqQjtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLGlCQUFWLENBQTRCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO0FBQzNDLGNBQUE7VUFBQSxJQUFHLFFBQUEsS0FBWSxDQUFmO21CQUNFLEtBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxFQURGO1dBQUEsTUFBQTtZQUdFLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtZQUNBLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLEVBQVg7WUFDUCxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxZQUFkLEVBQTRCLElBQTVCO1lBQ0EsSUFBRyxLQUFLLENBQUMsTUFBTixJQUFnQixRQUFuQjtxQkFDRSxLQUFDLENBQUEsT0FBRCxDQUFTLElBQVQsRUFERjthQU5GOztRQUQyQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUIsQ0FBakI7YUFVQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxhQUFuQixFQUNmO1FBQUEsYUFBQSxFQUFlLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsS0FBRDtZQUNiLEtBQUssQ0FBQyx3QkFBTixDQUFBO21CQUNBLEtBQUMsQ0FBQSxNQUFELENBQUE7VUFGYTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZjtRQUdBLGNBQUEsRUFBZ0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxLQUFEO1lBQ2QsS0FBSyxDQUFDLHdCQUFOLENBQUE7bUJBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLEVBQVgsQ0FBVDtVQUZjO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhoQjtPQURlLENBQWpCO0lBZks7O29CQXVCUCxPQUFBLEdBQVMsU0FBQyxJQUFEO0FBQ1AsVUFBQTs7WUFBWSxDQUFFLE9BQWQsQ0FBQTs7YUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxhQUFkLEVBQTZCLElBQTdCO0lBRk87O29CQUlULE1BQUEsR0FBUSxTQUFBO0FBQ04sVUFBQTs7WUFBWSxDQUFFLE9BQWQsQ0FBQTs7YUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxZQUFkO0lBRk07Ozs7O0FBNUNWIiwic291cmNlc0NvbnRlbnQiOlsie0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSW5wdXRcbiAgb25EaWRDaGFuZ2U6IChmbikgLT4gQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UnLCBmblxuICBvbkRpZENvbmZpcm06IChmbikgLT4gQGVtaXR0ZXIub24gJ2RpZC1jb25maXJtJywgZm5cbiAgb25EaWRDYW5jZWw6IChmbikgLT4gQGVtaXR0ZXIub24gJ2RpZC1jYW5jZWwnLCBmblxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAdmltU3RhdGUub25EaWRGYWlsVG9QdXNoVG9PcGVyYXRpb25TdGFjayA9PlxuICAgICAgQGNhbmNlbCgpXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gIGRlc3Ryb3k6IC0+XG4gICAge0B2aW1TdGF0ZX0gPSB7fVxuXG4gIGZvY3VzOiAoY2hhcnNNYXg9MSkgLT5cbiAgICBjaGFycyA9IFtdXG5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAdmltU3RhdGUuc3dhcENsYXNzTmFtZShcInZpbS1tb2RlLXBsdXMtaW5wdXQtY2hhci13YWl0aW5nXCIsICBcImlzLWZvY3VzZWRcIilcbiAgICBAZGlzcG9zYWJsZXMuYWRkIEB2aW1TdGF0ZS5vbkRpZFNldElucHV0Q2hhciAoY2hhcikgPT5cbiAgICAgIGlmIGNoYXJzTWF4IGlzIDFcbiAgICAgICAgQGNvbmZpcm0oY2hhcilcbiAgICAgIGVsc2VcbiAgICAgICAgY2hhcnMucHVzaChjaGFyKVxuICAgICAgICB0ZXh0ID0gY2hhcnMuam9pbignJylcbiAgICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZScsIHRleHQpXG4gICAgICAgIGlmIGNoYXJzLmxlbmd0aCA+PSBjaGFyc01heFxuICAgICAgICAgIEBjb25maXJtKHRleHQpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkIEBlZGl0b3JFbGVtZW50LFxuICAgICAgJ2NvcmU6Y2FuY2VsJzogKGV2ZW50KSA9PlxuICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgICBAY2FuY2VsKClcbiAgICAgICdjb3JlOmNvbmZpcm0nOiAoZXZlbnQpID0+XG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgIEBjb25maXJtKGNoYXJzLmpvaW4oJycpKVxuXG4gIGNvbmZpcm06IChjaGFyKSAtPlxuICAgIEBkaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNvbmZpcm0nLCBjaGFyKVxuXG4gIGNhbmNlbDogLT5cbiAgICBAZGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jYW5jZWwnKVxuIl19
