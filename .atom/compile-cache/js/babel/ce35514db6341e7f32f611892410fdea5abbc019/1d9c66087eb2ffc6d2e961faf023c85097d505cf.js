Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getMessage = getMessage;
exports.getLinter = getLinter;
exports.dispatchCommand = dispatchCommand;

function getMessage(type, filePath, range) {
  if (type === undefined) type = 'Error';

  var message = {
    type: type,
    text: 'Some Message',
    filePath: filePath,
    range: range,
    version: 1
  };
  return message;
}

function getLinter() {
  var name = arguments.length <= 0 || arguments[0] === undefined ? 'some' : arguments[0];

  return {
    name: name,
    grammarScopes: [],
    lint: function lint() {}
  };
}

function dispatchCommand(target, commandName) {
  atom.commands.dispatch(atom.views.getView(target), commandName);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L3NwZWMvaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRU8sU0FBUyxVQUFVLENBQUMsSUFBYSxFQUFZLFFBQWlCLEVBQUUsS0FBYyxFQUFVO01BQXBFLElBQWEsZ0JBQWIsSUFBYSxHQUFHLE9BQU87O0FBQ2hELE1BQU0sT0FBTyxHQUFHO0FBQ2QsUUFBSSxFQUFKLElBQUk7QUFDSixRQUFJLEVBQUUsY0FBYztBQUNwQixZQUFRLEVBQVIsUUFBUTtBQUNSLFNBQUssRUFBTCxLQUFLO0FBQ0wsV0FBTyxFQUFFLENBQUM7R0FDWCxDQUFBO0FBQ0QsU0FBTyxPQUFPLENBQUE7Q0FDZjs7QUFFTSxTQUFTLFNBQVMsR0FBaUM7TUFBaEMsSUFBYSx5REFBRyxNQUFNOztBQUM5QyxTQUFPO0FBQ0wsUUFBSSxFQUFKLElBQUk7QUFDSixpQkFBYSxFQUFFLEVBQUU7QUFDakIsUUFBSSxFQUFBLGdCQUFHLEVBQUU7R0FDVixDQUFBO0NBQ0Y7O0FBRU0sU0FBUyxlQUFlLENBQUMsTUFBYyxFQUFFLFdBQW1CLEVBQUU7QUFDbkUsTUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUE7Q0FDaEUiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvc3BlYy9oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1lc3NhZ2UodHlwZTogP3N0cmluZyA9ICdFcnJvcicsIGZpbGVQYXRoOiA/c3RyaW5nLCByYW5nZTogP09iamVjdCk6IE9iamVjdCB7XG4gIGNvbnN0IG1lc3NhZ2UgPSB7XG4gICAgdHlwZSxcbiAgICB0ZXh0OiAnU29tZSBNZXNzYWdlJyxcbiAgICBmaWxlUGF0aCxcbiAgICByYW5nZSxcbiAgICB2ZXJzaW9uOiAxLFxuICB9XG4gIHJldHVybiBtZXNzYWdlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMaW50ZXIobmFtZTogP3N0cmluZyA9ICdzb21lJyk6IE9iamVjdCB7XG4gIHJldHVybiB7XG4gICAgbmFtZSxcbiAgICBncmFtbWFyU2NvcGVzOiBbXSxcbiAgICBsaW50KCkge30sXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoQ29tbWFuZCh0YXJnZXQ6IE9iamVjdCwgY29tbWFuZE5hbWU6IHN0cmluZykge1xuICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0Vmlldyh0YXJnZXQpLCBjb21tYW5kTmFtZSlcbn1cbiJdfQ==