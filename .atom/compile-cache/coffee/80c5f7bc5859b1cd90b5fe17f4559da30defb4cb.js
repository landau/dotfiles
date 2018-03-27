(function() {
  var Input, ViewModel, VimNormalModeInputElement;

  VimNormalModeInputElement = require('./vim-normal-mode-input-element');

  ViewModel = (function() {
    function ViewModel(operation, opts) {
      var _ref;
      this.operation = operation;
      if (opts == null) {
        opts = {};
      }
      _ref = this.operation, this.editor = _ref.editor, this.vimState = _ref.vimState;
      this.view = new VimNormalModeInputElement().initialize(this, atom.views.getView(this.editor), opts);
      this.editor.normalModeInputView = this.view;
      this.vimState.onDidFailToCompose((function(_this) {
        return function() {
          return _this.view.remove();
        };
      })(this));
    }

    ViewModel.prototype.confirm = function(view) {
      return this.vimState.pushOperations(new Input(this.view.value));
    };

    ViewModel.prototype.cancel = function(view) {
      if (this.vimState.isOperatorPending()) {
        this.vimState.pushOperations(new Input(''));
      }
      return delete this.editor.normalModeInputView;
    };

    return ViewModel;

  })();

  Input = (function() {
    function Input(characters) {
      this.characters = characters;
    }

    Input.prototype.isComplete = function() {
      return true;
    };

    Input.prototype.isRecordable = function() {
      return true;
    };

    return Input;

  })();

  module.exports = {
    ViewModel: ViewModel,
    Input: Input
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3ZpZXctbW9kZWxzL3ZpZXctbW9kZWwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJDQUFBOztBQUFBLEVBQUEseUJBQUEsR0FBNEIsT0FBQSxDQUFRLGlDQUFSLENBQTVCLENBQUE7O0FBQUEsRUFFTTtBQUNTLElBQUEsbUJBQUUsU0FBRixFQUFhLElBQWIsR0FBQTtBQUNYLFVBQUEsSUFBQTtBQUFBLE1BRFksSUFBQyxDQUFBLFlBQUEsU0FDYixDQUFBOztRQUR3QixPQUFLO09BQzdCO0FBQUEsTUFBQSxPQUF1QixJQUFDLENBQUEsU0FBeEIsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLGdCQUFBLFFBQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLHlCQUFBLENBQUEsQ0FBMkIsQ0FBQyxVQUE1QixDQUF1QyxJQUF2QyxFQUE2QyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBQyxDQUFBLE1BQXBCLENBQTdDLEVBQTBFLElBQTFFLENBRFosQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBUixHQUE4QixJQUFDLENBQUEsSUFGL0IsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxrQkFBVixDQUE2QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QixDQUhBLENBRFc7SUFBQSxDQUFiOztBQUFBLHdCQU1BLE9BQUEsR0FBUyxTQUFDLElBQUQsR0FBQTthQUNQLElBQUMsQ0FBQSxRQUFRLENBQUMsY0FBVixDQUE2QixJQUFBLEtBQUEsQ0FBTSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQVosQ0FBN0IsRUFETztJQUFBLENBTlQsQ0FBQTs7QUFBQSx3QkFTQSxNQUFBLEdBQVEsU0FBQyxJQUFELEdBQUE7QUFDTixNQUFBLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxpQkFBVixDQUFBLENBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsY0FBVixDQUE2QixJQUFBLEtBQUEsQ0FBTSxFQUFOLENBQTdCLENBQUEsQ0FERjtPQUFBO2FBRUEsTUFBQSxDQUFBLElBQVEsQ0FBQSxNQUFNLENBQUMsb0JBSFQ7SUFBQSxDQVRSLENBQUE7O3FCQUFBOztNQUhGLENBQUE7O0FBQUEsRUFpQk07QUFDUyxJQUFBLGVBQUUsVUFBRixHQUFBO0FBQWUsTUFBZCxJQUFDLENBQUEsYUFBQSxVQUFhLENBQWY7SUFBQSxDQUFiOztBQUFBLG9CQUNBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFBRyxLQUFIO0lBQUEsQ0FEWixDQUFBOztBQUFBLG9CQUVBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFBRyxLQUFIO0lBQUEsQ0FGZCxDQUFBOztpQkFBQTs7TUFsQkYsQ0FBQTs7QUFBQSxFQXNCQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBQ2YsV0FBQSxTQURlO0FBQUEsSUFDSixPQUFBLEtBREk7R0F0QmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/view-models/view-model.coffee
