(function() {
  var VimNormalModeInputElement,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  VimNormalModeInputElement = (function(_super) {
    __extends(VimNormalModeInputElement, _super);

    function VimNormalModeInputElement() {
      return VimNormalModeInputElement.__super__.constructor.apply(this, arguments);
    }

    VimNormalModeInputElement.prototype.createdCallback = function() {
      return this.className = "normal-mode-input";
    };

    VimNormalModeInputElement.prototype.initialize = function(viewModel, mainEditorElement, opts) {
      var _ref;
      this.viewModel = viewModel;
      this.mainEditorElement = mainEditorElement;
      if (opts == null) {
        opts = {};
      }
      if (opts["class"] != null) {
        this.classList.add(opts["class"]);
      }
      this.editorElement = document.createElement("atom-text-editor");
      this.editorElement.classList.add('editor');
      this.editorElement.getModel().setMini(true);
      this.editorElement.setAttribute('mini', '');
      this.appendChild(this.editorElement);
      this.singleChar = opts.singleChar;
      this.defaultText = (_ref = opts.defaultText) != null ? _ref : '';
      if (opts.hidden) {
        this.classList.add('vim-hidden-normal-mode-input');
        this.mainEditorElement.parentNode.appendChild(this);
      } else {
        this.panel = atom.workspace.addBottomPanel({
          item: this,
          priority: 100
        });
      }
      this.focus();
      this.handleEvents();
      return this;
    };

    VimNormalModeInputElement.prototype.handleEvents = function() {
      var compositing;
      if (this.singleChar != null) {
        compositing = false;
        this.editorElement.getModel().getBuffer().onDidChange((function(_this) {
          return function(e) {
            if (e.newText && !compositing) {
              return _this.confirm();
            }
          };
        })(this));
        this.editorElement.addEventListener('compositionstart', function() {
          return compositing = true;
        });
        this.editorElement.addEventListener('compositionend', function() {
          return compositing = false;
        });
      } else {
        atom.commands.add(this.editorElement, 'editor:newline', this.confirm.bind(this));
      }
      atom.commands.add(this.editorElement, 'core:confirm', this.confirm.bind(this));
      atom.commands.add(this.editorElement, 'core:cancel', this.cancel.bind(this));
      return atom.commands.add(this.editorElement, 'blur', this.cancel.bind(this));
    };

    VimNormalModeInputElement.prototype.confirm = function() {
      this.value = this.editorElement.getModel().getText() || this.defaultText;
      this.viewModel.confirm(this);
      return this.removePanel();
    };

    VimNormalModeInputElement.prototype.focus = function() {
      return this.editorElement.focus();
    };

    VimNormalModeInputElement.prototype.cancel = function(e) {
      this.viewModel.cancel(this);
      return this.removePanel();
    };

    VimNormalModeInputElement.prototype.removePanel = function() {
      atom.workspace.getActivePane().activate();
      if (this.panel != null) {
        return this.panel.destroy();
      } else {
        return this.remove();
      }
    };

    return VimNormalModeInputElement;

  })(HTMLDivElement);

  module.exports = document.registerElement("vim-normal-mode-input", {
    "extends": "div",
    prototype: VimNormalModeInputElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3ZpZXctbW9kZWxzL3ZpbS1ub3JtYWwtbW9kZS1pbnB1dC1lbGVtZW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5QkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQU07QUFDSixnREFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsd0NBQUEsZUFBQSxHQUFpQixTQUFBLEdBQUE7YUFDZixJQUFDLENBQUEsU0FBRCxHQUFhLG9CQURFO0lBQUEsQ0FBakIsQ0FBQTs7QUFBQSx3Q0FHQSxVQUFBLEdBQVksU0FBRSxTQUFGLEVBQWMsaUJBQWQsRUFBaUMsSUFBakMsR0FBQTtBQUNWLFVBQUEsSUFBQTtBQUFBLE1BRFcsSUFBQyxDQUFBLFlBQUEsU0FDWixDQUFBO0FBQUEsTUFEdUIsSUFBQyxDQUFBLG9CQUFBLGlCQUN4QixDQUFBOztRQUQyQyxPQUFPO09BQ2xEO0FBQUEsTUFBQSxJQUFHLHFCQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxJQUFJLENBQUMsT0FBRCxDQUFuQixDQUFBLENBREY7T0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsa0JBQXZCLENBSGpCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQXpCLENBQTZCLFFBQTdCLENBSkEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxRQUFmLENBQUEsQ0FBeUIsQ0FBQyxPQUExQixDQUFrQyxJQUFsQyxDQUxBLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxhQUFhLENBQUMsWUFBZixDQUE0QixNQUE1QixFQUFvQyxFQUFwQyxDQU5B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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/view-models/vim-normal-mode-input-element.coffee
