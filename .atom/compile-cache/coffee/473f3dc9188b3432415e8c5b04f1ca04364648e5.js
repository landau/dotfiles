(function() {
  var CompositeDisposable, Disposable, Emitter, SearchInput, ref, registerElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  registerElement = require('./utils').registerElement;

  SearchInput = (function(superClass) {
    extend(SearchInput, superClass);

    function SearchInput() {
      return SearchInput.__super__.constructor.apply(this, arguments);
    }

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

    SearchInput.prototype.createdCallback = function() {
      var editorContainer, optionsContainer, ref1;
      this.className = "vim-mode-plus-search-container";
      this.emitter = new Emitter;
      this.innerHTML = "<div class='options-container'>\n  <span class='inline-block-tight btn btn-primary'>.*</span>\n</div>\n<div class='editor-container'>\n  <atom-text-editor mini class='editor vim-mode-plus-search'></atom-text-editor>\n</div>";
      ref1 = this.getElementsByTagName('div'), optionsContainer = ref1[0], editorContainer = ref1[1];
      this.regexSearchStatus = optionsContainer.firstElementChild;
      this.editorElement = editorContainer.firstElementChild;
      this.editor = this.editorElement.getModel();
      this.editor.setMini(true);
      this.editor.onDidChange((function(_this) {
        return function() {
          if (_this.finished) {
            return;
          }
          return _this.emitter.emit('did-change', _this.editor.getText());
        };
      })(this));
      this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
      return this;
    };

    SearchInput.prototype.destroy = function() {
      var ref1, ref2;
      this.disposables.dispose();
      this.editor.destroy();
      if ((ref1 = this.panel) != null) {
        ref1.destroy();
      }
      ref2 = {}, this.editor = ref2.editor, this.panel = ref2.panel, this.editorElement = ref2.editorElement, this.vimState = ref2.vimState;
      return this.remove();
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

    SearchInput.prototype.initialize = function(vimState) {
      this.vimState = vimState;
      this.vimState.onDidFailToPushToOperationStack((function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.registerCommands();
      return this;
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

  })(HTMLElement);

  module.exports = registerElement('vim-mode-plus-search-input', {
    prototype: SearchInput.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2VhcmNoLWlucHV0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMkVBQUE7SUFBQTs7OztFQUFBLE1BQTZDLE9BQUEsQ0FBUSxNQUFSLENBQTdDLEVBQUMscUJBQUQsRUFBVSwyQkFBVixFQUFzQjs7RUFDckIsa0JBQW1CLE9BQUEsQ0FBUSxTQUFSOztFQUVkOzs7Ozs7OzBCQUNKLHNCQUFBLEdBQXdCOzswQkFFeEIsV0FBQSxHQUFhLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsRUFBMUI7SUFBUjs7MEJBQ2IsWUFBQSxHQUFjLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGFBQVosRUFBMkIsRUFBM0I7SUFBUjs7MEJBQ2QsV0FBQSxHQUFhLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsRUFBMUI7SUFBUjs7MEJBQ2IsWUFBQSxHQUFjLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGFBQVosRUFBMkIsRUFBM0I7SUFBUjs7MEJBRWQsZUFBQSxHQUFpQixTQUFBO0FBQ2YsVUFBQTtNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWE7TUFDYixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFFZixJQUFDLENBQUEsU0FBRCxHQUFhO01BUWIsT0FBc0MsSUFBQyxDQUFBLG9CQUFELENBQXNCLEtBQXRCLENBQXRDLEVBQUMsMEJBQUQsRUFBbUI7TUFDbkIsSUFBQyxDQUFBLGlCQUFELEdBQXFCLGdCQUFnQixDQUFDO01BQ3RDLElBQUMsQ0FBQSxhQUFELEdBQWlCLGVBQWUsQ0FBQztNQUNqQyxJQUFD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LGFBQWEsQ0FBQyxHQUF4QixDQUE0QixNQUE1QixDQUFoQjtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQWpCbEI7T0FEZ0MsQ0FBbEM7SUFEZ0I7Ozs7S0F4SU07O0VBOEoxQixNQUFNLENBQUMsT0FBUCxHQUFpQixlQUFBLENBQWdCLDRCQUFoQixFQUNmO0lBQUEsU0FBQSxFQUFXLFdBQVcsQ0FBQyxTQUF2QjtHQURlO0FBaktqQiIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyLCBEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57cmVnaXN0ZXJFbGVtZW50fSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIFNlYXJjaElucHV0IGV4dGVuZHMgSFRNTEVsZW1lbnRcbiAgbGl0ZXJhbE1vZGVEZWFjdGl2YXRvcjogbnVsbFxuXG4gIG9uRGlkQ2hhbmdlOiAoZm4pIC0+IEBlbWl0dGVyLm9uICdkaWQtY2hhbmdlJywgZm5cbiAgb25EaWRDb25maXJtOiAoZm4pIC0+IEBlbWl0dGVyLm9uICdkaWQtY29uZmlybScsIGZuXG4gIG9uRGlkQ2FuY2VsOiAoZm4pIC0+IEBlbWl0dGVyLm9uICdkaWQtY2FuY2VsJywgZm5cbiAgb25EaWRDb21tYW5kOiAoZm4pIC0+IEBlbWl0dGVyLm9uICdkaWQtY29tbWFuZCcsIGZuXG5cbiAgY3JlYXRlZENhbGxiYWNrOiAtPlxuICAgIEBjbGFzc05hbWUgPSBcInZpbS1tb2RlLXBsdXMtc2VhcmNoLWNvbnRhaW5lclwiXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgQGlubmVySFRNTCA9IFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9J29wdGlvbnMtY29udGFpbmVyJz5cbiAgICAgIDxzcGFuIGNsYXNzPSdpbmxpbmUtYmxvY2stdGlnaHQgYnRuIGJ0bi1wcmltYXJ5Jz4uKjwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPSdlZGl0b3ItY29udGFpbmVyJz5cbiAgICAgIDxhdG9tLXRleHQtZWRpdG9yIG1pbmkgY2xhc3M9J2VkaXRvciB2aW0tbW9kZS1wbHVzLXNlYXJjaCc+PC9hdG9tLXRleHQtZWRpdG9yPlxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICAgIFtvcHRpb25zQ29udGFpbmVyLCBlZGl0b3JDb250YWluZXJdID0gQGdldEVsZW1lbnRzQnlUYWdOYW1lKCdkaXYnKVxuICAgIEByZWdleFNlYXJjaFN0YXR1cyA9IG9wdGlvbnNDb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGRcbiAgICBAZWRpdG9yRWxlbWVudCA9IGVkaXRvckNvbnRhaW5lci5maXJzdEVsZW1lbnRDaGlsZFxuICAgIEBlZGl0b3IgPSBAZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpXG4gICAgQGVkaXRvci5zZXRNaW5pKHRydWUpXG5cbiAgICBAZWRpdG9yLm9uRGlkQ2hhbmdlID0+XG4gICAgICByZXR1cm4gaWYgQGZpbmlzaGVkXG4gICAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlJywgQGVkaXRvci5nZXRUZXh0KCkpXG5cbiAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSlcbiAgICB0aGlzXG5cbiAgZGVzdHJveTogLT5cbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQGVkaXRvci5kZXN0cm95KClcbiAgICBAcGFuZWw/LmRlc3Ryb3koKVxuICAgIHtAZWRpdG9yLCBAcGFuZWwsIEBlZGl0b3JFbGVtZW50LCBAdmltU3RhdGV9ID0ge31cbiAgICBAcmVtb3ZlKClcblxuICBoYW5kbGVFdmVudHM6IC0+XG4gICAgYXRvbS5jb21tYW5kcy5hZGQgQGVkaXRvckVsZW1lbnQsXG4gICAgICAnY29yZTpjb25maXJtJzogPT4gQGNvbmZpcm0oKVxuICAgICAgJ2NvcmU6Y2FuY2VsJzogPT4gQGNhbmNlbCgpXG4gICAgICAnY29yZTpiYWNrc3BhY2UnOiA9PiBAYmFja3NwYWNlKClcbiAgICAgICd2aW0tbW9kZS1wbHVzOmlucHV0LWNhbmNlbCc6ID0+IEBjYW5jZWwoKVxuXG4gIGZvY3VzOiAoQG9wdGlvbnM9e30pIC0+XG4gICAgQGZpbmlzaGVkID0gZmFsc2VcblxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoQG9wdGlvbnMuY2xhc3NMaXN0Li4uKSBpZiBAb3B0aW9ucy5jbGFzc0xpc3Q/XG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBlZGl0b3JFbGVtZW50LmZvY3VzKClcblxuICAgIEBmb2N1c1N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBmb2N1c1N1YnNjcmlwdGlvbnMuYWRkIEBoYW5kbGVFdmVudHMoKVxuICAgIGNhbmNlbCA9IEBjYW5jZWwuYmluZCh0aGlzKVxuICAgIEB2aW1TdGF0ZS5lZGl0b3JFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FuY2VsKVxuICAgICMgQ2FuY2VsIG9uIG1vdXNlIGNsaWNrXG4gICAgQGZvY3VzU3Vic2NyaXB0aW9ucy5hZGQgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEB2aW1TdGF0ZS5lZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FuY2VsKVxuXG4gICAgIyBDYW5jZWwgb24gdGFiIHN3aXRjaFxuICAgIEBmb2N1c1N1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0oY2FuY2VsKSlcblxuICB1bmZvY3VzOiAtPlxuICAgIEBmaW5pc2hlZCA9IHRydWVcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKEBvcHRpb25zLmNsYXNzTGlzdC4uLikgaWYgQG9wdGlvbnM/LmNsYXNzTGlzdD9cbiAgICBAcmVnZXhTZWFyY2hTdGF0dXMuY2xhc3NMaXN0LmFkZCAnYnRuLXByaW1hcnknXG4gICAgQGxpdGVyYWxNb2RlRGVhY3RpdmF0b3I/LmRpc3Bvc2UoKVxuXG4gICAgQGZvY3VzU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlKClcbiAgICBAZWRpdG9yLnNldFRleHQgJydcbiAgICBAcGFuZWw/LmhpZGUoKVxuXG4gIHVwZGF0ZU9wdGlvblNldHRpbmdzOiAoe3VzZVJlZ2V4cH09e30pIC0+XG4gICAgQHJlZ2V4U2VhcmNoU3RhdHVzLmNsYXNzTGlzdC50b2dnbGUoJ2J0bi1wcmltYXJ5JywgdXNlUmVnZXhwKVxuXG4gIHNldEN1cnNvcldvcmQ6IC0+XG4gICAgQGVkaXRvci5pbnNlcnRUZXh0KEB2aW1TdGF0ZS5lZGl0b3IuZ2V0V29yZFVuZGVyQ3Vyc29yKCkpXG5cbiAgYWN0aXZhdGVMaXRlcmFsTW9kZTogLT5cbiAgICBpZiBAbGl0ZXJhbE1vZGVEZWFjdGl2YXRvcj9cbiAgICAgIEBsaXRlcmFsTW9kZURlYWN0aXZhdG9yLmRpc3Bvc2UoKVxuICAgIGVsc2VcbiAgICAgIEBsaXRlcmFsTW9kZURlYWN0aXZhdG9yID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbGl0ZXJhbC1tb2RlJylcblxuICAgICAgQGxpdGVyYWxNb2RlRGVhY3RpdmF0b3IuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2xpdGVyYWwtbW9kZScpXG4gICAgICAgIEBsaXRlcmFsTW9kZURlYWN0aXZhdG9yID0gbnVsbFxuXG4gIGlzVmlzaWJsZTogLT5cbiAgICBAcGFuZWw/LmlzVmlzaWJsZSgpXG5cbiAgY2FuY2VsOiAtPlxuICAgIHJldHVybiBpZiBAZmluaXNoZWRcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2FuY2VsJylcbiAgICBAdW5mb2N1cygpXG5cbiAgYmFja3NwYWNlOiAtPlxuICAgIEBjYW5jZWwoKSBpZiBAZWRpdG9yLmdldFRleHQoKS5sZW5ndGggaXMgMFxuXG4gIGNvbmZpcm06IChsYW5kaW5nUG9pbnQ9bnVsbCkgLT5cbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY29uZmlybScsIHtpbnB1dDogQGVkaXRvci5nZXRUZXh0KCksIGxhbmRpbmdQb2ludH0pXG4gICAgQHVuZm9jdXMoKVxuXG4gIHN0b3BQcm9wYWdhdGlvbjogKG9sZENvbW1hbmRzKSAtPlxuICAgIG5ld0NvbW1hbmRzID0ge31cbiAgICBmb3IgbmFtZSwgZm4gb2Ygb2xkQ29tbWFuZHNcbiAgICAgIGRvIChmbikgLT5cbiAgICAgICAgaWYgJzonIGluIG5hbWVcbiAgICAgICAgICBjb21tYW5kTmFtZSA9IG5hbWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvbW1hbmROYW1lID0gXCJ2aW0tbW9kZS1wbHVzOiN7bmFtZX1cIlxuICAgICAgICBuZXdDb21tYW5kc1tjb21tYW5kTmFtZV0gPSAoZXZlbnQpIC0+XG4gICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgICAgICBmbihldmVudClcbiAgICBuZXdDb21tYW5kc1xuXG4gIGluaXRpYWxpemU6IChAdmltU3RhdGUpIC0+XG4gICAgQHZpbVN0YXRlLm9uRGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2sgPT5cbiAgICAgIEBjYW5jZWwoKVxuXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcblxuICAgIEByZWdpc3RlckNvbW1hbmRzKClcbiAgICB0aGlzXG5cbiAgZW1pdERpZENvbW1hbmQ6IChuYW1lLCBvcHRpb25zPXt9KSAtPlxuICAgIG9wdGlvbnMubmFtZSA9IG5hbWVcbiAgICBvcHRpb25zLmlucHV0ID0gQGVkaXRvci5nZXRUZXh0KClcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY29tbWFuZCcsIG9wdGlvbnMpXG5cbiAgcmVnaXN0ZXJDb21tYW5kczogLT5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBAZWRpdG9yRWxlbWVudCwgQHN0b3BQcm9wYWdhdGlvbihcbiAgICAgIFwic2VhcmNoLWNvbmZpcm1cIjogPT4gQGNvbmZpcm0oKVxuICAgICAgXCJzZWFyY2gtbGFuZC10by1zdGFydFwiOiA9PiBAY29uZmlybSgpXG4gICAgICBcInNlYXJjaC1sYW5kLXRvLWVuZFwiOiA9PiBAY29uZmlybSgnZW5kJylcbiAgICAgIFwic2VhcmNoLWNhbmNlbFwiOiA9PiBAY2FuY2VsKClcblxuICAgICAgXCJzZWFyY2gtdmlzaXQtbmV4dFwiOiA9PiBAZW1pdERpZENvbW1hbmQoJ3Zpc2l0JywgZGlyZWN0aW9uOiAnbmV4dCcpXG4gICAgICBcInNlYXJjaC12aXNpdC1wcmV2XCI6ID0+IEBlbWl0RGlkQ29tbWFuZCgndmlzaXQnLCBkaXJlY3Rpb246ICdwcmV2JylcblxuICAgICAgXCJzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaFwiOiA9PiBAZW1pdERpZENvbW1hbmQoJ29jY3VycmVuY2UnLCBvcGVyYXRpb246ICdTZWxlY3RPY2N1cnJlbmNlJylcbiAgICAgIFwiY2hhbmdlLW9jY3VycmVuY2UtZnJvbS1zZWFyY2hcIjogPT4gQGVtaXREaWRDb21tYW5kKCdvY2N1cnJlbmNlJywgb3BlcmF0aW9uOiAnQ2hhbmdlT2NjdXJyZW5jZScpXG4gICAgICBcImFkZC1vY2N1cnJlbmNlLXBhdHRlcm4tZnJvbS1zZWFyY2hcIjogPT4gQGVtaXREaWRDb21tYW5kKCdvY2N1cnJlbmNlJylcbiAgICAgIFwicHJvamVjdC1maW5kLWZyb20tc2VhcmNoXCI6ID0+IEBlbWl0RGlkQ29tbWFuZCgncHJvamVjdC1maW5kJylcblxuICAgICAgXCJzZWFyY2gtaW5zZXJ0LXdpbGQtcGF0dGVyblwiOiA9PiBAZWRpdG9yLmluc2VydFRleHQoJy4qPycpXG4gICAgICBcInNlYXJjaC1hY3RpdmF0ZS1saXRlcmFsLW1vZGVcIjogPT4gQGFjdGl2YXRlTGl0ZXJhbE1vZGUoKVxuICAgICAgXCJzZWFyY2gtc2V0LWN1cnNvci13b3JkXCI6ID0+IEBzZXRDdXJzb3JXb3JkKClcbiAgICAgICdjb3JlOm1vdmUtdXAnOiA9PiBAZWRpdG9yLnNldFRleHQgQHZpbVN0YXRlLnNlYXJjaEhpc3RvcnkuZ2V0KCdwcmV2JylcbiAgICAgICdjb3JlOm1vdmUtZG93bic6ID0+IEBlZGl0b3Iuc2V0VGV4dCBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5nZXQoJ25leHQnKVxuICAgIClcblxubW9kdWxlLmV4cG9ydHMgPSByZWdpc3RlckVsZW1lbnQgJ3ZpbS1tb2RlLXBsdXMtc2VhcmNoLWlucHV0JyxcbiAgcHJvdG90eXBlOiBTZWFyY2hJbnB1dC5wcm90b3R5cGVcbiJdfQ==
