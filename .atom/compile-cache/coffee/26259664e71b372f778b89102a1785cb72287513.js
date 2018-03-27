(function() {
  var CompositeDisposable, Disposable, Emitter, SearchInput, ref,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  module.exports = SearchInput = (function() {
    SearchInput.prototype.literalModeDeactivator = null;

    SearchInput.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    SearchInput.prototype.onDidConfirm = function(fn) {
      return this.emitter.on('did-confirm', fn);
    };

    SearchInput.prototype.onDidCancel = function(fn) {
      return this.emitter.on('did-cancel', fn);
    };

    SearchInput.prototype.onDidCommand = function(fn) {
      return this.emitter.on('did-command', fn);
    };

    function SearchInput(vimState) {
      var editorContainer, optionsContainer, ref1;
      this.vimState = vimState;
      this.emitter = new Emitter;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.container = document.createElement('div');
      this.container.className = 'vim-mode-plus-search-container';
      this.container.innerHTML = "<div class='options-container'>\n  <span class='inline-block-tight btn btn-primary'>.*</span>\n</div>\n<div class='editor-container'>\n</div>";
      ref1 = this.container.getElementsByTagName('div'), optionsContainer = ref1[0], editorContainer = ref1[1];
      this.regexSearchStatus = optionsContainer.firstElementChild;
      this.editor = atom.workspace.buildTextEditor({
        mini: true
      });
      this.editorElement = this.editor.element;
      this.editorElement.classList.add('vim-mode-plus-search');
      editorContainer.appendChild(this.editorElement);
      this.editor.onDidChange((function(_this) {
        return function() {
          if (_this.finished) {
            return;
          }
          return _this.emitter.emit('did-change', _this.editor.getText());
        };
      })(this));
      this.panel = atom.workspace.addBottomPanel({
        item: this.container,
        visible: false
      });
      this.vimState.onDidFailToPushToOperationStack((function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      this.registerCommands();
    }

    SearchInput.prototype.destroy = function() {
      var ref1, ref2;
      this.disposables.dispose();
      this.editor.destroy();
      if ((ref1 = this.panel) != null) {
        ref1.destroy();
      }
      return ref2 = {}, this.editor = ref2.editor, this.panel = ref2.panel, this.editorElement = ref2.editorElement, this.vimState = ref2.vimState, ref2;
    };

    SearchInput.prototype.handleEvents = function() {
      return atom.commands.add(this.editorElement, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        'core:backspace': (function(_this) {
          return function() {
            return _this.backspace();
          };
        })(this),
        'vim-mode-plus:input-cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this)
      });
    };

    SearchInput.prototype.focus = function(options1) {
      var cancel, ref1;
      this.options = options1 != null ? options1 : {};
      this.finished = false;
      if (this.options.classList != null) {
        (ref1 = this.editorElement.classList).add.apply(ref1, this.options.classList);
      }
      this.panel.show();
      this.editorElement.focus();
      this.focusSubscriptions = new CompositeDisposable;
      this.focusSubscriptions.add(this.handleEvents());
      cancel = this.cancel.bind(this);
      this.vimState.editorElement.addEventListener('click', cancel);
      this.focusSubscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.vimState.editorElement.removeEventListener('click', cancel);
        };
      })(this)));
      return this.focusSubscriptions.add(atom.workspace.onDidChangeActivePaneItem(cancel));
    };

    SearchInput.prototype.unfocus = function() {
      var ref1, ref2, ref3, ref4, ref5;
      this.finished = true;
      if (((ref1 = this.options) != null ? ref1.classList : void 0) != null) {
        (ref2 = this.editorElement.classList).remove.apply(ref2, this.options.classList);
      }
      this.regexSearchStatus.classList.add('btn-primary');
      if ((ref3 = this.literalModeDeactivator) != null) {
        ref3.dispose();
      }
      if ((ref4 = this.focusSubscriptions) != null) {
        ref4.dispose();
      }
      atom.workspace.getActivePane().activate();
      this.editor.setText('');
      return (ref5 = this.panel) != null ? ref5.hide() : void 0;
    };

    SearchInput.prototype.updateOptionSettings = function(arg) {
      var useRegexp;
      useRegexp = (arg != null ? arg : {}).useRegexp;
      return this.regexSearchStatus.classList.toggle('btn-primary', useRegexp);
    };

    SearchInput.prototype.setCursorWord = function() {
      return this.editor.insertText(this.vimState.editor.getWordUnderCursor());
    };

    SearchInput.prototype.activateLiteralMode = function() {
      if (this.literalModeDeactivator != null) {
        return this.literalModeDeactivator.dispose();
      } else {
        this.literalModeDeactivator = new CompositeDisposable();
        this.editorElement.classList.add('literal-mode');
        return this.literalModeDeactivator.add(new Disposable((function(_this) {
          return function() {
            _this.editorElement.classList.remove('literal-mode');
            return _this.literalModeDeactivator = null;
          };
        })(this)));
      }
    };

    SearchInput.prototype.isVisible = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.isVisible() : void 0;
    };

    SearchInput.prototype.cancel = function() {
      if (this.finished) {
        return;
      }
      this.emitter.emit('did-cancel');
      return this.unfocus();
    };

    SearchInput.prototype.backspace = function() {
      if (this.editor.getText().length === 0) {
        return this.cancel();
      }
    };

    SearchInput.prototype.confirm = function(landingPoint) {
      if (landingPoint == null) {
        landingPoint = null;
      }
      this.emitter.emit('did-confirm', {
        input: this.editor.getText(),
        landingPoint: landingPoint
      });
      return this.unfocus();
    };

    SearchInput.prototype.stopPropagation = function(oldCommands) {
      var fn, fn1, name, newCommands;
      newCommands = {};
      fn1 = function(fn) {
        var commandName;
        if (indexOf.call(name, ':') >= 0) {
          commandName = name;
        } else {
          commandName = "vim-mode-plus:" + name;
        }
        return newCommands[commandName] = function(event) {
          event.stopImmediatePropagation();
          return fn(event);
        };
      };
      for (name in oldCommands) {
        fn = oldCommands[name];
        fn1(fn);
      }
      return newCommands;
    };

    SearchInput.prototype.emitDidCommand = function(name, options) {
      if (options == null) {
        options = {};
      }
      options.name = name;
      options.input = this.editor.getText();
      return this.emitter.emit('did-command', options);
    };

    SearchInput.prototype.registerCommands = function() {
      return atom.commands.add(this.editorElement, this.stopPropagation({
        "search-confirm": (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        "search-land-to-start": (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        "search-land-to-end": (function(_this) {
          return function() {
            return _this.confirm('end');
          };
        })(this),
        "search-cancel": (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        "search-visit-next": (function(_this) {
          return function() {
            return _this.emitDidCommand('visit', {
              direction: 'next'
            });
          };
        })(this),
        "search-visit-prev": (function(_this) {
          return function() {
            return _this.emitDidCommand('visit', {
              direction: 'prev'
            });
          };
        })(this),
        "select-occurrence-from-search": (function(_this) {
          return function() {
            return _this.emitDidCommand('occurrence', {
              operation: 'SelectOccurrence'
            });
          };
        })(this),
        "change-occurrence-from-search": (function(_this) {
          return function() {
            return _this.emitDidCommand('occurrence', {
              operation: 'ChangeOccurrence'
            });
          };
        })(this),
        "add-occurrence-pattern-from-search": (function(_this) {
          return function() {
            return _this.emitDidCommand('occurrence');
          };
        })(this),
        "project-find-from-search": (function(_this) {
          return function() {
            return _this.emitDidCommand('project-find');
          };
        })(this),
        "search-insert-wild-pattern": (function(_this) {
          return function() {
            return _this.editor.insertText('.*?');
          };
        })(this),
        "search-activate-literal-mode": (function(_this) {
          return function() {
            return _this.activateLiteralMode();
          };
        })(this),
        "search-set-cursor-word": (function(_this) {
          return function() {
            return _this.setCursorWord();
          };
        })(this),
        'core:move-up': (function(_this) {
          return function() {
            return _this.editor.setText(_this.vimState.searchHistory.get('prev'));
          };
        })(this),
        'core:move-down': (function(_this) {
          return function() {
            return _this.editor.setText(_this.vimState.searchHistory.get('next'));
          };
        })(this)
      }));
    };

    return SearchInput;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2VhcmNoLWlucHV0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMERBQUE7SUFBQTs7RUFBQSxNQUE2QyxPQUFBLENBQVEsTUFBUixDQUE3QyxFQUFDLHFCQUFELEVBQVUsMkJBQVYsRUFBc0I7O0VBRXRCLE1BQU0sQ0FBQyxPQUFQLEdBQ007MEJBQ0osc0JBQUEsR0FBd0I7OzBCQUV4QixXQUFBLEdBQWEsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQjtJQUFSOzswQkFDYixZQUFBLEdBQWMsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksYUFBWixFQUEyQixFQUEzQjtJQUFSOzswQkFDZCxXQUFBLEdBQWEsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQjtJQUFSOzswQkFDYixZQUFBLEdBQWMsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksYUFBWixFQUEyQixFQUEzQjtJQUFSOztJQUVELHFCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXZCLENBQWpCO01BRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNi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QSxDQWhCaEI7UUFpQkEsZ0JBQUEsRUFBa0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBZ0IsS0FBQyxDQUFBLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBeEIsQ0FBNEIsTUFBNUIsQ0FBaEI7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FqQmxCO09BRGdDLENBQWxDO0lBRGdCOzs7OztBQXhJcEIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RW1pdHRlciwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTZWFyY2hJbnB1dFxuICBsaXRlcmFsTW9kZURlYWN0aXZhdG9yOiBudWxsXG5cbiAgb25EaWRDaGFuZ2U6IChmbikgLT4gQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UnLCBmblxuICBvbkRpZENvbmZpcm06IChmbikgLT4gQGVtaXR0ZXIub24gJ2RpZC1jb25maXJtJywgZm5cbiAgb25EaWRDYW5jZWw6IChmbikgLT4gQGVtaXR0ZXIub24gJ2RpZC1jYW5jZWwnLCBmblxuICBvbkRpZENvbW1hbmQ6IChmbikgLT4gQGVtaXR0ZXIub24gJ2RpZC1jb21tYW5kJywgZm5cblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcblxuICAgIEBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIEBjb250YWluZXIuY2xhc3NOYW1lID0gJ3ZpbS1tb2RlLXBsdXMtc2VhcmNoLWNvbnRhaW5lcidcbiAgICBAY29udGFpbmVyLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz0nb3B0aW9ucy1jb250YWluZXInPlxuICAgICAgICA8c3BhbiBjbGFzcz0naW5saW5lLWJsb2NrLXRpZ2h0IGJ0biBidG4tcHJpbWFyeSc+Lio8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2VkaXRvci1jb250YWluZXInPlxuICAgICAgPC9kaXY+XG4gICAgICBcIlwiXCJcblxuICAgIFtvcHRpb25zQ29udGFpbmVyLCBlZGl0b3JDb250YWluZXJdID0gQGNvbnRhaW5lci5nZXRFbGVtZW50c0J5VGFnTmFtZSgnZGl2JylcbiAgICBAcmVnZXhTZWFyY2hTdGF0dXMgPSBvcHRpb25zQ29udGFpbmVyLmZpcnN0RWxlbWVudENoaWxkXG4gICAgQGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcihtaW5pOiB0cnVlKVxuICAgIEBlZGl0b3JFbGVtZW50ID0gQGVkaXRvci5lbGVtZW50XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgndmltLW1vZGUtcGx1cy1zZWFyY2gnKVxuICAgIGVkaXRvckNvbnRhaW5lci5hcHBlbmRDaGlsZChAZWRpdG9yRWxlbWVudClcbiAgICBAZWRpdG9yLm9uRGlkQ2hhbmdlID0+XG4gICAgICByZXR1cm4gaWYgQGZpbmlzaGVkXG4gICAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlJywgQGVkaXRvci5nZXRUZXh0KCkpXG5cbiAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiBAY29udGFpbmVyLCB2aXNpYmxlOiBmYWxzZSlcblxuICAgIEB2aW1TdGF0ZS5vbkRpZEZhaWxUb1B1c2hUb09wZXJhdGlvblN0YWNrID0+XG4gICAgICBAY2FuY2VsKClcblxuICAgIEByZWdpc3RlckNvbW1hbmRzKClcblxuICBkZXN0cm95OiAtPlxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAZWRpdG9yLmRlc3Ryb3koKVxuICAgIEBwYW5lbD8uZGVzdHJveSgpXG4gICAge0BlZGl0b3IsIEBwYW5lbCwgQGVkaXRvckVsZW1lbnQsIEB2aW1TdGF0ZX0gPSB7fVxuXG4gIGhhbmRsZUV2ZW50czogLT5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBAZWRpdG9yRWxlbWVudCxcbiAgICAgICdjb3JlOmNvbmZpcm0nOiA9PiBAY29uZmlybSgpXG4gICAgICAnY29yZTpjYW5jZWwnOiA9PiBAY2FuY2VsKClcbiAgICAgICdjb3JlOmJhY2tzcGFjZSc6ID0+IEBiYWNrc3BhY2UoKVxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6aW5wdXQtY2FuY2VsJzogPT4gQGNhbmNlbCgpXG5cbiAgZm9jdXM6IChAb3B0aW9ucz17fSkgLT5cbiAgICBAZmluaXNoZWQgPSBmYWxzZVxuXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChAb3B0aW9ucy5jbGFzc0xpc3QuLi4pIGlmIEBvcHRpb25zLmNsYXNzTGlzdD9cbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQGVkaXRvckVsZW1lbnQuZm9jdXMoKVxuXG4gICAgQGZvY3VzU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGZvY3VzU3Vic2NyaXB0aW9ucy5hZGQgQGhhbmRsZUV2ZW50cygpXG4gICAgY2FuY2VsID0gQGNhbmNlbC5iaW5kKHRoaXMpXG4gICAgQHZpbVN0YXRlLmVkaXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYW5jZWwpXG4gICAgIyBDYW5jZWwgb24gbW91c2UgY2xpY2tcbiAgICBAZm9jdXNTdWJzY3JpcHRpb25zLmFkZCBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQHZpbVN0YXRlLmVkaXRvckVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYW5jZWwpXG5cbiAgICAjIENhbmNlbCBvbiB0YWIgc3dpdGNoXG4gICAgQGZvY3VzU3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbShjYW5jZWwpKVxuXG4gIHVuZm9jdXM6IC0+XG4gICAgQGZpbmlzaGVkID0gdHJ1ZVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQG9wdGlvbnMuY2xhc3NMaXN0Li4uKSBpZiBAb3B0aW9ucz8uY2xhc3NMaXN0P1xuICAgIEByZWdleFNlYXJjaFN0YXR1cy5jbGFzc0xpc3QuYWRkICdidG4tcHJpbWFyeSdcbiAgICBAbGl0ZXJhbE1vZGVEZWFjdGl2YXRvcj8uZGlzcG9zZSgpXG5cbiAgICBAZm9jdXNTdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKVxuICAgIEBlZGl0b3Iuc2V0VGV4dCAnJ1xuICAgIEBwYW5lbD8uaGlkZSgpXG5cbiAgdXBkYXRlT3B0aW9uU2V0dGluZ3M6ICh7dXNlUmVnZXhwfT17fSkgLT5cbiAgICBAcmVnZXhTZWFyY2hTdGF0dXMuY2xhc3NMaXN0LnRvZ2dsZSgnYnRuLXByaW1hcnknLCB1c2VSZWdleHApXG5cbiAgc2V0Q3Vyc29yV29yZDogLT5cbiAgICBAZWRpdG9yLmluc2VydFRleHQoQHZpbVN0YXRlLmVkaXRvci5nZXRXb3JkVW5kZXJDdXJzb3IoKSlcblxuICBhY3RpdmF0ZUxpdGVyYWxNb2RlOiAtPlxuICAgIGlmIEBsaXRlcmFsTW9kZURlYWN0aXZhdG9yP1xuICAgICAgQGxpdGVyYWxNb2RlRGVhY3RpdmF0b3IuZGlzcG9zZSgpXG4gICAgZWxzZVxuICAgICAgQGxpdGVyYWxNb2RlRGVhY3RpdmF0b3IgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdsaXRlcmFsLW1vZGUnKVxuXG4gICAgICBAbGl0ZXJhbE1vZGVEZWFjdGl2YXRvci5hZGQgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnbGl0ZXJhbC1tb2RlJylcbiAgICAgICAgQGxpdGVyYWxNb2RlRGVhY3RpdmF0b3IgPSBudWxsXG5cbiAgaXNWaXNpYmxlOiAtPlxuICAgIEBwYW5lbD8uaXNWaXNpYmxlKClcblxuICBjYW5jZWw6IC0+XG4gICAgcmV0dXJuIGlmIEBmaW5pc2hlZFxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jYW5jZWwnKVxuICAgIEB1bmZvY3VzKClcblxuICBiYWNrc3BhY2U6IC0+XG4gICAgQGNhbmNlbCgpIGlmIEBlZGl0b3IuZ2V0VGV4dCgpLmxlbmd0aCBpcyAwXG5cbiAgY29uZmlybTogKGxhbmRpbmdQb2ludD1udWxsKSAtPlxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jb25maXJtJywge2lucHV0OiBAZWRpdG9yLmdldFRleHQoKSwgbGFuZGluZ1BvaW50fSlcbiAgICBAdW5mb2N1cygpXG5cbiAgc3RvcFByb3BhZ2F0aW9uOiAob2xkQ29tbWFuZHMpIC0+XG4gICAgbmV3Q29tbWFuZHMgPSB7fVxuICAgIGZvciBuYW1lLCBmbiBvZiBvbGRDb21tYW5kc1xuICAgICAgZG8gKGZuKSAtPlxuICAgICAgICBpZiAnOicgaW4gbmFtZVxuICAgICAgICAgIGNvbW1hbmROYW1lID0gbmFtZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgY29tbWFuZE5hbWUgPSBcInZpbS1tb2RlLXBsdXM6I3tuYW1lfVwiXG4gICAgICAgIG5ld0NvbW1hbmRzW2NvbW1hbmROYW1lXSA9IChldmVudCkgLT5cbiAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgICAgIGZuKGV2ZW50KVxuICAgIG5ld0NvbW1hbmRzXG5cblxuICBlbWl0RGlkQ29tbWFuZDogKG5hbWUsIG9wdGlvbnM9e30pIC0+XG4gICAgb3B0aW9ucy5uYW1lID0gbmFtZVxuICAgIG9wdGlvbnMuaW5wdXQgPSBAZWRpdG9yLmdldFRleHQoKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jb21tYW5kJywgb3B0aW9ucylcblxuICByZWdpc3RlckNvbW1hbmRzOiAtPlxuICAgIGF0b20uY29tbWFuZHMuYWRkIEBlZGl0b3JFbGVtZW50LCBAc3RvcFByb3BhZ2F0aW9uKFxuICAgICAgXCJzZWFyY2gtY29uZmlybVwiOiA9PiBAY29uZmlybSgpXG4gICAgICBcInNlYXJjaC1sYW5kLXRvLXN0YXJ0XCI6ID0+IEBjb25maXJtKClcbiAgICAgIFwic2VhcmNoLWxhbmQtdG8tZW5kXCI6ID0+IEBjb25maXJtKCdlbmQnKVxuICAgICAgXCJzZWFyY2gtY2FuY2VsXCI6ID0+IEBjYW5jZWwoKVxuXG4gICAgICBcInNlYXJjaC12aXNpdC1uZXh0XCI6ID0+IEBlbWl0RGlkQ29tbWFuZCgndmlzaXQnLCBkaXJlY3Rpb246ICduZXh0JylcbiAgICAgIFwic2VhcmNoLXZpc2l0LXByZXZcIjogPT4gQGVtaXREaWRDb21tYW5kKCd2aXNpdCcsIGRpcmVjdGlvbjogJ3ByZXYnKVxuXG4gICAgICBcInNlbGVjdC1vY2N1cnJlbmNlLWZyb20tc2VhcmNoXCI6ID0+IEBlbWl0RGlkQ29tbWFuZCgnb2NjdXJyZW5jZScsIG9wZXJhdGlvbjogJ1NlbGVjdE9jY3VycmVuY2UnKVxuICAgICAgXCJjaGFuZ2Utb2NjdXJyZW5jZS1mcm9tLXNlYXJjaFwiOiA9PiBAZW1pdERpZENvbW1hbmQoJ29jY3VycmVuY2UnLCBvcGVyYXRpb246ICdDaGFuZ2VPY2N1cnJlbmNlJylcbiAgICAgIFwiYWRkLW9jY3VycmVuY2UtcGF0dGVybi1mcm9tLXNlYXJjaFwiOiA9PiBAZW1pdERpZENvbW1hbmQoJ29jY3VycmVuY2UnKVxuICAgICAgXCJwcm9qZWN0LWZpbmQtZnJvbS1zZWFyY2hcIjogPT4gQGVtaXREaWRDb21tYW5kKCdwcm9qZWN0LWZpbmQnKVxuXG4gICAgICBcInNlYXJjaC1pbnNlcnQtd2lsZC1wYXR0ZXJuXCI6ID0+IEBlZGl0b3IuaW5zZXJ0VGV4dCgnLio/JylcbiAgICAgIFwic2VhcmNoLWFjdGl2YXRlLWxpdGVyYWwtbW9kZVwiOiA9PiBAYWN0aXZhdGVMaXRlcmFsTW9kZSgpXG4gICAgICBcInNlYXJjaC1zZXQtY3Vyc29yLXdvcmRcIjogPT4gQHNldEN1cnNvcldvcmQoKVxuICAgICAgJ2NvcmU6bW92ZS11cCc6ID0+IEBlZGl0b3Iuc2V0VGV4dCBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5nZXQoJ3ByZXYnKVxuICAgICAgJ2NvcmU6bW92ZS1kb3duJzogPT4gQGVkaXRvci5zZXRUZXh0IEB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LmdldCgnbmV4dCcpXG4gICAgKVxuIl19
