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

    Input.prototype.focus = function(charsMax, hideCursor) {
      var chars, classNames, ref1;
      if (charsMax == null) {
        charsMax = 1;
      }
      chars = [];
      this.disposables = new CompositeDisposable();
      classNames = ["vim-mode-plus-input-char-waiting", "is-focused"];
      if (hideCursor) {
        classNames.push('hide-cursor');
      }
      this.disposables.add((ref1 = this.vimState).swapClassName.apply(ref1, classNames));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvaW5wdXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLHFCQUFELEVBQVU7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDTTtvQkFDSixXQUFBLEdBQWEsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQjtJQUFSOztvQkFDYixZQUFBLEdBQWMsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksYUFBWixFQUEyQixFQUEzQjtJQUFSOztvQkFDZCxXQUFBLEdBQWEsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQjtJQUFSOztJQUVBLGVBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxXQUFEO01BQ1gsSUFBQyxDQUFBLGdCQUFpQixJQUFDLENBQUEsU0FBbEI7TUFDRixJQUFDLENBQUEsUUFBUSxDQUFDLCtCQUFWLENBQTBDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDeEMsS0FBQyxDQUFBLE1BQUQsQ0FBQTtRQUR3QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUM7TUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7SUFKSjs7b0JBTWIsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO2FBQUEsT0FBYyxFQUFkLEVBQUMsSUFBQyxDQUFBLGdCQUFBLFFBQUYsRUFBQTtJQURPOztvQkFHVCxLQUFBLEdBQU8sU0FBQyxRQUFELEVBQWEsVUFBYjtBQUNMLFVBQUE7O1FBRE0sV0FBUzs7TUFDZixLQUFBLEdBQVE7TUFFUixJQUFDLENBQUEsV0FBRCxHQUFtQixJQUFBLG1CQUFBLENBQUE7TUFDbkIsVUFBQSxHQUFhLENBQUMsa0NBQUQsRUFBc0MsWUFBdEM7TUFDYixJQUFrQyxVQUFsQztRQUFBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLGFBQWhCLEVBQUE7O01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLFFBQUEsSUFBQyxDQUFBLFFBQUQsQ0FBUyxDQUFDLGFBQVYsYUFBd0IsVUFBeEIsQ0FBakI7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxpQkFBVixDQUE0QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtBQUMzQyxjQUFBO1VBQUEsSUFBRyxRQUFBLEtBQVksQ0FBZjttQkFDRSxLQUFDLENBQUEsT0FBRCxDQUFTLElBQVQsRUFERjtXQUFBLE1BQUE7WUFHRSxLQUFLLENBQUMsSUFBTixDQUFXLElBQVg7WUFDQSxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxFQUFYO1lBQ1AsS0FBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsWUFBZCxFQUE0QixJQUE1QjtZQUNBLElBQUcsS0FBSyxDQUFDLE1BQU4sSUFBZ0IsUUFBbkI7cUJBQ0UsS0FBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULEVBREY7YUFORjs7UUFEMkM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVCLENBQWpCO2FBVUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsYUFBbkIsRUFDZjtRQUFBLGFBQUEsRUFBZSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEtBQUQ7WUFDYixLQUFLLENBQUMsd0JBQU4sQ0FBQTttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFBO1VBRmE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWY7UUFHQSxjQUFBLEVBQWdCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsS0FBRDtZQUNkLEtBQUssQ0FBQyx3QkFBTixDQUFBO21CQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsS0FBSyxDQUFDLElBQU4sQ0FBVyxFQUFYLENBQVQ7VUFGYztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIaEI7T0FEZSxDQUFqQjtJQWpCSzs7b0JBeUJQLE9BQUEsR0FBUyxTQUFDLElBQUQ7QUFDUCxVQUFBOztZQUFZLENBQUUsT0FBZCxDQUFBOzthQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGFBQWQsRUFBNkIsSUFBN0I7SUFGTzs7b0JBSVQsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBOztZQUFZLENBQUUsT0FBZCxDQUFBOzthQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFlBQWQ7SUFGTTs7Ozs7QUE5Q1YiLCJzb3VyY2VzQ29udGVudCI6WyJ7RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBJbnB1dFxuICBvbkRpZENoYW5nZTogKGZuKSAtPiBAZW1pdHRlci5vbiAnZGlkLWNoYW5nZScsIGZuXG4gIG9uRGlkQ29uZmlybTogKGZuKSAtPiBAZW1pdHRlci5vbiAnZGlkLWNvbmZpcm0nLCBmblxuICBvbkRpZENhbmNlbDogKGZuKSAtPiBAZW1pdHRlci5vbiAnZGlkLWNhbmNlbCcsIGZuXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuICAgIEB2aW1TdGF0ZS5vbkRpZEZhaWxUb1B1c2hUb09wZXJhdGlvblN0YWNrID0+XG4gICAgICBAY2FuY2VsKClcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG5cbiAgZGVzdHJveTogLT5cbiAgICB7QHZpbVN0YXRlfSA9IHt9XG5cbiAgZm9jdXM6IChjaGFyc01heD0xLCBoaWRlQ3Vyc29yKSAtPlxuICAgIGNoYXJzID0gW11cblxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBjbGFzc05hbWVzID0gW1widmltLW1vZGUtcGx1cy1pbnB1dC1jaGFyLXdhaXRpbmdcIiwgIFwiaXMtZm9jdXNlZFwiXVxuICAgIGNsYXNzTmFtZXMucHVzaCgnaGlkZS1jdXJzb3InKSBpZiBoaWRlQ3Vyc29yXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAdmltU3RhdGUuc3dhcENsYXNzTmFtZShjbGFzc05hbWVzLi4uKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLm9uRGlkU2V0SW5wdXRDaGFyIChjaGFyKSA9PlxuICAgICAgaWYgY2hhcnNNYXggaXMgMVxuICAgICAgICBAY29uZmlybShjaGFyKVxuICAgICAgZWxzZVxuICAgICAgICBjaGFycy5wdXNoKGNoYXIpXG4gICAgICAgIHRleHQgPSBjaGFycy5qb2luKCcnKVxuICAgICAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlJywgdGV4dClcbiAgICAgICAgaWYgY2hhcnMubGVuZ3RoID49IGNoYXJzTWF4XG4gICAgICAgICAgQGNvbmZpcm0odGV4dClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgQGVkaXRvckVsZW1lbnQsXG4gICAgICAnY29yZTpjYW5jZWwnOiAoZXZlbnQpID0+XG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgIEBjYW5jZWwoKVxuICAgICAgJ2NvcmU6Y29uZmlybSc6IChldmVudCkgPT5cbiAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgICAgQGNvbmZpcm0oY2hhcnMuam9pbignJykpXG5cbiAgY29uZmlybTogKGNoYXIpIC0+XG4gICAgQGRpc3Bvc2FibGVzPy5kaXNwb3NlKClcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY29uZmlybScsIGNoYXIpXG5cbiAgY2FuY2VsOiAtPlxuICAgIEBkaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNhbmNlbCcpXG4iXX0=
