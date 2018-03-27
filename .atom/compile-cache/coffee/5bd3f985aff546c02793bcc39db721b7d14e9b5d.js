(function() {
  var IncreaseOperators, IndentOperators, InputOperators, Operators, Put, Replace, _;

  _ = require('underscore-plus');

  IndentOperators = require('./indent-operators');

  IncreaseOperators = require('./increase-operators');

  Put = require('./put-operator');

  InputOperators = require('./input');

  Replace = require('./replace-operator');

  Operators = require('./general-operators');

  Operators.Put = Put;

  Operators.Replace = Replace;

  _.extend(Operators, IndentOperators);

  _.extend(Operators, IncreaseOperators);

  _.extend(Operators, InputOperators);

  module.exports = Operators;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL29wZXJhdG9ycy9pbmRleC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOEVBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSLENBRGxCLENBQUE7O0FBQUEsRUFFQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsc0JBQVIsQ0FGcEIsQ0FBQTs7QUFBQSxFQUdBLEdBQUEsR0FBTSxPQUFBLENBQVEsZ0JBQVIsQ0FITixDQUFBOztBQUFBLEVBSUEsY0FBQSxHQUFpQixPQUFBLENBQVEsU0FBUixDQUpqQixDQUFBOztBQUFBLEVBS0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxvQkFBUixDQUxWLENBQUE7O0FBQUEsRUFNQSxTQUFBLEdBQVksT0FBQSxDQUFRLHFCQUFSLENBTlosQ0FBQTs7QUFBQSxFQVFBLFNBQVMsQ0FBQyxHQUFWLEdBQWdCLEdBUmhCLENBQUE7O0FBQUEsRUFTQSxTQUFTLENBQUMsT0FBVixHQUFvQixPQVRwQixDQUFBOztBQUFBLEVBVUEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxTQUFULEVBQW9CLGVBQXBCLENBVkEsQ0FBQTs7QUFBQSxFQVdBLENBQUMsQ0FBQyxNQUFGLENBQVMsU0FBVCxFQUFvQixpQkFBcEIsQ0FYQSxDQUFBOztBQUFBLEVBWUEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxTQUFULEVBQW9CLGNBQXBCLENBWkEsQ0FBQTs7QUFBQSxFQWFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBYmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/operators/index.coffee
